import React from "react"
import {
  Edit2,
  Lock,
  Unlock,
  Phone,
  Mail,
  GraduationCap,
  HeartPulse,
  UtensilsCrossed,
  BookOpen,
  HeartHandshake,
  Warehouse,
  Users,
} from "lucide-react"
import {
  getDepartmentConfig,
  ACCOUNT_STATUSES,
} from "../mockAccountsData"
import styles from "./AccountTable.module.scss"

const DEPT_ICONS = {
  BGH: <GraduationCap size={13} />,
  Y_TE: <HeartPulse size={13} />,
  BEP: <UtensilsCrossed size={13} />,
  GVCN: <BookOpen size={13} />,
  PHU_HUYNH: <HeartHandshake size={13} />,
  QUAN_LY_NGUYEN_LIEU: <Warehouse size={13} />,
}

/**
 * AccountTable - Bảng hiển thị danh sách tài khoản các ban
 * 5 cột chuẩn:
 * 1. Mã (Mã tài khoản)
 * 2. Họ tên (Tên, nhiệm vụ, email, sđt - KHÔNG có avatar tròn)
 * 3. Phòng ban (Badge màu chuẩn theo từng ban)
 * 4. Trạng thái (Chỉ 2 trạng thái: Đang hoạt động / Tạm khóa)
 * 5. Hành động (CHỈ 2 NÚT ICON: Icon Sửa & Icon Khóa/Mở khóa - KHÔNG có chữ)
 */
function AccountTable({
  accounts,
  onNavigateToEdit,
  onToggleStatus,
}) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIconBox}>
          <Users size={32} />
        </div>
        <h3 className={styles.emptyTitle}>Không tìm thấy tài khoản phù hợp</h3>
        <p className={styles.emptyDesc}>
          Vui lòng thử lại với từ khóa khác hoặc điều chỉnh lại bộ lọc phòng ban và trạng thái.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.accountTable}>
          <thead>
            <tr>
              <th className={styles.thCode}>Mã</th>
              <th className={styles.thName}>Họ tên</th>
              <th className={styles.thDept}>Phòng ban</th>
              <th className={styles.thStatus}>Trạng thái</th>
              <th className={styles.thActions}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const deptConfig = getDepartmentConfig(account.departmentId)
              const statusConfig =
                ACCOUNT_STATUSES[account.status] || ACCOUNT_STATUSES.ACTIVE
              const isLocked = account.status === "LOCKED"

              return (
                <tr key={account.id} className={styles.tableRow}>
                  {/* Cột 1: Mã tài khoản */}
                  <td className={styles.tdCode}>
                    <span className={styles.codeBadge}>{account.code}</span>
                  </td>

                  {/* Cột 2: Họ tên (Đã bỏ avatar tròn, chỉ hiển thị họ tên, chức danh, email, sđt) */}
                  <td className={styles.tdName}>
                    <div className={styles.userInfo}>
                      <div className={styles.userNameRow}>
                        <span className={styles.userName}>{account.fullName}</span>
                        {account.position && (
                          <span className={styles.userPosition}>{account.position}</span>
                        )}
                      </div>
                      <div className={styles.userContactRow}>
                        <span className={styles.contactItem} title={account.email}>
                          <Mail size={12} className={styles.contactIcon} />
                          <span>{account.email}</span>
                        </span>
                        {account.phone && (
                          <span className={styles.contactItem} title={account.phone}>
                            <Phone size={12} className={styles.contactIcon} />
                            <span>{account.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cột 3: Phòng ban */}
                  <td className={styles.tdDept}>
                    <span
                      className={styles.deptBadge}
                      style={{
                        backgroundColor: deptConfig.bgColor,
                        color: deptConfig.color,
                        borderColor: deptConfig.borderColor,
                      }}
                    >
                      <span className={styles.deptIcon}>
                        {DEPT_ICONS[account.departmentId] || <Users size={13} />}
                      </span>
                      <span>{deptConfig.label}</span>
                    </span>
                  </td>

                  {/* Cột 4: Trạng thái (Chỉ 2 trạng thái: Đang hoạt động / Tạm khóa) */}
                  <td className={styles.tdStatus}>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        borderColor: statusConfig.borderColor,
                      }}
                    >
                      <span
                        className={styles.statusDot}
                        style={{ backgroundColor: statusConfig.color }}
                      />
                      <span>{statusConfig.label}</span>
                    </span>
                  </td>

                  {/* Cột 5: Hành động (CHỈ 2 ICON NÚT: Sửa & Khóa/Mở khóa, KHÔNG có chữ) */}
                  <td className={styles.tdActions}>
                    <div className={styles.actionButtonGroup}>
                      {/* Nút 1: Chỉ icon Cập nhật (Sửa) */}
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        onClick={() => onNavigateToEdit(account)}
                        title="Cập nhật tài khoản"
                        aria-label="Cập nhật tài khoản"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Nút 2: Chỉ icon Khóa / Mở khóa (lock/unlock) */}
                      <button
                        type="button"
                        className={`${styles.actionIconBtn} ${isLocked ? styles.actionIconUnlock : styles.actionIconLock}`}
                        onClick={() => onToggleStatus(account)}
                        title={isLocked ? "Mở khóa tài khoản" : "Tạm khóa tài khoản"}
                        aria-label={isLocked ? "Mở khóa tài khoản" : "Tạm khóa tài khoản"}
                      >
                        {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AccountTable
