import { useState } from 'react';
import { Button } from './Button.jsx';
import { PlayerSelectModal } from './PlayerSelectModal.jsx';
import { validateToss } from '../utils/validators.js';
import { createEmptyInnings } from '../utils/dataModel.js';

export function Toss({ matchState, updateMatchState }) {
  const [winner, setWinner] = useState(matchState.toss.winner);
  const [choice, setChoice] = useState(matchState.toss.choice);
  const [showOnStrikeModal, setShowOnStrikeModal] = useState(false);
  const [showOffStrikeModal, setShowOffStrikeModal] = useState(false);
  const [onStrike, setOnStrike] = useState(null);
  const [offStrike, setOffStrike] = useState(null);
  const [bowler, setBowler] = useState(null);

  // Determine batting and bowling teams
  let firstBattingTeam, firstBowlingTeam;
  if (choice === 'bat') {
    firstBattingTeam = winner;
    firstBowlingTeam = winner === 'teamA' ? 'teamB' : 'teamA';
  } else if (choice === 'bowl') {
    firstBowlingTeam = winner;
    firstBattingTeam = winner === 'teamA' ? 'teamB' : 'teamA';
  }

  const battingTeamPlayers = firstBattingTeam ? matchState.teams[firstBattingTeam].players : [];
  const bowlingTeamPlayers = firstBowlingTeam ? matchState.teams[firstBowlingTeam].players : [];

  const handleOnStrikeSelect = (player) => {
    setOnStrike(player);
    setShowOnStrikeModal(false);
  };

  const handleOffStrikeSelect = (player) => {
    if (player === onStrike) {
      alert('Off-strike player must be different from on-strike player');
      return;
    }
    setOffStrike(player);
    setShowOffStrikeModal(false);
  };

  const handleBowlerSelect = (player) => {
    setBowler(player);
  };

  const handleStartInnings = () => {
    const updatedToss = { winner, choice };
    const validation = validateToss({ ...matchState, toss: updatedToss });
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (!onStrike || !offStrike) {
      alert('Please select both opening batsmen');
      return;
    }

    if (!bowler) {
      alert('Please select the opening bowler');
      return;
    }

    // Create first innings
    const firstInnings = createEmptyInnings(
      firstBattingTeam,
      firstBowlingTeam,
      battingTeamPlayers,
      bowlingTeamPlayers,
      onStrike,
      offStrike,
      bowler,
      1
    );

    updateMatchState({
      ...matchState,
      toss: updatedToss,
      innings: [firstInnings],
      currentInningsIndex: 0,
      status: 'team1_batting'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Toss</h1>

      {/* Toss Winner */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Who won the toss?</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={winner === 'teamA' ? 'primary' : 'secondary'}
            onClick={() => setWinner('teamA')}
            className="text-lg"
          >
            {matchState.teams.teamA.name}
          </Button>
          <Button
            variant={winner === 'teamB' ? 'primary' : 'secondary'}
            onClick={() => setWinner('teamB')}
            className="text-lg"
          >
            {matchState.teams.teamB.name}
          </Button>
        </div>
      </div>

      {/* Toss Choice */}
      {winner && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">What did they choose?</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={choice === 'bat' ? 'primary' : 'secondary'}
              onClick={() => setChoice('bat')}
              className="text-lg"
            >
              Bat
            </Button>
            <Button
              variant={choice === 'bowl' ? 'primary' : 'secondary'}
              onClick={() => setChoice('bowl')}
              className="text-lg"
            >
              Bowl
            </Button>
          </div>
        </div>
      )}

      {/* Player Selection */}
      {winner && choice && (
        <div className="space-y-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Opening Batsmen</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">On Strike</label>
                <Button
                  variant={onStrike ? 'primary' : 'secondary'}
                  onClick={() => setShowOnStrikeModal(true)}
                  className="w-full"
                >
                  {onStrike || 'Select Player'}
                </Button>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Off Strike</label>
                <Button
                  variant={offStrike ? 'primary' : 'secondary'}
                  onClick={() => setShowOffStrikeModal(true)}
                  className="w-full"
                >
                  {offStrike || 'Select Player'}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Select Opening Bowler</h2>
            <select
              value={bowler || ''}
              onChange={(e) => handleBowlerSelect(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select bowler...</option>
              {bowlingTeamPlayers.map((player, idx) => (
                <option key={idx} value={player}>{player}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Start Innings Button */}
      {winner && choice && onStrike && offStrike && bowler && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleStartInnings} variant="success" className="text-xl px-8 py-4">
            Start Innings
          </Button>
        </div>
      )}

      {/* Player Selection Modals */}
      <PlayerSelectModal
        isOpen={showOnStrikeModal}
        onClose={() => setShowOnStrikeModal(false)}
        onConfirm={handleOnStrikeSelect}
        players={battingTeamPlayers}
        title="Select On-Strike Batsman"
        excludePlayers={[offStrike].filter(Boolean)}
      />
      <PlayerSelectModal
        isOpen={showOffStrikeModal}
        onClose={() => setShowOffStrikeModal(false)}
        onConfirm={handleOffStrikeSelect}
        players={battingTeamPlayers}
        title="Select Off-Strike Batsman"
        excludePlayers={[onStrike].filter(Boolean)}
      />
    </div>
  );
}
