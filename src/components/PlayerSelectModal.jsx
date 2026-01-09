import { useState } from 'react';
import { Button } from './Button.jsx';

export function PlayerSelectModal({ isOpen, onClose, onConfirm, players, title, excludePlayers = [] }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');

  if (!isOpen) return null;

  const availablePlayers = players.filter(p => !excludePlayers.includes(p));

  const handleConfirm = () => {
    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }
    onConfirm(selectedPlayer);
    setSelectedPlayer('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Select Player</label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Choose a player...</option>
            {availablePlayers.map((player, idx) => (
              <option key={idx} value={player}>{player}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            className="flex-1"
            disabled={!selectedPlayer}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
