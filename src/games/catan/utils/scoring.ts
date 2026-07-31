import type { Player } from '../types'
import { BONUS_POINTS, VICTORY_TARGET } from '../types'

export function settlementsScore(player: Player): number {
  return player.settlements
}

export function citiesScore(player: Player): number {
  return player.cities * 2
}

export function cardsScore(player: Player): number {
  return player.victoryPointCards
}

export function armyScore(player: Player): number {
  return player.hasLargestArmy ? BONUS_POINTS : 0
}

export function roadScore(player: Player): number {
  return player.hasLongestRoad ? BONUS_POINTS : 0
}

export function totalScore(player: Player): number {
  return (
    settlementsScore(player) +
    citiesScore(player) +
    cardsScore(player) +
    armyScore(player) +
    roadScore(player)
  )
}

export function formatBreakdown(player: Player): string {
  const s = settlementsScore(player)
  const c = citiesScore(player)
  const cards = cardsScore(player)
  const army = armyScore(player)
  const road = roadScore(player)
  const total = s + c + cards + army + road
  return `Settlements: ${s} · Cities: ${c} · Cards: ${cards} · Army: ${army} · Road: ${road} = ${total}`
}

export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const diff = totalScore(b) - totalScore(a)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })
}

/** Single leader with ≥ 10 VP (no tie handling). */
export function getWinner(players: Player[]): Player | null {
  const ranked = rankPlayers(players)
  const top = ranked[0]
  if (!top || totalScore(top) < VICTORY_TARGET) return null
  return top
}
