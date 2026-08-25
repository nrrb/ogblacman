import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

export default function TextCta({ cta, arrow, wrapperClass, arrowFirst = false }) {
  return (
    <div className={`text-cta ${wrapperClass}`}>
      {arrowFirst && <ResponsiveImage image={arrow} className="text-cta__arrow" loading="lazy" />}
      <AppLink link={cta} className="text-cta__label" />
      {!arrowFirst && <ResponsiveImage image={arrow} className="text-cta__arrow" loading="lazy" />}
    </div>
  )
}
