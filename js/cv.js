(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const state = { lang: 'en', filter: 'all', swiper: null };
try { state.lang = localStorage.getItem('lang') === 'es' ? 'es' : 'en'; } catch (e) {}
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const tx = v => (v && typeof v === 'object' ? (v[state.lang] ?? v.en) : v);

const TXT = {
  en: {
    navExperiencia: 'Experience', navProyectos: 'Projects', navStack: 'Stack', navContacto: 'Contact',
    'hero.kicker': 'Curriculum · 2026',
    'hero.cta': 'See the work', 'hero.print': 'Save as PDF', 'hero.mail': 'Email me', 'hero.scroll': 'Scroll',
    'stats.kicker': 'Real numbers', 'stats.title': 'Shipped, not claimed',
    'exp.kicker': 'Track record', 'exp.lead': 'Companies and clients, most recent first.',
    'proj.kicker': 'Selected work', 'proj.title': 'Games and sites',
    'proj.lead': 'Real projects, most of them playable today. Drag, swipe or use the arrows; filter by kind.',
    'proj.all': 'All', 'proj.games': 'Games', 'proj.web': 'Web', 'proj.filter': 'Filter projects',
    'stack.kicker': 'Tools', 'stack.title': 'Local AI stack',
    'stack.lead': 'Open models deployed on hardware I own, chained into private workflows.',
    'contact.kicker': 'Contact',
    linkPlay: 'Play', linkLive: 'Live site', linkSteam: 'Steam', linkItch: 'itch.io', linkRepo: 'Code'
  },
  es: {
    navExperiencia: 'Experiencia', navProyectos: 'Proyectos', navStack: 'Stack', navContacto: 'Contacto',
    'hero.kicker': 'Curriculum · 2026',
    'hero.cta': 'Ver el trabajo', 'hero.print': 'Guardar PDF', 'hero.mail': 'Escríbeme', 'hero.scroll': 'Baja',
    'stats.kicker': 'Números reales', 'stats.title': 'Publicado, no prometido',
    'exp.kicker': 'Trayectoria', 'exp.lead': 'Empresas y clientes, de lo más reciente a lo más antiguo.',
    'proj.kicker': 'Trabajo seleccionado', 'proj.title': 'Juegos y webs',
    'proj.lead': 'Proyectos reales, la mayoría jugables hoy. Arrastra, desliza o usa las flechas; filtra por tipo.',
    'proj.all': 'Todo', 'proj.games': 'Juegos', 'proj.web': 'Web', 'proj.filter': 'Filtrar proyectos',
    'stack.kicker': 'Herramientas', 'stack.title': 'Stack de IA local',
    'stack.lead': 'Modelos abiertos desplegados en hardware propio, encadenados en flujos privados.',
    'contact.kicker': 'Contacto',
    linkPlay: 'Jugar', linkLive: 'Ver web', linkSteam: 'Steam', linkItch: 'itch.io', linkRepo: 'Código'
  }
};
const t = key => TXT[state.lang][key] || TXT.en[key] || key;

/* ---------- reveal + counters ---------- */
const revealIO = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealIO.unobserve(entry.target);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
const watchReveals = () => $$('[data-reveal]:not(.is-in)').forEach(el => revealIO.observe(el));

const countIO = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    countUp(entry.target);
    countIO.unobserve(entry.target);
  }
}, { threshold: 0.5 });

function countUp(el) {
  const to = Number(el.dataset.to);
  if (!Number.isFinite(to)) return;
  if (reduced) { el.textContent = to.toLocaleString(state.lang === 'es' ? 'es-PE' : 'en-US'); return; }
  const start = performance.now();
  const dur = 1200;
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * eased).toLocaleString(state.lang === 'es' ? 'es-PE' : 'en-US');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- helpers ---------- */
const contactItems = () => (window.CONTACT || []).filter(c => c.href);

function projectCover(p) {
  const card = p.aaa && p.aaa.card;
  if (card && card.imgs && card.imgs[0]) return card.imgs[0];
  if (p.video && p.video.loop) return `video/${p.video.loop}.webp`;
  const im = Array.isArray(p.img) ? p.img[0] : p.img;
  return im ? `img/${im}.webp` : null;
}

function projectLinks(p) {
  const labels = {
    play: t('linkPlay'), live: t('linkLive'), steam: t('linkSteam'), itch: t('linkItch'), repo: t('linkRepo')
  };
  return ['play', 'live', 'steam', 'itch', 'repo']
    .filter(k => p.links && p.links[k])
    .map(k => `<a class="plink" href="${esc(p.links[k])}" target="_blank" rel="noopener">${esc(labels[k])} ↗</a>`)
    .join('');
}

