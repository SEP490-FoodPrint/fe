import React from "react"
import styles from "./MenuDetailPrintModal.module.scss"

export default function MenuDetailPrintModal({ isOpen, onClose, menu }) {
  if (!isOpen || !menu) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Actions (Hidden in print) */}
        <div className={styles.modalTopBar}>
          <div className={styles.modalTitle}>
            <span className="material-symbols-outlined text-[20px] text-[#0a8066]">print</span>
            <span>Xem trước bản in thực đơn học đường</span>
          </div>
          <div className={styles.actionGroup}>
            <button type="button" className={styles.btnPrint} onClick={handlePrint}>
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>In thực đơn ngay</span>
            </button>
            <button type="button" className={styles.btnClose} onClick={onClose}>
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 layout) */}
        <div className={styles.paperSheet} id="print-sheet">
          {/* Header */}
          <div className={styles.sheetHeader}>
            <div className={styles.orgInfo}>
              <span className={styles.orgUpper}>SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI</span>
              <strong className={styles.schoolName}>TRƯỜNG LIÊN CẤP VINSCHOOL THE HARMONY</strong>
              <span className={styles.deptName}>BAN Y TẾ & AN TOÀN DINH DƯỠNG HỌC ĐƯỜNG</span>
            </div>
            <div className={styles.docMeta}>
              <span className={styles.docCode}>Mã số: <strong>{menu.code}</strong></span>
              <span className={styles.docDate}>Ngày lập: {menu.date}</span>
              <span className={styles.docStatus}>Trạng thái: <strong>{menu.statusLabel || "Đã phê duyệt"}</strong></span>
            </div>
          </div>

          {/* Title */}
          <div className={styles.sheetTitleBlock}>
            <h1 className={styles.sheetTitle}>BẢNG KẾ HOẠCH THỰC ĐƠN BÁN TRÚ HỌC ĐƯỜNG</h1>
            <p className={styles.sheetSubTitle}>
              (Kèm phương án cách ly suất ăn dị ứng và đối soát nguồn gốc nguyên liệu liên kết)
            </p>
          </div>

          {/* Meta Grid */}
          <div className={styles.metaBox}>
            <div className={styles.metaRow}>
              <span><strong>Ngày phục vụ:</strong> {menu.date}</span>
              <span><strong>Bữa ăn:</strong> {menu.mealType === "LUNCH" ? "Bữa trưa chính" : "Bữa phụ chiều"}</span>
              <span><strong>Khối lớp áp dụng:</strong> {menu.targetScope || "Toàn trường"}</span>
            </div>
            <div className={styles.metaRow}>
              <span><strong>Tổng số suất ăn:</strong> {menu.portionCount} suất</span>
              <span><strong>Suất ăn riêng dị ứng:</strong> {menu.hasAllergyMenu ? "12 suất ăn riêng" : "Không có"}</span>
              <span><strong>Cán bộ Y tế phụ trách:</strong> BS. Nguyễn Thu Trang</span>
            </div>
          </div>

          {/* Section 1: Danh sách món ăn tiêu chuẩn */}
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionTitle}>I. CƠ CẤU MÓN ĂN TIÊU CHUẨN</h3>
            <table className={styles.printTable}>
              <thead>
                <tr>
                  <th style={{ width: "45px", textAlign: "center" }}>STT</th>
                  <th>Tên món ăn</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Định lượng/suất</th>
                  <th>Thành phần chính & Nhà cung cấp liên kết</th>
                </tr>
              </thead>
              <tbody>
                {(menu.dishes || []).map((dish, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td><strong>{dish.name}</strong></td>
                    <td style={{ textAlign: "center" }}>{dish.qty}</td>
                    <td>{(dish.ingredients || []).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Phương án dị ứng nếu có */}
          {menu.hasAllergyMenu && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>II. PHƯƠNG ÁN BỐ TRÍ SUẤT ĂN RIÊNG DỊ ỨNG</h3>
              <div className={styles.allergyPrintBox}>
                <p><strong>Cảnh báo dị nguyên trong thực đơn:</strong> Hải sản giáp xác (Tôm sú, ngao biển).</p>
                <p><strong>Học sinh tiếp nhận suất riêng:</strong> 12 học sinh (Lớp 6A: 07 em; Lớp 7B: 05 em).</p>
                <p>
                  <strong>Món thay thế chuyên biệt:</strong> {menu.substituteDish?.name || "Thịt bò xào rau củ thập cẩm"} (Định lượng: {menu.substituteDish?.qty || "45g"}/suất).
                </p>
                <p><strong>Nguyên liệu thay thế:</strong> {(menu.substituteDish?.ingredients || ["Thịt bò nạc loại 1 - Vissan", "Rau củ"]).join(", ")}.</p>
                <p><strong>Hình thức phục vụ:</strong> Bố trí suất ăn riêng biệt, đảm bảo an toàn dinh dưỡng cho từng học sinh.</p>
              </div>
            </div>
          )}

          {/* Section 3: Gia vị kho */}
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionTitle}>III. GIA VỊ XUẤT KHO TRƯỜNG HỌC</h3>
            <p className={styles.seasoningsLine}>
              {(menu.seasonings || ["Dầu ăn Neptune", "Nước mắm Phú Quốc", "Muối tinh I-ốt", "Hạt nêm Knorr"]).join(" • ")}
            </p>
          </div>

          {/* Signatures */}
          <div className={styles.signaturesRow}>
            <div className={styles.sigCol}>
              <span className={styles.sigRole}>CÁN BỘ Y TẾ LẬP THỰC ĐƠN</span>
              <span className={styles.sigNote}>(Ký và ghi rõ họ tên)</span>
              <div className={styles.sigSpace}></div>
              <strong className={styles.sigName}>BS. Nguyễn Thu Trang</strong>
            </div>

            <div className={styles.sigCol}>
              <span className={styles.sigRole}>ĐẠI DIỆN BẾP ĂN BÁN TRÚ</span>
              <span className={styles.sigNote}>(Ký và ghi rõ họ tên)</span>
              <div className={styles.sigSpace}></div>
              <strong className={styles.sigName}>Bếp trưởng: Lê Văn Minh</strong>
            </div>

            <div className={styles.sigCol}>
              <span className={styles.sigRole}>BAN GIÁM HIỆU PHÊ DUYỆT</span>
              <span className={styles.sigNote}>(Ký, đóng dấu phê duyệt)</span>
              <div className={styles.sigSpace}></div>
              <strong className={styles.sigName}>Phó Hiệu trưởng: Trần Thị Mai</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

