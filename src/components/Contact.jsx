import { useFadeIn } from '../hooks/useFadeIn.js'
import Envelope from './Envelope.jsx'
import './Contact.css'

export default function Contact() {
  const ref = useFadeIn()
  const B = import.meta.env.BASE_URL

  return (
    <section id="contact" className="contact section" ref={ref}>
      <div className="container">
        <p className="section-label" data-fade>04 / Contact</p>
        <h2 className="contact__title" data-fade>
          Dear <em>you</em>, thanks for reading.
        </h2>
        <div data-fade>
          <Envelope
            email="17395926498@163.com"
          />
        </div>
        <div className="contact__resume" data-fade>
          <span className="contact__resume-divider" aria-hidden="true" />
          <p className="contact__resume-hint">或者，如果你想要一份更正式的：</p>
          <a
            href={`${B}files/Shuangli-Resume.pdf`}
            download="Shuangli-Zhang-Resume.pdf"
            className="contact__resume-btn"
          >
            <span className="contact__resume-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
              </svg>
            </span>
            <span className="contact__resume-text">
              <span className="contact__resume-title">Resume · Shuangli Zhang</span>
              <span className="contact__resume-sub">PDF · 306 KB · updated 2026-07</span>
            </span>
            <span className="contact__resume-arrow" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}