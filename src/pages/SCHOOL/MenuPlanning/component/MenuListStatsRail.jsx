import React from "react"
import { LayoutGrid, FileEdit, Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react"
import styles from "./MenuListStatsRail.module.scss"

export default function MenuListStatsRail({
  stats,
  year,
  activeStatus = "all",
  onFilterByStatus,
  onNavigateCreate,
}) {
  const {
    total = 0,
    draft = 0,
    pendingApproval = 0,
    approved = 0,
    revisionRequested = 0,
  } = stats || {}

  const displayYear = year || new Date().getFullYear()

  const items = [
    {
      key: "all",
      label: "Tất cả",
      count: total,
      icon: LayoutGrid,
      className: styles.pillAll,
      activeClass: styles.activeAll,
      tooltip: `Xem toàn bộ ${total} thực đơn`,
    },
    {
      key: "DRAFT",
      label: "Bản nháp",
      count: draft,
      icon: FileEdit,
      className: styles.pillDraft,
      activeClass: styles.activeDraft,
      tooltip: "Lọc các thực đơn đang là bản nháp chưa gửi duyệt",
    },
    {
      key: "PENDING_APPROVAL",
      label: "Chờ BGH duyệt",
      count: pendingApproval,
      icon: Clock,
      className: styles.pillPending,
      activeClass: styles.activePending,
      tooltip: "Lọc các thực đơn đang chờ Ban Giám Hiệu phê duyệt",
    },
    {
      key: "APPROVED",
      label: "Đã duyệt",
      count: approved,
      icon: CheckCircle,
      className: styles.pillApproved,
      activeClass: styles.activeApproved,
      tooltip: "Lọc các thực đơn đã được phê duyệt chính thức",
    },
  ]

  if (revisionRequested > 0) {
    items.push({
      key: "REVISION_REQUESTED",
      label: "Cần chỉnh sửa",
      count: revisionRequested,
      icon: AlertTriangle,
      className: styles.pillRevision,
      activeClass: styles.activeRevision,
      tooltip: "Lọc các thực đơn BGH yêu cầu chỉnh sửa",
    })
  }

  return (
    <div className={styles.statsBar} role="region" aria-label="Thống kê trạng thái thực đơn">
      <div className={styles.pillsList}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeStatus === item.key

          return (
            <button
              key={item.key}
              type="button"
              className={`${styles.statusPill} ${item.className} ${
                isActive ? item.activeClass : ""
              }`}
              onClick={() => onFilterByStatus && onFilterByStatus(item.key)}
              title={item.tooltip}
              aria-pressed={isActive}
            >
              <Icon size={14} className={styles.pillIcon} />
              <span className={styles.pillLabel}>{item.label}</span>
              <span className={styles.pillCount}>
                {String(item.count).padStart(2, "0")}
              </span>
            </button>
          )
        })}
      </div>

      {/* Nút Tạo thực đơn chuyển sang đây */}
      {onNavigateCreate && (
        <button
          type="button"
          className={styles.createBtn}
          onClick={onNavigateCreate}
          title="Tạo thực đơn mới"
        >
          <Plus size={15} />
          <span>Tạo thực đơn</span>
        </button>
      )}
    </div>
  )
}
