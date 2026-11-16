(() => {
'use strict';
const d = document, H = d.documentElement;
const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let vw = innerWidth, vh = innerHeight, mob = vw < 900;

/* ---------- lettres ---------- */
$$('[data-chars]').forEach(el => {
  let i = 0; el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const f = d.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { f.appendChild(d.createTextNode(' ')); return; }
        const w = d.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        [...part].forEach(ch => { const c = d.createElement('span'); c.className = 'c'; const k = d.createElement('i'); k.style.setProperty('--i', i++); k.textContent = ch; c.appendChild(k); w.appendChild(c); });
        f.appendChild(w);
      });
      n.replaceWith(f);
    } else if (n.nodeType === 1) walk(n);
  });
  walk(el); el.classList.add('chars');
});

$$('[data-letters]').forEach(el => {
  const t = el.textContent.trim(); if (!el.hasAttribute('aria-hidden')) el.setAttribute('aria-label', t); el.textContent = '';
  let n = 0;
  t.split(' ').forEach((wd, wi) => {
    if (wi) el.appendChild(d.createTextNode(' '));
    const w = d.createElement('span'); w.style.whiteSpace = 'nowrap'; w.setAttribute('aria-hidden', 'true');
    [...wd].forEach(ch => { const k = d.createElement('i'); k.style.setProperty('--i', n++); k.textContent = ch; w.appendChild(k); });
    n++; el.appendChild(w);
  });
});

/* ---------- apparitions ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18, rootMargin: '0px 0px -6% 0px' });
$$('.up,[data-chars]:not(#aHead h2),#sig').forEach(el => io.observe(el));
const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('figure', e.target).forEach((f, i) => setTimeout(() => f.classList.add('in'), i * 160)); io2.unobserve(e.target); } }), { threshold: .12 });
[$('.gal'), $('#midiPh').parentElement].forEach(el => io2.observe(el));

/* ---------- statut (heure de Paris) ---------- */
const paris = () => {
  try {
    const p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { wd: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].indexOf(g('weekday')), t: (+g('hour') % 24) * 60 + +g('minute') };
  } catch (e) { const n = new Date(); return { wd: n.getDay(), t: n.getHours() * 60 + n.getMinutes() }; }
};
const status = () => {
  const { wd, t } = paris(), day = wd >= 3 && wd <= 6, open = day && t >= 510 && t < 1110, before = day && t < 510;
  const txt = open ? 'Ouvert · jusqu’à 18h30' : before ? 'Fermé · ouvre à 8h30' : 'Fermé · ouvre ' + (wd === 6 || wd < 3 ? 'mercredi' : 'demain') + ' à 8h30';
  $$('.js-status').forEach(s => { s.classList.toggle('open', open); s.lastElementChild.textContent = txt; });
  $$('#hours li').forEach(li => li.classList.toggle('today', li.dataset.d.split(' ').includes(String(wd))));
};
status(); setInterval(status, 60000);

/* ---------- menu ---------- */
const mbtn = $('#mbtn'), menuPics = $$('.menu__pic img');
const setMenu = o => { H.classList.toggle('menu-open', o); mbtn.setAttribute('aria-expanded', o); };
mbtn.addEventListener('click', () => setMenu(!H.classList.contains('menu-open')));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
$$('.menu nav a').forEach(a => {
  a.addEventListener('click', () => setMenu(false));
  a.addEventListener('mouseenter', () => menuPics.forEach((p, i) => p.classList.toggle('on', i === +a.dataset.pic)));
});

/* ---------- curseur ---------- */
const cur = $('#cur'), curT = $('#curT');
let mx = vw / 2, my = vh / 2, cx = mx, cy = my, nx = 0, ny = 0;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; nx = mx / vw - .5; ny = my / vh - .5; }, { passive: true });
if (FINE) d.addEventListener('pointerover', e => {
  const t = e.target.closest('[data-cur]');
  cur.classList.toggle('big', !!t); if (t) curT.textContent = t.dataset.cur;
});

/* ---------- scène : hero + anatomie ---------- */
const stage = $('#stage'), px = $('#px'), tilt = $('#tilt'), shadow = $('#shadow'), giant = $('#giant'), spot = $('#spot');
const bands = $$('.band', px), labs = $$('.lab'), aHead = $('#aHead'), aEnd = $('#aEnd'), progs = $$('#prog i'), prog = $('#prog');
const heroEls = [$('#hKick'), $('#h1'), $('#hSide')];
const RATIO = 727 / 560, BAND_C = [.27, .66, .9];
let ph = 0, pw = 0;
const size = () => {
  vw = innerWidth; vh = innerHeight; mob = vw < 900;
  ph = mob ? Math.min(vh * .34, vw * .56 * RATIO) : Math.min(vh * .58, 640); pw = ph / RATIO;
  px.style.setProperty('--ph', ph + 'px'); px.style.setProperty('--pw', pw + 'px');
};
size();
let intro = 0, introStart = 0, sp = 0, headIn = false;
const start = () => { if (H.classList.contains('ready')) return; H.classList.add('ready'); introStart = performance.now(); };
const heroImg = $('img', bands[0]);
Promise.race([heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(), new Promise(r => setTimeout(r, 1400))]).then(() => requestAnimationFrame(start));

