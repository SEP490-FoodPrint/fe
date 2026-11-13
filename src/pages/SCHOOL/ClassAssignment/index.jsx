import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, Button } from "@mui/material"
import notice from "src/components/Notice"
import ROUTER from "src/router/ROUTER"
import AcademicYearService from "src/services/AcademicYearService"
import ClassService from "src/services/ClassService"
import AssignTeacherDialog from "./component/AssignTeacherDialog"
import ClassAssignmentHeader from "./component/ClassAssignmentHeader"
import ClassFormDialog from "./component/ClassFormDialog"
import ClassStatusDialog from "./component/ClassStatusDialog"
import ClassTable from "./component/ClassTable"
import CopyClassesDialog from "./component/CopyClassesDialog"
import ImportClassesDialog from "./component/ImportClassesDialog"
import { downloadClassList } from "./classExcel"
import "./style.scss"

const EXPORT_PAGE_SIZE = 100

// Xuất đủ mọi lớp của niên khóa, không chỉ trang đang hiển thị.
const fetchAllClasses = async academicYear => {
  const items = []
  for (let page = 1; ; page += 1) {
    const response = await ClassService.getClasses({ academicYear, page, limit: EXPORT_PAGE_SIZE })
    items.push(...response.data.items)
    if (!response.data.pagination?.hasNext) return items
  }
}

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback
const YEAR_PATTERN = /^(\d{4})-(\d{4})$/

// Năm kết thúc của niên khóa "N-N+1"; null nếu nhãn không đúng định dạng.
const yearEnd = label => {
  const match = YEAR_PATTERN.exec(label || "")
  return match && Number(match[2]) === Number(match[1]) + 1 ? Number(match[2]) : null
}

// Cùng quy tắc với backend: chỉ niên khóa hiện tại hoặc sắp tới mới được tạo/sửa lớp.
const isWritableYear = (label, currentYear) => {
  const end = yearEnd(label)
  const currentEnd = yearEnd(currentYear)
  return end !== null && currentEnd !== null && end >= currentEnd
}

function ClassAssignment() {
  const navigate = useNavigate()
  const [classYears, setClassYears] = useState([])
  const [configuredYears, setConfiguredYears] = useState([])
  const [configuredLoaded, setConfiguredLoaded] = useState(false)
  const [currentYear, setCurrentYear] = useState("")
  const [academicYear, setAcademicYear] = useState("")
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialog, setDialog] = useState(null)
  const [form, setForm] = useState(null)
  const [statusItem, setStatusItem] = useState(null)
  const [copyOpen, setCopyOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true
    ClassService.getAcademicYears()
      .then(response => {
        if (!active) return
        setClassYears(response.data.items)
        setCurrentYear(response.data.current)
        setAcademicYear(value => value || response.data.current)
      })
      .catch(failure => {
        if (!active) return
        setError(errorMessage(failure, "Không thể tải danh sách niên khóa."))
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refresh])

  useEffect(() => {
    let active = true
    AcademicYearService.list()
      .then(response => {
        if (active) setConfiguredYears((response.data || []).map(item => item.academicYear))
      })
      .catch(() => {
        if (active) setConfiguredYears([])
      })
      .finally(() => {
        if (active) setConfiguredLoaded(true)
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

  const writableYears = useMemo(
    () =>
      configuredYears
        .filter(label => isWritableYear(label, currentYear))
        .sort((a, b) => a.localeCompare(b)),
    [configuredYears, currentYear],
  )

  const years = useMemo(() => {
    const valid = configuredYears.filter(label => yearEnd(label) !== null)
    return [...new Set([...classYears, ...valid])].sort((a, b) => b.localeCompare(a))
  }, [classYears, configuredYears])

  const canManage = writableYears.includes(academicYear)

  const handleDone = message => {
    setDialog(null)
    setForm(null)
    setStatusItem(null)
    setRefresh(value => value + 1)
    notice({ msg: message })
  }

  const handleCopied = result => {
    setCopyOpen(false)
    const created = result?.created?.length || 0
    const skipped = result?.skipped || []
    const skippedText = skipped.length ? `; bỏ qua ${skipped.length} lớp trùng tên (${skipped.join(", ")})` : ""
    if (result?.toAcademicYear) setAcademicYear(result.toAcademicYear)
    setRefresh(value => value + 1)
    notice({ msg: `Đã sao chép ${created} lớp sang niên khóa ${result?.toAcademicYear}${skippedText}` })
  }

  const handleImported = result => {
    setImportOpen(false)
    const skipped = result?.summary?.skip || 0
    const skippedText = skipped ? `; bỏ qua ${skipped} lớp đã có` : ""
    if (result?.academicYear) setAcademicYear(result.academicYear)
    setRefresh(value => value + 1)
    notice({ msg: `Đã nhập ${result?.created?.length || 0} lớp vào niên khóa ${result?.academicYear}${skippedText}` })
  }

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const items = await fetchAllClasses(academicYear)
      await downloadClassList({ academicYear, classes: items })
    } catch {
      notice({ isSuccess: false, msg: "Không thể xuất danh sách lớp. Vui lòng thử lại." })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="class-assignment-page">
      <ClassAssignmentHeader
        years={years}
        academicYear={academicYear}
        currentYear={currentYear}
        onYearChange={setAcademicYear}
        canManage={canManage}
        onCreate={() => setForm({ mode: "create", item: null })}
        onCopy={() => setCopyOpen(true)}
        canImport={writableYears.length > 0}
        canExport={!loading && classes.length > 0}
        exporting={exporting}
        onImport={() => setImportOpen(true)}
        onExport={handleExport}
      />
      {configuredLoaded && !writableYears.length && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => navigate(ROUTER.SCHOOL_ACADEMIC_YEARS)}>
              Cấu hình năm học
            </Button>
          }
        >
          Chưa có niên khóa hiện tại hoặc sắp tới được cấu hình (dạng 2026-2027). Cần cấu hình năm học trước khi
          thêm lớp.
        </Alert>
      )}
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <ClassTable
          classes={classes}
          loading={loading}
          canManage={canManage}
          onAssign={item => setDialog({ mode: "assign", item })}
          onRemove={item => setDialog({ mode: "remove", item })}
          onEdit={item => setForm({ mode: "edit", item })}
          onToggleStatus={setStatusItem}
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
      <ClassFormDialog
        open={Boolean(form)}
        mode={form?.mode || "create"}
        item={form?.item || null}
        academicYear={academicYear}
        writableYears={writableYears}
        onClose={() => setForm(null)}
        onDone={handleDone}
      />
      <ClassStatusDialog
        open={Boolean(statusItem)}
        item={statusItem}
        onClose={() => setStatusItem(null)}
        onDone={handleDone}
      />
      <CopyClassesDialog
        open={copyOpen}
        years={years}
        targetYear={academicYear}
        writableYears={writableYears}
        onClose={() => setCopyOpen(false)}
        onDone={handleCopied}
      />
      <ImportClassesDialog
        open={importOpen}
        academicYear={academicYear}
        writableYears={writableYears}
        onClose={() => setImportOpen(false)}
        onDone={handleImported}
      />
    </div>
  )
}

export default ClassAssignment
