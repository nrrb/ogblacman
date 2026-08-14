export type BlackBuddhaTrigger =
  | 'manual-open'
  | 'initial-visit'
  | 'first-song-play'
  | 'game-start'
  | 'game-complete'
  | 'release-open'
  | 'story-section'
  | 'inactivity'

export interface BlackBuddhaAction {
  label: string
  href: string
}

export interface BlackBuddhaDialogue {
  id: string
  trigger: BlackBuddhaTrigger
  label: string
  message: string
  action?: BlackBuddhaAction
  priority: 'ambient' | 'moment'
  provisional?: boolean
}

export interface BlackBuddhaSessionSnapshot {
  seenDialogueIds: readonly string[]
  lastPromptAt: number | null
  dismissedUntil: number
  isOpen: boolean
}

export const PROMPT_COOLDOWN_MS = 18_000
export const DISMISSAL_COOLDOWN_MS = 30_000

export function selectDialogue(
  dialogues: readonly BlackBuddhaDialogue[],
  trigger: BlackBuddhaTrigger,
  session: BlackBuddhaSessionSnapshot,
  now: number,
  cooldownMs = PROMPT_COOLDOWN_MS,
) {
  if (now < session.dismissedUntil) return null

  const dialogue = dialogues.find(
    (item) => item.trigger === trigger && !session.seenDialogueIds.includes(item.id),
  )
  if (!dialogue) return null

  const isMoment = dialogue.priority === 'moment'
  const isCoolingDown =
    session.lastPromptAt !== null && now - session.lastPromptAt < cooldownMs

  if (!isMoment && (session.isOpen || isCoolingDown)) return null
  return dialogue
}
