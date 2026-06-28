import { resolvePlay } from './matchup.js'

export const initialDriveState = {
  down: 1,
  yardsToGo: 10,
  fieldPosition: 25,
  plays: [],
  result: null,
}

export function driveReducer(state, action) {
  if (action.type !== 'CALL_PLAY') return state

  const { play, offenseTeam, defenseTeam } = action.payload
  const { yardsGained, event } = resolvePlay(play, offenseTeam, defenseTeam)

  const playLog = {
    playName: play.name,
    yardsGained,
    event,
    down: state.down,
    yardsToGo: state.yardsToGo,
  }

  const newFieldPosition = state.fieldPosition + yardsGained
  const newPlays = [...state.plays, playLog]

  if (newFieldPosition >= 100) {
    return { ...state, fieldPosition: newFieldPosition, plays: newPlays, result: 'touchdown' }
  }

  const yardsRemaining = state.yardsToGo - yardsGained

  if (yardsRemaining <= 0) {
    return { ...state, down: 1, yardsToGo: 10, fieldPosition: newFieldPosition, plays: newPlays, result: null }
  }

  if (state.down === 4) {
    return { ...state, fieldPosition: newFieldPosition, plays: newPlays, result: 'turnover_on_downs' }
  }

  return {
    ...state,
    down: state.down + 1,
    yardsToGo: yardsRemaining,
    fieldPosition: newFieldPosition,
    plays: newPlays,
    result: null,
  }
}
