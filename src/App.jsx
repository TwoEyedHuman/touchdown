import { useReducer, useState } from 'react'
import { TeamSelector } from './components/TeamSelector.jsx'
import { FieldView } from './components/FieldView.jsx'
import { PlayPicker } from './components/PlayPicker.jsx'
import { DriveResult } from './components/DriveResult.jsx'
import { driveReducer, initialDriveState } from './engine/drive.js'

function App() {
  const [screen, setScreen] = useState('team-select')
  const [offenseTeam, setOffenseTeam] = useState(null)
  const [defenseTeam, setDefenseTeam] = useState(null)
  const [drive, dispatch] = useReducer(driveReducer, initialDriveState)

  function handleStart(offense, defense) {
    setOffenseTeam(offense)
    setDefenseTeam(defense)
    setScreen('game')
  }

  function handlePlayAgain() {
    dispatch({ type: 'RESET' })
    setScreen('team-select')
  }

  if (screen === 'team-select') {
    return <TeamSelector onStart={handleStart} />
  }

  if (drive.result !== null) {
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
      <FieldView defenseTeam={defenseTeam} />
      <PlayPicker
        drive={drive}
        dispatch={dispatch}
        offenseTeam={offenseTeam}
        defenseTeam={defenseTeam}
      />
    </div>
  )
}

export default App
