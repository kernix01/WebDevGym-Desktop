(function () {
  'use strict';

  const isEnglish = document.documentElement.lang === 'en' || /index-en\.html$/i.test(location.pathname);
  const locale = isEnglish ? 'en-US' : 'ru-RU';
  const text = isEnglish ? {
    eyebrow: 'CALENDAR / LEARNING ROUTE', route: 'Monthly route', subtitle: 'One clear path through the month',
    previous: 'Previous month', next: 'Next month', today: 'Today', view: 'View', all: 'Full route',
    studyOnly: 'Study only', reviewOnly: 'Reviews only', plan: 'Schedule', studyDays: 'study days',
    reviews: 'reviews', hours: 'hours planned', streak: 'day streak', week: 'Week', rest: 'Rest',
    empty: 'Free slot', study: 'Study', review: 'Review', project: 'Project', practice: 'Practice', theory: 'Theory',
    dayType: 'Day type', planned: 'Planned time', tasks: 'Tasks for the day', addTask: 'Add task', note: 'Note',
    notePlaceholder: 'What should you remember for this day?', editDay: 'Edit day', finishDay: 'Complete day',
    reopenDay: 'Reopen day', nextDay: 'Next study day', workload: 'Monthly workload', noTasks: 'No tasks yet',
    editTask: 'Edit task', newTask: 'Schedule a task', title: 'Title', date: 'Date', type: 'Type',
    description: 'Description', minutes: 'Minutes', cancel: 'Cancel', save: 'Save task', remove: 'Delete',
    close: 'Close', done: 'Completed', min: 'min', noNext: 'Route completed', routeLabel: 'Route view'
  } : {
    eyebrow: 'КАЛЕНДАРЬ / МАРШРУТ ОБУЧЕНИЯ', route: 'Маршрут месяца', subtitle: 'Один понятный путь на весь месяц',
    previous: 'Предыдущий месяц', next: 'Следующий месяц', today: 'Сегодня', view: 'Вид', all: 'Весь маршрут',
    studyOnly: 'Только учёба', reviewOnly: 'Повторения', plan: 'Запланировать', studyDays: 'учебных дней',
    reviews: 'повторений', hours: 'часов в плане', streak: 'серия дней', week: 'Неделя', rest: 'Отдых',
    empty: 'Свободно', study: 'Учёба', review: 'Повторение', project: 'Проект', practice: 'Практика', theory: 'Теория',
    dayType: 'Тип дня', planned: 'Плановое время', tasks: 'Задачи на день', addTask: 'Добавить задачу', note: 'Заметка',
    notePlaceholder: 'Что важно запомнить на этот день?', editDay: 'Изменить день', finishDay: 'Завершить день',
    reopenDay: 'Вернуть день', nextDay: 'Следующий учебный день', workload: 'Нагрузка за месяц', noTasks: 'Задач пока нет',
    editTask: 'Изменить задачу', newTask: 'Запланировать задачу', title: 'Название', date: 'Дата', type: 'Тип',
    description: 'Описание', minutes: 'Минуты', cancel: 'Отмена', save: 'Сохранить', remove: 'Удалить',
    close: 'Закрыть', done: 'Готово', min: 'мин', noNext: 'Маршрут завершён', routeLabel: 'Вид маршрута'
  };

  const typeLabels = {
    theory: text.theory,
    practice: text.practice,
    project: text.project,
    repeat: text.review,
    career: isEnglish ? 'Career' : 'Карьера',
    rest: text.rest
  };
  const dayNotesKey = isEnglish ? 'webdevgym_calendar_day_notes_en_v1' : 'webdevgym_calendar_day_notes_v1';
  let viewCursor = null;
  let routeMode = 'all';
  let mounted = false;
  let originalGetSnapshot = null;
  let originalApplySnapshot = null;

  function icon(name, size = 18) {
    return `<iconify-icon icon="tabler:${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;
  }

  function escapeHtml(value) {
    if (typeof wdgCalEscape === 'function') return wdgCalEscape(value);
    const node = document.createElement('div');
    node.textContent = String(value || '');
    return node.innerHTML;
  }

  function toISO(date) {
    if (typeof wdgCalToISO === 'function') return wdgCalToISO(date);
    const copy = new Date(date);
    copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
    return copy.toISOString().slice(0, 10);
  }

  function fromISO(value) {
    return typeof wdgCalFromISO === 'function' ? wdgCalFromISO(value) : new Date(`${value}T00:00:00`);
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function tasksFor(date) {
    if (typeof wdgCalTasksForDate === 'function') return wdgCalTasksForDate(date);
    return (wdgCalState.tasks || []).filter(task => task.date === date);
  }

  function loadDayNotes() {
    try { return JSON.parse(localStorage.getItem(dayNotesKey) || '{}') || {}; } catch { return {}; }
  }

  function saveDayNote(date, value) {
    const notes = loadDayNotes();
    if (value.trim()) notes[date] = value;
    else delete notes[date];
    try { localStorage.setItem(dayNotesKey, JSON.stringify(notes)); } catch {}
  }

  function taskMinutes(task) {
    if (!task || task.type === 'rest') return 0;
    const explicit = Number(task.minutes);
    if (Number.isFinite(explicit) && explicit >= 0) return explicit;
    const match = String(task.description || '').match(/(\d+)\s*(?:мин|min)/i);
    if (match) return Number(match[1]);
    return 60;
  }

  function dayKind(tasks) {
    if (!tasks.length) return 'empty';
    if (tasks.every(task => task.type === 'rest')) return 'rest';
    if (tasks.some(task => task.type === 'repeat')) return 'repeat';
    if (tasks.some(task => task.type === 'project' || task.type === 'career')) return 'project';
    return 'study';
  }

  function kindLabel(kind) {
    return ({ rest: text.rest, repeat: text.review, project: text.project, study: text.study, empty: text.empty })[kind] || text.study;
  }

  function monthStart() {
    const base = viewCursor || fromISO(wdgCalSelectedDate);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }

  function monthMatrix() {
    const first = monthStart();
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    const gridStart = addDays(first, -((first.getDay() + 6) % 7));
    const gridEnd = addDays(last, 6 - ((last.getDay() + 6) % 7));
    const weeks = [];
    for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 7)) {
      weeks.push(Array.from({ length: 7 }, (_, index) => addDays(cursor, index)));
    }
    return weeks;
  }

  function currentMonthTasks() {
    const first = monthStart();
    const prefix = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`;
    return (wdgCalState.tasks || []).filter(task => task.date.startsWith(prefix));
  }

  function streakCount() {
    const doneDates = new Set((wdgCalState.tasks || []).filter(task => task.done && task.type !== 'rest').map(task => task.date));
    let cursor = fromISO(typeof wdgCalTodayISO === 'function' ? wdgCalTodayISO() : toISO(new Date()));
    let streak = 0;
    while (doneDates.has(toISO(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function renderMetric(iconName, value, label) {
    return `<div class="wdgc-metric">${icon(iconName, 22)}<strong>${value}</strong><span>${label}</span></div>`;
  }

  function isCardDimmed(kind) {
    if (routeMode === 'study') return kind === 'rest' || kind === 'empty';
    if (routeMode === 'review') return kind !== 'repeat';
    return false;
  }

  function renderDayCard(date, activeMonth) {
    const iso = toISO(date);
    const tasks = tasksFor(iso);
    const kind = dayKind(tasks);
    const task = tasks[0];
    const selected = iso === wdgCalSelectedDate;
    const done = tasks.length > 0 && tasks.every(item => item.done);
    const minutes = tasks.reduce((sum, item) => sum + taskMinutes(item), 0);
    const title = task ? task.title : text.empty;
    const classes = ['wdgc-day', `is-${kind}`, selected ? 'is-selected' : '', done ? 'is-done' : '', !activeMonth ? 'is-outside' : '', isCardDimmed(kind) ? 'is-dimmed' : ''].filter(Boolean).join(' ');
    return `<button class="${classes}" type="button" data-calendar-date="${iso}" aria-pressed="${selected}">
      <span class="wdgc-day-date">${date.getDate()} ${date.toLocaleDateString(locale, { month: 'short' }).replace('.', '')}</span>
      <span class="wdgc-day-title">${escapeHtml(title)}</span>
      <span class="wdgc-day-meta">${minutes ? `${minutes} ${text.min}` : kindLabel(kind)}</span>
      <span class="wdgc-day-state">${done ? icon('circle-check-filled', 16) : kind === 'repeat' ? icon('refresh', 16) : '<i></i>'}</span>
    </button>`;
  }

  function renderWeeks() {
    const first = monthStart();
    return monthMatrix().map((week, index) => {
      const activeDays = week.filter(day => day.getMonth() === first.getMonth());
      const range = activeDays.length
        ? `${activeDays[0].getDate()}–${activeDays[activeDays.length - 1].getDate()} ${activeDays[0].toLocaleDateString(locale, { month: 'short' }).replace('.', '')}`
        : '';
      return `<section class="wdgc-week">
        <div class="wdgc-week-label"><strong>${text.week} ${index + 1}</strong><span>${range}</span></div>
        <div class="wdgc-week-track">${week.map(day => renderDayCard(day, day.getMonth() === first.getMonth())).join('')}</div>
      </section>`;
    }).join('');
  }

  function renderWorkload() {
    const first = monthStart();
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, index) => {
      const iso = toISO(new Date(first.getFullYear(), first.getMonth(), index + 1));
      const tasks = tasksFor(iso);
      const kind = dayKind(tasks);
      const minutes = tasks.reduce((sum, task) => sum + taskMinutes(task), 0);
      const height = kind === 'rest' || kind === 'empty' ? 12 : Math.max(22, Math.min(52, Math.round(minutes * .7)));
      return `<button type="button" data-calendar-date="${iso}" class="wdgc-load-day is-${kind}" title="${index + 1}: ${escapeHtml(tasks[0]?.title || kindLabel(kind))}">
        <span style="height:${height}px"></span><small>${index + 1}</small>
      </button>`;
    }).join('');
  }

  function selectedDayHtml() {
    const date = fromISO(wdgCalSelectedDate);
    const tasks = tasksFor(wdgCalSelectedDate);
    const kind = dayKind(tasks);
    const minutes = tasks.reduce((sum, task) => sum + taskMinutes(task), 0);
    const allDone = tasks.length > 0 && tasks.every(task => task.done);
    const notes = loadDayNotes();
    const nextTask = [...(wdgCalState.tasks || [])]
      .filter(task => task.date > wdgCalSelectedDate && task.type !== 'rest' && !task.done)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const taskRows = tasks.length ? tasks.map(task => `<article class="wdgc-task ${task.done ? 'is-done' : ''}">
      <button class="wdgc-drag" type="button" aria-label="${text.editTask}" data-calendar-edit="${escapeHtml(task.id)}">${icon('grip-vertical', 16)}</button>
      <label><input type="checkbox" data-calendar-toggle="${escapeHtml(task.id)}" ${task.done ? 'checked' : ''}><span>${escapeHtml(task.title)}</span></label>
      <button type="button" data-calendar-edit="${escapeHtml(task.id)}" title="${text.editTask}">${icon('dots', 18)}</button>
    </article>`).join('') : `<p class="wdgc-empty-state">${text.noTasks}</p>`;

    return `<aside class="wdgc-inspector" aria-label="${text.tasks}">
      <header class="wdgc-inspector-head">
        <div><span>${date.toLocaleDateString(locale, { weekday: 'long' })}</span><h2>${date.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}</h2></div>
        <button type="button" class="wdgc-icon-btn" data-calendar-close-inspector aria-label="${text.close}">${icon('x', 20)}</button>
      </header>
      <div class="wdgc-day-facts">
        <p>${icon('book-2', 20)}<span>${text.dayType}</span><strong>${kindLabel(kind)}</strong></p>
        <p>${icon('clock', 20)}<span>${text.planned}</span><strong>${minutes} ${text.min}</strong></p>
      </div>
      <div class="wdgc-inspector-section">
        <h3>${text.tasks}</h3>
        <div class="wdgc-task-list">${taskRows}</div>
        <button class="wdgc-secondary-btn" type="button" data-calendar-add>${icon('plus', 17)} ${text.addTask}</button>
      </div>
      <div class="wdgc-inspector-section">
        <label class="wdgc-note-label" for="wdgcDayNote">${text.note}</label>
        <textarea id="wdgcDayNote" data-calendar-note placeholder="${text.notePlaceholder}">${escapeHtml(notes[wdgCalSelectedDate] || '')}</textarea>
      </div>
      <div class="wdgc-day-actions">
        <button type="button" class="wdgc-secondary-btn" data-calendar-edit-day>${icon('pencil', 17)} ${text.editDay}</button>
        <button type="button" class="wdgc-primary-btn" data-calendar-complete-day ${tasks.length ? '' : 'disabled'}>${icon('circle-check', 18)} ${allDone ? text.reopenDay : text.finishDay}</button>
      </div>
      <div class="wdgc-next-day">
        <span>${text.nextDay}</span>
        ${nextTask ? `<button type="button" data-calendar-date="${nextTask.date}"><span><b>${fromISO(nextTask.date).toLocaleDateString(locale, { day:'numeric', month:'long' })}</b>${escapeHtml(nextTask.title)}</span>${icon('chevron-right', 18)}</button>` : `<p>${text.noNext}</p>`}
      </div>
    </aside>`;
  }

  function renderDialog() {
    return `<dialog class="wdgc-dialog" id="wdgcTaskDialog">
      <form method="dialog" class="wdgc-dialog-card" id="wdgcTaskForm">
        <header><div><span>${text.eyebrow}</span><h2 id="wdgcDialogTitle">${text.newTask}</h2></div><button type="button" data-calendar-dialog-close aria-label="${text.close}" class="wdgc-icon-btn">${icon('x', 20)}</button></header>
        <input type="hidden" name="taskId">
        <label>${text.title}<input name="title" required maxlength="120"></label>
        <div class="wdgc-form-row"><label>${text.date}<input name="date" type="date" required></label><label>${text.type}<select name="type"><option value="theory">${text.theory}</option><option value="practice">${text.practice}</option><option value="project">${text.project}</option><option value="repeat">${text.review}</option><option value="career">${typeLabels.career}</option><option value="rest">${text.rest}</option></select></label></div>
        <label>${text.description}<textarea name="description" rows="4"></textarea></label>
        <label>${text.minutes}<input name="minutes" type="number" min="0" max="480" step="5" value="60"></label>
        <footer><button type="button" class="wdgc-danger-btn" data-calendar-delete hidden>${icon('trash', 17)} ${text.remove}</button><span></span><button type="button" data-calendar-dialog-close class="wdgc-secondary-btn">${text.cancel}</button><button type="submit" value="default" class="wdgc-primary-btn">${icon('device-floppy', 17)} ${text.save}</button></footer>
      </form>
    </dialog>`;
  }

  function mount() {
    const section = document.getElementById('sec-calendar');
    if (!section) return false;
    if (!section.querySelector('.wdgc-shell')) {
      section.innerHTML = `<div class="wdgc-shell"><main class="wdgc-main" id="wdgcMain"></main><div id="wdgcInspectorHost"></div></div>${renderDialog()}`;
      bindEvents(section);
    }
    mounted = true;
    return true;
  }

  function render() {
    if (!mount()) return;
    if (!viewCursor) viewCursor = fromISO(wdgCalSelectedDate);
    const first = monthStart();
    const monthTasks = currentMonthTasks();
    const studyTasks = monthTasks.filter(task => task.type !== 'rest');
    const reviews = monthTasks.filter(task => task.type === 'repeat').length;
    const hours = Math.round(studyTasks.reduce((sum, task) => sum + taskMinutes(task), 0) / 60);
    const monthName = first.toLocaleDateString(locale, { month: 'long' });
    const routeTitle = isEnglish ? `${monthName} route` : `Маршрут ${monthName}`;
    const main = document.getElementById('wdgcMain');
    const inspector = document.getElementById('wdgcInspectorHost');
    if (!main || !inspector) return;
    main.innerHTML = `<header class="wdgc-page-head"><div><span>${text.eyebrow}</span><h1>${routeTitle}</h1><p>${new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()} ${isEnglish ? 'days' : 'день'} — ${text.subtitle.toLowerCase()}</p></div>
      <div class="wdgc-toolbar"><button class="wdgc-icon-btn" type="button" data-calendar-month="-1" title="${text.previous}">${icon('chevron-left', 20)}</button><button class="wdgc-icon-btn" type="button" data-calendar-month="1" title="${text.next}">${icon('chevron-right', 20)}</button><button class="wdgc-secondary-btn" type="button" data-calendar-today>${text.today}</button><label class="wdgc-view-select"><span class="sr-only">${text.routeLabel}</span><select data-calendar-view><option value="all" ${routeMode === 'all' ? 'selected' : ''}>${text.view}: ${text.all}</option><option value="study" ${routeMode === 'study' ? 'selected' : ''}>${text.studyOnly}</option><option value="review" ${routeMode === 'review' ? 'selected' : ''}>${text.reviewOnly}</option></select>${icon('chevron-down', 15)}</label><button class="wdgc-icon-btn" type="button" data-calendar-toggle-inspector title="${text.tasks}">${icon('layout-sidebar-right', 20)}</button><button class="wdgc-primary-btn" type="button" data-calendar-add>${icon('plus', 18)} ${text.plan}</button></div></header>
      <section class="wdgc-metrics" aria-label="${text.route}">${renderMetric('book-2', studyTasks.length, text.studyDays)}${renderMetric('refresh', reviews, text.reviews)}${renderMetric('clock', hours, text.hours)}${renderMetric('flame', streakCount(), text.streak)}</section>
      <div class="wdgc-route" aria-label="${text.route}">${renderWeeks()}</div>
      <section class="wdgc-workload"><div class="wdgc-workload-title"><strong>${text.workload}</strong><span>${first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</span></div><div class="wdgc-load-chart">${renderWorkload()}</div><div class="wdgc-legend"><span class="study">${text.study}</span><span class="repeat">${text.review}</span><span class="rest">${text.rest}</span></div></section>`;
    inspector.innerHTML = selectedDayHtml();
  }

  function showTaskDialog(task) {
    const dialog = document.getElementById('wdgcTaskDialog');
    const form = document.getElementById('wdgcTaskForm');
    if (!dialog || !form) return;
    form.reset();
    form.elements.taskId.value = task?.id || '';
    form.elements.title.value = task?.title || '';
    form.elements.date.value = task?.date || wdgCalSelectedDate;
    form.elements.type.value = task?.type || 'practice';
    form.elements.description.value = task?.description || '';
    form.elements.minutes.value = task ? taskMinutes(task) : 60;
    document.getElementById('wdgcDialogTitle').textContent = task ? text.editTask : text.newTask;
    form.querySelector('[data-calendar-delete]').hidden = !task;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    setTimeout(() => form.elements.title.focus(), 30);
  }

  function saveTask(form) {
    const data = new FormData(form);
    const id = String(data.get('taskId') || '');
    const task = id ? wdgCalState.tasks.find(item => item.id === id) : null;
    const next = task || { id: `wdg-cal-custom-${Date.now()}`, done: false };
    next.title = String(data.get('title') || '').trim();
    next.date = String(data.get('date') || wdgCalSelectedDate);
    next.type = String(data.get('type') || 'practice');
    next.description = String(data.get('description') || '').trim();
    next.minutes = Math.max(0, Number(data.get('minutes')) || 0);
    if (!task) wdgCalState.tasks.push(next);
    wdgCalSelectedDate = next.date;
    viewCursor = fromISO(next.date);
    wdgCalMonthCursor = fromISO(next.date);
    wdgCalSaveState();
    document.getElementById('wdgcTaskDialog')?.close();
    render();
  }

  function deleteCurrentTask() {
    const form = document.getElementById('wdgcTaskForm');
    const id = form?.elements.taskId.value;
    if (!id) return;
    wdgCalState.tasks = wdgCalState.tasks.filter(task => task.id !== id);
    wdgCalSaveState();
    document.getElementById('wdgcTaskDialog')?.close();
    render();
  }

  function bindEvents(section) {
    section.addEventListener('click', event => {
      const dateButton = event.target.closest('[data-calendar-date]');
      if (dateButton) {
        wdgCalSelectedDate = dateButton.dataset.calendarDate;
        wdgCalMonthCursor = fromISO(wdgCalSelectedDate);
        render();
        return;
      }
      const monthButton = event.target.closest('[data-calendar-month]');
      if (monthButton) {
        const next = new Date(monthStart().getFullYear(), monthStart().getMonth() + Number(monthButton.dataset.calendarMonth), 1);
        const start = fromISO(WDG_CAL_START);
        const end = fromISO(WDG_CAL_END);
        viewCursor = next < new Date(start.getFullYear(), start.getMonth(), 1) ? start : next > new Date(end.getFullYear(), end.getMonth(), 1) ? end : next;
        render();
        return;
      }
      if (event.target.closest('[data-calendar-today]')) {
        const today = typeof wdgCalTodayISO === 'function' ? wdgCalTodayISO() : toISO(new Date());
        wdgCalSelectedDate = typeof wdgCalClampDate === 'function' ? wdgCalClampDate(today) : today;
        viewCursor = fromISO(wdgCalSelectedDate);
        render();
        return;
      }
      if (event.target.closest('[data-calendar-add]')) { showTaskDialog(null); return; }
      if (event.target.closest('[data-calendar-dialog-close]')) {
        document.getElementById('wdgcTaskDialog')?.close();
        return;
      }
      const edit = event.target.closest('[data-calendar-edit]');
      if (edit) { showTaskDialog(wdgCalState.tasks.find(task => task.id === edit.dataset.calendarEdit)); return; }
      if (event.target.closest('[data-calendar-edit-day]')) { showTaskDialog(tasksFor(wdgCalSelectedDate)[0] || null); return; }
      if (event.target.closest('[data-calendar-complete-day]')) {
        const tasks = tasksFor(wdgCalSelectedDate);
        const done = tasks.some(task => !task.done);
        tasks.forEach(task => { task.done = done; });
        wdgCalSaveState();
        render();
        return;
      }
      if (event.target.closest('[data-calendar-close-inspector]')) {
        document.querySelector('.wdgc-shell')?.classList.toggle('is-inspector-hidden');
        return;
      }
      if (event.target.closest('[data-calendar-toggle-inspector]')) {
        document.querySelector('.wdgc-shell')?.classList.toggle('is-inspector-hidden');
        return;
      }
      if (event.target.closest('[data-calendar-delete]')) deleteCurrentTask();
    });
    section.addEventListener('change', event => {
      if (event.target.matches('[data-calendar-view]')) { routeMode = event.target.value; render(); return; }
      if (event.target.matches('[data-calendar-toggle]')) {
        const task = wdgCalState.tasks.find(item => item.id === event.target.dataset.calendarToggle);
        if (task) task.done = event.target.checked;
        wdgCalSaveState();
        render();
      }
    });
    section.addEventListener('input', event => {
      if (event.target.matches('[data-calendar-note]')) saveDayNote(wdgCalSelectedDate, event.target.value);
    });
    section.addEventListener('submit', event => {
      if (event.target.id === 'wdgcTaskForm') {
        event.preventDefault();
        saveTask(event.target);
      }
    });
  }

  function installSnapshotBridge() {
    if (typeof wdgCalGetSnapshot === 'function' && !originalGetSnapshot) {
      originalGetSnapshot = wdgCalGetSnapshot;
      window.wdgCalGetSnapshot = function () {
        return { ...originalGetSnapshot(), dayNotes: loadDayNotes() };
      };
    }
    if (typeof wdgCalApplySnapshot === 'function' && !originalApplySnapshot) {
      originalApplySnapshot = wdgCalApplySnapshot;
      window.wdgCalApplySnapshot = function (snapshot) {
        if (snapshot?.dayNotes && typeof snapshot.dayNotes === 'object') {
          try { localStorage.setItem(dayNotesKey, JSON.stringify(snapshot.dayNotes)); } catch {}
        }
        originalApplySnapshot(snapshot);
        viewCursor = fromISO(wdgCalSelectedDate);
        render();
      };
    }
  }

  window.wdgCalendarV5Render = render;
  window.wdgCalendarV5OpenTask = showTaskDialog;
  window.wdgCalRender = render;

  document.addEventListener('DOMContentLoaded', () => {
    installSnapshotBridge();
    mount();
    render();
  });
})();
