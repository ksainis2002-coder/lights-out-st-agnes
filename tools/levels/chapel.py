"""Writes src/levels/chapel.json and src/levels/chapel_crypt.json (0.5 part A:
the chapel and its crypt; approved stills chapel, statue_whole, crypt and the
wing 4 content sheet), and opens the chapel on the grounds once wing 3 is done.

The chapel: St. Agnes on her plinth before the altar, facing the pews; she
moves only while nobody looks (ai/watcher.js, "pieces": you give her back her
hand, palm, lamb and heart there, ai/agnesPieces.js). Pews, two racks of
votive candles, the font, the board of benefactors, tall windows; behind the
altar, in its north-east corner, the steps down to the crypt. The door is in
the west wall at the back, so that when she is whole and turns to face it,
she turns.

The crypt: five memorial plaques in the north wall, out of the roll's order;
pushed in the order the roll struck the children off, the niche beside them
opens on her stone heart (puzzles/plaques.js).

The JSON is the game's data; this script is how it was laid out. Change the
layout here and run it again (python3 tools/levels/chapel.py). It also edits
grounds.json, so run it after anything that writes the grounds afresh
(school_part_a.py, wards_part_a.py)."""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
MOON, CANDLE = '#6a78a8', '#ffb070'
WINGS_DONE = {"flag": "wing_wards_done"}
CALM = "agnes_whole"  # she is whole: the rain stops for good (levels/calm.js)
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
        self.props, self.lights, self.pickups = [], [], []

    def prop(self, room, type_, x, z, rotation=0, extra=None, **options):
        p = {"type": type_, "at": room.at(x, z)}
        if rotation:
            p["rotation"] = r3(rotation)
        if options:
            p["options"] = options
        if extra:
            p.update(extra)
        self.props.append(p)

    def light(self, room, x, z, height, intensity, distance, color=MOON):
        self.lights.append({"type": "point", "at": room.at(x, z), "height": height, "color": color,
                            "intensity": intensity, "distance": distance})


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


def look(message, at=None, height=1.0, radius=0.6):
    """A thing to look at: its line every time (props/usable.js "look" with a "message")."""
    use = {"use": "look", "message": message, "useHeight": height, "useRadius": radius}
    if at:
        use["useAt"] = at
    return use


