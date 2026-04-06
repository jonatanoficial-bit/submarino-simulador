
(() => {
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const on = (selector, fn) => { const el = qs(selector); if (el) el.onclick = fn; };
const saveKey = 'submarineCommanderV370';
const SHIPS = [{"id": "player_sub", "name": "Submarino Base", "price": 0, "speed": 6, "durability": 100, "image": "./assets/images/ships/player_sub.png", "desc": "Submarino inicial do comandante."}, {"id": "corvette", "name": "Flower Corvette", "price": 220, "speed": 5, "durability": 110, "image": "./assets/images/ships/corvette.png", "desc": "Escolta anti-submarino."}, {"id": "cargo", "name": "Cargo Ship", "price": 160, "speed": 4, "durability": 95, "image": "./assets/images/ships/cargo.png", "desc": "Mercante clássico."}, {"id": "liberty", "name": "Liberty Ship", "price": 260, "speed": 4, "durability": 105, "image": "./assets/images/ships/liberty.png", "desc": "Ícone logístico da guerra."}, {"id": "tanker", "name": "Oil Tanker", "price": 320, "speed": 3, "durability": 120, "image": "./assets/images/ships/tanker.png", "desc": "Grande casco e autonomia."}, {"id": "gato", "name": "Gato-class", "price": 420, "speed": 7, "durability": 112, "image": "./assets/images/ships/gato.png", "desc": "Submarino americano."}, {"id": "type_xxi", "name": "Type XXI", "price": 560, "speed": 8, "durability": 118, "image": "./assets/images/ships/type_xxi.png", "desc": "Submarino avançado de fim de guerra."}, {"id": "battleship", "name": "Battleship", "price": 900, "speed": 4, "durability": 180, "image": "./assets/images/ships/battleship.png", "desc": "Navio pesado premium."}];
const LAND_POLYS = [
 [[110,120],[250,80],[330,120],[360,230],[300,330],[230,300],[160,240],[100,180]],
 [[280,340],[360,330],[410,400],[400,530],[340,690],[270,620],[250,500]],
 [[560,120],[690,90],[760,130],[750,220],[640,220],[590,170]],
 [[620,230],[720,250],[770,330],[760,470],[710,620],[640,610],[600,500],[590,380]],
 [[760,120],[1010,130],[1120,220],[1110,320],[1020,350],[950,300],[850,320],[800,250]]
];

const state = {
  career: { xp: 0, credits: 600, rank: 'Cadete', owned: ['player_sub'], selectedShip: 'player_sub' },
  nav: { zoom: 1, heading: 0, speed: 0, player: { x: 520, y: 210 }, panX: 0, panY: 0, encounter: null, targetX: null, targetY: null },
  battle: {
    heading: 0, targetHeading: 0, speed: 0, targetSpeed: 0, depth: 0, targetDepth: 0,
    hull: 100, engine: 100, sonar: 100, torpedoes: 6, pulse: 0,
    flooding: 0, fatigue: 0, priority: 'repair',
    player: { x: 260, y: 380, w: 140, h: 70 },
    contacts: [], enemies: [], torps: [],
    compartments: { bow: 100, engineRoom: 100, sonarRoom: 100, torpedoRoom: 100 },
    repairTask: null
  },
  periscope: { angle: 0 },
  events: [],
  assets: {}
};

function saveState() { localStorage.setItem(saveKey, JSON.stringify(state.career)); }
function loadState() { try { const raw = localStorage.getItem(saveKey); if (raw) state.career = JSON.parse(raw); } catch {} }
function show(id) { qsa('.screen').forEach(el => el.classList.remove('active')); const s = qs('#screen-' + id); if (s) s.classList.add('active'); }
function rankFromXP(xp) { return xp >= 1200 ? 'Capitão' : xp >= 700 ? 'Comandante' : xp >= 350 ? 'Tenente Comandante' : xp >= 120 ? 'Tenente' : 'Cadete'; }
function normalizeAngle(a) { let v = a % 360; if (v < 0) v += 360; return v; }
function angleDiff(a,b) { const d = Math.abs(normalizeAngle(a)-normalizeAngle(b)); return Math.min(d, 360-d); }
function depthBand(d) { if (d === 0) return 'Surface'; if (d <= 20) return 'Periscope'; if (d <= 60) return 'Patrol'; if (d <= 140) return 'Deep'; return 'Critical'; }
function pointInPoly(x,y,poly){ let inside=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const xi=poly[i][0], yi=poly[i][1], xj=poly[j][0], yj=poly[j][1]; const intersect=((yi>y)!==(yj>y))&&(x<((xj-xi)*(y-yi))/((yj-yi)||1e-9)+xi); if(intersect) inside=!inside;} return inside; }
function isLand(x,y){ return LAND_POLYS.some(poly => pointInPoly(x,y,poly)); }
function currentShip(){ return SHIPS.find(s => s.id === state.career.selectedShip) || SHIPS[0]; }
function ownedShip(id){ return state.career.owned.includes(id); }
function pushEvent(msg){ state.events.unshift(msg); state.events = state.events.slice(0,5); }

function safeText(id, text){ const el = qs(id); if (el) el.textContent = text; }
function safeSrc(id, src){ const el = qs(id); if (el) el.src = src; }

function loadAssets(){
  SHIPS.forEach(ship => {
    const img = new Image();
    img.src = ship.image;
    state.assets[ship.id] = img;
  });
}

function updateCareer(){
  state.career.rank = rankFromXP(state.career.xp);
  safeText('#careerBox', `Patente: ${state.career.rank} | XP: ${state.career.xp} | Créditos: ${state.career.credits} | Frota: ${state.career.owned.length}`);
  const ship = currentShip();
  safeSrc('#ownedShipPreview', ship.image);
  safeText('#ownedShipInfo', `${ship.name} | Velocidade ${ship.speed} | Durabilidade ${ship.durability} | ${ship.desc}`);
  safeText('#overviewText', `Build v3.7.0 com correção estrutural. O erro de onclick em elemento nulo foi removido com bind seguro, o mapa está funcional e a loja usa as imagens já integradas. Nave selecionada: ${ship.name}.`);
}

function renderStore(){
  const grid = qs('#storeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  SHIPS.forEach(ship => {
    const card = document.createElement('div');
    card.className = 'storeCard' + (ownedShip(ship.id) ? ' owned' : '') + (state.career.selectedShip === ship.id ? ' selected' : '');
    card.innerHTML = `<img src="${ship.image}" alt="${ship.name}"><h3>${ship.name}</h3><div class="muted">${ship.desc}</div><div class="muted">Preço: ${ship.price} | Velocidade: ${ship.speed} | Durabilidade: ${ship.durability}</div>`;
    const row = document.createElement('div');
    row.className = 'row';
    row.style.marginTop = '10px';
    const btn = document.createElement('button');
    if (!ownedShip(ship.id)) {
      btn.className = 'primary';
      btn.textContent = 'Comprar';
      btn.onclick = () => {
        if (state.career.credits < ship.price) return;
        state.career.credits -= ship.price;
        state.career.owned.push(ship.id);
        state.career.selectedShip = ship.id;
        pushEvent(`Embarcação adquirida: ${ship.name}.`);
        updateCareer(); renderStore(); saveState();
      };
    } else {
      btn.className = 'secondary';
      btn.textContent = state.career.selectedShip === ship.id ? 'Selecionada' : 'Selecionar';
      btn.onclick = () => {
        state.career.selectedShip = ship.id;
        updateCareer(); renderStore(); saveState();
      };
    }
    row.appendChild(btn);
    card.appendChild(row);
    grid.appendChild(card);
  });
}

