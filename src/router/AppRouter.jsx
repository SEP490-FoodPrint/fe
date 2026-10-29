import React, { lazy, Suspense } from "react"
import { useRoutes } from "react-router-dom"
import SpinCustom from "src/components/SpinCustom"
import MainLayout, { AuthLayout, PublicLayout } from "src/components/Layout"
import { ORG_TYPES, ROLES } from "src/constants/roles"
import ROUTER from "./ROUTER"

// Lazy load Pages
const PlatformHome = lazy(() => import("src/pages/ANONYMOUS/PlatformHome"))
const SchoolLanding = lazy(() => import("src/pages/ANONYMOUS/SchoolLanding"))
const LoginPage = lazy(() => import("src/pages/ANONYMOUS/Login"))
const Forbidden = lazy(() => import("src/pages/SUPPORTPAGES/Forbidden"))
const NotFound = lazy(() => import("src/pages/SUPPORTPAGES/NotFound"))
const RoleRoute = lazy(() => import("src/pages/SUPPORTPAGES/RoleRoute"))

// SYSTEM pages
const SystemOverview = lazy(() => import("src/pages/SYSTEM/SystemOverview"))
const OrgApproval = lazy(() => import("src/pages/SYSTEM/OrgApproval"))

// SUPPLIER pages
const SupplierOverview = lazy(() => import("src/pages/SUPPLIER/SupplierOverview"))
const IngredientCatalog = lazy(() => import("src/pages/SUPPLIER/IngredientCatalog"))
const SupplyOrders = lazy(() => import("src/pages/SUPPLIER/SupplyOrders"))

// SCHOOL pages
const SchoolOverview = lazy(() => import("src/pages/SCHOOL/SchoolOverview"))
const MenuApproval = lazy(() => import("src/pages/SCHOOL/MenuApproval"))
const MenuPlanning = lazy(() => import("src/pages/SCHOOL/MenuPlanning"))
const KitchenCooking = lazy(() => import("src/pages/SCHOOL/KitchenCooking"))
const KitchenBatches = lazy(() => import("src/pages/SCHOOL/KitchenCooking/CookingBatches"))
const KitchenCreateBatch = lazy(() => import("src/pages/SCHOOL/KitchenCooking/CreateBatch"))
const DailyMealConfirm = lazy(() => import("src/pages/SCHOOL/DailyMealConfirm"))
const IngredientInspect = lazy(() => import("src/pages/SCHOOL/IngredientInspect"))
const WarehouseManage = lazy(() => import("src/pages/SCHOOL/WarehouseManage"))
const MealFeedback = lazy(() => import("src/pages/SCHOOL/MealFeedback"))

