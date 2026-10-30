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

const MENU_ID = "43000000-0000-4000-8000-000000000001"

function MenuApproval() {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeDay, setActiveDay] = useState("all")
  const [directive, setDirective] = useState("")
  const [dialog, setDialog] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  useEffect(() => {
    let mounted = true

    const loadMenu = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await MenuService.getApprovalDetail(MENU_ID)
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
  }, [])

  const visibleDays = useMemo(() => {
    if (!menu?.days) return []
    return activeDay === "all"
      ? menu.days
      : menu.days.filter(day => day.id === activeDay)
  }, [activeDay, menu?.days])

  const selectedDay = menu?.days.find(day => day.id === activeDay)
  const scopeLabel = selectedDay ? `${selectedDay.shortLabel} (${selectedDay.date})` : "cả tuần"
  const scopeStatus = selectedDay?.status || menu?.status
  const canDecide = activeDay === "all"
    ? Boolean(menu?.canDecide)
    : menu?.status !== "DRAFT" && selectedDay?.status === "PENDING_APPROVAL"

  const openDecision = type => {
    if (!canDecide || submitting) return
    setDialog({ type, menuDayId: selectedDay?.id, scopeLabel })
  }

  const changeDay = dayId => {
    if (submitting || dialog) return
    setActiveDay(dayId)
    setDirective("")
  }

  const applyDecision = async (type, text) => {
    if (!dialog || submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    try {
      const body = dialog.menuDayId ? { menuDayId: dialog.menuDayId } : {}
      const response = type === "approve"
        ? await MenuService.approveMenu(menu.id, { ...body, notes: text })
        : await MenuService.requestRevision(menu.id, { ...body, reason: text })
      const result = response.data
      setMenu(current => ({
        ...current,
        status: result.status,
        days: current.days.map(day => {
          const changed = result.days.find(item => item.id === day.id)
          return changed ? { ...day, status: changed.status } : day
        }),
        canDecide: current.days.some(day =>
          day.status === "PENDING_APPROVAL" && !result.days.some(item => item.id === day.id),
        ),
      }))
      setDialog(null)
      setDirective("")
      notice({
        msg: type === "approve" ? "Phê duyệt thành công" : "Đã yêu cầu điều chỉnh",
        desc: `Đã xử lý ${result.days.length} ngày trong phạm vi ${dialog.scopeLabel}.`,
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

  const handleApprove = async notes => {
    await applyDecision("approve", notes)
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
        menu={{ ...menu, status: scopeStatus }}
        canDecide={canDecide}
        scopeLabel={scopeLabel}
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
        approval={selectedDay?.approval || menu.approval}
        directive={directive}
        status={scopeStatus}
        canDecide={canDecide}
        scopeLabel={scopeLabel}
        onDirectiveChange={setDirective}
        onApprove={() => openDecision("approve")}
        onReject={() => openDecision("reject")}
        submitting={submitting}
      />
      <DecisionDialog
        type={dialog?.type || null}
        menu={menu}
        open={Boolean(dialog)}
        submitting={submitting}
        initialNotes={directive}
        scopeLabel={dialog?.scopeLabel || scopeLabel}
        pendingCount={dialog?.menuDayId ? 1 : menu.days.filter(day => day.status === "PENDING_APPROVAL").length}
        onClose={() => setDialog(null)}
        onApprove={handleApprove}
        onReject={handleRequestRevision}
      />
    </div>
  )
}

export default MenuApproval
