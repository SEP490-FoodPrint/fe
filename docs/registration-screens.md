# SA-05 / SA-06: Hồ sơ đăng ký

Nguồn thiết kế: [SA-05](https://www.figma.com/design/gwGiWIuwTdzNzxiKdfG3GV/Untitled?node-id=35-2307), [SA-06](https://www.figma.com/design/gwGiWIuwTdzNzxiKdfG3GV/Untitled?node-id=38-3355).

## Mở giao diện

Chạy `npm run dev`, đăng nhập bằng tài khoản có role `SYSTEM_ADMIN`; hệ thống luôn tự mở trang **Hồ sơ đăng ký**, kể cả khi có lưu đường dẫn trước đăng nhập. Áp dụng cho đăng nhập bằng form và đăng nhập nhanh. Đây cũng là trang mặc định khi chuyển sang vai trò quản trị hệ thống.

- SA-05: `/system/organization-approval`.
- SA-06: `/system/organization-approval/:requestId`, mở từ mã hồ sơ hoặc nút xem chi tiết.
- Hồ sơ nhà cung cấp trong Figma: `/system/organization-approval/00024700-0000-4000-8000-000000000001`.

Mặc định gọi backend thật với `.env`:

```dotenv
VITE_API_ROOT=http://localhost:5000/api
VITE_USE_MOCK=false
```

Chạy frontend tại `http://localhost:3001` theo CORS hiện tại của backend. Nếu đổi origin, cần cấu hình `CLIENT_URL` ở backend tương ứng. Khởi động lại Vite sau khi đổi `.env`.

Đăng nhập gửi `{ identifier, password }`; backend quản lý phiên bằng cookie HttpOnly, frontend không lưu token thật. Tải lại trang xác thực phiên qua `/auth/me` trước khi kiểm tra route; các request 401 dùng chung một lần refresh. Token demo cũ được xóa trong chế độ API thật. Không tự chuyển sang demo khi API lỗi hoặc sai mật khẩu. Đăng nhập nhanh và nút đổi role chỉ xuất hiện khi `VITE_USE_MOCK=true`. Xem [luồng đăng nhập/đăng ký](auth-screens.md).

Tài khoản phải ACTIVE, thuộc SYSTEM và có quyền `registration.view`. Catalog backend mới đã bổ sung các quyền hồ sơ; database đang dùng có thể cần người vận hành cập nhật catalog theo chính sách backend. Frontend không tự sửa quyền.

Chế độ `VITE_USE_MOCK=true` có 80 hồ sơ minh họa, ban đầu 12 hồ sơ chờ duyệt. Quyết định demo được lưu ở localStorage, khóa `foodprint_registration_reviews_v1`.

## Hành vi

- Tìm tên người đăng ký hoặc UUID hồ sơ đầy đủ qua endpoint `/search`, debounce 250ms. API không hỗ trợ mã rút gọn, email, đơn vị hoặc tự bỏ dấu. UI dùng UUID thật làm mã hồ sơ. Lọc loại, trạng thái và khoảng ngày gửi thực hiện trên server, khoảng ngày được backend hiểu theo UTC+7. Khoảng ngày đảo chiều không gửi request.
- Bộ lọc và số trang nằm trong URL; quay lại từ chi tiết giữ bộ lọc. Desktop/tablet hiển thị 5 hàng/trang, mobile 2 thẻ/trang.
- Request cũ bị hủy khi đổi bộ lọc, trang hoặc rời màn hình. Trang vượt số kết quả được chuyển về trang cuối hợp lệ.
- Hai thẻ tổng số/chờ duyệt lấy `pagination.total` từ hai GET không có bộ lọc tìm kiếm, mỗi GET chỉ lấy tối đa một hồ sơ. Không đếm dữ liệu của trang hiện tại.
- Chi tiết hiển thị nhánh trường học/nhà cung cấp; hồ sơ đã xét duyệt chỉ cho xem quyết định. Nút duyệt/từ chối vẫn bị vô hiệu hóa trong chế độ API thật; cần nối với các endpoint review vừa được backend bổ sung trong công việc SA-06 riêng. Chế độ demo vẫn có dialog xác nhận và lý do từ chối tối đa 2.000 ký tự.
- Minh chứng demo dựng từ nội dung Figma và có nhãn minh họa; dữ liệu thật sử dụng URL PDF/ảnh. Nguyên liệu đề xuất chỉ hiển thị, không tự phê duyệt khi duyệt hồ sơ.
- Có trạng thái tải, trống, lỗi, thử lại và không tìm thấy hồ sơ. Dialog dùng quản lý focus, Escape và ngăn gửi lặp của MUI.

## API đã tích hợp

Lưu ý backend mới nhất: danh sách đã chuyển về API cơ bản chỉ có `page`, `limit`, `pagination.hasNext`, chưa có tổng số, tên người đăng ký hoặc route `/search`/bộ lọc như hợp đồng dưới đây. Frontend đọc được cả hai dạng phân trang; khi thiếu tổng số thì dùng Trước/Tiếp và hiển thị thống kê `—`, không tự tính số giả. Tìm kiếm/bộ lọc cần backend khôi phục endpoint tương ứng. Backend cũng vừa bổ sung API duyệt/từ chối theo `be/docs/ONBOARDING.md`; màn SA-06 hiện chưa nối các thao tác mới này, nút vẫn bị vô hiệu hóa. Các mô tả hợp đồng danh sách đầy đủ bên dưới là phiên bản frontend đã tích hợp trước thay đổi backend.

Đối chiếu `be/docs/REGISTRATION_API.md`, `be/docs/AUTHORIZATION.md` và các route/service backend. Endpoint nằm trong các file `services/*Service/urls.js`; UI chỉ gọi service.

| Phương thức | Endpoint | Dữ liệu |
| --- | --- | --- |
| POST | `/auth/login` | `{ identifier, password }` |
| GET | `/auth/me` | Khôi phục tài khoản và quyền hiện tại |
| GET | `/registration-requests` | Query `requestType`, `status`, `fromDate`, `toDate`, `page`, `limit` |
| GET | `/registration-requests/search` | Query như trên và `search` |
| GET | `/registration-requests/:id` | Chi tiết một hồ sơ bằng UUID |

Envelope: `{ success, statusCode, message, data }`. Danh sách có `data.items` và `data.pagination` (`page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrevious`); chi tiết có `data` là một hồ sơ. `RegistrationService/adapter.js` chuyển camelCase của backend sang view model của trang. Request dùng cookie phiên; nếu refresh không phục hồi được 401 thì yêu cầu đăng nhập lại. Các lỗi còn lại hiện thông báo API và cho thử lại.

API danh sách trả thông tin tóm tắt cùng applicantUser gồm id, username, fullName, email, phone, status, emailVerifiedAt theo cùng hợp đồng thông tin tài khoản như chi tiết. Adapter dùng chung đưa tên/email vào bảng và giữ số điện thoại, trạng thái, thời điểm xác minh trong view model. Danh sách chưa nhúng profileData của tổ chức; ô đơn vị hiển thị thiếu dữ liệu nếu API không trả trường này. Không gọi chi tiết cho từng hàng và không điền bằng dữ liệu demo. Chi tiết trả `applicantUser` gồm id, username, fullName, email, phone, status, emailVerifiedAt; adapter ánh xạ vào nhóm thông tin người đăng ký, bao gồm status và email_verified_at. Các trường này đọc từ tài khoản hiện tại, độc lập với thông tin tổ chức trong profileData; null được giữ nguyên. Chi tiết cũng trả reviewedByUserId và reviewedByUser (id, fullName), null khi chưa xét duyệt; xem hợp đồng hiện hành trong be/docs/ONBOARDING.md. Backend trả metadata tài liệu an toàn trong documents; adapter đã ánh xạ mỗi documents thành một dòng tệp với tên, MIME và thông tin chứng nhận. Dialog gọi GET /registration-requests/:id/documents/:documentId bằng cookie để lấy URL có hiệu lực 60 giây, hỗ trợ ảnh/PDF, tải lại, lỗi/thử lại và hủy request khi đóng. Không dùng metadata Cloudinary nội bộ hoặc URL public để thay kiểm tra quyền.

`profileData` và `supportingDocuments` được backend trả nguyên JSON, chưa có schema nghiệp vụ cố định. Adapter giữ các khóa JSON hiện có. Layout đang đọc `name`/`organizationName`, `code`, `tax_code`, `email`, `phone`, `address`, `description`, `ingredients`; minh chứng đọc `name`, `number`, `issued_at`, `expires_at`, `mime_type`, `url`. Cần chốt schema JSON với backend nếu dữ liệu thực tế dùng cấu trúc khác; frontend không tự tạo nội dung bị thiếu.

Chạy `npm run test:registration` để kiểm tra service với response theo hợp đồng backend (HTTP adapter được thay trong test, không dùng DB). Chạy `npm run build` để kiểm tra build.

## Phạm vi giao diện

Nội dung hai màn hình sử dụng MUI và SCSS Module, token FoodPrint; icon được import trực tiếp từ `@mui/icons-material`, không lưu SVG icon riêng trong repo. Trang chi tiết dùng mũi tên ở tiêu đề để trở lại danh sách, không có nút chữ “Quay lại danh sách” trong nội dung. UI/UX Pro Max được áp dụng cho nhãn, focus bàn phím, phản hồi thao tác và bố cục responsive.

Header và Sidebar được đồng bộ theo Figma qua `MainLayout` cho cả SYSTEM, SCHOOL và SUPPLIER. Desktop từ 1200px dùng Sidebar trắng 240px và Header 80px; tablet 601–1199px dùng thanh icon 64px (`iconOnly`) và Header 56px; mobile đến 600px dùng Header 56px và ngăn điều hướng 280px, nội dung chiếm toàn chiều ngang. Sidebar chỉ gồm thương hiệu, thông tin phân hệ và menu, không có nút thu gọn thủ công hoặc footer. Menu tiếp tục lọc theo role và đánh dấu mục cha khi mở trang chi tiết. Ngăn điều hướng hỗ trợ Escape, giữ focus bên trong và đóng sau điều hướng. Header hiển thị thông báo và menu tài khoản; thông báo hiện là trạng thái trống, chưa nối API.
