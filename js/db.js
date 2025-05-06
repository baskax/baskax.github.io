// db.js - Database operations for the RPG Stat Calculator - FIXED VERSION

// Initialize the database
const dbPromise = initDatabase();

async function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RpgStatCalculator', 1);
    
    request.onerror = (event) => {
      console.error('Database error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log('Database opened successfully');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create an entity store for characters, enemies, etc.
      if (!db.objectStoreNames.contains('entities')) {
        const entityStore = db.createObjectStore('entities', { keyPath: 'id', autoIncrement: true });
        entityStore.createIndex('name', 'name', { unique: false });
        entityStore.createIndex('type', 'type', { unique: false });
        entityStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      // Create a store for modifiers
      if (!db.objectStoreNames.contains('modifiers')) {
        const modifierStore = db.createObjectStore('modifiers', { keyPath: 'id', autoIncrement: true });
        modifierStore.createIndex('entityId', 'entityId', { unique: false });
        modifierStore.createIndex('name', 'name', { unique: false });
      }
    };
  });
}

// Add a new entity to the database
async function saveEntity(entity) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entities'], 'readwrite');
    const store = transaction.objectStore('entities');
    
    // Add timestamp if new, or keep existing for updates
    if (!entity.createdAt) {
      entity.createdAt = new Date().toISOString();
    }
    
    let request;
    if (entity.id) {
      // For existing entities, use put
      request = store.put(entity);
    } else {
      // For new entities, use add
      request = store.add(entity);
    }
    
    request.onsuccess = (event) => {
      // For new entities, return the generated ID
      const id = entity.id || event.target.result;
      console.log(`Entity saved with ID: ${id}`);
      resolve(id);
    };
    
    request.onerror = (event) => {
      console.error('Error saving entity:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get all entities
async function getAllEntities() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entities'], 'readonly');
    const store = transaction.objectStore('entities');
    const request = store.getAll();
    
    request.onsuccess = () => {
      console.log(`Retrieved ${request.result.length} entities`);
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error('Error retrieving entities:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get entities by type (player, enemy, etc.)
async function getEntitiesByType(type) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entities'], 'readonly');
    const store = transaction.objectStore('entities');
    const index = store.index('type');
    const request = index.getAll(type);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error('Error retrieving entities by type:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get a specific entity by ID
async function getEntityById(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entities'], 'readonly');
    const store = transaction.objectStore('entities');
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error('Error retrieving entity:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Delete an entity by ID
async function deleteEntity(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entities'], 'readwrite');
    const store = transaction.objectStore('entities');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      console.log(`Entity with ID ${id} deleted`);
      resolve(true);
    };
    
    request.onerror = (event) => {
      console.error('Error deleting entity:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Save a modifier for an entity
async function saveModifier(modifier) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['modifiers'], 'readwrite');
    const store = transaction.objectStore('modifiers');
    
    const request = modifier.id ? store.put(modifier) : store.add(modifier);
    
    request.onsuccess = (event) => {
      resolve(modifier.id || event.target.result);
    };
    
    request.onerror = (event) => {
      console.error('Error saving modifier:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get modifiers for an entity
async function getModifiersForEntity(entityId) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['modifiers'], 'readonly');
    const store = transaction.objectStore('modifiers');
    const index = store.index('entityId');
    const request = index.getAll(entityId);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      console.error('Error retrieving modifiers:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Delete a modifier by ID
async function deleteModifier(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['modifiers'], 'readwrite');
    const store = transaction.objectStore('modifiers');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onerror = (event) => {
      console.error('Error deleting modifier:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Clear all data (for debugging or reset)
async function clearAllData() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['entities', 'modifiers'], 'readwrite');
    
    const entityStore = transaction.objectStore('entities');
    const modifierStore = transaction.objectStore('modifiers');
    
    const entityClearRequest = entityStore.clear();
    const modifierClearRequest = modifierStore.clear();
    
    entityClearRequest.onsuccess = () => {
      console.log('Entities cleared');
    };
    
    modifierClearRequest.onsuccess = () => {
      console.log('Modifiers cleared');
    };
    
    transaction.oncomplete = () => {
      console.log('All data cleared successfully');
      resolve(true);
    };
    
    transaction.onerror = (event) => {
      console.error('Error clearing data:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Debug function to list all entities with details
async function debugListEntities() {
  try {
    const entities = await getAllEntities();
    console.log(`=== Entities in DB (${entities.length}) ===`);
    entities.forEach(e => {
      console.log(`ID: ${e.id}, Name: ${e.name}, Type: ${e.type}`);
    });
    return entities.length;
  } catch (err) {
    console.error('Debug listing failed:', err);
    return -1;
  }
}

// Export to window or as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveEntity,
    getAllEntities,
    getEntitiesByType,
    getEntityById,
    deleteEntity,
    saveModifier,
    getModifiersForEntity,
    deleteModifier,
    clearAllData,
    debugListEntities
  };
} else {
  window.rpgDB = {
    saveEntity,
    getAllEntities,
    getEntitiesByType,
    getEntityById,
    deleteEntity,
    saveModifier,
    getModifiersForEntity,
    deleteModifier,
    clearAllData,
    debugListEntities
  };
}
