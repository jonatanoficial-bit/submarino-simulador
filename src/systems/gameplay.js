
import { state, getMissionById, getActiveSubmarine, saveCareer } from '../core/state.js';
import { drawScene } from '../ui/scene.js';
import { sonarPing, torpedoShot, impactHit, warningTone } from './audio.js';

let ctxRef = null;
let lastPing = 0;

export function setupGame(canvas, ctx, resetOnly = false){
  ctxRef = ctx;
  state.game = { running:false, missionResult:null, player:createPlayer(), enemies:[], sonarContacts:[], repairPriority:'hull', tick:0, warnings:0 };
  if (!resetOnly) drawScene(ctxRef, state.game);
}

function createPlayer(){
  const sub = getActiveSubmarine();
  return { x:180, y:270, speed:sub.stats.speed, stealth:sub.stats.stealth, depth:0, submerged:false, torpedoes:sub.stats.torpedoes, hull:sub.stats.hull, engine:100, sonar:100, tubes:100, repairTimer:0, creditsGained:0 };
}
function enemyTemplate(type){
  if (type === 'escort') return { type:'escort', label:'Escort', hull:80, speed:28, noise:55, aggression:1.2, civilian:false };
  if (type === 'submarine') return { type:'submarine', label:'Enemy Sub', hull:72, speed:24, noise:28, aggression:1.35, civilian:false };
  if (type === 'civilian') return { type:'civilian', label:'Civilian', hull:44, speed:16, noise:42, aggression:0, civilian:true };
  return { type:'cargo', label:'Cargo', hull:58, speed:18, noise:48, aggression:0.55, civilian:false };
}
function createEnemies(mission){
  const list = [];
  const sequence = [];
  if (mission.id === 'convoy_raid') sequence.push('cargo','escort','civilian','cargo','escort');
  else {
    for (let i=0;i<mission.enemyCount;i++){
      if (mission.primaryEnemy === 'submarine' && i % 2 === 0) sequence.push('submarine');
      else if (mission.primaryEnemy === 'escort' && i % 2 === 1) sequence.push('escort');
      else sequence.push('cargo');
    }
  }
  sequence.forEach((type, i) => {
    const tpl = enemyTemplate(type);
    list.push({ id:`enemy_${i}`, ...tpl, x:560 + i*70, y:100 + (i*88)%340, hull:tpl.hull + mission.difficulty*8, attackCooldown:140 + Math.random()*120, waypoint:{ x:620+Math.random()*220, y:80+Math.random()*380 } });
  });
  return list;
}
export function startMission(){
  const mission = getMissionById(state.selectedMissionId);
  state.game.running = true;
  state.game.missionResult = null;
  state.game.player = createPlayer();
  state.game.enemies = createEnemies(mission);
  state.game.sonarContacts = [];
  state.game.tick = 0;
  state.game.warnings = 0;
  state._killsAtMissionStart = state.career.kills;
  state._civiliansAtMissionStart = state.career.civilianHits || 0;
  state.logs.unshift(`[MISSION] ${mission.name[state.language]} started.`);
}
export function toggleDepth(){
  const p = state.game.player;
  if (!p) return;
  p.submerged = !p.submerged;
  p.depth = p.submerged ? 60 : 0;
  state.logs.unshift(p.submerged ? '[DEPTH] Submerged.' : '[DEPTH] Surfaced.');
}
export function setRepairPriority(system){
  state.game.repairPriority = system;
  state.logs.unshift(`[REPAIR] Priority ${system}.`);
}
function applyRepairs(){
  const p = state.game.player;
  if (p.repairTimer > 0){ p.repairTimer--; return; }
  p.repairTimer = 88;
  const target = state.game.repairPriority;
  if (target === 'hull') p.hull = Math.min(100, p.hull + 4);
  if (target === 'engine') p.engine = Math.min(100, p.engine + 5);
  if (target === 'sonar') p.sonar = Math.min(100, p.sonar + 5);
  if (target === 'torpedoes') p.tubes = Math.min(100, p.tubes + 5);
}
function updateSonar(){
  const p = state.game.player;
  state.game.sonarContacts = state.game.enemies.filter(e => e.hull > 0).map(e => {
    const dx = e.x - p.x, dy = e.y - p.y;
    const distance = Math.hypot(dx, dy);
    const bearing = Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360);
    const signal = Math.max(0, Math.round((e.noise + (100 - p.stealth) + (p.submerged ? 12 : -6) + (p.sonar / 3) - distance / 7)));
    return { id:e.id, label:e.label, bearing, distance:Math.round(distance), signal, status:signal>50?'DETECTED':signal>25?'SUSPECTED':'FAINT', civilian:e.civilian };
  }).filter(c => c.signal > 8).sort((a,b)=>b.signal-a.signal);

  if (state.game.sonarContacts.length && state.game.tick - lastPing > 80){
    sonarPing();
    lastPing = state.game.tick;
  }
}
function driftToward(enemy, targetX, targetY, factor){
  const dx = targetX - enemy.x, dy = targetY - enemy.y;
  const d = Math.hypot(dx, dy) || 1;
  enemy.x += (dx / d) * factor;
  enemy.y += (dy / d) * factor;
}
function enemyActions(){
  const p = state.game.player;
  for (const e of state.game.enemies){
    if (e.hull <= 0) continue;
    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    if (e.type === 'cargo' || e.type === 'civilian'){
      driftToward(e, e.waypoint.x, e.waypoint.y, 0.3 + e.speed/100);
      if (Math.hypot(e.x - e.waypoint.x, e.y - e.waypoint.y) < 20) e.waypoint = { x:560 + Math.random()*300, y:60 + Math.random()*420 };
    }
    if (e.type === 'escort'){
      if (d < 260) driftToward(e, p.x, p.y, 0.45 + e.speed/80);
      else driftToward(e, e.waypoint.x, e.waypoint.y, 0.35);
    }
    if (e.type === 'submarine'){
      if (d < 240 && p.submerged) driftToward(e, p.x + 30, p.y + 10, 0.36 + e.speed/90);
      else driftToward(e, e.waypoint.x, e.waypoint.y, 0.28);
    }
    e.attackCooldown--;
    const canAttack = !e.civilian && d < (e.type === 'escort' ? 200 : 170);
    if (canAttack && e.attackCooldown <= 0){
      e.attackCooldown = 160 + Math.random() * 120;
      const damage = (4 + Math.random() * 8) * e.aggression;
      const roll = Math.random();
      if (roll < 0.42) p.hull = Math.max(0, p.hull - damage);
      else if (roll < 0.68) p.engine = Math.max(0, p.engine - damage);
      else if (roll < 0.86) p.sonar = Math.max(0, p.sonar - damage);
      else p.tubes = Math.max(0, p.tubes - damage);
      state.logs.unshift(`[HIT] ${e.label} attack caused ${damage.toFixed(0)} damage.`);
      warningTone();
    }
  }
}
export function fireTorpedo(){
  if (!state.game.running) return;
  const p = state.game.player;
  if (p.torpedoes <= 0){ state.logs.unshift('[WEAPON] No torpedoes remaining.'); warningTone(); return; }
  if (p.tubes <= 15){ state.logs.unshift('[WEAPON] Torpedo tubes damaged.'); warningTone(); return; }
  p.torpedoes--;
  torpedoShot();
  const target = state.game.enemies.filter(e => e.hull > 0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if (!target){ state.logs.unshift('[WEAPON] No target solution available.'); return; }
  const distance = Math.hypot(target.x-p.x, target.y-p.y);
  const chance = Math.max(0.18, Math.min(0.92, 0.84 - distance/930 + p.sonar/255 - (100-p.tubes)/190 + (p.submerged?0.06:0)));
  if (Math.random() < chance){
    const damage = 24 + Math.random()*24;
    target.hull = Math.max(0, target.hull - damage);
    state.logs.unshift(`[WEAPON] Torpedo impact on ${target.label} for ${damage.toFixed(0)} damage.`);
    impactHit();
    if (target.hull <= 0){
      if (target.civilian){
        state.career.civilianHits = (state.career.civilianHits || 0) + 1;
        state.game.warnings++;
        state.logs.unshift('[WARNING] Civilian vessel destroyed. Strategic penalty applied.');
        warningTone();
      } else {
        state.career.kills++;
        p.creditsGained += target.type === 'escort' ? 70 : target.type === 'submarine' ? 90 : 40;
        state.logs.unshift(`[KILL] ${target.label} destroyed.`);
      }
    }
  } else {
    state.logs.unshift('[WEAPON] Torpedo missed.');
  }
}
function evaluateMission(){
  const mission = getMissionById(state.selectedMissionId);
  const killsThisMission = state.career.kills - (state._killsAtMissionStart || 0);
  const civilianHitsThisMission = (state.career.civilianHits || 0) - (state._civiliansAtMissionStart || 0);
  const alive = state.game.player.hull > 0;

  if (killsThisMission >= mission.goalKills && alive && civilianHitsThisMission === 0){
    state.game.missionResult = 'success';
  } else if (!alive || civilianHitsThisMission > 0){
    state.game.missionResult = 'failed';
  }
  if (state.game.missionResult){
    state.game.running = false;
    if (state.game.missionResult === 'success'){
      state.career.missionsCompleted++;
      state.career.credits += mission.rewardCredits + state.game.player.creditsGained;
      state.career.xp += mission.rewardXP;
      state.logs.unshift(`[MISSION] Success. +${mission.rewardXP} XP, +${mission.rewardCredits + state.game.player.creditsGained} credits.`);
      impactHit();
    } else {
      state.career.missionsFailed++;
      state.logs.unshift('[MISSION] Failed. Review captain procedures.');
      warningTone();
    }
    saveCareer();
  }
}
export function abortMission(){
  if (!state.game.running) return;
  state.game.running = false;
  state.game.missionResult = 'aborted';
  state.career.missionsFailed++;
  state.logs.unshift('[MISSION] Aborted by captain order.');
  saveCareer();
}
export function updateGame(){
  if (!ctxRef) return;
  if (state.game.running){
    state.game.tick++;
    applyRepairs();
    updateSonar();
    enemyActions();
    evaluateMission();
  }
  drawScene(ctxRef, state.game);
}
