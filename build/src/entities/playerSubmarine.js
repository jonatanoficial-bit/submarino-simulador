export function createPlayerSubmarine(loadout = {}) {
  return {
    x: 200,
    y: 270,
    heading: 0,
    speed: 3,
    targetDepth: 40,
    depth: 40,
    submerged: true,
    battery: loadout.battery ?? 100,
    diesel: loadout.diesel ?? 100,
    torpedoes: loadout.torpedoes ?? 6,
    noise: 20,
    hullIntegrity: 100,
    systems: {
      hull: { health: 100, repairing: false, progress: 0, priority: 1 },
      engine: { health: 100, repairing: false, progress: 0, priority: 2 },
      sonar: { health: 100, repairing: false, progress: 0, priority: 3 },
      torpedo: { health: 100, repairing: false, progress: 0, priority: 4 }
    }
  };
}
