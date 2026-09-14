(function extendCurriculumDepth() {
  'use strict';

  const data = window.WebDevGymCurriculumData;
  if (!data || !Array.isArray(data.sections)) return;

  const isEnglish = data.locale === 'en';
  const L = (en, ru) => isEnglish ? en : ru;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function lesson(definition) {
    const checklist = definition.checklist.map((item, index) => (
      '<label class="item"><input type="checkbox" class="prog-cb" ' +
      'data-pid="depth-' + definition.id + '-' + (index + 1) + '" ' +
      'onchange="updateProgress(this)"><span>' + item + '</span></label>'
    )).join('');

    const docs = definition.docs.map(item => (
      '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(item.label) + '</a>'
    )).join(' · ');

    const html = '<div class="block wdg-depth-lesson" id="' + definition.id + '">' +
      '<div class="block-title" onclick="scrollToBlock(\'' + definition.id + '\')">' +
      escapeHtml(definition.title) +
      ' <span class="badge ' + (definition.badgeClass || 'good') + '">' +
      escapeHtml(definition.badge) + '</span><span class="anchor-icon">#</span></div>' +
      '<div class="tip">' + definition.tip + '</div>' +
      '<div class="code">' + escapeHtml(definition.code) + '</div>' +
      '<div class="explain">' + definition.explain + '</div>' +
      '<div class="wdg-depth-practice"><strong>' +
      L('Practice before marking complete', 'Практика до отметки «готово»') +
      ':</strong> ' + definition.practice + '</div>' +
      '<div class="wdg-depth-docs"><strong>' +
      L('Official sources', 'Официальные источники') + ':</strong> ' + docs + '</div>' +
      '<div class="items">' + checklist + '</div>' +
      '</div>';

    return {
      id: definition.id,
      title: definition.title + ' ' + definition.badge + ' #',
      html
    };
  }

  function add(sectionId, definitions) {
    const section = data.sections.find(item => item.id === sectionId);
    if (!section) return;
    const known = new Set(section.lessons.map(item => item.id));
    definitions.forEach(definition => {
      if (!known.has(definition.id)) section.lessons.push(lesson(definition));
    });
  }

  add('sec-roadmap', [{
    id: 'block-project-track-2026',
    title: L('Project track: from layout to product', 'Проектный трек: от вёрстки до продукта'),
    badge: L('ROADMAP', 'МАРШРУТ'),
    tip: L(
      'A technology becomes a skill only when you can use it inside a finished project. Complete these projects in order and keep evidence in GitHub.',
      'Технология становится навыком только тогда, когда ты применил её в законченном проекте. Делай проекты по порядку и сохраняй подтверждение в GitHub.'
    ),
    code: L(
      '1. Responsive landing\n   HTML + CSS, semantic structure, keyboard access\n\n2. Vanilla JavaScript app\n   DOM, forms, localStorage, fetch, loading/error states\n\n3. React + TypeScript SPA\n   Routing, typed API, forms, tests, component boundaries\n\n4. BaaS product\n   Supabase/Firebase auth, database rules, storage, deployment',
      '1. Адаптивный лендинг\n   HTML + CSS, семантика, клавиатурная доступность\n\n2. Приложение на чистом JavaScript\n   DOM, формы, localStorage, fetch, состояния загрузки и ошибки\n\n3. SPA на React + TypeScript\n   Роутинг, типизированный API, формы, тесты, границы компонентов\n\n4. Продукт с BaaS\n   Авторизация Supabase/Firebase, правила БД, файлы, деплой'
    ),
    explain: L(
      '<strong>Acceptance rule:</strong> a project is complete only when its main flow works on mobile, keyboard navigation is possible, errors are visible, the README explains setup, and the deployed version matches the repository. Next.js and a team project are optional advanced steps, not beginner requirements.',
      '<strong>Правило приёмки:</strong> проект готов, только если основной сценарий работает на телефоне, есть навигация клавиатурой, ошибки видны пользователю, README объясняет запуск, а опубликованная версия совпадает с репозиторием. Next.js и командный проект — факультативные следующие шаги, а не требования к новичку.'
    ),
    practice: L(
      'Choose the first unfinished project. Write five acceptance checks before writing code, then add the repository and live link to the local profile.',
      'Выбери первый незаконченный проект. До написания кода составь пять критериев приёмки, а после добавь репозиторий и опубликованную ссылку в локальный профиль.'
    ),
    checklist: [
      L('I can explain why every project is harder than the previous one', 'Могу объяснить, почему каждый следующий проект сложнее предыдущего'),
      L('Every project has acceptance criteria and a README', 'У каждого проекта есть критерии приёмки и README'),
      L('I keep source code and a live version as evidence', 'Сохраняю исходный код и опубликованную версию как подтверждение')
    ],
    docs: [
      { label: 'GitHub README', url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes' },
      { label: 'GitHub Pages', url: 'https://docs.github.com/en/pages' }
    ]
  }]);

  add('sec-css', [
    {
      id: 'block-css-architecture-2026',
      title: L('Choosing a CSS architecture', 'Выбор архитектуры CSS'),
      badge: L('PRACTICE', 'ПРАКТИКА'),
      tip: L(
        'Tailwind, CSS Modules and CSS-in-JS solve different problems. Choose from project constraints instead of treating one tool as universally best.',
        'Tailwind, CSS Modules и CSS-in-JS решают разные задачи. Выбирай по ограничениям проекта, а не считай один инструмент лучшим для всех случаев.'
      ),
      code: L(
        '/* CSS Module: local class names */\n.card { display: grid; gap: 1rem; }\n\n// React\nimport styles from "./Card.module.css";\nexport function Card() {\n  return <article className={styles.card}>...</article>;\n}\n\n<!-- Tailwind: utilities in markup -->\n<article class="grid gap-4 rounded border p-4">...</article>',
        '/* CSS Module: локальные имена классов */\n.card { display: grid; gap: 1rem; }\n\n// React\nimport styles from "./Card.module.css";\nexport function Card() {\n  return <article className={styles.card}>...</article>;\n}\n\n<!-- Tailwind: утилиты в разметке -->\n<article class="grid gap-4 rounded border p-4">...</article>'
      ),
      explain: L(
        '<strong>CSS Modules</strong> fit component projects that need normal CSS with local scope. <strong>Tailwind</strong> speeds up consistent UI assembly when the team accepts utility classes. <strong>CSS-in-JS</strong> can express styles from runtime props, but adds runtime or build complexity. Learn plain CSS first: tools do not replace cascade, layout or accessibility.',
        '<strong>CSS Modules</strong> подходят компонентным проектам, где нужен обычный CSS с локальной областью. <strong>Tailwind</strong> ускоряет сборку единообразного UI, если команда принимает utility-классы. <strong>CSS-in-JS</strong> умеет строить стили из runtime-пропсов, но усложняет сборку или выполнение. Сначала освой обычный CSS: инструменты не заменяют каскад, раскладку и доступность.'
      ),
      practice: L(
        'Build the same card with plain CSS and one component-oriented approach. Compare readability, duplication, responsive changes and bundle cost.',
        'Собери одну карточку на обычном CSS и одним компонентным подходом. Сравни читаемость, повторения, адаптивные изменения и стоимость для сборки.'
      ),
      checklist: [
        L('I choose a styling approach from project needs', 'Выбираю подход к стилям по требованиям проекта'),
        L('I understand local scope and utility classes', 'Понимаю локальную область и utility-классы'),
        L('I do not use a library to avoid learning CSS', 'Не использую библиотеку вместо изучения CSS')
      ],
      docs: [
        { label: 'CSS Modules', url: 'https://github.com/css-modules/css-modules' },
        { label: 'Tailwind CSS', url: 'https://tailwindcss.com/docs/styling-with-utility-classes' }
      ]
    },
    {
      id: 'block-css-animation-performance-2026',
      title: L('Animation without layout jank', 'Анимация без рывков раскладки'),
      badge: L('PERFORMANCE', 'ПРОИЗВОДИТЕЛЬНОСТЬ'),
      tip: L(
        'Prefer transform and opacity for movement and fading. Animating layout properties can force repeated layout and paint work.',
        'Для движения и исчезновения предпочитай transform и opacity. Анимация свойств раскладки может многократно запускать перерасчёт и перерисовку.'
      ),
      code: '.card {\n  transform: translateY(0);\n  opacity: 1;\n  transition: transform 180ms ease, opacity 180ms ease;\n}\n\n.card.is-hidden {\n  transform: translateY(8px);\n  opacity: 0;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }\n}',
      explain: L(
        '<code>transform</code> changes how the already-laid-out element is composited; <code>top</code>, <code>left</code>, width and height can affect layout. Do not add <code>will-change</code> everywhere: it consumes memory. Respect <code>prefers-reduced-motion</code> so animation is not a barrier.',
        '<code>transform</code> меняет композицию уже рассчитанного элемента; <code>top</code>, <code>left</code>, width и height могут затрагивать раскладку. Не добавляй <code>will-change</code> повсюду: он расходует память. Учитывай <code>prefers-reduced-motion</code>, чтобы анимация не становилась препятствием.'
      ),
      practice: L(
        'Replace a top/left hover movement with translate. Record the Performance panel and verify that the interaction does not continuously trigger layout.',
        'Замени движение через top/left на translate. Запиши взаимодействие в Performance и проверь, что оно не вызывает постоянный layout.'
      ),
      checklist: [
        L('I animate transform and opacity when possible', 'По возможности анимирую transform и opacity'),
        L('I support reduced motion', 'Поддерживаю уменьшение движения'),
        L('I verify performance instead of guessing', 'Проверяю производительность, а не угадываю')
      ],
      docs: [
        { label: 'web.dev animations', url: 'https://web.dev/learn/css/animations' },
        { label: 'prefers-reduced-motion', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion' }
      ]
    },
    {
      id: 'block-css-container-practice-2026',
      title: L('Container queries in a reusable component', 'Container Queries в переиспользуемом компоненте'),
      badge: L('MODERN CSS', 'СОВРЕМЕННЫЙ CSS'),
      tip: L(
        'A media query reacts to the viewport. A container query lets one component react to the space it actually receives.',
        'Media query реагирует на окно браузера. Container query позволяет компоненту реагировать на пространство, которое он реально получил.'
      ),
      code: '.card-shell { container-type: inline-size; }\n.card { display: grid; gap: 12px; }\n\n@container (width >= 420px) {\n  .card { grid-template-columns: 140px 1fr; align-items: center; }\n}\n\n@supports not (container-type: inline-size) {\n  .card { display: flex; flex-wrap: wrap; }\n}',
      explain: L(
        'Set the containment context on the parent, then query its inline size. Keep a reasonable base layout so old browsers still receive usable content. Container queries complement media queries; they do not replace viewport, input-mode or reduced-motion queries.',
        'Задай контекст контейнера родителю, затем проверяй его inline-размер. Сохраняй нормальную базовую раскладку, чтобы старые браузеры получили рабочий интерфейс. Container queries дополняют media queries, но не заменяют проверки viewport, способа ввода или reduced motion.'
      ),
      practice: L(
        'Place the same card in a narrow sidebar and a wide content area. It must adapt differently without changing viewport width.',
        'Размести одну карточку в узком sidebar и широкой области контента. Она должна перестраиваться по-разному без изменения ширины окна.'
      ),
      checklist: [
        L('I set a containment context on the parent', 'Задаю контекст контейнера родителю'),
        L('The component works without the query', 'Компонент работает и без запроса'),
        L('I know when a media query is still required', 'Понимаю, когда всё ещё нужен media query')
      ],
      docs: [
        { label: 'MDN Container queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries' }
      ]
    }
  ]);

  add('sec-js', [
    {
      id: 'block-js-resilient-fetch-2026',
      title: L('Resilient fetch: errors, timeout and cancel', 'Устойчивый fetch: ошибки, таймаут и отмена'),
      badge: L('REAL API', 'РЕАЛЬНЫЙ API'),
      tip: L(
        'fetch rejects on a network failure, but HTTP 404 or 500 still resolve normally. Check response.ok and make cancellation part of the request lifecycle.',
        'fetch отклоняется при сетевой ошибке, но HTTP 404 или 500 всё равно завершаются успешно на уровне Promise. Проверяй response.ok и включай отмену в жизненный цикл запроса.'
      ),
      code: 'async function loadUser(id, signal) {\n  const response = await fetch(`/api/users/${id}`, { signal });\n\n  if (!response.ok) {\n    throw new Error(`HTTP ${response.status}`);\n  }\n\n  return response.json();\n}\n\nconst controller = new AbortController();\nconst timeoutId = setTimeout(() => controller.abort(), 5000);\n\ntry {\n  const user = await loadUser(42, controller.signal);\n  console.log(user);\n} catch (error) {\n  if (error.name !== "AbortError") console.error(error);\n} finally {\n  clearTimeout(timeoutId);\n}',
      explain: L(
        'Keep four UI states explicit: idle, loading, success and error. Cancel stale requests when a component unmounts or a newer search starts. Retry only operations that are safe to repeat, use a delay, and limit attempts. Authentication refresh belongs to a trusted backend or BaaS flow, not a secret embedded in GitHub Pages.',
        'Явно храни четыре состояния UI: idle, loading, success и error. Отменяй устаревший запрос при размонтировании компонента или новом поиске. Повторяй только безопасные для повторения операции, добавляй задержку и ограничивай число попыток. Обновление авторизации должно проходить через доверенный backend или BaaS, а не через секрет внутри GitHub Pages.'
      ),
      practice: L(
        'Create a search that cancels the previous request, shows loading, handles HTTP errors and never displays an older response over a newer one.',
        'Сделай поиск, который отменяет предыдущий запрос, показывает загрузку, обрабатывает HTTP-ошибки и не позволяет старому ответу перезаписать новый.'
      ),
      checklist: [
        L('I check response.ok', 'Проверяю response.ok'),
        L('I display loading and error states', 'Показываю состояния загрузки и ошибки'),
        L('I cancel stale requests', 'Отменяю устаревшие запросы')
      ],
      docs: [
        { label: 'MDN fetch', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch' },
        { label: 'AbortController', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController' }
      ]
    },
    {
      id: 'block-js-modules-boundaries-2026',
      title: L('JavaScript modules and responsibility boundaries', 'Модули JavaScript и границы ответственности'),
      badge: L('ARCHITECTURE', 'АРХИТЕКТУРА'),
      tip: L(
        'Split by responsibility, not by file size. Data access, state changes and DOM rendering should not become one giant handler.',
        'Разделяй по ответственности, а не по размеру файла. Доступ к данным, изменение состояния и отрисовка DOM не должны превращаться в один огромный обработчик.'
      ),
      code: '// api.js\nexport async function getTasks() { /* fetch + HTTP check */ }\n\n// state.js\nexport function addTask(state, title) {\n  return [...state, { id: crypto.randomUUID(), title, done: false }];\n}\n\n// view.js\nexport function renderTasks(root, tasks) { /* DOM only */ }\n\n// main.js\nimport { getTasks } from "./api.js";\nimport { renderTasks } from "./view.js";',
      explain: L(
        'A useful module has a small public API and hides its implementation. Pure state functions are easy to test because they do not depend on the DOM. The entry module coordinates features; it should not own every detail. Avoid circular imports and modules that expose writable global objects.',
        'Полезный модуль имеет маленький публичный API и скрывает реализацию. Чистые функции состояния легко тестировать, потому что они не зависят от DOM. Входной модуль связывает части, но не обязан содержать каждую деталь. Избегай циклических импортов и модулей, которые отдают наружу изменяемые глобальные объекты.'
      ),
      practice: L(
        'Take one existing mini-project and split it into state, view and main modules. The visible behavior must remain unchanged.',
        'Возьми существующий мини-проект и раздели его на state, view и main. Видимое поведение не должно измениться.'
      ),
      checklist: [
        L('Each module has one clear responsibility', 'У каждого модуля одна понятная ответственность'),
        L('State logic can run without the DOM', 'Логика состояния работает без DOM'),
        L('Imports do not form a circle', 'Импорты не образуют цикл')
      ],
      docs: [
        { label: 'MDN JavaScript modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules' }
      ]
    }
  ]);

  add('sec-ts', [
    {
      id: 'block-ts-branded-types-2026',
      title: L('Branded types for values with the same shape', 'Branded types для одинаковых по форме значений'),
      badge: L('ADVANCED TS', 'УГЛУБЛЁННЫЙ TS'),
      tip: L(
        'UserId and OrderId can both be strings but still represent incompatible values. A brand lets TypeScript preserve that domain difference.',
        'UserId и OrderId могут быть строками, но обозначать несовместимые значения. Brand позволяет TypeScript сохранить это различие предметной области.'
      ),
      code: 'type Brand<Value, Name extends string> = Value & {\n  readonly __brand: Name;\n};\n\ntype UserId = Brand<string, "UserId">;\ntype OrderId = Brand<string, "OrderId">;\n\nfunction asUserId(value: string): UserId {\n  if (!value.trim()) throw new Error("Invalid user id");\n  return value as UserId;\n}\n\nfunction loadUser(id: UserId) { /* ... */ }\n\nconst userId = asUserId("user-42");\nloadUser(userId);',
      explain: L(
        'A brand is compile-time information; it does not validate runtime input by itself. Create branded values only after parsing or validation. Use this pattern where mixing identifiers, currencies or validated strings would cause a real bug, not for every primitive.',
        'Brand существует только при проверке типов; сам по себе он не валидирует runtime-значение. Создавай branded-значения только после разбора или проверки. Используй паттерн там, где смешивание идентификаторов, валют или проверенных строк действительно приведёт к ошибке, а не для каждого примитива.'
      ),
      practice: L(
        'Create ProductId and CategoryId. Write functions that accept only the correct identifier and verify that accidental mixing fails during type checking.',
        'Создай ProductId и CategoryId. Напиши функции, принимающие только нужный идентификатор, и проверь, что случайное смешивание ломает type-check.'
      ),
      checklist: [
        L('I validate before applying a brand', 'Проверяю значение до присвоения brand'),
        L('I use brands only for meaningful domain differences', 'Использую brand только для важных различий'),
        L('I understand that brands do not exist at runtime', 'Понимаю, что brand отсутствует в runtime')
      ],
      docs: [
        { label: 'TypeScript narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' }
      ]
    },
    {
      id: 'block-ts-tsconfig-2026',
      title: L('tsconfig as a quality contract', 'tsconfig как контракт качества'),
      badge: L('CONFIG', 'КОНФИГУРАЦИЯ'),
      tip: L(
        'tsconfig is not a random copied file. It defines the runtime target, module system and how much unsafe code TypeScript accepts.',
        'tsconfig — не случайный файл из чужого проекта. Он определяет runtime-цель, систему модулей и объём небезопасного кода, который TypeScript разрешает.'
      ),
      code: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "Bundler",\n    "strict": true,\n    "noUncheckedIndexedAccess": true,\n    "exactOptionalPropertyTypes": true,\n    "verbatimModuleSyntax": true,\n    "noEmit": true\n  },\n  "include": ["src"]\n}',
      explain: L(
        '<code>strict</code> enables the main safety checks. <code>noUncheckedIndexedAccess</code> reminds you that an array or dictionary lookup may return undefined. <code>noEmit</code> is appropriate when Vite handles output and TypeScript only checks types. Match module settings to the actual toolchain; Node, a browser bundle and a library do not need identical configs.',
        '<code>strict</code> включает основные проверки безопасности. <code>noUncheckedIndexedAccess</code> напоминает, что обращение к массиву или словарю может вернуть undefined. <code>noEmit</code> подходит, когда выводом занимается Vite, а TypeScript только проверяет типы. Настройки модулей должны соответствовать инструментам: Node, браузерная сборка и библиотека требуют разных конфигураций.'
      ),
      practice: L(
        'Enable one stricter option in a small project, fix every resulting error and write down which real bug each fix prevents.',
        'Включи одну более строгую опцию в маленьком проекте, исправь все ошибки и запиши, какую реальную проблему предотвращает каждое исправление.'
      ),
      checklist: [
        L('strict is enabled', 'Включён strict'),
        L('I can explain my target and module settings', 'Могу объяснить target и module'),
        L('I do not silence errors with widespread any', 'Не заглушаю ошибки массовым any')
      ],
      docs: [
        { label: 'TSConfig reference', url: 'https://www.typescriptlang.org/tsconfig/' }
      ]
    },
    {
      id: 'block-ts-react-events-2026',
      title: L('Typing React events and reusable components', 'Типизация событий React и переиспользуемых компонентов'),
      badge: L('REACT + TS', 'REACT + TS'),
      tip: L(
        'Type the event at the boundary where it enters your code. Do not use any just because the editor shows a long React type.',
        'Типизируй событие на границе, где оно входит в твой код. Не используй any только потому, что редактор показывает длинный React-тип.'
      ),
      code: 'type SelectProps<T extends string> = {\n  value: T;\n  options: readonly T[];\n  onChange: (value: T) => void;\n};\n\nfunction Select<T extends string>(props: SelectProps<T>) {\n  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {\n    props.onChange(event.target.value as T);\n  }\n\n  return <select value={props.value} onChange={handleChange}>...</select>;\n}',
      explain: L(
        'React event types include the target element, so <code>event.target.value</code> is known. Generic props preserve the relationship between options, current value and callback. A cast is acceptable only after the component guarantees that every option came from the typed list.',
        'React-типы событий содержат тип целевого элемента, поэтому <code>event.target.value</code> известен. Generic props сохраняют связь между вариантами, текущим значением и callback. Приведение допустимо только после гарантии, что каждый option построен из типизированного списка.'
      ),
      practice: L(
        'Build a reusable StatusSelect restricted to draft, published and archived. Passing another value must produce a TypeScript error.',
        'Собери переиспользуемый StatusSelect только для draft, published и archived. Передача другого значения должна давать ошибку TypeScript.'
      ),
      checklist: [
        L('Events are typed by the actual element', 'События типизированы реальным элементом'),
        L('Generic props preserve related values', 'Generic props сохраняют связь значений'),
        L('Every type assertion has a runtime reason', 'У каждого type assertion есть runtime-основание')
      ],
      docs: [
        { label: 'React TypeScript guide', url: 'https://react.dev/learn/typescript' }
      ]
    }
  ]);

  add('sec-react', [
    {
      id: 'block-react-state-decisions-2026',
      title: L('Where React state should live', 'Где должно жить состояние React'),
      badge: L('DECISION', 'ВЫБОР'),
      tip: L(
        'Do not install a store first. Classify the state: local UI, shared client state, URL state or server state.',
        'Не устанавливай store заранее. Сначала классифицируй состояние: локальный UI, общее клиентское, URL или серверное.'
      ),
      code: 'Local UI state      -> useState / useReducer\nShared client state -> Context or Zustand\nURL state           -> router search params\nServer state        -> TanStack Query\nForm state          -> native form or React Hook Form\n\n// Derived value is not separate state\nconst visibleTasks = tasks.filter(task => filter === "all" || task.status === filter);',
      explain: L(
        'Duplicated and derived state creates synchronization bugs. Keep state as close as possible to the components that own it. Put filters and pagination in the URL when a link should reproduce the screen. Server data needs caching, refetch and invalidation semantics rather than a hand-written global array.',
        'Дублированное и вычисляемое состояние создаёт ошибки синхронизации. Держи state максимально близко к компонентам-владельцам. Храни фильтры и пагинацию в URL, если ссылка должна воспроизводить экран. Серверным данным нужны кэш, refetch и invalidation, а не вручную написанный глобальный массив.'
      ),
      practice: L(
        'Take one app state diagram and label every value as local, URL, shared client, server or derived. Remove at least one duplicated state value.',
        'Возьми схему состояния одного приложения и подпиши каждое значение: local, URL, shared client, server или derived. Удали хотя бы одно дублированное состояние.'
      ),
      checklist: [
        L('I classify state before choosing a library', 'Классифицирую state до выбора библиотеки'),
        L('Derived values are calculated, not synchronized manually', 'Вычисляемые значения рассчитываются, а не синхронизируются вручную'),
        L('Shareable screen state lives in the URL', 'Состояние воспроизводимого экрана хранится в URL')
      ],
      docs: [
        { label: 'React choosing state structure', url: 'https://react.dev/learn/choosing-the-state-structure' },
        { label: 'TanStack Query', url: 'https://tanstack.com/query/latest/docs/framework/react/overview' }
      ]
    },
    {
      id: 'block-react-query-2026',
      title: L('Server state with TanStack Query', 'Серверное состояние с TanStack Query'),
      badge: L('DATA', 'ДАННЫЕ'),
      tip: L(
        'A query key describes cached data. A mutation changes remote data and then invalidates or updates the affected cache.',
        'Query key описывает закэшированные данные. Mutation изменяет удалённые данные, а затем инвалидирует или обновляет затронутый кэш.'
      ),
      code: 'const tasksQuery = useQuery({\n  queryKey: ["tasks", filters],\n  queryFn: ({ signal }) => getTasks(filters, signal),\n  staleTime: 30_000\n});\n\nconst createTask = useMutation({\n  mutationFn: postTask,\n  onSuccess: () => {\n    queryClient.invalidateQueries({ queryKey: ["tasks"] });\n  }\n});',
      explain: L(
        'Every value used by the request belongs in the query key. Pass the provided AbortSignal to fetch. Choose staleTime from product behavior, not from a copied snippet. Do not mirror query data into useState unless the user is editing a deliberate local draft.',
        'Каждое значение, влияющее на запрос, должно входить в query key. Передавай выданный AbortSignal в fetch. Выбирай staleTime по поведению продукта, а не копируй случайное число. Не дублируй query data в useState, если пользователь не редактирует отдельный локальный черновик.'
      ),
      practice: L(
        'Add filtering to a task query, create one mutation and prove that the list updates after success without a full page reload.',
        'Добавь фильтр в запрос задач, одну mutation и докажи, что список обновляется после успеха без полной перезагрузки страницы.'
      ),
      checklist: [
        L('Query keys contain every request dependency', 'Query key содержит все зависимости запроса'),
        L('Requests can be cancelled', 'Запросы можно отменить'),
        L('Mutations update or invalidate cache intentionally', 'Mutation осознанно обновляет или инвалидирует кэш')
      ],
      docs: [
        { label: 'TanStack Query React', url: 'https://tanstack.com/query/latest/docs/framework/react/overview' }
      ]
    },
    {
      id: 'block-react-performance-2026',
      title: L('React performance: measure before memoizing', 'Производительность React: измеряй до мемоизации'),
      badge: L('PERFORMANCE', 'ПРОИЗВОДИТЕЛЬНОСТЬ'),
      tip: L(
        'Most rerenders are harmless. Find a visible delay with the React Profiler before adding memo, useMemo or useCallback.',
        'Большинство ререндеров безвредны. Сначала найди заметную задержку через React Profiler и только потом добавляй memo, useMemo или useCallback.'
      ),
      code: 'const filtered = useMemo(\n  () => expensiveFilter(products, query),\n  [products, query]\n);\n\nconst ProductRow = memo(function ProductRow({ product, onSelect }) {\n  return <button onClick={() => onSelect(product.id)}>{product.name}</button>;\n});\n\nconst handleSelect = useCallback((id: string) => setSelectedId(id), []);',
      explain: L(
        '<code>memo</code> compares props, <code>useMemo</code> caches a computed value, and <code>useCallback</code> caches a function identity. Each has its own cost and can make code harder to understand. Prefer good state placement, stable keys, list virtualization for huge lists and route-level code splitting.',
        '<code>memo</code> сравнивает props, <code>useMemo</code> кэширует вычисленное значение, а <code>useCallback</code> — идентичность функции. У каждого инструмента есть цена и влияние на читаемость. Сначала исправляй расположение state, стабильные key, виртуализацию огромных списков и разделение кода по маршрутам.'
      ),
      practice: L(
        'Profile an intentionally slow list, capture a baseline, apply one justified optimization and compare commit duration again.',
        'Измерь специально замедленный список, сохрани исходный результат, примени одну обоснованную оптимизацию и снова сравни длительность commit.'
      ),
      checklist: [
        L('I have a profiler measurement before optimizing', 'До оптимизации есть измерение Profiler'),
        L('I can explain what is being cached', 'Могу объяснить, что именно кэшируется'),
        L('The optimized code remains correct and readable', 'Оптимизированный код остаётся правильным и читаемым')
      ],
      docs: [
        { label: 'React Profiler', url: 'https://react.dev/reference/react/Profiler' },
        { label: 'React performance tracks', url: 'https://react.dev/reference/dev-tools/react-performance-tracks' }
      ]
    },
    {
      id: 'block-react-testing-pyramid-2026',
      title: L('Testing pyramid for a frontend feature', 'Пирамида тестов для frontend-функции'),
      badge: L('TESTING', 'ТЕСТЫ'),
      tip: L(
        'Test behavior at the cheapest reliable level. Pure logic needs unit tests, a component needs user-facing assertions, and only critical flows need browser E2E.',
        'Проверяй поведение на самом дешёвом надёжном уровне. Чистой логике нужны unit-тесты, компоненту — пользовательские проверки, а браузерному E2E — только критические сценарии.'
      ),
      code: '// unit\nexpect(calculateTotal([{ price: 100, count: 2 }])).toBe(200);\n\n// component\nrender(<LoginForm onSubmit={submit} />);\nawait user.type(screen.getByLabelText(/email/i), "user@example.com");\nawait user.click(screen.getByRole("button", { name: /sign in/i }));\nexpect(submit).toHaveBeenCalled();\n\n// E2E\nawait page.getByLabel("Email").fill("user@example.com");\nawait page.getByRole("button", { name: "Sign in" }).click();',
      explain: L(
        'Prefer roles, labels and visible text over CSS selectors; this tests accessibility and survives refactoring. Mock only the boundary you do not own. An E2E suite should cover a few valuable flows, not repeat every component test in a slower browser.',
        'Предпочитай роли, label и видимый текст CSS-селекторам: это одновременно проверяет доступность и переживает рефакторинг. Мокай только внешнюю границу, которой не управляешь. E2E-набор должен покрывать несколько ценных сценариев, а не повторять каждый компонентный тест в медленном браузере.'
      ),
      practice: L(
        'For one form, write a pure validation test, a component submission test and one Playwright happy-path. Explain what each level catches.',
        'Для одной формы напиши тест чистой валидации, компонентный тест отправки и один happy-path в Playwright. Объясни, какую ошибку ловит каждый уровень.'
      ),
      checklist: [
        L('Tests describe user-visible behavior', 'Тесты описывают видимое пользователю поведение'),
        L('Selectors use roles and labels where possible', 'Селекторы используют роли и label'),
        L('E2E covers critical flows instead of everything', 'E2E покрывает критические сценарии, а не всё подряд')
      ],
      docs: [
        { label: 'Testing Library principles', url: 'https://testing-library.com/docs/guiding-principles/' },
        { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' }
      ]
    }
  ]);

  add('sec-vite', [{
    id: 'block-vite-test-toolchain-2026',
    title: L('A repeatable quality command', 'Повторяемая команда качества'),
    badge: L('TOOLCHAIN', 'ИНСТРУМЕНТЫ'),
    tip: L(
      'A project should have one command that checks types, lint rules and tests before code reaches GitHub.',
      'У проекта должна быть одна команда, которая проверяет типы, lint-правила и тесты до отправки кода на GitHub.'
    ),
    code: '{\n  "scripts": {\n    "dev": "vite",\n    "typecheck": "tsc --noEmit",\n    "lint": "eslint . --max-warnings=0",\n    "test": "vitest run",\n    "test:e2e": "playwright test",\n    "check": "npm run typecheck && npm run lint && npm run test"\n  }\n}',
    explain: L(
      'Keep fast checks in the default command and run browser E2E separately or in CI. A non-zero exit code must mean failure so GitHub Actions can stop the pipeline. Pin the package manager lockfile and avoid relying on globally installed tools.',
      'Быстрые проверки держи в основной команде, а браузерный E2E запускай отдельно или в CI. Ненулевой exit code должен означать ошибку, чтобы GitHub Actions остановил pipeline. Сохраняй lockfile пакетного менеджера и не полагайся на глобально установленные инструменты.'
    ),
    practice: L(
      'Add check to one Vite project, deliberately create one type error and one failing test, then verify that the command fails for the right reasons.',
      'Добавь check в один Vite-проект, специально создай одну ошибку типов и один падающий тест, затем проверь, что команда завершается ошибкой по правильной причине.'
    ),
    checklist: [
      L('One command runs all fast quality checks', 'Одна команда запускает все быстрые проверки'),
      L('Failures return a non-zero exit code', 'Ошибка возвращает ненулевой exit code'),
      L('The lockfile is committed', 'Lockfile сохранён в репозитории')
    ],
    docs: [
      { label: 'Vitest', url: 'https://vitest.dev/guide/' },
      { label: 'Vite', url: 'https://vite.dev/guide/' }
    ]
  }]);

  add('sec-node', [
    {
      id: 'block-baas-foundation-2026',
      title: L('BaaS architecture for a static frontend', 'Архитектура BaaS для статического frontend'),
      badge: 'BaaS',
      tip: L(
        'GitHub Pages cannot safely hold server secrets. Firebase or Supabase provide managed auth, database and storage, but security rules remain your responsibility.',
        'GitHub Pages не может безопасно хранить серверные секреты. Firebase или Supabase дают готовые auth, database и storage, но правила безопасности остаются твоей ответственностью.'
      ),
      code: 'Browser application\n  ├─ public project URL / anon key\n  ├─ authenticated user session\n  └─ BaaS SDK\n       ├─ Auth\n       ├─ Database + row/rule policies\n       ├─ Storage policies\n       └─ Realtime subscriptions\n\nNever in browser code:\n  service role key\n  API secret\n  private signing key',
      explain: L(
        'A public project identifier or Supabase anon key is designed to exist in the client only when Row Level Security is enabled and correct. Service-role keys bypass policies and must never be committed or shipped to the browser. Treat database and storage rules as application code: review and test them.',
        'Публичный идентификатор проекта или anon key Supabase рассчитан на клиент только при включённом и правильном Row Level Security. Service-role key обходит политики и никогда не должен попадать в репозиторий или браузер. Относись к правилам БД и файлов как к коду приложения: проверяй и тестируй их.'
      ),
      practice: L(
        'Draw the trust boundary for a notes app. Mark which values may be public and write one rule that prevents a user from reading another user’s rows.',
        'Нарисуй границу доверия для приложения заметок. Отметь, какие значения могут быть публичными, и напиши правило, запрещающее читать строки другого пользователя.'
      ),
      checklist: [
        L('No secret or service-role key is shipped to the browser', 'В браузер не попадает secret или service-role key'),
        L('Database and storage access is denied by default', 'Доступ к БД и файлам по умолчанию запрещён'),
        L('Rules are tested with two different users', 'Правила проверены двумя разными пользователями')
      ],
      docs: [
        { label: 'Supabase RLS', url: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },
        { label: 'Firebase Security Rules', url: 'https://firebase.google.com/docs/rules' }
      ]
    },
    {
      id: 'block-baas-auth-security-2026',
      title: L('BaaS authentication without fake security', 'Авторизация BaaS без ложной безопасности'),
      badge: L('SECURITY', 'БЕЗОПАСНОСТЬ'),
      tip: L(
        'Hiding a button is not authorization. The database or storage policy must independently reject forbidden access.',
        'Скрытая кнопка — не авторизация. Политика базы данных или storage должна самостоятельно отклонить запрещённый доступ.'
      ),
      code: '// UI check improves experience only\nif (session) showPrivateScreen();\n\n// Real protection lives in the data policy\n// Supabase example concept:\n// using (auth.uid() = owner_id)\n// with check (auth.uid() = owner_id)\n\n// After sign-out\nawait auth.signOut();\nclearPrivateUiState();',
      explain: L(
        'The client session decides what to render, while server-side BaaS policies decide what data may be read or changed. OAuth redirects require an allowlist. Do not place access tokens in URLs or logs. Test sign-out, expired sessions, a second account and direct API calls.',
        'Клиентская сессия решает, что показать, а серверные политики BaaS — какие данные разрешено читать или менять. OAuth redirect должен быть в allowlist. Не помещай access token в URL или логи. Проверяй выход, истёкшую сессию, второй аккаунт и прямые API-запросы.'
      ),
      practice: L(
        'Create two test users. Prove that each sees only their own notes even when the other user ID is manually placed in a request.',
        'Создай двух тестовых пользователей. Докажи, что каждый видит только свои заметки, даже если вручную подставить чужой user ID в запрос.'
      ),
      checklist: [
        L('Authorization is enforced by data policies', 'Авторизация обеспечивается политиками данных'),
        L('OAuth redirect URLs are restricted', 'OAuth redirect URL ограничены'),
        L('I test expired and cross-user access', 'Проверяю истёкший и межпользовательский доступ')
      ],
      docs: [
        { label: 'Supabase Auth', url: 'https://supabase.com/docs/guides/auth' },
        { label: 'Firebase Auth', url: 'https://firebase.google.com/docs/auth' }
      ]
    },
    {
      id: 'block-baas-realtime-storage-2026',
      title: L('Realtime and file uploads with limits', 'Realtime и загрузка файлов с ограничениями'),
      badge: L('PRACTICE', 'ПРАКТИКА'),
      tip: L(
        'Realtime subscriptions and direct uploads need cleanup, ownership rules, file limits and visible failure states.',
        'Realtime-подпискам и прямой загрузке нужны cleanup, правила владельца, ограничения файлов и видимые состояния ошибки.'
      ),
      code: 'const channel = supabase\n  .channel("project-updates")\n  .on("postgres_changes", {\n    event: "*",\n    schema: "public",\n    table: "projects",\n    filter: `owner_id=eq.${user.id}`\n  }, handleChange)\n  .subscribe();\n\n// cleanup\nawait supabase.removeChannel(channel);\n\n// Client upload checks are UX only\nif (!file.type.startsWith("image/") || file.size > 2_000_000) {\n  throw new Error("Unsupported file");\n}',
      explain: L(
        'Unsubscribe when the screen closes or the user changes. Filter events to the smallest useful scope. Repeat format, size and ownership restrictions in storage policies because client checks can be bypassed. With Cloudinary, use a restricted unsigned preset for public client uploads or generate signed uploads on a trusted server; never expose the API secret.',
        'Отписывайся при закрытии экрана или смене пользователя. Фильтруй события до минимальной полезной области. Повторяй ограничения формата, размера и владельца в storage policies, потому что клиентские проверки обходятся. В Cloudinary используй ограниченный unsigned preset для публичной загрузки с клиента или подписывай загрузку на доверенном сервере; никогда не раскрывай API secret.'
      ),
      practice: L(
        'Build a profile image upload with preview, 2 MB limit, owner-only policy, progress, error and delete action. Reload and verify persistence.',
        'Сделай загрузку изображения профиля с preview, лимитом 2 МБ, политикой только для владельца, прогрессом, ошибкой и удалением. Перезагрузи страницу и проверь сохранение.'
      ),
      checklist: [
        L('Subscriptions are removed during cleanup', 'Подписки удаляются при cleanup'),
        L('File limits exist in the storage policy', 'Ограничения файла есть в storage policy'),
        L('No upload secret is exposed in the client', 'В клиенте нет секрета загрузки')
      ],
      docs: [
        { label: 'Supabase Realtime', url: 'https://supabase.com/docs/guides/realtime' },
        { label: 'Cloudinary upload presets', url: 'https://cloudinary.com/documentation/upload_presets' }
      ]
    }
  ]);

  add('sec-career', [{
    id: 'block-career-interview-evidence-2026',
    title: L('Interview answers backed by project evidence', 'Ответы на собеседовании с доказательствами из проекта'),
    badge: L('CAREER', 'КАРЬЕРА'),
    tip: L(
      'A strong answer is not a memorized definition. Connect the concept to a decision, trade-off, bug or measurement from your own project.',
      'Сильный ответ — не заученное определение. Связывай понятие с решением, компромиссом, ошибкой или измерением из собственного проекта.'
    ),
    code: L(
      'Question: Why did you use localStorage?\n\n1. Context: a theme setting in a static app\n2. Decision: localStorage because it must survive reload\n3. Trade-off: string-only, synchronous, browser-local\n4. Safety: no token or sensitive data\n5. Evidence: link to commit and test scenario',
      'Вопрос: Почему ты использовал localStorage?\n\n1. Контекст: настройка темы статического приложения\n2. Решение: localStorage, потому что выбор переживает перезагрузку\n3. Компромисс: только строки, синхронность, один браузер\n4. Безопасность: без токена и личных данных\n5. Доказательство: ссылка на commit и тестовый сценарий'
    ),
    explain: L(
      'Use the same structure for React state, TypeScript strictness, accessibility, tests, performance and API errors. If you have never used a tool, say so and explain the closest experience plus how you would verify the choice. Honest reasoning is stronger than pretending.',
      'Используй ту же структуру для React state, строгости TypeScript, доступности, тестов, производительности и API-ошибок. Если инструмент не применял, честно скажи это, назови ближайший опыт и способ проверки решения. Честное рассуждение сильнее притворства.'
    ),
    practice: L(
      'Record five two-minute answers. Every answer must mention one project, one trade-off and one verification method.',
      'Запиши пять ответов по две минуты. В каждом назови один проект, один компромисс и один способ проверки.'
    ),
    checklist: [
      L('My answer starts with project context', 'Ответ начинается с контекста проекта'),
      L('I name a trade-off, not only an advantage', 'Называю компромисс, а не только преимущество'),
      L('I can show evidence in GitHub', 'Могу показать доказательство в GitHub')
    ],
    docs: [
      { label: 'GitHub profile README', url: 'https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme' }
    ]
  }]);

  data.version = '2026-07-26-depth';
  window.WebDevGymCurriculumDepth = Object.freeze({
    version: data.version,
    locale: data.locale,
    lessons: data.sections.reduce((total, section) => total + section.lessons.length, 0)
  });
})();
