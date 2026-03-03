import Papa from "papaparse";
import { useState, useEffect } from "react"
import './print.css'
import { Room, SeatArranger, Std } from "../utils/dependencies";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { generateSeating } from "../utils/generateSeating";


function transformFast(rows) {

    const branchMap = {};

    // ONE main loop
    for (const row of rows) {

        for (const branch in row) {

            const roll = row[branch]?.trim();
            if (!roll) continue;

            // create branch only when needed (lazy creation)
            if (!branchMap[branch]) {
                branchMap[branch] = {
                    branch,
                    strength: 0,
                    rollnums: []
                };
            }

            branchMap[branch].rollnums.push(roll);
            branchMap[branch].strength++;
        }
    }

    // convert to array + add serial numbers
    return Object.values(branchMap).map((item, index) => ({
        subject: index + 1,
        id:index+1,
        ...item
    }));
}

export function CSVUpload(){
    const [step, setStep] = useState(1)
    const [rooms, setRooms] = useState([])
    const [branches, setBranches] = useState([])
    const [seatingdata, setSeatingData] = useState([])
    const [attCharts, setAttCharts] = useState([])
    
    useEffect(()=>{ 
        const fetchRooms = async ()=>{
            const qurerySnap = await getDocs(collection(db, 'rooms'));
            const list = qurerySnap.docs.map( doc => ({
                id:doc.id,
                ...doc.data()
            }))
            setRooms(list);
        }
        fetchRooms();
    },[])

    const handleCheckedRoom = (e, room)=>{
        const {checked} = e.target;
        setRooms(prev => prev.map(item => (item.id === room.id? {...item, checked:checked} : item)))
    }
    const handleCheckedBranch = (e, branch)=>{
        const {checked} = e.target;
        setBranches(prev => prev.map(item => (item.id === branch.id ? {...item, checked:checked} : item)))
    }
    const handleChangeSubject = (e, branch)=>{
        const {value} = e.target;
        setBranches(prev => prev.map(item => (item.id === branch.id ? {...item, subject:value}: item)))
    }
    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data }) => {
                const result = transformFast(data);
                console.log(result);
                setBranches(result);
            }
        });
        setStep(2);
    };


    const handlesubmit =(e)=>{
        e.preventDefault()
        console.log("generated seating chart")
        console.log(generateSeating(rooms, branches))
        const selectedRooms = rooms
                .filter(item => item.checked == true)
                .map(item => new Room(item))
        const selectedBranches = branches
                .filter(item => item.checked == true)
                .map(item => new Std(item))
        const res = new SeatArranger(selectedRooms, selectedBranches);
        // console.log(res.arr1())
        // console.log(res.getAttChart())
        setSeatingData(res.arr1())
        setAttCharts(res.getAttChart())
        setStep(3)
    }



    return <>

    { step === 1 && <div>
        <h1> upload rollnumbers in csv format </h1>
        <input type="file" accept=".csv" onChange={handleFile} />
    </div>}

    {step === 2 && <div>
        <h1 id="selectroom"> select rooms </h1>
        <div className="selectrooms">

            {rooms.map(room => <div key={room.id}>
                <label> {room.rno}
                    <input type="checkbox"
                        name={room.rno}
                        id={room.rno}
                        onChange={(e) => handleCheckedRoom(e, room)}
                        checked={room.checked ? room.checked : false} />
                </label>
            </div>)}

        </div>

        <SelectBranch handleChangeSubject={handleChangeSubject} handleCheckedBranch={handleCheckedBranch} branches={branches} />
        <button onClick={handlesubmit}> generate seating chart</button>
    </div>}
    
    {step === 3 && <div>
        <button className="dont-print" onClick={()=> setStep(2) }> back </button>
        <SeatingChart rows = {seatingdata} />
        <AttSheets data={attCharts} />    
        <button className="dont-print" onClick={(e)=>{ e.preventDefault(); window.print()}}> print </button>
    </div>}
    </>
}

const SelectBranch =({handleChangeSubject,handleCheckedBranch,  branches})=>{
    return <>
    <h1 id="selectbranch">select branches </h1>
    <div className="selectbranches">
    {branches.map( branch => <div key={branch.id}>
        <label> 
            <input type="checkbox" 
            name={branch.branch} 
            id={branch.branch} 
            onChange={(e) => handleCheckedBranch(e, branch)}
            checked= {branch.checked ? branch.checked :false} />
            {branch.branch}: 
        </label>
        <input type="text" name="subject" placeholder="subject name" value={branch.subject} onChange={(e)=> {handleChangeSubject(e, branch)}} /> <br />
        </div>)}
    </div></>
}

const SeatingChart = ({rows})=>{
    return <>
    { (rows.length == 0) ? <p> no data found </p> : <Chart data={rows}/> }
    
    </>
}

//rno': 'vff 5', 'from': 1, 'to': 15, 'row': 1, 'branch': 'AIML'}
const Chart = ({data})=>{
    return <>
        <table className="page potrait">
        <thead>
        <tr key={0}>
        <th>branch</th>
        <th> from  </th>
        <th>strength </th>
        <th> room  </th>
        </tr>
        </thead>
        
        <tbody>
        { data.map(item =>  <tr key={item.limits}> 
        <td> {item.branch}</td>
        <td> { item.limits.map((limit) =><> {limit} <br/></>) }</td>
        <td> {item.total} </td>
        <td> { item.rno}</td>
    </tr>) }
        </tbody>
    </table>
    
    </>
}

const AttSheets = ({data})=>{
    return ((data ===0)?<p> no data</p> : <>{data.map(chart => <AttSheet key={chart.room} data ={chart} /> )}</>)
}
const AttSheet = ({data})=>{
    let maxLen= Math.max(data.row1.length, data.row2.length)
    return (
        <div className="page landscape">
        <h1> { data.room}</h1>

        <img src="../lara_logo.jpg" alt="" />
        <div className="chart" style={ { display: "grid", gridTemplateRows:`repeat(${data.nor}, ${80}px)`, gridAutoFlow:'column'}}>
          {Array.from({ length: maxLen }).map((_, index) => (
            <div key={index}>
              <section>{data.row1[index]}</section><section>{data.row2[index]}</section>
            </div>
          ))}
        </div>
        </div>
      );
}

