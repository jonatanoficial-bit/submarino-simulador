import { localization } from './data/localization.js';
import { appState } from './core/state.js';
import { createInfoBlocks } from './ui/components.js';
import { renderCommandScene, renderRoadmapScene, renderSystemsScene } from './ui/scenes.js';

const elements = {
  gameSubtitle: document.getElementById('game-subtitle'),
  languageLabel: document.getElementById('language-label'),
  languageSelect: document.getElementById('language-select'),
  captainPanelTitle: document.getElementById('captain-panel-title'),
  systemsPanelTitle: document.getElementById('systems-panel-title'),
  captainSummary: document.getElementById('captain-summary'),
  systemsSummary: document.getElementById('systems-summary'),
  sceneTabs: document.getElementById('scene-tabs'),
  sceneRoot: document.getElementById('scene-root'),
  versionDisplay: document.getElementById('version-display'),
  buildDisplay: document.getElementById('build-display'),
  footerObjectiveLabel: document.getElementById('footer-objective-label'),
  footerObjectiveValue: document.getElementById('footer-objective-value'),
  footerStatusLabel: document.getElementById('footer-status-label'),
  footerStatusValue: document.getElementById('footer-status-value'),
  footerPhaseLabel: document.getElementById('footer-phase-label'),
  footerPhaseValue: document.getElementById('footer-phase-value')
};

function getT() {
  return localization[appState.language] || localization['pt-BR'];
}

function renderTabs(t) {
  const tabs = [
    ['command', t.tabs.command],
    ['roadmap', t.tabs.roadmap],
    ['systems', t.tabs.systems]
  ];

  elements.sceneTabs.innerHTML = tabs.map(([key, label]) => `
    <button class="scene-tab ${appState.activeScene === key ? 'active' : ''}" data-scene="${key}" type="button">
      ${label}
    </button>
  `).join('');

  elements.sceneTabs.querySelectorAll('[data-scene]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.activeScene = button.dataset.scene;
      render();
    });
  });
}

function renderScene(t) {
  const scenes = {
    command: renderCommandScene(t),
    roadmap: renderRoadmapScene(t),
    systems: renderSystemsScene(t)
  };
  elements.sceneRoot.innerHTML = scenes[appState.activeScene] || scenes.command;
}

function renderHud(t) {
  elements.gameSubtitle.textContent = t.gameSubtitle;
  elements.languageLabel.textContent = t.language;
  elements.captainPanelTitle.textContent = t.captainPanelTitle;
  elements.systemsPanelTitle.textContent = t.systemsPanelTitle;
  elements.captainSummary.innerHTML = createInfoBlocks(t.captainSummary);
  elements.systemsSummary.innerHTML = createInfoBlocks(t.systemsSummary);
  elements.versionDisplay.textContent = `${t.versionPrefix}: ${appState.buildInfo.version}`;
  elements.buildDisplay.textContent = `${t.buildPrefix}: ${appState.buildInfo.buildTimestamp}`;
  elements.footerObjectiveLabel.textContent = t.objectiveLabel;
  elements.footerObjectiveValue.textContent = t.objectiveValue;
  elements.footerStatusLabel.textContent = t.statusLabel;
  elements.footerStatusValue.textContent = t.statusValue;
  elements.footerPhaseLabel.textContent = t.phaseLabel;
  elements.footerPhaseValue.textContent = `${appState.buildInfo.phase} — ${t.footerPhaseValue}`;
}

function render() {
  const t = getT();
  elements.languageSelect.value = appState.language;
  renderHud(t);
  renderTabs(t);
  renderScene(t);
}

elements.languageSelect.addEventListener('change', (event) => {
  appState.language = event.target.value;
  render();
});

render();
