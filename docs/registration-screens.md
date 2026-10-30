# SA-05 / SA-06: Hồ sơ đăng ký

Nguồn thiết kế: [SA-05](https://www.figma.com/design/gwGiWIuwTdzNzxiKdfG3GV/Untitled?node-id=35-2307), [SA-06](https://www.figma.com/design/gwGiWIuwTdzNzxiKdfG3GV/Untitled?node-id=38-3355).

## Mở giao diện

Chạy `npm run dev`, đăng nhập bằng tài khoản có role `SYSTEM_ADMIN`; hệ thống luôn tự mở trang **Hồ sơ đăng ký**, kể cả khi có lưu đường dẫn trước đăng nhập. Áp dụng cho đăng nhập bằng form và đăng nhập nhanh. Đây cũng là trang mặc định khi chuyển sang vai trò quản trị hệ thống.

- SA-05: `/system/organization-approval`.
- SA-06: `/system/organization-approval/:requestId`, mở từ mã hồ sơ hoặc nút xem chi tiết.
- Hồ sơ nhà cung cấp trong Figma: `/system/organization-approval/00024700-0000-4000-8000-000000000001`.

Dữ liệu demo được bật khi `VITE_USE_MOCK=true` hoặc phiên đăng nhập nhanh sử dụng token `mock_*`. Có 80 hồ sơ minh họa, ban đầu 12 hồ sơ chờ duyệt; năm hàng đầu lấy từ Figma. Các hàng còn lại chỉ phục vụ thử phân trang. Quyết định demo được lưu ở localStorage, khóa `foodprint_registration_reviews_v1`. Xóa khóa này để đặt lại dữ liệu demo.

## Hành vi

- Tìm theo mã hiển thị, người đăng ký, email hoặc đơn vị; hỗ trợ tìm không dấu. Lọc loại, trạng thái và khoảng ngày gửi có kiểm tra thứ tự ngày.
- Bộ lọc và số trang nằm trong URL; quay lại từ chi tiết giữ bộ lọc. Desktop/tablet hiển thị 5 hàng/trang, mobile 2 thẻ/trang.
- Chi tiết hiển thị nhánh trường học/nhà cung cấp; hồ sơ đã xét duyệt chỉ cho xem quyết định. Thao tác duyệt và từ chối đều cần xác nhận. Lý do từ chối tùy chọn theo Figma, tối đa 2.000 ký tự.
- Minh chứng demo dựng từ nội dung Figma và có nhãn minh họa; dữ liệu thật sử dụng URL PDF/ảnh. Nguyên liệu đề xuất chỉ hiển thị, không tự phê duyệt khi duyệt hồ sơ.
- Có trạng thái tải, trống, lỗi, thử lại và không tìm thấy hồ sơ. Dialog dùng quản lý focus, Escape và ngăn gửi lặp của MUI.

## Hợp đồng API dự kiến

Chưa có backend hoặc tài liệu API tương ứng trong repo. Các endpoint dưới đây là hợp đồng dự kiến, cần đối chiếu khi tích hợp. Toàn bộ endpoint nằm trong `src/services/RegistrationService/urls.js`; không có lời gọi HTTP trong UI.

| Phương thức | Endpoint | Dữ liệu |
| --- | --- | --- |
| GET | `/system/registration-requests` | Query `search`, `request_type`, `status`, `submitted_from`, `submitted_to`, `page`, `page_size` |
| GET | `/system/registration-requests/:id` | Chi tiết một hồ sơ |
| PATCH | `/system/registration-requests/:id/review` | Body `{ status: "APPROVED" \| "REJECTED", rejection_reason: string \| null }` |

Danh sách trả `{ data: Request[], total: number, page: number, summary: { total: number, pending: number } }`. Chi tiết và xét duyệt trả `{ data: Request }`. Lỗi nghiệp vụ có thể trả `success: false` hoặc `isOk: false` và `message`.

`Request` gồm các trường `id`, `request_type`, `status`, `submitted_at`, `reviewed_at`, `updated_at`, `rejection_reason`, cùng `applicant` (họ tên, tên đăng nhập, email, điện thoại, trạng thái, ngày xác minh email), `reviewer.full_name`, `profile_data`, `supporting_documents`.

`profile_data` dùng `name`, `code` (trường học), `tax_code` (nhà cung cấp), `email`, `phone`, `address`, `description` và `ingredients`. Các khóa JSON này là hợp đồng UI dự kiến; Figma chưa xác nhận schema JSONB. Nguyên liệu có `id`, `name`, `group`, `unit`, `is_proposed`, `note`. Minh chứng có `id`, `name`, `number`, `issued_at`, `expires_at`, `mime_type`, `url`; `is_demo` chỉ dùng trong fixture.

Mã hiển thị được tính từ sáu ký tự đầu của UUID, không thêm cột cơ sở dữ liệu. Backend cần kiểm tra quyền SYSTEM_ADMIN, chỉ cho xét duyệt hồ sơ PENDING, ghi người duyệt và thời gian từ phiên xác thực phía server, đồng thời chống xét duyệt đồng thời. Tham số reviewer trong service chỉ phục vụ demo.

## Phạm vi giao diện

Nội dung hai màn hình sử dụng MUI và SCSS Module, token FoodPrint; icon được import trực tiếp từ `@mui/icons-material`, không lưu SVG icon riêng trong repo. Trang chi tiết dùng mũi tên ở tiêu đề để trở lại danh sách, không có nút chữ “Quay lại danh sách” trong nội dung. UI/UX Pro Max được áp dụng cho nhãn, focus bàn phím, phản hồi thao tác và bố cục responsive.

Header và Sidebar được đồng bộ theo Figma qua `MainLayout` cho cả SYSTEM, SCHOOL và SUPPLIER. Desktop từ 1200px dùng Sidebar trắng 240px và Header 80px; tablet 601–1199px dùng thanh icon 64px (`iconOnly`) và Header 56px; mobile đến 600px dùng Header 56px và ngăn điều hướng 280px, nội dung chiếm toàn chiều ngang. Sidebar chỉ gồm thương hiệu, thông tin phân hệ và menu, không có nút thu gọn thủ công hoặc footer. Menu tiếp tục lọc theo role và đánh dấu mục cha khi mở trang chi tiết. Ngăn điều hướng hỗ trợ Escape, giữ focus bên trong và đóng sau điều hướng. Header hiển thị thông báo và menu tài khoản; thông báo hiện là trạng thái trống, chưa nối API.
