import './App.css'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Home from './components/Home'
import Landing from './components/Landing.jsx'
import Navbar from './components/navbar.jsx'
import Rooms from './components/Rooms.jsx'
import Branches from './components/Branches.jsx'
import Arrange from './components/Arrange.jsx'
import { CSVUpload } from './components/Arraynge_with_file.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import { useAuth } from './context/AuthContext.jsx'

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) return <div className="page-loader">Preparing workspace...</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Navbar />
      <main className="protected-content">
        <Outlet />
      </main>
    </div>
  )
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="page-loader">Loading account...</div>
  if (user) return <Navigate to="/home" replace />

  return children
}

function LandingRoute() {
  const { user, loading } = useAuth()

  if (loading) return <div className="page-loader">Loading account...</div>
  if (user) return <Navigate to="/home" replace />

  return <Landing />
}

function RouteFallback() {
  const { user } = useAuth()
  return <Navigate to={user ? "/home" : "/"} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path='/home' element = {<Home/>} />
        <Route path="/rooms" element = {<Rooms />} />
        <Route path = "/branches" element = { <Branches /> }/>
        <Route path = "/arrange" element = { <Arrange/>} />
        <Route path = "/csvupload" element = { <CSVUpload />} />
      </Route>

      <Route path='/*' element = {<RouteFallback />} />
    </Routes>
  )
}

export default App
