(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const copy = isEnglish ? {
    assistant: 'AI assistant', chats: 'Chats', chatSearch: 'Search chats...', newChat: 'New chat',
    today: 'Today', earlier: 'Earlier', connected: 'Connected', history: 'History', clear: 'Clear chat',
    context: 'Lesson context', currentTopic: 'Current topic', selectedFiles: 'Selected files',
    filesLocal: 'Files and chats are stored locally in this browser', ask: 'Ask about code or attach a file...', noFiles: 'No files attached', untitled: 'New chat', deleteChat: 'Delete chat',
    settings: 'Settings', settingsCopy: 'Adjust the interface and learning experience', reset: 'Reset', save: 'Save',
    appearance: 'Appearance', learning: 'Learning', sounds: 'Sounds', ai: 'AI assistant', data: 'Data and PWA',
    accessibility: 'Accessibility', interfaceTheme: 'Interface theme', dark: 'Dark', light: 'Light', system: 'System',
    accent: 'Accent color', interfaceFont: 'Interface font', density: 'Interface density', compact: 'Compact',
    comfortable: 'Comfortable', codeFont: 'Code font', reduceMotion: 'Reduce animations', background: 'Background',
    currentBackground: 'Custom background', noBackground: 'No custom background', upload: 'Upload', remove: 'Remove',
    opacity: 'Background opacity', soundSettings: 'Click and custom sounds', aiSettings: 'Model and connection',
    activeModel: 'Active model', manageModels: 'Manage API models', apiNote: 'API keys stay in this browser and are sent only to the selected provider.',
    storage: 'Local storage', storageCopy: 'Progress, settings, files and PWA cache are stored on this device.',
    used: 'Used', exportSettings: 'Export progress', importSettings: 'Import progress', pwa: 'Application mode',
    pwaReady: 'PWA is connected. Installation is available through the browser menu.', keyboard: 'Keyboard and motion',
    shortcuts: 'Keyboard shortcuts', shortcutSearch: 'Search', shortcutSettings: 'Settings', shortcutClose: 'Close panel',
    preview: 'Preview', localSummary: 'Local data', settingsSaved: 'Settings are already applied and saved locally.',
    cancel: 'Close without resetting', saveSettings: 'Save settings', noChats: 'No chats found',
    pageTopic: 'Current WebDevGym lesson', openHistory: 'Open chat list', close: 'Close',
    soundPageCopy: 'Choose a built-in sound or upload your own short click.', appearancePageCopy: 'Theme, accent, fonts and background.',
    learningPageCopy: 'Control interface density and focus-friendly behavior.', dataPageCopy: 'Manage local progress and app data.',
    accessibilityPageCopy: 'Reduce motion and use keyboard shortcuts.', aiPageCopy: 'Connect your own compatible model and explicitly enable its capabilities.', imageMode: 'Image', chatMode: 'Chat', imagePrompt: 'Describe the image you want to generate...', minimize: 'Minimize', maximize: 'Maximize', visionTitle: 'Image understanding', visionCopy: 'Only models with Vision support can inspect attached images. Other readable files are sent as text.', imageTitle: 'Image generation', imageCopy: 'Only models and providers with a dedicated image-generation endpoint can create images.'
  } : {
    assistant: 'ИИ-помощник', chats: 'Чаты', chatSearch: 'Поиск по чатам...', newChat: 'Новый чат',
    today: 'Сегодня', earlier: 'Ранее', connected: 'Подключено', history: 'История', clear: 'Очистить чат',
    context: 'Контекст урока', currentTopic: 'Текущая тема', selectedFiles: 'Выбранные файлы',
    filesLocal: 'Файлы и чаты хранятся локально в этом браузере', ask: 'Спроси о коде или прикрепи файл...', noFiles: 'Файлы не прикреплены', untitled: 'Новый чат', deleteChat: 'Удалить чат',
    settings: 'Настройки', settingsCopy: 'Настрой интерфейс и обучение под себя', reset: 'Сбросить', save: 'Сохранить',
    appearance: 'Внешний вид', learning: 'Обучение', sounds: 'Звуки', ai: 'ИИ-помощник', data: 'Данные и PWA',
    accessibility: 'Доступность', interfaceTheme: 'Тема интерфейса', dark: 'Тёмная', light: 'Светлая', system: 'Системная',
    accent: 'Цветовой акцент', interfaceFont: 'Шрифт интерфейса', density: 'Плотность интерфейса', compact: 'Компактно',
    comfortable: 'Удобно', codeFont: 'Моношрифт кода', reduceMotion: 'Уменьшить анимации', background: 'Фон',
    currentBackground: 'Пользовательский фон', noBackground: 'Свой фон не выбран', upload: 'Загрузить', remove: 'Удалить',
    opacity: 'Непрозрачность фона', soundSettings: 'Клики и свои звуки', aiSettings: 'Модель и подключение',
    activeModel: 'Активная модель', manageModels: 'Настроить API-модели', apiNote: 'API-ключи остаются в этом браузере и отправляются только выбранному провайдеру.',
    storage: 'Локальное хранилище', storageCopy: 'Прогресс, настройки, файлы и PWA-кэш хранятся на этом устройстве.',
    used: 'Занято', exportSettings: 'Экспортировать прогресс', importSettings: 'Импортировать прогресс', pwa: 'Режим приложения',
    pwaReady: 'PWA подключено. Установка доступна через меню браузера.', keyboard: 'Клавиатура и движение',
    shortcuts: 'Горячие клавиши', shortcutSearch: 'Поиск', shortcutSettings: 'Настройки', shortcutClose: 'Закрыть панель',
    preview: 'Предпросмотр', localSummary: 'Локальные данные', settingsSaved: 'Изменения применяются сразу и сохраняются локально.',
    cancel: 'Закрыть без сброса', saveSettings: 'Сохранить настройки', noChats: 'Чаты не найдены',
    pageTopic: 'Текущий урок WebDevGym', openHistory: 'Открыть список чатов', close: 'Закрыть',
    soundPageCopy: 'Выбери встроенный звук или загрузи свой короткий клик.', appearancePageCopy: 'Тема, акцент, шрифты и пользовательский фон.',
    learningPageCopy: 'Настрой плотность интерфейса и спокойный режим работы.', dataPageCopy: 'Управляй локальным прогрессом и данными приложения.',
    accessibilityPageCopy: 'Уменьши движение и используй клавиатурную навигацию.', aiPageCopy: 'Подключи свою совместимую модель и явно укажи её возможности.', imageMode: 'Изображение', chatMode: 'Чат', imagePrompt: 'Опиши изображение, которое нужно создать...', minimize: 'Свернуть', maximize: 'Развернуть', visionTitle: 'Распознавание изображений', visionCopy: 'Прикреплённые изображения видят только модели с поддержкой Vision. Остальные читаемые файлы передаются как текст.', imageTitle: 'Генерация изображений', imageCopy: 'Создавать изображения умеют только специальные модели и провайдеры с отдельным endpoint генерации.'
  };

  const THREADS_KEY = 'wdgr_ai_threads_v1';
  const ACTIVE_THREAD_KEY = 'wdgr_ai_active_thread_v1';
  const LEGACY_HISTORY_KEY = 'webdevgym_ai_chat_history_v1';
  const UI_FONT_KEY = 'wdgr_interface_font_v1';
  const CODE_FONT_KEY = 'wdgr_code_font_v1';
  const ACCENTS = [
    ['#9b4dff', '#7c3aed'], ['#3b82f6', '#2563eb'], ['#06b6d4', '#0891b2'],
    ['#10b981', '#059669'], ['#f43f5e', '#e11d48'], ['#f59e0b', '#d97706']
  ];

  let threads = [];
  let activeThreadId = '';
  let threadSyncTimer = 0;
  let switchingThread = false;
  let settingsCategory = 'appearance';

  function icon(name, size = 18) {
    return `<iconify-icon icon="${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;
  }

  function read(key, fallback = '') {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (error) {}
  }

  function parseJson(value, fallback) {
    try { return JSON.parse(value); } catch (error) { return fallback; }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function notify(message) {
    if (typeof window.showToast === 'function') window.showToast(message);
  }

  function currentLegacyHistory() {
    const raw = parseJson(read(LEGACY_HISTORY_KEY, '[]'), []);
    return Array.isArray(raw) ? raw : [];
  }

  function normalizeThread(thread) {
    return {
      id: String(thread?.id || `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
      title: String(thread?.title || copy.untitled).slice(0, 58),
      updatedAt: Number(thread?.updatedAt) || Date.now(),
      messages: Array.isArray(thread?.messages) ? thread.messages.slice(-40) : []
    };
  }

  function createThread(messages = []) {
    const firstUser = messages.find(message => message?.role === 'user');
    const source = firstUser?.display || firstUser?.content || '';
    return normalizeThread({
      id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: source ? source.replace(/\s+/g, ' ').slice(0, 42) : copy.untitled,
      updatedAt: Date.now(),
      messages
    });
  }

  function saveThreads() {
    write(THREADS_KEY, JSON.stringify(threads.slice(0, 30)));
    write(ACTIVE_THREAD_KEY, activeThreadId);
  }

  function loadThreads() {
    const saved = parseJson(read(THREADS_KEY, '[]'), []);
    threads = Array.isArray(saved) ? saved.map(normalizeThread) : [];
    const legacy = currentLegacyHistory();
    if (!threads.length) threads = [createThread(legacy)];
    activeThreadId = read(ACTIVE_THREAD_KEY, threads[0].id);
    if (!threads.some(thread => thread.id === activeThreadId)) activeThreadId = threads[0].id;
    saveThreads();
  }

  function setLegacyHistory(messages) {
    const safeMessages = Array.isArray(messages) ? messages.slice(-40) : [];
    switchingThread = true;
    try {
      if (typeof aiHistory !== 'undefined') aiHistory = safeMessages.map(message => ({ ...message }));
      write(LEGACY_HISTORY_KEY, JSON.stringify(safeMessages));
      if (typeof window.aiRenderHistory === 'function') window.aiRenderHistory();
      else if (typeof aiRenderHistory === 'function') aiRenderHistory();
    } catch (error) {}
    window.setTimeout(() => { switchingThread = false; }, 80);
  }

  function syncActiveThread() {
    if (switchingThread) return;
    const thread = threads.find(item => item.id === activeThreadId);
    if (!thread) return;
    const messages = currentLegacyHistory();
    thread.messages = messages;
    const firstUser = messages.find(message => message?.role === 'user');
    if (firstUser) {
      thread.title = String(firstUser.display || firstUser.content || copy.untitled)
        .replace(/\s+/g, ' ')
        .replace(/📎.*$/, '')
        .trim()
        .slice(0, 42) || copy.untitled;
    }
    thread.updatedAt = Date.now();
    threads.sort((a, b) => b.updatedAt - a.updatedAt);
    saveThreads();
    renderThreadList();
  }

  function scheduleThreadSync() {
    clearTimeout(threadSyncTimer);
    threadSyncTimer = window.setTimeout(syncActiveThread, 180);
  }

  function formatThreadTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString(isEnglish ? 'en-US' : 'ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'ru-RU', { day: '2-digit', month: 'short' });
  }

  function renderThreadList(query = '') {
    const list = document.getElementById('wdgrAiThreadList');
    if (!list) return;
    const needle = query.trim().toLowerCase();
    const visible = threads.filter(thread => !needle || thread.title.toLowerCase().includes(needle));
    if (!visible.length) {
      list.innerHTML = `<div class="wdgr-ai-empty">${icon('tabler:message-off', 17)}<span>${copy.noChats}</span></div>`;
      return;
    }
    list.innerHTML = visible.map(thread => `
      <div class="wdgr-ai-thread ${thread.id === activeThreadId ? 'active' : ''}" data-thread-id="${escapeHtml(thread.id)}">
        <button type="button" class="wdgr-ai-thread-main" data-thread-open="${escapeHtml(thread.id)}">
          <span>${escapeHtml(thread.title)}</span><small>${formatThreadTime(thread.updatedAt)}</small>
        </button>
        <button type="button" class="wdgr-ai-thread-delete" data-thread-delete="${escapeHtml(thread.id)}" title="${copy.deleteChat}" aria-label="${copy.deleteChat}">${icon('tabler:trash', 15)}</button>
      </div>`).join('');
  }

  function switchThread(id) {
    if (id === activeThreadId) return;
    syncActiveThread();
    const target = threads.find(thread => thread.id === id);
    if (!target) return;
    activeThreadId = id;
    saveThreads();
    setLegacyHistory(target.messages);
    renderThreadList(document.getElementById('wdgrAiThreadSearch')?.value || '');
    document.getElementById('aiChatWin')?.classList.remove('wdgr-history-open');
  }

  function newThread() {
    syncActiveThread();
    const thread = createThread();
    threads.unshift(thread);
    activeThreadId = thread.id;
    saveThreads();
    setLegacyHistory([]);
    renderThreadList();
    document.getElementById('aiInp')?.focus();
    document.getElementById('aiChatWin')?.classList.remove('wdgr-history-open');
  }

  function deleteThread(id) {
    const wasActive = id === activeThreadId;
    threads = threads.filter(thread => thread.id !== id);
    if (!threads.length) threads = [createThread()];
    if (wasActive) {
      activeThreadId = threads[0].id;
      setLegacyHistory(threads[0].messages);
    }
    saveThreads();
    renderThreadList(document.getElementById('wdgrAiThreadSearch')?.value || '');
  }

  function currentTopic() {
    const activeSection = document.querySelector('.section.active');
    const heading = activeSection?.querySelector('.lang-section-hero-title, h1, h2, .block-title');
    return heading?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80) || copy.pageTopic;
  }

  function updateChatContext() {
    const topic = currentTopic();
    const topicEl = document.getElementById('wdgrAiTopic');
    const contextButton = document.getElementById('wdgrAiContextButton');
    if (topicEl) topicEl.textContent = topic;
    if (contextButton) contextButton.title = topic;
    const fileList = document.getElementById('wdgrAiContextFiles');
    if (fileList) {
      const chips = Array.from(document.querySelectorAll('#aiAttachList .ai-attach-name')).map(node => node.textContent.trim());
      fileList.innerHTML = chips.length
        ? chips.map(name => `<span>${icon('tabler:file', 14)}${escapeHtml(name)}</span>`).join('')
        : `<small>${copy.noFiles}</small>`;
    }
  }

  function buildChat() {
    const win = document.getElementById('aiChatWin');
    if (!win || win.dataset.wdgrReady === '1') return;
    win.dataset.wdgrReady = '1';
    win.classList.add('wdgr-ai');

    const modelSelect = win.querySelector('#aiModelSelect');
    const messages = win.querySelector('#aiMsgs');
    const quickRow = win.querySelector('#aiQuickRow');
    const attachments = win.querySelector('#aiAttachList');
    const fileInput = win.querySelector('#aiFileInput');
    const input = win.querySelector('#aiInp');
    const send = win.querySelector('#aiSendBtn');
    const context = win.querySelector('#aiCtx');
    if (!modelSelect || !messages || !quickRow || !attachments || !fileInput || !input || !send || !context) return;

    win.replaceChildren();
    const shell = document.createElement('div');
    shell.className = 'wdgr-ai-shell';
    shell.innerHTML = `
      <aside class="wdgr-ai-history" aria-label="${copy.chats}">
        <div class="wdgr-ai-history-head"><strong>${copy.chats}</strong><button type="button" data-ai-history-close aria-label="${copy.close}">${icon('tabler:x', 17)}</button></div>
        <label class="wdgr-ai-search">${icon('tabler:search', 16)}<input id="wdgrAiThreadSearch" type="search" placeholder="${copy.chatSearch}"></label>
        <button type="button" class="wdgr-ai-new" id="wdgrAiNewChat">${icon('tabler:plus', 17)}<span>${copy.newChat}</span></button>
        <div class="wdgr-ai-history-label">${copy.today}</div>
        <div class="wdgr-ai-thread-list" id="wdgrAiThreadList"></div>
      </aside>
      <main class="wdgr-ai-main">
        <header class="wdgr-ai-topbar" data-ai-drag-handle>
          <button type="button" class="wdgr-icon-btn wdgr-ai-history-toggle" title="${copy.openHistory}" aria-label="${copy.openHistory}">${icon('tabler:messages', 19)}</button>
          <div class="wdgr-ai-title"><span class="wdgr-ai-title-icon">${icon('tabler:robot', 19)}</span><strong>${copy.assistant}</strong></div>
          <div class="wdgr-ai-model-slot"></div>
          <span class="wdgr-ai-status"><i></i>${copy.connected}</span>
          <div class="wdgr-ai-top-actions">
            <button type="button" class="wdgr-icon-text wdgr-ai-image-toggle" id="wdgrAiImageMode" title="${copy.imageMode}">${icon('tabler:photo-spark', 18)}<span>${copy.imageMode}</span></button>
            <button type="button" class="wdgr-icon-btn" id="wdgrAiContextButton" title="${copy.context}" aria-label="${copy.context}">${icon('tabler:book-2', 18)}</button>
            <button type="button" class="wdgr-icon-btn" id="wdgrAiMinimize" title="${copy.minimize}" aria-label="${copy.minimize}">${icon('tabler:minus', 18)}</button>
            <button type="button" class="wdgr-icon-btn" id="wdgrAiMaximize" title="${copy.maximize}" aria-label="${copy.maximize}">${icon('tabler:maximize', 18)}</button>
            <button type="button" class="wdgr-icon-btn" id="wdgrAiClear" title="${copy.clear}" aria-label="${copy.clear}">${icon('tabler:trash', 18)}</button>
            <button type="button" class="wdgr-icon-btn" data-ai-close title="${copy.close}" aria-label="${copy.close}">${icon('tabler:x', 19)}</button>
          </div>
        </header>
        <div class="wdgr-ai-message-stage"></div>
        <div class="wdgr-ai-composer">
          <div class="wdgr-ai-quick-slot"></div>
          <div class="wdgr-ai-attachment-slot"></div>
          <div class="wdgr-ai-compose-row">
            <button type="button" class="wdgr-icon-btn wdgr-ai-attach" title="${copy.upload}" aria-label="${copy.upload}">${icon('tabler:paperclip', 19)}</button>
            <div class="wdgr-ai-input-slot"></div><div class="wdgr-ai-send-slot"></div>
          </div>
          <div class="wdgr-ai-local-note">${icon('tabler:shield-lock', 13)}<span>${copy.filesLocal}</span></div>
        </div>
      </main>
      <aside class="wdgr-ai-context-panel">
        <div class="wdgr-ai-context-head"><strong>${copy.context}</strong><button type="button" data-ai-context-close aria-label="${copy.close}">${icon('tabler:x', 17)}</button></div>
        <section><small>${copy.currentTopic}</small><strong id="wdgrAiTopic">${copy.pageTopic}</strong></section>
        <section><small>${copy.selectedFiles}</small><div class="wdgr-ai-context-files" id="wdgrAiContextFiles"><small>${copy.noFiles}</small></div></section>
        <section class="wdgr-ai-capability-note">${icon('tabler:eye', 18)}<div><strong>${copy.visionTitle}</strong><p>${copy.visionCopy}</p></div></section>
        <section class="wdgr-ai-capability-note">${icon('tabler:photo-spark', 18)}<div><strong>${copy.imageTitle}</strong><p>${copy.imageCopy}</p></div></section>
        <div class="wdgr-ai-native-context"></div>
      </aside>`;
    win.appendChild(shell);

    shell.querySelector('.wdgr-ai-model-slot').append(modelSelect);
    const label = document.createElement('span');
    label.id = 'aiModelLabel';
    label.className = 'wdgr-ai-model-label';
    label.textContent = copy.activeModel;
    shell.querySelector('.wdgr-ai-model-slot').append(label);
    shell.querySelector('.wdgr-ai-message-stage').append(messages);
    shell.querySelector('.wdgr-ai-quick-slot').append(quickRow);
    shell.querySelector('.wdgr-ai-attachment-slot').append(attachments);
    shell.querySelector('.wdgr-ai-input-slot').append(input);
    shell.querySelector('.wdgr-ai-send-slot').append(send);
    shell.querySelector('.wdgr-ai-compose-row').append(fileInput);
    shell.querySelector('.wdgr-ai-native-context').append(context);

    if (typeof aiRebuildModelSelect === 'function') aiRebuildModelSelect();
    input.placeholder = copy.ask;
    send.innerHTML = icon('tabler:send-2', 19);
    const savedModel = read('wdgr_ai_model_v1');
    if (savedModel && Array.from(modelSelect.options).some(option => option.value === savedModel)) modelSelect.value = savedModel;
    modelSelect.addEventListener('change', () => write('wdgr_ai_model_v1', modelSelect.value));

    const setImageMode = enabled => {
      window.wdgrAiImageMode = Boolean(enabled);
      const button = shell.querySelector('#wdgrAiImageMode');
      button.classList.toggle('active', window.wdgrAiImageMode);
      button.querySelector('span').textContent = window.wdgrAiImageMode ? copy.imageMode : copy.chatMode;
      input.placeholder = window.wdgrAiImageMode ? copy.imagePrompt : copy.ask;
    };
    setImageMode(false);

    shell.querySelector('.wdgr-ai-attach').addEventListener('click', () => fileInput.click());
    shell.querySelector('#wdgrAiImageMode').addEventListener('click', () => setImageMode(!window.wdgrAiImageMode));
    shell.querySelectorAll('[data-ai-close]').forEach(button => button.addEventListener('click', () => window.toggleAiChat?.()));
    shell.querySelector('[data-ai-history-close]').addEventListener('click', () => win.classList.remove('wdgr-history-open'));
    shell.querySelector('[data-ai-context-close]').addEventListener('click', () => win.classList.remove('wdgr-context-open'));
    shell.querySelector('.wdgr-ai-history-toggle').addEventListener('click', () => win.classList.toggle('wdgr-history-open'));
    shell.querySelector('#wdgrAiContextButton').addEventListener('click', () => { updateChatContext(); win.classList.toggle('wdgr-context-open'); });
    shell.querySelector('#wdgrAiMinimize').addEventListener('click', () => { win.classList.toggle('wdgr-ai-minimized'); win.classList.remove('wdgr-ai-maximized'); });
    shell.querySelector('#wdgrAiMaximize').addEventListener('click', () => { win.classList.toggle('wdgr-ai-maximized'); win.classList.remove('wdgr-ai-minimized'); });
    shell.querySelector('#wdgrAiNewChat').addEventListener('click', newThread);
    shell.querySelector('#wdgrAiClear').addEventListener('click', () => { if (window.confirm(copy.clear + '?')) { setLegacyHistory([]); syncActiveThread(); } });
    shell.querySelector('#wdgrAiThreadSearch').addEventListener('input', event => renderThreadList(event.target.value));
    shell.querySelector('#wdgrAiThreadList').addEventListener('click', event => {
      const openButton = event.target.closest('[data-thread-open]');
      const deleteButton = event.target.closest('[data-thread-delete]');
      if (openButton) switchThread(openButton.dataset.threadOpen);
      if (deleteButton) deleteThread(deleteButton.dataset.threadDelete);
    });

    const stateKey = 'wdgr_ai_window_v2';
    const saveWindow = () => {
      if (window.innerWidth <= 900 || win.classList.contains('wdgr-ai-maximized') || win.classList.contains('wdgr-ai-minimized')) return;
      const rect = win.getBoundingClientRect();
      write(stateKey, JSON.stringify({ width: Math.round(rect.width), height: Math.round(rect.height), left: Math.round(rect.left), top: Math.round(rect.top) }));
    };
    const state = parseJson(read(stateKey, '{}'), {});
    if (window.innerWidth > 900 && state.width && state.height) {
      win.style.width = Math.min(state.width, window.innerWidth - 20) + 'px';
      win.style.height = Math.min(state.height, window.innerHeight - 70) + 'px';
      win.style.left = Math.max(8, Math.min(Number(state.left) || 8, window.innerWidth - 260)) + 'px';
      win.style.top = Math.max(62, Math.min(Number(state.top) || 62, window.innerHeight - 80)) + 'px';
      win.style.right = 'auto';
      win.style.bottom = 'auto';
    }
    const dragHandle = shell.querySelector('[data-ai-drag-handle]');
    dragHandle.addEventListener('pointerdown', event => {
      if (window.innerWidth <= 900 || event.button !== 0 || event.target.closest('button,select,input,textarea,a')) return;
      const rect = win.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      Object.assign(win.style, { width: rect.width + 'px', height: rect.height + 'px', left: rect.left + 'px', top: rect.top + 'px', right: 'auto', bottom: 'auto' });
      dragHandle.setPointerCapture(event.pointerId);
      const move = moveEvent => {
        win.style.left = Math.max(8, Math.min(moveEvent.clientX - offsetX, window.innerWidth - rect.width - 8)) + 'px';
        win.style.top = Math.max(62, Math.min(moveEvent.clientY - offsetY, window.innerHeight - 64)) + 'px';
      };
      const stop = () => { dragHandle.removeEventListener('pointermove', move); dragHandle.removeEventListener('pointerup', stop); dragHandle.removeEventListener('pointercancel', stop); saveWindow(); };
      dragHandle.addEventListener('pointermove', move);
      dragHandle.addEventListener('pointerup', stop);
      dragHandle.addEventListener('pointercancel', stop);
    });
    let resizeTimer = 0;
    new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(saveWindow, 140); }).observe(win);

    loadThreads();
    const active = threads.find(thread => thread.id === activeThreadId);
    if (active) setLegacyHistory(active.messages);
    renderThreadList();
    updateChatContext();
    new MutationObserver(scheduleThreadSync).observe(messages, { childList: true, subtree: true, characterData: true });
    new MutationObserver(updateChatContext).observe(attachments, { childList: true, subtree: true });
    new MutationObserver(() => { if (win.classList.contains('open')) { updateChatContext(); renderThreadList(document.getElementById('wdgrAiThreadSearch')?.value || ''); } }).observe(win, { attributes: true, attributeFilter: ['class'] });
  }

  function settingsCategoryButton(id, label, iconName) {
    return `<button type="button" data-settings-category="${id}" class="${id === settingsCategory ? 'active' : ''}">${icon(iconName, 17)}<span>${label}</span></button>`;
  }

  function settingRow(title, description, control, extraClass = '') {
    return `<div class="wdgr-setting-row ${extraClass}"><div><strong>${title}</strong>${description ? `<small>${description}</small>` : ''}</div><div class="wdgr-setting-control">${control}</div></div>`;
  }

  function buildSettings() {
    const legacyPanel = document.getElementById('settingsMini');
    if (!legacyPanel || document.getElementById('wdgrSettingsView')) return;
    legacyPanel.classList.add('wdgr-settings-legacy');

    const view = document.createElement('section');
    view.id = 'wdgrSettingsView';
    view.className = 'wdgr-settings-view';
    view.setAttribute('role', 'dialog');
    view.setAttribute('aria-modal', 'true');
    view.setAttribute('aria-label', copy.settings);
    view.innerHTML = `
      <header class="wdgr-settings-header">
        <div><h2>${copy.settings}</h2><p>${copy.settingsCopy}</p></div>
        <div class="wdgr-settings-header-actions">
          <button type="button" class="wdgr-button secondary" id="wdgrSettingsReset">${icon('tabler:restore', 17)}<span>${copy.reset}</span></button>
          <button type="button" class="wdgr-button primary" id="wdgrSettingsSave">${icon('tabler:check', 17)}<span>${copy.save}</span></button>
          <button type="button" class="wdgr-icon-btn" id="wdgrSettingsClose" title="${copy.close}" aria-label="${copy.close}">${icon('tabler:x', 20)}</button>
        </div>
      </header>
      <div class="wdgr-settings-layout">
        <nav class="wdgr-settings-nav" aria-label="${copy.settings}">
          ${settingsCategoryButton('appearance', copy.appearance, 'tabler:palette')}
          ${settingsCategoryButton('learning', copy.learning, 'tabler:book-2')}
          ${settingsCategoryButton('sounds', copy.sounds, 'tabler:volume')}
          ${settingsCategoryButton('ai', copy.ai, 'tabler:robot')}
          ${settingsCategoryButton('data', copy.data, 'tabler:database')}
          ${settingsCategoryButton('accessibility', copy.accessibility, 'tabler:accessibility')}
        </nav>
        <div class="wdgr-settings-content">
          <div class="wdgr-settings-page active" data-settings-page="appearance">
            <div class="wdgr-page-heading"><h3>${copy.appearance}</h3><p>${copy.appearancePageCopy}</p></div>
            <section class="wdgr-settings-section">
              ${settingRow(copy.interfaceTheme, '', `<div class="wdgr-segmented" data-theme-group><button type="button" data-theme-choice="dark">${copy.dark}</button><button type="button" data-theme-choice="light">${copy.light}</button><button type="button" data-theme-choice="system">${copy.system}</button></div>`)}
              ${settingRow(copy.accent, '', `<div class="wdgr-accent-list">${ACCENTS.map(([first, second], index) => `<button type="button" data-accent-index="${index}" style="--swatch:${first}" aria-label="${copy.accent} ${index + 1}"></button>`).join('')}</div>`)}
              ${settingRow(copy.interfaceFont, '', `<select id="wdgrInterfaceFont"><option value="Inter">Inter</option><option value="Manrope">Manrope</option><option value="Onest">Onest</option><option value="Rubik">Rubik</option><option value="IBM Plex Sans">IBM Plex Sans</option></select>`)}
              ${settingRow(copy.codeFont, '', `<select id="wdgrCodeFont"><option value="JetBrains Mono">JetBrains Mono</option><option value="Fira Code">Fira Code</option><option value="IBM Plex Mono">IBM Plex Mono</option><option value="Roboto Mono">Roboto Mono</option></select>`)}
            </section>
            <section class="wdgr-settings-section">
              <div class="wdgr-section-title"><h4>${copy.background}</h4></div>
              <div class="wdgr-background-row">
                <div class="wdgr-background-thumb" id="wdgrBackgroundThumb">${icon('tabler:photo', 22)}</div>
                <div class="wdgr-background-copy"><strong>${copy.currentBackground}</strong><small id="wdgrBackgroundStatus">${copy.noBackground}</small></div>
                <button type="button" class="wdgr-button secondary" id="wdgrBackgroundUpload">${icon('tabler:upload', 16)}<span>${copy.upload}</span></button>
                <button type="button" class="wdgr-icon-btn danger" id="wdgrBackgroundClear" title="${copy.remove}" aria-label="${copy.remove}">${icon('tabler:trash', 17)}</button>
              </div>
              ${settingRow(copy.opacity, '', `<div class="wdgr-range"><input id="wdgrBackgroundOpacity" type="range" min="0" max="100" value="32"><output id="wdgrBackgroundOpacityValue">32%</output></div>`)}
            </section>
          </div>
          <div class="wdgr-settings-page" data-settings-page="learning">
            <div class="wdgr-page-heading"><h3>${copy.learning}</h3><p>${copy.learningPageCopy}</p></div>
            <section class="wdgr-settings-section">
              ${settingRow(copy.density, '', `<div class="wdgr-segmented" data-density-group><button type="button" data-density="compact">${copy.compact}</button><button type="button" data-density="comfortable">${copy.comfortable}</button></div>`)}
              ${settingRow(copy.reduceMotion, copy.accessibilityPageCopy, `<button type="button" class="wdgr-switch" id="wdgrMotionToggle" aria-pressed="false"></button>`)}
            </section>
          </div>
          <div class="wdgr-settings-page" data-settings-page="sounds">
            <div class="wdgr-page-heading"><h3>${copy.soundSettings}</h3><p>${copy.soundPageCopy}</p></div>
            <div id="wdgrSoundMount"></div>
          </div>
          <div class="wdgr-settings-page" data-settings-page="ai">
            <div class="wdgr-page-heading"><h3>${copy.aiSettings}</h3><p>${copy.aiPageCopy}</p></div>
            <div class="wdgr-ai-capability-grid"><article class="wdgr-ai-capability-card">${icon('tabler:eye', 22)}<div><strong>${copy.visionTitle}</strong><p>${copy.visionCopy}</p></div></article><article class="wdgr-ai-capability-card">${icon('tabler:photo-spark', 22)}<div><strong>${copy.imageTitle}</strong><p>${copy.imageCopy}</p></div></article></div>
            <section class="wdgr-settings-section">
              ${settingRow(copy.activeModel, copy.apiNote, `<select id="wdgrSettingsModel"></select>`)}
              <div class="wdgr-security-note">${icon('tabler:shield-lock', 17)}<span>${copy.apiNote}</span></div>
              <button type="button" class="wdgr-wide-action" id="wdgrManageAi">${icon('tabler:adjustments-horizontal', 18)}<span>${copy.manageModels}</span>${icon('tabler:arrow-right', 17)}</button>
            </section>
          </div>
          <div class="wdgr-settings-page" data-settings-page="data">
            <div class="wdgr-page-heading"><h3>${copy.storage}</h3><p>${copy.dataPageCopy}</p></div>
            <section class="wdgr-settings-section">
              <div class="wdgr-storage-summary"><span>${icon('tabler:database', 18)}${copy.used}</span><strong id="wdgrStorageUsed">...</strong></div>
              <div class="wdgr-storage-track"><span id="wdgrStorageBar"></span></div>
              <p class="wdgr-muted">${copy.storageCopy}</p>
              <div class="wdgr-data-actions"><button type="button" class="wdgr-button secondary" id="wdgrExportProgress">${icon('tabler:download', 17)}${copy.exportSettings}</button><button type="button" class="wdgr-button secondary" id="wdgrImportProgress">${icon('tabler:upload', 17)}${copy.importSettings}</button></div>
            </section>
            <section class="wdgr-settings-section"><div class="wdgr-section-title"><h4>${copy.pwa}</h4></div><div class="wdgr-security-note">${icon('tabler:device-desktop-check', 18)}<span>${copy.pwaReady}</span></div></section>
          </div>
          <div class="wdgr-settings-page" data-settings-page="accessibility">
            <div class="wdgr-page-heading"><h3>${copy.keyboard}</h3><p>${copy.accessibilityPageCopy}</p></div>
            <section class="wdgr-settings-section">
              <div class="wdgr-shortcuts"><div><span>${copy.shortcutSearch}</span><kbd>Ctrl</kbd><kbd>K</kbd></div><div><span>${copy.shortcutSettings}</span><kbd>Ctrl</kbd><kbd>,</kbd></div><div><span>${copy.shortcutClose}</span><kbd>Esc</kbd></div></div>
            </section>
          </div>
        </div>
        <aside class="wdgr-settings-preview">
          <section><h3>${copy.preview}</h3><div class="wdgr-preview-window"><div class="wdgr-preview-top"><i></i><i></i><i></i><span>WebDevGym</span></div><div class="wdgr-preview-body"><small>HTML / CSS</small><strong>Flexbox: ${isEnglish ? 'basics' : 'основы'}</strong><p>${isEnglish ? 'Build a flexible layout and check it in practice.' : 'Собери гибкий макет и проверь его на практике.'}</p><div><span></span><span></span><span></span></div></div></div></section>
          <section><h3>${copy.localSummary}</h3><div class="wdgr-local-list"><span>${copy.storage}<b id="wdgrStorageSummary">...</b></span><span>PWA<b>${isEnglish ? 'Ready' : 'Готово'}</b></span><span>${copy.settings}<b>${isEnglish ? 'Local' : 'Локально'}</b></span></div></section>
          <section><button type="button" class="wdgr-wide-action" id="wdgrExportSettingsSide">${icon('tabler:download', 17)}<span>${copy.exportSettings}</span></button></section>
        </aside>
      </div>
      <footer class="wdgr-settings-footer"><span>${copy.settingsSaved}</span><div><button type="button" class="wdgr-button secondary" id="wdgrSettingsCancel">${copy.cancel}</button><button type="button" class="wdgr-button primary" id="wdgrSettingsSaveBottom">${copy.saveSettings}</button></div></footer>`;
    document.body.appendChild(view);

    const soundSection = document.getElementById('wdgpSoundSection');
    if (soundSection) document.getElementById('wdgrSoundMount').appendChild(soundSection);

    view.querySelector('.wdgr-settings-nav').addEventListener('click', event => {
      const button = event.target.closest('[data-settings-category]');
      if (button) showSettingsCategory(button.dataset.settingsCategory);
    });
    view.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
      document.querySelector(`[data-wdgp-theme="${button.dataset.themeChoice}"]`)?.click();
      syncSettings();
    }));
    view.querySelectorAll('[data-accent-index]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.accentIndex);
      const accent = ACCENTS[index];
      if (accent && typeof window.applyTheme === 'function') window.applyTheme(accent[0], accent[1]);
      write('wdgr_accent_index_v1', index);
      syncSettings();
    }));

    const interfaceFont = view.querySelector('#wdgrInterfaceFont');
    const codeFont = view.querySelector('#wdgrCodeFont');
    interfaceFont.addEventListener('change', () => applyFontPreference(UI_FONT_KEY, interfaceFont.value, '--wdgr-interface-font'));
    codeFont.addEventListener('change', () => applyFontPreference(CODE_FONT_KEY, codeFont.value, '--wdgr-code-font'));
    view.querySelectorAll('[data-density]').forEach(button => button.addEventListener('click', () => {
      const compact = button.dataset.density === 'compact';
      const current = document.body.classList.contains('wdgp-compact');
      if (compact !== current) document.querySelector('[data-wdgp-toggle="compact"]')?.click();
      syncSettings();
    }));
    view.querySelector('#wdgrMotionToggle').addEventListener('click', () => {
      document.querySelector('[data-wdgp-toggle="motion"]')?.click();
      syncSettings();
    });
    view.querySelector('#wdgrBackgroundUpload').addEventListener('click', () => document.getElementById('bgInput')?.click());
    view.querySelector('#wdgrBackgroundClear').addEventListener('click', async () => {
      if (typeof window.clearCustomBg === 'function') await window.clearCustomBg();
      syncSettings();
    });
    view.querySelector('#wdgrBackgroundOpacity').addEventListener('input', event => {
      const value = event.target.value;
      if (typeof window.setBgOpacity === 'function') window.setBgOpacity(value);
      write('customBgOpacity', value);
      syncSettings();
    });
    view.querySelector('#wdgrSettingsModel').addEventListener('change', event => {
      const source = document.getElementById('aiModelSelect');
      if (!source) return;
      source.value = event.target.value;
      source.dispatchEvent(new Event('change', { bubbles: true }));
      write('wdgr_ai_model_v1', source.value);
    });
    view.querySelector('#wdgrManageAi').addEventListener('click', openAiConfiguration);
    view.querySelector('#wdgrExportProgress').addEventListener('click', () => window.exportProgressJson?.());
    view.querySelector('#wdgrExportSettingsSide').addEventListener('click', () => window.exportProgressJson?.());
    view.querySelector('#wdgrImportProgress').addEventListener('click', () => window.importProgressJson?.());

    const closeButtons = ['#wdgrSettingsClose', '#wdgrSettingsSave', '#wdgrSettingsCancel', '#wdgrSettingsSaveBottom'];
    closeButtons.forEach(selector => view.querySelector(selector).addEventListener('click', () => setSettingsOpen(false)));
    view.querySelector('#wdgrSettingsReset').addEventListener('click', () => {
      document.querySelector('.wdgp-reset')?.click();
      window.setTimeout(syncSettings, 100);
    });

    const backgroundInput = document.getElementById('bgInput');
    backgroundInput?.addEventListener('change', () => window.setTimeout(syncSettings, 450));
    new MutationObserver(syncSettings).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
    syncSettings();
  }

  function showSettingsCategory(category) {
    settingsCategory = category;
    document.querySelectorAll('[data-settings-category]').forEach(button => button.classList.toggle('active', button.dataset.settingsCategory === category));
    document.querySelectorAll('[data-settings-page]').forEach(page => page.classList.toggle('active', page.dataset.settingsPage === category));
  }

  function applyFontPreference(key, font, property) {
    write(key, font);
    document.documentElement.style.setProperty(property, `'${font}'`);
    window.WebDevGymCriticalBoot?.loadFont(font);
  }

  function restoreFontPreferences() {
    applyFontPreference(UI_FONT_KEY, read(UI_FONT_KEY, 'Inter'), '--wdgr-interface-font');
    applyFontPreference(CODE_FONT_KEY, read(CODE_FONT_KEY, 'JetBrains Mono'), '--wdgr-code-font');
  }

  function backgroundIsActive() {
    return document.body.classList.contains('has-custom-bg');
  }

  async function updateStorageEstimate() {
    const used = document.getElementById('wdgrStorageUsed');
    const summary = document.getElementById('wdgrStorageSummary');
    const bar = document.getElementById('wdgrStorageBar');
    if (!used || !summary || !bar) return;
    let usage = 0;
    let quota = 0;
    try {
      const estimate = await navigator.storage?.estimate?.();
      usage = Number(estimate?.usage) || 0;
      quota = Number(estimate?.quota) || 0;
    } catch (error) {}
    const format = bytes => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(0, Math.round(bytes / 1024))} KB`;
    const label = format(usage);
    used.textContent = label;
    summary.textContent = label;
    bar.style.width = `${quota ? Math.min(100, (usage / quota) * 100) : 0}%`;
  }

  function syncModelSettings() {
    const source = document.getElementById('aiModelSelect');
    const target = document.getElementById('wdgrSettingsModel');
    if (!source || !target) return;
    target.innerHTML = Array.from(source.options).map(option => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.textContent.replace(/ ✓$/, ''))}</option>`).join('');
    target.value = source.value;
  }

  function syncSettings() {
    const mode = read('wdg_theme_mode_v2', document.body.classList.contains('dark') ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.classList.toggle('active', button.dataset.themeChoice === mode));
    const accentIndex = Number(read('wdgr_accent_index_v1', '0'));
    document.querySelectorAll('[data-accent-index]').forEach(button => button.classList.toggle('active', Number(button.dataset.accentIndex) === accentIndex));

    const interfaceFont = document.getElementById('wdgrInterfaceFont');
    const codeFont = document.getElementById('wdgrCodeFont');
    if (interfaceFont) interfaceFont.value = read(UI_FONT_KEY, 'Inter');
    if (codeFont) codeFont.value = read(CODE_FONT_KEY, 'JetBrains Mono');

    const compact = document.body.classList.contains('wdgp-compact');
    document.querySelectorAll('[data-density]').forEach(button => button.classList.toggle('active', (button.dataset.density === 'compact') === compact));
    const motion = document.body.classList.contains('wdgp-reduced-motion');
    const motionButton = document.getElementById('wdgrMotionToggle');
    motionButton?.classList.toggle('on', motion);
    motionButton?.setAttribute('aria-pressed', String(motion));

    const opacity = read('customBgOpacity', '32');
    const opacityInput = document.getElementById('wdgrBackgroundOpacity');
    const opacityOutput = document.getElementById('wdgrBackgroundOpacityValue');
    if (opacityInput) opacityInput.value = opacity;
    if (opacityOutput) opacityOutput.value = `${opacity}%`;

    const backgroundStatus = document.getElementById('wdgrBackgroundStatus');
    const backgroundThumb = document.getElementById('wdgrBackgroundThumb');
    const activeBackground = backgroundIsActive();
    if (backgroundStatus) backgroundStatus.textContent = activeBackground ? copy.currentBackground : copy.noBackground;
    if (backgroundThumb) backgroundThumb.classList.toggle('active', activeBackground);
    syncModelSettings();
    updateStorageEstimate();
  }

  function openAiConfiguration() {
    setSettingsOpen(false);
    if (typeof window.WebDevGymNext?.open === 'function') {
      window.WebDevGymNext.open('ai');
    } else if (typeof window.switchTabByName === 'function') {
      window.switchTabByName('ai');
    } else {
      const tab = Array.from(document.querySelectorAll('.tab')).find(button => button.getAttribute('onclick')?.includes("switchTab('ai'"));
      if (typeof window.switchTab === 'function') window.switchTab('ai', tab || null);
    }

    let attempts = 0;
    const focusConfiguration = () => {
      const block = document.getElementById('block-ai-custom');
      if (block) {
        block.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 12) window.setTimeout(focusConfiguration, 50);
    };
    window.requestAnimationFrame(focusConfiguration);
  }

  function setSettingsOpen(force) {
    const view = document.getElementById('wdgrSettingsView');
    if (!view) return;
    const open = typeof force === 'boolean' ? force : !view.classList.contains('open');
    view.classList.toggle('open', open);
    document.body.classList.toggle('wdgr-settings-open', open);
    document.getElementById('settingsMini')?.classList.remove('show');
    if (open) {
      syncSettings();
      showSettingsCategory(settingsCategory);
      window.setTimeout(() => view.querySelector('[data-settings-category].active')?.focus(), 30);
    }
    document.dispatchEvent(new CustomEvent('webdevgym:settings-state', {
      detail: { open }
    }));
  }

  function installGlobalOpeners() {
    window.toggleSettings = function () { setSettingsOpen(); };
    window.openWebDevGymSettings = function (category = 'appearance') {
      showSettingsCategory(category);
      setSettingsOpen(true);
    };
  }

  function init() {
    restoreFontPreferences();
    buildChat();
    buildSettings();
    installGlobalOpeners();

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.getElementById('wdgrSettingsView')?.classList.contains('open')) {
        event.preventDefault();
        setSettingsOpen(false);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
