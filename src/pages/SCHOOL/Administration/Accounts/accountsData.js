import { ROLES } from "src/constants/roles"

/**
 * Cấu hình 6 ban chuyên trách của trường học theo đúng yêu cầu
 */
export const DEPARTMENT_CONFIGS = [
  {
    id: "BGH",
    roleKey: ROLES.SCHOOL_MANAGEMENT_BOARD,
    label: "Ban Giám Hiệu",
    shortLabel: "BGH",
    codePrefix: "TK-BGH",
    color: "#6366f1",
    bgColor: "#ede9fe",
    borderColor: "#c7d2fe",
    description: "Chỉ đạo điều hành toàn diện & Phê duyệt thực đơn trường học",
  },
  {
    id: "Y_TE",
    roleKey: ROLES.SCHOOL_NUTRITION_OFFICER,
    label: "Nhân viên Dinh dưỡng",
    shortLabel: "Y tế",
    codePrefix: "TK-YT",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    borderColor: "#bae6fd",
    description: "Nhân viên dinh dưỡng học đường, lập thực đơn, quản lý hồ sơ dị ứng & an toàn thực phẩm",
  },
  {
    id: "BEP",
    roleKey: ROLES.SCHOOL_KITCHEN_STAFF,
    label: "Nhân viên bếp",
    shortLabel: "Nhân viên bếp",
    codePrefix: "TK-BP",
    color: "#ea580c",
    bgColor: "#ffedd5",
    borderColor: "#fed7aa",
    description: "Bếp trưởng & nhân viên nấu nướng, sơ chế, chế biến suất ăn",
  },
  {
    id: "GVCN",
    roleKey: ROLES.HOMEROOM_TEACHER,
    label: "Giáo viên chủ nhiệm",
    shortLabel: "GVCN",
    codePrefix: "TK-GV",
    color: "#16a34a",
    bgColor: "#dcfce7",
    borderColor: "#bbf7d0",
    description: "Báo cáo sĩ số suất ăn, theo dõi dị ứng lớp & bàn giao suất ăn",
  },
  {
    id: "PHU_HUYNH",
    roleKey: ROLES.PARENTS_COMMITTEE,
    label: "Ban đại diện phụ huynh",
    shortLabel: "Ban phụ huynh",
    codePrefix: "TK-PH",
    color: "#e11d48",
    bgColor: "#ffe4e6",
    borderColor: "#fecdd3",
    description: "Ban đại diện CMHS giám sát chất lượng thực phẩm & suất ăn",
  },
  {
    id: "QUAN_LY_NGUYEN_LIEU",
    roleKey: ROLES.INGREDIENT_MANAGEMENT,
    label: "Nhân viên quản lý nguyên liệu",
    shortLabel: "QL nguyên liệu",
    codePrefix: "TK-NL",
    color: "#0a8066",
    bgColor: "#e8f5f1",
    borderColor: "#c9e8de",
    description: "Quản lý kho, tiếp nhận nguyên liệu từ NCC & kiểm tra chất lượng",
  },
]

export const ACCOUNT_STATUSES = {
  ACTIVE: {
    key: "ACTIVE",
    label: "Đang hoạt động",
    color: "#168456",
    bgColor: "#e8f6ef",
    borderColor: "#bce6cf",
  },
  LOCKED: {
    key: "LOCKED",
    label: "Tạm khóa",
    color: "#d64545",
    bgColor: "#fdecec",
    borderColor: "#f4c3c3",
  },
}

/**
 * Trả về thống kê số lượng tài khoản theo từng ban và tổng số
 */
export function getDepartmentKPIStats(accounts = []) {
  const stats = {
    TOTAL: accounts.length,
    BGH: 0,
    Y_TE: 0,
    BEP: 0,
    GVCN: 0,
    PHU_HUYNH: 0,
    QUAN_LY_NGUYEN_LIEU: 0,
    ACTIVE: 0,
    LOCKED: 0,
  }

  accounts.forEach((acc) => {
    if (stats[acc.departmentId] !== undefined) {
      stats[acc.departmentId] += 1
    }
    if (stats[acc.status] !== undefined) {
      stats[acc.status] += 1
    }
  })

  return stats
}

