
import missions from '../../data/missions.js';
import submarines from '../../data/submarines.js';
import i18n from '../../data/i18n.js';

const defaultCareer = () => ({
  commanderName: 'Jonatan Vale',
  xp: 0,
  credits: 200,
  missionsCompleted: 0,
  missionsFailed: 0,
  kills: 0,
  civilianHits: 0,
  activeSubmarineId: 'type_vii_a'
});

export const state = {
  version: 'v1.0.0',
  phase: 'Commercial Base Release',
  buildTime: "2026-03-30 20:39:26",
  language: 'pt',
  currentScreen: 'lobby',
  selectedMissionId: missions[0].id,
  missions,
  submarines: JSON.parse(JSON.stringify(submarines)),
  career: defaultCareer(),
  logs: ['[OPS] 1.0.0 initialized.','[OPS] Commercial base release ready.','[OPS] Tutorial and audio cues enabled.'],
  ui: { tutorialOpen: true },
  game: { running:false, missionResult:null, player:null, enemies:[], sonarContacts:[], repairPriority:'hull', tick:0, warnings:0 }
};

export function rankFromXP(xp){
  if (xp >= 900) return 'Commander';
  if (xp >= 600) return 'Lieutenant Commander';
  if (xp >= 350) return 'Lieutenant';
  if (xp >= 120) return 'Sub-Lieutenant';
  return 'Ensign';
}
export function setLanguage(lang){ state.language = i18n[lang] ? lang : 'pt'; }
export function t(key){ return i18n[state.language]?.[key] || key; }
export function getMissionById(id){ return state.missions.find(m => m.id === id) || state.missions[0]; }
export function getActiveSubmarine(){ return state.submarines.find(s => s.id === state.career.activeSubmarineId) || state.submarines[0]; }
export function saveCareer(){
  localStorage.setItem('submarineCommanderCareer', JSON.stringify({
    language: state.language, career: state.career, submarines: state.submarines, logs: state.logs.slice(0, 30)
  }));
}
export function loadCareer(){
  try {
    const raw = localStorage.getItem('submarineCommanderCareer');
    if (!raw) return;
    const data = JSON.parse(raw);
    state.language = data.language || 'pt';
    state.career = data.career || defaultCareer();
    state.submarines = data.submarines || JSON.parse(JSON.stringify(submarines));
    state.logs = data.logs || state.logs;
  } catch (err) {
    console.warn('Could not load save', err);
  }
}
export function resetCareer(){
  localStorage.removeItem('submarineCommanderCareer');
  state.career = defaultCareer();
  state.submarines = JSON.parse(JSON.stringify(submarines));
  state.logs = ['[OPS] Career reset.'];
  state.currentScreen = 'lobby';
  state.selectedMissionId = state.missions[0].id;
  state.ui.tutorialOpen = true;
}
