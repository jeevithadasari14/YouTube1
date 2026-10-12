/* page-channel.js - channel page with Videos / Playlists / About tabs. */
window.Pages = window.Pages || {};
window.Pages.channel = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const channelId = U.param('id') || 'codecraft';
  const bannerHost = U.qs('#channelBanner');
  const headHost = U.qs('#channelHead');
  const tabsHost = U.qs('#channelTabs');
  const bodyHost = U.qs('#channelBody');
  let activeTab = (location.hash || '#videos').slice(1);
  let channel = null;

  API.getChannel(channelId).then(function (c) {
    if (!c) {
      bodyHost.appendChild(UI.emptyState({ icon: 'film', title: 'Channel not found', message: 'This channel does not exist.' }));
      return;
    }
    channel = c;
    document.title = c.name + ' - YClone';
    renderBanner(c);
    renderHead(c);
    renderTabs();
    renderTab();
  });

  function renderBanner(c) {
    bannerHost.innerHTML = '';
    const banner = el('div', { class: 'channel-banner' });
    const img = U.imgWithFallback(c.banner, U.thumbDataUri('banner-' + c.id, ''), { alt: '' });
    banner.appendChild(img);
    bannerHost.appendChild(banner);
  }

  function renderHead(c) {
    headHost.innerHTML = '';
    const row = el('div', { class: 'channel-head' });
    row.appendChild(U.imgWithFallback(c.avatar, U.avatarDataUri(c.name), { class: 'avatar avatar--2xl' }));

    const info = el('div', { class: 'channel-info' });
    const nameRow = el('div', { class: 'channel-title-row' });
    nameRow.appendChild(el('h1', { class: 'channel-name', text: c.name }));
    if (c.verified) nameRow.insertAdjacentHTML('beforeend', UI.verifiedIcon(20));
    info.appendChild(nameRow);
    info.appendChild(el('div', { class: 'channel-stats', text: c.handle + '  ·  ' + U.formatViews(c.subscribers) + ' subscribers  ·  ' + c.videoCount + ' videos' }));
    info.appendChild(el('div', { class: 'channel-desc', text: c.description }));
    row.appendChild(info);

    const actions = el('div', { class: 'channel-actions' });
    if (channelId !== 'codecraft' || true) {
      actions.appendChild(UI.subscribeButton(c, function (now) {
        const n = c.subscribers + (now ? 1 : 0);
        info.querySelector('.channel-stats').textContent =
          c.handle + '  ·  ' + U.formatViews(n) + ' subscribers  ·  ' + c.videoCount + ' videos';
      }));
    }
    const bellWrap = el('div', { class: 'user-menu' });
    const bell = el('button', { class: 'icon-btn', html: icon('bell'), title: 'Notification settings', 'aria-label': 'Notification settings' });
    const bellMenu = el('div', { class: 'menu-pop' });
    bellMenu.appendChild(el('div', { class: 'menu-pop__head' }, [el('strong', { text: 'Notifications' })]));
    [['all', 'All'], ['personalized', 'Personalized'], ['none', 'None']].forEach(function (opt) {
      const b = el('button', { class: 'menu-pop__item', style: 'justify-content:space-between' });
      b.appendChild(el('span', { text: opt[1] }));
      if (Store.getChannelNotify(channelId) === opt[0]) b.appendChild(el('span', { html: icon('check', 18) }));
      b.addEventListener('click', function () {
        Store.setChannelNotify(channelId, opt[0]);
        bellMenu.classList.remove('is-open');
        UI.toast('Notifications for this channel set to ' + opt[1] + '.');
      });
      bellMenu.appendChild(b);
    });
    bell.addEventListener('click', function (e) {
      e.stopPropagation();
      U.qsa('.menu-pop.is-open').forEach(function (p) { if (p !== bellMenu) p.classList.remove('is-open'); });
      bellMenu.classList.toggle('is-open');
    });
    bellWrap.appendChild(bell);
    bellWrap.appendChild(bellMenu);
    actions.appendChild(bellWrap);
    row.appendChild(actions);

    headHost.appendChild(row);
  }

  const TABS = [
    { id: 'videos', label: 'Videos', icon: 'film' },
    { id: 'playlists', label: 'Playlists', icon: 'playlist' },
    { id: 'about', label: 'About', icon: 'help' }
  ];

  function renderTabs() {
    tabsHost.innerHTML = '';
    TABS.forEach(function (t) {
      const b = el('a', {
        class: 'channel-tab' + (activeTab === t.id ? ' is-active' : ''),
        href: '#' + t.id,
        text: t.label
      });
      b.addEventListener('click', function (e) {
        e.preventDefault();
        activeTab = t.id;
        history.replaceState(null, '', '#' + t.id);
        renderTabs();
        renderTab();
      });
      tabsHost.appendChild(b);
    });
  }

  function renderTab() {
    bodyHost.innerHTML = '';
    if (activeTab === 'about') return renderAbout();
    if (activeTab === 'playlists') return renderPlaylists();
    return renderVideos();
  }

  function renderVideos() {
    bodyHost.appendChild(UI.skeletonGrid(8));
    API.getVideos({ channelId: channelId, sort: 'recent' }).then(function (res) {
      bodyHost.innerHTML = '';
      if (!res.items.length) {
        bodyHost.appendChild(UI.emptyState({ icon: 'film', title: 'No videos yet', message: 'This channel has not uploaded anything.' }));
        return;
      }
      bodyHost.appendChild(UI.videoGrid(res.items));
    });
  }

  function renderPlaylists() {
    bodyHost.appendChild(UI.skeletonGrid(3));
    API.getPlaylists({ channelId: channelId }).then(function (res) {
      bodyHost.innerHTML = '';
      if (!res.items.length) {
        bodyHost.appendChild(UI.emptyState({ icon: 'playlist', title: 'No playlists', message: 'This channel has not created any playlists.' }));
        return;
      }
      const grid = el('div', { class: 'video-grid' });
      res.items.forEach(function (pl) {
        const card = el('a', { class: 'v-card', href: 'playlist.html?id=' + pl.id });
        const thumb = el('div', { class: 'v-card__thumb' });
        thumb.appendChild(U.imgWithFallback(pl.thumbUrl, pl.thumbFallback, { alt: '' }));
        thumb.appendChild(el('div', { class: 'v-card__badges' }, [el('span', { class: 'v-badge', text: pl.count + ' videos' })]));
        card.appendChild(thumb);
        card.appendChild(el('div', { class: 'v-card__title', style: 'margin-top:12px', text: pl.title }));
        card.appendChild(el('div', { class: 'muted', text: 'View full playlist' }));
        grid.appendChild(card);
      });
      bodyHost.appendChild(grid);
    });
  }

  function renderAbout() {
    const c = channel;
    const panel = el('div', { class: 'panel', style: 'max-width:760px' });
    panel.appendChild(el('h2', { text: 'About' }));
    panel.appendChild(el('p', { text: c.description, style: 'margin:12px 0;color:var(--text-secondary)' }));
    const stats = el('div', { class: 'stats-grid', style: 'margin-top:20px' });
    stats.appendChild(statCard(U.formatViews(c.subscribers), 'Subscribers'));
    stats.appendChild(statCard(String(c.videoCount), 'Videos'));
    const totalViews = API._db.videos.reduce(function (s, v) {
      return v.channelId === channelId ? s + (v.views || 0) : s;
    }, 0);
    stats.appendChild(statCard(U.formatViews(totalViews), 'Total views'));
    panel.appendChild(stats);
    const details = el('div', { class: 'muted', style: 'margin-top:12px;font-size:13px' });
    details.innerHTML = '<strong>Joined</strong> ' + new Date(c.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
      '<br><strong>Handle</strong> ' + U.escapeHtml(c.handle);
    panel.appendChild(details);
    bodyHost.appendChild(panel);
  }

  function statCard(value, label) {
    const c = el('div', { class: 'stat-card' });
    c.appendChild(el('div', { class: 'stat-card__value', text: value }));
    c.appendChild(el('div', { class: 'stat-card__label', text: label }));
    return c;
  }
};
