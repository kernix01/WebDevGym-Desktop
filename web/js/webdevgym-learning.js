(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname);
  const ui = isEnglish ? {
    understand:'Understand this topic', playground:'Open in Playground', close:'Close', what:'What this means', where:'Where to write it', steps:'Why this works', mistake:'Common mistake', task:'Try it yourself', source:'Example from the lesson', review:'Add to review', added:'Added to review', noCode:'This topic has no runnable code fragment yet. Use the task below as a starting point.',
    simple:'Explain simply', normal:'Full explanation', simpleTitle:'In plain words', solution:'Your solution', solutionPlaceholder:'Write your version here. The check runs only in this browser.', validate:'Check answer', saved:'Draft saved', taskDone:'The main idea is present. Now run it and test the result.', taskEmpty:'Write at least a small attempt first.', taskShort:'There is too little code to check yet. Add the main action from the task.', taskMissing:'You are close. Check whether the solution contains: ', bookmark:'Bookmark'
  } : {
    understand:'Разобрать тему', playground:'Открыть в Playground', close:'Закрыть', what:'Что это означает', where:'Куда это писать', steps:'Почему это работает', mistake:'Частая ошибка', task:'Попробуй сам', source:'Пример из темы', review:'Добавить в повторение', added:'Добавлено в повторение', noCode:'В этой теме пока нет запускаемого фрагмента. Используй задание ниже как точку старта.',
    simple:'Объяснить проще', normal:'Полное объяснение', simpleTitle:'Если совсем просто', solution:'Твоё решение', solutionPlaceholder:'Напиши свой вариант. Проверка работает только в этом браузере.', validate:'Проверить ответ', saved:'Черновик сохранён', taskDone:'Главная идея на месте. Теперь запусти код и проверь результат.', taskEmpty:'Сначала напиши хотя бы небольшую попытку.', taskShort:'Кода пока слишком мало для проверки. Добавь главное действие из задания.', taskMissing:'Ты близко. Проверь, есть ли в решении: ', bookmark:'В закладки'
  };

  let activeBlock = null;
  const TASKS_KEY = 'wdg_learning_tasks_v1';
  const SIMPLE_KEY = 'wdg_simple_explain_v1';

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 17) + '" height="' + (size || 17) + '"></iconify-icon>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  }

  function cleanTitle(block) {
    const title = block.querySelector('.block-title, h2, h3');
    if (!title) return isEnglish ? 'Learning topic' : 'Учебная тема';
    const clone = title.cloneNode(true);
    clone.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions').forEach(node => node.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function codeFrom(block) {
    const node = block.querySelector('.code, pre, .tool-output');
    return (node?.textContent || '').replace(/^\s+|\s+$/g, '').slice(0, 3500);
  }

  function sectionId(block) {
    return block.closest('.section')?.id.replace('sec-', '') || 'general';
  }

  function guide(summary, where, steps, mistake, task) {
    return { summary, where, steps, mistake, task };
  }

  function blockIdentity(block) {
    if (block.id) return block.id;
    const blocks = Array.from(block.closest('.section')?.querySelectorAll(':scope > .block') || []);
    return sectionId(block) + '-' + Math.max(0, blocks.indexOf(block));
  }

  function plainText(html) {
    const node = document.createElement('div');
    node.innerHTML = html || '';
    return node.textContent.replace(/\s+/g, ' ').trim();
  }

  function simpleSummary(data) {
    const first = plainText(data.guide.summary).split(/(?<=[.!?])\s+/)[0] || plainText(data.guide.summary);
    if (isEnglish) {
      return first + ' Find the input, the action and the result. Change one thing, run the code and see what changed.';
    }
    return first + ' Найди входные данные, действие и результат. Измени одну вещь, запусти код и посмотри, что поменялось.';
  }

  function validationRequirements(data) {
    const haystack = (data.title + '\n' + data.code + '\n' + plainText(data.guide.task)).toLowerCase();
    const checks = [];
    const add = (test, pattern, label) => { if (test.test(haystack)) checks.push({ pattern, label }); };

    add(/addeventlistener|событ|click|submit|input event/, /addEventListener\s*\(/i, 'addEventListener(...)');
    add(/preventdefault|отмен.*отправ|перезагруз/, /preventDefault\s*\(/i, 'preventDefault()');
    add(/queryselector|getelement|\bdom\b|textcontent|classlist/, /(querySelector|getElementById|getElementsByClassName)\s*\(/i, 'поиск DOM-элемента');
    add(/localstorage|setitem|getitem/, /localStorage\.(getItem|setItem)\s*\(/i, 'localStorage.getItem/setItem');
    add(/fetch\(|async|await|api/, /(fetch\s*\(|\bawait\b)/i, 'fetch(...) или await');
    add(/(^|\W)if(\W|$)|else|услов|===|!==|&&|\|\|/, /\bif\s*\(/i, 'if (...)');
    add(/function|функц|return|параметр/, /(function\s+\w+\s*\(|\([^)]*\)\s*=>|\w+\s*=>)/i, 'функция');
    add(/\.map\(|\.filter\(|\.reduce\(|массив|array/, /(\[[\s\S]*\]|\.map\s*\(|\.filter\s*\(|\.reduce\s*\()/i, 'массив или его метод');

    if (data.id === 'html') checks.push({ pattern:/<[a-z][^>]*>/i, label:'HTML-тег' });
    if (data.id === 'css') checks.push({ pattern:/[^{}]+\{[^{}]*:[^{}]*\}/s, label:'CSS-селектор и свойство' });
    if (data.id === 'ts') checks.push({ pattern:/(:\s*(string|number|boolean|unknown|[A-Z]\w*)|\b(interface|type)\s+\w+)/, label:'тип TypeScript' });
    if (data.id === 'react') checks.push({ pattern:/(return\s*\(|<[A-Z_a-z][^>]*>|useState\s*\()/i, label:'JSX или React state' });

    return checks.filter((check, index, list) => list.findIndex(item => item.label === check.label) === index).slice(0, 3);
  }

  function validateSolution(data, value) {
    const answer = String(value || '').trim();
    if (!answer) return { ok:false, message:ui.taskEmpty };
    if (answer.length < 18) return { ok:false, message:ui.taskShort };
    const missing = validationRequirements(data).filter(check => !check.pattern.test(answer));
    if (missing.length) return { ok:false, message:ui.taskMissing + missing.map(item => item.label).join(', ') };
    return { ok:true, message:ui.taskDone };
  }

  const rulesRu = [
    {
      test: /(^|\s)(if|else if|else|тернар|услов|===|!==|&&|\|\|)(\s|$)|age\s*[><=!]/i,
      make: () => guide(
        '<code>if</code> выбирает, какой блок кода выполнить. Выражение в круглых скобках должно дать <code>true</code> или <code>false</code>. Оператор <code>===</code> сравнивает одновременно значение и тип.',
        'Условие пишется внутри круглых скобок после <code>if</code> или <code>else if</code>: <code>if (age === 18)</code>. Один знак <code>=</code> присваивает значение переменной, поэтому для проверки он не подходит.',
        ['Сначала JavaScript вычисляет условие первого <code>if</code>.','Если получилось <code>true</code>, выполняется его блок и остальные ветки пропускаются.','Если получилось <code>false</code>, проверяется следующий <code>else if</code>.','<code>else</code> выполняется только тогда, когда все проверки выше дали <code>false</code>.'],
        'Путать <code>=</code> и <code>===</code>. Запись <code>age = 18</code> меняет age, а не спрашивает, равно ли оно 18. Ещё одна ловушка: <code>18 === "18"</code> даёт false, потому что number и string — разные типы.',
        'Создай переменную <code>score</code>. Если в ней 10 или больше — выведи «уровень пройден», если от 5 до 9 — «почти», иначе — «попробуй ещё». Потом проверь значения 3, 7 и 12.'
      )
    },
    {
      test: /let\s|const\s|var\s|переменн|типы данных|number|string|boolean/i,
      make: () => guide(
        'Переменная связывает имя со значением. <code>const</code> запрещает повторное присваивание этому имени, а <code>let</code> разрешает менять значение позже.',
        'Объявление обычно пишут в начале той области, где значение понадобится: над обработчиками событий, внутри функции или в верхней части файла. Не создавай глобальную переменную, если она нужна только одной функции.',
        ['Справа от <code>=</code> вычисляется значение.','Это значение сохраняется под именем слева.','При следующем обращении по имени JavaScript берёт текущее значение.'],
        'Объявлять одну и ту же переменную дважды через <code>let</code> или <code>const</code>, либо пытаться изменить <code>const</code> повторным присваиванием.',
        'Создай <code>const userName</code> и <code>let score</code>. Измени только score и выведи оба значения в консоль.'
      )
    },
    {
      test: /function\s|=>|функц|параметр|return|замыкан/i,
      make: () => guide(
        'Функция объединяет шаги под одним именем. Параметры принимают данные снаружи, а <code>return</code> возвращает результат туда, откуда функцию вызвали.',
        'Функцию можно объявить отдельно, а вызвать позже. Если она нужна только обработчику, допустимо передать стрелочную функцию прямо в <code>addEventListener</code>.',
        ['При вызове аргументы попадают в параметры.','Тело функции выполняется сверху вниз.','После <code>return</code> функция останавливается и отдаёт значение.','Без <code>return</code> результатом будет <code>undefined</code>.'],
        'Писать <code>handleClick()</code> там, где нужно передать саму функцию <code>handleClick</code>. Скобки означают «вызови сейчас».',
        'Напиши функцию <code>getTotal(price, count)</code>, которая возвращает произведение. Вызови её с двумя разными наборами чисел.'
      )
    },
    {
      test: /queryselector|getelement|dom\b|textcontent|innerhtml|classlist|dataset/i,
      make: () => guide(
        'DOM — объектное представление HTML-страницы. Сначала JavaScript находит элемент, затем читает или меняет его свойство, класс, атрибут или текст.',
        'Поиск элементов выполняют в JS-файле после загрузки HTML. При подключении скрипта перед <code>&lt;/body&gt;</code> элементы уже существуют; при подключении в <code>&lt;head&gt;</code> добавь <code>defer</code>.',
        ['<code>document.querySelector</code> получает CSS-селектор.','Метод возвращает первый подходящий элемент или <code>null</code>.','Сохрани элемент в переменную.','Меняй конкретное свойство: <code>textContent</code>, <code>classList</code>, <code>style</code> или <code>dataset</code>.'],
        'Сразу обращаться к свойству результата, не убедившись, что селектор правильный. Если элемент не найден, попытка вызвать метод у <code>null</code> завершится ошибкой.',
        'Добавь в HTML <code>&lt;span class="status"&gt;</code>, найди его через <code>querySelector</code> и замени текст после клика по кнопке.'
      )
    },
    {
      test: /addeventlistener|onclick|событ|click|submit|preventdefault|input event/i,
      make: () => guide(
        'Событие сообщает, что пользователь или браузер что-то сделал. <code>addEventListener</code> связывает тип события с функцией, которую нужно запустить.',
        'Подписку пишут после того, как элемент найден. Первый аргумент — название события строкой, второй — функция без немедленного вызова.',
        ['Браузер ждёт событие.','После события создаётся объект <code>event</code>.','Запускается callback.','Для формы <code>event.preventDefault()</code> отменяет обычную перезагрузку страницы.'],
        'Передавать <code>handleClick()</code> вместо <code>handleClick</code>, подписывать один элемент много раз или забывать <code>preventDefault()</code> у формы, когда отправка обрабатывается JavaScript.',
        'Добавь обработчик <code>submit</code>. Если поле после <code>trim()</code> пустое — покажи ошибку, иначе выведи значение и только потом очисти поле.'
      )
    },
    {
      test: /localstorage|sessionstorage|json\.stringify|json\.parse/i,
      make: () => guide(
        '<code>localStorage</code> хранит строки в текущем браузере после перезагрузки. Числа и объекты нужно преобразовывать при записи и чтении.',
        'Чтение размещают при создании начального состояния приложения. Запись выполняют сразу после изменения состояния: пользователь нажал кнопку → переменная изменилась → интерфейс обновился → новое значение сохранилось.',
        ['<code>getItem</code> возвращает строку или <code>null</code>.','Для числа используй <code>Number(...)</code>.','Для объекта при записи нужен <code>JSON.stringify</code>, при чтении — <code>JSON.parse</code>.','После чтения обязательно отрисуй восстановленное состояние.'],
        'Объявлять состояние дважды после чтения из хранилища, забывать кавычки вокруг ключа или записывать в хранилище переменную <code>dark</code вместо строки <code>"dark"</code>.',
        'Сохрани счётчик и выбранную тему. Перезагрузи страницу и проверь, что число, цвет и иконка кнопки восстановились.'
      )
    },
    {
      test: /array|массив|\.map\(|\.filter\(|\.find\(|\.reduce\(|push\(|forEach/i,
      make: () => guide(
        'Массив хранит упорядоченную коллекцию значений. Методы <code>map</code>, <code>filter</code> и <code>find</code> решают разные задачи: преобразование, отбор и поиск одного элемента.',
        'Метод вызывают у массива. В callback передаётся текущий элемент, а возвращаемое значение определяет результат метода.',
        ['<code>map</code> возвращает новый массив той же длины.','<code>filter</code> оставляет элементы, для которых callback вернул true.','<code>find</code> возвращает первый найденный элемент или undefined.','<code>forEach</code> выполняет действие, но не строит новый массив.'],
        'Использовать <code>map</code> и забывать <code>return</code> внутри фигурных скобок либо ожидать, что <code>forEach</code> вернёт новый массив.',
        'Создай массив товаров с ценами. Через <code>filter</code> оставь товары дешевле 1000, а через <code>map</code> получи массив только их названий.'
      )
    },
    {
      test: /for\s*\(|while\s*\(|цикл|итерац/i,
      make: () => guide(
        'Цикл повторяет блок кода. У <code>for</code> есть старт, условие продолжения и шаг; <code>while</code> повторяется, пока условие остаётся истинным.',
        'Цикл пишут там, где нужно обработать набор данных или повторить однотипное действие. Для массивов часто удобнее методы <code>map</code>, <code>filter</code> и <code>forEach</code>.',
        ['Создаётся счётчик.','Перед каждой итерацией проверяется условие.','Выполняется тело цикла.','После тела выполняется шаг и проверка повторяется.'],
        'Условие никогда не становится ложным — получается бесконечный цикл. Также часто ошибаются на единицу и используют <code>&lt;= array.length</code> вместо <code>&lt; array.length</code>.',
        'Выведи числа от 1 до 10, затем только чётные числа. После этого посчитай сумму элементов массива.'
      )
    },
    {
      test: /fetch\(|async\s|await\s|promise|try\s*\{|catch\s*\(/i,
      make: () => guide(
        'Асинхронный код ждёт результат, который появится позже. <code>await</code> приостанавливает только текущую <code>async</code>-функцию, а <code>try/catch</code> позволяет показать понятную ошибку.',
        '<code>await</code> пишется внутри функции с <code>async</code>. В интерфейсе заранее подготовь состояния загрузки, результата, пустого ответа и ошибки.',
        ['Покажи состояние загрузки.','Выполни запрос и проверь <code>response.ok</code>.','Преобразуй ответ в данные.','Отрисуй результат.','В <code>catch</code> покажи ошибку, а в <code>finally</code> убери загрузку.'],
        'Считать любой ответ успешным, не проверять <code>response.ok</code>, использовать <code>await</code> вне async-функции или оставлять интерфейс в состоянии загрузки после ошибки.',
        'Запроси одного пользователя из тестового API. Сделай отдельные тексты для загрузки, ошибки и успешного результата.'
      )
    },
    {
      test: /form|input|textarea|label|required|валидац|проверка формы/i,
      make: () => guide(
        'Форма объединяет поля и отправку данных. HTML задаёт правильные типы и ограничения, CSS показывает состояния, JavaScript добавляет бизнес-проверки и реакцию интерфейса.',
        'Поля размещают внутри <code>&lt;form&gt;</code>. Каждый input связывают с label, а обработчик ставят на событие <code>submit</code> самой формы, не только на клик кнопки.',
        ['Браузер проверяет HTML-ограничения.','Событие submit срабатывает и по кнопке, и по Enter.','JavaScript читает <code>input.value</code>.','<code>trim()</code> убирает пробелы по краям.','После успешной обработки форму можно очистить через <code>form.reset()</code>.'],
        'Очищать input в обработчике события <code>input</code>, проверять <code>trim</code без скобок или обрабатывать только click кнопки — тогда Enter не сработает.',
        'Собери форму имени и email. Покажи ошибку рядом с конкретным полем и не очищай значения, пока проверка не пройдена.'
      )
    },
    {
      test: /display\s*:\s*flex|flexbox|justify-content|align-items|flex-direction/i,
      make: () => guide(
        'Flexbox располагает дочерние элементы вдоль главной и поперечной оси. Направление главной оси задаёт <code>flex-direction</code>.',
        '<code>display: flex</code> пишут у родителя, а не у элементов, которые нужно разложить. <code>justify-content</code> работает по главной оси, <code>align-items</code> — по поперечной.',
        ['Выбери контейнер-родитель.','Включи <code>display: flex</code>.','Определи направление через row или column.','Настрой расстояние через <code>gap</code>.','Только после этого добавляй выравнивание.'],
        'Пытаться центрировать детей через flex-свойства на самих детях или забывать, что после <code>flex-direction: column</code> оси меняются местами.',
        'Собери панель из счётчика сверху и трёх кнопок снизу: внешний контейнер column, отдельный контейнер кнопок row.'
      )
    },
    {
      test: /display\s*:\s*grid|grid-template|css grid|grid-column|grid-row/i,
      make: () => guide(
        'CSS Grid строит сетку из строк и колонок. Родитель задаёт структуру, а дочерние элементы автоматически занимают ячейки или явно размещаются по линиям.',
        '<code>display: grid</code> и <code>grid-template-columns</code> пишут у контейнера. <code>grid-column</code> и <code>grid-row</code> применяют к конкретному дочернему элементу.',
        ['Определи количество колонок.','Используй <code>minmax</code> и <code>fr</code> для гибких размеров.','Задай <code>gap</code>.','На узком экране измени шаблон через media query.'],
        'Задавать колонки дочернему элементу вместо родителя или создавать фиксированные колонки, которые не помещаются на телефоне.',
        'Собери сетку карточек: три колонки на десктопе, две на планшете и одну на телефоне.'
      )
    },
    {
      test: /position\s*:|absolute|relative|fixed|sticky|z-index/i,
      make: () => guide(
        '<code>position</code> меняет способ размещения элемента. Абсолютный элемент ищет ближайшего предка с позиционированием, а fixed привязывается к окну браузера.',
        'Обычно родителю ставят <code>position: relative</code>, а вложенному декоративному или управляющему элементу — <code>position: absolute</code>.',
        ['Выбери систему координат.','Укажи position.','Задай только нужные стороны: top/right/bottom/left.','Проверь переполнение и перекрытие на мобильном экране.'],
        'Использовать absolute для основной раскладки страницы. Элемент выпадает из потока, поэтому соседние блоки перестают учитывать его размер.',
        'Размести кнопку закрытия в правом верхнем углу карточки, не используя margin для ручного сдвига.'
      )
    },
    {
      test: /margin|padding|box-sizing|отступ/i,
      make: () => guide(
        '<code>padding</code> создаёт внутреннее пространство между содержимым и границей. <code>margin</code> отделяет весь элемент от соседей.',
        'Padding задавай элементу, которому нужен воздух внутри. Margin используй для внешнего ритма, а расстояние между элементами flex/grid чаще задавай через <code>gap</code>.',
        ['Посмотри на границу элемента.','Если пространство должно быть внутри границы — padding.','Если за границей — margin.','Для центрирования блочного элемента нужны ограниченная ширина и <code>margin-inline: auto</code>.'],
        'Пытаться центрировать элемент случайным <code>margin-left: 110px</code>. На другом экране такое значение сразу ломает расположение.',
        'Удали ручные margin-left у трёх кнопок. Оберни их в flex-контейнер и настрой расстояние через gap.'
      )
    },
    {
      test: /селектор|class|\bid\b|специфич|\.class|#id|href="#/i,
      make: () => guide(
        'CSS-селектор находит элементы, к которым применятся стили. Класс можно повторять, id должен быть уникальным на странице и также используется для якорей.',
        'Класс записывают в HTML через <code>class="name"</code>, а в CSS ищут через <code>.name</code>. В JavaScript тот же элемент можно найти через <code>document.querySelector(".name")</code>.',
        ['HTML присваивает элементу имя класса.','CSS-селектор находит все элементы этого класса.','JS-селектор возвращает первый элемент или список через querySelectorAll.','Более специфичное правило может перебить обычный класс.'],
        'Добавлять точку внутрь <code>class=".button"</code>. Точка нужна только в селекторе CSS/JS, а в HTML имя пишется без неё.',
        'Создай две кнопки с общим классом и одну с дополнительным классом danger. Стилизуй общие свойства один раз.'
      )
    },
    {
      test: /<html|<head|<body|doctype|семантик|<main|<section|<article|html —|структура страницы/i,
      make: () => guide(
        'HTML описывает смысл и структуру содержимого. Браузер читает вложенность сверху вниз и строит DOM-дерево.',
        'Основная структура находится в HTML-файле. Настройки, кодировка и подключения лежат в <code>&lt;head&gt;</code>, а видимый интерфейс — в <code>&lt;body&gt;</code>.',
        ['DOCTYPE сообщает современный режим HTML.','html является корнем документа.','head хранит метаданные и подключения.','body содержит то, что видит пользователь.','Семантический тег выбирают по смыслу, а не по внешнему виду.'],
        'Использовать div для всего подряд, нарушать вложенность или выбирать заголовок по размеру вместо уровня структуры.',
        'Собери страницу из header, nav, main, двух section и footer. Проверь, что h1 только один, а заголовки разделов — h2.'
      )
    },
    {
      test: /usestate|useeffect|props|компонент|jsx|react/i,
      make: () => guide(
        'React-компонент — функция, которая возвращает JSX. Props приходят снаружи, state хранит изменяемые данные, а изменение state запускает новый рендер.',
        'Хуки вызывают только на верхнем уровне компонента или собственного хука. Не вызывай их внутри if, циклов и вложенных функций.',
        ['Компонент получает props.','Хуки возвращают текущее состояние и функцию обновления.','JSX строится из текущих данных.','После setState React повторно вызывает компонент и обновляет DOM.'],
        'Менять state напрямую, вызывать setState во время каждого рендера или забывать зависимости useEffect.',
        'Сделай компонент счётчика с prop step. Добавь две кнопки и вывод текущего значения.'
      )
    },
    {
      test: /git\s|commit|branch|merge|pull request|репозитор/i,
      make: () => guide(
        'Git хранит историю изменений проекта. Commit фиксирует осмысленное состояние, branch изолирует работу, merge объединяет ветки.',
        'Команды выполняются в терминале внутри папки репозитория. Перед commit проверь <code>git status</code> и diff, чтобы не отправить лишние файлы.',
        ['Посмотри состояние.','Добавь нужные файлы в staging.','Создай commit с кратким описанием результата.','Отправь ветку и открой Pull Request при командной работе.'],
        'Делать один огромный commit на несколько несвязанных задач, добавлять секреты или слепо исправлять конфликт, удаляя чужую работу.',
        'Создай ветку feature/profile-card, измени один файл, проверь diff и сделай commit с сообщением до 50 символов.'
      )
    },
    {
      test: /select\s|insert\s|update\s|delete\s|join\s|sql|таблиц|баз[аы] данных/i,
      make: () => guide(
        'SQL описывает, какие данные нужно получить или изменить. Запрос работает с таблицами, строками и колонками, а условия ограничивают набор строк.',
        'Запрос выполняют через клиент базы или серверное приложение. Пользовательские значения нельзя склеивать со строкой запроса — используй параметры.',
        ['SELECT выбирает колонки.','FROM задаёт таблицу.','WHERE фильтрует строки.','JOIN связывает таблицы по ключам.','ORDER BY сортирует, LIMIT ограничивает результат.'],
        'Запустить UPDATE или DELETE без WHERE, использовать SELECT * без необходимости или собирать запрос из пользовательского ввода и получить SQL-инъекцию.',
        'Напиши запрос списка опубликованных проектов пользователя, отсортированных от новых к старым, максимум 10 строк.'
      )
    }
  ];

  const rulesEn = [
    { test: /(^|\s)(if|else if|else|ternary|condition|===|!==|&&|\|\|)(\s|$)|age\s*[><=!]/i, make:() => guide('<code>if</code> chooses which block runs. The expression in parentheses must become true or false. <code>===</code> compares value and type.','Write the condition inside the parentheses: <code>if (age === 18)</code>. A single <code>=</code> assigns a value; it does not compare.',['Evaluate the first condition.','If true, run its block and skip later branches.','If false, check the next else if.','Run else only when every condition above was false.'],'Confusing <code>=</code> and <code>===</code>, or forgetting that <code>18 === "18"</code> is false because the types differ.','Create score. Print “passed” for 10+, “almost” for 5–9, and “try again” otherwise. Test 3, 7 and 12.') },
    { test:/let\s|const\s|var\s|variable|data type|number|string|boolean/i, make:() => guide('A variable connects a name to a value. <code>const</code> prevents reassignment; <code>let</code> allows a later value.','Declare it in the smallest scope that needs it: above related handlers or inside the function that owns it.',['Evaluate the right side.','Store it under the name on the left.','Read the current value when the name is used.'],'Declaring the same let/const twice or reassigning a const.','Create const userName and let score. Change only score and log both.') },
    { test:/function\s|=>|function|parameter|return|closure/i, make:() => guide('A function groups steps under one name. Parameters receive input and <code>return</code> sends a result back.','Declare reusable logic separately. An inline arrow function is fine when only one listener needs it.',['Arguments enter parameters.','The body runs top to bottom.','return stops the function and sends a value.','Without return the result is undefined.'],'Writing handleClick() where the listener needs the function handleClick.','Write getTotal(price, count) and call it with two input sets.') },
    { test:/queryselector|getelement|dom\b|textcontent|innerhtml|classlist|dataset/i, make:() => guide('DOM is the object representation of HTML. Find an element first, then change a specific property, class or attribute.','Run selection after HTML exists: place the script before </body> or use defer in head.',['querySelector receives a CSS selector.','It returns an element or null.','Store the element.','Change textContent, classList, style or dataset.'],'Using the wrong selector and then calling a method on null.','Add a .status span and change its text after a button click.') },
    { test:/addeventlistener|onclick|event|click|submit|preventdefault/i, make:() => guide('An event tells you that the user or browser did something. addEventListener connects it to a callback.','Subscribe after selecting the element. The second argument is a function, not an immediate call.',['Wait for the event.','Receive the event object.','Run the callback.','Use preventDefault for a JS-managed form.'],'Passing handleClick() instead of handleClick or listening only for a button click instead of form submit.','Handle form submit. Reject a trimmed empty value; otherwise log and then clear it.') },
    { test:/localstorage|sessionstorage|json\.stringify|json\.parse/i, make:() => guide('localStorage keeps strings in this browser after reload. Convert numbers and objects when reading and writing.','Read initial state at startup. Save after state changes and render the restored state.',['getItem returns a string or null.','Convert numbers with Number.','Use JSON.stringify/parse for objects.','Render after loading.'],'Declaring state a second time or saving dark instead of the string "dark".','Persist a counter and theme, then verify number, color and icon after reload.') },
    { test:/array|\.map\(|\.filter\(|\.find\(|\.reduce\(|push\(|foreach/i, make:() => guide('Arrays store ordered values. map transforms, filter selects, and find returns one match.','Call the method on an array and return the value or boolean required by that method.',['map returns a new array of equal length.','filter keeps items that return true.','find returns the first match.','forEach performs effects and returns no new array.'],'Using braces in map without an explicit return.','Filter products below 1000 and map the result to product names.') },
    { test:/fetch\(|async\s|await\s|promise|try\s*\{|catch\s*\(/i, make:() => guide('Async code waits for future results. await pauses only the current async function; try/catch creates a controlled error state.','Use await inside async. Design loading, success, empty and error UI before the request.',['Show loading.','Fetch and check response.ok.','Parse data.','Render success.','Handle error and clear loading in finally.'],'Ignoring response.ok or leaving the interface stuck in loading after failure.','Fetch one test user and render separate loading, success and error messages.') },
    { test:/display\s*:\s*flex|flexbox|justify-content|align-items/i, make:() => guide('Flexbox arranges children along main and cross axes. flex-direction chooses the main axis.','Put display:flex on the parent. Use justify-content on the main axis and align-items on the cross axis.',['Choose the parent.','Enable flex.','Set direction.','Add gap.','Then align.'],'Putting flex alignment on children or forgetting that column swaps the axes.','Place a counter above a horizontal row of three buttons using two containers.') },
    { test:/display\s*:\s*grid|grid-template|css grid/i, make:() => guide('Grid defines rows and columns on a parent. Children fill cells or use explicit grid lines.','Put display:grid and grid-template-columns on the container. Use grid-column on a child.',['Define columns.','Use minmax/fr.','Set gap.','Change columns in a media query.'],'Defining columns on a child or using fixed widths that overflow mobile.','Create three columns on desktop, two on tablet, one on mobile.') },
    { test:/margin|padding|box-sizing|spacing/i, make:() => guide('Padding is inside the border; margin separates the whole element from neighbours.','Use padding for internal space, margin for outer rhythm, and gap between flex/grid children.',['Find the border.','Inside means padding.','Outside means margin.','Center a limited-width block with margin-inline:auto.'],'Centering with a random margin-left that breaks at another width.','Remove manual button margins and use a flex parent with gap.') },
    { test:/usestate|useeffect|props|component|jsx|react/i, make:() => guide('A React component is a function returning JSX. Props come from outside; state changes trigger another render.','Call hooks only at the top level of a component or custom hook.',['Receive props.','Read hook state.','Build JSX.','Call setState to trigger a new render.'],'Mutating state directly or calling setState during every render.','Build a counter component with a step prop.') }
  ];

  function fallbackGuide(id, title, code) {
    const languageLabels = { html:'HTML', css:'CSS', js:'JAVASCRIPT', ts:'TYPESCRIPT', react:'REACT', electron:'ELECTRON', git:'GIT', node:'NODE.JS', sql:'SQL', python:'PYTHON', csharp:'C#' };
    const language = languageLabels[id] || (isEnglish ? 'this section' : 'этом разделе');
    if (isEnglish) return guide(
      'This block introduces “' + escapeHtml(title) + '”. Do not memorize the final fragment: identify its input, operation and visible result.',
      code ? 'Place the fragment in the file type used by the current ' + language + ' section. Keep HTML for structure, CSS for appearance and JavaScript for behaviour.' : 'Use this idea in the current section, then verify it in a small isolated example.',
      ['Read the example from top to bottom.','Name the value or element each line works with.','Predict the result before running it.','Change one value and compare the result.'],
      'Copying the example without checking what each name refers to in your own project.',
      'Recreate the smallest version from memory, then add one change that was not present in the lesson.'
    );
    return guide(
      'Блок знакомит с темой «' + escapeHtml(title) + '». Не запоминай готовый фрагмент целиком: найди входные данные, действие и результат, который увидит пользователь.',
      code ? 'Размести фрагмент в файле текущего раздела ' + language + '. HTML отвечает за структуру, CSS — за внешний вид, JavaScript — за поведение.' : 'Примени идею внутри текущего раздела, а затем проверь её на маленьком изолированном примере.',
      ['Прочитай пример сверху вниз.','Назови значение или элемент, с которым работает каждая строка.','Предскажи результат до запуска.','Измени одно значение и сравни результат.'],
      'Копировать пример, не проверяя, что означают имена переменных, классов и элементов именно в твоём проекте.',
      'Повтори минимальную версию по памяти, а затем добавь одно изменение, которого не было в уроке.'
    );
  }

  function analyze(block) {
    const title = cleanTitle(block);
    const code = codeFrom(block);
    const id = sectionId(block);
    const haystack = title + '\n' + code + '\n' + (block.querySelector('.tip,.explain')?.textContent || '');
    const rule = (isEnglish ? rulesEn : rulesRu).find(item => item.test.test(haystack));
    return { title, code, id, guide: rule ? rule.make() : fallbackGuide(id, title, code) };
  }

  function buildDrawer() {
    if (document.getElementById('wdgfLearningDrawer')) return;
    const backdrop = document.createElement('div');
    backdrop.className = 'wdgf-drawer-backdrop';
    backdrop.id = 'wdgfLearningBackdrop';
    const drawer = document.createElement('aside');
    drawer.className = 'wdgf-drawer';
    drawer.id = 'wdgfLearningDrawer';
    document.body.append(backdrop, drawer);
    backdrop.addEventListener('click', closeDrawer);
  }

  function openDrawer(block) {
    buildDrawer();
    activeBlock = block;
    document.body.classList.add('wdgf-drawer-open');
    const data = analyze(block);
    const taskId = blockIdentity(block);
    const taskStore = readJson(TASKS_KEY, {});
    const taskState = taskStore[taskId] || { code:'', done:false };
    const simpleMode = localStorage.getItem(SIMPLE_KEY) === '1';
    const bookmarked = block.classList.contains('bookmarked');
    const drawer = document.getElementById('wdgfLearningDrawer');
    drawer.innerHTML = '<header class="wdgf-drawer-head"><div><h2>' + escapeHtml(data.title) + '</h2><p>' + escapeHtml(data.id.toUpperCase()) + ' · ' + ui.understand + '</p></div><div class="wdgf-drawer-head-actions"><button class="wdgf-btn" type="button" data-learning-simple>' + (simpleMode ? ui.normal : ui.simple) + '</button><button class="wdgf-icon-btn" type="button" data-learning-close title="' + ui.close + '">' + icon('tabler:x',20) + '</button></div></header>' +
      '<div class="wdgf-drawer-body">' +
      '<section class="wdgf-simple-card ' + (simpleMode ? '' : 'wdgf-hidden') + '" data-learning-simple-card><h3>' + icon('tabler:mood-smile',17) + ui.simpleTitle + '</h3><p>' + escapeHtml(simpleSummary(data)) + '</p></section>' +
      sectionMarkup('tabler:bulb',ui.what,data.guide.summary) + sectionMarkup('tabler:map-pin',ui.where,data.guide.where) +
      '<section class="wdgf-explain-section"><h3>' + icon('tabler:list-numbers',17) + ui.steps + '</h3><ol>' + data.guide.steps.map(step => '<li>' + step + '</li>').join('') + '</ol></section>' +
      (data.code ? '<section class="wdgf-explain-section"><h3>' + icon('tabler:code',17) + ui.source + '</h3><pre class="wdgf-code" style="min-height:0;max-height:280px">' + escapeHtml(data.code) + '</pre></section>' : '<section class="wdgf-explain-section"><p>' + ui.noCode + '</p></section>') +
      sectionMarkup('tabler:alert-triangle',ui.mistake,data.guide.mistake) +
      '<section class="wdgf-explain-section wdgf-practice-box"><h3>' + icon('tabler:target-arrow',17) + ui.task + '</h3><p>' + data.guide.task + '</p><label class="wdgf-solution-label" for="wdgfTaskSolution">' + ui.solution + '</label><textarea id="wdgfTaskSolution" class="wdgf-solution" spellcheck="false" placeholder="' + escapeHtml(ui.solutionPlaceholder) + '">' + escapeHtml(taskState.code || '') + '</textarea><div class="wdgf-actions"><button class="wdgf-btn primary" type="button" data-task-check>' + icon('tabler:checks',16) + ' ' + ui.validate + '</button><span class="wdgf-task-status ' + (taskState.done ? 'good' : '') + '" data-task-status aria-live="polite">' + (taskState.done ? ui.taskDone : '') + '</span></div></section></div>' +
      '<footer class="wdgf-drawer-foot"><button class="wdgf-btn primary" type="button" data-learning-play ' + (!data.code ? 'disabled' : '') + '>' + icon('tabler:player-play',16) + ' ' + ui.playground + '</button><button class="wdgf-btn ' + (bookmarked ? 'good' : '') + '" type="button" data-learning-bookmark>' + icon(bookmarked ? 'tabler:bookmark-filled' : 'tabler:bookmark',16) + ' ' + ui.bookmark + '</button><button class="wdgf-btn" type="button" data-learning-review>' + icon('tabler:brain',16) + ' ' + ui.review + '</button></footer>';

    drawer.querySelector('[data-learning-close]').addEventListener('click', closeDrawer);
    drawer.querySelector('[data-learning-play]').addEventListener('click', () => sendToPlayground(block));
    drawer.querySelector('[data-learning-review]').addEventListener('click', event => addToReview(block, event.currentTarget));
    drawer.querySelector('[data-learning-simple]').addEventListener('click', event => {
      const enabled = localStorage.getItem(SIMPLE_KEY) !== '1';
      localStorage.setItem(SIMPLE_KEY, enabled ? '1' : '0');
      drawer.querySelector('[data-learning-simple-card]').classList.toggle('wdgf-hidden', !enabled);
      event.currentTarget.textContent = enabled ? ui.normal : ui.simple;
    });
    drawer.querySelector('[data-learning-bookmark]').addEventListener('click', event => {
      const nativeButton = block.querySelector('.bm-btn');
      if (nativeButton) nativeButton.click();
      else block.classList.toggle('bookmarked');
      const active = block.classList.contains('bookmarked');
      event.currentTarget.classList.toggle('good', active);
      event.currentTarget.innerHTML = icon(active ? 'tabler:bookmark-filled' : 'tabler:bookmark',16) + ' ' + ui.bookmark;
    });

    const solution = drawer.querySelector('#wdgfTaskSolution');
    const status = drawer.querySelector('[data-task-status]');
    solution.addEventListener('input', () => {
      const store = readJson(TASKS_KEY, {});
      store[taskId] = Object.assign({}, store[taskId], { code:solution.value, updatedAt:Date.now() });
      writeJson(TASKS_KEY, store);
      status.textContent = ui.saved;
      status.className = 'wdgf-task-status';
    });
    drawer.querySelector('[data-task-check]').addEventListener('click', () => {
      const result = validateSolution(data, solution.value);
      const store = readJson(TASKS_KEY, {});
      const wasDone = Boolean(store[taskId]?.done);
      store[taskId] = { code:solution.value, done:result.ok, updatedAt:Date.now() };
      writeJson(TASKS_KEY, store);
      status.textContent = result.message;
      status.className = 'wdgf-task-status ' + (result.ok ? 'good' : 'bad');
      if (result.ok && !wasDone) window.WebDevGymFeatures?.logActivity?.(2);
      window.WebDevGymFeatures?.recordWeakPoint?.({
        id:taskId, section:data.id, title:data.title, source:'task', success:result.ok
      });
    });

    document.getElementById('wdgfLearningBackdrop').classList.add('open');
    drawer.classList.add('open');
  }

  function sectionMarkup(iconName, title, content) {
    return '<section class="wdgf-explain-section"><h3>' + icon(iconName,17) + title + '</h3><p>' + content + '</p></section>';
  }

  function closeDrawer() {
    document.getElementById('wdgfLearningBackdrop')?.classList.remove('open');
    document.getElementById('wdgfLearningDrawer')?.classList.remove('open');
    activeBlock = null;
    document.body.classList.remove('wdgf-drawer-open');
  }

  function addToReview(block, button) {
    const store = readJson('wdg_review_v1', {});
    const blocks = Array.from(block.closest('.section')?.querySelectorAll(':scope > .block') || []);
    const id = sectionId(block) + '-' + Math.max(0, blocks.indexOf(block));
    store[id] = { due:Date.now(), interval:0, updatedAt:Date.now() };
    writeJson('wdg_review_v1', store);
    window.WebDevGymFeatures?.refreshReviewReminder?.();
    button.textContent = ui.added;
    button.classList.add('good');
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (error) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function sendToPlayground(block) {
    const data = analyze(block);
    if (!data.code || ['python', 'csharp', 'electron'].includes(data.id)) return;
    closeDrawer();
    if (typeof window.switchTabByName === 'function') window.switchTabByName('playground');
    const baseHtml = '<main class="demo">\n  <h1>WebDevGym</h1>\n  <button class="action">Try it</button>\n  <p class="output">Result</p>\n</main>';
    const baseCss = 'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui;\n}\n\n.demo {\n  width: min(480px, 90%);\n}';
    let files;
    if (data.id === 'html') files = [{name:'index.html',content:data.code},{name:'style.css',content:baseCss},{name:'script.js',content:''}];
    else if (data.id === 'css') files = [{name:'index.html',content:baseHtml},{name:'style.css',content:data.code},{name:'script.js',content:''}];
    else files = [{name:'index.html',content:baseHtml},{name:'style.css',content:baseCss},{name:data.id === 'ts' ? 'script.ts' : 'script.js',content:data.code}];
    setTimeout(() => {
      try {
        pgFiles = files;
        pgActiveFile = null;
        if (typeof pgRenderTabs === 'function') pgRenderTabs();
        if (typeof pgUpdateEntrySelect === 'function') pgUpdateEntrySelect();
        if (typeof pgSwitchFile === 'function') pgSwitchFile(files[0].name);
        if (typeof runPlayground === 'function') runPlayground();
      } catch (error) {
        const editor = document.getElementById('pg-editor');
        if (editor) editor.value = data.code;
      }
    }, 160);
  }

  function enhanceBlocks(root = document) {
    const learningSections = new Set(['html', 'css', 'js', 'ts', 'react', 'electron', 'vite', 'node', 'sql', 'pg', 'linux', 'devops', 'git', 'python', 'csharp']);
    const blocks = root instanceof Element && root.matches('.section')
      ? root.querySelectorAll(':scope > .block')
      : document.querySelectorAll('.section > .block');
    blocks.forEach(block => {
      const sectionId = block.closest('.section')?.id?.replace(/^sec-/, '');
      if (!learningSections.has(sectionId)) return;
      if (block.dataset.wdgDeepReady === '1') return;
      const title = block.querySelector('.block-title');
      if (!title) return;
      const supportsPlayground = Boolean(codeFrom(block)) && !['python', 'csharp', 'electron'].includes(sectionId);
      block.dataset.wdgDeepReady = '1';
      title.classList.add('wdgf-action-title');
      const actions = document.createElement('span');
      actions.className = 'wdgf-deep-actions';
      actions.innerHTML = '<button class="wdgf-deep-btn" type="button" data-learning-open title="' + ui.understand + '" aria-label="' + ui.understand + '">' + icon('tabler:bulb',15) + '</button>' +
        '<button class="wdgf-deep-btn" type="button" data-learning-direct-play title="' + ui.playground + '" aria-label="' + ui.playground + '" ' + (supportsPlayground ? '' : 'disabled') + '>' + icon('tabler:player-play',15) + '</button>';
      title.appendChild(actions);
      actions.querySelector('[data-learning-open]').addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); openDrawer(block); });
      actions.querySelector('[data-learning-direct-play]').addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); sendToPlayground(block); });
    });
  }

  function init() {
    buildDrawer();
    enhanceBlocks();
    document.querySelectorAll('.section').forEach(section => {
      let frame = 0;
      new MutationObserver(() => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          enhanceBlocks(section);
        });
      }).observe(section, { childList:true });
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && activeBlock) closeDrawer(); });
    window.WebDevGymLearning = { open:openDrawer, enhance:enhanceBlocks };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 100));
  else setTimeout(init, 100);
})();
// ===== WEBDEVGYM VISIBLE USAGE GUIDES V1 =====
(function () {
  const sectionSelectors = ['#sec-html', '#sec-css', '#sec-js', '#sec-ts', '#sec-react'];
  const isEnglishPage = /index-en\.html/i.test(location.pathname) || document.documentElement.lang === 'en';

  const ruBase = {
    html: {
      title: 'Как использовать HTML-пример',
      where: 'Вставляй такой код в <code>index.html</code> внутрь <code>&lt;body&gt;</code>, если это видимая часть страницы. Код из <code>&lt;head&gt;</code> оставляй в голове документа: там подключаются стили, мета-теги и заголовок вкладки.',
      change: 'Меняй текст, ссылки, пути к картинкам, <code>class</code>, <code>id</code> и атрибуты под свою задачу. Сначала проверь, что структура понятная без CSS, и только потом украшай.',
      check: 'Проверь вложенность тегов: открыл <code>&lt;div&gt;</code> — закрыл <code>&lt;/div&gt;</code>. У кнопок, форм и картинок должны быть правильные атрибуты, иначе JS и CSS потом будут цепляться не туда.'
    },
    css: {
      title: 'Как использовать CSS-пример',
      where: 'Вставляй CSS в <code>style.css</code> или в отдельный файл стилей, подключенный через <code>&lt;link rel="stylesheet"&gt;</code>. Селектор в CSS должен совпадать с классом или тегом в HTML.',
      change: 'Меняй размеры, отступы, цвета, <code>display</code>, <code>gap</code>, <code>position</code> и адаптивные значения. Двигай по одному свойству за раз, чтобы понимать, что именно изменило страницу.',
      check: 'Если стиль не работает, сначала проверь селектор, подключение файла и перебивание другим правилом. В DevTools смотри, применилось ли свойство или зачеркнуто.'
    },
    js: {
      title: 'Как использовать JavaScript-пример',
      where: 'Вставляй JS в <code>script.js</code> и подключай перед <code>&lt;/body&gt;</code> или через <code>defer</code> в <code>&lt;head&gt;</code>. Если код работает с элементами страницы, HTML уже должен существовать.',
      change: 'Меняй селекторы, имена переменных, условия и действия внутри функций под свою задачу. Сначала найди элемент, потом измени текст, класс, значение или повесь событие.',
      check: 'Если ничего не происходит, проверь консоль, правильность селектора и не равен ли элемент <code>null</code>. Для форм часто нужен <code>preventDefault()</code>, чтобы страница не перезагружалась.'
    },
    ts: {
      title: 'Как использовать TypeScript-пример',
      where: 'Пиши такой код в <code>.ts</code> или <code>.tsx</code> файле. TypeScript нужен не для красоты, а чтобы заранее показать: какое значение строка, какое число, какой объект и что функция возвращает.',
      change: 'Меняй типы под реальные данные: поля объекта, аргументы функции, результат API. Если TS ругается, чаще всего он показывает место, где данные могут прийти не такими, как ты думаешь.',
      check: 'Не глуши ошибку типом <code>any</code> без причины. Лучше опиши тип точнее или проверь значение через <code>if</code>, прежде чем использовать его дальше.'
    },
    react: {
      title: 'Как использовать React-пример',
      where: 'Вставляй пример внутрь компонента или отдельного файла компонента. JSX похож на HTML, но логика живет в JavaScript: данные идут через props, состояние — через <code>useState</code>.',
      change: 'Меняй props, state, обработчики событий и массивы данных под свой интерфейс. Если отображаешь список через <code>map</code>, каждому элементу нужен стабильный <code>key</code>.',
      check: 'Не меняй state напрямую. Делай новое значение через setter: <code>setItems(...)</code>. В <code>useEffect</code> следи за массивом зависимостей, иначе код может запускаться слишком часто.'
    }
  };

  const enBase = {
    html: {
      title: 'How to use this HTML example',
      where: 'Put visible page structure into <code>index.html</code> inside <code>&lt;body&gt;</code>. Code for <code>&lt;head&gt;</code> stays in the document head: styles, meta tags and the browser tab title live there.',
      change: 'Change text, links, image paths, <code>class</code>, <code>id</code> and attributes for your own task. First make the structure clear without CSS, then style it.',
      check: 'Check nesting: every opened tag must be closed in the correct place. Buttons, forms and images need proper attributes or CSS/JS will target the wrong thing.'
    },
    css: {
      title: 'How to use this CSS example',
      where: 'Put CSS into <code>style.css</code> or another stylesheet connected with <code>&lt;link rel="stylesheet"&gt;</code>. The selector must match an element, class or id in HTML.',
      change: 'Change spacing, sizes, colors, <code>display</code>, <code>gap</code>, <code>position</code> and responsive values. Change one property at a time so you can see what caused the result.',
      check: 'If a style does not work, check the selector, file connection and whether another rule overrides it. DevTools shows applied and crossed-out properties.'
    },
    js: {
      title: 'How to use this JavaScript example',
      where: 'Put JS into <code>script.js</code> and connect it before <code>&lt;/body&gt;</code> or with <code>defer</code> in <code>&lt;head&gt;</code>. If code selects elements, the HTML must already exist.',
      change: 'Change selectors, variable names, conditions and function actions for your task. First select an element, then change text, class, value or attach an event.',
      check: 'If nothing happens, check the console, the selector and whether the element is <code>null</code>. Forms often need <code>preventDefault()</code> to stop page reload.'
    },
    ts: {
      title: 'How to use this TypeScript example',
      where: 'Write this in a <code>.ts</code> or <code>.tsx</code> file. TypeScript helps describe which value is a string, number, object and what a function returns.',
      change: 'Change types to match real data: object fields, function arguments and API results. When TS complains, it usually points at data that may not be what you expect.',
      check: 'Do not hide problems with <code>any</code> without a reason. Describe the type more accurately or check the value with <code>if</code> before using it.'
    },
    react: {
      title: 'How to use this React example',
      where: 'Put the example inside a component or a separate component file. JSX looks like HTML, but logic lives in JavaScript: data comes through props and state through <code>useState</code>.',
      change: 'Change props, state, event handlers and data arrays for your interface. If you render a list with <code>map</code>, every item needs a stable <code>key</code>.',
      check: 'Do not mutate state directly. Create a new value through the setter: <code>setItems(...)</code>. In <code>useEffect</code>, watch the dependency array to avoid repeated runs.'
    }
  };

  const ruRules = [
    { test: /addEventListener|preventDefault|submit|click|input|keydown|keyup|mouseover|scroll/i, data: {
      title: 'Как использовать события',
      where: 'Сначала выбери элемент через <code>querySelector</code>, потом повесь <code>addEventListener</code>. Кнопке чаще подходит <code>click</code>, полю ввода — <code>input</code>, форме — <code>submit</code>.',
      change: 'Внутри обработчика меняй то, что должно произойти после действия пользователя: показать текст, проверить поле, добавить класс, очистить input или отправить данные.',
      check: '<code>preventDefault()</code> нужен не всегда. Обычно его ставят на <code>submit</code> формы или ссылку, когда ты сам управляешь поведением через JS.'
    }},
    { test: /querySelector|getElement|classList|textContent|innerHTML|append|createElement|dataset/i, data: {
      title: 'Как использовать DOM-код',
      where: 'DOM-код пиши после HTML-разметки или подключай скрипт с <code>defer</code>. Логика такая: нашел элемент → проверил, что он существует → изменил текст, класс, атрибут или добавил новый элемент.',
      change: 'Меняй селектор на свой класс или id. Если создаешь элемент через <code>createElement</code>, потом наполни его через <code>textContent</code> и вставь через <code>append</code>.',
      check: 'Если селектор неправильный, JS получит <code>null</code>, и следующий метод сломается. Поэтому при сложной логике полезно временно вывести элемент в <code>console.log</code>.'
    }},
    { test: /localStorage|setItem|getItem|JSON\.stringify|JSON\.parse/i, data: {
      title: 'Как использовать localStorage',
      where: 'Используй <code>localStorage</code>, когда нужно сохранить настройку в браузере: тему, счетчик, заметку, прогресс. Это не база данных и не сервер.',
      change: 'Сохраняй простые значения как строки. Для объектов и массивов используй <code>JSON.stringify</code>, а при чтении — <code>JSON.parse</code>. После чтения сразу ставь запасное значение через <code>||</code> или проверку.',
      check: 'Всегда помни: после обновления страницы код стартует заново. Поэтому сначала читаешь сохраненное значение, потом рисуешь интерфейс, потом при изменениях снова сохраняешь.'
    }},
    { test: /fetch|async|await|then|catch|response\.json/i, data: {
      title: 'Как использовать запросы к API',
      where: 'Такой код нужен, когда данные приходят извне: погода, курс валют, список товаров, пользователь. Обычно он живет в функции <code>async</code>.',
      change: 'Меняй URL, метод, заголовки и обработку ответа под конкретный API. После <code>await fetch()</code> обычно нужно превратить ответ в данные через <code>await response.json()</code>.',
      check: 'Запрос может упасть: нет интернета, неверный URL, сервер вернул ошибку. Поэтому добавляй <code>try/catch</code> или проверку <code>response.ok</code>.'
    }},
    { test: /if\s*\(|else|===|!==|&&|\|\||\?|:/i, data: {
      title: 'Как использовать условия',
      where: 'Условия ставь там, где программа должна выбрать один путь из нескольких: пустое поле или нет, возраст подходит или нет, счет больше нуля или нет.',
      change: 'В скобках после <code>if</code> пиши проверку, которая дает <code>true</code> или <code>false</code>. Для сравнения используй <code>===</code>, а не один <code>=</code>.',
      check: '<code>=</code> присваивает, <code>===</code> сравнивает. Если нужно несколько условий сразу: <code>&&</code> значит “и”, <code>||</code> значит “или”.'
    }},
    { test: /for\s*\(|while\s*\(|forEach|map\(|filter\(|reduce\(/i, data: {
      title: 'Как использовать циклы и перебор',
      where: 'Циклы нужны, когда одно действие повторяется: пройти по массиву, создать карточки товаров, посчитать сумму, отфильтровать данные.',
      change: 'Меняй массив, условие остановки и действие внутри цикла. Для создания нового массива чаще подходит <code>map</code>, для отбора — <code>filter</code>, для суммы — <code>reduce</code>.',
      check: 'Следи за индексами: массив начинается с <code>0</code>. В обычном <code>for</code> не забудь увеличить счетчик, иначе можно получить бесконечный цикл.'
    }},
    { test: /function\s|=>|return|params?|arguments?/i, data: {
      title: 'Как использовать функции',
      where: 'Функция нужна, когда действие повторяется или его хочется назвать: обновить счетчик, проверить форму, посчитать итог, отрисовать карточку.',
      change: 'Параметры — это входные данные функции. <code>return</code> — результат наружу. Если функция только меняет страницу, <code>return</code> может быть не нужен.',
      check: 'В обработчик события передавай функцию, а не результат вызова. Обычно нужно <code>btn.addEventListener("click", handleClick)</code>, а не <code>handleClick()</code>.'
    }},
    { test: /\[|\.push|\.pop|\.shift|\.unshift|\.length/i, data: {
      title: 'Как использовать массивы',
      where: 'Массив используй для списка однотипных данных: товары, задачи, карточки, имена, числа. Каждый элемент имеет индекс, первый индекс всегда <code>0</code>.',
      change: 'Меняй элементы массива и метод под задачу: <code>push</code> добавляет в конец, <code>pop</code> удаляет последний, <code>length</code> показывает количество.',
      check: 'Не путай номер элемента и длину массива: если длина <code>3</code>, последние данные лежат по индексу <code>2</code>.'
    }},
    { test: /display:\s*(flex|grid)|justify-content|align-items|grid-template|gap/i, data: {
      title: 'Как использовать раскладку CSS',
      where: 'Такой CSS ставь на родительский блок, внутри которого нужно расположить элементы: кнопки, карточки, колонки, меню.',
      change: 'Меняй <code>display</code>, <code>gap</code>, выравнивание и количество колонок. Flex чаще для одной линии или оси, Grid — для сетки из строк и колонок.',
      check: 'Если элементы не двигаются, возможно, ты поставил flex/grid не на родителя, а на сам элемент. Выравнивание работает именно для детей выбранного блока.'
    }},
    { test: /@media|max-width|min-width|clamp\(|vw|vh|rem/i, data: {
      title: 'Как использовать адаптив',
      where: 'Адаптивные правила ставь после обычных стилей, чтобы они могли их переопределить на нужной ширине экрана.',
      change: 'Меняй breakpoint, ширины, количество колонок, размер шрифта и отступы. На телефоне часто нужно делать одну колонку вместо нескольких.',
      check: 'Проверяй не только desktop, но и мобильную ширину в DevTools. Текст не должен вылезать из кнопок и карточек.'
    }},
    { test: /useState|useEffect|props|jsx|component|return\s*\(/i, data: {
      title: 'Как использовать React-компонент',
      where: 'Компонент — это самостоятельный кусок интерфейса. Его можно вынести в отдельный файл и подключить в другой компонент.',
      change: 'Меняй данные через props и состояние через <code>useState</code>. Разметку пиши в JSX, но помни: <code>class</code> превращается в <code>className</code>.',
      check: 'Если интерфейс не обновляется, проверь, меняешь ли ты state через setter. Прямое изменение массива или объекта React может не заметить.'
    }}
  ];

  const enRules = [
    { test: /addEventListener|preventDefault|submit|click|input|keydown|keyup|mouseover|scroll/i, data: { title:'How to use events', where:'Select an element first, then attach <code>addEventListener</code>. Buttons usually use <code>click</code>, inputs use <code>input</code>, forms use <code>submit</code>.', change:'Inside the handler, write what should happen after the user action: show text, validate a field, add a class, clear an input or send data.', check:'<code>preventDefault()</code> is not automatic. Use it mostly on form submit or links when JavaScript controls the behavior.' }},
    { test: /querySelector|getElement|classList|textContent|innerHTML|append|createElement|dataset/i, data: { title:'How to use DOM code', where:'Run DOM code after the HTML exists or connect the script with <code>defer</code>. The flow is: select element → make sure it exists → change text, class, attribute or append a new element.', change:'Change the selector to your own class or id. If you create an element with <code>createElement</code>, fill it with <code>textContent</code> and insert it with <code>append</code>.', check:'A wrong selector returns <code>null</code>. Calling methods on null breaks the script, so log the element while learning.' }},
    { test: /localStorage|setItem|getItem|JSON\.stringify|JSON\.parse/i, data: { title:'How to use localStorage', where:'Use <code>localStorage</code> for browser-only saved settings: theme, counter, note or progress. It is not a database or server.', change:'Save simple values as strings. For objects and arrays use <code>JSON.stringify</code>, then <code>JSON.parse</code> when reading.', check:'After page reload, code starts from zero. Read the saved value first, render the UI, then save again after changes.' }},
    { test: /fetch|async|await|then|catch|response\.json/i, data: { title:'How to use API requests', where:'Use this when data comes from outside: weather, currency rates, products or users. It usually lives inside an <code>async</code> function.', change:'Change URL, method, headers and response handling for the API. After <code>await fetch()</code>, convert the response with <code>await response.json()</code>.', check:'Requests can fail. Add <code>try/catch</code> or check <code>response.ok</code> before trusting the result.' }},
    { test: /if\s*\(|else|===|!==|&&|\|\||\?|:/i, data: { title:'How to use conditions', where:'Use conditions when the program must choose a path: empty field or not, age allowed or not, score above zero or not.', change:'Inside <code>if (...)</code>, write a check that becomes <code>true</code> or <code>false</code>. Use <code>===</code> for comparison, not a single <code>=</code>.', check:'<code>=</code> assigns, <code>===</code> compares. <code>&&</code> means “and”; <code>||</code> means “or”.' }},
    { test: /for\s*\(|while\s*\(|forEach|map\(|filter\(|reduce\(/i, data: { title:'How to use loops and iteration', where:'Use loops when an action repeats: walk through an array, create cards, calculate totals or filter data.', change:'Change the array, stop condition and action. Use <code>map</code> for a new array, <code>filter</code> for selection and <code>reduce</code> for totals.', check:'Arrays start at index <code>0</code>. In a normal <code>for</code>, update the counter or you can create an infinite loop.' }},
    { test: /function\s|=>|return|params?|arguments?/i, data: { title:'How to use functions', where:'Use a function when an action repeats or deserves a name: update counter, validate form, calculate total or render card.', change:'Parameters are input. <code>return</code> sends a result out. If the function only changes the page, return may not be needed.', check:'Pass a function to an event listener, not the result of calling it. Usually <code>handleClick</code>, not <code>handleClick()</code>.' }},
    { test: /\[|\.push|\.pop|\.shift|\.unshift|\.length/i, data: { title:'How to use arrays', where:'Use an array for a list of similar data: products, tasks, cards, names or numbers. The first index is always <code>0</code>.', change:'Change elements and methods for the task: <code>push</code> adds to the end, <code>pop</code> removes the last item, <code>length</code> returns count.', check:'Do not confuse index and length: if length is <code>3</code>, the last item is at index <code>2</code>.' }},
    { test: /display:\s*(flex|grid)|justify-content|align-items|grid-template|gap/i, data: { title:'How to use CSS layout', where:'Put this CSS on the parent block whose children need layout: buttons, cards, columns or menu items.', change:'Change <code>display</code>, <code>gap</code>, alignment and columns. Flex is better for one axis; Grid is better for rows and columns.', check:'If items do not move, you may have placed flex/grid on the child instead of the parent.' }},
    { test: /@media|max-width|min-width|clamp\(|vw|vh|rem/i, data: { title:'How to use responsive CSS', where:'Place responsive rules after base styles so they can override them at the target screen width.', change:'Change breakpoint, widths, column count, font size and spacing. On mobile, multiple columns often become one.', check:'Test desktop and mobile in DevTools. Text should not overflow buttons or cards.' }},
    { test: /useState|useEffect|props|jsx|component|return\s*\(/i, data: { title:'How to use a React component', where:'A component is an isolated UI piece. Move it to its own file and import it into another component when it grows.', change:'Change data through props and state through <code>useState</code>. JSX looks like HTML, but <code>class</code> becomes <code>className</code>.', check:'If UI does not update, check that you update state through its setter. Direct mutation of arrays/objects may not rerender.' }}
  ];

  function sectionId(block) {
    const section = block.closest('.section');
    return section ? section.id.replace('sec-', '') : 'js';
  }

  function chooseGuide(id, code, text) {
    const base = (isEnglishPage ? enBase : ruBase)[id] || (isEnglishPage ? enBase.js : ruBase.js);
    const rules = isEnglishPage ? enRules : ruRules;
    const haystack = `${code}\n${text}`;
    const found = ['js', 'ts'].includes(id) ? rules.find(rule => rule.test.test(haystack)) : null;
    return Object.assign({}, base, found ? found.data : null);
  }

  function escapeGuideText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  }

  function independentTask(id) {
    const tasks = isEnglishPage ? {
      html:'Recreate the structure with your own text and add one meaningful attribute.',
      css:'Change one layout property and one visual property, then explain which result each change caused.',
      js:'Change the input value or event, predict the result, and only then run the code.',
      ts:'Make one type stricter and handle the value that no longer fits it.',
      react:'Change one prop or state value and check which component rerenders.'
    } : {
      html:'Повтори структуру со своим текстом и добавь один осмысленный атрибут.',
      css:'Измени одно свойство раскладки и одно визуальное свойство, затем объясни результат каждого изменения.',
      js:'Измени входное значение или событие, предскажи результат и только потом запускай код.',
      ts:'Сделай один тип строже и обработай значение, которое теперь ему не подходит.',
      react:'Измени один prop или state и проверь, какой компонент перерисовался.'
    };
    return tasks[id] || tasks.js;
  }

  function makeGuide(data) {
    const labels = isEnglishPage
      ? { what:'What it is', where:'Where to put it', change:'What to change', mistake:'Common mistake', task:'Independent task' }
      : { what:'Что это', where:'Куда вставлять', change:'Что менять под себя', mistake:'Частая ошибка', task:'Самостоятельная задача' };
    const wrap = document.createElement('div');
    wrap.className = 'wdg-use-guide';
    wrap.innerHTML = `
      <div class="wdg-use-guide-head">
        <span class="wdg-use-dot"></span>
        <strong>${data.title}</strong>
      </div>
      <div class="wdg-use-grid">
        <p><b>${labels.what}:</b> ${data.what}</p>
        <p><b>${labels.where}:</b> ${data.where}</p>
        <p><b>${labels.change}:</b> ${data.change}</p>
        <p><b>${labels.mistake}:</b> ${data.check}</p>
        <p class="wdg-use-task"><b>${labels.task}:</b> ${data.task}</p>
      </div>`;
    return wrap;
  }

  function enhanceUsageGuides(root = document) {
    const blocks = root instanceof Element && root.matches('.section')
      ? root.querySelectorAll(':scope > .block')
      : document.querySelectorAll(sectionSelectors.map(id => `${id} .block`).join(','));
    blocks.forEach(block => {
      if (block.dataset.wdgUsageGuide === '1') return;
      const code = block.querySelector('.code');
      const anchor = block.querySelector('.explain') || code || block.querySelector('.tip, .items') || block.querySelector('.block-title');
      if (!anchor) return;
      const id = sectionId(block);
      const title = block.querySelector('.block-title')?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const explanation = block.querySelector('.explain, .tip')?.textContent?.replace(/\s+/g, ' ').trim();
      const data = chooseGuide(id, code?.textContent || '', title + ' ' + (block.querySelector('.tip')?.textContent || ''));
      data.what = escapeGuideText((explanation || (isEnglishPage ? 'This lesson introduces ' : 'Эта тема знакомит с: ') + title).slice(0, 320));
      data.task = independentTask(id);
      anchor.insertAdjacentElement('afterend', makeGuide(data));
      block.dataset.wdgUsageGuide = '1';
    });
  }

  function initUsageGuides() {
    enhanceUsageGuides();
    sectionSelectors.forEach(selector => {
      const section = document.querySelector(selector);
      if (!section) return;
      let frame = 0;
      new MutationObserver(() => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          enhanceUsageGuides(section);
        });
      }).observe(section, { childList:true });
    });
    window.WebDevGymUsageGuides = { enhance: enhanceUsageGuides };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUsageGuides);
  else initUsageGuides();
})();
