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
    
    // Import the existing calculation function from your stats calculator
    // We assume that refresh() function updates global variables that we need to capture
    
    // Create a temporary form with the entity's stats to use with your existing function
    const originalPow = document.getElementById('pow').value;
    const originalDex = document.getElementById('dex').value;
    const originalVit = document.getElementById('vit').value;
    const originalFoc = document.getElementById('foc').value;
    const originalSpr = document.getElementById('spr').value;
    
    // Set the form with this entity's values
    document.getElementById('pow').value = entity.pow;
    document.getElementById('dex').value = entity.dex;
    document.getElementById('vit').value = entity.vit;
    document.getElementById('foc').value = entity.foc;
    document.getElementById('spr').value = entity.spr;
    
    // Call your existing refresh function
    refresh();
    
    // Capture all calculated stats from your page
    const calculatedStats = captureCalculatedStats();
    
    // Reset the form to original values
    document.getElementById('pow').value = originalPow;
    document.getElementById('dex').value = originalDex;
    document.getElementById('vit').value = originalVit;
    document.getElementById('foc').value = originalFoc;
    document.getElementById('spr').value = originalSpr;
    
    // Call refresh again to restore the original form values' calculations
    refresh();
    
    // Return the entity with calculated stats
    return {
      ...entity,
      ...calculatedStats,
      // Add any additional properties needed for combat
      currentHP: calculatedStats.hp,
      maxHP: calculatedStats.hp
    };
  } catch (error) {
    console.error('Error loading entity:', error);
    return null;
  }
}

// This function captures all the calculated stats from your page
function captureCalculatedStats() {
  // This function should extract all the calculated values from your HTML
  // The exact implementation depends on how your stats page is structured
  const stats = {};
  
  // Example implementation - these should match your actual stat IDs
  const statIds = [
    'hp', 'mp', 'sta', 'eng',    // Resources
    'pdmg', 'skdmg',             // Damage stats
    'arm', 'res',                // Defense stats
    'aspd', 'cspd',              // Speed stats
    'crit', 'pen',               // Offensive stats
    'srec', 'erec'               // Recovery stats
  ];
  
  // Extract each stat value from your UI
  statIds.forEach(statId => {
    const element = document.getElementById(statId);
    if (element) {
      stats[statId] = parseFloat(element.innerText || element.textContent);
    }
  });
  
  return stats;
}

