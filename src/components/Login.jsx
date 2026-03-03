import { useState } from "react"
import { Link } from "react-router-dom"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../firebase/firebase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setSubmitting(true)

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-shell">
      <aside className="auth-aside">
        <p className="page-overline">SeatCraft</p>
        <h1>Welcome back</h1>
        <p>Sign in to manage your own rooms, branches, and seating charts.</p>
      </aside>

      <main className="auth-page">
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Gmail address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Please wait..." : "Login with Email"}
          </button>
        </form>

        <button type="button" className="btn-secondary auth-google" onClick={handleGoogleLogin} disabled={submitting}>
          Continue with Google
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-switch">
          New user? <Link to="/signup">Create account</Link>
        </p>
      </main>
    </section>
  )
}