function activateTab(tab){
  qsa('.tabScreen').forEach(el => el.classList.remove('active'));
  const screen = qs('#tab-' + tab);
  if (screen) screen.classList.add('active');
  qsa('.tabBtn').forEach(btn => {
    btn.classList.remove('primary');
    btn.classList.add('secondary');
    if (btn.dataset.tab === tab) {
      btn.classList.add('primary');
      btn.classList.remove('secondary');
    }
  });
}

function updateMapPanel(){
  safeText('#mapStatus', `Curso ${Math.round(normalizeAngle(state.nav.heading))}° | Velocidade ${state.nav.speed.toFixed(0)} nós | Zoom ${state.nav.zoom.toFixed(1)}x | Nave: ${currentShip().name}`);
  safeText('#encounterBox', state.nav.encounter ? state.nav.encounter.text : 'Nenhum contato no momento.');
}

function updateCompartments(){
  const c = state.battle.compartments;
  let t = `Proa ${Math.round(c.bow)}% | Máquinas ${Math.round(c.engineRoom)}% | Sonar ${Math.round(c.sonarRoom)}% | Torpedos ${Math.round(c.torpedoRoom)}%`;
  if (state.battle.repairTask) t += ` | Reparo ${state.battle.repairTask.label} ${Math.ceil(state.battle.repairTask.timeLeft/60)}s`;
  safeText('#compartmentBox', t);
}