function pillarName(p) {
  const pillar = (window.PILLARS || []).find(x => x.id === p.pillar);
  return pillar ? tx(pillar.name) : p.pillar;
}

/* ---------- render ---------- */
function renderHero() {
  document.documentElement.lang = state.lang;
  const UI = window.UI || { en: {}, es: {} };
  const ui = UI[state.lang] || UI.en || {};
  $$('[data-hero]').forEach(el => {
    const key = el.dataset.hero;
    const map = {
      kicker: t('hero.kicker'),
      role: ui['hero.role'] || '',
      lead: ui['hero.lead'] || '',
      cta: t('hero.cta'),
      print: t('hero.print'),
      mail: t('hero.mail'),
      scroll: t('hero.scroll')
    };
    if (map[key] !== undefined) el.textContent = map[key];
  });
}

function renderContact() {
  const list = $('#hero-contact');
  list.innerHTML = contactItems()
    .map(c => `<li><a href="${esc(c.href)}"${c.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${esc(c.label)} ↗</a></li>`)
    .join('');
}

function renderStats() {
  const grid = $('#stats-grid');
  grid.innerHTML = (window.TROPHIES || []).map(tr => {
    const label = esc(tx(tr.label));
    const src = esc(tx(tr.src));
    const word = tr.word ? tx(tr.word) : null;
    const num = word
      ? `<span class="stat__n stat__n--word">${esc(word)}</span>`
      : `<span class="stat__n"><span class="stat__num" data-to="${Number(tr.n) || 0}">0</span>${tr.suffix ? esc(tr.suffix) : ''}${tr.sup ? `<sup>${esc(tx(tr.sup))}</sup>` : ''}</span>`;
    return `<li class="stat" data-reveal>${num}<span class="stat__label">${label}</span><span class="stat__src">${src}</span></li>`;
  }).join('');
  $$('.stat__num', grid).forEach(el => countIO.observe(el));
}

function renderExperience() {
  const list = $('#exp-list');
  list.innerHTML = (window.EXPERIENCE || []).map(x => {
    const L = x[state.lang] || x.en;
    return `<li class="exp__item" data-reveal>
      <div>
        <span class="exp__when pixel">${esc(tx(x.when))}</span>
        <span class="exp__org">${esc(tx(x.org))}</span>
      </div>
      <div>
        <h3 class="exp__role">${esc(L.role)}</h3>
        <p class="exp__text">${esc(L.text)}</p>
      </div>
    </li>`;
  }).join('');
}

function renderFilters() {
  const box = $('#proj-filters');
  const opts = [['all', t('proj.all')], ['games', t('proj.games')], ['web', t('proj.web')]];
  box.setAttribute('aria-label', t('proj.filter'));
  box.innerHTML = opts.map(([id, label]) =>
    `<button class="chip${state.filter === id ? ' on' : ''}" type="button" data-filter="${id}" aria-pressed="${state.filter === id}">${esc(label)}</button>`
  ).join('');
}

function renderProjects() {
  if (state.swiper) { state.swiper.destroy(true, true); state.swiper = null; }
  const projects = (window.PROJECTS || [])
    .filter(p => !p.lab && (p.pillar === 'games' || p.pillar === 'web'))
    .filter(p => state.filter === 'all' || p.pillar === state.filter)
    .sort((a, b) => {
      const rank = p => (p.pillar === 'games' ? 0 : 1);
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return ((a.aaa && a.aaa.order) ?? 99) - ((b.aaa && b.aaa.order) ?? 99);
    });

  const wrapper = $('#proj-wrapper');
  wrapper.innerHTML = projects.map(p => {
    const L = p[state.lang] || p.en;
    const cover = projectCover(p);
    const links = projectLinks(p);
    const tags = (p.tags || []).slice(0, 4).map(tag => `<li class="tag">${esc(tag)}</li>`).join('');
    return `<div class="swiper-slide">
      <article class="pcard" data-reveal>
        <div class="pcard__media">
          ${cover ? `<img src="${esc(cover)}" alt="${esc(L.title)} — ${esc(L.status)}" loading="lazy" decoding="async">` : ''}
          ${p.year ? `<span class="pcard__year pixel">${esc(p.year)}</span>` : ''}
          <span class="pcard__badge pixel">${esc(L.status)}</span>
        </div>
        <div class="pcard__body">
          <div class="pcard__top">
            <h3 class="pcard__title">${esc(L.title)}</h3>
            <span class="pcard__pillar">${esc(pillarName(p))}</span>
          </div>
          <p class="pcard__text">${esc(L.text)}</p>
          ${tags ? `<ul class="pcard__tags">${tags}</ul>` : ''}
          ${links ? `<div class="pcard__links">${links}</div>` : ''}
        </div>
      </article>
    </div>`;
  }).join('');

  const pag = $('#proj-pag');
  if (pag) pag.innerHTML = '';
  if (!window.Swiper || !projects.length) return;
  state.swiper = new window.Swiper('#proj-swiper', {
    slidesPerView: 'auto',
    spaceBetween: 18,
    speed: 700,
    grabCursor: true,
    watchOverflow: true,
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: { enabled: true },
    navigation: { prevEl: '#proj-prev', nextEl: '#proj-next' },
    pagination: { el: '#proj-pag', clickable: true },
    breakpoints: {
      720: { spaceBetween: 22 },
      1100: { spaceBetween: 26 }
    }
  });
}

