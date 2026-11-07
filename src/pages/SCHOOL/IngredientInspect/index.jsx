import React, { useState, useMemo } from "react"
import { CheckCircle2, X } from "lucide-react"
import { INITIAL_DELIVERIES } from "./mockDeliveryData"

import DeliveryHeader from "./component/DeliveryHeader"
import DeliveryKPICards from "./component/DeliveryKPICards"
import DeliveryFilterStrip from "./component/DeliveryFilterStrip"
import DeliveryTableView from "./component/DeliveryTableView"
import DeliveryMobileCards from "./component/DeliveryMobileCards"
import DeliveryEmptyState from "./component/DeliveryEmptyState"
import DeliveryDetailView from "./component/DeliveryDetailView"
import DeliveryApprovalModal from "./component/DeliveryApprovalModal"

import styles from "./index.module.scss"

const VIEW_MODES = {
  DELIVERY_LIST: "DELIVERY_LIST",       // SCREEN 01: Danh sách đợt giao
  DELIVERY_DETAIL: "DELIVERY_DETAIL",   // SCREEN 02: Chi tiết đợt giao & Kiểm thực
}

export default function IngredientInspect() {
  // Quản lý dữ liệu mock state
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES)

  // Điều hướng màn hình
  const [currentView, setCurrentView] = useState(VIEW_MODES.DELIVERY_LIST)
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  // Modal phê duyệt / từ chối kiểm thực giao hàng
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [deliveryForApproval, setDeliveryForApproval] = useState(null)
  const [currentApprovalToEdit, setCurrentApprovalToEdit] = useState(null)

  // Toast thông báo thành công
  const [successToast, setSuccessToast] = useState("")

  // Filter & Search states (SCREEN 01)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [timeFilter, setTimeFilter] = useState("ALL")

  // Kiểm tra có filter đang hoạt động
  const hasActiveFilters = Boolean(
    searchTerm.trim() !== "" || statusFilter !== "ALL" || timeFilter !== "ALL"
  )

  // Reset bộ lọc
  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("ALL")
    setTimeFilter("ALL")
  }

  // Lọc danh sách Deliveries cho SCREEN 01
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // 1. Tìm kiếm theo mã hoặc nhà cung cấp
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const matchNo = item.deliveryNo?.toLowerCase().includes(query)
        const matchSupplier = item.supplierName?.toLowerCase().includes(query)
        if (!matchNo && !matchSupplier) return false
      }

      // 2. Lọc theo trạng thái
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false
      }

      // 3. Lọc theo thời gian (giả định theo mock data)
      if (timeFilter === "today") {
        return (
          item.expectedArrivalAt?.startsWith("2026-10-24") ||
          item.arrivedAt?.startsWith("2026-10-24")
        )
      } else if (timeFilter === "week") {
        return item.expectedArrivalAt?.startsWith("2026-10")
      }

      return true
    })
  }, [deliveries, searchTerm, statusFilter, timeFilter])

  // Điều hướng tới SCREEN 02 (Chi tiết giao hàng)
  const handleSelectDelivery = (delivery) => {
    setSelectedDelivery(delivery)
    setCurrentView(VIEW_MODES.DELIVERY_DETAIL)
  }

  // Mở modal kiểm thực / phê duyệt giao nhận (Duyệt vs Từ chối)
  const handleOpenApprovalModal = (delivery, currentApproval = null) => {
    setDeliveryForApproval(delivery)
    setCurrentApprovalToEdit(currentApproval)
    setIsApprovalModalOpen(true)
  }

  // Xử lý lưu quyết định kiểm thực (APPROVE vs REJECT)
  const handleSubmitApproval = (decision, reason) => {
    if (!deliveryForApproval) return

    const now = new Date().toISOString()
    const updatedApproval = {
      id: currentApprovalToEdit?.id || `appr-${Date.now()}`,
      roleCode: "SCHOOL_HEALTH_OFFICER",
      roleName: "Cán bộ Y tế",
      userName: "BS. Nguyễn Thu Trang",
      decision,
      reason,
      decidedAt: now,
    }

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== deliveryForApproval.id) return d

        const existingApprovals = d.deliveryApprovals || []
        const filteredApprovals = existingApprovals.filter(
          (a) => a.roleCode !== "SCHOOL_HEALTH_OFFICER"
        )
        const newApprovals = [...filteredApprovals, updatedApproval]

        let newStatus = d.status
        if (decision === "REJECT") {
          newStatus = "REJECTED"
        } else if (decision === "APPROVE") {
          const hasAnyReject = newApprovals.some((a) => a.decision === "REJECT")
          if (hasAnyReject) {
            newStatus = "REJECTED"
          } else {
            newStatus = "RECEIVED"
          }
        }

        const updated = {
          ...d,
          status: newStatus,
          deliveryApprovals: newApprovals,
          receivedAt: newStatus === "RECEIVED" ? (d.receivedAt || now) : d.receivedAt,
        }

        // Cập nhật selectedDelivery nếu đang mở chi tiết
        if (selectedDelivery && selectedDelivery.id === d.id) {
          setSelectedDelivery(updated)
        }

        return updated
      })
    )

    setIsApprovalModalOpen(false)
    setDeliveryForApproval(null)
    setCurrentApprovalToEdit(null)

    // Hiển thị toast thông báo
    if (decision === "APPROVE") {
      setSuccessToast(
        `Đã ghi nhận Cán bộ Y tế PHÊ DUYỆT tiếp nhận đợt giao ${deliveryForApproval.deliveryNo}!`
      )
    } else {
      setSuccessToast(
        `Đã ghi nhận Cán bộ Y tế TỪ CHỐI tiếp nhận đợt giao ${deliveryForApproval.deliveryNo}. Lý do: ${reason}`
      )
    }

    setTimeout(() => {
      setSuccessToast("")
    }, 6000)
  }

  return (
    <div className={styles.pageContainer}>
      {/* Toast thông báo thành công */}
      {successToast && (
        <div className={styles.toastSuccess}>
          <div className={styles.toastContent}>
            <CheckCircle2 size={18} className={styles.toastIcon} />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => setSuccessToast("")}
            aria-label="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* SCREEN 01: DANH SÁCH GIAO HÀNG */}
      {currentView === VIEW_MODES.DELIVERY_LIST && (
        <div className={styles.viewContent}>
          <DeliveryHeader />

          <DeliveryKPICards deliveries={deliveries} />

          <DeliveryFilterStrip
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            timeFilter={timeFilter}
            onTimeChange={setTimeFilter}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {filteredDeliveries.length > 0 ? (
            <>
              <div className={styles.desktopViewWrap}>
                <DeliveryTableView
                  deliveries={filteredDeliveries}
                  onSelectDelivery={handleSelectDelivery}
                />
              </div>
              <div className={styles.mobileViewWrap}>
                <DeliveryMobileCards
                  deliveries={filteredDeliveries}
                  onSelectDelivery={handleSelectDelivery}
                />
              </div>
            </>
          ) : (
            <DeliveryEmptyState
              onResetFilters={hasActiveFilters ? handleResetFilters : null}
            />
          )}
        </div>
      )}

      {/* SCREEN 02: CHI TIẾT GIAO HÀNG & KIỂM THỰC */}
      {currentView === VIEW_MODES.DELIVERY_DETAIL && selectedDelivery && (
        <div className={styles.viewContent}>
          <DeliveryDetailView
            delivery={selectedDelivery}
            onBack={() => setCurrentView(VIEW_MODES.DELIVERY_LIST)}
            onOpenApprovalModal={handleOpenApprovalModal}
          />
        </div>
      )}

      {/* MODAL PHÊ DUYỆT / TỪ CHỐI KIỂM THỰC GIAO NHẬN */}
      {isApprovalModalOpen && deliveryForApproval && (
        <DeliveryApprovalModal
          delivery={deliveryForApproval}
          currentApproval={currentApprovalToEdit}
          onClose={() => {
            setIsApprovalModalOpen(false)
            setDeliveryForApproval(null)
            setCurrentApprovalToEdit(null)
          }}
          onSubmitApproval={handleSubmitApproval}
        />
      )}
    </div>
  )
}