def chapel():
    L = Level()
    nave = Room('chapel_nave', 1, 1, 7, 13, height=7.0, wall='wallStone', floor='stone', ceiling='wallStone',
                well=[6, 1, 7, 2],  # the steps down to the crypt, behind the altar
                ambience=[{"name": "amb_rain_inside", "volume": 0.3}, {"name": "amb_building_hum", "volume": 0.2}])
    doors = [{"id": "chapel_door", "cell": [0, 12], "exit": {"level": "grounds", "spawn": "chapel_door", "prompt": "prompt.toCourtyard"}}]

    # The altar, St. Agnes's plinth before it (she is the watcher: ai/watcher.js places her), the pews.
    L.prop(nave, 'altar', 3.5, 1.9, 0, extra={"id": "chapel_altar", **look("msg.chapelAltar", height=1.1)})
    for z in (6.0, 7.2, 8.4, 9.6, 10.8):
        L.prop(nave, 'pew', 1.75, z, 180, length=2.6)
        L.prop(nave, 'pew', 5.25, z, 180, length=2.6)
    L.prop(nave, 'votiveRack', 0.6, 4.2, 90, lit=4)
    L.prop(nave, 'votiveRack', 6.4, 4.2, -90, lit=3)
    L.prop(nave, 'font', 5.9, 12.2, 0, extra={"id": "chapel_font", **look("msg.chapelFont", height=0.9)})
    L.prop(nave, 'benefactorsBoard', 7, 11.0, -90, extra={"id": "chapel_board", **look("msg.chapelBoard", height=1.6)})
    for z in (5.4, 9.0):
        L.prop(nave, 'windowFrame', 0, z, 90)
        L.prop(nave, 'windowFrame', 7, z, -90)
    # The steps down, in the corner behind the altar: look down them to go down.
    L.prop(nave, 'stairHead', 6.0, 2.0, 0, extra={"use": "travel", "to": {"level": "chapel_crypt", "spawn": "stairs"},
                                                   "prompt": "prompt.stairsDown", "line": "msg.cryptSteps", "useAt": nave.at(6.0, 2.4), "useHeight": 0.6,
                                                   "useRadius": 0.8}, width=1.9, steps=7)

    # As the approved still "chapel": what little comes through the windows, the candles on her and the altar.
    L.light(nave, 3.5, 7.0, 5.5, 4.0, 14)
    L.light(nave, 3.5, 3.4, 2.0, 3.5, 8, CANDLE)
    L.light(nave, 0.9, 4.2, 1.2, 1.2, 4, CANDLE)
    L.light(nave, 6.1, 4.2, 1.2, 1.0, 4, CANDLE)
    L.light(nave, 1.0, 11.5, 2.4, 1.0, 5)  # by the door

    return {
        # Walls 3 m as the still's level, so the nave's 7 m tiles its stone instead of stretching it.
        "id": "chapel", "wing": "chapel", "cellSize": 1.2, "wallHeight": 3.0,
        "floorTexture": "stone", "ceilingTexture": "wallStone",
        "ambient": {"color": "#8a98c8", "intensity": 0.9},
        "legend": {".": "floor", "#": "wallStone"},
        "map": carve(9, 15, [nave], doors),
        # Spawn cells are cell indices: you stand at their centre (+0.5).
        "spawns": {"default": {"cell": [1.0, 12.0], "yawDegrees": -20}, "door": {"cell": [1.0, 12.0], "yawDegrees": -20},
                   "crypt": {"cell": [6.1, 3.3], "yawDegrees": 95}},  # up from the crypt, facing her
        "rooms": [nave.data()], "doors": doors, "triggers": [], "props": L.props, "lights": L.lights,
        "pickups": [], "documents": [],
        "arrivals": [{"after": WINGS_DONE, "message": "msg.agnesFirstLook"}],
        "weather": {"storm": "puzzle_records"},
        # She hunts the nave from her plinth until she is whole; then she stands there for good,
        # turned to the door ("whole": that rotation). ai/watcher.js, ai/agnesPieces.js.
        "watcher": {"territory": ["chapel_nave"], "spawns": [[4.5, 4.0]], "pieces": True,
                    "still": [{"at": [4.5, 4.0], "rotation": -25, "after": CALM}], "whole": -25},
    }


