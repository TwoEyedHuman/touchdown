import { useState, useEffect, useRef } from 'react'
import { plays } from '../config/plays.js'

function pickPlays() {
  return [...plays].sort(() => Math.random() - 0.5).slice(0, 3)
}

function yardLabel(yards) {
  if (yards > 0) return `+${yards} yd${yards !== 1 ? 's' : ''}`
  if (yards < 0) return `${yards} yd${Math.abs(yards) !== 1 ? 's' : ''}`
  return 'no gain'
}

export function PlayPicker({ drive, dispatch, offenseTeam, defenseTeam, onSelectPlay }) {
  const [chosen, setChosen] = useState(() => pickPlays())
  const [previewedId, setPreviewedId] = useState(() => chosen[0].id)
  const [confirmedId, setConfirmedId] = useState(null)
  const lastPickedCountRef = useRef(0)

  const playsCount = drive.plays.length

  // Keep FieldView in sync with whichever play is previewed
  useEffect(() => {
    const play = chosen.find((p) => p.id === previewedId)
    onSelectPlay?.(play ?? null)
  }, [previewedId, chosen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (playsCount > lastPickedCountRef.current) {
      lastPickedCountRef.current = playsCount
      const id = setTimeout(() => {
        const newChosen = pickPlays()
        setChosen(newChosen)
        setPreviewedId(newChosen[0].id)
        setConfirmedId(null)
      }, 400)
      return () => clearTimeout(id)
    }
  }, [playsCount])

  if (drive.result !== null) return null

  const lastPlay = drive.plays[drive.plays.length - 1] ?? null
  const isLocked = confirmedId !== null

  function handlePick(play) {
    if (isLocked) return
    if (previewedId === play.id) {
      setConfirmedId(play.id)
      dispatch({ type: 'CALL_PLAY', payload: { play, offenseTeam, defenseTeam } })
    } else {
      setPreviewedId(play.id)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto px-3 pb-4 pt-1 flex flex-col gap-1.5">
      {lastPlay && (
        <div className="bg-black/55 backdrop-blur-md rounded-xl px-4 py-2 text-sm text-white flex items-center gap-2">
          <span className="font-semibold opacity-80">{lastPlay.playName}</span>
          <span className="opacity-50">—</span>
          <span className={
            lastPlay.yardsGained > 0
              ? 'text-green-400 font-semibold'
              : lastPlay.yardsGained < 0
              ? 'text-red-400 font-semibold'
              : 'text-white/70'
          }>
            {yardLabel(lastPlay.yardsGained)}
          </span>
          {lastPlay.event && (
            <span className="text-xs text-amber-400 font-semibold">[{lastPlay.event}]</span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {chosen.map((play) => {
          const isConfirmed = confirmedId === play.id
          const isPreviewed = !isLocked && previewedId === play.id
          return (
            <button
              key={play.id}
              onClick={() => handlePick(play)}
              disabled={isLocked}
              className={`w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg px-4 py-2.5 text-left transition-all
                ${isConfirmed
                  ? 'ring-2 ring-green-500 opacity-90 cursor-not-allowed'
                  : isLocked
                  ? 'opacity-35 cursor-not-allowed'
                  : isPreviewed
                  ? 'ring-2 ring-amber-400 bg-white shadow-xl cursor-pointer'
                  : 'opacity-70 hover:opacity-100 hover:bg-white hover:shadow-xl hover:ring-2 hover:ring-amber-300 active:scale-[0.98] cursor-pointer'
                }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-gray-800 text-sm">{play.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                  ${play.type === 'run'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                  }`}>
                  {play.type}
                </span>
                {isPreviewed && (
                  <span className="ml-auto text-xs text-amber-600 font-semibold">tap to confirm →</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{play.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
