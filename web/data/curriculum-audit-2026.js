(function extendAuditedCurriculum() {
  'use strict';

  const data = window.WebDevGymCurriculumData;
  if (!data || !Array.isArray(data.sections)) return;

  const locale = data.locale === 'en' ? 'en' : 'ru';
  const t = value => typeof value === 'string' ? value : value[locale];

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function renderLesson(definition) {
    const checklist = definition.checklist.map((item, index) => (
      '<label class="item"><input type="checkbox" class="prog-cb" ' +
      'data-pid="audit-' + definition.id + '-' + (index + 1) + '" ' +
      'onchange="updateProgress(this)"><span>' + escapeHtml(t(item)) + '</span></label>'
    )).join('');

    const docs = definition.docs.map(item => (
      '<a href="' + item.url + '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(item.label) + '</a>'
    )).join(' &middot; ');

    const html = '<div class="block wdg-audited-lesson" id="' + definition.id + '">' +
      '<div class="block-title" onclick="scrollToBlock(\'' + definition.id + '\')">' +
      escapeHtml(t(definition.title)) +
      ' <span class="badge ' + (definition.badgeClass || 'good') + '">' +
      escapeHtml(t(definition.badge || { ru: 'ОСНОВА', en: 'CORE' })) +
      '</span><span class="anchor-icon">#</span></div>' +
      '<div class="tip">' + t(definition.tip) + '</div>' +
      '<div class="code">' + escapeHtml(t(definition.code)) + '</div>' +
      '<div class="explain">' + t(definition.explain) + '</div>' +
      '<div class="wdg-depth-practice"><strong>' +
      (locale === 'en' ? 'Practice before marking complete' : 'Практика до отметки «готово»') +
      ':</strong> ' + t(definition.practice) + '</div>' +
      '<div class="wdg-depth-docs"><strong>' +
      (locale === 'en' ? 'Official sources' : 'Официальные источники') +
      ':</strong> ' + docs + '</div>' +
      '<div class="items">' + checklist + '</div></div>';

    return {
      id: definition.id,
      title: t(definition.title) + ' ' + t(definition.badge || { ru: 'основа', en: 'core' }) + ' #',
      html
    };
  }

  function add(sectionId, definitions) {
    const section = data.sections.find(item => item.id === sectionId);
    if (!section) return;
    const known = new Set(section.lessons.map(item => item.id));
    definitions.forEach(definition => {
      if (!known.has(definition.id)) section.lessons.push(renderLesson(definition));
    });
  }

  const mdnCurriculum = 'https://developer.mozilla.org/en-US/curriculum/core/';

  add('sec-html', [
    {
      id: 'block-web-platform-foundations-2026',
      title: { ru: 'Как браузер открывает страницу', en: 'How the browser opens a page' },
      tip: {
        ru: 'До тегов важно понять путь страницы: URL → DNS → HTTPS → HTTP-ответ → разбор HTML → CSS → JavaScript → отрисовка.',
        en: 'Before learning tags, understand the page pipeline: URL → DNS → HTTPS → HTTP response → HTML parsing → CSS → JavaScript → rendering.'
      },
      code: {
        ru: 'https://example.com/products?id=42#reviews\n│       │           │        └─ фрагмент страницы\n│       │           └────────── query-параметр\n│       └────────────────────── путь\n└────────────────────────────── origin: схема + хост + порт',
        en: 'https://example.com/products?id=42#reviews\n│       │           │        └─ page fragment\n│       │           └────────── query parameter\n│       └────────────────────── path\n└────────────────────────────── origin: scheme + host + port'
      },
      explain: {
        ru: '<p><strong>HTML не загружается сам по себе.</strong> Браузер получает документ по HTTP, строит DOM, разбирает CSS в CSSOM и объединяет их для отрисовки. Скрипт без <code>defer</code> может остановить разбор HTML.</p><p><strong>Главная граница:</strong> код в браузере доступен пользователю. Секреты, пароли базы и приватные API-ключи нельзя прятать в HTML, CSS, JS или переменных Vite.</p>',
        en: '<p><strong>HTML does not load by itself.</strong> The browser receives a document over HTTP, builds the DOM, parses CSS into the CSSOM, and combines them for rendering. A script without <code>defer</code> can pause HTML parsing.</p><p><strong>The key boundary:</strong> browser code is visible to the user. Secrets, database passwords, and private API keys do not belong in HTML, CSS, JS, or Vite client variables.</p>'
      },
      practice: {
        ru: 'Открой DevTools → Network, перезагрузи страницу и найди документ, CSS и JS. Для каждого запиши URL, статус и тип.',
        en: 'Open DevTools → Network, reload a page, and find the document, CSS, and JS requests. Record the URL, status, and type of each.'
      },
      checklist: [
        { ru: 'Различаю URL, origin, путь, query и fragment', en: 'I can distinguish a URL, origin, path, query, and fragment' },
        { ru: 'Могу объяснить DOM, CSSOM и момент запуска JavaScript', en: 'I can explain the DOM, CSSOM, and when JavaScript runs' },
        { ru: 'Не помещаю секреты в клиентский код', en: 'I do not put secrets in client-side code' }
      ],
      docs: [
        { label: 'MDN — How the web works', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works' },
        { label: 'MDN — Script loading', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script' }
      ]
    },
    {
      id: 'block-html-a11y-foundations-2026',
      title: { ru: 'Доступность: семантика, клавиатура и имя', en: 'Accessibility: semantics, keyboard, and names' },
      tip: {
        ru: 'Доступный интерфейс начинается с правильного HTML, а не с добавления ARIA ко всему подряд.',
        en: 'An accessible interface starts with correct HTML, not by adding ARIA to everything.'
      },
      code: '<button type="button" aria-label="Закрыть диалог">×</button>\n\n<a href="/settings">Настройки</a>\n\n<nav aria-label="Главная навигация">...</nav>',
      explain: {
        ru: '<p><strong>Кнопка выполняет действие, ссылка ведёт по адресу.</strong> Нативные элементы уже имеют роль, клавиатурное поведение и состояния. <code>div onclick</code> всего этого не получает.</p><p>У каждого интерактивного элемента должно быть доступное имя. Видимый текст обычно уже является именем; для одной иконки понадобится <code>aria-label</code>. Фокус должен быть заметен, а порядок Tab — соответствовать странице.</p>',
        en: '<p><strong>A button performs an action; a link navigates to a URL.</strong> Native elements already provide a role, keyboard behavior, and states. A <code>div onclick</code> provides none of these.</p><p>Every interactive control needs an accessible name. Visible text usually supplies it; an icon-only control may need <code>aria-label</code>. Focus must be visible and Tab order must follow the page.</p>'
      },
      practice: {
        ru: 'Пройди страницу только Tab, Shift+Tab, Enter, Space и Escape. Замени один кликабельный div на нативный элемент.',
        en: 'Navigate a page using only Tab, Shift+Tab, Enter, Space, and Escape. Replace one clickable div with a native element.'
      },
      checklist: [
        { ru: 'Выбираю button и a по их назначению', en: 'I choose button and a according to their purpose' },
        { ru: 'Проверяю доступное имя и видимый focus', en: 'I check accessible names and visible focus' },
        { ru: 'Использую ARIA только когда HTML недостаточно', en: 'I use ARIA only when HTML is not enough' }
      ],
      docs: [
        { label: 'W3C WAI Tutorials', url: 'https://www.w3.org/WAI/tutorials/' },
        { label: 'MDN Accessibility', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility' }
      ]
    },
    {
      id: 'block-html-a11y-forms-2026',
      title: { ru: 'Доступные формы и сообщения об ошибках', en: 'Accessible forms and error messages' },
      tip: {
        ru: 'Placeholder не заменяет label. Ошибка должна объяснять, что исправить, и быть связана с полем программно.',
        en: 'A placeholder does not replace a label. An error must explain what to fix and be programmatically associated with the field.'
      },
      code: '<label for="email">Email</label>\n<input id="email" name="email" type="email"\n  required aria-describedby="email-help email-error">\n<p id="email-help">Нужен для ответа на заявку.</p>\n<p id="email-error" role="alert">Введите корректный email.</p>',
      explain: {
        ru: '<p><code>label[for]</code> связывает подпись и поле, <code>name</code> определяет ключ отправляемых данных, а <code>aria-describedby</code> добавляет подсказку и ошибку к доступному описанию.</p><p>Не полагайся только на красный цвет. После неудачной отправки покажи общий итог, отметь конкретные поля и перемести фокус только когда это помогает, а не неожиданно.</p>',
        en: '<p><code>label[for]</code> connects a label to a field, <code>name</code> defines the submitted key, and <code>aria-describedby</code> adds help and error text to the accessible description.</p><p>Do not rely on red alone. After a failed submission, show a summary, mark the affected fields, and move focus only when that helps rather than surprises the user.</p>'
      },
      practice: {
        ru: 'Собери форму из двух полей. Отправь её пустой, проверь ошибки клавиатурой и убедись, что исправленное поле перестаёт считаться ошибочным.',
        en: 'Build a two-field form. Submit it empty, inspect errors with the keyboard, and ensure a corrected field is no longer marked invalid.'
      },
      checklist: [
        { ru: 'У каждого поля есть видимый label и name', en: 'Every field has a visible label and a name' },
        { ru: 'Ошибка связана с полем и не передаётся только цветом', en: 'Errors are associated with fields and not conveyed by color alone' },
        { ru: 'Форма понятна с клавиатуры и экранного диктора', en: 'The form is understandable with a keyboard and screen reader' }
      ],
      docs: [
        { label: 'W3C — Forms Tutorial', url: 'https://www.w3.org/WAI/tutorials/forms/' },
        { label: 'MDN — Client-side form validation', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation' }
      ]
    }
  ]);

  add('sec-css', [
    {
      id: 'block-css-cascade-specificity-2026',
      title: { ru: 'Каскад, наследование и специфичность', en: 'Cascade, inheritance, and specificity' },
      tip: {
        ru: 'CSS выбирает победителя не по принципу «последний всегда сильнее»: важны origin, layer, !important, специфичность и порядок.',
        en: 'CSS does not choose a winner by “the last rule always wins”: origin, layer, !important, specificity, and order all matter.'
      },
      code: '@layer reset, base, components;\n\n@layer base {\n  button { color: navy; }       /* 0-0-1 */\n}\n\n@layer components {\n  .save-button { color: white; } /* 0-1-0 */\n}',
      explain: {
        ru: '<p><strong>Наследование</strong> передаёт некоторые свойства детям, например <code>color</code>, но не <code>margin</code>. <strong>Каскад</strong> решает конфликт правил, а специфичность сравнивает селекторы внутри одного уровня каскада.</p><p>Не лечи конфликт бесконечными ID и <code>!important</code>. Сначала посмотри вкладку Computed в DevTools, затем упрости селектор или явно организуй слои.</p>',
        en: '<p><strong>Inheritance</strong> passes some properties such as <code>color</code> to children, but not <code>margin</code>. The <strong>cascade</strong> resolves competing declarations, while specificity compares selectors at the same cascade level.</p><p>Do not treat conflicts with endless IDs and <code>!important</code>. Inspect DevTools Computed styles first, then simplify the selector or organize layers explicitly.</p>'
      },
      practice: {
        ru: 'Создай конфликт из element, class и id. До запуска предскажи победителя, затем проверь Computed и перепиши без id.',
        en: 'Create a conflict using an element, class, and ID selector. Predict the winner, verify it in Computed, then rewrite without the ID.'
      },
      checklist: [
        { ru: 'Различаю наследование, каскад и специфичность', en: 'I distinguish inheritance, cascade, and specificity' },
        { ru: 'Могу посчитать базовую специфичность селектора', en: 'I can calculate basic selector specificity' },
        { ru: 'Исправляю конфликт без случайного !important', en: 'I resolve conflicts without random !important rules' }
      ],
      docs: [
        { label: 'MDN — Cascade', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts' },
        { label: 'MDN — Specificity', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity' }
      ]
    },
    {
      id: 'block-css-values-units-2026',
      title: { ru: 'Значения, единицы и адаптивные размеры', en: 'Values, units, and responsive sizing' },
      tip: {
        ru: 'px не запрещён, но разные задачи требуют разных единиц: rem для масштаба текста, % для контекста, fr для сетки, vw/vh с осторожностью.',
        en: 'px is not forbidden, but different jobs need different units: rem for scalable text, % for context, fr for grids, and vw/vh with care.'
      },
      code: ':root { font-size: 100%; }\n\n.page { width: min(100% - 2rem, 70rem); }\n.title { font-size: clamp(2rem, 5vw, 4rem); }\n.grid { grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); }',
      explain: {
        ru: '<p><strong>Абсолютное</strong> значение не зависит от родителя, <strong>относительное</strong> вычисляется из контекста. <code>rem</code> опирается на корневой размер шрифта, <code>em</code> — на текущий контекст, проценты зависят от свойства.</p><p><code>min()</code>, <code>max()</code> и <code>clamp()</code> позволяют задавать границы без десятков media queries. Не отключай масштабирование страницы и не задавай весь текст через viewport units.</p>',
        en: '<p>An <strong>absolute</strong> value does not depend on a parent; a <strong>relative</strong> value is computed from context. <code>rem</code> uses the root font size, <code>em</code> uses the current context, and percentages depend on the property.</p><p><code>min()</code>, <code>max()</code>, and <code>clamp()</code> express boundaries without dozens of media queries. Do not disable page zoom or size all text with viewport units.</p>'
      },
      practice: {
        ru: 'Сделай контейнер и заголовок, которые работают при ширине 320–1440 px и при увеличении браузера до 200%.',
        en: 'Build a container and heading that work from 320–1440 px and at 200% browser zoom.'
      },
      checklist: [
        { ru: 'Выбираю единицу по смыслу, а не по привычке', en: 'I choose units by purpose, not habit' },
        { ru: 'Использую min, max и clamp для границ', en: 'I use min, max, and clamp for boundaries' },
        { ru: 'Проверяю интерфейс при 200% zoom', en: 'I test the interface at 200% zoom' }
      ],
      docs: [
        { label: 'MDN — CSS values and units', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units' },
        { label: 'MDN — Sizing', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Sizing' }
      ]
    },
    {
      id: 'block-css-typography-2026',
      title: { ru: 'Типографика и веб-шрифты', en: 'Typography and web fonts' },
      tip: {
        ru: 'Хорошая типографика — это читаемая иерархия, длина строки, межстрочный интервал и безопасная загрузка шрифта, а не только красивое семейство.',
        en: 'Good typography is readable hierarchy, line length, line height, and safe font loading—not just a fashionable family.'
      },
      code: '@font-face {\n  font-family: "Inter";\n  src: url("/fonts/inter.woff2") format("woff2");\n  font-display: swap;\n}\n\nbody { font: 1rem/1.6 Inter, system-ui, sans-serif; }\np { max-inline-size: 68ch; }',
      explain: {
        ru: '<p>Системный fallback оставляет текст читаемым, пока файл шрифта не загрузился. Формат WOFF2 обычно достаточен для современных браузеров; ненужные начертания увеличивают вес страницы.</p><p>Используй логические свойства вроде <code>max-inline-size</code>, не делай основной текст слишком мелким и не уменьшай <code>line-height</code> ради плотности.</p>',
        en: '<p>A system fallback keeps text readable while the font file loads. WOFF2 is generally sufficient for modern browsers; unused weights increase page weight.</p><p>Use logical properties such as <code>max-inline-size</code>, avoid tiny body text, and do not crush <code>line-height</code> merely for density.</p>'
      },
      practice: {
        ru: 'Собери статью с h1, h2, абзацем и подписью. Проверь без загруженного веб-шрифта и на узком экране.',
        en: 'Build an article with h1, h2, body text, and a caption. Test it without the web font and on a narrow screen.'
      },
      checklist: [
        { ru: 'У шрифта есть fallback и font-display', en: 'My font has a fallback and font-display' },
        { ru: 'Контролирую длину строки и line-height', en: 'I control line length and line-height' },
        { ru: 'Не загружаю ненужные файлы начертаний', en: 'I do not load unused font weights' }
      ],
      docs: [
        { label: 'MDN — Styling text', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling' },
        { label: 'MDN — Web fonts', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Web_fonts' }
      ]
    },
    {
      id: 'block-css-overflow-controls-2026',
      title: { ru: 'Переполнение и стилизация элементов формы', en: 'Overflow and form control styling' },
      tip: {
        ru: 'Контент бывает длиннее макета. Интерфейс должен переживать длинные слова, увеличение текста и реальные значения в форме.',
        en: 'Content can be longer than the mockup. An interface must survive long words, zoomed text, and real form values.'
      },
      code: '.card { min-inline-size: 0; overflow-wrap: anywhere; }\n\ninput, button, select, textarea {\n  font: inherit;\n  color: inherit;\n}\n\ntextarea { resize: vertical; min-block-size: 7rem; }',
      explain: {
        ru: '<p><code>overflow: hidden</code> скрывает проблему вместе с содержимым. Сначала разреши flex/grid-элементу сжиматься через <code>min-inline-size: 0</code>, переноси длинные значения и только потом выбирай scroll или clipping.</p><p>Нативные controls отличаются между системами. Сохраняй фокус, disabled-состояние, читаемый placeholder и достаточную область нажатия.</p>',
        en: '<p><code>overflow: hidden</code> hides the problem together with the content. First let flex/grid items shrink with <code>min-inline-size: 0</code>, wrap long values, and only then choose scrolling or clipping.</p><p>Native controls differ across systems. Preserve focus, disabled states, readable placeholders, and a sufficient hit target.</p>'
      },
      practice: {
        ru: 'Подставь в карточку URL длиной 100 символов и увеличь текст до 200%. Исправь макет без обрезки информации.',
        en: 'Put a 100-character URL in a card and zoom text to 200%. Fix the layout without clipping information.'
      },
      checklist: [
        { ru: 'Понимаю причину overflow до его скрытия', en: 'I understand the cause of overflow before hiding it' },
        { ru: 'Формы наследуют типографику и сохраняют focus', en: 'Form controls inherit typography and preserve focus' },
        { ru: 'Тестирую длинный реальный контент', en: 'I test long, realistic content' }
      ],
      docs: [
        { label: 'MDN — Overflow', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Overflow' },
        { label: 'MDN — Styling web forms', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Styling_web_forms' }
      ]
    },
    {
      id: 'block-css-debugging-2026',
      title: { ru: 'Отладка CSS через DevTools', en: 'Debugging CSS with DevTools' },
      tip: {
        ru: 'Не угадывай CSS. Сначала найди элемент, правило-победитель и реальный размер коробки.',
        en: 'Do not guess at CSS. First find the element, the winning declaration, and the computed box size.'
      },
      code: '1. Inspect element\n2. Styles: crossed-out and inherited rules\n3. Computed: final value and box model\n4. Layout: flex/grid overlays\n5. Toggle one declaration at a time',
      explain: {
        ru: '<p>Зачёркнутое правило может проиграть каскад, быть невалидным или перекрываться shorthand-свойством. Панель Computed показывает итог, а не твоё ожидание.</p><p>Для flex и grid включай визуальные overlays. Для responsive меняй ширину постепенно, чтобы найти точку, где ломается именно содержимое, а не заранее выбранный «размер телефона».</p>',
        en: '<p>A crossed-out declaration may lose the cascade, be invalid, or be overwritten by a shorthand. Computed styles show the result rather than your expectation.</p><p>Enable visual overlays for flex and grid. For responsive bugs, resize gradually to find where the content actually breaks instead of targeting an arbitrary “phone width.”</p>'
      },
      practice: {
        ru: 'Намеренно сломай ширину, каскад и выравнивание. Исправь каждую проблему, записав причину до изменения кода.',
        en: 'Intentionally break width, cascade, and alignment. Fix each issue after writing down the cause before editing code.'
      },
      checklist: [
        { ru: 'Нахожу победившее CSS-правило', en: 'I can find the winning CSS declaration' },
        { ru: 'Читаю computed box model', en: 'I can read the computed box model' },
        { ru: 'Проверяю одну гипотезу за раз', en: 'I test one hypothesis at a time' }
      ],
      docs: [
        { label: 'MDN — Debugging CSS', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Debugging_CSS' },
        { label: 'Chrome DevTools — CSS', url: 'https://developer.chrome.com/docs/devtools/css/' }
      ]
    }
  ]);

  add('sec-js', [
    {
      id: 'block-js-values-operators-2026',
      title: { ru: 'Значения, операторы и строгое сравнение', en: 'Values, operators, and strict equality' },
      tip: {
        ru: 'Оператор работает со значениями определённых типов. Сначала выясни типы, затем предсказывай результат.',
        en: 'An operator works with values of particular types. Identify the types first, then predict the result.'
      },
      code: 'Number("42")        // 42\nString(42)          // "42"\nBoolean(0)          // false\n\n5 === "5"          // false: разные типы\n5 == "5"           // true: неявное приведение\nnull ?? "fallback" // "fallback"\n0 || 10             // 10\n0 ?? 10             // 0',
      explain: {
        ru: '<p><code>===</code> сравнивает без приведения типов, поэтому это безопасный вариант по умолчанию. <code>==</code> применяет правила неявного преобразования и часто скрывает ошибку входных данных.</p><p><code>||</code> выбирает правую часть для любого falsy-значения, включая <code>0</code> и пустую строку. <code>??</code> делает это только для <code>null</code> и <code>undefined</code>. Преобразуй данные на границе: после input, URL или API.</p>',
        en: '<p><code>===</code> compares without coercion, making it the safe default. <code>==</code> applies implicit conversion rules and can hide an input-data bug.</p><p><code>||</code> uses the right side for every falsy value, including <code>0</code> and an empty string. <code>??</code> does so only for <code>null</code> and <code>undefined</code>. Convert data at boundaries such as inputs, URLs, and APIs.</p>'
      },
      practice: {
        ru: 'До запуска предскажи тип и значение десяти выражений с +, ===, || и ??. Затем проверь через console.log.',
        en: 'Predict the type and value of ten expressions using +, ===, ||, and ?? before running them, then verify with console.log.'
      },
      checklist: [
        { ru: 'Различаю явное и неявное преобразование типов', en: 'I distinguish explicit and implicit coercion' },
        { ru: 'По умолчанию использую === и !==', en: 'I use === and !== by default' },
        { ru: 'Понимаю разницу между || и ??', en: 'I understand the difference between || and ??' }
      ],
      docs: [
        { label: 'MDN — Expressions and operators', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators' },
        { label: 'MDN — Equality comparisons', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness' }
      ]
    },
    {
      id: 'block-js-json-collections-2026',
      title: { ru: 'JSON, Map и Set', en: 'JSON, Map, and Set' },
      tip: {
        ru: 'JSON — текстовый формат обмена, а не JavaScript-объект. Map и Set — коллекции со своей семантикой.',
        en: 'JSON is a text interchange format, not a JavaScript object. Map and Set are collections with distinct semantics.'
      },
      code: 'const raw = \'{"id": 7, "name": "Ada"}\';\nconst user = JSON.parse(raw);\nconst saved = JSON.stringify(user);\n\nconst uniqueTags = new Set(["js", "css", "js"]);\nconst usersById = new Map([[user.id, user]]);\nusersById.get(7);',
      explain: {
        ru: '<p><code>JSON.parse</code> может выбросить ошибку и не доказывает, что структура соответствует ожиданиям приложения. После разбора проверь поля вручную или схемой.</p><p><code>Set</code> хранит уникальные значения. <code>Map</code> подходит для ключей любого типа и явных операций <code>get/set/has</code>. Для простых записей с известными строковыми полями обычный объект часто понятнее.</p>',
        en: '<p><code>JSON.parse</code> can throw and does not prove that the resulting structure matches application expectations. Validate fields manually or with a schema after parsing.</p><p><code>Set</code> stores unique values. <code>Map</code> supports keys of any type and explicit <code>get/set/has</code> operations. A plain object is often clearer for records with known string fields.</p>'
      },
      practice: {
        ru: 'Разбери JSON со списком пользователей, удали повторяющиеся роли через Set и создай Map для поиска пользователя по id.',
        en: 'Parse JSON containing users, deduplicate roles with Set, and create a Map for user lookup by ID.'
      },
      checklist: [
        { ru: 'Различаю JSON-строку и объект JavaScript', en: 'I distinguish a JSON string from a JavaScript object' },
        { ru: 'Обрабатываю ошибку JSON.parse', en: 'I handle JSON.parse failures' },
        { ru: 'Выбираю Object, Map или Set по задаче', en: 'I choose Object, Map, or Set based on the problem' }
      ],
      docs: [
        { label: 'MDN — JSON', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON' },
        { label: 'MDN — Keyed collections', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections' }
      ]
    },
    {
      id: 'block-js-debugging-2026',
      title: { ru: 'Отладка JavaScript, а не случайные правки', en: 'Debugging JavaScript instead of guessing' },
      tip: {
        ru: 'Ошибка — это наблюдаемый разрыв между ожиданием и фактом. Сначала воспроизведи её стабильно, потом сужай участок.',
        en: 'A bug is an observable gap between expectation and reality. Reproduce it reliably first, then narrow the area.'
      },
      code: 'function total(items) {\n  debugger;\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n\nconsole.table([{ id: 1, price: 20 }]);\nconsole.assert(total([]) === 0, "Empty total must be zero");',
      explain: {
        ru: '<p>Читай первую полезную строку stack trace и ставь breakpoint до места, где значение стало неправильным. В Scope проверяй параметры и локальные переменные; Step over выполняет строку, Step into входит в функцию.</p><p>После исправления преврати воспроизведение в тест или хотя бы точную проверку. Иначе тот же баг легко вернётся.</p>',
        en: '<p>Read the first useful stack-frame line and place a breakpoint before the value becomes wrong. Inspect parameters and locals in Scope; Step over runs the line and Step into enters a function.</p><p>After fixing the issue, turn the reproduction into a test or at least a precise assertion. Otherwise the same bug can easily return.</p>'
      },
      practice: {
        ru: 'Возьми функцию с намеренной ошибкой. Запиши шаги воспроизведения, найди первую неправильную переменную breakpoint-ом и добавь проверку после фикса.',
        en: 'Use a deliberately broken function. Write reproduction steps, locate the first wrong value with a breakpoint, and add an assertion after the fix.'
      },
      checklist: [
        { ru: 'Могу стабильно воспроизвести ошибку', en: 'I can reproduce a bug reliably' },
        { ru: 'Использую breakpoint, Scope и stack trace', en: 'I use breakpoints, Scope, and stack traces' },
        { ru: 'Закрепляю исправление проверкой', en: 'I preserve the fix with an assertion or test' }
      ],
      docs: [
        { label: 'MDN — Debugging JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript' },
        { label: 'Chrome DevTools — JavaScript', url: 'https://developer.chrome.com/docs/devtools/javascript/' }
      ]
    },
    {
      id: 'block-js-browser-apis-2026',
      title: { ru: 'Браузерные API и проверка поддержки', en: 'Browser APIs and feature detection' },
      tip: {
        ru: 'DOM — только один Web API. URL, History, Clipboard, observers и media queries тоже предоставляет браузер, а не сам язык JavaScript.',
        en: 'The DOM is only one Web API. URL, History, Clipboard, observers, and media queries are provided by the browser, not JavaScript itself.'
      },
      code: 'const url = new URL(location.href);\nconst page = Number(url.searchParams.get("page") ?? 1);\n\nif ("IntersectionObserver" in window) {\n  const observer = new IntersectionObserver(entries => {\n    // Реагируем на видимость, а не на каждый scroll\n  });\n}',
      explain: {
        ru: '<p>Проверяй поддержку возможностью, а не названием браузера. API может требовать HTTPS, разрешение пользователя или действие вроде клика.</p><p><code>IntersectionObserver</code> следит за пересечением, <code>ResizeObserver</code> — за размером элемента, <code>matchMedia</code> — за media query. Не заменяй ими простое CSS-решение.</p>',
        en: '<p>Detect a capability rather than a browser name. An API may require HTTPS, user permission, or a user gesture such as a click.</p><p><code>IntersectionObserver</code> watches intersection, <code>ResizeObserver</code> watches element size, and <code>matchMedia</code> watches a media query. Do not use them when plain CSS solves the problem.</p>'
      },
      practice: {
        ru: 'Добавь query-параметр фильтра через URLSearchParams и ленивое появление блока через IntersectionObserver с fallback.',
        en: 'Add a filter query parameter with URLSearchParams and lazy block activation with IntersectionObserver plus a fallback.'
      },
      checklist: [
        { ru: 'Отличаю язык JavaScript от Web API', en: 'I distinguish JavaScript language features from Web APIs' },
        { ru: 'Проверяю поддержку через feature detection', en: 'I use feature detection for support' },
        { ru: 'Учитываю permissions, HTTPS и fallback', en: 'I account for permissions, HTTPS, and fallbacks' }
      ],
      docs: [
        { label: 'MDN — Client-side web APIs', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs' },
        { label: 'MDN — Feature detection', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing/Feature_detection' }
      ]
    },
    {
      id: 'block-js-formdata-url-2026',
      title: { ru: 'FormData и URLSearchParams', en: 'FormData and URLSearchParams' },
      tip: {
        ru: 'Не собирай форму вручную из каждого input, если браузер уже умеет читать успешные controls по их name.',
        en: 'Do not collect every input manually when the browser can already read successful controls by their name.'
      },
      code: 'form.addEventListener("submit", async event => {\n  event.preventDefault();\n  const data = new FormData(form);\n  const query = new URLSearchParams(data);\n\n  const response = await fetch(`/search?${query}`);\n  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n});',
      explain: {
        ru: '<p><code>FormData</code> учитывает <code>name</code>, checkbox, select и файлы. Не устанавливай <code>Content-Type</code> вручную при отправке multipart FormData: браузер добавит boundary.</p><p><code>URLSearchParams</code> подходит для query и URL-encoded данных, но не для файлов. Всегда проверяй <code>response.ok</code>: fetch не считает HTTP 404/500 сетевой ошибкой.</p>',
        en: '<p><code>FormData</code> handles <code>name</code>, checkboxes, selects, and files. Do not set <code>Content-Type</code> manually for multipart FormData; the browser supplies the boundary.</p><p><code>URLSearchParams</code> suits queries and URL-encoded data, but not files. Always check <code>response.ok</code>: fetch does not treat HTTP 404/500 as network failures.</p>'
      },
      practice: {
        ru: 'Собери поиск с двумя полями, отражай фильтры в URL и восстанови их после перезагрузки страницы.',
        en: 'Build a two-field search, reflect filters in the URL, and restore them after reloading the page.'
      },
      checklist: [
        { ru: 'Понимаю роль name в отправке формы', en: 'I understand the role of name in form submission' },
        { ru: 'Выбираю FormData или URLSearchParams по формату', en: 'I choose FormData or URLSearchParams by format' },
        { ru: 'Проверяю HTTP-статус ответа', en: 'I check the response HTTP status' }
      ],
      docs: [
        { label: 'MDN — FormData', url: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData' },
        { label: 'MDN — URLSearchParams', url: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams' }
      ]
    },
    {
      id: 'block-js-security-2026',
      title: { ru: 'Безопасный DOM и границы доверия', en: 'Safe DOM updates and trust boundaries' },
      tip: {
        ru: 'Любые данные пользователя, URL, localStorage и API считаются недоверенными. Не превращай строку в HTML без необходимости.',
        en: 'Treat user input, URLs, localStorage, and API data as untrusted. Do not turn a string into HTML unless necessary.'
      },
      code: 'const message = document.createElement("p");\nmessage.textContent = userInput; // текст, не HTML\ncontainer.replaceChildren(message);\n\n// Опасно для недоверенных строк:\n// container.innerHTML = userInput;',
      explain: {
        ru: '<p>XSS возникает, когда недоверенная строка исполняется как разметка или код. Для текста используй <code>textContent</code>, для URL проверяй разрешённые схемы и не вставляй обработчики событий строками.</p><p>CSP снижает последствия некоторых ошибок, но не заменяет безопасную обработку. Валидация на клиенте улучшает UX; сервер обязан проверять данные заново.</p>',
        en: '<p>XSS occurs when an untrusted string is interpreted as markup or code. Use <code>textContent</code> for text, allow-list URL schemes, and do not inject event handlers as strings.</p><p>CSP can reduce the impact of some mistakes, but it does not replace safe handling. Client validation improves UX; the server must validate again.</p>'
      },
      practice: {
        ru: 'Выведи строку <code>&lt;img src=x onerror=alert(1)&gt;</code> как обычный текст и объясни, почему innerHTML изменил бы риск.',
        en: 'Render <code>&lt;img src=x onerror=alert(1)&gt;</code> as plain text and explain why innerHTML would change the risk.'
      },
      checklist: [
        { ru: 'Считаю внешние данные недоверенными', en: 'I treat external data as untrusted' },
        { ru: 'Использую textContent для пользовательского текста', en: 'I use textContent for user-provided text' },
        { ru: 'Не считаю клиентскую валидацию защитой сервера', en: 'I do not treat client validation as server security' }
      ],
      docs: [
        { label: 'MDN — Web security', url: 'https://developer.mozilla.org/en-US/docs/Web/Security' },
        { label: 'OWASP — XSS Prevention', url: 'https://owasp.org/www-community/xss-filter-evasion-cheatsheet' }
      ]
    },
    {
      id: 'block-js-testing-2026',
      title: { ru: 'Тестируемая логика и базовые unit-тесты', en: 'Testable logic and basic unit tests' },
      tip: {
        ru: 'Проще тестировать функцию, которая получает данные и возвращает результат, чем код, который одновременно читает DOM, меняет его и делает fetch.',
        en: 'A function that receives data and returns a result is easier to test than code that reads the DOM, mutates it, and fetches data at once.'
      },
      code: 'export function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n\nimport { test } from "node:test";\nimport assert from "node:assert/strict";\n\ntest("empty cart costs zero", () => {\n  assert.equal(calculateTotal([]), 0);\n});',
      explain: {
        ru: '<p>Unit-тест фиксирует маленький контракт: вход, действие, ожидаемый результат. Проверяй обычный случай, границу и ошибку. Тест должен падать до исправления и проходить после.</p><p>Отделяй чистую логику от браузерных эффектов. DOM и пользовательский сценарий затем проверяются интеграционными и end-to-end тестами.</p>',
        en: '<p>A unit test captures a small contract: input, action, expected result. Cover a normal case, a boundary, and a failure. The test should fail before the fix and pass afterward.</p><p>Separate pure logic from browser effects. DOM behavior and user flows are then covered by integration and end-to-end tests.</p>'
      },
      practice: {
        ru: 'Вынеси расчёт из обработчика клика в функцию и напиши три теста: пустой список, один товар, несколько товаров.',
        en: 'Extract a calculation from a click handler and write three tests: empty list, one item, and multiple items.'
      },
      checklist: [
        { ru: 'Формулирую проверяемый контракт функции', en: 'I can state a testable function contract' },
        { ru: 'Проверяю обычный, граничный и ошибочный случай', en: 'I test normal, boundary, and failure cases' },
        { ru: 'Отделяю вычисления от DOM и сети', en: 'I separate calculations from DOM and network effects' }
      ],
      docs: [
        { label: 'MDN Curriculum — Testing', url: 'https://developer.mozilla.org/en-US/curriculum/extensions/testing/' },
        { label: 'Node.js test runner', url: 'https://nodejs.org/api/test.html' }
      ]
    }
  ]);

  add('sec-ts', [
    {
      id: 'block-ts-modules-2026',
      title: { ru: 'Модули и разрешение импортов TypeScript', en: 'TypeScript modules and module resolution' },
      tip: {
        ru: 'TypeScript проверяет импорт, но runtime всё равно должен уметь найти настоящий JavaScript-файл или пакет.',
        en: 'TypeScript checks an import, but the runtime must still be able to locate the real JavaScript file or package.'
      },
      code: '// user.ts\nexport interface User { id: string; name: string; }\nexport function formatUser(user: User) { return user.name; }\n\n// app.ts\nimport { formatUser, type User } from "./user.js";\n\nconst user: User = { id: "1", name: "Ada" };\nconsole.log(formatUser(user));',
      explain: {
        ru: '<p>Файл с <code>import</code> или <code>export</code> является модулем и имеет собственную область видимости. <code>import type</code> сообщает, что импорт нужен только проверке типов.</p><p><code>module</code> описывает формат результата, а <code>moduleResolution</code> — как TypeScript ищет файлы. Для Vite обычно подходит <code>moduleResolution: "bundler"</code>; для современного Node — <code>nodenext</code> с корректным <code>type</code> в package.json.</p>',
        en: '<p>A file with <code>import</code> or <code>export</code> is a module with its own scope. <code>import type</code> marks an import used only for type checking.</p><p><code>module</code> describes output format, while <code>moduleResolution</code> describes how TypeScript finds files. Vite commonly uses <code>moduleResolution: "bundler"</code>; modern Node commonly uses <code>nodenext</code> with the correct package.json <code>type</code>.</p>'
      },
      practice: {
        ru: 'Раздели один файл на data.ts, format.ts и app.ts. Экспортируй тип отдельно и проверь сборку в выбранном runtime.',
        en: 'Split one file into data.ts, format.ts, and app.ts. Export a type separately and verify the build in the chosen runtime.'
      },
      checklist: [
        { ru: 'Различаю import значения и import type', en: 'I distinguish value imports from import type' },
        { ru: 'Понимаю module и moduleResolution', en: 'I understand module and moduleResolution' },
        { ru: 'Настраиваю TS под реальный runtime или bundler', en: 'I configure TS for the actual runtime or bundler' }
      ],
      docs: [
        { label: 'TypeScript — Modules', url: 'https://www.typescriptlang.org/docs/handbook/2/modules.html' },
        { label: 'TypeScript — Modules Reference', url: 'https://www.typescriptlang.org/docs/handbook/modules/reference' }
      ]
    },
    {
      id: 'block-ts-declarations-2026',
      title: { ru: 'Типы библиотек и declaration-файлы', en: 'Library types and declaration files' },
      tip: {
        ru: 'd.ts описывает существующий JavaScript для TypeScript. Он не создаёт runtime-код и не исправляет библиотеку.',
        en: 'A d.ts file describes existing JavaScript to TypeScript. It does not create runtime code or fix the library.'
      },
      code: '// legacy-lib.d.ts\ndeclare module "legacy-lib" {\n  export interface Options { verbose?: boolean; }\n  export function run(input: string, options?: Options): Promise<number>;\n}\n\n// Если пакет уже имеет типы, этот файл не нужен.',
      explain: {
        ru: '<p>Сначала проверь встроенные типы пакета, затем <code>@types/package</code>. Собственный declaration нужен, когда библиотека действительно не поставляет типы или когда ты типизируешь локальный legacy-модуль.</p><p>Не закрывай ошибку глобальным <code>declare module "*"</code>: это превращает импорты в <code>any</code>. Описание должно совпадать с реальным API.</p>',
        en: '<p>Check package-bundled types first, then <code>@types/package</code>. Write a declaration only when a library truly lacks types or when typing a local legacy module.</p><p>Do not silence errors with global <code>declare module "*"</code>; it turns imports into <code>any</code>. The declaration must match the real API.</p>'
      },
      practice: {
        ru: 'Типизируй маленький JS-модуль без типов: одна функция, опции и Promise-результат. Добавь намеренно неверный вызов и убедись, что TS его ловит.',
        en: 'Type a small JS module without types: one function, options, and a Promise result. Add an intentionally invalid call and verify TS catches it.'
      },
      checklist: [
        { ru: 'Сначала ищу встроенные типы и @types', en: 'I check bundled types and @types first' },
        { ru: 'Понимаю, что d.ts не выполняется', en: 'I understand that d.ts files do not execute' },
        { ru: 'Не маскирую неизвестный API через any', en: 'I do not hide unknown APIs behind any' }
      ],
      docs: [
        { label: 'TypeScript — Declaration Files', url: 'https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html' },
        { label: 'TypeScript — Library Structures', url: 'https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html' }
      ]
    }
  ]);

  add('sec-react', [
    {
      id: 'block-react-render-snapshot-2026',
      title: { ru: 'Render, state-снимок и очередь обновлений', en: 'Render, state snapshots, and update queues' },
      tip: {
        ru: 'Каждый render получает собственный снимок state. Setter планирует следующий render, а не переписывает текущую переменную.',
        en: 'Each render receives its own state snapshot. A setter schedules another render; it does not rewrite the current variable.'
      },
      code: 'function Counter() {\n  const [count, setCount] = useState(0);\n\n  function addThree() {\n    setCount(value => value + 1);\n    setCount(value => value + 1);\n    setCount(value => value + 1);\n  }\n\n  return <button onClick={addThree}>{count}</button>;\n}',
      explain: {
        ru: '<p>Render вызывает компонент как функцию и получает описание UI. Commit применяет необходимые изменения к DOM. Обработчик события замыкает state того render, в котором был создан.</p><p>Когда новый state зависит от предыдущего, передавай updater-функцию. React помещает обновления в очередь и применяет их последовательно; три <code>setCount(count + 1)</code> используют один старый снимок.</p>',
        en: '<p>Render calls a component as a function and obtains a UI description. Commit applies the required DOM changes. An event handler closes over the state from the render that created it.</p><p>When next state depends on previous state, pass an updater function. React queues and applies updaters in order; three <code>setCount(count + 1)</code> calls use the same old snapshot.</p>'
      },
      practice: {
        ru: 'Сделай кнопку +3 сначала неправильно, предскажи результат, затем исправь updater-функциями и объясни очередь своими словами.',
        en: 'Build a +3 button incorrectly first, predict the result, then fix it with updater functions and explain the queue in your own words.'
      },
      checklist: [
        { ru: 'Различаю render и commit', en: 'I distinguish render from commit' },
        { ru: 'Понимаю state как снимок', en: 'I understand state as a snapshot' },
        { ru: 'Использую updater для зависимости от прошлого state', en: 'I use an updater when next state depends on previous state' }
      ],
      docs: [
        { label: 'React — Adding Interactivity', url: 'https://react.dev/learn/adding-interactivity' },
        { label: 'React — Queueing State Updates', url: 'https://react.dev/learn/queueing-a-series-of-state-updates' }
      ]
    },
    {
      id: 'block-react-state-structure-2026',
      title: { ru: 'Структура state и подъём состояния', en: 'Structuring and lifting state' },
      tip: {
        ru: 'Храни минимальный источник истины. Всё, что можно вычислить во время render, обычно не должно быть отдельным state.',
        en: 'Store the minimal source of truth. Values that can be calculated during render usually should not be separate state.'
      },
      code: 'function Cart({ items }) {\n  const [discount, setDiscount] = useState(0);\n  const subtotal = items.reduce((sum, item) => sum + item.price, 0);\n  const total = subtotal - discount; // вычисляем, не синхронизируем effect-ом\n\n  return <output>{total}</output>;\n}',
      explain: {
        ru: '<p>Дублированный и противоречивый state создаёт синхронизационные баги. Не храни одновременно список, его длину и отфильтрованную копию, если их можно вычислить.</p><p>Если два компонента должны менять одни данные, подними state в их ближайшего общего родителя и передай значение с обработчиками вниз. Не поднимай всё состояние в корень без причины.</p>',
        en: '<p>Duplicated and contradictory state creates synchronization bugs. Do not store a list, its length, and a filtered copy when those values can be derived.</p><p>If two components must edit the same data, lift state to their nearest common parent and pass values and handlers down. Do not lift every state value to the application root without a reason.</p>'
      },
      practice: {
        ru: 'Найди в компоненте производный state, удали его и вычисли значение в render. Затем синхронизируй два поля через общего родителя.',
        en: 'Find derived state in a component, remove it, and calculate the value during render. Then synchronize two fields through a common parent.'
      },
      checklist: [
        { ru: 'Храню минимальный источник истины', en: 'I store a minimal source of truth' },
        { ru: 'Вычисляю производные значения во время render', en: 'I calculate derived values during render' },
        { ru: 'Поднимаю state только до общего владельца', en: 'I lift state only to the common owner' }
      ],
      docs: [
        { label: 'React — Managing State', url: 'https://react.dev/learn/managing-state' },
        { label: 'React — Choosing the State Structure', url: 'https://react.dev/learn/choosing-the-state-structure' }
      ]
    },
    {
      id: 'block-react-state-reset-2026',
      title: { ru: 'Сохранение и сброс state через позицию и key', en: 'Preserving and resetting state with position and key' },
      tip: {
        ru: 'React связывает state не с JSX-тегом, а с позицией компонента в дереве. key участвует в его идентичности.',
        en: 'React associates state with a component position in the tree, not with a JSX tag. A key participates in that identity.'
      },
      code: 'function Messenger({ contact }) {\n  return <Chat key={contact.id} contact={contact} />;\n}\n\n// При смене contact.id React создаст новый Chat\n// и сбросит его локальный state.',
      explain: {
        ru: '<p>Один и тот же тип компонента на той же позиции сохраняет state между render. Другой тип или другой <code>key</code> заставляет React удалить старое поддерево и создать новое.</p><p>Используй стабильные ключи из данных. Индекс массива опасен, если элементы добавляются, удаляются или сортируются: state может «переехать» к другой строке.</p>',
        en: '<p>The same component type at the same position preserves state between renders. A different type or <code>key</code> makes React remove the old subtree and create a new one.</p><p>Use stable keys from data. Array indexes are risky when items are inserted, removed, or sorted because state can move to another row.</p>'
      },
      practice: {
        ru: 'Сделай переключение между двумя чатами. Сначала сохрани текст случайно, затем сбрось его правильным key и объясни почему.',
        en: 'Build a switch between two chats. First preserve draft text accidentally, then reset it with the correct key and explain why.'
      },
      checklist: [
        { ru: 'Понимаю связь state с позицией в дереве', en: 'I understand how state is tied to tree position' },
        { ru: 'Использую стабильные key из данных', en: 'I use stable keys from data' },
        { ru: 'Осознанно сохраняю или сбрасываю state', en: 'I intentionally preserve or reset state' }
      ],
      docs: [
        { label: 'React — Preserving and Resetting State', url: 'https://react.dev/learn/preserving-and-resetting-state' }
      ]
    },
    {
      id: 'block-react-effects-guidance-2026',
      title: { ru: 'Когда Effect не нужен', en: 'When an Effect is unnecessary' },
      tip: {
        ru: 'Effect нужен для синхронизации с внешней системой. Вычисления для render и реакции на конкретный клик обычно делаются без Effect.',
        en: 'An Effect synchronizes with an external system. Render calculations and reactions to a specific click usually do not need an Effect.'
      },
      code: 'function Search({ products, query }) {\n  const visible = products.filter(product =>\n    product.name.toLowerCase().includes(query.toLowerCase())\n  ); // вычисление во время render\n\n  return <ProductList products={visible} />;\n}\n\n// Effect уместен для подписки, таймера, сети или browser API.',
      explain: {
        ru: '<p>Effect запускается после commit. Если Effect только вычисляет state из props/state, появляется лишний render и риск рассинхронизации. Посчитай значение прямо в компоненте или мемоизируй только дорогую операцию.</p><p>Действие пользователя обрабатывай в event handler, потому что там известна причина. Effect не должен угадывать, какая кнопка была нажата. Для подписки обязательна cleanup-функция.</p>',
        en: '<p>An Effect runs after commit. If it only derives state from props or state, it adds another render and a synchronization risk. Calculate during render, or memoize only an expensive computation.</p><p>Handle user actions in event handlers because the cause is known there. An Effect should not guess which button was clicked. Subscriptions require cleanup.</p>'
      },
      practice: {
        ru: 'Найди Effect, который фильтрует список или обрабатывает submit. Перенеси вычисление в render, а действие — в handler.',
        en: 'Find an Effect that filters a list or handles submit. Move the calculation into render and the action into the handler.'
      },
      checklist: [
        { ru: 'Использую Effect только для внешней синхронизации', en: 'I use Effects only for external synchronization' },
        { ru: 'Не храню производное значение через Effect', en: 'I do not derive state through an Effect' },
        { ru: 'Возвращаю cleanup для подписок и таймеров', en: 'I return cleanup for subscriptions and timers' }
      ],
      docs: [
        { label: 'React — You Might Not Need an Effect', url: 'https://react.dev/learn/you-might-not-need-an-effect' },
        { label: 'React — Synchronizing with Effects', url: 'https://react.dev/learn/synchronizing-with-effects' }
      ]
    }
  ]);

  add('sec-git', [
    {
      id: 'block-git-sync-workflow-2026',
      title: { ru: 'clone, fetch, pull, merge и rebase', en: 'clone, fetch, pull, merge, and rebase' },
      tip: {
        ru: 'fetch только скачивает историю. pull скачивает и сразу интегрирует её. Перед pull важно понимать выбранную стратегию.',
        en: 'fetch only downloads history. pull downloads and integrates it. Before pulling, understand the selected strategy.'
      },
      code: 'git clone https://github.com/user/project.git\ngit fetch origin\ngit log --oneline --graph --all\ngit merge origin/main\n\n# Альтернатива для своей локальной ветки:\ngit rebase origin/main',
      explain: {
        ru: '<p><code>clone</code> создаёт локальную копию и remote <code>origin</code>. <code>fetch</code> безопасно обновляет remote-tracking ветки без изменения рабочей ветки. <code>pull</code> обычно равен fetch + merge или fetch + rebase.</p><p>Merge сохраняет развилку истории, rebase переписывает локальные коммиты поверх новой базы. Не rebase-ь общую опубликованную историю без согласования.</p>',
        en: '<p><code>clone</code> creates a local copy and an <code>origin</code> remote. <code>fetch</code> safely updates remote-tracking branches without changing the working branch. <code>pull</code> commonly means fetch + merge or fetch + rebase.</p><p>Merge preserves the branch shape; rebase rewrites local commits on a new base. Do not rebase shared published history without coordination.</p>'
      },
      practice: {
        ru: 'Создай две ветки с разными коммитами. Сравни merge и rebase через git log --graph в тестовом репозитории.',
        en: 'Create two branches with different commits. Compare merge and rebase using git log --graph in a test repository.'
      },
      checklist: [
        { ru: 'Различаю fetch и pull', en: 'I distinguish fetch from pull' },
        { ru: 'Понимаю merge commit и переписывание через rebase', en: 'I understand merge commits and rebase rewriting' },
        { ru: 'Смотрю историю до интеграции', en: 'I inspect history before integrating changes' }
      ],
      docs: [
        { label: 'Pro Git — Remotes', url: 'https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes' },
        { label: 'Pro Git — Rebasing', url: 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing' }
      ]
    },
    {
      id: 'block-git-undo-workflow-2026',
      title: { ru: 'Безопасная отмена: restore, revert и reset', en: 'Safe undo: restore, revert, and reset' },
      tip: {
        ru: 'Отмена зависит от того, где находится изменение: рабочая директория, staging, локальный commit или уже опубликованная история.',
        en: 'Undo depends on where the change lives: working tree, staging area, local commit, or already-published history.'
      },
      code: 'git restore file.js                 # убрать незакоммиченные правки\ngit restore --staged file.js        # убрать из staging\ngit commit --amend                  # заменить последний локальный commit\ngit revert <commit>                 # новый commit, отменяющий опубликованный\n\n# reset --hard удаляет работу: не используй наугад.',
      explain: {
        ru: '<p><code>restore</code> работает с файлами и staging. <code>revert</code> добавляет обратный commit и поэтому подходит общей истории. <code>reset</code> двигает указатель ветки и может менять staging/файлы в зависимости от режима.</p><p>Перед опасной операцией проверь <code>git status</code> и <code>git diff</code>. Если не понимаешь, что будет удалено, создай временную ветку или stash.</p>',
        en: '<p><code>restore</code> operates on files and staging. <code>revert</code> adds an inverse commit and therefore suits shared history. <code>reset</code> moves a branch pointer and can change staging/files depending on mode.</p><p>Before a risky command, inspect <code>git status</code> and <code>git diff</code>. If you cannot explain what will be discarded, create a temporary branch or stash.</p>'
      },
      practice: {
        ru: 'В тестовом репозитории отмени изменение в файле, staged-файл и опубликованный commit тремя разными командами.',
        en: 'In a test repository, undo a working-tree change, a staged file, and a published commit with three different commands.'
      },
      checklist: [
        { ru: 'Определяю, где находится отменяемое изменение', en: 'I identify where the change to undo is stored' },
        { ru: 'Для общей истории выбираю revert', en: 'I choose revert for shared history' },
        { ru: 'Не запускаю reset --hard без точного прогноза', en: 'I do not run reset --hard without a precise prediction' }
      ],
      docs: [
        { label: 'Pro Git — Undoing Things', url: 'https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things' }
      ]
    }
  ]);

  add('sec-node', [
    {
      id: 'block-node-modules-runtime-2026',
      title: { ru: 'Node.js runtime, ESM, CommonJS и package.json', en: 'Node.js runtime, ESM, CommonJS, and package.json' },
      tip: {
        ru: 'Node.js выполняет JavaScript вне браузера, но не даёт DOM. Формат модуля определяется расширением и package.json.',
        en: 'Node.js runs JavaScript outside the browser, but it does not provide the DOM. Module format is determined by extensions and package.json.'
      },
      code: '{\n  "type": "module",\n  "scripts": {\n    "start": "node src/server.js",\n    "test": "node --test"\n  },\n  "engines": { "node": ">=22" }\n}\n\n// ESM\nimport { readFile } from "node:fs/promises";',
      explain: {
        ru: '<p>ESM использует <code>import/export</code>; CommonJS — <code>require/module.exports</code>. Не смешивай форматы случайно. Поле <code>type: "module"</code> делает обычные .js-файлы ESM внутри пакета; .mjs и .cjs задают формат явно.</p><p>package.json описывает scripts, зависимости и требования проекта. Lockfile фиксирует конкретное дерево установленных версий и должен попадать в Git для приложения.</p>',
        en: '<p>ESM uses <code>import/export</code>; CommonJS uses <code>require/module.exports</code>. Do not mix formats accidentally. <code>type: "module"</code> makes regular .js files ESM within the package; .mjs and .cjs are explicit.</p><p>package.json describes scripts, dependencies, and project requirements. A lockfile records the concrete dependency tree and belongs in Git for an application.</p>'
      },
      practice: {
        ru: 'Создай маленький ESM-проект с двумя файлами, script start и встроенным node:fs import. Объясни, что изменится без type: module.',
        en: 'Create a small ESM project with two files, a start script, and a node:fs import. Explain what changes without type: module.'
      },
      checklist: [
        { ru: 'Различаю возможности браузера и Node.js', en: 'I distinguish browser and Node.js capabilities' },
        { ru: 'Понимаю ESM, CommonJS и поле type', en: 'I understand ESM, CommonJS, and the type field' },
        { ru: 'Коммичу lockfile приложения', en: 'I commit the application lockfile' }
      ],
      docs: [
        { label: 'Node.js — ECMAScript modules', url: 'https://nodejs.org/api/esm.html' },
        { label: 'Node.js — Packages', url: 'https://nodejs.org/api/packages.html' }
      ]
    },
    {
      id: 'block-node-event-loop-streams-2026',
      title: { ru: 'Event loop, Buffer и streams в Node.js', en: 'Node.js event loop, Buffer, and streams' },
      tip: {
        ru: 'Node хорошо обслуживает много I/O-задач, но тяжёлый синхронный JavaScript блокирует один event loop процесса.',
        en: 'Node handles many I/O tasks well, but heavy synchronous JavaScript blocks the process event loop.'
      },
      code: 'import { createReadStream, createWriteStream } from "node:fs";\nimport { pipeline } from "node:stream/promises";\n\nawait pipeline(\n  createReadStream("large.mp4"),\n  createWriteStream("copy.mp4")\n);',
      explain: {
        ru: '<p><code>Buffer</code> хранит байты. Stream обрабатывает данные частями и поддерживает backpressure, поэтому большой файл не нужно целиком загружать в память.</p><p>Синхронные fs-операции и долгие циклы блокируют обработку других запросов. CPU-тяжёлую работу выносят в worker threads, отдельный процесс или сервис.</p>',
        en: '<p>A <code>Buffer</code> stores bytes. A stream processes data in chunks and supports backpressure, so a large file need not be loaded entirely into memory.</p><p>Synchronous fs operations and long loops block other requests. CPU-heavy work belongs in worker threads, another process, or a separate service.</p>'
      },
      practice: {
        ru: 'Скопируй большой файл через readFile и через pipeline. Сравни потребление памяти и поведение при ошибке пути.',
        en: 'Copy a large file using readFile and pipeline. Compare memory use and behavior when the path is invalid.'
      },
      checklist: [
        { ru: 'Понимаю, что блокирует event loop', en: 'I understand what blocks the event loop' },
        { ru: 'Различаю Buffer и stream', en: 'I distinguish Buffer from a stream' },
        { ru: 'Использую pipeline для обработки ошибок и backpressure', en: 'I use pipeline for errors and backpressure' }
      ],
      docs: [
        { label: 'Node.js — Event loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' },
        { label: 'Node.js — Streams', url: 'https://nodejs.org/api/stream.html' }
      ]
    },
    {
      id: 'block-node-http-errors-2026',
      title: { ru: 'HTTP-сервер, ошибки и границы запроса', en: 'HTTP servers, errors, and request boundaries' },
      tip: {
        ru: 'Запрос — недоверенная граница. Разбери метод и URL, проверь вход, верни один ответ и не раскрывай stack trace пользователю.',
        en: 'A request is an untrusted boundary. Parse method and URL, validate input, send exactly one response, and do not expose stack traces.'
      },
      code: 'import { createServer } from "node:http";\n\nconst server = createServer(async (req, res) => {\n  try {\n    const url = new URL(req.url, `http://${req.headers.host}`);\n    if (req.method !== "GET" || url.pathname !== "/health") {\n      res.writeHead(404).end("Not found");\n      return;\n    }\n    res.writeHead(200, { "content-type": "application/json" });\n    res.end(JSON.stringify({ ok: true }));\n  } catch (error) {\n    console.error(error);\n    res.writeHead(500).end("Internal server error");\n  }\n});',
      explain: {
        ru: '<p>HTTP handler должен завершать каждую ветку ровно одним ответом. После <code>res.end</code> делай <code>return</code>, чтобы код не продолжил работу. Разделяй ожидаемые ошибки клиента 4xx и неожиданные ошибки сервера 5xx.</p><p>Лог содержит технический контекст на сервере, а публичный ответ — безопасное сообщение. В production добавь request ID и структурированные поля вместо случайных console.log.</p>',
        en: '<p>An HTTP handler must finish every branch with exactly one response. Return after <code>res.end</code> so execution does not continue. Separate expected client errors (4xx) from unexpected server errors (5xx).</p><p>Logs keep technical context on the server, while the public response uses a safe message. Production systems add request IDs and structured fields instead of random console.log calls.</p>'
      },
      practice: {
        ru: 'Сделай /health, неизвестный маршрут и намеренную внутреннюю ошибку. Проверь статусы и отсутствие stack trace в ответе.',
        en: 'Implement /health, an unknown route, and an intentional internal error. Verify status codes and that responses do not expose stack traces.'
      },
      checklist: [
        { ru: 'Возвращаю корректные 2xx, 4xx и 5xx', en: 'I return appropriate 2xx, 4xx, and 5xx codes' },
        { ru: 'Не отправляю несколько ответов на один request', en: 'I do not send multiple responses for one request' },
        { ru: 'Не раскрываю внутреннюю ошибку клиенту', en: 'I do not expose internal errors to clients' }
      ],
      docs: [
        { label: 'Node.js — HTTP', url: 'https://nodejs.org/api/http.html' },
        { label: 'MDN — HTTP status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' }
      ]
    },
    {
      id: 'block-node-testing-shutdown-2026',
      title: { ru: 'Node test runner и корректное завершение', en: 'Node test runner and graceful shutdown' },
      tip: {
        ru: 'Приложение должно не только запускаться, но и проверяться и завершаться без потери активной работы.',
        en: 'An application must not only start; it must be testable and able to stop without dropping active work.'
      },
      code: 'import { test } from "node:test";\nimport assert from "node:assert/strict";\n\ntest("health service returns ok", async () => {\n  assert.deepEqual(await health(), { ok: true });\n});\n\nprocess.on("SIGTERM", () => {\n  server.close(error => process.exit(error ? 1 : 0));\n});',
      explain: {
        ru: '<p>Встроенный <code>node:test</code> поддерживает тесты, hooks и mocking без обязательного внешнего runner. Тестируй бизнес-логику отдельно и HTTP-контракт через запущенный на случайном порту сервер.</p><p>При SIGTERM сервер прекращает принимать новые соединения и ждёт завершения текущих. Задай таймаут аварийного выхода и закрой БД, очередь и другие ресурсы.</p>',
        en: '<p>The built-in <code>node:test</code> module supports tests, hooks, and mocking without a mandatory external runner. Test business logic separately and HTTP contracts against a server on a random port.</p><p>On SIGTERM, stop accepting new connections and wait for active ones to finish. Add a forced-exit timeout and close databases, queues, and other resources.</p>'
      },
      practice: {
        ru: 'Добавь unit-тест сервиса и integration-тест /health. Запусти процесс, отправь SIGTERM и проверь, что он закрывается.',
        en: 'Add a unit test for a service and an integration test for /health. Start the process, send SIGTERM, and verify it closes.'
      },
      checklist: [
        { ru: 'Запускаю тесты одной командой package script', en: 'I run tests with one package script' },
        { ru: 'Различаю unit и HTTP integration test', en: 'I distinguish unit from HTTP integration tests' },
        { ru: 'Закрываю сервер и ресурсы по сигналу', en: 'I close the server and resources on a signal' }
      ],
      docs: [
        { label: 'Node.js — Test runner', url: 'https://nodejs.org/api/test.html' },
        { label: 'Node.js — Process signals', url: 'https://nodejs.org/api/process.html#signal-events' }
      ]
    }
  ]);

  add('sec-sql', [
    {
      id: 'block-sql-constraints-normalization-2026',
      title: { ru: 'Типы, ограничения и нормализация', en: 'Types, constraints, and normalization' },
      tip: {
        ru: 'База должна запрещать невозможные состояния сама. Проверка только в приложении не защищает от другого клиента или ошибочного скрипта.',
        en: 'The database should reject impossible states itself. Application-only validation does not protect against another client or a broken script.'
      },
      code: 'CREATE TABLE users (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email text NOT NULL UNIQUE,\n  role text NOT NULL CHECK (role IN (\'user\', \'admin\')),\n  created_at timestamptz NOT NULL DEFAULT now()\n);\n\nCREATE TABLE orders (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  user_id bigint NOT NULL REFERENCES users(id)\n);',
      explain: {
        ru: '<p>Выбирай тип по смыслу: <code>timestamptz</code> для момента времени, numeric для точной десятичной арифметики, boolean для двух состояний. <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK</code> и foreign key превращают правила в гарантии.</p><p>Нормализация убирает дублирование фактов: пользователь хранится один раз, заказ ссылается по ключу. Денормализация допустима после измерения, когда понятна цена синхронизации.</p>',
        en: '<p>Choose types by meaning: <code>timestamptz</code> for an instant, numeric for exact decimal arithmetic, and boolean for two states. <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK</code>, and foreign keys turn rules into guarantees.</p><p>Normalization removes duplicated facts: a user is stored once and orders reference the key. Denormalize only after measurement and with a known synchronization cost.</p>'
      },
      practice: {
        ru: 'Спроектируй users и orders. Попробуй вставить дубликат email, неизвестного user_id и запрещённую role; база должна отказать.',
        en: 'Design users and orders. Try inserting a duplicate email, unknown user_id, and invalid role; the database should reject them.'
      },
      checklist: [
        { ru: 'Выбираю тип столбца по доменному смыслу', en: 'I choose column types by domain meaning' },
        { ru: 'Закрепляю правила constraints-ами', en: 'I enforce rules with constraints' },
        { ru: 'Не дублирую один факт без причины', en: 'I do not duplicate one fact without a reason' }
      ],
      docs: [
        { label: 'PostgreSQL — Data Types', url: 'https://www.postgresql.org/docs/current/datatype.html' },
        { label: 'PostgreSQL — Constraints', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html' }
      ]
    },
    {
      id: 'block-sql-explain-pagination-2026',
      title: { ru: 'EXPLAIN, планы запросов и пагинация', en: 'EXPLAIN, query plans, and pagination' },
      tip: {
        ru: 'Индекс не делает запрос быстрым автоматически. Сначала измерь реальный план на данных, похожих на production.',
        en: 'An index does not automatically make a query fast. Measure the actual plan using production-like data first.'
      },
      code: 'EXPLAIN (ANALYZE, BUFFERS)\nSELECT id, created_at\nFROM orders\nWHERE user_id = 42\nORDER BY created_at DESC, id DESC\nLIMIT 20;\n\nCREATE INDEX orders_user_created_idx\nON orders (user_id, created_at DESC, id DESC);',
      explain: {
        ru: '<p><code>EXPLAIN</code> показывает план, <code>ANALYZE</code> реально выполняет запрос. Сравни estimated и actual rows, тип scan, время и buffers. Не запускай изменяющий запрос с ANALYZE без понимания последствий.</p><p>Большой <code>OFFSET</code> заставляет базу пропускать много строк. Keyset pagination продолжает после последнего <code>(created_at, id)</code> и обычно стабильнее для ленты.</p>',
        en: '<p><code>EXPLAIN</code> shows a plan; <code>ANALYZE</code> actually executes the query. Compare estimated and actual rows, scan type, time, and buffers. Do not ANALYZE a mutating query without understanding the consequences.</p><p>A large <code>OFFSET</code> makes the database skip many rows. Keyset pagination continues after the last <code>(created_at, id)</code> and is usually more stable for feeds.</p>'
      },
      practice: {
        ru: 'Заполни таблицу тестовыми строками, сравни план до и после составного индекса и реализуй следующую страницу без большого OFFSET.',
        en: 'Populate a table with test rows, compare plans before and after a composite index, and implement the next page without a large OFFSET.'
      },
      checklist: [
        { ru: 'Читаю базовый EXPLAIN ANALYZE', en: 'I can read a basic EXPLAIN ANALYZE' },
        { ru: 'Создаю индекс под фильтр и сортировку запроса', en: 'I design an index for query filters and sorting' },
        { ru: 'Понимаю цену OFFSET и keyset pagination', en: 'I understand OFFSET cost and keyset pagination' }
      ],
      docs: [
        { label: 'PostgreSQL — EXPLAIN', url: 'https://www.postgresql.org/docs/current/using-explain.html' },
        { label: 'PostgreSQL — Indexes', url: 'https://www.postgresql.org/docs/current/indexes.html' }
      ]
    }
  ]);

  add('sec-pg', [
    {
      id: 'block-pg-roles-backups-2026',
      title: { ru: 'Роли, least privilege и резервное восстановление', en: 'Roles, least privilege, and backup restoration' },
      tip: {
        ru: 'Backup существует только после успешной проверки восстановления. Приложение не должно подключаться суперпользователем.',
        en: 'A backup exists only after a successful restore test. An application should not connect as a superuser.'
      },
      code: 'CREATE ROLE app_user LOGIN PASSWORD \'use-a-secret-manager\';\nGRANT CONNECT ON DATABASE app TO app_user;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;\n\n# Backup and restore drill\npg_dump --format=custom --file=app.dump app\ncreatedb app_restore_test\npg_restore --dbname=app_restore_test app.dump',
      explain: {
        ru: '<p>Least privilege выдаёт приложению только нужные действия. Отдельные роли для миграций, приложения и чтения уменьшают последствия утечки.</p><p>Логический dump подходит не каждой нагрузке и не заменяет стратегию провайдера, PITR и копии в другом месте. Регулярно восстанавливай backup в отдельную базу и проверяй данные.</p>',
        en: '<p>Least privilege grants the application only required actions. Separate migration, application, and read-only roles reduce the impact of credential leakage.</p><p>A logical dump does not fit every workload and does not replace provider backups, PITR, and off-site copies. Restore regularly into a separate database and verify the data.</p>'
      },
      practice: {
        ru: 'Создай ограниченную роль, проверь разрешённый SELECT и запрещённый DROP. Сделай dump тестовой базы и восстанови его под новым именем.',
        en: 'Create a restricted role, verify an allowed SELECT and denied DROP, then dump a test database and restore it under a new name.'
      },
      checklist: [
        { ru: 'Приложение не использует superuser', en: 'The application does not use a superuser' },
        { ru: 'Секрет БД не хранится в клиентском коде', en: 'Database secrets are not stored in client code' },
        { ru: 'Я проверял восстановление backup', en: 'I have tested restoring a backup' }
      ],
      docs: [
        { label: 'PostgreSQL — Roles', url: 'https://www.postgresql.org/docs/current/user-manag.html' },
        { label: 'PostgreSQL — Backup and Restore', url: 'https://www.postgresql.org/docs/current/backup.html' }
      ]
    }
  ]);

  add('sec-devops', [
    {
      id: 'block-devops-web-foundations-2026',
      title: { ru: 'DNS, TLS, reverse proxy и HTTP', en: 'DNS, TLS, reverse proxies, and HTTP' },
      tip: {
        ru: 'Домен, сертификат и сервер — разные части. DNS указывает адрес, TLS защищает соединение, reverse proxy принимает HTTP и передаёт запрос приложению.',
        en: 'A domain, certificate, and server are separate pieces. DNS points to an address, TLS protects the connection, and a reverse proxy forwards HTTP to the application.'
      },
      code: 'browser\n  │ DNS: app.example.com → 203.0.113.10\n  │ TLS: проверка сертификата и шифрование\n  ▼\nreverse proxy :443\n  │ Host / path / headers\n  ▼\napplication :3000\n  │\n  ▼\ndatabase (не открыта в интернет)',
      explain: {
        ru: '<p>A/AAAA/CNAME-записи управляют разрешением имени, но DNS не «включает HTTPS». Сертификат подтверждает имя и участвует в TLS handshake. Reverse proxy может завершать TLS, добавлять заголовки, ограничивать размер и направлять маршруты.</p><p>Передавай исходный protocol/IP только через доверенный proxy и правильно настрой trust proxy. База и внутренние сервисы обычно не должны иметь публичный порт.</p>',
        en: '<p>A/AAAA/CNAME records control name resolution, but DNS does not “enable HTTPS.” A certificate verifies a name and participates in the TLS handshake. A reverse proxy can terminate TLS, add headers, limit request size, and route paths.</p><p>Trust forwarded protocol/IP information only from a trusted proxy and configure trust proxy correctly. Databases and internal services generally should not expose public ports.</p>'
      },
      practice: {
        ru: 'Нарисуй путь запроса своего проекта от домена до приложения. Для каждого узла запиши порт, ответственность и доступность из интернета.',
        en: 'Draw your project request path from domain to application. For each node, record its port, responsibility, and internet exposure.'
      },
      checklist: [
        { ru: 'Различаю DNS, TLS, proxy и приложение', en: 'I distinguish DNS, TLS, proxy, and application roles' },
        { ru: 'Понимаю путь HTTP-запроса по инфраструктуре', en: 'I understand the HTTP request path through infrastructure' },
        { ru: 'Не публикую внутренние сервисы без необходимости', en: 'I do not expose internal services unnecessarily' }
      ],
      docs: [
        { label: 'MDN — How the web works', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works' },
        { label: 'MDN — TLS', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security' }
      ]
    },
    {
      id: 'block-devops-observability-release-2026',
      title: { ru: 'Наблюдаемость, health checks и безопасный релиз', en: 'Observability, health checks, and safe releases' },
      tip: {
        ru: '«Процесс запущен» не означает «приложение работает». Нужны сигналы, проверка зависимости и план отката.',
        en: '“The process is running” does not mean “the application works.” You need signals, dependency checks, and a rollback plan.'
      },
      code: 'GET /live   → процесс отвечает\nGET /ready  → приложение готово принимать трафик\n\nLogs    → что произошло в конкретном запросе\nMetrics → сколько и насколько часто\nTraces  → где прошло время между сервисами\n\nDeploy → smoke test → gradual traffic → monitor → rollback if needed',
      explain: {
        ru: '<p>Liveness отвечает, нужно ли перезапустить процесс. Readiness отвечает, можно ли направлять на него трафик. Не делай liveness зависимой от каждой внешней системы, иначе временный сбой вызовет перезапуск всех экземпляров.</p><p>Логи, метрики и traces отвечают на разные вопросы. Для релиза заранее определи smoke-проверку, допустимый error rate и команду отката. Секреты поступают из защищённого хранилища, а не из Git или клиентского bundle.</p>',
        en: '<p>Liveness answers whether a process should be restarted. Readiness answers whether it can receive traffic. Do not make liveness depend on every external system or a temporary outage may restart every instance.</p><p>Logs, metrics, and traces answer different questions. Define a smoke test, acceptable error rate, and rollback command before release. Secrets come from protected storage, not Git or a client bundle.</p>'
      },
      practice: {
        ru: 'Добавь /live и /ready, структурированный request log и короткий RELEASE.md со smoke-проверкой и откатом.',
        en: 'Add /live and /ready, a structured request log, and a short RELEASE.md containing a smoke test and rollback steps.'
      },
      checklist: [
        { ru: 'Различаю liveness и readiness', en: 'I distinguish liveness from readiness' },
        { ru: 'Выбираю logs, metrics или traces по вопросу', en: 'I choose logs, metrics, or traces based on the question' },
        { ru: 'У релиза есть проверка и обратимый откат', en: 'A release has verification and a reversible rollback' }
      ],
      docs: [
        { label: 'Docker — Health checks', url: 'https://docs.docker.com/reference/dockerfile/#healthcheck' },
        { label: 'OpenTelemetry — Observability primer', url: 'https://opentelemetry.io/docs/concepts/observability-primer/' }
      ]
    }
  ]);

  add('sec-vite', [
    {
      id: 'block-vite-build-deploy-2026',
      title: { ru: 'Production build, base path и деплой Vite', en: 'Vite production builds, base paths, and deployment' },
      tip: {
        ru: 'vite dev — сервер разработки, vite build — production bundle, vite preview — локальная проверка bundle, но не production-сервер.',
        en: 'vite dev is a development server, vite build creates a production bundle, and vite preview checks that bundle locally but is not a production server.'
      },
      code: '// vite.config.js\nimport { defineConfig } from "vite";\n\nexport default defineConfig({\n  base: "/my-repository/"\n});\n\n// package.json\n// "build": "vite build"\n// "preview": "vite preview"',
      explain: {
        ru: '<p>Vite использует index.html как точку входа и создаёт <code>dist</code>. Для GitHub Pages в подпапке настрой <code>base</code>, иначе абсолютные asset URL будут смотреть в корень домена.</p><p>Все переменные <code>VITE_*</code> встраиваются в клиентский код и публичны. После build проверь preview, прямой переход на маршруты, asset paths, ошибки консоли и нужную версию Node в CI.</p>',
        en: '<p>Vite uses index.html as an entry point and creates <code>dist</code>. For GitHub Pages under a repository path, configure <code>base</code> or absolute asset URLs will point at the domain root.</p><p>Every <code>VITE_*</code> variable is bundled into public client code. After building, verify preview, direct route navigation, asset paths, console errors, and the required Node version in CI.</p>'
      },
      practice: {
        ru: 'Собери проект, открой dist через vite preview и задеплой в подпуть. Проверь обновление страницы и отсутствие 404 у assets.',
        en: 'Build the project, open dist with vite preview, and deploy under a subpath. Verify refresh behavior and that assets do not return 404.'
      },
      checklist: [
        { ru: 'Различаю dev, build и preview', en: 'I distinguish dev, build, and preview' },
        { ru: 'Настраиваю base для подпути', en: 'I configure base for a subpath' },
        { ru: 'Не храню секреты в VITE-переменных', en: 'I do not store secrets in VITE variables' }
      ],
      docs: [
        { label: 'Vite — Building for Production', url: 'https://vite.dev/guide/build' },
        { label: 'Vite — Static Deploy', url: 'https://vite.dev/guide/static-deploy.html' },
        { label: 'Vite — Env and Modes', url: 'https://vite.dev/guide/env-and-mode' }
      ]
    }
  ]);

  window.WebDevGymCurriculumAudit = {
    version: '2026.08.11',
    sourceBaseline: [
      mdnCurriculum,
      'https://www.w3.org/WAI/tutorials/',
      'https://www.typescriptlang.org/docs/handbook/intro.html',
      'https://react.dev/learn',
      'https://nodejs.org/api/',
      'https://git-scm.com/book/en/v2',
      'https://www.postgresql.org/docs/current/',
      'https://vite.dev/guide/'
    ]
  };
})();
