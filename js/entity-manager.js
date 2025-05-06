// entity-manager.js - Handle saving and loading entities - FIXED VERSION

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize entity manager
  initEntityManager();
  
  // Add debug button (temporary, can be removed later)
  addDebugButton();
});

async function initEntityManager() {
  // Set up event listeners
  document.getElementById('saveEntityBtn').addEventListener('click', saveCurrentEntity);
  document.getElementById('newEntityBtn').addEventListener('click', clearEntityForm);
  document.getElementById('deleteEntityBtn').addEventListener('click', deleteCurrentEntity);
  document.getElementById('entityList').addEventListener('change', loadSelectedEntity);
  
  // Load saved entities
  await refreshEntityList();
}

function addDebugButton() {
  // Add a debug button to list entities in console
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
  // Get values from the form
  const entityId = document.getElementById('entityId').value;
  const name = document.getElementById('entityName').value;
  const type = document.getElementById('entityType').value;
  
  // Get primary stat values
  const pow = parseInt(document.getElementById('pow').value) || 50;
  const dex = parseInt(document.getElementById('dex').value) || 50;
  const vit = parseInt(document.getElementById('vit').value) || 50;
  const foc = parseInt(document.getElementById('foc').value) || 50;
  const spr = parseInt(document.getElementById('spr').value) || 50;
  
  // Validation
  if (!name) {
    alert('Please enter a name for this entity.');
    return;
  }
  
  console.log(`Saving entity: ${name} (${type}), ID: ${entityId || 'new'}`);
  
  // Create entity object
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
  
  // If editing an existing entity, add the ID
  if (entityId) {
    entity.id = parseInt(entityId);
    console.log(`Updating existing entity with ID: ${entity.id}`);
  } else {
    console.log('Creating new entity');
  }
  
  try {
    // Save to database
    const id = await rpgDB.saveEntity(entity);
    console.log(`Entity saved with ID: ${id}`);
    
    // Update the form with the new ID if it was a new entity
    if (!entityId) {
      document.getElementById('entityId').value = id;
      console.log(`Form updated with new ID: ${id}`);
    }
    
    // Update the entity list
    await refreshEntityList();
    
    // Select the newly created/updated entity
    selectEntityInList(id);
    
    alert(`Entity "${name}" saved successfully!`);
  } catch (error) {
    console.error('Error saving entity:', error);
    alert('Failed to save entity. See console for details.');
  }
}

async function refreshEntityList() {
  try {
    // Get all entities
    const entities = await rpgDB.getAllEntities();
    console.log(`Refreshing entity list with ${entities.length} entities`);
    
    // Get the select element
    const select = document.getElementById('entityList');
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add entities as options
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
        console.log(`Added option for entity: ${entity.name}, ID: ${entity.id}`);
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
      console.log(`Selected entity with ID: ${entityId} in list`);
      break;
    }
  }
}

async function loadSelectedEntity() {
  const select = document.getElementById('entityList');
  const entityId = select.value;
  
  if (!entityId) return;
  
  console.log(`Loading entity with ID: ${entityId}`);
  
  try {
    // Get entity from database
    const entity = await rpgDB.getEntityById(parseInt(entityId));
    
    if (!entity) {
      console.error(`Entity with ID ${entityId} not found.`);
      return;
    }
    
    console.log(`Loaded entity: ${entity.name}, type: ${entity.type}`);
    
    // Fill the form with entity data
    document.getElementById('entityId').value = entity.id;
    document.getElementById('entityName').value = entity.name;
    document.getElementById('entityType').value = entity.type;
    
    // Update primary stats
    document.getElementById('pow').value = entity.pow;
    document.getElementById('dex').value = entity.dex;
    document.getElementById('vit').value = entity.vit;
    document.getElementById('foc').value = entity.foc;
    document.getElementById('spr').value = entity.spr;
    
    // Trigger stat recalculation
    refresh(); // This calls your existing refresh function
  } catch (error) {
    console.error('Error loading entity:', error);
  }
}

function clearEntityForm() {
  console.log('Clearing entity form');
  
  // Clear form fields
  document.getElementById('entityId').value = '';
  document.getElementById('entityName').value = '';
  document.getElementById('entityType').value = 'player';
  
  // Reset primary stats to defaults
  document.getElementById('pow').value = '50';
  document.getElementById('dex').value = '50';
  document.getElementById('vit').value = '50';
  document.getElementById('foc').value = '50';
  document.getElementById('spr').value = '50';
  
  // Trigger stat recalculation
  refresh();
  
  // Deselect any entity in the list
  document.getElementById('entityList').selectedIndex = -1;
}

async function deleteCurrentEntity() {
  const entityId = document.getElementById('entityId').value;
  
  if (!entityId) {
    alert('No entity selected to delete.');
    return;
  }
  
  const entityName = document.getElementById('entityName').value;
  
  console.log(`Attempting to delete entity: ${entityName}, ID: ${entityId}`);
  
  if (confirm(`Are you sure you want to delete "${entityName}"? This cannot be undone.`)) {
    try {
      await rpgDB.deleteEntity(parseInt(entityId));
      console.log(`Entity with ID ${entityId} deleted`);
      
      await refreshEntityList();
      clearEntityForm();
      alert(`Entity "${entityName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting entity:', error);
      alert('Failed to delete entity. See console for details.');
    }
  }
}

// Export as module if needed
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
