
import { state, t, getMissionById, getActiveSubmarine, rankFromXP, saveCareer } from '../core/state.js';

function setText(id, text){ const el = document.getElementById(id); if (el) el.textContent = text; }
function setHTML(id, html){ const el = document.getElementById(id); if (el) el.innerHTML = html; }
function stat(label, value){ return `<div class="stat-item"><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`; }

export function bindUI(handlers){
  document.querySelectorAll('.menu-btn').forEach((btn, index) => {
    const keys = ['lobby','missions','career','intel','assets'];
    btn.addEventListener('click', () => handlers.onNavigate(btn.dataset.screen));
    btn.dataset.screen = keys[index];
  });
  document.getElementById('languageSelect').addEventListener('change', e => handlers.onLanguage(e.target.value));
  document.getElementById('saveBtn').addEventListener('click', handlers.onSave);
  document.getElementById('resetBtn').addEventListener('click', handlers.onReset);
  document.getElementById('tutorialBtn').addEventListener('click', handlers.onTutorial);
  document.getElementById('closeTutorialBtn').addEventListener('click', handlers.onCloseTutorial);
  document.getElementById('goMissionsBtn').addEventListener('click', () => handlers.onNavigate('missions'));
  document.getElementById('goCareerBtn').addEventListener('click', () => handlers.onNavigate('career'));
  document.getElementById('launchMissionBtn').addEventListener('click', handlers.onLaunchMission);
  document.getElementById('fireBtn').addEventListener('click', handlers.onFire);
  document.getElementById('toggleDepthBtn').addEventListener('click', handlers.onToggleDepth);
  document.getElementById('endMissionBtn').addEventListener('click', handlers.onAbort);
  document.querySelectorAll('.repair-btn').forEach(btn => btn.addEventListener('click', () => handlers.onRepair(btn.dataset.repair)));
}

