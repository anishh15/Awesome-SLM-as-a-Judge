import { Link, useRouteError } from 'react-router-dom'

export default function RouteError() {
  const error = useRouteError()
  return (
    <div className="container error-page">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="page-title">This page could not load</h1>
      <p className="prose">{error?.statusText || error?.message || 'An unexpected error happened.'} Reloading usually fixes it after the site has been updated.</p>
      <p style={{ marginTop: 24 }}><Link className="btn btn-primary" to="/">Back to the overview</Link></p>
    </div>
  )
}
