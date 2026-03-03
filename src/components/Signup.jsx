import { useState } from "react"
import { Link } from "react-router-dom"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../firebase/firebase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
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
        <h1>Create your workspace</h1>
        <p>Your account keeps room and branch data private and separated from other users.</p>
      </aside>

      <main className="auth-page">
        <h2>Create account</h2>
        <form className="auth-form" onSubmit={handleSignup}>
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
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Please wait..." : "Sign up with Email"}
          </button>
        </form>

        <button type="button" className="btn-secondary auth-google" onClick={handleGoogleSignup} disabled={submitting}>
          Continue with Google
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </main>
    </section>
  )
}
