#!/usr/bin/env python3
"""Fika — build : _source/ -> index.html (+ pages annexes). Usage : python3 _source/build.py"""
import json, math, os, random, re, shutil, subprocess
S = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(S)
rd = lambda p: open(os.path.join(S, p), encoding='utf-8').read()
meta = json.load(open(os.path.join(S, 'img-meta.json')))
SCRIPT = rd('logo-script.d').strip(); PEN = rd('logo-pen.d').strip()

def picture(m):
    attrs = m.group(1)
    name = re.search(r'data-p="([^"]+)"', attrs).group(1)
    sizes = re.search(r'data-sizes="([^"]+)"', attrs).group(1)
    rest = re.sub(r'\s*data-(p|sizes)="[^"]*"', '', attrs).strip()
    rest = ' ' + rest if rest else ''
    w0, h0, ws = meta[name]
    W = ws[-1]; Hh = round(h0 * W / w0)
    ss = lambda ext: ','.join(f'img/{name}-{s}.{ext} {s}w' for s in ws)
    dec = '' if 'fetchpriority' in rest else ' decoding="async"'
    return (f'<picture><source type="image/avif" srcset="{ss("avif")}" sizes="{sizes}">'
            f'<img src="img/{name}-{ws[0]}.webp" srcset="{ss("webp")}" sizes="{sizes}" width="{W}" height="{Hh}"{rest}{dec}></picture>')

def plate():
    rnd = random.Random(4)
    out = ['<defs><radialGradient id="pl" cx="50%" cy="45%" r="55%"><stop offset=".72" stop-color="#FBF6EE"/><stop offset=".9" stop-color="#F1E8DA"/><stop offset="1" stop-color="#E6D9C5"/></radialGradient></defs>',
           '<circle cx="200" cy="200" r="198" fill="url(#pl)"/><g class="spk">']
    for _ in range(170):
        a = rnd.random() * math.tau; r = math.sqrt(rnd.random()) * 186
        out.append(f'<circle cx="{200+math.cos(a)*r:.1f}" cy="{200+math.sin(a)*r:.1f}" r="{rnd.uniform(.5,1.3):.2f}" fill="#7A6E60" opacity="{rnd.uniform(.25,.6):.2f}"/>')
    out.append('</g><circle cx="200" cy="200" r="146" fill="none" stroke="#000" stroke-opacity=".035" stroke-width="10"/>')
    out.append('<circle cx="200" cy="200" r="195.5" fill="none" stroke="#C49A45" stroke-width="3.5"/>')
    return ''.join(out)

def dial():
    o = ['<circle class="dial__face" cx="200" cy="200" r="194"/><circle class="dial__rim" cx="200" cy="200" r="188"/>']
    for i in range(60):
        a = math.radians(i * 6); h = i % 5 == 0; r1 = 170 if h else 178
        o.append(f'<line class="dial__tick{" h" if h else ""}" x1="{200+math.sin(a)*r1:.1f}" y1="{200-math.cos(a)*r1:.1f}" x2="{200+math.sin(a)*184:.1f}" y2="{200-math.cos(a)*184:.1f}"/>')
    for n in range(1, 13):
        a = math.radians(n * 30)
        o.append(f'<text class="dial__num" x="{200+math.sin(a)*150:.1f}" y="{200-math.cos(a)*150:.1f}">{n}</text>')
    rot = 'transform="rotate(165 200 200)"'
    o.append(f'<circle cx="200" cy="200" r="162" fill="none" stroke="#EADAC2" stroke-width="6" pathLength="360" stroke-dasharray="300 360" {rot}/>')
    o.append(f'<circle id="dialArc" class="dial__arc" cx="200" cy="200" r="162" pathLength="360" stroke-dasharray="0 360" {rot}/>')
    o.append('<g id="dialNow" class="dial__nowg"><circle class="dial__now" cx="200" cy="6" r="6.5" stroke="#FBF6EE" stroke-width="2.5"/></g>')
    o.append('<g id="dialHand" class="dial__hand"><line x1="200" y1="104" x2="200" y2="44"/><circle cx="200" cy="40" r="7" fill="#EC7A66" stroke="#FBF6EE" stroke-width="2.5"/></g>')
    return ''.join(o)

