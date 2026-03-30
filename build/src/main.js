
import { state, loadCareer, saveCareer, resetCareer, setLanguage } from './core/state.js';
import { setupGame, startMission, updateGame, fireTorpedo, toggleDepth, setRepairPriority, abortMission } from './systems/gameplay.js';
import { renderAll, bindUI } from './ui/render.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

loadCareer();
setupGame(canvas, ctx);
bindUI({
  onNavigate: (screen) => { state.currentScreen = screen; renderAll(); },
  onLanguage: (lang) => { setLanguage(lang); renderAll(); },
  onSave: () => { saveCareer(); state.logs.unshift(`[SAVE] ${new Date().toLocaleString()} career saved.`); renderAll(); },
  onReset: () => { resetCareer(); setupGame(canvas, ctx, true); renderAll(); },
  onLaunchMission: () => { startMission(); state.currentScreen = 'game'; renderAll(); },
  onSelectShip: (id) => {},
  onFire: () => { fireTorpedo(); renderAll(); },
  onToggleDepth: () => { toggleDepth(); renderAll(); },
  onAbort: () => { abortMission(); renderAll(); },
  onRepair: (system) => { setRepairPriority(system); renderAll(); }
});

function frame(){
  updateGame();
  renderAll();
  requestAnimationFrame(frame);
}
renderAll();
frame();

document.addEventListener('keydown', (e) => {
  if (state.currentScreen !== 'game' || !state.game.running) return;
  const speed = 2 + state.game.player.speed / 28;
  if (e.key === 'ArrowUp') state.game.player.y = Math.max(24, state.game.player.y - speed);
  if (e.key === 'ArrowDown') state.game.player.y = Math.min(516, state.game.player.y + speed);
  if (e.key === 'ArrowLeft') state.game.player.x = Math.max(24, state.game.player.x - speed);
  if (e.key === 'ArrowRight') state.game.player.x = Math.min(936, state.game.player.x + speed);
  if (e.key === ' ') { e.preventDefault(); fireTorpedo(); }
  if (e.key.toLowerCase() === 'q') state.game.player.depth = Math.min(120, state.game.player.depth + 10);
  if (e.key.toLowerCase() === 'a') state.game.player.depth = Math.max(0, state.game.player.depth - 10);
  if (e.key.toLowerCase() === 's') toggleDepth();
  if (e.key.toLowerCase() === 'r') setRepairPriority(state.game.repairPriority || 'hull');
});
