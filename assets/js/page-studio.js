/* page-studio.js - creator dashboard: upload, manage videos, analytics. */
window.Pages = window.Pages || {};
window.Pages.studio = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const statsHost = U.qs('#studioStats');
  const tabsHost = U.qs('#studioTabs');
  const body = U.qs('#studioBody');
  let active = (location.hash || '#upload').slice(1);
  const TABS = [
    { id: 'upload', label: 'Upload', icon: 'upload' },
    { id: 'golive', label: 'Go live', icon: 'fireSmall' },
    { id: 'videos', label: 'Your videos', icon: 'studio' },
    { id: 'analytics', label: 'Analytics', icon: 'fire' }
  ];
  if (!TABS.some(function (t) { return t.id === active; })) active = 'upload';

  const CATEGORIES = Seed.CATEGORIES.filter(function (c) { return c !== 'All'; });

  renderStats();
  renderTabs();
  renderBody();

  window.addEventListener('hashchange', function () {
    const h = (location.hash || '').slice(1);
    if (TABS.some(function (t) { return t.id === h; }) && h !== active) {
      active = h; renderTabs(); renderBody();
    }
  });

  function renderStats() {
    statsHost.innerHTML = '';
    API.getStudioStats().then(function (s) {
      const items = [
        [U.formatCount(s.videos), 'Videos'],
        [U.formatViews(s.views), 'Total views'],
        [U.formatViews(s.likes), 'Likes'],
        [U.formatCount(Store.get('subscriptions').length), 'Subscriptions']
      ];
      items.forEach(function (it) {
        const c = el('div', { class: 'stat-card' });
        c.appendChild(el('div', { class: 'stat-card__value', text: it[0] }));
        c.appendChild(el('div', { class: 'stat-card__label', text: it[1] }));
        c.appendChild(el('div', { class: 'stat-card__delta', text: '+' + (1 + (U.hash(it[1]) % 12)) + '% this week' }));
        statsHost.appendChild(c);
      });
    });
  }

  function renderTabs() {
    tabsHost.innerHTML = '';
    TABS.forEach(function (t) {
      const b = el('a', { class: 'chip' + (active === t.id ? ' is-active' : ''), href: '#' + t.id, text: t.label });
      b.addEventListener('click', function (e) {
        e.preventDefault();
        active = t.id;
        history.replaceState(null, '', '#' + t.id);
        renderTabs();
        renderBody();
      });
      tabsHost.appendChild(b);
    });
  }

  function renderBody() {
    body.innerHTML = '';
    if (active === 'videos') return renderVideos();
    if (active === 'analytics') return renderAnalytics();
    if (active === 'golive') return renderGoLive();
    return renderUpload();
  }

  /* --------------------------------------------------------------- Go live */
  function renderGoLive() {
    const panel = el('div', { class: 'panel', style: 'max-width:640px' });
    panel.appendChild(el('h2', { text: 'Go live', style: 'margin-bottom:6px' }));
    panel.appendChild(el('p', { class: 'muted', style: 'margin-top:0', text: 'Start a live stream to YClone. Viewers can watch and comment in real time.' }));

    const titleInput = el('input', { class: 'input', placeholder: 'Stream title', value: 'Live: ' });
    const catSelect = el('select', { class: 'select' });
    ['Live', 'Gaming', 'Programming', 'Music', 'Podcasts'].forEach(function (c) { catSelect.appendChild(el('option', { value: c, text: c })); });
    const privacy = el('select', { class: 'select' });
    [['public', 'Public'], ['unlisted', 'Unlisted'], ['private', 'Private']].forEach(function (o) { privacy.appendChild(el('option', { value: o[0], text: o[1] })); });

    panel.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Title' }), titleInput]));
    panel.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Category' }), catSelect]));
    panel.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Visibility' }), privacy]));

    const go = el('button', { class: 'btn btn--brand', html: icon('fireSmall', 18) + '<span>Go live</span>' });
    go.addEventListener('click', function () {
      if (!titleInput.value.trim()) { UI.toast('Give your stream a title.'); titleInput.focus(); return; }
      go.disabled = true;
      go.innerHTML = icon('fireSmall', 18) + '<span>Starting…</span>';
      API.uploadVideo({
        title: titleInput.value.trim(),
        description: 'Live stream started from YClone Studio.',
        category: catSelect.value,
        visibility: privacy.value,
        duration: 0
      }).then(function (v) {
        UI.toast('You are live!', 'Watch', function () { location.href = 'watch.html?v=' + v.id; });
        renderStats();
        active = 'videos';
        history.replaceState(null, '', '#videos');
        renderTabs();
        renderBody();
      }).catch(function (err) {
        go.disabled = false;
        go.innerHTML = icon('fireSmall', 18) + '<span>Go live</span>';
        UI.toast(err.message || 'Could not start the stream.');
      });
    });
    panel.appendChild(go);
    body.appendChild(panel);
  }

  /* ---------------------------------------------------------- Upload form */
  function renderUpload() {
    const grid = el('div', { class: 'form-grid' });

    /* left: details */
    const left = el('div', { class: 'panel' });
    left.appendChild(el('h2', { text: 'Details', style: 'margin-bottom:16px' }));

    const titleInput = el('input', { class: 'input', maxlength: '100', placeholder: 'Add a title that describes your video' });
    const descInput = el('textarea', { class: 'textarea', placeholder: 'Tell viewers about your video' });
    const tagsInput = el('input', { class: 'input', placeholder: 'Add tags separated by commas' });
    const catSelect = el('select', { class: 'select' });
    CATEGORIES.forEach(function (c) { catSelect.appendChild(el('option', { value: c, text: c })); });

    left.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Title (required)' }), titleInput]));
    left.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Description' }), descInput]));
    left.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Tags' }), tagsInput]));
    left.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Category' }), catSelect]));

    /* right: upload + thumbnail + visibility */
    const right = el('div');

    const uploadPanel = el('div', { class: 'panel', style: 'margin-bottom:20px' });
    uploadPanel.appendChild(el('h2', { text: 'Video file', style: 'margin-bottom:12px' }));
    const drop = el('div', { class: 'dropzone' });
    drop.innerHTML = '<strong>Drag and drop a video</strong>or click to browse<br><span style="font-size:12px">MP4, WebM or MOV · up to 2 GB</span>';
    const fileInput = el('input', { type: 'file', accept: 'video/*', class: 'hidden' });
    drop.appendChild(fileInput);
    const fileInfo = el('div', { class: 'help', style: 'margin-top:10px' });
    uploadPanel.appendChild(drop);
    uploadPanel.appendChild(fileInfo);

    let selectedFile = null;
    let capturedThumb = null;
    let objectUrl = null;

    drop.addEventListener('click', function () { fileInput.click(); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('is-drag'); });
    drop.addEventListener('dragleave', function () { drop.classList.remove('is-drag'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('is-drag');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) acceptFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) acceptFile(fileInput.files[0]);
    });

    function acceptFile(file) {
      if (!/^video\//.test(file.type)) { UI.toast('Please choose a video file.'); return; }
      selectedFile = file;
      fileInfo.textContent = file.name + ' · ' + (file.size / 1048576).toFixed(1) + ' MB';
      if (!titleInput.value.trim()) {
        titleInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[._-]+/g, ' ').trim();
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(file);
      capturedThumb = null;
      grabFrame(objectUrl, function (dataUrl) {
        capturedThumb = dataUrl;
        renderThumb();
      });
      renderThumb();
    }

    /* thumbnail */
    const thumbPanel = el('div', { class: 'panel', style: 'margin-bottom:20px' });
    thumbPanel.appendChild(el('h2', { text: 'Thumbnail', style: 'margin-bottom:12px' }));
    const preview = el('div', { class: 'thumb-preview' });
    const previewImg = el('img', { alt: 'Thumbnail preview' });
    const previewEmpty = el('span', { class: 'muted', text: 'Auto-generated from your video' });
    thumbPanel.appendChild(preview);

    function renderThumb() {
      preview.innerHTML = '';
      if (capturedThumb) { previewImg.src = capturedThumb; preview.appendChild(previewImg); }
      else if (objectUrl && selectedFile) {
        previewImg.src = capturedThumb || U.thumbDataUri(titleInput.value || 'upload', 'PREVIEW');
        preview.appendChild(previewImg);
      } else {
        preview.appendChild(previewEmpty);
      }
    }
    renderThumb();
    titleInput.addEventListener('input', function () {
      if (!capturedThumb && !selectedFile) { previewEmpty.textContent = 'Auto-generated from your video'; }
    });

    /* visibility */
    const visPanel = el('div', { class: 'panel' });
    visPanel.appendChild(el('h2', { text: 'Visibility', style: 'margin-bottom:8px' }));
    const visOptions = [
      { value: 'public', title: 'Public', desc: 'Everyone can watch your video.' },
      { value: 'unlisted', title: 'Unlisted', desc: 'Only people with the link can watch.' },
      { value: 'private', title: 'Private', desc: 'Only you can watch.' }
    ];
    visOptions.forEach(function (o, i) {
      const label = el('label', { class: 'radio-row' });
      const radio = el('input', { type: 'radio', name: 'visibility', value: o.value });
      if (i === 0) radio.checked = true;
      const text = el('div');
      text.appendChild(el('strong', { text: o.title }));
      text.appendChild(el('p', { text: o.desc }));
      label.appendChild(radio);
      label.appendChild(text);
      visPanel.appendChild(label);
    });

    right.appendChild(uploadPanel);
    right.appendChild(thumbPanel);
    right.appendChild(visPanel);

    /* actions */
    const actions = el('div', { class: 'spread', style: 'margin-top:24px' });
    const resetBtn = el('button', { class: 'btn btn--ghost', text: 'Reset form' });
    const publishBtn = el('button', { class: 'btn btn--brand', html: icon('upload', 18) + '<span>Publish</span>' });
    actions.appendChild(resetBtn);
    actions.appendChild(publishBtn);
    left.appendChild(actions);

    grid.appendChild(left);
    grid.appendChild(right);
    body.appendChild(grid);

    resetBtn.addEventListener('click', function () {
      titleInput.value = ''; descInput.value = ''; tagsInput.value = '';
      selectedFile = null; capturedThumb = null;
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
      fileInfo.textContent = '';
      renderThumb();
      UI.toast('Form reset.');
    });

    publishBtn.addEventListener('click', function () {
      if (!titleInput.value.trim()) { UI.toast('Add a title before publishing.'); titleInput.focus(); return; }
      publishBtn.disabled = true;
      publishBtn.innerHTML = icon('upload', 18) + '<span>Publishing…</span>';
      const visibility = (U.qs('input[name=visibility]:checked', visPanel) || {}).value || 'public';
      API.uploadVideo({
        title: titleInput.value,
        description: descInput.value,
        tags: tagsInput.value,
        category: catSelect.value,
        visibility: visibility,
        src: objectUrl || undefined,
        thumbnailUrl: capturedThumb || null,
        thumbSeed: 'up' + U.hash(titleInput.value + Date.now())
      }).then(function (video) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = icon('upload', 18) + '<span>Publish</span>';
        UI.toast('Published “' + video.title + '”', 'View', function () {
          location.href = 'watch.html?v=' + video.id;
        });
        renderStats();
        active = 'videos';
        history.replaceState(null, '', '#videos');
        renderTabs();
        renderBody();
      }).catch(function (err) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = icon('upload', 18) + '<span>Publish</span>';
        UI.toast(err.message || 'Upload failed.');
      });
    });
  }

  // Best-effort: draw a frame from the chosen file into a thumbnail data URL.
  function grabFrame(url, cb) {
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'metadata';
    v.src = url;
    let done = false;
    const timeout = setTimeout(function () { finish(null); }, 4000);
    function finish(data) {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      cb(data);
    }
    v.addEventListener('loadeddata', function () {
      try { v.currentTime = Math.min(0.5, (v.duration || 1) * 0.1); } catch (_) { finish(null); }
    });
    v.addEventListener('seeked', function () {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640; canvas.height = 360;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.8));
      } catch (_) { finish(null); }
    });
    v.addEventListener('error', function () { finish(null); });
  }

  /* ------------------------------------------------------- Manage videos  */
  function renderVideos() {
    const uploads = Store.get('uploads');
    const head = el('div', { class: 'spread', style: 'margin-bottom:16px' });
    head.appendChild(el('h2', { text: uploads.length + ' video' + (uploads.length === 1 ? '' : 's') }));
    const addBtn = el('button', { class: 'btn btn--brand', html: icon('upload', 18) + '<span>Upload</span>' });
    addBtn.addEventListener('click', function () { active = 'upload'; history.replaceState(null, '', '#upload'); renderTabs(); renderBody(); });
    head.appendChild(addBtn);
    body.appendChild(head);

    if (!uploads.length) {
      body.appendChild(UI.emptyState({ icon: 'studio', title: 'No uploads yet', message: 'Publish a video to see it here.', action: { href: '#upload', label: 'Upload a video' } }));
      return;
    }

    const table = el('table', { class: 'table' });
    table.innerHTML = '<thead><tr><th>Video</th><th>Visibility</th><th>Views</th><th>Likes</th><th>Comments</th><th>Date</th><th></th></tr></thead>';
    const tbody = el('tbody');
    uploads.forEach(function (v) {
      const tr = el('tr');
      const tdVideo = el('td');
      const wrap = el('div', { class: 'row' });
      const img = U.imgWithFallback(v.thumbnailUrl || U.remoteThumb(v.thumb, 320, 180), U.thumbDataUri(v.thumb, v.category), { class: 'table__thumb' });
      wrap.appendChild(img);
      const t = el('div');
      t.appendChild(el('a', { href: 'watch.html?v=' + v.id, style: 'font-weight:500', text: v.title }));
      t.appendChild(el('div', { class: 'muted', style: 'font-size:12px', text: v.category }));
      wrap.appendChild(t);
      tdVideo.appendChild(wrap);
      tr.appendChild(tdVideo);
      tr.appendChild(el('td', {}, [badge(v.visibility || 'public')]));
      tr.appendChild(el('td', { text: U.formatCount(v.views) }));
      tr.appendChild(el('td', { text: U.formatCount(v.likes) }));
      tr.appendChild(el('td', { text: U.formatCount(v.commentsCount) }));
      tr.appendChild(el('td', { text: U.timeAgo(v.uploadedAt) }));

      const tdActions = el('td');
      const actions = el('div', { class: 'row' });
      const editBtn = el('button', { class: 'icon-btn', html: icon('edit', 20), title: 'Edit' });
      editBtn.addEventListener('click', function () { editVideo(v); });
      const delBtn = el('button', { class: 'icon-btn', html: icon('trash', 20), title: 'Delete' });
      delBtn.addEventListener('click', function () {
        UI.confirmDialog('Delete video?', '“' + v.title + '” will be permanently removed.', 'Delete').then(function (ok) {
          if (!ok) return;
          Store.removeUpload(v.id);
          UI.toast('Video deleted.');
          renderStats();
          renderBody();
        });
      });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      tdActions.appendChild(actions);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    body.appendChild(table);
  }

  function badge(visibility) {
    const color = visibility === 'public' ? '#2ba640' : visibility === 'unlisted' ? '#f2a03d' : '#909090';
    return el('span', { style: 'color:' + color + ';font-weight:500;text-transform:capitalize', text: visibility });
  }

  function editVideo(v) {
    const titleInput = el('input', { class: 'input', value: v.title });
    const descInput = el('textarea', { class: 'textarea', value: v.description || '' });
    const content = el('div');
    content.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Title' }), titleInput]));
    content.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Description' }), descInput]));
    let ref;
    const save = el('button', {
      class: 'btn btn--filled', text: 'Save',
      onclick: function () {
        Store.update(function (s) {
          const item = s.uploads.find(function (x) { return x.id === v.id; });
          if (item) { item.title = titleInput.value.trim() || item.title; item.description = descInput.value; }
        });
        UI.toast('Video updated.');
        ref.close();
        renderBody();
      }
    });
    ref = UI.openModal({ title: 'Edit video', content: content, footer: [save] });
  }

  /* ------------------------------------------------------------ Analytics */
  function renderAnalytics() {
    const mine = Store.get('uploads');
    body.appendChild(el('h2', { text: 'Channel analytics', style: 'margin-bottom:16px' }));

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rand = U.seeded('analytics-' + mine.length);
    const values = days.map(function () { return 20 + Math.round(rand() * 80); });
    const max = Math.max.apply(null, values) || 1;

    const card = el('div', { class: 'panel' });
    card.appendChild(el('div', { class: 'muted', style: 'margin-bottom:16px', text: 'Views over the last 7 days' }));
    const chart = el('div', { style: 'display:flex;align-items:flex-end;gap:16px;height:200px' });
    values.forEach(function (val, i) {
      const col = el('div', { style: 'flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end' });
      const bar = el('div', { style: 'width:100%;border-radius:6px 6px 0 0;background:linear-gradient(180deg,var(--brand),#ff6b6b);height:' + Math.round((val / max) * 160) + 'px' });
      col.appendChild(bar);
      col.appendChild(el('span', { class: 'muted', style: 'font-size:12px', text: days[i] }));
      chart.appendChild(col);
    });
    card.appendChild(chart);
    body.appendChild(card);

    const stats = el('div', { class: 'stats-grid', style: 'margin-top:24px' });
    const totalViews = mine.reduce(function (s, v) { return s + v.views; }, 0);
    [
      [U.formatCount(totalViews), 'Views (28 days)'],
      [U.formatCount(Math.round(totalViews * 0.42)), 'Watch time (min)'],
      ['4:12', 'Avg. view duration'],
      [mine.length ? U.formatViews(Math.round(totalViews / Math.max(1, mine.length))) : '0', 'Avg. per video']
    ].forEach(function (it) {
      const c = el('div', { class: 'stat-card' });
      c.appendChild(el('div', { class: 'stat-card__value', text: it[0] }));
      c.appendChild(el('div', { class: 'stat-card__label', text: it[1] }));
      stats.appendChild(c);
    });
    body.appendChild(stats);
  }
};
