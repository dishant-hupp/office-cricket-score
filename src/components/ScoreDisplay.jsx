import { getScoreDisplay } from '../utils/matchLogic.js';

export function ScoreDisplay({ innings, matchConfig, inningsState, currentInningsIndex }) {
  if (!innings) return null;

  const scoreText = getScoreDisplay(innings);
  const isSecondInnings = currentInningsIndex === 1;
  const firstInnings = inningsState.innings[0];
  const target = isSecondInnings && firstInnings 
    ? firstInnings.totalRuns + 1 
    : null;
  const runsNeeded = target ? target - innings.totalRuns : null;

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg mb-6">
      <div className="text-center">
        <div className="text-4xl font-bold mb-2">{scoreText}</div>
        <div className="text-lg space-y-1">
          <div>
            <span className="font-semibold">Striker:</span> {innings.onStrike}
          </div>
          <div>
            <span className="font-semibold">Non-Striker:</span> {innings.offStrike}
          </div>
          <div>
            <span className="font-semibold">Bowler:</span> {innings.currentBowler}
          </div>
          {isSecondInnings && target && (
            <div className="mt-2 text-xl font-bold">
              Target: {target} | Need {runsNeeded > 0 ? runsNeeded : 0} runs
            </div>
          )}
          {innings.isFreeHitPending && (
            <div className="mt-2 text-yellow-400 font-bold text-lg">
              FREE HIT
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
