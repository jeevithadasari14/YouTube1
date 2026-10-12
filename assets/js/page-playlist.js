/* page-playlist.js - playlist detail page. */
window.Pages = window.Pages || {};
window.Pages.playlist = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const host = U.qs('#playlistBody');
  const id = new URLSearchParams(location.search).get('id');

  if (!id) {
    host.appendChild(UI.emptyState({
      icon: 'playlist', title: 'Playlist not found',
      message: 'No playlist was specified.',
      action: { href: 'library.html#playlists', label: 'Browse playlists' }
    }));
    return;
  }

  host.appendChild(UI.skeletonGrid(4));

  API.getPlaylist(id).then(function (pl) {
    host.innerHTML = '';
    if (!pl) {
      host.appendChild(UI.emptyState({
        icon: 'playlist', title: 'Playlist not found',
        message: 'This playlist may have been removed.',
        action: { href: 'library.html#playlists', label: 'Browse playlists' }
      }));
      return;
    }

    const head = el('div', { class: 'playlist-head' });

    // Art
    const art = el('div', { class: 'playlist-head__art' });
    if (pl.videos.length) {
      art.appendChild(U.imgWithFallback(pl.videos[0].thumbUrl, pl.videos[0].thumbFallback, { alt: '' }));
    }
    head.appendChild(art);

    // Info
    const info = el('div', { class: 'playlist-head__info grow' });
    info.appendChild(el('h1', { text: pl.title }));
    if (pl.channel) {
      const chRow = el('a', { class: 'row', href: 'channel.html?id=' + pl.channel.id, style: 'color:inherit;margin-bottom:8px' });
      chRow.appendChild(el('img', { class: 'avatar avatar--md', src: pl.channel.avatar, alt: '' }));
      chRow.appendChild(el('strong', { text: pl.channel.name }));
      info.appendChild(chRow);
    }
    info.appendChild(el('div', {
      class: 'playlist-head__meta',
      text: pl.videos.length + ' videos · ' + U.formatViews(pl.totalViews) + ' views · '
        + U.formatDuration(pl.duration) + ' total'
    }));
    if (pl.description) info.appendChild(el('p', { class: 'muted', text: pl.description }));

    const actions = el('div', { class: 'row', style: 'flex-wrap:wrap;margin-top:8px' });
    if (pl.videos.length) {
      const playAll = el('a', { class: 'btn btn--filled', href: 'watch.html?v=' + pl.videos[0].id + '&list=' + pl.id, html: icon('play', 20) + '<span>Play all</span>' });
      actions.appendChild(playAll);
      const shuffle = el('button', { class: 'btn btn--ghost', html: icon('next', 20) + '<span>Shuffle</span>' });
      shuffle.addEventListener('click', function () {
        const v = pl.videos[Math.floor(Math.random() * pl.videos.length)];
        location.href = 'watch.html?v=' + v.id + '&list=' + pl.id;
      });
      actions.appendChild(shuffle);
    }
    if (pl.mine) {
      const del = el('button', { class: 'btn btn--danger', html: icon('trash', 18) + '<span>Delete playlist</span>' });
      del.addEventListener('click', function () {
        UI.confirmDialog('Delete playlist?', '“' + pl.title + '” will be removed from your library.', 'Delete')
          .then(function (ok) {
            if (!ok) return;
            API.deletePlaylist(pl.id).then(function () {
              UI.toast('Playlist deleted.');
              setTimeout(function () { location.href = 'library.html#playlists'; }, 400);
            });
          });
      });
      actions.appendChild(del);
    }
    info.appendChild(actions);
    head.appendChild(info);
    host.appendChild(head);

    // Video list
    if (!pl.videos.length) {
      host.appendChild(UI.emptyState({ icon: 'playlist', title: 'This playlist is empty', message: 'Save videos to it from any watch page.' }));
      return;
    }
    const list = el('div', { class: 'panel', style: 'padding:8px' });
    pl.videos.forEach(function (v, i) {
      const row = el('a', { class: 'playlist-video', href: 'watch.html?v=' + v.id + '&list=' + pl.id });
      row.appendChild(el('span', { class: 'playlist-video__index', text: String(i + 1) }));
      const thumb = el('div', { class: 'playlist-video__thumb' });
      thumb.appendChild(U.imgWithFallback(v.thumbUrl, v.thumbFallback, { alt: '' }));
      if (v.duration) thumb.appendChild(el('div', { class: 'v-card__duration', text: U.formatDuration(v.duration) }));
      row.appendChild(thumb);
      const meta = el('div', { class: 'grow', style: 'min-width:0' });
      meta.appendChild(el('div', { class: 'v-card__title', text: v.title }));
      meta.appendChild(el('div', { class: 'muted', text: v.channelName }));
      meta.appendChild(el('div', { class: 'muted', text: U.formatViews(v.views) + ' views · ' + U.timeAgo(v.uploadedAt) }));
      row.appendChild(meta);
      list.appendChild(row);
    });
    host.appendChild(list);
  });
};
