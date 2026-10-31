# Đăng nhập, xác minh email và hồ sơ FoodPrint

Thiết kế: [Figma · Đăng nhập & Đăng ký](https://www.figma.com/design/gwGiWIuwTdzNzxiKdfG3GV/Untitled?node-id=209-20), kèm yêu cầu mới về popup trang chủ và menu tài khoản. Áp dụng UI/UX Pro Max cho nhãn, lỗi tại trường, quản lý focus, password manager, thao tác bàn phím và responsive. Dùng MUI, SCSS Module, token FoodPrint và logo `src/assets/images/logo.png`.

## Luồng đăng ký

1. Người dùng chọn nhà trường hoặc nhà cung cấp và gửi thông tin người đại diện qua `POST /auth/signup`.
2. Sau 201, luôn chuyển tới `/activate-account`, không mở hồ sơ đơn vị hoặc trang đăng nhập. Đọc `verificationEmailSent` từ response để tránh gửi mã trùng khi backend đã gửi mail.
3. Nhập mã 6 chữ số qua `POST /auth/email-verification/verify`. Mã sai/hết hạn giữ người dùng ở màn xác minh và hiển thị lỗi từ backend. Gửi lại dùng `POST /auth/email-verification/request`, tuân theo `resendAfter` và header `Retry-After` khi nhận 429; không tự gọi lặp.
4. Backend xác minh email riêng với việc tạo phiên. Sau xác minh thành công, frontend gọi login để thiết lập cookie HttpOnly rồi chuyển về trang chủ. Mật khẩu vừa đăng ký chỉ giữ trong React memory tối đa 10 phút, không ghi vào URL/history, localStorage hoặc sessionStorage. Nếu tải lại trang hoặc bộ nhớ tạm đã hết, màn xác minh yêu cầu nhập lại mật khẩu để tạo phiên. Nếu email đã xác minh nhưng login lỗi, bước đăng nhập có thể thử lại mà không tiêu thụ lại mã.
5. Trang chủ hiện popup **Hoàn thiện hồ sơ đăng ký**, chỉ có nút **Đồng ý** và biểu tượng **X**. Đồng ý mở form hồ sơ phù hợp với loại đơn vị; X/Escape đóng popup và giữ nguyên phiên tại trang chủ. Không có nút chữ Đóng/Hủy. Click nền không đóng popup. Cờ mở popup được tiêu thụ để không tự xuất hiện lại khi chọn X hoặc quay về trang chủ.
6. Header công khai thay nút Bảng điều khiển bằng avatar và tên người dùng. Menu có ba mục **Profile**, **Hồ sơ đăng ký**, **Đăng xuất**. Đăng xuất gọi API thu hồi phiên, chỉ xóa context và chuyển tới đăng nhập khi API thành công; khi lỗi giữ phiên để thử lại. Avatar dùng ảnh từ dữ liệu tài khoản nếu có, nếu không dùng chữ viết tắt.
7. Profile mở `/profile` để sửa thông tin cá nhân. Hồ sơ đăng ký mới mở form hoàn thiện thông tin nhà trường/nhà cung cấp; hồ sơ đã gửi mở bảng một hàng với thông tin đơn vị, liên hệ, trạng thái và ngày gửi. Hồ sơ PENDING/REJECTED có nút bút chì mở form điền sẵn để sửa, hủy hoặc lưu và quay về bảng. APPROVED chỉ đọc theo quy trình backend.

SYSTEM_ADMIN vẫn đăng nhập vào danh sách hồ sơ đăng ký. Tài khoản đang hoàn thiện hồ sơ đăng nhập về trang chủ, không tự chuyển vào form đơn vị. Route nghiệp vụ tiếp tục chặn tài khoản UNVERIFIED.

Profile, bảng hồ sơ và form hoàn thiện/chỉnh sửa dùng chung `AccountLayout` với header công khai và sidebar chỉ gồm Profile, Hồ sơ đăng ký. Mục đang mở được đánh dấu bằng `aria-current`. Desktop hiện sidebar bên trái; mobile/tablet hẹp dùng nút mở Drawer, hỗ trợ bàn phím/Escape và đóng sau khi chọn mục.

## Màn hình

| Đường dẫn | Nội dung |
| --- | --- |
| `/login` | Đăng nhập chung, hiện/ẩn mật khẩu |
| `/register?type=SCHOOL` | Tạo tài khoản người đại diện nhà trường |
| `/register?type=SUPPLIER` | Tạo tài khoản người đại diện nhà cung cấp |
| `/activate-account` | Nhập mã email, gửi lại, lỗi xác minh và chuyển về trang chủ sau thành công |
| `/` | Trang chủ, avatar/menu tài khoản và popup hoàn thiện hồ sơ sau xác minh/đăng nhập |
| `/profile` | Profile cá nhân: sửa họ tên/số điện thoại; username/email chỉ đọc theo API hiện tại |
| `/register/profile` | Form hồ sơ đơn vị riêng, chưa tự nộp khi sửa Profile |
| `/register/status` | Bảng một hàng hồ sơ lấy từ GET onboarding, trạng thái PENDING/APPROVED/REJECTED và nút sửa |
| `/forgot-password` | Giao diện khôi phục mật khẩu, chưa gửi email vì chưa có API tương ứng |
| `/reset-password?token=...` | Giao diện mật khẩu mới; thiếu token hiển thị liên kết không hợp lệ |

## Hợp đồng API

Đối chiếu `be/src/modules/auth/auth.routes.ts`, các controller/service xác minh email và profile, `be/docs/AUTH_SESSIONS.md`, `be/docs/ONBOARDING.md`. Endpoint nằm trong `src/services/AuthService/urls.js`; UI chỉ gọi service.

- `POST /auth/signup`: username, fullName, email, password, requestType và phone tùy chọn. Không gửi confirmPassword, role/status/ID tổ chức. Xử lý 201/409, giữ các trường khi signup lỗi. Username 3–120 ký tự; password tối thiểu 15 ký tự Unicode, tối đa 72 byte UTF-8.
- `POST /auth/email-verification/request`: `{ email }`, trả `data.expiresIn`, `data.resendAfter`. Backend giới hạn gửi lại 60 giây; mã có hạn 600 giây. Nếu signup đã tạo tài khoản nhưng gửi mail thất bại, màn xác minh cho phép gửi lại, không tạo tài khoản trùng.
- `POST /auth/email-verification/verify`: `{ email, code }` với code là chuỗi 6 chữ số, giữ số 0 ở đầu. Thành công trả `{ emailVerified: true, accountStatus: "UNVERIFIED" }`; không tự tạo School/Supplier hoặc hồ sơ xét duyệt.
- `POST /auth/login`: identifier/password; response user/expiresIn và cookie HttpOnly. Không lưu access/refresh token trong frontend storage.
- `GET /auth/me`: khôi phục phiên, email/phone và trạng thái hồ sơ; đồng thời đọc Profile cá nhân.
- `PATCH /auth/me`: chỉ gửi `{ fullName, phone }`; response `data` trực tiếp là SessionUser đã cập nhật. Sau thành công cập nhật tên/avatar trong context/header. Không tự sửa email/username, role, trạng thái hoặc hồ sơ đơn vị.
- `POST /auth/refresh`: các request 401 đồng thời dùng chung một lần refresh và thử lại một lần; không refresh 403, không chuyển sang dữ liệu demo khi API lỗi.
- `POST /auth/logout`: thu hồi phiên backend.
- `GET/POST /auth/onboarding`: tạo hồ sơ, sửa khi PENDING hoặc gửi lại khi REJECTED; nộp JSON nếu không có tệp, hoặc FormData gồm profile và legalDocument/certificate_0, certificate_1… nếu có tệp. Bỏ hàng chứng nhận hoàn toàn trống trước khi đánh index tệp. Chỉ chuyển PENDING khi API xác nhận. Tài khoản vẫn UNVERIFIED cho tới khi được duyệt.

Request ghi dùng `X-CSRF-Protection: 1`; tất cả request dùng cookie credentials. Chạy frontend tại `http://localhost:3001`, API `http://localhost:5000/api` theo CORS/cookie cùng site hiện tại. Backend cần cấu hình mail provider và hạ tầng của riêng nó; frontend không gửi mail trực tiếp hoặc chứa API key mail.

SessionStorage chỉ giữ thông tin luồng xác minh (email/username/loại đơn vị, thông tin cooldown và trạng thái bước), không giữ mật khẩu, mã OTP hoặc token. Dữ liệu chưa gửi trong form hồ sơ nằm tại trình duyệt. Khi sửa/gửi lại, frontend gửi `retainedDocuments: [{ id, field }]` cho các tệp đã tải lên cần giữ và `expectedUpdatedAt` lấy từ GET để phát hiện bản sửa cũ (409). Khi xóa chứng nhận, index tệp được đánh lại đúng hàng; tệp thay thế mới không gửi kèm ID giữ lại cùng trường. Backend xác minh ID thuộc chính hồ sơ và chỉ dọn tệp bị bỏ sau commit. Không cần chọn lại tệp khi chỉ sửa thông tin.

## Kiểm tra

Chạy `npm run test:registration` và `npm run build`. Các test service thay HTTP adapter, không ghi database hoặc gửi mail thật. Kiểm tra trình duyệt dùng response theo hợp đồng backend cho các bước signup, mã sai/đúng, tạo phiên, đóng/đồng ý popup, ba mục menu, sidebar/Drawer, bảng một hàng, điền sẵn/sửa/hủy hồ sơ, giữ tệp đã tải lên, lưu/lỗi Profile và nộp hồ sơ đơn vị; kiểm tra cả desktop/tablet/mobile. Gửi email và lưu dữ liệu thật cần backend/hạ tầng đang chạy và cấu hình đúng.
