import React, { useState, useMemo } from "react"
import { CheckCircle2, X, Info } from "lucide-react"
import {
  INITIAL_DELIVERIES,
  INITIAL_FEEDBACKS,
} from "./mockDeliveryData"

import DeliveryHeader from "./component/DeliveryHeader"
import DeliveryKPICards from "./component/DeliveryKPICards"
import DeliveryFilterStrip from "./component/DeliveryFilterStrip"
import DeliveryTableView from "./component/DeliveryTableView"
import DeliveryMobileCards from "./component/DeliveryMobileCards"
import DeliveryEmptyState from "./component/DeliveryEmptyState"
import DeliveryDetailView from "./component/DeliveryDetailView"
import FeedbackSubmitModal from "./component/FeedbackSubmitModal"
import FeedbackListView from "./component/FeedbackListView"
import FeedbackDetailView from "./component/FeedbackDetailView"

import styles from "./index.module.scss"

const VIEW_MODES = {
  DELIVERY_LIST: "DELIVERY_LIST",       // SCREEN 01
  DELIVERY_DETAIL: "DELIVERY_DETAIL",   // SCREEN 02
  FEEDBACK_LIST: "FEEDBACK_LIST",       // SCREEN 04
  FEEDBACK_DETAIL: "FEEDBACK_DETAIL",   // SCREEN 05
}

export default function IngredientInspect() {
  // Quản lý dữ liệu mock state
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES)
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS)

  // Điều hướng màn hình
  const [currentView, setCurrentView] = useState(VIEW_MODES.DELIVERY_LIST)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [previousView, setPreviousView] = useState(VIEW_MODES.DELIVERY_LIST)

  // Modal gửi phản hồi (SCREEN 03)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [deliveryForFeedback, setDeliveryForFeedback] = useState(null)

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
        // Chỉ lấy các chuyến có ngày 2026-10-24
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

  // Điều hướng tới SCREEN 04 (Danh sách phản hồi đã gửi)
  const handleOpenFeedbackList = () => {
    setCurrentView(VIEW_MODES.FEEDBACK_LIST)
  }

  // Điều hướng tới SCREEN 05 (Chi tiết phản hồi)
  const handleSelectFeedback = (feedback) => {
    setPreviousView(currentView)
    setSelectedFeedback(feedback)
    setCurrentView(VIEW_MODES.FEEDBACK_DETAIL)
  }

  // Mở modal gửi phản hồi (SCREEN 03)
  const handleOpenSubmitModal = (delivery) => {
    setDeliveryForFeedback(delivery)
    setIsSubmitModalOpen(true)
  }

  // Xử lý gửi phản hồi thành công (SCREEN 03)
  const handleSubmitFeedback = (newFeedback) => {
    setFeedbacks((prev) => [newFeedback, ...prev])
    setIsSubmitModalOpen(false)
    setDeliveryForFeedback(null)

    // Hiển thị toast thành công
    setSuccessToast(
      `Đã gửi phản hồi thành công đến ${newFeedback.supplierName}! Trạng thái hiện tại: Đang chờ phản hồi.`
    )
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
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* SCREEN 01: DANH SÁCH GIAO HÀNG */}
      {currentView === VIEW_MODES.DELIVERY_LIST && (
        <div className={styles.viewContent}>
          <DeliveryHeader
            feedbackCount={feedbacks.length}
            onOpenFeedbackList={handleOpenFeedbackList}
          />

          <DeliveryKPICards
            deliveries={deliveries}
            feedbacks={feedbacks}
          />

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

          {/* Hộp thông tin phân quyền chuyên viên y tế (Chỉ xem & Gửi phản hồi) */}
          <div className={styles.roleNoticeCard}>
            <div className={styles.roleIconWrap}>
              <Info size={18} />
            </div>
            <div className={styles.roleNoticeContent}>
              <span className={styles.roleNoticeTitle}>
                Phạm vi nghiệp vụ: Chuyên viên Y tế học đường (Giám sát & Đánh giá)
              </span>
              <p className={styles.roleNoticeDesc}>
                Nhân viên y tế có thẩm quyền tra cứu thông tin nguồn gốc lô hàng, đối chiếu điều kiện giao nhận và gửi phản hồi chất lượng trực tiếp đến nhà cung cấp. Các thao tác phê duyệt nhập kho, nghiệm thu hoặc từ chối lô hàng thuộc trách nhiệm của Bếp trưởng và Ban Quản lý Bán trú.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 02: CHI TIẾT GIAO HÀNG */}
      {currentView === VIEW_MODES.DELIVERY_DETAIL && selectedDelivery && (
        <div className={styles.viewContent}>
          <DeliveryDetailView
            delivery={selectedDelivery}
            feedbacks={feedbacks}
            onBack={() => setCurrentView(VIEW_MODES.DELIVERY_LIST)}
            onOpenSubmitFeedback={handleOpenSubmitModal}
            onSelectFeedback={handleSelectFeedback}
          />
        </div>
      )}

      {/* SCREEN 04: DANH SÁCH PHẢN HỒI ĐÃ GỬI */}
      {currentView === VIEW_MODES.FEEDBACK_LIST && (
        <div className={styles.viewContent}>
          <FeedbackListView
            feedbacks={feedbacks}
            onBackToDeliveries={() => setCurrentView(VIEW_MODES.DELIVERY_LIST)}
            onSelectFeedback={handleSelectFeedback}
          />
        </div>
      )}

      {/* SCREEN 05: CHI TIẾT PHẢN HỒI */}
      {currentView === VIEW_MODES.FEEDBACK_DETAIL && selectedFeedback && (
        <div className={styles.viewContent}>
          <FeedbackDetailView
            feedback={selectedFeedback}
            onBack={() => {
              if (previousView === VIEW_MODES.DELIVERY_DETAIL) {
                setCurrentView(VIEW_MODES.DELIVERY_DETAIL)
              } else {
                setCurrentView(VIEW_MODES.FEEDBACK_LIST)
              }
            }}
          />
        </div>
      )}

      {/* SCREEN 03: MODAL GỬI PHẢN HỒI CHẤT LƯỢNG NGUYÊN LIỆU */}
      {isSubmitModalOpen && deliveryForFeedback && (
        <FeedbackSubmitModal
          delivery={deliveryForFeedback}
          onClose={() => {
            setIsSubmitModalOpen(false)
            setDeliveryForFeedback(null)
          }}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}
    </div>
  )
}
