import React from "react"
import {
  Building2,
  ChefHat,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShieldAlert,
  Truck,
  UserCheck,
  Utensils,
  Warehouse,
} from "lucide-react"
import { ROLES } from "src/constants/roles"
import ROUTER from "./ROUTER"

/**
 * Menu dành cho phân hệ Quản trị Hệ thống (SYSTEM)
 */
export const MenuItemSystem = () => [
  {
    key: ROUTER.SYSTEM_OVERVIEW,
    label: "Tổng quan Hệ thống",
    icon: <LayoutDashboard size={18} />,
    roles: [ROLES.SYSTEM_ADMIN],
  },
  {
    key: ROUTER.SYSTEM_ORG_APPROVAL,
    label: "Xét duyệt Tổ chức",
    icon: <Building2 size={18} />,
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
    icon: <LayoutDashboard size={18} />,
    roles: [ROLES.INGREDIENT_SUPPLIER],
  },
  {
    key: ROUTER.SUPPLIER_INGREDIENTS,
    label: "Danh mục Nguyên liệu",
    icon: <Package size={18} />,
    roles: [ROLES.INGREDIENT_SUPPLIER],
  },
  {
    key: ROUTER.SUPPLIER_ORDERS,
    label: "Đơn hàng Cung ứng",
    icon: <Truck size={18} />,
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
    icon: <LayoutDashboard size={18} />,
    roles: [
      ROLES.SCHOOL_ADMIN,
      ROLES.SCHOOL_MANAGEMENT_BOARD,
      ROLES.SCHOOL_HEALTH_OFFICER,
      ROLES.SCHOOL_KITCHEN_STAFF,
      ROLES.HOMEROOM_TEACHER,
      ROLES.PARENTS_COMMITTEE,
      ROLES.INGREDIENT_MANAGEMENT,
    ],
  },
  {
    key: ROUTER.SCHOOL_MENU_APPROVAL,
    label: "Phê duyệt Thực đơn",
    icon: <ClipboardCheck size={18} />,
    roles: [ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
  {
    key: ROUTER.SCHOOL_MENU_PLANNING,
    label: "Lập Thực đơn & Giám sát Dị ứng",
    icon: <FileText size={18} />,
    roles: [ROLES.SCHOOL_HEALTH_OFFICER],
  },
  {
    key: ROUTER.SCHOOL_INGREDIENT_INSPECT,
    label: "Kiểm tra Nguyên liệu",
    icon: <ShieldAlert size={18} />,
    // Màn hình dùng chung cho 3 bộ phận
    roles: [
      ROLES.SCHOOL_HEALTH_OFFICER,
      ROLES.PARENTS_COMMITTEE,
      ROLES.INGREDIENT_MANAGEMENT,
    ],
  },
  {
    key: ROUTER.SCHOOL_KITCHEN_COOKING,
    label: "Chế biến & Lưu mẫu thực phẩm",
    icon: <ChefHat size={18} />,
    roles: [ROLES.SCHOOL_KITCHEN_STAFF],
  },
  {
    key: ROUTER.SCHOOL_DAILY_CONFIRM,
    label: "Báo suất ăn & Dị ứng lớp",
    icon: <UserCheck size={18} />,
    roles: [ROLES.HOMEROOM_TEACHER],
  },
  {
    key: ROUTER.SCHOOL_WAREHOUSE,
    label: "Quản lý Kho Nguyên liệu",
    icon: <Warehouse size={18} />,
    roles: [ROLES.INGREDIENT_MANAGEMENT],
  },
  {
    key: ROUTER.SCHOOL_MEAL_FEEDBACK,
    label: "Ý kiến & Phản ánh Bữa ăn",
    icon: <MessageSquare size={18} />,
    roles: [ROLES.PARENTS_COMMITTEE, ROLES.HOMEROOM_TEACHER, ROLES.SCHOOL_MANAGEMENT_BOARD],
  },
]
