import React, { useState } from "react"
import styles from "./CookingBatchesTable.module.scss"

const BATCHES_DATA = [
  {
    id: "b1",
    code: "CB-20261024-001",
    dishName: "Thịt heo kho cút nước dừa",
    mealCategory: "Bữa trưa • Món mặn chính",
    method: "COMMON",
    methodLabel: "Nấu chung",
    methodIcon: "group",
    plannedPortion: "120 suất",
    actualPortion: "120 suất",
    sampleCode: "SMP-001 • Đã lưu",
    status: "COMPLETED",
    statusLabel: "Hoàn thành",
    actions: ["view", "print"],
  },
  {
    id: "b2",
    code: "CB-20261024-002",
    dishName: "Canh bí đỏ hầm sườn non",
    mealCategory: "Bữa trưa • Món canh bổ sung",
    method: "COMMON",
    methodLabel: "Nấu chung",
    methodIcon: "group",
    plannedPortion: "120 suất",
    actualPortion: "118 suất",
    sampleCode: "SMP-002 • Đã lưu",
    status: "COMPLETED",
    statusLabel: "Hoàn thành",
    actions: ["view"],
  },
  {
    id: "b3",
    code: "CB-20261024-003",
    dishName: "Cơm trắng dẻo thơm",
    mealCategory: "Bữa trưa • Tinh bột chính",
    method: "COMMON",
    methodLabel: "Nấu chung",
    methodIcon: "group",
    plannedPortion: "450 suất",
    actualPortion: "450 suất",
    sampleCode: "—",
    status: "COMPLETED",
    statusLabel: "Hoàn thành",
    actions: ["view", "done"],
  },
  {
    id: "b4",
    code: "CB-20261024-004",
    dishName: "Trứng cuộn rau củ",
    mealCategory: "Bữa trưa • Chế độ ăn kiêng dị ứng",
    method: "ALLERGY",
    methodLabel: "Nấu riêng",
    methodIcon: "shield_person",
    plannedPortion: "30 suất",
    actualPortion: "—",
    sampleCode: "—",
    status: "CONFIRMED",
    statusLabel: "Đã xác nhận",
    actions: ["view", "confirm_finish"],
  },
  {
    id: "b5",
    code: "CB-20261024-005",
    dishName: "Chè đậu đỏ nước cốt dừa",
    mealCategory: "Bữa chiều • Tráng miệng xế",
    method: "ALLERGY",
    methodLabel: "Nấu riêng",
    methodIcon: "shield_person",
    plannedPortion: "80 suất",
    actualPortion: "—",
    sampleCode: "—",
    status: "DRAFT",
    statusLabel: "Chưa xác nhận",
    actions: ["view", "edit"],
  },
]

function CookingBatchesTable() {
  const [pageSize, setPageSize] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thCode}>Mã lô</th>
              <th className={styles.thDish}>Món ăn &amp; Bữa</th>
              <th className={styles.thMethod}>Phương thức</th>
              <th className={styles.thPlanned}>Kế hoạch</th>
              <th className={styles.thActual}>Thực tế</th>
              <th className={styles.thSample}>Mẫu lưu</th>
              <th className={styles.thStatus}>Trạng thái</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {BATCHES_DATA.map((row) => (
              <tr key={row.id} className={styles.row}>
                {/* 1. Mã lô */}
                <td className={styles.tdCode}>{row.code}</td>

                {/* 2. Món ăn & Bữa */}
                <td className={styles.tdDish}>
                  <div className={styles.dishWrap}>
                    <span className={styles.dishName}>{row.dishName}</span>
                    <span className={styles.dishCategory}>{row.mealCategory}</span>
                  </div>
                </td>

                {/* 3. Phương thức */}
                <td className={styles.tdMethod}>
                  <span
                    className={`${styles.methodBadge} ${
                      row.method === "ALLERGY" ? styles.methodAllergy : styles.methodCommon
                    }`}
                  >
                    <span className="material-symbols-outlined">{row.methodIcon}</span>
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
                      <span className="material-symbols-outlined">science</span>
                      <span>{row.sampleCode}</span>
                    </span>
                  )}
                </td>

                {/* 7. Trạng thái */}
                <td className={styles.tdStatus}>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status_${row.status.toLowerCase()}`] || ""
                    }`}
                  >
                    {row.statusLabel}
                  </span>
                </td>

                {/* 8. Thao tác */}
                <td className={styles.tdAction}>
                  <div className={styles.actionGroup}>
                    <button
                      type="button"
                      className={styles.detailBtn}
                      title="Xem chi tiết"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                      <span>Chi tiết</span>
                    </button>

                    {row.actions.includes("print") && (
                      <button
                        type="button"
                        className={styles.iconActionBtn}
                        title="In tem mã vạch"
                        aria-label="In tem mã vạch"
                      >
                        <span className="material-symbols-outlined">print</span>
                      </button>
                    )}

                    {row.actions.includes("done") && (
                      <button
                        type="button"
                        className={`${styles.iconActionBtn} ${styles.btnSuccess}`}
                        title="Đã hoàn thành"
                        aria-label="Đã hoàn thành"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                    )}

                    {row.actions.includes("confirm_finish") && (
                      <button
                        type="button"
                        className={styles.iconActionBtn}
                        title="Xác nhận hoàn thành nấu"
                        aria-label="Xác nhận hoàn thành nấu"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                    )}

                    {row.actions.includes("edit") && (
                      <button
                        type="button"
                        className={styles.iconActionBtn}
                        title="Chỉnh sửa lô"
                        aria-label="Chỉnh sửa lô"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang dưới bảng */}
      <div className={styles.paginationBar}>
        <div className={styles.pageInfo}>
          <span>
            Hiển thị <strong>1–5</strong> trong tổng số <strong>14</strong> lô chế biến
          </span>
          <div className={styles.pageSizeSelect}>
            <span>Xem:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              aria-label="Số dòng mỗi trang"
            >
              <option value="10">10 dòng/trang</option>
              <option value="20">20 dòng/trang</option>
              <option value="50">50 dòng/trang</option>
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
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageActive : ""}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button
            type="button"
            className={`${styles.pageBtn} ${currentPage === 2 ? styles.pageActive : ""}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button
            type="button"
            className={`${styles.pageBtn} ${currentPage === 3 ? styles.pageActive : ""}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Trang tiếp"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookingBatchesTable
