(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  const isEnglish = runtime?.isEnglish ?? document.documentElement.lang.toLowerCase().startsWith('en');
  const L = runtime?.L || ((en, ru) => isEnglish ? en : ru);
  const esc = runtime?.escapeHtml || (value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]));
  const icon = runtime?.icon || ((name, size) => '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>');
  const STORE_KEY = isEnglish ? 'wdgp_project_mode_en_v1' : 'wdgp_project_mode_ru_v1';

  const copy = {
    title: L('Project Mode', 'Режим проекта'),
    subtitle: L('Build a small feature in stages: plan, code, check, explain.', 'Собирай небольшую фичу по этапам: план, код, проверка, объяснение.'),
    nav: L('Project Mode', 'Режим проекта'),
    group: L('Practice', 'Практика'),
    noHints: L('No-hints mode', 'Режим без подсказок'),
    noHintsSub: L('Hide hints until you deliberately open them.', 'Скрывай подсказки, пока сам не откроешь.'),
    track: L('Track', 'Направление'),
    project: L('Project', 'Проект'),
    stage: L('Stage', 'Этап'),
    criteria: L('Done when', 'Готово, когда'),
    hints: L('Hints', 'Подсказки'),
    showHints: L('Show hints', 'Показать подсказки'),
    hideHints: L('Hide hints', 'Скрыть подсказки'),
    done: L('Mark stage done', 'Закрыть этап'),
    reopen: L('Reopen stage', 'Вернуть этап'),
    notes: L('What did I understand?', 'Что я понял?'),
    exportBrief: L('Export brief', 'Экспорт ТЗ'),
    reset: L('Reset project', 'Сбросить проект'),
    openPlayground: L('Open Playground', 'Открыть Playground'),
    progress: L('Project progress', 'Прогресс проекта'),
    current: L('Current stage', 'Текущий этап'),
    saved: L('Saved locally', 'Сохранено локально'),
    confirmReset: L('Reset this project progress?', 'Сбросить прогресс этого проекта?')
  };

  const tracks = {
    frontend: {
      label: 'Frontend',
      accent: '#b45cff',
      projects: [{
        id: 'accessible-board',
        title: L('Accessible Task Board', 'Доступная доска задач'),
        level: L('HTML, CSS, JS', 'HTML, CSS, JS'),
        outcome: L('A responsive task board with keyboard-friendly controls and saved state.', 'Адаптивная доска задач с удобным управлением с клавиатуры и сохранением состояния.'),
        stages: [
          stage('structure', L('Semantic structure', 'Семантическая структура'),
            L('Make the page readable before styling: header, task list, form, empty state.', 'Сначала сделай страницу понятной без стилей: шапка, список задач, форма, пустое состояние.'),
            [
              L('The main area uses meaningful tags instead of only divs.', 'Основная область собрана осмысленными тегами, а не только div.'),
              L('Each control has clear text or an accessible label.', 'У каждой кнопки и поля есть понятный текст или доступное имя.'),
              L('The empty state explains what will appear after adding a task.', 'Пустое состояние объясняет, что появится после добавления задачи.')
            ],
            [
              L('Start from data: what is one task made of?', 'Начни с данных: из чего состоит одна задача?'),
              L('Do not style first. If the HTML reads like a document, you are on track.', 'Не начинай со стилей. Если HTML читается как документ, ты попал.')
            ]),
          stage('layout', L('Responsive layout', 'Адаптивная раскладка'),
            L('Turn the structure into a usable interface on desktop and phone.', 'Преврати структуру в удобный интерфейс на компьютере и телефоне.'),
            [
              L('Cards do not overflow on a narrow screen.', 'Карточки не вылезают за экран на телефоне.'),
              L('Primary action stays easy to reach.', 'Главное действие остается легко доступным.'),
              L('Spacing is consistent between sections.', 'Отступы между блоками выглядят ровно.')
            ],
            [
              L('Use grid/flex only after deciding the flow of content.', 'Используй grid/flex после того, как понял поток контента.'),
              L('Check 360px width before calling it done.', 'Проверь ширину 360px перед финалом.')
            ]),
          stage('logic', L('Add and complete tasks', 'Добавление и закрытие задач'),
            L('Connect the form to state: add, complete, remove, render again.', 'Свяжи форму с состоянием: добавить, выполнить, удалить, отрисовать заново.'),
            [
              L('Empty input does not create a task.', 'Пустое поле не создает задачу.'),
              L('Completing a task changes both data and UI.', 'Закрытие задачи меняет и данные, и интерфейс.'),
              L('Removing a task does not break the rest of the list.', 'Удаление задачи не ломает остальной список.')
            ],
            [
              L('Keep one array as the source of truth.', 'Держи один массив как источник правды.'),
              L('After every data change, call one render function.', 'После каждого изменения данных вызывай одну render-функцию.')
            ]),
          stage('polish', L('State, keyboard and polish', 'Состояние, клавиатура и полировка'),
            L('Make the feature feel finished: persistence, focus states, edge cases.', 'Доведи фичу до ощущения готовности: сохранение, фокус, крайние случаи.'),
            [
              L('Tasks survive page reload.', 'Задачи переживают перезагрузку страницы.'),
              L('Keyboard navigation is usable.', 'Навигация с клавиатуры работает удобно.'),
              L('You can explain why each condition exists.', 'Ты можешь объяснить, зачем существует каждое условие.')
            ],
            [
              L('Save plain data, not DOM nodes.', 'Сохраняй обычные данные, не DOM-узлы.'),
              L('If you add a condition, write the user case it protects.', 'Если добавляешь условие, назови пользовательский случай, который оно защищает.')
            ])
        ]
      }]
    },
    backend: {
      label: 'Backend',
      accent: '#22d3ee',
      projects: [{
        id: 'notes-api',
        title: L('Notes API', 'API заметок'),
        level: L('Node.js basics', 'База Node.js'),
        outcome: L('A small API contract with routes, validation and clear error responses.', 'Небольшой API-контракт с роутами, валидацией и понятными ошибками.'),
        stages: [
          stage('contract', L('API contract', 'Контракт API'),
            L('Describe what the client can ask for before writing server code.', 'Опиши, что клиент может запросить, до написания серверного кода.'),
            [L('Routes are named by resources, not random actions.', 'Роуты названы по ресурсам, а не случайным действиям.'), L('Every request and response shape is written down.', 'Форма каждого запроса и ответа записана.'), L('Error cases are listed separately.', 'Ошибочные случаи вынесены отдельно.')],
            [L('Think in nouns: notes, users, sessions.', 'Думай существительными: notes, users, sessions.'), L('A good API is easier to test because expectations are explicit.', 'Хороший API легче тестировать, потому что ожидания явные.')]),
          stage('validation', L('Validation and errors', 'Валидация и ошибки'),
            L('Reject broken input with useful messages.', 'Отклоняй неправильные данные понятными сообщениями.'),
            [L('Empty title/body is handled.', 'Пустой title/body обработан.'), L('Unknown id returns a clear 404-style response.', 'Неизвестный id возвращает понятный ответ в стиле 404.'), L('Errors do not expose internal details.', 'Ошибки не раскрывают внутренние детали.')],
            [L('Validate at the boundary: request comes in, check it immediately.', 'Проверяй на границе: запрос пришел, сразу проверь.'), L('Make one helper for repeated error shape.', 'Сделай один helper для повторяющегося формата ошибки.')]),
          stage('storage', L('Storage layer', 'Слой хранения'),
            L('Separate route logic from where the data lives.', 'Отдели логику роутов от места, где живут данные.'),
            [L('The route does not directly know every storage detail.', 'Роут не знает все детали хранения напрямую.'), L('Data can be swapped from memory to file/database later.', 'Данные позже можно заменить с памяти на файл/базу.'), L('Ids are stable and unique.', 'Id стабильные и уникальные.')],
            [L('Start with an in-memory repository object.', 'Начни с объекта-репозитория в памяти.'), L('Keep create/read/update/delete methods boring and predictable.', 'Методы create/read/update/delete пусть будут скучными и предсказуемыми.')]),
          stage('docs', L('Docs and manual tests', 'Документация и ручные тесты'),
            L('Leave proof that another developer can run and check it.', 'Оставь доказательство, что другой разработчик сможет запустить и проверить.'),
            [L('README has setup and route examples.', 'В README есть запуск и примеры роутов.'), L('Manual test cases cover success and failure.', 'Ручные тесты покрывают успех и ошибку.'), L('You can explain request lifecycle from browser to response.', 'Ты можешь объяснить путь запроса от браузера до ответа.')],
            [L('Docs are not decoration; they reduce future fear.', 'Документация не украшение; она снижает будущий страх.'), L('Write examples that you actually tried.', 'Пиши примеры, которые реально проверял.')])
        ]
      }]
    },
    fullstack: {
      label: 'Full-stack',
      accent: '#34d399',
      projects: [{
        id: 'feedback-panel',
        title: L('Feedback Dashboard', 'Панель обратной связи'),
        level: L('UI + API thinking', 'UI + API мышление'),
        outcome: L('A feedback flow from form to dashboard with clear states.', 'Поток обратной связи от формы до панели с понятными состояниями.'),
        stages: [
          stage('flow', L('User flow and states', 'Пользовательский поток и состояния'),
            L('Map the whole path: write feedback, send, see result, handle failure.', 'Опиши путь: написать отзыв, отправить, увидеть результат, обработать ошибку.'),
            [L('Loading, success and error states are named.', 'Состояния загрузки, успеха и ошибки названы.'), L('The form knows what is required.', 'Форма знает обязательные поля.'), L('The dashboard has an empty state.', 'В панели есть пустое состояние.')],
            [L('Draw the states before code if the logic feels foggy.', 'Если логика мутная, сначала нарисуй состояния.'), L('A full-stack feature is mostly agreement between parts.', 'Full-stack фича чаще всего про договор между частями.')]),
          stage('client', L('Client implementation', 'Клиентская часть'),
            L('Build the interface so it stays honest while waiting for data.', 'Собери интерфейс так, чтобы он честно показывал ожидание данных.'),
            [L('Submit button cannot spam requests while loading.', 'Кнопка отправки не спамит запросы во время загрузки.'), L('Validation is visible near the problem.', 'Валидация видна рядом с проблемой.'), L('The list updates after successful send.', 'Список обновляется после успешной отправки.')],
            [L('Disable actions only while there is a real reason.', 'Отключай действия только когда есть реальная причина.'), L('Keep render logic separate from request logic.', 'Держи render-логику отдельно от request-логики.')]),
          stage('server', L('Server contract', 'Серверный контракт'),
            L('Make endpoints predictable and safe for bad input.', 'Сделай endpoints предсказуемыми и устойчивыми к плохим данным.'),
            [L('POST creates feedback and returns created data.', 'POST создает отзыв и возвращает созданные данные.'), L('GET returns a list in a stable format.', 'GET возвращает список в стабильном формате.'), L('Bad input returns a useful error.', 'Плохой ввод возвращает полезную ошибку.')],
            [L('Do not trust the client. Validate again on the server.', 'Не доверяй клиенту. На сервере проверяй заново.'), L('Return data the UI can render without guessing.', 'Возвращай данные, которые UI может отрисовать без угадывания.')]),
          stage('release', L('Release checklist', 'Чеклист выпуска'),
            L('Check the feature as if someone else will use it tomorrow.', 'Проверь фичу так, будто завтра ей будет пользоваться другой человек.'),
            [L('Responsive layout checked.', 'Адаптив проверен.'), L('Empty/error/loading states checked.', 'Пустое, ошибка и загрузка проверены.'), L('The project has a short explanation and next improvements.', 'У проекта есть короткое объяснение и следующие улучшения.')],
            [L('A small release checklist beats “ вроде работает ”.', 'Короткий чеклист выпуска лучше, чем “вроде работает”.'), L('Write one sentence: what risk remains?', 'Напиши одно предложение: какой риск остался?')])
        ]
      }]
    }
  };

  let api;
  let state = load();

  function stage(id, title, goal, criteria, hints) {
    return { id, title, goal, criteria, hints };
  }

  function defaultState() {
    return {
      track: 'frontend',
      project: 'accessible-board',
      activeStage: 0,
      noHints: false,
      done: {},
      notes: {},
      hintsOpen: {}
    };
  }

  function load() {
    try {
      return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STORE_KEY) || '{}'));
    } catch (_) {
      return defaultState();
    }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function currentTrack() {
    return tracks[state.track] || tracks.frontend;
  }

  function currentProject() {
    const track = currentTrack();
    return track.projects.find(project => project.id === state.project) || track.projects[0];
  }

  function currentStage(project) {
    const safeIndex = Math.min(Math.max(Number(state.activeStage) || 0, 0), project.stages.length - 1);
    state.activeStage = safeIndex;
    return project.stages[safeIndex];
  }

  function stageKey(project, item) {
    return state.track + ':' + project.id + ':' + item.id;
  }

  function doneCount(project) {
    return project.stages.filter(item => state.done[stageKey(project, item)]).length;
  }

  function render() {
    const track = currentTrack();
    const project = currentProject();
    const active = currentStage(project);
    const completed = doneCount(project);
    const pct = Math.round(completed / project.stages.length * 100);
    const body = '<div class="wdgpm-shell" style="--wdgpm-accent:' + track.accent + '">' +
      renderHero(track, project, active, completed, pct) +
      '<div class="wdgpm-grid">' +
        renderRail(project, active) +
        renderStage(project, active) +
        renderPanel(project, active, pct) +
      '</div>' +
    '</div>';
    const page = api.pageShell('project-mode', copy.title, copy.subtitle, body);
    bind(page);
    return page;
  }

  function renderHero(track, project, active, completed, pct) {
    return '<section class="wdgpm-hero">' +
      '<div><span class="wdgpm-kicker">' + copy.current + '</span><h2>' + esc(project.title) + '</h2><p>' + esc(project.outcome) + '</p>' +
      '<div class="wdgpm-tags"><span>' + esc(track.label) + '</span><span>' + esc(project.level) + '</span><span>' + completed + ' / ' + project.stages.length + '</span></div></div>' +
      '<div class="wdgpm-score"><strong>' + pct + '%</strong><span>' + esc(active.title) + '</span><div><i style="width:' + pct + '%"></i></div></div>' +
    '</section>';
  }

  function renderRail(project, active) {
    return '<aside class="wdgpm-rail"><label>' + copy.track + '<select data-pm-track>' +
      Object.keys(tracks).map(id => '<option value="' + id + '"' + (id === state.track ? ' selected' : '') + '>' + esc(tracks[id].label) + '</option>').join('') +
      '</select></label><label>' + copy.project + '<select data-pm-project>' +
      currentTrack().projects.map(item => '<option value="' + item.id + '"' + (item.id === project.id ? ' selected' : '') + '>' + esc(item.title) + '</option>').join('') +
      '</select></label><div class="wdgpm-stages">' + project.stages.map((item, index) => {
        const key = stageKey(project, item);
        return '<button type="button" class="' + (item.id === active.id ? 'active ' : '') + (state.done[key] ? 'done' : '') + '" data-pm-stage="' + index + '">' +
          '<span>' + (index + 1) + '</span><strong>' + esc(item.title) + '</strong><small>' + (state.done[key] ? L('Done', 'Готово') : L('In progress', 'В работе')) + '</small></button>';
      }).join('') + '</div></aside>';
  }

  function renderStage(project, active) {
    const key = stageKey(project, active);
    const open = !!state.hintsOpen[key] && !state.noHints;
    return '<main class="wdgpm-stage"><div class="wdgpm-stage-head"><div><span class="wdgpm-kicker">' + copy.stage + '</span><h3>' + esc(active.title) + '</h3><p>' + esc(active.goal) + '</p></div>' +
      '<button type="button" class="wdgpm-toggle ' + (state.noHints ? 'on' : '') + '" data-pm-no-hints><span></span>' + copy.noHints + '</button></div>' +
      '<section class="wdgpm-checklist"><h4>' + copy.criteria + '</h4>' + active.criteria.map((item, index) => '<label><input type="checkbox" data-pm-criterion="' + index + '"' + (state.done[key] ? ' checked' : '') + '><span>' + esc(item) + '</span></label>').join('') + '</section>' +
      '<section class="wdgpm-hints"><button type="button" data-pm-hints ' + (state.noHints ? 'disabled' : '') + '>' + icon(open ? 'tabler:bulb-off' : 'tabler:bulb', 17) + '<span>' + (open ? copy.hideHints : copy.showHints) + '</span></button>' +
      (open ? '<div>' + active.hints.map(item => '<p>' + esc(item) + '</p>').join('') + '</div>' : '') + '</section>' +
      '<label class="wdgpm-notes"><span>' + copy.notes + '</span><textarea data-pm-notes placeholder="' + L('Write one honest sentence after the stage.', 'Напиши одно честное предложение после этапа.') + '">' + esc(state.notes[key] || '') + '</textarea></label>' +
      '<div class="wdgpm-actions"><button type="button" class="wdgpm-btn ghost" data-pm-playground>' + icon('tabler:code',17) + copy.openPlayground + '</button><button type="button" class="wdgpm-btn primary" data-pm-done>' + icon(state.done[key] ? 'tabler:rotate-2' : 'tabler:check',17) + (state.done[key] ? copy.reopen : copy.done) + '</button></div></main>';
  }

  function renderPanel(project, active, pct) {
    const key = stageKey(project, active);
    return '<aside class="wdgpm-panel"><h4>' + copy.progress + '</h4><div class="wdgpm-ring" style="--p:' + pct + '"><strong>' + pct + '%</strong></div>' +
      '<dl><div><dt>' + copy.track + '</dt><dd>' + esc(currentTrack().label) + '</dd></div><div><dt>' + copy.project + '</dt><dd>' + esc(project.title) + '</dd></div><div><dt>' + copy.current + '</dt><dd>' + esc(active.title) + '</dd></div></dl>' +
      '<div class="wdgpm-mini-note">' + icon('tabler:cloud-check',17) + '<span>' + copy.saved + '</span></div>' +
      '<button type="button" class="wdgpm-btn" data-pm-export>' + icon('tabler:file-export',17) + copy.exportBrief + '</button>' +
      '<button type="button" class="wdgpm-btn danger" data-pm-reset>' + icon('tabler:trash',17) + copy.reset + '</button></aside>';
  }

  function bind(page) {
    page.querySelector('[data-pm-track]')?.addEventListener('change', event => {
      state.track = event.target.value;
      state.project = currentTrack().projects[0].id;
      state.activeStage = 0;
      save();
      api.open('project-mode');
    });
    page.querySelector('[data-pm-project]')?.addEventListener('change', event => {
      state.project = event.target.value;
      state.activeStage = 0;
      save();
      api.open('project-mode');
    });
    page.querySelectorAll('[data-pm-stage]').forEach(button => button.addEventListener('click', () => {
      state.activeStage = Number(button.dataset.pmStage) || 0;
      save();
      api.open('project-mode');
    }));
    page.querySelector('[data-pm-no-hints]')?.addEventListener('click', () => {
      state.noHints = !state.noHints;
      save();
      api.open('project-mode');
    });
    page.querySelector('[data-pm-hints]')?.addEventListener('click', () => {
      const project = currentProject();
      const key = stageKey(project, currentStage(project));
      state.hintsOpen[key] = !state.hintsOpen[key];
      save();
      api.open('project-mode');
    });
    page.querySelector('[data-pm-notes]')?.addEventListener('input', event => {
      const project = currentProject();
      state.notes[stageKey(project, currentStage(project))] = event.target.value;
      save();
    });
    page.querySelector('[data-pm-done]')?.addEventListener('click', () => {
      const project = currentProject();
      const key = stageKey(project, currentStage(project));
      state.done[key] = !state.done[key];
      if (state.done[key] && state.activeStage < project.stages.length - 1) state.activeStage += 1;
      save();
      window.WebDevGymFeatures?.logActivity?.(2);
      api.open('project-mode');
    });
    page.querySelector('[data-pm-playground]')?.addEventListener('click', () => {
      api.close?.();
      document.querySelector('[data-wdg-nav="playground"]')?.click();
    });
    page.querySelector('[data-pm-export]')?.addEventListener('click', exportBrief);
    page.querySelector('[data-pm-reset]')?.addEventListener('click', () => {
      if (!confirm(copy.confirmReset)) return;
      state = defaultState();
      save();
      api.open('project-mode');
    });
  }

  function exportBrief() {
    const project = currentProject();
    const payload = {
      app: 'WebDevGym',
      type: 'project-mode-brief',
      exportedAt: new Date().toISOString(),
      track: currentTrack().label,
      project: project.title,
      outcome: project.outcome,
      stages: project.stages.map(item => ({
        title: item.title,
        goal: item.goal,
        criteria: item.criteria,
        done: !!state.done[stageKey(project, item)],
        notes: state.notes[stageKey(project, item)] || ''
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'webdevgym-project-brief.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function addNavigation() {
    if (runtime?.createNavigationButton) {
      runtime.createNavigationButton({
        id: 'wdgProjectModeNavBtn',
        feature: 'project-mode',
        icon: 'tabler:clipboard-check',
        label: copy.nav,
        after: '#wdgforgeNavBtn',
        onClick: () => api.open('project-mode')
      });
      return;
    }
    const nav = document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById('wdgProjectModeNavBtn')) return;
    const button = document.createElement('button');
    button.className = 'wdg-nav-btn';
    button.id = 'wdgProjectModeNavBtn';
    button.type = 'button';
    button.dataset.wdgFeature = 'project-mode';
    button.innerHTML = icon('tabler:clipboard-check', 19) + '<span>' + copy.nav + '</span>';
    button.addEventListener('click', () => api.open('project-mode'));
    nav.append(button);
  }

  function init() {
    api = window.WebDevGymFeatures;
    if (!api || typeof api.register !== 'function') {
      setTimeout(init, 80);
      return;
    }
    api.register('project-mode', render, { title: copy.title, icon: 'tabler:clipboard-check', group: copy.group });
    addNavigation();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 120));
  else setTimeout(init, 120);
})();
