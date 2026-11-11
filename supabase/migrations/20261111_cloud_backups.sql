create table if not exists public.user_state_backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'manual' check (char_length(label) between 1 and 40),
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'array'
    and octet_length(snapshot::text) <= 5242880
  ),
  created_at timestamptz not null default now()
);

create index if not exists user_state_backups_user_created_idx
  on public.user_state_backups (user_id, created_at desc);

alter table public.user_state_backups enable row level security;
revoke all on table public.user_state_backups from anon;
grant select, insert, delete on table public.user_state_backups to authenticated;

drop policy if exists "Users can read their own backups" on public.user_state_backups;
create policy "Users can read their own backups"
  on public.user_state_backups for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own backups" on public.user_state_backups;
create policy "Users can create their own backups"
  on public.user_state_backups for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own backups" on public.user_state_backups;
create policy "Users can delete their own backups"
  on public.user_state_backups for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.create_user_state_backup(p_label text default 'manual')
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  backup_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.user_state_backups (user_id, label, snapshot)
  values (
    current_user_id,
    left(coalesce(nullif(trim(p_label), ''), 'manual'), 40),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'key', entry.key,
        'value', entry.value,
        'updatedAt', entry.updated_at,
        'deleted', entry.deleted
      ) order by entry.key)
      from public.user_state_entries as entry
      where entry.user_id = current_user_id
    ), '[]'::jsonb)
  )
  returning id into backup_id;

  delete from public.user_state_backups
  where user_id = current_user_id
    and id not in (
      select id from public.user_state_backups
      where user_id = current_user_id
      order by created_at desc
      limit 20
    );

  return backup_id;
end;
$$;

revoke all on function public.create_user_state_backup(text) from public;
grant execute on function public.create_user_state_backup(text) to authenticated;
