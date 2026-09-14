(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname);
  const L = (en, ru) => isEnglish ? en : ru;
  const NEXUS_KEY = 'webdevgym_nexus_notes_v1';
  const PLAYGROUND_SNAPSHOT_KEY = 'wdg_playground_snapshot_v2';
  const TRAINER_CODE_KEY = 'wdgr_trainer_code_v1';
  const TRAINER_SECTIONS = new Set(['html', 'css', 'js', 'ts', 'react', 'electron', 'git', 'node', 'sql', 'devops', 'linux', 'pg', 'vite', 'python', 'csharp']);
  const state = {
    nexusId: '',
    nexusFilter: '',
    nexusZoom: 1,
    nexusPanX: 0,
    nexusPanY: 0,
    graphPositions: {},
    calendarMode: 'month',
    calendarDate: localDateIso(new Date()),
    focusSeconds: 25 * 60,
    focusTimer: null,
    focusRunning: false,
    activeLearningSection: ''
  };

  const copy = {
    nexusTitle: L('Nexus workspace', 'Пространство Nexus'),
    nexusSub: L('Connect notes, lessons and ideas in one local knowledge graph.', 'Связывай заметки, уроки и идеи в одном локальном графе знаний.'),
    search: L('Search notes...', 'Поиск заметок...'),
    notes: L('Notes', 'Заметки'),
    newNote: L('New note', 'Новая заметка'),
    untitled: L('Untitled note', 'Новая заметка'),
    editor: L('Editor', 'Редактор'),
    preview: L('Preview', 'Просмотр'),
    properties: L('Properties', 'Свойства'),
    updated: L('Updated', 'Обновлено'),
    links: L('links', 'связей'),
    backlinks: L('Backlinks', 'Обратные ссылки'),
    related: L('Related lessons', 'Связанные уроки'),
    noBacklinks: L('No notes link here yet.', 'На эту заметку пока никто не ссылается.'),
    noRelated: L('Add a technology name to find related lessons.', 'Добавь название технологии, чтобы найти связанные уроки.'),
    graph: L('Knowledge graph', 'Граф знаний'),
    fit: L('Fit', 'Вписать'),
    save: L('Saved locally', 'Сохранено локально'),
    export: L('Export', 'Экспорт'),
    import: L('Import', 'Импорт'),
    delete: L('Delete', 'Удалить'),
    confirmDelete: L('Delete this note?', 'Удалить эту заметку?'),
    titlePlaceholder: L('Note title', 'Название заметки'),
    bodyPlaceholder: L('Write Markdown-lite and connect notes with [[links]].', 'Пиши в Markdown-lite и связывай заметки через [[ссылки]].'),
    learning: L('Learning workspace', 'Учебное пространство'),
    outline: L('Course outline', 'План раздела'),
    mastery: L('Mastery check', 'Проверка усвоения'),
    previous: L('Previous', 'Назад'),
    next: L('Next', 'Дальше'),
    topic: L('topic', 'тема'),
    topics: L('topics', 'тем'),
    playground: L('Playground workspace', 'Рабочее пространство Playground'),
    playgroundSub: L('Edit files, test responsive states and keep useful snapshots.', 'Редактируй файлы, проверяй адаптив и сохраняй полезные версии.'),
    files: L('Files', 'Файлы'),
    previewLabel: L('Preview', 'Предпросмотр'),
    console: L('Console', 'Консоль'),
    run: L('Run', 'Запустить'),
    snapshot: L('Snapshot', 'Версия'),
    restore: L('Restore', 'Восстановить'),
    fullscreen: L('Fullscreen', 'На весь экран'),
    saved: L('Saved', 'Сохранено'),
    edited: L('Unsaved changes', 'Есть изменения'),
    noSnapshot: L('Create a snapshot first.', 'Сначала сохрани версию.'),
    snapshotSaved: L('Playground snapshot saved.', 'Версия Playground сохранена.'),
    snapshotRestored: L('Snapshot restored.', 'Версия восстановлена.'),
    calendar: L('Development calendar', 'Календарь развития'),
    calendarSub: L('One study day, three rest days, with rescheduling and a focus timer.', 'Один учебный день, три дня отдыха, переносы и таймер фокуса.'),
    month: L('Month', 'Месяц'),
    week: L('Week', 'Неделя'),
    today: L('Today', 'Сегодня'),
    dailyPlan: L('Daily plan', 'План дня'),
    completeDay: L('Complete day', 'Завершить день'),
    reschedule: L('Reschedule', 'Перенести'),
    study: L('Study', 'Учёба'),
    rest: L('Rest', 'Отдых'),
    completed: L('Completed', 'Выполнено'),
    missed: L('Missed', 'Пропущено'),
    focus: L('Focus timer', 'Таймер фокуса'),
    start: L('Start', 'Старт'),
    pause: L('Pause', 'Пауза'),
    reset: L('Reset', 'Сброс'),
    noTasks: L('No tasks for this date.', 'На эту дату задач нет.'),
    trainers: L('Training queue', 'Очередь тренажёров'),
    trainersSub: L('Move from a small challenge to tests, console feedback and a finished solution.', 'Иди от небольшой задачи к тестам, обратной связи и готовому решению.'),
    routeEvidence: L('GitHub evidence', 'Подтверждение на GitHub'),
    routeUnlocked: L('Next unlocked', 'Следующее открыто'),
    routeTime: L('Estimated time', 'Оценка времени'),
    hours: L('hours', 'часов')
  };

  function localDateIso(date) {
    const value = date instanceof Date ? date : new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    const toast = document.createElement('div');
    toast.className = 'wdgr-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function defaultNotes() {
    const now = Date.now();
    return [
      {
        id: 'dom-' + now.toString(36),
        title: L('Interface', 'Интерфейс'),
        body: L(
          '# Interface\nThe visible part of the project and its behavior.\n\nRelated: [[Events]] and [[JavaScript]].',
          '# Интерфейс\nВидимая часть проекта и её поведение.\n\nСвязано с [[События]] и [[JavaScript]].'
        ),
        updatedAt: now
      },
      {
        id: 'events-' + (now + 1).toString(36),
        title: L('Events', 'События'),
        body: L(
          '# Events\nUser actions such as click, input and submit.\n\nEvents change the [[Interface]].',
          '# События\nДействия пользователя: click, input и submit.\n\nСобытия изменяют [[Интерфейс]].'
        ),
        updatedAt: now - 1000
      },
      {
        id: 'javascript-' + (now + 2).toString(36),
        title: 'JavaScript',
        body: L(
          '# JavaScript\nControls behavior and state in the browser.\n\nWorks with [[Interface]] and [[Events]].',
          '# JavaScript\nУправляет поведением и состоянием в браузере.\n\nРаботает с [[Интерфейс]] и [[События]].'
        ),
        updatedAt: now - 2000
      }
    ];
  }

  function loadNotes() {
    const saved = readJson(NEXUS_KEY, []);
    const notes = Array.isArray(saved) && saved.length ? saved : defaultNotes();
    if (!saved.length) writeJson(NEXUS_KEY, notes);
    return notes.map(note => ({
      id: String(note.id || crypto.randomUUID()),
      title: String(note.title || copy.untitled),
      body: String(note.body || ''),
      updatedAt: Number(note.updatedAt || Date.now())
    }));
  }

  function noteLinks(note) {
    return [...String(note?.body || '').matchAll(/\[\[([^\]]+)\]\]/g)]
      .map(match => match[1].trim())
      .filter(Boolean);
  }

  function noteByTitle(notes, title) {
    const wanted = String(title || '').trim().toLowerCase();
    return notes.find(note => note.title.trim().toLowerCase() === wanted);
  }

  function activeNote(notes) {
    return notes.find(note => note.id === state.nexusId) || notes[0] || null;
  }

  function nexusPreview(body, notes) {
    let html = escapeHtml(body);
    html = html.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
      const target = noteByTitle(notes, title);
      return '<button class="wdgr-note-link ' + (target ? '' : 'missing') + '" type="button" data-nexus-link="' +
        escapeHtml(target?.id || '') + '" data-nexus-title="' + escapeHtml(title) + '">[[' + escapeHtml(title) + ']]</button>';
    });
    return html
      .replace(/^### (.*)$/gm, '<h4>$1</h4>')
      .replace(/^## (.*)$/gm, '<h3>$1</h3>')
      .replace(/^# (.*)$/gm, '<h2>$1</h2>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function relatedLessons(note) {
    const words = (note.title + ' ' + note.body)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}+#.-]+/gu, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    const unique = [...new Set(words)];
    return Array.from(document.querySelectorAll('.section > .block')).map(block => {
      const title = block.querySelector('.block-title, h2, h3')?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const score = unique.filter(word => title.toLowerCase().includes(word)).length;
      return { block, title, score };
    }).filter(item => item.title && item.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  }

  function graphModel(notes) {
    const nodes = notes.map((note, index) => {
      const saved = state.graphPositions[note.id];
      const angle = index / Math.max(1, notes.length) * Math.PI * 2;
      return {
        id: note.id,
        title: note.title,
        x: saved?.x ?? 360 + Math.cos(angle) * Math.min(230, 90 + notes.length * 8),
        y: saved?.y ?? 240 + Math.sin(angle) * Math.min(170, 70 + notes.length * 6)
      };
    });
    const links = [];
    notes.forEach(note => {
      noteLinks(note).forEach(title => {
        const target = noteByTitle(notes, title);
        if (target && target.id !== note.id) links.push({ source: note.id, target: target.id });
      });
    });
    return { nodes, links };
  }

  function renderNexusGraph(root, notes) {
    const svg = root.querySelector('[data-nexus-svg]');
    if (!svg) return;
    const model = graphModel(notes);
    const nodeMap = new Map(model.nodes.map(node => [node.id, node]));
    const group = svg.querySelector('[data-graph-world]');
    group.setAttribute('transform', `translate(${state.nexusPanX} ${state.nexusPanY}) scale(${state.nexusZoom})`);
    group.innerHTML =
      '<g class="wdgr-graph-lines">' + model.links.map(link => {
        const a = nodeMap.get(link.source);
        const b = nodeMap.get(link.target);
        return `<line data-source="${escapeHtml(link.source)}" data-target="${escapeHtml(link.target)}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`;
      }).join('') + '</g>' +
      '<g class="wdgr-graph-nodes">' + model.nodes.map(node => {
        const active = node.id === state.nexusId ? ' active' : '';
        return `<g class="wdgr-graph-node${active}" data-graph-node="${escapeHtml(node.id)}" transform="translate(${node.x} ${node.y})">
          <circle r="${active ? 34 : 27}"></circle>
          <text text-anchor="middle" y="4">${escapeHtml(node.title.slice(0, 16))}</text>
        </g>`;
      }).join('') + '</g>';

    const mini = root.querySelector('[data-nexus-minimap]');
    if (mini) {
      mini.innerHTML = model.nodes.map(node =>
        `<i class="${node.id === state.nexusId ? 'active' : ''}" style="left:${Math.max(4, Math.min(92, node.x / 7.2))}%;top:${Math.max(6, Math.min(88, node.y / 5.1))}%"></i>`
      ).join('');
    }

    let dragged = null;
    group.querySelectorAll('[data-graph-node]').forEach(nodeEl => {
      nodeEl.addEventListener('pointerdown', event => {
        event.preventDefault();
        const node = nodeMap.get(nodeEl.dataset.graphNode);
        dragged = { node, startX: event.clientX, startY: event.clientY, x: node.x, y: node.y };
        nodeEl.setPointerCapture(event.pointerId);
      });
      nodeEl.addEventListener('pointermove', event => {
        if (!dragged || dragged.node.id !== nodeEl.dataset.graphNode) return;
        dragged.node.x = dragged.x + (event.clientX - dragged.startX) / state.nexusZoom;
        dragged.node.y = dragged.y + (event.clientY - dragged.startY) / state.nexusZoom;
        state.graphPositions[dragged.node.id] = { x: dragged.node.x, y: dragged.node.y };
        nodeEl.setAttribute('transform', `translate(${dragged.node.x} ${dragged.node.y})`);
        group.querySelectorAll(`line[data-source="${CSS.escape(dragged.node.id)}"]`).forEach(line => {
          line.setAttribute('x1', dragged.node.x);
          line.setAttribute('y1', dragged.node.y);
        });
        group.querySelectorAll(`line[data-target="${CSS.escape(dragged.node.id)}"]`).forEach(line => {
          line.setAttribute('x2', dragged.node.x);
          line.setAttribute('y2', dragged.node.y);
        });
      });
      nodeEl.addEventListener('pointerup', event => {
        if (dragged && Math.hypot(dragged.node.x - dragged.x, dragged.node.y - dragged.y) < 4) {
          state.nexusId = dragged.node.id;
          renderNexus(root);
        } else if (dragged) {
          writeJson('wdgr_nexus_graph_positions_v1', state.graphPositions);
          renderNexusGraph(root, notes);
        }
        if (nodeEl.hasPointerCapture(event.pointerId)) nodeEl.releasePointerCapture(event.pointerId);
        dragged = null;
      });
    });
  }

  function renderNexus(root) {
    const notes = loadNotes();
    if (!state.nexusId || !notes.some(note => note.id === state.nexusId)) state.nexusId = notes[0]?.id || '';
    const note = activeNote(notes);
    const filtered = notes.filter(item => {
      const haystack = (item.title + ' ' + item.body).toLowerCase();
      return !state.nexusFilter || haystack.includes(state.nexusFilter.toLowerCase());
    });
    const incoming = note ? notes.filter(item => item.id !== note.id && noteLinks(item).some(link => link.toLowerCase() === note.title.toLowerCase())) : [];
    const related = note ? relatedLessons(note) : [];

    root.innerHTML = `
      <div class="wdgr-page-head">
        <div><span class="wdgr-kicker">${icon('tabler:affiliate', 16)} Nexus</span><h1>${copy.nexusTitle}</h1><p>${copy.nexusSub}</p></div>
        <div class="wdgr-head-actions">
          <button type="button" class="wdgr-btn" data-nexus-import>${icon('tabler:upload', 16)} ${copy.import}</button>
          <button type="button" class="wdgr-btn" data-nexus-export>${icon('tabler:download', 16)} ${copy.export}</button>
        </div>
      </div>
      <div class="wdgr-nexus-layout">
        <aside class="wdgr-nexus-tree">
          <div class="wdgr-panel-head"><strong>${copy.notes}</strong><button type="button" class="wdgr-icon-btn" data-nexus-new title="${copy.newNote}">${icon('tabler:plus', 18)}</button></div>
          <label class="wdgr-search">${icon('tabler:search', 15)}<input type="search" value="${escapeHtml(state.nexusFilter)}" placeholder="${copy.search}" data-nexus-search></label>
          <div class="wdgr-note-list">${filtered.map(item => `
            <button type="button" class="wdgr-note-row ${item.id === state.nexusId ? 'active' : ''}" data-nexus-open="${escapeHtml(item.id)}">
              ${icon('tabler:file-text', 16)}
              <span><strong>${escapeHtml(item.title)}</strong><small>${noteLinks(item).length} ${copy.links}</small></span>
            </button>`).join('')}</div>
        </aside>
        <main class="wdgr-nexus-editor">
          <div class="wdgr-editor-toolbar">
            <span>${copy.editor}</span>
            <div><span class="wdgr-save-state">${icon('tabler:cloud-check', 15)} ${copy.save}</span><button type="button" class="wdgr-icon-btn danger" data-nexus-delete title="${copy.delete}">${icon('tabler:trash', 17)}</button></div>
          </div>
          <input class="wdgr-note-title-input" data-nexus-title value="${escapeHtml(note?.title || '')}" placeholder="${copy.titlePlaceholder}">
          <textarea class="wdgr-note-body" data-nexus-body placeholder="${copy.bodyPlaceholder}" spellcheck="false">${escapeHtml(note?.body || '')}</textarea>
          <div class="wdgr-note-properties">
            <span>${icon('tabler:clock', 14)} ${copy.updated}: ${note ? new Date(note.updatedAt).toLocaleString(isEnglish ? 'en-US' : 'ru-RU') : '—'}</span>
            <span>${icon('tabler:link', 14)} ${note ? noteLinks(note).length : 0} ${copy.links}</span>
          </div>
        </main>
        <aside class="wdgr-nexus-context">
          <section><div class="wdgr-panel-head"><strong>${copy.preview}</strong></div><div class="wdgr-markdown" data-nexus-preview>${note ? nexusPreview(note.body, notes) : ''}</div></section>
          <section><div class="wdgr-panel-head"><strong>${copy.backlinks}</strong><span>${incoming.length}</span></div><div class="wdgr-link-list">${incoming.length ? incoming.map(item => `<button type="button" data-nexus-open="${escapeHtml(item.id)}">${icon('tabler:corner-down-left', 14)} ${escapeHtml(item.title)}</button>`).join('') : `<p>${copy.noBacklinks}</p>`}</div></section>
          <section><div class="wdgr-panel-head"><strong>${copy.related}</strong><span>${related.length}</span></div><div class="wdgr-link-list">${related.length ? related.map(item => `<button type="button" data-lesson-target="${escapeHtml(item.block.closest('.section')?.id || '')}" data-lesson-title="${escapeHtml(item.title)}">${icon('tabler:book-2', 14)} ${escapeHtml(item.title)}</button>`).join('') : `<p>${copy.noRelated}</p>`}</div></section>
        </aside>
        <section class="wdgr-nexus-graph">
          <div class="wdgr-panel-head">
            <strong>${copy.graph}</strong>
            <div class="wdgr-graph-controls">
              <button type="button" class="wdgr-icon-btn" data-graph-zoom-out title="Zoom out">${icon('tabler:minus', 16)}</button>
              <button type="button" class="wdgr-icon-btn" data-graph-layout title="${L('Reset layout', 'Сбросить раскладку')}">${icon('tabler:refresh', 16)}</button>
              <button type="button" class="wdgr-icon-btn" data-graph-fit title="${copy.fit}">${icon('tabler:focus-centered', 16)}</button>
              <button type="button" class="wdgr-icon-btn" data-graph-zoom-in title="Zoom in">${icon('tabler:plus', 16)}</button>
            </div>
          </div>
          <div class="wdgr-graph-stage">
            <svg viewBox="0 0 720 480" data-nexus-svg aria-label="${copy.graph}"><g data-graph-world></g></svg>
            <div class="wdgr-minimap" data-nexus-minimap></div>
          </div>
        </section>
      </div>`;

    const persistEditor = debounce(() => {
      const current = loadNotes();
      const target = current.find(item => item.id === state.nexusId);
      if (!target) return;
      target.title = root.querySelector('[data-nexus-title]').value.trim() || copy.untitled;
      target.body = root.querySelector('[data-nexus-body]').value;
      target.updatedAt = Date.now();
      writeJson(NEXUS_KEY, current);
      renderNexus(root);
    }, 450);

    root.querySelector('[data-nexus-search]')?.addEventListener('input', event => {
      state.nexusFilter = event.target.value;
      renderNexus(root);
      requestAnimationFrame(() => {
        const input = root.querySelector('[data-nexus-search]');
        input?.focus();
        input?.setSelectionRange(state.nexusFilter.length, state.nexusFilter.length);
      });
    });
    root.querySelectorAll('[data-nexus-open]').forEach(button => button.addEventListener('click', () => {
      state.nexusId = button.dataset.nexusOpen;
      renderNexus(root);
    }));
    root.querySelector('[data-nexus-title]')?.addEventListener('input', persistEditor);
    root.querySelector('[data-nexus-body]')?.addEventListener('input', event => {
      root.querySelector('[data-nexus-preview]').innerHTML = nexusPreview(event.target.value, notes);
      persistEditor();
    });
    root.querySelector('[data-nexus-new]')?.addEventListener('click', () => {
      const current = loadNotes();
      const note = { id: 'note-' + Date.now().toString(36), title: copy.untitled, body: '', updatedAt: Date.now() };
      current.unshift(note);
      writeJson(NEXUS_KEY, current);
      state.nexusId = note.id;
      renderNexus(root);
      root.querySelector('[data-nexus-title]')?.select();
    });
    root.querySelector('[data-nexus-delete]')?.addEventListener('click', () => {
      if (!note || !confirm(copy.confirmDelete)) return;
      const current = loadNotes().filter(item => item.id !== note.id);
      writeJson(NEXUS_KEY, current.length ? current : defaultNotes());
      state.nexusId = '';
      renderNexus(root);
    });
    root.querySelectorAll('[data-nexus-link]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.nexusLink) {
        state.nexusId = button.dataset.nexusLink;
      } else {
        const current = loadNotes();
        const created = { id: 'note-' + Date.now().toString(36), title: button.dataset.nexusTitle || copy.untitled, body: '', updatedAt: Date.now() };
        current.unshift(created);
        writeJson(NEXUS_KEY, current);
        state.nexusId = created.id;
      }
      renderNexus(root);
    }));
    root.querySelectorAll('[data-lesson-target]').forEach(button => button.addEventListener('click', () => {
      const sectionId = button.dataset.lessonTarget.replace(/^sec-/, '');
      if (typeof window.switchTabByName === 'function') window.switchTabByName(sectionId);
      setTimeout(() => {
        const section = document.getElementById(button.dataset.lessonTarget);
        const target = Array.from(section?.querySelectorAll(':scope > .block') || []).find(block => block.textContent.includes(button.dataset.lessonTitle));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }));
    root.querySelector('[data-nexus-export]')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ version: 2, notes: loadNotes() }, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'webdevgym-nexus.json';
      link.click();
      URL.revokeObjectURL(link.href);
    });
    root.querySelector('[data-nexus-import]')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const payload = JSON.parse(String(reader.result || '{}'));
            if (!Array.isArray(payload.notes)) throw new Error('Invalid notes');
            writeJson(NEXUS_KEY, payload.notes);
            state.nexusId = '';
            renderNexus(root);
          } catch (error) {
            notify(L('Could not import notes.', 'Не получилось импортировать заметки.'));
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
    root.querySelector('[data-graph-zoom-in]')?.addEventListener('click', () => {
      state.nexusZoom = Math.min(1.8, state.nexusZoom + 0.15);
      renderNexusGraph(root, notes);
    });
    root.querySelector('[data-graph-zoom-out]')?.addEventListener('click', () => {
      state.nexusZoom = Math.max(0.55, state.nexusZoom - 0.15);
      renderNexusGraph(root, notes);
    });
    root.querySelector('[data-graph-fit]')?.addEventListener('click', () => {
      state.nexusZoom = 1;
      state.nexusPanX = 0;
      state.nexusPanY = 0;
      renderNexusGraph(root, notes);
    });
    root.querySelector('[data-graph-layout]')?.addEventListener('click', () => {
      state.graphPositions = {};
      writeJson('wdgr_nexus_graph_positions_v1', {});
      renderNexusGraph(root, notes);
    });
    renderNexusGraph(root, notes);
  }

  function installNexus() {
    const section = document.getElementById('sec-nexus');
    if (!section || section.dataset.wdgrNexus === '1') return;
    section.dataset.wdgrNexus = '1';
    section.classList.add('wdgr-section', 'wdgr-nexus-page');
    renderNexus(section);
  }

  function cleanBlockTitle(block) {
    const title = block.querySelector('.block-title, h2, h3');
    if (!title) return '';
    const clone = title.cloneNode(true);
    clone.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions,.wdg-mastery,.wdgr-duration').forEach(node => node.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function learningBlocks(section) {
    return Array.from(section.querySelectorAll(':scope > .block'));
  }

  function learningProgress(section) {
    const boxes = Array.from(section.querySelectorAll('.prog-cb:not([disabled])'));
    const done = boxes.filter(box => box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1');
    return { total: boxes.length, done: done.length, percent: boxes.length ? Math.round(done.length / boxes.length * 100) : 0 };
  }

  function scrollLearning(section, amount) {
    const blocks = learningBlocks(section);
    if (!blocks.length) return;
    const current = blocks.findIndex(block => {
      const rect = block.getBoundingClientRect();
      return rect.top >= 80 && rect.top < innerHeight * 0.65;
    });
    const index = Math.max(0, Math.min(blocks.length - 1, (current < 0 ? 0 : current) + amount));
    blocks[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function enhanceLearningSection(section) {
    const id = section.id.replace('sec-', '');
    if (!TRAINER_SECTIONS.has(id) || section.dataset.wdgrLearning === '1') return;
    const blocks = learningBlocks(section);
    if (!blocks.length) return;
    section.dataset.wdgrLearning = '1';
    section.classList.add('wdgr-learning-page');
    blocks.forEach((block, index) => {
      block.classList.add('wdgr-lesson-card');
      block.dataset.lessonIndex = String(index);
      const title = block.querySelector('.block-title');
      if (!title || title.querySelector('.wdgr-duration')) return;
      const words = block.textContent.trim().split(/\s+/).length;
      const minutes = Math.max(3, Math.min(18, Math.ceil(words / 160)));
      title.insertAdjacentHTML('beforeend', `<span class="wdgr-duration">${icon('tabler:clock', 13)} ${minutes} min</span>`);
    });
    const progress = learningProgress(section);
    const bar = document.createElement('div');
    bar.className = 'wdgr-learning-context';
    bar.innerHTML = `
      <div class="wdgr-learning-summary">
        <span class="wdgr-kicker">${icon('tabler:book-2', 15)} ${copy.learning}</span>
        <strong>${id.toUpperCase()} · ${blocks.length} ${blocks.length === 1 ? copy.topic : copy.topics}</strong>
        <div class="wdgr-linear-progress"><i style="width:${progress.percent}%"></i></div>
        <small>${progress.done}/${progress.total || blocks.length} · ${progress.percent}%</small>
      </div>
      <label class="wdgr-outline-select"><span>${copy.outline}</span><select data-learning-outline>${blocks.map((block, index) => `<option value="${index}">${index + 1}. ${escapeHtml(cleanBlockTitle(block))}</option>`).join('')}</select></label>
      <div class="wdgr-learning-nav"><button type="button" class="wdgr-btn" data-learning-prev>${icon('tabler:arrow-left', 15)} ${copy.previous}</button><button type="button" class="wdgr-btn primary" data-learning-next>${copy.next} ${icon('tabler:arrow-right', 15)}</button></div>`;
    const anchor = section.querySelector('.lang-section-hero, .tip-of-day, :scope > .block');
    anchor?.before(bar);
    bar.querySelector('[data-learning-outline]')?.addEventListener('change', event => {
      blocks[Number(event.target.value)]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    bar.querySelector('[data-learning-prev]')?.addEventListener('click', () => scrollLearning(section, -1));
    bar.querySelector('[data-learning-next]')?.addEventListener('click', () => scrollLearning(section, 1));
  }

  function enhanceLearning() {
    document.querySelectorAll('.section').forEach(enhanceLearningSection);
  }

  function playgroundFiles() {
    const tabs = Array.from(document.querySelectorAll('#pgTabs [data-file], #pgTabs .pg-tab-file'));
    return tabs.map(tab => ({ name: tab.dataset.file || tab.querySelector('.name')?.textContent.trim() || tab.textContent.trim(), content: '' }));
  }

  function syncPlaygroundTree(section) {
    const tree = section.querySelector('[data-playground-file-tree]');
    const tabs = document.getElementById('pgTabs');
    if (!tree || !tabs) return;
    const files = Array.from(tabs.querySelectorAll('.pg-tab-file'));
    tree.innerHTML = files.map((tab, index) => {
      const name = tab.querySelector('.name')?.textContent.trim() || `file-${index + 1}`;
      const ext = tab.querySelector('.ext')?.textContent.trim() || name.split('.').pop();
      return `<button type="button" class="${tab.classList.contains('active') ? 'active' : ''}" data-file-index="${index}"><span>${escapeHtml(ext)}</span>${escapeHtml(name)}</button>`;
    }).join('');
    tree.querySelectorAll('[data-file-index]').forEach(button => button.addEventListener('click', () => {
      files[Number(button.dataset.fileIndex)]?.click();
      requestAnimationFrame(() => syncPlaygroundTree(section));
    }));
  }

  function consoleLine(root, type, message) {
    const log = root.querySelector('[data-playground-console]');
    if (!log) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    log.insertAdjacentHTML('afterbegin', `<p class="${type}"><span>${time}</span>${escapeHtml(message)}</p>`);
    while (log.children.length > 12) log.lastElementChild.remove();
  }

  function installPlayground() {
    const section = document.getElementById('sec-playground');
    if (!section || section.dataset.wdgrPlayground === '1') return;
    const layout = section.querySelector('.pg-layout');
    if (!layout) return;
    section.dataset.wdgrPlayground = '1';
    section.classList.add('wdgr-playground-page');
    layout.classList.add('wdgr-playground-workspace');
    const shell = document.createElement('div');
    shell.className = 'wdgr-playground-shell';
    layout.before(shell);
    const fileRail = document.createElement('aside');
    fileRail.className = 'wdgr-playground-files';
    fileRail.innerHTML = `<div class="wdgr-panel-head"><strong>${icon('tabler:files', 15)} ${copy.files}</strong><button type="button" class="wdgr-icon-btn" data-playground-add-file title="${L('Add file', 'Добавить файл')}">${icon('tabler:file-plus', 16)}</button></div><div data-playground-file-tree></div>`;
    shell.appendChild(fileRail);
    shell.appendChild(layout);
    const toolbar = document.createElement('div');
    toolbar.className = 'wdgr-playground-toolbar';
    toolbar.innerHTML = `
      <div><span class="wdgr-kicker">${icon('tabler:device-desktop-code', 16)} Playground</span><strong>${copy.playground}</strong><small>${copy.playgroundSub}</small></div>
      <div class="wdgr-device-group" role="group" aria-label="Preview size">
        <button type="button" class="wdgr-icon-btn active" data-device="desktop" title="Desktop">${icon('tabler:device-desktop', 17)}</button>
        <button type="button" class="wdgr-icon-btn" data-device="tablet" title="Tablet">${icon('tabler:device-tablet', 17)}</button>
        <button type="button" class="wdgr-icon-btn" data-device="mobile" title="Mobile">${icon('tabler:device-mobile', 17)}</button>
      </div>
      <div class="wdgr-head-actions">
        <span class="wdgr-save-state" data-playground-save-state>${icon('tabler:cloud-check', 15)} ${copy.saved}</span>
        <button type="button" class="wdgr-btn" data-playground-snapshot>${icon('tabler:device-floppy', 16)} ${copy.snapshot}</button>
        <button type="button" class="wdgr-btn" data-playground-restore>${icon('tabler:history', 16)} ${copy.restore}</button>
        <button type="button" class="wdgr-btn" data-playground-reset>${icon('tabler:refresh', 16)} ${copy.reset}</button>
        <button type="button" class="wdgr-icon-btn" data-playground-fullscreen title="${copy.fullscreen}">${icon('tabler:maximize', 17)}</button>
      </div>`;
    shell.before(toolbar);
    const consolePanel = document.createElement('section');
    consolePanel.className = 'wdgr-console-panel';
    consolePanel.innerHTML = `<div class="wdgr-panel-head"><strong>${icon('tabler:terminal-2', 15)} ${copy.console}</strong><button type="button" class="wdgr-icon-btn" data-console-clear title="Clear">${icon('tabler:trash', 15)}</button></div><div class="wdgr-console-log" data-playground-console><p><span>ready</span>${L('Playground is ready.', 'Playground готов к работе.')}</p></div>`;
    shell.appendChild(consolePanel);
    syncPlaygroundTree(section);
    const tabs = document.getElementById('pgTabs');
    if (tabs) new MutationObserver(() => syncPlaygroundTree(section)).observe(tabs, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    fileRail.querySelector('[data-playground-add-file]')?.addEventListener('click', () => {
      if (typeof window.pgAddFile === 'function') window.pgAddFile();
      setTimeout(() => syncPlaygroundTree(section), 40);
    });

    toolbar.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => {
      toolbar.querySelectorAll('[data-device]').forEach(item => item.classList.toggle('active', item === button));
      shell.dataset.device = button.dataset.device;
    }));
    toolbar.querySelector('[data-playground-fullscreen]')?.addEventListener('click', async () => {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shell.requestFullscreen();
    });
    toolbar.querySelector('[data-playground-snapshot]')?.addEventListener('click', () => {
      const editor = document.getElementById('pg-editor');
      const payload = {
        active: window.pgActiveFile || '',
        files: Array.isArray(window.pgFiles) ? window.pgFiles : null,
        editor: editor?.value || '',
        savedAt: Date.now()
      };
      writeJson(PLAYGROUND_SNAPSHOT_KEY, payload);
      notify(copy.snapshotSaved);
      consoleLine(section, 'good', copy.snapshotSaved);
    });
    toolbar.querySelector('[data-playground-restore]')?.addEventListener('click', () => {
      const payload = readJson(PLAYGROUND_SNAPSHOT_KEY, null);
      if (!payload) return notify(copy.noSnapshot);
      if (Array.isArray(payload.files) && Array.isArray(window.pgFiles)) {
        window.pgFiles.splice(0, window.pgFiles.length, ...payload.files);
        window.pgActiveFile = payload.active || payload.files[0]?.name || null;
        if (typeof window.pgSwitchFile === 'function' && window.pgActiveFile) window.pgSwitchFile(window.pgActiveFile);
      } else {
        const editor = document.getElementById('pg-editor');
        if (editor) editor.value = payload.editor || '';
      }
      if (typeof window.runPlayground === 'function') window.runPlayground();
      notify(copy.snapshotRestored);
      consoleLine(section, 'good', copy.snapshotRestored);
    });
    toolbar.querySelector('[data-playground-reset]')?.addEventListener('click', () => {
      if (!confirm(L('Reset the Playground to a blank project?', 'Сбросить Playground до пустого проекта?'))) return;
      if (typeof window.loadTemplate === 'function') window.loadTemplate('blank');
      consoleLine(section, 'good', L('Playground reset.', 'Playground сброшен.'));
      setTimeout(() => syncPlaygroundTree(section), 40);
    });
    consolePanel.querySelector('[data-console-clear]')?.addEventListener('click', () => {
      consolePanel.querySelector('[data-playground-console]').innerHTML = '';
    });
    const editor = document.getElementById('pg-editor');
    editor?.addEventListener('input', () => {
      const save = toolbar.querySelector('[data-playground-save-state]');
      if (save) save.innerHTML = `${icon('tabler:circle-dashed', 15)} ${copy.edited}`;
    });
    section.querySelectorAll('[onclick*="runPlayground"]').forEach(button => button.addEventListener('click', () => {
      setTimeout(() => {
        consoleLine(section, 'good', L('Preview updated without a page reload.', 'Предпросмотр обновлён без перезагрузки страницы.'));
        const save = toolbar.querySelector('[data-playground-save-state]');
        if (save) save.innerHTML = `${icon('tabler:cloud-check', 15)} ${copy.saved}`;
      }, 80);
    }));
  }

  function calendarSnapshot() {
    if (typeof window.wdgCalGetSnapshot === 'function') return window.wdgCalGetSnapshot();
    return {
      selectedDate: state.calendarDate,
      tasks: readJson('webdevgym_calendar_v2', { tasks: [] }).tasks || []
    };
  }

  function calendarDayState(task, date) {
    if (task?.done) return 'completed';
    if (date < localDateIso(new Date()) && task && task.type !== 'rest') return 'missed';
    return task?.type || '';
  }

  function focusLabel() {
    const minutes = Math.floor(state.focusSeconds / 60);
    const seconds = state.focusSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  function applyCalendar(snapshot) {
    if (typeof window.wdgCalApplySnapshot === 'function') {
      window.wdgCalApplySnapshot(snapshot);
    } else {
      writeJson('webdevgym_calendar_v2', { version: 2, tasks: snapshot.tasks });
    }
  }

  function calendarTypeLabel(type) {
    const labels = {
      theory: L('Theory', 'Теория'),
      practice: L('Practice', 'Практика'),
      project: L('Project', 'Проект'),
      repeat: L('Review', 'Повторение'),
      career: L('Career', 'Карьера'),
      rest: L('Rest', 'Отдых')
    };
    return labels[type] || labels.practice;
  }

  function calendarMonthWeeks(selected, tasks) {
    const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
    const monthEnd = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
    const gridEnd = new Date(monthEnd);
    gridEnd.setDate(monthEnd.getDate() + ((7 - monthEnd.getDay()) % 7));
    const weeks = [];
    for (let cursor = new Date(gridStart), weekIndex = 0; cursor <= gridEnd; weekIndex += 1) {
      const days = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const date = new Date(cursor);
        const iso = localDateIso(date);
        days.push({
          date: iso,
          day: date.getDate(),
          inMonth: date.getMonth() === selected.getMonth(),
          tasks: tasks.filter(task => task.date === iso)
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push({ index: weekIndex + 1, days });
    }
    return weeks;
  }

  function calendarStreak(tasks) {
    const studyDays = tasks
      .filter(task => task.type !== 'rest')
      .sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const task of studyDays) {
      if (!task.done) {
        if (streak) break;
        continue;
      }
      streak += 1;
    }
    return streak;
  }

  function renderCalendar(root) {
    const snapshot = calendarSnapshot();
    const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks : [];
    state.calendarDate = state.calendarDate || snapshot.selectedDate || localDateIso(new Date());
    state.calendarMode = state.calendarMode === 'week' ? 'week' : 'route';

    const locale = isEnglish ? 'en-US' : 'ru-RU';
    const selected = new Date(state.calendarDate + 'T00:00:00');
    const monthWeeks = calendarMonthWeeks(selected, tasks);
    const selectedWeek = monthWeeks.find(week => week.days.some(day => day.date === state.calendarDate));
    const visibleWeeks = state.calendarMode === 'week' && selectedWeek ? [selectedWeek] : monthWeeks;
    const monthTasks = tasks.filter(task => {
      const date = new Date(task.date + 'T00:00:00');
      return date.getFullYear() === selected.getFullYear() && date.getMonth() === selected.getMonth();
    });
    const dayTasks = tasks.filter(task => task.date === state.calendarDate);
    const studyTasks = monthTasks.filter(task => task.type !== 'rest');
    const repeatTasks = monthTasks.filter(task => task.type === 'repeat');
    const completedTasks = studyTasks.filter(task => task.done);
    const notes = readJson('webdevgym_calendar_notes_v3', {});
    const selectedNote = String(notes[state.calendarDate] || '');
    const nextTask = [...tasks]
      .filter(task => task.date > state.calendarDate && task.type !== 'rest')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const allDone = dayTasks.length > 0 && dayTasks.every(task => task.done);
    const monthTitle = selected.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const selectedTitle = selected.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
    const weekDays = isEnglish ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] : ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

    root.classList.add('wdgr-calendar-v2');
    root.innerHTML = `
      <header class="wdgr-cal-head">
        <div>
          <span class="wdgr-cal-eyebrow">${L('CALENDAR / LEARNING ROUTE', 'КАЛЕНДАРЬ / МАРШРУТ ОБУЧЕНИЯ')}</span>
          <h1>${L('Route for', 'Маршрут на')} ${monthTitle}</h1>
          <p>${L('One clear route with study, practice, review and rest.', 'Один понятный путь с учёбой, практикой, повторением и отдыхом.')}</p>
        </div>
        <div class="wdgr-cal-head-actions">
          <div class="wdgr-cal-month-nav" aria-label="${L('Month navigation', 'Навигация по месяцам')}">
            <button type="button" class="wdgr-icon-btn" data-calendar-shift="-1" title="${L('Previous month', 'Предыдущий месяц')}">${icon('tabler:chevron-left', 18)}</button>
            <button type="button" class="wdgr-btn" data-calendar-today>${copy.today}</button>
            <button type="button" class="wdgr-icon-btn" data-calendar-shift="1" title="${L('Next month', 'Следующий месяц')}">${icon('tabler:chevron-right', 18)}</button>
          </div>
          <label class="wdgr-cal-view-select">
            <span>${L('View', 'Вид')}</span>
            <select data-calendar-view>
              <option value="route" ${state.calendarMode === 'route' ? 'selected' : ''}>${L('Month route', 'Маршрут месяца')}</option>
              <option value="week" ${state.calendarMode === 'week' ? 'selected' : ''}>${L('Selected week', 'Выбранная неделя')}</option>
            </select>
          </label>
          <button type="button" class="wdgr-btn primary wdgr-cal-plan-btn" data-calendar-open-plan>${icon('tabler:plus', 17)} ${L('Schedule', 'Запланировать')}</button>
        </div>
      </header>

      <section class="wdgr-cal-metrics" aria-label="${L('Month metrics', 'Показатели месяца')}">
        <span><strong>${studyTasks.length}</strong><small>${L('study days', 'учебных дней')}</small></span>
        <span><strong>${repeatTasks.length}</strong><small>${L('reviews', 'повторений')}</small></span>
        <span><strong>${studyTasks.length} ${L('h', 'ч')}</strong><small>${L('planned', 'в плане')}</small></span>
        <span><strong>${calendarStreak(tasks)}</strong><small>${L('day streak', 'серия дней')}</small></span>
        <span class="wdgr-cal-complete-metric"><strong>${completedTasks.length}/${studyTasks.length}</strong><small>${L('completed', 'выполнено')}</small></span>
      </section>

      <div class="wdgr-cal-layout">
        <main class="wdgr-cal-route" aria-label="${L('Learning route', 'Маршрут обучения')}">
          <div class="wdgr-cal-route-head">
            <div><strong>${monthTitle}</strong><span>${L('Select a day to open its plan', 'Выбери день, чтобы открыть его план')}</span></div>
            <div class="wdgr-cal-weekday-key">${weekDays.map(day => `<span>${day}</span>`).join('')}</div>
          </div>
          <div class="wdgr-cal-weeks">
            ${visibleWeeks.map(week => {
              const firstInMonth = week.days.find(day => day.inMonth) || week.days[0];
              const lastInMonth = [...week.days].reverse().find(day => day.inMonth) || week.days[6];
              const range = `${firstInMonth.day}–${lastInMonth.day} ${selected.toLocaleDateString(locale, { month: 'short' })}`;
              return `<section class="wdgr-cal-week-lane">
                <div class="wdgr-cal-week-label"><span>${L('WEEK', 'НЕДЕЛЯ')} ${String(week.index).padStart(2, '0')}</span><strong>${range}</strong></div>
                <div class="wdgr-cal-days">
                  ${week.days.map((day, dayIndex) => {
                    const task = day.tasks[0];
                    const stateClass = calendarDayState(task, day.date);
                    const title = task?.title || (day.inMonth ? L('Open day', 'Свободный день') : '');
                    const type = task ? calendarTypeLabel(task.type) : L('Free', 'Свободно');
                    return `<button type="button" class="wdgr-cal-day ${stateClass} ${day.date === state.calendarDate ? 'selected' : ''} ${day.inMonth ? '' : 'out-month'}" data-calendar-date="${day.date}" ${day.inMonth ? '' : 'tabindex="-1"'} aria-label="${escapeHtml(title)}">
                      <span class="wdgr-cal-day-top"><b>${weekDays[dayIndex]}</b><strong>${day.day}</strong></span>
                      <span class="wdgr-cal-day-title">${escapeHtml(title)}</span>
                      <span class="wdgr-cal-day-meta"><i>${escapeHtml(type)}</i>${day.tasks.length > 1 ? `<em>+${day.tasks.length - 1}</em>` : ''}</span>
                    </button>`;
                  }).join('')}
                </div>
              </section>`;
            }).join('')}
          </div>
        </main>

        <aside class="wdgr-cal-inspector">
          <div class="wdgr-cal-inspector-head">
            <span>${L('SELECTED DAY', 'ВЫБРАННЫЙ ДЕНЬ')}</span>
            <strong>${selectedTitle}</strong>
            <small>${dayTasks.length ? `${calendarTypeLabel(dayTasks[0].type)} · ${dayTasks[0].type === 'rest' ? L('recovery', 'восстановление') : L('about 1 hour', 'около 1 часа')}` : L('No tasks scheduled', 'Задач пока нет')}</small>
          </div>

          <div class="wdgr-cal-inspector-section">
            <div class="wdgr-cal-section-title"><strong>${L('Tasks', 'Задачи')}</strong><span>${dayTasks.filter(task => task.done).length}/${dayTasks.length}</span></div>
            <div class="wdgr-cal-inspector-tasks">
              ${dayTasks.length ? dayTasks.map(task => `<article class="${task.done ? 'done' : ''}">
                <label><input type="checkbox" data-calendar-task="${escapeHtml(task.id)}" ${task.done ? 'checked' : ''}><span><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.description || calendarTypeLabel(task.type))}</small></span></label>
                <button type="button" class="wdgr-icon-btn" data-calendar-edit="${escapeHtml(task.id)}" title="${L('Edit task', 'Изменить задачу')}">${icon('tabler:pencil', 15)}</button>
              </article>`).join('') : `<p class="wdgr-empty">${copy.noTasks}</p>`}
            </div>
            <button type="button" class="wdgr-cal-add-task" data-calendar-open-plan>${icon('tabler:plus', 15)} ${L('Add task', 'Добавить задачу')}</button>
          </div>

          <label class="wdgr-cal-note">
            <span>${L('Day note', 'Заметка дня')}</span>
            <textarea data-calendar-note rows="4" placeholder="${L('Write down what matters for this day...', 'Запиши, что важно не забыть в этот день...')}">${escapeHtml(selectedNote)}</textarea>
            <small>${icon('tabler:cloud-check', 14)} ${L('Saved locally', 'Сохраняется локально')}</small>
          </label>

          <div class="wdgr-cal-inspector-actions">
            <button type="button" class="wdgr-btn" data-calendar-reschedule ${dayTasks.length ? '' : 'disabled'}>${icon('tabler:calendar-forward', 16)} ${L('Move day', 'Перенести день')}</button>
            <button type="button" class="wdgr-btn primary" data-calendar-complete ${dayTasks.length ? '' : 'disabled'}>${icon(allDone ? 'tabler:arrow-back-up' : 'tabler:check', 16)} ${allDone ? L('Undo completion', 'Снять отметку') : copy.completeDay}</button>
          </div>

          <div class="wdgr-cal-next-day">
            <span>${L('NEXT STUDY DAY', 'СЛЕДУЮЩИЙ УЧЕБНЫЙ ДЕНЬ')}</span>
            ${nextTask ? `<button type="button" data-calendar-date="${nextTask.date}"><strong>${escapeHtml(nextTask.title)}</strong><small>${new Date(nextTask.date + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' })} · ${calendarTypeLabel(nextTask.type)}</small>${icon('tabler:arrow-right', 16)}</button>` : `<p>${L('The route is complete.', 'Маршрут завершён.')}</p>`}
          </div>
        </aside>
      </div>

      <section class="wdgr-cal-workload">
        <div class="wdgr-cal-workload-head"><div><span>${L('MONTH LOAD', 'НАГРУЗКА МЕСЯЦА')}</span><strong>${L('Rhythm without overload', 'Ритм без перегруза')}</strong></div><div class="wdgr-cal-legend"><i class="study"></i>${L('Study', 'Учёба')}<i class="repeat"></i>${L('Review', 'Повтор')}<i class="rest"></i>${L('Rest', 'Отдых')}</div></div>
        <div class="wdgr-cal-bars" style="--wdgr-cal-days:${new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate()}">
          ${Array.from({ length: new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate() }, (_, index) => {
            const iso = localDateIso(new Date(selected.getFullYear(), selected.getMonth(), index + 1));
            const dayTask = monthTasks.find(task => task.date === iso);
            const height = dayTask?.type === 'rest' ? 18 : dayTask?.type === 'repeat' ? 54 : dayTask ? 78 : 10;
            return `<button type="button" class="${dayTask?.type || 'empty'} ${dayTask?.done ? 'done' : ''} ${iso === state.calendarDate ? 'selected' : ''}" style="--bar:${height}%" data-calendar-date="${iso}" title="${index + 1}: ${escapeHtml(dayTask?.title || L('Free day', 'Свободный день'))}"><i></i><span>${index + 1}</span></button>`;
          }).join('')}
        </div>
      </section>

      <dialog class="wdgr-cal-dialog" data-calendar-dialog>
        <form method="dialog" data-calendar-form>
          <div class="wdgr-cal-dialog-head"><div><span>${L('PLAN A DAY', 'ПЛАНИРОВАНИЕ')}</span><strong data-calendar-dialog-title>${L('New task', 'Новая задача')}</strong></div><button type="button" class="wdgr-icon-btn" data-calendar-dialog-close aria-label="${L('Close', 'Закрыть')}">${icon('tabler:x', 18)}</button></div>
          <input type="hidden" name="taskId">
          <label><span>${L('Title', 'Название')}</span><input name="title" required maxlength="90" placeholder="${L('What will you work on?', 'Над чем будешь работать?')}"></label>
          <label><span>${L('Description', 'Описание')}</span><textarea name="description" rows="4" maxlength="500" placeholder="${L('A clear result for the session', 'Понятный результат занятия')}"></textarea></label>
          <div class="wdgr-cal-dialog-grid">
            <label><span>${L('Date', 'Дата')}</span><input type="date" name="date" value="${state.calendarDate}" required></label>
            <label><span>${L('Type', 'Тип')}</span><select name="type">${['theory','practice','project','repeat','career','rest'].map(type => `<option value="${type}">${calendarTypeLabel(type)}</option>`).join('')}</select></label>
          </div>
          <div class="wdgr-cal-dialog-actions"><button type="button" class="wdgr-btn" data-calendar-dialog-close>${L('Cancel', 'Отмена')}</button><button type="submit" class="wdgr-btn primary">${icon('tabler:check', 16)} ${L('Save plan', 'Сохранить план')}</button></div>
        </form>
      </dialog>`;

    const persist = () => applyCalendar({ ...snapshot, selectedDate: state.calendarDate, tasks });
    const openDialog = task => {
      const dialog = root.querySelector('[data-calendar-dialog]');
      const form = root.querySelector('[data-calendar-form]');
      if (!dialog || !form) return;
      form.elements.taskId.value = task?.id || '';
      form.elements.title.value = task?.title || '';
      form.elements.description.value = task?.description || '';
      form.elements.date.value = task?.date || state.calendarDate;
      form.elements.type.value = task?.type || 'practice';
      root.querySelector('[data-calendar-dialog-title]').textContent = task ? L('Edit task', 'Изменить задачу') : L('New task', 'Новая задача');
      dialog.showModal();
      form.elements.title.focus();
    };

    root.querySelector('[data-calendar-view]')?.addEventListener('change', event => {
      state.calendarMode = event.target.value;
      renderCalendar(root);
    });
    root.querySelectorAll('[data-calendar-date]').forEach(button => button.addEventListener('click', () => {
      state.calendarDate = button.dataset.calendarDate;
      renderCalendar(root);
    }));
    root.querySelectorAll('[data-calendar-task]').forEach(input => input.addEventListener('change', () => {
      const task = tasks.find(item => item.id === input.dataset.calendarTask);
      if (task) task.done = input.checked;
      persist();
      renderCalendar(root);
    }));
    root.querySelectorAll('[data-calendar-open-plan]').forEach(button => button.addEventListener('click', () => openDialog()));
    root.querySelectorAll('[data-calendar-edit]').forEach(button => button.addEventListener('click', () => {
      openDialog(tasks.find(task => task.id === button.dataset.calendarEdit));
    }));
    root.querySelectorAll('[data-calendar-dialog-close]').forEach(button => button.addEventListener('click', () => root.querySelector('[data-calendar-dialog]')?.close()));
    root.querySelector('[data-calendar-form]')?.addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      const taskId = String(values.get('taskId') || '');
      const existing = tasks.find(task => task.id === taskId);
      const nextTaskData = {
        date: String(values.get('date') || state.calendarDate),
        title: String(values.get('title') || '').trim(),
        description: String(values.get('description') || '').trim(),
        type: String(values.get('type') || 'practice')
      };
      if (!nextTaskData.title) return;
      if (existing) Object.assign(existing, nextTaskData);
      else tasks.push({ id: `wdg-cal-custom-${Date.now()}`, ...nextTaskData, done: false });
      state.calendarDate = nextTaskData.date;
      root.querySelector('[data-calendar-dialog]')?.close();
      persist();
      renderCalendar(root);
    });
    root.querySelector('[data-calendar-complete]')?.addEventListener('click', () => {
      dayTasks.forEach(task => { task.done = !allDone; });
      persist();
      renderCalendar(root);
    });
    root.querySelector('[data-calendar-reschedule]')?.addEventListener('click', () => {
      if (!dayTasks.length) return;
      const next = prompt(L('New date (YYYY-MM-DD):', 'Новая дата (ГГГГ-ММ-ДД):'), state.calendarDate);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(next || '')) return;
      dayTasks.forEach(task => { task.date = next; });
      state.calendarDate = next;
      persist();
      renderCalendar(root);
    });
    root.querySelector('[data-calendar-note]')?.addEventListener('input', event => {
      notes[state.calendarDate] = event.target.value;
      writeJson('webdevgym_calendar_notes_v3', notes);
      localStorage.setItem('webdevgym_calendar_note_v2', event.target.value);
    });
    root.querySelector('[data-calendar-today]')?.addEventListener('click', () => {
      state.calendarDate = localDateIso(new Date());
      renderCalendar(root);
    });
    root.querySelectorAll('[data-calendar-shift]').forEach(button => button.addEventListener('click', () => {
      const date = new Date(state.calendarDate + 'T00:00:00');
      date.setMonth(date.getMonth() + Number(button.dataset.calendarShift));
      state.calendarDate = localDateIso(date);
      renderCalendar(root);
    }));
  }

  function installCalendar() {
    const section = document.getElementById('sec-calendar');
    if (!section) return;
    if (section.dataset.wdgrCalendar !== '1') {
      section.dataset.wdgrCalendar = '1';
      section.classList.add('wdgr-section', 'wdgr-calendar-page');
      window.addEventListener('webdevgym:calendar-updated', () => {
        if (section.isConnected && section.classList.contains('active')) renderCalendar(section);
      });
    }
    renderCalendar(section);
  }

  function trainerStarter() {
    return `let score = 0;

function increment() {
  // ${L('Increase score and return the new value.', 'Увеличь score и верни новое значение.')}
}

function decrement() {
  // ${L('Do not allow score to go below zero.', 'Не позволяй score опускаться ниже нуля.')}
}

function reset() {
  // ${L('Reset score and return zero.', 'Сбрось score и верни ноль.')}
}`;
  }

  function runTrainerTests(code) {
    const results = [];
    try {
      const api = new Function(`${code}\nreturn { increment: typeof increment === 'function' ? increment : null, decrement: typeof decrement === 'function' ? decrement : null, reset: typeof reset === 'function' ? reset : null };`)();
      results.push({ label: L('Three functions are declared', 'Объявлены три функции'), pass: Boolean(api.increment && api.decrement && api.reset) });
      if (!results[0].pass) return results;
      results.push({ label: L('reset() returns 0', 'reset() возвращает 0'), pass: api.reset() === 0 });
      results.push({ label: L('increment() changes 0 to 1', 'increment() меняет 0 на 1'), pass: api.increment() === 1 });
      results.push({ label: L('increment() changes 1 to 2', 'increment() меняет 1 на 2'), pass: api.increment() === 2 });
      results.push({ label: L('decrement() changes 2 to 1', 'decrement() меняет 2 на 1'), pass: api.decrement() === 1 });
      api.reset();
      results.push({ label: L('decrement() keeps zero', 'decrement() не уводит ниже нуля'), pass: api.decrement() === 0 });
    } catch (error) {
      results.push({ label: error.message || String(error), pass: false, error: true });
    }
    return results;
  }

  function renderTrainerChallenge(summary) {
    const challenge = document.createElement('section');
    challenge.className = 'wdgr-code-challenge';
    const savedCode = localStorage.getItem(TRAINER_CODE_KEY) || trainerStarter();
    challenge.innerHTML = `
      <aside class="wdgr-challenge-brief">
        <span class="wdgr-kicker">${icon('tabler:braces', 15)} Interface basics</span>
        <h2>${L('Counter without negative values', 'Счётчик без отрицательных значений')}</h2>
        <p>${L('Complete three small functions. The tests check behavior, not formatting.', 'Заверши три небольшие функции. Тесты проверяют поведение, а не оформление кода.')}</p>
        <strong>${L('Requirements', 'Критерии готовности')}</strong>
        <ul><li>${L('increment() adds one', 'increment() добавляет единицу')}</li><li>${L('decrement() stops at zero', 'decrement() останавливается на нуле')}</li><li>${L('reset() restores zero', 'reset() возвращает ноль')}</li></ul>
        <button type="button" class="wdgr-btn" data-trainer-hint>${icon('tabler:bulb', 16)} ${L('Show hint', 'Открыть подсказку')}</button>
        <p class="wdgr-trainer-hint" hidden>${L('Each function must change the shared score variable and then return it. Use an if condition in decrement().', 'Каждая функция должна изменить общую переменную score и затем вернуть её. В decrement() используй условие if.')}</p>
      </aside>
      <main class="wdgr-challenge-workspace">
        <div class="wdgr-editor-toolbar"><strong>challenge.js</strong><span>${icon('tabler:device-floppy', 15)} ${copy.saved}</span></div>
        <textarea data-trainer-code spellcheck="false" aria-label="challenge.js">${escapeHtml(savedCode)}</textarea>
        <div class="wdgr-test-console">
          <div class="wdgr-panel-head"><strong>${icon('tabler:test-pipe', 16)} ${L('Tests and console', 'Тесты и консоль')}</strong><span data-trainer-score>0 / 6</span></div>
          <div data-trainer-results><p>${L('Run tests when your first version is ready.', 'Запусти тесты, когда первая версия будет готова.')}</p></div>
        </div>
        <div class="wdgr-challenge-actions"><button type="button" class="wdgr-btn" data-trainer-reset>${icon('tabler:refresh', 16)} ${copy.reset}</button><button type="button" class="wdgr-btn primary" data-trainer-run>${icon('tabler:player-play', 16)} ${L('Run tests', 'Запустить тесты')}</button><button type="button" class="wdgr-btn success" data-trainer-submit>${icon('tabler:checks', 16)} ${L('Submit solution', 'Сдать решение')}</button></div>
      </main>`;

    const editor = challenge.querySelector('[data-trainer-code]');
    const renderResults = () => {
      const results = runTrainerTests(editor.value);
      const passed = results.filter(result => result.pass).length;
      challenge.querySelector('[data-trainer-score]').textContent = `${passed} / 6`;
      challenge.querySelector('[data-trainer-results]').innerHTML = results.map(result => `<p class="${result.pass ? 'pass' : 'fail'}">${icon(result.pass ? 'tabler:circle-check' : 'tabler:circle-x', 15)} ${escapeHtml(result.label)}</p>`).join('');
      summary.querySelectorAll('li').forEach((item, index) => item.classList.toggle('complete', index < (passed === 6 ? 4 : passed ? 3 : 2)));
      return passed === 6;
    };
    editor.addEventListener('input', debounce(() => localStorage.setItem(TRAINER_CODE_KEY, editor.value), 180));
    challenge.querySelector('[data-trainer-hint]').addEventListener('click', () => {
      const hint = challenge.querySelector('.wdgr-trainer-hint');
      hint.hidden = !hint.hidden;
    });
    challenge.querySelector('[data-trainer-reset]').addEventListener('click', () => {
      if (!confirm(L('Reset this challenge?', 'Сбросить эту задачу?'))) return;
      editor.value = trainerStarter();
      localStorage.setItem(TRAINER_CODE_KEY, editor.value);
      challenge.querySelector('[data-trainer-results]').innerHTML = `<p>${L('Starter code restored.', 'Стартовый код восстановлен.')}</p>`;
      challenge.querySelector('[data-trainer-score]').textContent = '0 / 6';
    });
    challenge.querySelector('[data-trainer-run]').addEventListener('click', renderResults);
    challenge.querySelector('[data-trainer-submit]').addEventListener('click', () => {
      if (!renderResults()) return notify(L('Fix the failed tests first.', 'Сначала исправь упавшие тесты.'));
      localStorage.setItem('wdgr_trainer_counter_complete_v1', new Date().toISOString());
      notify(L('Challenge completed and saved locally.', 'Задача выполнена и сохранена локально.'));
    });
    return challenge;
  }

  function enhanceTrainers() {
    const page = document.querySelector('[data-feature-page="lab"]');
    if (!page || !page.classList.contains('active') || page.dataset.wdgrTrainer === '1') return;
    page.dataset.wdgrTrainer = '1';
    page.classList.add('wdgr-trainers-page');
    const inner = page.querySelector('.wdgf-page-inner');
    const header = page.querySelector('.wdgf-page-head');
    if (!inner || !header) return;
    const summary = document.createElement('section');
    summary.className = 'wdgr-trainer-summary';
    summary.innerHTML = `
      <div><span class="wdgr-kicker">${icon('tabler:flask-2', 16)} ${copy.trainers}</span><strong>${copy.trainers}</strong><small>${copy.trainersSub}</small></div>
      <ol><li class="active"><b>1</b><span>${L('Understand', 'Разобраться')}</span></li><li><b>2</b><span>${L('Write code', 'Написать код')}</span></li><li><b>3</b><span>${L('Run tests', 'Запустить тесты')}</span></li><li><b>4</b><span>${L('Explain', 'Объяснить')}</span></li></ol>`;
    header.after(summary);
    summary.after(renderTrainerChallenge(summary));
  }

  function enhanceRoutes() {
    const page = document.querySelector('[data-feature-page="paths"]');
    if (!page || !page.classList.contains('active') || page.dataset.wdgrRoutes === '1') return;
    page.dataset.wdgrRoutes = '1';
    page.classList.add('wdgr-routes-page');
    const route = page.querySelector('.wdg-growth-route');
    const list = page.querySelector('.wdg-growth-steps');
    if (!route || !list) return;
    const steps = Array.from(list.children);
    const completed = steps.filter(step => /level-4/.test(step.className)).length;
    const evidence = readJson('wdg_portfolio_v1', []).length;
    const summary = document.createElement('div');
    summary.className = 'wdgr-route-summary';
    summary.innerHTML = `
      <span><small>${copy.routeUnlocked}</small><strong>${Math.min(steps.length, completed + 1)} / ${steps.length}</strong></span>
      <span><small>${copy.routeTime}</small><strong>${Math.max(1, (steps.length - completed) * 2)} ${copy.hours}</strong></span>
      <span><small>${copy.routeEvidence}</small><strong>${evidence}</strong></span>`;
    route.querySelector('header')?.after(summary);
    steps.forEach((step, index) => {
      step.style.setProperty('--wdgr-step-index', index);
      if (index === Math.min(completed, steps.length - 1)) step.classList.add('wdgr-current-step');
    });
  }

  function installObservers() {
    const observer = new MutationObserver(() => {
      enhanceLearning();
      installPlayground();
      enhanceTrainers();
      enhanceRoutes();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  function init() {
    state.graphPositions = readJson('wdgr_nexus_graph_positions_v1', {});
    document.body.classList.add('wdgr-suite-ready');
    installNexus();
    installCalendar();
    enhanceLearning();
    installPlayground();
    enhanceTrainers();
    enhanceRoutes();
    installObservers();
    window.WebDevGymRedesignSuite = {
      refresh() {
        installNexus();
        installCalendar();
        enhanceLearning();
        installPlayground();
        enhanceTrainers();
        enhanceRoutes();
      },
      version: 1
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 220));
  else setTimeout(init, 220);
})();
