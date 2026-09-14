(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const MODE_KEY = 'wdgr_light_effects_v1';
  const LAST_RUN_KEY = 'wdgr_last_optimized_at_v1';
  const PAGE_ROOT_SELECTOR = [
    '.wrap',
    '.wdgn-overview',
    '.wdgn-sections-page',
    '.wdgf-feature-page',
    '.wdgt-page',
    '.wdg-growth-page',
    '.wdgr-settings-view',
    '.wdgr-ai-main'
  ].join(',');
  const watchedRoots = new WeakSet();
  let runtimeSyncQueued = false;
  const copy = isEnglish ? {
    title: 'Quick optimization',
    description: 'Refresh app resources, remove old PWA caches and release temporary interface work without touching your progress or projects.',
    cache: 'Temporary cache',
    cacheCopy: 'Only outdated WebDevGym app shells are removed.',
    effects: 'Light effects',
    effectsCopy: 'Reduces blur, shadows and graph inertia on slower devices.',
    action: 'Optimize',
    running: 'Optimizing...',
    ready: 'Ready',
    never: 'Optimization has not been run yet.',
    done: 'Done',
    deleted: 'old caches removed',
    stable: 'resources refreshed',
    protected: 'Progress, projects, settings, media, chats and tokens stay untouched.',
    failed: 'Could not finish every step. Your data was not changed.',
    last: 'Last run'
  } : {
    title: 'Быстрая оптимизация',
    description: 'Обновляет ресурсы приложения, удаляет старые PWA-кэши и освобождает временную работу интерфейса, не затрагивая прогресс и проекты.',
    cache: 'Временный кэш',
    cacheCopy: 'Удаляются только устаревшие оболочки WebDevGym.',
    effects: 'Лёгкие эффекты',
    effectsCopy: 'Уменьшает размытие, тени и инерцию графа на слабых устройствах.',
    action: 'Оптимизировать',
    running: 'Оптимизация...',
    ready: 'Готово',
    never: 'Оптимизация ещё не запускалась.',
    done: 'Готово',
    deleted: 'старых кэшей удалено',
    stable: 'ресурсы обновлены',
    protected: 'Прогресс, проекты, настройки, медиа, чаты и токены останутся на месте.',
    failed: 'Не удалось завершить все этапы. Твои данные не изменены.',
    last: 'Последний запуск'
  };

  function icon(name, size = 18) {
    return `<iconify-icon icon="${name}" width="${size}" height="${size}" aria-hidden="true"></iconify-icon>`;
  }

  function readBoolean(key) {
    try { return localStorage.getItem(key) === '1'; } catch (_) { return false; }
  }

  function read(key) {
    try { return localStorage.getItem(key) || ''; } catch (_) { return ''; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function applyLightEffects(enabled) {
    document.body.classList.toggle('wdgr-light-effects', enabled);
    write(MODE_KEY, enabled ? '1' : '0');
    document.dispatchEvent(new CustomEvent('webdevgym:performance-mode', { detail: { enabled } }));
  }

  function prepareMedia(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    root.querySelectorAll?.('img:not([data-wdgr-media-ready])').forEach(image => {
      image.dataset.wdgrMediaReady = '1';
      image.loading = 'lazy';
      image.decoding = 'async';
    });
    root.querySelectorAll?.('iframe:not([data-wdgr-media-ready])').forEach(frame => {
      frame.dataset.wdgrMediaReady = '1';
      frame.loading = 'lazy';
    });
  }

  function rootIsVisible(root) {
    if (!root?.isConnected || root.hidden) return false;
    const style = getComputedStyle(root);
    return style.display !== 'none' && style.visibility !== 'hidden' && root.getClientRects().length > 0;
  }

  function syncRuntimeResources() {
    runtimeSyncQueued = false;
    prepareMedia(document);
    document.querySelectorAll('video, audio').forEach(media => {
      const root = media.closest(PAGE_ROOT_SELECTOR);
      if ((document.hidden || (root && !rootIsVisible(root))) && !media.paused) media.pause();
    });
  }

  function scheduleRuntimeSync() {
    if (runtimeSyncQueued) return;
    runtimeSyncQueued = true;
    const run = () => window.requestAnimationFrame(syncRuntimeResources);
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 160 });
    else window.setTimeout(run, 70);
  }

  function watchPageRoot(root) {
    if (!(root instanceof Element) || watchedRoots.has(root)) return;
    watchedRoots.add(root);
    new MutationObserver(scheduleRuntimeSync).observe(root, {
      attributes: true,
      attributeFilter: ['class', 'hidden']
    });
  }

  function initRuntimeOptimization() {
    document.querySelectorAll(PAGE_ROOT_SELECTOR).forEach(watchPageRoot);
    prepareMedia(document);
    new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches(PAGE_ROOT_SELECTOR)) watchPageRoot(node);
        node.querySelectorAll?.(PAGE_ROOT_SELECTOR).forEach(watchPageRoot);
        prepareMedia(node);
      }));
      scheduleRuntimeSync();
    }).observe(document.body, { childList: true });
    new MutationObserver(scheduleRuntimeSync).observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    document.addEventListener('click', scheduleRuntimeSync, true);
    document.addEventListener('visibilitychange', scheduleRuntimeSync);
    document.addEventListener('webdevgym:feature-opened', scheduleRuntimeSync);
    scheduleRuntimeSync();
  }

  function formatLastRun(value) {
    if (!value) return copy.never;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return copy.never;
    return `${copy.last}: ${date.toLocaleString(isEnglish ? 'en-US' : 'ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}`;
  }

  function askServiceWorkerToOptimize() {
    return new Promise(resolve => {
      const controller = navigator.serviceWorker?.controller;
      if (!controller || typeof MessageChannel === 'undefined') {
        resolve({ deleted: 0, updated: false });
        return;
      }

      const channel = new MessageChannel();
      const timeout = window.setTimeout(() => resolve({ deleted: 0, updated: false }), 2600);
      channel.port1.onmessage = event => {
        window.clearTimeout(timeout);
        resolve(event.data || { deleted: 0, updated: false });
      };
      controller.postMessage({ type: 'WEBDEVGYM_OPTIMIZE' }, [channel.port2]);
    });
  }

  async function optimize(button, status, badge) {
    if (button.disabled) return;
    button.disabled = true;
    button.classList.add('is-running');
    button.querySelector('span').textContent = copy.running;
    badge.textContent = copy.running;
    status.textContent = copy.protected;

    try {
      document.querySelector('.wdg-context-menu')?.classList.remove('open');
      document.querySelectorAll('img:not([loading])').forEach(image => {
        image.loading = 'lazy';
        image.decoding = 'async';
      });
      document.querySelectorAll('iframe:not([loading])').forEach(frame => { frame.loading = 'lazy'; });

      const registrations = await navigator.serviceWorker?.getRegistrations?.() || [];
      await Promise.allSettled(registrations.map(registration => registration.update()));
      const result = await askServiceWorkerToOptimize();
      document.dispatchEvent(new CustomEvent('webdevgym:optimize', { detail: result }));

      const now = new Date().toISOString();
      write(LAST_RUN_KEY, now);
      const deleted = Number(result.deleted) || 0;
      status.textContent = `${copy.done}: ${deleted} ${copy.deleted}; ${copy.stable}. ${copy.protected}`;
      badge.textContent = copy.done;
      badge.dataset.state = 'done';
      const last = document.getElementById('wdgrOptimizerLastRun');
      if (last) last.textContent = formatLastRun(now);
    } catch (error) {
      console.warn('[WebDevGym] Optimization was incomplete:', error);
      status.textContent = copy.failed;
      badge.textContent = copy.ready;
    } finally {
      button.disabled = false;
      button.classList.remove('is-running');
      button.querySelector('span').textContent = copy.action;
    }
  }

  function mount() {
    if (document.getElementById('wdgrOptimizerCard')) return true;
    const page = document.querySelector('[data-settings-page="data"]');
    if (!page) return false;

    const card = document.createElement('section');
    card.id = 'wdgrOptimizerCard';
    card.className = 'wdgr-settings-section wdgr-optimizer-card';
    card.innerHTML = `
      <div class="wdgr-optimizer-head">
        <div class="wdgr-optimizer-title">${icon('tabler:bolt', 19)}<div><h4>${copy.title}</h4><p>${copy.description}</p></div></div>
        <span class="wdgr-optimizer-badge" id="wdgrOptimizerBadge">${copy.ready}</span>
      </div>
      <div class="wdgr-optimizer-options">
        <div class="wdgr-optimizer-option">${icon('tabler:database-cog', 20)}<div><strong>${copy.cache}</strong><small>${copy.cacheCopy}</small></div></div>
        <label class="wdgr-optimizer-option wdgr-optimizer-toggle" for="wdgrLightEffects">
          ${icon('tabler:feather', 20)}
          <span><strong>${copy.effects}</strong><small>${copy.effectsCopy}</small></span>
          <input id="wdgrLightEffects" type="checkbox">
          <i aria-hidden="true"></i>
        </label>
      </div>
      <div class="wdgr-optimizer-actions">
        <div><p id="wdgrOptimizerStatus" role="status">${copy.protected}</p><small id="wdgrOptimizerLastRun">${formatLastRun(read(LAST_RUN_KEY))}</small></div>
        <button type="button" class="wdgr-button primary wdgr-optimizer-button" id="wdgrOptimizeNow">${icon('tabler:sparkles', 18)}<span>${copy.action}</span></button>
      </div>`;

    const firstSection = page.querySelector('.wdgr-settings-section');
    firstSection?.insertAdjacentElement('afterend', card);

    const toggle = card.querySelector('#wdgrLightEffects');
    toggle.checked = readBoolean(MODE_KEY);
    toggle.addEventListener('change', () => applyLightEffects(toggle.checked));
    card.querySelector('#wdgrOptimizeNow').addEventListener('click', event => {
      optimize(event.currentTarget, card.querySelector('#wdgrOptimizerStatus'), card.querySelector('#wdgrOptimizerBadge'));
    });
    return true;
  }

  function init() {
    applyLightEffects(readBoolean(MODE_KEY));
    initRuntimeOptimization();
    if (mount()) return;
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
