// The conversation's state and the reducer that changes it. Kept free of React and fetch,
// so each change is easy to read and to test.
import type { Feedback, TutorMessage } from '../../api/client'

export type TutorItem = { id: string; role: 'tutor'; message: TutorMessage }

export type LearnerItem = {
  id: string
  role: 'learner'
  text: string
  status: 'sending' | 'sent' | 'failed'
  feedback: Feedback[]
}

export type ChatItem = TutorItem | LearnerItem

export type ConversationState = {
  /** Which language and level this conversation is for, e.g. "xx:L1". */
  key: string | null
  status: 'idle' | 'starting' | 'failed' | 'ready'
  conversationId: string | null
  items: ChatItem[]
}

export type ConversationAction =
  | { type: 'start'; key: string }
  | { type: 'started'; key: string; conversationId: string; opening: TutorMessage }
  | { type: 'startFailed'; key: string }
  | { type: 'send'; key: string; itemId: string; text: string }
  | { type: 'resend'; key: string; itemId: string }
  | { type: 'replied'; key: string; itemId: string; feedback: Feedback[]; reply: TutorMessage }
  | { type: 'sendFailed'; key: string; itemId: string }

export const initialState: ConversationState = {
  key: null,
  status: 'idle',
  conversationId: null,
  items: [],
}

let nextId = 0
export function newItemId(): string {
  nextId += 1
  return `item-${nextId}`
}

function updateLearner(
  items: ChatItem[],
  itemId: string,
  change: Partial<Omit<LearnerItem, 'id' | 'role'>>,
): ChatItem[] {
  return items.map((item) =>
    item.id === itemId && item.role === 'learner' ? { ...item, ...change } : item,
  )
}

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  // A starting action resets everything. Any other action for an old conversation
  // (the learner switched language while a request was in flight) is ignored.
  if (action.type === 'start') {
    return { key: action.key, status: 'starting', conversationId: null, items: [] }
  }
  if (action.key !== state.key) return state

  switch (action.type) {
    case 'started':
      return {
        ...state,
        status: 'ready',
        conversationId: action.conversationId,
        items: [{ id: newItemId(), role: 'tutor', message: action.opening }],
      }
    case 'startFailed':
      return { ...state, status: 'failed' }
    case 'send':
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: action.itemId,
            role: 'learner',
            text: action.text,
            status: 'sending',
            feedback: [],
          },
        ],
      }
    case 'resend':
      return { ...state, items: updateLearner(state.items, action.itemId, { status: 'sending' }) }
    case 'replied':
      return {
        ...state,
        items: [
          ...updateLearner(state.items, action.itemId, {
            status: 'sent',
            feedback: action.feedback,
          }),
          { id: newItemId(), role: 'tutor', message: action.reply },
        ],
      }
    case 'sendFailed':
      return { ...state, items: updateLearner(state.items, action.itemId, { status: 'failed' }) }
  }
}
