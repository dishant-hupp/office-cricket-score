import { getFallOfWickets } from '../utils/matchLogic.js';

export function FallOfWickets({ innings }) {
  if (!innings) return null;

  const fallOfWickets = getFallOfWickets(innings);

  if (fallOfWickets.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Fall of Wickets</h3>
        <div className="text-gray-500">No wickets fallen yet</div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-3">Fall of Wickets</h3>
      <div className="space-y-2">
        {fallOfWickets.map((fow, idx) => (
          <div key={idx} className="bg-gray-100 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{fow.wicket}. {fow.batsman}</span>
              <span className="text-gray-600">{fow.score}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{fow.howOut}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
