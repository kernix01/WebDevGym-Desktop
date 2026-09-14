(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const copy = isEnglish ? {
    sections:'Sections', search:'Search', timer:'Timer', settings:'Settings',
    tools:'Quick tools', today:'Today', review:'Review', focus:'Focus', language:'Language', importData:'Import', exportData:'Export'
  } : {
    sections:'Разделы', search:'Поиск', timer:'Таймер', settings:'Настройки',
    tools:'Быстрые инструменты', today:'Сегодня', review:'Повторение', focus:'Фокус', language:'Язык', importData:'Импорт', exportData:'Экспорт'
  };

  function icon(name) {
    return '<iconify-icon icon="' + name + '" width="20" height="20" aria-hidden="true"></iconify-icon>';
  }

  function closeDrawer() {
    document.querySelector('.wdg-sidebar')?.classList.remove('peek');
    document.querySelector('.wdg-mobile-backdrop')?.classList.remove('open');
    document.body.classList.remove('wdg-mobile-nav-open');
    document.getElementById('wdgMenuBtn')?.setAttribute('aria-expanded', 'false');
  }

  function toggleDrawer() {
    const sidebar = document.querySelector('.wdg-sidebar');
    const backdrop = document.querySelector('.wdg-mobile-backdrop');
    if (!sidebar || !backdrop) return;
    const open = !sidebar.classList.contains('peek');
    sidebar.classList.toggle('peek', open);
    backdrop.classList.toggle('open', open);
    document.body.classList.toggle('wdg-mobile-nav-open', open);
    document.getElementById('wdgMenuBtn')?.setAttribute('aria-expanded', String(open));
  }

  function runExisting(selector, fallback) {
    const source = document.querySelector(selector);
    if (source) {
      source.click();
      return true;
    }
    if (typeof window[fallback] === 'function') {
      window[fallback]();
      return true;
    }
    return false;
  }

  function closePanels(except) {
    if (except !== 'sections') {
      document.querySelector('.wdg-library-panel')?.classList.remove('open');
      document.querySelector('.wdg-library-backdrop')?.classList.remove('open');
    }
    if (except !== 'search') {
      document.getElementById('searchOverlay')?.classList.remove('show');
    }
    if (except !== 'timer') {
      document.getElementById('pomoWidget')?.classList.remove('open');
    }
    if (except !== 'settings') {
      document.getElementById('settingsMini')?.classList.remove('show');
    }
  }

  function openSections() {
    closeDrawer();
    closePanels('sections');
    if (!runExisting('#wdgLibraryBtn', '')) toggleDrawer();
  }

  function buildMobileTools(sidebar) {
    if (sidebar.querySelector('.wdg-mobile-tools')) return;
    const tools = document.createElement('section');
    tools.className = 'wdg-mobile-tools';
    tools.innerHTML = '<strong>' + copy.tools + '</strong><div>' + [
      ['today','tabler:sun-high',copy.today],
      ['review','tabler:brain',copy.review],
      ['focus','tabler:focus-2',copy.focus],
      ['language','tabler:language',copy.language],
      ['import','tabler:upload',copy.importData],
      ['export','tabler:download',copy.exportData]
    ].map(item => '<button type="button" data-mobile-tool="' + item[0] + '">' + icon(item[1]) + '<span>' + item[2] + '</span></button>').join('') + '</div>';
    tools.addEventListener('click', event => {
      const button = event.target.closest('[data-mobile-tool]');
      if (!button) return;
      const action = button.dataset.mobileTool;
      closeDrawer();
      if (action === 'today') window.WebDevGymFeatures?.open?.('today');
      if (action === 'review') window.WebDevGymFeatures?.open?.('review');
      if (action === 'focus') window.WebDevGymFeatures?.open?.('focus');
      if (action === 'language') {
        const target = document.querySelector('.wdg-lang a:not(.active)');
        if (target?.href) location.href = target.href;
      }
      if (action === 'import') window.importProgressJson?.();
      if (action === 'export') window.exportProgressJson?.();
    });
    sidebar.querySelector('.wdg-side-nav')?.insertAdjacentElement('afterend', tools);
  }

  function build() {
    if (document.querySelector('.wdg-mobile-dock')) return;
    const sidebar = document.querySelector('.wdg-sidebar');
    const commandbar = document.querySelector('.wdg-commandbar');
    if (!sidebar || !commandbar) {
      setTimeout(build, 80);
      return;
    }

    const backdrop = document.createElement('button');
    backdrop.className = 'wdg-mobile-backdrop';
    backdrop.type = 'button';
    backdrop.tabIndex = -1;
    backdrop.setAttribute('aria-label', isEnglish ? 'Close navigation' : 'Закрыть навигацию');
    backdrop.addEventListener('click', closeDrawer);

    const dock = document.createElement('nav');
    dock.className = 'wdg-mobile-dock';
    dock.setAttribute('aria-label', isEnglish ? 'Quick actions' : 'Быстрые действия');
    dock.innerHTML = [
      ['sections', 'tabler:apps', copy.sections],
      ['search', 'tabler:search', copy.search],
      ['timer', 'tabler:clock', copy.timer],
      ['settings', 'tabler:settings', copy.settings]
    ].map(item => '<button class="wdg-mobile-action" type="button" data-mobile-action="' + item[0] + '" aria-label="' + item[2] + '" title="' + item[2] + '">' + icon(item[1]) + '<span>' + item[2] + '</span></button>').join('');

    dock.addEventListener('click', event => {
      const button = event.target.closest('[data-mobile-action]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      closeDrawer();
      if (button.dataset.mobileAction === 'sections') openSections();
      if (button.dataset.mobileAction === 'search') {
        closePanels('search');
        runExisting('.search-fab', 'openSearch');
      }
      if (button.dataset.mobileAction === 'timer') {
        closePanels('timer');
        runExisting('.pomo-btn', 'togglePomo');
      }
      if (button.dataset.mobileAction === 'settings') {
        closePanels('settings');
        document.getElementById('settingsMini')?.classList.remove('wdgf-settings-top');
        runExisting('.settings-btn', 'toggleSettings');
      }
    });

    document.body.append(backdrop, dock);
    buildMobileTools(sidebar);

    const menuButton = document.getElementById('wdgMenuBtn');
    if (menuButton) {
      const replacement = menuButton.cloneNode(true);
      replacement.setAttribute('aria-expanded', 'false');
      replacement.setAttribute('aria-controls', 'wdgMobileNavigation');
      replacement.addEventListener('click', event => {
        if (!matchMedia('(max-width: 720px)').matches) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleDrawer();
      });
      menuButton.replaceWith(replacement);
      sidebar.id = 'wdgMobileNavigation';
    }

    sidebar.addEventListener('click', event => {
      if (event.target.closest('.wdg-nav-btn')) closeDrawer();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeDrawer();
    });

    matchMedia('(min-width: 721px)').addEventListener('change', event => {
      if (event.matches) closeDrawer();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
