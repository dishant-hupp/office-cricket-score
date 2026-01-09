/**
 * localStorage utilities for match state persistence
 */

const MATCH_CONFIG_KEY = 'cricket_match_config'; // Teams, names, config
const INNINGS_STATE_KEY = 'cricket_match_state'; // Innings data

/**
 * Match Configuration Storage (Master Data)
 */

/**
 * Saves match configuration to localStorage
 * @param {Object} matchConfig
 */
export function saveMatchConfig(matchConfig) {
  try {
    const serialized = JSON.stringify(matchConfig);
    localStorage.setItem(MATCH_CONFIG_KEY, serialized);
  } catch (error) {
    console.error('Failed to save match config:', error);
    throw new Error('Failed to save match config to localStorage');
  }
}

/**
 * Loads match configuration from localStorage
 * @returns {Object|null} Match config or null if not found
 */
export function loadMatchConfig() {
  try {
    const serialized = localStorage.getItem(MATCH_CONFIG_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load match config:', error);
    return null;
  }
}

/**
 * Clears match configuration from localStorage
 */
export function clearMatchConfig() {
  try {
    localStorage.removeItem(MATCH_CONFIG_KEY);
  } catch (error) {
    console.error('Failed to clear match config:', error);
  }
}

/**
 * Innings State Storage
 */

/**
 * Saves innings state to localStorage
 * @param {Object} inningsState
 */
export function saveInningsState(inningsState) {
  try {
    const serialized = JSON.stringify(inningsState);
    localStorage.setItem(INNINGS_STATE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save innings state:', error);
    throw new Error('Failed to save innings state to localStorage');
  }
}

/**
 * Loads innings state from localStorage
 * @returns {Object|null} Innings state or null if not found
 */
export function loadInningsState() {
  try {
    const serialized = localStorage.getItem(INNINGS_STATE_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load innings state:', error);
    return null;
  }
}

/**
 * Clears innings state from localStorage
 */
export function clearInningsState() {
  try {
    localStorage.removeItem(INNINGS_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear innings state:', error);
  }
}

/**
 * Legacy support - for backward compatibility
 */

/**
 * Saves match state to localStorage (legacy - combines config and innings)
 * @param {Object} matchState
 */
export function saveMatchState(matchState) {
  // Split into config and innings
  const { teams, config, toss, matchId } = matchState;
  const matchConfig = { teams, config, toss, matchId };
  const inningsState = {
    innings: matchState.innings || [],
    currentInningsIndex: matchState.currentInningsIndex || -1
  };
  
  saveMatchConfig(matchConfig);
  saveInningsState(inningsState);
}

/**
 * Loads match state from localStorage (legacy - combines config and innings)
 * @returns {Object|null} Match state or null if not found
 */
export function loadMatchState() {
  const matchConfig = loadMatchConfig();
  const inningsState = loadInningsState();
  
  if (!matchConfig && !inningsState) {
    return null;
  }
  
  return {
    ...matchConfig,
    ...inningsState
  };
}

/**
 * Clears all match data from localStorage
 */
export function clearMatchState() {
  clearMatchConfig();
  clearInningsState();
}

/**
 * Checks if match state exists in localStorage
 * @returns {boolean}
 */
export function hasMatchState() {
  return localStorage.getItem(MATCH_CONFIG_KEY) !== null || 
         localStorage.getItem(INNINGS_STATE_KEY) !== null;
}
