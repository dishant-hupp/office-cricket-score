/**
 * Validation functions for match rules
 */

/**
 * Validates run value (0-6 only)
 * @param {number} runs
 * @returns {boolean}
 */
export function isValidRun(runs) {
  return [0, 1, 2, 3, 4, 6].includes(runs);
}

/**
 * Validates wicket type
 * @param {string} type
 * @returns {boolean}
 */
export function isValidWicketType(type) {
  const validTypes = ['bowled', 'caught', 'runOut', 'lbw', 'stumped', 'hitWicket', 'retiredHurt'];
  return validTypes.includes(type);
}

/**
 * Validates that a wicket can be taken on this delivery
 * @param {boolean} isFreeHit - Whether this is a free hit
 * @param {string} wicketType - Type of wicket
 * @returns {boolean}
 */
export function canTakeWicket(isFreeHit, wicketType) {
  // On free hit, only run out is allowed
  if (isFreeHit) {
    return wicketType === 'runOut';
  }
  return true;
}

/**
 * Validates that match setup is complete
 * @param {Object} matchState
 * @returns {{valid: boolean, error?: string}}
 */
export function validateMatchSetup(matchState) {
  if (!matchState.config.totalOvers || matchState.config.totalOvers < 1) {
    return { valid: false, error: 'Total overs must be at least 1' };
  }

  if (matchState.teams.teamA.players.length === 0) {
    return { valid: false, error: 'Team A must have at least one player' };
  }

  if (matchState.teams.teamB.players.length === 0) {
    return { valid: false, error: 'Team B must have at least one player' };
  }

  return { valid: true };
}

/**
 * Validates that toss is complete
 * @param {Object} matchState
 * @returns {{valid: boolean, error?: string}}
 */
export function validateToss(matchState) {
  if (!matchState.toss.winner) {
    return { valid: false, error: 'Toss winner must be selected' };
  }

  if (!matchState.toss.choice) {
    return { valid: false, error: 'Toss choice must be selected' };
  }

  return { valid: true };
}

/**
 * Validates that innings can start
 * @param {Object} matchState
 * @returns {{valid: boolean, error?: string}}
 */
export function validateInningsStart(matchState) {
  const setupValidation = validateMatchSetup(matchState);
  if (!setupValidation.valid) {
    return setupValidation;
  }

  const tossValidation = validateToss(matchState);
  if (!tossValidation.valid) {
    return tossValidation;
  }

  return { valid: true };
}

/**
 * Validates bowler selection
 * @param {string} bowler
 * @param {string[]} bowlingTeamPlayers
 * @returns {{valid: boolean, error?: string}}
 */
export function validateBowler(bowler, bowlingTeamPlayers) {
  if (!bowler || bowler.trim() === '') {
    return { valid: false, error: 'Bowler must be selected' };
  }

  if (!bowlingTeamPlayers.includes(bowler)) {
    return { valid: false, error: 'Bowler must be from bowling team' };
  }

  return { valid: true };
}

/**
 * Validates that a ball can be added (current over must be editable)
 * @param {Object} innings
 * @param {number} overNumber
 * @param {number} ballNumber
 * @returns {{valid: boolean, error?: string}}
 */
export function canAddBall(innings, overNumber, ballNumber) {
  // Can only add to current over
  if (overNumber !== innings.currentOver) {
    return { valid: false, error: 'Can only add balls to current over' };
  }

  // Can only add if current over is not complete
  if (innings.ballsInCurrentOver >= 6) {
    return { valid: false, error: 'Current over is complete' };
  }

  return { valid: true };
}

/**
 * Validates that undo is allowed (only for current over)
 * @param {Object} innings
 * @returns {{valid: boolean, error?: string}}
 */
export function canUndo(innings) {
  if (innings.balls.length === 0) {
    return { valid: false, error: 'No balls to undo' };
  }

  const lastBall = innings.balls[innings.balls.length - 1];
  
  // Can only undo if last ball is from current over
  if (lastBall.over !== innings.currentOver) {
    return { valid: false, error: 'Can only undo balls from current over' };
  }

  return { valid: true };
}
