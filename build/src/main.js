import { createPlayerSubmarine } from './entities/playerSubmarine.js';
import { createEnemies } from './entities/enemies.js';
import { updateNavigation } from './systems/navigationSystem.js';
import { scanContacts } from './systems/sonarSystem.js';
import { fireTorpedo, enemyAttack } from './systems/combatSystem.js';
import { applyOperationalStress } from './systems/damageSystem.js';
import { startRepairCycle, updateRepairs, setRepairPriority } from './systems/repairSystem.js';
import { renderScene } from './ui/renderer.js';
import { initializeStaticLabels, renderHud, addLog } from './ui/dom.js';
import { setLanguage } from './core/i18n.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const player = createPlayerSubmarine();
const enemies = createEnemies();
let contacts = [];
let lastTime = performance.now();

initializeStaticLabels();
setLanguage('pt');
addLog('Submarino pronto para patrulha. Proceda com cautela.', 'good');

function update(delta) {
  updateNavigation(player, delta);
  contacts = scanContacts(player, enemies);
  updateRepairs(player, delta, addLog);
  applyOperationalStress(player, addLog);
  enemyAttack(player, enemies, addLog);
  player.hullIntegrity = Math.round(
    (player.systems.hull.health + player.systems.engine.health + player.systems.sonar.health + player.systems.torpedo.health) / 4
  );
}

function render() {
  renderScene(ctx, player, enemies, contacts);
  renderHud(player, contacts, enemies);
}

function loop(now) {
  const delta = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(delta);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft': player.heading -= 0.14; break;
    case 'ArrowRight': player.heading += 0.14; break;
    case 'ArrowUp': player.speed = Math.min(5, player.speed + 1); addLog('Aumentando velocidade.', 'good'); break;
    case 'ArrowDown': player.speed = Math.max(0, player.speed - 1); addLog('Reduzindo velocidade.', 'warn'); break;
    case 'q': case 'Q': player.targetDepth = Math.min(220, player.targetDepth + 20); addLog('Descendo para maior profundidade.', 'warn'); break;
    case 'a': case 'A': player.targetDepth = Math.max(0, player.targetDepth - 20); addLog('Subindo para menor profundidade.', 'warn'); break;
    case 's': case 'S':
      player.submerged = !player.submerged;
      player.targetDepth = player.submerged ? Math.max(30, player.targetDepth) : 0;
      addLog(player.submerged ? 'Submergindo.' : 'Emergindo.', 'good');
      break;
    case ' ': fireTorpedo(player, contacts, addLog); break;
    case 'r': case 'R': startRepairCycle(player, addLog); break;
    case '1': setRepairPriority(player, 'hull', 1, addLog); break;
    case '2': setRepairPriority(player, 'engine', 1, addLog); break;
    case '3': setRepairPriority(player, 'sonar', 1, addLog); break;
    case '4': setRepairPriority(player, 'torpedo', 1, addLog); break;
    default: break;
  }
});

document.getElementById('lang-pt').addEventListener('click', () => setLanguage('pt'));
document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-es').addEventListener('click', () => setLanguage('es'));

requestAnimationFrame(loop);
