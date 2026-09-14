(function () {
  'use strict';

  const isEnglish = document.documentElement.lang === 'en';
  const L = (en, ru) => isEnglish ? en : ru;
  const KEYS = {
    performance: 'wdg_performance_mode_v1',
    topics: 'wdg_topic_status_v1',
    collections: 'wdg_collections_v1'
  };
  const STATUS = {
    planned: L('Planned', 'В планах'),
    learning: L('Learning', 'Изучаю'),
    review: L('Review', 'Повторить'),
    done: L('Completed', 'Завершено'),
    paused: L('Paused', 'На паузе')
  };
  const CATEGORY = {
    all: L('All', 'Все'),
    lessons: L('Lessons', 'Уроки'),
    tools: L('Tools', 'Инструменты'),
    projects: L('Projects', 'Проекты'),
    notes: L('Notes', 'Заметки')
  };

  let paletteCategory = 'all';
  let settingsObserver;
  let drawerObserver;
  let drawerStateObserver;
  let profileObserver;
  let initialized = false;
  let paletteIndex = 0;
  let profileRefreshPending = false;

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function icon(name, size = 16) {
    return '<iconify-icon icon="' + esc(name) + '" width="' + size + '" height="' + size + '" aria-hidden="true"></iconify-icon>';
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    let toast = document.getElementById('wdglfToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wdglfToast';
      toast.className = 'wdglf-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function slug(value) {
    return String(value || '')
      .toLocaleLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90);
  }

  function effectivePerformance(mode) {
    if (mode !== 'auto') return mode;
    const constrained = window.matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)').matches;
    const weakMemory = Number(navigator.deviceMemory || 8) <= 4;
    const weakCpu = Number(navigator.hardwareConcurrency || 8) <= 4;
    return constrained || weakMemory || weakCpu ? 'lite' : 'full';
  }

  function applyPerformanceMode(mode = localStorage.getItem(KEYS.performance) || 'auto') {
    const valid = ['auto', 'full', 'lite'].includes(mode) ? mode : 'auto';
    const effective = effectivePerformance(valid);
    const root = document.documentElement;
    root.dataset.performanceMode = valid;
    root.dataset.performanceEffective = effective;
    root.classList.toggle('wdglf-performance-lite', effective === 'lite');
    root.classList.toggle('wdglf-performance-full', effective === 'full');
    document.querySelectorAll('[data-wdglf-performance]').forEach(button => {
      button.classList.toggle('active', button.dataset.wdglfPerformance === valid);
      button.setAttribute('aria-pressed', String(button.dataset.wdglfPerformance === valid));
    });
    document.querySelectorAll('[data-wdglf-performance-result]').forEach(node => {
      node.textContent = effective === 'lite'
        ? L('Simplified effects are active', 'Включены облегчённые эффекты')
        : L('Full effects are active', 'Включены полные эффекты');
    });
  }

  function performanceMarkup() {
    return '<section class="wdgr-settings-section wdglf-performance-settings">' +
      '<div class="wdgr-section-title"><div><h4>' + L('Performance', 'Производительность') + '</h4><p>' + L('Choose how many visual effects WebDevGym should use.', 'Выбери, сколько визуальных эффектов использовать WebDevGym.') + '</p></div></div>' +
      '<div class="wdglf-mode-grid">' +
        modeButton('auto', 'tabler:device-desktop-analytics', L('Auto', 'Авто'), L('Adapts to the device and reduced-motion setting.', 'Подстраивается под устройство и настройку уменьшения движения.')) +
        modeButton('full', 'tabler:sparkles', L('Full', 'Полный'), L('All animations, blur and graph effects.', 'Все анимации, размытие и эффекты графа.')) +
        modeButton('lite', 'tabler:bolt', L('Lite', 'Лёгкий'), L('Less motion and rendering work.', 'Меньше движения и нагрузки на отрисовку.')) +
      '</div><small class="wdglf-mode-result" data-wdglf-performance-result></small></section>';
  }

  function modeButton(id, iconName, title, copy) {
    return '<button type="button" class="wdglf-mode" data-wdglf-performance="' + id + '">' + icon(iconName, 19) + '<span><strong>' + title + '</strong><small>' + copy + '</small></span></button>';
  }

  function enhanceSettings() {
    const appearance = document.querySelector('#wdgrSettingsView [data-settings-page="appearance"]');
    if (!appearance || appearance.querySelector('.wdglf-performance-settings')) return;
    appearance.insertAdjacentHTML('beforeend', performanceMarkup());
    appearance.querySelectorAll('[data-wdglf-performance]').forEach(button => {
      button.addEventListener('click', () => {
        localStorage.setItem(KEYS.performance, button.dataset.wdglfPerformance);
        applyPerformanceMode(button.dataset.wdglfPerformance);
      });
    });
    applyPerformanceMode();
  }

  function paletteCategoryFor(button) {
    const id = button.dataset.commandId || '';
    const group = (button.querySelector('small')?.textContent || '').toLocaleLowerCase();
    if (id.startsWith('lesson-') || id.startsWith('section-') || /lesson|урок|section|раздел/.test(group)) return 'lessons';
    if (/profile|portfolio|project|forge|playground|github|проект|портфолио/.test(id + ' ' + group)) return 'projects';
    if (/diary|note|bookmark|замет|дневник/.test(id + ' ' + group)) return 'notes';
    return 'tools';
  }

  function applyPaletteCategory() {
    const palette = document.getElementById('wdgfPalette');
    if (!palette) return;
    palette.querySelectorAll('.wdglf-search-tabs button').forEach(button => {
      button.classList.toggle('active', button.dataset.paletteCategory === paletteCategory);
      button.setAttribute('aria-selected', String(button.dataset.paletteCategory === paletteCategory));
    });
    const commands = [...palette.querySelectorAll('.wdgf-command')];
    commands.forEach(button => {
      const visible = paletteCategory === 'all' || paletteCategoryFor(button) === paletteCategory;
      button.hidden = !visible;
      button.classList.remove('active');
    });
    const visible = commands.filter(button => !button.hidden);
    paletteIndex = 0;
    visible[0]?.classList.add('active');
    let empty = palette.querySelector('.wdglf-palette-empty');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'wdglf-palette-empty wdgf-empty';
      empty.textContent = L('Nothing in this category yet.', 'В этой категории пока ничего нет.');
      palette.querySelector('[data-command-list]')?.appendChild(empty);
    }
    empty.hidden = visible.length > 0;
  }

  function enhancePalette() {
    const palette = document.getElementById('wdgfPalette');
    if (!palette || palette.querySelector('.wdglf-search-tabs')) return;
    const tabs = document.createElement('nav');
    tabs.className = 'wdglf-search-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.innerHTML = Object.entries(CATEGORY).map(([id, label]) => '<button type="button" role="tab" data-palette-category="' + id + '">' + esc(label) + '</button>').join('');
    palette.querySelector('.wdgf-palette-search')?.after(tabs);
    tabs.addEventListener('click', event => {
      const button = event.target.closest('[data-palette-category]');
      if (!button) return;
      paletteCategory = button.dataset.paletteCategory;
      applyPaletteCategory();
    });
    palette.querySelector('input')?.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        event.stopImmediatePropagation();
        const ids = Object.keys(CATEGORY);
        const direction = event.shiftKey ? -1 : 1;
        paletteCategory = ids[(ids.indexOf(paletteCategory) + direction + ids.length) % ids.length];
        applyPaletteCategory();
        return;
      }

      if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
      const visible = [...palette.querySelectorAll('.wdgf-command')].filter(button => !button.hidden);
      if (!visible.length) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.key === 'Enter') {
        visible[Math.min(paletteIndex, visible.length - 1)]?.click();
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      paletteIndex = (paletteIndex + direction + visible.length) % visible.length;
      visible.forEach((button, index) => button.classList.toggle('active', index === paletteIndex));
      visible[paletteIndex]?.scrollIntoView({ block: 'nearest' });
    }, true);
    new MutationObserver(applyPaletteCategory).observe(palette.querySelector('[data-command-list]'), { childList: true });
    applyPaletteCategory();
  }

  function blockTitle(block) {
    const title = block?.querySelector('.block-title');
    if (!title) return '';
    const clone = title.cloneNode(true);
    clone.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions').forEach(node => node.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function lessonRecord(block) {
    const section = block?.closest('.section');
    const title = blockTitle(block);
    const sectionId = section?.id?.replace(/^sec-/, '') || 'lesson';
    return { id: sectionId + ':' + slug(title), title, sectionId };
  }

  function topics() {
    return readJson(KEYS.topics, {});
  }

  function collections() {
    return readJson(KEYS.collections, []);
  }

  function ensureDefaultCollection() {
    const list = collections();
    if (list.length) return list;
    const initial = [{ id: 'favorites', name: L('Favorites', 'Избранное'), createdAt: Date.now() }];
    writeJson(KEYS.collections, initial);
    return initial;
  }

  function saveTopic(record, patch) {
    const data = topics();
    data[record.id] = { ...data[record.id], ...record, ...patch, updatedAt: Date.now() };
    writeJson(KEYS.topics, data);
    window.dispatchEvent(new CustomEvent('webdevgym:library-updated'));
  }

  function relatedBlocks(block) {
    const section = block.closest('.section');
    const blocks = [...(section?.querySelectorAll(':scope > .block') || [])].filter(item => blockTitle(item));
    const index = blocks.indexOf(block);
    return {
      previous: index > 0 ? blocks[index - 1] : null,
      next: index >= 0 && index < blocks.length - 1 ? blocks[index + 1] : null,
      related: blocks.filter(item => item !== block).slice(Math.max(0, index - 2), index + 3).slice(0, 3)
    };
  }

  function relationButton(label, block, kind) {
    if (!block) return '';
    return '<button type="button" data-wdglf-related="' + kind + '" data-topic-title="' + esc(blockTitle(block)) + '"><small>' + esc(label) + '</small><strong>' + esc(blockTitle(block)) + '</strong>' + icon('tabler:arrow-right', 15) + '</button>';
  }

  function enhanceLearningDrawer() {
    const drawer = document.getElementById('wdgfLearningDrawer');
    if (!drawer?.classList.contains('open') || drawer.querySelector('.wdglf-lesson-tools')) return;
    const title = drawer.querySelector('.wdgf-drawer-head h2')?.textContent.trim();
    if (!title) return;
    const block = [...document.querySelectorAll('.section > .block')].find(item => blockTitle(item) === title);
    if (!block) return;
    const record = lessonRecord(block);
    const current = topics()[record.id] || {};
    const list = ensureDefaultCollection();
    const links = relatedBlocks(block);
    const tools = document.createElement('section');
    tools.className = 'wdglf-lesson-tools';
    tools.innerHTML = '<div class="wdglf-lesson-controls"><label><span>' + L('Learning status', 'Статус изучения') + '</span><select data-wdglf-status>' +
      Object.entries(STATUS).map(([id, label]) => '<option value="' + id + '" ' + (current.status === id ? 'selected' : '') + '>' + esc(label) + '</option>').join('') +
      '</select></label><label><span>' + L('Collection', 'Подборка') + '</span><select data-wdglf-collection><option value="">' + L('Not added', 'Не добавлено') + '</option>' +
      list.map(item => '<option value="' + esc(item.id) + '" ' + ((current.collectionIds || []).includes(item.id) ? 'selected' : '') + '>' + esc(item.name) + '</option>').join('') +
      '</select></label></div>' +
      '<div class="wdglf-related"><h3>' + L('Learning path', 'Связи темы') + '</h3><div>' +
      relationButton(L('Previous', 'До этого'), links.previous, 'previous') +
      relationButton(L('Next', 'Дальше'), links.next, 'next') +
      links.related.map((item, index) => relationButton(L('Related', 'Рядом'), item, 'related-' + index)).join('') + '</div></div>';
    drawer.querySelector('.wdgf-drawer-foot')?.before(tools);
    tools.querySelector('[data-wdglf-status]').addEventListener('change', event => {
      saveTopic(record, { status: event.target.value });
      notify(L('Status saved', 'Статус сохранён'));
    });
    tools.querySelector('[data-wdglf-collection]').addEventListener('change', event => {
      saveTopic(record, { collectionIds: event.target.value ? [event.target.value] : [] });
      notify(L('Collection updated', 'Подборка обновлена'));
    });
    tools.querySelectorAll('[data-wdglf-related]').forEach(button => button.addEventListener('click', () => {
      const target = [...document.querySelectorAll('.section > .block')].find(item => blockTitle(item) === button.dataset.topicTitle);
      if (target) window.WebDevGymLearning?.open?.(target);
    }));
  }

  function libraryBody() {
    const topicMap = topics();
    const items = Object.values(topicMap).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    const list = ensureDefaultCollection();
    const counts = Object.keys(STATUS).map(id => '<button type="button" data-library-filter="' + id + '"><strong>' + items.filter(item => item.status === id).length + '</strong><span>' + STATUS[id] + '</span></button>').join('');
    return '<div class="wdglf-library">' +
      '<section class="wdglf-library-summary"><div><span>' + L('Local learning library', 'Локальная библиотека') + '</span><h2>' + L('Keep topics in order', 'Собери темы по смыслу') + '</h2><p>' + L('Statuses and collections are stored only in this browser and included in export.', 'Статусы и подборки хранятся только в этом браузере и входят в экспорт.') + '</p></div><div class="wdglf-library-stats">' + counts + '</div></section>' +
      '<div class="wdglf-library-layout"><aside><div class="wdglf-section-title"><h3>' + L('Collections', 'Подборки') + '</h3><button type="button" data-library-add title="' + L('New collection', 'Новая подборка') + '">' + icon('tabler:plus', 16) + '</button></div><button class="active" type="button" data-collection-filter="all">' + icon('tabler:library', 16) + '<span>' + L('All topics', 'Все темы') + '</span><small>' + items.length + '</small></button>' +
      list.map(item => '<button type="button" data-collection-filter="' + esc(item.id) + '">' + icon('tabler:folder', 16) + '<span>' + esc(item.name) + '</span><small>' + items.filter(topic => (topic.collectionIds || []).includes(item.id)).length + '</small></button>').join('') + '</aside>' +
      '<main><div class="wdglf-library-toolbar"><label>' + icon('tabler:search', 16) + '<input type="search" data-library-search placeholder="' + L('Find a saved topic', 'Найти сохранённую тему') + '"></label><select data-library-status><option value="all">' + L('All statuses', 'Все статусы') + '</option>' + Object.entries(STATUS).map(([id, label]) => '<option value="' + id + '">' + esc(label) + '</option>').join('') + '</select></div>' +
      '<div class="wdglf-library-list" data-library-list>' + libraryCards(items) + '</div></main></div></div>';
  }

  function libraryCards(items) {
    if (!items.length) return '<div class="wdglf-library-empty">' + icon('tabler:library-plus', 28) + '<strong>' + L('Your library is empty', 'Библиотека пока пустая') + '</strong><p>' + L('Open any lesson and choose a status or collection.', 'Открой любой урок и выбери статус или подборку.') + '</p></div>';
    return items.map(item => '<article data-library-topic="' + esc(item.id) + '" data-status="' + esc(item.status || 'planned') + '" data-collections="' + esc((item.collectionIds || []).join(',')) + '"><div><span class="status-' + esc(item.status || 'planned') + '">' + esc(STATUS[item.status] || STATUS.planned) + '</span><small>' + esc(item.sectionId || '') + '</small></div><h3>' + esc(item.title) + '</h3><footer><time>' + new Date(item.updatedAt || Date.now()).toLocaleDateString(isEnglish ? 'en-GB' : 'ru-RU') + '</time><button type="button" data-library-open="' + esc(item.id) + '">' + L('Open', 'Открыть') + ' ' + icon('tabler:arrow-right', 15) + '</button></footer></article>').join('');
  }

  function bindLibrary(page) {
    let collectionFilter = 'all';
    let statusFilter = 'all';
    let query = '';
    const filter = () => {
      page.querySelectorAll('[data-library-topic]').forEach(card => {
        const matchesCollection = collectionFilter === 'all' || card.dataset.collections.split(',').includes(collectionFilter);
        const matchesStatus = statusFilter === 'all' || card.dataset.status === statusFilter;
        const matchesText = !query || card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !(matchesCollection && matchesStatus && matchesText);
      });
    };
    page.querySelectorAll('[data-collection-filter]').forEach(button => button.addEventListener('click', () => {
      collectionFilter = button.dataset.collectionFilter;
      page.querySelectorAll('[data-collection-filter]').forEach(item => item.classList.toggle('active', item === button));
      filter();
    }));
    page.querySelector('[data-library-status]').addEventListener('change', event => { statusFilter = event.target.value; filter(); });
    page.querySelector('[data-library-search]').addEventListener('input', event => { query = event.target.value.trim().toLocaleLowerCase(); filter(); });
    page.querySelectorAll('[data-library-filter]').forEach(button => button.addEventListener('click', () => {
      statusFilter = button.dataset.libraryFilter;
      page.querySelector('[data-library-status]').value = statusFilter;
      filter();
    }));
    page.querySelector('[data-library-add]').addEventListener('click', () => {
      const name = prompt(L('Collection name', 'Название подборки'))?.trim();
      if (!name) return;
      const list = collections();
      list.push({ id: 'collection-' + Date.now().toString(36), name: name.slice(0, 60), createdAt: Date.now() });
      writeJson(KEYS.collections, list);
      window.WebDevGymFeatures.open('library');
    });
    page.querySelectorAll('[data-library-open]').forEach(button => button.addEventListener('click', () => {
      const item = topics()[button.dataset.libraryOpen];
      const block = [...document.querySelectorAll('.section > .block')].find(candidate => blockTitle(candidate) === item?.title);
      if (block) window.WebDevGymLearning?.open?.(block);
      else notify(L('This topic is not available on the current page.', 'Эта тема не найдена на текущей странице.'));
    }));
  }

  function renderLibrary() {
    const page = window.WebDevGymFeatures.pageShell('library', L('Library', 'Библиотека'), L('Statuses, collections and your learning queue.', 'Статусы, подборки и очередь изучения.'), libraryBody());
    page.classList.add('wdglf-library-page');
    bindLibrary(page);
    return page;
  }

  function saveProjectOrder(grid, announce = true) {
    const ids = [...grid.querySelectorAll('.wdgp-project')].map(card => String(card.dataset.projectId));
    const current = readJson('wdg_portfolio_v1', []);
    const byId = new Map(current.map(item => [String(item.id), item]));
    const ordered = ids.map(id => byId.get(id)).filter(Boolean);
    current.forEach(item => { if (!ids.includes(String(item.id))) ordered.push(item); });
    writeJson('wdg_portfolio_v1', ordered);
    if (announce) notify(L('Project order saved', 'Порядок проектов сохранён'));
  }

  function projectRects(grid) {
    return new Map([...grid.querySelectorAll('.wdgp-project')].map(card => [card, card.getBoundingClientRect()]));
  }

  function animateProjectShift(grid, before) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    grid.querySelectorAll('.wdgp-project').forEach(card => {
      const previous = before.get(card);
      if (!previous || card.classList.contains('is-drag-source')) return;
      const next = card.getBoundingClientRect();
      const x = previous.left - next.left;
      const y = previous.top - next.top;
      if (!x && !y) return;
      const animation = card.animate(
        [{ transform: 'translate3d(' + x + 'px,' + y + 'px,0)' }, { transform: 'translate3d(0,0,0)' }],
        { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' }
      );
      animation.id = 'wdglf-project-shift';
    });
  }

  function cancelProjectShift(grid) {
    grid.querySelectorAll('.wdgp-project').forEach(card => {
      card.getAnimations().filter(animation => animation.id === 'wdglf-project-shift').forEach(animation => animation.cancel());
    });
  }

  function nearestProjectSlot(slots, clientX, clientY) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    slots.forEach((rect, index) => {
      const distance = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });
    return nearestIndex;
  }

  function bindProjectReorder(grid) {
    grid.querySelectorAll('.wdgp-project').forEach(card => {
      const heading = card.querySelector('.wdgp-project-heading');
      if (!heading || heading.querySelector('.wdglf-project-grip')) return;
      heading.insertAdjacentHTML('afterbegin', '<button class="wdglf-project-grip" type="button" title="' + L('Drag to reorder', 'Перетащи для сортировки') + '" aria-label="' + L('Drag to reorder', 'Перетащи для сортировки') + '">' + icon('tabler:grip-vertical', 16) + '</button>');
      const grip = heading.querySelector('.wdglf-project-grip');
      let drag = null;

      const createDragPreview = state => {
        const preview = card.cloneNode(true);
        preview.classList.remove('is-drag-source');
        preview.classList.add('wdglf-project-drag-preview');
        preview.removeAttribute('data-project-id');
        preview.setAttribute('aria-hidden', 'true');
        preview.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
        preview.querySelectorAll('button, a, input, select, textarea, video').forEach(element => {
          element.tabIndex = -1;
          if ('inert' in element) element.inert = true;
        });
        preview.querySelectorAll('video').forEach(video => {
          video.pause();
          video.muted = true;
          video.preload = 'none';
        });
        Object.assign(preview.style, {
          left: state.originRect.left + 'px',
          top: state.originRect.top + 'px',
          width: state.originRect.width + 'px',
          height: state.originRect.height + 'px',
          transform: 'translate3d(0,0,0) scale(1.015)'
        });
        document.body.appendChild(preview);
        return preview;
      };

      const activateDrag = state => {
        state.active = true;
        state.preview = createDragPreview(state);
        card.classList.add('is-drag-source');
        grid.classList.add('is-reordering');
        document.documentElement.classList.add('wdglf-project-drag-active');
      };

      const applyPendingReorder = () => {
        if (!drag?.active || drag.pendingTargetIndex === null) return;
        drag.reorderFrame = 0;
        const targetIndex = drag.pendingTargetIndex;
        drag.pendingTargetIndex = null;
        const cards = [...grid.querySelectorAll('.wdgp-project')];
        const currentIndex = cards.indexOf(card);
        if (currentIndex === targetIndex) return;
        const before = projectRects(grid);
        cancelProjectShift(grid);
        const remaining = cards.filter(candidate => candidate !== card);
        grid.insertBefore(card, remaining[targetIndex] || null);
        animateProjectShift(grid, before);
      };

      const applyPendingDragPoint = () => {
        if (!drag?.active || !drag.pendingPoint) return;
        drag.frame = 0;
        const point = drag.pendingPoint;
        drag.pendingPoint = null;
        drag.lastPoint = point;
        const dx = point.x - drag.startX;
        const dy = point.y - drag.startY;
        drag.preview.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) scale(1.015)';

        const draggedCenterX = drag.originRect.left + dx + drag.originRect.width / 2;
        const draggedCenterY = drag.originRect.top + dy + drag.originRect.height / 2;
        const cards = [...grid.querySelectorAll('.wdgp-project')];
        const currentIndex = cards.indexOf(card);
        const targetIndex = nearestProjectSlot(drag.slots, draggedCenterX, draggedCenterY);
        drag.pendingTargetIndex = targetIndex;
        if (currentIndex === targetIndex) return;
        if (!drag.reorderFrame) drag.reorderFrame = requestAnimationFrame(applyPendingReorder);
      };

      const trackDrag = event => {
        if (!drag || drag.pointerId !== event.pointerId || drag.finishing) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.active && Math.hypot(dx, dy) < 6) return;
        if (!drag.active) activateDrag(drag);
        event.preventDefault();
        drag.pendingPoint = { x: event.clientX, y: event.clientY };
        if (!drag.frame) drag.frame = requestAnimationFrame(applyPendingDragPoint);
      };

      grip.addEventListener('keydown', event => {
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const sibling = event.key === 'ArrowUp' ? card.previousElementSibling : card.nextElementSibling;
        if (!sibling) return;
        const before = projectRects(grid);
        cancelProjectShift(grid);
        if (event.key === 'ArrowUp') grid.insertBefore(card, sibling);
        else grid.insertBefore(sibling, card);
        animateProjectShift(grid, before);
        saveProjectOrder(grid);
        grip.focus();
      });

      grip.addEventListener('pointerdown', event => {
        if (event.button !== 0 || pageIsPublic(card)) return;
        event.preventDefault();
        document.querySelectorAll('.wdglf-project-drag-preview').forEach(preview => preview.remove());
        grid.querySelectorAll('.wdgp-project.is-drag-source').forEach(project => project.classList.remove('is-drag-source'));
        grid.classList.remove('is-reordering');
        document.documentElement.classList.remove('wdglf-project-drag-active');
        drag = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originRect: card.getBoundingClientRect(),
          slots: [...grid.querySelectorAll('.wdgp-project')].map(project => project.getBoundingClientRect()),
          originalOrder: [...grid.querySelectorAll('.wdgp-project')],
          pendingPoint: null,
          lastPoint: { x: event.clientX, y: event.clientY },
          frame: 0,
          reorderFrame: 0,
          pendingTargetIndex: null,
          active: false,
          finishing: false,
          preview: null
        };
        try {
          grip.setPointerCapture?.(event.pointerId);
        } catch (_) {}
        window.addEventListener('pointermove', trackDrag, { capture: true });
        window.addEventListener('pointerup', finishDrag, { capture: true, once: true });
        window.addEventListener('pointercancel', finishDrag, { capture: true, once: true });
      });

      const finishDrag = event => {
        if (!drag || drag.pointerId !== event.pointerId || drag.finishing) return;
        window.removeEventListener('pointermove', trackDrag, true);
        window.removeEventListener('pointerup', finishDrag, true);
        window.removeEventListener('pointercancel', finishDrag, true);
        const state = drag;
        if (state.frame) cancelAnimationFrame(state.frame);
        if (state.reorderFrame) cancelAnimationFrame(state.reorderFrame);
        state.frame = 0;
        state.reorderFrame = 0;
        applyPendingDragPoint();
        applyPendingReorder();
        state.finishing = true;
        try {
          if (grip.hasPointerCapture?.(event.pointerId)) grip.releasePointerCapture(event.pointerId);
        } catch (_) {}
        if (!state.active) {
          drag = null;
          return;
        }

        if (event.type === 'pointercancel') {
          const before = projectRects(grid);
          cancelProjectShift(grid);
          state.originalOrder.forEach(project => grid.appendChild(project));
          animateProjectShift(grid, before);
        }

        const finalRect = card.getBoundingClientRect();
        const point = state.lastPoint;
        const fromX = point.x - state.startX;
        const fromY = point.y - state.startY;
        const toX = finalRect.left - state.originRect.left;
        const toY = finalRect.top - state.originRect.top;
        const animation = state.preview.animate([
          { transform: 'translate3d(' + fromX + 'px,' + fromY + 'px,0) scale(1.015)' },
          { transform: 'translate3d(' + toX + 'px,' + toY + 'px,0) scale(1)' }
        ], {
          duration: 240,
          easing: 'cubic-bezier(.22,1,.36,1)'
        });
        animation.finished.catch(() => {}).finally(() => {
          state.preview.remove();
          card.classList.remove('is-drag-source');
          grid.classList.remove('is-reordering');
          document.documentElement.classList.remove('wdglf-project-drag-active');
          drag = null;
        });
        if (event.type !== 'pointercancel') saveProjectOrder(grid);
      };

      grip.addEventListener('pointerup', finishDrag);
      grip.addEventListener('pointercancel', finishDrag);
    });
  }

  function pageIsPublic(element) {
    return Boolean(element.closest('.wdgp-page.wdglf-public-preview'));
  }

  function refreshProfile() {
    const page = document.querySelector('.wdgp-page');
    if (!page) return;
    const actions = page.querySelector('.wdgp-cover-actions');
    const cover = page.querySelector('.wdgp-cover');
    if (actions && !actions.querySelector('[data-profile-public-preview]')) {
      page.classList.remove('wdglf-public-preview');
      const preview = document.createElement('button');
      preview.className = 'wdgp-btn';
      preview.type = 'button';
      preview.dataset.profilePublicPreview = '';
      preview.innerHTML = icon('tabler:eye', 16) + ' ' + L('Public preview', 'Как видят другие');
      actions.prepend(preview);
      preview.addEventListener('click', () => {
        page.classList.add('wdglf-public-preview');
        cover?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    if (cover && !cover.querySelector('[data-exit-public-preview]')) {
      const exit = document.createElement('button');
      exit.type = 'button';
      exit.className = 'wdglf-public-exit';
      exit.dataset.exitPublicPreview = '';
      exit.innerHTML = icon('tabler:arrow-left', 17) + ' ' + L('Edit profile', 'В редактор');
      cover.appendChild(exit);
      exit.addEventListener('click', () => page.classList.remove('wdglf-public-preview'));
    }

    const grid = page.querySelector('.wdgp-project-grid');
    if (grid) bindProjectReorder(grid);
  }

  function scheduleProfileRefresh() {
    if (profileRefreshPending) return;
    if (!document.querySelector('.wdgp-page')) return;
    profileRefreshPending = true;
    requestAnimationFrame(() => {
      profileRefreshPending = false;
      refreshProfile();
    });
  }

  function observeDynamicUi() {
    settingsObserver = new MutationObserver(() => { enhanceSettings(); enhancePalette(); });
    settingsObserver.observe(document.body, { childList: true, subtree: true });
    const watchLearningDrawer = () => {
      const drawer = document.getElementById('wdgfLearningDrawer');
      if (!drawer || drawer.dataset.wdglfObserved) return;
      drawer.dataset.wdglfObserved = 'true';
      drawerStateObserver?.disconnect();
      drawerStateObserver = new MutationObserver(enhanceLearningDrawer);
      drawerStateObserver.observe(drawer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
      enhanceLearningDrawer();
    };
    watchLearningDrawer();
    drawerObserver = new MutationObserver(mutations => {
      if (mutations.some(mutation => Array.from(mutation.addedNodes).some(node =>
        node instanceof Element && (node.id === 'wdgfLearningDrawer' || node.querySelector?.('#wdgfLearningDrawer'))
      ))) watchLearningDrawer();
    });
    drawerObserver.observe(document.body, { childList: true, subtree: true });
    profileObserver = new MutationObserver(mutations => {
      const profileChanged = mutations.some(mutation => {
        if (mutation.target instanceof Element && mutation.target.closest('.wdgp-page')) return true;
        return Array.from(mutation.addedNodes).some(node => {
          if (!(node instanceof Element)) return false;
          return node.matches('.wdgp-page, .wdgp-page *') || Boolean(node.querySelector?.('.wdgp-page'));
        });
      });
      if (profileChanged) scheduleProfileRefresh();
    });
    profileObserver.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    if (!window.WebDevGymFeatures?.register) {
      setTimeout(init, 100);
      return;
    }
    if (initialized) return;
    initialized = true;
    applyPerformanceMode();
    ensureDefaultCollection();
    observeDynamicUi();
    enhanceSettings();
    enhancePalette();
    scheduleProfileRefresh();
    window.WebDevGymFeatures.register('library', renderLibrary, {
      title: L('Library', 'Библиотека'),
      label: L('Library', 'Библиотека'),
      icon: 'tabler:library',
      group: L('Learning', 'Обучение')
    });
    window.matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)').addEventListener?.('change', () => applyPerformanceMode());
    window.addEventListener('storage', event => {
      if (event.key === KEYS.performance) applyPerformanceMode();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 180));
  else setTimeout(init, 180);
})();
