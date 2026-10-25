// Each page is its own chunk. The router and the background prefetch share
// these import functions.
export const pages = {
  survey: () => import('./pages/Survey.jsx'),
  insights: () => import('./pages/Insights.jsx'),
  challenges: () => import('./pages/Challenges.jsx'),
  papers: () => import('./pages/Papers.jsx'),
  figures: () => import('./pages/Figures.jsx'),
  cite: () => import('./pages/Cite.jsx'),
  notFound: () => import('./pages/NotFound.jsx'),
}

export function prefetchPages() {
  for (const load of Object.values(pages)) load().catch(() => {})
}
