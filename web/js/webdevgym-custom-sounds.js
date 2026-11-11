(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const text = isEnglish ? {
    title: 'Your sound',
    description: 'Upload a short sound up to 5 seconds. It stays in this browser.',
    upload: 'Upload sound',
    history: 'History',
    empty: 'Uploaded sounds will appear here',
    tooLarge: 'Choose an audio file smaller than 5 MB',
    tooLong: 'The click sound must be no longer than 5 seconds',
    wrongType: 'Use MP3, WAV, OGG, M4A, AAC or WebM',
    readError: 'Could not read this audio file',
    saved: 'Sound added to history',
    deleted: 'Sound deleted',
    preview: 'Preview',
    remove: 'Delete',
    selected: 'Selected',
    unavailable: 'This sound is no longer available in local storage',
    local: 'Stored only in this browser',
    aiTitle: 'AI reply',
    aiDescription: 'Play a separate sound when the assistant finishes a reply.',
    aiEnabled: 'Reply sound',
    aiSound: 'Sound',
    aiVolume: 'Volume',
    aiPreview: 'Preview reply sound',
    aiUpload: 'Upload reply sound',
    aiSaved: 'AI reply sound updated',
    aiNotificationTitle: 'WebDevGym AI replied'
  } : {
    title: 'Свой звук',
    description: 'Загрузи короткий звук до 5 секунд. Он останется в этом браузере.',
    upload: 'Загрузить звук',
    history: 'История',
    empty: 'Загруженные звуки появятся здесь',
    tooLarge: 'Выбери аудиофайл меньше 5 МБ',
    tooLong: 'Звук клика должен быть не длиннее 5 секунд',
    wrongType: 'Поддерживаются MP3, WAV, OGG, M4A, AAC и WebM',
    readError: 'Не удалось прочитать этот аудиофайл',
    saved: 'Звук добавлен в историю',
    deleted: 'Звук удалён',
    preview: 'Прослушать',
    remove: 'Удалить',
    selected: 'Выбран',
    unavailable: 'Этот звук больше недоступен в локальном хранилище',
    local: 'Хранится только в этом браузере',
    aiTitle: 'Ответ ИИ',
    aiDescription: 'Отдельный звук, когда помощник закончил отвечать.',
    aiEnabled: 'Звук ответа',
    aiSound: 'Звук',
    aiVolume: 'Громкость',
    aiPreview: 'Проверить звук ответа',
    aiUpload: 'Загрузить звук ответа',
    aiSaved: 'Звук ответа ИИ обновлён',
    aiNotificationTitle: 'WebDevGym: ИИ ответил'
  };

  const DB_NAME = 'webdevgym-personalization';
  const DB_VERSION = 3;
  const STORE_NAME = 'sounds';
  const SOUND_KEY = 'wdg_click_sound_v2';
  const AI_SOUND_KEY = 'wdg_ai_reply_sound_v1';
  const AI_SOUND_ENABLED_KEY = 'wdg_ai_reply_sound_enabled_v1';
  const AI_SOUND_VOLUME_KEY = 'wdg_ai_reply_sound_volume_v1';
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_DURATION = 5.25;
  const MAX_HISTORY = 10;
  const allowedExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm'];
  const aiProfiles = isEnglish
    ? [['glass', 'Glass'], ['soft', 'Soft'], ['pop', 'Pop'], ['arcade', 'Arcade']]
    : [['glass', 'Стекло'], ['soft', 'Мягкий'], ['pop', 'Щелчок'], ['arcade', 'Аркада']];
  const soundUrls = new Map();
  const originalPlayClickSound = window.playClickSound;
  let currentClickAudio = null;
  let currentAiAudio = null;
  let aiAudioContext = null;
  let statusTimer = 0;

  function icon(name, size = 16) {
    return `<iconify-icon icon="${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    const status = document.getElementById('wdgcSoundStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.add('show');
    clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => status.classList.remove('show'), 2400);
  }

  function selectedSound() {
    try {
      return localStorage.getItem(SOUND_KEY) || 'soft';
    } catch (error) {
      return 'soft';
    }
  }

  function saveSelectedSound(value) {
    try {
      localStorage.setItem(SOUND_KEY, value);
      localStorage.setItem('clickSounds', '1');
    } catch (error) {}
  }

  function soundVolume() {
    const value = Number(localStorage.getItem('wdg_click_volume_v2') || 38);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value / 100)) : .38;
  }

  function aiSoundEnabled() {
    return localStorage.getItem(AI_SOUND_ENABLED_KEY) !== '0';
  }

  function selectedAiSound() {
    return localStorage.getItem(AI_SOUND_KEY) || 'glass';
  }

  function aiSoundVolume() {
    const value = Number(localStorage.getItem(AI_SOUND_VOLUME_KEY) || 55);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value / 100)) : .55;
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is unavailable'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('assets')) database.createObjectStore('assets');
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function databaseRequest(mode, action) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
    });
  }

  function getSounds() {
    return databaseRequest('readonly', store => store.getAll());
  }

  function getSound(id) {
    return databaseRequest('readonly', store => store.get(id));
  }

  function saveSound(record) {
    return databaseRequest('readwrite', store => store.put(record));
  }

  function removeSound(id) {
    return databaseRequest('readwrite', store => store.delete(id));
  }

  function mediaElementDuration(file) {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      const url = URL.createObjectURL(file);
      const cleanup = () => {
        audio.removeAttribute('src');
        audio.load();
        URL.revokeObjectURL(url);
      };
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        cleanup();
        Number.isFinite(duration) ? resolve(duration) : reject(new Error('Unknown duration'));
      };
      audio.onerror = () => {
        cleanup();
        reject(new Error('Audio decode failed'));
      };
      audio.src = url;
    });
  }

  function chunkName(view, offset) {
    return String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
  }

  async function wavDuration(file) {
    const view = new DataView(await file.arrayBuffer());
    if (view.byteLength < 44 || chunkName(view, 0) !== 'RIFF' || chunkName(view, 8) !== 'WAVE') {
      throw new Error('Invalid WAV header');
    }
    const byteRate = view.getUint32(28, true);
    if (!byteRate) throw new Error('Invalid WAV byte rate');
    let offset = 12;
    while (offset + 8 <= view.byteLength) {
      const name = chunkName(view, offset);
      const size = view.getUint32(offset + 4, true);
      if (name === 'data') return size / byteRate;
      offset += 8 + size + (size % 2);
    }
    throw new Error('WAV data chunk not found');
  }

  async function audioDuration(file) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'wav' || /audio\/(?:wav|x-wav)/i.test(file.type)) {
      try { return await wavDuration(file); } catch (wavError) {}
    }
    try {
      return await mediaElementDuration(file);
    } catch (mediaError) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw mediaError;
      const context = new AudioContextClass();
      try {
        const decoded = await context.decodeAudioData(await file.arrayBuffer());
        if (!Number.isFinite(decoded.duration)) throw mediaError;
        return decoded.duration;
      } finally {
        context.close().catch(() => {});
      }
    }
  }

  function cleanName(name) {
    const withoutExtension = name.replace(/\.[^.]+$/, '').trim();
    return (withoutExtension || (isEnglish ? 'Custom sound' : 'Свой звук')).slice(0, 42);
  }

  function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function formatDuration(duration) {
    return `${duration.toFixed(duration < 1 ? 1 : 0)} s`;
  }

  function fileIsSupported(file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return file.type.startsWith('audio/') || allowedExtensions.includes(extension);
  }

  async function enforceHistoryLimit() {
    const records = (await getSounds()).sort((a, b) => b.createdAt - a.createdAt);
    const overflow = records.slice(MAX_HISTORY);
    await Promise.all(overflow.map(record => removeSound(record.id)));
    overflow.forEach(record => revokeSoundUrl(record.id));
  }

  async function storeUploadedSound(file) {
    if (!fileIsSupported(file)) throw new Error(text.wrongType);
    if (file.size > MAX_FILE_SIZE) throw new Error(text.tooLarge);
    const duration = await audioDuration(file);
    if (duration > MAX_DURATION) throw new Error(text.tooLong);

    const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await saveSound({
      id,
      name: cleanName(file.name),
      fileName: file.name.slice(0, 100),
      type: file.type || `audio/${file.name.split('.').pop()?.toLowerCase()}`,
      size: file.size,
      duration,
      createdAt: Date.now(),
      blob: file
    });
    await enforceHistoryLimit();
    return id;
  }

  async function handleUpload(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const id = await storeUploadedSound(file);
      saveSelectedSound(`custom:${id}`);
      await renderHistory();
      syncSelection();
      await playCustomSound(id, true);
      notify(text.saved);
    } catch (error) {
      console.warn('[WebDevGym] Custom sound upload failed', error);
      notify(error.message || text.readError);
    } finally {
      input.value = '';
    }
  }

  async function selectAiSoundFile(file) {
    try {
      const id = await storeUploadedSound(file);
      localStorage.setItem(AI_SOUND_KEY, `custom:${id}`);
      localStorage.setItem(AI_SOUND_ENABLED_KEY, '1');
      await renderHistory();
      await syncAiSoundOptions();
      syncAiControls();
      await playAiReplySound(true);
      notify(text.aiSaved);
    } catch (error) {
      console.warn('[WebDevGym] AI reply sound upload failed', error);
      notify(error.message || text.readError);
    }
  }

  async function handleAiUpload(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (file) await selectAiSoundFile(file);
    input.value = '';
  }

  function revokeSoundUrl(id) {
    const url = soundUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    soundUrls.delete(id);
  }

  async function soundUrl(id) {
    if (soundUrls.has(id)) return soundUrls.get(id);
    const record = await getSound(id);
    if (!record?.blob) return '';
    const url = URL.createObjectURL(record.blob);
    soundUrls.set(id, url);
    return url;
  }

  async function playStoredSound(id, volume, channel = 'click') {
    const url = await soundUrl(id);
    if (!url) return false;
    const previousAudio = channel === 'ai' ? currentAiAudio : currentClickAudio;
    if (previousAudio) {
      previousAudio.pause();
      previousAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    if (channel === 'ai') currentAiAudio = audio;
    else currentClickAudio = audio;
    audio.volume = volume;
    await audio.play().catch(() => {});
    return true;
  }

  async function playCustomSound(id, force = false) {
    if (!force && localStorage.getItem('clickSounds') !== '1') return;
    if (!await playStoredSound(id, soundVolume(), 'click')) {
      notify(text.unavailable);
    }
  }

  function aiTone(context, frequency, duration, gain, delay = 0) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.0001, gain), start + .012);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
  }

  async function playBuiltInAiSound(profile) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    aiAudioContext ||= new AudioContextClass();
    if (aiAudioContext.state === 'suspended') await aiAudioContext.resume().catch(() => {});
    const volume = aiSoundVolume();
    if (profile === 'arcade') {
      aiTone(aiAudioContext, 520, .08, volume * .08);
      aiTone(aiAudioContext, 780, .1, volume * .065, .075);
    } else if (profile === 'pop') {
      aiTone(aiAudioContext, 620, .09, volume * .1);
    } else if (profile === 'soft') {
      aiTone(aiAudioContext, 360, .16, volume * .065);
      aiTone(aiAudioContext, 480, .18, volume * .045, .06);
    } else {
      aiTone(aiAudioContext, 940, .13, volume * .07);
      aiTone(aiAudioContext, 1320, .15, volume * .045, .065);
    }
  }

  async function playAiReplySound(force = false) {
    if (!force && !aiSoundEnabled()) return;
    if (aiSoundVolume() === 0) return;
    const selected = selectedAiSound();
    if (selected.startsWith('custom:')) {
      const played = await playStoredSound(selected.slice(7), aiSoundVolume(), 'ai');
      if (played) return;
      notify(text.unavailable);
      return;
    }
    await playBuiltInAiSound(selectedAiSound());
  }

  function syncSelection() {
    const selected = selectedSound();
    const customSelected = selected.startsWith('custom:');
    document.querySelectorAll('[data-wdgp-sound]').forEach(button => {
      if (customSelected) {
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
      }
    });
    document.querySelectorAll('[data-wdgc-sound]').forEach(button => {
      const active = selected === `custom:${button.dataset.wdgcSound}`;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      const badge = button.querySelector('.wdgc-selected');
      if (badge) badge.hidden = !active;
    });
  }

  async function selectCustomSound(id) {
    saveSelectedSound(`custom:${id}`);
    syncSelection();
    await playCustomSound(id, true);
  }

  async function deleteCustomSound(id) {
    await removeSound(id);
    revokeSoundUrl(id);
    if (selectedSound() === `custom:${id}`) localStorage.setItem(SOUND_KEY, 'soft');
    if (selectedAiSound() === `custom:${id}`) localStorage.setItem(AI_SOUND_KEY, 'glass');
    await renderHistory();
    await syncAiSoundOptions();
    syncAiControls();
    syncSelection();
    notify(text.deleted);
  }

  function historyItem(record) {
    const item = document.createElement('div');
    item.className = 'wdgc-history-item';
    item.innerHTML = `
      <button type="button" class="wdgc-history-main" data-wdgc-sound="${record.id}" aria-pressed="false">
        <span class="wdgc-history-icon">${icon('tabler:music', 15)}</span>
        <span class="wdgc-history-copy">
          <strong></strong>
          <small>${formatDuration(record.duration)} · ${formatSize(record.size)}</small>
        </span>
        <span class="wdgc-selected" hidden>${text.selected}</span>
      </button>
      <button type="button" class="wdgc-icon-button" data-wdgc-preview="${record.id}" title="${text.preview}" aria-label="${text.preview}">${icon('tabler:player-play', 15)}</button>
      <button type="button" class="wdgc-icon-button danger" data-wdgc-delete="${record.id}" title="${text.remove}" aria-label="${text.remove}">${icon('tabler:trash', 15)}</button>`;
    item.querySelector('strong').textContent = record.name;
    item.querySelector('[data-wdgc-sound]').addEventListener('click', event => {
      event.stopPropagation();
      selectCustomSound(record.id);
    });
    item.querySelector('[data-wdgc-preview]').addEventListener('click', event => {
      event.stopPropagation();
      playCustomSound(record.id, true);
    });
    item.querySelector('[data-wdgc-delete]').addEventListener('click', event => {
      event.stopPropagation();
      deleteCustomSound(record.id);
    });
    return item;
  }

  async function renderHistory() {
    const list = document.getElementById('wdgcSoundHistory');
    if (!list) return;
    try {
      const records = (await getSounds()).sort((a, b) => b.createdAt - a.createdAt);
      const counter = document.querySelector('.wdgc-history-head span:last-child');
      if (counter) counter.textContent = `${records.length}/${MAX_HISTORY}`;
      list.replaceChildren();
      if (!records.length) {
        const empty = document.createElement('div');
        empty.className = 'wdgc-empty';
        empty.innerHTML = `${icon('tabler:music-off', 16)}<span>${text.empty}</span>`;
        list.appendChild(empty);
      } else {
        records.forEach(record => list.appendChild(historyItem(record)));
      }
      syncSelection();
      await syncAiSoundOptions(records);
    } catch (error) {
      list.textContent = text.readError;
    }
  }

  async function syncAiSoundOptions(records) {
    const select = document.getElementById('wdgcAiSoundSelect');
    if (!select) return;
    const sounds = records || await getSounds().catch(() => []);
    const selected = selectedAiSound();
    select.replaceChildren();
    aiProfiles.forEach(([value, label]) => select.add(new Option(label, value)));
    if (sounds.length) {
      const group = document.createElement('optgroup');
      group.label = isEnglish ? 'Your sounds' : 'Свои звуки';
      sounds.sort((a, b) => b.createdAt - a.createdAt).forEach(record => {
        group.appendChild(new Option(record.name, `custom:${record.id}`));
      });
      select.appendChild(group);
    }
    if (![...select.options].some(option => option.value === selected)) {
      localStorage.setItem(AI_SOUND_KEY, 'glass');
    }
    select.value = selectedAiSound();
  }

  function syncAiControls() {
    const toggle = document.getElementById('wdgcAiSoundToggle');
    const select = document.getElementById('wdgcAiSoundSelect');
    const range = document.getElementById('wdgcAiSoundVolume');
    const output = document.getElementById('wdgcAiSoundVolumeValue');
    const enabled = aiSoundEnabled();
    if (toggle) {
      toggle.classList.toggle('on', enabled);
      toggle.setAttribute('aria-pressed', String(enabled));
    }
    if (select) select.value = selectedAiSound();
    const volume = String(Math.round(aiSoundVolume() * 100));
    if (range) range.value = volume;
    if (output) output.textContent = `${volume}%`;
  }

  async function chooseDesktopAiSound(event) {
    const chooseFiles = window.webdevgymDesktop?.desktop?.chooseChatFiles;
    if (typeof chooseFiles !== 'function') return;
    event.preventDefault();
    try {
      const selected = await chooseFiles();
      const item = Array.isArray(selected) ? selected[0] : null;
      if (!item) return;
      const bytes = item.data instanceof Uint8Array ? item.data : new Uint8Array(item.data?.data || item.data || []);
      await selectAiSoundFile(new File([bytes], item.name, { type: item.type || '', lastModified: item.lastModified || Date.now() }));
    } catch (error) {
      notify(error.message || text.readError);
    }
  }

  function buildAiSoundPanel(parent) {
    if (document.getElementById('wdgcAiSoundPanel')) return;
    const panel = document.createElement('section');
    panel.id = 'wdgcAiSoundPanel';
    panel.className = 'wdgc-ai-panel';
    panel.innerHTML = `
      <div class="wdgc-heading">
        <div><strong>${text.aiTitle}</strong><small>${text.aiDescription}</small></div>
        <button type="button" class="wdgp-switch" id="wdgcAiSoundToggle" aria-label="${text.aiEnabled}" aria-pressed="true"></button>
      </div>
      <div class="wdgc-ai-controls">
        <label><span>${text.aiSound}</span><select id="wdgcAiSoundSelect"></select></label>
        <button type="button" class="wdgc-icon-button" id="wdgcAiSoundPreview" title="${text.aiPreview}" aria-label="${text.aiPreview}">${icon('tabler:player-play', 16)}</button>
        <label class="wdgc-upload" id="wdgcAiSoundUpload">${icon('tabler:upload', 15)}<span>${text.aiUpload}</span><input id="wdgcAiSoundInput" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm"></label>
      </div>
      <label class="wdgc-ai-volume" for="wdgcAiSoundVolume"><span>${text.aiVolume}</span><input id="wdgcAiSoundVolume" type="range" min="0" max="100" step="1" value="55"><output id="wdgcAiSoundVolumeValue">55%</output></label>`;
    parent.appendChild(panel);
    panel.querySelector('#wdgcAiSoundToggle').addEventListener('click', () => {
      localStorage.setItem(AI_SOUND_ENABLED_KEY, aiSoundEnabled() ? '0' : '1');
      syncAiControls();
      if (aiSoundEnabled()) playAiReplySound(true);
    });
    panel.querySelector('#wdgcAiSoundSelect').addEventListener('change', event => {
      localStorage.setItem(AI_SOUND_KEY, event.target.value);
      localStorage.setItem(AI_SOUND_ENABLED_KEY, '1');
      syncAiControls();
      playAiReplySound(true);
    });
    panel.querySelector('#wdgcAiSoundPreview').addEventListener('click', () => playAiReplySound(true));
    panel.querySelector('#wdgcAiSoundVolume').addEventListener('input', event => {
      localStorage.setItem(AI_SOUND_VOLUME_KEY, event.target.value);
      syncAiControls();
    });
    panel.querySelector('#wdgcAiSoundVolume').addEventListener('change', () => playAiReplySound(true));
    panel.querySelector('#wdgcAiSoundInput').addEventListener('change', handleAiUpload);
    panel.querySelector('#wdgcAiSoundUpload').addEventListener('click', chooseDesktopAiSound);
    syncAiSoundOptions().then(syncAiControls);
  }

  function buildCustomSoundPanel() {
    const parent = document.getElementById('wdgpSoundSection');
    if (!parent) return;
    if (document.getElementById('wdgcSoundPanel')) {
      buildAiSoundPanel(parent);
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'wdgcSoundPanel';
    panel.className = 'wdgc-panel';
    panel.innerHTML = `
      <div class="wdgc-heading">
        <div>
          <strong>${text.title}</strong>
          <small>${text.description}</small>
        </div>
        <label class="wdgc-upload">
          ${icon('tabler:upload', 15)}<span>${text.upload}</span>
          <input id="wdgcSoundInput" type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/aac,audio/webm,.mp3,.wav,.ogg,.m4a,.aac,.webm">
        </label>
      </div>
      <div class="wdgc-local-note">${icon('tabler:shield-lock', 13)} ${text.local}</div>
      <div id="wdgcSoundStatus" class="wdgc-status" role="status"></div>
      <div class="wdgc-history-head"><span>${text.history}</span><span>0/${MAX_HISTORY}</span></div>
      <div id="wdgcSoundHistory" class="wdgc-history"></div>`;
    parent.appendChild(panel);
    buildAiSoundPanel(parent);
    parent.querySelectorAll('[data-wdgp-sound]').forEach(button => {
      button.addEventListener('click', () => requestAnimationFrame(syncSelection));
    });
    panel.querySelector('#wdgcSoundInput').addEventListener('change', handleUpload);
    renderHistory().then(async () => {
      const records = await getSounds().catch(() => []);
      const counter = panel.querySelector('.wdgc-history-head span:last-child');
      if (counter) counter.textContent = `${records.length}/${MAX_HISTORY}`;
    });

    parent.addEventListener('click', () => requestAnimationFrame(syncSelection));
    parent.addEventListener('input', () => requestAnimationFrame(syncSelection));
  }

  function installPlaybackOverride() {
    window.playClickSound = function () {
      const selected = selectedSound();
      if (selected.startsWith('custom:')) {
        playCustomSound(selected.slice(7));
        return;
      }
      if (window.WebDevGymSoundProfiles?.play) {
        window.WebDevGymSoundProfiles.play();
        return;
      }
      if (typeof originalPlayClickSound === 'function') originalPlayClickSound();
    };
  }

  function init() {
    installPlaybackOverride();
    buildCustomSoundPanel();
    document.addEventListener('click', event => {
      if (event.target.closest('.wdgp-reset')) window.setTimeout(syncSelection, 200);
    });
    syncSelection();
  }

  async function completeAiReply({ title, body } = {}) {
    await playAiReplySound();
    const desktop = window.webdevgymDesktop?.desktop;
    if (desktop?.notify && document.hidden) {
      const cleanBody = String(body || '').replace(/\s+/g, ' ').trim().slice(0, 180);
      await desktop.notify(title || text.aiNotificationTitle, cleanBody || text.aiDescription).catch(() => {});
    }
  }

  window.WebDevGymAiNotifications = Object.freeze({
    complete: completeAiReply,
    preview: () => playAiReplySound(true)
  });

  window.addEventListener('storage', event => {
    if ([SOUND_KEY, 'clickSounds', 'wdg_click_volume_v2'].includes(event.key)) syncSelection();
    if ([AI_SOUND_KEY, AI_SOUND_ENABLED_KEY, AI_SOUND_VOLUME_KEY].includes(event.key)) {
      syncAiSoundOptions().then(syncAiControls);
    }
  });
  window.addEventListener('beforeunload', () => {
    soundUrls.forEach(url => URL.revokeObjectURL(url));
    soundUrls.clear();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
