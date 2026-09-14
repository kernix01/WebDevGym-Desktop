(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') ||
    /index-en\.html$/i.test(location.pathname) ||
    /(?:^|\/)WebDevGym-EN(?:\/|$)/i.test(location.pathname);
  const ui = isEnglish ? {
    all: 'All topics', collapse: 'Collapse', next: 'Next', current: 'In progress',
    license: 'All rights reserved', topics: 'topics'
  } : {
    all: 'Все темы', collapse: 'Свернуть', next: 'Дальше', current: 'Изучается',
    license: 'Все права защищены', topics: 'тем'
  };
  let expanded = false;
  let lastSectionId = '';
  let selectedIndex = 0;

  function activeSection() {
    return document.querySelector('.section.active') || document.querySelector('.section');
  }

  function blocks(section) {
    return Array.from(section?.querySelectorAll(':scope > .block, :scope > .tool-block') || []);
  }

  function titleOf(block, index) {
    const title = block.querySelector('.block-title, h3, h2');
    if (!title) return (isEnglish ? 'Topic ' : 'Тема ') + (index + 1);
    const clone = title.cloneNode(true);
    clone.querySelectorAll('.badge,.anchor-icon,button').forEach(el => el.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function renderTopicList() {
    const section = activeSection();
    const list = document.getElementById('wdgLessonList');
    const toggle = document.getElementById('wdgSeeAll');
    if (!section || !list || !toggle) return;

    const sectionId = section.id || '';
    if (sectionId !== lastSectionId) {
      expanded = false;
      selectedIndex = 0;
      lastSectionId = sectionId;
    }

    const allBlocks = blocks(section);
    const visible = expanded ? allBlocks : allBlocks.slice(0, 7);
    list.classList.toggle('expanded', expanded);
    toggle.textContent = expanded ? ui.collapse : ui.all + (allBlocks.length > 7 ? ' (' + allBlocks.length + ')' : '');

    if (!visible.length) return;
    list.innerHTML = visible.map((block, index) => {
      const realIndex = allBlocks.indexOf(block);
      const active = realIndex === selectedIndex;
      return '<button class="wdg-lesson-row ' + (active ? 'active' : '') + '" type="button" data-topic-index="' + realIndex + '">' +
        '<span><iconify-icon icon="' + (active ? 'tabler:player-play-filled' : 'tabler:circle') + '" width="13" height="13"></iconify-icon></span>' +
        '<span>' + (realIndex + 1) + '. ' + titleOf(block, realIndex) + '</span>' +
        '<small>' + (active ? ui.current : ui.next) + '</small></button>';
    }).join('');

    list.querySelectorAll('[data-topic-index]').forEach(button => {
      button.addEventListener('click', () => {
        selectedIndex = Number(button.dataset.topicIndex);
        allBlocks[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        renderTopicList();
      });
    });
  }

  function configureLanguages() {
    document.documentElement.lang = isEnglish ? 'en' : 'ru';
    try { localStorage.setItem('webdevgym_main_lang', isEnglish ? 'en' : 'ru'); } catch (e) {}

    const local = location.hostname === '127.0.0.1' || location.hostname === 'localhost' || location.protocol === 'file:';
    const ru = document.querySelector('.wdg-lang a:first-of-type');
    const en = document.querySelector('.wdg-lang a:last-of-type');
    if (ru) ru.href = local ? 'index.html' : 'https://kernix01.github.io/WebDevGym/';
    if (en) en.href = local ? 'index-en.html' : 'https://kernix01.github.io/WebDevGym-EN/';
  }

  function buildFooter() {
    const wrap = document.querySelector('.wrap');
    if (!wrap || document.querySelector('.wdg-license-footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'wdg-license-footer';
    footer.innerHTML = '<span><strong>WebDevGym</strong> © ' + new Date().getFullYear() + ' · ' + ui.license + '</span>' +
      '<span><a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GNU GPL v3</a></span>';
    wrap.appendChild(footer);
  }

  function bindControls() {
    const toggle = document.getElementById('wdgSeeAll');
    if (toggle) {
      toggle.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        expanded = !expanded;
        renderTopicList();
      }, true);
    }

    document.addEventListener('click', event => {
      if (event.target.closest('[data-wdg-nav], .tab, #wdgPrev, #wdgNext')) {
        setTimeout(renderTopicList, 60);
      }
    });

    document.querySelectorAll('.section').forEach(section => {
      new MutationObserver(() => {
        if (section.classList.contains('active')) setTimeout(renderTopicList, 20);
      }).observe(section, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function init() {
    configureLanguages();
    buildFooter();
    bindControls();
    renderTopicList();
    setTimeout(renderTopicList, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

