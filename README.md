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

Cấu hình `.env` từ `.env.example`: `VITE_API_ROOT=http://localhost:5000/api`. Đăng nhập bằng tên tài khoản/email và mật khẩu backend. SYSTEM_ADMIN tự chuyển vào **Hồ sơ đăng ký**. Chi tiết hợp đồng và giới hạn hiện tại: [SA-05 / SA-06](docs/registration-screens.md). Kiểm tra tích hợp service bằng `npm run test:registration`.

Đăng nhập/đăng ký đã dựng theo Figma, dùng cookie HttpOnly, CSRF và refresh phiên. Các tab đăng ký nằm ở `/register?type=SCHOOL` và `/register?type=SUPPLIER`. Xem [luồng xác thực và các API còn thiếu](docs/auth-screens.md).

---

## 2. Kiến Trúc Phân Quyền 2 Tầng (2-Tier RBAC)

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

## 3. Quy Chuẩn Code & Styling (BẮT BUỘC ĐỌC)

> Xem chi tiết đầy đủ tại file: **`ai_coding_rule.md`**

1. **Styling bằng Class SCSS thuần:** Tuyệt đối **KHÔNG** dùng `styled-components`. Tận dụng bộ utility SCSS toàn cục tại `src/assets/scss/` (`d-flex`, `mt-...`, `fs-...`, `fw-...`) và viết class SCSS theo chuẩn BEM trong file `styles.scss` riêng.
2. **Cấu trúc Page:** Gốc của Page chỉ chứa duy nhất `index.jsx`. Mọi component con, modal và file `styles.scss` bắt buộc nằm trong thư mục con `components/`.
3. **Services API:** Không gọi axios trong UI. Gom API theo từng Domain Service trong `src/services/[Feature]Service/` (gồm `urls.js` và `index.js`).
4. **Phân quyền:** 1 account = 1 role (`user.role: string`). Check quyền qua `hasPermission(allowedRoles, user.role)`.

---

## 4. Cấu Trúc Thư Mục

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
│   └── roles.js                # Khai báo ORG_TYPES, ROLES
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
│   └── AuthService/            # Xử lý login, logout
└── theme/                      # Ant Design ConfigProvider
```