function LazyWrapper({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <SpinCustom fullscreen />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

const routes = [
  // 1. Trang chủ Nền tảng FoodPrint (Công khai)
  {
    element: <PublicLayout />,
    children: [
      {
        path: ROUTER.DEFAULT,
        element: (
          <LazyWrapper>
            <PlatformHome />
          </LazyWrapper>
        ),
      },
    ],
  },

  // 2. Trang Cổng thông tin & Thực đơn Trường học (Công khai)
  {
    path: ROUTER.SCHOOL_LANDING,
    element: (
      <LazyWrapper>
        <SchoolLanding />
      </LazyWrapper>
    ),
  },

  // 3. Trang Đăng nhập (Công khai với AuthLayout)
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTER.LOGIN,
        element: (
          <LazyWrapper>
            <LoginPage />
          </LazyWrapper>
        ),
      },
    ],
  },

  // 4. Phân hệ SYSTEM (Bảo vệ: Chỉ SYSTEM_ADMIN)
  {
    element: (
      <LazyWrapper>
        <RoleRoute allowedOrg={ORG_TYPES.SYSTEM} allowedRoles={[ROLES.SYSTEM_ADMIN]} />
      </LazyWrapper>
    ),
    children: [
      {
        element: <MainLayout type="SYSTEM" />,
        children: [
          { path: ROUTER.SYSTEM_OVERVIEW, element: <LazyWrapper><SystemOverview /></LazyWrapper> },
          { path: ROUTER.SYSTEM_ORG_APPROVAL, element: <LazyWrapper><OrgApproval /></LazyWrapper> },
        ],
      },
    ],
  },

  // 5. Phân hệ SUPPLIER (Bảo vệ: Chỉ INGREDIENT_SUPPLIER)
  {
    element: (
      <LazyWrapper>
        <RoleRoute allowedOrg={ORG_TYPES.SUPPLIER} allowedRoles={[ROLES.INGREDIENT_SUPPLIER]} />
      </LazyWrapper>
    ),
    children: [
      {
        element: <MainLayout type="SUPPLIER" />,
        children: [
          { path: ROUTER.SUPPLIER_OVERVIEW, element: <LazyWrapper><SupplierOverview /></LazyWrapper> },
          { path: ROUTER.SUPPLIER_INGREDIENTS, element: <LazyWrapper><IngredientCatalog /></LazyWrapper> },
          { path: ROUTER.SUPPLIER_ORDERS, element: <LazyWrapper><SupplyOrders /></LazyWrapper> },
        ],
      },
    ],
  },

  // 6. Phân hệ SCHOOL (Bảo vệ: Cổng SCHOOL + phân quyền chi tiết từng Role)
  {
    element: (
      <LazyWrapper>
        <RoleRoute allowedOrg={ORG_TYPES.SCHOOL} />
      </LazyWrapper>
    ),
    children: [
      // 6.1. Bếp ăn trường học (Nhân viên Bếp / Bếp trưởng) - Giao diện chuẩn Stitch với Sidebar xanh #0A8066
      {
        element: (
          <RoleRoute
            allowedRoles={[ROLES.SCHOOL_KITCHEN_STAFF, ROLES.SCHOOL_ADMIN]}
          />
        ),
        children: [
          {
            path: ROUTER.SCHOOL_KITCHEN_COOKING,
            element: (
              <LazyWrapper>
                <KitchenCooking />
              </LazyWrapper>
            ),
          },
          {
            path: ROUTER.SCHOOL_KITCHEN_CREATE_BATCH,
            element: (
              <LazyWrapper>
                <KitchenCreateBatch />
              </LazyWrapper>
            ),
          },
          {
            path: ROUTER.SCHOOL_KITCHEN_BATCHES,
            element: (
              <LazyWrapper>
                <KitchenBatches />
              </LazyWrapper>
            ),
          },
        ],
      },

      // 6.2. Các phân hệ trường học dùng khung quản trị chung
      {
        element: <MainLayout type="SCHOOL" />,
        children: [
          // Tổng quan trường học: Cả 7 roles đều được vào
          {
            path: ROUTER.SCHOOL_OVERVIEW,
            element: <LazyWrapper><SchoolOverview /></LazyWrapper>,
          },

          // Duyệt thực đơn: Ban Giám Hiệu, School Admin
          {
            element: <RoleRoute allowedRoles={[ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_MANAGEMENT_BOARD]} />,
            children: [
              { path: ROUTER.SCHOOL_MENU_APPROVAL, element: <LazyWrapper><MenuApproval /></LazyWrapper> },
            ],
          },

          // Lập thực đơn & cảnh báo dị ứng: Ban Y tế
          {
            element: <RoleRoute allowedRoles={[ROLES.SCHOOL_HEALTH_OFFICER]} />,
            children: [
              { path: ROUTER.SCHOOL_MENU_PLANNING, element: <LazyWrapper><MenuPlanning /></LazyWrapper> },
            ],
          },

          // Kiểm tra nguyên liệu đầu vào: Y tế, Ban Phụ huynh, Kho
          {
            element: <RoleRoute allowedRoles={[ROLES.SCHOOL_HEALTH_OFFICER, ROLES.PARENTS_COMMITTEE, ROLES.INGREDIENT_MANAGEMENT]} />,
            children: [
              { path: ROUTER.SCHOOL_INGREDIENT_INSPECT, element: <LazyWrapper><IngredientInspect /></LazyWrapper> },
            ],
          },

          // Báo suất ăn & dị ứng lớp: Giáo viên chủ nhiệm
          {
            element: <RoleRoute allowedRoles={[ROLES.HOMEROOM_TEACHER]} />,
            children: [
              { path: ROUTER.SCHOOL_DAILY_CONFIRM, element: <LazyWrapper><DailyMealConfirm /></LazyWrapper> },
            ],
          },

          // Quản lý kho: Bộ phận nguyên liệu / kho
          {
            element: <RoleRoute allowedRoles={[ROLES.INGREDIENT_MANAGEMENT]} />,
            children: [
              { path: ROUTER.SCHOOL_WAREHOUSE, element: <LazyWrapper><WarehouseManage /></LazyWrapper> },
            ],
          },

          // Phản ánh bữa ăn: Ban Phụ huynh, GVCN, Ban Giám hiệu
          {
            element: <RoleRoute allowedRoles={[ROLES.PARENTS_COMMITTEE, ROLES.HOMEROOM_TEACHER, ROLES.SCHOOL_MANAGEMENT_BOARD]} />,
            children: [
              { path: ROUTER.SCHOOL_MEAL_FEEDBACK, element: <LazyWrapper><MealFeedback /></LazyWrapper> },
            ],
          },
        ],
      },
    ],
  },

  // 7. Trang lỗi 403 & 404
  {
    path: ROUTER.FORBIDDEN,
    element: <LazyWrapper><Forbidden /></LazyWrapper>,
  },
  {
    path: "*",
    element: <LazyWrapper><NotFound /></LazyWrapper>,
  },
]

function AppRouter() {
  const element = useRoutes(routes)
  return element
}

export default AppRouter
