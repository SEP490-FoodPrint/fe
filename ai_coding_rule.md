# AI Coding Guidelines & Frontend Architecture (FoodPrint FE)

> **CRITICAL INSTRUCTION FOR ALL AI ASSISTANTS & DEVELOPERS:**
> Đây là bộ quy chuẩn kiến trúc bắt buộc cho dự án **FoodPrint Frontend**. Bất kỳ ai (kể cả AI Assistant hay Developer) khi thực hiện code tính năng mới, tạo trang mới hoặc sửa đổi giao diện **PHẢI TUÂN THỦ 100% CÁC NGUYÊN TẮC DƯỚI ĐÂY**.

---

## 1. Nguyên Tắc về UI & Styling (CSS/SCSS Là Tiêu Chuẩn Duy Nhất)

### ❌ CÁC ĐIỀU TUYỆT ĐỐI CẤM:
1. **KHÔNG DÙNG STYLED-COMPONENTS:** Tuyệt đối không import hoặc sử dụng `styled-components` (`styled.div`, `styled(Button)`,...), không viết CSS-in-JS.
2. **KHÔNG DÙNG ANTD LÀM KHUNG GIAO DIỆN CHÍNH:** Không phụ thuộc vào các component bọc style của Ant Design (như `Typography.Title`, `Col`, `Row`, `Space` bọc tràn lan). 
   - *Lưu ý:* Chỉ sử dụng Ant Design cho các **component tương tác phức tạp có sẵn logic/behavior** (như `Table`, `Modal`, `DatePicker`, `Select`, `Pagination`, `Dropdown`, `Popconfirm`). 

### ✅ TIÊU CHUẨN STYLING BẮT BUỘC (CLASS SCSS):
1. **Sử dụng thẻ HTML ngữ nghĩa chuẩn:** Dùng các thẻ HTML bản địa (`<div>`, `<section>`, `<header>`, `<button>`, `<input>`, `<h1>`-`<h6>`, `<span>`, `<ul>`, `<li>`,...) kết hợp `className`.
2. **Tận dụng bộ SCSS Utility toàn cục:** Dự án đã tích hợp sẵn hệ thống class tiện ích tại `src/assets/scss/`:
   - **Flexbox:** `d-flex`, `flex-column`, `justify-content-center`, `justify-content-between`, `align-items-center`, `gap-8`, `gap-16`,...
   - **Spacing (Margin/Padding):** `mt-8`, `mt-16`, `mb-12`, `mb-24`, `pt-16`, `pb-16`, `pl-8`, `pr-8`,...
   - **Typography:** `fs-13`, `fs-14`, `fs-16`, `fs-18`, `fs-24`, `fw-500`, `fw-600`, `fw-700`, `text-center`, `text-right`,...
   - **Layout/Kích thước:** `w-100`, `h-100`, `pointer`, `cursor-pointer`,...
3. **Quy chuẩn đặt tên class SCSS:**
   - Mỗi Component/Page tạo file `styles.scss` riêng và viết class theo phương pháp **BEM (Block__Element--Modifier)** hoặc scoped class rõ ràng.
   - Không viết inline styles `style={{ ... }}` trừ các giá trị tính toán động (dynamic inline values).

*Ví dụ chuẩn:*
```scss
/* src/pages/SCHOOL/MenuApproval/components/styles.scss */
.menu-approval-card {
  background-color: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #1677ff;
    margin: 0;
  }

  &__badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;

    &--approved {
      background-color: #e6f7ff;
      color: #1677ff;
    }
  }

  &__content {
    padding: 20px;
  }
}
```

---

## 2. Nguyên Tắc về Cấu Trúc Thư Mục Page (Component Structure Rule)

Để giữ cho cấu trúc code luôn ngăn nắp và nhất quán giữa các phân hệ:

1. Thư mục gốc của một Page (Ví dụ: `src/pages/SCHOOL/MenuApproval/`) **CHỈ ĐƯỢC CHỨA DUY NHẤT** file `index.jsx`.
2. Tuyệt đối **KHÔNG ĐƯỢC** để các file css/scss hay các component con lộn xộn ở thư mục gốc của Page.
3. **TẤT CẢ** component con, modal, table, filter bar và file styling (`styles.scss`) **BẮT BUỘC PHẢI NẰM TRONG** thư mục `components/` bên trong Page đó.

