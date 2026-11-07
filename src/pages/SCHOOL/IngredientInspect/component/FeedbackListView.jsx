import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react"
import { FEEDBACK_STATUS_CONFIG } from "../mockDeliveryData"
import styles from "./FeedbackListView.module.scss"

export default function FeedbackListView({
  feedbacks = [],
  onBackToDeliveries,
  onSelectFeedback,
}) {
  const [activeTab, setActiveTab] = useState("ALL") // "ALL" | "SUBMITTED" | "RESPONDED"

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (activeTab === "ALL") return true
    return item.status === activeTab
  })

  const submittedCount = feedbacks.filter((f) => f.status === "SUBMITTED").length
  const respondedCount = feedbacks.filter((f) => f.status === "RESPONDED").length

  const formatDate = (isoString) => {
    if (!isoString) return "--"
    try {
      const d = new Date(isoString)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      const hours = String(d.getHours()).padStart(2, "0")
      const minutes = String(d.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes} • ${day}/${month}/${year}`
    } catch {
      return "--"
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* 1. Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleCol}>
          <h1 className={styles.pageTitle}>Phản hồi chất lượng nguyên liệu</h1>
          <p className={styles.pageDesc}>
            Theo dõi các phản hồi đã gửi đến nhà cung cấp và tình trạng trả lời.
          </p>
        </div>

        <button
          type="button"
          className={styles.backBtn}
          onClick={onBackToDeliveries}
          title="Quay lại danh sách chuyến giao"
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách giao hàng</span>
        </button>
      </div>

      {/* 2. Status Tabs */}
      <div className={styles.tabsBar}>
        <div className={styles.tabsGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "ALL" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            <span>Tất cả</span>
            <span className={styles.tabBadge}>{feedbacks.length}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "SUBMITTED" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("SUBMITTED")}
          >
            <span>Đang chờ phản hồi</span>
            <span className={`${styles.tabBadge} ${styles.blueBadge}`}>{submittedCount}</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "RESPONDED" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("RESPONDED")}
          >
            <span>Đã phản hồi</span>
            <span className={`${styles.tabBadge} ${styles.greenBadge}`}>{respondedCount}</span>
          </button>
        </div>
      </div>

      {/* 3. Table / List */}
      {filteredFeedbacks.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thTitle}>Tiêu đề phản hồi</th>
                <th className={styles.thDeliveryNo}>Mã giao hàng</th>
                <th className={styles.thSupplier}>Nhà cung cấp</th>
                <th className={styles.thTarget}>Nguyên liệu / Lô</th>
                <th className={styles.thDate}>Ngày gửi</th>
                <th className={styles.thStatus}>Trạng thái</th>
                <th className={styles.thAction}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((fb) => {
                const statusCfg = FEEDBACK_STATUS_CONFIG[fb.status] || {
                  label: fb.status,
                  bg: "#eff6ff",
                  color: "#1d4ed8",
                }

                return (
                  <tr key={fb.id} className={styles.tableRow}>
                    <td className={styles.tdTitle}>
                      <button
                        type="button"
                        className={styles.titleLink}
                        onClick={() => onSelectFeedback(fb)}
                      >
                        {fb.title}
                      </button>
                    </td>

                    <td className={styles.tdDeliveryNo}>{fb.deliveryNo}</td>

                    <td className={styles.tdSupplier}>{fb.supplierName}</td>

                    <td className={styles.tdTarget}>
                      {fb.lotCode ? (
                        <div className={styles.lotTargetWrap}>
                          <span className={styles.ingName}>{fb.ingredientName}</span>
                          <span className={styles.lotCodePill}>{fb.lotCode}</span>
                        </div>
                      ) : (
                        <span className={styles.allDeliveryTag}>Toàn bộ chuyến giao</span>
                      )}
                    </td>

                    <td className={styles.tdDate}>{formatDate(fb.createdAt)}</td>

                    <td className={styles.tdStatus}>
                      <span
                        className={styles.statusPill}
                        style={{
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.color,
                          borderColor: statusCfg.border,
                        }}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ backgroundColor: statusCfg.dot }}
                        />
                        {statusCfg.label}
                      </span>
                    </td>

                    <td className={styles.tdAction}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => onSelectFeedback(fb)}
                        title="Xem chi tiết trao đổi"
                      >
                        <Eye size={15} />
                        <span>Xem chi tiết</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyWrap}>
          <MessageSquare size={32} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Chưa có phản hồi nào trong mục này</h3>
          <p className={styles.emptyDesc}>
            Khi bạn ghi nhận phản hồi chất lượng ở các đợt giao nguyên liệu, danh sách sẽ được lưu trữ tại đây.
          </p>
        </div>
      )}
    </div>
  )
}

FeedbackListView.propTypes = {
  feedbacks: PropTypes.array.isRequired,
  onBackToDeliveries: PropTypes.func.isRequired,
  onSelectFeedback: PropTypes.func.isRequired,
}
