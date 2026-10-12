/* ==========================================================================
   utils.js - tiny DOM + formatting helpers shared across pages.
   No dependencies, works from file:// (classic script).
   ========================================================================== */
window.U = (function () {
  'use strict';

  /* ---- DOM -------------------------------------------------------------- */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'dataset') Object.assign(node.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k in node && k !== 'list') { try { node[k] = v; } catch (_) { node.setAttribute(k, v); } }
        else node.setAttribute(k, v);
      }
    }
    append(node, children);
    return node;
  }

  function append(parent, children) {
    if (children == null) return parent;
    const list = Array.isArray(children) ? children : [children];
    list.forEach(function (c) {
      if (c == null || c === false) return;
      parent.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return parent;
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function setHTML(node, html) { node.innerHTML = html; return node; }

  /* ---- Formatting ------------------------------------------------------- */
  function formatViews(n) {
    n = Number(n) || 0;
    if (n < 1000) return String(n);
    if (n < 1000000) return (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '') + 'K';
    if (n < 1000000000) return (n / 1000000).toFixed(n < 10000000 ? 1 : 0).replace(/\.0$/, '') + 'M';
    return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }

  function formatCount(n) {
    n = Number(n) || 0;
    return n.toLocaleString('en-US');
  }

  function formatDuration(totalSeconds) {
    totalSeconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = function (x) { return x < 10 ? '0' + x : String(x); };
    if (h > 0) return h + ':' + pad(m) + ':' + pad(s);
    return m + ':' + pad(s);
  }

  function timeAgo(input) {
    const then = new Date(input).getTime();
    if (isNaN(then)) return '';
    let secs = Math.floor((Date.now() - then) / 1000);
    if (secs < 0) secs = 0;
    const table = [
      [31536000, 'year'], [2592000, 'month'], [604800, 'week'],
      [86400, 'day'], [3600, 'hour'], [60, 'minute'], [1, 'second']
    ];
    for (let i = 0; i < table.length; i++) {
      const unit = table[i][0];
      const val = Math.floor(secs / unit);
      if (val >= 1) return val + ' ' + table[i][1] + (val > 1 ? 's' : '') + ' ago';
    }
    return 'just now';
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---- Deterministic hash (stable colors/numbers per id) ---------------- */
  function hash(str) {
    let h = 2166136261;
    str = String(str);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  }

  function seeded(str) {
    let s = hash(str);
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function pick(arr, rnd) {
    return arr[Math.floor((rnd ? rnd() : Math.random()) * arr.length)];
  }

  /* ---- Generated media (works offline) ---------------------------------- */
  const AVATAR_PALETTE = ['#e8543f', '#f2a03d', '#f2d43d', '#7bc043', '#3dc0a5', '#3d8bf2', '#6b4ff2', '#c04fe0', '#e04f8b'];
  const THUMB_PALETTE = [
    ['#1e3c72', '#2a5298'], ['#42275a', '#734b6d'], ['#0f2027', '#2c5364'],
    ['#3a1c71', '#d76d77'], ['#134e5e', '#71b280'], ['#232526', '#414345'],
    ['#1f4037', '#99f2c8'], ['#4b134f', '#c94b4b'], ['#093028', '#237a57'],
    ['#5f2c82', '#49a09d'], ['#780206', '#061161'], ['#141e30', '#243b55']
  ];

  function colorFor(str, palette) {
    return (palette || AVATAR_PALETTE)[hash(str) % (palette || AVATAR_PALETTE).length];
  }

  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  // Inline-SVG data URI so avatars render even with no network.
  function avatarDataUri(name) {
    const bg = colorFor(name, AVATAR_PALETTE);
    const fg = '#ffffff';
    const label = initials(name);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">' +
      '<rect width="128" height="128" fill="' + bg + '"/>' +
      '<text x="64" y="64" dy=".35em" text-anchor="middle" fill="' + fg + '" ' +
      'font-family="Roboto,Arial,sans-serif" font-size="52" font-weight="600">' + label + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Inline-SVG thumbnail used as a graceful fallback when remote images fail.
  function thumbDataUri(seed, label) {
    const pair = (THUMB_PALETTE)[hash(seed) % THUMB_PALETTE.length];
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + pair[0] + '"/><stop offset="1" stop-color="' + pair[1] + '"/>' +
      '</linearGradient></defs><rect width="640" height="360" fill="url(#g)"/>' +
      '<circle cx="320" cy="180" r="46" fill="rgba(255,255,255,.16)"/>' +
      '<path d="M305 158 L350 180 L305 202 Z" fill="rgba(255,255,255,.9)"/>' +
      '<text x="320" y="300" text-anchor="middle" fill="rgba(255,255,255,.75)" ' +
      'font-family="Roboto,Arial,sans-serif" font-size="22">' + escapeHtml(label || '') + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // Remote thumbnail (realistic when online); falls back to the SVG above.
  function remoteThumb(seed, w, h) {
    return 'https://picsum.photos/seed/' + encodeURIComponent(seed) + '/' + (w || 640) + '/' + (h || 360);
  }

  function imgWithFallback(src, fallback, attrs) {
    const img = el('img', Object.assign({ src: src, alt: '', loading: 'lazy' }, attrs || {}));
    img.addEventListener('error', function handle() {
      img.removeEventListener('error', handle);
      img.src = fallback;
    });
    return img;
  }

  /* ---- Query string ----------------------------------------------------- */
  function param(name, fallback) {
    const v = new URLSearchParams(location.search).get(name);
    return v == null ? (fallback === undefined ? null : fallback) : v;
  }

  /* ---- Misc ------------------------------------------------------------- */
  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 250);
    };
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  return {
    el: el, append: append, qs: qs, qsa: qsa, setHTML: setHTML,
    formatViews: formatViews, formatCount: formatCount, formatDuration: formatDuration,
    timeAgo: timeAgo, escapeHtml: escapeHtml,
    hash: hash, seeded: seeded, pick: pick, clamp: clamp,
    avatarDataUri: avatarDataUri, thumbDataUri: thumbDataUri, remoteThumb: remoteThumb,
    colorFor: colorFor, initials: initials, imgWithFallback: imgWithFallback,
    param: param, debounce: debounce
  };
})();
