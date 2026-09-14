(function () {
  'use strict';

  const STORAGE_KEY = 'wdg:mastery:v1';
  const MODE_KEY = 'wdg:mastery:independent';
  const LEARNING_SECTIONS = new Set([
    'html', 'css', 'js', 'ts', 'react', 'electron', 'vite', 'node', 'git',
    'sql', 'pg', 'linux', 'devops', 'python', 'csharp', 'algo', 'figma'
  ]);

  const SOURCES = {
    html: [
      ['MDN HTML', 'https://developer.mozilla.org/docs/Web/HTML'],
      ['HTML Standard', 'https://html.spec.whatwg.org/']
    ],
    css: [
      ['MDN CSS', 'https://developer.mozilla.org/docs/Web/CSS'],
      ['CSS specifications', 'https://www.w3.org/Style/CSS/specs.en.html']
    ],
    js: [
      ['MDN JavaScript', 'https://developer.mozilla.org/docs/Web/JavaScript'],
      ['ECMAScript', 'https://tc39.es/ecma262/']
    ],
    ts: [
      ['TypeScript Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'],
      ['TSConfig Reference', 'https://www.typescriptlang.org/tsconfig/']
    ],
    react: [
      ['React Learn', 'https://react.dev/learn'],
      ['React API', 'https://react.dev/reference/react']
    ],
    electron: [
      ['Electron documentation', 'https://www.electronjs.org/docs/latest/'],
      ['Electron security', 'https://www.electronjs.org/docs/latest/tutorial/security']
    ],
    vite: [
      ['Vite Guide', 'https://vite.dev/guide/'],
      ['Vite Config', 'https://vite.dev/config/']
    ],
    node: [
      ['Node.js Learn', 'https://nodejs.org/en/learn'],
      ['Node.js API', 'https://nodejs.org/api/']
    ],
    git: [
      ['Git Reference', 'https://git-scm.com/docs'],
      ['Pro Git', 'https://git-scm.com/book/en/v2']
    ],
    sql: [
      ['PostgreSQL SQL tutorial', 'https://www.postgresql.org/docs/current/tutorial-sql.html'],
      ['SQL commands', 'https://www.postgresql.org/docs/current/sql-commands.html']
    ],
    pg: [
      ['PostgreSQL Manual', 'https://www.postgresql.org/docs/current/'],
      ['PostgreSQL indexes', 'https://www.postgresql.org/docs/current/indexes.html']
    ],
    linux: [
      ['Linux kernel docs', 'https://docs.kernel.org/'],
      ['GNU manuals', 'https://www.gnu.org/manual/manual.html']
    ],
    devops: [
      ['Docker docs', 'https://docs.docker.com/'],
      ['MDN HTTP', 'https://developer.mozilla.org/docs/Web/HTTP']
    ],
    python: [
      ['Python tutorial', 'https://docs.python.org/3/tutorial/'],
      ['Python standard library', 'https://docs.python.org/3/library/']
    ],
    csharp: [
      ['C# guide', 'https://learn.microsoft.com/en-us/dotnet/csharp/'],
      ['ASP.NET Core fundamentals', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/']
    ],
    algo: [
      ['MDN data structures', 'https://developer.mozilla.org/docs/Web/JavaScript/Guide/Indexed_collections'],
      ['ECMAScript collections', 'https://tc39.es/ecma262/#sec-keyed-collections']
    ],
    figma: [
      ['Figma Help', 'https://help.figma.com/'],
      ['Figma Dev Mode', 'https://help.figma.com/hc/en-us/categories/360002051613-Dev-Mode']
    ]
  };

  const locale = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const copy = locale === 'en' ? {
    mode: 'Independent mode', modeOn: 'Independent mode on', modeHint: 'Hide explanations when you want to test yourself',
    checkpoint: 'Prove the skill', proven: 'Skill proven', progress: 'Mastery',
    title: 'Skill checkpoint', intro: 'Do not repeat the lesson. Show that you can explain, test and apply it.',
    explain: 'Explain the main rule in your own words', explainHint: 'At least 30 meaningful characters. Write what the rule does and when you need it.',
    changed: 'I changed the example and predicted the result before running it',
    built: 'I completed a small variation without opening hints',
    sources: 'Official sources', checked: 'Links reviewed on 13 Sep 2026',
    saved: 'Saved locally', close: 'Close', reset: 'Reset checkpoint', incomplete: 'Complete all three checks',
    score: n => `${n}/3 confirmed`
  } : {
    mode: 'Самостоятельно', modeOn: 'Самостоятельный режим включён', modeHint: 'Скрывай объяснения, когда хочешь проверить себя',
    checkpoint: 'Закрепить навык', proven: 'Навык подтверждён', progress: 'Закрепление',
    title: 'Проверка навыка', intro: 'Не повторяй текст урока. Покажи, что умеешь объяснить, проверить и применить тему.',
    explain: 'Объясни главное правило своими словами', explainHint: 'Минимум 30 осмысленных символов: что делает правило и когда оно нужно.',
    changed: 'Я изменил пример и предсказал результат до запуска',
    built: 'Я сделал небольшую вариацию без открытия подсказок',
    sources: 'Официальные источники', checked: 'Ссылки проверены 13.09.2026',
    saved: 'Сохранено локально', close: 'Закрыть', reset: 'Сбросить проверку', incomplete: 'Выполни все три пункта',
    score: n => `${n}/3 подтверждено`
  };

  let queued = false;
  let activeBlock = null;

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function sectionName(block) {
    return (block.closest('.section')?.id || '').replace(/^sec-/, '');
  }

  function blockKey(block) {
    if (block.id) return block.id;
    const section = block.closest('.section');
    const blocks = Array.from(section?.querySelectorAll(':scope > .block') || []);
    return `${section?.id || 'lesson'}-${Math.max(0, blocks.indexOf(block))}`;
  }

  function blockTitle(block) {
    const title = block.querySelector('.block-title')?.cloneNode(true);
    title?.querySelectorAll('button, .badge, .anchor-icon, .wdgf-deep-actions').forEach(node => node.remove());
    return (title?.textContent || block.id || copy.title).replace(/\s+/g, ' ').trim();
  }

  function getEntry(block) {
    return readState()[blockKey(block)] || { explanation: '', changed: false, built: false };
  }

  function entryScore(entry) {
    return Number((entry.explanation || '').trim().length >= 30) + Number(entry.changed) + Number(entry.built);
  }

  function saveEntry(block, patch) {
    const state = readState();
    const key = blockKey(block);
    state[key] = Object.assign({}, state[key], patch, { updatedAt: Date.now() });
    writeState(state);
    updateBlockStatus(block);
    return state[key];
  }

  function icon(name) {
    return `<span class="iconify" data-icon="${name}" aria-hidden="true"></span>`;
  }

  function buildShell() {
    if (document.getElementById('wdgMasteryDialog')) return;
    const shell = document.createElement('div');
    shell.innerHTML = `
      <div class="wdgm-backdrop" id="wdgMasteryBackdrop" hidden></div>
      <section class="wdgm-dialog" id="wdgMasteryDialog" role="dialog" aria-modal="true" aria-labelledby="wdgMasteryTitle" hidden>
        <header class="wdgm-dialog-head">
          <div><span class="wdgm-kicker">${copy.progress}</span><h2 id="wdgMasteryTitle">${copy.title}</h2></div>
          <button class="wdgm-icon-btn" type="button" data-wdgm-close title="${copy.close}">${icon('tabler:x')}</button>
        </header>
        <div class="wdgm-dialog-body">
          <p class="wdgm-intro">${copy.intro}</p>
          <label class="wdgm-field"><span>${copy.explain}</span><textarea data-wdgm-explanation rows="4" placeholder="${copy.explainHint}"></textarea><small data-wdgm-length>0 / 30</small></label>
          <label class="wdgm-check"><input type="checkbox" data-wdgm-changed><span>${copy.changed}</span></label>
          <label class="wdgm-check"><input type="checkbox" data-wdgm-built><span>${copy.built}</span></label>
          <section class="wdgm-sources" data-wdgm-sources></section>
        </div>
        <footer class="wdgm-dialog-foot">
          <span class="wdgm-save-state" data-wdgm-save-state>${copy.saved}</span>
          <button class="wdgm-btn subtle" type="button" data-wdgm-reset>${copy.reset}</button>
          <button class="wdgm-btn primary" type="button" data-wdgm-close>${copy.close}</button>
        </footer>
      </section>`;
    document.body.append(...shell.children);

    document.querySelectorAll('[data-wdgm-close]').forEach(button => button.addEventListener('click', closeDialog));
    document.getElementById('wdgMasteryBackdrop').addEventListener('click', closeDialog);
    document.querySelector('[data-wdgm-explanation]').addEventListener('input', event => {
      if (!activeBlock) return;
      const entry = saveEntry(activeBlock, { explanation: event.target.value });
      renderDialogState(entry);
    });
    document.querySelector('[data-wdgm-changed]').addEventListener('change', event => {
      if (!activeBlock) return;
      renderDialogState(saveEntry(activeBlock, { changed: event.target.checked }));
    });
    document.querySelector('[data-wdgm-built]').addEventListener('change', event => {
      if (!activeBlock) return;
      renderDialogState(saveEntry(activeBlock, { built: event.target.checked }));
    });
    document.querySelector('[data-wdgm-reset]').addEventListener('click', () => {
      if (!activeBlock) return;
      const state = readState();
      delete state[blockKey(activeBlock)];
      writeState(state);
      renderDialogState(getEntry(activeBlock));
      updateBlockStatus(activeBlock);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !document.getElementById('wdgMasteryDialog').hidden) closeDialog();
    });
  }

  function renderSources(block) {
    const target = document.querySelector('[data-wdgm-sources]');
    const links = SOURCES[sectionName(block)] || [];
    target.hidden = !links.length;
    target.innerHTML = links.length ? `
      <div class="wdgm-source-head"><strong>${icon('tabler:external-link')} ${copy.sources}</strong><small>${copy.checked}</small></div>
      <div class="wdgm-source-links">${links.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}${icon('tabler:arrow-up-right')}</a>`).join('')}</div>` : '';
  }

  function renderDialogState(entry) {
    const explanation = document.querySelector('[data-wdgm-explanation]');
    const changed = document.querySelector('[data-wdgm-changed]');
    const built = document.querySelector('[data-wdgm-built]');
    if (explanation.value !== (entry.explanation || '')) explanation.value = entry.explanation || '';
    changed.checked = Boolean(entry.changed);
    built.checked = Boolean(entry.built);
    document.querySelector('[data-wdgm-length]').textContent = `${(entry.explanation || '').trim().length} / 30`;
    const score = entryScore(entry);
    const state = document.querySelector('[data-wdgm-save-state]');
    if (score === 3) state.innerHTML = `${icon('tabler:circle-check-filled')} ${copy.proven}`;
    else state.textContent = copy.score(score);
    state.classList.toggle('complete', score === 3);
  }

  function openDialog(block) {
    buildShell();
    activeBlock = block;
    document.getElementById('wdgMasteryTitle').textContent = blockTitle(block);
    renderSources(block);
    renderDialogState(getEntry(block));
    document.getElementById('wdgMasteryBackdrop').hidden = false;
    document.getElementById('wdgMasteryDialog').hidden = false;
    document.body.classList.add('wdgm-modal-open');
    requestAnimationFrame(() => document.querySelector('[data-wdgm-explanation]').focus());
  }

  function closeDialog() {
    const dialog = document.getElementById('wdgMasteryDialog');
    const backdrop = document.getElementById('wdgMasteryBackdrop');
    if (dialog) dialog.hidden = true;
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove('wdgm-modal-open');
    activeBlock = null;
  }

  function updateBlockStatus(block) {
    const entry = getEntry(block);
    const score = entryScore(entry);
    const button = block.querySelector('[data-wdgm-open]');
    if (!button) return;
    button.classList.toggle('complete', score === 3);
    button.innerHTML = score === 3
      ? `${icon('tabler:circle-check-filled')} <span>${copy.proven}</span>`
      : `${icon('tabler:target-arrow')} <span>${copy.checkpoint}</span><b>${score}/3</b>`;
    button.setAttribute('aria-label', `${copy.checkpoint}: ${copy.score(score)}`);
  }

  function enhanceBlock(block) {
    const section = sectionName(block);
    if (!LEARNING_SECTIONS.has(section) || block.dataset.wdgmReady === '1') return;
    block.dataset.wdgmReady = '1';
    const footer = document.createElement('div');
    footer.className = 'wdgm-lesson-footer';
    footer.innerHTML = `<button class="wdgm-open-btn" type="button" data-wdgm-open></button>`;
    footer.querySelector('button').addEventListener('click', () => openDialog(block));
    block.appendChild(footer);
    updateBlockStatus(block);
  }

  function applyMode(enabled) {
    document.body.classList.toggle('wdgm-independent', enabled);
    localStorage.setItem(MODE_KEY, enabled ? '1' : '0');
    document.querySelectorAll('[data-wdgm-mode]').forEach(button => {
      button.classList.toggle('active', enabled);
      button.setAttribute('aria-pressed', String(enabled));
      button.innerHTML = `${icon(enabled ? 'tabler:eye-off' : 'tabler:eye')}<span>${enabled ? copy.modeOn : copy.mode}</span>`;
    });
  }

  function enhanceSection(section) {
    const id = section.id.replace(/^sec-/, '');
    if (!LEARNING_SECTIONS.has(id)) return;
    section.querySelectorAll(':scope > .block').forEach(enhanceBlock);
    if (!section.querySelector(':scope > .wdgm-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.className = 'wdgm-toolbar';
      toolbar.innerHTML = `<div><strong>${icon('tabler:brain')} ${copy.progress}</strong><span>${copy.modeHint}</span></div><button type="button" data-wdgm-mode></button>`;
      toolbar.querySelector('button').addEventListener('click', () => applyMode(!document.body.classList.contains('wdgm-independent')));
      const anchor = section.querySelector('.lang-section-hero, .section-title, :scope > .block');
      section.insertBefore(toolbar, anchor || section.firstChild);
    }
    applyMode(localStorage.getItem(MODE_KEY) === '1');
  }

  function refresh() {
    queued = false;
    document.querySelectorAll('.section.active').forEach(enhanceSection);
  }

  function queueRefresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  }

  function init() {
    buildShell();
    applyMode(localStorage.getItem(MODE_KEY) === '1');
    refresh();
    const watchedSections = new WeakSet();
    const watchSections = root => {
      const sections = [];
      if (root instanceof Element && root.matches('.section')) sections.push(root);
      root.querySelectorAll?.('.section').forEach(section => sections.push(section));
      sections.forEach(section => {
        if (watchedSections.has(section)) return;
        watchedSections.add(section);
        new MutationObserver(queueRefresh).observe(section, { attributes: true, attributeFilter: ['class'] });
      });
    };
    watchSections(document);
    new MutationObserver(mutations => {
      const active = document.querySelector('.section.active');
      let refreshNeeded = false;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          watchSections(node);
          if (active && (node === active || active.contains(node) || node.contains(active))) refreshNeeded = true;
        });
        if (active && (mutation.target === active || active.contains(mutation.target))) refreshNeeded = true;
      });
      if (refreshNeeded) queueRefresh();
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.WebDevGymMastery = { refresh: queueRefresh, open: openDialog };
})();
