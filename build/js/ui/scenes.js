import { createFeatureGrid, createMetricGrid, createStatusGrid } from './components.js';

export function renderCommandScene(t) {
  return `
    <section class="hero-panel">
      <h2>${t.command.title}</h2>
      <p class="muted">${t.command.intro}</p>
      ${createMetricGrid(t.command.metrics)}
      ${createFeatureGrid(t.command.features)}
      <div class="badge-row">
        ${t.command.badges.map((item) => `<span class="badge">${item}</span>`).join('')}
      </div>
      <div class="cta-row">
        <button class="cta-btn" type="button">${t.command.ctaPrimary}</button>
        <button class="cta-btn secondary" type="button">${t.command.ctaSecondary}</button>
      </div>
    </section>
  `;
}

export function renderRoadmapScene(t) {
  return `
    <section class="hero-panel">
      <h2>${t.roadmap.title}</h2>
      <p class="muted">${t.roadmap.intro}</p>
      <div class="timeline">
        ${t.roadmap.steps.map(([phase, description]) => `
          <article class="timeline-step">
            <small>${phase}</small>
            <strong>${description}</strong>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

export function renderSystemsScene(t) {
  return `
    <section class="hero-panel">
      <h2>${t.systems.title}</h2>
      <p class="muted">${t.systems.intro}</p>
      ${createStatusGrid(t.systems.statuses)}
    </section>
  `;
}
