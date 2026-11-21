# Đơn vị tính và cảnh báo nhập hàng

System Admin quản lý tại `/system/measurement-units`, truy cập từ sidebar Đơn vị tính. Danh mục lấy qua MeasurementUnitService; chỉ tài khoản đã đăng nhập đọc được. Bộ chọn nguyên liệu/công thức dùng đơn vị đang hoạt động, giữ lựa chọn lịch sử khi sửa.

Yêu cầu nhập hàng tươi/đợt bổ sung/khô giữ số lẻ đến ba chữ số, không tự làm tròn theo đơn vị đếm. Cảnh báo bước dùng BigInt scale 1000, chỉ nhắc người dùng; không tự sửa dữ liệu và không chặn gửi vì lệch bước. Lỗi số âm/0/quá độ chính xác vẫn chặn. Không tải được danh mục có cảnh báo và nút thử lại, luồng nhập/gửi hiện hữu vẫn hoạt động.

Kiểm thử: `node --test tests/measurement-units.test.mjs`; build FE; kiểm tra mobile 390px, cảnh báo đọc được và nút gửi ít nhất 44px. Migration và kiểm thử cloud ở BE: specs/measurement-units.
