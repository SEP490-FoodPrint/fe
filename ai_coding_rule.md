# AI Coding Guidelines & Frontend Architecture (FoodPrint FE)

> **CRITICAL INSTRUCTION FOR ALL AI ASSISTANTS & DEVELOPERS:**
> Tài liệu này là **bộ luật kiến trúc tối thượng** của dự án **FoodPrint Frontend**. 
> Khi nhận được bất kỳ yêu cầu code màn hình nào (từ mô tả, mockup, bản vẽ thiết kế hay user story), **AI BẮT BUỘC PHẢI TUÂN THỦ 100% CÁC NGUYÊN TẮC DƯỚI ĐÂY** để đảm bảo:
> 1. Đúng cấu trúc thư mục quy chuẩn.
> 2. Đúng kỹ thuật: Material UI v6 + Module SCSS + Domain-Driven Services.
> 3. Tận dụng tối đa tài nguyên có sẵn trong Base (Tokens, MUI Theme, Utilities).
> 4. Không phá vỡ bộ khung Layout (Header & Sidebar) sẵn có.

---

## 1. Nguyên Tắc Bất Biến Về Khung Giao Diện (Layout Integrity)

> [!IMPORTANT]
> **TUYỆT ĐỐI KHÔNG CAN THIỆP VÀO HEADER VÀ SIDEBAR NẾU KHÔNG CÓ YÊU CẦU CỤ THỂ!**

1. **Khung giao diện cố định:** Toàn bộ hệ thống quản trị FoodPrint sử dụng `MainLayout` quản lý tập trung Header và Sidebar theo phân hệ (`SYSTEM`, `SCHOOL`, `SUPPLIER`).
2. **Phạm vi code của màn hình:** 
   - Khi được yêu cầu tạo hoặc chỉnh sửa một màn hình bất kỳ: **Chỉ được phép code và styling bên trong vùng Content của màn hình đó** (nơi render qua `<Outlet />`).
   - Tuyệt đối **không thay đổi cấu trúc, không can thiệp CSS/SCSS** của Header (`TopHeader`) hay Sidebar (`aside`) của MainLayout, trừ khi người dùng có chỉ đạo đích danh yêu cầu sửa Header/Sidebar.
   - Giữ nguyên cấu trúc phân tầng gốc để đảm bảo tính nhất quán trên toàn bộ 9 vai trò người dùng.

---

## 2. Nguyên Tắc Sử Dụng Màu Sắc, Font Chữ & Kích Thước (Design Tokens First)

