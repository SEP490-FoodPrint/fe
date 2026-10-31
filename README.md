# FoodPrint Frontend (Base Project)

Hệ thống Quản lý và Truy xuất Nguồn gốc Suất ăn Học đường.

---

## 1. Khởi Chạy Dự Án

```bash
# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi chạy môi trường phát triển (Port 3001)
npm run dev

# Build production
npm run build
```

Truy cập: [http://localhost:3001](http://localhost:3001)

Cấu hình `.env` từ `.env.example`: `VITE_API_ROOT=http://localhost:5000/api`, `VITE_USE_MOCK=false` để dùng API thật. Đăng nhập bằng tên tài khoản/email và mật khẩu backend. SYSTEM_ADMIN tự chuyển vào **Hồ sơ đăng ký**. Chi tiết hợp đồng và giới hạn hiện tại: [SA-05 / SA-06](docs/registration-screens.md). Kiểm tra tích hợp service bằng `npm run test:registration`.

Đăng nhập/đăng ký đã dựng theo Figma, dùng cookie HttpOnly, CSRF và refresh phiên. Các tab đăng ký nằm ở `/register?type=SCHOOL` và `/register?type=SUPPLIER`. Xem [luồng xác thực và các API còn thiếu](docs/auth-screens.md).

---

## 2. Danh Sách 9 Vai Trò & Tài Khoản Test Nhanh (1 Account = 1 Role)

Chỉ khi `VITE_USE_MOCK=true`, trang Đăng nhập (`/login`) có danh sách click 1 chạm để đăng nhập demo. Các tài khoản bên dưới không phải tài khoản backend:

| Nhóm Tổ Chức (`orgType`) | Tên Vai Trò (`role`) | Tài khoản Test | Họ và tên |
| :--- | :--- | :--- | :--- |
| **SYSTEM** | `SYSTEM_ADMIN` | `system_admin` | Nguyễn Văn Toàn |
| **SUPPLIER** | `INGREDIENT_SUPPLIER` | `supplier_fresh` | Trần Thị Bích |
| **SCHOOL** | `SCHOOL_ADMIN` | `school_admin` | Phạm Hải Đăng |
| | `SCHOOL_MANAGEMENT_BOARD` | `school_bgh` | ThS. Lê Hoàng Nam (Hiệu trưởng) |
| | `SCHOOL_HEALTH_OFFICER` | `school_health` | BS. Nguyễn Mai Lan (Cán bộ Y tế) |
| | `SCHOOL_KITCHEN_STAFF` | `school_kitchen` | Đầu bếp Vũ Đình Trọng |
| | `HOMEROOM_TEACHER` | `school_teacher` | Cô Hoàng Thu Trang (GVCN 3A1) |
| | `PARENTS_COMMITTEE` | `school_parents` | Ông Bùi Quốc Tuấn (Trưởng Ban PH) |
| | `INGREDIENT_MANAGEMENT_DEPARTMENT` | `school_warehouse` | Đỗ Minh Quân (Quản lý Kho) |

---

## 3. Kiến Trúc Phân Quyền 2 Tầng (2-Tier RBAC)

1. **Tầng 1 - Cổng tổ chức (`allowedOrg`):**
   - `/system/*` chỉ dành cho `SYSTEM`
   - `/supplier/*` chỉ dành cho `SUPPLIER`
   - `/school/*` chỉ dành cho `SCHOOL`
2. **Tầng 2 - Vai trò nghiệp vụ (`allowedRoles`):**
   - Mỗi route hoặc menu item khai báo mảng `roles: [ROLES.A, ROLES.B]`.
   - Hàm `hasPermission(allowedRoles, user.role)` sẽ so sánh trực tiếp với chuỗi `user.role` từ `StoreContext`.
   - Nếu không đủ quyền -> Chuyển hướng sang màn hình lỗi `403 (Forbidden)`.
   - Sidebar tự động ẩn các mục menu mà user không có quyền.

---

## 4. Công Cụ Hỗ Trợ Dev: Role Switcher Widget

Chỉ trong chế độ demo (`VITE_USE_MOCK=true`), góc dưới bên phải màn hình có nút nổi **"Đổi Vai Trò"** để kiểm tra:
- Menu Sidebar thay đổi theo role mới.
- Quyền truy cập các trang được kiểm tra ngay lập tức mà không cần đăng xuất ra đăng nhập lại.

---

## 5. Quy Chuẩn Code & Styling (BẮT BUỘC ĐỌC)

> Xem chi tiết đầy đủ tại file: **`ai_coding_rule.md`**

1. **Styling bằng Class SCSS thuần:** Tuyệt đối **KHÔNG** dùng `styled-components`. Tận dụng bộ utility SCSS toàn cục tại `src/assets/scss/` (`d-flex`, `mt-...`, `fs-...`, `fw-...`) và viết class SCSS theo chuẩn BEM trong file `styles.scss` riêng.
2. **Cấu trúc Page:** Gốc của Page chỉ chứa duy nhất `index.jsx`. Mọi component con, modal và file `styles.scss` bắt buộc nằm trong thư mục con `components/`.
3. **Services API:** Không gọi axios trong UI. Gom API theo từng Domain Service trong `src/services/[Feature]Service/` (gồm `urls.js` và `index.js`).
4. **Phân quyền:** 1 account = 1 role (`user.role: string`). Check quyền qua `hasPermission(allowedRoles, user.role)`.

---

## 6. Cấu Trúc Thư Mục

```text
src/
├── assets/                     # Scss utility, fonts, images
├── components/
│   ├── Boundary/               # Error Boundary
│   ├── Common/                 # ExamplePageStub, RoleSwitcher widget
│   ├── Layout/                 # MainLayout (Sidebar tự lọc role), TopHeader, DefaultAction
│   ├── Notice/                 # Notice thông báo toast
│   └── SpinCustom/             # Spin loading toàn màn hình
├── constants/
│   └── roles.js                # Khai báo ORG_TYPES, ROLES, MOCK_ACCOUNTS
├── contexts/
│   └── index.jsx               # StoreContext (isLoginContext, user)
├── lib/
│   ├── storage.js              # LocalStorage helper
│   └── utils.jsx               # hasPermission(allowedRoles, userRole)
├── pages/
│   ├── ANONYMOUS/Login/        # Trang đăng nhập kèm quick-switch
│   ├── SUPPORTPAGES/           # Forbidden 403, NotFound 404, RoleRoute guard
│   ├── SYSTEM/                 # OrgApproval (hồ sơ đăng ký), OrgApprovalDetail (xét duyệt hồ sơ)
│   ├── SUPPLIER/               # SupplierOverview, IngredientCatalog, SupplyOrders (empty stubs)
│   └── SCHOOL/                 # MenuApproval, MenuPlanning, KitchenCooking, DailyMealConfirm, IngredientInspect, WarehouseManage, MealFeedback
├── router/
│   ├── ROUTER.js               # Khai báo đường dẫn router
│   ├── MenuItem.jsx            # Cấu hình MenuItem có gắn roles: [...]
│   └── AppRouter.jsx           # AppRouter bọc qua RoleRoute
├── services/
│   ├── 01_axios/               # Cookie credentials, CSRF và refresh phiên
│   └── AuthService/            # Xử lý login, mockLoginByRole, logout
└── theme/                      # Ant Design ConfigProvider
```
