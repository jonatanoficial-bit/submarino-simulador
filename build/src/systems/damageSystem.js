export function applyOperationalStress(player, log) {
  if (player.depth > 180 && Math.random() < 0.01) {
    player.systems.hull.health = Math.max(0, player.systems.hull.health - 4);
    log('Profundidade excessiva causando estresse no casco.', 'bad');
  }
  if (player.speed >= 5 && Math.random() < 0.006) {
    player.systems.engine.health = Math.max(0, player.systems.engine.health - 3);
    log('Motores superaquecendo sob alta rotação.', 'warn');
  }
}

export function getSystemStatus(health) {
  if (health >= 75) return 'good';
  if (health >= 40) return 'warn';
  return 'bad';
}
