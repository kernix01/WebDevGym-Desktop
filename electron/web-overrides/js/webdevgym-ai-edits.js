(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const copy = isEnglish ? {
    prepared: 'Code changes prepared', review: 'Review changes', files: 'files', apply: 'Apply changes',
    close: 'Close', applying: 'Applying...', applied: 'Changes applied', backup: 'A project snapshot will be created before writing.',
    noChanges: 'No valid changes were returned', changed: 'The project changed. Prepare the edit again.', diff: 'AI code changes'
  } : {
    prepared: 'Изменения кода подготовлены', review: 'Проверить изменения', files: 'файлов', apply: 'Применить изменения',
    close: 'Закрыть', applying: 'Применение...', applied: 'Изменения применены', backup: 'Перед записью будет создан снимок проекта.',
    noChanges: 'ИИ не вернул допустимых изменений', changed: 'Проект изменился. Подготовь правку заново.', diff: 'Изменения кода от ИИ'
  };
  const EDIT_PATTERN = /```webdevgym-edit\s*\r?\n([^\r\n]+)\r?\n([\s\S]*?)```/gi;
  const STATUS_KEY = 'wdgr_ai_edit_status_v1';
  const proposals = new Map();
  let activeReview = null;
  let activeBadge = null;

  const icon = (name, size = 17) => `<iconify-icon icon="tabler:${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;

  function fileCountLabel(count) {
    if (isEnglish) return `${count} ${count === 1 ? 'file' : 'files'}`;
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return `${count} файлов`;
    if (last === 1) return `${count} файл`;
    if (last >= 2 && last <= 4) return `${count} файла`;
    return `${count} файлов`;
  }

  function bridge() {
    const value = window.WebDevGymDesktopProjectContext;
    return value && typeof value.review === 'function' && typeof value.apply === 'function' ? value : null;
  }

  function readStatuses() {
    try {
      const value = JSON.parse(localStorage.getItem(STATUS_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch {
      return {};
    }
  }

  function saveStatus(id, status) {
    const statuses = readStatuses();
    statuses[id] = { ...status, savedAt: Date.now() };
    const entries = Object.entries(statuses).sort((left, right) => right[1].savedAt - left[1].savedAt).slice(0, 30);
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(Object.fromEntries(entries))); } catch {}
  }

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return `edit_${(result >>> 0).toString(36)}`;
  }

  function parse(text) {
    const source = String(text || '');
    const files = [];
    let match;
    EDIT_PATTERN.lastIndex = 0;
    while ((match = EDIT_PATTERN.exec(source)) && files.length < 5) {
      try {
        const header = JSON.parse(match[1].trim());
        const path = String(header?.path || '').replace(/\\/g, '/').trim();
        if (!path || files.some(file => file.path === path)) continue;
        files.push({ path, content: match[2] });
      } catch {}
    }
    if (!files.length) return null;
    return { id: hash(source), files };
  }

  function displayText(text) {
    const proposal = parse(text);
    if (!proposal) return text;
    EDIT_PATTERN.lastIndex = 0;
    return String(text || '').replace(EDIT_PATTERN, '').trim() || copy.prepared;
  }

  function systemPrompt(attachments) {
    const paths = (Array.isArray(attachments) ? attachments : [])
      .map(attachment => attachment?.projectPath)
      .filter(Boolean)
      .slice(0, 5);
    if (!paths.length) return '';
    return `\n\nAI EDIT MODE IS AVAILABLE FOR THESE PROJECT FILES ONLY: ${paths.join(', ')}.\n` +
      'When the user explicitly asks you to modify, fix, refactor, or implement code in these files, explain the change briefly and append one block per changed file in exactly this format:\n' +
      '```webdevgym-edit\n{"path":"exact/relative/path"}\nFULL FINAL FILE CONTENT\n```\n' +
      'Use an exact path from the allowed list. The block must contain the complete final file, not a diff and not an abbreviated fragment. Never claim that the edit was already applied; it is only a proposal awaiting user review. Do not emit edit blocks for explanation-only requests.';
  }

  function splitLines(value) {
    return String(value).replace(/\r\n/g, '\n').split('\n');
  }

  function fallbackDiff(before, after) {
    let prefix = 0;
    while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix += 1;
    let beforeEnd = before.length - 1;
    let afterEnd = after.length - 1;
    while (beforeEnd >= prefix && afterEnd >= prefix && before[beforeEnd] === after[afterEnd]) {
      beforeEnd -= 1;
      afterEnd -= 1;
    }
    return [
      ...before.slice(0, prefix).map(text => ({ type: 'context', text })),
      ...before.slice(prefix, beforeEnd + 1).map(text => ({ type: 'remove', text })),
      ...after.slice(prefix, afterEnd + 1).map(text => ({ type: 'add', text })),
      ...before.slice(beforeEnd + 1).map(text => ({ type: 'context', text }))
    ];
  }

  function lineDiff(beforeText, afterText) {
    const before = splitLines(beforeText);
    const after = splitLines(afterText);
    if (before.length * after.length > 600000) return fallbackDiff(before, after);
    const matrix = Array.from({ length: before.length + 1 }, () => new Uint32Array(after.length + 1));
    for (let left = before.length - 1; left >= 0; left -= 1) {
      for (let right = after.length - 1; right >= 0; right -= 1) {
        matrix[left][right] = before[left] === after[right]
          ? matrix[left + 1][right + 1] + 1
          : Math.max(matrix[left + 1][right], matrix[left][right + 1]);
      }
    }
    const result = [];
    let left = 0;
    let right = 0;
    while (left < before.length || right < after.length) {
      if (left < before.length && right < after.length && before[left] === after[right]) {
        result.push({ type: 'context', text: before[left] });
        left += 1;
        right += 1;
      } else if (left < before.length && (right >= after.length || matrix[left + 1][right] >= matrix[left][right + 1])) {
        result.push({ type: 'remove', text: before[left] });
        left += 1;
      } else {
        result.push({ type: 'add', text: after[right] });
        right += 1;
      }
    }
    return result;
  }

  function buildReview(review, proposal) {
    const files = review.files.map(file => {
      const lines = lineDiff(file.before, file.after);
      return {
        ...file,
        lines,
        additions: lines.filter(line => line.type === 'add').length,
        removals: lines.filter(line => line.type === 'remove').length
      };
    });
    return {
      ...review,
      id: proposal.id,
      files,
      additions: files.reduce((sum, file) => sum + file.additions, 0),
      removals: files.reduce((sum, file) => sum + file.removals, 0)
    };
  }

  function badgeContent(review, label = copy.review) {
    return `${icon('git-compare', 15)}<span>${label}</span><strong class="add">+${review.additions}</strong><strong class="remove">−${review.removals}</strong>`;
  }

  function renderHoverPreview(wrapper, review) {
    wrapper.querySelector('.wdgr-ai-edit-hover')?.remove();
    const preview = document.createElement('div');
    preview.className = 'wdgr-ai-edit-hover';
    preview.setAttribute('role', 'status');
    const heading = document.createElement('strong');
    heading.textContent = fileCountLabel(review.files.length);
    const list = document.createElement('div');
    review.files.forEach(file => {
      const row = document.createElement('div');
      const path = document.createElement('span');
      path.textContent = file.path;
      const stats = document.createElement('small');
      stats.innerHTML = `<i>+${file.additions}</i><em>−${file.removals}</em>`;
      row.append(path, stats);
      list.appendChild(row);
    });
    preview.append(heading, list);
    wrapper.appendChild(preview);
  }

  function enhanceMessage({ element, bubble, text }) {
    if (!element || !bubble || !bridge()) return;
    const proposal = parse(text);
    if (!proposal || element.querySelector('[data-ai-edit-summary]')) return;
    proposals.set(proposal.id, proposal);
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'wdgr-ai-edit-summary loading';
    badge.dataset.aiEditSummary = proposal.id;
    badge.innerHTML = `${icon('loader-2', 15)}<span>${copy.prepared}</span>`;
    const wrapper = document.createElement('div');
    wrapper.className = 'wdgr-ai-edit-summary-wrap';
    wrapper.appendChild(badge);
    bubble.appendChild(wrapper);

    const saved = readStatuses()[proposal.id];
    bridge().review(proposal.files).then(review => {
      const prepared = buildReview(review, proposal);
      proposals.set(proposal.id, prepared);
      badge.classList.remove('loading');
      renderHoverPreview(wrapper, prepared);
      if (saved?.applied) {
        badge.classList.add('applied');
        badge.disabled = true;
        badge.innerHTML = badgeContent({ additions: saved.additions, removals: saved.removals }, copy.applied);
        return;
      }
      badge.innerHTML = badgeContent(prepared);
      badge.addEventListener('click', () => openReview(prepared, badge));
    }).catch(error => {
      badge.classList.remove('loading');
      badge.classList.add('error');
      badge.innerHTML = `${icon('alert-triangle', 15)}<span>${error.message || copy.noChanges}</span>`;
      badge.disabled = true;
    });
  }

  function ensureDialog() {
    let overlay = document.getElementById('wdgrAiEditReview');
    if (overlay) return overlay;
    overlay = document.createElement('section');
    overlay.id = 'wdgrAiEditReview';
    overlay.className = 'wdgr-ai-edit-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="wdgr-ai-edit-dialog" role="dialog" aria-modal="true" aria-label="${copy.diff}">
        <header><div>${icon('git-compare', 20)}<span><strong>${copy.diff}</strong><small data-ai-edit-project></small></span></div><div class="wdgr-ai-edit-total" data-ai-edit-total></div><button type="button" data-ai-edit-close aria-label="${copy.close}">${icon('x', 18)}</button></header>
        <div class="wdgr-ai-edit-body"><aside data-ai-edit-files></aside><main><div class="wdgr-ai-edit-file-head" data-ai-edit-file-head></div><div class="wdgr-ai-edit-diff" data-ai-edit-diff></div></main></div>
        <footer><span>${icon('shield-check', 16)} ${copy.backup}</span><div><button type="button" data-ai-edit-close>${copy.close}</button><button type="button" class="primary" data-ai-edit-apply>${icon('check', 16)} ${copy.apply}</button></div></footer>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('[data-ai-edit-close]').forEach(button => button.addEventListener('click', closeReview));
    overlay.addEventListener('click', event => { if (event.target === overlay) closeReview(); });
    overlay.querySelector('[data-ai-edit-apply]').addEventListener('click', applyReview);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !overlay.hidden) closeReview();
    });
    return overlay;
  }

  function openReview(review, badge) {
    activeReview = review;
    activeBadge = badge;
    const overlay = ensureDialog();
    overlay.hidden = false;
    overlay.querySelector('[data-ai-edit-project]').textContent = review.projectName;
    overlay.querySelector('[data-ai-edit-total]').innerHTML = `<strong class="add">+${review.additions}</strong><strong class="remove">−${review.removals}</strong><span>${fileCountLabel(review.files.length)}</span>`;
    const fileList = overlay.querySelector('[data-ai-edit-files]');
    fileList.replaceChildren();
    review.files.forEach((file, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.aiEditFile = String(index);
      button.innerHTML = `<span>${icon('file-code', 15)}<b></b></span><small><i>+${file.additions}</i><em>−${file.removals}</em></small>`;
      button.querySelector('b').textContent = file.path;
      button.addEventListener('click', () => renderFile(index));
      fileList.appendChild(button);
    });
    renderFile(0);
    const applyButton = overlay.querySelector('[data-ai-edit-apply]');
    applyButton.disabled = false;
    applyButton.innerHTML = `${icon('check', 16)} ${copy.apply}`;
    document.body.classList.add('wdgr-ai-edit-open');
  }

  function renderFile(index) {
    if (!activeReview) return;
    const overlay = ensureDialog();
    const file = activeReview.files[index];
    if (!file) return;
    overlay.querySelectorAll('[data-ai-edit-file]').forEach(button => button.classList.toggle('active', Number(button.dataset.aiEditFile) === index));
    const heading = overlay.querySelector('[data-ai-edit-file-head]');
    heading.replaceChildren();
    const path = document.createElement('strong');
    path.textContent = file.path;
    const stats = document.createElement('span');
    stats.innerHTML = `<b>+${file.additions}</b><i>−${file.removals}</i>`;
    heading.append(path, stats);
    const diff = overlay.querySelector('[data-ai-edit-diff]');
    diff.replaceChildren();
    let oldNumber = 0;
    let newNumber = 0;
    file.lines.slice(0, 1600).forEach(line => {
      if (line.type !== 'add') oldNumber += 1;
      if (line.type !== 'remove') newNumber += 1;
      const row = document.createElement('div');
      row.className = `wdgr-ai-diff-line ${line.type}`;
      const marker = line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' ';
      row.innerHTML = `<span>${line.type === 'add' ? '' : oldNumber}</span><span>${line.type === 'remove' ? '' : newNumber}</span><b>${marker}</b><code></code>`;
      row.querySelector('code').textContent = line.text || ' ';
      diff.appendChild(row);
    });
    if (file.lines.length > 1600) {
      const omitted = document.createElement('div');
      omitted.className = 'wdgr-ai-diff-omitted';
      omitted.textContent = `… ${file.lines.length - 1600}`;
      diff.appendChild(omitted);
    }
  }

  function closeReview() {
    const overlay = document.getElementById('wdgrAiEditReview');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('wdgr-ai-edit-open');
    activeReview = null;
    activeBadge = null;
  }

  async function applyReview() {
    if (!activeReview || !bridge()) return;
    const overlay = ensureDialog();
    const button = overlay.querySelector('[data-ai-edit-apply]');
    button.disabled = true;
    button.innerHTML = `${icon('loader-2', 16)} ${copy.applying}`;
    try {
      await bridge().apply(activeReview);
      saveStatus(activeReview.id, { applied: true, additions: activeReview.additions, removals: activeReview.removals });
      if (activeBadge) {
        activeBadge.classList.add('applied');
        activeBadge.disabled = true;
        activeBadge.innerHTML = badgeContent(activeReview, copy.applied);
      }
      window.showToast?.(copy.applied);
      closeReview();
    } catch (error) {
      button.disabled = false;
      button.innerHTML = `${icon('check', 16)} ${copy.apply}`;
      window.showToast?.(error.message || copy.changed);
    }
  }

  window.WebDevGymAiEdits = Object.freeze({ displayText, enhanceMessage, parse, systemPrompt });
  window.setTimeout(() => {
    if (typeof window.aiRenderHistory === 'function') window.aiRenderHistory();
  }, 0);
})();
