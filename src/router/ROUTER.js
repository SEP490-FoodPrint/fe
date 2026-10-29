const ROUTER = {
  // Public
  DEFAULT: "/",
  LOGIN: "/login",
  SCHOOL_LANDING: "/school/:schoolCode",

  // Phân hệ SYSTEM (Dành cho SYSTEM_ADMIN)
  SYSTEM: "/system",
  SYSTEM_OVERVIEW: "/system/overview",
  SYSTEM_ORG_APPROVAL: "/system/organization-approval",

  // Phân hệ SUPPLIER (Dành cho INGREDIENT_SUPPLIER)
  SUPPLIER: "/supplier",
  SUPPLIER_OVERVIEW: "/supplier/overview",
  SUPPLIER_INGREDIENTS: "/supplier/ingredient-catalog",
  SUPPLIER_ORDERS: "/supplier/supply-orders",

  // Phân hệ SCHOOL (Dành cho 7 roles thuộc Trường)
  SCHOOL: "/school",
  SCHOOL_OVERVIEW: "/school/overview",
  SCHOOL_MENU_APPROVAL: "/school/menu-approval",           // BGH, School Admin
  SCHOOL_MENU_PLANNING: "/school/menu-planning",           // Ban Y tế
  SCHOOL_KITCHEN_COOKING: "/school/kitchen-cooking",       // Nhân viên Bếp (Dashboard)
  SCHOOL_KITCHEN_BATCHES: "/school/kitchen-cooking/batches", // Nhân viên Bếp (Mẻ chế biến)
  SCHOOL_KITCHEN_CREATE_BATCH: "/school/kitchen-cooking/batches/create", // Nhân viên Bếp (Tạo mẻ mới)
  SCHOOL_DAILY_CONFIRM: "/school/daily-meal-confirmation", // GVCN
  SCHOOL_INGREDIENT_INSPECT: "/school/ingredient-inspection", // Y tế, Phụ huynh, Kho
  SCHOOL_WAREHOUSE: "/school/warehouse-management",        // Kho / Nguyên liệu
  SCHOOL_MEAL_FEEDBACK: "/school/meal-feedback",           // Phụ huynh, GVCN

  // Common/Error
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
}

export default ROUTER