function displayEntityStats(entity, containerId) {
  const container = document.getElementById(containerId);
  
  if (!entity) {
    container.innerHTML = '<div class="stat-placeholder">Entity not found</div>';
    return;
  }
  
  // Build HTML to show the entity's stats
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
  
  // Add calculated stats (using the actual names from your calculator)
  html += `<h4>Combat Stats</h4>`;
  
  // Resources
  if (entity.hp !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">HP:</span> 
      <span class="stat-value">${entity.hp}</span>
    </div>`;
  }
  
  if (entity.mp !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">MP:</span> 
      <span class="stat-value">${entity.mp}</span>
    </div>`;
  }
  
  if (entity.sta !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Stamina:</span> 
      <span class="stat-value">${entity.sta}</span>
    </div>`;
  }
  
  if (entity.eng !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Energy:</span> 
      <span class="stat-value">${entity.eng}</span>
    </div>`;
  }
  
  // Damage stats
  if (entity.pdmg !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Physical Damage:</span> 
      <span class="stat-value">${entity.pdmg}</span>
    </div>`;
  }
  
  if (entity.skdmg !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Skill Damage:</span> 
      <span class="stat-value">${entity.skdmg}</span>
    </div>`;
  }
  
  // Defense stats
  if (entity.arm !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Armor:</span> 
      <span class="stat-value">${entity.arm}</span>
    </div>`;
  }
  
  if (entity.res !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Resistance:</span> 
      <span class="stat-value">${entity.res}</span>
    </div>`;
  }
  
  // Speed stats
  if (entity.aspd !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Attack Speed:</span> 
      <span class="stat-value">${entity.aspd}</span>
    </div>`;
  }
  
  if (entity.cspd !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Cast Speed:</span> 
      <span class="stat-value">${entity.cspd}</span>
    </div>`;
  }
  
  // Offensive stats
  if (entity.crit !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Critical Rate:</span> 
      <span class="stat-value">${entity.crit}%</span>
    </div>`;
  }
  
  if (entity.pen !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Penetration:</span> 
      <span class="stat-value">${entity.pen}</span>
    </div>`;
  }
  
  // Recovery stats
  if (entity.srec !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Stamina Recovery:</span> 
      <span class="stat-value">${entity.srec}</span>
    </div>`;
  }
  
  if (entity.erec !== undefined) {
    html += `<div class="stat-group">
      <span class="stat-name">Energy Recovery:</span> 
      <span class="stat-value">${entity.erec}</span>
    </div>`;
  }
  
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
    currentMP: entity1.mp || 0,
    currentStamina: entity1.sta || 0,
    currentEnergy: entity1.eng || 0
  };
  
  const combatant2 = {
    ...entity2,
    currentHP: entity2.hp,
    currentMP: entity2.mp || 0,
    currentStamina: entity2.sta || 0,
    currentEnergy: entity2.eng || 0
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
  
  // Determine who goes first based on attack speed (aspd)
  // Use your actual speed stat here
  const entity1First = (combatant1.aspd || 0) >= (combatant2.aspd || 0);
  
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
    
    // Recover resources after each round
    // Use your actual recovery stats (srec, erec) if they exist
    const staminaRec1 = combatant1.srec || (combatant1.sta * 0.1);
    const staminaRec2 = combatant2.srec || (combatant2.sta * 0.1);
    const energyRec1 = combatant1.erec || (combatant1.eng * 0.05);
    const energyRec2 = combatant2.erec || (combatant2.eng * 0.05);
    
    combatant1.currentStamina = Math.min(combatant1.sta || 0, (combatant1.currentStamina || 0) + staminaRec1);
    combatant2.currentStamina = Math.min(combatant2.sta || 0, (combatant2.currentStamina || 0) + staminaRec2);
    
    combatant1.currentEnergy = Math.min(combatant1.eng || 0, (combatant1.currentEnergy || 0) + energyRec1);
    combatant2.currentEnergy = Math.min(combatant2.eng || 0, (combatant2.currentEnergy || 0) + energyRec2);
    
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
  // Using your existing stats for combat calculations
  
  // Determine attack type based on available resources
  let attackType, damage, attackCost;
  let attackName, attackDescription, resourceType;
  
  // Default values in case some stats are missing
  const pdmg = attacker.pdmg || 0;
  const skdmg = attacker.skdmg || 0;
  const arm = defender.arm || 0;
  const res = defender.res || 0;
  const critRate = attacker.crit || 5;
  const pen = attacker.pen || 0;
  
  if ((attacker.currentStamina || 0) >= 10) {
    // Physical attack
    attackType = 'physical';
    attackName = 'Physical Attack';
    attackDescription = `${attacker.name} attacks ${defender.name} physically`;
    resourceType = 'Stamina';
    attackCost = 10;
    
    // Calculate physical damage using your stat formulas
    // Apply penetration if it exists
    const effectiveArmor = Math.max(0, arm - pen);
    damage = calculatePhysicalDamage(pdmg, effectiveArmor);
    
    // Reduce stamina
    attacker.currentStamina -= attackCost;
  } else if ((attacker.currentEnergy || 0) >= 15) {
    // Skill attack
    attackType = 'skill';
    attackName = 'Skill Attack';
    attackDescription = `${attacker.name} uses a skill on ${defender.name}`;
    resourceType = 'Energy';
    attackCost = 15;
    
    // Calculate skill damage using your stat formulas
    damage = calculateSkillDamage(skdmg, res);
    
    // Reduce energy
    attacker.currentEnergy -= attackCost;
  } else {
    // Weak attack when resources are depleted
    attackType = 'weak';
    attackName = 'Weak Attack';
    attackDescription = `${attacker.name} makes a weak attack against ${defender.name}`;
    resourceType = 'None';
    attackCost = 0;
    
    // Weak attack deals half damage
    damage = calculatePhysicalDamage(pdmg * 0.5, arm);
  }
  
  // Add randomness (90% - 110% of calculated damage)
  damage = damage * (0.9 + Math.random() * 0.2);
  
  // Check for critical hit using the entity's crit stat
  const critical = Math.random() * 100 < critRate;
  
  // Apply critical damage bonus
  if (critical) {
    damage *= 1.5;
  }
  
  // Add slight round bonus to escalate damage over time
  damage *= (1 + round * 0.01);
  
  // Ensure minimum damage of 1
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
  
  if (attackCost > 0) {
    desc += ` (${resourceType}: -${attackCost})`;
  }
  
  return {
    attacker: attacker.name,
    defender: defender.name,
    attackType,
    damage,
    critical,
    description: desc,
    defenderHP: defender.currentHP,
    defenderMaxHP: defender.hp,
    resourceUsed: resourceType,
    resourceCost: attackCost
  };
}

// Helper functions that use your stat formulas
function calculatePhysicalDamage(attackStat, defenseStat) {
  // This should match your formula for physical damage calculation
  // Example: Diminishing returns on defense
  const damageReduction = defenseStat / (defenseStat + 100);
  return attackStat * (1 - damageReduction);
}

function calculateSkillDamage(attackStat, defenseStat) {
  // This should match your formula for skill damage calculation
  // Example: Resistance reduces damage less effectively than armor
  const damageReduction = defenseStat / (defenseStat + 150);
  return attackStat * (1 - damageReduction);
}

function displayCombatResults(results) {
  // Display summary
  const summaryDiv = document.getElementById('resultsSummary');
  const rounds = results.rounds.length;
  
  if (results.winner) {
    summaryDiv.innerHTML = `
      <p><span class="winner">${results.winnerName}</span> defeated ${results.loserName} in ${rounds} round${rounds > 1 ? 's' : ''}!</p>
      <p>Total damage dealt: ${results.winner.name}: ${results.totalDamage[results.winner.name].toFixed(0)} | ${results.loserName}: ${results.totalDamage[results.loserName].toFixed(0)}</p>
      <p>Critical hits: ${results.winner.name}: ${results.criticalHits[results.winner.name]} | ${results.loserName}: ${results.criticalHits[results.loserName]}</p>
    `;
  } else {
    summaryDiv.innerHTML = `
      <p>The battle ended in a draw after ${rounds} rounds!</p>
      <p>Total damage dealt: ${entity1.name}: ${results.totalDamage[entity1.name].toFixed(0)} | ${entity2.name}: ${results.totalDamage[entity2.name].toFixed(0)}</p>
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
      roundHtml += `<div class="attack">
        ${action.critical ? '<span class="critical">CRITICAL! </span>' : ''}
        ${action.description}. 
        <span class="health">${action.defender} HP: ${Math.max(0, action.defenderHP).toFixed(0)}/${action.defenderMaxHP}</span>
      </div>`;
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
  
  // Determine which stats to compare based on what's available
  // These should match your actual stat names
  const availableStats = [];
  const statLabels = [];
  
  // Check which stats both entities have
  if (entity1.pdmg !== undefined && entity2.pdmg !== undefined) {
    availableStats.push('pdmg');
    statLabels.push('Physical DMG');
  }
  
  if (entity1.skdmg !== undefined && entity2.skdmg !== undefined) {
    availableStats.push('skdmg');
    statLabels.push('Skill DMG');
  }
  
  if (entity1.arm !== undefined && entity2.arm !== undefined) {
    availableStats.push('arm');
    statLabels.push('Armor');
  }
  
  if (entity1.res !== undefined && entity2.res !== undefined) {
    availableStats.push('res');
    statLabels.push('Resistance');
  }
  
  if (entity1.hp !== undefined && entity2.hp !== undefined) {
    availableStats.push('hp');
    statLabels.push('Health');
  }
  
  if (entity1.aspd !== undefined && entity2.aspd !== undefined) {
    availableStats.push('aspd');
    statLabels.push('Attack Speed');
  }
  
  if (entity1.crit !== undefined && entity2.crit !== undefined) {
    availableStats.push('crit');
    statLabels.push('Critical Rate');
  }
  
  // Normalize values for better chart visualization
  const maxValues = {};
  availableStats.forEach(stat => {
    maxValues[stat] = Math.max(entity1[stat] || 0, entity2[stat] || 0);
  });
  
  const entity1Values = availableStats.map(stat => {
    return maxValues[stat] > 0 ? ((entity1[stat] || 0) / maxValues[stat]) * 100 : 0;
  });
  
  const entity2Values = availableStats.map(stat => {
    return maxValues[stat] > 0 ? ((entity2[stat] || 0) / maxValues[stat]) * 100 : 0;
  });
  
  statComparisonChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: statLabels,
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
