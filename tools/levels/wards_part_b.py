"""Writes src/levels/wards_upper.json (0.4 part B1: the west wing's first
floor to walk: the stairs, the treatment corridor, the observation room with
Nora's camcorder and tape, the treatment room behind its glass, the isolation
cells; Dr. Venn's office and Sister M.'s room stay shut until B2 and C).
Furniture is placed in room-local cell coordinates, as in wards_part_a.py.

The JSON is the game's data; this script is how it was laid out. Change the
layout here and run it again (python3 tools/levels/wards_part_b.py)."""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
MOON, COLD = '#5a6c9c', '#cfe0ff'
r3 = lambda v: round(v, 3)


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
        self.props, self.lights, self.pickups = [], [], []

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

    def many(self, room, rows):
        for type_, x, z, *rest in rows:
            self.prop(room, type_, x, z, rest[0] if rest else 0, rest[2] if len(rest) > 2 else None, **(rest[1] if len(rest) > 1 else {}))

    def light(self, room, x, z, height, intensity, distance, color=MOON):
        self.lights.append({"type": "point", "at": room.at(x, z), "height": height, "color": color,
                            "intensity": intensity, "distance": distance})

    def pickup(self, room, pid, item, x, z, y=0.0, **extra):
        self.pickups.append({"id": pid, "item": item, "at": room.at(x, z), "y": y, **extra})


