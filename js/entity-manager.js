document.addEventListener('DOMContentLoaded', function() {
  initEntityManager();
  addDebugButton();
});

async function initEntityManager() {
  document.getElementById('saveEntityBtn').addEventListener('click', saveCurrentEntity);
  document.getElementById('newEntityBtn').addEventListener('click', clearEntityForm);
  document.getElementById('deleteEntityBtn').addEventListener('click', deleteCurrentEntity);
  document.getElementById('entityList').addEventListener('change', loadSelectedEntity);
  await refreshEntityList();
}

function addDebugButton() {
  const debugBtn = document.createElement('button');
  debugBtn.textContent = 'Debug: List Entities';
  debugBtn.style.marginLeft = '10px';
  debugBtn.addEventListener('click', async () => {
    const count = await rpgDB.debugListEntities();
    alert(`Found ${count} entities in database. Check console for details.`);
  });
  const actionsDiv = document.querySelector('.entity-actions');
  if (actionsDiv) {
    actionsDiv.appendChild(debugBtn);
  }
}

async function saveCurrentEntity() {
  const entityId = document.getElementById('entityId').value;
  const name = document.getElementById('entityName').value;
  const type = document.getElementById('entityType').value;
  const pow = parseInt(document.getElementById('pow').value) || 50;
  const dex = parseInt(document.getElementById('dex').value) || 50;
  const vit = parseInt(document.getElementById('vit').value) || 50;
  const foc = parseInt(document.getElementById('foc').value) || 50;
  const spr = parseInt(document.getElementById('spr').value) || 50;

  if (!name) {
    alert('Please enter a name for this entity.');
    return;
  }

  const entity = {
    name,
    type,
    pow,
    dex,
    vit,
    foc,
    spr,
    lastModified: new Date().toISOString()
  };

  const statsList = ['HP', 'STA', 'ENG', 'PDMG', 'SKDMG', 'ASPD', 'CRIT', 'ARM', 'RES', 'CDR', 'MSPD'];
  const secTable = document.getElementById('secBody');
  if (secTable) {
    const rows = secTable.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      if (cells.length >= 2) {
        const statName = cells[0].textContent.trim();
        const statValue = parseFloat(cells[1].textContent);
        const statKey = statsList.find(s => s === statName);
        if (statKey) {
          entity[statKey.toLowerCase()] = statValue;
        }
      }
    }
  }

  if (entityId) {
    entity.id = parseInt(entityId);
  }

  try {
    const id = await rpgDB.saveEntity(entity);
    if (!entityId) {
      document.getElementById('entityId').value = id;
    }
    await refreshEntityList();
    selectEntityInList(id);
    alert(`Entity "${name}" saved successfully!`);
  } catch (error) {
    console.error('Error saving entity:', error);
    alert('Failed to save entity. See console for details.');
  }
}

async function refreshEntityList() {
  try {
    const entities = await rpgDB.getAllEntities();
    const select = document.getElementById('entityList');
    select.innerHTML = '';
    if (entities.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No entities saved yet';
      option.disabled = true;
      select.appendChild(option);
    } else {
      entities.forEach(entity => {
        const option = document.createElement('option');
        option.value = entity.id;
        option.textContent = `${entity.name} (${entity.type})`;
        option.dataset.entityType = entity.type;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error refreshing entity list:', error);
  }
}

function selectEntityInList(entityId) {
  const select = document.getElementById('entityList');
  const options = select.options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value == entityId) {
      options[i].selected = true;
      break;
    }
  }
}

async function loadSelectedEntity() {
  const select = document.getElementById('entityList');
  const entityId = select.value;
  if (!entityId) return;
  try {
    const entity = await rpgDB.getEntityById(parseInt(entityId));
    if (!entity) {
      return;
    }
    document.getElementById('entityId').value = entity.id;
    document.getElementById('entityName').value = entity.name;
    document.getElementById('entityType').value = entity.type;
    document.getElementById('pow').value = entity.pow;
    document.getElementById('dex').value = entity.dex;
    document.getElementById('vit').value = entity.vit;
    document.getElementById('foc').value = entity.foc;
    document.getElementById('spr').value = entity.spr;
    refresh();
  } catch (error) {
    console.error('Error loading entity:', error);
  }
}

function clearEntityForm() {
  document.getElementById('entityId').value = '';
  document.getElementById('entityName').value = '';
  document.getElementById('entityType').value = 'player';
  document.getElementById('pow').value = '50';
  document.getElementById('dex').value = '50';
  document.getElementById('vit').value = '50';
  document.getElementById('foc').value = '50';
  document.getElementById('spr').value = '50';
  refresh();
  document.getElementById('entityList').selectedIndex = -1;
}

async function deleteCurrentEntity() {
  const entityId = document.getElementById('entityId').value;
  if (!entityId) {
    alert('No entity selected to delete.');
    return;
  }
  const entityName = document.getElementById('entityName').value;
  if (confirm(`Are you sure you want to delete "${entityName}"? This cannot be undone.`)) {
    try {
      await rpgDB.deleteEntity(parseInt(entityId));
      await refreshEntityList();
      clearEntityForm();
      alert(`Entity "${entityName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting entity:', error);
      alert('Failed to delete entity. See console for details.');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initEntityManager,
    saveCurrentEntity,
    refreshEntityList,
    loadSelectedEntity,
    clearEntityForm,
    deleteCurrentEntity
  };
}
