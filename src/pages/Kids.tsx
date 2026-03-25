import { useState, useEffect } from 'react'
import { Plus, Pencil, X, Save } from 'lucide-react'
import { supabase, type Child, type FeedItem } from '../lib/supabase'

interface KidsProps {
  familyId: string
}

const CHILD_COLORS = ['#7F77DD', '#1D9E75', '#D85A30', '#BA7517', '#3B82F6', '#EC4899']

export default function Kids({ familyId }: KidsProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [feedCounts, setFeedCounts] = useState<Record<string, number>>({})
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', school: '', grade: '', color: CHILD_COLORS[0] })

  useEffect(() => {
    loadKids()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId])

  async function loadKids() {
    const [kidsRes, feedRes] = await Promise.all([
      supabase.from('children').select('*').eq('family_id', familyId),
      supabase
        .from('feed_items')
        .select('id, child_id')
        .eq('family_id', familyId)
        .eq('is_done', false),
    ])

    setChildren(kidsRes.data || [])

    const counts: Record<string, number> = {}
    ;(feedRes.data as Pick<FeedItem, 'id' | 'child_id'>[] || []).forEach((item) => {
      if (item.child_id) {
        counts[item.child_id] = (counts[item.child_id] || 0) + 1
      }
    })
    setFeedCounts(counts)
  }

  async function handleSave() {
    if (!form.name.trim()) return

    if (editingId) {
      await supabase
        .from('children')
        .update({
          name: form.name.trim(),
          school: form.school.trim() || null,
          grade: form.grade.trim() || null,
          color: form.color,
        })
        .eq('id', editingId)
    } else {
      await supabase.from('children').insert({
        family_id: familyId,
        name: form.name.trim(),
        school: form.school.trim() || null,
        grade: form.grade.trim() || null,
        color: form.color,
      })
    }

    setForm({ name: '', school: '', grade: '', color: CHILD_COLORS[0] })
    setShowForm(false)
    setEditingId(null)
    loadKids()
  }

  function startEdit(child: Child) {
    setForm({
      name: child.name,
      school: child.school || '',
      grade: child.grade || '',
      color: child.color,
    })
    setEditingId(child.id)
    setShowForm(true)
  }

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-xl font-semibold text-rally-text">Kids</h2>
        <button
          onClick={() => {
            setForm({ name: '', school: '', grade: '', color: CHILD_COLORS[children.length % CHILD_COLORS.length] })
            setEditingId(null)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 rounded-full bg-rally-purple px-4 py-2 text-[13px] font-semibold text-white"
        >
          <Plus size={14} /> Add child
        </button>
      </div>

      <div className="px-5">
        {/* Children list */}
        {children.map((child) => (
          <div
            key={child.id}
            className="mb-3 flex items-center gap-4 rounded-xl bg-rally-card p-4 shadow-sm"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: child.color }}
            >
              {child.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-[15px] font-medium text-rally-text">
                {child.name}
              </h3>
              {(child.grade || child.school) && (
                <p className="text-[13px] text-rally-muted">
                  {[child.grade, child.school].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {feedCounts[child.id] > 0 && (
                <span className="rounded-full bg-rally-purple/10 px-2.5 py-0.5 text-[12px] font-semibold text-rally-purple">
                  {feedCounts[child.id]} active
                </span>
              )}
              <button
                onClick={() => startEdit(child)}
                className="rounded-full p-2 text-rally-muted hover:bg-rally-bg"
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
        ))}

        {children.length === 0 && !showForm && (
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-rally-text">No kids yet</p>
            <p className="mt-1 text-[13px] text-rally-muted">
              Add your children to start tracking their activities
            </p>
          </div>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <div className="mt-4 animate-slide-in rounded-xl bg-rally-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-rally-text">
                {editingId ? 'Edit child' : 'Add a child'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="p-1 text-rally-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-rally-border bg-rally-bg px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
              />
              <input
                type="text"
                placeholder="School (optional)"
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
                className="w-full rounded-lg border border-rally-border bg-rally-bg px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
              />
              <input
                type="text"
                placeholder="Grade (optional)"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full rounded-lg border border-rally-border bg-rally-bg px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
              />

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-rally-muted">
                  Color
                </p>
                <div className="flex gap-2">
                  {CHILD_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className="h-9 w-9 rounded-full transition-transform"
                      style={{
                        backgroundColor: c,
                        transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: form.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-rally-purple py-3 text-[15px] font-semibold text-white disabled:opacity-50"
              >
                <Save size={14} /> {editingId ? 'Save changes' : 'Add child'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
