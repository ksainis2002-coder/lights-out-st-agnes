"""Writes src/levels/grounds.json and src/levels/school_ground.json (0.3 part A)
and adds the garden door to the orphanage landing. Furniture is placed in
room-local cell coordinates: (0, 0) is a room's north-west corner; walls are
the lines x = 0, x = w, z = 0, z = d.

The JSON files are the game's data; this script is how they were laid out.
Change the layout here and run it again (python3 tools/levels/school_part_a.py),
or edit the JSON by hand and stop using the script for that level: a rerun
overwrites hand edits."""
import json, math, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
MOON = '#5a6c9c'
WARM = '#ffd9a0'


def r3(v):
    return round(v, 3)


class Room:
    def __init__(self, rid, c0, r0, c1, r1, **extra):
        self.id, self.c0, self.r0, self.c1, self.r1 = rid, c0, r0, c1, r1
        self.w, self.d = c1 - c0 + 1, r1 - r0 + 1
        self.extra = extra

    def at(self, x, z):
        return [r3(self.c0 + x), r3(self.r0 + z)]

    def data(self):
        return {"id": self.id, "cells": [self.c0, self.r0, self.c1, self.r1], **self.extra}


class Level:
    def __init__(self):
        self.props, self.lights, self.pickups, self.documents, self.ghosts = [], [], [], [], []

    def prop(self, room, type_, x, z, rotation=0, y=None, extra=None, **options):
        p = {"type": type_, "at": room.at(x, z) if room else [r3(x), r3(z)]}
        if rotation:
            p["rotation"] = r3(rotation)
        if y is not None:
            p["y"] = y
        if options:
            p["options"] = options
        if extra:
            p.update(extra)
        self.props.append(p)
        return p

    def light(self, room, x, z, height, intensity, distance, color=MOON):
        self.lights.append({"type": "point", "at": room.at(x, z) if room else [x, z], "height": height,
                            "color": color, "intensity": intensity, "distance": distance})

    def pickup(self, room, pid, item, x, z, rotation=0, y=0.0, **extra):
        pickup = {"id": pid, "item": item, "at": room.at(x, z), "y": y, **extra}
        if rotation:
            pickup["rotation"] = rotation
        self.pickups.append(pickup)

    def maggie(self, gid, kind, at, facing_to=None, rotation=0, **extra):
        """Maggie (the ghost girl with the skipping rope): a rhyme sung or a line whispered."""
        event = {"id": gid, "kind": kind, "model": "ghostGirl", "speaker": "maggie", "comfort": "keep",
                 "at": [r3(at[0]), r3(at[1])], "rotation": r3(facing(at, facing_to)) if facing_to else rotation, **extra}
        if kind == 'sing':
            event.setdefault("vanishAt", 2.2)
        self.ghosts.append(event)

    def document(self, room, did, x, z, y, rotation=0, **extra):
        doc = {"id": did, "at": room.at(x, z), "y": y, **extra}
        if rotation:
            doc["rotation"] = rotation
        self.documents.append(doc)


def facing(frm, to):
    return math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1]))


def local_cells(at, rotation, lx, lz, cell):
    """A point given in a prop's own metres (x right, z out of its front), in level cells."""
    t = math.radians(rotation)
    return [r3(at[0] + (lx * math.cos(t) + lz * math.sin(t)) / cell), r3(at[1] + (-lx * math.sin(t) + lz * math.cos(t)) / cell)]


