const repairOrder = ['hull', 'engine', 'sonar', 'torpedo'];

export function startRepairCycle(player, log) {
  const damaged = repairOrder
    .map((key) => ({ key, ...player.systems[key] }))
    .filter((system) => system.health < 100)
    .sort((a, b) => a.priority - b.priority || a.health - b.health);

  if (!damaged.length) {
    log('Nenhum sistema requer reparo.', 'good');
    return;
  }

  const selected = damaged[0];
  player.systems[selected.key].repairing = true;
  log(`Equipe de reparo direcionada para ${selected.key}.`, 'good');
}

export function updateRepairs(player, delta, log) {
  Object.entries(player.systems).forEach(([key, system]) => {
    if (!system.repairing) return;

    const rate = 4 * delta;
    system.progress += rate;
    if (system.progress >= 1) {
      system.progress = 0;
      system.health = Math.min(100, system.health + 1);
    }
    if (system.health >= 100) {
      system.repairing = false;
      log(`${key} reparado com sucesso.`, 'good');
    }
  });
}

export function setRepairPriority(player, key, priority, log) {
  if (!player.systems[key]) return;
  player.systems[key].priority = priority;
  log(`Prioridade de ${key} ajustada para ${priority}.`, 'good');
}
