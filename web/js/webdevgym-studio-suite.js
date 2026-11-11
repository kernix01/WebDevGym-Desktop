(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  if (!runtime) {
    console.error('[WebDevGym] Shared runtime must load before Studio Suite.');
    return;
  }

  const { isEnglish, L, escapeHtml: esc, icon, readJson, writeJson, download, notify, emit } = runtime;
  const JOURNEY_KEY = 'wdg_project_journey_v1';
  const RECOVERY_KEY = 'wdg_recovery_v1';
  const RECOVERY_LIMIT = 8;
  const labCleanup = new WeakMap();
  let api = null;
  let journeyPage = null;
  let recoveryPage = null;

  const copy = {
    journey: L('Project journey', 'Путь проекта'),
    journeySub: L('Move from an idea to a finished project without losing the next step.', 'От идеи до готового проекта без потерянных шагов.'),
    recovery: L('Recovery center', 'Центр восстановления'),
    recoverySub: L('Local restore points without passwords, API keys or tokens.', 'Локальные точки восстановления без паролей, API-ключей и токенов.'),
    open: L('Open', 'Открыть'),
    continue: L('Continue', 'Продолжить'),
    completed: L('Completed', 'Готово'),
    mark: L('Mark completed', 'Отметить готовым'),
    addPortfolio: L('Add project to portfolio', 'Добавить проект в портфолио'),
    noForge: L('Finish the project steps first.', 'Сначала заверши этапы проекта.'),
    addedPortfolio: L('Project added to the local portfolio.', 'Проект добавлен в локальное портфолио.'),
    snapshot: L('Create restore point', 'Создать точку восстановления'),
    restore: L('Restore', 'Восстановить'),
    remove: L('Delete', 'Удалить'),
    saveFile: L('Download', 'Скачать'),
    noSnapshots: L('No restore points yet.', 'Точек восстановления пока нет.'),
    restored: L('Restore point applied. The page will reload.', 'Точка восстановления применена. Страница будет перезагружена.'),
    created: L('Restore point created.', 'Точка восстановления создана.'),
    confirmRestore: L('Restore this state? Current local data will be overwritten.', 'Восстановить это состояние? Текущие локальные данные будут перезаписаны.'),
    pagesTitle: L('Publish with GitHub Pages', 'Опубликовать через GitHub Pages'),
    pagesTip: L('Turn the uploaded repository into a public website. The token needs Pages and Administration write permissions.', 'Преврати загруженный репозиторий в публичный сайт. Токену нужны права Pages и Administration: write.'),
    pagesSource: L('Publishing source', 'Источник публикации'),
    pagesRoot: L('Repository root', 'Корень репозитория'),
    pagesDocs: L('/docs folder', 'Папка /docs'),
    publish: L('Publish site', 'Опубликовать сайт'),
    publishing: L('Configuring GitHub Pages...', 'Настраиваю GitHub Pages...'),
    published: L('GitHub Pages is configured.', 'GitHub Pages настроен.'),
    pagesMissing: L('Fill in Username, Repository, Token and Branch above.', 'Заполни Username, Repository, Token и ветку выше.'),
    pagesPermission: L('The token needs Pages: write and Administration: write permissions.', 'Токену нужны права Pages: write и Administration: write.'),
    viewSite: L('Open website', 'Открыть сайт')
  };

  function cleanupLab(target) {
    const cleanup = labCleanup.get(target);
    if (cleanup) cleanup();
    labCleanup.delete(target);
  }

  function setLabCleanup(target, cleanup) {
    cleanupLab(target);
    labCleanup.set(target, cleanup);
  }

  const xrayScenarios = [
    {
      id: 'condition',
      title: L('Variables and a condition', 'Переменные и условие'),
      code: [
        'const age = 17;',
        'const hasPermission = true;',
        'let access = "closed";',
        '',
        'if (age >= 18 || hasPermission) {',
        '  access = "open";',
        '}',
        '',
        'console.log(access);'
      ],
      steps: [
        { line:0, vars:{age:17}, stack:['global'], output:[], text:L('A constant named age receives the number 17.', 'Константа age получает число 17.') },
        { line:1, vars:{age:17,hasPermission:true}, stack:['global'], output:[], text:L('The second constant stores a boolean value.', 'Вторая константа хранит логическое значение.') },
        { line:2, vars:{age:17,hasPermission:true,access:'closed'}, stack:['global'], output:[], text:L('let is used because access will be reassigned later.', 'Используется let, потому что access позже изменится.') },
        { line:4, vars:{age:17,hasPermission:true,access:'closed'}, stack:['global','if condition'], output:[], text:L('age >= 18 is false, but hasPermission is true. With || one true side is enough.', 'age >= 18 ложно, но hasPermission истинно. Для || достаточно одной истинной части.') },
        { line:5, vars:{age:17,hasPermission:true,access:'open'}, stack:['global','if block'], output:[], text:L('The condition passed, so access is reassigned.', 'Условие прошло, поэтому access получает новое значение.') },
        { line:8, vars:{age:17,hasPermission:true,access:'open'}, stack:['global','console.log'], output:['open'], text:L('console.log receives the current value: open.', 'console.log получает текущее значение: open.') }
      ]
    },
    {
      id: 'counter',
      title: L('Interactive counter click', 'Клик по интерактивному счётчику'),
      code: [
        'const count = document.querySelector(".count");',
        'const plus = document.querySelector(".plus");',
        'let score = 0;',
        '',
        'plus.addEventListener("click", () => {',
        '  score += 1;',
        '  count.textContent = score;',
        '});'
      ],
      steps: [
        { line:0, vars:{count:'<output.count>'}, stack:['global'], output:[], text:L('querySelector finds the first .count element and stores its reference.', 'querySelector находит первый элемент .count и сохраняет ссылку на него.') },
        { line:1, vars:{count:'<output.count>',plus:'<button.plus>'}, stack:['global'], output:[], text:L('The button reference is saved once instead of searching on every click.', 'Ссылка на кнопку сохраняется один раз, чтобы не искать её при каждом клике.') },
        { line:2, vars:{count:'<output.count>',plus:'<button.plus>',score:0}, stack:['global'], output:['UI: 0'], text:L('score is application state. The interface currently shows the same value.', 'score — состояние приложения. Интерфейс пока показывает то же значение.') },
        { line:4, vars:{score:0,event:'click'}, stack:['global','click handler'], output:['UI: 0'], text:L('A click places the event handler on the call stack.', 'Клик помещает обработчик события в стек вызовов.') },
        { line:5, vars:{score:1,event:'click'}, stack:['global','click handler'], output:['UI: 0'], text:L('The state changes first: score becomes 1.', 'Сначала меняется состояние: score становится равен 1.') },
        { line:6, vars:{score:1,event:'click'}, stack:['global','click handler','interface update'], output:['UI: 1'], text:L('textContent synchronizes the interface with the new state.', 'textContent синхронизирует интерфейс с новым состоянием.') },
        { line:7, vars:{score:1}, stack:['global'], output:['UI: 1'], text:L('The handler finishes and leaves the call stack.', 'Обработчик завершается и покидает стек вызовов.') }
      ]
    },
    {
      id: 'event-loop',
      title: L('Event loop order', 'Порядок Event Loop'),
      code: [
        'console.log("A");',
        'setTimeout(() => console.log("B"), 0);',
        'Promise.resolve().then(() => console.log("C"));',
        'console.log("D");'
      ],
      steps: [
        { line:0, vars:{}, stack:['global','console.log'], output:['A'], text:L('Synchronous code runs immediately.', 'Синхронный код выполняется сразу.') },
        { line:1, vars:{timer:'queued'}, stack:['global','setTimeout'], output:['A'], text:L('The timer callback goes to the task queue, even with a zero delay.', 'Колбэк таймера отправляется в очередь задач даже с задержкой 0.') },
        { line:2, vars:{timer:'queued',promise:'microtask'}, stack:['global','Promise.then'], output:['A'], text:L('Promise.then queues a microtask. Microtasks run before timer tasks.', 'Promise.then ставит микрозадачу. Микрозадачи выполняются раньше таймеров.') },
        { line:3, vars:{timer:'queued',promise:'microtask'}, stack:['global','console.log'], output:['A','D'], text:L('The remaining synchronous line runs before either queue.', 'Оставшаяся синхронная строка выполняется раньше обеих очередей.') },
        { line:2, vars:{timer:'queued',promise:'done'}, stack:['microtask','Promise callback'], output:['A','D','C'], text:L('The microtask queue is drained first.', 'Сначала очищается очередь микрозадач.') },
        { line:1, vars:{timer:'done',promise:'done'}, stack:['task','timer callback'], output:['A','D','C','B'], text:L('Only then does the timer callback run.', 'Только после этого выполняется колбэк таймера.') }
      ]
    }
  ];

  const xrayState = { scenario:'condition', step:0, timer:null };

  function renderXray(target) {
    const scenario = xrayScenarios.find(item => item.id === xrayState.scenario) || xrayScenarios[0];
    target.innerHTML = '<section class="wdgs-lab"><header class="wdgs-lab-head"><div><span class="wdgl-kicker">' + icon('tabler:xray',16) + ' Code X-Ray</span><h2>' + esc(scenario.title) + '</h2><p>' + esc(L('Step through code and watch state, stack and output change together.', 'Проходи код по шагам и одновременно наблюдай состояние, стек и вывод.')) + '</p></div><label class="wdgs-select-label"><span>' + esc(L('Scenario','Сценарий')) + '</span><select data-xray-scenario>' + xrayScenarios.map(item => '<option value="' + item.id + '" ' + (item.id===scenario.id?'selected':'') + '>' + esc(item.title) + '</option>').join('') + '</select></label></header>' +
      '<div class="wdgs-xray-grid"><div class="wdgs-code" data-xray-code>' + scenario.code.map((line,index) => '<div data-code-line="' + index + '"><span>' + (index+1) + '</span><code>' + (line ? esc(line) : '&nbsp;') + '</code></div>').join('') + '</div>' +
      '<aside class="wdgs-inspector"><section><h3>' + esc(L('Variables','Переменные')) + '</h3><div data-xray-vars></div></section><section><h3>Call stack</h3><div data-xray-stack></div></section><section><h3>Console</h3><pre data-xray-output></pre></section></aside></div>' +
      '<footer class="wdgs-lab-footer"><div><strong data-xray-progress></strong><p data-xray-explain></p></div><div class="wdgl-actions"><button class="wdgl-btn" data-xray-reset>' + icon('tabler:player-skip-back',15) + esc(L('Reset','Сброс')) + '</button><button class="wdgl-btn" data-xray-prev>' + icon('tabler:chevron-left',15) + esc(L('Back','Назад')) + '</button><button class="wdgl-btn primary" data-xray-next>' + esc(L('Next step','Следующий шаг')) + icon('tabler:chevron-right',15) + '</button><button class="wdgl-btn" data-xray-run>' + icon('tabler:player-play',15) + esc(L('Auto run','Автозапуск')) + '</button></div></footer></section>';

    function paint() {
      const active = scenario.steps[Math.min(xrayState.step, scenario.steps.length - 1)];
      target.querySelectorAll('[data-code-line]').forEach(line => line.classList.toggle('active', Number(line.dataset.codeLine) === active.line));
      target.querySelector('[data-xray-vars]').innerHTML = Object.keys(active.vars).length ? Object.entries(active.vars).map(([name,value]) => '<div class="wdgs-var"><code>' + esc(name) + '</code><span>' + esc(JSON.stringify(value)) + '</span></div>').join('') : '<p class="wdgs-empty">' + esc(L('No variables yet','Переменных пока нет')) + '</p>';
      target.querySelector('[data-xray-stack]').innerHTML = active.stack.slice().reverse().map((item,index) => '<div class="wdgs-stack-frame" style="--depth:' + index + '">' + esc(item) + '</div>').join('');
      target.querySelector('[data-xray-output]').textContent = active.output.length ? active.output.join('\n') : L('No output','Вывода пока нет');
      target.querySelector('[data-xray-progress]').textContent = L('Step ','Шаг ') + (xrayState.step + 1) + ' / ' + scenario.steps.length;
      target.querySelector('[data-xray-explain]').textContent = active.text;
      target.querySelector('[data-xray-prev]').disabled = xrayState.step === 0;
      target.querySelector('[data-xray-next]').disabled = xrayState.step >= scenario.steps.length - 1;
    }

    function stop() {
      clearInterval(xrayState.timer);
      xrayState.timer = null;
      const run = target.querySelector('[data-xray-run]');
      if (run) run.innerHTML = icon('tabler:player-play',15) + esc(L('Auto run','Автозапуск'));
    }

    target.querySelector('[data-xray-scenario]').addEventListener('change', event => {
      stop();
      xrayState.scenario = event.target.value;
      xrayState.step = 0;
      renderXray(target);
    });
    target.querySelector('[data-xray-reset]').addEventListener('click', () => { stop(); xrayState.step = 0; paint(); });
    target.querySelector('[data-xray-prev]').addEventListener('click', () => { stop(); xrayState.step = Math.max(0,xrayState.step-1); paint(); });
    target.querySelector('[data-xray-next]').addEventListener('click', () => { stop(); xrayState.step = Math.min(scenario.steps.length-1,xrayState.step+1); paint(); });
    target.querySelector('[data-xray-run]').addEventListener('click', event => {
      if (xrayState.timer) return stop();
      if (xrayState.step >= scenario.steps.length - 1) xrayState.step = 0;
      event.currentTarget.innerHTML = icon('tabler:player-stop',15) + esc(L('Stop','Стоп'));
      paint();
      xrayState.timer = setInterval(() => {
        if (xrayState.step >= scenario.steps.length - 1) return stop();
        xrayState.step += 1;
        paint();
      }, 720);
    });
    setLabCleanup(target, stop);
    paint();
  }

  const domState = {
    mode:'bubble',
    selected:'button',
    rules:[
      { id:'element', selector:'button', specificity:'0-0-1', weight:1, color:'#38bdf8', enabled:true },
      { id:'class', selector:'.card button', specificity:'0-1-1', weight:11, color:'#c084fc', enabled:true },
      { id:'id', selector:'#saveButton', specificity:'1-0-0', weight:100, color:'#34d399', enabled:true }
    ]
  };

  function renderDomCss(target) {
    const timers = [];
    target.innerHTML = '<section class="wdgs-lab"><header class="wdgs-lab-head"><div><span class="wdgl-kicker">' + icon('tabler:hierarchy-2',16) + ' Interface Lab</span><h2>' + esc(L('See structure, events and cascade','Увидь структуру, события и каскад')) + '</h2><p>' + esc(L('Click the preview button, switch propagation direction and disable CSS rules.', 'Нажми кнопку в предпросмотре, меняй направление событий и отключай CSS-правила.')) + '</p></div></header>' +
      '<div class="wdgs-dom-grid"><section class="wdgs-dom-panel"><div class="wdgs-panel-title"><h3>DOM tree</h3><div class="wdgs-segment"><button data-event-mode="capture">Capture</button><button data-event-mode="bubble">Bubble</button></div></div><div class="wdgs-dom-tree"><button data-dom-node="app"><span>&lt;main id="app"&gt;</span></button><div><button data-dom-node="card"><span>&lt;article class="card"&gt;</span></button><div><button data-dom-node="button"><span>&lt;button id="saveButton"&gt;</span></button></div></div></div><div class="wdgs-event-log" data-event-log>' + esc(L('Click the button in the preview.','Нажми кнопку в предпросмотре.')) + '</div></section>' +
      '<section class="wdgs-dom-preview"><div class="wdgs-preview-app" data-preview-node="app"><article class="wdgs-preview-card" data-preview-node="card"><span>' + esc(L('Draft project','Черновик проекта')) + '</span><button id="wdgsPreviewButton" data-preview-node="button" type="button">' + esc(L('Save','Сохранить')) + '</button></article></div></section>' +
      '<section class="wdgs-dom-panel"><div class="wdgs-panel-title"><h3>CSS cascade</h3><span class="wdgl-chip" data-css-winner></span></div><div class="wdgs-rule-list">' + domState.rules.map(rule => '<label class="wdgs-css-rule"><input type="checkbox" data-css-rule="' + rule.id + '" ' + (rule.enabled?'checked':'') + '><span><code>' + esc(rule.selector) + '</code><small>specificity ' + rule.specificity + '</small></span><i style="--rule-color:' + rule.color + '"></i></label>').join('') + '</div><p class="wdgs-cascade-note" data-cascade-note></p></section></div></section>';

    function enabledWinner() {
      return domState.rules.filter(rule => rule.enabled).sort((a,b) => a.weight-b.weight).at(-1) || null;
    }

    function paint() {
      target.querySelectorAll('[data-event-mode]').forEach(button => button.classList.toggle('active',button.dataset.eventMode===domState.mode));
      target.querySelectorAll('[data-dom-node]').forEach(button => button.classList.toggle('active',button.dataset.domNode===domState.selected));
      target.querySelectorAll('[data-preview-node]').forEach(node => node.classList.toggle('selected',node.dataset.previewNode===domState.selected));
      const winner = enabledWinner();
      const previewButton = target.querySelector('#wdgsPreviewButton');
      previewButton.style.background = winner?.color || '#334155';
      target.querySelector('[data-css-winner]').textContent = winner ? winner.selector : L('browser default','стили браузера');
      target.querySelector('[data-cascade-note]').textContent = winner
        ? L(`${winner.selector} wins because its specificity ${winner.specificity} is the strongest enabled rule.`, `${winner.selector} побеждает: специфичность ${winner.specificity} выше остальных включённых правил.`)
        : L('All author rules are disabled, so the browser default is visible.', 'Все авторские правила отключены, поэтому виден стиль браузера.');
    }

    function animateEvent() {
      timers.splice(0).forEach(clearTimeout);
      const order = domState.mode === 'capture' ? ['app','card','button'] : ['button','card','app'];
      target.querySelectorAll('[data-preview-node]').forEach(node => node.classList.remove('event-active'));
      const log = target.querySelector('[data-event-log]');
      log.innerHTML = '';
      order.forEach((name,index) => {
        timers.push(setTimeout(() => {
          target.querySelector('[data-preview-node="' + name + '"]')?.classList.add('event-active');
          log.insertAdjacentHTML('beforeend','<span><b>' + (index+1) + '</b>' + esc(name + ' · ' + domState.mode) + '</span>');
        }, index * 260));
        timers.push(setTimeout(() => target.querySelector('[data-preview-node="' + name + '"]')?.classList.remove('event-active'), index * 260 + 520));
      });
    }

    target.querySelectorAll('[data-event-mode]').forEach(button => button.addEventListener('click', () => { domState.mode=button.dataset.eventMode; paint(); }));
    target.querySelectorAll('[data-dom-node]').forEach(button => button.addEventListener('click', () => { domState.selected=button.dataset.domNode; paint(); }));
    target.querySelectorAll('[data-css-rule]').forEach(input => input.addEventListener('change', () => {
      const rule=domState.rules.find(item=>item.id===input.dataset.cssRule);
      if(rule) rule.enabled=input.checked;
      paint();
    }));
    target.querySelector('#wdgsPreviewButton').addEventListener('click', animateEvent);
    setLabCleanup(target, () => timers.forEach(clearTimeout));
    paint();
  }

  const badA11ySample = '<!doctype html>\n<html>\n<head><title>Order</title></head>\n<body>\n  <h1>Checkout</h1>\n  <h3>Contact data</h3>\n  <img src="product.jpg">\n  <input id="email" type="email" placeholder="Email">\n  <button></button>\n  <p style="color:#aaaaaa;background:#ffffff">Important note</p>\n  <a>Continue</a>\n</body>\n</html>';
  const goodA11ySample = '<!doctype html>\n<html lang="en">\n<head><title>Order</title></head>\n<body>\n  <main>\n    <h1>Checkout</h1>\n    <h2>Contact data</h2>\n    <img src="product.jpg" alt="Black running shoes">\n    <label for="email">Email</label>\n    <input id="email" type="email" autocomplete="email">\n    <button type="submit">Send order</button>\n    <p style="color:#334155;background:#ffffff">Important note</p>\n    <a href="/next">Continue</a>\n  </main>\n</body>\n</html>';

  function parseHexColor(value) {
    const match = String(value || '').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    const hex = match[1].length === 3 ? match[1].split('').map(char => char + char).join('') : match[1];
    return [0,2,4].map(index => parseInt(hex.slice(index,index+2),16));
  }

  function luminance(rgb) {
    const channels = rgb.map(value => {
      const channel = value / 255;
      return channel <= .03928 ? channel / 12.92 : Math.pow((channel + .055) / 1.055, 2.4);
    });
    return .2126*channels[0] + .7152*channels[1] + .0722*channels[2];
  }

  function contrastRatio(foreground, background) {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first,second)+.05)/(Math.min(first,second)+.05);
  }

  function auditMarkup(markup) {
    const documentCopy = new DOMParser().parseFromString(markup, 'text/html');
    const issues = [];
    const add = (code, title, hint) => issues.push({code,title,hint});
    if (!documentCopy.documentElement.lang) add('lang',L('Page language is missing','Не указан язык страницы'),L('Add lang="en" or lang="ru" to <html>.','Добавь lang="en" или lang="ru" в <html>.'));
    if (!documentCopy.querySelector('main')) add('main',L('No main landmark','Нет основного ориентира main'),L('Wrap the primary page content in <main>.','Оберни основное содержимое страницы в <main>.'));
    documentCopy.querySelectorAll('img').forEach(image => { if (!image.hasAttribute('alt')) add('alt',L('Image has no alt text','У изображения нет alt'),L('Describe useful images or use alt="" for decorative ones.','Опиши полезное изображение или поставь alt="" для декоративного.')); });
    documentCopy.querySelectorAll('input,select,textarea').forEach(field => {
      const labelled = field.getAttribute('aria-label') || field.getAttribute('aria-labelledby') || Array.from(documentCopy.querySelectorAll('label[for]')).some(label => label.htmlFor === field.id) || field.closest('label');
      if (!labelled) add('label',L('Form field has no label','У поля формы нет label'),L('Connect <label for="..."> with the field id.','Свяжи <label for="..."> с id поля.'));
    });
    documentCopy.querySelectorAll('button').forEach(button => { if (!(button.textContent.trim() || button.getAttribute('aria-label'))) add('name',L('Button has no accessible name','У кнопки нет доступного имени'),L('Add visible text or aria-label.','Добавь видимый текст или aria-label.')); });
    documentCopy.querySelectorAll('a').forEach(anchor => { if (!anchor.hasAttribute('href')) add('link',L('Link has no href','У ссылки нет href'),L('Use a button for an action or add a real href for navigation.','Для действия используй button, а для перехода добавь настоящий href.')); });
    const ids = new Set();
    documentCopy.querySelectorAll('[id]').forEach(element => { if (ids.has(element.id)) add('id',L('Duplicate id: ','Повторяющийся id: ') + element.id,L('Every id must be unique on the page.','Каждый id на странице должен быть уникальным.')); ids.add(element.id); });
    let previousHeading = 0;
    documentCopy.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(heading => {
      const level=Number(heading.tagName.slice(1));
      if(previousHeading && level>previousHeading+1) add('heading',L('Heading level is skipped','Пропущен уровень заголовка'),L(`Use h${previousHeading+1} before h${level}.`,`Используй h${previousHeading+1} перед h${level}.`));
      previousHeading=level;
    });
    documentCopy.querySelectorAll('[tabindex]').forEach(element => { if (Number(element.getAttribute('tabindex')) > 0) add('tabindex',L('Positive tabindex changes natural order','Положительный tabindex ломает естественный порядок'),L('Prefer tabindex="0" or native focus order.','Используй tabindex="0" или естественный порядок фокуса.')); });
    documentCopy.querySelectorAll('[style]').forEach(element => {
      const style=element.getAttribute('style') || '';
      const color=parseHexColor(style.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3,6})/i)?.[1]);
      const background=parseHexColor(style.match(/background(?:-color)?\s*:\s*(#[0-9a-f]{3,6})/i)?.[1]);
      if(color&&background&&contrastRatio(color,background)<4.5) add('contrast',L('Text contrast is below 4.5:1','Контраст текста ниже 4.5:1'),L('Choose a darker foreground or a lighter background.','Выбери более тёмный текст или более светлый фон.'));
    });
    return issues;
  }

  function renderA11y(target) {
    target.innerHTML = '<section class="wdgs-lab"><header class="wdgs-lab-head"><div><span class="wdgl-kicker">' + icon('tabler:accessible',16) + ' Accessibility Lab</span><h2>' + esc(L('Audit markup before users find the problems','Проверь разметку раньше пользователей')) + '</h2><p>' + esc(L('The audit runs locally with DOMParser. Your code is not uploaded anywhere.', 'Проверка выполняется локально через DOMParser. Код никуда не отправляется.')) + '</p></div><div class="wdgs-a11y-score" data-a11y-score><strong>0</strong><span>/ 100</span></div></header><div class="wdgs-a11y-grid"><section class="wdgs-editor-panel"><div class="wdgs-panel-title"><h3>HTML</h3><div class="wdgl-actions"><button class="wdgl-btn" data-a11y-sample>' + esc(L('Broken sample','Пример с ошибками')) + '</button><button class="wdgl-btn" data-a11y-fix>' + icon('tabler:wand',15) + esc(L('Accessible sample','Доступный пример')) + '</button></div></div><textarea spellcheck="false" data-a11y-code></textarea><button class="wdgl-btn primary" data-a11y-run>' + icon('tabler:scan',15) + esc(L('Run audit','Запустить проверку')) + '</button></section><section class="wdgs-a11y-results"><div class="wdgs-panel-title"><h3>' + esc(L('Findings','Результаты')) + '</h3><span class="wdgl-chip" data-a11y-count></span></div><div data-a11y-results></div></section></div></section>';
    const editor=target.querySelector('[data-a11y-code]');
    editor.value=badA11ySample;

    function run() {
      const issues=auditMarkup(editor.value);
      const score=Math.max(0,100-issues.length*12);
      target.querySelector('[data-a11y-score] strong').textContent=score;
      target.querySelector('[data-a11y-score]').classList.toggle('good',score>=90);
      target.querySelector('[data-a11y-count]').textContent=issues.length ? issues.length + ' ' + L('issues','ошибок') : L('No issues','Ошибок нет');
      target.querySelector('[data-a11y-results]').innerHTML=issues.length ? issues.map(issue => '<article class="wdgs-a11y-issue"><span>' + icon('tabler:alert-triangle',17) + '</span><div><strong>' + esc(issue.title) + '</strong><p>' + esc(issue.hint) + '</p><code>' + esc(issue.code) + '</code></div></article>').join('') : '<div class="wdgs-a11y-clear">' + icon('tabler:circle-check-filled',30) + '<strong>' + esc(L('The checked rules passed.','Проверенные правила пройдены.')) + '</strong></div>';
    }
    target.querySelector('[data-a11y-run]').addEventListener('click',run);
    target.querySelector('[data-a11y-sample]').addEventListener('click',()=>{editor.value=badA11ySample;run();});
    target.querySelector('[data-a11y-fix]').addEventListener('click',()=>{editor.value=goodA11ySample;run();});
    setLabCleanup(target,()=>{});
    run();
  }

  window.WebDevGymStudioLabs = {
    render(id, target) {
      if (!target) return;
      if (id === 'xray') renderXray(target);
      if (id === 'domcss') renderDomCss(target);
      if (id === 'a11y') renderA11y(target);
    },
    destroy(target) { if (target) cleanupLab(target); }
  };

  function journeyState() {
    return readJson(JOURNEY_KEY,{manual:{},githubUrl:'',updatedAt:0});
  }

  function saveJourney(state) {
    state.updatedAt=Date.now();
    writeJson(JOURNEY_KEY,state);
    emit('journey-updated',state);
  }

  function forgeSummary() {
    if (window.WebDevGymForge?.current) return window.WebDevGymForge.current();
    const data=readJson('wdg_forge_v1',{workspaces:{},activeProject:'counter'});
    const entries=Object.entries(data.workspaces||{});
    const completed=entries.find(([,work])=>work?.completedAt);
    return completed ? {id:completed[0],title:completed[0],completed:true} : null;
  }

  function derivedJourney() {
    const state=journeyState();
    const lab=readJson('wdg_lab_v1',{examHistory:[]});
    const portfolio=readJson('wdg_portfolio_v1',[]);
    const completedTopic=Object.keys(localStorage).some(key=>key.startsWith('prog_')&&localStorage.getItem(key)==='1');
    const forge=forgeSummary();
    return {
      state,
      forge,
      status:{
        learn:Boolean(state.manual.learn||completedTopic),
        practice:Boolean(state.manual.practice||(lab.examHistory||[]).length),
        forge:Boolean(state.manual.forge||forge?.completed),
        github:Boolean(state.manual.github||state.githubUrl),
        portfolio:Boolean(state.manual.portfolio||portfolio.length)
      }
    };
  }

  const journeySteps = [
    {id:'learn',icon:'tabler:book-2',title:L('Understand one topic','Разобрать одну тему'),text:L('Read the explanation and complete its checklist.','Прочитай объяснение и выполни чек-лист.'),action:L('Open next topic','Открыть следующую тему')},
    {id:'practice',icon:'tabler:flask-2',title:L('Check understanding','Проверить понимание'),text:L('Use a trainer instead of copying a finished answer.','Используй тренажёр вместо копирования готового ответа.'),action:L('Open Code X-Ray','Открыть Code X-Ray')},
    {id:'forge',icon:'tabler:code',title:L('Build the feature','Собрать функцию'),text:L('Build a small project in Playground and check its behavior.','Собери небольшой проект в Playground и проверь его поведение.'),action:L('Open Playground','Открыть Playground')},
    {id:'github',icon:'tabler:brand-github',title:L('Publish the source','Опубликовать исходники'),text:L('Upload the project and enable GitHub Pages.','Загрузи проект и включи GitHub Pages.'),action:L('Open GitHub','Открыть GitHub')},
    {id:'portfolio',icon:'tabler:user-star',title:L('Show the result','Показать результат'),text:L('Add the finished project and its public link to your portfolio.','Добавь завершённый проект и публичную ссылку в портфолио.'),action:L('Open portfolio','Открыть портфолио')}
  ];

  function openJourneyStep(id) {
    if(id==='learn') {
      const topic=window.WebDevGymGrowth?.chooseLearn?.();
      if(topic) window.WebDevGymGrowth.openTopic(topic);
      else if(typeof window.switchTab==='function') window.switchTab('html');
    }
    if(id==='practice') window.WebDevGymLab?.open?.('xray');
    if(id==='forge') { api?.close?.(); if(typeof window.switchTab==='function') window.switchTab('playground'); }
    if(id==='github') { api?.close?.(); if(typeof window.switchTab==='function') window.switchTab('github'); }
    if(id==='portfolio') api?.open?.('profile');
  }

  function addForgeToPortfolio() {
    const summary=forgeSummary();
    if(!summary?.completed) return notify(copy.noForge);
    const list=readJson('wdg_portfolio_v1',[]);
    if(!list.some(item=>item.forgeProjectId===summary.id)) {
      list.unshift({title:summary.title||summary.id,description:summary.description||L('Project completed and checked in WebDevGym.','Проект собран и проверен в WebDevGym.'),link:journeyState().githubUrl||'',stack:'HTML, CSS, JavaScript',createdAt:Date.now(),forgeProjectId:summary.id});
      writeJson('wdg_portfolio_v1',list.slice(0,30));
    }
    const state=journeyState();state.manual.portfolio=true;saveJourney(state);
    notify(copy.addedPortfolio);
    api.open('journey');
  }

  const projectPathStages = [
    {id:'idea',icon:'tabler:bulb',title:L('Idea','Идея'),caption:L('Goal and scope','Цель и рамки'),tasks:[
      {id:'goal',title:L('Describe the result in one sentence','Опиши результат одним предложением'),hint:L('What should the visitor be able to do when the project is ready?','Что посетитель сможет сделать, когда проект будет готов?')},
      {id:'audience',title:L('Choose the audience','Определи аудиторию'),hint:L('Name one person or group the interface is built for.','Назови человека или группу, для которой создаётся интерфейс.')},
      {id:'stack',title:L('Fix the first stack','Зафиксируй первый стек'),hint:L('Start with the minimum: HTML, CSS and JavaScript.','Начни с минимума: HTML, CSS и JavaScript.')}
    ]},
    {id:'structure',icon:'tabler:sitemap',title:L('Structure','Структура'),caption:L('Pages and files','Страницы и файлы'),tasks:[
      {id:'map',title:L('Create a page map','Составь карту страниц'),hint:L('List the screens and how a visitor moves between them.','Перечисли экраны и переходы между ними.')},
      {id:'files',title:L('Prepare the file structure','Подготовь структуру файлов'),hint:L('Keep index.html, styles and scripts easy to find.','Сделай index.html, стили и скрипты понятными с первого взгляда.')},
      {id:'semantics',title:L('Outline semantic sections','Наметь семантические блоки'),hint:L('Use header, main, section and footer before styling.','Разметь header, main, section и footer до стилизации.')}
    ]},
    {id:'layout',icon:'tabler:layout-dashboard',title:L('Layout','Вёрстка'),caption:L('Responsive interface','Адаптивный интерфейс'),tasks:[
      {id:'skeleton',title:L('Build the page skeleton','Собери каркас страницы'),hint:L('The content order should make sense without CSS.','Порядок контента должен быть понятен даже без CSS.')},
      {id:'grid',title:L('Create the responsive grid','Собери адаптивную сетку'),hint:L('Check flexible widths before adding decorative details.','Проверь гибкие ширины до декоративных деталей.')},
      {id:'content',title:L('Add the main content section','Добавь основной контентный блок'),hint:L('Use real copy or realistic data instead of empty cards.','Используй реальный текст или правдоподобные данные вместо пустых карточек.')},
      {id:'mobile',title:L('Check the mobile layout','Проверь мобильную версию'),hint:L('No horizontal scroll, clipped text or tiny controls.','Без горизонтального скролла, обрезанного текста и мелких кнопок.')}
    ]},
    {id:'logic',icon:'tabler:braces',title:L('Logic','Логика'),caption:L('Behaviour and state','Поведение и состояние'),tasks:[
      {id:'events',title:L('Connect interface events','Подключи события интерфейса'),hint:L('Every button must have one predictable result.','У каждой кнопки должен быть один предсказуемый результат.')},
      {id:'form',title:L('Handle input and forms','Обработай ввод и формы'),hint:L('Validate empty values and show the result to the user.','Проверяй пустые значения и показывай результат пользователю.')},
      {id:'storage',title:L('Preserve useful state','Сохрани полезное состояние'),hint:L('Choose what should survive a reload and use a suitable persistence method.','Реши, какие данные должны пережить перезагрузку, и выбери подходящий способ сохранения.')},
      {id:'errors',title:L('Add empty and error states','Добавь пустые состояния и ошибки'),hint:L('The interface should explain what happened and what to do next.','Интерфейс должен объяснять, что случилось и что делать дальше.')}
    ]},
    {id:'test',icon:'tabler:shield-check',title:L('Testing','Проверка'),caption:L('Quality pass','Контроль качества'),tasks:[
      {id:'console',title:L('Clear console errors','Убери ошибки из консоли'),hint:L('Reload the page and repeat the main user flow.','Перезагрузи страницу и повтори основной сценарий.')},
      {id:'devices',title:L('Test three viewport sizes','Проверь три размера экрана'),hint:L('Use desktop, tablet and narrow mobile widths.','Проверь компьютер, планшет и узкий телефон.')},
      {id:'accessibility',title:L('Check keyboard and labels','Проверь клавиатуру и подписи'),hint:L('Controls need visible focus and understandable names.','Элементам нужны заметный фокус и понятные названия.')},
      {id:'edge',title:L('Try edge cases','Проверь крайние случаи'),hint:L('Use empty, long and unexpected values.','Испытай пустые, длинные и неожиданные значения.')}
    ]},
    {id:'publish',icon:'tabler:rocket',title:L('Publishing','Публикация'),caption:L('GitHub and portfolio','GitHub и портфолио'),tasks:[
      {id:'readme',title:L('Write a short README','Напиши короткий README'),hint:L('Explain what the project does, its stack and how to open it.','Опиши назначение, стек и способ запуска проекта.')},
      {id:'repository',title:L('Upload the source to GitHub','Загрузи исходники на GitHub'),hint:L('Keep the repository structure the same as the working project.','Сохрани структуру рабочего проекта в репозитории.')},
      {id:'pages',title:L('Publish the live page','Опубликуй живую страницу'),hint:L('Open the public URL in a private browser window.','Открой публичную ссылку в приватном окне браузера.')},
      {id:'portfolio',title:L('Add the project to the portfolio','Добавь проект в портфолио'),hint:L('Show the result, stack and public link.','Покажи результат, стек и публичную ссылку.')}
    ]}
  ];

  function projectPathState() {
    const saved=journeyState();
    saved.manual=saved.manual&&typeof saved.manual==='object'?saved.manual:{};
    saved.tasks=saved.tasks&&typeof saved.tasks==='object'?saved.tasks:{};
    saved.activity=Array.isArray(saved.activity)?saved.activity.slice(-120):[];
    saved.projectName=typeof saved.projectName==='string'?saved.projectName:'';
    saved.activeStage=projectPathStages.some(stage=>stage.id===saved.activeStage)?saved.activeStage:'';
    saved.note=typeof saved.note==='string'?saved.note:'';
    saved.lastCommit=typeof saved.lastCommit==='string'?saved.lastCommit:'';
    saved.githubUrl=typeof saved.githubUrl==='string'?saved.githubUrl:'';
    return saved;
  }

  function projectForgeSnapshot() {
    const stored=readJson('wdg_forge_v1',{workspaces:{},activeProject:'counter'});
    const id=stored.activeProject||'counter';
    const work=stored.workspaces?.[id]||{};
    const current=window.WebDevGymForge?.current?.()||{};
    return {
      id:current.id||id,
      title:current.title||id,
      description:current.description||'',
      completed:Boolean(current.completed||work.completedAt),
      updatedAt:Number(current.updatedAt||work.updatedAt)||0,
      completedAt:Number(work.completedAt)||0,
      results:Array.isArray(work.results)?work.results:[],
      source:{html:current.source?.html??work.html??'',css:current.source?.css??work.css??'',js:current.source?.js??work.js??''}
    };
  }

  function projectStageLegacyDone(stageId,state,forge,portfolio) {
    if(stageId==='idea')return Boolean(state.manual.idea||state.manual.learn||Object.keys(localStorage).some(key=>key.startsWith('prog_')&&localStorage.getItem(key)==='1'));
    if(stageId==='structure')return Boolean(state.manual.structure||state.manual.practice);
    if(stageId==='layout')return Boolean(state.manual.layout);
    if(stageId==='logic')return Boolean(state.manual.logic||state.manual.forge||forge.completed);
    if(stageId==='test')return Boolean(state.manual.test||(forge.results.length&&forge.results.every(Boolean)));
    if(stageId==='publish')return Boolean(state.manual.publish||state.manual.github||state.manual.portfolio||state.githubUrl||portfolio.length);
    return false;
  }

  function projectPathModel() {
    const state=projectPathState();
    const forge=projectForgeSnapshot();
    const portfolio=readJson('wdg_portfolio_v1',[]);
    const stages=projectPathStages.map(stage=>{
      const legacyDone=projectStageLegacyDone(stage.id,state,forge,portfolio);
      const checked=stage.tasks.filter(task=>legacyDone||Boolean(state.tasks?.[stage.id]?.[task.id])).length;
      return {...stage,checked,total:stage.tasks.length,complete:checked===stage.tasks.length,legacyDone};
    });
    const firstOpen=stages.find(stage=>!stage.complete)||stages.at(-1);
    const active=stages.find(stage=>stage.id===(state.activeStage||firstOpen.id))||firstOpen;
    const total=stages.reduce((sum,stage)=>sum+stage.total,0);
    const done=stages.reduce((sum,stage)=>sum+stage.checked,0);
    return {state,forge,portfolio,stages,active,total,done,health:Math.round(done/Math.max(total,1)*100)};
  }

  function openProjectPathTool(id) {
    if(id==='playground'){api?.close?.();if(typeof window.switchTab==='function')window.switchTab('playground');}
    if(id==='forge')window.WebDevGymTrainers?.open?.();
    if(id==='github'){api?.close?.();if(typeof window.switchTab==='function')window.switchTab('github');}
    if(id==='portfolio')api?.open?.('profile');
  }

  function projectLineCount(value) {
    const text=String(value||'').trim();
    return text?text.split(/\r?\n/).length:0;
  }

  function projectActivityDays(model) {
    const events=[...model.state.activity];
    if(model.forge.updatedAt)events.push({at:model.forge.updatedAt,type:'forge'});
    if(model.forge.completedAt)events.push({at:model.forge.completedAt,type:'test'});
    if(model.state.lastCommit)events.push({at:model.state.updatedAt,type:'github'});
    const days=[];
    for(let offset=27;offset>=0;offset-=1){
      const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-offset);
      const next=date.getTime()+86400000;
      days.push({date,count:events.filter(event=>Number(event.at)>=date.getTime()&&Number(event.at)<next).length});
    }
    return days;
  }

  function projectTaskChecked(model,stage,task) {
    return stage.legacyDone||Boolean(model.state.tasks?.[stage.id]?.[task.id]);
  }

  function projectFilesHtml(model) {
    const files=[
      {name:'index.html',icon:'tabler:brand-html5',value:model.forge.source.html},
      {name:'style.css',icon:'tabler:brand-css3',value:model.forge.source.css},
      {name:'script.js',icon:'tabler:brand-javascript',value:model.forge.source.js}
    ];
    return files.map(file=>'<button type="button" class="wdgp-file" data-project-tool="playground"><span class="wdgp-file-icon">'+icon(file.icon,17)+'</span><span><strong>'+esc(file.name)+'</strong><small>'+projectLineCount(file.value)+' '+esc(L('lines','строк'))+'</small></span><span>'+icon('tabler:chevron-right',15)+'</span></button>').join('');
  }

  function renderProjectPathBody(model) {
    const active=model.active;
    const projectName=model.state.projectName||model.forge.title||L('Developer portfolio','Портфолио разработчика');
    const heat=projectActivityDays(model);
    const tests=model.forge.results.length?Math.round(model.forge.results.filter(Boolean).length/model.forge.results.length*100):0;
    const lastEvent=[...model.state.activity].sort((a,b)=>Number(b.at)-Number(a.at))[0];
    const statusText=lastEvent?L('Updated ','Обновлено ')+new Date(lastEvent.at).toLocaleString(isEnglish?'en-US':'ru-RU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):L('No project actions yet','Действий по проекту пока нет');
    const hasSource=Object.values(model.forge.source).some(Boolean);
    const nextTask=active.tasks.find(task=>!projectTaskChecked(model,active,task));
    return '<div class="wdgp-workspace">'+
      '<section class="wdgp-projectbar"><label><span>'+esc(L('Active project','Активный проект'))+'</span><select data-project-select><option>'+esc(projectName)+'</option>'+(model.forge.title&&model.forge.title!==projectName?'<option>'+esc(model.forge.title)+'</option>':'')+'</select></label><span class="wdgp-project-state"><i></i>'+esc(L('In progress','В работе'))+'</span><div class="wdgp-project-actions"><button class="wdgf-btn" data-project-new>'+icon('tabler:folder-plus',16)+esc(L('New project','Новый проект'))+'</button><button class="wdgf-btn primary" data-project-tool="playground">'+icon('tabler:code',16)+esc(L('Open Playground editor','Открыть редактор Playground'))+'</button></div></section>'+
      '<nav class="wdgp-pipeline" aria-label="'+esc(L('Project stages','Этапы проекта'))+'">'+model.stages.map((stage,index)=>'<button type="button" class="wdgp-stage '+(stage.complete?'is-complete ':'')+(stage.id===active.id?'is-active':'')+'" data-project-stage="'+stage.id+'"><span class="wdgp-stage-number">'+(stage.complete?icon('tabler:check',17):index+1)+'</span><span><strong>'+esc(stage.title)+'</strong><small>'+stage.checked+'/'+stage.total+' · '+esc(stage.caption)+'</small></span></button>').join('')+'</nav>'+
      '<div class="wdgp-grid"><section class="wdgp-panel wdgp-tasks"><header><div><span class="wdgp-eyebrow">'+esc(L('Current stage','Текущий этап'))+'</span><h2>'+esc(active.title)+'</h2></div><strong>'+active.checked+'/'+active.total+'</strong></header><div class="wdgp-task-list">'+active.tasks.map(task=>{const checked=projectTaskChecked(model,active,task);return '<label class="wdgp-task '+(checked?'is-done':'')+'"><input type="checkbox" data-project-task="'+task.id+'" data-stage="'+active.id+'" '+(checked?'checked':'')+'><span class="wdgp-check">'+icon('tabler:check',14)+'</span><span><strong>'+esc(task.title)+'</strong><small>'+esc(task.hint)+'</small></span></label>';}).join('')+'</div><label class="wdgp-note"><span>'+icon('tabler:note',15)+esc(L('Stage note','Заметка к этапу'))+'</span><textarea rows="3" data-project-note placeholder="'+esc(L('Decision, problem or next move...','Решение, проблема или следующий шаг...'))+'">'+esc(model.state.note)+'</textarea></label></section>'+
      '<section class="wdgp-panel wdgp-files"><header><div><span class="wdgp-eyebrow">'+esc(L('Project files','Файлы проекта'))+'</span><h2>'+esc(model.forge.title||projectName)+'</h2></div><button type="button" class="wdgp-icon-button" data-project-tool="playground" title="'+esc(L('Open editor','Открыть редактор'))+'">'+icon('tabler:external-link',17)+'</button></header><div class="wdgp-tree-head"><span>'+icon('tabler:folder-open',16)+' project /</span><small>'+esc(model.forge.updatedAt?L('Local workspace','Локальное рабочее пространство'):L('Starter structure','Начальная структура'))+'</small></div><div class="wdgp-file-list">'+projectFilesHtml(model)+'</div><div class="wdgp-code-preview"><div><span></span><span></span><span></span><small>'+esc(L('Current workspace','Текущее пространство'))+'</small></div><pre><code>'+esc((model.forge.source.html||'<main class="project">\n  <h1>'+projectName+'</h1>\n</main>').split(/\r?\n/).slice(0,10).join('\n'))+'</code></pre></div></section>'+
      '<aside class="wdgp-panel wdgp-inspector"><header><div><span class="wdgp-eyebrow">'+esc(L('Inspector','Инспектор'))+'</span><h2>'+esc(L('Project health','Состояние проекта'))+'</h2></div><strong class="wdgp-health">'+model.health+'%</strong></header><div class="wdgp-healthbar"><span style="width:'+model.health+'%"></span></div><dl class="wdgp-stats"><div><dt>'+esc(L('Current stage','Текущий этап'))+'</dt><dd>'+esc(active.title)+'</dd></div><div><dt>'+esc(L('Project checks','Проверки проекта'))+'</dt><dd>'+tests+'%</dd></div><div><dt>'+esc(L('Next checkpoint','Следующая точка'))+'</dt><dd>'+esc(nextTask?.title||L('Choose the next stage','Выбери следующий этап'))+'</dd></div></dl><div class="wdgp-activity"><div><strong>'+esc(L('Activity · 4 weeks','Активность · 4 недели'))+'</strong><small>'+esc(L('Real local actions','Реальные локальные действия'))+'</small></div><div class="wdgp-heatmap">'+heat.map(day=>'<span class="level-'+Math.min(day.count,3)+'" title="'+esc(day.date.toLocaleDateString(isEnglish?'en-US':'ru-RU'))+' · '+day.count+'"></span>').join('')+'</div></div><div class="wdgp-deps"><strong>'+esc(L('Connections','Связи'))+'</strong><span class="'+(hasSource?'ready':'')+'">'+icon('tabler:code',15)+' Playground <small>'+(hasSource?esc(L('synced','синхр.')):esc(L('empty','пусто')))+'</small></span><span class="'+(model.forge.results.length?'ready':'')+'">'+icon('tabler:checklist',15)+' '+esc(L('Criteria','Критерии'))+' <small>'+model.forge.results.filter(Boolean).length+'/'+model.forge.results.length+'</small></span><span class="'+(model.state.githubUrl||model.state.lastCommit?'ready':'')+'">'+icon('tabler:brand-github',15)+' GitHub <small>'+(model.state.githubUrl||model.state.lastCommit?esc(L('linked','связан')):esc(L('not linked','не связан')))+'</small></span></div><div class="wdgp-inspector-actions"><button class="wdgf-btn" data-project-tool="github">'+icon('tabler:brand-github',16)+esc(L('Publish','Опубликовать'))+'</button><button class="wdgf-btn" data-project-portfolio>'+icon('tabler:user-plus',16)+esc(L('To portfolio','В портфолио'))+'</button></div></aside></div>'+
      '<footer class="wdgp-status"><span>'+icon('tabler:cloud-check',15)+esc(statusText)+'</span><span>'+model.done+'/'+model.total+' '+esc(L('project tasks','задач проекта'))+'</span><span>'+icon('tabler:database',14)+esc(L('Saved locally','Сохранено локально'))+'</span></footer></div>';
  }

  function bindProjectPath(page) {
    page.querySelectorAll('[data-project-stage]').forEach(button=>button.addEventListener('click',()=>{const state=projectPathState();state.activeStage=button.dataset.projectStage;saveJourney(state);api.open('journey');}));
    page.querySelectorAll('[data-project-task]').forEach(input=>input.addEventListener('change',()=>{const state=projectPathState();const stage=input.dataset.stage;state.tasks[stage]=state.tasks[stage]||{};state.tasks[stage][input.dataset.projectTask]=input.checked;state.activity.push({at:Date.now(),type:'task',stage,task:input.dataset.projectTask,done:input.checked});saveJourney(state);api.open('journey');}));
    page.querySelectorAll('[data-project-tool]').forEach(button=>button.addEventListener('click',()=>openProjectPathTool(button.dataset.projectTool)));
    page.querySelector('[data-project-select]')?.addEventListener('change',event=>{const state=projectPathState();state.projectName=event.target.value;saveJourney(state);api.open('journey');});
    page.querySelector('[data-project-new]')?.addEventListener('click',()=>{const name=prompt(L('Project name','Название проекта'),L('My web project','Мой веб-проект'));if(!name?.trim())return;if(!confirm(L('Create a clean project path? The previous path data stays in browser recovery snapshots.','Создать чистый путь проекта? Предыдущие данные останутся в точках восстановления браузера.')))return;createSnapshot('before-new-project',true);const state=projectPathState();state.projectName=name.trim();state.activeStage='idea';state.tasks={};state.note='';state.activity=[{at:Date.now(),type:'project',stage:'idea'}];state.manual={};state.githubUrl='';state.lastCommit='';saveJourney(state);api.open('journey');});
    page.querySelector('[data-project-note]')?.addEventListener('change',event=>{const state=projectPathState();state.note=event.target.value;saveJourney(state);});
    page.querySelector('[data-project-portfolio]')?.addEventListener('click',addForgeToPortfolio);
  }
  function renderJourney() {
    const model=projectPathModel();
    journeyPage=api.pageShell('journey',copy.journey,copy.journeySub,renderProjectPathBody(model));
    journeyPage.classList.add('wdgp-page');
    bindProjectPath(journeyPage);
    return journeyPage;
  }

  function snapshotHash(storage) {
    const source=JSON.stringify(storage);
    let hash=2166136261;
    for(let index=0;index<source.length;index+=1){hash^=source.charCodeAt(index);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16);
  }

  function snapshots() {
    const value=readJson(RECOVERY_KEY,[]);
    return Array.isArray(value)?value:[];
  }

  function createSnapshot(reason='manual',silent=false) {
    const storage=runtime.safeStorageSnapshot();
    const list=snapshots();
    const hash=snapshotHash(storage);
    if(list[0]?.hash===hash) return list[0];
    const snapshot={id:'restore-'+Date.now().toString(36),createdAt:Date.now(),reason,hash,storage};
    list.unshift(snapshot);
    writeJson(RECOVERY_KEY,list.slice(0,RECOVERY_LIMIT));
    if(!silent) notify(copy.created);
    emit('recovery-created',{id:snapshot.id,reason});
    return snapshot;
  }

  function restoreSnapshot(id) {
    const snapshot=snapshots().find(item=>item.id===id);
    if(!snapshot||!confirm(copy.confirmRestore))return;
    createSnapshot('before-restore',true);
    runtime.restoreStorageSnapshot(snapshot.storage);
    notify(copy.restored);
    setTimeout(()=>location.reload(),500);
  }

  function renderRecovery() {
    const list=snapshots();
    const body='<div class="wdgs-recovery-head"><button class="wdgf-btn primary" data-recovery-create>' + icon('tabler:device-floppy',16) + copy.snapshot + '</button><span>' + esc(L('Up to eight local restore points. Sensitive keys are always excluded.','До восьми локальных точек. Секретные ключи всегда исключаются.')) + '</span></div><div class="wdgs-recovery-list">' + (list.length?list.map(item=>{const size=new Blob([JSON.stringify(item.storage)]).size;return '<article><div class="wdgs-recovery-icon">' + icon(item.reason==='manual'?'tabler:bookmark':'tabler:clock-shield',20) + '</div><div><strong>' + esc(new Date(item.createdAt).toLocaleString(isEnglish?'en-US':'ru-RU')) + '</strong><span>' + esc(item.reason) + ' · ' + Math.max(1,Math.round(size/1024)) + ' KB · ' + Object.keys(item.storage||{}).length + ' keys</span></div><div class="wdgl-actions"><button class="wdgf-btn" data-recovery-restore="' + item.id + '">' + copy.restore + '</button><button class="wdgf-btn" data-recovery-download="' + item.id + '" title="' + copy.saveFile + '">' + icon('tabler:download',16) + '</button><button class="wdgf-btn danger" data-recovery-remove="' + item.id + '" title="' + copy.remove + '">' + icon('tabler:trash',16) + '</button></div></article>';}).join(''):'<div class="wdgf-empty">' + esc(copy.noSnapshots) + '</div>') + '</div>';
    recoveryPage=api.pageShell('recovery',copy.recovery,copy.recoverySub,body);
    recoveryPage.querySelector('[data-recovery-create]').addEventListener('click',()=>{createSnapshot();api.open('recovery');});
    recoveryPage.querySelectorAll('[data-recovery-restore]').forEach(button=>button.addEventListener('click',()=>restoreSnapshot(button.dataset.recoveryRestore)));
    recoveryPage.querySelectorAll('[data-recovery-download]').forEach(button=>button.addEventListener('click',()=>{const item=snapshots().find(snapshot=>snapshot.id===button.dataset.recoveryDownload);if(item)download(JSON.stringify({app:'WebDevGym',version:61,type:'restore-point',...item},null,2),'webdevgym-restore-'+item.id+'.json');}));
    recoveryPage.querySelectorAll('[data-recovery-remove]').forEach(button=>button.addEventListener('click',()=>{writeJson(RECOVERY_KEY,snapshots().filter(item=>item.id!==button.dataset.recoveryRemove));api.open('recovery');}));
    return recoveryPage;
  }

  async function githubPagesRequest(url,token,options={}) {
    const response=await fetch(url,{...options,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})}});
    const result=response.status===204?{}:await response.json().catch(()=>({}));
    if(!response.ok){const error=new Error(result.message||'GitHub API: '+response.status);error.status=response.status;throw error;}
    return result;
  }

  async function publishPages(panel) {
    const username=document.getElementById('gh-username')?.value.trim();
    const repo=document.getElementById('gh-repo')?.value.trim();
    const token=document.getElementById('gh-token')?.value.trim();
    const branch=document.getElementById('gh-branch')?.value.trim()||'main';
    const path=panel.querySelector('[data-pages-path]').value;
    const status=panel.querySelector('[data-pages-status]');
    const button=panel.querySelector('[data-pages-publish]');
    if(!username||!repo||!token)return void(status.textContent=copy.pagesMissing);
    button.disabled=true;status.className='wdgs-pages-status progress';status.textContent=copy.publishing;
    const url='https://api.github.com/repos/'+encodeURIComponent(username)+'/'+encodeURIComponent(repo)+'/pages';
    try{
      let existing=null;
      try{existing=await githubPagesRequest(url,token);}catch(error){if(error.status!==404)throw error;}
      const payload=JSON.stringify({build_type:'legacy',source:{branch,path}});
      const result=await githubPagesRequest(url,token,{method:existing?'PUT':'POST',body:payload});
      const info=result.html_url?result:await githubPagesRequest(url,token);
      const siteUrl=info.html_url||('https://'+username.toLowerCase()+'.github.io/'+repo.replace(/\.github\.io$/i,'')+'/');
      status.className='wdgs-pages-status success';
      status.innerHTML='<strong>'+esc(copy.published)+'</strong><a href="'+esc(siteUrl)+'" target="_blank" rel="noopener">'+icon('tabler:external-link',15)+esc(copy.viewSite)+'</a>';
      const state=journeyState();state.githubUrl=siteUrl;state.manual.github=true;saveJourney(state);
      emit('pages-published',{username,repo,branch,path,url:siteUrl});
    }catch(error){status.className='wdgs-pages-status error';status.textContent=(error.status===403?copy.pagesPermission:error.message);}
    finally{button.disabled=false;}
  }

  function enhanceGithubPages() {
    const block=document.getElementById('block-git-github-upload');
    if(!block||document.getElementById('wdgsGithubPages'))return false;
    const panel=document.createElement('div');
    panel.id='wdgsGithubPages';panel.className='wdgs-pages-panel';
    panel.innerHTML='<div class="wdgs-pages-copy"><span>'+icon('tabler:world-upload',22)+'</span><div><h3>'+esc(copy.pagesTitle)+'</h3><p>'+esc(copy.pagesTip)+'</p></div></div><div class="wdgs-pages-controls"><label><span>'+esc(copy.pagesSource)+'</span><select data-pages-path><option value="/">'+esc(copy.pagesRoot)+'</option><option value="/docs">'+esc(copy.pagesDocs)+'</option></select></label><button class="wdgf-btn primary" data-pages-publish>'+icon('tabler:rocket',16)+esc(copy.publish)+'</button></div><div class="wdgs-pages-status" data-pages-status></div>';
    block.insertAdjacentElement('afterend',panel);
    panel.querySelector('[data-pages-publish]').addEventListener('click',()=>publishPages(panel));
    return true;
  }

  function installNavigation() {
    runtime.createNavigationButton({id:'wdgsJourneyNav',feature:'journey',icon:'tabler:route-2',label:copy.journey,after:'#wdgGrowthNavBtn',onClick:()=>api.open('journey')});
    runtime.createNavigationButton({id:'wdgsRecoveryNav',feature:'recovery',icon:'tabler:restore',label:copy.recovery,after:'#wdgfProfileBtn',onClick:()=>api.open('recovery')});
  }

  function installAutomaticRecovery() {
    setTimeout(()=>{
      const list=snapshots();
      const stale=!list[0]||Date.now()-list[0].createdAt>6*60*60*1000;
      if(stale)createSnapshot('automatic',true);
    },1800);
    document.addEventListener('webdevgym:before-import',()=>createSnapshot('before-import',true));
  }

  function init(features) {
    api=features;
    api.register('journey',renderJourney,{title:copy.journey,icon:'tabler:route-2',group:L('Learning','Обучение')});
    api.register('recovery',renderRecovery,{title:copy.recovery,icon:'tabler:restore',group:L('System','Система')});
    installNavigation();
    installAutomaticRecovery();
    if(!enhanceGithubPages()){
      let attempts=0;const timer=setInterval(()=>{attempts+=1;if(enhanceGithubPages()||attempts>50)clearInterval(timer);},100);
    }
    document.addEventListener('webdevgym:github-uploaded',event=>{const state=journeyState();state.manual.github=true;state.lastCommit=event.detail?.commitUrl||'';saveJourney(state);});
    document.addEventListener('webdevgym:forge-complete',()=>{const state=journeyState();state.manual.forge=true;saveJourney(state);});
    window.WebDevGymStudioSuite={openJourney:()=>api.open('journey'),openRecovery:()=>api.open('recovery'),createSnapshot};
  }

  runtime.waitForFeatures(init);
})();