# ---------------------------------------------------------------- grounds
def grounds():
    L = Level()
    rows = []
    for r in range(25):
        row = []
        for c in range(22):
            if r <= 8:
                ch = '.' if 4 <= c <= 17 and r >= 1 else 'w'
            elif r == 9:
                ch = 'f' if 4 <= c <= 17 else 'w'
            elif r <= 20:
                ch = '.' if 1 <= c <= 20 else ('B' if c == 21 or r <= 15 else 'S')
            elif r == 21:
                ch = 'S' if c <= 12 else ('f' if c <= 20 else 'B')
            elif r <= 23:
                ch = '.' if 13 <= c <= 20 else ('S' if c <= 12 else 'B')
            else:
                ch = 'h'
            row.append(ch)
        rows.append(row)
    rows[9][10] = '.'   # the cemetery gate (a door)
    rows[21][16] = '.'  # the front gate (a door)
    grid = [''.join(r) for r in rows]

    cemetery = Room('cemetery', 4, 1, 17, 8, floor='grass')
    court = Room('courtyard', 1, 10, 20, 20, floor='gravel')
    road = Room('road', 13, 22, 20, 23, floor='gravel')
    whole = Room('whole', 0, 0, 21, 24)  # for absolute placement

    # Facades: the orphanage (west, the garden door back in), the asylum's west
    # wing (west, chained), the school (east), the chapel (south, keyhole).
    L.prop(whole, 'facadeDoor', 1, 12.5, 90, extra={"use": "travel", "to": {"level": "orphanage_wing", "spawn": "garden_door"},
                                                   "prompt": "prompt.goInside", "useHeight": 1.2, "useRadius": 0.8})
    L.prop(whole, 'facadeDoor', 1, 18.5, 90, extra={"use": "message", "message": "msg.westWingChained", "useHeight": 1.2, "useRadius": 0.8})
    L.prop(whole, 'facadeDoor', 21, 15.5, -90, extra={"use": "travel", "to": {"level": "school_ground", "spawn": "front_door"},
                                                     "prompt": "prompt.toSchool", "useHeight": 1.2, "useRadius": 0.8})
    L.prop(whole, 'facadeDoor', 6.5, 21, 180, extra={"use": "message", "message": "msg.chapelKeyhole", "prompt": "prompt.keyhole",
                                                    "useHeight": 1.2, "useRadius": 0.8})
    for z, lit in [(11.0, True), (14.2, False)]:
        L.prop(whole, 'litWindow', 1, z, 90, lit=lit)
        L.prop(whole, 'litWindow', 1, z, 90, y=3.4, lit=not lit)
    L.prop(whole, 'litWindow', 1, 16.8, 90, y=3.4, lit=False)
    L.prop(whole, 'litWindow', 1, 20.0, 90, y=3.4, lit=False)
    for z, lit in [(11.2, False), (13.4, True), (17.6, False), (19.6, False)]:
        L.prop(whole, 'litWindow', 21, z, -90, lit=lit)
        L.prop(whole, 'litWindow', 21, z, -90, y=3.4, lit=(z == 17.6))
    for x in (3.0, 10.0):
        L.prop(whole, 'litWindow', x, 21, 180, y=1.4, lit=False)

    # Railings with their gates; pillars either side of each gate.
    for x in (5, 7, 9, 12, 14, 16):
        L.prop(whole, 'ironFence', x, 9.5, length=3)
    for x in (14, 19):
        L.prop(whole, 'ironFence', x, 21.5, length=3)
    L.prop(whole, 'ironFence', 20.0, 21.5, length=1.5)
    for x in (10, 11):
        L.prop(whole, 'gatePillar', x, 9.5)
    for x in (16, 17):
        L.prop(whole, 'gatePillar', x, 21.5)

    # The cemetery: the five children's graves in a row, older stones round them.
    names = [("MARGARET ROWE", 8, False, 0.05), ("THOMAS HALE", 9, True, -0.04), ("EDITH CARR", 7, False, 0.1),
             ("SAMUEL PIKE", 10, False, 0.02), ("AGNES", None, False, 0.16)]
    for i, (name, age, worn, lean) in enumerate(names):
        x = 8.3 + i * 0.95
        z = 6.1 + abs(i - 2) * -0.25 + 0.5
        opts = {"name": name, "lean": lean}
        if age:
            opts["age"] = age
        if worn:
            opts["worn"] = True
        L.prop(whole, 'gravestone', x, z, 168 + i * 6, extra={"id": f"grave_{name.split()[0].lower()}"}, **opts)
    for (x, z, rot, lean) in [(5.4, 3.0, -10, 0.1), (15.8, 2.4, -3, 0.15), (16.2, 6.4, 4, 0.2), (5.2, 6.6, 11, 0.1),
                              (8.0, 2.0, 18, 0.15), (12.8, 2.6, 25, 0.2), (13.6, 5.4, 32, 0.1), (6.6, 4.8, 39, 0.15)]:
        L.prop(whole, 'gravestone', x, z, rot, lean=lean)
    L.prop(whole, 'deadTree', 14.8, 4.2, height=5.5)
    for x, rot, h in [(6.5, 70, 7), (11.5, 170, 8), (17.5, 290, 6.5), (2.0, 20, 7.5)]:
        L.prop(whole, 'deadTree', x, -0.6, rot, height=h)
    L.prop(whole, 'rain', 11, 12, width=34, depth=38, height=9, count=1400)

    L.light(whole, 1.6, 12.5, 2.9, 7, 12, '#d8a050')   # lamp over the garden door
    L.light(whole, 20.4, 15.5, 2.9, 7, 12, '#d8a050')  # over the school door
    L.light(whole, 6.5, 20.4, 2.9, 4, 9, '#d8a050')  # over the chapel door
    L.light(whole, 10.5, 10.2, 3.5, 3, 10)  # moonlight on the cemetery gate

    L.maggie('maggie_courtyard', 'appear', (10.5, 7.6), rotation=0, cells=[7, 11, 14, 13],
             requires={"flag": "name_maggie"}, line="maggie.courtyard", leadTo=[10.5, 5.5])

    doors = [
        {"id": "cemetery_gate", "cell": [10, 9], "look": "gate", "locked": "gate_key"},
        {"id": "front_gate", "cell": [16, 21], "look": "gate", "requires": "front_gate_open", "lockedMessage": "msg.frontGateChained"},
    ]
    return {
        "id": "grounds", "wing": "school", "cellSize": 1.5, "wallHeight": 9, "wallRepeat": 6,
        "wallHeights": {"wallStone": 2.2, "iron": 0.06, "hedge": 3.0},
        # The buildings behind the facades, out of reach (levels/buildings.js):
        # side walls with windows, slate roofs and chimneys, so they have depth.
        "buildings": [
            {"id": "orphanage", "cells": [-9, 10, 0, 15], "wall": "brick", "ridge": "z", "rise": 5,
             "chimneys": [[-4, 11.5], [-4, 14.5]], "windows": [{"side": "north", "along": [2.5, 5.5, 9.5, 12.5]}]},
            {"id": "asylum", "cells": [-9, 16, 0, 20], "wall": "stone", "ridge": "z", "rise": 5.5, "chimneys": [[-4, 18.5]]},
            {"id": "chapel", "cells": [0, 21, 12, 29], "wall": "stone", "ridge": "x", "rise": 6,
             "windows": [{"side": "east", "along": [3.0, 6.5], "storeys": [3.0], "size": [1.2, 3.2]}]},
            {"id": "school", "cells": [21, 10, 30, 23], "wall": "brick", "ridge": "z", "rise": 5,
             "chimneys": [[26, 12], [26, 16.5], [26, 21]], "windows": [{"side": "north", "along": [2.5, 5.5, 9.5, 12.5]}]},
        ],
        "floorTexture": "gravel", "ceilingTexture": "none",
        "ambient": {"color": "#7080a0", "intensity": 1.5},
        "fog": {"color": "#1c232e", "density": 0.045}, "moon": {"color": "#8090b8", "intensity": 0.9},
        "legend": {".": "floor", "B": "brick", "S": "stone", "w": "wallStone", "f": "iron", "h": "hedge"},
        "map": grid,
        "spawns": {"default": {"cell": [1, 12], "yawDegrees": -90}, "garden_door": {"cell": [1, 12], "yawDegrees": -90},
                   "school_door": {"cell": [20, 15], "yawDegrees": 90}},
        "rooms": [cemetery.data(), court.data(), road.data()],
        "doors": doors, "triggers": [], "props": L.props, "lights": L.lights,
        "ambience": [{"name": "amb_rain_outside", "volume": 1.0}, {"name": "amb_wind_outside", "volume": 0.75}],
        # The grounds come on the hall plan (the school's map entry "with"); this
        # entry only says how their page is drawn: the key, right of the plan.
        "pickups": [], "documents": [], "maps": [{"id": "grounds", "key": [22.6, 0.3]}], "ghosts": L.ghosts,
        "weather": {"storm": "puzzle_records"},  # lightning once the records drawer is open (levels/storm.js)
        # St. Agnes on the path, facing the school; gone once you have been inside.
        "watcher": {"still": {"at": [12.5, 15.0], "rotation": 90, "until": "visited_entrance_hall"}},
    }


