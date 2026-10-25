import { Link } from 'react-router-dom'
import useTitle from '../lib/useTitle.js'
import { openSearch } from '../components/searchBus.js'

export default function NotFound() {
  useTitle('Page not found')
  return (
    <div className="container error-page">
      <p className="eyebrow">404</p>
      <h1 className="page-title">There is no page here</h1>
      <p className="prose">The link may be out of date. The overview links to every part of the survey, and search finds any work, figure or section.</p>
      <div className="btn-row" style={{ marginTop: 24 }}>
        <Link className="btn btn-primary" to="/" viewTransition>Go to the overview</Link>
        <button type="button" className="btn btn-secondary" onClick={openSearch}>Search the site</button>
      </div>
    </div>
  )
}
