(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const STORE_KEY = isEnglish ? 'wdg_today_en_v1' : 'wdg_today_ru_v1';
  const copy = isEnglish ? {
    title:'Today', subtitle:'A short route for one focused learning session', nav:'Today',
    repeat:'Repeat', repeatText:'Refresh one topic that is due or was difficult before.',
    learn:'Learn', learnText:'Take the next unfinished topic and explain it in your own words.',
    build:'Build', buildText:'Finish one Forge criterion without opening a complete solution.',
    open:'Open', done:'Done', completed:'Completed', empty:'No unfinished topic was found. Pick any section and deepen it.',
    reflection:'Session wrap-up', understood:'What did I understand?', uncertain:'What is still unclear?', next:'What will I repeat next time?',
    save:'Save notes', saved:'Saved locally', progress:'Session progress', forge:'Open Forge', fallback:'Choose a topic'
  } : {
    title:'Сегодня', subtitle:'Короткий маршрут на одно сосредоточенное занятие', nav:'Сегодня',
    repeat:'Повторить', repeatText:'Освежи одну тему, которая уже была сложной или подошла к повторению.',
    learn:'Изучить', learnText:'Возьми следующую незавершённую тему и объясни её своими словами.',
    build:'Собрать', buildText:'Закрой один критерий Forge, не открывая готовое решение.',
    open:'Открыть', done:'Готово', completed:'Выполнено', empty:'Незавершённая тема не найдена. Выбери любой раздел и углуби его.',
    reflection:'Итог занятия', understood:'Что я понял?', uncertain:'Что пока неясно?', next:'Что повторю в следующий раз?',
    save:'Сохранить заметки', saved:'Сохранено локально', progress:'Прогресс занятия', forge:'Открыть Forge', fallback:'Выбрать тему'
  };

  let api = null;

  function icon(name, size) {
    return '<iconify-icon icon="' + name + '" width="' + (size || 18) + '" height="' + (size || 18) + '"></iconify-icon>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (error) { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function localDateKey() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function cleanTitle(block) {
    const title = block.querySelector('.block-title, h2, h3');
    if (!title) return copy.fallback;
    const clone = title.cloneNode(true);
    clone.querySelectorAll('button,.badge,.anchor-icon,.wdgf-deep-actions').forEach(node => node.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function topicItems() {
    return Array.from(document.querySelectorAll('.section')).flatMap(section => {
      const sectionId = section.id.replace(/^sec-/, '');
      if (!sectionId || ['practice','playground','nexus','calendar'].includes(sectionId)) return [];
      return Array.from(section.querySelectorAll(':scope > .block')).map((block, index) => {
        const boxes = Array.from(block.querySelectorAll('.prog-cb:not([disabled])'));
        const complete = boxes.length > 0 && boxes.every(box => box.checked || localStorage.getItem('prog_' + box.dataset.pid) === '1');
        return { id:sectionId + '-' + index, sectionId, block, title:cleanTitle(block), complete };
      });
    });
  }

  function topicById(id) {
    return topicItems().find(item => item.id === id) || null;
  }

  function chooseRepeat(items) {
    const growthTopic = window.WebDevGymGrowth?.chooseRepeat?.();
    if (growthTopic) return items.find(item => item.id === growthTopic.id) || growthTopic;
    const review = readJson('wdg_review_v1', {});
    const due = Object.entries(review)
      .filter(([, value]) => Number(value?.due || 0) <= Date.now())
      .sort((a, b) => Number(a[1]?.due || 0) - Number(b[1]?.due || 0));
    for (const [id] of due) {
      const item = items.find(topic => topic.id === id);
      if (item) return item;
    }
    const weak = Object.values(readJson('wdg_weak_v1', {})).sort((a, b) => Number(b?.updatedAt || b?.lastSeen || 0) - Number(a?.updatedAt || a?.lastSeen || 0));
    for (const point of weak) {
      const item = items.find(topic => topic.id === point?.id || (point?.section && topic.sectionId === point.section && topic.title === point.title));
      if (item) return item;
    }
    return items.filter(item => item.complete).at(-1) || items[0] || null;
  }

  function chooseLearn(items) {
    const growthTopic = window.WebDevGymGrowth?.chooseLearn?.();
    if (growthTopic) return items.find(item => item.id === growthTopic.id) || growthTopic;
    return items.find(item => !item.complete) || items[0] || null;
  }

  function createPlan() {
    const items = topicItems();
    const repeat = chooseRepeat(items);
    const learn = chooseLearn(items.filter(item => item.id !== repeat?.id)) || chooseLearn(items);
    return {
      date:localDateKey(),
      repeatId:repeat?.id || '',
      learnId:learn?.id || '',
      done:{ repeat:false, learn:false, build:false },
      notes:{ understood:'', uncertain:'', next:'' }
    };
  }

  function getPlan() {
    const stored = readJson(STORE_KEY, null);
    if (!stored || stored.date !== localDateKey()) {
      const plan = createPlan();
      writeJson(STORE_KEY, plan);
      return plan;
    }
    stored.done = Object.assign({ repeat:false, learn:false, build:false }, stored.done);
    stored.notes = Object.assign({ understood:'', uncertain:'', next:'' }, stored.notes);
    return stored;
  }

  function openTopic(id) {
    const topic = topicById(id);
    if (!topic) return;
    api.close?.();
    window.switchTabByName?.(topic.sectionId);
    setTimeout(() => {
      topic.block.scrollIntoView({ behavior:'smooth', block:'start' });
      topic.block.classList.add('wdg-today-target');
      setTimeout(() => topic.block.classList.remove('wdg-today-target'), 1600);
      window.WebDevGymLearning?.open?.(topic.block);
    }, 180);
  }

  function taskCard(kind, iconName, title, description, topic, done) {
    const action = kind === 'build' ? copy.forge : copy.open;
    const topicTitle = kind === 'build' ? (isEnglish ? 'One active Forge project' : 'Один активный проект Forge') : (topic?.title || copy.empty);
    return '<article class="wdg-today-task ' + (done ? 'done' : '') + '" data-today-task="' + kind + '">' +
      '<div class="wdg-today-task-icon">' + icon(iconName, 20) + '</div><div class="wdg-today-task-copy"><span>' + title + '</span><h2>' + escapeHtml(topicTitle) + '</h2><p>' + description + '</p></div>' +
      '<div class="wdg-today-task-actions"><button class="wdgf-btn" type="button" data-today-open="' + kind + '" ' + (!topic && kind !== 'build' ? 'disabled' : '') + '>' + icon('tabler:arrow-up-right', 16) + ' ' + action + '</button>' +
      '<label><input type="checkbox" data-today-done="' + kind + '" ' + (done ? 'checked' : '') + '><span>' + (done ? copy.completed : copy.done) + '</span></label></div></article>';
  }

  function renderToday() {
    const plan = getPlan();
    const repeat = topicById(plan.repeatId);
    const learn = topicById(plan.learnId);
    const doneCount = Object.values(plan.done).filter(Boolean).length;
    const body = '<div class="wdg-today-shell"><section class="wdg-today-progress"><div><span>' + copy.progress + '</span><strong>' + doneCount + ' / 3</strong></div><div><i style="width:' + Math.round(doneCount / 3 * 100) + '%"></i></div></section>' +
      '<div class="wdg-today-list">' +
        taskCard('repeat', 'tabler:repeat', copy.repeat, copy.repeatText, repeat, plan.done.repeat) +
        taskCard('learn', 'tabler:book-2', copy.learn, copy.learnText, learn, plan.done.learn) +
        taskCard('build', 'tabler:hammer', copy.build, copy.buildText, { title:copy.forge }, plan.done.build) +
      '</div><section class="wdg-today-reflection"><header><div>' + icon('tabler:notebook', 19) + '<h2>' + copy.reflection + '</h2></div><span>' + copy.saved + '</span></header><form data-today-notes>' +
        '<label><span>' + copy.understood + '</span><textarea name="understood" rows="3">' + escapeHtml(plan.notes.understood) + '</textarea></label>' +
        '<label><span>' + copy.uncertain + '</span><textarea name="uncertain" rows="3">' + escapeHtml(plan.notes.uncertain) + '</textarea></label>' +
        '<label><span>' + copy.next + '</span><textarea name="next" rows="3">' + escapeHtml(plan.notes.next) + '</textarea></label>' +
        '<button class="wdgf-btn primary" type="submit">' + icon('tabler:device-floppy', 16) + ' ' + copy.save + '</button></form></section></div>';
    const page = api.pageShell('today', copy.title, copy.subtitle, body);

    page.querySelectorAll('[data-today-open]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.todayOpen === 'repeat') openTopic(plan.repeatId);
      if (button.dataset.todayOpen === 'learn') openTopic(plan.learnId);
      if (button.dataset.todayOpen === 'build') api.open('forge');
    }));
    page.querySelectorAll('[data-today-done]').forEach(input => input.addEventListener('change', () => {
      plan.done[input.dataset.todayDone] = input.checked;
      writeJson(STORE_KEY, plan);
      api.logActivity?.(input.checked ? 1 : -1);
      renderToday();
    }));
    page.querySelector('[data-today-notes]').addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      plan.notes = { understood:String(data.get('understood') || '').trim(), uncertain:String(data.get('uncertain') || '').trim(), next:String(data.get('next') || '').trim() };
      writeJson(STORE_KEY, plan);
      event.currentTarget.closest('.wdg-today-reflection').classList.add('saved');
      setTimeout(() => event.currentTarget.closest('.wdg-today-reflection')?.classList.remove('saved'), 900);
    });
    return page;
  }

  function buildNavigation() {
    const nav = document.querySelector('.wdg-side-nav');
    if (!nav || document.getElementById('wdgTodayBtn')) return;
    const button = document.createElement('button');
    button.className = 'wdg-nav-btn';
    button.id = 'wdgTodayBtn';
    button.type = 'button';
    button.dataset.wdgFeature = 'today';
    button.innerHTML = icon('tabler:sun-high', 19) + '<span>' + copy.nav + '</span>';
    button.addEventListener('click', () => api.open('today'));
    const dashboard = document.getElementById('wdgfDashboardBtn');
    if (dashboard?.nextSibling) nav.insertBefore(button, dashboard.nextSibling);
    else nav.prepend(button);
  }

  function init() {
    api = window.WebDevGymFeatures;
    if (!api?.register) {
      setTimeout(init, 80);
      return;
    }
    api.register('today', renderToday, { title:copy.title, icon:'tabler:sun-high', group:isEnglish ? 'Learning' : 'Обучение' });
    buildNavigation();
    window.WebDevGymToday = { open:() => api.open('today'), refresh:createPlan };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 120));
  else setTimeout(init, 120);
})();
