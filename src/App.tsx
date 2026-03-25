import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase, type Profile } from './lib/supabase'
import BottomNav from './components/BottomNav'
import Onboarding from './pages/Onboarding'
import Today from './pages/Today'
import Upload from './pages/Upload'
import Calendar from './pages/Calendar'
import Kids from './pages/Kids'
import Settings from './pages/Settings'

export default function App() {
  const [session, setSession] = useState<boolean | null>(null) // null = loading
  const [profile, setProfile] = useState<Profile | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        loadProfile(s.user.id)
      } else {
        setSession(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (s?.user) {
          loadProfile(s.user.id)
        } else {
          setSession(false)
          setProfile(null)
          setFamilyId(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data?.family_id) {
      setProfile(data)
      setFamilyId(data.family_id)
      setSession(true)
    } else {
      // User exists but no family setup yet
      setSession(false)
    }
  }

  function handleOnboardingComplete() {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) loadProfile(user.id)
    })
  }

  function handleLogout() {
    setSession(false)
    setProfile(null)
    setFamilyId(null)
  }

  // Loading
  if (session === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rally-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rally-purple/20 border-t-rally-purple" />
      </div>
    )
  }

  // Not authenticated or no family
  if (!session || !profile || !familyId) {
    return (
      <PhoneShell>
        <Onboarding onComplete={handleOnboardingComplete} />
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      {/* Status bar */}
      <div className="flex items-center justify-between bg-white px-5 py-1.5">
        <span className="font-mono text-[12px] font-medium text-rally-text">
          9:41
        </span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-2.5 w-[3px] rounded-sm bg-rally-text"
                style={{ opacity: i <= 3 ? 1 : 0.3 }}
              />
            ))}
          </div>
          <span className="ml-1 text-[11px] font-medium text-rally-text">
            5G
          </span>
          <svg
            width="22"
            height="11"
            viewBox="0 0 22 11"
            fill="none"
            className="ml-1"
          >
            <rect
              x="0.5"
              y="0.5"
              width="18"
              height="10"
              rx="2"
              stroke="#1A1A18"
              strokeWidth="1"
            />
            <rect x="2" y="2" width="12" height="7" rx="1" fill="#1A1A18" />
            <rect x="20" y="3" width="2" height="5" rx="1" fill="#1A1A18" />
          </svg>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Today familyId={familyId} profile={profile} />} />
        <Route path="/upload" element={<Upload familyId={familyId} />} />
        <Route path="/calendar" element={<Calendar familyId={familyId} />} />
        <Route path="/kids" element={<Kids familyId={familyId} />} />
        <Route
          path="/settings"
          element={
            <Settings
              familyId={familyId}
              profile={profile}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <BottomNav />
    </PhoneShell>
  )
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-rally-bg md:flex md:items-start md:justify-center md:py-8">
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-xl md:min-h-[812px] md:rounded-[2.5rem] md:border md:border-rally-border">
        {children}
      </div>
    </div>
  )
}
