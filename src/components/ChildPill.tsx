interface ChildPillProps {
  name: string
  color: string
  selected?: boolean
  onClick?: () => void
}

export default function ChildPill({ name, color, selected, onClick }: ChildPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
      style={{
        backgroundColor: selected ? color : `${color}18`,
        color: selected ? '#fff' : color,
        border: selected ? `2px solid ${color}` : '2px solid transparent',
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: selected ? '#fff' : color }}
      />
      {name}
    </button>
  )
}
