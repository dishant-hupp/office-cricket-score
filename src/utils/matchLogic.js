/**
 * Core scoring engine for cricket match
 * Handles all ball-by-ball scoring logic, over management, and state updates
 */

import { createBall } from './dataModel.js';
import { isValidRun, canTakeWicket, canAddBall, canUndo } from './validators.js';

/**
 * Adds a run to the innings
 * @param {Object} innings - Current innings state
 * @param {number} runs - Runs scored (0-6)
 * @param {string} batsman - Batsman on strike
 * @returns {Object} Updated innings state
 */
export function addRuns(innings, runs, batsman) {
  if (!isValidRun(runs)) {
    throw new Error(`Invalid run value: ${runs}. Must be 0, 1, 2, 3, 4, or 6.`);
  }

  const validation = canAddBall(innings, innings.currentOver, innings.currentBall);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const isFreeHit = innings.isFreeHitPending;
  const legalBall = true; // Regular runs are always legal balls

  const newBall = createBall({
    over: innings.currentOver,
    ball: innings.currentBall,
    runs,
    extras: null,
    wicket: null,
    batsman,
    bowler: innings.currentBowler,
    isFreeHit,
    legalBall
  });

  let updatedInnings = {
    ...innings,
    balls: [...innings.balls, newBall],
    totalRuns: innings.totalRuns + runs,
    ballsInCurrentOver: innings.ballsInCurrentOver + 1,
    isFreeHitPending: false // Free hit consumed
  };

  // Update striker based on runs
  updatedInnings = updateStrikerAfterRuns(updatedInnings, runs);

  // Check if over is complete
  if (updatedInnings.ballsInCurrentOver === 6) {
    updatedInnings = completeOver(updatedInnings);
  } else {
    updatedInnings = {
      ...updatedInnings,
      currentBall: updatedInnings.currentBall + 1
    };
  }

  return updatedInnings;
}

/**
 * Adds a wide to the innings
 * @param {Object} innings - Current innings state
 * @param {string} batsman - Batsman on strike
 * @returns {Object} Updated innings state
 */
export function addWide(innings, batsman) {
  const validation = canAddBall(innings, innings.currentOver, innings.currentBall);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const isFreeHit = innings.isFreeHitPending;
  const legalBall = false; // Wide does NOT count as legal ball

  const newBall = createBall({
    over: innings.currentOver,
    ball: innings.currentBall,
    runs: 1, // Wide = +1 run
    extras: 'wide',
    wicket: null,
    batsman,
    bowler: innings.currentBowler,
    isFreeHit,
    legalBall
  });

  const updatedInnings = {
    ...innings,
    balls: [...innings.balls, newBall],
    totalRuns: innings.totalRuns + 1,
    // ballsInCurrentOver NOT incremented (wide doesn't count)
    isFreeHitPending: false // Free hit consumed
  };

  // Ball number stays same (wide doesn't advance ball count)
  // No striker change on wide

  return updatedInnings;
}

/**
 * Adds a no-ball to the innings
 * @param {Object} innings - Current innings state
 * @param {string} batsman - Batsman on strike
 * @returns {Object} Updated innings state
 */
export function addNoBall(innings, batsman) {
  const validation = canAddBall(innings, innings.currentOver, innings.currentBall);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const isFreeHit = innings.isFreeHitPending;
  const legalBall = false; // No-ball does NOT count as legal ball

  const newBall = createBall({
    over: innings.currentOver,
    ball: innings.currentBall,
    runs: 1, // No-ball = +1 run
    extras: 'noBall',
    wicket: null,
    batsman,
    bowler: innings.currentBowler,
    isFreeHit,
    legalBall
  });

  const updatedInnings = {
    ...innings,
    balls: [...innings.balls, newBall],
    totalRuns: innings.totalRuns + 1,
    // ballsInCurrentOver NOT incremented (no-ball doesn't count)
    isFreeHitPending: true // Next legal delivery is a free hit
  };

  // Ball number stays same (no-ball doesn't advance ball count)
  // No striker change on no-ball

  return updatedInnings;
}

