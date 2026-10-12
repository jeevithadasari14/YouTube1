/* page-about.js - about / stats / credits. */
window.Pages = window.Pages || {};
window.Pages.about = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const host = U.qs('#aboutBody');

  const panel = el('div', { class: 'panel' });
  panel.appendChild(el('p', {
    class: 'muted',
    text: 'YClone is a YouTube-inspired front-end demo built with plain HTML, CSS and JavaScript. '
      + 'Every screen, button and menu works against realistic local data, and the code is structured '
      + 'so each data call can be swapped for a real REST endpoint.'
  }));

  const stats = el('div', { class: 'row', style: 'gap:24px;margin:16px 0;flex-wrap:wrap' });
  function stat(value, label) {
    const b = el('div');
    b.appendChild(el('div', { style: 'font-size:24px;font-weight:700', text: value }));
    b.appendChild(el('div', { class: 'muted', text: label }));
    return b;
  }
  stats.appendChild(stat('0', 'videos'));
  stats.appendChild(stat('0', 'channels'));
  stats.appendChild(stat(String(Store.get('history').length), 'watched by you'));
  stats.appendChild(stat(String(Store.get('playlists').length), 'your playlists'));
  panel.appendChild(stats);
  host.appendChild(panel);

  const features = el('div', { class: 'panel' });
  features.appendChild(el('h2', { text: 'What is inside' }));
  [
    'Home feed, watch page and full search with results.',
    'Channels, subscriptions and a subscription feed.',
    'Library: history, playlists, watch later, liked and your videos.',
    'Studio: upload, go live, manage videos and analytics.',
    'A custom video player with quality, captions and theater mode.',
    'Settings, notifications, help, feedback and account pages.'
  ].forEach(function (t) {
    const row = el('div', { class: 'row', style: 'align-items:flex-start;margin:8px 0' });
    row.appendChild(el('span', { class: 'muted', html: icon('check', 18) }));
    row.appendChild(el('span', { text: t }));
    features.appendChild(row);
  });
  host.appendChild(features);

  const links = el('div', { class: 'panel' });
  links.appendChild(el('h2', { text: 'More' }));
  const row = el('div', { class: 'row', style: 'flex-wrap:wrap;margin-top:8px' });
  row.appendChild(el('a', { class: 'btn btn--ghost', href: 'help.html', text: 'Help centre' }));
  row.appendChild(el('a', { class: 'btn btn--ghost', href: 'feedback.html', text: 'Send feedback' }));
  row.appendChild(el('a', { class: 'btn btn--ghost', href: 'settings.html', text: 'Settings' }));
  row.appendChild(el('a', { class: 'btn btn--ghost', href: 'index.html', text: 'Back to home' }));
  links.appendChild(row);
  links.appendChild(el('p', { class: 'muted', style: 'margin-top:16px;font-size:13px', text: 'YClone · version 1.1 · a learning demo, not affiliated with YouTube.' }));
  host.appendChild(links);

  // Fill live counts.
  Promise.all([
    API.getVideos({ limit: 1 }),
    API.getChannels()
  ]).then(function (res) {
    const v = res[0];
    const chans = res[1];
    const nums = stats.querySelectorAll('div > div:first-child');
    const videoTotal = (v && v.total != null) ? v.total : ((v && v.items) || []).length;
    const chanTotal = (chans && chans.items ? chans.items : chans || []).length;
    if (nums[0]) nums[0].textContent = String(videoTotal);
    if (nums[1]) nums[1].textContent = String(chanTotal);
  });
};
