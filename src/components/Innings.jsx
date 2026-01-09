import { useState } from 'react';
import { Button } from './Button.jsx';
import { ScoreDisplay } from './ScoreDisplay.jsx';
import { WicketModal } from './WicketModal.jsx';
import { PlayerSelectModal } from './PlayerSelectModal.jsx';
import { BattingScorecard } from './BattingScorecard.jsx';
import { BowlingScorecard } from './BowlingScorecard.jsx';
import { ExtrasScorecard } from './ExtrasScorecard.jsx';
import { FallOfWickets } from './FallOfWickets.jsx';
import {
  addRuns,
  addWide,
  addNoBall,
  addWicket,
  addRunsWithWicket,
  startNewOver,
  endOver,
  undoLastBall,
  isInningsComplete
} from '../utils/matchLogic.js';
import { canUndo } from '../utils/validators.js';
import { createEmptyInnings } from '../utils/dataModel.js';

export function Innings({ matchConfig, inningsState, updateInnings, currentInningsIndex }) {
  const innings = inningsState.innings[currentInningsIndex];
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showNextPlayerModal, setShowNextPlayerModal] = useState(false);
  const [pendingWicketInfo, setPendingWicketInfo] = useState(null);
  const [pendingRuns, setPendingRuns] = useState(0);
  const [newBowler, setNewBowler] = useState('');

  // Check if new over needs bowler selection
  // Ask for bowler when:
  // 1. We're at the start of a new over (ball 1, 0 balls in current over) AND
  // 2. Innings is not complete AND
  // 3. Current over number is within allowed overs AND
  // 4. No bowler is currently set (or bowler is empty)
  const inningsNotComplete = !isInningsComplete(innings, matchConfig.config.totalOvers);
  const atStartOfNewOver = innings.currentBall === 1 && innings.ballsInCurrentOver === 0;
  const overWithinLimit = innings.currentOver <= matchConfig.config.totalOvers;
  const bowlerIsSet = innings.currentBowler && innings.currentBowler.trim() !== '';
  const needsBowlerSelection = atStartOfNewOver && inningsNotComplete && overWithinLimit && !bowlerIsSet;

  const handleRuns = (runs) => {
    try {
      const updatedInnings = addRuns(innings, runs, innings.onStrike);
      handleUpdateInnings(updatedInnings);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleWide = () => {
    try {
      const updatedInnings = addWide(innings, innings.onStrike);
      handleUpdateInnings(updatedInnings);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleNoBall = () => {
    try {
      const updatedInnings = addNoBall(innings, innings.onStrike);
      handleUpdateInnings(updatedInnings);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleWicket = (wicketInfo, runs = 0) => {
    try {
      // Check if we need to select next player (not all out)
      const dismissedBatsman = wicketInfo.batsman;
      const isAllOut = innings.wickets >= 9; // Will be 10 after this wicket
      
      if (isAllOut) {
        // All out - no need to select next player
        let updatedInnings;
        if (runs > 0) {
          updatedInnings = addRunsWithWicket(innings, runs, wicketInfo);
        } else {
          updatedInnings = addWicket(innings, wicketInfo);
        }
        updateInnings(updatedInnings);
        setShowWicketModal(false);
      } else {
        // Need to select next player
        setPendingWicketInfo(wicketInfo);
        setPendingRuns(runs);
        setShowWicketModal(false);
        setShowNextPlayerModal(true);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleNextPlayerSelect = (nextPlayer) => {
    try {
      let updatedInnings;
      if (pendingRuns > 0) {
        updatedInnings = addRunsWithWicket(innings, pendingRuns, pendingWicketInfo, nextPlayer);
      } else {
        updatedInnings = addWicket(innings, pendingWicketInfo, nextPlayer);
      }
      handleUpdateInnings(updatedInnings);
      setShowNextPlayerModal(false);
      setPendingWicketInfo(null);
      setPendingRuns(0);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUndo = () => {
    try {
      const validation = canUndo(innings);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      const updatedInnings = undoLastBall(innings);
      handleUpdateInnings(updatedInnings);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEndOver = () => {
    try {
      const updatedInnings = endOver(innings);
      handleUpdateInnings(updatedInnings);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleStartNewOver = () => {
    if (!newBowler.trim()) {
      alert('Please select a bowler');
      return;
    }
    try {
      const updatedInnings = startNewOver(innings, newBowler.trim());
      handleUpdateInnings(updatedInnings);
      setNewBowler('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateInnings = (updatedInnings) => {
    // Check if innings is complete (just for info, but don't auto-create next innings)
    const isComplete = isInningsComplete(updatedInnings, matchConfig.config.totalOvers);
    
    // Update the current innings
    updateInnings(currentInningsIndex, updatedInnings);
    
    if (isComplete) {
      // Show a message that innings is complete
      // User can manually add another innings if needed
      console.log('Innings completed');
    }
  };

  const canUndoBall = canUndo(innings).valid;
  const canEndOver = innings.ballsInCurrentOver === 6;

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      <ScoreDisplay innings={innings} matchConfig={matchConfig} inningsState={inningsState} currentInningsIndex={currentInningsIndex} />

      {/* Bowler Selection for New Over */}
      {needsBowlerSelection && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">
            Select Bowler for Over {innings.currentOver + 1}
          </h3>
          <div className="flex gap-2">
            <select
              value={newBowler}
              onChange={(e) => setNewBowler(e.target.value)}
              className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select bowler...</option>
              {innings.bowlingTeamPlayers.map((player, idx) => (
                <option key={idx} value={player}>{player}</option>
              ))}
            </select>
            <Button onClick={handleStartNewOver} disabled={!newBowler.trim()}>
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Scoring Buttons */}
      {!needsBowlerSelection && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Runs</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <Button
                  key={runs}
                  variant="run"
                  onClick={() => handleRuns(runs)}
                  className="text-2xl font-bold"
                >
                  {runs}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Extras</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="extra" onClick={handleWide} className="text-xl">
                Wide
              </Button>
              <Button variant="extra" onClick={handleNoBall} className="text-xl">
                No Ball
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="danger" onClick={() => setShowWicketModal(true)} className="text-xl">
                Wicket
              </Button>
              <Button
                variant="secondary"
                onClick={handleUndo}
                disabled={!canUndoBall}
                className="text-xl"
              >
                Undo Last Ball
              </Button>
            </div>
            {canEndOver && (
              <div className="mt-3">
                <Button variant="success" onClick={handleEndOver} className="w-full text-xl">
                  End Over
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Scorecards */}
      <div className="mt-8">
        <BattingScorecard innings={innings} />
        <BowlingScorecard innings={innings} />
        <ExtrasScorecard innings={innings} />
        <FallOfWickets innings={innings} />
      </div>

      {/* Wicket Modal */}
      <WicketModal
        isOpen={showWicketModal}
        onClose={() => setShowWicketModal(false)}
        onConfirm={handleWicket}
        innings={innings}
        bowlingTeamPlayers={innings.bowlingTeamPlayers}
      />

      {/* Next Player Selection Modal */}
      <PlayerSelectModal
        isOpen={showNextPlayerModal}
        onClose={() => {
          setShowNextPlayerModal(false);
          setPendingWicketInfo(null);
          setPendingRuns(0);
        }}
        onConfirm={handleNextPlayerSelect}
        players={innings.battingTeamPlayers}
        title="Select Next Batsman"
        excludePlayers={[innings.onStrike, innings.offStrike, ...innings.balls.filter(b => b.wicket).map(b => b.wicket.batsman)]}
      />
    </div>
  );
}
