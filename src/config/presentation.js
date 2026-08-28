const responsiveImage = (src, sizes, sources) => ({ src, sizes, sources })

export const assetVersions = Object.freeze({
  hero: 'hero-v2',
  mobileBackgrounds: 'montage-v1',
  reference: 'reference-v1',
  telephone: 'telephone-v1',
  treePhone: 'tree-phone-v2',
})

const versioned = (src, version) => `${src}?v=${version}`
const referenceAsset = src => versioned(src, assetVersions.reference)
const telephoneAsset = src => versioned(src, assetVersions.telephone)
const treePhoneAsset = src => versioned(src, assetVersions.treePhone)
const heroAsset = src => versioned(src, assetVersions.hero)
const mobileBackgroundAsset = src => versioned(src, assetVersions.mobileBackgrounds)

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
    ctaArrow: { src: referenceAsset('/assets/reference/cta-arrow.png'), alt: '' },
  },
  socialIcons: {
    instagram: { src: referenceAsset('/assets/reference/social-instagram-icon.svg'), alt: '' },
    youtube: responsiveImage(referenceAsset('/assets/reference/social-youtube-icon.png'), '(max-width: 1168px) 100vw, 1168px', [
      { src: referenceAsset('/assets/reference/social-youtube-icon-500w.png'), width: 500 },
      { src: referenceAsset('/assets/reference/social-youtube-icon.png'), width: 1168 },
    ]),
    spotify: { src: referenceAsset('/assets/reference/social-spotify-icon.svg'), alt: '' },
    appleMusic: { src: referenceAsset('/assets/reference/social-apple-music-icon.svg'), alt: '' },
    tiktok: responsiveImage(
      referenceAsset('/assets/reference/social-tiktok-icon.png'),
      '(max-width: 1168px) 100vw, 1168px',
      [
        { src: referenceAsset('/assets/reference/social-tiktok-icon-500w.png'), width: 500 },
        { src: referenceAsset('/assets/reference/social-tiktok-icon-800w.png'), width: 800 },
        { src: referenceAsset('/assets/reference/social-tiktok-icon-1080w.png'), width: 1080 },
        { src: referenceAsset('/assets/reference/social-tiktok-icon.png'), width: 1168 },
      ],
    ),
  },
  images: {
    telephoneCover: responsiveImage(
      telephoneAsset('/assets/telephone-cover.png'),
      '(max-width: 767px) 81vw, 512px',
      [
        { src: telephoneAsset('/assets/telephone-cover-96.webp'), width: 96 },
        { src: telephoneAsset('/assets/telephone-cover-160.webp'), width: 160 },
        { src: telephoneAsset('/assets/telephone-cover-320.webp'), width: 320 },
        { src: telephoneAsset('/assets/telephone-cover-640.webp'), width: 640 },
        { src: telephoneAsset('/assets/telephone-cover-1200.webp'), width: 1200 },
      ],
    ),
    telephoneSocial: {
      src: telephoneAsset('/assets/telephone-cover-social.jpg'),
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    },
  },
  audio: {
    telephone: { src: telephoneAsset('/music/telephone.mp3') },
  },
  videos: {
    treePhone: {
      poster: treePhoneAsset('/assets/tree-phone/tree-phone-first.webp'),
      sources: [
        { src: treePhoneAsset('/assets/tree-phone/tree-phone.mp4'), type: 'video/mp4' },
      ],
    },
    heroDesktop: {
      poster: heroAsset('/assets/hero/hero-montage-desktop-poster.jpg'),
      sources: [
        { src: heroAsset('/assets/hero/hero-montage-desktop.webm'), type: 'video/webm; codecs="vp9"' },
        { src: heroAsset('/assets/hero/hero-montage-desktop.mp4'), type: 'video/mp4; codecs="avc1.640028"' },
      ],
    },
    heroMobile: {
      poster: heroAsset('/assets/hero/hero-montage-mobile-poster.jpg'),
      sources: [
        { src: heroAsset('/assets/hero/hero-montage-mobile.webm'), type: 'video/webm; codecs="vp9"' },
        { src: heroAsset('/assets/hero/hero-montage-mobile.mp4'), type: 'video/mp4; codecs="avc1.640028"' },
      ],
    },
    standardMobile: {
      poster: mobileBackgroundAsset('/assets/reference/mobile-standard-background-poster.jpg'),
      sources: [
        { src: mobileBackgroundAsset('/assets/reference/mobile-standard-background.webm'), type: 'video/webm; codecs="vp9"' },
        { src: mobileBackgroundAsset('/assets/reference/mobile-standard-background.mp4'), type: 'video/mp4; codecs="avc1.640028"' },
      ],
    },
    merchMobile: {
      poster: mobileBackgroundAsset('/assets/reference/mobile-studios-background-poster.jpg'),
      sources: [
        { src: mobileBackgroundAsset('/assets/reference/mobile-studios-background.webm'), type: 'video/webm; codecs="vp9"' },
        { src: mobileBackgroundAsset('/assets/reference/mobile-studios-background.mp4'), type: 'video/mp4; codecs="avc1.640028"' },
      ],
    },
    newsletterMobile: {
      poster: mobileBackgroundAsset('/assets/reference/mobile-clients-background-poster.jpg'),
      sources: [
        { src: mobileBackgroundAsset('/assets/reference/mobile-clients-background.webm'), type: 'video/webm; codecs="vp9"' },
        { src: mobileBackgroundAsset('/assets/reference/mobile-clients-background.mp4'), type: 'video/mp4; codecs="avc1.640028"' },
      ],
    },
  },
})
