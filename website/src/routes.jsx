import { Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RouteError from './pages/RouteError.jsx'
import { pages } from './pageLoaders.js'
import Home from './pages/Home.jsx'

const lazy = (load) => async () => ({ Component: (await load()).default })

// /figures/2a opens the figure page with figure 2a in the lightbox.
function FigureRedirect() {
  const { id } = useParams()
  return <Navigate to={`/figures?fig=${encodeURIComponent(id)}`} replace />
}

export const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    // shown for the moment a deep link's page chunk loads
    hydrateFallbackElement: <div className="boot" aria-hidden="true" />,
    children: [
      { index: true, element: <Home /> },
      { path: 'survey', lazy: lazy(pages.survey) },
      { path: 'survey/:part', lazy: lazy(pages.survey) },
      { path: 'insights', lazy: lazy(pages.insights) },
      { path: 'insights/:id', lazy: lazy(pages.insights) },
      { path: 'challenges', lazy: lazy(pages.challenges) },
      { path: 'challenges/:id', lazy: lazy(pages.challenges) },
      { path: 'papers', lazy: lazy(pages.papers) },
      { path: 'papers/:category', lazy: lazy(pages.papers) },
      { path: 'figures', lazy: lazy(pages.figures) },
      { path: 'figures/:id', element: <FigureRedirect /> },
      { path: 'cite', lazy: lazy(pages.cite) },
      { path: '*', lazy: lazy(pages.notFound) },
    ],
  },
]
