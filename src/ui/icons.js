// Pixel icons for inventory items (approved still ui_inventory).
// 16×16 pixel icons as rows of palette letters ('.' = clear).
export const ICONS = {
  plate: { pal: { b: '#8a7444', d: '#3a2c14' }, rows: ['................', '................', '................', '................', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb', 'bbddbdbbddbdddbb', 'bbdbbdbbdbbbdbbb', 'bbddbdbbddbbdbbb', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb'] },
  key: { pal: { k: '#b8a060' }, rows: ['................', '................', '....kkk.........', '...k...k........', '...k...kkkkkkkkk', '...k...k....k.k.', '....kkk.....k.k.'] },
  horse: { pal: { h: '#8a5a30', d: '#4a2c14' }, rows: ['................', '............hh..', '...........hhh..', '..hhhhhhhhhhh...', '..hhhhhhhhhh....', '..h.h....h.h....', '..h.h....h.h....', '.dddddddddddd...'] },
  battery: { pal: { g: '#7a8a6a', s: '#d0d0c0' }, rows: ['................', '................', '.gggggggggggggs.', '.gggggggggggggss', '.gggggggggggggss', '.gggggggggggggs.'] },
  pills: { pal: { w: '#e0e0d8', r: '#b03028' }, rows: ['................', '.....rrrrr......', '.....wwwww......', '....wwwwwww.....', '....wrrrrrw.....', '....wwwwwww.....', '....wwwwwww.....', '....wwwwwww.....'] },
  crank: { pal: { m: '#9a9a90', d: '#4a4a44' }, rows: ['................', '..........mm....', '..........mm....', '...........m....', '...........m....', '..mmmmmmmmmm....', '..m.............', '..m.............', '.ddd............'] },
  note: { pal: { p: '#d9cfb4', i: '#5a4c34' }, rows: ['................', '...pppppppppp...', '...piiiiiipp....', '...pppppppppp...', '...piiiiiiiip...', '...pppppppppp...', '...piiiiip.pp...', '...pppppppppp...'] },
  ball: { pal: { r: '#b03028', w: '#e0d8c8' }, rows: ['................', '.....rrrrr......', '....rrwwrrr.....', '...rrwwrrrrr....', '...rrrrrrrrr....', '...rrrrrrrrr....', '....rrrrrrr.....', '.....rrrrr......'] },
  doll: { pal: { f: '#e0c8a8', d: '#7a3a4a', h: '#5a3a1a' }, rows: ['......hhh.......', '.....hfffh......', '.....fffff......', '......fff.......', '....ddddddd.....', '...d.ddddd.d....', '.....ddddd......', '.....d...d......'] },
  top: { pal: { b: '#3a5a9a', y: '#c8a040', w: '#5a4a3a' }, rows: ['.......w........', '.......w........', '....bbbbbbb.....', '...yyyyyyyyy....', '....bbbbbbb.....', '.....bbbbb......', '.......b........', '.......b........'] },
  statue: { pal: { s: '#a8a8a0', d: '#6a6a64' }, rows: ['......ss........', '.....ssss.......', '.....sdds.......', '....ssssss......', '....sdssds......', '.....ssss.......', '....dddddd......'] },
};

export function drawIcon(ctx, name, x, y, scale = 1) {
  const { pal, rows } = ICONS[name];
  rows.forEach((row, ry) => [...row].forEach((c, rx) => {
    if (c === '.') return;
    ctx.fillStyle = pal[c];
    ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
  }));
}
