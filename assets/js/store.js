/* ==========================================================================
   store.js - client-side persistent state (localStorage).
   This stands in for server session state until a backend is wired up.
   ========================================================================== */
window.Store = (function () {
  'use strict';

  const KEY = 'yclone.state.v1';
  const listeners = {};

  const DEFAULTS = {
    theme: 'dark',
    user: null,                 // { name, email, avatarSeed }
    subscriptions: [],          // channelId[]
    likes: {},                  // videoId -> 'like' | 'dislike'
    watchLater: [],             // videoId[]
    history: [],                // { videoId, at, progress }
    uploads: [],                // video objects created via Studio
    comments: {},               // videoId -> [comment]
    commentLikes: {},           // commentId -> true
    commentDislikes: {},        // commentId -> true
    searchHistory: [],
    hiddenVideos: [],           // "not interested" videoIds
    notificationsRead: false,
    channelNotify: {},          // channelId -> 'all' | 'personalized' | 'none'
    playlists: [],              // user-created playlists [{ id, title, videoIds, createdAt }]
    feedback: [],               // submitted feedback/reports
    prefs: {
      playbackQuality: 'auto',  // 'auto' | 'hd' | 'sd'
      captions: true,
      volume: 1,
      notifications: { subscriptions: true, comments: true, replies: true }
    },
    autoplay: true,
    sidebarOpen: true
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      const parsed = JSON.parse(raw);
      const merged = Object.assign(clone(DEFAULTS), parsed);
      // Deep-merge prefs so new preference keys survive an older saved state.
      merged.prefs = Object.assign(clone(DEFAULTS.prefs), parsed.prefs || {});
      merged.prefs.notifications = Object.assign(
        clone(DEFAULTS.prefs.notifications),
        (parsed.prefs && parsed.prefs.notifications) || {}
      );
      return merged;
    } catch (e) {
      console.warn('[store] failed to load, using defaults', e);
      return clone(DEFAULTS);
    }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.warn('[store] persist failed', e); }
  }

  function emit(topic, payload) {
    (listeners[topic] || []).forEach(function (fn) {
      try { fn(payload, state); } catch (e) { console.error(e); }
    });
    (listeners['*'] || []).forEach(function (fn) { fn(topic, payload); });
  }

  function on(topic, fn) {
    (listeners[topic] = listeners[topic] || []).push(fn);
    return function off() {
      listeners[topic] = listeners[topic].filter(function (f) { return f !== fn; });
    };
  }

  function get(key) { return key === undefined ? state : state[key]; }

  function set(key, value) {
    state[key] = value;
    persist();
    emit(key, value);
    return value;
  }

  function update(fn) {
    fn(state);
    persist();
    emit('*', state);
    return state;
  }

  function reset() {
    state = clone(DEFAULTS);
    persist();
    emit('*', state);
  }

  /* ---- Convenience operations (thin wrappers over raw state) ------------ */
  const api = {
    KEY: KEY,
    get: get, set: set, update: update, reset: reset, on: on,

    isSubscribed: function (channelId) { return state.subscriptions.indexOf(channelId) !== -1; },
    toggleSubscription: function (channelId) {
      const i = state.subscriptions.indexOf(channelId);
      if (i === -1) state.subscriptions.push(channelId);
      else state.subscriptions.splice(i, 1);
      persist(); emit('subscriptions', state.subscriptions);
      return i === -1; // true if now subscribed
    },

    isWatchLater: function (videoId) { return state.watchLater.indexOf(videoId) !== -1; },
    toggleWatchLater: function (videoId) {
      const i = state.watchLater.indexOf(videoId);
      if (i === -1) state.watchLater.unshift(videoId);
      else state.watchLater.splice(i, 1);
      persist(); emit('watchLater', state.watchLater);
      return i === -1;
    },

    getLike: function (videoId) { return state.likes[videoId] || null; },
    setLike: function (videoId, value) {
      if (!value) delete state.likes[videoId];
      else state.likes[videoId] = value;
      persist(); emit('likes', state.likes);
      return state.likes[videoId] || null;
    },

    addHistory: function (videoId, progress) {
      state.history = state.history.filter(function (h) { return h.videoId !== videoId; });
      state.history.unshift({ videoId: videoId, at: Date.now(), progress: progress || 0 });
      state.history = state.history.slice(0, 200);
      persist(); emit('history', state.history);
    },
    setProgress: function (videoId, progress) {
      const h = state.history.find(function (x) { return x.videoId === videoId; });
      if (h) { h.progress = progress; h.at = Date.now(); persist(); }
    },
    clearHistory: function () { state.history = []; persist(); emit('history', []); },

    addComment: function (videoId, comment) {
      (state.comments[videoId] = state.comments[videoId] || []).unshift(comment);
      persist(); emit('comments', videoId);
      return comment;
    },
    getLocalComments: function (videoId) { return state.comments[videoId] || []; },

    toggleCommentLike: function (commentId) {
      if (state.commentLikes[commentId]) delete state.commentLikes[commentId];
      else state.commentLikes[commentId] = true;
      persist(); emit('commentLikes', state.commentLikes);
      return !!state.commentLikes[commentId];
    },

    isCommentDisliked: function (commentId) { return !!state.commentDislikes[commentId]; },
    toggleCommentDislike: function (commentId) {
      const on = !state.commentDislikes[commentId];
      if (on) { state.commentDislikes[commentId] = true; delete state.commentLikes[commentId]; }
      else delete state.commentDislikes[commentId];
      persist();
      emit('commentLikes', state.commentLikes);
      emit('commentDislikes', state.commentDislikes);
      return on;
    },

    hideVideo: function (videoId) {
      if (state.hiddenVideos.indexOf(videoId) === -1) state.hiddenVideos.unshift(videoId);
      persist(); emit('hiddenVideos', state.hiddenVideos);
    },
    isHidden: function (videoId) { return state.hiddenVideos.indexOf(videoId) !== -1; },

    getPref: function (key) { return key == null ? state.prefs : state.prefs[key]; },
    setPref: function (key, value) {
      state.prefs[key] = value; persist(); emit('prefs', state.prefs); return value;
    },
    setPrefNested: function (group, key, value) {
      state.prefs[group] = state.prefs[group] || {};
      state.prefs[group][key] = value; persist(); emit('prefs', state.prefs); return value;
    },

    markNotificationsRead: function () {
      state.notificationsRead = true; persist(); emit('notificationsRead', true);
    },

    addFeedback: function (entry) {
      entry = Object.assign({ id: 'fb-' + Date.now(), at: Date.now() }, entry || {});
      state.feedback.unshift(entry); persist(); emit('feedback', state.feedback); return entry;
    },

    getChannelNotify: function (channelId) { return state.channelNotify[channelId] || 'personalized'; },
    setChannelNotify: function (channelId, mode) {
      state.channelNotify[channelId] = mode; persist(); emit('channelNotify', state.channelNotify); return mode;
    },

    addPlaylist: function (pl) {
      state.playlists.unshift(pl); persist(); emit('playlists', state.playlists); return pl;
    },
    getPlaylists: function () { return state.playlists; },
    findPlaylist: function (id) {
      return state.playlists.find(function (p) { return p.id === id; });
    },
    addToPlaylist: function (id, videoId) {
      const p = state.playlists.find(function (x) { return x.id === id; });
      if (!p) return false;
      if (p.videoIds.indexOf(videoId) === -1) p.videoIds.push(videoId);
      persist(); emit('playlists', state.playlists); return true;
    },
    removePlaylist: function (id) {
      state.playlists = state.playlists.filter(function (p) { return p.id !== id; });
      persist(); emit('playlists', state.playlists);
    },

    addUpload: function (video) {
      state.uploads.unshift(video);
      persist(); emit('uploads', state.uploads);
      return video;
    },
    removeUpload: function (id) {
      state.uploads = state.uploads.filter(function (v) { return v.id !== id; });
      persist(); emit('uploads', state.uploads);
    },

    rememberSearch: function (q) {
      q = String(q || '').trim();
      if (!q) return;
      state.searchHistory = [q].concat(state.searchHistory.filter(function (x) { return x !== q; })).slice(0, 12);
      persist();
    },

    setTheme: function (t) {
      state.theme = t;
      persist();
      document.documentElement.setAttribute('data-theme', t);
      emit('theme', t);
    },

    login: function (user) { state.user = user; persist(); emit('user', user); return user; },
    logout: function () { state.user = null; persist(); emit('user', null); }
  };

  // Apply theme as early as possible to avoid a flash.
  document.documentElement.setAttribute('data-theme', state.theme || 'dark');

  return api;
})();