DOODLE = ('<svg class="doodle {pos}" viewBox="0 0 120 90" aria-hidden="true">'
  '<path class="g" pathLength="1" d="M4 70C22 52 36 40 62 34S104 22 116 8"/>'
  '<path class="g" pathLength="1" d="M26 52q4-12 15-9q-5 10-15 9ZM50 37q-2-12 9-14q2 11-9 14ZM84 26q6-10 16-5q-7 9-16 5Z"/>'
  '<circle class="p" pathLength="1" cx="66" cy="33" r="5"/><path class="p" pathLength="1" d="M66 26q4-6 0-9q-4 3 0 9M73 33q6 4 9 0q-3-4-9 0M66 40q-4 6 0 9q4-3 0-9M59 33q-6-4-9 0q3 4 9 0"/>'
  '<circle class="y" pathLength="1" cx="108" cy="14" r="3"/><circle class="w" pathLength="1" cx="18" cy="64" r="2.5"/><circle class="p" pathLength="1" cx="38" cy="60" r="3"/>'
  '<path class="w" pathLength="1" d="M10 82q8-6 16 0M92 46q5-5 10 0"/></svg>')

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def cards(data, season):
    out = []
    for i, c in enumerate(data[season]):
        ws = meta[c['img']][2]; sz = '(max-width:560px) 46vw, (max-width:900px) 45vw, 28vw'
        ss = lambda ext: ','.join(f'img/{c["img"]}-{s}.{ext} {s}w' for s in ws)
        alt = esc(c['n'].replace(' · ', ' ') + ', pâtisserie Fika')
        tag = f'<span class="card__tag">{c["tag"]}</span>' if c.get('tag') else ''
        out.append(f'<article class="card" style="--i:{i};--r:{2 if i % 2 else -2}deg"><div class="card__ph"><picture><source type="image/avif" srcset="{ss("avif")}" sizes="{sz}"><img src="img/{c["img"]}-{ws[0]}.webp" srcset="{ss("webp")}" sizes="{sz}" width="800" height="800" alt="{alt}" loading="lazy" decoding="async"></picture><p class="card__desc">{esc(c["d"])}</p></div><div class="card__name"><h3 class="spaced">{esc(c["n"])}</h3>{tag}</div><p class="card__more">{esc(c["d"])}</p></article>')
    return ''.join(out)

JSONLD = {
 "@context": "https://schema.org", "@type": ["Bakery", "CafeOrCoffeeShop"], "name": "Fika",
 "description": "Pâtisserie, salon de thé et déjeuner à Nantes, place Viarme.", "slogan": "Le meilleur pour la faim",
 "url": "https://fika-site.vercel.app/", "telephone": "+33228446475", "image": "https://fika-site.vercel.app/img/og.jpg",
 "address": {"@type": "PostalAddress", "streetAddress": "28 place Viarme", "postalCode": "44000", "addressLocality": "Nantes", "addressCountry": "FR"},
 "geo": {"@type": "GeoCoordinates", "latitude": 47.2205193, "longitude": -1.563011},
 "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Wednesday", "Thursday", "Friday", "Saturday"], "opens": "08:30", "closes": "18:30"}],
 "servesCuisine": ["Pâtisserie", "Salon de thé", "Déjeuner"], "acceptsReservations": False, "priceRange": "€",
 "sameAs": ["https://www.instagram.com/fika.nantes/"]
}

def tool(cmd, inp):
    try:
        return subprocess.run(cmd, input=inp, capture_output=True, text=True, check=True, cwd=S).stdout
    except Exception as e:
        print('  (minification ignorée :', cmd[0], e.__class__.__name__, ')'); return inp

CM = json.load(open(os.path.join(S, 'cut-meta.json')))
PENP = '<path class="pen" d="' + PEN + '" pathLength="1" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>'

