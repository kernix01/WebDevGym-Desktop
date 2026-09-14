(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  const isEnglish = runtime?.isEnglish ?? (document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname));
  const L = runtime?.L || ((en, ru) => isEnglish ? en : ru);
  const icon = runtime?.icon || ((name, size = 17) => '<iconify-icon icon="' + name + '" width="' + size + '" height="' + size + '"></iconify-icon>');
  const esc = runtime?.escapeHtml || (value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]));
  const KEY = 'wdg_api_lab_v1';
  const users = [
    {id: 1, name: 'Mira', role: 'Frontend'},
    {id: 2, name: 'Alex', role: 'Backend'},
    {id: 3, name: 'Sam', role: 'QA'}
  ];

  const t = {
    title: L('API Lab', 'API Lab'),
    subtitle: L('Send requests, inspect responses and learn the contract between frontend and server.', 'Отправляй запросы, разбирай ответы и понимай контракт между фронтендом и сервером.'),
    guided: L('Guided', 'С подсказками'),
    independent: L('Independent', 'Самостоятельно'),
    progress: L('Progress', 'Прогресс'),
    scenarios: L('Scenarios', 'Сценарии'),
    request: L('Request', 'Запрос'),
    response: L('Response', 'Ответ'),
    send: L('Send request', 'Отправить запрос'),
    sending: L('Sending...', 'Отправка...'),
    body: L('JSON body', 'Тело JSON'),
    code: L('Equivalent fetch code', 'Такой же запрос через fetch'),
    copy: L('Copy', 'Копировать'),
    copied: L('Copied', 'Скопировано'),
    task: L('Task', 'Задача'),
    result: L('Check result', 'Результат проверки'),
    completed: L('Scenario completed', 'Сценарий пройден'),
    tryAgain: L('The server answered, but the request does not match the task yet.', 'Сервер ответил, но запрос пока не соответствует задаче.'),
    noResponse: L('Send a request to see status, time and JSON here.', 'Отправь запрос, чтобы увидеть здесь статус, время и JSON.'),
    history: L('Recent requests', 'Последние запросы'),
    reset: L('Reset progress', 'Сбросить прогресс'),
    latency: L('Latency', 'Задержка'),
    docs: L('Open Fetch API docs', 'Открыть документацию Fetch API'),
    badJson: L('The request body must contain valid JSON.', 'В теле запроса должен быть корректный JSON.'),
    hintHidden: L('Hints are hidden. Build the request from the task title and inspect the response.', 'Подсказки скрыты. Собери запрос по названию задачи и разбери ответ.'),
    allDone: L('All API scenarios completed', 'Все сценарии API пройдены')
  };

  const scenarios = [
    {
      id: 'list', method: 'GET', path: '/api/users', status: 200,
      title: L('Get a collection', 'Получить коллекцию'),
      goal: L('Request the users list and get a 200 response with an array.', 'Запроси список пользователей и получи ответ 200 с массивом.'),
      why: L('GET reads data. A successful read usually returns 200 OK.', 'GET читает данные. Успешное чтение обычно возвращает 200 OK.')
    },
    {
      id: 'single', method: 'GET', path: '/api/users/2', status: 200,
      title: L('Get one resource', 'Получить один ресурс'),
      goal: L('Request the user with id 2. Notice how the id becomes part of the URL.', 'Запроси пользователя с id 2. Обрати внимание: id становится частью URL.'),
      why: L('A resource URL identifies one entity instead of the whole collection.', 'URL ресурса указывает на одну сущность, а не на всю коллекцию.')
    },
    {
      id: 'create', method: 'POST', path: '/api/users', status: 201,
      body: '{\n  "name": "Nina",\n  "role": "Frontend"\n}',
      title: L('Create a resource', 'Создать ресурс'),
      goal: L('Send a POST request with a name. A created resource should return 201.', 'Отправь POST с полем name. Созданный ресурс должен вернуть статус 201.'),
      why: L('POST sends new data. JSON.stringify converts an object into the request body.', 'POST отправляет новые данные. JSON.stringify превращает объект в тело запроса.')
    },
    {
      id: 'validation', method: 'POST', path: '/api/users', status: 400,
      body: '{\n  "role": "Frontend"\n}',
      title: L('Handle bad input', 'Обработать неверные данные'),
      goal: L('Send a user without a name and inspect the 400 validation error.', 'Отправь пользователя без имени и разбери ошибку валидации 400.'),
      why: L('400 means the request reached the server, but its input is invalid.', '400 означает: запрос дошёл до сервера, но входные данные неверны.')
    },
    {
      id: 'missing', method: 'GET', path: '/api/users/99', status: 404,
      title: L('Handle a missing resource', 'Обработать отсутствие ресурса'),
      goal: L('Request a user that does not exist and inspect the 404 response.', 'Запроси несуществующего пользователя и разбери ответ 404.'),
      why: L('404 is a valid API response. Your interface should handle it deliberately.', '404 — нормальный ответ API. Интерфейс должен обрабатывать его явно.')
    },
    {
      id: 'server', method: 'GET', path: '/api/crash', status: 500,
      title: L('Handle a server failure', 'Обработать сбой сервера'),
      goal: L('Trigger a 500 response and see why response.ok must be checked.', 'Получи ответ 500 и посмотри, зачем проверять response.ok.'),
      why: L('fetch resolves even for 404 or 500. Throw an error yourself when response.ok is false.', 'fetch завершается даже при 404 или 500. Ошибку нужно выбросить самому, если response.ok равен false.')
    }
  ];

  let host = null;
  let runToken = 0;
  let activity = () => {};
  let state = readState();

  function defaults() {
    return {current: 'list', completed: [], independent: false, latency: 450, history: []};
  }

  function readState() {
    const base = defaults();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      const completed = Array.isArray(saved.completed) ? saved.completed.filter(id => scenarios.some(item => item.id === id)) : [];
      return {...base, ...saved, completed, history: Array.isArray(saved.history) ? saved.history.slice(0, 6) : []};
    } catch (error) {
      return base;
    }
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) {}
  }

  function currentScenario() {
    return scenarios.find(item => item.id === state.current) || scenarios[0];
  }

  function statusText(status) {
    return ({200: 'OK', 201: 'Created', 400: 'Bad Request', 404: 'Not Found', 500: 'Server Error'})[status] || 'Response';
  }

  function jsonResponse(status, body, latency) {
    return {ok: status >= 200 && status < 300, status, statusText: statusText(status), body, latency};
  }

  function mockRequest(method, path, rawBody, latency) {
    return new Promise(resolve => {
      window.setTimeout(() => {
        const cleanPath = path.trim().split('?')[0].replace(/\/$/, '') || '/';
        if (cleanPath === '/api/crash') {
          resolve(jsonResponse(500, {error: 'Internal server error', requestId: 'mock-' + Date.now().toString(36)}, latency));
          return;
        }
        if (method === 'GET' && cleanPath === '/api/users') {
          resolve(jsonResponse(200, {data: users, total: users.length}, latency));
          return;
        }
        const userMatch = cleanPath.match(/^\/api\/users\/(\d+)$/);
        if (method === 'GET' && userMatch) {
          const user = users.find(item => item.id === Number(userMatch[1]));
          resolve(user ? jsonResponse(200, {data: user}, latency) : jsonResponse(404, {error: 'User not found'}, latency));
          return;
        }
        if (method === 'POST' && cleanPath === '/api/users') {
          let data;
          try { data = JSON.parse(rawBody || '{}'); }
          catch (error) {
            resolve(jsonResponse(400, {error: 'Invalid JSON'}, latency));
            return;
          }
          if (!String(data.name || '').trim()) {
            resolve(jsonResponse(400, {error: 'The name field is required', field: 'name'}, latency));
            return;
          }
          resolve(jsonResponse(201, {data: {id: 4, name: String(data.name).trim(), role: String(data.role || 'Student')}}, latency));
          return;
        }
        resolve(jsonResponse(404, {error: 'Route not found', path: cleanPath}, latency));
      }, latency);
    });
  }

  function buildFetchCode(method, path, rawBody) {
    const options = method === 'GET' ? '' : `, {\n  method: '${method}',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(${rawBody.trim() || '{}'})\n}`;
    return `try {\n  const response = await fetch('${path}'${options});\n\n  if (!response.ok) {\n    throw new Error(\`HTTP \${response.status}\`);\n  }\n\n  const data = await response.json();\n  console.log(data);\n} catch (error) {\n  console.error(error.message);\n}`;
  }

  function scenarioList() {
    return scenarios.map((scenario, index) => {
      const active = scenario.id === state.current;
      const done = state.completed.includes(scenario.id);
      return `<button type="button" class="wdgapi-scenario${active ? ' active' : ''}${done ? ' done' : ''}" data-api-scenario="${scenario.id}">
        <span class="wdgapi-scenario-index">${done ? icon('tabler:check', 15) : index + 1}</span>
        <span><strong>${esc(scenario.title)}</strong><small>${scenario.method} ${esc(scenario.path)}</small></span>
      </button>`;
    }).join('');
  }

  function historyMarkup() {
    if (!state.history.length) return `<p class="wdgapi-empty">${esc(t.noResponse)}</p>`;
    return state.history.map(item => `<div class="wdgapi-history-row">
      <span class="wdgapi-method">${esc(item.method)}</span>
      <code>${esc(item.path)}</code>
      <strong class="status-${Math.floor(item.status / 100)}">${item.status}</strong>
      <time>${item.latency} ms</time>
    </div>`).join('');
  }

  function renderResponse(response, passed) {
    const panel = host?.querySelector('#wdgapiResponse');
    if (!panel) return;
    panel.innerHTML = `<div class="wdgapi-response-head">
      <span class="wdgapi-status status-${Math.floor(response.status / 100)}">${response.status} ${esc(response.statusText)}</span>
      <span>${icon('tabler:clock', 14)} ${response.latency} ms</span>
    </div>
    <pre>${esc(JSON.stringify(response.body, null, 2))}</pre>
    <div class="wdgapi-check ${passed ? 'passed' : 'retry'}">
      ${icon(passed ? 'tabler:circle-check-filled' : 'tabler:info-circle', 18)}
      <span><strong>${esc(passed ? t.completed : t.result)}</strong><small>${esc(passed ? currentScenario().why : t.tryAgain)}</small></span>
    </div>`;
  }

  function fillScenario() {
    const scenario = currentScenario();
    const method = host?.querySelector('#wdgapiMethod');
    const path = host?.querySelector('#wdgapiPath');
    const body = host?.querySelector('#wdgapiBody');
    if (!method || !path || !body) return;
    method.value = scenario.method;
    path.value = state.independent ? '' : scenario.path;
    body.value = state.independent ? '' : (scenario.body || '');
    updateComposer();
  }

  function updateComposer() {
    const method = host?.querySelector('#wdgapiMethod')?.value || 'GET';
    const path = host?.querySelector('#wdgapiPath')?.value || '';
    const body = host?.querySelector('#wdgapiBody');
    const bodyWrap = host?.querySelector('#wdgapiBodyWrap');
    const code = host?.querySelector('#wdgapiCode');
    if (bodyWrap) bodyWrap.hidden = method === 'GET';
    if (code) code.textContent = buildFetchCode(method, path || '/api/users', body?.value || '{}');
  }

  function validateScenario(method, path, response, rawBody) {
    const scenario = currentScenario();
    const cleanPath = path.trim().split('?')[0].replace(/\/$/, '');
    if (method !== scenario.method || cleanPath !== scenario.path || response.status !== scenario.status) return false;
    if (scenario.id === 'create') {
      try { return Boolean(String(JSON.parse(rawBody).name || '').trim()); } catch (error) { return false; }
    }
    if (scenario.id === 'validation') {
      try { return !String(JSON.parse(rawBody || '{}').name || '').trim(); } catch (error) { return response.status === 400; }
    }
    return true;
  }

  async function sendRequest() {
    const method = host?.querySelector('#wdgapiMethod')?.value || 'GET';
    const path = host?.querySelector('#wdgapiPath')?.value.trim() || '/';
    const rawBody = host?.querySelector('#wdgapiBody')?.value || '';
    const latency = Number(host?.querySelector('#wdgapiLatency')?.value) || 0;
    const sendButton = host?.querySelector('#wdgapiSend');
    const responsePanel = host?.querySelector('#wdgapiResponse');
    const token = ++runToken;

    if (method !== 'GET') {
      try { JSON.parse(rawBody || '{}'); }
      catch (error) {
        if (responsePanel) responsePanel.innerHTML = `<div class="wdgapi-check retry">${icon('tabler:alert-triangle', 18)}<span><strong>${esc(t.badJson)}</strong></span></div>`;
        return;
      }
    }

    if (sendButton) {
      sendButton.disabled = true;
      sendButton.innerHTML = `${icon('tabler:loader-2', 17)} ${esc(t.sending)}`;
    }
    if (responsePanel) responsePanel.innerHTML = '<div class="wdgapi-loading"><span></span><span></span><span></span></div>';

    const response = await mockRequest(method, path, rawBody, latency);
    if (token !== runToken || !host?.isConnected) return;
    const passed = validateScenario(method, path, response, rawBody);
    const wasDone = state.completed.includes(state.current);
    if (passed && !wasDone) {
      state.completed.push(state.current);
      activity(2);
    }
    state.history.unshift({method, path, status: response.status, latency: response.latency, at: Date.now()});
    state.history = state.history.slice(0, 6);
    saveState();
    renderResponse(response, passed);
    refreshProgress();
    const history = host.querySelector('#wdgapiHistory');
    if (history) history.innerHTML = historyMarkup();
    if (sendButton) {
      sendButton.disabled = false;
      sendButton.innerHTML = `${icon('tabler:send-2', 17)} ${esc(t.send)}`;
    }
  }

  function refreshProgress() {
    if (!host) return;
    const count = state.completed.length;
    const percent = Math.round((count / scenarios.length) * 100);
    host.querySelectorAll('[data-api-progress]').forEach(node => node.textContent = `${count}/${scenarios.length}`);
    const bar = host.querySelector('.wdgapi-progress > span');
    if (bar) bar.style.width = `${percent}%`;
    host.querySelectorAll('[data-api-scenario]').forEach(button => button.classList.toggle('done', state.completed.includes(button.dataset.apiScenario)));
    const summary = host.querySelector('#wdgapiProgressLabel');
    if (summary) summary.textContent = count === scenarios.length ? t.allDone : `${t.progress}: ${count}/${scenarios.length}`;
  }

  function bindEvents() {
    host.querySelectorAll('[data-api-scenario]').forEach(button => button.addEventListener('click', () => {
      state.current = button.dataset.apiScenario;
      saveState();
      host.querySelectorAll('[data-api-scenario]').forEach(item => item.classList.toggle('active', item === button));
      const scenario = currentScenario();
      const taskTitle = host.querySelector('#wdgapiTaskTitle');
      const taskText = host.querySelector('#wdgapiTaskText');
      if (taskTitle) taskTitle.textContent = scenario.title;
      if (taskText) taskText.textContent = state.independent ? t.hintHidden : scenario.goal;
      fillScenario();
    }));
    host.querySelector('#wdgapiMode')?.addEventListener('click', () => {
      state.independent = !state.independent;
      saveState();
      render(host, {activity});
    });
    host.querySelector('#wdgapiReset')?.addEventListener('click', () => {
      state = defaults();
      saveState();
      render(host, {activity});
    });
    host.querySelector('#wdgapiMethod')?.addEventListener('change', updateComposer);
    host.querySelector('#wdgapiPath')?.addEventListener('input', updateComposer);
    host.querySelector('#wdgapiBody')?.addEventListener('input', updateComposer);
    host.querySelector('#wdgapiLatency')?.addEventListener('input', event => {
      state.latency = Number(event.target.value);
      saveState();
      const output = host.querySelector('#wdgapiLatencyValue');
      if (output) output.textContent = `${state.latency} ms`;
    });
    host.querySelector('#wdgapiSend')?.addEventListener('click', sendRequest);
    host.querySelector('#wdgapiCopy')?.addEventListener('click', async event => {
      const code = host.querySelector('#wdgapiCode')?.textContent || '';
      try {
        await navigator.clipboard.writeText(code);
        const button = event.currentTarget;
        button.innerHTML = `${icon('tabler:check', 16)} ${esc(t.copied)}`;
        window.setTimeout(() => { if (button.isConnected) button.innerHTML = `${icon('tabler:copy', 16)} ${esc(t.copy)}`; }, 1200);
      } catch (error) {}
    });
  }

  function render(root, options = {}) {
    if (!root) return;
    host = root;
    activity = typeof options.activity === 'function' ? options.activity : () => {};
    state = readState();
    if (!scenarios.some(item => item.id === state.current)) state.current = scenarios[0].id;
    const scenario = currentScenario();
    const percent = Math.round((state.completed.length / scenarios.length) * 100);

    root.innerHTML = `<section class="wdgapi">
      <header class="wdgapi-head">
        <div>
          <span class="wdgapi-kicker">${icon('tabler:api', 16)} ${esc(t.title)}</span>
          <h2>${esc(t.subtitle)}</h2>
        </div>
        <div class="wdgapi-head-actions">
          <button class="wdgl-btn" type="button" id="wdgapiMode">${icon(state.independent ? 'tabler:eye-off' : 'tabler:bulb', 16)} ${esc(state.independent ? t.independent : t.guided)}</button>
          <button class="wdgl-icon-btn" type="button" id="wdgapiReset" title="${esc(t.reset)}" aria-label="${esc(t.reset)}">${icon('tabler:refresh', 17)}</button>
        </div>
      </header>
      <div class="wdgapi-progress" aria-label="${esc(t.progress)}"><span style="width:${percent}%"></span></div>
      <div class="wdgapi-progress-label" id="wdgapiProgressLabel">${esc(state.completed.length === scenarios.length ? t.allDone : `${t.progress}: ${state.completed.length}/${scenarios.length}`)}</div>

      <div class="wdgapi-workspace">
        <aside class="wdgapi-scenarios">
          <div class="wdgapi-section-label"><span>${esc(t.scenarios)}</span><strong data-api-progress>${state.completed.length}/${scenarios.length}</strong></div>
          ${scenarioList()}
        </aside>

        <main class="wdgapi-composer">
          <section class="wdgapi-task">
            <span>${esc(t.task)}</span>
            <h3 id="wdgapiTaskTitle">${esc(scenario.title)}</h3>
            <p id="wdgapiTaskText">${esc(state.independent ? t.hintHidden : scenario.goal)}</p>
          </section>
          <div class="wdgapi-request-line">
            <select id="wdgapiMethod" aria-label="HTTP method">
              ${['GET','POST','PUT','PATCH','DELETE'].map(method => `<option value="${method}"${method === scenario.method ? ' selected' : ''}>${method}</option>`).join('')}
            </select>
            <input id="wdgapiPath" type="text" value="${esc(state.independent ? '' : scenario.path)}" placeholder="/api/users" spellcheck="false" aria-label="Endpoint">
            <button class="wdgl-btn primary" type="button" id="wdgapiSend">${icon('tabler:send-2', 17)} ${esc(t.send)}</button>
          </div>
          <div class="wdgapi-latency">
            <label for="wdgapiLatency">${esc(t.latency)}</label>
            <input id="wdgapiLatency" type="range" min="0" max="1500" step="50" value="${Number(state.latency) || 0}">
            <output id="wdgapiLatencyValue">${Number(state.latency) || 0} ms</output>
          </div>
          <label class="wdgapi-editor" id="wdgapiBodyWrap"${scenario.method === 'GET' ? ' hidden' : ''}>
            <span>${esc(t.body)}</span>
            <textarea id="wdgapiBody" spellcheck="false">${esc(state.independent ? '' : (scenario.body || ''))}</textarea>
          </label>
          <section class="wdgapi-code-panel">
            <header><span>${esc(t.code)}</span><button type="button" id="wdgapiCopy">${icon('tabler:copy', 16)} ${esc(t.copy)}</button></header>
            <pre><code id="wdgapiCode"></code></pre>
          </section>
        </main>

        <aside class="wdgapi-output">
          <div class="wdgapi-section-label"><span>${esc(t.response)}</span><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" target="_blank" rel="noopener">MDN ${icon('tabler:external-link', 13)}</a></div>
          <div class="wdgapi-response" id="wdgapiResponse"><p class="wdgapi-empty">${esc(t.noResponse)}</p></div>
          <section class="wdgapi-history">
            <h3>${esc(t.history)}</h3>
            <div id="wdgapiHistory">${historyMarkup()}</div>
          </section>
        </aside>
      </div>
    </section>`;
    updateComposer();
    bindEvents();
  }

  function destroy() {
    runToken += 1;
    host = null;
  }

  window.WebDevGymApiLab = {render, destroy};
})();
