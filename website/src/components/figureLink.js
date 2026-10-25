// Figures open in a lightbox over the current page through the ?fig= search
// parameter, so a figure link keeps the reader where they are.
export function figureHref(location, id) {
  const params = new URLSearchParams(location.search)
  params.set('fig', id)
  return { pathname: location.pathname, search: `?${params.toString()}` }
}
