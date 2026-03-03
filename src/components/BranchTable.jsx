import { useEffect, useMemo, useState } from "react"
import { collection, deleteDoc, getDocs, addDoc, doc, query, where, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useAuth } from "../context/AuthContext"

const normalizeRoll = (value) => value.trim().toUpperCase()

const sortRolls = (rolls) =>
  [...rolls].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))

const linesToRolls = (input) => {
  if (!input.trim()) return []
  const cleaned = input.replaceAll("[", "").replaceAll("]", "")
  const rolls = cleaned
    .split("\n")
    .map((item) => normalizeRoll(item))
    .filter(Boolean)

  return sortRolls([...new Set(rolls)])
}

export default function BranchTable() {
  const [data, setData] = useState([])
  const [managingId, setManagingId] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchBranches = async () => {
      if (!user) {
        setData([])
        return
      }
      const q = query(collection(db, "branches"), where("ownerUid", "==", user.uid))
      const querySnap = await getDocs(q)
      const list = querySnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
      setData(list)
    }
    fetchBranches()
  }, [user])

  const managingBranch = useMemo(
    () => data.find((item) => item.id === managingId) || null,
    [data, managingId]
  )

  async function handleInsert(branch) {
    if (!user) return

    const branchData = {
      ...branch,
      ownerUid: user.uid,
    }

    const docRef = await addDoc(collection(db, "branches"), branchData)
    if (docRef.id) {
      setData((oldData) => [...oldData, { id: docRef.id, ...branchData }])
    }
  }

  const handleDelete = async (id) => {
    const conf = confirm("Delete this branch?")
    if (conf) {
      await deleteDoc(doc(db, "branches", id))
      setData((items) => items.filter((branch) => id !== branch.id))
      if (managingId === id) {
        setManagingId(null)
      }
    }
  }

  const handleSaveBranch = async (id, payload) => {
    await updateDoc(doc(db, "branches", id), payload)
    setData((items) => items.map((item) => (item.id === id ? { ...item, ...payload } : item)))
  }

  return (
    <section className="data-panel">
      <InsertBranchForm handleInsert={handleInsert} />
      <Table
        data={data}
        onDelete={handleDelete}
        onManage={(id) => setManagingId(id)}
        managingId={managingId}
      />

      {managingBranch && (
        <BranchManager
          branch={managingBranch}
          onClose={() => setManagingId(null)}
          onSave={handleSaveBranch}
        />
      )}
    </section>
  )
}

const InsertBranchForm = ({ handleInsert }) => {
  const [form, setForm] = useState({ branch: "", year: "", rollnums: "" })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.branch.trim() === "" || Number(form.year) <= 0) {
      alert("Please enter valid branch details.")
      return
    }

    const activeRolls = linesToRolls(form.rollnums)
    if (activeRolls.length === 0) {
      alert("Please add at least one student roll number.")
      return
    }

    handleInsert({
      branch: form.branch.trim().toUpperCase(),
      year: Number(form.year),
      rollnums: activeRolls,
      detainedRollnums: [],
      strength: activeRolls.length,
    })

    setForm({ branch: "", year: "", rollnums: "" })
  }

  return (
    <>
      <p className="branch-form-note">
        Add a branch once. After that, use <strong>Manage students</strong> to handle new, detained, and restored students.
      </p>
      <form className="data-form data-form-branch branch-create-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="branch"
          placeholder="Branch name (e.g., CSE-A)"
          value={form.branch}
          onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
        />
        <textarea
          name="rollnums"
          placeholder="Active student roll numbers (one per line)"
          value={form.rollnums}
          onChange={(e) => setForm((prev) => ({ ...prev, rollnums: e.target.value }))}
          rows="5"
        />
        <button type="submit" className="btn-primary">Add branch</button>
      </form>
    </>
  )
}

