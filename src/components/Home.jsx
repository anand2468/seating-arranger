
import { Link } from "react-router-dom"

export default function Home(){
    return (
        <section className="dashboard">
            <header className="dashboard-hero">
                <p className="page-overline">Seating Control Center</p>
                <h1>Plan fair, fast, conflict-aware exam seating</h1>
                <p>
                    Manage room inventory, branch rosters, and generate printable seating plus attendance
                    charts in a few clicks.
                </p>

                <div className="dashboard-actions">
                    <Link className="btn-primary" to="/arrange">Start Manual Arrange</Link>
                    <Link className="btn-secondary" to="/csvupload">Arrange From CSV</Link>
                </div>
            </header>

            <section className="dashboard-grid">
                <article className="dashboard-card">
                    <h2>Room Setup</h2>
                    <p>Add halls, row/column layouts, and capacity constraints before arranging.</p>
                    <Link to="/rooms">Manage rooms</Link>
                </article>

                <article className="dashboard-card">
                    <h2>Branch Data</h2>
                    <p>Store branch year, student strength, and roll numbers with ownership isolation.</p>
                    <Link to="/branches">Manage branches</Link>
                </article>

                <article className="dashboard-card">
                    <h2>Export Ready</h2>
                    <p>Generate room-wise attendance sheets and print directly from the browser.</p>
                    <Link to="/arrange">Generate now</Link>
                </article>
            </section>
        </section>
    )
}
