import { VERSION, PHASE, BUILD_TIME, MAX_LOG_ENTRIES } from '../core/config.js';
import { getSystemStatus } from '../systems/damageSystem.js';

const versionLabel = document.getElementById('version-label');
const buildLabel = document.getElementById('build-label');
const speedValue = document.getElementById('speed-value');
const depthValue = document.getElementById('depth-value');
const batteryValue = document.getElementById('battery-value');
const dieselValue = document.getElementById('diesel-value');
const noiseValue = document.getElementById('noise-value');
const torpedoValue = document.getElementById('torpedo-value');
const damageList = document.getElementById('damage-list');
const repairList = document.getElementById('repair-list');
const contactsList = document.getElementById('contacts-list');
const logBox = document.getElementById('captain-log');
const missionText = document.getElementById('mission-text');
const missionProgress = document.getElementById('mission-progress');

let logEntries = [];

export function initializeStaticLabels() {
  versionLabel.textContent = `${VERSION} | ${PHASE}`;
  buildLabel.textContent = `Build ${BUILD_TIME}`;
  missionText.textContent = 'Interceptar o comboio e sobreviver ao contra-ataque.';
}

export function addLog(message, tone = 'good') {
  logEntries.unshift({ message, tone });
  logEntries = logEntries.slice(0, MAX_LOG_ENTRIES);
  logBox.innerHTML = logEntries
    .map((entry) => `<div class="log-entry ${entry.tone}">${entry.message}</div>`)
    .join('');
}

export function renderHud(player, contacts, enemies) {
  speedValue.textContent = `${player.speed.toFixed(0)} kn`;
  depthValue.textContent = `${player.depth.toFixed(0)} m`;
  batteryValue.textContent = `${player.battery.toFixed(0)}%`;
  dieselValue.textContent = `${player.diesel.toFixed(0)}%`;
  noiseValue.textContent = `${player.noise}`;
  torpedoValue.textContent = `${player.torpedoes}`;

  damageList.innerHTML = Object.entries(player.systems).map(([key, system]) => {
    const tone = getSystemStatus(system.health);
    return `<div class="status-item"><strong class="${tone}">${key.toUpperCase()} - ${system.health.toFixed(0)}%</strong><small>Priority ${system.priority} ${system.repairing ? '| Repairing...' : ''}</small></div>`;
  }).join('');

  const repairing = Object.entries(player.systems)
    .filter(([, system]) => system.repairing || system.health < 100)
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(([key, system]) => `<div class="status-item"><strong>${key.toUpperCase()}</strong><small>${system.repairing ? 'Active repair' : 'Awaiting crew'} | ${system.health.toFixed(0)}%</small></div>`)
    .join('');
  repairList.innerHTML = repairing || '<div class="status-item"><strong class="good">All systems operational</strong></div>';

  contactsList.innerHTML = contacts.map((contact) => (
    `<div class="status-item"><strong>${contact.type}</strong><small>Bearing ${contact.bearing} | ${contact.distance} m | ${contact.quality}</small></div>`
  )).join('') || '<div class="status-item"><strong class="warn">No reliable contacts</strong></div>';

  const destroyed = enemies.filter((enemy) => enemy.hp <= 0).length;
  missionProgress.textContent = `Targets destroyed: ${destroyed}/${enemies.length} | Hull integrity: ${player.hullIntegrity}%`;
}
