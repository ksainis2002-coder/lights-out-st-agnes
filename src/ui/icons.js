// Pixel icons for inventory items (approved still ui_inventory).
// 16×16 pixel icons as rows of palette letters ('.' = clear).
export const ICONS = {
  plate: { pal: { b: '#8a7444', d: '#3a2c14' }, rows: ['................', '................', '................', '................', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb', 'bbddbdbbddbdddbb', 'bbdbbdbbdbbbdbbb', 'bbddbdbbddbbdbbb', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb'] },
  key: { pal: { k: '#b8a060' }, rows: ['................', '................', '....kkk.........', '...k...k........', '...k...kkkkkkkkk', '...k...k....k.k.', '....kkk.....k.k.'] },
  horse: { pal: { h: '#8a5a30', d: '#4a2c14' }, rows: ['................', '............hh..', '...........hhh..', '..hhhhhhhhhhh...', '..hhhhhhhhhh....', '..h.h....h.h....', '..h.h....h.h....', '.dddddddddddd...'] },
  battery: { pal: { g: '#7a8a6a', s: '#d0d0c0' }, rows: ['................', '................', '.gggggggggggggs.', '.gggggggggggggss', '.gggggggggggggss', '.gggggggggggggs.'] },
  pills: { pal: { w: '#e0e0d8', r: '#b03028' }, rows: ['................', '.....rrrrr......', '.....wwwww......', '....wwwwwww.....', '....wrrrrrw.....', '....wwwwwww.....', '....wwwwwww.....', '....wwwwwww.....'] },
};

export function drawIcon(ctx, name, x, y, scale = 1) {
  const { pal, rows } = ICONS[name];
  rows.forEach((row, ry) => [...row].forEach((c, rx) => {
    if (c === '.') return;
    ctx.fillStyle = pal[c];
    ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
  }));
}


// Icons added for 0.2 items (same 16×16 palette-letter format).
Object.assign(ICONS, {
  crank: { pal: { m: '#9a9a90', d: '#4a4a44' }, rows: ['................', '..........mm....', '..........mm....', '...........m....', '...........m....', '..mmmmmmmmmm....', '..m.............', '..m.............', '.ddd............'] },
  note: { pal: { p: '#d9cfb4', i: '#5a4c34' }, rows: ['................', '...pppppppppp...', '...piiiiiipp....', '...pppppppppp...', '...piiiiiiiip...', '...pppppppppp...', '...piiiiip.pp...', '...pppppppppp...'] },
});
