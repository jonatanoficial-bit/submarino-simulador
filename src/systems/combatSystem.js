export function fireTorpedo(player, contacts, log) {
  if (player.torpedoes <= 0) {
    log('Sem torpedos restantes.', 'warn');
    return;
  }
  if (player.systems.torpedo.health <= 20) {
    log('Tubos de torpedo severamente danificados.', 'bad');
    return;
  }

  const target = contacts[0]?.enemyRef;
  player.torpedoes -= 1;
  if (!target) {
    log('Torpedo lançado sem solução de tiro confiável.', 'warn');
    return;
  }

  const hitChance = Math.max(0.2, 0.8 - player.speed * 0.08 - (100 - player.systems.torpedo.health) * 0.004);
  if (Math.random() < hitChance) {
    target.hp -= 1;
    log(`Acerto em ${target.type}. Integridade inimiga reduzida.`, 'good');
  } else {
    log(`Torpedo falhou contra ${target.type}.`, 'warn');
  }
}

export function enemyAttack(player, enemies, log) {
  const aliveThreats = enemies.filter((enemy) => enemy.hp > 0 && Math.hypot(enemy.x - player.x, enemy.y - player.y) < 190);
  if (aliveThreats.length === 0) return;
  if (Math.random() > 0.02 + aliveThreats.length * 0.015) return;

  const damageOptions = ['hull', 'engine', 'sonar', 'torpedo'];
  const targetSystem = damageOptions[Math.floor(Math.random() * damageOptions.length)];
  const damage = 8 + Math.random() * 10;
  player.systems[targetSystem].health = Math.max(0, player.systems[targetSystem].health - damage);
  player.hullIntegrity = Math.round(
    (player.systems.hull.health + player.systems.engine.health + player.systems.sonar.health + player.systems.torpedo.health) / 4
  );
  log(`Ataque inimigo atingiu ${targetSystem}. Dano de ${Math.round(damage)}%.`, 'bad');
}