function renderStack() {
  const B = window.AI_BLOCK || { stack: [] };
  const A = B[state.lang] || B.en || { hw: '' };
  const grid = $('#stack-grid');
  grid.innerHTML = (B.stack || []).map(group => `
    <article class="stack__card" data-reveal>
      <h3 class="stack__h">${esc(tx(group))}</h3>
      <ul class="stack__items">${(group.items || []).map(item => `<li class="tag">${esc(item)}</li>`).join('')}</ul>
    </article>`).join('');
  $('#stack-note').textContent = A.hw || '';
}

function renderFooter() {
  const list = $('#footer-links');
  list.innerHTML = contactItems().map((c, i) =>
    `<li><a href="${esc(c.href)}"${c.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><span class="pixel">0${i + 1}</span>${esc(c.label)}<i aria-hidden="true">↗</i></a></li>`
  ).join('');
  const UI = window.UI || { en: {}, es: {} };
  const ui = UI[state.lang] || UI.en || {};
  const title = $('[data-ui="footer.title"]');
  const p = $('[data-ui="footer.p"]');
  if (title) title.textContent = ui['footer.title'] || 'Let’s talk';
  if (p) p.textContent = ui['footer.p'] || '';
}

function applyLang() {
  document.documentElement.lang = state.lang;
  $$('[data-lang]').forEach(el => el.classList.toggle('on', el.dataset.lang === state.lang));
  $$('[data-nav]').forEach(el => {
    const map = { experiencia: 'navExperiencia', proyectos: 'navProyectos', stack: 'navStack', contacto: 'navContacto' };
    el.textContent = t(map[el.dataset.nav]);
  });

  const UI = window.UI || { en: {}, es: {} };
  const ui = UI[state.lang] || UI.en || {};
  const texts = {
    'stats.kicker': t('stats.kicker'), 'stats.title': t('stats.title'),
    'exp.kicker': t('exp.kicker'), 'exp.title': ui['exp.title'] || 'Experience', 'exp.lead': t('exp.lead'),
    'proj.kicker': t('proj.kicker'), 'proj.title': t('proj.title'), 'proj.lead': t('proj.lead'),
    'stack.kicker': t('stack.kicker'), 'stack.title': t('stack.title'), 'stack.lead': t('stack.lead'),
    'contact.kicker': t('contact.kicker'), 'footer.title': ui['footer.title'] || 'Let’s talk', 'footer.p': ui['footer.p'] || ''
  };
  $$('[data-ui]').forEach(el => {
    if (texts[el.dataset.ui] !== undefined) el.textContent = texts[el.dataset.ui];
  });

  renderHero();
  renderContact();
  renderStats();
  renderExperience();
  renderFilters();
  renderProjects();
  renderStack();
  renderFooter();
  watchReveals();
}

