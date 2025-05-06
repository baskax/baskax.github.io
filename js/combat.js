// Combat simulator for RPG Dev Tool

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  initCombatSimulator();
});

let entity1 = null;
let entity2 = null;
let combatChart = null;
let statComparisonChart = null;

async function initCombatSimulator() {
  // Set up event listeners
  document.getElementById('simulateCombat').addEventListener('click', runCombatSimulation);
  document.getElementById('entity1Select').addEventListener('change', loadEntityOne);
  document.getElementById('entity2Select').addEventListener('change', loadEntityTwo);
  
  // Load entities from database
  await loadEntitiesIntoSelects();
}

async function loadEntitiesIntoSelects() {
  try {
    // Get all entities
    const entities = await rpgDB.getAllEntities();
    
    if (!entities || entities.length === 0) {
      alert('No entities found in the database. Please create some entities in the Stat Calculator first.');
      return;
    }
    
    // Get the select elements
    const select1 = document.getElementById('entity1Select');
    const select2 = document.getElementById('entity2Select');
    
    // Clear existing options except the first one
    select1.innerHTML = '<option value="">Select Entity</option>';
    select2.innerHTML = '<option value="">Select Entity</option>';
    
    // Add entities as options
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
  
  entity1 = await loadEntityById(entityId);
  displayEntityStats(entity1, 'entity1Stats');
}

async function loadEntityTwo() {
  const entityId = document.getElementById('entity2Select').value;
  if (!entityId) {
    document.getElementById('entity2Stats').innerHTML = '<div class="stat-placeholder">Select an entity to view stats</div>';
    entity2 = null;
    return;
  }
  
  entity2 = await loadEntityById(entityId);
  displayEntityStats(entity2, 'entity2Stats');
}

async function loadEntityById(id) {
  try {
    const entity = await rpgDB.getEntityById(parseInt(id));
    
    if (!entity) {
      console.error(`Entity with ID ${id} not found.`);
      return null;
    }
    
    // Calculate derived stats
    const derivedStats = calculateCombatStats(entity);
    
    // Return the entity with derived stats
    return {
      ...entity,
      ...derivedStats
    };
  } catch (error) {
    console.error('Error loading entity:', error);
    return null;
  }
}

function calculateCombatStats(entity) {
  // Calculate all combat-related stats based on primary attributes
  const hp = Math.floor(entity.vit * 10 + entity.pow * 2);
  const mp = Math.floor(entity.foc * 5 + entity.spr * 5);
  const stamina = Math.floor(entity.vit * 3 + entity.dex * 2);
  
  const physAtk = Math.floor(entity.pow * 1.5 + entity.dex * 0.5);
  const magAtk = Math.floor(entity.foc * 1.5 + entity.spr * 0.5);
  
  const physDef = Math.floor(entity.vit * 0.8 + entity.pow * 0.2);
  const magDef = Math.floor(entity.spr * 0.8 + entity.foc * 0.2);
  
  const speed = Math.floor(entity.dex * 1.2);
  const critRate = 5 + Math.floor(entity.dex * 0.1); // Base 5% + dex bonus
  const evasion = Math.floor(entity.dex * 0.2);
  const accuracy = Math.floor(80 + entity.dex * 0.2); // Base 80% + dex bonus
  
  return {
    hp,
    mp,
    stamina,
    physAtk,
    magAtk,
    physDef,
    magDef,
    speed,
    critRate,
    evasion,
    accuracy
  };
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
    <h4>Combat Stats</h4>
    <div class="stat-group">
      <span class="stat-name">Health:</span> 
      <span class="stat-value">${entity.hp}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Mana:</span> 
      <span class="stat-value">${entity.mp}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Stamina:</span> 
      <span class="stat-value">${entity.stamina}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Physical Attack:</span> 
      <span class="stat-value">${entity.physAtk}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Magical Attack:</span> 
      <span class="stat-value">${entity.magAtk}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Physical Defense:</span> 
      <span class="stat-value">${entity.physDef}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Magical Defense:</span> 
      <span class="stat-value">${entity.magDef}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Speed:</span> 
      <span class="stat-value">${entity.speed}</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Critical Rate:</span> 
      <span class="stat-value">${entity.critRate}%</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Evasion:</span> 
      <span class="stat-value">${entity.evasion}%</span>
    </div>
    <div class="stat-group">
      <span class="stat-name">Accuracy:</span> 
      <span class="stat-value">${entity.accuracy}%</span>
    </div>
  `;
  
  container.innerHTML = html;
}

function runCombatSimulation() {
  if (!entity1 || !entity2) {
    alert('Please select two entities for combat.');
    return;
  }
  
  const numRounds = parseInt(document.getElementById('numRounds').value) || 10;
  
  // Run the simulation
  const results = simulateCombat(entity1, entity2, numRounds);
  
  // Display the results
  displayCombatResults(results);
  
  // Show the results section
  document.getElementById('combatResults').classList.add('visible');
  
  // Scroll to results
  document.getElementById('combatResults').scrollIntoView({ behavior: 'smooth' });
}

function simulateCombat(entity1, entity2, maxRounds) {
  // Create copies of entities to avoid modifying the originals
  const combatant1 = {
    ...entity1,
    currentHP: entity1.hp,
    currentMP: entity1.mp,
    currentStamina: entity1.stamina
  };
  
  const combatant2 = {
    ...entity2,
    currentHP: entity2.hp,
    currentMP: entity2.mp,
    currentStamina: entity2.stamina
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
  
  // Determine who goes first based on speed
  const entity1First = combatant1.speed >= combatant2.speed;
  
  // Combat rounds
  for (let round = 1; round <= maxRounds; round++) {
    const roundResult = {
      round,
      actions: []
    };
    
    // First entity's turn
    const firstAttacker = entity1First ? combatant1 : combatant2;
    const firstDefender = entity1First ? combatant2 : combatant1;
    
    const firstAttack = performAttack(firstAttacker, firstDefender, round);
    roundResult.actions.push(firstAttack);
    
    // Track damage and crits
    results.totalDamage[firstAttacker.name] += firstAttack.damage;
    if (firstAttack.critical) {
      results.criticalHits[firstAttacker.name]++;
    }
    
    // Check if defender is defeated
    if (firstDefender.currentHP <= 0) {
      results.winner = firstAttacker;
      results.winnerName = firstAttacker.name;
      results.loserName = firstDefender.name;
      results.rounds.push(roundResult);
      results.hpHistory[entity1.name].push(combatant1.currentHP);
      results.hpHistory[entity2.name].push(combatant2.currentHP);
      break;
    }
    
    // Second entity's turn
    const secondAttack = performAttack(firstDefender, firstAttacker, round);
    roundResult.actions.push(secondAttack);
    
    // Track damage and crits
    results.totalDamage[firstDefender.name] += secondAttack.damage;
    if (secondAttack.critical) {
      results.criticalHits[firstDefender.name]++;
    }
    
    // Check if defender is defeated
    if (firstAttacker.currentHP <= 0) {
      results.winner = firstDefender;
      results.winnerName = firstDefender.name;
      results.loserName = firstAttacker.name;
      results.rounds.push(roundResult);
      results.hpHistory[entity1.name].push(combatant1.currentHP);
      results.hpHistory[entity2.name].push(combatant2.currentHP);
      break;
    }
    
    // Recover some stamina each round
    combatant1.currentStamina = Math.min(combatant1.stamina, combatant1.currentStamina + 5);
    combatant2.currentStamina = Math.min(combatant2.stamina, combatant2.currentStamina + 5);
    
    // Recover some MP each round
    combatant1.currentMP = Math.min(combatant1.mp, combatant1.currentMP + 3);
    combatant2.currentMP = Math.min(combatant2.mp, combatant2.currentMP + 3);
    
    // Add round result to results
    results.rounds.push(roundResult);
    
    // Track HP history for the chart
    results.hpHistory[entity1.name].push(combatant1.currentHP);
    results.hpHistory[entity2.name].push(combatant2.currentHP);
  }
  
  // If we reached max rounds with no winner, determine by HP percentage
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
      // It's a tie, determine by total damage dealt
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
  // Determine attack type (physical or magical)
  // For simplicity, we'll use physical attacks if stamina is sufficient
  // and magical attacks otherwise
  
  let attackType, attackStat, defenseStat, attackCost;
  let attackDescription, attackName;
  
  if (attacker.currentStamina >= 10) {
    attackType = 'physical';
    attackStat = attacker.physAtk;
    defenseStat = defender.physDef;
    attackCost = 10; // Stamina cost
    attackName = 'Physical Attack';
    attackDescription = `${attacker.name} attacks ${defender.name} physically`;
  } else if (attacker.currentMP >= 15) {
    attackType = 'magical';
    attackStat = attacker.magAtk;
    defenseStat = defender.magDef;
    attackCost = 15; // MP cost
    attackName = 'Magical Attack';
    attackDescription = `${attacker.name} casts a spell on ${defender.name}`;
  } else {
    // Weak attack when both resources are depleted
    attackType = 'weak';
    attackStat = Math.max(attacker.physAtk, attacker.magAtk) * 0.5;
    defenseStat = Math.max(defender.physDef, defender.magDef);
    attackCost = 0;
    attackName = 'Weak Attack';
    attackDescription = `${attacker.name} makes a weak attack against ${defender.name}`;
  }
  
  // Reduce resources
  if (attackType === 'physical') {
    attacker.currentStamina -= attackCost;
  } else if (attackType === 'magical') {
    attacker.currentMP -= attackCost;
  }
  
  // Calculate hit chance
  const hitChance = attacker.accuracy - defender.evasion;
  const hit = Math.random() * 100 < hitChance;
  
  if (!hit) {
    return {
      attacker: attacker.name,
      defender: defender.name,
      attackType,
      damage: 0,
      hit: false,
      critical: false,
      description: `${attacker.name}'s ${attackName} missed!`,
      defenderHP: defender.currentHP,
      defenderMaxHP: defender.hp
    };
  }
  
  // Check for critical hit
  const critical = Math.random() * 100 < attacker.critRate;
  
  // Calculate base damage
  let damage = attackStat - (defenseStat * 0.5);
  
  // Add randomness (90% - 110% of base damage)
  damage = damage * (0.9 + Math.random() * 0.2);
  
  // Apply critical multiplier
  if (critical) {
    damage *= 1.5;
  }
  
  // Add slight round bonus to escalate damage over time (prevents stalemates)
  damage *= (1 + round * 0.01);
  
  // Ensure minimum damage
  damage = Math.max(1, Math.floor(damage));
  
  // Apply damage
  defender.currentHP -= damage;
  defender.currentHP = Math.max(0, defender.currentHP);
  
  // Generate description
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
    hit: true,
    critical,
    description: desc,
    defenderHP: defender.currentHP,
    defenderMaxHP: defender.hp
  };
}

