(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const VAULT_KEY = 'wdg_github_token_vault_v1';
  const DEVICE_VAULT_KEY = 'wdg_github_token_device_v1';
  const DEVICE_DB_NAME = 'wdg_github_secure_store_v1';
  const DEVICE_STORE_NAME = 'keys';
  const DEVICE_KEY_ID = 'github-token-key';
  let deviceRestorePromise = null;
  const FIELD_PREFIX = 'wdg_github_field_v1:';
  const TOKEN_FIELD_IDS = new Set(['gh-token', 'ghc-token']);
  const ITERATIONS = 250000;

  const copy = isEnglish ? {
    title: 'Encrypted token storage',
    description: 'The token is encrypted and restored automatically only in this browser profile. The vault password is never saved.',
    password: 'Vault password', passwordHint: 'At least 8 characters',
    save: 'Save token', unlock: 'Unlock', lock: 'Lock', remove: 'Delete',
    empty: 'No saved token', locked: 'Saved and locked', unlocked: 'Remembered on this device',
    saved: 'Token encrypted and saved', removed: 'Saved token deleted',
    enterToken: 'Enter a new GitHub token first.',
    enterPassword: 'Enter a vault password with at least 8 characters.',
    noVault: 'There is no saved token yet.',
    wrongPassword: 'The password is incorrect or the saved data is damaged.',
    unavailable: 'Encrypted storage requires a modern browser and HTTPS.',
    showToken: 'Show token', hideToken: 'Hide token',
    security: 'Revoke a token immediately if it was posted in a chat, screenshot or public repository.',
    fieldNote: 'After saving or unlocking once, the token survives reloads and reopening this browser profile. Locking the vault disables automatic restore.'
  } : {
    title: 'Зашифрованное хранение токена',
    description: 'Токен шифруется и автоматически восстанавливается только в этом профиле браузера. Пароль хранилища нигде не сохраняется.',
    password: 'Пароль хранилища', passwordHint: 'Минимум 8 символов',
    save: 'Сохранить токен', unlock: 'Разблокировать', lock: 'Заблокировать', remove: 'Удалить',
    empty: 'Сохранённого токена нет', locked: 'Сохранён и заблокирован', unlocked: 'Запомнен на этом устройстве',
    saved: 'Токен зашифрован и сохранён', removed: 'Сохранённый токен удалён',
    enterToken: 'Сначала введи новый токен GitHub.',
    enterPassword: 'Задай пароль хранилища минимум из 8 символов.',
    noVault: 'Сохранённого токена пока нет.',
    wrongPassword: 'Неверный пароль или сохранённые данные повреждены.',
    unavailable: 'Для шифрования нужен современный браузер и HTTPS.',
    showToken: 'Показать токен', hideToken: 'Скрыть токен',
    security: 'Если токен попал в чат, на скриншот или в публичный репозиторий, сразу отзови его.',
    fieldNote: 'После одного сохранения или разблокировки токен переживёт перезагрузку и повторное открытие этого профиля браузера. Кнопка «Заблокировать» отключит автовосстановление.'
  };

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }

  function storageSet(key, value) {
    localStorage.setItem(key, value);
  }

  function storageRemove(key) {
    try { localStorage.removeItem(key); } catch (error) {}
  }

  function tokenInputs() {
    return Array.from(document.querySelectorAll('#gh-token, #ghc-token'));
  }

  function currentToken() {
    return tokenInputs().map(input => input.value.trim()).find(Boolean) || '';
  }

  function syncToken(value, source = null) {
    tokenInputs().forEach(input => {
      if (input !== source && input.value !== value) input.value = value;
    });
  }

  function tokenLooksUsable(value) {
    return /^(gh[pousr]_|github_pat_)[A-Za-z0-9_]+$/.test(value) && value.length >= 20;
  }

  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }

  async function deriveKey(password, salt) {
    const material = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptToken(token, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, new TextEncoder().encode(token)
    );
    return JSON.stringify({
      version: 1,
      algorithm: 'AES-GCM',
      iterations: ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(encrypted))
    });
  }

  async function decryptToken(payload, password) {
    const data = JSON.parse(payload);
    if (data.version !== 1 || data.algorithm !== 'AES-GCM') throw new Error('Unsupported vault');
    const salt = base64ToBytes(data.salt);
    const iv = base64ToBytes(data.iv);
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, key, base64ToBytes(data.ciphertext)
    );
    return new TextDecoder().decode(decrypted);
  }

  function cryptoAvailable() {
    return Boolean(window.crypto?.subtle && window.TextEncoder && window.TextDecoder);
  }

  function openDeviceDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error('IndexedDB unavailable'));
      const request = indexedDB.open(DEVICE_DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DEVICE_STORE_NAME)) {
          request.result.createObjectStore(DEVICE_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
    });
  }

  async function getDeviceKey(createIfMissing = false) {
    const database = await openDeviceDatabase();
    try {
      const existing = await new Promise((resolve, reject) => {
        const request = database.transaction(DEVICE_STORE_NAME, 'readonly')
          .objectStore(DEVICE_STORE_NAME)
          .get(DEVICE_KEY_ID);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Device key read failed'));
      });
      if (existing || !createIfMissing) return existing;

      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(DEVICE_STORE_NAME, 'readwrite');
        transaction.objectStore(DEVICE_STORE_NAME).put(key, DEVICE_KEY_ID);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error('Device key save failed'));
        transaction.onabort = () => reject(transaction.error || new Error('Device key save aborted'));
      });
      return key;
    } finally {
      database.close();
    }
  }

  async function rememberTokenForDevice(token) {
    const key = await getDeviceKey(true);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(token)
    );
    storageSet(DEVICE_VAULT_KEY, JSON.stringify({
      version: 1,
      algorithm: 'AES-GCM',
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(ciphertext))
    }));
  }

  async function readRememberedToken() {
    const payload = storageGet(DEVICE_VAULT_KEY);
    if (!payload) return '';
    const data = JSON.parse(payload);
    if (data.version !== 1 || data.algorithm !== 'AES-GCM') throw new Error('Unsupported device vault');
    const key = await getDeviceKey(false);
    if (!key) throw new Error('Device key missing');
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(data.iv) },
      key,
      base64ToBytes(data.ciphertext)
    );
    return new TextDecoder().decode(decrypted);
  }

  function forgetRememberedToken() {
    storageRemove(DEVICE_VAULT_KEY);
  }

  function restoreRememberedToken() {
    if (currentToken() || !storageGet(DEVICE_VAULT_KEY)) return Promise.resolve('');
    if (deviceRestorePromise) return deviceRestorePromise;
    deviceRestorePromise = readRememberedToken()
      .then(token => {
        if (!tokenLooksUsable(token)) throw new Error('Invalid remembered token');
        syncToken(token);
        updatePanels();
        return token;
      })
      .catch(() => {
        forgetRememberedToken();
        updatePanels();
        return '';
      })
      .finally(() => {
        deviceRestorePromise = null;
      });
    return deviceRestorePromise;
  }

  function clearLegacyPlaintextTokens() {
    try {
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index) || '';
        const lowerKey = key.toLowerCase();
        if (lowerKey.endsWith('gh-token') || lowerKey.endsWith('ghc-token')) localStorage.removeItem(key);
      }
    } catch (error) {}
  }

  function vaultState() {
    if (currentToken()) return 'unlocked';
    return storageGet(VAULT_KEY) ? 'locked' : 'empty';
  }

  function setPanelMessage(panel, message, type = '') {
    const element = panel.querySelector('[data-gh-vault-message]');
    if (!element) return;
    element.textContent = message;
    element.dataset.type = type;
  }

  function updatePanels(message = '', type = '') {
    const state = vaultState();
    document.querySelectorAll('[data-gh-token-vault]').forEach(panel => {
      panel.dataset.state = state;
      const badge = panel.querySelector('[data-gh-vault-state]');
      if (badge) badge.textContent = copy[state];
      const unlockButton = panel.querySelector('[data-gh-vault-action="unlock"]');
      const lockButton = panel.querySelector('[data-gh-vault-action="lock"]');
      const removeButton = panel.querySelector('[data-gh-vault-action="remove"]');
      if (unlockButton) unlockButton.disabled = !storageGet(VAULT_KEY) || state === 'unlocked';
      if (lockButton) lockButton.disabled = state !== 'unlocked';
      if (removeButton) removeButton.disabled = !storageGet(VAULT_KEY);
      if (message) setPanelMessage(panel, message, type);
    });
  }

  async function saveToken(panel) {
    if (!cryptoAvailable()) return updatePanels(copy.unavailable, 'error');
    const token = currentToken();
    const password = panel.querySelector('[data-gh-vault-password]')?.value || '';
    if (!tokenLooksUsable(token)) return updatePanels(copy.enterToken, 'error');
    if (password.length < 8) return updatePanels(copy.enterPassword, 'error');
    try {
      storageSet(VAULT_KEY, await encryptToken(token, password));
      await rememberTokenForDevice(token);
      panel.querySelector('[data-gh-vault-password]').value = '';
      updatePanels(copy.saved, 'success');
    } catch (error) {
      updatePanels(copy.unavailable, 'error');
    }
  }

  async function unlockToken(panel) {
    if (!cryptoAvailable()) return updatePanels(copy.unavailable, 'error');
    const payload = storageGet(VAULT_KEY);
    const password = panel.querySelector('[data-gh-vault-password]')?.value || '';
    if (!payload) return updatePanels(copy.noVault, 'error');
    if (!password) return updatePanels(copy.enterPassword, 'error');
    try {
      const token = await decryptToken(payload, password);
      if (!tokenLooksUsable(token)) throw new Error('Invalid token');
      syncToken(token);
      await rememberTokenForDevice(token);
      panel.querySelector('[data-gh-vault-password]').value = '';
      updatePanels(copy.unlocked, 'success');
    } catch (error) {
      updatePanels(copy.wrongPassword, 'error');
    }
  }

  function lockToken() {
    forgetRememberedToken();
    syncToken('');
    tokenInputs().forEach(input => { input.type = 'password'; });
    updatePanels(copy.locked);
  }

  function removeToken() {
    storageRemove(VAULT_KEY);
    forgetRememberedToken();
    syncToken('');
    updatePanels(copy.removed, 'success');
  }

  function toggleTokenVisibility(button) {
    const show = tokenInputs().every(input => input.type === 'password');
    tokenInputs().forEach(input => { input.type = show ? 'text' : 'password'; });
    document.querySelectorAll('[data-gh-vault-action="show"]').forEach(toggle => {
      toggle.textContent = show ? copy.hideToken : copy.showToken;
      toggle.setAttribute('aria-pressed', String(show));
    });
  }

  function vaultMarkup() {
    return `
      <div class="wdg-gh-vault-heading">
        <div><strong>${copy.title}</strong><span>${copy.description}</span></div>
        <span class="wdg-gh-vault-state" data-gh-vault-state>${copy.empty}</span>
      </div>
      <div class="wdg-gh-vault-controls">
        <label><span>${copy.password}</span><input type="password" data-gh-vault-password autocomplete="current-password" placeholder="${copy.passwordHint}"></label>
        <button type="button" data-gh-vault-action="save">${copy.save}</button>
        <button type="button" data-gh-vault-action="unlock">${copy.unlock}</button>
        <button type="button" data-gh-vault-action="lock">${copy.lock}</button>
        <button type="button" data-gh-vault-action="show">${copy.showToken}</button>
        <button type="button" class="danger" data-gh-vault-action="remove">${copy.remove}</button>
      </div>
      <p class="wdg-gh-vault-message" data-gh-vault-message>${copy.security}</p>`;
  }

  function injectVault(input) {
    if (input.dataset.ghVaultReady === '1') return;
    input.dataset.ghVaultReady = '1';
    input.autocomplete = 'off';
    input.addEventListener('input', () => {
      syncToken(input.value, input);
      updatePanels();
    });

    const note = input.nextElementSibling;
    if (note && !note.matches('[data-gh-token-vault]')) note.textContent = copy.fieldNote;

    const panel = document.createElement('div');
    panel.className = 'wdg-gh-token-vault';
    panel.dataset.ghTokenVault = '1';
    panel.innerHTML = vaultMarkup();
    input.parentElement.appendChild(panel);
    panel.addEventListener('click', event => {
      const button = event.target.closest('[data-gh-vault-action]');
      if (!button) return;
      const action = button.dataset.ghVaultAction;
      if (action === 'save') saveToken(panel);
      if (action === 'unlock') unlockToken(panel);
      if (action === 'lock') lockToken();
      if (action === 'show') toggleTokenVisibility(button);
      if (action === 'remove') removeToken();
    });
    panel.querySelector('[data-gh-vault-password]').addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      storageGet(VAULT_KEY) ? unlockToken(panel) : saveToken(panel);
    });
  }

  function protectLegacyHelpers() {
    window.GH_STORAGE_PREFIX = window.GH_STORAGE_PREFIX || FIELD_PREFIX;
    if (Array.isArray(window.GH_FIELDS)) {
      window.GH_FIELDS = window.GH_FIELDS.filter(id => !TOKEN_FIELD_IDS.has(id));
    }

    const originalSave = window.ghSaveField;
    window.ghSaveField = function (id, value) {
      if (TOKEN_FIELD_IDS.has(id)) {
        const source = document.getElementById(id);
        syncToken(value, source);
        updatePanels();
        return;
      }
      if (typeof originalSave === 'function') return originalSave(id, value);
    };

    const originalRestore = window.ghRestoreFields;
    window.ghRestoreFields = function () {
      clearLegacyPlaintextTokens();
      if (typeof originalRestore === 'function') originalRestore();
      tokenInputs().forEach(input => { input.value = ''; });
      initVaults();
    };
  }

  function initVaults() {
    tokenInputs().forEach(injectVault);
    updatePanels();
    restoreRememberedToken();
  }

  function init() {
    clearLegacyPlaintextTokens();
    protectLegacyHelpers();
    initVaults();
    const observer = new MutationObserver(records => {
      const hasTokenInput = records.some(record => Array.from(record.addedNodes).some(node =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches?.('#gh-token, #ghc-token') || node.querySelector?.('#gh-token, #ghc-token'))
      ));
      if (hasTokenInput) initVaults();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('storage', event => {
      if (event.key === VAULT_KEY) updatePanels();
    });
  }

  window.WebDevGymGitHubTokenVault = {
    getToken: currentToken,
    restore: restoreRememberedToken
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