function updateAlarmPanel(){
  const alarms = [];
  if (state.battle.flooding > 0.5) alarms.push(`Inundação ${state.battle.flooding.toFixed(1)}`);
  if (state.battle.fatigue > 50) alarms.push(`Fadiga ${state.battle.fatigue.toFixed(0)}%`);
  if (state.battle.hull < 45) alarms.push(`Casco ${Math.round(state.battle.hull)}%`);
  if (state.battle.engine < 45) alarms.push(`Motor ${Math.round(state.battle.engine)}%`);
  const base = alarms.length ? alarms.join(' | ') : 'Nenhum alarme crítico.';
  const recent = state.events.slice(0,3).join(' | ');
  safeText('#alarmBox', recent ? `${base} | Eventos: ${recent}` : base);
}

function updateBattlePanels(){
  safeText('#battleStatus', `Profundidade ${Math.round(state.battle.depth)}m (${depthBand(state.battle.depth)}) | Curso ${Math.round(normalizeAngle(state.battle.heading))}° | Velocidade ${state.battle.speed.toFixed(1)} nós | Casco ${Math.round(state.battle.hull)}% | Motor ${Math.round(state.battle.engine)}% | Sonar ${Math.round(state.battle.sonar)}% | Torpedos ${state.battle.torpedoes}`);
  updateCompartments();
  safeText('#priorityBox', `Prioridade atual: ${state.battle.priority} | Inundação ${state.battle.flooding.toFixed(1)} | Fadiga ${state.battle.fatigue.toFixed(1)}`);
  updateAlarmPanel();
}

function resetBattle(type='escort'){
  const ship = currentShip();
  state.battle.heading = 0;
  state.battle.targetHeading = 0;
  state.battle.speed = 0;
  state.battle.targetSpeed = 0;
  state.battle.depth = 0;
  state.battle.targetDepth = 0;
  state.battle.hull = ship.durability;
  state.battle.engine = 100;
  state.battle.sonar = 100;
  state.battle.torpedoes = 6;
  state.battle.pulse = 0;
  state.battle.flooding = 0;
  state.battle.fatigue = 0;
  state.battle.priority = 'repair';
  state.battle.player = { x: 260, y: 380, w: 140, h: 70 };
  state.battle.contacts = [];
  state.battle.torps = [];
  state.battle.compartments = { bow: 100, engineRoom: 100, sonarRoom: 100, torpedoRoom: 100 };
  state.battle.repairTask = null;

  const templates = {
    escort: [
      { type:'escort', x:960, y:220, w:140, h:70, hp:100, speed:0.23, alive:true, heading:250, state:'search', vx:-0.5, vy:0.2, shipId:'corvette' },
      { type:'cargo', x:1030, y:420, w:150, h:78, hp:90, speed:0.15, alive:true, heading:255, state:'patrol', vx:-0.35, vy:0, shipId:'liberty' }
    ],
    enemySub: [
      { type:'enemySub', x:990, y:540, w:150, h:78, hp:85, speed:0.17, alive:true, heading:240, state:'shadow', vx:-0.32, vy:-0.04, shipId:'type_xxi' }
    ]
  };
  state.battle.enemies = templates[type].map(e => ({...e}));
  safeText('#fireSolution', 'Aguardando contato. Use sonar e alinhe a proa.');
  safeText('#battleInfo', 'Use sonar, curso, profundidade e o periscópio para preparar o disparo.');
  safeText('#periscopeInfo', 'Alinhe o alvo no centro e dispare.');
  pushEvent('Contato hostil confirmado. Tripulação em postos de combate.');
  updateBattlePanels();
}

