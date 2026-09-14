const { contextBridge, ipcRenderer } = require('electron');

const githubToken = Object.freeze({
  load: () => ipcRenderer.invoke('webdevgym:github-token:load'),
  remove: () => ipcRenderer.invoke('webdevgym:github-token:remove'),
  save: token => ipcRenderer.invoke('webdevgym:github-token:save', token)
});

contextBridge.exposeInMainWorld('webdevgymDesktop', Object.freeze({
  isDesktop: true,
  platform: process.platform,
  githubToken,
  versions: Object.freeze({
    electron: process.versions.electron,
    chrome: process.versions.chrome
  })
}));

const TOKEN_SELECTOR = '#gh-token, #ghc-token';
const TOKEN_PATTERN = /^(gh[pousr]_|github_pat_)[A-Za-z0-9_]+$/;
let rememberedToken = '';

function usableToken(value) {
  return TOKEN_PATTERN.test(value) && value.length >= 20;
}

function applyTokenToInput(input) {
  if (!rememberedToken || input.value) return;
  input.value = rememberedToken;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function applyRememberedToken(root = document) {
  if (!rememberedToken) return;
  if (root.matches?.(TOKEN_SELECTOR)) applyTokenToInput(root);
  root.querySelectorAll?.(TOKEN_SELECTOR).forEach(applyTokenToInput);
}

function installTokenPersistence() {
  void githubToken.load().then(token => {
    if (!usableToken(token)) return;
    rememberedToken = token;
    applyRememberedToken();
  }).catch(() => {});

  const observer = new MutationObserver(records => {
    if (!rememberedToken) return;
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) applyRememberedToken(node);
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-gh-vault-action]');
    if (!button) return;
    const action = button.dataset.ghVaultAction;

    if (action === 'lock' || action === 'remove') {
      rememberedToken = '';
      void githubToken.remove().catch(() => {});
      return;
    }

    if (action !== 'save' && action !== 'unlock') return;
    setTimeout(() => {
      const token = Array.from(document.querySelectorAll(TOKEN_SELECTOR))
        .map(input => input.value.trim())
        .find(usableToken);
      if (!token) return;
      rememberedToken = token;
      void githubToken.save(token).catch(() => {});
    }, 350);
  }, true);
}

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.desktop = 'electron';
  installTokenPersistence();
});
