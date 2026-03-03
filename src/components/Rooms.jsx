import Roomstable from "./roomsTable"

export default function Rooms(){
    return <section className="page-shell">
        <header className="page-header">
            <p className="page-overline">Setup</p>
            <h1>Rooms</h1>
            <p>Define available rooms and seating capacities used in arrangement generation.</p>
        </header>
        <Roomstable />
    </section>
}