function assignDamage(amount){
  const c = state.battle.compartments;
  const r = Math.random();
  if (r < 0.28) c.bow = Math.max(0, c.bow - amount);
  else if (r < 0.56) c.engineRoom = Math.max(0, c.engineRoom - amount);
  else if (r < 0.78) c.sonarRoom = Math.max(0, c.sonarRoom - amount);
  else c.torpedoRoom = Math.max(0, c.torpedoRoom - amount);
  state.battle.hull = Math.min(state.battle.hull, (c.bow + c.engineRoom + c.torpedoRoom) / 3);
  state.battle.engine = Math.min(state.battle.engine, c.engineRoom);
  state.battle.sonar = Math.min(state.battle.sonar, c.sonarRoom);
  state.battle.flooding = Math.min(20, state.battle.flooding + 0.45);
  if (amount > 4) pushEvent('Impacto no casco. Compartimentos comprometidos.');
  updateBattlePanels();
}

function startRepair(){
  if (state.battle.repairTask) return;
  const c = state.battle.compartments;
  const arr = [['Proa','bow',c.bow],['Máquinas','engineRoom',c.engineRoom],['Sonar','sonarRoom',c.sonarRoom],['Torpedos','torpedoRoom',c.torpedoRoom]].sort((a,b)=>a[2]-b[2]);
  if (arr[0][2] >= 100) { safeText('#battleInfo', 'Nenhum reparo prioritário.'); return; }
  let time = 360;
  if (state.battle.priority === 'repair') time = 220;
  if (state.battle.priority === 'attack') time = 420;
  state.battle.repairTask = { label: arr[0][0], key: arr[0][1], timeLeft: time };
  safeText('#battleInfo', `Reparo iniciado em ${arr[0][0]}.`);
  pushEvent(`Equipe iniciou reparo em ${arr[0][0]}.`);
  updateBattlePanels();
}

function updateContacts(){
  const p = state.battle.player;
  const noiseBase = state.battle.speed*8 + (state.battle.depth < 20 ? 10 : state.battle.depth < 80 ? 5 : 2) + (state.battle.priority === 'stealth' ? -6 : 0);
  const noise = Math.max(0, noiseBase);
  state.battle.contacts = state.battle.enemies.filter(e => e.alive).map(e => {
    const dx = e.x - p.x, dy = e.y - p.y;
    const dist = Math.hypot(dx,dy);
    const bearing = normalizeAngle((Math.atan2(dy,dx)*180/Math.PI)+90);
    const certainty = Math.max(0, Math.min(100, (state.battle.sonar/100)*100 - dist/7 + noise/4 + (state.battle.pulse>0 ? 18 : 0) + (Math.random()*10 - 5)));
    return { enemy:e, type:e.type, bearing, approxDistance:Math.round(dist+(Math.random()*80-40)), certainty, status: certainty>65 ? 'confirmado' : certainty>35 ? 'suspeito' : 'fraco' };
  }).filter(c => c.certainty > 15).sort((a,b)=>b.certainty-a.certainty);

  const top = state.battle.contacts[0];
  if (!top) { safeText('#fireSolution', 'Aguardando contato. Use sonar e alinhe a proa.'); return; }
  const diff = angleDiff(top.bearing, state.battle.heading + state.periscope.angle);
  const quality = diff < 18 && top.approxDistance < 280 && state.battle.depth <= 20 ? 'Alta' : diff < 35 && top.approxDistance < 450 ? 'Média' : 'Baixa';
  safeText('#fireSolution', `Alvo ${top.type} | Bearing ${Math.round(top.bearing)}° | Distância ~${top.approxDistance}m | Solução ${quality} | Faixa ${depthBand(state.battle.depth)}`);
}

