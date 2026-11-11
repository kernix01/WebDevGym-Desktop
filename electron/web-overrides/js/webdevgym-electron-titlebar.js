(() => {
  'use strict';

  const desktop = window.webdevgymDesktop?.desktop;
  if (!desktop?.windowMinimize || !desktop?.windowToggleMaximize || !desktop?.windowClose) return;

  const isEnglish = document.documentElement.lang === 'en';
  const copy = isEnglish
    ? { minimize: 'Minimize', maximize: 'Maximize', restore: 'Restore', close: 'Close to tray', edition: 'Desktop' }
    : { minimize: 'Свернуть', maximize: 'Развернуть', restore: 'Восстановить', close: 'Закрыть в трей', edition: 'Desktop' };

  function syncWindowState(state = {}) {
    const maximizeButton = document.querySelector('[data-wdge-window="maximize"]');
    if (!maximizeButton) return;
    const maximized = Boolean(state.maximized || state.fullscreen);
    maximizeButton.classList.toggle('is-maximized', maximized);
    maximizeButton.title = maximized ? copy.restore : copy.maximize;
    maximizeButton.setAttribute('aria-label', maximizeButton.title);
  }

  function mountTitlebar() {
    if (document.getElementById('wdgeTitlebar')) return;

    const titlebar = document.createElement('header');
    titlebar.id = 'wdgeTitlebar';
    titlebar.className = 'wdge-titlebar';
    titlebar.innerHTML = `
      <div class="wdge-titlebar-brand" aria-label="WebDevGym ${copy.edition}">
        <img src="favicon.svg" alt="" draggable="false">
        <strong>WebDev<span>Gym</span></strong>
        <small>${copy.edition} <b data-wdge-version></b></small>
      </div>
      <div class="wdge-titlebar-drag" aria-hidden="true"></div>
      <nav class="wdge-window-controls" aria-label="${isEnglish ? 'Window controls' : 'Управление окном'}">
        <button type="button" data-wdge-window="minimize" title="${copy.minimize}" aria-label="${copy.minimize}"><i class="wdge-glyph-minimize"></i></button>
        <button type="button" data-wdge-window="maximize" title="${copy.maximize}" aria-label="${copy.maximize}"><i class="wdge-glyph-maximize"></i></button>
        <button type="button" class="wdge-window-close" data-wdge-window="close" title="${copy.close}" aria-label="${copy.close}"><i class="wdge-glyph-close"></i></button>
      </nav>`;

    document.body.prepend(titlebar);
    document.body.classList.add('wdge-titlebar-ready');

    titlebar.querySelector('[data-wdge-window="minimize"]').addEventListener('click', () => desktop.windowMinimize());
    titlebar.querySelector('[data-wdge-window="maximize"]').addEventListener('click', async () => {
      syncWindowState(await desktop.windowToggleMaximize());
    });
    titlebar.querySelector('[data-wdge-window="close"]').addEventListener('click', () => desktop.windowClose());
    titlebar.addEventListener('dblclick', event => {
      if (event.target.closest('button')) return;
      desktop.windowToggleMaximize().then(syncWindowState);
    });

    desktop.windowState().then(syncWindowState);
    desktop.appInfo().then(info => {
      const version = titlebar.querySelector('[data-wdge-version]');
      if (version && info?.version) version.textContent = `v${info.version}`;
    });
    desktop.onWindowStateChange?.(syncWindowState);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountTitlebar, { once: true });
  else mountTitlebar();
})();
