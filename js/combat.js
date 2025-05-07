document.addEventListener('DOMContentLoaded', function() {
  initCombatSimulator();
});

let entity1 = null;
let entity2 = null;
let combatChart = null;
let statComparisonChart = null;
let modifiers = [];

async function initCombatSimulator() {
  document.getElementById('simulateCombat').addEventListener('click', runCombatSimulation);
  document.getElementById('entity1Select').addEventListener('change', loadEntityOne);
  document.getElementById('entity2Select').addEventListener('change', loadEntityTwo);
  document.getElementById('applyModifierBtn').addEventListener('click', applyModifier);
  await loadEntitiesIntoSelects();
}

async function loadEntitiesIntoSelects() {
  try {
    const entities = await rpgDB.getAllEntities();
    if (!entities || entities.length === 0) {
      alert('No entities found in the database. Please create some entities in the Stat Calculator first.');
      return;
    }
    const select1 = document.getElementById('entity1Select');
    const select2 = document.getElementById('entity2Select');
    select1.innerHTML = '<option value="">Select Entity</option>';
    select2.innerHTML = '<option value="">Select Entity</option>';
    entities.forEach(entity => {
      const option1 = document.createElement('option');
      option1.value = entity.id;
      option1.textContent = `${entity.name} (${entity.type})`;
      const option2 = document.createElement('option');
      option2.value = entity.id;
      option2.textContent = `${entity.name} (${entity.type})`;
      select1.appendChild(option1);
      select2.appendChild(option2);
    });
  } catch (error) {
    console.error('Error loading entities:', error);
    alert('Failed to load entities. See console for details.');
  }
}

async function loadEntityOne() {
  const entityId = document.getElementById('entity1Select').value;
  if (!entityId) {
    document.getElementById('entity1Stats').innerHTML = '<div class="stat-placeholder">Select an entity to view stats</div>';
    entity1 = null;
    return;
  }
  try {
    entity1 = await rpgDB.getEntityById(parseInt(entityId));
    if (!entity1) {
      console.error(`Entity with ID ${entityId} not found.`);
      document.getElementById('entity1Stats').innerHTML = '<div class="stat-placeholder">Entity not found</div>';
      return;
    }
    if (!entity1.hp) {
      console.log("Calculating stats for entity:", entity1);
      entity1 = calculateEntityStats(entity1);
    }
    console.log("Loaded entity 1:", entity1);
    displayEntityStats(entity1, 'entity1Stats');
  } catch (error) {
    console.error('Error loading entity 1:', error);
    document.getElementById('entity1Stats').innerHTML = '<div class="stat-placeholder">Error loading entity</div>';
  }
}

async function loadEntityTwo() {
  const entityId = document.getElementById('entity2Select').value;
  if (!entityId) {
    document.getElementById('entity2Stats').innerHTML = '<div class="stat-placeholder">Select an entity to view stats</div>';
    entity2 = null;
    return;
  }
  try {
    entity2 = await rpgDB.getEntityById(parseInt(entityId));
    if (!entity2) {
      console.error(`Entity with ID ${entityId} not found.`);
      document.getElementById('entity2Stats').innerHTML = '<div class="stat-placeholder">Entity not found</div>';
      return;
    }
    if (!entity2.hp) {
      console.log("Calculating stats for entity:", entity2);
      entity2 = calculateEntityStats(entity2);
    }
    console.log("Loaded entity 2:", entity2);
    displayEntityStats(entity2, 'entity2Stats');
  } catch (error) {
    console.error('Error loading entity 2:', error);
    document.getElementById('entity2Stats').innerHTML = '<div class="stat-placeholder">Error loading entity</div>';
  }
}

function calculateEntityStats(entity) {
  const entityWithStats = { ...entity };
  const POW = entity.pow;
  const DEX = entity.dex;
  const VIT = entity.vit;
  const FOC = entity.foc;
  const SPR = entity.spr;
  entityWithStats.hp = calcStatValue('HP', VIT, SPR);
  entityWithStats.sta = calcStatValue('STA', VIT, DEX);
  entityWithStats.eng = calcStatValue('ENG', SPR, FOC);
  entityWithStats.pdmg = calcStatValue('PDMG', POW, DEX);
  entityWithStats.skdmg = calcStatValue('SKDMG', FOC, POW);
  entityWithStats.aspd = calcStatValue('ASPD', DEX, 0);
  entityWithStats.crit = calcStatValue('CRIT', FOC, DEX);
  entityWithStats.arm = calcStatValue('ARM', VIT, POW);
  entityWithStats.res = calcStatValue('RES', SPR, VIT);
  entityWithStats.cdr = calcStatValue('CDR', FOC, SPR);
  entityWithStats.mspd = calcStatValue('MSPD', DEX, SPR);
  return entityWithStats;
}

