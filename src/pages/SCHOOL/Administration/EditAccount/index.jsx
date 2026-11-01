import React, { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertCircle, ArrowLeft } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import EditAccountHeader from "./component/EditAccountHeader"
import EditAccountForm from "./component/EditAccountForm"
import {
  getAccountById,
  updateStoredAccount,
  DEPARTMENT_CONFIGS,
  DEFAULT_INITIAL_PASSWORD,
} from "../Accounts/mockAccountsData"
import styles from "./index.module.scss"

function EditAccount() {
  const { id } = useParams()
  const navigate = useNavigate()

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

  // Tải dữ liệu tài khoản theo id từ URL
  useEffect(() => {
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
  }, [id])

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
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Lưu thay đổi
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      return
    }

    const deptConfig =
      DEPARTMENT_CONFIGS.find((d) => d.id === formData.departmentId) ||
      DEPARTMENT_CONFIGS[0]

    const updatedData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      departmentId: formData.departmentId,
      roleKey: deptConfig.roleKey,
      status: formData.status,
      password: formData.password.trim(),
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
