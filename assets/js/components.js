/* ==========================================================================
   components.js - shared chrome: icons, header, sidebar, cards, toasts.
   ========================================================================== */
window.UI = (function () {
  'use strict';
  const el = U.el, qs = U.qs;

  /* ---------------------------------------------------------------- Icons */
  const P = {
    menu: 'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z',
    home: 'M4 10v10h6v-6h4v6h6V10L12 3 4 10z',
    homeOutline: 'M4 21V10l8-7 8 7v11h-6v-6h-4v6H4z',
    fire: 'M12 2c1 3-2 4-2 7a2 2 0 004 0c0-1 0-1.5-.5-2.5C16 8 18 10.5 18 14a6 6 0 11-12 0c0-4 3-6 3-9 1 1 2 2 3-3z',
    subs: 'M10 18v-6l5 3-5 3zm7-15H7v1h10V3zm3 3H4v1h16V6zm2 3H2v12h20V9zM3 10h18v10H3V10z',
    library: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z',
    history: 'M13 3a9 9 0 00-9 9H1l4 4 4-4H6a7 7 0 117 7 6.9 6.9 0 01-4.9-2l-1.4 1.4A9 9 0 1013 3zm-1 5v5l4 2 .8-1.3-3-1.7V8H12z',
    playlist: 'M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2zm15 0v6l5-3-5-3z',
    watchLater: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6l5 3 1-1.7-4-2.3V7zm8 5a8 8 0 11-16 0 8 8 0 0116 0z',
    liked: 'M1 21h4V9H1v12zM23 10a2 2 0 00-2-2h-6.3l1-4.6.03-.3a1.7 1.7 0 00-.5-1.2L14.2 1 7.6 7.6A2 2 0 007 9v10a2 2 0 002 2h9a2 2 0 001.8-1.2l3-7c.1-.2.2-.5.2-.8v-2z',
    dislike: 'M1 3h4v12H1V3zm22 8a2 2 0 01-2 2h-6.3l1 4.6.03.3a1.7 1.7 0 01-.5 1.2L14.2 23l-6.6-6.6A2 2 0 017 15V5a2 2 0 012-2h9a2 2 0 011.8 1.2l3 7c.1.2.2.5.2.8v2z',
    yourVideos: 'M4 4h16v12H4V4zm0 14h16v2H4v-2zm3-11v6l5-3-5-3z',
    studio: 'M3 3h18v4H3V3zm0 6h8v12H3V9zm10 0h8v12h-8V9z',
    search: 'M15.5 14h-.8l-.3-.3a6.5 6.5 0 10-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z',
    mic: 'M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.9V22h2v-3.1A7 7 0 0019 12h-2z',
    create: 'M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-9H7a2 2 0 00-2 2v5H3v2h2v7a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H7v-7h10v7zm0-9H7V6h10v5z',
    bell: 'M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 00-5-5.9V4a1 1 0 00-2 0v1.1A6 6 0 006 11v5l-2 2v1h16v-1l-2-2z',
    settings: 'M19.4 13a7.8 7.8 0 000-2l2-1.6-2-3.4-2.4 1a8 8 0 00-1.7-1L15 2.5h-4l-.3 2.5a8 8 0 00-1.7 1l-2.4-1-2 3.4L6.6 11a7.8 7.8 0 000 2l-2 1.6 2 3.4 2.4-1a8 8 0 001.7 1l.3 2.5h4l.3-2.5a8 8 0 001.7-1l2.4 1 2-3.4-2-1.6zM12 15a3 3 0 110-6 3 3 0 010 6z',
    help: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 17h-2v-2h2v2zm2.1-7.8l-.9.9c-.7.7-1.2 1.3-1.2 2.9h-2c0-1.7.7-2.7 1.5-3.5l1.2-1.3a2 2 0 00-1.7-3.2 2 2 0 00-2 2H8a4 4 0 118 0c0 .9-.4 1.6-1 2.2z',
    feedback: 'M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z',
    play: 'M8 5v14l11-7z',
    pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
    next: 'M6 18l8.5-6L6 6v12zM16 6h2v12h-2V6z',
    prev: 'M18 6v12l-8.5-6L18 6zM6 6h2v12H6V6z',
    volume: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a6.5 6.5 0 010 12.6v2.1a8.5 8.5 0 000-16.8z',
    volumeLow: 'M7 9v6h4l5 5V4l-5 5H7z',
    mute: 'M16.5 12a4.5 4.5 0 00-2.5-4v2.2l2.5 2.5c0-.2 0-.5 0-.7zM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5A8.4 8.4 0 0020.5 12a8.5 8.5 0 00-6.5-8.3v2.1A6.5 6.5 0 0119 12zM4.3 3L3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.4.9-2.3 1.1v2.1c1.3-.3 2.5-.8 3.5-1.6l2 2L21 19.7 4.3 3zM12 4L9.9 6.1 12 8.2V4z',
    fullscreen: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
    fullscreenExit: 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
    theater: 'M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z',
    gear: 'M19.4 13a7.8 7.8 0 000-2l2-1.6-2-3.4-2.4 1a8 8 0 00-1.7-1L15 2.5h-4l-.3 2.5a8 8 0 00-1.7 1l-2.4-1-2 3.4L6.6 11a7.8 7.8 0 000 2l-2 1.6 2 3.4 2.4-1a8 8 0 001.7 1l.3 2.5h4l.3-2.5a8 8 0 001.7-1l2.4 1 2-3.4-2-1.6zM12 15a3 3 0 110-6 3 3 0 010 6z',
    cc: 'M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm6 0h-1.5v-.5h-2v3h2V13H17v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z',
    like: 'M1 21h4V9H1v12zM23 10a2 2 0 00-2-2h-6.3l1-4.6.03-.3a1.7 1.7 0 00-.5-1.2L14.2 1 7.6 7.6A2 2 0 007 9v10a2 2 0 002 2h9a2 2 0 001.8-1.2l3-7c.1-.2.2-.5.2-.8v-2z',
    share: 'M14 9V5l9 7-9 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z',
    save: 'M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2zm0 15l-5-2.2L7 18V5h10v13z',
    saveFilled: 'M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z',
    more: 'M12 8a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100 4 2 2 0 000-4z',
    sort: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z',
    close: 'M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z',
    sun: 'M12 7a5 5 0 100 10 5 5 0 000-10zm0-3l1.5 3h-3L12 4zm0 16l1.5-3h-3L12 20zM4 12l3-1.5v3L4 12zm16 0l-3-1.5v3L20 12zM6.3 6.3l2.1 2.1-1.4 1.4-2.1-2.1 1.4-1.4zm11.4 11.4l-2.1-2.1 1.4-1.4 2.1 2.1-1.4 1.4zm0-11.4l-1.4-1.4 2.1-2.1 1.4 1.4-2.1 2.1zM6.3 17.7l1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1z',
    moon: 'M12 3a9 9 0 109 9 7 7 0 01-9-9z',
    upload: 'M12 3l5 5h-3v6h-4V8H7l5-5zM5 18h14v2H5v-2z',
    chevronDown: 'M7 10l5 5 5-5z',
    chevronRight: 'M10 6l6 6-6 6-1.4-1.4L13.2 12 8.6 7.4 10 6z',
    back: 'M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z',
    check: 'M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4z',
    verified: 'M12 2l2.4 2.1 3.2-.3.6 3.1 2.8 1.6-1.5 2.8 1.5 2.8-2.8 1.6-.6 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.6-3.1L3 15.5 4.5 12.7 3 9.9l2.8-1.6.6-3.1 3.2.3L12 2zm-1.2 13.2l6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4 3.6 3.6z',
    trash: 'M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    edit: 'M3 17.2V21h3.8L18 9.8 14.2 6 3 17.2zM20.7 7.3a1 1 0 000-1.4l-2.6-2.6a1 1 0 00-1.4 0L15 5l3.8 3.8 1.9-1.5z',
    fireSmall: 'M12 2c1 3-2 4-2 7a2 2 0 004 0c0-1 0-1.5-.5-2.5C16 8 18 10.5 18 14a6 6 0 11-12 0c0-4 3-6 3-9 1 1 2 2 3-3z',
    film: 'M18 4v1h-2V4H8v1H6V4H4v16h2v-1h2v1h8v-1h2v1h2V4h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z',
    eye: 'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-6a2 2 0 100 4 2 2 0 000-4z'
  };

  function icon(name, size, cls) {
    const d = P[name] || P.play;
    const s = size || 24;
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="currentColor" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  /* ---------------------------------------------------------------- Toast */
  let toastHost;
  function toast(message, actionLabel, actionFn) {
    if (!toastHost) {
      toastHost = el('div', { class: 'toast-host', id: 'toastHost' });
      document.body.appendChild(toastHost);
    }
    const node = el('div', { class: 'toast' });
    node.appendChild(el('span', { text: message }));
    if (actionLabel) {
      node.appendChild(el('button', { text: actionLabel, onclick: function () { actionFn && actionFn(); node.remove(); } }));
    }
    toastHost.appendChild(node);
    setTimeout(function () {
      node.style.transition = 'opacity .3s, transform .3s';
      node.style.opacity = '0';
      node.style.transform = 'translateY(8px)';
      setTimeout(function () { node.remove(); }, 320);
    }, actionLabel ? 6000 : 3200);
  }

  /* ---------------------------------------------------------------- Modal */
  function openModal(opts) {
    const back = el('div', { class: 'modal-backdrop' });
    const modal = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' });
    const head = el('div', { class: 'modal__head' }, [
      el('h3', { text: opts.title || '' }),
      el('button', { class: 'icon-btn', html: icon('close'), 'aria-label': 'Close', onclick: close })
    ]);
    const body = el('div', { class: 'modal__body' });
    body.appendChild(opts.content);
    modal.appendChild(head);
    modal.appendChild(body);
    if (opts.footer) {
      modal.appendChild(el('div', { class: 'modal__foot' }, opts.footer));
    }
    back.appendChild(modal);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.body.appendChild(back);
    requestAnimationFrame(function () { back.classList.add('is-open'); });

    function close() {
      back.classList.remove('is-open');
      setTimeout(function () { back.remove(); }, 160);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    return { close: close, back: back, modal: modal, body: body };
  }

  function confirmDialog(title, message, confirmLabel) {
    return new Promise(function (resolve) {
      let ref;
      const content = el('p', { text: message, style: 'margin:0;color:var(--text-secondary)' });
      ref = openModal({
        title: title,
        content: content,
        footer: [
          el('button', { class: 'btn btn--ghost', text: 'Cancel', onclick: function () { ref.close(); resolve(false); } }),
          el('button', { class: 'btn btn--filled', text: confirmLabel || 'Confirm', onclick: function () { ref.close(); resolve(true); } })
        ]
      });
    });
  }

  /* ------------------------------------------------------------- Sidebar  */
  const MAIN_LINKS = [
    { label: 'Home', icon: 'home', href: 'index.html', key: 'home' },
    { label: 'Trending', icon: 'fire', href: 'index.html?feed=trending', key: 'trending' },
    { label: 'Subscriptions', icon: 'subs', href: 'subscriptions.html', key: 'subscriptions' }
  ];
  const YOU_LINKS = [
    { label: 'History', icon: 'history', href: 'library.html#history', key: 'history' },
    { label: 'Playlists', icon: 'playlist', href: 'library.html#playlists', key: 'playlists' },
    { label: 'Your videos', icon: 'studio', href: 'studio.html', key: 'videos' },
    { label: 'Watch later', icon: 'watchLater', href: 'library.html#watchlater', key: 'watchlater' },
    { label: 'Liked videos', icon: 'liked', href: 'library.html#liked', key: 'liked' }
  ];
  const EXPLORE = ['Music', 'Gaming', 'Programming', 'Science', 'Technology', 'Travel', 'Food', 'News', 'Design'];

  function linkNode(item, active) {
    const a = el('a', {
      class: 'sidebar__item' + (active === item.key ? ' is-active' : ''),
      href: item.href
    });
    a.appendChild(el('span', { class: 'sidebar__icon', html: icon(item.icon, 24) }));
    a.appendChild(el('span', { class: 'sidebar__label', text: item.label }));
    return a;
  }

  function buildSidebar(active) {
    const box = el('aside', { class: 'sidebar', id: 'appSidebar' });

    MAIN_LINKS.forEach(function (i) { box.appendChild(linkNode(i, active)); });
    box.appendChild(el('div', { class: 'sidebar__divider' }));

    box.appendChild(el('div', { class: 'sidebar__title', text: 'You' }));
    YOU_LINKS.forEach(function (i) { box.appendChild(linkNode(i, active)); });

    // Subscriptions (dynamic)
    const subs = Store.get('subscriptions');
    const channels = API._db.channels.filter(function (c) { return subs.indexOf(c.id) !== -1; });
    box.appendChild(el('div', { class: 'sidebar__divider' }));
    box.appendChild(el('div', { class: 'sidebar__title', text: 'Subscriptions' }));
    if (channels.length) {
      channels.forEach(function (c) {
        const a = el('a', { class: 'sidebar__item', href: 'channel.html?id=' + c.id });
        a.appendChild(el('img', { class: 'avatar avatar--sm', src: U.avatarDataUri(c.name), alt: '' }));
        a.appendChild(el('span', { class: 'sidebar__label', text: c.name }));
        box.appendChild(a);
      });
    } else {
      const a = el('a', { class: 'sidebar__item', href: 'subscriptions.html' });
      a.appendChild(el('span', { class: 'sidebar__icon', html: icon('subs', 24) }));
      a.appendChild(el('span', { class: 'sidebar__label', text: 'Find channels' }));
      box.appendChild(a);
    }

    box.appendChild(el('div', { class: 'sidebar__divider' }));
    box.appendChild(el('div', { class: 'sidebar__title', text: 'Explore' }));
    EXPLORE.forEach(function (cat) {
      const a = el('a', { class: 'sidebar__item', href: 'index.html?category=' + encodeURIComponent(cat) });
      a.appendChild(el('span', { class: 'sidebar__icon', html: icon('fireSmall', 24) }));
      a.appendChild(el('span', { class: 'sidebar__label', text: cat }));
      box.appendChild(a);
    });

    box.appendChild(el('div', { class: 'sidebar__divider' }));
    box.appendChild(el('div', { class: 'sidebar__title', text: 'More from YClone' }));
    [['Studio', 'studio', 'studio.html'],
     ['Settings', 'settings', 'settings.html'],
     ['Help', 'help', 'help.html'],
     ['Send feedback', 'feedback', 'feedback.html'],
     ['About', 'film', 'about.html']].forEach(function (row) {
      const a = el('a', { class: 'sidebar__item', href: row[2] });
      a.appendChild(el('span', { class: 'sidebar__icon', html: icon(row[1], 24) }));
      a.appendChild(el('span', { class: 'sidebar__label', text: row[0] }));
      box.appendChild(a);
    });

    return box;
  }

  /* -------------------------------------------------------------- Header  */
  function buildHeader(active) {
    const header = el('header', { class: 'header', id: 'appHeader' });

    /* start */
    const start = el('div', { class: 'header__start' });
    const menuBtn = el('button', { class: 'icon-btn', html: icon('menu'), 'aria-label': 'Toggle sidebar' });
    menuBtn.addEventListener('click', function () {
      Store.set('sidebarOpen', !document.body.classList.contains('sidebar-open'));
      document.body.classList.toggle('sidebar-open');
    });
    const logo = el('a', { class: 'logo', href: 'index.html' });
    logo.innerHTML = '<span class="logo__mark">' + icon('play', 14) + '</span>' +
      '<span class="logo__word">YClone</span><span class="logo__badge">DEMO</span>';
    start.appendChild(menuBtn);
    start.appendChild(logo);

    /* center */
    const center = el('div', { class: 'header__center' });
    const form = el('form', { class: 'search', role: 'search' });
    const inputWrap = el('div', { class: 'search__input-wrap' });
    const input = el('input', {
      class: 'search__input', type: 'search', placeholder: 'Search', 'aria-label': 'Search',
      value: U.param('q') || ''
    });
    input.autocomplete = 'off';
    const clearBtn = el('button', { type: 'button', class: 'search__clear hidden', html: icon('close', 20), 'aria-label': 'Clear' });
    const searchBtn = el('button', { type: 'submit', class: 'search__btn', html: icon('search'), 'aria-label': 'Search' });
    const micBtn = el('button', { type: 'button', class: 'icon-btn', html: icon('mic'), 'aria-label': 'Search with your voice', title: 'Search with your voice' });

    function syncClear() { clearBtn.classList.toggle('hidden', !input.value); }
    input.addEventListener('input', syncClear);
    clearBtn.addEventListener('click', function () { input.value = ''; syncClear(); input.focus(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) { input.focus(); return; }
      Store.rememberSearch(q);
      location.href = 'results.html?q=' + encodeURIComponent(q);
    });
    micBtn.addEventListener('click', function () {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        UI.openModal({
          title: 'Voice search',
          content: el('p', {
            class: 'muted',
            text: 'This browser does not support the Web Speech API. Type your search in the box above instead.'
          })
        });
        return;
      }
      try {
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        micBtn.style.color = 'var(--brand)';
        toast('Listening…');
        rec.onresult = function (e) {
          const t = e.results[0][0].transcript;
          input.value = t; syncClear();
          Store.rememberSearch(t);
          location.href = 'results.html?q=' + encodeURIComponent(t);
        };
        rec.onerror = function () {
          micBtn.style.color = '';
          toast('Voice search could not start. Check microphone permissions.');
        };
        rec.onend = function () { micBtn.style.color = ''; };
        rec.start();
      } catch (err) {
        micBtn.style.color = '';
        toast('Voice search is not available right now.');
      }
    });

    inputWrap.appendChild(input);
    inputWrap.appendChild(clearBtn);
    form.appendChild(inputWrap);
    form.appendChild(searchBtn);
    center.appendChild(form);
    syncClear();

    /* end */
    const end = el('div', { class: 'header__end' });

    const mobileSearch = el('button', { class: 'icon-btn search-mobile-btn', html: icon('search'), 'aria-label': 'Search' });
    mobileSearch.addEventListener('click', function () {
      document.body.classList.toggle('search-open');
      if (document.body.classList.contains('search-open')) input.focus();
    });

    // Create menu
    const createWrap = el('div', { class: 'user-menu' });
    const createBtn = el('button', { class: 'icon-btn', html: icon('create'), 'aria-label': 'Create', title: 'Create' });
    const createMenu = el('div', { class: 'menu-pop', style: 'min-width:230px' });
    createMenu.appendChild(el('div', { class: 'menu-pop__head' }, [el('strong', { text: 'Create' })]));
    [
      ['Upload video', 'upload', function () { location.href = 'studio.html#upload'; }],
      ['Go live', 'fireSmall', function () { location.href = 'studio.html#golive'; }],
      ['Create playlist', 'playlist', function () { openPlaylistModal(); }]
    ].forEach(function (it) {
      const b = el('button', { class: 'menu-pop__item' });
      b.appendChild(el('span', { class: 'sidebar__icon', html: icon(it[1], 22) }));
      b.appendChild(el('span', { text: it[0] }));
      b.addEventListener('click', function () { closeAllPops(); it[2](); });
      createMenu.appendChild(b);
    });
    createBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeAllPops(createMenu);
      createMenu.classList.toggle('is-open');
    });
    createWrap.appendChild(createBtn);
    createWrap.appendChild(createMenu);

    // Notifications
    const bellBtn = el('button', { class: 'icon-btn', html: icon('bell'), 'aria-label': 'Notifications', title: 'Notifications' });
    const bellWrap = el('div', { class: 'user-menu' });
    const notif = el('div', { class: 'menu-pop', style: 'width:380px;max-width:calc(100vw - 24px)' });
    const notifHead = el('div', { class: 'menu-pop__head', style: 'justify-content:space-between' });
    notifHead.appendChild(el('strong', { text: 'Notifications' }));
    const markAll = el('button', { class: 'header-pill', style: 'height:28px;font-size:12px', text: 'Mark all read' });
    markAll.addEventListener('click', function (e) {
      e.stopPropagation();
      API.markAllNotificationsRead().then(function () {
        closeAllPops();
        toast('All notifications marked as read.');
      });
    });
    notifHead.appendChild(markAll);
    notif.appendChild(notifHead);
    const notifList = el('div', { style: 'max-height:60vh;overflow:auto' });
    notif.appendChild(notifList);
    const seeAll = el('button', { class: 'menu-pop__item', style: 'justify-content:center;font-weight:500' });
    seeAll.appendChild(el('span', { text: 'See all notifications' }));
    seeAll.addEventListener('click', function () { location.href = 'notifications.html'; });
    notif.appendChild(seeAll);

    let notifLoaded = false;
    bellBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeAllPops(notif);
      const open = !notif.classList.contains('is-open');
      notif.classList.toggle('is-open', open);
      if (open && !notifLoaded) {
        notifLoaded = true;
        notifList.innerHTML = '<div style="padding:16px"><div class="skeleton sk-line" style="width:80%"></div><div class="skeleton sk-line" style="width:60%"></div></div>';
        API.getNotifications().then(function (res) {
          notifList.innerHTML = '';
          if (!res.items.length) { notifList.appendChild(el('div', { class: 'muted', style: 'padding:16px', text: 'No notifications yet.' })); return; }
          res.items.slice(0, 6).forEach(function (n) { notifList.appendChild(notificationItem(n)); });
        });
      }
    });
    bellWrap.appendChild(bellBtn);
    bellWrap.appendChild(notif);

    const userWrap = el('div', { class: 'user-menu' });
    const user = Store.get('user');
    const avatarBtn = el('button', { class: 'icon-btn avatar-btn', 'aria-label': 'Account' });
    avatarBtn.appendChild(el('img', {
      class: 'avatar avatar--md', src: U.avatarDataUri(user ? user.name : 'Guest User'), alt: ''
    }));
    const userMenu = el('div', { class: 'menu-pop' });
    userMenu.appendChild(buildUserMenu(user));
    avatarBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeAllPops(userMenu);
      userMenu.classList.toggle('is-open');
    });
    userWrap.appendChild(avatarBtn);
    userWrap.appendChild(userMenu);

    end.appendChild(mobileSearch);
    end.appendChild(createWrap);
    end.appendChild(bellWrap);
    end.appendChild(userWrap);

    header.appendChild(start);
    header.appendChild(center);
    header.appendChild(end);
    return header;
  }

  function notificationItem(n) {
    const row = el('a', { class: 'notif-item', href: 'watch.html?v=' + n.videoId });
    row.appendChild(el('img', { class: 'avatar avatar--md', src: n.avatar, alt: '' }));
    const body = el('div', { class: 'grow', style: 'min-width:0' });
    body.appendChild(el('div', { html: '<strong>' + U.escapeHtml(n.channelName) + '</strong> ' + U.escapeHtml(n.text) }));
    body.appendChild(el('div', { class: 'muted notif-item__title', text: n.videoTitle }));
    body.appendChild(el('div', { class: 'muted', style: 'font-size:12px;margin-top:2px', text: U.timeAgo(n.at) }));
    row.appendChild(body);
    row.appendChild(U.imgWithFallback(n.thumbUrl, n.thumbFallback, { class: 'notif-item__thumb', alt: '' }));
    return row;
  }

  function openPlaylistModal() {
    const input = el('input', { class: 'input', placeholder: 'Playlist name', maxlength: '80' });
    const msg = el('div', { class: 'help', style: 'color:var(--brand);min-height:16px' });
    const content = el('div');
    content.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Name' }), input]));
    content.appendChild(msg);
    let ref;
    const create = el('button', {
      class: 'btn btn--filled', text: 'Create',
      onclick: function () {
        API.createPlaylist(input.value).then(function (pl) {
          ref.close();
          toast('Playlist “' + pl.title + '” created.', 'Open', function () {
            location.href = 'playlist.html?id=' + pl.id;
          });
        }).catch(function (err) { msg.textContent = err.message; });
      }
    });
    ref = UI.openModal({ title: 'Create playlist', content: content, footer: [create] });
    setTimeout(function () { input.focus(); }, 50);
  }

  function buildUserMenu(user) {
    const wrap = el('div');
    const head = el('div', { class: 'menu-pop__head' });
    head.appendChild(el('img', { class: 'avatar avatar--lg', src: U.avatarDataUri(user ? user.name : 'Guest User'), alt: '' }));
    const info = el('div');
    info.appendChild(el('strong', { text: user ? user.name : 'Guest' }));
    info.appendChild(el('span', { text: user ? user.email : 'Sign in to like, comment and subscribe' }));
    head.appendChild(info);
    if (!user) {
      const signin = el('a', { class: 'menu-pop__item', href: 'login.html' });
      signin.appendChild(el('span', { class: 'sidebar__icon', html: icon('home', 22) }));
      signin.appendChild(el('span', { text: 'Sign in' }));
      wrap.appendChild(head);
      wrap.appendChild(signin);
      return wrap;
    }
    wrap.appendChild(head);
    wrap.appendChild(el('div', { class: 'menu-pop__divider' }));
    const items = [
      ['Your channel', 'home', 'channel.html?id=codecraft'],
      ['YClone Studio', 'studio', 'studio.html'],
      ['Switch appearance', 'moon', '#theme'],
      ['Settings', 'settings', 'settings.html'],
      ['Help & feedback', 'help', 'help.html'],
      ['Sign out', 'back', '#logout']
    ];
    items.forEach(function (it) {
      const b = el('button', { class: 'menu-pop__item' });
      b.appendChild(el('span', { class: 'sidebar__icon', html: icon(it[1], 22) }));
      b.appendChild(el('span', { text: it[0] }));
      if (it[2] === '#theme') {
        b.addEventListener('click', function () { toggleTheme(); toast('Switched to ' + Store.get('theme') + ' mode.'); });
      } else if (it[2] === '#logout') {
        b.addEventListener('click', function () {
          API.logout().then(function () {
            toast('Signed out.');
            setTimeout(function () { location.href = 'index.html'; }, 400);
          });
        });
      } else {
        b.addEventListener('click', function () { location.href = it[2]; });
      }
      wrap.appendChild(b);
    });
    return wrap;
  }

  function toggleTheme() {
    Store.setTheme(Store.get('theme') === 'dark' ? 'light' : 'dark');
  }

  function closeAllPops(except) {
    U.qsa('.menu-pop.is-open').forEach(function (p) { if (p !== except) p.classList.remove('is-open'); });
  }
  document.addEventListener('click', function () { closeAllPops(); });

  /* ---------------------------------------------------------- Video cards */
  function avatarEl(video, size) {
    return U.imgWithFallback(
      video.thumb ? video.avatar : U.avatarDataUri(video.channelName || '?'),
      U.avatarDataUri(video.channelName || '?'),
      { class: 'avatar ' + (size || 'avatar--md') }
    );
  }

  function thumbEl(video, cls) {
    const wrap = el('div', { class: cls || 'v-card__thumb' });
    wrap.appendChild(U.imgWithFallback(video.thumbUrl, video.thumbFallback, { alt: video.title }));
    if (video.ownerUpload && video.thumbnailUrl) {
      const img = wrap.querySelector('img');
      img.src = video.thumbnailUrl;
    }
    const prog = Store.get('history').find(function (h) { return h.videoId === video.id; });
    if (prog && prog.progress > 0.02 && prog.progress < 0.97) {
      wrap.appendChild(el('div', { class: 'v-card__progress' }, [
        el('span', { style: 'width:' + Math.round(prog.progress * 100) + '%' })
      ]));
    }
    if (video.duration) {
      wrap.appendChild(el('div', { class: 'v-card__duration', text: U.formatDuration(video.duration) }));
    }
    if (video.category === 'Live' || (video.visibility === 'live')) {
      wrap.appendChild(el('div', { class: 'v-card__badges' }, [el('span', { class: 'v-badge', text: 'LIVE' })]));
    }
    return wrap;
  }

  function verifiedIcon(size) {
    return '<span class="verified">' + icon('verified', size || 14) + '</span>';
  }

  // Default (grid) card.
  function videoCard(video, opts) {
    opts = opts || {};
    const card = el('a', { class: 'v-card', href: 'watch.html?v=' + video.id, 'aria-label': video.title });
    card.appendChild(thumbEl(video));
    const body = el('div', { class: 'v-card__body' });
    const avLink = el('span', { class: 'v-card__avatar' });
    avLink.appendChild(avatarEl(video));
    body.appendChild(avLink);
    const info = el('div', { class: 'v-card__info' });
    info.appendChild(el('div', { class: 'v-card__title', text: video.title }));
    const ch = el('div', { class: 'v-card__channel muted' });
    ch.appendChild(el('span', { text: video.channelName }));
    if (video.channel && video.channel.verified) ch.insertAdjacentHTML('beforeend', verifiedIcon(12));
    info.appendChild(ch);
    info.appendChild(el('div', {
      class: 'v-card__stats muted',
      text: U.formatViews(video.views) + ' views · ' + U.timeAgo(video.uploadedAt)
    }));
    body.appendChild(info);
    card.appendChild(body);
    return card;
  }

  // Horizontal (related / row) card.
  function videoRow(video) {
    const card = el('a', { class: 'v-card v-card--row', href: 'watch.html?v=' + video.id });
    const thumb = thumbEl(video);
    thumb.classList.add('v-card__thumb');
    card.appendChild(thumb);
    const info = el('div', { class: 'v-card__info' });
    info.appendChild(el('div', { class: 'v-card__title', text: video.title }));
    const ch = el('div', { class: 'v-card__channel muted' });
    ch.appendChild(el('span', { text: video.channelName }));
    if (video.channel && video.channel.verified) ch.insertAdjacentHTML('beforeend', verifiedIcon(12));
    info.appendChild(ch);
    info.appendChild(el('div', {
      class: 'v-card__stats muted',
      text: U.formatViews(video.views) + ' views · ' + U.timeAgo(video.uploadedAt)
    }));
    card.appendChild(info);
    return card;
  }

  // Larger search-result row.
  function resultRow(video) {
    const a = el('a', { class: 'result', href: 'watch.html?v=' + video.id });
    const thumb = el('div', { class: 'result__thumb' });
    thumb.appendChild(U.imgWithFallback(video.thumbUrl, video.thumbFallback, { alt: video.title }));
    thumb.appendChild(el('div', { class: 'v-card__duration', text: U.formatDuration(video.duration) }));
    a.appendChild(thumb);
    const body = el('div', { class: 'result__body' });
    body.appendChild(el('div', { class: 'result__title', text: video.title }));
    body.appendChild(el('div', {
      class: 'result__meta',
      text: U.formatViews(video.views) + ' views · ' + U.timeAgo(video.uploadedAt)
    }));
    const chRow = el('div', { class: 'result__channel' });
    chRow.appendChild(el('img', { class: 'avatar avatar--sm', src: video.avatar, alt: '' }));
    chRow.appendChild(el('span', { text: video.channelName }));
    if (video.channel && video.channel.verified) chRow.insertAdjacentHTML('beforeend', verifiedIcon(12));
    body.appendChild(chRow);
    body.appendChild(el('div', { class: 'result__desc', text: video.description.split('\n')[0] }));
    a.appendChild(body);
    return a;
  }

  function videoGrid(items, opts) {
    const grid = el('div', { class: 'video-grid' });
    items.forEach(function (v) { grid.appendChild((opts && opts.row ? videoRow : videoCard)(v)); });
    return grid;
  }

  function skeletonGrid(n) {
    const grid = el('div', { class: 'video-grid' });
    for (let i = 0; i < (n || 8); i++) {
      const card = el('div', { class: 'v-card' });
      card.appendChild(el('div', { class: 'skeleton sk-thumb' }));
      card.appendChild(el('div', { class: 'skeleton sk-line', style: 'width:90%' }));
      card.appendChild(el('div', { class: 'skeleton sk-line', style: 'width:60%' }));
      grid.appendChild(card);
    }
    return grid;
  }

  function emptyState(opts) {
    const box = el('div', { class: 'empty' });
    box.innerHTML = '<div class="empty__icon">' + icon(opts.icon || 'film', 64) + '</div>' +
      '<h2>' + U.escapeHtml(opts.title || 'Nothing here') + '</h2>' +
      '<p>' + U.escapeHtml(opts.message || '') + '</p>';
    if (opts.action) {
      const btn = el('a', { class: 'btn btn--filled', href: opts.action.href, text: opts.action.label, style: 'margin-top:16px' });
      box.appendChild(btn);
    }
    return box;
  }

  /* ----------------------------------------------------------- Subscribe  */
  function subscribeButton(channel, onChange) {
    const subscribed = Store.isSubscribed(channel.id);
    const btn = el('button', {
      class: 'btn ' + (subscribed ? '' : 'btn--filled'),
      text: subscribed ? 'Subscribed' : 'Subscribe'
    });
    btn.addEventListener('click', function () {
      const now = Store.toggleSubscription(channel.id);
      btn.textContent = now ? 'Subscribed' : 'Subscribe';
      btn.className = 'btn ' + (now ? '' : 'btn--filled');
      toast(now ? 'Subscribed to ' + channel.name : 'Unsubscribed from ' + channel.name);
      onChange && onChange(now);
    });
    return btn;
  }

  /* ------------------------------------------------------ Chrome assembly */
  function setupChrome(active) {
    const header = buildHeader(active);
    const sidebar = buildSidebar(active);
    const scrim = el('div', { class: 'scrim' });
    scrim.addEventListener('click', function () { document.body.classList.remove('sidebar-open'); Store.set('sidebarOpen', false); });

    document.body.insertBefore(scrim, document.body.firstChild);
    document.body.insertBefore(sidebar, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);

    // Restore sidebar state on desktop.
    const desktop = window.matchMedia('(min-width: 1025px)').matches;
    if (Store.get('sidebarOpen') && desktop) document.body.classList.add('sidebar-open');

    // Close mobile search overlay when a result is chosen.
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('search-open')) return;
      if (!e.target.closest('.header__center') && !e.target.closest('.search-mobile-btn')) {
        document.body.classList.remove('search-open');
      }
    });

    return header;
  }

  return {
    icon: icon, Icons: P,
    toast: toast, openModal: openModal, confirmDialog: confirmDialog,
    setupChrome: setupChrome,
    videoCard: videoCard, videoRow: videoRow, resultRow: resultRow,
    videoGrid: videoGrid, skeletonGrid: skeletonGrid, emptyState: emptyState,
    subscribeButton: subscribeButton, verifiedIcon: verifiedIcon,
    thumbEl: thumbEl, avatarEl: avatarEl, toggleTheme: toggleTheme
  };
})();