/**
 * Adds a wicket to the innings
 * @param {Object} innings - Current innings state
 * @param {Object} wicketInfo
 * @param {string} wicketInfo.type - Type of wicket
 * @param {string} wicketInfo.batsman - Dismissed batsman
 * @param {string|null} wicketInfo.bowler - Bowler (null for run out)
 * @param {string|null} wicketInfo.fielder - Fielder (for caught/run out)
 * @param {string|null} nextPlayer - Next player to come in (if null, will auto-select)
 * @returns {Object} Updated innings state
 */
export function addWicket(innings, wicketInfo, nextPlayer = null) {
  const validation = canAddBall(innings, innings.currentOver, innings.currentBall);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const isFreeHit = innings.isFreeHitPending;
  
  // Check if wicket can be taken (free hit rule)
  if (!canTakeWicket(isFreeHit, wicketInfo.type)) {
    throw new Error(`Cannot take ${wicketInfo.type} on a free hit. Only run out is allowed.`);
  }

  const legalBall = true; // Wicket delivery is a legal ball (unless it's a no-ball, but that's handled separately)

  const wicket = {
    type: wicketInfo.type,
    batsman: wicketInfo.batsman,
    bowler: wicketInfo.bowler || innings.currentBowler,
    fielder: wicketInfo.fielder || null
  };

  // Determine which batsman faced the ball
  // Usually it's the on-strike batsman, but for run out it could be either
  // For most dismissals, the batsman who faced is the one dismissed
  const batsmanWhoFaced = wicketInfo.batsman;
  
  const newBall = createBall({
    over: innings.currentOver,
    ball: innings.currentBall,
    runs: 0, // Wicket = 0 runs (unless runs were scored before dismissal)
    extras: null,
    wicket,
    batsman: batsmanWhoFaced,
    bowler: innings.currentBowler,
    isFreeHit,
    legalBall
  });

  let updatedInnings = {
    ...innings,
    balls: [...innings.balls, newBall],
    wickets: innings.wickets + 1,
    ballsInCurrentOver: innings.ballsInCurrentOver + 1,
    isFreeHitPending: false // Free hit consumed
  };

  // Replace dismissed batsman with next batsman
  if (nextPlayer) {
    // Use provided next player
    if (updatedInnings.onStrike === wicketInfo.batsman) {
      updatedInnings.onStrike = nextPlayer;
    } else if (updatedInnings.offStrike === wicketInfo.batsman) {
      updatedInnings.offStrike = nextPlayer;
    }
  } else {
    // Auto-select next available player
    updatedInnings = replaceDismissedBatsman(updatedInnings, wicketInfo.batsman);
  }

  // Check if over is complete
  if (updatedInnings.ballsInCurrentOver === 6) {
    updatedInnings = completeOver(updatedInnings);
  } else {
    updatedInnings = {
      ...updatedInnings,
      currentBall: updatedInnings.currentBall + 1
    };
  }

  return updatedInnings;
}

/**
 * Adds runs with a wicket (e.g., run out with runs scored)
 * @param {Object} innings - Current innings state
 * @param {number} runs - Runs scored before dismissal
 * @param {Object} wicketInfo - Wicket information
 * @param {string|null} nextPlayer - Next player to come in (if null, will auto-select)
 * @returns {Object} Updated innings state
 */
