import type { Player, TrainCounts, TrainLength } from '../types'

export const TRAIN_POINTS: Record<TrainLength, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
  6: 15,
}

export const LONGEST_ROUTE_BONUS = 10

export function emptyTrains(): TrainCounts {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
}

export function sumTickets(tickets: number[]): number {
  return tickets.reduce((sum, v) => sum + v, 0)
}

export function trainsScore(trains: TrainCounts): number {
  return (Object.keys(TRAIN_POINTS) as unknown as TrainLength[]).reduce(
    (sum, len) => sum + trains[len] * TRAIN_POINTS[len],
    0,
  )
}

export function ticketsNet(player: Player): number {
  return sumTickets(player.completedTickets) - sumTickets(player.incompleteTickets)
}

export function bonusScore(player: Player): number {
  return player.hasLongestRoute ? LONGEST_ROUTE_BONUS : 0
}

export function totalScore(player: Player): number {
  return trainsScore(player.trains) + ticketsNet(player) + bonusScore(player)
}

export function formatTickets(net: number): string {
  if (net > 0) return `+${net}`
  return String(net)
}

export function formatBreakdown(player: Player): string {
  const trains = trainsScore(player.trains)
  const tickets = ticketsNet(player)
  const bonus = bonusScore(player)
  const total = trains + tickets + bonus
  return `Trains: ${trains} • Tickets: ${formatTickets(tickets)} • Bonus: ${bonus} = ${total}`
}

export function formatTicketSummary(tickets: number[]): string {
  const sum = sumTickets(tickets)
  const n = tickets.length
  const label = n === 1 ? 'ticket' : 'tickets'
  return `${sum} pts · ${n} ${label}`
}

/** Card row for unified tickets entry. */
export function formatTicketsNetSummary(player: Player): string {
  const net = ticketsNet(player)
  const done = player.completedTickets.length
  const open = player.incompleteTickets.length
  const doneLabel = done === 1 ? '1 done' : `${done} done`
  const openLabel = open === 1 ? '1 open' : `${open} open`
  return `Net ${formatTickets(net)} · ${doneLabel} · ${openLabel}`
}

export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const diff = totalScore(b) - totalScore(a)
    if (diff !== 0) return diff
    return a.name.localeCompare(b.name)
  })
}
