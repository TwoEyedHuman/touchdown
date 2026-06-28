const FORMATION_BY_RATING = [
  { name: '4-3', key: 'runStop' },
  { name: '3-4', key: 'passRush' },
  { name: 'Nickel', key: 'passCoverage' },
  { name: 'Dime', key: 'secondary' },
]

const RATING_LABEL = {
  runStop: 'Run Stop',
  passRush: 'Pass Rush',
  passCoverage: 'Pass Coverage',
  secondary: 'Secondary',
}

// [x, y, label] in 300×170 viewBox. Scrimmage line at y=140.
const DEFENDERS = {
  '4-3': [
    [90, 115, 'DE'], [125, 115, 'DT'], [165, 115, 'DT'], [200, 115, 'DE'],
    [105, 83, 'OLB'], [148, 80, 'MLB'], [185, 83, 'OLB'],
    [50, 55, 'CB'], [240, 55, 'CB'],
    [132, 25, 'FS'], [162, 25, 'SS'],
  ],
  '3-4': [
    [110, 115, 'DE'], [148, 115, 'NT'], [180, 115, 'DE'],
    [78, 82, 'OLB'], [126, 79, 'ILB'], [165, 79, 'ILB'], [212, 82, 'OLB'],
    [50, 53, 'CB'], [240, 53, 'CB'],
    [132, 23, 'FS'], [162, 23, 'SS'],
  ],
  Nickel: [
    [90, 115, 'DE'], [125, 115, 'DT'], [165, 115, 'DT'], [200, 115, 'DE'],
    [115, 83, 'OLB'], [178, 83, 'OLB'],
    [50, 55, 'CB'], [148, 60, 'NB'], [240, 55, 'CB'],
    [128, 23, 'FS'], [165, 23, 'SS'],
  ],
  Dime: [
    [90, 115, 'DE'], [125, 115, 'DT'], [165, 115, 'DT'], [200, 115, 'DE'],
    [148, 88, 'MLB'],
    [50, 58, 'CB'], [150, 60, 'NB'], [240, 58, 'CB'],
    [105, 25, 'FS'], [148, 25, 'SS'], [188, 25, 'DB'],
  ],
}

function deriveFormation(defense) {
  return FORMATION_BY_RATING.reduce((best, candidate) =>
    defense[candidate.key] > defense[best.key] ? candidate : best
  ).name
}

export function FieldView({ defenseTeam }) {
  const formation = deriveFormation(defenseTeam.defense)
  const ratingKey = FORMATION_BY_RATING.find((f) => f.name === formation).key
  const rating = defenseTeam.defense[ratingKey]
  const dotOpacity = 0.3 + (rating / 99) * 0.7
  const defenders = DEFENDERS[formation]

  return (
    <div className="w-full max-w-md mx-auto">
      <svg
        viewBox="0 0 300 170"
        className="w-full rounded-xl shadow-inner"
        aria-label={`${defenseTeam.city} ${defenseTeam.name} ${formation} defensive formation`}
      >
        {/* Field background */}
        <rect width="300" height="170" fill="#1a5c1a" rx="8" />

        {/* Alternating yard bands */}
        {[0, 56, 112].map((y) => (
          <rect key={y} x="0" y={y} width="300" height="28" fill="#1d641d" />
        ))}

        {/* Yard lines */}
        {[28, 56, 84, 112, 140].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y}
            stroke="white" strokeWidth="1" strokeOpacity="0.2" />
        ))}

        {/* Hash marks */}
        {[28, 56, 84, 112].map((y) =>
          [105, 125, 145, 165, 185].map((x) => (
            <line key={`${x}-${y}`} x1={x} y1={y - 4} x2={x} y2={y + 4}
              stroke="white" strokeWidth="1" strokeOpacity="0.2" />
          ))
        )}

        {/* Scrimmage line */}
        <line x1="0" y1="140" x2="300" y2="140"
          stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 5" strokeOpacity="0.85" />

        {/* Formation name */}
        <text x="150" y="160" textAnchor="middle" fill="white"
          fontSize="11" fontWeight="bold" fontFamily="sans-serif" opacity="0.85">
          {formation}
        </text>

        {/* Defender dots */}
        {defenders.map(([x, y, label], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={12}
              fill="#ef4444" fillOpacity={dotOpacity}
              stroke="white" strokeWidth="1.5" strokeOpacity="0.65" />
            <text x={x} y={y + 3} textAnchor="middle"
              fill="white" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
              {label}
            </text>
          </g>
        ))}
      </svg>

      <p className="text-center mt-2 text-sm text-gray-500">
        {defenseTeam.year} {defenseTeam.city} {defenseTeam.name}
        <span className="ml-1 text-xs text-gray-400">
          · {RATING_LABEL[ratingKey]} {rating}
        </span>
      </p>
    </div>
  )
}
