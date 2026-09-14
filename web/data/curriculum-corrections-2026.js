(function applyCurriculumCorrections() {
  'use strict';

  const data = window.WebDevGymCurriculumData;
  if (!data || !Array.isArray(data.sections)) return;

  const locale = data.locale === 'en' ? 'en' : 'ru';
  const t = value => typeof value === 'string' ? value : value[locale];
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function patchLesson(definition) {
    let lesson;
    for (const section of data.sections) {
      lesson = section.lessons.find(item => item.id === definition.id);
      if (lesson) break;
    }
    if (!lesson || typeof lesson.html !== 'string') return;

    const codeBlock = '<div class="code">' + escapeHtml(t(definition.code)) + '</div>';
    const explainBlock = '<div class="explain">' + t(definition.explain) + '</div>';
    lesson.html = lesson.html.replace(/<div class="code"[^>]*>[\s\S]*?<\/div>/, codeBlock);

    if (/<div class="explain"[^>]*>/.test(lesson.html)) {
      lesson.html = lesson.html.replace(/<div class="explain"[^>]*>[\s\S]*?<\/div>/, explainBlock);
    } else {
      lesson.html = lesson.html.replace(codeBlock, codeBlock + explainBlock);
    }

    let checklistIndex = 0;
    lesson.html = lesson.html.replace(
      /(<label class="item"><input[\s\S]*?<span>)[\s\S]*?(<\/span><\/label>)/g,
      (match, start, end) => {
        const item = definition.checklist[checklistIndex++];
        return item ? start + escapeHtml(t(item)) + end : match;
      }
    );

    const docs = definition.docs.map(item => (
      '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(item.label) + '</a>'
    )).join(' &middot; ');
    const docsBlock = '<div class="wdg-depth-docs"><strong>' +
      (locale === 'en' ? 'Official sources' : 'Официальные источники') +
      ':</strong> ' + docs + '</div>';

    if (!lesson.html.includes('class="wdg-depth-docs"')) {
      lesson.html = lesson.html.replace('<div class="items">', docsBlock + '<div class="items">');
    }
    lesson.html = lesson.html.replace('class="block"', 'class="block wdg-fact-checked-lesson"');
  }

  [
    {
      id: 'block-headings',
      code: {
        ru: '<h1>Название страницы</h1>\n<section>\n  <h2>Доставка</h2>\n  <h3>Самовывоз</h3>\n  <p>Условия получения заказа.</p>\n</section>',
        en: '<h1>Page title</h1>\n<section>\n  <h2>Delivery</h2>\n  <h3>Pickup</h3>\n  <p>How to receive the order.</p>\n</section>'
      },
      explain: {
        ru: '<p><strong>Уровни заголовков описывают иерархию, а не размер текста.</strong> Один ясный <code>h1</code> для страницы — надёжный вариант для обучения и доступной навигации. HTML допускает несколько <code>h1</code> в некоторых структурах, но один главный заголовок обычно понятнее.</p><p>Не выбирай <code>h3</code> только потому, что он выглядит меньше <code>h2</code>: размер меняется CSS. Уровни должны отражать вложенность. Для абзацев используй <code>p</code>, для важности — <code>strong</code>, для смыслового ударения — <code>em</code>.</p>',
        en: '<p><strong>Heading levels describe hierarchy, not visual size.</strong> One clear <code>h1</code> for the page is a robust learning and accessibility default. HTML permits multiple <code>h1</code> elements in some structures, but one page heading is usually clearer.</p><p>Do not choose <code>h3</code> merely because it looks smaller than <code>h2</code>; use CSS for size. Levels should reflect nesting. Use <code>p</code> for paragraphs, <code>strong</code> for importance, and <code>em</code> for stress emphasis.</p>'
      },
      checklist: [
        { ru: 'Есть ясный главный заголовок и логичная иерархия h2/h3', en: 'There is a clear page heading and logical h2/h3 hierarchy' },
        { ru: 'Использую p для абзацев', en: 'I use p for paragraphs' },
        { ru: 'Не выбираю уровень заголовка ради размера', en: 'I do not choose a heading level for its size' }
      ],
      docs: [
        { label: 'MDN — Headings', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements' },
        { label: 'W3C WAI — Headings', url: 'https://www.w3.org/WAI/tutorials/page-structure/headings/' }
      ]
    },
    {
      id: 'block-semantic',
      code: '<header>...</header>\n<nav aria-label="Основная навигация">...</nav>\n<main id="main-content">\n  <article>...</article>\n</main>\n<footer>...</footer>',
      explain: {
        ru: '<p>Семантические элементы описывают назначение областей страницы, но сами по себе не гарантируют доступность.</p><p>В обычном документе нужен <strong>один видимый основной landmark <code>main</code></strong>. Несколько <code>main</code> допустимы, только если неактивные варианты скрыты. <code>section</code> — тематический раздел, обычно с заголовком; <code>article</code> — самостоятельный материал.</p>',
        en: '<p>Semantic elements describe the purpose of page regions, but semantics alone do not guarantee accessibility.</p><p>A normal document needs <strong>one visible primary <code>main</code> landmark</strong>. Multiple <code>main</code> elements are valid only when inactive alternatives are hidden. A <code>section</code> is a thematic region, usually with a heading; an <code>article</code> is self-contained content.</p>'
      },
      checklist: [
        { ru: 'На экране один видимый основной main', en: 'Only one primary main landmark is visible' },
        { ru: 'Выбираю section и article по смыслу', en: 'I choose section and article by meaning' },
        { ru: 'У областей есть понятные имена и заголовки', en: 'Regions have clear names and headings' }
      ],
      docs: [
        { label: 'MDN — main', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main' },
        { label: 'W3C WAI — Page structure', url: 'https://www.w3.org/WAI/tutorials/page-structure/' }
      ]
    },
    {
      id: 'mistakes-lesson-3',
      code: {
        ru: 'let score = 0;\n\nif (score = 5) {\n  console.log("Это присваивание");\n}\n\nif (score === 5) {\n  console.log("Это строгое сравнение");\n}\n\nconst total = Number("5") + 3; // 8',
        en: 'let score = 0;\n\nif (score = 5) {\n  console.log("This is assignment");\n}\n\nif (score === 5) {\n  console.log("This is strict equality");\n}\n\nconst total = Number("5") + 3; // 8'
      },
      explain: {
        ru: '<p><code>=</code> присваивает значение, а <code>===</code> сравнивает значение и тип без неявного преобразования. Ввод пользователя преобразуй явно.</p><p>Консоль показывает синтаксические и runtime-ошибки, предупреждения и сетевые сообщения, но <strong>не находит все логические ошибки</strong>. Для неверного результата нужны breakpoint, проверка значений и тесты.</p>',
        en: '<p><code>=</code> assigns, while <code>===</code> compares value and type without implicit coercion. Convert user input explicitly.</p><p>The console shows syntax and runtime errors, warnings, and network messages, but it <strong>does not find every logic bug</strong>. Wrong results require breakpoints, value inspection, and tests.</p>'
      },
      checklist: [
        { ru: 'Различаю = и ===', en: 'I distinguish = and ===' },
        { ru: 'Явно преобразую строки из input', en: 'I explicitly convert input strings' },
        { ru: 'Для логики использую debugger и тесты', en: 'I use the debugger and tests for logic' }
      ],
      docs: [
        { label: 'MDN — Strict equality', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality' },
        { label: 'Chrome DevTools — Debugging', url: 'https://developer.chrome.com/docs/devtools/javascript/' }
      ]
    },
    {
      id: 'block-mistakes-scope',
      code: '.tooltip { position: relative; z-index: 10; }\n.grid-item { z-index: 2; /* flex/grid item */ }\n.card { overflow: hidden; /* может обрезать tooltip */ }',
      explain: {
        ru: '<p><code>z-index</code> применяется к позиционированным элементам, а также к flex- и grid-элементам. Большое число не выводит дочерний элемент из его stacking context.</p><p>Если слой не поднимается, проверь родителей на <code>transform</code>, <code>opacity</code>, <code>filter</code>, <code>isolation</code>, позиционирование и <code>overflow</code>. Сначала найди stacking context в DevTools.</p>',
        en: '<p><code>z-index</code> applies to positioned elements and also to flex and grid items. A large value cannot escape its stacking context.</p><p>If a layer does not rise, inspect ancestors for <code>transform</code>, <code>opacity</code>, <code>filter</code>, <code>isolation</code>, positioning, and <code>overflow</code>. Find the stacking context in DevTools first.</p>'
      },
      checklist: [
        { ru: 'Знаю, где z-index работает без position', en: 'I know where z-index works without position' },
        { ru: 'Проверяю stacking context родителей', en: 'I inspect ancestor stacking contexts' },
        { ru: 'Проверяю overflow при обрезании', en: 'I inspect overflow when content is clipped' }
      ],
      docs: [
        { label: 'MDN — z-index', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/z-index' },
        { label: 'MDN — Stacking context', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context' }
      ]
    },
    {
      id: 'block-mistakes-events',
      code: 'const handleClick = event => {\n  console.log(event.currentTarget);\n};\n\nbutton.addEventListener("click", handleClick);\nbutton.removeEventListener("click", handleClick);\n\n// Другая функция — обработчик не снимется:\nbutton.removeEventListener("click", () => {});',
      explain: {
        ru: '<p><code>removeEventListener</code> требует тот же тип события, <strong>тот же объект-функцию</strong> и совпадающий параметр <code>capture</code>. Две одинаково написанные стрелки — разные функции, поэтому сохраняй ссылку.</p><p>Для динамических списков используй делегирование на стабильном родителе и <code>event.target.closest()</code>. При удалении компонента очищай также таймеры и observers.</p>',
        en: '<p><code>removeEventListener</code> requires the same event type, <strong>the same function object</strong>, and a matching <code>capture</code> option. Two identical-looking arrows are different functions, so keep the reference.</p><p>For dynamic lists, delegate on a stable parent and use <code>event.target.closest()</code>. Also clean up timers and observers when removing a component.</p>'
      },
      checklist: [
        { ru: 'Сохраняю ссылку на снимаемый обработчик', en: 'I retain a removable listener reference' },
        { ru: 'Различаю target и currentTarget', en: 'I distinguish target and currentTarget' },
        { ru: 'Использую делегирование для списков', en: 'I use delegation for lists' }
      ],
      docs: [
        { label: 'MDN — removeEventListener', url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener' },
        { label: 'MDN — Event bubbling', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling' }
      ]
    },
    {
      id: 'block-mistakes-async',
      code: 'async function loadUser() {\n  try {\n    const response = await fetch("/api/user");\n    if (!response.ok) throw new Error(`HTTP ${response.status}`);\n    return await response.json();\n  } catch (error) {\n    console.error("Request failed", error);\n    throw error;\n  }\n}\n\nfetch("/api/user").then(response => response.json());',
      explain: {
        ru: '<p><code>fetch</code> возвращает Promise. Его можно обработать через <code>await</code> или <code>.then()</code>; <code>await</code> удобен, но не обязателен. Необработанный rejection распространяется по цепочке.</p><p><code>fetch</code> отклоняется при сетевой ошибке, но HTTP 404 и 500 остаются полученными ответами, поэтому проверяй <code>response.ok</code>. Лови ошибку там, где можешь добавить контекст, показать состояние UI или восстановиться.</p>',
        en: '<p><code>fetch</code> returns a Promise. Handle it with <code>await</code> or <code>.then()</code>; <code>await</code> is convenient, not mandatory. An unhandled rejection propagates through the chain.</p><p><code>fetch</code> rejects on network failure, while HTTP 404 and 500 remain fulfilled responses, so check <code>response.ok</code>. Catch errors where you can add context, update the UI, or recover.</p>'
      },
      checklist: [
        { ru: 'Понимаю, что fetch возвращает Promise', en: 'I understand that fetch returns a Promise' },
        { ru: 'Осознанно выбираю await или then', en: 'I deliberately choose await or then' },
        { ru: 'Проверяю response.ok и сетевые ошибки', en: 'I check response.ok and network failures' }
      ],
      docs: [
        { label: 'MDN — Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch' },
        { label: 'MDN — await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await' }
      ]
    }
  ].forEach(patchLesson);

  window.WebDevGymCurriculumCorrections = {
    version: '2026.08.11',
    correctedLessonIds: [
      'block-headings', 'block-semantic', 'mistakes-lesson-3',
      'block-mistakes-scope', 'block-mistakes-events', 'block-mistakes-async'
    ]
  };
})();
