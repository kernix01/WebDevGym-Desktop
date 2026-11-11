(function () {
  'use strict';

  const api = window.webdevgymDesktop?.desktop;
  if (!api) return;
  if (window.__webdevgymDesktopCenterInitialized) return;
  window.__webdevgymDesktopCenterInitialized = true;

  const isEnglish = document.documentElement.lang === 'en' || location.pathname.endsWith('index-en.html');
  const copy = isEnglish ? {
    title: 'Desktop Center', subtitle: 'Local workspace', open: 'Open folder', projects: 'Files', search: 'Search', terminal: 'Runner',
    git: 'Git', docs: 'Docs', backups: 'Backups', app: 'App', recents: 'Recent projects', noProject: 'Choose a project folder',
    noProjectShort: 'No project selected', save: 'Save', saved: 'Saved', saving: 'Saving...', reveal: 'Show in Explorer',
    preview: 'Preview', refresh: 'Refresh', run: 'Run', stop: 'Stop', command: 'Command', clear: 'Clear',
    status: 'Status', history: 'History', commit: 'Commit', push: 'Push', commitMessage: 'Commit message',
    sourceControl: 'Source control', changes: 'Changes', noChanges: 'Working tree is clean', branch: 'Branch',
    stage: 'Stage file', unstage: 'Unstage file', staged: 'Staged', unstaged: 'Unstaged', untracked: 'Untracked',
    selectDiff: 'Select a changed file to inspect its diff', noDiff: 'No textual diff for this file', gitOutput: 'Git output',
    createBackup: 'Create backup', restore: 'Restore', noBackups: 'No backups yet', version: 'Version',
    checkUpdate: 'Check for updates', notify: 'Test notification', tray: 'Minimize WebDevGym to tray', quit: 'Quit',
    close: 'Close', file: 'File', project: 'Project', ready: 'Ready', updateReady: 'Update available',
    upToDate: 'You have the latest version', downloadingUpdate: 'Downloading update', updateDownloaded: 'Update downloaded',
    installUpdate: 'Install it now?', installingUpdate: 'Starting installer...', restored: 'Backup restored', confirmRestore: 'Restore this backup over the current project?',
    timerDone: 'Timer finished', focusDone: 'Focus session finished', breakDone: 'Break finished', npmInstall: 'npm install',
    newFile: 'New file', newFolder: 'New folder', collapseAll: 'Collapse folders', rename: 'Rename',
    deleteItem: 'Delete', removeProject: 'Remove from recent projects', fileNamePrompt: 'File name',
    folderNamePrompt: 'Folder name', renamePrompt: 'New name', confirmDelete: 'Delete this item from disk?',
    confirmForget: 'Remove this project from recent projects? Files on disk will remain.', invalidName: 'Enter one valid name',
    runnerTitle: 'Project Runner', runnerSubtitle: 'Run package scripts and follow the process without leaving WebDevGym.',
    scripts: 'Project scripts', noScripts: 'No scripts found in package.json', installDependencies: 'Install dependencies',
    packageManager: 'Package manager', activeProcess: 'Active process', localAddress: 'Local address', openAddress: 'Open',
    customCommand: 'Custom command', output: 'Process output', processIdle: 'Ready', processStarting: 'Starting',
    processRunning: 'Running', processStopping: 'Stopping', processStopped: 'Stopped', processSuccess: 'Completed',
    processFailed: 'Failed', processNone: 'No process', pid: 'PID', problems: 'Problems',
    noProblems: 'No problems found', checkingCode: 'Checking code...', line: 'Line',
    externalChange: 'This file changed on disk', externalChangeHint: 'Choose which version to keep.',
    keepMine: 'Keep mine', loadDisk: 'Load from disk', reloadedFromDisk: 'Updated from disk',
    watchError: 'File watching stopped', searchTitle: 'Search in project', searchPlaceholder: 'Search text...',
    matchCase: 'Match case', searchAction: 'Search', searchStart: 'Enter text to search across the project',
    searchEmpty: 'No matches found', searchLoading: 'Searching...', searchMatches: 'matches', searchTruncated: 'First 500 matches shown',
    docsTitle: 'Offline documentation', docsSubtitle: 'A compact frontend reference bundled with WebDevGym.',
    docsSearch: 'Search topics, APIs, or commands...', docsAll: 'All', docsTopics: 'topics', docsEmpty: 'No matching topics',
    docsChoose: 'Choose a topic from the list', docsKeyPoints: 'Key points', docsExample: 'Example',
    docsCopy: 'Copy example', docsCopied: 'Example copied', docsOffline: 'Available without internet',
    aiContext: 'Add to AI context', aiContextAdded: 'Added to AI context', aiContextUnavailable: 'Open a readable project file first',
    aiEditChanged: 'A file changed after AI prepared the edit. Review it again.', aiEditEmpty: 'AI did not provide any valid file changes',
    dependencies: 'Dependencies', dependenciesTitle: 'Dependency manager',
    dependenciesSubtitle: 'Inspect, install, update, and remove project packages.', dependencySearch: 'Filter packages...',
    dependencyName: 'Package name, for example lucide or vite@latest', dependencyInstall: 'Install package',
    dependencyCheck: 'Check updates', dependencyRuntime: 'Runtime', dependencyDevelopment: 'Development',
    dependencyInstalled: 'Installed', dependencyRequested: 'Requested', dependencyLatest: 'Latest',
    dependencyMissing: 'Not installed', dependencyUpdate: 'Update', dependencyRemove: 'Remove',
    dependencyEmpty: 'No dependencies in package.json', dependencyNoProject: 'Open a project with package.json first',
    dependencyConfirmRemove: 'Remove this package from the project?', dependencyUpdatesReady: 'Package versions checked',
    dependencyOperationDone: 'Package operation completed', dependencyCount: 'packages',
    resetLayout: 'Reset layout', splitEditor: 'Split editor', splitDirection: 'Split direction',
    splitVertical: 'Side by side', splitHorizontal: 'Stacked', openToSide: 'Open in split editor',
    editorTheme: 'Editor theme', importTheme: 'Import VS Code theme JSON', importSnippets: 'Import VS Code snippets JSON',
    extensions: 'VS Code extensions', marketplaceTab: 'Marketplace', installedTab: 'Installed',
    extensionSearchPlaceholder: 'Search Open VSX extensions...', extensionSearchAction: 'Search', extensionSearching: 'Searching Open VSX...',
    extensionSearchEmpty: 'No extensions found', extensionSearchHint: 'Search the Open VSX catalog by name or keyword.', extensionDownloads: 'downloads',
    extensionMarketplaceFailed: 'Could not load the extension catalog', extensionInstallAction: 'Install', extensionInstalledAction: 'Installed', extensionInstalling: 'Installing...',
    installExtension: 'Install from .vsix', removeExtension: 'Uninstall', noExtensions: 'No extensions installed',
    extensionInfo: 'Themes, snippets, Auto Close Tag, Auto Rename Tag, Color Highlight, Error Lens, and Live Preview compatibility are enabled. Extension code and VS Code commands are not executed.', verifiedLabel: 'Open VSX verified',
    themeCountLabel: 'themes', snippetCountLabel: 'snippets', nativeFeatureCountLabel: 'compatible features',
    extensionInstalled: 'Extension installed', extensionRemoved: 'Extension removed', extensionRemoveFailed: 'Could not uninstall extension', extensionInstallFailed: 'Could not install extension',
    themeImported: 'Theme imported', snippetsImported: 'Snippets imported', invalidTheme: 'Theme JSON is not valid',
    invalidSnippets: 'Snippet JSON is not valid', previewViewport: 'Preview viewport', viewportDesktop: 'Desktop',
    viewportTablet: 'Tablet', viewportMobile: 'Mobile', reopenClosedTab: 'Reopen closed tab'
  } : {
    title: 'Desktop Center', subtitle: 'Локальное рабочее пространство', open: 'Открыть папку', projects: 'Файлы', search: 'Поиск',
    terminal: 'Runner', git: 'Git', docs: 'Документация', backups: 'Снимки', app: 'Приложение', recents: 'Недавние проекты',
    noProject: 'Выбери папку проекта', noProjectShort: 'Проект не выбран', save: 'Сохранить', saved: 'Сохранено',
    saving: 'Сохранение...', reveal: 'Показать в проводнике', preview: 'Предпросмотр', refresh: 'Обновить',
    run: 'Запустить', stop: 'Остановить', command: 'Команда', clear: 'Очистить', status: 'Статус',
    history: 'История', commit: 'Коммит', push: 'Отправить', commitMessage: 'Сообщение коммита',
    sourceControl: 'Контроль версий', changes: 'Изменения', noChanges: 'Нет незакоммиченных изменений', branch: 'Ветка',
    stage: 'Добавить файл в коммит', unstage: 'Убрать файл из коммита', staged: 'Подготовлен', unstaged: 'Не подготовлен', untracked: 'Новый',
    selectDiff: 'Выбери изменённый файл, чтобы посмотреть diff', noDiff: 'Для этого файла нет текстового diff', gitOutput: 'Вывод Git',
    createBackup: 'Создать снимок', restore: 'Восстановить', noBackups: 'Снимков пока нет', version: 'Версия',
    checkUpdate: 'Проверить обновления', notify: 'Тест уведомления', tray: 'Свернуть WebDevGym в трей',
    quit: 'Выйти', close: 'Закрыть', file: 'Файл', project: 'Проект', ready: 'Готово',
    updateReady: 'Доступно обновление', upToDate: 'Установлена последняя версия', restored: 'Снимок восстановлен',
    downloadingUpdate: 'Скачивание обновления', updateDownloaded: 'Обновление скачано',
    installUpdate: 'Установить его сейчас?', installingUpdate: 'Запуск установщика...',
    confirmRestore: 'Восстановить этот снимок поверх текущего проекта?', timerDone: 'Таймер завершён',
    focusDone: 'Фокус-сессия завершена', breakDone: 'Перерыв завершён', npmInstall: 'npm install',
    newFile: 'Новый файл', newFolder: 'Новая папка', collapseAll: 'Свернуть папки', rename: 'Переименовать',
    deleteItem: 'Удалить', removeProject: 'Убрать из недавних', fileNamePrompt: 'Имя файла',
    folderNamePrompt: 'Имя папки', renamePrompt: 'Новое имя', confirmDelete: 'Удалить этот элемент с диска?',
    confirmForget: 'Убрать проект из недавних? Файлы на диске останутся.', invalidName: 'Введи одно корректное имя',
    runnerTitle: 'Project Runner', runnerSubtitle: 'Запускай скрипты проекта и следи за процессом, не выходя из WebDevGym.',
    scripts: 'Скрипты проекта', noScripts: 'В package.json нет скриптов', installDependencies: 'Установить зависимости',
    packageManager: 'Менеджер пакетов', activeProcess: 'Активный процесс', localAddress: 'Локальный адрес', openAddress: 'Открыть',
    customCommand: 'Своя команда', output: 'Вывод процесса', processIdle: 'Готов', processStarting: 'Запуск',
    processRunning: 'Работает', processStopping: 'Остановка', processStopped: 'Остановлен', processSuccess: 'Завершён',
    processFailed: 'Ошибка', processNone: 'Процесс не запущен', pid: 'PID', problems: 'Проблемы',
    noProblems: 'Проблем не найдено', checkingCode: 'Проверка кода...', line: 'Строка',
    externalChange: 'Файл изменился на диске', externalChangeHint: 'Выбери, какую версию оставить.',
    keepMine: 'Оставить мою', loadDisk: 'Загрузить с диска', reloadedFromDisk: 'Обновлено с диска',
    watchError: 'Отслеживание файлов остановлено', searchTitle: 'Поиск по проекту', searchPlaceholder: 'Текст для поиска...',
    matchCase: 'Учитывать регистр', searchAction: 'Найти', searchStart: 'Введи текст для поиска по проекту',
    searchEmpty: 'Совпадений не найдено', searchLoading: 'Ищем...', searchMatches: 'совпадений', searchTruncated: 'Показаны первые 500 совпадений',
    docsTitle: 'Офлайн-документация', docsSubtitle: 'Короткий справочник фронтенд-разработчика внутри WebDevGym.',
    docsSearch: 'Найти тему, API или команду...', docsAll: 'Все', docsTopics: 'тем', docsEmpty: 'Подходящих тем нет',
    docsChoose: 'Выбери тему из списка', docsKeyPoints: 'Главное', docsExample: 'Пример',
    docsCopy: 'Скопировать пример', docsCopied: 'Пример скопирован', docsOffline: 'Работает без интернета',
    aiContext: 'Добавить в контекст ИИ', aiContextAdded: 'Добавлено в контекст ИИ', aiContextUnavailable: 'Сначала открой читаемый файл проекта',
    aiEditChanged: 'Файл изменился после подготовки правки ИИ. Проверь изменения заново.', aiEditEmpty: 'ИИ не передал допустимых изменений файлов',
    dependencies: 'Зависимости', dependenciesTitle: 'Менеджер зависимостей',
    dependenciesSubtitle: 'Просматривай, устанавливай, обновляй и удаляй пакеты проекта.', dependencySearch: 'Фильтр пакетов...',
    dependencyName: 'Название пакета, например lucide или vite@latest', dependencyInstall: 'Установить пакет',
    dependencyCheck: 'Проверить обновления', dependencyRuntime: 'Основная', dependencyDevelopment: 'Для разработки',
    dependencyInstalled: 'Установлена', dependencyRequested: 'Указана', dependencyLatest: 'Последняя',
    dependencyMissing: 'Не установлена', dependencyUpdate: 'Обновить', dependencyRemove: 'Удалить',
    dependencyEmpty: 'В package.json пока нет зависимостей', dependencyNoProject: 'Сначала открой проект с package.json',
    dependencyConfirmRemove: 'Удалить этот пакет из проекта?', dependencyUpdatesReady: 'Версии пакетов проверены',
    dependencyOperationDone: 'Операция с пакетом завершена', dependencyCount: 'пакетов',
    resetLayout: 'Сбросить раскладку', splitEditor: 'Разделить редактор', splitDirection: 'Направление разделения',
    splitVertical: 'Рядом', splitHorizontal: 'Сверху и снизу', openToSide: 'Открыть в разделённом редакторе',
    editorTheme: 'Тема редактора', importTheme: 'Импорт темы VS Code JSON', importSnippets: 'Импорт сниппетов VS Code JSON',
    extensions: 'Расширения VS Code', marketplaceTab: 'Магазин', installedTab: 'Установленные',
    extensionSearchPlaceholder: 'Поиск расширений Open VSX...', extensionSearchAction: 'Найти', extensionSearching: 'Ищем в Open VSX...',
    extensionSearchEmpty: 'Расширения не найдены', extensionSearchHint: 'Ищи в каталоге Open VSX по названию или ключевым словам.', extensionDownloads: 'загрузок',
    extensionMarketplaceFailed: 'Не удалось загрузить каталог расширений', extensionInstallAction: 'Установить', extensionInstalledAction: 'Установлено', extensionInstalling: 'Установка...',
    installExtension: 'Установить из .vsix', removeExtension: 'Удалить', noExtensions: 'Расширения не установлены',
    extensionInfo: 'Поддерживаются темы, snippets, Auto Close Tag, Auto Rename Tag, Color Highlight, Error Lens и Live Preview. Код расширений и команды VS Code не запускаются.', verifiedLabel: 'Проверено Open VSX',
    themeCountLabel: 'тем', snippetCountLabel: 'snippets', nativeFeatureCountLabel: 'совместимых функций',
    extensionInstalled: 'Расширение установлено', extensionRemoved: 'Расширение удалено', extensionRemoveFailed: 'Не удалось удалить расширение', extensionInstallFailed: 'Не удалось установить расширение',
    themeImported: 'Тема импортирована', snippetsImported: 'Сниппеты импортированы', invalidTheme: 'Некорректный JSON темы',
    invalidSnippets: 'Некорректный JSON сниппетов', previewViewport: 'Размер предпросмотра', viewportDesktop: 'Компьютер',
    viewportTablet: 'Планшет', viewportMobile: 'Телефон', reopenClosedTab: 'Открыть закрытую вкладку'
  };

  const LAYOUT_KEY = 'wdgd_layout_v1';
  function readLayout() {
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
      return {
        sidebarCollapsed: Boolean(saved.sidebarCollapsed),
        explorerCollapsed: Boolean(saved.explorerCollapsed),
        previewCollapsed: Boolean(saved.previewCollapsed),
        splitEditor: Boolean(saved.splitEditor),
        splitDirection: saved.splitDirection === 'horizontal' ? 'horizontal' : 'vertical',
        sidebarWidth: Math.max(180, Number(saved.sidebarWidth) || 230),
        explorerWidth: Math.max(170, Number(saved.explorerWidth) || 230),
        previewWidth: Math.max(280, Number(saved.previewWidth) || 420)
      };
    } catch {
      return { sidebarCollapsed: false, explorerCollapsed: false, previewCollapsed: false, splitEditor: false, splitDirection: 'vertical', sidebarWidth: 230, explorerWidth: 230, previewWidth: 420 };
    }
  }

  const state = {
    activeView: 'projects',
    appInfo: null,
    currentFile: '',
    diagnostics: [],
    diagnosticsRequest: 0,
    diagnosticsTimer: 0,
    docsCategory: 'all',
    docsQuery: '',
    docsSelectedId: '',
    dirty: false,
    editorChangeFrame: 0,
    editorChangePaths: new Set(),
    expandedFolders: new Set(),
    externalConflict: false,
    externalPath: '',
    gitFiles: [],
    gitSelectedPath: '',
    lastFinishedProcessId: '',
    packageData: null,
    packageQuery: '',
    packageUpdatesChecked: false,
    ownWriteAt: 0,
    ownWritePath: '',
    openFiles: [],
    recentlyClosedFiles: [],
    splitFile: '',
    splitDirty: false,
    splitSaveTimer: 0,
    splitDirection: readLayout().splitDirection,
    layout: readLayout(),
    preview: null,
    previewEntry: '',
    previewTimer: 0,
    processCommand: '',
    processContext: '',
    processId: '',
    processPid: 0,
    processStatus: 'idle',
    processUrl: '',
    stopRequested: false,
    project: null,
    recents: [],
    saveTimer: 0,
    searchCaseSensitive: false,
    searchRequest: 0,
    selectedPath: '',
    selectedType: '',
    watchedRoot: ''
  };

  const icon = (name, size = 17) => `<iconify-icon icon="tabler:${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;

  function fileKindMarkup(filePath, size = 15) {
    const fileName = String(filePath || '').split('/').at(-1).toLowerCase();
    const extension = fileName.includes('.') ? fileName.split('.').at(-1) : '';
    const types = {
      html: ['brand-html5', 'html'], htm: ['brand-html5', 'html'],
      css: ['brand-css3', 'css'], scss: ['brand-sass', 'scss'], sass: ['brand-sass', 'scss'], less: ['brand-css3', 'less'],
      js: ['brand-javascript', 'js'], mjs: ['brand-javascript', 'js'], cjs: ['brand-javascript', 'js'],
      jsx: ['brand-react', 'react'], ts: ['brand-typescript', 'ts'], tsx: ['brand-react', 'react'],
      json: ['braces', 'json'], md: ['markdown', 'markdown'], svg: ['file-type-svg', 'svg'],
      vue: ['brand-vue', 'vue'], py: ['brand-python', 'python']
    };
    const [iconName, kind] = types[extension] || ['file-code', 'default'];
    return `<span class="wdgd-file-kind kind-${kind}" aria-hidden="true">${icon(iconName, size)}</span>`;
  }

  function buildShell() {
    const launcher = document.createElement('button');
    launcher.id = 'wdgdLauncher';
    launcher.className = 'wdgd-launcher wdgd-launcher-fixed';
    launcher.type = 'button';
    launcher.title = copy.title;
    launcher.setAttribute('aria-label', copy.title);
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = icon('device-desktop-code', 19);

    const shell = document.createElement('section');
    shell.id = 'wdgdShell';
    shell.className = 'wdgd-shell';
    shell.hidden = true;
    shell.setAttribute('role', 'dialog');
    shell.setAttribute('aria-modal', 'true');
    shell.setAttribute('aria-label', copy.title);
    shell.innerHTML = `
      <div class="wdgd-window">
        <header class="wdgd-titlebar">
          ${icon('device-desktop-code', 20)}
          <div class="wdgd-titlebar-copy"><strong>${copy.title}</strong><small data-desktop-project-name>${copy.noProjectShort}</small></div>
          <button class="wdgd-icon-button" type="button" data-desktop-sidebar-toggle title="${copy.app}" aria-label="${copy.app}">${icon('layout-sidebar-left-collapse', 18)}</button>
          <button class="wdgd-icon-button" type="button" data-desktop-explorer-toggle title="${copy.projects}" aria-label="${copy.projects}">${icon('files', 18)}</button>
          <button class="wdgd-icon-button" type="button" data-desktop-preview-toggle title="${copy.preview}" aria-label="${copy.preview}">${icon('layout-sidebar-right-collapse', 18)}</button>
          <button class="wdgd-icon-button" type="button" data-desktop-layout-reset title="${copy.resetLayout}" aria-label="${copy.resetLayout}">${icon('layout-dashboard', 18)}</button>
          <button class="wdgd-icon-button" type="button" data-desktop-tray title="${copy.tray}" aria-label="${copy.tray}">${icon('minus', 18)}</button>
          <button class="wdgd-icon-button" type="button" data-desktop-close title="${copy.close}" aria-label="${copy.close}">${icon('x', 18)}</button>
        </header>
        <div class="wdgd-main">
          <aside class="wdgd-sidebar">
            <button class="wdgd-button primary wdgd-project-button" type="button" data-desktop-open>${icon('folder-open', 17)} ${copy.open}</button>
            <nav class="wdgd-nav" aria-label="${copy.title}">
              ${tabButton('projects', 'files', copy.projects)}
              ${tabButton('search', 'search', copy.search)}
              ${tabButton('terminal', 'terminal-2', copy.terminal)}
              ${tabButton('packages', 'packages', copy.dependencies)}
              ${tabButton('git', 'brand-git', copy.git)}
              ${tabButton('docs', 'books', copy.docs)}
              ${tabButton('backups', 'history', copy.backups)}
              ${tabButton('app', 'settings', copy.app)}
            </nav>
            <div class="wdgd-recents"><span class="wdgd-section-label">${copy.recents}</span><div data-desktop-recents></div></div>
          </aside>
          <div class="wdgd-main-splitter" data-desktop-splitter="sidebar" role="separator" tabindex="0" aria-orientation="vertical"></div>
          <main class="wdgd-content">
            <section class="wdgd-view" data-desktop-view="projects">
              <div class="wdgd-empty" data-desktop-empty><div>${icon('folder-plus', 34)}<strong>${copy.noProject}</strong><button class="wdgd-button primary" type="button" data-desktop-open>${copy.open}</button></div></div>
              <div class="wdgd-workspace" data-desktop-workspace hidden>
                <section class="wdgd-pane wdgd-explorer-pane">
                  <header class="wdgd-pane-head"><strong data-desktop-tree-title>${copy.project}</strong><button class="wdgd-icon-button" type="button" data-desktop-new-file title="${copy.newFile}" aria-label="${copy.newFile}">${icon('file-plus', 16)}</button><button class="wdgd-icon-button" type="button" data-desktop-new-folder title="${copy.newFolder}" aria-label="${copy.newFolder}">${icon('folder-plus', 16)}</button><button class="wdgd-icon-button" type="button" data-desktop-collapse title="${copy.collapseAll}" aria-label="${copy.collapseAll}">${icon('chevrons-up', 16)}</button><button class="wdgd-icon-button" type="button" data-desktop-refresh title="${copy.refresh}" aria-label="${copy.refresh}">${icon('refresh', 16)}</button></header>
                  <div class="wdgd-tree" data-desktop-tree></div>
                </section>
                <div class="wdgd-splitter" data-desktop-splitter="explorer" role="separator" tabindex="0" aria-orientation="vertical"></div>
                <section class="wdgd-pane wdgd-editor-pane">
                  <header class="wdgd-pane-head"><strong data-desktop-file-name>${copy.file}</strong>
                    <select class="wdgd-editor-theme" data-editor-theme aria-label="${copy.editorTheme}" title="${copy.editorTheme}"></select>
                    <button class="wdgd-icon-button" type="button" data-import-editor-theme title="${copy.importTheme}" aria-label="${copy.importTheme}">${icon('palette', 16)}</button>
                    <button class="wdgd-icon-button" type="button" data-import-editor-snippets title="${copy.importSnippets}" aria-label="${copy.importSnippets}">${icon('braces', 16)}</button>
                    <button class="wdgd-icon-button" type="button" data-editor-extensions title="${copy.extensions}" aria-label="${copy.extensions}">${icon('puzzle', 16)}</button>
                    <button class="wdgd-icon-button" type="button" data-editor-split-toggle title="${copy.splitEditor}" aria-label="${copy.splitEditor}">${icon('layout-columns', 16)}</button>
                    <select class="wdgd-editor-split-file" data-editor-split-file aria-label="${copy.splitEditor}" title="${copy.splitEditor}" hidden></select>
                    <select class="wdgd-editor-split-direction" data-editor-split-direction aria-label="${copy.splitDirection}" title="${copy.splitDirection}" hidden><option value="vertical">${copy.splitVertical}</option><option value="horizontal">${copy.splitHorizontal}</option></select>
                    <button class="wdgd-icon-button" type="button" data-desktop-ai-context disabled title="${copy.aiContext}" aria-label="${copy.aiContext}">${icon('sparkles', 16)}</button><button class="wdgd-button" type="button" data-desktop-reveal>${icon('folder-share', 15)} ${copy.reveal}</button><button class="wdgd-button primary" type="button" data-desktop-save>${icon('device-floppy', 15)} ${copy.save}</button>
                    <input type="file" data-editor-theme-file accept="application/json,.json" hidden><input type="file" data-editor-snippets-file accept="application/json,.json" hidden>
                  </header>
                  <div class="wdgd-file-tabs" data-desktop-file-tabs role="tablist"></div>
                  <div class="wdgd-editor-wrap">
                    <div class="wdgd-file-change" data-desktop-file-change hidden>
                      <div>${icon('file-alert', 18)}<span><strong>${copy.externalChange}</strong><small>${copy.externalChangeHint}</small></span></div>
                      <div class="wdgd-file-change-actions"><button class="wdgd-button" type="button" data-external-keep>${copy.keepMine}</button><button class="wdgd-button primary" type="button" data-external-reload>${copy.loadDisk}</button></div>
                    </div>
                    <div class="wdgd-editor-surface" data-editor-surface><textarea class="wdgd-editor" data-desktop-editor spellcheck="false" disabled></textarea></div>
                    <details class="wdgd-problems" data-desktop-problems>
                      <summary><span>${icon('alert-triangle', 15)} ${copy.problems}</span><span class="wdgd-problem-count" data-desktop-problem-count>0</span></summary>
                      <div class="wdgd-problem-list" data-desktop-problem-list><p class="wdgd-problem-empty">${copy.noProblems}</p></div>
                    </details>
                    <div class="wdgd-editor-status" data-desktop-editor-status>${copy.ready}</div>
                  </div>
                </section>
                <div class="wdgd-splitter" data-desktop-splitter="preview" role="separator" tabindex="0" aria-orientation="vertical"></div>
                <section class="wdgd-pane wdgd-preview-pane">
                  <header class="wdgd-pane-head"><strong>${copy.preview}</strong><select class="wdgd-preview-viewport" data-preview-viewport aria-label="${copy.previewViewport}" title="${copy.previewViewport}"><option value="desktop">${copy.viewportDesktop}</option><option value="tablet">${copy.viewportTablet}</option><option value="mobile">${copy.viewportMobile}</option></select><button class="wdgd-icon-button" type="button" data-desktop-preview-refresh title="${copy.refresh}" aria-label="${copy.refresh}">${icon('refresh', 16)}</button><button class="wdgd-button" type="button" data-desktop-preview>${icon('player-play', 15)} ${copy.preview}</button></header>
                  <div class="wdgd-preview-stage" data-preview-stage><iframe class="wdgd-preview" data-desktop-preview-frame title="${copy.preview}" sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"></iframe></div>
                </section>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="search" hidden>
              <div class="wdgd-search-view">
                <header class="wdgd-search-header"><div><span class="wdgd-runner-eyebrow">PROJECT SEARCH</span><h2>${copy.searchTitle}</h2></div><span class="wdgd-search-summary" data-search-summary></span></header>
                <form class="wdgd-search-form" data-project-search-form>
                  <label class="wdgd-search-field">${icon('search', 18)}<input type="search" maxlength="200" autocomplete="off" data-project-search-input placeholder="${copy.searchPlaceholder}"></label>
                  <button class="wdgd-search-case" type="button" data-search-case aria-pressed="false" title="${copy.matchCase}" aria-label="${copy.matchCase}">Aa</button>
                  <button class="wdgd-button primary" type="submit">${icon('search', 16)} ${copy.searchAction}</button>
                </form>
                <div class="wdgd-search-results" data-search-results><div class="wdgd-search-empty">${icon('file-search', 28)}<span>${copy.searchStart}</span></div></div>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="terminal" hidden>
              <div class="wdgd-runner-view">
                <header class="wdgd-runner-header">
                  <div><span class="wdgd-runner-eyebrow">PROJECT RUNNER</span><h2>${copy.runnerTitle}</h2><p>${copy.runnerSubtitle}</p></div>
                  <div class="wdgd-runner-state" data-runner-state="idle"><span></span><strong data-runner-status>${copy.processIdle}</strong></div>
                </header>
                <div class="wdgd-runner-meta">
                  <div><span>${icon('packages', 16)} ${copy.packageManager}</span><strong data-runner-manager>npm</strong></div>
                  <div><span>${icon('terminal-2', 16)} ${copy.activeProcess}</span><strong data-runner-process>${copy.processNone}</strong><small data-runner-pid hidden></small></div>
                  <div data-runner-url-card hidden><span>${icon('world-www', 16)} ${copy.localAddress}</span><button class="wdgd-runner-link" type="button" data-runner-open-url></button></div>
                </div>
                <section class="wdgd-runner-section">
                  <header><div><span class="wdgd-section-label">${copy.scripts}</span><small data-runner-script-count></small></div><button class="wdgd-button" type="button" data-runner-install>${icon('package-import', 15)} ${copy.installDependencies}</button></header>
                  <div class="wdgd-runner-scripts" data-desktop-scripts></div>
                </section>
                <section class="wdgd-runner-section wdgd-runner-command">
                  <span class="wdgd-section-label">${copy.customCommand}</span>
                  <form class="wdgd-command-row" data-desktop-command-form><input type="text" data-desktop-command placeholder="${copy.command}" autocomplete="off"><button class="wdgd-button primary" type="submit" data-runner-submit>${icon('player-play', 15)} ${copy.run}</button><button class="wdgd-button danger" type="button" data-desktop-stop disabled>${icon('player-stop', 15)} ${copy.stop}</button></form>
                </section>
                <section class="wdgd-runner-log">
                  <header><span class="wdgd-section-label">${copy.output}</span><button class="wdgd-button" type="button" data-desktop-clear>${copy.clear}</button></header>
                  <pre class="wdgd-terminal" data-desktop-terminal></pre>
                </section>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="packages" hidden>
              <div class="wdgd-packages-view">
                <header class="wdgd-packages-header">
                  <div><span class="wdgd-runner-eyebrow">PACKAGE WORKSPACE</span><h2>${copy.dependenciesTitle}</h2><p>${copy.dependenciesSubtitle}</p></div>
                  <div class="wdgd-toolbar"><span class="wdgd-package-manager">${icon('packages', 15)} <strong data-packages-manager>—</strong></span><button class="wdgd-button" type="button" data-packages-refresh>${icon('refresh', 15)} ${copy.refresh}</button><button class="wdgd-button primary" type="button" data-packages-updates>${icon('cloud-search', 15)} ${copy.dependencyCheck}</button><button class="wdgd-button danger" type="button" data-package-stop disabled>${icon('player-stop', 15)} ${copy.stop}</button></div>
                </header>
                <form class="wdgd-package-install" data-package-install-form>
                  <label>${icon('package-import', 17)}<input type="text" maxlength="214" autocomplete="off" data-package-name placeholder="${copy.dependencyName}"></label>
                  <select data-package-type aria-label="${copy.dependencyDevelopment}"><option value="production">${copy.dependencyRuntime}</option><option value="development">${copy.dependencyDevelopment}</option></select>
                  <button class="wdgd-button primary" type="submit" data-package-install>${icon('plus', 15)} ${copy.dependencyInstall}</button>
                </form>
                <div class="wdgd-package-summary">
                  <div><span>${copy.dependencyCount}</span><strong data-package-total>0</strong></div>
                  <div><span>${copy.dependencyRuntime}</span><strong data-package-runtime>0</strong></div>
                  <div><span>${copy.dependencyDevelopment}</span><strong data-package-development>0</strong></div>
                  <div><span>${copy.dependencyMissing}</span><strong data-package-missing>0</strong></div>
                </div>
                <label class="wdgd-package-search">${icon('search', 17)}<input type="search" autocomplete="off" data-package-search placeholder="${copy.dependencySearch}"></label>
                <div class="wdgd-package-list" data-package-list></div>
                <details class="wdgd-package-output"><summary>${copy.output}</summary><pre class="wdgd-terminal" data-package-output></pre></details>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="git" hidden>
              <div class="wdgd-git-view">
                <header class="wdgd-git-header"><div><span class="wdgd-runner-eyebrow">GIT WORKSPACE</span><h2>${copy.sourceControl}</h2></div><div class="wdgd-toolbar"><span class="wdgd-git-branch">${icon('git-branch', 14)} <span data-git-branch>${copy.branch}</span></span><button class="wdgd-icon-button" type="button" data-git-status title="${copy.refresh}" aria-label="${copy.refresh}">${icon('refresh', 16)}</button><button class="wdgd-button" type="button" data-git-history>${icon('history', 15)} ${copy.history}</button><button class="wdgd-button" type="button" data-git-push>${icon('cloud-upload', 15)} ${copy.push}</button></div></header>
                <div class="wdgd-git-workspace">
                  <section class="wdgd-git-changes"><header><strong>${copy.changes}</strong><span data-git-count>0</span></header><div class="wdgd-git-files" data-git-files></div></section>
                  <section class="wdgd-git-diff"><header><strong data-git-diff-title>${copy.selectDiff}</strong></header><pre data-git-diff>${copy.selectDiff}</pre></section>
                </div>
                <form class="wdgd-form-row wdgd-git-commit" data-git-commit-form><input type="text" maxlength="120" data-git-message placeholder="${copy.commitMessage}"><button class="wdgd-button primary" type="submit">${icon('git-commit', 15)} ${copy.commit}</button></form>
                <details class="wdgd-git-console"><summary>${copy.gitOutput}</summary><pre class="wdgd-git-output" data-git-output></pre></details>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="docs" hidden>
              <div class="wdgd-docs-view">
                <header class="wdgd-docs-header">
                  <div><span class="wdgd-runner-eyebrow">LOCAL REFERENCE</span><h2>${copy.docsTitle}</h2><p>${copy.docsSubtitle}</p></div>
                  <span class="wdgd-docs-offline">${icon('cloud-off', 15)} ${copy.docsOffline}</span>
                </header>
                <label class="wdgd-docs-search">${icon('search', 18)}<input type="search" autocomplete="off" data-docs-search placeholder="${copy.docsSearch}"><kbd>Ctrl K</kbd></label>
                <div class="wdgd-docs-categories" data-docs-categories></div>
                <div class="wdgd-docs-workspace">
                  <aside class="wdgd-docs-index"><header><strong>${copy.docs}</strong><span data-docs-count>0</span></header><div class="wdgd-docs-list" data-docs-list></div></aside>
                  <article class="wdgd-docs-article" data-docs-article></article>
                </div>
              </div>
            </section>
            <section class="wdgd-view" data-desktop-view="backups" hidden>
              <div class="wdgd-backup-view"><div class="wdgd-toolbar"><button class="wdgd-button primary" type="button" data-backup-create>${icon('device-floppy', 15)} ${copy.createBackup}</button><button class="wdgd-button" type="button" data-backup-refresh>${icon('refresh', 15)} ${copy.refresh}</button></div><div class="wdgd-backup-list" data-backup-list></div></div>
            </section>
            <section class="wdgd-view" data-desktop-view="app" hidden>
              <div class="wdgd-app-view"><div class="wdgd-grid"><section class="wdgd-section"><h3>${copy.app}</h3><p class="wdgd-muted" data-app-version>${copy.version}</p><div class="wdgd-toolbar"><button class="wdgd-button primary" type="button" data-app-update>${icon('refresh', 15)} ${copy.checkUpdate}</button><button class="wdgd-button" type="button" data-app-notify>${icon('bell', 15)} ${copy.notify}</button></div></section><section class="wdgd-section"><h3>WebDevGym</h3><div class="wdgd-toolbar"><button class="wdgd-button" type="button" data-desktop-tray>${icon('minus', 15)} ${copy.tray}</button><button class="wdgd-button danger" type="button" data-app-quit>${icon('power', 15)} ${copy.quit}</button></div></section></div></div>
            </section>
          </main>
        </div>
        <footer class="wdgd-statusbar"><span data-desktop-status>${copy.ready}</span><span data-desktop-root></span></footer>
        <dialog class="wdgd-extension-dialog" data-extension-dialog>
          <header><h2>${copy.extensions}</h2><button class="wdgd-icon-button" type="button" data-extension-close title="${copy.close}" aria-label="${copy.close}">${icon('x', 16)}</button></header>
          <p>${copy.extensionInfo}</p>
          <div class="wdgd-extension-tabs" role="tablist"><button class="active" type="button" role="tab" aria-selected="true" data-extension-tab="marketplace">${copy.marketplaceTab}</button><button type="button" role="tab" aria-selected="false" data-extension-tab="installed">${copy.installedTab}</button></div>
          <section class="wdgd-extension-marketplace" data-extension-marketplace-panel>
            <form class="wdgd-extension-search" data-extension-search-form><input type="search" data-extension-query placeholder="${copy.extensionSearchPlaceholder}" maxlength="100" autocomplete="off"><button class="wdgd-button primary" type="submit">${icon('search', 15)} ${copy.extensionSearchAction}</button></form>
            <div class="wdgd-extension-list" data-extension-results><p class="wdgd-extension-empty">${copy.extensionSearchHint}</p></div>
          </section>
          <section class="wdgd-extension-installed" data-extension-installed-panel hidden>
            <div class="wdgd-extension-list" data-extension-list></div>
            <button class="wdgd-button" type="button" data-extension-install>${icon('puzzle', 15)} ${copy.installExtension}</button>
          </section>
        </dialog>
      </div>`;

    document.body.append(shell, launcher);
    return { launcher, shell };
  }

  function tabButton(view, iconName, label) {
    return `<button class="wdgd-tab${view === 'projects' ? ' active' : ''}" type="button" data-desktop-tab="${view}">${icon(iconName, 17)}<span>${label}</span></button>`;
  }

  const elements = buildShell();
  const shell = elements.shell;
  const launcher = elements.launcher;
  const editor = shell.querySelector('[data-desktop-editor]');
  const editorSurface = shell.querySelector('[data-editor-surface]');
  const editorTheme = shell.querySelector('[data-editor-theme]');
  const editorThemeFile = shell.querySelector('[data-editor-theme-file]');
  const editorSnippetsFile = shell.querySelector('[data-editor-snippets-file]');
  const extensionDialog = shell.querySelector('[data-extension-dialog]');
  const extensionList = shell.querySelector('[data-extension-list]');
  const extensionResults = shell.querySelector('[data-extension-results]');
  const extensionQuery = shell.querySelector('[data-extension-query]');
  const extensionSearchForm = shell.querySelector('[data-extension-search-form]');
  const extensionMarketplacePanel = shell.querySelector('[data-extension-marketplace-panel]');
  const extensionInstalledPanel = shell.querySelector('[data-extension-installed-panel]');
  let currentMarketplaceResults = [];
  const splitDirectionSelect = shell.querySelector('[data-editor-split-direction]');
  const splitFileSelect = shell.querySelector('[data-editor-split-file]');
  const previewViewport = shell.querySelector('[data-preview-viewport]');
  const previewStage = shell.querySelector('[data-preview-stage]');
  const fileTabs = shell.querySelector('[data-desktop-file-tabs]');
  const editorStatus = shell.querySelector('[data-desktop-editor-status]');
  const fileChange = shell.querySelector('[data-desktop-file-change]');
  const problemCount = shell.querySelector('[data-desktop-problem-count]');
  const problemList = shell.querySelector('[data-desktop-problem-list]');
  const terminal = shell.querySelector('[data-desktop-terminal]');
  const packageList = shell.querySelector('[data-package-list]');
  const packageOutput = shell.querySelector('[data-package-output]');
  const packageSearch = shell.querySelector('[data-package-search]');
  const gitOutput = shell.querySelector('[data-git-output]');
  const gitFiles = shell.querySelector('[data-git-files]');
  const gitDiff = shell.querySelector('[data-git-diff]');
  const gitDiffTitle = shell.querySelector('[data-git-diff-title]');
  const gitBranch = shell.querySelector('[data-git-branch]');
  const gitCount = shell.querySelector('[data-git-count]');
  const gitConsole = shell.querySelector('.wdgd-git-console');
  const previewFrame = shell.querySelector('[data-desktop-preview-frame]');
  const searchInput = shell.querySelector('[data-project-search-input]');
  const searchResults = shell.querySelector('[data-search-results]');
  const searchSummary = shell.querySelector('[data-search-summary]');
  const docsSearch = shell.querySelector('[data-docs-search]');
  const docsCategories = shell.querySelector('[data-docs-categories]');
  const docsList = shell.querySelector('[data-docs-list]');
  const docsArticle = shell.querySelector('[data-docs-article]');
  const docsCount = shell.querySelector('[data-docs-count]');
  let monacoController = null;
  const editorAutocomplete = window.WebDevGymCodeEditor?.attachAutocomplete?.(editor, {
    fileName: () => state.currentFile,
    disabled: () => Boolean(monacoController)
  });
  window.WebDevGymMonaco?.mount(editor, {
    fileName: () => state.currentFile,
    onDidChange: handleEditorChange
  })
    .then(async controller => {
      monacoController = controller;
      editorAutocomplete?.hide();
      if (state.currentFile) controller.openFile(state.currentFile, editor.value);
      if (state.layout.splitEditor) {
        controller.setSplit(true, editorSurface);
        editorSurface.classList.add('is-split-editor');
        controller.setSplitDirection(state.splitDirection);
        const splitPath = state.splitFile || state.currentFile;
        if (splitPath) {
          const splitContent = await api.readFile(state.project?.root, splitPath).catch(() => null);
          if (splitContent) {
            controller.openSplitFile(splitPath, splitContent.content);
            state.splitFile = splitPath;
          }
        }
      }
      renderEditorThemeOptions();
      scheduleEditorLayout();
    })
    .catch(error => console.warn('[Desktop Center] Monaco fallback enabled:', error));
  const PROJECT_CONTEXT_EVENT = 'webdevgym:desktop-project-context-changed';
  const PROJECT_CONTEXT_MAX_FILES = 5;
  const PROJECT_CONTEXT_MAX_BYTES = 2 * 1024 * 1024;
  const PROJECT_CONTEXT_EXTENSIONS = new Set([
    'c', 'cc', 'cpp', 'cs', 'css', 'csv', 'env', 'gitignore', 'h', 'hpp', 'htm', 'html', 'ini', 'java',
    'js', 'json', 'jsx', 'less', 'md', 'mjs', 'php', 'py', 'rb', 'scss', 'sh', 'sql', 'svelte', 'svg',
    'toml', 'ts', 'tsx', 'txt', 'vue', 'xml', 'yaml', 'yml'
  ]);

  function isProjectContextFile(filePath) {
    const name = String(filePath || '').split('/').at(-1).toLowerCase();
    const extension = name.includes('.') ? name.split('.').at(-1) : name;
    return PROJECT_CONTEXT_EXTENSIONS.has(extension) || ['dockerfile', 'license', 'makefile'].includes(name);
  }

  function projectContextMime(filePath) {
    const extension = String(filePath || '').split('.').at(-1).toLowerCase();
    if (extension === 'html' || extension === 'htm') return 'text/html';
    if (extension === 'css') return 'text/css';
    if (['js', 'mjs', 'jsx'].includes(extension)) return 'text/javascript';
    if (extension === 'json') return 'application/json';
    if (['ts', 'tsx'].includes(extension)) return 'application/typescript';
    if (extension === 'svg') return 'image/svg+xml';
    if (extension === 'md') return 'text/markdown';
    return 'text/plain';
  }

  function projectContextSnapshot() {
    const files = (state.project?.entries || [])
      .filter(entry => entry.type === 'file' && isProjectContextFile(entry.path))
      .map(entry => ({ path: entry.path, name: entry.path.split('/').at(-1) }));
    return {
      available: Boolean(state.project),
      projectName: state.project?.name || '',
      currentFile: state.currentFile,
      files,
      maxFiles: PROJECT_CONTEXT_MAX_FILES
    };
  }

  function emitProjectContext() {
    const snapshot = projectContextSnapshot();
    const button = shell.querySelector('[data-desktop-ai-context]');
    if (button) button.disabled = !snapshot.currentFile || !isProjectContextFile(snapshot.currentFile);
    window.dispatchEvent(new CustomEvent(PROJECT_CONTEXT_EVENT, { detail: snapshot }));
  }

  async function attachProjectContextFiles(paths) {
    if (!state.project || typeof window.aiHandleFiles !== 'function') throw new Error(copy.aiContextUnavailable);
    const readable = new Set(projectContextSnapshot().files.map(file => file.path));
    const selected = [...new Set(Array.isArray(paths) ? paths : [])]
      .filter(filePath => readable.has(filePath))
      .slice(0, PROJECT_CONTEXT_MAX_FILES);
    if (!selected.length) throw new Error(copy.aiContextUnavailable);

    const files = [];
    const skipped = [];
    for (const filePath of selected) {
      try {
        const content = filePath === state.currentFile
          ? editor.value
          : (await api.readFile(state.project.root, filePath)).content;
        const file = new File([content], filePath.split('/').at(-1), {
          type: projectContextMime(filePath),
          lastModified: Date.now()
        });
        Object.defineProperty(file, 'webdevgymPath', { value: filePath });
        Object.defineProperty(file, 'webdevgymProjectRoot', { value: state.project.root });
        files.push(file);
      } catch {
        skipped.push(filePath);
      }
    }
    if (!files.length) throw new Error(copy.aiContextUnavailable);
    const attachedCount = Number(await window.aiHandleFiles(files)) || 0;
    return {
      attached: files.slice(0, attachedCount).map(file => file.webdevgymPath),
      skipped
    };
  }

  async function readProjectContextFiles(paths, expectedRoot = '') {
    if (!state.project || (expectedRoot && expectedRoot !== state.project.root)) {
      throw new Error(copy.noProjectShort);
    }
    const readable = new Set(projectContextSnapshot().files.map(file => file.path));
    const selected = [...new Set(Array.isArray(paths) ? paths : [])]
      .filter(filePath => readable.has(filePath))
      .slice(0, PROJECT_CONTEXT_MAX_FILES);
    if (!selected.length) throw new Error(copy.aiContextUnavailable);

    const files = [];
    for (const filePath of selected) {
      const content = filePath === state.currentFile
        ? editor.value
        : (await api.readFile(state.project.root, filePath)).content;
      files.push({
        path: filePath,
        name: filePath.split('/').at(-1),
        type: projectContextMime(filePath),
        size: new Blob([content]).size,
        text: content
      });
    }
    return { projectRoot: state.project.root, files };
  }

  async function reviewProjectEdits(edits) {
    if (!state.project) throw new Error(copy.noProjectShort);
    const readable = new Set(projectContextSnapshot().files.map(file => file.path));
    const unique = new Set();
    const candidates = (Array.isArray(edits) ? edits : []).filter(edit => {
      const filePath = String(edit?.path || '').replace(/\\/g, '/');
      if (!readable.has(filePath) || unique.has(filePath) || typeof edit?.content !== 'string') return false;
      if (new Blob([edit.content]).size > PROJECT_CONTEXT_MAX_BYTES) return false;
      unique.add(filePath);
      edit.path = filePath;
      return true;
    }).slice(0, PROJECT_CONTEXT_MAX_FILES);
    const files = [];
    for (const edit of candidates) {
      const before = edit.path === state.currentFile
        ? editor.value
        : (await api.readFile(state.project.root, edit.path)).content;
      if (before !== edit.content) files.push({ path: edit.path, before, after: edit.content });
    }
    if (!files.length) throw new Error(copy.aiEditEmpty);
    return {
      projectRoot: state.project.root,
      projectName: state.project.name,
      files
    };
  }

  async function applyProjectEdits(review) {
    if (!state.project || review?.projectRoot !== state.project.root) throw new Error(copy.noProjectShort);
    const files = Array.isArray(review.files) ? review.files.slice(0, PROJECT_CONTEXT_MAX_FILES) : [];
    if (!files.length) throw new Error(copy.aiEditEmpty);
    if (!(await saveNow())) throw new Error(copy.aiEditChanged);

    for (const file of files) {
      const current = await api.readFile(state.project.root, file.path);
      if (current.content !== file.before) throw new Error(copy.aiEditChanged);
    }

    await api.createBackup(state.project.root);
    const written = [];
    try {
      for (const file of files) {
        state.ownWriteAt = Date.now();
        state.ownWritePath = file.path;
        await api.writeFile(state.project.root, file.path, file.after);
        written.push(file);
      }
    } catch (error) {
      for (const file of written.reverse()) {
        await api.writeFile(state.project.root, file.path, file.before).catch(() => {});
      }
      throw error;
    }

    const currentChange = files.find(file => file.path === state.currentFile);
    if (currentChange) {
      editor.value = currentChange.after;
      state.dirty = false;
      hideExternalChange();
      editorStatus.textContent = copy.saved;
      void runDiagnostics();
    }
    await refreshProject();
    if (state.preview) refreshPreview();
    emitProjectContext();
    return { applied: files.map(file => file.path) };
  }

  async function attachCurrentFileToAi() {
    if (!state.currentFile) return;
    try {
      const result = await attachProjectContextFiles([state.currentFile]);
      if (!result.attached.length) return;
      setOpen(false);
      const aiWindow = document.getElementById('aiChatWin');
      if (aiWindow && !aiWindow.classList.contains('open')) window.toggleAiChat?.();
      window.setTimeout(() => {
        document.getElementById('aiChatWin')?.classList.add('wdgr-context-open');
      }, 0);
      setStatus(copy.aiContextAdded, 'success');
    } catch (error) {
      setStatus(error.message || copy.aiContextUnavailable, 'error');
    }
  }

  window.WebDevGymDesktopProjectContext = Object.freeze({
    snapshot: projectContextSnapshot,
    attach: attachProjectContextFiles,
    read: readProjectContextFiles,
    review: reviewProjectEdits,
    apply: applyProjectEdits
  });

  function mountLauncher() {
    const toolbar = [...document.querySelectorAll('.wdg-commandbar, .top-bar')]
      .find(candidate => candidate.offsetParent !== null && candidate.getBoundingClientRect().width > 300);
    if (!toolbar) {
      if (!launcher.isConnected) document.body.append(launcher);
      launcher.classList.add('wdgd-launcher-fixed');
      return;
    }
    const candidate = toolbar.querySelector('#wdgAiBtn') || toolbar.querySelector('.wdg-lang');
    const anchor = candidate?.parentElement === toolbar ? candidate : null;
    try {
      toolbar.insertBefore(launcher, anchor);
      launcher.classList.remove('wdgd-launcher-fixed');
      requestAnimationFrame(() => {
        const rect = launcher.getBoundingClientRect();
        if (launcher.offsetParent !== null && rect.left >= 0 && rect.right <= window.innerWidth) return;
        document.body.append(launcher);
        launcher.classList.add('wdgd-launcher-fixed');
      });
    } catch {
      document.body.append(launcher);
      launcher.classList.add('wdgd-launcher-fixed');
    }
  }

  function setOpen(open) {
    shell.hidden = !open;
    document.body.classList.toggle('wdgd-open', open);
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      shell.querySelector('[data-desktop-open]').focus();
      scheduleEditorLayout();
    } else {
      window.requestAnimationFrame(() => launcher.focus({ preventScroll: true }));
    }
  }

  function closeDesktopCenter() {
    flushEditorChanges();
    void saveAll();
    setOpen(false);
  }

  function setStatus(message, kind = '') {
    const target = shell.querySelector('[data-desktop-status]');
    target.textContent = message;
    target.className = kind;
  }

  function errorMessage(error) {
    return error?.message || String(error || 'Unknown error');
  }

  function editorOffset(line, column) {
    const lines = editor.value.split('\n');
    const targetLine = Math.max(1, Math.min(Number(line) || 1, lines.length));
    const targetColumn = Math.max(1, Number(column) || 1);
    let offset = 0;
    for (let index = 0; index < targetLine - 1; index += 1) offset += lines[index].length + 1;
    return offset + Math.min(targetColumn - 1, lines[targetLine - 1].length);
  }

  function jumpToProblem(problem) {
    const start = editorOffset(problem.line, problem.column);
    const end = Math.max(start + 1, editorOffset(problem.endLine, problem.endColumn));
    editor.focus();
    editor.setSelectionRange(start, end);
    const lineHeight = Number.parseFloat(getComputedStyle(editor).lineHeight) || 21;
    editor.scrollTop = Math.max(0, (problem.line - 3) * lineHeight);
  }

  function renderDiagnostics(problems = []) {
    state.diagnostics = problems;
    if (state.currentFile) monacoController?.setDiagnostics(state.currentFile, problems);
    const errors = problems.filter(problem => problem.severity === 'error').length;
    problemCount.textContent = problems.length ? `${errors}/${problems.length}` : '0';
    problemCount.dataset.hasErrors = String(errors > 0);
    problemList.replaceChildren();
    if (!problems.length) {
      const empty = document.createElement('p');
      empty.className = 'wdgd-problem-empty';
      empty.textContent = copy.noProblems;
      problemList.append(empty);
      return;
    }
    problems.forEach(problem => {
      const button = document.createElement('button');
      button.className = `wdgd-problem ${problem.severity}`;
      button.type = 'button';
      button.innerHTML = `<span class="wdgd-problem-icon">${icon(problem.severity === 'error' ? 'circle-x' : 'alert-triangle', 15)}</span><span class="wdgd-problem-copy"><strong></strong><small></small></span><span class="wdgd-problem-location"></span>`;
      button.querySelector('strong').textContent = problem.message;
      button.querySelector('small').textContent = [problem.source, problem.rule].filter(Boolean).join(' · ');
      button.querySelector('.wdgd-problem-location').textContent = `${copy.line} ${problem.line}:${problem.column}`;
      button.addEventListener('click', () => jumpToProblem(problem));
      problemList.append(button);
    });
  }

  async function runDiagnostics() {
    clearTimeout(state.diagnosticsTimer);
    if (!state.project || !state.currentFile) return renderDiagnostics([]);
    const request = ++state.diagnosticsRequest;
    const root = state.project.root;
    const filePath = state.currentFile;
    const content = editor.value;
    editorStatus.textContent = copy.checkingCode;
    try {
      const problems = await api.diagnoseFile(root, filePath, content);
      if (request !== state.diagnosticsRequest || state.currentFile !== filePath) return;
      renderDiagnostics(Array.isArray(problems) ? problems : []);
      editorStatus.textContent = state.dirty ? copy.saving : copy.ready;
    } catch (error) {
      if (request !== state.diagnosticsRequest) return;
      editorStatus.textContent = errorMessage(error);
      renderDiagnostics([]);
    }
  }

  function scheduleDiagnostics() {
    clearTimeout(state.diagnosticsTimer);
    state.diagnosticsTimer = window.setTimeout(runDiagnostics, 1400);
  }

  function resetDiagnostics() {
    clearTimeout(state.diagnosticsTimer);
    state.diagnosticsRequest += 1;
    renderDiagnostics([]);
  }

  async function withStatus(action, successMessage = copy.ready) {
    try {
      const result = await action();
      setStatus(successMessage, 'ok');
      return result;
    } catch (error) {
      setStatus(errorMessage(error), 'error');
      return null;
    }
  }

  function switchView(view) {
    state.activeView = view;
    shell.querySelectorAll('[data-desktop-tab]').forEach(button => button.classList.toggle('active', button.dataset.desktopTab === view));
    shell.querySelectorAll('[data-desktop-view]').forEach(section => { section.hidden = section.dataset.desktopView !== view; });
    if (view === 'backups' && state.project) void renderBackups();
    if (view === 'git' && state.project) void showGit('status');
    if (view === 'packages') void loadPackages(false);
    if (view === 'search') window.setTimeout(() => searchInput.focus(), 0);
    if (view === 'docs') {
      renderOfflineDocs();
      window.setTimeout(() => docsSearch.focus(), 0);
    }
  }

  function showSearchMessage(message, iconName = 'file-search') {
    searchResults.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'wdgd-search-empty';
    empty.innerHTML = icon(iconName, 28);
    const text = document.createElement('span');
    text.textContent = message;
    empty.append(text);
    searchResults.append(empty);
  }

  function resetSearchResults() {
    state.searchRequest += 1;
    searchInput.value = '';
    searchSummary.textContent = '';
    showSearchMessage(copy.searchStart);
  }

  async function jumpToSearchResult(result) {
    switchView('projects');
    await openFile(result.path);
    if (state.currentFile !== result.path) return;
    editor.focus();
    editor.setSelectionRange(result.offset, result.offset + result.length);
    editor.scrollTop = Math.max(0, (result.line - 1) * 21 - editor.clientHeight / 2);
  }

  function renderSearchResults(response) {
    searchResults.replaceChildren();
    const count = response.results.length;
    searchSummary.textContent = response.truncated
      ? `${count}+ ${copy.searchMatches} · ${copy.searchTruncated}`
      : `${count} ${copy.searchMatches}`;
    if (!count) return showSearchMessage(copy.searchEmpty, 'search-off');

    response.results.forEach(result => {
      const button = document.createElement('button');
      button.className = 'wdgd-search-result';
      button.type = 'button';
      const heading = document.createElement('span');
      heading.className = 'wdgd-search-result-heading';
      const file = document.createElement('strong');
      file.textContent = result.path;
      const location = document.createElement('span');
      location.textContent = `${result.line}:${result.column}`;
      heading.append(file, location);
      const preview = document.createElement('code');
      preview.textContent = result.preview || response.query;
      button.append(heading, preview);
      button.addEventListener('click', () => void jumpToSearchResult(result));
      searchResults.append(button);
    });
  }

  async function runProjectSearch(event) {
    event?.preventDefault();
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const query = searchInput.value.trim();
    if (!query) {
      searchSummary.textContent = '';
      showSearchMessage(copy.searchStart);
      return;
    }
    const request = ++state.searchRequest;
    searchSummary.textContent = copy.searchLoading;
    showSearchMessage(copy.searchLoading, 'loader-2');
    const response = await withStatus(() => api.searchProject(state.project.root, query, state.searchCaseSensitive));
    if (!response || request !== state.searchRequest) return;
    renderSearchResults(response);
  }

  function renderRecents() {
    const root = shell.querySelector('[data-desktop-recents]');
    root.replaceChildren();
    state.recents.forEach(project => {
      const row = document.createElement('div');
      row.className = 'wdgd-recent-row';
      const button = document.createElement('button');
      button.className = `wdgd-recent${state.project?.root === project.path ? ' active' : ''}`;
      button.type = 'button';
      const name = document.createElement('strong');
      const location = document.createElement('small');
      name.textContent = project.name;
      location.textContent = project.path;
      button.append(name, location);
      button.addEventListener('click', () => void openProject(project.path));
      const remove = document.createElement('button');
      remove.className = 'wdgd-recent-remove';
      remove.type = 'button';
      remove.title = copy.removeProject;
      remove.setAttribute('aria-label', `${copy.removeProject}: ${project.name}`);
      remove.innerHTML = icon('x', 15);
      remove.addEventListener('click', () => void forgetProject(project.path));
      row.append(button, remove);
      root.append(row);
    });
  }

  function renderFileTabs() {
    fileTabs.replaceChildren();
    state.openFiles.forEach(filePath => {
      const tab = document.createElement('div');
      const dirty = (filePath === state.currentFile && state.dirty) || (filePath === state.splitFile && state.splitDirty);
      tab.className = `wdgd-file-tab${filePath === state.currentFile ? ' active' : ''}${dirty ? ' dirty' : ''}`;
      tab.dataset.desktopOpenFile = filePath;
      tab.draggable = true;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(filePath === state.currentFile));
      tab.title = filePath;
      const label = document.createElement('button');
      label.type = 'button';
      label.className = 'wdgd-file-tab-label';
      label.innerHTML = fileKindMarkup(filePath, 14);
      const fileName = document.createElement('span');
      fileName.textContent = filePath.split('/').at(-1);
      label.append(fileName);
      const openSide = document.createElement('button');
      openSide.type = 'button';
      openSide.className = 'wdgd-file-tab-side';
      openSide.dataset.desktopOpenSide = filePath;
      openSide.title = copy.openToSide;
      openSide.setAttribute('aria-label', `${copy.openToSide}: ${filePath}`);
      openSide.innerHTML = icon('layout-columns', 13);
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'wdgd-file-tab-close';
      close.dataset.desktopCloseFile = filePath;
      close.title = copy.close;
      close.setAttribute('aria-label', `${copy.close}: ${filePath}`);
      close.innerHTML = icon('x', 13);
      tab.append(label, openSide, close);
      fileTabs.append(tab);
    });
    renderSplitFileOptions();
  }

  function renderSplitFileOptions() {
    if (!splitFileSelect) return;
    splitFileSelect.replaceChildren(...state.openFiles.map(filePath => {
      const option = document.createElement('option');
      option.value = filePath;
      option.textContent = filePath.split('/').at(-1);
      option.title = filePath;
      return option;
    }));
    splitFileSelect.value = state.splitFile || state.currentFile || '';
  }

  function updateFileTabState() {
    fileTabs.querySelectorAll('[data-desktop-open-file]').forEach(tab => {
      const active = tab.dataset.desktopOpenFile === state.currentFile;
      const dirty = (active && state.dirty) || (tab.dataset.desktopOpenFile === state.splitFile && state.splitDirty);
      tab.classList.toggle('active', active);
      tab.classList.toggle('dirty', dirty);
      tab.setAttribute('aria-selected', String(active));
    });
  }

  function clearEditor() {
    state.currentFile = '';
    state.dirty = false;
    if (monacoController) monacoController.clear();
    else editor.value = '';
    editor.disabled = true;
    shell.querySelector('[data-desktop-file-name]').textContent = copy.file;
    editorStatus.textContent = copy.ready;
    resetDiagnostics();
    editorAutocomplete?.hide();
    renderFileTabs();
    renderTree();
    emitProjectContext();
  }

  async function closeFileTab(filePath) {
    const index = state.openFiles.indexOf(filePath);
    if (index < 0) return;
    if (state.currentFile === filePath) await saveNow();
    if (state.splitFile === filePath) {
      await saveSplitNow();
      state.splitFile = '';
      state.splitDirty = false;
      state.layout.splitEditor = false;
      monacoController?.setSplit(false);
      shell.classList.remove('is-split-editor');
      editorSurface.classList.remove('is-split-editor');
      editorSurface.classList.remove('is-split-horizontal');
      splitDirectionSelect.hidden = true;
      splitFileSelect.hidden = true;
      saveLayout();
    }
    state.recentlyClosedFiles.push(filePath);
    if (state.recentlyClosedFiles.length > 20) state.recentlyClosedFiles.shift();
    state.openFiles = state.openFiles.filter(path => path !== filePath);
    monacoController?.closeFile(filePath);
    if (state.currentFile !== filePath) return renderFileTabs();
    const next = state.openFiles[Math.min(index, state.openFiles.length - 1)] || '';
    if (next) await openFile(next);
    else clearEditor();
  }

  function saveLayout() {
    state.layout.splitDirection = state.splitDirection;
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(state.layout)); } catch {}
  }

  function resetLayout() {
    Object.assign(state.layout, {
      sidebarCollapsed: false,
      explorerCollapsed: false,
      previewCollapsed: false,
      sidebarWidth: 230,
      explorerWidth: 230,
      previewWidth: 420,
      splitEditor: false,
      splitDirection: 'vertical'
    });
    state.splitDirection = 'vertical';
    state.splitFile = '';
    state.splitDirty = false;
    monacoController?.setSplit(false);
    editorSurface.classList.remove('is-split-horizontal');
    applyLayout();
    saveLayout();
  }

  function normalizeLayoutForViewport() {
    const mainWidth = shell.querySelector('.wdgd-main')?.getBoundingClientRect().width || 0;
    if (mainWidth > 0 && !state.layout.sidebarCollapsed) {
      state.layout.sidebarWidth = Math.min(state.layout.sidebarWidth, Math.max(180, mainWidth - 520));
    }

    const contentWidth = shell.querySelector('.wdgd-content')?.getBoundingClientRect().width || 0;
    if (contentWidth <= 0) return;
    const previewSpace = state.layout.previewCollapsed ? 0 : state.layout.previewWidth + 4;
    if (!state.layout.explorerCollapsed) {
      state.layout.explorerWidth = Math.min(state.layout.explorerWidth, Math.max(170, contentWidth - previewSpace - 320));
    }
    const explorerSpace = state.layout.explorerCollapsed ? 0 : state.layout.explorerWidth + 4;
    if (!state.layout.previewCollapsed) {
      state.layout.previewWidth = Math.min(state.layout.previewWidth, Math.max(280, contentWidth - explorerSpace - 320));
    }
  }

  function scheduleEditorLayout() {
    window.requestAnimationFrame(() => {
      monacoController?.layout();
      window.requestAnimationFrame(() => monacoController?.layout());
    });
  }

  function applyLayout() {
    shell.classList.toggle('is-sidebar-collapsed', state.layout.sidebarCollapsed);
    shell.classList.toggle('is-explorer-collapsed', state.layout.explorerCollapsed);
    shell.classList.toggle('is-preview-collapsed', state.layout.previewCollapsed);
    normalizeLayoutForViewport();
    shell.style.setProperty('--wdgd-sidebar-size', `${state.layout.sidebarWidth}px`);
    shell.style.setProperty('--wdgd-explorer-size', `${state.layout.explorerWidth}px`);
    shell.style.setProperty('--wdgd-preview-size', `${state.layout.previewWidth}px`);
    const sidebarButton = shell.querySelector('[data-desktop-sidebar-toggle]');
    const explorerButton = shell.querySelector('[data-desktop-explorer-toggle]');
    const previewButton = shell.querySelector('[data-desktop-preview-toggle]');
    if (sidebarButton) sidebarButton.innerHTML = icon(state.layout.sidebarCollapsed ? 'layout-sidebar-left-expand' : 'layout-sidebar-left-collapse', 18);
    if (explorerButton) explorerButton.classList.toggle('active', !state.layout.explorerCollapsed);
    if (previewButton) previewButton.innerHTML = icon(state.layout.previewCollapsed ? 'layout-sidebar-right-expand' : 'layout-sidebar-right-collapse', 18);
    shell.classList.toggle('is-split-editor', Boolean(state.layout.splitEditor));
    editorSurface.classList.toggle('is-split-editor', Boolean(state.layout.splitEditor));
    monacoController?.setSplit(Boolean(state.layout.splitEditor), editorSurface);
    splitDirectionSelect.hidden = !state.layout.splitEditor;
    splitFileSelect.hidden = !state.layout.splitEditor;
    splitDirectionSelect.value = state.splitDirection;
    monacoController?.setSplitDirection(state.splitDirection);
    scheduleEditorLayout();
  }

  async function openFileToSide(filePath) {
    if (!state.project) return;
    await saveSplitNow();
    if (!state.layout.splitEditor) {
      state.layout.splitEditor = true;
      state.splitDirection = 'vertical';
      state.splitFile = state.currentFile;
      applyLayout();
      saveLayout();
    }
    const result = await withStatus(() => api.readFile(state.project.root, filePath));
    if (!result || !monacoController?.openSplitFile(filePath, result.content)) return;
    state.splitFile = filePath;
    state.splitDirty = false;
    if (!state.openFiles.includes(filePath)) state.openFiles.push(filePath);
    renderFileTabs();
    splitFileSelect.hidden = false;
  }

  function applyEditorChange(filePath) {
    if (!filePath || filePath === state.currentFile) {
      scheduleSave();
      return;
    }
    if (filePath !== state.splitFile) return;
    const wasDirty = state.splitDirty;
    state.splitDirty = true;
    if (!wasDirty) {
      editorStatus.textContent = copy.saving;
      updateFileTabState();
    }
    clearTimeout(state.splitSaveTimer);
    if (state.externalConflict) return;
    state.splitSaveTimer = window.setTimeout(saveSplitNow, 1000);
  }

  function flushEditorChanges() {
    if (state.editorChangeFrame) cancelAnimationFrame(state.editorChangeFrame);
    state.editorChangeFrame = 0;
    const paths = [...state.editorChangePaths];
    state.editorChangePaths.clear();
    paths.forEach(applyEditorChange);
  }

  function handleEditorChange(filePath) {
    state.editorChangePaths.add(filePath || state.currentFile);
    if (state.editorChangeFrame) return;
    state.editorChangeFrame = window.requestAnimationFrame(flushEditorChanges);
  }

  async function saveSplitNow() {
    clearTimeout(state.splitSaveTimer);
    if (!state.project || !state.splitFile || !state.splitDirty) return true;
    const filePath = state.splitFile;
    const content = monacoController?.getFileValue(filePath) ?? '';
    state.ownWriteAt = Date.now();
    state.ownWritePath = filePath;
    const result = await api.writeFile(state.project.root, filePath, content).catch(error => {
      setStatus(errorMessage(error), 'error');
      return null;
    });
    if (!result) return false;
    if (state.splitFile === filePath) state.splitDirty = false;
    editorStatus.textContent = state.dirty ? copy.saving : copy.saved;
    renderFileTabs();
    schedulePreviewRefresh();
    return true;
  }

  async function reopenLastClosedFile() {
    const filePath = state.recentlyClosedFiles.pop();
    if (filePath && state.project) await openFile(filePath);
  }

  function renderEditorThemeOptions() {
    if (!editorTheme || !window.WebDevGymMonaco) return;
    const selected = window.WebDevGymMonaco.activeTheme();
    editorTheme.replaceChildren(...window.WebDevGymMonaco.themes().map(theme => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.label;
      return option;
    }));
    if ([...editorTheme.options].some(option => option.value === selected)) editorTheme.value = selected;
  }

  async function importEditorTheme(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || (!data.colors && !data.tokenColors)) throw new Error('invalid');
      const label = String(data.name || file.name.replace(/\.json$/i, '')).slice(0, 80);
      const id = `wdgd-import-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()}`;
      monacoController?.importTheme({ id, label, base: data.type === 'light' ? 'light' : 'dark', colors: data.colors || {}, tokenColors: data.tokenColors || [] });
      renderEditorThemeOptions();
      editorTheme.value = id;
      setStatus(copy.themeImported, 'ok');
    } catch {
      setStatus(copy.invalidTheme, 'error');
    }
  }

  async function importEditorSnippets(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid');
      const snippets = {};
      for (const [name, value] of Object.entries(data)) {
        if (!value || typeof value !== 'object' || (!value.prefix && !name) || (!value.body && !value.body?.length)) continue;
        const scope = typeof value.scope === 'string' ? value.scope.split(',').map(item => item.trim().toLowerCase()).filter(Boolean) : [];
        snippets[name] = { prefix: value.prefix || name, body: value.body, description: value.description || '', languages: scope };
      }
      if (!Object.keys(snippets).length) throw new Error('invalid');
      const count = monacoController?.importSnippets(snippets) || 0;
      setStatus(`${copy.snippetsImported}: ${count}`, 'ok');
    } catch {
      setStatus(copy.invalidSnippets, 'error');
    }
  }

  function renderExtensions() {
    extensionList.replaceChildren();
    const extensions = window.WebDevGymMonaco?.extensions?.() || [];
    if (!extensions.length) {
      const empty = document.createElement('p');
      empty.className = 'wdgd-extension-empty';
      empty.textContent = copy.noExtensions;
      extensionList.append(empty);
      return;
    }
    for (const extension of extensions) {
      const row = document.createElement('div');
      row.className = 'wdgd-extension-row';
      const details = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = `${extension.publisher ? `${extension.publisher}.` : ''}${extension.name}`;
      const summary = document.createElement('small');
      const themeCount = Array.isArray(extension.themes) ? extension.themes.length : 0;
      const snippetCount = Array.isArray(extension.snippets) ? extension.snippets.length : 0;
      const features = Array.isArray(extension.features) ? extension.features : [];
      const featureText = features.length ? ` · ${features.map(feature => feature.label).join(', ')}` : '';
      summary.textContent = `${extension.version || ''} · ${themeCount} ${copy.themeCountLabel} · ${snippetCount} ${copy.snippetCountLabel} · ${features.length} ${copy.nativeFeatureCountLabel}${featureText}`;
      details.append(name, summary);
      const remove = document.createElement('button');
      remove.className = 'wdgd-icon-button';
      remove.type = 'button';
      remove.title = copy.removeExtension;
      remove.setAttribute('aria-label', copy.removeExtension);
      remove.innerHTML = icon('trash', 15);
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try {
          await api.removeExtension(extension.id);
          monacoController?.removeExtension(extension.id);
          renderEditorThemeOptions();
          renderExtensions();
          renderMarketplaceResults(currentMarketplaceResults);
          setStatus(copy.extensionRemoved, 'ok');
        } catch (error) {
          remove.disabled = false;
          setStatus(`${copy.extensionRemoveFailed}: ${error.message}`, 'error');
        }
      });
      row.append(details, remove);
      extensionList.append(row);
    }
  }

  function setExtensionTab(tab) {
    const installed = tab === 'installed';
    extensionMarketplacePanel.hidden = installed;
    extensionInstalledPanel.hidden = !installed;
    shell.querySelectorAll('[data-extension-tab]').forEach(button => {
      const active = button.dataset.extensionTab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (installed) renderExtensions();
  }

  function renderMarketplaceResults(items) {
    extensionResults.replaceChildren();
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'wdgd-extension-empty';
      empty.textContent = copy.extensionSearchEmpty;
      extensionResults.append(empty);
      return;
    }
    const installed = window.WebDevGymMonaco?.extensions?.() || [];
    for (const extension of items) {
      const row = document.createElement('article');
      row.className = 'wdgd-extension-marketplace-item';
      const info = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = extension.displayName;
      const id = document.createElement('small');
      const downloadCount = new Intl.NumberFormat(isEnglish ? 'en-US' : 'ru-RU', { notation: 'compact' }).format(extension.downloadCount);
      id.textContent = `${extension.namespace}.${extension.name} · ${extension.version} · ${downloadCount} ${copy.extensionDownloads}${extension.verified ? ` · ${copy.verifiedLabel}` : ''}`;
      const description = document.createElement('p');
      description.textContent = extension.description || `${extension.downloadCount.toLocaleString()} downloads`;
      info.append(title, id, description);
      const action = document.createElement('button');
      action.className = 'wdgd-button primary';
      action.type = 'button';
      const isInstalled = installed.some(item => item.id.toLowerCase() === extension.id.toLowerCase() && item.version === extension.version);
      action.textContent = isInstalled ? copy.extensionInstalledAction : copy.extensionInstallAction;
      action.disabled = isInstalled;
      action.addEventListener('click', () => void installMarketplaceExtension(extension, action));
      row.append(info, action);
      extensionResults.append(row);
    }
  }

  async function searchExtensionMarketplace() {
    const query = extensionQuery.value.trim();
    if (!query) return;
    extensionResults.replaceChildren();
    const loading = document.createElement('p');
    loading.className = 'wdgd-extension-empty';
    loading.textContent = copy.extensionSearching;
    extensionResults.append(loading);
    const submit = extensionSearchForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      currentMarketplaceResults = await api.searchExtensions(query);
      renderMarketplaceResults(currentMarketplaceResults);
    } catch (error) {
      extensionResults.replaceChildren();
      const failed = document.createElement('p');
      failed.className = 'wdgd-extension-empty';
      failed.textContent = `${copy.extensionMarketplaceFailed}: ${error.message}`;
      extensionResults.append(failed);
    } finally {
      submit.disabled = false;
    }
  }

  async function installMarketplaceExtension(extension, button) {
    if (!monacoController) {
      setStatus('Open a project file before installing editor extensions', 'error');
      return;
    }
    button.disabled = true;
    button.textContent = copy.extensionInstalling;
    try {
      const packageData = await api.installMarketplaceExtension({
        namespace: extension.namespace,
        name: extension.name,
        version: extension.version
      });
      const installed = monacoController.importExtension(packageData);
      renderEditorThemeOptions();
      renderExtensions();
      button.textContent = copy.extensionInstalledAction;
      setStatus(`${copy.extensionInstalled}: ${packageData.displayName} · ${installed.themes} themes · ${installed.snippets} snippets · ${installed.features} compatible features`, 'ok');
    } catch (error) {
      button.disabled = false;
      button.textContent = copy.extensionInstallAction;
      setStatus(`${copy.extensionInstallFailed}: ${error.message}`, 'error');
    }
  }

  async function installVsixExtension() {
    if (!monacoController) {
      setStatus('Open a project file before installing editor extensions', 'error');
      return;
    }
    try {
      const extension = await api.installVsix();
      if (!extension) return;
      const installed = monacoController.importExtension(extension);
      renderEditorThemeOptions();
      renderExtensions();
      setExtensionTab('installed');
      setStatus(`${copy.extensionInstalled}: ${extension.displayName} · ${installed.themes} themes · ${installed.snippets} snippets · ${installed.features} compatible features`, 'ok');
    } catch (error) {
      setStatus(`${copy.extensionInstallFailed}: ${error.message}`, 'error');
    }
  }

  function applyPreviewViewport() {
    const widths = { desktop: '100%', tablet: '768px', mobile: '390px' };
    const mode = previewViewport.value;
    previewFrame.style.width = widths[mode] || widths.desktop;
    previewFrame.style.maxWidth = '100%';
    previewStage.dataset.viewport = mode;
    try { localStorage.setItem('wdgd_preview_viewport_v1', mode); } catch {}
  }

  function toggleLayoutPart(part) {
    state.layout[part] = !state.layout[part];
    applyLayout();
    saveLayout();
  }

  function bindSplitter(name) {
    const splitter = shell.querySelector(`[data-desktop-splitter="${name}"]`);
    if (!splitter) return;
    const defaults = { sidebar: 230, explorer: 230, preview: 420 };
    const sizeKeys = { sidebar: 'sidebarWidth', explorer: 'explorerWidth', preview: 'previewWidth' };
    const collapsedKeys = { sidebar: 'sidebarCollapsed', explorer: 'explorerCollapsed', preview: 'previewCollapsed' };
    const resize = clientX => {
      if (name === 'sidebar') {
        const rect = shell.querySelector('.wdgd-main').getBoundingClientRect();
        const requested = clientX - rect.left;
        state.layout.sidebarCollapsed = requested < 110;
        if (!state.layout.sidebarCollapsed) {
          state.layout.sidebarWidth = Math.round(Math.min(Math.max(220, rect.width - 420), Math.max(160, requested)));
        }
      } else {
        const rect = shell.querySelector('.wdgd-workspace').getBoundingClientRect();
        if (name === 'explorer') {
          const requested = clientX - rect.left;
          state.layout.explorerCollapsed = requested < 90;
          if (!state.layout.explorerCollapsed) {
            const previewSpace = state.layout.previewCollapsed ? 0 : state.layout.previewWidth + 4;
            state.layout.explorerWidth = Math.round(Math.min(Math.max(180, rect.width - previewSpace - 320), Math.max(150, requested)));
          }
        } else {
          const requested = rect.right - clientX;
          state.layout.previewCollapsed = requested < 130;
          if (!state.layout.previewCollapsed) {
            const explorerSpace = state.layout.explorerCollapsed ? 0 : state.layout.explorerWidth + 4;
            state.layout.previewWidth = Math.round(Math.min(Math.max(260, rect.width - explorerSpace - 320), Math.max(240, requested)));
          }
        }
      }
      applyLayout();
    };
    splitter.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      splitter.classList.add('active');
      document.body.classList.add('wdgd-resizing');
      const shield = document.createElement('div');
      shield.className = 'wdgd-drag-shield';
      document.body.append(shield);
      const move = moveEvent => resize(moveEvent.clientX);
      const stop = () => {
        splitter.classList.remove('active');
        document.body.classList.remove('wdgd-resizing');
        shield.removeEventListener('pointermove', move);
        shield.removeEventListener('pointerup', stop);
        shield.removeEventListener('pointercancel', stop);
        shield.remove();
        saveLayout();
      };
      shield.addEventListener('pointermove', move);
      shield.addEventListener('pointerup', stop);
      shield.addEventListener('pointercancel', stop);
    });
    splitter.addEventListener('dblclick', () => {
      state.layout[sizeKeys[name]] = defaults[name];
      state.layout[collapsedKeys[name]] = false;
      applyLayout();
      saveLayout();
    });
    splitter.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -20 : 20;
      if (name === 'sidebar') state.layout.sidebarWidth = Math.max(180, state.layout.sidebarWidth + direction);
      else if (name === 'explorer') state.layout.explorerWidth = Math.max(170, state.layout.explorerWidth + direction);
      else state.layout.previewWidth = Math.max(280, state.layout.previewWidth - direction);
      applyLayout();
      saveLayout();
    });
  }

  function renderProject() {
    const hasProject = Boolean(state.project);
    shell.querySelector('[data-desktop-empty]').hidden = hasProject;
    shell.querySelector('[data-desktop-workspace]').hidden = !hasProject;
    shell.querySelector('[data-desktop-project-name]').textContent = state.project?.name || copy.noProjectShort;
    shell.querySelector('[data-desktop-root]').textContent = state.project?.root || '';
    renderRecents();
    emitProjectContext();
    if (!hasProject) {
      shell.querySelector('[data-desktop-tree]').replaceChildren();
      shell.querySelector('[data-desktop-tree-title]').textContent = copy.project;
      return;
    }
    shell.querySelector('[data-desktop-tree-title]').textContent = state.project.name;
    renderTree();
    renderScripts();
  }

  function renderTree() {
    const tree = shell.querySelector('[data-desktop-tree]');
    tree.replaceChildren();
    if (!state.project) return;
    const children = new Map();
    state.project.entries.forEach(entry => {
      const separator = entry.path.lastIndexOf('/');
      const parent = separator === -1 ? '' : entry.path.slice(0, separator);
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(entry);
    });
    children.forEach(entries => entries.sort((left, right) => {
      if (left.type !== right.type) return left.type === 'directory' ? -1 : 1;
      return left.path.localeCompare(right.path, undefined, { numeric: true });
    }));

    const appendChildren = (parent = '', depth = 0) => {
      (children.get(parent) || []).forEach(entry => {
        const container = document.createElement('div');
        container.className = 'wdgd-tree-entry';
        const row = document.createElement('button');
        row.className = `wdgd-tree-row${state.currentFile === entry.path ? ' active' : ''}${state.selectedPath === entry.path ? ' selected' : ''}`;
        row.type = 'button';
        row.style.paddingLeft = `${7 + depth * 13}px`;
        row.title = entry.path;

        const expanded = entry.type === 'directory' && state.expandedFolders.has(entry.path);
        const twisty = document.createElement('span');
        twisty.className = 'wdgd-tree-twisty';
        twisty.innerHTML = entry.type === 'directory' ? icon(expanded ? 'chevron-down' : 'chevron-right', 14) : '';
        const marker = document.createElement('span');
        marker.className = 'wdgd-tree-kind';
        marker.innerHTML = entry.type === 'file'
          ? fileKindMarkup(entry.path)
          : icon(expanded ? 'folder-open' : 'folder', 15);
        const label = document.createElement('span');
        label.textContent = entry.path.split('/').at(-1);
        row.append(twisty, marker, label);
        row.addEventListener('click', () => {
          state.selectedPath = entry.path;
          state.selectedType = entry.type;
          if (entry.type === 'directory') {
            if (expanded) state.expandedFolders.delete(entry.path);
            else state.expandedFolders.add(entry.path);
            renderTree();
          } else {
            void openFile(entry.path);
          }
        });

        const actions = document.createElement('div');
        actions.className = 'wdgd-tree-actions';
        const rename = document.createElement('button');
        rename.type = 'button';
        rename.title = copy.rename;
        rename.setAttribute('aria-label', `${copy.rename}: ${entry.path}`);
        rename.innerHTML = icon('pencil', 14);
        rename.addEventListener('click', () => void renameEntry(entry));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.title = copy.deleteItem;
        remove.setAttribute('aria-label', `${copy.deleteItem}: ${entry.path}`);
        remove.innerHTML = icon('trash', 14);
        remove.addEventListener('click', () => void deleteEntry(entry));
        actions.append(rename, remove);
        container.append(row, actions);
        tree.append(container);
        if (expanded) appendChildren(entry.path, depth + 1);
      });
    };

    appendChildren();
  }

  function renderScripts() {
    const root = shell.querySelector('[data-desktop-scripts]');
    root.replaceChildren();
    const manager = state.project?.packageManager || 'npm';
    const hasPackageJson = Boolean(state.project?.hasPackageJson);
    const scripts = Object.entries(state.project?.scripts || {})
      .filter(([name, command]) => /^[\w:.-]+$/.test(name) && typeof command === 'string');
    shell.querySelector('[data-runner-manager]').textContent = hasPackageJson ? manager : '—';
    shell.querySelector('[data-runner-script-count]').textContent = String(scripts.length);
    const install = shell.querySelector('[data-runner-install]');
    install.dataset.runnerUnavailable = String(!hasPackageJson);
    install.onclick = () => void runCommand(installCommand(manager));

    if (!scripts.length) {
      const empty = document.createElement('p');
      empty.className = 'wdgd-runner-empty';
      empty.textContent = copy.noScripts;
      root.append(empty);
      updateRunnerUi();
      return;
    }

    scripts.forEach(([name, command]) => {
      const row = document.createElement('div');
      row.className = 'wdgd-runner-script';
      row.dataset.runnerScript = name;
      const info = document.createElement('div');
      const title = document.createElement('strong');
      const source = document.createElement('code');
      title.textContent = name;
      source.textContent = command;
      info.append(title, source);
      const button = document.createElement('button');
      button.className = 'wdgd-button wdgd-runner-script-run';
      button.type = 'button';
      button.dataset.runnerAction = 'run';
      button.innerHTML = `${icon('player-play', 15)} ${copy.run}`;
      button.addEventListener('click', () => void runCommand(scriptCommand(manager, name)));
      row.append(info, button);
      root.append(row);
    });
    updateRunnerUi();
  }

  function packageTypeLabel(type) {
    return type === 'development' ? copy.dependencyDevelopment : copy.dependencyRuntime;
  }

  function showPackageMessage(message, iconName = 'packages') {
    packageList.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'wdgd-package-empty';
    empty.innerHTML = icon(iconName, 28);
    const text = document.createElement('span');
    text.textContent = message;
    empty.append(text);
    packageList.append(empty);
  }

  function renderPackages() {
    const data = state.packageData;
    const dependencies = Array.isArray(data?.dependencies) ? data.dependencies : [];
    shell.querySelector('[data-packages-manager]').textContent = data?.hasPackageJson ? data.manager : '—';
    shell.querySelector('[data-package-total]').textContent = String(dependencies.length);
    shell.querySelector('[data-package-runtime]').textContent = String(dependencies.filter(item => item.type === 'production').length);
    shell.querySelector('[data-package-development]').textContent = String(dependencies.filter(item => item.type === 'development').length);
    shell.querySelector('[data-package-missing]').textContent = String(dependencies.filter(item => !item.installed).length);

    const available = Boolean(state.project && data?.hasPackageJson);
    shell.querySelectorAll('[data-package-name], [data-package-type], [data-package-install], [data-packages-updates]')
      .forEach(control => { control.disabled = !available; });
    if (!state.project || !data?.hasPackageJson) return showPackageMessage(copy.dependencyNoProject, 'package-off');

    const query = state.packageQuery.trim().toLocaleLowerCase();
    const visible = query ? dependencies.filter(item => item.name.toLocaleLowerCase().includes(query)) : dependencies;
    if (!visible.length) return showPackageMessage(dependencies.length ? copy.searchEmpty : copy.dependencyEmpty, dependencies.length ? 'search-off' : 'package');

    packageList.replaceChildren();
    visible.forEach(dependency => {
      const row = document.createElement('article');
      row.className = 'wdgd-package-row';
      row.dataset.packageName = dependency.name;
      if (!dependency.installed) row.classList.add('missing');
      if (dependency.updateAvailable) row.classList.add('update');

      const identity = document.createElement('div');
      identity.className = 'wdgd-package-identity';
      const heading = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = dependency.name;
      const type = document.createElement('span');
      type.textContent = packageTypeLabel(dependency.type);
      type.className = dependency.type;
      heading.append(name, type);
      const requested = document.createElement('small');
      requested.textContent = `${copy.dependencyRequested}: ${dependency.requested}`;
      identity.append(heading, requested);

      const versions = document.createElement('div');
      versions.className = 'wdgd-package-versions';
      const installed = document.createElement('span');
      installed.innerHTML = `<small>${copy.dependencyInstalled}</small><strong></strong>`;
      installed.querySelector('strong').textContent = dependency.installed || copy.dependencyMissing;
      versions.append(installed);
      if (state.packageUpdatesChecked) {
        const latest = document.createElement('span');
        latest.innerHTML = `<small>${copy.dependencyLatest}</small><strong></strong>`;
        latest.querySelector('strong').textContent = dependency.latest || '—';
        versions.append(latest);
      }

      const actions = document.createElement('div');
      actions.className = 'wdgd-package-actions';
      const update = document.createElement('button');
      update.type = 'button';
      update.className = `wdgd-button${dependency.updateAvailable ? ' primary' : ''}`;
      update.dataset.packageAction = dependency.installed ? 'update' : 'install';
      update.innerHTML = `${icon(dependency.installed ? 'arrow-up' : 'download', 14)} ${dependency.installed ? copy.dependencyUpdate : copy.dependencyInstall}`;
      update.addEventListener('click', () => void runPackageOperation(update.dataset.packageAction, dependency));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'wdgd-icon-button danger';
      remove.dataset.packageAction = 'remove';
      remove.title = copy.dependencyRemove;
      remove.setAttribute('aria-label', `${copy.dependencyRemove}: ${dependency.name}`);
      remove.innerHTML = icon('trash', 15);
      remove.addEventListener('click', () => void runPackageOperation('remove', dependency));
      actions.append(update, remove);
      row.append(identity, versions, actions);
      packageList.append(row);
    });
    updateRunnerUi();
  }

  async function loadPackages(checkUpdates = false) {
    if (!state.project) {
      state.packageData = null;
      state.packageUpdatesChecked = false;
      renderPackages();
      return;
    }
    const result = await withStatus(
      () => checkUpdates ? api.packageUpdates(state.project.root) : api.packages(state.project.root),
      checkUpdates ? copy.dependencyUpdatesReady : copy.ready
    );
    if (!result) return;
    state.packageData = result;
    state.packageUpdatesChecked = checkUpdates;
    renderPackages();
  }

  function appendPackageOutput(text, kind = '') {
    const span = document.createElement('span');
    span.className = kind;
    span.textContent = text;
    packageOutput.append(span);
    packageOutput.scrollTop = packageOutput.scrollHeight;
  }

  async function runPackageOperation(action, dependency = null) {
    if (!state.project || !state.project.hasPackageJson) return setStatus(copy.dependencyNoProject, 'error');
    if (state.processId) return setStatus(isEnglish ? 'Stop the current process first' : 'Сначала останови текущий процесс', 'error');
    const input = shell.querySelector('[data-package-name]');
    const type = shell.querySelector('[data-package-type]');
    const name = dependency?.name || input.value.trim();
    const development = dependency ? dependency.type === 'development' : type.value === 'development';
    if (!name) return input.focus();
    if (action === 'remove' && !window.confirm(`${copy.dependencyConfirmRemove}\n${name}`)) return;

    state.processCommand = `${action}: ${name}`;
    state.processContext = 'packages';
    state.processPid = 0;
    state.processStatus = 'starting';
    state.stopRequested = false;
    updateRunnerUi();
    appendPackageOutput(`\n> ${state.processCommand}\n`, 'success');
    const result = await withStatus(() => api.packageMutate(state.project.root, action, name, development));
    if (!result) {
      state.processStatus = 'failed';
      updateRunnerUi();
      return;
    }
    state.processCommand = result.command;
    if (action === 'install' && !dependency) input.value = '';
    if (state.lastFinishedProcessId === result.id) return;
    state.processId = result.id;
    state.processPid = result.pid || 0;
    state.processStatus = 'running';
    updateRunnerUi();
  }

  function installCommand(manager) {
    if (manager === 'yarn') return 'yarn install';
    if (manager === 'pnpm') return 'pnpm install';
    if (manager === 'bun') return 'bun install';
    return 'npm install';
  }

  function scriptCommand(manager, name) {
    if (manager === 'yarn') return `yarn ${name}`;
    if (manager === 'pnpm') return `pnpm run ${name}`;
    if (manager === 'bun') return `bun run ${name}`;
    return `npm run ${name}`;
  }

  function runnerStatusLabel(status) {
    return {
      idle: copy.processIdle,
      starting: copy.processStarting,
      running: copy.processRunning,
      stopping: copy.processStopping,
      stopped: copy.processStopped,
      success: copy.processSuccess,
      failed: copy.processFailed
    }[status] || copy.processIdle;
  }

  function updateRunnerUi() {
    const busy = ['starting', 'running', 'stopping'].includes(state.processStatus);
    const status = shell.querySelector('[data-runner-state]');
    status.dataset.runnerState = state.processStatus;
    shell.querySelector('[data-runner-status]').textContent = runnerStatusLabel(state.processStatus);
    shell.querySelector('[data-runner-process]').textContent = state.processCommand || copy.processNone;
    const pid = shell.querySelector('[data-runner-pid]');
    pid.hidden = !state.processPid;
    pid.textContent = state.processPid ? `${copy.pid} ${state.processPid}` : '';
    const urlCard = shell.querySelector('[data-runner-url-card]');
    const urlButton = shell.querySelector('[data-runner-open-url]');
    urlCard.hidden = !state.processUrl;
    urlButton.textContent = state.processUrl;
    shell.querySelectorAll('[data-runner-action="run"], [data-runner-install], [data-runner-submit]').forEach(button => {
      button.disabled = busy || button.dataset.runnerUnavailable === 'true';
    });
    shell.querySelector('[data-desktop-stop]').disabled = !busy || state.processStatus === 'stopping';
    const packageAvailable = Boolean(state.project?.hasPackageJson);
    shell.querySelectorAll('[data-package-name], [data-package-type], [data-package-install], [data-packages-updates], [data-packages-refresh], [data-package-action]')
      .forEach(control => { control.disabled = busy || !packageAvailable; });
    shell.querySelector('[data-package-stop]').disabled = !busy || state.processStatus === 'stopping';
  }

  function captureLocalAddress(text) {
    if (state.processUrl) return;
    const match = String(text || '').match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/[^\s"'<>]*)?/i);
    if (!match) return;
    state.processUrl = match[0].replace('0.0.0.0', '127.0.0.1').replace(/[),.;]+$/, '');
    updateRunnerUi();
  }

  function parentPath(entryPath = '') {
    const separator = entryPath.lastIndexOf('/');
    return separator === -1 ? '' : entryPath.slice(0, separator);
  }

  function selectedDirectory() {
    if (state.selectedType === 'directory') return state.selectedPath;
    return parentPath(state.selectedPath || state.currentFile);
  }

  function validEntryName(value) {
    const name = String(value || '').trim();
    if (!name || name === '.' || name === '..' || /[\\/:*?"<>|\0]/.test(name) || /[. ]$/.test(name)) return '';
    return name;
  }

  function childPath(directory, name) {
    return directory ? `${directory}/${name}` : name;
  }

  function rebasePath(value, from, to) {
    if (value === from) return to;
    return value.startsWith(`${from}/`) ? `${to}${value.slice(from.length)}` : value;
  }

  async function createEntry(type) {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const directory = selectedDirectory();
    const rawName = window.prompt(type === 'file' ? copy.fileNamePrompt : copy.folderNamePrompt, '');
    if (rawName === null) return;
    const name = validEntryName(rawName);
    if (!name) return setStatus(copy.invalidName, 'error');
    const entryPath = childPath(directory, name);
    const result = await withStatus(() => type === 'file'
      ? api.createFile(state.project.root, entryPath)
      : api.createDirectory(state.project.root, entryPath));
    if (!result) return;
    if (directory) state.expandedFolders.add(directory);
    state.selectedPath = entryPath;
    state.selectedType = type === 'file' ? 'file' : 'directory';
    await refreshProject();
    if (type === 'file') await openFile(entryPath);
  }

  async function renameEntry(entry) {
    if (!state.project) return;
    const oldName = entry.path.split('/').at(-1);
    const rawName = window.prompt(copy.renamePrompt, oldName);
    if (rawName === null) return;
    const name = validEntryName(rawName);
    if (!name) return setStatus(copy.invalidName, 'error');
    const nextPath = childPath(parentPath(entry.path), name);
    if (nextPath === entry.path) return;
    await saveNow();
    const result = await withStatus(() => api.renameEntry(state.project.root, entry.path, nextPath));
    if (!result) return;
    state.expandedFolders = new Set([...state.expandedFolders].map(value => rebasePath(value, entry.path, nextPath)));
    state.openFiles = state.openFiles.map(value => rebasePath(value, entry.path, nextPath));
    state.selectedPath = rebasePath(state.selectedPath, entry.path, nextPath);
    state.currentFile = rebasePath(state.currentFile, entry.path, nextPath);
    await refreshProject();
    if (state.currentFile) await openFile(state.currentFile);
  }

  async function deleteEntry(entry) {
    if (!state.project || !window.confirm(`${copy.confirmDelete}\n\n${entry.path}`)) return;
    await saveNow();
    const result = await withStatus(() => api.deleteEntry(state.project.root, entry.path));
    if (!result) return;
    state.openFiles = state.openFiles.filter(filePath => filePath !== entry.path && !filePath.startsWith(`${entry.path}/`));
    const containsCurrentFile = state.currentFile === entry.path || state.currentFile.startsWith(`${entry.path}/`);
    if (containsCurrentFile) {
      const next = state.openFiles[0] || '';
      if (next) await openFile(next);
      else clearEditor();
    }
    if (state.selectedPath === entry.path || state.selectedPath.startsWith(`${entry.path}/`)) {
      state.selectedPath = '';
      state.selectedType = '';
    }
    state.expandedFolders = new Set([...state.expandedFolders].filter(value => value !== entry.path && !value.startsWith(`${entry.path}/`)));
    await refreshProject();
  }

  async function forgetProject(root) {
    if (!window.confirm(copy.confirmForget)) return;
    if (state.project?.root === root) {
      await saveNow();
      await stopPreview();
      await api.unwatchProject().catch(() => {});
    }
    const recents = await withStatus(() => api.forgetProject(root));
    if (!recents) return;
    state.recents = recents;
    if (state.project?.root === root) {
      state.project = null;
      state.currentFile = '';
      state.openFiles = [];
      state.packageData = null;
      state.packageQuery = '';
      state.packageUpdatesChecked = false;
      state.selectedPath = '';
      state.selectedType = '';
      state.expandedFolders.clear();
      state.dirty = false;
      state.watchedRoot = '';
      hideExternalChange();
      if (monacoController) monacoController.clear();
      else editor.value = '';
      editor.disabled = true;
      shell.querySelector('[data-desktop-file-name]').textContent = copy.file;
      resetDiagnostics();
      packageSearch.value = '';
      renderPackages();
      renderFileTabs();
    }
    renderProject();
  }

  async function chooseProject() {
    const project = await withStatus(() => api.chooseProject());
    if (!project) return;
    await selectProject(project);
  }

  async function openProject(root) {
    const project = await withStatus(() => api.openProject(root));
    if (!project) return;
    await selectProject(project);
  }

  function defaultProjectFile(project) {
    const files = project?.entries?.filter(entry => entry.type === 'file').map(entry => entry.path) || [];
    return files.find(filePath => /(^|\/)index\.html?$/i.test(filePath)) ||
      files.find(filePath => /\.html?$/i.test(filePath)) ||
      files.find(filePath => /\.(?:css|[cm]?[jt]sx?|json|md|txt|ya?ml|xml|svg)$/i.test(filePath)) ||
      '';
  }

  async function openLaunchRequest(request) {
    if (!request?.root) return;
    setOpen(true);
    await openProject(request.root);
    if (request.file && state.project?.root === request.root) {
      await openFile(request.file);
    }
  }

  async function selectProject(project) {
    if (state.processId) await stopProcess();
    await stopPreview();
    await saveAll();
    await api.unwatchProject().catch(() => {});
    state.project = project;
    state.currentFile = '';
    state.openFiles = [];
    state.splitFile = '';
    state.splitDirty = false;
    state.gitFiles = [];
    state.gitSelectedPath = '';
    state.packageData = null;
    state.packageQuery = '';
    state.packageUpdatesChecked = false;
    state.selectedPath = '';
    state.selectedType = '';
    state.expandedFolders.clear();
    hideExternalChange();
    if (monacoController) monacoController.clear();
    else editor.value = '';
    editor.disabled = true;
    shell.querySelector('[data-desktop-file-name]').textContent = copy.file;
    renderFileTabs();
    resetDiagnostics();
    resetSearchResults();
    terminal.replaceChildren();
    packageOutput.replaceChildren();
    packageSearch.value = '';
    state.processCommand = '';
    state.processContext = '';
    state.lastFinishedProcessId = '';
    state.processPid = 0;
    state.processStatus = 'idle';
    state.processUrl = '';
    state.stopRequested = false;
    const recents = await api.recentProjects();
    state.recents = Array.isArray(recents) ? recents : [];
    renderProject();
    switchView('projects');
    await startWatchingProject(project.root);
    const initialFile = defaultProjectFile(project);
    if (initialFile) await openFile(initialFile);
  }

  async function refreshProject() {
    if (!state.project) return;
    const project = await withStatus(() => api.refreshProject(state.project.root));
    if (!project) return;
    state.project = project;
    const projectFiles = new Set(project.entries.filter(entry => entry.type === 'file').map(entry => entry.path));
    state.openFiles = state.openFiles.filter(filePath => projectFiles.has(filePath));
    if (state.currentFile && !projectFiles.has(state.currentFile)) {
      const next = state.openFiles[0] || '';
      if (next) return openFile(next);
      clearEditor();
    }
    renderFileTabs();
    renderProject();
  }

  async function openFile(filePath) {
    if (!state.project) return;
    if (state.currentFile === filePath && !editor.disabled) {
      shell.querySelector('[data-desktop-file-name]').textContent = filePath;
      renderFileTabs();
      editorAutocomplete?.refresh();
      editor.focus();
      return;
    }
    await saveNow();
    const result = await withStatus(() => api.readFile(state.project.root, filePath));
    if (!result) return;
    state.currentFile = filePath;
    if (!state.openFiles.includes(filePath)) state.openFiles.push(filePath);
    state.selectedPath = filePath;
    state.selectedType = 'file';
    state.dirty = false;
    hideExternalChange();
    if (monacoController) {
      monacoController.openFile(filePath, result.content);
      if (state.layout.splitEditor && !state.splitFile) {
        monacoController.openSplitFile(filePath, result.content);
        state.splitFile = filePath;
      }
    }
    else editor.value = result.content;
    editor.disabled = false;
    shell.querySelector('[data-desktop-file-name]').textContent = filePath;
    editorStatus.textContent = copy.ready;
    renderFileTabs();
    renderTree();
    emitProjectContext();
    void runDiagnostics();
    editorAutocomplete?.refresh();
    if (/\.html?$/i.test(filePath)) {
      state.previewEntry = filePath;
      void startPreview();
    } else if (state.preview) {
      refreshPreview();
    }
  }

  function scheduleSave() {
    if (!state.currentFile) return;
    const wasDirty = state.dirty;
    state.dirty = true;
    if (!wasDirty) {
      editorStatus.textContent = copy.saving;
      updateFileTabState();
    }
    clearTimeout(state.saveTimer);
    if (state.externalConflict) return;
    state.saveTimer = window.setTimeout(saveNow, 1000);
    scheduleDiagnostics();
  }

  async function saveNow() {
    clearTimeout(state.saveTimer);
    if (!state.project || !state.currentFile || !state.dirty) return true;
    state.ownWriteAt = Date.now();
    state.ownWritePath = state.currentFile;
    const result = await withStatus(() => api.writeFile(state.project.root, state.currentFile, editor.value), copy.saved);
    if (!result) return false;
    state.dirty = false;
    editorStatus.textContent = copy.saved;
    updateFileTabState();
    schedulePreviewRefresh();
    return true;
  }

  async function saveAll() {
    flushEditorChanges();
    const splitSaved = await saveSplitNow();
    const currentSaved = await saveNow();
    return splitSaved && currentSaved;
  }

  function hideExternalChange() {
    state.externalConflict = false;
    state.externalPath = '';
    fileChange.hidden = true;
  }

  function showExternalChange(filePath) {
    clearTimeout(state.saveTimer);
    state.externalConflict = true;
    state.externalPath = filePath;
    fileChange.hidden = false;
    editorStatus.textContent = copy.externalChange;
  }

  async function reloadCurrentFile() {
    if (!state.project || !state.currentFile) return false;
    const root = state.project.root;
    const filePath = state.currentFile;
    const result = await withStatus(() => api.readFile(root, filePath));
    if (!result || state.project?.root !== root || state.currentFile !== filePath) return false;
    editor.value = result.content;
    state.dirty = false;
    hideExternalChange();
    editorStatus.textContent = copy.reloadedFromDisk;
    void runDiagnostics();
    return true;
  }

  async function startWatchingProject(root) {
    try {
      await api.watchProject(root);
      state.watchedRoot = root;
    } catch (error) {
      state.watchedRoot = '';
      setStatus(`${copy.watchError}: ${errorMessage(error)}`, 'error');
    }
  }

  async function handleProjectChanges(payload = {}) {
    if (!state.project || payload.root !== state.project.root || !Array.isArray(payload.changes)) return;
    const now = Date.now();
    const currentChange = payload.changes.find(change => change.path === state.currentFile);
    let isOwnWrite = currentChange &&
      state.ownWritePath === currentChange.path &&
      now - state.ownWriteAt < 1500;

    if (isOwnWrite) {
      const diskFile = await api.readFile(state.project.root, currentChange.path).catch(() => null);
      isOwnWrite = diskFile?.content === editor.value;
    }

    if (currentChange && !isOwnWrite) {
      if (state.dirty) showExternalChange(currentChange.path);
      else await reloadCurrentFile();
    }

    if (payload.changes.some(change => change.eventType === 'rename')) {
      const project = await api.refreshProject(state.project.root).catch(() => null);
      if (project && state.project?.root === payload.root) {
        state.project = project;
        renderProject();
      }
    }
    if (state.preview && !isOwnWrite) refreshPreview();
    if (state.activeView === 'git') void refreshGitChanges();
  }

  function previewEntryPath() {
    if (!state.project) return '';
    const htmlFiles = state.project.entries
      .filter(entry => entry.type === 'file' && /\.html?$/i.test(entry.path))
      .map(entry => entry.path);
    if (state.previewEntry && htmlFiles.includes(state.previewEntry)) return state.previewEntry;
    if (/\.html?$/i.test(state.currentFile) && htmlFiles.includes(state.currentFile)) return state.currentFile;
    return htmlFiles.find(path => /(^|\/)index\.html?$/i.test(path)) || htmlFiles[0] || '';
  }

  function refreshPreview() {
    if (!state.preview) return;
    const entry = previewEntryPath();
    if (!entry) {
      previewFrame.removeAttribute('src');
      return;
    }
    state.previewEntry = entry;
    const encodedPath = entry.split('/').map(encodeURIComponent).join('/');
    const url = new URL(encodedPath, state.preview.url);
    url.searchParams.set('refresh', Date.now());
    previewFrame.src = url.href;
  }

  function schedulePreviewRefresh() {
    window.clearTimeout(state.previewTimer);
    state.previewTimer = window.setTimeout(() => {
      if (state.preview) refreshPreview();
      else if (/\.html?$/i.test(state.currentFile)) void startPreview();
    }, 250);
  }

  async function startPreview() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    await saveNow();
    if (!state.preview) {
      const preview = await withStatus(() => api.startPreview(state.project.root));
      if (!preview) return;
      state.preview = preview;
    }
    refreshPreview();
  }

  async function stopPreview() {
    if (!state.preview) return;
    await api.stopPreview(state.preview.id).catch(() => {});
    state.preview = null;
    state.previewEntry = '';
    window.clearTimeout(state.previewTimer);
    previewFrame.removeAttribute('src');
  }

  function appendTerminal(text, kind = '') {
    const span = document.createElement('span');
    span.className = kind;
    span.textContent = text;
    terminal.append(span);
    terminal.scrollTop = terminal.scrollHeight;
    captureLocalAddress(text);
  }

  async function runCommand(command) {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    if (state.processId) return setStatus(isEnglish ? 'Stop the current process first' : 'Сначала останови текущий процесс', 'error');
    state.processCommand = command;
    state.processContext = 'runner';
    state.processPid = 0;
    state.processStatus = 'starting';
    state.processUrl = '';
    state.stopRequested = false;
    updateRunnerUi();
    appendTerminal(`\n> ${command}\n`, 'success');
    const result = await withStatus(() => api.startProcess(state.project.root, command));
    if (!result) {
      state.processStatus = 'failed';
      updateRunnerUi();
      return;
    }
    if (state.lastFinishedProcessId === result.id) return;
    state.processId = result.id;
    state.processPid = result.pid || 0;
    state.processStatus = 'running';
    updateRunnerUi();
  }

  async function stopProcess() {
    if (!state.processId) return;
    const id = state.processId;
    state.stopRequested = true;
    state.processStatus = 'stopping';
    updateRunnerUi();
    const stopped = await withStatus(() => api.stopProcess(id));
    if (!stopped) {
      state.processId = '';
      state.processPid = 0;
      state.processStatus = 'stopped';
      updateRunnerUi();
    }
  }

  function gitFileState(file) {
    if (file.index === '?' && file.worktree === '?') return copy.untracked;
    if (file.staged && file.unstaged) return `${copy.staged} + ${copy.unstaged}`;
    return file.staged ? copy.staged : copy.unstaged;
  }

  function resetGitDiff() {
    state.gitSelectedPath = '';
    gitDiffTitle.textContent = copy.selectDiff;
    gitDiff.textContent = copy.selectDiff;
  }

  function renderGitFiles() {
    gitFiles.replaceChildren();
    gitCount.textContent = String(state.gitFiles.length);
    if (!state.gitFiles.length) {
      const empty = document.createElement('div');
      empty.className = 'wdgd-git-empty';
      empty.innerHTML = icon('circle-check', 24);
      const text = document.createElement('span');
      text.textContent = copy.noChanges;
      empty.append(text);
      gitFiles.append(empty);
      resetGitDiff();
      return;
    }

    state.gitFiles.forEach(file => {
      const row = document.createElement('div');
      row.className = 'wdgd-git-file';
      row.classList.toggle('active', file.path === state.gitSelectedPath);

      const select = document.createElement('button');
      select.className = 'wdgd-git-file-main';
      select.type = 'button';
      const pathText = document.createElement('span');
      pathText.className = 'wdgd-git-file-path';
      pathText.textContent = file.path;
      const stateText = document.createElement('span');
      stateText.className = 'wdgd-git-file-state';
      stateText.textContent = gitFileState(file);
      select.append(pathText, stateText);
      select.addEventListener('click', () => void loadGitDiff(file.path));
      row.append(select);

      const actions = document.createElement('div');
      actions.className = 'wdgd-git-file-actions';
      if (file.unstaged) {
        const stage = document.createElement('button');
        stage.className = 'wdgd-icon-button';
        stage.type = 'button';
        stage.title = copy.stage;
        stage.setAttribute('aria-label', `${copy.stage}: ${file.path}`);
        stage.innerHTML = icon('plus', 15);
        stage.addEventListener('click', () => void changeGitStage(file.path, true));
        actions.append(stage);
      }
      if (file.staged) {
        const unstage = document.createElement('button');
        unstage.className = 'wdgd-icon-button';
        unstage.type = 'button';
        unstage.title = copy.unstage;
        unstage.setAttribute('aria-label', `${copy.unstage}: ${file.path}`);
        unstage.innerHTML = icon('minus', 15);
        unstage.addEventListener('click', () => void changeGitStage(file.path, false));
        actions.append(unstage);
      }
      row.append(actions);
      gitFiles.append(row);
    });
  }

  async function refreshGitChanges() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const selectedPath = state.gitSelectedPath;
    const result = await withStatus(() => api.gitChanges(state.project.root));
    if (!result) return;
    state.gitFiles = Array.isArray(result.files) ? result.files : [];
    state.gitSelectedPath = state.gitFiles.some(file => file.path === selectedPath) ? selectedPath : '';
    gitBranch.textContent = result.branch || 'HEAD';
    renderGitFiles();
    if (state.gitSelectedPath) await loadGitDiff(state.gitSelectedPath, false);
    else resetGitDiff();
  }

  async function loadGitDiff(filePath, rerender = true) {
    if (!state.project) return;
    state.gitSelectedPath = filePath;
    if (rerender) renderGitFiles();
    gitDiffTitle.textContent = filePath;
    gitDiff.textContent = isEnglish ? 'Loading diff...' : 'Загрузка diff...';
    const result = await withStatus(() => api.gitDiff(state.project.root, filePath));
    if (!result || state.gitSelectedPath !== filePath) return;
    const sections = [];
    if (result.staged) sections.push(`[${copy.staged.toUpperCase()}]\n${result.staged}`);
    if (result.unstaged) sections.push(`[${copy.unstaged.toUpperCase()}]\n${result.unstaged}`);
    gitDiff.textContent = sections.join('\n') || copy.noDiff;
  }

  async function changeGitStage(filePath, shouldStage) {
    if (!state.project) return;
    const action = shouldStage ? api.gitStage : api.gitUnstage;
    const result = await withStatus(() => action(state.project.root, filePath));
    if (!result) return;
    if (result.code !== 0) {
      setStatus(result.stderr || result.stdout || 'Git command failed', 'error');
      return;
    }
    state.gitSelectedPath = filePath;
    await refreshGitChanges();
  }

  async function showGit(mode) {
    if (mode !== 'history') return refreshGitChanges();
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    gitOutput.textContent = isEnglish ? 'Loading...\n' : 'Загрузка...\n';
    gitConsole.open = true;
    const result = await withStatus(() => api.gitHistory(state.project.root));
    if (!result) return;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}` || (isEnglish ? 'No output.' : 'Нет вывода.');
  }

  async function commitGit(message) {
    if (!state.project) return false;
    const result = await withStatus(() => api.gitCommit(state.project.root, message));
    if (!result) return false;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}`;
    gitConsole.open = true;
    if (result.code !== 0) {
      setStatus(result.stderr || result.stdout || 'Git commit failed', 'error');
      return false;
    }
    await refreshGitChanges();
    return true;
  }

  async function pushGit() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const result = await withStatus(() => api.gitPush(state.project.root));
    if (!result) return;
    gitOutput.textContent = `${result.stdout || ''}${result.stderr || ''}`;
    gitConsole.open = true;
    if (result.code !== 0) setStatus(result.stderr || result.stdout || 'Git push failed', 'error');
  }

  function docsValue(value) {
    if (typeof value === 'string') return value;
    return value?.[isEnglish ? 'en' : 'ru'] || value?.en || value?.ru || '';
  }

  function docsData() {
    return window.WebDevGymOfflineDocs || { categories: [], articles: [] };
  }

  function docsCategory(categoryId) {
    return docsData().categories.find(category => category.id === categoryId);
  }

  function filteredDocs() {
    const query = state.docsQuery.trim().toLocaleLowerCase(isEnglish ? 'en' : 'ru');
    return docsData().articles.filter(article => {
      if (state.docsCategory !== 'all' && article.category !== state.docsCategory) return false;
      if (!query) return true;
      const searchable = [
        docsValue(article.title), docsValue(article.summary), docsValue(article.body),
        ...(article.points || []).map(docsValue), ...(article.tags || []), article.code || ''
      ].join(' ').toLocaleLowerCase(isEnglish ? 'en' : 'ru');
      return searchable.includes(query);
    });
  }

  function renderDocsCategories() {
    docsCategories.replaceChildren();
    const items = [{ id: 'all', label: copy.docsAll, icon: 'library' }, ...docsData().categories];
    items.forEach(category => {
      const button = document.createElement('button');
      button.className = `wdgd-docs-category${state.docsCategory === category.id ? ' active' : ''}`;
      button.type = 'button';
      button.dataset.docsCategory = category.id;
      const count = category.id === 'all'
        ? docsData().articles.length
        : docsData().articles.filter(article => article.category === category.id).length;
      button.innerHTML = `${icon(category.icon, 15)}<span></span><small>${count}</small>`;
      button.querySelector('span').textContent = docsValue(category.label);
      button.addEventListener('click', () => {
        state.docsCategory = category.id;
        state.docsSelectedId = '';
        renderOfflineDocs();
      });
      docsCategories.append(button);
    });
  }

  function renderDocsList(articles) {
    docsList.replaceChildren();
    docsCount.textContent = String(articles.length);
    if (!articles.length) {
      const empty = document.createElement('div');
      empty.className = 'wdgd-docs-empty';
      empty.innerHTML = icon('book-off', 28);
      const label = document.createElement('span');
      label.textContent = copy.docsEmpty;
      empty.append(label);
      docsList.append(empty);
      return;
    }
    articles.forEach(article => {
      const category = docsCategory(article.category);
      const button = document.createElement('button');
      button.className = `wdgd-docs-topic${state.docsSelectedId === article.id ? ' active' : ''}`;
      button.type = 'button';
      button.dataset.docsId = article.id;
      button.innerHTML = `<span class="wdgd-docs-topic-icon">${icon(category?.icon || 'file-text', 17)}</span><span class="wdgd-docs-topic-copy"><strong></strong><small></small></span>`;
      button.querySelector('strong').textContent = docsValue(article.title);
      button.querySelector('small').textContent = docsValue(category?.label);
      button.addEventListener('click', () => {
        state.docsSelectedId = article.id;
        renderDocsList(articles);
        renderDocsArticle(article);
      });
      docsList.append(button);
    });
  }

  async function copyDocsExample(code) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = code;
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.append(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
    setStatus(copy.docsCopied, 'ok');
  }

  function renderDocsArticle(article) {
    docsArticle.replaceChildren();
    if (!article) {
      const empty = document.createElement('div');
      empty.className = 'wdgd-docs-article-empty';
      empty.innerHTML = icon('book-2', 34);
      const label = document.createElement('span');
      label.textContent = copy.docsChoose;
      empty.append(label);
      docsArticle.append(empty);
      return;
    }

    const category = docsCategory(article.category);
    const header = document.createElement('header');
    header.className = 'wdgd-docs-article-header';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'wdgd-runner-eyebrow';
    eyebrow.textContent = docsValue(category?.label);
    const title = document.createElement('h3');
    title.textContent = docsValue(article.title);
    const summary = document.createElement('p');
    summary.textContent = docsValue(article.summary);
    header.append(eyebrow, title, summary);

    const body = document.createElement('p');
    body.className = 'wdgd-docs-body';
    body.textContent = docsValue(article.body);

    const pointsSection = document.createElement('section');
    pointsSection.className = 'wdgd-docs-points';
    const pointsTitle = document.createElement('h4');
    pointsTitle.textContent = copy.docsKeyPoints;
    const points = document.createElement('ul');
    (article.points || []).forEach(point => {
      const item = document.createElement('li');
      item.textContent = docsValue(point);
      points.append(item);
    });
    pointsSection.append(pointsTitle, points);

    const example = document.createElement('section');
    example.className = 'wdgd-docs-example';
    const exampleHeader = document.createElement('header');
    const exampleTitle = document.createElement('h4');
    exampleTitle.textContent = copy.docsExample;
    const language = document.createElement('span');
    language.textContent = article.language || 'text';
    const copyButton = document.createElement('button');
    copyButton.className = 'wdgd-icon-button';
    copyButton.type = 'button';
    copyButton.title = copy.docsCopy;
    copyButton.setAttribute('aria-label', copy.docsCopy);
    copyButton.innerHTML = icon('copy', 16);
    copyButton.addEventListener('click', () => void copyDocsExample(article.code || ''));
    exampleHeader.append(exampleTitle, language, copyButton);
    const code = document.createElement('pre');
    code.dataset.docsCode = article.id;
    code.textContent = article.code || '';
    example.append(exampleHeader, code);

    docsArticle.append(header, body, pointsSection, example);
  }

  function renderOfflineDocs() {
    const articles = filteredDocs();
    if (!articles.some(article => article.id === state.docsSelectedId)) {
      state.docsSelectedId = articles[0]?.id || '';
    }
    renderDocsCategories();
    renderDocsList(articles);
    renderDocsArticle(articles.find(article => article.id === state.docsSelectedId));
  }

  async function renderBackups() {
    const list = shell.querySelector('[data-backup-list]');
    if (!state.project) {
      list.textContent = copy.noProjectShort;
      return;
    }
    const backups = await withStatus(() => api.listBackups(state.project.root));
    if (!backups) return;
    list.replaceChildren();
    if (!backups.length) {
      const empty = document.createElement('span');
      empty.className = 'wdgd-muted';
      empty.textContent = copy.noBackups;
      list.append(empty);
      return;
    }
    backups.forEach(backup => {
      const row = document.createElement('div');
      row.className = 'wdgd-backup-item';
      const time = document.createElement('time');
      time.dateTime = backup.createdAt;
      time.textContent = new Date(backup.createdAt).toLocaleString();
      const restore = document.createElement('button');
      restore.className = 'wdgd-button';
      restore.type = 'button';
      restore.textContent = copy.restore;
      restore.addEventListener('click', async () => {
        if (!window.confirm(copy.confirmRestore)) return;
        const restored = await withStatus(() => api.restoreBackup(state.project.root, backup.id), copy.restored);
        if (restored) await refreshProject();
      });
      row.append(time, restore);
      list.append(row);
    });
  }

  async function createBackup() {
    if (!state.project) return setStatus(copy.noProjectShort, 'error');
    const result = await withStatus(() => api.createBackup(state.project.root));
    if (result) await renderBackups();
  }

  async function checkUpdate() {
    const update = await withStatus(() => api.checkUpdate());
    if (!update) return;
    if (!update.hasUpdate) return setStatus(copy.upToDate, 'ok');

    setStatus(`${copy.downloadingUpdate}: 0%`, 'ok');
    const downloaded = await withStatus(() => api.downloadUpdate(), copy.updateDownloaded);
    if (!downloaded) return;

    const message = `${copy.updateDownloaded}: ${downloaded.latest}`;
    setStatus(message, 'ok');
    if (window.confirm(`${message}. ${copy.installUpdate}`)) {
      await withStatus(() => api.installUpdate(downloaded.path), copy.installingUpdate);
    }
  }

  function monitorTimer() {
    let previous = null;
    window.setInterval(() => {
      let current = null;
      try { current = JSON.parse(localStorage.getItem('wdgu_timer_state_v1') || 'null'); } catch {}
      if (previous?.status === 'running' && current) {
        if (previous.mode === 'timer' && current.status === 'idle' && current.remaining === 0) {
          void api.notify('WebDevGym', copy.timerDone);
        } else if (previous.phase === 'focus' && current.phase === 'break') {
          void api.notify('WebDevGym', copy.focusDone);
        } else if (previous.phase === 'break' && current.phase === 'focus') {
          void api.notify('WebDevGym', copy.breakDone);
        }
      }
      previous = current;
    }, 1000);
  }

  launcher.addEventListener('click', () => setOpen(shell.hidden));
  shell.addEventListener('click', event => {
    if (event.target === shell) setOpen(false);
    const tab = event.target.closest('[data-desktop-tab]');
    if (tab) switchView(tab.dataset.desktopTab);
  });
  shell.querySelectorAll('[data-desktop-open]').forEach(button => button.addEventListener('click', chooseProject));
  shell.querySelector('[data-desktop-close]').addEventListener('click', closeDesktopCenter);
  shell.querySelector('[data-desktop-layout-reset]').addEventListener('click', resetLayout);
  shell.querySelectorAll('[data-desktop-tray]').forEach(button => button.addEventListener('click', () => api.hideToTray()));
  shell.querySelector('[data-desktop-new-file]').addEventListener('click', () => void createEntry('file'));
  shell.querySelector('[data-desktop-new-folder]').addEventListener('click', () => void createEntry('directory'));
  shell.querySelector('[data-desktop-collapse]').addEventListener('click', () => {
    state.expandedFolders.clear();
    renderTree();
  });
  shell.querySelector('[data-desktop-refresh]').addEventListener('click', refreshProject);
  shell.querySelector('[data-desktop-save]').addEventListener('click', saveAll);
  editorTheme.addEventListener('change', () => monacoController?.setTheme(editorTheme.value));
  shell.querySelector('[data-import-editor-theme]').addEventListener('click', () => editorThemeFile.click());
  shell.querySelector('[data-import-editor-snippets]').addEventListener('click', () => editorSnippetsFile.click());
  shell.querySelector('[data-editor-extensions]').addEventListener('click', () => {
    renderExtensions();
    setExtensionTab('marketplace');
    extensionDialog.showModal();
    requestAnimationFrame(() => extensionQuery.focus());
  });
  shell.querySelector('[data-extension-close]').addEventListener('click', () => extensionDialog.close());
  shell.querySelector('[data-extension-install]').addEventListener('click', () => void installVsixExtension());
  shell.querySelectorAll('[data-extension-tab]').forEach(button => button.addEventListener('click', () => setExtensionTab(button.dataset.extensionTab)));
  extensionSearchForm.addEventListener('submit', event => {
    event.preventDefault();
    void searchExtensionMarketplace();
  });
  editorThemeFile.addEventListener('change', () => {
    const file = editorThemeFile.files?.[0];
    if (file) void importEditorTheme(file);
    editorThemeFile.value = '';
  });
  editorSnippetsFile.addEventListener('change', () => {
    const file = editorSnippetsFile.files?.[0];
    if (file) void importEditorSnippets(file);
    editorSnippetsFile.value = '';
  });
  shell.querySelector('[data-editor-split-toggle]').addEventListener('click', async () => {
    if (state.layout.splitEditor) {
      await saveSplitNow();
      state.layout.splitEditor = false;
      state.splitFile = '';
      state.splitDirty = false;
      monacoController?.setSplit(false);
      editorSurface.classList.remove('is-split-horizontal');
    } else {
      state.layout.splitEditor = true;
      state.splitDirection = 'vertical';
      state.splitFile = state.currentFile;
    }
    applyLayout();
    saveLayout();
    renderFileTabs();
  });
  splitDirectionSelect.addEventListener('change', () => {
    state.splitDirection = splitDirectionSelect.value;
    state.layout.splitDirection = state.splitDirection;
    monacoController?.setSplitDirection(state.splitDirection);
    saveLayout();
    scheduleEditorLayout();
  });
  splitFileSelect.addEventListener('change', async () => {
    const filePath = splitFileSelect.value;
    if (!filePath || !state.project) return;
    await saveSplitNow();
    const result = await api.readFile(state.project.root, filePath).catch(() => null);
    if (!result || !monacoController?.openSplitFile(filePath, result.content)) return;
    state.splitFile = filePath;
    state.splitDirty = false;
    renderFileTabs();
  });
  previewViewport.addEventListener('change', applyPreviewViewport);
  try {
    previewViewport.value = localStorage.getItem('wdgd_preview_viewport_v1') || 'desktop';
  } catch {}
  applyPreviewViewport();
  shell.querySelector('[data-desktop-ai-context]').addEventListener('click', () => void attachCurrentFileToAi());
  shell.querySelector('[data-external-keep]').addEventListener('click', () => {
    hideExternalChange();
    void saveNow();
  });
  shell.querySelector('[data-external-reload]').addEventListener('click', () => {
    void reloadCurrentFile();
  });
  shell.querySelector('[data-desktop-reveal]').addEventListener('click', () => {
    if (state.project) void withStatus(() => api.revealFile(state.project.root, state.currentFile || '.'));
  });
  shell.querySelector('[data-desktop-preview]').addEventListener('click', startPreview);
  shell.querySelector('[data-desktop-preview-refresh]').addEventListener('click', () => {
    if (state.preview) refreshPreview();
    else void startPreview();
  });
  editor.addEventListener('keydown', event => {
    if (editorAutocomplete?.handleKeydown(event)) return;
    window.WebDevGymCodeEditor?.handleKeydown(editor, event, { fileName: state.currentFile });
  });
  editor.addEventListener('input', scheduleSave);
  fileTabs.addEventListener('click', event => {
    const openSide = event.target.closest('[data-desktop-open-side]');
    if (openSide) {
      event.stopPropagation();
      void openFileToSide(openSide.dataset.desktopOpenSide);
      return;
    }
    const close = event.target.closest('[data-desktop-close-file]');
    if (close) {
      event.stopPropagation();
      void closeFileTab(close.dataset.desktopCloseFile);
      return;
    }
    const tab = event.target.closest('[data-desktop-open-file]');
    if (tab) void openFile(tab.dataset.desktopOpenFile);
  });
  fileTabs.addEventListener('auxclick', event => {
    if (event.button !== 1) return;
    const tab = event.target.closest('[data-desktop-open-file]');
    if (tab) void closeFileTab(tab.dataset.desktopOpenFile);
  });
  fileTabs.addEventListener('dragstart', event => {
    const tab = event.target.closest('[data-desktop-open-file]');
    if (!tab) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', tab.dataset.desktopOpenFile);
  });
  fileTabs.addEventListener('dragover', event => {
    if (event.target.closest('[data-desktop-open-file]')) event.preventDefault();
  });
  fileTabs.addEventListener('drop', event => {
    const target = event.target.closest('[data-desktop-open-file]');
    const sourcePath = event.dataTransfer.getData('text/plain');
    if (!target || !state.openFiles.includes(sourcePath)) return;
    event.preventDefault();
    const next = state.openFiles.filter(path => path !== sourcePath);
    next.splice(next.indexOf(target.dataset.desktopOpenFile), 0, sourcePath);
    state.openFiles = next;
    renderFileTabs();
  });
  shell.querySelector('[data-desktop-sidebar-toggle]').addEventListener('click', () => toggleLayoutPart('sidebarCollapsed'));
  shell.querySelector('[data-desktop-explorer-toggle]').addEventListener('click', () => toggleLayoutPart('explorerCollapsed'));
  shell.querySelector('[data-desktop-preview-toggle]').addEventListener('click', () => toggleLayoutPart('previewCollapsed'));
  shell.querySelector('[data-project-search-form]').addEventListener('submit', runProjectSearch);
  shell.querySelector('[data-search-case]').addEventListener('click', event => {
    state.searchCaseSensitive = !state.searchCaseSensitive;
    event.currentTarget.classList.toggle('active', state.searchCaseSensitive);
    event.currentTarget.setAttribute('aria-pressed', String(state.searchCaseSensitive));
    if (searchInput.value.trim()) void runProjectSearch();
  });
  shell.querySelector('[data-desktop-command-form]').addEventListener('submit', event => {
    event.preventDefault();
    const input = shell.querySelector('[data-desktop-command]');
    const command = input.value.trim();
    if (!command) return;
    void runCommand(command);
    input.value = '';
  });
  shell.querySelector('[data-desktop-stop]').addEventListener('click', stopProcess);
  shell.querySelector('[data-desktop-clear]').addEventListener('click', () => terminal.replaceChildren());
  shell.querySelector('[data-package-install-form]').addEventListener('submit', event => {
    event.preventDefault();
    void runPackageOperation('install');
  });
  shell.querySelector('[data-packages-refresh]').addEventListener('click', () => void loadPackages(false));
  shell.querySelector('[data-packages-updates]').addEventListener('click', () => void loadPackages(true));
  shell.querySelector('[data-package-stop]').addEventListener('click', stopProcess);
  packageSearch.addEventListener('input', () => {
    state.packageQuery = packageSearch.value;
    renderPackages();
  });
  shell.querySelector('[data-runner-open-url]').addEventListener('click', () => {
    if (state.processUrl) void api.openExternal(state.processUrl);
  });
  shell.querySelector('[data-git-status]').addEventListener('click', refreshGitChanges);
  shell.querySelector('[data-git-history]').addEventListener('click', () => showGit('history'));
  shell.querySelector('[data-git-push]').addEventListener('click', pushGit);
  shell.querySelector('[data-git-commit-form]').addEventListener('submit', async event => {
    event.preventDefault();
    const input = shell.querySelector('[data-git-message]');
    if (!input.value.trim()) return;
    if (await commitGit(input.value.trim())) input.value = '';
  });
  docsSearch.addEventListener('input', () => {
    state.docsQuery = docsSearch.value;
    state.docsSelectedId = '';
    renderOfflineDocs();
  });
  shell.querySelector('[data-backup-create]').addEventListener('click', createBackup);
  shell.querySelector('[data-backup-refresh]').addEventListener('click', renderBackups);
  shell.querySelector('[data-app-update]').addEventListener('click', checkUpdate);
  shell.querySelector('[data-app-notify]').addEventListener('click', () => api.notify('WebDevGym', copy.ready));
  shell.querySelector('[data-app-quit]').addEventListener('click', () => api.quit());
  api.onProcessOutput(payload => {
    if (!state.processId && state.processStatus === 'starting') state.processId = payload.id;
    if (payload.id !== state.processId) return;
    const outputKind = payload.stream === 'stderr' ? 'stderr' : payload.stream === 'exit' ? 'success' : '';
    if (state.processContext === 'packages') appendPackageOutput(payload.text, outputKind);
    else appendTerminal(payload.text, outputKind);
    if (payload.stream === 'exit') {
      const completedContext = state.processContext;
      state.lastFinishedProcessId = payload.id;
      state.processId = '';
      state.processPid = 0;
      state.processStatus = state.stopRequested ? 'stopped' : payload.code === 0 ? 'success' : 'failed';
      state.stopRequested = false;
      updateRunnerUi();
      if (completedContext === 'packages') {
        void refreshProject().then(() => loadPackages(false));
        if (payload.code === 0) setStatus(copy.dependencyOperationDone, 'ok');
      }
    }
  });
  api.onUpdateProgress?.(payload => {
    const percent = Number.isFinite(payload?.percent) ? payload.percent : 0;
    setStatus(`${copy.downloadingUpdate}: ${percent}%`, 'ok');
  });
  api.onOpenRequest(request => {
    void openLaunchRequest(request);
  });
  api.onProjectChanged(payload => {
    void handleProjectChanges(payload);
  });
  api.onProjectWatchError(payload => {
    if (payload.root !== state.project?.root) return;
    state.watchedRoot = '';
    setStatus(`${copy.watchError}: ${payload.message || ''}`, 'error');
  });
  document.addEventListener('keydown', event => {
    const command = event.ctrlKey || event.metaKey;
    if (command && !shell.hidden && state.activeView === 'projects' && event.key === 'Tab') {
      if (state.openFiles.length > 1) {
        event.preventDefault();
        const direction = event.shiftKey ? -1 : 1;
        const index = state.openFiles.indexOf(state.currentFile);
        void openFile(state.openFiles[(index + direction + state.openFiles.length) % state.openFiles.length]);
      }
      return;
    }
    if (command && !shell.hidden && state.activeView === 'projects' && event.key.toLowerCase() === 'w') {
      if (state.currentFile) {
        event.preventDefault();
        void closeFileTab(state.currentFile);
      }
      return;
    }
    if (command && event.shiftKey && !shell.hidden && state.activeView === 'projects' && event.key.toLowerCase() === 't') {
      event.preventDefault();
      void reopenLastClosedFile();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !shell.hidden && state.activeView === 'docs') {
      event.preventDefault();
      event.stopImmediatePropagation();
      docsSearch.select();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
      switchView('search');
      searchInput.select();
      return;
    }
    if (event.key === 'Escape' && !shell.hidden) closeDesktopCenter();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !shell.hidden) {
      event.preventDefault();
      void saveAll();
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (!launcher.isConnected) mountLauncher();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(mountLauncher, 0);
  window.setTimeout(mountLauncher, 1200);
  bindSplitter('sidebar');
  bindSplitter('explorer');
  bindSplitter('preview');
  renderEditorThemeOptions();
  applyLayout();
  let layoutResizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(layoutResizeFrame);
    layoutResizeFrame = requestAnimationFrame(applyLayout);
  });
  monitorTimer();

  Promise.all([api.recentProjects(), api.appInfo()]).then(([recents, appInfo]) => {
    state.recents = Array.isArray(recents) ? recents : [];
    state.appInfo = appInfo;
    renderRecents();
    shell.querySelector('[data-app-version]').textContent = `${copy.version} ${appInfo.version} · ${appInfo.platform} · ${appInfo.shortcut}`;
  }).catch(error => setStatus(errorMessage(error), 'error'));
  api.consumeOpenRequest()
    .then(request => openLaunchRequest(request))
    .catch(error => setStatus(errorMessage(error), 'error'));
})();