*Mô hình chuẩn:*
```text
src/pages/SCHOOL/MenuApproval/
├── index.jsx                    <-- CHỈ CHỨA file này (Page orchestrator)
└── components/                  <-- TẤT CẢ component con và SCSS gom vào đây
    ├── ApprovalHeader.jsx
    ├── ApprovalTable.jsx
    ├── ModalDetail.jsx
    └── styles.scss              <-- File SCSS định kiểu cho cả page này
```

---

## 3. Nguyên Tắc về Services & Gọi API (Domain-Driven Services)

Cấu trúc tổ chức API trong dự án bắt buộc phải tuân theo mô hình **Domain-Driven Services** (tách biệt URL và Logic gọi API).

Khi thêm một luồng tính năng mới (Ví dụ: Quản lý Suất ăn `MealService`), bạn **BẮT BUỘC** làm theo các bước:

1. Tạo thư mục tương ứng trong `src/services/` (Ví dụ: `src/services/MealService/`).
2. Tạo file `urls.js` chuyên chứa các hằng số endpoint URL:
   ```javascript
   export const apiGetDailyMeals = "/school/daily-meals"
   export const apiConfirmMealCount = "/school/confirm-meal-count"
   ```
3. Tạo file `index.js` import `01_axios` và export các method:
   ```javascript
   import http from "../01_axios"
   import { apiGetDailyMeals, apiConfirmMealCount } from "./urls"

   const getDailyMeals = (params) => http.get(apiGetDailyMeals, { params })
   const confirmMealCount = (body) => http.post(apiConfirmMealCount, body)

   const MealService = {
     getDailyMeals,
     confirmMealCount,
   }

   export default MealService
   ```
4. **Tại file UI (`.jsx`):** Tuyệt đối không dùng `axios.get` hay `fetch` trực tiếp, mà phải import Service này vào để gọi: `await MealService.getDailyMeals()`.
5. Luôn bọc hàm gọi API trong khối `try...catch...finally` để quản lý trạng thái `loading` và hiển thị thông báo qua `notice` từ `src/components/Notice`.

---

## 4. Nguyên Tắc về Phân Quyền (RBAC & Business Rules)

Hệ thống FoodPrint áp dụng cơ chế phân quyền trực tiếp qua Role và Portal tổ chức:

1. **Quy tắc 1 Account = 1 Role:** `user.role` là chuỗi `string` đơn lẻ (không dùng mảng).
2. **Khai báo Role:** Luôn sử dụng hằng số từ `src/constants/roles.js` (`ROLES`, `ORG_TYPES`). Tuyệt đối không hardcode chuỗi string tự do trong code.
3. **Lấy thông tin User:** Sử dụng `StoreContext`:
   ```javascript
   import { StoreContext } from "src/contexts"
   // ...
   const { userStore } = useContext(StoreContext)
   const user = userStore?.user // { userId, fullName, orgType, role }
   ```
4. **Kiểm tra quyền trên UI:** Dùng hàm `hasPermission` từ `src/lib/utils`:
   ```javascript
   import { hasPermission } from "src/lib/utils"
   import { ROLES } from "src/constants/roles"

   // Kiểm tra xem role của user có được bấm nút này không
   const canApprove = hasPermission([ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_MANAGEMENT_BOARD], user?.role)

   {canApprove && (
     <button className="btn btn-primary" onClick={handleApprove}>Phê duyệt</button>
   )}
   ```
5. **Route Guard:** Các trang mới phải được đăng ký trong [`src/router/AppRouter.jsx`](file:///src/router/AppRouter.jsx) và bọc qua `<RoleRoute allowedRoles={[...]} />`.

---

## 5. Template Mẫu Chuẩn Cho 1 Feature Mới

### File `src/pages/SCHOOL/MenuApproval/index.jsx`
```jsx
import React, { useState } from "react"
import ApprovalHeader from "./components/ApprovalHeader"
import ApprovalTable from "./components/ApprovalTable"
import "./components/styles.scss"

function MenuApprovalPage() {
  const [selectedWeek, setSelectedWeek] = useState(1)

  return (
    <div className="menu-approval-page">
      <ApprovalHeader selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
      <div className="mt-16">
        <ApprovalTable week={selectedWeek} />
      </div>
    </div>
  )
}

export default MenuApprovalPage
```

---

🔥 **GHI NHỚ:** 
1. **Dùng Class SCSS + SCSS Utility**, **KHÔNG dùng `styled-components`**.
2. **File `index.jsx` tại gốc Page**, còn lại dồn hết vào `components/`.
3. **API gom vào `src/services/[Feature]Service/`**.
4. **Role lấy từ `StoreContext` và check qua `hasPermission`**.
