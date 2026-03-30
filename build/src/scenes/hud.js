import { state } from '../state.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function shortestAngleDelta(current, target) {
  const diff = ((target - current + 540) % 360) - 180;
  return diff;
}

function formatCoord(value) {
  return value.toFixed(1);
}

function updateClock(sim) {
  sim.clockMinutes += 1;
  if (sim.clockMinutes >= 60) {
    sim.clockMinutes = 0;
    sim.clockHours = (sim.clockHours + 1) % 24;
  }
}

function updateSimulation(deltaSec) {
  const sim = state.simulation;

  const speedDelta = sim.targetSpeed - sim.speed;
  sim.speed += Math.sign(speedDelta) * Math.min(Math.abs(speedDelta), deltaSec * 2.2);

  const depthDelta = sim.targetDepth - sim.depth;
  sim.depth += Math.sign(depthDelta) * Math.min(Math.abs(depthDelta), deltaSec * 16);

  const turnDelta = shortestAngleDelta(sim.heading, sim.targetHeading);
  sim.heading = normalizeAngle(sim.heading + Math.sign(turnDelta) * Math.min(Math.abs(turnDelta), deltaSec * 30));

  const headingRad = (sim.heading - 90) * (Math.PI / 180);
  const movement = sim.speed * deltaSec * 0.48;
  sim.x = clamp(sim.x + Math.cos(headingRad) * movement, 5, 95);
  sim.y = clamp(sim.y + Math.sin(headingRad) * movement, 6, 94);

  const submergedFactor = sim.submerged ? 1.2 : 0.45;
  const batteryDrain = sim.submerged ? (0.06 + sim.speed * 0.014) * deltaSec : -0.12 * deltaSec;
  const dieselDrain = sim.submerged ? 0 : (0.02 + sim.speed * 0.009) * deltaSec;
  sim.battery = clamp(sim.battery - batteryDrain, 0, 100);
  sim.diesel = clamp(sim.diesel - dieselDrain, 0, 100);

  if (!sim.submerged && sim.depth > 2) {
    sim.depth = Math.max(0, sim.depth - deltaSec * 20);
    sim.targetDepth = 0;
  }

  if (sim.submerged && sim.depth < 12) {
    sim.depth = Math.min(12, sim.depth + deltaSec * 18);
    sim.targetDepth = Math.max(sim.targetDepth, 12);
  }

  const noise = sim.speed * 5.4 + sim.depth * 0.12 + (sim.submerged ? 4 : 18) + sim.seaState * 2.4;
  sim.contactRisk = clamp(Math.round(noise / submergedFactor), 4, 99);
  sim.detected = sim.contactRisk >= 74;

  if (sim.depth > 180) {
    sim.hull = clamp(sim.hull - deltaSec * 0.55, 0, 100);
  }

  sim.routeName = sim.detected ? 'Evasive Turn Ordered' : sim.submerged ? 'Silent Patrol Route' : 'Surface Transit Route';
}

function renderMap(root, locale) {
  const sim = state.simulation;
  const contacts = [
    { x: 18, y: 24, kind: locale.scenes.hud.mapLegendConvoy },
    { x: 74, y: 68, kind: locale.scenes.hud.mapLegendEscort },
    { x: 60, y: 28, kind: locale.scenes.hud.mapLegendUnknown },
  ];

  root.innerHTML = `
    <div class="tactical-map-grid"></div>
    ${contacts.map((contact) => `
      <div class="contact contact-static" style="left:${contact.x}%;top:${contact.y}%" title="${contact.kind}"></div>
    `).join('')}
    <div class="player-marker ${sim.submerged ? 'submerged' : 'surface'}" style="left:${sim.x}%;top:${sim.y}%;transform: translate(-50%, -50%) rotate(${sim.heading}deg);"></div>
  `;
}

