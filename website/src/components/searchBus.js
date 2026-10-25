// Open the search dialog from anywhere.
export const openSearch = () => window.dispatchEvent(new CustomEvent('site:search'))
