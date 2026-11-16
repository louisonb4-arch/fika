#!/usr/bin/env python3
"""Fika — prépare les photos : recadrage, 2 tailles, AVIF + WebP. Usage : python3 _source/prep.py"""
import glob, os, json
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', 'img')
os.makedirs(OUT, exist_ok=True)

def src(key):
    if key.startswith('g'):
        return os.path.join(ROOT, 'gm', key + '.jpg')
    return glob.glob(os.path.join(ROOT, 'ig', key + '_*.jpg'))[0]

# nom : (source, tailles, ratio w/h ou None, focus x, focus y)
SQ = (420, 800)
JOBS = {
  'abricot-top': ('40', (640, 1080), 1, .5, .5),
  'kanelbulle': ('44', SQ, 1, .5, .5),
  'mandarine-top': ('26', SQ, 1, .5, .5),
  'focaccia': ('16', (640, 1080), 1, .5, .5),
  'chou-peche': ('39', SQ, 1, .5, .5),
  'salon-plantes': ('43', (700, 1080), 1, .5, .5),
  'salle': ('g7', (900, 1800), None, .5, .5),
  'facade': ('g4', (520, 765), None, .5, .5),
  'enseigne': ('g0', (520, 934), None, .5, .5),
  'ardoises': ('g1', (520, 1050), None, .5, .5),
  'vitrine': ('g2', (900, 1800), None, .5, .5),
  'comptoir': ('g9', (900, 1800), None, .5, .5),
  'choux': ('30', SQ, 1, .5, .5),
  'couronne': ('09', SQ, 1, .5, .5),
  # vitrine des saisons
  'chou-fraise-rhubarbe': ('21', SQ, 1, .5, .5),
  'tarte-rhubarbe': ('45', SQ, 1, .5, .5),
  'flan-rhubarbe': ('23', SQ, 1, .5, .5),
  'fraisier': ('41', SQ, 1, .5, .5),
  'pavlova-fruits-rouges': ('42', SQ, 1, .5, .5),
  'tarte-fraise-basilic': ('20', SQ, 1, .5, .5),
  'douceur-peche': ('17', SQ, 1, .5, .5),
  'tarte-abricot': ('40', SQ, 1, .5, .5),
  'cerise-noire': ('19', SQ, 1, .5, .5),
  'flan-abricot': ('18', SQ, 1, .5, .5),
  'tarte-prunes': ('14', SQ, 1, .5, .5),
  'chou-poire': ('01', SQ, 1, .5, .5),
  'tarte-poire': ('28', SQ, 1, .5, .5),
  'tarte-myrtille-marron': ('36', SQ, 1, .5, .5),
  'flan-pommes': ('13', SQ, 1, .5, .5),
  'choconoisette': ('24', SQ, 1, .5, .5),
  'chocolat-sichuan': ('38', SQ, 1, .5, .5),
  'zeste-breton': ('27', SQ, 1, .5, .5),
  'tarte-chocolat-mandarine': ('26', SQ, 1, .5, .5),
  'pavlova-ananas': ('25', SQ, 1, .5, .5),
  'pamplemousse': ('50', SQ, 1, .5, .5),
}
meta = {}
for name, (key, sizes, ratio, fx, fy) in JOBS.items():
    im = Image.open(src(key)).convert('RGB')
    w, h = im.size
    if ratio:
        tw, th = (w, int(w / ratio)) if w / h < ratio else (int(h * ratio), h)
        tw, th = min(tw, w), min(th, h)
        x = int((w - tw) * fx); y = int((h - th) * fy)
        im = im.crop((x, y, x + tw, y + th))
    w, h = im.size
    meta[name] = [w, h]
    for s in sizes:
        s = min(s, w)
        r = im.resize((s, round(h * s / w)), Image.LANCZOS)
        r.save(os.path.join(OUT, f'{name}-{s}.avif'), quality=52, speed=6)
        r.save(os.path.join(OUT, f'{name}-{s}.webp'), quality=78, method=6)
    meta[name].append([min(s, w) for s in sizes])
json.dump(meta, open(os.path.join(ROOT, 'img-meta.json'), 'w'), indent=1)
# couleur de fond des photos « nappe verte »
for k in ('40', '44', '38', '26'):
    im = Image.open(src(k)).convert('RGB')
    px = [im.getpixel((x, y)) for x, y in ((20, 20), (im.width - 20, 20), (20, im.height - 20))]
    print(k, ['#%02x%02x%02x' % p for p in px])
print(len(JOBS), 'images ok')
