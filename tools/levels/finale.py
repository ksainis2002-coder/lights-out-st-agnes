"""Part C's changes to the grounds and your room (0.5; the wing 4 content sheet):
coming out of the west wing on the way out, the courtyard's line, "The front
gate, or my room."; the front gate, which then opens and ends the game (Escape:
cutscenes/ending.js); your room's last change, your wooden horse on the pillow,
and its line.

Edits grounds.json and patient_room.json, so run it after anything that writes
them afresh (chapel.py and the scripts before it): python3 tools/levels/finale.py"""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
WAY_UP = {"flag": "way_up"}  # up the theatre's back stairs (levels/wayUp.js)


def grounds():
    path = os.path.join(ROOT, 'grounds.json')
    d = json.load(open(path))
    arrivals = [a for a in (d.get('arrivals') or []) if a['message'] != 'msg.gateOrRoom']
    d['arrivals'] = arrivals + [{"after": WAY_UP, "message": "msg.gateOrRoom"}]
    for door in d['doors']:
        if door['id'] == 'front_gate':
            door['ending'] = {"kind": "escape", "after": WAY_UP['flag'], "prompt": "prompt.openGate"}
    with open(path, 'w') as f:
        f.write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('the grounds: the way out')


def your_room():
    """Your room's last change (approved still room_last): the bed made, your wooden horse on the pillow."""
    path = os.path.join(ROOT, 'patient_room.json')
    d = json.load(open(path))
    d['props'] = [p for p in d['props'] if p.get('id') != 'hub_horse'] + [
        {"type": "toyHorse", "at": [1.62, 1.3], "y": 0.565, "rotation": 20, "id": "hub_horse", "after": WAY_UP}]
    arrivals = [a for a in (d.get('arrivals') or []) if a['message'] != 'msg.roomLast']
    d['arrivals'] = arrivals + [{"after": WAY_UP, "message": "msg.roomLast"}]
    with open(path, 'w') as f:
        f.write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('your room: its last change')


grounds()
your_room()
