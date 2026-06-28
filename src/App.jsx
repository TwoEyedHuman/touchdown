import { useState } from 'react'
import { TeamSelector } from './components/TeamSelector.jsx'
import { FieldView } from './components/FieldView.jsx'

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start px-4 py-10 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-700">Drive starting…</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {offenseTeam?.year} {offenseTeam?.city} {offenseTeam?.name} vs{' '}
          {defenseTeam?.year} {defenseTeam?.city} {defenseTeam?.name}
        </p>
      </div>
      <FieldView defenseTeam={defenseTeam} />
    </div>
  )
}

export default App
