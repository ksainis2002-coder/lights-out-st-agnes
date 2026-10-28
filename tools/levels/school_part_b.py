"""Writes src/levels/school_upper.json: the school's first floor (0.3 part B),
as in the owner's approved stills (2026-10-24). Same conventions as
tools/levels/school_part_a.py: furniture in room-local cells, (0, 0) at a
room's north-west corner, walls on the lines x = 0, x = w, z = 0, z = d.

The stairs line up with the ground floor's: the back stairs come up at
x 26-27 beside the gym, the main stairs at x 27-28 over the hall's north side.
Each stair head takes you down to the foot of the same stairs.

The JSON file is the game's data; this script is how it was laid out. A rerun
overwrites hand edits."""
import json, math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels', 'school_upper.json')
COLS, ROWS = 45, 21
WARM = '#ffd9a0'
COOL = '#c8d4e8'


def r3(v):
    return round(v, 3)


def local_cells(at, rotation, lx, lz, cell=1.2):
    """A point given in a prop's own metres (x right, z out of its front), in level cells."""
    t = math.radians(rotation)
    return [r3(at[0] + (lx * math.cos(t) + lz * math.sin(t)) / cell), r3(at[1] + (-lx * math.sin(t) + lz * math.cos(t)) / cell)]


class Room:
    def __init__(self, rid, c0, r0, c1, r1, **extra):
        self.id, self.c0, self.r0, self.c1, self.r1 = rid, c0, r0, c1, r1
        self.extra = extra

    def at(self, x, z):
        return [r3(self.c0 + x), r3(self.r0 + z)]

    def data(self):
        return {"id": self.id, "cells": [self.c0, self.r0, self.c1, self.r1], **self.extra}


class Level:
    def __init__(self):
        self.props, self.lights, self.pickups, self.documents = [], [], [], []

    def prop(self, room, type_, x, z, rotation=0, y=None, extra=None, **options):
        p = {"type": type_, "at": room.at(x, z)}
        if rotation:
            p["rotation"] = r3(rotation)
        if y is not None:
            p["y"] = y
        if options:
            p["options"] = options
        if extra:
            p.update(extra)
        self.props.append(p)

    def document(self, at, did, y, rotation=0, **extra):
        doc = {"id": did, "at": at, "y": y, **extra}
        if rotation:
            doc["rotation"] = r3(rotation)
        self.documents.append(doc)

    def light(self, room, x, z, height, intensity, distance, color=COOL):
        self.lights.append({"type": "point", "at": room.at(x, z), "height": height, "color": color,
                            "intensity": intensity, "distance": distance})


ROOMS = {
    'corridor': Room('upper_corridor', 9, 10, 42, 11, floor='floor'),
    'class3': Room('class_3', 9, 13, 16, 18, floor='parquet'),
    'class4': Room('class_4', 18, 13, 25, 18, floor='parquet'),
    'main': Room('main_stairs', 27, 12, 28, 14, floor='wood', well=[27, 13, 28, 14]),
    'back': Room('back_stairs', 26, 6, 27, 9, floor='wood', well=[26, 6, 27, 7]),
    'office': Room('head_office', 29, 4, 35, 8, floor='parquet', wall='wallpaper'),
    'flat': Room('head_flat', 37, 4, 42, 8, floor='wood', wall='wallpaper'),
}
# The office takes the headmaster's key (it dropped out of the piano); the
# flat is reached only through the office.
DOORS = [{"id": "upper_class_3", "cell": [12, 12]}, {"id": "upper_class_4", "cell": [21, 12]},
         {"id": "head_office", "cell": [32, 9], "locked": "headmaster_key"}, {"id": "head_flat", "cell": [36, 6]}]


def grid():
    rows = [['#'] * COLS for _ in range(ROWS)]
    for room in ROOMS.values():
        for row in range(room.r0, room.r1 + 1):
            for col in range(room.c0, room.c1 + 1):
                rows[row][col] = '.'
    return [''.join(row) for row in rows]


