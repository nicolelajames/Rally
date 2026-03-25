import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase, type FeedItem, type Child } from '../lib/supabase'
import ChildPill from '../components/ChildPill'

interface CalendarProps {
  familyId: string
}

export default function Calendar({ familyId }: CalendarProps) {
  const [current, setCurrent] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<FeedItem[]>([])
  const [children, setChildren] = useState<Child[]>([])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId])

  async function loadData() {
    const [eventsRes, kidsRes] = await Promise.all([
      supabase
        .from('feed_items')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_done', false)
        .not('event_at', 'is', null),
      supabase.from('children').select('*').eq('family_id', familyId),
    ])
    setEvents(eventsRes.data || [])
    setChildren(kidsRes.data || [])
  }

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  function getEventsForDay(day: number): FeedItem[] {
    return events.filter((e) => {
      if (!e.event_at) return false
      const d = new Date(e.event_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const selectedEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : []

  return (
    <div className="pb-24">
      <div className="px-5 py-4">
        <h2 className="text-xl font-semibold text-rally-text">Calendar</h2>
      </div>

      <div className="px-5">
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="rounded-full p-2 hover:bg-rally-bg"
          >
            <ChevronLeft size={18} className="text-rally-muted" />
          </button>
          <h3 className="text-[15px] font-semibold text-rally-text">
            {current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="rounded-full p-2 hover:bg-rally-bg"
          >
            <ChevronRight size={18} className="text-rally-muted" />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-semibold uppercase tracking-wider text-rally-muted"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="mb-6 grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />

            const dayEvents = getEventsForDay(day)
            const isSelected =
              selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === month &&
              selectedDate?.getFullYear() === year

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`relative flex h-10 flex-col items-center justify-center rounded-lg text-[14px] transition-colors ${
                  isSelected
                    ? 'bg-rally-purple text-white'
                    : isToday(day)
                    ? 'bg-rally-purple/10 font-semibold text-rally-purple'
                    : 'text-rally-text hover:bg-rally-bg'
                }`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => {
                      const child = children.find((c) => c.id === e.child_id)
                      return (
                        <div
                          key={e.id}
                          className="h-1 w-1 rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? '#fff'
                              : child?.color || '#7F77DD',
                          }}
                        />
                      )
                    })}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected day events */}
        {selectedDate && (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-rally-muted">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {selectedEvents.length === 0 ? (
              <p className="text-[13px] text-rally-muted">Nothing scheduled</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((event) => {
                  const child = children.find((c) => c.id === event.child_id)
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl bg-rally-card p-4 shadow-sm"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        {child && (
                          <ChildPill name={child.name} color={child.color} />
                        )}
                        {event.event_at && (
                          <span className="font-mono text-[11px] text-rally-muted">
                            {new Date(event.event_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[14px] font-medium text-rally-text">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="mt-0.5 text-[13px] text-rally-muted">
                          {event.description}
                        </p>
                      )}
                      {event.location && (
                        <p className="mt-1 text-[12px] text-rally-muted">
                          {event.location}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
