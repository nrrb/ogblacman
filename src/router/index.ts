import type { RouteRecordRaw } from 'vue-router'

import { releases } from '@/content/releases'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PrivacyView from '@/views/PrivacyView.vue'
import ReleaseView from '@/views/ReleaseView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  ...releases.map((release) => ({
    path: `/music/${release.slug}`,
    name: `release-${release.slug}`,
    component: ReleaseView,
    props: { releaseSlug: release.slug },
  })),
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]
