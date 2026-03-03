import { useEffect, useMemo, useState } from "react"
import "./arrange.css"
import { Room, SeatArranger, Std } from "../utils/dependencies"
import { getDocs, collection, query, where } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useAuth } from "../context/AuthContext"

export default function Arrange(){
    const [rooms, setRooms] = useState([])
    const [branches, setBranches] = useState([])
    const [seatingData, setSeatingData] = useState([])
    const [attCharts, setAttCharts] = useState([])
    const [error, setError] = useState("")
    const { user } = useAuth()

    useEffect(()=>{
        const fetchRooms = async ()=>{
            if (!user) {
                setRooms([])
                return
            }
            const q = query(collection(db, "rooms"), where("ownerUid", "==", user.uid))
            const querySnap = await getDocs(q)
            const list = querySnap.docs.map((item) => ({ id:item.id, ...item.data() }))
            setRooms(list)
        }
        fetchRooms()
    },[user])

    useEffect(()=>{
        const fetchBranches = async ()=>{
            if (!user) {
                setBranches([])
                return
            }
            const q = query(collection(db, "branches"), where("ownerUid", "==", user.uid))
            const querySnap = await getDocs(q)
            const list = querySnap.docs.map((item) => ({ id:item.id, ...item.data() }))
            setBranches(list)
        }
        fetchBranches()
    },[user])

    const selectedRooms = useMemo(
        () => rooms.filter((item) => item.checked),
        [rooms]
    )

    const selectedBranches = useMemo(
        () => branches.filter((item) => item.checked),
        [branches]
    )

    const selectedStudentCount = useMemo(
        () => selectedBranches.reduce((sum, item) => sum + Number(item.strength || 0), 0),
        [selectedBranches]
    )

    const missingSubjects = useMemo(
        () => selectedBranches.filter((item) => !String(item.subject || "").trim()).length,
        [selectedBranches]
    )

    const handleCheckedRoom = (e, room)=>{
        const { checked } = e.target
        setRooms(prev => prev.map(item => (item.id === room.id ? { ...item, checked } : item)))
    }

    const handleCheckedBranch = (e, branch)=>{
        const { checked } = e.target
        setBranches(prev => prev.map(item => (item.id === branch.id ? { ...item, checked } : item)))
    }

    const handleChangeSubject = (e, branch)=>{
        const { value } = e.target
        setBranches(prev => prev.map(item => (item.id === branch.id ? { ...item, subject:value } : item)))
    }

    const handleSubmit =(e)=>{
        e.preventDefault()
        setError("")

        const roomPayload = selectedRooms.map(item => new Room(item))
        const branchPayload = selectedBranches.map(item => new Std(item))

        if (roomPayload.length === 0 || branchPayload.length === 0) {
            setError("Select at least one room and one branch.")
            return
        }

        if (missingSubjects > 0) {
            setError("Add a subject for each selected branch.")
            return
        }

        const arranger = new SeatArranger(roomPayload, branchPayload)
        const generated = arranger.arr1()

        if (generated.length === 0) {
            setError("No seating output generated. Check capacity and selected branches.")
            return
        }

        setSeatingData(generated)
        setAttCharts(arranger.getAttChart())
    }

    return <section className="arrange-page">
        <header className="page-header">
            <p className="page-overline">Arrange</p>
            <h1>Manual Seating Generator</h1>
            <p>Select rooms and branches, set subject names, then generate printable allocations.</p>
        </header>

        {error && <p className="arrange-error dont-print">{error}</p>}

        <div className="arrange-summary dont-print">
            <div className="arrange-pill"><p>Selected Rooms</p><strong>{selectedRooms.length}</strong></div>
            <div className="arrange-pill"><p>Selected Branches</p><strong>{selectedBranches.length}</strong></div>
            <div className="arrange-pill"><p>Students</p><strong>{selectedStudentCount}</strong></div>
        </div>

        <div className="arrange-grid dont-print">
            <section className="arrange-panel">
                <div className="arrange-panel-head">
                    <h2>Select Rooms</h2>
                    <button type="button" className="text-btn" onClick={() => setRooms(prev => prev.map(item => ({ ...item, checked: true })))}>
                        Select all
                    </button>
                </div>

                <div className="arrange-list">
                    {rooms.length === 0 && <p className="arrange-muted">No rooms available.</p>}
                    {rooms.map(room => <label className={`arrange-option ${room.checked ? "is-selected" : ""}`} key={room.id}>
                        <input
                            type="checkbox"
                            name={room.rno}
                            id={room.rno}
                            onChange={(e) => handleCheckedRoom(e, room)}
                            checked={room.checked ? room.checked : false}
                        />
                        <span>{room.rno}</span>
                        <small>Strength {room.strength}</small>
                    </label>)}
                </div>
            </section>

            <section className="arrange-panel">
                <div className="arrange-panel-head">
                    <h2>Select Branches</h2>
                    <button type="button" className="text-btn" onClick={() => setBranches(prev => prev.map(item => ({ ...item, checked: true })))}>
                        Select all
                    </button>
                </div>

                <div className="arrange-list">
                    {branches.length === 0 && <p className="arrange-muted">No branches available.</p>}
                    {branches.map(branch => {
                        const missing = branch.checked && !String(branch.subject || "").trim()
                        return <div className={`arrange-branch-row ${branch.checked ? "is-selected" : ""}`} key={branch.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    name={branch.branch}
                                    id={branch.branch}
                                    onChange={(e) => handleCheckedBranch(e, branch)}
                                    checked={branch.checked ? branch.checked : false}
                                />
                                {branch.branch} {branch.year}
                            </label>
                            <input
                                type="text"
                                name="subject"
                                placeholder="Subject"
                                value={branch.subject || ""}
                                className={missing ? "is-error" : ""}
                                onChange={(e)=> {handleChangeSubject(e, branch)}}
                            />
                        </div>
                    })}
                </div>
            </section>
        </div>

        <div className="arrange-actions dont-print">
            <p className="arrange-muted">
                {missingSubjects > 0 ? `${missingSubjects} selected branch${missingSubjects > 1 ? "es need" : " needs"} a subject.` : "Ready to generate seating."}
            </p>
            <button className="btn-primary" onClick={ handleSubmit}>Generate seating chart</button>
            <button className="btn-secondary" onClick={(e)=>{ e.preventDefault(); window.print()}}>Print</button>
        </div>

        <SeatingChart rows={seatingData} />
        <AttSheets data={attCharts} />
    </section>
}

const SeatingChart = ({rows})=>{
    return rows.length === 0
        ? <p className="arrange-muted">No seating data generated yet.</p>
        : <Chart data={rows}/>
}

const Chart = ({data})=>{
    return <table className="page data-table">
        <thead>
            <tr>
                <th>Branch</th>
                <th>Roll Range</th>
                <th>Strength</th>
                <th>Room</th>
                <th>Row</th>
            </tr>
        </thead>

        <tbody>
            { data.map((item, index) => <tr key={`${item.rno}-${item.branch}-${item.row}-${index}`}>
                <td>{item.branch}</td>
                <td>{(item.limits || []).join(", ")}</td>
                <td>{item.total}</td>
                <td>{item.rno}</td>
                <td>{item.row}</td>
            </tr>) }
        </tbody>
    </table>
}

const AttSheets = ({data})=>{
    return data.length === 0
        ? null
        : <>{data.map((chart, index) => <AttSheet key={`${chart.room}-${index}`} data={chart} /> )}</>
}

const AttSheet = ({data})=>{
    const maxLen = Math.max(data.row1.length, data.row2.length)

    return (
        <div className="page arrange-sheet">
            <h2>{data.room}</h2>
            <div
                className="chart arrange-chart"
                style={{ display: "grid", gridTemplateRows:`repeat(${data.nor}, ${80}px)`, gridAutoFlow:'column' }}
            >
                {Array.from({ length: maxLen }).map((_, index) => (
                    <div key={index}>
                        <section>{data.row1[index] || "-"}</section>
                        <section>{data.row2[index] || "-"}</section>
                    </div>
                ))}
            </div>
        </div>
    )
}
