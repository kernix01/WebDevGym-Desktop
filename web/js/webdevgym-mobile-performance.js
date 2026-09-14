(function () {
  'use strict';

  const runtime = window.WebDevGymRuntime;
  const media = window.matchMedia('(max-width: 720px)');
  let observer = null;
  let scheduled = false;

  function prepareMedia(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    root.querySelectorAll?.('img:not([data-wdg-media-ready])').forEach(image => {
      image.dataset.wdgMediaReady = '1';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.fetchPriority = image.closest('.wdg-topbar, .wdg-sidebar') ? 'high' : 'low';
    });
    root.querySelectorAll?.('iframe:not([data-wdg-media-ready])').forEach(frame => {
      frame.dataset.wdgMediaReady = '1';
      frame.loading = 'lazy';
    });
  }

  function optimizeVisiblePage() {
    scheduled = false;
    if (!media.matches) return;
    document.body.classList.add('wdg-mobile-performance');
    prepareMedia(document);
    document.querySelectorAll('.section:not(.active) iframe, .wdgf-feature-page[hidden] iframe').forEach(frame => {
      frame.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('.section.active iframe, .wdgf-feature-page:not([hidden]) iframe').forEach(frame => {
      frame.removeAttribute('aria-hidden');
    });
  }

  function schedule() {
    if (scheduled || !media.matches) return;
    scheduled = true;
    const run = () => requestAnimationFrame(optimizeVisiblePage);
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout:180 });
    else setTimeout(run, 40);
  }

  function setMode() {
    document.body.classList.toggle('wdg-mobile-performance', media.matches);
    if (media.matches) schedule();
  }

  function init() {
    setMode();
    media.addEventListener?.('change', setMode);
    observer = new MutationObserver(mutations => {
      if (!media.matches) return;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) prepareMedia(node);
        });
      }
      schedule();
    });
    observer.observe(document.body, { childList:true, subtree:true });
    document.addEventListener('webdevgym:feature-opened', schedule);
    document.addEventListener('webdevgym:curriculum-rendered', schedule);
    runtime?.emit?.('mobile-performance-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
