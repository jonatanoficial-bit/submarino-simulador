const locales = {
  'pt-BR': {
    ui: {
      langLabel: 'Idioma',
      navTitle: 'Navegação',
      projectStatusTitle: 'Status do Projeto',
      footerVersionLabel: 'Versão',
      footerPhaseLabel: 'Fase Atual',
      footerNoteLabel: 'Nota',
      footerNoteValue: 'Build navegável com velocidade, profundidade, rumo e imersão. Pronto para GitHub Pages.',
      buildLabel: 'Build',
      buttons: {
        openDemo: 'Abrir núcleo de navegação',
        reviewArchitecture: 'Ver entregáveis da fase',
      },
    },
    statusList: [
      'Submarino navegável em mapa tático.',
      'Controles de velocidade, profundidade, rumo e submersão ativos.',
      'Consumo básico de bateria e diesel em tempo real.',
      'Versão, data e hora da build visíveis em tela.',
    ],
    scenes: {
      menu: {
        navLabel: 'Menu Principal',
        title: 'Núcleo de Navegação',
        phaseLabel: 'Fase 2 / Navigation Core',
        heroTitle: 'Silent Depth Command',
        heroText: 'Esta entrega adiciona o primeiro loop jogável de comando: o submarino se movimenta, altera rumo, profundidade, estado de superfície/submerso e já responde com consequências básicas de exposição e consumo.',
        cards: [
          { title: 'Escopo atual', value: 'Fase 2', body: 'Navegação, profundidade, rumo, trânsito de superfície e imersão.' },
          { title: 'Mapa tático', value: 'Ativo', body: 'Movimentação contínua do submarino do jogador em patrulha.' },
          { title: 'Entrega', value: 'ZIP Completo', body: 'Projeto integral + build estática jogável.' },
        ],
        tagsTitle: 'Pilares desta build',
        tags: ['Movimento em tempo real', 'Estado submerso', 'Recursos básicos', 'Base para sonar'],
      },
      briefing: {
        navLabel: 'Briefing',
        title: 'Entregáveis da Fase 2',
        phaseLabel: 'Milestone jogável',
        heading: 'Objetivo da Fase 2',
        body: 'Transformar a fundação técnica em um protótipo navegável e estável, criando o coração do deslocamento do submarino antes da entrada do sonar, contatos hostis reais e combate.',
        milestonesTitle: 'Entregáveis confirmados',
        tableHeaders: ['Sistema', 'Implementação'],
        milestones: [
          ['Mapa tático', 'Posição, deslocamento e marcador do submarino'],
          ['Propulsão', 'Velocidade-alvo com aceleração gradual'],
          ['Profundidade', 'Faixas de operação com imersão e retorno à superfície'],
          ['Rumo', 'Mudança gradual de proa com navegação contínua'],
          ['Recursos', 'Bateria, diesel, casco e risco de contato'],
        ],
        highlights: [
          { title: 'Base para sonar', body: 'O risco de contato já prepara a futura leitura acústica e a importância do silêncio.' },
          { title: 'Base para dano', body: 'Profundidade excessiva começa a ameaçar o casco, criando continuidade para a fase de avarias.' },
          { title: 'Base para campanha', body: 'Rotas, postura do submarino e relógio interno já permitem futuras missões guiadas por objetivos.' },
        ],
      },
      hud: {
        navLabel: 'Mesa de Comando',
        title: 'Mesa de Comando Tática',
        phaseLabel: 'Simulação jogável',
        heading: 'Controle primário de navegação do submarino',
        body: 'Defina velocidade, profundidade e rumo. O submarino responde gradualmente, consumindo recursos e alterando seu risco operacional conforme suas ordens.',
        telemetryTitle: 'Telemetria',
        resourcesTitle: 'Recursos e risco',
        mapTitle: 'Mapa tático de patrulha',
        mapLegendPlayer: 'Seu submarino',
        mapLegendConvoy: 'Comboio',
        mapLegendEscort: 'Escolta',
        mapLegendUnknown: 'Contato desconhecido',
        statusLabels: {
          posture: 'Postura',
          route: 'Rota',
          exposure: 'Exposição',
        },
        statusValues: {
          submerged: 'Submerso',
          surface: 'Em superfície',
          detected: 'Risco alto',
          hidden: 'Baixo perfil',
        },
        metrics: {
          speed: 'Velocidade',
          depth: 'Profundidade',
          heading: 'Rumo',
          position: 'Posição',
          time: 'Relógio',
          battery: 'Bateria',
          diesel: 'Diesel',
          hull: 'Casco',
          risk: 'Risco de contato',
        },
        controls: {
          speedTitle: 'Velocidade',
          depthTitle: 'Profundidade',
          headingTitle: 'Rumo',
          submergeLabel: 'Submergir',
          surfaceLabel: 'Emergir',
          speedOptions: [
            { label: 'Parado', value: 0 },
            { label: '1/3', value: 4 },
            { label: '2/3', value: 8 },
            { label: 'Flanco', value: 12 },
          ],
          depthOptions: [
            { label: 'Periscópio 30m', value: 30 },
            { label: 'Patrulha 60m', value: 60 },
            { label: 'Profunda 120m', value: 120 },
            { label: 'Crítica 200m', value: 200 },
          ],
          headingOptions: [
            { label: 'Norte 0°', value: 0 },
            { label: 'Leste 90°', value: 90 },
            { label: 'Sul 180°', value: 180 },
            { label: 'Oeste 270°', value: 270 },
          ],
        },
        cards: [
          { title: 'Tripulação', value: '24', body: 'Tripulação em espera; atribuições detalhadas entram na próxima etapa com sonar e estações.' },
          { title: 'Procedimento', value: 'Manual', body: 'O capitão já controla os parâmetros principais que afetarão furtividade, interceptação e sobrevivência.' },
          { title: 'Próxima fase', value: 'Sonar', body: 'Esta base já está pronta para contatos acústicos, operador de sonar e indicação de direção inimiga.' },
        ],
      },
    },
  },
  en: {
    ui: {
      langLabel: 'Language', navTitle: 'Navigation', projectStatusTitle: 'Project Status', footerVersionLabel: 'Version', footerPhaseLabel: 'Current Phase', footerNoteLabel: 'Note', footerNoteValue: 'Navigable build with speed, depth, heading, and dive controls. Ready for GitHub Pages.', buildLabel: 'Build', buttons: { openDemo: 'Open navigation core', reviewArchitecture: 'Review phase deliverables' },
    },
    statusList: ['Submarine is navigable on the tactical map.', 'Speed, depth, heading, and dive controls are active.', 'Basic battery and diesel consumption run in real time.', 'Version, date, and build time remain visible on screen.'],
    scenes: {
      menu: { navLabel: 'Main Menu', title: 'Navigation Core', phaseLabel: 'Phase 2 / Navigation Core', heroTitle: 'Silent Depth Command', heroText: 'This build adds the first playable command loop: the submarine moves, changes heading, changes depth, dives or surfaces, and already reacts with basic exposure and consumption consequences.', cards: [{ title: 'Current scope', value: 'Phase 2', body: 'Navigation, depth, heading, surface transit, and diving.' }, { title: 'Tactical map', value: 'Active', body: 'Continuous movement for the player submarine during patrol.' }, { title: 'Delivery', value: 'Full ZIP', body: 'Complete project plus playable static build.' }], tagsTitle: 'Build pillars', tags: ['Real-time movement', 'Submerged state', 'Basic resources', 'Sonar-ready'] },
      briefing: { navLabel: 'Briefing', title: 'Phase 2 Deliverables', phaseLabel: 'Playable milestone', heading: 'Phase 2 Objective', body: 'Turn the technical foundation into a stable navigable prototype, creating the core of submarine movement before sonar, real hostile contacts, and combat come online.', milestonesTitle: 'Confirmed deliverables', tableHeaders: ['System', 'Implementation'], milestones: [['Tactical map', 'Position, displacement, and player marker'], ['Propulsion', 'Target speed with gradual acceleration'], ['Depth', 'Operating bands with diving and surfacing return'], ['Heading', 'Gradual course change with continuous navigation'], ['Resources', 'Battery, diesel, hull, and contact risk']], highlights: [{ title: 'Sonar foundation', body: 'Contact risk already prepares future acoustic reading and the value of silence.' }, { title: 'Damage foundation', body: 'Excessive depth begins to threaten the hull, linking directly into the future damage phase.' }, { title: 'Campaign foundation', body: 'Routes, posture, and the internal clock already support future mission logic.' }] },
      hud: {
        navLabel: 'Command Table', title: 'Tactical Command Table', phaseLabel: 'Playable simulation', heading: 'Primary submarine navigation control', body: 'Set speed, depth, and heading. The submarine responds gradually while consuming resources and changing its operational exposure according to your orders.', telemetryTitle: 'Telemetry', resourcesTitle: 'Resources and risk', mapTitle: 'Patrol tactical map', mapLegendPlayer: 'Your submarine', mapLegendConvoy: 'Convoy', mapLegendEscort: 'Escort', mapLegendUnknown: 'Unknown contact', statusLabels: { posture: 'Posture', route: 'Route', exposure: 'Exposure' }, statusValues: { submerged: 'Submerged', surface: 'On surface', detected: 'High risk', hidden: 'Low profile' }, metrics: { speed: 'Speed', depth: 'Depth', heading: 'Heading', position: 'Position', time: 'Clock', battery: 'Battery', diesel: 'Diesel', hull: 'Hull', risk: 'Contact risk' }, controls: { speedTitle: 'Speed', depthTitle: 'Depth', headingTitle: 'Heading', submergeLabel: 'Dive', surfaceLabel: 'Surface', speedOptions: [{ label: 'Stop', value: 0 }, { label: '1/3', value: 4 }, { label: '2/3', value: 8 }, { label: 'Flank', value: 12 }], depthOptions: [{ label: 'Periscope 30m', value: 30 }, { label: 'Patrol 60m', value: 60 }, { label: 'Deep 120m', value: 120 }, { label: 'Critical 200m', value: 200 }], headingOptions: [{ label: 'North 0°', value: 0 }, { label: 'East 90°', value: 90 }, { label: 'South 180°', value: 180 }, { label: 'West 270°', value: 270 }] }, cards: [{ title: 'Crew', value: '24', body: 'Crew stands by; detailed stations arrive in the next step with sonar and departments.' }, { title: 'Procedure', value: 'Manual', body: 'The captain already controls the primary parameters that will affect stealth, interception, and survival.' }, { title: 'Next phase', value: 'Sonar', body: 'This base is ready for acoustic contacts, sonar operator workflow, and enemy bearing cues.' }] },
    },
  },
  es: {
    ui: {
      langLabel: 'Idioma', navTitle: 'Navegación', projectStatusTitle: 'Estado del Proyecto', footerVersionLabel: 'Versión', footerPhaseLabel: 'Fase Actual', footerNoteLabel: 'Nota', footerNoteValue: 'Build navegable con velocidad, profundidad, rumbo e inmersión. Lista para GitHub Pages.', buildLabel: 'Build', buttons: { openDemo: 'Abrir núcleo de navegación', reviewArchitecture: 'Ver entregables de la fase' },
    },
    statusList: ['El submarino ya navega en el mapa táctico.', 'Controles de velocidad, profundidad, rumbo e inmersión activos.', 'Consumo básico de batería y diésel en tiempo real.', 'Versión, fecha y hora de build visibles en pantalla.'],
    scenes: {
      menu: { navLabel: 'Menú Principal', title: 'Núcleo de Navegación', phaseLabel: 'Fase 2 / Navigation Core', heroTitle: 'Silent Depth Command', heroText: 'Esta entrega añade el primer bucle jugable de mando: el submarino se mueve, cambia rumbo, cambia profundidad, se sumerge o emerge, y ya responde con consecuencias básicas de exposición y consumo.', cards: [{ title: 'Alcance actual', value: 'Fase 2', body: 'Navegación, profundidad, rumbo, tránsito en superficie e inmersión.' }, { title: 'Mapa táctico', value: 'Activo', body: 'Movimiento continuo del submarino del jugador durante la patrulla.' }, { title: 'Entrega', value: 'ZIP Completo', body: 'Proyecto completo + build estática jugable.' }], tagsTitle: 'Pilares de esta build', tags: ['Movimiento en tiempo real', 'Estado sumergido', 'Recursos básicos', 'Lista para sonar'] },
      briefing: { navLabel: 'Briefing', title: 'Entregables de la Fase 2', phaseLabel: 'Hito jugable', heading: 'Objetivo de la Fase 2', body: 'Convertir la base técnica en un prototipo navegable y estable, creando el corazón del desplazamiento del submarino antes de incorporar sonar, contactos hostiles reales y combate.', milestonesTitle: 'Entregables confirmados', tableHeaders: ['Sistema', 'Implementación'], milestones: [['Mapa táctico', 'Posición, desplazamiento y marcador del jugador'], ['Propulsión', 'Velocidad objetivo con aceleración gradual'], ['Profundidad', 'Bandas operativas con inmersión y retorno a superficie'], ['Rumbo', 'Cambio gradual de proa con navegación continua'], ['Recursos', 'Batería, diésel, casco y riesgo de contacto']], highlights: [{ title: 'Base para sonar', body: 'El riesgo de contacto ya prepara la futura lectura acústica y el valor del silencio.' }, { title: 'Base para daño', body: 'La profundidad excesiva ya amenaza el casco y conecta con la futura fase de averías.' }, { title: 'Base para campaña', body: 'Rutas, postura y reloj interno ya permiten futuras misiones guiadas por objetivos.' }] },
      hud: {
        navLabel: 'Mesa de Mando', title: 'Mesa de Mando Táctica', phaseLabel: 'Simulación jugable', heading: 'Control primario de navegación del submarino', body: 'Define velocidad, profundidad y rumbo. El submarino responde gradualmente mientras consume recursos y modifica su exposición operativa según tus órdenes.', telemetryTitle: 'Telemetría', resourcesTitle: 'Recursos y riesgo', mapTitle: 'Mapa táctico de patrulla', mapLegendPlayer: 'Tu submarino', mapLegendConvoy: 'Convoy', mapLegendEscort: 'Escolta', mapLegendUnknown: 'Contacto desconocido', statusLabels: { posture: 'Postura', route: 'Ruta', exposure: 'Exposición' }, statusValues: { submerged: 'Sumergido', surface: 'En superficie', detected: 'Riesgo alto', hidden: 'Perfil bajo' }, metrics: { speed: 'Velocidad', depth: 'Profundidad', heading: 'Rumbo', position: 'Posición', time: 'Reloj', battery: 'Batería', diesel: 'Diésel', hull: 'Casco', risk: 'Riesgo de contacto' }, controls: { speedTitle: 'Velocidad', depthTitle: 'Profundidad', headingTitle: 'Rumbo', submergeLabel: 'Sumergir', surfaceLabel: 'Emerger', speedOptions: [{ label: 'Detener', value: 0 }, { label: '1/3', value: 4 }, { label: '2/3', value: 8 }, { label: 'Flanco', value: 12 }], depthOptions: [{ label: 'Periscopio 30m', value: 30 }, { label: 'Patrulla 60m', value: 60 }, { label: 'Profunda 120m', value: 120 }, { label: 'Crítica 200m', value: 200 }], headingOptions: [{ label: 'Norte 0°', value: 0 }, { label: 'Este 90°', value: 90 }, { label: 'Sur 180°', value: 180 }, { label: 'Oeste 270°', value: 270 }] }, cards: [{ title: 'Tripulación', value: '24', body: 'La tripulación espera; las estaciones detalladas llegan en la siguiente etapa con sonar y departamentos.' }, { title: 'Procedimiento', value: 'Manual', body: 'El capitán ya controla los parámetros principales que afectarán sigilo, intercepción y supervivencia.' }, { title: 'Próxima fase', value: 'Sonar', body: 'Esta base ya está lista para contactos acústicos, flujo del operador de sonar y rumbos enemigos.' }] },
    },
  },
};

export function getLocale(language) {
  return locales[language] ?? locales['pt-BR'];
}

export function getLanguages() {
  return Object.keys(locales);
}
