import { useState } from 'react';
import { Button } from './Button.jsx';
import { validateMatchSetup } from '../utils/validators.js';

export function MatchSetup({ matchState, updateMatchState }) {
  const [totalOvers, setTotalOvers] = useState(matchState.config.totalOvers);
  const [teamAPlayers, setTeamAPlayers] = useState([...matchState.teams.teamA.players]);
  const [teamBPlayers, setTeamBPlayers] = useState([...matchState.teams.teamB.players]);
  const [newPlayerA, setNewPlayerA] = useState('');
  const [newPlayerB, setNewPlayerB] = useState('');
  const [playersLocked, setPlayersLocked] = useState(false);

  const addPlayerA = () => {
    if (newPlayerA.trim() && !teamAPlayers.includes(newPlayerA.trim())) {
      setTeamAPlayers([...teamAPlayers, newPlayerA.trim()]);
      setNewPlayerA('');
    }
  };

  const addPlayerB = () => {
    if (newPlayerB.trim() && !teamBPlayers.includes(newPlayerB.trim())) {
      setTeamBPlayers([...teamBPlayers, newPlayerB.trim()]);
      setNewPlayerB('');
    }
  };

  const removePlayerA = (player) => {
    if (!playersLocked) {
      setTeamAPlayers(teamAPlayers.filter(p => p !== player));
    }
  };

  const removePlayerB = (player) => {
    if (!playersLocked) {
      setTeamBPlayers(teamBPlayers.filter(p => p !== player));
    }
  };

  const lockPlayers = () => {
    setPlayersLocked(true);
    updateMatchState(prev => ({
      ...prev,
      teams: {
        teamA: { ...prev.teams.teamA, players: teamAPlayers },
        teamB: { ...prev.teams.teamB, players: teamBPlayers }
      }
    }));
  };

  const startMatch = () => {
    const updatedState = {
      ...matchState,
      config: { ...matchState.config, totalOvers: parseInt(totalOvers) || 12 },
      teams: {
        teamA: { ...matchState.teams.teamA, players: teamAPlayers },
        teamB: { ...matchState.teams.teamB, players: teamBPlayers }
      }
    };

    const validation = validateMatchSetup(updatedState);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    updateMatchState({
      ...updatedState,
      status: 'toss'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Match Setup</h1>

      {/* Total Overs */}
      <div className="mb-8">
        <label className="block text-lg font-semibold mb-2">
          Total Overs
        </label>
        <input
          type="number"
          min="1"
          value={totalOvers}
          onChange={(e) => setTotalOvers(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          disabled={playersLocked}
        />
      </div>

      {/* Team A */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">{matchState.teams.teamA.name}</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayerA}
            onChange={(e) => setNewPlayerA(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPlayerA()}
            placeholder="Add player name"
            className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            disabled={playersLocked}
          />
          <Button onClick={addPlayerA} disabled={playersLocked || !newPlayerA.trim()}>
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {teamAPlayers.map((player, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
              <span className="text-lg">{player}</span>
              {!playersLocked && (
                <button
                  onClick={() => removePlayerA(player)}
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team B */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">{matchState.teams.teamB.name}</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayerB}
            onChange={(e) => setNewPlayerB(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPlayerB()}
            placeholder="Add player name"
            className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            disabled={playersLocked}
          />
          <Button onClick={addPlayerB} disabled={playersLocked || !newPlayerB.trim()}>
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {teamBPlayers.map((player, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
              <span className="text-lg">{player}</span>
              {!playersLocked && (
                <button
                  onClick={() => removePlayerB(player)}
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {!playersLocked ? (
          <Button onClick={lockPlayers} disabled={teamAPlayers.length === 0 || teamBPlayers.length === 0}>
            Lock Players
          </Button>
        ) : (
          <Button onClick={startMatch} variant="success">
            Start Match
          </Button>
        )}
      </div>
    </div>
  );
}
