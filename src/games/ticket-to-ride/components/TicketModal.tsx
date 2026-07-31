import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { TicketKind } from '../types'
import { formatTickets, sumTickets } from '../utils/scoring'

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M5 12.5 10 17.5 19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M6 12h12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface ListItem {
  kind: TicketKind
  index: number
  value: number
}

interface TicketModalProps {
  playerName: string
  completed: number[]
  incomplete: number[]
  onAdd: (kind: TicketKind, value: number) => void
  onRemove: (kind: TicketKind, index: number) => void
  onClose: () => void
}

export function TicketModal({
  playerName,
  completed,
  incomplete,
  onAdd,
  onRemove,
  onClose,
}: TicketModalProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const prevCountRef = useRef(0)
  const titleId = useId()

  const completedSum = sumTickets(completed)
  const incompleteSum = sumTickets(incomplete)
  const net = completedSum - incompleteSum

  // Newest first so recent entries sit under the fixed entry panel
  const items: ListItem[] = [
    ...completed
      .map((value, index) => ({
        kind: 'completed' as const,
        index,
        value,
      }))
      .reverse(),
    ...incomplete
      .map((value, index) => ({
        kind: 'incomplete' as const,
        index,
        value,
      }))
      .reverse(),
  ]

  const focusInput = () => {
    const el = inputRef.current
    if (!el) return
    // preventScroll keeps the fixed entry panel from jumping off-screen on mobile
    el.focus({ preventScroll: true })
    try {
      const len = el.value.length
      el.setSelectionRange(len, len)
    } catch {
      // type=number may not support selection on some browsers
    }
  }

  /** Prevent buttons from stealing focus from the number field. */
  const keepInputFocus = (e: ReactMouseEvent) => {
    e.preventDefault()
  }

  useEffect(() => {
    focusInput()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // Restore focus after list updates; only jump list to top when a ticket is added
  useEffect(() => {
    focusInput()
    const count = completed.length + incomplete.length
    if (count > prevCountRef.current && listRef.current) {
      listRef.current.scrollTop = 0
    }
    prevCountRef.current = count
  }, [completed, incomplete])

  const parseValue = (): number | null => {
    const value = Math.floor(Number(draft))
    if (!Number.isFinite(value) || value < 1) return null
    return value
  }

  const submit = (kind: TicketKind) => {
    const value = parseValue()
    if (value === null) {
      focusInput()
      return
    }
    onAdd(kind, value)
    setDraft('')
    requestAnimationFrame(focusInput)
  }

  const remove = (kind: TicketKind, index: number) => {
    onRemove(kind, index)
    requestAnimationFrame(focusInput)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="ticket-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ticket-modal-sticky">
          <header className="ticket-modal-header">
            <div>
              <h2 id={titleId} className="ticket-modal-title">
                Tickets
              </h2>
              <p className="ticket-modal-subtitle">{playerName}</p>
            </div>
            <button
              type="button"
              className="ticket-modal-done"
              onClick={onClose}
            >
              Done
            </button>
          </header>

          <div className="ticket-modal-total" aria-live="polite">
            <div className="ticket-modal-total-text">
              <span className="ticket-modal-total-label">Net tickets</span>
              <span className="ticket-modal-total-sub">
                +{completedSum} completed · −{incompleteSum} incomplete
              </span>
            </div>
            <span className="ticket-modal-total-value">
              {formatTickets(net)}
            </span>
          </div>

          <div className="ticket-entry-panel">
            <div className="ticket-entry-row">
              <input
                ref={inputRef}
                type="number"
                className="ticket-entry-input"
                inputMode="numeric"
                min={1}
                placeholder="Ticket value"
                value={draft}
                aria-label="Ticket point value"
                enterKeyHint="done"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submit('completed')
                  }
                }}
              />
              <button
                type="button"
                className="ticket-icon-btn ticket-icon-btn-ok"
                aria-label="Add completed ticket"
                title="Completed (adds points)"
                onMouseDown={keepInputFocus}
                onClick={() => submit('completed')}
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                className="ticket-icon-btn ticket-icon-btn-minus"
                aria-label="Add incomplete ticket"
                title="Incomplete (subtracts points)"
                onMouseDown={keepInputFocus}
                onClick={() => submit('incomplete')}
              >
                <MinusIcon />
              </button>
            </div>
            <p className="ticket-entry-hint">✓ completed · − incomplete</p>
          </div>
        </div>

        <div className="ticket-list-region">
          {items.length > 0 ? (
            <p className="ticket-list-caption">
              Your tickets · scroll to review
            </p>
          ) : null}
          <ul
            ref={listRef}
            className="ticket-list"
            aria-label="Entered tickets"
          >
            {items.length === 0 ? (
              <li className="ticket-list-empty">
                Enter a value, then ✓ if completed or − if incomplete
              </li>
            ) : (
              items.map((item) => {
                const positive = item.kind === 'completed'
                return (
                  <li
                    key={`${item.kind}-${item.index}-${item.value}`}
                    className={`ticket-list-item${positive ? '' : ' incomplete'}`}
                  >
                    <span className="ticket-list-value">
                      {positive ? `+${item.value}` : `−${item.value}`}
                      <span className="ticket-list-kind">
                        {positive ? 'completed' : 'incomplete'}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="ticket-icon-btn ticket-icon-btn-remove"
                      aria-label={`Remove ${item.kind} ticket worth ${item.value}`}
                      onMouseDown={keepInputFocus}
                      onClick={() => remove(item.kind, item.index)}
                    >
                      <XIcon />
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
