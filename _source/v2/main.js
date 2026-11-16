(() => {
'use strict';
const d = document, H = d.documentElement, B = d.body;
const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- lettres une à une ---------- */
$$('[data-chars]').forEach(el => {
  let i = +(el.dataset.delay || 0);
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(' ')); return; }
          const w = d.createElement('span'); w.className = 'w';
          [...part].forEach(ch => { const c = d.createElement('span'); c.className = 'c'; c.innerHTML = '<i style="--i:' + (i++) + '"></i>'; c.firstChild.textContent = ch; w.appendChild(c); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  if (!el.hasAttribute('aria-label') && !el.closest('[aria-hidden="true"]') && !el.closest('[aria-label]')) el.setAttribute('aria-label', el.textContent.trim());
  walk(el);
  if (el.hasAttribute('aria-label')) $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
  el.classList.add('chars');
});
$$('[data-letters]').forEach(el => {
  const t = el.textContent; el.setAttribute('aria-label', t); el.textContent = '';
  [...t].forEach((ch, i) => { const s = d.createElement('i'); s.style.setProperty('--i', i); s.textContent = ch === ' ' ? ' ' : ch; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); });
});

/* ---------- apparitions au scroll ---------- */
const hero = $('.hero');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .2, rootMargin: '0px 0px -8% 0px' });
const watch = () => $$('.rise,[data-chars],.board,.love,#sign').forEach(el => {
  if (hero.contains(el) || el.closest('.moment')) return;
  io.observe(el);
});

/* ---------- ouverture ---------- */
const intro = $('#intro');
let started = false;
function go() {
  if (started) return; started = true;
  H.classList.add('go'); B.classList.remove('locked');
  $$('.rise,[data-chars]', hero).forEach(el => el.classList.add('in'));
  watch();
}
if (!H.classList.contains('has-intro') || !intro) { intro && intro.remove(); go(); }
else {
  B.classList.add('locked');
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; scrollTo(0, 0); } catch (e) {}
  let done = false; const T = [];
  const at = (ms, f) => T.push(setTimeout(f, ms));
  const finish = (skip) => {
    if (done) return; done = true; T.forEach(clearTimeout);
    try { sessionStorage.setItem('fika-intro', '1'); } catch (e) {}
    if (skip) { intro.classList.add('s5'); go(); }
    setTimeout(() => intro.remove(), 550);
  };
  requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('s1')));
  at(650, () => intro.classList.add('s2'));
  at(2000, () => intro.classList.add('s3'));
  at(2950, () => intro.classList.add('s4'));
  at(3450, () => { go(); intro.classList.add('s5'); finish(false); });
  at(4000, () => intro.remove());
  $('#skip').addEventListener('click', () => finish(true));
}

/* ---------- navigation ---------- */
const nav = $('#nav'); let lastY = scrollY;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 30);
  nav.classList.toggle('hide', y > lastY && y > 600 && !B.classList.contains('menu-open'));
  lastY = y;
}, { passive: true });
const burger = $('#burger');
burger.addEventListener('click', () => { const o = B.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); });
$$('#mmenu a').forEach(a => a.addEventListener('click', () => { B.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); }));

/* ---------- heure de Paris + statut ---------- */
const paris = () => {
  try {
    const p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { wd: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].indexOf(g('weekday')), h: +g('hour') % 24, m: +g('minute') };
  } catch (e) { const n = new Date(); return { wd: n.getDay(), h: n.getHours(), m: n.getMinutes() }; }
};
const fmt = (h, m) => h + 'h' + String(m).padStart(2, '0');
function status() {
  const { wd, h, m } = paris(), t = h * 60 + m, day = wd >= 3 && wd <= 6, open = day && t >= 510 && t < 1110;
  const before = day && t < 510;
  const next = wd === 6 || wd < 3 ? 'mercredi' : 'demain';
  const long = open ? 'Ouvert · jusqu’à 18h30' : before ? 'Fermé · ouvre à 8h30' : 'Fermé · ouvre ' + next + ' à 8h30';
  $$('.js-status').forEach(s => { s.classList.toggle('open', open); s.lastElementChild.textContent = long; });
  const disc = $('.js-status-disc');
  if (disc) { disc.classList.toggle('open', open); $('b', disc).textContent = open ? 'Ouvert' : 'Fermé'; $('.js-status-sub', disc).textContent = open ? 'jusqu’à 18h30' : before ? 'dès 8h30' : 'dès ' + next; }
  $$('#hours li').forEach(li => li.classList.toggle('today', li.dataset.d.split(' ').includes(String(wd))));
  return { h, m, t, open };
}
status(); setInterval(status, 60000);

