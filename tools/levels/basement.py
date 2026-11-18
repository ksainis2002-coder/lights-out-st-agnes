"""Writes src/levels/basement.json (0.5 part B: the basement under the west wing;
the approved wing map and stills surgeon, sam, morgue; the wing 4 content
sheet), and links it to the west wing: the steps down behind the gate there,
Nora's last radio on them, and the gate standing open once St. Agnes is whole.

The basement, as the wing map has it: along the top the foot of the stairs
from the west wing, the coal store (where Tommy was sent; things to throw),
the laundry (the chute from the wards, a staff room, lockers) and a passage
to the Founder's door (locked: 0.6); the cold corridor along the middle,
pipes overhead and water on the floor, where Dr. Venn walks his round; along
the bottom the boiler room (flooded; Sam; the valves), the morgue (the
drawers by date) and the theatre (Nora: part C; shut until then).

The JSON is the game's data; this script is how it was laid out. Change the
layout here and run it again (python3 tools/levels/basement.py). It also
edits wards_ground.json, so run it after anything that writes the west wing
afresh (wards_part_a.py, wards_part_b.py)."""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
BULB = '#d8c8a0'
OPEN = "basement_open"  # St. Agnes is whole (ai/agnesPieces.js)
r3 = lambda v: round(v, 3)


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
        self.props, self.lights, self.emitters, self.pickups = [], [], [], []

    def throwable(self, room, pid, item, x, z):
        """A bottle or a stone lying there to be taken and thrown (player/throwing.js)."""
        model = {"bottle": "medicineBottle", "stone": "looseStone"}[item]
        self.pickups.append({"id": pid, "item": item, "at": room.at(x, z), "model": model, "radius": 0.25})

    def prop(self, room, type_, x, z, rotation=0, lift=None, extra=None, **options):
        p = {"type": type_, "at": room.at(x, z)}
        if rotation:
            p["rotation"] = r3(rotation)
        if lift is not None:
            p["y"] = lift
        if options:
            p["options"] = options
        if extra:
            p.update(extra)
        self.props.append(p)

    def lockers(self, room, x, z, count, rotation):
        """Staff lockers in a row along a wall, each one to hide in (player/hide.js; approved still locker)."""
        for i in range(count):
            # An id keeps it out of the merged furniture: hidden inside it, its model is put away.
            self.prop(room, 'staffLocker', x, z + i * 0.42, rotation, extra={"id": f"locker_{room.id}_{i}", "use": "hide",
                      "prompt": "prompt.hideLocker", "useHeight": 1.3, "useRadius": 0.4})

    def bulb(self, room, x, z, ceiling, intensity=1.2, distance=6, lit=True):
        """A bare bulb on its flex, and its light (dim and warm: the basement's only light)."""
        self.prop(room, 'hangingBulb', x, z, ceiling=ceiling, lit=lit)
        if lit:
            self.lights.append({"type": "point", "at": room.at(x, z), "height": r3(ceiling - 0.6), "color": BULB,
                                "intensity": intensity, "distance": distance})

    def drip(self, room, x, z, volume=0.25):
        self.emitters.append({"sound": "hospital_drip", "at": room.at(x, z), "height": 2.2, "volume": volume, "distance": 4})


def carve(width, height, rooms, doors):
    cells = [['#'] * width for _ in range(height)]
    for room in rooms:
        for r in range(room.r0, room.r1 + 1):
            for c in range(room.c0, room.c1 + 1):
                cells[r][c] = '.'
    for door in doors:
        c, r = door["cell"]
        cells[r][c] = '.'
    return [''.join(row) for row in cells]


def look(message, height=1.0, radius=0.6):
    """A thing to look at: its line every time (props/usable.js "look" with a "message")."""
    return {"use": "look", "message": message, "useHeight": height, "useRadius": radius}


