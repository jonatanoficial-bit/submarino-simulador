import { getLanguage } from '../core/i18n.js';

const SAVE_KEY = 'submarine_commander_career';

export async function loadMissionCatalog() {
  const response = await fetch('./data/missions.json');
  if (!response.ok) throw new Error('Unable to load missions');
  return response.json();
}

export function createCareerState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn(error);
  }
  return {
    commander: 'Capitao Vale',
    rank: 'Lieutenant',
    xp: 0,
    credits: 0,
    completedMissionIds: []
  };
}

export function saveCareerState(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function instantiateMission(template) {
  return {
    id: template.id,
    code: template.code,
    title: template.title,
    briefing: template.briefing,
    goal: template.goal,
    reward: template.reward,
    player: template.player,
    enemies: template.enemies.map((enemy) => ({ ...enemy })),
    status: 'ready',
    destroyedCount: 0,
    detectedCount: 0,
    elapsed: 0,
    failedReason: ''
  };
}

export function getLocalizedMissionTitle(mission) {
  return mission.title[getLanguage()] || mission.title.pt;
}

export function getLocalizedMissionBriefing(mission) {
  return mission.briefing[getLanguage()] || mission.briefing.pt;
}

export function evaluateMission(mission, player, enemies, contacts) {
  mission.elapsed += 1 / 60;
  mission.detectedCount = Math.max(mission.detectedCount, contacts.length);

  const destroyed = enemies.filter((enemy) => enemy.hp <= 0);
  mission.destroyedCount = destroyed.length;

  if (player.hullIntegrity <= 0 || player.systems.hull.health <= 0) {
    mission.status = 'failed';
    mission.failedReason = 'Submarine lost';
    return mission.status;
  }
  if (player.battery <= 0 && player.submerged) {
    mission.status = 'failed';
    mission.failedReason = 'Battery depleted while submerged';
    return mission.status;
  }

  if (mission.goal.type === 'destroy' && destroyed.length >= mission.goal.count) {
    mission.status = 'completed';
  }

  if (mission.goal.type === 'destroyType') {
    const matchingDestroyed = destroyed.filter((enemy) => enemy.type === mission.goal.enemyType);
    if (matchingDestroyed.length >= mission.goal.count) {
      mission.status = 'completed';
    }
  }

  return mission.status;
}

export function applyMissionRewards(career, mission) {
  if (career.completedMissionIds.includes(mission.id)) return career;
  career.xp += mission.reward.xp;
  career.credits += mission.reward.credits;
  career.completedMissionIds.push(mission.id);

  if (career.xp >= 450) career.rank = 'Commander';
  else if (career.xp >= 200) career.rank = 'Lt. Commander';
  else if (career.xp >= 100) career.rank = 'Lieutenant';

  saveCareerState(career);
  return career;
}
