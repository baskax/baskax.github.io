import { calcStat } from './primary-attributes.js';
import { createOrUpdateChart } from './config-table.js';

function refresh() {
  const POW = +document.getElementById('pow').value;
  const DEX = +document.getElementById('dex').value;
  const VIT = +document.getElementById('vit').value;
  const FOC = +document.getElementById('foc').value;
  const SPR = +document.getElementById('spr').value;

  const tbody = document.getElementById('secBody');
  tbody.innerHTML = '';
  const list = ['HP','STA','ENG','PDMG','SKDMG','ASPD','CRIT','ARM','RES','CDR','MSPD'];

  list.forEach(name => {
    let p1=0,p2=0;
    switch(name) {
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
    const val = calcStat(name, p1, p2);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="stat-label">
        ${name}
        <div class="tooltip">
          <h4>${getFullName(name)}</h4>
          <p>${getDescription(name)}</p>
        </div>
      </td>
      <td>${val.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);

    createOrUpdateChart(name, [p1, p2], val);
  });

  updateFormulas();
}

function getFullName(statAbbr) {
  const fullNames = {
    'POW': 'Power',
    'DEX': 'Dexterity',
    'VIT': 'Vitality',
    'FOC': 'Focus',
    'SPR': 'Spirit',
    'HP': 'Health Points',
    'STA': 'Stamina',
    'ENG': 'Energy',
    'PDMG': 'Physical Damage',
    'SKDMG': 'Skill Damage',
    'ASPD': 'Attack Speed',
    'CRIT': 'Critical Chance %',
    'ARM': 'Armor',
    'RES': 'Resistance',
    'CDR': 'Cooldown Reduction',
    'MSPD': 'Move Speed %'
  };
  return fullNames[statAbbr] || statAbbr;
}

function getDescription(statAbbr) {
  const descriptions = {
    'POW': 'Base physical strength – directly feeds your basic melee damage.',
    'DEX': 'Agility and precision – ups your attack-speed, evasion, and crit.',
    'VIT': 'Raw sturdiness – determines your health pool (HP) and stamina (STA).',
    'FOC': 'Mental acuity – boosts skill damage, critical chance, and cooldown reduction.',
    'SPR': 'Inner energy – fuels your energy/mana pool (ENG) and resistances.',
    'HP': 'How much damage you can take before dying.',
    'STA': 'Resource for dodges/sprints—how often you can evade or sprint.',
    'ENG': 'Pool for skills/spells—how many abilities you can cast.',
    'PDMG': 'Damage dealt by your standard melee or ranged attacks.',
    'SKDMG': 'Damage dealt by your special abilities or spells.',
    'ASPD': 'Multiplier on your attack animation/swing speed (1.00 = baseline).',
    'CRIT': 'Chance for any attack or skill to hit for bonus (critical) damage.',
    'ARM': 'Flat physical damage mitigation.',
    'RES': 'Flat elemental/status resistance (fire, poison, stun-chance, etc.).',
    'CDR': 'Percent reduction on all skill cooldown timers.',
    'MSPD': 'Percent bonus (or penalty) to your base movement speed.'
  };
  return descriptions[statAbbr] || '';
}

refresh();

export { refresh, getFullName, getDescription };
