import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import "./print.css";
import "./arrange_with_file/csvUpload.css";
import { Room, SeatArranger, Std } from "../utils/dependencies";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

function transformFast(rows) {
  const branchMap = {};

  for (const row of rows) {
    for (const branch in row) {
      const roll = row[branch]?.trim();
      if (!roll) continue;

      if (!branchMap[branch]) {
        branchMap[branch] = {
          branch,
          strength: 0,
          rollnums: [],
        };
      }

      branchMap[branch].rollnums.push(roll);
      branchMap[branch].strength += 1;
    }
  }

  return Object.values(branchMap).map((item, index) => ({
    subject: index + 1,
    id: index + 1,
    ...item,
  }));
}

export function CSVUpload() {
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [seatingdata, setSeatingData] = useState([]);
  const [attCharts, setAttCharts] = useState([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) {
        setRooms([]);
        return;
      }

      const q = query(collection(db, "rooms"), where("ownerUid", "==", user.uid));
      const querySnap = await getDocs(q);
      const list = querySnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setRooms(list);
    };

    fetchRooms();
  }, [user]);

  const selectedRooms = useMemo(
    () => rooms.filter((item) => item.checked === true),
    [rooms]
  );
  const selectedBranches = useMemo(
    () => branches.filter((item) => item.checked === true),
    [branches]
  );

  const selectedStudents = useMemo(
    () => selectedBranches.reduce((sum, item) => sum + Number(item.strength || 0), 0),
    [selectedBranches]
  );

  const missingSubjects = useMemo(
    () => selectedBranches.filter((item) => !String(item.subject || "").trim()).length,
    [selectedBranches]
  );

  const roomsUsed = useMemo(
    () => new Set(seatingdata.map((item) => item.rno)).size,
    [seatingdata]
  );

  const rowsAssigned = useMemo(
    () => seatingdata.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [seatingdata]
  );

  const handleCheckedRoom = (e, room) => {
    const { checked } = e.target;
    setRooms((prev) =>
      prev.map((item) => (item.id === room.id ? { ...item, checked } : item))
    );
  };

  const handleCheckedBranch = (e, branch) => {
    const { checked } = e.target;
    setBranches((prev) =>
      prev.map((item) => (item.id === branch.id ? { ...item, checked } : item))
    );
  };

  const handleChangeSubject = (e, branch) => {
    const { value } = e.target;
    setBranches((prev) =>
      prev.map((item) => (item.id === branch.id ? { ...item, subject: value } : item))
    );
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      error: () => {
        setError("Unable to read this file. Please upload a valid CSV file.");
      },
      complete: ({ data }) => {
        const result = transformFast(data);
        if (result.length === 0) {
          setError("No roll numbers found in the file.");
          setBranches([]);
          return;
        }

        setBranches(result);
        setSeatingData([]);
        setAttCharts([]);
        setStep(2);
      },
    });
  };

  const handleSelectAllRooms = () => {
    const shouldSelectAll = rooms.some((item) => !item.checked);
    setRooms((prev) => prev.map((item) => ({ ...item, checked: shouldSelectAll })));
  };

  const handleSelectAllBranches = () => {
    const shouldSelectAll = branches.some((item) => !item.checked);
    setBranches((prev) => prev.map((item) => ({ ...item, checked: shouldSelectAll })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const roomPayload = selectedRooms.map((item) => new Room(item));
    const branchPayload = selectedBranches.map((item) => new Std(item));

    if (roomPayload.length === 0 || branchPayload.length === 0) {
      setError("Select at least one room and one branch before generating.");
      return;
    }

    if (missingSubjects > 0) {
      setError("Add a subject for every selected branch.");
      return;
    }

    const res = new SeatArranger(roomPayload, branchPayload);
    const generatedSeating = res.arr1();

    if (generatedSeating.length === 0) {
      setError("No seating could be generated. Check room capacity and branch selections.");
      return;
    }

    setSeatingData(generatedSeating);
    setAttCharts(res.getAttChart());
    setStep(3);
  };

  return (
    <section className="csv-page">
      <header className="csv-hero dont-print">
        <h1>Arrange Seating From CSV</h1>
        <p>
          Upload student roll numbers, choose rooms and subjects, then generate printable
          seating and attendance charts.
        </p>

        <div className="csv-stepper" role="list" aria-label="Arrangement steps">
          <StepPill index={1} title="Upload CSV" active={step === 1} done={step > 1} />
          <StepPill index={2} title="Configure" active={step === 2} done={step > 2} />
          <StepPill index={3} title="Review & Print" active={step === 3} done={false} />
        </div>
      </header>

      {error && (
        <p className="csv-error dont-print" role="alert">
          {error}
        </p>
      )}

      {step === 1 && (
        <section className="csv-panel dont-print">
          <h2>Upload Roll Numbers File</h2>
          <p className="csv-muted">
            Expected format: each column is a branch and each row has roll numbers.
          </p>

          <label className="csv-file-input">
            <input type="file" accept=".csv" onChange={handleFile} />
            <span>Choose CSV file</span>
          </label>

          {fileName && (
            <p className="csv-file-name">
              Selected file: <strong>{fileName}</strong>
            </p>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="dont-print">
          <div className="csv-summary">
            <SummaryPill label="Selected Rooms" value={selectedRooms.length} />
            <SummaryPill label="Selected Branches" value={selectedBranches.length} />
            <SummaryPill label="Selected Students" value={selectedStudents} />
          </div>

          <div className="csv-grid">
            <section className="csv-panel">
              <div className="csv-panel-header">
                <h2>Select Rooms</h2>
                <button className="csv-link-btn" type="button" onClick={handleSelectAllRooms}>
                  {rooms.every((item) => item.checked) ? "Clear all" : "Select all"}
                </button>
              </div>

              {rooms.length === 0 && <p className="csv-muted">No rooms available. Add rooms first.</p>}

              <div className="csv-list">
                {rooms.map((room) => (
                  <label key={room.id} className={`csv-option ${room.checked ? "is-selected" : ""}`}>
                    <input
                      type="checkbox"
                      name={room.rno}
                      id={room.rno}
                      onChange={(e) => handleCheckedRoom(e, room)}
                      checked={room.checked ? room.checked : false}
                    />
                    <div>
                      <p className="csv-option-title">{room.rno}</p>
                      <p className="csv-option-sub">Capacity: {room.strength}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="csv-panel">
              <div className="csv-panel-header">
                <h2>Select Branches and Subjects</h2>
                <button className="csv-link-btn" type="button" onClick={handleSelectAllBranches}>
                  {branches.every((item) => item.checked) ? "Clear all" : "Select all"}
                </button>
              </div>

              <SelectBranch
                handleChangeSubject={handleChangeSubject}
                handleCheckedBranch={handleCheckedBranch}
                branches={branches}
              />
            </section>
          </div>

          <div className="csv-actions">
            <button className="btn-secondary" type="button" onClick={() => setStep(1)}>
              Change file
            </button>
            <p className="csv-muted">
              {missingSubjects > 0
                ? `${missingSubjects} selected branch${missingSubjects > 1 ? "es need" : " needs"} a subject.`
                : "Ready to generate seating chart."}
            </p>
            <button className="btn-primary" onClick={handleSubmit}>
              Generate Seating Chart
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <div className="csv-result-header dont-print">
            <div className="csv-summary">
              <SummaryPill label="Rooms Used" value={roomsUsed} />
              <SummaryPill label="Rows Assigned" value={rowsAssigned} />
              <SummaryPill label="Attendance Sheets" value={attCharts.length} />
            </div>
            <div className="csv-actions-inline">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  window.print();
                }}
              >
                Print
              </button>
            </div>
          </div>

          <SeatingChart rows={seatingdata} />
          <AttSheets data={attCharts} />
        </section>
      )}
    </section>
  );
}

const StepPill = ({ index, title, active, done }) => (
  <div className={`csv-step-pill ${active ? "is-active" : ""} ${done ? "is-done" : ""}`} role="listitem">
    <span>{index}</span>
    <p>{title}</p>
  </div>
);

const SummaryPill = ({ label, value }) => (
  <div className="csv-summary-pill">
    <p>{label}</p>
    <strong>{value}</strong>
  </div>
);

const SelectBranch = ({ handleChangeSubject, handleCheckedBranch, branches }) => {
  return (
    <div className="csv-list">
      {branches.length === 0 && (
        <p className="csv-muted">No branches found in uploaded CSV file.</p>
      )}

      {branches.map((branch) => {
        const isMissing = branch.checked && !String(branch.subject || "").trim();

        return (
          <div key={branch.id} className={`csv-branch-row ${branch.checked ? "is-selected" : ""}`}>
            <label className="csv-branch-label">
              <input
                type="checkbox"
                name={branch.branch}
                id={branch.branch}
                onChange={(e) => handleCheckedBranch(e, branch)}
                checked={branch.checked ? branch.checked : false}
              />
              <span>{branch.branch}</span>
              <small>{branch.strength} students</small>
            </label>

            <input
              className={isMissing ? "csv-subject-input is-error" : "csv-subject-input"}
              type="text"
              name="subject"
              placeholder="Subject name/code"
              value={branch.subject || ""}
              onChange={(e) => {
                handleChangeSubject(e, branch);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const SeatingChart = ({ rows }) => {
  if (rows.length === 0) {
    return <p className="csv-muted">No data found.</p>;
  }

  return <Chart data={rows} />;
};

const Chart = ({ data }) => {
  return (
    <table className="page potrait csv-result-table">
      <thead>
        <tr>
          <th>Branch</th>
          <th>Roll range</th>
          <th>Strength</th>
          <th>Room</th>
          <th>Row</th>
        </tr>
      </thead>

      <tbody>
        {data.map((item, index) => (
          <tr key={`${item.rno}-${item.branch}-${item.row}-${index}`}>
            <td>{item.branch}</td>
            <td>{item.limits.join(", ")}</td>
            <td>{item.total}</td>
            <td>{item.rno}</td>
            <td>{item.row}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const AttSheets = ({ data }) => {
  if (data.length === 0) {
    return <p className="csv-muted">No attendance data.</p>;
  }

  return (
    <>
      {data.map((chart, index) => (
        <AttSheet key={`${chart.room}-${index}`} data={chart} />
      ))}
    </>
  );
};

const AttSheet = ({ data }) => {
  const maxLen = Math.max(data.row1.length, data.row2.length);

  return (
    <div className="page landscape csv-att-sheet">
      <header className="csv-att-header">
        <h1>{data.room}</h1>
        <img src="/lara_logo.jpg" alt="College logo" />
      </header>

      <div
        className="chart csv-att-grid"
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${data.nor}, ${80}px)`,
          gridAutoFlow: "column",
        }}
      >
        {Array.from({ length: maxLen }).map((_, index) => (
          <div key={index}>
            <section>{data.row1[index] || "-"}</section>
            <section>{data.row2[index] || "-"}</section>
          </div>
        ))}
      </div>
    </div>
  );
};
