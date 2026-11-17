// Nhóm tổ chức (Portal cấp 1)
export const ORG_TYPES = {
  SYSTEM: "SYSTEM",
  SCHOOL: "SCHOOL",
  SUPPLIER: "SUPPLIER",
  AUTHORITY: "AUTHORITY",
};

export const ORG_LABELS = {
  [ORG_TYPES.SYSTEM]: "Quản trị hệ thống",
  [ORG_TYPES.SCHOOL]: "Nhà trường",
  [ORG_TYPES.SUPPLIER]: "Nhà cung cấp",
  [ORG_TYPES.AUTHORITY]: "Cơ quan Quản lý ATTP Cấp Xã",
};

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
  SCHOOL_MANAGEMENT_BOARD: "SCHOOL_MANAGEMENT_BOARD", // Ban giám hiệu
  SCHOOL_NUTRITION_OFFICER: "SCHOOL_NUTRITION_OFFICER", // Nhân viên dinh dưỡng
  SCHOOL_KITCHEN_STAFF: "SCHOOL_KITCHEN_STAFF", // Nhân viên bếp
  HOMEROOM_TEACHER: "HOMEROOM_TEACHER", // Giáo viên chủ nhiệm
  PARENTS_COMMITTEE: "PARENTS_COMMITTEE", // Ban phụ huynh
  INGREDIENT_MANAGEMENT: "INGREDIENT_MANAGEMENT_DEPARTMENT", // Bộ phận quản lý kho/nguyên liệu

  // Nhóm AUTHORITY
  COMMUNE_FOOD_SAFETY_OFFICER: "COMMUNE_FOOD_SAFETY_OFFICER",
};

// Tên hiển thị tiếng Việt của các role
export const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: "Quản trị viên Hệ thống (System Admin)",
  [ROLES.INGREDIENT_SUPPLIER_ADMIN]:
    "Quản trị viên Nhà cung cấp (Supplier Admin)",
  [ROLES.INGREDIENT_SUPPLIER_STAFF]: "Nhân viên Nhà cung cấp (Supplier Staff)",
  [ROLES.SCHOOL_ADMINISTRATION]: "Quản trị viên Nhà trường (School Admin)",
  [ROLES.SCHOOL_MANAGEMENT_BOARD]: "Ban Giám Hiệu",
  [ROLES.SCHOOL_NUTRITION_OFFICER]: "Nhân viên Dinh dưỡng",
  [ROLES.SCHOOL_KITCHEN_STAFF]: "Nhân viên Bếp / Bếp trưởng",
  [ROLES.HOMEROOM_TEACHER]: "Giáo viên Chủ nhiệm",
  [ROLES.PARENTS_COMMITTEE]: "Ban Đại diện Phụ huynh",
  [ROLES.INGREDIENT_MANAGEMENT]: "Bộ phận Quản lý Kho & Nguyên liệu",
  [ROLES.COMMUNE_FOOD_SAFETY_OFFICER]: "Cán bộ An toàn Thực phẩm cấp Xã",
};


// Danh sách tài khoản kết nối trực tiếp với DB Cloud (Mật khẩu mặc định: 123456)
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
    userId: "fp_bgh",
    username: "fp_bgh",
    fullName: "Ban Giám Hiệu (Hiệu trưởng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.SCHOOL_MANAGEMENT_BOARD,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Principal",
  },
  {
    userId: "fp_school_admin",
    username: "fp_school_admin",
    fullName: "Quản trị viên Nhà trường",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.SCHOOL_ADMINISTRATION,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SchoolAdmin",
  },
  {
    userId: "fp_health",
    username: "fp_health",
    fullName: "Nguyễn Thu Trang (Nhân viên Dinh dưỡng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.SCHOOL_NUTRITION_OFFICER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NutritionOfficer",
  },
  {
    userId: "school_kitchen",
    username: "school_kitchen",
    fullName: "Bếp trưởng Cầu Giấy (Phương án A: Nấu chung)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "10000000-0000-4000-8000-000000000001",
    orgName: "Trường Tiểu học Cầu Giấy",
    role: ROLES.SCHOOL_KITCHEN_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KitchenStaffCauGiay",
  },
  {
    userId: "fp_kitchen",
    username: "fp_kitchen",
    fullName: "Nhân viên bếp (Phương án B: Nấu riêng)",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.SCHOOL_KITCHEN_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KitchenStaff",
  },
  {
    userId: "fp_teacher",
    username: "fp_teacher",
    fullName: "Giáo viên chủ nhiệm",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.HOMEROOM_TEACHER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
  },
  {
    userId: "fp_parents",
    username: "fp_parents",
    fullName: "Ban đại diện phụ huynh",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.PARENTS_COMMITTEE,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent",
  },
  {
    userId: "fp_ingredients",
    username: "fp_ingredients",
    fullName: "Nhân viên quản lý kho & nguyên liệu",
    orgType: ORG_TYPES.SCHOOL,
    orgId: "sch_cau_giay_01",
    orgName: "Trường Tiểu học FoodPrint",
    role: ROLES.INGREDIENT_MANAGEMENT,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Warehouse",
  },
  {
    userId: "fp_supplier_admin",
    username: "fp_supplier_admin",
    fullName: "Quản trị viên Nhà cung cấp",
    orgType: ORG_TYPES.SUPPLIER,
    orgId: "sup_fresh_food",
    orgName: "Nhà cung cấp Nguyên liệu Sạch",
    role: ROLES.INGREDIENT_SUPPLIER_ADMIN,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SupplierAdmin",
  },
  {
    userId: "fp_supplier_staff",
    username: "fp_supplier_staff",
    fullName: "Nhân viên Nhà cung cấp",
    orgType: ORG_TYPES.SUPPLIER,
    orgId: "sup_fresh_food",
    orgName: "Nhà cung cấp Nguyên liệu Sạch",
    role: ROLES.INGREDIENT_SUPPLIER_STAFF,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SupplierStaff",
  },
  {
    userId: "fp_authority",
    username: "fp_authority",
    fullName: "Cán bộ An toàn Thực phẩm",
    orgType: ORG_TYPES.AUTHORITY,
    orgId: "commune_authority_01",
    orgName: "UBND Xã - Trạm Y tế Cấp Xã",
    role: ROLES.COMMUNE_FOOD_SAFETY_OFFICER,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Officer",
  },
];
