// Storage utility for UW Street Smart PWA
const STORAGE_KEYS = {
  CAMPAIGNS: 'uw_streetsmart_campaigns',
  DARK_MODE: 'uw_streetsmart_dark',
  PARTNER_NAME: 'partner_name',
  PARTNER_SCRIPTS: 'partner_scripts',
  PARTNER_SCRIPT_ORDER: 'partner_script_order',
  PARTNER_DOCUMENTS: 'partner_documents',
  GOOGLE_PLACES_API_KEY: 'google_places_api_key'
};

/**
 * Load data from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} fallback - Default value if no data found
 * @returns {*} Parsed data or fallback
 */
export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
    return fallback;
  }
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to save
 * @returns {boolean} Success status
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
    return false;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove ${key} from storage:`, error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 * @returns {boolean} Success status
 */
export function clearAllAppData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear app data:', error);
    return false;
  }
}

/**
 * Get storage usage information
 * @returns {Object} Storage usage stats
 */
export function getStorageInfo() {
  try {
    const total = Object.values(STORAGE_KEYS).reduce((acc, key) => {
      const data = localStorage.getItem(key);
      return acc + (data ? new Blob([data]).size : 0);
    }, 0);
    
    return {
      totalBytes: total,
      totalKB: Math.round(total / 1024 * 100) / 100,
      keys: Object.values(STORAGE_KEYS).filter(key => localStorage.getItem(key))
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { totalBytes: 0, totalKB: 0, keys: [] };
  }
}

export { STORAGE_KEYS };
