import React from 'react';
import { getBowlingStats, getBowlerBallDetails } from '../utils/matchLogic.js';

export function BowlingScorecard({ innings }) {
  if (!innings || !innings.bowlingTeamPlayers) return null;

  // Get unique bowlers from balls
  const bowlers = [...new Set(innings.balls.map(ball => ball.bowler))];
  const stats = bowlers.map(bowler => ({
    bowler,
    ...getBowlingStats(innings, bowler),
    ballDetails: getBowlerBallDetails(innings, bowler)
  }));

  // Parse ball details to get overs
  const getOversList = (ballDetails) => {
    if (!ballDetails || ballDetails === '-') return [];
    return ballDetails.split(' | ');
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-3">Bowling Scorecard</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-3 py-2 text-left">Bowler</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Overs</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Maidens</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Runs</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Wickets</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Economy</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Over</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Ball Details</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, idx) => {
              const oversList = getOversList(stat.ballDetails);
              const isCurrentBowler = stat.bowler === innings.currentBowler;
              const rowSpan = Math.max(1, oversList.length);

              return (
                <React.Fragment key={idx}>
                  {oversList.length > 0 ? (
                    oversList.map((overDetails, overIdx) => (
                      <tr 
                        key={`${idx}-${overIdx}`} 
                        className={isCurrentBowler ? 'bg-yellow-100' : ''}
                      >
                        {overIdx === 0 && (
                          <>
                            <td 
                              rowSpan={rowSpan} 
                              className="border border-gray-300 px-3 py-2"
                            >
                              {stat.bowler}
                              {isCurrentBowler && (
                                <span className="ml-2 text-blue-600 font-bold">*</span>
                              )}
                            </td>
                            <td 
                              rowSpan={rowSpan} 
                              className="border border-gray-300 px-3 py-2 text-center"
                            >
                              {stat.overs}
                            </td>
                            <td 
                              rowSpan={rowSpan} 
                              className="border border-gray-300 px-3 py-2 text-center"
                            >
                              {stat.maidens}
                            </td>
                            <td 
                              rowSpan={rowSpan} 
                              className="border border-gray-300 px-3 py-2 text-center"
                            >
                              {stat.runs}
                            </td>
                            <td 
                              rowSpan={rowSpan} 
                              className="border border-gray-300 px-3 py-2 text-center"
                            >
                              {stat.wickets}
                            </td>
                            <td 
                              rowSpan={rowSpan} 
                              className="border border-gray-300 px-3 py-2 text-center"
                            >
                              {stat.economy}
                            </td>
                          </>
                        )}
                        <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                          {overIdx + 1}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-sm font-mono">
                          {overDetails}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className={isCurrentBowler ? 'bg-yellow-100' : ''}>
                      <td className="border border-gray-300 px-3 py-2">
                        {stat.bowler}
                        {isCurrentBowler && (
                          <span className="ml-2 text-blue-600 font-bold">*</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{stat.overs}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{stat.maidens}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{stat.runs}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{stat.wickets}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">{stat.economy}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm font-mono">-</td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
