import type { EventStatus, MerchandiseStatus } from '@/types/content'

export interface FormattedEventDateTime {
  date: string
  time: string
}

const eventStatusLabels: Record<EventStatus, string> = {
  announced: 'Details soon',
  'on-sale': 'Get tickets',
  'sold-out': 'Sold out',
  postponed: 'New date pending',
  cancelled: 'Cancelled',
}

const merchandiseStatusLabels: Record<MerchandiseStatus, string> = {
  'coming-soon': 'Coming soon',
  available: 'View item',
  'sold-out': 'Sold out',
  archived: 'Archive',
}

export function formatEventDateTime(startsAt: string, timeZone: string): FormattedEventDateTime {
  const value = new Date(startsAt)
  if (!Number.isFinite(value.getTime())) return { date: 'Date to be announced', time: '' }

  return {
    date: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone,
    }).format(value),
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone,
    }).format(value),
  }
}

export function getEventStatusLabel(status: EventStatus) {
  return eventStatusLabels[status]
}

export function getMerchandiseStatusLabel(status: MerchandiseStatus) {
  return merchandiseStatusLabels[status]
}
