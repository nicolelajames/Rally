import { useState } from 'react'
import { Copy, Share2, Check, UserPlus } from 'lucide-react'
import { supabase, type Profile } from '../lib/supabase'

interface CoParentInviteProps {
  inviteCode: string
  familyMembers: Profile[]
  onJoinFamily: (familyId: string) => void
}

export default function CoParentInvite({
  inviteCode,
  familyMembers,
  onJoinFamily,
}: CoParentInviteProps) {
  const [copied, setCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState('')

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: 'Join my family on Rally',
        text: `Use this code to join our family on Rally: ${inviteCode}`,
      })
    } else {
      handleCopy()
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError('')

    const { data: family, error } = await supabase
      .from('families')
      .select('id, name')
      .eq('invite_code', joinCode.toUpperCase().trim())
      .single()

    if (error || !family) {
      setJoinError('Invalid invite code. Please try again.')
      setJoining(false)
      return
    }

    onJoinFamily(family.id)
    setJoinSuccess(`You're now connected to ${family.name}!`)
    setJoining(false)
  }

  return (
    <div className="space-y-4">
      {/* Your family code */}
      <div className="rounded-xl bg-rally-card p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-rally-muted">
          Your family invite code
        </p>
        <p className="my-3 text-center font-mono text-3xl font-bold tracking-[0.2em] text-rally-purple">
          {inviteCode}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rally-purple py-2.5 text-[13px] font-semibold text-white"
          >
            <Share2 size={14} /> Share code
          </button>
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rally-purple/10 py-2.5 text-[13px] font-semibold text-rally-purple"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Join a family */}
      <div className="rounded-xl bg-rally-card p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-rally-muted">
          Join a co-parent's family
        </p>
        <input
          type="text"
          placeholder="Enter invite code..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="mb-3 w-full rounded-lg border border-rally-border bg-rally-bg px-4 py-3 text-center font-mono text-lg tracking-widest text-rally-text placeholder:text-rally-muted/50 focus:border-rally-purple focus:outline-none"
        />
        {joinError && (
          <p className="mb-2 text-[13px] text-rally-danger">{joinError}</p>
        )}
        {joinSuccess && (
          <p className="mb-2 text-[13px] text-rally-teal">{joinSuccess}</p>
        )}
        <button
          onClick={handleJoin}
          disabled={joining || joinCode.length < 4}
          className="w-full rounded-lg bg-rally-text py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
        >
          <span className="flex items-center justify-center gap-2">
            <UserPlus size={14} />
            {joining ? 'Joining...' : 'Join family'}
          </span>
        </button>
      </div>

      {/* Family members */}
      {familyMembers.length > 0 && (
        <div className="rounded-xl bg-rally-card p-5 shadow-sm">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-rally-muted">
            Family members
          </p>
          <div className="space-y-3">
            {familyMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ backgroundColor: member.avatar_color }}
                >
                  {(member.full_name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-rally-text">
                    {member.full_name || 'Unknown'}
                  </p>
                  <p className="text-[11px] capitalize text-rally-muted">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
