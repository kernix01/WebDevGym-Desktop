# WebDevGym Supabase setup

1. Open the Supabase SQL Editor.
2. Run `migrations/20261027_cloud_sync.sql` once.
3. Run `migrations/20261111_cloud_backups.sql` once for manual cloud backups (up to 20 snapshots per account).
4. In Authentication > URL Configuration set the Site URL to the main production domain.
5. Add these redirect URLs:
   - `https://webdevgym.vercel.app/**`
   - `https://webdevgym-en.vercel.app/**`
   - `webdevgym://app/auth/callback`

Only the publishable browser key is stored in the web client. Never add a secret or service-role key to this repository.