function stageFrame(now) {
  const r = stage.getBoundingClientRect();
  if (r.bottom < -50 || r.top > vh + 50) return;
  const p = clamp(-r.top / (r.height - vh));
  sp = RM ? p : lerp(sp, p, .11);
  if (introStart) intro = clamp((now - introStart - 700) / 1100);
  const a = ease(seg(sp, .02, .15)), b = ease(seg(sp, .15, .32)), c = ease(seg(sp, .62, .74)), e = ease(seg(sp, .7, .86));
  // hero
  heroEls.forEach((el, i) => { el.style.opacity = (H.classList.contains('ready') ? (i === 1 ? 1 : intro) : 0) * (1 - a); el.style.transform = `translateY(${-a * 40}px)`; });
  giant.style.opacity = .96 * (1 - a);
  giant.style.transform = `scale(${1 + a * .22}) translate(${nx * -14}px,${ny * -10}px)`;
  giant.style.filter = a > .01 ? `blur(${a * 8}px)` : '';
  spot.style.setProperty('--glow', 1 - b * .4 + e * .2);
  // pâtisserie
  const xA = mob ? -vw * .2 : vw * .02, xE = mob ? 0 : vw * .2;
  const x = lerp(lerp(mob ? 0 : -vw * .07, xA, b), xE, e), y = lerp(lerp(mob ? -vh * .06 : vh * .04, mob ? vh * .04 : vh * .09, b), mob ? -vh * .14 : vh * .02, e);
  const s = lerp(lerp(1, mob ? .82 : .9, b), mob ? .62 : .92, e);
  px.style.transform = `translate(${x}px,${y}px) scale(${s})`;
  const sep = b * (1 - c), gap = ph * .13 * sep;
  bands[0].style.transform = `translateY(${-gap * 1.15}px) rotate(${-3 * sep}deg)`;
  bands[1].style.transform = `translateX(${gap * .08}px)`;
  bands[2].style.transform = `translateY(${gap}px) rotate(${1.5 * sep}deg)`;
  shadow.style.transform = `translateY(${gap}px) scaleX(${1 - sep * .1})`;
  if (FINE && !RM) tilt.style.transform = `perspective(900px) rotateY(${nx * 14 * (1 - b * .7)}deg) rotateX(${-ny * 10 * (1 - b * .7)}deg)`;
  // titres de l'anatomie
  aHead.style.opacity = b * (1 - c); aHead.style.transform = `translateY(${(1 - b) * 30 - c * 30}px)`;
  if (b > .35 && !headIn) { headIn = true; $('h2', aHead).classList.add('in'); }
  if (b < .05 && headIn) { headIn = false; $('h2', aHead).classList.remove('in'); }
  const cxp = vw / 2 + x, cyp = vh / 2 + y, top = cyp - ph * s / 2;
  const offs = [-gap * 1.15, 0, gap];
  labs.forEach((l, i) => {
    const li = ease(seg(sp, .25 + i * .05, .33 + i * .05)) * (1 - c);
    const lx = Math.min(cxp + pw * s / 2 + (mob ? 14 : 64), vw - l.offsetWidth - 14), ly = top + (BAND_C[i] * ph + offs[i]) * s;
    l.style.opacity = li;
    l.style.transform = `translate(${lx + (1 - li) * 30}px,${ly - 12}px)`;
    $('.lab__line', l).style.width = (mob ? 14 : 54) * li + 'px';
  });
  aEnd.style.opacity = e; aEnd.style.transform = `translateY(${(1 - e) * 40}px)`;
  prog.style.opacity = b * (1 - e);
  progs.forEach((pi, i) => pi.style.setProperty('--f', seg(sp, .25 + i * .1, .35 + i * .1)));
}
addEventListener('resize', size);