function fireTorpedo(boost=1){
  if (state.battle.torpedoes <= 0) return;
  const top = state.battle.contacts[0];
  if (!top) { safeText('#fireSolution', 'Sem contato válido.'); return; }
  const diff = angleDiff(top.bearing, state.battle.heading + state.periscope.angle);
  let spread = 1;
  if (diff > 35) spread = 0.45; else if (diff > 20) spread = 0.7;
  if (top.approxDistance > 500) spread *= 0.65;
  if (state.battle.depth > 20) spread *= 0.8;
  if (state.battle.priority === 'attack') spread *= 1.12;
  if (state.battle.priority === 'repair') spread *= 0.92;
  spread *= boost;
  const a = ((state.battle.heading + state.periscope.angle) - 90) * Math.PI / 180;
  state.battle.torpedoes -= 1;
  state.battle.torps.push({ x: state.battle.player.x + Math.cos(a)*50, y: state.battle.player.y + Math.sin(a)*50, vx: Math.cos(a)*8*spread, vy: Math.sin(a)*8*spread });
  safeText('#fireSolution', `Disparo realizado. Qualidade ${spread>0.85?'Alta':spread>0.6?'Média':'Baixa'}.`);
  pushEvent(spread>0.85 ? 'Torpedo lançado em excelente solução.' : 'Torpedo lançado com solução imperfeita.');
  updateBattlePanels();
}

function drawShipSprite(ctx, img, x, y, w, h, fallbackColor='#55c8ff'){
  if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x-w/2, y-h/2, w, h);
  else { ctx.fillStyle = fallbackColor; ctx.fillRect(x-w/2, y-h/2, w, h); }
}

