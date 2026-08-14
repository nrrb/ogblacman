import type { BlackBuddhaDialogue } from '@/features/black-buddha/assistantLogic'

// Provisional voice and presentation copy, written in OG's caption register.
// Replace here when approved Black Buddha lore and lyrics arrive; artwork and
// trigger behavior live elsewhere.
export const blackBuddhaDialogues: readonly BlackBuddhaDialogue[] = [
  {
    id: 'manual-welcome',
    trigger: 'manual-open',
    label: 'You rang?',
    message: "I'm Black Buddha. I don't fix your life I just watch it happen.",
    action: { label: 'Take Me To The Music', href: '/#music' },
    priority: 'moment',
    provisional: true,
  },
  {
    id: 'arrival-001',
    trigger: 'initial-visit',
    label: 'Welcome stranger',
    message: 'Press play before you start scrolling it hits different that way',
    action: { label: 'Press Play', href: '/#music' },
    priority: 'ambient',
    provisional: true,
  },
  {
    id: 'player-001',
    trigger: 'first-song-play',
    label: "That's the one",
    message: "there it go. turn it up your neighbors already don't like you",
    action: { label: 'More On This', href: '/music/next-transmission' },
    priority: 'moment',
    provisional: true,
  },
  {
    id: 'roots-001',
    trigger: 'game-start',
    label: 'Hold it',
    message: "Hold the button down don't be tapping it like an elevator",
    priority: 'moment',
    provisional: true,
  },
  {
    id: 'roots-002',
    trigger: 'game-complete',
    label: 'Look at you',
    message: "That's a whole tree because you held on \u{1F333}",
    action: { label: 'Back To The Music', href: '/#music' },
    priority: 'moment',
    provisional: true,
  },
  {
    id: 'release-001',
    trigger: 'release-open',
    label: 'The details',
    message: "Every song get its own room in here. hit play I'll follow you around like rent",
    priority: 'moment',
    provisional: true,
  },
  {
    id: 'story-001',
    trigger: 'story-section',
    label: 'How we got here',
    message: 'He been doing this a long time nobody handed him nothing',
    priority: 'ambient',
    provisional: true,
  },
  {
    id: 'idle-001',
    trigger: 'inactivity',
    label: 'You still there?',
    message: 'you still there? time is expensive',
    action: { label: 'Go Hug Something', href: '/#game' },
    priority: 'ambient',
    provisional: true,
  },
] as const
