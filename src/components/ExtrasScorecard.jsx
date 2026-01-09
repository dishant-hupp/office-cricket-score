export function ExtrasScorecard({ innings }) {
  if (!innings || !innings.balls) return null;

  // Calculate extras from balls
  let wideRuns = 0;
  let noBallRuns = 0;
  let wideCount = 0;
  let noBallCount = 0;

  for (const ball of innings.balls) {
    if (ball.extras === 'wide') {
      wideRuns += ball.runs;
      wideCount += 1;
    } else if (ball.extras === 'noBall') {
      noBallRuns += ball.runs;
      noBallCount += 1;
    }
  }

  const totalExtras = wideRuns + noBallRuns;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-3">Extras</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-3 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Count</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Runs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Wide</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{wideCount}</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{wideRuns}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">No Ball</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{noBallCount}</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{noBallRuns}</td>
            </tr>
            <tr className="bg-gray-100 font-semibold">
              <td className="border border-gray-300 px-3 py-2">Total Extras</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{wideCount + noBallCount}</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{totalExtras}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
