import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"

export default function Landing() {
  const shellRef = useRef(null)

  useEffect(() => {
    const revealNodes = shellRef.current?.querySelectorAll(".reveal") || []

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16 }
    )

    revealNodes.forEach((node) => observer.observe(node))

    const onScroll = () => {
      if (!shellRef.current) return
      const rect = shellRef.current.getBoundingClientRect()
      const shift = Math.max(-120, Math.min(120, -rect.top * 0.12))
      shellRef.current.style.setProperty("--parallax-y", `${shift}px`)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <section className="landing-shell" ref={shellRef}>
      <div className="landing-shapes" aria-hidden="true">
        <span className="shape shape-ring" />
        <span className="shape shape-dot-grid" />
        <span className="shape shape-wave" />
      </div>

      <header className="landing-hero reveal">
        <p className="page-overline">Smart Exam Seating</p>
        <h1>Automate fair and conflict-free seating plans in minutes</h1>
        <p>
          SeatCraft helps institutions generate room-wise exam seating using room capacity,
          branch rosters, and subject conflict checks. It also produces printable attendance sheets
          ready for invigilation.
        </p>

        <div className="landing-actions">
          <Link to="/login" className="btn-primary">Get Started</Link>
          <Link to="/signup" className="btn-secondary">Create account</Link>
        </div>

        <div className="landing-kpis">
          <article>
            <h3>Capacity Aware</h3>
            <p>Prevents over-allocation by respecting room strength limits.</p>
          </article>
          <article>
            <h3>Conflict Control</h3>
            <p>Keeps subject conflicts separated while arranging rows.</p>
          </article>
          <article>
            <h3>Print First</h3>
            <p>Generates attendance sheets and final seating in one flow.</p>
          </article>
        </div>
      </header>

      <section className="landing-grid">
        <article className="reveal reveal-delay-1">
          <span>01</span>
          <h2>Room Management</h2>
          <p>
            Store room layouts, rows, columns, and strength limits so generation respects actual
            physical capacity.
          </p>
        </article>

        <article className="reveal reveal-delay-2">
          <span>02</span>
          <h2>Branch + Roll Import</h2>
          <p>
            Add student roll lists manually or upload CSV branch sheets for fast preparation before
            every exam.
          </p>
        </article>

        <article className="reveal reveal-delay-3">
          <span>03</span>
          <h2>Printable Outputs</h2>
          <p>
            Generate seating allocations and attendance charts room-wise with one-click print support.
          </p>
        </article>
      </section>

      <section className="landing-flow reveal">
        <h3>How it works</h3>
        <ol>
          <li>Configure rooms and branch/student data.</li>
          <li>Select rooms and branches for a specific exam.</li>
          <li>Generate, review, and print seating plus attendance sheets.</li>
        </ol>
      </section>

      <section className="landing-cta reveal reveal-delay-2">
        <h3>Ready to streamline your next exam seating?</h3>
        <p>Sign in and generate your first seating chart now.</p>
        <Link to="/login" className="btn-primary">Get Started</Link>
      </section>
    </section>
  )
}
