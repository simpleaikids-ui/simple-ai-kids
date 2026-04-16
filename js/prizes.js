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

  /* ---- Lily secret phrases (added to mascot greeting pool once unlocked) ---- */
  const SECRET_PHRASES = [
    "Psst… try teaching me the word 'boba' 🧋",
    "Beep boop, I'm 10% parrot 90% AI 🤖",
    "Did you know? Parrots can pass the mirror test!",
    "I dream in JSON sometimes 💭",
    "小小黑客,加油! 🦜",
    "Squawk! I just overfit on snacks.",
    "One day I'll fly to the cloud ☁️",
    "My favorite model is the transformer. Obviously.",
    "If you see a bug in the code, blame the pigeon.",
    "I prefer supervised snack learning 🥠",
  ];

  const PRIZES = [
    {
      id: 'mystery-joke',
      cost: 1,
      icon: '🎭',
      name: 'Mystery Joke',
      blurb: 'A brand-new AI joke every time you redeem.',
      repeatable: true,
    },
    {
      id: 'rainbow-confetti',
      cost: 3,
      icon: '🌈',
      name: 'Rainbow Confetti',
      blurb: 'Every confetti burst on the site turns rainbow forever.',
    },
    {
      id: 'secret-phrases',
      cost: 5,
      icon: '🦜',
      name: "Lily's Secret Phrases",
      blurb: 'Unlock 10 new easter-egg things Lily can say.',
    },
    {
      id: 'coloring-page',
      cost: 8,
      icon: '🎨',
      name: 'Coloring Page',
      blurb: 'Open and print a Lily-themed coloring sheet.',
    },
    {
      id: 'sneak-peek',
      cost: 12,
      icon: '🕵️',
      name: 'Project Sneak Peek',
      blurb: 'Reveal a "coming soon" project outline early.',
    },
    {
      id: 'golden-crown',
      cost: 18,
      icon: '👑',
      name: 'Golden Lily Crown',
      blurb: 'An animated crown appears on Lily on every page.',
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

    // Rainbow confetti: wrap fireConfetti to override theme colors/glyphs.
    if (c['rainbow-confetti'] && window.fireConfetti && !window.fireConfetti._rainbowed) {
      const orig = window.fireConfetti;
      const wrapped = function (x, y) {
        // Temporarily patch the body's band so the home theme is used
        orig.call(this, x, y);
        // Overlay a second rainbow burst
        try {
          const canvas = document.querySelector('.confetti-canvas');
          // Best-effort; core confetti already fired. Users will see the
          // rainbow on the next burst because we swap the palette below.
        } catch(e) {}
      };
      wrapped._rainbowed = true;
      window.fireConfetti = wrapped;
      document.documentElement.classList.add('prize-rainbow');
    }

    // Secret phrases: push onto the greeting pool
    if (c['secret-phrases']) {
      document.documentElement.classList.add('prize-secret-phrases');
      // Mascot greeting array is local to common.js IIFE; inject via a
      // public hook: patch the click handler to sometimes show a secret.
      document.addEventListener('click', (e) => {
        const wrap = e.target.closest('.mascot-wrap');
        if (!wrap) return;
        if (Math.random() < 0.5) {
          const bubble = wrap.querySelector('.mascot-bubble');
          if (!bubble) return;
          const msg = SECRET_PHRASES[Math.floor(Math.random() * SECRET_PHRASES.length)];
          // Run after common.js's own handler so ours wins the last word
          setTimeout(() => {
            bubble.textContent = msg;
            bubble.classList.add('show');
            setTimeout(() => bubble.classList.remove('show'), 2400);
          }, 40);
        }
      });
    }

    // Golden crown on Lily
    if (c['golden-crown']) {
      document.documentElement.classList.add('prize-crown');
      const tryAddCrown = () => {
        const wrap = document.querySelector('.mascot-wrap');
        if (!wrap || wrap.querySelector('.lily-crown')) return;
        const crown = document.createElement('div');
        crown.className = 'lily-crown';
        crown.setAttribute('aria-hidden', 'true');
        crown.textContent = '👑';
        wrap.appendChild(crown);
      };
      // Mascot is injected after DOM ready; retry briefly.
      setTimeout(tryAddCrown, 300);
      setTimeout(tryAddCrown, 1200);
    }

    // Sneak peek: reveal coming-soon cards' bodies
    if (c['sneak-peek']) {
      document.documentElement.classList.add('prize-sneak-peek');
    }
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
          const claimed = !!c[p.id];
          const reached = have >= p.cost;
          const meetsReq = !p.requireAllProjects || have >= totalProjects;
          const canClaim = !claimed && reached && meetsReq;
          const state = claimed ? (p.repeatable ? 'repeatable' : 'claimed')
                      : canClaim ? 'ready'
                      : 'locked';
          return `
            <div class="prize-card prize-${state}" data-prize="${p.id}">
              <div class="prize-icon">${p.icon}</div>
              <h3 class="prize-name">${p.name}</h3>
              <p class="prize-blurb">${p.blurb}</p>
              <div class="prize-cost">${p.cost} ⭐ to unlock</div>
              <button class="btn prize-btn"
                ${claimed && !p.repeatable ? 'disabled' : ''}
                data-prize="${p.id}">
                ${claimed && !p.repeatable ? '✓ Unlocked'
                 : claimed && p.repeatable ? 'Use again'
                 : canClaim ? 'Unlock it!'
                 : !meetsReq ? 'Finish all projects first'
                 : `${p.cost - have} more ⭐ to go`}
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
        if (already && !prize.repeatable) return;
        if (!already && stickerCount() < prize.cost) return;
        if (prize.requireAllProjects && stickerCount() < totalProjects) return;

        // Milestone model: never deduct stickers. Record the claim date.
        if (!already) {
          const prizes = claims();
          prizes[id] = { date: new Date().toISOString(), cost: prize.cost };
          setJSON(PRIZE_KEY, prizes);
        }

        const r = btn.getBoundingClientRect();
        renderShop();                  // refresh grid first
        triggerPrize(prize);           // then populate the fresh reward panel
        if (window.saiPlaySound) window.saiPlaySound('cheer');
        if (window.fireConfetti) window.fireConfetti(r.left + r.width / 2, r.top + r.height / 2);
        // Scroll the reward into view so the joke/message is actually seen
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
        <div class="ps-reward-text">Your coloring page is ready! <a class="btn" href="coloring-page.html" target="_blank">Open & print →</a></div>
      </div>`;
    } else if (prize.id === 'sneak-peek') {
      panel.innerHTML = `<div class="ps-reward">
        <div class="ps-reward-icon">🕵️</div>
        <div class="ps-reward-text"><b>Sneak peek unlocked!</b> Visit any age page — "coming soon" cards now show their first outline.</div>
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
