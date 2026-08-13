import { useHead } from '@unhead/vue'

import { projectImages, siteUrl } from '@/content/site'

interface PageMeta {
  title: string
  description: string
  path: string
  image?: string
  noindex?: boolean
}

export function usePageMeta(meta: PageMeta) {
  const canonical = new URL(meta.path, siteUrl).toString()
  const image = new URL(meta.image || projectImages.tree, siteUrl).toString()

  useHead({
    title: meta.title,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { name: 'description', content: meta.description },
      ...(meta.noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: meta.title },
      { name: 'twitter:description', content: meta.description },
      { name: 'twitter:image', content: image },
    ],
  })
}