def upper():
    L = Level()
    W, H = 31, 14
    rooms = {
        'sister': Room('sister_room', 1, 1, 6, 5),
        'cell_1': Room('cell_1', 8, 1, 10, 2, wall='padded'),
        'cell_2': Room('cell_2', 12, 1, 14, 2, wall='padded'),
        'lobby': Room('isolation', 8, 4, 14, 5),
        'treatment': Room('treatment_room', 16, 1, 21, 5, wall='tile'),
        'observation': Room('observation', 22, 1, 26, 5),
        'stairs': Room('ward_stairs_top', 28, 1, 29, 5, well=[28, 1, 29, 2]),
        'corridor': Room('treatment_corridor', 1, 7, 29, 8),
        'venn': Room('venn_office', 1, 10, 8, 12),
    }
    cells = [['#'] * W for _ in range(H)]
    for room in rooms.values():
        for r in range(room.r0, room.r1 + 1):
            for c in range(room.c0, room.c1 + 1):
                cells[r][c] = '.'
    doors = [
        # Sister M.'s room (part C) and Dr. Venn's office (part B2) stay shut for now.
        {"id": "upper_sister", "cell": [3, 6], "requires": "sister_room_open", "lockedMessage": "msg.sisterDoorLocked"},
        {"id": "upper_venn", "cell": [4, 9], "requires": "puzzle_venn_door", "lockedMessage": "msg.vennDoorLocked"},
        {"id": "upper_isolation", "cell": [11, 6]}, {"id": "upper_cell_1", "cell": [9, 3]}, {"id": "upper_cell_2", "cell": [13, 3]},
        {"id": "upper_observation", "cell": [24, 6]},
    ]
    for door in doors:
        c, r = door["cell"]
        cells[r][c] = '.'
    for c in (28, 29):
        cells[6][c] = '.'  # the stair head opens straight onto the corridor
    sis, c1, c2, lob, tre, obs, sta, cor, ven = (rooms[k] for k in (
        'sister', 'cell_1', 'cell_2', 'lobby', 'treatment', 'observation', 'stairs', 'corridor', 'venn'))

    # The stair head: look down the flight to go down.
    L.prop(sta, 'stairHead', 1.0, 2.0, 0, extra={"use": "travel", "to": {"level": "wards_ground", "spawn": "stairs"},
                                                  "prompt": "prompt.stairsDown", "useAt": sta.at(1.0, 1.6), "useHeight": 0.8,
                                                    "useRadius": 0.9}, width=2.3)
    L.light(sta, 1.0, 3.8, 2.4, 1.2, 5)

    # Observation: the tripod, the monitor, Nora's camcorder where she dropped it; the glass onto
    # the treatment room is this room's west side (no wall there: the glass is the wall).
    L.prop(obs, 'observationGlass', 0, 2.5, 90, extra={"id": "observation_glass"}, width=6.0, wall=True)
    L.many(obs, [
        ('tripod', 1.0, 2.6, 110), ('television', 4.3, 0.6, -20), ('table', 3.0, 0.5), ('chair', 3.0, 1.2, 180),
        ('chair', 3.6, 3.4, 110, {"toppled": True}), ('papers', 3.0, 0.5, 0, {"count": 5}, 0.76), ('papers', 2.4, 3.6, 40, {"count": 6}),
        ('papers', 3.8, 2.2, 100, {"count": 4}), ('recordsCabinet', 4.7, 2.4, -90, {"lock": False}), ('wallClock', 1.9, 0),
        ('notice', 4.2, 0), ('peeledPaper', 5, 3.6, -90, {"seed": 6}), ('hangingBulb', 2.6, 2.6, 0, {"ceiling": 3.4}), ('sheetPile', 4.2, 4.4),
    ])
    L.pickup(obs, 'nora_camcorder', 'camcorder', 1.7, 3.3, y=0.0, model='camcorder', rotation=70, radius=0.3)
    L.pickup(obs, 'nora_tape', 'nora_tape', 2.2, 3.7, y=0.01, model='videoTape', rotation=30)
    L.light(obs, 2.6, 2.6, 2.3, 1.5, 6)

    # The treatment room: seen through the glass only (it has no door on this side).
    L.many(tre, [
        ('treatmentChair', 3.4, 2.5, 90), ('surgeryLamp', 3.7, 2.5, 0, {"drop": 1.3}), ('floorStain', 3.8, 2.5), ('floorDrain', 4.4, 3.1),
        ('instrumentTray', 3.7, 1.6, 60), ('trolley', 3.6, 3.6, 10), ('dripStand', 2.6, 1.7), ('examCouch', 1.0, 0.7),
        ('toyBox', 3.85, 2.5, 90), ('shoes', 4.6, 3.3, 40), ('sheetPile', 2.2, 3.9), ('bucketMop', 0.6, 4.4),
        ('tileDecay', 0, 2.5, 90, {"width": 2.2, "height": 1.4, "y": 1.6, "seed": 5}), ('tileDecay', 3.0, 0, 0, {"width": 1.4, "height": 1.0, "y": 1.2, "seed": 2}),
        ('fallenTiles', 0.5, 2.7, 0, {"seed": 7}), ('handprints', 4.6, 0), ('wallScratches', 1.8, 5, 180, {"seed": 4}),
        ('recordsCabinet', 0.3, 3.6, 90, {"lock": False}), ('wallClock', 5.0, 0),
    ])
    L.lights.append({"type": "point", "at": tre.at(3.7, 2.5), "height": 1.9, "color": COLD, "intensity": 9, "distance": 6})

    # The isolation cells off their lobby: padding and nothing else (the writing comes in B2).
    L.many(lob, [('bench', 3.5, 1.8, 180, {"length": 2.4}), ('bucketMop', 6.5, 0.5), ('tinPlate', 0.6, 0.5), ('papers', 4.6, 1.0, 20, {"count": 4}),
                 ('peeledPaper', 7, 1.0, -90, {"seed": 8}), ('hangingBulb', 3.5, 1.0, 0, {"ceiling": 3.4})])
    L.many(c1, [('tinPlate', 0.5, 0.5), ('wornPatch', 2.3, 0.6), ('floorDrain', 1.5, 1.3)])
    L.many(c2, [('sheetPile', 2.3, 0.6), ('wornPatch', 0.7, 0.7), ('floorDrain', 1.5, 1.3)])
    L.light(lob, 3.5, 1.0, 2.3, 1.2, 6)

    # The treatment corridor.
    L.many(cor, [
        ('stretcher', 6.5, 1.5, 90), ('wheelchair', 14.5, 0.6, 200), ('trolley', 19.5, 1.6, 10), ('bench', 22.0, 1.82, 180, {"length": 2.4}),
        ('papers', 9.0, 1.0, 30, {"count": 6}), ('papers', 17.0, 0.8, 70, {"count": 5}), ('papers', 25.5, 1.2, 0, {"count": 4}),
        ('dripStand', 12.5, 1.7), ('sheetPile', 2.0, 1.4), ('peeledPaper', 5.5, 0, 0, {"seed": 1}), ('peeledPaper', 20.5, 2, 180, {"seed": 8}),
        ('radiator', 15.0, 2, 180), ('puddle', 11.0, 0.9), ('notice', 26.2, 0),
    ])
    for x in (4.0, 13.0, 21.0, 27.0):
        L.prop(cor, 'hangingBulb', x, 1.0, ceiling=3.4)
    for x in (6.0, 16.0, 25.0):
        L.light(cor, x, 1.0, 2.4, 1.3, 9)

    hum = {"name": "amb_building_hum", "volume": 0.3}
    rain = {"name": "amb_rain_inside", "volume": 0.35}
    out_rooms = []
    for room in rooms.values():
        data = room.data()
        data["ambience"] = [rain, hum] + ([{"name": "amb_wind_corridor", "volume": 0.25}] if room.id == 'treatment_corridor' else [])
        out_rooms.append(data)

    return {
        "id": "wards_upper", "wing": "wards", "cellSize": 1.2, "wallHeight": 3.4,
        "floorTexture": "floor", "ceilingTexture": "ceiling",
        "ambient": {"color": "#8a98c8", "intensity": 0.75},
        "legend": {".": "floor", "#": "wardWall"},
        "map": [''.join(r) for r in cells],
        "spawns": {"default": {"cell": [28.5, 4.2], "yawDegrees": 180}, "stairs": {"cell": [28.5, 4.2], "yawDegrees": 180}},
        "rooms": out_rooms, "doors": doors, "triggers": [], "props": L.props, "lights": L.lights,
        "ambience": [rain], "emitters": [],
        "pickups": L.pickups, "documents": [],
        "weather": {"storm": "puzzle_records"},
        # Sister M. up here: no first round (that was Ward A's); she comes up after you
        # (ai/nunFloors.js) by the stairs and walks this round. The treatment room has no door.
        "nun": {
            "territory": ["treatment_corridor", "observation", "isolation", "cell_1", "cell_2", "ward_stairs_top"],
            "round": [cor.at(26.5, 1.0), obs.at(2.6, 3.4), cor.at(20.0, 1.0), cor.at(10.5, 0.8), lob.at(3.5, 0.8), cor.at(10.5, 1.2), cor.at(2.5, 1.0)],
            "arrivals": {"stairs": sta.at(1.0, 4.4)},
        },
        # Edith is downstairs; up here she is only her voice.
        "edith": {"room": None},
    }


def write(name, data):
    with open(os.path.join(ROOT, name), 'w') as f:
        f.write(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    print('wrote', name, len(data['props']), 'props')


write('wards_upper.json', upper())
