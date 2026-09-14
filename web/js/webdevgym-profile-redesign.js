(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en')
    || /index-en\.html$/i.test(location.pathname);
  const text = isEnglish ? {
    title: 'Local profile',
    subtitle: 'A private portfolio and learning profile stored in this browser.',
    edit: 'Edit profile',
    addProject: 'Add project',
    export: 'Export',
    import: 'Import',
    projects: 'Projects',
    skills: 'Skills',
    activity: 'Activity',
    achievements: 'Achievements',
    local: 'Local only',
    ready: 'Portfolio readiness',
    next: 'Next milestone',
    streak: 'day streak',
    completed: 'completed',
    noProjects: 'Add the first project you can explain without reading the code.',
    open: 'Open project',
    editProject: 'Edit',
    remove: 'Remove',
    save: 'Save changes',
    cancel: 'Cancel',
    profileEditor: 'Profile and cover',
    projectEditor: 'Project card',
    name: 'Name',
    role: 'Role',
    bio: 'About you',
    stack: 'Technology line',
    specialization: 'Short specialization',
    tags: 'Skill tags, separated by commas',
    code: 'Code panel',
    avatar: 'Avatar',
    cover: 'Cover background',
    titleField: 'Project title',
    description: 'What the project solves',
    link: 'Project or GitHub link',
    status: 'Status',
    screenshot: 'Project screenshot',
    finished: 'Finished',
    inProgress: 'In progress',
    prototype: 'Prototype',
    saved: 'Saved locally',
    deleted: 'Project removed',
    importDone: 'Profile imported',
    invalidFile: 'This profile file could not be read',
    imageTooLarge: 'Choose an image under 8 MB',
    confirmDelete: 'Remove this project?',
    coverHint: 'Upload a background or keep the quiet graphite cover.',
    evidence: 'Add a public link to one project',
    explain: 'Write what the project solves and what you built',
    screenshotStep: 'Add a screenshot to a project',
    completeProfile: 'Complete your name, role and bio',
    firstProject: 'Add your first project',
    portfolioReady: 'Ready to share',
    learning: 'Learning activity',
    weeks: '12 weeks',
    totalSessions: 'learning actions',
    recent: 'Recent projects',
    profileSaved: 'Profile updated',
    imageSaved: 'Image stored in this browser',
    upload: 'Choose image',
    uploadAvatar: 'Choose photo or GIF',
    uploadMedia: 'Choose photo, GIF or video',
    mediaHint: 'Images and GIF; MP4/WebM video up to 30 seconds for covers and projects.',
    avatarHint: 'JPEG, PNG, WebP or GIF up to 24 MB.',
    coverMediaHint: 'JPEG, PNG, WebP or GIF up to 48 MB; MP4/WebM up to 96 MB and 30 seconds.',
    projectMedia: 'Project media',
    positionX: 'Horizontal position',
    positionY: 'Vertical position',
    zoom: 'Zoom',
    clearMedia: 'Remove media',
    mediaTooLarge: 'This file is too large for the selected media slot.',
    unsupportedMedia: 'Choose a supported image, GIF, MP4 or WebM file.',
    videoTooLong: 'Choose a video up to 30 seconds.',
    toggleNavigation: 'Toggle site navigation',
    noActivity: 'Complete lessons or practice tasks to build the heatmap.',
    privateNote: 'Nothing is uploaded to a server.',
    downloadJson: 'Download profile backup',
    importJson: 'Import profile backup',
    hideAchievement: 'Hide achievement',
    restoreAchievements: 'Restore hidden achievements'
  } : {
    title: 'Локальный профиль',
    subtitle: 'Личное портфолио и учебный профиль, которые хранятся в этом браузере.',
    edit: 'Редактировать',
    addProject: 'Добавить проект',
    export: 'Экспорт',
    import: 'Импорт',
    projects: 'Проекты',
    skills: 'Навыки',
    activity: 'Активность',
    achievements: 'Достижения',
    local: 'Только локально',
    ready: 'Готовность портфолио',
    next: 'Следующая цель',
    streak: 'дней подряд',
    completed: 'выполнено',
    noProjects: 'Добавь первый проект, который сможешь объяснить без чтения кода.',
    open: 'Открыть проект',
    editProject: 'Изменить',
    remove: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    profileEditor: 'Профиль и обложка',
    projectEditor: 'Карточка проекта',
    name: 'Имя',
    role: 'Роль',
    bio: 'О себе',
    stack: 'Строка технологий',
    specialization: 'Короткая специализация',
    tags: 'Навыки через запятую',
    code: 'Код в правой панели',
    avatar: 'Аватар',
    cover: 'Фон обложки',
    titleField: 'Название проекта',
    description: 'Какую задачу решает проект',
    link: 'Ссылка на проект или GitHub',
    status: 'Статус',
    screenshot: 'Скриншот проекта',
    finished: 'Завершён',
    inProgress: 'В работе',
    prototype: 'Прототип',
    saved: 'Сохранено локально',
    deleted: 'Проект удалён',
    importDone: 'Профиль импортирован',
    invalidFile: 'Не удалось прочитать файл профиля',
    imageTooLarge: 'Выбери изображение до 8 МБ',
    confirmDelete: 'Удалить этот проект?',
    coverHint: 'Загрузи свой фон или оставь спокойную графитовую обложку.',
    evidence: 'Добавь публичную ссылку хотя бы к одному проекту',
    explain: 'Опиши задачу проекта и свою работу',
    screenshotStep: 'Добавь скриншот проекта',
    completeProfile: 'Заполни имя, роль и описание',
    firstProject: 'Добавь первый проект',
    portfolioReady: 'Можно показывать',
    learning: 'Учебная активность',
    weeks: '12 недель',
    totalSessions: 'учебных действий',
    recent: 'Последние проекты',
    profileSaved: 'Профиль обновлён',
    imageSaved: 'Изображение сохранено в этом браузере',
    upload: 'Выбрать изображение',
    uploadAvatar: 'Выбрать фото или GIF',
    uploadMedia: 'Выбрать фото, GIF или видео',
    mediaHint: 'Фото и GIF; для фона и проектов также MP4/WebM до 30 секунд.',
    avatarHint: 'JPEG, PNG, WebP или GIF до 24 МБ.',
    coverMediaHint: 'JPEG, PNG, WebP или GIF до 48 МБ; MP4/WebM до 96 МБ и 30 секунд.',
    projectMedia: 'Медиа проекта',
    positionX: 'Позиция по горизонтали',
    positionY: 'Позиция по вертикали',
    zoom: 'Масштаб',
    clearMedia: 'Удалить медиа',
    mediaTooLarge: 'Файл слишком большой для выбранного типа медиа.',
    unsupportedMedia: 'Выбери поддерживаемое изображение, GIF, MP4 или WebM.',
    videoTooLong: 'Выбери видео длительностью до 30 секунд.',
    toggleNavigation: 'Свернуть или открыть меню сайта',
    noActivity: 'Закрывай уроки и практику, чтобы заполнить карту активности.',
    privateNote: 'На сервер ничего не отправляется.',
    downloadJson: 'Скачать резервную копию профиля',
    importJson: 'Импортировать резервную копию'
    ,hideAchievement: 'Скрыть достижение'
    ,restoreAchievements: 'Вернуть скрытые достижения'
  };

  const PROFILE_KEY = 'wdg_profile_v1';
  const PORTFOLIO_KEY = 'wdg_portfolio_v1';
  const ACTIVITY_KEY = 'wdg_activity_v1';
  const DB_NAME = 'webdevgym-profile-v1';
  const DB_STORE = 'assets';
  const MAX_AVATAR_SIZE = 24 * 1024 * 1024;
  const MAX_IMAGE_SIZE = 48 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 96 * 1024 * 1024;
  const MAX_VIDEO_DURATION = 30;
  const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
  const SIDEBAR_KEY = 'wdgp_sidebar_collapsed_v1';
  const HIDDEN_ACHIEVEMENTS_KEY = 'wdgp_hidden_achievements_v1';
  const objectUrls = new Set();
  let renderGeneration = 0;

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

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    const toast = document.createElement('div');
    toast.className = 'wdgp-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  function safeUrl(value) {
    const candidate = String(value || '').trim();
    if (!candidate) return '';
    try {
      const url = new URL(candidate, location.href);
      return /^(https?:)$/i.test(url.protocol) ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function uid() {
    return 'project-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function profileData() {
    const current = readJson(PROFILE_KEY, {});
    return {
      name: current.name || '',
      role: current.role || (isEnglish ? 'Frontend developer' : 'Frontend-разработчик'),
      bio: current.bio || '',
      stack: current.stack || 'HTML • CSS • JavaScript',
      specialization: current.specialization || (isEnglish
        ? 'Responsive interfaces, browser logic and careful debugging'
        : 'Адаптивные интерфейсы, браузерная логика и аккуратная отладка'),
      tags: current.tags || current.stack || 'HTML, CSS, JavaScript',
      coverCode: current.coverCode || "const skill = 'Frontend';\nfixBug(); makeResponsive();",
      avatar: current.avatar || '',
      avatarPositionX: clampNumber(current.avatarPositionX, 0, 100, 50),
      avatarPositionY: clampNumber(current.avatarPositionY, 0, 100, 50),
      avatarZoom: clampNumber(current.avatarZoom, 100, 180, 100),
      coverPositionX: clampNumber(current.coverPositionX, 0, 100, 50),
      coverPositionY: clampNumber(current.coverPositionY, 0, 100, 50),
      coverZoom: clampNumber(current.coverZoom, 100, 180, 100)
    };
  }

  function portfolioData() {
    const list = readJson(PORTFOLIO_KEY, []);
    let changed = false;
    const normalized = list.map(item => {
      const next = Object.assign({}, item);
      if (!next.id) {
        next.id = uid();
        changed = true;
      }
      if (!next.status) {
        next.status = 'finished';
        changed = true;
      }
      return next;
    });
    if (changed) writeJson(PORTFOLIO_KEY, normalized);
    return normalized;
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function mediaSettings(source, prefix) {
    return {
      x: clampNumber(source?.[prefix + 'PositionX'], 0, 100, 50),
      y: clampNumber(source?.[prefix + 'PositionY'], 0, 100, 50),
      zoom: clampNumber(source?.[prefix + 'Zoom'], 100, 180, 100)
    };
  }

  function mediaStyle(settings) {
    return '--wdgp-media-x:' + settings.x + '%;--wdgp-media-y:' + settings.y + '%;--wdgp-media-zoom:' + (settings.zoom / 100) + ';';
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function assetSet(key, blob) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(blob, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async function assetGet(key) {
    const db = await openDb();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const request = tx.objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return value;
  }

  async function assetDelete(key) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  function blobUrl(blob) {
    if (!blob) return '';
    const url = URL.createObjectURL(blob);
    objectUrls.add(url);
    return url;
  }

  function revokeObjectUrls() {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls.clear();
  }

  function sectionStats(sectionId) {
    const section = document.getElementById('sec-' + sectionId);
    if (!section) return { done: 0, all: 0, pct: 0 };
    const boxes = Array.from(section.querySelectorAll('.prog-cb:not([disabled])'));
    const done = boxes.filter(box => box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1').length;
    return { done, all: boxes.length, pct: boxes.length ? Math.round(done / boxes.length * 100) : 0 };
  }

  function skillRows() {
    return [
      ['HTML', 'html', '#38bdf8'],
      ['CSS', 'css', '#a78bfa'],
      ['JavaScript', 'js', '#facc15'],
      ['TypeScript', 'ts', '#60a5fa'],
      ['React', 'react', '#22d3ee']
    ].map(([label, id, color]) => ({ label, color, stats: sectionStats(id) }));
  }

  function totalProgress() {
    const boxes = Array.from(document.querySelectorAll('.prog-cb:not([disabled])'));
    const done = boxes.filter(box => box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1').length;
    return { done, all: boxes.length, pct: boxes.length ? Math.round(done / boxes.length * 100) : 0 };
  }

  function streak(activity) {
    let days = 0;
    const cursor = new Date();
    while (days < 366) {
      const key = cursor.toISOString().slice(0, 10);
      if (!Number(activity[key] || 0)) break;
      days += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return days;
  }

  function activityCells(activity) {
    const cells = [];
    const start = new Date();
    start.setDate(start.getDate() - 83);
    for (let index = 0; index < 84; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      const count = Number(activity[key] || 0);
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
      cells.push('<span class="wdgp-heat-cell level-' + level + '" title="' + key + ': ' + count + '"></span>');
    }
    return cells.join('');
  }

  function readiness(profile, projects) {
    const checks = [
      { done: Boolean(profile.name && profile.role && profile.bio), label: text.completeProfile },
      { done: projects.length > 0, label: text.firstProject },
      { done: projects.some(item => item.description && item.description.length >= 40), label: text.explain },
      { done: projects.some(item => safeUrl(item.link)), label: text.evidence },
      { done: projects.some(item => item.hasScreenshot), label: text.screenshotStep }
    ];
    const complete = checks.filter(item => item.done).length;
    return {
      checks,
      pct: Math.round(complete / checks.length * 100),
      next: checks.find(item => !item.done)?.label || text.portfolioReady
    };
  }

  function statusLabel(status) {
    return status === 'progress' ? text.inProgress : status === 'prototype' ? text.prototype : text.finished;
  }

  function initials(name) {
    return (name || 'WG').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  function projectMarkup(project) {
    const tags = String(project.stack || 'Web').split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 6);
    const link = safeUrl(project.link);
    const settings = mediaSettings(project, 'media');
    return '<article class="wdgp-project" data-project-id="' + escapeHtml(project.id) + '">' +
      '<div class="wdgp-project-media" data-project-image="' + escapeHtml(project.id) + '" style="' + mediaStyle(settings) + '">' +
        '<span>' + icon('tabler:photo', 24) + '</span>' +
        '<div class="wdgp-project-status status-' + escapeHtml(project.status || 'finished') + '">' + escapeHtml(statusLabel(project.status)) + '</div>' +
      '</div>' +
      '<div class="wdgp-project-body">' +
        '<div class="wdgp-project-heading"><h3>' + escapeHtml(project.title) + '</h3><button class="wdgp-icon-btn" type="button" data-edit-project="' + escapeHtml(project.id) + '" title="' + escapeHtml(text.editProject) + '">' + icon('tabler:pencil', 16) + '</button></div>' +
        '<p>' + escapeHtml(project.description) + '</p>' +
        '<div class="wdgp-tags">' + tags.map(tag => '<span>' + escapeHtml(tag) + '</span>').join('') + '</div>' +
        '<footer>' +
          '<time datetime="' + new Date(project.createdAt || Date.now()).toISOString() + '">' + new Date(project.createdAt || Date.now()).toLocaleDateString(isEnglish ? 'en-GB' : 'ru-RU') + '</time>' +
          (link ? '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">' + text.open + ' ' + icon('tabler:arrow-up-right', 15) + '</a>' : '') +
        '</footer>' +
      '</div>' +
    '</article>';
  }

  function achievementMarkup(progress, projects, activity) {
    const earned = [
      { id: 'first-steps', icon: 'tabler:code', title: isEnglish ? 'First steps' : 'Первые шаги', done: progress.done >= 1 },
      { id: 'three-day-streak', icon: 'tabler:flame', title: isEnglish ? 'Three-day streak' : 'Серия из трёх дней', done: streak(activity) >= 3 },
      { id: 'project-shipped', icon: 'tabler:briefcase', title: isEnglish ? 'Project shipped' : 'Проект завершён', done: projects.some(item => item.status === 'finished') },
      { id: 'public-evidence', icon: 'tabler:brand-github', title: isEnglish ? 'Public evidence' : 'Публичный результат', done: projects.some(item => safeUrl(item.link)) }
    ];
    const hidden = new Set(readJson(HIDDEN_ACHIEVEMENTS_KEY, []));
    return earned.filter(item => !hidden.has(item.id)).map(item => '<div class="wdgp-achievement' + (item.done ? ' earned' : '') + '" data-achievement-id="' + item.id + '">' +
      '<span>' + icon(item.icon, 19) + '</span><div><strong>' + item.title + '</strong><small>' +
      (item.done ? (isEnglish ? 'Unlocked' : 'Получено') : (isEnglish ? 'Locked' : 'Не открыто')) +
      '</small></div><button class="wdgp-achievement-hide" type="button" data-hide-achievement="' + item.id + '" title="' + text.hideAchievement + '" aria-label="' + text.hideAchievement + '">' + icon('tabler:x', 14) + '</button></div>').join('');
  }

  function hiddenAchievementCount() {
    return readJson(HIDDEN_ACHIEVEMENTS_KEY, []).length;
  }

  function profileBody(profile, projects) {
    const activity = readJson(ACTIVITY_KEY, {});
    const progress = totalProgress();
    const skills = skillRows();
    const activityTotal = Object.values(activity).reduce((sum, value) => sum + Number(value || 0), 0);
    const tags = String(profile.tags || profile.stack).split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 8);
    const avatar = profile.avatar
      ? '<img src="' + escapeHtml(profile.avatar) + '" alt="">'
      : '<span>' + escapeHtml(initials(profile.name)) + '</span>';

    return '<div class="wdgp-shell">' +
      '<button class="wdgp-navigation-toggle" type="button" data-profile-sidebar-toggle title="' + escapeHtml(text.toggleNavigation) + '" aria-label="' + escapeHtml(text.toggleNavigation) + '">' + icon('tabler:layout-sidebar-left-collapse', 18) + '</button>' +
      '<section class="wdgp-cover" data-cover-preview>' +
        '<div class="wdgp-cover-overlay"></div>' +
        '<div class="wdgp-cover-main">' +
          '<div class="wdgp-avatar" data-avatar-preview>' + avatar + '</div>' +
          '<div class="wdgp-cover-copy">' +
            '<span class="wdgp-privacy">' + icon('tabler:lock', 14) + ' ' + text.local + '</span>' +
            '<h2>' + escapeHtml(profile.name || (isEnglish ? 'Your name' : 'Твоё имя')) + '</h2>' +
            '<strong>' + escapeHtml(profile.role) + '</strong>' +
            '<p>' + escapeHtml(profile.specialization) + '</p>' +
            '<div class="wdgp-tags">' + tags.map(tag => '<span>' + escapeHtml(tag) + '</span>').join('') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="wdgp-cover-actions">' +
          '<button class="wdgp-btn primary" type="button" data-open-profile-editor>' + icon('tabler:pencil', 16) + ' ' + text.edit + '</button>' +
          '<button class="wdgp-btn" type="button" data-export-profile title="' + escapeHtml(text.downloadJson) + '">' + icon('tabler:download', 16) + ' ' + text.export + '</button>' +
          '<label class="wdgp-btn" title="' + escapeHtml(text.importJson) + '">' + icon('tabler:upload', 16) + ' ' + text.import + '<input type="file" accept="application/json" data-import-profile hidden></label>' +
        '</div>' +
      '</section>' +

      '<nav class="wdgp-tabs" aria-label="' + escapeHtml(text.title) + '">' +
        '<button class="active" type="button" data-profile-tab="projects">' + icon('tabler:briefcase', 17) + ' ' + text.projects + '<span>' + projects.length + '</span></button>' +
        '<button type="button" data-profile-tab="skills">' + icon('tabler:chart-dots-3', 17) + ' ' + text.skills + '</button>' +
        '<button type="button" data-profile-tab="activity">' + icon('tabler:activity', 17) + ' ' + text.activity + '</button>' +
        '<button type="button" data-profile-tab="achievements">' + icon('tabler:award', 17) + ' ' + text.achievements + '</button>' +
      '</nav>' +

      '<div class="wdgp-layout">' +
        '<main class="wdgp-main">' +
          '<section class="wdgp-tab-panel active" data-profile-panel="projects">' +
            '<div class="wdgp-section-head"><div><h2>' + text.recent + '</h2><p>' + escapeHtml(profile.bio || text.privateNote) + '</p></div>' +
            '<button class="wdgp-btn primary" type="button" data-open-project-editor>' + icon('tabler:plus', 16) + ' ' + text.addProject + '</button></div>' +
            '<div class="wdgp-project-grid">' + (projects.length ? projects.map(projectMarkup).join('') : '<div class="wdgp-empty">' + icon('tabler:briefcase-off', 28) + '<p>' + text.noProjects + '</p></div>') + '</div>' +
          '</section>' +
          '<section class="wdgp-tab-panel" data-profile-panel="skills"><div class="wdgp-panel"><h2>' + text.skills + '</h2><div class="wdgp-skill-list">' +
            skills.map(skill => '<div class="wdgp-skill"><div><strong>' + skill.label + '</strong><span>' + skill.stats.done + ' / ' + skill.stats.all + '</span></div><progress max="100" value="' + skill.stats.pct + '" style="--skill-color:' + skill.color + '"></progress></div>').join('') +
          '</div></div></section>' +
          '<section class="wdgp-tab-panel" data-profile-panel="activity"><div class="wdgp-panel"><div class="wdgp-section-head"><div><h2>' + text.learning + '</h2><p>' + activityTotal + ' ' + text.totalSessions + '</p></div><span class="wdgp-chip">' + text.weeks + '</span></div><div class="wdgp-heatmap large">' + activityCells(activity) + '</div>' +
            (!activityTotal ? '<p class="wdgp-muted">' + text.noActivity + '</p>' : '') + '</div></section>' +
          '<section class="wdgp-tab-panel" data-profile-panel="achievements"><div class="wdgp-panel"><div class="wdgp-section-head"><h2>' + text.achievements + '</h2>' +
            (hiddenAchievementCount() ? '<button class="wdgp-btn" type="button" data-restore-achievements>' + icon('tabler:restore', 15) + ' ' + text.restoreAchievements + '</button>' : '') +
          '</div><div class="wdgp-achievement-grid">' + achievementMarkup(progress, projects, activity) + '</div></div></section>' +
        '</main>' +

        '<aside class="wdgp-aside">' +
          '<section class="wdgp-panel"><div class="wdgp-section-head"><h2>' + text.skills + '</h2><span class="wdgp-chip">' + progress.pct + '%</span></div><div class="wdgp-skill-list compact">' +
            skills.map(skill => '<div class="wdgp-skill"><div><strong>' + skill.label + '</strong><span>' + skill.stats.pct + '%</span></div><progress max="100" value="' + skill.stats.pct + '" style="--skill-color:' + skill.color + '"></progress></div>').join('') +
          '</div></section>' +
          '<section class="wdgp-panel"><div class="wdgp-section-head"><h2>' + text.activity + '</h2><span class="wdgp-chip">' + streak(activity) + ' ' + text.streak + '</span></div><div class="wdgp-heatmap">' + activityCells(activity) + '</div></section>' +
          '<section class="wdgp-panel"><h2>' + text.achievements + '</h2><div class="wdgp-achievement-grid compact">' + achievementMarkup(progress, projects, activity) + '</div></section>' +
        '</aside>' +
      '</div>' +

      editorDialogs(profile) +
    '</div>';
  }

  function editorDialogs(profile) {
    const avatarSettings = mediaSettings(profile, 'avatar');
    const coverSettings = mediaSettings(profile, 'cover');
    return '<dialog class="wdgp-dialog" data-profile-dialog>' +
      '<form method="dialog" class="wdgp-dialog-card" data-profile-form>' +
        '<header><div><h2>' + text.profileEditor + '</h2><p>' + text.coverHint + '</p></div><button class="wdgp-icon-btn" type="button" data-close-dialog aria-label="' + text.cancel + '">' + icon('tabler:x', 19) + '</button></header>' +
        '<div class="wdgp-form-grid">' +
          '<section class="wdgp-editor-section wide">' +
            '<div class="wdgp-editor-section-head"><div><h3>' + (isEnglish ? 'Profile details' : 'Основная информация') + '</h3><p>' + (isEnglish ? 'Tell people who you are and what you work with.' : 'Расскажи, кто ты и с чем работаешь.') + '</p></div></div>' +
            '<div class="wdgp-profile-fields">' +
              '<label><span>' + text.name + '</span><input name="name" maxlength="50" value="' + escapeHtml(profile.name) + '" required></label>' +
              '<label><span>' + text.role + '</span><input name="role" maxlength="70" value="' + escapeHtml(profile.role) + '" required></label>' +
              '<label class="wide"><span>' + text.bio + '</span><textarea name="bio" maxlength="400">' + escapeHtml(profile.bio) + '</textarea></label>' +
              '<label><span>' + text.stack + '</span><input name="stack" maxlength="160" value="' + escapeHtml(profile.stack) + '"></label>' +
              '<label><span>' + text.tags + '</span><input name="tags" maxlength="180" value="' + escapeHtml(profile.tags) + '"></label>' +
              '<label class="wide"><span>' + text.specialization + '</span><input name="specialization" maxlength="180" value="' + escapeHtml(profile.specialization) + '"></label>' +
            '</div>' +
          '</section>' +
          '<section class="wdgp-editor-section wide">' +
            '<div class="wdgp-editor-section-head"><div><h3>' + (isEnglish ? 'Profile media' : 'Медиа профиля') + '</h3><p>' + (isEnglish ? 'Images stay local in this browser. GIF and short video are supported.' : 'Файлы остаются локально в этом браузере. Поддерживаются GIF и короткие видео.') + '</p></div></div>' +
            '<div class="wdgp-editor-media-list">' +
              mediaEditorMarkup('avatar', text.avatar, text.avatarHint, 'image/jpeg,image/png,image/webp,image/gif', avatarSettings, text.uploadAvatar) +
              mediaEditorMarkup('cover', text.cover, text.coverMediaHint, 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm', coverSettings) +
            '</div>' +
          '</section>' +
        '</div>' +
        '<footer><button class="wdgp-btn" type="button" data-close-dialog>' + text.cancel + '</button><button class="wdgp-btn primary" type="submit" value="default">' + text.save + '</button></footer>' +
      '</form>' +
    '</dialog>' +
    '<dialog class="wdgp-dialog" data-project-dialog>' +
      '<form method="dialog" class="wdgp-dialog-card" data-project-form>' +
        '<header><div><h2>' + text.projectEditor + '</h2><p>' + text.privateNote + '</p></div><button class="wdgp-icon-btn" type="button" data-close-dialog aria-label="' + text.cancel + '">' + icon('tabler:x', 19) + '</button></header>' +
        '<input type="hidden" name="id">' +
        '<div class="wdgp-form-grid">' +
          '<label class="wide"><span>' + text.titleField + '</span><input name="title" maxlength="80" required></label>' +
          '<label class="wide"><span>' + text.description + '</span><textarea name="description" maxlength="500" required></textarea></label>' +
          '<label><span>' + text.link + '</span><input name="link" type="url" placeholder="https://"></label>' +
          '<label><span>' + text.stack + '</span><input name="stack" maxlength="140" placeholder="HTML, CSS, JavaScript"></label>' +
          '<label><span>' + text.status + '</span><select name="status"><option value="finished">' + text.finished + '</option><option value="progress">' + text.inProgress + '</option><option value="prototype">' + text.prototype + '</option></select></label>' +
          mediaEditorMarkup('media', text.projectMedia, text.coverMediaHint, 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm', { x:50, y:50, zoom:100 }) +
        '</div>' +
        '<footer><button class="wdgp-btn danger" type="button" data-delete-project hidden>' + text.remove + '</button><span class="wdgp-dialog-spacer"></span><button class="wdgp-btn" type="button" data-close-dialog>' + text.cancel + '</button><button class="wdgp-btn primary" type="submit" value="default">' + text.save + '</button></footer>' +
      '</form>' +
    '</dialog>';
  }

  function mediaEditorMarkup(name, label, hint, accept, settings, uploadLabel) {
    const prefix = name === 'media' ? 'media' : name;
    const isAvatar = name === 'avatar';
    const capability = isAvatar
      ? (isEnglish ? 'GIF supported' : 'GIF поддерживается')
      : (isEnglish ? 'GIF + video' : 'GIF + видео');
    const noFile = isEnglish ? 'No new file selected' : 'Новый файл не выбран';
    const adjust = isEnglish ? 'Position and zoom' : 'Ракурс и масштаб';
    return '<section class="wdgp-media-editor' + (name === 'media' ? ' wide' : '') + '" data-media-editor="' + name + '" aria-label="' + escapeHtml(label) + '">' +
      '<div class="wdgp-media-editor-head">' +
        '<div><strong>' + escapeHtml(label) + '</strong><small>' + escapeHtml(hint) + '</small></div>' +
        '<span class="wdgp-media-badge">' + icon(isAvatar ? 'tabler:photo' : 'tabler:photo-video', 14) + ' ' + capability + '</span>' +
      '</div>' +
      '<div class="wdgp-media-editor-body">' +
        '<div class="wdgp-media-preview ' + (isAvatar ? 'is-avatar' : '') + '" data-media-preview="' + name + '" style="' + mediaStyle(settings) + '">' +
          '<span>' + icon(name === 'media' ? 'tabler:photo-video' : isAvatar ? 'tabler:user-circle' : 'tabler:photo', 30) + '</span>' +
        '</div>' +
        '<div class="wdgp-media-editor-tools">' +
          '<div class="wdgp-media-actions">' +
            '<button class="wdgp-media-remove" type="button" data-clear-media="' + name + '">' + icon('tabler:trash', 16) + ' ' + text.clearMedia + '</button>' +
            '<label class="wdgp-file-button">' + icon('tabler:upload', 16) + ' <span>' + escapeHtml(uploadLabel || text.uploadMedia) + '</span><input name="' + name + '" type="file" accept="' + accept + '"></label>' +
          '</div>' +
          '<small class="wdgp-file-name" data-file-name="' + name + '">' + noFile + '</small>' +
          '<small class="wdgp-media-error" data-media-error role="alert" aria-live="polite" hidden></small>' +
          '<details class="wdgp-media-adjustments" open>' +
            '<summary>' + icon('tabler:adjustments-horizontal', 16) + ' ' + adjust + '</summary>' +
            '<div class="wdgp-media-controls">' +
              rangeMarkup(prefix + 'PositionX', text.positionX, settings.x, 0, 100) +
              rangeMarkup(prefix + 'PositionY', text.positionY, settings.y, 0, 100) +
              rangeMarkup(prefix + 'Zoom', text.zoom, settings.zoom, 100, 180) +
            '</div>' +
          '</details>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function rangeMarkup(name, label, value, min, max) {
    return '<label><span>' + escapeHtml(label) + ' <output data-range-output="' + name + '">' + value + (name.endsWith('Zoom') ? '%' : '') + '</output></span>' +
      '<input name="' + name + '" type="range" min="' + min + '" max="' + max + '" value="' + value + '"></label>';
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function videoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = video.duration;
        URL.revokeObjectURL(url);
        resolve(duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Video metadata is unavailable'));
      };
      video.src = url;
    });
  }

  function formatFileSize(bytes) {
    const megabytes = bytes / (1024 * 1024);
    return (megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(1)).replace('.0', '') + (isEnglish ? ' MB' : ' МБ');
  }

  function mediaError(editor, message) {
    const output = editor?.querySelector?.('[data-media-error]');
    if (output) {
      output.textContent = message || '';
      output.hidden = !message;
    }
    if (message) notify(message);
  }

  function fileSizeError(file, limit, isVideo) {
    const typeName = isVideo
      ? (isEnglish ? 'Video' : 'Видео')
      : (file.type === 'image/gif' ? 'GIF' : (isEnglish ? 'Image' : 'Изображение'));
    return isEnglish
      ? typeName + ' “' + file.name + '” is ' + formatFileSize(file.size) + '. The limit is ' + formatFileSize(limit) + '.'
      : typeName + ' «' + file.name + '» весит ' + formatFileSize(file.size) + '. Допустимый размер — до ' + formatFileSize(limit) + '.';
  }

  async function validateMedia(file, kind, editor) {
    const isImage = IMAGE_TYPES.has(file.type);
    const isVideo = VIDEO_TYPES.has(file.type);
    if (!isImage && !(kind !== 'avatar' && isVideo)) {
      mediaError(editor, text.unsupportedMedia);
      return false;
    }
    const limit = kind === 'avatar'
      ? MAX_AVATAR_SIZE
      : (isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE);
    if (file.size > limit) {
      mediaError(editor, fileSizeError(file, limit, isVideo));
      return false;
    }
    if (isVideo) {
      try {
        const duration = await videoDuration(file);
        if (duration > MAX_VIDEO_DURATION + 0.2) {
          const message = isEnglish
            ? 'Video “' + file.name + '” is ' + Math.ceil(duration) + ' seconds long. The limit is ' + MAX_VIDEO_DURATION + ' seconds.'
            : 'Видео «' + file.name + '» длится ' + Math.ceil(duration) + ' сек. Допустимо до ' + MAX_VIDEO_DURATION + ' сек.';
          mediaError(editor, message);
          return false;
        }
      } catch (error) {
        mediaError(editor, text.unsupportedMedia);
        return false;
      }
    }
    mediaError(editor, '');
    return true;
  }

  function renderMedia(container, blob, options) {
    if (!container || !blob) return;
    clearMediaPreview(container);
    const url = blobUrl(blob);
    const isVideo = blob.type.startsWith('video/');
    const className = options?.cover ? 'wdgp-cover-media' : 'wdgp-media-object';
    if (isVideo) {
      const playLabel = isEnglish ? 'Play or pause silent video' : 'Воспроизвести или остановить видео без звука';
      const fullscreenLabel = isEnglish ? 'Open video fullscreen' : 'Открыть видео на весь экран';
      container.insertAdjacentHTML('afterbegin', '<video class="' + className + '" src="' + url + '" muted loop playsinline preload="metadata"' +
        (options?.cover ? ' autoplay' : ' tabindex="0" role="button" aria-label="' + playLabel + '"') + '></video>');
      const video = container.querySelector('video');
      if (video) {
        const keepSilent = () => {
          video.defaultMuted = true;
          video.muted = true;
          if (video.volume !== 0) video.volume = 0;
        };
        keepSilent();
        video.controls = false;
        video.disablePictureInPicture = true;
        video.setAttribute('controlsList', 'nodownload noremoteplayback');
        video.addEventListener('volumechange', keepSilent);
        video.addEventListener('loadedmetadata', keepSilent);
        if (!options?.cover) {
          container.insertAdjacentHTML('beforeend', '<button type="button" class="wdgp-media-fullscreen" aria-label="' + fullscreenLabel + '" title="' + fullscreenLabel + '">' + icon('tabler:arrows-maximize', 19) + '</button>');
          const fullscreenButton = container.querySelector('.wdgp-media-fullscreen');
          const togglePlayback = () => {
            keepSilent();
            if (video.paused) video.play().catch(() => {});
            else video.pause();
          };
          const syncFullscreenButton = () => {
            const isFullscreen = document.fullscreenElement === container || container.classList.contains('wdgp-pseudo-fullscreen');
            const label = isFullscreen
              ? (isEnglish ? 'Exit fullscreen' : 'Выйти из полноэкранного режима')
              : fullscreenLabel;
            fullscreenButton.setAttribute('aria-label', label);
            fullscreenButton.setAttribute('title', label);
            fullscreenButton.innerHTML = icon(isFullscreen ? 'tabler:arrows-minimize' : 'tabler:arrows-maximize', 19);
          };
          const exitPseudoFullscreen = () => {
            container.classList.remove('wdgp-pseudo-fullscreen');
            document.body.classList.remove('wdgp-media-fullscreen-open');
            syncFullscreenButton();
          };
          const toggleFullscreen = async () => {
            keepSilent();
            video.play().catch(() => {});
            if (document.fullscreenElement === container) {
              await document.exitFullscreen().catch(() => {});
            } else if (container.classList.contains('wdgp-pseudo-fullscreen')) {
              exitPseudoFullscreen();
            } else if (container.requestFullscreen) {
              await container.requestFullscreen().catch(() => {
                container.classList.add('wdgp-pseudo-fullscreen');
                document.body.classList.add('wdgp-media-fullscreen-open');
              });
            } else {
              container.classList.add('wdgp-pseudo-fullscreen');
              document.body.classList.add('wdgp-media-fullscreen-open');
            }
            keepSilent();
            syncFullscreenButton();
          };
          video.addEventListener('mouseenter', () => {
            keepSilent();
            video.play().catch(() => {});
          });
          video.addEventListener('mouseleave', () => video.pause());
          video.addEventListener('click', togglePlayback);
          video.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            togglePlayback();
          });
          fullscreenButton.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            toggleFullscreen();
          });
          container.addEventListener('fullscreenchange', () => {
            keepSilent();
            syncFullscreenButton();
          });
          container.addEventListener('keydown', event => {
            if (event.key === 'Escape' && container.classList.contains('wdgp-pseudo-fullscreen')) {
              exitPseudoFullscreen();
            }
          });
        }
      }
    } else {
      container.insertAdjacentHTML('afterbegin', '<img class="' + className + '" src="' + url + '" alt="">');
    }
    container.classList.add('has-media', 'has-image');
    container.dataset.mediaType = isVideo ? 'video' : blob.type === 'image/gif' ? 'gif' : 'image';
  }

  function clearMediaPreview(container) {
    if (!container) return;
    container.querySelectorAll('img,video').forEach(media => media.remove());
    container.querySelectorAll('.wdgp-media-fullscreen').forEach(button => button.remove());
    container.classList.remove('wdgp-pseudo-fullscreen');
    document.body.classList.remove('wdgp-media-fullscreen-open');
    container.classList.remove('has-media', 'has-image');
    delete container.dataset.mediaType;
  }

  function applyPreviewSettings(form, editorName) {
    const preview = form.querySelector('[data-media-preview="' + editorName + '"]');
    if (!preview) return;
    const prefix = editorName === 'media' ? 'media' : editorName;
    const x = clampNumber(form.elements[prefix + 'PositionX']?.value, 0, 100, 50);
    const y = clampNumber(form.elements[prefix + 'PositionY']?.value, 0, 100, 50);
    const zoom = clampNumber(form.elements[prefix + 'Zoom']?.value, 100, 180, 100);
    preview.style.cssText = mediaStyle({ x, y, zoom });
  }

  function setFormMediaSettings(form, editorName, source, prefix) {
    const settings = mediaSettings(source || {}, prefix || editorName);
    const fieldPrefix = editorName === 'media' ? 'media' : editorName;
    ['PositionX', 'PositionY', 'Zoom'].forEach(suffix => {
      const field = form.elements[fieldPrefix + suffix];
      if (!field) return;
      field.value = suffix === 'PositionX' ? settings.x : suffix === 'PositionY' ? settings.y : settings.zoom;
      const output = form.querySelector('[data-range-output="' + field.name + '"]');
      if (output) output.textContent = field.value + (suffix === 'Zoom' ? '%' : '');
    });
    applyPreviewSettings(form, editorName);
  }

  async function hydrateEditorPreview(form, editorName, key, generation) {
    const preview = form?.querySelector('[data-media-preview="' + editorName + '"]');
    if (!preview) return;
    clearMediaPreview(preview);
    const blob = await assetGet(key);
    if (generation != null && (generation !== renderGeneration || !form?.isConnected)) return;
    if (blob) {
      renderMedia(preview, blob);
      const fileName = form.querySelector('[data-file-name="' + editorName + '"]');
      if (fileName) fileName.textContent = isEnglish ? 'Saved in this browser' : 'Сохранено в этом браузере';
    }
  }

  async function hydrateImages(page, profile, projects, generation) {
    try {
      const [cover, avatar] = await Promise.all([assetGet('cover'), assetGet('avatar')]);
      if (generation !== renderGeneration || !page.isConnected) return;
      if (cover) {
        const coverElement = page.querySelector('[data-cover-preview]');
        if (!coverElement) return;
        coverElement.style.cssText += mediaStyle(mediaSettings(profile, 'cover'));
        renderMedia(coverElement, cover, { cover:true });
      }
      if (avatar) {
        const element = page.querySelector('[data-avatar-preview]');
        if (!element) return;
        element.style.cssText = mediaStyle(mediaSettings(profile, 'avatar'));
        renderMedia(element, avatar);
      } else if (profile.avatar) {
        const element = page.querySelector('[data-avatar-preview]');
        if (!element) return;
        element.style.cssText = mediaStyle(mediaSettings(profile, 'avatar'));
        element.innerHTML = '<img class="wdgp-media-object" src="' + escapeHtml(profile.avatar) + '" alt="">';
      }
      await Promise.all(projects.map(async project => {
        const blob = await assetGet('project:' + project.id);
        if (!blob || generation !== renderGeneration || !page.isConnected) return;
        const media = page.querySelector('[data-project-image="' + CSS.escape(project.id) + '"]');
        if (!media) return;
        renderMedia(media, blob);
      }));
      if (generation !== renderGeneration || !page.isConnected) return;
      const profileForm = page.querySelector('[data-profile-form]');
      await Promise.all([
        hydrateEditorPreview(profileForm, 'avatar', 'avatar', generation),
        hydrateEditorPreview(profileForm, 'cover', 'cover', generation)
      ]);
    } catch (error) {
      console.warn('Profile images are unavailable:', error);
    }
  }

  async function mediaFromInput(input, key, kind) {
    const file = input?.files?.[0];
    if (!file) return { saved:false, type:'' };
    if (!await validateMedia(file, kind)) return { saved:false, type:'' };
    await assetSet(key, file);
    return { saved:true, type:file.type };
  }

  async function assetToDataUrl(key) {
    const blob = await assetGet(key);
    if (!blob) return '';
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function exportProfile() {
    const profile = profileData();
    const projects = portfolioData();
    const assets = {
      avatar: await assetToDataUrl('avatar'),
      cover: await assetToDataUrl('cover'),
      projects: {}
    };
    for (const project of projects) {
      const image = await assetToDataUrl('project:' + project.id);
      if (image) assets.projects[project.id] = image;
    }
    const payload = JSON.stringify({
      type: 'webdevgym-profile',
      version: 3,
      exportedAt: new Date().toISOString(),
      profile,
      projects,
      assets
    }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'webdevgym-profile.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function dataUrlToBlob(value) {
    if (!value) return null;
    const response = await fetch(value);
    return response.blob();
  }

  async function importProfile(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (payload.type !== 'webdevgym-profile' || !payload.profile || !Array.isArray(payload.projects)) throw new Error('Invalid profile');
      writeJson(PROFILE_KEY, payload.profile);
      writeJson(PORTFOLIO_KEY, payload.projects);
      if (payload.assets?.avatar) await assetSet('avatar', await dataUrlToBlob(payload.assets.avatar));
      if (payload.assets?.cover) await assetSet('cover', await dataUrlToBlob(payload.assets.cover));
      for (const [id, dataUrl] of Object.entries(payload.assets?.projects || {})) {
        await assetSet('project:' + id, await dataUrlToBlob(dataUrl));
      }
      notify(text.importDone);
      window.WebDevGymFeatures.open('profile');
    } catch (error) {
      notify(text.invalidFile);
    }
  }

  function bindPage(page, profile, projects) {
    const profileDialog = page.querySelector('[data-profile-dialog]');
    const projectDialog = page.querySelector('[data-project-dialog]');
    const profileForm = page.querySelector('[data-profile-form]');
    const projectForm = page.querySelector('[data-project-form]');

    const sidebarButton = page.querySelector('[data-profile-sidebar-toggle]');
    const updateSidebarButton = () => {
      const collapsed = document.body.classList.contains('wdgp-global-sidebar-collapsed');
      if (sidebarButton) sidebarButton.innerHTML = icon(collapsed ? 'tabler:layout-sidebar-left-expand' : 'tabler:layout-sidebar-left-collapse', 18);
    };
    document.body.classList.toggle('wdgp-global-sidebar-collapsed', localStorage.getItem(SIDEBAR_KEY) === '1');
    updateSidebarButton();
    sidebarButton?.addEventListener('click', () => {
      const collapsed = document.body.classList.toggle('wdgp-global-sidebar-collapsed');
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
      updateSidebarButton();
    });

    page.querySelectorAll('[data-close-dialog]').forEach(button => {
      button.addEventListener('click', () => button.closest('dialog')?.close());
    });

    page.querySelector('[data-open-profile-editor]').addEventListener('click', () => {
      profileForm.dataset.clearAvatar = '';
      profileForm.dataset.clearCover = '';
      openDialog(profileDialog);
    });
    page.querySelector('[data-open-project-editor]').addEventListener('click', () => {
      projectForm.reset();
      projectForm.elements.id.value = '';
      projectForm.dataset.clearMedia = '';
      clearMediaPreview(projectForm.querySelector('[data-media-preview="media"]'));
      setFormMediaSettings(projectForm, 'media', {}, 'media');
      projectForm.querySelector('[data-delete-project]').hidden = true;
      openDialog(projectDialog);
    });

    page.querySelectorAll('[data-profile-tab]').forEach(button => {
      button.addEventListener('click', () => {
        page.querySelectorAll('[data-profile-tab]').forEach(item => item.classList.toggle('active', item === button));
        page.querySelectorAll('[data-profile-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.profilePanel === button.dataset.profileTab));
      });
    });

    page.querySelectorAll('[data-hide-achievement]').forEach(button => {
      button.addEventListener('click', () => {
        const hidden = new Set(readJson(HIDDEN_ACHIEVEMENTS_KEY, []));
        hidden.add(button.dataset.hideAchievement);
        writeJson(HIDDEN_ACHIEVEMENTS_KEY, [...hidden]);
        window.WebDevGymFeatures.open('profile');
      });
    });
    page.querySelector('[data-restore-achievements]')?.addEventListener('click', () => {
      localStorage.removeItem(HIDDEN_ACHIEVEMENTS_KEY);
      window.WebDevGymFeatures.open('profile');
    });

    profileForm.addEventListener('submit', async event => {
      event.preventDefault();
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const next = profileData();
      ['name', 'role', 'bio', 'stack', 'specialization', 'tags'].forEach(key => {
        next[key] = String(form.get(key) || '').trim();
      });
      next.avatarPositionX = clampNumber(form.get('avatarPositionX'), 0, 100, 50);
      next.avatarPositionY = clampNumber(form.get('avatarPositionY'), 0, 100, 50);
      next.avatarZoom = clampNumber(form.get('avatarZoom'), 100, 180, 100);
      next.coverPositionX = clampNumber(form.get('coverPositionX'), 0, 100, 50);
      next.coverPositionY = clampNumber(form.get('coverPositionY'), 0, 100, 50);
      next.coverZoom = clampNumber(form.get('coverZoom'), 100, 180, 100);
      writeJson(PROFILE_KEY, next);
      let avatarSaved = { saved: false };
      let coverSaved = { saved: false };
      try {
        avatarSaved = await mediaFromInput(formElement.elements.avatar, 'avatar', 'avatar');
        coverSaved = await mediaFromInput(formElement.elements.cover, 'cover', 'cover');
        if (formElement.dataset.clearAvatar === '1') await assetDelete('avatar');
        if (formElement.dataset.clearCover === '1') await assetDelete('cover');
      } catch (error) {
        console.error('WebDevGym profile media save failed', error);
        notify(isEnglish
          ? 'The profile was saved, but the media file could not be stored.'
          : 'Профиль сохранён, но медиафайл записать не удалось.');
      }
      profileDialog.close();
      notify(avatarSaved.saved || coverSaved.saved ? text.imageSaved : text.profileSaved);
      window.WebDevGymFeatures.open('profile');
    });

    page.querySelectorAll('[data-edit-project]').forEach(button => {
      button.addEventListener('click', () => {
        const project = projects.find(item => item.id === button.dataset.editProject);
        if (!project) return;
        projectForm.elements.id.value = project.id;
        projectForm.elements.title.value = project.title || '';
        projectForm.elements.description.value = project.description || '';
        projectForm.elements.link.value = project.link || '';
        projectForm.elements.stack.value = project.stack || '';
        projectForm.elements.status.value = project.status || 'finished';
        projectForm.dataset.clearMedia = '';
        setFormMediaSettings(projectForm, 'media', project, 'media');
        hydrateEditorPreview(projectForm, 'media', 'project:' + project.id);
        projectForm.querySelector('[data-delete-project]').hidden = false;
        openDialog(projectDialog);
      });
    });

    projectForm.addEventListener('submit', async event => {
      event.preventDefault();
      const formElement = event.currentTarget;
      const data = new FormData(formElement);
      const list = portfolioData();
      const id = String(data.get('id') || '') || uid();
      const existing = list.find(item => item.id === id);
      const project = {
        id,
        title: String(data.get('title') || '').trim(),
        description: String(data.get('description') || '').trim(),
        link: safeUrl(data.get('link')),
        stack: String(data.get('stack') || '').trim(),
        status: String(data.get('status') || 'finished'),
        createdAt: existing?.createdAt || Date.now(),
        hasScreenshot: existing?.hasScreenshot || false,
        mediaType: existing?.mediaType || '',
        mediaPositionX: clampNumber(data.get('mediaPositionX'), 0, 100, 50),
        mediaPositionY: clampNumber(data.get('mediaPositionY'), 0, 100, 50),
        mediaZoom: clampNumber(data.get('mediaZoom'), 100, 180, 100)
      };
      let mediaFailed = false;
      try {
        const mediaSaved = await mediaFromInput(formElement.elements.media, 'project:' + id, 'project');
        if (mediaSaved.saved) {
          project.hasScreenshot = true;
          project.mediaType = mediaSaved.type;
        }
        if (formElement.dataset.clearMedia === '1') {
          await assetDelete('project:' + id);
          project.hasScreenshot = false;
          project.mediaType = '';
        }
      } catch (error) {
        mediaFailed = true;
        console.error('WebDevGym project media save failed', error);
      }
      const index = list.findIndex(item => item.id === id);
      if (index >= 0) list[index] = project;
      else list.unshift(project);
      writeJson(PORTFOLIO_KEY, list.slice(0, 30));
      projectDialog.close();
      notify(mediaFailed
        ? (isEnglish
            ? 'The project was saved, but the media file could not be stored.'
            : 'Проект сохранён, но медиафайл записать не удалось.')
        : text.saved);
      window.WebDevGymFeatures.logActivity(1);
      window.WebDevGymFeatures.open('profile');
    });

    projectForm.querySelector('[data-delete-project]').addEventListener('click', async () => {
      const id = projectForm.elements.id.value;
      if (!id || !window.confirm(text.confirmDelete)) return;
      writeJson(PORTFOLIO_KEY, portfolioData().filter(item => item.id !== id));
      await assetDelete('project:' + id);
      projectDialog.close();
      notify(text.deleted);
      window.WebDevGymFeatures.open('profile');
    });

    page.querySelectorAll('[data-media-editor]').forEach(editor => {
      const form = editor.closest('form');
      const editorName = editor.dataset.mediaEditor;
      const input = form.elements[editorName];
      input?.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file || !await validateMedia(file, editorName === 'media' ? 'project' : editorName, editor)) {
          input.value = '';
          return;
        }
        form.dataset['clear' + editorName[0].toUpperCase() + editorName.slice(1)] = '';
        const preview = editor.querySelector('[data-media-preview]');
        clearMediaPreview(preview);
        renderMedia(preview, file);
        const fileName = editor.querySelector('[data-file-name]');
        if (fileName) fileName.textContent = file.name;
      });
      editor.querySelectorAll('input[type="range"]').forEach(range => {
        range.addEventListener('input', () => {
          const output = editor.querySelector('[data-range-output="' + range.name + '"]');
          if (output) output.textContent = range.value + (range.name.endsWith('Zoom') ? '%' : '');
          applyPreviewSettings(form, editorName);
        });
      });
      editor.querySelector('[data-clear-media]')?.addEventListener('click', () => {
        form.dataset['clear' + editorName[0].toUpperCase() + editorName.slice(1)] = '1';
        if (input) input.value = '';
        clearMediaPreview(editor.querySelector('[data-media-preview]'));
        const fileName = editor.querySelector('[data-file-name]');
        if (fileName) fileName.textContent = isEnglish ? 'Media will be removed after saving' : 'Медиа будет удалено после сохранения';
        mediaError(editor, '');
      });
    });

    page.querySelector('[data-export-profile]').addEventListener('click', exportProfile);
    page.querySelector('[data-import-profile]').addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (file) importProfile(file);
    });
  }

  function renderProfile() {
    const generation = ++renderGeneration;
    revokeObjectUrls();
    const profile = profileData();
    const projects = portfolioData();
    const page = window.WebDevGymFeatures.pageShell('profile', text.title, text.subtitle, profileBody(profile, projects));
    page.classList.add('wdgp-page');
    page.querySelector('.wdgf-page-head [data-feature-close]')?.remove();
    bindPage(page, profile, projects);
    hydrateImages(page, profile, projects, generation);
    return page;
  }

  function init() {
    if (!window.WebDevGymFeatures?.register) {
      setTimeout(init, 80);
      return;
    }
    window.WebDevGymFeatures.register('profile', renderProfile, {
      label: text.title,
      icon: 'tabler:user-circle'
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 90));
  } else {
    setTimeout(init, 90);
  }
})();
