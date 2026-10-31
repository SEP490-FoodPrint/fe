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
  SCHOOL_ADMIN: "SCHOOL_ADMINISTRATION", // Alias tương thích ngược cho SCHOOL_ADMIN
  SCHOOL_MANAGEMENT_BOARD: "SCHOOL_MANAGEMENT_BOARD", // Ban giám hiệu
  SCHOOL_HEALTH_OFFICER: "SCHOOL_HEALTH_OFFICER", // Ban y tế
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
  [ROLES.SCHOOL_ADMIN]: "Quản trị viên Nhà trường (School Admin)",
  [ROLES.SCHOOL_MANAGEMENT_BOARD]: "Ban Giám Hiệu",
  [ROLES.SCHOOL_HEALTH_OFFICER]: "Cán bộ Y tế Trường",
  [ROLES.SCHOOL_KITCHEN_STAFF]: "Nhân viên Bếp / Bếp trưởng",
  [ROLES.HOMEROOM_TEACHER]: "Giáo viên Chủ nhiệm",
  [ROLES.PARENTS_COMMITTEE]: "Ban Đại diện Phụ huynh",
  [ROLES.INGREDIENT_MANAGEMENT]: "Bộ phận Quản lý Kho & Nguyên liệu",
  [ROLES.COMMUNE_FOOD_SAFETY_OFFICER]: "Cán bộ An toàn Thực phẩm cấp Xã",
};


