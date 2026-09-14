(function () {
  'use strict';

  const STORAGE_KEY = 'wdg_notebook_v1';
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname);
  const t = isEnglish ? {
    nav: 'Notepad', title: 'Notepad', subtitle: 'Local notes with tabs and automatic saving.',
    untitled: 'Untitled', newTab: 'New tab', openFile: 'Open .txt', download: 'Download',
    search: 'Find in note', deleteNote: 'Delete note', noteTitle: 'Note title',
    placeholder: 'Start typing...', saved: 'Saved locally', saving: 'Saving...', failed: 'Could not save',
    emptySearch: 'No matches', lines: 'lines', words: 'words', chars: 'characters',
    closeTab: 'Close tab', rename: 'Rename note', imported: 'Text file opened', confirmDelete: 'Delete this note?'
  } : {
    nav: 'Блокнот', title: 'Блокнот', subtitle: 'Локальные заметки с вкладками и автоматическим сохранением.',
    untitled: 'Без названия', newTab: 'Новая вкладка', openFile: 'Открыть .txt', download: 'Скачать',
    search: 'Найти в заметке', deleteNote: 'Удалить заметку', noteTitle: 'Название заметки',
    placeholder: 'Начни писать...', saved: 'Сохранено локально', saving: 'Сохранение...', failed: 'Не удалось сохранить',
    emptySearch: 'Совпадений нет', lines: 'строк', words: 'слов', chars: 'символов',
    closeTab: 'Закрыть вкладку', rename: 'Переименовать заметку', imported: 'Текстовый файл открыт', confirmDelete: 'Удалить эту заметку?'
  };

  let state = loadState();
  let saveTimer = 0;
  let searchIndex = -1;

  function id() {
    return 'note-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function freshNote(title, content) {
    const now = new Date().toISOString();
    return { id:id(), title:title || t.untitled, content:content || '', createdAt:now, updatedAt:now };
  }

  function normalizeNote(note) {
    return {
      id:String(note?.id || id()),
      title:String(note?.title || t.untitled).slice(0, 120),
      content:String(note?.content || ''),
      createdAt:String(note?.createdAt || new Date().toISOString()),
      updatedAt:String(note?.updatedAt || new Date().toISOString())
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      const notes = Array.isArray(parsed?.notes) ? parsed.notes.map(normalizeNote) : [];
      if (!notes.length) notes.push(freshNote());
      const activeId = notes.some(note => note.id === parsed?.activeId) ? parsed.activeId : notes[0].id;
      return { version:1, activeId, notes };
    } catch (_) {
      const note = freshNote();
      return { version:1, activeId:note.id, notes:[note] };
    }
  }

  function activeNote() {
    return state.notes.find(note => note.id === state.activeId) || state.notes[0];
  }

  function storeState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveState('saved');
      document.dispatchEvent(new CustomEvent('webdevgym:notebook-saved', { detail:{ count:state.notes.length } }));
      return true;
    } catch (_) {
      setSaveState('failed');
      return false;
    }
  }

  function scheduleSave() {
    setSaveState('saving');
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(storeState, 280);
  }

  function flushSave() {
    window.clearTimeout(saveTimer);
    storeState();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  }

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function setSaveState(mode) {
    const status = document.querySelector('[data-notebook-save-state]');
    if (!status) return;
    status.dataset.state = mode;
    status.textContent = mode === 'saving' ? t.saving : mode === 'failed' ? t.failed : t.saved;
  }

  function pageMarkup() {
    return '<div class="wdgnb-app">' +
      '<div class="wdgnb-toolbar">' +
        '<button class="wdgnb-command primary" type="button" data-notebook-new>' + icon('tabler:plus',17) + '<span>' + t.newTab + '</span></button>' +
        '<button class="wdgnb-command" type="button" data-notebook-open>' + icon('tabler:folder-open',17) + '<span>' + t.openFile + '</span></button>' +
        '<button class="wdgnb-command" type="button" data-notebook-download>' + icon('tabler:download',17) + '<span>' + t.download + '</span></button>' +
        '<div class="wdgnb-search">' + icon('tabler:search',17) + '<input type="search" data-notebook-search placeholder="' + escapeHtml(t.search) + '"><span data-notebook-search-count></span></div>' +
        '<input type="file" accept="text/plain,.txt,.md,.markdown,.log,.json,.js,.css,.html" data-notebook-file hidden>' +
      '</div>' +
      '<div class="wdgnb-tabs" role="tablist" aria-label="' + escapeHtml(t.title) + '"></div>' +
      '<div class="wdgnb-document">' +
        '<div class="wdgnb-title-row">' +
          '<input class="wdgnb-title" data-notebook-title maxlength="120" aria-label="' + escapeHtml(t.noteTitle) + '">' +
          '<button class="wdgnb-icon danger" type="button" data-notebook-delete title="' + escapeHtml(t.deleteNote) + '">' + icon('tabler:trash',18) + '</button>' +
        '</div>' +
        '<textarea class="wdgnb-editor" data-notebook-editor spellcheck="true" placeholder="' + escapeHtml(t.placeholder) + '"></textarea>' +
        '<footer class="wdgnb-status"><span data-notebook-save-state data-state="saved">' + t.saved + '</span><span data-notebook-stats></span></footer>' +
      '</div>' +
    '</div>';
  }

  function renderPage() {
    const api = window.WebDevGymFeatures;
    if (!api?.pageShell) return null;
    const page = api.pageShell('notebook', t.title, t.subtitle, pageMarkup());
    bindPage(page);
    renderTabs(page);
    renderActive(page, true);
    return page;
  }

  function bindPage(page) {
    page.querySelector('[data-notebook-new]').addEventListener('click', createNote);
    page.querySelector('[data-notebook-open]').addEventListener('click', () => page.querySelector('[data-notebook-file]').click());
    page.querySelector('[data-notebook-file]').addEventListener('change', importTextFile);
    page.querySelector('[data-notebook-download]').addEventListener('click', downloadActive);
    page.querySelector('[data-notebook-delete]').addEventListener('click', () => deleteNote(state.activeId, true));
    page.querySelector('[data-notebook-title]').addEventListener('input', onTitleInput);
    page.querySelector('[data-notebook-title]').addEventListener('blur', flushSave);
    page.querySelector('[data-notebook-editor]').addEventListener('input', onEditorInput);
    page.querySelector('[data-notebook-editor]').addEventListener('blur', flushSave);
    page.querySelector('[data-notebook-search]').addEventListener('input', () => findInNote(page, true));
    page.querySelector('[data-notebook-search]').addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); findInNote(page, false); }
    });
    page.addEventListener('keydown', notebookShortcuts);
  }

  function renderTabs(page) {
    const tabs = page.querySelector('.wdgnb-tabs');
    tabs.innerHTML = state.notes.map(note =>
      '<div class="wdgnb-tab-wrap">' +
        '<button class="wdgnb-tab' + (note.id === state.activeId ? ' active' : '') + '" type="button" role="tab" aria-selected="' + (note.id === state.activeId) + '" data-note-id="' + escapeHtml(note.id) + '" title="' + escapeHtml(note.title) + '">' + icon('tabler:file-text',15) + '<span>' + escapeHtml(note.title || t.untitled) + '</span></button>' +
        '<button class="wdgnb-tab-close" type="button" data-note-close="' + escapeHtml(note.id) + '" title="' + escapeHtml(t.closeTab) + '">' + icon('tabler:x',14) + '</button>' +
      '</div>'
    ).join('') + '<button class="wdgnb-tab-add" type="button" data-notebook-tab-add title="' + escapeHtml(t.newTab) + '">' + icon('tabler:plus',16) + '</button>';
    tabs.querySelectorAll('[data-note-id]').forEach(button => button.addEventListener('click', () => selectNote(button.dataset.noteId)));
    tabs.querySelectorAll('[data-note-close]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      deleteNote(button.dataset.noteClose, true);
    }));
    tabs.querySelector('[data-notebook-tab-add]').addEventListener('click', createNote);
  }

  function renderActive(page, focusEditor) {
    const note = activeNote();
    if (!note) return;
    page.querySelector('[data-notebook-title]').value = note.title;
    page.querySelector('[data-notebook-editor]').value = note.content;
    page.querySelector('[data-notebook-search]').value = '';
    page.querySelector('[data-notebook-search-count]').textContent = '';
    searchIndex = -1;
    updateStats(page);
    setSaveState('saved');
    if (focusEditor) window.setTimeout(() => page.querySelector('[data-notebook-editor]')?.focus(), 0);
  }

  function selectNote(noteId) {
    if (!state.notes.some(note => note.id === noteId)) return;
    flushSave();
    state.activeId = noteId;
    storeState();
    const page = document.querySelector('.wdgf-feature-page[data-feature-page="notebook"]');
    if (!page) return;
    renderTabs(page);
    renderActive(page, true);
  }

  function createNote() {
    flushSave();
    const note = freshNote();
    state.notes.push(note);
    state.activeId = note.id;
    storeState();
    const page = document.querySelector('.wdgf-feature-page[data-feature-page="notebook"]');
    if (!page) return;
    renderTabs(page);
    renderActive(page, false);
    page.querySelector('[data-notebook-title]').focus();
    page.querySelector('[data-notebook-title]').select();
  }

  function deleteNote(noteId, confirmFirst) {
    if (confirmFirst && !window.confirm(t.confirmDelete)) return;
    const index = state.notes.findIndex(note => note.id === noteId);
    if (index < 0) return;
    state.notes.splice(index, 1);
    if (!state.notes.length) state.notes.push(freshNote());
    if (state.activeId === noteId) state.activeId = state.notes[Math.min(index, state.notes.length - 1)].id;
    storeState();
    const page = document.querySelector('.wdgf-feature-page[data-feature-page="notebook"]');
    if (!page) return;
    renderTabs(page);
    renderActive(page, true);
  }

  function onTitleInput(event) {
    const note = activeNote();
    if (!note) return;
    note.title = event.target.value.slice(0, 120);
    note.updatedAt = new Date().toISOString();
    const tab = document.querySelector('[data-note-id="' + CSS.escape(note.id) + '"] span');
    if (tab) tab.textContent = note.title.trim() || t.untitled;
    scheduleSave();
  }

  function onEditorInput(event) {
    const note = activeNote();
    if (!note) return;
    note.content = event.target.value;
    note.updatedAt = new Date().toISOString();
    updateStats(event.target.closest('.wdgf-feature-page'));
    scheduleSave();
  }

  function updateStats(page) {
    const content = activeNote()?.content || '';
    const lines = content ? content.split(/\r?\n/).length : 1;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const stats = page?.querySelector('[data-notebook-stats]');
    if (stats) stats.textContent = lines + ' ' + t.lines + ' · ' + words + ' ' + t.words + ' · ' + content.length + ' ' + t.chars;
  }

  function findInNote(page, reset) {
    const query = page.querySelector('[data-notebook-search]').value;
    const editor = page.querySelector('[data-notebook-editor]');
    const count = page.querySelector('[data-notebook-search-count]');
    if (!query) { count.textContent = ''; searchIndex = -1; return; }
    const haystack = editor.value.toLocaleLowerCase();
    const needle = query.toLocaleLowerCase();
    const positions = [];
    let position = 0;
    while ((position = haystack.indexOf(needle, position)) !== -1) {
      positions.push(position);
      position += Math.max(needle.length, 1);
    }
    if (!positions.length) { count.textContent = t.emptySearch; searchIndex = -1; return; }
    searchIndex = reset ? 0 : (searchIndex + 1) % positions.length;
    const start = positions[searchIndex];
    editor.focus();
    editor.setSelectionRange(start, start + query.length);
    count.textContent = (searchIndex + 1) + '/' + positions.length;
  }

  function importTextFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      const title = file.name.replace(/\.[^.]+$/, '').slice(0, 120) || t.untitled;
      const note = freshNote(title, String(reader.result || ''));
      state.notes.push(note);
      state.activeId = note.id;
      storeState();
      const page = document.querySelector('.wdgf-feature-page[data-feature-page="notebook"]');
      if (page) { renderTabs(page); renderActive(page, true); }
      if (typeof window.showToast === 'function') window.showToast(t.imported);
    };
    reader.readAsText(file);
  }

  function safeFilename(value) {
    const result = String(value || t.untitled).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim();
    return (result || t.untitled).slice(0, 80) + '.txt';
  }

  function downloadActive() {
    flushSave();
    const note = activeNote();
    if (!note) return;
    const url = URL.createObjectURL(new Blob([note.content], { type:'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename(note.title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function notebookShortcuts(event) {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'n') { event.preventDefault(); createNote(); }
    if (key === 's') { event.preventDefault(); flushSave(); }
    if (key === 'f') {
      event.preventDefault();
      event.currentTarget.querySelector('[data-notebook-search]')?.focus();
    }
  }

  function addNavigation() {
    const nav = document.querySelector('.wdgn-nav') || document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById('wdgnbNavBtn')) return;
    const button = document.createElement('button');
    const usesNextNavigation = nav.classList.contains('wdgn-nav');
    button.className = usesNextNavigation ? 'wdgn-nav-btn' : 'wdg-nav-btn';
    button.id = 'wdgnbNavBtn';
    button.type = 'button';
    button.dataset.wdgFeature = 'notebook';
    if (usesNextNavigation) {
      button.dataset.view = 'notebook';
      button.dataset.mobile = 'false';
    }
    button.innerHTML = icon('tabler:notebook',19) + '<span>' + t.nav + '</span>';
    button.addEventListener('click', event => {
      event.stopPropagation();
      document.querySelectorAll('.wdgn-nav-btn, .wdg-nav-btn').forEach(item => item.classList.toggle('active', item === button));
      window.WebDevGymFeatures?.open('notebook');
    });
    const profile = nav.querySelector('[data-view="profile"]') || document.getElementById('wdgfProfileBtn');
    nav.insertBefore(button, profile || null);
  }

  function watchNavigation() {
    addNavigation();
    const sidebar = document.querySelector('.wdg-sidebar');
    if (!sidebar || sidebar.dataset.wdgnbObserved) return;
    sidebar.dataset.wdgnbObserved = 'true';
    new MutationObserver(() => {
      if (!document.getElementById('wdgnbNavBtn')) addNavigation();
    }).observe(sidebar, { childList:true, subtree:true });
  }

  function init() {
    if (!window.WebDevGymFeatures?.register) return window.setTimeout(init, 60);
    window.WebDevGymFeatures.register('notebook', renderPage, { title:t.title });
    watchNavigation();
    window.setTimeout(watchNavigation, 500);
    window.WebDevGymNotebook = { open:() => window.WebDevGymFeatures.open('notebook'), create:createNote, save:flushSave };
  }

  window.addEventListener('beforeunload', flushSave);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.setTimeout(init, 80));
  else window.setTimeout(init, 80);
})();
