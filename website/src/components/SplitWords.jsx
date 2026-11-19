// Splits a plain-string heading into words so each can rise in turn; other content passes through.
export default function SplitWords({ children }) {
  if (typeof children !== 'string') return children
  const words = children.split(' ')
  return words.map((w, k) => (
    <span key={k}>
      <span className="split-w" style={{ '--w': k }}>{w}</span>{k < words.length - 1 ? ' ' : ''}
    </span>
  ))
}
