import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Skeleton } from "@mui/material"
import notice from "src/components/Notice"
import MenuService from "src/services/MenuService"
import ApprovalFilterBar from "./component/ApprovalFilterBar"
import DecisionDialog from "./component/DecisionDialog"
import GradeMenuCard from "./component/GradeMenuCard"
import MenuApprovalHeader from "./component/MenuApprovalHeader"
import { menuScopeLabel } from "src/utils/approvalWeek"
import { printMenuPdf } from "src/utils/menuPdf"
import SchoolService from "src/services/SchoolService"
import { StoreContext } from "src/contexts"
import "./style.scss"

const EMPTY_WEEK = { weekStartDate: null, weekEndDate: null, weekNumber: null, weeks: [], menus: [] }

// Thực đơn toàn trường áp dụng cho mọi khối nên luôn khớp bộ lọc khối
const matchesGrade = (menu, gradeId) =>
  !gradeId || menu.isSchoolWide || !menu.grades?.length || menu.grades.some(grade => grade.id === gradeId)

const errorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback

function ListSkeleton() {
  return (
    <div className="menu-approval-page__list" aria-busy="true">
      <Skeleton variant="rounded" height={320} />
      <Skeleton variant="rounded" height={320} />
    </div>
  )
}

// Ban Giám hiệu duyệt theo tuần: một tuần gồm N thực đơn (mỗi thực đơn cho một hoặc nhiều khối)
function MenuApproval() {
  const [week, setWeek] = useState(EMPTY_WEEK)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [gradeFilter, setGradeFilter] = useState("")
  const [schoolGrades, setSchoolGrades] = useState([])
  const [dialog, setDialog] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)
  const requestSeq = useRef(0)
  const submitLock = useRef(false)
  const { userStore } = useContext(StoreContext) || {}
  const currentUser = userStore?.user
  const schoolInfo = useRef(null)
  const [exporting, setExporting] = useState(false)

  // Chỉ nhận kết quả của lần tải mới nhất khi người dùng chuyển tuần liên tục
  const loadWeek = useCallback(async (date, { silent = false } = {}) => {
    const seq = ++requestSeq.current
    if (!silent) setLoading(true)
    setError("")
    try {
      const data = await MenuService.getApprovalWeek(date)
      if (seq !== requestSeq.current) return
      setWeek({ ...EMPTY_WEEK, ...data })
    } catch (requestError) {
      if (seq !== requestSeq.current) return
      if (silent) throw requestError
      setError(errorMessage(requestError, "Không thể tải thực đơn của tuần. Vui lòng thử lại."))
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false)
        setInitialLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadWeek()
  }, [loadWeek])

  // Danh sách khối của trường cho bộ lọc; lỗi ở đây không chặn trang (dùng khối có trong tuần)
  useEffect(() => {
    let active = true
    MenuService.getContext({ forceRefresh: true })
      .then(data => { if (active) setSchoolGrades(data?.grades || []) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const gradeOptions = useMemo(() => {
    if (schoolGrades.length) return schoolGrades.map(grade => ({ id: grade.id, name: grade.name }))
    const fromMenus = new Map()
    week.menus.forEach(menu => menu.grades?.forEach(grade => fromMenus.set(grade.id, grade)))
    return [...fromMenus.values()]
  }, [schoolGrades, week.menus])

  const visibleMenus = useMemo(
    () => week.menus.filter(menu => matchesGrade(menu, gradeFilter)),
    [week.menus, gradeFilter],
  )
  const pendingCount = week.menus.filter(menu => menu.status === "PENDING_APPROVAL").length
  const busy = loading || Boolean(submittingId) || Boolean(dialog)
  const dialogMenu = dialog ? week.menus.find(menu => menu.id === dialog.menuId) : null

  const changeWeek = weekStartDate => {
    if (busy || weekStartDate === week.weekStartDate) return
    loadWeek(weekStartDate)
  }

  const openDecision = (menu, type) => {
    if (!menu.canDecide || busy) return
    setDialog({ type, menuId: menu.id, submissionVersion: menu.submissionVersion })
  }

  const applyDecision = async (type, feedback) => {
    if (!dialog || submitLock.current) return
    submitLock.current = true
    const { menuId, submissionVersion } = dialog
    setSubmittingId(menuId)
    try {
      await MenuService.reviewMenu(menuId, {
        decision: type === "approve" ? "APPROVED" : "REVISION_REQUESTED",
        ...(type === "approve" ? {} : { feedback }),
        ...(submissionVersion ? { submissionVersion } : {}),
      })
      setDialog(null)
      notice({ msg: type === "approve" ? "Đã phê duyệt thực đơn tuần" : "Đã yêu cầu Y tế chỉnh sửa thực đơn" })
      // Tải lại cả tuần để cập nhật trạng thái thực đơn vừa duyệt và số tuần còn chờ
      try {
        await loadWeek(week.weekStartDate, { silent: true })
      } catch {
        notice({ msg: "Đã lưu quyết định; vui lòng tải lại để xem trạng thái mới nhất.", isSuccess: false })
      }
    } catch (requestError) {
      notice({ msg: "Không thể xử lý thực đơn", desc: requestError?.response?.data?.message, isSuccess: false })
    } finally {
      submitLock.current = false
      setSubmittingId(null)
    }
  }

  if (initialLoading) {
    return (
      <div className="menu-approval-page menu-approval-page--loading">
        <Skeleton variant="rounded" height={72} />
        <Skeleton variant="rounded" height={56} />
        <ListSkeleton />
      </div>
    )
  }

  // Xuất PDF các thực đơn đang hiển thị (theo tuần và khối đã lọc), kèm logo và thông tin trường
  const exportPdf = async () => {
    if (exporting || !visibleMenus.length) return
    setExporting(true)
    try {
      if (!schoolInfo.current && currentUser?.orgId) {
        const res = await SchoolService.getSchoolDetailById(currentUser.orgId).catch(() => null)
        schoolInfo.current = res?.data?.data || res?.data || null
      }
      const school = {
        name: currentUser?.schoolName || "",
        ...(schoolInfo.current || {}),
      }
      await printMenuPdf({ school, week, menus: visibleMenus })
    } catch {
      notice({ msg: "Không thể xuất PDF thực đơn. Vui lòng thử lại.", isSuccess: false })
    } finally {
      setExporting(false)
    }
  }

  const renderList = () => {
    if (loading) return <ListSkeleton />
    if (error) return <Alert severity="error">{error}</Alert>
    if (!week.weeks.length) return <Alert severity="info">Chưa có thực đơn tuần nào được Y tế gửi duyệt.</Alert>
    if (!week.menus.length) return <Alert severity="info">Tuần này chưa có thực đơn nào được gửi duyệt.</Alert>
    if (!visibleMenus.length) return <Alert severity="info">Tuần này không có thực đơn cho khối đã chọn.</Alert>
    return (
      <div className="menu-approval-page__list">
        {visibleMenus.map((menu, index) => (
          <GradeMenuCard
            key={menu.id}
            menu={menu}
            position={index + 1}
            total={visibleMenus.length}
            submitting={submittingId === menu.id}
            disabled={busy}
            onApprove={() => openDecision(menu, "approve")}
            onReject={() => openDecision(menu, "reject")}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="menu-approval-page">
      <MenuApprovalHeader
        week={week}
        pendingCount={pendingCount}
        totalCount={week.menus.length}
        onPrint={exportPdf}
        exporting={exporting}
      />

      {week.weeks.length > 0 && (
        <ApprovalFilterBar
          weeks={week.weeks}
          selectedWeek={week.weekStartDate}
          onWeekChange={changeWeek}
          gradeOptions={gradeOptions}
          gradeFilter={gradeFilter}
          onGradeChange={setGradeFilter}
          shownCount={visibleMenus.length}
          totalCount={week.menus.length}
          disabled={busy}
        />
      )}

      {renderList()}

      {dialogMenu && (
        <DecisionDialog
          type={dialog.type}
          menu={{ ...dialogMenu, title: dialogMenu.title || menuScopeLabel(dialogMenu) }}
          open
          submitting={submittingId === dialogMenu.id}
          onClose={() => setDialog(null)}
          onApprove={() => applyDecision("approve")}
          onReject={reason => applyDecision("reject", reason)}
        />
      )}
    </div>
  )
}

export default MenuApproval
