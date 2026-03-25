import { Bell } from 'lucide-react'

export default function TopHeader() {
  const today = new Date()
  const formatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="flex items-center justify-between px-5 py-3">
      <h1 className="text-[22px] font-bold tracking-tight text-rally-text">
        Rally
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-rally-muted">{formatted}</span>
        <button className="relative p-1">
          <Bell size={20} className="text-rally-muted" />
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-rally-danger" />
        </button>
      </div>
    </header>
  )
}
