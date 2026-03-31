
(() => {
  const qs = s => document.querySelector(s);
  const qsa = s => [...document.querySelectorAll(s)];
  const saveKey = 'submarineCommanderRestructuredV2';

  const avatars = [
    { id:'captain', name:'Captain', real:true, src:'./assets/images/avatars/captain.png', desc:'Perfil principal de liderança.' },
    { id:'navigator', name:'Navigator', real:true, src:'./assets/images/avatars/navigator.png', desc:'Perfil estratégico com leitura tática.' },
    { id:'placeholder1', name:'Avatar 3', real:false, desc:'Placeholder provisório.' },
    { id:'placeholder2', name:'Avatar 4', real:false, desc:'Placeholder provisório.' },
    { id:'placeholder3', name:'Avatar 5', real:false, desc:'Placeholder provisório.' }
  ];
  const missions = [
    { id:'atlantic', name:'Batalha do Atlântico', brief:'Intercepte um comboio e sobreviva ao contra-ataque das escoltas.' },
    { id:'mediterranean', name:'Teatro do Mediterrâneo', brief:'Infiltre-se em águas apertadas, detecte contatos e recue vivo.' },
    { id:'pacific', name:'Frente do Pacífico', brief:'Patrulha longa com encontro imprevisível de alvos militares.' }
  ];
  const worlds = [
    { id:'north', name:'Atlântico Norte', brief:'Comboios e escoltas frequentes.' },
    { id:'med', name:'Mediterrâneo', brief:'Rotas estreitas e contato rápido.' },
    { id:'norway', name:'Mar da Noruega', brief:'Águas frias, visibilidade irregular.' }
  ];
  const storeItems = [
    { id:'torpedoes', name:'Torpedos extras', cost:90, effect:'+2 torpedos' },
    { id:'hull', name:'Blindagem de casco', cost:180, effect:'+15 casco' },
    { id:'sonar', name:'Sonar refinado', cost:150, effect:'+15 sonar' }
  ];
  const assetPaths = {
    playerSub:'./assets/images/vessels/player_sub.png',
    escort:'./assets/images/vessels/escort.png',
    cargo:'./assets/images/vessels/cargo.png',
    enemySub:'./assets/images/vessels/enemy_sub.png',
    torpedo:'./assets/images/effects/torpedo.png',
    explosion:'./assets/images/effects/explosion.png',
    sonar:'./assets/images/effects/sonar.png'
  };
  const assets = {};
  const state = {
    avatar:'captain',
    mission:'atlantic',
    world:'north',
    tab:'overview',
    career:{ xp:0, credits:240, upgrades:[], completed:0, rank:'Cadete' },
    battle:{
      mode:'mission',
      title:'',
      subtitle:'',
      heading:0, targetHeading:0,
      speed:0, targetSpeed:0,
      depth:0, targetDepth:0,
      hull:100, sonar:100, torpedoes:6,
      pulse:0, player:{x:260,y:380,w:280,h:120},
      enemies:[], torps:[], explosions:[]
    }
  };

  function saveState(){
    localStorage.setItem(saveKey, JSON.stringify({ avatar:state.avatar, mission:state.mission, world:state.world, career:state.career }));
  }
  function loadState(){
    try{
      const raw = localStorage.getItem(saveKey);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.avatar) state.avatar = data.avatar;
      if (data.mission) state.mission = data.mission;
      if (data.world) state.world = data.world;
      if (data.career) state.career = data.career;
      return true;
    }catch(e){ return false; }
  }
  function rankFromXP(xp){
    if (xp >= 1200) return 'Capitão';
    if (xp >= 700) return 'Comandante';
    if (xp >= 350) return 'Tenente Comandante';
    if (xp >= 120) return 'Tenente';
    return 'Cadete';
  }
  function selectedAvatar(){ return avatars.find(a => a.id===state.avatar) || avatars[0]; }
  function selectedMission(){ return missions.find(m => m.id===state.mission) || missions[0]; }
  function selectedWorld(){ return worlds.find(w => w.id===state.world) || worlds[0]; }
  function assetAvatarSrc(){
    return selectedAvatar().real ? selectedAvatar().src : './assets/images/avatars/captain.png';
  }

  function show(screen){
    qsa('.screen').forEach(el => el.classList.remove('active'));
    qs('#screen-' + screen).classList.add('active');
  }

  function loadImage(key, src){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({key,img,ok:true});
      img.onerror = () => resolve({key,img:null,ok:false});
      img.src = src;
    });
  }

  function renderAvatarGrid(){
    const grid = qs('#avatarGrid');
    grid.innerHTML = '';
    avatars.forEach(a => {
      const b = document.createElement('button');
      b.className = 'avatar-btn' + (a.id===state.avatar ? ' selected' : '');
      b.innerHTML = a.real ? `<img src="${a.src}" alt="${a.name}"><span>${a.name}</span>` : `<div class="avatar-placeholder">PROVISÓRIO</div><span>${a.name}</span>`;
      b.onclick = () => { state.avatar = a.id; renderAvatarGrid(); };
      grid.appendChild(b);
    });
  }

  function renderLobby(){
    state.career.rank = rankFromXP(state.career.xp);
    qs('#profileAvatar').src = assetAvatarSrc();
    qs('#profileRank').textContent = `${state.career.rank} • ${selectedAvatar().name}`;
    qs('#profileStats').textContent = `XP ${state.career.xp} • Créditos ${state.career.credits} • Missões ${state.career.completed}`;
    const subInfo = [
      ['Classe','Atlântico Mk.I'],
      ['Casco', Math.round(state.battle.hull) + '%'],
      ['Sonar', Math.round(state.battle.sonar) + '%'],
      ['Torpedos', state.battle.torpedoes]
    ];
    qs('#subInfo').innerHTML = subInfo.map(([l,v]) => `<div class="stat-card"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('');
    qs('#careerSummary').innerHTML = [
      `Patente atual: ${state.career.rank}`,
      `Avatar ativo: ${selectedAvatar().name}`,
      `Créditos: ${state.career.credits}`,
      `Melhorias: ${state.career.upgrades.length}`,
      `Fluxo reestruturado para simulador`
    ].join('<br>');
    qs('#lastReport').innerHTML = [
      'Menu inicial com Nova partida e Continuar.',
      'Seleção de avatar antes do lobby.',
      'Missões históricas narradas no briefing.',
      'Mundo aberto disponível para patrulha.',
      'Batalha mobile-first com instrumentos e oficiais.'
    ].join('<br>');

    qsa('.lobby-tab').forEach(el => el.classList.remove('active'));
    qs('#tab-' + state.tab).classList.add('active');
    qsa('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === state.tab));

    const missionList = qs('#missionList');
    missionList.innerHTML = '';
    missions.forEach(m => {
      const d = document.createElement('div');
      d.className = 'mission-item' + (m.id===state.mission ? ' active' : '');
      d.innerHTML = `<strong>${m.name}</strong><div class="muted">${m.brief}</div>`;
      d.onclick = () => { state.mission = m.id; renderLobby(); };
      missionList.appendChild(d);
    });
    qs('#missionBrief').innerHTML = `<strong>${selectedMission().name}</strong><br><br>${selectedMission().brief}`;

    const worldList = qs('#worldList');
    worldList.innerHTML = '';
    worlds.forEach(w => {
      const d = document.createElement('div');
      d.className = 'world-item' + (w.id===state.world ? ' active' : '');
      d.innerHTML = `<strong>${w.name}</strong><div class="muted">${w.brief}</div>`;
      d.onclick = () => { state.world = w.id; renderLobby(); };
      worldList.appendChild(d);
    });

    const storeList = qs('#storeList');
    storeList.innerHTML = '';
    storeItems.forEach(i => {
      const owned = state.career.upgrades.includes(i.id);
      const d = document.createElement('div');
      d.className = 'store-item' + (owned ? ' active' : '');
      d.innerHTML = `<strong>${i.name}</strong><div class="muted">${i.effect}</div><div class="muted">Custo: ${i.cost} ${owned ? '• comprado' : ''}</div>`;
      d.onclick = () => {
        if (owned || state.career.credits < i.cost) return;
        state.career.credits -= i.cost;
        state.career.upgrades.push(i.id);
        applyUpgrades();
        renderLobby();
        saveState();
      };
      storeList.appendChild(d);
    });
  }

  function applyUpgrades(){
    state.battle.torpedoes = 6 + (state.career.upgrades.includes('torpedoes') ? 2 : 0);
    state.battle.hull = 100 + (state.career.upgrades.includes('hull') ? 15 : 0);
    state.battle.sonar = 100 + (state.career.upgrades.includes('sonar') ? 15 : 0);
  }

  function startBattle(mode){
    applyUpgrades();
    state.battle.mode = mode;
    state.battle.title = mode === 'mission' ? selectedMission().name : `Patrulha: ${selectedWorld().name}`;
    state.battle.subtitle = mode === 'mission' ? selectedMission().brief : selectedWorld().brief;
    state.battle.heading = 0; state.battle.targetHeading = 0;
    state.battle.speed = 0; state.battle.targetSpeed = 0;
    state.battle.depth = 0; state.battle.targetDepth = 0;
    state.battle.player = {x:260,y:380,w:280,h:120};
    state.battle.torps = []; state.battle.explosions = []; state.battle.pulse = 0;
    state.battle.enemies = [
      { type:'escort', x:980, y:180, w:250, h:110, hp:100, speed:0.3, alive:true, state:'patrol' },
      { type:'cargo', x:1050, y:390, w:260, h:120, hp:90, speed:0.2, alive:true, state:'patrol' },
      { type:'enemySub', x:990, y:600, w:250, h:105, hp:85, speed:0.24, alive:true, state:'search' },
    ];
    qs('#battleTitle').textContent = state.battle.title;
    qs('#battleSub').textContent = state.battle.subtitle;
    qs('#officerFeed').textContent = 'Oficiais aguardando ordens.';
    qs('#tacticalFeed').textContent = 'Nenhum contato confirmado.';
    updateInstruments();
    show('battle');
  }

  function updateInstruments(){
    qs('#depthValue').textContent = `${Math.round(state.battle.depth)} m`;
    qs('#headingValue').textContent = `${String(Math.round(state.battle.heading)).padStart(3,'0')}°`;
    qs('#speedValue').textContent = `${Math.round(state.battle.speed)} nós`;
    qs('#hullValue').textContent = `${Math.max(0, Math.round(state.battle.hull))}%`;
    qs('#depthFill').style.width = Math.min(100, state.battle.depth / 3) + '%';
    qs('#headingFill').style.width = (state.battle.heading % 360) / 3.6 + '%';
    qs('#speedFill').style.width = Math.min(100, state.battle.speed * 10) + '%';
    const hullPct = Math.max(0, Math.min(100, state.battle.hull));
    const hullFill = qs('#hullFill');
    hullFill.style.width = hullPct + '%';
    hullFill.className = 'fill ' + (hullPct > 60 ? 'safe' : hullPct > 30 ? 'warn' : 'danger');
  }

  function drawImageSafe(img, x, y, w, h, fallback){
    const ctx = qs('#battleCanvas').getContext('2d');
    if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x - w/2, y - h/2, w, h);
    else fallback();
  }

  function fallbackSub(ctx, x, y, w, h, color){
    ctx.save(); ctx.translate(x,y); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-w*0.45,0); ctx.lineTo(w*0.22,-h*0.26); ctx.lineTo(w*0.48,0); ctx.lineTo(w*0.22,h*0.26); ctx.closePath(); ctx.fill();
    ctx.fillRect(-12,-16,24,32); ctx.restore();
  }

  function battleLoop(){
    const c = qs('#battleCanvas');
    const ctx = c.getContext('2d');
    function step(){
      if (!qs('#screen-battle').classList.contains('active')) { requestAnimationFrame(step); return; }
      ctx.clearRect(0,0,c.width,c.height);
      const g = ctx.createLinearGradient(0,0,0,c.height);
      g.addColorStop(0,'#0e314d'); g.addColorStop(0.45,'#08253a'); g.addColorStop(1,'#04101b');
      ctx.fillStyle = g; ctx.fillRect(0,0,c.width,c.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      for(let x=0;x<c.width;x+=90){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,c.height); ctx.stroke(); }
      for(let y=0;y<c.height;y+=90){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(c.width,y); ctx.stroke(); }

      // smooth simulation
      state.battle.heading += (state.battle.targetHeading - state.battle.heading) * 0.08;
      state.battle.speed += (state.battle.targetSpeed - state.battle.speed) * 0.06;
      state.battle.depth += (state.battle.targetDepth - state.battle.depth) * 0.05;
      if (state.battle.pulse > 0) state.battle.pulse -= 1;

      const player = state.battle.player;
      const move = state.battle.speed * 0.2;
      player.x = Math.max(160, Math.min(500, player.x + Math.cos((state.battle.heading-90)*Math.PI/180) * move));
      player.y = Math.max(120, Math.min(640, player.y + Math.sin((state.battle.heading-90)*Math.PI/180) * move));

      // sonar pulse
      if (state.battle.pulse > 0){
        const size = 220 + state.battle.pulse * 3;
        ctx.save(); ctx.globalAlpha = Math.min(0.55, state.battle.pulse / 100);
        const sonar = assets.sonar;
        if (sonar && sonar.naturalWidth > 0) ctx.drawImage(sonar, player.x - size/2, player.y - size/2, size, size);
        else {
          ctx.strokeStyle = 'rgba(110,240,255,0.35)';
          for(let r=60;r<size/2;r+=40){ ctx.beginPath(); ctx.arc(player.x, player.y, r, 0, Math.PI*2); ctx.stroke(); }
        }
        ctx.restore();
      }

      // enemies
      let tactical = [];
      state.battle.enemies.forEach(e => {
        if (!e.alive) return;
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx,dy);
        if (e.type === 'escort' && dist < 380) e.state = 'attack';
        if (e.type === 'enemySub' && dist < 320) e.state = 'shadow';
        if (e.state === 'attack') e.x -= e.speed * 0.3;
        else if (e.state === 'shadow') e.x -= e.speed * 0.18;
        else e.x -= e.speed;
        if (e.x < 700) e.x += Math.sin(Date.now()/300) * 0.4;
        tactical.push(`${e.type} • ${Math.round(dist)}m • ${e.state}`);

        const img = assets[e.type];
        const color = e.type === 'escort' ? '#ff8e8e' : e.type === 'cargo' ? '#ffbd8a' : '#b695ff';
        drawImageSafe(img, e.x, e.y, e.w, e.h, () => fallbackSub(ctx, e.x, e.y, e.w, e.h, color));
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(e.x - 52, e.y - e.h/2 - 18, 104, 8);
        ctx.fillStyle = '#67e29a';
        ctx.fillRect(e.x - 52, e.y - e.h/2 - 18, 104 * (e.hp/100), 8);

        if (dist < 180 && Math.random() < 0.005){
          state.battle.hull -= 3 + Math.random() * 4;
          qs('#tacticalFeed').textContent = 'Ataque inimigo recebido. Danos em progresso.';
        }
      });

      // torpedoes
      state.battle.torps.forEach(t => { t.x += t.vx; });
      state.battle.explosions.forEach(ex => { ex.life -= 1; });
      state.battle.torps = state.battle.torps.filter(t => t.x < c.width + 150);
      state.battle.explosions = state.battle.explosions.filter(ex => ex.life > 0);

      state.battle.torps.forEach(t => {
        drawImageSafe(assets.torpedo, t.x, t.y, 110, 40, () => {
          ctx.fillStyle = '#ddd';
          ctx.fillRect(t.x - 45, t.y - 6, 90, 12);
        });
        state.battle.enemies.forEach(e => {
          if (!e.alive) return;
          if (Math.abs(t.x - e.x) < 80 && Math.abs(t.y - e.y) < 46){
            e.hp -= 55;
            t.x = c.width + 999;
            state.battle.explosions.push({ x:e.x, y:e.y, size:180, life:28, maxLife:28 });
            if (e.hp <= 0){
              e.alive = false;
              state.career.xp += 80;
              state.career.credits += 55;
              state.career.completed += 1;
              state.career.rank = rankFromXP(state.career.xp);
            }
          }
        });
      });

      state.battle.explosions.forEach(ex => {
        ctx.save(); ctx.globalAlpha = ex.life / ex.maxLife;
        drawImageSafe(assets.explosion, ex.x, ex.y, ex.size, ex.size, () => {
          ctx.fillStyle = 'rgba(255,120,50,0.7)';
          ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.size/4, 0, Math.PI*2); ctx.fill();
        });
        ctx.restore();
      });

      // player
      drawImageSafe(assets.playerSub, player.x, player.y, player.w, player.h, () => fallbackSub(ctx, player.x, player.y, player.w, player.h, state.battle.depth > 20 ? '#8fe9ff' : '#55c8ff'));
      const av = new Image(); av.src = assetAvatarSrc();
      ctx.save(); ctx.beginPath(); ctx.arc(105, 105, 44, 0, Math.PI*2); ctx.clip();
      if (av.complete) ctx.drawImage(av, 61, 61, 88, 88);
      ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(105,105,44,0,Math.PI*2); ctx.stroke();

      qs('#tacticalFeed').textContent = tactical.join(' | ') || 'Nenhum contato confirmado.';
      updateInstruments();
      if (state.battle.hull <= 0){
        qs('#officerFeed').textContent = 'Casco crítico. Submarino perdido.';
        state.battle.hull = 0;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initUI(){
    renderAvatarGrid();
    renderLobby();
    qs('#avatarBackBtn').onclick = () => show('start');
    qs('#avatarNextBtn').onclick = () => { renderLobby(); saveState(); show('lobby'); };
    qs('#newGameBtn').onclick = () => show('avatar');
    qs('#continueBtn').onclick = () => { loadState(); renderAvatarGrid(); renderLobby(); show('lobby'); };

    qsa('.tab-btn').forEach(btn => btn.onclick = () => { state.tab = btn.dataset.tab; renderLobby(); });
    qs('#launchMissionBtn').onclick = () => { saveState(); startBattle('mission'); };
    qs('#launchWorldBtn').onclick = () => { saveState(); startBattle('openworld'); };
    qs('#backLobbyBtn').onclick = () => { renderLobby(); saveState(); show('lobby'); };

    qsa('.officerBtn').forEach(btn => btn.onclick = () => {
      const type = btn.dataset.officer;
      const map = {
        mechanic: 'Mecânico: iniciando reparos emergenciais e reduzindo danos do casco.',
        sonar: 'Sonarista: contato à frente, leitura intermitente, manter baixa velocidade.',
        weapons: 'Oficial de armas: solução de tiro preparada, aguardar melhor ângulo.'
      };
      qs('#officerFeed').textContent = map[type];
      if (type === 'mechanic') state.battle.hull = Math.min(100, state.battle.hull + 8);
      if (type === 'sonar') state.battle.pulse = 100;
      if (type === 'weapons') qs('#tacticalFeed').textContent = 'Oficial de armas recomenda disparo quando alvo cruzar proa.';
    });

    qs('#sonarBtn').onclick = () => { state.battle.pulse = 100; };
    qs('#diveBtn').onclick = () => { state.battle.targetDepth = state.battle.targetDepth > 20 ? 0 : 120; };
    qs('#torpedoBtn').onclick = () => {
      if (state.battle.torpedoes <= 0) return;
      state.battle.torpedoes -= 1;
      state.battle.torps.push({ x: state.battle.player.x + 120, y: state.battle.player.y, vx: 8.0 });
      renderLobby();
    };
    qs('#repairBtn').onclick = () => {
      state.battle.hull = Math.min(100, state.battle.hull + 6);
      qs('#officerFeed').textContent = 'Equipe de reparo mobilizada. Reparos parciais concluídos.';
    };

    qsa('[data-dir]').forEach(btn => btn.onclick = () => {
      const dir = btn.dataset.dir;
      if (dir === 'left') state.battle.targetHeading -= 15;
      if (dir === 'right') state.battle.targetHeading += 15;
      if (dir === 'up') state.battle.targetSpeed = Math.min(10, state.battle.targetSpeed + 2);
      if (dir === 'down') state.battle.targetSpeed = Math.max(0, state.battle.targetSpeed - 2);
      if (dir === 'stop') state.battle.targetSpeed = 0;
    });

    document.addEventListener('keydown', (e) => {
      if (!qs('#screen-battle').classList.contains('active')) return;
      if (e.key === 'ArrowLeft') state.battle.targetHeading -= 10;
      if (e.key === 'ArrowRight') state.battle.targetHeading += 10;
      if (e.key === 'ArrowUp') state.battle.targetSpeed = Math.min(10, state.battle.targetSpeed + 2);
      if (e.key === 'ArrowDown') state.battle.targetSpeed = Math.max(0, state.battle.targetSpeed - 2);
      if (e.key === ' ') { e.preventDefault(); qs('#torpedoBtn').click(); }
      if (e.key.toLowerCase() === 's') qs('#sonarBtn').click();
      if (e.key.toLowerCase() === 'd') qs('#diveBtn').click();
    });
  }

  Promise.all(Object.entries(assetPaths).map(([k,src]) => loadImage(k,src))).then(results => {
    let ok = 0;
    results.forEach(r => { assets[r.key] = r.img; if (r.ok) ok += 1; });
    qs('#statusChip').textContent = ok === results.length ? 'Assets carregados' : `Assets ${ok}/${results.length}`;
    initUI();
    battleLoop();
  });
})();
