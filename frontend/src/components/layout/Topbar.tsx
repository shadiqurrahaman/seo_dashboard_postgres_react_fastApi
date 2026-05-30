interface Props {
  title: string
  sub?: string
  children?: React.ReactNode
}

export default function Topbar({ title, sub, children }: Props) {
  return (
    <div className="topbar">
      <div>
        <div className="breadcrumb">Analytics / <b>{title}</b></div>
      </div>
      <div className="topbar-spacer" />
      {children}
    </div>
  )
}
