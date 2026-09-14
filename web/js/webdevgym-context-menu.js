(function () {
  'use strict';

  if (window.__webDevGymContextMenuInstalled) return;
  window.__webDevGymContextMenuInstalled = true;

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html/i.test(location.pathname);
  const copy = isEnglish ? {
    page: 'Page', link: 'Link', selection: 'Selected text',
    back: 'Back', forward: 'Forward', reload: 'Reload', search: 'Search',
    copySelection: 'Copy selected text', openLink: 'Open link in new tab', copyLink: 'Copy link',
    copyPage: 'Copy page address', next: 'Next', tools: 'WebDevGym tools', navigation: 'Navigation',
    notebook: 'Notepad', timer: 'Timer', assistant: 'AI assistant', theme: 'Switch theme',
    settings: 'Settings', fullscreen: 'Full screen', sections: 'Sections', playground: 'Playground',
    calendar: 'Calendar', learning: 'Learning', github: 'GitHub', nativeHint: 'Shift + right-click opens the browser menu'
  } : {
    page: 'Страница', link: 'Ссылка', selection: 'Выделенный текст',
    back: 'Назад', forward: 'Вперёд', reload: 'Обновить', search: 'Поиск',
    copySelection: 'Копировать выделенное', openLink: 'Открыть ссылку в новой вкладке', copyLink: 'Копировать ссылку',
    copyPage: 'Копировать адрес страницы', next: 'Далее', tools: 'Инструменты WebDevGym', navigation: 'Навигация',
    notebook: 'Блокнот', timer: 'Таймер', assistant: 'ИИ-помощник', theme: 'Сменить тему',
    settings: 'Настройки', fullscreen: 'Полный экран', sections: 'Разделы', playground: 'Playground',
    calendar: 'Календарь', learning: 'Обучение', github: 'GitHub', nativeHint: 'Shift + ПКМ открывает меню браузера'
  };

  const icon = name => '<iconify-icon icon="tabler:' + name + '" width="17" height="17" aria-hidden="true"></iconify-icon>';
  const menu = document.createElement('div');
  menu.className = 'wdg-context-menu';
  menu.dataset.page = 'main';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'WebDevGym');
  menu.hidden = true;
  menu.innerHTML = `
    <section class="wdg-context-menu__page" data-context-page="main">
      <div class="wdg-context-menu__topline">
        <div class="wdg-context-menu__brand"><span class="wdg-context-menu__brand-mark">${icon('code')}</span><span>WebDevGym</span></div>
        <span class="wdg-context-menu__context" data-context-label>${copy.page}</span>
      </div>
      <div class="wdg-context-menu__row">
        <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="back">${icon('arrow-left')}<span>${copy.back}</span></button>
        <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="forward">${icon('arrow-right')}<span>${copy.forward}</span></button>
      </div>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="reload">${icon('reload')}<span>${copy.reload}</span><kbd class="wdg-context-menu__shortcut">Ctrl R</kbd></button>
      <div data-context-dynamic></div>
      <div class="wdg-context-menu__separator"></div>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="search">${icon('search')}<span>${copy.search}</span><kbd class="wdg-context-menu__shortcut">Ctrl K</kbd></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="copy-page">${icon('link')}<span>${copy.copyPage}</span></button>
      <button class="wdg-context-menu__item wdg-context-menu__next" type="button" role="menuitem" data-context-page-open="tools">${icon('tools')}<span>${copy.next}</span>${icon('chevron-right')}</button>
      <div class="wdg-context-menu__hint">${copy.nativeHint}</div>
    </section>
    <section class="wdg-context-menu__page" data-context-page="tools">
      <div class="wdg-context-menu__topline">
        <button class="wdg-context-menu__back" type="button" data-context-page-open="main" aria-label="${copy.back}" title="${copy.back}">${icon('arrow-left')}</button>
        <div class="wdg-context-menu__page-title"><span>${copy.tools}</span></div>
        <span aria-hidden="true"></span>
      </div>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="notebook">${icon('notebook')}<span>${copy.notebook}</span></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="timer">${icon('clock')}<span>${copy.timer}</span></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="assistant">${icon('sparkles')}<span>${copy.assistant}</span></button>
      <div class="wdg-context-menu__separator"></div>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="theme">${icon('moon-stars')}<span>${copy.theme}</span></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="settings">${icon('settings')}<span>${copy.settings}</span></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="fullscreen">${icon('maximize')}<span>${copy.fullscreen}</span><kbd class="wdg-context-menu__shortcut">F11</kbd></button>
      <button class="wdg-context-menu__item wdg-context-menu__next" type="button" role="menuitem" data-context-page-open="navigation">${icon('sitemap')}<span>${copy.next}</span>${icon('chevron-right')}</button>
    </section>
    <section class="wdg-context-menu__page" data-context-page="navigation">
      <div class="wdg-context-menu__topline">
        <button class="wdg-context-menu__back" type="button" data-context-page-open="tools" aria-label="${copy.back}" title="${copy.back}">${icon('arrow-left')}</button>
        <div class="wdg-context-menu__page-title"><span>${copy.navigation}</span></div>
        <span aria-hidden="true"></span>
      </div>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="sections">${icon('layout-grid')}<span>${copy.sections}</span></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="playground">${icon('code')}<span>${copy.playground}</span></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="calendar">${icon('calendar')}<span>${copy.calendar}</span></button>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="learning">${icon('book-2')}<span>${copy.learning}</span></button>
      <div class="wdg-context-menu__separator"></div>
      <button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="github">${icon('brand-github')}<span>${copy.github}</span></button>
    </section>`;
  document.body.appendChild(menu);

  const state = { link: null, selection: '' };
  const nativeZones = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), .CodeMirror, .monaco-editor, .ace_editor, [data-editor], .wdgp-editor, .wdgpa-code-editor';

  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    menu.dataset.page = 'main';
  }

  function isSafeLink(link) {
    if (!link) return false;
    const href = link.getAttribute('href') || '';
    return href !== '' && !/^javascript:/i.test(href);
  }

  function actionButton(action, iconName, label) {
    return '<button class="wdg-context-menu__item" type="button" role="menuitem" data-context-action="' + action + '">' + icon(iconName) + '<span>' + label + '</span></button>';
  }

  function updateContext(target) {
    state.selection = String(window.getSelection?.() || '').trim();
    state.link = target.closest?.('a[href]') || null;
    if (!isSafeLink(state.link)) state.link = null;

    const dynamic = menu.querySelector('[data-context-dynamic]');
    const contextLabel = menu.querySelector('[data-context-label]');
    const items = [];
    if (state.selection) items.push(actionButton('copy-selection', 'copy', copy.copySelection));
    if (state.link) {
      items.push('<div class="wdg-context-menu__separator"></div>');
      items.push(actionButton('open-link', 'external-link', copy.openLink));
      items.push(actionButton('copy-link', 'link', copy.copyLink));
    }
    dynamic.innerHTML = items.join('');
    contextLabel.textContent = state.selection ? copy.selection : state.link ? copy.link : copy.page;
  }

  function positionMenu(x, y) {
    const gap = 8;
    menu.style.left = '0px';
    menu.style.top = '0px';
    const rect = menu.getBoundingClientRect();
    const left = Math.max(gap, Math.min(x, window.innerWidth - rect.width - gap));
    const top = Math.max(gap, Math.min(y, window.innerHeight - rect.height - gap));
    menu.style.setProperty('--wdg-context-origin-x', left < x ? 'right' : 'left');
    menu.style.setProperty('--wdg-context-origin-y', top < y ? 'bottom' : 'top');
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    for (let pass = 0; pass < 3; pass += 1) {
      const actual = menu.getBoundingClientRect();
      const shiftX = actual.left < gap ? gap - actual.left : actual.right > window.innerWidth - gap ? window.innerWidth - gap - actual.right : 0;
      const shiftY = actual.top < gap ? gap - actual.top : actual.bottom > window.innerHeight - gap ? window.innerHeight - gap - actual.bottom : 0;
      if (Math.abs(shiftX) < .25 && Math.abs(shiftY) < .25) break;
      menu.style.left = (parseFloat(menu.style.left) + shiftX) + 'px';
      menu.style.top = (parseFloat(menu.style.top) + shiftY) + 'px';
    }
  }

  function openMenu(event) {
    if (event.shiftKey || event.target.closest?.(nativeZones)) {
      closeMenu();
      return;
    }
    event.preventDefault();
    updateContext(event.target);
    menu.dataset.page = 'main';
    menu.hidden = false;
    positionMenu(event.clientX, event.clientY);
  }

  function copyText(value) {
    if (!value) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => fallbackCopy(value));
      return;
    }
    fallbackCopy(value);
  }

  function fallbackCopy(value) {
    const field = document.createElement('textarea');
    field.value = value;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }

  function clickFirst(selectors) {
    for (const selector of selectors) {
      const targets = [...document.querySelectorAll(selector)];
      const target = targets.find(element => element.getClientRects().length && !element.hidden) || targets[0];
      if (target instanceof HTMLElement) {
        target.click();
        return true;
      }
    }
    return false;
  }

  function openView(view, legacyTab, selectors = []) {
    if (typeof window.WebDevGymNext?.open === 'function') {
      window.WebDevGymNext.open(view);
      return;
    }
    if (clickFirst(selectors)) return;
    if (typeof window.switchTabByName === 'function') window.switchTabByName(legacyTab || view);
  }

  function clickByLabel(labels) {
    const normalized = labels.map(label => label.toLocaleLowerCase());
    const candidates = [...document.querySelectorAll('button, a, [role="button"]')];
    const target = candidates.find(element => {
      const label = String(element.textContent || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
      return !menu.contains(element) && element.getClientRects().length && normalized.includes(label);
    });
    if (!(target instanceof HTMLElement)) return false;
    target.click();
    return true;
  }

  function runAction(action) {
    if (action === 'back') history.back();
    if (action === 'forward') history.forward();
    if (action === 'reload') location.reload();
    if (action === 'copy-selection') copyText(state.selection);
    if (action === 'open-link' && state.link) window.open(state.link.href, '_blank', 'noopener,noreferrer');
    if (action === 'copy-link' && state.link) copyText(state.link.href);
    if (action === 'copy-page') copyText(location.href);
    if (action === 'search') {
      if (typeof window.WebDevGymFeatures?.openCommandPalette === 'function') window.WebDevGymFeatures.openCommandPalette();
      else clickFirst(['.search-fab', '[data-mobile-action="search"]', '[aria-label*="Search"]', '[aria-label*="Поиск"]']);
    }
    if (action === 'notebook') {
      if (typeof window.WebDevGymNotebook?.open === 'function') window.WebDevGymNotebook.open();
      else window.WebDevGymFeatures?.open?.('notebook');
    }
    if (action === 'timer') clickFirst(['#wdguTimerLauncher', '.pomo-btn', '[data-mobile-action="timer"]']);
    if (action === 'assistant') {
      if (typeof window.toggleAiChat === 'function') window.toggleAiChat();
      else clickFirst(['#aiFab', '.ai-fab', '[data-ai]']);
    }
    if (action === 'theme') {
      if (typeof window.toggleDark === 'function') window.toggleDark();
      else clickFirst(['#themeBtn', '.theme-btn', '[data-mobile-action="theme"]']);
    }
    if (action === 'settings') {
      if (typeof window.openWebDevGymSettings === 'function') window.openWebDevGymSettings();
      else if (typeof window.toggleSettings === 'function') window.toggleSettings();
      else clickFirst(['#wdgSettingsBtn', '.settings-btn', '[data-wdg-nav="settings"]']);
    }
    if (action === 'fullscreen') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
    if (action === 'sections') openView('sections', '', ['#wdgLibraryBtn']);
    if (action === 'playground') openView('playground', 'playground', ['[data-wdg-nav="playground"]', '[data-tab="playground"]']);
    if (action === 'calendar') openView('calendar', 'calendar', ['[data-wdg-nav="calendar"]', '[data-tab="calendar"]']);
    if (action === 'learning') openView('learning', 'html', ['[data-wdg-nav="learn"]']);
    if (action === 'github') openView('github', 'github', ['.tab[onclick*="github"]', '[data-tab="github"]']);
    closeMenu();
  }

  menu.addEventListener('click', event => {
    const pageButton = event.target.closest('[data-context-page-open]');
    if (pageButton) {
      menu.dataset.page = pageButton.dataset.contextPageOpen;
      positionMenu(parseFloat(menu.style.left), parseFloat(menu.style.top));
      menu.querySelector('[data-context-page="' + menu.dataset.page + '"] .wdg-context-menu__item, [data-context-page="' + menu.dataset.page + '"] .wdg-context-menu__back')?.focus();
      return;
    }
    const actionButtonElement = event.target.closest('[data-context-action]');
    if (actionButtonElement) runAction(actionButtonElement.dataset.contextAction);
  });

  document.addEventListener('contextmenu', openMenu, true);
  document.addEventListener('pointerdown', event => {
    if (!menu.hidden && !menu.contains(event.target)) closeMenu();
  }, true);
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === 'ArrowLeft' && menu.dataset.page !== 'main') {
      event.preventDefault();
      menu.dataset.page = menu.dataset.page === 'navigation' ? 'tools' : 'main';
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = [...menu.querySelectorAll('[data-context-page="' + menu.dataset.page + '"] button:not([disabled])')];
    const current = items.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? (current + 1) % items.length : (current <= 0 ? items.length - 1 : current - 1);
    items[next]?.focus();
  });
  window.addEventListener('blur', closeMenu);
  window.addEventListener('resize', closeMenu, { passive: true });
  window.addEventListener('scroll', closeMenu, { passive: true, capture: true });

  window.WebDevGymContextMenu = {
    close: closeMenu,
    openPage(page) {
      if (['main', 'tools', 'navigation'].includes(page)) menu.dataset.page = page;
    }
  };
})();
