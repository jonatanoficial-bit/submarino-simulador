const dictionary = {
  pt: {
    navigation: 'Navegação', speed: 'Velocidade', depth: 'Profundidade', battery: 'Bateria', diesel: 'Diesel', noise: 'Ruído', torpedoes: 'Torpedos',
    damage_status: 'Status do Submarino', repair_queue: 'Fila de Reparo', sonar_contacts: 'Contatos do Sonar', captain_log: 'Log do Capitão', mission: 'Missão',
    campaign: 'Campanha', commander: 'Comandante', rank: 'Patente', xp: 'XP', credits: 'Créditos', start_mission: 'Iniciar Missão', cycle_mission: 'Trocar Missão',
    mission_status: 'Status da Missão', victory: 'Vitória', failure: 'Fracasso', ready: 'Pronta'
  },
  en: {
    navigation: 'Navigation', speed: 'Speed', depth: 'Depth', battery: 'Battery', diesel: 'Diesel', noise: 'Noise', torpedoes: 'Torpedoes',
    damage_status: 'Submarine Status', repair_queue: 'Repair Queue', sonar_contacts: 'Sonar Contacts', captain_log: 'Captain Log', mission: 'Mission',
    campaign: 'Campaign', commander: 'Commander', rank: 'Rank', xp: 'XP', credits: 'Credits', start_mission: 'Start Mission', cycle_mission: 'Cycle Mission',
    mission_status: 'Mission Status', victory: 'Victory', failure: 'Failure', ready: 'Ready'
  },
  es: {
    navigation: 'Navegación', speed: 'Velocidad', depth: 'Profundidad', battery: 'Batería', diesel: 'Diésel', noise: 'Ruido', torpedoes: 'Torpedos',
    damage_status: 'Estado del Submarino', repair_queue: 'Cola de Reparación', sonar_contacts: 'Contactos del Sonar', captain_log: 'Bitácora del Capitán', mission: 'Misión',
    campaign: 'Campaña', commander: 'Comandante', rank: 'Rango', xp: 'XP', credits: 'Créditos', start_mission: 'Iniciar Misión', cycle_mission: 'Cambiar Misión',
    mission_status: 'Estado de la Misión', victory: 'Victoria', failure: 'Fracaso', ready: 'Lista'
  }
};

let currentLang = 'pt';

export function setLanguage(lang) {
  currentLang = dictionary[lang] ? lang : 'pt';
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    element.textContent = dictionary[currentLang][key] || key;
  });
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  return dictionary[currentLang]?.[key] || key;
}
