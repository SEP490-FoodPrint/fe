# Định lượng trong hai vai trò bếp và dinh dưỡng

Ngày rà soát: 17/11/2026. Phạm vi: các route của `SCHOOL_KITCHEN_STAFF`,
`SCHOOL_NUTRITION_OFFICER` và component dùng chung được các màn đó gọi.

Khối lượng hiển thị bằng g; thể tích bằng ml. Dữ liệu kg/l từ API được đổi
cả số lượng và đơn vị để hiển thị, ví dụ 1.2 kg → 1200 g, 0.25 l → 250 ml.
Không tự nâng g/ml lên kg/l khi số lượng vượt 1000. Đơn vị đếm như quả, cái,
hộp và các đơn vị khác chưa có quy tắc quy đổi được giữ theo dữ liệu.

| Vai trò | Vị trí có định lượng | Kết quả rà soát |
| --- | --- | --- |
| Dinh dưỡng | Danh sách món ăn: thêm/sửa và xem chi tiết, theo khối | Chuẩn hóa giá trị và đơn vị hiển thị, cả khi chọn nguyên liệu chưa nhập định lượng; cập nhật đơn vị cùng số lượng khi người dùng nhập. Giữ nguyên phần sửa giao diện đang có. |
| Dinh dưỡng | Tạo/chỉnh sửa thực đơn: bảng nguyên liệu và gia vị, xem trước theo khối | Chuẩn hóa định lượng hiển thị về g/ml; khi nhập lại nguyên liệu, gửi giá trị cùng đơn vị nhỏ tương ứng. |
| Dinh dưỡng | Chi tiết thực đơn: nguyên liệu món ăn, nguyên liệu dị ứng và gia vị | Chuẩn hóa mọi cặp số lượng/đơn vị khi hiển thị. |
| Dinh dưỡng | Chi tiết thực đơn: so sánh định lượng các khối | Gộp cùng nguyên liệu cùng đơn vị nhỏ vào một hàng; 0.1 kg và 120 g hiển thị là 100 g và 120 g. |
| Bếp | Tạo lô nấu chung/nấu riêng, phương án xác nhận | Lượng nguyên liệu và gia vị từ lô kho kg/l hiển thị thành g/ml. |
| Bếp | Tiến độ chế biến: popup chi tiết lô và thông tin mẫu đã lưu | Chuẩn hóa cả dữ liệu số lượng/đơn vị và chuỗi định lượng cũ như `6 kg`. |
| Bếp | Chi tiết lô: nguyên liệu chính và gia vị từng món | Hiển thị định lượng từ API/công thức bằng đơn vị nhỏ. |
| Bếp | Danh sách lưu mẫu desktop/mobile, chi tiết mẫu, sửa mẫu và xác nhận hủy mẫu | Chuẩn hóa số lượng và đơn vị; cột đổi thành “Lượng mẫu” để không ghi nhầm thể tích là gam. Form tạo mẫu hiện đã chỉ cho g/ml. |
| Cả hai | Kiểm tra nguyên liệu: chi tiết đợt giao, từng lô, xem QR, popup đánh giá | Đổi kg/l từ API thành g/ml ở lớp hiển thị. |

Các màn tổng quan, thông tin dị ứng, danh sách thực đơn tuần, phân bổ suất ăn và
tủ lưu mẫu không có thao tác tự nâng định lượng g/ml lên kg/l trong luồng đang dùng.
Số suất, số học sinh và số lô vẫn là đơn vị đếm.

## Code cũ còn tồn tại

- `MenuPlanning/component/MenuSeasoningCard.jsx` có phép chia 1000 để đổi tổng
  gia vị sang kg/l. Đã bỏ phép nâng đơn vị và bổ sung kiểm tra tổng trên 1000.
  Component này hiện không được các màn route import trực tiếp.
- `KitchenCooking/EditBatch/` vẫn có dữ liệu mẫu và nhãn kg; màn này chưa được
  khai báo trong AppRouter hiện tại.
- `CreateBatchSeparate/component/ProposedSeparateBatchSection.jsx` có dữ liệu
  mẫu 50 kg/46.8 lít; component này hiện chưa được màn tạo lô riêng import.

Không đổi đơn vị lưu trữ trong DB hoặc loại bỏ phép quy đổi phục vụ tính tồn kho
của Backend. Việc giữ đúng đơn vị nguồn khi giữ/trừ kho vẫn cần thiết; thay đổi
này thống nhất cách đọc định lượng trên giao diện.
