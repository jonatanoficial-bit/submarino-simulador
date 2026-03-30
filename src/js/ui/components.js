export function createInfoBlocks(items) {
  return items.map(([label, value]) => `
    <article class="info-block">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </article>
  `).join('');
}

export function createMetricGrid(items) {
  return `
    <div class="metric-grid">
      ${items.map(([title, value]) => `
        <article class="metric-card">
          <strong>${title}</strong>
          <span class="muted">${value}</span>
        </article>
      `).join('')}
    </div>
  `;
}

export function createFeatureGrid(items) {
  return `
    <div class="feature-grid">
      ${items.map(([title, text]) => `
        <article class="feature-card">
          <strong>${title}</strong>
          <p class="muted">${text}</p>
        </article>
      `).join('')}
    </div>
  `;
}

export function createStatusGrid(items) {
  return `
    <div class="status-grid">
      ${items.map(([title, text]) => `
        <article class="status-card">
          <strong>${title}</strong>
          <p class="muted">${text}</p>
        </article>
      `).join('')}
    </div>
  `;
}
