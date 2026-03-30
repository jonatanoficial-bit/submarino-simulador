const dictionary = {
  pt: {
    navigation: 'Navegação', speed: 'Velocidade', depth: 'Profundidade', battery: 'Bateria', diesel: 'Diesel', noise: 'Ruído', torpedoes: 'Torpedos',
    damage_status: 'Status do Submarino', repair_queue: 'Fila de Reparo', sonar_contacts: 'Contatos do Sonar', captain_log: 'Log do Capitão', mission: 'Missão'
  },
  en: {
    navigation: 'Navigation', speed: 'Speed', depth: 'Depth', battery: 'Battery', diesel: 'Diesel', noise: 'Noise', torpedoes: 'Torpedoes',
    damage_status: 'Submarine Status', repair_queue: 'Repair Queue', sonar_contacts: 'Sonar Contacts', captain_log: 'Captain Log', mission: 'Mission'
  },
  es: {
    navigation: 'Navegación', speed: 'Velocidad', depth: 'Profundidad', battery: 'Batería', diesel: 'Diésel', noise: 'Ruido', torpedoes: 'Torpedos',
    damage_status: 'Estado del Submarino', repair_queue: 'Cola de Reparación', sonar_contacts: 'Contactos del Sonar', captain_log: 'Bitácora del Capitán', mission: 'Misión'
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