function displayCombatResults(results) {
  // Display summary
  const summaryDiv = document.getElementById('resultsSummary');
  const rounds = results.rounds.length;
  
  if (results.winner) {
    summaryDiv.innerHTML = `
      <p><span class="winner">${results.winnerName}</span> defeated ${results.loserName} in ${rounds} round${rounds > 1 ? 's' : ''}!</p>
      <p>Total damage dealt: ${results.winner.name}: ${results.totalDamage[results.winner.name]} | ${results.loserName}: ${results.totalDamage[results.loserName]}</p>
      <p>Critical hits: ${results.winner.name}: ${results.criticalHits[results.winner.name]} | ${results.loserName}: ${results.criticalHits[results.loserName]}</p>
    `;
  } else {
    summaryDiv.innerHTML = `
      <p>The battle ended in a draw after ${rounds} rounds!</p>
      <p>Total damage dealt: ${entity1.name}: ${results.totalDamage[entity1.name]} | ${entity2.name}: ${results.totalDamage[entity2.name]}</p>
      <p>Critical hits: ${entity1.name}: ${results.criticalHits[entity1.name]} | ${entity2.name}: ${results.criticalHits[entity2.name]}</p>
    `;
  }
  
  // Display combat log
  const logDiv = document.getElementById('combatLog');
  logDiv.innerHTML = '';
  
  results.rounds.forEach(round => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round-entry';
    
    let roundHtml = `<div class="round-title">Round ${round.round}</div>`;
    
    round.actions.forEach(action => {
      if (action.hit) {
        roundHtml += `<div class="attack">
          ${action.critical ? '<span class="critical">CRITICAL! </span>' : ''}
          ${action.attacker} used ${action.attackType} attack and dealt 
          <span class="damage">${action.damage}</span> damage to ${action.defender}. 
          <span class="health">${action.defender} HP: ${action.defenderHP}/${action.defenderMaxHP}</span>
        </div>`;
      } else {
        roundHtml += `<div class="attack">
          ${action.attacker}'s attack missed!
        </div>`;
      }
    });
    
    roundDiv.innerHTML = roundHtml;
    logDiv.appendChild(roundDiv);
  });
  
  // Display HP over time chart
  displayHPChart(results);
  
  // Display stat comparison chart
  displayStatComparison();
}

