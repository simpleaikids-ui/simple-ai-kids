/* ================================================================
   Homepage live AI demo: "Happy or Sad? Teach Me!"
   A tiny real text classifier kids can play with. Features:
     • Seesaw mood meter (happy face slides along a balance beam)
     • Live classification as the child types
     • Word chips animate into green/red "buckets"
     • Surprise-me button pre-fills a silly sentence
     • Growing word cloud shows the AI's "brain"
   No external libraries.
   ================================================================ */
(() => {
  'use strict';
  const host = document.getElementById('ai-demo');
  if (!host) return;

  const reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Seed training data: common kid-appropriate words */
  const trained = {
    happy: new Set([
      'happy','love','great','awesome','fun','yay','amazing','cool',
      'wonderful','best','smile','laugh','excited','nice','kind','friend',
      'sunny','sweet','cute','win','yes','playful','joyful','delicious'
    ]),
    sad: new Set([
      'sad','bad','hate','awful','mean','boring','gross','terrible',
      'ugly','cry','angry','mad','sick','sorry','worst','broken',
      'scared','lonely','rainy','lose','no','grumpy','annoying','yucky'
    ]),
  };

  const SURPRISES = [
    "I love banana pancakes!",
    "My broken toy makes me sad.",
    "This sunny day is amazing and my friend is here!",
    "Rainy days are so boring and yucky.",
    "The puppy is cute but the homework is terrible.",
    "Yay! I win! This is the best!",
    "I am lonely and grumpy today.",
    "Cats are playful and sweet and joyful."
  ];

  host.innerHTML = `
    <div class="demo-shell">
      <div class="demo-head">
        <span class="demo-tag">🧪 Try it now</span>
        <h2>Happy or Sad? Teach Me!</h2>
        <p>Type any sentence. My brain checks each word and guesses the mood. Watch the seesaw tip!</p>
      </div>

      <div class="demo-io">
        <input id="demo-input" type="text" placeholder="I love banana pancakes!" maxlength="120" autocomplete="off"/>
        <button id="demo-surprise" class="tiny-btn surprise" type="button" title="Fill in a silly sentence">🎲 Surprise me</button>
        <button id="demo-btn" class="btn demo-btn" type="button">What's the Mood? 🤖</button>
      </div>

      <!-- Mood gauge: floating face + pointer above a gradient bar -->
      <div class="mood-gauge" aria-hidden="true">
        <div class="mg-cursor" id="mg-cursor" style="left:50%">
          <div class="mg-face" id="mg-face">😐</div>
          <div class="mg-pointer"></div>
        </div>
        <div class="mg-bar">
          <div class="mg-tick" style="left:0%"></div>
          <div class="mg-tick" style="left:25%"></div>
          <div class="mg-tick" style="left:50%"></div>
          <div class="mg-tick" style="left:75%"></div>
          <div class="mg-tick" style="left:100%"></div>
        </div>
        <div class="mg-labels">
          <span class="mg-label ml-sad">☹️ Sad</span>
          <span class="mg-label ml-mid">😐 Neutral</span>
          <span class="mg-label ml-happy">Happy 😄</span>
        </div>
      </div>

      <div class="demo-output" id="demo-output" aria-live="polite">
        <div class="demo-label" id="demo-label">Type something — I'll guess in real time!</div>

        <!-- Bucket zone: word chips fly into happy or sad buckets -->
        <div class="word-buckets">
          <div class="bucket bucket-sad">
            <div class="bucket-label">☹️ Sad words</div>
            <div class="bucket-chips" id="bucket-sad"></div>
          </div>
          <div class="bucket bucket-neutral">
            <div class="bucket-label">😐 Not sure</div>
            <div class="bucket-chips" id="bucket-neutral"></div>
          </div>
          <div class="bucket bucket-happy">
            <div class="bucket-label">😄 Happy words</div>
            <div class="bucket-chips" id="bucket-happy"></div>
          </div>
        </div>
      </div>

      <div class="demo-teach">
        <details>
          <summary>Teach me a new word! ➕</summary>
          <div class="demo-teach-row">
            <input id="teach-word" type="text" placeholder="New word (like 'banana')" maxlength="20" autocomplete="off"/>
            <button id="teach-happy" class="tiny-btn happy" type="button">+ Happy 😊</button>
            <button id="teach-sad"   class="tiny-btn sad"   type="button">+ Sad ☹️</button>
          </div>
          <p class="demo-note" id="teach-note">I know <b id="word-count">${count()}</b> words so far. Click below to peek at my brain 🧠</p>
          <details class="brain-details">
            <summary>🧠 See my brain</summary>
            <div class="brain-cloud" id="brain-cloud"></div>
          </details>
        </details>
      </div>
    </div>
  `;

  const input      = host.querySelector('#demo-input');
  const btn        = host.querySelector('#demo-btn');
  const surpriseBtn= host.querySelector('#demo-surprise');
  const cursor     = host.querySelector('#mg-cursor');
  const face       = host.querySelector('#mg-face');
  const label      = host.querySelector('#demo-label');
  const bSad       = host.querySelector('#bucket-sad');
  const bHappy     = host.querySelector('#bucket-happy');
  const bNeutral   = host.querySelector('#bucket-neutral');
  const teachWord  = host.querySelector('#teach-word');
  const teachH     = host.querySelector('#teach-happy');
  const teachS     = host.querySelector('#teach-sad');
  const teachNote  = host.querySelector('#teach-note');
  const wordCount  = host.querySelector('#word-count');
  const brainCloud = host.querySelector('#brain-cloud');

  function count() { return trained.happy.size + trained.sad.size; }

  function classify(text) {
    const tokens = text.toLowerCase().match(/[a-z']+/g) || [];
    let h = 0, s = 0;
    const matches = [];
    tokens.forEach(t => {
      if (trained.happy.has(t)) { h++; matches.push({t, type:'happy'}); }
      else if (trained.sad.has(t)) { s++; matches.push({t, type:'sad'}); }
      else matches.push({t, type:'neutral'});
    });
    return { h, s, matches, total: tokens.length };
  }

  function renderBrain() {
    const happyWords = Array.from(trained.happy).map(w =>
      `<span class="brain-word brain-happy">${w}</span>`).join('');
    const sadWords = Array.from(trained.sad).map(w =>
      `<span class="brain-word brain-sad">${w}</span>`).join('');
    brainCloud.innerHTML = happyWords + sadWords;
  }
  renderBrain();

  function run(isLive) {
    const text = input.value.trim();
    bSad.innerHTML = bHappy.innerHTML = bNeutral.innerHTML = '';

    if (!text) {
      face.textContent = '😐';
      cursor.style.left = '50%';
      cursor.classList.remove('bounce');
      label.textContent = 'Type something — I\'ll guess in real time!';
      return;
    }

    const r = classify(text);

    // Drop chips into their buckets with a tiny stagger
    r.matches.forEach((m, i) => {
      const chip = document.createElement('span');
      chip.className = 'chip chip-' + m.type;
      chip.textContent = m.t;
      const target = m.type === 'happy' ? bHappy : m.type === 'sad' ? bSad : bNeutral;
      target.appendChild(chip);
      if (!reducedMotion) {
        chip.style.animationDelay = (i * 40) + 'ms';
      }
    });

    // Gauge math: net mood from -1 (sad) … 0 … +1 (happy) → 6%–94% of bar
    let net = 0;
    if (r.h + r.s > 0) net = (r.h - r.s) / (r.h + r.s);
    const pos = 50 + net * 44;
    cursor.style.left = pos + '%';

    let emoji, msg;
    if (r.h + r.s === 0) {
      emoji = '🤔'; msg = "Hmm, no words I know yet. Try 'love', 'cool', 'sad', or teach me new ones!";
    } else if (net > 0.2) {
      emoji = r.h >= 3 ? '😄' : '🙂';
      msg = `Happy! I spotted ${r.h} happy word${r.h>1?'s':''}.`;
    } else if (net < -0.2) {
      emoji = r.s >= 3 ? '😢' : '🙁';
      msg = `Sad. I spotted ${r.s} sad word${r.s>1?'s':''}.`;
    } else {
      emoji = '😐'; msg = `Mixed! ${r.h} happy and ${r.s} sad. I'm balanced.`;
    }
    face.textContent = emoji;
    label.textContent = msg;

    // Bouncy animation on big reactions
    if (!reducedMotion && !isLive) {
      cursor.classList.remove('bounce');
      void cursor.offsetWidth;
      cursor.classList.add('bounce');
    }

    // Confetti when very happy and user clicked the button
    if (emoji === '😄' && !isLive && typeof window.fireConfetti === 'function') {
      const br = face.getBoundingClientRect();
      window.fireConfetti(br.left + br.width/2, br.top + br.height/2);
    }
    // Sound cue on button (not live)
    if (!isLive && window.saiPlaySound) {
      window.saiPlaySound(net > 0.2 ? 'happy' : net < -0.2 ? 'sad' : 'neutral');
    }
  }

  btn.addEventListener('click', () => run(false));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(false); });

  // LIVE update as kids type (debounced lightly)
  let liveTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => run(true), 120);
  });

  // Surprise me button
  surpriseBtn.addEventListener('click', () => {
    const pick = SURPRISES[Math.floor(Math.random() * SURPRISES.length)];
    input.value = pick;
    run(false);
    input.focus();
  });

  function teach(type) {
    const w = (teachWord.value || '').trim().toLowerCase();
    if (!w.match(/^[a-z']{1,20}$/)) {
      teachNote.textContent = 'Hmm, use just letters please.';
      return;
    }
    trained[type].add(w);
    teachWord.value = '';
    wordCount.textContent = count();
    teachNote.innerHTML = `Added <b>"${w}"</b> as a <b>${type}</b> word! Now I know <b id="word-count">${count()}</b> words.`;
    renderBrain();
    // Re-run current sentence so kids see the effect immediately
    if (input.value.trim()) run(false);
    if (window.saiPlaySound) window.saiPlaySound('ding');
  }
  teachH.addEventListener('click', () => teach('happy'));
  teachS.addEventListener('click', () => teach('sad'));
})();
