import { useState, useEffect, useRef } from 'react'
import { plays } from '../config/plays.js'

function pickPlays() {
  return [...plays].sort(() => Math.random() - 0.5).slice(0, 3)
}

const DOWN_LABEL = ['', '1st', '2nd', '3rd', '4th']

function yardLabel(yards) {
  if (yards > 0) return `+${yards} yd${yards !== 1 ? 's' : ''}`
  if (yards < 0) return `${yards} yd${Math.abs(yards) !== 1 ? 's' : ''}`
  return 'no gain'
}

function fieldPosLabel(pos) {
  if (pos <= 50) return `Own ${pos}`
  return `Opp ${100 - pos}`
}

export function PlayPicker({ drive, dispatch, offenseTeam, defenseTeam }) {
  const [chosen, setChosen] = useState(() => pickPlays())
  const [selected, setSelected] = useState(null)
  const lastPickedCountRef = useRef(0)

  const playsCount = drive.plays.length

  // Delay new plays by 400ms so the disabled/selected state is visible first
  useEffect(() => {
    if (playsCount > lastPickedCountRef.current) {
      lastPickedCountRef.current = playsCount
      const id = setTimeout(() => {
        setChosen(pickPlays())
        setSelected(null)
      }, 400)
      return () => clearTimeout(id)
    }
  }, [playsCount])

  if (drive.result !== null) return null

  const lastPlay = drive.plays[drive.plays.length - 1] ?? null

  function handlePick(play) {
    if (selected !== null) return
    setSelected(play.id)
    dispatch({ type: 'CALL_PLAY', payload: { play, offenseTeam, defenseTeam } })
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-4">
      <div className="bg-white rounded-2xl shadow-md px-5 py-3 flex justify-between items-center">
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Down</p>
          <p className="text-xl font-bold text-gray-800">{DOWN_LABEL[drive.down]}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">To Go</p>
          <p className="text-xl font-bold text-gray-800">{drive.yardsToGo}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Field Pos</p>
          <p className="text-xl font-bold text-gray-800">{fieldPosLabel(drive.fieldPosition)}</p>
        </div>
      </div>

      {lastPlay && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600">
          <span className="font-semibold">{lastPlay.playName}</span>
          {' — '}
          <span className={
            lastPlay.yardsGained > 0
              ? 'text-green-600 font-semibold'
              : lastPlay.yardsGained < 0
              ? 'text-red-500 font-semibold'
              : ''
          }>
            {yardLabel(lastPlay.yardsGained)}
          </span>
          {lastPlay.event && (
            <span className="ml-2 text-xs text-amber-600 font-semibold">[{lastPlay.event}]</span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {chosen.map((play) => {
          const isDisabled = selected !== null
          const isSelected = selected === play.id
          return (
            <button
              key={play.id}
              onClick={() => handlePick(play)}
              disabled={isDisabled}
              className={`bg-white rounded-2xl shadow-md px-5 py-4 text-left transition-all
                ${isDisabled
                  ? `opacity-50 cursor-not-allowed${isSelected ? ' ring-2 ring-green-600 !opacity-80' : ''}`
                  : 'hover:shadow-lg hover:ring-2 hover:ring-green-500 cursor-pointer'
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">{play.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                  ${play.type === 'run'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                  }`}>
                  {play.type}
                </span>
              </div>
              <p className="text-sm text-gray-500">{play.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
