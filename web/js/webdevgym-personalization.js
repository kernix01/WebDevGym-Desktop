(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const copy = isEnglish ? {
    appearance: 'Appearance',
    appearanceCopy: 'Choose a color mode that is comfortable for you.',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    sounds: 'Click sound',
    soundsCopy: 'Pick a sound and adjust its volume.',
    enabled: 'Interface sounds',
    enabledCopy: 'Play a short sound for buttons and controls',
    volume: 'Volume',
    comfort: 'Comfort',
    reducedMotion: 'Reduced motion',
    reducedMotionCopy: 'Disable most animations and smooth scrolling',
    compact: 'Compact mode',
    compactCopy: 'Fit more learning content on the screen',
    reset: 'Reset appearance',
    resetCopy: 'Theme, sounds, background and interface density',
    backgroundEmpty: 'No custom background selected',
    backgroundReady: 'Background saved locally in this browser',
    backgroundLoading: 'Optimizing image...',
    backgroundError: 'Could not save this image',
    backgroundTooLarge: 'Choose an image smaller than 20 MB',
    backgroundType: 'Use JPG, PNG, WebP or AVIF',
    resetDone: 'Appearance settings reset',
    themeChanged: 'Theme updated',
    soundChanged: 'Click sound selected',
    settings: 'Settings'
  } : {
    appearance: 'Оформление',
    appearanceCopy: 'Выбери комфортный режим отображения.',
    dark: 'Тёмная',
    light: 'Светлая',
    system: 'Как в системе',
    sounds: 'Звук клика',
    soundsCopy: 'Выбери звук и настрой его громкость.',
    enabled: 'Звуки интерфейса',
    enabledCopy: 'Короткий звук для кнопок и элементов управления',
    volume: 'Громкость',
    comfort: 'Комфорт',
    reducedMotion: 'Меньше анимаций',
    reducedMotionCopy: 'Отключить большинство анимаций и плавную прокрутку',
    compact: 'Компактный режим',
    compactCopy: 'Больше учебного контента помещается на экране',
    reset: 'Сбросить оформление',
    resetCopy: 'Тема, звуки, фон и плотность интерфейса',
    backgroundEmpty: 'Свой фон не выбран',
    backgroundReady: 'Фон сохранён локально в этом браузере',
    backgroundLoading: 'Оптимизирую изображение...',
    backgroundError: 'Не удалось сохранить это изображение',
    backgroundTooLarge: 'Выбери изображение меньше 20 МБ',
    backgroundType: 'Поддерживаются JPG, PNG, WebP и AVIF',
    resetDone: 'Настройки оформления сброшены',
    themeChanged: 'Тема изменена',
    soundChanged: 'Звук клика выбран',
    settings: 'Настройки'
  };

  const keys = {
    theme: 'wdg_theme_mode_v2',
    sound: 'wdg_click_sound_v2',
    volume: 'wdg_click_volume_v2',
    reducedMotion: 'wdg_reduce_motion_v2',
    compact: 'wdg_compact_mode_v2',
    backgroundMeta: 'wdg_custom_bg_meta_v2'
  };

  const soundProfiles = isEnglish ? [
    ['soft', 'Soft', 'Calm', 'tabler:feather'],
    ['pop', 'Pop', 'Light', 'tabler:bubble'],
    ['glass', 'Glass', 'Clear', 'tabler:diamond'],
    ['key', 'Key', 'Precise', 'tabler:keyboard'],
    ['arcade', 'Arcade', 'Digital', 'tabler:device-gamepad-2'],
    ['wood', 'Wood', 'Warm', 'tabler:box']
  ] : [
    ['soft', 'Мягкий', 'Спокойный', 'tabler:feather'],
    ['pop', 'Поп', 'Лёгкий', 'tabler:bubble'],
    ['glass', 'Стекло', 'Звонкий', 'tabler:diamond'],
    ['key', 'Клавиша', 'Точный', 'tabler:keyboard'],
    ['arcade', 'Аркада', 'Цифровой', 'tabler:device-gamepad-2'],
    ['wood', 'Дерево', 'Тёплый', 'tabler:box']
  ];

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let audioContext = null;
  let activeBackgroundUrl = '';
  let toastTimer = 0;

  function read(key, fallback = '') {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      // Preferences still work for the current tab when storage is unavailable.
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  }

  function icon(name, size = 16) {
    return `<iconify-icon icon="${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }

    let toast = document.querySelector('.wdgp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'wdgp-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function savedThemeMode() {
    const current = read(keys.theme);
    if (['dark', 'light', 'system'].includes(current)) return current;
    const legacy = read('darkMode');
    if (legacy === '0') return 'light';
    return 'dark';
  }

  function applyColorMode(mode, persist = true) {
    const safeMode = ['dark', 'light', 'system'].includes(mode) ? mode : 'dark';
    const dark = safeMode === 'dark' || (safeMode === 'system' && systemTheme.matches);
    document.body.classList.toggle('dark', dark);
    document.body.dataset.themeMode = safeMode;
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';

    if (persist) {
      write(keys.theme, safeMode);
      write('darkMode', dark ? '1' : '0');
    }
    syncThemeControls(safeMode, dark);
  }

  function syncThemeControls(mode = savedThemeMode(), dark = document.body.classList.contains('dark')) {
    document.querySelectorAll('[data-wdgp-theme]').forEach(button => {
      const active = button.dataset.wdgpTheme === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const oldButton = document.getElementById('darkBtn');
    if (oldButton) oldButton.textContent = dark ? '☀️' : '🌙';
    const modernButton = document.getElementById('wdgThemeBtn');
    const modernIcon = modernButton?.querySelector('iconify-icon');
    if (modernIcon) modernIcon.setAttribute('icon', dark ? 'tabler:sun' : 'tabler:moon');
    if (modernButton) modernButton.title = dark ? copy.light : copy.dark;
  }

  function toggleTheme() {
    applyColorMode(document.body.classList.contains('dark') ? 'light' : 'dark');
  }

  function soundEnabled() {
    return read('clickSounds', '0') === '1';
  }

  function selectedSound() {
    const selected = read(keys.sound, 'soft');
    return soundProfiles.some(([id]) => id === selected) ? selected : 'soft';
  }

  function soundVolume() {
    const value = Number(read(keys.volume, '38'));
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 38;
  }

  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function tone(context, options) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + (options.delay || 0);
    const duration = options.duration || .06;
    const level = (options.gain || .045) * (soundVolume() / 100);

    oscillator.type = options.type || 'sine';
    oscillator.frequency.setValueAtTime(options.from, start);
    oscillator.frequency.exponentialRampToValueAtTime(options.to || options.from, start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, level), start + .006);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .01);
  }

  function playSound(profile = selectedSound(), force = false) {
    if (!force && !soundEnabled()) return;
    if (soundVolume() === 0) return;
    try {
      const context = getAudioContext();
      if (!context) return;
      if (profile === 'pop') {
        tone(context, { from: 260, to: 560, duration: .07, gain: .05, type: 'sine' });
      } else if (profile === 'glass') {
        tone(context, { from: 1040, to: 780, duration: .11, gain: .032, type: 'sine' });
        tone(context, { from: 1560, to: 1180, duration: .08, gain: .014, delay: .008, type: 'sine' });
      } else if (profile === 'key') {
        tone(context, { from: 310, to: 210, duration: .045, gain: .055, type: 'triangle' });
      } else if (profile === 'arcade') {
        tone(context, { from: 520, to: 690, duration: .045, gain: .026, type: 'square' });
        tone(context, { from: 690, to: 860, duration: .05, gain: .022, delay: .045, type: 'square' });
      } else if (profile === 'wood') {
        tone(context, { from: 190, to: 90, duration: .075, gain: .065, type: 'triangle' });
      } else {
        tone(context, { from: 470, to: 300, duration: .055, gain: .042, type: 'sine' });
      }
    } catch (error) {}
  }

  function syncSoundControls() {
    const enabled = soundEnabled();
    const profile = selectedSound();
    const volume = soundVolume();
    document.querySelectorAll('[data-wdgp-sound]').forEach(button => {
      const active = button.dataset.wdgpSound === profile;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-wdgp-toggle="sound"]').forEach(button => {
      button.classList.toggle('on', enabled);
      button.setAttribute('aria-pressed', String(enabled));
    });
    const range = document.getElementById('wdgpSoundVolume');
    const output = document.getElementById('wdgpSoundVolumeValue');
    if (range) range.value = String(volume);
    if (output) output.value = `${volume}%`;
  }

  function applyComfortPreferences() {
    const reducedMotion = read(keys.reducedMotion, '0') === '1';
    const compact = read(keys.compact, '0') === '1';
    document.body.classList.toggle('wdgp-reduced-motion', reducedMotion);
    document.body.classList.toggle('wdgp-compact', compact);
    syncToggle('motion', reducedMotion);
    syncToggle('compact', compact);
  }

  function syncToggle(name, active) {
    document.querySelectorAll(`[data-wdgp-toggle="${name}"]`).forEach(button => {
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function buildThemeSection() {
    const section = document.createElement('section');
    section.className = 'wdgp-section';
    section.id = 'wdgpThemeSection';
    section.innerHTML = `
      <div class="wdgp-section-head">
        <h3 class="wdgp-section-title">${copy.appearance}</h3>
      </div>
      <p class="wdgp-section-copy">${copy.appearanceCopy}</p>
      <div class="wdgp-segmented" role="group" aria-label="${copy.appearance}">
        <button type="button" data-wdgp-theme="dark">${icon('tabler:moon')}<span>${copy.dark}</span></button>
        <button type="button" data-wdgp-theme="light">${icon('tabler:sun')}<span>${copy.light}</span></button>
        <button type="button" data-wdgp-theme="system">${icon('tabler:device-desktop')}<span>${copy.system}</span></button>
      </div>`;
    section.addEventListener('click', event => {
      const button = event.target.closest('[data-wdgp-theme]');
      if (!button) return;
      applyColorMode(button.dataset.wdgpTheme);
      notify(copy.themeChanged);
    });
    return section;
  }

  function buildSoundSection() {
    const section = document.createElement('section');
    section.className = 'wdgp-section';
    section.id = 'wdgpSoundSection';
    section.innerHTML = `
      <div class="wdgp-section-head">
        <h3 class="wdgp-section-title">${copy.sounds}</h3>
        <button type="button" class="wdgp-switch" data-wdgp-toggle="sound" aria-label="${copy.enabled}"></button>
      </div>
      <p class="wdgp-section-copy">${copy.soundsCopy}</p>
      <div class="wdgp-sound-grid">
        ${soundProfiles.map(([id, title, description, iconName]) => `
          <button type="button" class="wdgp-sound" data-wdgp-sound="${id}">
            <span class="wdgp-sound-icon">${icon(iconName, 15)}</span>
            <span><strong>${title}</strong><small>${description}</small></span>
          </button>`).join('')}
      </div>
      <label class="wdgp-range-row" for="wdgpSoundVolume">
        <span>${copy.volume}</span>
        <input id="wdgpSoundVolume" type="range" min="0" max="100" step="1" value="38">
        <output id="wdgpSoundVolumeValue" for="wdgpSoundVolume">38%</output>
      </label>`;

    section.querySelector('[data-wdgp-toggle="sound"]').addEventListener('click', event => {
      event.stopPropagation();
      const enabled = !soundEnabled();
      write('clickSounds', enabled ? '1' : '0');
      syncSoundControls();
      if (enabled) playSound(selectedSound(), true);
    });
    section.querySelectorAll('[data-wdgp-sound]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        write(keys.sound, button.dataset.wdgpSound);
        write('clickSounds', '1');
        syncSoundControls();
        playSound(button.dataset.wdgpSound, true);
        notify(copy.soundChanged);
      });
    });
    const range = section.querySelector('#wdgpSoundVolume');
    range.addEventListener('input', () => {
      write(keys.volume, range.value);
      syncSoundControls();
    });
    range.addEventListener('change', () => playSound(selectedSound(), true));
    return section;
  }

  function toggleRow(name, title, description, iconName) {
    return `
      <div class="wdgp-toggle-row">
        <div class="wdgp-toggle-copy">
          <strong>${icon(iconName, 14)} ${title}</strong>
          <small>${description}</small>
        </div>
        <button type="button" class="wdgp-switch" data-wdgp-toggle="${name}" aria-label="${title}"></button>
      </div>`;
  }

  function buildComfortSection() {
    const section = document.createElement('section');
    section.className = 'wdgp-section';
    section.id = 'wdgpComfortSection';
    section.innerHTML = `
      <div class="wdgp-section-head"><h3 class="wdgp-section-title">${copy.comfort}</h3></div>
      ${toggleRow('motion', copy.reducedMotion, copy.reducedMotionCopy, 'tabler:player-pause')}
      ${toggleRow('compact', copy.compact, copy.compactCopy, 'tabler:layout-rows')}`;
    section.querySelector('[data-wdgp-toggle="motion"]').addEventListener('click', () => {
      const active = read(keys.reducedMotion, '0') !== '1';
      write(keys.reducedMotion, active ? '1' : '0');
      applyComfortPreferences();
    });
    section.querySelector('[data-wdgp-toggle="compact"]').addEventListener('click', () => {
      const active = read(keys.compact, '0') !== '1';
      write(keys.compact, active ? '1' : '0');
      applyComfortPreferences();
    });
    return section;
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is unavailable'));
        return;
      }
      const request = indexedDB.open('webdevgym-personalization', 3);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('assets')) {
          request.result.createObjectStore('assets');
        }
        if (!request.result.objectStoreNames.contains('sounds')) {
          const sounds = request.result.createObjectStore('sounds', { keyPath: 'id' });
          sounds.createIndex('createdAt', 'createdAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function databaseAction(mode, action) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('assets', mode);
      const store = transaction.objectStore('assets');
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

  function saveBackgroundBlob(blob) {
    return databaseAction('readwrite', store => store.put(blob, 'customBackground'));
  }

  function loadBackgroundBlob() {
    return databaseAction('readonly', store => store.get('customBackground'));
  }

  function deleteBackgroundBlob() {
    return databaseAction('readwrite', store => store.delete('customBackground'));
  }

  function loadImage(file) {
    if ('createImageBitmap' in window) return createImageBitmap(file);
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image decode failed'));
      };
      image.src = url;
    });
  }

  async function optimizeImage(file) {
    const image = await loadImage(file);
    const sourceWidth = image.width;
    const sourceHeight = image.height;
    const scale = Math.min(1, 2560 / sourceWidth, 1600 / sourceHeight);
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#0b0f17';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    if (typeof image.close === 'function') image.close();

    const toBlob = (type, quality) => new Promise(resolve => canvas.toBlob(resolve, type, quality));
    return (await toBlob('image/webp', .86)) || (await toBlob('image/jpeg', .88));
  }

  function dataUrlFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  function applyBackgroundSource(source) {
    if (activeBackgroundUrl.startsWith('blob:')) URL.revokeObjectURL(activeBackgroundUrl);
    activeBackgroundUrl = source;
    window.WebDevGymCriticalBoot?.setBackgroundSource(source);
    document.body.style.setProperty('--custom-bg', `url("${source}")`);
    document.body.classList.add('has-custom-bg');
    if (!read('customBgOpacity')) {
      write('customBgOpacity', '32');
      if (typeof window.setBgOpacity === 'function') window.setBgOpacity(32);
    }
    updateBackgroundStatus(true);
  }

  function updateBackgroundStatus(active, errorMessage = '') {
    const status = document.getElementById('wdgpBgStatus');
    if (!status) return;
    status.classList.toggle('success', active && !errorMessage);
    status.classList.toggle('error', Boolean(errorMessage));
    status.textContent = errorMessage || (active ? copy.backgroundReady : copy.backgroundEmpty);
  }

  async function setCustomBackground(event) {
    const input = event?.target || document.getElementById('bgInput');
    const file = input?.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      updateBackgroundStatus(false, copy.backgroundType);
      notify(copy.backgroundType);
      input.value = '';
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      updateBackgroundStatus(false, copy.backgroundTooLarge);
      notify(copy.backgroundTooLarge);
      input.value = '';
      return;
    }

    updateBackgroundStatus(false, copy.backgroundLoading);
    try {
      const blob = await optimizeImage(file);
      const objectUrl = URL.createObjectURL(blob);
      applyBackgroundSource(objectUrl);
      try {
        await saveBackgroundBlob(blob);
        write(keys.backgroundMeta, JSON.stringify({ name: file.name, type: blob.type, size: blob.size }));
        remove('customBg');
      } catch (databaseError) {
        const dataUrl = await dataUrlFromBlob(blob);
        write('customBg', dataUrl);
      }
      updateBackgroundStatus(true);
    } catch (error) {
      console.error('WebDevGym background error:', error);
      updateBackgroundStatus(false, copy.backgroundError);
      notify(copy.backgroundError);
    } finally {
      input.value = '';
    }
  }

  async function restoreCustomBackground() {
    const criticalBoot = window.WebDevGymCriticalBoot;
    if (criticalBoot?.backgroundPromise) {
      const earlySource = await criticalBoot.backgroundPromise;
      if (earlySource) {
        applyBackgroundSource(earlySource);
        return;
      }
    }

    try {
      const blob = await loadBackgroundBlob();
      if (blob instanceof Blob) {
        applyBackgroundSource(URL.createObjectURL(blob));
        return;
      }
    } catch (error) {}

    const legacy = read('customBg');
    if (legacy.startsWith('data:image')) {
      applyBackgroundSource(legacy);
      return;
    }
    updateBackgroundStatus(false);
  }

  async function clearCustomBackground() {
    if (activeBackgroundUrl.startsWith('blob:')) URL.revokeObjectURL(activeBackgroundUrl);
    activeBackgroundUrl = '';
    window.WebDevGymCriticalBoot?.clearBackgroundSource();
    document.body.classList.remove('has-custom-bg');
    document.body.style.removeProperty('--custom-bg');
    remove('customBg');
    remove(keys.backgroundMeta);
    try {
      await deleteBackgroundBlob();
    } catch (error) {}
    updateBackgroundStatus(false);
  }

  function addBackgroundStatus(panel) {
    const input = panel.querySelector('#bgInput');
    if (!input) return;
    input.accept = 'image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif';
    const row = input.closest('.settings-mini-row');
    if (!row || document.getElementById('wdgpBgStatus')) return;
    const status = document.createElement('div');
    status.id = 'wdgpBgStatus';
    status.className = 'wdgp-bg-status';
    status.textContent = copy.backgroundEmpty;
    row.insertAdjacentElement('afterend', status);
  }

  async function resetAppearance() {
    [keys.theme, keys.sound, keys.volume, keys.reducedMotion, keys.compact,
      'darkMode', 'clickSounds', 'themeC1', 'themeC2', 'customBgOpacity',
      'customBgPosX', 'customBgPosY', 'customBgSize'].forEach(remove);
    if (typeof window.resetTheme === 'function') window.resetTheme();
    await clearCustomBackground();
    applyColorMode('dark');
    write(keys.sound, 'soft');
    write(keys.volume, '38');
    write('clickSounds', '0');
    applyComfortPreferences();
    syncSoundControls();
    notify(copy.resetDone);
  }

  function buildResetSection() {
    const section = document.createElement('section');
    section.className = 'wdgp-section';
    section.innerHTML = `
      <button type="button" class="wdgp-reset">
        ${icon('tabler:restore', 15)}
        <span><strong>${copy.reset}</strong><small>${copy.resetCopy}</small></span>
      </button>`;
    section.querySelector('button').addEventListener('click', resetAppearance);
    return section;
  }

  function keepPanelOnScreen(panel) {
    requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      if (rect.right < 20 || rect.left > window.innerWidth - 20 || rect.bottom < 20 || rect.top > window.innerHeight - 20) {
        panel.style.left = '';
        panel.style.top = '';
        panel.style.right = '12px';
        panel.style.bottom = '';
      }
    });
  }

  function setupSettingsPanel() {
    const panel = document.getElementById('settingsMini');
    if (!panel || panel.dataset.wdgpReady === '1') return;
    panel.dataset.wdgpReady = '1';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', copy.settings);

    const handle = panel.querySelector('#settingsDragHandle');
    const oldAppearanceLabel = handle?.nextElementSibling;
    if (oldAppearanceLabel?.classList.contains('settings-mini-label')) oldAppearanceLabel.remove();
    const themeSection = buildThemeSection();
    handle?.insertAdjacentElement('afterend', themeSection);

    const oldSoundRow = panel.querySelector('#soundToggle')?.closest('.settings-mini-row');
    const soundSection = buildSoundSection();
    if (oldSoundRow) oldSoundRow.replaceWith(soundSection);
    else themeSection.insertAdjacentElement('afterend', soundSection);

    soundSection.insertAdjacentElement('afterend', buildComfortSection());
    addBackgroundStatus(panel);
    panel.appendChild(buildResetSection());
    keepPanelOnScreen(panel);
  }

  function toggleSettingsPanel() {
    const event = window.event;
    if (event?.stopPropagation) event.stopPropagation();
    const panel = document.getElementById('settingsMini');
    if (!panel) return;
    panel.classList.toggle('show');
    if (panel.classList.contains('show')) keepPanelOnScreen(panel);
  }

  function handleNestedControlClick(event) {
    const exactSelector = 'input[type="checkbox"], button, .item, .tab, .book-lang-btn, .font-lang-btn, .font-filter-btn';
    if (event.target.matches(exactSelector)) return;
    if (event.target.closest('button, [role="button"], .item, .tab, .wdg-nav-btn, .wdg-library-item')) {
      playSound();
    }
  }

  function init() {
    setupSettingsPanel();
    applyColorMode(savedThemeMode(), false);
    applyComfortPreferences();
    syncSoundControls();
    restoreCustomBackground();

    document.addEventListener('click', handleNestedControlClick);
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        toggleSettingsPanel();
      }
    });
  }

  window.toggleDark = toggleTheme;
  window.playClickSound = () => playSound();
  window.setCustomBg = setCustomBackground;
  window.clearCustomBg = clearCustomBackground;
  window.restoreCustomBg = restoreCustomBackground;
  window.toggleSettings = toggleSettingsPanel;

  systemTheme.addEventListener?.('change', () => {
    if (savedThemeMode() === 'system') applyColorMode('system', false);
  });
  window.addEventListener('storage', event => {
    if ([keys.theme, 'darkMode'].includes(event.key)) applyColorMode(savedThemeMode(), false);
    if ([keys.sound, keys.volume, 'clickSounds'].includes(event.key)) syncSoundControls();
    if ([keys.reducedMotion, keys.compact].includes(event.key)) applyComfortPreferences();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
