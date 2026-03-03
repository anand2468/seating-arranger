import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useAuth } from "../context/AuthContext"

export default function Roomstable(){
    const [roomList, setRoomList] = useState([])
    const { user } = useAuth()

    useEffect(()=>{
        const fetchRooms = async ()=>{
            if (!user) {
                setRoomList([])
                return
            }
            const q = query(collection(db, 'rooms'), where("ownerUid", "==", user.uid))
            const querySnap = await getDocs(q)
            const list = querySnap.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }))
            setRoomList(list)
        }
        fetchRooms()
    },[user])

    async function handleInsert(room){
        if (!user) return

        const roomData = {
            ...room,
            ownerUid: user.uid
        }

        const res = await addDoc(collection(db, "rooms"), roomData)
        if (res.id){
            setRoomList(old => [...old, { id: res.id, ...roomData }])
        } else {
            alert("Unable to add room. Please check your connection.")
        }
    }

    async function handleDeleteRow(id){
        const conf = confirm("Delete this room?")
        if (conf){
            await deleteDoc(doc(db, 'rooms', id))
            setRoomList(item => item.filter(room => id !== room.id))
        }
    }

    return <section className="data-panel">
        <InsertRowForm handleInsert={handleInsert} />
        <Table roomList={roomList} handleDeleteRow={handleDeleteRow} />
    </section>
}

const InsertRowForm = ({handleInsert})=>{
    const [form, setForm] = useState({rno:'', rows:'', columns:'', strength:''})

    const handleSubmit = (e)=>{
        e.preventDefault()
        if (form.rno.trim() !== "" && Number(form.rows) > 1 && Number(form.columns) > 1 && Number(form.strength) > 0){
            handleInsert(form)
            setForm({rno:'', rows:'', columns:'', strength:''})
            return
        }

        alert("Please enter valid room details.")
    }

    return <form className="data-form" onSubmit={handleSubmit}>
        <input
            type="text"
            name="rno"
            placeholder="Room number"
            value={form.rno}
            onChange={(e)=> setForm(prev=> ({...prev, rno: e.target.value}))}
        />
        <input
            type="number"
            name="rows"
            placeholder="Rows"
            value={form.rows}
            onChange={(e)=> setForm(prev=> ({...prev, rows: e.target.value}))}
        />
        <input
            type="number"
            name="columns"
            placeholder="Columns"
            value={form.columns}
            onChange={(e)=> setForm(prev=> ({...prev, columns: e.target.value}))}
        />
        <input
            type="number"
            name="strength"
            placeholder="Strength"
            value={form.strength}
            onChange={(e)=> setForm(prev=> ({...prev, strength: e.target.value}))}
        />
        <button type="submit" className="btn-primary">Add room</button>
    </form>
}

const Table = ({roomList, handleDeleteRow })=>{
    if (roomList.length === 0) {
        return <div className="empty-state">
            <h3>No rooms yet</h3>
            <p>Add your first room to begin arranging seats.</p>
        </div>
    }

    return <table className="data-table">
        <thead>
            <tr>
                <th>Room</th>
                <th>Rows</th>
                <th>Columns</th>
                <th>Strength</th>
                <th>Actions</th>
            </tr>
        </thead>

        <tbody>
            { roomList.map(item =>  <tr key={item.id}>
                <td>{item.rno}</td>
                <td>{item.rows}</td>
                <td>{item.columns}</td>
                <td>{item.strength}</td>
                <td>
                    <button className="btn-danger" onClick={()=> handleDeleteRow(item.id)}>Delete</button>
                </td>
            </tr>) }
        </tbody>
    </table>
}
