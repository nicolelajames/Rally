import { useState, useRef } from 'react'
import { Check } from 'lucide-react'
import type { FeedItem, Child } from '../lib/supabase'
import ChildPill from './ChildPill'
import BadgePill from './BadgePill'

interface FeedCardProps {
  item: FeedItem
  children: Child[]
  onMarkDone: (id: string) => void
  style?: React.CSSProperties
}

export default function FeedCard({ item, children, onMarkDone, style }: FeedCardProps) {
  const [swiping, setSwiping] = useState(false)
  const [offset, setOffset] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const startX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const child = children.find((c) => c.id === item.child_id)

  const borderColor =
    item.type === 'action_required'
      ? '#E24B4A'
      : item.type === 'conflict'
      ? '#BA7517'
      : 'transparent'

  const timeLabel = item.event_at
    ? new Date(item.event_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : item.due_at
    ? new Date(item.due_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!swiping) return
    const diff = e.touches[0].clientX - startX.current
    if (diff > 0) setOffset(Math.min(diff, 120))
  }

  function handleTouchEnd() {
    setSwiping(false)
    if (offset > 80) {
      setDismissed(true)
      setTimeout(() => onMarkDone(item.id), 400)
    } else {
      setOffset(0)
    }
  }

  if (dismissed) {
    return (
      <div
        className="overflow-hidden transition-all duration-500"
        style={{ maxHeight: 0, opacity: 0, marginBottom: 0 }}
      />
    )
  }

  return (
    <div className="relative mb-3 overflow-hidden rounded-xl" style={style}>
      {/* Green swipe background */}
      <div
        className="absolute inset-0 flex items-center rounded-xl bg-emerald-500 pl-5"
        style={{ opacity: offset > 20 ? 1 : 0 }}
      >
        <Check className="text-white" size={24} />
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-xl bg-rally-card p-4 shadow-sm transition-transform"
        style={{
          borderLeft: `3px solid ${borderColor}`,
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s ease',
        }}
      >
        {/* Top row: child pills + time */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            {child && <ChildPill name={child.name} color={child.color} />}
          </div>
          {timeLabel && (
            <span className="font-mono text-[11px] text-rally-muted">
              {timeLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-medium text-rally-text">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="mt-1 text-[13px] text-rally-muted">{item.description}</p>
        )}

        {/* Badge + location */}
        <div className="mt-2 flex items-center gap-2">
          <BadgePill type={item.badge_type} label={item.badge_label} />
          {item.location && (
            <span className="text-[12px] text-rally-muted">{item.location}</span>
          )}
        </div>

        {/* Source label */}
        {item.source_label && (
          <p className="mt-2 font-mono text-[11px] text-rally-muted/70">
            &middot; {item.source_label}
          </p>
        )}

        {/* Done button */}
        {(item.type === 'action_required' || item.type === 'event') && (
          <button
            onClick={() => {
              setDismissed(true)
              setTimeout(() => onMarkDone(item.id), 400)
            }}
            className="absolute right-3 top-3 rounded-full p-1.5 text-rally-muted/50 transition-colors hover:bg-rally-bg hover:text-rally-teal"
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