Mọi style trong dự án bắt buộc phải kế thừa từ hệ thống Design Tokens toàn cục đã được khai báo tại [src/assets/css/globals.css](file:///src/assets/css/globals.css).

### Quy tắc ưu tiên 3 cấp độ (3-Tier Priority):
1. **Ưu tiên 1 (Bắt buộc số 1):** Luôn tìm và sử dụng các biến CSS có sẵn trong `globals.css` (`var(--tên-biến)`).
2. **Ưu tiên 2 (Tìm giá trị tương đương):** Nếu trên mockup/yêu cầu có màu sắc, cỡ chữ hoặc khoảng cách hơi lệch nhẹ so với biến sẵn có, **AI PHẢI tìm biến tương đương/gần nhất trong `globals.css`** để quy về chuẩn chung của Design System FoodPrint, không tự ý viết mã hex hoặc pixel tự do.
3. **Ưu tiên 3 (Khai báo biến mới):** Chỉ khi màu sắc/kích thước đó hoàn toàn không có giá trị tương đương trong `globals.css` và mang tính chất đặc thù của nghiệp vụ mới, AI mới được phép khai báo thêm biến (phải đặt tên có nghĩa theo chuẩn Semantic Token, tuyệt đối không hardcode giá trị thô vào component).

---

### Bảng Tra Cứu Nhanh Các Biến Toàn Cục (`globals.css`):

#### A. Màu sắc thương hiệu & Ngữ nghĩa:
| Biến CSS | Giá trị HEX | Ý nghĩa sử dụng |
| :--- | :--- | :--- |
| `var(--color-primary)` | `#0A8066` | Màu xanh chủ đạo thương hiệu FoodPrint |
| `var(--color-primary-hover)` | `#08735C` | Màu hover cho nút, link chính |
| `var(--color-primary-soft)` | `#E8F5F1` | Nền nhạt cho item được chọn, badge nổi bật |
| `var(--color-primary-rgb)` | `10, 128, 102` | Kênh màu RGB dùng làm opacity (VD: `rgba(var(--color-primary-rgb), 0.1)`) |
| `var(--color-secondary)` | `#DED3CD` | Màu be phụ thương hiệu |
| `var(--color-secondary-soft)`| `#FAF7F5` | Nền be nhạt |
| `var(--bg-page)` | `#F8FAF9` | Màu nền toàn bộ trang |
| `var(--bg-surface)` | `#FFFFFF` | Màu nền của Card, Bảng, Hộp nội dung |
| `var(--bg-muted)` | `#F1F5F3` | Màu nền xám nhạt (header bảng, ô disable) |
| `var(--text-primary)` | `#1D2B26` | Màu chữ chính (tiêu đề, nội dung quan trọng) |
| `var(--text-secondary)` | `#52635C` | Màu chữ phụ, mô tả |
| `var(--text-muted)` | `#6B7C74` | Màu chữ mờ, chú thích, placeholder |
| `var(--border-default)` | `#DCE5E0` | Viền mặc định của Card, Input, Table |
| `var(--border-strong)` | `#ADBBB3` | Viền đậm |
| `var(--border-focus)` | `#0A8066` | Viền focus khi nhập liệu |

#### B. Màu trạng thái (Status Colors):
- **Thành công (Success):** Chữ: `var(--color-success)` (`#168456`) | Nền: `var(--color-success-bg)` (`#E8F6EF`) | Viền: `var(--color-success-border)` (`#BCE6CF`)
- **Lỗi / Nguy hiểm (Error):** Chữ: `var(--color-error)` (`#D64545`) | Nền: `var(--color-error-bg)` (`#FDECEC`) | Viền: `var(--color-error-border)` (`#F4C3C3`)
- **Cảnh báo (Warning):** Chữ: `var(--color-warning)` (`#9B650A`) | Nền: `var(--color-warning-bg)` (`#FFF5DA`) | Viền: `var(--color-warning-border)` (`#F3DEA1`)
- **Thông tin (Info):** Chữ: `var(--color-info)` (`#286BBD`) | Nền: `var(--color-info-bg)` (`#EAF3FF`) | Viền: `var(--color-info-border)` (`#C8DEF8`)

#### C. Typography (Font & Cỡ chữ):
- **Font family:** `var(--font-sans)` (`"Be Vietnam Pro", system-ui, sans-serif`)
- **Cỡ chữ:**
  - `var(--text-xs)`: `0.75rem` (12px) - Ghi chú, badge nhỏ
  - `var(--text-sm)`: `0.875rem` (14px) - Chữ phụ, nội dung bảng
  - `var(--text-base)`: `1rem` (16px) - Chữ mặc định giao diện
  - `var(--text-lg)`: `1.125rem` (18px) - Tiêu đề card, subheader
  - `var(--text-xl)`: `1.25rem` (20px) - Tiêu đề mục lớn
  - `var(--text-2xl)`: `1.5rem` (24px) - Tiêu đề màn hình
  - `var(--text-3xl)` đến `--text-5xl`: Tiêu đề landing page hoặc số liệu thống kê lớn
- **Độ đậm:** `var(--font-normal)` (400), `var(--font-medium)` (500), `var(--font-semibold)` (600), `var(--font-bold)` (700)
- **Line-height:** `var(--leading-tight)` (1.25), `var(--leading-normal)` (1.5), `var(--leading-relaxed)` (1.7)

#### D. Spacing (Quy chuẩn khoảng cách 4px Grid):
- `var(--space-1)`: 4px | `var(--space-2)`: 8px | `var(--space-3)`: 12px | `var(--space-4)`: 16px
- `var(--space-5)`: 20px | `var(--space-6)`: 24px | `var(--space-8)`: 32px | `var(--space-10)`: 40px | `var(--space-12)`: 48px | `var(--space-16)`: 64px

#### E. Bo góc (Radius) & Đổ bóng (Shadow):
- **Radius:** `var(--radius-sm)` (4px), `var(--radius-md)` (8px), `var(--radius-lg)` (12px), `var(--radius-xl)` (16px), `var(--radius-full)` (9999px)
- **Shadow:** `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`

---

## 3. Cấu Trúc Thư Mục Màn Hình Bắt Buộc (Screen Folder Architecture)

Khi code bất kỳ màn hình nào, AI phải tạo đúng cây thư mục sau:

```text
src/pages/
└── [ROLE_FOLDER]/               <-- ANONYMOUS | SYSTEM | SCHOOL | SUPPLIER | SUPPORTPAGES
    └── [Tên_Màn_Hình]/          <-- Tên màn hình viết hoa chữ cái đầu (VD: MenuApproval, WarehouseManage)
        ├── index.tsx (hoặc .jsx)       <-- BẮT BUỘC: File gốc điều phối (Page Orchestrator)
        ├── style.scss                  <-- (TÙY CHỌN): Style riêng cho khung bao bọc trang nếu index cần
        └── component/                  <-- BẮT BUỘC: THƯ MỤC "component" (số ít) CHỨA COMPONENT CON
            ├── ProductItem.tsx
            ├── ProductItem.module.scss  <-- BẮT BUỘC: Trùng tên 100% với component (ProductItem)
            ├── FilterBar.tsx
            ├── FilterBar.module.scss    <-- BẮT BUỘC: Trùng tên 100% với component (FilterBar)
            ├── ModalDetail.tsx
            └── ModalDetail.module.scss  <-- BẮT BUỘC: Trùng tên 100% với component (ModalDetail)
```

### Quy định chi tiết:
1. Thư mục gốc màn hình (`src/pages/[ROLE]/[Tên_Màn_Hình]/`) **chỉ chứa tối đa 3 thành phần**:
   - `index.tsx` (hoặc `index.jsx`)
   - `style.scss` (nếu trang cần style cho thẻ bọc ngoài)
   - Thư mục mang tên duy nhất: **`component`** (chữ thường, số ít).
2. **Tuyệt đối không để** component con, modal, table, form nằm trực tiếp tại thư mục gốc của Page. Mọi component phân rã phải đưa vào bên trong thư mục `component/`.
3. **Quy tắc đặt tên file Module SCSS:** 
   - Tên file `.module.scss` **BẮT BUỘC TRÙNG TÊN 100%** với component nó phục vụ:
     - Component: `IngredientTable.tsx` -> File SCSS: `IngredientTable.module.scss`
     - Component: `ConfirmModal.jsx` -> File SCSS: `ConfirmModal.module.scss`
   - Import vào component: `import styles from "./IngredientTable.module.scss"`
   - Sử dụng trong JSX: `className={styles.tableWrapper}`

---

## 4. Nguyên Tắc Về UI & Kỹ Thuật Styling (Material UI v6 + Module SCSS)

1. **Sử dụng Material UI v6 gốc:**
   - Import và sử dụng trực tiếp các component gốc từ `@mui/material` (`Button`, `TextField`, `Card`, `Typography`, `Table`, `Dialog`, `Select`, `Chip`,...) và icon từ `@mui/icons-material` hoặc `lucide-react`.
   - **Tuyệt đối KHÔNG sử dụng** Ant Design (`antd`) hoặc `styled-components`.
   - **Không tự tạo các wrapper thừa** như `InputCustom`, `TableCustom` nếu không thực sự cần thiết.
2. **Kết hợp MUI và Module SCSS:**
   - Dùng MUI cho cấu trúc component, logic tương tác và các thuộc tính cơ bản.
   - Dùng Module SCSS (`styles.className`) khi cần tùy biến sâu về CSS, hiệu ứng hover, layout phức tạp:
   ```tsx
   import React from "react"
   import { Card, Typography, Button } from "@mui/material"
   import styles from "./ProductItem.module.scss"

   function ProductItem({ title, price }) {
     return (
       <Card className={styles.productCard}>
         <Typography className={styles.productTitle}>{title}</Typography>
         <Typography className={styles.productPrice}>{price} đ</Typography>
         <Button variant="contained" color="primary" className={styles.actionBtn}>
           Chọn mua
         </Button>
       </Card>
     )
   }

   export default ProductItem
   ```
3. **Trong file `.module.scss`, luôn dùng biến token:**
   ```scss
   .productCard {
     border-radius: var(--radius-lg);
     border: 1px solid var(--border-default);
     padding: var(--space-4);
     background-color: var(--bg-surface);
     box-shadow: var(--shadow-sm);
     transition: all 0.2s ease;

     &:hover {
       border-color: var(--color-primary);
       box-shadow: var(--shadow-md);
     }
   }

   .productTitle {
     font-size: var(--text-lg) !important;
     font-weight: var(--font-semibold) !important;
     color: var(--text-primary);
   }
   ```

---

## 5. Nguyên Tắc Về Luồng Code Services (Domain-Driven Services)

> Tham chiếu quy chuẩn Mục 2 trong `ai_coding_rule`: Tách biệt tuyệt đối giữa Endpoints và Logic gọi API.

Khi tạo mới một tính năng hoặc luồng dữ liệu API:

1. **Tạo thư mục Service:** `src/services/[Feature]Service/` (Ví dụ: `MealService`, `SupplierService`).
2. **Tạo file `urls.ts` (hoặc `urls.js`):** Chỉ chứa string endpoints:
   ```typescript
   export const apiGetMeals = "/school/meals"
   export const apiCreateMeal = "/school/meals"
   export const apiUpdateMeal = (id: string | number) => `/school/meals/${id}`
   ```
3. **Tạo file `index.ts` (hoặc `index.js`):** Import `01_axios` và các endpoint từ `urls`:
   ```typescript
   import http from "../01_axios"
   import { apiGetMeals, apiCreateMeal, apiUpdateMeal } from "./urls"

   const getMeals = (params?: any) => http.get(apiGetMeals, { params })
   const createMeal = (body: any) => http.post(apiCreateMeal, body)
   const updateMeal = (id: string | number, body: any) => http.put(apiUpdateMeal(id), body)

   const MealService = { getMeals, createMeal, updateMeal }
   export default MealService
   ```
4. **Tại UI Component:** 
   - **Tuyệt đối KHÔNG** gọi `axios` hay `fetch` trực tiếp.
   - Bắt buộc import Service và gọi: `const res = await MealService.getMeals()`.
   - Bọc trong `try...catch...finally` để quản lý `loading` và thông báo qua `notice` (`src/components/Notice`).

---

## 6. Quy Chuẩn Mobile-First & Tiêu Chuẩn UI/UX Pro Max Cho Phân Hệ Bếp Ăn

> [!IMPORTANT]
> **ĐẶC THÙ BẮT BUỘC ĐỐI VỚI VAI TRÒ NHÂN VIÊN BẾP (`SCHOOL_KITCHEN_STAFF`):**
> Nhân viên bếp hoàn toàn **không sử dụng máy tính bàn/laptop** trong khu vực chế biến mà **100% sử dụng điện thoại thông minh**. Mọi màn hình thuộc phân hệ Bếp (`src/pages/SCHOOL/Kitchen...`) phải tuân thủ nghiêm ngặt chuẩn **Mobile-First** và thư viện kỹ năng **UI/UX Pro Max** (`.agents/skills/ui-ux-pro-max`).

### 1. Nguyên lý Thiết kế & Mật độ hiển thị (High-Density & Glanceability):
- **Bao quát công việc trong nháy mắt (Glanceability):** Nhân viên bếp cần nắm trọn các công việc hôm nay (món nấu, số suất, giờ hoàn thành) ngay từ cái nhìn đầu tiên (Above the fold), không bị che khuất bởi các thẻ phình to cồng kềnh.
- **Định chuẩn Typography vừa vặn:**
  - Tiêu đề thẻ công việc/món ăn: chuẩn **`13.5px` (SemiBold 600)**. Tuyệt đối không dùng chữ `16px - 18px Bold` làm thẻ bị chật chội và vỡ layout.
  - Phụ đề thông tin (suất ăn, mốc giờ hoàn thành): chuẩn **`12px` (Regular/Medium, màu `#4B5563` chuẩn tương phản WCAG AA)**.
  - Chiều cao thẻ vận hành: tối ưu **`58px – 62px`** (giảm >50% so với layout 3 tầng cũ).
  - Khoảng cách giữa các thẻ: `gap: 8px`.

### 2. Thao tác Icon-First & Vùng bấm cảm ứng an toàn (Touch Target >= 44px):
- **Tuyệt đối không dùng nút chữ dài:** Không đặt các nút có chữ dài lê thê (*"Xem chi tiết"*, *"Bắt đầu nấu"*, *"Phân bổ suất"*) trên thẻ di động.
- **Thay thế bằng Icon Action Button trực quan:** Dùng các icon rõ nghĩa từ `lucide-react` (`Play`, `Eye`, `Check`, `ArrowRight`, `Edit`, `Trash2`).
- **Kích thước visual vs Vùng chạm thực tế:** Nút hiển thị `32x32px` bo góc `8px`, nhưng bắt buộc dùng CSS pseudo-element `::after` mở rộng vùng bấm thực tế lên $\ge 44\times 44\text{px}$ (`inset: -6px; content: ''; position: absolute;`) để người dùng bấm chính xác ngay cả khi tay ướt hoặc đeo găng tay trong bếp.

### 3. Lược bỏ mã kỹ thuật nội bộ (Technical IDs Elimination):
- Ẩn triệt để các mã database nội bộ (`CB-20261030-01`, `ALLOC-0092`, `DELIV-102`) khỏi màn hình di động của bếp ăn.
- Thay thế hoàn toàn bằng dữ liệu vận hành sống: Tên món ăn/khối lớp, ca ăn, số lượng suất và thời hạn hoàn thành (ví dụ: *"1.250 suất • Xong trước 10:30"*).

### 4. Xóa bỏ viền lồng viền (No Nested Borders):
- Trên di động, container ngoài cùng của Section phải để `background: transparent; border: none; padding: 0; box-shadow: none;`. Chỉ có các thẻ con bên trong có viền nhẹ 1px (`#E5E7EB`) và nền trắng.

---

## 7. Checklist Tự Kiểm Tra (Self-Checklist) Cho AI Trước Khi Bàn Giao

Trước khi hoàn thành bất kỳ yêu cầu code màn hình nào, AI phải tự kiểm tra:
- [ ] **Header/Sidebar:** Có giữ nguyên 100% không? Chỉ code trong phạm vi Page Content?
- [ ] **Mobile-First cho Bếp:** Nếu là màn hình Nhân viên bếp, đã tối ưu trên mobile (390px), thẻ cao ~60px, dùng icon action có touch target >= 44px, không có mã kỹ thuật thừa, không tràn ngang (`scrollWidth === clientWidth`)?
- [ ] **Cấu trúc thư mục:** Màn hình có đủ `index.tsx` (hoặc `.jsx`) + `component/`? Không có file con vứt bừa bãi ở root page?
- [ ] **Tên Module SCSS:** Mọi component con trong `component/` có file `.module.scss` trùng tên 100% không?
- [ ] **Biến Tokens:** Toàn bộ màu sắc, font chữ, spacing, radius có dùng `var(--...)` từ `globals.css` không? Có mã màu hex/px tùy tiện nào không?
- [ ] **Services:** Mọi cuộc gọi API có tách `urls` và `index` trong `src/services/` không?
- [ ] **Build:** Đảm bảo `npm run build` không phát sinh lỗi biên dịch.

---

## 8. Mẫu Chuẩn Tham Khảo Thực Tế Trong Dự Án

- **Cấu trúc Page + Module SCSS:** [src/pages/ANONYMOUS/Login](file:///C:/MERN/FoodPrint/FoodPrintFE/src/pages/ANONYMOUS/Login)
  - `index.jsx`
  - `style.scss`
  - `component/LoginForm.jsx` + `component/LoginForm.module.scss`
  - `component/QuickLoginList.jsx` + `component/QuickLoginList.module.scss`
- **Cấu trúc Service:** [src/services/AuthService](file:///C:/MERN/FoodPrint/FoodPrintFE/src/services/AuthService)
  - `urls.js`
  - `index.js`