def basement():
    L = Level()
    stone = dict(wall='brick', floor='stone', ceiling='ceiling')
    stairs = Room('basement_stairs', 1, 1, 3, 6, height=3.0, **stone)  # open to the corridor along its south side
    coal = Room('coal_store', 5, 1, 10, 5, height=2.6, **stone)
    laundry = Room('laundry', 12, 1, 17, 5, height=2.8, wall='tile', floor='stone', ceiling='ceiling')
    founders = Room('founders_door', 19, 2, 21, 6, height=2.6, **stone)
    corridor = Room('cold_corridor', 1, 7, 23, 8, height=2.6, **stone)
    boiler = Room('boiler_room', 1, 10, 8, 16, height=3.4, **stone)
    morgue = Room('morgue', 10, 10, 16, 15, height=3.0, wall='tile', floor='tile', ceiling='ceiling')
    theatre = Room('theatre', 18, 10, 24, 16, height=3.8, wall='tile', floor='tile', ceiling='ceiling')
    rooms = [stairs, coal, laundry, founders, corridor, boiler, morgue, theatre]
    for room in rooms:
        room.extra["ambience"] = [{"name": "amb_pipes", "volume": 0.25}, {"name": "amb_building_hum", "volume": 0.2}]
    doors = [
        {"id": "coal_door", "cell": [7, 6]},
        {"id": "laundry_door", "cell": [14, 6]},
        {"id": "boiler_door", "cell": [7, 9]},
        {"id": "morgue_door", "cell": [15, 9]},
        {"id": "theatre_door", "cell": [21, 9], "requires": "theatre_open"},  # part C
        {"id": "founders_door", "cell": [20, 1], "requires": "founders_open", "lockedMessage": "msg.foundersDoor"},  # 0.6
    ]

    # The foot of the stairs from the west wing; the flight rises north.
    L.prop(stairs, 'stairs', 1.5, 2.4, 0, extra={"use": "travel", "to": {"level": "wards_ground", "spawn": "basement"},
                                                "prompt": "prompt.stairsUp", "useHeight": 0.9, "useRadius": 0.8}, steps=8, landing=0.6)
    L.bulb(stairs, 1.5, 4.2, 3.0, intensity=0.9, distance=5)
    L.prop(stairs, 'puddle', 0.7, 5.2, width=0.8, depth=0.6)

    # The coal store: what is left of the coal, and things to throw (the wing map: "bottles, stones").
    L.prop(coal, 'coalHeap', 1.3, 0.9)
    L.prop(coal, 'coalHeap', 4.6, 1.1, 30)
    for i, (item, x, z) in enumerate((('bottle', 2.6, 3.4), ('bottle', 4.0, 3.8), ('stone', 1.6, 2.6), ('stone', 2.2, 2.9), ('stone', 5.1, 2.8))):
        L.throwable(coal, f'coal_{item}_{i}', item, x, z)
    L.bulb(coal, 3.0, 2.4, 2.6, lit=False)

    # The laundry: the chute from the wards above, its baskets, a staff table.
    L.prop(laundry, 'laundryChute', 2.0, 0, 0)
    L.prop(laundry, 'laundryBasket', 3.1, 0.6, 15)
    L.prop(laundry, 'sheetPile', 1.0, 0.7, 40)
    L.prop(laundry, 'table', 4.0, 3.0)
    L.prop(laundry, 'chair', 4.0, 3.8, 180)
    L.throwable(laundry, 'laundry_bottle', 'bottle', 1.6, 3.6)
    L.lockers(laundry, 5.75, 2.4, 2, -90)  # the staff room's lockers, along its east wall
    L.bulb(laundry, 3.0, 2.0, 2.8, intensity=0.8, distance=5)

    # The passage to the Founder's door, and someone humming behind it.
    L.bulb(founders, 1.5, 2.5, 2.6, intensity=0.5, distance=3)
    L.emitters.append({"sound": "girl_hum", "at": founders.at(1.5, -0.6), "height": 1.2, "volume": 0.12, "distance": 2.5})

    # The cold corridor: pipes overhead, water standing on the floor (approved still "surgeon").
    L.prop(corridor, 'pipeRun', 11.5, 0.35, length=22.4, height=2.25)
    L.prop(corridor, 'pipeRun', 11.5, 1.75, length=22.4, height=2.4, radius=0.05)
    for x, z, w, d in ((4.5, 1.4, 1.4, 0.8), (12.5, 0.6, 1.6, 0.9), (17.8, 1.2, 1.2, 0.7)):
        L.prop(corridor, 'puddle', x, z, width=w, depth=d)
    L.bulb(corridor, 6.5, 1.0, 2.6, intensity=1.0, distance=6)
    L.bulb(corridor, 17.0, 1.0, 2.6, intensity=1.0, distance=6)
    L.drip(corridor, 12.5, 0.6)
    L.drip(corridor, 4.5, 1.4, 0.2)

    # The boiler room under water to the knee (approved still "sam"); the valves on the west wall.
    L.prop(boiler, 'boiler', 4.4, 1.4)
    L.prop(boiler, 'floodWater', 4.0, 3.5, extra={"id": "boiler_flood"}, width=9.6, depth=8.4, height=0.45)
    for z, colour, wid in ((2.0, '#8a2a22', 'valve_red'), (3.0, '#2a5a8a', 'valve_blue'), (4.0, '#8a7a2a', 'valve_brass')):
        L.prop(boiler, 'valveWheel', 0, z, 90, extra={"id": wid}, color=colour)
    L.prop(boiler, 'pipeRun', 4.0, 6.6, length=9.6, height=2.9)
    L.bulb(boiler, 5.5, 2.0, 3.4, intensity=1.6, distance=7)
    L.drip(boiler, 2.0, 2.0, 0.3)

    # The morgue: the steel drawers typed with dates (approved still "morgue"), a dead tube light.
    cards = ['30 OCT', '12 MAY', '', '3 JAN', '2 FEB', '', '18 MAR', '14 NOV', '', '9 JUN', '', '2 APR']
    L.prop(morgue, 'morgueDrawers', 2.6, 0, extra={"id": "morgue_drawers"}, cards=cards)
    L.prop(morgue, 'fluorescent', 2.6, 2.4, height=2.9)
    L.prop(morgue, 'puddle', 4.0, 3.2, width=1.0, depth=0.8)
    L.lockers(morgue, 6.75, 2.2, 3, -90)  # along its east wall, as in the approved still
    # A bulb left burning over the drawers (approved still locker_inside: what you see him by from a locker).
    L.bulb(morgue, 3.4, 1.9, 3.0, intensity=2.6, distance=8)

    # The theatre, shut until part C (Nora).
    L.bulb(theatre, 3.5, 3.5, 3.8, lit=False)

    return {
        # Walls 3 m as the approved stills' level, so brick and tile keep their scale.
        "id": "basement", "wing": "basement", "cellSize": 1.2, "wallHeight": 3.0,
        "loudDoors": True,  # "The doors shout down here": drag to ease them (levels/doorDrag.js)
        "floorTexture": "stone", "ceilingTexture": "ceiling",
        "ambient": {"color": "#8a98c8", "intensity": 0.9},
        "legend": {".": "floor", "#": "brick"},
        "map": carve(26, 18, rooms, doors),
        # Spawn cells are cell indices: you stand at their centre (+0.5), here (2.5, 4.8).
        "spawns": {"default": {"cell": [2.0, 4.3], "yawDegrees": 180}, "stairs": {"cell": [2.0, 4.3], "yawDegrees": 180}},
        "rooms": [room.data() for room in rooms], "doors": doors, "triggers": [], "props": L.props, "lights": L.lights,
        "emitters": L.emitters, "pickups": L.pickups, "documents": [],
    }


