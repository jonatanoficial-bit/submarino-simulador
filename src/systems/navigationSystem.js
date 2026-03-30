export function updateNavigation(player, delta) {
  const enginePenalty = player.systems.engine.health < 50 ? 0.6 : 1;
  const maxSpeed = player.systems.engine.health < 25 ? 2 : 5;
  player.speed = Math.max(0, Math.min(maxSpeed, player.speed));

  player.x += Math.cos(player.heading) * player.speed * enginePenalty * delta * 35;
  player.y += Math.sin(player.heading) * player.speed * enginePenalty * delta * 35;

  player.x = Math.max(20, Math.min(940, player.x));
  player.y = Math.max(20, Math.min(520, player.y));

  const depthRate = player.systems.hull.health < 40 ? 8 : 14;
  if (Math.abs(player.depth - player.targetDepth) > 1) {
    player.depth += Math.sign(player.targetDepth - player.depth) * depthRate * delta;
  }

  const batteryDrain = player.submerged ? (0.06 * player.speed) : -0.12;
  const dieselDrain = player.submerged ? 0 : (0.04 * Math.max(1, player.speed));

  player.battery = Math.max(0, Math.min(100, player.battery - batteryDrain));
  player.diesel = Math.max(0, Math.min(100, player.diesel - dieselDrain));

  player.noise = Math.round(
    8 + player.speed * 6 + (player.depth < 30 ? 14 : 0) + (player.submerged ? 0 : 22) + (100 - player.systems.engine.health) * 0.18
  );
}
