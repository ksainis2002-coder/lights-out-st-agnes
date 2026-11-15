"""Writes src/levels/wards_ground.json (0.4 part A1: the west wing's ground
floor, furnished as the approved stills, with its papers and Nora's radios;
no Sister M., no puzzles yet). Furniture is placed in room-local cell
coordinates: (0, 0) is a room's north-west corner; walls are the lines x = 0,
x = w, z = 0, z = d. Back-to-the-wall props: north wall rotation 0, south
180, west 90, east -90.

The JSON is the game's data; this script is how it was laid out. Change the
layout here and run it again (python3 tools/levels/wards_part_a.py)."""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
MOON, WARM = '#5a6c9c', '#ffd49a'
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
        self.props, self.lights, self.documents = [], [], []

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
        return p

    def many(self, room, rows):
        """Rows of (type, x, z, rotation, options, y)."""
        for type_, x, z, *rest in rows:
            rotation = rest[0] if rest else 0
            options = rest[1] if len(rest) > 1 else {}
            self.prop(room, type_, x, z, rotation, rest[2] if len(rest) > 2 else None, **options)

    def light(self, room, x, z, height, intensity, distance, color=MOON):
        self.lights.append({"type": "point", "at": room.at(x, z), "height": height, "color": color,
                            "intensity": intensity, "distance": distance})

    def lamp(self, room, x, z):
        """A ward lamp, lit: the power is still on in here."""
        self.prop(room, 'hangingBulb', x, z, ceiling=3.4, lit=True)
        self.light(room, x, z, 2.7, 6, 9, WARM)

    def document(self, room, did, x, z, y, rotation=0, **extra):
        doc = {"id": did, "at": room.at(x, z), "y": y, **extra}
        if rotation:
            doc["rotation"] = rotation
        self.documents.append(doc)


