import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { supabase, type FeedItem, type Child, type Profile } from '../lib/supabase'
import TopHeader from '../components/TopHeader'
import FeedCard from '../components/FeedCard'
import ConflictCard from '../components/ConflictCard'

interface TodayProps {
  familyId: string
  profile: Profile
}

export default function Today({ familyId, profile }: TodayProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    loadData()
    subscribeToChanges()
    return () => {
      supabase.channel('feed-changes').unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId])

  async function loadData() {
    setLoading(true)
    const [feedRes, kidsRes] = await Promise.all([
      supabase
        .from('feed_items')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_done', false)
        .order('priority', { ascending: false }),
      supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId),
    ])

    setFeedItems(feedRes.data || [])
    setChildren(kidsRes.data || [])
    setLoading(false)
  }

  function subscribeToChanges() {
    supabase
      .channel('feed-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_items',
          filter: `family_id=eq.${familyId}`,
        },
        () => {
          loadData()
          setToast('Updated')
          setTimeout(() => setToast(''), 2000)
        }
      )
      .subscribe()
  }

  async function handleMarkDone(id: string) {
    await supabase.from('feed_items').update({ is_done: true }).eq('id', id)
    setFeedItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Setup section label fade-in
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.section-label').forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [feedItems])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const actionItems = feedItems.filter((i) => i.type === 'action_required')
  const todayItems = feedItems.filter((i) => {
    if (i.type !== 'event') return false
    if (!i.event_at) return false
    const d = new Date(i.event_at)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })
  const conflictItems = feedItems.filter((i) => i.type === 'conflict')
  const upcomingItems = feedItems.filter((i) => {
    if (i.type === 'action_required' || i.type === 'conflict') return false
    if (i.type === 'upcoming') return true
    if (i.type === 'event' && i.event_at) {
      const d = new Date(i.event_at)
      d.setHours(0, 0, 0, 0)
      return d.getTime() > today.getTime() && d <= weekFromNow
    }
    return false
  })

  const attentionCount = actionItems.length + conflictItems.length
  const greeting = getGreeting(profile.full_name || 'there')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rally-purple/20 border-t-rally-purple" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      <TopHeader />

      <div className="px-5">
        {/* Greeting */}
        <h2 className="mb-1 text-xl font-semibold text-rally-text">
          {greeting}
        </h2>

        {/* Summary pill */}
        {attentionCount > 0 && (
          <div className="mb-5 mt-3 inline-flex items-center rounded-full bg-rally-purple px-4 py-2 text-[13px] font-medium text-white">
            {attentionCount} thing{attentionCount !== 1 ? 's' : ''} need
            {attentionCount === 1 ? 's' : ''} your attention today
          </div>
        )}

        {/* Action Required */}
        {actionItems.length > 0 && (
          <section className="mb-6">
            <p className="section-label mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-rally-danger opacity-0">
              Action required
            </p>
            {actionItems.map((item, i) => (
              <FeedCard
                key={item.id}
                item={item}
                children={children}
                onMarkDone={handleMarkDone}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </section>
        )}

        {/* Today */}
        {todayItems.length > 0 && (
          <section className="mb-6">
            <p className="section-label mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-rally-text opacity-0">
              Today
            </p>
            {todayItems.map((item, i) => (
              <FeedCard
                key={item.id}
                item={item}
                children={children}
                onMarkDone={handleMarkDone}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </section>
        )}

        {/* Conflicts */}
        {conflictItems.length > 0 && (
          <section className="mb-6">
            <p className="section-label mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-rally-amber opacity-0">
              Conflict detected
            </p>
            <ConflictCard items={conflictItems} children={children} />
          </section>
        )}

        {/* Coming up */}
        {upcomingItems.length > 0 && (
          <section className="mb-6">
            <p className="section-label mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-rally-muted opacity-0">
              Coming up
            </p>
            {upcomingItems.map((item, i) => (
              <FeedCard
                key={item.id}
                item={item}
                children={children}
                onMarkDone={handleMarkDone}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </section>
        )}

        {/* Empty state */}
        {feedItems.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-rally-text">All clear!</p>
            <p className="mt-1 text-[13px] text-rally-muted">
              No items need your attention right now.
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/upload')}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-rally-purple shadow-lg shadow-rally-purple/30 transition-transform hover:scale-105 active:scale-95"
        style={{ right: 'max(20px, calc((100vw - 430px) / 2 + 20px))' }}
      >
        <Camera size={22} className="text-white" />
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 animate-fade-in rounded-full bg-rally-text px-4 py-1.5 text-[12px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const first = name.split(' ')[0]
  if (hour < 12) return `Good morning, ${first}.`
  if (hour < 17) return `Good afternoon, ${first}.`
  return `Good evening, ${first}.`
}