def corridor(L, cor):
    for x in (4.5, 13, 21.5, 30):
        L.prop(cor, 'runner', x, 1.0, 90, length=9.6, width=1.0)
    for x in (5, 12, 21, 29):
        L.prop(cor, 'radiator', x, 0)
    for x in (6, 23, 30):
        L.prop(cor, 'bench', x, 1.85, 180, length=1.8)
    for x in (1.5, 10.5):
        L.prop(cor, 'coatPegs', x, 2, 180, count=4, coats=2)
    L.prop(cor, 'schoolBell', 11.5, 0, extra={"id": "school_bell"})  # between the two classroom doors
    L.prop(cor, 'wallClock', 8, 0, height=2.3)
    L.prop(cor, 'noticeBoard', 6, 0)
    L.prop(cor, 'portrait', 21.5, 0, y=0.4)
    L.prop(cor, 'saintPicture', 25, 2, 180)
    L.prop(cor, 'windowFrame', 0, 1.0, 90)
    L.prop(cor, 'windowFrame', 34, 1.0, -90)
    for x in (2.5, 9.5, 16.5, 23.5, 30.5):
        L.light(cor, x, 1.0, 2.2, 1.6, 7)


# Desks in rows facing the board on the west wall, as on the ground floor.
# Returns the desks, [[col, row, rotation], …], the one nearest the door first.
def classroom(L, room, line_keys, blinds=False):
    L.prop(room, 'blackboard', 0, 3.0, 90, lineKeys=line_keys)
    L.prop(room, 'table', 1.3, 1.6, 90)
    L.prop(room, 'chair', 0.8, 1.6, 90)
    n = 0
    desks = []
    for x in (3.2, 4.8, 6.4):
        for z in (1.2, 2.4, 3.6, 4.8):
            rotation = 90 + (n * 7 % 5 - 2)
            L.prop(room, 'schoolDesk', x, z, rotation)
            desks.append(room.at(x, z) + [rotation])
            n += 1
    window = {"blind": True} if blinds else {}
    for x in (2.0, 4.5, 7.0):
        L.prop(room, 'windowFrame', x, 6, 180, **window)
    L.prop(room, 'radiator', 4.5, 6, 180)
    return desks


def class3(L, c3):
    desks = classroom(L, c3, ["chalk.class3.form", "chalk.class3.date"])  # the day Tommy was struck off
    L.prop(c3, 'ledger', 1.25, 1.6, 75, y=0.76)  # the register, open on the teacher's table
    L.light(c3, 4.5, 5.4, 2.2, 2.0, 8)
    return desks[1:]  # the roll call: every desk but Tommy's, the nearest the door


def class4(L, c4):
    classroom(L, c4, ["chalk.class4.form", "chalk.class4.film"], blinds=True)
    L.prop(c4, 'projectorScreen', 0.02, 3.0, 90, extra={"id": "film_screen"})
    L.prop(c4, 'projector', 5.6, 3.0, -90, extra={"id": "projector"})  # in the aisle among the desks
    L.prop(c4, 'smallItem', 1.3, 1.9, 0, y=0.76, color='#5a5a58', size=[0.24, 0.03, 0.24])  # a film can
    L.light(c4, 4.5, 5.4, 2.2, 1.4, 8)


