import { useReducer, useState, useEffect } from 'react'
import { TeamSelector } from './components/TeamSelector.jsx'
import { FieldView } from './components/FieldView.jsx'
import { PlayPicker } from './components/PlayPicker.jsx'
import { DriveResult } from './components/DriveResult.jsx'
import { driveReducer, initialDriveState } from './engine/drive.js'

function App() {
  const [gamePhase, setGamePhase] = useState('team_select')
  const [offenseTeam, setOffenseTeam] = useState(null)
  const [defenseTeam, setDefenseTeam] = useState(null)
  const [drive, dispatch] = useReducer(driveReducer, initialDriveState)

  useEffect(() => {
    if (drive.result !== null && gamePhase === 'drive') {
      setGamePhase('result')
    }
  }, [drive.result, gamePhase])

  function handleStart(offense, defense) {
    setOffenseTeam(offense)
    setDefenseTeam(defense)
    setGamePhase('drive')
  }

  function handlePlayAgain() {
    dispatch({ type: 'RESET' })
    setOffenseTeam(null)
    setDefenseTeam(null)
    setGamePhase('team_select')
  }

  if (gamePhase === 'team_select') {
    return <TeamSelector onStart={handleStart} />
  }

  if (gamePhase === 'result') {
    return <DriveResult drive={drive} onPlayAgain={handlePlayAgain} />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start px-4 py-10 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-700">Drive</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {offenseTeam?.year} {offenseTeam?.city} {offenseTeam?.name} vs{' '}
          {defenseTeam?.year} {defenseTeam?.city} {defenseTeam?.name}
        </p>
      </div>
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start justify-center">
        <FieldView defenseTeam={defenseTeam} />
        <PlayPicker
          drive={drive}
          dispatch={dispatch}
          offenseTeam={offenseTeam}
          defenseTeam={defenseTeam}
        />
      </div>
    </div>
  )
}

export default App