const Table = ({ data, onDelete, onManage, managingId }) => {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        <h3>No branches yet</h3>
        <p>Add branch details with roll numbers to start seating arrangement.</p>
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Branch</th>
          <th>Year</th>
          <th>Active</th>
          <th>Detained</th>
          <th>Total Tracked</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => {
          const activeCount = item.rollnums?.length || 0
          const detainedCount = item.detainedRollnums?.length || 0
          return (
            <tr key={item.id}>
              <td>{item.branch}</td>
              <td>{item.year}</td>
              <td>{activeCount}</td>
              <td>{detainedCount}</td>
              <td>{activeCount + detainedCount}</td>
              <td>
                <div className="branch-table-actions">
                  <button
                    className={managingId === item.id ? "btn-secondary" : "btn-primary"}
                    onClick={() => onManage(item.id)}
                  >
                    Manage students
                  </button>
                  <button className="btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const BranchManager = ({ branch, onSave, onClose }) => {
  const [branchName, setBranchName] = useState(branch.branch)
  const [year, setYear] = useState(branch.year)
  const [activeRolls, setActiveRolls] = useState(sortRolls(branch.rollnums || []))
  const [detainedRolls, setDetainedRolls] = useState(sortRolls(branch.detainedRollnums || []))
  const [bulkActiveInput, setBulkActiveInput] = useState((branch.rollnums || []).join("\n"))
  const [newRoll, setNewRoll] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBranchName(branch.branch)
    setYear(branch.year)
    setActiveRolls(sortRolls(branch.rollnums || []))
    setDetainedRolls(sortRolls(branch.detainedRollnums || []))
    setBulkActiveInput((branch.rollnums || []).join("\n"))
    setNewRoll("")
    setError("")
  }, [branch])

  const updateActiveRolls = (nextRolls) => {
    const sorted = sortRolls([...new Set(nextRolls)])
    setActiveRolls(sorted)
    setBulkActiveInput(sorted.join("\n"))
  }

  const addNewStudent = () => {
    const roll = normalizeRoll(newRoll)
    if (!roll) return

    if (activeRolls.includes(roll) || detainedRolls.includes(roll)) {
      setError("This roll number is already tracked in this branch.")
      return
    }

    setError("")
    updateActiveRolls([...activeRolls, roll])
    setNewRoll("")
  }

  const detainStudent = (roll) => {
    updateActiveRolls(activeRolls.filter((item) => item !== roll))
    setDetainedRolls(sortRolls([...new Set([...detainedRolls, roll])]))
  }

  const restoreStudent = (roll) => {
    setDetainedRolls(detainedRolls.filter((item) => item !== roll))
    updateActiveRolls([...activeRolls, roll])
  }

  const removeActiveStudent = (roll) => {
    updateActiveRolls(activeRolls.filter((item) => item !== roll))
  }

  const removeDetainedStudent = (roll) => {
    setDetainedRolls(detainedRolls.filter((item) => item !== roll))
  }

  const applyBulkActive = () => {
    const nextActive = linesToRolls(bulkActiveInput)
    const nextDetained = detainedRolls.filter((roll) => !nextActive.includes(roll))
    setError("")
    setActiveRolls(nextActive)
    setDetainedRolls(sortRolls(nextDetained))
    setBulkActiveInput(nextActive.join("\n"))
  }

  const handleSave = async () => {
    setError("")

    if (branchName.trim() === "" || Number(year) <= 0) {
      setError("Branch name and year are required.")
      return
    }

    const cleanedActive = sortRolls(activeRolls)
    if (cleanedActive.length === 0) {
      setError("At least one active student is required for seating generation.")
      return
    }

    const cleanedDetained = sortRolls(detainedRolls.filter((roll) => !cleanedActive.includes(roll)))

    const payload = {
      branch: branchName.trim().toUpperCase(),
      year: Number(year),
      rollnums: cleanedActive,
      detainedRollnums: cleanedDetained,
      strength: cleanedActive.length,
    }

    setSaving(true)
    try {
      await onSave(branch.id, payload)
    } catch (saveError) {
      setError(saveError.message || "Unable to save changes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="branch-manager">
      <div className="branch-manager-header">
        <div>
          <p className="page-overline">Student Manager</p>
          <h3>{branch.branch} - Year {branch.year}</h3>
        </div>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>

      <div className="branch-manager-top">
        <input
          type="text"
          value={branchName}
          placeholder="Branch name"
          onChange={(e) => setBranchName(e.target.value)}
        />
        <input
          type="number"
          value={year}
          placeholder="Year"
          onChange={(e) => setYear(e.target.value)}
        />
      </div>

      <div className="branch-manager-top">
        <input
          type="text"
          value={newRoll}
          placeholder="Add new student roll number"
          onChange={(e) => setNewRoll(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addNewStudent()
            }
          }}
        />
        <button className="btn-primary" onClick={addNewStudent}>Add student</button>
      </div>

      <div className="branch-manager-grid">
        <article className="branch-column">
          <div className="branch-column-head">
            <h4>Active students ({activeRolls.length})</h4>
          </div>
          <div className="student-list">
            {activeRolls.length === 0 && <p className="arrange-muted">No active students.</p>}
            {activeRolls.map((roll) => (
              <div key={roll} className="student-item">
                <span>{roll}</span>
                <div>
                  <button className="btn-secondary" onClick={() => detainStudent(roll)}>Detain</button>
                  <button className="btn-danger" onClick={() => removeActiveStudent(roll)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="branch-column">
          <div className="branch-column-head">
            <h4>Detained students ({detainedRolls.length})</h4>
          </div>
          <div className="student-list">
            {detainedRolls.length === 0 && <p className="arrange-muted">No detained students.</p>}
            {detainedRolls.map((roll) => (
              <div key={roll} className="student-item">
                <span>{roll}</span>
                <div>
                  <button className="btn-secondary" onClick={() => restoreStudent(roll)}>Restore</button>
                  <button className="btn-danger" onClick={() => removeDetainedStudent(roll)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="branch-bulk-editor">
        <h4>Bulk update active students</h4>
        <p className="arrange-muted">Paste roll numbers (one per line) and apply to replace active list.</p>
        <textarea
          rows="7"
          value={bulkActiveInput}
          onChange={(e) => setBulkActiveInput(e.target.value)}
          placeholder="22FE1A6101\n22FE1A6102"
        />
        <button className="btn-secondary" onClick={applyBulkActive}>Apply active list</button>
      </div>

      {error && <p className="arrange-error">{error}</p>}

      <div className="arrange-actions">
        <p className="arrange-muted">
          Active students are used in seating generation. Detained students are tracked but excluded.
        </p>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save branch changes"}
        </button>
      </div>
    </section>
  )
}
