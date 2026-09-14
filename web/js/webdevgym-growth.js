(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname);
  const L = (en, ru) => isEnglish ? en : ru;
  const STORE_KEY = isEnglish ? 'wdg_mastery_en_v1' : 'wdg_mastery_ru_v1';
  const PATH_KEY = isEnglish ? 'wdg_active_path_en_v1' : 'wdg_active_path_ru_v1';
  const CHECKPOINT_KEY = isEnglish ? 'wdg_checkpoints_en_v1' : 'wdg_checkpoints_ru_v1';
  const COURSE_SECTIONS = ['html','css','js','git','vite','ts','react','electron','node','sql','pg','linux','devops','python','csharp'];
  const LEVELS = [
    { value:0, label:L('Not started','Не начато'), short:'0' },
    { value:1, label:L('Read','Прочитал'), short:'1' },
    { value:2, label:L('Understood','Понял'), short:'2' },
    { value:3, label:L('With a hint','С подсказкой'), short:'3' },
    { value:4, label:L('Independently','Самостоятельно'), short:'4' }
  ];

  const copy = {
    title:L('Learning paths','Маршруты'),
    subtitle:L('Choose a goal and move through topics in a deliberate order.','Выбери цель и проходи темы в осмысленном порядке.'),
    nav:L('Paths','Маршруты'),
    mastery:L('Mastery','Владение темой'),
    level:L('Current level','Текущий уровень'),
    due:L('Review is due','Пора повторить'),
    active:L('Active path','Активный маршрут'),
    choose:L('Choose path','Выбрать маршрут'),
    continue:L('Continue','Продолжить'),
    open:L('Open topic','Открыть тему'),
    progress:L('Path progress','Прогресс маршрута'),
    checkpoint:L('Section checkpoint','Практический рубеж'),
    checkpointText:L('Build the task without copying the lesson example. Mark it only after you can explain every important line.','Собери задачу без копирования примера из урока. Отмечай только когда можешь объяснить каждую важную строку.'),
    done:L('Completed independently','Сделано самостоятельно'),
    openForge:L('Practice in Forge','Практика в Forge'),
    criteria:L('Ready when','Готово, когда'),
    noTopic:L('The closest section will open. Choose the matching topic inside it.','Откроется ближайший раздел. Выбери подходящую тему внутри него.'),
    stats:L('Mastered independently','Самостоятельно освоено')
  };

  const paths = [
    {
      id:'frontend', icon:'tabler:code',
      title:L('Frontend from zero','Frontend с нуля'),
      description:L('A direct route from page structure to browser logic and Git.','Прямой путь от структуры страницы до логики в браузере и Git.'),
      steps:[
        step('html',0,'HTML structure','Структура HTML',/doctype|структур|page structure/i),
        step('css',0,'CSS selectors and box model','Селекторы и блочная модель',/selector|селектор|box model|блочн/i),
        step('css',7,'Flexbox and responsive layout','Flexbox и адаптив',/flex|адаптив|responsive/i),
        step('js',0,'Variables and data types','Переменные и типы данных',/переменн|variable|let|const/i),
        step('js',2,'Conditions and comparison','Условия и сравнение',/услов|condition|\bif\b|\belse\b/i),
        step('js',8,'Interface and events','Интерфейс и события',/dom|event|событ|queryselector/i),
        step('js',11,'Project data','Данные проекта',/localstorage|storage|хранил/i),
        step('git',0,'Git basics','Основа Git',/commit|репозитор|repository|git/i)
      ]
    },
    {
      id:'freelance', icon:'tabler:briefcase-2',
      title:L('Freelance ready','Готовность к фрилансу'),
      description:L('The minimum practical stack for small client fixes and interface features.','Минимальный практический стек для небольших клиентских правок и интерфейсных функций.'),
      steps:[
        step('html',3,'Forms and accessible fields','Формы и доступные поля',/form|форм/i),
        step('css',10,'Responsive layout','Адаптивная верстка',/media|адаптив|responsive/i),
        step('js',8,'Element selectors','Селекторы элементов',/queryselector|dom|селектор/i),
        step('js',9,'Events and form submit','События и submit формы',/event|submit|событ/i),
        step('js',11,'User preferences','Настройки пользователя',/localstorage|storage/i),
        step('git',1,'Safe changes with Git','Безопасные изменения через Git',/branch|commit|ветк/i)
      ]
    },
    {
      id:'react', icon:'tabler:brand-react',
      title:L('Route to React','Путь к React'),
      description:L('Strengthen JavaScript first, then add TypeScript, tooling and React.','Сначала укрепи JavaScript, затем добавь TypeScript, сборку и React.'),
      steps:[
        step('js',4,'Functions','Функции',/function|функц/i),
        step('js',5,'Arrays and transformations','Массивы и преобразования',/array|массив|map|filter/i),
        step('js',16,'Async code and fetch','Асинхронность и fetch',/async|fetch|promise|асинхрон/i),
        step('git',0,'Git workflow','Работа с Git',/commit|branch|git/i),
        step('vite',0,'Vite and modules','Vite и модули',/vite|module|модул/i),
        step('ts',0,'Types and interfaces','Типы и интерфейсы',/type|interface|тип|интерфейс/i),
        step('react',0,'Components and props','Компоненты и props',/component|компонент|props/i),
        step('react',2,'State and effects','Состояние и эффекты',/state|effect|состояни|эффект/i)
      ]
    },
    {
      id:'js-review', icon:'tabler:brand-javascript',
      title:L('JavaScript review','Повторение JavaScript'),
      description:L('A compact cycle for rebuilding the foundation from memory.','Короткий цикл для восстановления базы по памяти.'),
      steps:[
        step('js',0,'Variables','Переменные',/variable|переменн|let|const/i),
        step('js',2,'Conditions','Условия',/condition|услов|\bif\b|\belse\b/i),
        step('js',3,'Loops','Циклы',/loop|цикл|for|while/i),
        step('js',4,'Functions','Функции',/function|функц/i),
        step('js',5,'Arrays','Массивы',/array|массив/i),
        step('js',8,'Interface','Интерфейс',/dom|queryselector/i),
        step('js',9,'Events','События',/event|событ|submit|click/i),
        step('js',11,'Data persistence','Сохранение данных',/localstorage|storage/i)
      ]
    },
    {
      id:'backend', icon:'tabler:server',
      title:L('Backend foundation','Основа Backend'),
      description:L('From JavaScript on the server to databases, Linux and deployment basics.','От JavaScript на сервере до баз данных, Linux и основ развёртывания.'),
      steps:[
        step('js',4,'Functions and scope','Функции и область видимости',/function|scope|функц|област/i),
        step('git',0,'Git workflow','Работа с Git',/commit|branch|git/i),
        step('node',0,'Node.js runtime','Среда Node.js',/node|runtime|сервер/i),
        step('node',6,'HTTP and routing','HTTP и маршрутизация',/http|route|маршрут|request/i),
        step('sql',0,'SQL foundations','Основы SQL',/select|sql|таблиц|query/i),
        step('pg',0,'PostgreSQL','PostgreSQL',/postgres|database|баз/i),
        step('linux',0,'Linux basics','Основы Linux',/linux|terminal|команд/i),
        step('devops',0,'Servers and deploy','Серверы и деплой',/server|deploy|сервер|деплой/i)
      ]
    }  ];

  const checkpointTasks = {
    html:[L('Create a semantic article page with navigation, image, list and feedback form.','Собери семантическую страницу статьи: навигация, изображение, список и форма обратной связи.'), L('The structure remains clear without CSS; every input has a label; the image has useful alt text.','Структура понятна без CSS; у каждого поля есть label; у изображения полезный alt.')],
    css:[L('Style one responsive interface block for desktop and a 390 px phone.','Оформи один адаптивный интерфейсный блок для компьютера и телефона шириной 390 px.'), L('No horizontal scroll; spacing comes from gap/padding; focus and hover states are visible.','Нет горизонтального скролла; отступы сделаны через gap/padding; focus и hover заметны.')],
    js:[L('Build a form that rejects an empty value, renders a result and clears only after success.','Собери форму: пустое значение не принимается, результат выводится на страницу, поле очищается только после успеха.'), L('The logic uses submit, trim, one render point and no page reload.','Логика использует submit, trim, одну точку обновления и не перезагружает страницу.')],
    ts:[L('Describe a user object, a function argument and its return value with TypeScript.','Опиши через TypeScript объект пользователя, аргумент функции и возвращаемое значение.'), L('There is no any; invalid input produces a type error; names explain the domain.','Нет any; неверные данные дают ошибку типов; имена объясняют предметную область.')],
    react:[L('Build a small controlled form component with a list and an empty state.','Собери небольшой компонент с управляемой формой, списком и пустым состоянием.'), L('State is not mutated; list items have stable keys; submit behavior is predictable.','State не мутируется; у элементов стабильные key; submit работает предсказуемо.')],
    git:[L('Create a feature branch, make two meaningful commits and inspect the diff before merge.','Создай ветку функции, сделай два осмысленных коммита и проверь diff перед слиянием.'), L('Commit messages explain intent; unrelated changes are absent; the main branch stays clean.','Коммиты объясняют цель; лишних изменений нет; основная ветка остается чистой.')]
  };

  let api = null;
  let activePathId = localStorage.getItem(PATH_KEY) || 'frontend';
  let activeRouteStep = 0;
  let activeRoutePathId = '';
  let routeZoom = 1;
  let routePan = { x:0, y:0 };
  let topicsCache = null;
  let topicsBySectionCache = null;
  let masteryStateCache = null;

  function step(section, index, en, ru, match) {
    return { section, index, title:L(en,ru), match };
  }

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (error) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function blockTitle(block) {
    const node = block.querySelector('.block-title, h2, h3');
    if (!node) return L('Untitled topic','Тема без названия');
    const excluded = 'button,.badge,.anchor-icon,.wdgf-deep-actions,.wdg-mastery';
    const parts = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(textNode) {
        return textNode.parentElement?.closest(excluded)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
    return parts.join(' ').replace(/\s+/g,' ').trim();
  }

  function topics() {
    if (topicsCache) return topicsCache;

    topicsBySectionCache = new Map();
    topicsCache = COURSE_SECTIONS.flatMap(sectionId => {
      const section = document.getElementById('sec-' + sectionId);
      if (!section) return [];
      const sectionTopics = Array.from(section.querySelectorAll(':scope > .block')).map((block,index) => {
        const title = blockTitle(block);
        return {
          id:sectionId + '-' + index,
          sectionId,
          index,
          block,
          title,
          search:(title + ' ' + (block.querySelector('pre,code')?.textContent || '')).toLowerCase()
        };
      });
      topicsBySectionCache.set(sectionId, sectionTopics);
      return sectionTopics;
    });
    return topicsCache;
  }

  function invalidateTopicsCache() {
    topicsCache = null;
    topicsBySectionCache = null;
  }

  function enhanceSection(section) {
    const sectionId = section?.id?.replace(/^sec-/, '');
    if (!sectionId || !COURSE_SECTIONS.includes(sectionId)) return;
    Array.from(section.querySelectorAll(':scope > .block')).forEach((block, index) => {
      if (block.querySelector(':scope > .wdg-mastery')) return;
      const title = blockTitle(block);
      block.appendChild(masteryControl({
        id:sectionId + '-' + index,
        sectionId,
        index,
        block,
        title,
        search:(title + ' ' + (block.querySelector('pre,code')?.textContent || '')).toLowerCase()
      }));
    });
  }

  function state() {
    if (!masteryStateCache) masteryStateCache = readJson(STORE_KEY, {});
    return masteryStateCache;
  }

  function mastery(id) {
    const value = state()[id];
    return value && typeof value === 'object' ? value : { level:0, updatedAt:0 };
  }

  function setMastery(id, level) {
    const data = state();
    data[id] = { level:Math.max(0,Math.min(4,Number(level) || 0)), updatedAt:Date.now() };
    writeJson(STORE_KEY, data);
    document.querySelectorAll('[data-mastery-id="' + CSS.escape(id) + '"]').forEach(control => paintMastery(control, data[id]));
    document.dispatchEvent(new CustomEvent('wdg:mastery-change', { detail:{ id, ...data[id] } }));
    refreshOpenPaths();
  }

  function isDue(value) {
    return value.level > 0 && value.level < 4 && value.updatedAt > 0 && Date.now() - value.updatedAt > 7 * 86400000;
  }

  function paintMastery(control, value) {
    control.querySelectorAll('[data-mastery-level]').forEach(button => {
      const selected = Number(button.dataset.masteryLevel) === Number(value.level || 0);
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const label = control.querySelector('[data-mastery-label]');
    if (label) label.textContent = isDue(value) ? copy.due : LEVELS[value.level || 0].label;
    control.classList.toggle('due', isDue(value));
  }

  function masteryControl(topic) {
    const value = mastery(topic.id);
    const root = document.createElement('div');
    root.className = 'wdg-mastery';
    root.dataset.masteryId = topic.id;
    root.innerHTML = '<div class="wdg-mastery-copy"><span>' + copy.mastery + '</span><strong data-mastery-label></strong></div><div class="wdg-mastery-levels" role="group" aria-label="' + copy.level + '">' + LEVELS.map(item => '<button type="button" data-mastery-level="' + item.value + '" title="' + escapeHtml(item.label) + '" aria-label="' + escapeHtml(item.label) + '">' + item.short + '</button>').join('') + '</div>';
    root.querySelectorAll('[data-mastery-level]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      setMastery(topic.id, Number(button.dataset.masteryLevel));
    }));
    paintMastery(root, value);
    return root;
  }

  function enhanceMastery() {
    COURSE_SECTIONS
      .map(sectionId => document.getElementById('sec-' + sectionId))
      .filter(Boolean)
      .forEach(enhanceSection);
    enhanceCheckpoints();
  }

  function findTopic(routeStep) {
    topics();
    const list = topicsBySectionCache.get(routeStep.section) || [];
    return list.find(topic => routeStep.match?.test(topic.title.toLowerCase()))
      || list.find(topic => routeStep.match?.test(topic.search))
      || list[routeStep.index]
      || list[0]
      || null;
  }

  function openTopic(topic) {
    if (!topic) return;
    api?.close?.();
    if (typeof window.switchTabByName === 'function') window.switchTabByName(topic.sectionId);
    setTimeout(() => {
      topic.block.scrollIntoView({ behavior:'smooth', block:'start' });
      topic.block.classList.add('wdg-growth-target');
      setTimeout(() => topic.block.classList.remove('wdg-growth-target'), 1500);
    }, 100);
  }

  function pathProgress(path) {
    const values = path.steps.map(item => mastery(findTopic(item)?.id || '').level || 0);
    const total = values.reduce((sum,value) => sum + value,0);
    return { percent:Math.round(total / Math.max(1,path.steps.length * 4) * 100), independent:values.filter(value => value === 4).length };
  }

  function renderPaths() {
    const routeCopy = {
      title:L('Learning routes','Маршруты обучения'),
      subtitle:L('See the whole path, choose the next skill and move at your own pace.','Весь путь перед глазами: выбирай следующий навык и двигайся в своём темпе.'),
      plan:L('Development plan','План развития'),
      custom:L('My route','Свой маршрут'),
      current:L('Current stage','Текущий этап'),
      progress:L('Route progress','Прогресс маршрута'),
      next:L('Next target','Следующая цель'),
      duration:L('Estimated time','Оценка времени'),
      map:L('Skill map','Карта навыков'),
      inspector:L('Stage inspector','Инспектор этапа'),
      prerequisites:L('Prerequisites','Перед началом'),
      nextSteps:L('Next in route','Дальше по маршруту'),
      continue:L('Continue learning','Продолжить обучение'),
      practice:L('Practice in Forge','Практика в Forge'),
      mastered:L('Mastered','Освоено'),
      studying:L('In progress','Изучается'),
      available:L('Available','Доступно'),
      locked:L('Later','Позже'),
      weeks:L('weeks','недель'),
      lessons:L('topics','тем'),
      reset:L('Reset view','Сбросить вид'),
      hint:L('Drag the map to move around. Click a node to inspect it.','Перетаскивай карту мышью и нажимай на узлы, чтобы открыть подробности.'),
      milestones:L('Route milestones','Контрольные точки'),
      recommendation:L('Recommended next step','Следующий полезный шаг'),
      recommendationText:L('Finish the current topic, then rebuild its main example without looking at the lesson.','Закончи текущую тему, затем собери её главный пример без подсматривания в урок.'),
      open:L('Open topic','Открыть тему')
    };

    const allPaths = paths;
    const path = allPaths.find(item => item.id === activePathId) || allPaths[0];
    if (activeRoutePathId !== path.id) {
      const firstOpen = path.steps.findIndex(item => mastery(findTopic(item)?.id || '').level < 4);
      activeRouteStep = firstOpen < 0 ? Math.max(0,path.steps.length - 1) : firstOpen;
      activeRoutePathId = path.id;
    }
    activeRouteStep = Math.max(0,Math.min(activeRouteStep,path.steps.length - 1));

    const customPaths = allPaths.filter(item => item.id !== 'frontend' && item.id !== 'backend');
    const mode = path.id === 'frontend' || path.id === 'backend' ? path.id : 'custom';
    const progress = pathProgress(path);
    const values = path.steps.map(item => mastery(findTopic(item)?.id || '').level || 0);
    const currentIndex = values.findIndex(value => value < 4);
    const routeCurrentIndex = currentIndex < 0 ? path.steps.length - 1 : currentIndex;
    const selectedStep = path.steps[activeRouteStep];
    const selectedTopic = findTopic(selectedStep);
    const selectedMastery = mastery(selectedTopic?.id || '');
    const nextStep = path.steps[Math.min(routeCurrentIndex + 1,path.steps.length - 1)];
    const nextTopic = findTopic(nextStep);
    const points = [
      {x:78,y:245},{x:250,y:245},{x:422,y:245},{x:594,y:245},
      {x:770,y:145},{x:770,y:345},{x:948,y:245},{x:1122,y:245},
      {x:1122,y:425},{x:948,y:425}
    ];
    const statusFor = (value,index) => value === 4 ? 'done' : index === routeCurrentIndex ? 'current' : index < routeCurrentIndex + 2 ? 'available' : 'locked';
    const statusLabel = status => ({done:routeCopy.mastered,current:routeCopy.studying,available:routeCopy.available,locked:routeCopy.locked})[status];
    const routeEdges = path.steps.slice(1).map((item,index) => {
      const from = points[index] || points[points.length - 2];
      const to = points[index + 1] || points[points.length - 1];
      return '<line x1="' + (from.x + 42) + '" y1="' + (from.y + 42) + '" x2="' + (to.x + 42) + '" y2="' + (to.y + 42) + '" class="' + (values[index] === 4 ? 'is-done' : '') + '"></line>';
    }).join('');
    const routeNodes = path.steps.map((item,index) => {
      const topic = findTopic(item);
      const value = mastery(topic?.id || '').level || 0;
      const status = statusFor(value,index);
      const point = points[index] || {x:1122,y:425};
      const section = item.section === 'js' ? 'JS' : item.section.toUpperCase();
      return '<button type="button" class="wdg-route-node is-' + status + ' ' + (index === activeRouteStep ? 'is-selected' : '') + '" style="left:' + point.x + 'px;top:' + point.y + 'px" data-route-node="' + index + '">' +
        '<span class="wdg-route-node-icon">' + escapeHtml(section.slice(0,3)) + '</span>' +
        '<span class="wdg-route-node-copy"><strong>' + escapeHtml(topic?.title || item.title) + '</strong><small>' + statusLabel(status) + (value ? ' · ' + value + '/4' : '') + '</small></span>' +
        '<i>' + (status === 'done' ? icon('tabler:check',14) : status === 'locked' ? icon('tabler:lock',13) : index + 1) + '</i></button>';
    }).join('');

    const milestoneIndexes = [0,Math.floor((path.steps.length - 1) / 2),path.steps.length - 1].filter((value,index,array) => array.indexOf(value) === index);
    const milestones = milestoneIndexes.map((index,position) => {
      const item = path.steps[index];
      const topic = findTopic(item);
      const done = values.slice(0,index + 1).every(value => value === 4);
      return '<div class="wdg-route-milestone ' + (done ? 'is-done' : index === routeCurrentIndex ? 'is-current' : '') + '"><span>' + (done ? icon('tabler:check',14) : position + 1) + '</span><div><small>' + L('Milestone','Этап') + ' ' + (position + 1) + '</small><strong>' + escapeHtml(topic?.title || item.title) + '</strong></div></div>';
    }).join('');

    const customSelect = '<select class="wdg-route-custom-select" data-route-custom aria-label="' + routeCopy.custom + '">' +
      customPaths.map(item => '<option value="' + item.id + '" ' + (item.id === path.id ? 'selected' : '') + '>' + escapeHtml(item.title) + '</option>').join('') + '</select>';
    const selectedStatus = statusFor(selectedMastery.level || 0,activeRouteStep);
    const prerequisite = path.steps[Math.max(0,activeRouteStep - 1)];
    const following = path.steps.slice(activeRouteStep + 1,activeRouteStep + 3);

    const body = '<div class="wdg-route-atlas">' +
      '<section class="wdg-route-command"><div class="wdg-route-command-copy"><span>' + routeCopy.plan + '</span><strong>' + escapeHtml(path.title) + '</strong><small>' + escapeHtml(path.description) + '</small></div>' +
      '<div class="wdg-route-modes mode-' + mode + '" role="group"><button type="button" class="' + (mode === 'frontend' ? 'active' : '') + '" data-route-mode="frontend">' + icon('tabler:layout',15) + ' Frontend</button><button type="button" class="' + (mode === 'backend' ? 'active' : '') + '" data-route-mode="backend">' + icon('tabler:server',15) + ' Backend</button><button type="button" class="' + (mode === 'custom' ? 'active' : '') + '" data-route-mode="custom">' + icon('tabler:route',15) + ' ' + routeCopy.custom + '</button>' + customSelect + '</div></section>' +
      '<section class="wdg-route-summary"><article><small>' + routeCopy.current + '</small><strong>' + escapeHtml(findTopic(path.steps[routeCurrentIndex])?.title || path.steps[routeCurrentIndex].title) + '</strong><span>' + (routeCurrentIndex + 1) + ' / ' + path.steps.length + '</span></article><article><small>' + routeCopy.progress + '</small><strong>' + progress.percent + '%</strong><i><b style="width:' + progress.percent + '%"></b></i></article><article><small>' + routeCopy.next + '</small><strong>' + escapeHtml(nextTopic?.title || nextStep.title) + '</strong><span>' + escapeHtml(nextStep.section.toUpperCase()) + '</span></article><article><small>' + routeCopy.duration + '</small><strong>~' + Math.max(1,Math.ceil((path.steps.length - progress.independent) * 1.4)) + ' ' + routeCopy.weeks + '</strong><span>' + path.steps.length + ' ' + routeCopy.lessons + '</span></article></section>' +
      '<div class="wdg-route-workspace"><section class="wdg-route-map-panel"><header><div><small>' + routeCopy.map + '</small><strong>' + escapeHtml(path.title) + '</strong></div><div class="wdg-route-map-tools"><button type="button" data-route-zoom="-0.1" title="Zoom out">' + icon('tabler:minus',16) + '</button><span data-route-zoom-label>' + Math.round(routeZoom * 100) + '%</span><button type="button" data-route-zoom="0.1" title="Zoom in">' + icon('tabler:plus',16) + '</button><button type="button" data-route-reset title="' + routeCopy.reset + '">' + icon('tabler:focus-2',16) + '</button></div></header>' +
      '<div class="wdg-route-map-viewport" data-route-viewport><div class="wdg-route-map-world" data-route-world style="transform:translate(' + routePan.x + 'px,' + routePan.y + 'px) scale(' + routeZoom + ')"><svg viewBox="0 0 1260 560" aria-hidden="true">' + routeEdges + '</svg>' + routeNodes + '</div></div><footer><span>' + icon('tabler:hand-move',15) + ' ' + routeCopy.hint + '</span><div><i class="done"></i>' + routeCopy.mastered + '<i class="current"></i>' + routeCopy.studying + '<i></i>' + routeCopy.locked + '</div></footer></section>' +
      '<aside class="wdg-route-inspector"><header><span>' + routeCopy.inspector + '</span><b class="is-' + selectedStatus + '">' + statusLabel(selectedStatus) + '</b></header><div class="wdg-route-inspector-hero"><i>' + escapeHtml(selectedStep.section.toUpperCase().slice(0,3)) + '</i><div><small>' + escapeHtml(selectedStep.section.toUpperCase()) + '</small><h2>' + escapeHtml(selectedTopic?.title || selectedStep.title) + '</h2><p>' + escapeHtml(selectedStep.title) + '</p></div></div><div class="wdg-route-inspector-progress"><span><b>' + selectedMastery.level + '/4</b> ' + routeCopy.progress + '</span><i><b style="width:' + (selectedMastery.level / 4 * 100) + '%"></b></i></div>' +
      '<section><h3>' + routeCopy.prerequisites + '</h3><div class="wdg-route-prerequisite">' + icon(activeRouteStep === 0 || values[activeRouteStep - 1] === 4 ? 'tabler:circle-check' : 'tabler:circle-dashed',17) + '<span>' + (activeRouteStep === 0 ? L('You can start immediately','Можно начинать сразу') : escapeHtml(findTopic(prerequisite)?.title || prerequisite.title)) + '</span></div></section>' +
      '<section><h3>' + routeCopy.nextSteps + '</h3>' + (following.length ? following.map((item,index) => '<button type="button" data-route-node="' + (activeRouteStep + index + 1) + '"><span>' + (activeRouteStep + index + 2) + '</span>' + escapeHtml(findTopic(item)?.title || item.title) + icon('tabler:chevron-right',15) + '</button>').join('') : '<p>' + L('This is the final stage of the route.','Это финальный этап маршрута.') + '</p>') + '</section>' +
      '<div class="wdg-route-inspector-actions"><button type="button" class="primary" data-route-open="' + activeRouteStep + '">' + routeCopy.continue + ' ' + icon('tabler:arrow-right',16) + '</button><button type="button" data-route-forge>' + icon('tabler:hammer',16) + ' ' + routeCopy.practice + '</button></div></aside></div>' +
      '<section class="wdg-route-milestones"><header><span>' + routeCopy.milestones + '</span><small>' + progress.independent + ' / ' + path.steps.length + '</small></header><div>' + milestones + '</div></section>' +
      '<section class="wdg-route-recommendation"><span>' + icon('tabler:sparkles',18) + '</span><div><small>' + routeCopy.recommendation + '</small><strong>' + routeCopy.recommendationText + '</strong></div><button type="button" data-route-open="' + routeCurrentIndex + '">' + routeCopy.open + ' ' + icon('tabler:arrow-up-right',15) + '</button></section></div>';

    const page = api.pageShell('paths', routeCopy.title, routeCopy.subtitle, body);
    const world = page.querySelector('[data-route-world]');
    const viewport = page.querySelector('[data-route-viewport]');
    const applyTransform = () => {
      if (world) world.style.transform = 'translate(' + routePan.x + 'px,' + routePan.y + 'px) scale(' + routeZoom + ')';
      const label = page.querySelector('[data-route-zoom-label]');
      if (label) label.textContent = Math.round(routeZoom * 100) + '%';
    };
    page.querySelectorAll('[data-route-mode]').forEach(button => button.addEventListener('click', () => {
      const target = button.dataset.routeMode;
      activePathId = target === 'custom' ? (customPaths[0]?.id || 'frontend') : target;
      localStorage.setItem(PATH_KEY,activePathId);
      activeRoutePathId = '';
      renderPaths();
    }));
    page.querySelector('[data-route-custom]')?.addEventListener('change', event => {
      activePathId = event.target.value;
      localStorage.setItem(PATH_KEY,activePathId);
      activeRoutePathId = '';
      renderPaths();
    });
    page.querySelectorAll('[data-route-node]').forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      activeRouteStep = Number(button.dataset.routeNode) || 0;
      renderPaths();
    }));
    page.querySelectorAll('[data-route-open]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.routeOpen) || 0;
      openTopic(findTopic(path.steps[index]));
    }));
    page.querySelector('[data-route-forge]')?.addEventListener('click', () => api.open('forge'));
    page.querySelectorAll('[data-route-zoom]').forEach(button => button.addEventListener('click', () => {
      routeZoom = Math.max(.7,Math.min(1.45,routeZoom + Number(button.dataset.routeZoom)));
      applyTransform();
    }));
    page.querySelector('[data-route-reset]')?.addEventListener('click', () => {
      routeZoom = 1;
      routePan = {x:0,y:0};
      applyTransform();
    });
    if (viewport) {
      let drag = null;
      viewport.addEventListener('pointerdown', event => {
        if (event.target.closest('button')) return;
        drag = {x:event.clientX,y:event.clientY,startX:routePan.x,startY:routePan.y};
        viewport.classList.add('is-dragging');
        viewport.setPointerCapture?.(event.pointerId);
      });
      viewport.addEventListener('pointermove', event => {
        if (!drag) return;
        routePan.x = drag.startX + event.clientX - drag.x;
        routePan.y = drag.startY + event.clientY - drag.y;
        applyTransform();
      });
      const stopDrag = () => { drag = null; viewport.classList.remove('is-dragging'); };
      viewport.addEventListener('pointerup', stopDrag);
      viewport.addEventListener('pointercancel', stopDrag);
    }
    return page;
  }

  function refreshOpenPaths() {
    if (document.querySelector('.wdgf-feature-page[data-feature-page="paths"].open')) renderPaths();
    else api?.invalidate?.('paths');
  }

  function checkpointData(sectionId) {
    return checkpointTasks[sectionId] || [
      L('Build one small example that combines the three most important ideas from this section.','Собери один небольшой пример, который объединяет три главные идеи раздела.'),
      L('It works after reload, has no console errors and you can explain every step.','Он работает после перезагрузки, не дает ошибок в консоли, и ты можешь объяснить каждый шаг.')
    ];
  }

  function enhanceCheckpoints() {
    const completed = readJson(CHECKPOINT_KEY, {});
    COURSE_SECTIONS.forEach(sectionId => {
      const section = document.getElementById('sec-' + sectionId);
      if (!section || section.querySelector(':scope > .wdg-growth-checkpoint')) return;
      const data = checkpointData(sectionId);
      const panel = document.createElement('section');
      panel.className = 'wdg-growth-checkpoint ' + (completed[sectionId] ? 'done' : '');
      panel.innerHTML = '<header><span>' + icon('tabler:flag-3',18) + '</span><div><small>' + copy.checkpoint + '</small><h2>' + sectionId.toUpperCase() + '</h2></div></header><p>' + escapeHtml(data[0]) + '</p><div class="wdg-growth-criteria"><strong>' + copy.criteria + '</strong><span>' + escapeHtml(data[1]) + '</span></div><footer><button class="wdgf-btn" type="button" data-checkpoint-forge>' + icon('tabler:hammer',15) + ' ' + copy.openForge + '</button><label><input type="checkbox" data-checkpoint-done ' + (completed[sectionId] ? 'checked' : '') + '><span>' + copy.done + '</span></label></footer>';
      panel.querySelector('[data-checkpoint-forge]').addEventListener('click', () => api?.open?.('forge'));
      panel.querySelector('[data-checkpoint-done]').addEventListener('change', event => {
        const values = readJson(CHECKPOINT_KEY, {});
        values[sectionId] = event.target.checked;
        writeJson(CHECKPOINT_KEY, values);
        panel.classList.toggle('done', event.target.checked);
        api?.logActivity?.(event.target.checked ? 3 : -1);
      });
      section.appendChild(panel);
    });
  }

  function chooseRepeat() {
    const list = topics().map(topic => ({ ...topic, mastery:mastery(topic.id) })).filter(topic => topic.mastery.level > 0);
    return list.sort((a,b) => (isDue(b.mastery) - isDue(a.mastery)) || (a.mastery.updatedAt - b.mastery.updatedAt))[0] || null;
  }

  function chooseLearn() {
    const active = paths.find(item => item.id === activePathId) || paths[0];
    for (const routeStep of active.steps) {
      const topic = findTopic(routeStep);
      if (topic && mastery(topic.id).level < 2) return topic;
    }
    return topics().find(topic => mastery(topic.id).level < 2) || null;
  }

  function addNavigation() {
    const nav = document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById('wdgGrowthNavBtn')) return;
    const button = document.createElement('button');
    button.className = 'wdg-nav-btn';
    button.id = 'wdgGrowthNavBtn';
    button.type = 'button';
    button.dataset.wdgFeature = 'paths';
    button.innerHTML = icon('tabler:route',19) + '<span>' + copy.nav + '</span>';
    button.addEventListener('click', () => api.open('paths'));
    const today = document.getElementById('wdgTodayBtn');
    if (today) today.after(button);
    else document.getElementById('wdgfDashboardBtn')?.after(button);
  }

  function init() {
    api = window.WebDevGymFeatures;
    if (!api?.register) { setTimeout(init,80); return; }
    api.register('paths', renderPaths, { title:copy.title, icon:'tabler:route', group:L('Learning','Обучение'), cacheOnNavigation:true });
    addNavigation();
    enhanceMastery();
    document.querySelectorAll('.section').forEach(section => {
      let frame = 0;
      let knownBlocks = Array.from(section.querySelectorAll(':scope > .block'));
      new MutationObserver(() => {
        const currentBlocks = Array.from(section.querySelectorAll(':scope > .block'));
        const topicsChanged = currentBlocks.length !== knownBlocks.length ||
          currentBlocks.some((block, index) => block !== knownBlocks[index]);
        if (!topicsChanged) return;
        knownBlocks = currentBlocks;
        invalidateTopicsCache();
        api?.invalidate?.('paths');
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          enhanceSection(section);
        });
      }).observe(section, { childList:true });
    });
    window.addEventListener('storage', event => {
      if (event.key === STORE_KEY) masteryStateCache = null;
    });
    document.addEventListener('webdevgym:progress-imported', () => {
      masteryStateCache = null;
    });
    window.WebDevGymGrowth = { topics, mastery, setMastery, chooseRepeat, chooseLearn, openTopic, open:() => api.open('paths') };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init,180));
  else setTimeout(init,180);
})();
