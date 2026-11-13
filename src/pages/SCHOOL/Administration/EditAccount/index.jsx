import React, { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { AlertCircle, ArrowLeft } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import STORAGE, { getStorage } from "src/lib/storage"
import UserService from "src/services/UserService"
import notice from "src/components/Notice"
import EditAccountHeader from "./component/EditAccountHeader"
import EditAccountForm from "./component/EditAccountForm"
import {
  getAccountById,
  updateStoredAccount,
  DEPARTMENT_CONFIGS,
  DEFAULT_INITIAL_PASSWORD,
} from "../Accounts/mockAccountsData"
import styles from "./index.module.scss"

const ROLE_TO_DEPT = {
  SCHOOL_MANAGEMENT_BOARD: "BGH",
  SCHOOL_NUTRITION_OFFICER: "Y_TE",
  SCHOOL_HEALTH_OFFICER: "Y_TE",
  SCHOOL_KITCHEN_STAFF: "BEP",
  HOMEROOM_TEACHER: "GVCN",
  PARENTS_COMMITTEE: "PHU_HUYNH",
  INGREDIENT_MANAGEMENT: "QUAN_LY_NGUYEN_LIEU",
  INGREDIENT_MANAGEMENT_DEPARTMENT: "QUAN_LY_NGUYEN_LIEU",
}

function EditAccount() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    departmentId: "BGH",
    code: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    status: "ACTIVE",
  })

  // Validation errors
  const [errors, setErrors] = useState({})

  // Tải dữ liệu tài khoản theo id từ URL hoặc state navigation
  useEffect(() => {
    // 1. Kiểm tra state truyền qua navigation từ bảng danh sách
    if (location.state?.account) {
      const existing = location.state.account
      setAccount(existing)
      setFormData({
        departmentId: existing.departmentId || "BGH",
        code: existing.code || "",
        fullName: existing.fullName || "",
        email: existing.email || "",
        phone: existing.phone || "",
        password: existing.password || DEFAULT_INITIAL_PASSWORD,
        status: existing.status || "ACTIVE",
      })
      setLoading(false)
      return
    }

    // 2. Nếu người dùng F5 hoặc truy cập trực tiếp bằng URL, tải từ Backend API
    const fetchAccount = async () => {
      const userInfo = getStorage(STORAGE.USER_INFO)
      const schoolId = userInfo?.schoolId
      if (schoolId && id) {
        try {
          const res = await UserService.getSchoolAccountById(schoolId, id)
          const data = res?.data || res
          if (data && data.id) {
            const roleCode = data.roleCode || data.Role?.code || ""
            const mapped = {
              id: data.id,
              code: data.username || `TK-${data.id.slice(0, 6).toUpperCase()}`,
              fullName: data.fullName,
              email: data.email,
              phone: data.phone || "",
              roleCode,
              departmentId: ROLE_TO_DEPT[roleCode] || "BGH",
              status: data.status || "ACTIVE",
            }
            setAccount(mapped)
            setFormData({
              departmentId: mapped.departmentId,
              code: mapped.code,
              fullName: mapped.fullName,
              email: mapped.email,
              phone: mapped.phone,
              password: DEFAULT_INITIAL_PASSWORD,
              status: mapped.status,
            })
            setLoading(false)
            return
          }
        } catch (err) {
          console.warn("Không thể tải tài khoản từ API Backend:", err)
        }
      }

      // 3. Fallback bộ nhớ mock
      const existing = getAccountById(id)
      if (existing) {
        setAccount(existing)
        setFormData({
          departmentId: existing.departmentId || "BGH",
          code: existing.code || "",
          fullName: existing.fullName || "",
          email: existing.email || "",
          phone: existing.phone || "",
          password: existing.password || DEFAULT_INITIAL_PASSWORD,
          status: existing.status || "ACTIVE",
        })
      }
      setLoading(false)
    }

    fetchAccount()
  }, [id, location.state])

  // Cập nhật giá trị trường form & xóa lỗi tương ứng
  const handleChangeField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setErrors((prev) => {
      if (prev[field]) {
        const updated = { ...prev }
        delete updated[field]
        return updated
      }
      return prev
    })
  }, [])

  // Validate form
  const validate = () => {
    const newErrors = {}

    // Họ và tên
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên."
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email."
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Email không đúng định dạng."
    }

    // Số điện thoại
    const phoneClean = formData.phone.replace(/[\s.-]/g, "")
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại."
    } else if (!phoneRegex.test(phoneClean)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10 chữ số)."
    }

    // Mật khẩu
    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu."
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit cập nhật tài khoản
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      return
    }

    const deptConfig =
      DEPARTMENT_CONFIGS.find((d) => d.id === formData.departmentId) ||
      DEPARTMENT_CONFIGS[0]

    let targetRoleCode = deptConfig.roleKey
    if (targetRoleCode === "SCHOOL_HEALTH_OFFICER") {
      targetRoleCode = "SCHOOL_NUTRITION_OFFICER"
    } else if (targetRoleCode === "INGREDIENT_MANAGEMENT") {
      targetRoleCode = "INGREDIENT_MANAGEMENT_DEPARTMENT"
    }

    const updatedData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      departmentId: formData.departmentId,
      roleKey: deptConfig.roleKey,
      status: formData.status,
      password: formData.password.trim(),
    }

    const userInfo = getStorage(STORAGE.USER_INFO)
    const schoolId = userInfo?.schoolId
    if (schoolId) {
      try {
        await UserService.updateSchoolAccount(schoolId, id, {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim() || undefined,
          roleCode: targetRoleCode,
        })
        if (formData.status !== account?.status) {
          await UserService.toggleAccountStatus(schoolId, id, formData.status)
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật tài khoản trên server:", err)
        notice({ msg: err.message || "Cập nhật tài khoản thất bại. Vui lòng thử lại.", isSuccess: false })
        return
      }
    }

    updateStoredAccount(id, updatedData)

    navigate(ROUTER.SCHOOL_ADMINISTRATION || "/school/administration", {
      state: {
        toastMessage: `Đã cập nhật thông tin tài khoản "${formData.fullName.trim()}" (${account?.code}) thành công!`,
        toastType: "success",
      },
    })
  }

  // Quay lại danh sách
  const handleBackToList = () => {
    navigate(ROUTER.SCHOOL_ADMINISTRATION || "/school/administration")
  }

  if (loading) {
    return null
  }

  if (!account) {
    return (
      <div className={styles.pageContainer}>
        <EditAccountHeader onBack={handleBackToList} />
        <div className={styles.notFoundBox}>
          <AlertCircle size={40} className={styles.notFoundIcon} />
          <h2 className={styles.notFoundTitle}>Không tìm thấy thông tin tài khoản</h2>
          <p className={styles.notFoundDesc}>
            Mã hoặc ID tài khoản này không tồn tại trong hệ thống quản trị nhà trường.
          </p>
          <button
            type="button"
            className={styles.backToListBtn}
            onClick={handleBackToList}
          >
            <ArrowLeft size={16} />
            <span>Quay lại danh sách tài khoản</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <EditAccountHeader onBack={handleBackToList} account={account} />
      <EditAccountForm
        formData={formData}
        errors={errors}
        onChangeField={handleChangeField}
        onSubmit={handleSubmit}
        onCancel={handleBackToList}
      />
    </div>
  )
}

export default EditAccount
