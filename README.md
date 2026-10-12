# YClone

A polished, YouTube-inspired video platform frontend built with **plain HTML, CSS and
JavaScript** — no build step, no framework, no dependencies. It ships with realistic demo
data and every screen is wired to a single async data layer (`api.js`) so a real backend can
be dropped in later without touching the UI.

> **Note:** the workflow diagram attached to the original request could not be read (the
> model does not support image input). This build follows the standard YouTube-style flow
> that was agreed instead: **Home feed → Watch → Search → Channel → Subscriptions → Library →
> Studio → Auth**. If the diagram differs, the flow can be adjusted.

---

## Quick start

Because everything is static, you can either:

**A. Open directly**

```
Double-click index.html
```

Most features work straight from `file://`. For the most reliable experience (and to avoid
browser restrictions), serve the folder instead:

**B. Serve locally (recommended)**

```powershell
# any one of these, run from this folder
npx serve .
# or
python -m http.server 5173
```

Then open <http://localhost:5173>.

---

## Demo credentials

The auth screens accept **any** well-formed email plus a password of 4+ characters
(6+ for sign-up). A one-click **“Use demo credentials”** button fills these in:

```
email:    demo.viewer@yclone.dev
password: demo1234
```

You do **not** need to sign in to browse. Signing in unlocks commenting and reply posting.

---

## What works

| Area | Details |
| --- | --- |
| **Home feed** | Category chips, 40 seeded videos, “Recommended”/“Trending” sorting, skeleton loaders, responsive card grid. |
| **Watch** | Custom HTML5 player (play/seek/volume/speed/keyboard shortcuts/fullscreen/theater), expandable description, like/dislike, share modal, Save to Watch later, subscribe, comment thread with sorting, replies and likes, “Up next” with autoplay. |
| **Search** | Query from the header, result rows, filters (relevance/views/rating/date, upload date, duration), URL-driven so results are shareable. |
| **Channel** | Banner, avatar, subscriber count, subscribe, and **Videos / Playlists / About** tabs. |
| **Subscriptions** | Feed of only subscribed channels, channel strip, recommended-channels onboarding when empty. |
| **Library** | History (with clear-all), Playlists (with a playlist detail page), Watch later, Liked videos, Your videos — all persisted. |
| **Playlist** | Dedicated playlist page with art, Play all, Shuffle, per-video list and delete for your own playlists. |
| **Studio** | Stat cards, drag-and-drop upload with a captured video frame as thumbnail, title/description/tags/category, Public/Unlisted/Private visibility, a **Go live** tab, a manage-videos table (edit/delete) and a small analytics view. |
| **Notifications** | Header bell with a live panel, plus a full `/notifications.html` page with filters and “Mark all as read”. |
| **Settings** | Account, Appearance (theme, reduce motion), Playback (autoplay, captions, quality, volume), Notifications and Data & privacy controls — all persisted. |
| **Help / Feedback / About** | Searchable FAQ, feedback & video-report form (stored), and an About page with live stats. |
| **Auth** | Sign in / sign up with inline validation; session persists across pages. |
| **Global** | Collapsible sidebar, dark/light theme (persisted), notifications panel, account menu, a working Create menu (upload / go live / new playlist), voice search (where supported), toasts, and a 404 page. Everything is responsive down to mobile. |

Every button, menu, toggle and form on every page performs a real action — navigation, a
persisted state change, or a submission. There are no dead “coming soon” stubs.

Everything interactive is **persisted in `localStorage`**: theme, session, subscriptions,
likes, watch later, history, comments, comment likes/dislikes, playlists, notifications,
channel notification settings, feedback and uploads.

### Player keyboard shortcuts

`Space` / `K` play-pause · `M` mute · `F` fullscreen · `T` theater · `←`/`→` seek · `↑`/`↓` volume

---

## Project structure

```
.
├── index.html            # Home feed
├── watch.html            # Player + comments + up next
├── results.html          # Search results
├── channel.html          # Channel page
├── subscriptions.html    # Subscription feed
├── library.html          # History / Watch later / Liked / Your videos / Playlists
├── playlist.html         # Playlist detail (Play all / Shuffle / delete)
├── studio.html           # Creator dashboard (upload, go live, manage, analytics)
├── notifications.html    # Full notifications list
├── settings.html         # Account, appearance, playback, notifications, data
├── help.html             # Searchable help centre
├── feedback.html         # Feedback / bug report / video report
├── about.html            # About + live stats
├── login.html            # Sign in
├── signup.html           # Sign up
├── 404.html              # Not-found page
└── assets
    ├── css
    │   └── styles.css    # Design tokens + all component styles
    └── js
        ├── utils.js      # Formatting + DOM + generated-media helpers
        ├── data.js       # Seed ("demo") data — the only file a backend replaces
        ├── store.js      # Persistent client state (localStorage)
        ├── api.js        # ⭐ Async data layer — the backend seam
        ├── components.js # Icons, header, sidebar, cards, toasts, modals
        ├── player.js     # Custom video player
        ├── app.js        # Bootstraps chrome + page controller
        └── page-*.js     # One controller per page
```

