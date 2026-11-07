import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined"
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ROUTER from "src/router/ROUTER"
import styles from "./AllergyAlertBanner.module.scss"

export default function AllergyAlertBanner({ menuCheck }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  if (!menuCheck || !menuCheck.conflicts || menuCheck.conflicts.length === 0) {
    return null
  }

  const totalConflicts = menuCheck.conflicts.length
  const totalPortionsHandled = menuCheck.conflicts.reduce((sum, c) => sum + (c.totalAffected || 0), 0)

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.mainContent}>
        <div className={styles.leftInfo}>
          <div className={styles.alertIconPulse}>
            <CampaignOutlinedIcon className={styles.icon} />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h3 className={styles.alertTitle}>
                Đối soát An toàn Thực đơn Tuần 46: Phát hiện {totalConflicts} món ăn chứa dị nguyên
              </h3>
              <span className={styles.statusPill}>
                <CheckCircleOutlineOutlinedIcon className={styles.pillIcon} />
                Đã xử lý bố trí {totalPortionsHandled} suất ăn riêng
              </span>
            </div>
            <p className={styles.alertDesc}>
              Bếp ăn học đường đã tiếp nhận danh sách dị ứng theo lớp và bố trí thực đơn thay thế riêng biệt, tránh lây nhiễm chéo tuyệt đối.
            </p>
          </div>
        </div>

        <div className={styles.rightActions}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setExpanded(!expanded)}
          >
            <span>{expanded ? "Thu gọn chi tiết" : "Xem chi tiết đối soát"}</span>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          >
            <span>Mở Thực đơn Tuần</span>
            <ArrowForwardIcon className={styles.arrow} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className={styles.detailsTray}>
          <div className={styles.gridCards}>
            {menuCheck.conflicts.map((item) => (
              <div key={item.id} className={styles.conflictCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.dayTag}>{item.dayName}</span>
                  <span className={styles.mealTypeTag}>{item.mealType}</span>
                </div>

                <div className={styles.dishComparison}>
                  <div className={styles.conflictDish}>
                    <span className={styles.label}>Món tiêu chuẩn chứa dị nguyên:</span>
                    <strong className={styles.dishName}>{item.dishName}</strong>
                    <span className={styles.allergenBadge}>⚠️ {item.allergenName}</span>
                  </div>

                  <div className={styles.arrowDivide}>➜</div>

                  <div className={styles.substituteDish}>
                    <span className={styles.label}>Suất ăn riêng thay thế đã duyệt:</span>
                    <strong className={styles.dishNameSub}>{item.substituteDish}</strong>
                    <span className={styles.handledBadge}>✓ An toàn tuyệt đối</span>
                  </div>
                </div>

                <div className={styles.affectedList}>
                  <span className={styles.affectedLabel}>Lớp & Số suất riêng:</span>
                  <div className={styles.tagWrap}>
                    {item.affectedClasses.map((cls, idx) => (
                      <span key={idx} className={styles.classChip}>
                        {cls}
                      </span>
                    ))}
                    <span className={styles.totalChip}>Tổng: {item.totalAffected} suất</span>
                  </div>
                </div>

                <div className={styles.solutionNote}>
                  <span className={styles.noteLabel}>Lưu ý từ Bếp:</span>
                  <span className={styles.noteText}>{item.solutionNote}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