function calcStatValue(name, p1, p2) {
  const defaults = {
    'HP': { w1: 1, w2: 0.5, pre: 0, exp: 1.25, mult: 5, post: 0 },
    'STA': { w1: 1, w2: 0.5, pre: 0, exp: 1.15, mult: 4, post: 0 },
    'ENG': { w1: 1, w2: 0.5, pre: 0, exp: 1.2, mult: 4, post: 0 },
    'PDMG': { w1: 1, w2: 0.5, pre: 0, exp: 1.35, mult: 3, post: 0 },
    'SKDMG': { w1: 1, w2: 0.5, pre: 0, exp: 1.3, mult: 3, post: 0 },
    'ASPD': { w1: 1, w2: 0, pre: 0, exp: 1, mult: 0.01, post: 1 },
    'CRIT': { w1: 1, w2: 0.5, pre: 0, exp: 1.25, mult: 0.2, post: 0 },
    'ARM': { w1: 1, w2: 0.5, pre: 0, exp: 1.1, mult: 2, post: 0 },
    'RES': { w1: 1, w2: 0.25, pre: 0, exp: 1.1, mult: 2, post: 0 },
    'CDR': { w1: 1, w2: 0.5, pre: 0, exp: 1.15, mult: 0.1, post: 0 },
    'MSPD': { w1: 1, w2: 0.5, pre: 0, exp: 1.1, mult: 0.1, post: 0 }
  };
  const params = defaults[name];
  const base = p1 * params.w1 + p2 * params.w2 + params.pre;
  return Math.pow(base, params.exp) * params.mult + params.post;
}

function displayEntityStats(entity, containerId) {
  const container = document.getElementById(containerId);
  if (!entity) {
    container.innerHTML = '<div class="stat-placeholder">Entity not found</div>';
    return;
  }
  let html = `
    <h3>${entity.name}</h3>
    <div class="stat-group">
      <span class="stat-name">Type:</span> 
      <span class="stat-value">${entity.type}</span>
    </div>
    <h4>Base Stats</h4>
    <div class="stat-group">
      <span class="stat-name">Power:</span> 
      <span class="stat-value">${entity.pow}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Dexterity:</span> 
      <span class="stat-value">${entity.dex}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Vitality:</span> 
      <span class="stat-value">${entity.vit}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Focus:</span> 
      <span class="stat-value">${entity.foc}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Spirit:</span> 
      <span class="stat-value">${entity.spr}</span>
    </div>
  `;
  html += `<h4>Combat Stats</h4>`;
  const statDisplays = {
    hp: { name: 'Health Points', format: '0.0' },
    sta: { name: 'Stamina', format: '0.0' },
    eng: { name: 'Energy', format: '0.0' },
    pdmg: { name: 'Physical Damage', format: '0.0' },
    skdmg: { name: 'Skill Damage', format: '0.0' },
    aspd: { name: 'Attack Speed', format: '0.00' },
    crit: { name: 'Critical Rate', format: '0.0', suffix: '%' },
    arm: { name: 'Armor', format: '0.0' },
    res: { name: 'Resistance', format: '0.0' },
    cdr: { name: 'Cooldown Reduction', format: '0.0', suffix: '%' },
    mspd: { name: 'Movement Speed', format: '0.0', suffix: '%' }
  };
  for (const [statKey, display] of Object.entries(statDisplays)) {
    if (entity[statKey] !== undefined) {
      let value = entity[statKey];
      if (display.format === '0.0') {
        value = value.toFixed(1);
      } else if (display.format === '0.00') {
        value = value.toFixed(2);
      }
      if (display.suffix) {
        value += display.suffix;
      }
      html += `
      <div class="stat-group">
        <span class="stat-name">${display.name}:</span>
        <span class="stat-value">${value}</span>
      </div>`;
    }
  }
  container.innerHTML = html;
}

