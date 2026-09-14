(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') ||
    /index-en\.html$/i.test(location.pathname) ||
    /(?:^|\/)WebDevGym-EN(?:\/|$)/i.test(location.pathname);
  const copy = isEnglish ? {
    library: 'All sections', search: 'Find a section...', close: 'Close', next: 'Next', current: 'In progress', lessons: 'Learning paths', tools: 'Tools'
  } : {
    library: 'Все разделы', search: 'Найти раздел...', close: 'Закрыть', next: 'Дальше', current: 'Изучается', lessons: 'Учебные разделы', tools: 'Инструменты'
  };
  let currentIndex = 0;
  let currentSectionId = '';

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function activeSection() {
    return document.querySelector('.section.active') || document.querySelector('.section');
  }

  function sectionBlocks() {
    return Array.from(activeSection()?.querySelectorAll(':scope > .block, :scope > .tool-block') || []);
  }

  function cleanTabLabel(tab) {
    const clone = tab.cloneNode(true);
    clone.querySelectorAll('.tab-badge,img').forEach(el => el.remove());
    return clone.textContent.replace(/\s+/g, ' ').replace(/^[^\p{L}\p{N}]+/u, '').trim();
  }

  function buildLibrary(){
    const sidebarNav = document.querySelector('.wdg-side-nav');
    if (!sidebarNav || document.getElementById('wdgLibraryBtn')) return;
    const button = document.createElement('button');
    button.className = 'wdg-nav-btn';
    button.id = 'wdgLibraryBtn';
    button.type = 'button';
    button.innerHTML = icon('tabler:apps', 19) + '<span>' + copy.library + '</span>';
    const nexusButton = sidebarNav.querySelector('[data-wdg-nav="nexus"]');
    sidebarNav.insertBefore(button, nexusButton || null);

    const backdrop = document.createElement('div');
    backdrop.className = 'wdg-library-backdrop';
    const panel = document.createElement('section');
    panel.className = 'wdg-library-panel';
    panel.setAttribute('aria-label', copy.library);
    panel.innerHTML = '<div class="wdg-library-head"><h2>' + copy.library + '</h2><button type="button" id="wdgLibraryClose" title="' + copy.close + '">' + icon('tabler:x', 19) + '</button></div>' +
      '<div class="wdg-library-switch"><button type="button" class="active" data-library-mode="lessons">' + icon('tabler:book-2',16) + copy.lessons + '</button><button type="button" data-library-mode="tools">' + icon('tabler:tool',16) + copy.tools + '</button></div>' +
      '<input class="wdg-library-search" id="wdgLibrarySearch" type="search" placeholder="' + copy.search + '">' +
      '<div class="wdg-library-grid" id="wdgLibraryGrid"></div>';
    document.body.append(backdrop, panel);

    const sourceTabs = Array.from(document.querySelectorAll('.tabs-nav .tab')).filter(tab => (tab.getAttribute('onclick') || '').includes('switchTab('));
    const seen = new Set();
    const lessonEntries = sourceTabs.map(tab => ({ target: tab, label: cleanTabLabel(tab), kind: 'lesson' })).filter(entry => {
      const key = entry.label.toLowerCase();
      if (!entry.label || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const grid = panel.querySelector('#wdgLibraryGrid');
    let mode = 'lessons';

    function toolEntries(){
      const ignored = new Set(['learn']);
      const toolSeen = new Set();
      return Array.from(document.querySelectorAll('.wdg-side-nav [data-wdg-nav]')).map(target => ({
        target,
        label: target.textContent.replace(/\s+/g,' ').trim(),
        kind: 'tool'
      })).filter(entry => {
        const id = entry.target.dataset.wdgNav || '';
        const key = entry.label.toLowerCase();
        if (!entry.label || ignored.has(id) || toolSeen.has(key)) return false;
        toolSeen.add(key);
        return true;
      });
    }

    function render(filter){
      const query = String(filter || '').trim().toLowerCase();
      const entries = mode === 'lessons' ? lessonEntries : toolEntries();
      grid.innerHTML = '';
      entries.filter(entry => !query || entry.label.toLowerCase().includes(query)).forEach(entry => {
        const item = document.createElement('button');
        item.className = 'wdg-library-item';
        item.type = 'button';
        item.innerHTML = icon(entry.kind === 'lesson' ? 'tabler:chevron-right' : 'tabler:arrow-up-right', 15) + '<span>' + entry.label + '</span>';
        item.addEventListener('click', () => {
          entry.target.click();
          close();
          currentIndex = 0;
          setTimeout(syncTopicNavigation, 80);
        });
        grid.appendChild(item);
      });
    }
    function open(){ panel.classList.add('open'); backdrop.classList.add('open'); button.classList.add('active'); panel.querySelector('#wdgLibrarySearch').focus(); render(panel.querySelector('#wdgLibrarySearch').value); }
    function close(){ panel.classList.remove('open'); backdrop.classList.remove('open'); button.classList.remove('active'); }

    button.addEventListener('click', open);
    backdrop.addEventListener('click', close);
    panel.querySelector('#wdgLibraryClose').addEventListener('click', close);
    panel.querySelector('#wdgLibrarySearch').addEventListener('input', event => render(event.target.value));
    panel.querySelector('.wdg-library-switch').addEventListener('click', event => {
      const modeButton = event.target.closest('[data-library-mode]');
      if (!modeButton) return;
      mode = modeButton.dataset.libraryMode;
      panel.querySelectorAll('[data-library-mode]').forEach(item => item.classList.toggle('active', item === modeButton));
      render(panel.querySelector('#wdgLibrarySearch').value);
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    render('');
  }

  function addTopActions() {
    const bar = document.querySelector('.wdg-commandbar');
    const exportButton = document.getElementById('wdgExportBtn');
    if (!bar || !exportButton || document.getElementById('wdgImportBtn')) return;

    const ai = document.createElement('button');
    ai.className = 'wdg-icon-btn';
    ai.id = 'wdgAiBtn';
    ai.type = 'button';
    ai.title = isEnglish ? 'AI mentor' : 'ИИ-помощник';
    ai.innerHTML = icon('tabler:sparkles', 18);
    ai.addEventListener('click', () => document.querySelector('.ai-fab')?.click());

    const settings = document.createElement('button');
    settings.className = 'wdg-icon-btn desktop-only';
    settings.id = 'wdgSettingsBtn';
    settings.type = 'button';
    settings.title = isEnglish ? 'Settings' : 'Настройки';
    settings.innerHTML = icon('tabler:settings', 18);
    settings.addEventListener('click', () => document.querySelector('.settings-fab')?.click());

    const importButton = document.createElement('button');
    importButton.className = 'wdg-top-action desktop-only';
    importButton.id = 'wdgImportBtn';
    importButton.type = 'button';
    importButton.innerHTML = icon('tabler:upload', 15) + '<span>Import</span>';
    importButton.addEventListener('click', () => {
      if (typeof window.importProgressJson === 'function') window.importProgressJson();
    });

    bar.insertBefore(ai, bar.querySelector('.wdg-lang'));
    bar.insertBefore(settings, bar.querySelector('.wdg-lang'));
    bar.insertBefore(importButton, exportButton);
  }

  function ensureExpandedFor(index) {
    const list = document.getElementById('wdgLessonList');
    if (index < 7 || list?.classList.contains('expanded')) return;
    document.getElementById('wdgSeeAll')?.click();
  }

  function paintTopic(index) {
    ensureExpandedFor(index);
    const list = document.getElementById('wdgLessonList');
    if (!list) return;
    list.querySelectorAll('.wdg-lesson-row').forEach(row => {
      const active = Number(row.dataset.topicIndex) === index;
      row.classList.toggle('active', active);
      row.querySelector('small')?.replaceChildren(document.createTextNode(active ? copy.current : copy.next));
      const rowIcon = row.querySelector('iconify-icon');
      if (rowIcon) rowIcon.setAttribute('icon', active ? 'tabler:player-play-filled' : 'tabler:circle');
    });
    list.querySelector('[data-topic-index="' + index + '"]')?.scrollIntoView({ block: 'nearest' });
  }

  function goTo(index) {
    const blocks = sectionBlocks();
    if (!blocks.length) return;
    currentIndex = Math.max(0, Math.min(blocks.length - 1, index));
    blocks[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => paintTopic(currentIndex), 80);
  }

  function replaceDockButtons() {
    const oldPrevious = document.getElementById('wdgPrev');
    const oldNext = document.getElementById('wdgNext');
    if (!oldPrevious || !oldNext) return;
    const previous = oldPrevious.cloneNode(true);
    const next = oldNext.cloneNode(true);
    oldPrevious.replaceWith(previous);
    oldNext.replaceWith(next);
    previous.addEventListener('click', event => { event.stopPropagation(); goTo(currentIndex - 1); });
    next.addEventListener('click', event => { event.stopPropagation(); goTo(currentIndex + 1); });

    const list = document.getElementById('wdgLessonList');
    list?.addEventListener('click', event => {
      const row = event.target.closest('[data-topic-index]');
      if (!row) return;
      event.preventDefault();
      event.stopPropagation();
      goTo(Number(row.dataset.topicIndex));
    }, true);
  }

  function syncTopicNavigation() {
    const section = activeSection();
    if (!section) return;
    if (section.id !== currentSectionId) currentIndex = 0;
    currentSectionId = section.id;
    setTimeout(() => paintTopic(currentIndex), 70);
  }

  function observeSections() {
    document.querySelectorAll('.section').forEach(section => {
      new MutationObserver(() => {
        if (section.classList.contains('active')) syncTopicNavigation();
      }).observe(section, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function init() {
    buildLibrary();
    addTopActions();
    replaceDockButtons();
    observeSections();
    syncTopicNavigation();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

