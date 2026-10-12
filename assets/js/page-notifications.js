/* page-notifications.js - full notification list with filters + mark all read. */
window.Pages = window.Pages || {};
window.Pages.notifications = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const tabsHost = U.qs('#notifTabs');
  const body = U.qs('#notifBody');

  const TABS = [
    { id: 'all', label: 'All' },
    { id: 'subscription', label: 'Subscriptions' },
    { id: 'comment', label: 'Comments' },
    { id: 'reply', label: 'Replies' }
  ];
  let active = 'all';
  let items = [];

  function renderTabs() {
    tabsHost.innerHTML = '';
    TABS.forEach(function (t) {
      const b = el('button', { class: 'chip' + (active === t.id ? ' is-active' : ''), text: t.label });
      b.addEventListener('click', function () { active = t.id; renderTabs(); renderList(); });
      tabsHost.appendChild(b);
    });
  }

  function notifRow(n) {
    const a = el('a', { class: 'notif-item', href: 'watch.html?v=' + n.videoId });
    a.appendChild(el('img', { class: 'avatar avatar--lg', src: n.avatar, alt: '' }));
    const body_ = el('div', { class: 'grow', style: 'min-width:0' });
    body_.appendChild(el('div', { html: '<strong>' + U.escapeHtml(n.channelName) + '</strong> ' + U.escapeHtml(n.text) }));
    body_.appendChild(el('div', { class: 'muted notif-item__title', text: n.videoTitle }));
    body_.appendChild(el('div', { class: 'muted', style: 'font-size:12px;margin-top:2px', text: U.timeAgo(n.at) }));
    a.appendChild(body_);
    a.appendChild(U.imgWithFallback(n.thumbUrl, n.thumbFallback, { class: 'notif-item__thumb', alt: '' }));
    return a;
  }

  function renderList() {
    const filtered = active === 'all' ? items : items.filter(function (n) { return n.kind === active; });
    body.innerHTML = '';
    if (!filtered.length) {
      body.appendChild(UI.emptyState({ icon: 'bell', title: 'Nothing here', message: 'You are all caught up.' }));
      return;
    }
    const panel = el('div', { class: 'panel', style: 'padding:8px 0' });
    filtered.forEach(function (n) { panel.appendChild(notifRow(n)); });
    body.appendChild(panel);
  }

  U.qs('#markAllBtn').addEventListener('click', function () {
    API.markAllNotificationsRead().then(function () {
      UI.toast('All notifications marked as read.');
    });
  });

  body.appendChild(UI.skeletonGrid(3));
  API.getNotifications().then(function (res) {
    items = res.items;
    renderTabs();
    renderList();
  });
};
