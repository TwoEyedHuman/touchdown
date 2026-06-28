/**
 * @param {number} min
 * @param {number} max
 * @returns {number} random integer in [min, max]
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Resolve a play call into yards gained.
 *
 * @param {import('../config/plays.js').Play} play
 * @param {import('../config/teams.js').Team} offenseTeam
 * @param {import('../config/teams.js').Team} defenseTeam
 * @returns {{ yardsGained: number, event: null | 'sack' | 'tackle_for_loss' }}
 */
export function resolvePlay(play, offenseTeam, defenseTeam) {
  const offenseScore =
    play.offenseKeys.reduce((sum, key) => sum + offenseTeam.offense[key], 0) /
    play.offenseKeys.length

  const defenseScore =
    play.defenseKeys.reduce((sum, key) => sum + defenseTeam.defense[key], 0) /
    play.defenseKeys.length

  // advantage in [-1, 1], scaled to ±5 yard modifier
  const advantage = (offenseScore - defenseScore) / 99
  const advantageModifier = advantage * 5

  const baseYards = randInt(play.baseYards.min, play.baseYards.max)
  let finalYards = Math.round(baseYards + advantageModifier)

  // Sack check — pass plays only
  if (play.sackRisk > 0) {
    // passRush (1–99) scales the sack probability: base sackRisk at passRush=50,
    // doubled at passRush=99, halved at passRush=1
    const passRushFactor = defenseTeam.defense.passRush / 50
    const sackProbability = play.sackRisk * passRushFactor
    if (Math.random() < sackProbability) {
      return { yardsGained: randInt(-7, -3), event: 'sack' }
    }
  }

  let event = null
  if (finalYards < 0 && play.type === 'run') {
    event = 'tackle_for_loss'
  }

  return { yardsGained: finalYards, event }
}
