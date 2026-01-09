import { Button } from './Button.jsx';
import { createEmptyInnings } from '../utils/dataModel.js';
import { getScoreDisplay } from '../utils/matchLogic.js';

export function InningsManager({ matchConfig, inningsState, onAddInnings, onDeleteInnings, onSelectInnings }) {
  if (!matchConfig || !inningsState) return null;

  const { innings, currentInningsIndex } = inningsState;
  const { teams } = matchConfig;

  const handleAddInnings = () => {
    // Show a simple prompt to select teams
    const battingTeam = prompt('Select batting team (teamA or teamB):', 'teamA');
    const bowlingTeam = battingTeam === 'teamA' ? 'teamB' : 'teamA';
    
    if (!battingTeam || (battingTeam !== 'teamA' && battingTeam !== 'teamB')) {
      alert('Invalid team selection');
      return;
    }

    const battingPlayers = teams[battingTeam].players;
    const bowlingPlayers = teams[bowlingTeam].players;

    if (battingPlayers.length < 2) {
      alert('Batting team must have at least 2 players');
      return;
    }

    if (bowlingPlayers.length < 1) {
      alert('Bowling team must have at least 1 player');
      return;
    }

    const newInnings = createEmptyInnings(
      battingTeam,
      bowlingTeam,
      battingPlayers,
      bowlingPlayers,
      battingPlayers[0],
      battingPlayers[1],
      bowlingPlayers[0],
      1
    );

    onAddInnings(newInnings);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Innings Manager</h3>
        <Button onClick={handleAddInnings} variant="success">
          + Add Innings
        </Button>
      </div>

      {innings.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No innings created yet. Click "Add Innings" to start.
        </div>
      ) : (
        <div className="space-y-2">
          {innings.map((inn, index) => {
            const battingTeamName = teams[inn.battingTeam]?.name || inn.battingTeam;
            const bowlingTeamName = teams[inn.bowlingTeam]?.name || inn.bowlingTeam;
            const score = getScoreDisplay(inn);
            const isActive = index === currentInningsIndex;

            return (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      Innings {index + 1}: {battingTeamName} vs {bowlingTeamName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {score} | Over {inn.currentOver}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={isActive ? 'primary' : 'secondary'}
                      onClick={() => onSelectInnings(index)}
                      className="text-sm"
                    >
                      {isActive ? 'Active' : 'Select'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (confirm(`Delete Innings ${index + 1}?`)) {
                          onDeleteInnings(index);
                        }
                      }}
                      className="text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