export function addRunsWithWicket(innings, runs, wicketInfo, nextPlayer = null) {
  if (!isValidRun(runs)) {
    throw new Error(`Invalid run value: ${runs}`);
  }

  const validation = canAddBall(innings, innings.currentOver, innings.currentBall);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const isFreeHit = innings.isFreeHitPending;
  
  if (!canTakeWicket(isFreeHit, wicketInfo.type)) {
    throw new Error(`Cannot take ${wicketInfo.type} on a free hit. Only run out is allowed.`);
  }

  const legalBall = true;

  const wicket = {
    type: wicketInfo.type,
    batsman: wicketInfo.batsman,
    bowler: wicketInfo.bowler || innings.currentBowler,
    fielder: wicketInfo.fielder || null
  };

  // Determine which batsman faced the ball
  // For run out with runs, the batsman who faced is the one dismissed
  const batsmanWhoFaced = wicketInfo.batsman;
  
  const newBall = createBall({
    over: innings.currentOver,
    ball: innings.currentBall,
    runs,
    extras: null,
    wicket,
    batsman: batsmanWhoFaced,
    bowler: innings.currentBowler,
    isFreeHit,
    legalBall
  });

  let updatedInnings = {
    ...innings,
    balls: [...innings.balls, newBall],
    totalRuns: innings.totalRuns + runs,
    wickets: innings.wickets + 1,
    ballsInCurrentOver: innings.ballsInCurrentOver + 1,
    isFreeHitPending: false
  };

  // Update striker based on runs
  updatedInnings = updateStrikerAfterRuns(updatedInnings, runs);
  
  // Replace dismissed batsman
  if (nextPlayer) {
    // Use provided next player
    if (updatedInnings.onStrike === wicketInfo.batsman) {
      updatedInnings.onStrike = nextPlayer;
    } else if (updatedInnings.offStrike === wicketInfo.batsman) {
      updatedInnings.offStrike = nextPlayer;
    }
  } else {
    // Auto-select next available player
    updatedInnings = replaceDismissedBatsman(updatedInnings, wicketInfo.batsman);
  }

  // Check if over is complete
  if (updatedInnings.ballsInCurrentOver === 6) {
    updatedInnings = completeOver(updatedInnings);
  } else {
    updatedInnings = {
      ...updatedInnings,
      currentBall: updatedInnings.currentBall + 1
    };
  }

  return updatedInnings;
}

/**
 * Updates striker based on runs scored
 * @param {Object} innings
 * @param {number} runs
 * @returns {Object} Updated innings
 */
function updateStrikerAfterRuns(innings, runs) {
  // On odd runs, strikers swap
  if (runs === 1 || runs === 3) {
    return {
      ...innings,
      onStrike: innings.offStrike,
      offStrike: innings.onStrike
    };
  }
  // On 0, 2, 4, 6 - no change
  return innings;
}

/**
 * Replaces dismissed batsman with next available batsman
 * @param {Object} innings
 * @param {string} dismissedBatsman
 * @returns {Object} Updated innings
 */
function replaceDismissedBatsman(innings, dismissedBatsman) {
  // Get all players from batting team
  const allPlayers = innings.battingTeamPlayers || [];
  
  // Get already dismissed players
  const dismissedPlayers = innings.balls
    .filter(ball => ball.wicket)
    .map(ball => ball.wicket.batsman);
  
  // Find next available player
  const nextPlayer = allPlayers.find(player => 
    !dismissedPlayers.includes(player) && 
    player !== innings.onStrike && 
    player !== innings.offStrike
  );

  if (!nextPlayer) {
    // All out (10 wickets)
    return innings;
  }

  // Replace dismissed batsman
  if (innings.onStrike === dismissedBatsman) {
    return {
      ...innings,
      onStrike: nextPlayer
    };
  } else if (innings.offStrike === dismissedBatsman) {
    return {
      ...innings,
      offStrike: nextPlayer
    };
  }

  return innings;
}

/**
 * Completes the current over and moves to next over
 * @param {Object} innings
 * @returns {Object} Updated innings
 */
function completeOver(innings) {
  return {
    ...innings,
    oversCompleted: innings.oversCompleted + 1,
    // Don't increment currentOver here - it will be incremented when startNewOver is called
    // currentOver stays the same until we actually start the next over
    currentBall: 1,
    ballsInCurrentOver: 0,
    currentBowler: '', // Clear bowler so new one must be selected
    // Swap strikers at end of over
    onStrike: innings.offStrike,
    offStrike: innings.onStrike
  };
}

/**
 * Starts a new over with a new bowler
 * @param {Object} innings
 * @param {string} newBowler
 * @returns {Object} Updated innings
 */
export function startNewOver(innings, newBowler) {
  // If we're already at the start of a new over (ball 1, 0 balls), set bowler and increment over
  if (innings.ballsInCurrentOver === 0 && innings.currentBall === 1) {
    // At start of new over - increment over number and set bowler
    return {
      ...innings,
      currentBowler: newBowler,
      currentOver: innings.currentOver + 1
    };
  }

  if (innings.ballsInCurrentOver !== 6) {
    throw new Error('Cannot start new over: current over is not complete');
  }

  // Over is complete, move to next over
  return {
    ...innings,
    currentBowler: newBowler,
    currentOver: innings.currentOver + 1,
    currentBall: 1,
    ballsInCurrentOver: 0,
    // Swap strikers
    onStrike: innings.offStrike,
    offStrike: innings.onStrike
  };
}

