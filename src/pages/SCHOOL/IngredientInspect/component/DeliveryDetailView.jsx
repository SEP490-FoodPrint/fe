import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  ArrowLeft,
  Store,
  FileText,
  Calendar,
  Clock,
  Truck,
  Layers,
  ChevronDown,
  ChevronRight,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Info,
  CalendarDays,
  ShieldAlert,
} from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import { LOT_STATUS_CONFIG, FEEDBACK_STATUS_CONFIG } from "../mockDeliveryData"
import styles from "./DeliveryDetailView.module.scss"

export default function DeliveryDetailView({
  delivery,
  feedbacks = [],
  onBack,
  onOpenSubmitFeedback,
  onSelectFeedback,
}) {
  // State quản lý việc mở rộng xem các lô của từng dòng nguyên liệu (mặc định mở tất cả)
  const [expandedItems, setExpandedItems] = useState(() => {
    const init = {}
    delivery.deliveryItems?.forEach((item) => {
      init[item.id] = true
    })
    return init
  })

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  // Lọc danh sách phản hồi liên quan đến delivery này
  const deliveryFeedbacks = feedbacks.filter((f) => f.deliveryId === delivery.id)

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "--"
    try {
      const d = new Date(isoString)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return "--"
    }
  }

  // Format datetime helper
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
    <div className={styles.detailWrapper}>
      {/* 1. Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Chi tiết giao hàng</h1>
          <span className={styles.deliveryPill}>{delivery.deliveryNo}</span>
          <DeliveryStatusBadge status={delivery.status} />
        </div>

        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          title="Quay lại danh sách chuyến giao"
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* 2. Overview Section */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <Info size={17} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Thông tin tổng quan chuyến giao</h2>
          </div>
        </div>

        <div className={styles.overviewGrid}>
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Mã giao hàng</span>
            <span className={styles.infoValueHighlight}>{delivery.deliveryNo}</span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Nhà cung cấp</span>
            <span className={styles.infoValue}>{delivery.supplierName}</span>
            {delivery.supplierFullCompany && (
              <span className={styles.infoSubText}>{delivery.supplierFullCompany}</span>
            )}
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Yêu cầu cung ứng liên quan</span>
            <span className={styles.infoValue}>{delivery.supplyRequestNo || "Chưa gắn mã"}</span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Biển số xe giao hàng</span>
            <span className={styles.infoValueMono}>{delivery.vehiclePlate || "Chưa cập nhật"}</span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Thời gian dự kiến đến</span>
            <span className={styles.infoValue}>{formatDateTime(delivery.expectedArrivalAt)}</span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Thời gian đến thực tế</span>
            <span className={styles.infoValue}>
              {delivery.arrivedAt ? formatDateTime(delivery.arrivedAt) : "Chưa đến trường"}
            </span>
          </div>

          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Thời gian tiếp nhận</span>
            <span className={styles.infoValue}>
              {delivery.receivedAt ? formatDateTime(delivery.receivedAt) : "Chưa hoàn tất tiếp nhận"}
            </span>
          </div>

          <div className={`${styles.infoBlock} ${styles.fullWidthBlock}`}>
            <span className={styles.infoLabel}>Ghi chú giao hàng</span>
            <span className={styles.infoValue}>{delivery.note || "Không có ghi chú"}</span>
          </div>
        </div>
      </div>

      {/* 3. Ingredient Delivery Details (Phân cấp: Delivery -> Ingredient -> IngredientLot) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <Layers size={17} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Danh sách nguyên liệu & Lô thực tế</h2>
          </div>
          <span className={styles.badgeCount}>
            {delivery.deliveryItems?.length || 0} nguyên liệu
          </span>
        </div>

        <div className={styles.ingredientsList}>
          {delivery.deliveryItems?.map((item) => {
            const isExpanded = !!expandedItems[item.id]
            const lotsCount = item.ingredientLots?.length || 0

            return (
              <div key={item.id} className={styles.ingredientCard}>
                {/* Dòng tóm tắt nguyên liệu */}
                <div
                  className={styles.ingredientSummary}
                  onClick={() => toggleExpand(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleExpand(item.id)
                  }}
                >
                  <div className={styles.ingredientMain}>
                    <button
                      type="button"
                      className={styles.expandToggleBtn}
                      aria-label="Mở rộng danh sách lô"
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div className={styles.nameGroup}>
                      <span className={styles.ingredientName}>{item.ingredientName}</span>
                      {item.category && (
                        <span className={styles.categoryPill}>{item.category}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.qtyGroup}>
                    <div className={styles.qtyBlock}>
                      <span className={styles.qtyLabel}>Yêu cầu:</span>
                      <span className={styles.qtyVal}>
                        {item.requestedQuantity} {item.unit}
                      </span>
                    </div>
                    <div className={styles.qtyBlock}>
                      <span className={styles.qtyLabel}>Thực giao:</span>
                      <span className={styles.qtyValStrong}>
                        {item.actualQuantity} {item.unit}
                      </span>
                    </div>
                    <span className={styles.lotsCounter}>
                      {lotsCount > 0 ? `${lotsCount} lô hàng` : "Chưa có lô"}
                    </span>
                  </div>
                </div>

                {item.note && (
                  <div className={styles.ingredientNote}>
                    <span>Ghi chú đóng gói:</span> {item.note}
                  </div>
                )}

                {/* Danh sách các lô (IngredientLot) khi mở rộng */}
                {isExpanded && (
                  <div className={styles.lotsContainer}>
                    {lotsCount > 0 ? (
                      <table className={styles.lotsTable}>
                        <thead>
                          <tr>
                            <th>Mã lô (Lot code)</th>
                            <th>Cơ sở nguồn</th>
                            <th>Ngày SX</th>
                            <th>Hạn dùng</th>
                            <th className={styles.thRight}>Số lượng</th>
                            <th className={styles.thCenter}>Trạng thái lô</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.ingredientLots.map((lot) => {
                            const lotCfg = LOT_STATUS_CONFIG[lot.status] || {
                              label: lot.status,
                              bg: "#f1f5f9",
                              color: "#64748b",
                            }

                            return (
                              <tr key={lot.id}>
                                <td className={styles.tdLotCode}>{lot.lotCode}</td>
                                <td className={styles.tdFacility}>
                                  {lot.sourceFacility || "Nhà cung cấp trực tiếp"}
                                </td>
                                <td>{formatDate(lot.manufactureDate)}</td>
                                <td>{formatDate(lot.expiryDate)}</td>
                                <td className={styles.tdRight}>
                                  <strong>{lot.receivedQuantity}</strong> {lot.unit}
                                </td>
                                <td className={styles.tdCenter}>
                                  <span
                                    className={styles.lotStatusTag}
                                    style={{
                                      backgroundColor: lotCfg.bg,
                                      color: lotCfg.color,
                                    }}
                                  >
                                    {lotCfg.label}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className={styles.emptyLotsNotice}>
                        Chưa có thông tin phân lô điện tử cho nguyên liệu này.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Quality Feedback Section (Khu vực quan trọng: Phản hồi chất lượng) */}
      <div className={styles.sectionCard}>
        <div className={styles.feedbackSectionHeader}>
          <div className={styles.sectionTitleRow}>
            <MessageSquare size={18} className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>Phản hồi chất lượng nguyên liệu</h2>
              <p className={styles.sectionSubTitle}>
                Ghi nhận các phản hồi về quy cách, tem nhãn, bao bì hoặc chất lượng nguyên liệu gửi đến Nhà cung cấp.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.submitFeedbackBtn}
            onClick={() => onOpenSubmitFeedback(delivery)}
          >
            <Send size={15} />
            <span>Gửi phản hồi chất lượng</span>
          </button>
        </div>

        {/* Danh sách phản hồi của đợt giao này */}
        <div className={styles.feedbackListWrap}>
          {deliveryFeedbacks.length > 0 ? (
            <div className={styles.feedbackGrid}>
              {deliveryFeedbacks.map((fb) => {
                const statusCfg = FEEDBACK_STATUS_CONFIG[fb.status] || {
                  label: fb.status,
                  bg: "#eff6ff",
                  color: "#1d4ed8",
                }

                return (
                  <div key={fb.id} className={styles.feedbackCard}>
                    <div className={styles.feedbackTop}>
                      <div className={styles.feedbackTitleWrap}>
                        <h4 className={styles.feedbackTitle}>{fb.title}</h4>
                        <span className={styles.feedbackLotTarget}>
                          {fb.lotCode ? `Lô: ${fb.lotCode}` : "Toàn bộ đợt giao"}
                        </span>
                      </div>
                      <span
                        className={styles.fbStatusTag}
                        style={{
                          backgroundColor: statusCfg.bg,
                          color: statusCfg.color,
                          borderColor: statusCfg.border,
                        }}
                      >
                        <span
                          className={styles.fbStatusDot}
                          style={{ backgroundColor: statusCfg.dot }}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    <p className={styles.feedbackDesc}>{fb.description}</p>

                    <div className={styles.feedbackFooter}>
                      <span className={styles.feedbackTime}>
                        Gửi lúc: {formatDateTime(fb.createdAt)}
                      </span>
                      <button
                        type="button"
                        className={styles.viewFeedbackBtn}
                        onClick={() => onSelectFeedback(fb)}
                      >
                        <span>Xem chi tiết trao đổi</span>
                        <ArrowLeft size={13} style={{ transform: "rotate(180deg)" }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyFeedbackBox}>
              <div className={styles.emptyFbIconWrap}>
                <CheckCircle2 size={24} className={styles.emptyFbIcon} />
              </div>
              <div className={styles.emptyFbText}>
                <span className={styles.emptyFbTitle}>Chưa có phản hồi chất lượng nào</span>
                <p className={styles.emptyFbDesc}>
                  Chuyến giao này chưa phát hiện vấn đề nào cần phản hồi. Bạn có thể nhấn nút <strong>"Gửi phản hồi chất lượng"</strong> nếu cần nhà cung cấp đối soát lại tem mác hoặc chất lượng.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object.isRequired,
  feedbacks: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
  onOpenSubmitFeedback: PropTypes.func.isRequired,
  onSelectFeedback: PropTypes.func.isRequired,
}
