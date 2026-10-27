import React, { useEffect, useMemo, useState } from "react"
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

  const updateStatus = nextStatus => {
    setMenu(current => (current ? { ...current, status: nextStatus } : current))
  }

  const handleApprove = async notes => {
    setSubmitting(true)
    try {
      await MenuService.approveMenu(menu.id, { notes: notes || directive })
      updateStatus("APPROVED")
      setDialog(null)
      notice({
        msg: "Phê duyệt thực đơn thành công",
        desc: "Thực đơn tuần 43 đã được Ban Giám hiệu ký duyệt.",
      })
    } catch (requestError) {
      notice({
        msg: "Không thể phê duyệt thực đơn",
        desc: requestError?.response?.data?.message,
        isSuccess: false,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestRevision = async reason => {
    setSubmitting(true)
    try {
      await MenuService.requestRevision(menu.id, { reason })
      updateStatus("REVISION_REQUESTED")
      setDialog(null)
      notice({
        msg: "Đã gửi yêu cầu điều chỉnh",
        desc: "Tổ Dinh dưỡng và Bếp trưởng đã nhận được phản hồi.",
        isSuccess: false,
      })
    } catch (requestError) {
      notice({
        msg: "Không thể gửi yêu cầu",
        desc: requestError?.response?.data?.message,
        isSuccess: false,
      })
    } finally {
      setSubmitting(false)
    }
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
        menu={menu}
        onApprove={() => setDialog("approve")}
        onReject={() => setDialog("reject")}
        onPrint={() => window.print()}
      />
      <MenuSummary menu={menu} />
      <MenuSchedule
        days={menu.days}
        visibleDays={visibleDays}
        activeDay={activeDay}
        onDayChange={setActiveDay}
      />
      <MenuReview
        review={menu.medicalReview}
        approval={menu.approval}
        directive={directive}
        status={menu.status}
        onDirectiveChange={setDirective}
        onApprove={() => handleApprove(directive)}
        onReject={() => setDialog("reject")}
        submitting={submitting}
      />
      <DecisionDialog
        type={dialog}
        menu={menu}
        open={Boolean(dialog)}
        submitting={submitting}
        initialNotes={dialog === "approve" ? directive : ""}
        onClose={() => setDialog(null)}
        onApprove={handleApprove}
        onReject={handleRequestRevision}
      />
    </div>
  )
}

export default MenuApproval
