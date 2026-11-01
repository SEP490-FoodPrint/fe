import React, { useEffect, useMemo, useRef, useState } from "react"
import { Alert, Skeleton } from "@mui/material"
import notice from "src/components/Notice"
import MenuService from "src/services/MenuService"
import DecisionDialog from "./component/DecisionDialog"
import MenuApprovalHeader from "./component/MenuApprovalHeader"
import MenuReview from "./component/MenuReview"
import MenuSchedule from "./component/MenuSchedule"
import MenuSummary from "./component/MenuSummary"
import "./style.scss"

// Ưu tiên tuần chờ duyệt cũ nhất; không còn tuần chờ thì mở tuần mới nhất
const pickDefaultWeek = weeks => {
  const pending = weeks.filter(week => week.status === "PENDING_APPROVAL")
  return (pending.at(-1) || weeks[0])?.id || null
}

function MenuApproval() {
  const [weeks, setWeeks] = useState([])
  const [menuId, setMenuId] = useState(null)
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeDay, setActiveDay] = useState("all")
  const [dialog, setDialog] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  useEffect(() => {
    let mounted = true

    const loadWeeks = async () => {
      setLoading(true)
      setError("")
      try {
        const items = await MenuService.getApprovalWeeks()
        if (!mounted) return
        setWeeks(items)
        setMenuId(pickDefaultWeek(items))
        if (!items.length) setLoading(false)
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError?.response?.data?.message ||
              "Không thể tải danh sách tuần thực đơn. Vui lòng thử lại.",
          )
          setLoading(false)
        }
      }
    }

    loadWeeks()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!menuId) return undefined
    let mounted = true

    const loadMenu = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await MenuService.getApprovalDetail(menuId)
        if (mounted) setMenu(response?.data || response)
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError?.response?.data?.message ||
              "Không thể tải hồ sơ thực đơn. Vui lòng thử lại.",
          )
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadMenu()
    return () => {
      mounted = false
    }
  }, [menuId])

  const visibleDays = useMemo(() => {
    if (!menu?.days) return []
    return activeDay === "all"
      ? menu.days
      : menu.days.filter(day => day.id === activeDay)
  }, [activeDay, menu?.days])

  // Thực đơn chỉ được duyệt hoặc trả về theo cả tuần; tab ngày chỉ để xem
  const canDecide = menu?.status === "PENDING_APPROVAL" && Boolean(menu?.canDecide)

  const openDecision = type => {
    if (!canDecide || submitting) return
    setDialog({ type })
  }

  const changeDay = dayId => {
    if (submitting || dialog) return
    setActiveDay(dayId)
  }

  const changeWeek = weekId => {
    if (submitting || dialog || weekId === menuId) return
    setMenuId(weekId)
    setActiveDay("all")
  }

  const applyDecision = async (type, text) => {
    if (!dialog || submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    try {
      const response = type === "approve"
        ? await MenuService.approveMenu(menu.id, {})
        : await MenuService.requestRevision(menu.id, { reason: text })
      const result = response.data
      setWeeks(current =>
        current.map(week => (week.id === menu.id ? { ...week, status: result.status } : week)),
      )
      setMenu(current => ({
        ...current,
        status: result.status,
        days: current.days.map(day => {
          const changed = result.days.find(item => item.id === day.id)
          return changed ? { ...day, status: changed.status } : day
        }),
        canDecide: false,
      }))
      setDialog(null)
      notice({
        msg: type === "approve" ? "Đã phê duyệt thực đơn tuần" : "Đã yêu cầu Y tế chỉnh sửa thực đơn",
      })
      try {
        const detail = await MenuService.getApprovalDetail(menu.id)
        setMenu(detail.data)
      } catch {
        notice({ msg: "Đã lưu quyết định; vui lòng tải lại để xem nhận xét mới nhất.", isSuccess: false })
      }
    } catch (requestError) {
      notice({
        msg: "Không thể xử lý thực đơn",
        desc: requestError?.response?.data?.message,
        isSuccess: false,
      })
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    await applyDecision("approve")
  }

  const handleRequestRevision = async reason => {
    await applyDecision("reject", reason)
  }

  if (loading) {
    return (
      <div className="menu-approval-page menu-approval-page--loading">
        <Skeleton variant="rounded" height={148} />
        <div className="menu-approval-page__skeleton-grid">
          <Skeleton variant="rounded" height={260} />
          <Skeleton variant="rounded" height={260} />
        </div>
        <Skeleton variant="rounded" height={420} />
      </div>
    )
  }

  if (!error && !weeks.length) {
    return (
      <div className="menu-approval-page">
        <Alert severity="info">Chưa có thực đơn tuần nào được Y tế gửi duyệt.</Alert>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="menu-approval-page">
        <Alert severity="error">{error || "Không tìm thấy thực đơn."}</Alert>
      </div>
    )
  }

  return (
    <div className="menu-approval-page">
      <MenuApprovalHeader
        menu={menu}
        weeks={weeks}
        selectedWeekId={menuId}
        onWeekChange={changeWeek}
        canDecide={canDecide}
        submitting={submitting}
        onApprove={() => openDecision("approve")}
        onReject={() => openDecision("reject")}
        onPrint={() => window.print()}
      />
      <MenuSummary menu={menu} />
      <MenuSchedule
        days={menu.days}
        visibleDays={visibleDays}
        activeDay={activeDay}
        onDayChange={changeDay}
        disabled={submitting || Boolean(dialog)}
      />
      <MenuReview
        review={menu.medicalReview}
        approval={menu.approval}
        status={menu.status}
      />
      <DecisionDialog
        type={dialog?.type || null}
        menu={menu}
        open={Boolean(dialog)}
        submitting={submitting}
        onClose={() => setDialog(null)}
        onApprove={handleApprove}
        onReject={handleRequestRevision}
      />
    </div>
  )
}

export default MenuApproval
