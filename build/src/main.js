
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const loadStatus = document.getElementById('loadStatus');
  const fireBtn = document.getElementById('fireBtn');
  const sonarBtn = document.getElementById('sonarBtn');
  const resetBtn = document.getElementById('resetBtn');
  const surfaceBtn = document.getElementById('surfaceBtn');
  const quickStats = document.getElementById('quickStats');
  const careerStats = document.getElementById('careerStats');
  const summaryBox = document.getElementById('summaryBox');
  const missionList = document.getElementById('missionList');
  const briefingBox = document.getElementById('briefingBox');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarDescription = document.getElementById('avatarDescription');

  const ASSET_PATHS = {
    playerSub: './assets/images/vessels/player_sub.png',
    escort: './assets/images/vessels/escort.png',
    cargo: './assets/images/vessels/cargo.png',
    enemySub: './assets/images/vessels/enemy_sub.png',
    torpedo: './assets/images/effects/torpedo.png',
    explosion: './assets/images/effects/explosion.png',
    sonar: './assets/images/effects/sonar.png',
  };

  const missions = [
    { id: 'patrol', name: 'Patrulha no Atlântico', text: 'Localize e ataque um comboio leve sem perder o submarino.' },
    { id: 'intercept', name: 'Interceptação de Comboio', text: 'Destrua escolta e cargueiro. Use sonar com inteligência.' },
    { id: 'hunter', name: 'Caça Submarina', text: 'Um submarino inimigo foi detectado. Ataque antes de ser detectado.' }
  ];

  const assets = {};
  const avatarButtons = [...document.querySelectorAll('.avatar-btn')];
  const navButtons = [...document.querySelectorAll('.nav-btn')];
  const screenEls = [...document.querySelectorAll('.screen')];
  const avatarSelectButtons = [...document.querySelectorAll('.avatar-select-btn')];
  let selectedAvatar = 'captain';
  let selectedMission = missions[0];

  function loadImage(key, src){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ key, img, ok: true });
      img.onerror = () => resolve({ key, img: null, ok: false });
      img.src = src;
    });
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  const state = {
    loaded: 0,
    total: Object.keys(ASSET_PATHS).length,
    player: { x: 190, y: 350, w: 270, h: 120, hp: 100, torpedoes: 6, submerged: false },
    enemies: [],
    torpedoes: [],
    explosions: [],
    sonarPulse: 0,
    kills: 0,
    credits: 320,
    xp: 180,
    frame: 0
  };

  function makeEnemies(){
    state.enemies = [
      { type: 'escort', x: 810, y: 170, w: 250, h: 118, hp: 100, alive: true, speed: 0.28 },
      { type: 'cargo', x: 860, y: 350, w: 250, h: 118, hp: 90, alive: true, speed: 0.18 },
      { type: 'enemySub', x: 860, y: 540, w: 260, h: 108, hp: 80, alive: true, speed: 0.22 },
    ];
    state.torpedoes = [];
    state.explosions = [];
    state.kills = 0;
    state.player.hp = 100;
    state.player.torpedoes = 6;
    state.player.x = 190;
    state.player.y = 350;
    state.player.submerged = false;
    state.sonarPulse = 0;
    renderStats();
  }

  function statBlock(label, value){
    return `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`;
  }

  function renderStats(){
    quickStats.innerHTML = [
      statBlock('Hull', `${Math.round(state.player.hp)}%`),
      statBlock('Torpedoes', state.player.torpedoes),
      statBlock('Mode', state.player.submerged ? 'Submerged' : 'Surface'),
      statBlock('Kills', state.kills)
    ].join('');

    careerStats.innerHTML = [
      statBlock('XP', state.xp),
      statBlock('Credits', state.credits),
      statBlock('Avatar', selectedAvatar),
      statBlock('Mission', selectedMission.name),
      statBlock('Assets', `${state.loaded}/${state.total}`),
      statBlock('Build', 'v1.3.0')
    ].join('');

    summaryBox.innerHTML = [
      'Lobby restaurado com navegação lateral.',
      'Tela de missões com briefing funcional.',
      'Tela de carreira com frota visual.',
      'Seleção de avatar separada.',
      'Batalha com sonar, torpedo e submersão.'
    ].join('<br>');
  }

  function renderMissionList(){
    missionList.innerHTML = '';
    missions.forEach(m => {
      const div = document.createElement('div');
      div.className = 'mission-item' + (m.id === selectedMission.id ? ' active' : '');
      div.innerHTML = `<strong>${m.name}</strong><div style="color:#9eb8cb;margin-top:6px">${m.text}</div>`;
      div.onclick = () => {
        selectedMission = m;
        renderMissionList();
        briefingBox.innerHTML = `<strong>${m.name}</strong><br><br>${m.text}`;
        renderStats();
      };
      missionList.appendChild(div);
    });
    briefingBox.innerHTML = `<strong>${selectedMission.name}</strong><br><br>${selectedMission.text}`;
  }

  function showScreen(screen){
    screenEls.forEach(el => el.classList.remove('active'));
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById('screen-' + screen).classList.add('active');
    document.querySelector(`.nav-btn[data-screen="${screen}"]`).classList.add('active');
  }

  function drawFallbackSub(x, y, w, h, color){
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
    ctx.fillRect(-12, -16, 24, 32);
    ctx.restore();
  }

  function drawImageSafe(img, x, y, w, h, fallback){
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    } else {
      fallback();
    }
  }

  function drawOcean(){
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#0e314d');
    g.addColorStop(0.45, '#08253a');
    g.addColorStop(1, '#04101b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < canvas.width; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  function drawSonarPulse(){
    if (state.sonarPulse <= 0) return;
    const p = state.player;
    const img = assets.sonar;
    const size = 180 + state.sonarPulse * 3.1;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(0.55, state.sonarPulse / 100));
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size);
    } else {
      ctx.strokeStyle = 'rgba(110,240,255,0.35)';
      ctx.lineWidth = 2;
      for (let r = 50; r < size / 2; r += 38) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPlayer(){
    const p = state.player;
    drawImageSafe(
      assets.playerSub,
      p.x, p.y, p.w, p.h,
      () => drawFallbackSub(p.x, p.y, p.w, p.h, p.submerged ? '#8fe9ff' : '#55c8ff')
    );

    const avatarImg = document.querySelector(`.avatar-btn[data-avatar="${selectedAvatar}"] img`);
    if (avatarImg && avatarImg.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 95, 42, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 58, 53, 84, 84);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(100, 95, 42, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawEnemies(){
    for (const e of state.enemies) {
      if (!e.alive) continue;
      const img = assets[e.type];
      const color = e.type === 'escort' ? '#ff8e8e' : e.type === 'cargo' ? '#ffbd8a' : '#b695ff';
      drawImageSafe(img, e.x, e.y, e.w, e.h, () => drawFallbackSub(e.x, e.y, e.w, e.h, color));

      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(e.x - 52, e.y - e.h / 2 - 18, 104, 8);
      ctx.fillStyle = '#67e29a';
      ctx.fillRect(e.x - 52, e.y - e.h / 2 - 18, 104 * (e.hp / 100), 8);
    }
  }

  function drawTorpedoes(){
    for (const t of state.torpedoes) {
      drawImageSafe(
        assets.torpedo,
        t.x, t.y, 100, 40,
        () => {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.fillStyle = '#d8d8d8';
          ctx.fillRect(-38, -6, 76, 12);
          ctx.restore();
        }
      );
    }
  }

  function drawExplosions(){
    for (const ex of state.explosions) {
      const size = ex.size;
      ctx.save();
      ctx.globalAlpha = ex.life / ex.maxLife;
      drawImageSafe(
        assets.explosion,
        ex.x, ex.y, size, size,
        () => {
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255,150,70,0.7)';
          ctx.arc(ex.x, ex.y, size / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      );
      ctx.restore();
    }
  }

  function drawHUD(){
    ctx.fillStyle = 'rgba(0,0,0,0.26)';
    ctx.fillRect(canvas.width - 230, 20, 200, 100);
    ctx.fillStyle = '#d6f3ff';
    ctx.font = '16px Arial';
    ctx.fillText(`Avatar: ${selectedAvatar}`, canvas.width - 212, 48);
    ctx.fillText(`Loaded assets: ${state.loaded}/${state.total}`, canvas.width - 212, 74);
    ctx.fillText(`Mission: ${selectedMission.name}`, canvas.width - 212, 100);
  }

  function fireTorpedo(){
    if (state.player.torpedoes <= 0) return;
    state.player.torpedoes -= 1;
    state.torpedoes.push({ x: state.player.x + 110, y: state.player.y, vx: 7.2 });
    renderStats();
  }

  function sonarPulse(){ state.sonarPulse = 100; }

  function toggleDive(){
    state.player.submerged = !state.player.submerged;
    state.player.h = state.player.submerged ? 96 : 120;
    renderStats();
  }

  function update(){
    state.frame += 1;
    if (state.sonarPulse > 0) state.sonarPulse -= 1;
    for (const e of state.enemies) {
      if (!e.alive) continue;
      e.x -= e.speed;
      if (e.x < 700) e.x += Math.sin(state.frame / 25) * 0.6;
    }
    for (const t of state.torpedoes) t.x += t.vx;
    for (const ex of state.explosions) ex.life -= 1;

    state.torpedoes = state.torpedoes.filter(t => t.x < canvas.width + 120);
    state.explosions = state.explosions.filter(ex => ex.life > 0);

    for (const t of state.torpedoes) {
      for (const e of state.enemies) {
        if (!e.alive) continue;
        const hit = Math.abs(t.x - e.x) < 80 && Math.abs(t.y - e.y) < 44;
        if (hit) {
          e.hp -= 55;
          t.x = canvas.width + 999;
          state.explosions.push({ x: e.x, y: e.y, size: 180, life: 28, maxLife: 28 });
          if (e.hp <= 0) {
            e.alive = false;
            state.kills += 1;
          }
          renderStats();
        }
      }
    }
  }

  function render(){
    drawOcean();
    drawSonarPulse();
    drawEnemies();
    drawPlayer();
    drawTorpedoes();
    drawExplosions();
    drawHUD();
  }

  function loop(){
    update();
    render();
    requestAnimationFrame(loop);
  }

  function movePlayer(dx, dy){
    state.player.x = clamp(state.player.x + dx, 120, 520);
    state.player.y = clamp(state.player.y + dy, 120, 580);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') movePlayer(0, -12);
    if (e.key === 'ArrowDown') movePlayer(0, 12);
    if (e.key === 'ArrowLeft') movePlayer(-12, 0);
    if (e.key === 'ArrowRight') movePlayer(12, 0);
    if (e.key === ' ') { e.preventDefault(); fireTorpedo(); }
    if (e.key.toLowerCase() === 's') sonarPulse();
    if (e.key.toLowerCase() === 'd') toggleDive();
  });

  fireBtn.addEventListener('click', fireTorpedo);
  sonarBtn.addEventListener('click', sonarPulse);
  surfaceBtn.addEventListener('click', toggleDive);
  resetBtn.addEventListener('click', makeEnemies);

  document.getElementById('startMissionFromLobby').onclick = () => showScreen('battle');
  document.getElementById('goCareerFromLobby').onclick = () => showScreen('career');
  document.getElementById('launchMissionBtn').onclick = () => showScreen('battle');
  document.getElementById('goBattleBtn').onclick = () => showScreen('battle');

  avatarButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      avatarButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.dataset.avatar;
      avatarPreview.src = btn.querySelector('img').src;
      avatarDescription.textContent = selectedAvatar === 'captain'
        ? 'Captain selecionado: perfil de liderança e presença forte.'
        : 'Navigator selecionado: perfil estratégico com binóculo e leitura tática.';
      renderStats();
    });
  });

  avatarSelectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedAvatar = btn.dataset.avatar;
      const ref = document.querySelector(`.avatar-btn[data-avatar="${selectedAvatar}"]`);
      avatarButtons.forEach(b => b.classList.remove('selected'));
      ref.classList.add('selected');
      avatarPreview.src = ref.querySelector('img').src;
      avatarDescription.textContent = selectedAvatar === 'captain'
        ? 'Captain selecionado: perfil de liderança e presença forte.'
        : 'Navigator selecionado: perfil estratégico com binóculo e leitura tática.';
      renderStats();
    });
  });

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });

  function initUI(){
    renderMissionList();
    renderStats();
    makeEnemies();
  }

  Promise.all(Object.entries(ASSET_PATHS).map(([key, src]) => loadImage(key, src))).then((results) => {
    let okCount = 0;
    for (const r of results) {
      assets[r.key] = r.img;
      if (r.ok) okCount += 1;
    }
    state.loaded = okCount;
    loadStatus.textContent = okCount === state.total
      ? 'Assets loaded successfully'
      : `Loaded ${okCount}/${state.total} assets`;
    initUI();
    loop();
  });
})();
