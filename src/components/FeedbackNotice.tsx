import { useEffect } from 'react'
import { Close } from './Icons'
import './FeedbackNotice.css'

/* In-app notification: the coordinator's review has arrived. Slides in from the top of the app. */
export default function FeedbackNotice({
  changes,
  approved,
  onView,
  onClose,
}: {
  changes: number
  approved: number
  onView: () => void
  onClose: () => void
}) {
  // Leaves by itself after a while; the feedback icon keeps the badge.
  useEffect(() => {
    const t = setTimeout(onClose, 12000)
    return () => clearTimeout(t)
  }, [onClose])

  const parts = [
    changes ? `${changes} pointer${changes > 1 ? 's need' : ' needs'} work` : '',
    approved ? `${approved} approved` : '',
  ].filter(Boolean)

  return (
    <div className="fn" role="status" aria-live="polite">
      <span className="fn__icon" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <button className="fn__body" onClick={onView}>
        <span className="fn__title">Your coordinator reviewed your resume</span>
        <span className="fn__text">{parts.join(' · ')}</span>
      </button>
      <button className="fn__view" onClick={onView}>
        View
      </button>
      <button className="fn__close" aria-label="Dismiss" onClick={onClose}>
        <Close size={16} />
      </button>
    </div>
  )
}
