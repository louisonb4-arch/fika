#!/usr/bin/env python3
"""Détourage des pâtisseries (rembg, modèle isnet). Usage : python3 _source/cut.py 01 14 19 ..."""
import glob, os, sys
from PIL import Image, ImageDraw
from rembg import new_session, remove
S = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(S, 'cut'); os.makedirs(OUT, exist_ok=True)
model = os.environ.get('M', 'isnet-general-use')
sess = new_session(model)
keys = sys.argv[1:]
for k in keys:
    f = glob.glob(os.path.join(S, 'ig', k + '_*.jpg'))[0]
    im = Image.open(f).convert('RGB')
    cut = remove(im, session=sess, post_process_mask=True)
    cut.save(os.path.join(OUT, f'{k}-{model[:5]}.png'))
    print(k, 'ok', flush=True)
# planche
fs = [os.path.join(OUT, f'{k}-{model[:5]}.png') for k in keys]
W = 300; cols = 6; rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, W * rows), '#06363A'); d = ImageDraw.Draw(sheet)
for i, f in enumerate(fs):
    c = Image.open(f); c.thumbnail((W, W)); x, y = (i % cols) * W, (i // cols) * W
    sheet.paste(c, (x + (W - c.width) // 2, y + (W - c.height) // 2), c); d.text((x + 6, y + 6), os.path.basename(f)[:2], fill='white')
sheet.save(os.path.join(S, f'cutsheet-{model[:5]}.jpg'), quality=85)
