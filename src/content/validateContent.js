function fail(path, message) {
  throw new Error(`Content validation failed at ${path}: ${message}`)
}

function object(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'expected an object')
  return value
}

function array(value, path) {
  if (!Array.isArray(value)) fail(path, 'expected an array')
  return value
}

function string(value, path, { empty = false } = {}) {
  if (typeof value !== 'string' || (!empty && !value.trim())) fail(path, 'expected a non-empty string')
  return value
}

function hexColor(value, path) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) fail(path, 'expected a six-digit hex color')
  return value
}

function uniqueIds(items, path) {
  const ids = new Set()
  items.forEach((item, index) => {
    object(item, `${path}[${index}]`)
    const id = string(item.id, `${path}[${index}].id`)
    if (ids.has(id)) fail(`${path}[${index}].id`, `duplicate ID "${id}"`)
    ids.add(id)
  })
}

function image(value, path) {
  object(value, path)
  string(value.src, `${path}.src`)
  string(value.alt, `${path}.alt`, { empty: true })
  if (value.sizes !== undefined) string(value.sizes, `${path}.sizes`)
  if (value.sources !== undefined) {
    array(value.sources, `${path}.sources`).forEach((source, index) => {
      object(source, `${path}.sources[${index}]`)
      string(source.src, `${path}.sources[${index}].src`)
      if (!Number.isFinite(source.width) || source.width <= 0) fail(`${path}.sources[${index}].width`, 'expected a positive number')
    })
  }
}

function video(value, path) {
  object(value, path)
  string(value.poster, `${path}.poster`)
  array(value.sources, `${path}.sources`).forEach((source, index) => {
    object(source, `${path}.sources[${index}]`)
    string(source.src, `${path}.sources[${index}].src`)
    string(source.type, `${path}.sources[${index}].type`)
  })
}

function heading(value, path) {
  object(value, path)
  string(value.title, `${path}.title`)
}

function link(value, path, { optional = false } = {}) {
  if (value == null && optional) return
  object(value, path)
  if (value.url != null) string(value.url, `${path}.url`)
  if (value.label !== undefined) string(value.label, `${path}.label`)
  if (value.title != null) {
    string(value.title, `${path}.title`)
    if (value.url == null) fail(`${path}.url`, 'is required when a link title is provided')
  }
}

function form(value, path) {
  object(value, path)
  string(value.required_marker, `${path}.required_marker`)
  const fields = array(value.fields, `${path}.fields`)
  uniqueIds(fields, `${path}.fields`)
  fields.forEach((field, index) => {
    string(field.name, `${path}.fields[${index}].name`)
    string(field.type, `${path}.fields[${index}].type`)
    string(field.label, `${path}.fields[${index}].label`)
    string(field.placeholder, `${path}.fields[${index}].placeholder`)
    if (typeof field.required !== 'boolean') fail(`${path}.fields[${index}].required`, 'expected a boolean')
  })
  for (const key of ['submit_label', 'wait_label', 'success_message', 'error_message']) {
    string(value[key], `${path}.${key}`)
  }
  return fields
}

export function validateContent(content) {
  object(content, 'root')
  object(content.accessibility, 'accessibility')
  string(content.accessibility.slider_dot_label, 'accessibility.slider_dot_label')
  string(content.accessibility.previous_slide_label, 'accessibility.previous_slide_label')
  string(content.accessibility.next_slide_label, 'accessibility.next_slide_label')

  object(content.mobile, 'mobile')
  if (typeof content.mobile.continuous_scroll !== 'boolean') {
    fail('mobile.continuous_scroll', 'expected a boolean')
  }

  object(content.theme, 'theme')
  hexColor(content.theme.heading_outline_color, 'theme.heading_outline_color')

  object(content.shared, 'shared')
  object(content.shared.style_images, 'shared.style_images')
  for (const key of ['secondary_gradient', 'grain_overlay', 'grain_background']) {
    string(content.shared.style_images[key], `shared.style_images.${key}`)
  }
  image(content.shared.arrow, 'shared.arrow')
  image(content.shared.texture, 'shared.texture')

  const socialLinks = array(content.social_links, 'social_links')
  uniqueIds(socialLinks, 'social_links')
  socialLinks.forEach((item, index) => {
    string(item.label, `social_links[${index}].label`)
    string(item.url, `social_links[${index}].url`)
    if (item.title !== undefined) string(item.title, `social_links[${index}].title`)
    image(item.icon, `social_links[${index}].icon`)
  })

  const sections = object(content.sections, 'sections')
  for (const name of ['hero', 'top_pick', 'upcoming_shows', 'booking', 'merch', 'newsletter']) {
    const section = object(sections[name], `sections.${name}`)
    heading(section.heading, `sections.${name}.heading`)
  }
  video(sections.hero.media.desktop, 'sections.hero.media.desktop')
  video(sections.hero.media.mobile, 'sections.hero.media.mobile')
  link(sections.hero.cta, 'sections.hero.cta')
  object(sections.top_pick.player, 'sections.top_pick.player')
  string(sections.top_pick.player.title, 'sections.top_pick.player.title')
  string(sections.top_pick.player.artist, 'sections.top_pick.player.artist')
  string(sections.top_pick.player.track_src, 'sections.top_pick.player.track_src')
  if (!Number.isFinite(sections.top_pick.player.duration) || sections.top_pick.player.duration <= 0) {
    fail('sections.top_pick.player.duration', 'expected a positive number')
  }

  string(sections.upcoming_shows.copy, 'sections.upcoming_shows.copy')
  const shows = array(sections.upcoming_shows.items, 'sections.upcoming_shows.items')
  uniqueIds(shows, 'sections.upcoming_shows.items')
  shows.forEach((item, index) => {
    link(item, `sections.upcoming_shows.items[${index}]`)
    string(item.meta, `sections.upcoming_shows.items[${index}].meta`)
    string(item.action_label, `sections.upcoming_shows.items[${index}].action_label`)
  })

  object(sections.booking.manager, 'sections.booking.manager')
  for (const key of ['role', 'name', 'email', 'phone']) {
    string(sections.booking.manager[key], `sections.booking.manager.${key}`)
  }

  string(sections.merch.copy, 'sections.merch.copy')
  link(sections.merch.cta, 'sections.merch.cta')
  const merchItems = array(sections.merch.items, 'sections.merch.items')
  uniqueIds(merchItems, 'sections.merch.items')
  merchItems.forEach((item, index) => {
    image(item.image, `sections.merch.items[${index}].image`)
    link(item.link, `sections.merch.items[${index}].link`)
  })

  const newsletterFields = form(sections.newsletter.form, 'sections.newsletter.form')
  const nameField = newsletterFields.find(field => field.id === 'name')
  const emailField = newsletterFields.find(field => field.id === 'email')
  if (!nameField || nameField.required) fail('sections.newsletter.form.fields', 'name field must exist and be optional')
  if (!emailField || emailField.type !== 'email' || !emailField.required) {
    fail('sections.newsletter.form.fields', 'email field must exist, use type email, and be required')
  }

  for (const name of ['top_pick', 'upcoming_shows', 'booking', 'merch', 'newsletter']) {
    video(sections[name].mobile_media, `sections.${name}.mobile_media`)
  }

  object(content.footer, 'footer')
  string(content.footer.copyright, 'footer.copyright')
  return content
}
