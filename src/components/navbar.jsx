import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/firebase"
import { useAuth } from "../context/AuthContext"

export default function Navbar(){
    const { user } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    const handleLogout = async () => {
        await signOut(auth)
    }

    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    return <nav className={`app-nav ${menuOpen ? "menu-open" : ""}`}>
        <div className="nav-top">
            <div className="nav-brand">
                <p className="nav-kicker">Exam Operations</p>
                <h1>SeatCraft</h1>
            </div>
            <button
                className="nav-toggle"
                type="button"
                aria-expanded={menuOpen}
                aria-controls="primary-nav"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen(prev => !prev)}
            >
                <span />
                <span />
                <span />
            </button>
        </div>

        <ul className="nav-links" id="primary-nav">
            <li>
                <NavLink to="/home" className={({isActive}) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
            </li>
            <li>
                <NavLink to="/rooms" className={({isActive}) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Rooms</NavLink>
            </li>
            <li>
                <NavLink to="/branches" className={({isActive}) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Branches</NavLink>
            </li>
            <li>
                <NavLink to="/arrange" className={({isActive}) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>Arrange</NavLink>
            </li>
            <li>
                <NavLink to="/csvupload" className={({isActive}) => isActive ? "active" : ""} onClick={() => setMenuOpen(false)}>CSV Arrange</NavLink>
            </li>
        </ul>

        <div className="nav-footer">
            <p className="nav-user-label">Signed in as</p>
            <p className="nav-user-email">{user?.email}</p>
            <button type="button" onClick={handleLogout}>Log out</button>
        </div>
    </nav>
}