Each page includes the shared scripts in order and declares which controller to run via
`<body data-page="...">`. `app.js` renders the shared header/sidebar and then calls
`window.Pages[<data-page>]`.

---

## Connecting a real backend

All data access funnels through **`assets/js/api.js`**. Every method is already `async` and
returns a Promise, and each one documents the REST endpoint it stands in for, e.g.:

```js
/* GET /api/videos?category=&channelId=&q=&sort=&limit=&offset= */
getVideos(opts) { /* currently reads Seed + Store */ }
```

To go live, replace the body of each method with a `fetch` call — the UI keeps working:

```js
getVideos: async function (opts) {
  const qs = new URLSearchParams(opts || {});
  const res = await fetch('/api/videos?' + qs);
  if (!res.ok) throw new Error('Failed to load videos');
  return res.json();          // same shape: { items, total }
},
```

### Endpoint map

| Method | Endpoint |
| --- | --- |
| `getVideos` | `GET /api/videos` |
| `getVideo` | `GET /api/videos/:id` |
| `getRelated` | `GET /api/videos/:id/related` |
| `getComments` / `postComment` | `GET|POST /api/videos/:id/comments` |
| `setRating` | `POST /api/videos/:id/rating` |
| `toggleWatchLater` / `getWatchLater` | `POST /api/videos/:id/watch-later` · `GET /api/me/watch-later` |
| `getLiked` / `getHistory` / `recordWatch` | `GET /api/me/liked` · `GET /api/me/history` · `POST /api/history` |
| `search` | `GET /api/search` |
| `getChannel` / `getChannels` | `GET /api/channels/:id` · `GET /api/channels` |
| `getSubscriptionFeed` | `GET /api/subscriptions/feed` |
| `uploadVideo` / `getMyVideos` / `getStudioStats` | `POST /api/videos` · `GET /api/me/videos` · `GET /api/me/stats` |
| `login` / `signup` / `logout` | `POST /api/auth/login` · `POST /api/auth/signup` · `POST /api/auth/logout` |
| `getPlaylists` / `getPlaylist` | `GET /api/playlists?channelId=` · `GET /api/playlists/:id` |
| `createPlaylist` / `deletePlaylist` / `addToPlaylist` | `POST /api/playlists` · `DELETE /api/playlists/:id` · `POST /api/playlists/:id/videos` |
| `getNotifications` / `markAllNotificationsRead` | `GET /api/notifications` · `POST /api/notifications/read` |
| `submitFeedback` | `POST /api/feedback` |
| `hideVideo` | `POST /api/videos/:id/not-interested` |

Client-only state (theme, likes, watch later, history…) lives in `store.js`; when the backend
owns users, move those writes behind API calls too.

The response shape consumed by the UI is a decorated video object (see `API._decorate`):
`{ id, title, channel:{id,name,verified,subscribers,…}, thumbUrl, thumbFallback, avatar, views, likes, dislikes, commentsCount, uploadedAt, duration, category, tags, src, description }`.

---

## Demo data & media notes

- **40 videos across 12 channels** in `data.js`, with deterministic like/comment/thumbnail
  values so the demo is stable between loads.
- **Thumbnails** use `picsum.photos`, with an inline-SVG gradient fallback so the UI still
  looks correct fully offline.
- **Videos** stream from Google’s public sample bucket. Offline, the player still shows the
  poster and controls and informs you the source is unavailable.
- **Uploads** play the file you select for the current session; after a reload the file is
  gone (browsers cannot persist `blob:` URLs), but the metadata entry remains.

---

## Accessibility & responsiveness

- Semantic landmarks, `aria-label`s on icon buttons, visible focus styles, and keyboard
  shortcuts on the player.
- Layout adapts from large desktop grids down to single-column mobile, with an overlay
  sidebar and an expanding mobile search.
- Theme and sidebar preferences persist between visits.
