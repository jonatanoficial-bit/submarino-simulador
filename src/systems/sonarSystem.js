function bearingToText(radians) {
  const degrees = ((radians * 180 / Math.PI) + 360) % 360;
  if (degrees >= 315 || degrees < 45) return 'E';
  if (degrees < 135) return 'S';
  if (degrees < 225) return 'W';
  return 'N';
}

export function scanContacts(player, enemies) {
  const sonarPenalty = player.systems.sonar.health < 50 ? 0.55 : 1;
  return enemies
    .filter((enemy) => enemy.hp > 0)
    .map((enemy) => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.hypot(dx, dy);
      const signal = Math.max(0, (enemy.noise - player.noise * 0.25) * sonarPenalty - distance * 0.06);
      if (signal <= 4) return null;

      return {
        id: enemy.id,
        type: signal > 18 ? enemy.type : 'Unknown Contact',
        bearing: bearingToText(Math.atan2(dy, dx)),
        distance: Math.round(distance),
        signal: Math.round(signal),
        quality: signal > 24 ? 'Strong' : signal > 12 ? 'Medium' : 'Weak',
        enemyRef: enemy
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}
