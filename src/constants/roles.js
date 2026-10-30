// Nhóm tổ chức (Portal cấp 1)
export const ORG_TYPES = {
  SYSTEM: "SYSTEM",
  SCHOOL: "SCHOOL",
  SUPPLIER: "SUPPLIER",
  AUTHORITY: "AUTHORITY",
}

export const ORG_LABELS = {
  [ORG_TYPES.SYSTEM]: "Quản trị hệ thống",
  [ORG_TYPES.SCHOOL]: "Nhà trường",
  [ORG_TYPES.SUPPLIER]: "Nhà cung cấp",
  [ORG_TYPES.AUTHORITY]: "Cơ quan Quản lý ATTP Cấp Xã",
}

// 11 Vai trò nghiệp vụ của hệ thống FoodPrint (1 account = 1 role)
export const ROLES = {
  // Nhóm SYSTEM
  SYSTEM_ADMIN: "SYSTEM_ADMIN",

  // Nhóm SUPPLIER
  INGREDIENT_SUPPLIER_ADMIN: "INGREDIENT_SUPPLIER_ADMIN",
  INGREDIENT_SUPPLIER_STAFF: "INGREDIENT_SUPPLIER_STAFF",
  INGREDIENT_SUPPLIER: "INGREDIENT_SUPPLIER_ADMIN", // Alias tương thích ngược

  // Nhóm SCHOOL
  SCHOOL_ADMINISTRATION: "SCHOOL_ADMINISTRATION",
  SCHOOL_ADMIN: "SCHOOL_ADMINISTRATION", // Alias tương thích ngược cho SCHOOL_ADMIN
  SCHOOL_MANAGEMENT_BOARD: "SCHOOL_MANAGEMENT_BOARD", // Ban giám hiệu
  SCHOOL_HEALTH_OFFICER: "SCHOOL_HEALTH_OFFICER",     // Ban y tế
  SCHOOL_KITCHEN_STAFF: "SCHOOL_KITCHEN_STAFF",       // Nhân viên bếp
  HOMEROOM_TEACHER: "HOMEROOM_TEACHER",               // Giáo viên chủ nhiệm
  PARENTS_COMMITTEE: "PARENTS_COMMITTEE",             // Ban phụ huynh
  INGREDIENT_MANAGEMENT: "INGREDIENT_MANAGEMENT_DEPARTMENT", // Bộ phận quản lý kho/nguyên liệu

  // Nhóm AUTHORITY
  COMMUNE_FOOD_SAFETY_OFFICER: "COMMUNE_FOOD_SAFETY_OFFICER",
}

// Tên hiển thị tiếng Việt của các role
export const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: "Quản trị viên Hệ thống (System Admin)",
  [ROLES.INGREDIENT_SUPPLIER_ADMIN]: "Quản trị viên Nhà cung cấp (Supplier Admin)",
  [ROLES.INGREDIENT_SUPPLIER_STAFF]: "Nhân viên Nhà cung cấp (Supplier Staff)",
  [ROLES.SCHOOL_ADMINISTRATION]: "Quản trị viên Nhà trường (School Admin)",
  [ROLES.SCHOOL_MANAGEMENT_BOARD]: "Ban Giám Hiệu",
  [ROLES.SCHOOL_HEALTH_OFFICER]: "Cán bộ Y tế Trường",
  [ROLES.SCHOOL_KITCHEN_STAFF]: "Nhân viên Bếp / Bếp trưởng",
  [ROLES.HOMEROOM_TEACHER]: "Giáo viên Chủ nhiệm",
  [ROLES.PARENTS_COMMITTEE]: "Ban Đại diện Phụ huynh",
  [ROLES.INGREDIENT_MANAGEMENT]: "Bộ phận Quản lý Kho & Nguyên liệu",
  [ROLES.COMMUNE_FOOD_SAFETY_OFFICER]: "Cán bộ An toàn Thực phẩm cấp Xã",
}

// Danh sách tài khoản Demo kết nối trực tiếp với DB Cloud (Mật khẩu mặc định: 123456)
export const MOCK_ACCOUNTS = [
  {
    userId: "sysadmin",
    username: "sysadmin",
    fullName: "FoodPrint System Admin",
    orgType: ORG_TYPES.SYSTEM,
    orgId: "system_root",
    orgName: "Hệ thống Quản lý FoodPrint Toàn quốc",
    role: ROLES.SYSTEM_ADMIN,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SystemAdmin",
  },
  {
    userId: "fp_demo_bgh",
    username: "fp_demo_bgh",
    fullName: "BGH Demo (Hiệu trưởng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint (DEMO)",
    role: ROLES.SCHOOL_MANAGEMENT_BOARD,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Principal",
  },
  {
    userId: "fp_demo_health",
    username: "fp_demo_health",
    fullName: "Nhân viên y tế Demo",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint (DEMO)",
    role: ROLES.SCHOOL_HEALTH_OFFICER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HealthOfficer",
  },
  {
    userId: "fp_demo_kitchen",
    username: "fp_demo_kitchen",
    fullName: "Nhân viên bếp Demo",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint (DEMO)",
    role: ROLES.SCHOOL_KITCHEN_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KitchenStaff",
  },
  {
    userId: "fp_demo_teacher",
    username: "fp_demo_teacher",
    fullName: "Giáo viên chủ nhiệm Demo",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint (DEMO)",
    role: ROLES.HOMEROOM_TEACHER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
  },
  {
    userId: "fp_demo_parents",
    username: "fp_demo_parents",
    fullName: "Ban đại diện phụ huynh Demo",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint (DEMO)",
    role: ROLES.PARENTS_COMMITTEE,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent",
  },
  {
    userId: "fp_demo_ingredients",
    username: "fp_demo_ingredients",
    fullName: "Nhân viên quản lý nguyên liệu Demo",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint (DEMO)",
    role: ROLES.INGREDIENT_MANAGEMENT,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Warehouse",
  },
  {
    userId: "fp_demo_supplier_admin",
    username: "fp_demo_supplier_admin",
    fullName: "Quản trị Supplier Demo",
    orgType: ORG_TYPES.SUPPLIER,
    orgId: "sup_fresh_food",
    orgName: "Nhà cung cấp Nguyên liệu Sạch",
    role: ROLES.INGREDIENT_SUPPLIER_ADMIN,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SupplierAdmin",
  },
  {
    userId: "fp_demo_supplier_staff",
    username: "fp_demo_supplier_staff",
    fullName: "Nhân viên Supplier Demo",
    orgType: ORG_TYPES.SUPPLIER,
    orgId: "sup_fresh_food",
    orgName: "Nhà cung cấp Nguyên liệu Sạch",
    role: ROLES.INGREDIENT_SUPPLIER_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SupplierStaff",
  },
  {
    userId: "fp_demo_authority",
    username: "fp_demo_authority",
    fullName: "Cán bộ ATTP Demo",
    orgType: ORG_TYPES.AUTHORITY,
    orgId: "commune_authority_01",
    orgName: "UBND Xã - Trạm Y tế Cấp Xã",
    role: ROLES.COMMUNE_FOOD_SAFETY_OFFICER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Officer",
  },
]
