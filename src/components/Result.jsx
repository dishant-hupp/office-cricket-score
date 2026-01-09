import { Button } from './Button.jsx';
import { BattingScorecard } from './BattingScorecard.jsx';
import { BowlingScorecard } from './BowlingScorecard.jsx';
import { FallOfWickets } from './FallOfWickets.jsx';

export function Result({ matchState, resetMatch }) {
  if (matchState.innings.length < 2) return null;

  const firstInnings = matchState.innings[0];
  const secondInnings = matchState.innings[1];

  const team1Name = matchState.teams[firstInnings.battingTeam].name;
  const team2Name = matchState.teams[secondInnings.battingTeam].name;

  const team1Score = firstInnings.totalRuns;
  const team2Score = secondInnings.totalRuns;
  const team1Wickets = firstInnings.wickets;
  const team2Wickets = secondInnings.wickets;

  let winner = null;
  let resultText = '';

  if (team2Score > team1Score) {
    winner = team2Name;
    resultText = `${team2Name} won by ${10 - team2Wickets} wicket${10 - team2Wickets !== 1 ? 's' : ''}`;
  } else if (team1Score > team2Score) {
    winner = team1Name;
    resultText = `${team1Name} won by ${team1Score - team2Score} run${team1Score - team2Score !== 1 ? 's' : ''}`;
  } else {
    resultText = 'Match Tied';
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Match Result</h1>

      <div className="bg-green-100 border-4 border-green-500 rounded-lg p-6 mb-8 text-center">
        <div className="text-3xl font-bold text-green-800 mb-2">{resultText}</div>
        {winner && (
          <div className="text-xl text-green-700">🏆 {winner} 🏆</div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* First Innings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {team1Name} - {team1Score}/{team1Wickets}
          </h2>
          <div className="text-center mb-4 text-gray-600">
            {firstInnings.oversCompleted}.{firstInnings.ballsInCurrentOver} overs
          </div>
          <BattingScorecard innings={firstInnings} />
          <BowlingScorecard innings={firstInnings} />
          <FallOfWickets innings={firstInnings} />
        </div>

        {/* Second Innings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {team2Name} - {team2Score}/{team2Wickets}
          </h2>
          <div className="text-center mb-4 text-gray-600">
            {secondInnings.oversCompleted}.{secondInnings.ballsInCurrentOver} overs
          </div>
          <BattingScorecard innings={secondInnings} />
          <BowlingScorecard innings={secondInnings} />
          <FallOfWickets innings={secondInnings} />
        </div>
      </div>

      <div className="text-center">
        <Button onClick={resetMatch} variant="primary" className="text-xl px-8 py-4">
          Start New Match
        </Button>
      </div>
    </div>
  );
}