def west_wing_link():
    """The west wing's basement stairs: steps down behind the gate, Nora's last radio on the
    landing, a spawn for coming back up, and the gate standing open once she is whole."""
    path = os.path.join(ROOT, 'wards_ground.json')
    d = json.load(open(path))
    for room in d['rooms']:
        if room['id'] == 'basement_stairs':
            room['well'] = [6, 13, 8, 16]
    ours = lambda p: p.get('id') in ('basement_steps', 'radio_basement')
    d['props'] = [p for p in d['props'] if not ours(p)] + [
        {"type": "stairHead", "at": [7.5, 13.0], "rotation": 180, "id": "basement_steps", "options": {"width": 2.6, "steps": 8},
         "use": "travel", "to": {"level": "basement", "spawn": "stairs"}, "prompt": "prompt.stairsDown",
         "useAt": [7.5, 12.6], "useHeight": 0.8, "useRadius": 0.9},
        {"type": "radioSet", "at": [6.35, 12.0], "rotation": 90, "id": "radio_basement", "options": {"lit": True}},
    ]
    d['radios'] = [r for r in d['radios'] if r['id'] != 'radio_basement'] + [
        {"id": "radio_basement", "at": [6.35, 12.0], "hear": 2.4, "lines": ["nora.basement"], "after": "caption.radioDies"}]
    d['spawns']['basement'] = {"cell": [7.0, 11.7], "yawDegrees": 0}  # you stand at the cell's centre: (7.5, 12.2)
    for door in d['doors']:
        if door['id'] == 'ward_basement':
            door['opensWith'] = OPEN
    d['arrivals'] = [a for a in (d.get('arrivals') or []) if a['message'] != 'msg.basementGateOpen'] + [
        {"after": {"flag": OPEN}, "message": "msg.basementGateOpen"}]
    with open(path, 'w') as f:
        f.write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('the west wing: steps down to the basement')


def write(name, data):
    with open(os.path.join(ROOT, name), 'w') as f:
        f.write(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    print('wrote', name, len(data['props']), 'props')


write('basement.json', basement())
west_wing_link()