/* ---------- la vitrine ---------- */
const vTrack = $('#vitTrack'), row = $('#vitRow'), items = $$('.item', row), N = items.length;
const capBox = $('#capBox'), capS = $('#capS'), capN = $('#capN'), capD = $('#capD'), vitN = $('#vitN'), vitBar = $('#vitBar');
let iw = 0, vk = 0, vIdx = -1, capT;
const vSize = () => {
  iw = mob ? vw * .62 : Math.max(vw * .27, 320);
  row.style.setProperty('--iw', iw + 'px'); items.forEach(it => it.style.setProperty('--iw', iw + 'px'));
  vTrack.style.setProperty('--vh', (vh + (N - 1) * (mob ? vh * .42 : vh * .38)) + 'px');
};
vSize(); addEventListener('resize', vSize);
const setCap = i => {
  if (i === vIdx) return; vIdx = i;
  const it = items[i].dataset;
  vitN.textContent = String(i + 1).padStart(2, '0');
  clearTimeout(capT); capBox.classList.add('out');
  capT = setTimeout(() => { capS.textContent = it.s + (it.t ? ' · ' + it.t : ''); capN.textContent = it.n; capD.textContent = it.d; capBox.classList.remove('out'); }, RM ? 0 : 260);
};
function vitFrame() {
  const r = vTrack.getBoundingClientRect();
  if (r.bottom < -50 || r.top > vh + 50) return;
  const q = clamp(-r.top / (r.height - vh)), raw = q * (N - 1), fl = Math.floor(raw), fr = raw - fl;
  const k = Math.min(N - 1, fl + ease(clamp((fr - .2) / .6)));
  vk = RM ? k : lerp(vk, k, .12);
  row.style.transform = `translateX(${vw / 2 - iw / 2 - vk * iw}px)`;
  items.forEach((it, i) => {
    const dd = Math.min(Math.abs(i - vk), 2);
    if (dd > 1.9 && it._far) return; it._far = dd > 1.9;
    it.style.setProperty('--sc', (1 - dd * .19).toFixed(3));
    it.style.setProperty('--op', (1 - dd * .3).toFixed(3));
    it.style.setProperty('--sat', (1 - dd * .25).toFixed(3));
  });
  setCap(Math.round(vk));
  vitBar.style.setProperty('--f', q);
}
const goItem = i => {
  i = clamp(i, 0, N - 1); const r = vTrack.getBoundingClientRect();
  scrollTo({ top: scrollY + r.top + (i / (N - 1)) * (r.height - vh) + 2, behavior: RM ? 'auto' : 'smooth' });
};
$('#vitPrev').addEventListener('click', () => goItem(Math.round(vk) - 1));
$('#vitNext').addEventListener('click', () => goItem(Math.round(vk) + 1));
items.forEach((it, i) => it.addEventListener('click', () => goItem(i)));

/* ---------- la maison : les mots s'allument ---------- */
const stmt = $('#stmt'), words = [];
(function split(node) {
  [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const f = d.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { f.appendChild(d.createTextNode(t)); return; } const s = d.createElement('span'); s.className = 'wd'; s.textContent = t; words.push(s); f.appendChild(s); });
      n.replaceWith(f);
    } else if (n.classList && n.classList.contains('pill')) words.push(n);
    else if (n.nodeType === 1) split(n);
  });
})(stmt);
function stmtFrame() {
  const r = stmt.getBoundingClientRect();
  if (r.bottom < 0 || r.top > vh) return;
  const q = RM ? 1 : clamp((vh * .82 - r.top) / (r.height + vh * .3));
  const n = Math.round(q * words.length);
  words.forEach((w, i) => w.classList.toggle('lit', i < n));
}

/* ---------- la couronne ---------- */
const crown = $('#couronne'), ring = $('#ring'), cmdVis = $('#cmdVis');
function crownFrame(now) {
  const r = cmdVis.getBoundingClientRect();
  if (r.bottom < 0 || r.top > vh) return;
  const q = (vh - r.top) / (vh + r.height);
  crown.style.transform = `rotate(${(q - .5) * 50}deg) translateY(${Math.sin(now / 1100) * 6}px)`;
  ring.style.transform = `rotate(${-q * 120}deg)`;
}

/* ---------- navigation claire / sombre ---------- */
const nav = $('#nav'), light = $$('.vit,.midi,.avis');
function navFrame() {
  const y = 40; nav.classList.toggle('bar', stage.getBoundingClientRect().bottom < 60); nav.classList.toggle('light', !H.classList.contains('menu-open') && light.some(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; }));
}

/* ---------- boucle ---------- */
function frame(now) {
  stageFrame(now); vitFrame(); stmtFrame(); crownFrame(now); navFrame();
  if (FINE) { cx = lerp(cx, mx, .2); cy = lerp(cy, my, .2); cur.style.transform = `translate(${cx}px,${cy}px)`; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
