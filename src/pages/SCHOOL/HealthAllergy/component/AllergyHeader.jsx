import React from "react"
import { useNavigate } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined"
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined"
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import ROUTER from "src/router/ROUTER"
import styles from "./AllergyHeader.module.scss"

export default function AllergyHeader({ onOpenCreateModal, onOpenPrintModal }) {
  const navigate = useNavigate()

  return (
    <header className={styles.headerContainer}>
      <div className={styles.topRow}>
        <div className={styles.breadcrumb}>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => navigate(ROUTER.SCHOOL_HEALTH_OVERVIEW)}
          >
            <ArrowBackIcon className={styles.backIcon} />
            <span>Tổng quan Y tế</span>
          </button>
          <span className={styles.separator}>/</span>
          <span className={styles.currentCrumb}>Dị ứng Học sinh (Báo cáo từ GVCN)</span>
        </div>

        <div className={styles.metaBadges}>
          <div className={styles.yearBadge}>
            <SchoolOutlinedIcon className={styles.badgeIcon} />
            <span>Năm học 2026 – 2027</span>
          </div>
          <div className={styles.syncBadge}>
            <PersonSearchOutlinedIcon className={styles.badgeIcon} />
            <span>Thu thập từ GVCN các Lớp</span>
          </div>
        </div>
      </div>

      <div className={styles.mainRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Thông tin Dị ứng Học sinh theo Lớp</h1>
          <p className={styles.subtitle}>
            Danh sách học sinh bị dị ứng thực phẩm do Giáo viên chủ nhiệm thu thập từ phụ huynh đầu năm học & cập nhật hàng ngày. Cán bộ y tế theo dõi để kiểm soát an toàn và phối hợp với Bếp ăn chuẩn bị suất ăn riêng.
          </p>
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onOpenPrintModal}
            title="In danh sách học sinh dị ứng gửi Bếp trưởng"
          >
            <PrintOutlinedIcon className={styles.btnIcon} />
            <span>In Phiếu Giao Bếp</span>
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onOpenCreateModal}
          >
            <AddCircleOutlineOutlinedIcon className={styles.btnIcon} />
            <span>+ Thêm học sinh dị ứng</span>
          </button>
        </div>
      </div>
    </header>
  )
}
