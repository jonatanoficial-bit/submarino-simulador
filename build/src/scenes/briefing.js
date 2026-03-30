export function renderBriefingScene(root, locale) {
  const data = locale.scenes.briefing;

  root.innerHTML = `
    <div class="scene-layout">
      <section class="card">
        <div class="eyebrow">${data.phaseLabel}</div>
        <h2>${data.heading}</h2>
        <p class="muted">${data.body}</p>
      </section>

      <section class="card">
        <h3>${data.milestonesTitle}</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>${data.tableHeaders[0]}</th>
              <th>${data.tableHeaders[1]}</th>
            </tr>
          </thead>
          <tbody>
            ${data.milestones.map((row) => `
              <tr>
                <td>${row[0]}</td>
                <td>${row[1]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section class="card-grid">
        ${data.highlights.map((item) => `
          <article class="card">
            <h3>${item.title}</h3>
            <p class="muted">${item.body}</p>
          </article>
        `).join('')}
      </section>
    </div>
  `;
}
