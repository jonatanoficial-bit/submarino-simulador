export function renderMenuScene(root, locale) {
  const data = locale.scenes.menu;

  root.innerHTML = `
    <div class="scene-layout">
      <section class="hero">
        <div class="eyebrow">${data.phaseLabel}</div>
        <h2>${data.heroTitle}</h2>
        <p>${data.heroText}</p>
        <div class="action-row">
          <button class="primary-btn" data-scene-target="hud">${locale.ui.buttons.openDemo}</button>
          <button class="secondary-btn" data-scene-target="briefing">${locale.ui.buttons.reviewArchitecture}</button>
        </div>
      </section>

      <section class="card-grid">
        ${data.cards.map((card) => `
          <article class="card">
            <h3>${card.title}</h3>
            <div class="kpi">${card.value}</div>
            <p class="muted">${card.body}</p>
          </article>
        `).join('')}
      </section>

      <section class="card">
        <h3>${data.tagsTitle}</h3>
        <div class="tag-row">
          ${data.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </section>
    </div>
  `;
}
