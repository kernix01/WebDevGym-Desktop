(function () {
  'use strict';

  const META_KEY = 'wdg_device_sync_meta_v1';
  const CONNECTION_KEY = 'wdg_device_sync_connection_v1';
  const CLIENT_KEY = 'wdg_device_sync_client_v1';
  const PORTS = [47831];
  const POLL_MS = 30000;
  const LOCAL_SYNC_DELAY = 80;
  const SOCKET_REQUEST_TIMEOUT = 1000;
  const SOCKET_RECONNECT_MAX = 10000;
  const MAX_VALUE_LENGTH = 1024 * 1024;
  const desktopApi = window.webdevgymDesktop?.desktop || null;
  const isDesktop = Boolean(window.webdevgymDesktop?.isDesktop && desktopApi?.syncExchange);
  const isEnglish = document.documentElement.lang === 'en' || /index-en\.html$/i.test(location.pathname);

  const copy = isEnglish ? {
    title: 'Device sync',
    subtitle: 'Keep progress, notes and settings in sync between Web and Desktop on this computer.',
    desktopReady: 'Desktop bridge is ready',
    webReady: 'Desktop found',
    offline: 'Desktop is not running',
    offlineHint: 'Open WebDevGym Desktop, then try again.',
    permissionHint: 'Chrome may ask for access to devices on your local network. Allow it to connect to Desktop.',
    permissionDenied: 'Local network access is blocked for this site. Open the site permissions near the address bar, allow local network access, then try again.',
    paired: 'Sync is connected',
    pairingCode: 'Pairing code',
    pairingHint: 'Enter this code in the Web version. It expires in 10 minutes.',
    codePlaceholder: '6-digit code',
    connect: 'Connect',
    retry: 'Find Desktop',
    regenerate: 'New code',
    disconnect: 'Disconnect',
    disconnectAll: 'Disconnect Web clients',
    lastSync: 'Last sync',
    never: 'Not yet',
    now: 'just now',
    clients: 'Web clients',
    protected: 'Tokens, API keys, AI history, backgrounds and Playground projects are not synced.',
    wrongCode: 'The code is incorrect or expired.',
    connectionError: 'Could not connect to Desktop.',
    copied: 'Code copied',
    copyFailed: 'Could not copy the code',
    close: 'Close'
  } : {
    title: 'Синхронизация устройств',
    subtitle: 'Прогресс, заметки и настройки будут одинаковыми в Web и Desktop на этом компьютере.',
    desktopReady: 'Локальный мост Desktop готов',
    webReady: 'Desktop найден',
    offline: 'Desktop не запущен',
    offlineHint: 'Открой WebDevGym Desktop и повтори поиск.',
    permissionHint: 'Chrome может запросить доступ к устройствам в локальной сети. Разреши его для подключения к Desktop.',
    permissionDenied: 'Для сайта запрещён доступ к локальной сети. Открой разрешения сайта рядом с адресной строкой, разреши доступ к локальной сети и повтори поиск.',
    paired: 'Синхронизация подключена',
    pairingCode: 'Код подключения',
    pairingHint: 'Введи этот код в Web-версии. Он действует 10 минут.',
    codePlaceholder: 'Код из 6 цифр',
    connect: 'Подключить',
    retry: 'Найти Desktop',
    regenerate: 'Новый код',
    disconnect: 'Отключить',
    disconnectAll: 'Отключить Web-клиенты',
    lastSync: 'Последняя синхронизация',
    never: 'Ещё не было',
    now: 'только что',
    clients: 'Web-клиентов',
    protected: 'Токены, API-ключи, история ИИ, фоны и проекты Playground не синхронизируются.',
    wrongCode: 'Код неверный или уже истёк.',
    connectionError: 'Не удалось подключиться к Desktop.',
    copied: 'Код скопирован',
    copyFailed: 'Не удалось скопировать код',
    close: 'Закрыть'
  };

  const state = {
    clientId: readClientId(),
    connection: readJson(CONNECTION_KEY, null),
    info: null,
    lastSyncAt: 0,
    syncing: false,
    modalOpen: false,
    status: 'idle',
    networkPermission: 'unknown',
    error: '',
    applyingRemote: false,
    pendingSync: false
  };
  let syncSocket = null;
  const socketRequests = new Map();
  let socketRequestSequence = 0;
  let socketReconnectTimer = 0;
  let socketReconnectAttempt = 0;
  let localSyncTimer = 0;

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
      const id = (crypto.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(CLIENT_KEY, id);
      return id;
    } catch {
      return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  function isSyncableKey(key, value) {
    const lower = String(key || '').toLowerCase();
    if (!lower || lower.includes('device_sync')) return false;
    const blocked = [
      'token', 'secret', 'password', 'credential', 'api_key', 'apikey',
      'github', 'gh-', 'ai_custom_models', 'ai_active_custom_model',
      'ai_chat_history', 'ai_threads', 'ai_active_thread', 'custombg', 'wdga_projects',
      'iconify', 'wdgr_ai_window', 'wdgu_timer_window'
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
    const metadata = readJson(META_KEY, {});
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

    writeJson(META_KEY, metadata);
    return entries;
  }

  function applyRemoteEntries(entries) {
    const metadata = readJson(META_KEY, {});
    let changed = false;
    const changedKeys = [];

    for (const entry of Array.isArray(entries) ? entries : []) {
      if (!isSyncableKey(entry.key, entry.value) || entry.updatedAt == null) continue;
      const key = String(entry.key);
      const local = metadata[key];
      const localTime = Number(local?.updatedAt) || 0;
      const remoteTime = Number(entry.updatedAt) || 0;
      const current = localStorage.getItem(key);
      const remoteValue = entry.deleted ? null : String(entry.value ?? '');
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
        changed = true;
        changedKeys.push(key);
        try {
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            oldValue: current,
            newValue: remoteValue,
            storageArea: localStorage,
            url: location.href
          }));
        } catch {}
      }
    }

    writeJson(META_KEY, metadata);
    if (changed) {
      window.dispatchEvent(new CustomEvent('webdevgym:sync-applied', { detail: { keys: changedKeys } }));
    }
    return changed;
  }

  async function requestWithTimeout(url, options = {}, timeout = 900) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      const requestOptions = { ...options, signal: controller.signal, cache: 'no-store' };
      if (/^http:\/\/(127\.0\.0\.1|localhost)(?::\d+)?\//i.test(url)) {
        requestOptions.targetAddressSpace = 'loopback';
      }
      return await fetch(url, requestOptions);
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function readNetworkPermission() {
    if (!navigator.permissions?.query) return 'unknown';
    for (const name of ['loopback-network', 'local-network']) {
      try {
        const permission = await navigator.permissions.query({ name });
        if (permission?.state) return permission.state;
      } catch {}
    }
    return 'unknown';
  }

  async function probeDesktop() {
    if (isDesktop) {
      state.info = await desktopApi.syncInfo();
      state.status = 'paired';
      render();
      return state.info;
    }
    state.networkPermission = await readNetworkPermission();
    const savedPort = Number(state.connection?.port);
    const ports = savedPort ? [savedPort, ...PORTS.filter(port => port !== savedPort)] : PORTS;
    for (const port of ports) {
      try {
        const response = await requestWithTimeout(`http://127.0.0.1:${port}/health`);
        if (!response.ok) continue;
        const info = await response.json();
        if (info.app !== 'WebDevGym') continue;
        state.info = { ...info, port };
        state.status = state.connection?.token ? 'paired' : 'found';
        state.error = '';
        render();
        return state.info;
      } catch {
        state.networkPermission = await readNetworkPermission();
      }
    }
    state.info = null;
    state.status = 'offline';
    render();
    return null;
  }

  async function pair(code) {
    const info = state.info || await probeDesktop();
    if (!info) return;
    state.error = '';
    render();
    try {
      const response = await requestWithTimeout(`http://127.0.0.1:${info.port}/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, clientId: state.clientId, entries: collectChanges() })
      }, 2500);
      if (!response.ok) throw new Error(response.status === 401 ? 'wrong-code' : 'connection');
      const result = await response.json();
      state.connection = { port: info.port, token: result.token };
      writeJson(CONNECTION_KEY, state.connection);
      applyRemoteEntries(result.entries);
      state.status = 'paired';
      state.lastSyncAt = Date.now();
      connectWebSocket();
    } catch (error) {
      state.error = error.message === 'wrong-code' ? copy.wrongCode : copy.connectionError;
    }
    render();
  }

  async function exchange() {
    if (state.syncing) {
      state.pendingSync = true;
      return;
    }
    if (!isDesktop && !state.connection?.token) return;
    state.syncing = true;
    try {
      const entries = collectChanges();
      let result;
      if (isDesktop) {
        result = await desktopApi.syncExchange(state.clientId, entries);
        state.info = await desktopApi.syncInfo();
      } else {
        try {
          result = await exchangeOverWebSocket(entries);
        } catch {
          const response = await requestWithTimeout(`http://127.0.0.1:${state.connection.port}/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${state.connection.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId: state.clientId, entries })
          }, 2500);
          if (response.status === 401) {
            disconnectBrowser();
            return;
          }
          if (!response.ok) throw new Error('sync-failed');
          result = await response.json();
        }
      }
      applyRemoteEntries(result.entries);
      state.status = 'paired';
      state.error = '';
      state.lastSyncAt = Date.now();
    } catch {
      state.status = 'offline';
      state.error = copy.connectionError;
    } finally {
      state.syncing = false;
      render();
      if (state.pendingSync) {
        state.pendingSync = false;
        queueMicrotask(() => void exchange());
      }
    }
  }

  function scheduleLocalExchange() {
    if (state.applyingRemote || (!isDesktop && !state.connection?.token)) return;
    window.clearTimeout(localSyncTimer);
    localSyncTimer = window.setTimeout(() => void exchange(), LOCAL_SYNC_DELAY);
  }

  function observeLocalStorageWrites() {
    const prototype = window.Storage?.prototype;
    if (!prototype) return;
    const eventName = 'webdevgym:local-storage-write';
    if (!prototype.__webdevgymSyncObserved) {
      const setItem = prototype.setItem;
      const removeItem = prototype.removeItem;
      const clear = prototype.clear;
      Object.defineProperty(prototype, '__webdevgymSyncObserved', { value: true });
      prototype.setItem = function (key, value) {
        const result = setItem.call(this, key, value);
        if (this === window.localStorage) {
          window.dispatchEvent(new CustomEvent(eventName, { detail: { key: String(key), value: String(value) } }));
        }
        return result;
      };
      prototype.removeItem = function (key) {
        const result = removeItem.call(this, key);
        if (this === window.localStorage) {
          window.dispatchEvent(new CustomEvent(eventName, { detail: { key: String(key), value: null } }));
        }
        return result;
      };
      prototype.clear = function () {
        const result = clear.call(this);
        if (this === window.localStorage) {
          window.dispatchEvent(new CustomEvent(eventName, { detail: { clear: true } }));
        }
        return result;
      };
    }
    window.addEventListener(eventName, event => {
      const detail = event.detail || {};
      if (detail.clear || isSyncableKey(detail.key, detail.value)) scheduleLocalExchange();
    });
  }

  function closeWebSocket() {
    window.clearTimeout(socketReconnectTimer);
    socketReconnectTimer = 0;
    const socket = syncSocket;
    syncSocket = null;
    rejectSocketRequests(new Error('socket-closed'));
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, 'Client closed');
  }

  function rejectSocketRequests(error) {
    for (const pending of socketRequests.values()) {
      window.clearTimeout(pending.timer);
      pending.reject(error);
    }
    socketRequests.clear();
  }

  function exchangeOverWebSocket(entries) {
    const socket = syncSocket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('socket-unavailable'));
    }
    const requestId = `${state.clientId}:${Date.now()}:${socketRequestSequence += 1}`;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        socketRequests.delete(requestId);
        reject(new Error('socket-timeout'));
      }, SOCKET_REQUEST_TIMEOUT);
      socketRequests.set(requestId, { resolve, reject, timer });
      try {
        socket.send(JSON.stringify({ type: 'sync', requestId, entries }));
      } catch (error) {
        window.clearTimeout(timer);
        socketRequests.delete(requestId);
        reject(error);
      }
    });
  }

  function handleSocketMessage(event) {
    try {
      const message = JSON.parse(String(event.data || '{}'));
      if (message.type === 'sync-result' || message.type === 'sync-error') {
        const pending = socketRequests.get(String(message.requestId || ''));
        if (!pending) return;
        window.clearTimeout(pending.timer);
        socketRequests.delete(String(message.requestId));
        if (message.type === 'sync-error') pending.reject(new Error(message.error || 'socket-sync-failed'));
        else pending.resolve(message);
        return;
      }
      if (message.type === 'sync-changed' && message.source !== state.clientId) void exchange();
    } catch {}
  }

  function scheduleWebSocketReconnect() {
    if (isDesktop || !state.connection?.token || socketReconnectTimer) return;
    const delay = Math.min(500 * (2 ** socketReconnectAttempt), SOCKET_RECONNECT_MAX);
    socketReconnectAttempt += 1;
    socketReconnectTimer = window.setTimeout(() => {
      socketReconnectTimer = 0;
      connectWebSocket();
    }, delay);
  }

  function createWebSocket(url) {
    try {
      return new WebSocket(url, { targetAddressSpace: 'loopback' });
    } catch {
      return new WebSocket(url);
    }
  }

  function connectWebSocket() {
    if (isDesktop || !state.connection?.token || !state.connection?.port) return;
    if (syncSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(syncSocket.readyState)) return;
    window.clearTimeout(socketReconnectTimer);
    socketReconnectTimer = 0;
    const { port, token } = state.connection;
    const socket = createWebSocket(`ws://127.0.0.1:${port}/events?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(state.clientId)}`);
    syncSocket = socket;
    socket.addEventListener('open', () => {
      if (syncSocket !== socket) return;
      socketReconnectAttempt = 0;
      state.status = 'paired';
      state.error = '';
      render();
      void exchange();
    });
    socket.addEventListener('message', handleSocketMessage);
    socket.addEventListener('close', event => {
      if (syncSocket === socket) {
        syncSocket = null;
        rejectSocketRequests(new Error('socket-closed'));
      }
      if (event.code === 4001) {
        disconnectBrowser();
        return;
      }
      scheduleWebSocketReconnect();
    });
    socket.addEventListener('error', () => {});
  }

  function disconnectBrowser() {
    closeWebSocket();
    state.connection = null;
    state.status = state.info ? 'found' : 'offline';
    try { localStorage.removeItem(CONNECTION_KEY); } catch {}
    render();
  }

  function formatTime(value) {
    if (!value) return copy.never;
    if (Date.now() - value < 60000) return copy.now;
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async function copyText(value) {
    const text = String(value ?? '');
    if (isDesktop && desktopApi?.copyText) {
      try {
        if (await desktopApi.copyText(text)) return true;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch {}
    input.remove();
    return copied;
  }

  function icon(name, size = 18) {
    const paths = {
      'tabler:devices-sync': '<rect width="13" height="10" x="2" y="3" rx="2"/><path d="M8 21h3M9.5 13v8"/><rect width="6" height="10" x="16" y="8" rx="2"/><path d="m18 5 2 2 2-2M20 7V3"/>',
      'tabler:x': '<path d="M18 6 6 18M6 6l12 12"/>',
      'tabler:refresh': '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9M5.5 15A7 7 0 0 0 18 17.5l2-2.5"/>',
      'tabler:unlink': '<path d="m9 15-2 2a4 4 0 0 1-6-6l3-3a4 4 0 0 1 5.5-.4M15 9l2-2a4 4 0 0 1 6 6l-3 3a4 4 0 0 1-5.5.4M8 2v3M2 8h3M16 19v3M19 16h3"/>',
      'tabler:shield-lock': '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><rect width="6" height="5" x="9" y="10" rx="1"/><path d="M10.5 10V8.5a1.5 1.5 0 0 1 3 0V10"/>',
      'tabler:circle-check': '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
      'tabler:link': '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>',
      'tabler:device-desktop-off': '<rect width="18" height="12" x="3" y="4" rx="2"/><path d="M8 20h8M12 16v4M3 3l18 18"/>'
    };
    const body = paths[name] || paths['tabler:devices-sync'];
    return `<svg class="wdg-device-sync-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  function mountActionButtons() {
    const button = document.getElementById('wdgDeviceSyncButton');
    const modernActions = document.querySelector('.wdgn-top-actions');
    const modernSettings = modernActions?.querySelector('[data-settings]');
    if (button && modernSettings && button.parentElement !== modernActions) {
      button.className = 'wdgn-icon-btn wdg-device-sync-button';
      modernSettings.before(button);
    }

    const mobileDock = document.querySelector('.wdg-mobile-dock');
    if (mobileDock && !document.getElementById('wdgDeviceSyncMobileButton')) {
      const mobileButton = document.createElement('button');
      mobileButton.id = 'wdgDeviceSyncMobileButton';
      mobileButton.className = 'wdg-mobile-action wdg-device-sync-mobile';
      mobileButton.type = 'button';
      mobileButton.title = copy.title;
      mobileButton.setAttribute('aria-label', copy.title);
      mobileButton.innerHTML = `${icon('tabler:devices-sync', 20)}<span>${isEnglish ? 'Sync' : 'Синхр.'}</span><i class="wdg-device-sync-dot"></i>`;
      mobileButton.addEventListener('click', openModal);
      const mobileSettings = mobileDock.querySelector('[data-mobile-action="settings"]');
      if (mobileSettings) mobileSettings.before(mobileButton);
      else mobileDock.appendChild(mobileButton);
    }

    return Boolean(modernSettings && (!mobileDock || document.getElementById('wdgDeviceSyncMobileButton')));
  }

  function ensureUi() {
    if (document.getElementById('wdgDeviceSyncButton')) {
      mountActionButtons();
      return;
    }
    const button = document.createElement('button');
    button.id = 'wdgDeviceSyncButton';
    button.className = 'wdgn-icon-btn wdg-device-sync-button';
    button.type = 'button';
    button.title = copy.title;
    button.setAttribute('aria-label', copy.title);
    button.innerHTML = `${icon('tabler:devices-sync')}<span class="wdg-device-sync-dot"></span>`;
    button.addEventListener('click', openModal);
    const settings = document.getElementById('wdgSettingsBtn');
    const commandbar = document.querySelector('.wdg-commandbar');
    if (settings) {
      button.className = 'wdg-icon-btn wdg-device-sync-button';
      settings.before(button);
    } else if (commandbar) commandbar.appendChild(button);
    else document.body.appendChild(button);

    const modal = document.createElement('div');
    modal.id = 'wdgDeviceSyncModal';
    modal.className = 'wdg-device-sync-modal';
    modal.innerHTML = `
      <button type="button" class="wdg-device-sync-backdrop" data-sync-close aria-label="${copy.close}"></button>
      <section class="wdg-device-sync-dialog" role="dialog" aria-modal="true" aria-labelledby="wdgDeviceSyncTitle">
        <header>
          <div class="wdg-device-sync-mark">${icon('tabler:devices-sync', 22)}</div>
          <div><h2 id="wdgDeviceSyncTitle">${copy.title}</h2><p>${copy.subtitle}</p></div>
          <button type="button" class="wdg-device-sync-close" data-sync-close title="${copy.close}">${icon('tabler:x')}</button>
        </header>
        <div class="wdg-device-sync-content" data-sync-content></div>
      </section>`;
    modal.addEventListener('click', event => {
      if (event.target.closest('[data-sync-close]')) closeModal();
    });
    document.body.appendChild(modal);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.modalOpen) closeModal();
    });
    if (!mountActionButtons()) {
      const observer = new MutationObserver(() => {
        if (mountActionButtons()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(() => observer.disconnect(), 10000);
    }
    render();
  }

  async function openModal() {
    ensureUi();
    state.modalOpen = true;
    document.getElementById('wdgDeviceSyncModal')?.classList.add('open');
    document.body.classList.add('wdg-device-sync-open');
    await probeDesktop();
    if (isDesktop || state.connection?.token) await exchange();
  }

  function closeModal() {
    state.modalOpen = false;
    document.getElementById('wdgDeviceSyncModal')?.classList.remove('open');
    document.body.classList.remove('wdg-device-sync-open');
  }

  function render() {
    const buttons = [document.getElementById('wdgDeviceSyncButton'), document.getElementById('wdgDeviceSyncMobileButton')].filter(Boolean);
    buttons.forEach(button => {
      button.dataset.syncStatus = state.status;
      button.title = `${copy.title}: ${state.status === 'paired' ? copy.paired : state.status === 'offline' ? copy.offline : state.status === 'found' ? copy.webReady : copy.title}`;
    });
    const content = document.querySelector('[data-sync-content]');
    if (!content) return;

    const statusText = state.status === 'paired'
      ? copy.paired
      : state.status === 'found'
        ? copy.webReady
        : isDesktop
          ? copy.desktopReady
          : copy.offline;
    const statusClass = state.status === 'paired' || isDesktop ? 'online' : state.status === 'found' ? 'ready' : 'offline';

    if (isDesktop) {
      const code = state.info?.code || '------';
      content.innerHTML = `
        <div class="wdg-device-sync-status ${statusClass}"><i></i><strong>${copy.desktopReady}</strong><span>127.0.0.1:${state.info?.port || '...'}</span></div>
        <div class="wdg-device-sync-code-card">
          <span>${copy.pairingCode}</span>
          <button type="button" data-sync-copy-code title="${copy.copied}">${code}</button>
          <small>${copy.pairingHint}</small>
        </div>
        <div class="wdg-device-sync-stats">
          <div><span>${copy.clients}</span><strong>${state.info?.connectedClients || 0}</strong></div>
          <div><span>${copy.lastSync}</span><strong>${formatTime(state.lastSyncAt)}</strong></div>
        </div>
        <div class="wdg-device-sync-actions">
          <button type="button" class="secondary" data-sync-regenerate>${icon('tabler:refresh', 16)}${copy.regenerate}</button>
          <button type="button" class="danger" data-sync-disconnect-all>${icon('tabler:unlink', 16)}${copy.disconnectAll}</button>
        </div>
        <p class="wdg-device-sync-protected">${icon('tabler:shield-lock', 16)}${copy.protected}</p>`;
      content.querySelector('[data-sync-copy-code]')?.addEventListener('click', async () => {
        const copied = await copyText(code);
        window.showToast?.(copied ? copy.copied : copy.copyFailed);
      });
      content.querySelector('[data-sync-regenerate]')?.addEventListener('click', async () => {
        state.info = await desktopApi.syncRegenerateCode();
        render();
      });
      content.querySelector('[data-sync-disconnect-all]')?.addEventListener('click', async () => {
        state.info = await desktopApi.syncDisconnectAll();
        render();
      });
      return;
    }

    const paired = Boolean(state.connection?.token && state.status === 'paired');
    const offlineMessage = state.networkPermission === 'denied' ? copy.permissionDenied : copy.offlineHint;
    content.innerHTML = `
      <div class="wdg-device-sync-status ${statusClass}"><i></i><strong>${statusText}</strong><span>${state.info ? `127.0.0.1:${state.info.port}` : offlineMessage}</span></div>
      ${paired ? `
        <div class="wdg-device-sync-success">${icon('tabler:circle-check', 28)}<div><strong>${copy.paired}</strong><span>${copy.lastSync}: ${formatTime(state.lastSyncAt)}</span></div></div>
        <div class="wdg-device-sync-actions"><button type="button" class="danger" data-sync-disconnect>${icon('tabler:unlink', 16)}${copy.disconnect}</button></div>` : state.info ? `
        <form class="wdg-device-sync-pair-form" data-sync-pair-form>
          <label for="wdgDeviceSyncCode">${copy.pairingCode}</label>
          <div><input id="wdgDeviceSyncCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" placeholder="${copy.codePlaceholder}" required><button type="submit">${icon('tabler:link', 16)}${copy.connect}</button></div>
        </form>` : `
        <div class="wdg-device-sync-empty">${icon('tabler:device-desktop-off', 30)}<p>${offlineMessage}</p><small>${copy.permissionHint}</small><button type="button" data-sync-retry>${icon('tabler:refresh', 16)}${copy.retry}</button></div>`}
      ${state.error ? `<p class="wdg-device-sync-error">${state.error}</p>` : ''}
      <p class="wdg-device-sync-protected">${icon('tabler:shield-lock', 16)}${copy.protected}</p>`;

    content.querySelector('[data-sync-pair-form]')?.addEventListener('submit', event => {
      event.preventDefault();
      const input = content.querySelector('#wdgDeviceSyncCode');
      void pair(input.value.trim());
    });
    content.querySelector('[data-sync-retry]')?.addEventListener('click', () => void probeDesktop());
    content.querySelector('[data-sync-disconnect]')?.addEventListener('click', disconnectBrowser);
  }

  async function start() {
    ensureUi();
    observeLocalStorageWrites();
    if (isDesktop) {
      await probeDesktop();
      await exchange();
      desktopApi.onSyncChanged?.(payload => {
        if (payload?.source !== state.clientId) void exchange();
      });
    } else if (state.connection?.token) {
      await probeDesktop();
      await exchange();
      connectWebSocket();
    }
    window.setInterval(() => {
      if (document.hidden) return;
      if (isDesktop || state.connection?.token) void exchange();
    }, POLL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      connectWebSocket();
      if (isDesktop || state.connection?.token) void exchange();
    });
  }

  window.WebDevGymDeviceSync = Object.freeze({
    open: openModal,
    sync: exchange,
    isSyncableKey
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else void start();
})();
