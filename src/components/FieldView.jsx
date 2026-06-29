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

// [x, yardsAheadOfScrimmage, label]
const DEFENDERS = {
  '4-3': [
    [90, 9, 'DE'], [125, 9, 'DT'], [165, 9, 'DT'], [200, 9, 'DE'],
    [105, 20, 'OLB'], [148, 21, 'MLB'], [185, 20, 'OLB'],
    [50, 30, 'CB'], [240, 30, 'CB'],
    [132, 41, 'FS'], [162, 41, 'SS'],
  ],
  '3-4': [
    [110, 9, 'DE'], [148, 9, 'NT'], [180, 9, 'DE'],
    [78, 20, 'OLB'], [126, 21, 'ILB'], [165, 21, 'ILB'], [212, 20, 'OLB'],
    [50, 29, 'CB'], [240, 29, 'CB'],
    [132, 41, 'FS'], [162, 41, 'SS'],
  ],
  Nickel: [
    [90, 9, 'DE'], [125, 9, 'DT'], [165, 9, 'DT'], [200, 9, 'DE'],
    [115, 20, 'OLB'], [178, 20, 'OLB'],
    [50, 30, 'CB'], [148, 28, 'NB'], [240, 30, 'CB'],
    [128, 41, 'FS'], [165, 41, 'SS'],
  ],
  Dime: [
    [90, 9, 'DE'], [125, 9, 'DT'], [165, 9, 'DT'], [200, 9, 'DE'],
    [148, 22, 'MLB'],
    [50, 31, 'CB'], [150, 28, 'NB'], [240, 31, 'CB'],
    [105, 41, 'FS'], [148, 41, 'SS'], [188, 41, 'DB'],
  ],
}

// [x, yardsBehindScrimmage, label]
const OFFENSE_FORMATIONS = {
  run: [
    [70, 0.5, 'WR'],
    [95, 0.5, 'LT'], [118, 0.5, 'LG'], [148, 0.5, 'C'], [178, 0.5, 'RG'], [203, 0.5, 'RT'],
    [228, 0.5, 'TE'],
    [148, 1.8, 'QB'],
    [148, 4.5, 'FB'],
    [148, 7.5, 'RB'],
  ],
  pass: [
    [18, 0.5, 'WR'], [55, 1, 'SL'],
    [95, 0.5, 'LT'], [118, 0.5, 'LG'], [148, 0.5, 'C'], [178, 0.5, 'RG'], [203, 0.5, 'RT'],
    [235, 0.5, 'TE'],
    [268, 0.5, 'WR'],
    [148, 5.5, 'QB'],
  ],
}

function deriveFormation(defense) {
  return FORMATION_BY_RATING.reduce((best, candidate) =>
    defense[candidate.key] > defense[best.key] ? candidate : best
  ).name
}

const DOWN_LABELS = ['1ST', '2ND', '3RD', '4TH']
const W = 300
const H = 560
const SCRIMMAGE_Y = 380
const PX_PER_YARD = 7.6
const ORIGIN_YARD = 25
const CAM_LOCK_YARD = 85
const ENDZONE_DEPTH = 10
const TRANSITION = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)'

// Absolute yard → y position in field-group space (origin at yard 25 = y 380)
function yField(absYard) {
  return SCRIMMAGE_Y - (absYard - ORIGIN_YARD) * PX_PER_YARD
}

function fieldPosText(pos) {
  return pos <= 50 ? `OWN ${pos}` : `OPP ${100 - pos}`
}

