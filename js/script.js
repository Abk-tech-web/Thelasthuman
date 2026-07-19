/* =========================================================
   THE LAST HUMAN ($LAST) — script.js
   Vanilla JS, no build step, no external frameworks.
   ========================================================= */
(() => {
  'use strict';

  const state = {
    config: null,
    dexPair: null,
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------
     Config loader
     --------------------------------------------------------- */
  async function loadConfig() {
    try {
      const res = await fetch('data/config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('config not found');
      state.config = await res.json();
    } catch (err) {
      console.warn('[LAST] Could not load data/config.json, using defaults.', err);
      state.config = {
        token: { name: 'THE LAST HUMAN', symbol: '$LAST', chain: 'solana', contractAddress: '' },
        dex: { dexscreenerPairAddress: '' },
        social: { telegram: 'https://t.me/thelasthuman1', twitter: '' }
      };
    }
    applyConfig();
  }

  function applyConfig() {
    const cfg = state.config;
    const ca = cfg.token.contractAddress || '';

    $$('.js-ca-text').forEach(el => { el.textContent = ca ? shortenAddress(ca) : 'Contract not yet live'; });
    $$('.js-ca-full').forEach(el => { el.dataset.ca = ca; });
    $$('.js-buy-link').forEach(el => {
      if (ca) {
        el.href = `https://jup.ag/swap/SOL-${ca}`;
        el.classList.remove('is-disabled');
      } else {
        el.href = cfg.social.telegram || '#community';
        el.dataset.pending = 'true';
      }
    });

    const twitterEls = $$('.js-twitter');
    twitterEls.forEach(el => {
      if (cfg.social.twitter) {
        el.href = cfg.social.twitter;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
    $$('.js-telegram').forEach(el => { el.href = cfg.social.twitter === undefined ? el.href : (cfg.social.telegram || '#'); });
  }

  function shortenAddress(addr) {
    if (!addr || addr.length < 10) return addr || '—';
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }

  /* ---------------------------------------------------------
     Loading screen
     --------------------------------------------------------- */
  function initLoader() {
    const loader = $('#loader');
    const fill = $('.loader-bar-fill');
    if (!loader) return;
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) p = 100;
      if (fill) fill.style.width = p + '%';
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => loader.classList.add('hidden'), 250);
      }
    }, 120);
    window.addEventListener('load', () => {
      if (fill) fill.style.width = '100%';
      setTimeout(() => loader.classList.add('hidden'), 400);
    });
    // hard fallback so the loader can never block the site
    setTimeout(() => loader.classList.add('hidden'), 3500);
  }

  /* ---------------------------------------------------------
     Nav: scroll state + mobile menu
     --------------------------------------------------------- */
  function initNav() {
    const nav = $('.nav');
    const onScroll = () => {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const burger = $('.hamburger');
    const menu = $('.mobile-menu');
    if (burger && menu) {
      burger.addEventListener('click', () => menu.classList.toggle('open'));
      $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
    }
  }

  /* ---------------------------------------------------------
     Hero: text scramble headline + video/canvas fallback
     --------------------------------------------------------- */
  const GLYPHS = '01アイウエオ#$%&*+=-_/\\<>{}[]';

  function scrambleInto(el, finalText, duration = 1100) {
    const start = performance.now();
    const len = finalText.length;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      let out = '';
      for (let i = 0; i < len; i++) {
        const charT = Math.min(1, Math.max(0, (t * len - i * 0.55)));
        if (charT >= 1) out += finalText[i];
        else if (finalText[i] === ' ') out += ' ';
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }

  function initHeroText() {
    $$('.js-scramble').forEach(el => {
      const finalText = el.dataset.text || el.textContent;
      scrambleInto(el, finalText, 1400);
    });
  }

  function initHeroMedia() {
    const video = $('#heroVideo');
    const canvas = $('#heroCanvas');
    if (!video) return;
    video.addEventListener('error', () => {
      video.style.display = 'none';
      if (canvas) startFallbackCanvas(canvas);
    }, { once: true });
    // if metadata never loads (missing file), fall back too
    setTimeout(() => {
      if (video.readyState === 0) {
        video.style.display = 'none';
        if (canvas) startFallbackCanvas(canvas);
      }
    }, 1800);
  }

  function startFallbackCanvas(canvas) {
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    let w, h, nodes;
    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function makeNodes() {
      const count = Math.floor((w * h) / (26000 * devicePixelRatio));
      nodes = Array.from({ length: Math.min(count, 90) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      }));
    }
    resize(); makeNodes();
    window.addEventListener('resize', () => { resize(); makeNodes(); });

    function tick() {
      ctx.fillStyle = '#06070A';
      ctx.fillRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx.strokeStyle = 'rgba(57,255,136,0.12)';
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160 * devicePixelRatio) {
            ctx.globalAlpha = 1 - dist / (160 * devicePixelRatio);
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#39FF88';
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.6 * devicePixelRatio, 0, 7); ctx.fill(); }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    els.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     Copy contract address
     --------------------------------------------------------- */
  function initCopyCA() {
    $$('.js-copy-ca').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ca = state.config?.token?.contractAddress;
        if (!ca) { showToast('Contract address not live yet — check Telegram for the announcement.'); return; }
        try {
          await navigator.clipboard.writeText(ca);
          showToast('Contract address copied.');
        } catch {
          showToast('Copy failed — select and copy manually.');
        }
      });
    });
  }

  function showToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  /* ---------------------------------------------------------
     Wallet connect (Phantom / Solflare — window.solana)
     --------------------------------------------------------- */
  function initWallet() {
    const btn = $('#walletBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const provider = window.solana || window.solflare;
      if (!provider) {
        showToast('No Solana wallet found — install Phantom to connect.');
        window.open('https://phantom.app/', '_blank', 'noopener');
        return;
      }
      try {
        btn.disabled = true;
        btn.textContent = 'Connecting…';
        const resp = await provider.connect();
        const pubkey = resp.publicKey?.toString?.() || provider.publicKey?.toString?.();
        btn.textContent = shortenAddress(pubkey);
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-ghost');
        showToast('Wallet connected.');
        localStorage.setItem('last_wallet', pubkey);
        renderLeaderboard(pubkey);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Connect Wallet';
        showToast('Connection cancelled.');
      }
    });
  }

  /* ---------------------------------------------------------
     Live stats: DexScreener public API (no key required)
     Resolves the best-liquidity pair directly from the token
     contract address — no manual pair address needed.
     --------------------------------------------------------- */
  async function resolveBestPair() {
    const cfg = state.config;
    const pinnedPair = cfg?.dex?.dexscreenerPairAddress;
    const tokenAddr = cfg?.token?.contractAddress;

    // If a specific pair is pinned in config, use it as-is.
    if (pinnedPair) {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pinnedPair}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('DexScreener pair request failed');
      const json = await res.json();
      const pair = json.pairs && json.pairs[0];
      if (!pair) throw new Error('No pair data for pinned pair');
      return pair;
    }

    // Otherwise resolve every pair for the token and pick the
    // one with the most liquidity (i.e. the "real" trading pair).
    if (!tokenAddr) throw new Error('No contract address set');
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddr}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('DexScreener token request failed');
    const json = await res.json();
    const pairs = (json.pairs || []).filter(p => p.chainId === 'solana');
    if (!pairs.length) throw new Error('No live pairs found for this token yet');
    pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    return pairs[0];
  }

  async function loadStats() {
    const cfg = state.config;
    const tokenAddr = cfg?.token?.contractAddress;
    const pinnedPair = cfg?.dex?.dexscreenerPairAddress;
    const grid = $('#statsGrid');
    const note = $('#dataNote');
    if (!grid) return;

    if (!tokenAddr && !pinnedPair) {
      renderStatsEmpty();
      if (note) { note.querySelector('.dot').classList.add('off'); note.querySelector('span').textContent = 'Live feed connects automatically once a contract address is set in data/config.json.'; }
      return;
    }

    try {
      const pair = await resolveBestPair();
      state.dexPair = pair;
      renderStats(pair);
      if (note) {
        note.querySelector('.dot').classList.remove('off');
        note.querySelector('span').textContent = `Live — sourced from DexScreener (${pair.dexId}), refreshed every 30s.`;
      }
    } catch (err) {
      console.warn('[LAST] stats fetch failed', err);
      renderStatsEmpty(true);
      if (note) { note.querySelector('.dot').classList.add('off'); note.querySelector('span').textContent = 'No live pool found yet for this contract address — retrying automatically.'; }
    }
  }

  function fmtUsd(n) {
    if (n === undefined || n === null || isNaN(n)) return '—';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
    if (n < 1) return '$' + n.toFixed(6);
    return '$' + n.toFixed(2);
  }
  function fmtNum(n) {
    if (n === undefined || n === null || isNaN(n)) return '—';
    return new Intl.NumberFormat('en-US').format(Math.round(n));
  }

  function renderStats(pair) {
    const map = {
      price: fmtUsd(parseFloat(pair.priceUsd)),
      mcap: fmtUsd(pair.marketCap || pair.fdv),
      liquidity: fmtUsd(pair.liquidity?.usd),
      vol24: fmtUsd(pair.volume?.h24),
      fdv: fmtUsd(pair.fdv),
      change: (pair.priceChange?.h24 ?? 0),
      buys: fmtNum(pair.txns?.h24?.buys),
      sells: fmtNum(pair.txns?.h24?.sells),
    };
    setStat('stat-price', map.price);
    setStat('stat-mcap', map.mcap);
    setStat('stat-liquidity', map.liquidity);
    setStat('stat-vol', map.vol24);
    setStat('stat-fdv', map.fdv);
    setStat('stat-change', (map.change >= 0 ? '+' : '') + map.change.toFixed(2) + '%', map.change >= 0 ? 'up' : 'down');
    setStat('stat-buys', map.buys);
    setStat('stat-sells', map.sells);

    const ratioEl = $('#stat-ratio');
    if (ratioEl) {
      const b = pair.txns?.h24?.buys || 0, s = pair.txns?.h24?.sells || 0;
      const total = b + s;
      ratioEl.textContent = total ? Math.round((b / total) * 100) + '% buys' : '—';
    }
    buildTicker(pair);
  }

  function setStat(id, value, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    el.classList.remove('loading', 'up', 'down');
    if (cls) el.classList.add(cls);
  }

  function renderStatsEmpty(errored) {
    ['stat-price','stat-mcap','stat-liquidity','stat-vol','stat-fdv','stat-change','stat-buys','stat-sells'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = errored ? '—' : 'Pending'; el.classList.add('loading'); }
    });
  }

  function buildTicker(pair) {
    const track = $('#tickerTrack');
    if (!track || !pair) return;
    const chg = pair.priceChange?.h24 ?? 0;
    const items = [
      `$LAST ${fmtUsd(parseFloat(pair.priceUsd))}`,
      `MCAP ${fmtUsd(pair.marketCap || pair.fdv)}`,
      `24H VOL ${fmtUsd(pair.volume?.h24)}`,
      `LIQUIDITY ${fmtUsd(pair.liquidity?.usd)}`,
      `24H ${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg).toFixed(2)}%`,
    ];
    const html = items.map(t => `<div class="ticker-item"><b>${t}</b></div>`).join('');
    track.innerHTML = html + html; // duplicate for seamless loop
  }

  /* ---------------------------------------------------------
     Chart embed (DexScreener iframe)
     --------------------------------------------------------- */
  function initChart() {
    const frame = $('#chartFrame');
    if (!frame) return;
    const pairAddr = state.dexPair?.pairAddress;
    const tokenAddr = state.config?.token?.contractAddress;
    const embedTarget = pairAddr || tokenAddr;

    if (!embedTarget) {
      frame.innerHTML = '<div class="chart-empty">Chart activates automatically once a contract address is set in data/config.json.</div>';
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.src = `https://dexscreener.com/solana/${embedTarget}?embed=1&theme=dark&trades=0&info=0`;
    iframe.loading = 'lazy';
    frame.innerHTML = '';
    frame.appendChild(iframe);
  }

  /* ---------------------------------------------------------
     Tokenomics donut (pure SVG, no chart library)
     --------------------------------------------------------- */
  function initTokenomics() {
    const svg = $('#donutSvg');
    if (!svg) return;
    const data = [
      { label: 'Community & Airdrops', pct: 40, color: '#39FF88' },
      { label: 'Liquidity Pool', pct: 25, color: '#12B981' },
      { label: 'Treasury', pct: 15, color: '#5EEAD4' },
      { label: 'Team (locked)', pct: 10, color: '#2C3D37' },
      { label: 'Marketing & CEX', pct: 10, color: '#1C2622' },
    ];
    const R = 80, C = 2 * Math.PI * R;
    let offset = 0;
    const cx = 100, cy = 100;
    let paths = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#12171B" stroke-width="26"/>`;
    data.forEach(d => {
      const len = (d.pct / 100) * C;
      paths += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${d.color}" stroke-width="26"
        stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"/>`;
      offset += len;
    });
    svg.innerHTML = paths;

    const list = $('#tokenList');
    if (list) {
      list.innerHTML = data.map(d => `
        <li><span class="swatch" style="background:${d.color}"></span><span class="name">${d.label}</span><span class="pct">${d.pct}%</span></li>
      `).join('');
    }
  }

  /* ---------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------- */
  function initFaq() {
    $$('.faq-item').forEach(item => {
      const q = $('.faq-q', item);
      const a = $('.faq-a', item);
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        $$('.faq-item').forEach(i => { i.classList.remove('open'); $('.faq-a', i).style.maxHeight = null; });
        if (!isOpen) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Animated counters (mission stats etc.)
     --------------------------------------------------------- */
  function initCounters() {
    $$('.js-counter').forEach(el => {
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          io.unobserve(el);
          const start = performance.now();
          const dur = 1400;
          function tick(now) {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = fmtNum(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------
     Leaderboard (demo — localStorage only, no backend)
     --------------------------------------------------------- */
  const DEMO_LEADERS = [
    { wallet: '7xKX…q9Fp', pts: 18420 },
    { wallet: 'Bz4m…2Rvt', pts: 15990 },
    { wallet: 'Hn8w…c1Lk', pts: 13210 },
    { wallet: 'Dq2s…9Xmb', pts: 11045 },
    { wallet: 'Fp6r…4Ttz', pts: 9870 },
  ];
  function renderLeaderboard(myWallet) {
    const list = $('#leaderList');
    if (!list) return;
    const rows = [...DEMO_LEADERS];
    if (myWallet) rows.push({ wallet: shortenAddress(myWallet), pts: Number(localStorage.getItem('last_points') || 0), you: true });
    rows.sort((a, b) => b.pts - a.pts);
    list.innerHTML = rows.map((r, i) => `
      <div class="leader-row ${r.you ? 'you' : ''}"><span class="rank">${i + 1}</span><span class="wallet">${r.wallet}${r.you ? ' (you)' : ''}</span><span class="pts">${fmtNum(r.pts)} pts</span></div>
    `).join('');
  }

  /* ---------------------------------------------------------
     Airdrop checker (demo — deterministic client-side check,
     clearly not connected to a real snapshot/backend)
     --------------------------------------------------------- */
  function initAirdrop() {
    const form = $('#airdropForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#airdropWallet');
      const result = $('#airdropResult');
      const val = input.value.trim();
      if (val.length < 32) {
        result.textContent = 'Enter a valid Solana wallet address.';
        result.className = 'util-result show';
        return;
      }
      // Deterministic demo hash — NOT a real snapshot lookup.
      let hash = 0;
      for (let i = 0; i < val.length; i++) hash = (hash * 31 + val.charCodeAt(i)) >>> 0;
      const eligible = hash % 3 === 0;
      if (eligible) {
        result.textContent = `Eligible — demo allocation ${fmtNum(1000 + (hash % 9000))} $LAST. Real allocations are confirmed after TGE via Telegram.`;
        result.className = 'util-result show eligible';
      } else {
        result.textContent = 'Not on the current demo list — join the community and stay active to qualify for the real snapshot.';
        result.className = 'util-result show';
      }
    });
  }

  /* ---------------------------------------------------------
     Daily rewards (demo — localStorage streak, no backend)
     --------------------------------------------------------- */
  function initDailyRewards() {
    const btn = $('#dailyClaimBtn');
    const status = $('#dailyStatus');
    if (!btn) return;
    const last = localStorage.getItem('last_claim_date');
    const today = new Date().toDateString();
    if (last === today) {
      btn.disabled = true;
      btn.textContent = 'Claimed today';
      if (status) status.textContent = 'Come back tomorrow for another claim.';
    }
    btn.addEventListener('click', () => {
      localStorage.setItem('last_claim_date', today);
      const pts = Number(localStorage.getItem('last_points') || 0) + 50;
      localStorage.setItem('last_points', pts);
      btn.disabled = true;
      btn.textContent = 'Claimed today';
      if (status) status.textContent = `+50 points claimed — ${fmtNum(pts)} total.`;
      showToast('Daily reward claimed: +50 points.');
      renderLeaderboard(localStorage.getItem('last_wallet'));
    });
  }

  /* ---------------------------------------------------------
     AI Assistant (rule-based, fully client-side — no external
     API call, since this static site ships no backend/API key)
     --------------------------------------------------------- */
  const AI_RULES = [
    { k: ['what is $last', 'what is last', 'about', 'project'], a: 'THE LAST HUMAN ($LAST) is a Solana community token built around one idea: as AI reshapes everything, human creativity and community are still the one thing that can\'t be automated.' },
    { k: ['contract', 'ca', 'address'], a: () => state.config?.token?.contractAddress ? `Contract address: ${state.config.token.contractAddress}` : 'The contract address isn\'t live yet — it will be announced on Telegram the moment it launches. Don\'t trust any CA shared elsewhere.' },
    { k: ['buy', 'how do i buy', 'purchase'], a: 'Once live: get SOL in a Solana wallet like Phantom, then swap it for $LAST on Jupiter or Raydium using the official contract address from our Telegram — never a link from DMs.' },
    { k: ['tokenomics', 'supply', 'allocation'], a: '$LAST allocation: 40% community & airdrops, 25% liquidity, 15% treasury, 10% team (locked), 10% marketing. Full breakdown is in the Tokenomics section above.' },
    { k: ['roadmap', 'plan'], a: 'The roadmap runs from community launch through exchange listings and ecosystem tools — scroll to the Roadmap section for each phase.' },
    { k: ['telegram', 'community', 'chat'], a: 'Join the community on Telegram — the link is in the navbar and footer.' },
    { k: ['safe', 'scam', 'rug'], a: 'Never share your seed phrase, only trust links posted in the official Telegram, and always verify the contract address before swapping.' },
    { k: ['airdrop'], a: 'Try the Airdrop Checker further down the page — note it\'s a community demo tool, the real snapshot is announced separately.' },
    { k: ['hi', 'hello', 'hey'], a: 'Hey, human. Ask me about $LAST — tokenomics, the roadmap, or how to buy.' },
  ];
  const AI_FALLBACK = 'I don\'t have an answer for that yet — try asking about tokenomics, the roadmap, or how to buy $LAST, or reach the team on Telegram.';

  function aiRespond(text) {
    const q = text.toLowerCase();
    for (const rule of AI_RULES) {
      if (rule.k.some(k => q.includes(k))) return typeof rule.a === 'function' ? rule.a() : rule.a;
    }
    return AI_FALLBACK;
  }

  function initAI() {
    const launcher = $('#aiLauncher');
    const panel = $('#aiPanel');
    const body = $('#aiBody');
    const input = $('#aiInput');
    const sendBtn = $('#aiSend');
    if (!launcher || !panel) return;

    launcher.addEventListener('click', () => panel.classList.toggle('open'));
    $$('.ai-chip').forEach(chip => chip.addEventListener('click', () => {
      addAiMsg(chip.textContent, 'user');
      const reply = aiRespond(chip.textContent);
      setTimeout(() => addAiMsg(reply, 'bot'), 350);
    }));

    function send() {
      const val = input.value.trim();
      if (!val) return;
      addAiMsg(val, 'user');
      input.value = '';
      const reply = aiRespond(val);
      setTimeout(() => addAiMsg(reply, 'bot'), 350);
    }
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    function addAiMsg(text, who) {
      const div = document.createElement('div');
      div.className = `ai-msg ${who}`;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }
  }

  /* ---------------------------------------------------------
     Mouse glow effect (subtle — respects reduced motion)
     --------------------------------------------------------- */
  function initMouseGlow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const glow = document.createElement('div');
    glow.style.cssText = 'position:fixed;width:420px;height:420px;border-radius:50%;pointer-events:none;z-index:1;background:radial-gradient(circle, rgba(57,255,136,0.05), transparent 70%);transform:translate(-50%,-50%);transition:opacity .3s;opacity:0;';
    document.body.appendChild(glow);
    let raf = null;
    document.addEventListener('mousemove', (e) => {
      glow.style.opacity = '1';
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        raf = null;
      });
    });
    document.addEventListener('mouseleave', () => glow.style.opacity = '0');
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', async () => {
    initLoader();
    initNav();
    initHeroMedia();
    initHeroText();
    initReveal();
    initCopyCA();
    initWallet();
    initChart();
    initTokenomics();
    initFaq();
    initCounters();
    initAirdrop();
    initDailyRewards();
    initAI();
    initMouseGlow();
    renderLeaderboard(localStorage.getItem('last_wallet'));

    await loadConfig();
    await loadStats();
    initChart(); // re-run once config is loaded
    setInterval(loadStats, 30000);

    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1 && $(id)) {
          e.preventDefault();
          $(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  });
})();
