import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initialDriveState, driveReducer } from './drive.js'

vi.mock('./matchup.js', () => ({ resolvePlay: vi.fn() }))

import { resolvePlay } from './matchup.js'

const play = { name: 'HB Dive', type: 'run', offenseKeys: ['runAttack'], defenseKeys: ['runStop'], baseYards: { min: 5, max: 5 }, sackRisk: 0 }
const team = { offense: { runAttack: 50 }, defense: { runStop: 50 } }
const action = (yds, event = null) => {
  resolvePlay.mockReturnValueOnce({ yardsGained: yds, event })
  return { type: 'CALL_PLAY', payload: { play, offenseTeam: team, defenseTeam: team } }
}

beforeEach(() => vi.clearAllMocks())

describe('driveReducer', () => {
  it('is a pure function — does not mutate state', () => {
    const state = { ...initialDriveState }
    resolvePlay.mockReturnValueOnce({ yardsGained: 5, event: null })
    driveReducer(state, { type: 'CALL_PLAY', payload: { play, offenseTeam: team, defenseTeam: team } })
    expect(state).toEqual(initialDriveState)
  })

  it('unknown action returns state unchanged', () => {
    const result = driveReducer(initialDriveState, { type: 'UNKNOWN' })
    expect(result).toBe(initialDriveState)
  })

  it('touchdown when fieldPosition reaches 100', () => {
    // Start at 25; one 75-yard gain → position 100
    let state = driveReducer(initialDriveState, action(75))
    expect(state.result).toBe('touchdown')
    expect(state.fieldPosition).toBe(100)
    expect(state.plays).toHaveLength(1)
  })

  it('touchdown when fieldPosition exceeds 100', () => {
    let state = driveReducer(initialDriveState, action(80))
    expect(state.result).toBe('touchdown')
    expect(state.fieldPosition).toBe(105)
  })

  it('turnover on downs on 4th down failure', () => {
    let state = initialDriveState
    // 1st: +3 yards → 2nd/7
    state = driveReducer(state, action(3))
    expect(state.down).toBe(2)
    expect(state.yardsToGo).toBe(7)
    expect(state.result).toBeNull()

    // 2nd: +3 yards → 3rd/4
    state = driveReducer(state, action(3))
    expect(state.down).toBe(3)
    expect(state.yardsToGo).toBe(4)

    // 3rd: +3 yards → 4th/1
    state = driveReducer(state, action(3))
    expect(state.down).toBe(4)
    expect(state.yardsToGo).toBe(1)

    // 4th: 0 yards → turnover
    state = driveReducer(state, action(0))
    expect(state.result).toBe('turnover_on_downs')
    expect(state.plays).toHaveLength(4)
  })

  it('first down resets down to 1 and yardsToGo to 10', () => {
    // Gain exactly 10 yards
    let state = driveReducer(initialDriveState, action(10))
    expect(state.down).toBe(1)
    expect(state.yardsToGo).toBe(10)
    expect(state.result).toBeNull()
    expect(state.fieldPosition).toBe(35)
  })

  it('gaining more than yardsToGo also resets to 1st and 10', () => {
    let state = driveReducer(initialDriveState, action(15))
    expect(state.down).toBe(1)
    expect(state.yardsToGo).toBe(10)
  })

  it('play log captures pre-play down and yardsToGo', () => {
    // Start 1st/10; gain 3 → now 2nd/7; then gain 4
    let state = driveReducer(initialDriveState, action(3))
    state = driveReducer(state, action(4))
    expect(state.plays[0]).toMatchObject({ down: 1, yardsToGo: 10, yardsGained: 3 })
    expect(state.plays[1]).toMatchObject({ down: 2, yardsToGo: 7, yardsGained: 4 })
  })

  it('play log includes playName and event', () => {
    let state = driveReducer(initialDriveState, action(-5, 'tackle_for_loss'))
    expect(state.plays[0]).toMatchObject({ playName: 'HB Dive', event: 'tackle_for_loss', yardsGained: -5 })
  })

  it('negative yards on 4th down cause turnover (field position goes back)', () => {
    // Advance to 4th down with 3 plays of 0 yards
    let state = initialDriveState
    state = driveReducer(state, action(0))
    state = driveReducer(state, action(0))
    state = driveReducer(state, action(0))
    expect(state.down).toBe(4)
    state = driveReducer(state, action(-3))
    expect(state.result).toBe('turnover_on_downs')
    expect(state.fieldPosition).toBe(22)
  })

  it('initialDriveState has correct shape', () => {
    expect(initialDriveState).toEqual({
      down: 1,
      yardsToGo: 10,
      fieldPosition: 25,
      plays: [],
      result: null,
    })
  })
})