/* ---------- l'horloge de la journée ---------- */
const track = $('#clockTrack');
if (track) {
  const hand = $('#dialHand'), arc = $('#dialArc'), label = $('#dialTime');
  const moments = $$('#moments .moment'), pics = $$('#dialPics img'), dots = $$('#clockDots i');
  const times = [8.5, 10.5, 12, 15.5, 17, 18.5];
  let cur = -1, ticking = false;
  const setMoment = k => {
    if (k === cur) return;
    moments.forEach((m, i) => {
      m.classList.toggle('on', i === k); m.classList.toggle('after', i > k);
      const c = $('.chars', m); if (c) c.classList.toggle('in', i === k);
    });
    pics.forEach((p, i) => p.classList.toggle('on', i === k));
    dots.forEach((p, i) => p.classList.toggle('on', i === k));
    cur = k;
  };
  const paint = () => {
    ticking = false;
    const r = track.getBoundingClientRect(), span = r.height - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / span));
    const t = 8.5 + p * 10, hh = Math.floor(t), mm = Math.floor((t - hh) * 60 / 5) * 5;
    hand.style.setProperty('--rot', ((t % 12) / 12 * 360) + 'deg');
    arc.style.strokeDasharray = (p * 300) + ' 360';
    label.textContent = fmt(hh, mm);
    let k = 0; times.forEach((x, i) => { if (t >= x - .35) k = i; });
    setMoment(k);
  };
  $('.chars', moments[0]) && $('.chars', moments[0]).classList.add('in');
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener('resize', paint); paint();
  // l'heure réelle, en point corail
  const nowDot = $('#dialNow'), nowTxt = $('#clockNow');
  const now = () => {
    const { h, m, open } = status(), t = h + m / 60;
    const inDay = t >= 8.5 && t < 18.5;
    nowDot.style.display = inDay ? '' : 'none';
    nowDot.style.transform = 'rotate(' + ((t % 12) / 12 * 360) + 'deg)';
    const moment = ['du petit-déjeuner', 'de la pause café', 'du déjeuner', 'du goûter', 'du chocolat chaud', 'du chocolat chaud'][times.reduce((a, x, i) => t >= x - .35 ? i : a, 0)];
    nowTxt.textContent = 'Il est ' + fmt(h, m) + ' à Nantes : ' + (open ? 'c’est l’heure ' + moment + '.' : 'le salon est fermé, rendez-vous à 8h30.');
  };
  now(); setInterval(now, 60000);
}

/* ---------- la vitrine des saisons ---------- */
const data = JSON.parse($('#vitData').textContent);
const cards = $('#cards'), tabs = $$('#tabs [role=tab]'), pill = $('#pill');
const pic = (n, sizes) => {
  const w = data.img[n]; const ss = ext => w.map(s => 'img/' + n + '-' + s + '.' + ext + ' ' + s + 'w').join(',');
  return '<picture><source type="image/avif" srcset="' + ss('avif') + '" sizes="' + sizes + '"><img src="img/' + n + '-' + w[0] + '.webp" srcset="' + ss('webp') + '" sizes="' + sizes + '" width="800" height="800" alt="' + data.alt[n] + '" loading="lazy" decoding="async"></picture>';
};
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const render = s => data.seasons[s].map((c, i) => '<article class="card" style="--i:' + i + ';--r:' + (i % 2 ? 2 : -2) + 'deg"><div class="card__ph">' + pic(c.img, '(max-width:560px) 46vw, (max-width:900px) 45vw, 28vw') + '<p class="card__desc">' + esc(c.d) + '</p></div><div class="card__name"><h3 class="spaced">' + esc(c.n) + '</h3>' + (c.tag ? '<span class="card__tag">' + c.tag + '</span>' : '') + '</div><p class="card__more">' + esc(c.d) + '</p></article>').join('');
const movePill = btn => { pill.style.width = btn.offsetWidth + 'px'; pill.style.transform = 'translateX(' + btn.offsetLeft + 'px)'; };
let season = 'automne', seen = false, busy = false;
const show = (s, animate) => {
  if (busy || (s === season && animate)) return;
  tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.s === s)); movePill(tabs.find(t => t.dataset.s === s));
  const swap = () => {
    cards.innerHTML = render(s); season = s; busy = false;
    if (seen) requestAnimationFrame(() => requestAnimationFrame(() => $$('.card', cards).forEach(c => c.classList.add('in'))));
  };
  if (animate && seen && !RM) { busy = true; $$('.card', cards).forEach(c => { c.classList.remove('in'); c.classList.add('out'); }); setTimeout(swap, 420); }
  else swap();
};
tabs.forEach(t => {
  t.addEventListener('click', () => show(t.dataset.s, true));
  t.addEventListener('keydown', e => {
    const k = tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0);
    if (k !== tabs.indexOf(t) && tabs[k]) { tabs[k].focus(); show(tabs[k].dataset.s, true); }
  });
});
const mo = paris() && new Date().getMonth();
const nowSeason = [2, 3, 4].includes(mo) ? 'printemps' : [5, 6, 7].includes(mo) ? 'ete' : [8, 9, 10].includes(mo) ? 'automne' : 'hiver';
show(nowSeason, false);
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { seen = true; $$('.card', cards).forEach(c => c.classList.add('in')); o.disconnect(); } }, { threshold: .15 }).observe(cards);
addEventListener('resize', () => movePill(tabs.find(t => t.dataset.s === season)));
d.fonts && d.fonts.ready.then(() => movePill(tabs.find(t => t.dataset.s === season)));