def cutpic(m):
    attrs = m.group(1)
    name = re.search(r'data-c="([^"]+)"', attrs).group(1)
    sizes = re.search(r'data-sizes="([^"]+)"', attrs).group(1)
    rest = re.sub(r'\s*data-(c|sizes)="[^"]*"', '', attrs).strip()
    rest = ' ' + rest if rest else ''
    c = CM[name]; ws = c['sizes']; W = ws[-1]; Hh = round(c['h'] * W / c['w'])
    ss = lambda ext: ','.join(f'img/p-{name}-{s}.{ext} {s}w' for s in ws)
    dec = '' if 'fetchpriority' in rest else ' decoding="async"'
    return (f'<picture><source type="image/avif" srcset="{ss("avif")}" sizes="{sizes}">'
            f'<img src="img/p-{name}-{ws[0]}.webp" srcset="{ss("webp")}" sizes="{sizes}" width="{W}" height="{Hh}"{rest}{dec}></picture>')

def vit_items(v):
    out = []; sr = []
    for it in v:
        t = f' data-t="{esc(it["t"])}"' if it.get('t') else ''
        img = cutpic(re.match(r'(.*)', f'data-c="{it["img"]}" data-sizes="(max-width:900px) 50vw, 22vw" alt="{esc(it["n"].replace(" · ", " "))}" loading="lazy"'))
        out.append(f'<div class="item" data-s="{it["s"]}" data-n="{esc(it["n"])}" data-d="{esc(it["d"])}"{t} data-cur="Voir"><div class="item__p">{img}<div class="refl" aria-hidden="true"><img src="img/p-{it["img"]}-{CM[it["img"]]["sizes"][0]}.webp" alt="" loading="lazy" decoding="async"></div></div></div>')
        sr.append(f'<li><b>{esc(it["n"])}</b> ({it["s"].lower()}{", " + it["t"].lower() if it.get("t") else ""}) : {esc(it["d"])}</li>')
    return ''.join(out) + '<ul class="sr">' + ''.join(sr) + '</ul>'

def main():
    vit = json.load(open(os.path.join(S, 'vitrine.json'), encoding='utf-8'))
    html = rd('index.html'); css = rd('style.css'); js = rd('main.js')
    T = os.path.join(S, '.tools', 'node_modules', '.bin')
    if os.path.exists(os.path.join(T, 'lightningcss')):
        tmp = os.path.join(S, '.tools', 'in.css'); open(tmp, 'w').write(css)
        css = tool([os.path.join(T, 'lightningcss'), '--minify', '--targets', '>= 0.5%', tmp], '')
    if os.path.exists(os.path.join(T, 'terser')):
        js = tool([os.path.join(T, 'terser'), '-c', '-m'], js)
    c = CM['choconoisette']; ws = c['sizes']
    pre = (f'<link rel="preload" as="image" type="image/avif" imagesrcset="' + ','.join(f'img/p-choconoisette-{s}.avif {s}w' for s in ws) + '" imagesizes="(max-width:900px) 70vw, 34vw" fetchpriority="high">')
    rep = {
      '<!--CSS-->': '<style>' + css + '</style>', '<!--JS-->': '<script>' + js + '</script>',
      '<!--JSONLD-->': '<script type="application/ld+json">' + json.dumps(JSONLD, ensure_ascii=False) + '</script>',
      '<!--PRELOAD-->': pre, '<!--VITITEMS-->': vit_items(vit), '<!--VITCOUNT-->': str(len(vit)),
      '__SCRIPT__': SCRIPT, '<use href="#pen" />': PENP,
    }
    for k, v in rep.items():
        assert k in html, k
        html = html.replace(k, v)
    html = re.sub(r'<img\s([^>]*data-c="[^"]+"[^>]*)>', cutpic, html)
    html = re.sub(r'<img\s([^>]*data-p="[^"]+"[^>]*)>', picture, html)
    html = re.sub(r'>\s*\n\s*<', '><', html)
    open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(html)
    print('index.html', len(html.encode()) // 1024, 'Ko')
    import sys; sys.path.insert(0, S); import extras; extras.run(css)

if __name__ == '__main__':
    main()
