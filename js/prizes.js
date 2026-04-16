/* ================================================================
   Lily's Prize Shop
   Kids trade earned stickers for client-side unlocks.
   Storage keys:
     sai_stickers_v1  -> earned stickers (source of currency)
     sai_prizes_v1    -> { prizeId: { date, cost } } -- what's claimed
   Every page loads prizes.js via common.js so unlocked effects apply
   everywhere (rainbow confetti, Lily phrases, golden crown, etc.).
   ================================================================ */
(() => {
  'use strict';

  const STICKER_KEY = 'sai_stickers_v1';
  const PRIZE_KEY   = 'sai_prizes_v1';

  const getJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch(e) { return {}; } };
  const setJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };

  /* Milestone model: stickers are NEVER spent. A prize unlocks once you've
     earned enough total stickers to reach its cost. This keeps every prize
     reachable (total: 26 stickers, max prize cost: 26). */
  function stickerCount() { return Object.keys(getJSON(STICKER_KEY)).length; }
  function claims()       { return getJSON(PRIZE_KEY); }
  function isClaimed(id)  { return !!claims()[id]; }
  function isActive(id)   { const c = claims()[id]; return !!c && !c.disabled; }
  function setActive(id, on) {
    const all = claims();
    if (!all[id]) return;
    if (on) delete all[id].disabled;
    else all[id].disabled = true;
    setJSON(PRIZE_KEY, all);
  }

  /* ---- JOKES (for the 1-sticker mystery joke) ---- */
  const JOKES = [
    "Why don't robots ever get tired? They have rechargeable batteries!",
    "What's an AI's favorite snack? Microchips. 🍟",
    "Why did the neural network break up with the decision tree? Too many trust issues.",
    "What do you call a dinosaur that codes? A Python-asaurus Rex.",
    "How does a computer get drunk? It takes screen shots.",
    "Why was the math book sad? Too many problems.",
    "What do you call a parrot that does data science? Poly-nomial.",
    "Why did the AI cross the road? To optimize the chicken's route.",
    "What's a robot's favorite dance? The algo-rhythm.",
    "Why don't scientists trust atoms? Because they make up everything.",
    "What did the 0 say to the 8? Nice belt!",
    "Why was the computer cold? It left its Windows open.",
  ];

  /* ---- Lily contextual secret phrases ---- */
  const PHRASE_POOLS = {
    morning: [
      "Good morning! Did you know parrots greet the sunrise too? ☀️",
      "Squawk! Time for breakfast — I recommend sunflower seeds 🌻",
      "Morning brain = best brain. Let's learn something! 🧠",
      "早上好! That's 'good morning' in Chinese 🌞",
    ],
    afternoon: [
      "Afternoon snack time! I'll have boba 🧋",
      "Did you know? Parrots take naps too. Just sayin' 😴",
      "下午好! Keep going, you're doing amazing! ✨",
    ],
    evening: [
      "Evening colors are the prettiest. Like my feathers! 🌅",
      "Tonight's plan: dream in JSON 💭",
      "晚上好! Bedtime stories should have more parrots 📖",
    ],
    night: [
      "Shhh… I'm pretending to sleep 🌙",
      "Stars are just God's pixels ✨",
      "Late-night coding session? I'll keep you company 🦜",
    ],
    spring: [
      "Spring squawk! Flowers are blooming and so are ideas 🌸",
      "Cherry blossoms make me sneeze. Achoo! 🌺",
      "春天来了! New season, new projects! 🌱",
    ],
    summer: [
      "It's so hot I'm a roasted parrot 🥵",
      "Summer = ice cream + AI projects 🍦",
      "Beach day? I'll bring my tiny laptop 🏖️",
    ],
    fall: [
      "Falling leaves remind me of falling gradients 🍂",
      "Pumpkin spice everything, even my code ☕",
      "秋天最美! Cozy season is coding season 🍁",
    ],
    winter: [
      "Brrr! My feathers are made for tropical weather 🥶",
      "Snowflakes are nature's neural networks ❄️",
      "Hot cocoa + warm code = winter magic ☕",
    ],
    cny: [
      "新年快乐! 🧧 May your year be full of bugs… in the codebase only!",
      "恭喜发财! Red envelopes for everyone 🐉",
      "Happy Lunar New Year! Time to feast 🥟",
    ],
    valentines: [
      "Roses are red, violets are blue, this code compiles, and so do you 💌",
      "I 💛 you. Yes, you, the curious kid reading this!",
    ],
    halloween: [
      "Boo! 🎃 I'm a ghost parrot today.",
      "Trick or treat? I choose treat — pumpkin seeds please! 👻",
      "Spookiest thing in tech? Unhandled exceptions 💀",
    ],
    thanksgiving: [
      "Gobble gobble! I'm thankful for curious kids like you 🦃",
      "What I'm grateful for: pixels, parrots, and pie 🥧",
    ],
    christmas: [
      "Merry Christmas! 🎄 Santa uses AI for the naughty/nice list, true story.",
      "Jingle bells, jingle bells, parrot all the way! 🔔",
      "My favorite gift? More stickers ⭐",
    ],
    newyear: [
      "Happy New Year! 🎆 New year, new neural nets!",
      "Resolution: learn one new thing daily. You first! 🥂",
    ],
    midautumn: [
      "中秋节快乐! 🥮 Mooncakes for everyone!",
      "The moon is extra round tonight 🌕",
    ],
    general: [
      "Psst… try teaching me the word 'boba' 🧋",
      "Beep boop, I'm 10% parrot 90% AI 🤖",
      "Did you know? Parrots can pass the mirror test!",
      "I dream in JSON sometimes 💭",
      "小小黑客,加油! 🦜",
      "Squawk! I just overfit on snacks.",
      "One day I'll fly to the cloud ☁️",
      "My favorite model is the transformer. Obviously.",
      "If you see a bug in the code, blame the pigeon 🐦",
      "I prefer supervised snack learning 🥠",
    ],
  };

  function getContextualPhrase() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMonth(); // 0-11
    const d = now.getDate();

    // Festival check (highest priority)
    const festivals = [];
    if (m === 0 && d === 1) festivals.push('newyear');
    if (m === 1 && d === 14) festivals.push('valentines');
    if (m === 9 && d === 31) festivals.push('halloween');
    if (m === 10 && d >= 22 && d <= 28) festivals.push('thanksgiving');
    if (m === 11 && (d === 24 || d === 25)) festivals.push('christmas');
    // Lunar approximations (rough windows)
    if ((m === 0 && d >= 21) || (m === 1 && d <= 20)) festivals.push('cny');
    if (m === 8 && d >= 10 && d <= 30) festivals.push('midautumn');

    // 60% festival, 25% season/time, 15% general
    const r = Math.random();
    let pool;
    if (festivals.length && r < 0.6) {
      pool = PHRASE_POOLS[festivals[Math.floor(Math.random() * festivals.length)]];
    } else if (r < 0.85) {
      // time of day or season
      let season;
      if (m >= 2 && m <= 4) season = 'spring';
      else if (m >= 5 && m <= 7) season = 'summer';
      else if (m >= 8 && m <= 10) season = 'fall';
      else season = 'winter';

      let tod;
      if (h >= 5 && h < 12) tod = 'morning';
      else if (h < 17) tod = 'afternoon';
      else if (h < 21) tod = 'evening';
      else tod = 'night';

      pool = Math.random() < 0.5 ? PHRASE_POOLS[season] : PHRASE_POOLS[tod];
    } else {
      pool = PHRASE_POOLS.general;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const PRIZES = [
    {
      id: 'mystery-joke',
      cost: 1,
      icon: '🎭',
      name: 'Mystery Joke',
      blurb: 'A brand-new AI joke every time you redeem.',
      repeatable: true,
      repeatLabel: '😂 More Jokes',
    },
    {
      id: 'rainbow-confetti',
      cost: 3,
      icon: '🌈',
      name: 'Rainbow Confetti',
      blurb: 'Every confetti burst on the site turns rainbow.',
      toggleable: true,
    },
    {
      id: 'secret-phrases',
      cost: 5,
      icon: '🦜',
      name: "Lily's Secret Phrases",
      blurb: 'Lily shares contextual secrets by time, season, festival.',
      toggleable: true,
    },
    {
      id: 'coloring-page',
      cost: 8,
      icon: '🎨',
      name: 'Coloring Pages',
      blurb: 'Open and print 2 Lily-themed coloring sheets any time.',
      repeatable: true,
      repeatLabel: '📥 Download Again',
    },
    {
      id: 'sparkle-trail',
      cost: 12,
      icon: '✨',
      name: 'Magic Sparkle Trail',
      blurb: 'A trail of twinkling stars follows your cursor — every page.',
      toggleable: true,
    },
    {
      id: 'golden-crown',
      cost: 18,
      icon: '👑',
      name: 'Golden Lily Crown',
      blurb: 'An animated crown appears on Lily on every page.',
      toggleable: true,
    },
    {
      id: 'master-cert',
      cost: 26,
      icon: '🏆',
      name: 'Master Certificate',
      blurb: 'Parchment certificate — requires all 26 projects completed.',
      requireAllProjects: true,
    },
  ];

  /* =====================================================
     APPLY UNLOCKS — runs on every page load
     ===================================================== */
  function applyUnlocks() {
    const c = claims();
    const on = (id) => !!c[id] && !c[id].disabled;

    // Reset toggle-driven root classes (so toggling OFF takes effect mid-session)
    document.documentElement.classList.toggle('prize-rainbow',        on('rainbow-confetti'));
    document.documentElement.classList.toggle('prize-secret-phrases', on('secret-phrases'));
    document.documentElement.classList.toggle('prize-sparkle-trail',  on('sparkle-trail'));
    document.documentElement.classList.toggle('prize-crown',          on('golden-crown'));

    // Rainbow confetti is now toggled by the `prize-rainbow` root class above
    // — common.js `fireConfetti` already checks that class to swap palette.

    // Secret phrases: bind click listener once; check live toggle at fire time.
    if (on('secret-phrases') && !window._secretPhrasesBound) {
      window._secretPhrasesBound = true;
      document.addEventListener('click', (e) => {
        if (!document.documentElement.classList.contains('prize-secret-phrases')) return;
        const wrap = e.target.closest('.mascot-wrap');
        if (!wrap) return;
        if (Math.random() < 0.8) {
          const bubble = wrap.querySelector('.mascot-bubble');
          if (!bubble) return;
          const msg = getContextualPhrase();
          setTimeout(() => {
            bubble.textContent = msg;
            bubble.classList.add('show');
            setTimeout(() => bubble.classList.remove('show'), 3200);
          }, 40);
        }
      });
    }

    // Golden crown on Lily — swap mascot image to the crowned portrait.
    // If common.js already pre-loaded the crown image (on page load with the
    // prize active), there's nothing to do — no flicker, no delay.
    if (on('golden-crown')) {
      const preloaded = document.documentElement.classList.contains('prize-crown-preloaded');
      const activateCrown = () => {
        const img = document.querySelector('.mascot-wrap .mascot-img');
        if (!img) return;
        if (!img.dataset.origSrc) {
          const cur = img.getAttribute('src') || '';
          // Remember a non-crown path so we can restore when toggled OFF.
          img.dataset.origSrc = cur.includes('lily_crown.png')
            ? cur.replace(/lily_crown\.png/i, 'lily.png')
            : cur;
        }
        if ((img.getAttribute('src') || '').includes('lily_crown.png')) return;
        const crownSrc = img.dataset.origSrc.replace(/lily(_original)?\.png([?#].*)?$/i, 'lily_crown.png$2');
        // Probe the crown image; if it 404s, add the emoji crown instead.
        const probe = new Image();
        probe.onload = () => {
          img.setAttribute('src', crownSrc);
          document.querySelectorAll('.lily-crown').forEach(el => el.remove());
        };
        probe.onerror = () => {
          // Fallback: overlay an emoji crown on the regular Lily
          const wrap = document.querySelector('.mascot-wrap');
          if (wrap && !wrap.querySelector('.lily-crown')) {
            const crown = document.createElement('div');
            crown.className = 'lily-crown';
            crown.setAttribute('aria-hidden', 'true');
            crown.textContent = '👑';
            wrap.appendChild(crown);
          }
        };
        probe.src = crownSrc;
      };
      if (!preloaded) {
        // Mid-session toggle ON — swap as soon as the mascot exists.
        if (document.querySelector('.mascot-wrap .mascot-img')) {
          activateCrown();
        } else {
          setTimeout(activateCrown, 120);
          setTimeout(activateCrown, 600);
        }
      }
    } else {
      // Toggle OFF: restore original image and remove any emoji crown.
      document.documentElement.classList.remove('prize-crown-preloaded');
      const img = document.querySelector('.mascot-wrap .mascot-img');
      if (img) {
        const cur = img.getAttribute('src') || '';
        const orig = img.dataset.origSrc
          || (cur.includes('lily_crown.png') ? cur.replace(/lily_crown\.png/i, 'lily.png') : cur);
        if (orig && orig !== cur) img.setAttribute('src', orig);
      }
      document.querySelectorAll('.lily-crown').forEach(el => el.remove());
    }

    // Magic Sparkle Trail
    if (on('sparkle-trail') && !window._sparkleTrailOn) {
      window._sparkleTrailOn = true;
      startSparkleTrail();
    }
  }

  function startSparkleTrail() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const GLYPHS = ['✨','⭐','💫','🌟','·'];
    let last = 0;
    document.addEventListener('mousemove', (e) => {
      if (!document.documentElement.classList.contains('prize-sparkle-trail')) return;
      const now = Date.now();
      if (now - last < 55) return; // throttle
      last = now;
      const s = document.createElement('span');
      s.className = 'sparkle-dot';
      s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const jx = (Math.random() - 0.5) * 18;
      const jy = (Math.random() - 0.5) * 18;
      s.style.left = (e.clientX + jx) + 'px';
      s.style.top  = (e.clientY + jy) + 'px';
      s.style.setProperty('--drift', (Math.random() * 30 - 15) + 'px');
      s.style.fontSize = (10 + Math.random() * 10) + 'px';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, { passive: true });
    // Touch support: emit sparkle on tap
    document.addEventListener('touchmove', (e) => {
      if (!document.documentElement.classList.contains('prize-sparkle-trail')) return;
      const t = e.touches[0]; if (!t) return;
      const now = Date.now();
      if (now - last < 80) return;
      last = now;
      const s = document.createElement('span');
      s.className = 'sparkle-dot';
      s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      s.style.left = t.clientX + 'px';
      s.style.top  = t.clientY + 'px';
      s.style.setProperty('--drift', (Math.random() * 30 - 15) + 'px');
      s.style.fontSize = (10 + Math.random() * 10) + 'px';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, { passive: true });
  }

  /* =====================================================
     PRIZE-SHOP PAGE UI
     ===================================================== */
  function renderShop() {
    const host = document.getElementById('prize-shop');
    if (!host) return;

    const have = stickerCount();
    const c = claims();
    const claimedCount = Object.keys(c).length;
    const totalProjects = (window.PROJECTS_META && Object.keys(window.PROJECTS_META).length) || 26;
    const ready = PRIZES.filter(p => have >= p.cost && !c[p.id] && (!p.requireAllProjects || have >= totalProjects)).length;

    host.innerHTML = `
      <div class="ps-balance">
        <div class="ps-row">
          <div class="ps-stat"><span class="ps-num">${have}</span><span class="ps-lbl">Earned ⭐</span></div>
          <div class="ps-stat ps-avail"><span class="ps-num">${ready}</span><span class="ps-lbl">Ready ✨</span></div>
          <div class="ps-stat"><span class="ps-num">${claimedCount}/${PRIZES.length}</span><span class="ps-lbl">Prizes 🎁</span></div>
        </div>
        <p class="ps-hint">Every finished project earns a sticker ⭐ — and stickers are <b>never spent</b>! Each prize unlocks as soon as you've earned enough, so you can collect them all.</p>
      </div>

      <div class="prize-grid">
        ${PRIZES.map(p => {
          const claim   = c[p.id];
          const claimed = !!claim;
          const active  = claimed && !claim.disabled;
          const reached = have >= p.cost;
          const meetsReq = !p.requireAllProjects || have >= totalProjects;
          const canClaim = !claimed && reached && meetsReq;
          const state = claimed
                        ? (p.toggleable ? (active ? 'active' : 'inactive')
                           : p.repeatable ? 'repeatable' : 'claimed')
                        : canClaim ? 'ready' : 'locked';

          // Button content
          let btnLabel, btnCls = 'prize-btn';
          let btnDisabled = false;
          if (!claimed) {
            if (canClaim)       btnLabel = '✨ Unlock it!';
            else if (!meetsReq) { btnLabel = 'Finish all projects first'; btnDisabled = true; }
            else                { btnLabel = `${p.cost - have} more ⭐ to go`; btnDisabled = true; }
          } else if (p.toggleable) {
            btnLabel = active
              ? `<span class="tgl-dot"></span> ON · tap to turn off`
              : `<span class="tgl-dot"></span> OFF · tap to turn on`;
            btnCls += active ? ' prize-btn-on' : ' prize-btn-off';
          } else if (p.repeatable) {
            btnLabel = p.repeatLabel || '✓ Use Again';
            btnCls += ' prize-btn-repeat';
          } else {
            btnLabel = '✓ Unlocked';
            btnCls += ' prize-btn-done';
          }

          return `
            <div class="prize-card prize-${state}" data-prize="${p.id}">
              <div class="prize-icon">${p.icon}</div>
              <h3 class="prize-name">${p.name}</h3>
              <p class="prize-blurb">${p.blurb}</p>
              <div class="prize-cost">${p.cost} ⭐ to unlock</div>
              <button class="btn ${btnCls}" ${btnDisabled ? 'disabled' : ''} data-prize="${p.id}" aria-pressed="${active}">
                ${btnLabel}
              </button>
            </div>`;
        }).join('')}
      </div>

      <div class="ps-reward-panel" id="ps-reward-panel" hidden></div>
    `;

    host.querySelectorAll('.prize-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.prize;
        const prize = PRIZES.find(p => p.id === id);
        if (!prize) return;
        const already = !!claims()[id];
        if (!already && stickerCount() < prize.cost) return;
        if (prize.requireAllProjects && stickerCount() < totalProjects) return;

        // TOGGLE MODE — already unlocked + toggleable → flip on/off, no reward panel
        if (already && prize.toggleable) {
          const currentlyActive = isActive(id);
          setActive(id, !currentlyActive);
          renderShop();
          applyUnlocks();
          if (window.saiPlaySound) window.saiPlaySound(!currentlyActive ? 'ding' : 'boop');
          return;
        }

        // Non-toggleable + already claimed + not repeatable → no-op
        if (already && !prize.repeatable && !prize.toggleable) return;

        // Milestone model: never deduct stickers. Record the claim date.
        if (!already) {
          const prizes = claims();
          prizes[id] = { date: new Date().toISOString(), cost: prize.cost };
          setJSON(PRIZE_KEY, prizes);
        }

        const r = btn.getBoundingClientRect();
        renderShop();
        triggerPrize(prize);
        if (window.saiPlaySound) window.saiPlaySound('cheer');
        if (window.fireConfetti) window.fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
        const panel = document.getElementById('ps-reward-panel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  function triggerPrize(prize) {
    const panel = document.getElementById('ps-reward-panel');
    if (!panel) return;
    panel.hidden = false;
    panel.classList.add('show');

    if (prize.id === 'mystery-joke') {
      const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">🎭</div>
        <div class="ps-reward-text"><b>Mystery Joke:</b> ${joke}</div>
      </div>`;
    } else if (prize.id === 'coloring-page') {
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">🎨</div>
        <div class="ps-reward-text">Your 2-page coloring PDF is ready!
          <a class="btn" href="downloads/lily-coloring-pages.pdf" target="_blank" rel="noopener">👀 View PDF</a>
          <a class="btn btn-ghost" href="downloads/lily-coloring-pages.pdf" download="Lily-Coloring-Pages.pdf">📥 Download</a>
        </div>
      </div>`;
    } else if (prize.id === 'sparkle-trail') {
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">✨</div>
        <div class="ps-reward-text"><b>Magic Sparkle Trail unlocked!</b> Move your mouse — stars now follow wherever you go, on every page.</div>
      </div>`;
    } else if (prize.id === 'rainbow-confetti') {
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">🌈</div>
        <div class="ps-reward-text">Rainbow confetti unlocked! Click any confetti button to see it.</div>
      </div>`;
    } else if (prize.id === 'secret-phrases') {
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">🦜</div>
        <div class="ps-reward-text">Lily's secret phrases unlocked! Click her on any page to hear one.</div>
      </div>`;
    } else if (prize.id === 'golden-crown') {
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">👑</div>
        <div class="ps-reward-text">Golden crown unlocked! Refresh any page — Lily is now royalty.</div>
      </div>`;
    } else if (prize.id === 'master-cert') {
      const today = new Date().toLocaleDateString();
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">🏆</div>
        <div class="ps-reward-text">Master certificate unlocked!
          <button class="btn" id="ps-print-cert">Print certificate →</button>
        </div>
      </div>`;
      document.getElementById('ps-print-cert').addEventListener('click', () => printMasterCert(today));
    }
    setTimeout(() => applyUnlocks(), 10);
  }

  function printMasterCert(today) {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
<!doctype html><html><head><meta charset="utf-8"><title>Master Certificate</title>
<style>
  body{font-family:'Fredoka',system-ui,sans-serif;background:#fffbea;margin:0;padding:40px;color:#1e1e2e;}
  .cert{max-width:760px;margin:0 auto;background:#fff;border:8px double #b45309;padding:56px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.1);}
  .ribbon{font-size:2.4rem;letter-spacing:.3em;color:#b45309;}
  h1{font-size:2.8rem;margin:14px 0 6px;}
  .who{font-size:1.6rem;margin:24px 0;}
  .seal{font-size:4rem;margin:20px 0;}
  .date{color:#64748b;margin-top:28px;}
  @media print{body{background:#fff;padding:0}.cert{box-shadow:none;}}
</style></head>
<body><div class="cert">
  <div class="ribbon">★ ★ ★ ★ ★</div>
  <h1>Master of AI Making</h1>
  <div class="seal">🏆</div>
  <p>For completing every single project on</p>
  <div class="who"><strong>Simple AI Projects for Kids</strong></div>
  <p>Signed by Daddy, Mommy, Joyce, Jasper, and Lily 🦜</p>
  <p class="date">Awarded ${today}</p>
  <p style="margin-top:32px"><button onclick="window.print()" style="padding:10px 18px;font:inherit;border-radius:999px;border:2px solid #1e1e2e;background:#fde047;cursor:pointer">🖨 Print</button></p>
</div></body></html>`);
    w.document.close();
  }

  /* =====================================================
     Boot on every page
     ===================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { applyUnlocks(); renderShop(); });
  } else {
    applyUnlocks(); renderShop();
  }
})();
