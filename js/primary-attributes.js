function calcStat(name, p1, p2) {
  const w1   = +document.getElementById(name + '_w1').value;
  const w2   = +document.getElementById(name + '_w2').value;
  const pre  = +document.getElementById(name + '_pre').value;
  const exp  = +document.getElementById(name + '_exp').value;
  const mult = +document.getElementById(name + '_mult').value;
  const post = +document.getElementById(name + '_post').value;
  const base = p1 * w1 + p2 * w2 + pre;
  return Math.pow(base, exp) * mult + post;
}

function updateFormulas() {
  const list = ['HP','STA','ENG','PDMG','SKDMG','ASPD','CRIT','ARM','RES','CDR','MSPD'];
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

  list.forEach(name => {
    const w1   = +document.getElementById(name + '_w1').value;
    const w2   = +document.getElementById(name + '_w2').value;
    const pre  = +document.getElementById(name + '_pre').value;
    const exp  = +document.getElementById(name + '_exp').value;
    const mult = +document.getElementById(name + '_mult').value;
    const post = +document.getElementById(name + '_post').value;

    let formula = `${name} = `;
    formula += `((${w1} × ${statNames[name][0]}`;
    
    if (w2 !== 0) {
      formula += ` + ${w2} × ${statNames[name][1]}`;
    }
    
    if (pre !== 0) {
      formula += ` + ${pre}`;
    }
    
    formula += `)^${exp} × ${mult}`;
    
    if (post !== 0) {
      formula += ` + ${post}`;
    }
    
    formula += `)`;
    
    document.getElementById(name + '_formula').textContent = formula;
  });
}

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
  });

  updateFormulas();
}

export { calcStat, updateFormulas, refresh };
