export default [
  {
    "id": "training_patrol",
    "name": {
      "pt": "Patrulha de Treinamento",
      "en": "Training Patrol",
      "es": "Patrulla de Entrenamiento"
    },
    "description": {
      "pt": "Identifique contatos, realize um abate e retorne operacional.",
      "en": "Identify contacts, secure one kill and remain operational.",
      "es": "Identifique contactos, consiga una baja y permanezca operativo."
    },
    "goalKills": 1,
    "rewardCredits": 120,
    "rewardXP": 80,
    "enemyCount": 2,
    "difficulty": 1,
    "primaryEnemy": "cargo"
  },
  {
    "id": "cargo_intercept",
    "name": {
      "pt": "Interceptar Cargueiro",
      "en": "Intercept Cargo Ship",
      "es": "Interceptar Carguero"
    },
    "description": {
      "pt": "Ataque alvos de suprimento protegidos por escoltas.",
      "en": "Strike supply targets protected by escorts.",
      "es": "Ataque objetivos de suministro protegidos por escoltas."
    },
    "goalKills": 2,
    "rewardCredits": 220,
    "rewardXP": 140,
    "enemyCount": 3,
    "difficulty": 2,
    "primaryEnemy": "escort"
  },
  {
    "id": "hunter_killer",
    "name": {
      "pt": "Caça Submarina",
      "en": "Hunter Killer",
      "es": "Cazador Submarino"
    },
    "description": {
      "pt": "Enfrente contatos hostis mais silenciosos e agressivos.",
      "en": "Face quieter and more aggressive hostile contacts.",
      "es": "Enfrente contactos hostiles mas silenciosos y agresivos."
    },
    "goalKills": 3,
    "rewardCredits": 360,
    "rewardXP": 220,
    "enemyCount": 4,
    "difficulty": 3,
    "primaryEnemy": "submarine"
  },
  {
    "id": "convoy_raid",
    "name": {
      "pt": "Ataque ao Comboio",
      "en": "Convoy Raid",
      "es": "Ataque al Convoy"
    },
    "description": {
      "pt": "Grande comboio com escoltas e navios civis. Escolha bem seus alvos.",
      "en": "Large convoy with escorts and civilian vessels. Choose targets carefully.",
      "es": "Gran convoy con escoltas y buques civiles. Elija bien sus objetivos."
    },
    "goalKills": 3,
    "rewardCredits": 420,
    "rewardXP": 260,
    "enemyCount": 5,
    "difficulty": 3,
    "primaryEnemy": "convoy"
  }
];