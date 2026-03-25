import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { supabase, type Profile, type Family } from '../lib/supabase'
import CoParentInvite from '../components/CoParentInvite'

interface SettingsProps {
  familyId: string
  profile: Profile
  onLogout: () => void
}

export default function Settings({ familyId, profile, onLogout }: SettingsProps) {
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<Profile[]>([])

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId])

  async function loadSettings() {
    const [familyRes, membersRes] = await Promise.all([
      supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single(),
      supabase
        .from('profiles')
        .select('*')
        .eq('family_id', familyId),
    ])

    setFamily(familyRes.data)
    setMembers(membersRes.data || [])
  }

  async function handleJoinFamily(newFamilyId: string) {
    await supabase
      .from('profiles')
      .update({ family_id: newFamilyId })
      .eq('id', profile.id)

    window.location.reload()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div className="pb-24">
      <div className="px-5 py-4">
        <h2 className="text-xl font-semibold text-rally-text">Settings</h2>
      </div>

      <div className="px-5">
        {/* Account section */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-rally-muted">
          Account
        </p>
        <div className="mb-6 rounded-xl bg-rally-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-semibold text-white"
              style={{ backgroundColor: profile.avatar_color }}
            >
              {(profile.full_name || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[15px] font-medium text-rally-text">
                {profile.full_name || 'User'}
              </p>
              <p className="text-[13px] capitalize text-rally-muted">
                {profile.role}
              </p>
            </div>
          </div>
        </div>

        {/* Family & sharing */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-rally-muted">
          Family & sharing
        </p>
        {family && (
          <div className="mb-4 rounded-xl bg-rally-card p-4 shadow-sm">
            <p className="text-[15px] font-medium text-rally-text">
              {family.name}
            </p>
            <p className="text-[13px] text-rally-muted">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <CoParentInvite
          inviteCode={family?.invite_code || '------'}
          familyMembers={members}
          onJoinFamily={handleJoinFamily}
        />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-rally-danger/30 py-3 text-[15px] font-medium text-rally-danger"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  )
}
