import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import STORAGE, { getStorage } from "src/lib/storage"
import UserService from "src/services/UserService"
import CreateAccountHeader from "./component/CreateAccountHeader"
import CreateAccountForm from "./component/CreateAccountForm"
import SuccessModal from "./component/SuccessModal"
import {
  DEPARTMENT_CONFIGS,
  generateNextAccountCode,
  addNewAccount,
} from "../Accounts/mockAccountsData"
import styles from "./index.module.scss"

const INITIAL_DEPARTMENT = "BGH"

function CreateAccount() {
  const navigate = useNavigate()

  // Form State: chỉ giữ đúng các trường cần thiết
  const [formData, setFormData] = useState({
    departmentId: INITIAL_DEPARTMENT,
    code: "",
    fullName: "",
    email: "",
    phone: "",
  })

  // Validation errors
  const [errors, setErrors] = useState({})

  // Modal thông báo thành công
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    account: null,
  })

  // Khởi tạo mã nhân viên tự sinh khi mở trang
  useEffect(() => {
    const initialCode = generateNextAccountCode(INITIAL_DEPARTMENT)
    setFormData((prev) => ({
      ...prev,
      code: initialCode,
    }))
  }, [])

  // Khi đổi phòng ban: Tự động cập nhật mã nhân viên mới theo ban đó
  const handleDepartmentChange = useCallback((deptId) => {
    const nextCode = generateNextAccountCode(deptId)
    setFormData((prev) => ({
      ...prev,
      departmentId: deptId,
      code: nextCode,
    }))
  }, [])

  // Cập nhật giá trị trường & xóa lỗi
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit tạo tài khoản
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      return
    }

    const deptConfig =
      DEPARTMENT_CONFIGS.find((d) => d.id === formData.departmentId) ||
      DEPARTMENT_CONFIGS[0]

    const newAccount = {
      id: `acc_${Date.now()}`,
      code: formData.code || generateNextAccountCode(formData.departmentId),
      username: formData.email.split("@")[0].toLowerCase().trim(),
      fullName: formData.fullName.trim(),
      gender: "Chưa cập nhật",
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      departmentId: formData.departmentId,
      roleKey: deptConfig.roleKey,
      position: deptConfig.label,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    }

    const userInfo = getStorage(STORAGE.USER_INFO)
    const schoolId = userInfo?.schoolId
    if (schoolId) {
      try {
        const created = await UserService.createSchoolAccount(schoolId, {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          roleCode: deptConfig.roleKey,
          username: formData.email.split("@")[0].toLowerCase().trim(),
        })
        if (created?.data?.id) {
          newAccount.id = created.data.id
        }
      } catch (err) {
        console.warn("Lỗi khi đồng bộ API Backend:", err)
      }
    }

    // Lưu vào bộ nhớ local để trang danh sách nhận được ngay
    addNewAccount(newAccount)

    // Hiển thị modal thông báo thành công
    setSuccessModal({
      isOpen: true,
      account: newAccount,
    })
  }

  // Quay lại danh sách
  const handleBackToList = () => {
    navigate(ROUTER.SCHOOL_ADMINISTRATION || "/school/administration")
  }

  // Tạo thêm tài khoản khác từ modal
  const handleCreateAnother = () => {
    const nextCode = generateNextAccountCode(formData.departmentId)
    setFormData({
      departmentId: formData.departmentId,
      code: nextCode,
      fullName: "",
      email: "",
      phone: "",
    })
    setErrors({})
    setSuccessModal({
      isOpen: false,
      account: null,
    })
  }

  // Về danh sách tài khoản từ modal
  const handleGoToListFromModal = () => {
    navigate(ROUTER.SCHOOL_ADMINISTRATION || "/school/administration", {
      state: {
        toastMessage: `Đã tạo tài khoản "${successModal.account?.fullName}" (${successModal.account?.code}) thành công!`,
        toastType: "success",
      },
    })
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header: Chỉ gồm nút quay lại & tiêu đề */}
      <CreateAccountHeader onBack={handleBackToList} />

      {/* Form tạo tài khoản tối giản */}
      <CreateAccountForm
        formData={formData}
        errors={errors}
        onChangeField={handleChangeField}
        onDepartmentChange={handleDepartmentChange}
        onSubmit={handleSubmit}
        onCancel={handleBackToList}
      />

      {/* Modal thành công */}
      <SuccessModal
        isOpen={successModal.isOpen}
        createdAccount={successModal.account}
        onCreateAnother={handleCreateAnother}
        onGoToList={handleGoToListFromModal}
      />
    </div>
  )
}

export default CreateAccount
