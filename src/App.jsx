import { useReducer, useState, useEffect, useRef } from 'react'
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
  const [displayDrive, setDisplayDrive] = useState(initialDriveState)
  const [selectedPlay, setSelectedPlay] = useState(null)
  const delayRef = useRef(null)

  useEffect(() => {
    clearTimeout(delayRef.current)
    if (drive.plays.length === 0) {
      setDisplayDrive(drive)
    } else {
      delayRef.current = setTimeout(() => setDisplayDrive(drive), 1600)
    }
    return () => clearTimeout(delayRef.current)
  }, [drive])

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
    setSelectedPlay(null)
    setGamePhase('team_select')
  }

  if (gamePhase === 'team_select') {
    return <TeamSelector onStart={handleStart} />
  }

  if (gamePhase === 'result') {
    return <DriveResult drive={drive} onPlayAgain={handlePlayAgain} />
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <FieldView
        defenseTeam={defenseTeam}
        drive={displayDrive}
        selectedPlay={selectedPlay}
        lastPlay={drive.plays[drive.plays.length - 1] ?? null}
        playResultKey={drive.plays.length}
      />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <PlayPicker
          drive={drive}
          dispatch={dispatch}
          offenseTeam={offenseTeam}
          defenseTeam={defenseTeam}
          onSelectPlay={setSelectedPlay}
        />
      </div>
    </div>
  )
}

export default App
