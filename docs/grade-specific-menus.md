# Thực đơn và định lượng theo khối

Một tuần có thể có nhiều thực đơn cho các tập khối khác nhau. Một khối chỉ thuộc một thực đơn trong tuần. Có thể chọn nhiều khối dùng chung nếu tất cả các món được chọn có cùng nguyên liệu, vai trò và lượng dùng sau quy đổi đơn vị.

## Sử dụng

1. Ban Giám hiệu cấu hình các khối và gán khối cho lớp.
2. Trong danh mục món, mở **Định lượng khối**, chọn khối, nhập lượng dùng cho một suất và lưu. Có thể sao chép bộ gốc rồi chỉnh sửa. Mỗi khối cần bộ định lượng riêng đã lưu.
3. Khi tạo thực đơn, chọn một hoặc nhiều khối. Nếu các khối dùng lượng khác nhau, tạo các thực đơn riêng. Khối thiếu bộ định lượng không được dùng ngầm bộ gốc.
4. Danh sách thực đơn, màn duyệt, thực đơn bếp và tiến độ chế biến hiển thị phạm vi khối. Khi tuần có nhiều thực đơn, chọn thực đơn trước khi thao tác.
5. Nhu cầu, dị ứng và phân bổ dựa trên lớp thuộc các khối của thực đơn. Không bù số suất giữa các khối; lô chỉ được phân bổ tới lớp trong phạm vi.

Định lượng được chép vào thực đơn lúc lập. Sửa danh mục không thay đổi bữa đã lưu nếu không chọn tính lại công thức; thực đơn đã duyệt chỉ được xem. Thực đơn cũ giữ phạm vi toàn trường.

## Điều kiện triển khai

Phải triển khai backend và migration `20261116000100_grade_specific_menus` trước khi dùng frontend mới. Migration đã được chuẩn bị ở nhánh backend; tác vụ lập trình không tự áp dụng migration hay ghi dữ liệu Azure.

## Kiểm tra trước khi merge

- Hai thực đơn cùng tuần, khối không giao nhau: tạo được; khối giao nhau hoặc ngoài trường: bị từ chối.
- Chọn nhiều khối có công thức tương đương: preview được; thiếu hoặc khác công thức: báo lỗi.
- Đổi công thức trong danh mục: thực đơn đã lưu giữ định lượng cũ khi không chỉnh bữa đó.
- Hai khối có tổng suất đủ nhưng một khối thừa và khối kia thiếu: chưa mở phân bổ.
- Chọn lô của khối này: danh sách lớp không chứa khối khác; backend cũng kiểm tra lại khi lưu.

Kiểm thử tự động: `npm run test:kitchen-nutrition`. Build: `npm run build` (môi trường hạn chế bộ nạp cấu hình có thể dùng `node node_modules/vite/bin/vite.js build --configLoader native`).
