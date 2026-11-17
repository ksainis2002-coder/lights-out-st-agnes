// The calm before the finale (the brief, wing 4: "dead calm"). Once St.
// Agnes is whole (flag agnes_whole, ai/agnesPieces.js) the rain stops for
// good, inside and out, and the storm with it: levels/storm.js strikes no
// more, audio/gameAudio.js drops every rain bed, the grounds' rain is gone
// (its "until" in the level data).
export const CALM = 'agnes_whole';

export const isCalm = (progress) => progress.hasFlag(CALM);

// An ambience bed that is the rain (amb_rain_inside, amb_rain_outside).
export const isRain = (entry) => (typeof entry === 'string' ? entry : entry.name).startsWith('amb_rain');
