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
import RoomServiceOutlinedIcon from "@mui/icons-material/RoomServiceOutlined"
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined"
import QrCodeScannerOutlinedIcon from "@mui/icons-material/QrCodeScannerOutlined"
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
    roles: [ROLES.INGREDIENT_SUPPLIER],
  },
  {
    key: ROUTER.SUPPLIER_INGREDIENTS,
    label: "Danh mục Nguyên liệu",
    icon: <Inventory2OutlinedIcon />,
    roles: [ROLES.INGREDIENT_SUPPLIER],
  },
  {
    key: ROUTER.SUPPLIER_ORDERS,
    label: "Đơn hàng Cung ứng",
    icon: <LocalShippingOutlinedIcon />,
    roles: [ROLES.INGREDIENT_SUPPLIER],
  },
]

/**
 * Menu dành cho phân hệ Nhà trường (SCHOOL) - Tự động lọc theo 7 roles của trường
 */
export const MenuItemSchool = () => [
  {
    key: ROUTER.SCHOOL_OVERVIEW,
    label: "Tổng quan Trường học",
    icon: <DashboardOutlinedIcon />,
    roles: [
      ROLES.SCHOOL_ADMIN,
      ROLES.SCHOOL_MANAGEMENT_BOARD,
      ROLES.SCHOOL_HEALTH_OFFICER,
      ROLES.HOMEROOM_TEACHER,
      ROLES.PARENTS_COMMITTEE,
      ROLES.INGREDIENT_MANAGEMENT,
    ],
  },
  {
    key: ROUTER.SCHOOL_MENU_APPROVAL,
    label: "Phê duyệt Thực đơn",
    icon: <FactCheckOutlinedIcon />,
    roles: [ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: ROUTER.SCHOOL_MENU_PLANNING,
    label: "Lập Thực đơn & Giám sát Dị ứng",
    icon: <DescriptionOutlinedIcon />,
    roles: [ROLES.SCHOOL_HEALTH_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Kiểm tra Nguyên liệu",
    icon: <HealthAndSafetyOutlinedIcon />,
    // Màn hình dùng cho Y tế, Phụ huynh, Kho
    roles: [
      ROLES.SCHOOL_HEALTH_OFFICER,
      ROLES.PARENTS_COMMITTEE,
      ROLES.INGREDIENT_MANAGEMENT,
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
    label: "Thực đơn đã lên",
    icon: <RestaurantMenuOutlinedIcon />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_BATCHES,
    label: "Mẻ chế biến",
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
    key: ROUTER.SCHOOL_DAILY_CONFIRM,
    label: "Báo suất ăn & Dị ứng lớp",
    icon: <HowToRegOutlinedIcon />,
    roles: [ROLES.HOMEROOM_TEACHER],
  },
  {
    key: ROUTER.SCHOOL_WAREHOUSE,
    label: "Quản lý Kho Nguyên liệu",
    icon: <WarehouseOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_MEAL_FEEDBACK,
    label: "Ý kiến & Phản ánh Bữa ăn",
    icon: <ChatBubbleOutlineOutlinedIcon />,
    roles: [ROLES.PARENTS_COMMITTEE, ROLES.HOMEROOM_TEACHER, ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
]
