(function () {
  'use strict';

  if (window.WebDevGymRuntime) return;

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname);
  const L = (en, ru) => isEnglish ? en : ru;
  const SECRET_KEY = /(token|api.?key|secret|password|credential|auth|vault)/i;
  const INTERNAL_KEY = /^(wdg_recovery_v1|wdg_runtime_)/;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function icon(name, size = 18) {
    return '<iconify-icon icon="' + name + '" width="' + size + '" height="' + size + '" aria-hidden="true"></iconify-icon>';
  }

  function read(key, fallback = '') {
    try { return localStorage.getItem(key) ?? fallback; }
    catch (error) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, String(value)); return true; }
    catch (error) { return false; }
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value ?? fallback;
    } catch (error) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { return false; }
  }

  function safeStorageSnapshot() {
    const storage = {};
    Object.keys(localStorage).sort().forEach(key => {
      if (SECRET_KEY.test(key) || INTERNAL_KEY.test(key)) return;
      const value = localStorage.getItem(key);
      if (value != null) storage[key] = value;
    });
    return storage;
  }

  function restoreStorageSnapshot(storage) {
    if (!storage || typeof storage !== 'object' || Array.isArray(storage)) return false;
    Object.entries(storage).forEach(([key, value]) => {
      if (SECRET_KEY.test(key) || INTERNAL_KEY.test(key)) return;
      localStorage.setItem(key, String(value));
    });
    return true;
  }

  function download(content, name, type = 'application/json') {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function notify(message) {
    if (typeof window.showToast === 'function') window.showToast(message);
    else if (typeof window.toast === 'function') window.toast(message);
    else console.info('[WebDevGym]', message);
  }

  function emit(name, detail = {}) {
    document.dispatchEvent(new CustomEvent('webdevgym:' + name, { detail }));
  }

  function waitForFeatures(callback, attempts = 80) {
    const api = window.WebDevGymFeatures;
    if (api?.register) return callback(api);
    if (attempts > 0) setTimeout(() => waitForFeatures(callback, attempts - 1), 80);
    return undefined;
  }

  function createNavigationButton(options) {
    const nav = document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById(options.id)) return null;
    const button = document.createElement('button');
    button.className = 'wdg-nav-btn';
    button.id = options.id;
    button.type = 'button';
    button.dataset.wdgFeature = options.feature;
    button.innerHTML = icon(options.icon, 19) + '<span>' + escapeHtml(options.label) + '</span>';
    button.title = options.label;
    button.setAttribute('aria-label', options.label);
    button.addEventListener('click', options.onClick);
    const after = options.after && document.querySelector(options.after);
    if (after) after.after(button);
    else nav.append(button);
    return button;
  }

  window.WebDevGymRuntime = Object.freeze({
    isEnglish,
    L,
    escapeHtml,
    icon,
    read,
    write,
    readJson,
    writeJson,
    safeStorageSnapshot,
    restoreStorageSnapshot,
    download,
    notify,
    emit,
    waitForFeatures,
    createNavigationButton
  });
})();
