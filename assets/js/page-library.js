/* page-library.js - History / Playlists / Watch later / Liked / Your videos. */
window.Pages = window.Pages || {};
window.Pages.library = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const tabsHost = U.qs('#libTabs');
  const body = U.qs('#libBody');

  const TABS = [
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'playlists', label: 'Playlists', icon: 'playlist' },
    { id: 'watchlater', label: 'Watch later', icon: 'watchLater' },
    { id: 'liked', label: 'Liked videos', icon: 'liked' },
    { id: 'videos', label: 'Your videos', icon: 'studio' }
  ];
  let active = (location.hash || '#history').slice(1);
  if (!TABS.some(function (t) { return t.id === active; })) active = 'history';

  function renderTabs() {
    tabsHost.innerHTML = '';
    TABS.forEach(function (t) {
      const b = el('a', { class: 'chip' + (active === t.id ? ' is-active' : ''), href: '#' + t.id, text: t.label });
      b.addEventListener('click', function (e) {
        e.preventDefault();
        active = t.id;
        history.replaceState(null, '', '#' + t.id);
        renderTabs();
        renderBody();
      });
      tabsHost.appendChild(b);
    });
  }

  function renderBody() {
    body.innerHTML = '';
    body.appendChild(UI.skeletonGrid(8));
    if (active === 'history') return renderHistory();
    if (active === 'watchlater') return renderWatchLater();
    if (active === 'liked') return renderLiked();
    if (active === 'videos') return renderMine();
    return renderPlaylists();
  }

  function header(title, actionNode) {
    const h = el('div', { class: 'section-head' });
    h.appendChild(el('h2', { text: title }));
    if (actionNode) { h.appendChild(el('span', { class: 'grow' })); h.appendChild(actionNode); }
    return h;
  }

  function renderHistory() {
    API.getHistory().then(function (items) {
      body.innerHTML = '';
      if (!items.length) {
        body.appendChild(UI.emptyState({ icon: 'history', title: 'No watch history', message: 'Videos you watch appear here.', action: { href: 'index.html', label: 'Browse videos' } }));
        return;
      }
      const clear = el('button', { class: 'btn', html: icon('trash', 18) + '<span>Clear all history</span>' });
      clear.addEventListener('click', function () {
        UI.confirmDialog('Clear watch history?', 'This removes every video from your history. This cannot be undone.', 'Clear history')
          .then(function (ok) { if (ok) { Store.clearHistory(); renderBody(); UI.toast('History cleared.'); } });
      });
      body.appendChild(header('Watch history', clear));
      body.appendChild(UI.videoGrid(items));
    });
  }

  function renderWatchLater() {
    API.getWatchLater().then(function (items) {
      body.innerHTML = '';
      if (!items.length) {
        body.appendChild(UI.emptyState({ icon: 'watchLater', title: 'No videos saved', message: 'Use Save on any video to add it here.', action: { href: 'index.html', label: 'Find videos' } }));
        return;
      }
      body.appendChild(header(items.length + ' videos'));
      body.appendChild(UI.videoGrid(items));
    });
  }

  function renderLiked() {
    API.getLiked().then(function (items) {
      body.innerHTML = '';
      if (!items.length) {
        body.appendChild(UI.emptyState({ icon: 'liked', title: 'No liked videos', message: 'Videos you like will be collected here.', action: { href: 'index.html', label: 'Browse videos' } }));
        return;
      }
      body.appendChild(header(items.length + ' videos'));
      body.appendChild(UI.videoGrid(items));
    });
  }

  function renderMine() {
    API.getMyVideos().then(function (items) {
      body.innerHTML = '';
      const uploadBtn = el('a', { class: 'btn btn--brand', href: 'studio.html', html: icon('upload', 18) + '<span>Upload</span>' });
      body.appendChild(header('Your videos', uploadBtn));
      if (!items.length) {
        body.appendChild(UI.emptyState({ icon: 'studio', title: 'You have not uploaded yet', message: 'Head to Studio to upload your first video.', action: { href: 'studio.html', label: 'Open Studio' } }));
        return;
      }
      body.appendChild(UI.videoGrid(items));
    });
  }

  function renderPlaylists() {
    body.innerHTML = '';
    const createBtn = el('button', { class: 'btn btn--brand', html: icon('create', 18) + '<span>New playlist</span>' });
    createBtn.addEventListener('click', createPlaylistFlow);
    body.appendChild(header('Playlists', createBtn));
    body.appendChild(UI.skeletonGrid(3));

    API.getPlaylists().then(function (res) {
      body.innerHTML = '';
      body.appendChild(header(res.items.length + ' playlists', createBtn));
      if (!res.items.length) {
        body.appendChild(UI.emptyState({ icon: 'playlist', title: 'No playlists', message: 'Create a playlist to group videos together.' }));
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
        card.appendChild(el('div', { class: 'muted', text: pl.mine ? 'Your playlist' : pl.channelName }));
        card.appendChild(el('div', { class: 'muted', text: 'View full playlist' }));
        grid.appendChild(card);
      });
      body.appendChild(grid);
    });
  }

  function createPlaylistFlow() {
    const input = el('input', { class: 'input', placeholder: 'Playlist name' });
    const err = el('div', { class: 'help', style: 'color:var(--brand);min-height:16px' });
    const content = el('div');
    content.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Name' }), input]));
    content.appendChild(err);
    let ref;
    const ok = el('button', { class: 'btn btn--filled', text: 'Create' });
    ok.addEventListener('click', function () {
      API.createPlaylist(input.value).then(function (pl) {
        ref.close();
        UI.toast('Playlist “' + pl.title + '” created.');
        renderBody();
      }).catch(function (e) { err.textContent = e.message; });
    });
    ref = UI.openModal({ title: 'Create playlist', content: content, footer: [ok] });
    setTimeout(function () { input.focus(); }, 50);
  }

  renderTabs();
  renderBody();

  window.addEventListener('hashchange', function () {
    const h = (location.hash || '').slice(1);
    if (TABS.some(function (t) { return t.id === h; }) && h !== active) {
      active = h; renderTabs(); renderBody();
    }
  });
};
