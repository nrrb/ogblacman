export default function ResponsiveImage({ image, ...rest }) {
  const srcSet = image.sources?.map((source) => `${source.src} ${source.width}w`).join(', ')

  return (
    <img
      {...rest}
      src={image.src}
      srcSet={srcSet || undefined}
      sizes={image.sizes || undefined}
      alt={image.alt}
    />
  )
}