function runCombatSimulation() {
  if (!entity1 || !entity2) {
    alert('Please select two entities for combat.');
    return;
  }
  const numRounds = parseInt(document.getElementById('numRounds').value) || 10;
  const modifiedEntity1 = applyModifiersToEntity(entity1);
  const modifiedEntity2 = applyModifiersToEntity(entity2);
  const results = simulateCombat(modifiedEntity1, modifiedEntity2, numRounds);
  displayCombatResults(results);
  document.getElementById('combatResults').classList.add('visible');
  document.getElementById('combatResults').scrollIntoView({ behavior: 'smooth' });
}

function simulateCombat(entity1, entity2, maxRounds) {
  const combatant1 = {
    ...entity1,
    currentHP: entity1.hp,
    currentSTA: entity1.sta,
    currentENG: entity1.eng
  };
  const combatant2 = {
    ...entity2,
    currentHP: entity2.hp,
    currentSTA: entity2.sta,
    currentENG: entity2.eng
  };
  const results = {
    rounds: [],
    winner: null,
    winnerName: null,
    loserName: null,
    totalDamage: { [entity1.name]: 0, [entity2.name]: 0 },
    criticalHits: { [entity1.name]: 0, [entity2.name]: 0 },
    hpHistory: { [entity1.name]: [entity1.hp], [entity2.name]: [entity2.hp] }
  };
  const entity1First = combatant1.aspd >= combatant2.aspd;
  for (let round = 1; round <= maxRounds; round++) {
    const roundResult = {
      round,
      actions: []
    };
    const firstAttacker = entity1First ? combatant1 : combatant2;
    const firstDefender = entity1First ? combatant2 : combatant1;
    const firstAttack = performAttack(firstAttacker, firstDefender, round);
    roundResult.actions.push(firstAttack);
    results.totalDamage[firstAttacker.name] += firstAttack.damage;
    if (firstAttack.critical) {
      results.criticalHits[firstAttacker.name]++;
    }
    if (firstDefender.currentHP <= 0) {
      results.winner = firstAttacker;
      results.winnerName = firstAttacker.name;
      results.loserName = firstDefender.name;
      results.rounds.push(roundResult);
      results.hpHistory[entity1.name].push(combatant1.currentHP);
      results.hpHistory[entity2.name].push(combatant2.currentHP);
      break;
    }
    const secondAttack = performAttack(firstDefender, firstAttacker, round);
    roundResult.actions.push(secondAttack);
    results.totalDamage[firstDefender.name] += secondAttack.damage;
    if (secondAttack.critical) {
      results.criticalHits[firstDefender.name]++;
    }
    if (firstAttacker.currentHP <= 0) {
      results.winner = firstDefender;
      results.winnerName = firstDefender.name;
      results.loserName = firstAttacker.name;
      results.rounds.push(roundResult);
      results.hpHistory[entity1.name].push(combatant1.currentHP);
      results.hpHistory[entity2.name].push(combatant2.currentHP);
      break;
    }
    const staRecovery = 5;
    const engRecovery = 3;
    combatant1.currentSTA = Math.min(combatant1.sta, combatant1.currentSTA + staRecovery);
    combatant2.currentSTA = Math.min(combatant2.sta, combatant2.currentSTA + staRecovery);
    combatant1.currentENG = Math.min(combatant1.eng, combatant1.currentENG + engRecovery);
    combatant2.currentENG = Math.min(combatant2.eng, combatant2.currentENG + engRecovery);
    results.rounds.push(roundResult);
    results.hpHistory[entity1.name].push(combatant1.currentHP);
    results.hpHistory[entity2.name].push(combatant2.currentHP);
  }
  if (!results.winner) {
    const hp1Percent = combatant1.currentHP / combatant1.hp;
    const hp2Percent = combatant2.currentHP / combatant2.hp;
    if (hp1Percent > hp2Percent) {
      results.winner = combatant1;
      results.winnerName = combatant1.name;
      results.loserName = combatant2.name;
    } else if (hp2Percent > hp1Percent) {
      results.winner = combatant2;
      results.winnerName = combatant2.name;
      results.loserName = combatant1.name;
    } else {
      if (results.totalDamage[combatant1.name] > results.totalDamage[combatant2.name]) {
        results.winner = combatant1;
        results.winnerName = combatant1.name;
        results.loserName = combatant2.name;
      } else {
        results.winner = combatant2;
        results.winnerName = combatant2.name;
        results.loserName = combatant1.name;
      }
    }
  }
  return results;
}