# ---------------------------------------------------------------- school, ground floor
def school():
    L = Level()
    W, H = 47, 20
    cells = [['#'] * W for _ in range(H)]
    rooms = {
        'library': Room('library', 1, 1, 11, 8, floor='parquet'),
        'gym': Room('gym', 13, 1, 24, 8, floor='wood', height=5.2),
        'back_stairs': Room('back_stairs', 26, 5, 27, 9, floor='wood'),
        'music_room': Room('music_room', 29, 3, 35, 8, floor='parquet'),
        'nurse_room': Room('nurse_room', 37, 4, 42, 8, floor='floor', wall='tile'),
        'corridor': Room('main_corridor', 1, 10, 45, 11, floor='floor'),
        'art_room': Room('art_room', 1, 13, 7, 18, floor='wood'),
        'class_1': Room('class_1', 9, 13, 16, 18, floor='parquet'),
        'class_2': Room('class_2', 18, 13, 25, 18, floor='parquet'),
        'entrance_hall': Room('entrance_hall', 27, 12, 33, 18, floor='hallTile', height=6.0),
        'cloakroom': Room('cloakroom', 35, 13, 38, 18, floor='floor'),
        'staff_room': Room('staff_room', 40, 13, 45, 18, floor='wood'),
    }
    for room in rooms.values():
        for r in range(room.r0, room.r1 + 1):
            for c in range(room.c0, room.c1 + 1):
                cells[r][c] = '.'
    # The hall opens onto the corridor through three arches; its north row of
    # cells (row 12) is the arch row, inside the hall's tall room.
    for c in (27, 28, 32, 33):
        cells[12][c] = '#'
    grid = [''.join(r) for r in cells]

    door_cells = {'library': [6, 9], 'gym': [18, 9], 'music_room': [32, 9], 'nurse_room': [39, 9],
                  'art_room': [4, 12], 'class_1': [12, 12], 'class_2': [21, 12], 'cloakroom': [36, 12], 'staff_room': [42, 12]}
    doors = [{"id": f"school_{rid}", "cell": cell} for rid, cell in door_cells.items()]

    lib, gym, bst, mus, nur = (rooms[k] for k in ('library', 'gym', 'back_stairs', 'music_room', 'nurse_room'))
    cor, art, c1, c2, hall, clk, stf = (rooms[k] for k in ('corridor', 'art_room', 'class_1', 'class_2', 'entrance_hall', 'cloakroom', 'staff_room'))

    # Library: ten numbered bookcases in pairs, the card index by the door,
    # reading tables, the librarian's desk with its lamp (the watcher wakes here).
    marks = ['000–099', '100–199', '200–299', '300–399', '400–499', '500–599', '600–699', '700–799', '800–899', '900–999']
    lines = [(1.16, 90), (3.7, -90), (4.02, 90), (7.0, -90), (7.32, 90)]
    k = 0
    for x, rot in lines:
        for z in (1.9, 3.57):
            extra = {"id": "shelf_700"} if marks[k] == '700–799' else None
            L.prop(lib, 'bookshelf', x, z, rot, extra=extra, mark=marks[k], seed=k + 1)
            k += 1
    for z in (1.9, 3.57):
        L.prop(lib, 'bookshelf', 10.82, z, -90, seed=20 + int(z))
    L.prop(lib, 'indexCabinet', 3.0, 7.79, 180, extra={"id": "card_index"})
    L.prop(lib, 'longTable', 8.2, 6.0)
    for x, z, rot in [(7.2, 5.45, 0), (9.0, 5.45, 0), (7.8, 6.55, 180), (9.4, 6.55, 180)]:
        L.prop(lib, 'chair', x, z, rot)
    L.prop(lib, 'table', 1.0, 6.3, 90)
    L.prop(lib, 'chair', 1.7, 6.3, -90)
    L.prop(lib, 'deskLamp', 0.95, 6.0, 90, y=0.76, extra={"id": "library_lamp"}, lit=True)
    L.prop(lib, 'papers', 1.0, 6.6, y=0.76, count=3)
    for x in (2.5, 5.5, 8.5):
        L.prop(lib, 'windowFrame', x, 0)
    L.prop(lib, 'radiator', 5.5, 0)
    L.pickup(lib, 'library_battery', 'battery', 1.05, 6.75, y=0.76)
    L.light(lib, 1.2, 6.2, 1.1, 1.6, 4.5, WARM)
    L.light(lib, 5.5, 0.6, 2.4, 2.4, 8)

    # Gym: wall bars, ropes, the vaulting horse, the hopscotch by the door.
    for x in (2, 4.5, 7, 9.5, 11):
        L.prop(gym, 'windowFrame', x, 0, y=2.3)
    for z in (1.6, 2.3, 3.0, 3.7, 4.4):
        L.prop(gym, 'wallBars', 0, z, 90)
    for i, x in enumerate((5.0, 5.7, 6.4, 7.1)):
        L.prop(gym, 'climbingRope', x, 3.0, top=5.2, length=4.3 if i % 2 == 0 else 4.55)
    L.prop(gym, 'vaultingHorse', 9.5, 4.0, 20)
    L.prop(gym, 'bench', 11.8, 4.0, 90, length=3.0)
    L.prop(gym, 'rug', 2.0, 3.0, width=1.8, depth=1.0)
    L.prop(gym, 'hopscotch', 4.2, 6.0, extra={"id": "hopscotch"})
    L.prop(gym, 'noticeBoard', 3.2, 8, 180)
    L.document(gym, 'fire_drill_log', 3.05, 8 - 0.035 / 1.2, 1.5, 180, upright=True)
    L.pickup(gym, 'gym_rope', 'skipping_rope', 4.2, 5.2, 20, model='skippingRope', appearsWith='puzzle_hopscotch')
    L.light(gym, 4.0, 0.8, 4.0, 5, 13)
    L.light(gym, 9.5, 0.8, 4.0, 5, 13)

    # Back stairs: a flight up to the first floor.
    L.prop(bst, 'stairs', 1.0, 4.0, steps=12, landing=1.4, extra={"use": "travel", "to": {"level": "school_upper", "spawn": "back_stairs"},
                                                                 "prompt": "prompt.stairsUp", "useHeight": 1.0, "useRadius": 0.8})

    # Music room: the piano with Maggie's stickers, chairs round it.
    L.prop(mus, 'piano', 1.5, 0, extra={"id": "piano"}, stickers=True)
    L.prop(mus, 'pianoStool', 1.5, 0.82)
    L.pickup(mus, 'piano_key', 'headmaster_key', 2.05, 0.95, 25, model='brassKey', appearsWith='puzzle_piano')
    L.prop(mus, 'crucifix', 1.5, 0, height=2.4)
    L.prop(mus, 'staveChart', 4.0, 0)
    L.prop(mus, 'windowFrame', 6.0, 0)
    L.prop(mus, 'radiator', 6.0, 0)
    L.prop(mus, 'percussion', 0.19, 4.9, 90)
    centre = (1.5, 0.9)
    for angle in (35, 62, 89, 116):
        a = math.radians(angle)
        at = (centre[0] + 2.4 * math.cos(a), centre[1] + 2.4 * math.sin(a))
        L.prop(mus, 'chair', *at, facing(at, centre))
    s = (centre[0] + 1.75 * math.cos(math.radians(116)), centre[1] + 1.75 * math.sin(math.radians(116)))
    L.prop(mus, 'musicStand', *s, facing(s, (centre[0] + 2.4 * math.cos(math.radians(116)), centre[1] + 2.4 * math.sin(math.radians(116)))))
    L.light(mus, 6.0, 0.6, 2.2, 2.6, 7)

    # Nurse's room: eye chart, scales, couch, the notice about the doctor.
    L.prop(nur, 'eyeChart', 2.6, 0)
    L.prop(nur, 'notice', 3.75, 0, extra={"id": "nurse_notice", "use": "look"})
    L.prop(nur, 'sink', 5.0, 0)
    L.prop(nur, 'scales', 1.0, 0.3)
    L.prop(nur, 'examCouch', 0.27, 2.6, 90)
    L.prop(nur, 'foldingScreen', 1.2, 4.1)
    L.prop(nur, 'cabinet', 5.85, 1.5, -90)
    L.pickup(nur, 'nurse_pills', 'pills', 5.85, 1.62, y=0.97, color='#e0e0d8')
    L.prop(nur, 'table', 5.4, 3.6, 90)
    L.prop(nur, 'chair', 4.75, 3.6, 90)
    L.prop(nur, 'deskLamp', 5.45, 3.4, -90, y=0.76, lit=False)
    L.prop(nur, 'paperSheet', 5.35, 3.9, 100, y=0.765)
    L.prop(nur, 'windowFrame', 6, 3.6, -90)
    L.light(nur, 5.4, 3.6, 2.2, 2.0, 6)

    # Corridor: runners, radiators between the doors, benches, a clock.
    for x in (6, 17, 28, 39):
        L.prop(cor, 'runner', x, 1.0, 90, length=10.5, width=1.0)
    for x in (2.5, 10.5, 21.5, 34.0, 41.5):
        L.prop(cor, 'radiator', x, 0)
    for x in (7.5, 16.0, 25.5, 38.0):
        L.prop(cor, 'bench', x, 1.85, 180, length=1.8)
    L.prop(cor, 'wallClock', 13.0, 0)
    L.prop(cor, 'saintPicture', 27.5, 0)
    L.prop(cor, 'noticeBoard', 23.0, 0)
    L.prop(cor, 'windowFrame', 0, 1.0, 90)
    L.prop(cor, 'windowFrame', 45, 1.0, -90)
    for x in (1.0, 23.0, 44.0):
        L.light(cor, x, 1.0, 2.2, 1.6, 7)
    # Maggie's chalk (approved stills chalk_hint, chalk_taunt): four small
    # boards along the corridor, wiped clean until she writes on one.
    for bid, x, z, rotation in [('chalk_west', 11.0, 0.017, 0), ('chalk_middle', 15.0, 1.983, 180),
                                ('chalk_hall', 29.0, 0.017, 0), ('chalk_east', 38.0, 1.983, 180)]:
        L.prop(cor, 'chalkBoardFrame', x, z, rotation)
        L.prop(cor, 'chalkBoard', x, z, rotation, extra={"id": bid})

    # Art room: the class painting, easels, the painting table, a drying line.
    L.prop(art, 'classPainting', 3.5, 6, 180, extra={"id": "class_painting", "use": "view", "view": "painting",
                                                     "prompt": "prompt.lookPainting", "useHeight": 1.45, "useRadius": 0.7},
           captionKey='art.paintingCaption')
    for x in (1.3, 5.7):
        L.prop(art, 'windowFrame', x, 6, 180)
    L.prop(art, 'easel', 2.4, 3.2, 200, painting='house')
    L.prop(art, 'easel', 5.4, 2.6, 160, painting='lady')
    L.prop(art, 'easel', 4.2, 4.4, 185, painting='flowers')
    L.prop(art, 'longTable', 0.75, 3.4, 90)
    L.prop(art, 'paintPots', 0.75, 2.8, 90, y=0.77)
    L.prop(art, 'paintPots', 0.75, 4.0, 80, y=0.77)
    for z in (2.6, 3.5, 4.4):
        L.prop(art, 'chair', 1.45, z, -90)
    L.prop(art, 'paintingLine', 3.5, 1.4, length=6.0, height=2.5, paintings=["house", "flowers", "house", "lady", "flowers"])
    L.prop(art, 'sink', 7, 4.6, -90)
    L.prop(art, 'drawing', 7, 1.5, -90, kind='sun')
    L.prop(art, 'drawing', 7, 2.8, -90, kind='children')
    L.prop(art, 'drawing', 1.5, 0, kind='house')
    L.light(art, 3.5, 5.4, 2.4, 2.2, 7)

    # Classrooms: the board on the west wall, desks in rows facing it, three
    # windows on the south wall. Class 2 has exactly five lids left up.
    # turned: Maggie's trick (approved still class1_turned): once the flag is
    # set, every desk faces this point, the door (ghosts/tricks.js).
    def classroom(room, board_keys, lids_up=(), maggie=None, board=None, turned=None):
        L.prop(room, 'blackboard', 0, 3.0, 90, extra=board, lineKeys=board_keys)
        L.prop(room, 'table', 1.3, 1.6, 90)
        L.prop(room, 'chair', 0.8, 1.6, 90)
        n = 0
        for x in (3.2, 4.8, 6.4):
            for z in (1.2, 2.4, 3.6, 4.8):
                opts = {"lidOpen": True} if n in lids_up else {}
                rotation = 90 + (n * 7 % 5 - 2)
                at = room.at(x, z)
                extra = {}
                if turned:
                    flag, door = turned
                    to_door = round(math.degrees(math.atan2(at[0] - door[0], at[1] - door[1])))
                    extra["moved"] = {"flag": flag, "rotation": to_door}
                if n == maggie:  # her name is carved under the lid, her library ticket inside
                    extra.update({"id": "maggie_desk", "use": "lid", "message": "msg.maggieDesk", "flags": ["name_maggie"]})
                    ticket = {"id": "library_ticket", "at": local_cells(at, rotation, 0.08, -0.08, 1.2),
                              "y": 0.722, "rotation": rotation + 180, "appearsWith": "opened_maggie_desk"}
                    if turned:  # it turns with her desk
                        ticket["moved"] = {"flag": flag, "at": local_cells(at, to_door, 0.08, -0.08, 1.2),
                                           "rotation": to_door + 180}
                    L.documents.append(ticket)
                L.prop(room, 'schoolDesk', x, z, rotation, extra=extra or None, **opts)
                n += 1
        for x in (2.0, 4.5, 7.0):
            L.prop(room, 'windowFrame', x, 6, 180)
        L.prop(room, 'radiator', 4.5, 6, 180)
        L.light(room, 4.5, 5.4, 2.2, 2.4, 8)

    classroom(c1, ["chalk.class1.talk", "chalk.class1.talk", "chalk.class1.talk", "chalk.class1.tell", "chalk.class1.tellTwice"], maggie=5,
              turned=("class1_turned", (12.5, 12.4)))
    L.prop(c1, 'wallClock', 8, 3.0, -90, height=1.9)
    L.document(c1, 'detention_book', 1.25, 1.85, 0.76, 75, model='ledger', height=0.05)
    classroom(c2, ["chalk.class2.title", "chalk.class2.count", "chalk.class2.q1", "chalk.class2.q2", "chalk.class2.q3",
                   "chalk.class2.talkers"], lids_up=(1, 3, 6, 8, 11),
              board={"id": "counting_board", "use": "view", "view": "board", "prompt": "prompt.readBoard",
                     "useHeight": 1.45, "useRadius": 0.9})

    # Entrance hall (6 m tall): the main stairs up into the dark, the front
    # doors, the notice board with the school plan to take.
    hz = 1  # the hall's room starts one row early (the arch row)
    L.prop(hall, 'stairs', 0.67, hz + 5.33, landing=2.47,
           extra={"use": "travel", "to": {"level": "school_upper", "spawn": "main_stairs"}, "prompt": "prompt.stairsUp",
                  "useHeight": 1.0, "useRadius": 0.8})
    L.prop(hall, 'doorway', 0.67, hz, y=2.8, width=1.1, height=2.2)
    L.prop(hall, 'frontDoors', 3.5, hz + 6, 180, extra={"use": "travel", "to": {"level": "grounds", "spawn": "school_door"},
                                                         "prompt": "prompt.toCourtyard", "useHeight": 1.2, "useRadius": 0.9})
    L.prop(hall, 'mapBoard', 5.8, hz + 6, 180, plan=False)
    L.prop(hall, 'umbrellaStand', 2.3, hz + 5.6)
    L.prop(hall, 'bench', 6.8, hz + 3.0, -90, length=2.2)
    L.prop(hall, 'portrait', 7, hz + 1.6, -90, y=0.4)
    L.prop(hall, 'radiator', 7, hz + 4.8, -90)
    L.prop(hall, 'wallClock', 3.5, hz + 0, height=3.9)
    L.prop(hall, 'runner', 3.5, hz + 3.1, length=6.0, width=1.0)
    L.light(hall, 3.5, hz + 5.4, 3.0, 3.0, 9)
    L.light(hall, 1.6, hz + 2.0, 4.5, 1.6, 7)

    # Cloakroom: coat rails both sides, one coat with a red ribbon bow.
    L.prop(clk, 'cloakPegs', 0, 3.3, 90, count=8, empty=[3], satchels=[1, 6])
    pegs_at = clk.at(4, 3.3)
    ribbon_coat = local_cells(pegs_at, -90, (2 - 3.5) * 0.34, 0.15, 1.2)  # peg 2 of 8, 0.34 m apart
    L.prop(clk, 'cloakPegs', 4, 3.3, -90, extra={"id": "cloak_pegs_east", "use": "search", "gives": "matches",
                                                  "document": "maggie_note", "useAt": ribbon_coat, "useHeight": 1.2},
           count=8, ribbon=2, empty=[6], satchels=[4])
    L.prop(clk, 'bootRack', 0.27, 3.3, 90, length=2.6, pairs=6)
    L.prop(clk, 'bootRack', 3.73, 3.3, -90, length=2.6, pairs=5)
    L.prop(clk, 'bench', 0.62, 3.3, 90, length=2.6)
    L.prop(clk, 'bench', 3.38, 3.3, -90, length=2.6)
    L.prop(clk, 'shoes', 1.7, 5.0, 20)
    L.prop(clk, 'lostProperty', 3.4, 5.55, 10)
    L.prop(clk, 'windowFrame', 2, 6, 180, y=0.5)
    L.prop(clk, 'hangingBulb', 2.0, 3.0, ceiling=3.4)
    L.light(clk, 2.0, 1.0, 2.4, 1.8, 6)

    # Staff room: the tape recorder by a warm lamp, the long table, armchairs.
    L.prop(stf, 'table', 5.4, 1.4, 90)
    L.prop(stf, 'tapeRecorder', 5.4, 1.3, -90, y=0.76, extra={"use": "save", "id": "recorder_staff", "mapAt": [r3(stf.c0 + 4.9), r3(stf.r0 + 1.4)]})
    L.prop(stf, 'deskLamp', 5.45, 1.85, -90, y=0.76, lit=True)
    L.prop(stf, 'longTable', 2.6, 3.4)
    for x, z, rot in [(1.6, 2.85, 0), (2.6, 2.85, 0), (3.6, 2.85, 0), (2.0, 3.95, 180), (3.2, 3.95, 180)]:
        L.prop(stf, 'chair', x, z, rot)
    cabinet_at = stf.at(0.26, 1.5)
    L.prop(stf, 'recordsCabinet', 0.26, 1.5, 90, extra={"id": "staff_cabinet", "use": "note", "message": "msg.staffDrawerEmpty",
                                                       "flags": ["matches_missing"], "prompt": "prompt.open",
                                                       "useAt": local_cells(cabinet_at, 90, 0, 0.32, 1.2), "useHeight": 0.9,
                                                       "useRadius": 0.35}, lock=False)
    for x in (1.5, 4.5):
        L.prop(stf, 'windowFrame', x, 6, 180)
    L.prop(stf, 'radiator', 3.0, 6, 180)
    L.prop(stf, 'noticeBoard', 4.0, 0)
    L.prop(stf, 'typewriter', 2.0, 3.4, y=0.77)
    L.document(stf, 'unsent_letter', 2.75, 3.55, 0.77, 15)
    L.pickup(stf, 'staff_battery', 'battery', 3.4, 3.35, y=0.77)
    L.light(stf, 5.2, 1.6, 1.2, 2.2, 6, WARM)
    L.light(stf, 3.0, 5.4, 2.2, 1.6, 6)

    # Maggie: her first rhyme by her desk, the hopscotch rhyme in the gym, the
    # matches rhyme once the staff-room drawer is found empty; two lines.
    rhyme = lambda name: [f"rhyme.{name}.{i}" for i in range(1, 5)]
    L.maggie('maggie_class1', 'sing', c1.at(5.5, 2.6), facing_to=(12.5, 12.3), room='class_1', song=rhyme('class1'))
    L.maggie('maggie_gym', 'sing', gym.at(4.2, 3.3), facing_to=(18.5, 9.5), room='gym', song=rhyme('gym'),
             sets=['heard_rhyme_gym'])
    L.maggie('maggie_staff', 'sing', cor.at(39.0, 0.5), rotation=-90, cells=[40, 13, 45, 18], song=rhyme('staff'),
             requires={"flag": "matches_missing"}, unless='searched_cloak_pegs_east', leadTo=[36.5, 11.6])
    L.maggie('maggie_music', 'appear', mus.at(2.9, 1.1), facing_to=(32.5, 9.5), room='music_room', line='maggie.music')
    L.maggie('maggie_corridor', 'appear', cor.at(29.5, 0.6), rotation=-90, cells=[17, 10, 25, 11],
             requires={"flag": "name_maggie"}, line='maggie.corridor', leadTo=[33.5, 10.6])

    # The rain everywhere; the classrooms' own room tone, elsewhere the
    # building's hum; the wind in the corridor and the hall.
    rain = {"name": "amb_rain_inside", "volume": 0.35}
    hum = {"name": "amb_building_hum", "volume": 0.25}
    classroom = {"name": "amb_classroom", "volume": 0.15}
    wind = {"name": "amb_wind_corridor", "volume": 0.25}
    out_rooms = []
    for room in rooms.values():
        data = room.data()
        data["ambience"] = [rain, classroom if room.id.startswith('class_') else hum]
        if room.id in ('main_corridor', 'entrance_hall'):
            data["ambience"].append(wind)
        out_rooms.append(data)

    maps = [{"id": "school_ground", "at": hall.at(5.8, hz + 6 - 0.06), "y": 1.5, "rotation": 180, "upright": True,
             "with": ["grounds"], "key": [12.6, 0.15], "detail": "map.detail.school_ground"},
            # The first-floor plan, pinned on the staff-room notice board (school_upper draws it).
            {"id": "school_upper", "at": stf.at(4.0, 0.04), "y": 1.5, "upright": True, "detail": "map.detail.school_upper"}]
    return {
        "id": "school_ground", "wing": "school", "cellSize": 1.2, "wallHeight": 3.4,
        "floorTexture": "floor", "ceilingTexture": "ceiling",
        "ambient": {"color": "#8a98c8", "intensity": 0.9},
        "legend": {".": "floor", "#": "schoolWall"},
        "map": grid,
        # Coming down: at the foot of each stairs (a spawn's cell is the corner of the cell it stands in the middle of).
        "spawns": {"default": {"cell": [30, 16], "yawDegrees": 0}, "front_door": {"cell": [30, 16], "yawDegrees": 0},
                   "main_stairs": {"cell": [28.2, 18.1], "yawDegrees": -45}, "back_stairs": {"cell": [26.5, 9.1], "yawDegrees": 180}},
        "rooms": out_rooms, "doors": doors, "triggers": [], "props": L.props, "lights": L.lights,
        "ambience": [{"name": "amb_rain_inside", "volume": 0.3}],
        "pickups": L.pickups, "documents": L.documents, "maps": maps,
        "weather": {"storm": "puzzle_records"},  # lightning once the records drawer is open (levels/storm.js)
        "puzzles": {
            "libraryIndex": {"prop": "card_index", "shelf": "shelf_700", "ticket": "library_ticket", "drawer": 18,
                             "book": 784, "song": "my_song"},
            "piano": {"prop": "piano", "clue": "my_song", "tune": [5, 5, 3, 6, 5, 3]},
            "hopscotch": {"prop": "hopscotch", "clue": "heard_rhyme_gym", "order": [2, 7, 5, 9, 1],
                          "rhyme": rhyme('gym'), "speaker": "maggie"},
        },
        "ghosts": L.ghosts,
        # The watcher: asleep at the end of a library aisle (approved still) until
        # the library puzzle is done; then she hunts the corridor, library, gym,
        # hall and back stairs. The other rooms are safe.
        "watcher": {
            "asleep": {"at": lib.at(5.5, 0.8), "rotation": 0},
            "intro": {"room": "library", "after": "puzzle_library", "closer": 3, "setup": "the light dies",
                      "comfort": "keep"},
            "territory": ["main_corridor", "library", "gym", "entrance_hall", "back_stairs"],
            "spawns": [lib.at(5.5, 0.8), gym.at(9.5, 1.5), cor.at(43.0, 0.6), cor.at(1.0, 0.6), hall.at(3.5, hz + 2.5)],
            # Following you down (ai/watcherFloors.js): where she comes off each stairs.
            "arrivals": {"main_stairs": [28.7, 18.6], "back_stairs": [27.0, 9.6]},
        },
        # Maggie's chalk (ghosts/chalk.js): a hint when you are stuck on a puzzle
        # you have tried (the content sheet's lines), now and then a taunt.
        "chalk": {
            "boards": ["chalk_west", "chalk_middle", "chalk_hall", "chalk_east"],
            "hints": [
                {"id": "library", "stuck": "tried_libraryIndex", "solved": "puzzle_library", "text": "chalk.hint.library"},
                {"id": "piano", "stuck": "tried_piano", "solved": "puzzle_piano", "text": "chalk.hint.piano"},
                {"id": "hopscotch", "stuck": "tried_hopscotch", "solved": "puzzle_hopscotch", "text": "chalk.hint.hopscotch"},
                {"id": "lock", "stuck": "tried_recordsLock", "solved": "puzzle_records", "text": "chalk.hint.lock"},
                {"id": "matches", "stuck": "matches_missing", "solved": "searched_cloak_pegs_east", "text": "chalk.hint.matches"},
                {"id": "watcher", "catches": 2, "text": "chalk.hint.watcher"},
            ],
            "taunts": {"after": "watcher_awake", "lines": ["chalk.taunt.behind", "chalk.taunt.lookedAway", "chalk.taunt.sawYou",
                                                         "chalk.taunt.notAllowed", "chalk.taunt.comeBack"]},
        },
        # Maggie's trick (ghosts/tricks.js): a while after the library, out of
        # your sight, she turns Classroom 1's desks to face the door.
        "tricks": [{"flag": "class1_turned", "after": "puzzle_library", "delay": 90, "room": "class_1",
                    "at": c1.at(4.0, 3.0), "hear": 14}],
    }


def write(name, data):
    with open(os.path.join(ROOT, name), 'w') as f:
        f.write(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    print('wrote', name, len(data.get('props', [])), 'props')


def garden_door():
    path = os.path.join(ROOT, 'orphanage_wing.json')
    d = json.load(open(path))
    if not any(door['id'] == 'garden_door' for door in d['doors']):
        d['doors'].append({"id": "garden_door", "cell": [1, 13], "requires": "wing_orphanage_done",
                           "lockedMessage": "msg.gardenDoorLocked",
                           "exit": {"level": "grounds", "spawn": "garden_door", "prompt": "prompt.toCourtyard"}})
    d['spawns']['garden_door'] = {"cell": [1, 12], "yawDegrees": 0}
    with open(path, 'w') as f:
        f.write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('garden door on the landing')


write('grounds.json', grounds())
write('school_ground.json', school())
garden_door()
