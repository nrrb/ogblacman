import { copyFile, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join, relative, sep } from 'node:path'

const distDirectory = new URL('../dist/', import.meta.url)
const distPath = fileURLToPath(distDirectory)
const siteUrl = (process.env.VITE_SITE_URL || 'https://ogblacman.com').replace(/\/$/, '')

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? findHtmlFiles(path) : path
    }),
  )

  return files.flat().filter((path) => path.endsWith('.html'))
}

const htmlFiles = await findHtmlFiles(distPath)
const routes = htmlFiles
  .map((path) => relative(distPath, path).split(sep).join('/'))
  .filter((path) => !['200.html', '404.html'].includes(path))
  .map((path) => (path === 'index.html' ? '/' : `/${path.replace(/\.html$/, '')}`))
  .sort()

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`),
  '</urlset>',
  '',
].join('\n')

await Promise.all([
  copyFile(new URL('index.html', distDirectory), new URL('200.html', distDirectory)),
  copyFile(new URL('index.html', distDirectory), new URL('404.html', distDirectory)),
  writeFile(new URL('CNAME', distDirectory), 'ogblacman.surge.sh\n'),
  writeFile(new URL('robots.txt', distDirectory), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`),
  writeFile(new URL('sitemap.xml', distDirectory), sitemap),
])
