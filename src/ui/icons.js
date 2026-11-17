// Pixel icons for inventory items (approved still ui_inventory).
// 16×16 pixel icons as rows of palette letters ('.' = clear).
export const ICONS = {
  plate: { pal: { b: '#8a7444', d: '#3a2c14' }, rows: ['................', '................', '................', '................', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb', 'bbddbdbbddbdddbb', 'bbdbbdbbdbbbdbbb', 'bbddbdbbddbbdbbb', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb'] },
  key: { pal: { k: '#b8a060' }, rows: ['................', '................', '....kkk.........', '...k...k........', '...k...kkkkkkkkk', '...k...k....k.k.', '....kkk.....k.k.'] },
  horse: { pal: { h: '#8a5a30', d: '#4a2c14' }, rows: ['................', '............hh..', '...........hhh..', '..hhhhhhhhhhh...', '..hhhhhhhhhh....', '..h.h....h.h....', '..h.h....h.h....', '.dddddddddddd...'] },
  torch: { pal: { b: '#3a3a3e', h: '#8a8a84', l: '#ffe9a0' }, rows: ['................', '................', '................', '..........hhh...', '.bbbbbbbbbhhhhl.', '.bbbbbbbbbhhhhl.', '..........hhh...'] },
  battery: { pal: { g: '#7a8a6a', s: '#d0d0c0' }, rows: ['................', '................', '.gggggggggggggs.', '.gggggggggggggss', '.gggggggggggggss', '.gggggggggggggs.'] },
  pills: { pal: { w: '#e0e0d8', r: '#b03028' }, rows: ['................', '.....rrrrr......', '.....wwwww......', '....wwwwwww.....', '....wrrrrrw.....', '....wwwwwww.....', '....wwwwwww.....', '....wwwwwww.....'] },
  crank: { pal: { m: '#9a9a90', d: '#4a4a44' }, rows: ['................', '..........mm....', '..........mm....', '...........m....', '...........m....', '..mmmmmmmmmm....', '..m.............', '..m.............', '.ddd............'] },
  note: { pal: { p: '#d9cfb4', i: '#5a4c34' }, rows: ['................', '...pppppppppp...', '...piiiiiipp....', '...pppppppppp...', '...piiiiiiiip...', '...pppppppppp...', '...piiiiip.pp...', '...pppppppppp...'] },
  ball: { pal: { r: '#b03028', w: '#e0d8c8' }, rows: ['................', '.....rrrrr......', '....rrwwrrr.....', '...rrwwrrrrr....', '...rrrrrrrrr....', '...rrrrrrrrr....', '....rrrrrrr.....', '.....rrrrr......'] },
  doll: { pal: { f: '#e0c8a8', d: '#7a3a4a', h: '#5a3a1a' }, rows: ['......hhh.......', '.....hfffh......', '.....fffff......', '......fff.......', '....ddddddd.....', '...d.ddddd.d....', '.....ddddd......', '.....d...d......'] },
  top: { pal: { b: '#3a5a9a', y: '#c8a040', w: '#5a4a3a' }, rows: ['.......w........', '.......w........', '....bbbbbbb.....', '...yyyyyyyyy....', '....bbbbbbb.....', '.....bbbbb......', '.......b........', '.......b........'] },
  rope: { pal: { r: '#c8b890', h: '#b03028' }, rows: ['................', '....rrrrrrr.....', '...r.......r....', '..r.........r...', '..r.........r...', '.hh.........hh..', '.hh.........hh..', '.hh.........hh..'] },
  matches: { pal: { b: '#8a5a30', s: '#c8a040', w: '#e0d8c0', r: '#b03028' }, rows: ['................', '...........r....', '..........w.....', '.........w......', '...bbbbbbbb.....', '...bssssssb.....', '...bssssssb.....', '...bbbbbbbb.....'] },
  statue: { pal: { s: '#a8a8a0', d: '#6a6a64' }, rows: ['......ss........', '.....ssss.......', '.....sdds.......', '....ssssss......', '....sdssds......', '.....ssss.......', '....dddddd......'] },
  camcorder: { pal: { g: '#5a5e64', d: '#18181a', r: '#ff3020', l: '#9ab0c0' }, rows: ['................', '.......ggg......', '.......ggg......', '..ggggggggggdd..', '..ggggggggggdll.', '..ggrgggggggdll.', '..ggggggggggdd..', '..gggggggggg....'] },
  palm: { pal: { s: '#a8a49a', d: '#6e6a62' }, rows: ['................', '...s.s.s.s......', '...s.s.s.s......', '...sssssss..s...', '...ssssssssss...', '...sssssssss....', '....sssssss.....', '.....ddddd......'] },
  tape: { pal: { k: '#3a3e46', l: '#d8d0b0', r: '#a03028', d: '#18181a' }, rows: ['................', '................', '.kkkkkkkkkkkkkk.', '.kklllllllllkkk.', '.kklrrrrrrrllkk.', '.kklddlllddllkk.', '.kklddlllddllkk.', '.kkkkkkkkkkkkkk.'] },
  fuse: { pal: { w: '#d6d2c4', b: '#b8923a', d: '#8a867a' }, rows: ['................', '................', '....bbwwwwwwbb..', '....bbwwwwwwbb..', '....bbwddddwbb..', '....bbwwwwwwbb..', '....bbwwwwwwbb..'] },
  fuseLarge: { pal: { w: '#d6d2c4', b: '#b8923a', r: '#8a1c14' }, rows: ['................', '..bbwwwwwwwwwbb.', '..bbwwwwwwwwwbb.', '..bbrrrrrrrrrbb.', '..bbwwwwwwwwwbb.', '..bbwwwwwwwwwbb.', '..bbwwwwwwwwwbb.'] },
  boxCase: { pal: { t: '#8a8e88', d: '#4a4e4a', k: '#2a2c2a' }, rows: ['................', '................', '..tttttttttttt..', '..tddddddddddt..', '..tttttttttttt..', '..tkkkkkkkkkkt..', '..tkkkkkkkkkkt..', '..tttttttttttt..'] },
  musicBox: { pal: { t: '#8a8e88', d: '#4a4e4a', r: '#6a2c2a', b: '#c8a050', k: '#b8923a' }, rows: ['...tttttttttt...', '...trrrrrrrrt...', '...trrrrrrrrt...', '..tttttttttttt..', '..tbbbbbbbbbbt.k', '..ttttttttttttkk', '..tddddddddddt..', '..tttttttttttt..'] },
  cylinder: { pal: { b: '#b8923a', d: '#6a5a2a', p: '#ffe9a0' }, rows: ['................', '................', '...dbbbbbbbbd...', '...dbpbbpbbbd...', '...dbbbpbbpbd...', '...dbpbbbpbbd...', '...dbbbbbbbbd...'] },
  heart: { pal: { s: '#a8a49a', d: '#6a675f' }, rows: ['................', '....ss...ss.....', '...ssss.ssss....', '...sssssssss....', '....sssssssd....', '.....sssssd.....', '......sssd......', '.......sd.......'] },
  lamb: { pal: { s: '#a8a49a', d: '#6a675f', w: '#d6d2c6' }, rows: ['................', '..........ss....', '.........ssss...', '...ssssssssdss..', '..sssswsssss....', '..ssssssssss....', '...ssssssss.....', '...d.d..d.d.....'] },
};

export function drawIcon(ctx, name, x, y, scale = 1) {
  const { pal, rows } = ICONS[name];
  rows.forEach((row, ry) => [...row].forEach((c, rx) => {
    if (c === '.') return;
    ctx.fillStyle = pal[c];
    ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
  }));
}
