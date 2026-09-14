(() => {
  'use strict';

  const isEnglish = document.documentElement.lang === 'en';
  const copy = isEnglish ? {
    overview:'Overview', today:'Today', routes:'Routes', learning:'Learn', sections:'Catalog', trainers:'Trainers', forge:'Forge', playground:'Playground', nexus:'Nexus', calendar:'Calendar', profile:'Profile', settings:'Settings',
    system:'Workspace', growth:'Catalog', tools:'Tools', account:'Account', search:'Search or run a command...', import:'Import', export:'Export', route:'Your route', routeSub:'Continue where you left off', current:'Current route', learned:'completed',
    todayTitle:'Today', todaySub:'Priority actions', work:'In progress', workSub:'Current project and code', review:'Review', reviewSub:'Review queue', continue:'Continue', start:'Start', open:'Open', lesson:'Next', practice:'Practice', mini:'Micro task',
    lessonFallback:'Continue the active lesson', practiceFallback:'Complete one focused practice', miniFallback:'Fix a small interface bug', inspector:'Inspector', streak:'day streak', focus:'Focus', activity:'Recent activity', nextReview:'Next review', noProject:'Start your first project in Forge', loader:'Assembling your workspace',
    sectionsTitle:'Everything in WebDevGym', sectionsSub:'Learning paths, practice, projects and supporting tools in one searchable catalog.', frontendDesc:'Interfaces, browser logic, React and optional desktop apps.', backendDesc:'Server logic, databases, Linux and deployment.', shared:'Shared foundation', sharedDesc:'Git is useful in both routes.', languages:'Other languages', languagesDesc:'Optional backend directions that do not change your main route.', topics:'topics', choosePriority:'Make primary', priorityActive:'Primary route', openSection:'Open topic', catalogAll:'All features', catalogRoutes:'Learning paths', catalogTools:'Tools', toolsTitle:'Developer tools', toolsSub:'References, generators and supporting materials that complement the main workspaces.', aiAssistant:'AI assistant'
  } : {
    overview:'Обзор', today:'Сегодня', routes:'Маршруты', learning:'Обучение', sections:'Каталог', trainers:'Тренажёры', forge:'Forge', playground:'Playground', nexus:'Nexus', calendar:'Календарь', profile:'Профиль', settings:'Настройки',
    system:'Рабочее пространство', growth:'Каталог', tools:'Инструменты', account:'Профиль', search:'Поиск или команда...', import:'Импорт', export:'Экспорт', route:'Твой маршрут', routeSub:'Продолжай с того места, где остановился', current:'Текущий маршрут', learned:'изучено',
    todayTitle:'Сегодня', todaySub:'Приоритетные задачи', work:'В работе', workSub:'Текущий проект и код', review:'Повторение', reviewSub:'Очередь повторения', continue:'Продолжить', start:'Начать', open:'Открыть', lesson:'Дальше', practice:'Практика', mini:'Микро-задача',
    lessonFallback:'Продолжить активный урок', practiceFallback:'Пройти одну точечную практику', miniFallback:'Исправить небольшую ошибку интерфейса', inspector:'Инспектор', streak:'дней серия', focus:'Фокус', activity:'Недавняя активность', nextReview:'Следующее повторение', noProject:'Начни первый проект в Forge', loader:'Собираем твоё рабочее пространство',
    sectionsTitle:'Всё, что есть в WebDevGym', sectionsSub:'Обучение, практика, проекты и вспомогательные инструменты в одном каталоге с поиском.', frontendDesc:'Интерфейсы, логика браузера, React и необязательные desktop-приложения.', backendDesc:'Серверная логика, базы данных, Linux и развёртывание.', shared:'Общая основа', sharedDesc:'Git пригодится в обоих направлениях.', languages:'Другие языки', languagesDesc:'Необязательные backend-направления, которые не меняют основной маршрут.', topics:'тем', choosePriority:'Сделать основным', priorityActive:'Основной маршрут', openSection:'Открыть тему', catalogAll:'Все возможности', catalogRoutes:'Обучение', catalogTools:'Инструменты', toolsTitle:'Инструменты разработчика', toolsSub:'Справочники, генераторы и материалы, которые дополняют основные рабочие пространства.', aiAssistant:'ИИ-помощник'
  };

  const PRIORITY_KEY = 'wdgn_learning_priority_v1';
  const legacySectionSets = {
    frontend: [
      { id:'html', label:'HTML', short:'HTML' },
      { id:'css', label:'CSS', short:'CSS' },
      { id:'js', label:'JavaScript', short:'JS' },
      { id:'ts', label:'TypeScript', short:'TS' },
      { id:'react', label:'React', short:'R' }
    ],
    backend: [
      { id:'node', label:'Node.js', short:'NODE' },
      { id:'sql', label:'SQL', short:'SQL' },
      { id:'pg', label:'PostgreSQL', short:'PG' },
      { id:'linux', label:'Linux', short:'LNX' },
      { id:'devops', label:isEnglish ? 'Servers' : 'Серверы', short:'SRV' }
    ]
  };
  const routeExtras = [
    { id:'git', label:'Git & GitHub', short:'GIT' },
    { id:'vite', label:'Vite', short:'VITE' }
  ];
  const optionalLanguages = [
    { id:'python', label:'Python', short:'PY' },
    { id:'csharp', label:'C#', short:'C#' }
  ];
  const optionalFrontend = [
    { id:'electron', label:'Electron', short:'EL' }
  ];
  const sectionDefinitions = Object.fromEntries(
    [...legacySectionSets.frontend, ...legacySectionSets.backend, ...routeExtras, ...optionalLanguages, ...optionalFrontend]
      .map(section => [section.id, section])
  );
  const configuredRoutes = window.WebDevGymLearningPath?.routes || {
    frontend:['html', 'css', 'js', 'git', 'vite', 'ts', 'react'],
    backend:['js', 'git', 'node', 'sql', 'pg', 'linux', 'devops']
  };
  const sectionSets = Object.fromEntries(
    Object.entries(configuredRoutes).map(([routeId, ids]) => [
      routeId,
      ids.map(id => sectionDefinitions[id]).filter(Boolean)
    ])
  );
  const sectionCatalog = {
    frontend: ['html', 'css', 'js', 'vite', 'ts', 'react', 'electron'].map(id => sectionDefinitions[id]),
    backend: [...legacySectionSets.backend],
    shared: [
      sectionDefinitions.git
    ],
    languages: optionalLanguages
  };
  const sectionVisuals = {
    html:['tabler:brand-html5','#f97316'],
    css:['tabler:brand-css3','#38bdf8'],
    js:['tabler:brand-javascript','#facc15'],
    ts:['tabler:brand-typescript','#60a5fa'],
    react:['tabler:brand-react','#22d3ee'],
    vite:['tabler:bolt','#a78bfa'],
    node:['tabler:brand-nodejs','#4ade80'],
    sql:['tabler:database','#38bdf8'],
    pg:['tabler:database','#818cf8'],
    linux:['tabler:terminal-2','#fbbf24'],
    devops:['tabler:server-2','#fb7185'],
    git:['tabler:brand-git','#fb923c'],
    python:['tabler:brand-python','#60a5fa'],
    csharp:['tabler:brand-c-sharp','#c084fc'],
    electron:['tabler:device-desktop-code','#7dd3fc']
  };
  const priorityCopy = isEnglish ? {
    question:'What do you want to learn first?',
    description:'Choose a priority route. You can switch it later without losing progress.',
    frontend:'Frontend',
    frontendSub:'Interfaces, React and optional desktop apps',
    backend:'Backend',
    backendSub:'Servers, databases and Node.js',
    switcher:'Learning priority',
    saved:'Your progress in both routes stays saved',
    backendPractice:'Build one focused API route',
    backendMini:'Fix a small data-query bug',
    backendReviews:['SQL: filtering and sorting', 'Node.js: async flow', 'Linux: navigation and files']
  } : {
    question:'Что хочешь изучать в приоритете?',
    description:'Выбери основной маршрут. Его можно сменить позже без потери прогресса.',
    frontend:'Frontend',
    frontendSub:'Интерфейсы, React и необязательные desktop-приложения',
    backend:'Backend',
    backendSub:'Серверы, базы данных и Node.js',
    switcher:'Приоритет обучения',
    saved:'Прогресс обоих маршрутов останется сохранён',
    backendPractice:'Собрать один небольшой API-маршрут',
    backendMini:'Исправить ошибку в запросе к данным',
    backendReviews:['SQL: фильтрация и сортировка', 'Node.js: асинхронный поток', 'Linux: навигация и файлы']
  };

  let learningPriority = '';
  try {
    const savedPriority = localStorage.getItem(PRIORITY_KEY);
    if (sectionSets[savedPriority]) learningPriority = savedPriority;
  } catch {}
  let sections = sectionSets[learningPriority || 'frontend'];
  document.documentElement.dataset.learningPriority = learningPriority || 'frontend';

  const navItems = [
    ['overview','tabler:home',copy.overview,true],
    ['today','tabler:sun',copy.today,false],
    ['routes','tabler:route',copy.routes,false],
    ['learning','tabler:book-2',copy.learning,true],
    ['sections','tabler:layout-grid',copy.sections,true],
    ['lab','tabler:flask-2',copy.trainers,false],
    ['forge','tabler:hammer',copy.forge,false],
    ['playground','tabler:code',copy.playground,true],
    ['nexus','tabler:binary-tree-2',copy.nexus,false],
    ['calendar','tabler:calendar',copy.calendar,false],
    ['profile','tabler:user-code',copy.profile,false],
    ['settings','tabler:settings',copy.settings,true]
  ];

  const utilityCatalog = isEnglish ? [
    ['naming','tabler:variable','Code naming','Names for variables, arrays and functions, with explanations.'],
    ['github','tabler:brand-github','GitHub','Create repositories, upload project files and publish with GitHub Pages.'],
    ['fonts','tabler:typography','Fonts','Preview fonts and copy ready-to-use CSS.'],
    ['cheatsheets','tabler:notes','Cheatsheets','A compact reference for everyday syntax.'],
    ['resources','tabler:books','Resources','Selected documentation, courses and learning materials.'],
    ['algo','tabler:binary-tree','Algorithms','Patterns and exercises for algorithmic thinking.'],
    ['refactor','tabler:wand','Refactoring','Improve code structure without changing behavior.'],
    ['links','tabler:link','Useful links','Libraries, interface tools and development services.'],
    ['figma','tabler:brand-figma','Figma','Design handoff, layout and frontend workflow.'],
    ['mistakes','tabler:bug','Common mistakes','Frequent HTML, CSS and JavaScript problems.'],
    ['career','tabler:briefcase','Career','Portfolio, freelancing and job preparation.']
  ] : [
    ['github','tabler:brand-github','GitHub','Создание репозиториев, загрузка проектов и публикация через GitHub Pages.'],
    ['naming','tabler:variable','Названия в коде','Названия переменных, массивов и функций с объяснениями.'],
    ['fonts','tabler:typography','Шрифты','Превью шрифтов и готовые CSS-строки для копирования.'],
    ['cheatsheets','tabler:notes','Шпаргалки','Короткий справочник по синтаксису на каждый день.'],
    ['resources','tabler:books','Ресурсы','Отобранная документация, курсы и материалы.'],
    ['algo','tabler:binary-tree','Алгоритмы','Задачи и схемы для развития алгоритмического мышления.'],
    ['refactor','tabler:wand','Рефакторинг','Улучшение структуры кода без изменения поведения.'],
    ['links','tabler:link','Полезные ссылки','Библиотеки, UI-инструменты и сервисы разработчика.'],
    ['figma','tabler:brand-figma','Figma','Макеты, передача дизайна и связь с фронтендом.'],
    ['mistakes','tabler:bug','Частые ошибки','Типичные проблемы HTML, CSS и JavaScript.'],
    ['career','tabler:briefcase','Карьера','Портфолио, фриланс и подготовка к работе.']
  ];
  const appCatalog = isEnglish ? [
    ['overview','tabler:home','Overview','Your route, current work and the next useful step.','workspace'],
    ['today','tabler:sun','Today','A focused list of learning, practice and review tasks.','workspace'],
    ['routes','tabler:route','Routes','Choose a direction and see the complete learning path.','workspace'],
    ['learning','tabler:book-2','Learning','Open the next incomplete topic in your active route.','workspace'],
    ['calendar','tabler:calendar','Calendar','Plan sessions, projects, recovery and review days.','workspace'],
    ['lab','tabler:flask-2','Trainers','Short exercises, debugging and knowledge checks.','creation'],
    ['forge','tabler:hammer','Forge','Build projects from a brief and track their progress.','creation'],
    ['playground','tabler:code','Playground','Edit, import and preview HTML, CSS and JavaScript projects.','creation'],
    ['nexus','tabler:binary-tree-2','Nexus','Connect your own notes into a visual knowledge graph.','creation'],
    ['notebook','tabler:notebook','Notebook','Local notes with tabs, search and automatic saving.','creation'],
    ['review','tabler:brain','Review','Return to topics when they are ready to be reinforced.','progress'],
    ['diary','tabler:notebook','Learning diary','Record what you understood, what was difficult and what comes next.','progress'],
    ['weak','tabler:activity-heartbeat','Weak spots','See topics that need another short practice session.','progress'],
    ['skills','tabler:route','Skills map','See your progress across development skills.','progress'],
    ['debug','tabler:bug','Debug mode','Practice finding and fixing problems in code.','progress'],
    ['focus','tabler:focus-2','Focus mode','Keep one task and a timer in front of you.','progress'],
    ['profile','tabler:user-code','Profile','Projects, skills, activity and achievements in one place.','progress'],
    ['settings','tabler:settings','Settings','Appearance, behavior, data and local optimization.','progress']
  ] : [
    ['overview','tabler:home','Обзор','Твой маршрут, текущая работа и следующий полезный шаг.','workspace'],
    ['today','tabler:sun','Сегодня','Короткий список задач на обучение, практику и повторение.','workspace'],
    ['routes','tabler:route','Маршруты','Выбор направления и полный порядок изучения тем.','workspace'],
    ['learning','tabler:book-2','Обучение','Переход к следующей незавершённой теме активного маршрута.','workspace'],
    ['calendar','tabler:calendar','Календарь','План занятий, проектов, восстановления и повторений.','workspace'],
    ['lab','tabler:flask-2','Тренажёры','Короткие задачи, отладка и проверка знаний.','creation'],
    ['forge','tabler:hammer','Forge','Создание проектов по заданию и отслеживание их прогресса.','creation'],
    ['playground','tabler:code','Playground','Редактор, импорт и предпросмотр HTML, CSS и JavaScript-проектов.','creation'],
    ['nexus','tabler:binary-tree-2','Nexus','Связь собственных заметок в наглядный граф знаний.','creation'],
    ['notebook','tabler:notebook','Блокнот','Локальные заметки с вкладками, поиском и автосохранением.','creation'],
    ['review','tabler:brain','Повторение','Возврат к темам в момент, когда их пора закрепить.','progress'],
    ['diary','tabler:notebook','Дневник обучения','Записи о том, что понял, где застрял и что делать дальше.','progress'],
    ['weak','tabler:activity-heartbeat','Слабые места','Темы, которым нужна ещё одна короткая практика.','progress'],
    ['skills','tabler:route','Карта навыков','Прогресс по основным навыкам разработчика.','progress'],
    ['debug','tabler:bug','Режим отладки','Практика поиска и исправления проблем в коде.','progress'],
    ['focus','tabler:focus-2','Режим фокуса','Одна задача и таймер без лишнего шума.','progress'],
    ['profile','tabler:user-code','Профиль','Проекты, навыки, активность и достижения в одном месте.','progress'],
    ['settings','tabler:settings','Настройки','Внешний вид, поведение, данные и локальная оптимизация.','progress']
  ];
  const toolCatalog = utilityCatalog;
  const mobileCatalogIds = new Set(['today', 'routes', 'lab', 'forge', 'nexus', 'calendar', 'notebook', 'profile']);
  const mobileCatalog = appCatalog.filter(item => mobileCatalogIds.has(item[0]));
  const catalogCopy = isEnglish ? {
    search:'Find any feature, section or tool',
    empty:'Nothing found. Try another query.',
    summary:'Catalog overview',
    features:'features',
    learningAreas:'learning areas'
  } : {
    search:'Найти любую возможность, раздел или инструмент',
    empty:'Ничего не найдено. Измени запрос.',
    summary:'Обзор каталога',
    features:'возможностей',
    learningAreas:'учебных разделов'
  };
  let sectionsMode = 'routes';

  let currentView = 'overview';
  let viewBeforeSettings = 'overview';
  let navigationHistoryReady = false;
  let restoringNavigationHistory = false;
  let overview;
  let sectionsPage;
  let overviewDirty = false;
  let sectionsDirty = false;

  function icon(name, size = 18) {
    return `<iconify-icon icon="${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;
  }

  function logoMarkup(className = 'wdgn-brand-mark') {
    return `<svg class="${className}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M19 15 7 32l12 17" stroke="#a855f7" stroke-width="6" stroke-linecap="square" stroke-linejoin="round"/>
      <path d="m45 15 12 17-12 17" stroke="#a855f7" stroke-width="6" stroke-linecap="square" stroke-linejoin="round"/>
      <path d="m24 41 8-19 8 19" stroke="#2dd4a8" stroke-width="6" stroke-linecap="square" stroke-linejoin="round"/>
    </svg>`;
  }

  function getLearningSection(id) {
    return document.getElementById(`sec-${id}`) || document.getElementById(id);
  }

  function sectionStats(id) {
    const section = getLearningSection(id);
    if (!section) return { done:0, total:0, pct:0 };
    const checks = [...section.querySelectorAll('.prog-cb')];
    const done = checks.filter(item => item.checked).length;
    return { done, total:checks.length, pct:checks.length ? Math.round(done / checks.length * 100) : 0 };
  }

  function totalStats() {
    const checks = sections.flatMap(section => [...(getLearningSection(section.id)?.querySelectorAll('.prog-cb') || [])]);
    const done = checks.filter(item => item.checked).length;
    return { done, total:checks.length, pct:checks.length ? Math.round(done / checks.length * 100) : 0 };
  }

  function activeSection() {
    return sections.find(section => sectionStats(section.id).pct < 100) || sections[sections.length - 1];
  }

  function firstIncompleteTitle(sectionId) {
    const section = getLearningSection(sectionId);
    if (!section) return copy.lessonFallback;
    const blocks = [...section.querySelectorAll(':scope > .block')];
    const block = blocks.find(item => {
      const checks = [...item.querySelectorAll('.prog-cb')];
      return !checks.length || checks.some(check => !check.checked);
    }) || blocks[0];
    return block?.querySelector('h3, h2, .block-title')?.textContent?.trim() || copy.lessonFallback;
  }

  function safeProject() {
    try { return window.WebDevGymForge?.current?.() || null; }
    catch { return null; }
  }

  function codePreview(project) {
    const source = project?.source?.js || project?.source?.html || '';
    const cleaned = String(source).trim();
    if (cleaned) return cleaned.split('\n').slice(0, 14).join('\n');
    return `const nextStep = {
  topic: "${activeSection().label}",
  status: "ready"
};

function continueLearning() {
  return nextStep.topic;
}`;
  }

  function closeLegacyPages() {
    window.WebDevGymFeatures?.close?.();
    document.querySelectorAll('.wdgf-feature-page.open, .wdgt-page.open, .wdg-growth-page.open').forEach(page => page.classList.remove('open'));
  }

  function hideCustomPages() {
    if (overview) overview.hidden = true;
    if (sectionsPage) sectionsPage.hidden = true;
  }

  function setCustomPageOpen(isOpen) {
    document.body.classList.toggle('wdgn-custom-page-open', isOpen);
  }

  function setActive(id) {
    currentView = id;
    document.querySelectorAll('.wdgn-nav-btn').forEach(button => button.classList.toggle('active', button.dataset.view === (id === 'naming' ? 'sections' : id)));
    if (navigationHistoryReady && !restoringNavigationHistory && history.state?.wdgnView !== id) {
      history.pushState({ ...(history.state || {}), wdgnView: id }, '');
    }
  }

  function showOverview() {
    closeLegacyPages();
    hideCustomPages();
    overview.hidden = false;
    setCustomPageOpen(true);
    setActive('overview');
    if (overviewDirty) renderOverview();
  }

  function showNativeTab(id) {
    hideCustomPages();
    document.body.classList.remove('wdgn-overview-open');
    setCustomPageOpen(false);
    closeLegacyPages();
    if (typeof window.switchTabByName === 'function') window.switchTabByName(id);
    const curriculumIds = [...sectionCatalog.frontend, ...sectionCatalog.backend, ...sectionCatalog.shared, ...sectionCatalog.languages].map(section => section.id);
    setActive(curriculumIds.includes(id) ? 'learning' : id);
  }

  function openSettings() {
    if (currentView !== 'settings') viewBeforeSettings = currentView;
    window.setTimeout(() => {
      if (typeof window.openWebDevGymSettings === 'function') {
        window.openWebDevGymSettings('appearance');
      } else if (typeof window.toggleSettings === 'function') {
        window.toggleSettings();
      } else {
        document.querySelector('.settings-btn, [data-settings-open]')?.click();
      }
    }, 0);
  }

  function syncSettingsNavigation(event) {
    const open = Boolean(event.detail?.open);
    if (open) {
      if (currentView !== 'settings') viewBeforeSettings = currentView;
      setActive('settings');
      return;
    }
    if (currentView === 'settings') setActive(viewBeforeSettings || 'overview');
  }

  function openView(id) {
    if (id === 'settings') return openSettings();
    if (id === 'overview') return showOverview();
    hideCustomPages();
    document.body.classList.remove('wdgn-overview-open');
    setCustomPageOpen(false);
    closeLegacyPages();
    if (id === 'today') window.WebDevGymToday?.open?.();
    else if (id === 'routes') window.WebDevGymGrowth?.open?.();
    else if (id === 'learning') return showNativeTab(activeSection().id);
    else if (id === 'sections') return showSections();
    else if (id === 'lab') window.WebDevGymLab?.open?.();
    else if (id === 'forge') window.WebDevGymForge?.open?.();
    else if (id === 'profile' || id === 'naming') window.WebDevGymFeatures?.open?.(id);
    else showNativeTab(id);
    setActive(id);
  }

  function navButton([id, iconName, label, mobile]) {
    return `<button class="wdgn-nav-btn${id === currentView ? ' active' : ''}" type="button" data-view="${id}" data-mobile="${mobile}">${icon(iconName)}<span>${label}</span></button>`;
  }

  function buildSidebar() {
    let sidebar = document.querySelector('.wdg-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.className = 'wdg-sidebar';
      document.body.appendChild(sidebar);
    }
    const total = totalStats();
    sidebar.innerHTML = `<div class="wdgn-side">
      <div class="wdgn-brand">${logoMarkup()}<strong>WebDev<span>Gym</span></strong></div>
      <nav class="wdgn-nav" aria-label="${copy.system}">
        <div class="wdgn-nav-group">${copy.system}</div>
        ${navItems.slice(0, 4).map(navButton).join('')}
        <div class="wdgn-nav-group">${copy.growth}</div>
        ${navButton(navItems[4])}
        <div class="wdgn-nav-group">${copy.tools}</div>
        ${navItems.slice(5, 10).map(navButton).join('')}
        <div class="wdgn-nav-group">${copy.account}</div>
        ${navItems.slice(10).map(navButton).join('')}
      </nav>
      <div class="wdgn-side-foot"><div class="wdgn-side-progress">
        <div><span>${copy.current}</span><strong>${total.pct}%</strong></div>
        <div class="wdgn-progress-track"><span style="width:${total.pct}%"></span></div>
        <div><span>${total.done} / ${total.total}</span><span>${copy.learned}</span></div>
      </div></div>
    </div>`;
    if (!sidebar.dataset.wdgnBound) {
      sidebar.dataset.wdgnBound = 'true';
      sidebar.addEventListener('click', event => {
        const button = event.target.closest('[data-view]');
        if (!button) return;
        if (button.dataset.view === 'settings') event.stopPropagation();
        openView(button.dataset.view);
      });
    }
  }

  function buildTopbar() {
    document.querySelector('.wdgn-top')?.remove();
    const top = document.createElement('header');
    top.className = 'wdgn-top';
    top.innerHTML = `<button class="wdgn-search" type="button" data-command>${icon('tabler:search',17)}<span>${copy.search}</span><kbd>Ctrl K</kbd></button>
      <div class="wdgn-top-actions">
        <div class="wdgn-lang"><a class="${isEnglish ? '' : 'active'}" href="https://kernix01.github.io/WebDevGym/">RU</a><a class="${isEnglish ? 'active' : ''}" href="https://kernix01.github.io/WebDevGym-EN/">EN</a></div>
        <button class="wdgn-text-btn" type="button" data-import>${icon('tabler:upload',16)}<span>${copy.import}</span></button>
        <button class="wdgn-text-btn" type="button" data-export>${icon('tabler:download',16)}<span>${copy.export}</span></button>
        <button class="wdgn-icon-btn" type="button" data-theme title="${isEnglish ? 'Theme' : 'Тема'}">${icon('tabler:sun-moon',18)}</button>
        <button class="wdgn-icon-btn wdgu-timer-launcher" id="wdguTimerLauncher" type="button" title="${isEnglish ? 'Timer' : 'Таймер'}" aria-label="${isEnglish ? 'Timer' : 'Таймер'}" aria-expanded="false">${icon('tabler:clock',18)}</button>
        <button class="wdgn-icon-btn" type="button" data-settings title="${copy.settings}">${icon('tabler:settings',18)}</button>
        <button class="wdgn-icon-btn wdgn-ai-btn" type="button" data-ai title="${isEnglish ? 'AI assistant' : 'ИИ-помощник'}">${icon('tabler:sparkles',18)}</button>
      </div>`;
    document.body.appendChild(top);
    const timerLauncher = top.querySelector('.wdgu-timer-launcher');
    document.querySelectorAll('#wdguTimerLauncher').forEach(button => {
      if (button !== timerLauncher) button.removeAttribute('id');
    });
    top.querySelector('[data-command]').addEventListener('click', () => window.WebDevGymFeatures?.openCommandPalette?.());
    top.querySelector('[data-import]').addEventListener('click', () => window.importProgressJson?.());
    top.querySelector('[data-export]').addEventListener('click', () => window.exportProgressJson?.());
    top.querySelector('[data-theme]').addEventListener('click', () => window.toggleDark?.());
    top.querySelector('[data-settings]').addEventListener('click', event => {
      event.stopPropagation();
      openSettings();
    });
    top.querySelector('[data-ai]').addEventListener('click', () => {
      if (typeof window.toggleAiChat === 'function') window.toggleAiChat();
      else document.querySelector('[data-ai-open], #aiFab')?.click();
    });
  }

  function catalogStats(items) {
    const totals = items.reduce((result, section) => {
      const stats = sectionStats(section.id);
      result.done += stats.done;
      result.total += stats.total;
      return result;
    }, { done:0, total:0 });
    totals.pct = totals.total ? Math.round(totals.done / totals.total * 100) : 0;
    return totals;
  }

  function sectionCardMarkup(section) {
    const stats = sectionStats(section.id);
    const [iconName, color] = sectionVisuals[section.id] || ['tabler:code', '#a855f7'];
    return `<button class="wdgn-section-card" type="button" data-open-section="${section.id}" style="--section-color:${color}">
      <span class="wdgn-section-icon">${icon(iconName,22)}</span>
      <span class="wdgn-section-copy"><strong>${section.label}</strong><small>${stats.done} / ${stats.total} ${copy.topics}</small></span>
      <span class="wdgn-section-progress" aria-label="${stats.pct}%"><i style="width:${stats.pct}%"></i></span>
      <span class="wdgn-section-percent">${stats.pct}%</span>
      ${icon('tabler:chevron-right',17)}
    </button>`;
  }

  function directionMarkup(direction, title, description, iconName) {
    const items = sectionCatalog[direction];
    const stats = catalogStats(items);
    const active = (learningPriority || 'frontend') === direction;
    return `<article class="wdgn-direction ${active ? 'active' : ''}" data-direction="${direction}">
      <header class="wdgn-direction-head">
        <span class="wdgn-direction-icon">${icon(iconName,24)}</span>
        <div><div class="wdgn-direction-title"><h2>${title}</h2>${active ? `<span>${copy.priorityActive}</span>` : ''}</div><p>${description}</p></div>
        <div class="wdgn-direction-score"><strong>${stats.pct}%</strong><small>${stats.done} / ${stats.total}</small></div>
      </header>
      <div class="wdgn-direction-track"><span style="width:${stats.pct}%"></span></div>
      <div class="wdgn-section-list">${items.map(sectionCardMarkup).join('')}</div>
      ${active ? '' : `<button class="wdgn-priority-action" type="button" data-set-direction="${direction}">${icon('tabler:route',16)} ${copy.choosePriority}</button>`}
    </article>`;
  }

  function toolCardMarkup([id, iconName, label, description], mobileOnly = false) {
    return `<button class="wdgn-tool-card${mobileOnly ? ' wdgn-mobile-catalog-card' : ''}" type="button" data-open-tool="${id}">
      <span class="wdgn-tool-icon">${icon(iconName,22)}</span>
      <span><strong>${label}</strong><small>${description}</small></span>
      ${icon('tabler:arrow-up-right',17)}
    </button>`;
  }

  function openCatalogItem(id) {
    if (id === 'notebook') {
      if (typeof window.WebDevGymNotebook?.open === 'function') window.WebDevGymNotebook.open();
      else window.WebDevGymFeatures?.open?.('notebook');
      return;
    }
    if (['review', 'diary', 'weak', 'skills', 'debug', 'focus'].includes(id)) {
      window.WebDevGymFeatures?.open?.(id);
      return;
    }
    if (id === 'naming') return openView('naming');
    openView(id);
  }

  function renderSectionsPage() {
    if (!sectionsPage) return;
    const shared = sectionCatalog.shared;
    const languages = sectionCatalog.languages;
    const frontendStats = catalogStats(sectionCatalog.frontend);
    const backendStats = catalogStats(sectionCatalog.backend);
    const allTopics = sectionCatalog.frontend.length + sectionCatalog.backend.length + shared.length + languages.length;
    sectionsPage.innerHTML = `<div class="wdgn-sections-shell">
      <header class="wdgn-sections-head"><div><div class="wdgn-eyebrow">${copy.growth}</div><h1>${copy.sectionsTitle}</h1><p>${copy.sectionsSub}</p></div></header>
      <section class="wdgn-catalog-summary" aria-label="${catalogCopy.summary}">
        <div><span>${icon('tabler:browser',18)} Frontend</span><strong>${frontendStats.pct}%</strong><small>${frontendStats.done} / ${frontendStats.total} ${copy.topics}</small></div>
        <div><span>${icon('tabler:server-2',18)} Backend</span><strong>${backendStats.pct}%</strong><small>${backendStats.done} / ${backendStats.total} ${copy.topics}</small></div>
        <div><span>${icon('tabler:layout-grid',18)} ${copy.catalogAll}</span><strong>${allTopics + toolCatalog.length}</strong><small>${allTopics} ${catalogCopy.learningAreas} · ${toolCatalog.length} ${copy.catalogTools.toLowerCase()}</small></div>
      </section>
      <div class="wdgn-sections-toolbar">
        <div class="wdgn-sections-switch" role="tablist" aria-label="${copy.sections}">
          <button class="${sectionsMode === 'routes' ? 'active' : ''}" type="button" role="tab" data-sections-mode="routes">${icon('tabler:route',17)}<span>${copy.catalogRoutes}</span></button>
          <button class="${sectionsMode === 'tools' ? 'active' : ''}" type="button" role="tab" data-sections-mode="tools">${icon('tabler:tool',17)}<span>${copy.catalogTools}</span></button>
        </div>
        <label class="wdgn-catalog-search">${icon('tabler:search',17)}<input type="search" data-catalog-search placeholder="${catalogCopy.search}" autocomplete="off"></label>
      </div>
      <div class="wdgn-sections-view" data-sections-view="routes" ${sectionsMode === 'routes' ? '' : 'hidden'}>
        <div class="wdgn-directions-grid">
          ${directionMarkup('frontend','Frontend',copy.frontendDesc,'tabler:browser')}
          ${directionMarkup('backend','Backend',copy.backendDesc,'tabler:server-2')}
        </div>
        <section class="wdgn-shared-section"><div class="wdgn-shared-copy"><span>${icon('tabler:git-branch',20)}</span><div><h2>${copy.shared}</h2><p>${copy.sharedDesc}</p></div></div><div class="wdgn-shared-list">${shared.map(sectionCardMarkup).join('')}</div></section>
        <section class="wdgn-shared-section wdgn-language-section"><div class="wdgn-shared-copy"><span>${icon('tabler:braces',20)}</span><div><h2>${copy.languages}</h2><p>${copy.languagesDesc}</p></div></div><div class="wdgn-shared-list">${languages.map(sectionCardMarkup).join('')}</div></section>
      </div>
      <section class="wdgn-sections-view wdgn-tools-view" data-sections-view="tools" ${sectionsMode === 'tools' ? '' : 'hidden'}>
        <header class="wdgn-tools-head"><div><span>${icon('tabler:tool',22)}</span><div><h2>${copy.toolsTitle}</h2><p>${copy.toolsSub}</p></div></div></header>
        <div class="wdgn-mobile-catalog-label">${isEnglish ? 'Pages hidden from the mobile bar' : 'Страницы, скрытые из нижней панели'}</div>
        <div class="wdgn-tool-grid">${mobileCatalog.map(item => toolCardMarkup(item, true)).join('')}${toolCatalog.map(item => toolCardMarkup(item)).join('')}</div>
      </section>
      <div class="wdgn-catalog-empty" data-catalog-empty hidden>${icon('tabler:search-off',22)}<span>${catalogCopy.empty}</span></div>
    </div>`;
    sectionsPage.querySelectorAll('[data-open-section]').forEach(button => button.addEventListener('click', () => showNativeTab(button.dataset.openSection)));
    sectionsPage.querySelectorAll('[data-set-direction]').forEach(button => button.addEventListener('click', () => setLearningPriority(button.dataset.setDirection, { replay:false })));
    sectionsPage.querySelectorAll('[data-sections-mode]').forEach(button => button.addEventListener('click', () => {
      sectionsMode = button.dataset.sectionsMode;
      sectionsPage.querySelectorAll('[data-sections-mode]').forEach(item => item.classList.toggle('active', item === button));
      sectionsPage.querySelectorAll('[data-sections-view]').forEach(view => { view.hidden = view.dataset.sectionsView !== sectionsMode; });
      filterCatalog();
    }));
    sectionsPage.querySelectorAll('[data-open-tool]').forEach(button => button.addEventListener('click', () => openCatalogItem(button.dataset.openTool)));
    const catalogSearch = sectionsPage.querySelector('[data-catalog-search]');
    const catalogEmpty = sectionsPage.querySelector('[data-catalog-empty]');
    const filterCatalog = () => {
      const query = catalogSearch?.value.trim().toLocaleLowerCase() || '';
      const currentCatalogView = sectionsPage.querySelector('[data-sections-view="' + sectionsMode + '"]');
      const cards = [...(currentCatalogView?.querySelectorAll('.wdgn-section-card, .wdgn-tool-card') || [])]
        .filter(card => !card.classList.contains('wdgn-mobile-catalog-card') || window.matchMedia('(max-width: 680px)').matches);
      let visible = 0;
      cards.forEach(card => {
        const matches = !query || card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      currentCatalogView?.querySelectorAll('.wdgn-direction').forEach(direction => {
        direction.classList.toggle('search-empty', !direction.querySelector('.wdgn-section-card:not([hidden])'));
      });
      currentCatalogView?.querySelectorAll('.wdgn-shared-section').forEach(sharedCatalog => {
        sharedCatalog.hidden = !sharedCatalog.querySelector('.wdgn-section-card:not([hidden])');
      });
      if (catalogEmpty) catalogEmpty.hidden = visible > 0;
    };
    catalogSearch?.addEventListener('input', filterCatalog);
    sectionsDirty = false;
  }

  function buildSectionsPage() {
    sectionsPage = document.querySelector('.wdgn-sections-page') || document.createElement('section');
    sectionsPage.className = 'wdgn-sections-page';
    sectionsPage.hidden = true;
    sectionsPage.setAttribute('aria-label', copy.sections);
    if (!sectionsPage.isConnected) document.body.appendChild(sectionsPage);
    renderSectionsPage();
  }

  function showSections() {
    closeLegacyPages();
    hideCustomPages();
    document.body.classList.remove('wdgn-overview-open');
    setCustomPageOpen(true);
    sectionsPage.hidden = false;
    setActive('sections');
    if (sectionsDirty) renderSectionsPage();
  }

  function showTools() {
    sectionsMode = 'tools';
    showSections();
  }

  function routeMarkup() {
    const active = activeSection();
    const progressBefore = sections.findIndex(item => item.id === active.id);
    const segmentWidth = sections.length > 1 ? 82 / (sections.length - 1) : 0;
    const routeProgress = Math.max(0, Math.min(82, progressBefore * segmentWidth + sectionStats(active.id).pct * segmentWidth / 100));
    return `<div class="wdgn-route" style="--wdgn-route-count:${sections.length};--wdgn-route-progress:${routeProgress}%">${sections.map(section => {
      const stats = sectionStats(section.id);
      const state = stats.pct >= 100 ? 'done' : section.id === active.id ? 'active' : '';
      const node = stats.pct >= 100 ? icon('tabler:check',20) : section.short;
      return `<button class="wdgn-route-step ${state}" type="button" data-section="${section.id}"><span class="wdgn-route-node">${node}</span><strong>${section.label}</strong><small>${stats.pct}% · ${stats.done}/${stats.total}</small></button>`;
    }).join('')}</div>`;
  }

  function prioritySwitcherMarkup() {
    return `<div class="wdgn-priority-control" aria-label="${priorityCopy.switcher}">
      <span>${priorityCopy.switcher}</span>
      <div class="wdgn-priority-segment">
        <button class="${(learningPriority || 'frontend') === 'frontend' ? 'active' : ''}" type="button" data-priority="frontend">${icon('tabler:browser',15)} Frontend</button>
        <button class="${learningPriority === 'backend' ? 'active' : ''}" type="button" data-priority="backend">${icon('tabler:server-2',15)} Backend</button>
      </div>
    </div>`;
  }

  function taskMarkup(label, title, meta, action) {
    return `<article class="wdgn-task"><div class="wdgn-task-label">${label}</div><h3>${title}</h3><p>${action === 'continue' ? copy.routeSub : copy.todaySub}</p><div class="wdgn-task-meta"><span>${meta}</span><button class="wdgn-action" type="button" data-action="${action}">${action === 'continue' ? copy.continue : copy.start}</button></div></article>`;
  }

  function inspectorItem(iconName, text) {
    return `<div class="wdgn-inspector-item">${icon(iconName,16)}<span>${text}</span></div>`;
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  function renderOverview() {
    if (!overview) return;
    const active = activeSection();
    const activeTitle = firstIncompleteTitle(active.id);
    const project = safeProject();
    const projectTitle = project?.title || copy.noProject;
    const projectCode = codePreview(project).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    const focus = readJson('wdgf_focus_v1', { totalMinutes:0 });
    const streak = Number(localStorage.getItem('wdgf_streak') || 1);
    const isBackend = (learningPriority || 'frontend') === 'backend';
    const practiceTitle = isBackend ? priorityCopy.backendPractice : copy.practiceFallback;
    const miniTitle = isBackend ? priorityCopy.backendMini : copy.miniFallback;
    const frontendReviews = [isEnglish ? 'Arrays: transform data' : 'Массивы: преобразование данных', isEnglish ? 'Element selection' : 'Выбор элементов', isEnglish ? 'Functions and scope' : 'Функции и область видимости'];
    const reviews = [activeTitle, ...(isBackend ? priorityCopy.backendReviews : frontendReviews)];
    overview.innerHTML = `<div class="wdgn-overview-shell"><main class="wdgn-overview-main">
      <header class="wdgn-overview-head"><div><div class="wdgn-eyebrow">${copy.current}</div><h1>${copy.route}</h1><p>${copy.routeSub}</p></div>${prioritySwitcherMarkup()}</header>
      ${routeMarkup()}
      <div class="wdgn-workspace">
        <section class="wdgn-column"><div class="wdgn-column-head"><h2>${copy.todayTitle}</h2><span>${copy.todaySub}</span></div>${taskMarkup(copy.lesson,activeTitle,`${active.label} · ≈ 25 min`,'continue')}${taskMarkup(copy.practice,practiceTitle,`${active.label} · 0/12`,'practice')}${taskMarkup(copy.mini,miniTitle,'≈ 5 min','mini')}</section>
        <section class="wdgn-column"><div class="wdgn-column-head"><h2>${copy.work}</h2><span>${copy.workSub}</span></div><div class="wdgn-editor"><div class="wdgn-editor-head"><span>${projectTitle}</span><button class="wdgn-action" type="button" data-action="project">${copy.open}</button></div><pre>${projectCode}</pre><div class="wdgn-editor-foot"><span>main</span><span>${project?.completed ? '✓ complete' : '● local'}</span></div></div></section>
        <section class="wdgn-column"><div class="wdgn-column-head"><h2>${copy.review}</h2><span>${copy.reviewSub}</span></div>${reviews.map((item,index) => `<div class="wdgn-review-item"><strong>${item}</strong><div><span>${index ? `${index + 1} ${isEnglish ? 'days ago' : 'дн. назад'}` : isEnglish ? 'Today' : 'Сегодня'}</span><i class="wdgn-review-level" style="opacity:${1 - index * .18}"></i></div></div>`).join('')}<button class="wdgn-action" type="button" data-action="review">${copy.open}</button></section>
      </div></main>
      <aside class="wdgn-inspector"><h2>${copy.inspector}</h2>
        <div class="wdgn-inspector-block"><div class="wdgn-inspector-label">${copy.streak}</div><div class="wdgn-streak"><span>●</span> ${Math.max(1,streak)}</div><div class="wdgn-heatmap">${Array.from({length:35},(_,index) => `<i class="${index % 5 !== 0 && index < 29 ? 'on' : ''}"></i>`).join('')}</div></div>
        <div class="wdgn-inspector-block"><div class="wdgn-inspector-label">${copy.focus}</div><div class="wdgn-task-meta"><strong>${active.label}</strong><span>${Number(focus.totalMinutes || 0)} min</span></div><div class="wdgn-mini-track"><span style="width:${Math.min(100,Number(focus.totalMinutes || 0))}%"></span></div></div>
        <div class="wdgn-inspector-block"><div class="wdgn-inspector-label">${copy.activity}</div><div class="wdgn-inspector-list">${inspectorItem('tabler:book-2',isEnglish ? 'Lesson progress saved' : 'Прогресс урока сохранён')}${inspectorItem('tabler:code',projectTitle)}${inspectorItem('tabler:brain',isEnglish ? 'Review queue updated' : 'Очередь повторения обновлена')}</div></div>
        <div class="wdgn-inspector-block"><div class="wdgn-inspector-label">${copy.nextReview}</div><div class="wdgn-task-meta"><strong>${reviews[1]}</strong><span>${isEnglish ? 'Tomorrow' : 'Завтра'}</span></div></div>
      </aside></div>`;
    overview.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => showNativeTab(button.dataset.section)));
    overview.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action, active.id)));
    overview.querySelectorAll('[data-priority]').forEach(button => button.addEventListener('click', () => setLearningPriority(button.dataset.priority, { replay:false })));
    overviewDirty = false;
  }

  function handleAction(action, sectionId) {
    if (action === 'continue') showNativeTab(sectionId);
    else if (action === 'practice' || action === 'mini') window.WebDevGymLab?.open?.(action === 'mini' ? 'debug' : 'exam');
    else if (action === 'project') window.WebDevGymForge?.open?.();
    else if (action === 'review') window.WebDevGymFeatures?.open?.('review');
  }

  function buildOverview() {
    overview = document.querySelector('.wdgn-overview') || document.createElement('section');
    overview.className = 'wdgn-overview';
    overview.setAttribute('aria-label', copy.overview);
    if (!overview.isConnected) document.body.appendChild(overview);
    renderOverview();
  }

  function replayPrioritySplash() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;
    splash.classList.remove('hide', 'splash-hidden');
    window.setTimeout(() => splash.classList.add('hide', 'splash-hidden'), 900);
  }

  function setLearningPriority(priority, options = {}) {
    if (!sectionSets[priority]) return;
    learningPriority = priority;
    sections = sectionSets[priority];
    document.documentElement.dataset.learningPriority = priority;
    try { localStorage.setItem(PRIORITY_KEY, priority); } catch {}
    document.querySelector('.wdgn-priority-picker')?.remove();
    buildSidebar();
    renderOverview();
    renderSectionsPage();
    if (options.replay !== false) replayPrioritySplash();
  }

  function openPriorityPicker() {
    if (learningPriority || document.querySelector('.wdgn-priority-picker')) return;
    const picker = document.createElement('div');
    picker.className = 'wdgn-priority-picker';
    picker.setAttribute('role', 'dialog');
    picker.setAttribute('aria-modal', 'true');
    picker.setAttribute('aria-labelledby', 'wdgn-priority-title');
    picker.innerHTML = `<div class="wdgn-priority-dialog">
      <div class="wdgn-priority-mark">${logoMarkup('wdgn-priority-logo')}</div>
      <div class="wdgn-eyebrow">WebDevGym</div>
      <h2 id="wdgn-priority-title">${priorityCopy.question}</h2>
      <p>${priorityCopy.description}</p>
      <div class="wdgn-priority-options">
        <button type="button" data-priority-choice="frontend">
          <span class="wdgn-priority-icon">${icon('tabler:browser',27)}</span>
          <strong>${priorityCopy.frontend}</strong>
          <small>${priorityCopy.frontendSub}</small>
          <i>HTML · CSS · JavaScript · TypeScript · React · Electron (${isEnglish ? 'optional' : 'необязательно'})</i>
        </button>
        <button type="button" data-priority-choice="backend">
          <span class="wdgn-priority-icon">${icon('tabler:server-2',27)}</span>
          <strong>${priorityCopy.backend}</strong>
          <small>${priorityCopy.backendSub}</small>
          <i>Node.js · SQL · PostgreSQL · Linux · Servers</i>
        </button>
      </div>
      <div class="wdgn-priority-note">${icon('tabler:shield-check',16)} ${priorityCopy.saved}</div>
    </div>`;
    document.body.appendChild(picker);
    picker.querySelectorAll('[data-priority-choice]').forEach(button => {
      button.addEventListener('click', () => setLearningPriority(button.dataset.priorityChoice));
    });
    window.requestAnimationFrame(() => picker.classList.add('open'));
  }

  function updateSplash() {
    const splash = document.getElementById('splash-screen');
    if (!splash || splash.querySelector('.wdgn-loader-route')) return;
    splash.innerHTML = `<div class="splash-inner"><div class="splash-icon">${logoMarkup('splash-logo')}</div><div class="splash-title">WebDev<strong>Gym</strong></div><div class="splash-sub">${copy.loader}</div><div class="wdgn-loader-route">${sections.map((section,index) => `<span class="wdgn-loader-step ${index < 2 ? 'done' : index === 2 ? 'active' : ''}"><i></i>${section.short}</span>`).join('')}</div></div>`;
  }

  function observeProgress() {
    document.addEventListener('change', event => {
      if (!event.target.matches('.prog-cb')) return;
      buildSidebar();
      if (!overview.hidden) renderOverview();
      else overviewDirty = true;
      if (sectionsPage && !sectionsPage.hidden) renderSectionsPage();
      else sectionsDirty = true;
    });
    document.addEventListener('webdevgym:forge-complete', () => {
      if (!overview.hidden) renderOverview();
      else overviewDirty = true;
    });
  }

  function init() {
    document.body.classList.remove('wdgr-suite-ready');
    document.body.classList.add('wdgn-ready');
    updateSplash();
    buildSidebar();
    buildTopbar();
    buildOverview();
    buildSectionsPage();
    observeProgress();
    document.addEventListener('webdevgym:settings-state', syncSettingsNavigation);
    showOverview();
    history.replaceState({ ...(history.state || {}), wdgnView: currentView }, '');
    navigationHistoryReady = true;
    window.addEventListener('popstate', event => {
      restoringNavigationHistory = true;
      openView(event.state?.wdgnView || 'overview');
      restoringNavigationHistory = false;
    });
    setTimeout(() => document.getElementById('splash-screen')?.classList.add('hide', 'splash-hidden'), 780);
    if (!learningPriority) setTimeout(openPriorityPicker, 980);
  }

  window.WebDevGymNext = Object.freeze({
    open: openView,
    openCatalogItem,
    catalog: () => appCatalog.map(([id, iconName, label, description, group]) => ({ id, icon:iconName, label, description, group })),
    overview: showOverview,
    tools: showTools,
    current: () => currentView
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init,260), { once:true });
  else setTimeout(init,260);
})();
