(function () {
  'use strict';

  const UI_FONT_KEY = 'wdgr_interface_font_v1';
  const CODE_FONT_KEY = 'wdgr_code_font_v1';
  const DATABASE_NAME = 'webdevgym-personalization';
  const DATABASE_VERSION = 3;
  const DATABASE_STORE = 'assets';
  const BACKGROUND_KEY = 'customBackground';
  const loadedFonts = new Set();

  const fontSpecs = {
    'Inter': 'Inter:wght@400;500;600;700',
    'Manrope': 'Manrope:wght@400;500;600;700',
    'Onest': 'Onest:wght@400;500;600;700',
    'Rubik': 'Rubik:wght@400;500;600;700',
    'IBM Plex Sans': 'IBM+Plex+Sans:wght@400;500;600;700',
    'JetBrains Mono': 'JetBrains+Mono:wght@400;500;600;700',
    'Fira Code': 'Fira+Code:wght@400;500;600;700',
    'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;500;600;700',
    'Roboto Mono': 'Roboto+Mono:wght@400;500;600;700'
  };

  function read(key, fallback = '') {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function fontUrl(spec) {
    return `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
  }

  function appendFontStylesheet(spec, id) {
    if (!spec || loadedFonts.has(spec)) return;
    loadedFonts.add(spec);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl(spec);
    if (id) link.id = id;
    document.head.appendChild(link);
  }

  function loadFont(font) {
    const spec = fontSpecs[font] || String(font || '').trim().replace(/\s+/g, '+');
    appendFontStylesheet(spec, fontSpecs[font] ? `wdg-font-${font.replace(/\W+/g, '-').toLowerCase()}` : '');
  }

  const interfaceFont = read(UI_FONT_KEY, 'Inter');
  const codeFont = read(CODE_FONT_KEY, 'JetBrains Mono');
  document.documentElement.style.setProperty('--wdgr-interface-font', `'${interfaceFont}'`);
  document.documentElement.style.setProperty('--wdgr-code-font', `'${codeFont}'`);
  loadFont(interfaceFont);
  loadFont(codeFont);

  function applyBackgroundVariables() {
    if (!document.body) return false;
    const opacity = Math.max(0, Math.min(100, Number(read('customBgOpacity', '32')) || 32));
    const positionX = Math.max(0, Math.min(100, Number(read('customBgPosX', '50')) || 50));
    const positionY = Math.max(0, Math.min(100, Number(read('customBgPosY', '50')) || 50));
    const size = read('customBgSize', 'cover');
    document.body.style.setProperty('--custom-bg-opacity', String(opacity / 100));
    document.body.style.setProperty('--custom-bg-x', `${positionX}%`);
    document.body.style.setProperty('--custom-bg-y', `${positionY}%`);
    document.body.style.setProperty('--custom-bg-size', size === 'contain' ? 'contain' : 'cover');
    return true;
  }

  function commitBackground(source) {
    if (!source || !document.body) return false;
    document.body.style.setProperty('--custom-bg', `url("${source}")`);
    document.body.classList.add('has-custom-bg');
    applyBackgroundVariables();
    performance.mark?.('wdg-background-applied');
    return true;
  }

  function applyWhenBodyExists(source) {
    if (commitBackground(source)) return;
    const observer = new MutationObserver(() => {
      if (!commitBackground(source)) return;
      observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function loadBackgroundBlob() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DATABASE_STORE)) {
          request.result.createObjectStore(DATABASE_STORE);
        }
        if (!request.result.objectStoreNames.contains('sounds')) {
          const sounds = request.result.createObjectStore('sounds', { keyPath: 'id' });
          sounds.createIndex('createdAt', 'createdAt');
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction(DATABASE_STORE, 'readonly');
        const getRequest = transaction.objectStore(DATABASE_STORE).get(BACKGROUND_KEY);
        getRequest.onsuccess = () => resolve(getRequest.result instanceof Blob ? getRequest.result : null);
        getRequest.onerror = () => reject(getRequest.error);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => database.close();
      };
    });
  }

  const boot = {
    backgroundSource: '',
    loadFont,
    setBackgroundSource(source) {
      this.backgroundSource = source || '';
    },
    clearBackgroundSource() {
      this.backgroundSource = '';
    }
  };

  boot.backgroundPromise = loadBackgroundBlob()
    .then(blob => {
      let source = '';
      if (blob) source = URL.createObjectURL(blob);
      if (!source) {
        const legacy = read('customBg');
        if (legacy.startsWith('data:image')) source = legacy;
      }
      if (source) {
        boot.backgroundSource = source;
        applyWhenBodyExists(source);
      } else {
        applyBackgroundVariables();
      }
      return source;
    })
    .catch(() => {
      applyBackgroundVariables();
      return '';
    });

  function loadVisibleFontCards(section) {
    if (!section || section.dataset.fontLoaderReady === '1') return;
    section.dataset.fontLoaderReady = '1';
    const cards = Array.from(section.querySelectorAll('.font-card'));
    const loadCard = card => {
      const preview = card.querySelector('.font-preview-big, .font-preview-small');
      const font = preview?.style.fontFamily?.split(',')[0]?.replace(/["']/g, '').trim();
      if (font) loadFont(font);
    };

    if (!('IntersectionObserver' in window)) {
      cards.forEach(loadCard);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadCard(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });
    cards.forEach(card => observer.observe(card));
  }

  function prepareFontLibrary() {
    const section = document.getElementById('sec-fonts');
    if (section) loadVisibleFontCards(section);
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[onclick*="fonts"], [data-section="fonts"], [data-tab="fonts"]');
    if (trigger) requestAnimationFrame(prepareFontLibrary);
  });

  window.WebDevGymCriticalBoot = boot;
})();