export function renderHudScene(root, locale) {
  const data = locale.scenes.hud;
  const sim = state.simulation;

  root.innerHTML = `
    <div class="scene-layout">
      <section class="card command-banner">
        <div>
          <div class="eyebrow">${data.phaseLabel}</div>
          <h2>${data.heading}</h2>
          <p class="muted">${data.body}</p>
        </div>
        <div class="status-pills">
          <span class="pill">${data.statusLabels.posture}: ${sim.submerged ? data.statusValues.submerged : data.statusValues.surface}</span>
          <span class="pill">${data.statusLabels.route}: ${sim.routeName}</span>
          <span class="pill ${sim.detected ? 'danger' : 'ok'}">${data.statusLabels.exposure}: ${sim.detected ? data.statusValues.detected : data.statusValues.hidden}</span>
        </div>
      </section>

      <section class="dashboard-grid">
        <article class="card stats-card">
          <h3>${data.telemetryTitle}</h3>
          <div class="stat-list">
            <div><span>${data.metrics.speed}</span><strong id="metric-speed">${sim.speed.toFixed(1)} kn</strong></div>
            <div><span>${data.metrics.depth}</span><strong id="metric-depth">${Math.round(sim.depth)} m</strong></div>
            <div><span>${data.metrics.heading}</span><strong id="metric-heading">${Math.round(sim.heading)}°</strong></div>
            <div><span>${data.metrics.position}</span><strong id="metric-position">${formatCoord(sim.x)} / ${formatCoord(sim.y)}</strong></div>
            <div><span>${data.metrics.time}</span><strong id="metric-time">${String(sim.clockHours).padStart(2, '0')}:${String(sim.clockMinutes).padStart(2, '0')}</strong></div>
          </div>
        </article>

        <article class="card stats-card">
          <h3>${data.resourcesTitle}</h3>
          <div class="meters">
            <div>
              <label>${data.metrics.battery}</label>
              <div class="meter"><span id="meter-battery" style="width:${sim.battery}%"></span></div>
            </div>
            <div>
              <label>${data.metrics.diesel}</label>
              <div class="meter"><span id="meter-diesel" style="width:${sim.diesel}%"></span></div>
            </div>
            <div>
              <label>${data.metrics.hull}</label>
              <div class="meter"><span id="meter-hull" style="width:${sim.hull}%"></span></div>
            </div>
            <div>
              <label>${data.metrics.risk}</label>
              <div class="meter danger"><span id="meter-risk" style="width:${sim.contactRisk}%"></span></div>
            </div>
          </div>
        </article>
      </section>

      <section class="card">
        <div class="section-head">
          <h3>${data.mapTitle}</h3>
          <div class="tag-row compact">
            <span class="tag">${data.mapLegendPlayer}</span>
            <span class="tag">${data.mapLegendConvoy}</span>
            <span class="tag">${data.mapLegendEscort}</span>
            <span class="tag">${data.mapLegendUnknown}</span>
          </div>
        </div>
        <div id="tactical-map" class="tactical-map"></div>
      </section>

      <section class="control-grid">
        <article class="card control-panel">
          <h3>${data.controls.speedTitle}</h3>
          <div class="control-buttons">
            ${data.controls.speedOptions.map((option) => `
              <button class="secondary-btn control-btn" data-action="speed" data-value="${option.value}">${option.label}</button>
            `).join('')}
          </div>
        </article>

        <article class="card control-panel">
          <h3>${data.controls.depthTitle}</h3>
          <div class="control-buttons">
            ${data.controls.depthOptions.map((option) => `
              <button class="secondary-btn control-btn" data-action="depth" data-value="${option.value}">${option.label}</button>
            `).join('')}
          </div>
          <div class="action-row compact-actions">
            <button class="primary-btn" data-action="toggle-submerge">${sim.submerged ? data.controls.surfaceLabel : data.controls.submergeLabel}</button>
          </div>
        </article>

        <article class="card control-panel">
          <h3>${data.controls.headingTitle}</h3>
          <div class="control-buttons">
            ${data.controls.headingOptions.map((option) => `
              <button class="secondary-btn control-btn" data-action="heading" data-value="${option.value}">${option.label}</button>
            `).join('')}
          </div>
        </article>
      </section>

      <section class="card-grid">
        ${data.cards.map((card) => `
          <article class="card">
            <h3>${card.title}</h3>
            <div class="kpi small">${card.value}</div>
            <p class="muted">${card.body}</p>
          </article>
        `).join('')}
      </section>
    </div>
  `;

  const mapRoot = root.querySelector('#tactical-map');
  renderMap(mapRoot, locale);

  root.querySelectorAll('[data-action="speed"]').forEach((button) => {
    button.addEventListener('click', () => {
      sim.targetSpeed = Number(button.dataset.value);
    });
  });

  root.querySelectorAll('[data-action="depth"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (sim.submerged) {
        sim.targetDepth = Number(button.dataset.value);
      }
    });
  });

  root.querySelectorAll('[data-action="heading"]').forEach((button) => {
    button.addEventListener('click', () => {
      sim.targetHeading = normalizeAngle(Number(button.dataset.value));
    });
  });

  root.querySelector('[data-action="toggle-submerge"]').addEventListener('click', () => {
    sim.submerged = !sim.submerged;
    sim.targetDepth = sim.submerged ? Math.max(sim.targetDepth, 30) : 0;
  });
}

export function tickHud(root, locale, now) {
  if (!root || !root.isConnected) return;

  const sim = state.simulation;
  if (!sim.lastUpdateTs) {
    sim.lastUpdateTs = now;
    return;
  }

  const elapsed = Math.min((now - sim.lastUpdateTs) / 1000, 0.2);
  sim.lastUpdateTs = now;
  updateSimulation(elapsed);

  if (!sim._clockAccumulator) sim._clockAccumulator = 0;
  sim._clockAccumulator += elapsed;
  if (sim._clockAccumulator >= 1.35) {
    sim._clockAccumulator = 0;
    updateClock(sim);
  }

  const setText = (selector, text) => {
    const element = root.querySelector(selector);
    if (element) element.textContent = text;
  };
  const setWidth = (selector, width) => {
    const element = root.querySelector(selector);
    if (element) element.style.width = `${width}%`;
  };

  setText('#metric-speed', `${sim.speed.toFixed(1)} kn`);
  setText('#metric-depth', `${Math.round(sim.depth)} m`);
  setText('#metric-heading', `${Math.round(sim.heading)}°`);
  setText('#metric-position', `${formatCoord(sim.x)} / ${formatCoord(sim.y)}`);
  setText('#metric-time', `${String(sim.clockHours).padStart(2, '0')}:${String(sim.clockMinutes).padStart(2, '0')}`);
  setWidth('#meter-battery', sim.battery);
  setWidth('#meter-diesel', sim.diesel);
  setWidth('#meter-hull', sim.hull);
  setWidth('#meter-risk', sim.contactRisk);

  const mapRoot = root.querySelector('#tactical-map');
  if (mapRoot) renderMap(mapRoot, locale);
}
