import React, { lazy, Suspense } from "react"
import { useRoutes } from "react-router-dom"
import SpinCustom from "src/components/SpinCustom"
import MainLayout, { AuthLayout, PublicLayout } from "src/components/Layout"
import AccountLayout from "src/components/Layout/AccountLayout/AccountLayout"
import { ORG_TYPES, ROLES } from "src/constants/roles"
import ROUTER from "./ROUTER"

// Lazy load Pages
const PlatformHome = lazy(() => import("src/pages/ANONYMOUS/PlatformHome"))
const ProfilePage = lazy(() => import("src/pages/ANONYMOUS/Profile"))
const ChangePassword = lazy(() => import("src/pages/ANONYMOUS/ChangePassword"))
const SchoolLanding = lazy(() => import("src/pages/ANONYMOUS/SchoolLanding"))
const LoginPage = lazy(() => import("src/pages/ANONYMOUS/Login"))
const RegisterPage = lazy(() => import("src/pages/ANONYMOUS/Register"))
const RegistrationProfile = lazy(() => import("src/pages/ANONYMOUS/RegistrationProfile"))
const RegistrationStatus = lazy(() => import("src/pages/ANONYMOUS/RegistrationStatus"))
const AccountActivation = lazy(() => import("src/pages/ANONYMOUS/AccountActivation"))
const ForgotPassword = lazy(() => import("src/pages/ANONYMOUS/ForgotPassword"))
const Forbidden = lazy(() => import("src/pages/SUPPORTPAGES/Forbidden"))
const NotFound = lazy(() => import("src/pages/SUPPORTPAGES/NotFound"))
const RoleRoute = lazy(() => import("src/pages/SUPPORTPAGES/RoleRoute"))

// SYSTEM pages
const OrgApproval = lazy(() => import("src/pages/SYSTEM/OrgApproval"))
const OrgApprovalDetail = lazy(() => import("src/pages/SYSTEM/OrgApprovalDetail"))

// SUPPLIER pages
const SupplierOverview = lazy(() => import("src/pages/SUPPLIER/SupplierOverview"))
const IngredientCatalog = lazy(() => import("src/pages/SUPPLIER/IngredientCatalog"))
const SupplyOrders = lazy(() => import("src/pages/SUPPLIER/SupplyOrders"))

// SCHOOL pages
const SchoolOverview = lazy(() => import("src/pages/SCHOOL/SchoolOverview"))
const SchoolAdministration = lazy(() => import("src/pages/SCHOOL/Administration"))
const MenuApproval = lazy(() => import("src/pages/SCHOOL/MenuApproval"))
const MenuPlanning = lazy(() => import("src/pages/SCHOOL/MenuPlanning"))
const KitchenCooking = lazy(() => import("src/pages/SCHOOL/KitchenCooking"))
const KitchenBatches = lazy(() => import("src/pages/SCHOOL/KitchenCooking/CookingBatches"))
const KitchenCreateBatch = lazy(() => import("src/pages/SCHOOL/KitchenCooking/CreateBatch"))
const KitchenCreateBatchSeparate = lazy(() => import("src/pages/SCHOOL/KitchenCooking/CreateBatchSeparate"))
const KitchenBatchDetail = lazy(() => import("src/pages/SCHOOL/KitchenCooking/BatchDetail"))
const DailyMealConfirm = lazy(() => import("src/pages/SCHOOL/DailyMealConfirm"))
const IngredientInspect = lazy(() => import("src/pages/SCHOOL/IngredientInspect"))
const WarehouseManage = lazy(() => import("src/pages/SCHOOL/WarehouseManage"))
const MealFeedback = lazy(() => import("src/pages/SCHOOL/MealFeedback"))

