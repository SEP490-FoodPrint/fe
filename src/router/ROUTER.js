const ROUTER = {
  // Public
  DEFAULT: "/",
  LOGIN: "/login",
  TEST_LOGIN: "/test-login",
  REGISTER: "/register",
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/change-password",
  ACTIVATE_ACCOUNT: "/activate-account",
  EMAIL_SETUP: "/email-setup",
  REGISTRATION_PROFILE: "/register/profile",
  REGISTRATION_STATUS: "/register/status",
  FORGOT_PASSWORD: "/forgot-password",
  PASSWORD_RECOVERY_CODE: "/forgot-password/verify",
  RESET_PASSWORD: "/reset-password",
  SCHOOL_LIST: "/schools",
  SCHOOL_LANDING: "/school/:schoolCode",
  SCHOOL_MEAL_DETAIL: "/school/:schoolCode/daily-menu",
  SCHOOL_PUBLIC_TRACEABILITY: "/school/:schoolCode/traceability",
  SCHOOL_PUBLIC_MEAL_TRACEABILITY: "/school/:schoolCode/meal-traceability",

  // Phân hệ SYSTEM (Dành cho SYSTEM_ADMIN)
  SYSTEM: "/system",
  SYSTEM_ORG_APPROVAL: "/system/organization-approval",
  SYSTEM_ORG_APPROVAL_DETAIL: "/system/organization-approval/:requestId",
  SYSTEM_SCHOOL_LIST: "/system/school-list",
  SYSTEM_SCHOOL_DETAIL: "/system/school-list/:id",
  SYSTEM_SUPPLIER_LIST: "/system/supplier-list",
  SYSTEM_SUPPLIER_DETAIL: "/system/supplier-list/:id",
  SYSTEM_ENFORCEMENT_ACTIONS: "/system/supplier-enforcement",
  SYSTEM_ENFORCEMENT_ACTION_DETAIL: "/system/supplier-enforcement/:actionId",
  SYSTEM_AUTHORITY_OFFICERS: "/system/authority-officers",
  SYSTEM_AUTHORITY_OFFICER_DETAIL: "/system/authority-officers/:userId",
  SYSTEM_MEASUREMENT_UNITS: "/system/measurement-units",
  SYSTEM_CONFIG: "/system/config",
  SYSTEM_CONFIG_DETAIL: "/system/config/:id",

  // Phân hệ AUTHORITY (Cán bộ An toàn thực phẩm cấp xã — không có Dashboard)
  AUTHORITY: "/authority",
  AUTHORITY_SCHOOLS: "/authority/schools",
  AUTHORITY_SCHOOL_DETAIL: "/authority/schools/:schoolId",
  AUTHORITY_COMPLAINTS: "/authority/complaints",
  AUTHORITY_COMPLAINT_DETAIL: "/authority/complaints/:id",
  AUTHORITY_INCIDENTS: "/authority/incidents",
  AUTHORITY_INCIDENT_DETAIL: "/authority/incidents/:id",
  AUTHORITY_ENFORCEMENT_ACTIONS: "/authority/enforcement-actions",
  AUTHORITY_ENFORCEMENT_ACTION_DETAIL: "/authority/enforcement-actions/:actionId",

  // Phân hệ SUPPLIER (Dành cho INGREDIENT_SUPPLIER)
  SUPPLIER: "/supplier",
  SUPPLIER_OVERVIEW: "/supplier/overview",
  SUPPLIER_INGREDIENTS: "/supplier/ingredient-catalog",
  SUPPLIER_INGREDIENT_DETAIL: "/supplier/ingredient-catalog/:id",
  SUPPLIER_SOURCE_FACILITIES: "/supplier/source-facilities",
  SUPPLIER_SOURCE_FACILITY_DETAIL: "/supplier/source-facilities/:id",
  SUPPLIER_ORDERS: "/supplier/supply-orders",
  SUPPLIER_ORDER_DETAIL: "/supplier/supply-orders/:id",
  SUPPLIER_DELIVERIES: "/supplier/deliveries",
  SUPPLIER_DELIVERY_CREATE: "/supplier/deliveries/create",
  SUPPLIER_DELIVERY_DETAIL: "/supplier/deliveries/:id",
  SUPPLIER_STAFF: "/supplier/staff",
  SUPPLIER_STAFF_DETAIL: "/supplier/staff/:id",
  SUPPLIER_SCHOOLS: "/supplier/schools",
  SUPPLIER_SCHOOL_DETAIL: "/supplier/schools/:id",
  SUPPLIER_COMPLAINTS: "/supplier/complaints",
  SUPPLIER_COMPLAINT_DETAIL: "/supplier/complaints/:id",

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
  SCHOOL_KITCHEN_COOKING: "/school",       // Trang chủ Bếp
  SCHOOL_KITCHEN_MENU: "/school/menu",     // Thực đơn đã lên
  SCHOOL_KITCHEN_BATCHES: "/school/batches", // Lô chế biến
  SCHOOL_KITCHEN_BATCH_CREATE: "/school/batches/create", // Tạo lô nấu chung
  SCHOOL_KITCHEN_CREATE_BATCH: "/school/batches/create", // Alias Tạo lô nấu chung
  SCHOOL_KITCHEN_BATCH_CREATE_SEPARATE: "/school/batches/create-separate", // Tạo lô nấu riêng
  SCHOOL_KITCHEN_CREATE_BATCH_SEPARATE: "/school/batches/create-separate", // Alias Tạo lô nấu riêng
  SCHOOL_KITCHEN_BATCH_DETAIL: "/school/batches/:id", // Chi tiết lô chế biến
  SCHOOL_KITCHEN_BATCH_EDIT: "/school/batches/:id/edit", // Chỉnh sửa lô chế biến
  SCHOOL_KITCHEN_MEAL_ALLOCATION: "/school/meal-allocation", // Phân bổ suất ăn
  SCHOOL_KITCHEN_INGREDIENTS: "/school/ingredients", // Danh sách nguyên liệu
  SCHOOL_KITCHEN_SAMPLES: "/school/samples", // Mẫu lưu thực phẩm (danh sách ngày)
  SCHOOL_KITCHEN_SAMPLES_DATE: "/school/samples/:date", // Chi tiết mẫu lưu theo ngày
  SCHOOL_KITCHEN_SAMPLE_STORAGE: "/school/sample-storage", // Master data Tủ lưu mẫu
  SCHOOL_KITCHEN_HANDOVER: "/school/handover", // Bàn giao suất ăn
  SCHOOL_KITCHEN_TRACEABILITY: "/school/traceability", // Truy xuất nguồn gốc
  SCHOOL_KITCHEN_WASTE_RATES: "/school/waste-rates", // Bếp cấu hình tỷ lệ hao hụt nguyên liệu
  SCHOOL_MEAL_TRACEABILITY: "/school/meal-traceability", // Truy xuất nguồn gốc suất ăn lớp
  SCHOOL_DAILY_CONFIRM: "/school/daily-meal-confirmation", // GVCN
  SCHOOL_INGREDIENT_INSPECT: "/school/ingredient-inspection", // Y tế, Phụ huynh, Kho, Bếp
  SCHOOL_WAREHOUSE: "/school/warehouse-management",        // Kho / Nguyên liệu
  SCHOOL_INGREDIENT_CATALOG: "/school/ingredient-catalog",   // Danh mục Nguyên liệu Master Data
  SCHOOL_INGREDIENT_ORDERS: "/school/ingredient-orders",     // Phiếu nhập & Đơn hàng
  SCHOOL_ORDER_TRACKING: "/school/order-tracking",           // Theo dõi đơn hàng
  SCHOOL_INGREDIENT_REPORTS: "/school/ingredient-reports",   // Thống kê & Báo cáo
  SCHOOL_MEAL_FEEDBACK: "/school/meal-feedback",           // Ban Giám hiệu (C03)
  SCHOOL_MEAL_FEEDBACK_DETAIL: "/school/meal-feedback/:id",
  SCHOOL_MEAL_COMPLAINTS: "/school/meal-complaints",       // Phụ huynh, GVCN (C03)
  SCHOOL_MEAL_COMPLAINT_DETAIL: "/school/meal-complaints/:id",
  SCHOOL_INGREDIENT_FEEDBACK: "/school/ingredient-feedback", // BGH, Bếp, Dinh dưỡng (C02)
  SCHOOL_INGREDIENT_FEEDBACK_DETAIL: "/school/ingredient-feedback/:id",
  SCHOOL_AUTHORITY_COMPLAINTS: "/school/authority-complaints", // Phụ huynh, BGH (C05)
  SCHOOL_AUTHORITY_COMPLAINT_DETAIL: "/school/authority-complaints/:id",
  SCHOOL_INCIDENTS: "/school/incidents",                   // Sự cố ATTP (Phụ huynh, GVCN, BGH)
  SCHOOL_INCIDENT_DETAIL: "/school/incidents/:id",
  SCHOOL_SUPPLIERS: "/school/suppliers",
  SCHOOL_CLASS_ASSIGNMENT: "/school/class-assignment",   // BGH phân công GVCN
  SCHOOL_GRADES: "/school/grades",
  SCHOOL_COOKING_MODE: "/school/cooking-mode",             // BGH cấu hình chế độ nấu
  SCHOOL_MEAL_TIMES: "/school/meal-serving-times",          // BGH cấu hình giờ phục vụ
  SCHOOL_SAMPLE_POLICY: "/school/sample-policy",            // BGH cấu hình lượng lưu mẫu
  SCHOOL_SUPPLY_ROUND_PLAN: "/school/supply-round-plan",
  SCHOOL_ACADEMIC_YEARS: "/school/academic-years",
  SCHOOL_DELIVERY_INSPECTION_ROLES: "/school/delivery-inspection-roles", // BGH cấu hình nhóm duyệt kiểm nhận

  // Common/Error
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
};

export { ROUTER };
export default ROUTER;
