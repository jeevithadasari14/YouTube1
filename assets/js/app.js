/* ==========================================================================
   app.js - tiny bootstrapper. Renders shared chrome, then invokes the
   controller registered for the current page (window.Pages[<body data-page>]).
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  const page = document.body.dataset.page || 'home';
  const active = document.body.dataset.active || page;

  // Apply stored preferences before rendering.
  try {
    if (Store.getPref('reducedMotion')) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    }
  } catch (e) { /* store unavailable on some static pages */ }

  if (document.body.dataset.chrome !== 'off') {
    try { UI.setupChrome(active); }
    catch (e) { console.error('[app] chrome failed', e); }
  }

  const init = window.Pages && window.Pages[page];
  if (typeof init === 'function') {
    try { init(); }
    catch (e) { console.error('[app] page init failed:', page, e); }
  } else {
    console.warn('[app] no controller for page:', page);
  }
});