/**
 * Manually ends the current over (when 6 legal balls are bowled)
 * @param {Object} innings
 * @returns {Object} Updated innings
 */
export function endOver(innings) {
  if (innings.ballsInCurrentOver < 6) {
    throw new Error(`Cannot end over: only ${innings.ballsInCurrentOver} legal balls bowled`);
  }

  return completeOver(innings);
}

/**
 * Undoes the last ball (only allowed for current over)
 * @param {Object} innings
 * @returns {Object} Updated innings
 */
export function undoLastBall(innings) {
  const validation = canUndo(innings);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (innings.balls.length === 0) {
    return innings;
  }

  const lastBall = innings.balls[innings.balls.length - 1];
  const updatedBalls = innings.balls.slice(0, -1);

  // Recalculate totals
  let updatedInnings = {
    ...innings,
    balls: updatedBalls,
    totalRuns: 0,
    wickets: 0,
    oversCompleted: 0,
    ballsInCurrentOver: 0,
    currentOver: 1,
    currentBall: 1
  };

  // Recalculate from all remaining balls
  for (const ball of updatedBalls) {
    updatedInnings.totalRuns += ball.runs;
    if (ball.wicket) {
      updatedInnings.wickets += 1;
    }
    if (ball.legalBall) {
      updatedInnings.ballsInCurrentOver += 1;
      if (updatedInnings.ballsInCurrentOver === 6) {
        updatedInnings.oversCompleted += 1;
        updatedInnings.ballsInCurrentOver = 0;
        // Don't increment currentOver here - it stays the same until next over starts
      }
    }
    // Set currentOver to the over of the last ball
    updatedInnings.currentOver = ball.over;
    updatedInnings.currentBall = ball.ball + 1;
  }

  // Reset free hit pending if last ball was a no-ball
  if (lastBall.extras === 'noBall') {
    updatedInnings.isFreeHitPending = false;
  }

  // If no balls remain, reset to initial state
  if (updatedBalls.length === 0) {
    updatedInnings.currentBall = 1;
    updatedInnings.currentOver = 1;
  }

  return updatedInnings;
}

/**
 * Checks if innings is complete
 * @param {Object} innings
 * @param {number} totalOvers
 * @returns {boolean}
 */
export function isInningsComplete(innings, totalOvers) {
  // All out (10 wickets)
  if (innings.wickets >= 10) {
    return true;
  }

  // All overs completed - check if we've completed all overs
  if (innings.oversCompleted >= totalOvers) {
    // If we've completed all overs, innings is done
    return true;
  }

  return false;
}

/**
 * Calculates batting statistics for a player
 * @param {Object} innings
 * @param {string} playerName
 * @returns {Object} {runs, balls, fours, sixes, strikeRate}
 */
export function getBattingStats(innings, playerName) {
  const playerBalls = innings.balls.filter(ball => 
    ball.batsman === playerName && ball.legalBall && !ball.wicket
  );

  let runs = 0;
  let fours = 0;
  let sixes = 0;

  for (const ball of playerBalls) {
    runs += ball.runs;
    if (ball.runs === 4) fours++;
    if (ball.runs === 6) sixes++;
  }

  const balls = playerBalls.length;
  const strikeRate = balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00';

  return { runs, balls, fours, sixes, strikeRate };
}

/**
 * Calculates bowling statistics for a bowler
 * @param {Object} innings
 * @param {string} bowlerName
 * @returns {Object} {overs, maidens, runs, wickets, economy}
 */