/* ---------- number cake ---------- */
const svg = $('#cakeSvg'), inp = $('#cakeIn');
if (svg && inp) {
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const defs = '<defs><radialGradient id="cr" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#FFFDF8"/><stop offset=".6" stop-color="#F6EEE2"/><stop offset="1" stop-color="#DCCBB2"/></radialGradient><radialGradient id="bs" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#E2B074"/><stop offset="1" stop-color="#A9703F"/></radialGradient></defs>';
  const cv = d.createElement('canvas'); cv.width = 800; cv.height = 500; const cx = cv.getContext('2d', { willReadFrequently: true });
  const draw = txt => {
    seed = [...txt].reduce((a, c) => a + c.charCodeAt(0) * 131, 9);
    cx.clearRect(0, 0, 800, 500); cx.fillStyle = '#000'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    let fs = 400; cx.font = '600 ' + fs + 'px Jost, sans-serif';
    const w = cx.measureText(txt).width; if (w > 640) { fs = fs * 640 / w; cx.font = '600 ' + fs + 'px Jost, sans-serif'; }
    cx.fillText(txt, 400, 262);
    const px = cx.getImageData(0, 0, 800, 500).data, step = 27, pts = [];
    for (let y = step / 2; y < 500; y += step * .87) for (let x = (Math.round(y / step) % 2 ? step / 2 : 0) + 8; x < 800; x += step) {
      if (px[((y | 0) * 800 + (x | 0)) * 4 + 3] > 120) pts.push([x + (rnd() - .5) * 4, y + (rnd() - .5) * 4]);
    }
    let h = defs + '<g>';
    pts.forEach(([x, y]) => { h += '<circle class="dot" style="--dl:' + (x / 800 * .35).toFixed(2) + 's" cx="' + x.toFixed(1) + '" cy="' + (y + 6).toFixed(1) + '" r="17" fill="url(#bs)"/>'; });
    h += '</g><g>';
    pts.forEach(([x, y]) => { const r = 11 + rnd() * 4; h += '<g class="dot" style="--dl:' + (.25 + x / 800 * .5 + rnd() * .1).toFixed(2) + 's"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="url(#cr)"/><path d="M' + (x - r * .35).toFixed(1) + ' ' + (y - r * .2).toFixed(1) + 'q' + (r * .35).toFixed(1) + ' ' + (-r * .5).toFixed(1) + ' ' + (r * .7).toFixed(1) + ' 0" fill="none" stroke="#E7D9C4" stroke-width="1.4"/></g>'; });
    h += '</g><g>';
    pts.forEach(([x, y]) => {
      const q = rnd(), dl = 'style="--dl:' + (.75 + x / 800 * .5).toFixed(2) + 's"';
      if (q < .13) h += '<circle class="dot" ' + dl + ' cx="' + (x + 7).toFixed(1) + '" cy="' + (y - 8).toFixed(1) + '" r="6" fill="#D9473A" stroke="#F08A78" stroke-width="1.5"/>';
      else if (q < .21) h += '<rect class="dot" ' + dl + ' x="' + (x - 3).toFixed(1) + '" y="' + (y - 12).toFixed(1) + '" width="6" height="11" rx="2" fill="#C49A45" transform="rotate(' + ((rnd() - .5) * 90).toFixed(0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>';
      else if (q < .27) { const fx = x + 6, fy = y - 6, col = rnd() < .5 ? '#8FA8E0' : '#F2A7B8'; h += '<g class="dot" ' + dl + ' fill="' + col + '">'; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; h += '<circle cx="' + (fx + Math.cos(a) * 3.4).toFixed(1) + '" cy="' + (fy + Math.sin(a) * 3.4).toFixed(1) + '" r="2.6"/>'; } h += '<circle cx="' + fx.toFixed(1) + '" cy="' + fy.toFixed(1) + '" r="1.8" fill="#F4D37E"/></g>'; }
      else if (q < .31) h += '<path class="dot" ' + dl + ' d="M' + (x - 2).toFixed(1) + ' ' + (y - 4).toFixed(1) + 'c4 -10 12 -10 14 -6c-4 2 -9 4 -14 6z" fill="#7FA36A"/>';
    });
    svg.innerHTML = h + '</g>';
  };
  const clean = v => v.toUpperCase().replace(/[^A-Z0-9&]/g, '').slice(0, 2);
  let tmr;
  inp.addEventListener('input', () => { const v = clean(inp.value); if (inp.value !== v) inp.value = v; clearTimeout(tmr); if (v) tmr = setTimeout(() => draw(v), 220); });
  const ex = ['30', '18', '1', 'LM', '40', '7', '25', 'AB', '60', '3'];
  let ei = 0;
  $('#cakeDice').addEventListener('click', () => { ei = (ei + 1) % ex.length; inp.value = ex[ei]; draw(ex[ei]); });
  const first = () => (d.fonts ? d.fonts.load('600 400px Jost') : Promise.resolve()).then(() => draw(clean(inp.value) || '30'));
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { first(); o.disconnect(); } }, { rootMargin: '200px' }).observe(svg);
}
})();
