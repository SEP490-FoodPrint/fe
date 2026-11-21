import React from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { FileDown } from "lucide-react"
import { formatDate } from "src/utils/approvalWeek"
import styles from "./MenuApprovalHeader.module.scss"

// Tiêu đề trang theo tuần đang xem: "Duyệt thực đơn tuần X (dd/mm/yyyy – dd/mm/yyyy)"
const pageTitle = ({ weekNumber, weekStartDate, weekEndDate }) => {
  if (!weekStartDate) return "Duyệt thực đơn"
  const range = `(${formatDate(weekStartDate)} – ${formatDate(weekEndDate)})`
  return weekNumber ? `Duyệt thực đơn tuần ${weekNumber} ${range}` : `Duyệt thực đơn tuần ${range}`
}

function MenuApprovalHeader({ week, pendingCount, totalCount, onPrint, exporting = false }) {
  return (
    <header className={styles.header}>
      <div>
        <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
          <span>Ban Giám hiệu</span>
          <span>/</span>
          <strong>Phê duyệt thực đơn</strong>
        </nav>
        <h1 className={styles.title}>{pageTitle(week)}</h1>
        {totalCount > 0 && (
          <p className={styles.subtitle}>
            {totalCount} thực đơn · {pendingCount > 0 ? `${pendingCount} chờ phê duyệt` : "đã xử lý hết"}
          </p>
        )}
      </div>

      {totalCount > 0 && (
        <div className={styles.actions}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDown size={17} />}
            onClick={onPrint}
            disabled={exporting}
            title="Xuất các thực đơn đang hiển thị ra PDF (chọn “Lưu dưới dạng PDF” trong hộp thoại in)"
          >
            {exporting ? "Đang chuẩn bị PDF…" : "Xuất PDF"}
          </Button>
        </div>
      )}
    </header>
  )
}

MenuApprovalHeader.propTypes = {
  week: PropTypes.shape({
    weekNumber: PropTypes.number,
    weekStartDate: PropTypes.string,
    weekEndDate: PropTypes.string,
  }).isRequired,
  pendingCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onPrint: PropTypes.func.isRequired,
  exporting: PropTypes.bool,
}

export default MenuApprovalHeader