export function getBowlingStats(innings, bowlerName) {
  const bowlerBalls = innings.balls.filter(ball => ball.bowler === bowlerName);
  
  let runs = 0;
  let wickets = 0;
  let legalBalls = 0;

  // Track runs and legal balls per over for maiden calculation
  const overStats = {};

  for (const ball of bowlerBalls) {
    runs += ball.runs;
    if (ball.wicket) {
      wickets += 1;
    }
    if (ball.legalBall) {
      legalBalls += 1;
      const overKey = `${ball.over}`;
      if (!overStats[overKey]) {
        overStats[overKey] = { runs: 0, legalBalls: 0 };
      }
      overStats[overKey].runs += ball.runs;
      overStats[overKey].legalBalls += 1;
    }
  }

  // Calculate maidens (complete overs with 6 legal balls and 0 runs)
  let maidenOvers = 0;
  for (const overNum in overStats) {
    if (overStats[overNum].legalBalls === 6 && overStats[overNum].runs === 0) {
      maidenOvers += 1;
    }
  }

  const overs = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10; // e.g., 5.3 overs
  const economy = overs > 0 ? (runs / overs).toFixed(2) : '0.00';

  return { overs, maidens: maidenOvers, runs, wickets, economy };
}

/**
 * Gets ball-by-ball delivery details for a bowler
 * @param {Object} innings
 * @param {string} bowlerName
 * @returns {string} Formatted string of deliveries (e.g., "1, 4, W, 0, 2, 1 | 2, 1, 3")
 */
export function getBowlerBallDetails(innings, bowlerName) {
  const bowlerBalls = innings.balls.filter(ball => ball.bowler === bowlerName);
  
  if (bowlerBalls.length === 0) {
    return '-';
  }
  
  // Group balls by over
  const overGroups = {};
  for (const ball of bowlerBalls) {
    const overKey = ball.over;
    if (!overGroups[overKey]) {
      overGroups[overKey] = [];
    }
    overGroups[overKey].push(ball);
  }

  // Format each ball
  const formatBall = (ball) => {
    if (ball.wicket) {
      return 'W'; // Wicket
    } else if (ball.extras === 'wide') {
      return 'WD'; // Wide
    } else if (ball.extras === 'noBall') {
      return 'NB'; // No-ball
    } else {
      return ball.runs.toString(); // Regular runs
    }
  };

  // Build delivery string grouped by over
  const overStrings = [];
  const sortedOvers = Object.keys(overGroups).sort((a, b) => parseInt(a) - parseInt(b));
  
  for (const overNum of sortedOvers) {
    const balls = overGroups[overNum];
    // Sort balls within over by ball number to ensure correct order
    balls.sort((a, b) => {
      if (a.over !== b.over) return a.over - b.over;
      return a.ball - b.ball;
    });
    const ballStrings = balls.map(formatBall);
    overStrings.push(ballStrings.join(', '));
  }

  return overStrings.join(' | ');
}

/**
 * Gets fall of wickets information
 * @param {Object} innings
 * @returns {Array} [{wicket, score, batsman, howOut}]
 */
export function getFallOfWickets(innings) {
  const fallOfWickets = [];
  let runningScore = 0;

  for (const ball of innings.balls) {
    runningScore += ball.runs;
    if (ball.wicket) {
      fallOfWickets.push({
        wicket: fallOfWickets.length + 1, // Wicket number (1, 2, 3, ...)
        score: runningScore,
        batsman: ball.wicket.batsman,
        howOut: formatWicketType(ball.wicket.type, ball.wicket.bowler, ball.wicket.fielder)
      });
    }
  }

  return fallOfWickets.reverse(); // Most recent first
}

/**
 * Formats wicket type for display
 * @param {string} type
 * @param {string} bowler
 * @param {string|null} fielder
 * @returns {string}
 */
function formatWicketType(type, bowler, fielder) {
  const typeMap = {
    'bowled': `b ${bowler}`,
    'caught': `c ${fielder} b ${bowler}`,
    'runOut': `run out (${fielder || 'sub'})`,
    'lbw': `lbw b ${bowler}`,
    'stumped': `st ${fielder} b ${bowler}`,
    'hitWicket': `hit wicket b ${bowler}`,
    'retiredHurt': 'retired hurt'
  };
  return typeMap[type] || type;
}

/**
 * Gets current score display string
 * @param {Object} innings
 * @returns {string} e.g., "72/4 in 9.3 overs"
 */
export function getScoreDisplay(innings) {
  const overs = `${innings.oversCompleted}.${innings.ballsInCurrentOver}`;
  return `${innings.totalRuns}/${innings.wickets} in ${overs} overs`;
}
