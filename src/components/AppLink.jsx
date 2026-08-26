import { sectionHref } from '../content/sectionVisibility.js'

export default function AppLink({ link, children, ...rest }) {
  const href = link?.disabled
    ? null
    : link?.type === 'section'
      ? sectionHref(link.section)
      : link?.url
  const opensNewTab = link?.type === 'external'
  const content = children ?? link?.label

  if (!href) {
    return (
      <span aria-disabled={link?.disabled ? 'true' : undefined} {...rest}>
        {content}
      </span>
    )
  }

  return (
    <a
      href={href}
      target={opensNewTab ? '_blank' : undefined}
      rel={opensNewTab ? 'noopener noreferrer' : undefined}
      aria-label={link.ariaLabel || undefined}
      {...rest}
    >
      {content}
    </a>
  )
}
