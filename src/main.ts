import { nextTick } from 'vue'
import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'

import { initAnalytics, trackPageView } from './analytics'
import App from './App.vue'
import { routes } from './router'
import './styles/main.css'

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, isClient }) => {
    app.use(createPinia())

    if (!isClient) return

    initAnalytics()
    router.afterEach((to) => {
      // usePageMeta sets the title during navigation, so wait for the DOM to
      // flush before reading it.
      void nextTick(() => {
        trackPageView(to.fullPath, document.title)
      })
    })
  },
)
