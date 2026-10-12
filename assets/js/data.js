/* ==========================================================================
   data.js - seed ("demo") data. This is the only file a real backend needs
   to replace; the API layer in api.js reads from here.
   ========================================================================== */
window.Seed = (function () {
  'use strict';

  const CATEGORIES = [
    'All', 'Music', 'Gaming', 'Programming', 'Science', 'Technology',
    'Travel', 'Food', 'Fitness', 'News', 'Podcasts', 'Design', 'Live'
  ];

  /* Public sample MP4s (Google's demo bucket). Offline => poster + controls. */
  const SRC = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
  ];

  const CHANNELS = [
    { id: 'codecraft',   name: 'CodeCraft',            handle: '@codecraft',   category: 'Programming', subscribers: 2840000, verified: true,  joined: '2016-03-12', description: 'Practical coding tutorials, deep dives and build-alongs. New videos every week.' },
    { id: 'novatech',    name: 'NovaTech Reviews',     handle: '@novatech',    category: 'Technology',  subscribers: 6120000, verified: true,  joined: '2014-08-01', description: 'Honest reviews of phones, laptops and everything with a battery.' },
    { id: 'curiousmind', name: 'The Curious Mind',     handle: '@curiousmind', category: 'Science',     subscribers: 4310000, verified: true,  joined: '2017-11-20', description: 'Big ideas explained clearly. Psychology, science and how the world works.' },
    { id: 'pixelplay',   name: 'PixelPlay',            handle: '@pixelplay',   category: 'Gaming',      subscribers: 3250000, verified: true,  joined: '2015-06-09', description: 'Gameplay, reviews, secrets and the occasional hot take.' },
    { id: 'wanderwonder',name: 'Wander & Wonder',      handle: '@wanderwonder',category: 'Travel',      subscribers: 1890000, verified: false, joined: '2018-02-14', description: 'Travel slowly, film everything, eat locally.' },
    { id: 'soundwave',   name: 'Soundwave Sessions',   handle: '@soundwave',   category: 'Music',       subscribers: 5100000, verified: true,  joined: '2013-10-02', description: 'Lo-fi, ambient and focus mixes for work and study.' },
    { id: 'chefsweekly', name: "Chef's Table Weekly",  handle: '@chefstable',  category: 'Food',        subscribers: 2260000, verified: true,  joined: '2016-01-30', description: 'Recipes that actually work, tested until they do.' },
    { id: 'deepspace',   name: 'Deep Space Daily',     handle: '@deepspace',   category: 'Science',     subscribers: 3980000, verified: true,  joined: '2015-09-11', description: 'Astronomy, physics and the weird edges of the universe.' },
    { id: 'dailybyte',   name: 'The Daily Byte',       handle: '@dailybyte',   category: 'News',        subscribers: 1420000, verified: true,  joined: '2019-04-05', description: 'Tech and business news without the panic.' },
    { id: 'fitforward',  name: 'FitForward',           handle: '@fitforward',  category: 'Fitness',     subscribers: 970000,  verified: false, joined: '2018-09-17', description: 'Sustainable training and nutrition for real life.' },
    { id: 'canvascode',  name: 'Canvas & Code',        handle: '@canvascode',  category: 'Design',      subscribers: 1180000, verified: true,  joined: '2017-05-23', description: 'Design, UI and the craft behind great interfaces.' },
    { id: 'trailpodcast',name: 'Trailblazers Podcast', handle: '@trailblazers',category: 'Podcasts',    subscribers: 540000,  verified: false, joined: '2020-07-19', description: 'Long-form conversations with people building interesting things.' }
  ];

  /* Compact video table: [title, channelId, category, seconds, views, hoursAgo, srcIdx] */
  const ROWS = [
    ['Build a Full-Stack App in 60 Minutes (2026 Edition)', 'codecraft', 'Programming', 3612, 1840000, 5, 0],
    ['I Tested the 7 Best Laptops of 2026', 'novatech', 'Technology', 1125, 923000, 22, 1],
    ['Why Black Holes Break Physics - Explained Simply', 'deepspace', 'Science', 842, 5400000, 51, 8],
    ['Lo-Fi Beats to Code To - 2 Hour Session', 'soundwave', 'Music', 7200, 3100000, 200, 4],
    ['The Truth About Keto (What Studies Actually Say)', 'fitforward', 'Fitness', 654, 780000, 30, 2],
    ['How to Design a Logo in Figma - Full Tutorial', 'canvascode', 'Design', 1420, 456000, 12, 5],
    ['React vs Vue vs Svelte in 2026 - Which Wins?', 'codecraft', 'Programming', 968, 1200000, 76, 6],
    ['This $199 Phone Shocked Everyone', 'novatech', 'Technology', 742, 2100000, 140, 7],
    ["Inside a Volcano That's Been Burning 40 Years", 'wanderwonder', 'Travel', 1105, 3400000, 300, 3],
    ['The Perfect Weeknight Ramen (15 Minutes)', 'chefsweekly', 'Food', 612, 1450000, 45, 9],
    ['Gaming Setup Tour 2026 - Every Detail', 'pixelplay', 'Gaming', 1530, 2600000, 90, 10],
    ['Quantum Computing Just Got Real', 'deepspace', 'Science', 891, 1900000, 33, 11],
    ['Why Nobody Predicted the 2026 Market', 'dailybyte', 'News', 720, 870000, 8, 0],
    ['The Psychology of Procrastination', 'curiousmind', 'Science', 1015, 4200000, 410, 1],
    ['Speedrunning Explained by a World Record Holder', 'pixelplay', 'Gaming', 1875, 3300000, 210, 2],
    ['We Interviewed a 4-Day Work Week CEO', 'trailpodcast', 'Podcasts', 3900, 620000, 60, 3],
    ['CSS Grid in 20 Minutes - Practical Guide', 'codecraft', 'Programming', 1210, 990000, 150, 4],
    ['Is AI Going to Steal Your Job? A Calm Look', 'dailybyte', 'News', 1440, 2500000, 17, 5],
    ['48 Hours in Tokyo on a Budget', 'wanderwonder', 'Travel', 1620, 4800000, 260, 6],
    ['The Science of Perfect Coffee', 'chefsweekly', 'Food', 705, 1100000, 100, 7],
    ['Every iPhone Camera Mode Tested', 'novatech', 'Technology', 980, 1750000, 62, 8],
    ['How Neural Networks Actually Learn (Visual)', 'curiousmind', 'Science', 1345, 2900000, 120, 9],
    ['My Honest Review After 1 Year of Home Gym', 'fitforward', 'Fitness', 828, 540000, 155, 10],
    ['Design Systems That Scale - Real Examples', 'canvascode', 'Design', 1560, 720000, 88, 11],
    ['The Rise and Fall of a Tech Giant', 'dailybyte', 'News', 2100, 1300000, 200, 0],
    ['1 Hour Ambient Study Mix (No Ads)', 'soundwave', 'Music', 3600, 2300000, 320, 1],
    ['Elden Ring Secrets You Probably Missed', 'pixelplay', 'Gaming', 2235, 3100000, 400, 2],
    ["A Beginner's Guide to Astrophotography", 'deepspace', 'Science', 1180, 860000, 175, 3],
    ['What Iceland Looks Like in Winter', 'wanderwonder', 'Travel', 940, 2900000, 350, 4],
    ['Why Your Bread Fails (And How to Fix It)', 'chefsweekly', 'Food', 1130, 1900000, 130, 5],
    ['Building a Mechanical Keyboard From Scratch', 'novatech', 'Technology', 1680, 1350000, 240, 6],
    ['The History of the Internet in 15 Minutes', 'curiousmind', 'Science', 910, 3700000, 500, 7],
    ['Mobility Routine for Desk Workers', 'fitforward', 'Fitness', 760, 640000, 220, 8],
    ['From Idea to App Store in a Weekend', 'codecraft', 'Programming', 2520, 1080000, 40, 9],
    ['How We Record a Podcast - Full Setup', 'trailpodcast', 'Podcasts', 1980, 410000, 95, 10],
    ['Color Theory Every Designer Should Know', 'canvascode', 'Design', 870, 980000, 65, 11],
    ['Live: Building a SaaS Dashboard (VOD)', 'codecraft', 'Programming', 5400, 320000, 3, 0],
    ['The Future of Space Tourism', 'deepspace', 'Science', 1230, 1600000, 110, 1],
    ['Ranking Every Streaming Service in 2026', 'dailybyte', 'News', 1260, 2050000, 55, 2],
    ['Late Night Jazz for Focus', 'soundwave', 'Music', 5400, 1750000, 280, 3]
  ];

  const TAGS = {
    Programming: ['coding', 'tutorial', 'javascript', 'webdev', 'fullstack'],
    Technology: ['tech', 'review', 'gadgets', '2026', 'unboxing'],
    Science: ['science', 'explained', 'physics', 'space', 'documentary'],
    Gaming: ['gaming', 'gameplay', 'review', 'letsplay', 'walkthrough'],
    Travel: ['travel', 'vlog', 'adventure', 'budget', 'guide'],
    Music: ['music', 'lofi', 'study', 'focus', 'ambient'],
    Food: ['food', 'recipe', 'cooking', 'kitchen', 'tutorial'],
    Fitness: ['fitness', 'health', 'workout', 'nutrition', 'wellness'],
    News: ['news', 'analysis', 'business', 'tech', 'politics'],
    Podcasts: ['podcast', 'interview', 'conversation', 'business', 'story'],
    Design: ['design', 'ui', 'ux', 'figma', 'creative'],
    Live: ['live', 'stream', 'build', 'coding']
  };

  /* Curated playlists (reference seeded video ids). */
  const PLAYLISTS = [
    { id: 'pl-code',    title: 'Full-Stack in a Weekend', channelId: 'codecraft',    createdAt: '2026-01-12', description: 'Everything you need to ship a real app from zero.', videoIds: ['v1', 'v7', 'v17', 'v34', 'v37'] },
    { id: 'pl-nova',    title: 'Best Tech of 2026',       channelId: 'novatech',     createdAt: '2026-02-03', description: 'The devices worth your money this year.',            videoIds: ['v2', 'v8', 'v21', 'v31'] },
    { id: 'pl-space',   title: 'Cosmos Explained',        channelId: 'deepspace',    createdAt: '2025-11-21', description: 'Black holes, quantum, and the edge of the universe.', videoIds: ['v3', 'v12', 'v28', 'v38'] },
    { id: 'pl-focus',   title: 'Focus & Study Mixes',     channelId: 'soundwave',    createdAt: '2026-03-09', description: 'Long sessions to keep you in the zone.',             videoIds: ['v4', 'v26', 'v40'] },
    { id: 'pl-travel',  title: 'Slow Travel Diaries',     channelId: 'wanderwonder', createdAt: '2026-01-28', description: 'Go further, stay longer, notice more.',               videoIds: ['v9', 'v19', 'v29'] },
    { id: 'pl-food',    title: 'Kitchen Basics',          channelId: 'chefsweekly',  createdAt: '2025-12-15', description: 'Recipes that work every single time.',               videoIds: ['v10', 'v20', 'v30'] }
  ];

  /* ---- Build a stable, full video object per row ------------------------ */
  function build() {
    const byId = {};
    CHANNELS.forEach(function (c) {
      c.avatar = null; // resolved by UI
      byId[c.id] = c;
    });

    const videos = ROWS.map(function (r, i) {
      const rand = U.seeded('v' + i);
      const views = r[4];
      const likes = Math.round(views * (0.028 + rand() * 0.05));
      const dislikes = Math.round(likes * (0.02 + rand() * 0.03));
      const comments = Math.round(views * (0.001 + rand() * 0.003));
      const uploadedAt = new Date(Date.now() - r[5] * 3600 * 1000).toISOString();
      const ch = byId[r[1]];
      const tags = (TAGS[r[2]] || []).slice();
      return {
        id: 'v' + (i + 1),
        title: r[0],
        channelId: r[1],
        channelName: ch ? ch.name : r[1],
        category: r[2],
        duration: r[3],
        views: views,
        likes: likes,
        dislikes: dislikes,
        commentsCount: comments,
        uploadedAt: uploadedAt,
        tags: tags,
        src: SRC[r[6] % SRC.length],
        thumb: 'v' + (i + 1),
        description:
          r[0] + '\n\n' +
          (ch ? ch.description : '') + '\n\n' +
          'In this video we go deep and keep it practical. Chapters and links below.\n\n' +
          'Chapters:\n00:00 Intro\n01:20 The main idea\n0' + (2 + (i % 7)) + ':45 A worked example\n' +
          '1' + (0 + (i % 9)) + ':10 Common mistakes\n19:30 Wrap-up\n\n' +
          'Tags: ' + tags.map(function (t) { return '#' + t; }).join(' ')
      };
    });

    // Precompute category "Live" flag for a couple of items
    return { videos: videos, channels: CHANNELS, categories: CATEGORIES, playlists: PLAYLISTS };
  }

  /* ---- Comment pool ----------------------------------------------------- */
  const COMMENT_AUTHORS = [
    'Jordan Mills', 'Priya Nair', 'Marcus Lee', 'Sofia Rossi', 'Daniel Okafor',
    'Hannah Kim', 'Leo Fernández', 'Ava Thompson', 'Noah Schmidt', 'Mia Nakamura',
    'Ethan Brooks', 'Zoe Ali', 'Lucas Silva', 'Emma Novak', 'Kai Anderson',
    'Isabella Costa', 'Ryan Patel', 'Chloe Dubois', 'Omar Haddad', 'Grace Liu'
  ];
  const COMMENT_TEXTS = [
    'This is exactly what I needed today. Clear and to the point, no fluff.',
    'The editing on this channel keeps getting better. Subscribed!',
    'I disagreed at first but by the end you convinced me. Well argued.',
    'Can you do a follow-up on the advanced version of this?',
    'Watched this twice. The section in the middle is gold.',
    'Who else is watching this at 2am instead of sleeping?',
    'Finally someone explains it without assuming I have a PhD.',
    'I tried this and it actually worked. Thank you!',
    'The quality here is criminally underrated.',
    'Small correction: the timeline you mention is off by about a decade.',
    'Saved to my watch later six months ago and finally watched it. Worth it.',
    'Your background music choice is always perfect.',
    'I have been doing this wrong my whole life apparently.',
    'More please. I could listen to this all day.',
    'This deserves way more views. Sharing with my whole team.',
    'Not sure I agree with the conclusion, but great production.',
    'The examples made everything click for me. Instant like.',
    'How do you make hard topics feel this simple?',
    'I came for one thing and stayed for the whole video.',
    'First! Also this is genuinely excellent content.'
  ];

  function commentsFor(videoId, count) {
    const rand = U.seeded('c-' + videoId);
    const n = Math.max(3, Math.min(count || 12, 24));
    const out = [];
    let t = 0;
    for (let i = 0; i < n; i++) {
      t += Math.floor(rand() * 9) + 1;
      const author = COMMENT_AUTHORS[Math.floor(rand() * COMMENT_AUTHORS.length)];
      const likes = Math.floor(rand() * 4200);
      out.push({
        id: videoId + '-c' + (i + 1),
        videoId: videoId,
        author: author,
        text: COMMENT_TEXTS[Math.floor(rand() * COMMENT_TEXTS.length)],
        likes: likes,
        hoursAgo: t,
        replies: i % 5 === 0 ? [{
          id: videoId + '-c' + (i + 1) + '-r1',
          author: 'CodeCraft',
          text: 'Appreciate you watching! More on this soon.',
          likes: Math.floor(rand() * 300),
          hoursAgo: Math.max(1, t - 2)
        }] : []
      });
    }
    return out;
  }

  return { build: build, commentsFor: commentsFor, CATEGORIES: CATEGORIES };
})();
