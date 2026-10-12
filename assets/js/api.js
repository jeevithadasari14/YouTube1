/* ==========================================================================
   api.js - the single seam between UI and data.

   Every method is async and returns a Promise, exactly like a REST client
   would. Today it resolves against Seed + Store with a small latency; to move
   to a real backend you only replace the body of each method with fetch().
   The intended endpoint is noted above each method.
   ========================================================================== */
window.API = (function () {
  'use strict';

  const LATENCY = 220;               // simulated network delay (ms)
  const db = Seed.build();
  const videosById = {};
  db.videos.forEach(function (v) { videosById[v.id] = v; });
  const channelsById = {};
  db.channels.forEach(function (c) { channelsById[c.id] = c; });

  /* ---- helpers ---------------------------------------------------------- */
  function delay(ms) {
    return new Promise(function (r) { setTimeout(r, ms == null ? LATENCY : ms); });
  }

  // Wrap a synchronous resolver so callers always get a Promise.
  function respond(fn, ms) {
    return delay(ms).then(function () {
      try { return fn(); }
      catch (err) { console.error('[api]', err); throw err; }
    });
  }

  function channelFor(v) {
    const c = channelsById[v.channelId];
    if (!c) return null;
    return {
      id: c.id, name: c.name, handle: c.handle, verified: c.verified,
      subscribers: c.subscribers, description: c.description, joined: c.joined,
      category: c.category,
      avatar: U.avatarDataUri(c.name)
    };
  }

  // The shape the UI consumes (mirrors a typical video DTO).
  function decorate(v) {
    if (!v) return null;
    const ch = channelFor(v);
    return Object.assign({}, v, {
      channel: ch,
      thumbUrl: U.remoteThumb(v.thumb, 640, 360),
      thumbFallback: U.thumbDataUri(v.thumb, v.category),
      avatar: ch ? ch.avatar : U.avatarDataUri('?'),
      avatarFallback: ch ? U.avatarDataUri(ch.name) : U.avatarDataUri('?')
    });
  }

  function allVideos() {
    return Store.get('uploads').concat(db.videos);
  }

  function sortVideos(list, sort) {
    const l = list.slice();
    switch (sort) {
      case 'oldest': return l.sort(function (a, b) { return new Date(a.uploadedAt) - new Date(b.uploadedAt); });
      case 'views': return l.sort(function (a, b) { return b.views - a.views; });
      case 'likes': return l.sort(function (a, b) { return b.likes - a.likes; });
      case 'title': return l.sort(function (a, b) { return a.title.localeCompare(b.title); });
      default: return l.sort(function (a, b) { return new Date(b.uploadedAt) - new Date(a.uploadedAt); }); // 'recent'
    }
  }

  function matches(v, q) {
    if (!q) return true;
    q = q.toLowerCase();
    return v.title.toLowerCase().indexOf(q) !== -1 ||
      v.channelName.toLowerCase().indexOf(q) !== -1 ||
      (v.category || '').toLowerCase().indexOf(q) !== -1 ||
      (v.tags || []).some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
  }

  /* ====================================================================== */
  const api = {
    /* GET /api/videos?category=&channelId=&q=&sort=&limit=&offset= */
    getVideos: function (opts) {
      opts = opts || {};
      return respond(function () {
        let list = allVideos().filter(function (v) {
          if (Store.isHidden(v.id)) return false;
          if (opts.category && opts.category !== 'All' && v.category !== opts.category) return false;
          if (opts.channelId && v.channelId !== opts.channelId) return false;
          if (opts.exclude && opts.exclude.indexOf(v.id) !== -1) return false;
          if (!matches(v, opts.q)) return false;
          return true;
        });
        list = sortVideos(list, opts.sort);
        const total = list.length;
        const offset = opts.offset || 0;
        const limit = opts.limit || total;
        list = list.slice(offset, offset + limit);
        return { items: list.map(decorate), total: total };
      });
    },

    /* GET /api/videos/:id */
    getVideo: function (id) {
      return respond(function () {
        const v = allVideos().find(function (x) { return x.id === id; });
        return decorate(v || db.videos[0]);
      }, 160);
    },

    /* GET /api/videos/:id/related */
    getRelated: function (id, limit) {
      return respond(function () {
        const base = videosById[id] || allVideos().find(function (x) { return x.id === id; });
        const pool = allVideos().filter(function (v) { return v.id !== id && !Store.isHidden(v.id); });
        if (!base) return pool.slice(0, limit || 12).map(decorate);
        // Same category first, then same channel, then rest.
        const scored = pool.map(function (v) {
          let score = 0;
          if (v.category === base.category) score += 2;
          if (v.channelId === base.channelId) score += 1;
          return { v: v, score: score, t: new Date(v.uploadedAt).getTime() };
        }).sort(function (a, b) { return b.score - a.score || b.t - a.t; });
        return scored.slice(0, limit || 12).map(function (s) { return decorate(s.v); });
      }, 200);
    },

    /* GET /api/channels/:id */
    getChannel: function (id) {
      return respond(function () {
        const c = channelsById[id];
        if (!c) return null;
        return Object.assign({}, c, {
          avatar: U.avatarDataUri(c.name),
          banner: U.remoteThumb('banner-' + c.id, 1600, 240),
          bannerFallback: U.thumbDataUri('banner-' + c.id, ''),
          videoCount: allVideos().filter(function (v) { return v.channelId === id; }).length
        });
      });
    },

    /* GET /api/channels */
    getChannels: function () {
      return respond(function () {
        return db.channels.map(function (c) {
          return Object.assign({}, c, { avatar: U.avatarDataUri(c.name) });
        });
      }, 120);
    },

    /* GET /api/subscriptions/feed - videos from subscribed channels */
    getSubscriptionFeed: function () {
      return respond(function () {
        const subs = Store.get('subscriptions');
        const list = sortVideos(allVideos().filter(function (v) {
          return subs.indexOf(v.channelId) !== -1 && !Store.isHidden(v.id);
        }), 'recent');
        return { items: list.map(decorate), channelIds: subs };
      }, 180);
    },

    /* GET /api/videos/:id/comments */
    getComments: function (videoId) {
      return respond(function () {
        const base = videosById[videoId] || Store.get('uploads').find(function (v) { return v.id === videoId; });
        const local = Store.getLocalComments(videoId);
        // Seed a realistic thread, sized to the video's comment count.
        const size = base ? U.clamp(Math.round(base.commentsCount / 12000), 6, 18) : 8;
        const seeded = Seed.commentsFor(videoId, size).map(function (c) {
          return Object.assign({}, c, { avatar: U.avatarDataUri(c.author) });
        });
        const items = local.map(function (c) {
          return Object.assign({}, c, { avatar: U.avatarDataUri(c.author) });
        }).concat(seeded);
        const total = (base ? base.commentsCount : 0) + local.length;
        return { items: items, totalCount: total };
      }, 260);
    },

    /* POST /api/videos/:id/comments  { text } */
    postComment: function (videoId, text) {
      return respond(function () {
        text = String(text || '').trim();
        if (!text) throw new Error('Comment text is required');
        const user = Store.get('user') || { name: 'You', avatarSeed: 'guest' };
        const comment = {
          id: 'local-' + videoId + '-' + Date.now(),
          videoId: videoId,
          author: user.name,
          avatar: U.avatarDataUri(user.name),
          text: text,
          likes: 0,
          hoursAgo: 0,
          local: true,
          replies: []
        };
        return Store.addComment(videoId, comment);
      }, 140);
    },

    /* POST /api/videos/:id/rating  { value: 'like'|'dislike'|null } */
    setRating: function (videoId, value) {
      return respond(function () { return Store.setLike(videoId, value); }, 90);
    },

    /* POST /api/videos/:id/watch-later */
    toggleWatchLater: function (videoId) {
      return respond(function () { return Store.toggleWatchLater(videoId); }, 90);
    },

    /* GET /api/me/watch-later */
    getWatchLater: function () {
      return respond(function () {
        const ids = Store.get('watchLater');
        const list = ids.map(function (id) {
          return allVideos().find(function (v) { return v.id === id; });
        }).filter(Boolean);
        return list.map(decorate);
      }, 150);
    },

    /* GET /api/me/liked */
    getLiked: function () {
      return respond(function () {
        const likes = Store.get('likes');
        const list = Object.keys(likes).filter(function (id) { return likes[id] === 'like'; })
          .map(function (id) { return allVideos().find(function (v) { return v.id === id; }); })
          .filter(Boolean);
        return list.map(decorate);
      }, 150);
    },

    /* GET /api/me/history */
    getHistory: function () {
      return respond(function () {
        return Store.get('history').map(function (h) {
          const v = allVideos().find(function (x) { return x.id === h.videoId; });
          return v ? Object.assign(decorate(v), { watchedAt: h.at, progress: h.progress }) : null;
        }).filter(Boolean);
      }, 150);
    },

    /* POST /api/history  { videoId } */
    recordWatch: function (videoId) {
      return respond(function () { Store.addHistory(videoId); return true; }, 60);
    },

    /* GET /api/search?q=&sort=&duration= */
    search: function (q, opts) {
      opts = opts || {};
      return respond(function () {
        let list = allVideos().filter(function (v) { return !Store.isHidden(v.id) && matches(v, q); });
        if (opts.uploadDate === 'today') {
          list = list.filter(function (v) { return Date.now() - new Date(v.uploadedAt) < 864e5; });
        }
        if (opts.duration === 'short') list = list.filter(function (v) { return v.duration < 240; });
        if (opts.duration === 'long') list = list.filter(function (v) { return v.duration > 1200; });
        list = sortVideos(list, opts.sort || 'recent');
        return { items: list.map(decorate), total: list.length, query: q };
      }, 240);
    },

    /* POST /api/videos (multipart in the real thing) */
    uploadVideo: function (meta) {
      return respond(function () {
        meta = meta || {};
        const title = String(meta.title || '').trim() || 'Untitled video';
        const rand = U.seeded('upload-' + Date.now());
        const channelId = (Store.get('user') && Store.get('user').channelId) || 'codecraft';
        const id = 'up-' + Date.now().toString(36);
        const video = {
          id: id,
          title: title,
          channelId: channelId,
          channelName: meta.channelName || (Store.get('user') ? Store.get('user').name : 'Your Channel'),
          category: meta.category || 'Programming',
          duration: meta.duration || Math.floor(120 + rand() * 900),
          views: 0,
          likes: 0,
          dislikes: 0,
          commentsCount: 0,
          uploadedAt: new Date().toISOString(),
          tags: (meta.tags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean),
          src: meta.src || db.videos[0].src,
          thumb: meta.thumbSeed || ('up' + U.hash(id + title)),
          description: meta.description || '',
          visibility: meta.visibility || 'public',
          thumbnailUrl: meta.thumbnailUrl || null,
          ownerUpload: true
        };
        return Store.addUpload(video);
      }, 600);
    },

    /* GET /api/me/videos + /api/me/stats */
    getMyVideos: function () {
      return respond(function () {
        return Store.get('uploads').map(decorate);
      }, 160);
    },

    getStudioStats: function () {
      return respond(function () {
        const mine = Store.get('uploads');
        const views = mine.reduce(function (s, v) { return s + v.views; }, 0);
        const likes = mine.reduce(function (s, v) { return s + v.likes; }, 0);
        return {
          videos: mine.length,
          views: views,
          likes: likes,
          subscribers: Store.get('user') ? 1 : 0
        };
      }, 120);
    },

    /* POST /api/auth/login  { email, password } */
    login: function (email, password) {
      return respond(function () {
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email address');
        if (!password || password.length < 4) throw new Error('Password must be at least 4 characters');
        const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        return Store.login({ name: name, email: email, channelId: 'codecraft' });
      }, 500);
    },

    /* POST /api/auth/signup  { name, email, password } */
    signup: function (name, email, password) {
      return respond(function () {
        if (!name || name.trim().length < 2) throw new Error('Please enter your name');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email address');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
        return Store.login({ name: name.trim(), email: email, channelId: 'codecraft' });
      }, 600);
    },

    /* POST /api/auth/logout */
    logout: function () {
      return respond(function () { Store.logout(); return true; }, 120);
    },

    /* GET /api/playlists?channelId= */
    getPlaylists: function (opts) {
      opts = opts || {};
      return respond(function () {
        const seed = db.playlists.filter(function (p) {
          return !opts.channelId || p.channelId === opts.channelId;
        }).map(function (p) {
          const videos = p.videoIds.map(function (id) { return allVideos().find(function (v) { return v.id === id; }); }).filter(Boolean);
          const ch = channelsById[p.channelId];
          return {
            id: p.id, title: p.title, description: p.description,
            channelId: p.channelId, videoIds: p.videoIds, createdAt: p.createdAt,
            count: videos.length,
            duration: videos.reduce(function (s, v) { return s + v.duration; }, 0),
            thumbUrl: videos[0] ? decorate(videos[0]).thumbUrl : U.thumbDataUri(p.id, ''),
            thumbFallback: videos[0] ? decorate(videos[0]).thumbFallback : U.thumbDataUri(p.id, p.title),
            channelName: ch ? ch.name : '',
            mine: false
          };
        });
        const mine = Store.getPlaylists().map(function (p) {
          const videos = p.videoIds.map(function (id) { return allVideos().find(function (v) { return v.id === id; }); }).filter(Boolean);
          return {
            id: p.id, title: p.title, description: p.description || 'Your playlist',
            channelId: p.channelId, videoIds: p.videoIds, createdAt: p.createdAt,
            count: videos.length, duration: videos.reduce(function (s, v) { return s + v.duration; }, 0),
            thumbUrl: videos[0] ? decorate(videos[0]).thumbUrl : U.thumbDataUri(p.id, p.title),
            thumbFallback: U.thumbDataUri(p.id, p.title),
            channelName: Store.get('user') ? Store.get('user').name : 'You', mine: true
          };
        });
        return { items: mine.concat(seed) };
      }, 160);
    },

    /* GET /api/playlists/:id */
    getPlaylist: function (id) {
      return respond(function () {
        const pl = Store.getPlaylists().find(function (p) { return p.id === id; })
          || db.playlists.find(function (p) { return p.id === id; });
        if (!pl) return null;
        const vids = pl.videoIds.map(function (vid) { return allVideos().find(function (v) { return v.id === vid; }); }).filter(Boolean);
        const ch = channelsById[pl.channelId];
        return {
          id: pl.id, title: pl.title, description: pl.description || '',
          createdAt: pl.createdAt, mine: !!pl.mine,
          channel: ch ? Object.assign({}, ch, { avatar: U.avatarDataUri(ch.name) }) : null,
          videos: vids.map(decorate),
          totalViews: vids.reduce(function (s, v) { return s + (v.views || 0); }, 0),
          duration: vids.reduce(function (s, v) { return s + (v.duration || 0); }, 0)
        };
      }, 180);
    },

    /* POST /api/playlists  { title } */
    createPlaylist: function (title) {
      return respond(function () {
        const clean = String(title || '').trim();
        if (clean.length < 2) throw new Error('Playlist name must be at least 2 characters');
        return Store.addPlaylist({
          id: 'upl-' + Date.now().toString(36),
          title: clean,
          description: '',
          channelId: (Store.get('user') && Store.get('user').channelId) || 'codecraft',
          videoIds: [],
          createdAt: new Date().toISOString(),
          mine: true
        });
      }, 220);
    },

    /* DELETE /api/playlists/:id */
    deletePlaylist: function (id) {
      return respond(function () { Store.removePlaylist(id); return true; }, 120);
    },

    /* POST /api/playlists/:id/videos  { videoId } */
    addToPlaylist: function (id, videoId) {
      return respond(function () { return Store.addToPlaylist(id, videoId); }, 140);
    },

    /* POST /api/videos/:id/not-interested */
    hideVideo: function (videoId) {
      return respond(function () { Store.hideVideo(videoId); return true; }, 120);
    },

    /* GET /api/notifications */
    getNotifications: function () {
      return respond(function () {
        const recent = sortVideos(db.videos.slice(), 'recent').slice(0, 10);
        const items = recent.map(function (v, i) {
          const kind = i % 3 === 0 ? 'subscription' : (i % 3 === 1 ? 'comment' : 'reply');
          return {
            id: 'n-' + v.id,
            kind: kind,
            videoId: v.id,
            channelId: v.channelId,
            channelName: v.channelName,
            avatar: U.avatarDataUri(v.channelName),
            videoTitle: v.title,
            thumbUrl: U.remoteThumb(v.thumb, 160, 90),
            thumbFallback: U.thumbDataUri(v.thumb, v.category),
            text: kind === 'subscription' ? 'uploaded a new video'
              : (kind === 'comment' ? 'commented on a video you watch' : 'replied to your comment'),
            at: v.uploadedAt
          };
        });
        return { items: items, unread: Store.get('notificationsRead') ? 0 : items.length };
      }, 200);
    },

    /* POST /api/notifications/read */
    markAllNotificationsRead: function () {
      return respond(function () { Store.markNotificationsRead(); return true; }, 100);
    },

    /* POST /api/feedback  { type, subject, message, email } */
    submitFeedback: function (payload) {
      return respond(function () {
        payload = payload || {};
        if (!payload.message || String(payload.message).trim().length < 5) {
          throw new Error('Please describe your feedback in a little more detail');
        }
        return Store.addFeedback({
          type: payload.type || 'feedback',
          subject: payload.subject || '',
          message: String(payload.message).trim(),
          email: payload.email || (Store.get('user') ? Store.get('user').email : ''),
          videoId: payload.videoId || null
        });
      }, 420);
    },

    currentUser: function () { return Store.get('user'); },

    /* expose raw seed for the rare page that needs the full catalogue */
    _db: db,
    _decorate: decorate
  };

  return api;
})();