def wards():
    L = Level()
    W, H = 41, 18
    rooms = {
        'baths': Room('baths', 1, 1, 6, 6, wall='tile'),
        'ward_a': Room('ward_a', 8, 1, 18, 6),
        'childrens_ward': Room('childrens_ward', 20, 1, 26, 6),
        'dispensary': Room('dispensary', 28, 1, 32, 6),
        'station': Room('nurses_station', 34, 1, 36, 6),
        'stairs': Room('ward_stairs', 38, 1, 39, 6),
        'corridor': Room('ward_corridor', 1, 8, 39, 9),
        'fuse_room': Room('fuse_room', 1, 11, 4, 16),
        'basement_stairs': Room('basement_stairs', 6, 11, 8, 16),
        'day_room': Room('day_room', 10, 11, 23, 16),
        'admissions': Room('admissions', 25, 11, 39, 16),
    }
    cells = [['#'] * W for _ in range(H)]
    for room in rooms.values():
        for r in range(room.r0, room.r1 + 1):
            for c in range(room.c0, room.c1 + 1):
                cells[r][c] = '.'
    doors = [
        {"id": "ward_baths", "cell": [3, 7]}, {"id": "ward_a_west", "cell": [10, 7]}, {"id": "ward_a_east", "cell": [16, 7]},
        {"id": "ward_children", "cell": [23, 7]},
        # Electric locks (the fuse board, part A3): shut while their circuit is dead.
        {"id": "ward_dispensary", "cell": [30, 7], "requires": "power_dispensary", "lockedMessage": "msg.electricLockDead"},
        {"id": "ward_station", "cell": [35, 7]},
        {"id": "ward_stairs_gate", "cell": [38, 7], "look": "gate", "requires": "power_stairs", "lockedMessage": "msg.stairsGateDead"},
        {"id": "ward_fuse", "cell": [2, 10]},
        {"id": "ward_basement", "cell": [7, 10], "look": "gate", "requires": "basement_open", "lockedMessage": "msg.basementGateLocked"},
        {"id": "ward_day", "cell": [16, 10]}, {"id": "ward_admissions", "cell": [30, 10]},
        {"id": "ward_courtyard", "cell": [40, 13], "exit": {"level": "grounds", "spawn": "west_wing_door", "prompt": "prompt.toCourtyard"}},
    ]
    for door in doors:
        c, r = door["cell"]
        cells[r][c] = '.'
    bat, wa, ch, dis, sta, cor, fus, day, adm = (rooms[k] for k in (
        'baths', 'ward_a', 'childrens_ward', 'dispensary', 'station', 'corridor', 'fuse_room', 'day_room', 'admissions'))

    # Admissions: the desk and its book, pigeonholes, the plan, a radio; the courtyard door in the east wall.
    desk = (9.0, 2.2)
    L.many(adm, [
        ('pedestalDesk', *desk), ('chair', 9.0, 1.5), ('typewriter', 9.35, 2.25, 185, {}, 0.79), ('deskLamp', 8.5, 2.1, 200, {"lit": False}, 0.79),
        ('pigeonholes', 8.2, 0), ('mapBoard', 10.8, 0), ('wallClock', 5.6, 0), ('crucifix', 9.5, 0, 0, {"height": 2.3}), ('noticeBoard', 6.8, 0),
        ('peeledPaper', 12.4, 0, 0, {"seed": 2}), ('peeledPaper', 3.4, 0, 0, {"seed": 7}),
        ('recordsCabinet', 0.3, 1.2, 90), ('recordsCabinet', 0.3, 1.8, 90), ('recordsCabinet', 0.3, 2.4, 90),
        ('bench', 2.6, 5.8, 180, {"length": 2.6}), ('bench', 8.6, 5.8, 180, {"length": 2.6}),
        ('barredWindow', 4.2, 6, 180), ('barredWindow', 7.0, 6, 180), ('barredWindow', 11.4, 6, 180),
        ('papers', 8.2, 3.3, 40, {"count": 7}), ('papers', 10.4, 2.9, 110, {"count": 5}), ('papers', 6.6, 2.2, 0, {"count": 6}),
        ('chair', 7.9, 3.6, 70, {"toppled": True}), ('hatStand', 13.9, 0.5), ('umbrellaStand', 14.5, 4.0),
        ('stretcher', 12.2, 4.6, 70), ('sheetPile', 11.0, 5.0), ('rug', 9.0, 2.4, 0, {"width": 2.6, "depth": 1.8}),
        ('hangingBulb', 7.5, 3.0, 0, {"ceiling": 3.4}),
    ])
    L.prop(adm, 'radioSet', 9.5, 2.05, 170, lift=0.79, extra={"id": "radio_admissions"}, lit=True)
    L.prop(adm, 'cutChain', 14.2, 2.2, 200, extra={"solid": False})  # Nora dragged the rest of it in with her
    L.document(adm, 'admissions_book', 8.85, 2.3, 0.79, 20, model='ledger', height=0.05)
    L.document(adm, 'nora_note', 15 - 0.035 / 1.2, 3.4, 1.45, -90, upright=True)
    L.light(adm, 9.6, 1.9, 1.1, 1.4, 4, '#ffb050')  # the radio's dial
    L.light(adm, 4.0, 5.2, 2.2, 1.8, 7)
    L.light(adm, 11.4, 5.2, 2.2, 1.8, 7)

    # Day room: armchairs turned to the television (dead until the camcorder is taken, part B).
    L.prop(day, 'television', 11.4, 0.9, -15, extra={"id": "day_tv"})
    L.many(day, [
        ('rug', 9.4, 2.4, 0, {"width": 3, "depth": 2.2}), ('armchair', 8.2, 2.2, 125), ('armchair', 9.4, 2.9, 165),
        ('armchair', 10.8, 2.7, 200), ('armchair', 12.4, 1.5, 250), ('sideTable', 7.2, 1.3), ('tinPlate', 7.2, 1.3, 0, {}, 0.6),
        ('wheelchair', 12.6, 4.4, 200), ('bookshelf', 13.82, 3.4, -90, {"length": 2, "seed": 5}), ('radiator', 6.0, 6, 180, {"width": 1.4}),
        ('table', 2.6, 2.6, 20), ('chair', 2.4, 1.9, 10), ('chair', 3.2, 3.4, 200, {"toppled": True}), ('papers', 2.6, 2.6, 0, {"count": 5}, 0.76),
        ('papers', 10.0, 4.2, 80, {"count": 6}), ('blocks', 8.8, 1.6), ('saintPicture', 3.4, 0), ('peeledPaper', 1.6, 0, 0, {"seed": 9}),
        ('wallClock', 0, 3.2, 90), ('sheetPile', 11.6, 3.4), ('hatStand', 13.4, 5.5), ('barredWindow', 3.4, 6, 180),
        ('barredWindow', 8.4, 6, 180), ('barredWindow', 11.2, 6, 180), ('hangingBulb', 6.5, 3.0, 0, {"ceiling": 3.4}),
    ])
    L.prop(day, 'sideTable', 5.0, 0.5)
    L.prop(day, 'radioSet', 5.0, 0.5, 10, lift=0.6, extra={"id": "radio_day"}, lit=True)
    L.light(day, 5.1, 0.9, 0.9, 1.4, 4, '#ffb050')
    L.light(day, 3.4, 5.2, 2.2, 1.8, 7)
    L.light(day, 10.0, 5.2, 2.2, 1.8, 7)

    # Fuse room: the board (puzzle 1, part A3) on the south wall.
    L.prop(fus, 'fuseBoard', 2.0, 6, 180, extra={"id": "fuse_board"}, fuses=[3])
    L.many(fus, [
        ('handprints', 3.2, 6, 180), ('wallScratches', 0.8, 6, 180, {"seed": 6}), ('peeledPaper', 0, 2.4, 90, {"seed": 3}),
        ('linenShelves', 4, 3.4, -90, {"length": 1.4, "seed": 4}), ('radiator', 0, 4.0, 90), ('bucketMop', 0.5, 5.5, 30),
        ('laundryBasket', 0.6, 2.9), ('trolley', 3.4, 5.3, 100), ('chair', 3.2, 1.6, 250, {"toppled": True}),
        ('papers', 2.2, 4.2, 30, {"count": 5}), ('puddle', 1.6, 3.0), ('hangingBulb', 2.0, 3.6, 0, {"ceiling": 3.4}),
    ])
    L.light(fus, 2.0, 3.0, 2.4, 1.4, 5)

    # Baths: two tubs, a drain, tiles to the ceiling.
    L.many(bat, [
        ('bathtub', 1.5, 0.6), ('bathtub', 4.3, 0.6), ('floorDrain', 3.0, 2.6), ('duckboard', 2.9, 1.7),
        ('towelRail', 0, 2.4, 90), ('towelRail', 2.9, 0, 0, {"count": 2}), ('sink', 6, 3.2, -90), ('mirror', 6, 3.2, -90),
        ('wheelchair', 2.9, 1.2, 170), ('dripStand', 5.4, 0.7), ('laundryBasket', 0.6, 1.6), ('sheetPile', 1.8, 3.0),
        ('tileDecay', 2.9, 0, 0, {"width": 1.8, "height": 1.3, "y": 1.7, "seed": 4}), ('tileDecay', 5.0, 0, 0, {"width": 1.2, "height": 0.9, "y": 0.9, "seed": 9}),
        ('fallenTiles', 3.0, 0.5, 0, {"seed": 3}), ('fallenTiles', 4.9, 1.5, 0, {"seed": 6}), ('handprints', 1.0, 0),
        ('chair', 4.4, 3.6, 30, {"toppled": True}), ('puddle', 4.0, 2.4), ('puddle', 2.2, 4.2, 0, {"width": 1.3, "depth": 0.8}),
        ('bucketMop', 5.5, 5.3, 200), ('hangingBulb', 3.0, 3.0, 0, {"ceiling": 3.4}),
    ])
    L.light(bat, 3.0, 3.0, 2.4, 1.5, 6)

    # Ward A: ten beds, charts at their feet, every lamp on, the rule on the west wall.
    north = [0.95 + 1.84 * i for i in range(6)]
    for i, x in enumerate(north):
        L.prop(wa, 'wardBed', x, 0.87, 0, number=i + 1, unmade=i == 3, straps=i == 4)
    for i, x in enumerate([1.0, 4.6, 6.5, 10.0]):
        L.prop(wa, 'wardBed', x, 5.13, 180, number=i + 7, unmade=i == 1, straps=i == 2)
    L.prop(wa, 'wallSign', 0, 3.0, 90, extra={"id": "lights_out_sign", "sign": "sign.lightsOut", "use": "message",
                                               "message": "msg.lightsOutSign", "prompt": "prompt.look", "useHeight": 2.3})
    L.many(wa, [
        ('barredWindow', 1.9, 0), ('barredWindow', 5.55, 0), ('barredWindow', 9.2, 0), ('bedsideCupboard', 1.9, 0.3), ('bedsideCupboard', 7.4, 0.3),
        ('foldingScreen', 8.3, 4.6, 80), ('trolley', 5.6, 3.1, 20), ('dripStand', 3.6, 0.5), ('sheetPile', 5.4, 4.4), ('papers', 3.0, 3.2, 30, {"count": 5}),
        ('chair', 7.8, 2.9, 300, {"toppled": True}), ('wheelchair', 10.3, 3.3, 250), ('peeledPaper', 11, 2.2, -90, {"seed": 5}),
    ])
    for x in (2.0, 5.5, 9.0):
        L.lamp(wa, x, 3.0)

    # Children's ward: seven small beds, bed 4 stripped; Edith's place is bed 7 (part A2).
    for i, z in enumerate([0.8, 1.95, 3.1, 4.25]):
        L.prop(ch, 'wardBed', 0.85, z, 90, number=i + 1, small=True, unmade=i == 3)
    for i, z in enumerate([0.8, 1.95, 3.1]):
        L.prop(ch, 'wardBed', 6.15, z, -90, number=i + 5, small=True)
    L.many(ch, [
        ('barredWindow', 2.4, 0, 0, {"width": 0.9, "height": 1.5}), ('barredWindow', 4.6, 0, 0, {"width": 0.9, "height": 1.5}),
        ('toyBox', 3.5, 0.4), ('childChair', 2.6, 1.3, 40), ('clothes', 2.6, 1.3, 40, {"hung": True}), ('toyTrain', 3.0, 2.5, 30), ('blocks', 4.2, 1.8),
        ('shoes', 1.7, 1.0, 80), ('shoes', 5.3, 2.1, -100, {"colour": "#4a2a20"}), ('teddy', 6.4, 0.8, -90, {}, 0.5),
        ('drawing', 1.5, 0, 0, {"kind": "house"}), ('drawing', 3.5, 0, 0, {"kind": "sun"}), ('drawing', 5.6, 0, 0, {"kind": "house"}),
        ('crucifix', 3.5, 0, 0, {"height": 2.9}), ('sheetPile', 1.9, 4.5), ('washstand', 7, 4.6, -90), ('foldingScreen', 5.4, 5.0, 20),
        ('papers', 3.4, 3.6, 50, {"count": 4}), ('hangingBulb', 3.5, 2.6, 0, {"ceiling": 3.4}),
    ])
    for did, x, z, rot in [('chart_dunn', 1.6, 1.95, 90), ('chart_rowe', 1.6, 4.25, 90), ('chart_lacey', 5.4, 0.8, -90), ('chart_carr', 5.4, 3.1, -90)]:
        L.document(ch, did, x, z, 0.5, rot)
    L.light(ch, 2.4, 1.0, 2.2, 1.6, 6)
    L.light(ch, 4.6, 1.0, 2.2, 1.6, 6)

    # Dispensary (behind its electric lock until part A3): the locked cabinet and its card.
    L.prop(dis, 'medicineCabinet', 2.5, 0, 0, extra={"id": "medicine_cabinet"})
    L.many(dis, [
        ('table', 2.5, 0.45), ('papers', 2.8, 0.5, 0, {}, 0.76), ('cabinet', 0.2, 1.4, 90), ('cabinet', 0.2, 2.2, 90), ('wallClock', 1.1, 0),
        ('recordsCabinet', 4.6, 0.3, 0, {"lock": False}), ('sink', 5, 2.8, -90), ('scales', 0.5, 0.5, 30), ('dripStand', 1.5, 0.6),
        ('trolley', 3.9, 1.6, 30), ('trolley', 1.4, 3.4, 300), ('foldingScreen', 0.9, 4.6, 70), ('chair', 3.8, 4.3, 200, {"toppled": True}),
        ('papers', 2.0, 1.8, 60, {"count": 6}), ('papers', 3.4, 2.6, 10, {"count": 4}), ('fallenTiles', 3.2, 0.9, 0, {"seed": 4}),
        ('peeledPaper', 3.9, 0, 0, {"seed": 4}), ('puddle', 3.4, 3.2, 0, {"width": 0.7, "depth": 0.5}), ('hangingBulb', 2.5, 3.0, 0, {"ceiling": 3.4}),
    ])
    L.document(dis, 'night_round', 3.5, 0.035 / 1.2, 1.5, 0, upright=True)
    L.light(dis, 2.5, 3.0, 2.4, 1.4, 6)

    # Nurses' station: the tape recorder by a warm lamp, the night book, the call board, a door home.
    L.prop(sta, 'table', 1.0, 0.5)
    L.prop(sta, 'tapeRecorder', 0.8, 0.5, 0, lift=0.76, extra={"use": "save", "id": "recorder_wards", "mapAt": sta.at(1.0, 1.0)})
    L.prop(sta, 'deskLamp', 1.35, 0.4, -20, lift=0.76, lit=True)
    L.prop(sta, 'hubDoorway', 3, 4.5, -90, extra={"id": "home_wards", "use": "travel", "prompt": "prompt.goHome",
                                                  "to": {"level": "patient_room", "spawn": "door", "back": "home_wards"},
                                                  "useHeight": 1.2, "useRadius": 0.8})
    L.many(sta, [
        ('chair', 1.0, 1.2, 180), ('callBoard', 0, 2.6, 90), ('notice', 2.2, 0), ('wallClock', 0, 4.4, 90),
        ('recordsCabinet', 2.7, 0.35, 0, {"lock": False}), ('papers', 1.6, 2.6, 20, {"count": 5}), ('bench', 0.2, 4.6, 90, {"length": 1.6}),
    ])
    L.document(sta, 'night_book', 1.15, 0.6, 0.76, -15, model='ledger', height=0.05)
    L.light(sta, 1.3, 0.8, 1.2, 2.2, 6, WARM)

    # The main corridor: what was left where it stood.
    L.many(cor, [
        ('wheelchair', 7.2, 0.6, -50), ('bench', 12.5, 1.82, 180, {"length": 2.4}), ('stretcher', 20.5, 1.45, 90), ('trolley', 27.5, 0.4, 10),
        ('bench', 31.5, 1.82, 180, {"length": 2.4}), ('papers', 15.0, 1.0, 20, {"count": 6}), ('papers', 24.0, 0.8, 70, {"count": 5}),
        ('papers', 34.0, 1.2, 0, {"count": 4}), ('dripStand', 4.5, 1.6), ('sheetPile', 36.5, 1.5), ('chair', 18.5, 0.5, 100, {"toppled": True}),
        ('peeledPaper', 13.5, 0, 0, {"seed": 1}), ('peeledPaper', 26.2, 2, 180, {"seed": 8}), ('radiator', 5.0, 2, 180), ('radiator', 22.0, 0),
        ('puddle', 10.0, 1.0), ('laundryBasket', 38.4, 0.5),
    ])
    for x in (4.0, 13.0, 21.0, 29.0, 37.0):
        L.prop(cor, 'hangingBulb', x, 1.0, ceiling=3.4)
    for x in (8.0, 20.0, 32.0):
        L.light(cor, x, 1.0, 2.4, 1.3, 9)

    hum = {"name": "amb_building_hum", "volume": 0.3}
    rain = {"name": "amb_rain_inside", "volume": 0.3}
    out_rooms = []
    for room in rooms.values():
        data = room.data()
        data["ambience"] = [rain, hum] + ([{"name": "amb_wind_corridor", "volume": 0.2}] if room.id == 'ward_corridor' else [])
        out_rooms.append(data)

    return {
        "id": "wards_ground", "wing": "wards", "cellSize": 1.2, "wallHeight": 3.4,
        "floorTexture": "floor", "ceilingTexture": "ceiling",
        "ambient": {"color": "#8a98c8", "intensity": 0.8},
        "legend": {".": "floor", "#": "wardWall"},
        "map": [''.join(r) for r in cells],
        "spawns": {"default": {"cell": [38, 13], "yawDegrees": 90}, "courtyard_door": {"cell": [38, 13], "yawDegrees": 90},
                   "home_wards": {"cell": [35.4, 5], "yawDegrees": 90}},
        "rooms": out_rooms, "doors": doors, "triggers": [], "props": L.props, "lights": L.lights,
        "ambience": [rain],
        "emitters": [{"sound": "hospital_drip", "at": bat.at(4.3, 0.6), "height": 0.5, "volume": 0.5, "distance": 3,
                      "every": [4, 11], "room": "baths"}],
        "pickups": [], "documents": L.documents,
        # Nora's voice on the valve radios (levels/radios.js): once each, when you come near.
        "radios": [{"id": "radio_admissions", "at": adm.at(9.5, 2.05), "hear": 3.6, "lines": ["nora.admissions.1", "nora.admissions.2"]},
                   {"id": "radio_day", "at": day.at(5.0, 0.5), "hear": 3.6, "lines": ["nora.dayRoom"]}],
        "weather": {"storm": "puzzle_records"},
    }


