/* page-settings.js - Account, Appearance, Playback, Notifications & Data. */
window.Pages = window.Pages || {};
window.Pages.settings = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const host = U.qs('#settingsBody');

  /* ------------------------------------------------------------ primitives */
  function section(title, subtitle) {
    const s = el('div', { class: 'settings-section' });
    s.appendChild(el('h2', { text: title }));
    if (subtitle) s.appendChild(el('p', { class: 'muted', text: subtitle }));
    return s;
  }

  function textBlock(title, desc) {
    const t = el('div', { class: 'setting-row__text' });
    t.appendChild(el('strong', { text: title }));
    if (desc) t.appendChild(el('span', { text: desc }));
    return t;
  }

  function toggleRow(title, desc, get, set) {
    const row = el('div', { class: 'setting-row' });
    row.appendChild(textBlock(title, desc));
    const controls = el('div', { class: 'setting-controls' });
    const btn = el('button', { class: 'btn ' + (get() ? 'btn--filled' : 'btn--ghost'), text: get() ? 'On' : 'Off' });
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-checked', String(!!get()));
    btn.addEventListener('click', function () {
      const on = !get();
      set(on);
      btn.textContent = on ? 'On' : 'Off';
      btn.className = 'btn ' + (on ? 'btn--filled' : 'btn--ghost');
      btn.setAttribute('aria-checked', String(on));
    });
    controls.appendChild(btn);
    row.appendChild(controls);
    return row;
  }

  function choiceRow(title, desc, options, get, set) {
    const row = el('div', { class: 'setting-row' });
    row.appendChild(textBlock(title, desc));
    const controls = el('div', { class: 'setting-controls' });
    options.forEach(function (o) {
      const b = el('button', { class: 'btn ' + (get() === o[0] ? 'btn--filled' : 'btn--ghost'), text: o[1] });
      b.addEventListener('click', function () {
        set(o[0]);
        U.qsa('button', controls).forEach(function (x) { x.className = 'btn btn--ghost'; });
        b.className = 'btn btn--filled';
      });
      controls.appendChild(b);
    });
    row.appendChild(controls);
    return row;
  }

  function actionRow(title, desc, label, onClick, danger) {
    const row = el('div', { class: 'setting-row' });
    row.appendChild(textBlock(title, desc));
    const controls = el('div', { class: 'setting-controls' });
    const b = el('button', { class: 'btn ' + (danger ? 'btn--danger' : 'btn--ghost'), text: label });
    b.addEventListener('click', onClick);
    controls.appendChild(b);
    row.appendChild(controls);
    return row;
  }

  /* --------------------------------------------------------------- account */
  function render() {
    host.innerHTML = '';
    const user = Store.get('user');

    const account = section('Account', 'Manage your YClone identity.');
    if (user) {
      const row = el('div', { class: 'setting-row' });
      const left = el('div', { class: 'row' });
      left.appendChild(el('img', { class: 'avatar avatar--lg', src: U.avatarDataUri(user.name), alt: '' }));
      left.appendChild(textBlock(user.name, user.email));
      row.appendChild(left);
      const controls = el('div', { class: 'setting-controls' });
      const ch = el('a', { class: 'btn btn--ghost', href: 'channel.html?id=' + (user.channelId || 'codecraft'), text: 'Your channel' });
      controls.appendChild(ch);
      const out = el('button', { class: 'btn btn--ghost', text: 'Sign out' });
      out.addEventListener('click', function () {
        API.logout().then(function () { UI.toast('Signed out.'); render(); });
      });
      controls.appendChild(out);
      row.appendChild(controls);
      account.appendChild(row);
    } else {
      const row = el('div', { class: 'setting-row' });
      row.appendChild(textBlock('You are signed out', 'Sign in to save likes, subscriptions and playlists.'));
      const controls = el('div', { class: 'setting-controls' });
      controls.appendChild(el('a', { class: 'btn btn--filled', href: 'login.html', text: 'Sign in' }));
      controls.appendChild(el('a', { class: 'btn btn--ghost', href: 'signup.html', text: 'Create account' }));
      row.appendChild(controls);
      account.appendChild(row);
    }
    host.appendChild(account);

    /* ----------------------------------------------------------- appearance */
    const looks = section('Appearance');
    looks.appendChild(choiceRow('Theme', 'How YClone looks on this device.',
      [['dark', 'Dark'], ['light', 'Light']],
      function () { return Store.get('theme'); },
      function (v) { Store.setTheme(v); }));
    looks.appendChild(toggleRow('Reduce motion', 'Minimise animations across the app.',
      function () { return !!Store.getPref('reducedMotion'); },
      function (on) {
        Store.setPref('reducedMotion', on);
        document.documentElement.setAttribute('data-reduced-motion', String(on));
        UI.toast('Reduced motion ' + (on ? 'enabled' : 'disabled') + '.');
      }));
    host.appendChild(looks);

    /* ------------------------------------------------------------- playback */
    const play = section('Playback');
    play.appendChild(toggleRow('Autoplay', 'Play the next recommended video automatically.',
      function () { return !!Store.get('autoplay'); },
      function (on) { Store.set('autoplay', on); }));
    play.appendChild(toggleRow('Subtitles / captions', 'Turn captions on by default in the player.',
      function () { return !!Store.getPref('captions'); },
      function (on) { Store.setPref('captions', on); }));
    play.appendChild(choiceRow('Playback quality', 'Preferred streaming quality.',
      [['auto', 'Auto'], ['hd', 'HD'], ['sd', 'SD']],
      function () { return Store.getPref('playbackQuality'); },
      function (v) { Store.setPref('playbackQuality', v); UI.toast('Quality set to ' + v.toUpperCase() + '.'); }));

    const volRow = el('div', { class: 'setting-row' });
    volRow.appendChild(textBlock('Default volume', 'Starting volume for the player.'));
    const volControls = el('div', { class: 'setting-controls' });
    const range = el('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(Store.getPref('volume')), style: 'width:180px' });
    const volLabel = el('span', { class: 'muted', text: Math.round(Store.getPref('volume') * 100) + '%' });
    range.addEventListener('input', function () {
      Store.setPref('volume', parseFloat(range.value));
      volLabel.textContent = Math.round(parseFloat(range.value) * 100) + '%';
    });
    volControls.appendChild(range);
    volControls.appendChild(volLabel);
    volRow.appendChild(volControls);
    play.appendChild(volRow);
    host.appendChild(play);

    /* -------------------------------------------------------- notifications */
    const notif = section('Notifications', 'Choose what shows up in your bell menu.');
    notif.appendChild(toggleRow('Subscriptions', 'New videos from channels you follow.',
      function () { return !!Store.getPref('notifications').subscriptions; },
      function (on) { Store.setPrefNested('notifications', 'subscriptions', on); }));
    notif.appendChild(toggleRow('Comments', 'Activity on videos you watch.',
      function () { return !!Store.getPref('notifications').comments; },
      function (on) { Store.setPrefNested('notifications', 'comments', on); }));
    notif.appendChild(toggleRow('Replies', 'When someone replies to your comments.',
      function () { return !!Store.getPref('notifications').replies; },
      function (on) { Store.setPrefNested('notifications', 'replies', on); }));
    notif.appendChild(actionRow('All notifications', 'Open the full notifications page.',
      'Open notifications', function () { location.href = 'notifications.html'; }));
    notif.appendChild(actionRow('Unread', 'Clear the unread badge in the header.',
      'Mark all as read', function () {
        API.markAllNotificationsRead().then(function () { UI.toast('All notifications marked as read.'); });
      }));
    host.appendChild(notif);

    /* ---------------------------------------------------------------- data */
    const data = section('Data & privacy', 'These actions affect only this browser.');
    data.appendChild(actionRow('Watch history', 'Forget every video you have watched.',
      'Clear watch history', function () {
        Store.clearHistory();
        UI.toast('Watch history cleared.');
      }, true));
    data.appendChild(actionRow('Search history', 'Clear recent searches.',
      'Clear search history', function () {
        Store.set('searchHistory', []);
        UI.toast('Search history cleared.');
      }, true));
    data.appendChild(actionRow('Reset demo data', 'Restore YClone to its original state.',
      'Reset everything', function () {
        UI.confirmDialog('Reset everything?', 'This clears your session, likes, playlists and settings on this device.', 'Reset')
          .then(function (ok) {
            if (!ok) return;
            Store.reset();
            location.href = 'index.html';
          });
      }, true));
    host.appendChild(data);

    /* --------------------------------------------------------------- links */
    const more = section('More');
    const links = el('div', { class: 'setting-controls', style: 'justify-content:flex-start' });
    [['Help centre', 'help.html'], ['Send feedback', 'feedback.html'], ['About YClone', 'about.html']].forEach(function (l) {
      links.appendChild(el('a', { class: 'btn btn--ghost', href: l[1], text: l[0] }));
    });
    more.appendChild(links);
    host.appendChild(more);
  }

  render();
};
