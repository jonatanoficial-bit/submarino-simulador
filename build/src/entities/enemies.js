export function createEnemies() {
  return [
    { id: 1, x: 650, y: 180, hp: 3, type: 'Destroyer', speed: 1.0, heading: Math.PI, noise: 45, detected: false },
    { id: 2, x: 780, y: 360, hp: 2, type: 'Cargo Ship', speed: 0.7, heading: Math.PI, noise: 30, detected: false },
    { id: 3, x: 560, y: 430, hp: 2, type: 'Escort', speed: 0.9, heading: Math.PI, noise: 38, detected: false }
  ];
}
