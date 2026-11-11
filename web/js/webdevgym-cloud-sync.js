(function (global) {
  'use strict';

  const config = global.WebDevGymSupabaseConfig;
  const sdk = global.supabase;
  if (!config?.url || !config?.publishableKey || !sdk?.createClient) return;
  const desktopApi = global.webdevgymDesktop?.desktop || null;
  const isDesktop = Boolean(global.webdevgymDesktop?.isDesktop && desktopApi);

  const CLIENT_KEY = 'wdg_cloud_sync_client_v1';
  const META_PREFIX = 'wdg_cloud_sync_meta_v1:';
  const ONBOARDING_KEY = 'wdg_cloud_onboarding_v1';
  const LEARNING_PRIORITY_KEY = 'wdgn_learning_priority_v1';
  const LOCAL_SYNC_DELAY = 180;
  const MAX_VALUE_LENGTH = 1024 * 1024;
  const isEnglish = document.documentElement.lang === 'en' || /index-en\.html$/i.test(location.pathname);

  const copy = isEnglish ? {
    title: 'Cloud sync',
    subtitle: 'Use one account for progress, notes and settings in RU and EN.',
    signedOut: 'Sign in to sync your data',
    signedOutHint: 'Your local data stays on this device until you sign in.',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'At least 6 characters',
    signIn: 'Sign in',
    signUp: 'Create account',
    onboardingTitle: 'Keep your progress safe',
    onboardingSubtitle: 'Create an account now or continue locally and connect it later.',
    onboardingIntro: 'One account keeps your learning progress, notes and settings available across devices and in both RU and EN.',
    benefitDevices: 'Continue on another computer or phone',
    benefitRecovery: 'Restore progress after clearing browser data',
    benefitLanguages: 'Use the same account in RU and EN',
    continueWith: 'Continue with',
    orEmail: 'or use email',
    github: 'GitHub',
    google: 'Google',
    later: 'Continue without an account',
    laterHint: 'Everything will stay in this browser. You can connect an account later from the cloud button.',
    signedIn: 'Cloud sync is active',
    syncing: 'Syncing...',
    synced: 'Synced',
    lastSync: 'Last sync',
    never: 'Not yet',
    now: 'just now',
    syncNow: 'Sync now',
    backups: 'Cloud backups',
    createBackup: 'Create backup',
    restoreBackup: 'Restore',
    deleteBackup: 'Delete backup',
    noBackups: 'No cloud backups yet',
    backupConfirm: 'Restore this cloud backup? Current synced data will be replaced.',
    backupDeleteConfirm: 'Delete this cloud backup? This cannot be undone.',
    backupError: 'Could not load or save cloud backups.',
    signOut: 'Sign out',
    confirmEmail: 'Check your email and confirm the account, then sign in.',
    authError: 'Could not complete authentication.',
    syncError: 'Could not sync data. Make sure the Supabase migration has been applied.',
    unavailable: 'Cloud sync is temporarily unavailable.',
    protected: 'Passwords, tokens, API keys, AI history, backgrounds and Playground projects are never uploaded.',
    close: 'Close'
  } : {
    title: 'Облачная синхронизация',
    subtitle: 'Один аккаунт для прогресса, заметок и настроек в RU и EN.',
    signedOut: 'Войди, чтобы синхронизировать данные',
    signedOutHint: 'До входа локальные данные остаются только на этом устройстве.',
    email: 'Email',
    password: 'Пароль',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Минимум 6 символов',
    signIn: 'Войти',
    signUp: 'Создать аккаунт',
    onboardingTitle: 'Не потеряй свой прогресс',
    onboardingSubtitle: 'Создай аккаунт сейчас или продолжи локально и подключи его позже.',
    onboardingIntro: 'Один аккаунт сохранит прогресс обучения, заметки и настройки на разных устройствах и в версиях RU и EN.',
    benefitDevices: 'Продолжай на другом компьютере или телефоне',
    benefitRecovery: 'Восстанови прогресс после очистки браузера',
    benefitLanguages: 'Используй один аккаунт в RU и EN',
    continueWith: 'Продолжить через',
    orEmail: 'или используй email',
    github: 'GitHub',
    google: 'Google',
    later: 'Продолжить без аккаунта',
    laterHint: 'Всё останется в этом браузере. Аккаунт можно подключить позже через кнопку облака.',
    signedIn: 'Облачная синхронизация активна',
    syncing: 'Синхронизация...',
    synced: 'Синхронизировано',
    lastSync: 'Последняя синхронизация',
    never: 'Ещё не было',
    now: 'только что',
    syncNow: 'Синхронизировать',
    backups: 'Облачные копии',
    createBackup: 'Создать копию',
    restoreBackup: 'Восстановить',
    deleteBackup: 'Удалить копию',
    noBackups: 'Облачных копий пока нет',
    backupConfirm: 'Восстановить эту облачную копию? Текущие синхронизируемые данные будут заменены.',
    backupDeleteConfirm: 'Удалить эту облачную копию? Это действие нельзя отменить.',
    backupError: 'Не удалось загрузить или сохранить облачные копии.',
    signOut: 'Выйти',
    confirmEmail: 'Подтверди аккаунт по ссылке из письма, затем войди.',
    authError: 'Не удалось выполнить вход.',
    syncError: 'Не удалось синхронизировать данные. Проверь, что миграция Supabase применена.',
    unavailable: 'Облачная синхронизация временно недоступна.',
    protected: 'Пароли, токены, API-ключи, история ИИ, фоны и проекты Playground никогда не загружаются.',
    close: 'Закрыть'
  };

  const client = sdk.createClient(config.url, config.publishableKey, {
    auth: {
      storageKey: 'wdg_supabase_auth_v1',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: !isDesktop,
      flowType: 'pkce'
    }
  });

  const state = {
    started: false,
    session: null,
    syncing: false,
    modalOpen: false,
    onboarding: false,
    lastSyncAt: 0,
    error: '',
    notice: '',
    applyingRemote: false,
    pendingSync: false,
    channel: null,
    backups: [],
    backupsLoading: false,
    backupError: ''
  };

  let localSyncTimer = 0;
  let onboardingTimer = 0;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function readClientId() {
    try {
      const saved = localStorage.getItem(CLIENT_KEY);
      if (saved) return saved;
      const id = crypto.randomUUID?.() || `cloud-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(CLIENT_KEY, id);
      return id;
    } catch {
      return `cloud-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  const clientId = readClientId();

  function metadataKey() {
    return `${META_PREFIX}${state.session?.user?.id || 'anonymous'}`;
  }

  function isSyncableKey(key, value) {
    const lower = String(key || '').toLowerCase();
    if (!lower || lower.includes('cloud_sync') || lower.includes('device_sync')) return false;
    const blocked = [
      'token', 'secret', 'password', 'credential', 'api_key', 'apikey',
      'github', 'gh-', 'ai_custom_models', 'ai_active_custom_model',
      'ai_chat_history', 'ai_threads', 'ai_active_thread', 'custombg', 'wdga_projects',
      'iconify', 'wdgr_ai_window', 'wdgu_timer_window', 'supabase_auth', 'main_lang'
    ];
    if (blocked.some(part => lower.includes(part))) return false;
    if (lower.includes('sound') && String(value || '').startsWith('custom:')) return false;
    return String(value ?? '').length <= MAX_VALUE_LENGTH;
  }

  function valueHash(value) {
    const text = String(value ?? '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${text.length}:${(hash >>> 0).toString(36)}`;
  }

  function currentValues() {
    const values = new Map();
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        const value = key == null ? null : localStorage.getItem(key);
        if (key != null && value != null && isSyncableKey(key, value)) values.set(key, value);
      }
    } catch {}
    return values;
  }

  function collectChanges() {
    const metadata = readJson(metadataKey(), {});
    const values = currentValues();
    const entries = [];
    const now = Date.now();

    for (const key of Object.keys(metadata)) {
      if (!isSyncableKey(key, '')) delete metadata[key];
    }

    for (const [key, value] of values) {
      const hash = valueHash(value);
      const saved = metadata[key];
      if (!saved) {
        metadata[key] = { hash, updatedAt: 0, deleted: false };
        entries.push({ key, value, updatedAt: 0, deleted: false });
      } else if (saved.hash !== hash || saved.deleted) {
        metadata[key] = { hash, updatedAt: now, deleted: false };
        entries.push({ key, value, updatedAt: now, deleted: false });
      }
    }

    for (const [key, saved] of Object.entries(metadata)) {
      if (!isSyncableKey(key, '') || values.has(key) || saved.deleted) continue;
      metadata[key] = { hash: '', updatedAt: now, deleted: true };
      entries.push({ key, value: null, updatedAt: now, deleted: true });
    }

    writeJson(metadataKey(), metadata);
    return entries;
  }

  function applyRemoteEntries(entries) {
    const metadata = readJson(metadataKey(), {});
    const changedKeys = [];

    for (const entry of Array.isArray(entries) ? entries : []) {
      const key = String(entry.key || '');
      const remoteValue = entry.deleted ? null : String(entry.value ?? '');
      if (!isSyncableKey(key, remoteValue) || entry.updated_at == null) continue;

      const local = metadata[key];
      const localTime = Number(local?.updatedAt) || 0;
      const remoteTime = Number(entry.updated_at) || 0;
      const current = localStorage.getItem(key);
      const differs = current !== remoteValue;
      if (remoteTime < localTime || (!differs && local?.deleted === Boolean(entry.deleted))) continue;

      state.applyingRemote = true;
      try {
        if (entry.deleted) localStorage.removeItem(key);
        else localStorage.setItem(key, remoteValue);
      } finally {
        state.applyingRemote = false;
      }

      metadata[key] = {
        hash: entry.deleted ? '' : valueHash(remoteValue),
        updatedAt: remoteTime,
        deleted: Boolean(entry.deleted)
      };

      if (differs) {
        changedKeys.push(key);
        try {
          global.dispatchEvent(new StorageEvent('storage', {
            key,
            oldValue: current,
            newValue: remoteValue,
            storageArea: localStorage,
            url: location.href
          }));
        } catch {}
      }
    }

    writeJson(metadataKey(), metadata);
    if (changedKeys.length) {
      global.dispatchEvent(new CustomEvent('webdevgym:sync-applied', { detail: { keys: changedKeys, source: 'supabase' } }));
    }
  }

  async function sync() {
    if (!state.session) return;
    if (state.syncing) {
      state.pendingSync = true;
      return;
    }

    state.syncing = true;
    state.error = '';
    attach();
    render();

    try {
      const { data, error } = await client.rpc('sync_user_state', {
        p_entries: collectChanges(),
        p_client_id: clientId
      });
      if (error) throw error;
      applyRemoteEntries(data);
      state.lastSyncAt = Date.now();
    } catch (error) {
      console.error('[WebDevGym Cloud Sync]', error);
      state.error = copy.syncError;
    } finally {
      state.syncing = false;
      attach();
      render();
      if (state.pendingSync) {
        state.pendingSync = false;
        queueMicrotask(() => void sync());
      }
    }
  }

  async function loadBackups() {
    if (!state.session) return;
    state.backupsLoading = true;
    try {
      const { data, error } = await client
        .from('user_state_backups')
        .select('id,label,created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      state.backups = data || [];
      state.backupError = '';
    } catch (error) {
      console.error('[WebDevGym Cloud Backups]', error);
      state.backupError = copy.backupError;
    } finally {
      state.backupsLoading = false;
      render();
    }
  }

  async function createBackup(label = 'manual') {
    if (!state.session || state.backupsLoading) return;
    state.backupsLoading = true;
    state.backupError = '';
    render();
    try {
      await sync();
      const { error } = await client.rpc('create_user_state_backup', { p_label: label });
      if (error) throw error;
      await loadBackups();
    } catch (error) {
      console.error('[WebDevGym Cloud Backups]', error);
      state.backupError = copy.backupError;
    } finally {
      state.backupsLoading = false;
      render();
    }
  }

  async function restoreBackup(id) {
    if (!state.session || !id || !global.confirm(copy.backupConfirm)) return;
    state.backupsLoading = true;
    state.backupError = '';
    render();
    try {
      const { data, error } = await client
        .from('user_state_backups')
        .select('snapshot')
        .eq('id', id)
        .single();
      if (error) throw error;
      const entries = (Array.isArray(data?.snapshot) ? data.snapshot : []).map(entry => ({
        key: entry.key,
        value: entry.value,
        deleted: Boolean(entry.deleted),
        updatedAt: Date.now()
      }));
      const { data: synced, error: syncError } = await client.rpc('sync_user_state', {
        p_entries: entries,
        p_client_id: clientId
      });
      if (syncError) throw syncError;
      applyRemoteEntries(synced);
      await sync();
      await loadBackups();
    } catch (error) {
      console.error('[WebDevGym Cloud Backups]', error);
      state.backupError = copy.backupError;
    } finally {
      state.backupsLoading = false;
      render();
    }
  }

  async function deleteBackup(id) {
    if (!state.session || !id || state.backupsLoading || !global.confirm(copy.backupDeleteConfirm)) return;
    state.backupsLoading = true;
    state.backupError = '';
    render();
    try {
      const { error } = await client
        .from('user_state_backups')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadBackups();
    } catch (error) {
      console.error('[WebDevGym Cloud Backups]', error);
      state.backupError = copy.backupError;
    } finally {
      state.backupsLoading = false;
      render();
    }
  }

  function scheduleSync() {
    if (!state.session || state.applyingRemote) return;
    global.clearTimeout(localSyncTimer);
    localSyncTimer = global.setTimeout(() => void sync(), LOCAL_SYNC_DELAY);
  }

  function observeLocalStorageWrites() {
    const prototype = global.Storage?.prototype;
    if (!prototype || prototype.__webdevgymCloudSyncObserved) return;
    const setItem = prototype.setItem;
    const removeItem = prototype.removeItem;
    const clear = prototype.clear;
    Object.defineProperty(prototype, '__webdevgymCloudSyncObserved', { value: true });

    prototype.setItem = function (key, value) {
      const result = setItem.call(this, key, value);
      if (this === global.localStorage && isSyncableKey(key, value)) scheduleSync();
      return result;
    };
    prototype.removeItem = function (key) {
      const previous = this === global.localStorage ? this.getItem(key) : null;
      const result = removeItem.call(this, key);
      if (this === global.localStorage && isSyncableKey(key, previous)) scheduleSync();
      return result;
    };
    prototype.clear = function () {
      const result = clear.call(this);
      if (this === global.localStorage) scheduleSync();
      return result;
    };
  }

  function formatTime(value) {
    if (!value) return copy.never;
    if (Date.now() - value < 60000) return copy.now;
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function icon(name, size = 18) {
    const paths = {
      cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/><path d="m12 12-2 2 2 2M10 14h6"/>',
      close: '<path d="M18 6 6 18M6 6l12 12"/>',
      shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>',
      refresh: '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9M5.5 15A7 7 0 0 0 18 17.5l2-2.5"/>',
      device: '<rect width="14" height="10" x="3" y="3" rx="2"/><path d="M7 21h10M12 13v8M17 17h4v-7h-4"/>',
      restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
      trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      languages: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
      github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15 1.8a13.4 13.4 0 0 0-7 0C4.8.1 3.7.5 3.7.5A5 5 0 0 0 3.6 4a5.4 5.4 0 0 0-1.4 3.5c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4"/><path d="M8 19c-3 .9-3-1.5-4-2"/>',
      google: '<path d="M21.4 12.2c0-.7-.1-1.4-.2-2.2H12v4h5.3a4.5 4.5 0 0 1-2 2.9v2.6h3.3c1.9-1.8 2.8-4.4 2.8-7.3Z"/><path d="M12 22c2.7 0 5-.9 6.6-2.5l-3.3-2.6c-.9.6-2 1-3.3 1-2.6 0-4.8-1.8-5.6-4.2H3v2.7A10 10 0 0 0 12 22Z"/><path d="M6.4 13.7A6 6 0 0 1 6.1 12c0-.6.1-1.2.3-1.7V7.6H3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.4l3.4-2.7Z"/><path d="M12 6.1c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10 10 0 0 0-9 5.6l3.4 2.7C7.2 7.9 9.4 6.1 12 6.1Z"/>'
    };
    return `<svg class="wdg-device-sync-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.cloud}</svg>`;
  }

  function ensureUi() {
    if (document.getElementById('wdgCloudSyncModal')) return;
    const modal = document.createElement('div');
    modal.id = 'wdgCloudSyncModal';
    modal.className = 'wdg-device-sync-modal wdg-cloud-sync-modal';
    modal.innerHTML = `
      <button type="button" class="wdg-device-sync-backdrop" data-cloud-close aria-label="${copy.close}"></button>
      <section class="wdg-device-sync-dialog" role="dialog" aria-modal="true" aria-labelledby="wdgCloudSyncTitle">
        <header>
          <div class="wdg-device-sync-mark">${icon('cloud', 22)}</div>
          <div><h2 id="wdgCloudSyncTitle" data-cloud-title>${copy.title}</h2><p data-cloud-subtitle>${copy.subtitle}</p></div>
          <button type="button" class="wdg-device-sync-close" data-cloud-close title="${copy.close}">${icon('close')}</button>
        </header>
        <div class="wdg-device-sync-content" data-cloud-content></div>
      </section>`;
    modal.addEventListener('click', event => {
      if (event.target.closest('[data-cloud-close]')) close();
    });
    document.body.appendChild(modal);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.modalOpen) close();
    });
  }

  function render() {
    const content = document.querySelector('[data-cloud-content]');
    if (!content) return;
    const title = document.querySelector('[data-cloud-title]');
    const subtitle = document.querySelector('[data-cloud-subtitle]');
    if (title) title.textContent = state.onboarding ? copy.onboardingTitle : copy.title;
    if (subtitle) subtitle.textContent = state.onboarding ? copy.onboardingSubtitle : copy.subtitle;

    if (!state.session) {
      content.innerHTML = `
        ${state.onboarding ? `
          <div class="wdg-cloud-onboarding-intro">
            <p>${copy.onboardingIntro}</p>
            <ul>
              <li>${icon('device', 16)}<span>${copy.benefitDevices}</span></li>
              <li>${icon('restore', 16)}<span>${copy.benefitRecovery}</span></li>
              <li>${icon('languages', 16)}<span>${copy.benefitLanguages}</span></li>
            </ul>
          </div>` : `
          <div class="wdg-device-sync-status offline"><i></i><strong>${copy.signedOut}</strong><span>Supabase</span></div>
          <p class="wdg-cloud-sync-hint">${copy.signedOutHint}</p>`}
        <div class="wdg-cloud-provider-grid" aria-label="${copy.continueWith}">
          <button type="button" class="wdg-cloud-provider github" data-cloud-provider="github">${icon('github', 18)}<span>${copy.continueWith} ${copy.github}</span></button>
          <button type="button" class="wdg-cloud-provider google" data-cloud-provider="google">${icon('google', 18)}<span>${copy.continueWith} ${copy.google}</span></button>
        </div>
        <div class="wdg-cloud-auth-divider"><span>${copy.orEmail}</span></div>
        <form class="wdg-cloud-auth-form" data-cloud-auth-form>
          <label>${copy.email}<input type="email" name="email" autocomplete="email" placeholder="${copy.emailPlaceholder}" required></label>
          <label>${copy.password}<input type="password" name="password" autocomplete="current-password" minlength="6" placeholder="${copy.passwordPlaceholder}" required></label>
          <div class="wdg-cloud-auth-actions">
            <button type="submit" class="primary">${copy.signIn}</button>
            <button type="button" class="secondary" data-cloud-sign-up>${copy.signUp}</button>
          </div>
        </form>
        ${state.notice ? `<p class="wdg-cloud-sync-notice">${escapeHtml(state.notice)}</p>` : ''}
        ${state.error ? `<p class="wdg-device-sync-error">${escapeHtml(state.error)}</p>` : ''}
        ${state.onboarding ? `<button type="button" class="wdg-cloud-later" data-cloud-later>${copy.later}</button><p class="wdg-cloud-later-hint">${copy.laterHint}</p>` : ''}
        <p class="wdg-device-sync-protected">${icon('shield', 16)}${copy.protected}</p>`;

      const form = content.querySelector('[data-cloud-auth-form]');
      form?.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(form);
        await authenticate('signIn', String(formData.get('email') || ''), String(formData.get('password') || ''));
      });
      content.querySelector('[data-cloud-sign-up]')?.addEventListener('click', async () => {
        if (!form.reportValidity()) return;
        const formData = new FormData(form);
        await authenticate('signUp', String(formData.get('email') || ''), String(formData.get('password') || ''));
      });
      content.querySelectorAll('[data-cloud-provider]').forEach(button => {
        button.addEventListener('click', () => void authenticateWithProvider(button.dataset.cloudProvider));
      });
      content.querySelector('[data-cloud-later]')?.addEventListener('click', dismissOnboarding);
      return;
    }

    const email = escapeHtml(state.session.user.email || '');
    content.innerHTML = `
      <div class="wdg-device-sync-status online"><i></i><strong>${state.syncing ? copy.syncing : copy.signedIn}</strong><span>Supabase</span></div>
      <div class="wdg-cloud-account-card">
        <span>${email}</span>
        <strong>${state.syncing ? copy.syncing : copy.synced}</strong>
        <small>${copy.lastSync}: ${formatTime(state.lastSyncAt)}</small>
      </div>
      ${state.error ? `<p class="wdg-device-sync-error">${escapeHtml(state.error)}</p>` : ''}
      <div class="wdg-device-sync-actions">
        <button type="button" class="secondary" data-cloud-sync ${state.syncing ? 'disabled' : ''}>${icon('refresh', 16)}${copy.syncNow}</button>
        <button type="button" class="danger" data-cloud-sign-out>${copy.signOut}</button>
      </div>
      <section class="wdg-cloud-backups" aria-label="${copy.backups}">
        <div class="wdg-cloud-backups-heading"><strong>${copy.backups}</strong><button type="button" class="wdg-cloud-backup-create" data-cloud-backup-create ${state.backupsLoading ? 'disabled' : ''}>${icon('plus', 15)}<span>${copy.createBackup}</span></button></div>
        ${state.backupError ? `<p class="wdg-device-sync-error">${escapeHtml(state.backupError)}</p>` : ''}
        ${state.backupsLoading && !state.backups.length ? `<p>${copy.syncing}</p>` : ''}
        ${!state.backupsLoading && !state.backups.length ? `<p>${copy.noBackups}</p>` : ''}
        ${state.backups.map(backup => `<div class="wdg-cloud-backup-row"><span><strong>${escapeHtml(backup.label || copy.createBackup)}</strong><small>${escapeHtml(new Date(backup.created_at).toLocaleString())}</small></span><div class="wdg-cloud-backup-actions"><button type="button" class="wdg-cloud-backup-restore" data-cloud-backup-restore="${escapeHtml(backup.id)}" ${state.backupsLoading ? 'disabled' : ''}>${icon('restore', 15)}<span>${copy.restoreBackup}</span></button><button type="button" class="wdg-cloud-backup-delete" data-cloud-backup-delete="${escapeHtml(backup.id)}" aria-label="${copy.deleteBackup}" title="${copy.deleteBackup}" ${state.backupsLoading ? 'disabled' : ''}>${icon('trash', 15)}</button></div></div>`).join('')}
      </section>
      <p class="wdg-device-sync-protected">${icon('shield', 16)}${copy.protected}</p>`;
    content.querySelector('[data-cloud-sync]')?.addEventListener('click', () => void sync());
    content.querySelector('[data-cloud-backup-create]')?.addEventListener('click', () => void createBackup());
    content.querySelectorAll('[data-cloud-backup-restore]').forEach(button => {
      button.addEventListener('click', () => void restoreBackup(button.dataset.cloudBackupRestore));
    });
    content.querySelectorAll('[data-cloud-backup-delete]').forEach(button => {
      button.addEventListener('click', () => void deleteBackup(button.dataset.cloudBackupDelete));
    });
    content.querySelector('[data-cloud-sign-out]')?.addEventListener('click', () => void client.auth.signOut());
  }

  async function authenticate(mode, email, password) {
    state.error = '';
    state.notice = '';
    if (!email || password.length < 6) {
      state.error = copy.authError;
      render();
      return;
    }

    let result;
    try {
      result = mode === 'signUp'
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: isDesktop ? 'webdevgym://app/auth/callback' : location.origin } })
        : await client.auth.signInWithPassword({ email, password });
    } catch {
      state.error = copy.unavailable;
      render();
      return;
    }

    if (result.error) state.error = result.error.message || copy.authError;
    else if (mode === 'signUp' && !result.data.session) state.notice = copy.confirmEmail;
    render();
  }

  async function authenticateWithProvider(provider) {
    if (!['github', 'google'].includes(provider)) return;
    state.error = '';
    state.notice = '';
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: isDesktop ? 'webdevgym://app/auth/callback' : location.origin,
          skipBrowserRedirect: isDesktop
        }
      });
      if (error) throw error;
      if (isDesktop && data?.url) await desktopApi.openExternal(data.url);
      localStorage.setItem(ONBOARDING_KEY, 'account');
    } catch (error) {
      state.error = error?.message || copy.authError;
      render();
    }
  }

  async function handleDesktopAuthCallback(callbackUrl) {
    if (!isDesktop || !callbackUrl) return;
    try {
      const callback = new URL(callbackUrl);
      const code = callback.searchParams.get('code');
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else {
        const params = new URLSearchParams(callback.hash.slice(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (!accessToken || !refreshToken) throw new Error('OAuth callback did not include a session');
        const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) throw error;
      }
    } catch (error) {
      console.error('[WebDevGym Auth Callback]', error);
      state.error = copy.authError;
      render();
    }
  }

  function dismissOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, 'later');
    state.onboarding = false;
    close();
  }

  function scheduleOnboarding() {
    global.clearTimeout(onboardingTimer);
    const tryOpen = () => {
      if (state.session || localStorage.getItem(ONBOARDING_KEY)) return;
      if (!localStorage.getItem(LEARNING_PRIORITY_KEY) || document.querySelector('.wdgn-priority-picker')) {
        onboardingTimer = global.setTimeout(tryOpen, 250);
        return;
      }
      openOnboarding();
    };
    onboardingTimer = global.setTimeout(tryOpen, 650);
  }

  function attach() {
    const buttons = [document.getElementById('wdgDeviceSyncButton'), document.getElementById('wdgDeviceSyncMobileButton')].filter(Boolean);
    const status = state.session ? (state.syncing ? 'ready' : 'paired') : 'offline';
    buttons.forEach(button => {
      button.dataset.syncStatus = status;
      button.title = `${copy.title}: ${state.session ? (state.syncing ? copy.syncing : copy.signedIn) : copy.signedOut}`;
      button.setAttribute('aria-label', button.title);
    });
  }

  function open() {
    ensureUi();
    state.onboarding = false;
    state.modalOpen = true;
    document.getElementById('wdgCloudSyncModal')?.classList.add('open');
    document.body.classList.add('wdg-device-sync-open');
    render();
    if (state.session) {
      void sync();
      void loadBackups();
    }
  }

  function openOnboarding() {
    ensureUi();
    state.onboarding = true;
    state.modalOpen = true;
    document.getElementById('wdgCloudSyncModal')?.classList.add('open');
    document.body.classList.add('wdg-device-sync-open');
    render();
  }

  function close() {
    if (state.onboarding && !state.session) localStorage.setItem(ONBOARDING_KEY, 'later');
    state.onboarding = false;
    state.modalOpen = false;
    document.getElementById('wdgCloudSyncModal')?.classList.remove('open');
    document.body.classList.remove('wdg-device-sync-open');
  }

  async function subscribeToChanges() {
    if (state.channel) {
      await client.removeChannel(state.channel);
      state.channel = null;
    }
    const userId = state.session?.user?.id;
    if (!userId) return;

    state.channel = client
      .channel(`wdg-user-state-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_state_entries',
        filter: `user_id=eq.${userId}`
      }, payload => {
        const source = payload.new?.updated_by || payload.old?.updated_by;
        if (source !== clientId) scheduleSync();
      })
      .subscribe();
  }

  async function handleSession(session) {
    state.session = session;
    if (session) localStorage.setItem(ONBOARDING_KEY, 'account');
    state.error = '';
    state.notice = '';
    await subscribeToChanges();
    attach();
    render();
    if (session) {
      void sync();
      void loadBackups();
    } else {
      state.backups = [];
    }
  }

  async function start() {
    if (state.started) return;
    state.started = true;
    ensureUi();
    observeLocalStorageWrites();

    const { data, error } = await client.auth.getSession();
    if (error) state.error = copy.unavailable;
    await handleSession(data?.session || null);

    if (!data?.session && !localStorage.getItem(ONBOARDING_KEY)) scheduleOnboarding();

    client.auth.onAuthStateChange((_event, session) => {
      global.setTimeout(() => void handleSession(session), 0);
    });
    desktopApi?.onAuthCallback?.(callbackUrl => void handleDesktopAuthCallback(callbackUrl));

    global.setInterval(() => {
      if (!document.hidden && state.session) void sync();
    }, 30000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.session) void sync();
    });
  }

  global.WebDevGymCloudSync = Object.freeze({
    start,
    open,
    openOnboarding,
    close,
    sync,
    attach,
    isSyncableKey
  });
})(window);