function renderLanguageSelect(){
  const select = document.getElementById('languageSelect');
  select.innerHTML = '';
  [['pt','PT-BR'],['en','EN'],['es','ES']].forEach(([value,label]) => {
    const option = document.createElement('option');
    option.value = value; option.textContent = label; option.selected = state.language === value;
    select.appendChild(option);
  });
}
function renderStaticTexts(){
  const map = {
    captainLabel:'captain', submarineLabel:'submarine', quickStatusLabel:'quickStatus',
    lobbyTitle:'lobbyTitle', lobbyDesc:'lobbyDesc', goMissionsBtn:'startOps', goCareerBtn:'goCareer',
    recentOpsTitle:'recentOps', tacticalSummaryTitle:'tacticalSummary', missionsTitle:'missions',
    missionBriefTitle:'brief', launchMissionBtn:'launch', careerTitle:'career', shipsTitle:'ships',
    intelTitle:'intel', promptPackTitle:'promptPack', assetsTitle:'assets', tacticalMapTitle:'tacticalMap',
    controlsHint:'controls', sonarTitle:'sonar', systemsTitle:'systems', combatTitle:'combat',
    captainLogTitle:'captainLog', saveBtn:'save', resetBtn:'reset', tutorialBtn:'tutorial',
    fireBtn:'fire', toggleDepthBtn:'depth', endMissionBtn:'abort'
  };
  Object.entries(map).forEach(([id,key]) => setText(id, t(key)));
  const menuIds = ['menuLobby','menuMissions','menuCareer','menuIntel','menuAssets'];
  document.querySelectorAll('.menu-btn').forEach((btn, i) => btn.textContent = t(menuIds[i]));
  const repairKeys = ['repairHull','repairEngine','repairSonar','repairTorpedoes'];
  document.querySelectorAll('.repair-btn').forEach((btn, i) => btn.textContent = t(repairKeys[i]));
}
function renderSidebar(){
  const c = state.career, sub = getActiveSubmarine();
  setHTML('captainCard', stat('Name', c.commanderName) + stat('Rank', rankFromXP(c.xp)) + stat('XP', c.xp) + stat('Credits', c.credits));
  setHTML('submarineCard', stat('Class', sub.name[state.language]) + stat('Speed', sub.stats.speed) + stat('Stealth', sub.stats.stealth) + stat('Hull', sub.stats.hull));
  const quick = [`Missions completed: ${c.missionsCompleted}`,`Missions failed: ${c.missionsFailed}`,`Combat kills: ${c.kills}`,`Civilian incidents: ${c.civilianHits || 0}`];
  setHTML('quickStatus', quick.map(v => `<div class="list-item">${v}</div>`).join(''));
}
function renderLobby(){
  setHTML('recentOpsContent', state.logs.slice(0, 8).join('\n'));
  const summary = [`Version: ${state.version}`,`Build: ${state.buildTime}`,`Phase: ${state.phase}`,`Owned submarines: ${state.submarines.filter(s => s.owned).length}/${state.submarines.length}`,`Selected mission difficulty: ${getMissionById(state.selectedMissionId).difficulty}/3`,`Tutorial available from top bar.`];
  setHTML('tacticalSummaryContent', summary.join('\n'));
}
function renderMissions(){
  const list = document.getElementById('missionList'); list.innerHTML = '';
  state.missions.forEach(mission => {
    const div = document.createElement('div');
    div.className = 'list-item' + (state.selectedMissionId === mission.id ? ' selected' : '');
    div.innerHTML = `<strong>${mission.name[state.language]}</strong><div class="small-note">${mission.description[state.language]}</div>`;
    div.addEventListener('click', () => { state.selectedMissionId = mission.id; renderAll(); });
    list.appendChild(div);
  });
  const s = getMissionById(state.selectedMissionId);
  setHTML('missionBrief', [`<p><strong>${s.name[state.language]}</strong></p>`,`<p>${s.description[state.language]}</p>`,`<p>Goal kills: ${s.goalKills}</p>`,`<p>Reward XP: ${s.rewardXP}</p>`,`<p>Reward Credits: ${s.rewardCredits}</p>`,`<p>Enemy Count: ${s.enemyCount}</p>`].join(''));
}
function renderCareer(){
  const c = state.career;
  setHTML('careerPanel', stat('Commander', c.commanderName) + stat('Rank', rankFromXP(c.xp)) + stat('XP', c.xp) + stat('Credits', c.credits) + stat('Missions Completed', c.missionsCompleted) + stat('Missions Failed', c.missionsFailed) + stat('Combat Kills', c.kills) + stat('Civilian Incidents', c.civilianHits || 0));
  const shipList = document.getElementById('shipList'); shipList.innerHTML = '';
  state.submarines.forEach(ship => {
    const active = state.career.activeSubmarineId === ship.id;
    const el = document.createElement('div');
    el.className = 'list-item' + (active ? ' selected' : '');
    el.innerHTML = `<strong>${ship.name[state.language]}</strong><div class="small-note">Speed ${ship.stats.speed} | Stealth ${ship.stats.stealth} | Hull ${ship.stats.hull} | Torpedoes ${ship.stats.torpedoes}</div><div class="small-note">${ship.owned ? (active ? 'Active' : 'Owned') : `Price: ${ship.price} credits`}</div>`;
    el.addEventListener('click', () => {
      if (!ship.owned && state.career.credits >= ship.price){ state.career.credits -= ship.price; ship.owned = true; state.logs.unshift(`[SHIP] ${ship.name[state.language]} acquired.`); }
      if (ship.owned){ state.career.activeSubmarineId = ship.id; state.logs.unshift(`[SHIP] ${ship.name[state.language]} set active.`); }
      saveCareer(); renderAll();
    });
    shipList.appendChild(el);
  });
}
function renderIntel(){
  setHTML('intelContent', ['Escort vessels push aggressively once inside engagement range.','Enemy submarines are harder to detect and attack more selectively.','Civilian targets fail the mission if destroyed.','Repair priority matters in long engagements.','Use Tutorial for a quick onboarding pass.'].join('\n\n'));
  setHTML('promptPackContent', ['[UI] WWII submarine simulator interface, premium tactical HUD, brushed metal, sonar glow, multilingual naval strategy game UI, commercial quality','[ESCORT] WWII escort destroyer, realistic naval rendering, top-down strategy game asset','[CARGO] WWII cargo ship, realistic top-down game asset, readable silhouette','[CREW] submarine sonar operator portrait, WWII naval crew, cinematic lighting, game asset'].join('\n\n'));
}
function renderAssets(){
  setHTML('assetsContent', ['Suggested next content pack:','assets/images/vessels','assets/images/ui','assets/images/portraits','assets/audio/sonar','assets/audio/explosions','','This build already includes synthesized audio feedback in code.'].join('\n'));
}
function renderGamePanels(){
  const g = state.game;
  const p = g.player || { hull:0, engine:0, sonar:0, tubes:0, torpedoes:0, depth:0, submerged:false };
  setHTML('systemsPanel', stat('Hull', `${Math.round(p.hull)}%`) + stat('Engine', `${Math.round(p.engine)}%`) + stat('Sonar', `${Math.round(p.sonar)}%`) + stat('Tubes', `${Math.round(p.tubes)}%`));
  setHTML('combatPanel', stat('Torpedoes', p.torpedoes) + stat('Depth', `${p.depth}m`) + stat('Mode', p.submerged ? 'Submerged' : 'Surface') + stat('Hostiles', g.enemies.filter(e => e.hull > 0 && !e.civilian).length));
  setHTML('sonarContacts', g.sonarContacts.length ? g.sonarContacts.map(c => `${c.status} | ${c.label}${c.civilian ? ' [CIV]' : ''} | Bearing ${c.bearing}° | Distance ${c.distance}m | Signal ${c.signal}`).join('\n') : 'No contacts.');
  setHTML('captainLog', state.logs.slice(0, 14).join('\n'));
  const badgeText = g.missionResult ? `Mission ${g.missionResult.toUpperCase()}` : (g.running ? 'Mission in progress' : 'Awaiting deployment');
  setText('missionStatusBadge', badgeText);
}
function renderTutorial(){
  const overlay = document.getElementById('tutorialOverlay');
  overlay.classList.toggle('hidden', !state.ui.tutorialOpen);
  setHTML('tutorialContent', [
    '1. Escolha uma missão no painel de Missões.',
    '2. Inicie a missão e use as setas para manobrar.',
    '3. Use sonar para localizar alvos e mantenha furtividade quando possível.',
    '4. Dispare torpedos com Espaço.',
    '5. Troque profundidade com Q/A e submerja com S.',
    '6. Se sistemas sofrerem dano, selecione prioridade de reparo.',
    '7. Evite navios civis: isso causa falha imediata.',
    '8. Conclua a missão para receber XP e créditos.'
  ].join('\n\n'));
}
export function renderAll(){
  renderLanguageSelect(); renderStaticTexts(); renderSidebar(); renderLobby(); renderMissions(); renderCareer(); renderIntel(); renderAssets(); renderGamePanels(); renderTutorial();
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById(`screen-${state.currentScreen}`).classList.add('active');
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.screen === state.currentScreen));
  document.getElementById('versionLabel').textContent = `Version ${state.version}`;
  document.getElementById('buildLabel').textContent = `Build ${state.buildTime}`;
  document.getElementById('phaseLabel').textContent = state.phase;
}