def courtyard_door():
    """The west wing's door in the courtyard: chained until the school is done, then open, its chain cut on the step."""
    path = os.path.join(ROOT, 'grounds.json')
    d = json.load(open(path))
    use = {"useHeight": 1.2, "useRadius": 0.8}
    done = {"flag": "wing_school_done"}
    props = [p for p in d['props'] if not (p['type'] in ('facadeDoor', 'cutChain') and p['at'][0] < 3 and 17.5 < p['at'][1] < 19.5)]
    props += [
        {"type": "facadeDoor", "at": [1, 18.5], "rotation": 90, "use": "message", "message": "msg.westWingChained",
         "chained": True, "until": done, **use},
        {"type": "facadeDoor", "at": [1, 18.5], "rotation": 90, "id": "west_wing_door", "use": "travel", "after": done,
         "to": {"level": "wards_ground", "spawn": "courtyard_door"}, "prompt": "prompt.toWestWing", **use},
        {"type": "cutChain", "at": [1.55, 18.65], "rotation": 110, "solid": False, "id": "cut_chain", "use": "message",
         "message": "msg.chainCut", "prompt": "prompt.look", "useHeight": 0.2, "useRadius": 0.5, "after": done},
    ]
    d['props'] = props
    d['spawns']['west_wing_door'] = {"cell": [1, 18], "yawDegrees": -90}
    with open(path, 'w') as f:
        f.write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('west wing door in the courtyard')


def write(name, data):
    with open(os.path.join(ROOT, name), 'w') as f:
        f.write(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    print('wrote', name, len(data['props']), 'props')


write('wards_ground.json', wards())
courtyard_door()
