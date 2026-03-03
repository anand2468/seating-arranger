import { Link } from "react-router-dom"

export default function navbar(){
    return <nav className="sidenav">
        <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to="/Rooms">Rooms</Link>
            </li>
            <li>
                <Link to="/branches">Branches</Link>
            </li>
            <li>
                <Link to="/Arrange">Arrange</Link>
            </li>
            <li>
                <Link to="/csvupload">Arrange v2</Link>
            </li>
        </ul>
    </nav>
}