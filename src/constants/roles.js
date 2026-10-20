// Nhóm tổ chức (Portal cấp 1)
export const ORG_TYPES = {
  SYSTEM: "SYSTEM",
  SCHOOL: "SCHOOL",
  SUPPLIER: "SUPPLIER",
}

// 9 Vai trò nghiệp vụ của hệ thống FoodPrint (1 account = 1 role)
export const ROLES = {
  // Nhóm SYSTEM
  SYSTEM_ADMIN: "SYSTEM_ADMIN",

  // Nhóm SUPPLIER
  INGREDIENT_SUPPLIER: "INGREDIENT_SUPPLIER",

  // Nhóm SCHOOL
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  SCHOOL_MANAGEMENT_BOARD: "SCHOOL_MANAGEMENT_BOARD", // Ban giám hiệu
  SCHOOL_HEALTH_OFFICER: "SCHOOL_HEALTH_OFFICER",     // Ban y tế
  SCHOOL_KITCHEN_STAFF: "SCHOOL_KITCHEN_STAFF",       // Nhân viên bếp
  HOMEROOM_TEACHER: "HOMEROOM_TEACHER",               // Giáo viên chủ nhiệm
  PARENTS_COMMITTEE: "PARENTS_COMMITTEE",             // Ban phụ huynh
  INGREDIENT_MANAGEMENT: "INGREDIENT_MANAGEMENT_DEPARTMENT", // Bộ phận quản lý kho/nguyên liệu
}

// Tên hiển thị tiếng Việt của các role
export const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: "Quản trị viên Hệ thống (System Admin)",
  [ROLES.INGREDIENT_SUPPLIER]: "Nhà cung cấp Nguyên liệu (Supplier)",
  [ROLES.SCHOOL_ADMIN]: "Quản trị viên Nhà trường (School Admin)",
  [ROLES.SCHOOL_MANAGEMENT_BOARD]: "Ban Giám Hiệu",
  [ROLES.SCHOOL_HEALTH_OFFICER]: "Cán bộ Y tế Trường",
  [ROLES.SCHOOL_KITCHEN_STAFF]: "Nhân viên Bếp / Bếp trưởng",
  [ROLES.HOMEROOM_TEACHER]: "Giáo viên Chủ nhiệm",
  [ROLES.PARENTS_COMMITTEE]: "Ban Đại diện Phụ huynh",
  [ROLES.INGREDIENT_MANAGEMENT]: "Bộ phận Quản lý Kho & Nguyên liệu",
}

// Danh sách tài khoản Mockup để test nhanh các role
export const MOCK_ACCOUNTS = [
  {
    userId: "usr_sys_01",
    username: "system_admin",
    fullName: "Nguyễn Văn Toàn",
    orgType: ORG_TYPES.SYSTEM,
    orgId: "system_root",
    orgName: "Hệ thống Quản lý FoodPrint Toàn quốc",
    role: ROLES.SYSTEM_ADMIN,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SystemAdmin",
  },
  {
    userId: "usr_sup_01",
    username: "supplier_fresh",
    fullName: "Trần Thị Bích",
    orgType: ORG_TYPES.SUPPLIER,
    orgId: "sup_fresh_food",
    orgName: "Công ty Thực phẩm Sạch GreenFarm",
    role: ROLES.INGREDIENT_SUPPLIER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Supplier",
  },
  {
    userId: "usr_sch_admin",
    username: "school_admin",
    fullName: "Phạm Hải Đăng",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.SCHOOL_ADMIN,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SchoolAdmin",
  },
  {
    userId: "usr_sch_bgh",
    username: "school_bgh",
    fullName: "ThS. Lê Hoàng Nam (Hiệu trưởng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.SCHOOL_MANAGEMENT_BOARD,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Principal",
  },
  {
    userId: "usr_sch_health",
    username: "school_health",
    fullName: "BS. Nguyễn Mai Lan (Cán bộ Y tế)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.SCHOOL_HEALTH_OFFICER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HealthOfficer",
  },
  {
    userId: "usr_sch_kitchen",
    username: "school_kitchen",
    fullName: "Đầu bếp Vũ Đình Trọng",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.SCHOOL_KITCHEN_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KitchenStaff",
  },
  {
    userId: "usr_sch_teacher",
    username: "school_teacher",
    fullName: "Cô Hoàng Thu Trang (GVCN Lớp 3A1)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.HOMEROOM_TEACHER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
  },
  {
    userId: "usr_sch_parents",
    username: "school_parents",
    fullName: "Ông Bùi Quốc Tuấn (Trưởng Ban Phụ huynh)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.PARENTS_COMMITTEE,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent",
  },
  {
    userId: "usr_sch_warehouse",
    username: "school_warehouse",
    fullName: "Đỗ Minh Quân (Quản lý Kho nguyên liệu)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.INGREDIENT_MANAGEMENT,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Warehouse",
  },
]
