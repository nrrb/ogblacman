import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { blackBuddhaDialogues } from '@/content/blackBuddha'
import {
  DISMISSAL_COOLDOWN_MS,
  selectDialogue,
  type BlackBuddhaTrigger,
} from '@/features/black-buddha/assistantLogic'

export const useBlackBuddhaStore = defineStore('black-buddha', () => {
  const seenDialogueIds = ref<string[]>([])
  const currentDialogueId = ref<string | null>(null)
  const lastPromptAt = ref<number | null>(null)
  const dismissedUntil = ref(0)
  const isOpen = ref(false)

  const currentDialogue = computed(
    () => blackBuddhaDialogues.find((item) => item.id === currentDialogueId.value) ?? null,
  )

  function trigger(triggerName: BlackBuddhaTrigger, now = Date.now()) {
    const dialogue = selectDialogue(
      blackBuddhaDialogues,
      triggerName,
      {
        seenDialogueIds: seenDialogueIds.value,
        lastPromptAt: lastPromptAt.value,
        dismissedUntil: dismissedUntil.value,
        isOpen: isOpen.value,
      },
      now,
    )

    if (!dialogue) return false
    seenDialogueIds.value.push(dialogue.id)
    currentDialogueId.value = dialogue.id
    lastPromptAt.value = now
    isOpen.value = true
    return true
  }

  function open(now = Date.now()) {
    if (currentDialogue.value) {
      isOpen.value = true
      return
    }
    trigger('manual-open', now)
  }

  function dismiss(now = Date.now()) {
    isOpen.value = false
    dismissedUntil.value = now + DISMISSAL_COOLDOWN_MS
  }

  return {
    currentDialogue,
    seenDialogueIds,
    isOpen,
    trigger,
    open,
    dismiss,
  }
})
