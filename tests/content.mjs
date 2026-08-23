import fs from 'node:fs'
import { parse } from 'yaml'
import { validateContent } from '../src/content/validateContent.js'

const source = fs.readFileSync(new URL('../src/content/site.yaml', import.meta.url), 'utf8')
const content = validateContent(parse(source))

if (content.sections.upcoming_shows.items.length !== 3) throw new Error('Expected three seeded show placeholders')
if (!Array.isArray(content.sections.merch.items)) throw new Error('Merch items must be expandable')
if (content.sections.newsletter.form.fields.find(field => field.id === 'name').required) throw new Error('Newsletter name must be optional')
if (!content.sections.newsletter.form.fields.find(field => field.id === 'email').required) throw new Error('Newsletter email must be required')
if (content.sections.top_pick.player.track_src !== '/music/OG Blacman -- Time Not Real [Official Video].m4a') {
  throw new Error('Top pick must use the local Time Not Real track')
}
if (content.sections.top_pick.streaming_links !== undefined) throw new Error('Top pick external streaming links must be removed')

const expanded = structuredClone(content)
expanded.sections.merch.items.push({
  id: 'content-test-product',
  image: { src: '/assets/reference/test-product.png', alt: 'Content test product' },
  link: { label: 'Test product', url: 'https://example-shop.fourthwall.com/products/test', title: 'View the test product' },
})
validateContent(expanded)
if (expanded.sections.merch.items.length !== content.sections.merch.items.length + 1) throw new Error('Merch carousel did not accept an additional item')

const duplicate = structuredClone(content)
duplicate.sections.upcoming_shows.items.push(structuredClone(duplicate.sections.upcoming_shows.items[0]))
let duplicateRejected = false
try {
  validateContent(duplicate)
} catch (error) {
  duplicateRejected = error.message.includes('duplicate ID')
}
if (!duplicateRejected) throw new Error('Duplicate collection IDs must be rejected')

console.log('YAML content schema and expandable collections passed.')
