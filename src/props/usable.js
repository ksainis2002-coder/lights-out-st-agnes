// Props that do something when used, named by a "use" field in level data:
//   { "type": "tapeRecorder", "at": [...], "use": "save" }
import * as THREE from 'three';

const USES = {
  save: { prompt: 'prompt.save', run: (game) => game.openScreen('save') },
};

export function propInteractables(game, level) {
  return level.props.filter((prop) => USES[prop.use]).map((prop) => {
    const action = USES[prop.use];
    return {
      position: new THREE.Vector3(prop.at[0] * level.cellSize, (prop.y ?? 0) + 0.1, prop.at[1] * level.cellSize),
      radius: 0.3,
      prompt: () => ({ key: action.prompt }),
      use: () => action.run(game),
    };
  });
}
