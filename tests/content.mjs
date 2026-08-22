import fs from 'node:fs'
import { parse } from 'yaml'
import { validateContent } from '../src/content/validateContent.js'

const source = fs.readFileSync(new URL('../src/content/site.yaml', import.meta.url), 'utf8')
const content = validateContent(parse(source))

if (content.case_studies.items.length !== 12) throw new Error('Expected twelve seeded case studies')
if (content.clients.items.length !== 22) throw new Error('Expected twenty-two seeded clients')
if (!Array.isArray(content.carousel.items)) throw new Error('Carousel items must be expandable')

const expanded = structuredClone(content)
expanded.carousel.items.push({
  id: 'content-test-logo',
  image: { src: '/assets/reference/test-logo.png', alt: 'Content test logo' },
  link: { url: 'https://example.test', title: 'Visit the content test site' },
})
validateContent(expanded)
if (expanded.carousel.items.length !== content.carousel.items.length + 1) throw new Error('Carousel did not accept an additional item')

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
