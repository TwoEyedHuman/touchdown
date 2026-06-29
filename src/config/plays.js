/**
 * @typedef {'run'|'pass'} PlayType
 *
 * @typedef {Object} Play
 * @property {string}   id           - Unique identifier
 * @property {string}   name         - Display name
 * @property {PlayType} type         - 'run' or 'pass'
 * @property {string}   description  - Short human-readable description
 * @property {string[]} offenseKeys  - Keys from team.offense used to compute offenseScore
 * @property {string[]} defenseKeys  - Keys from team.defense used to compute defenseScore
 * @property {{ min: number, max: number }} baseYards - Random yard range before advantage modifier
 * @property {number}   sackRisk         - Float 0–1; run plays must be 0
 * @property {number}   incompleteRisk   - Float 0–1; run plays must be 0
 *
 * @type {Play[]}
 */
export const plays = [
  {
    id: 'hb-dive',
    name: 'HB Dive',
    type: 'run',
    description: 'Power run straight up the middle behind the offensive line.',
    offenseKeys: ['runAttack', 'olStrength'],
    defenseKeys: ['runStop'],
    baseYards: { min: -2, max: 4 },
    sackRisk: 0,
    incompleteRisk: 0,
  },
  {
    id: 'hb-draw',
    name: 'HB Draw',
    type: 'run',
    description: 'Delayed handoff designed to pull defenders out of position.',
    offenseKeys: ['runAttack', 'olStrength'],
    defenseKeys: ['runStop'],
    baseYards: { min: -1, max: 7 },
    sackRisk: 0,
    incompleteRisk: 0,
  },
  {
    id: 'screen-pass',
    name: 'Screen Pass',
    type: 'pass',
    description: 'Short pass behind the line of scrimmage with blockers in front.',
    offenseKeys: ['skillPlayers'],
    defenseKeys: ['runStop'],
    baseYards: { min: 0, max: 10 },
    sackRisk: 0.05,
    incompleteRisk: 0.1,
  },
  {
    id: 'short-pass',
    name: 'Short Pass',
    type: 'pass',
    description: 'Quick throw to a receiver in the short zone.',
    offenseKeys: ['passAttack', 'skillPlayers'],
    defenseKeys: ['passCoverage'],
    baseYards: { min: -2, max: 12 },
    sackRisk: 0.15,
    incompleteRisk: 0.2,
  },
  {
    id: 'play-action',
    name: 'Play Action',
    type: 'pass',
    description: 'Fake handoff to freeze linebackers before throwing downfield.',
    offenseKeys: ['passAttack', 'olStrength'],
    defenseKeys: ['passRush'],
    baseYards: { min: 2, max: 15 },
    sackRisk: 0.15,
    incompleteRisk: 0.15,
  },
  {
    id: 'deep-pass',
    name: 'Deep Pass',
    type: 'pass',
    description: 'Long bomb targeting receivers running vertical routes.',
    offenseKeys: ['passAttack'],
    defenseKeys: ['secondary', 'passRush'],
    baseYards: { min: -5, max: 30 },
    sackRisk: 0.3,
    incompleteRisk: 0.35,
  },
  {
    id: 'pitch-sweep',
    name: 'Pitch Sweep',
    type: 'run',
    description: 'Outside pitch to the back racing for the edge behind pulling linemen.',
    offenseKeys: ['runAttack', 'skillPlayers'],
    defenseKeys: ['runStop'],
    baseYards: { min: -3, max: 9 },
    sackRisk: 0,
    incompleteRisk: 0,
  },
  {
    id: 'slant-route',
    name: 'Slant Route',
    type: 'pass',
    description: 'Quick inside cut by the receiver to exploit soft zones.',
    offenseKeys: ['passAttack', 'skillPlayers'],
    defenseKeys: ['passCoverage', 'secondary'],
    baseYards: { min: 1, max: 11 },
    sackRisk: 0.1,
    incompleteRisk: 0.12,
  },
]
