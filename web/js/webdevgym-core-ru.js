// ===== QUIZ ANSWERS (объявлено первым — используется в обработчиках на DOMContentLoaded) =====
const QUIZ_ANSWERS = {
  // JS Строки
  'strings': {
    quiz: { 'q-str-1': 'b', 'q-str-2': 'b' },
    practice: {
      id: 'practice-strings',
      check: (val) => {
        const v = val.toLowerCase().replace(/\s+/g, ' ').trim();
        return (v.includes('trim()') && v.includes('touppercase()')) ||
               (v.includes('.trim') && v.includes('.touppercase'));
      },
      hint: 'Используй .trim() и .toUpperCase() в функции'
    }
  },
  // CSS Тумблер
  'toggle': {
    quiz: { 'q-tog-1': 'b', 'q-tog-2': 'b' },
    practice: {
      id: 'practice-toggle',
      check: (val) => {
        const v = val.toLowerCase().replace(/\s+/g, ' ').trim();
        return v.includes('input:checked') && v.includes('.slider') &&
               (v.includes('background') || v.includes('background-color'));
      },
      hint: 'Должно быть: input:checked + .slider { background-color: ... }'
    }
  },

  // TypeScript дженерики
  'ts-generics': {
    quiz: { 'q-tsg-1': 'b', 'q-tsg-2': 'b' },
    practice: {
      id: 'practice-ts-generics',
      check: (val) => {
        const v = val.toLowerCase().replace(/\s+/g, ' ').trim();
        return v.includes('function identity') && v.includes('<t>') &&
               v.includes(': t') && v.includes('return');
      },
      hint: 'function identity<T>(arg: T): T { return arg; }'
    }
  },
  // TypeScript основы
  'ts-basics': {
    quiz: { 'q-ts-basics-1': 'b', 'q-ts-basics-2': 'b' },
    practice: {
      id: 'practice-ts-basics',
      check: (val) => {
        const v = val.toLowerCase().replace(/\s+/g, ' ').trim();
        return v.includes('function add') && v.includes(': number') &&
               v.includes('return') && (v.includes('a + b') || v.includes('a+b'));
      },
      hint: 'function add(a: number, b: number): number { return a + b; }'
    }
  },
  // TypeScript интерфейсы
  'ts-interfaces': {
    quiz: { 'q-ts-if-1': 'b', 'q-ts-if-2': 'b' },
    practice: {
      id: 'practice-ts-interfaces',
      check: (val) => {
        const v = val.toLowerCase().replace(/\s+/g, ' ').trim();
        return v.includes('interface product') && v.includes('id') &&
               v.includes('name') && v.includes('price') && v.includes('discount?');
      },
      hint: 'interface Product { id: number; name: string; price: number; discount?: number; }'
    }
  },
  // React компоненты
  'react-components': {
    quiz: { 'q-rc-1': 'b', 'q-rc-2': 'b' },
    practice: {
      id: 'practice-react-components',
      check: (val) => {
        const v = val.toLowerCase().replace(/\s+/g, ' ').trim();
        return v.includes('function card') && (v.includes('title') && v.includes('description')) &&
               (v.includes('<h2>') || v.includes('<h2 ') || v.includes('h2>'));
      },
      hint: 'function Card({ title, description }) { return (<div><h2>{title}</h2><p>{description}</p></div>); }'
    }
  },
  // React хуки
  'react-hooks': {
    quiz: { 'q-rh-1': 'b', 'q-rh-2': 'b' },
    practice: {
      id: 'practice-react-hooks',
      check: (val) => {
        const v = val.toLowerCase().replace(/\s+/g, ' ').trim();
        return v.includes('usestate') && v.includes('name') &&
               (v.includes('setname') || v.includes('set')) &&
               (v.includes('<input') || v.includes('input'));
      },
      hint: 'const [name, setName] = useState(""); ... <input onChange={e => setName(e.target.value)} />'
    }
  }
};

// ===== ТАБЫ =====
// ===== DARK MODE =====
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('darkBtn').innerHTML = isDark ? '<iconify-icon icon="tabler:sun" width="14" height="14" style="vertical-align:middle"></iconify-icon> Светлая' : '<iconify-icon icon="tabler:moon-stars" width="14" height="14" style="vertical-align:middle"></iconify-icon> Тёмная';
  localStorage.setItem('darkMode', isDark ? '1' : '0');
}

// ===== EXPORT / IMPORT PROGRESS =====
function getProgressSnapshot() {
  const progress = {};
  const quizzes = {};
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('prog_')) progress[key.slice(5)] = localStorage.getItem(key);
    if (key.startsWith('quiz_passed_')) quizzes[key.slice(12)] = localStorage.getItem(key);
  });
  return {
    app: 'WebDevGym',
    version: 49,
    exportedAt: new Date().toISOString(),
    progress,
    quizzes,
    darkMode: localStorage.getItem('darkMode') || '0',
    calendar: (typeof wdgCalGetSnapshot === 'function') ? wdgCalGetSnapshot() : null,
    aiChatHistory: (() => {
      try { return JSON.parse(localStorage.getItem('webdevgym_ai_chat_history_v1') || '[]'); }
      catch (e) { return []; }
    })()
  };
}

function exportProgressJson() {
  const data = getProgressSnapshot();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `webdevgym-progress-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Прогресс скачан в JSON');
}

function importProgressJson() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));
        if (!data || data.app !== 'WebDevGym') throw new Error('bad file');

        Object.entries(data.progress || {}).forEach(([pid, value]) => {
          if (value === '1') localStorage.setItem('prog_' + pid, '1');
          else localStorage.removeItem('prog_' + pid);
        });
        Object.entries(data.quizzes || {}).forEach(([quizId, value]) => {
          if (value === '1') localStorage.setItem('quiz_passed_' + quizId, '1');
        });
        if (data.darkMode === '1' || data.darkMode === '0') localStorage.setItem('darkMode', data.darkMode);
        if (data.calendar && typeof wdgCalApplySnapshot === 'function') {
          wdgCalApplySnapshot(data.calendar);
        }
        if (Array.isArray(data.aiChatHistory)) {
          localStorage.setItem('webdevgym_ai_chat_history_v1', JSON.stringify(data.aiChatHistory.slice(-40)));
          if (typeof aiLoadHistory === 'function') aiLoadHistory();
        }

        restoreProgressCheckboxes();
        showToast('Прогресс импортирован');
      } catch (e) {
        showToast('Не получилось импортировать JSON прогресса');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ===== WEBDEVGYM CALENDAR =====
const WDG_CAL_STORAGE = 'webdevgym_calendar_v2';
const WDG_CAL_NOTE_STORAGE = 'webdevgym_calendar_note_v2';
const WDG_CAL_START = '2026-07-01';
const WDG_CAL_END = '2026-12-31';

const WDG_CAL_TYPES = {
  theory: 'Теория',
  practice: 'Практика',
  project: 'Мини-проект',
  repeat: 'Повторение',
  career: 'Карьера',
  rest: 'Отдых'
};

let wdgCalState = { tasks: [] };
let wdgCalSelectedDate = wdgCalClampDate(wdgCalTodayISO());
let wdgCalMonthCursor = wdgCalFromISO(wdgCalSelectedDate);

function wdgCalTopics() {
    const orderedTopics = window.WebDevGymLearningPath?.calendarTopics?.ru;
    if (Array.isArray(orderedTopics) && orderedTopics.length) {
      return orderedTopics.map(topic => topic.slice());
    }
    return [
    ['Повтор счётчика', 'practice', 'За 1 час заново собрать счётчик без копирования. Цель: состояние, отображение и обработка кликов.'],
    ['Переключатель темы', 'practice', 'Одна кнопка, смена класса на body и иконки. Способ сохранения выбери самостоятельно.'],
    ['События: click, input, submit', 'practice', 'Форма заметки: ввод, счетчик символов, submit добавляет карточку.'],
    ['Массивы + интерфейс', 'project', 'Вывести карточки из массива и удалить одну карточку по кнопке.'],
    ['Условия в интерфейсе', 'practice', 'Проверка формы: пусто, мало символов, нормально. Разные сообщения пользователю.'],
    ['Функции в интерфейсном коде', 'repeat', 'Разнести код на updateUI, validateForm и resetState.'],
    ['CSS: position и z-index', 'theory', 'Разобрать relative, absolute, fixed, sticky и сделать плавающую кнопку.'],
    ['Мини-проект: FAQ', 'project', 'Клик открывает ответ. Усложнение: открытым остается только один вопрос.'],
    ['Сохранение данных', 'practice', 'Сделать так, чтобы выбранные данные проекта переживали перезагрузку. Способ выбери самостоятельно.'],
    ['Мини-проект: вкладки', 'project', 'Tabs через data-id: активная кнопка, активный контент, аккуратный CSS.'],
    ['Формы HTML/CSS/JS', 'practice', 'Сделать форму заявки с базовой проверкой имени, телефона и сообщения.'],
    ['Мини-проект: бургер-меню', 'project', 'Открытие, закрытие, закрытие по ссылке и по Escape.'],
    ['CSS: адаптивность', 'practice', 'Один блок привести в порядок на телефоне: media query, flex/grid, отступы.'],
    ['Мини-проект: фильтр карточек', 'project', 'Категории фильтруют карточки из массива.'],
    ['Fetch: первые запросы', 'theory', 'Получить данные из тестового API и вывести 5 элементов.'],
    ['Async/await и try/catch', 'practice', 'Добавить loading, обработку ошибки и пустое состояние.'],
    ['Объекты', 'practice', 'Объект пользователя и функция renderProfile(user).'],
    ['Повтор JS базы', 'repeat', 'Переписать переменные, if/else, цикл, массив, функцию без подсказок.'],
    ['Мини-проект: калькулятор', 'project', 'Калькулятор стоимости услуги или заказа с несколькими полями.'],
    ['Git: базовый цикл', 'theory', 'init, add, commit, status, log. Сделать README для мини-проекта.'],
    ['Демо для портфолио', 'career', 'Собрать один аккуратный демо-блок: форма, вкладки, калькулятор или FAQ.'],
    ['TypeScript: зачем нужен', 'theory', 'Понять string, number, boolean, array, object. Без глубокого погружения.'],
    ['TypeScript: функции и типы', 'practice', 'Типизировать параметры и результат простых функций.'],
    ['React: компоненты и JSX', 'theory', 'Понять компонент как функцию, props как входные данные.'],
    ['React: useState', 'practice', 'Повторить счетчик как React-компонент.'],
    ['React: списки через map', 'practice', 'Вывести карточки из массива, не забыть key.'],
    ['React: controlled input', 'practice', 'value + onChange + state. Мини-форма заметки.'],
    ['React: useEffect', 'theory', 'Понять эффект после рендера и зависимости.'],
    ['React: мини Todo', 'project', 'Добавление, удаление, done, фильтр и восстановление состояния после перезагрузки.'],
    ['React Router', 'practice', '2-3 страницы: главная, проекты, контакты. Навигация без перезагрузки.'],
    ['Vite: проект с нуля', 'theory', 'Создать Vite-проект, понять src, main, package.json.'],
    ['CSS архитектура', 'practice', 'Разложить стили по блокам, убрать хаос и повторения.'],
    ['Рефакторинг старого проекта', 'repeat', 'Взять старый мини-проект и сделать код чище.'],
    ['Портфолио: карточка проекта', 'career', 'Описать задачу, стек, результат и сделать скрин.'],
    ['API + UI проект', 'project', 'Поиск/список через API: loading, error, карточки.'],
    ['Валидация формы глубже', 'practice', 'Проверка email/phone, сообщения ошибок, disabled submit.'],
    ['Компонентный подход без React', 'practice', 'Функции createCard, createButton, renderList в чистом JS.'],
    ['Паттерн render()', 'repeat', 'Все изменения идут через state, потом render обновляет экран.'],
    ['Мини-проект: календарь/планер', 'project', 'Свой маленький планер с редактированием и сохранением данных выбранным способом.'],
    ['Тестирование руками', 'theory', 'Чек-лист: desktop, mobile, пустые поля, ошибки, перезагрузка.'],
    ['Разбор технического задания', 'career', 'Выделить требования, вопросы, риски и критерии приёмки из короткого ТЗ.'],
    ['React: кастомный хук', 'practice', 'Вынести сохранение данных или состояние формы в простой custom hook.'],
    ['React: useMemo/useCallback обзор', 'theory', 'Понять идею оптимизации без фанатизма.'],
    ['TypeScript + React обзор', 'theory', 'Тип props, тип state, тип event для input.'],
    ['Финальный проект 2026', 'project', 'Выбрать один проект и довести до состояния “можно показать клиенту”.'],
    ['Ревизия навыков', 'repeat', 'Отметить слабые темы, повторить 3 мини-проекта без подсказок.']
  ];
}

function wdgCalCreatePlan() {
  const start = wdgCalFromISO(WDG_CAL_START);
  const end = wdgCalFromISO(WDG_CAL_END);
  const topics = wdgCalTopics();
  const restText = [
    'Полный отдых от новой темы. Можно только 10 минут посмотреть старый код.',
    'Мозг переваривает материал. Без новой темы, без давления.',
    'Последний день паузы. Посмотри, какая тема будет следующей.'
  ];
  const tasks = [];
  let topicIndex = 0;

  for (let day = new Date(start), offset = 0; day <= end; day = wdgCalAddDays(day, 1), offset++) {
    const iso = wdgCalToISO(day);
    const phase = offset % 4;
    if (phase === 0) {
      const topic = topics[topicIndex] || ['Повтор и практика', 'repeat', 'Повтори слабую тему и сделай маленький проект.'];
      tasks.push({
        id: `wdg-cal-${iso}-lesson`,
        date: iso,
        title: topic[0],
        type: topic[1],
        description: `1 час обучения. ${topic[2]}`,
        done: false
      });
      topicIndex++;
    } else {
      tasks.push({
        id: `wdg-cal-${iso}-rest`,
        date: iso,
        title: `Отдых ${phase}/3`,
        type: 'rest',
        description: restText[phase - 1],
        done: false
      });
    }
  }

  return { version: 2, tasks };
}

function wdgCalNormalizeTask(task) {
  if (!task || typeof task !== 'object') return task;
  const next = { ...task };
  const legacyCareerType = String.fromCharCode(107, 119, 111, 114, 107);
  if (next.type === legacyCareerType) next.type = 'career';
  next.title = String(next.title || '')
    .replace(/^DOM:\s*/i, '')
    .replace(/\s+\+\s+DOM/gi, ' + интерфейс')
    .replace(/DOM-коде/gi, 'интерфейсном коде')
    .replace(/^localStorage$/i, 'Сохранение данных');
  next.description = String(next.description || '')
    .replace(/\blocalStorage\b/gi, 'сохранение данных')
    .replace(/\bDOM\b/g, 'интерфейс');
  return next;
}

function wdgCalNormalizeTasks(tasks) {
  return tasks.map(wdgCalNormalizeTask);
}

function wdgCalLoadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(WDG_CAL_STORAGE) || 'null');
    if (saved && Array.isArray(saved.tasks)) {
      wdgCalState = { ...saved, tasks: wdgCalNormalizeTasks(saved.tasks) };
      wdgCalSaveState();
      return;
    }
  } catch (e) {}
  wdgCalState = wdgCalCreatePlan();
  wdgCalSaveState();
}

function wdgCalSaveState() {
  try { localStorage.setItem(WDG_CAL_STORAGE, JSON.stringify(wdgCalState)); } catch (e) {}
}

function wdgCalGetSnapshot() {
  return {
    app: 'WebDevGymCalendar',
    version: 2,
    exportedAt: new Date().toISOString(),
    selectedDate: wdgCalSelectedDate,
    note: localStorage.getItem(WDG_CAL_NOTE_STORAGE) || '',
    tasks: wdgCalState.tasks || []
  };
}

function wdgCalApplySnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.tasks)) return;
  wdgCalState = { version: 2, tasks: wdgCalNormalizeTasks(snapshot.tasks) };
  wdgCalSelectedDate = wdgCalClampDate(snapshot.selectedDate || wdgCalSelectedDate);
  wdgCalMonthCursor = wdgCalFromISO(wdgCalSelectedDate);
  if (typeof snapshot.note === 'string') localStorage.setItem(WDG_CAL_NOTE_STORAGE, snapshot.note);
  wdgCalSaveState();
  wdgCalRender();
}

function wdgCalRender() {
  if (!document.getElementById('sec-calendar')) return;
  wdgCalRenderToday();
  wdgCalRenderTasks();
  wdgCalRenderMonth();
  wdgCalRenderRoute();
  wdgCalRenderStats();
}

function wdgCalRenderToday() {
  const tasks = wdgCalTasksForDate(wdgCalSelectedDate);
  const task = tasks[0] || wdgCalNextLesson();
  const label = document.getElementById('wdgCalDateLabel');
  const title = document.getElementById('wdgCalTodayTitle');
  const desc = document.getElementById('wdgCalTodayDesc');
  const dayType = document.getElementById('wdgCalDayType');
  if (label) label.textContent = wdgCalFormatFull(wdgCalFromISO(wdgCalSelectedDate));
  if (title) title.textContent = task ? task.title : 'План пуст';
  if (desc) desc.textContent = task ? task.description : 'Добавь задачу, чтобы продолжить маршрут.';
  if (dayType && task) {
    dayType.textContent = WDG_CAL_TYPES[task.type] || task.type;
    dayType.className = `wdg-cal-pill ${task.type}`;
  }
}

function wdgCalRenderStats() {
  const lessons = wdgCalState.tasks.filter(task => task.type !== 'rest');
  const doneLessons = lessons.filter(task => task.done).length;
  const today = wdgCalFromISO(wdgCalTodayISO());
  const end = wdgCalFromISO(WDG_CAL_END);
  const daysLeft = Math.max(0, Math.ceil((end - today) / 86400000));
  const nextLessons = lessons.filter(task => !task.done && task.date >= wdgCalTodayISO()).length;
  const doneEl = document.getElementById('wdgCalDoneLessons');
  const leftEl = document.getElementById('wdgCalDaysLeft');
  const nextEl = document.getElementById('wdgCalNextLessons');
  if (doneEl) doneEl.textContent = doneLessons;
  if (leftEl) leftEl.textContent = daysLeft;
  if (nextEl) nextEl.textContent = nextLessons;
}

function wdgCalRenderTasks() {
  const list = document.getElementById('wdgCalTaskList');
  const completeBtn = document.getElementById('wdgCalCompleteDayBtn');
  if (!list) return;
  const tasks = wdgCalTasksForDate(wdgCalSelectedDate);
  if (!tasks.length) {
    list.innerHTML = '<p class="wdg-cal-task-desc">На этот день задач нет.</p>';
    if (completeBtn) {
      completeBtn.disabled = true;
      completeBtn.textContent = 'Нет задач';
    }
    return;
  }
  const allDone = tasks.every(task => task.done);
  if (completeBtn) {
    completeBtn.disabled = false;
    completeBtn.textContent = allDone ? 'Снять отметку' : 'Засчитать день';
    completeBtn.classList.toggle('danger', allDone);
  }
  list.innerHTML = tasks.map(task => `
    <article class="wdg-cal-task ${task.done ? 'done' : ''}">
      <input type="checkbox" ${task.done ? 'checked' : ''} onchange="wdgCalToggle('${task.id}', this.checked)" aria-label="Отметить задачу">
      <div>
        <p class="wdg-cal-task-title">${wdgCalEscape(task.title)}</p>
        <p class="wdg-cal-task-desc">${wdgCalEscape(task.description || '')}</p>
        <span class="wdg-cal-pill ${task.type}">${WDG_CAL_TYPES[task.type] || task.type}</span>
      </div>
      <button class="wdg-cal-btn" onclick="wdgCalEdit('${task.id}')">Править</button>
    </article>
  `).join('');
}

function wdgCalRenderMonth() {
  const grid = document.getElementById('wdgCalGrid');
  const title = document.getElementById('wdgCalMonthTitle');
  if (!grid || !title) return;
  const year = wdgCalMonthCursor.getFullYear();
  const month = wdgCalMonthCursor.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const firstOffset = (start.getDay() + 6) % 7;
  const cells = [];
  title.textContent = start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  for (let i = 0; i < firstOffset; i++) cells.push('<button class="wdg-cal-day empty"></button>');
  for (let day = 1; day <= end.getDate(); day++) {
    const iso = wdgCalToISO(new Date(year, month, day));
    const task = wdgCalTasksForDate(iso)[0];
    const cls = [
      'wdg-cal-day',
      iso === wdgCalTodayISO() ? 'today' : '',
      iso === wdgCalSelectedDate ? 'selected' : '',
      task && task.done ? 'done' : ''
    ].filter(Boolean).join(' ');
    cells.push(`
      <button class="${cls}" onclick="wdgCalSelectDate('${iso}')">
        <span class="wdg-cal-day-num">${day}<span class="wdg-cal-pill ${task ? task.type : ''}">${task ? (task.type === 'rest' ? 'Пауза' : '1ч') : ''}</span></span>
        <span class="wdg-cal-day-label">${task ? wdgCalEscape(task.title) : ''}</span>
      </button>
    `);
  }
  grid.innerHTML = cells.join('');
}

function wdgCalRenderRoute() {
  const route = document.getElementById('wdgCalRoute');
  if (!route) return;
  const list = [...wdgCalState.tasks]
    .filter(task => task.date >= wdgCalSelectedDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 18);
  route.innerHTML = list.map(task => `
    <div class="wdg-cal-route-item">
      <div class="wdg-cal-date">${wdgCalFormatShort(wdgCalFromISO(task.date))}</div>
      <div>
        <div class="wdg-cal-task-title" style="font-size:13px;margin-bottom:4px;">${wdgCalEscape(task.title)}</div>
        <span class="wdg-cal-pill ${task.type}">${task.done ? 'Готово' : (WDG_CAL_TYPES[task.type] || task.type)}</span>
      </div>
    </div>
  `).join('');
}

function wdgCalToggle(id, checked) {
  const task = wdgCalState.tasks.find(item => item.id === id);
  if (!task) return;
  task.done = checked;
  wdgCalSaveState();
  wdgCalRender();
}

function wdgCalToggleSelectedDay() {
  const tasks = wdgCalTasksForDate(wdgCalSelectedDate);
  if (!tasks.length) return;
  const shouldMarkDone = tasks.some(task => !task.done);
  tasks.forEach(task => {
    task.done = shouldMarkDone;
  });
  wdgCalSaveState();
  wdgCalRender();
  showToast(shouldMarkDone ? 'День засчитан' : 'Отметка дня снята');
}

function wdgCalEdit(id) {
  const task = wdgCalState.tasks.find(item => item.id === id);
  if (!task) return;
  const title = prompt('Название задачи:', task.title);
  if (title === null) return;
  const description = prompt('Описание:', task.description || '');
  if (description === null) return;
  const date = prompt('Дата в формате YYYY-MM-DD:', task.date);
  if (date === null) return;
  task.title = title.trim() || task.title;
  task.description = description.trim();
  task.date = /^\d{4}-\d{2}-\d{2}$/.test(date) ? wdgCalClampDate(date) : task.date;
  wdgCalSelectedDate = task.date;
  wdgCalMonthCursor = wdgCalFromISO(task.date);
  wdgCalSaveState();
  wdgCalRender();
}

function wdgCalAddTask() {
  const title = prompt('Название новой задачи:');
  if (!title || !title.trim()) return;
  const description = prompt('Описание:', 'Дополнительная задача к плану.') || '';
  const date = prompt('Дата в формате YYYY-MM-DD:', wdgCalSelectedDate) || wdgCalSelectedDate;
  const type = prompt('Тип: theory, practice, project, repeat, career, rest', 'practice') || 'practice';
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? wdgCalClampDate(date) : wdgCalSelectedDate;
  const safeType = WDG_CAL_TYPES[type] ? type : 'practice';
  wdgCalState.tasks.push({
    id: `wdg-cal-custom-${Date.now()}`,
    date: safeDate,
    title: title.trim(),
    type: safeType,
    description: description.trim(),
    done: false
  });
  wdgCalSelectedDate = safeDate;
  wdgCalMonthCursor = wdgCalFromISO(safeDate);
  wdgCalSaveState();
  wdgCalRender();
}

function wdgCalMoveDay(amount) {
  wdgCalSelectedDate = wdgCalClampDate(wdgCalToISO(wdgCalAddDays(wdgCalFromISO(wdgCalSelectedDate), amount)));
  wdgCalMonthCursor = wdgCalFromISO(wdgCalSelectedDate);
  wdgCalRender();
}

function wdgCalMoveMonth(amount) {
  wdgCalMonthCursor = new Date(wdgCalMonthCursor.getFullYear(), wdgCalMonthCursor.getMonth() + amount, 1);
  wdgCalRenderMonth();
}

function wdgCalSelectDate(date) {
  wdgCalSelectedDate = wdgCalClampDate(date);
  wdgCalMonthCursor = wdgCalFromISO(wdgCalSelectedDate);
  wdgCalRender();
}

function wdgCalGoToday() {
  wdgCalSelectedDate = wdgCalClampDate(wdgCalTodayISO());
  wdgCalMonthCursor = wdgCalFromISO(wdgCalSelectedDate);
  wdgCalRender();
}

function wdgCalResetPlan() {
  if (!confirm('Сбросить календарь к базовому плану: 1 час учёбы и 3 дня отдыха?')) return;
  wdgCalState = wdgCalCreatePlan();
  wdgCalSaveState();
  wdgCalGoToday();
  showToast('Календарь сброшен');
}

function wdgCalExport() {
  const blob = new Blob([JSON.stringify(wdgCalGetSnapshot(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'webdevgym-calendar-2026.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Календарь скачан в JSON');
}

function wdgCalImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));
        if (!Array.isArray(data.tasks)) throw new Error('bad calendar');
        wdgCalApplySnapshot(data);
        showToast('Календарь импортирован');
      } catch (e) {
        showToast('Не получилось импортировать календарь');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function wdgCalTasksForDate(date) {
  return wdgCalState.tasks
    .filter(task => task.date === date)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function wdgCalNextLesson() {
  return [...wdgCalState.tasks]
    .filter(task => task.type !== 'rest' && !task.done && task.date >= wdgCalTodayISO())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

function wdgCalInit() {
  wdgCalLoadState();
  const note = document.getElementById('wdgCalNote');
  if (note) {
    note.value = localStorage.getItem(WDG_CAL_NOTE_STORAGE) || '';
    note.addEventListener('input', () => {
      localStorage.setItem(WDG_CAL_NOTE_STORAGE, note.value);
    });
  }
  wdgCalRender();
}

function wdgCalClampDate(date) {
  if (date < WDG_CAL_START) return WDG_CAL_START;
  if (date > WDG_CAL_END) return WDG_CAL_END;
  return date;
}

function wdgCalTodayISO() {
  return wdgCalToISO(new Date());
}

function wdgCalToISO(date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function wdgCalFromISO(date) {
  return new Date(`${date}T00:00:00`);
}

function wdgCalAddDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function wdgCalFormatFull(date) {
  return date.toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

function wdgCalFormatShort(date) {
  return date.toLocaleDateString('ru-RU', { day:'2-digit', month:'short' });
}

function wdgCalEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  wdgCalInit();
});

// ===== RESET PROGRESS =====
function resetProgress() {
  if (!confirm('Сбросить весь прогресс? Это действие нельзя отменить.')) return;

  // Снимаем галочки и чистим localStorage по data-pid
  document.querySelectorAll('.prog-cb[data-pid]').forEach(cb => {
    cb.checked = false;
    localStorage.removeItem('prog_' + cb.dataset.pid);
    const item = cb.closest('.item');
    if (item) item.classList.remove('checked');
  });

  // Чистим прогресс пройденных квизов и снова блокируем чекбоксы
  if (typeof QUIZ_ANSWERS === 'object') {
    Object.keys(QUIZ_ANSWERS).forEach(quizId => {
      localStorage.removeItem('quiz_passed_' + quizId);
      const itemsContainer = document.getElementById('items-' + quizId);
      if (itemsContainer) {
        itemsContainer.querySelectorAll('.item').forEach(item => {
          const cb = item.querySelector('input[type=checkbox]');
          if (cb && cb.dataset.pid) {
            // Возвращаем блокировку только тем чекбоксам, которые были изначально locked
            // (определяем по наличию data-was-locked, проставим при первой загрузке если нужно)
          }
        });
      }
      const resultEl = document.getElementById('result-' + quizId);
      if (resultEl) { resultEl.className = 'quiz-result'; resultEl.textContent = ''; }
    });
  }

  const all = document.querySelectorAll('.prog-cb:not([disabled])');
  const fillEl = document.getElementById('prog-fill');
  const lblEl = document.getElementById('prog-label');
  if (fillEl) fillEl.style.width = '0%';
  if (lblEl) lblEl.textContent = `Прогресс: 0 / ${all.length} тем изучено (0%) · v48`;
  updateTabBadges();
  updatePdcBars();
  showToast('Прогресс сброшен — перезагрузи страницу чтобы вернуть заблокированные темы');
}

// ===== TAB BADGES =====
function updateTabBadges() {
  ['html','css','js','ts','react','electron','git','node','sql','devops','linux','vite','pg','python','csharp'].forEach(lang => {
    const sec = document.getElementById('sec-' + lang);
    if (!sec) return;
    const all = sec.querySelectorAll('.prog-cb:not([disabled])');
    const done = sec.querySelectorAll('.prog-cb:not([disabled]):checked');
    const badge = document.getElementById('badge-' + lang);
    if (badge) badge.textContent = done.length + '/' + all.length;
  });
}

// ===== КАРУСЕЛЬ ДЕМО =====
let carouselCurrent = 0;
const CAROUSEL_COUNT = 3;

function carouselRender() {
  const slides = document.querySelectorAll('#carousel-demo .cs-slide');
  const dots = document.querySelectorAll('#cs-dots div');
  slides.forEach((s, i) => {
    const offset = (i - carouselCurrent) * 100;
    s.style.transform = `translateX(${offset}%)`;
  });
  dots.forEach((d, i) => {
    d.style.background = i === carouselCurrent ? '#6366f1' : 'rgba(255,255,255,.3)';
    d.style.width = i === carouselCurrent ? '22px' : '8px';
    d.style.borderRadius = '99px';
  });
}

function carouselMove(dir) {
  carouselCurrent = (carouselCurrent + dir + CAROUSEL_COUNT) % CAROUSEL_COUNT;
  carouselRender();
}

function carouselGoTo(n) {
  carouselCurrent = n;
  carouselRender();
}

setInterval(() => {
  if (document.getElementById('carousel-demo')) carouselMove(1);
}, 4500);

function csSwitch(id, btn) {
  document.querySelectorAll('.cs-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.cs-subtab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('cs-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

function switchTab(id, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'ai' && typeof aiRestoreConfigUI === 'function') {
    setTimeout(aiRestoreConfigUI, 50);
  }
  if (id === 'github' && typeof ghRestoreFields === 'function') {
    setTimeout(ghRestoreFields, 50);
  }
  if (id === 'calendar' && typeof wdgCalRender === 'function') {
    setTimeout(wdgCalRender, 50);
  }
}

// ===== ПРОГРЕСС =====
function updateProgress(cb) {
  const item = cb.closest ? cb.closest('.item') : null;
  if (item) {
    if (cb.checked) item.classList.add('checked');
    else item.classList.remove('checked');
  }
  // Сохраняем по data-pid (стабильный уникальный id для каждого чекбокса прогресса)
  const pid = cb.dataset ? cb.dataset.pid : null;
  if (pid) {
    if (cb.checked) localStorage.setItem('prog_' + pid, '1');
    else localStorage.removeItem('prog_' + pid);
  }
  const all = document.querySelectorAll('.prog-cb:not([disabled])');
  const done = document.querySelectorAll('.prog-cb:not([disabled]):checked');
  const pct = all.length ? Math.round(done.length / all.length * 100) : 0;
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-label').textContent = `Прогресс: ${done.length} / ${all.length} тем изучено (${pct}%) · v43`;
  updateTabBadges();
  updatePdcBars();
}

// Восстанавливает отмеченные чекбоксы И пройденные квизы из localStorage при загрузке страницы
function restoreProgressCheckboxes() {
  // 1. Сначала восстанавливаем пройденные квизы — разблокируем locked чекбоксы
  if (typeof QUIZ_ANSWERS === 'object') {
    Object.keys(QUIZ_ANSWERS).forEach(quizId => {
      try {
        if (localStorage.getItem('quiz_passed_' + quizId) === '1') {
          unlockQuizItems(quizId);
        }
      } catch(e) {}
    });
  }

  // 2. Теперь восстанавливаем отметки чекбоксов (включая те что были locked, но уже разблокированы выше)
  document.querySelectorAll('.prog-cb[data-pid]').forEach(cb => {
    const saved = localStorage.getItem('prog_' + cb.dataset.pid);
    if (saved === '1' && !cb.disabled) {
      cb.checked = true;
      const item = cb.closest('.item');
      if (item) item.classList.add('checked');
    }
  });

  updateTabBadges();
  updatePdcBars();
  const all = document.querySelectorAll('.prog-cb:not([disabled])');
  const done = document.querySelectorAll('.prog-cb:not([disabled]):checked');
  const pct = all.length ? Math.round(done.length / all.length * 100) : 0;
  const fillEl = document.getElementById('prog-fill');
  const lblEl = document.getElementById('prog-label');
  if (fillEl) fillEl.style.width = pct + '%';
  if (lblEl) lblEl.textContent = `Прогресс: ${done.length} / ${all.length} тем изучено (${pct}%) · v43`;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof restoreProgressCheckboxes === 'function') restoreProgressCheckboxes();
});


// ===== ПРОГРЕСС DASHBOARD BARS =====
function updatePdcBars() {
  ['html','css','js','ts','react','electron','git','node','sql','devops','linux','vite','pg','python','csharp'].forEach(lang => {
    const sec = document.getElementById('sec-' + lang);
    if (!sec) return;
    const all = sec.querySelectorAll('.prog-cb:not([disabled])');
    const done = sec.querySelectorAll('.prog-cb:not([disabled]):checked');
    const pct = all.length ? Math.round(done.length / all.length * 100) : 0;
    const fill = document.getElementById('pdc-' + lang);
    const pctEl = document.getElementById('pdcp-' + lang);
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  });
}

// ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДКИ ПО ИМЕНИ (для dashboard-карточек) =====
function switchTabByName(name) {
  let found = null;
  document.querySelectorAll('.tab').forEach(t => {
    const oc = t.getAttribute('onclick') || '';
    if (oc.includes("'" + name + "'")) found = t;
  });
  if (found) { found.click(); }
}

// ===== ФИЛЬТР ЗАКЛАДОК =====
function toggleBmFilter() {
  const wrap = document.querySelector('.wrap');
  const btn = document.getElementById('bmFilterBtn');
  const isActive = wrap.classList.toggle('bm-filter-active');
  btn.classList.toggle('active', isActive);
  btn.textContent = isActive ? '🔖 Все темы' : '🔖 Закладки';
  let emptyEl = document.getElementById('bm-empty-msg');
  if (!emptyEl) {
    emptyEl = document.createElement('div');
    emptyEl.id = 'bm-empty-msg';
    emptyEl.className = 'bm-empty';
    emptyEl.textContent = '⭐ Нет закладок. Нажми ★ рядом с темой, чтобы добавить.';
    wrap.appendChild(emptyEl);
  }
  const hasBookmarks = document.querySelectorAll('.block.bookmarked').length > 0;
  emptyEl.style.display = (isActive && !hasBookmarks) ? 'block' : 'none';
}

// ===== SEND PROMPT (копирует текст подсказки в буфер) =====
function sendPrompt(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Подсказка скопирована — вставь в новый чат ↗');
    }).catch(() => { showToast('Скопируй вручную: ' + text); });
  } else {
    showToast('Скопируй вручную: ' + text);
  }
}

function showToast(msg) {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1f2e;color:#e2e8f0;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,.3);z-index:9999;transition:opacity .3s;pointer-events:none;border:1px solid #2d3348;max-width:90vw;text-align:center;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

// ===== ПОИСК =====
function doSearch(query) {
  const q = query.trim().toLowerCase();
  // Show/hide across all sections
  let totalVisible = 0;
  document.querySelectorAll('.block').forEach(block => {
    const titleEl  = block.querySelector('.block-title');
    const itemEls  = block.querySelectorAll('.item span');
    const explainEls = block.querySelectorAll('.explain, .tip, .tip-violet');
    const titleText  = titleEl ? titleEl.textContent.toLowerCase() : '';
    const itemsText  = Array.from(itemEls).map(e => e.textContent.toLowerCase()).join(' ');
    const explainText = Array.from(explainEls).map(e => e.textContent.toLowerCase()).join(' ');
    const match = !q || titleText.includes(q) || itemsText.includes(q) || explainText.includes(q);
    block.classList.toggle('search-hidden', !match);
    if (match) totalVisible++;
  });

  // Show all sections when searching
  if (q) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'block');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  } else {
    document.querySelectorAll('.section').forEach(s => s.style.display = '');
    // Re-activate current tab
    const active = document.querySelector('.section.active');
    if (!active) {
      document.getElementById('sec-html').classList.add('active');
      document.querySelector('.tab').classList.add('active');
    }
  }

  // Show no-results message
  let noRes = document.getElementById('search-no-results');
  if (!noRes) {
    noRes = document.createElement('div');
    noRes.id = 'search-no-results';
    noRes.className = 'search-no-results';
    noRes.textContent = '🔍 Ничего не найдено. Попробуй другой запрос.';
    document.querySelector('.wrap').appendChild(noRes);
  }
  noRes.style.display = (q && totalVisible === 0) ? 'block' : 'none';
}

// ===== СКРОЛЛ К БЛОКУ =====
function scrollToBlock(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + id);
  }
}

// ===== ТУМБЛЕР ДЕМО =====
function toggleSwitch(id, statusId) {
  const btn = document.getElementById(id);
  btn.classList.toggle('on');
  const isOn = btn.classList.contains('on');
  document.getElementById(statusId).textContent = isOn ? 'Включено' : 'Выключено';
  document.getElementById(statusId).style.color = isOn ? '#6366f1' : '#9ca3af';
}

// ===== МАШИНА =====
function driveCar() {
  const container = document.getElementById('carDemo');
  const car = document.getElementById('car');
  if (container.classList.contains('drove')) {
    container.classList.remove('drove');
    car.style.transform = '';
    container.querySelector('.demo-car-label').textContent = 'Кликни на дорогу 🖱️';
  } else {
    container.classList.add('drove');
    container.querySelector('.demo-car-label').textContent = 'Уехала! Кликни снова 🔄';
  }
}

// ===== СКРОЛЛ-АНИМАЦИЯ ДЕМО =====
function triggerScrollAnim() {
  const items = document.querySelectorAll('#scrollDemo .scroll-item');
  items.forEach(el => el.classList.remove('visible'));
  items.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 300 + 100);
  });
}

// ===== ГАЙДЫ — переключение языка =====


function toggleBookRead(btn) {
  const card = btn.closest('.book-card');
  const id   = card.dataset.bookId;
  const isRead = btn.classList.toggle('read');
  card.classList.toggle('read', isRead);
  btn.innerHTML = isRead ? '✓ Прочитано' : '📖 Прочитал';
  if (id) localStorage.setItem('book_' + id, isRead ? '1' : '0');
  updateBooksCounter();
}

function updateBooksCounter() {
  const all  = document.querySelectorAll('.book-card');
  const done = document.querySelectorAll('.book-card.read');
  const el   = document.getElementById('booksCounter');
  if (el) el.textContent = `Прочитано: ${done.length} / ${all.length}`;
}

function restoreBooksRead() {
  document.querySelectorAll('.book-card').forEach(card => {
    const id = card.dataset.bookId;
    if (!id) return;
    if (localStorage.getItem('book_' + id) === '1') {
      card.classList.add('read');
      const btn = card.querySelector('.book-read-btn');
      if (btn) {
        btn.classList.add('read');
        btn.innerHTML = '✓ Прочитано';
      }
    }
  });
  updateBooksCounter();
}

document.addEventListener('DOMContentLoaded', restoreBooksRead);


function copyFontCss(btn, name, cat) {
  const fallbacks = {
    sans:    "'Segoe UI', system-ui, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    display: "'Segoe UI', system-ui, sans-serif",
    mono:    "'Consolas', 'Courier New', monospace",
    hand:    "cursive",
  };
  const fb = fallbacks[cat] || fallbacks.sans;
  const css = `font-family: '${name}', ${fb};`;
  navigator.clipboard.writeText(css).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Скопировано';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1500);
  }).catch(() => {
    alert('Не получилось скопировать. Скопируй вручную:\n' + css);
  });
}

function copyFontHtml(btn, name) {
  const slug = name.replace(/ /g, '+');
  const html = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${slug}:wght@400;500;700&display=swap" rel="stylesheet">`;
  navigator.clipboard.writeText(html).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Скопировано';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1500);
  }).catch(() => {
    alert('Не получилось скопировать. Скопируй вручную:\n' + html);
  });
}

let activeFontCat = 'all';
let activeFontQuery = '';

function applyFontFilters() {
  let visibleCount = 0;
  document.querySelectorAll('.font-card').forEach(card => {
    const matchesCat = activeFontCat === 'all' || card.dataset.cat === activeFontCat;
    const matchesQ   = !activeFontQuery || card.dataset.name.includes(activeFontQuery);
    const visible = matchesCat && matchesQ;
    card.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });
  // Hide empty groups
  document.querySelectorAll('.font-group').forEach(group => {
    const anyVisible = group.querySelectorAll('.font-card:not([style*="display: none"])').length > 0;
    group.style.display = anyVisible ? '' : 'none';
  });
  const empty = document.getElementById('fontsEmpty');
  if (empty) empty.classList.toggle('show', visibleCount === 0);
}

function filterFonts(cat, btn) {
  document.querySelectorAll('.font-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFontCat = cat;
  applyFontFilters();
}

function searchFonts(query) {
  activeFontQuery = query.trim().toLowerCase();
  applyFontFilters();
}


function showBooks(lang, btn) {
  document.querySelectorAll('.book-lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.book-list').forEach(g => g.classList.remove('active'));
  const target = document.getElementById('book-' + lang);
  if (target) target.classList.add('active');
}

function showGuides(lang, btn) {
  document.querySelectorAll('.guide-lang-btn').forEach(b => {
    b.classList.remove('active');
    // Reset inline styles for PHP/C++ buttons when deactivated
    if (b.dataset.lang === 'php') { b.style.background = 'linear-gradient(135deg,#4f46e5,#7c3aed)'; b.style.color = '#fff'; }
    else if (b.dataset.lang === 'cpp') { b.style.background = 'linear-gradient(135deg,#0e7490,#0369a1)'; b.style.color = '#fff'; }
    else { b.style.background = ''; b.style.color = ''; }
  });
  btn.classList.add('active');
  document.querySelectorAll('.guide-list').forEach(g => g.style.display = 'none');
  document.getElementById('guide-' + lang).style.display = 'flex';
}

// ===== МОДАЛЬНОЕ ОКНО ГАЙДА =====
const guideData = {
  // HTML
  'html-structure': {
    title: '🏗️ Структура HTML-страницы',
    sub: 'HTML · Уровень: Основа',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Что такое HTML?</div>
        <div class="explain">HTML — HyperText Markup Language. Это язык <strong>разметки</strong>, не программирования. Ты говоришь браузеру, <em>что</em> показать (заголовок, текст, картинку), а не <em>как</em> выглядит (это CSS).</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Минимальный скелет страницы</div>
        <div class="code">&lt;!DOCTYPE html&gt;
&lt;html lang="ru"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;Моя страница&lt;/title&gt;
    &lt;link rel="stylesheet" href="style.css"&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Привет, мир!&lt;/h1&gt;
    &lt;p&gt;Это мой первый сайт.&lt;/p&gt;
    &lt;script src="main.js"&gt;&lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;</div>
        <div class="explain">
          <strong>&lt;!DOCTYPE html&gt;</strong> — всегда первая строка. Без неё браузер включит «режим совместимости» — сайт отобразится криво.<br><br>
          <strong>&lt;head&gt;</strong> — невидимые настройки. Всё что нужно браузеру, но не нужно пользователю.<br><br>
          <strong>viewport meta</strong> — делает сайт нормальным на телефоне. Без него мобильный браузер покажет «уменьшенную копию» компьютерного сайта.<br><br>
          <strong>&lt;script&gt; в конце &lt;body&gt;</strong> — так страница загрузится быстрее: HTML разбирается сверху вниз, JS не будет блокировать отображение.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> head vs body — что куда?</div>
        <div class="explain">
          В <strong>&lt;head&gt;</strong>: charset, viewport, title, подключение CSS, meta-теги для SEO, og:image для соцсетей.<br><br>
          В <strong>&lt;body&gt;</strong>: всё, что видит пользователь — заголовки, текст, картинки, формы, кнопки. Script — в конце body.
        </div>
      </div>
    `
  },
  'html-tags': {
    title: '🏷️ Все нужные теги за 10 минут',
    sub: 'HTML · Уровень: Новичок',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Текст и заголовки</div>
        <div class="code">&lt;h1&gt;Главный заголовок (один на странице!)&lt;/h1&gt;
&lt;h2&gt;Заголовок раздела&lt;/h2&gt;
&lt;h3&gt;Подраздел&lt;/h3&gt;
&lt;p&gt;Абзац текста. Автоматические отступы сверху/снизу.&lt;/p&gt;
&lt;strong&gt;Жирный важный текст&lt;/strong&gt;
&lt;em&gt;Курсив — акцент&lt;/em&gt;
&lt;span&gt;Строчный контейнер — для стилизации части текста&lt;/span&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Ссылки и картинки</div>
        <div class="code">&lt;a href="https://google.com" target="_blank" rel="noopener"&gt;Ссылка&lt;/a&gt;
&lt;a href="#section2"&gt;Якорь — скроллит к id="section2"&lt;/a&gt;
&lt;a href="mailto:you@mail.com"&gt;Написать письмо&lt;/a&gt;

&lt;img src="photo.jpg" alt="Описание для слепых" width="400" height="300"&gt;
&lt;img src="https://site.com/image.png" alt="Картинка с интернета"&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Контейнеры</div>
        <div class="code">&lt;div&gt;Блочный контейнер — занимает всю строку&lt;/div&gt;
&lt;span&gt;Строчный — только вокруг содержимого&lt;/span&gt;

&lt;!-- Различие: --&gt;
&lt;p&gt;Текст &lt;span style="color:red"&gt;красное слово&lt;/span&gt; текст&lt;/p&gt;
&lt;div style="background:yellow"&gt;Жёлтый блок на всю ширину&lt;/div&gt;</div>
        <div class="explain">
          <strong>div</strong> — блочный (с новой строки, на всю ширину). <strong>span</strong> — строчный (внутри текста).
        </div>
      </div>
    `
  },
  'html-forms': {
    title: '📝 Формы: input, select, button',
    sub: 'HTML · Уровень: Новичок',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Базовая форма</div>
        <div class="code">&lt;form id="myForm"&gt;
  &lt;label for="username"&gt;Имя пользователя:&lt;/label&gt;
  &lt;input type="text" id="username" name="username"
    placeholder="Введи имя" required minlength="3"&gt;

  &lt;label for="email"&gt;Email:&lt;/label&gt;
  &lt;input type="email" id="email" name="email"
    placeholder="you@example.com" required&gt;

  &lt;label for="password"&gt;Пароль:&lt;/label&gt;
  &lt;input type="password" id="password" minlength="8"&gt;

  &lt;button type="submit"&gt;Зарегистрироваться&lt;/button&gt;
&lt;/form&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Все типы input</div>
        <div class="code">&lt;input type="text"&gt;     — обычный текст
&lt;input type="email"&gt;    — браузер проверит @ и точку
&lt;input type="password"&gt; — звёздочки
&lt;input type="number" min="0" max="100"&gt;   — только числа
&lt;input type="checkbox"&gt; — галочка
&lt;input type="radio" name="color" value="red"&gt;  — одна из группы
&lt;input type="range" min="0" max="100"&gt;   — ползунок
&lt;input type="date"&gt;     — выбор даты
&lt;input type="file"&gt;     — загрузка файла
&lt;input type="color"&gt;    — выбор цвета
&lt;input type="hidden" value="secret"&gt;  — скрытое поле</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Обработка в JS</div>
        <div class="code">document.getElementById('myForm')
  .addEventListener('submit', (e) => {
    e.preventDefault(); // Не перезагружать страницу!

    const name = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!name) {
      alert('Введи имя!');
      return;
    }
    console.log('Отправляем:', { name, email });
  });</div>
      </div>
    `
  },
  'html-semantic': {
    title: '🧠 Семантика HTML',
    sub: 'HTML · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Зачем семантика?</div>
        <div class="explain">
          Без семантики — сайт для браузера как текст без знаков препинания. Непонятно, где важное, а где нет. Семантика помогает: поисковикам (SEO), скринридерам (слепым пользователям), другим разработчикам в команде.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Было vs Стало</div>
        <div class="code">&lt;!-- ❌ ДО: всё через div --&gt;
&lt;div class="header"&gt;...&lt;/div&gt;
&lt;div class="nav"&gt;...&lt;/div&gt;
&lt;div class="main"&gt;...&lt;/div&gt;
&lt;div class="footer"&gt;...&lt;/div&gt;

&lt;!-- ✅ ПОСЛЕ: семантика --&gt;
&lt;header&gt;
  &lt;nav&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;a href="/"&gt;Главная&lt;/a&gt;&lt;/li&gt;
      &lt;li&gt;&lt;a href="/about"&gt;О нас&lt;/a&gt;&lt;/li&gt;
    &lt;/ul&gt;
  &lt;/nav&gt;
&lt;/header&gt;
&lt;main&gt;
  &lt;section&gt;
    &lt;h2&gt;Новости&lt;/h2&gt;
    &lt;article&gt;
      &lt;h3&gt;Заголовок статьи&lt;/h3&gt;
      &lt;p&gt;Текст...&lt;/p&gt;
    &lt;/article&gt;
  &lt;/section&gt;
  &lt;aside&gt;Реклама / доп. контент&lt;/aside&gt;
&lt;/main&gt;
&lt;footer&gt;© 2025 Мой сайт&lt;/footer&gt;</div>
      </div>
    `
  },
  // CSS
  'css-connect': {
    title: '🔗 Как подключить CSS к HTML',
    sub: 'CSS · Уровень: Основа',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Три способа добавить CSS</div>
        <div class="code">&lt;!-- СПОСОБ 1: Внешний файл (ЛУЧШИЙ способ) --&gt;
&lt;head&gt;
  &lt;link rel="stylesheet" href="style.css"&gt;
&lt;/head&gt;

&lt;!-- СПОСОБ 2: Стиль прямо в HTML (для небольших проектов) --&gt;
&lt;head&gt;
  &lt;style&gt;
    h1 { color: red; }
  &lt;/style&gt;
&lt;/head&gt;

&lt;!-- СПОСОБ 3: Inline стиль (избегай!) --&gt;
&lt;h1 style="color: red;"&gt;Заголовок&lt;/h1&gt;</div>
        <div class="explain">
          <strong>Способ 1 — лучший</strong>: CSS отдельно, HTML отдельно. Браузер кэширует style.css — загружается быстрее.<br>
          <strong>Способ 3 — худший</strong>: стиль прямо в теге. Нельзя переиспользовать, сложно менять тему.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Частые ошибки подключения</div>
        <div class="code">/* ❌ Неправильный путь к файлу */
&lt;link rel="stylesheet" href="Style.css"&gt;   /* заглавная S! */
&lt;link rel="stylesheet" href="styles/style.css"&gt; /* файл не в папке */

/* ✅ Правильно */
&lt;link rel="stylesheet" href="style.css"&gt;  /* файл рядом с HTML */
&lt;link rel="stylesheet" href="css/style.css"&gt; /* файл в папке css/ */
&lt;link rel="stylesheet" href="../style.css"&gt; /* файл уровень выше */</div>
      </div>
    `
  },
  'css-toggle': {
    title: '🔘 Тумблер (Toggle) с нуля',
    sub: 'CSS · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Принцип работы</div>
        <div class="explain">
          Тумблер — это <strong>скрытый checkbox</strong> + красиво стилизованный span. Когда чекбокс включён (<code>:checked</code>), CSS меняет стиль span через селектор <code>input:checked + .slider</code>.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> HTML</div>
        <div class="code">&lt;label class="toggle-wrap"&gt;
  &lt;input type="checkbox" id="themeToggle"&gt;
  &lt;span class="slider"&gt;&lt;/span&gt;
&lt;/label&gt;
&lt;span&gt;Тёмная тема&lt;/span&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> CSS</div>
        <div class="code">.toggle-wrap {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

/* Скрываем сам чекбокс */
.toggle-wrap input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

/* Фоновая дорожка */
.slider {
  position: absolute;
  inset: 0;
  background: #d1d5db;
  border-radius: 999px;
  transition: background 0.3s ease;
}

/* Шарик — через ::before */
.slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  bottom: 4px;
  left: 4px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
}

/* Когда чекбокс включён — фон меняется */
input:checked + .slider {
  background: #6366f1;
}

/* Когда чекбокс включён — шарик едет вправо */
input:checked + .slider::before {
  transform: translateX(24px);
}</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">4</span> Читаем состояние в JS</div>
        <div class="code">const toggle = document.getElementById('themeToggle');

toggle.addEventListener('change', () => {
  if (toggle.checked) {
    document.body.classList.add('dark');
    console.log('Тёмная тема включена');
  } else {
    document.body.classList.remove('dark');
    console.log('Светлая тема');
  }
});

/* Или короче: */
toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', toggle.checked);
});</div>
        <div class="explain">
          <strong>toggle.checked</strong> — это просто <code>true</code> или <code>false</code>. Всё что нужно — проверить это значение и что-то сделать.
        </div>
      </div>
    `
  },
  'css-animations': {
    title: '✨ CSS Анимации — полный гайд',
    sub: 'CSS · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> transition — плавные hover-эффекты</div>
        <div class="code">.btn {
  background: #6366f1;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  /* Указываем: что менять, как долго, с какой кривой */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn:active {
  transform: scale(0.97); /* Нажатие — чуть уменьшается */
}</div>
        <div class="explain">
          <strong>transition: свойство длительность кривая</strong><br>
          Кривые: <code>ease</code> (плавно), <code>linear</code> (равномерно), <code>ease-in-out</code> (разгон/торможение), <code>cubic-bezier()</code> (своя).
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> @keyframes — кастомные анимации</div>
        <div class="code">/* Спиннер загрузки */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Пульсация */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.4); }
  50%       { box-shadow: 0 0 0 16px rgba(99,102,241, 0); }
}
.notification { animation: pulse 2s infinite; }

/* Появление снизу */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card { animation: slideUp 0.4s ease forwards; }</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Объект «ломается» при наведении</div>
        <div class="code">.box {
  width: 100px; height: 100px;
  background: #ec4899;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* При наведении — «ломается» */
.box:hover {
  border-radius: 50% 12px 50% 12px;
  transform: rotate(15deg) scale(0.9);
  filter: hue-rotate(90deg);
}

/* При убирании мыши — восстанавливается автоматически!
   transition сработает и в обратную сторону */</div>
        <div class="explain">
          Ключ в том, что <code>transition</code> работает <strong>в обе стороны</strong> — и при наведении, и при убирании мыши. Тебе не нужно писать отдельный CSS для «восстановления».
        </div>
      </div>
    `
  },
  'css-flexbox': {
    title: '📐 Flexbox за 15 минут',
    sub: 'CSS · Уровень: Основа',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Включаем Flexbox</div>
        <div class="code">.container {
  display: flex; /* Дети встают в ряд */
}</div>
        <div class="explain">Flexbox работает на <strong>контейнере</strong>. Всё внутри него — flex-элементы.</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Выравнивание</div>
        <div class="code">.container {
  display: flex;
  justify-content: center;    /* Горизонталь: center, flex-start, flex-end, space-between */
  align-items: center;        /* Вертикаль: center, flex-start, flex-end, stretch */
  gap: 16px;                  /* Расстояние между детьми */
  flex-wrap: wrap;            /* Перенос если не влезают */
  flex-direction: column;     /* Вертикально вместо ряда */
}</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Свойства детей</div>
        <div class="code">.item {
  flex: 1;          /* Занять равную долю свободного места */
  flex: 0 0 200px;  /* Не расти, не сжиматься, ширина 200px */
  align-self: flex-start; /* Свой выровнять иначе, чем остальных */
  order: -1;        /* Поставить первым (по умолчанию 0) */
}</div>
      </div>
    `
  },
  'css-responsive': {
    title: '📱 Адаптивная вёрстка',
    sub: 'CSS · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Подход Mobile First</div>
        <div class="explain">Сначала пишем стили для телефона (маленький экран), потом расширяем для больших через <code>@media (min-width)</code>.</div>
        <div class="code">/* База — телефон */
.container { flex-direction: column; }
.card { width: 100%; }

/* Планшет+ */
@media (min-width: 768px) {
  .container { flex-direction: row; flex-wrap: wrap; }
  .card { width: calc(50% - 12px); }
}

/* Десктоп */
@media (min-width: 1024px) {
  .card { width: calc(33.333% - 14px); }
}</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Стандартные брейкпоинты</div>
        <div class="code">/* Телефон: до 480px — ничего не пишем, это база */
@media (min-width: 480px)  { /* Большой телефон */ }
@media (min-width: 768px)  { /* Планшет */ }
@media (min-width: 1024px) { /* Маленький ноутбук */ }
@media (min-width: 1280px) { /* Десктоп */ }</div>
      </div>
    `
  },
  // JS
  'js-dom': {
    title: '🖱️ DOM: меняем страницу из JS',
    sub: 'JavaScript · Уровень: Основа',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Найти элемент</div>
        <div class="code">// По классу — первый
const btn = document.querySelector('.btn');

// По id
const header = document.querySelector('#header');
// или
const header2 = document.getElementById('header');

// Все элементы сразу
const allCards = document.querySelectorAll('.card');
allCards.forEach(card => console.log(card));</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Изменить содержимое</div>
        <div class="code">const title = document.querySelector('h1');

title.textContent = 'Новый заголовок';   // Текст
title.innerHTML = 'Текст &lt;em&gt;и курсив&lt;/em&gt;'; // HTML (осторожно!)

// Стиль
title.style.color = 'red';
title.style.fontSize = '24px';

// Классы
title.classList.add('active');
title.classList.remove('active');
title.classList.toggle('dark');
const has = title.classList.contains('active'); // true/false</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Создать и удалить</div>
        <div class="code">// Создать
const li = document.createElement('li');
li.textContent = 'Новый пункт';
li.classList.add('task');

// Добавить в список
document.querySelector('ul').appendChild(li);
// Или в начало:
document.querySelector('ul').prepend(li);

// Удалить
li.remove();</div>
      </div>
    `
  },
  'js-toggle': {
    title: '🔁 Делаем тумблер на JS',
    sub: 'JavaScript · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> HTML-основа</div>
        <div class="code">&lt;label class="toggle-wrap"&gt;
  &lt;input type="checkbox" id="darkToggle"&gt;
  &lt;span class="slider"&gt;&lt;/span&gt;
&lt;/label&gt;
&lt;span id="themeLabel"&gt;Светлая тема&lt;/span&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> JS — слушаем изменение</div>
        <div class="code">const toggle = document.getElementById('darkToggle');
const label = document.getElementById('themeLabel');

toggle.addEventListener('change', () => {
  const isDark = toggle.checked;

  // Меняем класс на body
  document.body.classList.toggle('dark', isDark);

  // Меняем текст подписи
  label.textContent = isDark ? 'Тёмная тема' : 'Светлая тема';

  // Сохраняем в localStorage (запомним после перезагрузки!)
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// При загрузке страницы — восстанавливаем тему
const saved = localStorage.getItem('theme');
if (saved === 'dark') {
  toggle.checked = true;
  document.body.classList.add('dark');
  label.textContent = 'Тёмная тема';
}</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> CSS для тёмной темы</div>
        <div class="code">body {
  background: #ffffff;
  color: #111827;
  transition: background 0.3s, color 0.3s;
}

body.dark {
  background: #111827;
  color: #f9fafb;
}

body.dark .card {
  background: #1f2937;
  border-color: #374151;
}</div>
      </div>
    `
  },
  'js-events': {
    title: '⚡ События: click, input, submit',
    sub: 'JavaScript · Уровень: Основа',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Клик по кнопке</div>
        <div class="code">const btn = document.querySelector('#myBtn');

btn.addEventListener('click', () => {
  console.log('Нажали кнопку!');
  btn.textContent = 'Нажато ✓';
  btn.style.background = 'green';
});

// Двойной клик
btn.addEventListener('dblclick', () => {
  console.log('Двойной клик!');
});</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Живой поиск при вводе</div>
        <div class="code">const input = document.querySelector('#search');
const items = document.querySelectorAll('.item');

input.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    const match = text.includes(query);
    item.style.display = match ? 'block' : 'none';
  });
});</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Отправка формы</div>
        <div class="code">document.querySelector('form')
  .addEventListener('submit', (e) => {
    e.preventDefault(); // Без этого страница перезагрузится!

    const data = {
      name: document.querySelector('#name').value,
      email: document.querySelector('#email').value,
    };

    console.log('Данные формы:', data);
    // Отправляем на сервер...
  });</div>
      </div>
    `
  },
  'js-fetch': {
    title: '🌐 fetch + async/await',
    sub: 'JavaScript · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Загрузить данные с API</div>
        <div class="code">async function getPosts() {
  try {
    // 1. Делаем запрос
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');

    // 2. Проверяем статус
    if (!response.ok) throw new Error('HTTP ' + response.status);

    // 3. Парсим JSON
    const posts = await response.json();

    // 4. Работаем с данными
    posts.slice(0, 3).forEach(post => {
      console.log(post.title);
    });

  } catch (err) {
    console.error('Ошибка:', err);
  }
}

getPosts();</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Показать данные на странице</div>
        <div class="code">async function showWeather(city) {
  const list = document.querySelector('#posts');
  list.innerHTML = '&lt;div class="spinner"&gt;&lt;/div&gt;'; // Лоадер

  try {
    const r = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1');
    const posts = await r.json();

    list.innerHTML = posts.map(p =>
      '&lt;div class="card"&gt;&lt;h3&gt;' + p.title + '&lt;/h3&gt;&lt;p&gt;' + p.body + '&lt;/p&gt;&lt;/div&gt;'
    ).join('');

  } catch (e) {
    list.innerHTML = '&lt;p&gt;Ошибка загрузки 😢&lt;/p&gt;';
  }
}</div>
      </div>
    `
  },
  'js-localstorage': {
    title: '💾 localStorage — память браузера',
    sub: 'JavaScript · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Основные операции</div>
        <div class="code">// Сохранить строку
localStorage.setItem('username', 'Алекс');

// Прочитать
const name = localStorage.getItem('username'); // 'Алекс'

// Удалить одну запись
localStorage.removeItem('username');

// Очистить всё
localStorage.clear();</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Объекты и массивы</div>
        <div class="code">// Только строки! Объекты нужно конвертировать
const settings = {
  theme: 'dark',
  lang: 'ru',
  notifications: true
};

// Сохранить объект
localStorage.setItem('settings', JSON.stringify(settings));

// Прочитать объект
const saved = JSON.parse(localStorage.getItem('settings'));
console.log(saved.theme); // 'dark'

// Если ключа нет — вернёт null, не крашнется
const x = localStorage.getItem('nonexistent'); // null</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Сохраняем корзину магазина</div>
        <div class="code">// Загрузить корзину (при старте)
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Добавить товар
function addToCart(product) {
  const cart = getCart();
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Использование
addToCart({ id: 1, name: 'Кроссовки', price: 4990 });
console.log(getCart()); // [{id:1, ...}]</div>
      </div>
    `
  },
  // АНИМАЦИИ
  'anim-hover': {
    title: '🖱️ Hover-анимации: scale, rotate, glow',
    sub: 'Анимации · Уровень: Основа',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Базовые hover-эффекты</div>
        <div class="code">.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Поднять при наведении */
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0,0,0,.15);
}

/* Увеличить */
.btn:hover { transform: scale(1.05); }

/* Повернуть иконку */
.icon:hover { transform: rotate(90deg); }

/* Комбо */
.badge:hover {
  transform: scale(1.1) rotate(-3deg);
}</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Объект «ломается» при наведении и восстанавливается</div>
        <div class="code">.box {
  background: #ec4899;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  /* cubic-bezier с отрицательными значениями = «упругий» эффект */
}

.box:hover {
  border-radius: 50% 12px 50% 12px; /* «ломается»  */
  transform: rotate(15deg) scale(0.9);
  filter: hue-rotate(90deg);
}

/* Убрал мышь — .box:hover пропадает,
   transition плавно возвращает всё обратно! */</div>
        <div class="live-example">
          <div class="live-example-header">▶ ЖИВОЙ ПРИМЕР</div>
          <div class="live-example-body">
            <div class="demo-break" style="margin:0;">Ломай<br>меня!</div>
          </div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Glow эффект (свечение)</div>
        <div class="code">.glow-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.glow-btn:hover {
  box-shadow:
    0 0 20px rgba(99, 102, 241, 0.6),
    0 0 40px rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}</div>
      </div>
    `
  },
  'anim-scroll': {
    title: '📜 Анимация при скролле',
    sub: 'Анимации · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Машина уезжает при скролле</div>
        <div class="code">/* CSS */
.road {
  position: relative;
  overflow: hidden;
  height: 80px;
  background: linear-gradient(180deg, #bfdbfe 60%, #e5e7eb 60%);
}

.car {
  position: absolute;
  bottom: 8px;
  left: 10px;
  font-size: 36px;
  transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.car.drove {
  transform: translateX(500px); /* Уехала вправо */
}

// JavaScript
const road = document.querySelector('.road');
const car = document.querySelector('.car');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      car.classList.add('drove');    // Уезжает
    } else {
      car.classList.remove('drove'); // Возвращается
    }
  });
}, { threshold: 0.5 });

observer.observe(road);</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Элементы появляются при скролле</div>
        <div class="code">/* CSS */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Задержка для каждого по очереди */
.reveal:nth-child(2) { transition-delay: 0.1s; }
.reveal:nth-child(3) { transition-delay: 0.2s; }

// JavaScript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Срабатывает один раз
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});</div>
      </div>
    `
  },
  'anim-toggle': {
    title: '🔘 Анимированный тумблер',
    sub: 'Анимации · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Полный код тумблера</div>
        <div class="code">&lt;!-- HTML --&gt;
&lt;label class="toggle-wrap"&gt;
  &lt;input type="checkbox" id="toggle"&gt;
  &lt;span class="track"&gt;
    &lt;span class="thumb"&gt;&lt;/span&gt;
  &lt;/span&gt;
&lt;/label&gt;

/* CSS */
.toggle-wrap {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
}

.toggle-wrap input { display: none; }

.track {
  width: 52px; height: 28px;
  background: #d1d5db;
  border-radius: 999px;
  position: relative;
  transition: background 0.25s ease;
}

.thumb {
  position: absolute;
  width: 20px; height: 20px;
  background: white;
  border-radius: 50%;
  top: 4px; left: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,.2);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

input:checked ~ .track           { background: #6366f1; }
input:checked ~ .track .thumb    { transform: translateX(24px); }</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Живой пример</div>
        <div class="live-example">
          <div class="live-example-header">▶ ЖИВОЙ ПРИМЕР — нажми</div>
          <div class="live-example-body">
            <div class="demo-toggle-wrap">
              <div class="toggle-label">Тумблер</div>
              <button class="toggle" id="modalToggle" onclick="toggleSwitch('modalToggle', 'modalToggleStatus')"></button>
              <div class="toggle-status" id="modalToggleStatus">Выключено</div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  'anim-loader': {
    title: '⏳ Лоадеры и скелетоны',
    sub: 'Анимации · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Спиннер</div>
        <div class="code">/* HTML */
&lt;div class="spinner"&gt;&lt;/div&gt;

/* CSS */
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}</div>
        <div class="live-example">
          <div class="live-example-header">▶ СПИННЕР</div>
          <div class="live-example-body"><div class="demo-spinner"></div></div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Скелетон (пока данные грузятся)</div>
        <div class="code">/* HTML */
&lt;div class="skeleton-card"&gt;
  &lt;div class="skel skel-img"&gt;&lt;/div&gt;
  &lt;div class="skel skel-line w-100"&gt;&lt;/div&gt;
  &lt;div class="skel skel-line w-80"&gt;&lt;/div&gt;
  &lt;div class="skel skel-line w-60"&gt;&lt;/div&gt;
&lt;/div&gt;

/* CSS */
.skel {
  background: linear-gradient(
    90deg,
    #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
  margin-bottom: 8px;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

.skel-img { height: 120px; border-radius: 10px; }
.skel-line { height: 12px; }
.w-100 { width: 100%; }
.w-80  { width: 80%; }
.w-60  { width: 60%; }</div>
        <div class="live-example">
          <div class="live-example-header">▶ СКЕЛЕТОН</div>
          <div class="live-example-body">
            <div class="demo-skeleton"><div class="skel-line"></div><div class="skel-line"></div><div class="skel-line"></div></div>
          </div>
        </div>
      </div>
    `
  },
  'anim-gradient': {
    title: '🎨 Градиентный текст и glassmorphism',
    sub: 'Анимации · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Градиентный текст</div>
        <div class="code">.gradient-text {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #ec4899, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* С анимацией */
.gradient-text {
  background-size: 200% 200%;
  animation: gradientMove 3s ease infinite;
}

@keyframes gradientMove {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}</div>
        <div class="live-example">
          <div class="live-example-header">▶ ГРАДИЕНТНЫЙ ТЕКСТ</div>
          <div class="live-example-body"><div class="demo-gradient-text">Привет!</div></div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Glassmorphism (стекло)</div>
        <div class="code">/* Нужен фон с цветом/картинкой у родителя */
.parent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);       /* Размытие фона */
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  color: white;
}</div>
      </div>
    `
  },
  // ==================== PHP ====================
  'php-intro': {
    title: '🐘 Что такое PHP и как запустить',
    sub: 'PHP · Уровень: Новичок',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Что такое PHP и где он работает</div>
        <div class="explain">
          <strong>PHP</strong> — язык программирования для серверной стороны сайта. HTML/CSS/JS работают в браузере, а <strong>PHP работает на сервере</strong> — обрабатывает формы, подключается к базе данных, формирует HTML и отдаёт его браузеру.<br><br>
          <strong>Стек LAMP/WAMP:</strong> Linux/Windows + Apache (сервер) + MySQL (база) + PHP — классика для PHP-разработки.<br>
          <strong>XAMPP</strong> — бесплатная программа, которая устанавливает Apache + MySQL + PHP на твой компьютер за 5 минут.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Первая программа</div>
        <div class="code">&lt;?php
// Файл должен называться index.php, а не index.html!
echo "Привет, мир!";          // вывод текста
echo "&lt;h1&gt;Это PHP!&lt;/h1&gt;";   // можно выводить HTML

// Переменные — начинаются с $
$name = "Алекс";
$age  = 25;

echo "Меня зовут $name, мне $age лет.";

// Или так (двойные кавычки поддерживают переменные)
echo "Привет, {$name}!";
?&gt;</div>
        <div class="live-example">
          <div class="live-example-header"><iconify-icon icon="tabler:eye" width="14" height="14" style="vertical-align:middle"></iconify-icon> КАК ВЫГЛЯДИТ ВЫВОД</div>
          <div class="live-example-body" style="flex-direction:column;align-items:flex-start;gap:6px;">
            <div style="font-family:monospace;font-size:14px;">Привет, мир!</div>
            <h3 style="margin:0;">Это PHP!</h3>
            <div style="font-family:monospace;font-size:14px;">Меня зовут Алекс, мне 25 лет.</div>
          </div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> PHP внутри HTML — смешанный файл</div>
        <div class="code">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;&lt;title&gt;PHP сайт&lt;/title&gt;&lt;/head&gt;
&lt;body&gt;

&lt;h1&gt;&lt;?php echo "Добро пожаловать!"; ?&gt;&lt;/h1&gt;

&lt;?php
$items = ["Яблоко", "Банан", "Груша"];
foreach ($items as $item) {
    echo "&lt;li&gt;$item&lt;/li&gt;";
}
?&gt;

&lt;/body&gt;
&lt;/html&gt;</div>
        <div class="explain">
          <strong>Теги &lt;?php ... ?&gt;</strong> — всё между ними выполняется на сервере. Браузер получает уже готовый HTML.<br>
          <strong>Короткая запись:</strong> <code>&lt;?= $name ?&gt;</code> — то же самое что <code>&lt;?php echo $name; ?&gt;</code>
        </div>
      </div>
    `
  },
  'php-vars': {
    title: '📦 Переменные, строки, массивы в PHP',
    sub: 'PHP · Уровень: Новичок',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Переменные и типы данных</div>
        <div class="code">&lt;?php
// Строка (string)
$name = "Алекс";
$greeting = 'Привет!';           // одинарные кавычки — без переменных внутри

// Число (int, float)
$age    = 25;
$price  = 9.99;

// Логический (bool)
$isOnline = true;
$isAdmin  = false;

// null — ничего
$empty = null;

// Узнать тип
var_dump($age);           // int(25)
var_dump($price);         // float(9.99)
gettype($name);           // "string"
?&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Работа со строками</div>
        <div class="code">&lt;?php
$name = "Алекс";
$city = "Москва";

// Конкатенация — точка объединяет строки
$msg = "Привет, " . $name . " из " . $city . "!";
echo $msg;  // Привет, Алекс из Москвы!

// Длина строки
echo strlen($name);        // 5

// В верхний / нижний регистр
echo strtoupper($name);    // АЛЕКС
echo strtolower($name);    // алекс

// Замена
echo str_replace("Алекс", "Иван", $msg);

// Разбить строку по разделителю
$tags = "php,html,css";
$arr  = explode(",", $tags);   // ["php","html","css"]

// Объединить массив в строку
echo implode(" | ", $arr);    // php | html | css
?&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Массивы</div>
        <div class="code">&lt;?php
// Обычный массив (индексы 0, 1, 2...)
$fruits = ["яблоко", "банан", "груша"];
echo $fruits[0];             // яблоко

// Добавить в конец
$fruits[] = "апельсин";      // $fruits теперь 4 элемента

// Перебор
foreach ($fruits as $fruit) {
    echo $fruit . "&lt;br&gt;";
}

// Ассоциативный массив (ключ => значение)
$user = [
    "name" => "Алекс",
    "age"  => 25,
    "city" => "Москва"
];

echo $user["name"];          // Алекс
echo $user["age"];           // 25

// Перебор ассоциативного
foreach ($user as $key => $value) {
    echo "$key: $value &lt;br&gt;";
}

// Полезные функции
count($fruits);              // 4 — количество элементов
in_array("банан", $fruits);  // true — есть ли элемент
array_push($fruits, "манго"); // добавить в конец
array_pop($fruits);          // удалить последний
sort($fruits);               // сортировать
?&gt;</div>
      </div>
    `
  },
  'php-control': {
    title: '🔀 Условия, циклы, функции в PHP',
    sub: 'PHP · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Условия</div>
        <div class="code">&lt;?php
$age = 20;

// if / elseif / else
if ($age >= 18) {
    echo "Взрослый";
} elseif ($age >= 14) {
    echo "Подросток";
} else {
    echo "Ребёнок";
}

// Тернарный оператор
$status = ($age >= 18) ? "взрослый" : "ребёнок";

// Switch
$day = "Понедельник";
switch ($day) {
    case "Суббота":
    case "Воскресенье":
        echo "Выходной!";
        break;
    default:
        echo "Рабочий день";
}

// Сравнения (ВАЖНО: == нестрогое, === строгое)
var_dump(0 == "0");      // true  — нестрогое!
var_dump(0 === "0");     // false — строгое (разные типы)
?&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Циклы</div>
        <div class="code">&lt;?php
// for — когда знаем количество итераций
for ($i = 0; $i &lt; 5; $i++) {
    echo $i . " ";      // 0 1 2 3 4
}

// while — пока условие верно
$count = 3;
while ($count > 0) {
    echo $count . " ";  // 3 2 1
    $count--;
}

// foreach — перебор массива (самый частый!)
$colors = ["red", "green", "blue"];
foreach ($colors as $index => $color) {
    echo "$index: $color &lt;br&gt;";
}
// 0: red
// 1: green
// 2: blue

// break — прервать, continue — пропустить итерацию
for ($i = 0; $i &lt; 10; $i++) {
    if ($i === 5) break;       // остановится на 5
    if ($i % 2 === 0) continue; // пропускает чётные
    echo $i . " ";              // 1 3
}
?&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Функции</div>
        <div class="code">&lt;?php
// Объявление функции
function greet($name) {
    return "Привет, $name!";
}

echo greet("Алекс");    // Привет, Алекс!

// Параметр по умолчанию
function greet2($name = "мир") {
    return "Привет, $name!";
}

echo greet2();           // Привет, мир!
echo greet2("PHP");      // Привет, PHP!

// Несколько параметров
function add($a, $b) {
    return $a + $b;
}

echo add(3, 5);          // 8

// Стрелочные функции (PHP 7.4+)
$double = fn($n) => $n * 2;
echo $double(5);         // 10

// Работа с глобальными переменными
$counter = 0;
function increment() {
    global $counter;     // нужно явно объявить
    $counter++;
}
increment();
echo $counter;           // 1
?&gt;</div>
      </div>
    `
  },
  'php-forms': {
    title: '📋 Обработка HTML-форм в PHP',
    sub: 'PHP · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Создаём форму в HTML</div>
        <div class="code">&lt;!-- form.html --&gt;
&lt;form action="process.php" method="POST"&gt;
    &lt;label&gt;Имя: &lt;input type="text" name="name"&gt;&lt;/label&gt;
    &lt;label&gt;Email: &lt;input type="email" name="email"&gt;&lt;/label&gt;
    &lt;label&gt;
      Страна:
      &lt;select name="country"&gt;
        &lt;option value="ru"&gt;Россия&lt;/option&gt;
        &lt;option value="ua"&gt;Украина&lt;/option&gt;
      &lt;/select&gt;
    &lt;/label&gt;
    &lt;button type="submit"&gt;Отправить&lt;/button&gt;
&lt;/form&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Принимаем данные в PHP (process.php)</div>
        <div class="code">&lt;?php
// $_POST — данные из формы с method="POST"
// $_GET  — данные из URL (?name=Алекс&age=25)

// Проверяем, что форма была отправлена
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Читаем поля
    $name    = $_POST["name"]    ?? "";
    $email   = $_POST["email"]   ?? "";
    $country = $_POST["country"] ?? "";

    // ВАЖНО! Всегда очищай данные от пользователя
    $name  = htmlspecialchars(trim($name));
    $email = htmlspecialchars(trim($email));

    // Валидация
    if (empty($name)) {
        echo "Ошибка: имя обязательно!";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Ошибка: неверный email!";
    } else {
        echo "Привет, $name! Письмо придёт на $email.";
    }
}
?&gt;</div>
        <div class="explain">
          <strong>htmlspecialchars()</strong> — защита от XSS атак. Превращает <code>&lt;script&gt;</code> в безопасный текст.<br>
          <strong>trim()</strong> — убирает пробелы по краям.<br>
          <strong>filter_var($email, FILTER_VALIDATE_EMAIL)</strong> — проверяет что это валидный email.<br>
          <strong>?? ""</strong> — оператор null-коалесценции. Если ключ не существует — подставит пустую строку.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> $_GET — данные в URL</div>
        <div class="code">&lt;?php
// URL: https://site.com/page.php?id=5&lang=ru

$id   = (int) ($_GET["id"]   ?? 0);   // (int) — приводим к числу
$lang = $_GET["lang"] ?? "ru";

echo "Страница #$id на языке $lang";
// Страница #5 на языке ru
?&gt;</div>
      </div>
    `
  },
  'php-files': {
    title: '🗄️ Файлы и MySQL в PHP',
    sub: 'PHP · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Работа с файлами</div>
        <div class="code">&lt;?php
// Читать файл целиком
$content = file_get_contents("data.txt");
echo $content;

// Записать в файл (перезаписывает)
file_put_contents("log.txt", "Новая запись\n");

// Добавить в конец файла
file_put_contents("log.txt", "Ещё строка\n", FILE_APPEND);

// Читать построчно
$lines = file("data.txt", FILE_IGNORE_NEW_LINES);
foreach ($lines as $line) {
    echo $line . "&lt;br&gt;";
}

// Проверить, существует ли файл
if (file_exists("data.txt")) {
    echo "Файл найден!";
}

// JSON — сохранить и загрузить
$data = ["name" => "Алекс", "age" => 25];
file_put_contents("user.json", json_encode($data));

$loaded = json_decode(file_get_contents("user.json"), true);
echo $loaded["name"];   // Алекс
?&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Подключение к MySQL (PDO)</div>
        <div class="code">&lt;?php
// PDO — современный способ работы с БД (безопасный)
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=mysite;charset=utf8",
        "root",          // логин MySQL
        "",              // пароль (пусто если XAMPP)
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "Подключено!";
} catch (PDOException $e) {
    die("Ошибка: " . $e->getMessage());
}

// SELECT — получить данные
$stmt = $pdo->query("SELECT * FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($users as $user) {
    echo $user["name"] . " — " . $user["email"] . "&lt;br&gt;";
}

// SELECT с параметром (защита от SQL-инъекций!)
$id = 5;
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
$stmt->execute([":id" => $id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
echo $user["name"];

// INSERT — добавить запись
$stmt = $pdo->prepare(
    "INSERT INTO users (name, email) VALUES (:name, :email)"
);
$stmt->execute([
    ":name"  => "Алекс",
    ":email" => "alex@mail.ru"
]);
echo "Пользователь добавлен! ID: " . $pdo->lastInsertId();
?&gt;</div>
        <div class="explain">
          <strong>PDO prepare() + execute()</strong> — всегда используй для данных от пользователя! Это защищает от SQL-инъекций. Никогда не подставляй переменные прямо в строку запроса.
        </div>
      </div>
    `
  },
  'php-oop': {
    title: '🧩 ООП: классы и объекты в PHP',
    sub: 'PHP · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Класс и объект</div>
        <div class="code">&lt;?php
class User {
    // Свойства (переменные класса)
    public string  $name;
    public int     $age;
    private string $password;

    // Конструктор — вызывается при создании объекта
    public function __construct(string $name, int $age, string $password) {
        $this->name     = $name;
        $this->age      = $age;
        $this->password = $password;
    }

    // Методы
    public function greet(): string {
        return "Привет, меня зовут {$this->name}!";
    }

    public function isAdult(): bool {
        return $this->age >= 18;
    }

    // Геттер для приватного поля
    public function getPasswordHash(): string {
        return md5($this->password);
    }
}

// Создаём объект
$user = new User("Алекс", 25, "secret123");

echo $user->name;            // Алекс
echo $user->greet();         // Привет, меня зовут Алекс!
echo $user->isAdult()        // true
    ? "Взрослый" : "Ребёнок";
echo $user->getPasswordHash(); // хэш пароля
?&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Наследование</div>
        <div class="code">&lt;?php
class Animal {
    public string $name;

    public function __construct(string $name) {
        $this->name = $name;
    }

    public function speak(): string {
        return "{$this->name} издаёт звук";
    }
}

// Dog наследует Animal
class Dog extends Animal {
    public string $breed;

    public function __construct(string $name, string $breed) {
        parent::__construct($name);   // вызов конструктора родителя
        $this->breed = $breed;
    }

    // Переопределяем метод
    public function speak(): string {
        return "{$this->name} говорит: Гав!";
    }

    public function info(): string {
        return "{$this->name} — порода {$this->breed}";
    }
}

$dog = new Dog("Рекс", "Лабрадор");
echo $dog->speak();  // Рекс говорит: Гав!
echo $dog->info();   // Рекс — порода Лабрадор
?&gt;</div>
      </div>
    `
  },

  // ==================== C++ ====================
  'cpp-intro': {
    title: '⚙️ Hello World и структура программы C++',
    sub: 'C++ · Уровень: Новичок',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Что такое C++ и зачем он нужен</div>
        <div class="explain">
          <strong>C++</strong> — один из самых быстрых языков программирования. Используется в: играх (Unreal Engine), операционных системах, браузерах (Chrome), встроенных системах, высоконагруженных серверах.<br><br>
          <strong>Чем отличается от Python/JS:</strong> C++ компилируется — исходный код превращается в машинные инструкции. Программа работает напрямую на процессоре, без интерпретатора. Отсюда скорость.<br><br>
          <strong>Компиляторы:</strong> g++ (Linux/Mac), MinGW (Windows), MSVC (Visual Studio). Онлайн: <strong>godbolt.org</strong> или <strong>replit.com</strong>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Первая программа</div>
        <div class="code">// Подключаем библиотеку для ввода/вывода
#include &lt;iostream&gt;
#include &lt;string&gt;

// using namespace std — чтобы не писать std:: везде
using namespace std;

// main() — точка входа, с неё начинается любая программа
int main() {
    // cout — вывод в консоль, endl — перенос строки
    cout &lt;&lt; "Hello, World!" &lt;&lt; endl;

    // Несколько значений через &lt;&lt;
    string name = "Алекс";
    int age = 25;
    cout &lt;&lt; "Привет, " &lt;&lt; name &lt;&lt; "! Тебе " &lt;&lt; age &lt;&lt; " лет." &lt;&lt; endl;

    // cin — ввод от пользователя
    string input;
    cout &lt;&lt; "Введи своё имя: ";
    cin &gt;&gt; input;
    cout &lt;&lt; "Привет, " &lt;&lt; input &lt;&lt; "!" &lt;&lt; endl;

    return 0;   // 0 = программа завершилась успешно
}
</div>
        <div class="live-example">
          <div class="live-example-header">💻 КАК СКОМПИЛИРОВАТЬ И ЗАПУСТИТЬ</div>
          <div class="live-example-body" style="flex-direction:column;align-items:flex-start;gap:4px;">
            <code style="background:#1e293b;color:#86efac;padding:6px 12px;border-radius:6px;font-size:13px;">g++ main.cpp -o main</code>
            <code style="background:#1e293b;color:#86efac;padding:6px 12px;border-radius:6px;font-size:13px;">./main</code>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">Первая команда — компилирует. Вторая — запускает.</div>
          </div>
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Структура файла C++</div>
        <div class="code">// 1. Директивы #include — подключение библиотек
#include &lt;iostream&gt;   // cin, cout
#include &lt;string&gt;     // тип string
#include &lt;vector&gt;     // динамический массив
#include &lt;algorithm&gt;  // sort, find и т.д.
#include &lt;cmath&gt;      // sqrt, pow, abs

// 2. using namespace (опционально, для удобства)
using namespace std;

// 3. Объявления функций (прототипы)
int add(int a, int b);

// 4. Функция main
int main() {
    cout &lt;&lt; add(3, 5) &lt;&lt; endl;  // 8
    return 0;
}

// 5. Определения функций
int add(int a, int b) {
    return a + b;
}
</div>
      </div>
    `
  },
  'cpp-vars': {
    title: '🔢 Переменные, типы, операторы в C++',
    sub: 'C++ · Уровень: Новичок',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Типы данных</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;string&gt;
using namespace std;

int main() {
    // Целые числа
    int    age    = 25;          // -2 млрд до +2 млрд
    long   big    = 9999999999L; // больше диапазон
    short  small  = 100;         // -32768 до +32767

    // Числа с плавающей точкой
    float  pi  = 3.14f;   // ~6 знаков точности (f обязателен)
    double dpi = 3.14159; // ~15 знаков — предпочтительнее

    // Символ и строка
    char   ch  = 'A';     // один символ, одинарные кавычки!
    string str = "Привет"; // строка, двойные кавычки

    // Логический тип
    bool isTrue  = true;
    bool isFalse = false;

    // auto — компилятор сам выведет тип (C++11)
    auto x = 42;      // int
    auto y = 3.14;    // double
    auto s = "text"s; // string (с суффиксом s)

    // Вывод размера типа
    cout &lt;&lt; "int занимает " &lt;&lt; sizeof(int) &lt;&lt; " байт" &lt;&lt; endl; // 4
    cout &lt;&lt; age &lt;&lt; " " &lt;&lt; pi &lt;&lt; " " &lt;&lt; str &lt;&lt; endl;

    return 0;
}
</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Операторы и математика</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;cmath&gt;
using namespace std;

int main() {
    int a = 10, b = 3;

    cout &lt;&lt; a + b  &lt;&lt; endl;   // 13 — сложение
    cout &lt;&lt; a - b  &lt;&lt; endl;   // 7  — вычитание
    cout &lt;&lt; a * b  &lt;&lt; endl;   // 30 — умножение
    cout &lt;&lt; a / b  &lt;&lt; endl;   // 3  — деление (целочисленное!)
    cout &lt;&lt; a % b  &lt;&lt; endl;   // 1  — остаток от деления

    // Чтобы получить 3.33 нужно float/double:
    cout &lt;&lt; (double)a / b &lt;&lt; endl;  // 3.33333

    // Инкремент / декремент
    a++;    // a = 11
    a--;    // a = 10
    ++a;    // то же, но возвращает новое значение

    // Составное присваивание
    a += 5;   // a = 15
    a -= 3;   // a = 12
    a *= 2;   // a = 24

    // Математика из &lt;cmath&gt;
    cout &lt;&lt; sqrt(16)    &lt;&lt; endl;  // 4   — корень
    cout &lt;&lt; pow(2, 10)  &lt;&lt; endl;  // 1024 — степень
    cout &lt;&lt; abs(-5)     &lt;&lt; endl;  // 5   — модуль
    cout &lt;&lt; round(3.7)  &lt;&lt; endl;  // 4   — округление
    cout &lt;&lt; floor(3.9)  &lt;&lt; endl;  // 3   — вниз
    cout &lt;&lt; ceil(3.1)   &lt;&lt; endl;  // 4   — вверх

    return 0;
}
</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Константы и const</div>
        <div class="code">#include &lt;iostream&gt;
using namespace std;

// Глобальная константа (старый способ)
#define PI 3.14159

// Лучший способ — constexpr или const
const     double G   = 9.81;     // ускорение свободного падения
constexpr int    MAX = 100;      // вычисляется на этапе компиляции

int main() {
    const int size = 5;   // нельзя изменить
    // size = 10;         // ОШИБКА компиляции!

    cout &lt;&lt; "PI = " &lt;&lt; PI &lt;&lt; endl;
    cout &lt;&lt; "g  = " &lt;&lt; G  &lt;&lt; endl;

    return 0;
}
</div>
      </div>
    `
  },
  'cpp-control': {
    title: '🔀 Условия, циклы, функции в C++',
    sub: 'C++ · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Условия</div>
        <div class="code">#include &lt;iostream&gt;
using namespace std;

int main() {
    int age = 20;

    // Обычное if/else if/else
    if (age >= 18) {
        cout &lt;&lt; "Взрослый" &lt;&lt; endl;
    } else if (age >= 14) {
        cout &lt;&lt; "Подросток" &lt;&lt; endl;
    } else {
        cout &lt;&lt; "Ребёнок" &lt;&lt; endl;
    }

    // Тернарный оператор
    string status = (age >= 18) ? "взрослый" : "ребёнок";
    cout &lt;&lt; status &lt;&lt; endl;

    // Switch (C++17: можно без break через [[fallthrough]])
    int day = 1;
    switch (day) {
        case 6:
        case 7:
            cout &lt;&lt; "Выходной!" &lt;&lt; endl;
            break;
        case 1:
            cout &lt;&lt; "Понедельник" &lt;&lt; endl;
            break;
        default:
            cout &lt;&lt; "Рабочий день" &lt;&lt; endl;
    }

    // Логические операторы
    bool a = true, b = false;
    cout &lt;&lt; (a && b)  &lt;&lt; endl;  // 0 (false) — И
    cout &lt;&lt; (a || b)  &lt;&lt; endl;  // 1 (true)  — ИЛИ
    cout &lt;&lt; (!a)      &lt;&lt; endl;  // 0 (false) — НЕ

    return 0;
}
</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Циклы</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;vector&gt;
using namespace std;

int main() {
    // for — классический
    for (int i = 0; i &lt; 5; i++) {
        cout &lt;&lt; i &lt;&lt; " ";   // 0 1 2 3 4
    }
    cout &lt;&lt; endl;

    // while
    int count = 3;
    while (count > 0) {
        cout &lt;&lt; count-- &lt;&lt; " ";  // 3 2 1
    }
    cout &lt;&lt; endl;

    // do-while — выполняется хотя бы раз
    int x = 0;
    do {
        cout &lt;&lt; "Выполнено!" &lt;&lt; endl;
        x++;
    } while (x &lt; 1);

    // range-based for (C++11) — для коллекций
    vector&lt;string&gt; fruits = {"яблоко", "банан", "груша"};
    for (const string& fruit : fruits) {
        cout &lt;&lt; fruit &lt;&lt; endl;
    }

    // break и continue
    for (int i = 0; i &lt; 10; i++) {
        if (i == 5) break;         // выход
        if (i % 2 == 0) continue;  // пропуск чётных
        cout &lt;&lt; i &lt;&lt; " ";         // 1 3
    }

    return 0;
}
</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Функции</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;string&gt;
using namespace std;

// Прототип функции (объявление до main)
int add(int a, int b);
string greet(const string& name);
void printLine(char ch = '-', int len = 30);  // параметры по умолчанию

int main() {
    cout &lt;&lt; add(3, 5)        &lt;&lt; endl;  // 8
    cout &lt;&lt; greet("Алекс")  &lt;&lt; endl;  // Привет, Алекс!
    printLine();                         // ------------------------------
    printLine('=', 20);                  // ====================

    // Лямбда-функция (C++11) — как стрелочная в JS
    auto square = [](int n) { return n * n; };
    cout &lt;&lt; square(5) &lt;&lt; endl;          // 25

    return 0;
}

int add(int a, int b) {
    return a + b;
}

string greet(const string& name) {      // & — передача по ссылке (без копии)
    return "Привет, " + name + "!";
}

void printLine(char ch, int len) {      // void — ничего не возвращает
    for (int i = 0; i &lt; len; i++) cout &lt;&lt; ch;
    cout &lt;&lt; endl;
}
</div>
      </div>
    `
  },
  'cpp-arrays': {
    title: '📊 Массивы и вектора в C++',
    sub: 'C++ · Уровень: Важно',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Статический массив</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;array&gt;     // std::array (C++11)
using namespace std;

int main() {
    // Обычный C-массив (фиксированный размер!)
    int nums[5] = {10, 20, 30, 40, 50};

    cout &lt;&lt; nums[0]   &lt;&lt; endl;  // 10
    cout &lt;&lt; nums[4]   &lt;&lt; endl;  // 50

    // Перебор
    for (int i = 0; i &lt; 5; i++) {
        cout &lt;&lt; nums[i] &lt;&lt; " ";   // 10 20 30 40 50
    }
    cout &lt;&lt; endl;

    // std::array — безопаснее (C++11)
    array&lt;int, 5&gt; arr = {1, 2, 3, 4, 5};
    cout &lt;&lt; arr.size()   &lt;&lt; endl;  // 5
    cout &lt;&lt; arr.at(2)    &lt;&lt; endl;  // 3 (с проверкой границ)
    cout &lt;&lt; arr.front()  &lt;&lt; endl;  // 1
    cout &lt;&lt; arr.back()   &lt;&lt; endl;  // 5

    // range-based for
    for (const int& n : arr) {
        cout &lt;&lt; n &lt;&lt; " ";
    }

    return 0;
}
</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Vector — динамический массив (самый частый!)</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;vector&gt;
#include &lt;algorithm&gt;
using namespace std;

int main() {
    // Создание
    vector&lt;int&gt; v = {3, 1, 4, 1, 5, 9};
    vector&lt;string&gt; words;   // пустой вектор

    // Добавить в конец
    v.push_back(2);
    words.push_back("hello");
    words.push_back("world");

    // Размер
    cout &lt;&lt; v.size() &lt;&lt; endl;    // 7

    // Доступ
    cout &lt;&lt; v[0]      &lt;&lt; endl;   // 3
    cout &lt;&lt; v.front() &lt;&lt; endl;   // 3
    cout &lt;&lt; v.back()  &lt;&lt; endl;   // 2

    // Удалить последний
    v.pop_back();

    // Перебор
    for (int n : v) cout &lt;&lt; n &lt;&lt; " ";
    cout &lt;&lt; endl;   // 3 1 4 1 5 9

    // Сортировка
    sort(v.begin(), v.end());
    for (int n : v) cout &lt;&lt; n &lt;&lt; " ";
    cout &lt;&lt; endl;   // 1 1 3 4 5 9

    // Поиск
    auto it = find(v.begin(), v.end(), 4);
    if (it != v.end()) {
        cout &lt;&lt; "Нашли 4 на позиции: " &lt;&lt; (it - v.begin()) &lt;&lt; endl;
    }

    // Очистить
    v.clear();
    cout &lt;&lt; v.empty() &lt;&lt; endl;   // 1 (true)

    return 0;
}
</div>
        <div class="explain">
          <strong>vector&lt;T&gt;</strong> — используй вместо C-массивов в 95% случаев.<br>
          <strong>push_back()</strong> — добавить. <strong>pop_back()</strong> — удалить последний.<br>
          <strong>sort(v.begin(), v.end())</strong> — сортировка из &lt;algorithm&gt;.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Двумерные массивы и строки</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;string&gt;
#include &lt;vector&gt;
using namespace std;

int main() {
    // 2D вектор (матрица)
    vector&lt;vector&lt;int&gt;&gt; matrix = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };

    cout &lt;&lt; matrix[1][2] &lt;&lt; endl;  // 6

    for (const auto& row : matrix) {
        for (int val : row) cout &lt;&lt; val &lt;&lt; " ";
        cout &lt;&lt; endl;
    }

    // Работа со строками (std::string)
    string s = "Hello, C++!";
    cout &lt;&lt; s.length()          &lt;&lt; endl;  // 11
    cout &lt;&lt; s.substr(7, 3)      &lt;&lt; endl;  // C++
    cout &lt;&lt; s.find("C++")       &lt;&lt; endl;  // 7
    s.replace(7, 3, "World");
    cout &lt;&lt; s                   &lt;&lt; endl;  // Hello, World!

    // Конвертация числа в строку и обратно
    int num = 42;
    string str = to_string(num);     // "42"
    int back = stoi(str);            // 42

    return 0;
}
</div>
      </div>
    `
  },
  'cpp-pointers': {
    title: '🧲 Указатели и память в C++',
    sub: 'C++ · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Указатели — что это такое</div>
        <div class="explain">
          <strong>Указатель</strong> — переменная, которая хранит адрес памяти другой переменной. Адреса выглядят как <code>0x7fff5fbff5ac</code>.<br><br>
          <strong>Зачем?</strong> Передача больших объектов в функцию без копирования, динамическое выделение памяти, работа со структурами данных (деревья, списки).
        </div>
        <div class="code">#include &lt;iostream&gt;
using namespace std;

int main() {
    int age = 25;

    int* ptr = &age;  // ptr хранит АДРЕС переменной age
    // &  — оператор взятия адреса
    // *  — оператор разыменования (получить значение по адресу)

    cout &lt;&lt; age       &lt;&lt; endl;  // 25       — значение
    cout &lt;&lt; &age      &lt;&lt; endl;  // 0x...    — адрес
    cout &lt;&lt; ptr       &lt;&lt; endl;  // 0x...    — тот же адрес
    cout &lt;&lt; *ptr      &lt;&lt; endl;  // 25       — значение по адресу

    // Изменить значение через указатель
    *ptr = 30;
    cout &lt;&lt; age &lt;&lt; endl;  // 30 — age изменился!

    // nullptr — нулевой указатель (ни на что не указывает)
    int* nullPtr = nullptr;
    if (nullPtr == nullptr) {
        cout &lt;&lt; "Указатель пустой" &lt;&lt; endl;
    }

    return 0;
}
</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Ссылки vs указатели</div>
        <div class="code">#include &lt;iostream&gt;
using namespace std;

// Передача по значению — создаётся копия
void addTen_val(int x) { x += 10; }

// Передача по ссылке — работаем с оригиналом
void addTen_ref(int& x) { x += 10; }

// Передача по указателю
void addTen_ptr(int* x) { *x += 10; }

int main() {
    int a = 5, b = 5, c = 5;

    addTen_val(a);  cout &lt;&lt; a &lt;&lt; endl;   // 5  — не изменился
    addTen_ref(b);  cout &lt;&lt; b &lt;&lt; endl;   // 15 — изменился!
    addTen_ptr(&c); cout &lt;&lt; c &lt;&lt; endl;   // 15 — изменился!

    // Ссылка — альтернативное имя переменной
    int x = 100;
    int& ref = x;   // ref это x (не копия!)
    ref = 200;
    cout &lt;&lt; x &lt;&lt; endl;  // 200

    return 0;
}
</div>
        <div class="explain">
          <strong>Ссылка (&)</strong> — безопаснее, проще. Не может быть nullptr. Используй в большинстве случаев.<br>
          <strong>Указатель (*)</strong> — мощнее, может быть nullptr, можно переназначить. Нужен для динамической памяти.
        </div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">3</span> Динамическая память (new/delete)</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;memory&gt;  // для unique_ptr
using namespace std;

int main() {
    // Ручное управление памятью (классика)
    int* p = new int(42);      // выделить память на куче
    cout &lt;&lt; *p &lt;&lt; endl;       // 42
    delete p;                  // ОБЯЗАТЕЛЬНО освободить!
    p = nullptr;               // хорошая практика

    // Массив в куче
    int* arr = new int[5]{1, 2, 3, 4, 5};
    cout &lt;&lt; arr[2] &lt;&lt; endl;    // 3
    delete[] arr;              // для массивов — delete[]!

    // Умные указатели (C++11) — освобождают память автоматически
    unique_ptr&lt;int&gt; smart = make_unique&lt;int&gt;(99);
    cout &lt;&lt; *smart &lt;&lt; endl;    // 99
    // delete не нужен! Освободится автоматически

    // shared_ptr — совместное владение
    auto sh1 = make_shared&lt;int&gt;(77);
    auto sh2 = sh1;  // теперь оба владеют
    cout &lt;&lt; *sh1 &lt;&lt; " " &lt;&lt; *sh2 &lt;&lt; endl;  // 77 77

    return 0;
}
</div>
      </div>
    `
  },
  'cpp-oop': {
    title: '🏛️ ООП: классы и наследование в C++',
    sub: 'C++ · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Класс и объект</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;string&gt;
using namespace std;

class Car {
private:
    // Закрытые поля — доступны только внутри класса
    string brand;
    int    year;
    double speed;

public:
    // Конструктор — вызывается при создании объекта
    Car(const string& brand, int year)
        : brand(brand), year(year), speed(0) {}   // список инициализации

    // Деструктор — вызывается при уничтожении
    ~Car() {
        cout &lt;&lt; brand &lt;&lt; " уничтожен" &lt;&lt; endl;
    }

    // Методы
    void accelerate(double delta) {
        speed += delta;
        cout &lt;&lt; brand &lt;&lt; ": скорость " &lt;&lt; speed &lt;&lt; " км/ч" &lt;&lt; endl;
    }

    void brake() {
        speed = max(0.0, speed - 20.0);
    }

    // Геттеры (const — не изменяет объект)
    string getBrand() const { return brand; }
    int    getYear()  const { return year;  }
    double getSpeed() const { return speed; }

    // Перегрузка оператора &lt;&lt; (для cout)
    friend ostream& operator&lt;&lt;(ostream& os, const Car& c) {
        os &lt;&lt; c.brand &lt;&lt; " (" &lt;&lt; c.year &lt;&lt; "), " &lt;&lt; c.speed &lt;&lt; " км/ч";
        return os;
    }
};

int main() {
    Car bmw("BMW", 2023);
    bmw.accelerate(60);    // BMW: скорость 60 км/ч
    bmw.accelerate(40);    // BMW: скорость 100 км/ч
    bmw.brake();
    cout &lt;&lt; bmw &lt;&lt; endl;  // BMW (2023), 80 км/ч

    return 0;
}   // здесь вызовется деструктор
</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Наследование и полиморфизм</div>
        <div class="code">#include &lt;iostream&gt;
#include &lt;string&gt;
#include &lt;vector&gt;
#include &lt;memory&gt;
using namespace std;

// Базовый класс
class Animal {
protected:
    string name;
    int    age;

public:
    Animal(const string& name, int age) : name(name), age(age) {}

    // virtual — позволяет переопределить в дочернем классе
    virtual string sound() const = 0;   // = 0 — чисто виртуальный (абстрактный)

    virtual string describe() const {
        return name + " (" + to_string(age) + " лет)";
    }

    virtual ~Animal() = default;         // виртуальный деструктор — важно!
};

class Dog : public Animal {
    string breed;
public:
    Dog(const string& name, int age, const string& breed)
        : Animal(name, age), breed(breed) {}

    string sound() const override {     // override — явно указываем переопределение
        return name + " говорит: ГАВ!";
    }

    string describe() const override {
        return Animal::describe() + ", порода: " + breed;
    }
};

class Cat : public Animal {
public:
    Cat(const string& name, int age) : Animal(name, age) {}

    string sound() const override {
        return name + " говорит: МЯУ~";
    }
};

int main() {
    // Полиморфизм — вектор базового класса
    vector&lt;unique_ptr&lt;Animal&gt;&gt; animals;
    animals.push_back(make_unique&lt;Dog&gt;("Рекс", 3, "Лабрадор"));
    animals.push_back(make_unique&lt;Cat&gt;("Мурка", 5));
    animals.push_back(make_unique&lt;Dog&gt;("Бобик", 2, "Хаски"));

    for (const auto& a : animals) {
        cout &lt;&lt; a->describe() &lt;&lt; endl;
        cout &lt;&lt; a->sound()    &lt;&lt; endl;
        cout &lt;&lt; "---"         &lt;&lt; endl;
    }

    return 0;
}
</div>
        <div class="explain">
          <strong>virtual</strong> — делает метод переопределяемым в дочерних классах.<br>
          <strong>= 0</strong> — абстрактный метод. Класс с ним нельзя создать напрямую — нужно наследовать.<br>
          <strong>override</strong> — явно показывает что метод переопределён. Компилятор проверит правильность.<br>
          <strong>Полиморфизм</strong> — один вызов a->sound() вызывает разный код в зависимости от типа объекта.
        </div>
      </div>
    `
  },

  'html-seo': {
    title: '📈 HTML и SEO',
    sub: 'HTML · Уровень: PRO',
    content: `
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">1</span> Мета-теги</div>
        <div class="code">&lt;head&gt;
  &lt;title&gt;Купить кроссовки — Магазин Nike | Москва&lt;/title&gt;
  &lt;meta name="description" content="Большой выбор кроссовок Nike. Доставка по России."&gt;

  &lt;!-- Open Graph — как ссылка выглядит в соцсетях --&gt;
  &lt;meta property="og:title" content="Магазин Nike"&gt;
  &lt;meta property="og:description" content="Кроссовки с доставкой"&gt;
  &lt;meta property="og:image" content="https://site.com/preview.jpg"&gt;
  &lt;meta property="og:url" content="https://site.com"&gt;
&lt;/head&gt;</div>
      </div>
      <div class="guide-step">
        <div class="guide-step-title"><span class="step-num">2</span> Структура для поисковиков</div>
        <div class="code">&lt;!-- Один h1 на страницу — главная тема страницы --&gt;
&lt;h1&gt;Купить кроссовки Nike в Москве&lt;/h1&gt;

&lt;!-- alt у картинок — поисковик не видит изображения! --&gt;
&lt;img src="shoe.jpg" alt="Кроссовки Nike Air Max белые мужские"&gt;

&lt;!-- Ссылки с понятным текстом --&gt;
&lt;!-- ❌ --&gt; &lt;a href="/product"&gt;Нажмите здесь&lt;/a&gt;
&lt;!-- ✅ --&gt; &lt;a href="/product"&gt;Nike Air Max 270&lt;/a&gt;</div>
      </div>
    `
  }
};

function openGuide(id) {
  const data = guideData[id];
  if (!data) return;
  document.getElementById('guideModalBody').innerHTML = `
    <div class="modal-title">${data.title}</div>
    <div class="modal-subtitle">${data.sub}</div>
    ${data.content}
  `;
  document.getElementById('guideModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGuide() {
  document.getElementById('guideModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeGuideIfOverlay(e) {
  if (e.target === document.getElementById('guideModal')) closeGuide();
}

// ===== PLAYGROUND =====
const PG_TEMPLATES = {
  blank: { html: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Моя страница</title>\n</head>\n<body>\n  <h1>Привет!</h1>\n  <p>Начни писать HTML...</p>\n</body>\n</html>', css: 'body {\n  font-family: sans-serif;\n  padding: 20px;\n}', js: '' },
  card: {
    html: '<div class="card">\n  <div class="card-icon">🚀</div>\n  <h2>Заголовок</h2>\n  <p>Описание карточки с красивым дизайном.</p>\n  <button>Подробнее</button>\n</div>',
    css: `body { display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f8f9fb; font-family:sans-serif; }
.card { background:#fff; border-radius:16px; padding:28px; box-shadow:0 4px 24px rgba(0,0,0,.1); text-align:center; max-width:280px; }
.card-icon { font-size:48px; margin-bottom:12px; }
h2 { margin:0 0 8px; color:#111; }
p { color:#6b7280; margin:0 0 18px; line-height:1.6; }
button { background:#6366f1; color:#fff; border:none; border-radius:8px; padding:10px 22px; font-size:14px; cursor:pointer; transition:all .2s; }
button:hover { background:#4f46e5; transform:translateY(-1px); }`,
    js: ''
  },
  flexbox: {
    html: '<div class="container">\n  <div class="box">1</div>\n  <div class="box">2</div>\n  <div class="box">3</div>\n  <div class="box">4</div>\n  <div class="box">5</div>\n</div>',
    css: `body { margin:0; padding:20px; font-family:sans-serif; background:#f1f5f9; }
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.box {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 20px; font-weight: 700;
  transition: transform .2s;
  cursor: pointer;
}
.box:hover { transform: scale(1.1) rotate(5deg); }`,
    js: ''
  },
  animation: {
    html: '<div class="scene">\n  <div class="ball"></div>\n  <div class="shadow"></div>\n</div>',
    css: `body { margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#1e1b4b; }
.scene { position:relative; text-align:center; }
.ball {
  width:60px; height:60px;
  background:radial-gradient(circle at 35% 35%, #a78bfa, #6366f1);
  border-radius:50%;
  animation: bounce 0.8s cubic-bezier(.36,.07,.19,.97) infinite alternate;
  margin:0 auto;
}
.shadow {
  width:60px; height:12px;
  background:rgba(0,0,0,.4);
  border-radius:50%;
  margin:4px auto 0;
  animation: shadow 0.8s ease infinite alternate;
}
@keyframes bounce {
  from { transform: translateY(0); }
  to   { transform: translateY(-80px); }
}
@keyframes shadow {
  from { transform: scaleX(1); opacity:.4; }
  to   { transform: scaleX(0.4); opacity:.1; }
}`,
    js: ''
  },
  form: {
    html: `<form class="form-wrap" onsubmit="register(event)">
  <h2>Регистрация</h2>
  <div class="field">
    <label for="name">Имя</label>
    <input type="text" id="name" name="name" placeholder="Введи имя" required>
  </div>
  <div class="field">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" placeholder="you@example.com" required>
  </div>
  <div class="field">
    <label for="password">Пароль</label>
    <input type="password" id="password" name="password" placeholder="Минимум 8 символов" minlength="8" required>
  </div>
  <button type="submit">Зарегистрироваться</button>
  <div id="msg"></div>
</form>`,
    css: `body { margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f1f5f9; font-family:sans-serif; }
.form-wrap { background:#fff; border-radius:16px; padding:32px; width:320px; box-shadow:0 4px 24px rgba(0,0,0,.08); }
h2 { margin:0 0 24px; color:#111; font-size:20px; }
.field { margin-bottom:16px; }
label { display:block; font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
input { width:100%; padding:10px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; transition:border .2s; }
input:focus { border-color:#6366f1; }
button { width:100%; padding:12px; background:#6366f1; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; margin-top:8px; }
button:hover { background:#4f46e5; }
#msg { margin-top:12px; font-size:13px; text-align:center; }`,
    js: `function register(event) {
  event.preventDefault();   // не перезагружать страницу
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');
  if (!name || !email) {
    msg.style.color = '#dc2626';
    msg.textContent = '⚠️ Заполни все поля!';
    return;
  }
  msg.style.color = '#16a34a';
  msg.textContent = '✅ Добро пожаловать, ' + name + '!';
}`
  },
  counter: {
    html: `<div class="counter-app">
  <h2>Счётчик</h2>
  <div class="display" id="count">0</div>
  <div class="btns">
    <button onclick="change(-1)">−</button>
    <button onclick="reset()">Сброс</button>
    <button onclick="change(1)">+</button>
  </div>
</div>`,
    css: `body { margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#0f172a; font-family:sans-serif; }
.counter-app { text-align:center; color:#fff; }
h2 { font-size:18px; color:#94a3b8; margin:0 0 20px; text-transform:uppercase; letter-spacing:2px; }
.display { font-size:96px; font-weight:800; line-height:1; margin-bottom:24px; transition:transform .1s; }
.display.bump { transform:scale(1.15); }
.btns { display:flex; gap:12px; justify-content:center; }
button { width:64px; height:64px; border-radius:50%; border:none; font-size:28px; font-weight:700; cursor:pointer; transition:all .15s; }
button:nth-child(1) { background:#dc2626; color:#fff; }
button:nth-child(2) { background:#374151; color:#94a3b8; font-size:12px; }
button:nth-child(3) { background:#16a34a; color:#fff; }
button:hover { transform:scale(1.1); }`,
    js: `let n = 0;
function change(delta) {
  n += delta;
  const el = document.getElementById('count');
  el.textContent = n;
  el.style.color = n > 0 ? '#86efac' : n < 0 ? '#f87171' : '#fff';
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}
function reset() { n = 0; const el = document.getElementById('count'); el.textContent = 0; el.style.color = '#fff'; }`
  },

  todo: {
    html: `<div class="todo-app">
  <h2>📝 Список задач</h2>
  <div class="input-row">
    <input id="todo-input" type="text" placeholder="Новая задача..." onkeydown="if(event.key==='Enter')addTodo()">
    <button onclick="addTodo()">+</button>
  </div>
  <ul id="todo-list"></ul>
  <div id="todo-empty" class="empty">Пока задач нет. Добавь первую! 🎉</div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#667eea,#764ba2); font-family:sans-serif; padding:20px; }
.todo-app { background:#fff; border-radius:20px; padding:32px; width:100%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,.25); }
h2 { margin-bottom:24px; font-size:22px; color:#1a1a2e; }
.input-row { display:flex; gap:10px; margin-bottom:20px; }
input { flex:1; padding:12px 16px; border:2px solid #e5e7eb; border-radius:10px; font-size:14px; outline:none; transition:border .2s; font-family:inherit; }
input:focus { border-color:#667eea; }
.input-row button { width:46px; height:46px; background:#667eea; color:#fff; border:none; border-radius:10px; font-size:24px; cursor:pointer; transition:all .15s; flex-shrink:0; }
.input-row button:hover { background:#5a67d8; transform:scale(1.05); }
ul { list-style:none; display:flex; flex-direction:column; gap:8px; }
li { display:flex; align-items:center; gap:12px; padding:12px 14px; border:1.5px solid #e5e7eb; border-radius:10px; font-size:14px; color:#374151; cursor:pointer; transition:all .2s; animation:slideIn .2s ease; }
li:hover { background:#f9fafb; border-color:#d1d5db; }
li.done { text-decoration:line-through; opacity:.45; }
li .check { font-size:18px; flex-shrink:0; }
li span { flex:1; }
li .del { background:none; border:none; cursor:pointer; color:#d1d5db; font-size:16px; padding:2px 6px; border-radius:6px; transition:all .15s; }
li .del:hover { color:#dc2626; background:#fee2e2; }
.empty { text-align:center; color:#9ca3af; font-size:13px; margin-top:16px; display:none; }
@keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }`,
    js: `function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  const li = document.createElement('li');
  li.innerHTML = '<span class="check">⬜</span><span>' + text + '</span><button class="del" onclick="event.stopPropagation();this.parentNode.remove();checkEmpty()">✕</button>';
  li.onclick = function() {
    this.classList.toggle('done');
    this.querySelector('.check').textContent = this.classList.contains('done') ? '✅' : '⬜';
  };
  document.getElementById('todo-list').appendChild(li);
  input.value = '';
  checkEmpty();
}
function checkEmpty() {
  const empty = document.getElementById('todo-empty');
  empty.style.display = document.querySelectorAll('#todo-list li').length === 0 ? 'block' : 'none';
}
checkEmpty();`
  },

  accordion: {
    html: `<div class="faq-wrap">
  <h2>Частые вопросы</h2>
  <div class="item">
    <div class="q" onclick="toggle(this)">Что такое HTML? <span class="arrow">▼</span></div>
    <div class="a">HTML (HyperText Markup Language) — язык разметки, основа каждой веб-страницы. Он описывает структуру контента: заголовки, параграфы, ссылки, изображения.</div>
  </div>
  <div class="item">
    <div class="q" onclick="toggle(this)">Чем CSS отличается от HTML? <span class="arrow">▼</span></div>
    <div class="a">HTML отвечает за структуру, а CSS — за внешний вид: цвета, шрифты, отступы, анимации. Без CSS страница выглядит как обычный текст.</div>
  </div>
  <div class="item">
    <div class="q" onclick="toggle(this)">Зачем нужен JavaScript? <span class="arrow">▼</span></div>
    <div class="a">JavaScript добавляет интерактивность: реакция на клики, валидация форм, анимации, запросы к серверу. Это единственный язык программирования, который понимает браузер.</div>
  </div>
  <div class="item">
    <div class="q" onclick="toggle(this)">Что учить после HTML/CSS/JS? <span class="arrow">▼</span></div>
    <div class="a">После основ рекомендуется изучить фреймворк React или Vue, систему контроля версий Git, и основы работы с API (fetch, REST). Также полезен TypeScript.</div>
  </div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f1f5f9; font-family:sans-serif; padding:24px; }
.faq-wrap { width:100%; max-width:560px; }
h2 { font-size:22px; color:#1a1a2e; margin-bottom:20px; text-align:center; }
.item { background:#fff; border-radius:12px; margin-bottom:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.q { padding:18px 20px; font-size:15px; font-weight:600; color:#111827; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:12px; transition:background .15s; user-select:none; }
.q:hover { background:#f9fafb; }
.q.open { color:#6366f1; }
.arrow { transition:transform .25s; color:#9ca3af; font-size:12px; flex-shrink:0; }
.q.open .arrow { transform:rotate(180deg); color:#6366f1; }
.a { max-height:0; overflow:hidden; transition:max-height .3s ease, padding .3s; font-size:14px; color:#6b7280; line-height:1.7; padding:0 20px; background:#fafafa; border-top:1px solid transparent; }
.a.open { max-height:200px; padding:14px 20px; border-top-color:#e5e7eb; }`,
    js: `function toggle(qEl) {
  const a = qEl.nextElementSibling;
  const isOpen = a.classList.contains('open');
  // Закрыть все
  document.querySelectorAll('.q').forEach(q => { q.classList.remove('open'); q.nextElementSibling.classList.remove('open'); });
  if (!isOpen) { qEl.classList.add('open'); a.classList.add('open'); }
}`
  },

  skills: {
    html: `<div class="skills-wrap">
  <h2>💻 Мои навыки</h2>
  <div class="skill"><div class="skill-head"><span>HTML</span><span class="pct">90%</span></div><div class="bar"><div class="fill" data-w="90" style="background:#f97316"></div></div></div>
  <div class="skill"><div class="skill-head"><span>CSS</span><span class="pct">80%</span></div><div class="bar"><div class="fill" data-w="80" style="background:#3b82f6"></div></div></div>
  <div class="skill"><div class="skill-head"><span>JavaScript</span><span class="pct">70%</span></div><div class="bar"><div class="fill" data-w="70" style="background:#eab308"></div></div></div>
  <div class="skill"><div class="skill-head"><span>React</span><span class="pct">55%</span></div><div class="bar"><div class="fill" data-w="55" style="background:#06b6d4"></div></div></div>
  <div class="skill"><div class="skill-head"><span>Git</span><span class="pct">65%</span></div><div class="bar"><div class="fill" data-w="65" style="background:#22c55e"></div></div></div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; font-family:sans-serif; padding:24px; }
.skills-wrap { width:100%; max-width:480px; }
h2 { font-size:22px; color:#f1f5f9; margin-bottom:28px; }
.skill { margin-bottom:20px; }
.skill-head { display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; font-weight:600; color:#cbd5e1; }
.pct { color:#94a3b8; }
.bar { background:#1e293b; border-radius:99px; height:10px; overflow:hidden; }
.fill { height:100%; border-radius:99px; width:0%; transition:width 1.2s cubic-bezier(.25,.8,.25,1); }`,
    js: `window.addEventListener('load', () => {
  document.querySelectorAll('.fill').forEach(el => {
    setTimeout(() => { el.style.width = el.dataset.w + '%'; }, 200);
  });
});`
  },

  typewriter: {
    html: `<div class="tw-scene">
  <p class="label">Я умею создавать</p>
  <div class="tw-line">
    <span id="tw-text"></span><span class="cursor">|</span>
  </div>
  <button onclick="restart()">↺ Заново</button>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; font-family:'Segoe UI',sans-serif; padding:24px; }
.tw-scene { text-align:center; }
.label { font-size:16px; color:#64748b; margin-bottom:12px; text-transform:uppercase; letter-spacing:2px; }
.tw-line { font-size:36px; font-weight:800; min-height:52px; display:flex; align-items:center; justify-content:center; gap:2px; }
#tw-text { background:linear-gradient(135deg,#6366f1,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.cursor { color:#6366f1; animation:blink .7s infinite; font-weight:300; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
button { margin-top:32px; padding:10px 24px; background:transparent; border:1.5px solid #334155; color:#64748b; border-radius:8px; font-size:13px; cursor:pointer; transition:all .2s; font-family:inherit; }
button:hover { border-color:#6366f1; color:#818cf8; }`,
    js: `const words = ['сайты 🌐','анимации ✨','формы 📋','игры 🎮','приложения 🚀','интерфейсы 🎨'];
let wi = 0, ci = 0, deleting = false;
function type() {
  const word = words[wi];
  const el = document.getElementById('tw-text');
  if (!deleting) {
    el.textContent = word.slice(0, ++ci);
    if (ci === word.length) { deleting = true; setTimeout(type, 1600); return; }
    setTimeout(type, 80);
  } else {
    el.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 300); return; }
    setTimeout(type, 45);
  }
}
function restart() { wi = 0; ci = 0; deleting = false; document.getElementById('tw-text').textContent = ''; type(); }
type();`
  },

  darkswitch: {
    html: `<div class="page" id="page">
  <nav>
    <span class="logo">✦ MyBrand</span>
    <button id="theme-btn" onclick="toggleTheme()"><iconify-icon icon="tabler:moon-stars" width="14" height="14" style="vertical-align:middle"></iconify-icon> Тёмная</button>
  </nav>
  <main>
    <h1>Переключатель темы</h1>
    <p>Нажми кнопку в правом верхнем углу, чтобы переключить тему. Это часто встречается в реальных сайтах!</p>
    <div class="cards">
      <div class="card">🎨<h3>Дизайн</h3><p>Красивые интерфейсы</p></div>
      <div class="card">⚡<h3>Скорость</h3><p>Быстрая загрузка</p></div>
      <div class="card">📱<h3>Адаптив</h3><p>На любом экране</p></div>
    </div>
  </main>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; transition:background .3s,color .3s,border-color .3s; }
body { font-family:sans-serif; }
.page { min-height:100vh; background:#f8f9fb; color:#1a1a2e; }
.page.dark { background:#0f1117; color:#e2e8f0; }
nav { display:flex; justify-content:space-between; align-items:center; padding:16px 28px; border-bottom:1px solid #e5e7eb; }
.page.dark nav { border-bottom-color:#1e2536; }
.logo { font-size:18px; font-weight:700; color:#6366f1; }
button { padding:8px 16px; border-radius:8px; border:1.5px solid #e5e7eb; background:#fff; color:#374151; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
.page.dark button { background:#1a1f2e; border-color:#2d3348; color:#94a3b8; }
button:hover { border-color:#6366f1; color:#6366f1; }
main { max-width:680px; margin:0 auto; padding:48px 24px; text-align:center; }
h1 { font-size:28px; margin-bottom:16px; }
p { color:#6b7280; font-size:15px; line-height:1.7; margin-bottom:36px; }
.page.dark p { color:#94a3b8; }
.cards { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
.card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:24px 20px; width:160px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.page.dark .card { background:#1a1f2e; border-color:#2d3348; }
.card > *:first-child { font-size:32px; display:block; margin-bottom:10px; }
.card h3 { font-size:14px; margin-bottom:6px; }
.card p { font-size:12px; margin:0; }`,
    js: `function toggleTheme() {
  const page = document.getElementById('page');
  const btn = document.getElementById('theme-btn');
  const isDark = page.classList.toggle('dark');
  btn.textContent = isDark ? '<iconify-icon icon="tabler:sun" width="14" height="14" style="vertical-align:middle"></iconify-icon> Светлая' : '<iconify-icon icon="tabler:moon-stars" width="14" height="14" style="vertical-align:middle"></iconify-icon> Тёмная';
}`
  },

  modal: {
    html: `<div class="page">
  <h1>Галерея проектов</h1>
  <p>Нажми на карточку, чтобы узнать больше</p>
  <div class="cards">
    <div class="card" onclick="openModal('Проект Alpha','Лендинг для стартапа — адаптивная вёрстка, анимации, форма заявки.','🚀')">
      <div class="card-icon">🚀</div><h3>Проект Alpha</h3><p>Лендинг</p>
    </div>
    <div class="card" onclick="openModal('Проект Beta','Интернет-магазин с корзиной, фильтрами и оплатой онлайн.','🛒')">
      <div class="card-icon">🛒</div><h3>Проект Beta</h3><p>Магазин</p>
    </div>
    <div class="card" onclick="openModal('Проект Gamma','Дашборд аналитики с графиками, таблицами и фильтрами.','📊')">
      <div class="card-icon">📊</div><h3>Проект Gamma</h3><p>Дашборд</p>
    </div>
  </div>
</div>

<div class="overlay" id="overlay" onclick="closeModal()">
  <div class="modal" id="modal" onclick="event.stopPropagation()">
    <button class="close" onclick="closeModal()">✕</button>
    <div class="modal-icon" id="modal-icon"></div>
    <h2 id="modal-title"></h2>
    <p id="modal-desc"></p>
    <div class="modal-btns">
      <button class="btn-primary" onclick="closeModal()">Открыть проект →</button>
      <button class="btn-secondary" onclick="closeModal()">Закрыть</button>
    </div>
  </div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:#f1f5f9; min-height:100vh; padding:40px 24px; }
.page { max-width:680px; margin:0 auto; text-align:center; }
h1 { font-size:28px; color:#1a1a2e; margin-bottom:8px; }
.page > p { color:#9ca3af; font-size:14px; margin-bottom:36px; }
.cards { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
.card { background:#fff; border:1.5px solid #e5e7eb; border-radius:16px; padding:28px 24px; width:180px; cursor:pointer; transition:all .2s; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.card:hover { border-color:#6366f1; transform:translateY(-4px); box-shadow:0 8px 24px rgba(99,102,241,.15); }
.card-icon { font-size:36px; margin-bottom:12px; }
.card h3 { font-size:15px; color:#111827; margin-bottom:4px; }
.card p { font-size:12px; color:#9ca3af; }
.overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:none; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); }
.overlay.open { display:flex; animation:fadeIn .2s; }
.modal { background:#fff; border-radius:20px; padding:36px; max-width:400px; width:100%; position:relative; animation:slideUp .25s ease; }
.close { position:absolute; top:14px; right:14px; background:#f3f4f6; border:none; border-radius:50%; width:32px; height:32px; font-size:16px; cursor:pointer; color:#6b7280; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.close:hover { background:#e5e7eb; color:#111; }
.modal-icon { font-size:48px; text-align:center; margin-bottom:16px; }
h2 { font-size:20px; text-align:center; margin-bottom:12px; color:#111827; }
.modal p { font-size:14px; color:#6b7280; line-height:1.7; text-align:center; margin-bottom:24px; }
.modal-btns { display:flex; gap:10px; }
.btn-primary { flex:1; padding:12px; background:#6366f1; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:background .15s; font-family:inherit; }
.btn-primary:hover { background:#4f46e5; }
.btn-secondary { flex:1; padding:12px; background:#f3f4f6; color:#374151; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; }
.btn-secondary:hover { background:#e5e7eb; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`,
    js: `function openModal(title, desc, icon) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-desc').textContent = desc;
  document.getElementById('modal-icon').textContent = icon;
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });`
  },

  navbar: {
    html: `<div id="page">
  <nav id="navbar">
    <div class="nav-logo">✦ DevBrand</div>
    <ul class="nav-links" id="navLinks">
      <li><a href="#" class="active">Главная</a></li>
      <li><a href="#">Портфолио</a></li>
      <li><a href="#">Услуги</a></li>
      <li><a href="#">Контакты</a></li>
    </ul>
    <button class="nav-cta">Связаться</button>
    <button class="burger" id="burger" onclick="toggleMenu()">☰</button>
  </nav>
  <main>
    <h1>Адаптивный навбар</h1>
    <p>Измени ширину окна — меню превратится в бургер. Навбар становится тёмным при скролле вниз.</p>
    <div style="height:600px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;">↓ Прокрути вниз, чтобы увидеть эффект</div>
  </main>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; }
#page { min-height:150vh; }
nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; gap:24px; padding:16px 32px; background:transparent; transition:all .3s; }
nav.scrolled { background:#fff; box-shadow:0 2px 16px rgba(0,0,0,.08); }
.nav-logo { font-size:20px; font-weight:800; color:#6366f1; margin-right:auto; }
.nav-links { display:flex; gap:4px; list-style:none; }
.nav-links a { text-decoration:none; padding:8px 16px; border-radius:8px; font-size:14px; font-weight:500; color:#374151; transition:all .15s; }
.nav-links a:hover, .nav-links a.active { background:#f0f0ff; color:#6366f1; }
.nav-cta { padding:9px 20px; background:#6366f1; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s; font-family:inherit; }
.nav-cta:hover { background:#4f46e5; }
.burger { display:none; background:none; border:1.5px solid #e5e7eb; border-radius:8px; padding:6px 12px; font-size:18px; cursor:pointer; }
main { padding:120px 32px 60px; max-width:720px; margin:0 auto; }
h1 { font-size:32px; color:#1a1a2e; margin-bottom:16px; }
p { color:#6b7280; font-size:15px; line-height:1.7; }
@media (max-width:600px) {
  .burger { display:block; }
  .nav-links, .nav-cta { display:none; }
  .nav-links.open { display:flex; flex-direction:column; position:fixed; top:60px; left:0; right:0; background:#fff; padding:20px 24px; box-shadow:0 8px 20px rgba(0,0,0,.1); gap:8px; }
  nav { padding:14px 20px; background:#fff; }
}`,
    js: `window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
});
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}`
  },

  pricing: {
    html: `<div class="pricing-page">
  <h1>Выбери план</h1>
  <p class="sub">Без скрытых платежей. Отменить можно в любой момент.</p>
  <div class="toggle-row">
    <span>Ежемесячно</span>
    <button class="toggle" id="billing" onclick="switchBilling()"></button>
    <span>Ежегодно <span class="save-badge">−20%</span></span>
  </div>
  <div class="plans">
    <div class="plan">
      <div class="plan-name">Старт</div>
      <div class="plan-price"><span class="currency">₽</span><span class="amount" data-mo="990" data-yr="792">990</span><span class="per">/мес</span></div>
      <ul class="features">
        <li>✓ 3 проекта</li><li>✓ 1 ГБ хранилища</li><li>✓ Базовая поддержка</li><li class="no">✗ API доступ</li><li class="no">✗ Командная работа</li>
      </ul>
      <button class="plan-btn outline">Начать бесплатно</button>
    </div>
    <div class="plan featured">
      <div class="popular-badge">Популярный</div>
      <div class="plan-name">Про</div>
      <div class="plan-price"><span class="currency">₽</span><span class="amount" data-mo="2490" data-yr="1992">2490</span><span class="per">/мес</span></div>
      <ul class="features">
        <li>✓ Безлимит проектов</li><li>✓ 50 ГБ хранилища</li><li>✓ Приоритетная поддержка</li><li>✓ API доступ</li><li class="no">✗ Командная работа</li>
      </ul>
      <button class="plan-btn primary">Попробовать 14 дней</button>
    </div>
    <div class="plan">
      <div class="plan-name">Команда</div>
      <div class="plan-price"><span class="currency">₽</span><span class="amount" data-mo="5990" data-yr="4792">5990</span><span class="per">/мес</span></div>
      <ul class="features">
        <li>✓ Безлимит проектов</li><li>✓ 500 ГБ хранилища</li><li>✓ 24/7 поддержка</li><li>✓ API доступ</li><li>✓ До 25 участников</li>
      </ul>
      <button class="plan-btn outline">Связаться с нами</button>
    </div>
  </div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:#f8f9fb; min-height:100vh; padding:48px 20px; }
.pricing-page { max-width:900px; margin:0 auto; text-align:center; }
h1 { font-size:36px; font-weight:800; color:#111827; margin-bottom:10px; }
.sub { color:#9ca3af; font-size:15px; margin-bottom:28px; }
.toggle-row { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:40px; font-size:14px; color:#6b7280; font-weight:500; }
.save-badge { background:#dcfce7; color:#16a34a; font-size:11px; font-weight:700; padding:2px 7px; border-radius:99px; margin-left:4px; }
.toggle { width:46px; height:26px; border-radius:99px; background:#d1d5db; border:none; cursor:pointer; position:relative; transition:background .25s; }
.toggle.on { background:#6366f1; }
.toggle::after { content:''; position:absolute; width:20px; height:20px; border-radius:50%; background:#fff; top:3px; left:3px; transition:transform .25s; box-shadow:0 1px 4px rgba(0,0,0,.2); }
.toggle.on::after { transform:translateX(20px); }
.plans { display:flex; gap:20px; justify-content:center; flex-wrap:wrap; }
.plan { background:#fff; border:2px solid #e5e7eb; border-radius:20px; padding:32px 28px; width:260px; text-align:left; position:relative; transition:all .2s; }
.plan:hover { box-shadow:0 8px 30px rgba(0,0,0,.08); transform:translateY(-2px); }
.plan.featured { border-color:#6366f1; box-shadow:0 8px 30px rgba(99,102,241,.15); }
.popular-badge { position:absolute; top:-13px; left:50%; transform:translateX(-50%); background:#6366f1; color:#fff; font-size:11px; font-weight:700; padding:4px 14px; border-radius:99px; white-space:nowrap; }
.plan-name { font-size:16px; font-weight:700; color:#374151; margin-bottom:14px; }
.plan-price { display:flex; align-items:flex-end; gap:2px; margin-bottom:24px; }
.currency { font-size:18px; color:#6b7280; margin-bottom:6px; }
.amount { font-size:40px; font-weight:800; color:#111827; transition:all .3s; }
.per { font-size:14px; color:#9ca3af; margin-bottom:8px; margin-left:2px; }
.features { list-style:none; display:flex; flex-direction:column; gap:10px; margin-bottom:28px; font-size:13px; color:#374151; }
.features .no { color:#d1d5db; }
.plan-btn { width:100%; padding:13px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
.plan-btn.primary { background:#6366f1; color:#fff; border:none; }
.plan-btn.primary:hover { background:#4f46e5; }
.plan-btn.outline { background:#fff; color:#6366f1; border:2px solid #6366f1; }
.plan-btn.outline:hover { background:#f0f0ff; }`,
    js: `let yearly = false;
function switchBilling() {
  yearly = !yearly;
  document.getElementById('billing').classList.toggle('on', yearly);
  document.querySelectorAll('.amount').forEach(el => {
    const val = yearly ? el.dataset.yr : el.dataset.mo;
    el.textContent = Number(val).toLocaleString('ru');
  });
}`
  },

  loader: {
    html: `<div class="scene">
  <div class="controls">
    <button onclick="show('spinner')">Спиннер</button>
    <button onclick="show('dots')">Точки</button>
    <button onclick="show('skeleton')">Скелетон</button>
    <button onclick="show('bar')">Прогресс-бар</button>
    <button onclick="show('pulse')">Пульс</button>
  </div>
  <div class="demo-area">
    <div class="loader-wrap" id="spinner">
      <div class="spinner"></div>
      <span>Загрузка...</span>
    </div>
    <div class="loader-wrap" id="dots" style="display:none">
      <div class="dots"><span></span><span></span><span></span></div>
      <span>Обрабатываем...</span>
    </div>
    <div class="loader-wrap" id="skeleton" style="display:none">
      <div class="skel-card">
        <div class="skel-avatar"></div>
        <div class="skel-lines"><div class="skel-line wide"></div><div class="skel-line medium"></div><div class="skel-line short"></div></div>
      </div>
    </div>
    <div class="loader-wrap" id="bar" style="display:none">
      <div class="prog-bar-wrap"><div class="prog-bar-fill" id="prog-fill"></div></div>
      <span id="prog-pct">0%</span>
    </div>
    <div class="loader-wrap" id="pulse" style="display:none">
      <div class="pulse-ring"><div class="pulse-dot"></div></div>
      <span>Подключение...</span>
    </div>
  </div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:#0f172a; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.scene { text-align:center; width:100%; max-width:500px; }
.controls { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:40px; }
button { padding:8px 16px; background:#1e293b; color:#94a3b8; border:1.5px solid #334155; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s; font-family:inherit; }
button:hover { border-color:#6366f1; color:#818cf8; }
.demo-area { min-height:160px; display:flex; align-items:center; justify-content:center; }
.loader-wrap { display:flex; flex-direction:column; align-items:center; gap:20px; color:#94a3b8; font-size:13px; }
/* Spinner */
.spinner { width:48px; height:48px; border:4px solid #1e293b; border-top-color:#6366f1; border-radius:50%; animation:spin 0.8s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
/* Dots */
.dots { display:flex; gap:8px; }
.dots span { width:12px; height:12px; border-radius:50%; background:#6366f1; animation:bounce 1.2s infinite; }
.dots span:nth-child(2){animation-delay:.2s} .dots span:nth-child(3){animation-delay:.4s}
@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-16px)} }
/* Skeleton */
.skel-card { background:#1e293b; border-radius:14px; padding:20px; display:flex; gap:14px; width:280px; }
.skel-avatar { width:48px; height:48px; border-radius:50%; background:#334155; flex-shrink:0; animation:shimmer 1.5s infinite; }
.skel-lines { flex:1; display:flex; flex-direction:column; gap:10px; justify-content:center; }
.skel-line { height:10px; border-radius:99px; background:#334155; animation:shimmer 1.5s infinite; }
.skel-line.wide{width:100%} .skel-line.medium{width:75%} .skel-line.short{width:50%}
@keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
/* Progress bar */
.prog-bar-wrap { width:280px; height:10px; background:#1e293b; border-radius:99px; overflow:hidden; }
.prog-bar-fill { height:100%; width:0%; background:linear-gradient(90deg,#6366f1,#a78bfa); border-radius:99px; transition:width .1s; }
/* Pulse */
.pulse-ring { width:80px; height:80px; border-radius:50%; background:rgba(99,102,241,.15); display:flex; align-items:center; justify-content:center; animation:pulse-ring 1.5s infinite; }
.pulse-dot { width:32px; height:32px; border-radius:50%; background:#6366f1; }
@keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4)} 50%{box-shadow:0 0 0 20px rgba(99,102,241,0)} }`,
    js: `function show(id) {
  document.querySelectorAll('.loader-wrap').forEach(el => el.style.display = 'none');
  document.getElementById(id).style.display = 'flex';
  if (id === 'bar') startProgress();
}
function startProgress() {
  const fill = document.getElementById('prog-fill');
  const pct = document.getElementById('prog-pct');
  let val = 0; fill.style.width = '0%'; pct.textContent = '0%';
  const t = setInterval(() => {
    val += Math.random() * 4 + 1;
    if (val >= 100) { val = 100; clearInterval(t); pct.textContent = '✓ Готово!'; }
    else { pct.textContent = Math.round(val) + '%'; }
    fill.style.width = val + '%';
  }, 120);
}`
  },

  quiz: {
    html: `<div class="quiz-app">
  <div class="quiz-header">
    <div class="quiz-topic">🧠 JavaScript</div>
    <div class="quiz-progress"><span id="q-num">1</span> / <span id="q-total">5</span></div>
  </div>
  <div class="quiz-body" id="quiz-body"></div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:linear-gradient(135deg,#1e1b4b,#0f172a); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.quiz-app { background:#1e293b; border-radius:20px; padding:32px; width:100%; max-width:520px; }
.quiz-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.quiz-topic { font-size:13px; font-weight:700; color:#818cf8; text-transform:uppercase; letter-spacing:1px; }
.quiz-progress { font-size:13px; color:#64748b; font-weight:600; }
.question { font-size:18px; font-weight:600; color:#f1f5f9; line-height:1.5; margin-bottom:24px; }
.options { display:flex; flex-direction:column; gap:10px; }
.option { padding:14px 18px; border:2px solid #334155; border-radius:12px; font-size:14px; color:#cbd5e1; cursor:pointer; transition:all .15s; background:#0f172a; text-align:left; font-family:inherit; }
.option:hover:not(:disabled) { border-color:#6366f1; color:#e2e8f0; background:#1e1b4b; }
.option.correct { border-color:#22c55e; background:#052e16; color:#86efac; }
.option.wrong { border-color:#dc2626; background:#450a0a; color:#f87171; }
.option:disabled { cursor:default; }
.result { font-size:13px; color:#64748b; margin-top:16px; min-height:20px; }
.next-btn { margin-top:20px; width:100%; padding:14px; background:#6366f1; color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; display:none; transition:background .15s; font-family:inherit; }
.next-btn:hover { background:#4f46e5; }
.score-screen { text-align:center; color:#f1f5f9; }
.score-emoji { font-size:56px; margin-bottom:16px; }
.score-title { font-size:24px; font-weight:800; margin-bottom:8px; }
.score-sub { font-size:15px; color:#94a3b8; margin-bottom:28px; }
.score-val { font-size:48px; font-weight:900; color:#818cf8; margin-bottom:24px; }
.restart-btn { padding:13px 32px; background:#6366f1; color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; }`,
    js: `const questions = [
  { q:'Что выведет: typeof null', opts:['null','undefined','object','string'], ans:2 },
  { q:'Какой метод добавляет элемент в конец массива?', opts:['push()','pop()','shift()','splice()'], ans:0 },
  { q:'Что такое замыкание (closure)?', opts:['Тип данных','Функция с доступом к внешней области видимости','Ошибка','Метод объекта'], ans:1 },
  { q:'=== проверяет:', opts:['Только значение','Значение и тип','Только тип','Ничего'], ans:1 },
  { q:'Что вернёт [1,2,3].map(x => x*2)?', opts:['[1,2,3]','[2,4,6]','6','undefined'], ans:1 }
];
let cur = 0, score = 0;
document.getElementById('q-total').textContent = questions.length;
function renderQ() {
  const q = questions[cur];
  document.getElementById('q-num').textContent = cur + 1;
  document.getElementById('quiz-body').innerHTML = \`
    <div class="question">\${q.q}</div>
    <div class="options">\${q.opts.map((o,i)=>\`<button class="option" onclick="pick(this,\${i})">\${o}</button>\`).join('')}</div>
    <div class="result" id="result"></div>
    <button class="next-btn" id="next-btn" onclick="next()">\${cur < questions.length-1 ? 'Следующий вопрос →' : 'Посмотреть результат →'}</button>
  \`;
}
function pick(btn, idx) {
  document.querySelectorAll('.option').forEach(b=>b.disabled=true);
  const correct = questions[cur].ans;
  btn.classList.add(idx===correct?'correct':'wrong');
  if (idx===correct) { document.querySelectorAll('.option')[correct].classList.add('correct'); score++; document.getElementById('result').textContent='✓ Правильно!'; document.getElementById('result').style.color='#86efac'; }
  else { document.querySelectorAll('.option')[correct].classList.add('correct'); document.getElementById('result').textContent='✗ Неверно'; document.getElementById('result').style.color='#f87171'; }
  document.getElementById('next-btn').style.display='block';
}
function next() {
  cur++;
  if (cur < questions.length) renderQ();
  else {
    const emoji = score===questions.length?'🏆':score>=3?'😊':'😅';
    document.getElementById('quiz-body').innerHTML=\`<div class="score-screen"><div class="score-emoji">\${emoji}</div><div class="score-title">Квиз завершён!</div><div class="score-sub">Ты ответил правильно на \${score} из \${questions.length} вопросов</div><div class="score-val">\${Math.round(score/questions.length*100)}%</div><button class="restart-btn" onclick="restart()">Пройти снова</button></div>\`;
  }
}
function restart() { cur=0; score=0; renderQ(); }
renderQ();`
  },

  grid: {
    html: `<div class="page">
  <h1>CSS Grid — живое демо</h1>
  <div class="controls">
    <label>Колонки: <input type="range" id="cols" min="1" max="6" value="3" oninput="update()"><span id="cols-val">3</span></label>
    <label>Строки: <input type="range" id="rows" min="1" max="4" value="2" oninput="update()"><span id="rows-val">2</span></label>
    <label>Gap: <input type="range" id="gap" min="0" max="32" value="12" oninput="update()"><span id="gap-val">12px</span></label>
    <button onclick="toggleAuto()">Auto-fit: <span id="auto-label">выкл</span></button>
  </div>
  <div class="grid-output" id="grid-output"></div>
  <pre class="css-preview" id="css-preview"></pre>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:#0f172a; color:#e2e8f0; min-height:100vh; padding:28px 20px; }
h1 { font-size:20px; font-weight:700; margin-bottom:20px; color:#f1f5f9; }
.controls { display:flex; flex-wrap:wrap; gap:14px; align-items:center; margin-bottom:24px; }
label { font-size:13px; color:#94a3b8; display:flex; align-items:center; gap:8px; }
input[type=range] { accent-color:#6366f1; width:80px; }
span { font-weight:700; color:#818cf8; min-width:28px; }
button { padding:7px 14px; background:#1e293b; border:1.5px solid #334155; border-radius:8px; color:#94a3b8; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; }
button:hover { border-color:#6366f1; color:#818cf8; }
.grid-output { display:grid; gap:12px; margin-bottom:20px; }
.grid-cell { background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; min-height:70px; transition:all .3s; }
.css-preview { background:#1e293b; border:1px solid #334155; border-radius:10px; padding:14px 18px; font-size:12px; color:#86efac; font-family:'Consolas',monospace; line-height:1.7; white-space:pre-wrap; }`,
    js: `let autoFit = false;
const colors = ['#6366f1','#8b5cf6','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899','#14b8a6'];
function update() {
  const cols = +document.getElementById('cols').value;
  const rows = +document.getElementById('rows').value;
  const gap  = +document.getElementById('gap').value;
  document.getElementById('cols-val').textContent = cols;
  document.getElementById('rows-val').textContent = rows;
  document.getElementById('gap-val').textContent = gap + 'px';
  const total = cols * rows;
  const grid = document.getElementById('grid-output');
  const template = autoFit
    ? \`repeat(auto-fit, minmax(100px, 1fr))\`
    : \`repeat(\${cols}, 1fr)\`;
  grid.style.gridTemplateColumns = template;
  grid.style.gridTemplateRows = \`repeat(\${rows}, 1fr)\`;
  grid.style.gap = gap + 'px';
  grid.innerHTML = Array.from({length:total},(_,i)=>
    \`<div class="grid-cell" style="background:\${colors[i%colors.length]}">\${i+1}</div>\`
  ).join('');
  document.getElementById('css-preview').textContent =
    \`.container {\\n  display: grid;\\n  grid-template-columns: \${template};\\n  grid-template-rows: repeat(\${rows}, 1fr);\\n  gap: \${gap}px;\\n}\`;
}
function toggleAuto() {
  autoFit = !autoFit;
  document.getElementById('auto-label').textContent = autoFit ? 'вкл' : 'выкл';
  update();
}
update();`
  },

  tictactoe: {
    html: `<div class="game">
  <h2>Крестики-нолики</h2>
  <div id="status">Ход: X</div>
  <div class="board" id="board">
    <div class="cell" onclick="move(this,0)"></div>
    <div class="cell" onclick="move(this,1)"></div>
    <div class="cell" onclick="move(this,2)"></div>
    <div class="cell" onclick="move(this,3)"></div>
    <div class="cell" onclick="move(this,4)"></div>
    <div class="cell" onclick="move(this,5)"></div>
    <div class="cell" onclick="move(this,6)"></div>
    <div class="cell" onclick="move(this,7)"></div>
    <div class="cell" onclick="move(this,8)"></div>
  </div>
  <button onclick="restart()">Новая игра</button>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; font-family:sans-serif; }
.game { text-align:center; }
h2 { font-size:22px; color:#e2e8f0; margin-bottom:10px; }
#status { font-size:15px; color:#94a3b8; margin-bottom:20px; min-height:22px; }
.board { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; width:240px; margin:0 auto 24px; }
.cell { width:70px; height:70px; background:#1e293b; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:800; cursor:pointer; transition:all .15s; user-select:none; }
.cell:hover:not(.taken) { background:#273549; transform:scale(1.05); }
.cell.x { color:#818cf8; }
.cell.o { color:#f472b6; }
.cell.win { background:#1e293b; box-shadow:0 0 0 2.5px #6366f1; }
button { padding:11px 28px; background:#6366f1; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s; font-family:inherit; }
button:hover { background:#4f46e5; }`,
    js: `let board = Array(9).fill(''), current = 'X', over = false;
const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function move(cell, i) {
  if (over || board[i]) return;
  board[i] = current;
  cell.textContent = current;
  cell.classList.add('taken', current.toLowerCase());
  const win = wins.find(w => w.every(j => board[j] === current));
  if (win) {
    win.forEach(j => document.querySelectorAll('.cell')[j].classList.add('win'));
    document.getElementById('status').textContent = '🎉 Победил ' + current + '!';
    over = true; return;
  }
  if (board.every(Boolean)) { document.getElementById('status').textContent = '🤝 Ничья!'; over = true; return; }
  current = current === 'X' ? 'O' : 'X';
  document.getElementById('status').textContent = 'Ход: ' + current;
}
function restart() {
  board.fill(''); current = 'X'; over = false;
  document.querySelectorAll('.cell').forEach(c => { c.textContent = ''; c.className = 'cell'; });
  document.getElementById('status').textContent = 'Ход: X';
}`
  },

  stopwatch: {
    html: `<div class="sw-app">
  <div class="sw-display">
    <div class="sw-time" id="sw-time">00:00.00</div>
    <div class="sw-laps" id="sw-laps"></div>
  </div>
  <div class="sw-btns">
    <button id="sw-start" onclick="swToggle()">▶ Старт</button>
    <button onclick="swLap()" id="sw-lap" disabled>Круг</button>
    <button onclick="swReset()">↺ Сброс</button>
  </div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:#0f172a; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.sw-app { text-align:center; width:100%; max-width:360px; }
.sw-display { background:#1e293b; border-radius:20px; padding:32px; margin-bottom:20px; }
.sw-time { font-size:52px; font-weight:800; color:#f1f5f9; font-variant-numeric:tabular-nums; letter-spacing:-1px; }
.sw-laps { margin-top:16px; max-height:160px; overflow-y:auto; display:flex; flex-direction:column; gap:6px; }
.lap-item { display:flex; justify-content:space-between; padding:8px 12px; background:#0f172a; border-radius:8px; font-size:13px; color:#94a3b8; font-variant-numeric:tabular-nums; }
.lap-item .lap-num { color:#6366f1; font-weight:700; }
.sw-btns { display:flex; gap:10px; justify-content:center; }
button { flex:1; padding:13px; border-radius:12px; border:none; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; }
button:nth-child(1) { background:#6366f1; color:#fff; }
button:nth-child(1):hover { background:#4f46e5; }
button:nth-child(2) { background:#1e293b; color:#94a3b8; }
button:nth-child(2):not([disabled]):hover { background:#273549; color:#e2e8f0; }
button:nth-child(3) { background:#1e293b; color:#94a3b8; }
button:nth-child(3):hover { background:#273549; color:#e2e8f0; }
button[disabled] { opacity:.4; cursor:not-allowed; }`,
    js: `let running=false, startTime=0, elapsed=0, lapStart=0, lapCount=0, rafId=null;
function fmt(ms) {
  const t=ms/10;
  const cs=Math.floor(t%100).toString().padStart(2,'0');
  const s=Math.floor(t/100%60).toString().padStart(2,'0');
  const m=Math.floor(t/6000).toString().padStart(2,'0');
  return m+':'+s+'.'+cs;
}
function tick() {
  elapsed=Date.now()-startTime;
  document.getElementById('sw-time').textContent=fmt(elapsed);
  rafId=requestAnimationFrame(tick);
}
function swToggle() {
  if(!running){
    startTime=Date.now()-elapsed;
    if(lapStart===0)lapStart=startTime;
    running=true;
    document.getElementById('sw-start').textContent='⏸ Пауза';
    document.getElementById('sw-lap').disabled=false;
    rafId=requestAnimationFrame(tick);
  } else {
    cancelAnimationFrame(rafId);
    running=false;
    document.getElementById('sw-start').textContent='▶ Продолжить';
  }
}
function swLap() {
  if(!running)return;
  const now=Date.now();
  lapCount++;
  const lapTime=now-lapStart;
  lapStart=now;
  const div=document.createElement('div');
  div.className='lap-item';
  div.innerHTML='<span class="lap-num">Круг '+lapCount+'</span><span>'+fmt(elapsed)+'</span><span>+'+fmt(lapTime)+'</span>';
  const laps=document.getElementById('sw-laps');
  laps.prepend(div);
}
function swReset() {
  cancelAnimationFrame(rafId);
  running=false; elapsed=0; startTime=0; lapStart=0; lapCount=0;
  document.getElementById('sw-time').textContent='00:00.00';
  document.getElementById('sw-laps').innerHTML='';
  document.getElementById('sw-start').textContent='▶ Старт';
  document.getElementById('sw-lap').disabled=true;
}`
  },

  password: {
    html: `<div class="pg-app">
  <h2>🔑 Генератор паролей</h2>
  <div class="pass-display">
    <span id="pass-out">Нажми «Создать»</span>
    <button class="copy-pass" onclick="copyPass()" title="Копировать">📋</button>
  </div>
  <div class="strength-bar"><div id="strength-fill"></div></div>
  <div class="strength-label" id="strength-label"></div>
  <div class="options">
    <label class="opt"><input type="range" id="pg-len" min="6" max="32" value="16" oninput="updateLen()"><span>Длина: <b id="len-val">16</b></span></label>
    <label class="opt"><input type="checkbox" id="pg-upper" checked> Заглавные (A-Z)</label>
    <label class="opt"><input type="checkbox" id="pg-lower" checked> Строчные (a-z)</label>
    <label class="opt"><input type="checkbox" id="pg-digits" checked> Цифры (0-9)</label>
    <label class="opt"><input type="checkbox" id="pg-sym"> Символы (!@#$%)</label>
  </div>
  <button class="gen-btn" onclick="generate()">Создать пароль</button>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:linear-gradient(135deg,#0f172a,#1e1b4b); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.pg-app { background:#1e293b; border-radius:20px; padding:32px; width:100%; max-width:400px; }
h2 { font-size:20px; color:#f1f5f9; margin-bottom:24px; }
.pass-display { background:#0f172a; border-radius:12px; padding:16px 18px; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
#pass-out { font-family:monospace; font-size:16px; color:#86efac; word-break:break-all; flex:1; }
.copy-pass { background:none; border:none; font-size:20px; cursor:pointer; padding:4px; border-radius:6px; transition:transform .15s; }
.copy-pass:hover { transform:scale(1.2); }
.strength-bar { height:6px; background:#0f172a; border-radius:99px; overflow:hidden; margin-bottom:6px; }
#strength-fill { height:100%; width:0%; border-radius:99px; transition:width .4s, background .4s; }
.strength-label { font-size:12px; color:#64748b; margin-bottom:20px; min-height:16px; }
.options { display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
.opt { display:flex; align-items:center; gap:10px; font-size:14px; color:#94a3b8; cursor:pointer; }
input[type=checkbox] { width:16px; height:16px; accent-color:#6366f1; cursor:pointer; }
input[type=range] { accent-color:#6366f1; flex:1; }
.gen-btn { width:100%; padding:14px; background:#6366f1; color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; transition:background .15s; }
.gen-btn:hover { background:#4f46e5; }`,
    js: `function generate() {
  const len=+document.getElementById('pg-len').value;
  const upper=document.getElementById('pg-upper').checked;
  const lower=document.getElementById('pg-lower').checked;
  const digits=document.getElementById('pg-digits').checked;
  const sym=document.getElementById('pg-sym').checked;
  let chars='';
  if(upper) chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(lower) chars+='abcdefghijklmnopqrstuvwxyz';
  if(digits) chars+='0123456789';
  if(sym) chars+='!@#$%^&*()-_=+[]{}|;:,.<>?';
  if(!chars){document.getElementById('pass-out').textContent='Выбери хотя бы один тип';return;}
  let pass='';
  const arr=new Uint32Array(len);
  crypto.getRandomValues(arr);
  arr.forEach(v=>pass+=chars[v%chars.length]);
  document.getElementById('pass-out').textContent=pass;
  updateStrength(pass,upper,lower,digits,sym);
}
function updateStrength(pass,upper,lower,digits,sym) {
  const sets=[upper,lower,digits,sym].filter(Boolean).length;
  const score=Math.min(100,Math.round((pass.length/32)*60+(sets/4)*40));
  const fill=document.getElementById('strength-fill');
  const label=document.getElementById('strength-label');
  fill.style.width=score+'%';
  if(score<40){fill.style.background='#dc2626';label.textContent='😟 Слабый пароль';}
  else if(score<70){fill.style.background='#f59e0b';label.textContent='😐 Средний пароль';}
  else if(score<90){fill.style.background='#22c55e';label.textContent='😊 Хороший пароль';}
  else{fill.style.background='#6366f1';label.textContent='🔒 Очень надёжный!';}
}
function copyPass() {
  const t=document.getElementById('pass-out').textContent;
  navigator.clipboard.writeText(t).then(()=>{
    const btn=document.querySelector('.copy-pass');
    btn.textContent='✅'; setTimeout(()=>btn.textContent='📋',1500);
  });
}
function updateLen(){document.getElementById('len-val').textContent=document.getElementById('pg-len').value;}
generate();`
  },

  weather: {
    html: `<div class="w-app">
  <div class="w-search">
    <input type="text" id="w-city" placeholder="Введи город..." value="Москва" onkeydown="if(event.key==='Enter')showWeather()">
    <button onclick="showWeather()">🔍</button>
  </div>
  <div class="w-card" id="w-card" style="display:none">
    <div class="w-top">
      <div>
        <div class="w-city-name" id="w-name">—</div>
        <div class="w-desc" id="w-desc">—</div>
      </div>
      <div class="w-icon" id="w-icon">🌤️</div>
    </div>
    <div class="w-temp" id="w-temp">—</div>
    <div class="w-stats">
      <div class="w-stat"><div class="w-stat-val" id="w-hum">—</div><div class="w-stat-lbl">Влажность</div></div>
      <div class="w-stat"><div class="w-stat-val" id="w-wind">—</div><div class="w-stat-lbl">Ветер</div></div>
      <div class="w-stat"><div class="w-stat-val" id="w-feel">—</div><div class="w-stat-lbl">Ощущается</div></div>
    </div>
  </div>
  <div class="w-note">📌 Демо-режим: реальные данные требуют API ключ openweathermap.org. Показываются случайные данные.</div>
</div>`,
    css: `* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:sans-serif; background:linear-gradient(160deg,#0ea5e9,#6366f1); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.w-app { width:100%; max-width:380px; }
.w-search { display:flex; gap:10px; margin-bottom:20px; }
input { flex:1; padding:12px 16px; border:none; border-radius:12px; font-size:15px; background:rgba(255,255,255,.2); color:#fff; outline:none; backdrop-filter:blur(8px); }
input::placeholder { color:rgba(255,255,255,.7); }
.w-search button { width:48px; border:none; border-radius:12px; background:rgba(255,255,255,.25); color:#fff; font-size:18px; cursor:pointer; transition:background .15s; }
.w-search button:hover { background:rgba(255,255,255,.35); }
.w-card { background:rgba(255,255,255,.18); backdrop-filter:blur(12px); border-radius:20px; padding:28px; border:1px solid rgba(255,255,255,.3); color:#fff; animation:fadeIn .3s ease; }
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.w-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.w-city-name { font-size:22px; font-weight:700; }
.w-desc { font-size:14px; opacity:.8; margin-top:4px; }
.w-icon { font-size:56px; }
.w-temp { font-size:64px; font-weight:800; margin-bottom:20px; }
.w-stats { display:flex; gap:12px; }
.w-stat { flex:1; background:rgba(255,255,255,.15); border-radius:12px; padding:12px; text-align:center; }
.w-stat-val { font-size:18px; font-weight:700; }
.w-stat-lbl { font-size:11px; opacity:.75; margin-top:3px; }
.w-note { font-size:11px; color:rgba(255,255,255,.6); text-align:center; margin-top:14px; line-height:1.5; }`,
    js: `const CITIES = {
  'москва':    {t:2,feel:-2,hum:78,wind:5,desc:'Пасмурно',icon:'🌥️'},
  'питер':     {t:-1,feel:-5,hum:85,wind:7,desc:'Снег',icon:'❄️'},
  'сочи':      {t:14,feel:12,hum:65,wind:3,desc:'Облачно',icon:'🌤️'},
  'лондон':    {t:8,feel:5,hum:80,wind:9,desc:'Дождь',icon:'🌧️'},
  'токио':     {t:16,feel:14,hum:60,wind:4,desc:'Ясно',icon:'☀️'},
  'нью-йорк':  {t:5,feel:1,hum:70,wind:8,desc:'Ветрено',icon:'🌬️'},
  'берлин':    {t:3,feel:0,hum:75,wind:6,desc:'Туман',icon:'🌫️'},
  'дубай':     {t:28,feel:30,hum:55,wind:2,desc:'Солнечно',icon:'☀️'},
  'пекин':     {t:7,feel:4,hum:50,wind:5,desc:'Ясно',icon:'🌤️'},
};
function showWeather() {
  const city = document.getElementById('w-city').value.trim().toLowerCase();
  const data = CITIES[city] || {
    t:Math.round(Math.random()*30-5),
    feel:Math.round(Math.random()*30-8),
    hum:Math.round(Math.random()*50+40),
    wind:Math.round(Math.random()*12+1),
    desc:['Ясно','Облачно','Дождь','Снег','Туман'][Math.floor(Math.random()*5)],
    icon:['☀️','🌤️','🌥️','🌧️','❄️','🌫️'][Math.floor(Math.random()*6)]
  };
  document.getElementById('w-name').textContent = document.getElementById('w-city').value;
  document.getElementById('w-temp').textContent = data.t + '°C';
  document.getElementById('w-desc').textContent = data.desc;
  document.getElementById('w-icon').textContent = data.icon;
  document.getElementById('w-hum').textContent  = data.hum + '%';
  document.getElementById('w-wind').textContent = data.wind + ' м/с';
  document.getElementById('w-feel').textContent = data.feel + '°C';
  document.getElementById('w-card').style.display = 'block';
}
showWeather();`
  }
,
  hero: {
    html: '<section class="hero">\n  <h1>Делай. Создавай. Запускай.</h1>\n  <p>Простой и быстрый способ воплотить твои идеи в жизнь.</p>\n  <div class="hero-btns">\n    <button class="btn primary">Начать</button>\n    <button class="btn ghost">Узнать больше</button>\n  </div>\n</section>',
    css: 'body { margin:0; font-family:system-ui,sans-serif; }\n.hero { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; }\n.hero h1 { font-size:clamp(32px,6vw,64px); margin:0 0 16px; }\n.hero p { font-size:18px; opacity:.9; max-width:560px; margin:0 0 32px; }\n.hero-btns { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; }\n.btn { padding:12px 28px; border-radius:99px; border:none; font-weight:600; font-size:15px; cursor:pointer; transition:transform .15s, box-shadow .15s; }\n.btn.primary { background:#fff; color:#6366f1; }\n.btn.ghost { background:transparent; color:#fff; border:2px solid rgba(255,255,255,.5); }\n.btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.2); }',
    js: ''
  },
  footer: {
    html: '<footer class="footer">\n  <div class="cols">\n    <div>\n      <h3>Контакты</h3>\n      <p>email@site.ru</p>\n      <p>+7 (000) 000-00-00</p>\n    </div>\n    <div>\n      <h3>Меню</h3>\n      <a href="#">Главная</a>\n      <a href="#">О нас</a>\n      <a href="#">Услуги</a>\n      <a href="#">Контакты</a>\n    </div>\n    <div>\n      <h3>Соцсети</h3>\n      <a href="#">Telegram</a>\n      <a href="#">VK</a>\n      <a href="#">Instagram</a>\n    </div>\n  </div>\n  <div class="copy">© 2026 Моя компания. Все права защищены.</div>\n</footer>',
    css: 'body { margin:0; font-family:sans-serif; }\n.footer { background:#0f172a; color:#cbd5e1; padding:48px 24px 24px; }\n.cols { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:32px; }\n.cols h3 { color:#fff; font-size:14px; text-transform:uppercase; letter-spacing:1px; margin:0 0 14px; }\n.cols a { display:block; color:#cbd5e1; text-decoration:none; padding:4px 0; transition:color .15s; }\n.cols a:hover { color:#6366f1; }\n.cols p { margin:6px 0; }\n.copy { max-width:1100px; margin:32px auto 0; padding-top:20px; border-top:1px solid #334155; text-align:center; font-size:13px; color:#64748b; }',
    js: ''
  },
  avatar: {
    html: '<div class="profile">\n  <div class="avatar">АК</div>\n  <h2>Алекс Калинин</h2>\n  <p class="role">Frontend разработчик</p>\n  <p class="bio">Делаю красивые сайты. Учусь каждый день.</p>\n  <div class="stats">\n    <div><strong>248</strong><span>Постов</span></div>\n    <div><strong>12.4k</strong><span>Подписчиков</span></div>\n    <div><strong>892</strong><span>Подписок</span></div>\n  </div>\n  <div class="actions">\n    <button class="follow">Подписаться</button>\n    <button class="msg">Написать</button>\n  </div>\n</div>',
    css: 'body { margin:0; font-family:system-ui,sans-serif; background:#f1f5f9; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; }\n.profile { background:#fff; border-radius:18px; padding:32px; max-width:340px; width:100%; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,.08); }\n.avatar { width:96px; height:96px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ec4899); margin:0 auto 16px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:32px; font-weight:700; }\n.profile h2 { margin:0 0 4px; font-size:22px; }\n.role { color:#6b7280; margin:0 0 12px; font-size:14px; }\n.bio { color:#374151; margin:0 0 20px; line-height:1.5; }\n.stats { display:flex; justify-content:space-around; padding:16px 0; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; margin-bottom:20px; }\n.stats div { display:flex; flex-direction:column; }\n.stats strong { font-size:18px; }\n.stats span { font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.5px; }\n.actions { display:flex; gap:8px; }\n.actions button { flex:1; padding:10px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:14px; }\n.follow { background:#6366f1; color:#fff; }\n.msg { background:#f3f4f6; color:#374151; }',
    js: ''
  },
  gallery: {
    html: '<div class="gallery">\n  <div class="item" style="background:linear-gradient(135deg,#f97316,#ec4899)"><span>🌅</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#06b6d4,#3b82f6)"><span>🌊</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#10b981,#84cc16)"><span>🌿</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#a855f7,#ec4899)"><span>🌸</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#fbbf24,#f97316)"><span>☀️</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#1e40af,#6366f1)"><span>🌌</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#dc2626,#fbbf24)"><span>🔥</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#475569,#1e293b)"><span>🏔️</span></div>\n  <div class="item" style="background:linear-gradient(135deg,#10b981,#06b6d4)"><span>🌍</span></div>\n</div>',
    css: 'body { margin:0; padding:24px; background:#f1f5f9; font-family:sans-serif; }\n.gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; max-width:600px; margin:0 auto; }\n@media (max-width:500px) { .gallery { grid-template-columns:repeat(2,1fr); } }\n.item { aspect-ratio:1; border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:transform .2s, box-shadow .2s; }\n.item span { font-size:48px; transition:transform .3s; }\n.item:hover { transform:translateY(-4px) scale(1.02); box-shadow:0 12px 24px rgba(0,0,0,.2); }\n.item:hover span { transform:scale(1.2); }',
    js: ''
  },
  badges: {
    html: '<div class="container">\n  <h2>Бейджи и теги</h2>\n  <div class="row">\n    <span class="badge">Default</span>\n    <span class="badge primary">Primary</span>\n    <span class="badge success">Success</span>\n    <span class="badge warning">Warning</span>\n    <span class="badge danger">Danger</span>\n    <span class="badge dark">Dark</span>\n  </div>\n  <div class="row">\n    <span class="badge outline-primary">Outlined</span>\n    <span class="badge outline-success">Outlined</span>\n    <span class="badge outline-danger">Outlined</span>\n  </div>\n  <div class="row">\n    <span class="badge primary pill">Pill</span>\n    <span class="badge success pill">99+</span>\n    <span class="badge danger pill">Hot 🔥</span>\n  </div>\n</div>',
    css: 'body { margin:0; font-family:sans-serif; padding:32px; background:#f8fafc; }\n.container { max-width:600px; margin:0 auto; }\nh2 { margin:0 0 16px; }\n.row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }\n.badge { display:inline-block; padding:4px 12px; border-radius:6px; font-size:13px; font-weight:600; background:#e5e7eb; color:#374151; }\n.badge.primary { background:#6366f1; color:#fff; }\n.badge.success { background:#10b981; color:#fff; }\n.badge.warning { background:#f59e0b; color:#fff; }\n.badge.danger { background:#ef4444; color:#fff; }\n.badge.dark { background:#1f2937; color:#fff; }\n.badge.outline-primary { background:transparent; color:#6366f1; border:2px solid #6366f1; }\n.badge.outline-success { background:transparent; color:#10b981; border:2px solid #10b981; }\n.badge.outline-danger { background:transparent; color:#ef4444; border:2px solid #ef4444; }\n.badge.pill { border-radius:99px; padding:4px 14px; }',
    js: ''
  },
  breadcrumbs: {
    html: '<nav class="breadcrumbs">\n  <a href="#">🏠 Главная</a>\n  <span class="sep">/</span>\n  <a href="#">Каталог</a>\n  <span class="sep">/</span>\n  <a href="#">Электроника</a>\n  <span class="sep">/</span>\n  <a href="#">Смартфоны</a>\n  <span class="sep">/</span>\n  <span class="current">iPhone 15 Pro</span>\n</nav>',
    css: 'body { margin:0; padding:32px; font-family:sans-serif; background:#f9fafb; }\n.breadcrumbs { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:14px 18px; background:#fff; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,.05); max-width:800px; margin:0 auto; font-size:14px; }\n.breadcrumbs a { color:#6366f1; text-decoration:none; transition:color .15s; }\n.breadcrumbs a:hover { color:#4f46e5; text-decoration:underline; }\n.sep { color:#d1d5db; }\n.current { color:#1f2937; font-weight:600; }',
    js: ''
  },
  clicker: {
    html: '<div class="game">\n  <h1>Кликер</h1>\n  <div class="score">Очков: <span id="score">0</span></div>\n  <div class="per-click">+<span id="perClick">1</span> за клик</div>\n  <button class="cookie" onclick="click()">🍪</button>\n  <button class="upgrade" onclick="upgrade()">Улучшить (стоит <span id="cost">10</span>)</button>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#fbbf24,#f97316); font-family:system-ui,sans-serif; }\n.game { text-align:center; color:#fff; }\nh1 { font-size:48px; margin:0 0 8px; text-shadow:0 4px 12px rgba(0,0,0,.2); }\n.score { font-size:32px; font-weight:700; margin-bottom:4px; }\n.per-click { font-size:14px; opacity:.85; margin-bottom:24px; }\n.cookie { background:none; border:none; font-size:120px; cursor:pointer; transition:transform .1s; padding:0; }\n.cookie:active { transform:scale(.92); }\n.upgrade { display:block; margin:24px auto 0; padding:12px 24px; background:#fff; color:#f97316; border:none; border-radius:99px; font-weight:700; font-size:14px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,.15); }\n.upgrade:hover { transform:translateY(-2px); }\n.upgrade:disabled { opacity:.5; cursor:not-allowed; }',
    js: 'let score = 0;\nlet perClick = 1;\nlet cost = 10;\nfunction click() {\n  score += perClick;\n  document.getElementById("score").textContent = score;\n}\nfunction upgrade() {\n  if (score < cost) { alert("Недостаточно очков!"); return; }\n  score -= cost;\n  perClick += 1;\n  cost = Math.floor(cost * 1.6);\n  document.getElementById("score").textContent = score;\n  document.getElementById("perClick").textContent = perClick;\n  document.getElementById("cost").textContent = cost;\n}'
  },
  guessnum: {
    html: '<div class="game">\n  <h2>🎯 Угадай число от 1 до 100</h2>\n  <input type="number" id="guess" min="1" max="100" placeholder="Твоя догадка">\n  <button onclick="check()">Проверить</button>\n  <div class="hint" id="hint">У тебя 7 попыток</div>\n  <div class="history" id="history"></div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#e2e8f0; font-family:system-ui,sans-serif; padding:20px; }\n.game { background:#1e293b; padding:32px; border-radius:16px; max-width:380px; width:100%; text-align:center; }\nh2 { margin:0 0 24px; }\ninput { width:100%; padding:12px; font-size:18px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; margin-bottom:12px; box-sizing:border-box; text-align:center; }\nbutton { width:100%; padding:12px; background:#6366f1; color:#fff; border:none; border-radius:8px; font-size:16px; font-weight:600; cursor:pointer; }\nbutton:hover { background:#4f46e5; }\n.hint { margin:20px 0 12px; font-size:18px; min-height:24px; }\n.history { display:flex; gap:6px; justify-content:center; flex-wrap:wrap; }\n.tag { padding:4px 10px; border-radius:99px; font-size:12px; background:#334155; }\n.tag.high { background:#dc2626; }\n.tag.low { background:#2563eb; }',
    js: 'let target = Math.floor(Math.random() * 100) + 1;\nlet attempts = 7;\nlet history = [];\nfunction check() {\n  const guess = parseInt(document.getElementById("guess").value);\n  if (!guess || guess < 1 || guess > 100) { alert("Введи число от 1 до 100"); return; }\n  attempts--;\n  let cls = "tag";\n  if (guess > target) cls += " high";\n  else if (guess < target) cls += " low";\n  history.push(`<span class="${cls}">${guess}</span>`);\n  document.getElementById("history").innerHTML = history.join("");\n  const hint = document.getElementById("hint");\n  if (guess === target) {\n    hint.innerHTML = `🎉 Угадал! Число было ${target}. Попыток осталось: ${attempts}`;\n    document.getElementById("guess").disabled = true;\n  } else if (attempts === 0) {\n    hint.innerHTML = `💀 Закончились попытки. Число было ${target}`;\n    document.getElementById("guess").disabled = true;\n  } else {\n    hint.innerHTML = guess > target ? `📉 Меньше! Осталось ${attempts} попыток` : `📈 Больше! Осталось ${attempts} попыток`;\n  }\n  document.getElementById("guess").value = "";\n  document.getElementById("guess").focus();\n}'
  },
  rps: {
    html: '<div class="game">\n  <h1>Камень-Ножницы-Бумага</h1>\n  <div class="score">Ты: <span id="meScore">0</span> · Бот: <span id="aiScore">0</span></div>\n  <div class="round" id="round">Сделай выбор</div>\n  <div class="buttons">\n    <button onclick="play(\'rock\')">🪨</button>\n    <button onclick="play(\'paper\')">📄</button>\n    <button onclick="play(\'scissors\')">✂️</button>\n  </div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1e3a8a,#7e22ce); color:#fff; font-family:system-ui,sans-serif; }\n.game { text-align:center; padding:20px; }\nh1 { font-size:32px; margin:0 0 16px; }\n.score { font-size:20px; margin-bottom:24px; opacity:.9; }\n.round { font-size:24px; min-height:60px; margin-bottom:24px; line-height:1.3; }\n.buttons { display:flex; gap:16px; justify-content:center; }\n.buttons button { font-size:54px; width:90px; height:90px; border-radius:50%; border:none; background:rgba(255,255,255,.15); backdrop-filter:blur(8px); cursor:pointer; transition:transform .15s, background .15s; }\n.buttons button:hover { background:rgba(255,255,255,.25); transform:scale(1.1); }',
    js: 'let me = 0, ai = 0;\nconst icons = { rock:"🪨", paper:"📄", scissors:"✂️" };\nfunction play(my) {\n  const choices = ["rock","paper","scissors"];\n  const aiChoice = choices[Math.floor(Math.random()*3)];\n  let result;\n  if (my === aiChoice) result = "Ничья!";\n  else if (\n    (my==="rock" && aiChoice==="scissors") ||\n    (my==="paper" && aiChoice==="rock") ||\n    (my==="scissors" && aiChoice==="paper")\n  ) { me++; result = "Ты выиграл! 🎉"; }\n  else { ai++; result = "Бот выиграл 😢"; }\n  document.getElementById("round").innerHTML = `${icons[my]} VS ${icons[aiChoice]}<br>${result}`;\n  document.getElementById("meScore").textContent = me;\n  document.getElementById("aiScore").textContent = ai;\n}'
  },
  tip: {
    html: '<div class="card">\n  <h2>💸 Калькулятор чаевых</h2>\n  <label>Сумма счёта (₽)</label>\n  <input type="number" id="bill" value="1000" oninput="calc()">\n  <label>Чаевые: <span id="pctVal">15</span>%</label>\n  <input type="range" id="pct" min="0" max="30" value="15" oninput="calc()">\n  <label>Человек: <span id="peopleVal">1</span></label>\n  <input type="range" id="people" min="1" max="10" value="1" oninput="calc()">\n  <div class="result">\n    <div>Чаевые: <strong id="tipAmt">150 ₽</strong></div>\n    <div>Итого: <strong id="totalAmt">1150 ₽</strong></div>\n    <div class="big">С каждого: <strong id="perPerson">1150 ₽</strong></div>\n  </div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f1f5f9; font-family:system-ui,sans-serif; padding:20px; }\n.card { background:#fff; padding:28px; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,.08); width:100%; max-width:380px; }\nh2 { margin:0 0 24px; }\nlabel { display:block; margin-bottom:6px; font-size:13px; color:#6b7280; font-weight:600; }\ninput[type="number"] { width:100%; padding:10px; font-size:16px; border:2px solid #e5e7eb; border-radius:8px; box-sizing:border-box; margin-bottom:16px; }\ninput[type="range"] { width:100%; margin-bottom:16px; accent-color:#6366f1; }\n.result { background:#f9fafb; padding:16px; border-radius:12px; margin-top:8px; }\n.result div { display:flex; justify-content:space-between; padding:4px 0; }\n.result .big { font-size:20px; padding-top:12px; margin-top:8px; border-top:1px solid #e5e7eb; }\n.result strong { color:#6366f1; }',
    js: 'function calc() {\n  const bill = parseFloat(document.getElementById("bill").value) || 0;\n  const pct = parseInt(document.getElementById("pct").value);\n  const people = parseInt(document.getElementById("people").value);\n  document.getElementById("pctVal").textContent = pct;\n  document.getElementById("peopleVal").textContent = people;\n  const tip = Math.round(bill * pct / 100);\n  const total = bill + tip;\n  const per = Math.round(total / people);\n  document.getElementById("tipAmt").textContent = tip + " ₽";\n  document.getElementById("totalAmt").textContent = total + " ₽";\n  document.getElementById("perPerson").textContent = per + " ₽";\n}\ncalc();'
  },
  dice: {
    html: '<div class="game">\n  <h1>🎲 Брось кубики</h1>\n  <div class="dice-row">\n    <div class="die" id="d1">🎲</div>\n    <div class="die" id="d2">🎲</div>\n  </div>\n  <div class="sum">Сумма: <span id="sum">—</span></div>\n  <button onclick="roll()">Бросить</button>\n  <div class="history" id="history"></div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0c4a6e; color:#fff; font-family:system-ui,sans-serif; padding:20px; }\n.game { text-align:center; }\nh1 { margin:0 0 24px; }\n.dice-row { display:flex; gap:20px; justify-content:center; margin-bottom:20px; }\n.die { width:80px; height:80px; background:#fff; color:#0c4a6e; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:48px; font-weight:700; box-shadow:0 6px 16px rgba(0,0,0,.3); transition:transform .3s; }\n.die.rolling { animation:roll .5s; }\n@keyframes roll { 0%{transform:rotate(0)} 50%{transform:rotate(360deg) scale(1.2)} 100%{transform:rotate(720deg)} }\n.sum { font-size:24px; margin-bottom:20px; }\nbutton { padding:14px 32px; background:#fbbf24; color:#0c4a6e; border:none; border-radius:99px; font-weight:700; font-size:16px; cursor:pointer; }\nbutton:hover { transform:scale(1.05); }\n.history { margin-top:24px; display:flex; gap:6px; justify-content:center; flex-wrap:wrap; opacity:.7; font-size:14px; }',
    js: 'const history = [];\nfunction roll() {\n  document.getElementById("d1").classList.add("rolling");\n  document.getElementById("d2").classList.add("rolling");\n  setTimeout(() => {\n    const a = Math.floor(Math.random() * 6) + 1;\n    const b = Math.floor(Math.random() * 6) + 1;\n    document.getElementById("d1").textContent = a;\n    document.getElementById("d2").textContent = b;\n    document.getElementById("sum").textContent = a + b;\n    document.getElementById("d1").classList.remove("rolling");\n    document.getElementById("d2").classList.remove("rolling");\n    history.unshift(`${a}+${b}=${a+b}`);\n    if (history.length > 8) history.pop();\n    document.getElementById("history").textContent = history.join(" · ");\n  }, 500);\n}'
  },
  progress: {
    html: '<div class="container">\n  <h2>Загрузка проекта</h2>\n  <div class="bars">\n    <div>\n      <div class="lbl">HTML <span>85%</span></div>\n      <div class="bar"><div class="fill" style="width:85%; background:#f97316"></div></div>\n    </div>\n    <div>\n      <div class="lbl">CSS <span>70%</span></div>\n      <div class="bar"><div class="fill" style="width:70%; background:#3b82f6"></div></div>\n    </div>\n    <div>\n      <div class="lbl">JavaScript <span>40%</span></div>\n      <div class="bar"><div class="fill" style="width:40%; background:#facc15"></div></div>\n    </div>\n    <div>\n      <div class="lbl">React <span>15%</span></div>\n      <div class="bar"><div class="fill" style="width:15%; background:#06b6d4"></div></div>\n    </div>\n  </div>\n  <button onclick="animate()">Анимировать</button>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#1e293b; color:#fff; font-family:system-ui,sans-serif; padding:20px; }\n.container { width:100%; max-width:480px; }\nh2 { margin:0 0 24px; }\n.bars { display:flex; flex-direction:column; gap:18px; margin-bottom:24px; }\n.lbl { display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px; }\n.bar { height:10px; background:#334155; border-radius:99px; overflow:hidden; }\n.fill { height:100%; border-radius:99px; transition:width 1.2s cubic-bezier(.4,0,.2,1); }\nbutton { padding:10px 22px; background:#6366f1; border:none; color:#fff; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\nbutton:hover { background:#4f46e5; }',
    js: 'function animate() {\n  document.querySelectorAll(".fill").forEach(el => {\n    const w = el.style.width;\n    el.style.width = "0%";\n    setTimeout(() => el.style.width = w, 100);\n  });\n}'
  },
  stars: {
    html: '<div class="container">\n  <h2>Оцени фильм</h2>\n  <div class="stars" id="stars">\n    <span data-v="1">★</span>\n    <span data-v="2">★</span>\n    <span data-v="3">★</span>\n    <span data-v="4">★</span>\n    <span data-v="5">★</span>\n  </div>\n  <div class="result" id="result">Кликни на звёзды</div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#0f172a,#581c87); font-family:system-ui,sans-serif; }\n.container { text-align:center; color:#fff; }\nh2 { margin-bottom:24px; }\n.stars { font-size:54px; cursor:pointer; user-select:none; }\n.stars span { color:#475569; transition:color .15s, transform .15s; display:inline-block; }\n.stars span:hover { transform:scale(1.2); }\n.stars span.active { color:#fbbf24; text-shadow:0 0 16px rgba(251,191,36,.5); }\n.result { margin-top:20px; font-size:18px; min-height:32px; }',
    js: 'const stars = document.querySelectorAll("#stars span");\nlet rating = 0;\nstars.forEach(s => {\n  s.addEventListener("mouseover", () => paint(parseInt(s.dataset.v)));\n  s.addEventListener("click", () => {\n    rating = parseInt(s.dataset.v);\n    paint(rating);\n    const labels = ["", "Ужасно 😞", "Плохо 😐", "Норм 🙂", "Хорошо 😊", "Шедевр! 🤩"];\n    document.getElementById("result").textContent = labels[rating];\n  });\n});\ndocument.getElementById("stars").addEventListener("mouseleave", () => paint(rating));\nfunction paint(n) {\n  stars.forEach((s, i) => s.classList.toggle("active", i < n));\n}'
  },
  search: {
    html: '<div class="container">\n  <input type="text" id="search" placeholder="🔍 Поиск по фруктам..." oninput="filter()">\n  <ul id="list">\n    <li>🍎 Яблоко</li><li>🍌 Банан</li><li>🍇 Виноград</li>\n    <li>🍉 Арбуз</li><li>🍊 Апельсин</li><li>🥭 Манго</li>\n    <li>🍓 Клубника</li><li>🍑 Персик</li><li>🍒 Вишня</li>\n    <li>🥝 Киви</li><li>🍋 Лимон</li><li>🍐 Груша</li>\n    <li>🍍 Ананас</li><li>🥥 Кокос</li><li>🫐 Голубика</li>\n  </ul>\n  <div class="empty" id="empty">Ничего не найдено</div>\n</div>',
    css: 'body { margin:0; padding:32px 20px; font-family:system-ui,sans-serif; background:#f8fafc; min-height:100vh; }\n.container { max-width:480px; margin:0 auto; }\n#search { width:100%; padding:14px 18px; font-size:16px; border:2px solid #e5e7eb; border-radius:12px; box-sizing:border-box; transition:border-color .15s; }\n#search:focus { outline:none; border-color:#6366f1; }\nul { list-style:none; padding:0; margin:20px 0 0; display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:8px; }\nli { background:#fff; padding:12px 14px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.06); transition:transform .1s; }\nli:hover { transform:translateY(-2px); }\nli.hidden { display:none; }\n.empty { text-align:center; padding:40px; color:#9ca3af; display:none; }\n.empty.show { display:block; }',
    js: 'function filter() {\n  const q = document.getElementById("search").value.toLowerCase().trim();\n  const items = document.querySelectorAll("#list li");\n  let visible = 0;\n  items.forEach(li => {\n    const match = li.textContent.toLowerCase().includes(q);\n    li.classList.toggle("hidden", !match);\n    if (match) visible++;\n  });\n  document.getElementById("empty").classList.toggle("show", visible === 0);\n}'
  },
  memory: {
    html: '<div class="game">\n  <h2>🧠 Найди пары</h2>\n  <div class="info">Ходов: <span id="moves">0</span> · Совпадений: <span id="matches">0</span>/8</div>\n  <div class="board" id="board"></div>\n  <button onclick="newGame()">🔄 Новая игра</button>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#1e1b4b; font-family:system-ui,sans-serif; padding:20px; }\n.game { text-align:center; color:#fff; }\nh2 { margin:0 0 8px; }\n.info { margin-bottom:16px; opacity:.85; font-size:14px; }\n.board { display:grid; grid-template-columns:repeat(4,70px); gap:8px; justify-content:center; margin-bottom:16px; }\n.card { width:70px; height:70px; background:#6366f1; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:32px; cursor:pointer; user-select:none; transition:transform .2s; }\n.card:hover:not(.flipped):not(.matched) { transform:scale(1.05); }\n.card.flipped, .card.matched { background:#fff; }\n.card:not(.flipped):not(.matched) { color:transparent; }\n.card.matched { background:#10b981; }\nbutton { padding:10px 22px; background:#fbbf24; color:#1e1b4b; border:none; border-radius:8px; font-weight:700; cursor:pointer; }',
    js: 'const emojis = ["🍎","🍌","🍇","🍉","🍊","🥭","🍓","🍑"];\nlet flipped = [], matches = 0, moves = 0, busy = false;\nfunction newGame() {\n  const cards = [...emojis, ...emojis].sort(() => Math.random() - .5);\n  const board = document.getElementById("board");\n  board.innerHTML = "";\n  flipped = []; matches = 0; moves = 0; busy = false;\n  document.getElementById("moves").textContent = 0;\n  document.getElementById("matches").textContent = 0;\n  cards.forEach((emoji, i) => {\n    const card = document.createElement("div");\n    card.className = "card";\n    card.textContent = emoji;\n    card.dataset.emoji = emoji;\n    card.addEventListener("click", () => flip(card));\n    board.appendChild(card);\n  });\n}\nfunction flip(card) {\n  if (busy || card.classList.contains("flipped") || card.classList.contains("matched")) return;\n  card.classList.add("flipped");\n  flipped.push(card);\n  if (flipped.length === 2) {\n    moves++;\n    document.getElementById("moves").textContent = moves;\n    busy = true;\n    if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {\n      flipped.forEach(c => c.classList.add("matched"));\n      matches++;\n      document.getElementById("matches").textContent = matches;\n      flipped = []; busy = false;\n      if (matches === 8) setTimeout(() => alert(`🎉 Победа за ${moves} ходов!`), 300);\n    } else {\n      setTimeout(() => {\n        flipped.forEach(c => c.classList.remove("flipped"));\n        flipped = []; busy = false;\n      }, 800);\n    }\n  }\n}\nnewGame();'
  },
  'palette-gen': {
    html: '<div class="container">\n  <h2>🎨 Случайная палитра</h2>\n  <div class="palette" id="palette"></div>\n  <button onclick="generate()">🎲 Сгенерировать</button>\n  <p class="hint">Кликни на цвет — скопируется HEX</p>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#fafafa; font-family:system-ui,sans-serif; padding:20px; }\n.container { width:100%; max-width:540px; text-align:center; }\nh2 { margin:0 0 24px; }\n.palette { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-bottom:20px; }\n.swatch { aspect-ratio:1; border-radius:12px; cursor:pointer; display:flex; align-items:flex-end; justify-content:center; padding:12px; color:#fff; font-weight:700; font-size:12px; text-shadow:0 1px 3px rgba(0,0,0,.4); transition:transform .15s; }\n.swatch:hover { transform:translateY(-4px) scale(1.03); }\nbutton { padding:12px 28px; background:#1f2937; color:#fff; border:none; border-radius:99px; font-weight:600; cursor:pointer; }\nbutton:hover { background:#111827; }\n.hint { color:#6b7280; font-size:13px; margin-top:12px; }',
    js: 'function generate() {\n  const palette = document.getElementById("palette");\n  palette.innerHTML = "";\n  const baseHue = Math.floor(Math.random() * 360);\n  for (let i = 0; i < 5; i++) {\n    const hue = (baseHue + i * 30) % 360;\n    const sat = 65 + Math.random() * 20;\n    const lit = 45 + i * 6;\n    const hex = hslToHex(hue, sat, lit);\n    const div = document.createElement("div");\n    div.className = "swatch";\n    div.style.background = hex;\n    div.textContent = hex.toUpperCase();\n    div.onclick = () => {\n      navigator.clipboard?.writeText(hex);\n      div.textContent = "✓ Скопирован";\n      setTimeout(() => div.textContent = hex.toUpperCase(), 1000);\n    };\n    palette.appendChild(div);\n  }\n}\nfunction hslToHex(h, s, l) {\n  s /= 100; l /= 100;\n  const a = s * Math.min(l, 1 - l);\n  const f = n => {\n    const k = (n + h / 30) % 12;\n    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));\n    return Math.round(255 * c).toString(16).padStart(2, "0");\n  };\n  return "#" + f(0) + f(8) + f(4);\n}\ngenerate();'
  },
  reaction: {
    html: '<div class="game" id="game" onclick="onClick()">\n  <h2 id="title">⚡ Тест реакции</h2>\n  <p id="msg">Кликни чтобы начать</p>\n  <div class="best" id="best"></div>\n</div>',
    css: 'body { margin:0; }\n.game { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; user-select:none; transition:background .3s; background:#1e293b; color:#fff; font-family:system-ui,sans-serif; padding:20px; text-align:center; }\n.game.waiting { background:#f59e0b; }\n.game.go { background:#10b981; }\n.game.too-soon { background:#ef4444; }\nh2 { margin:0 0 12px; font-size:36px; }\np { margin:0; font-size:24px; }\n.best { margin-top:24px; opacity:.8; font-size:14px; }',
    js: 'let state = "ready";\nlet startTime = 0;\nlet timeoutId = null;\nlet bestTime = parseInt(localStorage.getItem("reactionBest")) || null;\nupdateBest();\nfunction onClick() {\n  const game = document.getElementById("game");\n  const msg = document.getElementById("msg");\n  if (state === "ready" || state === "result" || state === "fail") {\n    state = "waiting";\n    game.className = "game waiting";\n    msg.textContent = "Жди зелёного...";\n    const delay = 1000 + Math.random() * 3000;\n    timeoutId = setTimeout(() => {\n      state = "go";\n      game.className = "game go";\n      msg.textContent = "ЖМИ!";\n      startTime = Date.now();\n    }, delay);\n  } else if (state === "waiting") {\n    clearTimeout(timeoutId);\n    state = "fail";\n    game.className = "game too-soon";\n    msg.textContent = "Слишком рано! Кликни чтобы повторить.";\n  } else if (state === "go") {\n    const time = Date.now() - startTime;\n    state = "result";\n    game.className = "game";\n    msg.textContent = `${time} мс! Кликни ещё раз.`;\n    if (!bestTime || time < bestTime) {\n      bestTime = time;\n      localStorage.setItem("reactionBest", time);\n      updateBest();\n    }\n  }\n}\nfunction updateBest() {\n  document.getElementById("best").textContent = bestTime ? `Лучшее: ${bestTime} мс` : "";\n}'
  },
  parallax: {
    html: '<section class="layer l1"><h1>Скролли вниз</h1></section>\n<section class="layer l2"><h2>Слой 2</h2></section>\n<section class="layer l3"><h2>Слой 3</h2></section>\n<section class="layer l4"><h2>Конец</h2></section>',
    css: 'body { margin:0; font-family:system-ui,sans-serif; }\n.layer { height:100vh; display:flex; align-items:center; justify-content:center; color:#fff; font-size:48px; background-attachment:fixed; background-size:cover; background-position:center; }\n.l1 { background-image:linear-gradient(135deg,rgba(99,102,241,.85),rgba(236,72,153,.85)), url("https://picsum.photos/1200/800?1"); }\n.l2 { background:#0f172a; }\n.l3 { background-image:linear-gradient(135deg,rgba(245,158,11,.85),rgba(239,68,68,.85)), url("https://picsum.photos/1200/800?2"); }\n.l4 { background:#16a34a; }\nh1, h2 { text-align:center; text-shadow:0 4px 16px rgba(0,0,0,.4); margin:0; padding:20px; }',
    js: ''
  },
  marquee: {
    html: '<div class="marquee">\n  <div class="track">\n    <span>HTML</span> <span>·</span>\n    <span>CSS</span> <span>·</span>\n    <span>JavaScript</span> <span>·</span>\n    <span>React</span> <span>·</span>\n    <span>Vue</span> <span>·</span>\n    <span>Node.js</span> <span>·</span>\n    <span>Python</span> <span>·</span>\n    <span>Git</span> <span>·</span>\n    <span>HTML</span> <span>·</span>\n    <span>CSS</span> <span>·</span>\n    <span>JavaScript</span> <span>·</span>\n    <span>React</span> <span>·</span>\n    <span>Vue</span> <span>·</span>\n    <span>Node.js</span> <span>·</span>\n    <span>Python</span> <span>·</span>\n    <span>Git</span>\n  </div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; background:#0f172a; font-family:system-ui,sans-serif; }\n.marquee { width:100%; overflow:hidden; padding:24px 0; mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent); }\n.track { display:flex; gap:24px; animation:scroll 20s linear infinite; white-space:nowrap; }\n.track span { font-size:36px; font-weight:700; color:#6366f1; }\n.track span:nth-child(odd) { color:#fff; }\n@keyframes scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }',
    js: ''
  },
  toast: {
    html: '<div class="container">\n  <h2>Тосты-уведомления</h2>\n  <div class="buttons">\n    <button class="success" onclick="show(\'success\')">✓ Успех</button>\n    <button class="error" onclick="show(\'error\')">✗ Ошибка</button>\n    <button class="warn" onclick="show(\'warn\')">⚠ Предупреждение</button>\n    <button class="info" onclick="show(\'info\')">ℹ Инфо</button>\n  </div>\n</div>\n<div class="toast-wrap" id="toastWrap"></div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f1f5f9; font-family:system-ui,sans-serif; }\n.container { text-align:center; }\nh2 { margin-bottom:24px; }\n.buttons { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }\nbutton { padding:12px 18px; border:none; border-radius:8px; color:#fff; font-weight:600; cursor:pointer; font-size:14px; }\n.success { background:#10b981; }\n.error { background:#ef4444; }\n.warn { background:#f59e0b; }\n.info { background:#3b82f6; }\nbutton:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,.15); }\n.toast-wrap { position:fixed; top:20px; right:20px; display:flex; flex-direction:column; gap:8px; z-index:999; }\n.toast { background:#fff; padding:14px 18px; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.15); display:flex; gap:10px; align-items:center; min-width:240px; animation:slide .3s; border-left:4px solid; }\n.toast.success { border-color:#10b981; }\n.toast.error { border-color:#ef4444; }\n.toast.warn { border-color:#f59e0b; }\n.toast.info { border-color:#3b82f6; }\n@keyframes slide { from{transform:translateX(100%); opacity:0} to{transform:translateX(0); opacity:1} }\n.toast.out { animation:slideOut .3s forwards; }\n@keyframes slideOut { to{transform:translateX(100%); opacity:0} }',
    js: 'const messages = {\n  success: { icon:"✓", text:"Всё прошло отлично!" },\n  error:   { icon:"✗", text:"Что-то пошло не так..." },\n  warn:    { icon:"⚠", text:"Внимание, проверь данные" },\n  info:    { icon:"ℹ", text:"Полезная информация" },\n};\nfunction show(type) {\n  const t = document.createElement("div");\n  t.className = "toast " + type;\n  t.innerHTML = `<span style="font-size:20px">${messages[type].icon}</span><div>${messages[type].text}</div>`;\n  document.getElementById("toastWrap").appendChild(t);\n  setTimeout(() => {\n    t.classList.add("out");\n    setTimeout(() => t.remove(), 300);\n  }, 2500);\n}'
  },
  chat: {
    html: '<div class="chat">\n  <div class="header">💬 Чат с ботом</div>\n  <div class="messages" id="messages">\n    <div class="msg bot">Привет! Я бот. Напиши что-нибудь.</div>\n  </div>\n  <form class="input-row" onsubmit="send(event)">\n    <input type="text" id="input" placeholder="Сообщение..." autofocus>\n    <button type="submit">↑</button>\n  </form>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; font-family:system-ui,sans-serif; padding:10px; }\n.chat { background:#1e293b; width:100%; max-width:380px; height:560px; border-radius:18px; display:flex; flex-direction:column; overflow:hidden; }\n.header { padding:18px; background:#334155; color:#fff; font-weight:700; }\n.messages { flex:1; padding:16px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; }\n.msg { padding:10px 14px; border-radius:14px; max-width:75%; word-wrap:break-word; font-size:14px; }\n.msg.bot { background:#475569; color:#fff; align-self:flex-start; border-bottom-left-radius:4px; }\n.msg.me { background:#6366f1; color:#fff; align-self:flex-end; border-bottom-right-radius:4px; }\n.input-row { display:flex; padding:12px; gap:8px; background:#0f172a; }\n.input-row input { flex:1; padding:10px 14px; border-radius:99px; border:none; background:#334155; color:#fff; font-size:14px; outline:none; }\n.input-row button { width:40px; height:40px; border-radius:50%; border:none; background:#6366f1; color:#fff; font-size:18px; cursor:pointer; }',
    js: 'const replies = ["Интересно...", "Расскажи подробнее", "А почему ты так думаешь?", "🤔", "Хм, не знаю что ответить", "Понятно!", "Согласен с тобой", "Это сложный вопрос"];\nfunction send(e) {\n  e.preventDefault();\n  const inp = document.getElementById("input");\n  const text = inp.value.trim();\n  if (!text) return;\n  add(text, "me");\n  inp.value = "";\n  setTimeout(() => {\n    add(replies[Math.floor(Math.random() * replies.length)], "bot");\n  }, 600 + Math.random() * 800);\n}\nfunction add(text, who) {\n  const div = document.createElement("div");\n  div.className = "msg " + who;\n  div.textContent = text;\n  const m = document.getElementById("messages");\n  m.appendChild(div);\n  m.scrollTop = m.scrollHeight;\n}'
  },
  snake: {
    html: '<div class="game">\n  <h2>🐍 Змейка</h2>\n  <div>Очки: <span id="score">0</span></div>\n  <canvas id="canvas" width="300" height="300"></canvas>\n  <div class="hint">Управляй стрелками или WASD</div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#fff; font-family:system-ui,sans-serif; }\n.game { text-align:center; padding:20px; }\nh2 { margin:0 0 8px; }\ncanvas { border:3px solid #334155; border-radius:8px; margin:12px 0; background:#1e293b; touch-action:none; }\n.hint { font-size:13px; opacity:.7; }',
    js: 'const canvas = document.getElementById("canvas");\nconst ctx = canvas.getContext("2d");\nconst SIZE = 15;\nlet snake = [{x:5,y:5}];\nlet dir = {x:1,y:0};\nlet food = {x:10,y:10};\nlet score = 0;\nfunction draw() {\n  ctx.fillStyle = "#1e293b";\n  ctx.fillRect(0, 0, 300, 300);\n  ctx.fillStyle = "#ef4444";\n  ctx.fillRect(food.x * SIZE + 1, food.y * SIZE + 1, SIZE - 2, SIZE - 2);\n  snake.forEach((s, i) => {\n    ctx.fillStyle = i === 0 ? "#10b981" : "#34d399";\n    ctx.fillRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2);\n  });\n}\nfunction tick() {\n  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };\n  if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) {\n    alert("💀 Конец! Очков: " + score);\n    snake = [{x:5,y:5}]; dir = {x:1,y:0}; score = 0;\n    document.getElementById("score").textContent = 0;\n    return;\n  }\n  snake.unshift(head);\n  if (head.x === food.x && head.y === food.y) {\n    score++;\n    document.getElementById("score").textContent = score;\n    food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };\n  } else {\n    snake.pop();\n  }\n  draw();\n}\ndocument.addEventListener("keydown", e => {\n  const k = e.key.toLowerCase();\n  if ((k === "arrowup" || k === "w") && dir.y === 0) dir = {x:0,y:-1};\n  else if ((k === "arrowdown" || k === "s") && dir.y === 0) dir = {x:0,y:1};\n  else if ((k === "arrowleft" || k === "a") && dir.x === 0) dir = {x:-1,y:0};\n  else if ((k === "arrowright" || k === "d") && dir.x === 0) dir = {x:1,y:0};\n});\nsetInterval(tick, 130);\ndraw();'
  },
  calc: {
    html: '<div class="calc">\n  <div class="screen" id="screen">0</div>\n  <div class="keys">\n    <button class="op" onclick="press(\'C\')">C</button>\n    <button class="op" onclick="press(\'±\')">±</button>\n    <button class="op" onclick="press(\'%\')">%</button>\n    <button class="op active" onclick="press(\'/\')">÷</button>\n    <button onclick="press(\'7\')">7</button>\n    <button onclick="press(\'8\')">8</button>\n    <button onclick="press(\'9\')">9</button>\n    <button class="op active" onclick="press(\'*\')">×</button>\n    <button onclick="press(\'4\')">4</button>\n    <button onclick="press(\'5\')">5</button>\n    <button onclick="press(\'6\')">6</button>\n    <button class="op active" onclick="press(\'-\')">−</button>\n    <button onclick="press(\'1\')">1</button>\n    <button onclick="press(\'2\')">2</button>\n    <button onclick="press(\'3\')">3</button>\n    <button class="op active" onclick="press(\'+\')">+</button>\n    <button class="zero" onclick="press(\'0\')">0</button>\n    <button onclick="press(\'.\')">.</button>\n    <button class="op active" onclick="press(\'=\')">=</button>\n  </div>\n</div>',
    css: 'body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#000; font-family:system-ui,sans-serif; padding:20px; }\n.calc { background:#000; width:300px; }\n.screen { padding:30px 20px; text-align:right; color:#fff; font-size:64px; font-weight:300; min-height:60px; word-break:break-all; line-height:1; overflow:hidden; }\n.keys { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }\nbutton { aspect-ratio:1; border-radius:50%; border:none; font-size:28px; cursor:pointer; background:#333; color:#fff; transition:filter .15s; }\nbutton:hover { filter:brightness(1.2); }\nbutton.op { background:#a5a5a5; color:#000; }\nbutton.op.active { background:#ff9500; color:#fff; }\nbutton.zero { aspect-ratio:auto; grid-column:span 2; border-radius:99px; }',
    js: 'let display = "0";\nlet prev = null;\nlet op = null;\nlet justEvaluated = false;\nfunction press(k) {\n  const screen = document.getElementById("screen");\n  if ("0123456789".includes(k)) {\n    if (display === "0" || justEvaluated) { display = k; justEvaluated = false; }\n    else display += k;\n  } else if (k === ".") {\n    if (!display.includes(".")) display += ".";\n  } else if (k === "C") {\n    display = "0"; prev = null; op = null;\n  } else if (k === "±") {\n    display = display.startsWith("-") ? display.slice(1) : "-" + display;\n  } else if (k === "%") {\n    display = String(parseFloat(display) / 100);\n  } else if ("+-*/".includes(k)) {\n    if (prev !== null && op) display = String(calc(parseFloat(prev), parseFloat(display), op));\n    prev = display; op = k; justEvaluated = true;\n  } else if (k === "=") {\n    if (prev !== null && op) {\n      display = String(calc(parseFloat(prev), parseFloat(display), op));\n      prev = null; op = null; justEvaluated = true;\n    }\n  }\n  screen.textContent = display.length > 9 ? parseFloat(display).toExponential(3) : display;\n}\nfunction calc(a, b, op) {\n  if (op === "+") return a + b;\n  if (op === "-") return a - b;\n  if (op === "*") return a * b;\n  if (op === "/") return b ? a / b : 0;\n}'
  }
,
  semantic: {
    html: `<header class="page-header">
  <div class="logo">🚀 МойСайт</div>
  <nav>
    <a href="#">Главная</a>
    <a href="#">Блог</a>
    <a href="#">Контакты</a>
  </nav>
</header>

<main>
  <section>
    <h2>Свежие статьи</h2>

    <article>
      <h3>Как выучить HTML за неделю</h3>
      <p class="meta">📅 2 мая 2026 · 5 мин чтения</p>
      <p>HTML — язык разметки. Теги говорят браузеру что есть что: вот заголовок, вот картинка, вот ссылка...</p>
      <a href="#">Читать далее →</a>
    </article>

    <article>
      <h3>CSS Flexbox — гайд для новичков</h3>
      <p class="meta">📅 28 апреля 2026 · 8 мин чтения</p>
      <p>Flexbox — главный инструмент верстальщика. Один раз понял — пользуешься всю жизнь...</p>
      <a href="#">Читать далее →</a>
    </article>
  </section>

  <aside>
    <h3>📌 Популярное</h3>
    <ul>
      <li><a href="#">JavaScript за 30 дней</a></li>
      <li><a href="#">Что такое DOM?</a></li>
      <li><a href="#">Top 10 VS Code плагинов</a></li>
    </ul>

    <h3>🏷️ Теги</h3>
    <div class="tags">
      <span>HTML</span><span>CSS</span><span>JS</span>
      <span>React</span><span>Node</span>
    </div>
  </aside>
</main>

<footer class="page-footer">
  <p>© 2026 МойСайт. Все права защищены.</p>
  <p><a href="#">Политика</a> · <a href="#">Контакты</a></p>
</footer>`,
    css: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f8fafc;
  color: #1a1a2e;
  line-height: 1.5;
}

/* HEADER — шапка */
.page-header {
  background: #fff;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  position: sticky;
  top: 0;
  z-index: 10;
}
.logo {
  font-size: 20px;
  font-weight: 700;
  color: #6366f1;
}

/* NAV — меню */
nav {
  display: flex;
  gap: 24px;
}
nav a {
  text-decoration: none;
  color: #475569;
  font-weight: 500;
  transition: color .15s;
}
nav a:hover { color: #6366f1; }

/* MAIN — основной контент */
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 32px;
}
@media (max-width: 720px) {
  main { grid-template-columns: 1fr; }
}

/* SECTION — раздел */
section h2 {
  margin: 0 0 20px;
  font-size: 24px;
}

/* ARTICLE — статья */
article {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  transition: transform .15s, box-shadow .15s;
}
article:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
}
article h3 { margin: 0 0 8px; font-size: 18px; }
article .meta { color: #64748b; font-size: 13px; margin: 0 0 12px; }
article p { margin: 0 0 12px; color: #334155; }
article a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

/* ASIDE — боковая панель */
aside {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
aside h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .5px;
}
aside h3:not(:first-child) { margin-top: 20px; }
aside ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
aside li { margin: 8px 0; }
aside li a {
  color: #1a1a2e;
  text-decoration: none;
  font-size: 14px;
}
aside li a:hover { color: #6366f1; }
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tags span {
  background: #eef2ff;
  color: #4f46e5;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}

/* FOOTER — подвал */
.page-footer {
  background: #1e293b;
  color: #cbd5e1;
  padding: 32px;
  text-align: center;
  margin-top: 32px;
}
.page-footer p { margin: 4px 0; font-size: 14px; }
.page-footer a {
  color: #818cf8;
  text-decoration: none;
}`,
    js: ''
  },
  'tag-header': {
    html: `<header class="demo-header">
  <div class="logo">⚡ Brand</div>
  <nav>
    <a href="#">Главная</a>
    <a href="#">О нас</a>
    <a href="#">Услуги</a>
    <a href="#">Контакты</a>
  </nav>
  <button class="login">Войти</button>
</header>

<main class="info">
  <p><strong>&lt;header&gt;</strong> — шапка сайта или отдельной секции.</p>
  <p>Внутри обычно: логотип, навигация, кнопка входа, поиск.</p>
</main>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; }
.demo-header {
  background: #fff;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.logo { font-size: 22px; font-weight: 700; color: #6366f1; }
nav { display: flex; gap: 20px; flex: 1; }
nav a {
  text-decoration: none;
  color: #475569;
  font-weight: 500;
  transition: color .15s;
}
nav a:hover { color: #6366f1; }
.login {
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.info {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border-left: 4px solid #6366f1;
}
.info p { margin: 8px 0; color: #334155; }`,
    js: ''
  },
  'tag-nav': {
    html: `<nav class="demo-nav">
  <a href="#" class="active">🏠 Главная</a>
  <a href="#">📚 Блог</a>
  <a href="#">🛒 Магазин</a>
  <a href="#">💬 Контакты</a>
  <a href="#">⚙️ Настройки</a>
</nav>

<main class="info">
  <p><strong>&lt;nav&gt;</strong> — навигация (меню сайта).</p>
  <p>Используется для основного меню или, например, списка ссылок в футере.</p>
  <p>Внутри обычно &lt;a&gt; или &lt;ul&gt; со ссылками.</p>
</main>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
.demo-nav {
  display: flex;
  gap: 4px;
  padding: 12px;
  background: #1e293b;
  flex-wrap: wrap;
}
.demo-nav a {
  text-decoration: none;
  color: #94a3b8;
  padding: 10px 16px;
  border-radius: 8px;
  transition: background .15s, color .15s;
  font-weight: 500;
}
.demo-nav a:hover { background: #334155; color: #fff; }
.demo-nav a.active { background: #6366f1; color: #fff; }
.info {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background: #1e293b;
  border-radius: 12px;
  border-left: 4px solid #6366f1;
}
.info p { margin: 8px 0; }`,
    js: ''
  },
  'tag-main': {
    html: `<header class="hdr">Шапка</header>

<main class="content">
  <h1>Это main</h1>
  <p>Тут весь основной контент страницы.</p>
  <p>На странице должен быть только <strong>один &lt;main&gt;</strong>!</p>
  <p>Поисковики и скринридеры используют main, чтобы понять, где главное содержимое страницы.</p>
</main>

<footer class="ftr">Подвал</footer>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; }
.hdr {
  background: #1e293b;
  color: #fff;
  padding: 16px;
  text-align: center;
  font-weight: 600;
}
.content {
  flex: 1;
  background: #fff;
  margin: 24px;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  border: 3px dashed #6366f1;
}
.content h1 { color: #6366f1; margin-top: 0; }
.content p { color: #334155; line-height: 1.6; }
.ftr {
  background: #1e293b;
  color: #fff;
  padding: 16px;
  text-align: center;
  font-weight: 600;
}`,
    js: ''
  },
  'tag-section': {
    html: `<main>
  <section class="about">
    <h2>О нас</h2>
    <p>Мы делаем красивые сайты с 2010 года.</p>
  </section>

  <section class="services">
    <h2>Услуги</h2>
    <p>Дизайн, вёрстка, разработка, поддержка.</p>
  </section>

  <section class="contacts">
    <h2>Контакты</h2>
    <p>email@site.ru · +7 (000) 000-00-00</p>
  </section>
</main>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; padding: 24px; }
main { max-width: 700px; margin: 0 auto; }
section {
  background: #fff;
  margin-bottom: 16px;
  padding: 24px 28px;
  border-radius: 12px;
  border-left: 4px solid;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
section h2 {
  margin: 0 0 8px;
  font-size: 20px;
}
section p {
  margin: 0;
  color: #475569;
  line-height: 1.5;
}
.about { border-left-color: #6366f1; }
.about h2 { color: #6366f1; }
.services { border-left-color: #10b981; }
.services h2 { color: #10b981; }
.contacts { border-left-color: #f97316; }
.contacts h2 { color: #f97316; }`,
    js: ''
  },
  'tag-article': {
    html: `<main>
  <article class="post">
    <h2>Почему важна семантическая вёрстка</h2>
    <p class="meta">👤 Автор: Алекс · 📅 2 мая 2026</p>
    <p>Семантические теги делают код понятнее для разработчиков, поисковиков и скринридеров. Это не модный тренд, а стандарт качества.</p>
    <a href="#">Читать полностью →</a>
  </article>

  <article class="post">
    <h2>Топ-5 ошибок начинающих верстальщиков</h2>
    <p class="meta">👤 Автор: Мария · 📅 28 апреля 2026</p>
    <p>Дивы вместо семантики, отсутствие alt у картинок, &lt;br&gt; для отступов... Разбираем главные косяки.</p>
    <a href="#">Читать полностью →</a>
  </article>

  <article class="post">
    <h2>Что такое CSS Grid и зачем он нужен</h2>
    <p class="meta">👤 Автор: Иван · 📅 25 апреля 2026</p>
    <p>Grid — мощный инструмент для двумерной вёрстки. Когда flexbox мало, на сцену выходит Grid.</p>
    <a href="#">Читать полностью →</a>
  </article>
</main>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f1f5f9; padding: 24px; }
main { max-width: 700px; margin: 0 auto; }
.post {
  background: #fff;
  padding: 24px 28px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  transition: transform .15s, box-shadow .15s;
}
.post:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
}
.post h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1e293b;
}
.meta {
  color: #64748b;
  font-size: 13px;
  margin: 0 0 12px;
}
.post p:not(.meta) {
  color: #334155;
  line-height: 1.5;
  margin: 0 0 12px;
}
.post a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}
.post a:hover { text-decoration: underline; }`,
    js: ''
  },
  'tag-aside': {
    html: `<main>
  <article>
    <h1>Главная статья</h1>
    <p>Это основной контент страницы. Тут самое важное — то, ради чего пользователь зашёл на сайт.</p>
    <p>Может быть длинный текст, картинки, видео — всё, что относится к главной теме страницы.</p>
    <p>А справа — сайдбар (aside) с дополнительной информацией.</p>
  </article>

  <aside>
    <h3>📌 Похожее</h3>
    <ul>
      <li><a href="#">Связанная статья 1</a></li>
      <li><a href="#">Связанная статья 2</a></li>
      <li><a href="#">Связанная статья 3</a></li>
    </ul>

    <h3>🔥 В тренде</h3>
    <ul>
      <li><a href="#">Популярный пост</a></li>
      <li><a href="#">Часто читают</a></li>
    </ul>

    <div class="ad">📣 Реклама или промо</div>
  </aside>
</main>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; padding: 24px; }
main {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 24px;
}
@media (max-width: 720px) {
  main { grid-template-columns: 1fr; }
}
article {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
article h1 { margin: 0 0 16px; color: #6366f1; }
article p { color: #334155; line-height: 1.6; }
aside {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  border-top: 4px solid #f97316;
}
aside h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .5px;
}
aside h3:not(:first-child) { margin-top: 20px; }
aside ul { list-style: none; padding: 0; margin: 0; }
aside li { margin: 8px 0; }
aside a {
  color: #1e293b;
  text-decoration: none;
  font-size: 14px;
}
aside a:hover { color: #6366f1; }
.ad {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f97316, #ec4899);
  color: #fff;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
}`,
    js: ''
  },
  'tag-footer': {
    html: `<main class="content">
  <h1>Тело страницы</h1>
  <p>Прокрути вниз, чтобы увидеть футер ↓</p>
</main>

<footer class="page-footer">
  <div class="cols">
    <div>
      <h4>О компании</h4>
      <p>Делаем сайты с 2010 года. Качественно, в срок, недорого.</p>
    </div>
    <div>
      <h4>Меню</h4>
      <a href="#">Главная</a>
      <a href="#">Услуги</a>
      <a href="#">Цены</a>
      <a href="#">Контакты</a>
    </div>
    <div>
      <h4>Контакты</h4>
      <p>📧 hello@site.ru</p>
      <p>📞 +7 (000) 000-00-00</p>
      <p>📍 Москва, ул. Пример, 1</p>
    </div>
    <div>
      <h4>Соцсети</h4>
      <a href="#">Telegram</a>
      <a href="#">VK</a>
      <a href="#">YouTube</a>
    </div>
  </div>
  <div class="copy">© 2026 МойСайт. Все права защищены.</div>
</footer>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
.content {
  flex: 1;
  padding: 60px 32px;
  text-align: center;
}
.content h1 { color: #6366f1; }
.content p { color: #64748b; }
.page-footer {
  background: #0f172a;
  color: #cbd5e1;
  padding: 48px 32px 24px;
}
.cols {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}
.cols h4 {
  color: #fff;
  margin: 0 0 12px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.cols p { margin: 6px 0; font-size: 14px; }
.cols a {
  display: block;
  color: #cbd5e1;
  text-decoration: none;
  padding: 4px 0;
  font-size: 14px;
  transition: color .15s;
}
.cols a:hover { color: #6366f1; }
.copy {
  max-width: 1100px;
  margin: 32px auto 0;
  padding-top: 20px;
  border-top: 1px solid #334155;
  text-align: center;
  font-size: 13px;
  color: #64748b;
}`,
    js: ''
  }
,
  semantic: {
    html: '<body>\n  <header class="site-header">\n    <div class="logo">🚀 MySite</div>\n    <nav class="main-nav">\n      <a href="#">Главная</a>\n      <a href="#">О нас</a>\n      <a href="#">Услуги</a>\n      <a href="#">Контакты</a>\n    </nav>\n  </header>\n\n  <main class="page">\n    <section class="hero">\n      <h1>Добро пожаловать</h1>\n      <p>Это семантическая разметка страницы.</p>\n    </section>\n\n    <div class="content-row">\n      <section class="articles">\n        <h2>Последние статьи</h2>\n\n        <article class="post">\n          <h3>Что такое HTML?</h3>\n          <p class="meta">📅 2 мая · ✍️ Автор</p>\n          <p>HTML — язык разметки страниц. Им мы говорим браузеру: тут заголовок, тут абзац...</p>\n        </article>\n\n        <article class="post">\n          <h3>Зачем нужна семантика?</h3>\n          <p class="meta">📅 1 мая · ✍️ Автор</p>\n          <p>Поисковики и скринридеры понимают структуру через теги header/main/article...</p>\n        </article>\n      </section>\n\n      <aside class="sidebar">\n        <h3>Категории</h3>\n        <ul>\n          <li>HTML</li>\n          <li>CSS</li>\n          <li>JavaScript</li>\n        </ul>\n        <h3>Реклама</h3>\n        <p class="ad">Купи курс и стань разрабом!</p>\n      </aside>\n    </div>\n  </main>\n\n  <footer class="site-footer">\n    <p>© 2026 MySite · Все права защищены</p>\n    <p class="contacts">📧 hello@site.ru · 📱 +7 (000) 000-00-00</p>\n  </footer>\n</body>',
    css: '* { box-sizing: border-box; }\nbody { margin: 0; font-family: system-ui, sans-serif; background: #f1f5f9; color: #1f2937; }\n\n/* HEADER — шапка */\n.site-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); }\n.logo { font-size: 20px; font-weight: 700; color: #6366f1; }\n.main-nav { display: flex; gap: 20px; }\n.main-nav a { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; }\n.main-nav a:hover { color: #6366f1; }\n\n/* MAIN — основной контент */\n.page { max-width: 1100px; margin: 0 auto; padding: 24px; }\n\n/* SECTION — тематические блоки */\n.hero { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 48px 32px; border-radius: 16px; text-align: center; margin-bottom: 24px; }\n.hero h1 { margin: 0 0 8px; font-size: 32px; }\n.hero p { margin: 0; opacity: .9; }\n\n.content-row { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }\n@media (max-width: 720px) { .content-row { grid-template-columns: 1fr; } }\n\n.articles h2 { margin-top: 0; color: #1f2937; }\n\n/* ARTICLE — самостоятельный блок */\n.post { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }\n.post h3 { margin: 0 0 4px; }\n.meta { font-size: 12px; color: #9ca3af; margin: 0 0 12px; }\n.post p:last-child { margin: 0; line-height: 1.55; color: #4b5563; }\n\n/* ASIDE — боковая панель */\n.sidebar { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.05); height: fit-content; }\n.sidebar h3 { margin: 0 0 12px; font-size: 15px; color: #1f2937; }\n.sidebar ul { list-style: none; padding: 0; margin: 0 0 20px; }\n.sidebar li { padding: 6px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }\n.sidebar li:last-child { border: 0; }\n.ad { background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 13px; margin: 0; }\n\n/* FOOTER — подвал */\n.site-footer { background: #1f2937; color: #d1d5db; text-align: center; padding: 24px; margin-top: 48px; font-size: 14px; }\n.site-footer p { margin: 4px 0; }\n.contacts { color: #9ca3af; font-size: 13px; }',
    js: ''
  },
  'tag-header': {
    html: '<!-- HEADER — шапка сайта: логотип + меню -->\n<header class="site-header">\n  <div class="logo">🚀 MySite</div>\n  <nav>\n    <a href="#">Главная</a>\n    <a href="#">О нас</a>\n    <a href="#">Контакты</a>\n  </nav>\n</header>\n\n<!-- Дальше шёл бы main с контентом -->',
    css: 'body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; }\n\n.site-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 32px;\n  background: #fff;\n  box-shadow: 0 1px 6px rgba(0,0,0,.08);\n}\n.logo { font-size: 22px; font-weight: 700; color: #6366f1; }\nnav { display: flex; gap: 24px; }\nnav a { color: #374151; text-decoration: none; font-weight: 500; padding: 6px 0; transition: color .15s; }\nnav a:hover { color: #6366f1; }',
    js: ''
  },
  'tag-nav': {
    html: '<!-- NAV — навигация: меню сайта -->\n<nav class="primary-nav">\n  <a href="#" class="active">🏠 Главная</a>\n  <a href="#">📰 Блог</a>\n  <a href="#">💼 Услуги</a>\n  <a href="#">📞 Контакты</a>\n</nav>\n\n<!-- NAV может быть и в header, и в footer, и в aside -->\n<nav class="breadcrumbs">\n  <a href="#">Главная</a> ›\n  <a href="#">Каталог</a> ›\n  <span>Товар</span>\n</nav>',
    css: 'body { margin: 0; padding: 32px; font-family: system-ui, sans-serif; background: #f1f5f9; }\n\n.primary-nav {\n  display: flex;\n  gap: 4px;\n  background: #fff;\n  padding: 8px;\n  border-radius: 12px;\n  box-shadow: 0 2px 8px rgba(0,0,0,.06);\n  margin-bottom: 24px;\n}\n.primary-nav a {\n  padding: 10px 18px;\n  border-radius: 8px;\n  color: #4b5563;\n  text-decoration: none;\n  font-weight: 500;\n  transition: background .15s, color .15s;\n}\n.primary-nav a:hover { background: #f3f4f6; }\n.primary-nav a.active { background: #6366f1; color: #fff; }\n\n.breadcrumbs {\n  display: flex;\n  gap: 6px;\n  font-size: 14px;\n  color: #6b7280;\n}\n.breadcrumbs a { color: #6366f1; text-decoration: none; }\n.breadcrumbs span { color: #1f2937; font-weight: 600; }',
    js: ''
  },
  'tag-main': {
    html: '<!-- MAIN — главный контент страницы. ОДИН на странице! -->\n<main class="page">\n  <h1>Заголовок страницы</h1>\n  <p class="lead">Это самый важный текст на странице — то, ради чего пользователь сюда зашёл.</p>\n\n  <p>Внутри <code>&lt;main&gt;</code> размещается основной контент: статьи, секции, формы, что угодно — кроме шапки, навигации, сайдбара и футера.</p>\n\n  <p>На странице должен быть <strong>только один &lt;main&gt;</strong>. Это правило стандарта HTML.</p>\n</main>',
    css: 'body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; color: #1f2937; }\n\n.page {\n  max-width: 720px;\n  margin: 0 auto;\n  padding: 48px 24px;\n  line-height: 1.7;\n}\nh1 { font-size: 36px; margin: 0 0 16px; }\n.lead { font-size: 18px; color: #4b5563; margin-bottom: 24px; }\np { margin: 16px 0; }\ncode { background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-size: .9em; }',
    js: ''
  },
  'tag-section': {
    html: '<!-- SECTION — тематический раздел с заголовком -->\n<section class="features">\n  <h2>Преимущества</h2>\n  <p>Здесь рассказываем, почему выбирают нас.</p>\n  <ul>\n    <li>⚡ Быстро</li>\n    <li>💎 Качественно</li>\n    <li>💰 Недорого</li>\n  </ul>\n</section>\n\n<section class="reviews">\n  <h2>Отзывы</h2>\n  <p>Здесь будут карточки с отзывами клиентов.</p>\n</section>\n\n<section class="contact">\n  <h2>Свяжитесь с нами</h2>\n  <p>Здесь форма обратной связи.</p>\n</section>',
    css: 'body { margin: 0; font-family: system-ui, sans-serif; background: #f1f5f9; padding: 32px; }\n\nsection {\n  background: #fff;\n  border-radius: 14px;\n  padding: 28px 32px;\n  margin: 0 auto 20px;\n  max-width: 640px;\n  box-shadow: 0 2px 10px rgba(0,0,0,.06);\n  border-left: 4px solid #6366f1;\n}\nsection h2 { margin: 0 0 12px; color: #1f2937; }\nsection p { color: #4b5563; line-height: 1.6; margin: 0 0 12px; }\nsection ul { margin: 12px 0 0; padding-left: 0; list-style: none; }\nsection li { padding: 6px 0; font-size: 15px; }',
    js: ''
  },
  'tag-article': {
    html: '<!-- ARTICLE — самостоятельный блок (статья, пост) -->\n<!-- Можно вынуть из страницы и опубликовать отдельно -->\n<article class="post">\n  <header class="post-head">\n    <h2>Как я выучил CSS за месяц</h2>\n    <p class="meta">📅 2 мая 2026 · ✍️ Алекс · ⏱️ 5 мин</p>\n  </header>\n\n  <p class="lead">Расскажу про путь от нуля до уверенной вёрстки.</p>\n  <p>Главное — практика. Я делал по одной мини-странице в день и через неделю заметил прогресс...</p>\n\n  <footer class="post-foot">\n    <span class="tag">#html</span>\n    <span class="tag">#css</span>\n    <span class="tag">#обучение</span>\n  </footer>\n</article>',
    css: 'body { margin: 0; font-family: Georgia, serif; background: #fafaf9; padding: 32px; color: #1f2937; }\n\n.post {\n  background: #fff;\n  max-width: 640px;\n  margin: 0 auto;\n  padding: 36px 40px;\n  border-radius: 8px;\n  box-shadow: 0 4px 20px rgba(0,0,0,.06);\n}\n.post-head h2 { margin: 0 0 6px; font-size: 28px; }\n.meta { font-size: 13px; color: #9ca3af; margin: 0 0 24px; font-family: system-ui, sans-serif; }\n.lead { font-size: 18px; color: #374151; font-style: italic; }\n.post p { line-height: 1.75; margin: 16px 0; }\n.post-foot { display: flex; gap: 8px; margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; }\n.tag { background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; font-family: system-ui, sans-serif; }',
    js: ''
  },
  'tag-aside': {
    html: '<!-- ASIDE — боковая панель: дополнение к контенту -->\n<div class="layout">\n  <main>\n    <h1>Главная статья</h1>\n    <p>Это основной текст страницы. Здесь много букв и важная информация...</p>\n    <p>А сбоку у нас — &lt;aside&gt; с дополнительной полезностью.</p>\n  </main>\n\n  <aside>\n    <h3>📌 Похожие статьи</h3>\n    <ul>\n      <li><a href="#">Что такое HTML</a></li>\n      <li><a href="#">Как учить CSS</a></li>\n      <li><a href="#">JS для новичков</a></li>\n    </ul>\n\n    <h3>💌 Подписаться</h3>\n    <p>Получай новые статьи каждую неделю.</p>\n    <input type="email" placeholder="Email">\n  </aside>\n</div>',
    css: 'body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; padding: 24px; color: #1f2937; }\n\n.layout {\n  display: grid;\n  grid-template-columns: 2fr 1fr;\n  gap: 24px;\n  max-width: 1000px;\n  margin: 0 auto;\n}\n@media (max-width: 720px) { .layout { grid-template-columns: 1fr; } }\n\nmain {\n  background: #fff;\n  padding: 28px;\n  border-radius: 12px;\n  box-shadow: 0 1px 4px rgba(0,0,0,.06);\n}\nmain h1 { margin-top: 0; }\nmain p { line-height: 1.65; color: #4b5563; }\n\naside {\n  background: #f3f4f6;\n  padding: 20px;\n  border-radius: 12px;\n  border-left: 3px solid #6366f1;\n  height: fit-content;\n}\naside h3 { font-size: 14px; text-transform: uppercase; letter-spacing: .5px; margin: 0 0 10px; color: #4b5563; }\naside h3:not(:first-child) { margin-top: 20px; }\naside ul { list-style: none; padding: 0; margin: 0; }\naside li { padding: 4px 0; font-size: 14px; }\naside a { color: #6366f1; text-decoration: none; }\naside a:hover { text-decoration: underline; }\naside p { font-size: 13px; color: #6b7280; line-height: 1.5; }\naside input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; }',
    js: ''
  },
  'tag-footer': {
    html: '<!-- FOOTER — подвал: копирайт, контакты, ссылки -->\n<footer class="site-footer">\n  <div class="cols">\n    <div>\n      <h4>О компании</h4>\n      <p>Мы делаем сайты с 2020 года. Простые цены, понятные сроки.</p>\n    </div>\n    <div>\n      <h4>Контакты</h4>\n      <p>📧 hello@site.ru</p>\n      <p>📱 +7 (000) 000-00-00</p>\n    </div>\n    <div>\n      <h4>Соцсети</h4>\n      <a href="#">Telegram</a>\n      <a href="#">VK</a>\n      <a href="#">Instagram</a>\n    </div>\n  </div>\n  <div class="copy">© 2026 MySite. Все права защищены.</div>\n</footer>',
    css: 'body { margin: 0; font-family: system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }\nbody::before { content: ""; flex: 1; background: #f1f5f9; }\n\n.site-footer {\n  background: #0f172a;\n  color: #cbd5e1;\n  padding: 40px 24px 20px;\n}\n.cols {\n  max-width: 1000px;\n  margin: 0 auto;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 32px;\n  margin-bottom: 28px;\n}\n.cols h4 {\n  color: #fff;\n  font-size: 14px;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n  margin: 0 0 12px;\n}\n.cols p { margin: 6px 0; line-height: 1.5; font-size: 14px; }\n.cols a { display: block; color: #cbd5e1; text-decoration: none; padding: 4px 0; transition: color .15s; }\n.cols a:hover { color: #6366f1; }\n.copy {\n  max-width: 1000px;\n  margin: 0 auto;\n  text-align: center;\n  padding-top: 20px;\n  border-top: 1px solid #334155;\n  font-size: 13px;\n  color: #64748b;\n}',
    js: ''
  }
};

let pgRunTimer = null;

let pgFiles = [];           // [{name, content}]
let pgActiveFile = null;
const PG_MAX_FILES = 20;

function pgFileType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'css') return 'css';
  if (ext === 'js')  return 'js';
  return 'txt';
}

function pgFindFile(name) {
  return pgFiles.find(f => f.name === name);
}

function pgRenderTabs() {
  const tabs = document.getElementById('pgTabs');
  if (!tabs) return;
  // Clear all file tabs (this container holds ONLY file tabs now)
  tabs.innerHTML = '';
  pgFiles.forEach(f => {
    const ext = pgFileType(f.name);
    const btn = document.createElement('button');
    btn.className = 'pg-tab-file' + (f.name === pgActiveFile ? ' active' : '');
    btn.onclick = (e) => {
      if (e.target.classList.contains('close')) return;
      pgSwitchFile(f.name);
    };
    btn.ondblclick = () => pgRenameFile(f.name);
    btn.innerHTML = `
      <span class="ext ${ext}">${ext}</span>
      <span class="name" title="${f.name}">${f.name.replace(/\.(html?|css|js)$/i, '')}</span>
      <button class="close" onclick="event.stopPropagation();pgRemoveFile('${f.name.replace(/'/g,"\\'")}')" title="Удалить">×</button>
    `;
    tabs.appendChild(btn);
  });
  // Auto-scroll to active tab
  const active = tabs.querySelector('.pg-tab-file.active');
  if (active && active.scrollIntoView) {
    active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
  pgUpdateEntrySelect();
}

function pgUpdateEntrySelect() {
  const sel = document.getElementById('pgEntrySelect');
  if (!sel) return;
  const htmls = pgFiles.filter(f => pgFileType(f.name) === 'html');
  const prev = sel.value;
  sel.innerHTML = '';
  htmls.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.name; opt.textContent = f.name;
    sel.appendChild(opt);
  });
  if (htmls.length > 1) {
    sel.style.display = '';
    if (prev && htmls.find(f => f.name === prev)) sel.value = prev;
    else sel.value = htmls[0].name;
  } else {
    sel.style.display = 'none';
  }
}

function pgSwitchFile(name) {
  // Save current
  if (pgActiveFile) {
    const f = pgFindFile(pgActiveFile);
    if (f) f.content = document.getElementById('pg-editor').value;
  }
  pgActiveFile = name;
  const f = pgFindFile(name);
  const editor = document.getElementById('pg-editor');
  editor.value = f ? f.content : '';
  // Set placeholder based on type
  const t = pgFileType(name);
  editor.placeholder = t === 'html' ? '<!-- HTML -->' : t === 'css' ? '/* CSS */' : t === 'js' ? '// JavaScript' : '';
  pgRenderTabs();
}

function pgOnEdit() {
  const f = pgFindFile(pgActiveFile);
  if (f) f.content = document.getElementById('pg-editor').value;
  scheduleRun();
}

function pgAddFile() {
  if (pgFiles.length >= PG_MAX_FILES) {
    alert(`Максимум ${PG_MAX_FILES} файлов`);
    return;
  }
  let name = prompt('Имя нового файла (например: page2.html, app.js, style.css)', 'page' + (pgFiles.filter(f => pgFileType(f.name) === 'html').length + 1) + '.html');
  if (!name) return;
  name = name.trim();
  if (!name) return;
  // Add extension if missing
  if (!/\.[a-z]+$/i.test(name)) name += '.html';
  // Check duplicates
  if (pgFindFile(name)) {
    alert('Файл с таким именем уже есть');
    return;
  }
  // Default template by type
  const t = pgFileType(name);
  let content = '';
  if (t === 'html') {
    content = '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>' + name + '</title>\n  \n</head>\n<body>\n  <h1>' + name + '</h1>\n  <a href="index.html">← Назад</a>\n  </scr' + 'ipt>\n</body>\n</html>';
  } else if (t === 'css') {
    content = '/* ' + name + ' */\nbody {\n  font-family: sans-serif;\n}\n';
  } else if (t === 'js') {
    content = '// ' + name + '\nconsole.log("' + name + ' загружен");\n';
  }
  pgFiles.push({ name, content });
  pgSwitchFile(name);
  scheduleRun();
}

function pgRemoveFile(name) {
  if (pgFiles.length <= 1) {
    alert('Должен быть хотя бы один файл');
    return;
  }
  if (!confirm('Удалить файл "' + name + '"?')) return;
  pgFiles = pgFiles.filter(f => f.name !== name);
  if (pgActiveFile === name) {
    pgActiveFile = pgFiles[0].name;
  }
  pgSwitchFile(pgActiveFile);
  scheduleRun();
}

function pgRenameFile(oldName) {
  const newName = prompt('Новое имя:', oldName);
  if (!newName || newName === oldName) return;
  const trimmed = newName.trim();
  if (pgFindFile(trimmed)) { alert('Имя занято'); return; }
  const f = pgFindFile(oldName);
  if (f) f.name = trimmed;
  if (pgActiveFile === oldName) pgActiveFile = trimmed;
  pgRenderTabs();
  scheduleRun();
}

// === Build a single HTML doc from files (with cross-file linking via blob URLs) ===
function pgBuildEntryDoc(entryName) {
  const entry = pgFindFile(entryName);
  if (!entry) return '';

  const cssFiles  = pgFiles.filter(f => pgFileType(f.name) === 'css');
  const jsFiles   = pgFiles.filter(f => pgFileType(f.name) === 'js');
  const htmlFiles = pgFiles.filter(f => pgFileType(f.name) === 'html');
  const htmlNames = htmlFiles.map(f => f.name);

  // Use real DOM parser so we don't break on weird HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(entry.content, 'text/html');

  // A sandboxed srcdoc inherits a file:// base URL and Chrome blocks relative navigation.
  if (location.protocol === 'file:') {
    doc.querySelectorAll('link[rel~="manifest"]').forEach(link => link.remove());
    if (!doc.querySelector('base')) {
      const base = doc.createElement('base');
      base.setAttribute('href', 'about:blank');
      (doc.head || doc.documentElement).prepend(base);
    }
  }

  // 1) Replace <link href="X.css"> with <style>...</style>
  doc.querySelectorAll('link[href]').forEach(link => {
    const href = (link.getAttribute('href') || '').replace(/^\.?\//, '').split(/[?#]/)[0];
    const cssFile = cssFiles.find(f => f.name === href);
    if (cssFile) {
      const style = doc.createElement('style');
      style.textContent = cssFile.content;
      link.parentNode.replaceChild(style, link);
    }
  });

  // 2) Replace <script src="X.js"> with inline <script>
  doc.querySelectorAll('script[src]').forEach(scr => {
    const src = (scr.getAttribute('src') || '').replace(/^\.?\//, '').split(/[?#]/)[0];
    const jsFile = jsFiles.find(f => f.name === src);
    if (jsFile) {
      const newScr = doc.createElement('script');
      Array.from(scr.attributes).forEach(attribute => {
        if (!['src', 'integrity', 'crossorigin'].includes(attribute.name)) {
          newScr.setAttribute(attribute.name, attribute.value);
        }
      });
      newScr.textContent = jsFile.content;
      if (scr.hasAttribute('defer') && (scr.getAttribute('type') || '').toLowerCase() !== 'module') {
        newScr.removeAttribute('defer');
        scr.remove();
        (doc.body || doc.documentElement).appendChild(newScr);
      } else {
        scr.parentNode.replaceChild(newScr, scr);
      }
    }
  });

  // 3) Rewrite <a href="X.html"> → data-pgnav (so we can intercept clicks)
  doc.querySelectorAll('a[href]').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/^\.?\//, '').split(/[?#]/)[0];
    if (htmlNames.indexOf(href) !== -1) {
      a.setAttribute('data-pgnav', href);
      a.setAttribute('href', '#');
    }
  });

  // 4) Inject navigation bridge as the FIRST script in <head>
  const namesJson = JSON.stringify(htmlNames);
  const bridge = doc.createElement('script');
  bridge.textContent =
    '(function(){\n' +
    '  var pgHtmlFiles = ' + namesJson + ';\n' +
    '  function pgNavTo(url) {\n' +
    '    if (typeof url !== "string") return false;\n' +
    '    var clean = url.replace(/^\\.?\\//, "").split(/[?#]/)[0];\n' +
    '    if (pgHtmlFiles.indexOf(clean) !== -1) {\n' +
    '      window.parent.postMessage({ type: "pgNavigate", file: clean }, "*");\n' +
    '      return true;\n' +
    '    }\n' +
    '    return false;\n' +
    '  }\n' +
    '  document.addEventListener("click", function(e) {\n' +
    '    var a = e.target.closest("a, [data-pgnav]");\n' +
    '    if (!a) return;\n' +
    '    var nav = a.getAttribute("data-pgnav");\n' +
    '    if (nav) { e.preventDefault(); pgNavTo(nav); return; }\n' +
    '    var href = a.getAttribute("href");\n' +
    '    if (href && pgNavTo(href)) e.preventDefault();\n' +
    '  }, true);\n' +
    '  document.addEventListener("submit", function(e) {\n' +
    '    setTimeout(function() { if (!e.defaultPrevented) e.preventDefault(); }, 0);\n' +
    '  }, true);\n' +
    '  try {\n' +
    '    var oa = window.location.assign.bind(window.location);\n' +
    '    window.location.assign = function(u) { if (pgNavTo(u)) return; return oa(u); };\n' +
    '    var orp = window.location.replace.bind(window.location);\n' +
    '    window.location.replace = function(u) { if (pgNavTo(u)) return; return orp(u); };\n' +
    '  } catch(e) {}\n' +
    '})();';
  // Insert as the first child of <head>; if no <head>, create one
  let head = doc.querySelector('head');
  if (!head) {
    head = doc.createElement('head');
    if (doc.documentElement) doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
    else doc.appendChild(head);
  }
  head.insertBefore(bridge, head.firstChild);

  // Serialize back to HTML string
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}

function runPlayground() {
  // Save current edit state
  if (pgActiveFile) {
    const f = pgFindFile(pgActiveFile);
    if (f) f.content = document.getElementById('pg-editor').value;
  }
  // Pick entry HTML
  const sel = document.getElementById('pgEntrySelect');
  let entryName = sel && sel.value;
  if (!entryName) {
    const firstHtml = pgFiles.find(f => pgFileType(f.name) === 'html');
    if (firstHtml) entryName = firstHtml.name;
  }
  if (!entryName) {
    document.getElementById('pg-iframe').srcdoc = '';
    return;
  }
  const doc = pgBuildEntryDoc(entryName);
  document.getElementById('pg-iframe').srcdoc = doc;
}

// Receive nav messages from iframe
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'pgNavigate' && e.data.file) {
    const sel = document.getElementById('pgEntrySelect');
    if (sel && pgFindFile(e.data.file)) {
      sel.value = e.data.file;
      runPlayground();
    }
  }
});

function scheduleRun() {
  clearTimeout(pgRunTimer);
  pgRunTimer = setTimeout(runPlayground, 600);
}

function openInNewTab() {
  const sel = document.getElementById('pgEntrySelect');
  let entryName = sel && sel.value;
  if (!entryName) {
    const firstHtml = pgFiles.find(f => pgFileType(f.name) === 'html');
    if (firstHtml) entryName = firstHtml.name;
  }
  if (!entryName) return;
  const doc = pgBuildEntryDoc(entryName);
  const w = window.open('', '_blank');
  w.document.write(doc);
  w.document.close();
}

// Replace old loadTemplate to populate file system from PG_TEMPLATES
function loadTemplate(name) {
  const t = PG_TEMPLATES[name];
  if (!t) return;

  // Build index.html — wrap fragment if needed, with proper <link> and <script src>
  const isFullDoc = /<!DOCTYPE/i.test(t.html) && /<html/i.test(t.html);
  const hasCSS = t.css && t.css.trim();
  const hasJS  = t.js  && t.js.trim();

  let indexContent;
  if (isFullDoc) {
    // Full document — inject <link> into <head> and <script src> before </body>
    indexContent = t.html;
    if (hasCSS) {
      const linkTag = '<link rel="stylesheet" href="style.css">';
      if (/<\/head>/i.test(indexContent)) {
        indexContent = indexContent.replace(/<\/head>/i, '  ' + linkTag + '\n</head>');
      } else if (/<head[^>]*>/i.test(indexContent)) {
        indexContent = indexContent.replace(/(<head[^>]*>)/i, '$1\n  ' + linkTag);
      }
    }
    if (hasJS) {
      const scriptTag = '<scr' + 'ipt src="script.js"></scr' + 'ipt>';
      if (/<\/body>/i.test(indexContent)) {
        indexContent = indexContent.replace(/<\/body>/i, '  ' + scriptTag + '\n</body>');
      } else {
        indexContent = indexContent + '\n' + scriptTag;
      }
    }
  } else {
    // Fragment — wrap in skeleton with link and script tags
    indexContent  = '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Превью</title>\n';
    if (hasCSS) indexContent += '  <link rel="stylesheet" href="style.css">\n';
    indexContent += '</head>\n<body>\n' + t.html + '\n';
    if (hasJS)  indexContent += '  <scr' + 'ipt src="script.js"></scr' + 'ipt>\n';
    indexContent += '</body>\n</html>';
  }

  // Build files list — index always, plus style.css/script.js if present
  // Reset pgActiveFile FIRST so pgSwitchFile doesn't try to save editor content into the new files
  pgActiveFile = null;
  pgFiles = [{ name: 'index.html', content: indexContent }];
  if (hasCSS) pgFiles.push({ name: 'style.css', content: t.css });
  if (hasJS)  pgFiles.push({ name: 'script.js', content: t.js  });

  pgSwitchFile('index.html');
  runPlayground();
}

// Legacy compatibility: switchPgTab no longer used, but keep stub
function switchPgTab() { /* no-op, replaced by file tabs */ }

// Initialize with default file set
function pgInitDefault() {
  if (pgFiles.length === 0) {
    pgFiles = [
      { name: 'index.html', content: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Главная</title>\n  \n</head>\n<body>\n  <h1>Привет!</h1>\n  <p>Добро пожаловать. <a href="page2.html">На вторую страницу</a></p>\n  </scr' + 'ipt>\n</body>\n</html>' },
      { name: 'page2.html', content: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Вторая</title>\n  \n</head>\n<body>\n  <h1>Вторая страница</h1>\n  <a href="index.html">← На главную</a>\n</body>\n</html>' },
      { name: 'style.css', content: 'body {\n  font-family: system-ui, sans-serif;\n  padding: 32px;\n  background: #f8fafc;\n  color: #1f2937;\n}\nh1 { color: #6366f1; }\na { color: #6366f1; text-decoration: none; }\na:hover { text-decoration: underline; }' },
      { name: 'script.js', content: 'console.log("Загружен!");' },
    ];
    pgActiveFile = 'index.html';
    pgSwitchFile('index.html');
    if (document.getElementById('sec-playground')?.classList.contains('active')) runPlayground();
  }
}

// Init when section first becomes visible
document.addEventListener('DOMContentLoaded', function() {
  pgInitDefault();
});



// ===== EMMET-LIKE TAB COMPLETION =====
const EMMET_HTML = {
  '!':        '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>|</title>\n</head>\n<body>\n  \n</body>\n</html>',
  'html:5':   '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>|</title>\n</head>\n<body>\n  \n</body>\n</html>',
  'div':      '<div>|</div>',
  'p':        '<p>|</p>',
  'span':     '<span>|</span>',
  'a':        '<a href="|"></a>',
  'img':      '<img src="|" alt="">',
  'input':    '<input type="text" placeholder="|">',
  'button':   '<button>|</button>',
  'ul':       '<ul>\n  <li>|</li>\n</ul>',
  'ol':       '<ol>\n  <li>|</li>\n</ol>',
  'li':       '<li>|</li>',
  'h1':       '<h1>|</h1>',
  'h2':       '<h2>|</h2>',
  'h3':       '<h3>|</h3>',
  'h4':       '<h4>|</h4>',
  'h5':       '<h5>|</h5>',
  'h6':       '<h6>|</h6>',
  'form':     '<form action="|" method="post">\n  \n</form>',
  'table':    '<table>\n  <tr>\n    <td>|</td>\n  </tr>\n</table>',
  'tr':       '<tr>\n  <td>|</td>\n</tr>',
  'td':       '<td>|</td>',
  'th':       '<th>|</th>',
  'section':  '<section>\n  |\n</section>',
  'header':   '<header>\n  |\n</header>',
  'footer':   '<footer>\n  |\n</footer>',
  'nav':      '<nav>\n  |\n</nav>',
  'main':     '<main>\n  |\n</main>',
  'article':  '<article>\n  |\n</article>',
  'aside':    '<aside>\n  |\n</aside>',
  'label':    '<label for="|"></label>',
  'select':   '<select>\n  <option value="|"></option>\n</select>',
  'option':   '<option value="|"></option>',
  'textarea': '<textarea rows="4" placeholder="|"></textarea>',
  'script':   '<script>\n  |\n<\/script>',
  'style':    '<style>\n  |\n</style>',
  'link':     '<link rel="stylesheet" href="|">',
  'meta':     '<meta name="|" content="">',
  'br':       '<br>',
  'hr':       '<hr>',
  'strong':   '<strong>|</strong>',
  'em':       '<em>|</em>',
  'code':     '<code>|</code>',
  'pre':      '<pre>|</pre>',
  'video':    '<video src="|" controls></video>',
  'audio':    '<audio src="|" controls></audio>',
  'iframe':   '<iframe src="|" frameborder="0"></iframe>',
  'canvas':   '<canvas id="|" width="400" height="300"></canvas>',
};

const EMMET_CSS = {
  // Display
  'df':       'display: flex;|',
  'dg':       'display: grid;|',
  'db':       'display: block;|',
  'di':       'display: inline;|',
  'dib':      'display: inline-block;|',
  'dn':       'display: none;|',
  // Position
  'pos':      'position: |;',
  'posa':     'position: absolute;|',
  'posr':     'position: relative;|',
  'posf':     'position: fixed;|',
  'poss':     'position: sticky;|',
  // Box
  'w':        'width: |;',
  'h':        'height: |;',
  'wf':       'width: 100%;|',
  'hf':       'height: 100%;|',
  'mw':       'max-width: |;',
  'mh':       'max-height: |;',
  // Margin / Padding
  'm':        'margin: |;',
  'ma':       'margin: auto;|',
  'mt':       'margin-top: |;',
  'mb':       'margin-bottom: |;',
  'ml':       'margin-left: |;',
  'mr':       'margin-right: |;',
  'mx':       'margin: 0 |;',
  'p':        'padding: |;',
  'pt':       'padding-top: |;',
  'pb':       'padding-bottom: |;',
  'pl':       'padding-left: |;',
  'pr':       'padding-right: |;',
  // Flexbox
  'jc':       'justify-content: |;',
  'ai':       'align-items: |;',
  'jcc':      'justify-content: center;|',
  'aic':      'align-items: center;|',
  'fw':       'flex-wrap: wrap;|',
  'fdc':      'flex-direction: column;|',
  'gap':      'gap: |;',
  // Typography
  'fs':       'font-size: |;',
  'fz':       'font-size: |;',
  'fwb':      'font-weight: bold;|',
  'fw7':      'font-weight: 700;|',
  'lh':       'line-height: |;',
  'ta':       'text-align: |;',
  'tac':      'text-align: center;|',
  'tal':      'text-align: left;|',
  'tar':      'text-align: right;|',
  'td':       'text-decoration: |;',
  'tdn':      'text-decoration: none;|',
  'tt':       'text-transform: |;',
  'ttu':      'text-transform: uppercase;|',
  // Colors
  'c':        'color: |;',
  'bg':       'background: |;',
  'bgc':      'background-color: |;',
  'op':       'opacity: |;',
  // Border
  'b':        'border: |;',
  'bn':       'border: none;|',
  'br':       'border-radius: |;',
  'br50':     'border-radius: 50%;|',
  // Effects
  'bs':       'box-shadow: |;',
  'ts':       'text-shadow: |;',
  'tr':       'transition: |;',
  'tra':      'transition: all 0.3s ease;|',
  'cur':      'cursor: |;',
  'curp':     'cursor: pointer;|',
  // Overflow
  'ov':       'overflow: |;',
  'ovh':      'overflow: hidden;|',
  'z':        'z-index: |;',
};

const EMMET_JS = {
  // Console
  'cl':       'console.log(|);',
  'ce':       'console.error(|);',
  'cw':       'console.warn(|);',
  // Variables
  'co':       'const | = ;',
  'le':       'let | = ;',
  // Functions
  'fn':       'function |(params) {\n  \n}',
  'afn':      'const | = () => {\n  \n};',
  'iife':     '(function() {\n  |\n})();',
  // DOM
  'qs':       'document.querySelector(\'|\');',
  'qsa':      'document.querySelectorAll(\'|\');',
  'gid':      'document.getElementById(\'|\');',
  'adel':     'addEventListener(\'|\', function(e) {\n  \n});',
  'cel':      'document.createElement(\'|\');',
  // Control flow
  'if':       'if (|) {\n  \n}',
  'ife':      'if (|) {\n  \n} else {\n  \n}',
  'for':      'for (let i = 0; i < |; i++) {\n  \n}',
  'forin':    'for (const key in |) {\n  \n}',
  'forof':    'for (const item of |) {\n  \n}',
  'wh':       'while (|) {\n  \n}',
  'sw':       'switch (|) {\n  case :\n    break;\n  default:\n    break;\n}',
  'try':      'try {\n  |\n} catch (err) {\n  console.error(err);\n}',
  // Array methods
  'fe':       '.forEach((item) => {\n  |\n});',
  'map':      '.map((item) => |);',
  'fil':      '.filter((item) => |);',
  'red':      '.reduce((acc, item) => {\n  |\n  return acc;\n}, 0);',
  'find':     '.find((item) => |);',
  // Async
  'pr':       'new Promise((resolve, reject) => {\n  |\n});',
  'asfn':     'async function |(params) {\n  \n}',
  'aw':       'await |;',
  'fetch':    'fetch(\'|\')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));',
  // Other
  'imp':      'import | from \'\';',
  'exp':      'export default |;',
  'ret':      'return |;',
  'st':       'setTimeout(() => {\n  |\n}, 1000);',
  'si':       'setInterval(() => {\n  |\n}, 1000);',
  'ls':       'localStorage.getItem(\'|\');',
  'lss':      'localStorage.setItem(\'|\', value);',
  'jp':       'JSON.parse(|);',
  'js':       'JSON.stringify(|);',
};

function getActivePgLang() {
  // Определяем язык по активному файлу в playground (pgActiveFile + pgFileType),
  // а не по старому несуществующему классу .pg-tab
  if (typeof pgActiveFile !== 'undefined' && pgActiveFile && typeof pgFileType === 'function') {
    const t = pgFileType(pgActiveFile);
    if (t === 'html' || t === 'css' || t === 'js') return t;
  }
  return 'html';
}

function insertSnippet(ta, snippet) {
  const cursorPos = snippet.indexOf('|');
  const text = snippet.replace('|', '');
  const start = ta.selectionStart;
  const before = ta.value.substring(0, start);
  const after = ta.value.substring(ta.selectionEnd);
  ta.value = before + text + after;
  const pos = start + (cursorPos === -1 ? text.length : cursorPos);
  ta.selectionStart = ta.selectionEnd = pos;
  ta.focus();
  scheduleRun();
}

function getWordBefore(ta) {
  const pos = ta.selectionStart;
  const text = ta.value.substring(0, pos);
  const match = text.match(/[\w:!]+$/);
  return match ? match[0] : '';
}

// ===== VS CODE AUTOCOMPLETE ENGINE =====
const acState = { items: [], selectedIdx: -1, visible: false };

function getAcDropdown() {
  let el = document.getElementById('pg-autocomplete');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pg-autocomplete';
    el.className = 'pg-autocomplete';
    document.body.appendChild(el);
    el.addEventListener('mousedown', (e) => {
      const item = e.target.closest('.pg-ac-item[data-idx]');
      if (item) {
        e.preventDefault();
        applyAcSuggestion(parseInt(item.dataset.idx));
      }
    });
  }
  return el;
}

function getCaretCoords(ta) {
  const mirror = document.createElement('div');
  const s = window.getComputedStyle(ta);
  ['fontFamily','fontSize','fontWeight','fontStyle','letterSpacing',
   'lineHeight','textTransform','paddingTop','paddingRight',
   'paddingBottom','paddingLeft','borderTopWidth','borderRightWidth',
   'borderBottomWidth','borderLeftWidth','tabSize','wordBreak'].forEach(p => {
    mirror.style[p] = s[p];
  });
  mirror.style.cssText += `
    position:absolute;top:-9999px;left:-9999px;overflow:hidden;visibility:hidden;
    width:${ta.clientWidth}px;white-space:pre-wrap;word-wrap:break-word;box-sizing:border-box;
  `;
  mirror.textContent = ta.value.substring(0, ta.selectionStart);
  const caret = document.createElement('span');
  caret.textContent = '\u200b';
  mirror.appendChild(caret);
  document.body.appendChild(mirror);
  const taR = ta.getBoundingClientRect();
  const mR  = mirror.getBoundingClientRect();
  const cR  = caret.getBoundingClientRect();
  document.body.removeChild(mirror);
  const lh = parseInt(s.lineHeight) || 20;
  return { x: taR.left + (cR.left - mR.left), y: taR.top + (cR.top - mR.top) - ta.scrollTop + lh };
}

function showAc(ta) {
  const word = getWordBefore(ta);
  if (!word || word.length < 1) { hideAc(); return; }
  const lang = getActivePgLang();
  const map = lang === 'html' ? EMMET_HTML : lang === 'css' ? EMMET_CSS : EMMET_JS;
  const wordLower = word.toLowerCase();
  const matches = Object.keys(map).filter(k => k.startsWith(wordLower)).slice(0, 9);
  if (matches.length === 0) { hideAc(); return; }
  acState.items = matches;
  acState.selectedIdx = 0;
  acState.visible = true;
  acState.ta = ta; // запоминаем редактор, чтобы клик по подсказке работал даже после потери фокуса
  renderAc(ta, map);
}

function renderAc(ta, map) {
  if (!map) {
    const lang = getActivePgLang();
    map = lang === 'html' ? EMMET_HTML : lang === 'css' ? EMMET_CSS : EMMET_JS;
  }
  const dd = getAcDropdown();
  dd.innerHTML = '';
  acState.items.forEach((key, i) => {
    const item = document.createElement('div');
    item.className = 'pg-ac-item' + (i === acState.selectedIdx ? ' ac-selected' : '');
    item.dataset.idx = i;
    const icon = document.createElement('span');
    icon.className = 'pg-ac-icon';
    icon.textContent = 'TAB';
    const keySpan = document.createElement('span');
    keySpan.className = 'pg-ac-key';
    keySpan.textContent = key;
    const prev = document.createElement('span');
    prev.className = 'pg-ac-preview';
    prev.textContent = map[key].replace(/\|/g,'▌').replace(/\n/g,'↵').substring(0, 28);
    item.appendChild(icon);
    item.appendChild(keySpan);
    item.appendChild(prev);
    dd.appendChild(item);
  });
  const hint = document.createElement('div');
  hint.className = 'pg-ac-hint';
  hint.textContent = '↑↓ выбрать · Tab/Enter применить · Esc закрыть';
  dd.appendChild(hint);

  const coords = getCaretCoords(ta);
  const dropH = Math.min(acState.items.length * 30 + 26, 220);
  let top = coords.y;
  if (top + dropH > window.innerHeight - 12) top = coords.y - dropH - (parseInt(window.getComputedStyle(ta).lineHeight) || 20);
  dd.style.left = Math.min(coords.x, window.innerWidth - 240) + 'px';
  dd.style.top = top + 'px';
  dd.style.display = 'block';
}

function hideAc() {
  acState.visible = false; acState.items = []; acState.selectedIdx = -1; acState.ta = null;
  const dd = document.getElementById('pg-autocomplete');
  if (dd) dd.style.display = 'none';
}

function acMove(dir) {
  if (!acState.visible) return;
  acState.selectedIdx = Math.max(0, Math.min(acState.items.length - 1, acState.selectedIdx + dir));
  renderAc(null, null);
  const dd = getAcDropdown();
  const sel = dd.querySelector('.ac-selected');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function applyAcSuggestion(idx) {
  if (idx === undefined) idx = acState.selectedIdx;
  if (idx < 0 || idx >= acState.items.length) return false;
  const key = acState.items[idx];
  const lang = getActivePgLang();
  const map = lang === 'html' ? EMMET_HTML : lang === 'css' ? EMMET_CSS : EMMET_JS;
  // Единственный редактор сейчас — #pg-editor (а не отдельные pg-html/pg-css/pg-js)
  const ta = acState.ta || document.getElementById('pg-editor');
  if (!ta) return false;
  const word = getWordBefore(ta);
  // Удаляем слово + ведущий < если пользователь написал <h1 вместо h1
  const charBeforeWord = ta.value[ta.selectionStart - word.length - 1];
  const extraLen = charBeforeWord === '<' && lang === 'html' ? 1 : 0;
  const start = ta.selectionStart - word.length - extraLen;
  ta.value = ta.value.substring(0, start) + ta.value.substring(ta.selectionStart);
  ta.selectionStart = ta.selectionEnd = start;
  insertSnippet(ta, map[key]);
  hideAc();
  return true;
}

// Close autocomplete when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#pg-autocomplete') && !e.target.classList.contains('pg-textarea')) hideAc();
});

function pgKeydown(e) {
  const ta = e.target;
  if (!ta.classList.contains('pg-textarea')) return;
  const lang = getActivePgLang();

  // ===== AUTOCOMPLETE NAVIGATION =====
  if (acState.visible) {
    if (e.key === 'ArrowDown')  { e.preventDefault(); acMove(+1); return; }
    if (e.key === 'ArrowUp')    { e.preventDefault(); acMove(-1); return; }
    if (e.key === 'Escape')     { e.preventDefault(); hideAc(); return; }
    if (e.key === 'Enter' && acState.selectedIdx >= 0) { e.preventDefault(); applyAcSuggestion(); return; }
  }

  // ===== TAB =====
  if (e.key === 'Tab') {
    e.preventDefault();
    // If dropdown open — apply selected suggestion
    if (acState.visible && acState.selectedIdx >= 0) { applyAcSuggestion(); return; }
    const word = getWordBefore(ta);
    const map = lang === 'html' ? EMMET_HTML : lang === 'css' ? EMMET_CSS : EMMET_JS;
    const wordLower = word.toLowerCase();
    if (word && map[wordLower]) {
      // Удаляем слово + ведущий < если пользователь написал <h1 вместо h1
      const charBeforeWord = ta.value[ta.selectionStart - word.length - 1];
      const extraLen = charBeforeWord === '<' ? 1 : 0;
      const start = ta.selectionStart - word.length - extraLen;
      ta.value = ta.value.substring(0, start) + ta.value.substring(ta.selectionStart);
      ta.selectionStart = ta.selectionEnd = start;
      insertSnippet(ta, map[wordLower]);
    } else {
      insertSnippet(ta, '  |');
    }
    return;
  }

  // ===== AUTO-CLOSE HTML TAGS: type <h1> → auto-adds </h1> =====
  if (e.key === '>' && lang === 'html') {
    const pos = ta.selectionStart;
    const before = ta.value.substring(0, pos);
    // Match <tagName possibly with attributes, not self-closing, not closing tag
    const tagMatch = before.match(/<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?$/);
    const voidTags = new Set(['area','base','br','col','embed','hr','img','input',
      'link','meta','param','source','track','wbr']);
    if (tagMatch && !before.endsWith('/') && !voidTags.has(tagMatch[1].toLowerCase())) {
      const tagName = tagMatch[1];
      e.preventDefault();
      // Спецслучай: <script> → сразу предлагаем src=""
      if (tagName.toLowerCase() === 'script' && !/\ssrc=/.test(tagMatch[2] || '')) {
        insertSnippet(ta, ' src="|"></scri' + 'pt>');
      } else {
        insertSnippet(ta, '>' + '|' + '</' + tagName + '>');
      }
      hideAc();
      return;
    }
  }

  // ===== AUTO-INSERT QUOTES: type = → auto-adds "" with cursor inside =====
  // Срабатывает в HTML внутри тега (атрибуты) и в JS/CSS при обычном присваивании
  if (e.key === '=' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const pos = ta.selectionStart;
    const before = ta.value.substring(0, pos);
    const after = ta.value.substring(ta.selectionEnd);

    // Не трогаем если это часть ==, ===, !=, <=, >=, += и т.п. — уже есть = рядом
    const prevChar = before.slice(-1);
    const nextChar = after.charAt(0);
    const isComparisonOrCompound = /[=!<>+\-*/%&|^]/.test(prevChar) || nextChar === '=';

    if (!isComparisonOrCompound) {
      // В HTML — только если мы похожи на атрибут (внутри открытого тега)
      let shouldInsert = false;
      if (lang === 'html') {
        const lastOpenTag = before.lastIndexOf('<');
        const lastCloseTag = before.lastIndexOf('>');
        const insideTag = lastOpenTag > lastCloseTag;
        const attrNameMatch = before.match(/[a-zA-Z-]+$/);
        shouldInsert = insideTag && !!attrNameMatch;
      } else {
        // В JS/CSS — после идентификатора (переменная = ..., свойство: не трогаем, только =)
        shouldInsert = /[a-zA-Z0-9_$]\s*$/.test(before);
      }

      if (shouldInsert) {
        e.preventDefault();
        insertSnippet(ta, '="|"');
        hideAc();
        return;
      }
    }
  }

  // ===== AUTO-CLOSE CSS BRACES: type selector { → adds } =====
  if (e.key === '{' && lang === 'css') {
    e.preventDefault();
    insertSnippet(ta, ' {\n  |\n}');
    hideAc();
    return;
  }

  // ===== ENTER — авто-отступ =====
  if (e.key === 'Enter') {
    hideAc();
    const start = ta.selectionStart;
    const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
    const lineText = ta.value.substring(lineStart, start);
    const indent = lineText.match(/^(\s*)/)[1];
    const charBefore = ta.value[start - 1];
    const charAfter = ta.value[start];
    const pairs = { '{': '}', '(': ')', '[': ']' };
    // VS Code-style: Enter между > и < — курсор внутри тега, закрывающий тег на новую строку
    if (charBefore === '>' && charAfter === '<') {
      e.preventDefault();
      insertSnippet(ta, '\n' + indent + '  |\n' + indent);
      return;
    }
    if (pairs[charBefore] && charAfter === pairs[charBefore]) {
      e.preventDefault();
      insertSnippet(ta, '\n' + indent + '  |\n' + indent);
    } else {
      e.preventDefault();
      insertSnippet(ta, '\n' + indent + '|');
    }
    return;
  }

  // ===== АВТО-ЗАКРЫТИЕ СКОБОК =====
  const autoPairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  if (autoPairs[e.key] && ta.selectionStart === ta.selectionEnd) {
    const nextChar = ta.value[ta.selectionStart];
    if (nextChar === autoPairs[e.key]) {
      e.preventDefault();
      ta.selectionStart = ta.selectionEnd = ta.selectionStart + 1;
      return;
    }
    if (e.key === '"' || e.key === "'") {
      e.preventDefault();
      insertSnippet(ta, e.key + '|' + e.key);
      return;
    }
    e.preventDefault();
    insertSnippet(ta, e.key + '|' + autoPairs[e.key]);
    return;
  }

  // ===== BACKSPACE — удаляет пару =====
  if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
    const pos = ta.selectionStart;
    const prev = ta.value[pos - 1];
    const next = ta.value[pos];
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (prev && pairs[prev] === next) {
      e.preventDefault();
      ta.value = ta.value.substring(0, pos - 1) + ta.value.substring(pos + 1);
      ta.selectionStart = ta.selectionEnd = pos - 1;
      scheduleRun();
    }
    return;
  }
}

// Show autocomplete on input
document.addEventListener('input', (e) => {
  const ta = e.target;
  if (!ta.classList.contains('pg-textarea')) return;
  showAc(ta);
});

document.addEventListener('keydown', pgKeydown);

// ===== ИНСТРУМЕНТЫ PLAYGROUND =====

// --- Копировать вывод инструмента ---
function toolCopy(id, btn) {
  const text = document.getElementById(id).textContent;
  const showOk = () => {
    btn.textContent = '✓ Скопировано';
    btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'Копировать'; btn.classList.remove('ok'); }, 2000);
  };
  const showErr = () => {
    btn.textContent = '✗ Ошибка';
    setTimeout(() => { btn.textContent = 'Копировать'; }, 2000);
  };
  const fallback = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) showOk(); else showErr();
    } catch (e) { showErr(); }
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(showOk).catch(fallback);
  } else { fallback(); }
}

// --- Генератор box-shadow ---
function updateShadow() {
  const x   = document.getElementById('sh-x').value;
  const y   = document.getElementById('sh-y').value;
  const b   = document.getElementById('sh-b').value;
  const s   = document.getElementById('sh-s').value;
  const a   = document.getElementById('sh-a').value;
  const col = document.getElementById('sh-col').value;

  document.getElementById('sh-x-v').textContent = x + 'px';
  document.getElementById('sh-y-v').textContent = y + 'px';
  document.getElementById('sh-b-v').textContent = b + 'px';
  document.getElementById('sh-s-v').textContent = s + 'px';
  document.getElementById('sh-a-v').textContent = a + '%';

  // hex color → rgba
  const r = parseInt(col.slice(1,3),16);
  const g = parseInt(col.slice(3,5),16);
  const bv = parseInt(col.slice(5,7),16);
  const alpha = (a / 100).toFixed(2);
  const shadow = `${x}px ${y}px ${b}px ${s}px rgba(${r},${g},${bv},${alpha})`;

  document.getElementById('sh-preview').style.boxShadow = shadow;
  document.getElementById('sh-output').textContent = `box-shadow: ${shadow};`;
}

// --- Конвертер цвета HEX → RGB / HSL ---
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return {r,g,b};
}
function rgbToHsl(r,g,b) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){ h=s=0; }
  else {
    const d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r: h=((g-b)/d+(g<b?6:0))/6; break;
      case g: h=((b-r)/d+2)/6; break;
      default: h=((r-g)/d+4)/6;
    }
  }
  return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) };
}
function applyColor(hex) {
  if(!/^#[0-9a-f]{6}$/i.test(hex)) return;
  const {r,g,b} = hexToRgb(hex);
  const {h,s,l} = rgbToHsl(r,g,b);
  document.getElementById('col-out-hex').textContent  = hex;
  document.getElementById('col-out-rgb').textContent  = `rgb(${r}, ${g}, ${b})`;
  document.getElementById('col-out-hsl').textContent  = `hsl(${h}, ${s}%, ${l}%)`;
  document.getElementById('col-out-rgba').textContent = `rgba(${r},${g},${b},0.5)`;
  document.getElementById('col-swatch').style.background = hex;
  document.getElementById('col-picker').value = hex;
  document.getElementById('col-hex').value   = hex;
}
function updateColor() {
  applyColor(document.getElementById('col-picker').value);
}
function updateColorFromHex() {
  const hex = document.getElementById('col-hex').value.trim();
  if (/^#[0-9a-f]{6}$/i.test(hex)) applyColor(hex);
}

// --- Конвертер единиц CSS ---
function updateUnits() {
  const px   = parseFloat(document.getElementById('uc-px').value)   || 0;
  const base = parseFloat(document.getElementById('uc-base').value) || 16;
  document.getElementById('uc-rem').textContent = (px / base).toFixed(4).replace(/\.?0+$/,'') + 'rem';
  document.getElementById('uc-em').textContent  = (px / base).toFixed(4).replace(/\.?0+$/,'') + 'em';
  document.getElementById('uc-pt').textContent  = (px * 0.75).toFixed(2).replace(/\.?0+$/,'') + 'pt';
  document.getElementById('uc-vh').textContent  = (px / 9).toFixed(3).replace(/\.?0+$/,'') + 'vh';
  document.getElementById('uc-vw').textContent  = (px / 12.8).toFixed(3).replace(/\.?0+$/,'') + 'vw';
  document.getElementById('uc-pct').textContent = ((px / base) * 100).toFixed(2).replace(/\.?0+$/,'') + '%';
}

// --- RegEx тестер ---
function runRegex() {
  const pattern = document.getElementById('rx-pattern').value;
  const flags   = document.getElementById('rx-flags').value.replace(/[^gimsuy]/g,'');
  const text    = document.getElementById('rx-text').value;
  const resEl   = document.getElementById('rx-result');
  const countEl = document.getElementById('rx-count');
  if (!pattern) { resEl.innerHTML = ''; countEl.innerHTML = ''; return; }
  try {
    const re = new RegExp(pattern, flags);
    const matches = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
    const count = matches.length;
    const highlighted = text.replace(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'),
      m => `<mark class="regex-match">${m.replace(/</g,'&lt;')}</mark>`
    ).replace(/\n/g,'<br>');
    resEl.innerHTML = highlighted;
    countEl.innerHTML = count > 0
      ? `<span class="regex-match-count found">✓ Найдено совпадений: ${count}</span>`
      : `<span class="regex-match-count none">✗ Совпадений нет</span>`;
  } catch(e) {
    resEl.textContent = '';
    countEl.innerHTML = `<span class="regex-match-count error">⚠ Ошибка: ${e.message}</span>`;
  }
}
function rxSet(pattern, flags) {
  document.getElementById('rx-pattern').value = pattern;
  document.getElementById('rx-flags').value   = flags || 'g';
  runRegex();
}

// --- Генератор градиента ---
function updateGradient() {
  const c1  = document.getElementById('gr-c1').value;
  const c2  = document.getElementById('gr-c2').value;
  const deg = document.getElementById('gr-deg').value;
  const type = document.getElementById('gr-type').value;
  document.getElementById('gr-deg-v').textContent = deg + '°';
  let bg;
  if (type === 'linear')  bg = `linear-gradient(${deg}deg, ${c1}, ${c2})`;
  if (type === 'radial')  bg = `radial-gradient(circle, ${c1}, ${c2})`;
  if (type === 'conic')   bg = `conic-gradient(from ${deg}deg, ${c1}, ${c2}, ${c1})`;
  document.getElementById('gr-preview').style.background = bg;

  const mode = document.getElementById('gr-mode')?.value || 'props';
  let output;
  if (mode === 'props') {
    output = `margin: 0;\nmin-height: 100vh;\nbackground: ${bg};\nbackground-attachment: fixed;`;
  } else {
    output = `background: ${bg};`;
  }
  document.getElementById('gr-output').textContent = output;
}

// --- Типографическая шкала ---
const FS_NAMES = ['xs','sm','base','lg','xl','2xl','3xl','4xl'];
function updateFontScale() {
  const base  = parseFloat(document.getElementById('fs-base').value) || 16;
  const ratio = parseFloat(document.getElementById('fs-ratio').value) || 1.25;
  const cont = document.getElementById('fs-scale');
  if (!cont) return;
  // 4 ниже базы (xs..base) + 5 выше (lg..4xl)
  const steps = [-3,-2,-1,0,1,2,3,4];
  cont.innerHTML = steps.map((s,i) => {
    const size = (base * Math.pow(ratio, s)).toFixed(2);
    const rem  = (size / 16).toFixed(3).replace(/\.?0+$/,'');
    const isDark = document.body.classList.contains('dark');
    return `<div style="display:flex;align-items:baseline;gap:14px;padding:6px 0;border-bottom:1px solid ${isDark?'#1e2536':'#f3f4f6'};">
      <span style="font-size:11px;font-weight:700;color:#9ca3af;width:36px;flex-shrink:0;">${FS_NAMES[i]}</span>
      <span style="font-size:${size}px;line-height:1.2;color:${isDark?'#e2e8f0':'#111827'};font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Привет мир</span>
      <span style="font-size:11px;color:#9ca3af;font-family:monospace;white-space:nowrap;">${size}px / ${rem}rem</span>
    </div>`;
  }).join('');
}

// ===== ПОМОДОРО =====
let POMO_DURATIONS = { work: 25*60, break: 5*60 };
try {
  const savedDur = JSON.parse(localStorage.getItem('pomo_durations') || 'null');
  if (savedDur && savedDur.work && savedDur.break) POMO_DURATIONS = savedDur;
} catch(e) {}
let pomoState = { running: false, mode: 'work', secondsLeft: POMO_DURATIONS.work, sessions: 0, interval: null };;
const CIRCUMFERENCE = 2 * Math.PI * 39; // ~245


// ===== BORDER-RADIUS GENERATOR =====
function updateBorderRadius() {
  const tl = document.getElementById('br-tl').value;
  const tr = document.getElementById('br-tr').value;
  const bl = document.getElementById('br-bl').value;
  const br = document.getElementById('br-br').value;
  document.getElementById('br-tl-v').textContent = tl + 'px';
  document.getElementById('br-tr-v').textContent = tr + 'px';
  document.getElementById('br-bl-v').textContent = bl + 'px';
  document.getElementById('br-br-v').textContent = br + 'px';
  const preview = document.getElementById('br-preview');
  const radius = `${tl}px ${tr}px ${br}px ${bl}px`;
  preview.style.borderRadius = radius;
  // Compact output if all same
  let output;
  if (tl === tr && tr === bl && bl === br) {
    output = `border-radius: ${tl}px;`;
  } else {
    output = `border-radius: ${radius};`;
  }
  document.getElementById('br-output').textContent = output;
}
function brSync() {
  const v = document.getElementById('br-tl').value;
  ['br-tr','br-bl','br-br'].forEach(id => document.getElementById(id).value = v);
  updateBorderRadius();
}

// ===== PALETTE GENERATOR =====
function hexToHsl(hex) {
  hex = hex.replace('#','');
  const r = parseInt(hex.substr(0,2),16)/255;
  const g = parseInt(hex.substr(2,2),16)/255;
  const b = parseInt(hex.substr(4,2),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch (max) {
      case r: h = (g-b)/d + (g<b ? 6 : 0); break;
      case g: h = (b-r)/d + 2; break;
      case b: h = (r-g)/d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs((h/60) % 2 - 1));
  const m = l - c/2;
  let r, g, b;
  if (h < 60)       { r=c; g=x; b=0; }
  else if (h < 120) { r=x; g=c; b=0; }
  else if (h < 180) { r=0; g=c; b=x; }
  else if (h < 240) { r=0; g=x; b=c; }
  else if (h < 300) { r=x; g=0; b=c; }
  else              { r=c; g=0; b=x; }
  const toHex = v => {
    const h = Math.round((v+m)*255).toString(16);
    return h.length === 1 ? '0'+h : h;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}
function updatePalette() {
  const base = document.getElementById('pl-base').value;
  const scheme = document.getElementById('pl-scheme').value;
  const [h, s, l] = hexToHsl(base);
  let colors = [];
  if (scheme === 'mono') {
    colors = [
      hslToHex(h, s, Math.max(15, l - 30)),
      hslToHex(h, s, Math.max(25, l - 15)),
      base,
      hslToHex(h, s, Math.min(85, l + 15)),
      hslToHex(h, s, Math.min(92, l + 30)),
    ];
  } else if (scheme === 'analog') {
    colors = [
      hslToHex((h+330)%360, s, l),
      hslToHex((h+345)%360, s, l),
      base,
      hslToHex((h+15)%360, s, l),
      hslToHex((h+30)%360, s, l),
    ];
  } else if (scheme === 'comp') {
    colors = [
      hslToHex(h, s, Math.max(25, l - 20)),
      base,
      hslToHex(h, s, Math.min(85, l + 20)),
      hslToHex((h+180)%360, s, l),
      hslToHex((h+180)%360, s, Math.min(85, l + 20)),
    ];
  } else { // triad
    colors = [
      base,
      hslToHex((h+120)%360, s, l),
      hslToHex((h+240)%360, s, l),
      hslToHex(h, s, Math.min(85, l + 25)),
      hslToHex((h+120)%360, s, Math.min(85, l + 25)),
    ];
  }
  const row = document.getElementById('pl-row');
  row.innerHTML = colors.map(c =>
    `<div class="palette-swatch" style="background:${c}" onclick="copyPaletteColor(this, '${c}')">${c}</div>`
  ).join('');
}
function copyPaletteColor(el, hex) {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = hex;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(hex).catch(fallback);
  } else { fallback(); }
  el.classList.add('copied');
  playClickSound();
  setTimeout(() => el.classList.remove('copied'), 1500);
}
function randomPalette() {
  const r = () => Math.floor(Math.random()*256).toString(16).padStart(2,'0');
  const hex = '#' + r() + r() + r();
  document.getElementById('pl-base').value = hex;
  updatePalette();
}

// ===== CLICK SOUNDS =====
let clickSoundsOn = localStorage.getItem('clickSounds') === '1';
let audioCtx = null;
function playClickSound() {
  if (!clickSoundsOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const output = audioCtx.createGain();
    const body = audioCtx.createOscillator();
    const sparkle = audioCtx.createOscillator();
    const bodyGain = audioCtx.createGain();
    const sparkleGain = audioCtx.createGain();

    body.type = 'triangle';
    body.frequency.setValueAtTime(360, now);
    body.frequency.exponentialRampToValueAtTime(190, now + 0.055);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.035, now + 0.006);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(720, now);
    sparkle.frequency.exponentialRampToValueAtTime(520, now + 0.025);
    sparkleGain.gain.setValueAtTime(0.0001, now);
    sparkleGain.gain.linearRampToValueAtTime(0.012, now + 0.004);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    output.gain.value = 0.85;
    body.connect(bodyGain); sparkle.connect(sparkleGain);
    bodyGain.connect(output); sparkleGain.connect(output);
    output.connect(audioCtx.destination);
    body.start(now); sparkle.start(now);
    body.stop(now + 0.08); sparkle.stop(now + 0.04);
  } catch (e) {}
}
function toggleClickSounds(row) {
  clickSoundsOn = !clickSoundsOn;
  localStorage.setItem('clickSounds', clickSoundsOn ? '1' : '0');
  document.getElementById('soundToggle').classList.toggle('on', clickSoundsOn);
  if (clickSoundsOn) playClickSound();
}

// ===== SETTINGS PANEL =====
function toggleSettings() {
  document.getElementById('settingsMini').classList.toggle('show');
}
document.addEventListener('click', (e) => {
  const m = document.getElementById('settingsMini');
  const b = document.querySelector('.settings-btn');
  if (m && !m.contains(e.target) && b && !b.contains(e.target)) {
    m.classList.remove('show');
  }
});

// ===== CUSTOM BACKGROUND =====
function setCustomBg(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) {
    console.warn('setCustomBg: no file selected');
    return;
  }
  console.log('setCustomBg:', file.name, file.type, (file.size/1024/1024).toFixed(2)+'MB');

  // Только статичные картинки — gif/avif/apng не поддерживаются
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    if (file.type === 'image/gif') {
      alert('GIF не поддерживается как фон. Используй JPG, PNG или WebP.');
    } else {
      alert('Поддерживаются только: JPG, PNG, WebP.\nТип файла: ' + (file.type || 'неизвестен'));
    }
    e.target.value = '';
    return;
  }
  // Warn on huge files
  const MB = file.size / (1024 * 1024);
  if (MB > 8) {
    if (!confirm(`Файл большой: ${MB.toFixed(1)} MB. Может тормозить сайт. Всё равно использовать?`)) {
      e.target.value = '';
      return;
    }
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    const url = ev.target.result;
    if (!url || !url.startsWith('data:image')) {
      alert('Файл не прочитался как картинка. Попробуй другой.');
      return;
    }
    document.body.style.setProperty('--custom-bg', `url("${url}")`);
    document.body.classList.add('has-custom-bg');
    const currentOpacity = parseFloat(localStorage.getItem('customBgOpacity') || '15');
    if (currentOpacity < 5) {
      setBgOpacity(40);
      const inp = document.getElementById('bgOpacity');
      if (inp) inp.value = 40;
    }
    try {
      localStorage.setItem('customBg', url);
      console.log('Saved to localStorage, size:', (url.length/1024).toFixed(1)+'KB');
    } catch (err) {
      console.warn('localStorage failed:', err);
      alert('Картинка слишком большая, чтобы сохранить между сессиями. Применилась только сейчас — при перезагрузке надо будет загрузить заново.');
    }
  };
  reader.onerror = () => {
    console.error('FileReader error', reader.error);
    alert('Не получилось прочитать файл. Попробуй другой.');
  };
  reader.readAsDataURL(file);
}
function setBgOpacity(v) {
  document.body.style.setProperty('--custom-bg-opacity', (v/100).toString());
  document.getElementById('bgOpacityVal').textContent = v + '%';
  localStorage.setItem('customBgOpacity', v);
}
function setBgPos(axis, v) {
  const prop = axis === 'x' ? '--custom-bg-x' : '--custom-bg-y';
  document.body.style.setProperty(prop, v + '%');
  const valEl = document.getElementById(axis === 'x' ? 'bgPosXVal' : 'bgPosYVal');
  if (valEl) valEl.textContent = v + '%';
  localStorage.setItem('customBgPos' + axis.toUpperCase(), v);
}
function setBgSize(mode) {
  document.body.style.setProperty('--custom-bg-size', mode);
  localStorage.setItem('customBgSize', mode);
  // Highlight active button
  const c = document.getElementById('bgSizeCover');
  const cn = document.getElementById('bgSizeContain');
  if (c)  c.style.background  = (mode === 'cover')   ? '#6366f1' : '';
  if (c)  c.style.color       = (mode === 'cover')   ? '#fff'    : '';
  if (cn) cn.style.background = (mode === 'contain') ? '#6366f1' : '';
  if (cn) cn.style.color      = (mode === 'contain') ? '#fff'    : '';
}
function resetBgPos() {
  setBgPos('x', 50); setBgPos('y', 50); setBgSize('cover');
  const xi = document.getElementById('bgPosX'); if (xi) xi.value = 50;
  const yi = document.getElementById('bgPosY'); if (yi) yi.value = 50;
}
function clearCustomBg() {
  document.body.classList.remove('has-custom-bg');
  document.body.style.removeProperty('--custom-bg');
  localStorage.removeItem('customBg');
}
function restoreCustomBg() {
  try {
    const url = localStorage.getItem('customBg');
    if (url) {
      document.body.style.setProperty('--custom-bg', `url("${url}")`);
      document.body.classList.add('has-custom-bg');
    }
    const op = localStorage.getItem('customBgOpacity');
    if (op) {
      document.body.style.setProperty('--custom-bg-opacity', (op/100).toString());
      const inp = document.getElementById('bgOpacity');
      const v = document.getElementById('bgOpacityVal');
      if (inp) inp.value = op;
      if (v) v.textContent = op + '%';
    }
    // Position X
    const px = localStorage.getItem('customBgPosX') || '50';
    const py = localStorage.getItem('customBgPosY') || '50';
    document.body.style.setProperty('--custom-bg-x', px + '%');
    document.body.style.setProperty('--custom-bg-y', py + '%');
    const xi = document.getElementById('bgPosX'); if (xi) xi.value = px;
    const yi = document.getElementById('bgPosY'); if (yi) yi.value = py;
    const xv = document.getElementById('bgPosXVal'); if (xv) xv.textContent = px + '%';
    const yv = document.getElementById('bgPosYVal'); if (yv) yv.textContent = py + '%';
    // Size mode
    const size = localStorage.getItem('customBgSize') || 'cover';
    setBgSize(size);
  } catch (e) {}
  // Restore sound state
  if (clickSoundsOn) {
    const t = document.getElementById('soundToggle');
    if (t) t.classList.add('on');
  }
}

// ===== TIP OF THE DAY =====
const TIPS = [
  ['HTML', 'object-fit: cover — лучший друг карточки товара. Все картинки одного размера, без растяжения.'],
  ['CSS', 'aspect-ratio: 16/9 заменяет старый хак с padding-top: 56.25%. Одна строка вместо костыля.'],
  ['JS', 'console.log({myVar}) вместо console.log("myVar:", myVar). Быстрее и сразу видно имя переменной.'],
  ['CSS', 'rem масштабируется с настройками браузера, px нет. Для шрифтов используй rem, для рамок px.'],
  ['HTML', 'У каждой картинки должен быть alt. Если декоративная — alt="" (пустая строка), но атрибут обязателен.'],
  ['CSS', 'gap работает не только в Grid, но и в Flexbox. margin между элементами — это устаревший подход.'],
  ['JS', 'const по умолчанию. let — только если переменная меняется. var — никогда не используй.'],
  ['CSS', 'Не задавай height у блока с текстом. Используй padding — иначе текст вылезет при увеличении шрифта.'],
  ['HTML', 'type="email" в input — браузер сам проверит формат и покажет клавиатуру с @ на телефоне.'],
  ['CSS', 'Тень с альфа-каналом всегда лучше: rgba(0,0,0,0.1) красивее, чем серый #ccc.'],
  ['JS', '?. (optional chaining) — спасает от ошибок: user?.profile?.name вместо проверок на каждом уровне.'],
  ['CSS', 'background-attachment: fixed делает фон неподвижным при скролле — выглядит дороже.'],
  ['HTML', 'loading="lazy" на img — картинки ниже первого экрана грузятся, только когда нужны. Экономит трафик.'],
  ['CSS', 'transform: translateY(-3px) на :hover — мгновенный эффект "поднятия". Карточка становится живой.'],
  ['JS', 'Array.from(set) превращает Set в массив. Удобно для уникальных значений.'],
  ['CSS', 'min-height: 100vh — обязательно для секций "на весь экран". height: 100vh ломается на мобилках.'],
  ['HTML', 'label с for="id" и input с тем же id — клик по тексту фокусирует поле. Доступность бесплатно.'],
  ['CSS', 'flex: 1 на дочернем элементе flex-контейнера — занять всё свободное место. Простой и мощный приём.'],
  ['JS', 'JSON.stringify(obj, null, 2) — красивый JSON с отступами для логов и отладки.'],
  ['CSS', 'cursor: pointer на кликабельных элементах. Без него юзер не понимает, что можно нажать.'],
  ['HTML', 'main, section, article, header, footer вместо div — поисковики и скринридеры понимают структуру.'],
  ['CSS', 'Псевдоэлемент ::before требует content. Без него он не появится на странице. Хоть content: "".'],
  ['JS', '[...new Set(arr)] — короткий способ убрать дубликаты из массива в одну строку.'],
  ['CSS', 'gap: 16px в flexbox/grid задаёт промежутки между ВСЕМИ элементами. Не нужны margin-right у каждого.'],
  ['HTML', 'Пиши lang="ru" в html. Иначе Chrome предложит перевести страницу с английского на русский.'],
  ['CSS', 'transition: all 0.3s ease — простой способ сделать любые изменения свойств плавными.'],
  ['JS', 'addEventListener позволяет повесить много обработчиков на один элемент. onclick — только один.'],
  ['CSS', 'Не используй !important. Это признак того, что селекторы плохо организованы. Перепиши их.'],
  ['HTML', 'meta viewport обязателен для адаптивности. Без него сайт на телефоне будет уменьшен.'],
  ['CSS', 'Тёмная тема — это не #000 на #fff наоборот. Используй #0f172a для фона, #f8fafc для текста.'],
];
function showTipOfDay() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const idx = day % TIPS.length;
  const [tag, text] = TIPS[idx];
  const el = document.getElementById('tipOfDay');
  if (el) {
    el.innerHTML = `
      <span class="tip-of-day-icon">💡</span>
      <div><span class="tip-of-day-label">${tag} • совет дня</span>${text}</div>
    `;
  }
}

// ===== CHALLENGE 15 MIN =====
const CHALLENGES = [
  { name: 'Карточка товара', time: 15, desc: 'Свёрстай карточку: картинка сверху, ниже название, цена и кнопка "Купить". Hover-эффект на кнопке обязателен.' },
  { name: 'Footer сайта', time: 15, desc: 'Подвал из трёх колонок: контакты, ссылки, соцсети. На мобильном — складывается в столбик.' },
  { name: 'Hero-секция', time: 20, desc: 'Главный экран лендинга: заголовок, подзаголовок, две кнопки. Большой размер, текст по центру.' },
  { name: 'Список FAQ', time: 15, desc: 'Часто задаваемые вопросы через <details>/<summary>. Без JS, чисто на HTML.' },
  { name: 'Ценовая таблица', time: 20, desc: 'Три тарифа: Базовый/Про/Премиум. Цена, список фич, кнопка "Выбрать". Премиум выделен.' },
  { name: 'Форма обратной связи', time: 15, desc: 'Имя, Email, Сообщение, Кнопка отправки. С label и required. Не забудь про :focus.' },
  { name: 'Шапка с навигацией', time: 15, desc: 'Логотип слева, меню справа. На телефоне — гамбургер-иконка вместо меню.' },
  { name: 'Карточка профиля', time: 15, desc: 'Аватар (круглый), имя, должность, краткое описание, кнопки "Подписаться" и "Сообщение".' },
  { name: 'Hover-эффект на кнопке', time: 10, desc: 'Сделай 3 разные кнопки с разными hover-эффектами: подъём, заполнение, увеличение.' },
  { name: 'Галерея 3x3', time: 20, desc: '9 картинок в сетке. На hover — увеличение и затемнение. На мобильном — 1 колонка.' },
  { name: 'Таймер обратного отсчёта', time: 25, desc: 'JS-таймер 1 минута. Старт, Пауза, Сброс. Отображение MM:SS. Цвет меняется на красный при <10с.' },
  { name: 'Переключатель темы', time: 15, desc: 'Сделай понятное переключение светлой и тёмной темы. Способ хранения состояния выбери самостоятельно.' },
  { name: 'Счётчик кликов', time: 10, desc: 'Кнопка с числом. Клик — увеличивает на 1. Кнопка "Сброс" — обнуляет. История последних 5 значений.' },
  { name: 'Калькулятор чаевых', time: 20, desc: 'Поле "Сумма счёта", ползунок "% чаевых" (5-25%). Снизу — "Итого с чаевыми".' },
  { name: 'To-do список', time: 30, desc: 'Поле ввода + кнопка "Добавить". Список задач. Клик по задаче — отмечает выполненной.' },
];
let challengeTimer = null;
let challengeRemaining = 0;
// ===== ЗВУК ТАЙМЕРА (Web Audio API) =====
function playTimerSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'tick') {
      // Тихий тик каждую минуту
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = 'sine';
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.15);
    } else if (type === 'warning') {
      // Предупреждение за 1 минуту
      [440, 550].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        o.type = 'sine';
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
        g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.2 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.3);
        o.start(ctx.currentTime + i * 0.2);
        o.stop(ctx.currentTime + i * 0.2 + 0.3);
      });
    } else if (type === 'done') {
      // Приятный финальный аккорд
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        o.type = 'sine';
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 0.7);
      });
    }
  } catch(e) {}
}

function pickRandomChallenge() {
  const c = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
  document.getElementById('chName').textContent = c.name;
  document.getElementById('chDesc').textContent = c.desc;
  challengeRemaining = c.time * 60;
  updateChallengeTimer();
  stopChallengeTimer();
}

function adjustChallengeTime(deltaMinutes) {
  const wasRunning = !!challengeTimer;
  stopChallengeTimer();
  challengeRemaining = Math.max(60, challengeRemaining + deltaMinutes * 60);
  updateChallengeTimer();
  if (wasRunning) startChallenge();
}

function startChallenge() {
  if (challengeTimer) return;
  challengeTimer = setInterval(() => {
    challengeRemaining--;
    // Тик каждую минуту
    if (challengeRemaining > 0 && challengeRemaining % 60 === 0) {
      playTimerSound('tick');
    }
    // Предупреждение за 60 секунд
    if (challengeRemaining === 60) {
      playTimerSound('warning');
      showToast('⚡ Осталась 1 минута!');
    }
    if (challengeRemaining <= 0) {
      stopChallengeTimer();
      challengeRemaining = 0;
      updateChallengeTimer();
      playTimerSound('done');
      showToast('🎉 Время вышло! Как получилось?');
    }
    updateChallengeTimer();
  }, 1000);
}

function stopChallengeTimer() {
  if (challengeTimer) { clearInterval(challengeTimer); challengeTimer = null; }
}

function updateChallengeTimer() {
  const m = Math.floor(challengeRemaining / 60).toString().padStart(2, '0');
  const s = (challengeRemaining % 60).toString().padStart(2, '0');
  const el = document.getElementById('chTimer');
  if (!el) return;
  el.textContent = `⏱️ ${m}:${s}`;
  // Красный цвет когда мало времени
  if (challengeRemaining <= 60) {
    el.style.color = '#f87171';
    el.style.animation = 'pulse 1s infinite';
  } else if (challengeRemaining <= 180) {
    el.style.color = '#fbbf24';
    el.style.animation = '';
  } else {
    el.style.color = '';
    el.style.animation = '';
  }
}

// ===== Init on DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', () => {
  if (typeof updatePalette === 'function' && document.getElementById('pl-base')) updatePalette();
  if (typeof updateBorderRadius === 'function' && document.getElementById('br-tl')) updateBorderRadius();
  showTipOfDay();
  pickRandomChallenge();
  restoreCustomBg();

  // Click sound on all checkboxes and buttons (delegated)
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('input[type="checkbox"], button, .item, .tab, .book-lang-btn, .font-lang-btn, .font-filter-btn')) {
      playClickSound();
    }
  });
});


// ===== ТЕМА: конструктор =====
function applyTheme(c1, c2) {
  const root = document.documentElement.style;
  root.setProperty('--accent', c1);
  root.setProperty('--accent-2', c2);
  root.setProperty('--accent-grad', `linear-gradient(135deg, ${c1}, ${c2})`);
  // Derive variations from c1
  const hex = c1.replace('#','');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  // Darker (15% darker)
  const dr = Math.max(0, Math.floor(r * 0.78));
  const dg = Math.max(0, Math.floor(g * 0.78));
  const db = Math.max(0, Math.floor(b * 0.78));
  root.setProperty('--accent-dark', `rgb(${dr},${dg},${db})`);
  // Lighter (mix with white 25%)
  const lr = Math.min(255, Math.floor(r + (255 - r) * 0.25));
  const lg = Math.min(255, Math.floor(g + (255 - g) * 0.25));
  const lb = Math.min(255, Math.floor(b + (255 - b) * 0.25));
  root.setProperty('--accent-light', `rgb(${lr},${lg},${lb})`);
  // Pale (mix with white 60%)
  const pr = Math.min(255, Math.floor(r + (255 - r) * 0.6));
  const pg = Math.min(255, Math.floor(g + (255 - g) * 0.6));
  const pb = Math.min(255, Math.floor(b + (255 - b) * 0.6));
  root.setProperty('--accent-pale', `rgb(${pr},${pg},${pb})`);
  // Secondary alt (slightly lighter c2)
  const h2 = c2.replace('#','');
  const r2 = parseInt(h2.substr(0,2),16);
  const g2 = parseInt(h2.substr(2,2),16);
  const b2 = parseInt(h2.substr(4,2),16);
  const ar = Math.min(255, r2 + 20);
  const ag = Math.min(255, g2 + 10);
  const ab = Math.min(255, b2 + 20);
  root.setProperty('--accent-2-alt', `rgb(${ar},${ag},${ab})`);
  // Dark mode bg shades (very dark mix with #1a1f2e)
  const bgr = Math.floor((r + 26 * 4) / 5);
  const bgg = Math.floor((g + 31 * 4) / 5);
  const bgb = Math.floor((b + 46 * 4) / 5);
  root.setProperty('--accent-bg-dark', `rgb(${bgr},${bgg},${bgb})`);
  root.setProperty('--accent-bg-dark-alt', `rgb(${Math.floor(bgr*1.1)},${Math.floor(bgg*1.1)},${Math.floor(bgb*1.1)})`);
  // Alpha variants
  const setA = (alpha, name) => root.setProperty(name, `rgba(${r},${g},${b},${alpha})`);
  setA(0,    '--accent-alpha-00');
  setA(0.07, '--accent-alpha-07');
  setA(0.08, '--accent-alpha-08');
  setA(0.10, '--accent-alpha-10');
  setA(0.12, '--accent-alpha-12');
  setA(0.15, '--accent-alpha-15');
  setA(0.18, '--accent-alpha-18');
  setA(0.20, '--accent-alpha-20');
  setA(0.25, '--accent-alpha-25');
  setA(0.30, '--accent-alpha-30');
  setA(0.35, '--accent-alpha-35');
  setA(0.40, '--accent-alpha-40');
  setA(0.45, '--accent-alpha-45');
  setA(0.60, '--accent-alpha-60');
  setA(0.18, '--accent-soft');
  // Save
  localStorage.setItem('themeC1', c1);
  localStorage.setItem('themeC2', c2);
  // Sync color pickers
  const p1 = document.getElementById('themeC1'); if (p1) p1.value = c1;
  const p2 = document.getElementById('themeC2'); if (p2) p2.value = c2;
}
function updateCustomTheme() {
  const c1 = document.getElementById('themeC1').value;
  const c2 = document.getElementById('themeC2').value;
  applyTheme(c1, c2);
}
function resetTheme() {
  applyTheme('#6366f1', '#8b5cf6');
}
function restoreTheme() {
  const c1 = localStorage.getItem('themeC1');
  const c2 = localStorage.getItem('themeC2');
  if (c1 && c2) applyTheme(c1, c2);
}

// ===== ПОИСК =====
let searchIndex = null;
let searchHighlightedIdx = -1;

function buildSearchIndex() {
  if (searchIndex) return searchIndex;
  searchIndex = [];
  const sectionTitles = {
    'sec-html': 'HTML', 'sec-css': 'CSS', 'sec-js': 'JS',
    'sec-ts': 'TypeScript', 'sec-react': 'React',
    'sec-mistakes': 'Ошибки', 'sec-resources': 'Ресурсы',
    'sec-roadmap': 'Roadmap', 'sec-calendar': 'Календарь', 'sec-figma': 'Figma',
    'sec-playground': 'Песочница',
    'sec-git': 'Git', 'sec-cheatsheets': 'Шпаргалки',
    'sec-github': 'GitHub', 'sec-books': 'Книги',
    'sec-fonts': 'Шрифты',
  };
  document.querySelectorAll('.section').forEach(section => {
    const sectionId = section.id;
    const sectionName = sectionTitles[sectionId] || sectionId;
    section.querySelectorAll('.block').forEach(block => {
      const titleEl = block.querySelector('.block-title');
      if (!titleEl) return;
      const title = titleEl.textContent.replace(/[🔗⭐]/g, '').trim();
      const tipEl = block.querySelector('.tip, .explain');
      const tip = tipEl ? tipEl.textContent.trim() : '';
      const items = Array.from(block.querySelectorAll('.item span')).map(s => s.textContent).join(' ');
      const fullText = (title + ' ' + tip + ' ' + items).toLowerCase();
      searchIndex.push({
        id: block.id || '',
        title: title,
        section: sectionName,
        sectionId: sectionId,
        snippet: tip.substring(0, 200),
        text: fullText
      });
    });
  });
  return searchIndex;
}

function openSearch() {
  buildSearchIndex();
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.add('show');
  setTimeout(() => {
    const inp = document.getElementById('globalSearchInput');
    if (inp) { inp.focus(); inp.select(); }
  }, 50);
}
function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('show');
  const inp = document.getElementById('globalSearchInput');
  if (inp) inp.value = '';
  searchHighlightedIdx = -1;
}

function highlightText(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped, 'gi'), m => `<mark>${m}</mark>`);
}

function performSearch(query) {
  const results = document.getElementById('searchResults');
  query = (query || '').trim().toLowerCase();
  if (!query) {
    results.innerHTML = '<div class="search-empty">Начни печатать — найду по всем блокам роадмапа</div>';
    return;
  }
  const idx = buildSearchIndex();
  const matches = idx.filter(item => item.text.includes(query)).slice(0, 30);
  if (matches.length === 0) {
    results.innerHTML = `<div class="search-empty">Ничего не найдено по «${query}»</div>`;
    return;
  }
  results.innerHTML = matches.map((m, i) => `
    <a class="search-result" data-idx="${i}" onclick="openSearchResult('${m.sectionId}','${m.id}')">
      <div class="search-result-title">
        <span class="search-result-section">${m.section}</span>
        <span>${highlightText(m.title, query)}</span>
      </div>
      ${m.snippet ? `<div class="search-result-snippet">${highlightText(m.snippet, query)}</div>` : ''}
    </a>
  `).join('');
  searchHighlightedIdx = -1;
}

function openSearchResult(sectionId, blockId) {
  closeSearch();
  // Switch to the right tab
  const tabBtn = document.querySelector(`.tab[onclick*="'${sectionId.replace('sec-','')}'"]`);
  if (tabBtn) tabBtn.click();
  // Scroll to block
  setTimeout(() => {
    if (blockId) {
      const el = document.getElementById(blockId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow .3s';
        el.style.boxShadow = '0 0 0 3px var(--accent, #6366f1)';
        setTimeout(() => el.style.boxShadow = '', 1500);
      }
    }
  }, 100);
}

// Keyboard: Ctrl+K to open, Esc to close, arrows to navigate
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openSearch();
    return;
  }
  const overlay = document.getElementById('searchOverlay');
  if (!overlay || !overlay.classList.contains('show')) return;
  if (e.key === 'Escape') {
    e.preventDefault(); closeSearch(); return;
  }
  const items = document.querySelectorAll('.search-result');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    searchHighlightedIdx = Math.min(searchHighlightedIdx + 1, items.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    searchHighlightedIdx = Math.max(searchHighlightedIdx - 1, 0);
  } else if (e.key === 'Enter') {
    if (searchHighlightedIdx >= 0 && items[searchHighlightedIdx]) {
      e.preventDefault();
      items[searchHighlightedIdx].click();
    } else if (items[0]) {
      e.preventDefault();
      items[0].click();
    }
    return;
  } else { return; }
  items.forEach((it, i) => it.classList.toggle('active', i === searchHighlightedIdx));
  if (items[searchHighlightedIdx]) items[searchHighlightedIdx].scrollIntoView({ block: 'nearest' });
});

// Restore theme on load
document.addEventListener('DOMContentLoaded', () => {
  restoreTheme();
});

function togglePomo() {
  const w = document.getElementById('pomoWidget');
  w.classList.toggle('open');
}

function pomoToggle() {
  if (pomoState.running) {
    clearInterval(pomoState.interval);
    pomoState.running = false;
    document.getElementById('pomoStartBtn').textContent = '▶ Старт';
  } else {
    pomoState.running = true;
    document.getElementById('pomoStartBtn').textContent = '⏸ Пауза';
    pomoState.interval = setInterval(pomoTick, 1000);
  }
}

function pomoTick() {
  pomoState.secondsLeft--;
  pomoRender();
  if (pomoState.secondsLeft <= 0) {
    clearInterval(pomoState.interval);
    pomoState.running = false;
    if (pomoState.mode === 'work') {
      pomoState.sessions++;
      pomoState.mode = 'break';
      pomoState.secondsLeft = POMO_DURATIONS.break;
      showToast('🎉 Фокус-сессия завершена! Отдохни 5 минут.');
    } else {
      pomoState.mode = 'work';
      pomoState.secondsLeft = POMO_DURATIONS.work;
      showToast('⏱️ Перерыв окончен. Снова в бой!');
    }
    document.getElementById('pomoStartBtn').textContent = '▶ Старт';
    pomoRender();
  }
}

function pomoReset() {
  clearInterval(pomoState.interval);
  pomoState = { running: false, mode: 'work', secondsLeft: POMO_DURATIONS.work, sessions: pomoState.sessions, interval: null };
  document.getElementById('pomoStartBtn').textContent = '▶ Старт';
  pomoRender();
}

// Изменение длительности фокуса/перерыва кнопками +/- (шаг 5 минут)
function pomoAdjustDuration(mode, deltaMinutes) {
  const newSeconds = Math.max(60, POMO_DURATIONS[mode] + deltaMinutes * 60);
  POMO_DURATIONS[mode] = newSeconds;
  try { localStorage.setItem('pomo_durations', JSON.stringify(POMO_DURATIONS)); } catch(e) {}

  pomoUpdateDurationLabels();

  // Если таймер сейчас не запущен и мы меняем длительность активного режима — обновляем обратный отсчёт сразу
  if (!pomoState.running && pomoState.mode === mode) {
    pomoState.secondsLeft = newSeconds;
    pomoRender();
  }
}

function pomoUpdateDurationLabels() {
  const workEl = document.getElementById('pomoWorkMin');
  const breakEl = document.getElementById('pomoBreakMin');
  if (workEl) workEl.textContent = Math.round(POMO_DURATIONS.work / 60) + ' мин';
  if (breakEl) breakEl.textContent = Math.round(POMO_DURATIONS.break / 60) + ' мин';
}

function pomoRender() {
  const m = Math.floor(pomoState.secondsLeft / 60);
  const s = pomoState.secondsLeft % 60;
  document.getElementById('pomoCountdown').textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  document.getElementById('pomoMode').textContent = pomoState.mode === 'work' ? 'Фокус' : 'Перерыв';
  document.getElementById('pomoSessions').textContent = 'Сессий сегодня: ' + pomoState.sessions;
  const total = POMO_DURATIONS[pomoState.mode];
  const progress = (total - pomoState.secondsLeft) / total;
  const offset = CIRCUMFERENCE * (1 - progress);
  document.getElementById('pomoArc').style.strokeDashoffset = offset;
  document.getElementById('pomoArc').style.strokeDasharray = CIRCUMFERENCE;
  const ring = document.getElementById('pomoRing');
  if (pomoState.mode === 'break') ring.classList.add('break');
  else ring.classList.remove('break');
}

// ===== MOBILE KEYBOARD TOOLBAR =====
function pgGetActiveTa() {
  return document.getElementById('pg-editor');
}
function pgGetActiveLang() {
  if (typeof pgActiveFile === 'string' && pgActiveFile) {
    const ext = pgActiveFile.split('.').pop().toLowerCase();
    if (ext === 'css') return 'css';
    if (ext === 'js')  return 'js';
    return 'html';
  }
  return 'html';
}
function pgMobileIns(e, snippet) {
  e.preventDefault();
  const ta = pgGetActiveTa();
  if (!ta) return;
  // snippet uses | as cursor marker, e.g. "{}|" means cursor goes inside: "{|}"
  // But we want cursor INSIDE pairs, so "{|}": insert "{}" cursor between
  // Actually our convention: "{}|" = cursor after; let me fix — use standard insertSnippet
  // Rewrite: for pairs like {} () [] "" '' <>, put cursor inside
  insertSnippet(ta, snippet);
}
function pgMobileTab(e) {
  e.preventDefault();
  const ta = pgGetActiveTa();
  if (!ta) return;
  ta.focus();
  // Replicate desktop Tab logic: Emmet expansion or 2 spaces
  const lang = pgGetActiveLang();
  const word = getWordBefore(ta);
  const map = lang === 'html' ? EMMET_HTML : lang === 'css' ? EMMET_CSS : EMMET_JS;
  if (word && map[word]) {
    const charBeforeWord = ta.value[ta.selectionStart - word.length - 1];
    const extraLen = charBeforeWord === '<' ? 1 : 0;
    const start = ta.selectionStart - word.length - extraLen;
    ta.value = ta.value.substring(0, start) + ta.value.substring(ta.selectionStart);
    ta.selectionStart = ta.selectionEnd = start;
    insertSnippet(ta, map[word]);
    showToast('✨ Emmet: ' + word);
  } else {
    insertSnippet(ta, '  |');
  }
}
function pgMobileUndo(e) {
  e.preventDefault();
  const ta = pgGetActiveTa();
  if (!ta) return;
  ta.focus();
  document.execCommand('undo');
}

// Init playground with blank template on first load
document.addEventListener('DOMContentLoaded', () => {
  loadTemplate('blank');
  pomoRender();
  if (typeof pomoUpdateDurationLabels === 'function') pomoUpdateDurationLabels();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeGuide();

  // Цифры 1–9 переключают вкладки (если не в поле ввода)
  if (!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const tabOrder = ['html','css','js','ts','react','guides','mistakes','resources','roadmap','calendar','figma','playground','git','cheatsheets'];
    const idx = parseInt(e.key) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < tabOrder.length) {
      const tabs = document.querySelectorAll('.tab');
      const target = tabOrder[idx];
      let matchBtn = null;
      tabs.forEach(t => { if ((t.getAttribute('data-sec') === target) || t.textContent.trim().toLowerCase().startsWith(target.slice(0,3))) { if (!matchBtn) matchBtn = t; } });
      // Find more precisely using onclick attribute
      tabs.forEach(t => {
        const oc = t.getAttribute('onclick') || '';
        if (oc.includes("'" + target + "'")) matchBtn = t;
      });
      if (matchBtn) { matchBtn.click(); showToast('Вкладка ' + e.key + ' — ' + (matchBtn.textContent.trim().replace(/\d+\/\d+/,'').trim())); }
    }
  }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // ===== SPLASH SCREEN =====
  // Apply dark mode before hiding splash so there's no flash
  if (localStorage.getItem('darkMode') === '1') {
    document.body.classList.add('dark');
    document.getElementById('darkBtn').innerHTML = '<iconify-icon icon="tabler:sun" width="14" height="14" style="vertical-align:middle"></iconify-icon> Светлая';
  }
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.add('splash-hidden');
  }, 1400);

  // ===== ANIMATED PROGRESS BAR =====
  // Start at 0, then animate to real value after a short delay
  const fill = document.getElementById('prog-fill');
  if (fill) {
    const targetWidth = fill.style.width; // already set above
    fill.style.width = '0%';
    fill.classList.add('animating');
    setTimeout(() => {
      fill.style.width = targetWidth;
      setTimeout(() => fill.classList.remove('animating'), 2200);
    }, 600);
  }

  // Назначаем id каждому чекбоксу и восстанавливаем состояние из localStorage
  const all = document.querySelectorAll('input[type=checkbox]');
  all.forEach((cb, i) => {
    cb.id = 'cb_' + i;
    const saved = localStorage.getItem('cb_' + i);
    if (saved === '1') {
      cb.checked = true;
      const item = cb.closest('.item');
         if (item) item.classList.add('checked');
    }
  });
  // Пересчитываем прогресс при загрузке
  const done = document.querySelectorAll('input[type=checkbox]:checked');
  const pct = all.length ? Math.round(done.length / all.length * 100) : 0;
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-label').textContent = `Прогресс: ${done.length} / ${all.length} тем изучено (${pct}%)`;
  updateTabBadges();
  updatePdcBars();

  // ===== КНОПКИ ЗАКЛАДОК на каждом блоке =====
  document.querySelectorAll('.block').forEach((block, i) => {
    const blockId = block.id || ('block_auto_bm_' + i);
    const bmKey = 'bm_' + blockId;
    const isBm = localStorage.getItem(bmKey) === '1';
    if (isBm) block.classList.add('bookmarked');

    const btn = document.createElement('button');
    btn.className = 'bm-btn' + (isBm ? ' active' : '');
    btn.title = isBm ? 'Убрать из закладок' : 'Добавить в закладки';
    btn.textContent = isBm ? '★' : '☆';
    btn.onclick = (e) => {
      e.stopPropagation();
      const active = block.classList.toggle('bookmarked');
      btn.classList.toggle('active', active);
      btn.textContent = active ? '★' : '☆';
      btn.title = active ? 'Убрать из закладок' : 'Добавить в закладки';
      localStorage.setItem(bmKey, active ? '1' : '0');
      const filterActive = document.querySelector('.wrap')?.classList.contains('bm-filter-active');
      if (filterActive) {
        const hasBookmarks = document.querySelectorAll('.block.bookmarked').length > 0;
        const emptyEl = document.getElementById('bm-empty-msg');
        if (emptyEl) emptyEl.style.display = hasBookmarks ? 'none' : 'block';
      }
    };
    const titleEl = block.querySelector('.block-title');
    if (titleEl) titleEl.appendChild(btn);
  });
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top';
  scrollBtn.innerHTML = '↑';
  scrollBtn.title = 'Наверх';
  scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(scrollBtn);
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 400);
  });

  // Init tools (инициализация инструментов)
  updateShadow();
  applyColor('#6366f1');
  updateUnits();
  runRegex();
  updateGradient();
  updateFontScale();

  // ===== COPY BUTTONS on every .code block =====
  document.querySelectorAll('.code').forEach(codeEl => {
    const wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    codeEl.parentNode.insertBefore(wrap, codeEl);
    wrap.appendChild(codeEl);

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Копировать';
    btn.title = 'Скопировать код';
    btn.onclick = () => {
      const text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Скопировано';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Копировать'; btn.classList.remove('copied'); }, 2000);
      }).catch(() => {
        btn.textContent = '✗ Ошибка';
        setTimeout(() => { btn.textContent = 'Копировать'; }, 2000);
      });
    };
    wrap.appendChild(btn);
  });

  // ===== ЗАМЕТКИ НА КАЖДОМ БЛОКЕ =====
  document.querySelectorAll('.block').forEach((block, i) => {
    const blockId = block.id || ('block_auto_' + i);
    if (!block.id) block.id = blockId;
    const noteKey = 'note_' + blockId;
    const savedNote = localStorage.getItem(noteKey) || '';

    const toggle = document.createElement('button');
    toggle.className = 'note-toggle' + (savedNote ? ' has-note' : '');
    toggle.innerHTML = '📝 ' + (savedNote ? 'Моя заметка' : 'Добавить заметку');
    toggle.title = 'Добавить личную заметку к этому блоку';

    const noteArea = document.createElement('div');
    noteArea.className = 'note-area';
    noteArea.style.display = 'none';

    const ta = document.createElement('textarea');
    ta.className = 'note-textarea';
    ta.placeholder = 'Личная заметка — сохраняется автоматически в браузере...';
    ta.value = savedNote;
    ta.setAttribute('spellcheck', 'false');

    ta.addEventListener('input', () => {
      const val = ta.value;
      if (val.trim()) {
        localStorage.setItem(noteKey, val);
        toggle.classList.add('has-note');
        toggle.innerHTML = '📝 Моя заметка';
      } else {
        localStorage.removeItem(noteKey);
        toggle.classList.remove('has-note');
        toggle.innerHTML = '📝 Добавить заметку';
      }
    });

    toggle.addEventListener('click', () => {
      const isOpen = noteArea.style.display !== 'none';
      noteArea.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) ta.focus();
    });

    noteArea.appendChild(ta);
    block.appendChild(toggle);
    block.appendChild(noteArea);

    // Открыть если есть сохранённая заметка
    if (savedNote) noteArea.style.display = 'block';
  });

  // ===== RESTORE TAB FROM URL HASH =====
  if (location.hash) {
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const secMatch = id.match(/^sec-(\w+)$/);
      if (secMatch) {
        const tabBtn = document.querySelector(`[data-sec="${secMatch[1]}"]`);
        if (tabBtn) switchTab(secMatch[1], tabBtn);
      }
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }
});

// ================================================================
// GITHUB BROWSER
// ================================================================
const GH_API = 'https://api.github.com';
let ghSearchType = 'repos';         // 'repos' | 'users'
let ghCurrentRepo = null;           // { owner, repo }
let ghPathStack  = [];              // навигация по папкам

function ghSetType(type, btn) {
  ghSearchType = type;
  document.querySelectorAll('.gh-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function ghQuickSearch(q) {
  document.getElementById('ghSearchInput').value = q;
  ghSearch();
}

async function ghSearch() {
  const q = document.getElementById('ghSearchInput').value.trim();
  if (!q) return;
  ghShowStatus('🔍 Ищем «' + q + '»…');
  ghClearResults();
  ghCurrentRepo = null;
  ghPathStack = [];
  try {
    const url = ghSearchType === 'repos'
      ? `${GH_API}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=15`
      : `${GH_API}/search/users?q=${encodeURIComponent(q)}&per_page=15`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (res.status === 403) { ghRateLimit(); return; }
    const data = await res.json();
    ghHideStatus();
    if (ghSearchType === 'repos') ghRenderRepos(data.items || []);
    else ghRenderUsers(data.items || []);
  } catch(e) {
    ghShowStatus('❌ Ошибка сети. Проверь подключение.');
  }
}

function ghRenderRepos(repos) {
  const el = document.getElementById('ghResults');
  if (!repos.length) { ghShowStatus('Ничего не найдено 😔'); return; }
  const langColors = {
    JavaScript:'#f1e05a', TypeScript:'#3178c6', Python:'#3572A5', CSS:'#563d7c',
    HTML:'#e34c26', Vue:'#41b883', PHP:'#4F5D95', 'C++':'#f34b7d',
    Java:'#b07219', Go:'#00ADD8', Rust:'#dea584', Ruby:'#701516',
    Kotlin:'#A97BFF', Swift:'#F05138', Dart:'#00B4AB', Shell:'#89e051',
  };
  el.innerHTML = repos.map(r => `
    <div class="gh-repo-card" onclick="ghOpenRepo('${r.full_name}')">
      <button class="gh-repo-open" onclick="event.stopPropagation();window.open('${r.html_url}','_blank')">↗ GitHub</button>
      <div class="gh-repo-name">
        <span>📦</span> ${r.full_name}
        ${r.fork ? '<span style="font-size:10px;background:#6366f122;color:#6366f1;padding:2px 7px;border-radius:20px;font-weight:600">fork</span>' : ''}
      </div>
      <div class="gh-repo-desc">${r.description ? r.description.slice(0,120) : '<em style="opacity:.5">Описание не указано</em>'}</div>
      <div class="gh-repo-meta">
        ${r.language ? `<span class="gh-meta-tag"><span class="gh-lang-dot" style="background:${langColors[r.language]||'#8b949e'}"></span>${r.language}</span>` : ''}
        <span class="gh-meta-tag">⭐ ${ghFmtNum(r.stargazers_count)}</span>
        <span class="gh-meta-tag">🍴 ${ghFmtNum(r.forks_count)}</span>
        ${r.license ? `<span class="gh-meta-tag">📄 ${r.license.spdx_id}</span>` : ''}
        <span class="gh-meta-tag">👁 ${ghFmtNum(r.watchers_count)}</span>
      </div>
    </div>`).join('');
}

function ghRenderUsers(users) {
  const el = document.getElementById('ghResults');
  if (!users.length) { ghShowStatus('Никого не найдено 😔'); return; }
  el.innerHTML = users.map(u => `
    <div class="gh-user-card" onclick="ghOpenUser('${u.login}')">
      <img class="gh-user-avatar" src="${u.avatar_url}" alt="${u.login}" loading="lazy">
      <div>
        <div class="gh-user-name">@${u.login}</div>
        <div class="gh-user-login">${u.type}</div>
      </div>
      <button class="gh-user-open" onclick="event.stopPropagation();window.open('${u.html_url}','_blank')">↗ GitHub</button>
    </div>`).join('');
}

async function ghOpenRepo(fullName) {
  const [owner, repo] = fullName.split('/');
  ghCurrentRepo = { owner, repo };
  ghPathStack = [];
  ghShowStatus('📂 Загружаем ' + fullName + '…');
  ghClearResults();
  try {
    const [repoRes, contentsRes, readmeRes] = await Promise.allSettled([
      fetch(`${GH_API}/repos/${owner}/${repo}`, { headers:{Accept:'application/vnd.github.v3+json'} }),
      fetch(`${GH_API}/repos/${owner}/${repo}/contents`, { headers:{Accept:'application/vnd.github.v3+json'} }),
      fetch(`${GH_API}/repos/${owner}/${repo}/readme`, { headers:{Accept:'application/vnd.github.v3+json'} }),
    ]);
    if (repoRes.status === 'fulfilled' && repoRes.value.status === 403) { ghRateLimit(); return; }
    ghHideStatus();

    const repoData  = repoRes.status === 'fulfilled' && repoRes.value.ok ? await repoRes.value.json() : null;
    const contents  = contentsRes.status === 'fulfilled' && contentsRes.value.ok ? await contentsRes.value.json() : [];
    const readmeRaw = readmeRes.status === 'fulfilled' && readmeRes.value.ok ? await readmeRes.value.json() : null;

    const el = document.getElementById('ghResults');
    el.innerHTML = '';

    // Back button
    const back = document.createElement('div');
    back.innerHTML = `<button class="gh-back-btn" onclick="ghBackToResults()">← Назад к результатам</button>`;
    el.appendChild(back);

    // Repo header
    if (repoData) el.appendChild(ghBuildRepoHeader(repoData));

    // File tree
    if (Array.isArray(contents) && contents.length) {
      el.appendChild(ghBuildTree(contents, owner, repo, ''));
    }

    // README
    if (readmeRaw && readmeRaw.content) {
      const decoded = atob(readmeRaw.content.replace(/\n/g,''));
      el.appendChild(ghBuildReadme(decoded));
    }
  } catch(e) {
    ghShowStatus('❌ Ошибка при загрузке репозитория.');
  }
}

async function ghOpenUser(login) {
  ghShowStatus('👤 Загружаем профиль @' + login + '…');
  ghClearResults();
  try {
    const [userRes, reposRes] = await Promise.allSettled([
      fetch(`${GH_API}/users/${login}`, { headers:{Accept:'application/vnd.github.v3+json'} }),
      fetch(`${GH_API}/users/${login}/repos?sort=stars&per_page=10`, { headers:{Accept:'application/vnd.github.v3+json'} }),
    ]);
    ghHideStatus();
    const user  = userRes.status  === 'fulfilled' && userRes.value.ok  ? await userRes.value.json()  : null;
    const repos = reposRes.status === 'fulfilled' && reposRes.value.ok ? await reposRes.value.json() : [];
    const el = document.getElementById('ghResults');
    el.innerHTML = '';
    el.appendChild(Object.assign(document.createElement('div'), {
      innerHTML: `<button class="gh-back-btn" onclick="ghBackToResults()">← Назад к результатам</button>`
    }));
    if (user) {
      const card = document.createElement('div');
      card.className = 'gh-repo-header';
      card.innerHTML = `
        <div class="gh-repo-header-name">
          <img src="${user.avatar_url}" style="width:40px;height:40px;border-radius:50%;border:2px solid var(--border)">
          ${user.name || user.login}
          <span style="font-size:13px;font-weight:500;color:var(--muted)">@${user.login}</span>
        </div>
        ${user.bio ? `<div class="gh-repo-header-desc">${user.bio}</div>` : ''}
        <div class="gh-repo-header-stats">
          <span class="gh-stat-pill">👥 ${ghFmtNum(user.followers)} подписчиков</span>
          <span class="gh-stat-pill">📦 ${user.public_repos} репо</span>
          ${user.location ? `<span class="gh-stat-pill">📍 ${user.location}</span>` : ''}
          ${user.company ? `<span class="gh-stat-pill">🏢 ${user.company}</span>` : ''}
        </div>
        <button class="gh-open-gh-btn" onclick="window.open('${user.html_url}','_blank')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          Открыть профиль на GitHub
        </button>`;
      el.appendChild(card);
    }
    if (repos.length) {
      const header = document.createElement('div');
      header.innerHTML = `<div style="font-size:13px;font-weight:700;color:var(--muted);margin:4px 0 2px">⭐ Популярные репозитории</div>`;
      el.appendChild(header);
      ghRenderRepos(repos);
    }
  } catch(e) {
    ghShowStatus('❌ Ошибка при загрузке профиля.');
  }
}

async function ghOpenFolder(owner, repo, path, label) {
  ghPathStack.push({ label, path });
  ghShowStatus('📂 ' + path + '…');
  const el = document.getElementById('ghResults');
  try {
    const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers:{Accept:'application/vnd.github.v3+json'}
    });
    if (res.status === 403) { ghRateLimit(); return; }
    const items = await res.json();
    ghHideStatus();
    // rebuild: back + breadcrumb + tree
    el.innerHTML = '';
    el.appendChild(Object.assign(document.createElement('div'), {
      innerHTML: `<button class="gh-back-btn" onclick="ghFolderBack()">← Назад</button>`
    }));
    // Breadcrumb
    const bc = document.createElement('div');
    bc.className = 'gh-breadcrumb';
    bc.innerHTML = `<span onclick="ghOpenRepo('${owner}/${repo}')">${owner}/${repo}</span>`;
    ghPathStack.forEach((p,i) => {
      bc.innerHTML += `<span class="sep">/</span><span onclick="ghBreadcrumbJump(${i})">${p.label}</span>`;
    });
    el.appendChild(bc);
    if (Array.isArray(items)) el.appendChild(ghBuildTree(items, owner, repo, path));
  } catch(e) {
    ghShowStatus('❌ Ошибка при загрузке папки.');
  }
}

async function ghOpenFile(owner, repo, path, fileName) {
  ghShowStatus('📄 Загружаем файл…');
  try {
    const res = await fetch(`${GH_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers:{Accept:'application/vnd.github.v3+json'}
    });
    if (res.status === 403) { ghRateLimit(); return; }
    const data = await res.json();
    ghHideStatus();
    const content = data.content ? atob(data.content.replace(/\n/g,'')) : '(не удалось декодировать)';
    const el = document.getElementById('ghResults');
    el.innerHTML = '';
    el.appendChild(Object.assign(document.createElement('div'), {
      innerHTML: `<button class="gh-back-btn" onclick="ghFolderBack()">← Назад</button>`
    }));
    // Breadcrumb
    const bc = document.createElement('div');
    bc.className = 'gh-breadcrumb';
    bc.innerHTML = `<span onclick="ghOpenRepo('${owner}/${repo}')">${owner}/${repo}</span>`;
    ghPathStack.forEach((p,i) => {
      bc.innerHTML += `<span class="sep">/</span><span onclick="ghBreadcrumbJump(${i})">${p.label}</span>`;
    });
    bc.innerHTML += `<span class="sep">/</span><span style="color:var(--text)">${fileName}</span>`;
    el.appendChild(bc);
    const fileView = document.createElement('div');
    fileView.className = 'gh-file-view';
    const lines = content.split('\n').length;
    fileView.innerHTML = `
      <div class="gh-file-header">
        <span class="gh-file-name">${fileName}</span>
        <div class="gh-file-actions">
          <span style="font-size:11px;color:var(--muted)">${lines} строк · ${ghFmtSize(data.size)}</span>
          <button class="gh-file-action-btn" onclick="navigator.clipboard.writeText(document.getElementById('ghFileContent').textContent).then(()=>showToast('Скопировано!'))">📋 Копировать</button>
          <button class="gh-file-action-btn" onclick="ghDownloadFile('${fileName}', document.getElementById('ghFileContent').textContent)">⬇ Скачать</button>
          <button class="gh-file-action-btn" onclick="window.open('${data.html_url}','_blank')">↗ GitHub</button>
        </div>
      </div>
      <pre class="gh-file-content" id="ghFileContent">${ghEscape(content)}</pre>`;
    el.appendChild(fileView);
  } catch(e) {
    ghShowStatus('❌ Ошибка при загрузке файла.');
  }
}

function ghDownloadFile(name, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('⬇ Скачивание…');
}

function ghBuildRepoHeader(r) {
  const el = document.createElement('div');
  el.className = 'gh-repo-header';
  el.innerHTML = `
    <div class="gh-repo-header-name">
      <span>📦</span>${r.full_name}
      ${r.private ? '<span style="font-size:11px;background:#f9731622;color:#f97316;padding:2px 7px;border-radius:20px">private</span>' : ''}
    </div>
    ${r.description ? `<div class="gh-repo-header-desc">${r.description}</div>` : ''}
    ${r.topics && r.topics.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${r.topics.slice(0,8).map(t=>`<span style="background:#6366f122;color:#6366f1;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600">${t}</span>`).join('')}</div>` : ''}
    <div class="gh-repo-header-stats">
      <span class="gh-stat-pill">⭐ ${ghFmtNum(r.stargazers_count)}</span>
      <span class="gh-stat-pill">🍴 ${ghFmtNum(r.forks_count)}</span>
      <span class="gh-stat-pill">👁 ${ghFmtNum(r.watchers_count)}</span>
      ${r.open_issues_count ? `<span class="gh-stat-pill">🐛 ${r.open_issues_count} issues</span>` : ''}
      ${r.language ? `<span class="gh-stat-pill">💻 ${r.language}</span>` : ''}
      ${r.license ? `<span class="gh-stat-pill">📄 ${r.license.spdx_id}</span>` : ''}
    </div>
    <button class="gh-open-gh-btn" onclick="window.open('${r.html_url}','_blank')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      Открыть на GitHub
    </button>
    <button class="gh-open-gh-btn" style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);margin-left:8px;" onclick="window.open('${r.html_url}/archive/refs/heads/${r.default_branch}.zip','_blank')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-6-6h4V4h4v6h4l-6 6zm-7 2h14v2H5v-2z"/></svg>
      Скачать ZIP
    </button>`;
  return el;
}

function ghBuildTree(items, owner, repo, basePath) {
  const sorted = [...items].sort((a,b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  const wrap = document.createElement('div');
  wrap.className = 'gh-file-tree';
  wrap.innerHTML = `<div class="gh-tree-header">📁 Файлы</div>` +
    sorted.map(item => {
      const isDir = item.type === 'dir';
      const icon = isDir ? '📂' : ghFileIcon(item.name);
      const size = isDir ? '' : `<span class="gh-tree-size">${ghFmtSize(item.size)}</span>`;
      const onclick = isDir
        ? `ghOpenFolder('${owner}','${repo}','${item.path}','${item.name}')`
        : `ghPathStack.push({label:'${item.name}',path:'${item.path}'});ghOpenFile('${owner}','${repo}','${item.path}','${item.name}')`;
      return `<div class="gh-tree-item" onclick="${onclick}">
        <span class="gh-tree-icon">${icon}</span>
        <span class="gh-tree-name">${item.name}</span>
        ${size}
      </div>`;
    }).join('');
  return wrap;
}

function ghBuildReadme(rawText) {
  const el = document.createElement('div');
  el.className = 'gh-readme';

  // Step 1: stash fenced code blocks before any escaping
  const codeBlocks = [];
  let html = rawText.replace(/```([\w]*)\r?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const i = codeBlocks.length;
    codeBlocks.push({ lang: lang || '', code });
    return `\x00CODE${i}\x00`;
  });

  // Step 2: stash inline code
  const inlineCodes = [];
  html = html.replace(/`([^`\n]+)`/g, (_, code) => {
    const i = inlineCodes.length;
    inlineCodes.push(code);
    return `\x00INLINE${i}\x00`;
  });

  // Step 3: escape HTML in remaining text
  html = html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Step 4: markdown rules
  // Images before links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" loading="lazy" style="max-width:100%;border-radius:6px;margin:6px 0">');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Headings
  html = html.replace(/^#### (.+)$/gm,'<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  // Bold + italic combo first
  html = html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)([^*\n]+)(?<!\*)\*(?!\*)/g,'<em>$1</em>');
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g,'<del>$1</del>');
  // Blockquotes (raw > before escaping became &gt; — use the escaped form)
  html = html.replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>');
  // Horizontal rule
  html = html.replace(/^([-*_]){3,}$/gm,'<hr>');
  // Lists (wrap consecutive <li> in <ul>)
  html = html.replace(/^\s*[-*+] (.+)$/gm,'<li>$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm,'<li class="ol">$1</li>');
  html = html.replace(/(<li(?:\s[^>]*)?>[\s\S]*?<\/li>\n?)+/g, m => {
    if (m.includes('class="ol"')) return `<ol>${m.replace(/ class="ol"/g,'')}</ol>`;
    return `<ul>${m}</ul>`;
  });

  // Step 5: paragraphs — split on blank lines, skip block-level tags
  const blockTags = /^<(h[1-6]|ul|ol|blockquote|hr|pre|img)/;
  html = html.split(/\n{2,}/).map(block => {
    const t = block.trim();
    if (!t) return '';
    if (blockTags.test(t)) return t;
    return '<p>' + t.replace(/\n/g,'<br>') + '</p>';
  }).join('\n');

  // Step 6: restore inline code
  html = html.replace(/\x00INLINE(\d+)\x00/g, (_, i) => {
    const safe = inlineCodes[i].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<code>${safe}</code>`;
  });

  // Step 7: restore fenced code blocks
  html = html.replace(/\x00CODE(\d+)\x00/g, (_, i) => {
    const { lang, code } = codeBlocks[i];
    const safe = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<pre><code${lang ? ` class="lang-${lang}"` : ''}>${safe}</code></pre>`;
  });

  el.innerHTML = `<div class="gh-readme-header">📖 README</div><div class="gh-readme-body">${html}</div>`;
  return el;
}

function ghFolderBack() {
  if (!ghCurrentRepo) { ghBackToResults(); return; }
  ghPathStack.pop();
  if (ghPathStack.length === 0) {
    ghOpenRepo(ghCurrentRepo.owner + '/' + ghCurrentRepo.repo);
  } else {
    const prev = ghPathStack[ghPathStack.length - 1];
    ghOpenFolder(ghCurrentRepo.owner, ghCurrentRepo.repo, prev.path, prev.label);
  }
}

function ghBreadcrumbJump(idx) {
  if (!ghCurrentRepo) return;
  const target = ghPathStack[idx];
  ghPathStack = ghPathStack.slice(0, idx);
  ghOpenFolder(ghCurrentRepo.owner, ghCurrentRepo.repo, target.path, target.label);
}

function ghBackToResults() {
  ghCurrentRepo = null; ghPathStack = [];
  document.getElementById('ghResults').innerHTML = '';
  ghHideStatus();
}

function ghRateLimit() {
  ghHideStatus();
  document.getElementById('ghRateWarn').classList.add('visible');
  setTimeout(() => document.getElementById('ghRateWarn').classList.remove('visible'), 10000);
}

function ghShowStatus(msg) {
  const el = document.getElementById('ghStatus');
  el.textContent = msg; el.classList.add('visible');
}
function ghHideStatus() {
  document.getElementById('ghStatus').classList.remove('visible');
}
function ghClearResults() {
  document.getElementById('ghResults').innerHTML = '';
}

function ghFmtNum(n) {
  if (n >= 1000) return (n/1000).toFixed(1) + 'k';
  return n || 0;
}
function ghFmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(1) + ' MB';
}
function ghEscape(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function ghFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const icons = {
    js:'🟨', ts:'🔷', html:'🟧', css:'🎨', json:'📋', md:'📝',
    py:'🐍', php:'🐘', cpp:'⚙️', c:'⚙️', java:'☕', go:'🐹',
    rs:'🦀', vue:'💚', jsx:'⚛️', tsx:'⚛️', svg:'🖼️', png:'🖼️',
    jpg:'🖼️', gif:'🖼️', sh:'🖥️', yml:'⚙️', yaml:'⚙️', env:'🔑',
    gitignore:'🚫', lock:'🔒', txt:'📄', pdf:'📕',
  };
  return icons[ext] || '📄';
}

// ===== ТРЕНАЖЕР: логика проверки тестов =====

function checkQuiz(id) {
  const cfg = QUIZ_ANSWERS[id];
  if (!cfg) return;

  // Проверяем тест
  let quizPassed = true;
  for (const [name, correct] of Object.entries(cfg.quiz)) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    if (!selected || selected.value !== correct) {
      quizPassed = false;
      break;
    }
  }

  // Проверяем практику
  const practiceInput = document.getElementById(cfg.practice.id);
  const practiceVal = practiceInput ? practiceInput.value : '';
  const practicePassed = practiceVal.trim().length > 0 && cfg.practice.check(practiceVal);

  const resultEl = document.getElementById('result-' + id);
  if (!resultEl) return;

  if (!quizPassed && !practicePassed) {
    resultEl.className = 'quiz-result wrong';
    resultEl.textContent = '❌ Тест и практика не пройдены. Перечитай тему и попробуй ещё раз.';
    return;
  }
  if (!quizPassed) {
    resultEl.className = 'quiz-result wrong';
    resultEl.textContent = '❌ Тест не пройден — проверь ответы на вопросы.';
    return;
  }
  if (!practicePassed) {
    resultEl.className = 'quiz-result wrong';
    resultEl.textContent = '❌ Практика не зачтена. Подсказка: ' + cfg.practice.hint;
    return;
  }

  // Всё прошло — разблокируем чекбоксы и запоминаем что квиз пройден
  resultEl.className = 'quiz-result correct';
  resultEl.textContent = '✅ Отлично! Тест и практика пройдены. Чекбоксы разблокированы!';

  try { localStorage.setItem('quiz_passed_' + id, '1'); } catch(e) {}

  unlockQuizItems(id);

  showToast('🎉 Тема пройдена! Отметь чекбоксы прогресса.');
}

// Разблокирует чекбоксы для квиза (используется и при прохождении, и при восстановлении)
function unlockQuizItems(id) {
  const itemsContainer = document.getElementById('items-' + id);
  if (itemsContainer) {
    itemsContainer.querySelectorAll('.item.locked').forEach(item => {
      item.classList.remove('locked');
      const cb = item.querySelector('input[type=checkbox]');
      if (cb) {
        cb.disabled = false;
        // Убираем 🔒 из текста
        const span = item.querySelector('span');
        if (span && span.textContent.startsWith('🔒 ')) {
          span.textContent = span.textContent.slice(3);
        }
      }
    });
  }
  const notice = itemsContainer ? itemsContainer.nextElementSibling : null;
  if (notice && notice.classList.contains('locked-items-notice')) {
    notice.style.display = 'none';
  }
  const resultEl = document.getElementById('result-' + id);
  if (resultEl && !resultEl.textContent) {
    resultEl.className = 'quiz-result correct';
    resultEl.textContent = '✅ Тема уже пройдена ранее.';
  }
}


// ===== GITHUB UPLOAD =====
async function githubUpload() {
  const username  = document.getElementById('gh-username').value.trim();
  const repo      = document.getElementById('gh-repo').value.trim();
  const token     = document.getElementById('gh-token').value.trim();
  const filepath  = document.getElementById('gh-filepath').value.trim() || 'index.html';
  const branch    = document.getElementById('gh-branch').value.trim() || 'main';
  const message   = document.getElementById('gh-message').value.trim() || 'update: roadmap content';
  const fileInput = document.getElementById('gh-file-input');
  const statusEl  = document.getElementById('gh-status');

  const show = (msg, ok) => {
    statusEl.style.display = 'block';
    statusEl.style.background = ok ? '#0d2d1a' : '#2d0d0d';
    statusEl.style.border = '1px solid ' + (ok ? '#238636' : '#da3633');
    statusEl.style.color = ok ? '#3fb950' : '#f85149';
    statusEl.innerHTML = msg;
  };

  if (!username || !repo || !token) return show('❌ Заполни Username, Repository и Token', false);
  if (!fileInput.files.length) return show('❌ Выбери файл для загрузки', false);

  show('⏳ Читаем файл...', true);
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filepath}`;
    const headers = {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    try {
      show('⏳ Проверяем существующий файл...', true);
      let sha = null;
      const getRes = await fetch(apiUrl + '?ref=' + branch, { headers });
      if (getRes.ok) { sha = (await getRes.json()).sha; show('⏳ Обновляем файл...', true); }
      else { show('⏳ Создаём новый файл...', true); }

      const body = { message, content: base64, branch };
      if (sha) body.sha = sha;

      const putRes = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
      const result = await putRes.json();

      if (putRes.ok) {
        const commitUrl = result.commit?.html_url || `https://github.com/${username}/${repo}`;
        const pagesUrl  = `https://${username}.github.io/${repo}/`;
        show(`✅ Push успешен! Коммит: <a href="${commitUrl}" target="_blank" style="color:#58a6ff">${result.commit?.sha?.slice(0,7)}</a><br>
              🌐 GitHub Pages: <a href="${pagesUrl}" target="_blank" style="color:#58a6ff">${pagesUrl}</a>`, true);
      } else {
        const m = result.message || '';
        if (m.includes('Bad credentials')) show('❌ Неверный токен. Нужен scope <b>repo</b>', false);
        else if (m.includes('Not Found')) show(`❌ Репо <b>${username}/${repo}</b> не найдено`, false);
        else show('❌ Ошибка: ' + m, false);
      }
    } catch(err) { show('❌ Сетевая ошибка: ' + err.message, false); }
  };
  reader.readAsDataURL(fileInput.files[0]);
}


// ===== PLAYGROUND DOWNLOAD =====
function downloadPlayground(type) {
  const tabs = window._pgTabs || [];
  if (!tabs.length) {
    // Fallback: читаем активные редакторы
    const htmlEl = document.querySelector('.pg-editor[data-lang="html"] textarea, #pg-html');
    const cssEl  = document.querySelector('.pg-editor[data-lang="css"] textarea, #pg-css');
    const jsEl   = document.querySelector('.pg-editor[data-lang="js"] textarea, #pg-js');
    const h = htmlEl ? htmlEl.value : '';
    const c = cssEl  ? cssEl.value  : '';
    const j = jsEl   ? jsEl.value   : '';

    if (type === 'html') {
      const full = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
${c}
</style>
</head>
<body>
${h}
<script>
${j}
<\/script>

      <div class="ai-modal-title">ИИ-помощник по теме</div>
      <button class="ai-modal-close" onclick="closeAiModal()">✕</button>
    </div>

    <div class="ai-context-pill" id="aiContextPill" style="display:none">
      <div class="ai-context-label">📌 Контекст</div>
      <div id="aiContextText"></div>
    </div>

    <div class="ai-messages" id="aiMessages"></div>

    <div class="ai-quick-btns" id="aiQuickBtns">
      <button class="ai-quick-btn" onclick="aiQuickAsk('Объясни проще, как будто мне 10 лет')">🧒 Объясни проще</button>
      <button class="ai-quick-btn" onclick="aiQuickAsk('Дай практический пример с кодом')">💻 Пример с кодом</button>
      <button class="ai-quick-btn" onclick="aiQuickAsk('Какие частые ошибки делают новички с этим?')">⚠️ Частые ошибки</button>
      <button class="ai-quick-btn" onclick="aiQuickAsk('Где это применяется в реальных проектах?')">🚀 Где применяется</button>
    </div>

    <div class="ai-input-row">
      <textarea class="ai-input" id="aiInput" placeholder="Задай любой вопрос..." rows="1"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendAiMessage()}"
        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'"></textarea>
      <button class="ai-send-btn" id="aiSendBtn" onclick="sendAiMessage()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</div>


<!-- ===== AI FAB ===== -->
<button class="ai-fab" id="aiFab" onclick="toggleAiChat()" title="ИИ-помощник">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <circle cx="9" cy="10" r="1" fill="#fff"/><circle cx="12" cy="10" r="1" fill="#fff"/><circle cx="15" cy="10" r="1" fill="#fff"/>
  </svg>
  <div class="ai-fab-badge" id="aiFabBadge">!</div>
</button>

<!-- ===== AI SELECTION POPUP ===== -->
<button class="ai-sel-popup" id="aiSelPopup" onclick="aiAskFromSelection()">
  ✨ Спросить ИИ
</button>

<!-- ===== AI CHAT WINDOW ===== -->
<div class="ai-chat-win" id="aiChatWin">

  <!-- Header -->
  <div class="ai-chat-head">
    <div class="ai-chat-head-icon">✨</div>
    <div class="ai-chat-head-title">
      <div>ИИ-помощник</div>
      <div id="aiModelLabel">Выбери модель →</div>
    </div>
    <select class="ai-model-select" id="aiModelSelect" onchange="aiOnModelChange()">
      <option value="" disabled selected>Добавь модель в настройках ИИ</option>
    </select>
    <button class="ai-chat-close" onclick="toggleAiChat()">✕</button>
  </div>

  <!-- Context pill -->
  <div class="ai-ctx" id="aiCtx">
    <strong>📌 Контекст из темы</strong>
    <span id="aiCtxText"></span>
  </div>

  <!-- Messages -->
  <div class="ai-chat-msgs" id="aiMsgs">
    <div class="ai-msg bot">
      <div class="ai-msg-av">✨</div>
      <div class="ai-msg-bbl">
        Привет! Я ИИ-помощник по веб-разработке 👋<br><br>
        Выдели любой текст на странице и нажми <b>«Спросить ИИ»</b> — я объясню именно эту тему.<br><br>
        Или просто напиши свой вопрос ниже.
      </div>
    </div>
  </div>

  <!-- Quick buttons -->
  <div class="ai-quick-row" id="aiQuickRow">
    <button class="ai-qbtn" onclick="aiQuick('Что такое замыкание в JS?')">Замыкания JS</button>
    <button class="ai-qbtn" onclick="aiQuick('Объясни разницу между == и ===')">== vs ===</button>
    <button class="ai-qbtn" onclick="aiQuick('Что такое useState в React?')">useState</button>
    <button class="ai-qbtn" onclick="aiQuick('Как работает flexbox?')">Flexbox</button>
  </div>

  <!-- Input -->
  <div class="ai-inp-row">
    <textarea class="ai-inp" id="aiInp" placeholder="Задай вопрос..." rows="1"
      onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();aiSend()}"
      oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,90)+'px'"></textarea>
    <button class="ai-send" id="aiSendBtn" onclick="aiSend()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  </div>
</div>

</body>
</html>`;
      _pgDownload('index.html', full);
    } else {
      _pgDownload('index.html', `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="style.css">
</head>
<body>
${h}
<script src="script.js"><\/script>
</body>
</html>`);
      _pgDownload('style.css', c);
      _pgDownload('script.js', j);
    }
    return;
  }

  if (type === 'html') {
    const h = tabs.find(t=>t.lang==='html')?.content || '';
    const c = tabs.find(t=>t.lang==='css')?.content  || '';
    const j = tabs.find(t=>t.lang==='js')?.content   || '';
    const full = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
${c}
</style>
</head>
<body>
${h}
<script>
${j}
<\/script>
</body>
</html>`;
    _pgDownload('index.html', full);
  } else {
    tabs.forEach(t => {
      const ext = t.lang === 'html' ? 'html' : t.lang === 'css' ? 'css' : 'js';
      _pgDownload(`${t.name || 'file'}.${ext}`, t.content || '');
    });
  }
}

function _pgDownload(filename, content) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], {type: 'text/plain'}));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}




// ===== AI CHAT =====
let aiHistory = [];
let aiLoading = false;
let aiSelText  = '';
let aiChatOpen = false;
const AI_HISTORY_KEY = 'webdevgym_ai_chat_history_v1';
const AI_HISTORY_LIMIT = 40;
const AI_ATTACH_TEXT_LIMIT = 12000;
const AI_ATTACH_TOTAL_TEXT_LIMIT = 30000;
const AI_ATTACH_VISION_MAX_BYTES = 4 * 1024 * 1024;
const AI_ATTACH_MAX_FILES = 8;
let aiAttachments = [];

const AI_TEXT_EXTENSIONS = new Set([
  'txt','md','markdown','html','htm','css','scss','sass','less','js','jsx','ts','tsx','json','jsonl','xml','svg',
  'csv','tsv','yml','yaml','toml','ini','env','gitignore','sql','php','py','java','c','cpp','cs','go','rs','rb',
  'vue','svelte','astro','log','config','lock'
]);

// ---- FAB toggle ----
function toggleAiChat() {
  aiChatOpen = !aiChatOpen;
  const win = document.getElementById('aiChatWin');
  if (aiChatOpen) {
    win.classList.add('open');
    const badge = document.getElementById('aiFabBadge');
    if (badge) badge.style.display = 'none';
    const inp = document.getElementById('aiInp');
    if (inp) inp.focus();
    // Перестраиваем список моделей (могли добавить/удалить во вкладке ИИ) и обновляем лейбл
    if (typeof aiRebuildModelSelect === 'function') aiRebuildModelSelect();
    aiOnModelChange();
  } else {
    win.classList.remove('open');
  }
}

// ---- Model label ----
function aiOnModelChange() {
  const sel = document.getElementById('aiModelSelect');
  const lbl = document.getElementById('aiModelLabel');
  if (!sel || !lbl) return;
  const value = sel.value || '';
  const model = value.startsWith('custom:')
    ? aiGetCustomModels().find(item => item.id === value.slice(7))
    : null;
  if (model) {
    localStorage.setItem('ai_active_custom_model_id', model.id);
    const capabilities = [model.vision ? 'Vision' : '', model.imageGeneration ? 'Image' : ''].filter(Boolean);
    lbl.textContent = model.model + (capabilities.length ? ' · ' + capabilities.join(' · ') : '');
  } else {
    lbl.textContent = "Выбери модель";
  }
  Array.from(sel.options).forEach(option => {
    option.textContent = option.textContent.replace(/s+✓$/, '') + (option.value === value && value ? ' ✓' : '');
  });
}
// aiOnModelChange called on first open

function aiNormalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(msg => msg && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string')
    .map(msg => ({
      role: msg.role,
      content: msg.content.slice(0, 8000),
      display: typeof msg.display === 'string' ? msg.display.slice(0, 8000) : undefined,
      image: typeof msg.image === 'string' && !msg.image.startsWith('data:') ? msg.image : undefined
    }))
    .slice(-AI_HISTORY_LIMIT);
}

function aiSaveHistory() {
  try {
    aiHistory = aiNormalizeHistory(aiHistory);
    localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(aiHistory));
  } catch (e) {}
}

function aiLoadHistory() {
  try {
    aiHistory = aiNormalizeHistory(JSON.parse(localStorage.getItem(AI_HISTORY_KEY) || '[]'));
  } catch (e) {
    aiHistory = [];
  }
  aiRenderHistory();
}

function aiRenderWelcome() {
  const container = document.getElementById('aiMsgs');
  if (!container) return;
  container.innerHTML = `
    <div class="ai-msg bot">
      <div class="ai-msg-av">✨</div>
      <div class="ai-msg-bbl">
        Привет! Я ИИ-помощник по веб-разработке 👋<br><br>
        Выдели любой текст на странице и нажми <b>«Спросить ИИ»</b> — я объясню именно эту тему.<br><br>
        Или просто напиши свой вопрос ниже.
      </div>
    </div>
  `;
}

function aiRenderHistory() {
  const container = document.getElementById('aiMsgs');
  if (!container) return;
  container.innerHTML = '';
  if (!aiHistory.length) {
    aiRenderWelcome();
    const quick = document.getElementById('aiQuickRow');
    if (quick) quick.style.display = 'flex';
    return;
  }
  aiHistory.forEach(msg => {
    if (msg.image) aiAddImageMsg(msg.image, msg.content);
    else aiAddMsg(msg.role === 'user' ? 'user' : 'bot', msg.display || msg.content);
  });
  const quick = document.getElementById('aiQuickRow');
  if (quick) quick.style.display = 'none';
  aiScrollBottom();
}

function aiClearHistory() {
  if (!confirm('Очистить историю ИИ-чата?')) return;
  aiHistory = [];
  try { localStorage.removeItem(AI_HISTORY_KEY); } catch (e) {}
  const ctx = document.getElementById('aiCtx');
  if (ctx) ctx.style.display = 'none';
  aiRenderHistory();
  if (typeof showToast === 'function') showToast('История ИИ-чата очищена');
}

function aiFormatBytes(bytes) {
  const size = Number(bytes) || 0;
  if (size < 1024) return size + ' Б';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' КБ';
  return (size / (1024 * 1024)).toFixed(1) + ' МБ';
}

function aiFileExt(name) {
  const clean = String(name || '').toLowerCase();
  const idx = clean.lastIndexOf('.');
  return idx === -1 ? '' : clean.slice(idx + 1);
}

function aiCanReadAsText(file) {
  const type = String(file.type || '').toLowerCase();
  const ext = aiFileExt(file.name);
  return type.startsWith('text/') || AI_TEXT_EXTENSIONS.has(ext);
}

function aiReadAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const limit = Math.min(file.size, AI_ATTACH_TEXT_LIMIT);
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsText(file.slice(0, limit));
  });
}

function aiReadAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

async function aiPrepareVisionDataUrl(file) {
  if (file.size <= AI_ATTACH_VISION_MAX_BYTES) return aiReadAsDataUrl(file);
  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 2048;
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const compressed = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!compressed || compressed.size > AI_ATTACH_VISION_MAX_BYTES) return '';
    return aiReadAsDataUrl(compressed);
  } catch (error) {
    return '';
  }
}

async function aiHandleFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  const slots = Math.max(0, AI_ATTACH_MAX_FILES - aiAttachments.length);
  const selected = files.slice(0, slots);
  if (files.length > selected.length && typeof showToast === 'function') {
    showToast('Можно прикрепить до ' + AI_ATTACH_MAX_FILES + ' файлов за раз');
  }

  for (const file of selected) {
    const isImage = String(file.type || '').startsWith('image/');
    const att = {
      id: 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      name: file.name || 'file',
      type: file.type || 'unknown',
      size: file.size || 0,
      ext: aiFileExt(file.name),
      isImage,
      previewUrl: isImage ? URL.createObjectURL(file) : '',
      dataUrl: '',
      text: '',
      textTruncated: false
    };

    if (isImage) {
      att.dataUrl = await aiPrepareVisionDataUrl(file);
      if (!att.dataUrl && typeof showToast === 'function') {
        showToast('Не удалось подготовить изображение для vision-модели. Выбери меньший JPG, PNG или WebP файл.');
      }
    }

    if (aiCanReadAsText(file)) {
      att.text = await aiReadAsText(file);
      att.textTruncated = file.size > AI_ATTACH_TEXT_LIMIT;
    }

    aiAttachments.push(att);
  }

  aiRenderAttachments();
}

function aiRenderAttachments() {
  const wrap = document.getElementById('aiAttachList');
  if (!wrap) return;
  wrap.classList.toggle('has-files', aiAttachments.length > 0);
  wrap.innerHTML = aiAttachments.map(att => {
    const visual = att.isImage
      ? `<img class="ai-attach-thumb" src="${att.previewUrl}" alt="">`
      : `<span class="ai-attach-icon">📄</span>`;
    const typeLabel = att.isImage ? 'фото' : (att.ext ? att.ext.toUpperCase() : 'файл');
    return `
      <div class="ai-attach-chip">
        ${visual}
        <span class="ai-attach-meta">
          <span class="ai-attach-name">${aiEscapeHtml(att.name)}</span>
          <span class="ai-attach-size">${typeLabel} • ${aiFormatBytes(att.size)}</span>
        </span>
        <button class="ai-attach-remove" onclick="aiRemoveAttachment('${att.id}')" title="Убрать файл">×</button>
      </div>
    `;
  }).join('');
}

function aiRemoveAttachment(id) {
  const att = aiAttachments.find(item => item.id === id);
  if (att && att.previewUrl) URL.revokeObjectURL(att.previewUrl);
  aiAttachments = aiAttachments.filter(item => item.id !== id);
  aiRenderAttachments();
}

function aiClearAttachments() {
  aiAttachments.forEach(att => {
    if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
  });
  aiAttachments = [];
  aiRenderAttachments();
}

function aiBuildAttachmentContext(attachments) {
  if (!attachments.length) return '';
  let used = 0;
  const lines = ['\n\n[Прикреплённые файлы]'];

  attachments.forEach((att, index) => {
    lines.push(`${index + 1}. ${att.name} (${att.type || 'unknown'}, ${aiFormatBytes(att.size)})`);

    if (att.text) {
      const left = Math.max(0, AI_ATTACH_TOTAL_TEXT_LIMIT - used);
      const part = att.text.slice(0, left);
      used += part.length;
      lines.push('Содержимое файла:');
      lines.push('```' + (att.ext || 'txt'));
      lines.push(part);
      lines.push('```');
      if (att.textTruncated || part.length < att.text.length) {
        lines.push('[Файл обрезан, потому что он слишком большой для одного сообщения]');
      }
    } else if (att.isImage) {
      lines.push(att.dataUrl
        ? '[Изображение прикреплено. Если выбранная модель поддерживает vision, проанализируй картинку. Если не поддерживает, попроси пользователя кратко описать её.]'
        : '[Изображение слишком большое для vision-отправки, доступно только имя/тип/размер.]');
    } else {
      lines.push('[Бинарный или неподдерживаемый для чтения файл: содержимое не прочитано, доступно только имя/тип/размер.]');
    }
  });

  return lines.join('\n');
}

function aiBuildVisibleUserText(text, attachments) {
  if (!attachments.length) return text;
  const names = attachments.map(att => att.name).join(', ');
  const base = text || 'Проанализируй прикреплённые файлы.';
  return base + '\n\n📎 Прикреплено: ' + names;
}

function aiBuildCurrentUserContent(text, attachments) {
  const base = text || 'Проанализируй прикреплённые файлы.';
  return base + aiBuildAttachmentContext(attachments);
}

function aiBuildUserApiContent(textContent, attachments, allowVision) {
  // A real attached image is stronger evidence than a manually configured
  // capability flag. OpenAI-compatible vision endpoints ignore the extra
  // metadata flag and require the image_url part in the user message itself.
  const imageParts = attachments
    .filter(att => att.isImage && att.dataUrl)
    .map(att => ({ type: 'image_url', image_url: { url: att.dataUrl } }));
  if (!imageParts.length) return textContent;
  return [{ type: 'text', text: textContent }, ...imageParts];
}

function aiBuildMessagesForApi(systemPrompt, currentContent, currentAttachments, allowVision) {
  const previous = aiHistory
    .slice(0, -1)
    .map(msg => ({ role: msg.role, content: msg.content }));
  return [
    { role: 'system', content: systemPrompt },
    ...previous,
    { role: 'user', content: aiBuildUserApiContent(currentContent, currentAttachments, allowVision) }
  ];
}

// ---- Text selection popup ----
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const sel = window.getSelection();
    const txt = sel ? sel.toString().trim() : '';
    const popup = document.getElementById('aiSelPopup');
    if (!popup) return;

    if (txt.length > 15 && txt.length < 1500) {
      aiSelText = txt;
      const rect = sel.getRangeAt(0).getBoundingClientRect();

      // Позиция: по центру выделения, НАД ним (position:fixed — координаты от viewport)
      const popupW = 148;
      const popupH = 38;
      const gap = 12; // отступ от выделения

      // rect.top/bottom/left — уже в координатах viewport (для position:fixed)
      let left = rect.left + rect.width / 2 - popupW / 2;
      let top  = rect.top - popupH - gap; // НАД выделением

      // Если нет места сверху — показываем снизу
      if (rect.top < popupH + gap + 10) {
        top = rect.bottom + gap;
      }

      // Не выходим за края viewport
      left = Math.max(8, Math.min(left, window.innerWidth - popupW - 8));
      top  = Math.max(8, top);

      popup.style.left = left + 'px';
      popup.style.top  = top + 'px';
      popup.style.display = 'flex';

      // Рестарт анимации
      popup.style.animation = 'none';
      popup.offsetHeight; // reflow
      popup.style.animation = '';

    } else if (!document.getElementById('aiChatWin')?.classList.contains('open')) {
      popup.style.display = 'none';
    }
  }, 20);
});

document.addEventListener('mousedown', (e) => {
  const popup = document.getElementById('aiSelPopup');
  if (e.target !== popup && !popup.contains(e.target)) {
    popup.style.display = 'none';
  }
});

function aiAskFromSelection() {
  document.getElementById('aiSelPopup').style.display = 'none';
  if (!aiChatOpen) toggleAiChat();

  // Показать контекст
  const ctx = document.getElementById('aiCtx');
  const ctxTxt = document.getElementById('aiCtxText');
  ctx.style.display = 'block';
  ctxTxt.textContent = aiSelText.length > 180 ? aiSelText.slice(0,180) + '...' : aiSelText;

  // Автоматически задаём вопрос с контекстом
  const q = `Объясни мне следующее из темы по веб-разработке: "${aiSelText.slice(0,300)}"`;
  document.getElementById('aiInp').value = q;
  document.getElementById('aiInp').focus();
}

function aiQuick(q) {
  document.getElementById('aiInp').value = q;
  aiSend();
}

function aiParsePlaygroundToolCall(text) {
  let raw = String(text || '').trim();
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) raw = fenced[1].trim();

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.tool === 'string') return parsed;
  } catch (e) {}

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      const parsed = JSON.parse(raw.slice(start, end + 1));
      if (parsed && typeof parsed.tool === 'string') return parsed;
    } catch (e) {}
  }
  return null;
}

function aiOpenPlaygroundTab() {
  const section = document.getElementById('sec-playground');
  if (section && section.classList.contains('active')) return;
  const btn = document.querySelector('.tab.playground-tab') || document.querySelector('[data-sec="playground"]');
  if (typeof switchTab === 'function') switchTab('playground', btn);
}

function aiSetPlaygroundCode(args) {
  const html = typeof args.html === 'string' ? args.html : '';
  const css = typeof args.css === 'string' ? args.css : '';
  const js = typeof args.js === 'string' ? args.js : '';
  const hasCSS = css.trim().length > 0;
  const hasJS = js.trim().length > 0;
  const rawHtml = html.trim() || '<h1>Playground</h1>';
  const isFullDoc = /<!DOCTYPE|<html[\s>]/i.test(rawHtml);
  let indexContent = rawHtml;

  if (isFullDoc) {
    if (hasCSS && !/href=["']style\.css["']/i.test(indexContent)) {
      const linkTag = '<link rel="stylesheet" href="style.css">';
      if (/<\/head>/i.test(indexContent)) {
        indexContent = indexContent.replace(/<\/head>/i, '  ' + linkTag + '\n</head>');
      } else {
        indexContent = indexContent.replace(/<html[^>]*>/i, '$&\n<head>\n  ' + linkTag + '\n</head>');
      }
    }
    if (hasJS && !/src=["']script\.js["']/i.test(indexContent)) {
      const scriptTag = '<scr' + 'ipt src="script.js"></scr' + 'ipt>';
      if (/<\/body>/i.test(indexContent)) {
        indexContent = indexContent.replace(/<\/body>/i, '  ' + scriptTag + '\n</body>');
      } else {
        indexContent += '\n' + scriptTag;
      }
    }
  } else {
    indexContent = '<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Preview</title>\n';
    if (hasCSS) indexContent += '  <link rel="stylesheet" href="style.css">\n';
    indexContent += '</head>\n<body>\n' + rawHtml + '\n';
    if (hasJS) indexContent += '  <scr' + 'ipt src="script.js"></scr' + 'ipt>\n';
    indexContent += '</body>\n</html>';
  }

  pgActiveFile = null;
  pgFiles = [{ name: 'index.html', content: indexContent }];
  if (hasCSS) pgFiles.push({ name: 'style.css', content: css });
  if (hasJS) pgFiles.push({ name: 'script.js', content: js });
  pgSwitchFile('index.html');
  runPlayground();
}

function aiHandlePlaygroundToolCall(text) {
  const call = aiParsePlaygroundToolCall(text);
  if (!call) return null;

  try {
    const args = call.args && typeof call.args === 'object' ? call.args : {};
    aiOpenPlaygroundTab();

    if (call.tool === 'load_playground_template') {
      const name = args.template_name;
      if (!['flexbox', 'animation', 'form', 'todo'].includes(name)) {
        throw new Error('unknown template: ' + name);
      }
      loadTemplate(name);
      if (typeof showToast === 'function') showToast('\u0428\u0430\u0431\u043b\u043e\u043d \u043e\u0442\u043a\u0440\u044b\u0442 \u0432 Playground');
      return '\u0413\u043e\u0442\u043e\u0432\u043e: \u0448\u0430\u0431\u043b\u043e\u043d "' + name + '" \u043e\u0442\u043a\u0440\u044b\u0442 \u0432 Live Playground.';
    }

    if (call.tool === 'update_playground_code') {
      aiSetPlaygroundCode(args);
      if (typeof showToast === 'function') showToast('\u041a\u043e\u0434 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d \u0432 Playground');
      return '\u0413\u043e\u0442\u043e\u0432\u043e: \u043a\u043e\u0434 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d \u0438 \u043f\u0440\u0435\u0432\u044c\u044e \u043f\u0435\u0440\u0435\u0437\u0430\u043f\u0443\u0449\u0435\u043d\u043e.';
    }

    if (call.tool === 'trigger_code_validation') {
      runPlayground();
      if (typeof showToast === 'function') showToast('\u041f\u0440\u0435\u0432\u044c\u044e \u043f\u0435\u0440\u0435\u0437\u0430\u043f\u0443\u0449\u0435\u043d\u043e');
      return '\u0413\u043e\u0442\u043e\u0432\u043e: \u043f\u0440\u0435\u0432\u044c\u044e \u0432 Playground \u043f\u0435\u0440\u0435\u0437\u0430\u043f\u0443\u0449\u0435\u043d\u043e.';
    }

    return '\u041d\u0435 \u0437\u043d\u0430\u044e \u0442\u0430\u043a\u043e\u0435 Playground-\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435: ' + call.tool;
  } catch (err) {
    return '\u041d\u0435 \u0441\u043c\u043e\u0433 \u0432\u044b\u043f\u043e\u043b\u043d\u0438\u0442\u044c Playground-\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435: ' + err.message;
  }
}

function aiIsClaudeHub(baseUrl) {
  try {
    return new URL(String(baseUrl || '').trim()).hostname.toLowerCase() === 'api.claudehub.fun';
  } catch (_) {
    return /(^|\/)api\.claudehub\.fun(\/|$)/i.test(String(baseUrl || ''));
  }
}

function aiNormalizeOpenAiBaseUrl(baseUrl) {
  let clean = String(baseUrl || '').trim().replace(/\/+$/, '');
  clean = clean.replace(/\/(?:chat\/completions|images\/generations)$/i, '');
  if (aiIsClaudeHub(clean) && !/\/v1$/i.test(clean)) clean += '/v1';
  return clean;
}

function aiCreateProviderError(response, payload) {
  const error = payload?.error;
  const message = typeof error === 'string' ? error
    : error?.message || payload?.message || payload?.detail || ('HTTP ' + response.status);
  const result = new Error(Array.isArray(message) ? JSON.stringify(message) : String(message));
  result.status = response.status;
  return result;
}

function aiProviderErrorMessage(error, customCfg) {
  const status = Number(error?.status || 0);
  const endpoint = aiNormalizeOpenAiBaseUrl(customCfg?.baseUrl) + '/chat/completions';
  const model = customCfg?.model || 'unknown';
  const lower = String(error?.message || '').toLowerCase();
  let advice = '';
  if (status === 401 || status === 403 || lower.includes('api key') || lower.includes('credentials')) {
    advice = '\u041f\u0440\u043e\u0432\u0435\u0440\u044c API-\u043a\u043b\u044e\u0447 \u0438 \u0434\u043e\u0441\u0442\u0443\u043f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0439 \u043c\u043e\u0434\u0435\u043b\u0438.';
  } else if (status === 402) {
    advice = '\u041f\u0440\u043e\u0432\u0435\u0440\u044c \u0431\u0430\u043b\u0430\u043d\u0441 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430 \u0443 \u043f\u0440\u043e\u0432\u0430\u0439\u0434\u0435\u0440\u0430.';
  } else if (status === 404 || lower.includes('not found') || lower.includes('endpoint')) {
    advice = '\u041f\u0440\u043e\u0432\u0435\u0440\u044c Base URL, \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043c\u043e\u0434\u0435\u043b\u0438 \u0438 endpoint.';
  } else if (status === 400 || status === 422 || lower.includes('invalid request parameter') || lower.includes('validation')) {
    advice = aiIsClaudeHub(customCfg?.baseUrl)
      ? '\u0421\u0435\u0440\u0432\u0435\u0440 \u043e\u0442\u043a\u043b\u043e\u043d\u0438\u043b \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b. \u0414\u043b\u044f ClaudeHub: Base URL https://api.claudehub.fun/v1, \u043c\u043e\u0434\u0435\u043b\u044c ch-5o \u0438\u043b\u0438 claude-opus-5.'
      : '\u0421\u0435\u0440\u0432\u0435\u0440 \u043e\u0442\u043a\u043b\u043e\u043d\u0438\u043b \u0434\u0430\u0436\u0435 \u043c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0439 OpenAI-\u0441\u043e\u0432\u043c\u0435\u0441\u0442\u0438\u043c\u044b\u0439 \u0437\u0430\u043f\u0440\u043e\u0441. \u041f\u0440\u043e\u0432\u0435\u0440\u044c Base URL, \u0442\u043e\u0447\u043d\u043e\u0435 \u0438\u043c\u044f \u043c\u043e\u0434\u0435\u043b\u0438 \u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044e \u043f\u0440\u043e\u0432\u0430\u0439\u0434\u0435\u0440\u0430.';
  } else if (lower.includes('image') || lower.includes('vision') || lower.includes('content type')) {
    advice = '\u041f\u0440\u043e\u0432\u0435\u0440\u044c \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 Vision \u0438 \u0444\u043e\u0440\u043c\u0430\u0442 \u0432\u043b\u043e\u0436\u0435\u043d\u0438\u0439.';
  } else if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed')) {
    advice = '\u041f\u0440\u043e\u0432\u0435\u0440\u044c \u0441\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u0435, CORS \u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c \u043f\u0440\u043e\u0432\u0430\u0439\u0434\u0435\u0440\u0430.';
  }
  const diagnostic = (status ? `HTTP ${status}\n` : '') + `Endpoint: ${endpoint}\nModel: ${model}`;
  return '\u041e\u0448\u0438\u0431\u043a\u0430: ' + (error?.message || '\u043d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u0430\u044f \u043e\u0448\u0438\u0431\u043a\u0430') + '\n\n' + diagnostic + (advice ? '\n\n' + advice : '');
}

// ---- Send message ----
async function aiSend() {
  if (aiLoading) return;
  const inp = document.getElementById('aiInp');
  const text = inp.value.trim();
  if (!text && !aiAttachments.length) return;

  const modelChoice = document.getElementById('aiModelSelect')?.value || '';
  const customCfg = modelChoice.startsWith('custom:')
    ? aiGetCustomModels().find(model => model.id === modelChoice.slice(7))
    : null;
  if (!customCfg?.apiKey || !customCfg?.model || !customCfg?.baseUrl) {
    aiAddMsg('bot', "Сначала добавь OpenAI-совместимую модель в разделе «ИИ». Встроенных ключей и моделей больше нет.");
    return;
  }

  const imageMode = Boolean(window.wdgrAiImageMode);
  if (imageMode && !text) {
    aiAddMsg('bot', "Опиши изображение, которое нужно создать.");
    return;
  }
  if (imageMode && !customCfg.imageGeneration) {
    aiAddMsg('bot', "У выбранной модели не включена генерация изображений. Отметь эту возможность в настройках модели.");
    return;
  }

  const sentAttachments = aiAttachments.slice();
  const visibleText = aiBuildVisibleUserText(text, sentAttachments);
  const userContent = aiBuildCurrentUserContent(text, sentAttachments);
  inp.value = '';
  inp.style.height = 'auto';
  const quickRow = document.getElementById('aiQuickRow');
  if (quickRow) quickRow.style.display = 'none';

  aiAddMsg('user', visibleText);
  aiHistory.push({ role: 'user', content: userContent, display: visibleText });
  aiSaveHistory();
  aiClearAttachments();

  const typingId = 'aiTyping_' + Date.now();
  const typEl = document.createElement('div');
  typEl.className = 'ai-msg bot';
  typEl.id = typingId;
  typEl.innerHTML = '<div class="ai-msg-av">AI</div><div class="ai-msg-bbl"><div class="ai-typing-bbl"><span></span><span></span><span></span></div></div>';
  document.getElementById('aiMsgs')?.appendChild(typEl);
  aiScrollBottom();
  aiLoading = true;
  const sendButton = document.getElementById('aiSendBtn');
  if (sendButton) sendButton.disabled = true;

  const baseUrl = aiNormalizeOpenAiBaseUrl(customCfg.baseUrl);
  try {
    if (imageMode) {
      const response = await fetch(baseUrl + '/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + customCfg.apiKey },
        body: JSON.stringify({ model: customCfg.imageModel || customCfg.model, prompt: text, size: '1024x1024', n: 1 })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error?.message || 'HTTP ' + response.status);
      const item = data.data?.[0];
      const imageSource = item?.url || (item?.b64_json ? 'data:image/png;base64,' + item.b64_json : '');
      if (!imageSource) throw new Error("Провайдер не вернул изображение.");
      document.getElementById(typingId)?.remove();
      aiHistory.push({ role: 'assistant', content: "Сгенерированное изображение", image: imageSource });
      aiSaveHistory();
      aiAddImageMsg(imageSource, "Сгенерированное изображение");
    } else {
      const endpoint = baseUrl + '/chat/completions';
      const messages = aiBuildMessagesForApi("Ты Frontend Mentor внутри WebDevGym. Отвечай кратко, понятно и по делу. Сначала объясняй механику и давай небольшие подсказки. Не выдавай полное решение, если пользователь просит обучение через практику.", userContent, sentAttachments, Boolean(customCfg.vision));
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + customCfg.apiKey,
        ...(baseUrl.includes('openrouter') ? { 'HTTP-Referer': window.location.href, 'X-Title': 'WebDevGym' } : {})
      };
      let response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: customCfg.model,
          messages,
          max_tokens: 1024,
          ...(aiIsClaudeHub(baseUrl) ? {} : { temperature: 0.7 })
        })
      });
      let data = await response.json();
      if ((!response.ok || data.error) && [400, 422].includes(response.status)) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ model: customCfg.model, messages })
        });
        data = await response.json();
      }
      if (!response.ok || data.error) throw aiCreateProviderError(response, data);
      let reply = data.choices?.[0]?.message?.content || "Пустой ответ";
      document.getElementById(typingId)?.remove();
      const toolReply = aiHandlePlaygroundToolCall(reply);
      if (toolReply) reply = toolReply;
      aiHistory.push({ role: 'assistant', content: reply });
      aiSaveHistory();
      aiAddMsg('bot', reply);
      if (!toolReply) setTimeout(aiAddInsertButtons, 50);
    }
  } catch (err) {
    document.getElementById(typingId)?.remove();
    aiAddMsg('bot', aiProviderErrorMessage(err, customCfg));
  } finally {
    aiLoading = false;
    if (sendButton) sendButton.disabled = false;
    document.getElementById('aiInp')?.focus();
  }
}

function aiEscapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function aiAddMsg(role, text) {
  const container = document.getElementById('aiMsgs');
  const el = document.createElement('div');
  el.className = `ai-msg ${role}`;

  // Форматирование: код, жирный, переносы
  const safeText = aiEscapeHtml(text);
  const fmt = safeText
    .replace(/```([\w]*)?\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code>${code.trim()}</code></pre>`)
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  el.innerHTML = `
    <div class="ai-msg-av">${role === 'user' ? '👤' : '✨'}</div>
    <div class="ai-msg-bbl">${fmt}</div>
  `;
  container.appendChild(el);
  aiScrollBottom();
}

function aiAddImageMsg(source, caption) {
  const container = document.getElementById('aiMsgs');
  if (!container) return;
  const safeSource = String(source || '');
  if (!/^https:\/\//i.test(safeSource) && !/^data:image\//i.test(safeSource)) return;
  const el = document.createElement('div');
  el.className = 'ai-msg bot ai-msg-image';
  const avatar = document.createElement('div');
  avatar.className = 'ai-msg-av';
  avatar.textContent = 'AI';
  const bubble = document.createElement('div');
  bubble.className = 'ai-msg-bbl';
  const image = document.createElement('img');
  image.src = safeSource;
  image.alt = caption || "Сгенерированное изображение";
  image.loading = 'lazy';
  const label = document.createElement('span');
  label.textContent = caption || "Сгенерированное изображение";
  bubble.append(image, label);
  el.append(avatar, bubble);
  container.appendChild(el);
  aiScrollBottom();
}

function aiScrollBottom() {
  const c = document.getElementById('aiMsgs');
  if (c) c.scrollTop = c.scrollHeight;
}

aiLoadHistory();

// Закрытие по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && aiChatOpen) toggleAiChat();
});


// ===== AI CUSTOM MODELS =====
function aiGetCustomModels() {
  try {
    const raw = localStorage.getItem('ai_custom_models');
    const models = raw ? JSON.parse(raw) : [];
    return Array.isArray(models) ? models.map(model => ({
      ...model,
      vision: Boolean(model.vision),
      imageGeneration: Boolean(model.imageGeneration),
      imageModel: String(model.imageModel || '')
    })) : [];
  } catch (error) { return []; }
}

function aiSaveCustomModels(models) {
  try { localStorage.setItem('ai_custom_models', JSON.stringify(models)); } catch (error) {}
}

function aiGetCustomConfig() {
  const sel = document.getElementById('aiModelSelect');
  const models = aiGetCustomModels();
  if (!models.length) return null;
  if (sel?.value.startsWith('custom:')) {
    const found = models.find(model => model.id === sel.value.slice(7));
    if (found) return found;
  }
  const activeId = localStorage.getItem('ai_active_custom_model_id');
  return models.find(model => model.id === activeId) || models[models.length - 1];
}

const AI_PROVIDER_PRESETS = {
  'https://openrouter.ai/api/v1': { model: '' },
  'https://api.claudehub.fun/v1': { model: '', placeholder: 'ch-5o или claude-opus-5' },
  'https://api.openai.com/v1': { model: '' },
  'https://api.together.xyz/v1': { model: '' },
  'https://api.mistral.ai/v1': { model: '' }
};

function aiEnsureProviderOptions() {
  const provider = document.getElementById('ai-provider');
  if (!provider || [...provider.options].some(option => option.value === 'https://api.claudehub.fun/v1')) return;
  const option = document.createElement('option');
  option.value = 'https://api.claudehub.fun/v1';
  option.textContent = 'ClaudeHub';
  const custom = [...provider.options].find(item => item.value === 'custom');
  provider.insertBefore(option, custom || null);
}

function aiProviderPreset() {
  aiEnsureProviderOptions();
  const provider = document.getElementById('ai-provider');
  const baseUrl = document.getElementById('ai-baseurl');
  const model = document.getElementById('ai-modelname');
  if (!provider || !baseUrl) return;
  baseUrl.value = provider.value === 'custom' ? '' : provider.value;
  const preset = AI_PROVIDER_PRESETS[provider.value];
  if (model && !model.value) model.placeholder = provider.value === 'custom'
    ? 'model-name'
    : (preset?.placeholder || 'Exact model name from provider');
}

function aiSaveCustomConfig() {
  aiEnsureProviderOptions();
  const baseUrl = aiNormalizeOpenAiBaseUrl(document.getElementById('ai-baseurl')?.value || '');
  const apiKey = document.getElementById('ai-apikey')?.value.trim() || '';
  const model = document.getElementById('ai-modelname')?.value.trim() || '';
  const vision = Boolean(document.querySelector('[data-ai-capability=\"vision\"]')?.checked);
  const imageGeneration = Boolean(document.querySelector('[data-ai-capability=\"image-generation\"]')?.checked);
  const imageModel = document.getElementById('ai-image-model')?.value.trim() || '';
  const statusEl = document.getElementById('ai-config-status');
  const show = (message, ok) => {
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.className = 'ai-config-status ' + (ok ? 'success' : 'error');
    statusEl.textContent = message;
  };
  if (!baseUrl || !apiKey || !model) return show("Заполни Base URL, API-ключ и название модели", false);

  const models = aiGetCustomModels();
  const existing = models.find(item => item.baseUrl === baseUrl && item.model === model);
  const savedId = existing?.id || 'm_' + Date.now();
  const config = { id: savedId, baseUrl, apiKey, model, vision, imageGeneration, imageModel };
  if (existing) Object.assign(existing, config);
  else models.push(config);
  aiSaveCustomModels(models);
  localStorage.setItem('ai_active_custom_model_id', savedId);
  show("Модель сохранена" + ': ' + model, true);
  aiRebuildModelSelect();
  const select = document.getElementById('aiModelSelect');
  if (select) select.value = 'custom:' + savedId;
  aiOnModelChange();
  renderSavedModelsList();
}

function aiDeleteCustomModel(id) {
  const models = aiGetCustomModels().filter(model => model.id !== id);
  aiSaveCustomModels(models);
  if (localStorage.getItem('ai_active_custom_model_id') === id) localStorage.removeItem('ai_active_custom_model_id');
  renderSavedModelsList();
  aiRebuildModelSelect();
}

function aiClearCustomConfig() {
  aiSaveCustomModels([]);
  localStorage.removeItem('ai_active_custom_model_id');
  ['ai-apikey','ai-modelname','ai-image-model'].forEach(id => { const input = document.getElementById(id); if (input) input.value = ''; });
  const status = document.getElementById('ai-config-status');
  if (status) { status.style.display = 'block'; status.textContent = "Все сохранённые модели удалены"; }
  renderSavedModelsList();
  aiRebuildModelSelect();
}

function renderSavedModelsList() {
  const wrap = document.getElementById('ai-saved-models-wrap');
  const list = document.getElementById('ai-saved-models-list');
  if (!wrap || !list) return;
  const models = aiGetCustomModels();
  wrap.style.display = models.length ? 'block' : 'none';
  list.replaceChildren();
  const activeId = localStorage.getItem('ai_active_custom_model_id');
  models.forEach(model => {
    const row = document.createElement('div');
    row.className = 'ai-saved-model' + (model.id === activeId ? ' active' : '');
    const info = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = model.model + (model.id === activeId ? ' ✓' : '');
    const url = document.createElement('small');
    url.textContent = model.baseUrl;
    const capabilities = document.createElement('div');
    capabilities.className = 'ai-model-capabilities';
    if (model.vision) capabilities.append(Object.assign(document.createElement('span'), { textContent: 'Vision' }));
    if (model.imageGeneration) capabilities.append(Object.assign(document.createElement('span'), { textContent: 'Image' }));
    info.append(name, url, capabilities);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.title = "Удалить";
    remove.textContent = '×';
    remove.addEventListener('click', () => aiDeleteCustomModel(model.id));
    row.append(info, remove);
    list.append(row);
  });
}

function aiRestoreConfigUI() {
  aiEnsureProviderOptions();
  renderSavedModelsList();
  const provider = document.getElementById('ai-provider');
  const baseUrl = document.getElementById('ai-baseurl');
  if (provider && baseUrl && !baseUrl.value) baseUrl.value = provider.value === 'custom' ? '' : provider.value;
}

function aiRebuildModelSelect() {
  const select = document.getElementById('aiModelSelect');
  if (!select) return;
  const previous = select.value;
  const models = aiGetCustomModels();
  const activeId = localStorage.getItem('ai_active_custom_model_id');
  select.innerHTML = '';
  if (!models.length) {
    const option = new Option("Добавь модель в настройках ИИ", '', true, true);
    option.disabled = true;
    select.add(option);
  } else {
    models.forEach(model => {
      const capabilities = [model.vision ? 'Vision' : '', model.imageGeneration ? 'Image' : ''].filter(Boolean);
      const label = model.model + (capabilities.length ? ' · ' + capabilities.join(' · ') : '');
      select.add(new Option(label, 'custom:' + model.id));
    });
    const desired = models.some(model => 'custom:' + model.id === previous)
      ? previous
      : (models.some(model => model.id === activeId) ? 'custom:' + activeId : 'custom:' + models[0].id);
    select.value = desired;
  }
  aiOnModelChange();
}

function ghSaveField(id, value) {
  try {
    if (value) localStorage.setItem(GH_STORAGE_PREFIX + id, value);
    else localStorage.removeItem(GH_STORAGE_PREFIX + id);
  } catch(e) {}
}

function ghRestoreFields() {
  GH_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const saved = localStorage.getItem(GH_STORAGE_PREFIX + id);
      if (saved !== null && !el.value) el.value = saved;
    } catch(e) {}
  });
}


// ===== GITHUB CREATE REPO =====
async function githubCreateRepo() {
  const tokenInput = document.getElementById('ghc-token');
  const nameInput = document.getElementById('ghc-name');
  const visibilityInput = document.getElementById('ghc-visibility');
  const descInput = document.getElementById('ghc-desc');
  const readmeInput = document.getElementById('ghc-readme');
  const statusEl = document.getElementById('ghc-status');

  const show = (msg, ok) => {
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.style.background = ok ? '#0d2d1a' : '#2d0d0d';
    statusEl.style.border = '1px solid ' + (ok ? '#238636' : '#da3633');
    statusEl.style.color = ok ? '#3fb950' : '#f85149';
    statusEl.innerHTML = msg;
  };

  if (!nameInput || !visibilityInput) {
    show('❌ Форма создания репозитория не загрузилась. Обнови страницу и попробуй ещё раз.', false);
    return;
  }

  let token = tokenInput?.value.trim() || '';
  if (!token && window.WebDevGymGitHubTokenVault?.restore) {
    token = await window.WebDevGymGitHubTokenVault.restore();
  }
  token = token || window.WebDevGymGitHubTokenVault?.getToken?.() || '';

  const name = nameInput.value.trim();
  const isPriv = visibilityInput.value === 'true';
  const desc = descInput?.value.trim() || '';
  const addReadme = readmeInput?.checked !== false;

  if (!token) return show('❌ Укажи Personal Access Token или разблокируй сохранённый токен.', false);
  if (!name)  return show('❌ Укажи имя репозитория', false);
  if (!/^[\w.\-]+$/.test(name)) return show('❌ Имя может содержать только буквы, цифры, - _ .', false);

  show('⏳ Создаём репозиторий...', true);

  try {
    const res = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        name,
        description: desc || undefined,
        private: isPriv,
        auto_init: addReadme
      })
    });

    const responseText = await res.text();
    let result = {};
    try { result = responseText ? JSON.parse(responseText) : {}; }
    catch (error) { result = { message: responseText || `HTTP ${res.status}` }; }

    if (res.ok) {
      const repoUrl = result.html_url;
      const pagesUrl = `https://${result.owner.login}.github.io/${result.name}/`;
      show(`✅ Репозиторий создан! <a href="${repoUrl}" target="_blank" style="color:#58a6ff">${result.full_name}</a><br>
            🌐 После загрузки index.html, GitHub Pages: <a href="${pagesUrl}" target="_blank" style="color:#58a6ff">${pagesUrl}</a>`, true);

      // Автозаполняем поля загрузки файла ниже
      const ghUsername = document.getElementById('gh-username');
      const ghRepo = document.getElementById('gh-repo');
      const ghToken = document.getElementById('gh-token');
      if (ghUsername) { ghUsername.value = result.owner.login; ghSaveField('gh-username', result.owner.login); }
      if (ghRepo)     { ghRepo.value = result.name; ghSaveField('gh-repo', result.name); }
      if (ghToken && !ghToken.value) { ghToken.value = token; ghSaveField('gh-token', token); }

      document.dispatchEvent(new CustomEvent('webdevgym:github-repository-created', {
        detail: { username: result.owner.login, repo: result.name, url: repoUrl }
      }));

    } else {
      const msg = String(result.message || `HTTP ${res.status}`);
      const details = Array.isArray(result.errors)
        ? result.errors.map(error => error.message || error.code).filter(Boolean).join('; ')
        : '';
      if (res.status === 401 || /bad credentials/i.test(msg)) {
        show('❌ Токен неверный, просрочен или отозван. Создай новый токен и сохрани его в WebDevGym.', false);
      } else if (res.status === 403) {
        show('❌ GitHub разрешил загрузку файлов, но запретил создание репозитория.<br><b>Fine-grained token:</b> включи Repository permissions → Administration → Read and write.<br><b>Classic token:</b> включи scope <code>repo</code> (или <code>public_repo</code> только для публичных репозиториев).<br><a href="https://github.com/settings/tokens" target="_blank" rel="noopener" style="color:#58a6ff">Открыть настройки токенов GitHub</a>', false);
      } else if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('name already exists')) {
        show(`❌ Репозиторий <b>${name}</b> уже существует на твоём аккаунте`, false);
      } else if (res.status === 422) {
        show(`❌ GitHub отклонил данные репозитория: ${details || msg}`, false);
      } else {
        show(`❌ GitHub API (${res.status}): ${details || msg}`, false);
      }
    }
  } catch(err) {
    show('❌ Сетевая ошибка: ' + err.message, false);
  }
}


// ===== AI HELP WITH PLAYGROUND =====
function aiHelpWithPlayground() {
  // Сохраняем текущий контент активного файла
  if (pgActiveFile) {
    const f = pgFindFile(pgActiveFile);
    if (f) f.content = document.getElementById('pg-editor').value;
  }

  const activeFile = pgFindFile(pgActiveFile);
  if (!activeFile) return;

  const code = activeFile.content || '';
  const lang = pgFileType(pgActiveFile);

  // Открываем чат
  if (!aiChatOpen) toggleAiChat();

  // Контекст
  const ctx = document.getElementById('aiCtx');
  const ctxTxt = document.getElementById('aiCtxText');
  ctx.style.display = 'block';
  const preview = code.length > 300 ? code.slice(0, 300) + '...' : code;
  ctxTxt.innerHTML = `<b>${activeFile.name}</b><br><code style="font-size:10px;white-space:pre-wrap;">${preview.replace(/</g,'&lt;')}</code>`;

  // Сохраняем код в переменную для возможной вставки обратно
  aiPgContext = { fileName: activeFile.name, lang, code };

  // Показываем быстрые действия для playground
  const quickRow = document.getElementById('aiQuickRow');
  quickRow.style.display = 'flex';
  quickRow.innerHTML = `
    <button class="ai-qbtn" onclick="aiPgQuick('Найди и исправь ошибки в этом коде')">🐛 Найди ошибки</button>
    <button class="ai-qbtn" onclick="aiPgQuick('Улучши и оптимизируй этот код')">✨ Улучшить код</button>
    <button class="ai-qbtn" onclick="aiPgQuick('Объясни как работает этот код')">💡 Объясни код</button>
    <button class="ai-qbtn" onclick="aiPgQuick('Добавь комментарии к этому коду')">📝 Добавь комментарии</button>
  `;

  document.getElementById('aiInp').placeholder = `Спроси про ${activeFile.name}...`;
  document.getElementById('aiInp').focus();
}

let aiPgContext = null;

function aiPgQuick(action) {
  const ctx = aiPgContext;
  if (!ctx) return;
  const q = `${action}. Вот код файла ${ctx.fileName} (${ctx.lang}):\n\n\`\`\`${ctx.lang}\n${ctx.code}\n\`\`\`\n\nВ ответе дай исправленный/улучшенный код целиком в одном блоке кода, и кратко объясни что изменил.`;
  document.getElementById('aiInp').value = q;
  aiSend();
}

// Добавляем кнопку "вставить в редактор" к code-блокам в ответах ИИ,
// если последний запрос был связан с playground
function aiAddInsertButtons() {
  if (!aiPgContext) return;
  const msgs = document.getElementById('aiMsgs');
  const lastBot = msgs.querySelectorAll('.ai-msg.bot');
  const last = lastBot[lastBot.length - 1];
  if (!last) return;

  const pres = last.querySelectorAll('pre code');
  pres.forEach(codeEl => {
    if (codeEl.dataset.insertBtnAdded) return;
    codeEl.dataset.insertBtnAdded = '1';

    const btn = document.createElement('button');
    btn.textContent = '↩ Вставить в редактор';
    btn.style.cssText = 'display:block;margin-top:6px;padding:4px 10px;background:#6366f1;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;';
    btn.onclick = () => {
      const editor = document.getElementById('pg-editor');
      if (editor && aiPgContext) {
        editor.value = codeEl.textContent;
        const f = pgFindFile(aiPgContext.fileName);
        if (f) f.content = codeEl.textContent;
        runPlayground();
        btn.textContent = '✅ Вставлено!';
        setTimeout(() => { btn.textContent = '↩ Вставить в редактор'; }, 1500);
      }
    };
    codeEl.parentElement.after(btn);
  });
}




// ===== NEXUS NOTES =====
const NEXUS_STORAGE_KEY = 'webdevgym_nexus_notes_v1';
let nexusNotes = [];
let nexusActiveId = null;
function nexusDefaultNotes(){ return []; }
function nexusLoadNotes(){ try{ const saved=JSON.parse(localStorage.getItem(NEXUS_STORAGE_KEY)||'null'); nexusNotes=Array.isArray(saved)?saved:nexusDefaultNotes(); }catch(e){ nexusNotes=nexusDefaultNotes(); } nexusActiveId=nexusNotes[0]?.id||null; }
function nexusPersist(){ localStorage.setItem(NEXUS_STORAGE_KEY, JSON.stringify(nexusNotes)); }
function nexusSlug(title){ return (title||'Untitled').trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-zа-яё0-9\-_]/gi,'').slice(0,60)||('note-'+Date.now()); }
function nexusFindByTitle(title){ const wanted=(title||'').trim().toLowerCase(); return nexusNotes.find(n=>n.title.trim().toLowerCase()===wanted); }
function nexusLinks(body){ return [...(body||'').matchAll(/\[\[([^\]]+)\]\]/g)].map(m=>m[1].trim()).filter(Boolean); }
function nexusActive(){ return nexusNotes.find(n=>n.id===nexusActiveId)||nexusNotes[0]||null; }
function nexusOpen(id){ nexusActiveId=id; nexusRender(); }
function nexusEscape(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function nexusRenderList(){ const list=document.getElementById('nexusList'); if(!list)return; const q=(document.getElementById('nexusSearch')?.value||'').trim().toLowerCase(); const notes=nexusNotes.filter(n=>!q||n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q)); list.innerHTML=notes.length?notes.map(n=>'<button class="nexus-note-item '+(n.id===nexusActiveId?'active':'')+'" onclick="nexusOpen(\''+n.id+'\')"><div class="nexus-note-title">'+nexusEscape(n.title)+'</div><div class="nexus-note-meta">'+nexusLinks(n.body).length+' links · '+new Date(n.updatedAt).toLocaleDateString()+'</div></button>').join(''):'<div class="nexus-empty">No notes found</div>'; }
function nexusRenderPreview(note){ const preview=document.getElementById('nexusPreview'); if(!preview)return; if(!note){ preview.innerHTML='<div class="nexus-empty">Create your first note</div>'; return; } const escaped=nexusEscape(note.body); const linked=escaped.replace(/\[\[([^\]]+)\]\]/g,function(_,title){ const exists=nexusFindByTitle(title); const action=exists?('nexusOpen(\''+exists.id+'\')'):('nexusCreateNote(\''+String(title).replace(/'/g,"\\'")+'\')'); return '<a class="nexus-link '+(exists?'':'missing')+'" onclick="'+action+'">[['+nexusEscape(title)+']]</a>'; }); preview.innerHTML='<h3>'+nexusEscape(note.title)+'</h3>'+linked.replace(/^### (.*)$/gm,'<h4>$1</h4>').replace(/^## (.*)$/gm,'<h3>$1</h3>').replace(/^# (.*)$/gm,'<h2>$1</h2>').replace(/\n/g,'<br>'); }
function nexusRenderGraph(note){ const graph=document.getElementById('nexusGraph'); if(!graph)return; if(!note){ graph.innerHTML=''; return; } const outgoing=nexusLinks(note.body); const incoming=nexusNotes.filter(n=>n.id!==note.id&&nexusLinks(n.body).some(l=>l.toLowerCase()===note.title.toLowerCase())); const chips=[...outgoing.map(title=>({title,note:nexusFindByTitle(title)})),...incoming.map(n=>({title:'← '+n.title,note:n}))]; graph.innerHTML=chips.length?chips.map(c=>'<button class="nexus-chip" onclick="'+(c.note?('nexusOpen(\''+c.note.id+'\')'):('nexusCreateNote(\''+String(c.title).replace(/'/g,"\\'")+'\')'))+'">'+nexusEscape(c.title)+'</button>').join(''):'<span class="nexus-note-meta">No links yet. Use [[Note title]] to connect ideas.</span>'; }
function nexusRender(){ const note=nexusActive(); const title=document.getElementById('nexusTitle'); const body=document.getElementById('nexusBody'); if(title)title.value=note?.title||''; if(body)body.value=note?.body||''; nexusRenderList(); nexusRenderPreview(note); nexusRenderGraph(note); }
function nexusUpdateDraft(){ const note=nexusActive(); if(!note)return; note.title=document.getElementById('nexusTitle')?.value||'Untitled'; note.body=document.getElementById('nexusBody')?.value||''; note.updatedAt=Date.now(); nexusRenderPreview(note); nexusRenderGraph(note); }
function nexusSaveActive(){ nexusUpdateDraft(); nexusPersist(); nexusRenderList(); if(typeof showToast==='function')showToast('Nexus note saved'); }
function nexusCreateNote(title='New note'){ const clean=String(title||'New note').replace(/^←\s*/,'').trim()||'New note'; const existing=nexusFindByTitle(clean); if(existing){ nexusOpen(existing.id); return; } const note={ id:nexusSlug(clean)+'-'+Date.now().toString(36), title:clean, body:'', updatedAt:Date.now() }; nexusNotes.unshift(note); nexusActiveId=note.id; nexusPersist(); nexusRender(); }
function nexusCreateLinkedNotes(){ const note=nexusActive(); if(!note)return; nexusLinks(note.body).forEach(title=>{ if(!nexusFindByTitle(title)) nexusNotes.push({ id:nexusSlug(title)+'-'+Date.now().toString(36), title, body:'', updatedAt:Date.now() }); }); nexusPersist(); nexusRender(); }
function nexusDeleteActive(){ const note=nexusActive(); if(!note||!confirm('Delete this Nexus note?'))return; nexusNotes=nexusNotes.filter(n=>n.id!==note.id); nexusActiveId=nexusNotes[0]?.id||null; nexusPersist(); nexusRender(); }
function nexusExportNotes(){ const blob=new Blob([JSON.stringify({version:1,notes:nexusNotes},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='webdevgym-nexus-notes.json'; a.click(); URL.revokeObjectURL(a.href); }
function nexusImportNotes(){ const input=document.createElement('input'); input.type='file'; input.accept='application/json'; input.onchange=()=>{ const file=input.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try{ const data=JSON.parse(reader.result); if(!Array.isArray(data.notes))throw new Error('Invalid file'); nexusNotes=data.notes.map(n=>({ id:n.id||nexusSlug(n.title)+'-'+Date.now().toString(36), title:n.title||'Untitled', body:n.body||'', updatedAt:n.updatedAt||Date.now() })); nexusActiveId=nexusNotes[0]?.id||null; nexusPersist(); nexusRender(); }catch(e){ alert('Could not import Nexus notes'); } }; reader.readAsText(file); }; input.click(); }
document.addEventListener('DOMContentLoaded',()=>{ nexusLoadNotes(); nexusRender(); });

// ===== MAIN LANGUAGE (local, no AI) =====
const WDG_LANG_KEY = 'webdevgym_main_lang';
let wdgMainLang = localStorage.getItem(WDG_LANG_KEY) || 'ru';

const WDG_I18N = {
  ru: {
    'top.dark': '<iconify-icon icon="tabler:moon-stars" width="14" height="14" style="vertical-align:middle"></iconify-icon> Тёмная',
    'top.bookmarks': '🔖 Закладки',
    'top.interview': '🎙️ Мок-интервью',
    'top.export': '⬇ Экспорт',
    'top.import': '⬆ Импорт',
    'top.reset': '↺ Сброс',
    'splash.title': 'HTML/CSS/JS',
    'splash.sub': 'Роадмап',
    'hero.html.title': 'HTML — язык разметки',
    'hero.html.sub': 'HTML описывает структуру страницы: что является заголовком, абзацем, ссылкой или картинкой. Это фундамент всего веба — без него нет ни CSS, ни JS.',
    'hero.css.title': 'CSS — язык стилей',
    'hero.css.sub': 'CSS отвечает за внешний вид: цвета, шрифты, отступы, анимации, адаптивность. Без CSS сайт выглядит как текстовый документ из 90-х.',
    'hero.js.title': 'JavaScript — язык интерактивности',
    'hero.js.sub': 'JS оживляет страницы: кнопки работают, данные загружаются без перезагрузки, формы проверяются. Единственный язык, который понимает браузер.',
    'js.dom.link': 'DOM — управляем страницей',
    'js.events.link': 'События — реагируем на действия',
    'js.storage.link': 'localStorage — сохраняем в браузере',
    'js.storage.practice': 'localStorage на примере счетчика и темы'
  },
  en: {
    'top.dark': '<iconify-icon icon="tabler:moon-stars" width="14" height="14" style="vertical-align:middle"></iconify-icon> Dark',
    'top.bookmarks': '🔖 Bookmarks',
    'top.interview': '🎙️ Mock interview',
    'top.export': '⬇ Export',
    'top.import': '⬆ Import',
    'top.reset': '↺ Reset',
    'splash.title': 'HTML/CSS/JS',
    'splash.sub': 'Roadmap',
    'hero.html.title': 'HTML — markup language',
    'hero.html.sub': 'HTML describes page structure: headings, paragraphs, links, images, and sections. It is the base of the web — CSS and JS stand on top of it.',
    'hero.css.title': 'CSS — styling language',
    'hero.css.sub': 'CSS controls appearance: colors, fonts, spacing, animation, and responsive layout. Without CSS, a site looks like a plain text document.',
    'hero.js.title': 'JavaScript — interactivity language',
    'hero.js.sub': 'JavaScript brings pages to life: buttons work, data loads without reloading, forms are validated, and interfaces remember state.',
    'js.dom.link': 'DOM — control the page',
    'js.events.link': 'Events — react to actions',
    'js.storage.link': 'localStorage — save in the browser',
    'js.storage.practice': 'localStorage with counter and theme'
  }
};

const WDG_I18N_SELECTORS = {
  'hero.html.title': '#sec-html .lang-section-hero-title',
  'hero.html.sub': '#sec-html .lang-section-hero-sub',
  'hero.css.title': '#sec-css .lang-section-hero-title',
  'hero.css.sub': '#sec-css .lang-section-hero-sub',
  'hero.js.title': '#sec-js .lang-section-hero-title',
  'hero.js.sub': '#sec-js .lang-section-hero-sub',
  'js.dom.link': '#block-dom .block-title',
  'js.events.link': '#block-events .block-title',
  'js.storage.link': '#block-localstorage .block-title',
  'js.storage.practice': '#block-localstorage-counter .block-title'

};

const WDG_TEXT_EN = {
  'Роадмап': 'Roadmap',
  'Прогресс': 'Progress',
  'тем изучено': 'topics completed',
  'Backend & Дополнительно': 'Backend & Extra',
  'Серверы': 'Servers',
  'Практика': 'Practice',
  'Ошибки': 'Mistakes',
  'Ресурсы': 'Resources',
  'Путь развития': 'Roadmap',
  'Календарь': 'Calendar',
  'Шпаргалки': 'Cheatsheets',
  'Карьера': 'Career',
  'Ссылки': 'Links',
  'Алгоритмы': 'Algorithms',
  'ИИ': 'AI',
  'Рефакторинг': 'Refactoring',
  'Шрифты': 'Fonts',
  'основа': 'core',
  'важно': 'important',
  'знать': 'know',
  'продвинуто': 'advanced',
  'практика': 'practice',
  'следующие шаги': 'next steps',
  'совет дня': 'tip of the day',
  'Челлендж дня': 'Daily challenge',
  'Старт': 'Start',
  'Другое': 'Another',
  'Пауза': 'Pause',
  'Загрузка...': 'Loading...',
  'Сегодня': 'Today',
  'День': 'Day',
  'Добавить': 'Add',
  'Экспорт календаря': 'Export calendar',
  'Импорт календаря': 'Import calendar',
  'Сбросить календарь': 'Reset calendar',
  'Заметка': 'Note',
  'Месяц': 'Month',
  'Пн': 'Mon',
  'Вт': 'Tue',
  'Ср': 'Wed',
  'Чт': 'Thu',
  'Пт': 'Fri',
  'Сб': 'Sat',
  'Вс': 'Sun',
  'Задачи дня': 'Day tasks',
  'План': 'Plan',
  'Засчитать день': 'Mark day done',
  'учебных дней закрыто': 'study days completed',
  'дней осталось в плане': 'days remaining in plan',
  'тем впереди': 'topics ahead',
  'Что важно помнить по учебе, Career или проектам?': 'What should you remember about studying, Career, or projects?',
  'Календарь готовит следующий шаг.': 'The calendar is preparing the next step.',
  'План обучения': 'Learning plan',
  'Ближайший маршрут': 'Nearest route',
  'Структура страницы': 'Page structure',
  'Заголовки и текст': 'Headings and text',
  'Ссылки и картинки': 'Links and images',
  'Списки': 'Lists',
  'Формы — ввод данных': 'Forms — data input',
  'Семантические теги': 'Semantic tags',
  'Таблицы — данные в строках и столбцах': 'Tables — data in rows and columns',
  'Meta-теги — SEO и соцсети': 'Meta tags — SEO and social sharing',
  'Видео, аудио и iframe': 'Video, audio, and iframe',
  'Data-атрибуты и доступность (ARIA)': 'Data attributes and accessibility (ARIA)',
  'Картинки — img, srcset, picture': 'Images — img, srcset, picture',
  'Core Web Vitals — скорость глазами пользователя': 'Core Web Vitals — speed from the user view',
  'Инпуты — все типы полей формы': 'Inputs — all form field types',
  'iframe — встраиваем YouTube, карты, виджеты': 'iframe — embed YouTube, maps, widgets',
  '&lt;details&gt; и &lt;dialog&gt; — спойлеры и модалки без JS': '&lt;details&gt; and &lt;dialog&gt; — spoilers and modals without JS',
  'Popover API — попапы и подсказки без JS': 'Popover API — popups and hints without JS',
  'Как подключить CSS': 'How to connect CSS',
  'Селекторы — к чему применять стили': 'Selectors — what styles apply to',
  '&lt;div&gt; — универсальный контейнер': '&lt;div&gt; — universal container',
  '&lt;span&gt; — строчный контейнер': '&lt;span&gt; — inline container',
  'Разный фон на каждой странице': 'Different background on each page',
  'Вложенные селекторы — стили внутри страницы': 'Nested selectors — styles inside a page',
  'Центрирование списков (ul, ol)': 'Centering lists (ul, ol)',
  'Центрирование кнопки &lt;button&gt;': 'Centering a &lt;button&gt;',
  'Карточка товара — картинка + текст под ней': 'Product card — image plus text below',
  'Блочная модель (Box Model)': 'Box Model',
  'Flexbox — расположение в ряд': 'Flexbox — row layout',
  'Grid — сетка / таблица': 'Grid — layout grid',
  'CSS Анимации и Transition': 'CSS animations and transition',
  'Анимация при скролле (Intersection Observer)': 'Scroll animation (Intersection Observer)',
  'Пример: машина уезжает при скролле': 'Example: a car moves away on scroll',
  'CSS-переменные': 'CSS variables',
  'Тумблер (Toggle Switch) — как сделать': 'Toggle switch — how to build it',
  'Градиентный текст и эффекты': 'Gradient text and effects',
  'Position — позиционирование элементов': 'Position — element positioning',
  'Псевдоклассы и псевдоэлементы': 'Pseudo-classes and pseudo-elements',
  'Медиа-запросы — адаптивность': 'Media queries — responsive design',
  'Container Queries — адаптивность по контейнеру': 'Container Queries — container-based responsiveness',
  'Типографика — шрифты и текст': 'Typography — fonts and text',
  'Transition — плавные переходы': 'Transition — smooth changes',
  'Transform — сдвиг, поворот, масштаб': 'Transform — move, rotate, scale',
  'Тени — box-shadow, text-shadow, drop-shadow': 'Shadows — box-shadow, text-shadow, drop-shadow',
  'z-index и stacking context — кто над кем': 'z-index and stacking context — who is above whom',
  'filter и backdrop-filter — размытие, glassmorphism': 'filter and backdrop-filter — blur, glassmorphism',
  'object-fit и aspect-ratio — картинки без растяжения': 'object-fit and aspect-ratio — images without stretching',
  'SCSS — переменные и вложенность': 'SCSS — variables and nesting',
  'SCSS — функции, циклы и @extend': 'SCSS — functions, loops, and @extend',
  'Tailwind CSS — utility-first стек': 'Tailwind CSS — utility-first stack',
  'Современный CSS: @layer и nesting': 'Modern CSS: @layer and nesting',
  'CSS 2026: @scope, scroll-driven и View Transitions': 'CSS 2026: @scope, scroll-driven animations, and View Transitions',
  'Переменные — где храним данные': 'Variables — where data is stored',
  'Строки — работа с текстом': 'Strings — working with text',
  'Условия — если... то...': 'Conditions — if... then...',
  'Циклы — повторяем действие': 'Loops — repeat an action',
  'Массивы — список элементов': 'Arrays — lists of items',
  'DOM — управляем страницей': 'DOM — control the page',
  'События — реагируем на действия': 'Events — react to actions',
  'Асинхронность и fetch — запросы к серверу': 'Async and fetch — requests to the server',
  'localStorage — сохраняем в браузере': 'localStorage — save in the browser',
  'localStorage на примере счетчика и темы': 'localStorage with a counter and theme',
  'Карусель (слайдер) — листаем фото стрелками': 'Carousel (slider) — switch photos with arrows',
  'Объекты — структурированные данные': 'Objects — structured data',
  'try / catch — обработка ошибок': 'try / catch — error handling',
  'Функции — обычные, стрелочные, параметры': 'Functions — regular, arrow, parameters',
  'Promise и async/await — асинхронность по-человечески': 'Promise and async/await — async in human language',
  'Деструктуризация и spread — современный синтаксис': 'Destructuring and spread — modern syntax',
  'setTimeout, setInterval, debounce': 'setTimeout, setInterval, debounce',
  'Классы — class, extends, this': 'Classes — class, extends, this',
  'Event Loop — как работает асинхронность': 'Event Loop — how async works',
  'Замыкания (Closures)': 'Closures',
  'Архитектура JS-кода до React': 'JS code architecture before React',
  'Основы TypeScript — типы переменных': 'TypeScript basics — variable types',
  'Интерфейсы и type alias': 'Interfaces and type aliases',
  'Дженерики (Generics)': 'Generics',
  'Enum и литеральные типы': 'Enum and literal types',
  'Type Narrowing и Type Guards': 'Type narrowing and type guards',
  'Async/await с типами и работа с API': 'Async/await with types and APIs',
  'tsconfig.json — настройка компилятора': 'tsconfig.json — compiler setup',
  'Discriminated Unions и advanced типы': 'Discriminated unions and advanced types',
  'TypeScript + React — типизация компонентов': 'TypeScript + React — component typing',
  'void, never, unknown — отличия': 'void, never, unknown — differences',
  'Conditional Types и Mapped Types': 'Conditional types and mapped types',
  'Type Assertions: as и satisfies': 'Type assertions: as and satisfies',
  'Компоненты и JSX': 'Components and JSX',
  'Хуки: useState и useEffect': 'Hooks: useState and useEffect',
  'Списки и условный рендер': 'Lists and conditional rendering',
  'Формы и controlled components': 'Forms and controlled components',
  'useContext — глобальное состояние': 'useContext — global state',
  'useMemo, useCallback и React.memo': 'useMemo, useCallback, and React.memo',
  'React Router — навигация': 'React Router — navigation',
  'Кастомные хуки': 'Custom hooks',
  'useRef — прямой доступ к DOM': 'useRef — direct DOM access',
  'useEffect: функция очистки (cleanup)': 'useEffect: cleanup function',
  'useEffect: бесконечный цикл': 'useEffect: infinite loop',
  'State Management: Redux Toolkit и Zustand': 'State management: Redux Toolkit and Zustand',
  'TanStack Query — правильная работа с сервером': 'TanStack Query — correct server-state work',
  'useReducer и useLayoutEffect': 'useReducer and useLayoutEffect',
  'Архитектура FSD — стандарт крупных проектов': 'FSD architecture — standard for large projects',
  'Zustand: селекторы — без них смысла нет': 'Zustand selectors — they are the point',
  'Zustand middleware: persist и devtools': 'Zustand middleware: persist and devtools',
  'Тестирование: Vitest + React Testing Library': 'Testing: Vitest + React Testing Library',
  'React в крупных продуктах: микрофронтенды': 'React in large products: microfrontends',
  'Базовые команды терминала': 'Basic terminal commands',
  'Права доступа и пользователи': 'Permissions and users',
  'Процессы и системный мониторинг': 'Processes and system monitoring',
  'SSH — подключение к серверам': 'SSH — connecting to servers',
  'Bash-скрипты и автоматизация': 'Bash scripts and automation',
  'Пакетные менеджеры и npm-инструменты': 'Package managers and npm tools',
  'Vite — быстрый dev-сервер и сборка': 'Vite — fast dev server and build',
  'ESLint + Prettier — качество кода': 'ESLint + Prettier — code quality',
  'Переменные окружения (.env)': 'Environment variables (.env)',
  'SSR, Islands и новые сборщики': 'SSR, Islands, and new bundlers',
  'Что реально требуют на рынке': 'What the market actually requires',
  'Зарплаты frontend-разработчиков': 'Frontend developer salaries',
  'Портфолио — что реально работает': 'Portfolio — what really works',
  'Резюме frontend-разработчика': 'Frontend developer resume',
  'Собеседование — как проходит и что спрашивают': 'Interview — how it works and what they ask',
  'Prompt Engineering для обучения коду': 'Prompt engineering for learning code',
  'Code Smells — признаки что пора рефакторить': 'Code smells — signs it is time to refactor',
  'DRY, KISS, YAGNI — главные принципы': 'DRY, KISS, YAGNI — main principles',
  'Extract Function и Extract Variable': 'Extract Function and Extract Variable',
  'Рефакторинг условий': 'Refactoring conditions',
  'Когда рефакторить (и когда не стоит)': 'When to refactor and when not to',
  'Big O — сложность алгоритмов': 'Big O — algorithm complexity',
  'Задачи на массивы — топ на собесах': 'Array tasks — top interview topic',
  'Задачи на строки': 'String tasks',
  'Рекурсия': 'Recursion',
  'Структуры данных: Stack, Queue, Tree, Graph': 'Data structures: Stack, Queue, Tree, Graph',
  'AST и Bloom Filter': 'AST and Bloom Filter',
  'Что такое Figma и зачем она тебе': 'What Figma is and why you need it',
  'Интерфейс Figma — что где находится': 'Figma interface — where everything is',
  'Inspect — как получить CSS из Figma': 'Inspect — how to get CSS from Figma',
  'Слои и типы элементов': 'Layers and element types',
  'Экспорт картинок и иконок': 'Exporting images and icons',
  'Горячие клавиши — ускоряют в 3 раза': 'Hotkeys — speed you up 3x',
  'Компоненты, стили и переменные': 'Components, styles, and variables',
  'Алгоритм верстки по макету Figma': 'Figma-to-layout workflow',
  'Design Tokens: цвета, отступы, шрифты': 'Design tokens: colors, spacing, fonts',
  'Полезные плагины для разработчиков': 'Useful plugins for developers',
  'Установка и первая настройка': 'Install and first setup',
  'Статус и добавление файлов': 'Status and adding files',
  'Коммиты — сохраняем историю': 'Commits — save history',
  'Ветки — работаем параллельно': 'Branches — work in parallel',
  'Remote — работа с GitHub': 'Remote — working with GitHub',
  'Конфликты и их решение': 'Conflicts and how to solve them',
  '.gitignore — что НЕ добавлять в репо': '.gitignore — what not to add to a repo',
  'Stash и cherry-pick': 'Stash and cherry-pick',
  'Визуализация веток — как это выглядит': 'Branch visualization — how it looks',
  'Типичные сценарии — пошаговые команды': 'Typical scenarios — step-by-step commands',
  'Push — отправка изменений на GitHub': 'Push — send changes to GitHub',
  'Конфликт при git pull — что делать': 'Conflict during git pull — what to do',
  'Что такое Node.js и зачем он': 'What Node.js is and why it exists',
  'Установка и первый запуск': 'Install and first run',
  'npm — менеджер пакетов': 'npm — package manager',
  'Первый сервер на Express': 'First Express server',
  'Что такое API и JSON': 'What API and JSON are',
  'Куда двигаться дальше': 'Where to go next',
  'Middleware и структура Express-приложения': 'Middleware and Express app structure',
  'Переменные окружения и .env': 'Environment variables and .env',
  'Работа с файловой системой (fs)': 'Working with the file system (fs)',
  'Next.js + Node.js — почему вместе лучше': 'Next.js + Node.js — why they work well together',
  'App Router — файловая система как роутинг': 'App Router — file system as routing',
  'API Routes — Node.js backend внутри Next.js': 'API Routes — Node.js backend inside Next.js',
  'Server Components и загрузка данных': 'Server Components and data loading',
  'SSG и ISR — статическая генерация': 'SSG and ISR — static generation',
  'Session vs JWT — два подхода к авторизации': 'Session vs JWT — two auth approaches',
  'Access и Refresh токены': 'Access and refresh tokens',
  'Безопасные куки: httpOnly, Secure, SameSite': 'Secure cookies: httpOnly, Secure, SameSite',
  'Валидация данных через Zod': 'Data validation with Zod',
  'CORS и Security Headers': 'CORS and Security Headers',
  'Zod: refine и transform': 'Zod: refine and transform',
  'REST, GraphQL, gRPC, tRPC и SSE': 'REST, GraphQL, gRPC, tRPC, and SSE',
  'WebSockets — реальное время (Socket.io)': 'WebSockets — real time (Socket.io)',
  'Что такое база данных': 'What a database is',
  'SELECT — получить данные': 'SELECT — get data',
  'INSERT, UPDATE, DELETE': 'INSERT, UPDATE, DELETE',
  'Ключи и связи таблиц': 'Keys and table relations',
  'Где практиковаться': 'Where to practice',
  'JOIN — объединение таблиц': 'JOIN — combine tables',
  'Агрегатные функции и GROUP BY': 'Aggregate functions and GROUP BY',
  'Индексы и оптимизация': 'Indexes and optimization',
  'Транзакции и уровни изоляции': 'Transactions and isolation levels',
  'Redis и NoSQL — когда не только SQL': 'Redis and NoSQL — when SQL is not enough',
  'Как устроен сервер': 'How a server works',
  'Кэширование — главный ускоритель': 'Caching — the main accelerator',
  'Балансировка нагрузки': 'Load balancing',
  'Docker — контейнеры': 'Docker — containers',
  'Полная картина: путь к «много людей»': 'Full picture: the path to many users',
  'CI/CD: GitHub Actions — автоматизация деплоя': 'CI/CD: GitHub Actions — deploy automation',
  'Docker Compose и Nginx reverse proxy': 'Docker Compose and Nginx reverse proxy',
  'Очереди сообщений: RabbitMQ и Kafka': 'Message queues: RabbitMQ and Kafka',
  'Установка и подключение': 'Install and connection',
  'Параметризованные запросы и безопасность': 'Parameterized queries and security',
  'Схема БД и миграции': 'DB schema and migrations',
  'CRUD операции в PostgreSQL': 'CRUD operations in PostgreSQL',
  'JSON и JSONB в PostgreSQL': 'JSON and JSONB in PostgreSQL',
  'Функции, триггеры и представления': 'Functions, triggers, and views',
  'Prisma ORM — работа с PostgreSQL из Node.js': 'Prisma ORM — PostgreSQL from Node.js',
  '🆕 Создать новый репозиторий': '🆕 Create a new repository',
  '🚀 Загрузить файл в репозиторий GitHub': '🚀 Upload a file to a GitHub repository',
  'Понимаю, зачем нужен DOCTYPE': 'I understand why DOCTYPE is needed',
  'На странице только один h1 — остальные h2, h3...': 'Only one h1 per page — the rest are h2, h3...',
  '&lt;p&gt; для текста, не &lt;div&gt;': '&lt;p&gt; for text, not &lt;div&gt;',
  '&lt;strong&gt; = важно, &lt;em&gt; = акцент (ударение)': '&lt;strong&gt; = important, &lt;em&gt; = emphasis',
  'CSS — это не “красота”, а правила отображения.': 'CSS is not just “beauty”; it is display rules.',
  'Переменная — это коробка с именем, где лежит значение.': 'A variable is a named box that stores a value.',
  'Функция — это кусок кода, которому дали имя.': 'A function is a piece of code with a name.',
  'DOM — это HTML, превращённый браузером в дерево объектов.': 'DOM is HTML turned by the browser into an object tree.',
  'Событие — это действие пользователя или браузера.': 'An event is an action from the user or the browser.',
  'localStorage хранит строки в браузере даже после перезагрузки страницы.': 'localStorage stores strings in the browser even after page reload.',
  'ИИ-помощник': 'AI assistant',
  'Выбери модель →': 'Choose model →',
  'Контекст из темы': 'Topic context',
  'Спросить ИИ': 'Ask AI',
  'Или просто напиши свой вопрос ниже.': 'Or just type your question below.',
  'Задай вопрос...': 'Ask a question...',
  'Замыкания JS': 'JS closures',
  'Как работает flexbox?': 'How does flexbox work?',
  'Очистить историю ИИ-чата?': 'Clear AI chat history?',
  'История ИИ-чата очищена': 'AI chat history cleared',
  'Убрать файл': 'Remove file',
  'Проанализируй прикреплённые файлы.': 'Analyze the attached files.',
  'Нет ответа': 'No response',
  'Найди ошибки': 'Find bugs',
  'Улучшить код': 'Improve code',
  'Объясни код': 'Explain code',
  'Добавь комментарии': 'Add comments',
  'Вставить в редактор': 'Insert into editor',
  'Вставлено!': 'Inserted!',
  'Сохранено и применяется при каждой загрузке': 'Saved and applied on every load'
};


Object.assign(WDG_TEXT_EN, {
  'Ссылка на ДРУГОЙ САЙТ': 'Link to ANOTHER WEBSITE',
  'Ссылка на ДРУГУЮ СТРАНИЦУ ТВОЕГО САЙТА': 'Link to ANOTHER PAGE OF YOUR SITE',
  'Ссылка в НОВОЙ ВКЛАДКЕ': 'Link in a NEW TAB',
  'Ссылка на РАЗДЕЛ ЭТОЙ ЖЕ страницы': 'Link to a SECTION OF THIS SAME page',
  'Кнопка-ссылка': 'Button link',
  'кнопка, которая ведёт на другую страницу': 'a button that goes to another page',
  'Картинка': 'Image',
  'Открыть Google': 'Open Google',
  'Настройки': 'Settings',
  'Обо мне': 'About me',
  'Контакты': 'Contacts',
  'Перейти к': 'Go to',
  'О нас': 'About us',
  'Закат на море': 'Sunset at the sea',
  'На другой сайт': 'To another website',
  'На свою страницу': 'To your own page',
  'В новой вкладке': 'In a new tab',
  'Якорь (#)': 'Anchor (#)',
  'Кнопка-ссылка': 'Button link',
  'Картинка': 'Image',
  'полный адрес сайта': 'the full website address',
  'Браузер откроет этот сайт': 'The browser opens that site',
  'имя файла': 'file name',
  'Если файл в папке': 'If the file is in a folder',
  'Если на уровень выше': 'If it is one level up',
  'откроется в отдельной вкладке': 'opens in a separate tab',
  'не закрывая текущую': 'without closing the current one',
  'прокрутит страницу до элемента с': 'scrolls the page to the element with',
  'Работает только внутри одной страницы': 'Works only inside one page',
  'оборачиваешь': 'wrap',
  'получится кнопка, которая ведёт на другую страницу': 'you get a button that goes to another page',
  'путь к файлу картинки': 'path to the image file',
  'описание для слепых': 'description for blind users',
  'обязательно': 'required',
  'ссылка на свой файл': 'link to your own file',
  'на чужой сайт': 'to another website',
  'новая вкладка': 'new tab',
  'безопасность': 'security',
  'якорь': 'anchor',
  'прокрутит к': 'scrolls to',
  'на этой странице': 'on this page',
  'кнопка-ссылка': 'button link',
  'Текст': 'Text',
  'Другой сайт': 'Another website',
  'Другая страница': 'Another page',
  'Новая вкладка': 'New tab',
  'Раздел страницы': 'Page section',
  'Кнопка': 'Button',
  'Описание': 'Description',
  'страница': 'page',
  'сайт': 'site',
  'ссылка': 'link',
  'кнопка': 'button',
  'картинка': 'image',
  'раздел': 'section',
  'вкладка': 'tab',
  'файл': 'file',
  'папка': 'folder',
  'адрес': 'address',
  'пользователь': 'user',
  'браузер': 'browser',
  'страницы': 'pages',
  'сайта': 'site',
  'текущую': 'current one',
  'другую': 'another',
  'свою': 'your own',
  'чужой': 'external',
  'уровень выше': 'one level up',
  'внутри': 'inside',
  'одной': 'one',
  'этой же': 'this same',
  'ведёт': 'goes',
  'слепых': 'blind users',
  'русских букв': 'Russian letters',
  'видимый контент': 'visible content',
  'отступов': 'spacing',
  'абзацами': 'paragraphs',
  'Автоматически': 'Automatically',
  'автоматически': 'automatically',
  'добавляет': 'adds',
  'между': 'between',
  'разницу': 'difference',
  'Понимаю': 'I understand',
  'Знаю': 'I know',
  'Не забываю': 'I do not forget',
  'это': 'this is',
  'тут': 'here',
  'будут': 'there will be',
  'вместо': 'instead of',
  'нужен': 'is needed',
  'нужна': 'is needed',
  'нужно': 'is needed',
  'правильная структура': 'correct structure',
  'ошибка': 'error',
  'ошибки': 'errors',
  'частые ошибки': 'common mistakes',
  'пример': 'example',
  'примеры': 'examples',
  'задача': 'task',
  'задачи': 'tasks',
  'проект': 'project',
  'мини-проект': 'mini-project',
  'повторение': 'review',
  'отдых': 'rest',
  'теория': 'theory',
  'учеба': 'study',
  'учёба': 'study',
  'прогресс': 'progress',
  'изучено': 'completed',
  'закрыто': 'completed',
  'впереди': 'ahead',
  'дней': 'days',
  'час': 'hour',
  'часа': 'hours',
  'дня': 'days',
  'отдыха': 'of rest',
  'развития': 'development',
  'гибкий план': 'flexible plan',
  'следующий шаг': 'next step',
  'следующие шаги': 'next steps',
  'маршрут': 'route',
  'план обучения': 'learning plan',
  'ближайший': 'nearest',
  'заметка': 'note',
  'добавить': 'add',
  'сбросить': 'reset',
  'экспорт': 'export',
  'импорт': 'import',
  'скачан': 'downloaded',
  'импортирован': 'imported',
  'сброшен': 'reset',
  'календарь сброшен': 'Calendar reset',
  'календарь скачан в JSON': 'Calendar downloaded as JSON',
  'календарь импортирован': 'Calendar imported',
  'скопировать': 'copy',
  'скопировано': 'copied',
  'не получилось скопировать': 'Could not copy',
  'скопируй вручную': 'copy manually',
  'Выдели любой текст на странице и нажми': 'Select any text on the page and click',
  'объясню именно эту тему': 'I will explain this exact topic',
  'напиши свой вопрос ниже': 'write your question below',
  'Объясни проще': 'Explain simpler',
  'Пример с кодом': 'Code example',
  'Частые ошибки': 'Common mistakes',
  'Где применяется': 'Where it is used',
  'Задай любой вопрос': 'Ask any question',
  'Задай вопрос': 'Ask a question',
  'Выбери модель': 'Choose a model',
  'Модель не найдена': 'Model not found',
  'Неверный API ключ': 'Invalid API key',
  'Нет ответа': 'No response',
  'Ошибка': 'Error',
  'Заполни': 'Fill in',
  'сохранена': 'saved',
  'удалены': 'deleted',
  'Удалить': 'Delete',
  'Очистить историю': 'Clear history',
  'история': 'history',
  'фото': 'photo',
  'файл': 'file',
  'файлы': 'files',
  'Прикрепить файл': 'Attach file',
  'прикреплено': 'attached',
  'Прикреплённые файлы': 'Attached files',
  'Содержимое файла': 'File contents',
  'Проанализируй': 'Analyze',
  'модель': 'model',
  'ключ': 'key',
  'провайдер': 'provider',
  'сеть': 'network',
  'лимит': 'limit',
  'запрос': 'request',
  'запросов': 'requests'
});

Object.assign(WDG_TEXT_EN, {
  'заголовки.': 'headings.',
  'заголовки': 'headings',
  'самый важный': 'the most important one',
  'название страницы': 'page title',
  'самый мелкий': 'the smallest',
  'Используй по порядку': 'Use them in order',
  'Не перепрыгивай!': 'Do not skip levels.',
  'абзац': 'paragraph',
  'Браузер автоматически добавляет отступы между абзацами.': 'The browser automatically adds spacing between paragraphs.',
  'жирный, означает': 'bold, means',
  'важный': 'important',
  'текст.': 'text.',
  'курсив, означает': 'italic, means',
  'акцент': 'emphasis',
  'ударение': 'emphasis',
  'перенос строки.': 'line break.',
  'Не используй для отступов!': 'Do not use it for spacing.',
  'Для этого есть CSS.': 'CSS is for that.',
  'для текста, не': 'for text, not',
  'На странице только один': 'Only one',
  'остальные': 'the rest are',
  'только один на странице!': 'only one per page!',
  'Самый главный': 'The main heading',
  'Раздел': 'Section',
  'Подраздел': 'Subsection',
  'Это абзац текста.': 'This is a text paragraph.',
  'А тут': 'And here is',
  'жирный': 'bold',
  'курсив': 'italic',
  'Скелет сайта': 'Site skeleton',
  'Теги и атрибуты': 'Tags and attributes',
  'Семантика': 'Semantics',
  'SEO основа': 'SEO basics',
  'Начни здесь': 'Start here',
  'Язык стилей': 'Styling language',
  'Интерактивность': 'Interactivity',
  'Внешний вид': 'Appearance',
  'Адаптивность': 'Responsiveness',
  'Анимации': 'Animations',
  'Состояние': 'State',
  'Компоненты': 'Components',
  'Маршрутизация': 'Routing',
  'Состояние приложения': 'Application state',
  'Серверное состояние': 'Server state',
  'Тестирование': 'Testing',
  'Архитектура': 'Architecture',
  'Основная навигация': 'Main navigation',
  'thead + tbody — правильная структура таблицы': 'thead + tbody is the correct table structure',
  'Путь к файлу': 'File path',
  'Описание картинки': 'Image description',
  'Размер картинки': 'Image size'
});

Object.assign(WDG_TEXT_EN, {
  '📅 Календарь': '📅 Calendar',
  '💼 Карьера': '💼 Career',
  '🔗 Ссылки': '🔗 Links',
  '🧮 Алгоритмы': '🧮 Algorithms',
  '✨ ИИ': '✨ AI',
  '🔧 Рефакторинг': '🔧 Refactoring',
  '🔤 Шрифты': '🔤 Fonts',
  'Копировать': 'Copy',
  'Скопировано!': 'Copied!',
  'Добавить заметку': 'Add note',
  'Моя заметка': 'My note',
  'Наверх': 'To top',
  'Быстрое меню': 'Quick menu',
  'Показать только закладки': 'Show bookmarks only',
  'Вопросы по отмеченным темам': 'Questions from selected topics',
  'Скачать прогресс в JSON': 'Download progress as JSON',
  'Импортировать прогресс из JSON': 'Import progress from JSON',
  'Сбросить весь прогресс': 'Reset all progress',
  'Нажми чтобы изменить время': 'Click to change time',
  'Готово': 'Done',
  'Закрыть': 'Close',
  'Открыть': 'Open',
  'Сохранить': 'Save',
  'Удалить': 'Delete',
  'Очистить': 'Clear',
  'Поиск': 'Search',
  'Поиск по темам...': 'Search topics...',
  'Понимаю, зачем нужен DOCTYPE': 'I understand why DOCTYPE is needed',
  'Знаю разницу между': 'I know the difference between',
  'настройки': 'settings',
  'видимый контент': 'visible content',
  'Не забываю': 'I do not forget',
  'иначе будут': 'otherwise there will be',
  'вместо русских букв': 'instead of Russian letters',
  'это текст во вкладке браузера, а не на странице': 'this is the browser tab text, not page content',
  'говорит браузеру': 'tells the browser',
  'это современный HTML5': 'this is modern HTML5',
  'Пиши всегда первой строкой.': 'Always write it as the first line.',
  'корень страницы': 'the page root',
  'подсказывает браузеру и поисковикам язык': 'tells the browser and search engines the language',
  'голова': 'head',
  'сайта. Тут настройки, которые': 'of the site. It contains settings that are',
  'не видны': 'not visible',
  'на странице: кодировка, заголовок вкладки, подключение CSS.': 'on the page: encoding, tab title, CSS connection.',
  'чтобы русские буквы отображались нормально': 'so Russian letters display correctly',
  'Без этого будут': 'Without this there will be',
  'кракозябры': 'broken characters',
  'тело': 'body',
  'Всё, что ты тут напишешь,': 'Everything you write here',
  'увидит пользователь': 'will be seen by the user',
  'Заголовки и текст': 'Headings and text',
  'Ссылки и картинки': 'Links and images',
  'Формы — ввод данных': 'Forms — data input',
  'Семантические теги': 'Semantic tags',
  'Таблицы — данные в строках и столбцах': 'Tables — data in rows and columns',
  'Meta-теги — SEO и соцсети': 'Meta tags — SEO and social media',
  'Видео, аудио и iframe': 'Video, audio, and iframe',
  'Data-атрибуты и доступность (ARIA)': 'Data attributes and accessibility (ARIA)'
});

Object.assign(WDG_TEXT_EN, {
  'HTML — это скелет любого сайта. Он не отвечает за красоту, а говорит браузеру: «это заголовок», «это картинка», «это ссылка».': 'HTML is the skeleton of any website. It is not responsible for beauty; it tells the browser: “this is a heading”, “this is an image”, “this is a link”.',
  'DOCTYPE говорит браузеру: это современный HTML5. Пиши всегда первой строкой.': 'DOCTYPE tells the browser: this is modern HTML5. Always put it on the first line.',
  'Корень страницы. lang подсказывает браузеру и поисковикам язык.': 'The root of the page. lang tells the browser and search engines what language the page uses.',
  'head — «голова» сайта. Тут настройки, которые не видны на странице: кодировка, заголовок вкладки, подключение CSS.': 'head is the “head” of the site. It contains settings that are not visible on the page: encoding, tab title, CSS links.',
  'body — «тело» сайта. Всё, что ты тут напишешь, увидит пользователь.': 'body is the “body” of the site. Everything you write here is visible to the user.',
  'h1–h6 — заголовки. h1 — самый важный (название страницы), h6 — самый мелкий. Используй по порядку: h1 → h2 → h3. Не перепрыгивай!': 'h1–h6 are headings. h1 is the most important one (page title), h6 is the smallest. Use them in order: h1 → h2 → h3. Do not skip levels.',
  'p — абзац (paragraph). Браузер автоматически добавляет отступы между абзацами.': 'p is a paragraph. The browser automatically adds spacing between paragraphs.',
  'strong — жирный, означает важный текст.': 'strong makes text bold and means the text is important.',
  'em — курсив, означает акцент (ударение).': 'em makes text italic and means emphasis.',
  'br — перенос строки. Не используй для отступов! Для этого есть CSS.': 'br is a line break. Do not use it for spacing. CSS is for spacing.',
  'Ссылки бывают трёх типов: на другой сайт, на свою другую страницу, и на раздел этой же страницы.': 'Links have three common types: to another website, to another page of your site, and to a section on the same page.',
  'На другой сайт: href="https://..." — полный адрес сайта. Браузер откроет этот сайт.': 'To another website: href="https://..." is the full address. The browser opens that site.',
  'На свою страницу: href="settings.html" — имя файла. Если файл в папке: href="pages/settings.html". Если на уровень выше: href="../settings.html".': 'To your own page: href="settings.html" is the file name. If the file is in a folder: href="pages/settings.html". One level up: href="../settings.html".',
  'В новой вкладке: target="_blank" — откроется в отдельной вкладке, не закрывая текущую.': 'In a new tab: target="_blank" opens the link in a separate tab without closing the current one.',
  'Якорь (#): href="#about" — прокрутит страницу до элемента с id="about". Работает только внутри одной страницы.': 'Anchor (#): href="#about" scrolls the page to the element with id="about". It works inside one page.',
  'Кнопка-ссылка: оборачиваешь button в a — получится кнопка, которая ведёт на другую страницу.': 'Button link: wrap button in a link and you get a button that goes to another page.',
  'Картинка: src = путь к файлу, alt = описание картинки, width/height = размер.': 'Image: src is the file path, alt is the image description, width/height are the size.',
  'Без семантики — сайт для браузера как текст без знаков препинания. Непонятно, где важное, а где нет. Семантика помогает: поисковикам (SEO), скринридерам (слепым пользователям), другим разработчикам в команде.': 'Without semantics, a website is like text without punctuation. It is unclear what matters and what does not. Semantics helps search engines, screen readers, and other developers.',
  'Meta-теги не видны на странице, но влияют на то, как сайт выглядит в поиске и при репосте в соцсетях.': 'Meta tags are not visible on the page, but they affect how the site looks in search results and social sharing.',
  'Твой менеджер или дизайнер пришлёт тебе ссылку на Figma — и ты должен по ней сделать точно такой же сайт. Figma покажет все размеры, цвета, отступы и шрифты — прямо в пикселях. Тебе не нужно угадывать — просто смотри и копируй.': 'Your manager or designer will send you a Figma link, and you must build the site from it. Figma shows sizes, colors, spacing, and fonts in pixels. You do not guess; you inspect and reproduce.',
  'В правой панели Figma показывает: размер, отступы, цвет, шрифт, border-radius и даже готовый CSS-код.': 'In the right panel, Figma shows size, spacing, color, font, border-radius, and even ready CSS.',
  'Открой Inspect любого текста — запиши font-family, размеры, цвета. Занеси в :root как CSS-переменные.': 'Open Inspect for any text, write down font-family, sizes, and colors. Put them into :root as CSS variables.',
  'Если дизайнер использовал Auto Layout — у элемента будет , и . Figma покажет всё это в Inspect.': 'If the designer used Auto Layout, the element will have layout values. Figma shows them in Inspect.',
  'Генерирует HTML/CSS код из выделенных элементов. Не идеален, но даёт хорошую отправную точку.': 'Generates HTML/CSS from selected elements. It is not perfect, but it gives a good starting point.',
  'Файл скачается. Положи в папку проекта и подключи через &lt;img src="..."&gt; или background-image.': 'The file will download. Put it into your project folder and connect it through &lt;img src="..."&gt; or background-image.',
  'CSS — это не “красота”, а правила отображения.': 'CSS is not just “beauty”; it is display rules.',
  'Сначала header, потом секции, потом footer. В каждой секции — сначала контейнер, потом его содержимое.': 'First header, then sections, then footer. In each section: first a container, then its content.',
  'Transition делает изменения CSS-свойств плавными. Самый простой способ добавить «жизнь» в интерфейс.': 'Transition makes CSS property changes smooth. It is the simplest way to add life to an interface.',
  'Тени делают интерфейс «объёмным». Главное — не перебарщивать. Хорошая тень мягкая и едва заметная.': 'Shadows add depth to an interface. The main rule: do not overdo it. A good shadow is soft and subtle.',
  'Элементы появляются плавно, когда пользователь доскролливает до них — как на современных сайтах.': 'Elements appear smoothly when the user scrolls to them, like on modern websites.',
  'Тумблер — это стилизованный чекбокс. Делается через &lt;input type="checkbox"&gt; + CSS псевдоэлементы.': 'A toggle is a styled checkbox. It is built with &lt;input type="checkbox"&gt; plus CSS pseudo-elements.',
  '&lt;span&gt; — как &lt;div&gt;, но НЕ создаёт новую строку. Для части текста внутри &lt;p&gt;.': '&lt;span&gt; is like &lt;div&gt;, but it does not create a new line. Use it for part of text inside &lt;p&gt;.',
  'Центрирование fixed-элемента: top/left 50% + transform: translate(-50%,-50%)': 'Centering a fixed element: top/left 50% plus transform: translate(-50%, -50%).',
  'z-index работает только при position: relative/absolute/fixed/sticky': 'z-index works only with position: relative/absolute/fixed/sticky.',
  'overflow: hidden на родителе обрезает absolute-дочернего — осторожно с дропдаунами': 'overflow: hidden on a parent cuts off absolute children. Be careful with dropdowns.',
  'Core Web Vitals — метрики Google про то, как пользователь ощущает страницу: быстро ли появился главный контент, не прыгает ли layout, быстро ли сайт реагирует.': 'Core Web Vitals are Google metrics for how a user feels the page: how fast main content appears, whether layout jumps, and how fast the site reacts.',
  'Медиа-запросы реагируют на размер ВСЕГО окна браузера. Но что если одна и та же карточка лежит и в узком сайдбаре, и в широком центре страницы? Container Queries решают именно это.': 'Media queries react to the whole browser window. But what if the same card is inside a narrow sidebar and a wide content area? Container Queries solve exactly that.',
  'В новых React-проектах Tailwind часто выбирают вместо ручного SCSS: стили собираются из маленьких utility-классов прямо в JSX, а дизайн-система живёт в конфиге.': 'In new React projects, Tailwind is often chosen instead of manual SCSS: styles are built from small utility classes directly in JSX, and the design system lives in the config.',
  'меньше случайных CSS-файлов и конфликтов имён, проще держать единые отступы, цвета и состояния.': 'fewer random CSS files and naming conflicts, easier consistent spacing, colors, and states.',
  'для функций, mixin и сложных циклов, но вложенность больше не является его уникальной суперсилой.': 'for functions, mixins, and complex loops, but nesting is no longer its unique superpower.',
  'ограничивает область действия селекторов. Это похоже на локальные стили компонента, но без CSS Modules.': 'limits selector scope. It is similar to local component styles, but without CSS Modules.',
  'Проверяй поддержку CSS и JS фич в браузерах. Открывай перед тем как использовать что-то новое.': 'Check browser support for CSS and JS features. Open this before using something new.',
  'Визуальный редактор кривых анимации. Незаменим для настройки transition и animation timing.': 'A visual animation curve editor. Essential for tuning transition and animation timing.',
  'Огромная библиотека CSS компонентов — кнопки, карточки, инпуты, лоадеры. Всё бесплатно и с кодом.': 'A huge library of CSS components: buttons, cards, inputs, loaders. Everything is free and includes code.',
  'Переменная — это коробка с именем, где лежит значение.': 'A variable is a named box that stores a value.',
  'Функция — это кусок кода, которому дали имя.': 'A function is a piece of code with a name.',
  'DOM — это HTML, превращённый браузером в дерево объектов.': 'DOM is HTML turned by the browser into an object tree.',
  'Событие — это действие пользователя или браузера.': 'An event is an action from the user or the browser.',
  'Объект — это набор «ключ: значение». Идеально для описания сущностей: пользователь, товар, задача.': 'An object is a set of key-value pairs. It is perfect for describing entities: user, product, task.',
  'Когда код «ждёт» (запрос к серверу, таймер) — он работает асинхронно. Promise — обещание дать результат «потом». async/await — синтаксис, чтобы это выглядело как обычный код.': 'When code “waits” (server request, timer), it works asynchronously. A Promise is a promise to give a result later. async/await makes it look like normal code.',
  'Любимый вопрос интервьюеров №1. Замыкание — это функция, которая "помнит" переменные из окружения, в котором она была создана, даже после того как это окружение завершило работу.': 'A favorite interview question. A closure is a function that remembers variables from the environment where it was created, even after that environment has finished.',
  'Не добавляй addEventListener повторно без removeEventListener — будут дубли': 'Do not add the same addEventListener repeatedly without removeEventListener — duplicates will appear.',
  'Делегирование событий — один обработчик на родителя вместо 100 на детей': 'Event delegation means one handler on the parent instead of 100 handlers on children.',
  'Анонимную функцию нельзя удалить через removeEventListener — давай имена': 'An anonymous function cannot be removed with removeEventListener. Give handlers names.',
  'Понимаю как считается специфичность: ID > класс > тег': 'I understand specificity: ID > class > tag.',
  '!important — последнее средство, не первое решение': '!important is the last resort, not the first solution.',
  'Инлайновый style перебивает любой CSS в файле': 'Inline style overrides any CSS in a stylesheet.',
  'Напиши функцию , которая принимает строку, убирает пробелы по краям и возвращает её в верхнем регистре.': 'Write a function that takes a string, trims spaces from the edges, and returns it in uppercase.',
  'Напиши компонент , который принимает и как props и возвращает JSX с &lt;h2&gt; и &lt;p&gt;.': 'Write a component that takes data as props and returns JSX with &lt;h2&gt; and &lt;p&gt;.',
  'Для списков используй .map() с обязательным key. Условный рендер — через && или тернарный оператор.': 'For lists, use .map() with a required key. Conditional rendering is done with && or a ternary operator.',
  'useRef — фундаментальный хук. Нужен когда нужно достать DOM-элемент напрямую (фокус, размеры)': 'useRef is a fundamental hook. Use it when you need direct access to a DOM element, such as focus or size.',
  'useContext хорош для простых случаев, но в крупных приложениях вызывает лишние перерисовки. Почти все вакансии требуют знание внешней библиотеки для глобального состояния.': 'useContext is good for simple cases, but in large apps it can cause extra re-renders. Many jobs expect knowledge of an external global-state library.',
  'Писать сырой fetch внутри useEffect — устаревший подход. Это приводит к race conditions, отсутствию кэширования и тоннам шаблонного кода для loading/error состояний.': 'Writing raw fetch inside useEffect is an outdated approach. It leads to race conditions, no caching, and lots of boilerplate for loading/error states.',
  'Vitest — современная и быстрая замена Jest, особенно для проектов на Vite (использует тот же движок и конфиг). React Testing Library — стандарт для тестирования React-компонентов.': 'Vitest is a modern fast replacement for Jest, especially in Vite projects. React Testing Library is the standard for testing React components.',
  'В маленьких проектах файлы делят по типу: components/, hooks/, pages/. В крупных проектах этот подход превращается в кашу. Современный стандарт на рынке — методология FSD (Feature-Sliced Design).': 'In small projects, files are grouped by type: components/, hooks/, pages/. In large projects this becomes messy. A modern market standard is FSD (Feature-Sliced Design).',
  'В реальных проектах стор часто должен переживать перезагрузку страницы: тема, корзина, настройки, токен-состояние интерфейса. Для этого в Zustand есть middleware.': 'In real projects, state often must survive page reload: theme, cart, settings, UI token state. Zustand has middleware for this.',
  'Терминал — это текстовый интерфейс к системе. Работает быстрее мыши для большинства задач разработчика.': 'The terminal is a text interface to the system. It is faster than the mouse for most developer tasks.',
  'Ветка — это независимая копия кода. Делаешь новую фичу? Создай ветку — main остаётся нетронутым.': 'A branch is an independent copy of the code. Building a new feature? Create a branch; main stays untouched.',
  'Каждый кружок — коммит. Стрелка — от нового к старому. Ветки — параллельные линии истории.': 'Each circle is a commit. The arrow goes from newer to older. Branches are parallel lines of history.',
  'VS Code подсвечивает конфликты и показывает кнопки: «Accept Current», «Accept Incoming», «Accept Both».': 'VS Code highlights conflicts and shows buttons: “Accept Current”, “Accept Incoming”, “Accept Both”.',
  'Загрузи файл напрямую в твой GitHub репозиторий через API — прямо отсюда. Токен нигде не сохраняется.': 'Upload a file directly to your GitHub repository through the API from here. The token is not saved anywhere.',
  'Браузер умеет запускать JS. Но JS «снаружи» браузера — на компьютере, на сервере — запускает': 'The browser can run JS. But JS outside the browser, on a computer or server, is run by',
  'Node.js — фреймворк поверх React, который сам является Node.js приложением.': 'Node.js runs JavaScript outside the browser. Next.js is a framework over React that runs as a Node.js application.',
  'Next.js — фреймворк поверх React, который сам является Node.js приложением. Понимание Node.js — обязательное условие чтобы по-настоящему понимать Next.js, а не просто копировать код.': 'Next.js is a framework over React that itself runs as a Node.js app. Understanding Node.js is required to truly understand Next.js instead of just copying code.',
  'Если ты понимаешь чистый Node.js (как работает сервер, event loop, модули), то код Next.js перестаёт быть "магией" — ты понимаешь что происходит при каждом запросе.': 'If you understand plain Node.js (server, event loop, modules), Next.js code stops being magic; you understand what happens on every request.',
  'REST API работает по принципу "запрос → ответ". Но чаты, уведомления в реальном времени и live-обновления (например, совместное редактирование) требуют постоянного соединения — для этого WebSockets.': 'REST API works as request → response. But chats, real-time notifications, and live updates need a persistent connection. That is what WebSockets are for.',
  'REST — база. Но в командах встречаются и другие подходы: GraphQL для гибких запросов, gRPC для микросервисов, tRPC для TypeScript fullstack, SSE для стриминга.': 'REST is the base. But teams also use GraphQL for flexible requests, gRPC for microservices, tRPC for TypeScript fullstack, and SSE for streaming.',
  '— формат передачи данных. Выглядит как JS-объект. Понятен и серверу, и браузеру, и любому языку.': 'is a data exchange format. It looks like a JS object and is understandable to servers, browsers, and any language.',
  'Session vs JWT — два подхода к авторизации': 'Session vs JWT — two authorization approaches',
  'Почему нельзя выдать один токен навечно? Потому что если его украдут (XSS, перехват) — злоумышленник получит доступ навсегда. Решение — короткоживущий Access + долгоживущий Refresh.': 'Why not issue one token forever? If it is stolen through XSS or interception, the attacker gets access forever. The solution is short-lived Access plus long-lived Refresh.',
  'Хранить токены в localStorage в реальных проектах небезопасно — любой встроенный на страницу скрипт (XSS-атака) может их прочитать. httpOnly cookie решает эту проблему.': 'Storing tokens in localStorage is unsafe in real projects: any injected script can read them. httpOnly cookies solve this problem.',
  'Access живёт мало — даже если украден, окно для атаки маленькое (15 минут). Refresh живёт долго, но хранится только в httpOnly cookie, недоступной для JS/XSS.': 'Access lives for a short time, so even if stolen, the attack window is small. Refresh lives longer but is stored in httpOnly cookies unavailable to JS/XSS.',
  '— если подставлять данные в строку напрямую, злоумышленник может выполнить произвольный SQL.': 'if you insert data directly into a string, an attacker can execute arbitrary SQL.',
  'PostgreSQL — стандарт для серьёзных проектов. Открытый исходный код, ACID-совместимость, JSON, полнотекстовый поиск. Используется везде от стартапов до банков.': 'PostgreSQL is a standard for serious projects: open source, ACID compliance, JSON, full-text search. It is used everywhere from startups to banks.',
  'Сначала PostgreSQL/SQL. NoSQL добавляй не «потому что модно», а когда есть реальная причина.': 'Start with PostgreSQL/SQL. Add NoSQL not because it is trendy, but when there is a real reason.',
  'CI/CD автоматизирует то, что иначе делаешь руками: проверку кода и деплой. Один файл — и при каждом пуше в main линтер проверяет код, а проект автоматически деплоится.': 'CI/CD automates what you would otherwise do manually: code checks and deployment. One file, and on every push to main the linter checks code and the project deploys automatically.',
  'Dockerfile собирает один контейнер. Docker Compose запускает сразу несколько: сайт, сервер, базу, Redis. Nginx принимает запросы снаружи и прокидывает их внутрь.': 'A Dockerfile builds one container. Docker Compose starts several at once: site, server, database, Redis. Nginx receives external requests and forwards them inside.',
  'контейнер — как транспортный контейнер на корабле. Неважно что внутри — он стандартного размера и подходит к любому кораблю, крану, грузовику. Так же Docker-контейнер запускается на любом сервере одинаково.': 'A container is like a shipping container. No matter what is inside, it has a standard shape and fits any ship, crane, or truck. A Docker container runs the same on any server.',
  '— это просто компьютер, который всегда включён и отвечает на запросы из интернета. Когда ты открываешь сайт — твой браузер шлёт запрос на сервер, сервер отвечает.': 'is just a computer that is always on and responds to internet requests. When you open a site, your browser sends a request to the server and the server responds.',
  '— выполняется синхронно ДО того как браузер отрисует изменения. Используй только для измерений DOM, которые должны быть видны мгновенно (иначе будет "мигание").': 'runs synchronously before the browser paints changes. Use it only for DOM measurements that must be visible immediately; otherwise there may be flicker.',
  'Рефакторинг — это изменение структуры кода без изменения того, что он делает. Грязный код работает, но рефакторинг делает его понятным, поддерживаемым и расширяемым.': 'Refactoring changes code structure without changing behavior. Dirty code can work, but refactoring makes it understandable, maintainable, and extensible.',
  'Code Smell — не баг, код работает. Но это сигнал что структура плохая и в будущем создаст проблемы.': 'A code smell is not a bug; the code works. But it signals bad structure that will create problems later.',
  '— если функция не помещается на экран, скорее всего делает слишком много. Раздели на части.': 'if a function does not fit on one screen, it probably does too much. Split it into parts.',
  'защищают от лишней сложности: без React, без библиотек, только подсказки, не полный ответ.': 'protect from extra complexity: no React, no libraries, only hints, not the full answer.',
  'Структура данных — это способ хранить данные так, чтобы нужные операции были удобными и быстрыми.': 'A data structure is a way to store data so the needed operations are convenient and fast.',
  'достаточно понять идею producer → queue → worker. Реально понадобится позже, когда будет backend-проект.': 'it is enough to understand the idea: producer → queue → worker. You will really need it later in backend projects.',
  'Пиши HTML, CSS и JS — результат сразу виден справа. Идеально для экспериментов по темам роадмапа.': 'Write HTML, CSS, and JS; the result is visible on the right immediately. Perfect for experiments with roadmap topics.',
  'Отобранные инструменты, библиотеки и сайты которые реально используются в работе. Без мусора.': 'Selected tools, libraries, and websites that are actually used at work. No junk.',
  'Не книга, а самая авторитетная документация. Каждый тег с примерами и нюансами поддержки браузерами.': 'Not a book, but the most authoritative documentation. Every tag has examples and browser-support nuances.',
  'Английская версия learn.javascript.ru. Тот же контент — для английских интервью и вакансий.': 'The English version of learn.javascript.ru. Same kind of content, useful for English interviews and jobs.',
  'От автора jQuery. Замыкания, прототипы, this, события — глубоко и с тестами, проверяющими ваши знания.': 'From the creator of jQuery. Closures, prototypes, this, events — deeply explained with knowledge-checking tests.',
  'Быстрая бурая лиса прыгает через ленивую собаку. The quick brown fox jumps over the lazy dog.': 'The quick brown fox jumps over the lazy dog.',
  'Один для заголовков, один для текста — этого хватает в 95% случаев. Каждый шрифт = +30-100 КБ загрузки.': 'One font for headings and one for body text is enough in 95% of cases. Every font adds 30-100 KB of loading.',
  'Своя модель и API ключ': 'Your own model and API key',
  'опционально': 'optional',
  'Примеры настроек по провайдерам': 'Provider setup examples',
  'справка': 'help',
  'Главная роль:': 'Main role:',
  'Code review и анализ файлов:': 'Code review and file analysis:',
  'Доступные template_name: "flexbox", "animation", "form", "todo".': 'Available template_name values: "flexbox", "animation", "form", "todo".',
  'Обычный код в ответах оформляй в тройные обратные кавычки с названием языка.': 'Format normal code answers in triple backticks with the language name.'
});

const WDG_TEXT_RU = Object.fromEntries(Object.entries(WDG_TEXT_EN).map(([ru, en]) => [en, ru]));

function wdgApplyTextMap(core, map) {
  if (!core) return core;
  if (map[core]) return map[core];
  let out = core;
  Object.entries(map)
    .filter(([from]) => from.length > 2 && out.includes(from))
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([from, to]) => {
      out = out.split(from).join(to);
    });
  return out;
}

function wdgTranslateTextNode(node) {
  const raw = node.nodeValue;
  if (!raw || !raw.trim()) return;
  if (!node.__wdgRuText && wdgMainLang === 'en') node.__wdgRuText = raw;
  if (wdgMainLang === 'ru' && node.__wdgRuText) {
    node.nodeValue = node.__wdgRuText;
    return;
  }
  const source = node.__wdgRuText || raw;
  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  const core = source.trim();
  const translated = wdgApplyTextMap(core, WDG_TEXT_EN);
  if (translated !== core) node.nodeValue = leading + translated + trailing;
}

function wdgTranslateAttributes(root) {
  const attrs = ['title', 'placeholder', 'aria-label', 'alt'];
  root.querySelectorAll('*').forEach(el => {
    attrs.forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      const storeKey = '__wdgRuAttr_' + attr;
      if (!el[storeKey] && wdgMainLang === 'en') el[storeKey] = el.getAttribute(attr);
      if (wdgMainLang === 'ru' && el[storeKey]) {
        el.setAttribute(attr, el[storeKey]);
        return;
      }
      const source = el[storeKey] || el.getAttribute(attr);
      const translated = wdgApplyTextMap(source, WDG_TEXT_EN);
      if (translated !== source) el.setAttribute(attr, translated);
    });
  });
}

function wdgTranslateStaticText(root = document.body) {
  if (!root) return;
  const skip = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION']);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || skip.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('script,style,code,pre,textarea,.code-block,.live-code,.editor')) return NodeFilter.FILTER_REJECT;
      const core = (node.__wdgRuText || node.nodeValue || '').trim();
      return (/[А-Яа-яЁё]/.test(core) || WDG_TEXT_RU[core]) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(wdgTranslateTextNode);
  wdgTranslateAttributes(root);
}

function setMainLanguage(lang) {
  if (lang === 'ru') location.href = 'https://kernix01.github.io/WebDevGym/';
  else location.href = 'https://kernix01.github.io/WebDevGym-EN/';
}

function applyMainLanguage() {
  document.documentElement.lang = 'ru';
  document.getElementById('langRuBtn')?.classList.add('active');
  document.getElementById('langEnBtn')?.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', applyMainLanguage);
// ===== CUSTOM CSS (настройки → свой CSS на всю страницу) =====
function applyCustomCss(css) {
  const tag = document.getElementById('customCssStyleTag');
  if (tag) tag.textContent = css;
}

function saveCustomCss() {
  const val = document.getElementById('customCssInput').value;
  try {
    localStorage.setItem('custom_css', val);
    const status = document.getElementById('customCssStatus');
    if (status) {
      status.style.display = 'block';
      status.textContent = '✅ Сохранено и применяется при каждой загрузке';
      setTimeout(() => { status.style.display = 'none'; }, 2500);
    }
  } catch(e) {}
}

function clearCustomCss() {
  document.getElementById('customCssInput').value = '';
  applyCustomCss('');
  localStorage.removeItem('custom_css');
}

function restoreCustomCss() {
  try {
    const saved = localStorage.getItem('custom_css');
    if (saved) {
      const inp = document.getElementById('customCssInput');
      if (inp) inp.value = saved;
      applyCustomCss(saved);
    }
  } catch(e) {}
}
document.addEventListener('DOMContentLoaded', restoreCustomCss);


// ===== УНИВЕРСАЛЬНЫЙ DRAG для плавающих окон (чат ИИ, настройки) =====
function makeDraggable(panelEl, handleEl) {
  if (!panelEl || !handleEl) return;
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  handleEl.style.cursor = 'move';

  function onPointerDown(e) {
    // Не начинаем drag если клик был по интерактивному элементу внутри шапки (select, button, input)
    if (e.target.closest('select, button, input, textarea, a')) return;

    isDragging = true;
    const rect = panelEl.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX;
    startY = point.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    // Переключаем позиционирование на left/top, убирая right/bottom — чтобы можно было свободно двигать
    panelEl.style.left = startLeft + 'px';
    panelEl.style.top = startTop + 'px';
    panelEl.style.right = 'auto';
    panelEl.style.bottom = 'auto';

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    // Не даём утащить окно полностью за пределы экрана
    const w = panelEl.offsetWidth, h = panelEl.offsetHeight;
    newLeft = Math.max(-w + 60, Math.min(newLeft, window.innerWidth - 60));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - 40));

    panelEl.style.left = newLeft + 'px';
    panelEl.style.top = newTop + 'px';
    if (e.cancelable) e.preventDefault();
  }

  function onPointerUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchend', onPointerUp);
  }

  handleEl.addEventListener('mousedown', onPointerDown);
  handleEl.addEventListener('touchstart', onPointerDown, { passive: false });
}

document.addEventListener('DOMContentLoaded', () => {
  const aiWin = document.getElementById('aiChatWin');
  const aiHead = aiWin ? aiWin.querySelector('.ai-chat-head') : null;
  if (aiWin && aiHead) makeDraggable(aiWin, aiHead);

  const settingsPanel = document.getElementById('settingsMini');
  const settingsHandle = document.getElementById('settingsDragHandle');
  if (settingsPanel && settingsHandle) makeDraggable(settingsPanel, settingsHandle);
});



// ===== QUICK NAV, INTERVIEW AND MICRO TOOLS =====
function createQuickNav() {
  if (document.querySelector('.quick-nav')) return;
  const nav = document.createElement('nav');
  nav.className = 'quick-nav';
  nav.setAttribute('aria-label', 'Быстрое меню');
  const links = [
    ['HTML', 'html'], ['CSS', 'css'], ['JS', 'js'], ['TS', 'ts'],
    ['React', 'react'], ['Cal', 'calendar'], ['Git', 'git'], ['Node', 'node'],
    ['SQL', 'sql'], ['PG', 'playground']
  ];
  nav.innerHTML = links.map(([label, tab]) => '<a href="#" onclick="switchTabByName(\'' + tab + '\');return false;" title="' + label + '">' + label.replace('React','R') + '</a>').join('') +
    '<button type="button" onclick="window.scrollTo({top:0,behavior:\'smooth\'})" title="Наверх">↑</button>';
  document.body.appendChild(nav);
}

function startMockInterview() {
  if (window.WebDevGymTrainers?.openInterview) {
    window.WebDevGymTrainers.openInterview();
    return;
  }
  window.dispatchEvent(new CustomEvent('wdg:open-interview'));
}

function calcSpecificity(selector) {
  const clean = (selector || '').replace(/:where\([^)]*\)/g, '').replace(/"[^"]*"|'[^']*'/g, '');
  const inline = /style=/.test(clean) ? 1 : 0;
  const ids = (clean.match(/#[\w-]+/g) || []).length;
  const classes = (clean.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]*\))?/g) || []).length;
  const elements = (clean.match(/(^|[\s>+~,(])([a-zA-Z][\w-]*|\*)/g) || []).filter(x => !x.includes('*')).length +
    (clean.match(/::[\w-]+/g) || []).length;
  return [inline, ids, classes, elements];
}

function compareSpec(a, b) {
  for (let i = 0; i < 4; i++) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  }
  return 0;
}

function updateSpecificityTool() {
  const aEl = document.getElementById('specSelectorA');
  const bEl = document.getElementById('specSelectorB');
  const out = document.getElementById('specResult');
  if (!aEl || !bEl || !out) return;
  const a = calcSpecificity(aEl.value);
  const b = calcSpecificity(bEl.value);
  const cmp = compareSpec(a, b);
  const verdict = cmp === 0 ? 'Специфичность равна: победит правило, которое написано ниже.' :
    cmp > 0 ? 'Первый селектор сильнее и перебьёт второй.' : 'Второй селектор сильнее и перебьёт первый.';
  out.innerHTML = '<span class="spec-score">' + a.join(', ') + '</span> против <span class="spec-score">' + b.join(', ') + '</span><br>' + verdict;
}

function runEventLoopDemo() {
  const stack = document.getElementById('elStack');
  const micro = document.getElementById('elMicro');
  const macro = document.getElementById('elMacro');
  const log = document.getElementById('elLog');
  if (!stack || !micro || !macro || !log) return;
  [stack, micro, macro].forEach(el => el.innerHTML = '');
  log.textContent = 'Стартуем...';
  const pill = (text) => '<div class="event-pill">' + text + '</div>';
  const steps = [
    () => { stack.innerHTML = pill('console.log 1'); log.textContent = '1: синхронный код выполняется сразу.'; },
    () => { stack.innerHTML = pill('setTimeout'); macro.innerHTML = pill('timeout callback'); log.textContent = 'setTimeout уходит в очередь макрозадач.'; },
    () => { stack.innerHTML = pill('Promise.then'); micro.innerHTML = pill('promise callback'); log.textContent = 'Promise.then уходит в очередь микрозадач.'; },
    () => { stack.innerHTML = pill('console.log 2'); log.textContent = '2: синхронный код заканчивается.'; },
    () => { stack.innerHTML = micro.innerHTML; micro.innerHTML = ''; log.textContent = '3: сначала выполняется вся очередь микрозадач.'; },
    () => { stack.innerHTML = macro.innerHTML; macro.innerHTML = ''; log.textContent = '4: затем Event Loop берёт одну макрозадачу.'; },
    () => { stack.innerHTML = ''; log.textContent = 'Итоговый порядок: 1, 2, 3, 4.'; }
  ];
  steps.forEach((fn, i) => setTimeout(fn, i * 750));
}

const typingTargets = ['<main>', '</section>', 'button[type="submit"]', 'main>section*2>p', 'aria-label', 'useEffect(() => {}, [])'];
let typingStartedAt = 0;
function typingNewTarget() {
  const target = typingTargets[Math.floor(Math.random() * typingTargets.length)];
  const t = document.getElementById('typingTarget');
  const inp = document.getElementById('typingInput');
  const stats = document.getElementById('typingStats');
  if (!t || !inp || !stats) return;
  t.textContent = target;
  inp.value = '';
  typingStartedAt = Date.now();
  stats.textContent = 'Печатай строку выше как можно точнее.';
  inp.focus();
}
function typingCheck() {
  const t = document.getElementById('typingTarget');
  const inp = document.getElementById('typingInput');
  const stats = document.getElementById('typingStats');
  if (!t || !inp || !stats) return;
  if (inp.value === t.textContent) {
    const sec = Math.max(.1, (Date.now() - typingStartedAt) / 1000);
    stats.textContent = 'Готово за ' + sec.toFixed(1) + ' c. Следующая строка уже ждёт.';
    setTimeout(typingNewTarget, 700);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createQuickNav();
  updateSpecificityTool();
  typingNewTarget();
});
