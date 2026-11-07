import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import PrintIcon from "@mui/icons-material/Print"
import styles from "./AllergyPrintModal.module.scss"

export default function AllergyPrintModal({ isOpen, onClose, students }) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const totalStudents = students ? students.length : 0

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <h2 className={styles.title}>Phiếu Tổng hợp Dị ứng Học sinh Giao Bếp ăn</h2>
            <span className={styles.subtitle}>Xem trước bản in khổ A4 chuẩn hành chính bàn giao Bếp trưởng</span>
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
                <span className={styles.docRef}>Số: 21/DS-DUNG/2026</span>
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
                DANH SÁCH HỌC SINH DỊ ỨNG THỰC PHẨM & YÊU CẦU SUẤT ĂN RIÊNG
              </h1>
              <p className={styles.subScope}>
                (Do Giáo viên chủ nhiệm thu thập từ phụ huynh học sinh • Bàn giao Bếp ăn học đường)
              </p>
            </div>

            {/* Bảng chi tiết học sinh */}
            <table className={styles.printTable}>
              <thead>
                <tr>
                  <th style={{ width: "35px" }}>STT</th>
                  <th style={{ width: "120px" }}>Họ tên học sinh</th>
                  <th style={{ width: "60px" }}>Lớp</th>
                  <th style={{ width: "120px" }}>GVCN & SĐT</th>
                  <th style={{ width: "110px" }}>Món dị ứng</th>
                  <th>Biểu hiện khi ăn phải</th>
                  <th style={{ width: "70px", textAlign: "center" }}>Mức độ</th>
                  <th>Lưu ý suất riêng cho Bếp</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, idx) => (
                  <tr key={stu.id}>
                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                    <td>
                      <strong>{stu.studentName}</strong>
                      <br />
                      <small>({stu.gender})</small>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <strong>{stu.className}</strong>
                    </td>
                    <td>
                      <div>{stu.homeroomTeacher}</div>
                      <small>{stu.teacherPhone}</small>
                    </td>
                    <td>
                      <strong>{stu.allergenName}</strong>
                    </td>
                    <td>{stu.symptoms}</td>
                    <td style={{ textAlign: "center" }}>
                      {stu.severity === "HIGH"
                        ? "Nặng"
                        : stu.severity === "MEDIUM"
                        ? "Trung bình"
                        : "Nhẹ"}
                    </td>
                    <td>
                      <small>{stu.dietaryNote}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tổng hợp số liệu */}
            <div className={styles.summaryBox}>
              <span>
                • Tổng số học sinh có thông tin dị ứng: <strong>{totalStudents} học sinh</strong>
              </span>
              <span>
                • Quy tắc phục vụ:{" "}
                <strong>
                  Khay ăn riêng biệt dán tên học sinh & lớp; tuyệt đối không dùng chung dầu ăn, chảo chiên với món chứa dị nguyên
                </strong>
              </span>
            </div>

            {/* Chữ ký xác nhận */}
            <div className={styles.signatureGrid}>
              <div className={styles.sigCol}>
                <strong>ĐẠI DIỆN GVCN CÁC LỚP</strong>
                <span className={styles.sigSub}>(Ký và ghi rõ họ tên)</span>
                <div className={styles.sigSpace} />
              </div>

              <div className={styles.sigCol}>
                <strong>CÁN BỘ Y TẾ TỔNG HỢP</strong>
                <span className={styles.sigSub}>(Ký và ghi rõ họ tên)</span>
                <div className={styles.sigSpace}>
                  <em>CBYT. Nguyễn Thị Lan</em>
                </div>
              </div>

              <div className={styles.sigCol}>
                <strong>BẾP TRƯỞNG TIẾP NHẬN</strong>
                <span className={styles.sigSub}>(Ký và ghi rõ họ tên)</span>
                <div className={styles.sigSpace} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
