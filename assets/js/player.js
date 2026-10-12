/* ==========================================================================
   player.js - a custom HTML5 video player with YouTube-style controls.
   ========================================================================== */
window.Player = (function () {
  'use strict';
  const el = U.el;
  const icon = UI.icon;

  const VOL_KEY = 'yclone.volume';
  function savedVolume() {
    const v = parseFloat(localStorage.getItem(VOL_KEY));
    return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
  }

  function create(container, video, opts) {
    opts = opts || {};
    container.innerHTML = '';
    container.classList.add('player', 'has-poster');

    const media = el('video', {
      poster: video.thumbUrl || '',
      preload: 'metadata',
      playsInline: true
    });
    media.src = video.src;
    // Poster fallback if remote thumb is unavailable.
    media.addEventListener('error', function () {
      // Media failed (offline demo) - keep controls usable.
    });

    const poster = el('div', { class: 'player__poster' });
    const posterImg = U.imgWithFallback(video.thumbUrl, video.thumbFallback, { alt: '' });
    poster.appendChild(posterImg);
    poster.addEventListener('click', togglePlay);

    const center = el('div', { class: 'player__center' });
    const bigPlay = el('div', { class: 'player__play-big', html: icon('play', 28) });
    center.appendChild(bigPlay);

    /* ---- controls ---- */
    const controls = el('div', { class: 'player__controls' });
    const progress = el('div', { class: 'player__progress', role: 'slider', 'aria-label': 'Seek' });
    const track = el('div', { class: 'player__progress-track' });
    const buffer = el('div', { class: 'player__progress-buffer' });
    const fill = el('div', { class: 'player__progress-fill' });
    const handle = el('div', { class: 'player__progress-handle' });
    progress.appendChild(track);
    progress.appendChild(buffer);
    progress.appendChild(fill);
    progress.appendChild(handle);

    const bar = el('div', { class: 'player__bar' });
    const playBtn = el('button', { class: 'icon-btn', html: icon('play'), 'aria-label': 'Play' });
    const nextBtn = el('button', { class: 'icon-btn', html: icon('next'), 'aria-label': 'Next video' });
    const volWrap = el('div', { class: 'player__volume' });
    const muteBtn = el('button', { class: 'icon-btn', html: icon('volume'), 'aria-label': 'Mute' });
    const volInput = el('input', { type: 'range', min: '0', max: '1', step: '0.05', 'aria-label': 'Volume' });
    volInput.value = String(savedVolume());
    volWrap.appendChild(muteBtn);
    volWrap.appendChild(volInput);
    const timeLabel = el('span', { class: 'player__time', text: '0:00 / ' + U.formatDuration(video.duration) });
    const spacer = el('div', { class: 'player__spacer' });

    const ccBtn = el('button', { class: 'icon-btn', html: icon('cc'), 'aria-label': 'Subtitles', title: 'Subtitles' });
    const settingsBtn = el('button', { class: 'icon-btn', html: icon('gear'), 'aria-label': 'Settings', title: 'Settings' });
    const theaterBtn = el('button', { class: 'icon-btn', html: icon('theater'), 'aria-label': 'Theater mode', title: 'Theater mode' });
    const fsBtn = el('button', { class: 'icon-btn', html: icon('fullscreen'), 'aria-label': 'Fullscreen', title: 'Fullscreen' });

    [playBtn, nextBtn, volWrap, timeLabel, spacer, ccBtn, settingsBtn, theaterBtn, fsBtn]
      .forEach(function (n) { bar.appendChild(n); });

    const settings = el('div', { class: 'player__settings' });
    settings.innerHTML = '<h4>Playback speed</h4>' +
      [0.5, 0.75, 1, 1.25, 1.5, 2].map(function (s) {
        return '<button data-speed="' + s + '" class="' + (s === 1 ? 'is-active' : '') + '"><span>' +
          (s === 1 ? 'Normal' : s + 'x') + '</span></button>';
      }).join('');

    controls.appendChild(progress);
    controls.appendChild(bar);
    const captions = el('div', { class: 'player__captions hidden' });
    container.appendChild(media);
    container.appendChild(poster);
    container.appendChild(center);
    container.appendChild(captions);
    container.appendChild(controls);
    container.appendChild(settings);

    /* ---- state ---- */
    media.volume = savedVolume();
    let hideTimer = null;
    let ccOn = false;
    const watched = { tracked: false, furthest: 0 };

    const CAPTION_CUES = [
      'Welcome back to the channel.',
      'Today we are covering the main idea.',
      'Now let us work through an example.',
      'This is the part most people miss.',
      'Thanks for watching - see you next time.'
    ];
    function updateCaptions() {
      if (!ccOn) { captions.classList.add('hidden'); return; }
      const d = media.duration || video.duration || 1;
      const idx = Math.min(CAPTION_CUES.length - 1, Math.floor((media.currentTime / d) * CAPTION_CUES.length));
      captions.textContent = CAPTION_CUES[Math.max(0, idx)];
      captions.classList.remove('hidden');
    }

    function updateVolumeIcon() {
      const name = media.muted || media.volume === 0 ? 'mute' : (media.volume < 0.5 ? 'volumeLow' : 'volume');
      muteBtn.innerHTML = icon(name);
    }
    updateVolumeIcon();

    function setPlaying(playing) {
      playBtn.innerHTML = icon(playing ? 'pause' : 'play');
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      if (playing) {
        container.classList.remove('has-poster');
        container.classList.add('hide-cursor');
        scheduleHide();
      } else {
        container.classList.remove('hide-cursor');
        container.classList.add('show-controls');
        container.classList.remove('hide-cursor');
      }
    }

    function scheduleHide() {
      clearTimeout(hideTimer);
      container.classList.add('show-controls');
      hideTimer = setTimeout(function () {
        if (!media.paused) {
          container.classList.remove('show-controls');
          container.classList.add('hide-cursor');
        }
      }, 2800);
    }

    function togglePlay() {
      if (media.paused) {
        const p = media.play();
        if (p && p.catch) p.catch(function () {
          UI.toast('Video source unavailable offline - showing the player demo.');
        });
      } else {
        media.pause();
      }
    }

    function pct(e) {
      const rect = progress.getBoundingClientRect();
      return U.clamp((e.clientX - rect.left) / rect.width, 0, 1);
    }

    function seekFromEvent(e) {
      if (!media.duration) return;
      media.currentTime = pct(e) * media.duration;
      renderProgress();
    }

    /* ---- events ---- */
    media.addEventListener('play', function () { setPlaying(true); });
    media.addEventListener('pause', function () { setPlaying(false); });
    media.addEventListener('timeupdate', function () {
      renderProgress();
      updateCaptions();
      if (media.currentTime > watched.furthest) watched.furthest = media.currentTime;
      if (media.duration && watched.furthest / media.duration > 0.05 && !watched.tracked) {
        watched.tracked = true;
        if (opts.onStart) opts.onStart();
      }
      if (media.duration) {
        const frac = media.currentTime / media.duration;
        Store.setProgress(video.id, frac);
      }
    });
    media.addEventListener('progress', renderBuffer);
    media.addEventListener('loadedmetadata', renderProgress);
    media.addEventListener('volumechange', function () {
      updateVolumeIcon();
      volInput.value = String(media.muted ? 0 : media.volume);
      localStorage.setItem(VOL_KEY, String(media.volume));
    });
    media.addEventListener('ended', function () { if (opts.onEnded) opts.onEnded(); });
    media.addEventListener('click', togglePlay);

    playBtn.addEventListener('click', togglePlay);
    bigPlay.parentElement.addEventListener('click', togglePlay);
    if (opts.onNext) nextBtn.addEventListener('click', opts.onNext);

    muteBtn.addEventListener('click', function () { media.muted = !media.muted; });
    volInput.addEventListener('input', function () {
      media.volume = parseFloat(volInput.value);
      media.muted = media.volume === 0;
    });

    let dragging = false;
    progress.addEventListener('mousedown', function (e) { dragging = true; seekFromEvent(e); });
    window.addEventListener('mousemove', function (e) { if (dragging) seekFromEvent(e); });
    window.addEventListener('mouseup', function () { dragging = false; });
    progress.addEventListener('click', function (e) { if (!dragging) seekFromEvent(e); });

    ccBtn.addEventListener('click', function () {
      ccOn = !ccOn;
      ccBtn.classList.toggle('is-active', ccOn);
      Store.setPref('captions', ccOn);
      updateCaptions();
    });

    settingsBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      settings.classList.toggle('is-open');
    });
    settings.addEventListener('click', function (e) {
      const b = e.target.closest('button[data-speed]');
      if (!b) return;
      media.playbackRate = parseFloat(b.dataset.speed);
      U.qsa('button', settings).forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      settings.classList.remove('is-open');
      UI.toast('Speed: ' + media.playbackRate + 'x');
    });
    document.addEventListener('click', function () { settings.classList.remove('is-open'); });

    if (opts.onTheater) theaterBtn.addEventListener('click', opts.onTheater);
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (container.requestFullscreen) container.requestFullscreen();
      else UI.toast('Fullscreen is not supported here.');
    });
    document.addEventListener('fullscreenchange', function () {
      fsBtn.innerHTML = icon(document.fullscreenElement ? 'fullscreenExit' : 'fullscreen');
    });

    container.addEventListener('mousemove', scheduleHide);
    container.addEventListener('mouseleave', function () {
      if (!media.paused) { container.classList.remove('show-controls'); container.classList.add('hide-cursor'); }
    });

    document.addEventListener('keydown', function (e) {
      if (/input|textarea|select/i.test((e.target.tagName || ''))) return;
      const rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return; // offscreen
      switch (e.key.toLowerCase()) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'm': media.muted = !media.muted; break;
        case 'f': fsBtn.click(); break;
        case 't': theaterBtn.click(); break;
        case 'arrowright': media.currentTime += 5; break;
        case 'arrowleft': media.currentTime = Math.max(0, media.currentTime - 5); break;
        case 'arrowup': e.preventDefault(); media.volume = Math.min(1, media.volume + 0.1); break;
        case 'arrowdown': e.preventDefault(); media.volume = Math.max(0, media.volume - 0.1); break;
      }
    });

    function renderProgress() {
      const d = media.duration || video.duration || 0;
      const cur = media.currentTime || 0;
      const p = d ? (cur / d) * 100 : 0;
      fill.style.width = p + '%';
      handle.style.left = p + '%';
      timeLabel.textContent = U.formatDuration(cur) + ' / ' + U.formatDuration(d);
    }
    function renderBuffer() {
      if (!media.buffered.length || !media.duration) return;
      const end = media.buffered.end(media.buffered.length - 1);
      buffer.style.width = (end / media.duration) * 100 + '%';
    }
    renderProgress();

    if (opts.autoplay) {
      const p = media.play();
      if (p && p.catch) p.catch(function () { /* needs gesture; poster remains */ });
    }

    return {
      media: media,
      play: function () { const p = media.play(); if (p && p.catch) p.catch(function () {}); },
      pause: function () { media.pause(); },
      currentTime: function () { return media.currentTime; }
    };
  }

  return { create: create };
})();
