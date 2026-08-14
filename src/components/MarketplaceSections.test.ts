import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import EventsSection from './EventsSection.vue'
import MerchSection from './MerchSection.vue'
import type { EventListing, MerchandiseItem } from '@/types/content'

const sampleEvent: EventListing = {
  slug: 'south-side-night',
  title: 'South Side Night',
  startsAt: '2026-09-13T01:00:00.000Z',
  timeZone: 'America/Chicago',
  venue: 'The Promontory',
  location: 'Chicago, IL',
  description: 'A client-approved event description will live here.',
  ticketLink: {
    providerId: 'venue-box-office',
    label: 'Tickets via venue',
    url: 'https://tickets.example.test/south-side-night',
  },
  status: 'on-sale',
}

const sampleItem: MerchandiseItem = {
  slug: 'signal-tee',
  title: 'Signal Tee',
  images: [],
  displayPrice: '$35',
  description: 'A client-approved product description will live here.',
  checkoutLink: {
    providerId: 'fourthwall',
    label: 'View on Fourthwall',
    url: 'https://shop.example.test/signal-tee',
  },
  status: 'available',
}

describe('EventsSection', () => {
  it('renders a useful empty state when there are no dates', () => {
    render(EventsSection, { props: { events: [] } })
    expect(screen.getByRole('heading', { name: 'The play pen is empty' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Tell Me First' }).getAttribute('href')).toBe('#join')
  })

  it('renders provider-neutral ticket data for populated events', () => {
    render(EventsSection, { props: { events: [sampleEvent] } })
    const link = screen.getByRole('link', { name: 'Tickets via venue' })
    expect(link.getAttribute('href')).toBe('https://tickets.example.test/south-side-night')
    expect(link.getAttribute('data-provider')).toBe('venue-box-office')
    expect(link.getAttribute('data-analytics-event')).toBe('ticket_click')
  })
})

describe('MerchSection', () => {
  it('renders a useful empty state when there are no products', () => {
    render(MerchSection, { props: { merchandise: [] } })
    expect(screen.getByRole('heading', { name: "Store's not open" })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Put Me On The List' }).getAttribute('href')).toBe('#join')
  })

  it('renders provider-neutral checkout data for populated merchandise', () => {
    render(MerchSection, { props: { merchandise: [sampleItem] } })
    const link = screen.getByRole('link', { name: 'View on Fourthwall' })
    expect(link.getAttribute('href')).toBe('https://shop.example.test/signal-tee')
    expect(link.getAttribute('data-provider')).toBe('fourthwall')
    expect(link.getAttribute('data-analytics-event')).toBe('merch_click')
  })
})
