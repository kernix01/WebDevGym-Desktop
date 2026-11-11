(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname);
  const t = isEnglish ? {
    dashboard: 'Dashboard', dashboardSub: 'Your learning command center', close: 'Close',
    progress: 'Course progress', completed: 'Completed', focus: 'Focus time', streak: 'Daily streak', reviews: 'Due reviews',
    quick: 'Quick actions', courses: 'Course progress', activity: 'Learning activity', today: 'Challenge of the day',
    debug: 'Debug Lab', review: 'Review', skills: 'Skill map', profile: 'Local profile',
    command: 'Type a command or topic...', noResults: 'Nothing found', focusMode: 'Focus mode',
    start: 'Start', pause: 'Pause', finish: 'Finish', minutes: 'minutes', open: 'Open', done: 'Done', reset: 'Reset',
    debugSub: 'Find the bug before viewing the explanation',
    reviewSub: 'Spaced repetition from topics you have already touched', skillsSub: 'A practical route through the stack',
    profileSub: 'Stored only in this browser. No account and no server.', save: 'Save', name: 'Name', role: 'Role', bio: 'About', stack: 'Stack', avatar: 'Avatar',
    portfolio: 'Portfolio', addProject: 'Add project', projectTitle: 'Project title', description: 'Description', link: 'Project link', remove: 'Remove',
    exportPortfolio: 'Export portfolio HTML', challengeDone: 'Mark completed', challengeComplete: 'Completed today',
    showAnswer: 'Show answer', again: 'Again', hard: 'Hard', good: 'Got it', question: 'Question', answer: 'Answer',
    commandHint: 'Ctrl K', lesson: 'Lesson', section: 'Section', action: 'Action', localOnly: 'Local only',
    profileSaved: 'Profile saved', imageTooLarge: 'Choose an image under 5 MB', imported: 'Data imported', exported: 'Backup downloaded',
    nexusSearch: 'Filter graph nodes...', newNote: 'New note', map: 'Open skill map',
    diary:'Learning diary', diarySub:'Record what you learned, what was difficult and what comes next', weak:'Weak spots', weakSub:'Topics that deserve another short practice session', addEntry:'Add entry', learned:'What did you learn?', difficult:'What was difficult?', nextStep:'Next step', mood:'Session rating', deleteEntry:'Delete', noDiary:'No entries yet. Write two honest sentences after a session.', noWeak:'No weak spots yet. Check tasks and rate review cards to build this list.', attempts:'attempts', lastSeen:'Last seen', openTopic:'Open topic', bookmarks:'Bookmarks', reviewReady:'Ready to review', searchAll:'Search all topics'
  } : {
    dashboard: 'Обзор', dashboardSub: 'Центр управления твоим обучением', close: 'Закрыть',
    progress: 'Прогресс курса', completed: 'Выполнено', focus: 'В фокусе', streak: 'Серия дней', reviews: 'Повторить сегодня',
    quick: 'Быстрые действия', courses: 'Прогресс по направлениям', activity: 'Активность обучения', today: 'Челлендж дня',
    debug: 'Debug Lab', review: 'Повторение', skills: 'Карта навыков', profile: 'Локальный профиль',
    command: 'Найди команду, раздел или тему...', noResults: 'Ничего не найдено', focusMode: 'Режим фокуса',
    start: 'Старт', pause: 'Пауза', finish: 'Завершить', minutes: 'минут', open: 'Открыть', done: 'Готово', reset: 'Сбросить',
    debugSub: 'Найди ошибку до открытия объяснения',
    reviewSub: 'Интервальное повторение тем, которых ты уже касался', skillsSub: 'Практический маршрут по стеку',
    profileSub: 'Хранится только в этом браузере. Без аккаунта и сервера.', save: 'Сохранить', name: 'Имя', role: 'Роль', bio: 'О себе', stack: 'Стек', avatar: 'Аватар',
    portfolio: 'Портфолио', addProject: 'Добавить проект', projectTitle: 'Название проекта', description: 'Описание', link: 'Ссылка на проект', remove: 'Удалить',
    exportPortfolio: 'Скачать портфолио HTML', challengeDone: 'Отметить выполненным', challengeComplete: 'Сегодня выполнено',
    showAnswer: 'Показать ответ', again: 'Ещё раз', hard: 'Сложно', good: 'Понял', question: 'Вопрос', answer: 'Ответ',
    commandHint: 'Ctrl K', lesson: 'Тема', section: 'Раздел', action: 'Действие', localOnly: 'Только локально',
    profileSaved: 'Профиль сохранён', imageTooLarge: 'Выбери изображение до 5 МБ', imported: 'Данные импортированы', exported: 'Резервная копия скачана',
    nexusSearch: 'Фильтр узлов графа...', newNote: 'Новая заметка', map: 'Открыть карту навыков',
    diary:'Дневник обучения', diarySub:'Записывай, что понял, где застрял и какой шаг будет следующим', weak:'Слабые места', weakSub:'Темы, которым нужна ещё одна короткая практика', addEntry:'Добавить запись', learned:'Что сегодня понял?', difficult:'Что было сложно?', nextStep:'Следующий шаг', mood:'Оценка занятия', deleteEntry:'Удалить', noDiary:'Записей пока нет. После занятия напиши две честные строки.', noWeak:'Слабых мест пока нет. Проверяй задания и оценивай карточки повторения.', attempts:'попыток', lastSeen:'Последняя попытка', openTopic:'Открыть тему', bookmarks:'Закладки', reviewReady:'Пора повторить', searchAll:'Поиск по всем темам'
  };

  const KEYS = {
    activity: 'wdg_activity_v1', focus: 'wdg_focus_v1', debug: 'wdg_debug_v1',
    review: 'wdg_review_v1', challenge: 'wdg_challenge_v1', profile: 'wdg_profile_v1', portfolio: 'wdg_portfolio_v1',
    diary: 'wdg_diary_v1', weak: 'wdg_weak_v1'
  };
  const pages = new Map();
  const extensionFeatures = new Map();
  let currentPage = '';
  let focusTimer = null;
  let focusLeft = 25 * 60;
  let focusRunning = false;
  let commandIndex = 0;
  let commandEntries = [];

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (error) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function notify(message) {
    if (typeof window.showToast === 'function') return window.showToast(message);
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = 'position:fixed;left:50%;bottom:80px;z-index:2000;transform:translateX(-50%);padding:10px 14px;background:#111827;color:#fff;border:1px solid #374151;border-radius:6px;font:13px system-ui';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function logActivity(amount) {
    const activity = readJson(KEYS.activity, {});
    activity[todayKey()] = Math.max(0, Number(activity[todayKey()] || 0) + (amount || 1));
    writeJson(KEYS.activity, activity);
  }

  function progressStats() {
    const all = Array.from(document.querySelectorAll('.prog-cb:not([disabled])'));
    const done = all.filter(box => box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1');
    return { all: all.length, done: done.length, pct: all.length ? Math.round(done.length / all.length * 100) : 0 };
  }

  function sectionProgress(id) {
    const section = document.getElementById('sec-' + id);
    if (!section) return { all: 0, done: 0, pct: 0 };
    const all = Array.from(section.querySelectorAll('.prog-cb:not([disabled])'));
    const done = all.filter(box => box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1');
    return { all: all.length, done: done.length, pct: all.length ? Math.round(done.length / all.length * 100) : 0 };
  }

  function openSection(id) {
    closePage();
    if (typeof window.WebDevGymNext?.open === 'function') {
      window.WebDevGymNext.open(id);
      return;
    }
    if (typeof window.switchTabByName === 'function') window.switchTabByName(id);
    else document.querySelector('.tab[onclick*="\'' + id + '\'"]')?.click();
  }

  function pageShell(id, title, subtitle, body) {
    let page = pages.get(id);
    if (!page) {
      page = document.createElement('section');
      page.className = 'wdgf-feature-page';
      page.dataset.featurePage = id;
      document.body.appendChild(page);
      pages.set(id, page);
    }
    page.innerHTML = '<div class="wdgf-page-inner"><header class="wdgf-page-head"><div><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(subtitle) + '</p></div>' +
      '<button class="wdgf-icon-btn" type="button" data-feature-close title="' + t.close + '">' + icon('tabler:x', 20) + '</button></header>' + body + '</div>';
    page.querySelector('[data-feature-close]').addEventListener('click', closePage);
    return page;
  }

  function syncNativeNavigation() {
    const section = document.querySelector('.section.active') || document.querySelector('.section');
    const sectionId = section?.id?.replace(/^sec-/, '') || 'html';
    const direct = ['practice', 'playground', 'nexus', 'calendar'].includes(sectionId) ? sectionId : 'learn';
    document.querySelectorAll('[data-wdg-nav]').forEach(button => {
      button.classList.toggle('active', button.dataset.wdgNav === direct);
    });
  }

  function showPage(id, render) {
    pages.forEach(page => page.classList.remove('open'));
    const cachedPage = pages.get(id);
    const cacheOnNavigation = id === 'today' || id === 'paths' || extensionFeatures.get(id)?.meta?.cacheOnNavigation === true;
    const page = cacheOnNavigation && cachedPage ? cachedPage : render();
    page.classList.add('open');
    currentPage = id;
    document.body.classList.add('wdgf-page-open');
    document.querySelectorAll('[data-wdg-nav]').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('[data-wdg-feature]').forEach(btn => btn.classList.toggle('active', btn.dataset.wdgFeature === id));
    page.scrollTop = 0;
  }

  function closePage() {
    pages.forEach(page => page.classList.remove('open'));
    currentPage = '';
    document.body.classList.remove('wdgf-page-open');
    document.querySelectorAll('[data-wdg-feature]').forEach(btn => btn.classList.remove('active'));
    syncNativeNavigation();
  }
  function closePageForNativeNavigation(event) {
    const target = event.target.closest('[data-wdg-nav], .wdg-library-item, .tabs-nav .tab');
    if (!target || target.closest('[data-wdg-feature], [data-open-feature]')) return;
    if (currentPage) closePage();
  }

  function openSettingsPanel() {
    if (typeof window.openWebDevGymSettings === 'function') {
      window.openWebDevGymSettings();
      return;
    }
    const panel = document.getElementById('settingsMini');
    if (panel) {
      panel.classList.toggle('show');
      panel.classList.add('wdgf-settings-top');
      return;
    }
    if (typeof window.toggleSettings === 'function') window.toggleSettings();
    else document.querySelector('.settings-btn')?.click();
  }

  function repairSettingsButton() {
    const button = document.getElementById('wdgSettingsBtn');
    if (!button || button.dataset.wdgfRepaired === '1') return;
    const clone = button.cloneNode(true);
    clone.dataset.wdgfRepaired = '1';
    clone.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openSettingsPanel();
    });
    button.replaceWith(clone);
  }

  function handleGlobalClick(event) {
    const settingsButton = event.target.closest('#wdgSettingsBtn');
    if (settingsButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openSettingsPanel();
      return;
    }
    closePageForNativeNavigation(event);
  }

  const challenges = isEnglish ? [
    ['Build a counter', 'Interface', 'Buttons plus, minus and reset. Keep zero from going negative.'],
    ['Validate a form', 'JavaScript', 'Show clear errors and clear the form only after success.'],
    ['Responsive navigation', 'CSS + JS', 'Open a mobile menu and close it on Escape.'],
    ['Theme switcher', 'State', 'Build a clear two-state control and choose the implementation yourself.'],
    ['Live search', 'Arrays', 'Filter cards while the user types.'],
    ['Accessible modal', 'Accessibility', 'Close by button, overlay and Escape; restore focus.'],
    ['Price calculator', 'Forms', 'Read inputs, calculate total and format the result.'],
    ['FAQ accordion', 'Events', 'Only one answer may stay open.'],
    ['Todo item', 'State', 'Add, complete and remove tasks.'],
    ['Fetch a user', 'Async', 'Render loading, success and error states.']
  ] : [
    ['Собери счётчик', 'Интерфейс', 'Кнопки плюс, минус и сброс. Не позволяй значению уйти ниже нуля.'],
    ['Проверь форму', 'JavaScript', 'Покажи понятные ошибки и очисти форму только после успешной отправки.'],
    ['Адаптивная навигация', 'CSS + JS', 'Открывай мобильное меню и закрывай его по Escape.'],
    ['Переключатель темы', 'Состояние', 'Сделай понятное переключение двух тем и сам выбери реализацию.'],
    ['Живой поиск', 'Массивы', 'Фильтруй карточки во время ввода пользователя.'],
    ['Доступная модалка', 'Доступность', 'Закрывай кнопкой, кликом по фону и Escape; возвращай фокус.'],
    ['Калькулятор цены', 'Формы', 'Прочитай поля, посчитай сумму и отформатируй результат.'],
    ['FAQ-аккордеон', 'События', 'Открытым может оставаться только один ответ.'],
    ['Элемент Todo', 'Состояние', 'Добавляй, отмечай и удаляй задачи.'],
    ['Загрузка пользователя', 'Async', 'Покажи состояния загрузки, успеха и ошибки.']
  ];

  const debugData = isEnglish ? [
    { title:'Strict comparison', code:'const age = "18";\nif (age === 18) {\n  console.log("Allowed");\n}', answers:['The comparison is strict and types differ','The if syntax is invalid','console.log cannot be inside if'], correct:0, why:'=== compares both value and type. Convert age with Number(age) or compare with the string "18".' },
    { title:'Input cleanup', code:'if (input.value.trim === "") {\n  showError();\n}', answers:['trim must be called with ()','value is not available on input','Use a single ='], correct:0, why:'trim is a function. trim refers to the function itself; trim() returns the cleaned string.' },
    { title:'CSS selector', code:'.body.dark .count {\n  color: white;\n}', answers:['body is an element, not a class','dark cannot be a class','color needs parentheses'], correct:0, why:'Use body.dark when the same body element has the dark class.' },
    { title:'Event callback', code:'button.addEventListener("click", handleClick());', answers:['The function runs immediately','click must be onclick','Event listeners need async'], correct:0, why:'Pass the function: handleClick. Parentheses call it immediately and pass its result.' },
    { title:'Array rendering', code:'items.map(item => {\n  `<li>${item}</li>`;\n});', answers:['The callback returns nothing','Template strings cannot contain li','map only works with numbers'], correct:0, why:'With braces, return must be explicit: return `<li>...</li>`; or remove the braces.' },
    { title:'Fetch error', code:'const data = await response.json();\nif (!response.ok) throw new Error(data.message);', answers:['Check response.ok before trusting body','await is forbidden here','Error needs no new'], correct:0, why:'Some APIs return useful JSON errors, but the important part is handling !response.ok and displaying a user-facing state.' }
  ] : [
    { title:'Строгое сравнение', code:'const age = "18";\nif (age === 18) {\n  console.log("Можно");\n}', answers:['Сравнение строгое, а типы разные','У if неправильный синтаксис','console.log нельзя писать внутри if'], correct:0, why:'=== сравнивает и значение, и тип. Преобразуй age через Number(age) либо сравнивай со строкой "18".' },
    { title:'Очистка ввода', code:'if (input.value.trim === "") {\n  showError();\n}', answers:['trim нужно вызвать со скобками','У input нет value','Нужен одиночный ='], correct:0, why:'trim — функция. trim означает саму функцию, а trim() возвращает очищенную строку.' },
    { title:'CSS-селектор', code:'.body.dark .count {\n  color: white;\n}', answers:['body — тег, а не класс','dark нельзя использовать классом','У color нужны скобки'], correct:0, why:'Пиши body.dark, когда класс dark находится на самом элементе body.' },
    { title:'Обработчик события', code:'button.addEventListener("click", handleClick());', answers:['Функция запускается сразу','click нужно заменить на onclick','Обработчик обязан быть async'], correct:0, why:'Передай функцию: handleClick. Скобки вызывают её сразу и передают результат вызова.' },
    { title:'Рендер массива', code:'items.map(item => {\n  `<li>${item}</li>`;\n});', answers:['Callback ничего не возвращает','В шаблонной строке нельзя писать li','map работает только с числами'], correct:0, why:'Если есть фигурные скобки, нужен явный return. Либо убери скобки у стрелочной функции.' },
    { title:'Ошибка fetch', code:'const data = await response.json();\nif (!response.ok) throw new Error(data.message);', answers:['Нужно обработать response.ok и состояние ошибки','await здесь запрещён','Перед Error нельзя писать new'], correct:0, why:'Главное — проверить !response.ok, поймать ошибку через try/catch и показать понятное состояние в интерфейсе.' }
  ];

  function dailyChallenge() {
    const seed = Number(todayKey().replaceAll('-', ''));
    return challenges[seed % challenges.length];
  }

  function currentStreak() {
    const activity = readJson(KEYS.activity, {});
    let streak = 0;
    const date = new Date();
    for (let index = 0; index < 365; index += 1) {
      const key = date.toISOString().slice(0, 10);
      if (Number(activity[key] || 0) > 0) streak += 1;
      else if (index > 0 || key !== todayKey()) break;
      date.setDate(date.getDate() - 1);
    }
    return streak;
  }

  function dueReviews() {
    const store = readJson(KEYS.review, {});
    const now = Date.now();
    return Object.values(store).filter(item => Number(item.due || 0) <= now).length;
  }

  function recordWeakPoint(payload) {
    if (!payload || !payload.id) return;
    const store = readJson(KEYS.weak, {});
    const current = store[payload.id] || {
      id:payload.id,
      section:payload.section || 'js',
      title:payload.title || payload.id,
      attempts:0,
      misses:0,
      successes:0,
      score:0
    };
    current.section = payload.section || current.section;
    current.title = payload.title || current.title;
    current.source = payload.source || current.source || 'practice';
    current.attempts += 1;
    if (payload.success) current.successes += 1;
    else current.misses += 1;
    current.score = Math.max(0, current.misses * 2 - current.successes);
    current.updatedAt = Date.now();
    store[payload.id] = current;
    writeJson(KEYS.weak, store);
  }

  function openLessonById(id, sectionHint) {
    closePage();
    let block = document.getElementById(id);
    let sectionId = sectionHint || '';
    if (!block) {
      const match = String(id || '').match(/^(.+)-(\d+)$/);
      if (match) {
        const candidateSection = match[1];
        const candidate = document.querySelectorAll('#sec-' + CSS.escape(candidateSection) + ' > .block')[Number(match[2])] || null;
        if (candidate) {
          sectionId = candidateSection;
          block = candidate;
        }
      }
    }
    if (!sectionId && block) sectionId = block.closest('.section')?.id.replace('sec-', '') || '';
    if (sectionId) openSection(sectionId);
    if (block) setTimeout(() => block.scrollIntoView({ behavior:'smooth', block:'start' }), 140);
  }

  function formatLocalDate(timestamp) {
    return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ru', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(timestamp));
  }

  function activityMarkup() {
    const activity = readJson(KEYS.activity, {});
    const cells = [];
    for (let day = 55; day >= 0; day -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const key = date.toISOString().slice(0, 10);
      const count = Number(activity[key] || 0);
      cells.push('<span data-level="' + Math.min(3, count) + '" title="' + key + ': ' + count + '"></span>');
    }
    return cells.join('');
  }

  function dashboardPage() {
    const stats = progressStats();
    const focus = readJson(KEYS.focus, { totalMinutes: 0, sessions: [] });
    const challengeState = readJson(KEYS.challenge, {});
    const challenge = dailyChallenge();
    const sectionIds = ['html','css','js','ts','react','electron','git','node','sql','devops','linux','pg','vite','python','csharp'];
    const courseRows = sectionIds.map(id => {
      const p = sectionProgress(id);
      const labels = { html:'HTML', css:'CSS', js:'JavaScript', ts:'TypeScript', react:'React', electron:'Electron', git:'Git', node:'Node.js', sql:'SQL', devops:'Servers', linux:'Linux', pg:'PostgreSQL', vite:'Vite', python:'Python', csharp:'C#' };
      return '<div class="wdgf-course-row"><span>' + labels[id] + '</span><div class="wdgf-course-track"><div class="wdgf-course-fill" style="width:' + p.pct + '%"></div></div><output>' + p.pct + '%</output></div>';
    }).join('');
    const quick = [
      ['debug','tabler:bug',t.debug,isEnglish ? 'Find real mistakes in code' : 'Ищи реальные ошибки в коде'],
      ['review','tabler:brain',t.review,isEnglish ? 'Repeat what is due today' : 'Повтори то, что пора вспомнить'],
      ['skills','tabler:route',t.skills,isEnglish ? 'See your next technical step' : 'Увидь следующий технический шаг'],
      ['profile','tabler:user-code',t.profile,isEnglish ? 'Portfolio stored in the browser' : 'Портфолио в этом браузере'],
      ['focus','tabler:focus-2',t.focusMode,isEnglish ? 'Remove distractions for 25 minutes' : 'Убери отвлечения на 25 минут'],
      ['diary','tabler:notebook',t.diary,isEnglish ? 'Keep the result of each session' : 'Зафиксируй результат каждого занятия'],
      ['weak','tabler:activity-heartbeat',t.weak,isEnglish ? 'Practice topics with repeated mistakes' : 'Повтори темы с повторяющимися ошибками']
    ];
    const body = '<div class="wdgf-stat-grid">' +
      stat(t.progress, stats.pct + '%', stats.done + ' / ' + stats.all, 'tabler:chart-donut-3') +
      stat(t.completed, String(stats.done), isEnglish ? 'learning checks' : 'учебных пунктов', 'tabler:circle-check') +
      stat(t.focus, String(focus.totalMinutes || 0), t.minutes, 'tabler:clock') +
      stat(t.streak, String(currentStreak()), isEnglish ? 'days' : 'дней', 'tabler:flame') +
      stat(t.reviewReady, String(dueReviews()), isEnglish ? 'cards' : 'карточек', 'tabler:brain') + '</div>' +
      '<div class="wdgf-dashboard-grid"><div class="wdgf-panel"><div class="wdgf-panel-head"><h2>' + t.courses + '</h2><button class="wdgf-btn" data-open-feature="skills">' + t.skills + '</button></div><div class="wdgf-panel-body"><div class="wdgf-course-list">' + courseRows + '</div></div></div>' +
      '<div class="wdgf-panel"><div class="wdgf-panel-head"><h2>' + t.quick + '</h2></div><div class="wdgf-panel-body"><div class="wdgf-quick-grid">' + quick.map(item => '<button class="wdgf-quick" data-open-feature="' + item[0] + '">' + icon(item[1],18) + '<strong>' + item[2] + '</strong><span>' + item[3] + '</span></button>').join('') + '</div></div></div>' +
      '<div class="wdgf-panel"><div class="wdgf-panel-head"><h2>' + t.activity + '</h2><span class="wdgf-chip">8 ' + (isEnglish ? 'weeks' : 'недель') + '</span></div><div class="wdgf-panel-body"><div class="wdgf-activity">' + activityMarkup() + '</div></div></div>' +
      '<div class="wdgf-panel"><div class="wdgf-panel-head"><h2>' + t.today + '</h2><span class="wdgf-chip">' + challenge[1] + '</span></div><div class="wdgf-panel-body"><div class="wdgf-challenge"><div class="wdgf-challenge-title">' + challenge[0] + '</div><p>' + challenge[2] + '</p><button class="wdgf-btn ' + (challengeState[todayKey()] ? 'good' : 'primary') + '" data-challenge-done>' + (challengeState[todayKey()] ? t.challengeComplete : t.challengeDone) + '</button></div></div></div></div>';
    const page = pageShell('dashboard', t.dashboard, t.dashboardSub, body);
    bindFeatureLinks(page);
    page.querySelector('[data-challenge-done]').addEventListener('click', event => {
      const value = readJson(KEYS.challenge, {});
      value[todayKey()] = true;
      writeJson(KEYS.challenge, value);
      logActivity(2);
      event.currentTarget.textContent = t.challengeComplete;
      event.currentTarget.classList.remove('primary');
      event.currentTarget.classList.add('good');
    });
    return page;
  }

  function stat(label, value, detail, iconName) {
    return '<div class="wdgf-stat"><div class="wdgf-stat-top"><span>' + label + '</span>' + icon(iconName,18) + '</div><strong>' + value + '</strong><small>' + detail + '</small></div>';
  }

  function bindFeatureLinks(root) {
    root.querySelectorAll('[data-open-feature]').forEach(button => button.addEventListener('click', () => openFeature(button.dataset.openFeature)));
  }

  function debugPage(index) {
    index = Math.max(0, Math.min(debugData.length - 1, Number(index || 0)));
    const completed = readJson(KEYS.debug, {});
    const item = debugData[index];
    const body = '<div class="wdgf-debug-layout"><div><div class="wdgf-actions" style="margin:20px 0 10px"><span class="wdgf-chip">' + (index + 1) + ' / ' + debugData.length + '</span><span class="wdgf-chip">' + item.title + '</span></div><pre class="wdgf-code">' + escapeHtml(item.code) + '</pre></div>' +
      '<aside class="wdgf-panel" style="margin-top:20px"><div class="wdgf-panel-head"><h2>' + (isEnglish ? 'What is wrong?' : 'Что здесь не так?') + '</h2></div><div class="wdgf-panel-body"><div class="wdgf-answer-list">' + item.answers.map((answer, answerIndex) => '<button class="wdgf-answer" data-debug-answer="' + answerIndex + '">' + escapeHtml(answer) + '</button>').join('') + '</div><div class="wdgf-result" data-debug-result></div></div><div class="wdgf-panel-body" style="border-top:1px solid var(--wdgf-border)"><div class="wdgf-actions"><button class="wdgf-btn" data-debug-prev ' + (index === 0 ? 'disabled' : '') + '>' + icon('tabler:arrow-left',15) + '</button><button class="wdgf-btn primary" data-debug-next>' + (index === debugData.length - 1 ? t.reset : (isEnglish ? 'Next bug' : 'Следующая ошибка')) + ' ' + icon('tabler:arrow-right',15) + '</button></div></div></aside></div>';
    const page = pageShell('debug', t.debug, t.debugSub, body);
    page.querySelectorAll('[data-debug-answer]').forEach(button => button.addEventListener('click', () => {
      const answerIndex = Number(button.dataset.debugAnswer);
      page.querySelectorAll('[data-debug-answer]').forEach((answer, i) => {
        answer.classList.remove('correct', 'wrong');
        if (i === item.correct) answer.classList.add('correct');
        else if (i === answerIndex) answer.classList.add('wrong');
      });
      page.querySelector('[data-debug-result]').textContent = item.why;
      recordWeakPoint({
        id:'debug-' + index,
        section:'js',
        title:item.title,
        source:'debug',
        success:answerIndex === item.correct
      });
      if (answerIndex === item.correct && !completed[index]) {
        completed[index] = true;
        writeJson(KEYS.debug, completed);
        logActivity(1);
      }
    }));
    page.querySelector('[data-debug-prev]').addEventListener('click', () => showPage('debug', () => debugPage(index - 1)));
    page.querySelector('[data-debug-next]').addEventListener('click', () => showPage('debug', () => debugPage(index === debugData.length - 1 ? 0 : index + 1)));
    return page;
  }

  function collectReviewCards() {
    const cards = [];
    document.querySelectorAll('.section').forEach(section => {
      const sectionName = section.id.replace('sec-', '');
      section.querySelectorAll(':scope > .block').forEach((block, index) => {
        const titleNode = block.querySelector('.block-title, h3, h2');
        const checked = block.querySelector('.prog-cb:checked');
        if (!titleNode || (!checked && cards.length > 90)) return;
        const title = titleNode.cloneNode(true);
        title.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions').forEach(node => node.remove());
        const answerNode = block.querySelector('.tip, .explain, .code');
        const answer = (answerNode?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 420);
        if (answer) cards.push({ id: sectionName + '-' + index, section: sectionName, title: title.textContent.trim(), answer });
      });
    });
    return cards;
  }

  function reviewPage() {
    const cards = collectReviewCards();
    const store = readJson(KEYS.review, {});
    const now = Date.now();
    let due = cards.filter(card => !store[card.id] || Number(store[card.id].due || 0) <= now);
    if (!due.length) due = cards.slice(0, 1);
    const card = due[0];
    const body = card ? '<div class="wdgf-review-card"><div class="wdgf-review-front"><div><span class="wdgf-chip">' + escapeHtml(card.section.toUpperCase()) + '</span><h2>' + escapeHtml(card.title) + '</h2><p>' + (isEnglish ? 'Explain this topic in your own words before opening the answer.' : 'Объясни тему своими словами до открытия ответа.') + '</p><button class="wdgf-btn primary" style="margin-top:18px" data-review-show>' + t.showAnswer + '</button></div></div><div class="wdgf-review-answer wdgf-hidden" data-review-answer><strong>' + t.answer + '</strong><p>' + escapeHtml(card.answer) + '</p></div><div class="wdgf-review-actions wdgf-hidden" data-review-actions><button class="wdgf-btn danger" data-review-rate="0">' + t.again + '</button><button class="wdgf-btn" data-review-rate="1">' + t.hard + '</button><button class="wdgf-btn good" data-review-rate="3">' + t.good + '</button></div></div>' : '<div class="wdgf-empty">' + (isEnglish ? 'Complete a few learning checks first.' : 'Сначала отметь несколько учебных пунктов.') + '</div>';
    const page = pageShell('review', t.review, t.reviewSub, body);
    if (!card) return page;
    page.querySelector('[data-review-show]').addEventListener('click', () => {
      page.querySelector('[data-review-answer]').classList.remove('wdgf-hidden');
      page.querySelector('[data-review-actions]').classList.remove('wdgf-hidden');
    });
    page.querySelectorAll('[data-review-rate]').forEach(button => button.addEventListener('click', () => {
      const rating = Number(button.dataset.reviewRate);
      const old = store[card.id] || { interval: 0 };
      const intervals = rating === 0 ? 10 / 1440 : rating === 1 ? Math.max(1, old.interval || 1) : Math.max(2, (old.interval || 1) * 2.2);
      store[card.id] = { due: Date.now() + intervals * 86400000, interval: intervals, updatedAt: Date.now() };
      writeJson(KEYS.review, store);
      recordWeakPoint({ id:card.id, section:card.section, title:card.title, source:'review', success:rating === 3 });
      logActivity(1);
      refreshReviewReminder();
      showPage('review', reviewPage);
    }));
    return page;
  }

  function skillsPage() {
    const nodes = [
      ['html','HTML','tabler:brand-html5'],['css','CSS','tabler:brand-css3'],['js','JavaScript','tabler:brand-javascript'],['git','Git','tabler:brand-git'],['playground','Practice','tabler:code'],
      ['ts','TypeScript','tabler:brand-typescript'],['react','React','tabler:brand-react'],['vite','Vite','tabler:bolt'],['node','Node.js','tabler:brand-nodejs'],['sql','SQL','tabler:database'],
      ['pg','PostgreSQL','tabler:database-cog'],['devops','Servers','tabler:server'],['linux','Linux','tabler:terminal-2'],['electron','Electron','tabler:device-desktop-code'],['python','Python','tabler:brand-python'],['csharp','C#','tabler:brand-c-sharp'],['github','GitHub','tabler:brand-github'],['career','Portfolio','tabler:briefcase']
    ];
    const body = '<div class="wdgf-skill-map">' + nodes.map(node => {
      const p = sectionProgress(node[0]);
      const level = p.pct >= 80 ? 'done' : p.pct > 0 ? 'active' : 'next';
      return '<button class="wdgf-skill-node" data-skill-section="' + node[0] + '" data-level="' + level + '">' + icon(node[2],20) + '<strong>' + node[1] + '</strong><span>' + p.done + ' / ' + p.all + ' · ' + p.pct + '%</span></button>';
    }).join('') + '</div>';
    const page = pageShell('skills', t.skills, t.skillsSub, body);
    page.querySelectorAll('[data-skill-section]').forEach(button => button.addEventListener('click', () => openSection(button.dataset.skillSection)));
    return page;
  }

  function diaryPage() {
    const entries = readJson(KEYS.diary, []).slice().sort((a,b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    const list = entries.length ? entries.map(entry =>
      '<article class="wdgf-diary-entry"><header><div><strong>' + escapeHtml(formatLocalDate(entry.createdAt)) + '</strong><span class="wdgf-chip">' + escapeHtml(entry.section || 'Frontend') + '</span></div><span class="wdgf-diary-mood" title="' + t.mood + '">' + '●'.repeat(Math.max(1, Math.min(5, Number(entry.mood || 3)))) + '</span></header>' +
      '<div class="wdgf-diary-copy"><div><b>' + t.learned + '</b><p>' + escapeHtml(entry.learned) + '</p></div>' +
      (entry.difficult ? '<div><b>' + t.difficult + '</b><p>' + escapeHtml(entry.difficult) + '</p></div>' : '') +
      (entry.next ? '<div><b>' + t.nextStep + '</b><p>' + escapeHtml(entry.next) + '</p></div>' : '') + '</div>' +
      '<footer><button class="wdgf-btn danger" type="button" data-diary-remove="' + escapeHtml(entry.id) + '">' + t.deleteEntry + '</button></footer></article>'
    ).join('') : '<div class="wdgf-empty">' + t.noDiary + '</div>';

    const body = '<div class="wdgf-diary-layout"><form class="wdgf-panel wdgf-diary-form" data-diary-form><div class="wdgf-panel-head"><h2>' + t.addEntry + '</h2><span class="wdgf-chip">' + t.localOnly + '</span></div><div class="wdgf-panel-body wdgf-form">' +
      '<div class="wdgf-field"><label>' + t.learned + '</label><textarea class="wdgf-textarea" name="learned" maxlength="700" required></textarea></div>' +
      '<div class="wdgf-field"><label>' + t.difficult + '</label><textarea class="wdgf-textarea" name="difficult" maxlength="500"></textarea></div>' +
      '<div class="wdgf-field"><label>' + t.nextStep + '</label><input class="wdgf-input" name="next" maxlength="240"></div>' +
      '<div class="wdgf-diary-meta"><div class="wdgf-field"><label>' + t.section + '</label><select class="wdgf-select" name="section"><option>HTML</option><option>CSS</option><option selected>JavaScript</option><option>TypeScript</option><option>React</option><option>Git</option><option>Other</option></select></div>' +
      '<div class="wdgf-field"><label>' + t.mood + '</label><select class="wdgf-select" name="mood"><option value="1">1 / 5</option><option value="2">2 / 5</option><option value="3" selected>3 / 5</option><option value="4">4 / 5</option><option value="5">5 / 5</option></select></div></div>' +
      '<button class="wdgf-btn primary" type="submit">' + icon('tabler:plus',16) + ' ' + t.addEntry + '</button></div></form><section class="wdgf-diary-list">' + list + '</section></div>';

    const page = pageShell('diary', t.diary, t.diarySub, body);
    page.querySelector('[data-diary-form]').addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const learned = String(form.get('learned') || '').trim();
      if (!learned) return;
      const current = readJson(KEYS.diary, []);
      current.unshift({
        id:'entry-' + Date.now() + '-' + Math.random().toString(16).slice(2,7),
        createdAt:Date.now(),
        learned,
        difficult:String(form.get('difficult') || '').trim(),
        next:String(form.get('next') || '').trim(),
        section:String(form.get('section') || 'Frontend'),
        mood:Number(form.get('mood') || 3)
      });
      writeJson(KEYS.diary, current.slice(0, 300));
      logActivity(1);
      showPage('diary', diaryPage);
    });
    page.querySelectorAll('[data-diary-remove]').forEach(button => button.addEventListener('click', () => {
      const current = readJson(KEYS.diary, []).filter(entry => entry.id !== button.dataset.diaryRemove);
      writeJson(KEYS.diary, current);
      showPage('diary', diaryPage);
    }));
    return page;
  }

  function weakPage() {
    const store = readJson(KEYS.weak, {});
    const items = Object.values(store)
      .filter(item => Number(item.score || 0) > 0)
      .sort((a,b) => Number(b.score || 0) - Number(a.score || 0) || Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
    const maxScore = Math.max(1, ...items.map(item => Number(item.score || 0)));
    const body = items.length ? '<div class="wdgf-weak-list">' + items.map(item => {
      const width = Math.max(8, Math.round(Number(item.score || 0) / maxScore * 100));
      return '<article class="wdgf-weak-item"><div class="wdgf-weak-main"><div class="wdgf-actions"><span class="wdgf-chip">' + escapeHtml(String(item.section || 'JS').toUpperCase()) + '</span><span class="wdgf-chip">' + Number(item.attempts || 0) + ' ' + t.attempts + '</span></div><h3>' + escapeHtml(item.title) + '</h3><div class="wdgf-weak-meter"><span style="width:' + width + '%"></span></div><small>' + t.lastSeen + ': ' + escapeHtml(formatLocalDate(item.updatedAt || Date.now())) + '</small></div><div class="wdgf-weak-actions"><button class="wdgf-btn primary" type="button" data-weak-open="' + escapeHtml(item.id) + '" data-weak-section="' + escapeHtml(item.section || '') + '">' + t.openTopic + '</button><button class="wdgf-btn" type="button" data-weak-practiced="' + escapeHtml(item.id) + '">' + t.done + '</button></div></article>';
    }).join('') + '</div>' : '<div class="wdgf-empty">' + t.noWeak + '</div>';

    const page = pageShell('weak', t.weak, t.weakSub, body);
    page.querySelectorAll('[data-weak-open]').forEach(button => button.addEventListener('click', () => openLessonById(button.dataset.weakOpen, button.dataset.weakSection)));
    page.querySelectorAll('[data-weak-practiced]').forEach(button => button.addEventListener('click', () => {
      const current = readJson(KEYS.weak, {});
      const item = current[button.dataset.weakPracticed];
      if (item) {
        item.successes = Number(item.successes || 0) + 1;
        item.score = Math.max(0, Number(item.score || 0) - 1);
        item.updatedAt = Date.now();
        writeJson(KEYS.weak, current);
        logActivity(1);
      }
      showPage('weak', weakPage);
    }));
    return page;
  }

  function profilePage() {
    const profile = readJson(KEYS.profile, { name:'', role:isEnglish ? 'Frontend learner' : 'Frontend-разработчик', bio:'', stack:'HTML, CSS, JavaScript', avatar:'' });
    const portfolio = readJson(KEYS.portfolio, []);
    const initials = (profile.name || 'WG').split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase();
    const avatar = profile.avatar ? '<img src="' + profile.avatar + '" alt="">' : escapeHtml(initials);
    const body = '<div class="wdgf-profile-layout"><aside class="wdgf-panel"><div class="wdgf-panel-body"><div class="wdgf-avatar" data-avatar-preview>' + avatar + '</div><div class="wdgf-actions" style="margin-top:14px"><label class="wdgf-btn" for="wdgfAvatarInput">' + icon('tabler:photo-edit',15) + ' ' + t.avatar + '</label><input id="wdgfAvatarInput" type="file" accept="image/png,image/jpeg,image/webp" hidden><span class="wdgf-chip">' + t.localOnly + '</span></div><p style="color:var(--wdgf-muted);font-size:11px;line-height:1.5;margin-top:13px">' + t.profileSub + '</p></div></aside>' +
      '<div class="wdgf-panel"><div class="wdgf-panel-head"><h2>' + t.profile + '</h2></div><div class="wdgf-panel-body"><form class="wdgf-form" data-profile-form><div class="wdgf-field"><label>' + t.name + '</label><input class="wdgf-input" name="name" maxlength="50" value="' + escapeHtml(profile.name) + '"></div><div class="wdgf-field"><label>' + t.role + '</label><input class="wdgf-input" name="role" maxlength="70" value="' + escapeHtml(profile.role) + '"></div><div class="wdgf-field"><label>' + t.bio + '</label><textarea class="wdgf-textarea" name="bio" maxlength="400">' + escapeHtml(profile.bio) + '</textarea></div><div class="wdgf-field"><label>' + t.stack + '</label><input class="wdgf-input" name="stack" maxlength="160" value="' + escapeHtml(profile.stack) + '"></div><div class="wdgf-actions"><button class="wdgf-btn primary" type="submit">' + t.save + '</button><button class="wdgf-btn" type="button" data-export-portfolio>' + icon('tabler:file-download',15) + ' ' + t.exportPortfolio + '</button></div></form></div></div>' +
      '<div></div><div class="wdgf-panel"><div class="wdgf-panel-head"><h2>' + t.portfolio + '</h2><span class="wdgf-chip">' + portfolio.length + '</span></div><div class="wdgf-panel-body"><form class="wdgf-form" data-portfolio-form><div class="wdgf-field"><label>' + t.projectTitle + '</label><input class="wdgf-input" name="title" maxlength="80" required></div><div class="wdgf-field"><label>' + t.description + '</label><textarea class="wdgf-textarea" name="description" maxlength="500" required></textarea></div><div class="wdgf-field"><label>' + t.link + '</label><input class="wdgf-input" name="link" type="url" placeholder="https://"></div><div class="wdgf-field"><label>' + t.stack + '</label><input class="wdgf-input" name="stack" maxlength="120"></div><button class="wdgf-btn" type="submit">' + icon('tabler:plus',15) + ' ' + t.addProject + '</button></form><div class="wdgf-portfolio-list" style="margin-top:16px">' + (portfolio.length ? portfolio.map((item,index) => '<article class="wdgf-portfolio-item"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.description) + '</p><footer><span class="wdgf-chip">' + escapeHtml(item.stack || 'Web') + '</span><button class="wdgf-btn danger" data-portfolio-remove="' + index + '">' + t.remove + '</button></footer></article>').join('') : '<div class="wdgf-empty">' + (isEnglish ? 'Add your first project.' : 'Добавь первый проект.') + '</div>') + '</div></div></div></div>';
    const page = pageShell('profile', t.profile, t.profileSub, body);
    page.querySelector('[data-profile-form]').addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const current = readJson(KEYS.profile, profile);
      ['name','role','bio','stack'].forEach(key => current[key] = String(form.get(key) || '').trim());
      writeJson(KEYS.profile, current);
      notify(t.profileSaved);
      refreshProfileNav();
    });
    page.querySelector('#wdgfAvatarInput').addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) return notify(t.imageTooLarge);
      const dataUrl = await compressAvatar(file);
      const current = readJson(KEYS.profile, profile);
      current.avatar = dataUrl;
      writeJson(KEYS.profile, current);
      showPage('profile', profilePage);
      refreshProfileNav();
    });
    page.querySelector('[data-portfolio-form]').addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const list = readJson(KEYS.portfolio, []);
      list.unshift({ title:String(form.get('title') || '').trim(), description:String(form.get('description') || '').trim(), link:safeUrl(form.get('link')), stack:String(form.get('stack') || '').trim(), createdAt:Date.now() });
      writeJson(KEYS.portfolio, list.slice(0, 30));
      logActivity(1);
      showPage('profile', profilePage);
    });
    page.querySelectorAll('[data-portfolio-remove]').forEach(button => button.addEventListener('click', () => {
      const list = readJson(KEYS.portfolio, []);
      list.splice(Number(button.dataset.portfolioRemove), 1);
      writeJson(KEYS.portfolio, list);
      showPage('profile', profilePage);
    }));
    page.querySelector('[data-export-portfolio]').addEventListener('click', exportPortfolio);
    return page;
  }

  function safeUrl(value) {
    const url = String(value || '').trim();
    return /^https?:\/\//i.test(url) ? url : '';
  }

  function compressAvatar(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const sx = (image.naturalWidth - side) / 2;
        const sy = (image.naturalHeight - side) / 2;
        ctx.drawImage(image, sx, sy, side, side, 0, 0, 256, 256);
        resolve(canvas.toDataURL('image/jpeg', .82));
        URL.revokeObjectURL(image.src);
      };
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });
  }

  function exportPortfolio() {
    const profile = readJson(KEYS.profile, {});
    const portfolio = readJson(KEYS.portfolio, []);
    const items = portfolio.map(item => '<article><div class="tags">' + escapeHtml(item.stack || 'Web') + '</div><h2>' + escapeHtml(item.title) + '</h2><p>' + escapeHtml(item.description) + '</p>' + (item.link ? '<a href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener">Open project</a>' : '') + '</article>').join('');
    const html = '<!doctype html><html lang="' + (isEnglish ? 'en' : 'ru') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(profile.name || 'Portfolio') + '</title><style>body{margin:0;background:#090d14;color:#eef3fb;font:16px/1.6 system-ui}main{width:min(980px,calc(100% - 32px));margin:auto;padding:64px 0}header{padding-bottom:32px;border-bottom:1px solid #273244}h1{font-size:42px;margin:0}header p{color:#9aa8bc;max-width:680px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:28px}article{border:1px solid #273244;padding:20px;border-radius:7px;background:#0d141f}article p{color:#aebace}.tags{color:#c084fc;font-size:12px}a{color:#d8b4fe}</style></head><body><main><header><h1>' + escapeHtml(profile.name || 'Portfolio') + '</h1><strong>' + escapeHtml(profile.role || '') + '</strong><p>' + escapeHtml(profile.bio || '') + '</p><div class="tags">' + escapeHtml(profile.stack || '') + '</div></header><section class="grid">' + items + '</section></main></body></html>';
    downloadBlob(html, 'portfolio.html', 'text/html');
  }

  function openFeature(id) {
    if (id === 'focus') return toggleFocusMode(true);
    const renderers = { dashboard:dashboardPage, debug:() => debugPage(0), review:reviewPage, skills:skillsPage, profile:profilePage, diary:diaryPage, weak:weakPage };
    const extension = extensionFeatures.get(id);
    const renderer = extension?.renderer || renderers[id];
    if (renderer) showPage(id, renderer);
  }

  function registerFeature(id, renderer, meta) {
    if (!id || typeof renderer !== 'function') return;
    extensionFeatures.set(id, { renderer, meta: meta || {} });
  }

  function invalidateFeature(id) {
    const page = pages.get(id);
    if (!page || page.classList.contains('open')) return false;
    page.remove();
    pages.delete(id);
    return true;
  }

  function refreshFeature(id) {
    const renderers = { dashboard:dashboardPage, debug:() => debugPage(0), review:reviewPage, skills:skillsPage, profile:profilePage, diary:diaryPage, weak:weakPage };
    const renderer = extensionFeatures.get(id)?.renderer || renderers[id];
    const page = pages.get(id);
    if (!page || typeof renderer !== 'function') return false;
    const wasOpen = page.classList.contains('open');
    const scrollTop = page.scrollTop;
    renderer();
    if (wasOpen) {
      page.classList.add('open');
      page.scrollTop = scrollTop;
    }
    return true;
  }

  function addNavigationLabels() {
    document.querySelectorAll('.wdg-nav-btn').forEach(button => {
      const label = button.querySelector('span:last-child')?.textContent?.trim();
      if (label) {
        button.setAttribute('aria-label', label);
        button.title = label;
      }
    });
  }
  function buildSidebarFeatures() {
    const nav = document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById('wdgfDashboardBtn')) return;
    const dashboard = document.createElement('button');
    dashboard.className = 'wdg-nav-btn';
    dashboard.id = 'wdgfDashboardBtn';
    dashboard.type = 'button';
    dashboard.dataset.wdgFeature = 'dashboard';
    dashboard.innerHTML = icon('tabler:layout-dashboard',19) + '<span>' + t.dashboard + '</span>';
    dashboard.addEventListener('click', () => openFeature('dashboard'));
    nav.prepend(dashboard);

    const profile = document.createElement('button');
    profile.className = 'wdg-nav-btn';
    profile.id = 'wdgfProfileBtn';
    profile.type = 'button';
    profile.dataset.wdgFeature = 'profile';
    profile.innerHTML = '<span class="wdgf-nav-avatar">WG</span><span>' + t.profile + '</span>';
    profile.addEventListener('click', () => openFeature('profile'));
    nav.append(profile);
    refreshProfileNav();
  }

  function refreshProfileNav() {
    const button = document.getElementById('wdgfProfileBtn');
    if (!button) return;
    const profile = readJson(KEYS.profile, {});
    const avatar = button.querySelector('.wdgf-nav-avatar');
    if (profile.avatar) avatar.innerHTML = '<img src="' + profile.avatar + '" alt="">';
    else avatar.textContent = (profile.name || 'WG').split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase();
  }

  function buildTopFeatures() {
    const bar = document.querySelector('.wdg-commandbar');
    const search = document.getElementById('wdgSearchBtn');
    if (!bar || !search || document.getElementById('wdgfCommandBtn')) return;
    const command = document.createElement('button');
    command.className = 'wdg-icon-btn';
    command.id = 'wdgfCommandBtn';
    command.type = 'button';
    command.title = t.command + ' · Ctrl K';
    command.innerHTML = icon('tabler:command',18);
    command.addEventListener('click', openCommandPalette);
    search.before(command);

    const focus = document.createElement('button');
    focus.className = 'wdg-icon-btn';
    focus.id = 'wdgfFocusBtn';
    focus.type = 'button';
    focus.title = t.focusMode;
    focus.innerHTML = icon('tabler:focus-2',18);
    focus.addEventListener('click', () => toggleFocusMode(true));
    search.before(focus);

    const review = document.createElement('button');
    review.className = 'wdg-icon-btn wdgf-review-reminder';
    review.id = 'wdgfReviewBtn';
    review.type = 'button';
    review.addEventListener('click', () => openFeature('review'));
    search.before(review);
    refreshReviewReminder();
  }

  function refreshReviewReminder() {
    const button = document.getElementById('wdgfReviewBtn');
    if (!button) return;
    const count = dueReviews();
    button.title = count ? t.reviewReady + ': ' + count : t.review;
    button.innerHTML = icon('tabler:brain',18) + (count ? '<span>' + Math.min(99, count) + '</span>' : '');
    button.classList.toggle('has-due', count > 0);
  }

  function buildFocusBar() {
    if (document.getElementById('wdgfFocusBar')) return;
    const bar = document.createElement('div');
    bar.className = 'wdgf-focus-bar';
    bar.id = 'wdgfFocusBar';
    bar.innerHTML = icon('tabler:focus-2',18) + '<div><div class="wdgf-focus-time" data-focus-time>25:00</div><div class="wdgf-focus-label">' + t.focusMode + '</div></div><button class="wdgf-btn primary" data-focus-toggle>' + t.start + '</button><button class="wdgf-icon-btn" data-focus-stop title="' + t.finish + '">' + icon('tabler:x',17) + '</button>';
    document.body.appendChild(bar);
    bar.querySelector('[data-focus-toggle]').addEventListener('click', toggleFocusRunning);
    bar.querySelector('[data-focus-stop]').addEventListener('click', finishFocus);
  }

  function toggleFocusMode(open) {
    buildFocusBar();
    if (open) {
      document.body.classList.add('wdgf-focus-mode');
      document.getElementById('wdgfFocusBar').classList.add('open');
      closePage();
    } else finishFocus();
  }

  function toggleFocusRunning() {
    focusRunning = !focusRunning;
    const button = document.querySelector('[data-focus-toggle]');
    button.textContent = focusRunning ? t.pause : t.start;
    if (focusRunning) {
      focusTimer = setInterval(() => {
        focusLeft -= 1;
        renderFocusTime();
        if (focusLeft <= 0) finishFocus(true);
      }, 1000);
    } else clearInterval(focusTimer);
  }

  function renderFocusTime() {
    const minutes = Math.floor(Math.max(0, focusLeft) / 60);
    const seconds = Math.max(0, focusLeft) % 60;
    const node = document.querySelector('[data-focus-time]');
    if (node) node.textContent = String(minutes).padStart(2,'0') + ':' + String(seconds).padStart(2,'0');
  }

  function finishFocus(completed) {
    clearInterval(focusTimer);
    const spent = Math.max(0, Math.round((25 * 60 - focusLeft) / 60));
    if (spent > 0 || completed) {
      const data = readJson(KEYS.focus, { totalMinutes:0, sessions:[] });
      data.totalMinutes = Number(data.totalMinutes || 0) + (completed ? 25 : spent);
      data.sessions.push({ date:new Date().toISOString(), minutes:completed ? 25 : spent });
      data.sessions = data.sessions.slice(-100);
      writeJson(KEYS.focus, data);
      logActivity(2);
    }
    focusLeft = 25 * 60;
    focusRunning = false;
    document.body.classList.remove('wdgf-focus-mode');
    document.getElementById('wdgfFocusBar')?.classList.remove('open');
    renderFocusTime();
  }

  function normalizeCommandText(value) {
    return String(value || '')
      .toLocaleLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^\p{L}\p{N}+#.]+/gu, ' ')
      .trim();
  }

  const commandAliasGroups = [
    ['function', 'functions', 'функц'],
    ['array', 'arrays', 'массив'],
    ['event', 'events', 'событ'],
    ['string', 'strings', 'строк'],
    ['object', 'objects', 'объект'],
    ['variable', 'variables', 'переменн'],
    ['loop', 'loops', 'цикл'],
    ['promise', 'promises', 'промис'],
    ['storage', 'localstorage', 'хранилищ'],
    ['form', 'forms', 'форм']
  ];

  function commandSearchTerms(query) {
    const rawTerms = normalizeCommandText(query).split(' ').filter(term => term.length > 1);
    const terms = new Set(rawTerms);
    rawTerms.forEach(term => {
      commandAliasGroups.forEach(group => {
        if (group.some(alias => term.startsWith(alias) || alias.startsWith(term))) {
          group.forEach(alias => terms.add(alias));
        }
      });
    });
    return [...terms];
  }

  function commandMatchScore(entry, terms) {
    const title = normalizeCommandText(entry[1]);
    const group = normalizeCommandText(entry[4]);
    const details = normalizeCommandText(entry[5]);
    const titleWords = title.split(' ');

    return terms.reduce((score, term) => {
      if (title === term) return score + 1000;
      if (title.startsWith(term)) return score + 760;
      if (titleWords.some(word => word.startsWith(term))) return score + 580;
      if (title.includes(term)) return score + 420;
      if (group.includes(term)) return score + 140;
      if (details.includes(term)) return score + 30;
      return score;
    }, 0);
  }

  function commandSource() {
    const entries = [
      ['dashboard',t.dashboard,'tabler:layout-dashboard',() => openFeature('dashboard'),t.action],
      ['focus',t.focusMode,'tabler:focus-2',() => openFeature('focus'),t.action],
      ['debug',t.debug,'tabler:bug',() => openFeature('debug'),t.action],
      ['review',t.review,'tabler:brain',() => openFeature('review'),t.action],
      ['skills',t.skills,'tabler:route',() => openFeature('skills'),t.action],
      ['profile',t.profile,'tabler:user-code',() => openFeature('profile'),t.action],
      ['diary',t.diary,'tabler:notebook',() => openFeature('diary'),t.action],
      ['weak',t.weak,'tabler:activity-heartbeat',() => openFeature('weak'),t.action],
      ['bookmarks',t.bookmarks,'tabler:bookmark',() => {
        closePage();
        if (typeof window.toggleBmFilter === 'function') window.toggleBmFilter();
      },t.action]
    ];
    const catalogCommandIds = new Set(['today', 'routes', 'lab', 'settings']);
    (window.WebDevGymNext?.catalog?.() || []).forEach(item => {
      if (!catalogCommandIds.has(item.id)) return;
      entries.push([
        'view-' + item.id,
        item.label,
        item.icon || 'tabler:apps',
        () => window.WebDevGymNext?.openCatalogItem?.(item.id),
        isEnglish ? 'WebDevGym page' : 'Страница WebDevGym',
        item.description || ''
      ]);
    });
    extensionFeatures.forEach((feature, id) => {
      const meta = feature.meta || {};
      entries.push([id, meta.title || id, meta.icon || 'tabler:apps', () => openFeature(id), meta.group || t.action]);
    });
    document.querySelectorAll('.tabs-nav .tab').forEach(tab => {
      const onclick = tab.getAttribute('onclick') || '';
      const match = onclick.match(/switchTab\('([^']+)'/);
      if (!match) return;
      const label = tab.textContent.replace(/\d+\/\d+/g,'').replace(/\s+/g,' ').trim();
      entries.push(['section-' + match[1], label, 'tabler:book-2', () => openSection(match[1]), t.section]);
    });
    document.querySelectorAll('.section > .block').forEach(block => {
      const titleNode = block.querySelector('.block-title');
      if (!titleNode) return;
      const clone = titleNode.cloneNode(true);
      clone.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions').forEach(node => node.remove());
      const label = clone.textContent.replace(/\s+/g,' ').trim();
      if (!label) return;
      entries.push(['lesson-' + entries.length, label, 'tabler:file-text', () => {
        closePage();
        const section = block.closest('.section');
        const id = section?.id.replace('sec-','');
        if (id) openSection(id);
        setTimeout(() => block.scrollIntoView({ behavior:'smooth', block:'start' }), 120);
      }, t.lesson, (block.textContent || '').replace(/\s+/g,' ').slice(0,1600)]);
    });
    const seen = new Set();
    return entries.filter(entry => {
      const id = String(entry[0]);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  function buildCommandPalette() {
    if (document.getElementById('wdgfPalette')) return;
    const backdrop = document.createElement('div');
    backdrop.className = 'wdgf-palette-backdrop';
    backdrop.id = 'wdgfPaletteBackdrop';
    const palette = document.createElement('section');
    palette.className = 'wdgf-palette';
    palette.id = 'wdgfPalette';
    palette.innerHTML = '<div class="wdgf-palette-search">' + icon('tabler:search',19) + '<input type="search" autocomplete="off" placeholder="' + t.command + '"><kbd>ESC</kbd></div><div class="wdgf-command-list" data-command-list></div>';
    document.body.append(backdrop, palette);
    backdrop.addEventListener('click', closeCommandPalette);
    const input = palette.querySelector('input');
    input.addEventListener('input', () => renderCommands(input.value));
    input.addEventListener('keydown', event => {
      const visible = Array.from(palette.querySelectorAll('.wdgf-command'));
      if (event.key === 'ArrowDown') { event.preventDefault(); commandIndex = Math.min(visible.length - 1, commandIndex + 1); paintCommandIndex(visible); }
      if (event.key === 'ArrowUp') { event.preventDefault(); commandIndex = Math.max(0, commandIndex - 1); paintCommandIndex(visible); }
      if (event.key === 'Enter') { event.preventDefault(); visible[commandIndex]?.click(); }
    });
  }

  function openCommandPalette() {
    buildCommandPalette();
    commandEntries = commandSource();
    commandIndex = 0;
    document.getElementById('wdgfPaletteBackdrop').classList.add('open');
    document.getElementById('wdgfPalette').classList.add('open');
    const input = document.querySelector('#wdgfPalette input');
    input.value = '';
    renderCommands('');
    setTimeout(() => input.focus(), 30);
  }

  function closeCommandPalette() {
    document.getElementById('wdgfPaletteBackdrop')?.classList.remove('open');
    document.getElementById('wdgfPalette')?.classList.remove('open');
  }

  function renderCommands(query) {
    const list = document.querySelector('[data-command-list]');
    if (!list) return;
    const terms = commandSearchTerms(query);
    const filtered = terms.length
      ? commandEntries
          .map((entry, order) => ({ entry, order, score:commandMatchScore(entry, terms) }))
          .filter(result => result.score > 0)
          .sort((a, b) => b.score - a.score || a.order - b.order)
          .slice(0, 12)
          .map(result => result.entry)
      : commandEntries.slice(0, 12);
    commandIndex = 0;
    list.innerHTML = filtered.length ? filtered.map((entry,index) => '<button class="wdgf-command ' + (index === 0 ? 'active' : '') + '" data-command-id="' + entry[0] + '"><span>' + icon(entry[2],17) + '</span><span>' + escapeHtml(entry[1]) + '</span><small>' + entry[4] + '</small></button>').join('') : '<div class="wdgf-empty">' + t.noResults + '</div>';
    list.querySelectorAll('[data-command-id]').forEach(button => button.addEventListener('click', () => {
      const entry = commandEntries.find(item => item[0] === button.dataset.commandId);
      closeCommandPalette();
      entry?.[3]();
    }));
  }

  function paintCommandIndex(items) {
    items.forEach((item,index) => item.classList.toggle('active', index === commandIndex));
    items[commandIndex]?.scrollIntoView({ block:'nearest' });
  }

  function enhanceNexus() {
    const section = document.getElementById('sec-nexus');
    if (!section || section.querySelector('.wdgf-nexus-tools')) return;
    const tools = document.createElement('div');
    tools.className = 'wdgf-nexus-tools';
    tools.style.cssText = 'display:flex;gap:8px;align-items:center;margin:0 0 12px;flex-wrap:wrap';
    tools.innerHTML = '<input class="wdgf-input" style="max-width:280px" type="search" placeholder="' + t.nexusSearch + '" data-nexus-filter><button class="wdgf-btn" data-nexus-new>' + icon('tabler:note',15) + ' ' + t.newNote + '</button><button class="wdgf-btn" data-open-feature="skills">' + icon('tabler:route',15) + ' ' + t.map + '</button>';
    const shell = section.querySelector('.nexus-shell, .wdg-graph-shell');
    (shell || section.firstElementChild)?.before(tools);
    tools.querySelector('[data-nexus-filter]').addEventListener('input', event => {
      const query = event.target.value.trim().toLowerCase();
      section.querySelectorAll('.wdg-graph-node,.nexus-note-item').forEach(node => node.classList.toggle('wdgf-hidden', query && !node.textContent.toLowerCase().includes(query)));
    });
    tools.querySelector('[data-nexus-new]').addEventListener('click', () => { if (typeof window.nexusNewNote === 'function') window.nexusNewNote(); });
    bindFeatureLinks(tools);
  }

  function safeExportKeys() {
    const safe = {};
    const prefixes = [
      'prog_','quiz_passed_','book_','note_','cb_','bm_',
      'wdg_','wdgl_','wdgn_','wdgr_','wdgp_',
      'webdevgym_','webdevgym_calendar','webdevgym_calendar_note','webdevgym_nexus'
    ];
    const sensitive = /(token|api.?key|secret|password|credential|vault)/i;
    Object.keys(localStorage).forEach(key => {
      if (sensitive.test(key) || key === 'wdg_recovery_v1') return;
      if (prefixes.some(prefix => key.startsWith(prefix)) || [
        'darkMode','theme','custom_css','customBgOpacity','customBgPosX','customBgPosY','customBgSize',
        'pomo_durations','clickSounds'
      ].includes(key)) safe[key] = localStorage.getItem(key);
    });
    return safe;
  }

  function downloadBlob(content, name, type) {
    const blob = new Blob([content], { type:type || 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function installImportExport() {
    window.exportProgressJson = function () {
      const backup = { app:'WebDevGym', version:61, exportedAt:new Date().toISOString(), storage:safeExportKeys() };
      downloadBlob(JSON.stringify(backup,null,2), 'webdevgym-backup-' + todayKey() + '.json', 'application/json');
      notify(t.exported);
    };
    window.importProgressJson = function () {
      document.dispatchEvent(new CustomEvent('webdevgym:before-import'));
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(String(reader.result || '{}'));
            if (data.app !== 'WebDevGym') throw new Error('bad file');
            if (data.storage && typeof data.storage === 'object') Object.entries(data.storage).forEach(([key,value]) => localStorage.setItem(key,String(value)));
            else {
              Object.entries(data.progress || {}).forEach(([pid,value]) => value === '1' ? localStorage.setItem('prog_' + pid,'1') : localStorage.removeItem('prog_' + pid));
              Object.entries(data.quizzes || {}).forEach(([id,value]) => value === '1' && localStorage.setItem('quiz_passed_' + id,'1'));
            }
            if (typeof window.restoreProgressCheckboxes === 'function') window.restoreProgressCheckboxes();
            document.dispatchEvent(new CustomEvent('webdevgym:progress-imported', { detail: { storage: data.storage || {} } }));
            notify(t.imported);
            refreshProfileNav();
            window.setTimeout(() => window.location.reload(), 180);
          } catch (error) { notify(isEnglish ? 'Invalid WebDevGym backup' : 'Это не резервная копия WebDevGym'); }
        };
        reader.readAsText(file);
      };
      input.click();
    };
  }

  function bindGlobalEvents() {
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopImmediatePropagation();
        openCommandPalette();
        return;
      }
      if (event.key === 'Escape') {
        closeCommandPalette();
        const openDialog = document.querySelector('dialog[open]');
        if (!openDialog && currentPage) closePage();
      }
    }, true);
    document.addEventListener('change', event => {
      if (event.target.matches('.prog-cb')) logActivity(event.target.checked ? 1 : -1);
    });
  }

  function init() {
    buildSidebarFeatures();
    addNavigationLabels();
    buildTopFeatures();
    repairSettingsButton();
    buildFocusBar();
    buildCommandPalette();
    installImportExport();
    enhanceNexus();
    bindGlobalEvents();
    window.WebDevGymFeatures = {
      open:openFeature,
      close:closePage,
      register:registerFeature,
      invalidate:invalidateFeature,
      refresh:refreshFeature,
      pageShell,
      openCommandPalette,
      logActivity,
      recordWeakPoint,
      refreshReviewReminder
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 40));
  else setTimeout(init, 40);
})();
