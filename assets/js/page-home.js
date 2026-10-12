/* page-home.js - home feed with category chips and trending support. */
window.Pages = window.Pages || {};
window.Pages.home = function () {
  'use strict';
  const chipsEl = U.qs('#chips');
  const feed = U.qs('#feed');
  const params = new URLSearchParams(location.search);
  const category = params.get('category') || 'All';
  const feedType = params.get('feed');

  function renderChips() {
    chipsEl.innerHTML = '';
    const cats = ['All'].concat(Seed.CATEGORIES.filter(function (c) { return c !== 'All'; }));
    cats.forEach(function (c) {
      const href = c === 'All' ? 'index.html' : 'index.html?category=' + encodeURIComponent(c);
      chipsEl.appendChild(U.el('a', {
        class: 'chip' + (c === category ? ' is-active' : ''),
        href: href,
        text: c
      }));
    });
  }

  function load() {
    feed.innerHTML = '';
    feed.appendChild(UI.skeletonGrid(12));
    API.getVideos({
      category: category,
      sort: feedType === 'trending' ? 'views' : 'recent'
    }).then(function (res) {
      feed.innerHTML = '';
      if (!res.items.length) {
        feed.appendChild(UI.emptyState({
          icon: 'film',
          title: 'No videos in this category',
          message: 'Try another category from the chips above.'
        }));
        return;
      }
      const head = U.el('div', { class: 'section-head' });
      head.appendChild(U.el('h1', {
        text: feedType === 'trending' ? 'Trending' : (category === 'All' ? 'Recommended' : category)
      }));
      head.appendChild(U.el('span', { class: 'section-head__count', text: res.total + ' videos' }));
      feed.appendChild(head);
      feed.appendChild(UI.videoGrid(res.items));
    });
  }

  renderChips();
  load();
};