def office(L, off):
    L.prop(off, 'rug', 3.5, 2.3, width=3.2, depth=2.6)
    L.prop(off, 'pedestalDesk', 3.5, 1.8)
    L.prop(off, 'headChair', 3.5, 1.05)  # his: high-backed, buttoned leather (owner 2026-10-24)
    L.prop(off, 'chair', 3.5, 2.95, 180)
    L.prop(off, 'deskLamp', 2.95, 1.65, 20, y=0.76, lit=True)
    L.document(off.at(3.75, 1.75), 'inspector_report', 0.79, 12)  # on his desk
    # The records cabinet's number lock (approved still ui_codeLock). Solved, its
    # top drawer slides out, the roll, the medical card and the gate key on its files.
    cabinet = off.at(0.3, 1.2)
    L.prop(off, 'recordsCabinet', 0.3, 1.2, 90, extra={"id": "records_cabinet"})
    # Side by side across the drawer, so each takes a tight aim (radius).
    L.document(local_cells(cabinet, 90, -0.135, 0.5), 'struck_off', 1.245, 94, appearsWith='puzzle_records', radius=0.09)
    L.document(local_cells(cabinet, 90, 0.135, 0.5), 'medical_card', 1.25, 84, appearsWith='puzzle_records', radius=0.09)
    L.pickups.append({"id": "records_gate_key", "item": "gate_key", "at": local_cells(cabinet, 90, 0.0, 0.47), "y": 1.26,
                      "rotation": 180, "model": "brassKey", "color": "#7a6a58", "appearsWith": "puzzle_records",
                      "radius": 0.09})
    L.prop(off, 'bookshelf', 0.2, 3.5, 90, length=1.8)
    L.prop(off, 'portrait', 3.5, 0, y=0.6)
    L.prop(off, 'crucifix', 5.6, 0, height=2.1)
    L.prop(off, 'windowFrame', 1.3, 0)
    L.prop(off, 'hatStand', 5.7, 4.4)
    L.prop(off, 'wallClock', 7, 1.0, -90, height=2.3)
    L.light(off, 3.0, 1.7, 1.2, 2.4, 6, WARM)
    L.light(off, 3.5, 3.5, 2.6, 0.8, 6)


def flat(L, fl):
    L.prop(fl, 'rug', 3.0, 2.4, width=2.4, depth=1.8)
    L.prop(fl, 'bed', 4.6, 0.85, 90)
    L.prop(fl, 'crucifix', 4.6, 0, height=1.9)
    L.prop(fl, 'bedsideCupboard', 3.15, 0.3)
    L.prop(fl, 'deskLamp', 3.0, 0.32, 0, y=0.6, lit=True)
    L.document(fl.at(3.28, 0.32), 'venn_letter', 0.602, -14)  # the doctor's letter, by his lamp
    L.prop(fl, 'windowFrame', 1.4, 0)
    L.prop(fl, 'armchair', 1.0, 1.3, 140)
    L.prop(fl, 'sideTable', 1.9, 0.7)
    L.prop(fl, 'gramophone', 1.9, 0.7, 150, y=0.6)
    L.prop(fl, 'wardrobe', 0.32, 4.0, 90)
    L.prop(fl, 'washstand', 5.8, 3.8, -90)
    # A door home (owner pick 1a, 2026-10-27), as in the staff room downstairs.
    L.prop(fl, 'hubDoorway', 6, 2.5, -90, extra={"id": "home_flat", "use": "travel", "prompt": "prompt.goHome",
                                                 "to": {"level": "patient_room", "spawn": "door", "back": "home_flat"},
                                                 "useHeight": 1.2, "useRadius": 0.8})
    L.light(fl, 2.6, 0.8, 1.2, 2.8, 6, WARM)


def stairs(L, main, back):
    # The heads of the two stairs: black wells going down, the rails falling
    # away. Look down the flight to go down to the foot of the same stairs.
    down = lambda spawn, room, x, z: {"use": "travel", "to": {"level": "school_ground", "spawn": spawn},
                                      "prompt": "prompt.stairsDown", "useAt": room.at(x, z), "useHeight": 0.8,
                                      "useRadius": 0.9}
    L.prop(main, 'stairHead', 1.0, 1.0, 180, extra=down('main_stairs', main, 1.0, 1.4), width=2.3, carpet=True)
    L.prop(back, 'stairHead', 1.0, 2.0, 0, extra=down('back_stairs', back, 1.0, 1.6), width=2.3)


