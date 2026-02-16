import { useState, useEffect } from "react"
import './Arrange.css'

function allValuesNotNull(array, property) {
    return array.every(item => item[property] !== null);
}

export default function Arrange(){
    const [rooms, setRooms] = useState([])
    const [branches, setBranches] = useState([])
    const [seatingdata, setSeatingData] = useState([])
    const [attCharts, setAttCharts] = useState([])
    const url = import.meta.env.VITE_API_URL
    
    useEffect(()=>{ 
        fetch(`${url}/getrooms`)
        .then(response=> {return response.json()})
        .then(data=> {setRooms(data.response)})
        .catch(reason=>{console.log(reason)})
    },[])

    //get branches data
    useEffect(()=>{ 
        fetch(`${url}/getbranches`)
        .then(response=> {return response.json()})
        .then(data=> {setBranches(data.response)})
        .catch(reason=>{console.log(reason)})
    },[])

    const handleCheckedRoom = (e, room)=>{
        const {checked} = e.target;
        setRooms(prev => prev.map(item => (item._id === room._id? {...item, checked:checked} : item)))
    }
    const handleCheckedBranch = (e, branch)=>{
        const {checked} = e.target;
        setBranches(prev => prev.map(item => (item._id === branch._id ? {...item, checked:checked} : item)))
    }
    const handleChangeSubject = (e, branch)=>{
        const {value} = e.target;
        setBranches(prev => prev.map(item => (item._id === branch._id ? {...item, subject:value}: item)))
    }


    const handlesubmit =(e)=>{
        e.preventDefault()
            fetch(`${url}/arrangerooms`, {method:"POST",
                headers:{
                    "Content-type":"application/json"
                },
                body:JSON.stringify({
                    rooms: rooms.filter(item => item.checked == true),
                    branches: branches.filter(item => item.checked == true)
                })
            })
            .then(resp => {return resp.json()})
            .then(data => { let jsonString = data.res;
                console.log(data)
                jsonString = jsonString.replace(/'/g, '"');
                setSeatingData(JSON.parse(jsonString));
                jsonString = data.attChart;
                jsonString = jsonString.replace(/'/g, '"');
                setAttCharts(JSON.parse(jsonString));
            console.log(attCharts)})

    }



    return <>
    <h1 id="selectroom"> select rooms </h1>

    <div className="selectrooms">

        {rooms.map( room => <div key={room._id}>
        <label> {room.rno} 
            <input type="checkbox" 
            name={room.rno} 
            id={room.rno} 
            onChange={(e) => handleCheckedRoom(e, room)}
            checked= {room.checked ? room.checked :false} />
        </label>
        </div>)}

    </div>

    <SelectBranch handleChangeSubject={handleChangeSubject} handleCheckedBranch={handleCheckedBranch} branches={branches}/>

    

    <button onClick={ handlesubmit}> generate seating chart</button>

    <SeatingChart rows = {seatingdata} />
    <AttSheets data={attCharts} />    
    <button onClick={(e)=>{ e.preventDefault(); window.print()}}> print </button>
    </>
}

const SelectBranch =({handleChangeSubject,handleCheckedBranch,  branches})=>{
    return <>
    <h1 id="selectbranch">select branches </h1>
    <div className="selectbranches">
    {branches.map( branch => <div key={branch._id}>
        <label> 
            <input type="checkbox" 
            name={branch.branch} 
            id={branch.branch} 
            onChange={(e) => handleCheckedBranch(e, branch)}
            checked= {branch.checked ? branch.checked :false} />
            {branch.branch + " " + branch.year}: 
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
        <table className="page">
        <thead>
        <tr key={0}>
        <th>branch</th>
        <th> from  </th>
        <th> to </th>
        <th>strength </th>
        <th> room  </th>
        </tr>
        </thead>
        
        <tbody>
        { data.map(item =>  <tr key={item.from}> 
        <td> {item.branch}</td>
        <td> { item.from }</td>
        <td> {item.to} </td>
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
        <div className="page">
        <h1> { data.room}</h1>
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