(function () {
  'use strict';

  const store = window.webdevgymDesktop?.githubToken;
  if (!store) return;

  const TOKEN_SELECTOR = '#gh-token, #ghc-token';
  const TOKEN_PATTERN = /^(gh[pousr]_|github_pat_)[A-Za-z0-9_]+$/;
  let rememberedToken = '';
  let restorePromise = null;

  function usableToken(value) {
    return typeof value === 'string' && value.length >= 20 && TOKEN_PATTERN.test(value);
  }

  function tokenInputs(root = document) {
    const inputs = [];
    if (root.matches?.(TOKEN_SELECTOR)) inputs.push(root);
    root.querySelectorAll?.(TOKEN_SELECTOR).forEach(input => inputs.push(input));
    return inputs;
  }

  function applyToken(value, root = document) {
    if (!usableToken(value)) return;
    tokenInputs(root).forEach(input => {
      if (input.value === value) return;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  function restoreToken(root = document) {
    if (rememberedToken) {
      applyToken(rememberedToken, root);
      return Promise.resolve(rememberedToken);
    }
    if (restorePromise) return restorePromise;
    restorePromise = store.load()
      .then(token => {
        if (!usableToken(token)) return '';
        rememberedToken = token;
        applyToken(token, root);
        return token;
      })
      .catch(() => '')
      .finally(() => { restorePromise = null; });
    return restorePromise;
  }

  function wrapVaultRestore() {
    const vault = window.WebDevGymGitHubTokenVault;
    if (!vault || vault.desktopRestoreReady) return;
    const browserRestore = vault.restore?.bind(vault);
    vault.restore = async function () {
      const browserToken = await browserRestore?.();
      if (usableToken(browserToken)) return browserToken;
      return restoreToken();
    };
    vault.desktopRestoreReady = true;
  }

  function saveVisibleToken() {
    const token = tokenInputs().map(input => input.value.trim()).find(usableToken);
    if (!token) return;
    rememberedToken = token;
    void store.save(token).catch(() => {});
  }

  wrapVaultRestore();
  void restoreToken();

  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) void restoreToken(node);
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('focusin', event => {
    if (event.target.matches?.(TOKEN_SELECTOR)) void restoreToken(event.target);
  }, true);

  document.addEventListener('click', event => {
    const action = event.target.closest?.('[data-gh-vault-action]')?.dataset.ghVaultAction;
    if (action === 'lock' || action === 'remove') {
      rememberedToken = '';
      void store.remove().catch(() => {});
      return;
    }
    if (action === 'save' || action === 'unlock') setTimeout(saveVisibleToken, 400);
    setTimeout(() => void restoreToken(), 0);
    setTimeout(() => void restoreToken(), 250);
  }, true);
})();