/* ---------- hero title ---------- */
let heroSplit = null;
function animateHero() {
  const title = $('#hero-title');
  if (!title) return;
  if (window.SplitType && !heroSplit) {
    heroSplit = new window.SplitType(title, { types: 'chars', tagName: 'span' });
    if (!reduced) {
      (heroSplit.chars || []).forEach((char, i) => {
        char.animate(
          [{ opacity: 0, transform: 'translateY(108%)' }, { opacity: 1, transform: 'none' }],
          { duration: 900, delay: 70 + i * 38, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
        );
      });
    }
  }
  if (reduced) return;
  $$('.hero__inner > *').forEach((el, i) => {
    if (el === title) return;
    el.animate(
      [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay: 320 + i * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
    );
  });
}

/* ---------- chrome: progress, scrollspy, lang, print ---------- */
function initChrome() {
  const bar = $('.progress i');
  const navLinks = $$('[data-nav]');
  const sections = ['experiencia', 'proyectos', 'stack', 'contacto']
    .map(id => document.getElementById(id)).filter(Boolean);
  let queued = false;

  const onScroll = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    let current = '';
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= innerHeight * 0.4) current = sec.id;
    }
    navLinks.forEach(a => a.classList.toggle('on', a.dataset.nav === current));
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  $$('.nav__lang').forEach(btn => btn.addEventListener('click', () => {
    state.lang = state.lang === 'es' ? 'en' : 'es';
    try { localStorage.setItem('lang', state.lang); } catch (e) {}
    applyLang();
  }));

  $$('#proj-filters').forEach(box => box.addEventListener('click', ev => {
    const chip = ev.target.closest('[data-filter]');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    renderFilters();
    renderProjects();
    watchReveals();
  }));

  const printBtn = $('#print-cv');
  if (printBtn) printBtn.addEventListener('click', async () => {
    const imgs = [...document.images];
    imgs.forEach(img => { img.loading = 'eager'; });
    await Promise.all(imgs.map(img => img.decode().catch(() => {})));
    window.print();
  });

  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  if (nav && toggle) {
    const setOpen = open => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    $$('.nav__panel a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', ev => { if (ev.key === 'Escape') setOpen(false); });
  }

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

/* ---------- three.js: a woven sheet of points ---------- */
async function initScene() {
  const canvas = $('#scene');
  if (!canvas) return;
  let THREE;
  try { THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'); } catch (e) { return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return; }

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
  camera.position.set(0, 0, 6.6);

  const group = new THREE.Group();
  group.position.set(0, 0.1, -0.4);
  group.rotation.set(-0.42, 0, -0.05);
  scene.add(group);

  const COLS = 54;
  const ROWS = 34;
  const sheet = new THREE.PlaneGeometry(15.5, 9.6, COLS, ROWS);

  const wire = new THREE.WireframeGeometry(sheet);
  const wirePos = wire.attributes.position;
  const wireBase = Float32Array.from(wirePos.array);
  const lines = new THREE.LineSegments(
    wire,
    new THREE.LineBasicMaterial({ color: 0x4eb9da, transparent: true, opacity: 0.1, depthWrite: false })
  );
  lines.position.z = -0.85;
  group.add(lines);

  const pointGeo = sheet.clone();
  const pPos = pointGeo.attributes.position;
  const pBase = Float32Array.from(pPos.array);
  const count = pPos.count;
  const colors = new Float32Array(count * 3);
  const palette = ['#e8366e', '#f4b740', '#43b98c', '#4eb9da', '#f8eed8'].map(h => new THREE.Color(h));
  for (let i = 0; i < count; i++) {
    const c = palette[(i * 7 + (i % 5)) % palette.length];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(
    pointGeo,
    new THREE.PointsMaterial({
      size: 0.042,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  group.add(points);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  function wave(x, y, time) {
    return Math.sin(x * 0.62 + time * 0.55) * 0.34
      + Math.cos(y * 1.35 - time * 0.42) * 0.2
      + Math.sin((x + y) * 0.38 + time * 0.3) * 0.12;
  }

  function update(time) {
    const a = pPos.array;
    for (let i = 0; i < a.length; i += 3) {
      a[i + 2] = wave(pBase[i], pBase[i + 1], time);
    }
    pPos.needsUpdate = true;

    const w = wirePos.array;
    for (let i = 0; i < w.length; i += 3) {
      w[i + 2] = wave(wireBase[i], wireBase[i + 1], time);
    }
    wirePos.needsUpdate = true;

    if (!reduced) {
      target.x += (pointer.x * 0.14 - target.x) * 0.05;
      target.y += (pointer.y * 0.08 - target.y) * 0.05;
      group.rotation.x = -0.42 + target.y;
      group.rotation.y = target.x;
    }
    renderer.render(scene, camera);
  }

  function resize() {
    const host = canvas.parentElement;
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    update(reduced ? 0 : performance.now() / 1000);
  }

  let running = false;
  let raf = 0;
  const start = () => {
    if (running || reduced) return;
    running = true;
    const loop = now => {
      if (!running) return;
      update(now / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  addEventListener('pointermove', ev => {
    pointer.x = (ev.clientX / innerWidth) * 2 - 1;
    pointer.y = (ev.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  canvas.addEventListener('webglcontextlost', ev => { ev.preventDefault(); stop(); });

  resize();
  update(0);
  canvas.classList.add('is-on');

  const hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) start(); else stop();
      }
    }, { threshold: 0 }).observe(hero);
  } else {
    start();
  }
  if (reduced) renderer.render(scene, camera);
}

/* ---------- boot ---------- */
applyLang();
animateHero();
initChrome();
initScene();
})();
