# Draws the tab icon (a VHS tape, owner pick 2026-11-15) into assets/textures/favicon.png.
# Run: python3 tools/make-favicon.py
from PIL import Image

im = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
p = im.load()

def fill(x0, y0, x1, y1, colour):
    for y in range(y0, y1):
        for x in range(x0, x1):
            p[x, y] = colour

fill(1, 3, 15, 13, (58, 62, 70, 255))    # the shell
fill(3, 5, 13, 10, (216, 208, 176, 255))  # the label
fill(4, 6, 12, 7, (160, 48, 40, 255))    # its red stripe
fill(4, 7, 6, 9, (34, 37, 43, 255))      # the two reel windows
fill(9, 7, 11, 9, (34, 37, 43, 255))
im.resize((32, 32), Image.NEAREST).save('assets/textures/favicon.png')
