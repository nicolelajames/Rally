import { AlertTriangle } from 'lucide-react'
import type { FeedItem, Child } from '../lib/supabase'
import ChildPill from './ChildPill'

interface ConflictCardProps {
  items: FeedItem[]
  children: Child[]
}

export default function ConflictCard({ items, children }: ConflictCardProps) {
  if (items.length < 2) return null

  return (
    <div className="mb-3 rounded-xl border-l-3 border-rally-amber bg-rally-card p-4 shadow-sm" style={{ borderLeft: '3px solid #BA7517' }}>
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-rally-amber" />
        <span className="text-[13px] font-semibold text-rally-amber">
          Schedule conflict
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.slice(0, 2).map((item) => {
          const child = children.find((c) => c.id === item.child_id)
          return (
            <div
              key={item.id}
              className="rounded-lg bg-rally-bg p-3"
            >
              {child && (
                <div className="mb-1">
                  <ChildPill name={child.name} color={child.color} />
                </div>
              )}
              <p className="text-[13px] font-medium text-rally-text">
                {item.title}
              </p>
              {item.event_at && (
                <p className="mt-1 font-mono text-[11px] text-rally-muted">
                  {new Date(item.event_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              )}
              {item.location && (
                <p className="text-[11px] text-rally-muted">{item.location}</p>
              )}
            </div>
          )
        })}
      </div>

      <button className="mt-3 w-full rounded-lg bg-rally-amber/10 py-2 text-center text-[13px] font-semibold text-rally-amber transition-colors hover:bg-rally-amber/20">
        Resolve conflict
      </button>
    </div>
  )
}
