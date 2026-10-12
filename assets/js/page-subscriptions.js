/* page-subscriptions.js - feed of videos from subscribed channels. */
window.Pages = window.Pages || {};
window.Pages.subscriptions = function () {
  'use strict';
  const el = U.el;
  const countEl = U.qs('#subCount');
  const channelsHost = U.qs('#subChannels');
  const feedHost = U.qs('#subFeed');

  render();

  Store.on('subscriptions', function () { render(); });

  function render() {
    feedHost.innerHTML = '';
    feedHost.appendChild(UI.skeletonGrid(8));
    API.getSubscriptionFeed().then(function (res) {
      const subs = res.channelIds;
      countEl.textContent = subs.length ? subs.length + ' channels' : '';
      renderChannelStrip(subs);

      feedHost.innerHTML = '';
      if (!subs.length) {
        feedHost.appendChild(UI.emptyState({
          icon: 'subs',
          title: 'No subscriptions yet',
          message: 'Subscribe to channels and their newest videos show up here.',
          action: { href: '#suggestions', label: 'Browse channels' }
        }));
        feedHost.appendChild(el('h2', { text: 'Recommended channels', style: 'margin:32px 0 16px' }));
        feedHost.appendChild(suggestions());
        return;
      }
      if (!res.items.length) {
        feedHost.appendChild(UI.emptyState({ icon: 'film', title: 'Nothing new', message: 'Your channels have not posted recently.' }));
        return;
      }
      feedHost.appendChild(UI.videoGrid(res.items));
    });
  }

  function renderChannelStrip(subs) {
    channelsHost.innerHTML = '';
    if (!subs.length) return;
    const strip = el('div', { style: 'display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;margin-bottom:24px' });
    subs.forEach(function (id) {
      const c = API._db.channels.find(function (x) { return x.id === id; });
      if (!c) return;
      const a = el('a', { href: 'channel.html?id=' + c.id, style: 'text-align:center;width:88px;flex:none' });
      a.appendChild(el('img', { class: 'avatar avatar--xl', src: U.avatarDataUri(c.name), alt: '', style: 'margin:0 auto' }));
      a.appendChild(el('div', { style: 'font-size:12px;margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: c.name }));
      strip.appendChild(a);
    });
    channelsHost.appendChild(strip);
  }

  function suggestions() {
    const grid = el('div', { class: 'video-grid' });
    API._db.channels.forEach(function (c) {
      const card = el('div', { class: 'v-card', style: 'display:flex;align-items:center;gap:12px' });
      card.appendChild(el('img', { class: 'avatar avatar--xl', src: U.avatarDataUri(c.name), alt: '' }));
      const info = el('div', { class: 'grow', style: 'min-width:0' });
      const nameRow = el('a', { href: 'channel.html?id=' + c.id, style: 'font-weight:500;display:block' });
      nameRow.appendChild(el('span', { text: c.name }));
      if (c.verified) nameRow.insertAdjacentHTML('beforeend', ' ' + UI.verifiedIcon(14));
      info.appendChild(nameRow);
      info.appendChild(el('div', { class: 'muted', style: 'font-size:12px', text: U.formatViews(c.subscribers) + ' subscribers' }));
      card.appendChild(info);
      card.appendChild(UI.subscribeButton(c, function (now) {
        if (now) UI.toast('Subscribed to ' + c.name);
      }));
      grid.appendChild(card);
    });
    return grid;
  }
};