/**
 * Mật khẩu khởi tạo mặc định cho tất cả tài khoản tạo mới của trường
 */
export const DEFAULT_INITIAL_PASSWORD = "123456"

const STORAGE_KEY = "foodprint_school_accounts_storage_v2"

/**
 * Lấy danh sách tài khoản từ localStorage hoặc trả về rỗng
 */
export function getStoredAccounts() {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Lỗi khi đọc accounts từ localStorage:", error)
    return []
  }
}

/**
 * Lưu danh sách tài khoản vào localStorage
 */
export function saveStoredAccounts(accounts) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch (error) {
    console.error("Lỗi khi lưu accounts vào localStorage:", error)
  }
}

/**
 * Thêm một tài khoản mới vào đầu danh sách và lưu vào localStorage
 */
export function addNewAccount(newAccount) {
  const current = getStoredAccounts()
  const updated = [newAccount, ...current]
  saveStoredAccounts(updated)
  return updated
}

/**
 * Lấy thông tin tài khoản theo ID hoặc theo Mã
 */
export function getAccountById(id) {
  const accounts = getStoredAccounts()
  return accounts.find((a) => a.id === id || a.code === id) || null
}

/**
 * Cập nhật thông tin tài khoản và lưu vào localStorage
 */
export function updateStoredAccount(id, updatedFields) {
  const accounts = getStoredAccounts()
  let updatedAccount = null
  const updatedList = accounts.map((acc) => {
    if (acc.id === id || acc.code === id) {
      updatedAccount = {
        ...acc,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      }
      return updatedAccount
    }
    return acc
  })
  saveStoredAccounts(updatedList)
  return updatedAccount
}

/**
 * Tự động sinh mã nhân viên kế tiếp dựa trên phòng ban được chọn
 * Ví dụ: BGH -> TK-BGH-004, Y_TE -> TK-YT-006, BEP -> TK-BP-006, ...
 */
export function generateNextAccountCode(departmentId, customList = null) {
  const deptConfig = DEPARTMENT_CONFIGS.find((d) => d.id === departmentId)
  const prefix = deptConfig?.codePrefix || "TK-NV"
  const accounts = customList || getStoredAccounts()

  // Tìm các mã có định dạng [PREFIX]-[sốnàođó]
  let maxNumber = 0
  const regex = new RegExp(`^${prefix}-(\\d+)$`)

  accounts.forEach((acc) => {
    if (acc.code) {
      const match = acc.code.match(regex)
      if (match && match[1]) {
        const num = parseInt(match[1], 10)
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num
        }
      }
    }
  })

  const nextNumber = maxNumber + 1
  const paddedNumber = String(nextNumber).padStart(3, "0")
  return `${prefix}-${paddedNumber}`
}

/**
 * Gợi ý email chuẩn của trường từ họ và tên tiếng Việt
 * Ví dụ: "Nguyễn Văn An" -> "an.nguyenvan@foodprint.edu.vn"
 */
export function suggestEmailFromName(fullName) {
  if (!fullName || !fullName.trim()) return ""
  // Loại bỏ dấu tiếng Việt
  const cleanName = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toLowerCase()

  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  if (parts.length === 1) return `${parts[0]}@foodprint.edu.vn`

  const lastName = parts[parts.length - 1]
  const otherParts = parts.slice(0, parts.length - 1).join("")
  return `${lastName}.${otherParts}@foodprint.edu.vn`
}

/**
 * Lấy thông tin cấu hình của phòng ban theo ID
 */
export function getDepartmentConfig(departmentId) {
  return DEPARTMENT_CONFIGS.find((d) => d.id === departmentId) || {
    id: departmentId,
    label: departmentId,
    shortLabel: departmentId,
    color: "#6b7c74",
    bgColor: "#f1f5f3",
    borderColor: "#dce5e0",
  }
}
