import { getBattingStats } from '../utils/matchLogic.js';

export function BattingScorecard({ innings }) {
  if (!innings || !innings.battingTeamPlayers) return null;

  const allPlayers = innings.battingTeamPlayers;
  const stats = allPlayers.map(player => ({
    player,
    ...getBattingStats(innings, player)
  }));

  const currentBatsmen = [innings.onStrike, innings.offStrike];

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-3">Batting Scorecard</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-3 py-2 text-left">Player</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Runs</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Balls</th>
              <th className="border border-gray-300 px-3 py-2 text-center">4s</th>
              <th className="border border-gray-300 px-3 py-2 text-center">6s</th>
              <th className="border border-gray-300 px-3 py-2 text-center">SR</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, idx) => (
              <tr
                key={idx}
                className={currentBatsmen.includes(stat.player) ? 'bg-yellow-100' : ''}
              >
                <td className="border border-gray-300 px-3 py-2">
                  {stat.player}
                  {currentBatsmen.includes(stat.player) && (
                    <span className="ml-2 text-blue-600 font-bold">*</span>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">{stat.runs}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{stat.balls}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{stat.fours}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{stat.sixes}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{stat.strikeRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
