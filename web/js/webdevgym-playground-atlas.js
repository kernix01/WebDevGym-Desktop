(function () {
  'use strict';

  const DB_NAME = 'webdevgym-playground-atlas-v1';
  const DB_STORE = 'projects';
  const META_KEY = 'wdga_meta_v1';
  const FALLBACK_KEY = 'wdga_projects_v1';
  const PORTFOLIO_KEY = 'wdg_portfolio_v1';
  const LAYOUT_KEY = 'wdga_layout_v2';
  const MAX_PROJECTS = 20;
  const MAX_SNAPSHOTS = 16;
  const MAX_IMPORT_FILES = 300;
  const MAX_IMPORT_BYTES = 64 * 1024 * 1024;
  const MAX_IMPORT_FILE_BYTES = 32 * 1024 * 1024;
  const TEXT_EXTENSIONS = new Set([
    'html', 'htm', 'css', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'json', 'md', 'txt',
    'xml', 'svg', 'yml', 'yaml', 'scss', 'sass', 'less', 'csv', 'env', 'gitignore',
    'npmrc', 'editorconfig', 'toml', 'ini', 'conf', 'lock'
  ]);
  const EMMET_CURSOR_MARKER = '__WDGA_EMMET_CURSOR__';
  const EMMET_MARKUP_TAGS = new Set(['a', 'abbr', 'article', 'aside', 'audio', 'blockquote', 'body', 'button', 'canvas', 'code', 'dd', 'details', 'dialog', 'div', 'dl', 'dt', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'html', 'iframe', 'img', 'input', 'label', 'li', 'link', 'main', 'meta', 'nav', 'ol', 'option', 'p', 'picture', 'pre', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'summary', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'ul', 'video']);
  const isEnglish = /-en\.html$/i.test(location.pathname) || document.documentElement.lang === 'en';

  const ui = isEnglish ? {
    atlas: 'Project Atlas',
    structure: 'Structure',
    tools: 'Tools',
    snapshots: 'Snapshots',
    projectStructure: 'Project structure',
    file: 'File',
    folder: 'Folder',
    savedHere: 'Stored in this browser',
    autosave: 'Autosave',
    newProject: 'New project',
    snapshot: 'Snapshot',
    history: 'History',
    download: 'ZIP',
    saved: 'Saved locally',
    saving: 'Saving...',
    run: 'Run',
    format: 'Format',
    studio: 'Studio',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    console: 'Console',
    problems: 'Problems',
    tests: 'Tests',
    projectCheck: 'Project check',
    check: 'Check',
    hint: 'Hint',
    inspect: 'Inspect',
    publish: 'To local profile',
    filesPanel: 'Files',
    editorPanel: 'Editor',
    previewPanel: 'Preview',
    consolePanel: 'Console',
    empty: 'Nothing here yet.',
    projectName: 'Project name',
    deleteProject: 'Delete project',
    confirmDeleteProject: 'Delete project "{name}"? This cannot be undone.',
    projectDeleted: 'Project deleted.',
    snapshotName: 'Snapshot name',
    filePath: 'File path, for example src/app.js',
    folderPath: 'Folder path, for example src/components',
    rename: 'New name or path',
    confirmDelete: 'Delete this item?',
    projectPublished: 'Project added to the local profile.',
    projectSaved: 'Project saved.',
    restored: 'Version restored.',
    copied: 'Project duplicated.',
    invalidImport: 'Could not import this project.',
    started: 'Project preview started',
    formatted: 'Current file formatted',
    noIssues: 'No problems found.',
    ready: 'Playground Atlas is ready.',
    useHint: 'Start with the first failed check. Fix one reason, then run the check again.',
    inspectText: 'The check reads your HTML, CSS and JavaScript. It does not replace browser DevTools.',
    searchPrompt: 'Text to find',
    replacePrompt: 'Replace with',
    insertSnippet: 'Snippet inserted',
    importProject: 'Import project',
    importFiles: 'Files',
    importFilesSub: 'Choose several files; they will be placed in the project root',
    importFolder: 'Project folder',
    importFolderSub: 'Keep the folder and subfolder structure',
    importZip: 'ZIP archive',
    importZipSub: 'Best way to move a full project to or from a phone',
    importJson: 'WebDevGym backup',
    importJsonSub: 'Import a previously exported JSON project',
    importing: 'Importing project...',
    importDone: 'Project imported',
    importTooMany: 'The project has too many files. Maximum: 300.',
    importTooLarge: 'The project is too large. Maximum total size: 64 MB; one file: 32 MB.',
    importEmpty: 'No suitable project files were found.',
    importUnsupportedZip: 'This ZIP cannot be opened in this browser.',
    exportProject: 'Export JSON',
    duplicateProject: 'Duplicate project',
    validateCode: 'Validate code',
    validateCodeSub: 'HTML structure, CSS braces and JavaScript syntax',
    formatCode: 'Format current file',
    formatCodeSub: 'Normalize indentation and trailing spaces',
    searchReplace: 'Search and replace',
    searchReplaceSub: 'Change text in the current file',
    snippets: 'Insert starter snippet',
    snippetsSub: 'A useful fragment for the current language',
    importExport: 'Import or export project',
    importExportSub: 'Portable JSON backup for another browser',
    clearConsole: 'Clear console'
  } : {
    atlas: 'Project Atlas',
    structure: 'Структура',
    tools: 'Инструменты',
    snapshots: 'Снимки',
    projectStructure: 'Структура проекта',
    file: 'Файл',
    folder: 'Папка',
    savedHere: 'Хранятся в этом браузере',
    autosave: 'Автосохранение',
    newProject: 'Новый проект',
    snapshot: 'Снимок',
    history: 'История',
    download: 'ZIP',
    saved: 'Сохранено локально',
    saving: 'Сохранение...',
    run: 'Запуск',
    format: 'Формат',
    studio: 'Студия',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    console: 'Консоль',
    problems: 'Проблемы',
    tests: 'Тесты',
    projectCheck: 'Проверка проекта',
    check: 'Проверить',
    hint: 'Подсказка',
    inspect: 'Разобрать',
    publish: 'В локальный профиль',
    filesPanel: 'Файлы',
    editorPanel: 'Редактор',
    previewPanel: 'Превью',
    consolePanel: 'Консоль',
    empty: 'Здесь пока пусто.',
    projectName: 'Название проекта',
    deleteProject: 'Удалить проект',
    confirmDeleteProject: 'Удалить проект «{name}»? Это действие нельзя отменить.',
    projectDeleted: 'Проект удалён.',
    snapshotName: 'Название снимка',
    filePath: 'Путь к файлу, например src/app.js',
    folderPath: 'Путь к папке, например src/components',
    rename: 'Новое имя или путь',
    confirmDelete: 'Удалить этот элемент?',
    projectPublished: 'Проект добавлен в локальный профиль.',
    projectSaved: 'Проект сохранён.',
    restored: 'Версия восстановлена.',
    copied: 'Копия проекта создана.',
    invalidImport: 'Не удалось импортировать проект.',
    started: 'Предпросмотр проекта запущен',
    formatted: 'Текущий файл отформатирован',
    noIssues: 'Проблем не найдено.',
    ready: 'Playground Atlas готов к работе.',
    useHint: 'Начни с первой непройденной проверки. Исправь одну причину и запусти проверку ещё раз.',
    inspectText: 'Проверка читает HTML, CSS и JavaScript. Она помогает найти направление, но не заменяет DevTools.',
    searchPrompt: 'Что найти',
    replacePrompt: 'На что заменить',
    insertSnippet: 'Заготовка вставлена',
    importProject: 'Импорт проекта',
    importFiles: 'Выбрать файлы',
    importFilesSub: 'Можно выбрать несколько; они попадут в корень проекта',
    importFolder: 'Папка проекта',
    importFolderSub: 'Сохранит структуру папок и подпапок',
    importZip: 'ZIP-архив',
    importZipSub: 'Удобнее всего переносить целый проект с телефона и обратно',
    importJson: 'Копия WebDevGym',
    importJsonSub: 'Импорт ранее экспортированного JSON-проекта',
    importing: 'Импортируем проект...',
    importDone: 'Проект импортирован',
    importTooMany: 'В проекте слишком много файлов. Максимум: 300.',
    importTooLarge: 'Проект слишком тяжёлый. Максимум 64 МБ всего и 32 МБ на один файл.',
    importEmpty: 'Подходящих файлов проекта не найдено.',
    importUnsupportedZip: 'Этот ZIP не получилось открыть в браузере.',
    exportProject: 'Экспорт JSON',
    duplicateProject: 'Дублировать проект',
    validateCode: 'Проверить код',
    validateCodeSub: 'Структура HTML, скобки CSS и синтаксис JavaScript',
    formatCode: 'Форматировать файл',
    formatCodeSub: 'Выровнять отступы и убрать хвостовые пробелы',
    searchReplace: 'Поиск и замена',
    searchReplaceSub: 'Изменить текст в текущем файле',
    snippets: 'Вставить заготовку',
    snippetsSub: 'Полезный фрагмент для текущего языка',
    importExport: 'Импорт или экспорт',
    importExportSub: 'Переносимая JSON-копия для другого браузера',
    clearConsole: 'Очистить консоль'
  };

  const state = {
    root: null,
    section: null,
    projects: [],
    activeProject: null,
    activeExplorerTab: 'structure',
    activeConsoleTab: 'console',
    mobilePanel: 'editor',
    device: 'desktop',
    logs: [],
    problems: [],
    checks: [],
    emmetSuggestion: null,
    previewReady: false,
    saveTimer: 0,
    db: null,
    layout: {
      globalSidebarCollapsed: false,
      explorerCollapsed: false,
      consoleCollapsed: false,
      previewWidth: 390
    }
  };

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 16) + '" height="' + (size || 16) + '"></iconify-icon>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
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
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return (prefix || 'item') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowTime(value) {
    const date = value ? new Date(value) : new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    log('success', message);
  }

  function normalizePath(value) {
    return String(value || '')
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '')
      .replace(/\/{2,}/g, '/');
  }

  function fileType(path) {
    const extension = normalizePath(path).split('.').pop().toLowerCase();
    if (extension === 'htm') return 'html';
    if (extension === 'jpeg') return 'jpg';
    const knownTypes = [
      'html', 'css', 'js', 'mjs', 'ts', 'json', 'md', 'txt',
      'png', 'jpg', 'webp', 'gif', 'svg', 'ico', 'avif',
      'mp3', 'wav', 'ogg', 'm4a', 'mp4', 'webm',
      'woff', 'woff2', 'ttf', 'otf'
    ];
    return knownTypes.includes(extension) ? extension : 'file';
  }

  function fileName(path) {
    return normalizePath(path).split('/').pop() || path;
  }

  function defaultFiles() {
    const coreFiles = typeof pgFiles !== 'undefined' && Array.isArray(pgFiles) ? pgFiles : [];
    if (coreFiles.length) {
      return coreFiles.map(file => ({
        id: file.id || uid('file'),
        name: normalizePath(file.name),
        content: String(file.content || ''),
        updatedAt: Date.now()
      }));
    }
    return [
      {
        id: uid('file'),
        name: 'index.html',
        content: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Counter</title>\n  <link rel="stylesheet" href="src/styles/main.css">\n</head>\n<body>\n  <main class="counter">\n    <span class="eyebrow">LIVE INTERFACE</span>\n    <h1>Счётчик состояния</h1>\n    <output class="count" aria-live="polite">0</output>\n    <div class="actions">\n      <button class="minus" type="button">−</button>\n      <button class="reset" type="button">Сбросить</button>\n      <button class="plus" type="button">+</button>\n    </div>\n  </main>\n  <script src="src/components/Counter.js"></script>\n</body>\n</html>',
        updatedAt: Date.now()
      },
      {
        id: uid('file'),
        name: 'src/styles/main.css',
        content: ':root {\n  color-scheme: dark;\n  font-family: Inter, system-ui, sans-serif;\n}\n\nbody {\n  min-height: 100vh;\n  margin: 0;\n  display: grid;\n  place-items: center;\n  background: #0c1017;\n  color: #f3f7ff;\n}\n\n.counter {\n  width: min(360px, 88vw);\n  padding: 32px;\n  border: 1px solid #263447;\n  border-radius: 8px;\n  text-align: center;\n}\n\n.eyebrow { color: #a855f7; font-size: 12px; }\n.count { display: block; margin: 28px 0; font-size: 64px; }\n.actions { display: flex; justify-content: center; gap: 12px; }\nbutton { min-width: 56px; min-height: 44px; border: 1px solid #263447; border-radius: 6px; background: #151e2b; color: inherit; cursor: pointer; }\n.plus { background: #a855f7; border-color: #a855f7; }',
        updatedAt: Date.now()
      },
      {
        id: uid('file'),
        name: 'src/components/Counter.js',
        content: 'const count = document.querySelector(".count");\nconst plus = document.querySelector(".plus");\nconst minus = document.querySelector(".minus");\nconst reset = document.querySelector(".reset");\n\nlet score = Number(localStorage.getItem("score")) || 0;\n\nfunction updateCount() {\n  count.textContent = score;\n  localStorage.setItem("score", score);\n}\n\nplus.addEventListener("click", () => {\n  score += 1;\n  updateCount();\n});\n\nminus.addEventListener("click", () => {\n  if (score > 0) score -= 1;\n  updateCount();\n});\n\nreset.addEventListener("click", () => {\n  score = 0;\n  updateCount();\n});\n\nupdateCount();',
        updatedAt: Date.now()
      },
      {
        id: uid('file'),
        name: 'README.md',
        content: '# Counter\n\nМини-проект для практики DOM, событий и localStorage.',
        updatedAt: Date.now()
      }
    ];
  }

  function newProject(name, files) {
    const createdAt = Date.now();
    const projectFiles = (files || defaultFiles()).map(file => ({
      id: file.id || uid('file'),
      name: normalizePath(file.name),
      content: String(file.content || ''),
      binary: Boolean(file.binary),
      mime: String(file.mime || ''),
      byteSize: Number(file.byteSize || 0),
      updatedAt: file.updatedAt || createdAt
    }));
    const entryFile = projectFiles.find(file => /(^|\/)index\.html?$/i.test(file.name))?.name
      || projectFiles.find(file => fileType(file.name) === 'html')?.name
      || '';
    const initialFile = entryFile || projectFiles.find(file => !file.binary)?.name || projectFiles[0]?.name || '';
    return {
      id: uid('project'),
      name: String(name || (isEnglish ? 'Untitled project' : 'Новый проект')).trim(),
      files: projectFiles,
      emptyFolders: [],
      activeFile: initialFile,
      openFiles: initialFile ? [initialFile] : [],
      entryFile,
      expandedFolders: ['src', 'src/components', 'src/styles'],
      snapshots: [],
      autosave: null,
      createdAt,
      updatedAt: createdAt
    };
  }

  function normalizeProject(project) {
    const normalized = Object.assign(newProject(project?.name || ''), project || {});
    normalized.files = Array.isArray(project?.files) && project.files.length
      ? project.files.map(file => ({
        id: file.id || uid('file'),
        name: normalizePath(file.name),
        content: String(file.content || ''),
        binary: Boolean(file.binary),
        mime: String(file.mime || ''),
        byteSize: Number(file.byteSize || 0),
        updatedAt: file.updatedAt || Date.now()
      }))
      : defaultFiles();
    normalized.emptyFolders = Array.isArray(project?.emptyFolders) ? project.emptyFolders.map(normalizePath) : [];
    normalized.expandedFolders = Array.isArray(project?.expandedFolders) ? project.expandedFolders.map(normalizePath) : [];
    normalized.snapshots = Array.isArray(project?.snapshots) ? project.snapshots.slice(0, MAX_SNAPSHOTS) : [];
    normalized.entryFile = normalized.files.some(file => file.name === project?.entryFile)
      ? project.entryFile
      : normalized.files.find(file => /(^|\/)index\.html?$/i.test(file.name))?.name
        || normalized.files.find(file => fileType(file.name) === 'html')?.name
        || '';
    const initialFile = normalized.entryFile || normalized.files.find(file => !file.binary)?.name || normalized.files[0]?.name || '';
    const savedOpenFiles = Array.isArray(project?.openFiles) ? project.openFiles : [project?.activeFile || initialFile];
    normalized.openFiles = [...new Set(savedOpenFiles.map(normalizePath))]
      .filter(path => normalized.files.some(file => file.name === path));
    normalized.activeFile = normalized.openFiles.includes(project?.activeFile)
      ? project.activeFile
      : normalized.openFiles[0] || '';
    return normalized;
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function dbRequest(mode, action) {
    return new Promise((resolve, reject) => {
      if (!state.db) return reject(new Error('Database unavailable'));
      const transaction = state.db.transaction(DB_STORE, mode);
      const store = transaction.objectStore(DB_STORE);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function loadProjects() {
    try {
      state.db = await openDb();
      state.projects = (await dbRequest('readonly', store => store.getAll())).map(normalizeProject);
    } catch (error) {
      state.projects = readJson(FALLBACK_KEY, []).map(normalizeProject);
      console.warn('Playground Atlas is using localStorage fallback:', error);
    }
    if (!state.projects.length) state.projects.push(newProject(isEnglish ? 'Counter Lab' : 'Счётчик без отрицательных значений'));
    const meta = readJson(META_KEY, {});
    state.activeProject = state.projects.find(project => project.id === meta.activeProjectId) || state.projects[0];
  }

  async function persistProject(project) {
    project.updatedAt = Date.now();
    try {
      if (state.db) await dbRequest('readwrite', store => store.put(clone(project)));
      else writeJson(FALLBACK_KEY, state.projects);
    } catch (error) {
      writeJson(FALLBACK_KEY, state.projects);
    }
    writeJson(META_KEY, { activeProjectId: state.activeProject?.id || '' });
  }

  async function deletePersistedProject(projectId) {
    try {
      if (state.db) await dbRequest('readwrite', store => store.delete(projectId));
    } catch (error) {
      console.warn(error);
    }
    writeJson(FALLBACK_KEY, state.projects);
  }

  function currentFile() {
    return state.activeProject?.files.find(file => file.name === state.activeProject.activeFile) || null;
  }

  function emmetContextForFile(file) {
    const extension = String(file?.name || file || '').split('.').pop().toLowerCase();
    if (['html', 'htm', 'xhtml', 'vue', 'svelte', 'astro'].includes(extension)) return { syntax: 'html', type: 'markup' };
    if (['jsx', 'tsx'].includes(extension)) return { syntax: 'jsx', type: 'markup' };
    if (['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'postcss'].includes(extension)) {
      return { syntax: extension === 'styl' ? 'stylus' : extension, type: 'stylesheet' };
    }
    return null;
  }

  function emmetEngine() {
    const engine = window.WebDevGymEmmet;
    return engine && typeof engine.expand === 'function' && typeof engine.extract === 'function' ? engine : null;
  }

  function emmetBaseIndent(editor, start) {
    const lineStart = editor.value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    return (editor.value.slice(lineStart, start).match(/^[\t ]*/) || [''])[0];
  }

  function expandEmmetAbbreviation(abbreviation, context, baseIndent, withCursor) {
    const engine = emmetEngine();
    if (!engine || !context || !abbreviation) return null;
    try {
      let cursorPlaced = false;
      return engine.expand(abbreviation, {
        syntax: context.syntax,
        type: context.type,
        options: {
          'output.indent': '  ',
          'output.baseIndent': baseIndent || '',
          'output.field': function (index, placeholder) {
            if (withCursor && !cursorPlaced && (index === 1 || !placeholder)) {
              cursorPlaced = true;
              return EMMET_CURSOR_MARKER;
            }
            return placeholder || '';
          }
        }
      });
    } catch (error) {
      return null;
    }
  }

  function isUsefulEmmetAbbreviation(abbreviation, context, force) {
    if (force) return true;
    if (context.type === 'stylesheet') return /^[a-z@][a-z0-9@!:#.%+\-]*$/i.test(abbreviation);
    const normalized = abbreviation.toLowerCase();
    return EMMET_MARKUP_TAGS.has(normalized) || abbreviation === '!' || /[.#>+*()[\]{}:$@^]/.test(abbreviation) || normalized.includes('-');
  }

  function hideEmmetSuggestion() {
    state.emmetSuggestion = null;
    const panel = state.root?.querySelector('[data-wdga-emmet]');
    if (panel) {
      panel.hidden = true;
      panel.classList.remove('is-visible');
    }
  }

  function positionEmmetSuggestion(editor, panel) {
    const wrap = editor.closest('.wdga-editor-wrap');
    if (!wrap || !panel) return;
    const before = editor.value.slice(0, editor.selectionStart);
    const lines = before.split('\n');
    const lineIndex = Math.max(0, lines.length - 1);
    const column = (lines[lines.length - 1] || '').replace(/\t/g, '  ').length;
    const style = getComputedStyle(editor);
    const lineHeight = Number.parseFloat(style.lineHeight) || 19;
    const probe = document.createElement('span');
    probe.textContent = 'M';
    probe.style.cssText = 'position:absolute;visibility:hidden;font:' + style.font + ';';
    document.body.appendChild(probe);
    const charWidth = probe.getBoundingClientRect().width || 7;
    probe.remove();
    const desiredLeft = editor.offsetLeft + (Number.parseFloat(style.paddingLeft) || 14) + column * charWidth - editor.scrollLeft;
    const desiredTop = editor.offsetTop + (Number.parseFloat(style.paddingTop) || 14) + (lineIndex + 1) * lineHeight - editor.scrollTop + 5;
    const maxLeft = Math.max(8, wrap.clientWidth - Math.min(430, panel.offsetWidth || 430) - 8);
    const maxTop = Math.max(8, wrap.clientHeight - Math.min(220, panel.offsetHeight || 220) - 8);
    panel.style.left = Math.max(56, Math.min(desiredLeft, maxLeft)) + 'px';
    panel.style.top = Math.max(8, Math.min(desiredTop, maxTop)) + 'px';
  }

  function updateEmmetStatus() {
    const status = state.root?.querySelector('[data-wdga-emmet-status]');
    if (!status) return;
    const context = emmetContextForFile(currentFile());
    status.hidden = !context || !emmetEngine();
    if (context) status.dataset.syntax = context.syntax.toUpperCase();
  }

  function updateEmmetSuggestion(options) {
    const editor = document.getElementById('pg-editor');
    const panel = state.root?.querySelector('[data-wdga-emmet]');
    const engine = emmetEngine();
    const context = emmetContextForFile(currentFile());
    const force = Boolean(options?.force);
    if (!editor || !panel || !engine || !context || editor.selectionStart !== editor.selectionEnd) {
      hideEmmetSuggestion();
      return null;
    }
    let extracted;
    try {
      extracted = engine.extract(editor.value, editor.selectionStart, { type: context.type });
    } catch (error) {
      hideEmmetSuggestion();
      return null;
    }
    const abbreviation = extracted?.abbreviation || '';
    if (!abbreviation || !isUsefulEmmetAbbreviation(abbreviation, context, force)) {
      hideEmmetSuggestion();
      return null;
    }
    const baseIndent = emmetBaseIndent(editor, extracted.start);
    const preview = expandEmmetAbbreviation(abbreviation, context, baseIndent, false);
    if (!preview || preview.trim() === abbreviation.trim()) {
      hideEmmetSuggestion();
      return null;
    }
    state.emmetSuggestion = {
      abbreviation: abbreviation,
      start: extracted.start,
      end: extracted.end,
      context: context,
      baseIndent: baseIndent,
      preview: preview
    };
    panel.querySelector('[data-wdga-emmet-abbr]').textContent = abbreviation;
    const previewNode = panel.querySelector('[data-wdga-emmet-preview]');
    const previewLines = preview.split('\n');
    previewNode.textContent = previewLines.slice(0, 7).join('\n') + (previewLines.length > 7 ? '\n…' : '');
    panel.hidden = false;
    requestAnimationFrame(function () {
      if (panel.hidden) return;
      panel.classList.add('is-visible');
      positionEmmetSuggestion(editor, panel);
    });
    return state.emmetSuggestion;
  }

  function applyEmmetSuggestion(force) {
    const editor = document.getElementById('pg-editor');
    if (!editor) return false;
    const suggestion = updateEmmetSuggestion({ force: Boolean(force) });
    if (!suggestion) return false;
    const expanded = expandEmmetAbbreviation(suggestion.abbreviation, suggestion.context, suggestion.baseIndent, true);
    if (!expanded) return false;
    const markerIndex = expanded.indexOf(EMMET_CURSOR_MARKER);
    const clean = expanded.replace(EMMET_CURSOR_MARKER, '');
    editor.setRangeText(clean, suggestion.start, suggestion.end, 'start');
    const caret = suggestion.start + (markerIndex >= 0 ? markerIndex : clean.length);
    editor.setSelectionRange(caret, caret);
    hideEmmetSuggestion();
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  function indentEditorSelection(editor, outdent) {
    const value = editor.value;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineEndIndex = value.indexOf('\n', end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const block = value.slice(lineStart, lineEnd);
    const changed = outdent ? block.replace(/^( {1,2}|\t)/gm, '') : block.replace(/^/gm, '  ');
    editor.setRangeText(changed, lineStart, lineEnd, 'select');
    editor.setSelectionRange(lineStart, lineStart + changed.length);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function captureEditor() {
    const editor = document.getElementById('pg-editor');
    const file = currentFile();
    if (!editor || !file || file.binary) return;
    file.content = editor.value;
    file.updatedAt = Date.now();
    if (typeof pgFiles !== 'undefined') {
      const coreFile = pgFiles.find(item => item.name === file.name);
      if (coreFile) coreFile.content = file.content;
    }
  }

  function scheduleSave() {
    const saveState = state.root?.querySelector('[data-wdga-save-state]');
    if (saveState) {
      saveState.className = 'wdga-save-state is-saving';
      saveState.innerHTML = icon('tabler:loader-2', 14) + ' ' + ui.saving;
    }
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(async () => {
      captureEditor();
      state.activeProject.autosave = {
        name: ui.autosave,
        savedAt: Date.now(),
        files: clone(state.activeProject.files),
        activeFile: state.activeProject.activeFile,
        openFiles: clone(state.activeProject.openFiles || [])
      };
      await persistProject(state.activeProject);
      if (saveState) {
        saveState.className = 'wdga-save-state is-saved';
        saveState.innerHTML = icon('tabler:cloud-check', 14) + ' ' + ui.saved;
      }
      renderSnapshots();
    }, 420);
  }

  function log(type, message) {
    state.logs.unshift({
      id: uid('log'),
      type: type || 'info',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      time: Date.now()
    });
    state.logs = state.logs.slice(0, 100);
    renderConsole();
  }

  function buildShell() {
    const section = state.section;
    const legacyChildren = Array.from(section.children);
    section.querySelectorAll('[id]').forEach(element => {
      element.id = 'wdga-legacy-' + element.id;
    });
    section.classList.add('wdga-mounted');
    section.insertAdjacentHTML('beforeend', `
      <div class="wdga-root" data-mobile-panel="editor">
        <header class="wdga-topbar">
          <button class="wdga-icon-btn wdga-layout-toggle" type="button" data-wdga-global-sidebar title="${isEnglish ? 'Toggle site navigation' : 'Свернуть меню сайта'}">${icon('tabler:layout-sidebar-left-collapse', 17)}</button>
          <div class="wdga-brand">
            <span class="wdga-kicker">${ui.atlas}</span>
            <strong>${isEnglish ? 'Playground workspace' : 'Рабочее пространство'}</strong>
            <small>${isEnglish ? 'Projects, versions and live preview' : 'Проекты, версии и живой предпросмотр'}</small>
          </div>
          <div class="wdga-top-actions">
            <span class="wdga-save-state is-saved" data-wdga-save-state>${icon('tabler:cloud-check', 14)} ${ui.saved}</span>
            <button class="wdga-btn" type="button" data-wdga-new-project>${icon('tabler:folder-plus', 15)} <span>${ui.newProject}</span></button>
            <button class="wdga-btn" type="button" data-wdga-open-import title="${escapeHtml(ui.importProject)}">${icon('tabler:upload', 15)} <span>${ui.importProject}</span></button>
            <button class="wdga-btn" type="button" data-wdga-snapshot>${icon('tabler:device-floppy', 15)} <span>${ui.snapshot}</span></button>
            <button class="wdga-btn" type="button" data-wdga-history>${icon('tabler:history', 15)} <span>${ui.history}</span></button>
            <button class="wdga-btn" type="button" data-wdga-download>${icon('tabler:file-zip', 15)} <span>${ui.download}</span></button>
          </div>
        </header>
        <nav class="wdga-mobile-switcher" aria-label="Playground panels">
          <button type="button" data-wdga-mobile="files">${ui.filesPanel}</button>
          <button type="button" class="active" data-wdga-mobile="editor">${ui.editorPanel}</button>
          <button type="button" data-wdga-mobile="preview">${ui.previewPanel}</button>
          <button type="button" data-wdga-mobile="console">${ui.consolePanel}</button>
        </nav>
        <main class="wdga-workspace">
          <aside class="wdga-panel wdga-explorer">
            <div class="wdga-panel-title">
              <span>
                <span class="wdga-kicker">${ui.atlas}</span>
                <strong>${ui.projectStructure}</strong>
              </span>
              <button class="wdga-icon-btn" type="button" data-wdga-explorer-toggle title="${isEnglish ? 'Collapse project explorer' : 'Свернуть проводник'}">${icon('tabler:chevrons-left', 16)}</button>
            </div>
            <div class="wdga-project-picker">
              <select class="wdga-select wdga-project-select" data-wdga-project aria-label="${escapeHtml(ui.projectName)}"></select>
              <button class="wdga-icon-btn wdga-delete-project" type="button" data-wdga-delete-project title="${escapeHtml(ui.deleteProject)}" aria-label="${escapeHtml(ui.deleteProject)}">${icon('tabler:trash', 16)}</button>
            </div>
            <div class="wdga-segmented" role="tablist">
              <button class="active" type="button" data-wdga-explorer-tab="structure">${ui.structure}</button>
              <button type="button" data-wdga-explorer-tab="tools">${ui.tools}</button>
              <button type="button" data-wdga-explorer-tab="snapshots">${ui.snapshots}</button>
            </div>
            <div class="wdga-explorer-view" data-wdga-explorer-view="structure">
              <div class="wdga-path" data-wdga-path>atlas /</div>
              <div class="wdga-tree-tools">
                <button class="wdga-btn" type="button" data-wdga-add-file>${icon('tabler:file-plus', 14)} ${ui.file}</button>
                <button class="wdga-btn" type="button" data-wdga-add-folder>${icon('tabler:folder-plus', 14)} ${ui.folder}</button>
              </div>
              <div class="wdga-tree-wrap" data-wdga-tree></div>
              <div class="wdga-saves">
                <div class="wdga-saves-head"><strong>${ui.snapshots}</strong><small>${ui.savedHere}</small></div>
                <div class="wdga-snapshot-list" data-wdga-snapshot-list></div>
              </div>
            </div>
            <div class="wdga-tools-view" data-wdga-explorer-view="tools" hidden></div>
            <div class="wdga-snapshots-view" data-wdga-explorer-view="snapshots" hidden></div>
          </aside>
          <button class="wdga-panel-restore wdga-explorer-restore" type="button" data-wdga-explorer-toggle title="${isEnglish ? 'Open project explorer' : 'Открыть проводник'}">${icon('tabler:chevrons-right', 16)}</button>
          <section class="wdga-center">
            <div class="wdga-panel wdga-editor-panel">
              <div class="wdga-file-tabs" id="pgTabs"></div>
              <div class="wdga-editor-toolbar">
                <span class="wdga-breadcrumb" data-wdga-breadcrumb></span>
                <span class="wdga-emmet-status" data-wdga-emmet-status hidden>${icon('tabler:bolt', 13)} Emmet 2.4 <kbd>Tab</kbd></span>
                <div class="wdga-editor-actions">
                  <button class="wdga-btn primary" type="button" data-wdga-run>${icon('tabler:player-play', 14)} ${ui.run}</button>
                  <button class="wdga-btn" type="button" data-wdga-format>${icon('tabler:braces', 14)} ${ui.format}</button>
                </div>
              </div>
              <div class="wdga-editor-wrap">
                <pre class="wdga-line-numbers" data-wdga-lines>1</pre>
                <textarea class="wdga-editor" id="pg-editor" spellcheck="false" aria-label="${escapeHtml(ui.editorPanel)}"></textarea>
                <div class="wdga-emmet-suggest" data-wdga-emmet hidden role="status" aria-live="polite">
                  <div class="wdga-emmet-head">
                    <span class="wdga-emmet-brand">${icon('tabler:bolt', 14)} Emmet</span>
                    <code data-wdga-emmet-abbr></code>
                    <kbd>Tab</kbd>
                  </div>
                  <pre data-wdga-emmet-preview></pre>
                  <small>${isEnglish ? 'Expand abbreviation' : 'Развернуть сокращение'}</small>
                </div>
              </div>
            </div>
            <section class="wdga-panel wdga-console">
              <div class="wdga-console-head">
                <div class="wdga-console-tabs" role="tablist">
                  <button class="wdga-console-tab active" type="button" data-wdga-console-tab="console">${ui.console}</button>
                </div>
                <div class="wdga-console-actions">
                  <button class="wdga-icon-btn" type="button" data-wdga-console-clear title="${escapeHtml(ui.clearConsole)}">${icon('tabler:trash', 14)}</button>
                  <button class="wdga-icon-btn" type="button" data-wdga-console-toggle title="${isEnglish ? 'Collapse console' : 'Свернуть консоль'}">${icon('tabler:chevron-down', 15)}</button>
                </div>
              </div>
              <div class="wdga-console-body" data-wdga-console-body></div>
            </section>
            <button class="wdga-panel-restore wdga-console-restore" type="button" data-wdga-console-toggle title="${isEnglish ? 'Open console' : 'Открыть консоль'}">${icon('tabler:terminal-2', 16)} <span>${ui.console}</span></button>
          </section>
          <div class="wdga-splitter" data-wdga-splitter="preview" role="separator" aria-orientation="vertical" tabindex="0" title="${isEnglish ? 'Drag to resize editor and preview' : 'Потяни, чтобы изменить размер кода и предпросмотра'}"></div>
          <aside class="wdga-right">
            <section class="wdga-panel wdga-studio" data-device="desktop">
              <div class="wdga-studio-head">
                <span class="wdga-studio-label">${ui.studio.toUpperCase()}</span>
                <div class="wdga-device-group" role="group" aria-label="Preview size">
                  <button class="active" type="button" data-wdga-device="desktop">${ui.desktop}</button>
                  <button type="button" data-wdga-device="tablet">${ui.tablet}</button>
                  <button type="button" data-wdga-device="mobile">${ui.mobile}</button>
                </div>
                <button class="wdga-icon-btn" type="button" data-wdga-refresh title="${escapeHtml(ui.run)}">${icon('tabler:refresh', 15)}</button>
              </div>
              <div class="wdga-preview-stage">
                <iframe class="wdga-preview-frame" id="pg-iframe" sandbox="allow-scripts allow-forms allow-modals"></iframe>
              </div>
              <select id="pgEntrySelect" hidden></select>
            </section>
          </aside>
        </main>
        <dialog class="wdga-dialog wdga-tool-dialog" data-wdga-tool-dialog>
          <div class="wdga-dialog-head">
            <strong data-wdga-tool-title>${ui.tools}</strong>
            <button class="wdga-icon-btn" type="button" data-wdga-close-tool>${icon('tabler:x', 16)}</button>
          </div>
          <div class="wdga-dialog-body" data-wdga-tool-body></div>
        </dialog>
        <dialog class="wdga-dialog" data-wdga-history-dialog>
          <div class="wdga-dialog-head">
            <strong>${ui.history}</strong>
            <button class="wdga-icon-btn" type="button" data-wdga-close-dialog>${icon('tabler:x', 16)}</button>
          </div>
          <div class="wdga-dialog-body"><div class="wdga-history-list" data-wdga-history-list></div></div>
        </dialog>
        <dialog class="wdga-dialog wdga-import-dialog" data-wdga-import-dialog>
          <div class="wdga-dialog-head">
            <strong>${icon('tabler:upload', 17)} ${ui.importProject}</strong>
            <button class="wdga-icon-btn" type="button" data-wdga-close-dialog title="${isEnglish ? 'Close' : 'Закрыть'}">${icon('tabler:x', 16)}</button>
          </div>
          <div class="wdga-dialog-body">
            <div class="wdga-import-grid">
              <button type="button" data-wdga-import-choice="files">${icon('tabler:files', 21)}<span><strong>${ui.importFiles}</strong><small>${ui.importFilesSub}</small></span></button>
              <button type="button" data-wdga-import-choice="folder">${icon('tabler:folder-up', 21)}<span><strong>${ui.importFolder}</strong><small>${ui.importFolderSub}</small></span></button>
              <button type="button" data-wdga-import-choice="zip">${icon('tabler:file-zip', 21)}<span><strong>${ui.importZip}</strong><small>${ui.importZipSub}</small></span></button>
              <button type="button" data-wdga-import-choice="json">${icon('tabler:database-import', 21)}<span><strong>${ui.importJson}</strong><small>${ui.importJsonSub}</small></span></button>
            </div>
            <p class="wdga-import-note">${isEnglish ? 'Files stay in this browser. node_modules, .git and service files are skipped.' : 'Файлы останутся в этом браузере. node_modules, .git и служебные файлы пропускаются.'}</p>
            <div class="wdga-import-status" data-wdga-import-status aria-live="polite"></div>
          </div>
        </dialog>
        <input type="file" multiple hidden data-wdga-import-files>
        <input type="file" multiple webkitdirectory directory hidden data-wdga-import-folder>
        <input type="file" accept="application/zip,.zip" hidden data-wdga-import-zip>
        <input type="file" accept="application/json,.json" hidden data-wdga-import>
      </div>
    `);
    state.root = section.querySelector('.wdga-root');
    legacyChildren.forEach(element => element.remove());
  }

  function syncCoreFiles() {
    if (!state.activeProject) return;
    if (typeof pgFiles !== 'undefined') pgFiles = state.activeProject.files;
    if (typeof pgActiveFile !== 'undefined') pgActiveFile = state.activeProject.activeFile || state.activeProject.files[0]?.name || null;
  }

  function adoptCoreFiles() {
    if (typeof pgFiles === 'undefined' || !Array.isArray(pgFiles) || !state.activeProject) return;
    if (pgFiles === state.activeProject.files) return;
    state.activeProject.files = pgFiles.map(file => ({
      id: file.id || uid('file'),
      name: normalizePath(file.name),
      content: String(file.content || ''),
      binary: Boolean(file.binary),
      mime: String(file.mime || ''),
      byteSize: Number(file.byteSize || 0),
      updatedAt: Date.now()
    }));
    state.activeProject.activeFile = typeof pgActiveFile !== 'undefined' && pgActiveFile
      ? pgActiveFile
      : state.activeProject.files[0]?.name || '';
    state.activeProject.entryFile = state.activeProject.files.find(file => fileType(file.name) === 'html')?.name || '';
    state.activeProject.openFiles = [...new Set((state.activeProject.openFiles || []).filter(path => (
      state.activeProject.files.some(file => file.name === path)
    )))];
    if (state.activeProject.activeFile && !state.activeProject.openFiles.includes(state.activeProject.activeFile)) {
      state.activeProject.openFiles.push(state.activeProject.activeFile);
    }
    if (typeof pgFiles !== 'undefined') pgFiles = state.activeProject.files;
    scheduleSave();
  }

  function renderProjectSelect() {
    const select = state.root.querySelector('[data-wdga-project]');
    select.innerHTML = state.projects.map(project => (
      '<option value="' + escapeHtml(project.id) + '"' + (project === state.activeProject ? ' selected' : '') + '>' + escapeHtml(project.name) + '</option>'
    )).join('');
  }

  function renderTabs() {
    if (!state.root) return;
    adoptCoreFiles();
    const tabs = document.getElementById('pgTabs');
    if (!tabs || !state.activeProject) return;
    const openFiles = (state.activeProject.openFiles || [])
      .map(path => state.activeProject.files.find(file => file.name === path))
      .filter(Boolean);
    tabs.innerHTML = openFiles.map(file => {
      const type = fileType(file.name);
      return '<button type="button" class="pg-tab-file' + (file.name === state.activeProject.activeFile ? ' active' : '') + '" data-wdga-file="' + escapeHtml(file.name) + '">' +
        '<span class="ext ' + type + '">' + escapeHtml(type) + '</span>' +
        '<span class="name" title="' + escapeHtml(file.name) + '">' + escapeHtml(fileName(file.name)) + '</span>' +
        '<span class="close" data-wdga-close-file="' + escapeHtml(file.name) + '" title="Close">×</span></button>';
    }).join('') + '<button type="button" class="wdga-icon-btn" data-wdga-tab-add title="' + escapeHtml(ui.file) + '">' + icon('tabler:plus', 15) + '</button>';
  }

  function renderLineNumbers() {
    const editor = document.getElementById('pg-editor');
    const lines = state.root?.querySelector('[data-wdga-lines]');
    if (!editor || !lines) return;
    const count = Math.max(1, editor.value.split('\n').length);
    lines.textContent = Array.from({ length: count }, (_, index) => index + 1).join('\n');
    lines.scrollTop = editor.scrollTop;
  }

  function setActiveFile(path, options) {
    if (!options?.silent) captureEditor();
    const project = state.activeProject;
    const file = project?.files.find(item => item.name === path);
    if (!file) return;
    project.openFiles = Array.isArray(project.openFiles) ? project.openFiles : [];
    if (!project.openFiles.includes(file.name)) project.openFiles.push(file.name);
    project.activeFile = file.name;
    if (typeof pgActiveFile !== 'undefined') pgActiveFile = file.name;
    const editor = document.getElementById('pg-editor');
    if (editor) {
      editor.readOnly = Boolean(file.binary);
      editor.classList.toggle('is-binary', Boolean(file.binary));
      editor.placeholder = '';
      editor.value = file.binary
        ? (isEnglish ? 'Binary file\n\n' : 'Бинарный файл\n\n') + file.name + '\n' + Math.max(0, Number(file.byteSize || 0)).toLocaleString() + ' bytes\n' + (file.mime || 'application/octet-stream')
        : file.content;
    }
    const formatButton = state.root.querySelector('[data-wdga-format]');
    if (formatButton) formatButton.disabled = Boolean(file.binary);
    state.root.querySelector('[data-wdga-breadcrumb]').textContent = file.name.split('/').join('  ›  ');
    state.root.querySelector('[data-wdga-path]').textContent = 'atlas / ' + (file.name.includes('/') ? file.name.split('/').slice(0, -1).join(' / ') : '');
    renderTabs();
    renderTree();
    renderLineNumbers();
    hideEmmetSuggestion();
    updateEmmetStatus();
    if (!options?.silent) scheduleSave();
  }

  function showNoActiveFile() {
    const project = state.activeProject;
    if (!project || !state.root) return;
    project.activeFile = '';
    if (typeof pgActiveFile !== 'undefined') pgActiveFile = null;
    const editor = document.getElementById('pg-editor');
    if (editor) {
      editor.value = '';
      editor.readOnly = true;
      editor.classList.remove('is-binary');
      editor.placeholder = isEnglish ? 'Open a file from the project tree' : 'Открой файл в дереве проекта';
    }
    const formatButton = state.root.querySelector('[data-wdga-format]');
    if (formatButton) formatButton.disabled = true;
    state.root.querySelector('[data-wdga-breadcrumb]').textContent = isEnglish ? 'No file open' : 'Нет открытого файла';
    state.root.querySelector('[data-wdga-path]').textContent = 'atlas /';
    renderTabs();
    renderTree();
    renderLineNumbers();
    hideEmmetSuggestion();
    updateEmmetStatus();
  }

  function closeFileTab(path) {
    const project = state.activeProject;
    if (!project) return;
    if (project.activeFile === path) captureEditor();
    const openFiles = Array.isArray(project.openFiles) ? project.openFiles : [];
    const closingIndex = openFiles.indexOf(path);
    if (closingIndex < 0) return;
    project.openFiles = openFiles.filter(filePath => filePath !== path);
    if (project.activeFile === path) {
      const nextPath = project.openFiles[Math.min(closingIndex, project.openFiles.length - 1)] || '';
      if (nextPath) setActiveFile(nextPath, { silent: true });
      else showNoActiveFile();
    } else {
      renderTabs();
    }
    scheduleSave();
  }

  function treeModel() {
    const root = { name: '', path: '', folders: new Map(), files: [] };
    const ensureFolder = path => {
      let cursor = root;
      let current = '';
      normalizePath(path).split('/').filter(Boolean).forEach(part => {
        current = current ? current + '/' + part : part;
        if (!cursor.folders.has(part)) {
          cursor.folders.set(part, { name: part, path: current, folders: new Map(), files: [] });
        }
        cursor = cursor.folders.get(part);
      });
      return cursor;
    };
    state.activeProject.emptyFolders.forEach(ensureFolder);
    state.activeProject.files.forEach(file => {
      const parts = file.name.split('/');
      const name = parts.pop();
      const folder = ensureFolder(parts.join('/'));
      folder.files.push(Object.assign({}, file, { shortName: name }));
    });
    return root;
  }

  function renderTreeNode(node, depth) {
    let html = '';
    Array.from(node.folders.values()).sort((a, b) => a.name.localeCompare(b.name)).forEach(folder => {
      const expanded = state.activeProject.expandedFolders.includes(folder.path);
      html += '<div class="wdga-tree-row" style="padding-left:' + (7 + depth * 18) + 'px" data-wdga-folder="' + escapeHtml(folder.path) + '">' +
        '<span>' + (expanded ? '▾' : '▸') + '</span>' + icon(expanded ? 'tabler:folder-open' : 'tabler:folder', 14) +
        '<span class="wdga-tree-name">' + escapeHtml(folder.name) + '</span><button class="wdga-tree-more" type="button" data-wdga-item-menu="folder" data-path="' + escapeHtml(folder.path) + '">⋮</button></div>';
      if (expanded) html += renderTreeNode(folder, depth + 1);
    });
    node.files.sort((a, b) => a.shortName.localeCompare(b.shortName)).forEach(file => {
      const type = fileType(file.name);
      html += '<div class="wdga-tree-row' + (file.name === state.activeProject.activeFile ? ' active' : '') + '" style="padding-left:' + (11 + depth * 18) + 'px" data-wdga-tree-file="' + escapeHtml(file.name) + '">' +
        '<span class="wdga-file-badge ' + type + '">' + escapeHtml(type) + '</span><span class="wdga-tree-name">' + escapeHtml(file.shortName) + '</span>' +
        '<button class="wdga-tree-more" type="button" data-wdga-item-menu="file" data-path="' + escapeHtml(file.name) + '">⋮</button></div>';
    });
    return html;
  }

  function renderTree() {
    const tree = state.root?.querySelector('[data-wdga-tree]');
    if (!tree || !state.activeProject) return;
    tree.innerHTML = renderTreeNode(treeModel(), 0) || '<div class="wdga-empty">' + ui.empty + '</div>';
  }

  const toolCatalog = [
    ['shadow', 'tabler:box-model-2', isEnglish ? 'Box shadow' : 'Тень блока', isEnglish ? 'Build a clean box-shadow' : 'Собери аккуратный box-shadow'],
    ['text-shadow', 'tabler:text-size', isEnglish ? 'Text shadow' : 'Тень текста', isEnglish ? 'Generate text-shadow' : 'Настрой text-shadow'],
    ['radius', 'tabler:rounded-corner', isEnglish ? 'Border radius' : 'Скругление', isEnglish ? 'Tune every corner' : 'Настрой каждый угол'],
    ['gradient', 'tabler:color-swatch', isEnglish ? 'Gradient' : 'Градиент', isEnglish ? 'Linear gradient builder' : 'Генератор linear-gradient'],
    ['color', 'tabler:palette', isEnglish ? 'Color converter' : 'Конвертер цветов', 'HEX / RGB / HSL'],
    ['units', 'tabler:ruler-measure', isEnglish ? 'CSS units' : 'Единицы CSS', 'px / rem / em / %'],
    ['clamp', 'tabler:arrows-minimize', isEnglish ? 'Fluid clamp()' : 'Адаптивный clamp()', isEnglish ? 'Fluid size without media queries' : 'Плавный размер без media queries'],
    ['transform', 'tabler:transform', 'Transform', isEnglish ? 'Translate, rotate and scale' : 'Сдвиг, поворот и масштаб'],
    ['flex', 'tabler:layout-align-middle', 'Flexbox', isEnglish ? 'Useful alignment recipe' : 'Полезная схема выравнивания'],
    ['grid', 'tabler:layout-grid', 'CSS Grid', isEnglish ? 'Responsive columns' : 'Адаптивные колонки']
  ];

  function renderTools() {
    const view = state.root?.querySelector('[data-wdga-explorer-view="tools"]');
    if (!view) return;
    view.innerHTML = '<div class="wdga-tool-grid">' + toolCatalog.map(tool => (
      '<button class="wdga-tool-card" type="button" data-wdga-tool="' + tool[0] + '"><span class="wdga-tool-icon">' + icon(tool[1], 16) + '</span><span><b>' + escapeHtml(tool[2]) + '</b><small>' + escapeHtml(tool[3]) + '</small></span></button>'
    )).join('') + '</div>';
  }

  function snapshotRows() {
    const project = state.activeProject;
    const rows = [];
    if (project?.autosave) rows.push(Object.assign({ id: 'autosave', auto: true }, project.autosave));
    (project?.snapshots || []).forEach(snapshot => rows.push(snapshot));
    return rows;
  }

  function renderSnapshots() {
    const rows = snapshotRows();
    const compact = state.root?.querySelector('[data-wdga-snapshot-list]');
    const full = state.root?.querySelector('[data-wdga-explorer-view="snapshots"]');
    const markup = rows.length ? rows.slice(0, 5).map(snapshot => (
      '<div class="wdga-snapshot"><span class="wdga-snapshot-dot"></span><span>' + escapeHtml(snapshot.name || ui.snapshot) + '</span><time>' + nowTime(snapshot.savedAt) + '</time><button type="button" data-wdga-restore="' + escapeHtml(snapshot.id) + '" title="' + escapeHtml(ui.restored) + '">↶</button></div>'
    )).join('') : '<div class="wdga-empty">' + ui.empty + '</div>';
    if (compact) compact.innerHTML = markup;
    if (full) {
      full.innerHTML = rows.length ? '<div class="wdga-snapshot-list">' + rows.map(snapshot => (
        '<div class="wdga-snapshot"><span class="wdga-snapshot-dot"></span><span>' + escapeHtml(snapshot.name || ui.snapshot) + '</span><time>' + new Date(snapshot.savedAt).toLocaleString() + '</time><button type="button" data-wdga-restore="' + escapeHtml(snapshot.id) + '">↶</button></div>'
      )).join('') + '</div>' : '<div class="wdga-empty">' + ui.empty + '</div>';
    }
  }

  function renderConsole() {
    const body = state.root?.querySelector('[data-wdga-console-body]');
    if (!body) return;
    body.innerHTML = state.logs.length ? state.logs.map(item => (
      '<div class="wdga-log ' + item.type + '"><time>' + nowTime(item.time) + '</time><span class="wdga-log-type">[' + escapeHtml(item.type) + ']</span><span class="wdga-log-message">' + escapeHtml(item.message) + '</span></div>'
    )).join('') : '<div class="wdga-empty">' + ui.empty + '</div>';
  }

  function renderChecks() {
    const panel = state.root?.querySelector('[data-wdga-check]');
    if (!panel) return;
    if (!state.checks.length) state.checks = buildChecks();
    const done = state.checks.filter(check => check.done).length;
    const percent = state.checks.length ? Math.round(done / state.checks.length * 100) : 0;
    panel.innerHTML = `
      <span class="wdga-kicker">${ui.projectCheck}</span>
      <h2>${escapeHtml(state.activeProject?.name || ui.projectCheck)}</h2>
      <div class="wdga-check-sub">${projectStack()}</div>
      <div class="wdga-progress-label">${done} / ${state.checks.length} ${isEnglish ? 'ready' : 'готово'}</div>
      <div class="wdga-progress"><i style="width:${percent}%"></i></div>
      <div class="wdga-check-list">${state.checks.map(check => (
        '<div class="wdga-check-item ' + (check.done ? 'done' : '') + '"><span class="wdga-check-mark">' + (check.done ? '✓' : '') + '</span><span>' + escapeHtml(check.label) + '</span></div>'
      )).join('')}</div>
      <div class="wdga-check-actions">
        <button class="wdga-btn" type="button" data-wdga-hint>${icon('tabler:bulb', 14)} ${ui.hint}</button>
        <button class="wdga-btn" type="button" data-wdga-inspect>${icon('tabler:target-arrow', 14)} ${ui.inspect}</button>
        <button class="wdga-btn primary" type="button" data-wdga-validate>${icon('tabler:player-play', 14)} ${ui.check}</button>
        <button class="wdga-btn" type="button" data-wdga-publish>${icon('tabler:external-link', 14)} ${ui.publish}</button>
      </div>`;
  }

  function renderAll() {
    renderProjectSelect();
    renderTabs();
    renderTree();
    renderTools();
    renderSnapshots();
    if (state.activeProject.activeFile && state.activeProject.openFiles?.includes(state.activeProject.activeFile)) {
      setActiveFile(state.activeProject.activeFile, { silent: true });
    } else {
      showNoActiveFile();
    }
    renderConsole();
  }

  function addFile() {
    const raw = window.prompt(ui.filePath, 'src/app.js');
    const path = normalizePath(raw);
    if (!path || state.activeProject.files.some(file => file.name === path)) return;
    const type = fileType(path);
    const content = type === 'html' ? '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>WebDevGym</title>\n</head>\n<body>\n\n</body>\n</html>' :
      type === 'css' ? ':root {\n  color-scheme: dark;\n}\n' :
        type === 'js' || type === 'ts' ? '"use strict";\n\n' : '';
    state.activeProject.files.push({ id: uid('file'), name: path, content, updatedAt: Date.now() });
    state.activeProject.activeFile = path;
    const parent = path.split('/').slice(0, -1).join('/');
    if (parent && !state.activeProject.expandedFolders.includes(parent)) state.activeProject.expandedFolders.push(parent);
    syncCoreFiles();
    setActiveFile(path);
    runPreview();
  }

  function addFolder() {
    const path = normalizePath(window.prompt(ui.folderPath, 'src/components'));
    if (!path || state.activeProject.emptyFolders.includes(path)) return;
    state.activeProject.emptyFolders.push(path);
    if (!state.activeProject.expandedFolders.includes(path)) state.activeProject.expandedFolders.push(path);
    renderTree();
    scheduleSave();
  }

  function renameItem(kind, path) {
    const next = normalizePath(window.prompt(ui.rename, path));
    if (!next || next === path) return;
    if (kind === 'file') {
      if (state.activeProject.files.some(file => file.name === next)) return;
      const file = state.activeProject.files.find(item => item.name === path);
      if (!file) return;
      file.name = next;
      if (state.activeProject.activeFile === path) state.activeProject.activeFile = next;
      if (state.activeProject.entryFile === path) state.activeProject.entryFile = next;
      state.activeProject.openFiles = (state.activeProject.openFiles || []).map(filePath => filePath === path ? next : filePath);
    } else {
      state.activeProject.files.forEach(file => {
        if (file.name === path || file.name.startsWith(path + '/')) file.name = next + file.name.slice(path.length);
      });
      state.activeProject.emptyFolders = state.activeProject.emptyFolders.map(folder => folder === path || folder.startsWith(path + '/') ? next + folder.slice(path.length) : folder);
      state.activeProject.expandedFolders = state.activeProject.expandedFolders.map(folder => folder === path || folder.startsWith(path + '/') ? next + folder.slice(path.length) : folder);
      if (state.activeProject.activeFile.startsWith(path + '/')) state.activeProject.activeFile = next + state.activeProject.activeFile.slice(path.length);
      if (state.activeProject.entryFile.startsWith(path + '/')) state.activeProject.entryFile = next + state.activeProject.entryFile.slice(path.length);
      state.activeProject.openFiles = (state.activeProject.openFiles || []).map(filePath => (
        filePath.startsWith(path + '/') ? next + filePath.slice(path.length) : filePath
      ));
    }
    syncCoreFiles();
    renderAll();
    scheduleSave();
  }

  function deleteItem(kind, path) {
    if (!window.confirm(ui.confirmDelete)) return;
    if (kind === 'file') {
      if (state.activeProject.files.length <= 1) return;
      state.activeProject.files = state.activeProject.files.filter(file => file.name !== path);
    } else {
      state.activeProject.files = state.activeProject.files.filter(file => !file.name.startsWith(path + '/'));
      state.activeProject.emptyFolders = state.activeProject.emptyFolders.filter(folder => folder !== path && !folder.startsWith(path + '/'));
    }
    state.activeProject.openFiles = (state.activeProject.openFiles || []).filter(filePath => (
      state.activeProject.files.some(file => file.name === filePath)
    ));
    if (!state.activeProject.files.some(file => file.name === state.activeProject.activeFile)) {
      state.activeProject.activeFile = state.activeProject.openFiles[0] || state.activeProject.files[0]?.name || '';
      if (state.activeProject.activeFile && !state.activeProject.openFiles.includes(state.activeProject.activeFile)) {
        state.activeProject.openFiles.push(state.activeProject.activeFile);
      }
    }
    if (!state.activeProject.files.some(file => file.name === state.activeProject.entryFile)) {
      state.activeProject.entryFile = state.activeProject.files.find(file => fileType(file.name) === 'html')?.name || '';
    }
    syncCoreFiles();
    renderAll();
    runPreview();
    scheduleSave();
  }

  function createProject() {
    if (state.projects.length >= MAX_PROJECTS) return;
    const name = window.prompt(ui.projectName, isEnglish ? 'New web project' : 'Новый веб-проект');
    if (!name?.trim()) return;
    captureEditor();
    const project = newProject(name.trim(), [
      { name: 'index.html', content: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>' + name.trim() + '</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>' + name.trim() + '</h1>\n  <script src="script.js"></script>\n</body>\n</html>' },
      { name: 'style.css', content: 'body {\n  margin: 0;\n  min-height: 100vh;\n  font-family: system-ui, sans-serif;\n}\n' },
      { name: 'script.js', content: '"use strict";\n' }
    ]);
    state.projects.unshift(project);
    persistProject(project);
    activateProject(project.id);
  }

  async function deleteActiveProject() {
    const project = state.activeProject;
    if (!project) return;
    const message = ui.confirmDeleteProject.replace('{name}', project.name);
    if (!window.confirm(message)) return;
    captureEditor();
    state.projects = state.projects.filter(item => item.id !== project.id);
    await deletePersistedProject(project.id);
    if (!state.projects.length) {
      const fallback = newProject(isEnglish ? 'Untitled project' : 'Новый проект');
      state.projects.push(fallback);
      await persistProject(fallback);
    }
    state.activeProject = state.projects[0];
    state.checks = [];
    state.problems = [];
    syncCoreFiles();
    writeJson(META_KEY, { activeProjectId: state.activeProject.id });
    renderAll();
    runPreview();
    await persistProject(state.activeProject);
    notify(ui.projectDeleted);
  }

  function duplicateProject() {
    captureEditor();
    const duplicate = normalizeProject(clone(state.activeProject));
    duplicate.id = uid('project');
    duplicate.name += isEnglish ? ' copy' : ' — копия';
    duplicate.createdAt = Date.now();
    duplicate.updatedAt = Date.now();
    duplicate.snapshots = [];
    state.projects.unshift(duplicate);
    persistProject(duplicate);
    activateProject(duplicate.id);
    notify(ui.copied);
  }

  async function activateProject(projectId) {
    captureEditor();
    const project = state.projects.find(item => item.id === projectId);
    if (!project) return;
    state.activeProject = project;
    state.checks = [];
    state.problems = [];
    syncCoreFiles();
    writeJson(META_KEY, { activeProjectId: project.id });
    renderAll();
    runPreview();
    await persistProject(project);
  }

  function createSnapshot() {
    captureEditor();
    const name = window.prompt(ui.snapshotName, isEnglish ? 'Working version' : 'Рабочая версия');
    if (!name?.trim()) return;
    state.activeProject.snapshots.unshift({
      id: uid('snapshot'),
      name: name.trim(),
      savedAt: Date.now(),
      files: clone(state.activeProject.files),
      activeFile: state.activeProject.activeFile,
      openFiles: clone(state.activeProject.openFiles || []),
      entryFile: state.activeProject.entryFile
    });
    state.activeProject.snapshots = state.activeProject.snapshots.slice(0, MAX_SNAPSHOTS);
    persistProject(state.activeProject);
    renderSnapshots();
    renderHistory();
    notify(ui.projectSaved);
  }

  function restoreSnapshot(snapshotId) {
    const snapshot = snapshotId === 'autosave'
      ? state.activeProject.autosave
      : state.activeProject.snapshots.find(item => item.id === snapshotId);
    if (!snapshot) return;
    state.activeProject.files = clone(snapshot.files);
    state.activeProject.activeFile = snapshot.activeFile || state.activeProject.files[0]?.name || '';
    state.activeProject.openFiles = Array.isArray(snapshot.openFiles)
      ? snapshot.openFiles.filter(path => state.activeProject.files.some(file => file.name === path))
      : (state.activeProject.activeFile ? [state.activeProject.activeFile] : []);
    if (state.activeProject.activeFile && !state.activeProject.openFiles.includes(state.activeProject.activeFile)) {
      state.activeProject.openFiles.push(state.activeProject.activeFile);
    }
    state.activeProject.entryFile = snapshot.entryFile || state.activeProject.files.find(file => fileType(file.name) === 'html')?.name || '';
    syncCoreFiles();
    renderAll();
    runPreview();
    scheduleSave();
    state.root.querySelector('[data-wdga-history-dialog]')?.close();
    notify(ui.restored);
  }

  function renderHistory() {
    const list = state.root?.querySelector('[data-wdga-history-list]');
    if (!list) return;
    const rows = snapshotRows();
    list.innerHTML = rows.length ? rows.map(snapshot => (
      '<article class="wdga-history-item"><div><strong>' + escapeHtml(snapshot.name || ui.snapshot) + '</strong><small>' + new Date(snapshot.savedAt).toLocaleString() + ' · ' + snapshot.files.length + ' ' + (isEnglish ? 'files' : 'файлов') + '</small></div><button class="wdga-btn" type="button" data-wdga-restore="' + escapeHtml(snapshot.id) + '">' + icon('tabler:restore', 14) + ' ' + (isEnglish ? 'Restore' : 'Вернуть') + '</button></article>'
    )).join('') : '<div class="wdga-empty">' + ui.empty + '</div>';
  }

  function formatCurrentFile() {
    const editor = document.getElementById('pg-editor');
    const file = currentFile();
    if (!editor || !file || file.binary) return;
    let level = 0;
    const type = fileType(file.name);
    const lines = editor.value.replace(/\t/g, '  ').split('\n').map(line => line.trimEnd());
    if (type === 'html') {
      editor.value = lines.map(line => {
        const trimmed = line.trim();
        if (/^<\//.test(trimmed)) level = Math.max(0, level - 1);
        const output = '  '.repeat(level) + trimmed;
        if (/^<[^!/][^>]*[^/]>/i.test(trimmed) && !/<\/[^>]+>$/.test(trimmed) && !/^<(meta|link|img|input|br|hr)\b/i.test(trimmed)) level += 1;
        return output;
      }).join('\n').trim() + '\n';
    } else if (type === 'css' || type === 'js' || type === 'ts') {
      editor.value = lines.map(line => {
        const trimmed = line.trim();
        if (/^[}\])]/.test(trimmed)) level = Math.max(0, level - 1);
        const output = '  '.repeat(level) + trimmed;
        const opens = (trimmed.match(/{/g) || []).length;
        const closes = (trimmed.match(/}/g) || []).length;
        level = Math.max(0, level + opens - closes);
        return output;
      }).join('\n').trim() + '\n';
    } else {
      editor.value = lines.join('\n').trim() + '\n';
    }
    captureEditor();
    renderLineNumbers();
    scheduleSave();
    runPreview();
    log('success', ui.formatted);
  }

  function searchReplace() {
    const editor = document.getElementById('pg-editor');
    if (!editor) return;
    const search = window.prompt(ui.searchPrompt, '');
    if (!search) return;
    const replacement = window.prompt(ui.replacePrompt, '') ?? '';
    editor.value = editor.value.split(search).join(replacement);
    captureEditor();
    renderLineNumbers();
    scheduleSave();
    runPreview();
  }

  function insertSnippet() {
    const editor = document.getElementById('pg-editor');
    const file = currentFile();
    if (!editor || !file) return;
    const type = fileType(file.name);
    const snippet = type === 'html'
      ? '<section class="feature">\n  <h2>Заголовок</h2>\n  <p>Описание блока.</p>\n</section>'
      : type === 'css'
        ? '.feature {\n  display: grid;\n  gap: 12px;\n  padding: 24px;\n}'
        : type === 'js' || type === 'ts'
          ? 'const button = document.querySelector(".button");\n\nbutton?.addEventListener("click", () => {\n  console.log("Клик работает");\n});'
          : '# WebDevGym\n\nОписание проекта.';
    const start = editor.selectionStart;
    editor.setRangeText(snippet, start, editor.selectionEnd, 'end');
    captureEditor();
    renderLineNumbers();
    scheduleSave();
    log('success', ui.insertSnippet);
  }

  function syntaxProblems() {
    captureEditor();
    const problems = [];
    state.activeProject.files.forEach(file => {
      if (file.binary) return;
      const type = fileType(file.name);
      if (type === 'js') {
        try {
          new Function(file.content);
        } catch (error) {
          problems.push({ type: 'error', message: file.name + ': ' + error.message, time: Date.now() });
        }
      }
      if (type === 'css') {
        const opens = (file.content.match(/{/g) || []).length;
        const closes = (file.content.match(/}/g) || []).length;
        if (opens !== closes) problems.push({ type: 'error', message: file.name + ': CSS braces ' + opens + '/' + closes, time: Date.now() });
      }
      if (type === 'html' && !/<html[\s>]/i.test(file.content)) {
        problems.push({ type: 'warn', message: file.name + ': ' + (isEnglish ? 'missing <html> root element' : 'нет корневого элемента <html>'), time: Date.now() });
      }
    });
    return problems;
  }

  function buildChecks() {
    captureEditor();
    const files = state.activeProject.files;
    const htmlFiles = files.filter(file => fileType(file.name) === 'html');
    const cssFiles = files.filter(file => fileType(file.name) === 'css');
    const jsFiles = files.filter(file => fileType(file.name) === 'js');
    const all = files.filter(file => !file.binary).map(file => file.content).join('\n');
    const jsValid = jsFiles.every(file => {
      try {
        new Function(file.content);
        return true;
      } catch (error) {
        return false;
      }
    });
    const cssValid = cssFiles.every(file => (file.content.match(/{/g) || []).length === (file.content.match(/}/g) || []).length);
    const checks = [
      { id: 'entry', label: isEnglish ? 'The project has an HTML entry file' : 'В проекте есть входной HTML-файл', done: Boolean(htmlFiles.length) },
      { id: 'js', label: isEnglish ? 'JavaScript has no syntax errors' : 'В JavaScript нет синтаксических ошибок', done: jsValid },
      { id: 'css', label: isEnglish ? 'CSS blocks are closed correctly' : 'CSS-блоки закрыты корректно', done: cssValid },
      { id: 'viewport', label: isEnglish ? 'The page has a mobile viewport' : 'На странице настроен мобильный viewport', done: htmlFiles.some(file => /name=["']viewport["']/i.test(file.content)) }
    ];
    if (/\bplus\b|\bminus\b|\breset\b/i.test(all)) {
      checks.splice(1, 0,
        { id: 'controls', label: isEnglish ? 'Plus, minus and reset controls exist' : 'Есть кнопки плюс, минус и сброс', done: /plus/i.test(all) && /minus/i.test(all) && /reset/i.test(all) },
        { id: 'floor', label: isEnglish ? 'The value cannot go below zero' : 'Значение не уходит ниже нуля', done: /Math\.max\s*\(\s*0|if\s*\([^)]*(score|count|value)[^)]*>\s*0/i.test(all) }
      );
    }
    if (/localStorage/i.test(all)) {
      checks.push({ id: 'storage', label: isEnglish ? 'State is saved in localStorage' : 'Состояние сохраняется в localStorage', done: /localStorage\.setItem/i.test(all) && /localStorage\.getItem/i.test(all) });
    }
    return checks;
  }

  function validateProject() {
    state.problems = syntaxProblems();
    state.checks = buildChecks();
    renderChecks();
    renderConsole();
    runPreview();
    const passed = state.checks.filter(check => check.done).length;
    log(state.problems.length ? 'warn' : 'success', (isEnglish ? 'Project check: ' : 'Проверка проекта: ') + passed + '/' + state.checks.length);
  }

  function injectConsoleBridge(source) {
    const bridge = `<script>
      (function () {
        const send = (level, args) => {
          const values = Array.from(args).map(value => {
            if (typeof value === 'string') return value;
            try { return JSON.stringify(value); } catch (error) { return String(value); }
          });
          parent.postMessage({ type: 'wdga-console', level, values }, '*');
        };
        ['log', 'info', 'warn', 'error'].forEach(level => {
          const original = console[level];
          console[level] = function () { send(level, arguments); original.apply(console, arguments); };
        });
        window.addEventListener('error', event => send('error', [event.message + ' @ ' + event.lineno + ':' + event.colno]));
        window.addEventListener('unhandledrejection', event => send('error', ['Promise: ' + String(event.reason)]));
      })();
    <\/script>`;
    return source.includes('</head>') ? source.replace('</head>', bridge + '</head>') : bridge + source;
  }

  function relativeProjectPath(sourcePath, targetPath) {
    const source = normalizePath(sourcePath).split('/').slice(0, -1);
    const target = normalizePath(targetPath).split('/');
    while (source.length && target.length && source[0] === target[0]) {
      source.shift();
      target.shift();
    }
    return '../'.repeat(source.length) + target.join('/');
  }

  function replaceAssetReferences(content, sourcePath, assets) {
    let output = String(content || '');
    assets.forEach(asset => {
      const relative = relativeProjectPath(sourcePath, asset.name);
      const references = [...new Set([
        asset.name,
        './' + asset.name,
        relative,
        relative && !relative.startsWith('.') ? './' + relative : '',
        encodeURI(asset.name),
        encodeURI(relative)
      ].filter(Boolean))].sort((a, b) => b.length - a.length);
      const assetUrl = asset.previewUrl || asset.content;
      references.forEach(reference => { output = output.split(reference).join(assetUrl); });
    });
    return output;
  }

  function previewProjectFiles() {
    const assets = state.activeProject.files
      .filter(file => file.binary && /^data:/.test(file.content))
      .map(file => ({ ...file, previewUrl: file.content }));
    if (!assets.length) return state.activeProject.files;
    return state.activeProject.files.map(file => file.binary ? file : {
      ...file,
      content: replaceAssetReferences(file.content, file.name, assets)
    });
  }

  function runPreview() {
    state.previewReady = true;
    captureEditor();
    syncCoreFiles();
    const iframe = document.getElementById('pg-iframe');
    if (!iframe) return;
    let entry = state.activeProject.entryFile;
    if (!state.activeProject.files.some(file => file.name === entry)) {
      entry = state.activeProject.files.find(file => fileType(file.name) === 'html')?.name || '';
      state.activeProject.entryFile = entry;
    }
    const select = document.getElementById('pgEntrySelect');
    if (select) {
      select.innerHTML = state.activeProject.files.filter(file => fileType(file.name) === 'html').map(file => (
        '<option value="' + escapeHtml(file.name) + '"' + (file.name === entry ? ' selected' : '') + '>' + escapeHtml(file.name) + '</option>'
      )).join('');
    }
    if (!entry) {
      iframe.srcdoc = '<p style="font-family:system-ui;padding:24px">No HTML entry file</p>';
      return;
    }
    let documentSource = '';
    const originalCoreFiles = typeof pgFiles !== 'undefined' ? pgFiles : null;
    const previewFiles = previewProjectFiles();
    try {
      if (typeof pgFiles !== 'undefined') pgFiles = previewFiles;
      documentSource = typeof pgBuildEntryDoc === 'function'
        ? pgBuildEntryDoc(entry)
        : previewFiles.find(file => file.name === entry)?.content || '';
    } catch (error) {
      documentSource = previewFiles.find(file => file.name === entry)?.content || '';
      log('error', error.message);
    } finally {
      if (typeof pgFiles !== 'undefined') pgFiles = originalCoreFiles || state.activeProject.files;
    }
    iframe.srcdoc = injectConsoleBridge(documentSource);
    log('info', ui.started);
    scheduleSave();
  }

  function projectStack() {
    const stackTypes = new Set(['html', 'css', 'js', 'mjs', 'ts']);
    const types = [...new Set(state.activeProject.files.map(file => fileType(file.name)).filter(type => stackTypes.has(type)))];
    return types.map(type => type.toUpperCase()).join(' · ') || 'Web';
  }

  function publishToProfile() {
    captureEditor();
    const list = readJson(PORTFOLIO_KEY, []);
    const existingIndex = list.findIndex(item => item.playgroundProjectId === state.activeProject.id);
    const item = {
      id: existingIndex >= 0 ? list[existingIndex].id : uid('project'),
      playgroundProjectId: state.activeProject.id,
      title: state.activeProject.name,
      description: isEnglish
        ? 'Interactive browser project created in WebDevGym Playground.'
        : 'Интерактивный браузерный проект, созданный в WebDevGym Playground.',
      link: '',
      stack: projectStack(),
      status: 'finished',
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now(),
      hasScreenshot: existingIndex >= 0 ? Boolean(list[existingIndex].hasScreenshot) : false,
      source: 'playground'
    };
    if (existingIndex >= 0) list[existingIndex] = item;
    else list.unshift(item);
    writeJson(PORTFOLIO_KEY, list.slice(0, 30));
    window.dispatchEvent(new CustomEvent('webdevgym:portfolio-updated', { detail: item }));
    if (window.WebDevGymFeatures?.logActivity) window.WebDevGymFeatures.logActivity(1);
    notify(ui.projectPublished);
    log('success', ui.projectPublished);
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function exportProjectJson() {
    captureEditor();
    const payload = JSON.stringify({
      type: 'webdevgym-playground-project',
      version: 1,
      exportedAt: new Date().toISOString(),
      project: state.activeProject
    }, null, 2);
    downloadBlob(new Blob([payload], { type: 'application/json' }), state.activeProject.name.replace(/[^\wа-яё-]+/gi, '-').toLowerCase() + '.json');
  }

  function setImportStatus(message, error = false) {
    const status = state.root?.querySelector('[data-wdga-import-status]');
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('error', error);
  }

  function ignoredImportPath(path) {
    const normalized = '/' + normalizePath(path).toLowerCase() + '/';
    return normalized.includes('/node_modules/') || normalized.includes('/.git/') ||
      normalized.includes('/.idea/') || normalized.includes('/.vscode/') ||
      /\/(thumbs\.db|desktop\.ini|\.ds_store)\/$/.test(normalized);
  }

  function safeImportPath(path) {
    const normalized = normalizePath(path).replace(/^\.\//, '');
    if (!normalized || normalized.split('/').includes('..') || ignoredImportPath(normalized)) return '';
    return normalized;
  }

  function mimeForPath(path, fallback = '') {
    if (fallback) return fallback;
    const extension = normalizePath(path).split('.').pop().toLowerCase();
    return ({
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
      svg: 'image/svg+xml', ico: 'image/x-icon', avif: 'image/avif', mp3: 'audio/mpeg', wav: 'audio/wav',
      ogg: 'audio/ogg', m4a: 'audio/mp4', mp4: 'video/mp4', webm: 'video/webm', woff: 'font/woff',
      woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', json: 'application/json',
      js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', html: 'text/html', txt: 'text/plain'
    })[extension] || 'application/octet-stream';
  }

  function isTextImport(path, mime = '') {
    const name = normalizePath(path).split('/').pop().toLowerCase();
    const extension = name.includes('.') ? name.split('.').pop() : name;
    return TEXT_EXTENSIONS.has(extension) || ['license', 'readme', 'dockerfile', 'makefile'].includes(name) ||
      /^text\//.test(mime) || /(?:json|javascript|xml|svg)/.test(mime);
  }

  function bytesToDataUrl(bytes, mime) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return 'data:' + mime + ';base64,' + btoa(binary);
  }

  function dataUrlBytes(value) {
    const match = String(value || '').match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.*)$/s);
    if (!match) return new TextEncoder().encode(String(value || ''));
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  async function importedFileRecord(path, source, mime = '') {
    const name = safeImportPath(path);
    if (!name) return null;
    const type = mimeForPath(name, mime || source?.type || '');
    const size = Number(source?.size ?? source?.byteLength ?? 0);
    if (size > MAX_IMPORT_FILE_BYTES) throw new Error('IMPORT_TOO_LARGE');
    if (source instanceof File) {
      if (isTextImport(name, type)) {
        return { name, content: await source.text(), binary: false, mime: type, byteSize: size };
      }
      const bytes = new Uint8Array(await source.arrayBuffer());
      return { name, content: bytesToDataUrl(bytes, type), binary: true, mime: type, byteSize: bytes.length };
    }
    const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
    return isTextImport(name, type)
      ? { name, content: new TextDecoder().decode(bytes), binary: false, mime: type, byteSize: bytes.length }
      : { name, content: bytesToDataUrl(bytes, type), binary: true, mime: type, byteSize: bytes.length };
  }

  function commonRoot(paths) {
    const roots = paths.map(path => normalizePath(path).split('/')).filter(parts => parts.length > 1).map(parts => parts[0]);
    return roots.length === paths.length && roots.every(root => root === roots[0]) ? roots[0] : '';
  }

  function stripProjectRoot(path, root) {
    const normalized = normalizePath(path);
    return root && normalized.startsWith(root + '/') ? normalized.slice(root.length + 1) : normalized;
  }

  function uniqueImportPath(path, used) {
    if (!used.has(path)) {
      used.add(path);
      return path;
    }
    const dot = path.lastIndexOf('.');
    const base = dot > path.lastIndexOf('/') ? path.slice(0, dot) : path;
    const extension = dot > path.lastIndexOf('/') ? path.slice(dot) : '';
    let number = 2;
    while (used.has(base + '-' + number + extension)) number += 1;
    const result = base + '-' + number + extension;
    used.add(result);
    return result;
  }

  async function saveImportedProject(name, files, emptyFolders = []) {
    if (!files.length) throw new Error('IMPORT_EMPTY');
    captureEditor();
    const project = newProject(name, files);
    project.emptyFolders = emptyFolders.filter(Boolean);
    project.expandedFolders = [...new Set(files.flatMap(file => {
      const parts = file.name.split('/');
      return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
    }).concat(project.emptyFolders))];
    state.projects.unshift(project);
    state.projects = state.projects.slice(0, MAX_PROJECTS);
    await persistProject(project);
    await activateProject(project.id);
    state.root?.querySelector('[data-wdga-import-dialog]')?.close();
    setImportStatus('');
    notify(ui.importDone + ': ' + project.name);
    log('success', ui.importDone + ': ' + files.length);
  }

  function importErrorMessage(error) {
    if (error?.message === 'IMPORT_TOO_MANY') return ui.importTooMany;
    if (error?.message === 'IMPORT_TOO_LARGE') return ui.importTooLarge;
    if (error?.message === 'IMPORT_EMPTY') return ui.importEmpty;
    if (error?.message === 'ZIP_UNSUPPORTED') return ui.importUnsupportedZip;
    return ui.invalidImport;
  }

  async function importSelectedFiles(fileList, folderMode = false) {
    try {
      setImportStatus(ui.importing);
      const selected = Array.from(fileList || []).map(file => ({
        file,
        path: safeImportPath(folderMode ? (file.webkitRelativePath || file.name) : file.name)
      })).filter(item => item.path);
      if (!selected.length) throw new Error('IMPORT_EMPTY');
      if (selected.length > MAX_IMPORT_FILES) throw new Error('IMPORT_TOO_MANY');
      const total = selected.reduce((sum, item) => sum + item.file.size, 0);
      if (total > MAX_IMPORT_BYTES || selected.some(item => item.file.size > MAX_IMPORT_FILE_BYTES)) throw new Error('IMPORT_TOO_LARGE');
      const root = folderMode ? commonRoot(selected.map(item => item.path)) : '';
      const used = new Set();
      const records = [];
      for (const item of selected) {
        const path = uniqueImportPath(stripProjectRoot(item.path, root), used);
        const record = await importedFileRecord(path, item.file);
        if (record) records.push(record);
      }
      const fallbackName = records.length === 1
        ? records[0].name.replace(/\.[^.]+$/, '')
        : (isEnglish ? 'Imported project' : 'Импортированный проект');
      await saveImportedProject(root || fallbackName, records);
    } catch (error) {
      const message = importErrorMessage(error);
      setImportStatus(message, true);
      notify(message);
    }
  }

  async function inflateZipBytes(bytes) {
    if (!('DecompressionStream' in window)) throw new Error('ZIP_UNSUPPORTED');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function readZipProject(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let endOffset = -1;
    for (let offset = Math.max(0, bytes.length - 65557); offset <= bytes.length - 22; offset += 1) {
      if (view.getUint32(offset, true) === 0x06054b50) endOffset = offset;
    }
    if (endOffset < 0) throw new Error('ZIP_UNSUPPORTED');
    const entryCount = view.getUint16(endOffset + 10, true);
    let centralOffset = view.getUint32(endOffset + 16, true);
    if (entryCount > MAX_IMPORT_FILES) throw new Error('IMPORT_TOO_MANY');
    const decoder = new TextDecoder();
    const entries = [];
    const folders = [];
    let totalSize = 0;
    for (let index = 0; index < entryCount; index += 1) {
      if (view.getUint32(centralOffset, true) !== 0x02014b50) throw new Error('ZIP_UNSUPPORTED');
      const flags = view.getUint16(centralOffset + 8, true);
      const method = view.getUint16(centralOffset + 10, true);
      const compressedSize = view.getUint32(centralOffset + 20, true);
      const size = view.getUint32(centralOffset + 24, true);
      const nameLength = view.getUint16(centralOffset + 28, true);
      const extraLength = view.getUint16(centralOffset + 30, true);
      const commentLength = view.getUint16(centralOffset + 32, true);
      const localOffset = view.getUint32(centralOffset + 42, true);
      const rawName = decoder.decode(bytes.subarray(centralOffset + 46, centralOffset + 46 + nameLength));
      const path = safeImportPath(rawName);
      centralOffset += 46 + nameLength + extraLength + commentLength;
      if (!path) continue;
      if (rawName.endsWith('/')) {
        folders.push(path);
        continue;
      }
      if ((flags & 1) || ![0, 8].includes(method)) throw new Error('ZIP_UNSUPPORTED');
      totalSize += size;
      if (size > MAX_IMPORT_FILE_BYTES || totalSize > MAX_IMPORT_BYTES) throw new Error('IMPORT_TOO_LARGE');
      if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('ZIP_UNSUPPORTED');
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.subarray(dataOffset, dataOffset + compressedSize);
      const content = method === 0 ? compressed.slice() : await inflateZipBytes(compressed);
      entries.push({ path, content });
    }
    if (!entries.length) throw new Error('IMPORT_EMPTY');
    const root = commonRoot(entries.map(entry => entry.path));
    const used = new Set();
    const records = [];
    for (const entry of entries) {
      const path = uniqueImportPath(stripProjectRoot(entry.path, root), used);
      const record = await importedFileRecord(path, entry.content);
      if (record) records.push(record);
    }
    return {
      name: root || file.name.replace(/\.zip$/i, '') || (isEnglish ? 'Imported project' : 'Импортированный проект'),
      files: records,
      emptyFolders: folders.map(path => stripProjectRoot(path, root)).filter(Boolean)
    };
  }

  async function importZipFile(file) {
    try {
      setImportStatus(ui.importing);
      if (file.size > MAX_IMPORT_BYTES) throw new Error('IMPORT_TOO_LARGE');
      const project = await readZipProject(file);
      await saveImportedProject(project.name, project.files, project.emptyFolders);
    } catch (error) {
      const message = importErrorMessage(error);
      setImportStatus(message, true);
      notify(message);
    }
  }

  async function importProjectFile(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (payload.type !== 'webdevgym-playground-project' || !payload.project) throw new Error('Invalid project');
      const project = normalizeProject(payload.project);
      project.id = uid('project');
      project.name += isEnglish ? ' imported' : ' — импорт';
      state.projects.unshift(project);
      state.projects = state.projects.slice(0, MAX_PROJECTS);
      await persistProject(project);
      await activateProject(project.id);
      state.root?.querySelector('[data-wdga-import-dialog]')?.close();
      setImportStatus('');
      notify(ui.importDone + ': ' + project.name);
    } catch (error) {
      setImportStatus(ui.invalidImport, true);
      notify(ui.invalidImport);
    }
  }

  function crcTable() {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let value = n;
      for (let k = 0; k < 8; k += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      table[n] = value >>> 0;
    }
    return table;
  }

  const ZIP_CRC_TABLE = crcTable();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) crc = ZIP_CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function le16(value) {
    return new Uint8Array([value & 255, (value >>> 8) & 255]);
  }

  function le32(value) {
    return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
  }

  function concatBytes(parts) {
    const size = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(size);
    let offset = 0;
    parts.forEach(part => {
      output.set(part, offset);
      offset += part.length;
    });
    return output;
  }

  function makeZip(files) {
    const encoder = new TextEncoder();
    const locals = [];
    const centrals = [];
    let offset = 0;
    files.forEach(file => {
      const name = encoder.encode(normalizePath(file.name));
      const data = file.binary ? dataUrlBytes(file.content) : encoder.encode(String(file.content || ''));
      const crc = crc32(data);
      const local = concatBytes([
        le32(0x04034b50), le16(20), le16(0x0800), le16(0), le16(0), le16(0),
        le32(crc), le32(data.length), le32(data.length), le16(name.length), le16(0), name, data
      ]);
      const central = concatBytes([
        le32(0x02014b50), le16(20), le16(20), le16(0x0800), le16(0), le16(0), le16(0),
        le32(crc), le32(data.length), le32(data.length), le16(name.length), le16(0), le16(0),
        le16(0), le16(0), le32(0), le32(offset), name
      ]);
      locals.push(local);
      centrals.push(central);
      offset += local.length;
    });
    const centralSize = centrals.reduce((sum, item) => sum + item.length, 0);
    const end = concatBytes([
      le32(0x06054b50), le16(0), le16(0), le16(files.length), le16(files.length),
      le32(centralSize), le32(offset), le16(0)
    ]);
    return concatBytes([...locals, ...centrals, end]);
  }

  function downloadZip() {
    captureEditor();
    const bytes = makeZip(state.activeProject.files);
    const name = state.activeProject.name.replace(/[^\wа-яё-]+/gi, '-').toLowerCase() || 'webdevgym-project';
    downloadBlob(new Blob([bytes], { type: 'application/zip' }), name + '.zip');
  }

  function toolRange(label, name, value, min, max, step, unit) {
    return '<label class="wdga-tool-control"><span>' + escapeHtml(label) + '<output data-wdga-tool-value="' + name + '">' + value + (unit || '') + '</output></span><input type="range" name="' + name + '" value="' + value + '" min="' + min + '" max="' + max + '" step="' + (step || 1) + '" data-unit="' + escapeHtml(unit || '') + '"></label>';
  }

  function toolColor(label, name, value) {
    return '<label class="wdga-tool-control compact"><span>' + escapeHtml(label) + '</span><input type="color" name="' + name + '" value="' + value + '"></label>';
  }

  function toolSelect(label, name, values, selected) {
    return '<label class="wdga-tool-control compact"><span>' + escapeHtml(label) + '</span><select class="wdga-select" name="' + name + '">' + values.map(value => '<option value="' + escapeHtml(value) + '"' + (value === selected ? ' selected' : '') + '>' + escapeHtml(value) + '</option>').join('') + '</select></label>';
  }

  function toolNumber(label, name, value, min, max) {
    return '<label class="wdga-tool-control compact"><span>' + escapeHtml(label) + '</span><input class="wdga-input" type="number" name="' + name + '" value="' + value + '" min="' + min + '" max="' + max + '"></label>';
  }

  function toolForm(action) {
    let controls = '';
    if (action === 'shadow') {
      controls = toolRange('X', 'x', 4, -40, 40, 1, 'px') + toolRange('Y', 'y', 8, -40, 40, 1, 'px') + toolRange(isEnglish ? 'Blur' : 'Размытие', 'blur', 24, 0, 80, 1, 'px') + toolRange(isEnglish ? 'Spread' : 'Распространение', 'spread', 0, -30, 40, 1, 'px') + toolRange(isEnglish ? 'Opacity' : 'Прозрачность', 'opacity', 20, 0, 100, 1, '%') + toolColor(isEnglish ? 'Color' : 'Цвет', 'color', '#000000');
    } else if (action === 'text-shadow') {
      controls = toolRange('X', 'x', 2, -30, 30, 1, 'px') + toolRange('Y', 'y', 3, -30, 30, 1, 'px') + toolRange(isEnglish ? 'Blur' : 'Размытие', 'blur', 8, 0, 50, 1, 'px') + toolColor(isEnglish ? 'Color' : 'Цвет', 'color', '#000000');
    } else if (action === 'radius') {
      controls = toolRange(isEnglish ? 'Top left' : 'Слева сверху', 'tl', 16, 0, 100, 1, 'px') + toolRange(isEnglish ? 'Top right' : 'Справа сверху', 'tr', 16, 0, 100, 1, 'px') + toolRange(isEnglish ? 'Bottom right' : 'Справа снизу', 'br', 16, 0, 100, 1, 'px') + toolRange(isEnglish ? 'Bottom left' : 'Слева снизу', 'bl', 16, 0, 100, 1, 'px');
    } else if (action === 'gradient') {
      controls = toolRange(isEnglish ? 'Angle' : 'Угол', 'angle', 135, 0, 360, 1, 'deg') + toolColor(isEnglish ? 'First color' : 'Первый цвет', 'first', '#7c3aed') + toolColor(isEnglish ? 'Second color' : 'Второй цвет', 'second', '#06b6d4');
    } else if (action === 'color') {
      controls = '<label class="wdga-tool-control compact"><span>HEX</span><input class="wdga-input" name="hex" value="#6366f1" maxlength="7"></label>';
    } else if (action === 'units') {
      controls = toolNumber('px', 'px', 16, 0, 2000) + toolNumber(isEnglish ? 'Base font size' : 'Базовый размер', 'base', 16, 1, 100);
    } else if (action === 'clamp') {
      controls = toolNumber(isEnglish ? 'Minimum px' : 'Минимум px', 'min', 18, 1, 500) + toolNumber(isEnglish ? 'Maximum px' : 'Максимум px', 'max', 48, 1, 800) + toolNumber(isEnglish ? 'Viewport from px' : 'Экран от px', 'from', 320, 100, 3000) + toolNumber(isEnglish ? 'Viewport to px' : 'Экран до px', 'to', 1440, 200, 5000);
    } else if (action === 'transform') {
      controls = toolRange('Translate X', 'x', 0, -200, 200, 1, 'px') + toolRange('Translate Y', 'y', 0, -200, 200, 1, 'px') + toolRange(isEnglish ? 'Rotate' : 'Поворот', 'rotate', 0, -180, 180, 1, 'deg') + toolRange(isEnglish ? 'Scale' : 'Масштаб', 'scale', 100, 20, 200, 1, '%');
    } else if (action === 'flex') {
      controls = toolSelect('flex-direction', 'direction', ['row', 'column', 'row-reverse', 'column-reverse'], 'row') + toolSelect('justify-content', 'justify', ['flex-start', 'center', 'space-between', 'space-around', 'flex-end'], 'center') + toolSelect('align-items', 'align', ['stretch', 'flex-start', 'center', 'flex-end'], 'center') + toolRange('gap', 'gap', 16, 0, 80, 1, 'px');
    } else if (action === 'grid') {
      controls = toolNumber(isEnglish ? 'Minimum column' : 'Минимум колонки', 'min', 220, 80, 800) + toolRange('gap', 'gap', 16, 0, 80, 1, 'px');
    }
    return '<div class="wdga-tool-builder" data-wdga-tool-builder="' + action + '"><div class="wdga-tool-controls">' + controls + '</div><div class="wdga-tool-preview" data-wdga-tool-preview><span></span><span></span><span></span></div><div class="wdga-tool-result"><code data-wdga-tool-output></code><button class="wdga-btn primary" type="button" data-wdga-copy-tool>' + icon('tabler:copy', 14) + ' ' + (isEnglish ? 'Copy CSS' : 'Копировать CSS') + '</button></div></div>';
  }

  function hexToRgb(hex) {
    const clean = String(hex || '').trim().replace('#', '');
    const value = /^[0-9a-f]{3}$/i.test(clean) ? clean.split('').map(char => char + char).join('') : clean;
    if (!/^[0-9a-f]{6}$/i.test(value)) return null;
    const number = parseInt(value, 16);
    return { r: number >> 16, g: number >> 8 & 255, b: number & 255, hex: '#' + value.toLowerCase() };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > .5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function toolValue(body, name, fallback) {
    const field = body.querySelector('[name="' + name + '"]');
    return field ? field.value : fallback;
  }

  function calculateToolOutput(action, body) {
    const number = (name, fallback) => Number(toolValue(body, name, fallback));
    if (action === 'shadow') {
      const rgb = hexToRgb(toolValue(body, 'color', '#000000')) || { r: 0, g: 0, b: 0 };
      return 'box-shadow: ' + number('x', 4) + 'px ' + number('y', 8) + 'px ' + number('blur', 24) + 'px ' + number('spread', 0) + 'px rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + (number('opacity', 20) / 100).toFixed(2) + ');';
    }
    if (action === 'text-shadow') return 'text-shadow: ' + number('x', 2) + 'px ' + number('y', 3) + 'px ' + number('blur', 8) + 'px ' + toolValue(body, 'color', '#000000') + ';';
    if (action === 'radius') return 'border-radius: ' + number('tl', 16) + 'px ' + number('tr', 16) + 'px ' + number('br', 16) + 'px ' + number('bl', 16) + 'px;';
    if (action === 'gradient') return 'background: linear-gradient(' + number('angle', 135) + 'deg, ' + toolValue(body, 'first', '#7c3aed') + ', ' + toolValue(body, 'second', '#06b6d4') + ');';
    if (action === 'color') {
      const rgb = hexToRgb(toolValue(body, 'hex', '#6366f1'));
      if (!rgb) return isEnglish ? 'Enter a valid HEX color.' : 'Введи корректный HEX-цвет.';
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return 'HEX: ' + rgb.hex + '\nRGB: rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')\nHSL: hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
    }
    if (action === 'units') {
      const px = number('px', 16), base = Math.max(1, number('base', 16));
      return px + 'px = ' + (px / base).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + 'rem\n' + px + 'px = ' + (px / base).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + 'em\n' + px + 'px = ' + (px / base * 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '%';
    }
    if (action === 'clamp') {
      const min = number('min', 18), max = number('max', 48), from = number('from', 320), to = Math.max(from + 1, number('to', 1440));
      const slope = (max - min) / (to - from) * 100;
      const intercept = min - slope * from / 100;
      return 'font-size: clamp(' + (min / 16).toFixed(3) + 'rem, ' + (intercept / 16).toFixed(3) + 'rem + ' + slope.toFixed(3) + 'vw, ' + (max / 16).toFixed(3) + 'rem);';
    }
    if (action === 'transform') return 'transform: translate(' + number('x', 0) + 'px, ' + number('y', 0) + 'px) rotate(' + number('rotate', 0) + 'deg) scale(' + (number('scale', 100) / 100).toFixed(2) + ');';
    if (action === 'flex') return 'display: flex;\nflex-direction: ' + toolValue(body, 'direction', 'row') + ';\njustify-content: ' + toolValue(body, 'justify', 'center') + ';\nalign-items: ' + toolValue(body, 'align', 'center') + ';\ngap: ' + number('gap', 16) + 'px;';
    if (action === 'grid') return 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(min(100%, ' + number('min', 220) + 'px), 1fr));\ngap: ' + number('gap', 16) + 'px;';
    return '';
  }

  function updateToolBuilder() {
    const body = state.root?.querySelector('[data-wdga-tool-body]');
    const builder = body?.querySelector('[data-wdga-tool-builder]');
    if (!body || !builder) return;
    body.querySelectorAll('[data-wdga-tool-value]').forEach(output => {
      const input = body.querySelector('[name="' + output.dataset.wdgaToolValue + '"]');
      if (input) output.textContent = input.value + (input.dataset.unit || '');
    });
    const action = builder.dataset.wdgaToolBuilder;
    const css = calculateToolOutput(action, body);
    const output = body.querySelector('[data-wdga-tool-output]');
    const preview = body.querySelector('[data-wdga-tool-preview]');
    if (output) output.textContent = css;
    if (!preview) return;
    preview.removeAttribute('style');
    if (action === 'shadow' || action === 'radius' || action === 'gradient' || action === 'transform') preview.style.cssText += css;
    if (action === 'text-shadow') {
      preview.textContent = 'WebDevGym';
      preview.style.cssText += css;
    }
    if (action === 'color') {
      const rgb = hexToRgb(toolValue(body, 'hex', '#6366f1'));
      if (rgb) preview.style.background = rgb.hex;
    }
    if (action === 'flex' || action === 'grid') preview.style.cssText += css;
  }

  function openTool(action) {
    const tool = toolCatalog.find(item => item[0] === action);
    const dialog = state.root?.querySelector('[data-wdga-tool-dialog]');
    if (!tool || !dialog) return;
    dialog.querySelector('[data-wdga-tool-title]').textContent = tool[2];
    dialog.querySelector('[data-wdga-tool-body]').innerHTML = toolForm(action);
    updateToolBuilder();
    dialog.showModal();
  }

  async function copyToolOutput() {
    const text = state.root?.querySelector('[data-wdga-tool-output]')?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    notify(isEnglish ? 'CSS copied.' : 'CSS скопирован.');
  }

  function saveLayout() {
    writeJson(LAYOUT_KEY, state.layout);
  }

  function applyLayout() {
    if (!state.root) return;
    state.root.classList.toggle('is-explorer-collapsed', state.layout.explorerCollapsed);
    state.root.classList.toggle('is-console-collapsed', state.layout.consoleCollapsed);
    state.root.style.setProperty('--wdga-preview-size', Math.max(280, Number(state.layout.previewWidth) || 390) + 'px');
    const playgroundActive = state.section?.classList.contains('active');
    document.body.classList.toggle('wdga-global-sidebar-collapsed', Boolean(playgroundActive && state.layout.globalSidebarCollapsed));
    const globalButton = state.root.querySelector('[data-wdga-global-sidebar]');
    if (globalButton) globalButton.innerHTML = icon(state.layout.globalSidebarCollapsed ? 'tabler:layout-sidebar-left-expand' : 'tabler:layout-sidebar-left-collapse', 17);
    const explorerButton = state.root.querySelector('.wdga-explorer [data-wdga-explorer-toggle]');
    if (explorerButton) explorerButton.innerHTML = icon('tabler:chevrons-left', 16);
    const consoleButton = state.root.querySelector('.wdga-console [data-wdga-console-toggle]');
    if (consoleButton) consoleButton.innerHTML = icon('tabler:chevron-down', 15);
  }

  function toggleLayoutPart(part) {
    state.layout[part] = !state.layout[part];
    applyLayout();
    saveLayout();
  }

  function bindPreviewSplitter() {
    const splitter = state.root?.querySelector('[data-wdga-splitter="preview"]');
    const workspace = state.root?.querySelector('.wdga-workspace');
    if (!splitter || !workspace) return;
    const resize = clientX => {
      const rect = workspace.getBoundingClientRect();
      const styles = getComputedStyle(workspace);
      const gap = Number.parseFloat(styles.columnGap) || 8;
      const explorerWidth = state.layout.explorerCollapsed
        ? 38
        : Number.parseFloat(styles.getPropertyValue("--wdga-explorer-size")) || 270;
      const minEditorWidth = matchMedia("(max-width: 1440px)").matches ? 320 : 360;
      const reservedWidth = explorerWidth + minEditorWidth + 7 + gap * 3;
      const maxPreviewWidth = Math.max(280, rect.width - reservedWidth);
      state.layout.previewWidth = Math.round(Math.min(maxPreviewWidth, Math.max(280, rect.right - clientX)));
      applyLayout();
    };
    splitter.addEventListener('mousedown', event => {
      if (matchMedia('(max-width: 860px)').matches) return;
      event.preventDefault();
      splitter.classList.add('is-dragging');
      const shield = document.createElement('div');
      shield.className = 'wdga-drag-shield';
      document.body.appendChild(shield);
      const move = moveEvent => resize(moveEvent.clientX);
      const stop = () => {
        splitter.classList.remove('is-dragging');
        shield.removeEventListener('mousemove', move);
        shield.removeEventListener('mouseup', stop);
        shield.remove();
        window.removeEventListener('blur', stop);
        saveLayout();
      };
      shield.addEventListener('mousemove', move);
      shield.addEventListener('mouseup', stop);
      window.addEventListener('blur', stop, { once: true });
    });
    splitter.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      state.layout.previewWidth = Math.max(280, state.layout.previewWidth + (event.key === 'ArrowLeft' ? 24 : -24));
      applyLayout();
      saveLayout();
    });
  }

  function handleTool(action) {
    openTool(action);
  }

  function bindEvents() {
    const root = state.root;
    root.addEventListener('click', event => {
      const target = event.target;
      if (target.closest('[data-wdga-global-sidebar]')) {
        toggleLayoutPart('globalSidebarCollapsed');
        return;
      }
      if (target.closest('[data-wdga-explorer-toggle]')) {
        toggleLayoutPart('explorerCollapsed');
        return;
      }
      if (target.closest('[data-wdga-console-toggle]')) {
        toggleLayoutPart('consoleCollapsed');
        return;
      }
      if (target.closest('[data-wdga-close-tool]')) {
        state.root.querySelector('[data-wdga-tool-dialog]')?.close();
        return;
      }
      if (target.closest('[data-wdga-copy-tool]')) {
        copyToolOutput();
        return;
      }
      const mobile = target.closest('[data-wdga-mobile]');
      if (mobile) {
        state.mobilePanel = mobile.dataset.wdgaMobile;
        root.dataset.mobilePanel = state.mobilePanel;
        root.querySelectorAll('[data-wdga-mobile]').forEach(button => button.classList.toggle('active', button === mobile));
        return;
      }
      const explorerTab = target.closest('[data-wdga-explorer-tab]');
      if (explorerTab) {
        state.activeExplorerTab = explorerTab.dataset.wdgaExplorerTab;
        root.querySelectorAll('[data-wdga-explorer-tab]').forEach(button => button.classList.toggle('active', button === explorerTab));
        root.querySelectorAll('[data-wdga-explorer-view]').forEach(view => {
          view.hidden = view.dataset.wdgaExplorerView !== state.activeExplorerTab;
        });
        return;
      }
      const consoleTab = target.closest('[data-wdga-console-tab]');
      if (consoleTab) {
        state.activeConsoleTab = consoleTab.dataset.wdgaConsoleTab;
        root.querySelectorAll('[data-wdga-console-tab]').forEach(button => button.classList.toggle('active', button === consoleTab));
        renderConsole();
        return;
      }
      const fileTab = target.closest('[data-wdga-file]');
      if (fileTab && !target.closest('[data-wdga-close-file]')) {
        setActiveFile(fileTab.dataset.wdgaFile);
        return;
      }
      const closeFile = target.closest('[data-wdga-close-file]');
      if (closeFile) {
        closeFileTab(closeFile.dataset.wdgaCloseFile);
        return;
      }
      const treeFile = target.closest('[data-wdga-tree-file]');
      if (treeFile && !target.closest('[data-wdga-item-menu]')) {
        setActiveFile(treeFile.dataset.wdgaTreeFile);
        return;
      }
      const folder = target.closest('[data-wdga-folder]');
      if (folder && !target.closest('[data-wdga-item-menu]')) {
        const path = folder.dataset.wdgaFolder;
        const index = state.activeProject.expandedFolders.indexOf(path);
        if (index >= 0) state.activeProject.expandedFolders.splice(index, 1);
        else state.activeProject.expandedFolders.push(path);
        renderTree();
        scheduleSave();
        return;
      }
      const menu = target.closest('[data-wdga-item-menu]');
      if (menu) {
        event.stopPropagation();
        const choice = window.prompt(
          isEnglish
            ? 'Type "rename" or "delete". Leave empty to cancel.'
            : 'Напиши «переименовать» или «удалить». Пустое поле отменит действие.',
          ''
        )?.trim().toLowerCase();
        if (choice === 'rename' || choice === 'переименовать') {
          renameItem(menu.dataset.wdgaItemMenu, menu.dataset.path);
        } else if (choice === 'delete' || choice === 'удалить') {
          deleteItem(menu.dataset.wdgaItemMenu, menu.dataset.path);
        }
        return;
      }
      const restore = target.closest('[data-wdga-restore]');
      if (restore) {
        restoreSnapshot(restore.dataset.wdgaRestore);
        return;
      }
      const device = target.closest('[data-wdga-device]');
      if (device) {
        state.device = device.dataset.wdgaDevice;
        root.querySelector('.wdga-studio').dataset.device = state.device;
        root.querySelectorAll('[data-wdga-device]').forEach(button => button.classList.toggle('active', button === device));
        return;
      }
      const tool = target.closest('[data-wdga-tool]');
      if (tool) {
        handleTool(tool.dataset.wdgaTool);
        return;
      }
      if (target.closest('[data-wdga-open-import]')) {
        setImportStatus('');
        root.querySelector('[data-wdga-import-dialog]')?.showModal();
        return;
      }
      const importChoice = target.closest('[data-wdga-import-choice]');
      if (importChoice) {
        const input = root.querySelector({
          files: '[data-wdga-import-files]',
          folder: '[data-wdga-import-folder]',
          zip: '[data-wdga-import-zip]',
          json: '[data-wdga-import]'
        }[importChoice.dataset.wdgaImportChoice]);
        input?.click();
        return;
      }
      if (target.closest('[data-wdga-delete-project]')) deleteActiveProject();
      else if (target.closest('[data-wdga-new-project]')) createProject();
      else if (target.closest('[data-wdga-snapshot]')) createSnapshot();
      else if (target.closest('[data-wdga-history]')) {
        renderHistory();
        root.querySelector('[data-wdga-history-dialog]').showModal();
      } else if (target.closest('[data-wdga-download]')) downloadZip();
      else if (target.closest('[data-wdga-add-file], [data-wdga-tab-add]')) addFile();
      else if (target.closest('[data-wdga-add-folder]')) addFolder();
      else if (target.closest('[data-wdga-run], [data-wdga-refresh]')) runPreview();
      else if (target.closest('[data-wdga-format]')) formatCurrentFile();
      else if (target.closest('[data-wdga-console-clear]')) {
        state.logs = [];
        renderConsole();
      } else if (target.closest('[data-wdga-validate]')) validateProject();
      else if (target.closest('[data-wdga-publish]')) publishToProfile();
      else if (target.closest('[data-wdga-hint]')) notify(ui.useHint);
      else if (target.closest('[data-wdga-inspect]')) notify(ui.inspectText);
      else if (target.closest('[data-wdga-close-dialog]')) target.closest('dialog')?.close();
    });

    let toolUpdateFrame = 0;
    const updateOpenTool = event => {
      if (!event.target.closest('[data-wdga-tool-body]')) return;

      // Native color pickers emit many input events while their cursor moves.
      // Updating the page behind the picker makes that cursor stutter on Windows.
      if (event.type === 'input' && event.target.matches('input[type="color"]')) return;

      if (event.type === 'change') {
        if (toolUpdateFrame) cancelAnimationFrame(toolUpdateFrame);
        toolUpdateFrame = 0;
        updateToolBuilder();
        return;
      }

      if (toolUpdateFrame) return;
      toolUpdateFrame = requestAnimationFrame(() => {
        toolUpdateFrame = 0;
        updateToolBuilder();
      });
    };
    root.addEventListener('input', updateOpenTool);
    root.addEventListener('change', updateOpenTool);

    root.querySelector('[data-wdga-project]').addEventListener('change', event => activateProject(event.target.value));
    root.querySelector('[data-wdga-import-files]').addEventListener('change', async event => {
      const files = event.target.files;
      if (files?.length) await importSelectedFiles(files, false);
      event.target.value = '';
    });
    root.querySelector('[data-wdga-import-folder]').addEventListener('change', async event => {
      const files = event.target.files;
      if (files?.length) await importSelectedFiles(files, true);
      event.target.value = '';
    });
    root.querySelector('[data-wdga-import-zip]').addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (file) await importZipFile(file);
      event.target.value = '';
    });
    root.querySelector('[data-wdga-import]').addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (file) importProjectFile(file);
      event.target.value = '';
    });
    const editor = document.getElementById('pg-editor');
    editor.addEventListener('input', () => {
      captureEditor();
      renderLineNumbers();
      scheduleSave();
      updateEmmetSuggestion();
    });
    editor.addEventListener('scroll', () => {
      root.querySelector('[data-wdga-lines]').scrollTop = editor.scrollTop;
      const panel = root.querySelector('[data-wdga-emmet]');
      if (panel && !panel.hidden) positionEmmetSuggestion(editor, panel);
    });
    editor.addEventListener('click', () => updateEmmetSuggestion());
    editor.addEventListener('keyup', event => {
      if (!['Tab', 'Escape'].includes(event.key)) updateEmmetSuggestion();
    });
    editor.addEventListener('compositionend', () => updateEmmetSuggestion());
    editor.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        hideEmmetSuggestion();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        applyEmmetSuggestion(true);
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        if (!event.shiftKey && editor.selectionStart === editor.selectionEnd && applyEmmetSuggestion(false)) return;
        indentEditorSelection(editor, event.shiftKey);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runPreview();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        createSnapshot();
      }
    });
    updateEmmetStatus();
  }

  function installCompatibility() {
    try {
      if (typeof pgRenderTabs !== 'undefined') pgRenderTabs = renderTabs;
      if (typeof runPlayground !== 'undefined') runPlayground = runPreview;
      if (typeof downloadPlayground !== 'undefined') downloadPlayground = function () { downloadZip(); };
    } catch (error) {
      console.warn('Playground compatibility layer:', error);
    }
    window.WebDevGymPlaygroundAtlas = {
      openProject(projectId) {
        return activateProject(projectId);
      },
      createProject(name, files) {
        const project = newProject(name, files);
        state.projects.unshift(project);
        persistProject(project);
        activateProject(project.id);
        return project.id;
      },
      getActiveProject() {
        captureEditor();
        return clone(state.activeProject);
      },
      run: runPreview,
      validate: validateProject,
      expandEmmet(abbreviation, fileName) {
        const context = emmetContextForFile(fileName || currentFile());
        return expandEmmetAbbreviation(abbreviation, context, '', false);
      }
    };
  }

  function handleWindowMessage(event) {
    const iframe = document.getElementById('pg-iframe');
    if (!iframe || event.source !== iframe.contentWindow || event.data?.type !== 'wdga-console') return;
    const level = event.data.level === 'log' ? 'info' : event.data.level;
    log(level, (event.data.values || []).join(' '));
  }

  async function init() {
    const section = document.getElementById('sec-playground');
    if (!section || section.dataset.wdgaMounted === '1') return;
    section.dataset.wdgaMounted = '1';
    state.section = section;
    await loadProjects();
    state.layout = Object.assign(state.layout, readJson(LAYOUT_KEY, {}));
    buildShell();
    applyLayout();
    syncCoreFiles();
    installCompatibility();
    bindEvents();
    bindPreviewSplitter();
    const syncSectionState = () => {
      applyLayout();
      if (section.classList.contains('active') && !state.previewReady) runPreview();
    };
    const layoutObserver = new MutationObserver(syncSectionState);
    layoutObserver.observe(section, { attributes: true, attributeFilter: ['class'] });
    state.logs.push({ id: uid('log'), type: 'success', message: ui.ready, time: Date.now() });
    renderAll();
    if (section.classList.contains('active')) runPreview();
    window.addEventListener('message', handleWindowMessage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 260));
  } else {
    setTimeout(init, 260);
  }
})();
