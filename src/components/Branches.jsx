import BranchTable from "./BranchTable"

export default function Branches(){
    return <section className="page-shell">
        <header className="page-header">
            <p className="page-overline">Setup</p>
            <h1>Branches</h1>
            <p>
                Maintain active and detained students per branch so seating generation always uses
                the latest real-world roster.
            </p>
        </header>
        <BranchTable />
    </section>
}
