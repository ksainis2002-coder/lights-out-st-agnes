"""Writes src/mockups/levels/school_upper.json: the school's first floor (0.3
part B), laid out for the owner's stills before it is built. Same conventions
as tools/levels/school_part_a.py: furniture in room-local cells, (0, 0) at a
room's north-west corner, walls on the lines x = 0, x = w, z = 0, z = d.

The stairs line up with the ground floor's: the back stairs come up at
x 26-27 beside the gym, the main stairs at x 27-28 over the hall's north side.
Once the stills are approved the level moves to src/levels/ and gets its
doors, triggers and set pieces."""
import json, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'mockups', 'levels', 'school_upper.json')
COLS, ROWS = 45, 21
WARM = '#ffd9a0'
COOL = '#c8d4e8'


def r3(v):
    return round(v, 3)


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
        self.props, self.lights = [], []

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
DOORS = [{"id": "upper_class_3", "cell": [12, 12]}, {"id": "upper_class_4", "cell": [21, 12]},
         {"id": "head_office", "cell": [32, 9]}, {"id": "head_flat", "cell": [36, 6]}]


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
def classroom(L, room, lines, blinds=False):
    L.prop(room, 'blackboard', 0, 3.0, 90, lines=lines)
    L.prop(room, 'table', 1.3, 1.6, 90)
    L.prop(room, 'chair', 0.8, 1.6, 90)
    n = 0
    for x in (3.2, 4.8, 6.4):
        for z in (1.2, 2.4, 3.6, 4.8):
            L.prop(room, 'schoolDesk', x, z, 90 + (n * 7 % 5 - 2))
            n += 1
    window = {"blind": True} if blinds else {}
    for x in (2.0, 4.5, 7.0):
        L.prop(room, 'windowFrame', x, 6, 180, **window)
    L.prop(room, 'radiator', 4.5, 6, 180)


def class3(L, c3):
    classroom(L, c3, ["Form III", "Monday, 2nd February"])
    L.prop(c3, 'ledger', 1.25, 1.6, 75, y=0.76)  # the register, open on the teacher's table
    L.light(c3, 4.5, 5.4, 2.2, 2.0, 8)


def class4(L, c4):
    classroom(L, c4, ["Form IV", "Film: Our School"], blinds=True)
    L.prop(c4, 'projectorScreen', 0.02, 3.0, 90, extra={"id": "film_screen"})
    L.prop(c4, 'projector', 5.6, 3.0, -90, extra={"id": "projector"})  # in the aisle among the desks
    L.prop(c4, 'smallItem', 1.3, 1.9, 0, y=0.76, color='#5a5a58', size=[0.24, 0.03, 0.24])  # a film can
    L.light(c4, 4.5, 5.4, 2.2, 1.4, 8)


def office(L, off):
    L.prop(off, 'rug', 3.5, 2.3, width=3.2, depth=2.6)
    L.prop(off, 'pedestalDesk', 3.5, 1.8)
    L.prop(off, 'chair', 3.5, 1.05)
    L.prop(off, 'chair', 3.5, 2.95, 180)
    L.prop(off, 'deskLamp', 2.95, 1.65, 20, y=0.76, lit=True)
    L.prop(off, 'paperSheet', 3.75, 1.75, 12, y=0.765)  # the inspector's report
    L.prop(off, 'recordsCabinet', 0.3, 1.2, 90)  # the number lock (approved still ui_codeLock)
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
    L.prop(fl, 'paperSheet', 3.28, 0.32, -14, y=0.605)  # the doctor's letter
    L.prop(fl, 'windowFrame', 1.4, 0)
    L.prop(fl, 'armchair', 1.0, 1.3, 140)
    L.prop(fl, 'sideTable', 1.9, 0.7)
    L.prop(fl, 'gramophone', 1.9, 0.7, 150, y=0.6)
    L.prop(fl, 'wardrobe', 0.32, 4.0, 90)
    L.prop(fl, 'washstand', 5.8, 3.8, -90)
    L.light(fl, 2.6, 0.8, 1.2, 2.8, 6, WARM)


def stairs(L, main, back):
    # The heads of the two stairs: black wells going down, the rails falling away.
    L.prop(main, 'stairHead', 1.0, 1.0, 180, width=2.3, carpet=True)
    L.prop(back, 'stairHead', 1.0, 2.0, 0, width=2.3)


def level():
    L = Level()
    corridor(L, ROOMS['corridor'])
    class3(L, ROOMS['class3'])
    class4(L, ROOMS['class4'])
    office(L, ROOMS['office'])
    flat(L, ROOMS['flat'])
    stairs(L, ROOMS['main'], ROOMS['back'])
    return {
        "id": "school_upper", "wing": "school", "cellSize": 1.2, "wallHeight": 3.4,
        "floorTexture": "floor", "ceilingTexture": "ceiling",
        "ambient": {"color": "#8a98c8", "intensity": 0.9},
        "legend": {".": "floor", "#": "schoolWall"},
        "map": grid(),
        "spawns": {"default": {"cell": [28.0, 12.6], "yawDegrees": 0},
                   "main_stairs": {"cell": [28.0, 12.6], "yawDegrees": 0},
                   "back_stairs": {"cell": [27.0, 8.7], "yawDegrees": 180}},
        "rooms": [room.data() for room in ROOMS.values()], "doors": DOORS, "triggers": [],
        "props": L.props, "lights": L.lights,
        "pickups": [], "documents": [],
        "maps": [{"id": "school_upper", "key": [2.0, 1.0]}],
    }


with open(OUT, 'w') as f:
    f.write(json.dumps(level(), indent=1, ensure_ascii=False) + '\n')
print('wrote', os.path.relpath(OUT), len(level()['props']), 'props')
