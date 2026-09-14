(function () {
  'use strict';

  const STORAGE_KEY = 'wdg_forge_layout_v2';
  const defaults = {
    editorShare: 58,
    bottomHeight: 250,
    railCollapsed: false,
    taskCollapsed: false,
    outputCollapsed: false,
    outputTab: 'console',
    device: 'desktop'
  };

  let layout = loadLayout();
  let activeView = null;
  let scanQueued = false;
  const runtimeLogs = [];
  const isEnglish = document.documentElement.lang === 'en';
  const L = (en, ru) => isEnglish ? en : ru;

  function loadLayout() {
    try {
      return Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch (_) {
      return Object.assign({}, defaults);
    }
  }

  function saveLayout() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }

  function icon(name) {
    const paths = {
      panel: '<path d="M4 5h16v14H4z"/><path d="M9 5v14"/>',
      terminal: '<path d="m7 8 4 4-4 4"/><path d="M13 16h4"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
      desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
      mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
      grip: '<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/>',
      task: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.panel) + '</svg>';
  }

  function button(className, label, iconName, attrs) {
    return '<button class="' + className + '" type="button" ' + (attrs || '') + '>' + icon(iconName) + '<span>' + label + '</span></button>';
  }

  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(function () {
      scanQueued = false;
      scan();
    });
  }

  function scan() {
    const view = document.querySelector('#wdgforgeView');
    if (!view || !view.querySelector('.wdgforge-workspace')) {
      activeView = null;
      return;
    }
    if (view.querySelector('.wdgforge-v2-studio')) {
      activeView = view;
      return;
    }
    enhance(view);
  }

  function enhance(view) {
    const workspace = view.querySelector('.wdgforge-workspace');
    const studio = view.querySelector('.wdgforge-studio');
    const brief = view.querySelector('.wdgforge-brief');
    const stage = view.querySelector('.wdgforge-stage');
    const editor = view.querySelector('.wdgforge-editor');
    const preview = view.querySelector('.wdgforge-preview');
    const results = view.querySelector('.wdgforge-results');
    const projectbar = view.querySelector('.wdgforge-projectbar');
    if (!workspace || !studio || !brief || !stage || !editor || !preview || !results || !projectbar) return;

    activeView = view;
    view.classList.add('wdgforge-v2');
    studio.classList.add('wdgforge-v2-studio');
    workspace.classList.add('wdgforge-v2-workspace');

    buildRail(view);
    buildStageTrack(view, projectbar);
    buildPreviewControls(preview);
    buildSplitters(stage, editor, preview);
    buildBottomDrawer(studio, brief, results);
    bindView(view);
    applyLayout(view);
    renderConsole(view);
  }

  function buildRail(view) {
    const shell = view.closest('.wdgforge-shell');
    const modebar = shell && shell.querySelector('.wdgforge-modebar');
    if (!modebar || modebar.querySelector('[data-forge-rail-toggle]')) return;
    modebar.insertAdjacentHTML('afterbegin', button('wdgforge-v2-rail-toggle', 'Панель', 'panel', 'data-forge-rail-toggle aria-label="Свернуть панель Forge"'));
    modebar.classList.add('wdgforge-v2-rail');
    modebar.classList.toggle('is-collapsed', layout.railCollapsed);
  }

  function buildStageTrack(view, projectbar) {
    const passed = view.querySelectorAll('.wdgforge-requirements li.passed').length;
    const total = Math.max(1, view.querySelectorAll('.wdgforge-requirements li').length);
    const current = Math.min(3, Math.floor((passed / total) * 4));
    const labels = isEnglish ? ['Setup', 'Logic', 'Edge cases', 'Polish'] : ['Основа', 'Логика', 'Границы', 'Полировка'];
    const track = document.createElement('div');
    track.className = 'wdgforge-v2-stage-track';
    track.innerHTML = labels.map(function (label, index) {
      const state = index < current ? 'done' : (index === current ? 'active' : '');
      return '<div class="wdgforge-v2-stage-step ' + state + '"><span>' + (index + 1) + '</span><b>' + label + '</b></div>';
    }).join('');
    projectbar.insertAdjacentElement('afterend', track);
  }

  function buildPreviewControls(preview) {
    const header = preview.querySelector(':scope > header');
    if (!header || header.querySelector('[data-forge-device]')) return;
    const controls = document.createElement('div');
    controls.className = 'wdgforge-v2-devices';
    controls.innerHTML = button('wdgforge-v2-device', 'Desktop', 'desktop', 'data-forge-device="desktop"') +
      button('wdgforge-v2-device', 'Mobile', 'mobile', 'data-forge-device="mobile"');
    const run = header.querySelector('[data-forge-run]');
    header.insertBefore(controls, run || null);
  }

  function buildSplitters(stage, editor, preview) {
    if (stage.querySelector('[data-forge-split-x]')) return;
    const splitter = document.createElement('div');
    splitter.className = 'wdgforge-v2-splitter-x';
    splitter.dataset.forgeSplitX = '';
    splitter.setAttribute('role', 'separator');
    splitter.setAttribute('aria-label', 'Изменить ширину редактора и предпросмотра');
    splitter.innerHTML = icon('grip');
    stage.insertBefore(splitter, preview);
    editor.classList.add('wdgforge-v2-editor');
    preview.classList.add('wdgforge-v2-preview');
  }

  function buildBottomDrawer(studio, brief, results) {
    const drawer = document.createElement('section');
    drawer.className = 'wdgforge-v2-bottom';
    drawer.innerHTML =
      '<div class="wdgforge-v2-splitter-y" data-forge-split-y role="separator" aria-label="Изменить высоту нижней панели">' + icon('grip') + '</div>' +
      '<div class="wdgforge-v2-drawers">' +
        '<section class="wdgforge-v2-drawer task-drawer">' +
          '<header>' + button('wdgforge-v2-drawer-toggle', L('Task', 'Задача'), 'task', 'data-forge-drawer="task"') + '<span class="wdgforge-v2-drawer-meta">' + L('requirements and hints', 'условия и подсказки') + '</span></header>' +
          '<div class="wdgforge-v2-drawer-body" data-forge-task-body></div>' +
        '</section>' +
        '<section class="wdgforge-v2-drawer output-drawer">' +
          '<header><div class="wdgforge-v2-output-tabs">' +
            button('wdgforge-v2-output-tab', L('Console', 'Консоль'), 'terminal', 'data-forge-output-tab="console"') +
            button('wdgforge-v2-output-tab', L('Checks', 'Проверки'), 'task', 'data-forge-output-tab="checks"') +
          '</div>' + button('wdgforge-v2-drawer-toggle icon-only', 'Вывод', 'chevron', 'data-forge-drawer="output" aria-label="Свернуть вывод"') + '</header>' +
          '<div class="wdgforge-v2-drawer-body" data-forge-output-body>' +
            '<div class="wdgforge-v2-console" data-forge-console></div>' +
            '<div class="wdgforge-v2-checks" data-forge-checks></div>' +
          '</div>' +
        '</section>' +
      '</div>';

    studio.appendChild(drawer);
    drawer.querySelector('[data-forge-task-body]').appendChild(brief);
    drawer.querySelector('[data-forge-checks]').appendChild(results);
  }

  function bindView(view) {
    if (view.dataset.forgeV2Bound === '1') return;
    view.dataset.forgeV2Bound = '1';
    view.addEventListener('click', function (event) {
      const rail = event.target.closest('[data-forge-rail-toggle]');
      if (rail) {
        layout.railCollapsed = !layout.railCollapsed;
        saveLayout();
        applyLayout(view);
        return;
      }

      const device = event.target.closest('[data-forge-device]');
      if (device) {
        layout.device = device.dataset.forgeDevice;
        saveLayout();
        applyLayout(view);
        return;
      }

      const drawer = event.target.closest('[data-forge-drawer]');
      if (drawer) {
        const key = drawer.dataset.forgeDrawer === 'task' ? 'taskCollapsed' : 'outputCollapsed';
        layout[key] = !layout[key];
        saveLayout();
        applyLayout(view);
        return;
      }

      const tab = event.target.closest('[data-forge-output-tab]');
      if (tab) {
        layout.outputTab = tab.dataset.forgeOutputTab;
        layout.outputCollapsed = false;
        saveLayout();
        applyLayout(view);
        return;
      }

      if (event.target.closest('[data-forge-run]')) {
        runtimeLogs.length = 0;
        runtimeLogs.push({ level: 'info', text: L('Preview started', 'Предпросмотр запущен'), time: new Date().toLocaleTimeString() });
        layout.outputTab = 'console';
        renderConsole(view);
      }

      if (event.target.closest('[data-forge-test]')) {
        layout.outputTab = 'checks';
        layout.outputCollapsed = false;
        saveLayout();
        requestAnimationFrame(function () { applyLayout(view); });
      }
    });

    bindDrag(view.querySelector('[data-forge-split-x]'), function (event, start) {
      const stage = view.querySelector('.wdgforge-stage');
      const rect = stage.getBoundingClientRect();
      const value = ((event.clientX - rect.left) / rect.width) * 100;
      layout.editorShare = clamp(value, 28, 74);
      stage.style.setProperty('--forge-editor-share', layout.editorShare + '%');
    });

    bindDrag(view.querySelector('[data-forge-split-y]'), function (event, start) {
      layout.bottomHeight = clamp(start.value + (start.y - event.clientY), 150, Math.min(440, window.innerHeight * 0.48));
      view.style.setProperty('--forge-bottom-height', layout.bottomHeight + 'px');
    }, function () { return { y: lastPointerY, value: layout.bottomHeight }; });
  }

  let lastPointerY = 0;
  function bindDrag(handle, onMove, getStart) {
    if (!handle || handle.dataset.dragBound === '1') return;
    handle.dataset.dragBound = '1';
    handle.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      lastPointerY = event.clientY;
      const start = getStart ? getStart() : { x: event.clientX, y: event.clientY };
      handle.setPointerCapture(event.pointerId);
      document.body.classList.add('wdgforge-v2-resizing');
      function move(moveEvent) { onMove(moveEvent, start); }
      function end() {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', end);
        handle.removeEventListener('pointercancel', end);
        document.body.classList.remove('wdgforge-v2-resizing');
        saveLayout();
      }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    });
  }

  function applyLayout(view) {
    const shell = view.closest('.wdgforge-shell');
    const modebar = shell && shell.querySelector('.wdgforge-modebar');
    const stage = view.querySelector('.wdgforge-stage');
    view.style.setProperty('--forge-bottom-height', layout.bottomHeight + 'px');
    if (stage) stage.style.setProperty('--forge-editor-share', layout.editorShare + '%');
    if (modebar) modebar.classList.toggle('is-collapsed', layout.railCollapsed);
    view.classList.toggle('task-collapsed', layout.taskCollapsed);
    view.classList.toggle('output-collapsed', layout.outputCollapsed);
    view.dataset.outputTab = layout.outputTab;
    view.dataset.previewDevice = layout.device;
    view.querySelectorAll('[data-forge-device]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.forgeDevice === layout.device);
    });
    view.querySelectorAll('[data-forge-output-tab]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.forgeOutputTab === layout.outputTab);
    });
  }

  function renderConsole(view) {
    const output = view && view.querySelector('[data-forge-console]');
    if (!output) return;
    const entries = runtimeLogs.length ? runtimeLogs : [{ level: 'muted', text: L('Run the preview. console.log, warnings, and errors will appear here.', 'Запусти предпросмотр. console.log, предупреждения и ошибки появятся здесь.'), time: '--:--:--' }];
    output.innerHTML = entries.slice(-80).map(function (entry) {
      return '<div class="wdgforge-v2-log ' + entry.level + '"><time>' + escapeHtml(entry.time) + '</time><span>[' + escapeHtml(entry.level) + ']</span><code>' + escapeHtml(entry.text) + '</code></div>';
    }).join('');
    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || min));
  }

  window.addEventListener('message', function (event) {
    const data = event.data || {};
    if (data.channel !== 'wdg-forge-console') return;
    runtimeLogs.push({
      level: ['log', 'warn', 'error'].includes(data.level) ? data.level : 'log',
      text: String(data.text || ''),
      time: new Date().toLocaleTimeString()
    });
    if (runtimeLogs.length > 80) runtimeLogs.splice(0, runtimeLogs.length - 80);
    if (activeView) renderConsole(activeView);
  });

  new MutationObserver(() => {
    if (activeView?.isConnected && activeView.querySelector('.wdgforge-v2-studio')) return;
    if (!document.getElementById('wdgforgeView')) {
      activeView = null;
      return;
    }
    scheduleScan();
  }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('webdevgym:languagechange', scheduleScan);
  window.addEventListener('resize', scheduleScan);
  scheduleScan();
})();