function displayHPChart(results) {
  const ctx = document.getElementById('combatChart').getContext('2d');
  
  // Destroy previous chart if it exists
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
          color: '#f9fafb'
        },
        legend: {
          labels: {
            color: '#f9fafb'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#f9fafb'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#f9fafb'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

function displayStatComparison() {
  const ctx = document.getElementById('statComparisonChart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (statComparisonChart) {
    statComparisonChart.destroy();
  }
  
  // Prepare data for radar chart
  const stats = [
    'physAtk',
    'magAtk',
    'physDef',
    'magDef',
    'speed',
    'hp',
    'mp'
  ];
  
  const statNames = [
    'Phys Attack',
    'Mag Attack',
    'Phys Defense',
    'Mag Defense',
    'Speed',
    'Health',
    'Mana'
  ];
  
  // Normalize values for better chart visualization
  const maxValues = {};
  stats.forEach(stat => {
    maxValues[stat] = Math.max(entity1[stat], entity2[stat]);
  });
  
  const entity1Values = stats.map(stat => (entity1[stat] / maxValues[stat]) * 100);
  const entity2Values = stats.map(stat => (entity2[stat] / maxValues[stat]) * 100);
  
  statComparisonChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: statNames,
      datasets: [
        {
          label: entity1.name,
          data: entity1Values,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        },
        {
          label: entity2.name,
          data: entity2Values,
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
          color: '#f9fafb'
        },
        legend: {
          labels: {
            color: '#f9fafb'
          }
        }
      },
      scales: {
        r: {
          angleLines: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          pointLabels: {
            color: '#f9fafb'
          },
          ticks: {
            backdropColor: 'transparent',
            color: '#f9fafb'
          }
        }
      }
    }
  });
}
