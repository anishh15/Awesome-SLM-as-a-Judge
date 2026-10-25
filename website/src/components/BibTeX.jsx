import CopyButton from './CopyButton.jsx'

// BibTeX with light syntax colouring. The text is the exact string that is copied.
function highlight(text) {
  return text.split('\n').map((line, k) => {
    const head = /^@(\w+)\{([^,]+),$/.exec(line)
    if (head) return <span key={k}><span className="bib-type">@{head[1]}</span>{'{'}<span className="bib-key">{head[2]}</span>,{'\n'}</span>
    const field = /^(\s*)(\w+)(\s*=\s*)(.*)$/.exec(line)
    if (field) return <span key={k}>{field[1]}<span className="bib-field">{field[2]}</span>{field[3]}{field[4]}{'\n'}</span>
    return <span key={k}>{line}{k < text.split('\n').length - 1 ? '\n' : ''}</span>
  })
}

export default function BibTeX({ text, title = 'BibTeX' }) {
  return (
    <div className="bibtex">
      <div className="code-head">
        <span className="code-title">{title}</span>
        <CopyButton text={text} label="Copy BibTeX" />
      </div>
      <pre className="code-block"><code>{highlight(text)}</code></pre>
    </div>
  )
}
