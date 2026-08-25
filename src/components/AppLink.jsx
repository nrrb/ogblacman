export default function AppLink({ link, children, ...rest }) {
  const rel = link.rel || (link.target === '_blank' ? 'noopener noreferrer' : undefined)
  const content = children ?? link.label

  if (!link.url) {
    return (
      <span title={link.title || undefined} {...rest}>
        {content}
      </span>
    )
  }

  return (
    <a
      href={link.url}
      title={link.title || undefined}
      target={link.target || undefined}
      rel={rel}
      {...rest}
    >
      {content}
    </a>
  )
}
