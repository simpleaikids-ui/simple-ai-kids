/* ================================================================
   Homepage live AI demo: "Happy or Sad? Teach Me!"
   A tiny real text classifier kids can play with in 30 seconds.
   Uses a word-bag model with built-in training data that can be
   extended in the UI. No external libraries.
   ================================================================ */
(() => {
  'use strict';
  const host = document.getElementById('ai-demo');
  if (!host) return;

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

  host.innerHTML = `
    <div class="demo-shell">
      <div class="demo-head">
        <span class="demo-tag">🧪 Try it now</span>
        <h2>Happy or Sad? Teach Me!</h2>
        <p>Type any sentence. My brain checks each word against the "happy" and "sad" words I know, then guesses the mood.</p>
      </div>

      <div class="demo-io">
        <input id="demo-input" type="text" placeholder="I love banana pancakes!" maxlength="120" />
        <button id="demo-btn" class="btn demo-btn">What's the Mood? 🤖</button>
      </div>

      <div class="demo-output" id="demo-output" aria-live="polite">
        <div class="demo-emoji" id="demo-emoji">🤔</div>
        <div class="demo-label" id="demo-label">Ask me anything!</div>
        <div class="demo-meter"><div class="demo-meter-bar" id="demo-bar"></div></div>
        <div class="demo-highlight" id="demo-highlight"></div>
      </div>

      <div class="demo-teach">
        <details>
          <summary>Teach me a new word! ➕</summary>
          <div class="demo-teach-row">
            <input id="teach-word" type="text" placeholder="New word (like 'banana')" maxlength="20"/>
            <button id="teach-happy" class="tiny-btn happy">+ Happy 😊</button>
            <button id="teach-sad"   class="tiny-btn sad">+ Sad ☹️</button>
          </div>
          <p class="demo-note" id="teach-note">I know <b id="word-count">${count()}</b> words so far.</p>
        </details>
      </div>
    </div>
  `;

  const input    = host.querySelector('#demo-input');
  const btn      = host.querySelector('#demo-btn');
  const emoji    = host.querySelector('#demo-emoji');
  const label    = host.querySelector('#demo-label');
  const bar      = host.querySelector('#demo-bar');
  const highlight= host.querySelector('#demo-highlight');
  const teachWord= host.querySelector('#teach-word');
  const teachH   = host.querySelector('#teach-happy');
  const teachS   = host.querySelector('#teach-sad');
  const teachNote= host.querySelector('#teach-note');
  const wordCount= host.querySelector('#word-count');

  function count() {
    return trained.happy.size + trained.sad.size;
  }

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

  function run() {
    const text = input.value.trim();
    if (!text) {
      emoji.textContent = '🤔';
      label.textContent = 'Type something first!';
      bar.style.width = '0%';
      highlight.innerHTML = '';
      return;
    }
    const r = classify(text);
    const net = r.h - r.s;
    const conf = r.total ? Math.min(1, (r.h + r.s) / Math.max(3, r.total)) : 0;
    let face, msg, color;
    if (r.h + r.s === 0) {
      face = '😐'; msg = "Hmm, no words I know. Try more feeling words!"; color = '#999';
    } else if (net > 0) {
      face = r.h >= 3 ? '😄' : '🙂';
      msg = `Happy! I spotted ${r.h} happy word${r.h>1?'s':''}.`;
      color = '#2ecc71';
    } else if (net < 0) {
      face = r.s >= 3 ? '😢' : '🙁';
      msg = `Sad. I spotted ${r.s} sad word${r.s>1?'s':''}.`;
      color = '#e74c3c';
    } else {
      face = '😐'; msg = `Mixed! ${r.h} happy and ${r.s} sad. I'm not sure.`;
      color = '#f39c12';
    }
    emoji.textContent = face;
    label.textContent = msg;
    bar.style.width = Math.round(conf * 100) + '%';
    bar.style.background = color;

    highlight.innerHTML = r.matches.map(m => {
      if (m.type === 'happy') return `<span class="hl hl-happy">${m.t}</span>`;
      if (m.type === 'sad')   return `<span class="hl hl-sad">${m.t}</span>`;
      return m.t;
    }).join(' ');

    if (face === '😄' && typeof window.fireConfetti === 'function') {
      const br = emoji.getBoundingClientRect();
      window.fireConfetti(br.left + br.width/2, br.top + br.height/2);
    }
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });

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
  }
  teachH.addEventListener('click', () => teach('happy'));
  teachS.addEventListener('click', () => teach('sad'));
})();
