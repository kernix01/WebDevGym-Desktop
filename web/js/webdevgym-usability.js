(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const copy = isEnglish ? {
    timer: 'Timer', normal: 'Timer', pomodoro: 'Pomodoro', focus: 'Focus', rest: 'Break',
    hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', focusMinutes: 'Focus minutes',
    breakMinutes: 'Break minutes', start: 'Start', pause: 'Pause', reset: 'Reset', close: 'Hide timer',
    timerSound: 'Timer finish', breakSound: 'Break finish', soundHelp: 'Choose a built-in signal or upload your own sound.',
    defaultSound: 'Built-in', muted: 'Muted', custom: 'Custom', test: 'Test', upload: 'Upload', remove: 'Remove',
    fontTitle: 'Custom fonts', fontHelp: 'Font files stay in this browser.', interfaceFont: 'Interface font',
    codeFont: 'Code monospace', chooseFont: 'Choose font', active: 'Custom font active', notSet: 'Not uploaded',
    invalidAudio: 'Choose an audio file up to 5 MB.', invalidFont: 'Choose a WOFF, WOFF2, TTF or OTF font up to 8 MB.'
  } : {
    timer: 'Таймер', normal: 'Обычный', pomodoro: 'Помодоро', focus: 'Фокус', rest: 'Отдых',
    hours: 'Часы', minutes: 'Минуты', seconds: 'Секунды', focusMinutes: 'Минуты работы',
    breakMinutes: 'Минуты отдыха', start: 'Старт', pause: 'Пауза', reset: 'Сброс', close: 'Скрыть таймер',
    timerSound: 'Окончание таймера', breakSound: 'Окончание отдыха', soundHelp: 'Выбери встроенный сигнал или загрузи свой звук.',
    defaultSound: 'Встроенный', muted: 'Без звука', custom: 'Свой', test: 'Проверить', upload: 'Загрузить', remove: 'Удалить',
    fontTitle: 'Свои шрифты', fontHelp: 'Файлы шрифтов остаются только в этом браузере.', interfaceFont: 'Шрифт интерфейса',
    codeFont: 'Моношрифт кода', chooseFont: 'Выбрать шрифт', active: 'Свой шрифт активен', notSet: 'Не загружен',
    invalidAudio: 'Выбери аудиофайл размером до 5 МБ.', invalidFont: 'Выбери WOFF, WOFF2, TTF или OTF размером до 8 МБ.'
  };

  if (!isEnglish) Object.assign(copy, {
    timer: 'Таймер', normal: 'Обычный', pomodoro: 'Помодоро', focus: 'Фокус', rest: 'Отдых',
    hours: 'Часы', minutes: 'Минуты', seconds: 'Секунды', focusMinutes: 'Минуты работы',
    breakMinutes: 'Минуты отдыха', start: 'Старт', pause: 'Пауза', reset: 'Сброс', close: 'Скрыть таймер',
    timerSound: 'Окончание таймера', breakSound: 'Окончание отдыха',
    soundHelp: 'Выбери встроенный сигнал или загрузи свой звук.', defaultSound: 'Встроенный',
    muted: 'Без звука', custom: 'Свой', test: 'Проверить', upload: 'Загрузить', remove: 'Удалить',
    fontTitle: 'Свои шрифты', fontHelp: 'Файлы шрифтов остаются только в этом браузере.',
    interfaceFont: 'Шрифт интерфейса', codeFont: 'Моношрифт кода', chooseFont: 'Выбрать шрифт',
    active: 'Свой шрифт активен', notSet: 'Не загружен',
    invalidAudio: 'Выбери аудиофайл размером до 5 МБ.',
    invalidFont: 'Выбери WOFF, WOFF2, TTF или OTF размером до 8 МБ.'
  });

  const DB_NAME = 'webdevgym-usability';
  const DB_VERSION = 1;
  const ASSET_STORE = 'assets';
  const TIMER_KEY = 'wdgu_timer_state_v1';
  const TIMER_WINDOW_KEY = 'wdgu_timer_window_v1';
  const SOUND_PREF_KEY = 'wdgu_timer_sounds_v1';
  const HISTORY_OPEN_KEY = 'wdgr_ai_history_open_v1';
  const FONT_PREF_KEY = 'wdgu_custom_fonts_v1';
  let dbPromise;
  let timerInterval = 0;
  let timerState = loadTimerState();
  const assetUrls = new Map();

  function icon(name, size = 18) {
    return '<iconify-icon icon="' + name + '" width="' + size + '" height="' + size + '"></iconify-icon>';
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { return fallback; }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(ASSET_STORE)) request.result.createObjectStore(ASSET_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  async function putAsset(key, blob) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const request = db.transaction(ASSET_STORE, 'readwrite').objectStore(ASSET_STORE).put(blob, key);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    revokeAssetUrl(key);
  }

  async function getAsset(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(ASSET_STORE).objectStore(ASSET_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function deleteAsset(key) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const request = db.transaction(ASSET_STORE, 'readwrite').objectStore(ASSET_STORE).delete(key);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    revokeAssetUrl(key);
  }

  function revokeAssetUrl(key) {
    if (assetUrls.has(key)) URL.revokeObjectURL(assetUrls.get(key));
    assetUrls.delete(key);
  }

  async function assetUrl(key) {
    if (assetUrls.has(key)) return assetUrls.get(key);
    const blob = await getAsset(key);
    if (!blob) return '';
    const url = URL.createObjectURL(blob);
    assetUrls.set(key, url);
    return url;
  }

  function defaultTimerState() {
    return {
      mode: 'timer', phase: 'focus', status: 'idle', endAt: 0, remaining: 25 * 60,
      timerSeconds: 25 * 60, focusSeconds: 25 * 60, breakSeconds: 5 * 60
    };
  }

  function loadTimerState() {
    const saved = { ...defaultTimerState(), ...readJson(TIMER_KEY, {}) };
    if (saved.status === 'running' && saved.endAt) {
      saved.remaining = Math.max(0, Math.ceil((saved.endAt - Date.now()) / 1000));
    }
    return saved;
  }

  function saveTimerState() {
    writeJson(TIMER_KEY, timerState);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    return (hours ? String(hours).padStart(2, '0') + ':' : '') + String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function synthSound(kind) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const notes = kind === 'break' ? [523.25, 659.25] : [392, 523.25, 783.99];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === 'break' ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      const start = context.currentTime + index * 0.17;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.3);
    });
    window.setTimeout(() => context.close(), 1200);
  }

  async function playTimerSound(kind) {
    const prefs = { timer: 'default', break: 'default', ...readJson(SOUND_PREF_KEY, {}) };
    const preference = prefs[kind] || 'default';
    if (preference === 'muted') return;
    if (preference === 'custom') {
      const url = await assetUrl('sound-' + kind);
      if (url) {
        const audio = new Audio(url);
        audio.volume = 0.78;
        audio.play().catch(() => synthSound(kind));
        return;
      }
    }
    synthSound(kind);
  }

  function setTimerFromInputs() {
    const root = document.getElementById('wdguTimer');
    if (!root || timerState.status === 'running') return;
    if (timerState.mode === 'timer') {
      const hours = clamp(root.querySelector('[data-timer-hours]')?.value, 0, 24);
      const minutes = clamp(root.querySelector('[data-timer-minutes]')?.value, 0, 59);
      const seconds = clamp(root.querySelector('[data-timer-seconds]')?.value, 0, 59);
      timerState.timerSeconds = Math.min(24 * 3600, Math.max(1, hours * 3600 + minutes * 60 + seconds));
      timerState.remaining = timerState.timerSeconds;
    } else {
      timerState.focusSeconds = clamp(root.querySelector('[data-focus-minutes]')?.value, 1, 1440) * 60;
      timerState.breakSeconds = clamp(root.querySelector('[data-break-minutes]')?.value, 1, 1440) * 60;
      timerState.remaining = timerState.phase === 'break' ? timerState.breakSeconds : timerState.focusSeconds;
    }
    saveTimerState();
    renderTimer();
  }

  function startTimer() {
    if (timerState.status === 'running') return;
    if (timerState.remaining <= 0) timerState.remaining = timerState.mode === 'timer' ? timerState.timerSeconds : timerState.phase === 'break' ? timerState.breakSeconds : timerState.focusSeconds;
    timerState.status = 'running';
    timerState.endAt = Date.now() + timerState.remaining * 1000;
    saveTimerState();
    ensureTimerTicker();
    renderTimer();
  }

  function pauseTimer() {
    if (timerState.status !== 'running') return;
    timerState.remaining = Math.max(0, Math.ceil((timerState.endAt - Date.now()) / 1000));
    timerState.status = 'paused';
    timerState.endAt = 0;
    saveTimerState();
    renderTimer();
  }

  function resetTimer() {
    timerState.status = 'idle';
    timerState.endAt = 0;
    timerState.phase = 'focus';
    timerState.remaining = timerState.mode === 'timer' ? timerState.timerSeconds : timerState.focusSeconds;
    saveTimerState();
    renderTimer();
  }

  function finishTimer() {
    if (timerState.mode === 'timer') {
      timerState.status = 'idle';
      timerState.remaining = 0;
      timerState.endAt = 0;
      playTimerSound('timer');
    } else if (timerState.phase === 'focus') {
      playTimerSound('timer');
      timerState.phase = 'break';
      timerState.remaining = timerState.breakSeconds;
      timerState.endAt = Date.now() + timerState.remaining * 1000;
      timerState.status = 'running';
    } else {
      playTimerSound('break');
      timerState.phase = 'focus';
      timerState.remaining = timerState.focusSeconds;
      timerState.endAt = 0;
      timerState.status = 'idle';
    }
    saveTimerState();
    renderTimer();
  }

  function tickTimer() {
    if (timerState.status !== 'running') return;
    const remaining = Math.max(0, Math.ceil((timerState.endAt - Date.now()) / 1000));
    if (remaining !== timerState.remaining) {
      timerState.remaining = remaining;
      renderTimer();
    }
    if (remaining <= 0) finishTimer();
  }

  function ensureTimerTicker() {
    if (!timerInterval) timerInterval = window.setInterval(tickTimer, 250);
  }

  function getTimerLauncher() {
    return document.querySelector('.wdgn-top .wdgu-timer-launcher')
      || document.querySelector('.wdgu-timer-launcher');
  }

  function renderTimer() {
    const root = document.getElementById('wdguTimer');
    if (!root) return;
    root.dataset.mode = timerState.mode;
    root.dataset.phase = timerState.phase;
    root.querySelectorAll('[data-timer-mode]').forEach(button => button.classList.toggle('active', button.dataset.timerMode === timerState.mode));
    root.querySelector('[data-timer-phase]').textContent = timerState.mode === 'timer' ? copy.normal : timerState.phase === 'focus' ? copy.focus : copy.rest;
    root.querySelector('[data-timer-display]').textContent = formatTime(timerState.remaining);
    root.querySelector('[data-timer-start]').hidden = timerState.status === 'running';
    root.querySelector('[data-timer-pause]').hidden = timerState.status !== 'running';
    const launcher = getTimerLauncher();
    if (launcher) {
      launcher.classList.toggle('running', timerState.status === 'running');
      const label = timerState.status === 'running' ? copy.timer + ': ' + formatTime(timerState.remaining) : copy.timer;
      launcher.title = label;
      launcher.setAttribute('aria-label', label);
    }
  }

  function saveTimerWindow(root) {
    if (window.innerWidth <= 720) return;
    const rect = root.getBoundingClientRect();
    writeJson(TIMER_WINDOW_KEY, { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) });
  }

  function makeDraggable(root, handle) {
    handle.addEventListener('pointerdown', event => {
      if (window.innerWidth <= 720 || event.button !== 0 || event.target.closest('button,input,select')) return;
      const rect = root.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      Object.assign(root.style, { left: rect.left + 'px', top: rect.top + 'px', right: 'auto', bottom: 'auto' });
      handle.setPointerCapture(event.pointerId);
      const move = moveEvent => {
        root.style.left = Math.max(8, Math.min(moveEvent.clientX - offsetX, window.innerWidth - rect.width - 8)) + 'px';
        root.style.top = Math.max(58, Math.min(moveEvent.clientY - offsetY, window.innerHeight - 70)) + 'px';
      };
      const stop = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', stop);
        handle.removeEventListener('pointercancel', stop);
        saveTimerWindow(root);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  }

  function buildTimer() {
    if (document.getElementById('wdguTimer')) return;
    const launcher = getTimerLauncher() || document.createElement('button');
    document.querySelectorAll('#wdguTimerLauncher').forEach(button => {
      if (button !== launcher) button.removeAttribute('id');
    });
    launcher.id = 'wdguTimerLauncher';
    launcher.className = 'wdg-icon-btn wdgu-timer-launcher';
    launcher.type = 'button';
    launcher.title = copy.timer;
    launcher.setAttribute('aria-label', copy.timer);
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = icon('tabler:clock', 19);
    const root = document.createElement('section');
    root.id = 'wdguTimer';
    root.className = 'wdgu-timer';
    root.hidden = true;
    root.innerHTML = '<header class="wdgu-timer-head" data-timer-drag><div>' + icon('tabler:clock-hour-4', 19) + '<strong>' + copy.timer + '</strong><small data-timer-phase></small></div><button type="button" data-timer-close title="' + copy.close + '" aria-label="' + copy.close + '">' + icon('tabler:x', 18) + '</button></header>' +
      '<div class="wdgu-timer-body"><div class="wdgu-timer-modes"><button type="button" data-timer-mode="timer">' + copy.normal + '</button><button type="button" data-timer-mode="pomodoro">' + copy.pomodoro + '</button></div>' +
      '<div class="wdgu-timer-display" data-timer-display></div>' +
      '<div class="wdgu-timer-config wdgu-config-timer"><label>' + copy.hours + '<input type="number" min="0" max="24" data-timer-hours></label><label>' + copy.minutes + '<input type="number" min="0" max="59" data-timer-minutes></label><label>' + copy.seconds + '<input type="number" min="0" max="59" data-timer-seconds></label></div>' +
      '<div class="wdgu-timer-config wdgu-config-pomodoro"><label>' + copy.focusMinutes + '<input type="number" min="1" max="1440" data-focus-minutes></label><label>' + copy.breakMinutes + '<input type="number" min="1" max="1440" data-break-minutes></label></div>' +
      '<div class="wdgu-timer-actions"><button class="primary" type="button" data-timer-start aria-label="' + copy.start + '">' + icon('tabler:player-play', 17) + copy.start + '</button><button class="primary" type="button" data-timer-pause aria-label="' + copy.pause + '">' + icon('tabler:player-pause', 17) + copy.pause + '</button><button type="button" data-timer-reset aria-label="' + copy.reset + '">' + icon('tabler:rotate-clockwise', 17) + copy.reset + '</button></div></div>';
    const toolbar = document.querySelector('.wdg-commandbar');
    const toolbarAnchor = document.getElementById('wdgAiBtn') || toolbar?.querySelector('.wdg-lang');
    if (!launcher.isConnected) {
      if (toolbar) toolbar.insertBefore(launcher, toolbarAnchor || null);
      else document.body.append(launcher);
    }
    document.body.append(root);
    const savedWindow = readJson(TIMER_WINDOW_KEY, {});
    if (window.innerWidth > 720 && savedWindow.left != null) Object.assign(root.style, { left: savedWindow.left + 'px', top: savedWindow.top + 'px', width: savedWindow.width + 'px', height: savedWindow.height + 'px', right: 'auto', bottom: 'auto' });
    const timerHours = Math.floor(timerState.timerSeconds / 3600);
    root.querySelector('[data-timer-hours]').value = timerHours;
    root.querySelector('[data-timer-minutes]').value = Math.floor((timerState.timerSeconds % 3600) / 60);
    root.querySelector('[data-timer-seconds]').value = timerState.timerSeconds % 60;
    root.querySelector('[data-focus-minutes]').value = Math.round(timerState.focusSeconds / 60);
    root.querySelector('[data-break-minutes]').value = Math.round(timerState.breakSeconds / 60);
    document.addEventListener('click', event => {
      const trigger = event.target.closest('.wdgu-timer-launcher');
      if (!trigger) return;
      root.hidden = !root.hidden;
      document.querySelectorAll('.wdgu-timer-launcher').forEach(button => {
        button.setAttribute('aria-expanded', String(button === trigger && !root.hidden));
      });
      if (!root.hidden) renderTimer();
    });
    root.querySelector('[data-timer-close]').addEventListener('click', () => {
      root.hidden = true;
      document.querySelectorAll('.wdgu-timer-launcher').forEach(button => button.setAttribute('aria-expanded', 'false'));
    });
    root.querySelectorAll('[data-timer-mode]').forEach(button => button.addEventListener('click', () => {
      if (timerState.status === 'running') pauseTimer();
      timerState.mode = button.dataset.timerMode;
      timerState.phase = 'focus';
      timerState.remaining = timerState.mode === 'timer' ? timerState.timerSeconds : timerState.focusSeconds;
      saveTimerState(); renderTimer();
    }));
    root.querySelectorAll('.wdgu-timer-config input').forEach(input => input.addEventListener('change', setTimerFromInputs));
    root.querySelector('[data-timer-start]').addEventListener('click', startTimer);
    root.querySelector('[data-timer-pause]').addEventListener('click', pauseTimer);
    root.querySelector('[data-timer-reset]').addEventListener('click', resetTimer);
    makeDraggable(root, root.querySelector('[data-timer-drag]'));
    new ResizeObserver(() => saveTimerWindow(root)).observe(root);
    ensureTimerTicker();
    renderTimer();
  }

  function soundRow(kind, title) {
    const prefs = { timer: 'default', break: 'default', ...readJson(SOUND_PREF_KEY, {}) };
    return '<div class="wdgu-asset-row" data-sound-row="' + kind + '"><div><strong>' + title + '</strong><small data-sound-status>' + copy.soundHelp + '</small></div><select data-sound-select><option value="default">' + copy.defaultSound + '</option><option value="muted">' + copy.muted + '</option><option value="custom">' + copy.custom + '</option></select><input hidden type="file" accept="audio/*" data-sound-file><button type="button" data-sound-upload>' + icon('tabler:upload', 16) + copy.upload + '</button><button type="button" data-sound-test>' + icon('tabler:player-play', 16) + copy.test + '</button><button type="button" class="danger" data-sound-remove title="' + copy.remove + '">' + icon('tabler:trash', 16) + '</button></div>';
  }

  async function applyStoredFont(kind) {
    const prefs = readJson(FONT_PREF_KEY, {});
    if (!prefs[kind]) return;
    const blob = await getAsset('font-' + kind);
    if (!blob) return;
    const family = kind === 'interface' ? 'WebDevGym Custom UI' : 'WebDevGym Custom Code';
    const url = await assetUrl('font-' + kind);
    if (!url) return;
    const face = new FontFace(family, `url("${url}")`);
    await face.load();
    document.fonts.add(face);
    document.documentElement.style.setProperty(kind === 'interface' ? '--wdgr-interface-font' : '--wdgr-code-font', '"' + family + '"');
  }

  function fontRow(kind, title) {
    const prefs = readJson(FONT_PREF_KEY, {});
    return '<div class="wdgu-asset-row" data-font-row="' + kind + '"><div><strong>' + title + '</strong><small data-font-status>' + (prefs[kind] ? copy.active : copy.notSet) + '</small></div><input hidden type="file" accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf" data-font-file><button type="button" data-font-upload>' + icon('tabler:typography', 16) + copy.chooseFont + '</button><button type="button" class="danger" data-font-remove title="' + copy.remove + '">' + icon('tabler:trash', 16) + '</button></div>';
  }

  function installSettingsExtensions() {
    const view = document.getElementById('wdgrSettingsView');
    if (!view || view.dataset.usabilityReady === '1') return false;
    view.dataset.usabilityReady = '1';
    view.setAttribute('role', 'region');
    view.removeAttribute('aria-modal');
    view.querySelector('#wdgrSettingsClose')?.remove();
    view.querySelector('#wdgrSettingsSave')?.remove();
    view.querySelector('.wdgr-settings-footer')?.remove();

    const appearanceSection = view.querySelector('[data-settings-page="appearance"] .wdgr-settings-section');
    if (appearanceSection) {
      const fonts = document.createElement('section');
      fonts.className = 'wdgr-settings-section wdgu-settings-assets';
      fonts.innerHTML = '<div class="wdgr-section-title"><div><h4>' + copy.fontTitle + '</h4><p>' + copy.fontHelp + '</p></div></div>' + fontRow('interface', copy.interfaceFont) + fontRow('code', copy.codeFont);
      appearanceSection.after(fonts);
      fonts.querySelectorAll('[data-font-row]').forEach(row => {
        const kind = row.dataset.fontRow;
        const input = row.querySelector('[data-font-file]');
        row.querySelector('[data-font-upload]').addEventListener('click', () => input.click());
        input.addEventListener('change', async () => {
          const file = input.files?.[0];
          if (!file || file.size > 8 * 1024 * 1024 || !/\.(woff2?|ttf|otf)$/i.test(file.name)) { alert(copy.invalidFont); return; }
          await putAsset('font-' + kind, file);
          const prefs = readJson(FONT_PREF_KEY, {}); prefs[kind] = file.name; writeJson(FONT_PREF_KEY, prefs);
          row.querySelector('[data-font-status]').textContent = copy.active;
          await applyStoredFont(kind);
        });
        row.querySelector('[data-font-remove]').addEventListener('click', async () => {
          await deleteAsset('font-' + kind);
          const prefs = readJson(FONT_PREF_KEY, {}); delete prefs[kind]; writeJson(FONT_PREF_KEY, prefs);
          row.querySelector('[data-font-status]').textContent = copy.notSet;
          document.documentElement.style.removeProperty(kind === 'interface' ? '--wdgr-interface-font' : '--wdgr-code-font');
          window.location.reload();
        });
      });
    }

    const soundMount = view.querySelector('#wdgrSoundMount');
    if (soundMount) {
      const section = document.createElement('section');
      section.className = 'wdgr-settings-section wdgu-settings-assets';
      section.innerHTML = '<div class="wdgr-section-title"><div><h4>' + copy.timer + '</h4><p>' + copy.soundHelp + '</p></div></div>' + soundRow('timer', copy.timerSound) + soundRow('break', copy.breakSound);
      soundMount.prepend(section);
      section.querySelectorAll('[data-sound-row]').forEach(row => {
        const kind = row.dataset.soundRow;
        const select = row.querySelector('[data-sound-select]');
        const input = row.querySelector('[data-sound-file]');
        select.value = ({ timer: 'default', break: 'default', ...readJson(SOUND_PREF_KEY, {}) })[kind];
        select.addEventListener('change', () => { const prefs = readJson(SOUND_PREF_KEY, {}); prefs[kind] = select.value; writeJson(SOUND_PREF_KEY, prefs); });
        row.querySelector('[data-sound-upload]').addEventListener('click', () => input.click());
        input.addEventListener('change', async () => {
          const file = input.files?.[0];
          if (!file || !file.type.startsWith('audio/') || file.size > 5 * 1024 * 1024) { alert(copy.invalidAudio); return; }
          await putAsset('sound-' + kind, file);
          const prefs = readJson(SOUND_PREF_KEY, {}); prefs[kind] = 'custom'; writeJson(SOUND_PREF_KEY, prefs); select.value = 'custom';
          row.querySelector('[data-sound-status]').textContent = file.name;
        });
        row.querySelector('[data-sound-test]').addEventListener('click', () => playTimerSound(kind));
        row.querySelector('[data-sound-remove]').addEventListener('click', async () => {
          await deleteAsset('sound-' + kind);
          const prefs = readJson(SOUND_PREF_KEY, {}); prefs[kind] = 'default'; writeJson(SOUND_PREF_KEY, prefs); select.value = 'default';
          row.querySelector('[data-sound-status]').textContent = copy.soundHelp;
        });
      });
    }

    return true;
  }

  function installSettingsNavigation() {
    document.addEventListener('click', event => {
      const view = document.getElementById('wdgrSettingsView');
      if (!view?.classList.contains('open')) return;
      const target = event.target.closest('[data-view], [data-wdg-nav], [data-wdg-feature], .wdg-library-item, .tabs-nav .tab');
      if (!target || target.closest('[data-settings-category]') || /setting/i.test(target.dataset.wdgFeature || '')) return;
      window.toggleSettings?.();
    }, true);
  }

  function installAiHistoryState() {
    const win = document.getElementById('aiChatWin');
    if (!win?.classList.contains('wdgr-ai') || win.dataset.historyStateReady === '1') return false;
    win.dataset.historyStateReady = '1';
    if (localStorage.getItem(HISTORY_OPEN_KEY) === '1') win.classList.add('wdgr-history-open');
    const save = () => localStorage.setItem(HISTORY_OPEN_KEY, win.classList.contains('wdgr-history-open') ? '1' : '0');
    win.querySelector('[data-ai-history-close]')?.addEventListener('click', () => window.setTimeout(save));
    win.querySelector('.wdgr-ai-history-toggle')?.addEventListener('click', () => window.setTimeout(save));
    return true;
  }

  function observeLateUi() {
    const run = () => { installSettingsExtensions(); installAiHistoryState(); };
    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 12000);
  }

  function init() {
    buildTimer();
    observeLateUi();
    installSettingsNavigation();
    applyStoredFont('interface').catch(() => {});
    applyStoredFont('code').catch(() => {});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tickTimer(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
