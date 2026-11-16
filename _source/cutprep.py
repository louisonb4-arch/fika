#!/usr/bin/env python3
"""Pâtisseries détourées -> img/p-<nom>-<w>.(avif|webp) + cut-meta.json"""
import json, os
from PIL import Image, ImageFilter
S = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(S, '..', 'img')
JOBS = {  # nom : fichier détouré
 'choconoisette': '24-isnet', 'chou-fraise-rhubarbe': '21-isnet', 'chou-poire': '01-isnet',
 'cerise-noire': '19-isnet', 'tarte-fraise-basilic': '20-isnet', 'zeste-breton': '27-isnet',
 'tarte-poire': '28-isnet', 'tarte-myrtille-marron': '36-isnet', 'douceur-peche': '17-u2net',
 'baba-ananas': '05-u2net', 'flan-cerise': '03-u2net', 'flan-pommes': '13-u2net', 'tarte-prunes': '14-isnet',
 'couronne-exotique': '09-isnet', 'flan-abricot': '18-u2net',
}
SIZES = {'choconoisette': (560, 1100), 'couronne-exotique': (560, 1100)}
meta = {}
for name, f in JOBS.items():
    im = Image.open(os.path.join(S, 'cut', f + '.png')).convert('RGBA')
    a = im.getchannel('A').point(lambda v: 0 if v < 14 else v)
    im.putalpha(a)
    x0, y0, x1, y1 = a.point(lambda v: 255 if v > 40 else 0).getbbox()
    p = 20
    im = im.crop((max(0, x0 - p), max(0, y0 - p), min(im.width, x1 + p), min(im.height, y1 + p)))
    sizes = SIZES.get(name, (360, 720))
    meta[name] = {'w': im.width, 'h': im.height, 'sizes': list(sizes), 'crop_top': max(0, y0 - p)}
    for s in sizes:
        h = round(im.height * s / im.width)
        r = im.resize((s, h), Image.LANCZOS)
        if s > im.width:
            rgb = r.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2)); rgb.putalpha(r.getchannel('A')); r = rgb
        r.save(os.path.join(OUT, f'p-{name}-{s}.webp'), quality=82, method=6)
        r.save(os.path.join(OUT, f'p-{name}-{s}.avif'), quality=60, speed=6)
    print(name, im.size)
json.dump(meta, open(os.path.join(S, 'cut-meta.json'), 'w'), indent=1)
