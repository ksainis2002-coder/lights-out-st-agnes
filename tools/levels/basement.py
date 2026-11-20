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
drawers by date) and the theatre (part C: Nora on his table; the cabinet
with the key to its back door, and the back stairs up to the west wing).

The JSON is the game's data; this script is how it was laid out. Change the
layout here and run it again (python3 tools/levels/basement.py). It also
edits wards_ground.json, so run it after anything that writes the west wing
afresh (wards_part_a.py, wards_part_b.py)."""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
# The morgue's drawers by index (row by row from the bottom, four to a row): typed with the
# roll's and the charts' dates, not names (puzzles/morgue.js; the wing 4 content sheet).
MORGUE = {
    "0": {"card": "morgue.card.oct30", "is": "empty"}, "2": {"card": "morgue.card.jan3", "is": "empty"},
    "3": {"card": "morgue.card.mar18", "is": "empty"}, "4": {"card": "morgue.card.feb2", "is": "tommy"},
    "5": {"card": "morgue.card.may12", "is": "sister"}, "7": {"card": "morgue.card.jun9", "is": "sam"},
    "9": {"card": "morgue.card.nov14", "is": "child", "name": "CARR, E."},
    "10": {"card": "morgue.card.apr2", "is": "child", "name": "ROWE, M."},
}
BULB = '#d8c8a0'
STEADY = 3.4  # a bulb bright enough to steady you: light 0.8 or more within about 2 m (sanity/meter.js)
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
        self.props, self.lights, self.emitters, self.pickups, self.documents = [], [], [], [], []

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
    back_stairs = Room('west_stairs', 26, 11, 27, 16, height=3.0, **stone)  # behind the theatre's back door
    rooms = [stairs, coal, laundry, founders, corridor, boiler, morgue, theatre, back_stairs]
    for room in rooms:
        room.extra["ambience"] = [{"name": "amb_pipes", "volume": 0.25}, {"name": "amb_building_hum", "volume": 0.2}]
    doors = [
        {"id": "coal_door", "cell": [7, 6]},
        {"id": "laundry_door", "cell": [14, 6]},
        {"id": "boiler_door", "cell": [7, 9]},
        {"id": "morgue_door", "cell": [15, 9]},
        # Locked until page four (owner 2026-11-18); through its glass, the lamp over his table.
        {"id": "theatre_door", "cell": [21, 9], "requires": "morgue_tommy", "lockedMessage": "msg.theatreLocked", "look": "glass"},
        # The way out: the cabinet's key opens it; walk out without Nora and it shuts for good (ai/noraTable.js).
        {"id": "theatre_back", "cell": [25, 15], "locked": "theatre_key", "lockedMessage": "msg.theatreBackDoor", "look": "glass",
         "shutBy": "nora_left"},
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
    # Spare batteries (owner 2026-11-20: wing 4 had none to find): one on the coal store's floor, one on the laundry's table.
    L.pickups.append({"id": "coal_battery", "item": "battery", "at": coal.at(3.2, 4.2), "model": "batteryCell", "rotation": 35})

    # The laundry: the chute from the wards above, its baskets, a staff table.
    L.prop(laundry, 'laundryChute', 2.0, 0, 0)
    L.prop(laundry, 'laundryBasket', 3.1, 0.6, 15)
    L.prop(laundry, 'sheetPile', 1.0, 0.7, 40)
    L.prop(laundry, 'table', 4.0, 3.0)
    L.prop(laundry, 'chair', 4.0, 3.8, 180)
    L.pickups.append({"id": "laundry_battery", "item": "battery", "at": laundry.at(4.25, 2.85), "y": 0.76, "model": "batteryCell", "rotation": 35})
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

    # The boiler room under water to the knee (approved still "sam"); the valves on the west wall,
    # turned in the order the stoker's log gives (puzzles/valves.js); Sam's soldier under the water.
    L.prop(boiler, 'boiler', 4.4, 1.4, extra={"id": "boiler"})
    L.prop(boiler, 'floodWater', 4.0, 3.5, extra={"id": "boiler_flood"}, width=9.6, depth=8.4, height=0.45)
    for z, colour, wid in ((2.0, '#8a2a22', 'valve_red'), (3.0, '#2a5a8a', 'valve_blue'), (4.0, '#8a7a2a', 'valve_brass')):
        L.prop(boiler, 'valveWheel', 0, z, 90, extra={"id": wid}, color=colour)
    L.prop(boiler, 'pipeRun', 4.0, 6.6, length=9.6, height=2.9)
    # Bright enough to steady you (owner 2026-11-20): within about 2 m of it the light lifts sanity back
    # to 60, as the lamps upstairs do (sanity/meter.js); the only such places in the basement.
    L.bulb(boiler, 5.5, 2.0, 3.4, intensity=STEADY, distance=7)
    L.pickups.append({"id": "sam_soldier", "item": "tin_soldier", "at": boiler.at(2.2, 4.6), "y": 0.02, "model": "tinSoldier",
                      "appearsWith": "puzzle_valves", "radius": 0.25})
    # The stoker's log on a little table by the east wall, just inside the door.
    L.prop(boiler, 'sideTable', 7.5, 1.6)
    L.documents.append({"id": "boiler_log", "at": boiler.at(7.5, 1.6), "y": 0.6, "rotation": 160, "model": "ledger", "height": 0.05})
    L.drip(boiler, 2.0, 2.0, 0.3)

    # The morgue: the steel drawers typed with dates (approved still "morgue"), a dead tube light.
    # Row by row from the bottom; 12 MAY in the middle row, where the still's long tray lies.
    cards = [''] * 12
    for index, entry in MORGUE.items():
        cards[int(index)] = entry.pop('card')
    L.prop(morgue, 'morgueDrawers', 2.6, 0, extra={"id": "morgue_drawers"}, cards=cards)
    # Page four of his file, on Tommy's tray once pulled (drawer 4: left column, middle row).
    L.documents.append({"id": "hale_file_4", "at": morgue.at(2.6 - 0.93 / 1.2, 0.28 / 1.2), "y": 0.92, "rotation": 8,
                        "appearsWith": "morgue_tommy"})
    # Dr. Venn's theatre notes, on a little table in the corner by the theatre's wall.
    L.prop(morgue, 'sideTable', 6.0, 4.4)
    L.documents.append({"id": "venn_theatre_notes", "at": morgue.at(6.0, 4.4), "y": 0.6, "rotation": 200, "model": "ledger", "height": 0.05})
    L.prop(morgue, 'fluorescent', 2.6, 2.4, height=2.9)
    L.prop(morgue, 'puddle', 4.0, 3.2, width=1.0, depth=0.8)
    L.lockers(morgue, 6.75, 2.2, 3, -90)  # along its east wall, as in the approved still
    # A bulb left burning over the drawers (approved still locker_inside: what you see him by from a locker).
    L.bulb(morgue, 3.4, 1.9, 3.0, intensity=STEADY, distance=8)  # bright enough to steady you, as the boiler room's

    # The theatre (approved stills theatre_nora, cabinet_lock): his table under its lamp, the only
    # light, Nora strapped to it (ai/noraTable.js); his tray; the cabinet with the key to the back door.
    L.prop(theatre, 'operatingTable', 3.5, 3.2, straps=False)
    L.prop(theatre, 'theatreLamp', 3.5, 3.2, height=3.8)
    L.prop(theatre, 'instrumentTray', 4.6, 4.3, -20)
    L.prop(theatre, 'instrumentCabinet', 0.18, 3.0, 90, extra={"id": "theatre_cabinet"}, lock=True)
    # The key on its middle shelf (the cabinet's local (0.15, 1.0, 0.05), turned to face the room).
    L.pickups.append({"id": "theatre_key", "item": "theatre_key", "at": theatre.at(0.18 + 0.05 / 1.2, 3.0 - 0.15 / 1.2), "y": 1.0,
                      "model": "brassKey", "color": "#9aa0a4", "appearsWith": "puzzle_cabinet", "radius": 0.1})
    L.bulb(theatre, 3.5, 5.6, 3.8, lit=False)
    # The back stairs up to the west wing: the flight rises north from the back door.
    L.prop(back_stairs, 'stairs', 1.0, 3.9, 0, extra={"use": "travel", "to": {"level": "wards_ground", "spawn": "theatre_stairs"},
                                                     "prompt": "prompt.stairsUp", "useHeight": 0.9, "useRadius": 0.8}, steps=8, landing=0.6, width=1.5)
    L.bulb(back_stairs, 1.0, 1.6, 3.0, intensity=0.6, distance=4)

    return {
        # Walls 3 m as the approved stills' level, so brick and tile keep their scale.
        "id": "basement", "wing": "basement", "cellSize": 1.2, "wallHeight": 3.0,
        "loudDoors": True,  # "The doors shout down here": drag to ease them (levels/doorDrag.js)
        "floorTexture": "stone", "ceilingTexture": "ceiling",
        "ambient": {"color": "#8a98c8", "intensity": 0.9},
        "legend": {".": "floor", "#": "brick"},
        "map": carve(29, 18, rooms, doors),
        # Spawn cells are cell indices: you stand at their centre (+0.5), here (2.5, 4.8).
        "spawns": {"default": {"cell": [2.0, 4.3], "yawDegrees": 180}, "stairs": {"cell": [2.0, 4.3], "yawDegrees": 180}},
        "rooms": [room.data() for room in rooms], "doors": doors, "triggers": [], "props": L.props, "lights": L.lights,
        "emitters": L.emitters, "pickups": L.pickups, "documents": L.documents,
        "puzzles": {"valves": {"wheels": ["valve_red", "valve_blue", "valve_brass"], "flood": "boiler_flood", "boiler": "boiler"},
                    "morgue": {"drawers": "morgue_drawers", "contents": MORGUE},
                    # Its lock's five keys: the note in the gap of Edith's tune opens it (puzzles/cabinet.js).
                    "cabinet": {"prop": "theatre_cabinet", "gap": "sun"}},
        # Nora on his table (ai/noraTable.js): free, she stands by it; past the back door without her, she is left.
        "nora": {"at": theatre.at(3.5, 3.2), "y": 0.92, "rotation": 0, "room": "theatre", "backDoor": "theatre_back",
                 "beyond": "west_stairs", "standAt": theatre.at(4.6, 2.6), "standRotation": -90},
        # The 12 MAY drawer rolls out on its own, once you have pulled another (ghosts/drawerPiece.js).
        # A story beat: comfort mode keeps it. Its tell: the morgue goes quiet.
        "setPieces": [{"id": "morgue_drawer", "kind": "drawer", "room": "morgue", "requires": "morgue_pulled",
                       "cooldownGroup": "setPiece", "cooldown": 30, "comfort": "keep", "drain": 4,
                       "setup": {"tell": "the morgue goes quiet", "seconds": 3}, "wait": 4,
                       "drawers": "morgue_drawers", "index": 5}],
        # Sam (ghosts/sam.js): in the flood where the still has him; once met he looks to the corridor.
        # His far knocks, and your taps for him, are at the pipes along the corridor and in the boiler room.
        "sam": {"at": boiler.at(2.9, 3.4), "rotation": 15, "room": "boiler_room", "lookTo": [7.5, 9.0],
                "pipes": [[*corridor.at(x, 0.35), 2.25] for x in (2.0, 8.5, 14.5, 20.5)] + [[*boiler.at(4.0, 6.6), 2.9]]},
        # Dr. Venn (ai/surgeon.js): his first crossing, ahead of you at the stairs foot (he cannot
        # catch you then), and his round through every room but the stairs foot and the theatre.
        "surgeon": {
            "territory": ["cold_corridor", "coal_store", "laundry", "founders_door", "boiler_room", "morgue"],
            "intro": {"from": corridor.at(10.5, 1.2), "to": corridor.at(0.6, 1.2)},
            "round": [corridor.at(1.0, 1.0), boiler.at(3.5, 3.0), corridor.at(11.0, 1.0), morgue.at(3.0, 2.5),
                      corridor.at(19.5, 1.0), founders.at(1.5, 1.5), laundry.at(3.0, 2.5), coal.at(3.0, 2.5)],
        },
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
    # Up the theatre's back stairs, the way out (levels/wayUp.js): the same top of the steps.
    d['spawns']['theatre_stairs'] = {"cell": [7.0, 11.7], "yawDegrees": 0}
    # Dr. Venn comes up the stairs after you (ai/surgeon.js "rise"), only on the way out, and hunts the
    # dark wards by ear; his round sweeps the corridor and the rooms off it, the way to the courtyard door.
    d['surgeon'] = {
        "requires": "way_up",
        "territory": ["basement_stairs", "ward_corridor", "ward_a", "childrens_ward", "baths", "day_room", "admissions",
                      "fuse_room", "dispensary", "nurses_station"],
        "rise": {"at": [7.5, 13.9], "seconds": 6},
        "round": [[7.5, 9.0], [16.5, 9.0], [16.5, 13.5], [23.5, 9.0], [30.5, 9.0], [31.0, 13.5], [37.5, 13.0],
                  [30.5, 9.0], [13.5, 4.0], [3.5, 9.0]],
    }
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
