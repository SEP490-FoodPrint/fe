import React, { useEffect, useState, useMemo } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined"
import notice from "src/components/Notice"
import SchoolService from "src/services/SchoolService"
import InspectionTierIntro from "./component/InspectionTierIntro"
import InspectionRoleTierTable from "./component/InspectionRoleTierTable"
import InspectionTierActions from "./component/InspectionTierActions"
import {
  TIER_KEYS,
  ROLE_CODES,
  DEFAULT_TIER_CONFIG,
} from "./component/inspectionTierConfig"
import "./style.scss"

function DeliveryInspectionRoles() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [configured, setConfigured] = useState(false)
  const [roles, setRoles] = useState([])
  const [initialRoles, setInitialRoles] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  // 1. Tải cấu hình từ Backend
  const fetchConfig = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await SchoolService.getDeliveryInspectionRoles()
      const data = res?.data || {}
      const loadedRoles = Array.isArray(data.roles) ? data.roles : []
      setRoles(loadedRoles)
      setInitialRoles(loadedRoles)
      setConfigured(Boolean(data.configured))
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Không thể tải cấu hình nhóm duyệt. Vui lòng thử lại."
      setError(msg)
      notice({ msg, isSuccess: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  // 2. Xử lý thay đổi nhóm duyệt cho một vai trò
  const handleChangeRoleTier = (roleCode, newTier) => {
    setRoles(prevRoles => {
      if (newTier === TIER_KEYS.PRIMARY) {
        // Tự động chuyển role PRIMARY cũ về REQUIRED để luôn có đúng 1 PRIMARY
        return prevRoles.map(role => {
          if (role.roleCode === roleCode) {
            return { ...role, tier: TIER_KEYS.PRIMARY }
          }
          if (role.tier === TIER_KEYS.PRIMARY) {
            return { ...role, tier: TIER_KEYS.REQUIRED }
          }
          return role
        })
      }

      return prevRoles.map(role => {
        if (role.roleCode === roleCode) {
          return { ...role, tier: newTier }
        }
        return role
      })
    })
  }

  // 3. Khôi phục mặc định
  const handleResetToDefault = () => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        const defaultItem = DEFAULT_TIER_CONFIG.find(
          d => d.roleCode === role.roleCode,
        )
        return {
          ...role,
          tier: defaultItem ? defaultItem.tier : role.tier,
        }
      }),
    )
  }

  // 4. Kiểm tra thay đổi (isDirty)
  const isDirty = useMemo(() => {
    if (roles.length !== initialRoles.length) return false
    return roles.some((r, index) => {
      const init = initialRoles[index]
      return init && r.tier !== init.tier
    })
  }, [roles, initialRoles])

  // 5. Kiểm tra tính hợp lệ (đúng 1 PRIMARY)
  const validationError = useMemo(() => {
    const editableRoles = roles.filter(r => r.editable !== false)
    const primaryCount = editableRoles.filter(
      r => r.tier === TIER_KEYS.PRIMARY,
    ).length
    if (primaryCount === 0) {
      return "Phải chọn đúng một người duyệt chính (Nhóm 1)"
    }
    if (primaryCount > 1) {
      return "Chỉ được phép chọn tối đa một người duyệt chính"
    }
    return ""
  }, [roles])

  const isValid = !validationError

  // 6. Thực hiện lưu cấu hình
  const handleConfirmSave = async () => {
    setConfirmOpen(false)
    setSaving(true)

    try {
      // Chỉ gửi 3 role editable lên server (loại trừ PARENTS_COMMITTEE)
      const payload = roles
        .filter(r => r.editable !== false)
        .map(r => ({
          roleCode: r.roleCode,
          tier: r.tier,
        }))

      const res = await SchoolService.updateDeliveryInspectionRoles(payload)
      const data = res?.data || {}
      const savedRoles = Array.isArray(data.roles) ? data.roles : roles

      setRoles(savedRoles)
      setInitialRoles(savedRoles)
      setConfigured(true)
      notice({
        msg: "Cập nhật cấu hình phân quyền duyệt nguyên liệu thành công!",
      })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Không thể lưu cấu hình. Vui lòng thử lại."
      notice({ msg, isSuccess: false })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="deliveryInspectionRolesPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Cấu hình Nhóm Duyệt Kiểm Nhận Nguyên Liệu</h1>
        <p className="pageSubtitle">
          Thiết lập vai trò duyệt chính và các bộ phận bắt buộc khi tiếp nhận
          nguyên liệu tại trường học.
        </p>
      </div>

      {!configured && !loading && !error && (
        <Alert severity="info" className="alertBanner">
          Trường hiện đang áp dụng cấu hình mặc định (Bếp trưởng duyệt chính,
          Kho &amp; Dinh dưỡng bắt buộc). Bấm <strong>Lưu cấu hình</strong> để
          xác nhận cấu hình riêng cho trường.
        </Alert>
      )}

      {loading ? (
        <div className="loadingContainer">
          <CircularProgress />
        </div>
      ) : error ? (
        <div className="errorContainer">
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            onClick={fetchConfig}
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <InspectionTierIntro />

          <InspectionRoleTierTable
            roles={roles}
            onChangeTier={handleChangeRoleTier}
          />

          <InspectionTierActions
            onReset={handleResetToDefault}
            onSave={() => setConfirmOpen(true)}
            isDirty={isDirty}
            isValid={isValid}
            saving={saving}
            validationError={validationError}
          />
        </>
      )}

      {/* Confirm Save Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-save-dialog-title"
        aria-describedby="confirm-save-dialog-description"
      >
        <DialogTitle id="confirm-save-dialog-title">
          Xác nhận lưu cấu hình duyệt kiểm nhận
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-save-dialog-description">
            Cấu hình mới chỉ áp dụng cho các xe xác nhận đến sau thời điểm lưu.
            Các đợt đang kiểm tra sẽ giữ nguyên cấu hình snapshot cũ. Bạn có
            chắc chắn muốn lưu thay đổi này?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "var(--space-3) var(--space-4)" }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            color="primary"
            autoFocus
          >
            Đồng ý lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default DeliveryInspectionRoles
