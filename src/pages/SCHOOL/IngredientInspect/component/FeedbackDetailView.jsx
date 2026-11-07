import React from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Hourglass,
  Layers,
  FileText,
  ShieldAlert,
} from "lucide-react"
import { FEEDBACK_STATUS_CONFIG } from "../mockDeliveryData"
import styles from "./FeedbackDetailView.module.scss"

export default function FeedbackDetailView({ feedback, onBack }) {
  const isResponded = feedback.status === "RESPONDED"
  const statusCfg = FEEDBACK_STATUS_CONFIG[feedback.status] || {
    label: feedback.status,
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
    dot: "#3b82f6",
  }

  const formatDateTime = (isoString) => {
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
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Chi tiết phản hồi chất lượng</h1>
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
        </div>

        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          title="Quay lại danh sách"
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* 2. Metadata Bar */}
      <div className={styles.metaBar}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Mã giao hàng:</span>
          <span className={styles.metaValueHighlight}>{feedback.deliveryNo}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Nhà cung cấp:</span>
          <span className={styles.metaValue}>{feedback.supplierName}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Đối tượng phản hồi:</span>
          <span className={styles.metaValue}>
            {feedback.lotCode ? `${feedback.ingredientName} (Lô: ${feedback.lotCode})` : "Toàn bộ chuyến giao"}
          </span>
        </div>
      </div>

      {/* 3. Khối 1: Nội dung từ Nhân viên Y tế */}
      <div className={styles.cardHealthOfficer}>
        <div className={styles.cardHeader}>
          <div className={styles.senderInfo}>
            <div className={styles.avatarSchool}>
              <User size={18} />
            </div>
            <div className={styles.senderTextCol}>
              <span className={styles.senderName}>
                {feedback.submittedByName || "BS. Nguyễn Thu Trang"}
              </span>
              <span className={styles.senderRole}>
                {feedback.submittedByRole || "Chuyên viên Y tế học đường"}
              </span>
            </div>
          </div>

          <div className={styles.timestampCol}>
            <Clock size={14} className={styles.timeIcon} />
            <span>Gửi lúc: {formatDateTime(feedback.createdAt)}</span>
          </div>
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.contentTitle}>{feedback.title}</h3>
          <p className={styles.contentBody}>{feedback.description}</p>
        </div>
      </div>

      {/* 4. Khối 2: Nội dung từ Nhà cung cấp (Supplier) */}
      {isResponded ? (
        <div className={styles.cardSupplierResponded}>
          <div className={styles.cardHeaderSupplier}>
            <div className={styles.senderInfo}>
              <div className={styles.avatarSupplier}>
                <Building size={18} />
              </div>
              <div className={styles.senderTextCol}>
                <span className={styles.senderNameSupplier}>
                  {feedback.respondedByName || feedback.supplierName}
                </span>
                <span className={styles.senderRoleSupplier}>
                  Đại diện Nhà cung cấp • Bộ phận Đảm bảo chất lượng (QC)
                </span>
              </div>
            </div>

            <div className={styles.timestampCol}>
              <CheckCircle2 size={15} className={styles.respondedIcon} />
              <span>Phản hồi lúc: {formatDateTime(feedback.respondedAt)}</span>
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.responseBanner}>
              <span className={styles.responseBannerLabel}>Nội dung câu trả lời từ Nhà cung cấp:</span>
            </div>
            <p className={styles.supplierBodyText}>{feedback.supplierResponse}</p>
          </div>
        </div>
      ) : (
        <div className={styles.cardSupplierPending}>
          <div className={styles.pendingIconWrap}>
            <Hourglass size={24} className={styles.hourglassIcon} />
          </div>
          <div className={styles.pendingTextCol}>
            <h4 className={styles.pendingTitle}>Đang chờ Nhà cung cấp phản hồi</h4>
            <p className={styles.pendingDesc}>
              Thông tin phản hồi đã được chuyển đến hệ thống của <strong>{feedback.supplierName}</strong>. Đại diện nhà cung cấp sẽ kiểm tra tem nhãn, hồ sơ lô hàng và phản hồi lại trong vòng 24 giờ làm việc.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

FeedbackDetailView.propTypes = {
  feedback: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
}
