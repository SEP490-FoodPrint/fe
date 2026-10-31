const ROUTER = {
  // Public
  DEFAULT: "/",
  LOGIN: "/test-login",
  SCHOOL_LANDING: "/school/:schoolCode",

  // Phân hệ SYSTEM (Dành cho SYSTEM_ADMIN)
  SYSTEM: "/system",
  SYSTEM_ORG_APPROVAL: "/system/organization-approval",
  SYSTEM_ORG_APPROVAL_DETAIL: "/system/organization-approval/:requestId",
  SYSTEM_SCHOOL_LIST: "/system/school-list",
  SYSTEM_SUPPLIER_LIST: "/system/supplier-list",
  SYSTEM_COMPLAINT_LIST: "/system/complaint-list",
  SYSTEM_CONFIG: "/system/config",

  // Phân hệ SUPPLIER (Dành cho INGREDIENT_SUPPLIER)
  SUPPLIER: "/supplier",
  SUPPLIER_OVERVIEW: "/supplier/overview",
  SUPPLIER_INGREDIENTS: "/supplier/ingredient-catalog",
  SUPPLIER_ORDERS: "/supplier/supply-orders",

  // Phân hệ SCHOOL (Dành cho 7 roles thuộc Trường)
  SCHOOL: "/school",
  SCHOOL_OVERVIEW: "/school/overview",
  SCHOOL_ADMINISTRATION: "/school/administration",
  SCHOOL_MENU_APPROVAL: "/school/menu-approval",           // BGH, School Admin
  SCHOOL_MENU_PLANNING: "/school/menu-planning",           // Ban Y tế
  // Phân hệ Bếp ăn (Nhân viên Bếp / Bếp trưởng)
  SCHOOL_KITCHEN_COOKING: "/school/kitchen-cooking",       // Trang chủ Bếp
  SCHOOL_KITCHEN_MENU: "/school/kitchen-cooking/menu",     // Thực đơn đã lên
  SCHOOL_KITCHEN_BATCHES: "/school/kitchen-cooking/batches", // Lô chế biến
  SCHOOL_KITCHEN_BATCH_CREATE: "/school/kitchen-cooking/batches/create", // Tạo lô nấu chung
  SCHOOL_KITCHEN_CREATE_BATCH: "/school/kitchen-cooking/batches/create", // Alias Tạo lô nấu chung
  SCHOOL_KITCHEN_BATCH_CREATE_SEPARATE: "/school/kitchen-cooking/batches/create-separate", // Tạo lô nấu riêng
  SCHOOL_KITCHEN_CREATE_BATCH_SEPARATE: "/school/kitchen-cooking/batches/create-separate", // Alias Tạo lô nấu riêng
  SCHOOL_KITCHEN_BATCH_DETAIL: "/school/kitchen-cooking/batches/:id", // Chi tiết lô chế biến
  SCHOOL_KITCHEN_MEAL_ALLOCATION: "/school/kitchen-cooking/meal-allocation", // Phân bổ suất ăn
  SCHOOL_KITCHEN_INGREDIENTS: "/school/kitchen-cooking/ingredients", // Danh sách nguyên liệu
  SCHOOL_KITCHEN_SAMPLES: "/school/kitchen-cooking/samples", // Mẫu lưu thực phẩm
  SCHOOL_KITCHEN_HANDOVER: "/school/kitchen-cooking/handover", // Bàn giao suất ăn
  SCHOOL_KITCHEN_TRACEABILITY: "/school/kitchen-cooking/traceability", // Truy xuất nguồn gốc
  SCHOOL_DAILY_CONFIRM: "/school/daily-meal-confirmation", // GVCN
  SCHOOL_INGREDIENT_INSPECT: "/school/ingredient-inspection", // Y tế, Phụ huynh, Kho, Bếp
  SCHOOL_WAREHOUSE: "/school/warehouse-management",        // Kho / Nguyên liệu
  SCHOOL_MEAL_FEEDBACK: "/school/meal-feedback",           // Phụ huynh, GVCN

  // Common/Error
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
};

export default ROUTER;
