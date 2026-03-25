interface BadgePillProps {
  type: 'urgent' | 'warning' | 'info' | 'change' | null
  label: string | null
}

const badgeStyles: Record<string, { bg: string; text: string }> = {
  urgent: { bg: '#E24B4A', text: '#FFFFFF' },
  warning: { bg: '#BA7517', text: '#FFFFFF' },
  change: { bg: '#BA7517', text: '#FFFFFF' },
  info: { bg: '#3B82F6', text: '#FFFFFF' },
}

export default function BadgePill({ type, label }: BadgePillProps) {
  if (!type || !label) return null

  const style = badgeStyles[type] || badgeStyles.info

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  )
}
