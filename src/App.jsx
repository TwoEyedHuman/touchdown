import { useState } from 'react'
import { TeamSelector } from './components/TeamSelector.jsx'

function App() {
  const [screen, setScreen] = useState('team-select')
  const [offenseTeam, setOffenseTeam] = useState(null)
  const [defenseTeam, setDefenseTeam] = useState(null)

  function handleStart(offense, defense) {
    setOffenseTeam(offense)
    setDefenseTeam(defense)
    setScreen('game')
  }

  if (screen === 'team-select') {
    return <TeamSelector onStart={handleStart} />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-700">Drive starting…</h1>
        <p className="text-gray-500 mt-2">
          {offenseTeam?.year} {offenseTeam?.city} {offenseTeam?.name} vs{' '}
          {defenseTeam?.year} {defenseTeam?.city} {defenseTeam?.name}
        </p>
      </div>
    </div>
  )
}

export default App