function performAttack(attacker, defender, round) {
  let attackType, attackName, attackDescription, damage, resourceUsed;
  if (attacker.currentSTA >= 10) {
    attackType = 'physical';
    attackName = 'Physical Attack';
    attackDescription = `${attacker.name} attacks ${defender.name} physically`;
    damage = calculatePhysicalDamage(attacker.pdmg, defender.arm);
    attacker.currentSTA -= 10;
    resourceUsed = 'STA';
  } else if (attacker.currentENG >= 15) {
    attackType = 'skill';
    attackName = 'Skill Attack';
    attackDescription = `${attacker.name} uses a skill on ${defender.name}`;
    damage = calculateSkillDamage(attacker.skdmg, defender.res);
    attacker.currentENG -= 15;
    resourceUsed = 'ENG';
  } else {
    attackType = 'weak';
    attackName = 'Weak Attack';
    attackDescription = `${attacker.name} makes a weak attack against ${defender.name}`;
    damage = calculatePhysicalDamage(attacker.pdmg * 0.5, defender.arm);
    resourceUsed = 'None';
  }
  damage = damage * (0.9 + Math.random() * 0.2);
  const critical = Math.random() * 100 < attacker.crit;
  if (critical) {
    damage *= 1.5;
  }
  damage *= (1 + round * 0.01);
  damage *= (attacker.aspd / 1.5);
  damage = Math.max(1, Math.floor(damage));
  defender.currentHP -= damage;
  defender.currentHP = Math.max(0, defender.currentHP);
  let desc = `${attackDescription}`;
  if (critical) {
    desc += ` (CRITICAL HIT!)`;
  }
  desc += ` for ${damage} damage`;
  return {
    attacker: attacker.name,
    defender: defender.name,
    attackType,
    damage,
    critical,
    description: desc,
    defenderHP: defender.currentHP,
    defenderMaxHP: defender.hp,
    resourceUsed
  };
}

function calculatePhysicalDamage(attackValue, defenseValue) {
  const damageReduction = defenseValue / (defenseValue + 50);
  return attackValue * (1 - damageReduction);
}

function calculateSkillDamage(attackValue, defenseValue) {
  const damageReduction = defenseValue / (defenseValue + 75);
  return attackValue * (1 - damageReduction);
}

function displayCombatResults(results) {
  const summaryDiv = document.getElementById('resultsSummary');
  const rounds = results.rounds.length;
  if (results.winner) {
    summaryDiv.innerHTML = `
      <p><span class="winner">${results.winnerName}</span> defeated ${results.loserName} in ${rounds} round${rounds > 1 ? 's' : ''}!</p>
      <p>Total damage dealt: ${results.winner.name}: ${Math.floor(results.totalDamage[results.winner.name])} | ${results.loserName}: ${Math.floor(results.totalDamage[results.loserName])}</p>
      <p>Critical hits: ${results.winner.name}: ${results.criticalHits[results.winner.name]} | ${results.loserName}: ${results.criticalHits[results.loserName]}</p>
    `;
  } else {
    summaryDiv.innerHTML = `
      <p>The battle ended in a draw after ${rounds} rounds!</p>
      <p>Total damage dealt: ${entity1.name}: ${Math.floor(results.totalDamage[entity1.name])} | ${entity2.name}: ${Math.floor(results.totalDamage[entity2.name])}</p>
      <p>Critical hits: ${entity1.name}: ${results.criticalHits[entity1.name]} | ${entity2.name}: ${results.criticalHits[entity2.name]}</p>
    `;
  }
  const logDiv = document.getElementById('combatLog');
  logDiv.innerHTML = '';
  results.rounds.forEach(round => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round-entry';
    let roundHtml = `<div class="round-title">Round ${round.round}</div>`;
    round.actions.forEach(action => {
      roundHtml += `<div class="attack">
        ${action.critical ? '<span class="critical">CRITICAL! </span>' : ''}
        ${action.description}. 
        <span class="health">${action.defender} HP: ${Math.max(0, action.defenderHP).toFixed(0)}/${action.defenderMaxHP.toFixed(0)}</span>
      </div>`;
    });
    roundDiv.innerHTML = roundHtml;
    logDiv.appendChild(roundDiv);
  });
  displayHPChart(results);
  displayStatComparison();
}