function drawMap(){
  const canvas = qs('#mapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#0d3151'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='rgba(255,255,255,0.05)';
  for(let x=0;x<canvas.width;x+=80){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
  for(let y=0;y<canvas.height;y+=80){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }

  const z=state.nav.zoom, vpW=canvas.width/z, vpH=canvas.height/z;
  state.nav.panX=Math.max(0,Math.min(1280-vpW,state.nav.player.x-vpW/2));
  state.nav.panY=Math.max(0,Math.min(720-vpH,state.nav.player.y-vpH/2));

  ctx.save();
  ctx.scale(z,z);
  ctx.translate(-state.nav.panX,-state.nav.panY);

  ctx.fillStyle='#2e3f2b'; ctx.strokeStyle='rgba(255,255,255,0.09)';
  LAND_POLYS.forEach(poly => {
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    poly.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  if (state.nav.targetX !== null && state.nav.targetY !== null) {
    const dx = state.nav.targetX - state.nav.player.x;
    const dy = state.nav.targetY - state.nav.player.y;
    const dist = Math.hypot(dx,dy);
    if (dist > 4) {
      state.nav.heading = (Math.atan2(dy,dx)*180/Math.PI)+90;
      const rad = (state.nav.heading-90)*Math.PI/180;
      const nx = state.nav.player.x + Math.cos(rad)*Math.max(2, state.nav.speed)*0.55;
      const ny = state.nav.player.y + Math.sin(rad)*Math.max(2, state.nav.speed)*0.55;
      if (!isLand(nx,ny)) {
        state.nav.player.x = Math.max(20,Math.min(1260,nx));
        state.nav.player.y = Math.max(20,Math.min(700,ny));
      } else {
        state.nav.targetX = null;
        state.nav.targetY = null;
        state.nav.speed = 0;
      }
    } else {
      state.nav.targetX = null;
      state.nav.targetY = null;
      state.nav.speed = 0;
    }
    ctx.strokeStyle = 'rgba(85,200,255,.55)';
    ctx.beginPath();
    ctx.arc(state.nav.targetX || state.nav.player.x, state.nav.targetY || state.nav.player.y, 16, 0, Math.PI*2);
    ctx.stroke();
  }

  drawShipSprite(ctx, state.assets[currentShip().id], state.nav.player.x, state.nav.player.y, 95, 50, '#55c8ff');

  if (state.nav.encounter) {
    ctx.fillStyle = state.nav.encounter.type === 'enemySub' ? '#b695ff' : '#ff8e8e';
    ctx.beginPath();
    ctx.arc(state.nav.encounter.x, state.nav.encounter.y, 8, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();

  if (!state.nav.encounter && (state.nav.targetX !== null || state.nav.speed > 0) && Math.random() < 0.003) {
    const type = Math.random() < 0.5 ? 'escort' : 'enemySub';
    state.nav.encounter = { type, x: state.nav.player.x + 120, y: state.nav.player.y, text: type === 'escort' ? 'Escolta hostil detectada.' : 'Submarino hostil detectado.' };
    const btn = qs('#btnEnterCombat');
    if (btn) btn.disabled = false;
  }

  updateMapPanel();
  requestAnimationFrame(drawMap);
}

function drawBattle(){
  const canvas = qs('#battleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'#0e314d'); g.addColorStop(0.45,'#08253a'); g.addColorStop(1,'#04101b');
  ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height);

  state.battle.heading += (state.battle.targetHeading-state.battle.heading)*0.12;
  state.battle.speed += (state.battle.targetSpeed-state.battle.speed)*0.08;
  state.battle.depth += (state.battle.targetDepth-state.battle.depth)*0.06;
  if(state.battle.pulse>0)state.battle.pulse-=1;

  const p = state.battle.player;
  const movementPenalty = Math.max(0.45,1-state.battle.fatigue/140);
  const move = state.battle.speed*0.28*Math.max(0.3,state.battle.engine/100)*movementPenalty;
  p.x = Math.max(140,Math.min(520,p.x+Math.cos((state.battle.heading-90)*Math.PI/180)*move));
  p.y = Math.max(100,Math.min(660,p.y+Math.sin((state.battle.heading-90)*Math.PI/180)*move));

  state.battle.fatigue = Math.min(100,state.battle.fatigue+0.012+(state.battle.priority==='attack'?0.02:state.battle.priority==='repair'?0.01:0.008));
  state.battle.targetSpeed = Math.min(state.battle.targetSpeed,10*Math.max(0.45,1-state.battle.fatigue/140));

  if (state.battle.flooding>0){
    state.battle.hull=Math.max(0,state.battle.hull-state.battle.flooding*0.02);
    if(Math.random()<0.025) state.battle.engine=Math.max(0,state.battle.engine-state.battle.flooding*0.012);
    if(Math.random()<0.015) state.battle.sonar=Math.max(0,state.battle.sonar-state.battle.flooding*0.01);
  }

  if (state.battle.pulse>0){
    ctx.save();
    ctx.globalAlpha=Math.min(0.5,state.battle.pulse/100);
    ctx.strokeStyle='rgba(100,220,255,0.35)';
    const size=220+state.battle.pulse*2.2;
    for(let r=50;r<size/2;r+=36){ ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.stroke(); }
    ctx.restore();
  }

  state.battle.enemies.forEach(e=>{
    if(!e.alive) return;
    const dx=p.x-e.x, dy=p.y-e.y, dist=Math.hypot(dx,dy), targetHeading=normalizeAngle((Math.atan2(p.y-e.y,p.x-e.x)*180/Math.PI)+90);
    const playerNoise=state.battle.speed*8+(state.battle.priority==='stealth'?-6:0)+(state.battle.depth<20?10:state.battle.depth<80?5:2);

    if(e.type==='escort'){
      if(dist<220+playerNoise) e.state='attack';
      else if(dist<430||state.battle.pulse>0) e.state='search';
      else e.state='patrol';
      if(e.state==='attack'){ e.heading+=(targetHeading-e.heading)*0.08; e.x+=Math.cos((e.heading-90)*Math.PI/180)*(e.speed*1.5); e.y+=Math.sin((e.heading-90)*Math.PI/180)*(e.speed*1.5); }
      else if(e.state==='search'){ e.heading+=(targetHeading-e.heading)*0.04; e.x+=Math.cos((e.heading-90)*Math.PI/180)*(e.speed*0.9); e.y+=Math.sin((e.heading-90)*Math.PI/180)*(e.speed*0.9); }
      else { e.x+=e.vx; e.y+=e.vy; }
    } else {
      if(dist<240&&state.battle.depth>20)e.state='shadow'; else if(dist<420||state.battle.pulse>0)e.state='search'; else e.state='silent';
      if(e.state==='shadow'){ e.heading+=(targetHeading-e.heading)*0.05; e.x+=Math.cos((e.heading-90)*Math.PI/180)*(e.speed*1.05); e.y+=Math.sin((e.heading-90)*Math.PI/180)*(e.speed*1.05); }
      else { e.x+=e.vx; e.y+=e.vy; }
    }

    if(dist<170&&Math.random()<(e.type==='escort'?0.012:0.009)){
      assignDamage(4+Math.random()*2);
      if(Math.random()<0.35) pushEvent(e.type==='escort'?'Carga de profundidade próxima!':'Torpedo inimigo passou perto!');
    }

    const img = state.assets[e.shipId] || null;
    drawShipSprite(ctx, img, e.x, e.y, e.w, e.h, e.type==='escort'?'#ff8e8e':'#b695ff');
    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(e.x-36,e.y-e.h/2-14,72,6);
    ctx.fillStyle='#67e29a'; ctx.fillRect(e.x-36,e.y-e.h/2-14,72*(e.hp/100),6);
  });

  updateContacts();

  state.battle.torps.forEach(t=>{
    t.x+=t.vx; t.y+=t.vy;
    ctx.fillStyle='#ddd'; ctx.fillRect(t.x-18,t.y-3,36,6);
    state.battle.enemies.forEach(e=>{
      if(!e.alive) return;
      if(Math.abs(t.x-e.x)<46&&Math.abs(t.y-e.y)<24){
        e.hp-=55; t.dead=true;
        if(e.hp<=0){ e.alive=false; state.career.xp+=80; state.career.credits+=55; saveState(); updateCareer(); }
      }
    });
  });
  state.battle.torps=state.battle.torps.filter(t=>!t.dead&&t.x<canvas.width+40&&t.y>-40&&t.y<canvas.height+40);

  drawShipSprite(ctx, state.assets[currentShip().id], p.x, p.y, p.w, p.h, '#55c8ff');

  if(state.battle.repairTask){
    let speed=1;
    if(state.battle.priority==='repair') speed=1.5;
    if(state.battle.priority==='attack') speed=0.7;
    state.battle.repairTask.timeLeft -= speed;
    state.battle.flooding = Math.max(0,state.battle.flooding-0.01*speed);
    if(state.battle.repairTask.timeLeft<=0){
      const key=state.battle.repairTask.key;
      state.battle.compartments[key]=Math.min(100,state.battle.compartments[key]+22);
      state.battle.flooding=Math.max(0,state.battle.flooding-0.8);
      state.battle.repairTask=null;
      safeText('#battleInfo','Reparo concluído.');
      pushEvent('Reparo concluído e contenção parcial da água realizada.');
    }
  }

  updateBattlePanels();
  requestAnimationFrame(drawBattle);
}

function drawPeriscope(){
  const canvas = qs('#periscopeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#09141f'; ctx.fillRect(0,0,canvas.width,canvas.height);
  const cx=canvas.width/2, cy=canvas.height/2, radius=300;
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.clip();
  ctx.fillStyle='#27465f'; ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);
  ctx.strokeStyle='rgba(255,255,255,.18)';
  for(let i=-4;i<=4;i++){ ctx.beginPath(); ctx.moveTo(cx-radius,cy+i*40); ctx.lineTo(cx+radius,cy+i*40); ctx.stroke(); }
  const top=state.battle.contacts[0];
  if(top){
    const rel=normalizeAngle(top.bearing-state.battle.heading-state.periscope.angle);
    let x=cx+((rel>180?rel-360:rel)*6);
    x=Math.max(cx-radius+70,Math.min(cx+radius-70,x));
    const y=cy+40;
    drawShipSprite(ctx, state.assets[top.enemy.shipId], x, y, 160, 80, top.type==='escort'?'#d89a9a':'#b0a0ff');
  }
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-radius,cy); ctx.lineTo(cx+radius,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-radius); ctx.lineTo(cx,cy+radius); ctx.stroke();
  safeText('#periscopeInfo', top ? `Bearing alvo ${Math.round(top.bearing)}° | Ângulo periscópio ${Math.round(state.periscope.angle)}°` : 'Sem contato visível.');
  requestAnimationFrame(drawPeriscope);
}

function bindUI(){
  on('#btnNewGame', () => show('lobby'));
  on('#btnContinue', () => { loadState(); updateCareer(); renderStore(); show('lobby'); });
  qsa('.tabBtn').forEach(btn => btn.onclick = () => activateTab(btn.dataset.tab));
  on('#btnStartMission', () => { state.nav.encounter=null; const btn=qs('#btnEnterCombat'); if(btn) btn.disabled=true; show('map'); });
  on('#btnBackLobby', () => show('lobby'));
  on('#btnBackMap', () => show('map'));
  on('#btnPeriscope', () => { state.battle.targetDepth=20; show('periscope'); });
  on('#btnClosePeri', () => show('battle'));
  on('#btnPeriFire', () => fireTorpedo(1.15));
  on('#btnQuickFire', () => fireTorpedo(0.95));
  on('#btnRepair', () => startRepair());
  on('#btnSonar', () => state.battle.pulse = 100);
  on('#btnDepth', () => { state.battle.targetDepth = state.battle.targetDepth===0 ? 20 : state.battle.targetDepth===20 ? 60 : state.battle.targetDepth===60 ? 140 : 0; });
  on('#btnStop', () => state.battle.targetSpeed = 0);
  qsa('[data-speed]').forEach(btn => btn.onclick = () => { state.battle.targetSpeed = Math.max(0,Math.min(10,state.battle.targetSpeed+Number(btn.dataset.speed))); });
  qsa('[data-turn]').forEach(btn => btn.onclick = () => { state.battle.targetHeading += Number(btn.dataset.turn); });
  qsa('[data-peri]').forEach(btn => btn.onclick = () => { state.periscope.angle += Number(btn.dataset.peri); });
  qsa('.priorityBtn').forEach(btn => btn.onclick = () => { state.battle.priority = btn.dataset.priority; pushEvent(`Prioridade alterada para ${btn.dataset.priority}.`); updateBattlePanels(); });
  on('#btnPatrol', () => {
    if(!state.nav.encounter){
      const type=Math.random()<0.5?'escort':'enemySub';
      state.nav.encounter={ type, x:state.nav.player.x+120, y:state.nav.player.y, text:type==='escort'?'Escolta hostil detectada.':'Submarino hostil detectado.' };
      const btn=qs('#btnEnterCombat'); if(btn) btn.disabled=false;
      updateMapPanel();
    }
  });
  on('#btnEnterCombat', () => { if(state.nav.encounter){ resetBattle(state.nav.encounter.type); show('battle'); } });
  on('#btnZoomIn', () => state.nav.zoom = Math.min(2.4,state.nav.zoom+0.2));
  on('#btnZoomOut', () => state.nav.zoom = Math.max(0.8,state.nav.zoom-0.2));

  const mapCanvas = qs('#mapCanvas');
  if (mapCanvas) {
    mapCanvas.addEventListener('click', (e) => {
      const rect=mapCanvas.getBoundingClientRect();
      const x=(e.clientX-rect.left)/state.nav.zoom+state.nav.panX;
      const y=(e.clientY-rect.top)/state.nav.zoom+state.nav.panY;
      if (isLand(x,y)) return;
      state.nav.targetX = x;
      state.nav.targetY = y;
      state.nav.speed = Math.max(4,currentShip().speed);
      safeText('#mapInfo','Novo curso definido pelo mapa.');
    });
  }

  document.addEventListener('keydown', (e) => {
    if(qs('#screen-battle')?.classList.contains('active')){
      if(e.key==='ArrowLeft') state.battle.targetHeading -= 8;
      if(e.key==='ArrowRight') state.battle.targetHeading += 8;
      if(e.key==='ArrowUp') state.battle.targetSpeed = Math.min(10,state.battle.targetSpeed+1);
      if(e.key==='ArrowDown') state.battle.targetSpeed = Math.max(0,state.battle.targetSpeed-1);
      if(e.key===' ') { e.preventDefault(); fireTorpedo(0.95); }
      if(e.key.toLowerCase()==='s') state.battle.pulse = 100;
      if(e.key.toLowerCase()==='p'){ state.battle.targetDepth=20; show('periscope'); }
      if(e.key==='1'){ state.battle.priority='repair'; pushEvent('Prioridade alterada para repair.'); }
      if(e.key==='2'){ state.battle.priority='attack'; pushEvent('Prioridade alterada para attack.'); }
      if(e.key==='3'){ state.battle.priority='stealth'; pushEvent('Prioridade alterada para stealth.'); }
      updateBattlePanels();
    }
    if(qs('#screen-periscope')?.classList.contains('active')){
      if(e.key==='ArrowLeft') state.periscope.angle -= 4;
      if(e.key==='ArrowRight') state.periscope.angle += 4;
      if(e.key===' ') { e.preventDefault(); fireTorpedo(1.15); }
    }
  });
}

function init(){
  loadState();
  loadAssets();
  updateCareer();
  renderStore();
  activateTab('overview');
  bindUI();
  drawMap();
  drawBattle();
  drawPeriscope();
  updateBattlePanels();
}
init();
})();
