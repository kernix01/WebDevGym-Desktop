(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  const isEnglish = runtime?.isEnglish ??
    (document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname));
  const L = runtime?.L || ((en, ru) => isEnglish ? en : ru);
  const STORAGE_KEY = isEnglish ? 'wdg_trainers_v2_en' : 'wdg_trainers_v2';
  const CHANNEL = 'wdg-trainers-preview';
  const icon = runtime?.icon || ((name, size = 17) =>
    '<iconify-icon icon="' + name + '" width="' + size + '" height="' + size + '"></iconify-icon>');
  const escapeHtml = runtime?.escapeHtml || (value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]));

  const copy = {
    title: L('Trainers', 'Тренажёры'),
    subtitle: L('Practice that turns knowledge into working code', 'Практика, которая закрепляет код'),
    tasks: L('Tasks', 'Задачи'),
    debug: L('Debug', 'Отладка'),
    projects: L('Mini-projects', 'Мини-проекты'),
    apiLab: 'API Lab',
    exercises: L('Exercises', 'Задания'),
    search: L('Find an exercise...', 'Найти задание...'),
    all: L('All', 'Все'),
    hint: L('Hint', 'Подсказка'),
    hideHint: L('Hide hint', 'Скрыть подсказку'),
    result: L('Result', 'Результат'),
    run: L('Run', 'Запустить'),
    refresh: L('Refresh result', 'Обновить результат'),
    newAttempt: L('New attempt', 'Новая попытка'),
    console: L('Console', 'Консоль'),
    problems: L('Problems', 'Проблемы'),
    previewStarted: L('Preview started', 'Предпросмотр запущен'),
    ready: L('Ready to practice', 'Готов к практике'),
    codeReset: L('Starter code restored', 'Начальный код восстановлен'),
    empty: L('No exercises found', 'Задания не найдены'),
    easy: L('Easy', 'Легко'),
    medium: L('Medium', 'Средне'),
    advanced: L('Advanced', 'Сложно'),
    html: 'HTML',
    css: 'CSS',
    js: 'JS',
    forms: L('Forms', 'Формы'),
    javascript: 'JavaScript',
    dom: L('Interface', 'Интерфейс'),
    resetCounter: L('Reset', 'Сбросить'),
    counterTitle: L('Counter', 'Счётчик'),
    saved: L('Saved locally', 'Сохранено локально'),
    panelClose: L('Hide exercises', 'Скрыть задания'),
    panelOpen: L('Show exercises', 'Показать задания'),
    consoleClose: L('Collapse console', 'Свернуть консоль'),
    consoleOpen: L('Expand console', 'Развернуть консоль'),
    desktop: L('Desktop preview', 'Предпросмотр на компьютере'),
    tablet: L('Tablet preview', 'Предпросмотр на планшете'),
    mobile: L('Mobile preview', 'Предпросмотр на телефоне')
  };

  Object.assign(copy, {
    interview: L('Interview', '\u0421\u043e\u0431\u0435\u0441\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435'),
    interviewTitle: L('Frontend interview practice', '\u041f\u0440\u0430\u043a\u0442\u0438\u043a\u0430 \u0434\u043b\u044f \u0441\u043e\u0431\u0435\u0441\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f'),
    interviewSubtitle: L('Answer first, then compare your reasoning with the reference.', '\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043e\u0442\u0432\u0435\u0442\u044c \u0441\u0430\u043c, \u0437\u0430\u0442\u0435\u043c \u0441\u0440\u0430\u0432\u043d\u0438 \u0441 \u0440\u0430\u0437\u0431\u043e\u0440\u043e\u043c.'),
    interviewQuestions: L('Questions', '\u0412\u043e\u043f\u0440\u043e\u0441\u044b'),
    yourAnswer: L('Your answer', '\u0422\u0432\u043e\u0439 \u043e\u0442\u0432\u0435\u0442'),
    answerPlaceholder: L('Explain it as if you were speaking to an interviewer...', '\u041e\u0431\u044a\u044f\u0441\u043d\u0438 \u0442\u0430\u043a, \u0431\u0443\u0434\u0442\u043e \u043e\u0442\u0432\u0435\u0447\u0430\u0435\u0448\u044c \u0438\u043d\u0442\u0435\u0440\u0432\u044c\u044e\u0435\u0440\u0443...'),
    showAnswer: L('Show review', '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0440\u0430\u0437\u0431\u043e\u0440'),
    hideAnswer: L('Hide review', '\u0421\u043a\u0440\u044b\u0442\u044c \u0440\u0430\u0437\u0431\u043e\u0440'),
    referenceAnswer: L('What a strong answer should include', '\u0427\u0442\u043e \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0432 \u0441\u0438\u043b\u044c\u043d\u043e\u043c \u043e\u0442\u0432\u0435\u0442\u0435'),
    rateAnswer: L('Rate your answer', '\u041e\u0446\u0435\u043d\u0438 \u0441\u0432\u043e\u0439 \u043e\u0442\u0432\u0435\u0442'),
    again: L('Repeat', '\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c'),
    partial: L('Partly', '\u0427\u0430\u0441\u0442\u0438\u0447\u043d\u043e'),
    know: L('Know it', '\u0417\u043d\u0430\u044e'),
    previous: L('Previous', '\u041d\u0430\u0437\u0430\u0434'),
    next: L('Next question', '\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0432\u043e\u043f\u0440\u043e\u0441'),
    answered: L('answered', '\u043e\u0442\u0432\u0435\u0447\u0435\u043d\u043e'),
    confident: L('confident', '\u0437\u043d\u0430\u044e'),
    sessionTime: L('Session', '\u0421\u0435\u0441\u0441\u0438\u044f'),
    resetSession: L('Reset session', '\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0441\u0435\u0441\u0441\u0438\u044e')
  });

  const sharedCounter = {
    html: `<main class="counter-card">
  <p class="eyebrow">${copy.counterTitle}</p>
  <output class="count">0</output>
  <div class="counter-actions">
    <button class="minus" type="button">-</button>
    <button class="plus" type="button">+</button>
  </div>
  <button class="reset" type="button">${copy.resetCounter}</button>
</main>`,
    css: `* { box-sizing: border-box; }

body {
  min-height: 100vh;
  margin: 0;
  display: grid;
  place-items: center;
  background: #0b1020;
  color: #f8fafc;
  font-family: Inter, system-ui, sans-serif;
}

.counter-card {
  width: min(320px, calc(100% - 32px));
  padding: 32px;
  text-align: center;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #111827;
}

.eyebrow { margin: 0; color: #94a3b8; }
.count { display: block; margin: 22px 0; font-size: 72px; }
.counter-actions { display: flex; justify-content: center; gap: 12px; }
button { min-width: 64px; min-height: 44px; border: 0; border-radius: 8px; cursor: pointer; }
.plus { background: #9333ea; color: white; }
.minus, .reset { background: #334155; color: white; }
.reset { width: 100%; margin-top: 12px; }`,
    js: `const count = document.querySelector(".count");
const plus = document.querySelector(".plus");
const minus = document.querySelector(".minus");
const reset = document.querySelector(".reset");

let score = 0;

function updateCount() {
  count.textContent = score;
}

plus.addEventListener("click", () => {
  // ${L('Continue on your own', 'Продолжи самостоятельно')}
});

minus.addEventListener("click", () => {
  // ${L('Do not let the counter go below zero', 'Не позволяй счётчику уйти ниже нуля')}
});

reset.addEventListener("click", () => {
  // ${L('Restore the initial value', 'Верни исходное значение')}
});`
  };

  const exercises = [
    {
      id: 'counter', mode: 'tasks', category: 'javascript',
      title: L('Counter without negative values', 'Счётчик без отрицательных значений'),
      short: L('Counter without minus', 'Счётчик без минуса'), level: 'easy',
      requirements: [
        L('Plus increases the value', 'Плюс увеличивает число'),
        L('Minus never goes below zero', 'Минус не уходит ниже нуля'),
        L('Reset returns the value to 0', 'Сброс возвращает 0')
      ],
      hint: L(
        'Keep the number in one variable. Change it inside event handlers, then call one render function.',
        'Храни число в одной переменной. Меняй её в обработчиках событий, затем вызывай одну функцию обновления.'
      ),
      files: sharedCounter
    },
    {
      id: 'theme', mode: 'tasks', category: 'javascript',
      title: L('Theme switcher', 'Переключатель темы'),
      short: L('Theme switcher', 'Переключатель темы'), level: 'easy',
      requirements: [
        L('The button toggles a class on body', 'Кнопка переключает класс у body'),
        L('The icon matches the active theme', 'Иконка соответствует текущей теме'),
        L('The choice survives a reload', 'Выбор сохраняется после перезагрузки')
      ],
      hint: L('Use classList.toggle. Choose a persistence method that fits your project.', 'Используй classList.toggle. Способ сохранения выбери под свой проект.'),
      files: {
        html: L(
          '<button class="theme-toggle" type="button">🌙</button>\n<h1>Theme switcher</h1>',
          '<button class="theme-toggle" type="button">🌙</button>\n<h1>Переключатель темы</h1>'
        ),
        css: 'body { padding: 40px; font-family: system-ui; }\nbody.dark { background: #111827; color: white; }\n.theme-toggle { padding: 10px 14px; }',
        js: L(
          'const button = document.querySelector(".theme-toggle");\n\n// Add theme switching and persistence',
          'const button = document.querySelector(".theme-toggle");\n\n// Добавь переключение и сохранение темы'
        )
      }
    },
    {
      id: 'form', mode: 'tasks', category: 'forms',
      title: L('Form validation', 'Проверка формы'),
      short: L('Form validation', 'Проверка формы'), level: 'medium',
      requirements: [
        L('Empty text is rejected', 'Пустой текст не отправляется'),
        L('Spaces alone count as empty', 'Одни пробелы считаются пустым полем'),
        L('A successful submit clears the field', 'После отправки поле очищается')
      ],
      hint: L('Handle submit on the form and check input.value.trim().', 'Обрабатывай submit у формы и проверяй input.value.trim().'),
      files: {
        html: L(
          '<form class="message-form">\n  <input class="message" placeholder="Message">\n  <button>Send</button>\n  <p class="status"></p>\n</form>',
          '<form class="message-form">\n  <input class="message" placeholder="Сообщение">\n  <button>Отправить</button>\n  <p class="status"></p>\n</form>'
        ),
        css: 'body { padding: 40px; font-family: system-ui; }\n.message-form { display: grid; gap: 12px; max-width: 360px; }\ninput, button { padding: 12px; }',
        js: L(
          'const form = document.querySelector(".message-form");\nconst input = document.querySelector(".message");\nconst status = document.querySelector(".status");\n\n// Handle submit',
          'const form = document.querySelector(".message-form");\nconst input = document.querySelector(".message");\nconst status = document.querySelector(".status");\n\n// Обработай submit'
        )
      }
    },
    {
      id: 'filter', mode: 'tasks', category: 'dom',
      title: L('Live list filter', 'Фильтр списка'),
      short: L('List filter', 'Фильтр списка'), level: 'medium',
      requirements: [
        L('Filtering happens while typing', 'Фильтрация работает во время ввода'),
        L('The check is case-insensitive', 'Регистр букв не влияет на поиск'),
        L('An empty query shows all items', 'Пустой запрос показывает все элементы')
      ],
      hint: L('Compare lowercase textContent with the lowercase query.', 'Сравни textContent в нижнем регистре с запросом в нижнем регистре.'),
      files: {
        html: L(
          '<input class="search" placeholder="Find a technology">\n<ul>\n  <li>HTML</li><li>CSS</li><li>JavaScript</li><li>React</li>\n</ul>',
          '<input class="search" placeholder="Найти технологию">\n<ul>\n  <li>HTML</li><li>CSS</li><li>JavaScript</li><li>React</li>\n</ul>'
        ),
        css: 'body { padding: 40px; font-family: system-ui; }\ninput { padding: 10px; }\nli { margin: 8px 0; }',
        js: L(
          'const search = document.querySelector(".search");\nconst items = document.querySelectorAll("li");\n\n// Listen for input and hide items that do not match',
          'const search = document.querySelector(".search");\nconst items = document.querySelectorAll("li");\n\n// Слушай событие input и скрывай неподходящие элементы'
        )
      }
    },
    {
      id: 'modal', mode: 'projects', category: 'css',
      title: L('Accessible modal window', 'Доступное модальное окно'),
      short: L('Modal window', 'Модальное окно'), level: 'medium',
      requirements: [
        L('The trigger opens the modal', 'Кнопка открывает окно'),
        L('Escape and the backdrop close it', 'Escape и фон закрывают окно'),
        L('Focus returns to the trigger', 'Фокус возвращается на кнопку')
      ],
      hint: L('Store the trigger element before opening and listen for keydown.', 'Сохрани кнопку перед открытием и слушай keydown.'),
      files: {
        html: L(
          '<button class="open-modal">Open</button>\n<dialog class="modal">\n  <h2>Modal title</h2>\n  <button class="close-modal">Close</button>\n</dialog>',
          '<button class="open-modal">Открыть</button>\n<dialog class="modal">\n  <h2>Заголовок</h2>\n  <button class="close-modal">Закрыть</button>\n</dialog>'
        ),
        css: 'body { padding: 40px; font-family: system-ui; }\ndialog { border: 0; border-radius: 12px; padding: 28px; }\ndialog::backdrop { background: rgb(15 23 42 / 70%); }',
        js: L(
          'const modal = document.querySelector(".modal");\nconst openButton = document.querySelector(".open-modal");\nconst closeButton = document.querySelector(".close-modal");\n\n// Connect the buttons to showModal() and close()',
          'const modal = document.querySelector(".modal");\nconst openButton = document.querySelector(".open-modal");\nconst closeButton = document.querySelector(".close-modal");\n\n// Свяжи кнопки с showModal() и close()'
        )
      }
    },
    {
      id: 'broken-counter', mode: 'debug', category: 'javascript',
      title: L('Repair the counter', 'Почини счётчик'),
      short: L('Broken counter', 'Сломанный счётчик'), level: 'easy',
      requirements: [
        L('Find the selector error', 'Найди ошибку в селекторе'),
        L('Fix the increment operation', 'Исправь увеличение числа'),
        L('Render the new value', 'Выведи новое значение')
      ],
      hint: L('Check the class name and the value being assigned to textContent.', 'Проверь имя класса и значение, которое записывается в textContent.'),
      files: {
        html: sharedCounter.html, css: sharedCounter.css,
        js: 'const count = document.querySelector(".counter");\nconst plus = document.querySelector(".plus");\nlet score = 0;\n\nplus.addEventListener("click", () => {\n  score =+ 1;\n  count.textContent = "score";\n});'
      }
    }
  ];

  const interviewQuestions = [
    ['html-semantics', 'HTML',
      L('Why use semantic HTML instead of building everything with div elements?', '\u0417\u0430\u0447\u0435\u043c \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u0441\u0435\u043c\u0430\u043d\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 HTML-\u0442\u0435\u0433\u0438, \u0430 \u043d\u0435 \u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0432\u0441\u0451 \u043d\u0430 div?'),
      L('Cover document structure, accessibility, keyboard and screen-reader navigation, SEO and maintainability. Give examples: header, nav, main, article and button.', '\u0420\u0430\u0441\u0441\u043a\u0430\u0436\u0438 \u043f\u0440\u043e \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0443 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430, \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c, \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044e \u0441 \u043a\u043b\u0430\u0432\u0438\u0430\u0442\u0443\u0440\u044b \u0438 \u0441\u043a\u0440\u0438\u043d\u0440\u0438\u0434\u0435\u0440\u0430, SEO \u0438 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443. \u041f\u0440\u0438\u0432\u0435\u0434\u0438 \u043f\u0440\u0438\u043c\u0435\u0440\u044b: header, nav, main, article, button.')],
    ['html-forms', 'HTML',
      L('How do label, name and type affect a form field?', '\u041a\u0430\u043a label, name \u0438 type \u0432\u043b\u0438\u044f\u044e\u0442 \u043d\u0430 \u043f\u043e\u043b\u0435 \u0444\u043e\u0440\u043c\u044b?'),
      L('label connects readable text to the control; name becomes the submitted key; type selects native behavior and validation. Mention id/for and button type.', 'label \u0441\u0432\u044f\u0437\u044b\u0432\u0430\u0435\u0442 \u0442\u0435\u043a\u0441\u0442 \u0441 \u043f\u043e\u043b\u0435\u043c; name \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f \u043a\u043b\u044e\u0447\u043e\u043c \u043f\u0440\u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0435; type \u0437\u0430\u0434\u0430\u0451\u0442 \u043d\u0430\u0442\u0438\u0432\u043d\u043e\u0435 \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u0438 \u0432\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u044e. \u0414\u043e\u0431\u0430\u0432\u044c \u043f\u0440\u043e id/for \u0438 type \u0443 button.')],
    ['css-box', 'CSS',
      L('Explain the CSS box model and box-sizing: border-box.', '\u041e\u0431\u044a\u044f\u0441\u043d\u0438 CSS box model \u0438 box-sizing: border-box.'),
      L('Content, padding, border and margin form the box. With border-box, declared width and height include padding and border, making sizing predictable.', '\u0411\u043b\u043e\u043a \u0441\u043e\u0441\u0442\u043e\u0438\u0442 \u0438\u0437 content, padding, border \u0438 margin. \u041f\u0440\u0438 border-box \u0437\u0430\u0434\u0430\u043d\u043d\u044b\u0435 width \u0438 height \u0443\u0436\u0435 \u0432\u043a\u043b\u044e\u0447\u0430\u044e\u0442 padding \u0438 border, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0440\u0430\u0437\u043c\u0435\u0440\u044b \u043f\u0440\u0435\u0434\u0441\u043a\u0430\u0437\u0443\u0435\u043c\u044b.')],
    ['css-layout', 'CSS',
      L('When would you choose Flexbox and when Grid?', '\u041a\u043e\u0433\u0434\u0430 \u0432\u044b\u0431\u0440\u0430\u0442\u044c Flexbox, \u0430 \u043a\u043e\u0433\u0434\u0430 Grid?'),
      L('Flexbox is mainly one-dimensional: a row or a column. Grid controls rows and columns together. Choose by layout behavior, and combine them when useful.', 'Flexbox \u0432 \u043e\u0441\u043d\u043e\u0432\u043d\u043e\u043c \u043e\u0434\u043d\u043e\u043c\u0435\u0440\u043d\u044b\u0439: \u0441\u0442\u0440\u043e\u043a\u0430 \u0438\u043b\u0438 \u043a\u043e\u043b\u043e\u043d\u043a\u0430. Grid \u0443\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442 \u0441\u0442\u0440\u043e\u043a\u0430\u043c\u0438 \u0438 \u043a\u043e\u043b\u043e\u043d\u043a\u0430\u043c\u0438 \u0432\u043c\u0435\u0441\u0442\u0435. \u0412\u044b\u0431\u0438\u0440\u0430\u0439 \u043f\u043e \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u044e \u043c\u0430\u043a\u0435\u0442\u0430; \u0438\u0445 \u043c\u043e\u0436\u043d\u043e \u0441\u043e\u0447\u0435\u0442\u0430\u0442\u044c.')],
    ['css-specificity', 'CSS',
      L('How does CSS specificity decide which rule wins?', '\u041a\u0430\u043a CSS-\u0441\u043f\u0435\u0446\u0438\u0444\u0438\u0447\u043d\u043e\u0441\u0442\u044c \u0440\u0435\u0448\u0430\u0435\u0442, \u043a\u0430\u043a\u043e\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u043e \u043f\u043e\u0431\u0435\u0434\u0438\u0442?'),
      L('Compare inline styles, IDs, classes/attributes/pseudo-classes, then elements/pseudo-elements. If weights match, the later rule wins. !important is not a healthy default.', '\u0421\u0440\u0430\u0432\u043d\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u0432\u0435\u0441: inline, ID, \u043a\u043b\u0430\u0441\u0441\u044b/\u0430\u0442\u0440\u0438\u0431\u0443\u0442\u044b/\u043f\u0441\u0435\u0432\u0434\u043e\u043a\u043b\u0430\u0441\u0441\u044b, \u0437\u0430\u0442\u0435\u043c \u0442\u0435\u0433\u0438/\u043f\u0441\u0435\u0432\u0434\u043e\u044d\u043b\u0435\u043c\u0435\u043d\u0442\u044b. \u041f\u0440\u0438 \u0440\u0430\u0432\u0435\u043d\u0441\u0442\u0432\u0435 \u043f\u043e\u0431\u0435\u0436\u0434\u0430\u0435\u0442 \u0431\u043e\u043b\u0435\u0435 \u043f\u043e\u0437\u0434\u043d\u0435\u0435 \u043f\u0440\u0430\u0432\u0438\u043b\u043e. !important \u043d\u0435 \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u0434\u0435\u0444\u043e\u043b\u0442\u043e\u043c.')],
    ['js-declarations', 'JavaScript',
      L('What is the difference between var, let and const?', '\u0427\u0435\u043c \u043e\u0442\u043b\u0438\u0447\u0430\u044e\u0442\u0441\u044f var, let \u0438 const?'),
      L('let and const are block-scoped and have a temporal dead zone; var is function-scoped and hoisted differently. const prevents reassignment, not object mutation. Prefer const, then let.', 'let \u0438 const \u0438\u043c\u0435\u044e\u0442 \u0431\u043b\u043e\u0447\u043d\u0443\u044e \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u0432\u0438\u0434\u0438\u043c\u043e\u0441\u0442\u0438 \u0438 temporal dead zone; var \u0438\u043c\u0435\u0435\u0442 \u043e\u0431\u043b\u0430\u0441\u0442\u044c \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u0438 \u0438\u043d\u0430\u0447\u0435 hoist-\u0438\u0442\u0441\u044f. const \u0437\u0430\u043f\u0440\u0435\u0449\u0430\u0435\u0442 \u043f\u0435\u0440\u0435\u043f\u0440\u0438\u0441\u0432\u0430\u0438\u0432\u0430\u043d\u0438\u0435, \u043d\u043e \u043d\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u043e\u0431\u044a\u0435\u043a\u0442\u0430. \u041f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e const, \u0437\u0430\u0442\u0435\u043c let.')],
    ['js-equality', 'JavaScript',
      L('Why is strict equality usually preferred?', '\u041f\u043e\u0447\u0435\u043c\u0443 \u0441\u0442\u0440\u043e\u0433\u043e\u0435 \u0440\u0430\u0432\u0435\u043d\u0441\u0442\u0432\u043e \u043e\u0431\u044b\u0447\u043d\u043e \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0442\u0438\u0442\u0435\u043b\u044c\u043d\u0435\u0435?'),
      L('=== compares type and value without implicit conversion. == performs coercion and can surprise you, for example 0 == false.', '=== \u0441\u0440\u0430\u0432\u043d\u0438\u0432\u0430\u0435\u0442 \u0442\u0438\u043f \u0438 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0431\u0435\u0437 \u043d\u0435\u044f\u0432\u043d\u043e\u0433\u043e \u043f\u0440\u0435\u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f. == \u043f\u0440\u0438\u0432\u043e\u0434\u0438\u0442 \u0442\u0438\u043f\u044b \u0438 \u043c\u043e\u0436\u0435\u0442 \u0443\u0434\u0438\u0432\u0438\u0442\u044c, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 0 == false.')],
    ['js-closure', 'JavaScript',
      L('What is a closure and where is it useful?', '\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0437\u0430\u043c\u044b\u043a\u0430\u043d\u0438\u0435 \u0438 \u0433\u0434\u0435 \u043e\u043d\u043e \u043f\u043e\u043b\u0435\u0437\u043d\u043e?'),
      L('A function keeps access to variables from the lexical scope where it was created. Useful examples include factories, private state, callbacks and memoization.', '\u0424\u0443\u043d\u043a\u0446\u0438\u044f \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f \u043a \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u043c \u043b\u0435\u043a\u0441\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u043e\u0431\u043b\u0430\u0441\u0442\u0438, \u0433\u0434\u0435 \u043e\u043d\u0430 \u0431\u044b\u043b\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0430. \u041f\u0440\u0438\u043c\u0435\u0440\u044b: \u0444\u0430\u0431\u0440\u0438\u043a\u0438, \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u043e\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435, callbacks, \u043c\u0435\u043c\u043e\u0438\u0437\u0430\u0446\u0438\u044f.')],
    ['js-event-loop', 'JavaScript',
      L('Explain the event loop, call stack and task queues.', '\u041e\u0431\u044a\u044f\u0441\u043d\u0438 event loop, call stack \u0438 \u043e\u0447\u0435\u0440\u0435\u0434\u0438 \u0437\u0430\u0434\u0430\u0447.'),
      L('Synchronous code runs on the call stack. When it is empty, Promise microtasks run before the next macrotask such as setTimeout. Rendering can happen between suitable turns.', '\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u043d\u044b\u0439 \u043a\u043e\u0434 \u0438\u0434\u0451\u0442 \u0432 call stack. \u041a\u043e\u0433\u0434\u0430 \u0441\u0442\u0435\u043a \u043f\u0443\u0441\u0442, \u043c\u0438\u043a\u0440\u043e\u0437\u0430\u0434\u0430\u0447\u0438 Promise \u0432\u044b\u043f\u043e\u043b\u043d\u044f\u044e\u0442\u0441\u044f \u0434\u043e \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0439 \u043c\u0430\u043a\u0440\u043e\u0437\u0430\u0434\u0430\u0447\u0438, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 setTimeout. \u041c\u0435\u0436\u0434\u0443 \u0446\u0438\u043a\u043b\u0430\u043c\u0438 \u0432\u043e\u0437\u043c\u043e\u0436\u0435\u043d \u0440\u0435\u043d\u0434\u0435\u0440.')],
    ['js-delegation', 'JavaScript',
      L('What are event bubbling and delegation?', '\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 \u0432\u0441\u043f\u043b\u044b\u0442\u0438\u0435 \u0438 \u0434\u0435\u043b\u0435\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0441\u043e\u0431\u044b\u0442\u0439?'),
      L('Most events bubble from the target through ancestors. Delegation puts one listener on a stable parent and finds the relevant child with event.target.closest().', '\u0411\u043e\u043b\u044c\u0448\u0438\u043d\u0441\u0442\u0432\u043e \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u0432\u0441\u043f\u043b\u044b\u0432\u0430\u044e\u0442 \u043e\u0442 target \u043a \u043f\u0440\u0435\u0434\u043a\u0430\u043c. \u041f\u0440\u0438 \u0434\u0435\u043b\u0435\u0433\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0438 \u043e\u0434\u0438\u043d listener \u0441\u0442\u0430\u0432\u0438\u0442\u0441\u044f \u043d\u0430 \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0433\u043e \u0440\u043e\u0434\u0438\u0442\u0435\u043b\u044f, \u0430 \u043f\u043e\u0442\u043e\u043c\u043e\u043a \u0438\u0449\u0435\u0442\u0441\u044f \u0447\u0435\u0440\u0435\u0437 event.target.closest().')],
    ['ts-safety', 'TypeScript',
      L('What is the difference between any, unknown and never?', '\u0427\u0435\u043c \u043e\u0442\u043b\u0438\u0447\u0430\u044e\u0442\u0441\u044f any, unknown \u0438 never?'),
      L('any disables checking. unknown accepts any value but requires narrowing before use. never represents a value that cannot exist, such as an exhaustive branch.', 'any \u043e\u0442\u043a\u043b\u044e\u0447\u0430\u0435\u0442 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0443. unknown \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0435\u0442 \u043b\u044e\u0431\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435, \u043d\u043e \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0441\u0443\u0436\u0435\u043d\u0438\u044f. never \u043e\u0437\u043d\u0430\u0447\u0430\u0435\u0442 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435, \u043a\u043e\u0442\u043e\u0440\u043e\u0433\u043e \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c, \u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440 \u0432 exhaustive-\u0432\u0435\u0442\u043a\u0435.')],
    ['react-render', 'React',
      L('What causes a React component to render?', '\u0427\u0442\u043e \u0432\u044b\u0437\u044b\u0432\u0430\u0435\u0442 \u0440\u0435\u043d\u0434\u0435\u0440 React-\u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u0430?'),
      L('Initial mount, its state update, parent render or consumed context update. React reconciles the result; rendering does not mean every DOM node changes.', '\u041f\u0435\u0440\u0432\u0438\u0447\u043d\u044b\u0439 mount, \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f, \u0440\u0435\u043d\u0434\u0435\u0440 \u0440\u043e\u0434\u0438\u0442\u0435\u043b\u044f \u0438\u043b\u0438 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 context. React \u0434\u0435\u043b\u0430\u0435\u0442 reconciliation; \u0440\u0435\u043d\u0434\u0435\u0440 \u043d\u0435 \u043e\u0437\u043d\u0430\u0447\u0430\u0435\u0442 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u043a\u0430\u0436\u0434\u043e\u0433\u043e DOM-\u0443\u0437\u043b\u0430.')],
    ['react-effect', 'React',
      L('What is useEffect for, and what often causes an infinite loop?', '\u0414\u043b\u044f \u0447\u0435\u0433\u043e useEffect \u0438 \u0447\u0442\u043e \u0447\u0430\u0441\u0442\u043e \u0432\u044b\u0437\u044b\u0432\u0430\u0435\u0442 \u0431\u0435\u0441\u043a\u043e\u043d\u0435\u0447\u043d\u044b\u0439 \u0446\u0438\u043a\u043b?'),
      L('It synchronizes a component with an external system. Updating a dependency inside the effect can loop. Include reactive dependencies and return cleanup for timers, listeners or subscriptions.', '\u041e\u043d \u0441\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442 \u0441 \u0432\u043d\u0435\u0448\u043d\u0435\u0439 \u0441\u0438\u0441\u0442\u0435\u043c\u043e\u0439. \u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0438 \u0432\u043d\u0443\u0442\u0440\u0438 effect \u043c\u043e\u0436\u0435\u0442 \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0446\u0438\u043a\u043b. \u0414\u043e\u0431\u0430\u0432\u043b\u044f\u0439 \u0440\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0438 \u0438 cleanup \u0434\u043b\u044f \u0442\u0430\u0439\u043c\u0435\u0440\u043e\u0432, listeners \u0438 \u043f\u043e\u0434\u043f\u0438\u0441\u043e\u043a.')],
    ['git-history', 'Git',
      L('What is the difference between merge and rebase?', '\u0427\u0435\u043c \u043e\u0442\u043b\u0438\u0447\u0430\u044e\u0442\u0441\u044f merge \u0438 rebase?'),
      L('merge combines histories without rewriting existing commits. rebase reapplies commits on a new base and changes their hashes. Avoid rebasing shared public history.', 'merge \u043e\u0431\u044a\u0435\u0434\u0438\u043d\u044f\u0435\u0442 \u0438\u0441\u0442\u043e\u0440\u0438\u0438, \u043d\u0435 \u043f\u0435\u0440\u0435\u043f\u0438\u0441\u044b\u0432\u0430\u044f \u0441\u0442\u0430\u0440\u044b\u0435 \u043a\u043e\u043c\u043c\u0438\u0442\u044b. rebase \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0438\u0442 \u043a\u043e\u043c\u043c\u0438\u0442\u044b \u043d\u0430 \u043d\u043e\u0432\u0443\u044e \u0431\u0430\u0437\u0443 \u0438 \u043c\u0435\u043d\u044f\u0435\u0442 \u0438\u0445 hash. \u041d\u0435 rebase-\u0438 \u043e\u0431\u0449\u0443\u044e \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0443\u044e \u0438\u0441\u0442\u043e\u0440\u0438\u044e.')],
    ['web-url', 'Web',
      L('What happens after entering a URL in the browser?', '\u0427\u0442\u043e \u043f\u0440\u043e\u0438\u0441\u0445\u043e\u0434\u0438\u0442 \u043f\u043e\u0441\u043b\u0435 \u0432\u0432\u043e\u0434\u0430 URL \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435?'),
      L('Mention URL parsing, cache or service worker, DNS, connection and TLS, HTTP request and response, HTML parsing, CSSOM, JavaScript, render tree, layout and paint.', '\u0423\u043f\u043e\u043c\u044f\u043d\u0438 \u0440\u0430\u0437\u0431\u043e\u0440 URL, cache \u0438\u043b\u0438 service worker, DNS, \u0441\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435 \u0438 TLS, HTTP-\u0437\u0430\u043f\u0440\u043e\u0441 \u0438 \u043e\u0442\u0432\u0435\u0442, \u043f\u0430\u0440\u0441\u0438\u043d\u0433 HTML, CSSOM, JavaScript, render tree, layout \u0438 paint.')]
  ].map(([id, category, question, answer]) => ({ id, category, question, answer }));

  const state = readState();
  const trainerModes = ['tasks', 'debug', 'projects', 'interview', 'api'];
  let api = null;
  let page = null;
  let previewFrame = null;
  let messageHandler = null;
  let saveTimer = null;
  let dragCleanup = null;
  let interviewTimer = null;

  function readState() {
    const fallback = {
      mode: 'tasks', exerciseId: 'counter', file: 'js', device: 'desktop',
      search: '', category: 'all', railCollapsed: false,
      consoleCollapsed: false, split: 64, consoleHeight: 170, drafts: {},
      interviewCategory: 'all', interviewQuestionId: interviewQuestions[0].id,
      interviewAnswers: {}, interviewRatings: {}, interviewReveal: false,
      interviewStartedAt: 0
    };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...fallback, ...saved, drafts: saved.drafts || {} };
    } catch (error) { return fallback; }
  }

  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {}
      updateSaveStatus();
    }, 120);
  }

  function currentExercise() {
    const inMode = exercises.filter(item => item.mode === state.mode);
    return inMode.find(item => item.id === state.exerciseId) || inMode[0] || exercises[0];
  }

  function filesFor(exercise) {
    const saved = state.drafts[exercise.id];
    return saved ? { ...exercise.files, ...saved } : { ...exercise.files };
  }

  function setDraft(exercise, file, value) {
    state.drafts[exercise.id] = { ...filesFor(exercise), [file]: value };
    saveState();
  }

  function filteredExercises() {
    const query = state.search.trim().toLowerCase();
    return exercises.filter(item =>
      item.mode === state.mode &&
      (state.category === 'all' || item.category === state.category) &&
      (!query || (item.title + ' ' + item.short).toLowerCase().includes(query))
    );
  }

  function modeLabel(mode) {
    return mode === 'api' ? copy.apiLab : mode === 'interview' ? copy.interview : mode === 'debug' ? copy.debug : mode === 'projects' ? copy.projects : copy.tasks;
  }

  function categoryLabel(category) {
    return { all: copy.all, javascript: copy.javascript, dom: copy.dom, css: copy.css, forms: copy.forms }[category] || category;
  }

  function levelLabel(level) {
    return level === 'advanced' ? copy.advanced : level === 'medium' ? copy.medium : copy.easy;
  }

  function renderPage() {
    page = api.pageShell('lab', copy.title, copy.subtitle, '<div class="wdgt-app" data-wdgt-app></div>');
    page.classList.add('wdgt-page');
    renderApp();
    return page;
  }

  function renderApp() {
    const root = page.querySelector('[data-wdgt-app]');
    clearInterval(interviewTimer);
    window.WebDevGymApiLab?.destroy?.();
    root.classList.toggle('interview-mode', state.mode === 'interview');
    root.classList.toggle('api-mode', state.mode === 'api');
    if (state.mode === 'api') {
      renderApiLab(root);
      return;
    }
    if (state.mode === 'interview') {
      renderInterview(root);
      return;
    }
    const exercise = currentExercise();
    const files = filesFor(exercise);
    const categories = ['all', 'javascript', 'dom', 'css', 'forms'];

    root.style.setProperty('--wdgt-split', state.split + '%');
    root.style.setProperty('--wdgt-console-height', state.consoleHeight + 'px');
    root.classList.toggle('rail-collapsed', state.railCollapsed);
    root.classList.toggle('console-collapsed', state.consoleCollapsed);
    root.innerHTML = `
      <header class="wdgt-toolbar">
        <div class="wdgt-modes" role="tablist" aria-label="${escapeHtml(copy.title)}">
          ${trainerModes.map(mode => `
            <button type="button" data-wdgt-mode="${mode}" class="${state.mode === mode ? 'active' : ''}">
              ${escapeHtml(modeLabel(mode))}
            </button>`).join('')}
        </div>
        <div class="wdgt-actions">
          <span class="wdgt-save" data-wdgt-save>${icon('tabler:cloud-check', 15)} ${escapeHtml(copy.saved)}</span>
          <button class="wdgt-btn primary" type="button" data-wdgt-run>${icon('tabler:player-play-filled', 15)} ${escapeHtml(copy.run)}</button>
          <button class="wdgt-icon-btn" type="button" data-wdgt-refresh title="${escapeHtml(copy.refresh)}" aria-label="${escapeHtml(copy.refresh)}">${icon('tabler:refresh', 17)}</button>
          <button class="wdgt-btn" type="button" data-wdgt-new>${icon('tabler:rotate-2', 16)} ${escapeHtml(copy.newAttempt)}</button>
        </div>
      </header>

      <div class="wdgt-workspace">
        <aside class="wdgt-rail">
          <header>
            <strong>${escapeHtml(copy.exercises)}</strong>
            <div>
              <button class="wdgt-icon-btn" type="button" data-wdgt-focus-search title="${escapeHtml(copy.search)}">${icon('tabler:search', 17)}</button>
              <button class="wdgt-icon-btn" type="button" data-wdgt-collapse-rail title="${escapeHtml(copy.panelClose)}">${icon('tabler:chevrons-left', 17)}</button>
            </div>
          </header>
          <label class="wdgt-search">
            ${icon('tabler:search', 16)}
            <input type="search" value="${escapeHtml(state.search)}" placeholder="${escapeHtml(copy.search)}" data-wdgt-search>
          </label>
          <div class="wdgt-categories">
            ${categories.map(category => `<button type="button" data-wdgt-category="${category}" class="${state.category === category ? 'active' : ''}">${escapeHtml(categoryLabel(category))}</button>`).join('')}
          </div>
          <div class="wdgt-exercise-list" data-wdgt-exercise-list></div>
        </aside>
        <button class="wdgt-rail-opener" type="button" data-wdgt-collapse-rail title="${escapeHtml(copy.panelOpen)}">${icon('tabler:chevrons-right', 18)}</button>

        <section class="wdgt-stage">
          <article class="wdgt-brief">
            <div>
              <span class="wdgt-kicker">${escapeHtml(modeLabel(exercise.mode))} · ${escapeHtml(categoryLabel(exercise.category))}</span>
              <h2>${escapeHtml(exercise.title)}</h2>
              <ol>${exercise.requirements.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
            </div>
            <button class="wdgt-btn" type="button" data-wdgt-hint>${icon('tabler:bulb', 16)} ${escapeHtml(copy.hint)}</button>
            <p class="wdgt-hint" data-wdgt-hint-panel hidden>${escapeHtml(exercise.hint)}</p>
          </article>

          <div class="wdgt-editor-preview" data-wdgt-resize-x>
            <section class="wdgt-editor">
              <header class="wdgt-file-tabs">
                ${['html', 'css', 'js'].map(file => `
                  <button type="button" data-wdgt-file="${file}" class="${state.file === file ? 'active' : ''}">
                    <span class="${file}">${escapeHtml(copy[file])}</span>
                    ${file === 'html' ? 'index.html' : file === 'css' ? 'style.css' : 'script.js'}
                  </button>`).join('')}
              </header>
              <div class="wdgt-code-shell">
                <pre class="wdgt-lines" aria-hidden="true" data-wdgt-lines></pre>
                <textarea spellcheck="false" autocapitalize="off" autocomplete="off" data-wdgt-code aria-label="${escapeHtml(state.file.toUpperCase())}">${escapeHtml(files[state.file] || '')}</textarea>
              </div>
            </section>

            <button class="wdgt-splitter-x" type="button" data-wdgt-splitter-x aria-label="Resize editor and preview"></button>

            <section class="wdgt-preview">
              <header>
                <strong>${escapeHtml(copy.result)}</strong>
                <div class="wdgt-devices">
                  <button type="button" data-wdgt-device="desktop" class="${state.device === 'desktop' ? 'active' : ''}" title="${escapeHtml(copy.desktop)}">${icon('tabler:device-desktop', 17)}</button>
                  <button type="button" data-wdgt-device="tablet" class="${state.device === 'tablet' ? 'active' : ''}" title="${escapeHtml(copy.tablet)}">${icon('tabler:device-tablet', 17)}</button>
                  <button type="button" data-wdgt-device="mobile" class="${state.device === 'mobile' ? 'active' : ''}" title="${escapeHtml(copy.mobile)}">${icon('tabler:device-mobile', 17)}</button>
                  <button type="button" data-wdgt-run title="${escapeHtml(copy.refresh)}">${icon('tabler:refresh', 17)}</button>
                </div>
              </header>
              <div class="wdgt-preview-canvas">
                <iframe sandbox="allow-scripts" title="${escapeHtml(copy.result)}" data-wdgt-frame data-device="${state.device}"></iframe>
              </div>
            </section>
          </div>

          <button class="wdgt-splitter-y" type="button" data-wdgt-splitter-y aria-label="Resize console"></button>

          <section class="wdgt-console">
            <header>
              <div>
                <button type="button" class="active">${escapeHtml(copy.console)}</button>
                <button type="button">${escapeHtml(copy.problems)} <span data-wdgt-problem-count>0</span></button>
              </div>
              <div>
                <button class="wdgt-icon-btn" type="button" data-wdgt-toggle-console title="${escapeHtml(state.consoleCollapsed ? copy.consoleOpen : copy.consoleClose)}">
                  ${icon(state.consoleCollapsed ? 'tabler:chevron-up' : 'tabler:chevron-down', 17)}
                </button>
                <button class="wdgt-icon-btn" type="button" data-wdgt-clear title="Clear console">${icon('tabler:trash', 17)}</button>
              </div>
            </header>
            <div class="wdgt-console-output" data-wdgt-console-output></div>
          </section>
        </section>
      </div>`;

    renderExerciseList();
    bindEvents();
    updateLineNumbers();
    runPreview(false);
  }

  function setMode(mode) {
    state.mode = mode;
    if (!['interview', 'api'].includes(mode)) {
      state.exerciseId = exercises.find(item => item.mode === mode)?.id || exercises[0].id;
      state.category = 'all';
      state.search = '';
    } else if (!state.interviewStartedAt) {
      state.interviewStartedAt = Date.now();
    }
    saveState();
    renderApp();
  }

  function renderApiLab(root) {
    root.innerHTML = `
      <header class="wdgt-toolbar">
        <div class="wdgt-modes" role="tablist" aria-label="${escapeHtml(copy.title)}">
          ${trainerModes.map(mode => `
            <button type="button" data-wdgt-mode="${mode}" class="${state.mode === mode ? 'active' : ''}">
              ${escapeHtml(modeLabel(mode))}
            </button>`).join('')}
        </div>
        <div class="wdgt-actions">
          <span class="wdgt-save">${icon('tabler:database', 15)} ${escapeHtml(copy.saved)}</span>
        </div>
      </header>
      <div class="wdgt-api-view" data-wdgt-api-view></div>`;
    root.querySelectorAll('[data-wdgt-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.wdgtMode)));
    window.WebDevGymApiLab?.render?.(root.querySelector('[data-wdgt-api-view]'), {
      activity(amount) { api?.logActivity?.(amount); }
    });
  }

  function interviewPool() {
    return state.interviewCategory === 'all'
      ? interviewQuestions
      : interviewQuestions.filter(item => item.category === state.interviewCategory);
  }

  function formatInterviewTime() {
    const seconds = state.interviewStartedAt
      ? Math.max(0, Math.floor((Date.now() - state.interviewStartedAt) / 1000))
      : 0;
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function renderInterview(root) {
    const categories = ['all', ...new Set(interviewQuestions.map(item => item.category))];
    let pool = interviewPool();
    if (!pool.some(item => item.id === state.interviewQuestionId)) {
      state.interviewQuestionId = pool[0]?.id || interviewQuestions[0].id;
    }
    const question = pool.find(item => item.id === state.interviewQuestionId) || pool[0];
    const questionIndex = Math.max(0, pool.findIndex(item => item.id === question.id));
    const ratings = Object.values(state.interviewRatings || {});
    const answered = Object.values(state.interviewAnswers || {}).filter(value => String(value).trim()).length;
    const confident = ratings.filter(value => value === 'know').length;
    const rating = state.interviewRatings[question.id] || '';

    root.innerHTML = `
      <header class="wdgt-toolbar">
        <div class="wdgt-modes" role="tablist" aria-label="${escapeHtml(copy.title)}">
          ${trainerModes.map(mode => `
            <button type="button" data-wdgt-mode="${mode}" class="${state.mode === mode ? 'active' : ''}">
              ${escapeHtml(modeLabel(mode))}
            </button>`).join('')}
        </div>
        <div class="wdgt-interview-stats" aria-label="${escapeHtml(copy.interviewTitle)}">
          <span>${icon('tabler:clock', 15)} <strong data-wdgt-interview-time>${formatInterviewTime()}</strong></span>
          <span>${answered}/${interviewQuestions.length} ${escapeHtml(copy.answered)}</span>
          <span>${confident} ${escapeHtml(copy.confident)}</span>
          <button class="wdgt-btn" type="button" data-wdgt-interview-reset>${icon('tabler:refresh', 15)} ${escapeHtml(copy.resetSession)}</button>
        </div>
      </header>
      <div class="wdgt-interview">
        <aside class="wdgt-interview-rail">
          <header>
            <div><span class="wdgt-kicker">${escapeHtml(copy.interview)}</span><h2>${escapeHtml(copy.interviewQuestions)}</h2></div>
            <strong>${questionIndex + 1}/${pool.length}</strong>
          </header>
          <div class="wdgt-interview-categories">
            ${categories.map(category => `<button type="button" data-wdgt-interview-category="${escapeHtml(category)}" class="${state.interviewCategory === category ? 'active' : ''}">${escapeHtml(category === 'all' ? copy.all : category)}</button>`).join('')}
          </div>
          <div class="wdgt-interview-list">
            ${pool.map((item, index) => {
              const itemRating = state.interviewRatings[item.id] || '';
              return `<button type="button" data-wdgt-interview-question="${item.id}" class="${item.id === question.id ? 'active' : ''}">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${escapeHtml(item.question)}</strong>
                <i class="${itemRating}" title="${escapeHtml(itemRating || copy.yourAnswer)}"></i>
              </button>`;
            }).join('')}
          </div>
        </aside>
        <main class="wdgt-interview-main">
          <header class="wdgt-interview-heading">
            <div>
              <span class="wdgt-kicker">${escapeHtml(question.category)} &middot; ${questionIndex + 1}/${pool.length}</span>
              <h2>${escapeHtml(question.question)}</h2>
              <p>${escapeHtml(copy.interviewSubtitle)}</p>
            </div>
          </header>
          <section class="wdgt-answer-card">
            <label for="wdgtInterviewAnswer">${escapeHtml(copy.yourAnswer)}</label>
            <textarea id="wdgtInterviewAnswer" data-wdgt-interview-answer placeholder="${escapeHtml(copy.answerPlaceholder)}">${escapeHtml(state.interviewAnswers[question.id] || '')}</textarea>
            <button class="wdgt-btn primary" type="button" data-wdgt-interview-reveal>
              ${icon(state.interviewReveal ? 'tabler:eye-off' : 'tabler:eye', 16)} ${escapeHtml(state.interviewReveal ? copy.hideAnswer : copy.showAnswer)}
            </button>
          </section>
          <section class="wdgt-reference" ${state.interviewReveal ? '' : 'hidden'}>
            <span>${icon('tabler:message-check', 18)}</span>
            <div><strong>${escapeHtml(copy.referenceAnswer)}</strong><p>${escapeHtml(question.answer)}</p></div>
          </section>
          <section class="wdgt-self-rating">
            <strong>${escapeHtml(copy.rateAnswer)}</strong>
            <div>
              <button type="button" data-wdgt-interview-rating="again" class="${rating === 'again' ? 'active again' : ''}">${icon('tabler:repeat', 16)} ${escapeHtml(copy.again)}</button>
              <button type="button" data-wdgt-interview-rating="partial" class="${rating === 'partial' ? 'active partial' : ''}">${icon('tabler:circle-half-2', 16)} ${escapeHtml(copy.partial)}</button>
              <button type="button" data-wdgt-interview-rating="know" class="${rating === 'know' ? 'active know' : ''}">${icon('tabler:check', 16)} ${escapeHtml(copy.know)}</button>
            </div>
          </section>
          <footer class="wdgt-interview-nav">
            <button class="wdgt-btn" type="button" data-wdgt-interview-move="-1" ${questionIndex === 0 ? 'disabled' : ''}>${icon('tabler:arrow-left', 16)} ${escapeHtml(copy.previous)}</button>
            <button class="wdgt-btn primary" type="button" data-wdgt-interview-move="1" ${questionIndex === pool.length - 1 ? 'disabled' : ''}>${escapeHtml(copy.next)} ${icon('tabler:arrow-right', 16)}</button>
          </footer>
        </main>
      </div>`;

    root.querySelectorAll('[data-wdgt-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.wdgtMode)));
    root.querySelectorAll('[data-wdgt-interview-category]').forEach(button => button.addEventListener('click', () => {
      state.interviewCategory = button.dataset.wdgtInterviewCategory;
      state.interviewQuestionId = interviewQuestions.find(item => state.interviewCategory === 'all' || item.category === state.interviewCategory)?.id || interviewQuestions[0].id;
      state.interviewReveal = false;
      saveState();
      renderApp();
    }));
    root.querySelectorAll('[data-wdgt-interview-question]').forEach(button => button.addEventListener('click', () => {
      state.interviewQuestionId = button.dataset.wdgtInterviewQuestion;
      state.interviewReveal = false;
      saveState();
      renderApp();
    }));
    root.querySelector('[data-wdgt-interview-answer]')?.addEventListener('input', event => {
      state.interviewAnswers[question.id] = event.target.value;
      saveState();
    });
    root.querySelector('[data-wdgt-interview-reveal]')?.addEventListener('click', () => {
      state.interviewReveal = !state.interviewReveal;
      saveState();
      renderApp();
    });
    root.querySelectorAll('[data-wdgt-interview-rating]').forEach(button => button.addEventListener('click', () => {
      state.interviewRatings[question.id] = button.dataset.wdgtInterviewRating;
      saveState();
      renderApp();
    }));
    root.querySelectorAll('[data-wdgt-interview-move]').forEach(button => button.addEventListener('click', () => {
      const nextIndex = Math.min(pool.length - 1, Math.max(0, questionIndex + Number(button.dataset.wdgtInterviewMove)));
      state.interviewQuestionId = pool[nextIndex].id;
      state.interviewReveal = false;
      saveState();
      renderApp();
    }));
    root.querySelector('[data-wdgt-interview-reset]')?.addEventListener('click', () => {
      state.interviewAnswers = {};
      state.interviewRatings = {};
      state.interviewReveal = false;
      state.interviewStartedAt = Date.now();
      saveState();
      renderApp();
    });
    if (!state.interviewStartedAt) state.interviewStartedAt = Date.now();
    interviewTimer = setInterval(() => {
      const timer = root.querySelector('[data-wdgt-interview-time]');
      if (timer) timer.textContent = formatInterviewTime();
    }, 1000);
  }

  function renderExerciseList() {
    const list = page.querySelector('[data-wdgt-exercise-list]');
    if (!list) return;
    const items = filteredExercises();
    list.innerHTML = items.length ? items.map(item => `
      <button type="button" data-wdgt-exercise="${item.id}" class="${item.id === currentExercise().id ? 'active' : ''}">
        <span>
          <strong>${escapeHtml(item.short)}</strong>
          <small>${escapeHtml(categoryLabel(item.category))}</small>
        </span>
        <em class="${item.level}">${escapeHtml(levelLabel(item.level))}</em>
      </button>`).join('') : `<p class="wdgt-empty">${escapeHtml(copy.empty)}</p>`;
    list.querySelectorAll('[data-wdgt-exercise]').forEach(button => {
      button.addEventListener('click', () => {
        state.exerciseId = button.dataset.wdgtExercise;
        state.file = 'js';
        saveState();
        renderApp();
      });
    });
  }

  function bindEvents() {
    page.querySelectorAll('[data-wdgt-mode]').forEach(button => {
      button.addEventListener('click', () => setMode(button.dataset.wdgtMode));
    });
    page.querySelectorAll('[data-wdgt-category]').forEach(button => {
      button.addEventListener('click', () => {
        state.category = button.dataset.wdgtCategory;
        saveState();
        page.querySelectorAll('[data-wdgt-category]').forEach(item => item.classList.toggle('active', item === button));
        renderExerciseList();
      });
    });

    const search = page.querySelector('[data-wdgt-search]');
    search?.addEventListener('input', () => {
      state.search = search.value;
      saveState();
      renderExerciseList();
    });
    page.querySelector('[data-wdgt-focus-search]')?.addEventListener('click', () => search?.focus());
    page.querySelectorAll('[data-wdgt-collapse-rail]').forEach(button => {
      button.addEventListener('click', () => {
        state.railCollapsed = !state.railCollapsed;
        saveState();
        page.querySelector('[data-wdgt-app]')?.classList.toggle('rail-collapsed', state.railCollapsed);
      });
    });
    page.querySelectorAll('[data-wdgt-file]').forEach(button => {
      button.addEventListener('click', () => {
        state.file = button.dataset.wdgtFile;
        saveState();
        renderApp();
      });
    });

    const editor = page.querySelector('[data-wdgt-code]');
    editor?.addEventListener('input', () => {
      setDraft(currentExercise(), state.file, editor.value);
      updateLineNumbers();
    });
    editor?.addEventListener('scroll', () => {
      const lines = page.querySelector('[data-wdgt-lines]');
      if (lines) lines.scrollTop = editor.scrollTop;
    });
    editor?.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const start = editor.selectionStart;
        editor.setRangeText('  ', start, editor.selectionEnd, 'end');
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runPreview(true);
      }
    });

    page.querySelectorAll('[data-wdgt-run]').forEach(button => button.addEventListener('click', () => runPreview(true)));
    page.querySelector('[data-wdgt-refresh]')?.addEventListener('click', () => runPreview(true));
    page.querySelector('[data-wdgt-new]')?.addEventListener('click', () => {
      const exercise = currentExercise();
      delete state.drafts[exercise.id];
      saveState();
      renderApp();
      appendLog(copy.codeReset, 'info');
    });
    page.querySelector('[data-wdgt-hint]')?.addEventListener('click', event => {
      const panel = page.querySelector('[data-wdgt-hint-panel]');
      if (!panel) return;
      panel.hidden = !panel.hidden;
      event.currentTarget.innerHTML = icon('tabler:bulb', 16) + ' ' +
        escapeHtml(panel.hidden ? copy.hint : copy.hideHint);
    });
    page.querySelectorAll('[data-wdgt-device]').forEach(button => {
      button.addEventListener('click', () => {
        state.device = button.dataset.wdgtDevice;
        saveState();
        const frame = page.querySelector('[data-wdgt-frame]');
        if (frame) frame.dataset.device = state.device;
        page.querySelectorAll('[data-wdgt-device]').forEach(item => item.classList.toggle('active', item === button));
      });
    });
    page.querySelector('[data-wdgt-clear]')?.addEventListener('click', () => {
      const output = page.querySelector('[data-wdgt-console-output]');
      if (output) output.innerHTML = '';
      updateProblems(0);
    });
    page.querySelector('[data-wdgt-toggle-console]')?.addEventListener('click', () => {
      state.consoleCollapsed = !state.consoleCollapsed;
      saveState();
      page.querySelector('[data-wdgt-app]')?.classList.toggle('console-collapsed', state.consoleCollapsed);
      renderConsoleToggle();
    });
    bindSplitters();
  }

  function updateLineNumbers() {
    const editor = page?.querySelector('[data-wdgt-code]');
    const lines = page?.querySelector('[data-wdgt-lines]');
    if (!editor || !lines) return;
    const count = Math.max(1, editor.value.split('\n').length);
    lines.textContent = Array.from({ length: count }, (_, index) => index + 1).join('\n');
  }

  function updateSaveStatus() {
    const status = page?.querySelector('[data-wdgt-save]');
    if (status) status.innerHTML = icon('tabler:cloud-check', 15) + ' ' + escapeHtml(copy.saved);
  }

  function renderConsoleToggle() {
    const button = page?.querySelector('[data-wdgt-toggle-console]');
    if (!button) return;
    button.title = state.consoleCollapsed ? copy.consoleOpen : copy.consoleClose;
    button.innerHTML = icon(state.consoleCollapsed ? 'tabler:chevron-up' : 'tabler:chevron-down', 17);
  }

  function appendLog(message, type = 'info') {
    const output = page?.querySelector('[data-wdgt-console-output]');
    if (!output) return;
    const line = document.createElement('p');
    line.className = type;
    const time = new Date().toLocaleTimeString(isEnglish ? 'en-GB' : 'ru-RU', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    line.innerHTML = `<time>${time}</time><span>[${escapeHtml(type)}]</span><code>${escapeHtml(message)}</code>`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function updateProblems(count) {
    const badge = page?.querySelector('[data-wdgt-problem-count]');
    if (badge) badge.textContent = String(count);
  }

  function previewDocument(files) {
    const bridge = `<script>
      (() => {
        const send = (type, values) => parent.postMessage({
          channel: '${CHANNEL}',
          type,
          values: values.map(value => {
            try { return typeof value === 'string' ? value : JSON.stringify(value); }
            catch (error) { return String(value); }
          })
        }, '*');
        ['log', 'warn', 'error'].forEach(type => {
          const original = console[type];
          console[type] = (...values) => { send(type, values); original(...values); };
        });
        window.addEventListener('error', event => send('error', [event.message]));
      })();
    <\/script>`;
    const script = `<script>${files.js || ''}\n//# sourceURL=webdevgym-trainer.js<\/script>`;
    const style = `<style>${files.css || ''}</style>`;
    const html = files.html || '';
    if (/<html[\s>]/i.test(html)) {
      return html
        .replace(/<\/head>/i, style + bridge + '</head>')
        .replace(/<\/body>/i, script + '</body>');
    }
    return `<!doctype html><html lang="${isEnglish ? 'en' : 'ru'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${style}${bridge}</head><body>${html}${script}</body></html>`;
  }

  function runPreview(trackActivity = false) {
    previewFrame = page?.querySelector('[data-wdgt-frame]');
    if (!previewFrame) return;
    const output = page.querySelector('[data-wdgt-console-output]');
    if (output) output.innerHTML = '';
    updateProblems(0);
    appendLog(copy.previewStarted, 'info');
    if (messageHandler) window.removeEventListener('message', messageHandler);
    messageHandler = event => {
      if (event.source !== previewFrame.contentWindow || event.data?.channel !== CHANNEL) return;
      const type = event.data.type === 'error' ? 'error' : event.data.type === 'warn' ? 'warn' : 'log';
      appendLog((event.data.values || []).join(' '), type);
      if (type === 'error') updateProblems(Number(page.querySelector('[data-wdgt-problem-count]')?.textContent || 0) + 1);
    };
    window.addEventListener('message', messageHandler);
    previewFrame.srcdoc = previewDocument(filesFor(currentExercise()));
    appendLog(copy.ready, 'success');
    if (trackActivity) api?.logActivity?.(1);
  }

  function bindSplitters() {
    dragCleanup?.();
    const app = page.querySelector('[data-wdgt-app]');
    const horizontal = page.querySelector('[data-wdgt-resize-x]');
    const splitterX = page.querySelector('[data-wdgt-splitter-x]');
    const splitterY = page.querySelector('[data-wdgt-splitter-y]');
    const stage = page.querySelector('.wdgt-stage');
    const cleanups = [];
    function bindDrag(handle, onMove) {
      const onPointerDown = event => {
        if (matchMedia('(max-width: 900px)').matches) return;
        event.preventDefault();
        document.body.classList.add('wdgt-resizing');
        const move = moveEvent => onMove(moveEvent);
        const up = () => {
          document.body.classList.remove('wdgt-resizing');
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          saveState();
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up, { once: true });
      };
      handle?.addEventListener('pointerdown', onPointerDown);
      cleanups.push(() => handle?.removeEventListener('pointerdown', onPointerDown));
    }
    bindDrag(splitterX, event => {
      if (!horizontal) return;
      const rect = horizontal.getBoundingClientRect();
      state.split = Math.min(76, Math.max(38, (event.clientX - rect.left) / rect.width * 100));
      app.style.setProperty('--wdgt-split', state.split + '%');
    });
    bindDrag(splitterY, event => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      state.consoleHeight = Math.min(320, Math.max(108, rect.bottom - event.clientY));
      app.style.setProperty('--wdgt-console-height', state.consoleHeight + 'px');
    });
    dragCleanup = () => cleanups.forEach(cleanup => cleanup());
  }

  function updateNavigation() {
    const button = document.getElementById('wdglNavBtn');
    if (!button) return;
    button.innerHTML = icon('tabler:barbell', 19) + '<span>' + escapeHtml(copy.title) + '</span>';
    button.title = copy.title;
    button.setAttribute('aria-label', copy.title);
  }

  function init() {
    api = window.WebDevGymFeatures;
    if (!api || typeof api.register !== 'function') {
      setTimeout(init, 60);
      return;
    }
    api.register('lab', renderPage, {
      title: copy.title,
      icon: 'tabler:barbell',
      group: L('Tools', 'Инструменты')
    });
    updateNavigation();
    setTimeout(updateNavigation, 300);
    window.WebDevGymTrainers = {
      open() { api.open('lab'); },
      openInterview() {
        state.mode = 'interview';
        if (!state.interviewStartedAt) state.interviewStartedAt = Date.now();
        saveState();
        api.open('lab');
        setTimeout(() => page?.classList.contains('open') && renderApp(), 0);
      },
      run: runPreview,
      reset() {
        delete state.drafts[currentExercise().id];
        saveState();
        if (page?.classList.contains('open')) renderApp();
      }
    };
  }

  window.addEventListener('beforeunload', () => {
    if (messageHandler) window.removeEventListener('message', messageHandler);
    clearInterval(interviewTimer);
    dragCleanup?.();
  });
  window.addEventListener('wdg:open-interview', () => {
    state.mode = 'interview';
    if (!state.interviewStartedAt) state.interviewStartedAt = Date.now();
    saveState();
    if (api) {
      api.open('lab');
      setTimeout(() => page?.classList.contains('open') && renderApp(), 0);
    }
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 140));
  } else {
    setTimeout(init, 140);
  }
})();