export function FieldView({ defenseTeam, drive, selectedPlay }) {
  const formation = deriveFormation(defenseTeam.defense)
  const ratingKey = FORMATION_BY_RATING.find((f) => f.name === formation).key
  const rating = defenseTeam.defense[ratingKey]
  const dotOpacity = 0.3 + (rating / 99) * 0.7

  const { fieldPosition = 25, down = 1, yardsToGo = 10 } = drive ?? {}

  // Layer 1 (background): follows ball, locks when ball reaches opp 15
  const camYard = Math.min(fieldPosition, CAM_LOCK_YARD)
  const bgTranslateY = (camYard - ORIGIN_YARD) * PX_PER_YARD

  // Layer 2 (players): stationary until camera locks, then slides with ball
  const playerTranslateY = fieldPosition > CAM_LOCK_YARD
    ? -(fieldPosition - CAM_LOCK_YARD) * PX_PER_YARD
    : 0

  const firstDownAbsYard = fieldPosition + yardsToGo
  const isGoal = firstDownAbsYard >= 100
  const distToEndzone = 100 - fieldPosition

  // Background: alternating 10-yard stripes at absolute positions
  const fieldStripes = []
  for (let yardBase = 0; yardBase <= 100; yardBase += 10) {
    if ((yardBase / 10) % 2 !== 1) continue
    fieldStripes.push({ y: yField(yardBase + 10), height: 10 * PX_PER_YARD })
  }

  const yardMarkers = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((yard) => ({
    yard,
    y: yField(yard),
    label: yard <= 50 ? yard : 100 - yard,
    isMidfield: yard === 50,
  }))

  const hashYards = [10, 20, 30, 40, 50, 60, 70, 80, 90]

  // End zone rect
  const ezTopY = yField(100 + ENDZONE_DEPTH)
  const ezBotY = yField(100)
  const ezTextY = (ezTopY + ezBotY) / 2

  // Player-layer positions (all in SCRIMMAGE_Y = 380 coordinate space)
  const firstDownY = SCRIMMAGE_Y - yardsToGo * PX_PER_YARD

  const renderedDefenders = DEFENDERS[formation].map(([x, offset, label]) => {
    const clamped = Math.min(offset, Math.max(0.5, distToEndzone - 0.5))
    return { x, y: SCRIMMAGE_Y - clamped * PX_PER_YARD, label }
  })

  const offensePlayers = selectedPlay
    ? (OFFENSE_FORMATIONS[selectedPlay.type] ?? OFFENSE_FORMATIONS.run).map(([x, behind, label]) => ({
        x,
        y: SCRIMMAGE_Y + behind * PX_PER_YARD,
        label,
      }))
    : null

  const downLabel = DOWN_LABELS[down - 1]
  const distLabel = isGoal ? 'GOAL' : yardsToGo

  return (
    <div className="absolute inset-0 bg-[#1a5c1a]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label={`${defenseTeam.city} ${defenseTeam.name} ${formation} defensive formation`}
      >
        <rect width={W} height={H} fill="#1a5c1a" />

        {/* Layer 1: scrolling field background */}
        <g style={{ transform: `translateY(${bgTranslateY}px)`, transition: TRANSITION }}>
          {fieldStripes.map((s, i) => (
            <rect key={i} x="0" y={s.y} width={W} height={s.height} fill="#1d641d" />
          ))}

          <rect x="0" y={ezTopY} width={W} height={ezBotY - ezTopY} fill="#1e3a6e" />
          <text
            x={W / 2} y={ezTextY}
            textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="15" fontWeight="bold"
            fontFamily="sans-serif" letterSpacing="4" opacity="0.75"
          >
            END ZONE
          </text>

          {yardMarkers.map(({ yard, y, label, isMidfield }) => (
            <g key={yard}>
              <line x1="0" y1={y} x2={W} y2={y}
                stroke="white"
                strokeWidth={isMidfield ? 1.5 : 1}
                strokeOpacity={isMidfield ? 0.55 : 0.35}
              />
              <text x="8" y={y + 13} fill="white" fontSize="11"
                fontFamily="sans-serif" opacity={isMidfield ? 0.75 : 0.5}>
                {label}
              </text>
              <text x="292" y={y + 13} textAnchor="end" fill="white" fontSize="11"
                fontFamily="sans-serif" opacity={isMidfield ? 0.75 : 0.5}>
                {label}
              </text>
            </g>
          ))}

          {hashYards.flatMap((yard) =>
            [105, 125, 145, 165, 185].map((x) => (
              <line key={`${x}-${yard}`}
                x1={x} y1={yField(yard) - 6} x2={x} y2={yField(yard) + 6}
                stroke="white" strokeWidth="1" strokeOpacity="0.2" />
            ))
          )}
        </g>

        {/* Layer 2: players — stationary when camera follows, slides near end zone */}
        <g style={{ transform: `translateY(${playerTranslateY}px)`, transition: TRANSITION }}>
          {!isGoal && (
            <g>
              <line x1="0" y1={firstDownY} x2={W} y2={firstDownY}
                stroke="#facc15" strokeWidth="3" strokeOpacity="0.92" />
              <rect x="265" y={firstDownY - 14} width="30" height="16" rx="2"
                fill="#facc15" fillOpacity="0.92" />
              <text x="280" y={firstDownY - 2} textAnchor="middle"
                fill="#111" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                1ST
              </text>
            </g>
          )}

          <line x1="0" y1={SCRIMMAGE_Y} x2={W} y2={SCRIMMAGE_Y}
            stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="10 6" strokeOpacity="0.85" />

          {offensePlayers && offensePlayers.map(({ x, y, label }, i) => (
            <g key={i} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.4s ease' }}>
              <circle cx={0} cy={0} r={12}
                fill="#3b82f6" fillOpacity="0.85"
                stroke="white" strokeWidth="1.5" strokeOpacity="0.75" />
              <text x={0} y={4} textAnchor="middle"
                fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
                {label}
              </text>
            </g>
          ))}

          {renderedDefenders.map(({ x, y, label }, i) => (
            <g key={i} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
              <circle cx={0} cy={0} r={15}
                fill="#ef4444" fillOpacity={dotOpacity}
                stroke="white" strokeWidth="1.5" strokeOpacity="0.65" />
              <text x={0} y={4} textAnchor="middle"
                fill="white" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
                {label}
              </text>
            </g>
          ))}
        </g>

        {/* Fixed UI */}
        <text x="8" y="548" fill="white"
          fontSize="12" fontFamily="sans-serif" opacity="0.6" fontWeight="bold">
          {formation}
        </text>

        <g>
          <rect x="5" y="10" width="110" height="42" rx="4" fill="#000" fillOpacity="0.72" />
          <text x="60" y="28" textAnchor="middle" fill="white"
            fontSize="13" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">
            {downLabel} &amp; {distLabel}
          </text>
          <text x="60" y="44" textAnchor="middle" fill="#aaaaaa"
            fontSize="10" fontFamily="sans-serif">
            {fieldPosText(fieldPosition)} · {RATING_LABEL[ratingKey]} {rating}
          </text>
        </g>
      </svg>
    </div>
  )
}
