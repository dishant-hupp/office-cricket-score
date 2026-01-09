import { useState } from 'react';
import { Button } from './Button.jsx';
import { isValidWicketType } from '../utils/validators.js';

const WICKET_TYPES = [
  { type: 'bowled', label: 'Bowled' },
  { type: 'caught', label: 'Caught' },
  { type: 'runOut', label: 'Run Out' },
  { type: 'lbw', label: 'LBW' },
  { type: 'stumped', label: 'Stumped' },
  { type: 'hitWicket', label: 'Hit Wicket' },
  { type: 'retiredHurt', label: 'Retired Hurt' }
];

export function WicketModal({ isOpen, onClose, onConfirm, innings, bowlingTeamPlayers }) {
  const [selectedType, setSelectedType] = useState(null);
  const [dismissedBatsman, setDismissedBatsman] = useState(innings?.onStrike || '');
  const [fielder, setFielder] = useState('');
  const [runs, setRuns] = useState('0');

  if (!isOpen) return null;

  const needsFielder = selectedType === 'caught' || selectedType === 'runOut' || selectedType === 'stumped';
  
  // Update dismissed batsman when modal opens or innings changes
  if (innings && dismissedBatsman !== innings.onStrike && dismissedBatsman !== innings.offStrike) {
    setDismissedBatsman(innings.onStrike);
  }

  const handleConfirm = () => {
    if (!selectedType || !isValidWicketType(selectedType)) {
      alert('Please select a wicket type');
      return;
    }

    if (needsFielder && !fielder.trim()) {
      alert('Please enter fielder name');
      return;
    }

    const wicketInfo = {
      type: selectedType,
      batsman: dismissedBatsman,
      bowler: selectedType === 'runOut' ? null : innings.currentBowler,
      fielder: needsFielder ? fielder.trim() : null
    };

    const runsValue = parseInt(runs) || 0;
    
    if (runsValue > 0) {
      onConfirm(wicketInfo, runsValue);
    } else {
      onConfirm(wicketInfo);
    }

    // Reset form
    setSelectedType(null);
    setDismissedBatsman(innings.onStrike);
    setFielder('');
    setRuns('0');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Select Wicket Type</h2>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {WICKET_TYPES.map(wt => (
            <Button
              key={wt.type}
              variant={selectedType === wt.type ? 'primary' : 'secondary'}
              onClick={() => setSelectedType(wt.type)}
              className="text-sm"
            >
              {wt.label}
            </Button>
          ))}
        </div>

        {selectedType && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Dismissed Batsman
              </label>
              <select
                value={dismissedBatsman}
                onChange={(e) => setDismissedBatsman(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value={innings.onStrike}>
                  {innings.onStrike} (On Strike)
                </option>
                <option value={innings.offStrike}>
                  {innings.offStrike} (Off Strike)
                </option>
              </select>
            </div>

            {needsFielder && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Fielder Name
                </label>
                <input
                  type="text"
                  value={fielder}
                  onChange={(e) => setFielder(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter fielder name"
                />
              </div>
            )}

            {selectedType === 'runOut' && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Runs Scored (if any)
                </label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={runs}
                  onChange={(e) => setRuns(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {innings.isFreeHitPending && selectedType !== 'runOut' && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded">
                ⚠️ Cannot take {selectedType} on a free hit. Only run out is allowed.
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
            className="flex-1"
            disabled={!selectedType || (needsFielder && !fielder.trim())}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