function displayHPChart(results) {
  const ctx = document.getElementById('combatChart').getContext('2d');
  if (combatChart) {
    combatChart.destroy();
  }
  const labels = [];
  for (let i = 0; i <= results.rounds.length; i++) {
    labels.push(`Round ${i}`);
  }
  const entity1Name = entity1.name;
  const entity2Name = entity2.name;
  combatChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `${entity1Name} HP`,
          data: results.hpHistory[entity1Name],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: true
        },
        {
          label: `${entity2Name} HP`,
          data: results.hpHistory[entity2Name],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'HP over Combat Rounds',
          color: '#333333'
        },
        legend: {
          labels: {
            color: '#333333'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#333333'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#333333'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
}

function displayStatComparison() {
  const ctx = document.getElementById('statComparisonChart').getContext('2d');
  if (statComparisonChart) {
    statComparisonChart.destroy();
  }
  const statsToCompare = [
    { key: 'pdmg', label: 'Physical DMG' },
    { key: 'skdmg', label: 'Skill DMG' },
    { key: 'arm', label: 'Armor' },
    { key: 'res', label: 'Resistance' },
    { key: 'hp', label: 'Health' },
    { key: 'aspd', label: 'Attack Speed' },
    { key: 'crit', label: 'Critical Rate' }
  ];
  const labels = statsToCompare.map(s => s.label);
  const maxValues = {};
  statsToCompare.forEach(stat => {
    maxValues[stat.key] = Math.max(entity1[stat.key] || 0, entity2[stat.key] || 0);
  });
  const entity1Data = statsToCompare.map(stat => {
    const maxVal = maxValues[stat.key];
    return maxVal > 0 ? (entity1[stat.key] / maxVal) * 100 : 0;
  });
  const entity2Data = statsToCompare.map(stat => {
    const maxVal = maxValues[stat.key];
    return maxVal > 0 ? (entity2[stat.key] / maxVal) * 100 : 0;
  });
  statComparisonChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: entity1.name,
          data: entity1Data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        },
        {
          label: entity2.name,
          data: entity2Data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Stat Comparison',
          color: '#333333'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const value = context.raw.toFixed(1);
              const actualStat = statsToCompare[index].key;
              const actualValue = context.dataset.label === entity1.name 
                ? entity1[actualStat].toFixed(1)
                : entity2[actualStat].toFixed(1);
              return `${context.dataset.label}: ${actualValue} (${value}%)`;
            }
          }
        },
        legend: {
          labels: {
            color: '#333333'
          }
        }
      },
      scales: {
        r: {
          angleLines: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          pointLabels: {
            color: '#333333'
          },
          ticks: {
            backdropColor: 'transparent',
            color: '#333333'
          }
        }
      }
    }
  });
}

function applyModifier() {
  const operation = document.getElementById('modifierOperation').value;
  const type = document.getElementById('modifierType').value;
  const stat = document.getElementById('modifierStat').value;
  const value = parseFloat(document.getElementById('modifierValue').value);
  if (isNaN(value)) {
    alert('Please enter a valid value for the modifier.');
    return;
  }
  const modifier = { operation, type, stat, value };
  modifiers.push(modifier);
  console.log('Applied modifier:', modifier);
}

function applyModifiersToEntity(entity) {
  const modifiedEntity = { ...entity };
  modifiers.forEach(modifier => {
    const { operation, type, stat, value } = modifier;
    if (type === 'flat') {
      if (operation === '+') {
        modifiedEntity[stat] += value;
      } else if (operation === '-') {
        modifiedEntity[stat] -= value;
      }
    } else if (type === 'percent') {
      if (operation === '+') {
        modifiedEntity[stat] *= (1 + value / 100);
      } else if (operation === '-') {
        modifiedEntity[stat] *= (1 - value / 100);
      }
    }
  });
  return modifiedEntity;
}
