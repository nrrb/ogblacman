import fs from 'node:fs'
import { parse } from 'yaml'
import { validateContent } from '../src/content/validateContent.js'

const source = fs.readFileSync(new URL('../src/content/site.yaml', import.meta.url), 'utf8')
const content = validateContent(parse(source))

if (content.case_studies.items.length !== 12) throw new Error('Expected twelve seeded case studies')
if (content.sections.upcoming_shows.items.length !== 3) throw new Error('Expected three seeded show placeholders')
if (!Array.isArray(content.sections.merch.items)) throw new Error('Merch items must be expandable')
if (content.sections.newsletter.form.fields.find(field => field.id === 'name').required) throw new Error('Newsletter name must be optional')
if (!content.sections.newsletter.form.fields.find(field => field.id === 'email').required) throw new Error('Newsletter email must be required')

const expanded = structuredClone(content)
expanded.sections.merch.items.push({
  id: 'content-test-product',
  image: { src: '/assets/reference/test-product.png', alt: 'Content test product' },
  link: { label: 'Test product', url: 'https://example-shop.fourthwall.com/products/test', title: 'View the test product' },
})
validateContent(expanded)
if (expanded.sections.merch.items.length !== content.sections.merch.items.length + 1) throw new Error('Merch carousel did not accept an additional item')

const duplicate = structuredClone(content)
duplicate.case_studies.items.push(structuredClone(duplicate.case_studies.items[0]))
let duplicateRejected = false
try {
  validateContent(duplicate)
} catch (error) {
  duplicateRejected = error.message.includes('duplicate ID')
}
if (!duplicateRejected) throw new Error('Duplicate collection IDs must be rejected')

console.log('YAML content schema and expandable collections passed.')
