/* page-results.js - search results with filters. */
window.Pages = window.Pages || {};
window.Pages.results = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  const state = {
    sort: params.get('sort') || 'recent',
    uploadDate: params.get('uploadDate') || '',
    duration: params.get('duration') || ''
  };

  const head = U.qs('#resultsHead');
  const filters = U.qs('#filters');
  const list = U.qs('#resultsList');

  if (q) Store.rememberSearch(q);

  head.innerHTML = '';
  if (q) {
    const h = el('div', { class: 'section-head' });
    h.appendChild(el('h1', { text: 'Results for “' + q + '”' }));
    head.appendChild(h);
  }

  const SORTS = [['recent', 'Relevance'], ['views', 'View count'], ['likes', 'Rating'], ['oldest', 'Upload date']];
  const DATES = [['', 'Any time'], ['today', 'Today']];
  const DURS = [['', 'Any duration'], ['short', 'Under 4 min'], ['long', 'Over 20 min']];

  function chip(label, active, onClick) {
    const b = el('button', { class: 'chip' + (active ? ' is-active' : ''), text: label });
    b.addEventListener('click', onClick);
    return b;
  }

  function renderFilters() {
    filters.innerHTML = '';
    filters.appendChild(el('span', { class: 'muted', style: 'align-self:center', html: icon('sort', 18) }));

    const sortWrap = el('div', { style: 'display:flex;gap:8px' });
    SORTS.forEach(function (s) {
      sortWrap.appendChild(chip(s[1], state.sort === s[0], function () { state.sort = s[0]; sync(); }));
    });
    filters.appendChild(sortWrap);

    filters.appendChild(el('span', { style: 'width:1px;height:24px;background:var(--border);align-self:center' }));

    DATES.forEach(function (d) {
      filters.appendChild(chip(d[1], state.uploadDate === d[0], function () { state.uploadDate = d[0]; sync(); }));
    });
    DURS.forEach(function (d) {
      filters.appendChild(chip(d[1], state.duration === d[0], function () { state.duration = d[0]; sync(); }));
    });
  }

  function sync() {
    const p = new URLSearchParams({ q: q });
    if (state.sort !== 'recent') p.set('sort', state.sort);
    if (state.uploadDate) p.set('uploadDate', state.uploadDate);
    if (state.duration) p.set('duration', state.duration);
    history.replaceState(null, '', location.pathname + '?' + p.toString());
    renderFilters();
    load();
  }

  function load() {
    list.innerHTML = '';
    list.appendChild(UI.skeletonGrid(6));
    API.search(q, state).then(function (res) {
      list.innerHTML = '';
      if (!res.items.length) {
        list.appendChild(UI.emptyState({
          icon: 'search',
          title: 'No results found',
          message: q ? 'Try different keywords or remove some filters.' : 'Type something in the search box to get started.'
        }));
        return;
      }
      list.appendChild(el('div', { class: 'muted', style: 'margin-bottom:16px', text: U.formatCount(res.total) + ' results' }));
      res.items.forEach(function (v) { list.appendChild(UI.resultRow(v)); });
    });
  }

  renderFilters();
  load();
};
