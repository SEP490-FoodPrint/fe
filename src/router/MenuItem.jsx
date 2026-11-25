import React from "react"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined"
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined"
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined"
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined"
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined"
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined"
import RoomServiceOutlinedIcon from "@mui/icons-material/RoomServiceOutlined"
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined"
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined"
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined"
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined"
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined"
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined"
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined"
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined"
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined"
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined"
import { ROLES } from "src/constants/roles"
import ROUTER from "./ROUTER"

/**
 * Menu dành cho phân hệ Quản trị Hệ thống (SYSTEM)
 */
export const MenuItemSystem = () => [
  { key: ROUTER.SYSTEM_MEASUREMENT_UNITS, label: "Đơn vị tính", icon: <TuneOutlinedIcon />, roles: [ROLES.SYSTEM_ADMIN] },
  {
    key: ROUTER.SYSTEM_ORG_APPROVAL,
    label: "Hồ sơ đăng ký",
    icon: <ReceiptLongOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    key: ROUTER.SYSTEM_SCHOOL_LIST,
    label: "Danh sách trường học",
    icon: <SchoolOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    key: ROUTER.SYSTEM_SUPPLIER_LIST,
    label: "Danh sách nhà cung cấp",
    icon: <LocalShippingOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    key: ROUTER.SYSTEM_AUTHORITY_OFFICERS,
    label: "Tài khoản cán bộ ATTP",
    icon: <AdminPanelSettingsOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    key: ROUTER.SYSTEM_ENFORCEMENT_ACTIONS,
    label: "Chế tài nhà cung cấp",
    icon: <GavelOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    key: ROUTER.SYSTEM_CONFIG,
    label: "Cấu hình hệ thống",
    icon: <SettingsOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
];

/**
 * Menu dành cho phân hệ Cơ quan Quản lý ATTP cấp xã (AUTHORITY) — không có Dashboard
 */
export const MenuItemAuthority = () => [
  {
    key: ROUTER.AUTHORITY_SCHOOLS,
    label: "Trường trên địa bàn",
    icon: <SchoolOutlinedIcon />,
    roles: [ROLES.COMMUNE_FOOD_SAFETY_OFFICER],
    permission: "authority_school.view",
  },
  {
    key: ROUTER.AUTHORITY_INCIDENTS,
    label: "Báo cáo ngộ độc",
    icon: <ReportProblemOutlinedIcon />,
    roles: [ROLES.COMMUNE_FOOD_SAFETY_OFFICER],
    permission: "food_safety_incident.view",
  },
  {
    key: ROUTER.AUTHORITY_COMPLAINTS,
    label: "Khiếu nại chuyển ATTP",
    icon: <PolicyOutlinedIcon />,
    roles: [ROLES.COMMUNE_FOOD_SAFETY_OFFICER],
    permission: "authority_complaint.view",
  },
  {
    key: ROUTER.AUTHORITY_ENFORCEMENT_ACTIONS,
    label: "Đề nghị chế tài NCC",
    icon: <GavelOutlinedIcon />,
    roles: [ROLES.COMMUNE_FOOD_SAFETY_OFFICER],
    permission: "supplier_enforcement.request",
  },
];

/**
 * Menu dành cho phân hệ Nhà cung cấp (SUPPLIER)
 */
export const MenuItemSupplier = () => [
  // Mục đầu tiên cũng là trang mặc định sau khi đăng nhập của cả quản trị và nhân viên NCC
  {
    key: ROUTER.SUPPLIER_INGREDIENTS,
    label: "Danh mục Nguyên liệu",
    icon: <Inventory2OutlinedIcon />,
    roles: [
      ROLES.INGREDIENT_SUPPLIER_ADMIN,
      ROLES.INGREDIENT_SUPPLIER_STAFF,
      ROLES.INGREDIENT_SUPPLIER,
    ],
  },
  {
    key: ROUTER.SUPPLIER_SOURCE_FACILITIES,
    label: "Cơ sở nguồn cung",
    icon: <StorefrontOutlinedIcon />,
    roles: [ROLES.INGREDIENT_SUPPLIER_ADMIN],
  },
  {
    key: ROUTER.SUPPLIER_STAFF,
    label: "Quản lý nhân viên",
    icon: <GroupOutlinedIcon />,
    roles: [ROLES.INGREDIENT_SUPPLIER_ADMIN],
  },
  {
    key: ROUTER.SUPPLIER_SCHOOLS,
    label: "Trường đã liên kết",
    icon: <SchoolOutlinedIcon />,
    roles: [ROLES.INGREDIENT_SUPPLIER_ADMIN],
  },
  {
    key: ROUTER.SUPPLIER_ORDERS,
    label: "Đơn hàng Cung ứng",
    icon: <ReceiptLongOutlinedIcon />,
    roles: [
      ROLES.INGREDIENT_SUPPLIER_ADMIN,
      ROLES.INGREDIENT_SUPPLIER_STAFF,
      ROLES.INGREDIENT_SUPPLIER,
    ],
  },
  {
    key: ROUTER.SUPPLIER_DELIVERIES,
    label: "Tạo & Quản lý Đơn giao",
    icon: <LocalShippingOutlinedIcon />,
    roles: [
      ROLES.INGREDIENT_SUPPLIER_ADMIN,
      ROLES.INGREDIENT_SUPPLIER_STAFF,
      ROLES.INGREDIENT_SUPPLIER,
    ],
  },
  {
    key: ROUTER.SUPPLIER_COMPLAINTS,
    label: "Phản ánh nguyên liệu",
    icon: <ChatBubbleOutlineOutlinedIcon />,
    roles: [
      ROLES.INGREDIENT_SUPPLIER_ADMIN,
      ROLES.INGREDIENT_SUPPLIER_STAFF,
      ROLES.INGREDIENT_SUPPLIER,
    ],
  },
];

/**
 * Menu dành cho phân hệ Nhà trường (SCHOOL) - Tự động lọc theo các roles của trường
 */
export const MenuItemSchool = () => [
  {
    key: ROUTER.SCHOOL_OVERVIEW,
    label: "Tổng quan Trường học",
    icon: <DashboardOutlinedIcon />,
    roles: [
      ROLES.SCHOOL_ADMINISTRATION,
      ROLES.SCHOOL_MANAGEMENT_BOARD,
      ROLES.PARENTS_COMMITTEE,
    ],
  },
  {
    key: ROUTER.SCHOOL_HOMEROOM_OVERVIEW,
    label: "Tổng quan lớp",
    icon: <HomeOutlinedIcon />,
    roles: [ROLES.HOMEROOM_TEACHER],
  },
  {
    key: ROUTER.SCHOOL_ADMINISTRATION,
    label: "Quản lý Tài khoản",
    icon: <AdminPanelSettingsOutlinedIcon />,
    roles: [ROLES.SCHOOL_ADMINISTRATION],
  },
  {
    key: ROUTER.SCHOOL_MENU_APPROVAL,
    label: "Phê duyệt Thực đơn",
    icon: <FactCheckOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  // BGH: sắp theo luồng công việc — duyệt thực đơn → nhà cung cấp → cấu hình → lớp học
  {
    key: ROUTER.SCHOOL_SUPPLIERS,
    label: "Nhà cung cấp",
    icon: <LocalShippingOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: "SCHOOL_CONFIGURATION",
    label: "Cấu hình",
    icon: <TuneOutlinedIcon />,
    children: [
      {
        key: ROUTER.SCHOOL_COOKING_MODE,
        label: "Chế độ nấu",
        icon: <SoupKitchenOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
      {
        key: ROUTER.SCHOOL_MEAL_TIMES,
        label: "Khung giờ vận hành",
        icon: <ScheduleOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
      {
        key: ROUTER.SCHOOL_SAMPLE_POLICY,
        label: "Lưu mẫu thực phẩm",
        icon: <ScienceOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
      {
        key: ROUTER.SCHOOL_ACADEMIC_YEARS,
        label: "Thiết lập niên khóa",
        icon: <CalendarMonthOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
      {
        key: ROUTER.SCHOOL_DELIVERY_INSPECTION_ROLES,
        label: "Phân quyền duyệt nguyên liệu",
        icon: <FactCheckOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
    ],
  },
  {
    key: "SCHOOL_GRADES_AND_CLASSES",
    label: "Khối & Lớp học",
    icon: <AssignmentIndOutlinedIcon />,
    children: [
      {
        key: ROUTER.SCHOOL_GRADES,
        label: "Khối học",
        icon: <SchoolOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
      {
        key: ROUTER.SCHOOL_CLASS_ASSIGNMENT,
        label: "Lớp học & GVCN",
        icon: <AssignmentIndOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
    ],
  },
  // === CÁC TÍNH NĂNG CHUYÊN BIỆT CHO NHÂN VIÊN DINH DƯỠNG (SCHOOL_NUTRITION_OFFICER) - 5 MỤC QUY CHUẨN ===
  {
    key: ROUTER.SCHOOL_HEALTH_OVERVIEW,
    label: "Tổng quan",
    icon: <DashboardOutlinedIcon />,
    roles: [ROLES.SCHOOL_NUTRITION_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_MENU_PLANNING,
    label: "Thực đơn",
    icon: <RestaurantMenuOutlinedIcon />,
    roles: [ROLES.SCHOOL_NUTRITION_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_DISH_CATALOG,
    label: "Danh sách món ăn",
    icon: <MenuBookOutlinedIcon />,
    roles: [ROLES.SCHOOL_NUTRITION_OFFICER, ROLES.SCHOOL_ADMINISTRATION],
  },
  {
    key: ROUTER.SCHOOL_HEALTH_ALLERGY,
    label: "Thông tin dị ứng",
    icon: <HealthAndSafetyOutlinedIcon />,
    roles: [ROLES.SCHOOL_NUTRITION_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Kiểm tra nguyên liệu",
    icon: <FactCheckOutlinedIcon />,
    roles: [ROLES.SCHOOL_NUTRITION_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Kiểm tra Nguyên liệu",
    icon: <HealthAndSafetyOutlinedIcon />,
    // Màn hình dùng cho Phụ huynh
    roles: [ROLES.PARENTS_COMMITTEE],
  },

  // === CÁC TÍNH NĂNG CHUYÊN BIỆT CHO NHÂN VIÊN BẾP (SCHOOL_KITCHEN_STAFF) - 7 MỤC QUY CHUẨN ===
  {
    key: ROUTER.SCHOOL_KITCHEN_COOKING,
    label: "Trang chủ",
    icon: <HomeOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_MENU,
    label: "Thực đơn tuần",
    icon: <RestaurantMenuOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_BATCHES,
    label: "Chế biến",
    icon: <SoupKitchenOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION,
    label: "Phân bổ suất ăn",
    icon: <RoomServiceOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_SAMPLES,
    label: "Lưu mẫu thức ăn",
    icon: <ScienceOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_SAMPLE_STORAGE,
    label: "Tủ lưu mẫu",
    icon: <KitchenOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Kiểm tra nguyên liệu",
    icon: <FactCheckOutlinedIcon />,
    badge: "1",
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },

  {
    key: ROUTER.SCHOOL_KITCHEN_TRACEABILITY,
    label: "Truy xuất nguồn gốc",
    icon: <AccountTreeOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF, ROLES.SCHOOL_NUTRITION_OFFICER, ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: "SCHOOL_KITCHEN_CONFIGURATION",
    label: "Cấu hình",
    icon: <TuneOutlinedIcon />,
    children: [
      {
        key: ROUTER.SCHOOL_KITCHEN_WASTE_RATES,
        label: "Tỷ lệ hao hụt",
        icon: <ScaleOutlinedIcon />,
        roles: [ROLES.SCHOOL_KITCHEN_STAFF],
      },
    ],
  },

  {
    key: ROUTER.SCHOOL_DAILY_CONFIRM,
    label: "Báo suất ăn & Dị ứng lớp",
    icon: <HowToRegOutlinedIcon />,
    roles: [ROLES.HOMEROOM_TEACHER],
  },

  // === CÁC TÍNH NĂNG CHUYÊN BIỆT CHO BỘ PHẬN QUẢN LÝ KHO & NGUYÊN LIỆU (INGREDIENT_MANAGEMENT) - 7 MỤC QUY CHUẨN ===
  {
    key: ROUTER.SCHOOL_INGREDIENT_CATALOG,
    label: "Danh mục nguyên liệu",
    icon: <Inventory2OutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_SUPPLY_ROUND_PLAN,
    label: "Kế hoạch mẻ theo đợt giao",
    icon: <FactCheckOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_WAREHOUSE,
    label: "Đồ lưu kho",
    icon: <WarehouseOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_ORDERS,
    label: "Đồ tươi",
    icon: <ReceiptLongOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Kiểm tra nguyên liệu",
    icon: <FactCheckOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_REPORTS,
    label: "Thống kê & Báo cáo",
    icon: <AssessmentOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },

  {
    key: ROUTER.SCHOOL_MEAL_FEEDBACK,
    label: "Ý kiến & Phản ánh Bữa ăn",
    icon: <ChatBubbleOutlineOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: ROUTER.SCHOOL_MEAL_COMPLAINTS,
    label: "Khiếu nại bữa ăn",
    icon: <ChatBubbleOutlineOutlinedIcon />,
    roles: [ROLES.PARENTS_COMMITTEE, ROLES.HOMEROOM_TEACHER],
  },
  {
    key: ROUTER.SCHOOL_AUTHORITY_COMPLAINTS,
    label: "Khiếu nại chuyển ATTP",
    icon: <PolicyOutlinedIcon />,
    roles: [ROLES.PARENTS_COMMITTEE],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_FEEDBACK,
    label: "Phản ánh nguyên liệu",
    icon: <FeedbackOutlinedIcon />,
    roles: [
      ROLES.SCHOOL_MANAGEMENT_BOARD,
      ROLES.SCHOOL_KITCHEN_STAFF,
      ROLES.SCHOOL_NUTRITION_OFFICER,
    ],
  },
  {
    key: ROUTER.SCHOOL_INCIDENTS,
    label: "Báo cáo ngộ độc",
    icon: <ReportProblemOutlinedIcon />,
    roles: [
      ROLES.PARENTS_COMMITTEE,
      ROLES.HOMEROOM_TEACHER,
      ROLES.SCHOOL_MANAGEMENT_BOARD,
    ],
  },
];
