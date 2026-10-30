import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  CheckCircle2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Utensils,
  CookingPot,
  FlaskConical,
} from "lucide-react"
import { Tooltip, IconButton } from "@mui/material"
import ROUTER from "src/router/ROUTER"
import styles from "./CookingBatchesTable.module.scss"

const BATCHES_DATA = [
  {
    id: "b1",
    code: "CB-20261024-001",
    dishName: "Thịt heo kho cút nước dừa",
    mealCategory: "Bữa trưa • 11:15",
    timeTag: "Giờ ăn 11:15 (Xong trước 10:30)",
    method: "COMMON",
    methodLabel: "Nấu chung",
    plannedPortion: "120 suất",
    actualPortion: "120 suất",
    sampleCode: "SMP-001 • Đã lưu",
    hasSample: true,
    status: "COMPLETED",
    statusLabel: "Đã nấu xong",
    statusType: "success",
    actions: ["view"],
  },
  {
    id: "b2",
    code: "CB-20261024-002",
    dishName: "Canh bí đỏ hầm sườn non",
    mealCategory: "Bữa trưa • 11:15",
    timeTag: "Giờ ăn 11:15 (Xong trước 10:30)",
    method: "COMMON",
    methodLabel: "Nấu chung",
    plannedPortion: "120 suất",
    actualPortion: "118 suất",
    sampleCode: "SMP-002 • Đã lưu",
    hasSample: true,
    status: "COMPLETED",
    statusLabel: "Đã nấu xong",
    statusType: "success",
    actions: ["view"],
  },
  {
    id: "b3",
    code: "CB-20261024-003",
    dishName: "Cơm trắng dẻo thơm",
    mealCategory: "Bữa trưa • 11:15",
    timeTag: "Giờ ăn 11:15 (Xong trước 10:30)",
    method: "COMMON",
    methodLabel: "Nấu chung",
    plannedPortion: "450 suất",
    actualPortion: "450 suất",
    sampleCode: "—",
    hasSample: false,
    status: "COMPLETED",
    statusLabel: "Đã nấu xong",
    statusType: "success",
    actions: ["view", "done"],
  },
  {
    id: "b4",
    code: "CB-20261024-004",
    dishName: "Trứng cuộn rau củ (Ăn kiêng)",
    mealCategory: "Bữa trưa • 11:15",
    timeTag: "Giờ ăn 11:15 (Xong trước 10:30)",
    method: "ALLERGY",
    methodLabel: "Nấu riêng",
    plannedPortion: "30 suất",
    actualPortion: "—",
    sampleCode: "—",
    hasSample: false,
    status: "CONFIRMED",
    statusLabel: "Chờ nấu",
    statusType: "warning",
    actions: ["view", "confirm_finish"],
  },
  {
    id: "b5",
    code: "CB-20261024-005",
    dishName: "Chè đậu đỏ cốt dừa",
    mealCategory: "Bữa xế • 14:15",
    timeTag: "Giờ ăn 14:15 (Xong trước 13:45)",
    method: "ALLERGY",
    methodLabel: "Nấu riêng",
    plannedPortion: "80 suất",
    actualPortion: "—",
    sampleCode: "—",
    hasSample: false,
    status: "DRAFT",
    statusLabel: "Chưa xác nhận",
    statusType: "muted",
    actions: ["view", "edit"],
  },
]

