import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../firebase/firebase"

export default function Roomstable(){
    const [roomList, setRoomList] = useState([])

    useEffect(()=>{ 
        const fetchRooms = async ()=>{
            const qurerySnap = await getDocs(collection(db, 'rooms'));
            const list = qurerySnap.docs.map( doc => ({
                id:doc.id,
                ...doc.data()
            }))
            setRoomList(list);
        }
        fetchRooms();
    },[])

    async function handleInsert(room){
        const res = await addDoc(collection(db, "rooms"), room)
        if (res.id){
            alert('data added successfully');
            setRoomList(old => [...old, room])
        }else{
            alert("data added failed check you connection!");
        }

    }
    async function handleDeleteRow(id){
        let conf = confirm("delete the row")
        if (conf){
            await deleteDoc(doc(db, 'rooms', id))
            setRoomList(item => item.filter(room => id !== room.id))
        }
    }

    return <>
    <InsertRowForm handleInsert={handleInsert} />
    <Table roomList={roomList} handleDeleteRow={handleDeleteRow} />
    </>
}

const InsertRowForm = ({handleInsert})=>{
    const [form, setform] = useState({rno:'', rows:'', columns:'', strength:''})
    const handlesubmit = (e)=>{
        e.preventDefault();
        if (form.rno != "" && form.rows >1 && form.columns >1 && form.strength >0){
            handleInsert(form);
            setform({rno:'', rows:'', columns:'', strength:''})
        }
        
        else
        alert("check the room details")

    }
    const handlerno = (e)=>{
        setform(prev=> ({...prev, rno: e.target.value}))
    }
    const handlerow = (e)=>{
        setform(prev=> ({...prev, rows: e.target.value}))
    }
    const handlecolumn = (e)=>{
        setform(prev=> ({...prev, columns: e.target.value}))
    }
    const handlestrength = (e)=>{
        setform(prev=> ({...prev, strength: e.target.value}))
    }

    return <form action="" id="formInsertRooms" onSubmit={ handlesubmit}>
        <input type="text" name="rno" id="" placeholder="room number" value={form.rno} onChange={handlerno}/>
        <input type="number" name="rows" id="rows" placeholder="rows" value={form.rows} onChange={handlerow}/>
        <input type="number" name="columns" id="columns" placeholder="columns" value={form.columns} onChange={handlecolumn}/>
        <input type="number" name="strength" id="strength" placeholder="strength" value={form.strength} onChange={handlestrength} />
        <input type="submit" value="add room" />
    </form>
}


const Table = ({roomList, handleDeleteRow })=>{
    return <table>
    <thead>
    <tr key={0}>
    <th>rno</th>
    <th> rows </th>
    <th> columns </th>
    <th>strength </th>
    <th> delete row</th>
    </tr>
    </thead>
    
    <tbody>
    { roomList.map(item =>  <tr key={item.id}> 
    <td> {item.rno}</td>
    <td> { item.rows }</td>
    <td> {item.columns} </td>
    <td> {item.strength} </td>
    <td> <button onClick={()=> handleDeleteRow(item.id)}> delete row</button></td>
</tr>) }
    </tbody>
</table>
}