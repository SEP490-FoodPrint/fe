import React from "react"
import styles from "./MenuListTable.module.scss"

export default function MenuListTable({
  menus = [],
  onViewDetail,
  onEditMenu
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "REVISION_REQUESTED":
        return (
          <div className={`${styles.statusPill} ${styles.revision}`}>
            <span className={styles.dot}></span>
            <span>Yêu cầu chỉnh sửa</span>
          </div>
        )
      case "APPROVED":
        return (
          <div className={`${styles.statusPill} ${styles.approved}`}>
            <span className={styles.dot}></span>
            <span>Đã duyệt</span>
          </div>
        )
      case "PENDING_APPROVAL":
        return (
          <div className={`${styles.statusPill} ${styles.pending}`}>
            <span className={styles.dot}></span>
            <span>Chờ BGH duyệt</span>
          </div>
        )
      case "DRAFT":
      default:
        return (
          <div className={`${styles.statusPill} ${styles.draft}`}>
            <span className={styles.dot}></span>
            <span>Bản nháp</span>
          </div>
        )
    }
  }

  if (menus.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={`material-symbols-outlined ${styles.emptyIcon}`}>search_off</span>
        <h3 className={styles.emptyTitle}>Không tìm thấy thực đơn nào</h3>
        <p className={styles.emptySubtitle}>
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc ngày, ca ăn và trạng thái.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={`${styles.th} ${styles.thMenu}`}>Thực đơn</th>
            <th className={`${styles.th} ${styles.thDate}`}>Ngày ăn</th>
            <th className={`${styles.th} ${styles.thMeal}`}>Bữa ăn</th>
            <th className={`${styles.th} ${styles.thAllergy}`}>Phương án dị ứng</th>
            <th className={`${styles.th} ${styles.thStatus}`}>Trạng thái</th>
            <th className={`${styles.th} ${styles.thActions}`}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => {
            const canEdit = menu.status === "DRAFT" || menu.status === "REVISION_REQUESTED"

            return (
              <tr key={menu.id} className={styles.tableRow}>
                {/* 1. Thực đơn */}
                <td className={styles.td}>
                  <div className={styles.menuInfo}>
                    <button
                      type="button"
                      className={styles.menuNameBtn}
                      onClick={() => onViewDetail(menu)}
                      title="Xem chi tiết thực đơn này"
                    >
                      {menu.name}
                    </button>
                    <span className={styles.menuCode}>{menu.code}</span>
                  </div>
                </td>

                {/* 2. Ngày ăn */}
                <td className={`${styles.td} ${styles.nowrap}`}>
                  <span className={styles.dateText}>{menu.date}</span>
                </td>

                {/* 3. Bữa ăn */}
                <td className={`${styles.td} ${styles.nowrap}`}>
                  <span className={styles.mealBadge}>{menu.mealTypeLabel}</span>
                </td>

                {/* 4. Phương án dị ứng */}
                <td className={styles.td}>
                  {menu.hasAllergyMenu ? (
                    <div className={styles.allergyInfo}>
                      <div className={styles.allergyHeader}>
                        <span className={`material-symbols-outlined ${styles.allergyIcon}`}>verified_user</span>
                        <span className={styles.allergyTitle}>Có thực đơn riêng</span>
                      </div>
                      <span className={styles.allergySub} title={menu.allergyNote}>
                        {menu.allergyNote}
                      </span>
                    </div>
                  ) : (
                    <span className={styles.noAllergyText}>Không có</span>
                  )}
                </td>

                {/* 5. Trạng thái */}
                <td className={`${styles.td} ${styles.nowrap}`}>
                  {getStatusBadge(menu.status)}
                </td>

                {/* 6. Thao tác */}
                <td className={`${styles.td} ${styles.tdRight} ${styles.nowrap}`}>
                  <div className={styles.actionButtonGroup}>
                    {/* Nút Xem chi tiết: Luôn hiển thị cho mọi dòng */}
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => onViewDetail(menu)}
                      title="Xem chi tiết thực đơn"
                    >
                      <span className={`material-symbols-outlined ${styles.actionIcon}`}>visibility</span>
                    </button>

                    {/* Nút Chỉnh sửa: CHỈ hiển thị khi Bản nháp hoặc Yêu cầu chỉnh sửa */}
                    {canEdit && (
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.editBtn}`}
                        onClick={() => onEditMenu(menu)}
                        title="Chỉnh sửa thực đơn"
                      >
                        <span className={`material-symbols-outlined ${styles.actionIcon}`}>edit</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

