import { parse } from 'yaml'
import contentSource from './site.yaml?raw'
import { validateContent } from './validateContent.js'

export const siteContent = validateContent(parse(contentSource))
