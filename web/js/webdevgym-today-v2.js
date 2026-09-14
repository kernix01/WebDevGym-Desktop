(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const STORE_KEY = isEnglish ? 'wdg_today_en_v1' : 'wdg_today_ru_v1';
  const copy = isEnglish ? {
    title:'Today', subtitle:'One learning cycle. No overload.', budget:'1 hour', budgetHint:'Daily budget',
    rest:'3 rest days', restHint:'Next rest', streak:'Current streak', days:'days', focus:'Start focus',
    learn:'Learn', apply:'Apply', repeat:'Repeat', minutes:'25 min', project:'Project', tasks:'2 tasks',
    learnHint:'Understand the idea, then explain it in your own words.', continue:'Continue',
    forge:'Open Forge', queue:'Open queue', done:'Done', completed:'Completed', empty:'Choose a topic',
    forgeTitle:'Counter without negative values', todayBudget:'Today budget', of:'of', min:'min',
    cycle:'Cycle progress', cycleDay:'Day 1 of 4', nextRest:'Next rest day', inDays:'In 3 days',
    activity:'Activity for 7 days', dayProgress:'Day finished at', finish:'Finish day', finished:'Day finished',
    reflection:'Session wrap-up', understood:'What did I understand?', uncertain:'What is still unclear?',
    next:'What will I repeat next time?', save:'Save notes', saved:'Saved locally', group:'Learning'
  } : {
    title:'Сегодня', subtitle:'Один учебный цикл. Без перегруза.', budget:'1 час', budgetHint:'Бюджет на день',
    rest:'3 дня отдыха', restHint:'Следующий отдых', streak:'Текущая серия', days:'дней', focus:'Начать фокус',
    learn:'Изучить', apply:'Применить', repeat:'Повторить', minutes:'25 мин', project:'Проект', tasks:'2 задания',
    learnHint:'Пойми идею, а затем объясни её своими словами.', continue:'Продолжить',
    forge:'Открыть Forge', queue:'Открыть очередь', done:'Готово', completed:'Выполнено', empty:'Выбрать тему',
    forgeTitle:'Счётчик без отрицательных значений', todayBudget:'Бюджет на сегодня', of:'из', min:'мин',
    cycle:'Прогресс цикла', cycleDay:'День 1 из 4', nextRest:'Следующий день отдыха', inDays:'Через 3 дня',
    activity:'Активность за 7 дней', dayProgress:'День завершён на', finish:'Завершить день', finished:'День завершён',
    reflection:'Итог занятия', understood:'Что я понял?', uncertain:'Что пока неясно?',
    next:'Что повторю в следующий раз?', save:'Сохранить заметки', saved:'Сохранено локально', group:'Обучение'
  };

  let api;

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char];
    });
  }

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function dateKey(value) {
    const date = value || new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function dateText(date, options) {
    return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'ru-RU', options).format(date);
  }

  function nextRest() {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return dateText(date, { day:'numeric', month:'long', weekday:'short' });
  }

  function cleanTitle(block) {
    const title = block.querySelector('.block-title, h2, h3');
    if (!title) return copy.empty;
    const clone = title.cloneNode(true);
    clone.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions').forEach(function (node) { node.remove(); });
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function topics() {
    return Array.from(document.querySelectorAll('.section')).flatMap(function (section) {
      const sectionId = section.id.replace(/^sec-/, '');
      if (!sectionId || ['practice','playground','nexus','calendar'].includes(sectionId)) return [];
      return Array.from(section.querySelectorAll(':scope > .block')).map(function (block, index) {
        const boxes = Array.from(block.querySelectorAll('.prog-cb:not([disabled])'));
        const complete = boxes.length > 0 && boxes.every(function (box) {
          return box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1';
        });
        return { id:sectionId + '-' + index, sectionId:sectionId, block:block, title:cleanTitle(block), complete:complete };
      });
    });
  }

  function topicById(id) {
    return topics().find(function (topic) { return topic.id === id; }) || null;
  }

  function getPlan() {
    let plan = read(STORE_KEY, null);
    if (!plan || plan.date !== dateKey()) {
      const items = topics();
      const repeat = items.filter(function (item) { return item.complete; }).at(-1) || items[0];
      const learn = items.find(function (item) { return !item.complete && item.id !== repeat?.id; }) || items[0];
      plan = {
        date:dateKey(), repeatId:repeat?.id || '', learnId:learn?.id || '',
        done:{ repeat:false, learn:false, build:false },
        notes:{ understood:'', uncertain:'', next:'' }, completedAt:''
      };
      write(STORE_KEY, plan);
    }
    plan.done = Object.assign({ repeat:false, learn:false, build:false }, plan.done);
    plan.notes = Object.assign({ understood:'', uncertain:'', next:'' }, plan.notes);
    plan.completedAt = plan.completedAt || '';
    return plan;
  }

  function currentStreak() {
    const activity = read('wdg_activity_v1', {});
    let streak = 0;
    const date = new Date();
    for (let index = 0; index < 365; index += 1) {
      const key = dateKey(date);
      if (Number(activity[key] || 0) > 0) streak += 1;
      else if (index > 0 || key !== dateKey()) break;
      date.setDate(date.getDate() - 1);
    }
    return streak;
  }

  function focusMinutes() {
    const focus = read('wdg_focus_v1', { sessions:[] });
    return (focus.sessions || []).reduce(function (total, session) {
      const date = new Date(session.date);
      return !Number.isNaN(date.getTime()) && dateKey(date) === dateKey() ? total + Number(session.minutes || 0) : total;
    }, 0);
  }

  function weekMarkup() {
    const activity = read('wdg_activity_v1', {});
    const labels = isEnglish ? ['M','T','W','T','F','S','S'] : ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    const result = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const weekday = (date.getDay() + 6) % 7;
      result.push('<div><span>' + labels[weekday] + '</span><i data-level="' + Math.min(3, Number(activity[dateKey(date)] || 0)) + '"></i></div>');
    }
    return result.join('');
  }

  function repeatQueue(primary) {
    const items = topics();
    const result = primary ? [primary] : [];
    for (const item of items) {
      if (result.length >= 2) break;
      if (!result.some(function (current) { return current.id === item.id; }) && item.complete) result.push(item);
    }
    if (result.length < 2) {
      const fallback = items.find(function (item) { return !result.some(function (current) { return current.id === item.id; }); });
      if (fallback) result.push(fallback);
    }
    return result;
  }

  function doneControl(kind, done) {
    return '<label class="wdg-today-done"><input type="checkbox" data-today-done="' + kind + '" ' + (done ? 'checked' : '') + '><span>' +
      icon(done ? 'tabler:circle-check-filled' : 'tabler:circle', 17) + (done ? copy.completed : copy.done) + '</span></label>';
  }

  function learnCard(topic, done) {
    return '<article class="wdg-today-card is-learn ' + (done ? 'done' : '') + '"><header><div><span class="wdg-today-step">1</span><b>' +
      copy.learn + '</b></div><small>' + copy.minutes + '</small></header><div class="wdg-today-card-body">' +
      icon('tabler:book-2', 28) + '<h2>' + esc(topic?.title || copy.empty) + '</h2><p>' + copy.learnHint +
      '</p></div><footer><button class="wdgf-btn primary" type="button" data-today-open="learn" ' + (!topic ? 'disabled' : '') + '>' +
      copy.continue + ' ' + icon('tabler:arrow-right', 16) + '</button>' + doneControl('learn', done) + '</footer></article>';
  }

  function buildCard(done) {
    const sample = "form.addEventListener('submit', (event) => {\n  if (!input.value.trim()) {\n    event.preventDefault();\n    showError();\n  }\n});";
    return '<article class="wdg-today-card is-build ' + (done ? 'done' : '') + '"><header><div><span class="wdg-today-step">2</span><b>' +
      copy.apply + '</b></div><small>' + copy.project + '</small></header><div class="wdg-today-card-body">' +
      icon('tabler:code', 28) + '<h2>' + copy.forgeTitle + '</h2><pre><code>' + esc(sample) +
      '</code></pre></div><footer><button class="wdgf-btn" type="button" data-today-open="build">' + copy.forge + ' ' +
      icon('tabler:external-link', 16) + '</button>' + doneControl('build', done) + '</footer></article>';
  }

  function repeatCard(queue, done) {
    const rows = queue.map(function (topic, index) {
      return '<button type="button" data-today-topic="' + esc(topic.id) + '"><span><b>' + esc(topic.title) + '</b><small>' +
        (index ? (isEnglish ? 'Next in queue' : 'Следующее') : (isEnglish ? 'Due today' : 'Сегодня')) +
        '</small></span>' + icon('tabler:chevron-right', 16) + '</button>';
    }).join('');
    return '<article class="wdg-today-card is-repeat ' + (done ? 'done' : '') + '"><header><div><span class="wdg-today-step">3</span><b>' +
      copy.repeat + '</b></div><small>' + copy.tasks + '</small></header><div class="wdg-today-card-body">' +
      icon('tabler:refresh', 28) + '<div class="wdg-today-queue">' + (rows || '<p>' + copy.empty + '</p>') +
      '</div></div><footer><button class="wdgf-btn" type="button" data-today-open="repeat" ' + (!queue.length ? 'disabled' : '') + '>' +
      copy.queue + ' ' + icon('tabler:list', 16) + '</button>' + doneControl('repeat', done) + '</footer></article>';
  }

  function reflection(plan) {
    return '<details class="wdg-today-reflection"><summary>' + icon('tabler:notebook', 18) + '<span>' + copy.reflection +
      '</span><small>' + copy.saved + '</small>' + icon('tabler:chevron-down', 16) + '</summary><form data-today-notes>' +
      '<label><span>' + copy.understood + '</span><textarea name="understood" rows="3">' + esc(plan.notes.understood) + '</textarea></label>' +
      '<label><span>' + copy.uncertain + '</span><textarea name="uncertain" rows="3">' + esc(plan.notes.uncertain) + '</textarea></label>' +
      '<label><span>' + copy.next + '</span><textarea name="next" rows="3">' + esc(plan.notes.next) + '</textarea></label>' +
      '<button class="wdgf-btn primary" type="submit">' + icon('tabler:device-floppy', 16) + ' ' + copy.save + '</button></form></details>';
  }

  function openTopic(id) {
    const topic = topicById(id);
    if (!topic) return;
    api.close?.();
    window.switchTabByName?.(topic.sectionId);
    setTimeout(function () {
      topic.block.scrollIntoView({ behavior:'smooth', block:'start' });
      topic.block.classList.add('wdg-today-target');
      setTimeout(function () { topic.block.classList.remove('wdg-today-target'); }, 1600);
      window.WebDevGymLearning?.open?.(topic.block);
    }, 180);
  }

  function render() {
    const plan = getPlan();
    const learn = topicById(plan.learnId);
    const repeat = topicById(plan.repeatId);
    const queue = repeatQueue(repeat);
    const doneCount = Object.values(plan.done).filter(Boolean).length;
    const percent = Math.round(doneCount / 3 * 100);
    const minutes = focusMinutes();
    const title = copy.title + ', ' + dateText(new Date(), { day:'numeric', month:'long' });

    const body = '<div class="wdg-today-shell"><section class="wdg-today-meta">' +
      '<div>' + icon('tabler:clock-hour-4', 22) + '<span><b>' + copy.budget + '</b><small>' + copy.budgetHint + '</small></span></div>' +
      '<div>' + icon('tabler:beach', 22) + '<span><b>' + copy.rest + '</b><small>' + copy.restHint + ' ' + esc(nextRest()) + '</small></span></div>' +
      '<div>' + icon('tabler:flame', 22) + '<span><b>' + currentStreak() + ' ' + copy.days + '</b><small>' + copy.streak + '</small></span></div>' +
      '<button class="wdgf-btn" type="button" data-today-focus>' + icon('tabler:player-play', 17) + ' ' + copy.focus + '</button></section>' +
      '<div class="wdg-today-layout"><main class="wdg-today-main"><div class="wdg-today-flow">' +
      learnCard(learn, plan.done.learn) + buildCard(plan.done.build) + repeatCard(queue, plan.done.repeat) + '</div>' +
      reflection(plan) + '<footer class="wdg-today-complete"><div><span>' + icon(plan.completedAt ? 'tabler:circle-check-filled' : 'tabler:circle', 22) +
      '</span><b>' + copy.dayProgress + ' ' + percent + '%</b></div><div class="wdg-today-complete-track"><i style="width:' + percent +
      '%"></i></div><button class="wdgf-btn primary" type="button" data-today-finish ' + (doneCount < 3 || plan.completedAt ? 'disabled' : '') + '>' +
      icon('tabler:check', 17) + ' ' + (plan.completedAt ? copy.finished : copy.finish) + '</button></footer></main>' +
      '<aside class="wdg-today-inspector"><section><span>' + copy.todayBudget + '</span><div class="wdg-today-budget"><i style="--today-progress:' +
      Math.min(100, Math.round(minutes / 60 * 100)) + '%"><b>' + minutes + '</b><small>' + copy.min + '</small></i><p><b>' + minutes + ' ' +
      copy.min + '</b><span>' + copy.of + ' 60 ' + copy.min + '</span></p></div></section><section><span>' + copy.cycle +
      '</span><strong>' + copy.cycleDay + '</strong><div class="wdg-today-cycle"><i class="active"></i><i></i><i></i><i></i></div><small>25%</small></section>' +
      '<section><span>' + copy.nextRest + '</span><div class="wdg-today-rest">' + icon('tabler:beach', 30) + '<p><b>' + esc(nextRest()) +
      '</b><small>' + copy.inDays + '</small></p></div></section><section><span>' + copy.activity + '</span><div class="wdg-today-week">' +
      weekMarkup() + '</div></section></aside></div></div>';

    const page = api.pageShell('today', title, copy.subtitle, body);
    page.querySelectorAll('[data-today-open]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (button.dataset.todayOpen === 'learn') openTopic(plan.learnId);
        if (button.dataset.todayOpen === 'repeat') openTopic(plan.repeatId);
        if (button.dataset.todayOpen === 'build') api.open('forge');
      });
    });
    page.querySelectorAll('[data-today-topic]').forEach(function (button) {
      button.addEventListener('click', function () { openTopic(button.dataset.todayTopic); });
    });
    page.querySelector('[data-today-focus]')?.addEventListener('click', function () {
      document.getElementById('wdgfFocusBtn')?.click();
    });
    page.querySelectorAll('[data-today-done]').forEach(function (input) {
      input.addEventListener('change', function () {
        plan.done[input.dataset.todayDone] = input.checked;
        plan.completedAt = '';
        write(STORE_KEY, plan);
        api.logActivity?.(input.checked ? 1 : -1);
        render();
      });
    });
    page.querySelector('[data-today-finish]')?.addEventListener('click', function () {
      plan.completedAt = new Date().toISOString();
      write(STORE_KEY, plan);
      api.logActivity?.(2);
      render();
    });
    page.querySelector('[data-today-notes]')?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      plan.notes = {
        understood:String(data.get('understood') || '').trim(),
        uncertain:String(data.get('uncertain') || '').trim(),
        next:String(data.get('next') || '').trim()
      };
      write(STORE_KEY, plan);
      const panel = event.currentTarget.closest('.wdg-today-reflection');
      panel?.classList.add('saved');
      setTimeout(function () { panel?.classList.remove('saved'); }, 900);
    });
    return page;
  }

  function init() {
    api = window.WebDevGymFeatures;
    if (!api?.register) {
      setTimeout(init, 100);
      return;
    }
    api.register('today', render, { title:copy.title, icon:'tabler:sun-high', group:copy.group, cacheOnNavigation:true });
    window.WebDevGymTodayV2 = { open:function () { api.open('today'); } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 260); });
  else setTimeout(init, 260);
})();
