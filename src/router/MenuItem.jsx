import React from "react"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined"
import OutdoorGrillOutlinedIcon from "@mui/icons-material/OutdoorGrillOutlined"
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"
import SanitizerOutlinedIcon from "@mui/icons-material/SanitizerOutlined"
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
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
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined"
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined"
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined"
import { ROLES } from "src/constants/roles"
import ROUTER from "./ROUTER"

/**
 * Menu dành cho phân hệ Quản trị Hệ thống (SYSTEM)
 */
export const MenuItemSystem = () => [
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
    key: ROUTER.SYSTEM_COMPLAINT_LIST,
    label: "Danh sách khiếu nại",
    icon: <ChatBubbleOutlineOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    key: ROUTER.SYSTEM_CONFIG,
    label: "Cấu hình hệ thống",
    icon: <SettingsOutlinedIcon />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
]

/**
 * Menu dành cho phân hệ Nhà cung cấp (SUPPLIER)
 */
export const MenuItemSupplier = () => [
  {
    key: ROUTER.SUPPLIER_OVERVIEW,
    label: "Tổng quan Nhà cung cấp",
    icon: <DashboardOutlinedIcon />,
    roles: [
      ROLES.INGREDIENT_SUPPLIER_ADMIN,
      ROLES.INGREDIENT_SUPPLIER_STAFF,
      ROLES.INGREDIENT_SUPPLIER,
    ],
  },
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
    key: ROUTER.SUPPLIER_ORDERS,
    label: "Đơn hàng Cung ứng",
    icon: <LocalShippingOutlinedIcon />,
    roles: [
      ROLES.INGREDIENT_SUPPLIER_ADMIN,
      ROLES.INGREDIENT_SUPPLIER_STAFF,
      ROLES.INGREDIENT_SUPPLIER,
    ],
  },
]

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
  // === CÁC TÍNH NĂNG CHUYÊN BIỆT CHO NHÂN VIÊN Y TẾ (SCHOOL_HEALTH_OFFICER) - 5 MỤC QUY CHUẨN ===
  {
    key: ROUTER.SCHOOL_HEALTH_OVERVIEW,
    label: "Tổng quan",
    icon: <DashboardOutlinedIcon />,
    roles: [ROLES.SCHOOL_HEALTH_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_MENU_PLANNING,
    label: "Thực đơn",
    icon: <RestaurantMenuOutlinedIcon />,
    roles: [ROLES.SCHOOL_HEALTH_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_DISH_CATALOG,
    label: "Danh sách món ăn",
    icon: <MenuBookOutlinedIcon />,
    roles: [ROLES.SCHOOL_HEALTH_OFFICER, ROLES.SCHOOL_ADMINISTRATION],
  },
  {
    key: ROUTER.SCHOOL_HEALTH_ALLERGY,
    label: "Thông tin dị ứng",
    icon: <HealthAndSafetyOutlinedIcon />,
    roles: [ROLES.SCHOOL_HEALTH_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Đánh giá giao hàng",
    icon: <FactCheckOutlinedIcon />,
    roles: [ROLES.SCHOOL_HEALTH_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Kiểm tra Nguyên liệu",
    icon: <HealthAndSafetyOutlinedIcon />,
    // Màn hình dùng cho Phụ huynh
    roles: [
      ROLES.PARENTS_COMMITTEE,
    ],
  },

  // === CÁC TÍNH NĂNG CHUYÊN BIỆT CHO NHÂN VIÊN BẾP (SCHOOL_KITCHEN_STAFF) - 8 MỤC GỐC ===
  {
    key: ROUTER.SCHOOL_KITCHEN_COOKING,
    label: "Trang chủ",
    icon: <HomeOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_MENU,
    label: "Thực đơn tuần học đường",
    icon: <RestaurantMenuOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_MENU_PLANNING,
    label: "Danh sách thực đơn",
    icon: <DescriptionOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_BATCHES,
    label: "Lô chế biến",
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
    key: ROUTER.SCHOOL_KITCHEN_INGREDIENTS,
    label: "Danh sách nguyên liệu",
    icon: <Inventory2OutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_SAMPLES,
    label: "Mẫu lưu thực phẩm",
    icon: <ScienceOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Đánh giá nguyên liệu",
    icon: <FactCheckOutlinedIcon />,
    badge: "1",
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_TRACEABILITY,
    label: "Truy xuất nguồn gốc",
    icon: <QrCodeScannerOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },

  {
    key: ROUTER.SCHOOL_SUPPLIERS,
    label: "Nhà cung cấp",
    icon: <LocalShippingOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: ROUTER.SCHOOL_CLASS_ASSIGNMENT,
    label: "Phân công GVCN",
    icon: <AssignmentIndOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: ROUTER.SCHOOL_COOKING_MODE,
    label: "Chế độ nấu",
    icon: <SoupKitchenOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: ROUTER.SCHOOL_MEAL_TIMES,
    label: "Giờ phục vụ",
    icon: <ScheduleOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: ROUTER.SCHOOL_DAILY_CONFIRM,
    label: "Báo suất ăn & Dị ứng lớp",
    icon: <HowToRegOutlinedIcon />,
    roles: [ROLES.HOMEROOM_TEACHER],
  },

  // === CÁC TÍNH NĂNG CHUYÊN BIỆT CHO BỘ PHẬN QUẢN LÝ KHO & NGUYÊN LIỆU (INGREDIENT_MANAGEMENT) - 5 MỤC QUY CHUẨN ===
  {
    key: ROUTER.SCHOOL_INGREDIENT_OVERVIEW,
    label: "Tổng quan",
    icon: <DashboardOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_WAREHOUSE,
    label: "Quản lý kho",
    icon: <WarehouseOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_ORDERS,
    label: "Phiếu nhập & Đơn hàng",
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
    roles: [ROLES.PARENTS_COMMITTEE, ROLES.HOMEROOM_TEACHER, ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
]
