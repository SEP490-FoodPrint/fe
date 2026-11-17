import React from "react"
import PropTypes from "prop-types"
import styles from "./PermissionToggleRow.module.scss"

function PermissionToggleRow({
  permission,
  checked,
  disabled = false,
  saving = false,
  tooltip = "",
  onToggle,
}) {
  const showDescription =
    Boolean(permission.description) &&
    permission.description.trim() !== String(permission.name || "").trim()

  return (
    <div className={styles.permissionRow}>
      <div className={styles.permissionInfo}>
        <div className={styles.permissionHeadingLine}>
          <span className={styles.permissionName}>{permission.name}</span>
          {permission.moduleLabel ? (
            <span className={styles.moduleTag}>{permission.moduleLabel}</span>
          ) : null}
          {!permission.isActive ? (
            <span className={styles.systemInactiveTag}>
              Tạm ngừng toàn hệ thống
            </span>
          ) : null}
        </div>
        {showDescription ? (
          <p className={styles.permissionDesc}>{permission.description}</p>
        ) : null}
        {!permission.isActive && !checked ? (
          <span className={styles.inactiveHint}>
            Quyền đang tạm ngừng nên không thể cấp mới cho vai trò
          </span>
        ) : null}
      </div>

      <div className={styles.switchWrap}>
        <span
          className={`${styles.switchStateText} ${
            checked ? styles.switchStateActive : ""
          }`}
        >
          {saving ? "Đang lưu..." : checked ? "Đang bật" : "Đã tắt"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={`${checked ? "Tắt" : "Bật"} quyền ${permission.name}`}
          disabled={disabled}
          title={tooltip}
          className={`${styles.switchBtn} ${
            checked ? styles.switchBtnChecked : ""
          }`}
          onClick={() => onToggle(permission, checked)}
        >
          <span className={styles.switchThumb} />
        </button>
      </div>
    </div>
  )
}

PermissionToggleRow.propTypes = {
  permission: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    moduleLabel: PropTypes.string,
    description: PropTypes.string,
    isActive: PropTypes.bool,
  }).isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  saving: PropTypes.bool,
  tooltip: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
}

export default PermissionToggleRow