function CookingBatchesTable({ filterChip = "ALL", searchTerm = "" }) {
  const navigate = useNavigate()
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)

  // Lọc dữ liệu theo chip và tìm kiếm
  const filteredData = BATCHES_DATA.filter((item) => {
    if (searchTerm) {
      const matchSearch =
        item.dishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchSearch) return false
    }
    if (filterChip === "ALL") return true
    if (filterChip === "LUNCH") return item.mealCategory.includes("trưa")
    if (filterChip === "AFTERNOON") return item.mealCategory.includes("xế")
    if (filterChip === "PENDING") return item.status === "CONFIRMED" || item.status === "DRAFT"
    if (filterChip === "COMPLETED") return item.status === "COMPLETED"
    if (filterChip === "ALLERGY") return item.method === "ALLERGY"
    return true
  })

  return (
    <div className={styles.tableCard}>
      {/* 1. Desktop View: Bảng dữ liệu chuẩn (Hiện trên Desktop >= 768px) */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thCode}>Mã mẻ</th>
              <th className={styles.thDish}>Món ăn &amp; Ca ăn</th>
              <th className={styles.thMethod}>Phương thức</th>
              <th className={styles.thPlanned}>Kế hoạch</th>
              <th className={styles.thActual}>Thực tế</th>
              <th className={styles.thSample}>Mẫu lưu</th>
              <th className={styles.thStatus}>Trạng thái</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id} className={styles.row}>
                {/* 1. Mã mẻ */}
                <td className={styles.tdCode}>{row.code}</td>

                {/* 2. Món ăn & Bữa */}
                <td className={styles.tdDish}>
                  <div className={styles.dishWrap}>
                    <span className={styles.dishName}>{row.dishName}</span>
                    <span className={styles.dishCategory}>{row.timeTag}</span>
                  </div>
                </td>

                {/* 3. Phương thức */}
                <td className={styles.tdMethod}>
                  <span
                    className={`${styles.methodBadge} ${
                      row.method === "ALLERGY" ? styles.methodAllergy : styles.methodCommon
                    }`}
                  >
                    {row.method === "ALLERGY" ? <ShieldAlert size={13} /> : <Utensils size={13} />}
                    <span>{row.methodLabel}</span>
                  </span>
                </td>

                {/* 4. Kế hoạch */}
                <td className={styles.tdPlanned}>{row.plannedPortion}</td>

                {/* 5. Thực tế */}
                <td className={styles.tdActual}>
                  {row.actualPortion === "—" ? (
                    <span className={styles.dash}>—</span>
                  ) : (
                    <span className={styles.actualBold}>{row.actualPortion}</span>
                  )}
                </td>

                {/* 6. Mẫu lưu */}
                <td className={styles.tdSample}>
                  {row.sampleCode === "—" ? (
                    <span className={styles.dash}>—</span>
                  ) : (
                    <span className={styles.sampleBadge}>
                      <FlaskConical size={13} />
                      <span>{row.sampleCode}</span>
                    </span>
                  )}
                </td>

                {/* 7. Trạng thái */}
                <td className={styles.tdStatus}>
                  <span className={`${styles.statusBadge} ${styles[`status_${row.statusType}`] || ""}`}>
                    {row.statusLabel}
                  </span>
                </td>

                {/* 8. Thao tác */}
                <td className={styles.tdAction}>
                  <div className={styles.actionGroup}>
                    <Tooltip title="Xem chi tiết mẻ" arrow>
                      <button
                        type="button"
                        className={styles.iconActionBtn}
                        aria-label="Xem chi tiết"
                        onClick={() => navigate(`${ROUTER.SCHOOL_KITCHEN_BATCHES}/${row.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                    </Tooltip>

                    {row.actions.includes("confirm_finish") && (
                      <Tooltip title="Xác nhận nấu xong" arrow>
                        <button
                          type="button"
                          className={`${styles.iconActionBtn} ${styles.btnSuccess}`}
                          aria-label="Xác nhận nấu xong"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      </Tooltip>
                    )}

                    {row.actions.includes("edit") && (
                      <Tooltip title="Chỉnh sửa mẻ" arrow>
                        <button type="button" className={styles.iconActionBtn} aria-label="Chỉnh sửa mẻ">
                          <Edit2 size={16} />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile View: Thẻ 2 hàng mật độ cao chuẩn UI/UX Pro Max (Hiện trên Mobile < 768px) */}
      <div className={styles.mobileCardsList} role="list" aria-label="Danh sách mẻ chế biến">
        {filteredData.map((row) => (
          <div
            key={row.id}
            className={styles.mobileBatchCard}
            role="listitem"
            onClick={() => navigate(`${ROUTER.SCHOOL_KITCHEN_BATCHES}/${row.id}`)}
          >
            {/* Hàng 1: Tên món + Tag dị ứng (nếu có) + Chip Trạng thái */}
            <div className={styles.mobileTopRow}>
              <div className={styles.dishTitleWrap}>
                <span className={styles.methodIconBox} aria-hidden="true">
                  {row.method === "ALLERGY" ? (
                    <ShieldAlert size={14} className={styles.iconAllergy} />
                  ) : (
                    <CookingPot size={14} className={styles.iconCommon} />
                  )}
                </span>
                <span className={styles.mobileDishName}>{row.dishName}</span>
                {row.method === "ALLERGY" && <span className={styles.tagAllergySmall}>Kiêng</span>}
              </div>

              <span className={`${styles.mobileStatusBadge} ${styles[`status_${row.statusType}`] || ""}`}>
                <span className={styles.statusDot} />
                <span>{row.statusLabel}</span>
              </span>
            </div>

            {/* Hàng 2: Số suất • Mốc giờ ăn & Hạn chót + Icon Action */}
            <div className={styles.mobileBottomRow}>
              <div className={styles.mobileMetaWrap}>
                <span className={styles.portionHighlight}>{row.plannedPortion}</span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.timeScheduleText}>{row.timeTag}</span>
              </div>

              <div className={styles.mobileActionBox} onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Xem chi tiết" arrow>
                  <IconButton
                    className={styles.mobileActionBtn}
                    aria-label={`Xem chi tiết mẻ ${row.dishName}`}
                    onClick={() => navigate(`${ROUTER.SCHOOL_KITCHEN_BATCHES}/${row.id}`)}
                  >
                    <Eye size={16} />
                  </IconButton>
                </Tooltip>

                {row.status === "CONFIRMED" && (
                  <Tooltip title="Xác nhận xong" arrow>
                    <IconButton
                      className={`${styles.mobileActionBtn} ${styles.mobileActionConfirm}`}
                      aria-label={`Xác nhận nấu xong ${row.dishName}`}
                    >
                      <CheckCircle2 size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Phân trang */}
      <div className={styles.paginationBar}>
        <div className={styles.pageInfo}>
          <span>
            Hiển thị <strong>{filteredData.length}</strong> mẻ chế biến
          </span>
          <div className={styles.pageSizeSelect}>
            <span>Xem:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              aria-label="Số dòng mỗi trang"
            >
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
            </select>
          </div>
        </div>

        <div className={styles.pageNav}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageText}>Trang {currentPage}</span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Trang tiếp"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookingBatchesTable
