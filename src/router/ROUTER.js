const ROUTER = {
  // Public
  DEFAULT: "/",
  LOGIN: "/login",
  TEST_LOGIN: "/test-login",
  REGISTER: "/register",
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",
  ACTIVATE_ACCOUNT: "/activate-account",
  REGISTRATION_PROFILE: "/register/profile",
  REGISTRATION_STATUS: "/register/status",
  FORGOT_PASSWORD: "/forgot-password",
  PASSWORD_RECOVERY_CODE: "/forgot-password/verify",
  RESET_PASSWORD: "/reset-password",
  SCHOOL_LIST: "/schools",
  SCHOOL_LANDING: "/school/:schoolCode",
  SCHOOL_MEAL_DETAIL: "/school/:schoolCode/daily-menu",

  // Phân hệ SYSTEM (Dành cho SYSTEM_ADMIN)
  SYSTEM: "/system",
  SYSTEM_ORG_APPROVAL: "/system/organization-approval",
  SYSTEM_ORG_APPROVAL_DETAIL: "/system/organization-approval/:requestId",
  SYSTEM_SCHOOL_LIST: "/system/school-list",
  SYSTEM_SCHOOL_DETAIL: "/system/school-list/:id",
  SYSTEM_SUPPLIER_LIST: "/system/supplier-list",
  SYSTEM_SUPPLIER_DETAIL: "/system/supplier-list/:id",
  SYSTEM_COMPLAINT_LIST: "/system/complaint-list",
  SYSTEM_CONFIG: "/system/config",

  // Phân hệ SUPPLIER (Dành cho INGREDIENT_SUPPLIER)
  SUPPLIER: "/supplier",
  SUPPLIER_OVERVIEW: "/supplier/overview",
  SUPPLIER_INGREDIENTS: "/supplier/ingredient-catalog",
  SUPPLIER_INGREDIENT_DETAIL: "/supplier/ingredient-catalog/:id",
  SUPPLIER_ORDERS: "/supplier/supply-orders",

  // Phân hệ SCHOOL (Dành cho 7 roles thuộc Trường)
  SCHOOL: "/school",
  SCHOOL_OVERVIEW: "/school/overview",
  SCHOOL_HOMEROOM_OVERVIEW: "/school/homeroom-overview",
  SCHOOL_ADMINISTRATION: "/school/administration",
  SCHOOL_ACCOUNT_CREATE: "/school/administration/accounts/create",
  SCHOOL_ACCOUNT_EDIT: "/school/administration/accounts/:id/edit",
  SCHOOL_MENU_APPROVAL: "/school/menu-approval",           // BGH, School Admin
  SCHOOL_MENU_PLANNING: "/school/menu-planning",           // Danh sách thực đơn (Ban Y tế)
  SCHOOL_MENU_CREATE: "/school/menu-planning/create",     // Tạo thực đơn mới
  SCHOOL_MENU_EDIT: "/school/menu-planning/:id/edit",     // Chỉnh sửa thực đơn
  SCHOOL_MENU_DETAIL: "/school/menu-planning/:id",        // Chi tiết thực đơn
  // Phân hệ Y tế học đường (Nhân viên Y tế)
  SCHOOL_HEALTH_OVERVIEW: "/school/health-overview",       // Trang chủ / Tổng quan Y tế
  SCHOOL_HEALTH_ALLERGY: "/school/health-allergy",         // Thông tin dị ứng
  SCHOOL_DISH_CATALOG: "/school/dish-catalog",             // Kho Món Ăn Master Data
  // Phân hệ Bếp ăn (Nhân viên Bếp / Bếp trưởng)
  SCHOOL_KITCHEN_COOKING: "/school/kitchen-cooking",       // Trang chủ Bếp
  SCHOOL_KITCHEN_MENU: "/school/kitchen-cooking/menu",     // Thực đơn đã lên
  SCHOOL_KITCHEN_BATCHES: "/school/kitchen-cooking/batches", // Lô chế biến
  SCHOOL_KITCHEN_BATCH_CREATE: "/school/kitchen-cooking/batches/create", // Tạo lô nấu chung
  SCHOOL_KITCHEN_CREATE_BATCH: "/school/kitchen-cooking/batches/create", // Alias Tạo lô nấu chung
  SCHOOL_KITCHEN_BATCH_CREATE_SEPARATE: "/school/kitchen-cooking/batches/create-separate", // Tạo lô nấu riêng
  SCHOOL_KITCHEN_CREATE_BATCH_SEPARATE: "/school/kitchen-cooking/batches/create-separate", // Alias Tạo lô nấu riêng
  SCHOOL_KITCHEN_BATCH_DETAIL: "/school/kitchen-cooking/batches/:id", // Chi tiết lô chế biến
  SCHOOL_KITCHEN_BATCH_EDIT: "/school/kitchen-cooking/batches/:id/edit", // Chỉnh sửa lô chế biến
  SCHOOL_KITCHEN_MEAL_ALLOCATION: "/school/kitchen-cooking/meal-allocation", // Phân bổ suất ăn
  SCHOOL_KITCHEN_INGREDIENTS: "/school/kitchen-cooking/ingredients", // Danh sách nguyên liệu
  SCHOOL_KITCHEN_SAMPLES: "/school/kitchen-cooking/samples", // Mẫu lưu thực phẩm (danh sách ngày)
  SCHOOL_KITCHEN_SAMPLES_DATE: "/school/kitchen-cooking/samples/:date", // Chi tiết mẫu lưu theo ngày
  SCHOOL_KITCHEN_SAMPLE_STORAGE: "/school/kitchen-cooking/sample-storage", // Master data Tủ lưu mẫu
  SCHOOL_KITCHEN_HANDOVER: "/school/kitchen-cooking/handover", // Bàn giao suất ăn
  SCHOOL_KITCHEN_TRACEABILITY: "/school/kitchen-cooking/traceability", // Truy xuất nguồn gốc
  SCHOOL_DAILY_CONFIRM: "/school/daily-meal-confirmation", // GVCN
  SCHOOL_INGREDIENT_INSPECT: "/school/ingredient-inspection", // Y tế, Phụ huynh, Kho, Bếp
  SCHOOL_WAREHOUSE: "/school/warehouse-management",        // Kho / Nguyên liệu
  SCHOOL_INGREDIENT_OVERVIEW: "/school/ingredient-overview", // Tổng quan Kho & Nguyên liệu
  SCHOOL_INGREDIENT_CATALOG: "/school/ingredient-catalog",   // Danh mục Nguyên liệu Master Data
  SCHOOL_INGREDIENT_ORDERS: "/school/ingredient-orders",     // Phiếu nhập & Đơn hàng
  SCHOOL_ORDER_TRACKING: "/school/order-tracking",           // Theo dõi đơn hàng
  SCHOOL_INGREDIENT_REPORTS: "/school/ingredient-reports",   // Thống kê & Báo cáo
  SCHOOL_MEAL_FEEDBACK: "/school/meal-feedback",           // Phụ huynh, GVCN
  SCHOOL_SUPPLIERS: "/school/suppliers",
  SCHOOL_CLASS_ASSIGNMENT: "/school/class-assignment",   // BGH phân công GVCN
  SCHOOL_COOKING_MODE: "/school/cooking-mode",             // BGH cấu hình chế độ nấu
  SCHOOL_MEAL_TIMES: "/school/meal-serving-times",          // BGH cấu hình giờ phục vụ
  SCHOOL_ACADEMIC_YEARS: "/school/academic-years",

  // Common/Error
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
};

export default ROUTER;
