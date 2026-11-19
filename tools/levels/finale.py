"""Part C's changes to the grounds (0.5; the wing 4 content sheet): coming out of
the west wing on the way out, the courtyard's line, "The front gate, or my room."

Edits grounds.json, so run it after anything that writes the grounds afresh
(chapel.py and the scripts before it): python3 tools/levels/finale.py"""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'levels')
WAY_UP = {"flag": "way_up"}  # up the theatre's back stairs (levels/wayUp.js)


def grounds():
    path = os.path.join(ROOT, 'grounds.json')
    d = json.load(open(path))
    arrivals = [a for a in (d.get('arrivals') or []) if a['message'] != 'msg.gateOrRoom']
    d['arrivals'] = arrivals + [{"after": WAY_UP, "message": "msg.gateOrRoom"}]
    with open(path, 'w') as f:
        f.write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
    print('the grounds: the way out')


grounds()
