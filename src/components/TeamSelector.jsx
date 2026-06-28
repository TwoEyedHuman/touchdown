import { useState } from 'react'
import { teams } from '../config/teams.js'

const OFFENSE_STAT_LABELS = {
  runAttack: 'Run Attack',
  passAttack: 'Pass Attack',
  olStrength: 'OL Strength',
  skillPlayers: 'Skill Players',
}

const DEFENSE_STAT_LABELS = {
  runStop: 'Run Stop',
  passCoverage: 'Pass Coverage',
  passRush: 'Pass Rush',
  secondary: 'Secondary',
}

function RatingBar({ label, value }) {
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-green-600 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function TeamCard({ team, side }) {
  const stats = side === 'offense' ? team.offense : team.defense
  const labels = side === 'offense' ? OFFENSE_STAT_LABELS : DEFENSE_STAT_LABELS
  const accentClass = side === 'offense' ? 'bg-blue-600' : 'bg-red-600'

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 w-full max-w-sm mx-auto">
      <div className={`${accentClass} text-white rounded-xl px-4 py-2 text-center`}>
        <p className="text-xs uppercase tracking-widest opacity-80">
          {side === 'offense' ? 'Your Offense' : 'Opponent Defense'}
        </p>
        <p className="text-xl font-bold">
          {team.city} {team.name}
        </p>
        <p className="text-sm opacity-80">{team.year}</p>
      </div>
      <div>
        {Object.entries(stats).map(([key, value]) => (
          <RatingBar key={key} label={labels[key]} value={value} />
        ))}
      </div>
    </div>
  )
}

function pickDefense(offenseId) {
  const pool = teams.filter((t) => t.id !== offenseId)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function TeamSelector({ onStart }) {
  const [offenseId, setOffenseId] = useState('')
  const [defenseTeam, setDefenseTeam] = useState(null)

  const offenseTeam = teams.find((t) => t.id === offenseId) ?? null

  function handleOffenseChange(e) {
    const id = e.target.value
    setOffenseId(id)
    setDefenseTeam(id ? pickDefense(id) : null)
  }

  function handleStart() {
    if (offenseTeam && defenseTeam) {
      onStart(offenseTeam, defenseTeam)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start px-4 py-10 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-1">Touchdown</h1>
        <p className="text-gray-500 text-sm">Choose your team to begin</p>
      </div>

      <div className="w-full max-w-sm">
        <label htmlFor="offense-select" className="block text-sm font-semibold text-gray-700 mb-1">
          Select Your Offense
        </label>
        <select
          id="offense-select"
          value={offenseId}
          onChange={handleOffenseChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">— Pick a team —</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.year} {t.city} {t.name}
            </option>
          ))}
        </select>
      </div>

      {offenseTeam && defenseTeam && (
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <TeamCard team={offenseTeam} side="offense" />
          <TeamCard team={defenseTeam} side="defense" />
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={!offenseTeam}
        className="mt-2 px-8 py-3 rounded-xl text-white font-bold text-lg transition-colors
          bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Start Drive
      </button>
    </div>
  )
}
