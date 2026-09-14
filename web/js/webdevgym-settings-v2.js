(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const labels = isEnglish ? {
    eyebrow: 'Workspace preferences',
    navigation: 'Settings sections',
    preview: 'Live preview',
    applied: 'Applied instantly'
  } : {
    eyebrow: 'Параметры пространства',
    navigation: 'Разделы настроек',
    preview: 'Живой предпросмотр',
    applied: 'Применяется сразу'
  };

  function decorate() {
    const view = document.getElementById('wdgrSettingsView');
    if (!view || view.classList.contains('wdgr-settings-v2-ready')) return false;

    view.classList.add('wdgr-settings-v2-ready');
    const heading = view.querySelector('.wdgr-settings-header > div:first-child');
    const nav = view.querySelector('.wdgr-settings-nav');
    const preview = view.querySelector('.wdgr-settings-preview');
    if (heading) heading.dataset.settingsEyebrow = labels.eyebrow;
    if (nav) nav.dataset.settingsNavLabel = labels.navigation;
    if (preview) preview.dataset.settingsPreviewLabel = labels.preview;

    view.querySelectorAll('.wdgr-page-heading').forEach(item => {
      item.dataset.settingsStatus = labels.applied;
    });

    view.querySelectorAll('[data-settings-category]').forEach(button => {
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(button.classList.contains('active')));
    });

    nav?.addEventListener('click', event => {
      const button = event.target.closest('[data-settings-category]');
      if (!button) return;
      view.querySelectorAll('[data-settings-category]').forEach(item => {
        item.setAttribute('aria-selected', String(item === button));
      });
      if (window.innerWidth <= 900) button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });

    return true;
  }

  function init() {
    if (decorate()) return;
    const observer = new MutationObserver(() => {
      if (decorate()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
