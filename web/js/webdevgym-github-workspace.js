(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  if (!runtime) return;

  const { L, icon, escapeHtml: esc, readJson, writeJson, notify } = runtime;
  const HISTORY_KEY = 'wdg_github_workspace_history_v1';
  const DRAFT_KEY = 'wdg_github_workspace_draft_v1';
  const VAULT_KEY = 'wdg_github_token_vault_v1';
  const MAX_HISTORY = 8;

  const copy = {
    eyebrow: L('GitHub workspace', 'Рабочее пространство GitHub'),
    title: 'GitHub Workspace',
    subtitle: L('From the first file to a published website.', 'От первого файла до опубликованного сайта.'),
    connected: L('Connected', 'Подключено'),
    savedToken: L('Token saved', 'Токен сохранён'),
    needsAccess: L('Connect GitHub', 'Подключи GitHub'),
    username: L('Username', 'Пользователь'),
    repository: L('Repository', 'Репозиторий'),
    branch: L('Branch', 'Ветка'),
    filesStep: L('Files', 'Файлы'),
    commitStep: L('Commit', 'Коммит'),
    publishStep: L('Publication', 'Публикация'),
    uploadTitle: L('Prepare a commit', 'Подготовка коммита'),
    uploadSubtitle: L('Select files or project folders, then send them in one commit.', 'Выбери файлы или папки проекта и отправь их одним коммитом.'),
    dropTitle: L('Drop files here', 'Перетащи файлы сюда'),
    folderTitle: L('Choose project folders', 'Выбери папки проекта'),
    dropHint: L('Click or drop up to 10 files', 'Нажми или перетащи до 10 файлов'),
    folderHint: L('Click to add up to 10 folders', 'Нажми, чтобы добавить до 10 папок'),
    folderDropWarning: L('Use the folder picker so the browser preserves the folder structure.', 'Для сохранения структуры выбери папку через проводник.'),
    accessTitle: L('GitHub access', 'Доступ к GitHub'),
    accessHint: L('The token is encrypted locally and never enters drafts or history.', 'Токен шифруется локально и не попадает в черновики или историю.'),
    path: L('Destination folder', 'Папка назначения'),
    message: L('Commit message', 'Сообщение коммита'),
    saveDraft: L('Save draft', 'Сохранить черновик'),
    draftSaved: L('Draft saved locally', 'Черновик сохранён локально'),
    push: L('Send to GitHub', 'Отправить на GitHub'),
    pagesReady: L('Ready to publish', 'Готово к публикации'),
    pagesPublished: L('Website published', 'Сайт опубликован'),
    pagesHint: L('GitHub Pages will build a public website from the selected branch.', 'GitHub Pages соберёт публичный сайт из выбранной ветки.'),
    source: L('Source', 'Источник'),
    lastDeploy: L('Last publication', 'Последняя публикация'),
    noDeploy: L('Not published yet', 'Публикаций пока нет'),
    openSite: L('Open website', 'Открыть сайт'),
    publishAgain: L('Publish again', 'Опубликовать снова'),
    timelineUpload: L('Files uploaded', 'Файлы загружены'),
    timelineCommit: L('Commit sent', 'Коммит отправлен'),
    timelinePages: L('Website published', 'Сайт опубликован'),
    createTitle: L('Need a new repository?', 'Нужен новый репозиторий?'),
    createText: L('Create it without leaving WebDevGym.', 'Создай его, не выходя из WebDevGym.'),
    createAction: L('Create repository', 'Создать репозиторий'),
    closeAction: L('Collapse', 'Свернуть'),
    historyTitle: L('Recent activity', 'Последние действия'),
    historyAll: L('Stored locally in this browser', 'Хранится локально в этом браузере'),
    historyEmpty: L('Uploads, drafts and publications will appear here.', 'Загрузки, черновики и публикации появятся здесь.'),
    uploadDone: L('Files uploaded to repository', 'Файлы загружены в репозиторий'),
    pagesDone: L('GitHub Pages published', 'GitHub Pages опубликован'),
    repoDone: L('Repository created', 'Репозиторий создан'),
    success: L('Success', 'Успешно'),
    saved: L('Saved', 'Сохранено'),
    draft: L('Draft', 'Черновик'),
    now: L('just now', 'только что'),
    unknownRepo: L('Select a repository', 'Выбери репозиторий')
  };

  let section;
  let uploadBlock;
  let createBlock;
  let pagesPanel;
  let contextStatus;
  let dropzone;
  let pagesHero;
  let historyElement;
  let createObserver;

  function getHistory() {
    const history = readJson(HISTORY_KEY, []);
    return Array.isArray(history) ? history.slice(0, MAX_HISTORY) : [];
  }

  function saveHistory(history) {
    writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));
  }

  function addHistory(type, title, detail, status) {
    const history = getHistory();
    history.unshift({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      type,
      title,
      detail: detail || '',
      status: status || 'success',
      createdAt: Date.now()
    });
    saveHistory(history);
    renderHistory();
    updatePagesRail();
  }

  function fieldValue(id, fallback) {
    return document.getElementById(id)?.value.trim() || fallback || '';
  }

  function contextValues() {
    return {
      username: fieldValue('gh-username'),
      repo: fieldValue('gh-repo'),
      branch: fieldValue('gh-branch', 'main'),
      token: fieldValue('gh-token'),
      path: fieldValue('gh-filepath'),
      message: fieldValue('gh-message'),
      folderBase: fieldValue('gh-folder-base')
    };
  }

  function hasSavedToken() {
    try { return Boolean(localStorage.getItem(VAULT_KEY)); }
    catch (error) { return false; }
  }

  function fieldWrapper(id) {
    return document.getElementById(id)?.closest('div') || null;
  }

  function relabel(wrapper, text) {
    if (!wrapper) return;
    wrapper.classList.add('wdg-gh-context-field');
    const label = wrapper.querySelector(':scope > label');
    if (label) label.textContent = text;
  }

  function removeEmptyContainer(element) {
    if (!element || element.closest('.wdg-gh-context-bar')) return;
    if (!element.querySelector('input, select, textarea, button, [data-gh-token-vault]')) element.remove();
  }

  function modeIsFolder() {
    return document.querySelector('[data-gh-upload-mode="folder"]')?.classList.contains('active') || false;
  }

  function updateDropzone() {
    if (!dropzone) return;
    const folderMode = modeIsFolder();
    dropzone.querySelector('[data-gh-drop-title]').textContent = folderMode ? copy.folderTitle : copy.dropTitle;
    dropzone.querySelector('[data-gh-drop-hint]').textContent = folderMode ? copy.folderHint : copy.dropHint;
    dropzone.dataset.mode = folderMode ? 'folder' : 'file';
    const pushButton = uploadBlock?.querySelector('button[onclick="githubUpload()"]');
    if (pushButton) pushButton.innerHTML = icon('tabler:upload', 17) + copy.push;
  }

  function syncContext() {
    const values = contextValues();
    const saved = hasSavedToken();
    const connected = Boolean(values.username && values.repo && (values.token || saved));
    if (contextStatus) {
      contextStatus.classList.toggle('ready', connected);
      contextStatus.querySelector('[data-gh-connection-text]').textContent = connected
        ? (values.token ? copy.connected : copy.savedToken)
        : copy.needsAccess;
    }
    const repoName = document.querySelector('[data-gh-workspace-repo]');
    if (repoName) repoName.textContent = values.repo || copy.unknownRepo;
    const account = document.querySelector('[data-gh-workspace-account]');
    if (account) account.textContent = values.username || 'GitHub';
    const branch = document.querySelector('[data-gh-workspace-branch]');
    if (branch) branch.textContent = values.branch || 'main';
    updatePagesRail();
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return copy.now;
    return new Intl.DateTimeFormat(document.documentElement.lang || 'ru', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  function historyIcon(type) {
    if (type === 'pages') return 'tabler:world-upload';
    if (type === 'draft') return 'tabler:device-floppy';
    if (type === 'repo') return 'tabler:brand-github';
    return 'tabler:cloud-upload';
  }

  function renderHistory() {
    if (!historyElement) return;
    const history = getHistory();
    const list = historyElement.querySelector('[data-gh-history-list]');
    if (!history.length) {
      list.innerHTML = '<div class="wdg-gh-history-empty">' + icon('tabler:history', 20) + '<span>' + esc(copy.historyEmpty) + '</span></div>';
      return;
    }
    list.innerHTML = history.map(item => {
      const badge = item.status === 'saved' ? copy.saved : copy.success;
      return '<article class="wdg-gh-history-row">' +
        '<span class="wdg-gh-history-icon">' + icon(historyIcon(item.type), 18) + '</span>' +
        '<div><strong>' + esc(item.title) + '</strong><span>' + esc(item.detail) + '</span></div>' +
        '<time datetime="' + new Date(item.createdAt).toISOString() + '">' + esc(formatDate(item.createdAt)) + '</time>' +
        '<span class="wdg-gh-history-badge ' + (item.status === 'saved' ? 'saved' : '') + '">' + esc(badge) + '</span>' +
      '</article>';
    }).join('');
  }

  function latestHistory(type) {
    return getHistory().find(item => item.type === type) || null;
  }

  function pagesUrl(values) {
    if (!values.username || !values.repo) return '';
    const username = values.username.toLowerCase();
    const repository = values.repo.replace(/\.git$/i, '');
    if (repository.toLowerCase() === username + '.github.io') {
      return 'https://' + username + '.github.io/';
    }
    return 'https://' + username + '.github.io/' + repository + '/';
  }

  function updatePagesRail() {
    if (!pagesPanel || !pagesHero) return;
    const values = contextValues();
    const published = latestHistory('pages');
    const uploaded = latestHistory('upload');
    const url = published?.detail || pagesUrl(values);
    const isPublished = Boolean(published);
    const activeUrl = isPublished ? url : '';
    pagesHero.classList.toggle('published', isPublished);
    pagesHero.querySelector('[data-pages-hero-title]').textContent = isPublished ? copy.pagesPublished : copy.pagesReady;
    const link = pagesHero.querySelector('[data-pages-preview-link]');
    link.textContent = url || copy.noDeploy;
    link.href = activeUrl || '#';
    link.toggleAttribute('aria-disabled', !activeUrl);
    const source = pagesHero.querySelector('[data-pages-source-value]');
    const path = pagesPanel.querySelector('[data-pages-path]')?.value || '/';
    source.textContent = (values.branch || 'main') + ' / ' + (path === '/' ? 'root' : path.replace(/^\//, ''));
    pagesHero.querySelector('[data-pages-last-value]').textContent = published ? formatDate(published.createdAt) : copy.noDeploy;
    pagesHero.querySelector('[data-pages-open]').disabled = !activeUrl;
    const uploadStep = pagesHero.querySelector('[data-pages-timeline="upload"]');
    const commitStep = pagesHero.querySelector('[data-pages-timeline="commit"]');
    const pagesStep = pagesHero.querySelector('[data-pages-timeline="pages"]');
    uploadStep.classList.toggle('done', Boolean(uploaded));
    commitStep.classList.toggle('done', Boolean(uploaded));
    pagesStep.classList.toggle('done', isPublished);
    const fileFlow = section?.querySelector('[data-gh-flow-step="files"]');
    const commitFlow = section?.querySelector('[data-gh-flow-step="commit"]');
    const publishFlow = section?.querySelector('[data-gh-flow-step="publish"]');
    fileFlow?.classList.toggle('done', Boolean(uploaded));
    fileFlow?.classList.toggle('active', !uploaded);
    commitFlow?.classList.toggle('done', Boolean(uploaded));
    commitFlow?.classList.remove('active');
    publishFlow?.classList.toggle('active', Boolean(uploaded) && !isPublished);
    publishFlow?.classList.toggle('done', isPublished);
  }

  function restoreDraft() {
    const draft = readJson(DRAFT_KEY, null);
    if (!draft || typeof draft !== 'object') return;
    Object.entries({
      'gh-username': draft.username,
      'gh-repo': draft.repo,
      'gh-branch': draft.branch,
      'gh-filepath': draft.path,
      'gh-message': draft.message,
      'gh-folder-base': draft.folderBase
    }).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input && !input.value && value) input.value = value;
    });
  }

  function saveDraft() {
    const values = contextValues();
    writeJson(DRAFT_KEY, {
      username: values.username,
      repo: values.repo,
      branch: values.branch,
      path: values.path,
      message: values.message,
      folderBase: values.folderBase,
      savedAt: Date.now()
    });
    const detail = [values.username, values.repo].filter(Boolean).join(' / ') || copy.draft;
    addHistory('draft', copy.draftSaved, detail, 'saved');
    notify(copy.draftSaved);
  }

  function buildHeader() {
    const header = document.createElement('header');
    header.className = 'wdg-gh-workspace-header';
    header.innerHTML =
      '<div class="wdg-gh-workspace-mark">' + icon('tabler:brand-github', 30) + '</div>' +
      '<div class="wdg-gh-workspace-copy"><span>' + esc(copy.eyebrow) + '</span><h2>' + esc(copy.title) + '</h2><p>' + esc(copy.subtitle) + '</p></div>' +
      '<div class="wdg-gh-workspace-summary"><strong data-gh-workspace-account>GitHub</strong><span>/</span><strong data-gh-workspace-repo>' + esc(copy.unknownRepo) + '</strong><span>/</span><strong data-gh-workspace-branch>main</strong></div>';
    return header;
  }

  function buildContextBar() {
    const bar = document.createElement('div');
    bar.className = 'wdg-gh-context-bar';
    bar.innerHTML = '<div class="wdg-gh-context-fields"></div><div class="wdg-gh-connection"><i></i><span data-gh-connection-text>' + esc(copy.needsAccess) + '</span></div>';
    contextStatus = bar.querySelector('.wdg-gh-connection');
    const fields = bar.querySelector('.wdg-gh-context-fields');
    const wrappers = [
      [fieldWrapper('gh-username'), copy.username],
      [fieldWrapper('gh-repo'), copy.repository],
      [fieldWrapper('gh-branch'), copy.branch]
    ];
    const parents = wrappers.map(([wrapper]) => wrapper?.parentElement).filter(Boolean);
    wrappers.forEach(([wrapper, label]) => {
      if (!wrapper) return;
      relabel(wrapper, label);
      fields.appendChild(wrapper);
    });
    parents.forEach(removeEmptyContainer);
    return bar;
  }

  function buildFlow() {
    const flow = document.createElement('div');
    flow.className = 'wdg-gh-flow';
    flow.innerHTML = [
      ['files', 'tabler:files', copy.filesStep],
      ['commit', 'tabler:git-commit', copy.commitStep],
      ['publish', 'tabler:world-upload', copy.publishStep]
    ].map((step, index) =>
      '<div class="wdg-gh-flow-step ' + (index === 0 ? 'active' : '') + '" data-gh-flow-step="' + step[0] + '">' +
        '<span>' + icon(step[1], 16) + '</span><strong>' + (index + 1) + '. ' + esc(step[2]) + '</strong>' +
      '</div>'
    ).join('<i></i>');
    return flow;
  }

  function prepareUploadBlock() {
    uploadBlock.classList.add('wdg-gh-upload-workspace');
    const form = Array.from(uploadBlock.children).find(child => child.querySelector?.('#gh-token'));
    if (!form) return false;
    form.classList.add('wdg-gh-upload-form');

    const heading = document.createElement('div');
    heading.className = 'wdg-gh-panel-heading';
    heading.innerHTML = '<div><span>' + icon('tabler:git-commit', 18) + '</span><div><h3>' + esc(copy.uploadTitle) + '</h3><p>' + esc(copy.uploadSubtitle) + '</p></div></div>';
    form.insertAdjacentElement('afterbegin', heading);

    dropzone = document.createElement('button');
    dropzone.type = 'button';
    dropzone.className = 'wdg-gh-dropzone';
    dropzone.innerHTML = '<span class="wdg-gh-dropzone-icon">' + icon('tabler:folder-up', 30) + '</span><strong data-gh-drop-title>' + esc(copy.dropTitle) + '</strong><span data-gh-drop-hint>' + esc(copy.dropHint) + '</span>';
    const mode = form.querySelector('.wdg-gh-mode');
    form.insertBefore(dropzone, mode || form.firstChild.nextSibling);

    const pathWrap = fieldWrapper('gh-filepath');
    const messageWrap = fieldWrapper('gh-message');
    const oldPathParent = pathWrap?.parentElement;
    const commitFields = document.createElement('div');
    commitFields.className = 'wdg-gh-commit-fields';
    relabel(pathWrap, copy.path);
    relabel(messageWrap, copy.message);
    if (pathWrap) commitFields.appendChild(pathWrap);
    if (messageWrap) commitFields.appendChild(messageWrap);
    form.appendChild(commitFields);
    removeEmptyContainer(oldPathParent);

    const tokenWrap = fieldWrapper('gh-token');
    if (tokenWrap) {
      tokenWrap.classList.add('wdg-gh-token-field');
      const security = document.createElement('details');
      security.className = 'wdg-gh-security';
      security.innerHTML = '<summary><span>' + icon('tabler:shield-lock', 18) + '</span><div><strong>' + esc(copy.accessTitle) + '</strong><small>' + esc(copy.accessHint) + '</small></div>' + icon('tabler:chevron-down', 17) + '</summary>';
      security.appendChild(tokenWrap);
      form.appendChild(security);
    }

    const pushButton = uploadBlock.querySelector('button[onclick="githubUpload()"]');
    if (pushButton) {
      pushButton.classList.add('wdg-gh-push-button');
      const actions = document.createElement('div');
      actions.className = 'wdg-gh-commit-actions';
      const draft = document.createElement('button');
      draft.type = 'button';
      draft.className = 'wdg-gh-draft-button';
      draft.innerHTML = icon('tabler:device-floppy', 17) + copy.saveDraft;
      draft.addEventListener('click', saveDraft);
      pushButton.parentElement.insertBefore(actions, pushButton);
      actions.append(draft, pushButton);
    }

    const actions = form.querySelector('.wdg-gh-commit-actions');
    const status = document.getElementById('gh-status');
    form.append(commitFields);
    const security = form.querySelector('.wdg-gh-security');
    if (security) form.append(security);
    if (actions) form.append(actions);
    if (status) form.append(status);

    dropzone.addEventListener('click', () => {
      const target = document.getElementById(modeIsFolder() ? 'gh-folder-input' : 'gh-file-input');
      target?.click();
    });
    dropzone.addEventListener('dragover', event => {
      event.preventDefault();
      dropzone.classList.add('dragging');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
    dropzone.addEventListener('drop', event => {
      event.preventDefault();
      dropzone.classList.remove('dragging');
      if (modeIsFolder()) return void notify(copy.folderDropWarning);
      const input = document.getElementById('gh-file-input');
      if (!input || !event.dataTransfer?.files?.length) return;
      const transfer = new DataTransfer();
      Array.from(event.dataTransfer.files).slice(0, 10).forEach(file => transfer.items.add(file));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    form.querySelector('.wdg-gh-mode')?.addEventListener('click', () => setTimeout(updateDropzone, 0));
    document.getElementById('gh-file-input')?.addEventListener('change', updateDropzone);
    document.getElementById('gh-folder-input')?.addEventListener('change', updateDropzone);
    updateDropzone();
    return true;
  }

  function preparePagesPanel() {
    pagesPanel.classList.add('wdg-gh-pages-rail');
    pagesHero = document.createElement('div');
    pagesHero.className = 'wdg-gh-pages-hero';
    pagesHero.innerHTML =
      '<div class="wdg-gh-pages-check">' + icon('tabler:check', 34) + '</div>' +
      '<h3 data-pages-hero-title>' + esc(copy.pagesReady) + '</h3>' +
      '<p>' + esc(copy.pagesHint) + '</p>' +
      '<a data-pages-preview-link href="#" target="_blank" rel="noopener">' + esc(copy.noDeploy) + '</a>' +
      '<dl><div><dt>' + icon('tabler:calendar-time', 16) + copy.lastDeploy + '</dt><dd data-pages-last-value>' + esc(copy.noDeploy) + '</dd></div>' +
      '<div><dt>' + icon('tabler:git-branch', 16) + copy.source + '</dt><dd data-pages-source-value>main / root</dd></div></dl>' +
      '<button type="button" data-pages-open>' + icon('tabler:external-link', 17) + copy.openSite + '</button>' +
      '<div class="wdg-gh-pages-timeline">' +
        '<div data-pages-timeline="upload"><i></i><span>' + esc(copy.timelineUpload) + '</span></div>' +
        '<div data-pages-timeline="commit"><i></i><span>' + esc(copy.timelineCommit) + '</span></div>' +
        '<div data-pages-timeline="pages"><i></i><span>' + esc(copy.timelinePages) + '</span></div>' +
      '</div>';
    pagesPanel.insertAdjacentElement('afterbegin', pagesHero);
    pagesHero.querySelector('[data-pages-open]').addEventListener('click', () => {
      const link = pagesHero.querySelector('[data-pages-preview-link]');
      if (link.href && link.getAttribute('aria-disabled') !== 'true') window.open(link.href, '_blank', 'noopener');
    });
    pagesPanel.querySelector('[data-pages-path]')?.addEventListener('change', updatePagesRail);
    const publish = pagesPanel.querySelector('[data-pages-publish]');
    if (publish) publish.innerHTML = icon('tabler:refresh', 17) + copy.publishAgain;
    updatePagesRail();
  }

  function prepareCreateBlock() {
    createBlock.classList.add('wdg-gh-create-panel');
    const form = Array.from(createBlock.children).find(child => child.querySelector?.('#ghc-token'));
    if (form) form.classList.add('wdg-gh-create-form');
    const summary = document.createElement('div');
    summary.className = 'wdg-gh-create-summary';
    summary.innerHTML = '<span>' + icon('tabler:brand-github', 22) + '</span><div><strong>' + esc(copy.createTitle) + '</strong><small>' + esc(copy.createText) + '</small></div><button type="button" aria-expanded="false">' + icon('tabler:plus', 17) + copy.createAction + '</button>';
    createBlock.insertBefore(summary, form || createBlock.firstChild);
    const toggle = summary.querySelector('button');
    toggle.addEventListener('click', () => {
      const open = createBlock.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = icon(open ? 'tabler:chevron-up' : 'tabler:plus', 17) + (open ? copy.closeAction : copy.createAction);
    });

    const status = document.getElementById('ghc-status');
    if (status) {
      let lastMessage = '';
      createObserver = new MutationObserver(() => {
        const text = status.textContent.trim();
        if (!text || text === lastMessage) return;
        lastMessage = text;
        syncContext();
        if (/success|успеш/i.test(text)) {
          const values = contextValues();
          addHistory('repo', copy.repoDone, [values.username, values.repo].filter(Boolean).join(' / '));
        }
      });
      createObserver.observe(status, { childList: true, subtree: true, characterData: true, attributes: true });
    }
  }

  function buildHistory() {
    historyElement = document.createElement('section');
    historyElement.className = 'wdg-gh-history';
    historyElement.innerHTML = '<header><div><h3>' + esc(copy.historyTitle) + '</h3><p>' + esc(copy.historyAll) + '</p></div>' + icon('tabler:history', 19) + '</header><div data-gh-history-list></div>';
    renderHistory();
    return historyElement;
  }

  function installListeners() {
    ['gh-username', 'gh-repo', 'gh-branch', 'gh-token', 'gh-filepath', 'gh-message'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', syncContext);
    });
    document.addEventListener('webdevgym:github-uploaded', event => {
      const detail = event.detail || {};
      addHistory('upload', copy.uploadDone, (detail.repo || '') + (detail.files ? ' · ' + detail.files : ''));
      section.querySelector('[data-gh-flow-step="files"]')?.classList.add('done');
      section.querySelector('[data-gh-flow-step="commit"]')?.classList.add('done');
    });
    document.addEventListener('webdevgym:pages-published', event => {
      addHistory('pages', copy.pagesDone, event.detail?.url || 'GitHub Pages');
    });
    window.addEventListener('storage', event => {
      if (event.key === VAULT_KEY || event.key === HISTORY_KEY) syncContext();
    });
  }

  function buildWorkspace() {
    section = document.getElementById('sec-github');
    uploadBlock = document.getElementById('block-git-github-upload');
    createBlock = document.getElementById('block-git-github-create');
    pagesPanel = document.getElementById('wdgsGithubPages');
    if (!section || !uploadBlock || !createBlock || !pagesPanel) return false;
    if (section.dataset.githubWorkspaceReady === '1') return true;
    if (uploadBlock.dataset.folderUploadReady !== '1' || !document.getElementById('gh-token')?.dataset.ghVaultReady) return false;

    section.dataset.githubWorkspaceReady = '1';
    section.classList.add('wdg-gh-workspace-ready');
    section.insertBefore(uploadBlock, createBlock);
    section.insertBefore(pagesPanel, createBlock);

    const header = buildHeader();
    section.insertBefore(header, uploadBlock);
    const context = buildContextBar();
    section.insertBefore(context, uploadBlock);
    const flow = buildFlow();
    section.insertBefore(flow, uploadBlock);

    prepareUploadBlock();
    preparePagesPanel();
    prepareCreateBlock();
    const history = buildHistory();
    createBlock.insertAdjacentElement('afterend', history);
    restoreDraft();
    installListeners();
    syncContext();
    setTimeout(syncContext, 350);
    setTimeout(syncContext, 1200);
    return true;
  }

  function init() {
    if (buildWorkspace()) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (buildWorkspace() || attempts > 100) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
