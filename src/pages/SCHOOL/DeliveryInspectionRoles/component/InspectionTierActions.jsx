import React from "react"
import PropTypes from "prop-types"
import { Button, CircularProgress } from "@mui/material"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined"
import styles from "./InspectionTierActions.module.scss"

function InspectionTierActions({
  onReset,
  onSave,
  isDirty,
  isValid,
  saving,
  validationError,
}) {
  return (
    <div className={styles.actionsContainer}>
      <div className={styles.leftSection}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RestartAltOutlinedIcon />}
          onClick={onReset}
          disabled={saving}
        >
          Khôi phục mặc định
        </Button>
      </div>

      <div className={styles.rightSection}>
        {validationError ? (
          <span className={styles.errorText}>{validationError}</span>
        ) : !isDirty ? (
          <span className={styles.hintText}>Chưa có thay đổi mới</span>
        ) : null}

        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
          onClick={onSave}
          disabled={!isDirty || !isValid || saving}
        >
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>
    </div>
  )
}

InspectionTierActions.propTypes = {
  onReset: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isDirty: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  validationError: PropTypes.string,
}

InspectionTierActions.defaultProps = {
  validationError: "",
}

export default InspectionTierActions
