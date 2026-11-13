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
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined"
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
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
];

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
        key: ROUTER.SCHOOL_ACADEMIC_YEARS,
        label: "Thiết lập niên khóa",
        icon: <CalendarMonthOutlinedIcon />,
        roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
      },
    ],
  },
  {
    key: ROUTER.SCHOOL_CLASS_ASSIGNMENT,
    label: "Lớp học & GVCN",
    icon: <AssignmentIndOutlinedIcon />,
    roles: [ROLES.SCHOOL_MANAGEMENT_BOARD],
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
    label: "Đánh giá giao hàng",
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
    label: "Thực đơn tuần học đường",
    icon: <RestaurantMenuOutlinedIcon />,
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
    key: ROUTER.SCHOOL_DAILY_CONFIRM,
    label: "Báo suất ăn & Dị ứng lớp",
    icon: <HowToRegOutlinedIcon />,
    roles: [ROLES.HOMEROOM_TEACHER],
  },

  // === CÁC TÍNH NĂNG CHUYÊN BIỆT CHO BỘ PHẬN QUẢN LÝ KHO & NGUYÊN LIỆU (INGREDIENT_MANAGEMENT) - 7 MỤC QUY CHUẨN ===
  {
    key: ROUTER.SCHOOL_INGREDIENT_OVERVIEW,
    label: "Tổng quan",
    icon: <DashboardOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_CATALOG,
    label: "Danh mục nguyên liệu",
    icon: <Inventory2OutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_WAREHOUSE,
    label: "Kho đồ khô",
    icon: <WarehouseOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_ORDERS,
    label: "Phiếu nhập hàng",
    icon: <ReceiptLongOutlinedIcon />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_ORDER_TRACKING,
    label: "Theo dõi đơn hàng",
    icon: <LocalShippingOutlinedIcon />,
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
];
