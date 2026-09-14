(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  const isEnglish = runtime?.isEnglish ?? (document.documentElement.lang.toLowerCase().startsWith('en') || /index-en\.html$/i.test(location.pathname));
  const L = runtime?.L || ((en, ru) => isEnglish ? en : ru);
  const KEY = 'wdg_lab_v1';
  const ACTIVE_KEY = 'wdg_lab_active_v1';
  const c = {
    title:L('Training center','Центр тренировки'),
    subtitle:L('Focused tools for understanding code, checking knowledge and working with technical briefs','Точечные тренажёры для понимания кода, проверки знаний и работы с техническими заданиями'),
    lab:L('Trainers','Тренажёры'), exam:L('Exam','Экзамен'), errors:L('Error log','История ошибок'),
    cards:L('Custom flashcards','Свои карточки'), review:L('Code review','Ревью кода'), sorter:L('What goes where','Что куда'),
    briefMode:L('Project brief','Рабочий бриф'), xray:'Code X-Ray', domcss:L('Interface / CSS Lab','Интерфейс / CSS Lab'), a11y:'Accessibility Lab', apiLab:'API Lab', local:L('Saved locally','Сохраняется локально'),
    start:L('Start','Начать'), next:L('Next','Дальше'), finish:L('Finish','Завершить'), reset:L('Reset','Сбросить'),
    add:L('Add','Добавить'), remove:L('Remove','Удалить'), open:L('Open','Открыть'), done:L('Done','Готово'),
    question:L('Question','Вопрос'), answer:L('Answer','Ответ'), score:L('Score','Счёт'), best:L('Best result','Лучший результат'),
    attempts:L('Attempts','Попыток'), correct:L('Correct','Правильно'), mistakes:L('Mistakes to review','Ошибки для разбора'),
    run:L('Run','Запустить'), preview:L('Preview','Результат'), checklist:L('Acceptance checklist','Критерии приёмки')
  };
  const toolDefs = [
    ['exam',c.exam,'tabler:certificate'],['errors',c.errors,'tabler:bug'],
    ['cards',c.cards,'tabler:cards'],['review',c.review,'tabler:list-check'],
    ['sorter',c.sorter,'tabler:arrows-sort'],['briefMode',c.briefMode,'tabler:swords'],
    ['xray',c.xray,'tabler:xray'],['domcss',c.domcss,'tabler:hierarchy-2'],['a11y',c.a11y,'tabler:accessible'],
    ['apiLab',c.apiLab,'tabler:api']
  ];
  const validTools = new Set(toolDefs.map(tool => tool[0]));
  const defaults = () => ({
    errors:[], flashcards:[], flashStats:{known:0,again:0}, reviewChecks:{},
    examHistory:[], sortBest:0, briefMode:{active:null,sessions:[]}
  });
  function readState() {
    const base = defaults();
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '{}');
      const legacyBriefKey = String.fromCharCode(107, 119, 111, 114, 107);
      return {...base,...data,flashStats:{...base.flashStats,...(data.flashStats||{})},
        briefMode:{...base.briefMode,...(data.briefMode||data[legacyBriefKey]||{})}};
    } catch (error) { return base; }
  }

  let state = readState();
  let api, page, examSession, sortSession, battleTimer;
  let activeTool = localStorage.getItem(ACTIVE_KEY) || 'exam';
  if (!validTools.has(activeTool)) activeTool = 'exam';
  let flashIndex = 0;
  let flashOpen = false;

  const icon = runtime?.icon || ((name,size=17) => '<iconify-icon icon="' + name + '" width="' + size + '" height="' + size + '"></iconify-icon>');
  const esc = runtime?.escapeHtml || (value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]));
  const uid = prefix => prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,7);
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) {} }
  function target() { return page?.querySelector('#wdglView'); }
  function log(amount=1) { if (api?.logActivity) api.logActivity(amount); }

  function labPage() {
    const tabs = toolDefs.map(tool => '<button class="wdgl-tool-tab ' + (activeTool===tool[0]?'active':'') +
      '" type="button" data-lab-tool="' + tool[0] + '">' + icon(tool[2],16) + '<span>' + esc(tool[1]) + '</span></button>').join('');
    page = api.pageShell('lab',c.title,c.subtitle,'<div class="wdgl-shell"><nav class="wdgl-toolbar" aria-label="' +
      esc(c.title) + '">' + tabs + '</nav><main class="wdgl-view" id="wdglView"></main></div>');
    page.querySelectorAll('[data-lab-tool]').forEach(button => button.addEventListener('click',() => {
      activeTool = button.dataset.labTool;
      localStorage.setItem(ACTIVE_KEY,activeTool);
      page.querySelectorAll('[data-lab-tool]').forEach(tab => tab.classList.toggle('active',tab===button));
      renderActive();
    }));
    renderActive();
    return page;
  }
  function renderActive() {
    clearInterval(battleTimer);
    battleTimer = null;
    window.WebDevGymStudioLabs?.destroy?.();
    window.WebDevGymApiLab?.destroy?.();
    const studio = id => () => window.WebDevGymStudioLabs?.render?.(id,target());
    const renderers = {exam:renderExam,errors:renderErrors,cards:renderCards,review:renderReview,sorter:renderSorter,briefMode:renderBrief,xray:studio('xray'),domcss:studio('domcss'),a11y:studio('a11y'),apiLab:() => window.WebDevGymApiLab?.render?.(target(),{activity:log})};
    (renderers[activeTool] || renderExam)();
  }
  function switchTool(id) {
    if (!validTools.has(id)) id = 'exam';
    activeTool = id;
    localStorage.setItem(ACTIVE_KEY,id);
    page.querySelectorAll('[data-lab-tool]').forEach(tab => tab.classList.toggle('active',tab.dataset.labTool===id));
    renderActive();
  }

  const examQuestions = [
    [L('What does querySelector(".btn") return?','Что вернёт querySelector(".btn")?'),
      L(['All matching buttons','The first matching element','A text string','A new element'],['Все подходящие кнопки','Первый подходящий элемент','Текстовую строку','Новый элемент']),1,
      L('It returns the first matching element or null.','Он возвращает первый подходящий элемент или null.')],
    [L('Why use trim() before checking a form field?','Зачем вызывать trim() перед проверкой поля?'),
      L(['Convert text to a number','Remove spaces at both ends','Clear the input','Make text uppercase'],['Превратить текст в число','Убрать пробелы по краям','Очистить input','Сделать текст заглавным']),1,
      L('A value made only of spaces should count as empty.','Строка только из пробелов тоже должна считаться пустой.')],
    [L('What does === check?','Что проверяет ===?'),
      L(['Value only','Type only','Value and type','Variable existence'],['Только значение','Только тип','Значение и тип','Существование переменной']),2,
      L('Strict equality compares both value and type.','Строгое равенство сравнивает и значение, и тип.')],
    [L('Where should colors and spacing normally live?','Где обычно должны находиться цвет и отступы?'),
      ['HTML','CSS','JavaScript','localStorage'],1,L('CSS owns presentation.','CSS отвечает за внешний вид.')],
    [L('What does preventDefault() do on form submit?','Что делает preventDefault() при submit формы?'),
      L(['Deletes the form','Stops the browser default action','Disables all events','Validates fields'],['Удаляет форму','Отменяет стандартное действие браузера','Отключает все события','Проверяет поля']),1,
      L('It prevents the default navigation or reload.','Он отменяет стандартный переход или перезагрузку.')],
    [L('Which method adds a CSS class?','Какой метод добавляет CSS-класс?'),
      ['classList.add()','classList.has()','style.class()','appendClass()'],0,L('classList.add adds one or more classes.','classList.add добавляет один или несколько классов.')],
    [L('What type does localStorage return?','Какой тип возвращает localStorage?'),
      L(['Number','Boolean','String or null','Object'],['Number','Boolean','String или null','Object']),2,
      L('Stored values are strings.','Значения хранятся строками.')],
    [L('Why store a DOM reference in const?','Почему ссылку на DOM-элемент часто хранят в const?'),
      L(['The element cannot change','The variable will not be reassigned','CSS gets faster','Events require it'],['Элемент нельзя менять','Переменную не будут переназначать','CSS станет быстрее','Иначе события не работают']),1,
      L('The variable keeps the same reference.','Переменной не дают другую ссылку.')],
    [L('Which event reads live text input?','Какое событие читает живой ввод текста?'),['click','submit','input','load'],2,
      L('input fires while the field changes.','input срабатывает во время изменения поля.')],
    [L('What usually follows a state change?','Что обычно делают после изменения состояния?'),
      L(['Reload the page','Update the DOM','Delete every class','Create another script'],['Перезагружают страницу','Обновляют DOM','Удаляют все классы','Создают второй script']),1,
      L('The interface must be rendered from the new state.','Интерфейс нужно обновить из нового состояния.')]
  ];

  function renderExam() {
    const out = target();
    const history = state.examHistory || [];
    const best = history.length ? Math.max(...history.map(item => item.score)) : 0;
    if (!examSession) {
      out.innerHTML = '<section class="wdgl-panel"><div class="wdgl-panel-body wdgl-question"><div class="wdgl-kicker">' +
        icon('tabler:certificate',16) + c.exam + '</div><h2 class="wdgl-title">HTML, CSS, JavaScript</h2><p class="wdgl-muted">' +
        L('Ten questions, no hints and no answers until the end.','Десять вопросов без подсказок и показа ответов до конца.') +
        '</p><div class="wdgl-stat-row" style="margin:20px 0"><div class="wdgl-stat"><span>' + c.best + '</span><strong>' +
        best + '/10</strong></div><div class="wdgl-stat"><span>' + c.attempts + '</span><strong>' + history.length +
        '</strong></div><div class="wdgl-stat"><span>' + c.question + '</span><strong>10</strong></div></div>' +
        '<button class="wdgl-btn primary" type="button" data-exam-start>' + icon('tabler:player-play',15) + ' ' + c.start + '</button></div></section>';
      out.querySelector('[data-exam-start]').addEventListener('click',() => {
        examSession = {index:0,answers:Array(examQuestions.length).fill(null),finished:false};
        renderExam();
      });
      return;
    }
    if (examSession.finished) {
      const score = examSession.answers.reduce((sum,answer,index) => sum + (answer===examQuestions[index][2] ? 1 : 0),0);
      const wrong = examQuestions.filter((item,index) => examSession.answers[index]!==item[2]);
      const message = score>=8 ? L('Strong result. Move on.','Сильный результат. Можно двигаться дальше.') :
        score>=5 ? L('Good base. Review the misses.','База хорошая. Разбери ошибки.') :
        L('The result shows exactly what to repeat.','Результат точно показывает, что повторить.');
      out.innerHTML = '<section class="wdgl-panel"><div class="wdgl-score"><span class="wdgl-chip ' +
        (score>=8?'green':score>=5?'amber':'purple') + '">' + c.correct + '</span><strong>' + score +
        '/10</strong><p class="wdgl-muted">' + message + '</p><button class="wdgl-btn primary" type="button" data-exam-restart style="margin-top:18px">' +
        L('Try again','Попробовать ещё раз') + '</button></div></section>' +
        (wrong.length ? '<section class="wdgl-panel" style="margin-top:12px"><div class="wdgl-panel-head"><h2>' + c.mistakes +
        '</h2><span class="wdgl-chip">' + wrong.length + '</span></div><div class="wdgl-panel-body wdgl-list">' +
        wrong.map(item => '<article class="wdgl-item"><h3>' + esc(item[0]) + '</h3><p>' + esc(item[3]) + '</p></article>').join('') +
        '</div></section>' : '');
      out.querySelector('[data-exam-restart]').addEventListener('click',() => { examSession=null; renderExam(); });
      return;
    }
    const index = examSession.index;
    const item = examQuestions[index];
    const selected = examSession.answers[index];
    out.innerHTML = '<section class="wdgl-panel"><div class="wdgl-panel-body wdgl-question"><div class="wdgl-question-head"><span class="wdgl-chip purple">' +
      c.question + ' ' + (index+1) + ' / ' + examQuestions.length + '</span><span class="wdgl-muted">' +
      L('Answered','Отвечено') + ': ' + examSession.answers.filter(answer => answer!==null).length + '</span></div>' +
      '<div class="wdgl-progress" style="--progress:' + ((index+1)/examQuestions.length*100) + '%"><span></span></div><h2>' +
      esc(item[0]) + '</h2><div class="wdgl-options">' + item[1].map((option,optionIndex) =>
        '<button class="wdgl-option ' + (selected===optionIndex?'selected':'') + '" type="button" data-exam-option="' +
        optionIndex + '">' + esc(option) + '</button>').join('') + '</div><div class="wdgl-actions" style="justify-content:flex-end;margin-top:16px">' +
      '<button class="wdgl-btn primary" type="button" data-exam-next ' + (selected===null?'disabled':'') + '>' +
      (index===examQuestions.length-1?c.finish:c.next) + ' ' + icon('tabler:arrow-right',15) + '</button></div></div></section>';
    out.querySelectorAll('[data-exam-option]').forEach(button => button.addEventListener('click',() => {
      examSession.answers[index]=Number(button.dataset.examOption);
      renderExam();
    }));
    out.querySelector('[data-exam-next]').addEventListener('click',() => {
      if (index===examQuestions.length-1) {
        examSession.finished=true;
        const score=examSession.answers.reduce((sum,answer,i)=>sum+(answer===examQuestions[i][2]?1:0),0);
        state.examHistory=[{score,date:new Date().toISOString()},...(state.examHistory||[])].slice(0,20);
        save(); log(3);
      } else examSession.index++;
      renderExam();
    });
  }

  function renderErrors() {
    const out=target();
    const errors=[...(state.errors||[])].sort((a,b)=>b.createdAt-a.createdAt);
    out.innerHTML='<div class="wdgl-grid wide-left"><section class="wdgl-panel"><div class="wdgl-panel-head"><h2>' +
      L('Record an error','Записать ошибку') + '</h2><span class="wdgl-chip purple">' + c.local +
      '</span></div><div class="wdgl-panel-body"><p class="wdgl-muted" style="margin-bottom:14px">' +
      L('Write the cause and fix in your own words. A bug then becomes reusable experience.','Записывай причину и решение своими словами. Так ошибка превращается в опыт.') +
      '</p><form class="wdgl-form" data-error-form><div class="wdgl-field"><label>' + L('What broke?','Что сломалось?') +
      '</label><input class="wdgl-input" name="title" maxlength="120" required></div><div class="wdgl-field"><label>' +
      L('Area','Раздел') + '</label><select class="wdgl-select" name="area"><option>HTML</option><option>CSS</option><option>JavaScript</option><option>React</option><option>Git</option><option>Other</option></select></div>' +
      '<div class="wdgl-field"><label>' + L('Why did it happen?','Почему это произошло?') +
      '</label><textarea class="wdgl-textarea" name="cause" maxlength="600" required></textarea></div><div class="wdgl-field"><label>' +
      L('How did you fix it?','Как ты это исправил?') +
      '</label><textarea class="wdgl-textarea" name="fix" maxlength="600" required></textarea></div><button class="wdgl-btn primary" type="submit">' +
      icon('tabler:plus',15) + ' ' + c.add + '</button></form></div></section><section class="wdgl-panel"><div class="wdgl-panel-head"><h2>' +
      c.errors + '</h2><span class="wdgl-chip">' + errors.length + '</span></div><div class="wdgl-panel-body">' +
      (errors.length?'<div class="wdgl-list">'+errors.map(item=>'<article class="wdgl-item wdgl-error-card '+(item.resolved?'resolved':'')+
        '"><div class="wdgl-error-meta"><span class="wdgl-chip cyan">'+esc(item.area)+'</span><span class="wdgl-chip '+(item.resolved?'green':'amber')+'">'+
        (item.resolved?L('Resolved','Исправлено'):L('Open','Не закрыто'))+'</span></div><h3>'+esc(item.title)+'</h3><p><b>'+
        L('Cause','Причина')+'</b><br>'+esc(item.cause)+'</p><p style="margin-top:8px"><b>'+L('Fix','Решение')+'</b><br>'+
        esc(item.fix)+'</p><footer><button class="wdgl-btn" type="button" data-error-toggle="'+esc(item.id)+'">'+
        (item.resolved?L('Reopen','Вернуть'):L('Resolve','Исправлено'))+'</button><button class="wdgl-btn danger" type="button" data-error-remove="'+
        esc(item.id)+'">'+c.remove+'</button></footer></article>').join('')+'</div>':
        '<div class="wdgl-empty">'+L('No errors recorded yet. The first real bug belongs here.','История пока пустая. Первая настоящая ошибка должна попасть сюда.')+'</div>')+
      '</div></section></div>';
    out.querySelector('[data-error-form]').addEventListener('submit',event=>{
      event.preventDefault();
      const data=new FormData(event.currentTarget);
      state.errors=[{id:uid('error'),title:String(data.get('title')).trim(),area:String(data.get('area')),
        cause:String(data.get('cause')).trim(),fix:String(data.get('fix')).trim(),resolved:false,createdAt:Date.now()},...(state.errors||[])].slice(0,100);
      save(); log(); renderErrors();
    });
    out.querySelectorAll('[data-error-toggle]').forEach(button=>button.addEventListener('click',()=>{
      const item=state.errors.find(error=>error.id===button.dataset.errorToggle);
      if(item)item.resolved=!item.resolved;
      save(); renderErrors();
    }));
    out.querySelectorAll('[data-error-remove]').forEach(button=>button.addEventListener('click',()=>{
      state.errors=state.errors.filter(error=>error.id!==button.dataset.errorRemove);
      save(); renderErrors();
    }));
  }

  const baseCards=[
    [L('What is the difference between = and ===?','Чем отличаются = и ===?'),L('= assigns. === strictly compares value and type.','= присваивает. === строго сравнивает значение и тип.')],
    [L('What does querySelector return?','Что возвращает querySelector?'),L('The first matching Element or null.','Первый подходящий Element или null.')],
    [L('Why preventDefault on submit?','Зачем preventDefault при submit?'),L('It stops the browser default submit action.','Он отменяет стандартную отправку браузером.')],
    [L('What is event.target?','Что такое event.target?'),L('The element where the event started.','Элемент, на котором началось событие.')],
    [L('What does classList.toggle do?','Что делает classList.toggle?'),L('Adds a missing class or removes an existing one.','Добавляет отсутствующий класс или удаляет существующий.')],
    [L('When should localStorage be updated?','Когда обновлять localStorage?'),L('After state changes.','После изменения состояния.')],
    [L('What belongs in HTML?','Что относится к HTML?'),L('Meaning and structure.','Смысл и структура.')],
    [L('What belongs in CSS?','Что относится к CSS?'),L('Layout, spacing, colors and responsive appearance.','Расположение, отступы, цвета и адаптивный вид.')],
    [L('What belongs in JavaScript?','Что относится к JavaScript?'),L('Behavior, events, state and data.','Поведение, события, состояние и данные.')],
    [L('Why use textContent for user text?','Почему для текста пользователя лучше textContent?'),L('It does not interpret text as HTML.','Он не превращает текст в HTML.')]
  ];
  const allCards=()=>baseCards.map((item,index)=>({id:'base-'+index,front:item[0],back:item[1],base:true})).concat(state.flashcards||[]);
  function renderCards() {
    const out=target(),cards=allCards();
    flashIndex=Math.max(0,flashIndex%cards.length);
    const card=cards[flashIndex];
    out.innerHTML='<div class="wdgl-grid wide-left"><section class="wdgl-panel"><div class="wdgl-panel-head"><h2>'+c.cards+
      '</h2><span class="wdgl-chip">'+(flashIndex+1)+' / '+cards.length+'</span></div><div class="wdgl-panel-body"><button class="wdgl-flashcard" type="button" data-flash-flip><div><small>'+
      (flashOpen?c.answer:c.question).toUpperCase()+'</small><h2>'+esc(flashOpen?card.back:card.front)+'</h2><p class="wdgl-muted" style="margin-top:18px">'+
      L('Click to flip','Нажми, чтобы перевернуть')+'</p></div></button><div class="wdgl-actions" style="justify-content:center;margin-top:12px">'+
      '<button class="wdgl-btn" type="button" data-flash-again '+(!flashOpen?'disabled':'')+'>'+L('Repeat','Повторить')+'</button>'+
      '<button class="wdgl-btn good" type="button" data-flash-known '+(!flashOpen?'disabled':'')+'>'+L('I know it','Знаю')+'</button>'+
      (!card.base?'<button class="wdgl-btn danger" type="button" data-flash-remove>'+c.remove+'</button>':'')+'</div></div></section>'+
      '<aside class="wdgl-panel"><div class="wdgl-panel-head"><h2>'+L('Add your card','Добавить свою карточку')+'</h2><span class="wdgl-chip purple">'+c.local+
      '</span></div><div class="wdgl-panel-body"><div class="wdgl-stat-row" style="grid-template-columns:repeat(2,1fr);margin-bottom:16px"><div class="wdgl-stat"><span>'+
      L('Known','Знаю')+'</span><strong>'+state.flashStats.known+'</strong></div><div class="wdgl-stat"><span>'+L('Repeat','Повторить')+'</span><strong>'+
      state.flashStats.again+'</strong></div></div><form class="wdgl-form" data-flash-form><div class="wdgl-field"><label>'+c.question+
      '</label><textarea class="wdgl-textarea" name="front" required></textarea></div><div class="wdgl-field"><label>'+c.answer+
      '</label><textarea class="wdgl-textarea" name="back" required></textarea></div><button class="wdgl-btn primary" type="submit">'+c.add+'</button></form></div></aside></div>';
    out.querySelector('[data-flash-flip]').addEventListener('click',()=>{flashOpen=!flashOpen;renderCards();});
    out.querySelector('[data-flash-known]').addEventListener('click',()=>{state.flashStats.known++;flashIndex=(flashIndex+1)%cards.length;flashOpen=false;save();log();renderCards();});
    out.querySelector('[data-flash-again]').addEventListener('click',()=>{state.flashStats.again++;flashIndex=(flashIndex+1)%cards.length;flashOpen=false;save();renderCards();});
    out.querySelector('[data-flash-form]').addEventListener('submit',event=>{
      event.preventDefault();const data=new FormData(event.currentTarget);
      state.flashcards=[...(state.flashcards||[]),{id:uid('card'),front:String(data.get('front')).trim(),back:String(data.get('back')).trim()}].slice(-100);
      save();flashIndex=allCards().length-1;flashOpen=false;renderCards();
    });
    out.querySelector('[data-flash-remove]')?.addEventListener('click',()=>{state.flashcards=state.flashcards.filter(item=>item.id!==card.id);flashIndex=0;flashOpen=false;save();renderCards();});
  }

  const reviewGroups=[
    ['HTML',L(['One h1 per page','Buttons have a type','Images have useful alt','Inputs have labels'],['На странице один h1','У кнопок указан type','У картинок полезный alt','У полей есть label'])],
    ['CSS',L(['No random margins for layout','Checked at 360px','Focus is visible','Long text fits'],['Нет случайных margin для макета','Проверено на 360px','Фокус виден','Длинный текст помещается'])],
    ['JavaScript',L(['No console errors','Empty values handled','null from selectors handled','Repeated logic is a function'],['В консоли нет ошибок','Пустые значения обработаны','Учтён null от селекторов','Повторы вынесены в функцию'])],
    [L('Delivery','Сдача'),L(['Main flow tested','Keyboard tested','Clear file names','All requirements covered'],['Главный сценарий проверен','Клавиатура проверена','Имена файлов понятны','Все требования закрыты'])]
  ];
  const reviewId=(group,index)=>group.toLowerCase().replace(/\s+/g,'-')+'-'+index;
  function renderReview() {
    const out=target(),total=reviewGroups.reduce((sum,group)=>sum+group[1].length,0);
    const checked=reviewGroups.reduce((sum,group)=>sum+group[1].filter((_,i)=>state.reviewChecks[reviewId(group[0],i)]).length,0);
    out.innerHTML='<section class="wdgl-panel"><div class="wdgl-panel-head"><div><h2>'+L('Pre-delivery checklist','Проверка перед сдачей')+
      '</h2><p class="wdgl-muted">'+L('Use this before publishing or sending work to a client.','Пройди список перед публикацией или отправкой работы заказчику.')+
      '</p></div><span class="wdgl-chip purple">'+checked+' / '+total+'</span></div><div class="wdgl-panel-body"><div class="wdgl-progress" style="--progress:'+
      (checked/total*100)+'%;margin-bottom:14px"><span></span></div><div class="wdgl-review-groups">'+reviewGroups.map(group=>
        '<section class="wdgl-panel"><div class="wdgl-panel-head"><h3>'+esc(group[0])+'</h3></div><div class="wdgl-panel-body wdgl-checks">'+
        group[1].map((text,index)=>{const id=reviewId(group[0],index);return'<label class="wdgl-check"><input type="checkbox" data-review="'+id+'" '+
          (state.reviewChecks[id]?'checked':'')+'><span>'+esc(text)+'</span></label>';}).join('')+'</div></section>').join('')+
      '</div><button class="wdgl-btn danger" type="button" data-review-clear style="margin-top:12px">'+L('Clear checklist','Очистить список')+'</button></div></section>';
    out.querySelectorAll('[data-review]').forEach(box=>box.addEventListener('change',()=>{state.reviewChecks[box.dataset.review]=box.checked;save();renderReview();}));
    out.querySelector('[data-review-clear]').addEventListener('click',()=>{state.reviewChecks={};save();renderReview();});
  }

  const sortItems=[
    [L('A page heading','Заголовок страницы'),'html',L('A heading is document structure.','Заголовок относится к структуре документа.')],
    [L('Button color on hover','Цвет кнопки при hover'),'css',L('Hover appearance is presentation.','Внешний вид hover — это оформление.')],
    [L('Open a modal after click','Открыть модалку после клика'),'js',L('An event changes interface state.','Событие меняет состояние интерфейса.')],
    [L('Email input','Поле электронной почты'),'html',L('A form control is structure.','Элемент формы — это структура.')],
    [L('Two-column layout','Макет в две колонки'),'css',L('Grid and Flexbox control layout.','Grid и Flexbox управляют расположением.')],
    [L('Calculate total price','Посчитать итоговую цену'),'js',L('Calculation is behavior.','Вычисление — это поведение.')],
    [L('Navigation link','Ссылка навигации'),'html',L('A link is semantic content.','Ссылка — семантический контент.')],
    [L('Hide menu at 600px','Скрыть меню при 600px'),'css',L('Responsive visibility belongs in a media query.','Адаптивная видимость задаётся в media query.')],
    [L('Save selected theme','Сохранить выбранную тему'),'js',L('Storage and state are JavaScript work.','Хранилище и состояние — работа JavaScript.')],
    [L('Error message container','Контейнер ошибки'),'html',L('The message location is structure.','Место под сообщение — структура.')],
    [L('Make error text red','Сделать ошибку красной'),'css',L('Color is presentation.','Цвет — оформление.')],
    [L('Insert error after submit','Вставить ошибку после submit'),'js',L('Content changes because of an event.','Контент меняется из-за события.')]
  ];
  function renderSorter() {
    const out=target();
    if(!sortSession)sortSession={index:0,score:0,answered:false,choice:''};
    if(sortSession.index>=sortItems.length){
      state.sortBest=Math.max(state.sortBest||0,sortSession.score);save();
      out.innerHTML='<section class="wdgl-panel"><div class="wdgl-score"><span class="wdgl-chip purple">'+c.score+'</span><strong>'+
        sortSession.score+'/'+sortItems.length+'</strong><p class="wdgl-muted">'+L('Separate structure, presentation and behavior automatically.','Научись автоматически разделять структуру, оформление и поведение.')+
        '</p><button class="wdgl-btn primary" type="button" data-sort-restart style="margin-top:18px">'+L('New round','Новый раунд')+'</button></div></section>';
      out.querySelector('[data-sort-restart]').addEventListener('click',()=>{sortSession={index:0,score:0,answered:false,choice:''};renderSorter();});
      return;
    }
    const item=sortItems[sortSession.index];
    out.innerHTML='<section class="wdgl-panel"><div class="wdgl-panel-body wdgl-sorter"><div class="wdgl-question-head"><span class="wdgl-chip purple">'+
      L('Which layer owns this?','Какой слой отвечает за это?')+'</span><span class="wdgl-chip">'+(sortSession.index+1)+' / '+sortItems.length+' · '+c.score+': '+sortSession.score+
      '</span></div><div class="wdgl-sort-card"><code>'+esc(item[0])+'</code></div><div class="wdgl-sort-actions">'+['html','css','js'].map(layer=>{
        let cls='wdgl-btn '+layer;if(sortSession.answered&&layer===item[1])cls+=' good';if(sortSession.answered&&layer===sortSession.choice&&layer!==item[1])cls+=' danger';
        return'<button class="'+cls+'" type="button" data-sort="'+layer+'" '+(sortSession.answered?'disabled':'')+'>'+layer.toUpperCase()+'</button>';
      }).join('')+'</div>'+(sortSession.answered?'<div class="wdgl-item" style="margin-top:10px"><h3>'+L('Explanation','Объяснение')+'</h3><p>'+esc(item[2])+
      '</p><footer><span class="wdgl-chip '+(sortSession.choice===item[1]?'green':'amber')+'">'+(sortSession.choice===item[1]?c.correct:item[1].toUpperCase())+
      '</span><button class="wdgl-btn primary" type="button" data-sort-next>'+c.next+'</button></footer></div>':'')+'</div></section>';
    out.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{
      sortSession.choice=button.dataset.sort;sortSession.answered=true;if(sortSession.choice===item[1])sortSession.score++;renderSorter();
    }));
    out.querySelector('[data-sort-next]')?.addEventListener('click',()=>{sortSession.index++;sortSession.answered=false;sortSession.choice='';renderSorter();});
  }

  const briefs=[
    ['burger',L('Responsive burger menu','Адаптивное бургер-меню'),L('Open by button, close by overlay and Escape, lock page scroll.','Открытие кнопкой, закрытие фоном и Escape, блокировка скролла.'),L('Interface + CSS','Интерфейс + CSS'),20,
      L(['Works at 360px','Escape closes it','Focus is visible','No console errors'],['Работает на 360px','Escape закрывает','Фокус виден','В консоли нет ошибок'])],
    ['form',L('Lead form validation','Проверка формы заявки'),L('Validate name and phone and show inline messages.','Проверь имя и телефон, покажи ошибки рядом.'),L('Forms + JS','Формы + JS'),25,
      L(['Empty fields rejected','Errors are visible','Valid submit succeeds','No reload'],['Пустые поля не проходят','Ошибки видны','Валидная отправка успешна','Нет перезагрузки'])],
    ['modal',L('Product modal','Модалка товара'),L('Accessible product modal with image, title and action.','Доступное окно товара с картинкой, заголовком и действием.'),L('Interface + A11y','Интерфейс + доступность'),25,
      L(['Three close methods','Focus visible','Fits mobile','Scroll locked'],['Три способа закрытия','Фокус виден','Помещается на телефоне','Скролл заблокирован'])],
    ['filter',L('Card filter','Фильтр карточек'),L('Filter services by category and live search.','Фильтруй услуги по категории и поиску.'),L('Arrays + interface','Массивы + интерфейс'),30,
      L(['Live search','Category works','Empty state','Filters combine'],['Живой поиск','Категория работает','Есть пустое состояние','Фильтры совмещаются'])],
    ['calculator',L('Service calculator','Калькулятор услуги'),L('Calculate quantity, options and urgency.','Считай количество, опции и срочность.'),L('State + Forms','Состояние + Формы'),35,
      L(['Inputs validated','Correct total','Currency formatted','Reset works'],['Поля проверяются','Сумма верная','Валюта оформлена','Сброс работает'])]
  ];
  const elapsed=start=>{const sec=Math.max(0,Math.floor((Date.now()-Number(start||Date.now()))/1000));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');};
  function renderBrief() {
    const out=target(),active=state.briefMode.active,selected=active?.briefId||state.briefMode.selected||briefs[0][0];
    const brief=briefs.find(item=>item[0]===selected)||briefs[0],checks=active?.checks||{},all=active?brief[5].every((_,i)=>checks[i]):false;
    out.innerHTML='<div class="wdgl-grid wide-left"><aside class="wdgl-panel"><div class="wdgl-panel-head"><h2>'+L('Technical brief simulator','Симулятор технического задания')+
      '</h2><span class="wdgl-chip purple">'+briefs.length+'</span></div><div class="wdgl-panel-body wdgl-battle-list">'+briefs.map(item=>
        '<article class="wdgl-brief '+(selected===item[0]?'active':'')+'" data-brief="'+item[0]+'"><span class="wdgl-chip cyan">'+esc(item[3])+'</span><h3>'+esc(item[1])+
        '</h3><p>'+esc(item[2])+'</p></article>').join('')+'</div></aside><section class="wdgl-panel"><div class="wdgl-panel-head"><div><h2>'+esc(brief[1])+
      '</h2><p class="wdgl-muted">'+L('Start the timer and close every acceptance point.','Запусти таймер и закрой каждый пункт приёмки.')+
      '</p></div><div class="wdgl-timer" id="wdglBattleTimer">'+(active?elapsed(active.startAt):String(brief[4]).padStart(2,'0')+':00')+
      '</div></div><div class="wdgl-panel-body"><p class="wdgl-muted">'+esc(brief[2])+'</p><div class="wdgl-error-meta" style="margin-top:12px"><span class="wdgl-chip purple">'+
      esc(brief[3])+'</span><span class="wdgl-chip amber">'+brief[4]+' '+L('min','мин')+'</span></div><h3 style="font-size:13px;margin:18px 0 10px">'+c.checklist+
      '</h3><div class="wdgl-checks">'+brief[5].map((text,index)=>'<label class="wdgl-check"><input type="checkbox" data-battle-check="'+index+'" '+(checks[index]?'checked':'')+
        ' '+(!active?'disabled':'')+'><span>'+esc(text)+'</span></label>').join('')+'</div><div class="wdgl-actions" style="margin-top:14px">'+
      (!active?'<button class="wdgl-btn primary" type="button" data-battle-start>'+icon('tabler:player-play',15)+' '+L('Start task','Начать задачу')+'</button>':
        '<button class="wdgl-btn good" type="button" data-battle-finish '+(!all?'disabled':'')+'>'+L('Deliver task','Сдать работу')+
        '</button><button class="wdgl-btn danger" type="button" data-battle-stop>'+L('Cancel','Отменить')+'</button>')+
      '</div></div></section><section class="wdgl-panel full"><div class="wdgl-panel-head"><h2>'+L('Completed sessions','Завершённые сессии')+
      '</h2><span class="wdgl-chip">'+(state.briefMode.sessions||[]).length+'</span></div><div class="wdgl-panel-body">'+battleHistory()+'</div></section></div>';
    if(!active){
      out.querySelectorAll('[data-brief]').forEach(card=>card.addEventListener('click',()=>{state.briefMode.selected=card.dataset.brief;save();renderBrief();}));
      out.querySelector('[data-battle-start]').addEventListener('click',()=>{state.briefMode.active={briefId:brief[0],startAt:Date.now(),checks:{}};save();renderBrief();});
    }else{
      out.querySelectorAll('[data-battle-check]').forEach(box=>box.addEventListener('change',()=>{state.briefMode.active.checks[box.dataset.battleCheck]=box.checked;save();renderBrief();}));
      out.querySelector('[data-battle-stop]').addEventListener('click',()=>{state.briefMode.active=null;save();renderBrief();});
      out.querySelector('[data-battle-finish]').addEventListener('click',()=>{
        const minutes=Math.max(1,Math.round((Date.now()-state.briefMode.active.startAt)/60000));
        state.briefMode.sessions=[{title:brief[1],minutes,date:new Date().toISOString()},...(state.briefMode.sessions||[])].slice(0,30);
        state.briefMode.active=null;save();log(3);renderBrief();
      });
      battleTimer=setInterval(()=>{const timer=page.querySelector('#wdglBattleTimer');if(timer&&state.briefMode.active)timer.textContent=elapsed(state.briefMode.active.startAt);},1000);
    }
  }
  function battleHistory() {
    const sessions=state.briefMode.sessions||[];
    if(!sessions.length)return'<div class="wdgl-empty">'+L('No completed sessions yet.','Завершённых сессий пока нет.')+'</div>';
    return'<table class="wdgl-history"><thead><tr><th>'+L('Task','Задача')+'</th><th>'+L('Time','Время')+'</th><th>'+L('Date','Дата')+
      '</th></tr></thead><tbody>'+sessions.map(item=>'<tr><td>'+esc(item.title)+'</td><td>'+item.minutes+' '+L('min','мин')+'</td><td>'+
      new Date(item.date).toLocaleDateString(isEnglish?'en-US':'ru-RU')+'</td></tr>').join('')+'</tbody></table>';
  }

  function addNavigation() {
    const nav=document.querySelector('.wdg-side-nav');
    if(!nav||document.getElementById('wdglNavBtn'))return;
    const button=document.createElement('button');
    button.className='wdg-nav-btn';button.id='wdglNavBtn';button.type='button';button.dataset.wdgFeature='lab';
    button.innerHTML=icon('tabler:flask-2',19)+'<span>'+c.lab+'</span>';button.title=c.lab;button.setAttribute('aria-label',c.lab);
    button.addEventListener('click',()=>api.open('lab'));
    const learn=nav.querySelector('[data-wdg-nav="learn"]');
    if(learn)learn.after(button);else nav.prepend(button);
  }
  function init() {
    api=window.WebDevGymFeatures;
    if(!api||typeof api.register!=='function'){setTimeout(init,50);return;}
    api.register('lab',labPage,{title:c.lab,icon:'tabler:flask-2',group:L('Training','Тренировка')});
    addNavigation();
    window.WebDevGymLab = {
      open(tool='exam') {
        activeTool = validTools.has(tool) ? tool : 'exam';
        localStorage.setItem(ACTIVE_KEY,activeTool);
        api.open('lab');
      },
      current:() => activeTool
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,100));
  else setTimeout(init,100);
})();
