const responsiveImage = (src, sizes, sources) => ({ src, sizes, sources })

export const presentation = Object.freeze({
  mobile: { continuousScroll: true },
  accessibility: {
    sliderDotLabel: 'Show slide {current} of {total}',
    previousSlideLabel: 'Previous slide',
    nextSlideLabel: 'Next slide',
  },
  integrations: {
    kit: {
      embedBaseUrl: 'https://og-blacman.kit.com',
      runtimeSrcPrefix: 'https://f.convertkit.com/ckjs/ck.',
    },
  },
  theme: {
    headingOutlineColor: '#EFBF04',
    headingOutlineWidth: 6,
  },
  sharedImages: {
    ctaArrow: { src: '/assets/reference/cta-arrow.png', alt: '' },
  },
  socialIcons: {
    instagram: { src: '/assets/reference/social-instagram-icon.svg', alt: '' },
    tiktok: responsiveImage(
      '/assets/reference/social-tiktok-icon.png',
      '(max-width: 1168px) 100vw, 1168px',
      [
        { src: '/assets/reference/social-tiktok-icon-500w.png', width: 500 },
        { src: '/assets/reference/social-tiktok-icon-800w.png', width: 800 },
        { src: '/assets/reference/social-tiktok-icon-1080w.png', width: 1080 },
        { src: '/assets/reference/social-tiktok-icon.png', width: 1168 },
      ],
    ),
  },
  images: {
    telephoneCover: responsiveImage(
      '/assets/telephone-cover.png',
      '(max-width: 767px) 81vw, 512px',
      [
        { src: '/assets/telephone-cover-96.webp', width: 96 },
        { src: '/assets/telephone-cover-160.webp', width: 160 },
        { src: '/assets/telephone-cover-320.webp', width: 320 },
        { src: '/assets/telephone-cover-640.webp', width: 640 },
        { src: '/assets/telephone-cover-1200.webp', width: 1200 },
      ],
    ),
    telephoneSocial: {
      src: '/assets/telephone-cover-social.jpg',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  audio: {
    telephone: { src: '/music/telephone.mp3' },
  },
  videos: {
    treePhone: {
      poster: '/assets/tree-phone/tree-phone-first.webp',
      sources: [
        { src: '/assets/tree-phone/tree-phone.mp4', type: 'video/mp4' },
      ],
    },
    heroDesktop: {
      poster: '/assets/hero/hero-montage-desktop-poster.jpg',
      sources: [
        { src: '/assets/hero/hero-montage-desktop.mp4', type: 'video/mp4' },
        { src: '/assets/hero/hero-montage-desktop.webm', type: 'video/webm' },
      ],
    },
    heroMobile: {
      poster: '/assets/hero/hero-montage-mobile-poster.jpg',
      sources: [
        { src: '/assets/hero/hero-montage-mobile.mp4', type: 'video/mp4' },
        { src: '/assets/hero/hero-montage-mobile.webm', type: 'video/webm' },
      ],
    },
    standardMobile: {
      poster: '/assets/reference/mobile-standard-background-poster.jpg?v=montage-v1',
      sources: [
        { src: '/assets/reference/mobile-standard-background.mp4?v=montage-v1', type: 'video/mp4' },
        { src: '/assets/reference/mobile-standard-background.webm?v=montage-v1', type: 'video/webm' },
      ],
    },
    merchMobile: {
      poster: '/assets/reference/mobile-studios-background-poster.jpg?v=montage-v1',
      sources: [
        { src: '/assets/reference/mobile-studios-background.mp4?v=montage-v1', type: 'video/mp4' },
        { src: '/assets/reference/mobile-studios-background.webm?v=montage-v1', type: 'video/webm' },
      ],
    },
    newsletterMobile: {
      poster: '/assets/reference/mobile-clients-background-poster.jpg?v=montage-v1',
      sources: [
        { src: '/assets/reference/mobile-clients-background.mp4?v=montage-v1', type: 'video/mp4' },
        { src: '/assets/reference/mobile-clients-background.webm?v=montage-v1', type: 'video/webm' },
      ],
    },
  },
})