# The set pieces (design 0.3; approved stills bell, roll_call, projector_film;
# ghosts/setPieces.js): each with its tell, a cooldown of their own so two
# never stack, and cut in comfort mode (scare rules §1, §5).
def set_pieces(seats):
    common = {"cooldownGroup": "setPiece", "cooldown": 30, "comfort": "skip"}
    return [
        {"id": "bell", "kind": "bell", "room": "upper_corridor", **common, "drain": 3,
         "setup": {"tell": "the corridor goes quiet", "seconds": 1.2},
         "bell": "school_bell", "doors": ["upper_class_4", "upper_class_3"]},
        # A ruler slapped on the teacher's table (classroom(): local 1.3, 1.6) as the lamps die.
        {"id": "roll_call", "kind": "rollCall", "room": "class_3", **common, "drain": 6,
         "setup": {"tell": "the lamps die", "seconds": 1.0, "sound": "ruler_slap",
                   "at": ROOMS['class3'].at(1.3, 1.6)}, "seats": seats},
        {"id": "film", "kind": "film", "room": "class_4", **common, "drain": 4,
         "setup": {"tell": "the lamp goes out and the projector starts by itself", "seconds": 0.8},
         "screen": "film_screen", "projector": "projector"},
    ]


def level():
    L = Level()
    corridor(L, ROOMS['corridor'])
    seats = class3(L, ROOMS['class3'])
    class4(L, ROOMS['class4'])
    office(L, ROOMS['office'])
    flat(L, ROOMS['flat'])
    stairs(L, ROOMS['main'], ROOMS['back'])
    # The rain everywhere; the classrooms' own room tone, elsewhere the
    # building's hum; the wind in the corridor.
    rain = {"name": "amb_rain_inside", "volume": 0.35}
    hum = {"name": "amb_building_hum", "volume": 0.25}
    classroom = {"name": "amb_classroom", "volume": 0.15}
    rooms = []
    for room in ROOMS.values():
        data = room.data()
        data["ambience"] = [rain, classroom if room.id.startswith('class_') else hum]
        if room.id == 'upper_corridor':
            data["ambience"].append({"name": "amb_wind_corridor", "volume": 0.25})
        rooms.append(data)
    # Spawns at the head of each stairs, facing the corridor (a spawn's cell
    # is the corner of the cell it stands in the middle of).
    main_spawn = {"cell": [27.5, 12.0], "yawDegrees": 0}
    return {
        "id": "school_upper", "wing": "school", "cellSize": 1.2, "wallHeight": 3.4,
        "floorTexture": "floor", "ceilingTexture": "ceiling",
        "ambient": {"color": "#8a98c8", "intensity": 0.9},
        "legend": {".": "floor", "#": "schoolWall"},
        "map": grid(),
        "spawns": {"default": main_spawn, "main_stairs": main_spawn,
                   "back_stairs": {"cell": [26.5, 8.1], "yawDegrees": 180},
                   "home_flat": {"cell": [42, 6], "yawDegrees": 90}},
        "rooms": rooms, "doors": DOORS, "triggers": [],
        "props": L.props, "lights": L.lights,
        "ambience": [{"name": "amb_rain_inside", "volume": 0.3}],
        "pickups": L.pickups, "documents": L.documents,
        # Puzzle 3: the counting lesson's answer (content sheet, Normal) opens the records drawer.
        "puzzles": {"recordsLock": {"prop": "records_cabinet", "clue": "seen_counting_board", "code": [3, 5, 4]}},
        "setPieces": set_pieces(seats),
        "weather": {"storm": "puzzle_records"},  # the storm starts with the records drawer (levels/storm.js)
        "creaks": 0.12,  # the old boards upstairs creak now and then under a step (audio/gameAudio.js)
        # The watcher hunts the corridor and the stairs up here once she has followed
        # you up (ai/watcherFloors.js); the rooms are safe.
        "watcher": {"territory": ["upper_corridor", "main_stairs", "back_stairs"],
                    "spawns": [[10.0, 10.8], [41.5, 10.8], [27.0, 8.6], [28.0, 12.5]],
                    "arrivals": {"main_stairs": [28.0, 12.5], "back_stairs": [27.0, 8.6]}},
        # The plan itself is pinned in the staff room (school_ground); this
        # entry draws it: the key in the empty north-west corner.
        "maps": [{"id": "school_upper", "key": [2.0, 1.0]}],
    }


with open(OUT, 'w') as f:
    f.write(json.dumps(level(), indent=1, ensure_ascii=False) + '\n')
print('wrote', os.path.relpath(OUT), len(level()['props']), 'props')
