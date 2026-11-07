import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import PrintIcon from "@mui/icons-material/Print"
import styles from "./AllergyPrintModal.module.scss"

export default function AllergyPrintModal({ isOpen, onClose, classes }) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const totalAllergyPortions = classes.reduce(
    (sum, c) => sum + (c.totalAllergyStudents || 0),
    0
  )

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <h2 className={styles.title}>Phiếu Tổng hợp Dị ứng Giao Bếp ăn</h2>
            <span className={styles.subtitle}>Xem trước bản in chuẩn A4 bàn giao Bếp trưởng</span>
          </div>
          <div className={styles.topActions}>
            <button type="button" className={styles.printBtn} onClick={handlePrint}>
              <PrintIcon className={styles.btnIcon} />
              <span>In Phiếu này</span>
            </button>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className={styles.printPreviewArea}>
          {/* Vùng giấy A4 */}
          <div className={styles.a4Paper} id="printable-allergy-sheet">
            {/* Header văn bản trường học */}
            <div className={styles.docHeader}>
              <div className={styles.docLeft}>
                <strong>TRƯỜNG TIỂU HỌC TÂN ĐỊNH</strong>
                <span>BỘ PHẬN Y TẾ HỌC ĐƯỜNG</span>
                <span className={styles.docRef}>Số: 18/TB-YTHD/2026</span>
              </div>
              <div className={styles.docRight}>
                <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong>
                <span>Độc lập – Tự do – Hạnh phúc</span>
                <span className={styles.docDate}>Hà Nội, ngày 27 tháng 10 năm 2026</span>
              </div>
            </div>

            {/* Tiêu đề chính */}
            <div className={styles.docTitleBlock}>
              <h1 className={styles.mainTitle}>
                PHIẾU TỔNG HỢP HỒ SƠ DỊ ỨNG & KẾ HOẠCH BỐ TRÍ SUẤT ĂN RIÊNG
              </h1>
              <p className={styles.subScope}>
                Áp dụng cho bếp ăn bán trú học đường • Học kỳ I – Năm học 2026 – 2027
              </p>
            </div>

            {/* Bảng chi tiết từng lớp */}
            <table className={styles.printTable}>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>STT</th>
                  <th style={{ width: "70px" }}>Lớp</th>
                  <th style={{ width: "130px" }}>GVCN & SĐT</th>
                  <th>Dị nguyên & Nguyên liệu cần tránh</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Số ca</th>
                  <th>Khuyến nghị món thay thế</th>
                  <th style={{ width: "160px" }}>Lưu ý an toàn Bếp</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, idx) => (
                  <tr key={cls.id}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>
                      <strong>{cls.className}</strong>
                    </td>
                    <td>
                      <div>{cls.homeroomTeacher}</div>
                      <small>{cls.teacherPhone}</small>
                    </td>
                    <td>
                      {cls.allergies.map((a, i) => (
                        <div key={i} className={styles.aRow}>
                          <strong>{a.allergenName}:</strong> {a.ingredients.join(", ")}
                        </div>
                      ))}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      {cls.totalAllergyStudents} suất
                    </td>
                    <td>
                      {cls.allergies.map((a, i) => (
                        <div key={i}>• {a.recommendedAlternative || "Thực đơn tiêu chuẩn riêng"}</div>
                      ))}
                    </td>
                    <td>
                      <small>
                        {cls.allergies.map((a) => a.kitchenNote).join("; ")}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tổng hợp số liệu */}
            <div className={styles.summaryBox}>
              <span>
                • Tổng số lớp có học sinh dị ứng: <strong>{classes.length} lớp</strong>
              </span>
              <span>
                • Tổng số suất ăn riêng cần chuẩn bị mỗi bữa xung đột:{" "}
                <strong>{totalAllergyPortions} suất</strong>
              </span>
              <span>
                • Tiêu chuẩn đóng khay: <strong>Dán nhãn định danh lớp & nắp giữ nhiệt riêng</strong>
              </span>
            </div>

            {/* Chữ ký xác nhận */}
            <div className={styles.signatureGrid}>
              <div className={styles.sigCol}>
                <strong>BẾP TRƯỞNG TIẾP NHẬN</strong>
                <span className={styles.sigSub}>(Ký và ghi rõ họ tên)</span>
                <div className={styles.sigSpace} />
              </div>

              <div className={styles.sigCol}>
                <strong>CÁN BỘ Y TẾ LẬP BIỂU</strong>
                <span className={styles.sigSub}>(Ký và ghi rõ họ tên)</span>
                <div className={styles.sigSpace}>
                  <em>Ths.Bs Trần Thu Trang</em>
                </div>
              </div>

              <div className={styles.sigCol}>
                <strong>HIỆU TRƯỞNG PHÊ DUYỆT</strong>
                <span className={styles.sigSub}>(Ký, đóng dấu)</span>
                <div className={styles.sigSpace} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