function LazyWrapper({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <SpinCustom />
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

  {
    element: <AccountLayout />,
    children: [
      { path: ROUTER.PROFILE, element: <LazyWrapper><ProfilePage /></LazyWrapper> },
      { path: ROUTER.CHANGE_PASSWORD, element: <LazyWrapper><ChangePassword /></LazyWrapper> },
      { path: ROUTER.REGISTRATION_PROFILE, element: <LazyWrapper><RegistrationProfile /></LazyWrapper> },
      { path: ROUTER.REGISTRATION_STATUS, element: <LazyWrapper><RegistrationStatus /></LazyWrapper> },
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
      { path: ROUTER.REGISTER, element: <LazyWrapper><RegisterPage /></LazyWrapper> },
      { path: ROUTER.TEST_LOGIN, element: <LazyWrapper><LoginPage /></LazyWrapper> },
      { path: ROUTER.ACTIVATE_ACCOUNT, element: <LazyWrapper><AccountActivation /></LazyWrapper> },
      { path: ROUTER.FORGOT_PASSWORD, element: <LazyWrapper><ForgotPassword /></LazyWrapper> },
      { path: ROUTER.PASSWORD_RECOVERY_CODE, element: <LazyWrapper><ForgotPassword /></LazyWrapper> },
      { path: ROUTER.RESET_PASSWORD, element: <LazyWrapper><ForgotPassword /></LazyWrapper> },
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
          { path: ROUTER.SYSTEM_ORG_APPROVAL, element: <LazyWrapper><OrgApproval /></LazyWrapper> },
          { path: ROUTER.SYSTEM_ORG_APPROVAL_DETAIL, element: <LazyWrapper><OrgApprovalDetail /></LazyWrapper> },
        ],
      },
    ],
  },

  // 5. Phân hệ SUPPLIER (Bảo vệ: Chỉ INGREDIENT_SUPPLIER)
  {
    element: (
      <LazyWrapper>
        <RoleRoute
          allowedOrg={ORG_TYPES.SUPPLIER}
          allowedRoles={[
            ROLES.INGREDIENT_SUPPLIER_ADMIN,
            ROLES.INGREDIENT_SUPPLIER_STAFF,
            ROLES.INGREDIENT_SUPPLIER,
          ]}
        />
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
      {
        element: <MainLayout type="SCHOOL" />,
        children: [
          // Tổng quan trường học
          {
            path: ROUTER.SCHOOL_OVERVIEW,
            element: <LazyWrapper><SchoolOverview /></LazyWrapper>,
          },

          {
            element: <RoleRoute allowedRoles={[ROLES.SCHOOL_ADMIN]} />,
            children: [
              { path: ROUTER.SCHOOL_ADMINISTRATION, element: <LazyWrapper><SchoolAdministration /></LazyWrapper> },
            ],
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

          // Kiểm tra nguyên liệu đầu vào: Y tế, Ban Phụ huynh, Kho, Nhân viên Bếp (Đánh giá nguyên liệu)
          {
            element: <RoleRoute allowedRoles={[ROLES.SCHOOL_HEALTH_OFFICER, ROLES.PARENTS_COMMITTEE, ROLES.INGREDIENT_MANAGEMENT, ROLES.SCHOOL_KITCHEN_STAFF]} />,
            children: [
              { path: ROUTER.SCHOOL_INGREDIENT_INSPECT, element: <LazyWrapper><IngredientInspect /></LazyWrapper> },
            ],
          },

          // Vận hành Bếp ăn: Nhân viên Bếp, School Admin (Các trang chuyên biệt của Bếp)
          {
            element: <RoleRoute allowedRoles={[ROLES.SCHOOL_KITCHEN_STAFF, ROLES.SCHOOL_ADMIN]} />,
            children: [
              { path: ROUTER.SCHOOL_KITCHEN_COOKING, element: <LazyWrapper><KitchenCooking /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_MENU, element: <LazyWrapper><KitchenCooking /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_BATCHES, element: <LazyWrapper><KitchenBatches /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_BATCH_CREATE, element: <LazyWrapper><KitchenCreateBatch /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_CREATE_BATCH, element: <LazyWrapper><KitchenCreateBatch /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_BATCH_CREATE_SEPARATE, element: <LazyWrapper><KitchenCreateBatchSeparate /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_CREATE_BATCH_SEPARATE, element: <LazyWrapper><KitchenCreateBatchSeparate /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL, element: <LazyWrapper><KitchenBatchDetail /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION, element: <LazyWrapper><KitchenCooking /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_INGREDIENTS, element: <LazyWrapper><KitchenCooking /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_SAMPLES, element: <LazyWrapper><KitchenCooking /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_HANDOVER, element: <LazyWrapper><KitchenCooking /></LazyWrapper> },
              { path: ROUTER.SCHOOL_KITCHEN_TRACEABILITY, element: <LazyWrapper><KitchenCooking /></LazyWrapper> },
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
