const DOWN_LABEL = ['', '1st', '2nd', '3rd', '4th']

function yardLabel(yards) {
  if (yards > 0) return `+${yards} yd${yards !== 1 ? 's' : ''}`
  if (yards < 0) return `${yards} yd${Math.abs(yards) !== 1 ? 's' : ''}`
  return 'no gain'
}

function eventLabel(event) {
  if (event === 'sack') return 'sack'
  if (event === 'tackle_for_loss') return 'TFL'
  return null
}

export function DriveResult({ drive, onPlayAgain }) {
  const isTouchdown = drive.result === 'touchdown'
  const playCount = drive.plays.length

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start px-4 py-10 gap-6">
      <div className={`w-full max-w-lg rounded-2xl shadow-md px-6 py-6 text-center ${
        isTouchdown ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'
      }`}>
        <p className="text-4xl font-black mb-1">
          {isTouchdown ? 'Touchdown! 🏈' : 'Turnover on Downs'}
        </p>
        <p className="text-sm opacity-75">
          {playCount} play{playCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-2 text-left font-semibold">Play</th>
              <th className="px-4 py-2 text-left font-semibold">Down</th>
              <th className="px-4 py-2 text-right font-semibold">Yards</th>
            </tr>
          </thead>
          <tbody>
            {drive.plays.map((play, i) => {
              const label = eventLabel(play.event)
              return (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">
                    <span className="font-semibold text-gray-800">{play.playName}</span>
                    {label && (
                      <span className="ml-2 text-xs text-amber-600 font-semibold">[{label}]</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                    {DOWN_LABEL[play.down]} &amp; {play.yardsToGo}
                  </td>
                  <td className={`px-4 py-2 text-right font-semibold ${
                    play.yardsGained > 0
                      ? 'text-green-600'
                      : play.yardsGained < 0
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}>
                    {yardLabel(play.yardsGained)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={onPlayAgain}
        className="px-8 py-3 rounded-xl text-white font-bold text-lg bg-green-700 hover:bg-green-800 transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}
