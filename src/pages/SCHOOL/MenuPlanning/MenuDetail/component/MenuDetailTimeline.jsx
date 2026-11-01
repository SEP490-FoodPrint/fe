import React, { useState } from "react"
import styles from "./MenuDetailTimeline.module.scss"

export default function MenuDetailTimeline({ menu }) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!menu) return null

  const getTimelineSteps = () => {
    const isRevision = menu.status === "REVISION_REQUESTED"
    const isApproved = menu.status === "APPROVED"
    const isPending = menu.status === "PENDING_APPROVAL"
    const isDraft = menu.status === "DRAFT"

    return [
      {
        id: 1,
        title: "Khởi tạo dự thảo thực đơn",
        time: `${menu.date} • 08:30`,
        author: "BS. Nguyễn Thu Trang (Y tế học đường)",
        description: `Khai báo ${menu.dishes?.length || 4} món ăn, kết nối nguyên liệu từ NCC liên kết và định lượng gia vị kho.`,
        status: "completed",
        icon: "edit_note"
      },
      {
        id: 2,
        title: "Đối soát dữ liệu an toàn & Dị ứng",
        time: `${menu.date} • 09:15`,
        author: "Hệ thống FoodPrint Y tế",
        description: menu.hasAllergyMenu
          ? "Phát hiện 12 học sinh có nguy cơ dị ứng hải sản. Đã tự động kích hoạt phương án suất ăn riêng và món thay thế thịt bò."
          : "Không có xung đột dị ứng. Thực đơn an toàn cho 100% học sinh.",
        status: "completed",
        icon: "verified_user"
      },
      {
        id: 3,
        title: "Trình Ban Giám Hiệu phê duyệt",
        time: isDraft ? "Chưa gửi" : `${menu.date} • 09:30`,
        author: "BS. Nguyễn Thu Trang",
        description: isDraft
          ? "Đang lưu dưới dạng Bản nháp nội bộ."
          : "Hồ sơ thực đơn đã được gửi trực tuyến lên Ban Giám Hiệu.",
        status: isDraft ? "pending" : "completed",
        icon: "send"
      },
      {
        id: 4,
        title: "Phê duyệt của Ban Giám Hiệu",
        time: isDraft ? "Đang chờ gửi" : isPending ? "Đang xử lý trực tuyến" : `${menu.date} • 14:00`,
        author: "ThS. Trần Thị Mai (Phó Hiệu trưởng)",
        description: isRevision
          ? `Yêu cầu chỉnh sửa: "${menu.feedback || "Cần điều chỉnh định lượng và món ăn thay thế"}"`
          : isApproved
          ? "Đã phê duyệt chính thức. Thực đơn có hiệu lực ban hành."
          : isPending
          ? "Ban Giám Hiệu đang thẩm định định lượng dinh dưỡng."
          : "Chưa có quyết định phê duyệt.",
        status: isRevision ? "revision" : isApproved ? "completed" : isPending ? "in_progress" : "pending",
        icon: isRevision ? "error" : isApproved ? "task_alt" : isPending ? "hourglass_top" : "radio_button_unchecked"
      }
    ]
  }

  const steps = getTimelineSteps()

  return (
    <div className={styles.timelineCard}>
      <div className={styles.cardHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>history</span>
          <div>
            <h2 className={styles.cardTitle}>Lịch sử xét duyệt & Giám sát quy trình</h2>
            <p className={styles.cardSubtitle}>Nhật ký đối soát và trạng thái phê duyệt qua từng khâu</p>
          </div>
        </div>
        <button type="button" className={styles.toggleBtn}>
          <span>{isExpanded ? "Thu gọn" : "Xem chi tiết"}</span>
          <span className={`material-symbols-outlined ${styles.chevron} ${isExpanded ? styles.rotated : ""}`}>
            expand_more
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className={styles.timelineBody}>
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1

            return (
              <div key={step.id} className={`${styles.stepRow} ${styles[step.status]}`}>
                <div className={styles.nodeColumn}>
                  <div className={`${styles.iconWrap} ${styles[step.status]}`}>
                    <span className="material-symbols-outlined text-[15px]">{step.icon}</span>
                  </div>
                  {!isLast && <div className={styles.connectingLine}></div>}
                </div>

                <div className={styles.stepContent}>
                  <div className={styles.stepTop}>
                    <div className={styles.stepTitleWrap}>
                      <span className={styles.stepTitle}>{step.title}</span>
                      <span className={`${styles.statusBadge} ${styles[step.status]}`}>
                        {step.status === "completed"
                          ? "Hoàn tất"
                          : step.status === "revision"
                          ? "Yêu cầu sửa"
                          : step.status === "in_progress"
                          ? "Đang chờ duyệt"
                          : "Chưa thực hiện"}
                      </span>
                    </div>
                    <span className={styles.stepTime}>{step.time}</span>
                  </div>

                  <span className={styles.stepAuthor}>{step.author}</span>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
