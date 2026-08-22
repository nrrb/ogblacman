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
  string(value.accent, `${path}.accent`)
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

export function validateContent(content) {
  object(content, 'root')
  object(content.accessibility, 'accessibility')
  string(content.accessibility.slider_dot_label, 'accessibility.slider_dot_label')
  string(content.accessibility.previous_slide_label, 'accessibility.previous_slide_label')
  string(content.accessibility.next_slide_label, 'accessibility.next_slide_label')

  object(content.shared, 'shared')
  object(content.shared.style_images, 'shared.style_images')
  for (const key of ['primary_gradient', 'secondary_gradient', 'grain_overlay', 'grain_background']) {
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
  for (const name of ['hero', 'about', 'why', 'how', 'studios', 'clients', 'contact']) {
    const section = object(sections[name], `sections.${name}`)
    heading(section.heading, `sections.${name}.heading`)
  }
  video(sections.hero.media.desktop, 'sections.hero.media.desktop')
  video(sections.hero.media.mobile, 'sections.hero.media.mobile')
  link(sections.hero.cta, 'sections.hero.cta')
  image(sections.about.image, 'sections.about.image')
  string(sections.about.copy, 'sections.about.copy')
  link(sections.about.cta, 'sections.about.cta')
  string(sections.why.copy, 'sections.why.copy')
  string(sections.studios.copy, 'sections.studios.copy')
  link(sections.studios.cta, 'sections.studios.cta')
  for (const name of ['about', 'why', 'how', 'studios', 'clients', 'contact']) {
    video(sections[name].mobile_media, `sections.${name}.mobile_media`)
  }
  array(sections.how.copy_columns, 'sections.how.copy_columns').forEach((value, index) => string(value, `sections.how.copy_columns[${index}]`))

  object(content.case_studies, 'case_studies')
  heading(content.case_studies.heading, 'case_studies.heading')
  video(content.case_studies.mobile_media, 'case_studies.mobile_media')
  const caseStudies = array(content.case_studies.items, 'case_studies.items')
  uniqueIds(caseStudies, 'case_studies.items')
  caseStudies.forEach((item, index) => {
    string(item.title, `case_studies.items[${index}].title`)
    string(item.year, `case_studies.items[${index}].year`)
    string(item.url, `case_studies.items[${index}].url`)
    string(item.link_title, `case_studies.items[${index}].link_title`)
  })

  object(content.clients, 'clients')
  const clients = array(content.clients.items, 'clients.items')
  uniqueIds(clients, 'clients.items')
  clients.forEach((item, index) => {
    string(item.label, `clients.items[${index}].label`)
    string(item.url, `clients.items[${index}].url`)
    string(item.link_title, `clients.items[${index}].link_title`)
  })

  object(content.carousel, 'carousel')
  const carousel = array(content.carousel.items, 'carousel.items')
  uniqueIds(carousel, 'carousel.items')
  carousel.forEach((item, index) => {
    image(item.image, `carousel.items[${index}].image`)
    link(item.link, `carousel.items[${index}].link`, { optional: true })
  })

  object(content.form, 'form')
  string(content.form.required_marker, 'form.required_marker')
  const fields = array(content.form.fields, 'form.fields')
  uniqueIds(fields, 'form.fields')
  fields.forEach((field, index) => {
    string(field.name, `form.fields[${index}].name`)
    string(field.type, `form.fields[${index}].type`)
    string(field.label, `form.fields[${index}].label`)
    string(field.placeholder, `form.fields[${index}].placeholder`)
    if (typeof field.required !== 'boolean') fail(`form.fields[${index}].required`, 'expected a boolean')
  })
  for (const key of ['submit_label', 'wait_label', 'success_message', 'error_message']) string(content.form[key], `form.${key}`)

  object(content.footer, 'footer')
  string(content.footer.copyright, 'footer.copyright')
  return content
}
