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

      <!-- Mood gauge: floating face + pointer above a gradient bar,
           with a faint neural-network firing animation behind it. -->
      <div class="mood-gauge" aria-hidden="true">
        <canvas class="neuron-canvas" id="neuron-canvas" aria-hidden="true"></canvas>
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
        <div class="demo-result-row">
          <div class="demo-label" id="demo-label">Type something — I'll guess in real time!</div>
          <div class="conf-donut" id="conf-donut" aria-hidden="true">
            <svg viewBox="0 0 42 42" class="cd-svg">
              <circle class="cd-track" cx="21" cy="21" r="15.9155"></circle>
              <circle class="cd-arc"   cx="21" cy="21" r="15.9155"
                      stroke-dasharray="0 100" stroke-dashoffset="25"></circle>
              <text class="cd-text" x="21" y="23" text-anchor="middle">0%</text>
            </svg>
            <div class="cd-caption">Confidence</div>
          </div>
        </div>

        <!-- Word heatmap: each word tinted by its contribution -->
        <div class="word-heatmap" id="word-heatmap" aria-label="Word contribution heatmap"></div>

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

  const heatmap    = host.querySelector('#word-heatmap');
  const donutHost  = host.querySelector('#conf-donut');
  const donutArc   = host.querySelector('#conf-donut .cd-arc');
  const donutText  = host.querySelector('#conf-donut .cd-text');
  const neuronCv   = host.querySelector('#neuron-canvas');
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

  /* ---- Word contribution heatmap ---- */
  function renderHeatmap(r) {
    if (!heatmap) return;
    if (!r.matches.length) { heatmap.innerHTML = ''; heatmap.classList.remove('show'); return; }
    heatmap.classList.add('show');
    heatmap.innerHTML = r.matches.map(m => {
      const cls = m.type === 'happy' ? 'hm-happy' :
                  m.type === 'sad'   ? 'hm-sad'   : 'hm-neutral';
      return `<span class="hm-word ${cls}">${m.t}</span>`;
    }).join(' ');
  }

  /* ---- Confidence donut ---- */
  function renderDonut(pct, mood) {
    if (!donutArc || !donutText) return;
    pct = Math.max(0, Math.min(100, Math.round(pct)));
    donutArc.setAttribute('stroke-dasharray', pct + ' ' + (100 - pct));
    donutText.textContent = pct + '%';
    donutHost.classList.remove('cd-happy','cd-sad','cd-neutral','cd-unknown');
    donutHost.classList.add('cd-' + (mood || 'unknown'));
  }

  /* ---- Tiny neural-net firing animation behind the mood gauge ----
     Three layers: 3 input nodes → 2 hidden → 1 output. On each run(),
     we schedule pulses that ride the edges toward the winning output. */
  let neuronPulses = [];
  let neuronRafId = null;
  const NEURON_NODES = {
    inputs:  [{x: 0.10, y: 0.25}, {x: 0.10, y: 0.50}, {x: 0.10, y: 0.75}],
    hidden:  [{x: 0.50, y: 0.35}, {x: 0.50, y: 0.65}],
    output:  [{x: 0.90, y: 0.50}]
  };
  function sizeNeuronCanvas() {
    if (!neuronCv) return;
    const r = neuronCv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    neuronCv.width = Math.max(1, Math.floor(r.width * dpr));
    neuronCv.height = Math.max(1, Math.floor(r.height * dpr));
    const ctx = neuronCv.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawNeurons(tint) {
    if (!neuronCv) return;
    const ctx = neuronCv.getContext('2d');
    if (!ctx) return;
    const w = neuronCv.clientWidth;
    const h = neuronCv.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Edges
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(30,30,46,.12)';
    NEURON_NODES.inputs.forEach(a => {
      NEURON_NODES.hidden.forEach(b => {
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      });
    });
    NEURON_NODES.hidden.forEach(a => {
      NEURON_NODES.output.forEach(b => {
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      });
    });

    // Nodes
    const nodeColor = 'rgba(30,30,46,.22)';
    [].concat(NEURON_NODES.inputs, NEURON_NODES.hidden, NEURON_NODES.output).forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x * w, n.y * h, 4, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
    });

    // Pulses
    const now = performance.now();
    neuronPulses = neuronPulses.filter(p => now - p.start < p.dur);
    neuronPulses.forEach(p => {
      const t = (now - p.start) / p.dur;
      const ease = t * t * (3 - 2 * t);
      const px = (p.ax + (p.bx - p.ax) * ease) * w;
      const py = (p.ay + (p.by - p.ay) * ease) * h;
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
  }
  function neuronLoop() {
    drawNeurons();
    if (neuronPulses.length) {
      neuronRafId = requestAnimationFrame(neuronLoop);
    } else {
      neuronRafId = null;
    }
  }
  function fireNeurons(mood, intensity) {
    if (!neuronCv || reducedMotion) return;
    const color = mood === 'happy' ? '#16a34a'
                : mood === 'sad'   ? '#ef4444'
                                   : '#94a3b8';
    const count = Math.max(3, Math.min(14, Math.round(intensity * 10)));
    const now = performance.now();
    for (let i = 0; i < count; i++) {
      const inp = NEURON_NODES.inputs[i % NEURON_NODES.inputs.length];
      const hid = NEURON_NODES.hidden[i % NEURON_NODES.hidden.length];
      const out = NEURON_NODES.output[0];
      neuronPulses.push({
        ax: inp.x, ay: inp.y, bx: hid.x, by: hid.y,
        start: now + i * 60, dur: 420, color
      });
      neuronPulses.push({
        ax: hid.x, ay: hid.y, bx: out.x, by: out.y,
        start: now + i * 60 + 380, dur: 420, color
      });
    }
    if (!neuronRafId) neuronRafId = requestAnimationFrame(neuronLoop);
  }
  sizeNeuronCanvas();
  window.addEventListener('resize', sizeNeuronCanvas);
  drawNeurons();

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
      renderHeatmap({ matches: [] });
      renderDonut(0, 'unknown');
      if (window.saiLilyReact) window.saiLilyReact('idle');
      return;
    }

    const r = classify(text);
    renderHeatmap(r);

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

    let emoji, msg, mood;
    if (r.h + r.s === 0) {
      emoji = '🤔'; msg = "Hmm, no words I know yet. Try 'love', 'cool', 'sad', or teach me new ones!";
      mood = 'unknown';
    } else if (net > 0.2) {
      emoji = r.h >= 3 ? '😄' : '🙂';
      msg = `Happy! I spotted ${r.h} happy word${r.h>1?'s':''}.`;
      mood = 'happy';
    } else if (net < -0.2) {
      emoji = r.s >= 3 ? '😢' : '🙁';
      msg = `Sad. I spotted ${r.s} sad word${r.s>1?'s':''}.`;
      mood = 'sad';
    } else {
      emoji = '😐'; msg = `Mixed! ${r.h} happy and ${r.s} sad. I'm balanced.`;
      mood = 'neutral';
    }
    face.textContent = emoji;
    label.textContent = msg;

    // Confidence donut: |net| → 0–100%, with a floor so small signals still show.
    const confPct = mood === 'unknown' ? 0 : Math.round(Math.abs(net) * 100);
    renderDonut(confPct, mood);

    // Fire neurons through the network
    fireNeurons(mood, Math.max(0.3, Math.abs(net)));

    // Let Lily react
    if (window.saiLilyReact) {
      window.saiLilyReact(mood === 'unknown' ? 'thinking' : mood);
    }

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
