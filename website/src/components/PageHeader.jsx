// The top block of every page except the home page.
export default function PageHeader({ eyebrow, title, children, aside = null }) {
  return (
    <header className="page-header">
      <div className="page-header-bg" aria-hidden="true" />
      <div className="container page-header-inner">
        <div className="page-header-text hero-in">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {children && <div className="page-lead">{children}</div>}
        </div>
        {aside && <div className="page-header-aside hero-in" style={{ '--i': 2 }}>{aside}</div>}
      </div>
    </header>
  )
}
