import { useState } from 'react'

// Click-to-load facade: show the poster until the viewer opts in, then swap in
// the real player. Keeps YouTube's ~1MB of script (and its permissions-policy
// console noise) off the page until it is actually wanted.
export default function YouTubeEmbed({ id, title }) {
  const [activated, setActivated] = useState(false)

  if (activated) {
    return (
      <div className="youtube-embed youtube-embed--active">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      className="youtube-embed youtube-embed--facade"
      aria-label={`Play video: ${title}`}
      onClick={() => setActivated(true)}
    >
      <img
        className="youtube-embed__poster"
        src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className="youtube-embed__play" aria-hidden="true" />
    </button>
  )
}
