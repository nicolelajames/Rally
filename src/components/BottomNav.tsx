import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, Settings } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Today', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/kids', label: 'Kids', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-rally-border bg-white/95 backdrop-blur-lg">
      <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors"
            >
              <Icon
                size={22}
                className={active ? 'text-rally-purple' : 'text-rally-muted'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold ${
                  active ? 'text-rally-purple' : 'text-rally-muted'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
