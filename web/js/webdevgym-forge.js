(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  const isEnglish = runtime?.isEnglish ?? (document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname));
  const L = runtime?.L || ((en, ru) => isEnglish ? en : ru);
  const STORE_KEY = 'wdg_forge_v1';
  const GIT_KEY = 'wdg_git_trainer_v1';
  const PREVIEW_STORAGE_KEY = 'wdg_forge_preview_storage_v1';
  const MAX_HISTORY = 20;

  const copy = {
    title: 'Forge',
    subtitle: L('Build features yourself, verify behavior and keep every useful version.', 'Собирай функции самостоятельно, проверяй поведение и сохраняй каждую полезную версию.'),
    projects: L('Projects', 'Проекты'),
    git: 'Git Lab',
    run: L('Run', 'Запустить'),
    test: L('Run tests', 'Проверить'),
    snapshot: L('Checkpoint', 'Версия'),
    history: L('History', 'История'),
    reset: L('Reset project', 'Сбросить проект'),
    hint: L('Open next hint', 'Открыть подсказку'),
    requirements: L('Acceptance criteria', 'Критерии готовности'),
    preview: L('Live preview', 'Предпросмотр'),
    editor: L('Code editor', 'Редактор кода'),
    saved: L('Saved locally', 'Сохранено локально'),
    passed: L('Passed', 'Пройдено'),
    failed: L('Needs work', 'Нужно исправить'),
    noHistory: L('No checkpoints yet.', 'Сохранённых версий пока нет.'),
    restore: L('Restore', 'Восстановить'),
    delete: L('Delete', 'Удалить'),
    close: L('Close', 'Закрыть'),
    complete: L('Project complete', 'Проект готов'),
    choose: L('Choose a project', 'Выбери проект'),
    noSolution: L('Hints explain the direction without replacing your work with a finished solution.', 'Подсказки показывают направление, но не заменяют твою работу готовым решением.'),
    export: L('Export source', 'Экспорт кода'),
    exported: L('Project exported', 'Проект экспортирован'),
    exportFallback: L('Three source files were downloaded. Put style.css into css and script.js into js.', 'Скачаны три файла. Положи style.css в папку css, а script.js в папку js.'),
    line: L('line', 'строка')
  };

  const hintStages = [L('Direction', 'Направление'), L('Method', 'Способ'), L('Final check', 'Проверка')];

  function lines() {
    return Array.prototype.slice.call(arguments).join('\n');
  }

  const projects = [
    {
      id: 'counter',
      title: L('Counter without negative values', 'Счётчик без отрицательных значений'),
      level: L('Interface basics', 'Основа интерфейса'),
      section: 'js',
      description: L('Connect three buttons to one state value and keep the interface synchronized.', 'Свяжи три кнопки с одним состоянием и не давай интерфейсу расходиться с данными.'),
      requirements: [
        L('The page has a counter and plus, minus, reset controls.', 'На странице есть число и кнопки плюс, минус, сброс.'),
        L('Plus increases the number and reset returns zero.', 'Плюс увеличивает число, сброс возвращает ноль.'),
        L('Minus never allows a value below zero.', 'Минус не позволяет уйти ниже нуля.')
      ],
      hints: [
        L('Keep the current number in one variable. The page should only display that variable.', 'Храни текущее число в одной переменной. Страница должна только показывать её значение.'),
        L('Create one update function and call it after every state change.', 'Создай одну функцию обновления и вызывай её после каждого изменения состояния.'),
        L('Before decrementing, check whether the value is greater than zero.', 'Перед уменьшением проверь, что значение больше нуля.')
      ],
      starter: {
        html: lines(
          '<main class="counter">',
          '  <output class="count">0</output>',
          '  <div class="actions">',
          '    <button class="plus" type="button">+</button>',
          '    <button class="minus" type="button">-</button>',
          '    <button class="reset" type="button">Reset</button>',
          '  </div>',
          '</main>'
        ),
        css: lines(
          'body {',
          '  min-height: 100vh;',
          '  margin: 0;',
          '  display: grid;',
          '  place-items: center;',
          '  background: #0b1020;',
          '  color: #f8fafc;',
          '  font-family: system-ui, sans-serif;',
          '}',
          '',
          '.counter { text-align: center; }',
          '.count { display: block; font-size: 64px; margin-bottom: 20px; }',
          '.actions { display: flex; gap: 10px; }',
          'button { padding: 10px 18px; cursor: pointer; }'
        ),
        js: lines(
          'const count = document.querySelector(".count");',
          'const plus = document.querySelector(".plus");',
          'const minus = document.querySelector(".minus");',
          'const reset = document.querySelector(".reset");',
          '',
          'let score = 0;',
          '',
          L('// Continue independently', '// \u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438 \u0441\u0430\u043c\u043e\u0441\u0442\u043e\u044f\u0442\u0435\u043b\u044c\u043d\u043e')
        )
      }
    },
    {
      id: 'form',
      title: L('Form validation', 'Проверка формы'),
      level: L('Events and forms', 'События и формы'),
      section: 'js',
      description: L('Validate a name before accepting the form and show a clear message.', 'Проверь имя перед принятием формы и покажи понятное сообщение.'),
      requirements: [
        L('Empty submission is blocked.', 'Пустая отправка блокируется.'),
        L('The user sees an error message.', 'Пользователь видит сообщение об ошибке.'),
        L('After valid submission the field is cleared.', 'После успешной отправки поле очищается.')
      ],
      hints: [
        L('Listen to submit on the form, not click on the button.', 'Слушай submit у формы, а не click у кнопки.'),
        L('Use trim() before comparing the value with an empty string.', 'Используй trim() перед сравнением значения с пустой строкой.'),
        L('preventDefault() belongs at the beginning of the submit handler.', 'preventDefault() поставь в начале обработчика submit.')
      ],
      starter: {
        html: lines(
          '<form class="contact-form">',
          '  <label for="name">Name</label>',
          '  <input id="name" name="name" autocomplete="name">',
          '  <p class="error" aria-live="polite"></p>',
          '  <button type="submit">Send</button>',
          '</form>'
        ),
        css: lines(
          'body {',
          '  min-height: 100vh;',
          '  margin: 0;',
          '  display: grid;',
          '  place-items: center;',
          '  background: #101522;',
          '  color: #f8fafc;',
          '  font-family: system-ui, sans-serif;',
          '}',
          '.contact-form { display: grid; gap: 10px; width: min(320px, 90vw); }',
          'input, button { padding: 11px; }',
          '.error { min-height: 20px; margin: 0; color: #fb7185; }'
        ),
        js: lines(
          'const form = document.querySelector(".contact-form");',
          'const input = document.querySelector("#name");',
          'const error = document.querySelector(".error");',
          '',
          '// Добавь обработчик submit'
        )
      }
    },
    {
      id: 'theme',
      title: L('Theme switcher', 'Переключатель темы'),
      level: L('State and preferences', 'Состояние и настройки'),
      section: 'js',
      description: L('Build a clear two-state theme switcher. Choose the implementation yourself.', 'Сделай понятный переключатель двух тем. Способ реализации выбери самостоятельно.'),
      requirements: [
        L('The button changes the visible theme.', 'Кнопка визуально меняет тему.'),
        L('Repeated clicks switch predictably between two states.', 'Повторные клики предсказуемо переключают два состояния.'),
        L('The control has a clear text or accessible label.', 'У переключателя есть понятный текст или доступная подпись.')
      ],
      hints: [
        L('Toggle one class on document.body.', 'Переключай один класс у document.body.'),
        L('Keep the current theme in one clear state value or class.', 'Храни текущую тему в одном понятном значении или классе состояния.'),
        L('After a second click, the interface should return to the original theme.', 'После второго клика интерфейс должен вернуться к исходной теме.')
      ],
      starter: {
        html: lines(
          '<main>',
          '  <h1>Theme switcher</h1>',
          '  <button class="theme-btn" type="button">Switch theme</button>',
          '</main>'
        ),
        css: lines(
          'body {',
          '  min-height: 100vh;',
          '  margin: 0;',
          '  display: grid;',
          '  place-items: center;',
          '  background: #f8fafc;',
          '  color: #111827;',
          '  font-family: system-ui, sans-serif;',
          '}',
          'body.dark { background: #0b1020; color: #f8fafc; }',
          'main { text-align: center; }',
          'button { padding: 10px 16px; }'
        ),
        js: lines(
          'const themeBtn = document.querySelector(".theme-btn");',
          '',
          '// Определи начальную тему',
          '// Затем добавь переключение по клику'
        )
      }
    },
    {
      id: 'todo',
      title: L('Small task list', 'Небольшой список задач'),
      level: L('Interface practice', 'Практика интерфейса'),
      section: 'js',
      description: L('Create list elements from user input and remove them without reloading.', 'Создавай элементы списка из введённого текста и удаляй их без перезагрузки.'),
      requirements: [
        L('An empty task is not added.', 'Пустая задача не добавляется.'),
        L('A valid task appears in the list.', 'Нормальная задача появляется в списке.'),
        L('Every task can be removed.', 'Каждую задачу можно удалить.')
      ],
      hints: [
        L('Handle the form submit and read input.value.trim().', 'Обработай submit формы и прочитай input.value.trim().'),
        L('Create li and button with createElement, then append them to the list.', 'Создай li и кнопку через createElement, затем добавь их в список.'),
        L('The remove button can call li.remove() inside its click handler.', 'Кнопка удаления может вызвать li.remove() внутри обработчика click.')
      ],
      starter: {
        html: lines(
          '<main class="todo">',
          '  <h1>Tasks</h1>',
          '  <form class="todo-form">',
          '    <input class="todo-input" placeholder="New task">',
          '    <button type="submit">Add</button>',
          '  </form>',
          '  <ul class="todo-list"></ul>',
          '</main>'
        ),
        css: lines(
          'body {',
          '  min-height: 100vh;',
          '  margin: 0;',
          '  display: grid;',
          '  place-items: center;',
          '  background: #0b1020;',
          '  color: #f8fafc;',
          '  font-family: system-ui, sans-serif;',
          '}',
          '.todo { width: min(420px, 90vw); }',
          '.todo-form { display: flex; gap: 8px; }',
          'input { flex: 1; }',
          'input, button { padding: 10px; }',
          'li { display: flex; justify-content: space-between; margin-top: 8px; }'
        ),
        js: lines(
          'const form = document.querySelector(".todo-form");',
          'const input = document.querySelector(".todo-input");',
          'const list = document.querySelector(".todo-list");',
          '',
          '// Добавь задачи через submit'
        )
      }
    }
,
    {
      id: 'tabs',
      title: L('Accessible tabs', 'Доступные вкладки'),
      level: L('Interface and state', 'Интерфейс и состояние'),
      section: 'js',
      description: L('Connect tab controls to panels and keep one active state.', 'Свяжи кнопки вкладок с панелями и храни одно активное состояние.'),
      requirements: [
        L('There are at least two controls and two matching panels.', 'Есть минимум две кнопки и две соответствующие панели.'),
        L('Clicking a control opens its matching panel.', 'Клик по кнопке открывает связанную с ней панель.'),
        L('Only one panel is visible at a time.', 'Одновременно видна только одна панель.')
      ],
      hints: [
        L('Give every button the id of its panel through data-tab-target.', 'Передай каждой кнопке id ее панели через data-tab-target.'),
        L('On click, loop through buttons and panels to remove the previous active state.', 'По клику пройди по кнопкам и панелям, чтобы убрать прошлое активное состояние.'),
        L('The clicked button knows the target id through event.currentTarget.dataset.', 'Нажатая кнопка знает id цели через event.currentTarget.dataset.')
      ],
      starter: {
        html: lines(
          '<main class="tabs">',
          '  <div class="tab-list" role="tablist">',
          '    <button class="tab-btn active" data-tab-target="about" type="button">About</button>',
          '    <button class="tab-btn" data-tab-target="skills" type="button">Skills</button>',
          '  </div>',
          '  <section class="tab-panel active" id="about">About content</section>',
          '  <section class="tab-panel" id="skills" hidden>Skills content</section>',
          '</main>'
        ),
        css: lines(
          'body { min-height:100vh; margin:0; display:grid; place-items:center; background:#0b1020; color:#f8fafc; font-family:system-ui,sans-serif; }',
          '.tabs { width:min(520px,90vw); }',
          '.tab-list { display:flex; gap:8px; }',
          '.tab-btn { padding:10px 16px; }',
          '.tab-btn.active { background:#7c3aed; color:white; }',
          '.tab-panel { margin-top:12px; padding:24px; border:1px solid #334155; }'
        ),
        js: lines(
          'const tabButtons = document.querySelectorAll(".tab-btn");',
          'const tabPanels = document.querySelectorAll(".tab-panel");',
          '',
          '// Connect each button to its panel'
        )
      }
    },
    {
      id: 'modal',
      title: L('Modal dialog', 'Модальное окно'),
      level: L('Events and accessibility', 'События и доступность'),
      section: 'js',
      description: L('Open and close a dialog with controls and the Escape key.', 'Открывай и закрывай диалог кнопками и клавишей Escape.'),
      requirements: [
        L('The open control makes the dialog visible.', 'Кнопка открытия делает диалог видимым.'),
        L('The close control hides it again.', 'Кнопка закрытия снова скрывает окно.'),
        L('Escape closes an opened dialog.', 'Escape закрывает открытое окно.')
      ],
      hints: [
        L('Use one class or the hidden property as the single source of visibility.', 'Используй один класс или свойство hidden как единый источник видимости.'),
        L('Create openModal and closeModal functions before adding listeners.', 'Сначала создай функции openModal и closeModal, потом подключи обработчики.'),
        L('Listen for keydown on document and compare event.key strictly with Escape.', 'Слушай keydown у document и строго сравни event.key со строкой Escape.')
      ],
      starter: {
        html: lines(
          '<button class="open-modal" type="button">Open dialog</button>',
          '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>',
          '  <div class="modal-card">',
          '    <h1 id="modal-title">Project saved</h1>',
          '    <p>Your local version is ready.</p>',
          '    <button class="close-modal" type="button">Close</button>',
          '  </div>',
          '</div>'
        ),
        css: lines(
          'body { min-height:100vh; margin:0; display:grid; place-items:center; background:#101522; color:#f8fafc; font-family:system-ui,sans-serif; }',
          'button { padding:10px 16px; }',
          '.modal { position:fixed; inset:0; display:grid; place-items:center; background:rgba(0,0,0,.7); }',
          '.modal[hidden] { display:none; }',
          '.modal-card { width:min(360px,86vw); padding:24px; background:#192133; }'
        ),
        js: lines(
          'const openButton = document.querySelector(".open-modal");',
          'const closeButton = document.querySelector(".close-modal");',
          'const modal = document.querySelector(".modal");',
          '',
          '// Add open, close and Escape behavior'
        )
      }
    },
    {
      id: 'search',
      title: L('Live list search', 'Живой поиск по списку'),
      level: L('Input and arrays', 'Input и массивы'),
      section: 'js',
      description: L('Filter visible items while the user types and handle an empty result.', 'Фильтруй видимые элементы во время ввода и обрабатывай пустой результат.'),
      requirements: [
        L('The page contains a search field and searchable items.', 'На странице есть поле поиска и элементы для фильтрации.'),
        L('Typing leaves only matching items visible.', 'После ввода видны только совпадающие элементы.'),
        L('A clear empty state appears when nothing matches.', 'Если совпадений нет, появляется понятное пустое состояние.')
      ],
      hints: [
        L('Listen to input and normalize the query with trim and toLowerCase.', 'Слушай input и нормализуй запрос через trim и toLowerCase.'),
        L('For each item, compare its textContent with the normalized query.', 'Для каждого элемента сравни textContent с нормализованным запросом.'),
        L('Count visible matches and show the empty state only when the count is zero.', 'Считай видимые совпадения и показывай пустое состояние только при нуле.')
      ],
      starter: {
        html: lines(
          '<main class="search-box">',
          '  <input class="search-input" type="search" placeholder="Search topics">',
          '  <ul class="search-list">',
          '    <li class="search-item">HTML forms</li>',
          '    <li class="search-item">CSS Grid</li>',
          '    <li class="search-item">JavaScript interface</li>',
          '  </ul>',
          '  <p class="empty-state" hidden>Nothing found</p>',
          '</main>'
        ),
        css: lines(
          'body { min-height:100vh; margin:0; display:grid; place-items:center; background:#0b1020; color:#f8fafc; font-family:system-ui,sans-serif; }',
          '.search-box { width:min(420px,90vw); }',
          '.search-input { width:100%; padding:11px; }',
          '.search-list { display:grid; gap:8px; padding:0; list-style:none; }',
          '.search-item { padding:12px; background:#172033; }',
          '.empty-state { color:#fda4af; }'
        ),
        js: lines(
          'const searchInput = document.querySelector(".search-input");',
          'const searchItems = document.querySelectorAll(".search-item");',
          'const emptyState = document.querySelector(".empty-state");',
          '',
          '// Filter items inside the input event'
        )
      }
    },
    {
      id: 'calculator',
      title: L('Order calculator', 'Калькулятор заказа'),
      level: L('Numbers and validation', 'Числа и проверка'),
      section: 'js',
      description: L('Calculate a total from price and quantity without accepting invalid values.', 'Рассчитывай сумму из цены и количества, не принимая некорректные значения.'),
      requirements: [
        L('Price, quantity and a visible result are present.', 'Есть цена, количество и видимый результат.'),
        L('A valid calculation shows price multiplied by quantity.', 'Нормальный расчет показывает цену, умноженную на количество.'),
        L('Invalid or negative input shows an error instead of a fake total.', 'Некорректный или отрицательный ввод показывает ошибку, а не ложную сумму.')
      ],
      hints: [
        L('Read input.value and convert both values with Number.', 'Прочитай input.value и преобразуй оба значения через Number.'),
        L('Validate Number.isFinite and values greater than zero before multiplying.', 'До умножения проверь Number.isFinite и значения больше нуля.'),
        L('Use one render branch for the total and another for the error message.', 'Используй одну ветку вывода для суммы и другую для сообщения об ошибке.')
      ],
      starter: {
        html: lines(
          '<main class="calculator">',
          '  <label>Price <input class="price" type="number" min="0"></label>',
          '  <label>Quantity <input class="quantity" type="number" min="1"></label>',
          '  <button class="calculate" type="button">Calculate</button>',
          '  <output class="total">0</output>',
          '  <p class="error" aria-live="polite"></p>',
          '</main>'
        ),
        css: lines(
          'body { min-height:100vh; margin:0; display:grid; place-items:center; background:#101522; color:#f8fafc; font-family:system-ui,sans-serif; }',
          '.calculator { display:grid; gap:12px; width:min(320px,88vw); }',
          'label { display:grid; gap:5px; }',
          'input, button { padding:10px; }',
          '.total { font-size:32px; font-weight:700; }',
          '.error { min-height:20px; color:#fb7185; }'
        ),
        js: lines(
          'const price = document.querySelector(".price");',
          'const quantity = document.querySelector(".quantity");',
          'const calculate = document.querySelector(".calculate");',
          'const total = document.querySelector(".total");',
          'const error = document.querySelector(".error");',
          '',
          '// Validate the values and render the total'
        )
      }
    }
  ];

  const feedbackGuides = {
    counter: [
      { file:'HTML', concept:L('Interface selectors', 'Селекторы интерфейса'), check:L('Check that the counter and all three controls use the classes expected by your JavaScript.', 'Проверь, что у числа и трёх кнопок есть классы, которые ищет JavaScript.') },
      { file:'JavaScript', concept:L('Single state and render function', 'Одно состояние и функция обновления'), check:L('Follow the value from the plus click to the variable, then from the variable to textContent.', 'Проследи путь: клик по плюсу → изменение переменной → вывод переменной через textContent.') },
      { file:'JavaScript', concept:L('Guard condition', 'Защитное условие'), check:L('Look at the minus handler and decide under which condition decrementing is allowed.', 'Посмотри на обработчик минуса и определи, при каком условии уменьшение вообще разрешено.') }
    ],
    form: [
      { file:'JavaScript', concept:L('submit and preventDefault', 'submit и preventDefault'), check:L('The listener belongs to the form. Confirm that the submit event is cancelled before validation.', 'Обработчик должен быть у формы. Проверь, что submit отменяется до проверки значения.') },
      { file:'HTML + JavaScript', concept:L('Accessible error output', 'Доступный вывод ошибки'), check:L('Find the error element and make sure the empty branch writes a visible message into it.', 'Найди элемент ошибки и убедись, что ветка пустого поля записывает в него видимый текст.') },
      { file:'JavaScript', concept:L('Successful branch', 'Ветка успешной отправки'), check:L('Trace the non-empty branch and check when input.value becomes an empty string.', 'Проследи непустую ветку и проверь, в какой момент input.value становится пустой строкой.') }
    ],
    theme: [
      { file:'CSS + JavaScript', concept:L('classList and matching selector', 'classList и совпадающий селектор'), check:L('The class toggled in JavaScript must match the theme selector in CSS exactly.', 'Класс из JavaScript должен полностью совпадать с селектором темы в CSS.') },
      { file:'JavaScript', concept:L('Two-state switch', 'Переключение двух состояний'), check:L('Trace how one click enables a theme and the next click returns the original state.', 'Проследи, как первый клик включает тему, а следующий возвращает исходное состояние.') },
      { file:'HTML + JavaScript', concept:L('Clear control label', 'Понятная подпись'), check:L('The theme control should have visible text or an aria-label that explains its action.', 'У переключателя должен быть видимый текст или aria-label, объясняющий действие.') }
    ],
    todo: [
      { file:'JavaScript', concept:L('trim and early validation', 'trim и ранняя проверка'), check:L('Check the trimmed value before createElement or append can run.', 'Проверь очищенное через trim значение до вызова createElement или append.') },
      { file:'JavaScript', concept:L('createElement and append', 'createElement и append'), check:L('Follow one valid submit: create an li, fill it, then append it to the list.', 'Проследи одну нормальную отправку: создай li, заполни его и только затем добавь в список.') },
      { file:'JavaScript', concept:L('Event handler for each item', 'Обработчик для каждого элемента'), check:L('The remove button needs access to the li that owns it. Inspect where its click listener is created.', 'Кнопке удаления нужен доступ к своему li. Проверь, где создаётся её обработчик click.') }
    ],
    tabs: [
      { file:'HTML', concept:'data-tab-target', check:L('Every control needs a target id that exactly matches one panel id.', 'У каждой кнопки должен быть id цели, который полностью совпадает с id панели.') },
      { file:'JavaScript', concept:'click and dataset', check:L('Follow the clicked button from currentTarget.dataset to document.getElementById.', 'Проследи путь от currentTarget.dataset нажатой кнопки до document.getElementById.') },
      { file:'JavaScript', concept:L('Single active state', 'Одно активное состояние'), check:L('Remove or hide the previous state before revealing the selected panel.', 'Сначала убери или скрой прошлое состояние, затем покажи выбранную панель.') }
    ],
    modal: [
      { file:'JavaScript', concept:L('Open function', 'Функция открытия'), check:L('The open handler must change the same hidden/class state that CSS uses.', 'Обработчик открытия должен менять то же hidden/состояние класса, которое использует CSS.') },
      { file:'JavaScript', concept:L('Close function', 'Функция закрытия'), check:L('Reuse one close function instead of duplicating visibility logic.', 'Переиспользуй одну функцию закрытия, не дублируй логику видимости.') },
      { file:'JavaScript', concept:'keydown + Escape', check:L('Listen on document and compare event.key with the exact string Escape.', 'Слушай document и сравни event.key с точной строкой Escape.') }
    ],
    search: [
      { file:'HTML', concept:L('Searchable structure', 'Структура поиска'), check:L('Confirm the input, item collection and empty-state element use the selectors from JavaScript.', 'Проверь, что поле, элементы и пустое состояние имеют селекторы, которые ищет JavaScript.') },
      { file:'JavaScript', concept:'input + includes', check:L('Normalize both the query and item text before includes.', 'Нормализуй и запрос, и текст элемента до includes.') },
      { file:'JavaScript', concept:L('Visible match count', 'Количество совпадений'), check:L('Count matches during the same loop and update the empty state after it.', 'Считай совпадения в том же цикле и обновляй пустое состояние после него.') }
    ],
    calculator: [
      { file:'HTML', concept:L('Inputs and output', 'Поля и результат'), check:L('Price, quantity and total must match the selectors used by the script.', 'Цена, количество и итог должны совпадать с селекторами скрипта.') },
      { file:'JavaScript', concept:'Number + multiplication', check:L('Convert both strings to numbers before multiplying and write the numeric result to the output.', 'Преобразуй обе строки в числа до умножения и запиши числовой результат в output.') },
      { file:'JavaScript', concept:'Number.isFinite', check:L('Reject non-finite and non-positive values before the total branch runs.', 'Отклони нечисловые и неположительные значения до ветки вывода суммы.') }
    ]
  };

  function feedbackFor(project, index) {
    return feedbackGuides[project.id]?.[index] || {
      file:L('Relevant editor tab', 'Подходящая вкладка редактора'),
      concept:L('Data flow', 'Поток данных'),
      check:L('Trace the input, action and visible result one step at a time.', 'Проследи входные данные, действие и видимый результат по одному шагу.')
    };
  }

  let api = null;
  let page = null;
  let activeMode = 'projects';
  let activeLanguage = 'html';
  let saveTimer = null;
  let storageBridgeReady = false;
  let forgeState = readJson(STORE_KEY, { activeProject: 'counter', workspaces: {} });

  const icon = runtime?.icon || ((name, size) =>
    '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>');

  const esc = runtime?.escapeHtml || (value =>
    String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]));

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function projectById(id) {
    return projects.find(project => project.id === id) || projects[0];
  }

  function workspace(id) {
    const project = projectById(id);
    if (!forgeState.workspaces[id]) {
      forgeState.workspaces[id] = {
        html: project.starter.html,
        css: project.starter.css,
        js: project.starter.js,
        hintLevel: 0,
        history: [],
        results: [],
        updatedAt: Date.now()
      };
      saveForge();
    }
    const current = forgeState.workspaces[id];
    if (id === 'counter' && typeof current.js === 'string') {
      const correctedLine = L('// Continue independently', '// \u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438 \u0441\u0430\u043c\u043e\u0441\u0442\u043e\u044f\u0442\u0435\u043b\u044c\u043d\u043e');
      const migrated = current.js.split('\n').map(line => (
        /(?:Continue independently|\u041f\u0440\u043e\u0434\u043e\u043b\u0436[^\n]*\u0441\u0430\u043c\u043e\u0441\u0442\u043e\u044f\u0442\u0435\u043b\u044c\u043d\u043e)/i.test(line)
          ? correctedLine
          : line
      )).join('\n');
      if (migrated !== current.js) {
        current.js = migrated;
        current.updatedAt = Date.now();
        saveForge();
      }
    }
    return current;
  }

  function saveForge() {
    writeJson(STORE_KEY, forgeState);
  }

  function scriptJson(value) {
    return JSON.stringify(String(value == null ? '' : value)).replace(/</g, '\\u003c');
  }

  function previewStorage(projectId) {
    const all = readJson(PREVIEW_STORAGE_KEY, {});
    return all[projectId] && typeof all[projectId] === 'object' ? all[projectId] : {};
  }

  function buildStorageShim(projectId) {
    const seed = JSON.stringify(previewStorage(projectId)).replace(/</g, '\\u003c');
    return lines(
      '<script>',
      '(function(){',
      '  const values = new Map(Object.entries(' + seed + '));',
      '  const notify = (action, key, value) => parent.postMessage({type:"wdg-forge-storage",projectId:' + scriptJson(projectId) + ',action,key,value},"*");',
      '  const storage = {',
      '    get length(){ return values.size; },',
      '    key(index){ return Array.from(values.keys())[Number(index)] ?? null; },',
      '    getItem(key){ key=String(key); return values.has(key) ? values.get(key) : null; },',
      '    setItem(key,value){ key=String(key); value=String(value); values.set(key,value); notify("set",key,value); },',
      '    removeItem(key){ key=String(key); values.delete(key); notify("remove",key); },',
      '    clear(){ values.clear(); notify("clear"); }',
      '  };',
      '  window.__wdgLocalStorage = storage;',
      '})();',
      '<\/script>'
    );
  }

  function handleStorageMessage(event) {
    const data = event.data || {};
    if (data.type !== 'wdg-forge-storage') return;
    const frame = page?.querySelector('[data-forge-frame]');
    if (!frame || event.source !== frame.contentWindow) return;
    const projectId = String(data.projectId || '');
    if (!projects.some(project => project.id === projectId)) return;
    const all = readJson(PREVIEW_STORAGE_KEY, {});
    const store = all[projectId] && typeof all[projectId] === 'object' ? all[projectId] : {};
    if (data.action === 'set') store[String(data.key).slice(0, 200)] = String(data.value).slice(0, 100000);
    else if (data.action === 'remove') delete store[String(data.key).slice(0, 200)];
    else if (data.action === 'clear') Object.keys(store).forEach(key => delete store[key]);
    all[projectId] = store;
    writeJson(PREVIEW_STORAGE_KEY, all);
  }

  function forgePage() {
    const toolbar = '<nav class="wdgforge-modebar" aria-label="Forge">' +
      modeButton('projects', 'tabler:code-dots', copy.projects) +
      modeButton('git', 'tabler:brand-git', copy.git) +
      '</nav><div class="wdgforge-view" id="wdgforgeView"></div>';
    page = api.pageShell('forge', copy.title, copy.subtitle, '<div class="wdgforge-shell">' + toolbar + '</div>');
    page.querySelectorAll('[data-forge-mode]').forEach(button => button.addEventListener('click', () => {
      activeMode = button.dataset.forgeMode;
      page.querySelectorAll('[data-forge-mode]').forEach(item => item.classList.toggle('active', item === button));
      renderMode();
    }));
    renderMode();
    return page;
  }

  function modeButton(id, iconName, label) {
    return '<button class="wdgforge-mode ' + (activeMode === id ? 'active' : '') + '" type="button" data-forge-mode="' + id + '">' + icon(iconName, 17) + '<span>' + esc(label) + '</span></button>';
  }

  function renderMode() {
    if (!page) return;
    if (activeMode === 'git') renderGit();
    else renderForge();
  }

  function renderForge() {
    const target = page.querySelector('#wdgforgeView');
    const project = projectById(forgeState.activeProject);
    const work = workspace(project.id);
    const passed = work.results.filter(Boolean).length;
    const completed = work.results.length === project.requirements.length && passed === project.requirements.length;
    target.innerHTML =
      '<div class="wdgforge-projectbar"><label><span>' + copy.choose + '</span><select class="wdgforge-select" data-project-select>' +
      projects.map(item => '<option value="' + item.id + '" ' + (item.id === project.id ? 'selected' : '') + '>' + esc(item.title) + '</option>').join('') +
      '</select></label><div class="wdgforge-status ' + (completed ? 'complete' : '') + '">' + icon(completed ? 'tabler:circle-check-filled' : 'tabler:progress', 16) +
      '<span>' + (completed ? copy.complete : passed + ' / ' + project.requirements.length) + '</span></div></div>' +
      '<div class="wdgforge-workspace">' +
        '<aside class="wdgforge-brief">' +
          '<span class="wdgforge-chip">' + esc(project.level) + '</span><h2>' + esc(project.title) + '</h2><p>' + esc(project.description) + '</p>' +
          '<h3>' + copy.requirements + '</h3><ol class="wdgforge-requirements">' + project.requirements.map((item, index) =>
            '<li class="' + (work.results[index] ? 'passed' : '') + '">' + icon(work.results[index] ? 'tabler:circle-check-filled' : 'tabler:circle', 15) + '<span>' + esc(item) + '</span></li>'
          ).join('') + '</ol>' +
          '<div class="wdgforge-hints"><div class="wdgforge-hint-copy">' + (work.hintLevel ? project.hints.slice(0, work.hintLevel).map((hint,index) =>
            '<div><b>' + (index + 1) + '</b><span><small>' + esc(hintStages[index] || hintStages.at(-1)) + '</small>' + esc(hint) + '</span></div>').join('') : '<p>' + copy.noSolution + '</p>') + '</div>' +
          '<button class="wdgf-btn" type="button" data-forge-hint ' + (work.hintLevel >= project.hints.length ? 'disabled' : '') + '>' + icon('tabler:bulb', 15) + ' ' + copy.hint + '</button></div>' +
        '</aside>' +
        '<main class="wdgforge-studio">' +
          '<div class="wdgforge-toolbar"><div class="wdgforge-code-tabs">' +
            ['html','css','js'].map(lang => '<button type="button" class="' + (lang === activeLanguage ? 'active' : '') + '" data-code-lang="' + lang + '">' + lang.toUpperCase() + '</button>').join('') +
          '</div><div class="wdgforge-actions">' +
            '<span class="wdgforge-save">' + icon('tabler:cloud-check', 14) + ' ' + copy.saved + '</span>' +
            '<button class="wdgf-btn" type="button" data-forge-history>' + icon('tabler:history', 15) + ' ' + copy.history + '</button>' +
            '<button class="wdgf-btn" type="button" data-forge-snapshot>' + icon('tabler:device-floppy', 15) + ' ' + copy.snapshot + '</button>' +
            '<button class="wdgf-btn" type="button" data-forge-export>' + icon('tabler:folder-down', 15) + ' ' + copy.export + '</button>' +
            '<button class="wdgf-btn primary" type="button" data-forge-test>' + icon('tabler:checks', 15) + ' ' + copy.test + '</button>' +
          '</div></div>' +
          '<div class="wdgforge-stage"><section class="wdgforge-editor"><header><h3>' + copy.editor + '</h3><button class="wdgforge-icon" type="button" data-forge-reset title="' + copy.reset + '">' + icon('tabler:restore', 17) + '</button></header>' +
            '<textarea spellcheck="false" aria-label="' + copy.editor + '" data-code-editor></textarea></section>' +
            '<section class="wdgforge-preview"><header><h3>' + copy.preview + '</h3><button class="wdgf-btn" type="button" data-forge-run>' + icon('tabler:player-play-filled', 14) + ' ' + copy.run + '</button></header>' +
            '<iframe title="' + copy.preview + '" sandbox="allow-scripts allow-forms allow-modals" data-forge-frame></iframe></section></div>' +
          '<section class="wdgforge-results" data-forge-results></section>' +
        '</main>' +
      '</div>' +
      '<aside class="wdgforge-history" data-forge-history-panel hidden><header><h2>' + copy.history + '</h2><button class="wdgforge-icon" data-history-close>' + icon('tabler:x',18) + '</button></header><div data-history-list></div></aside>';

    bindForge(project, work);
  }

  function bindForge(project, work) {
    const editor = page.querySelector('[data-code-editor]');
    editor.value = work[activeLanguage];
    page.querySelector('[data-project-select]').addEventListener('change', event => {
      forgeState.activeProject = event.target.value;
      activeLanguage = 'html';
      saveForge();
      renderForge();
    });
    page.querySelectorAll('[data-code-lang]').forEach(button => button.addEventListener('click', () => {
      storeEditorValue(work, editor);
      activeLanguage = button.dataset.codeLang;
      page.querySelectorAll('[data-code-lang]').forEach(item => item.classList.toggle('active', item === button));
      editor.value = work[activeLanguage];
      editor.focus();
    }));
    editor.addEventListener('input', () => {
      storeEditorValue(work, editor);
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => runPreview(), 500);
    });
    page.querySelector('[data-forge-run]').addEventListener('click', runPreview);
    page.querySelector('[data-forge-test]').addEventListener('click', () => runTests(project, work));
    page.querySelector('[data-forge-snapshot]').addEventListener('click', () => createSnapshot(project, work));
    page.querySelector('[data-forge-export]').addEventListener('click', event => exportProject(project, work, event.currentTarget));
    page.querySelector('[data-forge-history]').addEventListener('click', () => openHistory(project, work));
    page.querySelector('[data-history-close]').addEventListener('click', closeHistory);
    page.querySelector('[data-forge-hint]').addEventListener('click', () => {
      work.hintLevel = Math.min(project.hints.length, Number(work.hintLevel || 0) + 1);
      saveForge();
      renderForge();
    });
    page.querySelector('[data-forge-reset]').addEventListener('click', () => {
      if (!confirm(L('Reset this project to its starter code?', 'Вернуть начальный код этого проекта?'))) return;
      work.html = project.starter.html;
      work.css = project.starter.css;
      work.js = project.starter.js;
      work.results = [];
      work.hintLevel = 0;
      work.updatedAt = Date.now();
      saveForge();
      renderForge();
    });
    paintResults(project, work);
    page.querySelectorAll('[data-forge-jump]').forEach(button => button.addEventListener('click', () => {
      jumpToIssue(button.dataset.forgeJump, Number(button.dataset.forgeLine));
    }));
    runPreview();
  }

  function storeEditorValue(work, editor) {
    work[activeLanguage] = editor.value;
    work.updatedAt = Date.now();
    saveForge();
  }

  function composeDocument(work, projectId, token) {
    const storageShim = buildStorageShim(projectId);
    const consoleBridge = lines(
      '<script>',
      '(function(){',
      '  const stringify = value => { try { return typeof value === "string" ? value : JSON.stringify(value); } catch (_) { return String(value); } };',
      '  const send = (level, values) => parent.postMessage({channel:"wdg-forge-console",level,text:values.map(stringify).join(" ")},"*");',
      '  ["log","warn","error"].forEach(level => { const original=console[level]; console[level]=(...values)=>{send(level,values);original.apply(console,values);}; });',
      '  addEventListener("error", event => send("error",[event.message]));',
      '})();',
      '<\/script>'
    );
    const harness = lines(
      '<script>',
      '(function(){',
      '  const localStorage = window.__wdgLocalStorage;',
      '  const userSource = ' + scriptJson(work.js) + ';',
      '  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));',
      '  addEventListener("message", async event => {',
      '    const data = event.data || {};',
      '    if (data.type !== "wdg-forge-test" || data.token !== "' + token + '") return;',
      '    const results = [];',
      '    const textNumber = el => Number(String(el && el.textContent || "").trim());',
      '    try {',
      '      if ("' + projectId + '" === "counter") {',
      '        const count = document.querySelector(".count,[data-count]");',
      '        const plus = document.querySelector(".plus,[data-plus]");',
      '        const minus = document.querySelector(".minus,[data-minus]");',
      '        const reset = document.querySelector(".reset,[data-reset]");',
      '        results.push(Boolean(count && plus && minus && reset));',
      '        if (count && plus && reset) { const before=textNumber(count); plus.click(); await wait(20); const after=textNumber(count); reset.click(); await wait(20); results.push(after === before + 1 && textNumber(count) === 0); } else results.push(false);',
      '        if (count && minus && reset) { reset.click(); minus.click(); await wait(20); results.push(textNumber(count) >= 0); } else results.push(false);',
      '      }',
      '      if ("' + projectId + '" === "form") {',
      '        const form=document.querySelector("form"); const input=form && form.querySelector("input"); const error=document.querySelector(".error,[data-error],[role=alert]");',
      '        if (form && input) { input.value=""; const emptyEvent=new Event("submit",{bubbles:true,cancelable:true}); const allowed=form.dispatchEvent(emptyEvent); await wait(20); results.push(!allowed || emptyEvent.defaultPrevented); } else results.push(false);',
      '        results.push(Boolean(error && String(error.textContent || "").trim()));',
      '        if (form && input) { input.value="Victor"; const validEvent=new Event("submit",{bubbles:true,cancelable:true}); form.dispatchEvent(validEvent); await wait(20); results.push(input.value === ""); } else results.push(false);',
      '      }',
      '      if ("' + projectId + '" === "theme") {',
      '        const button=document.querySelector(".theme-btn,[data-theme-toggle]"); const body=document.body; const before=body.className+"|"+getComputedStyle(body).backgroundColor;',
      '        if (button) { button.click(); await wait(30); const changed=body.className+"|"+getComputedStyle(body).backgroundColor; results.push(before !== changed); button.click(); await wait(30); results.push(before === body.className+"|"+getComputedStyle(body).backgroundColor); } else results.push(false,false);',
      '        results.push(Boolean(button && (String(button.textContent || "").trim() || button.getAttribute("aria-label"))));',
      '      }',

      '      if ("' + projectId + '" === "tabs") {',
      '        const buttons=Array.from(document.querySelectorAll(".tab-btn,[data-tab-target]")); const panels=Array.from(document.querySelectorAll(".tab-panel,[data-tab-panel]"));',
      '        results.push(buttons.length>=2 && panels.length>=2);',
      '        if(buttons[1]){buttons[1].click();await wait(30);const targetId=buttons[1].dataset.tabTarget;const target=document.getElementById(targetId)||panels[1];results.push(Boolean(target && !target.hidden && getComputedStyle(target).display!=="none"));}else results.push(false);',
      '        const visible=panels.filter(panel=>!panel.hidden && getComputedStyle(panel).display!=="none"); results.push(visible.length===1);',
      '      }',
      '      if ("' + projectId + '" === "modal") {',
      '        const open=document.querySelector(".open-modal,[data-modal-open]"); const modal=document.querySelector(".modal,[role=dialog]"); const close=document.querySelector(".close-modal,[data-modal-close]"); const visible=()=>modal&&!modal.hidden&&getComputedStyle(modal).display!=="none";',
      '        if(open&&modal){open.click();await wait(20);results.push(visible());}else results.push(false);',
      '        if(close&&modal){close.click();await wait(20);results.push(!visible());}else results.push(false);',
      '        if(open&&modal){open.click();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));await wait(20);results.push(!visible());}else results.push(false);',
      '      }',
      '      if ("' + projectId + '" === "search") {',
      '        const input=document.querySelector(".search-input,input[type=search]"); const items=Array.from(document.querySelectorAll(".search-item,[data-search-item]")); const empty=document.querySelector(".empty-state,[data-empty]"); results.push(Boolean(input&&items.length));',
      '        if(input&&items.length){input.value="css";input.dispatchEvent(new Event("input",{bubbles:true}));await wait(20);const visible=items.filter(item=>!item.hidden&&getComputedStyle(item).display!=="none");results.push(visible.length>0&&visible.every(item=>item.textContent.toLowerCase().includes("css")));input.value="zzzz-not-found";input.dispatchEvent(new Event("input",{bubbles:true}));await wait(20);const none=items.every(item=>item.hidden||getComputedStyle(item).display==="none");results.push(Boolean(none&&empty&&!empty.hidden&&getComputedStyle(empty).display!=="none"));}else results.push(false,false);',
      '      }',
      '      if ("' + projectId + '" === "calculator") {',
      '        const price=document.querySelector(".price,[data-price]");const quantity=document.querySelector(".quantity,[data-quantity]");const button=document.querySelector(".calculate,[data-calculate]");const total=document.querySelector(".total,[data-total]");const error=document.querySelector(".error,[data-error],[role=alert]");results.push(Boolean(price&&quantity&&button&&total));',
      '        if(price&&quantity&&button&&total){price.value="120";quantity.value="3";button.click();await wait(20);results.push(Number(String(total.textContent).replace(/[^0-9.-]/g,""))===360);price.value="-1";quantity.value="2";button.click();await wait(20);results.push(Boolean(error&&String(error.textContent||"").trim()));}else results.push(false,false);',
      '      }',
      '      if ("' + projectId + '" === "todo") {' ,
      '        const form=document.querySelector("form"); const input=form && form.querySelector("input"); const list=document.querySelector("ul,.todo-list,[data-task-list]");',
      '        if (form && input && list) { const before=list.children.length; input.value=""; form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true})); await wait(20); results.push(list.children.length === before); input.value="Learn JavaScript"; form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true})); await wait(20); results.push(list.children.length === before + 1); const remove=list.querySelector(".delete,.remove,[data-delete],li button"); if(remove){remove.click();await wait(20);results.push(list.children.length===before);}else results.push(false); } else results.push(false,false,false);',
      '      }',
      '    } catch (error) { while (results.length < 3) results.push(false); }',
      '    parent.postMessage({type:"wdg-forge-results",token:data.token,results},"*");',
      '  });',
      '})();',
      '<\/script>'
    );
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' +
      work.css + '</style></head><body>' + work.html + storageShim + consoleBridge + '<script>(function(localStorage){' + work.js + '\n})(window.__wdgLocalStorage);<\/script>' + harness + '</body></html>';
  }

  function runPreview(token) {
    const frame = page?.querySelector('[data-forge-frame]');
    if (!frame) return Promise.resolve();
    const project = projectById(forgeState.activeProject);
    const work = workspace(project.id);
    const editor = page.querySelector('[data-code-editor]');
    if (editor) storeEditorValue(work, editor);
    return new Promise(resolve => {
      const done = () => resolve(frame);
      frame.addEventListener('load', done, { once:true });
      frame.srcdoc = composeDocument(work, project.id, token || '');
      setTimeout(done, 700);
    });
  }

  async function runTests(project, work) {
    const button = page.querySelector('[data-forge-test]');
    clearTimeout(saveTimer);
    saveTimer = null;
    button.disabled = true;
    button.innerHTML = icon('tabler:loader-2',15) + ' ' + L('Checking...', 'Проверяю...');
    const token = 'forge-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    const frame = await runPreview(token);
    const results = await new Promise(resolve => {
      const timeout = setTimeout(() => { window.removeEventListener('message', receive); resolve(project.requirements.map(() => false)); }, 1800);
      function receive(event) {
        if (event.source !== frame.contentWindow || event.data?.type !== 'wdg-forge-results' || event.data?.token !== token) return;
        clearTimeout(timeout);
        window.removeEventListener('message', receive);
        resolve(event.data.results);
      }
      window.addEventListener('message', receive);
      frame.contentWindow.postMessage({ type:'wdg-forge-test', token }, '*');
    });
    work.results = project.requirements.map((item,index) => Boolean(results[index]));
    work.updatedAt = Date.now();
    const allPassed = work.results.every(Boolean);
    work.completedAt = allPassed ? Date.now() : 0;
    saveForge();
    work.results.forEach((success,index) => api.recordWeakPoint?.({
      id:'forge-' + project.id + '-' + index,
      section:project.section,
      title:project.requirements[index],
      source:'forge',
      success
    }));
    api.logActivity?.(allPassed ? 4 : 1);
    if (allPassed) document.dispatchEvent(new CustomEvent('webdevgym:forge-complete', { detail:{
      projectId:project.id, title:project.title, section:project.section,
      completedAt:work.completedAt
    }}));
    renderForge();
  }

  function paintResults(project, work) {
    const target = page.querySelector('[data-forge-results]');
    if (!target) return;
    if (!work.results.length) {
      target.innerHTML = '<div class="wdgforge-empty">' + icon('tabler:test-pipe',18) + '<span>' + L('Run the checks when your first version is ready.', 'Запусти проверку, когда будет готова первая версия.') + '</span></div>';
      return;
    }
    target.innerHTML = work.results.map((success,index) => {
      const guide = feedbackFor(project, index);
      const location = issueLocation(work, guide);
      return '<div class="' + (success ? 'passed' : 'failed') + '">' +
        icon(success ? 'tabler:circle-check-filled' : 'tabler:alert-circle',16) +
        '<span class="wdgforge-result-copy"><strong>' + esc(project.requirements[index]) + '</strong>' + (success ? '' :
          '<small><button type="button" data-forge-jump="' + location.language + '" data-forge-line="' + location.line + '">' + icon('tabler:file-code',13) + ' ' + location.language.toUpperCase() + ' · ' + copy.line + ' ' + location.line + '</button><i>' + icon('tabler:brain',13) + ' ' + esc(guide.concept) + '</i></small><em>' + esc(guide.check) + '</em>') +
        '</span><b>' + (success ? copy.passed : copy.failed) + '</b></div>';
    }).join('');
  }


  function exportIndex(work) {
    return lines(
      '<!doctype html>',
      '<html lang="' + (isEnglish ? 'en' : 'ru') + '">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>Forge project</title>',
      '  <link rel="stylesheet" href="css/style.css">',
      '</head>',
      '<body>',
      work.html,
      '  <script src="js/script.js" defer><\/script>',
      '</body>',
      '</html>'
    );
  }

  async function writeFile(directory, name, content) {
    const handle = await directory.getFileHandle(name, { create:true });
    const stream = await handle.createWritable();
    await stream.write(content);
    await stream.close();
  }

  function downloadSource(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportProject(project, work, button) {
    const editor = page.querySelector('[data-code-editor]');
    if (editor) storeEditorValue(work, editor);
    const original = button.innerHTML;
    try {
      if (typeof window.showDirectoryPicker === 'function') {
        const root = await window.showDirectoryPicker({ mode:'readwrite', id:'webdevgym-forge-export' });
        const cssDirectory = await root.getDirectoryHandle('css', { create:true });
        const jsDirectory = await root.getDirectoryHandle('js', { create:true });
        await Promise.all([
          writeFile(root, 'index.html', exportIndex(work)),
          writeFile(cssDirectory, 'style.css', work.css),
          writeFile(jsDirectory, 'script.js', work.js)
        ]);
      } else {
        downloadSource('index.html', exportIndex(work), 'text/html');
        downloadSource('style.css', work.css, 'text/css');
        downloadSource('script.js', work.js, 'text/javascript');
        alert(copy.exportFallback);
      }
      button.innerHTML = icon('tabler:circle-check',15) + ' ' + copy.exported;
      setTimeout(() => { if (button.isConnected) button.innerHTML = original; }, 1400);
    } catch (error) {
      if (error?.name !== 'AbortError') console.error('Forge export failed', error);
    }
  }

  function issueLocation(work, guide) {
    const clue = (guide.concept + ' ' + guide.check).toLowerCase();
    let language = /css/.test(String(guide.file).toLowerCase()) && !/javascript/.test(String(guide.file).toLowerCase()) ? 'css' : /html/.test(String(guide.file).toLowerCase()) && !/javascript/.test(String(guide.file).toLowerCase()) ? 'html' : 'js';
    const patterns = [
      [/localstorage/, /localStorage/], [/classlist/, /classList/], [/submit|preventdefault/, /submit|preventDefault/], [/createelement|append/, /createElement|append/], [/trim/, /trim/], [/dataset|data-tab/, /dataset|data-tab/], [/keydown|escape/, /keydown|Escape/], [/number/, /Number/], [/queryselector|selector/, /querySelector/], [/input/, /addEventListener\s*\(\s*["']input/]
    ];
    const pattern = patterns.find(item => item[0].test(clue))?.[1];
    const linesOfCode = String(work[language] || '').split('\n');
    let index = pattern ? linesOfCode.findIndex(line => pattern.test(line)) : -1;
    if (index < 0) index = linesOfCode.findIndex(line => line.trim() && !line.trim().startsWith('//'));
    return { language, line:Math.max(1,index + 1) };
  }

  function jumpToIssue(language, line) {
    activeLanguage = language;
    renderForge();
    setTimeout(() => {
      const editor = page?.querySelector('[data-code-editor]');
      if (!editor) return;
      const rows = editor.value.split('\n');
      const start = rows.slice(0,Math.max(0,line - 1)).reduce((sum,row) => sum + row.length + 1,0);
      const end = start + (rows[line - 1]?.length || 0);
      editor.focus();
      editor.setSelectionRange(start,end);
      editor.scrollTop = Math.max(0,(line - 4) * 19);
    },40);
  }

  function createSnapshot(project, work) {
    const editor = page.querySelector('[data-code-editor]');
    if (editor) storeEditorValue(work, editor);
    work.history = Array.isArray(work.history) ? work.history : [];
    work.history.unshift({
      id:'snapshot-' + Date.now(),
      at:Date.now(),
      html:work.html,
      css:work.css,
      js:work.js,
      label:L('Checkpoint', 'Версия') + ' ' + (work.history.length + 1)
    });
    work.history = work.history.slice(0, MAX_HISTORY);
    saveForge();
    openHistory(project, work);
  }

  function openHistory(project, work) {
    const panel = page.querySelector('[data-forge-history-panel]');
    panel.hidden = false;
    renderHistory(project, work);
  }

  function closeHistory() {
    const panel = page.querySelector('[data-forge-history-panel]');
    if (panel) panel.hidden = true;
  }

  function renderHistory(project, work) {
    const list = page.querySelector('[data-history-list]');
    const history = Array.isArray(work.history) ? work.history : [];
    list.innerHTML = history.length ? history.map(item => '<article class="wdgforge-history-item"><div><strong>' + esc(item.label) + '</strong><time>' +
      new Date(item.at).toLocaleString(isEnglish ? 'en' : 'ru') + '</time></div><div><button class="wdgf-btn" data-history-restore="' + item.id + '">' + copy.restore +
      '</button><button class="wdgforge-icon danger" data-history-delete="' + item.id + '" title="' + copy.delete + '">' + icon('tabler:trash',16) + '</button></div></article>').join('') :
      '<div class="wdgforge-empty">' + copy.noHistory + '</div>';
    list.querySelectorAll('[data-history-restore]').forEach(button => button.addEventListener('click', () => {
      const item = history.find(entry => entry.id === button.dataset.historyRestore);
      if (!item) return;
      work.html = item.html;
      work.css = item.css;
      work.js = item.js;
      work.results = [];
      work.updatedAt = Date.now();
      saveForge();
      closeHistory();
      renderForge();
    }));
    list.querySelectorAll('[data-history-delete]').forEach(button => button.addEventListener('click', () => {
      work.history = history.filter(item => item.id !== button.dataset.historyDelete);
      saveForge();
      renderHistory(project, work);
    }));
  }

  function defaultGitState() {
    return {
      initialized:false,
      branch:'main',
      branches:['main'],
      staged:false,
      changed:true,
      commits:[],
      merged:false,
      output:[L('Repository simulator is ready. Start with git init.', 'Симулятор репозитория готов. Начни с git init.')]
    };
  }

  function renderGit() {
    const target = page.querySelector('#wdgforgeView');
    const state = readJson(GIT_KEY, defaultGitState());
    const tasks = gitTasks(state);
    target.innerHTML = '<div class="wdgforge-git"><aside class="wdgforge-git-guide"><span class="wdgforge-chip">Git workflow</span><h2>' +
      L('Ship a feature through a branch', 'Проведи функцию через отдельную ветку') + '</h2><p>' +
      L('Type real Git commands. The simulator explains the state instead of touching your files.', 'Вводи настоящие Git-команды. Симулятор объясняет состояние и не трогает твои файлы.') +
      '</p><ol>' + tasks.map(task => '<li class="' + (task.done ? 'done' : '') + '">' + icon(task.done ? 'tabler:circle-check-filled' : 'tabler:circle',15) + '<span>' + task.label + '</span></li>').join('') +
      '</ol><button class="wdgf-btn" type="button" data-git-edit>' + icon('tabler:file-pencil',15) + ' ' + L('Modify app.js', 'Изменить app.js') + '</button><button class="wdgf-btn danger" type="button" data-git-reset>' +
      icon('tabler:restore',15) + ' ' + copy.reset + '</button></aside><main class="wdgforge-terminal-panel"><div class="wdgforge-repo-state"><span>' +
      icon('tabler:git-branch',15) + ' ' + esc(state.branch) + '</span><span class="' + (state.changed ? 'changed' : '') + '">' + icon('tabler:file-code',15) + ' app.js ' +
      (state.changed ? L('modified', 'изменён') : L('clean', 'чисто')) + '</span><span>' + state.commits.length + ' commits</span></div>' +
      '<div class="wdgforge-branch-map">' + state.branches.map(branch => '<div class="' + (branch === state.branch ? 'active' : '') + '"><i></i><strong>' + esc(branch) +
      '</strong><span>' + state.commits.filter(commit => commit.branch === branch).map(commit => '<b title="' + esc(commit.message) + '">' + commit.id + '</b>').join('') + '</span></div>').join('') + '</div>' +
      '<div class="wdgforge-terminal" data-git-output>' + state.output.slice(-12).map(line => '<div>' + esc(line) + '</div>').join('') + '</div>' +
      '<form class="wdgforge-command" data-git-form><span>$</span><input autocomplete="off" spellcheck="false" placeholder="git status"><button type="submit">' + icon('tabler:corner-down-left',17) + '</button></form></main></div>';
    target.querySelector('[data-git-form]').addEventListener('submit', event => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('input');
      executeGit(input.value, state);
      writeJson(GIT_KEY, state);
      renderGit();
    });
    target.querySelector('[data-git-edit]').addEventListener('click', () => {
      state.changed = true;
      state.staged = false;
      state.output.push(L('app.js changed in the working tree.', 'app.js изменён в рабочей папке.'));
      writeJson(GIT_KEY, state);
      renderGit();
    });
    target.querySelector('[data-git-reset]').addEventListener('click', () => {
      localStorage.removeItem(GIT_KEY);
      renderGit();
    });
  }

  function gitTasks(state) {
    const mainCommit = state.commits.some(commit => commit.branch === 'main' && !commit.merge);
    const featureCommit = state.commits.some(commit => commit.branch === 'feature');
    return [
      { label:'git init', done:state.initialized },
      { label:L('Stage and commit app.js on main', 'Добавь app.js в индекс и сделай commit в main'), done:mainCommit },
      { label:'git branch feature', done:state.branches.includes('feature') },
      { label:L('Switch to feature and commit a change', 'Переключись на feature и закоммить изменение'), done:featureCommit },
      { label:L('Return to main', 'Вернись в main'), done:featureCommit && state.branch === 'main' },
      { label:'git merge feature', done:state.merged }
    ];
  }

  function executeGit(raw, state) {
    const command = String(raw || '').trim();
    if (!command) return;
    state.output.push('$ ' + command);
    if (command === 'git init') {
      state.initialized = true;
      state.output.push(L('Initialized empty Git repository.', 'Создан пустой Git-репозиторий.'));
      return;
    }
    if (!state.initialized) {
      state.output.push(L('Not a Git repository. Run git init first.', 'Это ещё не Git-репозиторий. Сначала выполни git init.'));
      return;
    }
    if (command === 'git status') {
      state.output.push('On branch ' + state.branch);
      state.output.push(state.staged ? L('Changes staged for commit.', 'Изменения добавлены в индекс.') : state.changed ? L('app.js is modified but not staged.', 'app.js изменён, но не добавлен в индекс.') : L('Working tree clean.', 'Рабочая папка чистая.'));
      return;
    }
    if (/^git add(?: \.| app\.js)$/.test(command)) {
      if (!state.changed) state.output.push(L('Nothing to add.', 'Добавлять нечего.'));
      else { state.staged = true; state.output.push(L('app.js added to the staging area.', 'app.js добавлен в индекс.')); }
      return;
    }
    const commitMatch = command.match(/^git commit -m ["'](.+)["']$/);
    if (commitMatch) {
      if (!state.staged) { state.output.push(L('Nothing staged. Use git add first.', 'В индексе пусто. Сначала используй git add.')); return; }
      const id = Math.random().toString(16).slice(2,8);
      state.commits.push({ id, branch:state.branch, message:commitMatch[1], merge:false });
      state.staged = false;
      state.changed = false;
      state.output.push('[' + state.branch + ' ' + id + '] ' + commitMatch[1]);
      api.logActivity?.(1);
      return;
    }
    const branchMatch = command.match(/^git branch ([a-z0-9._-]+)$/i);
    if (branchMatch) {
      const name = branchMatch[1];
      if (state.branches.includes(name)) state.output.push(L('Branch already exists.', 'Такая ветка уже существует.'));
      else { state.branches.push(name); state.output.push(L('Created branch ', 'Создана ветка ') + name); }
      return;
    }
    const switchMatch = command.match(/^git (?:switch|checkout) ([a-z0-9._-]+)$/i);
    if (switchMatch) {
      const name = switchMatch[1];
      if (!state.branches.includes(name)) state.output.push(L('Unknown branch: ', 'Неизвестная ветка: ') + name);
      else if (state.staged || state.changed) state.output.push(L('Commit or discard current changes before switching.', 'Перед переключением закоммить или отмени текущие изменения.'));
      else { state.branch = name; state.output.push(L('Switched to branch ', 'Переключено на ветку ') + name); }
      return;
    }
    const mergeMatch = command.match(/^git merge ([a-z0-9._-]+)$/i);
    if (mergeMatch) {
      const name = mergeMatch[1];
      if (state.branch !== 'main') state.output.push(L('Return to main before merging.', 'Перед слиянием вернись в main.'));
      else if (!state.commits.some(commit => commit.branch === name)) state.output.push(L('That branch has no commits to merge.', 'В этой ветке пока нечего объединять.'));
      else {
        const id = Math.random().toString(16).slice(2,8);
        state.commits.push({ id, branch:'main', message:'Merge branch ' + name, merge:true });
        state.merged = true;
        state.output.push(L('Merge completed successfully.', 'Слияние выполнено успешно.'));
        api.logActivity?.(3);
      }
      return;
    }
    if (command === 'git log' || command === 'git log --oneline') {
      if (!state.commits.length) state.output.push(L('No commits yet.', 'Коммитов пока нет.'));
      else state.commits.slice().reverse().forEach(commit => state.output.push(commit.id + ' ' + commit.message));
      return;
    }
    state.output.push(L('Command not recognized by this lesson. Try git status.', 'Эта команда пока не входит в урок. Попробуй git status.'));
  }

  function addNavigation() {
    const nav = document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById('wdgforgeNavBtn')) return;
    const button = document.createElement('button');
    button.className = 'wdg-nav-btn';
    button.id = 'wdgforgeNavBtn';
    button.type = 'button';
    button.dataset.wdgFeature = 'forge';
    button.innerHTML = icon('tabler:hammer',19) + '<span>' + copy.title + '</span>';
    button.title = copy.title;
    button.setAttribute('aria-label', copy.title);
    button.addEventListener('click', () => api.open('forge'));
    const lab = document.getElementById('wdglNavBtn');
    if (lab) lab.after(button);
    else {
      const playground = nav.querySelector('[data-wdg-nav="playground"]');
      if (playground) playground.before(button);
      else nav.append(button);
    }
  }

  function init() {
    api = window.WebDevGymFeatures;
    if (!api || typeof api.register !== 'function') {
      setTimeout(init, 60);
      return;
    }
    if (!storageBridgeReady) {
      window.addEventListener('message', handleStorageMessage);
      storageBridgeReady = true;
    }
    // Forge is no longer a standalone destination. Git Lab now lives in Trainers.
    window.WebDevGymForge = {
      open(id) {
        if (id) forgeState.activeProject = projectById(id).id;
        saveForge();
        api.open('lab');
      },
      current() {
        const project = projectById(forgeState.activeProject);
        const work = workspace(project.id);
        return {
          id:project.id, title:project.title, description:project.description,
          section:project.section, completed:Boolean(work.completedAt), updatedAt:work.updatedAt,
          source:{html:work.html, css:work.css, js:work.js}
        };
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 140));
  else setTimeout(init, 140);
})();
