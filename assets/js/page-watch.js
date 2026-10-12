/* page-watch.js - watch page: player, meta, actions, description, comments, up next. */
window.Pages = window.Pages || {};
window.Pages.watch = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const watch = U.qs('#watch');
  const primary = U.qs('#watchPrimary');
  const upnext = U.qs('#upnext');
  const videoId = U.param('v') || (API._db.videos[0] && API._db.videos[0].id);

  let current = null;
  let related = [];
  let playerRef = null;
  let metaHost = null;
  let renderToken = 0; // guards against out-of-order loads

  API.getVideo(videoId).then(function (video) {
    current = video;
    document.title = video.title + ' - YClone';
    API.recordWatch(video.id);
    renderPlayer(video);
    renderMeta(video);
    loadComments(video);
  });

  API.getRelated(videoId, 15).then(function (items) {
    related = items;
    renderUpNext();
  });

  /* ---------------------------------------------------------- Player      */
  function renderPlayer(video) {
    primary.innerHTML = '';
    const host = el('div', { id: 'playerHost' });
    primary.appendChild(host);
    metaHost = el('div', { id: 'watchMeta' });
    primary.appendChild(metaHost);
    playerRef = Player.create(host, video, {
      autoplay: false,
      onEnded: function () {
        if (Store.get('autoplay') && related.length) {
          goTo(related[0].id);
        }
      },
      onNext: function () {
        if (related.length) goTo(related[0].id);
      },
      onTheater: function () {
        watch.classList.toggle('is-theater');
      }
    });
  }

  function goTo(id) {
    location.href = 'watch.html?v=' + id;
  }

  /* ---------------------------------------------------------- Meta        */
  function renderMeta(video) {
    const token = ++renderToken;
    metaHost.innerHTML = '';

    const title = el('h1', { class: 'watch__title', text: video.title });
    metaHost.appendChild(title);

    // Channel row + actions
    const row = el('div', { class: 'watch__row' });

    const chanRow = el('div', { class: 'watch__channel-row' });
    const chAvatar = el('a', { href: 'channel.html?id=' + video.channelId });
    chAvatar.appendChild(U.imgWithFallback(video.avatar, video.avatarFallback, { class: 'avatar avatar--lg' }));
    chanRow.appendChild(chAvatar);
    const chInfo = el('div', { class: 'watch__channel-info' });
    const chName = el('a', { class: 'watch__channel-name', href: 'channel.html?id=' + video.channelId });
    chName.appendChild(el('span', { text: video.channelName }));
    if (video.channel && video.channel.verified) chName.insertAdjacentHTML('beforeend', UI.verifiedIcon(14));
    chInfo.appendChild(chName);
    const subText = el('div', {
      class: 'watch__channel-subs',
      text: video.channel ? U.formatViews(video.channel.subscribers) + ' subscribers' : ''
    });
    chInfo.appendChild(subText);
    chanRow.appendChild(chInfo);
    if (video.channel) {
      chanRow.appendChild(UI.subscribeButton(video.channel, function (now) {
        const n = video.channel.subscribers + (now ? 1 : 0);
        subText.textContent = U.formatViews(n) + ' subscribers';
      }));
    }
    row.appendChild(chanRow);

    // Actions
    const actions = el('div', { class: 'watch__actions' });
    const likeState = Store.getLike(video.id) || null;
    const likeCount = video.likes + (likeState === 'like' ? 1 : 0);
    const dislikeCount = video.dislikes + (likeState === 'dislike' ? 1 : 0);

    const group = el('div', { class: 'btn-group' });
    const likeBtn = el('button', {
      class: 'btn' + (likeState === 'like' ? ' is-active' : ''),
      title: 'I like this'
    });
    likeBtn.innerHTML = icon('like', 20) + '<span>' + U.formatCount(likeCount) + '</span>';
    const dislikeBtn = el('button', {
      class: 'btn' + (likeState === 'dislike' ? ' is-active' : ''),
      title: 'I dislike this'
    });
    dislikeBtn.innerHTML = icon('dislike', 20) + '<span>' + U.formatCount(dislikeCount) + '</span>';

    function refreshLike() {
      const s = Store.getLike(video.id);
      likeBtn.classList.toggle('is-active', s === 'like');
      dislikeBtn.classList.toggle('is-active', s === 'dislike');
      likeBtn.querySelector('span').textContent = U.formatCount(video.likes + (s === 'like' ? 1 : 0));
      dislikeBtn.querySelector('span').textContent = U.formatCount(video.dislikes + (s === 'dislike' ? 1 : 0));
    }
    likeBtn.addEventListener('click', function () {
      Store.setLike(video.id, Store.getLike(video.id) === 'like' ? null : 'like');
      refreshLike();
    });
    dislikeBtn.addEventListener('click', function () {
      Store.setLike(video.id, Store.getLike(video.id) === 'dislike' ? null : 'dislike');
      refreshLike();
    });
    group.appendChild(likeBtn);
    group.appendChild(dislikeBtn);
    actions.appendChild(group);

    const shareBtn = el('button', { class: 'btn', html: icon('share', 20) + '<span>Share</span>' });
    shareBtn.addEventListener('click', function () { openShare(video); });
    actions.appendChild(shareBtn);

    const saved = Store.isWatchLater(video.id);
    const saveBtn = el('button', { class: 'btn', html: icon(saved ? 'saveFilled' : 'save', 20) + '<span>' + (saved ? 'Saved' : 'Save') + '</span>' });
    saveBtn.addEventListener('click', function () {
      const now = Store.toggleWatchLater(video.id);
      saveBtn.innerHTML = icon(now ? 'saveFilled' : 'save', 20) + '<span>' + (now ? 'Saved' : 'Save') + '</span>';
      UI.toast(now ? 'Saved to Watch later' : 'Removed from Watch later', now ? 'Undo' : null, function () {
        Store.toggleWatchLater(video.id);
        saveBtn.innerHTML = icon(saved ? 'saveFilled' : 'save', 20) + '<span>' + (saved ? 'Saved' : 'Save') + '</span>';
      });
    });
    actions.appendChild(saveBtn);

    const moreBtn = el('button', { class: 'icon-btn', html: icon('more'), title: 'More', 'aria-label': 'More actions' });
    moreBtn.addEventListener('click', function () {
      let ref;
      ref = UI.openModal({
        title: 'More actions',
        content: el('div', {}, [
          menuRow('trash', 'Not interested', 'Hide this video and get fewer like it.', function () {
            ref.close();
            API.hideVideo(video.id).then(function () {
              UI.toast('You will see fewer videos like this.');
              setTimeout(function () { location.href = 'index.html'; }, 500);
            });
          }),
          menuRow('playlist', 'Save to playlist', 'Add this video to a playlist.', function () {
            ref.close();
            openSaveToPlaylist(video);
          }),
          menuRow('edit', 'Share at current time', 'Copies a link that starts where you are.', function () {
            ref.close();
            copyWatchUrl(video, true);
          }),
          menuRow('feedback', 'Report', 'Report this video to the moderators.', function () {
            ref.close();
            location.href = 'feedback.html?type=report&video=' + video.id;
          })
        ])
      });
    });
    actions.appendChild(moreBtn);
    row.appendChild(actions);

    metaHost.appendChild(row);

    // Description
    const desc = el('div', { class: 'desc is-collapsed' });
    const stats = el('div', {
      class: 'desc__stats',
      text: U.formatCount(video.views) + ' views  ·  ' + U.timeAgo(video.uploadedAt)
    });
    desc.appendChild(stats);
    const descText = el('div', { class: 'desc__text', text: video.description });
    desc.appendChild(descText);
    const tags = el('div', { class: 'desc__tags', text: (video.tags || []).map(function (t) { return '#' + t; }).join(' ') });
    desc.appendChild(tags);
    const toggle = el('button', { class: 'desc__toggle', text: '...more' });
    toggle.addEventListener('click', function () {
      const collapsed = desc.classList.toggle('is-collapsed');
      toggle.textContent = collapsed ? '...more' : 'Show less';
    });
    desc.appendChild(toggle);
    metaHost.appendChild(desc);

    // Comments host
    metaHost.appendChild(el('div', { class: 'comments', id: 'comments' }));
  }

  function menuRow(ic, title, subtitle, onClick) {
    const b = el('button', { class: 'menu-pop__item', style: 'align-items:flex-start' });
    b.appendChild(el('span', { class: 'sidebar__icon', html: icon(ic, 22) }));
    const d = el('div');
    d.appendChild(el('div', { text: title }));
    d.appendChild(el('div', { class: 'muted', style: 'font-size:12px', text: subtitle }));
    b.appendChild(d);
    b.addEventListener('click', function () { if (onClick) onClick(); });
    return b;
  }

  function copyWatchUrl(video, withTime) {
    let url = (location.origin === 'null' ? 'watch.html?v=' + video.id : location.origin + location.pathname + '?v=' + video.id);
    if (withTime && playerRef) {
      url += '&t=' + Math.floor(playerRef.currentTime ? playerRef.currentTime() : 0);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        UI.toast(withTime ? 'Link with timestamp copied.' : 'Link copied to clipboard.');
      }).catch(function () { UI.toast('Link: ' + url); });
    } else {
      UI.toast('Link: ' + url);
    }
  }

  function openSaveToPlaylist(video) {
    const body = el('div');
    const list = el('div');
    body.appendChild(list);
    const msg = el('div', { class: 'help', style: 'min-height:16px' });

    function draw() {
      list.innerHTML = '';
      const mine = Store.getPlaylists();
      const watchLaterRow = row('Watch later', Store.isWatchLater(video.id), function () {
        const now = Store.toggleWatchLater(video.id);
        UI.toast(now ? 'Saved to Watch later' : 'Removed from Watch later');
        draw();
      });
      list.appendChild(watchLaterRow);
      mine.forEach(function (pl) {
        const included = pl.videoIds.indexOf(video.id) !== -1;
        list.appendChild(row(pl.title, included, function () {
          if (!included) {
            API.addToPlaylist(pl.id, video.id).then(function () { UI.toast('Added to “' + pl.title + '”.'); draw(); });
          } else {
            UI.toast('Already in “' + pl.title + '”.');
          }
        }));
      });
    }

    function row(label, checked, onClick) {
      const b = el('button', { class: 'menu-pop__item', style: 'justify-content:space-between;width:100%' });
      b.appendChild(el('span', { text: label }));
      b.appendChild(el('span', { html: icon(checked ? 'check' : 'playlist', 18) }));
      b.addEventListener('click', onClick);
      return b;
    }

    draw();
    body.appendChild(msg);

    const create = el('button', {
      class: 'btn btn--ghost btn--block', style: 'margin-top:12px',
      html: icon('create', 18) + '<span>New playlist</span>'
    });
    create.addEventListener('click', function () {
      const input = el('input', { class: 'input', placeholder: 'Playlist name' });
      const err = el('div', { class: 'help', style: 'color:var(--brand);min-height:16px' });
      const content = el('div');
      content.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Name' }), input]));
      content.appendChild(err);
      let nref;
      const ok = el('button', { class: 'btn btn--filled', text: 'Create' });
      ok.addEventListener('click', function () {
        API.createPlaylist(input.value).then(function (pl) {
          return API.addToPlaylist(pl.id, video.id).then(function () {
            nref.close();
            UI.toast('Created “' + pl.title + '” and added this video.');
            draw();
          });
        }).catch(function (e) { err.textContent = e.message; });
      });
      nref = UI.openModal({ title: 'New playlist', content: content, footer: [ok] });
      setTimeout(function () { input.focus(); }, 50);
    });
    body.appendChild(create);

    UI.openModal({ title: 'Save video to…', content: body });
  }

  function openShare(video) {
    const url = location.origin === 'null'
      ? 'watch.html?v=' + video.id
      : location.href;
    let ref;
    const input = el('input', { class: 'input', value: url, readonly: true });
    const body = el('div');
    body.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Video link' }), input]));
    const copy = el('button', { class: 'btn btn--filled', text: 'Copy link' });
    copy.addEventListener('click', function () {
      input.select();
      navigator.clipboard && navigator.clipboard.writeText(url).then(function () {
        UI.toast('Link copied to clipboard.');
      }).catch(function () { UI.toast('Link: ' + url); });
      if (!navigator.clipboard) UI.toast('Link: ' + url);
      ref.close();
    });
    ref = UI.openModal({ title: 'Share', content: body, footer: [copy] });
  }

  /* ---------------------------------------------------------- Comments    */
  let commentsState = { items: [], total: 0, sort: 'top' };

  function loadComments(video) {
    const host = U.qs('#comments');
    if (!host) return;
    host.innerHTML = '';
    host.appendChild(el('div', { class: 'skeleton sk-line', style: 'width:200px;height:20px' }));
    API.getComments(video.id).then(function (res) {
      commentsState.items = res.items;
      commentsState.total = res.totalCount;
      renderComments(video);
    });
  }

  function renderComments(video) {
    const host = U.qs('#comments');
    host.innerHTML = '';
    if (!host.children.length) { /* noop */ }

    const head = el('div', { class: 'comments__head' });
    head.appendChild(el('div', { class: 'comments__count', text: U.formatCount(commentsState.total) + ' Comments' }));
    const sortBtn = el('button', { class: 'comments__sort', html: icon('sort', 22) + '<span>' + (commentsState.sort === 'top' ? 'Top comments' : 'Newest first') + '</span>' });
    sortBtn.addEventListener('click', function () {
      commentsState.sort = commentsState.sort === 'top' ? 'newest' : 'top';
      renderComments(video);
    });
    head.appendChild(sortBtn);
    host.appendChild(head);

    // Form
    const user = Store.get('user');
    const form = el('form', { class: 'comment-form' });
    form.appendChild(el('img', {
      class: 'avatar avatar--lg',
      src: U.avatarDataUri(user ? user.name : 'Guest User'), alt: ''
    }));
    const field = el('div', { class: 'comment-form__field' });
    const input = el('input', {
      class: 'comment-input', type: 'text', placeholder: 'Add a comment...',
      'aria-label': 'Add a comment'
    });
    field.appendChild(input);
    const actions = el('div', { class: 'comment-form__actions hidden' });
    const cancel = el('button', { type: 'button', class: 'btn btn--ghost', text: 'Cancel' });
    const submit = el('button', { type: 'submit', class: 'btn btn--filled', text: 'Comment' });
    actions.appendChild(cancel);
    actions.appendChild(submit);
    field.appendChild(actions);
    form.appendChild(field);

    function reset() { input.value = ''; actions.classList.add('hidden'); }
    input.addEventListener('focus', function () {
      if (!user) {
        UI.toast('Sign in to add a comment.', 'Sign in', function () { location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search); });
        input.blur();
        return;
      }
      actions.classList.remove('hidden');
    });
    cancel.addEventListener('click', reset);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!user) return;
      const text = input.value.trim();
      if (!text) return;
      submit.disabled = true;
      API.postComment(video.id, text).then(function (c) {
        c.avatar = U.avatarDataUri(c.author);
        commentsState.items.unshift(c);
        commentsState.total += 1;
        submit.disabled = false;
        reset();
        renderComments(video);
        UI.toast('Comment posted.');
      }).catch(function (err) {
        submit.disabled = false;
        UI.toast(err.message || 'Could not post comment.');
      });
    });
    host.appendChild(form);

    // List
    let items = commentsState.items.slice();
    if (commentsState.sort === 'top') items.sort(function (a, b) { return b.likes - a.likes; });
    else items.sort(function (a, b) { return a.hoursAgo - b.hoursAgo; });

    const list = el('div');
    items.forEach(function (c) { list.appendChild(commentNode(c)); });
    host.appendChild(list);
  }

  function commentNode(c) {
    const node = el('div', { class: 'comment' });
    node.appendChild(el('img', { class: 'avatar avatar--lg', src: c.avatar || U.avatarDataUri(c.author), alt: '' }));
    const body = el('div', { class: 'comment__body' });

    const head = el('div', { class: 'comment__head' });
    head.appendChild(el('span', { class: 'comment__author', text: c.author }));
    head.appendChild(el('span', { class: 'comment__time', text: c.hoursAgo <= 1 ? 'just now' : c.hoursAgo + ' hours ago' }));
    body.appendChild(head);
    body.appendChild(el('div', { class: 'comment__text', text: c.text }));

    const row = el('div', { class: 'comment__actions' });
    const liked = !!Store.get('commentLikes')[c.id];
    const likeBtn = el('button', { class: 'comment__action' + (liked ? ' is-active' : '') });
    likeBtn.innerHTML = icon('like', 16) + '<span>' + U.formatCount(c.likes + (liked ? 1 : 0)) + '</span>';
    likeBtn.addEventListener('click', function () {
      const on = Store.toggleCommentLike(c.id);
      likeBtn.classList.toggle('is-active', on);
      likeBtn.querySelector('span').textContent = U.formatCount(c.likes + (on ? 1 : 0));
      if (on && Store.isCommentDisliked(c.id)) {
        Store.toggleCommentDislike(c.id);
        dis.classList.remove('is-active');
      }
    });
    row.appendChild(likeBtn);

    const dis = el('button', { class: 'comment__action' + (Store.isCommentDisliked(c.id) ? ' is-active' : ''), html: icon('dislike', 16) });
    dis.addEventListener('click', function () {
      const on = Store.toggleCommentDislike(c.id);
      dis.classList.toggle('is-active', on);
      // Disliking clears a like on the same comment.
      likeBtn.classList.remove('is-active');
      likeBtn.querySelector('span').textContent = U.formatCount(c.likes);
    });
    row.appendChild(dis);

    const replyBtn = el('button', { class: 'comment__action comment__replies-btn', text: 'Reply' });
    row.appendChild(replyBtn);

    const repliesHost = el('div', { class: 'comment__replies' });
    function drawReplies() {
      repliesHost.innerHTML = '';
      (c.replies || []).forEach(function (r) {
        const rn = el('div', { class: 'comment' });
        rn.appendChild(el('img', { class: 'avatar avatar--md', src: U.avatarDataUri(r.author), alt: '' }));
        const rb = el('div', { class: 'comment__body' });
        const rh = el('div', { class: 'comment__head' });
        rh.appendChild(el('span', { class: 'comment__author', text: r.author }));
        rh.appendChild(el('span', { class: 'comment__time', text: (r.hoursAgo <= 1 ? 'just now' : r.hoursAgo + ' hours ago') }));
        rb.appendChild(rh);
        rb.appendChild(el('div', { class: 'comment__text', text: r.text }));
        rn.appendChild(rb);
        repliesHost.appendChild(rn);
      });
    }
    drawReplies();

    replyBtn.addEventListener('click', function () {
      const user = Store.get('user');
      if (!user) {
        UI.toast('Sign in to reply.', 'Sign in', function () { location.href = 'login.html'; });
        return;
      }
      if (repliesHost.querySelector('.comment-form')) return;
      const rf = el('form', { class: 'comment-form' });
      rf.appendChild(el('img', { class: 'avatar avatar--md', src: U.avatarDataUri(user.name), alt: '' }));
      const rinput = el('input', { class: 'comment-input', type: 'text', placeholder: 'Add a reply...' });
      rf.appendChild(rinput);
      rf.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = rinput.value.trim();
        if (!text) return;
        c.replies = c.replies || [];
        c.replies.push({ id: c.id + '-r' + Date.now(), author: user.name, text: text, likes: 0, hoursAgo: 0 });
        renderComments(current);
      });
      repliesHost.appendChild(rf);
      rinput.focus();
    });

    body.appendChild(row);
    body.appendChild(repliesHost);
    node.appendChild(body);
    return node;
  }

  /* ---------------------------------------------------------- Up next     */
  function renderUpNext() {
    upnext.innerHTML = '';
    upnext.appendChild(el('h2', { text: 'Up next' }));

    const autoRow = el('div', { class: 'autoplay-row' });
    autoRow.appendChild(el('span', { text: 'Autoplay' }));
    const switchBtn = el('button', {
      class: 'btn' + (Store.get('autoplay') ? ' is-active' : ''),
      text: Store.get('autoplay') ? 'On' : 'Off'
    });
    switchBtn.addEventListener('click', function () {
      const v = !Store.get('autoplay');
      Store.set('autoplay', v);
      switchBtn.classList.toggle('is-active', v);
      switchBtn.textContent = v ? 'On' : 'Off';
    });
    autoRow.appendChild(switchBtn);
    upnext.appendChild(autoRow);

    related.forEach(function (v) { upnext.appendChild(UI.videoRow(v)); });
  }
};
