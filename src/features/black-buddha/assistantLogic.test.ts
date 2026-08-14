import { describe, expect, it } from 'vitest'

import type { BlackBuddhaDialogue, BlackBuddhaSessionSnapshot } from './assistantLogic'
import { selectDialogue } from './assistantLogic'

const dialogues: readonly BlackBuddhaDialogue[] = [
  {
    id: 'ambient-one',
    trigger: 'initial-visit',
    label: 'Ambient',
    message: 'Ambient prompt',
    priority: 'ambient',
  },
  {
    id: 'ambient-two',
    trigger: 'initial-visit',
    label: 'Ambient two',
    message: 'Second ambient prompt',
    priority: 'ambient',
  },
  {
    id: 'moment-one',
    trigger: 'game-complete',
    label: 'Moment',
    message: 'High-value moment',
    priority: 'moment',
  },
]

function session(overrides: Partial<BlackBuddhaSessionSnapshot> = {}): BlackBuddhaSessionSnapshot {
  return {
    seenDialogueIds: [],
    lastPromptAt: null,
    dismissedUntil: 0,
    isOpen: false,
    ...overrides,
  }
}

describe('selectDialogue', () => {
  it('selects the first unseen dialogue for a trigger', () => {
    expect(selectDialogue(dialogues, 'initial-visit', session(), 1_000)?.id).toBe('ambient-one')
    expect(
      selectDialogue(dialogues, 'initial-visit', session({ seenDialogueIds: ['ambient-one'] }), 1_000)?.id,
    ).toBe('ambient-two')
  })

  it('prevents ambient prompts from interrupting or ignoring cooldown', () => {
    expect(selectDialogue(dialogues, 'initial-visit', session({ isOpen: true }), 20_000)).toBeNull()
    expect(selectDialogue(dialogues, 'initial-visit', session({ lastPromptAt: 10_000 }), 20_000)).toBeNull()
  })

  it('allows important interaction moments through the ordinary prompt cooldown', () => {
    const result = selectDialogue(
      dialogues,
      'game-complete',
      session({ isOpen: true, lastPromptAt: 19_000 }),
      20_000,
    )
    expect(result?.id).toBe('moment-one')
  })

  it('respects dismissal even for important moments and never repeats seen dialogue', () => {
    expect(
      selectDialogue(dialogues, 'game-complete', session({ dismissedUntil: 25_000 }), 20_000),
    ).toBeNull()
    expect(
      selectDialogue(dialogues, 'game-complete', session({ seenDialogueIds: ['moment-one'] }), 30_000),
    ).toBeNull()
  })
})
