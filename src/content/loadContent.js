import { parse } from 'yaml'
import contentSource from './site.yaml?raw'
import { hydrateContent } from './hydrateContent.js'
import { validateContent } from './validateContent.js'

export const rawSiteContent = validateContent(parse(contentSource))
export const siteContent = hydrateContent(rawSiteContent)
