import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowRight, Plus, UserPlus } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

const CHILD_COLORS = ['#7F77DD', '#1D9E75', '#D85A30', '#BA7517', '#3B82F6', '#EC4899']

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)

  // Step 2
  const [familyName, setFamilyName] = useState('')
  const [joinMode, setJoinMode] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  // Step 3
  const [kids, setKids] = useState([{ name: '', color: CHILD_COLORS[0] }])

  async function handleAuth() {
    setLoading(true)
    setAuthError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        setAuthError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setAuthError(error.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)

    if (isSignUp) {
      setStep(2)
    } else {
      // Existing user — check if they have a family
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single()
        if (profile?.family_id) {
          onComplete()
        } else {
          setStep(2)
        }
      }
    }
  }

  async function handleFamilySetup() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (joinMode) {
      // Join existing family
      const { data: family, error } = await supabase
        .from('families')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase().trim())
        .single()

      if (error || !family) {
        setAuthError('Invalid invite code')
        setLoading(false)
        return
      }

      await supabase.from('profiles').upsert({
        id: user.id,
        family_id: family.id,
        full_name: fullName || user.email,
        role: 'coparent',
      })

      setLoading(false)
      onComplete()
    } else {
      // Create new family
      const { data: family, error } = await supabase
        .from('families')
        .insert({ name: familyName })
        .select()
        .single()

      if (error || !family) {
        setAuthError('Failed to create family')
        setLoading(false)
        return
      }

      await supabase.from('profiles').upsert({
        id: user.id,
        family_id: family.id,
        full_name: fullName || user.email,
        role: 'parent',
      })

      setLoading(false)
      setStep(3)
    }
  }

  async function handleAddKids() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', user.id)
      .single()

    if (!profile?.family_id) return

    const validKids = kids.filter((k) => k.name.trim())
    if (validKids.length > 0) {
      await supabase.from('children').insert(
        validKids.map((k) => ({
          family_id: profile.family_id,
          name: k.name.trim(),
          color: k.color,
        }))
      )
    }

    setLoading(false)
    onComplete()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-rally-bg px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <h1 className="mb-2 text-center text-3xl font-bold text-rally-text">
          Rally
        </h1>
        <p className="mb-8 text-center text-[13px] text-rally-muted">
          Family activity command center
        </p>

        {/* Step indicators */}
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                s <= step ? 'bg-rally-purple' : 'bg-rally-muted/20'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Auth */}
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-semibold text-rally-text">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>

            {isSignUp && (
              <input
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-rally-border bg-rally-card px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-rally-border bg-rally-card px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-rally-border bg-rally-card px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
            />

            {authError && (
              <p className="text-[13px] text-rally-danger">{authError}</p>
            )}

            <button
              onClick={handleAuth}
              disabled={loading || !email || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rally-purple py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Sign in'}
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setAuthError('')
              }}
              className="w-full text-center text-[13px] text-rally-purple"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        )}

        {/* Step 2: Family setup */}
        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-semibold text-rally-text">
              Set up your family
            </h2>

            {!joinMode ? (
              <>
                <input
                  type="text"
                  placeholder="Family name (e.g., The Martinez Family)"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full rounded-xl border border-rally-border bg-rally-card px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
                />
                <button
                  onClick={handleFamilySetup}
                  disabled={loading || !familyName.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rally-purple py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create family'}
                  <ArrowRight size={16} />
                </button>
                <div className="relative my-2 flex items-center">
                  <div className="flex-1 border-t border-rally-border" />
                  <span className="px-3 text-[13px] text-rally-muted">or</span>
                  <div className="flex-1 border-t border-rally-border" />
                </div>
                <button
                  onClick={() => setJoinMode(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rally-border bg-rally-card py-3.5 text-[15px] font-medium text-rally-text"
                >
                  <UserPlus size={16} /> Join an existing family
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full rounded-xl border border-rally-border bg-rally-card px-4 py-3 text-center font-mono text-lg tracking-widest focus:border-rally-purple focus:outline-none"
                />
                {authError && (
                  <p className="text-[13px] text-rally-danger">{authError}</p>
                )}
                <button
                  onClick={handleFamilySetup}
                  disabled={loading || inviteCode.length < 4}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rally-purple py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join family'}
                </button>
                <button
                  onClick={() => {
                    setJoinMode(false)
                    setAuthError('')
                  }}
                  className="w-full text-center text-[13px] text-rally-purple"
                >
                  Create a new family instead
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Add kids */}
        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-semibold text-rally-text">
              Add your kids
            </h2>
            <p className="text-[13px] text-rally-muted">
              Add the children in your household
            </p>

            {kids.map((kid, i) => (
              <div key={i} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Child's name"
                  value={kid.name}
                  onChange={(e) => {
                    const updated = [...kids]
                    updated[i].name = e.target.value
                    setKids(updated)
                  }}
                  className="flex-1 rounded-xl border border-rally-border bg-rally-card px-4 py-3 text-[15px] focus:border-rally-purple focus:outline-none"
                />
                <div className="flex gap-1">
                  {CHILD_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        const updated = [...kids]
                        updated[i].color = c
                        setKids(updated)
                      }}
                      className={`h-10 w-10 rounded-full transition-transform ${
                        kid.color === c ? 'scale-110 ring-2 ring-offset-1' : ''
                      }`}
                      style={{
                        backgroundColor: c,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                setKids([
                  ...kids,
                  { name: '', color: CHILD_COLORS[kids.length % CHILD_COLORS.length] },
                ])
              }
              className="flex items-center gap-2 text-[13px] font-medium text-rally-purple"
            >
              <Plus size={14} /> Add another child
            </button>

            <button
              onClick={handleAddKids}
              disabled={loading || !kids.some((k) => k.name.trim())}
              className="w-full rounded-xl bg-rally-purple py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Setting up...' : "Let's go!"}
            </button>

            <button
              onClick={() => {
                setKids([])
                handleAddKids()
              }}
              className="w-full text-center text-[13px] text-rally-muted"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
