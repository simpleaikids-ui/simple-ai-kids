/* ================================================================
   Simple AI Projects for Kids — shared interactions
   Mascot · Floating shapes · Scroll-reveal · Hover-tilt
   Confetti · Sticker wall  ·  localStorage progress
   Pure JS, no dependencies. ~300 lines.
   ================================================================ */
(() => {
  'use strict';

  /* ---------------- Age-band theme data ---------------- */
  const BAND_DATA = {
    '5-8':    { shapes: ['🎨','⭐','🎈','🌈','🧸','🦄','🍭','🎪'], color: '#ffe28a' },
    '9-12':   { shapes: ['🧩','🎮','🤖','⚙️','🚀','🎯','💡','🔧'], color: '#a8e6a8' },
    '13-15':  { shapes: ['💻','⚡','🎧','📱','🔬','🎬','📊','🎲'], color: '#b8c8ff' },
    '16':     { shapes: ['</>','{;}','AI','[ ]','fn()','0101','λ','∑'], color: '#e3b8ff' },
    'home':   { shapes: ['🎨','🧩','💻','🚀','⭐','🤖','💡','✨'], color: '#ffd6e0' },
    'info':   { shapes: ['✨','💡','📘','⭐','🎈','🌟'],             color: '#ffe8b8' },
  };

  const bandKey = document.body.dataset.band || 'info';
  const bandInfo = BAND_DATA[bandKey] || BAND_DATA.info;

  /* ---------------- Respect reduced-motion ---------------- */
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     1. MASCOT
     A friendly robot that follows the cursor, blinks, and waves.
     Auto-inserts itself into .hero or .band-header if one exists.
     ================================================================ */
  function insertMascot() {
    const host = document.querySelector('.hero, .band-header');
    if (!host) return;

    /* ----- Lily the parrot, perched in the hero corner ----- */
    /* Resolve path to images/faces/lily.png relative to the current page
       by piggy-backing on the already-resolved stylesheet href. */
    const _styleLink = document.querySelector('link[href*="css/styles.css"]');
    const _base = _styleLink
      ? _styleLink.getAttribute('href').replace(/css\/styles\.css.*$/, '')
      : '';
    const _lilySrc = _base + 'images/faces/lily.png';

    const wrap = document.createElement('div');
    wrap.className = 'mascot-wrap mascot-lily';
    wrap.title = "Lily — click me!";
    wrap.innerHTML = `
      <div class="mascot-inner">
        <img class="mascot mascot-img" src="${_lilySrc}" alt="Lily the baby blue quaker parrot mascot" draggable="false">
      </div>
      <div class="mascot-bubble" aria-hidden="true">Hi, I'm Lily! 🍙</div>
    `;
    host.appendChild(wrap);

    const bubble = wrap.querySelector('.mascot-bubble');
    const greetings = [
      "Hi, I'm Lily! 🍙",
      "你好! 我是米团 🥟",
      "Squawk! Try a project!",
      "Hello friend! 👋",
      "我是 Rice Ball 🦜",
      "AI is yummy 🥰",
      "Click me again!",
      "What will you build?",
      "Be curious! ✨",
      "小小科学家加油!",
    ];

    /* Subtle cursor-driven tilt so Lily feels alive */
    if (!reducedMotion) {
      window.addEventListener('mousemove', (e) => {
        const img = wrap.querySelector('.mascot-img');
        if (!img) return;
        const r = img.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) / Math.max(window.innerWidth / 2, 1);
        const dy = (e.clientY - cy) / Math.max(window.innerHeight / 2, 1);
        const tilt = Math.max(-1, Math.min(1, dx)) * 6;
        const rise = Math.max(-1, Math.min(1, dy)) * 3;
        img.style.setProperty('--mascot-tilt', tilt + 'deg');
        img.style.setProperty('--mascot-rise', rise + 'px');
      });
    }

    /* Wing flap on hover/click */
    wrap.addEventListener('mouseenter', () => wrap.classList.add('flapping'));
    wrap.addEventListener('mouseleave', () => {
      setTimeout(() => wrap.classList.remove('flapping'), 800);
    });

    /* Click → squawk speech bubble + flap + tiny confetti */
    let bubbleTimer = null;
    wrap.addEventListener('click', () => {
      const msg = greetings[Math.floor(Math.random() * greetings.length)];
      bubble.textContent = msg;
      bubble.classList.add('show');
      wrap.classList.add('flapping');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => {
        bubble.classList.remove('show');
        wrap.classList.remove('flapping');
      }, 2200);
      if (window.fireConfetti) {
        const r = wrap.getBoundingClientRect();
        window.fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
      }
    });

    /* Occasional fly-across animation: every 25–45s Lily glides across the hero */
    if (!reducedMotion) {
      function flyAcross() {
        wrap.classList.add('flying');
        setTimeout(() => wrap.classList.remove('flying'), 4200);
        setTimeout(flyAcross, 25000 + Math.random() * 20000);
      }
      setTimeout(flyAcross, 12000);
    }

    /* Random natural events so the photo feels alive:
       - blink squish every ~5–9 s
       - wing-flap burst every ~10–18 s
       - little hop every ~18–30 s */
    if (!reducedMotion) {
      function oneShot(cls, dur) {
        wrap.classList.add(cls);
        setTimeout(() => wrap.classList.remove(cls), dur);
      }
      function loopBlink() {
        oneShot('blinking', 260);
        setTimeout(loopBlink, 5000 + Math.random() * 4000);
      }
      function loopFlap() {
        oneShot('flap-burst', 900);
        setTimeout(loopFlap, 10000 + Math.random() * 8000);
      }
      function loopHop() {
        oneShot('hopping', 600);
        setTimeout(loopHop, 18000 + Math.random() * 12000);
      }
      setTimeout(loopBlink, 2200);
      setTimeout(loopFlap,  6000);
      setTimeout(loopHop,   9000);
    }
  }

  /* ================================================================
     2. FLOATING BACKGROUND SHAPES
     Slow-drifting emoji/symbols behind content. Palette per band.
     ================================================================ */
  function insertFloatingShapes() {
    const host = document.querySelector('.hero, .band-header');
    if (!host) return;
    if (reducedMotion) return;

    const layer = document.createElement('div');
    layer.className = 'float-layer';
    layer.setAttribute('aria-hidden', 'true');
    const count = 14;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'float-item';
      s.textContent = bandInfo.shapes[i % bandInfo.shapes.length];
      s.style.left = (Math.random() * 100) + '%';
      s.style.top  = (Math.random() * 100) + '%';
      s.style.animationDuration = (12 + Math.random() * 14) + 's';
      s.style.animationDelay = (-Math.random() * 20) + 's';
      s.style.fontSize = (1.2 + Math.random() * 1.6) + 'rem';
      s.style.opacity = 0.18 + Math.random() * 0.28;
      layer.appendChild(s);
    }
    host.prepend(layer);
  }

  /* ================================================================
     3. SCROLL-REVEAL
     Cards fade + slide up as they enter the viewport.
     ================================================================ */
  function attachScrollReveal() {
    const targets = document.querySelectorAll(
      '.project-card, .age-card, .featured, .try-next');
    targets.forEach(el => el.classList.add('reveal'));

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('revealed'), i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(el => io.observe(el));
  }

  /* ================================================================
     4. HOVER TILT on cards — 3D follow-the-cursor effect
     ================================================================ */
  function attachHoverTilt() {
    if (reducedMotion) return;
    const cards = document.querySelectorAll('.project-card, .age-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)
           translate(-2px,-2px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ================================================================
     5. CONFETTI 🎉  — themed per age band
     ================================================================ */
  const CONFETTI_THEME = {
    '5-8':   { glyphs: ['⭐','🌈','🎈','🍭','🦄','✨'],      colors: ['#ff6b6b','#ffb400','#ffe28a','#f472b6'] },
    '9-12':  { glyphs: ['⚙️','🧩','🎯','🚀','💡','🎮'],      colors: ['#a8e6a8','#22c55e','#84cc16','#10b981'] },
    '13-15': { glyphs: ['⚡','{}','</>','📊','💻','🎧'],     colors: ['#b8c8ff','#6366f1','#0ea5e9','#38bdf8'] },
    '16':    { glyphs: ['λ','∑','{;}','AI','fn','0101'],    colors: ['#e3b8ff','#a855f7','#c084fc','#e879f9'] },
    'home':  { glyphs: ['⭐','✨','🎉','🌟','🎊','💫'],      colors: ['#ff6b6b','#ffb400','#ffe28a','#a8e6a8','#b8c8ff','#e3b8ff'] },
    'info':  { glyphs: ['✨','⭐','🌟'],                     colors: ['#ffb400','#ffe28a','#a8e6a8'] },
  };
  function fireConfetti(x, y) {
    if (reducedMotion) return;
    const theme = CONFETTI_THEME[bandKey] || CONFETTI_THEME.home;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const pieces = [];
    for (let i = 0; i < 90; i++) {
      const useGlyph = Math.random() < 0.45;
      pieces.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -14 - 4,
        g: 0.35 + Math.random() * 0.15,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
        glyph: useGlyph ? theme.glyphs[Math.floor(Math.random() * theme.glyphs.length)] : null,
        size: 16 + Math.random() * 12,
        life: 0,
      });
    }
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      pieces.forEach(p => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life++;
        if (p.y < canvas.height + 30 && p.life < 180) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.glyph) {
          ctx.font = p.size + 'px system-ui,sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.glyph, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });
      if (alive > 0) requestAnimationFrame(frame);
      else canvas.remove();
    }
    frame();
  }

  /* ================================================================
     SOUND EFFECTS (Web Audio) — muted by default, toggle in nav.
     Tiny synthesized tones: no assets, no autoplay.
     ================================================================ */
  const SOUND_KEY = 'sai_sound_v1';
  let audioCtx = null;
  function soundEnabled() {
    return localStorage.getItem(SOUND_KEY) === 'on';
  }
  function setSoundEnabled(on) {
    try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch(e) {}
  }
  function ensureAudio() {
    if (!audioCtx && window.AudioContext) audioCtx = new AudioContext();
    return audioCtx;
  }
  function tone(freq, dur, type, gain) {
    const ac = ensureAudio(); if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.value = gain || 0.06;
    o.connect(g).connect(ac.destination);
    const t = ac.currentTime;
    g.gain.setValueAtTime(gain || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  }
  function playSound(kind) {
    if (!soundEnabled()) return;
    try {
      if (kind === 'happy') { tone(523, 0.12); setTimeout(()=>tone(784, 0.18), 90); }
      else if (kind === 'sad') { tone(330, 0.18, 'sine'); setTimeout(()=>tone(220, 0.28), 120); }
      else if (kind === 'ding') { tone(880, 0.12, 'triangle'); }
      else if (kind === 'boop') { tone(196, 0.08, 'square', 0.04); }
      else if (kind === 'cheer') { tone(523, 0.1); setTimeout(()=>tone(659, 0.1), 80); setTimeout(()=>tone(784, 0.18), 160); }
      else { tone(440, 0.1); }
    } catch(e) {}
  }
  window.saiPlaySound = playSound;
  function insertSoundToggle() {
    const nav = document.querySelector('.nav-links');
    if (!nav || nav.querySelector('.sound-toggle')) return;
    const li = document.createElement('li');
    li.className = 'sound-toggle-wrap';
    const on = soundEnabled();
    li.innerHTML = `
      <button class="sound-toggle" aria-label="Toggle sound effects" aria-pressed="${on ? 'true' : 'false'}">
        <span class="st-icon">${on ? '🔊' : '🔇'}</span>
      </button>`;
    // insert before the theme toggle if present
    const theme = nav.querySelector('.theme-toggle-wrap');
    if (theme) nav.insertBefore(li, theme);
    else nav.appendChild(li);
    li.querySelector('.sound-toggle').addEventListener('click', (e) => {
      const nowOn = !soundEnabled();
      setSoundEnabled(nowOn);
      e.currentTarget.querySelector('.st-icon').textContent = nowOn ? '🔊' : '🔇';
      e.currentTarget.setAttribute('aria-pressed', nowOn ? 'true' : 'false');
      if (nowOn) playSound('ding');
    });
  }

  /* ================================================================
     READ-ALOUD TOGGLE — speaks the page's main <p> elements.
     Uses Web Speech API. Shown on project & age pages.
     ================================================================ */
  function insertReadAloud() {
    if (!('speechSynthesis' in window)) return;
    // Only on content pages
    if (!document.querySelector('article, .band-header')) return;
    const host = document.querySelector('.hero .container, .band-header .container, article.project');
    if (!host || host.querySelector('.read-aloud-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'read-aloud-btn';
    btn.innerHTML = '🔊 Read this to me';
    btn.setAttribute('aria-label', 'Read this page aloud');
    host.appendChild(btn);
    let speaking = false;
    btn.addEventListener('click', () => {
      if (speaking) {
        window.speechSynthesis.cancel();
        speaking = false; btn.innerHTML = '🔊 Read this to me'; return;
      }
      const parts = Array.from(document.querySelectorAll(
        'h1, .lead, article.project p, .band-header p, section .container > p'
      )).map(p => p.textContent.trim()).filter(Boolean).slice(0, 25);
      if (!parts.length) return;
      const u = new SpeechSynthesisUtterance(parts.join('. '));
      u.rate = 0.95; u.pitch = 1.05;
      u.onend = () => { speaking = false; btn.innerHTML = '🔊 Read this to me'; };
      window.speechSynthesis.speak(u);
      speaking = true; btn.innerHTML = '⏹ Stop reading';
    });
  }

  /* ================================================================
     DIFFICULTY DOTS — turn .badge.diff ★☆☆ into colored dot chips
     Also adds "Easy/Medium/Tricky" text label for readability.
     ================================================================ */
  function enhanceDifficultyBadges() {
    document.querySelectorAll('.badge.diff').forEach(el => {
      const stars = (el.textContent.match(/★/g) || []).length;
      const level = Math.max(1, Math.min(3, stars));
      const labels = ['Easy', 'Medium', 'Tricky'];
      const classes = ['diff-easy','diff-med','diff-hard'];
      el.classList.add('diff-chip', classes[level-1]);
      el.innerHTML = '<span class="dd">'
        + '<span class="d on"></span>'
        + (level >= 2 ? '<span class="d on"></span>' : '<span class="d"></span>')
        + (level >= 3 ? '<span class="d on"></span>' : '<span class="d"></span>')
        + '</span> ' + labels[level-1];
    });
  }

  /* ================================================================
     PROJECT THUMB SCENES — turn a single emoji into a cute illustrated
     mini-scene (main emoji + side prop + tiny companion + orbit sparkles).
     Keeps existing HTML; enhances .project-thumb containers in place.
     ================================================================ */
  const THUMB_SCENES = {
    'teach-computer-to-sort': { main:'🍎', side:'🍌', tiny:'🖥️', orbit:['✨','🤖','⭐','📦'] },
    'draw-with-ai':           { main:'✏️', side:'🎨', tiny:'🖼️', orbit:['✨','🌈','⭐','🖌️'] },
    'talk-to-a-robot':        { main:'🤖', side:'💬', tiny:'👋', orbit:['✨','💭','⭐','❓'] },
    'ai-story-buddy':         { main:'📖', side:'🐉', tiny:'🏰', orbit:['✨','⭐','🌙','📚'] },
    'emoji-detective':        { main:'👍', side:'🔍', tiny:'📷', orbit:['✨','👎','🖖','⭐'] },
    'rock-paper-scissors-webcam': { main:'✊', side:'✋', tiny:'✌️', orbit:['📷','✨','⭐','🎮'] },
    'dance-move-detector':    { main:'💃', side:'🕺', tiny:'🎶', orbit:['🎵','✨','⭐','📷'] },
    'ai-fortune-teller':      { main:'🔮', side:'🌟', tiny:'🦄', orbit:['✨','🌙','⭐','💫'] },
    'pet-classifier':         { main:'🐶', side:'🐱', tiny:'🐰', orbit:['✨','🐹','⭐','🦎'] },
    'voice-controlled-maze':  { main:'🎤', side:'🧭', tiny:'🏁', orbit:['✨','🔊','⭐','🎯'] },
    'python-chatbot':         { main:'🐍', side:'💬', tiny:'💻', orbit:['✨','{}','⭐','🤖'] },
    'custom-chatbot':         { main:'💬', side:'🤖', tiny:'⚙️', orbit:['✨','💭','⭐','🧩'] },
    'study-buddy':            { main:'📚', side:'🤓', tiny:'📝', orbit:['✨','💡','⭐','🎓'] },
    'train-image-classifier': { main:'🖼️', side:'🧠', tiny:'📊', orbit:['✨','📁','⭐','🎯'] },
    'sentiment-analyzer':     { main:'😊', side:'😢', tiny:'📊', orbit:['✨','💬','⭐','❤️'] },
    'ai-art-explorer':        { main:'🎨', side:'🖌️', tiny:'🖼️', orbit:['✨','🌈','⭐','💫'] },
    'mood-playlist-maker':    { main:'🎵', side:'🎧', tiny:'🎶', orbit:['✨','💿','⭐','🎼'] },
    'ai-vs-human-quiz':       { main:'🤖', side:'🧑', tiny:'❓', orbit:['✨','⚖️','⭐','🎯'] },
    'movie-recommender':      { main:'🎬', side:'🍿', tiny:'⭐', orbit:['✨','🎥','📽️','🎞️'] },
    'cnn-from-scratch':       { main:'🧠', side:'🖼️', tiny:'📊', orbit:['✨','⚙️','⭐','🔢'] },
    'fine-tune-llm':          { main:'🤖', side:'📚', tiny:'⚙️', orbit:['✨','🔧','⭐','💡'] },
    'rl-game-agent':          { main:'🎮', side:'🤖', tiny:'🏆', orbit:['✨','🎯','⭐','🕹️'] },
    'object-detection-app':   { main:'📦', side:'📷', tiny:'🎯', orbit:['✨','🚗','⭐','🐕'] },
    'ai-ethics-case-study':   { main:'⚖️', side:'🤔', tiny:'📜', orbit:['✨','💭','⭐','🧠'] },
    'full-stack-ai-product':  { main:'🚀', side:'💻', tiny:'🌐', orbit:['✨','⚙️','⭐','🔌'] },
    'tiny-transformer':       { main:'🧠', side:'λ', tiny:'💻', orbit:['✨','∑','⭐','🔢'] },
  };
  function sceneForCard(card) {
    const href = card.getAttribute('href') || '';
    const m = href.match(/projects\/([a-z0-9-]+)\.html/i);
    if (m && THUMB_SCENES[m[1]]) return THUMB_SCENES[m[1]];
    return null;
  }
  function enhanceProjectThumbs() {
    document.querySelectorAll('.project-card .project-thumb').forEach(thumb => {
      if (thumb.querySelector('.pt-emojis')) return; // already enhanced
      const card = thumb.closest('.project-card');
      const scene = card ? sceneForCard(card) : null;
      // Fallback: use whatever text is already in the thumb as the main emoji.
      const existing = (thumb.textContent || '').trim();
      const main = scene ? scene.main : (existing[0] || '✨');
      const side = scene ? scene.side : (existing[1] || '');
      const tiny = scene ? scene.tiny : '';
      const orbit = scene ? scene.orbit : ['✨','⭐','💫','✨'];
      thumb.innerHTML =
        '<span class="pt-orbit o1">' + orbit[0] + '</span>' +
        '<span class="pt-orbit o2">' + orbit[1] + '</span>' +
        '<span class="pt-orbit o3">' + orbit[2] + '</span>' +
        '<span class="pt-orbit o4">' + orbit[3] + '</span>' +
        '<span class="pt-emojis">' +
          (side ? '<span class="pt-side">' + side + '</span>' : '') +
          '<span class="pt-main">' + main + '</span>' +
          (tiny ? '<span class="pt-tiny">' + tiny + '</span>' : '') +
        '</span>';
    });
  }

  /* ================================================================
     GROUP "COMING SOON" cards on age pages — move them to a
     collapsible "Almost ready" section at the bottom so that
     available projects don't feel buried.
     ================================================================ */
  function groupComingSoon() {
    const section = document.querySelector('.age-cards, body[data-band="5-8"] section, body[data-band="9-12"] section, body[data-band="13-15"] section, body[data-band="16"] section');
    if (!document.body.dataset.band || document.body.dataset.band === 'home' || document.body.dataset.band === 'info') return;
    const grid = document.querySelector('.grid.grid-3, .grid.grid-4');
    if (!grid) return;
    const soon = Array.from(grid.querySelectorAll('.project-card')).filter(card =>
      card.querySelector('.badge.soon'));
    if (soon.length < 2) return; // don't bother for 0 or 1
    soon.forEach(c => c.classList.add('coming-soon-card'));
    const details = document.createElement('details');
    details.className = 'coming-soon-group';
    details.innerHTML = '<summary>🔭 Almost ready — coming soon (' + soon.length + ')</summary><div class="grid grid-3 coming-soon-grid"></div>';
    const innerGrid = details.querySelector('.coming-soon-grid');
    soon.forEach(c => innerGrid.appendChild(c));
    grid.parentNode.insertBefore(details, grid.nextSibling);
  }
  window.fireConfetti = fireConfetti; // expose so page scripts can use

  /* Fire confetti when any .btn-confetti is clicked. */
  function attachConfettiButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-confetti, [data-confetti]');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
    });
  }

  /* ================================================================
     6. STICKER WALL
     localStorage tracks which projects the kid has marked complete.
     Home page renders an earned-sticker grid.
     Project pages show a "Mark Complete" button.
     ================================================================ */
  const STORAGE_KEY = 'sai_stickers_v1';

  function getStickers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function setStickers(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
    catch (e) { /* Safari private mode etc — silently ignore */ }
  }

  /* Auto-add "Mark Complete" button at the end of project pages */
  function attachMarkCompleteButton() {
    const article = document.querySelector('article.project');
    if (!article) return;
    if (article.classList.contains('about-page')) return;
    const slug = location.pathname.split('/').pop().replace(/\.html$/, '');
    if (!slug || slug === 'index') return;
    if (['about', 'grown-ups', 'glossary', 'safety', 'coming-soon'].includes(slug)) return;

    const title = (document.querySelector('article.project h1')?.textContent || slug).trim();
    const emoji = (document.querySelector('article.project .hero-thumb')?.textContent || '⭐').trim();
    const band = document.body.dataset.band || 'info';

    const section = document.createElement('section');
    section.className = 'complete-box';
    const already = !!getStickers()[slug];
    section.innerHTML = `
      <h2>Finished?</h2>
      <p>Click the button to earn a sticker. Your stickers show up on the home page!</p>
      <button class="btn btn-confetti complete-btn" ${already ? 'disabled' : ''}>
        ${already ? '⭐ Sticker Earned!' : 'I Made It! 🏆'}
      </button>`;
    article.appendChild(section);

    const btn = section.querySelector('.complete-btn');
    btn.addEventListener('click', () => {
      const data = getStickers();
      data[slug] = {
        title, emoji, band,
        url: location.pathname.split('/').slice(-2).join('/'),
        date: new Date().toISOString(),
      };
      setStickers(data);
      try { localStorage.setItem(NEW_STICKER_KEY, slug); } catch(e) {}
      btn.textContent = '⭐ Sticker Earned!';
      btn.disabled = true;
      const r = btn.getBoundingClientRect();
      fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
      playSound('cheer');
    });
  }

  /* Render sticker wall on the home page — all projects appear as ghosted
     outlines; earned ones fill in with color + a "peel" animation on new. */
  const BAND_ICONS = { '5-8': '🎨', '9-12': '🧩', '13-15': '💻', '16': '🚀' };
  const NEW_STICKER_KEY = 'sai_new_sticker_v1';
  function renderStickerWall() {
    const wall = document.getElementById('sticker-wall');
    if (!wall) return;
    const data = getStickers();
    const keys = Object.keys(data);
    const countEl = document.getElementById('sticker-count');
    if (countEl) countEl.textContent = keys.length;

    const meta = window.PROJECTS_META || {};
    const allSlugs = Object.keys(meta);
    // Detect a newly earned sticker so we can animate its "peel" on return.
    let justEarned = null;
    try { justEarned = localStorage.getItem(NEW_STICKER_KEY); } catch(e) {}

    // Build order: earned first, then ghosted remainder in meta order.
    const earnedSet = new Set(keys);
    const ordered = keys.concat(allSlugs.filter(s => !earnedSet.has(s)));

    if (ordered.length === 0) {
      wall.innerHTML = '<div class="sticker sticker-empty"><div class="sticker-face">?</div><div class="sticker-label">Your first sticker goes here!</div></div>';
      return;
    }
    wall.innerHTML = ordered.map(slug => {
      const earned = !!data[slug];
      const m = meta[slug] || {};
      const title = earned ? data[slug].title : (m.title || slug);
      const emoji = earned ? data[slug].emoji : (BAND_ICONS[m.band] || '✨');
      const url = earned ? data[slug].url : ('projects/' + slug + '.html');
      const peel = earned && slug === justEarned ? ' sticker-peel' : '';
      return `<a class="sticker ${earned ? 'earned' : 'ghost'}${peel}" href="${url}" data-slug="${slug}">
          <div class="sticker-face">${emoji}</div>
          <div class="sticker-label">${title}</div>
          ${earned ? '' : '<span class="sticker-locked" aria-hidden="true">✨</span>'}
        </a>`;
    }).join('');

    // Award "band-complete" gold stickers
    const bandTotals = {};
    allSlugs.forEach(s => {
      const b = (meta[s] || {}).band || '?';
      bandTotals[b] = (bandTotals[b] || 0) + 1;
    });
    const bandDone = {};
    keys.forEach(s => {
      const b = (meta[s] || {}).band || '?';
      bandDone[b] = (bandDone[b] || 0) + 1;
    });
    Object.keys(bandTotals).forEach(b => {
      if (bandDone[b] === bandTotals[b] && bandTotals[b] > 0) {
        const gold = document.createElement('div');
        gold.className = 'sticker gold';
        gold.innerHTML = `<div class="sticker-face">🏆</div><div class="sticker-label">Ages ${b} — all done!</div>`;
        wall.prepend(gold);
      }
    });

    if (justEarned) { try { localStorage.removeItem(NEW_STICKER_KEY); } catch(e) {} }
  }

  /* ================================================================
     7. VIDEO SLOTS
     Flexible <video-slot> markup. Supports:
       - data-yt="YOUTUBE_ID"  → YouTube embed
       - data-src="path.mp4"   → local video
       - neither               → friendly "coming soon" placeholder
     ================================================================ */
  function enhanceVideoSlots() {
    document.querySelectorAll('.video-slot').forEach(slot => {
      const yt    = slot.dataset.yt;
      const src   = slot.dataset.src;
      const title = slot.dataset.title || 'Project walkthrough';
      const note  = slot.dataset.note  || 'A short video showing how this project works.';
      if (yt) {
        slot.innerHTML = `
          <div class="video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/${yt}"
              title="${title}" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen loading="lazy"></iframe>
          </div>`;
      } else if (src) {
        slot.innerHTML = `
          <div class="video-frame">
            <video controls playsinline preload="metadata">
              <source src="${src}" type="video/mp4">
              Your browser doesn't support embedded video.
            </video>
          </div>`;
      } else {
        slot.innerHTML = `
          <div class="video-frame video-placeholder">
            <div class="video-placeholder-inner">
              <div class="video-placeholder-icon">🎬</div>
              <div class="video-placeholder-title">${title}</div>
              <div class="video-placeholder-note">${note}</div>
            </div>
          </div>`;
      }
    });
  }

  /* ================================================================
     8. SCENE SLOTS
     Hero illustrations that use inline SVG by default, but swap to a
     PNG if data-img is set and the image loads.
     ================================================================ */
  function enhanceSceneSlots() {
    document.querySelectorAll('.scene-slot[data-img]').forEach(slot => {
      const img = new Image();
      img.onload = () => {
        slot.innerHTML = `<img src="${slot.dataset.img}" alt="${slot.dataset.alt || ''}">`;
        slot.classList.add('scene-slot--img');
      };
      img.src = slot.dataset.img;
      // if it fails to load, the inline SVG already inside stays put
    });
  }

  /* ================================================================
     9. INTERACTIVE STEPS
     Turns ol.steps > li into checklist items with a progress bar.
     State persists per project in localStorage.
     ================================================================ */
  const STEPS_KEY = 'sai_steps_v1';
  function getStepState() {
    try { return JSON.parse(localStorage.getItem(STEPS_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function setStepState(o) {
    try { localStorage.setItem(STEPS_KEY, JSON.stringify(o)); } catch (e) {}
  }

  function enhanceSteps() {
    const ol = document.querySelector('ol.steps');
    if (!ol) return;

    const slug = location.pathname.split('/').pop().replace(/\.html$/, '');
    const state = getStepState();
    const mine = state[slug] || {};

    const items = Array.from(ol.querySelectorAll(':scope > li'));
    const total = items.length;
    if (!total) return;

    // Progress bar + counter, inserted just before the <ol>
    const progress = document.createElement('div');
    progress.className = 'step-progress';
    progress.innerHTML = `
      <div class="step-progress-head">
        <span>Your progress</span>
        <span class="step-counter"><b class="done">0</b> / ${total}</span>
      </div>
      <div class="step-progress-bar"><div class="step-progress-fill"></div></div>
      <button type="button" class="step-reset-btn" aria-label="Reset progress on this project">↺ Start this project over</button>`;
    ol.parentNode.insertBefore(progress, ol);

    const fill    = progress.querySelector('.step-progress-fill');
    const doneEl  = progress.querySelector('.done');
    const resetBtn = progress.querySelector('.step-reset-btn');

    resetBtn.addEventListener('click', () => {
      const ok = window.confirm(
        'Start this project over? This will uncheck every step, remove the sticker for this project, and clear the note you saved here. (Other projects are not touched.)'
      );
      if (!ok) return;
      // 1) Wipe step checkmarks for this slug
      Object.keys(mine).forEach(k => delete mine[k]);
      delete state[slug];
      setStepState(state);
      // 2) Remove the sticker for this project, if any
      try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (s[slug]) { delete s[slug]; localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
      } catch(e) {}
      // 3) Clear the saved "Show what you made" note for this project
      try {
        const n = JSON.parse(localStorage.getItem('sai_notes_v1') || '{}');
        if (n[slug]) { delete n[slug]; localStorage.setItem('sai_notes_v1', JSON.stringify(n)); }
      } catch(e) {}
      location.reload();
    });

    function refresh() {
      const done = items.filter((_, i) => mine[i]).length;
      doneEl.textContent = done;
      fill.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
      if (done === total && !mine.__celebrated) {
        mine.__celebrated = true;
        state[slug] = mine;
        setStepState(state);
        const r = progress.getBoundingClientRect();
        fireConfetti(r.left + r.width / 2, r.top + 20);
      }
    }

    function toggle(i, sourceEl) {
      mine[i] = !mine[i];
      const li = items[i];
      if (mine[i]) {
        li.classList.add('step-done');
        const done = items.filter((_, j) => mine[j]).length;
        if (done === Math.ceil(total / 2) || done === total) {
          const r = (sourceEl || li).getBoundingClientRect();
          fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
        }
        // Smoothly scroll to the next uncompleted step, if any.
        const nextIdx = items.findIndex((_, j) => !mine[j]);
        if (nextIdx > -1 && nextIdx !== i) {
          setTimeout(() => {
            items[nextIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      } else {
        li.classList.remove('step-done');
        mine.__celebrated = false;
      }
      state[slug] = mine;
      setStepState(state);
      refresh();
      // Update all visible "Mark done" buttons for this step
      li.querySelectorAll('.step-mark-btn').forEach(b => {
        b.textContent = mine[i] ? '✓ Done' : 'Done';
        b.classList.toggle('is-done', !!mine[i]);
      });
      const circleBtn = li.querySelector('.step-check');
      if (circleBtn) circleBtn.setAttribute('aria-pressed', mine[i] ? 'true' : 'false');
    }

    items.forEach((li, i) => {
      li.classList.add('step-interactive');
      if (mine[i]) li.classList.add('step-done');

      // Wrap the step's original content in a span so we can strike through
      // just the sentence when done (without also striking the Done button).
      const textWrap = document.createElement('span');
      textWrap.className = 'step-text';
      while (li.firstChild) textWrap.appendChild(li.firstChild);
      li.appendChild(textWrap);

      // Transparent overlay over the numbered circle (legacy click target)
      const circleBtn = document.createElement('button');
      circleBtn.type = 'button';
      circleBtn.className = 'step-check';
      circleBtn.setAttribute('aria-label', 'Mark step ' + (i + 1) + ' done');
      circleBtn.setAttribute('aria-pressed', mine[i] ? 'true' : 'false');
      circleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(i, circleBtn); });
      li.prepend(circleBtn);

      // Visible "Mark this step done" button at the bottom of each step
      const markBtn = document.createElement('button');
      markBtn.type = 'button';
      markBtn.className = 'step-mark-btn' + (mine[i] ? ' is-done' : '');
      markBtn.textContent = mine[i] ? '✓ Done' : 'Done';
      markBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(i, markBtn); });
      li.appendChild(markBtn);
    });
    refresh();
  }

  /* ================================================================
     10. MINI QUIZ
     Supports markup:
       <div class="mini-quiz">
         <div class="q" data-correct="1">
           <p class="prompt">Question?</p>
           <button>Option A</button><button>Option B</button>...
         </div>
       </div>
     ================================================================ */
  function enhanceQuiz() {
    document.querySelectorAll('.mini-quiz .q').forEach(q => {
      const correct = parseInt(q.dataset.correct, 10);
      const btns = Array.from(q.querySelectorAll('button'));
      btns.forEach((b, i) => {
        b.addEventListener('click', () => {
          btns.forEach(x => x.classList.remove('right','wrong'));
          if (i === correct) {
            b.classList.add('right');
            const r = b.getBoundingClientRect();
            fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
          } else {
            b.classList.add('wrong');
          }
        });
      });
    });
  }

  /* ================================================================
     DARK MODE TOGGLE
     Injects a sun/moon button into the nav, persists in localStorage,
     honors prefers-color-scheme on first visit.
     ================================================================ */
  const THEME_KEY = 'sai_theme_v1';
  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  }
  function insertDarkModeToggle() {
    const nav = document.querySelector('.nav-links');
    if (!nav || nav.querySelector('.theme-toggle')) return;
    const li = document.createElement('li');
    li.className = 'theme-toggle-wrap';
    li.innerHTML = `
      <button class="theme-toggle" aria-label="Toggle dark mode">
        <span class="tt-sun">☀️</span>
        <span class="tt-moon">🌙</span>
      </button>`;
    nav.appendChild(li);
    const btn = li.querySelector('.theme-toggle');
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  /* ================================================================
     SCROLL PROGRESS BAR
     Shows a thin bar at the top of every project page.
     ================================================================ */
  function insertScrollProgress() {
    if (!document.querySelector('article.project')) return;
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.innerHTML = '<div class="sp-fill"></div>';
    document.body.appendChild(bar);
    const fill = bar.firstElementChild;
    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      fill.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ================================================================
     GLOBAL PROGRESS BADGE
     "You've completed X / 26 projects" chip on home + age band pages.
     ================================================================ */
  const TOTAL_PROJECTS = 26;
  function insertProgressBadge() {
    const host = document.querySelector('.hero .container, .band-header .container');
    if (!host || host.querySelector('.progress-badge')) return;
    const done = Object.keys(getStickers()).length;
    const pct = Math.round((done / TOTAL_PROJECTS) * 100);
    const chip = document.createElement('div');
    chip.className = 'progress-badge';
    chip.innerHTML = `
      <span class="pb-icon">🏆</span>
      <span class="pb-text"><b>${done}</b> / ${TOTAL_PROJECTS} projects done</span>
      <span class="pb-bar"><span class="pb-fill" style="width:${pct}%"></span></span>`;
    host.appendChild(chip);
  }

  /* ================================================================
     PRINT-FRIENDLY BUTTON on project pages
     ================================================================ */
  function insertPrintButton() {
    const article = document.querySelector('article.project');
    if (!article) return;
    if (article.classList.contains('about-page')) return;
    const lead = article.querySelector('.lead');
    if (!lead) return;
    const btn = document.createElement('button');
    btn.className = 'print-btn';
    btn.type = 'button';
    btn.innerHTML = '🖨️ Print this project';
    btn.addEventListener('click', () => window.print());
    lead.insertAdjacentElement('afterend', btn);
  }

  /* ================================================================
     Boot
     ================================================================ */
  applyTheme(getTheme()); // early, before paint
  function boot() {
    insertDarkModeToggle();
    insertSoundToggle();
    insertFloatingShapes();
    insertMascot();
    insertScrollProgress();
    insertProgressBadge();
    insertPrintButton();
    insertReadAloud();
    attachScrollReveal();
    attachHoverTilt();
    attachConfettiButtons();
    attachMarkCompleteButton();
    enhanceDifficultyBadges();
    enhanceProjectThumbs();
    groupComingSoon();
    renderStickerWall();
    enhanceVideoSlots();
    enhanceSceneSlots();
    enhanceSteps();
    enhanceQuiz();
    enhanceFamilyPhoto();
    loadProjectsMeta();
    // Subtle button sound
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn, .tiny-btn')) playSound('boop');
    }, { capture: true });
  }

  /* Family photo swap (About page): replaces the SVG placeholder with the
     real image when data-src resolves. */
  function enhanceFamilyPhoto() {
    document.querySelectorAll('.photo-frame[data-src]').forEach(function(frame){
      var src = frame.getAttribute('data-src');
      var alt = frame.getAttribute('data-alt') || 'Family photo';
      if (!src) return;
      var test = new Image();
      test.onload = function(){
        frame.innerHTML = '';
        var img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        frame.appendChild(img);
      };
      test.onerror = function(){ /* keep SVG placeholder */ };
      test.src = src;
    });
  }
  /* =====================================================================
     PROJECTS METADATA — drives filters, sensor badges, tree, challenge.
     Resolve js/projects_meta.json relative to the *script* location so it
     works from any page depth (root, /ages/, /projects/).
     ===================================================================== */
  let PROJECTS_META = null;
  function getBase() {
    const styleLink = document.querySelector('link[href*="css/styles.css"]');
    if (!styleLink) return '';
    return styleLink.getAttribute('href').replace(/css\/styles\.css.*$/, '');
  }
  function getMetaUrl() { return getBase() + 'js/projects_meta.json'; }

  async function loadProjectsMeta() {
    // Prefer global set by projects_meta.js <script> tag (works over file://)
    if (window.PROJECTS_META && typeof window.PROJECTS_META === 'object') {
      PROJECTS_META = window.PROJECTS_META;
    } else {
      try {
        const res = await fetch(getMetaUrl(), { cache: 'no-cache' });
        if (!res.ok) throw new Error('meta fetch failed');
        PROJECTS_META = await res.json();
        window.PROJECTS_META = PROJECTS_META;
      } catch (e) {
        PROJECTS_META = {};
      }
    }
    insertSensorBadge();
    insertFamilyBadge();
    insertChallengeWidget();
    attachGlossaryTooltips();
    enhanceCompleteBox();
    // (insertProjectFilters removed — filter section retired on home page)
  }

  function getCurrentSlug() {
    const fn = location.pathname.split('/').pop() || '';
    return fn.replace(/\.html$/, '');
  }

  /* ---- Sensor badge ("What this project sees") ------------------------ */
  const SENSE_LABELS = {
    'webcam':      { icon: '📷', label: 'Uses webcam' },
    'mic':         { icon: '🎤', label: 'Uses microphone' },
    'text':        { icon: '⌨️', label: 'You type things' },
    'file-upload': { icon: '📁', label: 'Uses files you pick' },
    'internet':    { icon: '🌐', label: 'Needs internet' }
  };
  function insertSensorBadge() {
    const article = document.querySelector('article.project');
    if (!article) return;
    const meta = PROJECTS_META && PROJECTS_META[getCurrentSlug()];
    if (!meta) return;
    if (article.querySelector('.sensor-badge')) return;

    const senses = (meta.senses && meta.senses.length) ? meta.senses : ['none'];
    const sensorHTML = senses.map(s => {
      if (s === 'none') return `<span class="sb-chip sb-none">✨ No data collected</span>`;
      const info = SENSE_LABELS[s];
      if (!info) return '';
      return `<span class="sb-chip">${info.icon} ${info.label}</span>`;
    }).join('');

    const box = document.createElement('div');
    box.className = 'sensor-badge';
    box.innerHTML = `
      <div class="sb-title" title="What this project can see or hear">👀 What this project sees</div>
      <div class="sb-chips">${sensorHTML}</div>`;
    const metaRow = article.querySelector('.project-meta');
    if (metaRow) metaRow.after(box);
    else article.prepend(box);
  }

  /* ---- Family-activity badge ------------------------------------------ */
  function insertFamilyBadge() {
    const article = document.querySelector('article.project');
    if (!article) return;
    const meta = PROJECTS_META && PROJECTS_META[getCurrentSlug()];
    if (!meta || !meta.family) return;
    if (article.querySelector('.family-badge')) return;

    const span = document.createElement('span');
    span.className = 'meta-pill meta-pill-family';
    span.textContent = '👨‍👩‍👧‍👦 Try with a grown-up';
    const metaRow = article.querySelector('.project-meta');
    if (metaRow) metaRow.appendChild(span);
  }

  /* ---- Home-page tag + time filter ------------------------------------ */
  function insertProjectFilters() {
    const host = document.getElementById('project-filters');
    if (!host) return;
    if (!PROJECTS_META) return;
    const slugs = Object.keys(PROJECTS_META);
    const allTags = new Set();
    slugs.forEach(s => (PROJECTS_META[s].tags || []).forEach(t => allTags.add(t)));
    const tagList = Array.from(allTags).sort();

    const timeBuckets = [
      ['', 'Any time'], ['quick','< 20 min'], ['short','< 45 min'],
      ['medium','< 90 min'], ['long','Weekend project']
    ];
    const timeHTML = timeBuckets.map(([v,l]) =>
      `<option value="${v}">${l}</option>`).join('');
    const tagChips = tagList.map(t =>
      `<button class="tag-chip" data-tag="${t}">${t}</button>`).join('');

    host.innerHTML = `
      <div class="pf-row">
        <label class="pf-label" for="pf-search">🔎 Search</label>
        <input id="pf-search" class="pf-search" type="text" placeholder="e.g. webcam, chatbot, drawing…">
        <label class="pf-label" for="pf-time">⏱ Time</label>
        <select id="pf-time" class="pf-select">${timeHTML}</select>
        <button class="btn btn-ghost pf-reset" type="button">Reset</button>
      </div>
      <div class="pf-tags">${tagChips}</div>
      <div id="pf-results" class="pf-results" aria-live="polite"></div>`;

    const $s = host.querySelector('#pf-search');
    const $t = host.querySelector('#pf-time');
    const $results = host.querySelector('#pf-results');
    const active = new Set();

    function render() {
      const q = $s.value.trim().toLowerCase();
      const time = $t.value;
      const matches = slugs.filter(slug => {
        const m = PROJECTS_META[slug];
        if (time && m.time !== time) return false;
        if (active.size && !Array.from(active).every(tag => (m.tags || []).includes(tag))) return false;
        if (q) {
          const hay = (slug + ' ' + m.title + ' ' + (m.tags || []).join(' ')).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      if (!matches.length) {
        $results.innerHTML = `<p class="pf-empty">No projects match — try fewer tags.</p>`;
        return;
      }
      const base = getBase();
      $results.innerHTML = matches.map(slug => {
        const m = PROJECTS_META[slug];
        const bandLabel = { '5-8': 'Ages 5–8', '9-12': 'Ages 9–12', '13-15': 'Ages 13–15', '16': 'Ages 16+' }[m.band] || '';
        const timeLbl   = timeBuckets.find(b => b[0] === m.time)?.[1] || m.time;
        const family   = m.family ? '<span class="pf-tag pf-family">👨‍👩‍👧‍👦 family</span>' : '';
        return `<a class="pf-card" href="${base}projects/${slug}.html">
          <div class="pf-card-title">${m.title}</div>
          <div class="pf-card-meta">${bandLabel} · ⏱ ${timeLbl} ${family}</div>
          <div class="pf-card-tags">${(m.tags || []).map(t => `<span class="pf-tag">${t}</span>`).join('')}</div>
        </a>`;
      }).join('');
    }

    host.addEventListener('click', e => {
      const chip = e.target.closest('.tag-chip');
      if (chip) {
        const t = chip.dataset.tag;
        if (active.has(t)) { active.delete(t); chip.classList.remove('on'); }
        else { active.add(t); chip.classList.add('on'); }
        render();
      }
      if (e.target.matches('.pf-reset')) {
        active.clear();
        host.querySelectorAll('.tag-chip.on').forEach(c => c.classList.remove('on'));
        $s.value = ''; $t.value = '';
        render();
      }
    });
    $s.addEventListener('input', render);
    $t.addEventListener('change', render);
    render();
  }

  /* ---- Lily's Challenge of the Week ----------------------------------- */
  const WEEKLY_CHALLENGES = [
    { slug: 'teach-computer-to-sort', twist: "Teach the computer to tell apart <em>two emotions</em> — happy face vs. sad face." },
    { slug: 'draw-with-ai',          twist: "Can you make Quick Draw guess <strong>five drawings in a row</strong>?" },
    { slug: 'ai-story-buddy',        twist: "Ask for a bedtime story starring <em>Lily the parrot</em> who saves the day." },
    { slug: 'emoji-detective',       twist: "Add a <strong>thumbs-up vs. peace sign</strong> class — does the model still guess right?" },
    { slug: 'rock-paper-scissors-webcam', twist: "Train the model wearing <em>sunglasses</em>. Does accuracy drop?" },
    { slug: 'pet-classifier',        twist: "Add a <strong>stuffed-animal</strong> class. Can it tell toys from real pets?" },
    { slug: 'voice-controlled-maze', twist: "Record your commands in a <em>different language</em>. Does it work?" },
    { slug: 'ai-fortune-teller',     twist: "Give it a <em>dream</em> you had. What fortune does it invent?" },
    { slug: 'sentiment-analyzer',    twist: "Feed it song lyrics. Which song is the happiest?" },
    { slug: 'mood-playlist-maker',   twist: "Build a playlist for <em>doing homework</em>. Does it actually help?" }
  ];
  function insertChallengeWidget() {
    const host = document.getElementById('challenge-of-the-week');
    if (!host) return;
    // Week index — ISO-ish week since epoch, deterministic per week
    const ms = Date.now();
    const week = Math.floor(ms / (7 * 24 * 3600 * 1000));
    const pick = WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
    const meta = PROJECTS_META && PROJECTS_META[pick.slug];
    const title = meta ? meta.title : pick.slug;
    host.innerHTML = `
      <div class="cow-inner">
        <div class="cow-badge">🦜 Lily's Challenge</div>
        <h2>Challenge of the Week</h2>
        <p class="cow-project">Based on: <a href="${getBase()}projects/${pick.slug}.html"><strong>${title}</strong></a></p>
        <p class="cow-twist">${pick.twist}</p>
        <a class="btn" href="${getBase()}projects/${pick.slug}.html">Take the challenge →</a>
      </div>`;
  }

  /* ---- Glossary tooltips ---------------------------------------------- */
  const GLOSSARY = {
    'model':      'A computer program that has learned patterns from examples.',
    'class':      'A category the model learns to recognize (e.g., "cat" or "dog").',
    'label':      'The name you give to a piece of training data.',
    'training':   'Showing the model lots of examples so it learns.',
    'bias':       'When a model treats some people or things unfairly because of its training data.',
    'dataset':    'A collection of examples used to train or test a model.',
    'neural network': 'A kind of model inspired (loosely!) by how brains work.',
    'algorithm':  'A recipe of steps a computer follows to solve a problem.',
    'prompt':     'The question or instruction you give to an AI chatbot.',
    'token':      'A tiny piece of text — roughly a word or part of a word.',
    'overfitting':'When a model memorizes its training examples instead of learning the pattern.',
    'accuracy':   'How often the model\'s guesses are correct.'
  };
  function attachGlossaryTooltips() {
    if (document.querySelector('article.project.about-page')) return;
    const article = document.querySelector('article.project');
    if (!article) return;
    const blocks = article.querySelectorAll('p, li');
    // Longest terms first so "neural network" wins over "network".
    const terms = Object.keys(GLOSSARY).sort((a,b) => b.length - a.length);

    // Walk only TEXT NODES — never touch tag markup. This is what prevents
    // words like "class"/"label"/"model" from matching inside attribute
    // values of <a class="btn">, <button aria-label="…">, or existing
    // <span class="gloss" data-gloss="…"> wrappers and corrupting the HTML.
    const SKIP_ANCESTORS = 'pre, code, a, button, .complete-box, .sensor-badge, .gloss, .step-mark-btn, .step-check, ol.steps';
    const wrappedBlocks = new WeakSet();
    const wrappedTerms  = new WeakMap(); // block -> Set(term)

    blocks.forEach(block => {
      if (block.closest('pre, code, .complete-box, .sensor-badge')) return;
      const used = new Set();
      wrappedTerms.set(block, used);

      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const p = n.parentNode;
          if (!p || (p.closest && p.closest(SKIP_ANCESTORS) && p.closest(SKIP_ANCESTORS) !== block))
            return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest('.gloss, a, button, pre, code, .step-mark-btn, .step-check'))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) textNodes.push(n);

      textNodes.forEach(node => {
        for (const term of terms) {
          if (used.has(term)) continue; // wrap only the first occurrence per block
          const re = new RegExp('(^|[^A-Za-z\\w])(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z\\w])', 'i');
          const txt = node.nodeValue;
          const m = txt.match(re);
          if (!m) continue;
          const idx = m.index + m[1].length;
          const before = txt.slice(0, idx);
          const hit    = txt.slice(idx, idx + m[2].length);
          const after  = txt.slice(idx + m[2].length);

          const span = document.createElement('span');
          span.className = 'gloss';
          span.setAttribute('data-gloss', GLOSSARY[term]);
          span.textContent = hit;

          const frag = document.createDocumentFragment();
          if (before) frag.appendChild(document.createTextNode(before));
          frag.appendChild(span);
          if (after)  frag.appendChild(document.createTextNode(after));

          node.parentNode.replaceChild(frag, node);
          used.add(term);
          break; // this text node is consumed; move to the next one
        }
      });
    });
  }

  /* ---- "Show what you made" enhancement to the complete box ---------- */
  function enhanceCompleteBox() {
    const box = document.querySelector('.complete-box');
    if (!box) return;
    if (box.querySelector('.swym-area')) return;
    const slug = getCurrentSlug();
    const titleEl = document.querySelector('article.project h1');
    const title = titleEl ? titleEl.textContent.trim() : slug;

    const swym = document.createElement('div');
    swym.className = 'swym-area';
    swym.innerHTML = `
      <hr class="swym-sep">
      <h3>Show what you made 🎨</h3>
      <p class="swym-help">Type one sentence about what you built (stays on your device), then print a certificate!</p>
      <textarea class="swym-input" rows="2" placeholder="I trained a model that can tell my cat from my dog…"></textarea>
      <button class="btn btn-ghost swym-save" type="button">💾 Save note</button>
      <button class="btn swym-cert" type="button">🏅 Print certificate</button>
      <p class="swym-saved" hidden>Saved! Your note stays on this device.</p>`;
    box.appendChild(swym);

    const KEY = 'sai_notes_v1';
    const getNotes = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){ return {}; } };
    const setNotes = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch(e){} };
    const $ta    = swym.querySelector('.swym-input');
    const $save  = swym.querySelector('.swym-save');
    const $cert  = swym.querySelector('.swym-cert');
    const $saved = swym.querySelector('.swym-saved');
    $ta.value = (getNotes()[slug] || {}).note || '';

    $save.addEventListener('click', () => {
      const all = getNotes();
      all[slug] = { note: $ta.value.trim(), date: new Date().toISOString() };
      setNotes(all);
      $saved.hidden = false;
      setTimeout(() => { $saved.hidden = true; }, 2500);
    });

    $cert.addEventListener('click', () => {
      const note = $ta.value.trim() || '(ask me about it!)';
      const today = new Date().toLocaleDateString();
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`
<!doctype html><html><head><meta charset="utf-8"><title>Certificate — ${title}</title>
<style>
  body{font-family:'Fredoka',system-ui,sans-serif;background:#fffbea;margin:0;padding:40px;color:#1e1e2e;}
  .cert{max-width:720px;margin:0 auto;background:#fff;border:6px double #eab308;padding:48px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.08);}
  .ribbon{font-size:2rem;letter-spacing:.3em;color:#b45309;}
  h1{font-size:2.4rem;margin:12px 0 4px;}
  .who{font-size:1.4rem;margin:18px 0;}
  .note{font-style:italic;background:#fef9c3;padding:12px 16px;border-radius:10px;margin:18px auto;max-width:520px;}
  .date{color:#64748b;margin-top:24px;}
  @media print{body{background:#fff;padding:0}.cert{box-shadow:none;border-color:#b45309;}}
</style></head>
<body><div class="cert">
  <div class="ribbon">★ ★ ★</div>
  <h1>Certificate of Making</h1>
  <p>Awarded for building:</p>
  <div class="who"><strong>${title}</strong></div>
  <div class="note">${note.replace(/</g,'&lt;')}</div>
  <p>Signed by the whole family (and Lily 🦜) on <span class="date">${today}</span>.</p>
  <p style="margin-top:32px"><button onclick="window.print()" style="padding:10px 18px;font:inherit;border-radius:999px;border:2px solid #1e1e2e;background:#fde047;cursor:pointer">🖨 Print</button></p>
</div></body></html>`);
      w.document.close();
    });
  }


  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Register service worker (PWA). Only works over http(s), not file://
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    const styleLink = document.querySelector('link[href*="css/styles.css"]');
    const base = styleLink ? styleLink.getAttribute('href').replace(/css\/styles\.css.*$/, '') : './';
    navigator.serviceWorker.register(base + 'sw.js').catch(() => {});
  }
})();
