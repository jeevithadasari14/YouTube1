/* page-help.js - searchable FAQ + quick links. */
window.Pages = window.Pages || {};
window.Pages.help = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const search = U.qs('#helpSearch');
  const catsHost = U.qs('#helpCats');
  const body = U.qs('#helpBody');

  const ARTICLES = [
    { cat: 'Getting started', q: 'How do I find videos?', a: 'Use the search bar at the top of any page, or browse the Home feed and category chips. Press Enter to see full results.' },
    { cat: 'Getting started', q: 'How do I subscribe to a channel?', a: 'Open a channel and press Subscribe. New uploads from that channel then appear in Subscriptions.' },
    { cat: 'Watching', q: 'How do I save a video for later?', a: 'Press Save under the player, or use More actions → Save to playlist. Everything you save appears under Library → Watch later.' },
    { cat: 'Watching', q: 'How do I turn on captions?', a: 'Use the CC button in the player controls, or set Subtitles in Settings → Playback to have them on by default.' },
    { cat: 'Watching', q: 'Why are my videos hidden?', a: 'Choosing “Not interested” hides a video from your feeds. Clearing the demo data in Settings restores everything.' },
    { cat: 'Your account', q: 'How do I change the theme?', a: 'Use Settings → Appearance, or the “Switch appearance” item in the account menu.' },
    { cat: 'Your account', q: 'Where do my likes and history live?', a: 'Everything is stored in this browser. Open Library to see History, Liked videos, Playlists and Watch later.' },
    { cat: 'Creating', q: 'How do I upload a video?', a: 'Go to Studio → Upload, pick a file and publish. Uploaded videos also appear under Library → Your videos.' },
    { cat: 'Creating', q: 'Can I create a playlist?', a: 'Yes. Use Create → Create playlist, or the New playlist button on the Library → Playlists tab.' },
    { cat: 'Troubleshooting', q: 'The video will not play offline.', a: 'Sample videos stream from the internet. Without a connection the player still shows its interface, but playback is unavailable.' },
    { cat: 'Troubleshooting', q: 'Something is broken. How do I report it?', a: 'Open the feedback page and choose “Bug report”. Include what you expected and what happened.' }
  ];
  const CATS = ['All'].concat(ARTICLES.map(function (a) { return a.cat; }).filter(function (v, i, arr) { return arr.indexOf(v) === i; }));
  let cat = 'All';

  function matches(a, q) {
    if (cat !== 'All' && a.cat !== cat) return false;
    if (!q) return true;
    return (a.q + ' ' + a.a + ' ' + a.cat).toLowerCase().indexOf(q.toLowerCase()) !== -1;
  }

  function renderCats() {
    catsHost.innerHTML = '';
    CATS.forEach(function (c) {
      const b = el('button', { class: 'chip' + (cat === c ? ' is-active' : ''), text: c });
      b.addEventListener('click', function () { cat = c; renderCats(); renderList(); });
      catsHost.appendChild(b);
    });
  }

  function renderList() {
    const q = search.value.trim();
    const items = ARTICLES.filter(function (a) { return matches(a, q); });
    body.innerHTML = '';

    if (!items.length) {
      body.appendChild(UI.emptyState({ icon: 'help', title: 'No articles found', message: 'Try a different search, or contact us below.' }));
    } else {
      const wrap = el('div', { style: 'margin-bottom:24px' });
      items.forEach(function (a) {
        const d = el('details', { class: 'faq-item' });
        const s = el('summary');
        s.appendChild(el('span', { text: a.q }));
        s.appendChild(el('span', { class: 'muted', html: icon('chevronDown', 20) }));
        d.appendChild(s);
        d.appendChild(el('p', { text: a.a }));
        wrap.appendChild(d);
      });
      body.appendChild(wrap);
    }

    const contact = el('div', { class: 'panel', style: 'text-align:center' });
    contact.appendChild(el('h2', { text: 'Still need a hand?' }));
    contact.appendChild(el('p', { class: 'muted', text: 'Tell us what happened and we will get back to you.' }));
    const row = el('div', { class: 'row', style: 'justify-content:center;margin-top:8px' });
    row.appendChild(el('a', { class: 'btn btn--filled', href: 'feedback.html', text: 'Send feedback' }));
    row.appendChild(el('a', { class: 'btn btn--ghost', href: 'feedback.html?type=bug', text: 'Report a problem' }));
    contact.appendChild(row);
    body.appendChild(contact);
  }

  search.addEventListener('input', renderList);
  renderCats();
  renderList();
};
