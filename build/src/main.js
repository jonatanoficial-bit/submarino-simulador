
const LAND_POLYS = [
  [[110,120],[250,80],[330,120],[360,230],[300,330],[230,300],[160,240],[100,180]],
  [[280,340],[360,330],[410,400],[400,530],[340,690],[270,620],[250,500]],
  [[560,120],[690,90],[760,130],[750,220],[640,220],[590,170]],
  [[620,230],[720,250],[770,330],[760,470],[710,620],[640,610],[600,500],[590,380]],
  [[760,120],[1010,130],[1120,220],[1110,320],[1020,350],[950,300],[850,320],[800,250]],
  [[980,520],[1090,540],[1140,620],[1040,670],[950,620]],
  [[460,650],[530,640],[560,690],[500,720],[440,700]]
];

(() => {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => [...document.querySelectorAll(s)];
  const saveKey = "submarineCommanderV260";

  const avatars = [
    { id: "captain", name: "Captain", real: true, src: "./assets/images/avatars/captain.png" },
    { id: "navigator", name: "Navigator", real: true, src: "./assets/images/avatars/navigator.png" },
    { id: "placeholder1", name: "Avatar 3", real: false },
    { id: "placeholder2", name: "Avatar 4", real: false },
    { id: "placeholder3", name: "Avatar 5", real: false }
  ];

  const missions = [
    { id: "atlantic", name: "Batalha do Atlântico", brief: "Intercepte um comboio e sobreviva ao contra-ataque das escoltas." },
    { id: "mediterranean", name: "Teatro do Mediterrâneo", brief: "Infiltre-se em águas apertadas, detecte contatos e recue vivo." },
    { id: "pacific", name: "Frente do Pacífico", brief: "Patrulha longa com encontro imprevisível de alvos militares." }
  ];

  const worlds = [
    { id: "north", name: "Atlântico Norte", brief: "Comboios e escoltas frequentes." },
    { id: "med", name: "Mediterrâneo", brief: "Rotas estreitas e contato rápido." },
    { id: "norway", name: "Mar da Noruega", brief: "Águas frias, visibilidade irregular." }
  ];

  const storeItems = [
    { id: "torpedoes", name: "Torpedos extras", cost: 90, effect: "+2 torpedos" },
    { id: "hull", name: "Blindagem de casco", cost: 180, effect: "+15 casco" },
    { id: "sonar", name: "Sonar refinado", cost: 150, effect: "+15 sonar" }
  ];

  const assetPaths = {
    playerSub: "./assets/images/vessels/player_sub.png",
    escort: "./assets/images/vessels/escort.png",
    cargo: "./assets/images/vessels/cargo.png",
    enemySub: "./assets/images/vessels/enemy_sub.png",
    torpedo: "./assets/images/effects/torpedo.png",
    explosion: "./assets/images/effects/explosion.png",
    sonar: "./assets/images/effects/sonar.png"
  };

  const assets = {};

  const state = {
    avatar: "captain",
    mission: "atlantic",
    world: "north",
    tab: "overview",
    career: { xp: 0, credits: 240, upgrades: [], completed: 0, rank: "Cadete" },
    nav: {
      title: "",
      subtitle: "",
      zoom: 1,
      heading: 0,
      speed: 0,
      pulse: 0,
      noise: 0,
      encounter: null,
      player: { x: 520, y: 210 },
      panX: 0,
      panY: 0,
      feed: "Pronto."
    },
    battle: {
      title: "",
      subtitle: "",
      heading: 0,
      targetHeading: 0,
      speed: 0,
      targetSpeed: 0,
      depth: 0,
      targetDepth: 0,
      hull: 100,
      engine: 100,
      sonarSys: 100,
      torpedoes: 6,
      pulse: 0,
      player: { x: 260, y: 380, w: 110, h: 48 },
      contacts: [],
      enemies: [],
      torps: [],
      explosions: []
    }
  };

  function saveState() {
    localStorage.setItem(saveKey, JSON.stringify({
      avatar: state.avatar,
      mission: state.mission,
      world: state.world,
      career: state.career
    }));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(saveKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.avatar) state.avatar = data.avatar;
      if (data.mission) state.mission = data.mission;
      if (data.world) state.world = data.world;
      if (data.career) state.career = data.career;
      return true;
    } catch (e) {
      return false;
    }
  }

  function rankFromXP(xp) {
    if (xp >= 1200) return "Capitão";
    if (xp >= 700) return "Comandante";
    if (xp >= 350) return "Tenente Comandante";
    if (xp >= 120) return "Tenente";
    return "Cadete";
  }

  function selectedAvatar() {
    return avatars.find(a => a.id === state.avatar) || avatars[0];
  }

  function selectedMission() {
    return missions.find(m => m.id === state.mission) || missions[0];
  }

  function selectedWorld() {
    return worlds.find(w => w.id === state.world) || worlds[0];
  }

  function avatarSrc() {
    return selectedAvatar().real ? selectedAvatar().src : "./assets/images/avatars/captain.png";
  }

  function show(screen) {
    qsa(".screen").forEach(el => el.classList.remove("active"));
    qs("#screen-" + screen).classList.add("active");
  }

  function loadImage(key, src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ key, img, ok: true });
      img.onerror = () => resolve({ key, img: null, ok: false });
      img.src = src;
    });
  }

  function pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function isLand(x, y) {
    return LAND_POLYS.some(poly => pointInPoly(x, y, poly));
  }

  function depthBand(depth) {
    if (depth === 0) return "Surface";
    if (depth <= 60) return "Periscope";
    if (depth <= 120) return "Patrol";
    if (depth <= 220) return "Deep";
    return "Critical";
  }

  function renderAvatarGrid() {
    const grid = qs("#avatarGrid");
    grid.innerHTML = "";
    avatars.forEach(a => {
      const btn = document.createElement("button");
      btn.className = "avatar-btn" + (a.id === state.avatar ? " selected" : "");
      btn.innerHTML = a.real
        ? `<img src="${a.src}" alt="${a.name}"><span>${a.name}</span>`
        : `<div class="avatar-placeholder">PROVISÓRIO</div><span>${a.name}</span>`;
      btn.onclick = () => {
        state.avatar = a.id;
        renderAvatarGrid();
      };
      grid.appendChild(btn);
    });
  }

  function applyUpgrades() {
    state.battle.torpedoes = 6 + (state.career.upgrades.includes("torpedoes") ? 2 : 0);
    state.battle.hull = 100 + (state.career.upgrades.includes("hull") ? 15 : 0);
    state.battle.sonarSys = 100 + (state.career.upgrades.includes("sonar") ? 15 : 0);
    state.battle.engine = 100;
  }

  function renderLobby() {
    state.career.rank = rankFromXP(state.career.xp);
    qs("#profileAvatar").src = avatarSrc();
    qs("#profileRank").textContent = `${state.career.rank} • ${selectedAvatar().name}`;
    qs("#profileStats").textContent = `XP ${state.career.xp} • Créditos ${state.career.credits} • Missões ${state.career.completed}`;

    const subInfo = [
      ["Classe", "Atlântico Mk.I"],
      ["Casco", Math.round(state.battle.hull) + "%"],
      ["Motor", Math.round(state.battle.engine) + "%"],
      ["Sonar", Math.round(state.battle.sonarSys) + "%"],
      ["Torpedos", state.battle.torpedoes]
    ];

    qs("#subInfo").innerHTML = subInfo.map(([l, v]) =>
      `<div class="stat-card"><div class="label">${l}</div><div class="value">${v}</div></div>`
    ).join("");

    qs("#careerSummary").innerHTML = [
      "Patente atual: " + state.career.rank,
      "Avatar ativo: " + selectedAvatar().name,
      "Créditos: " + state.career.credits,
      "Melhorias: " + state.career.upgrades.length,
      "Sistema de torpedo mais realista nesta fase"
    ].join("<br>");

    qs("#lastReport").innerHTML = [
      "Profundidade em faixas reais: superfície, periscópio, patrulha, profundo e crítico.",
      "Solução de tiro considera bearing e janela de disparo.",
      "Torpedo perde qualidade se disparado fora do alinhamento.",
      "Combate segue mais estável para celular."
    ].join("<br>");

    qsa(".lobby-tab").forEach(el => el.classList.remove("active"));
    qs("#tab-" + state.tab).classList.add("active");
    qsa(".tab-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === state.tab));

    const ml = qs("#missionList");
    ml.innerHTML = "";
    missions.forEach(m => {
      const d = document.createElement("div");
      d.className = "mission-item" + (m.id === state.mission ? " active" : "");
      d.innerHTML = `<strong>${m.name}</strong><div class="muted">${m.brief}</div>`;
      d.onclick = () => {
        state.mission = m.id;
        renderLobby();
      };
      ml.appendChild(d);
    });
    qs("#missionBrief").innerHTML = `<strong>${selectedMission().name}</strong><br><br>${selectedMission().brief}`;

    const wl = qs("#worldList");
    wl.innerHTML = "";
    worlds.forEach(w => {
      const d = document.createElement("div");
      d.className = "world-item" + (w.id === state.world ? " active" : "");
      d.innerHTML = `<strong>${w.name}</strong><div class="muted">${w.brief}</div>`;
      d.onclick = () => {
        state.world = w.id;
        renderLobby();
      };
      wl.appendChild(d);
    });

    const sl = qs("#storeList");
    sl.innerHTML = "";
    storeItems.forEach(i => {
      const owned = state.career.upgrades.includes(i.id);
      const d = document.createElement("div");
      d.className = "store-item" + (owned ? " active" : "");
      d.innerHTML = `<strong>${i.name}</strong><div class="muted">${i.effect}</div><div class="muted">Custo: ${i.cost} ${owned ? "• comprado" : ""}</div>`;
      d.onclick = () => {
        if (owned || state.career.credits < i.cost) return;
        state.career.credits -= i.cost;
        state.career.upgrades.push(i.id);
        applyUpgrades();
        renderLobby();
        saveState();
      };
      sl.appendChild(d);
    });
  }

  function startNav(mode) {
    state.nav.title = mode === "mission" ? selectedMission().name : `Patrulha: ${selectedWorld().name}`;
    state.nav.subtitle = mode === "mission" ? selectedMission().brief : selectedWorld().brief;
    state.nav.zoom = 1;
    state.nav.heading = 0;
    state.nav.speed = 0;
    state.nav.pulse = 0;
    state.nav.noise = 0;
    state.nav.encounter = null;
    state.nav.feed = "Navegação iniciada.";
    state.nav.player = mode === "mission"
      ? { x: 520, y: 210 }
      : (state.world === "med" ? { x: 680, y: 240 } : state.world === "norway" ? { x: 610, y: 100 } : { x: 360, y: 160 });
    qs("#navTitle").textContent = state.nav.title;
    qs("#navSub").textContent = state.nav.subtitle;
    qs("#encounterBtn").disabled = true;
    qs("#encounterInfo").textContent = "Nenhum encontro ativo.";
    show("navmap");
  }

  function createBattle(encounter) {
    applyUpgrades();
    state.battle.title = encounter.type === "enemySub" ? "Contato submarino hostil" : encounter.type === "escort" ? "Escolta detectada" : "Tráfego naval";
    state.battle.subtitle = "Disparo com janela de solução e profundidade em faixas.";
    state.battle.heading = 0;
    state.battle.targetHeading = 0;
    state.battle.speed = 0;
    state.battle.targetSpeed = 0;
    state.battle.depth = 0;
    state.battle.targetDepth = 0;
    state.battle.pulse = 0;
    state.battle.player = { x: 260, y: 380, w: 110, h: 48 };
    state.battle.contacts = [];
    state.battle.torps = [];
    state.battle.explosions = [];
    const templates = {
      escort: [
        { type: "escort", x: 980, y: 220, w: 100, h: 44, hp: 100, speed: 0.22, alive: true, state: "patrol" },
        { type: "cargo", x: 1030, y: 420, w: 110, h: 50, hp: 90, speed: 0.17, alive: true, state: "patrol" }
      ],
      enemySub: [
        { type: "enemySub", x: 970, y: 540, w: 98, h: 42, hp: 85, speed: 0.18, alive: true, state: "silent" }
      ],
      cargo: [
        { type: "cargo", x: 1020, y: 360, w: 110, h: 50, hp: 90, speed: 0.15, alive: true, state: "patrol" }
      ]
    };
    state.battle.enemies = templates[encounter.type].map(e => ({ ...e }));
    qs("#battleTitle").textContent = state.battle.title;
    qs("#battleSub").textContent = encounter.text;
    qs("#officerFeed").textContent = "Oficiais aguardando ordens.";
    qs("#tacticalFeed").textContent = "Nenhum contato confirmado.";
    qs("#fireSolution").textContent = "Aguardando alvo. Dica: reduza velocidade para diminuir ruído e melhorar detecção.";
    updateBattleInstruments();
    show("battle");
  }

  function updateBattleInstruments() {
    const heading = ((Math.round(state.battle.heading) % 360) + 360) % 360;
    const labels = {
      depthValue: `${Math.round(state.battle.depth)} m • ${depthBand(state.battle.depth)}`,
      headingValue: `${String(heading).padStart(3, "0")}°`,
      speedValue: `${Math.round(state.battle.speed)} nós`,
      hullValue: `${Math.max(0, Math.round(state.battle.hull))}%`,
      engineValue: `${Math.max(0, Math.round(state.battle.engine))}%`,
      sonarValue: `${Math.max(0, Math.round(state.battle.sonarSys))}%`
    };
    Object.entries(labels).forEach(([id, val]) => qs("#" + id).textContent = val);

    qs("#depthFill").style.width = Math.min(100, state.battle.depth / 3) + "%";
    qs("#headingFill").style.width = heading / 3.6 + "%";
    qs("#speedFill").style.width = Math.min(100, state.battle.speed * 10) + "%";

    [["hullFill", state.battle.hull], ["engineFill", state.battle.engine], ["sonarSysFill", state.battle.sonarSys]].forEach(([id, val]) => {
      const pct = Math.max(0, Math.min(100, val));
      const el = qs("#" + id);
      el.style.width = pct + "%";
      el.className = "fill " + (pct > 60 ? "safe" : pct > 30 ? "warn" : "danger");
    });
  }

  function drawImageSafe(ctx, img, x, y, w, h, fallback) {
    if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    else fallback();
  }

  function fallbackSub(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, 0);
    ctx.lineTo(w * 0.22, -h * 0.26);
    ctx.lineTo(w * 0.48, 0);
    ctx.lineTo(w * 0.22, h * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function worldLoop() {
    const canvas = qs("#worldCanvas");
    const ctx = canvas.getContext("2d");
    function step() {
      if (!qs("#screen-navmap").classList.contains("active")) {
        requestAnimationFrame(step);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0d3151";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const z = state.nav.zoom;
      const vpW = canvas.width / z;
      const vpH = canvas.height / z;
      state.nav.panX = Math.max(0, Math.min(1280 - vpW, state.nav.player.x - vpW / 2));
      state.nav.panY = Math.max(0, Math.min(760 - vpH, state.nav.player.y - vpH / 2));

      ctx.save();
      ctx.scale(z, z);
      ctx.translate(-state.nav.panX, -state.nav.panY);

      ctx.fillStyle = "#2e3f2b";
      ctx.strokeStyle = "rgba(255,255,255,0.09)";
      LAND_POLYS.forEach(poly => {
        ctx.beginPath();
        ctx.moveTo(poly[0][0], poly[0][1]);
        poly.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      const rad = (state.nav.heading - 90) * Math.PI / 180;
      const cx = state.nav.player.x + Math.cos(rad) * state.nav.speed * 0.35;
      const cy = state.nav.player.y + Math.sin(rad) * state.nav.speed * 0.35;

      if (!isLand(cx, cy)) {
        state.nav.player.x = Math.max(20, Math.min(1260, cx));
        state.nav.player.y = Math.max(20, Math.min(740, cy));
      } else {
        state.nav.feed = "Rota bloqueada por terra.";
        state.nav.speed = 0;
      }

      state.nav.noise = state.nav.speed * 8 + (state.nav.pulse > 0 ? 15 : 0);

      if (state.nav.pulse > 0) {
        state.nav.pulse -= 1;
        const size = 140 + state.nav.pulse * 2.6;
        ctx.save();
        ctx.globalAlpha = Math.min(0.45, state.nav.pulse / 100);
        if (assets.sonar) ctx.drawImage(assets.sonar, state.nav.player.x - size / 2, state.nav.player.y - size / 2, size, size);
        ctx.restore();
      }

      drawImageSafe(ctx, assets.playerSub, state.nav.player.x, state.nav.player.y, 48, 22, () => fallbackSub(ctx, state.nav.player.x, state.nav.player.y, 48, 22, "#55c8ff"));

      if (state.nav.encounter) {
        const ex = state.nav.encounter.x, ey = state.nav.encounter.y;
        ctx.fillStyle = state.nav.encounter.type === "enemySub" ? "#b695ff" : state.nav.encounter.type === "escort" ? "#ff8e8e" : "#ffbd8a";
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(ex, ey, 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      if (!state.nav.encounter && state.nav.speed > 0) {
        const chance = Math.min(0.015, 0.0015 + state.nav.noise / 2000);
        if (Math.random() < chance) {
          const roll = Math.random();
          const type = roll < 0.34 ? "cargo" : roll < 0.67 ? "escort" : "enemySub";
          state.nav.encounter = {
            type,
            x: state.nav.player.x + 120,
            y: state.nav.player.y,
            text: type === "enemySub" ? "Submarino hostil detectado no setor." : type === "escort" ? "Escolta hostil avistada." : "Tráfego naval identificado."
          };
          qs("#encounterBtn").disabled = false;
          qs("#encounterInfo").textContent = state.nav.encounter.text;
          state.nav.feed = "Encontro detectado. Você decide quando entrar em combate.";
        }
      }

      qs("#mapNameValue").textContent = state.nav.title;
      qs("#zoomValue").textContent = state.nav.zoom.toFixed(1) + "x";
      qs("#courseValue").textContent = `${String((((Math.round(state.nav.heading) % 360) + 360) % 360)).padStart(3, "0")}°`;
      qs("#mapSpeedValue").textContent = Math.round(state.nav.speed) + " nós";
      qs("#mapFeed").textContent = `${state.nav.feed} | Ruído: ${Math.round(state.nav.noise)}`;

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function updateContacts() {
    const p = state.battle.player;
    let crewBonus = 1;
    if(state.career.upgrades.includes('sonar')) crewBonus = 0.8;
    const noise = (state.battle.speed * 8 + (state.battle.depth < 20 ? 10 : state.battle.depth < 80 ? 5 : 2)) * crewBonus;
    state.battle.contacts = state.battle.enemies.filter(e => e.alive).map(e => {
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);
      const bearing = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const certainty = Math.max(0, Math.min(100, (state.battle.sonarSys / 100) * 100 - dist / 7 + noise / 4 + (state.battle.pulse > 0 ? 18 : 0) + (Math.random() * 12 - 6)));
      return {
        type: e.type,
        bearing: Math.round(bearing),
        certainty,
        approxDistance: Math.round(dist + (Math.random() * 80 - 40)),
        status: certainty > 65 ? "confirmado" : certainty > 35 ? "suspeito" : "fraco",
        dist
      };
    }).filter(c => c.certainty > 15).sort((a, b) => b.certainty - a.certainty);
  }

  function updateFireSolution() {
    const c = state.battle.contacts[0];
    if (!c) {
      qs("#fireSolution").textContent = "Aguardando alvo. Dica: reduza velocidade para diminuir ruído e melhorar detecção.";
      return;
    }
    const heading = ((state.battle.heading % 360) + 360) % 360;
    const diff = Math.min(Math.abs(c.bearing - heading), 360 - Math.abs(c.bearing - heading));
    const range = c.approxDistance;
    const depthOk = state.battle.depth <= 120;
    let quality = "Baixa";
    if (diff < 18 && range < 280 && depthOk) quality = "Alta";
    else if (diff < 35 && range < 450) quality = "Média";
    const band = depthBand(state.battle.depth);
    qs("#fireSolution").textContent = `Alvo principal: ${c.type} | Bearing ${c.bearing}° | Distância ~${range}m | Solução: ${quality} | Faixa: ${band}`;
  }

  function battleLoop() {
    const canvas = qs("#battleCanvas");
    const ctx = canvas.getContext("2d");
    function step() {
      if (!qs("#screen-battle").classList.contains("active")) {
        requestAnimationFrame(step);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, "#0e314d");
      g.addColorStop(0.45, "#08253a");
      g.addColorStop(1, "#04101b");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      for (let x = 0; x < canvas.width; x += 90) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 90) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      state.battle.heading += (state.battle.targetHeading - state.battle.heading) * 0.12;
      state.battle.speed += (state.battle.targetSpeed - state.battle.speed) * 0.08;
      state.battle.depth += (state.battle.targetDepth - state.battle.depth) * 0.06;
      if (state.battle.pulse > 0) state.battle.pulse -= 1;

      const p = state.battle.player;
      const move = state.battle.speed * 0.28 * Math.max(0.3, state.battle.engine / 100);
      p.x = Math.max(140, Math.min(520, p.x + Math.cos((state.battle.heading - 90) * Math.PI / 180) * move));
      p.y = Math.max(100, Math.min(660, p.y + Math.sin((state.battle.heading - 90) * Math.PI / 180) * move));

      if (state.battle.depth > 220 && Math.random() < 0.04) {
        state.battle.hull -= 0.8;
        qs("#officerFeed").textContent = "Profundidade crítica. Estrutura do casco sob pressão.";
      }

      if (state.battle.pulse > 0) {
        const size = 200 + state.battle.pulse * 2.4;
        ctx.save();
        ctx.globalAlpha = Math.min(0.5, state.battle.pulse / 100);
        drawImageSafe(ctx, assets.sonar, p.x, p.y, size, size, () => {
          ctx.strokeStyle = "rgba(110,240,255,0.35)";
          for (let r = 50; r < size / 2; r += 36) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
        ctx.restore();
      }

      state.battle.enemies.forEach(e => {
        if (!e.alive) return;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.hypot(dx, dy);
        const noise = state.battle.speed * 8 + (state.battle.depth < 30 ? 10 : state.battle.depth < 100 ? 5 : 2);

        if (e.type === "escort") {
          e.state = dist < 300 + noise * 2 ? "attack" : dist < 520 ? "search" : "patrol";
          if (e.state === "attack") { e.x -= e.speed * 0.28; e.y += (dy > 0 ? 0.22 : -0.22); }
          else if (e.state === "search") { e.x -= e.speed * 0.16; }
          else { e.x -= e.speed * 0.08; }
        }

        if (e.type === "enemySub") {
          e.state = dist < 260 + noise * 1.5 && state.battle.depth > 20 ? "shadow" : dist < 500 ? "search" : "silent";
          if (e.state === "shadow") { e.x -= e.speed * 0.18; e.y += (dy > 0 ? 0.14 : -0.14); }
          else if (e.state === "search") { e.x -= e.speed * 0.10; }
          else { e.x -= e.speed * 0.04; }
        }

        if (e.type === "cargo") {
          e.state = dist < 280 ? "evade" : "patrol";
          if (e.state === "evade") e.x += 0.18;
          else e.x -= e.speed * 0.05;
        }

        if (dist < 180 && Math.random() < (e.type === "escort" ? 0.01 : e.type === "enemySub" ? 0.008 : 0.002)) {
          const roll = Math.random();
          const damage = e.type === "escort" ? (4 + Math.random() * 2) : e.type === "enemySub" ? (5 + Math.random() * 3) : 2;
          if (roll < 0.5) state.battle.hull -= damage * (state.career.upgrades.includes('hull') ? 0.8 : 1);
          else if (roll < 0.8) state.battle.engine -= damage;
          else state.battle.sonarSys -= damage;
        }

        const color = e.type === "escort" ? "#ff8e8e" : e.type === "cargo" ? "#ffbd8a" : "#b695ff";
        drawImageSafe(ctx, assets[e.type], e.x, e.y, e.w, e.h, () => fallbackSub(ctx, e.x, e.y, e.w, e.h, color));
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(e.x - 36, e.y - e.h / 2 - 14, 72, 6);
        ctx.fillStyle = "#67e29a";
        ctx.fillRect(e.x - 36, e.y - e.h / 2 - 14, 72 * (e.hp / 100), 6);
      });

      updateContacts();
      updateFireSolution();

      state.battle.torps.forEach(t => { t.x += t.vx; t.y += t.vy; });
      state.battle.explosions.forEach(ex => { ex.life -= 1; });
      state.battle.torps = state.battle.torps.filter(t => t.x < canvas.width + 150 && t.y > -100 && t.y < canvas.height + 100);
      state.battle.explosions = state.battle.explosions.filter(ex => ex.life > 0);

      state.battle.torps.forEach(t => {
        drawImageSafe(ctx, assets.torpedo, t.x, t.y, 56, 22, () => {
          ctx.fillStyle = "#ddd";
          ctx.fillRect(t.x - 22, t.y - 4, 44, 8);
        });
        state.battle.enemies.forEach(e => {
          if (!e.alive) return;
          if (Math.abs(t.x - e.x) < 48 && Math.abs(t.y - e.y) < 28) {
            e.hp -= 55;
            t.x = canvas.width + 999;
            state.battle.explosions.push({ x: e.x, y: e.y, size: 140, life: 24, maxLife: 24 });
            if (e.hp <= 0) {
              e.alive = false;
              state.career.xp += 80;
              state.career.credits += 55;
              state.career.completed += 1;
              state.career.rank = rankFromXP(state.career.xp);
              saveState();
            }
          }
        });
      });

      state.battle.explosions.forEach(ex => {
        ctx.save();
        ctx.globalAlpha = ex.life / ex.maxLife;
        drawImageSafe(ctx, assets.explosion, ex.x, ex.y, ex.size, ex.size, () => {
          ctx.fillStyle = "rgba(255,120,50,0.7)";
          ctx.beginPath();
          ctx.arc(ex.x, ex.y, ex.size / 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });

      drawImageSafe(ctx, assets.playerSub, p.x, p.y, p.w, p.h, () => fallbackSub(ctx, p.x, p.y, p.w, p.h, state.battle.depth > 20 ? "#8fe9ff" : "#55c8ff"));

      const top = state.battle.contacts[0];
      ctx.fillStyle = "rgba(0,0,0,0.26)";
      ctx.fillRect(canvas.width - 300, 20, 270, 150);
      ctx.fillStyle = "#d6f3ff";
      ctx.font = "16px Arial";
      ctx.fillText(`Avatar: ${selectedAvatar().name}`, canvas.width - 282, 48);
      ctx.fillText(`Torpedos: ${state.battle.torpedoes}`, canvas.width - 282, 72);
      ctx.fillText(`Profundidade alvo: ${Math.round(state.battle.targetDepth)}m`, canvas.width - 282, 96);
      ctx.fillText(`Contatos: ${state.battle.contacts.length}`, canvas.width - 282, 120);
      if (top) ctx.fillText(`${top.type} • ${top.status} • ~${top.approxDistance}m`, canvas.width - 282, 144);

      qs("#tacticalFeed").textContent = state.battle.contacts.map(c => `${c.type} • ${c.status} • ${c.bearing}° • ~${c.approxDistance}m`).join(" | ") || "Nenhum contato confirmado.";
      updateBattleInstruments();

      state.battle.hull = Math.max(0, state.battle.hull);
      state.battle.engine = Math.max(0, state.battle.engine);
      state.battle.sonarSys = Math.max(0, state.battle.sonarSys);
      if (state.battle.hull <= 0) qs("#officerFeed").textContent = "Casco crítico. Naufrágio provável.";

      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initUI() {
    renderAvatarGrid();
    renderLobby();

    qs("#newGameBtn").onclick = () => show("avatar");
    qs("#continueBtn").onclick = () => {
      loadState();
      renderAvatarGrid();
      renderLobby();
      show("lobby");
    };
    qs("#avatarBackBtn").onclick = () => show("start");
    qs("#avatarNextBtn").onclick = () => {
      renderLobby();
      saveState();
      show("lobby");
    };

    qsa(".tab-btn").forEach(btn => btn.onclick = () => {
      state.tab = btn.dataset.tab;
      renderLobby();
    });

    qs("#launchMissionBtn").onclick = () => {
      saveState();
      startNav("mission");
    };

    qs("#launchWorldBtn").onclick = () => {
      saveState();
      startNav("openworld");
    };

    qs("#backLobbyFromMapBtn").onclick = () => {
      renderLobby();
      show("lobby");
    };

    qs("#backMapBtn").onclick = () => show("navmap");

    qs("#encounterBtn").onclick = () => {
      if (state.nav.encounter) createBattle(state.nav.encounter);
    };

    qs("#zoomInBtn").onclick = () => { state.nav.zoom = Math.min(2.4, state.nav.zoom + 0.2); };
    qs("#zoomOutBtn").onclick = () => { state.nav.zoom = Math.max(0.8, state.nav.zoom - 0.2); };
    qs("#mapSonarBtn").onclick = () => { state.nav.pulse = 100; state.nav.feed = "Pulso de sonar emitido."; };
    qs("#forceEncounterBtn").onclick = () => {
      if (!state.nav.encounter) {
        const type = Math.random() < 0.5 ? "escort" : "enemySub";
        state.nav.encounter = { type, x: state.nav.player.x + 120, y: state.nav.player.y, text: type === "escort" ? "Escolta hostil detectada." : "Submarino hostil detectado." };
        qs("#encounterBtn").disabled = false;
        qs("#encounterInfo").textContent = state.nav.encounter.text;
      }
    };

    qsa("[data-mapdir]").forEach(btn => btn.onclick = () => {
      const d = btn.dataset.mapdir;
      if (d === "left") state.nav.heading -= 12;
      if (d === "right") state.nav.heading += 12;
      if (d === "up") state.nav.speed = Math.min(10, state.nav.speed + 2);
      if (d === "down") state.nav.speed = Math.max(0, state.nav.speed - 2);
      if (d === "stop") state.nav.speed = 0;
    });

    qs("#sonarBtn").onclick = () => {
      if (state.battle.sonarSys > 0) state.battle.pulse = 100;
    };

    qs("#diveBtn").onclick = () => {
      state.battle.targetDepth = state.battle.targetDepth === 0 ? 60 : state.battle.targetDepth === 60 ? 120 : state.battle.targetDepth === 120 ? 220 : 0;
    };

    qs("#torpedoBtn").onclick = () => {
      if (state.battle.torpedoes <= 0) return;
      const top = state.battle.contacts[0];
      if (!top) {
        qs("#fireSolution").textContent = "Sem contato válido. Use sonar primeiro.";
        return;
      }
      const heading = ((state.battle.heading % 360) + 360) % 360;
      const diff = Math.min(Math.abs(top.bearing - heading), 360 - Math.abs(top.bearing - heading));
      const range = top.approxDistance;
      let spreadPenalty = 1.0;
      if (diff > 35) spreadPenalty = 0.45;
      else if (diff > 20) spreadPenalty = 0.7;
      if (range > 500) spreadPenalty *= 0.65;
      if (state.battle.depth > 120) spreadPenalty *= 0.8;

      state.battle.torpedoes -= 1;
      const a = (state.battle.heading - 90) * Math.PI / 180;
      state.battle.torps.push({
        x: state.battle.player.x + Math.cos(a) * 50,
        y: state.battle.player.y + Math.sin(a) * 50,
        vx: Math.cos(a) * 8 * spreadPenalty,
        vy: Math.sin(a) * 8 * spreadPenalty
      });
      qs("#fireSolution").textContent = `Disparo realizado. Qualidade estimada: ${spreadPenalty > 0.85 ? "Alta" : spreadPenalty > 0.6 ? "Média" : "Baixa"}.`;
    };

    qs("#repairBtn").onclick = () => {
      state.battle.hull = Math.min(100, state.battle.hull + 6);
      state.battle.engine = Math.min(100, state.battle.engine + 5);
      state.battle.sonarSys = Math.min(100, state.battle.sonarSys + 4);
      qs("#officerFeed").textContent = "Equipe de reparo mobilizada.";
    };

    qsa(".officerBtn").forEach(btn => btn.onclick = () => {
      const t = btn.dataset.officer;
      const map = {
        mechanic: "Mecânico: estabilizando casco e motor.",
        sonar: "Sonarista: contatos fracos e variáveis; manter silêncio.",
        weapons: "Oficial de armas: alvo principal marcado para melhor solução de tiro."
      };
      qs("#officerFeed").textContent = map[t];
      if (t === "mechanic") {
        state.battle.hull = Math.min(100, state.battle.hull + 12);
        state.battle.engine = Math.min(100, state.battle.engine + 8);
        state.battle.hull = Math.min(100, state.battle.hull + 8);
        state.battle.engine = Math.min(100, state.battle.engine + 5);
      }
      if (t === "sonar") {
        state.battle.pulse = 140;
        state.battle.sonarSys = Math.min(100, state.battle.sonarSys + 5);
      }
      if (t === "weapons") {
        updateFireSolution();
        state.battle.targetSpeed = Math.max(0, state.battle.targetSpeed - 1);
      }
    });

    qsa("[data-dir]").forEach(btn => btn.onclick = () => {
      const d = btn.dataset.dir;
      if (d === "left") state.battle.targetHeading -= 6;
      if (d === "right") state.battle.targetHeading += 6;
      if (d === "up") state.battle.targetSpeed = Math.min(10, state.battle.targetSpeed + 1);
      if (d === "down") state.battle.targetSpeed = Math.max(0, state.battle.targetSpeed - 1);
      if (d === "stop") state.battle.targetSpeed = 0;
    });

    document.addEventListener("keydown", (e) => {
      if (qs("#screen-navmap").classList.contains("active")) {
        if (e.key === "ArrowLeft") state.nav.heading -= 10;
        if (e.key === "ArrowRight") state.nav.heading += 10;
        if (e.key === "ArrowUp") state.nav.speed = Math.min(10, state.nav.speed + 2);
        if (e.key === "ArrowDown") state.nav.speed = Math.max(0, state.nav.speed - 2);
      }
      if (qs("#screen-battle").classList.contains("active")) {
        if (e.key === "ArrowLeft") state.battle.targetHeading -= 10;
        if (e.key === "ArrowRight") state.battle.targetHeading += 10;
        if (e.key === "ArrowUp") state.battle.targetSpeed = Math.min(10, state.battle.targetSpeed + 1);
        if (e.key === "ArrowDown") state.battle.targetSpeed = Math.max(0, state.battle.targetSpeed - 1);
        if (e.key === " ") {
          e.preventDefault();
          qs("#torpedoBtn").click();
        }
        if (e.key.toLowerCase() === "s") qs("#sonarBtn").click();
        if (e.key.toLowerCase() === "d") qs("#diveBtn").click();
      }
    });
  }

  Promise.all(Object.entries(assetPaths).map(([k, src]) => loadImage(k, src))).then(results => {
    let ok = 0;
    results.forEach(r => {
      assets[r.key] = r.img;
      if (r.ok) ok += 1;
    });
    qs("#statusChip").textContent = ok === results.length ? "Assets carregados" : `Assets ${ok}/${results.length}`;
    initUI();
    worldLoop();
    battleLoop();
  });
})();
