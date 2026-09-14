(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const isWebProtocol = location.protocol === 'http:' || location.protocol === 'https:';
  let installPrompt = null;

  if (isWebProtocol && !document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = 'manifest.webmanifest';
    document.head.appendChild(manifest);
  }

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    const toast = document.createElement('div');
    toast.className = 'wdg-pwa-toast';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;left:50%;bottom:22px;z-index:3000;transform:translateX(-50%);padding:10px 14px;border:1px solid #34445b;border-radius:6px;background:#111a27;color:#edf3fb;font:12px Inter,system-ui';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function addInstallButton() {
    if (document.getElementById('wdgInstallBtn') || isStandalone()) return;
    const bar = document.querySelector('.wdg-commandbar');
    if (!bar) {
      setTimeout(addInstallButton, 100);
      return;
    }
    const button = document.createElement('button');
    button.className = 'wdg-icon-btn desktop-only';
    button.id = 'wdgInstallBtn';
    button.type = 'button';
    button.title = isEnglish ? 'Install WebDevGym' : 'Установить WebDevGym';
    button.setAttribute('aria-label', button.title);
    button.innerHTML = icon('tabler:device-desktop-down', 18);
    button.hidden = !installPrompt;
    button.addEventListener('click', async () => {
      if (!installPrompt) {
        notify(isEnglish ? 'Use the browser menu to install this app.' : 'Установи приложение через меню браузера.');
        return;
      }
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') notify(isEnglish ? 'WebDevGym installed.' : 'WebDevGym установлен.');
      installPrompt = null;
      button.hidden = true;
    });
    const settings = document.getElementById('wdgSettingsBtn');
    if (settings) settings.before(button);
    else bar.append(button);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    addInstallButton();
    const button = document.getElementById('wdgInstallBtn');
    if (button) button.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    document.getElementById('wdgInstallBtn')?.remove();
  });

  let serviceWorkerContainer = null;
  try {
    if (window.self === window.top && 'serviceWorker' in navigator) {
      serviceWorkerContainer = navigator.serviceWorker;
    }
  } catch (error) {}

  if (serviceWorkerContainer && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    const registerServiceWorker = () => serviceWorkerContainer.register('./sw.js').catch(() => {});
    if (document.readyState === 'complete') registerServiceWorker();
    else window.addEventListener('load', registerServiceWorker, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addInstallButton);
  else addInstallButton();
})();
