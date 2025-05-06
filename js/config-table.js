import { calcStat } from './primary-attributes.js';

const chartInstances = {};
const expandedChartInstance = { chart: null, currentStat: null };
const statToggles = {};

function createOrUpdateChart(statName, primaryValues, secondaryValue, primaryAttr) {
  const canvas = document.getElementById(statName + '_graph');
  
  if (chartInstances[statName]) {
    chartInstances[statName].destroy();
  }

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
  
  const toggleIndex = statToggles[statName] || 0;
  const primaryAttrName = statNames[statName][toggleIndex] || statNames[statName][0];
  
  const currentVal = primaryValues[toggleIndex];
  const step = Math.max(5, Math.floor(currentVal / 5));
  const startVal = Math.max(0, currentVal - (step * 5));
  
  const data = {
    labels: [],
    datasets: [{
      label: statName,
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };
  
  for (let i = 0; i <= 10; i++) {
    const xValue = startVal + (i * step);
    data.labels.push(xValue);
    
    const tempPrimary = [...primaryValues];
    tempPrimary[toggleIndex] = xValue;
    
    let p1 = 0, p2 = 0;
    switch(statName) {
      case 'HP':   p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'STA':  p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'ENG':  p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'PDMG': p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'SKDMG':p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'ASPD': p1 = xValue; p2 = 0; break;
      case 'CRIT': p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'ARM':  p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'RES':  p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'CDR':  p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
      case 'MSPD': p1 = toggleIndex === 0 ? xValue : primaryValues[0]; p2 = toggleIndex === 1 ? xValue : primaryValues[1]; break;
    }
    
    const val = calcStat(statName, p1, p2);
    data.datasets[0].data.push(val);
  }
  
  chartInstances[statName] = new Chart(canvas, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `${statName} vs ${primaryAttrName}`,
          color: 'white',
          font: {
            size: 10
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              return `${primaryAttrName}: ${tooltipItems[0].label}`;
            },
            label: function(tooltipItem) {
              return `${statName}: ${tooltipItem.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: false
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f9fafb',
            maxRotation: 0,
            display: false
          }
        },
        y: {
          title: {
            display: false
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f9fafb',
            display: false
          }
        }
      }
    }
  });
}

function createExpandedChart(statName, range = 50) {
  const canvas = document.getElementById('expandedGraph');
  const modal = document.getElementById('graphModal');
  const modalTitle = document.getElementById('modalTitle');
  
  if (expandedChartInstance.chart) {
    expandedChartInstance.chart.destroy();
  }
  
  expandedChartInstance.currentStat = statName;
  
  const POW = +document.getElementById('pow').value;
  const DEX = +document.getElementById('dex').value;
  const VIT = +document.getElementById('vit').value;
  const FOC = +document.getElementById('foc').value;
  const SPR = +document.getElementById('spr').value;
  
  let p1=0, p2=0;
  switch(statName) {
    case 'HP':   p1 = VIT; p2 = SPR; break;
    case 'STA':  p1 = VIT; p2 = DEX; break;
    case 'ENG':  p1 = SPR; p2 = FOC; break;
    case 'PDMG': p1 = POW; p2 = DEX; break;
    case 'SKDMG':p1 = FOC; p2 = POW; break;
    case 'ASPD': p1 = DEX; p2 = 0; break;
    case 'CRIT': p1 = FOC; p2 = DEX; break;
    case 'ARM':  p1 = VIT; p2 = POW; break;
    case 'RES':  p1 = SPR; p2 = VIT; break;
    case 'CDR':  p1 = FOC; p2 = SPR; break;
    case 'MSPD': p1 = DEX; p2 = SPR; break;
  }
  
  const primaryValues = [p1, p2];
  
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
  
  const fullNames = {
    'HP': 'Health Points',
    'STA': 'Stamina',
    'ENG': 'Energy',
    'PDMG': 'Physical Damage',
    'SKDMG': 'Skill Damage',
    'ASPD': 'Attack Speed',
    'CRIT': 'Critical Chance',
    'ARM': 'Armor',
    'RES': 'Resistance',
    'CDR': 'Cooldown Reduction',
    'MSPD': 'Movement Speed'
  };
  
  const fullPrimaryNames = {
    'POW': 'Power',
    'DEX': 'Dexterity',
    'VIT': 'Vitality',
    'FOC': 'Focus',
    'SPR': 'Spirit'
  };
  
  const toggleIndex = statToggles[statName] || 0;
  const primaryAttrName = statNames[statName][toggleIndex] || statNames[statName][0];
  const fullPrimaryName = fullPrimaryNames[primaryAttrName];
  
  modalTitle.textContent = `${fullNames[statName]} vs ${fullPrimaryName}`;
  
  const currentVal = primaryValues[toggleIndex];
  const halfRange = range / 2;
  const step = Math.max(2, Math.floor(halfRange / 20));
  const startVal = Math.max(0, currentVal - halfRange);
  const numPoints = Math.floor(range / step) + 1;
  
  const data = {
    labels: [],
    datasets: [{
      label: statName,
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: true,
      pointRadius: 3
    }]
  };
  
  for (let i = 0; i <= numPoints; i++) {
    const xValue = startVal + (i * step);
    data.labels.push(xValue);
    
    let p1Calc = 0, p2Calc = 0;
    switch(statName) {
      case 'HP':   p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'STA':  p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'ENG':  p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'PDMG': p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'SKDMG':p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'ASPD': p1Calc = xValue; p2Calc = 0; break;
      case 'CRIT': p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'ARM':  p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'RES':  p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'CDR':  p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
      case 'MSPD': p1Calc = toggleIndex === 0 ? xValue : p1; p2Calc = toggleIndex === 1 ? xValue : p2; break;
    }
    
    const val = calcStat(statName, p1Calc, p2Calc);
    data.datasets[0].data.push(val);
  }
  
  expandedChartInstance.chart = new Chart(canvas, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `${fullNames[statName]} vs ${fullPrimaryName}`,
          color: 'white',
          font: {
            size: 18
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              return `${fullPrimaryName}: ${tooltipItems[0].label}`;
            },
            label: function(tooltipItem) {
              return `${fullNames[statName]}: ${tooltipItem.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: fullPrimaryName,
            color: '#f9fafb',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f9fafb'
          }
        },
        y: {
          title: {
            display: true,
            text: fullNames[statName],
            color: '#f9fafb',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#f9fafb'
          }
        }
      }
    }
  });
  
  const altStatName = statNames[statName][1] || statNames[statName][0];
  const altFullName = fullPrimaryNames[altStatName] || fullPrimaryNames[statNames[statName][0]];
  document.getElementById('expandedToggle').textContent = `Show vs ${statToggles[statName] ? fullPrimaryNames[statNames[statName][0]] : altFullName}`;
  
  modal.style.display = 'flex';
}

export { createOrUpdateChart, createExpandedChart };
