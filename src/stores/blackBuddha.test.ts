import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useBlackBuddhaStore } from './blackBuddha'

describe('Black Buddha store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('tracks prompts only for the current in-memory session', () => {
    const assistant = useBlackBuddhaStore()

    expect(assistant.trigger('initial-visit', 1_000)).toBe(true)
    expect(assistant.currentDialogue?.id).toBe('arrival-001')
    expect(assistant.trigger('story-section', 2_000)).toBe(false)

    expect(assistant.trigger('game-start', 2_000)).toBe(true)
    expect(assistant.currentDialogue?.id).toBe('roots-001')
    expect(assistant.seenDialogueIds).toEqual(['arrival-001', 'roots-001'])
  })

  it('stays dismissed during its cooldown but always allows a manual reopen', () => {
    const assistant = useBlackBuddhaStore()

    assistant.trigger('initial-visit', 1_000)
    assistant.dismiss(2_000)
    expect(assistant.isOpen).toBe(false)
    expect(assistant.trigger('game-complete', 3_000)).toBe(false)

    assistant.open(3_000)
    expect(assistant.isOpen).toBe(true)
    expect(assistant.currentDialogue?.id).toBe('arrival-001')

    assistant.dismiss(3_000)
    expect(assistant.trigger('game-complete', 33_001)).toBe(true)
    expect(assistant.currentDialogue?.id).toBe('roots-002')
  })

  it('opens with authored manual dialogue before any automatic prompt', () => {
    const assistant = useBlackBuddhaStore()
    assistant.open(1_000)
    expect(assistant.currentDialogue?.id).toBe('manual-welcome')
  })
})
