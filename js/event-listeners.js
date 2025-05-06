import { refresh } from './computed-secondaries.js';
import { showModal, hideModal, showTooltip, hideTooltip } from './modal-tooltip.js';
import { createExpandedChart } from './config-table.js';

function setupEventListeners() {
  document.querySelectorAll('input').forEach(i => i.addEventListener('input', refresh));
  window.addEventListener('DOMContentLoaded', () => {
    setupToggleButtons();
    setupExpandableGraphs();
    refresh();
  });
}

function setupToggleButtons() {
  document.querySelectorAll('.graph-toggle').forEach(button => {
    if (button.id === 'expandedToggle') {
      button.addEventListener('click', function() {
        if (expandedChartInstance.currentStat) {
          const stat = expandedChartInstance.currentStat;
          statToggles[stat] = statToggles[stat] === 1 ? 0 : 1;
          const range = +document.getElementById('rangeSlider').value;
          createExpandedChart(stat, range);
        }
      });
    } else {
      button.addEventListener('click', function() {
        const stat = this.getAttribute('data-stat');
        statToggles[stat] = statToggles[stat] === 1 ? 0 : 1;
        
        const statNames = {
          'HP': ['VIT', 'SPR'],
          'STA': ['VIT', 'DEX'],
          'ENG': ['SPR', 'FOC'],
          'PDMG': ['POW', 'DEX'],
          'SKDMG': ['FOC', 'POW'],
          'ASPD': ['DEX', ''],
          'CRIT': ['FOC', 'DEX'],
          'ARM': ['VIT', 'POW'],
          'RES': ['SPR', 'VIT'],
          'CDR': ['FOC', 'SPR'],
          'MSPD': ['DEX', 'SPR']
        };
        
        const newPrimary = statNames[stat][statToggles[stat]];
        if (newPrimary) {
          this.textContent = `Show vs ${newPrimary}`;
          refresh();
        }
      });
      
      const stat = button.getAttribute('data-stat');
      const statNames = {
        'HP': ['VIT', 'SPR'],
        'STA': ['VIT', 'DEX'],
        'ENG': ['SPR', 'FOC'],
        'PDMG': ['POW', 'DEX'],
        'SKDMG': ['FOC', 'POW'],
        'ASPD': ['DEX', ''],
        'CRIT': ['FOC', 'DEX'],
        'ARM': ['VIT', 'POW'],
        'RES': ['SPR', 'VIT'],
        'CDR': ['FOC', 'SPR'],
        'MSPD': ['DEX', 'SPR']
      };
      
      const initialAttr = statNames[stat][0];
      button.textContent = `Show vs ${statNames[stat][1] || initialAttr}`;
    }
  });
}

function setupExpandableGraphs() {
  document.querySelectorAll('.graph-container').forEach(container => {
    container.addEventListener('click', function() {
      const statName = this.getAttribute('data-stat');
      createExpandedChart(statName);
    });
  });
  
  document.querySelector('.modal-close').addEventListener('click', function() {
    hideModal('graphModal');
  });
  
  document.getElementById('graphModal').addEventListener('click', function(event) {
    if (event.target === this) {
      hideModal('graphModal');
    }
  });
  
  const rangeSlider = document.getElementById('rangeSlider');
  const rangeValue = document.getElementById('rangeValue');
  
  rangeSlider.addEventListener('input', function() {
    rangeValue.textContent = this.value;
    if (expandedChartInstance.currentStat) {
      createExpandedChart(expandedChartInstance.currentStat, +this.value);
    }
  });
}

export { setupEventListeners };
