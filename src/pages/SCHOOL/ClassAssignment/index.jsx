import React, { useEffect, useState } from "react"
import { Alert } from "@mui/material"
import notice from "src/components/Notice"
import ClassService from "src/services/ClassService"
import AssignTeacherDialog from "./component/AssignTeacherDialog"
import ClassAssignmentHeader from "./component/ClassAssignmentHeader"
import ClassTable from "./component/ClassTable"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

function ClassAssignment() {
  const [years, setYears] = useState([])
  const [currentYear, setCurrentYear] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialog, setDialog] = useState(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true
    ClassService.getAcademicYears()
      .then(response => {
        if (!active) return
        setYears(response.data.items)
        setCurrentYear(response.data.current)
        setAcademicYear(response.data.current)
      })
      .catch(failure => {
        if (!active) return
        setError(errorMessage(failure, "Không thể tải danh sách niên khóa."))
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!academicYear) return undefined
    let active = true
    setLoading(true)
    setError("")
    ClassService.getClasses({ academicYear, limit: 100 })
      .then(response => {
        if (active) setClasses(response.data.items)
      })
      .catch(failure => {
        if (!active) return
        setClasses([])
        setError(errorMessage(failure, "Không thể tải danh sách lớp."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [academicYear, refresh])

  const handleDone = message => {
    setDialog(null)
    setRefresh(value => value + 1)
    notice({ msg: message })
  }

  return (
    <div className="class-assignment-page">
      <ClassAssignmentHeader
        years={years}
        academicYear={academicYear}
        currentYear={currentYear}
        onYearChange={setAcademicYear}
      />
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <ClassTable
          classes={classes}
          loading={loading}
          onAssign={item => setDialog({ mode: "assign", item })}
          onRemove={item => setDialog({ mode: "remove", item })}
        />
      )}
      <AssignTeacherDialog
        open={Boolean(dialog)}
        mode={dialog?.mode || "assign"}
        item={dialog?.item || null}
        academicYear={academicYear}
        onClose={() => setDialog(null)}
        onDone={handleDone}
      />
    </div>
  )
}

export default ClassAssignment
