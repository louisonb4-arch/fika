#!/usr/bin/env python3
"""Fika — pages et fichiers annexes (mentions légales, 404, SEO, icônes). Lancé par build.py."""
import os, re
from PIL import Image, ImageDraw
S = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(S)
URL = 'https://fika-site.vercel.app'
W = lambda p, t: open(os.path.join(R, p), 'w', encoding='utf-8').write(t)

def page(title, body, css):
    return f'''<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="robots" content="{'noindex' if '404' in title else 'index,follow'}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#06363A">
<style>{css}
.pg h1,.pg h2{{font-family:var(--serif);font-weight:400;line-height:1.02;letter-spacing:-.01em}}.pg p,.pg li{{color:var(--gris-c)}}.pg{{max-width:760px;margin:0 auto;padding:120px var(--pad) 90px}}.pg h1{{font-size:clamp(46px,8vw,84px);margin:18px 0 34px}}.pg h2{{font-size:30px;margin:38px 0 10px}}.pg p,.pg li{{color:var(--gris);margin-bottom:10px}}.pg ul{{padding-left:20px}}.pg a{{text-decoration:underline}}.pg .todo{{background:#FCE7DF;padding:2px 6px;border-radius:4px;color:var(--encre)}}
.top{{position:fixed;inset:0 0 auto;padding:22px var(--pad);display:flex;justify-content:space-between;align-items:center;background:rgba(6,54,58,.9);backdrop-filter:blur(10px)}}.top svg{{width:70px;height:42px;color:var(--creme)}}</style></head>
<body><svg width="0" height="0" style="position:absolute"><path id="scr" d="{open(os.path.join(S,'logo-script.d')).read().strip()}"/></svg>
<header class="top"><a href="/" aria-label="Fika, accueil"><svg viewBox="80 395 1005 595"><use href="#scr" fill="currentColor"/></svg></a><a class="btn btn--c" href="/">Retour au site</a></header>
<main class="pg">{body}</main></body></html>'''

def run(css):
    css = re.sub(r'url\(fonts/', 'url(/fonts/', css)
    W('mentions-legales.html', page('Mentions légales — Fika, Nantes', '''<p class="cap gold">Informations légales</p><h1>Mentions légales</h1>
<h2>Éditeur du site</h2><p>Fika — pâtisserie, salon de thé et déjeuner<br>28 place Viarme, 44000 Nantes<br>Téléphone : 02 28 44 64 75</p>
<p>Forme juridique et capital : <span class="todo">à compléter</span><br>RCS / SIRET : <span class="todo">à compléter</span><br>Directeur de la publication : <span class="todo">à compléter</span></p>
<h2>Hébergement</h2><p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com</p>
<h2>Conception</h2><p>Site conçu et réalisé par Vokum Agency — vokumagency.com</p>
<h2>Photographies</h2><p>Photographies : Fika (compte Instagram @fika.nantes) et fiche d’établissement. Toute reproduction est interdite sans autorisation.</p>
<h2>Données personnelles</h2><p>Ce site ne dépose aucun cookie, n’utilise aucun outil de mesure d’audience et ne collecte aucune donnée personnelle. Le module « number cake » fonctionne entièrement dans votre navigateur : rien n’est envoyé.</p>
<p>Les liens vers Instagram et Google Maps vous redirigent vers ces services, soumis à leurs propres conditions.</p>''', css))
    W('404.html', page('Page introuvable (404) — Fika', '''<p class="cap gold">Erreur 404</p><h1>Cette part a déjà été mangée.</h1>
<p>La page que vous cherchez n’existe pas ou plus. La vitrine, elle, est toujours là.</p><p style="margin-top:30px"><a class="btn btn--d" href="/" style="text-decoration:none">Retour à l’accueil</a></p>''', css))
    W('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {URL}/sitemap.xml\n')
    W('sitemap.xml', f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>{URL}/</loc><priority>1.0</priority></url>\n<url><loc>{URL}/mentions-legales</loc><priority>0.2</priority></url>\n</urlset>\n')
    W('llms.txt', '''# Fika — pâtisserie, salon de thé & déjeuner (Nantes)

> Pâtisserie et salon de thé indépendant au 28 place Viarme, 44000 Nantes. Slogan : « Le meilleur pour la faim ». Inspiré de la fika suédoise, la pause café-gâteau qu’on prend plusieurs fois par jour.

- Adresse : 28 place Viarme, 44000 Nantes (quartier Viarme)
- Téléphone : 02 28 44 64 75
- Horaires : du mercredi au samedi, 8h30 – 18h30. Fermé du dimanche au mardi.
- Sans réservation ; sur place ou à emporter.
- Pâtisseries de saison faites maison (choux, tartes, flans, entremets, pavlovas), plusieurs sans gluten ; vanille de Madagascar bio, chocolats Valrhona et Millot.
- Formats : individuel, 4, 6 ou 8 parts (commande conseillée pour les formats à partager) ; number cakes et letter cakes sur commande.
- Formule déjeuner : 1 choix salé + 1 pâtisserie + 1 boisson — 18,50 € sur place, 16,50 € à emporter.
- Note Google : 4,9/5 (198 avis).
- Instagram : https://www.instagram.com/fika.nantes/
''')
    W('vercel.json', '''{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {"source": "/(img|fonts)/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]},
    {"source": "/(.*)", "headers": [
      {"key": "X-Content-Type-Options", "value": "nosniff"},
      {"key": "X-Frame-Options", "value": "DENY"},
      {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
      {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"}
    ]}
  ]
}
''')
    W('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#06363A"/><rect x="14" y="18" width="18" height="30" fill="#F3E7D6"/><path d="M22 18a8.5 8.5 0 0 0 12-11Z" fill="#EC7A66"/><circle cx="35" cy="21" r="2.6" fill="none" stroke="#C49A45" stroke-width="2"/><path d="M24 56V34a11 11 0 0 1 22 0v22" fill="none" stroke="#C49A45" stroke-width="2.6"/></svg>\n')
    # apple-touch-icon
    im = Image.new('RGB', (180, 180), '#06363A'); d = ImageDraw.Draw(im)
    d.rectangle([42, 52, 92, 136], fill='#F3E7D6'); d.pieslice([60, 14, 116, 70], 135, 315, fill='#EC7A66')
    d.ellipse([92, 54, 106, 68], outline='#C49A45', width=4); d.arc([70, 70, 132, 132], 180, 360, fill='#C49A45', width=6)
    d.line([70, 101, 70, 160], fill='#C49A45', width=6); d.line([132, 101, 132, 160], fill='#C49A45', width=6)
    im.save(os.path.join(R, 'apple-touch-icon.png'))
    # image de partage
    src = Image.open(os.path.join(S, 'gm', 'g7.jpg')).convert('RGB'); w, h = src.size
    th = int(w * 630 / 1200); og = src.crop((0, (h - th) // 2, w, (h - th) // 2 + th)).resize((1200, 630), Image.LANCZOS)
    og.save(os.path.join(R, 'img', 'og.jpg'), quality=82, optimize=True)
    print('annexes ok')
