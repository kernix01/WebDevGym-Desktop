(function () {
  'use strict';

  const text = (ru, en) => ({ ru, en });
  const article = (id, category, title, summary, body, points, code, language, tags) => ({
    id, category, title, summary, body, points, code, language, tags
  });

  const categories = [
    { id: 'html', label: text('HTML', 'HTML'), icon: 'brand-html5' },
    { id: 'css', label: text('CSS', 'CSS'), icon: 'brand-css3' },
    { id: 'javascript', label: text('JavaScript', 'JavaScript'), icon: 'brand-javascript' },
    { id: 'dom', label: text('DOM и браузер', 'DOM and browser'), icon: 'browser' },
    { id: 'git', label: text('Git', 'Git'), icon: 'brand-git' },
    { id: 'npm', label: text('npm', 'npm'), icon: 'brand-npm' }
  ];

  const articles = [
    article(
      'html-document', 'html', text('Каркас HTML-документа', 'HTML document structure'),
      text('Минимальная правильная структура страницы и назначение основных элементов.', 'A minimal valid page structure and the purpose of its core elements.'),
      text('DOCTYPE включает современный режим браузера. В head находятся метаданные и подключения ресурсов, а видимое содержимое страницы размещается в body.', 'DOCTYPE enables standards mode. The head contains metadata and resource links, while visible page content belongs in the body.'),
      [text('Указывай lang для языка страницы.', 'Set lang to the page language.'), text('Подключай скрипты с defer, если они работают с DOM.', 'Use defer for scripts that work with the DOM.'), text('Viewport нужен для корректного мобильного масштаба.', 'Viewport metadata keeps mobile scaling correct.')],
      `<!doctype html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Проект</title>\n  <link rel="stylesheet" href="style.css">\n  <script src="script.js" defer></script>\n</head>\n<body>\n  <main></main>\n</body>\n</html>`,
      'html', ['doctype', 'head', 'body', 'defer', 'viewport']
    ),
    article(
      'html-semantics', 'html', text('Семантическая разметка', 'Semantic markup'),
      text('Как выбирать элементы по смыслу, а не по внешнему виду.', 'Choose elements by meaning rather than appearance.'),
      text('Семантические элементы описывают структуру документа браузеру, поисковым системам и вспомогательным технологиям. div остаётся полезным контейнером, когда специального смысла нет.', 'Semantic elements describe document structure to browsers, search engines, and assistive technology. A div remains useful when no specific meaning applies.'),
      [text('main используется один раз для основного содержимого.', 'Use main once for the primary content.'), text('button выполняет действие, a ведёт по адресу.', 'A button performs an action; an anchor navigates.'), text('Заголовки образуют понятную иерархию.', 'Headings should form a clear hierarchy.')],
      `<header>\n  <nav aria-label="Главная навигация">...</nav>\n</header>\n<main>\n  <article>\n    <h1>Название</h1>\n    <section aria-labelledby="details">\n      <h2 id="details">Подробности</h2>\n    </section>\n  </article>\n</main>`,
      'html', ['header', 'main', 'section', 'article', 'nav', 'button', 'accessibility']
    ),
    article(
      'html-forms', 'html', text('Формы и проверка ввода', 'Forms and input validation'),
      text('Связь label с input, submit и встроенная проверка браузера.', 'Connect labels to inputs and use submit plus built-in browser validation.'),
      text('Форма объединяет поля и отправляется событием submit. Обработчик submit работает и при клике по кнопке, и при нажатии Enter.', 'A form groups fields and emits submit. A submit handler works both for button clicks and the Enter key.'),
      [text('Связывай label и input через for и id.', 'Connect label and input using for and id.'), text('Используй подходящий type: email, number, date.', 'Choose the correct type: email, number, date.'), text('После успешного добавления данных можно вызвать form.reset().', 'Call form.reset() after successful data entry.')],
      `<form id="task-form">\n  <label for="task">Задача</label>\n  <input id="task" name="task" required minlength="2">\n  <button type="submit">Добавить</button>\n</form>`,
      'html', ['form', 'input', 'label', 'submit', 'required', 'reset']
    ),
    article(
      'css-box-model', 'css', text('Блочная модель', 'Box model'),
      text('Как content, padding, border и margin формируют размер элемента.', 'How content, padding, border, and margin determine element size.'),
      text('При box-sizing: border-box заданная ширина включает padding и border. Это делает размеры компонентов предсказуемыми.', 'With box-sizing: border-box, declared width includes padding and border, making component sizes predictable.'),
      [text('Padding находится внутри границы.', 'Padding sits inside the border.'), text('Margin создаёт внешнее расстояние.', 'Margin creates outer spacing.'), text('Не используй фиксированную высоту для текста без необходимости.', 'Avoid fixed heights for text unless necessary.')],
      `*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n.panel {\n  width: min(100%, 720px);\n  padding: 16px;\n  border: 1px solid #334155;\n  margin-inline: auto;\n}`,
      'css', ['box-sizing', 'padding', 'margin', 'border', 'width']
    ),
    article(
      'css-flex-grid', 'css', text('Flexbox и Grid', 'Flexbox and Grid'),
      text('Когда использовать одномерную и двумерную раскладку.', 'When to use one-dimensional and two-dimensional layout.'),
      text('Flexbox удобен для строки или колонки элементов. Grid лучше подходит для сетки, где одновременно важны строки и столбцы.', 'Flexbox is ideal for a row or column of items. Grid fits layouts where rows and columns matter together.'),
      [text('gap задаёт расстояние без лишних margin.', 'gap adds spacing without extra margins.'), text('minmax(0, 1fr) не даёт контенту раздвигать колонку.', 'minmax(0, 1fr) prevents content from forcing a track wider.'), text('flex-wrap переносит элементы при нехватке места.', 'flex-wrap moves items when space runs out.')],
      `.toolbar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n.layout {\n  display: grid;\n  grid-template-columns: 240px minmax(0, 1fr);\n  gap: 16px;\n}`,
      'css', ['flex', 'grid', 'gap', 'minmax', 'layout']
    ),
    article(
      'css-responsive', 'css', text('Адаптивная вёрстка', 'Responsive layout'),
      text('Гибкие размеры, медиазапросы и контроль переполнения.', 'Fluid sizing, media queries, and overflow control.'),
      text('Сначала компоненты должны уметь сжиматься сами. Медиазапрос нужен тогда, когда композиция действительно перестаёт работать.', 'Components should first be able to shrink naturally. Add a media query when the composition truly stops working.'),
      [text('Добавляй min-width: 0 детям Grid и Flex.', 'Add min-width: 0 to Grid and Flex children.'), text('Используй max-width и width: 100% для медиа.', 'Use max-width and width: 100% for media.'), text('Проверяй длинный текст и узкие экраны.', 'Test long text and narrow screens.')],
      `.card {\n  width: min(100%, 680px);\n}\n\n.card img {\n  display: block;\n  width: 100%;\n  height: auto;\n}\n\n@media (max-width: 720px) {\n  .layout { grid-template-columns: 1fr; }\n}`,
      'css', ['responsive', 'media query', 'overflow', 'mobile', 'min-width']
    ),
    article(
      'javascript-values', 'javascript', text('Переменные и значения', 'Variables and values'),
      text('Разница между значением, переменной и присваиванием.', 'The difference between a value, a variable, and assignment.'),
      text('Переменная хранит значение под именем. Оператор = вычисляет выражение справа и сохраняет результат в переменную слева.', 'A variable stores a value under a name. The = operator evaluates the right side and stores its result in the variable on the left.'),
      [text('const запрещает повторное присваивание переменной.', 'const prevents reassignment.'), text('let используй, когда значение будет меняться.', 'Use let when the value must change.'), text('+= сначала складывает, затем сохраняет новый результат.', '+= adds first, then stores the new result.')],
      `const start = 5;\nlet count = start;\n\ncount += 1;\nconsole.log(count); // 6`,
      'javascript', ['const', 'let', 'assignment', 'value', 'operator']
    ),
    article(
      'javascript-functions', 'javascript', text('Функции и return', 'Functions and return'),
      text('Что функция получает, читает, изменяет и возвращает.', 'What a function receives, reads, changes, and returns.'),
      text('Параметры передают данные внутрь функции. return завершает функцию и отдаёт значение месту вызова. Функция может менять интерфейс и ничего не возвращать.', 'Parameters pass data into a function. return ends the function and gives a value back to the call site. A function may update the interface and return nothing.'),
      [text('Аргумент — конкретное значение при вызове.', 'An argument is a concrete value passed at call time.'), text('Локальные переменные видны только внутри функции.', 'Local variables are visible only inside the function.'), text('Сохрани результат справа: const total = sum(2, 3).', 'Store a returned value on the left: const total = sum(2, 3).')],
      `function formatTime(seconds) {\n  const minutes = Math.floor(seconds / 60);\n  const rest = String(Math.floor(seconds % 60)).padStart(2, "0");\n  return \`\${minutes}:\${rest}\`;\n}\n\nconst label = formatTime(75); // "1:15"`,
      'javascript', ['function', 'parameter', 'argument', 'return', 'scope']
    ),
    article(
      'javascript-arrays', 'javascript', text('Массивы и методы', 'Arrays and methods'),
      text('Добавление, поиск, преобразование и фильтрация элементов.', 'Add, find, transform, and filter array items.'),
      text('Массив хранит упорядоченный список. Методы не взаимозаменяемы: forEach выполняет действие, map создаёт преобразованный массив, filter оставляет подходящие элементы.', 'An array stores an ordered list. Its methods serve different purposes: forEach performs an action, map creates a transformed array, and filter keeps matching items.'),
      [text('push добавляет элемент в конец массива.', 'push adds an item to the end.'), text('find возвращает первый найденный элемент.', 'find returns the first matching item.'), text('filter возвращает новый массив и не меняет старый.', 'filter returns a new array without changing the old one.')],
      `const tasks = [{ id: 1, done: false }, { id: 2, done: true }];\n\ntasks.push({ id: 3, done: false });\nconst openTasks = tasks.filter(task => !task.done);\nconst taskIds = tasks.map(task => task.id);`,
      'javascript', ['array', 'push', 'forEach', 'map', 'filter', 'find']
    ),
    article(
      'javascript-async', 'javascript', text('Promise, async и await', 'Promises, async, and await'),
      text('Как дождаться асинхронной операции и обработать ошибку.', 'Wait for asynchronous work and handle failures.'),
      text('Promise представляет результат, который появится позже. await приостанавливает только текущую async-функцию, не замораживая весь интерфейс.', 'A Promise represents a result that will arrive later. await pauses only the current async function without freezing the entire interface.'),
      [text('Проверяй response.ok перед чтением данных.', 'Check response.ok before reading data.'), text('Используй try/catch для сетевых и других ошибок.', 'Use try/catch for network and other failures.'), text('Показывай пользователю загрузку и ошибку.', 'Expose loading and error states to the user.')],
      `async function loadRates() {\n  try {\n    const response = await fetch("/api/rates");\n    if (!response.ok) throw new Error("Request failed");\n    return await response.json();\n  } catch (error) {\n    console.error(error);\n    return null;\n  }\n}`,
      'javascript', ['promise', 'async', 'await', 'fetch', 'try', 'catch']
    ),
    article(
      'dom-select-update', 'dom', text('Поиск и обновление элементов', 'Selecting and updating elements'),
      text('querySelector, textContent, classList и свойства элементов.', 'querySelector, textContent, classList, and element properties.'),
      text('querySelector возвращает первый подходящий элемент или null. После получения ссылки можно менять текст, классы, атрибуты и свойства конкретного DOM-объекта.', 'querySelector returns the first matching element or null. Once referenced, that DOM object can have its text, classes, attributes, and properties updated.'),
      [text('Для id используй селектор #id.', 'Use #id to select an id.'), text('textContent безопасно записывает обычный текст.', 'textContent safely writes plain text.'), text('classList.toggle переключает класс.', 'classList.toggle switches a class on or off.')],
      `const title = document.querySelector("#title");\nconst button = document.querySelector("#toggle");\n\ntitle.textContent = "Готово";\nbutton.disabled = false;\ntitle.classList.add("is-ready");`,
      'javascript', ['dom', 'querySelector', 'textContent', 'classList', 'disabled']
    ),
    article(
      'dom-events', 'dom', text('События и callback', 'Events and callbacks'),
      text('Кто хранит callback и когда он вызывается.', 'Who stores a callback and when it runs.'),
      text('addEventListener получает тип события и функцию. Браузер сохраняет эту функцию и вызывает её позже, когда событие произойдёт.', 'addEventListener receives an event type and a function. The browser stores that function and calls it later when the event occurs.'),
      [text('Передавай функцию без круглых скобок, если её нужно вызвать позже.', 'Pass a function without parentheses when it should run later.'), text('event содержит данные произошедшего события.', 'event contains information about what happened.'), text('preventDefault отменяет стандартное действие браузера.', 'preventDefault cancels the browser default action.')],
      `function handleSubmit(event) {\n  event.preventDefault();\n  console.log("Форма отправлена");\n}\n\nconst form = document.querySelector("#task-form");\nform.addEventListener("submit", handleSubmit);`,
      'javascript', ['event', 'callback', 'addEventListener', 'click', 'submit']
    ),
    article(
      'dom-render-list', 'dom', text('Отрисовка списка из массива', 'Rendering a list from an array'),
      text('Преобразование данных в DOM-элементы без дублирования.', 'Turn data into DOM elements without duplicates.'),
      text('Состояние хранится в массиве, а render-функция создаёт интерфейс из текущего состояния. Перед полной перерисовкой старое содержимое очищается.', 'State lives in an array, and a render function creates the interface from current state. Clear old content before a full render.'),
      [text('forEach вызывает callback один раз для каждого элемента.', 'forEach calls its callback once per item.'), text('append добавляет готовый элемент в родителя.', 'append adds the completed element to its parent.'), text('После изменения массива снова вызывай render.', 'Call render again after changing the array.')],
      `function renderTasks() {\n  taskList.replaceChildren();\n\n  tasks.forEach(task => {\n    const item = document.createElement("li");\n    item.textContent = task.title;\n    taskList.append(item);\n  });\n}`,
      'javascript', ['render', 'createElement', 'append', 'replaceChildren', 'forEach']
    ),
    article(
      'dom-storage', 'dom', text('localStorage и JSON', 'localStorage and JSON'),
      text('Сохранение состояния между перезагрузками страницы.', 'Persist state across page reloads.'),
      text('localStorage хранит только строки. Объекты и массивы перед сохранением превращают в JSON, а после чтения разбирают обратно.', 'localStorage stores strings only. Convert objects and arrays to JSON before saving and parse them after reading.'),
      [text('Используй стабильный понятный ключ.', 'Use a stable descriptive key.'), text('Добавляй запасное значение, если данных ещё нет.', 'Provide a fallback when no data exists yet.'), text('Сохраняй после каждого изменения состояния.', 'Save after every state change.')],
      `let tasks = JSON.parse(localStorage.getItem("backlog-tasks")) || [];\n\nfunction saveTasks() {\n  localStorage.setItem("backlog-tasks", JSON.stringify(tasks));\n}`,
      'javascript', ['localStorage', 'json', 'stringify', 'parse', 'storage']
    ),
    article(
      'git-workflow', 'git', text('status, add и commit', 'status, add, and commit'),
      text('Базовый цикл фиксации выбранных изменений.', 'The basic cycle for recording selected changes.'),
      text('status показывает состояние рабочей папки. add подготавливает выбранные изменения, а commit сохраняет только подготовленный снимок в историю.', 'status shows the working tree state. add stages selected changes, and commit records only the staged snapshot in history.'),
      [text('Сначала прочитай diff, затем добавляй файл.', 'Read the diff before staging a file.'), text('Один коммит должен описывать одно связное изменение.', 'One commit should describe one coherent change.'), text('Сообщение объясняет результат, а не процесс набора кода.', 'A message should describe the result, not the typing process.')],
      `git status\ngit diff\ngit add src/app.js\ngit diff --staged\ngit commit -m "Add task filtering"`,
      'shell', ['git', 'status', 'add', 'stage', 'commit', 'diff']
    ),
    article(
      'git-branches', 'git', text('Ветки и слияние', 'Branches and merging'),
      text('Изоляция задачи в отдельной ветке и перенос результата.', 'Isolate work in a branch and merge the result.'),
      text('Ветка позволяет вести изменение отдельно от основной линии. Перед слиянием проверь статус, тесты и актуальность основной ветки.', 'A branch keeps work separate from the main line. Before merging, verify status, tests, and the current main branch.'),
      [text('Давай ветке короткое имя по задаче.', 'Give the branch a short task-oriented name.'), text('Не переключай ветку с забытыми изменениями.', 'Do not switch branches with forgotten changes.'), text('Конфликт решается вручную и завершается новым коммитом.', 'Resolve conflicts manually and finish with a new commit.')],
      `git switch -c feature/task-filter\n# работа и коммиты\ngit switch main\ngit merge feature/task-filter`,
      'shell', ['git', 'branch', 'switch', 'merge', 'conflict']
    ),
    article(
      'git-undo', 'git', text('Безопасная отмена', 'Safe undo'),
      text('Как отменять изменения без случайной потери всей работы.', 'Undo changes without accidentally losing all work.'),
      text('Перед отменой всегда смотри status и diff. restore меняет файлы рабочего дерева, поэтому несохранённый код можно потерять. revert безопаснее для уже опубликованных коммитов.', 'Always inspect status and diff before undoing. restore changes working-tree files, so uncommitted code can be lost. revert is safer for published commits.'),
      [text('git restore --staged снимает файл со staging.', 'git restore --staged removes a file from staging.'), text('git revert создаёт обратный коммит.', 'git revert creates a reversing commit.'), text('Не используй reset --hard без резервной точки.', 'Do not use reset --hard without a recovery point.')],
      `git restore --staged src/app.js\ngit restore src/app.js\ngit revert <commit-hash>`,
      'shell', ['git', 'undo', 'restore', 'revert', 'reset', 'staged']
    ),
    article(
      'npm-package', 'npm', text('package.json и scripts', 'package.json and scripts'),
      text('Метаданные проекта и повторяемые команды.', 'Project metadata and repeatable commands.'),
      text('package.json описывает проект, зависимости и именованные scripts. Команда npm run ищет скрипт по имени и запускает его из корня проекта.', 'package.json describes the project, dependencies, and named scripts. npm run finds a script by name and runs it from the project root.'),
      [text('dev запускает разработку, build собирает релиз.', 'dev starts development; build creates a release.'), text('test должен возвращать ненулевой код при ошибке.', 'test should exit nonzero on failure.'), text('package-lock.json фиксирует точные версии дерева зависимостей.', 'package-lock.json pins exact dependency tree versions.')],
      `{\n  "name": "my-app",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "test": "vitest run"\n  }\n}`,
      'json', ['npm', 'package.json', 'scripts', 'dev', 'build', 'test']
    ),
    article(
      'npm-dependencies', 'npm', text('Установка зависимостей', 'Installing dependencies'),
      text('Обычные и dev-зависимости, удаление и воспроизводимая установка.', 'Runtime and development dependencies, removal, and reproducible installs.'),
      text('dependencies нужны приложению во время работы. devDependencies используются для разработки, проверки и сборки.', 'dependencies are required at runtime. devDependencies support development, validation, and builds.'),
      [text('Не редактируй node_modules вручную.', 'Do not edit node_modules manually.'), text('npm ci ставит версии строго из lock-файла.', 'npm ci installs exact versions from the lockfile.'), text('Проверяй документацию пакета перед добавлением.', 'Read package documentation before adding it.')],
      `npm install date-fns\nnpm install -D vitest\nnpm uninstall date-fns\nnpm ci`,
      'shell', ['npm', 'install', 'dependency', 'devDependency', 'node_modules', 'npm ci']
    )
  ];

  window.WebDevGymOfflineDocs = Object.freeze({ version: 1, categories, articles });
})();
