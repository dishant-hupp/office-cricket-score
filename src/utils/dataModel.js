/**
 * Data model for cricket match state
 * All state is stored in localStorage and follows this structure
 */

/**
 * @typedef {Object} Wicket
 * @property {('bowled'|'caught'|'runOut'|'lbw'|'stumped'|'hitWicket'|'retiredHurt')} type
 * @property {string} batsman - Name of dismissed batsman
 * @property {string|null} bowler - Name of bowler (null for run out)
 * @property {string|null} fielder - Name of fielder (for caught/run out)
 */

/**
 * @typedef {Object} Ball
 * @property {number} over - Over number (1-indexed)
 * @property {number} ball - Ball number in over (1-6)
 * @property {number} runs - Runs scored (0-6)
 * @property {('wide'|'noBall'|null)} extras - Type of extra, if any
 * @property {Wicket|null} wicket - Wicket information, if any
 * @property {string} batsman - Name of batsman who faced the ball
 * @property {string} bowler - Name of bowler
 * @property {boolean} isFreeHit - Whether this was a free hit delivery
 * @property {boolean} legalBall - Whether this counts as a legal ball (false for wide/no-ball)
 */

/**
 * @typedef {Object} Innings
 * @property {('teamA'|'teamB')} team - Team playing this innings
 * @property {('teamA'|'teamB')} battingTeam - Team batting
 * @property {('teamA'|'teamB')} bowlingTeam - Team bowling
 * @property {Ball[]} balls - Array of all balls bowled
 * @property {number} currentOver - Current over number (1-indexed)
 * @property {number} currentBall - Current ball in over (1-6)
 * @property {string} currentBowler - Name of current bowler
 * @property {string} onStrike - Name of batsman on strike
 * @property {string} offStrike - Name of batsman off strike
 * @property {number} totalRuns - Total runs scored
 * @property {number} wickets - Number of wickets fallen
 * @property {number} oversCompleted - Number of full overs completed
 * @property {number} ballsInCurrentOver - Number of legal balls in current over
 * @property {boolean} isFreeHitPending - Whether next legal ball is a free hit
 */

/**
 * @typedef {Object} Team
 * @property {string} name - Team name
 * @property {string[]} players - Array of player names
 */

/**
 * @typedef {Object} Toss
 * @property {('teamA'|'teamB'|null)} winner - Team that won toss
 * @property {('bat'|'bowl'|null)} choice - What they chose
 */

/**
 * @typedef {Object} MatchConfig
 * @property {number} totalOvers - Total overs in match (default 12)
 * @property {number} ballsPerOver - Balls per over (always 6)
 */

/**
 * @typedef {Object} MatchState
 * @property {string} matchId - Unique match identifier
 * @property {('setup'|'toss'|'team1_batting'|'team2_batting'|'completed')} status - Current match status
 * @property {MatchConfig} config - Match configuration
 * @property {{teamA: Team, teamB: Team}} teams - Team information
 * @property {Toss} toss - Toss result
 * @property {Innings[]} innings - Array of innings (max 2)
 * @property {number} currentInningsIndex - Index of current innings (0 or 1)
 */

/**
 * Creates a new empty match configuration (master data)
 * @returns {Object} Match configuration
 */
export function createEmptyMatchConfig() {
  return {
    matchId: `match_${Date.now()}`,
    config: {
      totalOvers: 12,
      ballsPerOver: 6
    },
    teams: {
      teamA: {
        name: 'Red Storm',
        players: []
      },
      teamB: {
        name: 'Blue Thunder',
        players: []
      }
    },
    toss: {
      winner: null,
      choice: null
    }
  };
}

/**
 * Creates a new empty innings state
 * @returns {Object} Innings state
 */
export function createEmptyInningsState() {
  return {
    innings: [],
    currentInningsIndex: -1
  };
}

/**
 * Creates a new empty match state (legacy - combines config and innings)
 * @returns {MatchState}
 */
export function createEmptyMatchState() {
  return {
    ...createEmptyMatchConfig(),
    ...createEmptyInningsState(),
    status: 'setup'
  };
}

/**
 * Creates a new empty innings
 * @param {('teamA'|'teamB')} battingTeam
 * @param {('teamA'|'teamB')} bowlingTeam
 * @param {string[]} battingTeamPlayers - List of batting team players
 * @param {string[]} bowlingTeamPlayers - List of bowling team players
 * @param {string} onStrike - Initial striker
 * @param {string} offStrike - Initial non-striker
 * @param {string} bowler - Initial bowler
 * @param {number} overNumber - Starting over number (usually 1)
 * @returns {Innings}
 */
export function createEmptyInnings(battingTeam, bowlingTeam, battingTeamPlayers, bowlingTeamPlayers, onStrike, offStrike, bowler, overNumber = 1) {
  return {
    team: battingTeam,
    battingTeam,
    bowlingTeam,
    battingTeamPlayers,
    bowlingTeamPlayers,
    balls: [],
    currentOver: overNumber,
    currentBall: 1,
    currentBowler: bowler,
    onStrike,
    offStrike,
    totalRuns: 0,
    wickets: 0,
    oversCompleted: 0,
    ballsInCurrentOver: 0,
    isFreeHitPending: false
  };
}

/**
 * Creates a new ball record
 * @param {Object} params
 * @param {number} params.over - Over number
 * @param {number} params.ball - Ball number in over
 * @param {number} params.runs - Runs scored
 * @param {('wide'|'noBall'|null)} params.extras - Extra type
 * @param {Wicket|null} params.wicket - Wicket info
 * @param {string} params.batsman - Batsman name
 * @param {string} params.bowler - Bowler name
 * @param {boolean} params.isFreeHit - Is free hit
 * @param {boolean} params.legalBall - Is legal ball
 * @returns {Ball}
 */
export function createBall({ over, ball, runs, extras, wicket, batsman, bowler, isFreeHit, legalBall }) {
  return {
    over,
    ball,
    runs,
    extras: extras || null,
    wicket: wicket || null,
    batsman,
    bowler,
    isFreeHit,
    legalBall
  };
}