def crypt():
    L = Level()
    room = Room('crypt', 1, 1, 8, 4, height=2.6, wall='wallStone', floor='stone', ceiling='stone',
                ambience=[{"name": "amb_building_hum", "volume": 0.25}])
    stairs = Room('crypt_stairs', 1, 5, 2, 7, height=2.6, wall='wallStone', floor='stone', ceiling='stone')
    # The plaques on the north wall, out of the roll's order (the puzzle is the roll's order).
    wall = [('plaque_sam', 'SAMUEL PIKE', 10), ('plaque_agnes', 'AGNES', None), ('plaque_edith', 'EDITH CARR', 7),
            ('plaque_tommy', 'THOMAS HALE', 9), ('plaque_maggie', 'MARGARET ROWE', 8)]
    for i, (pid, name, age) in enumerate(wall):
        x = 1.0 + i * 0.95
        options = {"name": name, **({"age": age} if age else {})}
        L.prop(room, 'memorialPlaque', x, 0, 0, extra={"id": pid, "useAt": room.at(x, 0.15), "useHeight": 1.25, "useRadius": 0.28}, **options)
    L.prop(room, 'cryptCarving', 2.9, 0, 0)  # THOSE WHO HAVE LEFT US, over them
    L.prop(room, 'cryptNiche', 6.35, 0, 0, extra={"id": "crypt_niche"}, heart=False)
    L.prop(room, 'nicheSlab', 6.35, 0, 0, extra={"id": "niche_slab"})  # grinds aside once open (puzzles/plaques.js)
    L.prop(room, 'votiveRack', 7.4, 2.6, -90, lit=2)
    L.pickups.append({"id": "crypt_heart", "item": "stone_heart", "at": room.at(6.35, 0.2), "y": 1.06, "model": "stoneHeart",
                      "appearsWith": "puzzle_plaques", "radius": 0.2})
    # The steps back up, at the south-west.
    L.prop(stairs, 'stairs', 1.0, 0.0, 180, extra={"use": "travel", "to": {"level": "chapel", "spawn": "crypt"},
                                                    "prompt": "prompt.stairsUp", "useHeight": 0.9, "useRadius": 0.8},
           steps=8, landing=0.6)
    L.light(room, 5.9, 1.0, 1.0, 2.0, 5, CANDLE)  # a candle left before the niche
    L.light(room, 3.0, 1.8, 2.2, 0.9, 6)
    return {
        "id": "chapel_crypt", "wing": "chapel", "cellSize": 1.2, "wallHeight": 3.0,
        "floorTexture": "stone", "ceilingTexture": "stone",
        "ambient": {"color": "#6a7090", "intensity": 0.7},
        "legend": {".": "floor", "#": "wallStone"},
        "map": carve(10, 9, [room, stairs], []),
        "spawns": {"default": {"cell": [1.5, 3.7], "yawDegrees": -30}, "stairs": {"cell": [1.5, 3.7], "yawDegrees": -30}},
        "rooms": [room.data(), stairs.data()], "doors": [], "triggers": [], "props": L.props, "lights": L.lights,
        "pickups": L.pickups, "documents": [],
        "puzzles": {"plaques": {"plaques": ["plaque_agnes", "plaque_tommy", "plaque_maggie", "plaque_sam", "plaque_edith"],
                                "slab": "niche_slab", "hintAfter": 2,
                                "hint": "whisper.tommy.plaques", "tommy": "plaque_tommy"}},
    }


def chapel_door():
    """The chapel on the grounds: the keyhole until wing 3 is done, then a door in; St. Agnes gone
    from its step (she is inside now); the rain on the grounds stops once she is whole."""
    path = os.path.join(ROOT, 'grounds.json')
    d = json.load(open(path))
    use = {"useHeight": 1.2, "useRadius": 0.8}
    at_door = lambda p: p['type'] == 'facadeDoor' and abs(p['at'][0] - 6.5) < 0.1 and abs(p['at'][1] - 21) < 0.1
    props = [p for p in d['props'] if not at_door(p)]
    props += [
        {"type": "facadeDoor", "at": [6.5, 21], "rotation": 180, "use": "message", "message": "msg.chapelKeyhole",
         "prompt": "prompt.keyhole", "until": WINGS_DONE, **use},
        {"type": "facadeDoor", "at": [6.5, 21], "rotation": 180, "id": "chapel_door", "use": "travel", "after": WINGS_DONE,
         "to": {"level": "chapel", "spawn": "door"}, "prompt": "prompt.toChapel", **use},
    ]
    for p in props:
        if p['type'] == 'rain':
            p['until'] = {"flag": CALM}
    d['props'] = props
    d['spawns']['chapel_door'] = {"cell": [6.0, 19.1], "yawDegrees": 0}  # you stand at the cell's centre: (6.5, 19.6)
    for still in d['watcher']['still']:
        if still.get('afterTaken') == 'agnes_lamb':
            still['until'] = WINGS_DONE['flag']
    with open(path, 'w') as f:
        f.write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('the chapel door on the grounds')


def write(name, data):
    with open(os.path.join(ROOT, name), 'w') as f:
        f.write(json.dumps(data, indent=1, ensure_ascii=False) + '\n')
    print('wrote', name, len(data['props']), 'props')


write('chapel.json', chapel())
write('chapel_crypt.json', crypt())
chapel_door()
