import React, { useState } from "react"
import { Printer, X, FileText, Check, Layers, AlertCircle } from "lucide-react"
import styles from "./InspectionSheetModal.module.scss"

export default function InspectionSheetModal({
  isOpen,
  onClose,
  batchData = {},
  ingredients = [],
  auditData = {}
}) {
  const [activeTab, setActiveTab] = useState("ALL") // "ALL" | "STEP1" | "STEP2" | "STEP3"

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  // Dữ liệu hiển thị từ lô chế biến
  const schoolName = "TRƯỜNG THCS ĐOÀN THỊ ĐIỂM (BẾP ĂN BÁN TRÚ)"
  const examinerName = auditData.confirmedBy || auditData.createdBy || "Nguyễn Văn Vận (Bếp chính)"
  const checkDate = batchData.menuDate || "10/11/2024"
  const dishName = batchData.dishName || "Thịt heo kho cút nước dừa"
  const mealType = `${batchData.mealType || "Bữa trưa"} (Giờ phục vụ: ${batchData.servingTime || "11:15"})`
  const portions = (batchData.portions || 1250).toLocaleString("vi-VN")

  // Phân loại nguyên liệu cho Mẫu số 1:
  // I. Tươi sống, đông lạnh: Thịt ba chỉ heo, trứng cút
  const freshIngredients = [
    {
      id: 1,
      name: "Thịt ba chỉ heo tươi",
      timeIn: "06:15 10/11/2024",
      quantity: "50.0 kg",
      supplierName: "HTX Thực phẩm Sạch Ba Vì",
      supplierContact: "Ba Vì, Hà Nội - ĐT: 024.3838.9999",
      deliveryPerson: "Trần Văn Nam",
      invoice: "HĐ-BV-892",
      vetCert: "Đạt",
      quarantineCert: "KD-892/TY-HN",
      sensoryPass: true,
      quickTestPass: true,
      note: "Đạt chuẩn tươi sống, tem niêm phong nguyên vẹn"
    },
    {
      id: 2,
      name: "Trứng cút tươi sạch",
      timeIn: "06:30 10/11/2024",
      quantity: "1.462 quả",
      supplierName: "Trang trại Gia Cầm Sạch Đông Anh",
      supplierContact: "Đông Anh, Hà Nội - ĐT: 024.3952.1122",
      deliveryPerson: "Lê Thị Hoa",
      invoice: "HĐ-DA-224",
      vetCert: "Đạt",
      quarantineCert: "KD-224/TY-HN",
      sensoryPass: true,
      quickTestPass: true,
      note: "Vỏ nhẵn, nguyên vẹn, không dập vỡ"
    }
  ]

  // II. Thực phẩm khô, bao gói sẵn, phụ gia: Nước dừa xiêm, Gia vị kho
  const dryIngredients = [
    {
      id: 1,
      name: "Nước dừa xiêm nguyên chất",
      manufacturer: "Công ty TNHH Nông sản Bến Tre",
      mfgAddress: "Châu Thành, Tỉnh Bến Tre",
      timeIn: "06:45 10/11/2024",
      quantity: "46.8 lít",
      supplierName: "NPP Thực phẩm Miền Bắc",
      deliveryPerson: "Nguyễn Văn Bình",
      supplierContact: "Hoàng Mai, Hà Nội - 0912.345.678",
      expiryDate: "12/11/2024",
      storageCondition: "Bảo quản lạnh (2°C - 5°C)",
      invoice: "HĐ-BT-018",
      sensoryPass: true,
      note: "Can tiệt trùng, nước thơm thanh đặc trưng"
    },
    {
      id: 2,
      name: "Gia vị kho tổng hợp tiêu chuẩn",
      manufacturer: "Công ty Cổ phần Hàng tiêu dùng Masan",
      mfgAddress: "KCN Tân Bình, TP. Hồ Chí Minh",
      timeIn: "07:00 10/11/2024",
      quantity: "2.46 kg",
      supplierName: "Đại lý Phân phối Gia vị Hà Nội",
      deliveryPerson: "Phạm Văn Hùng",
      supplierContact: "Cầu Giấy, Hà Nội - 0988.765.432",
      expiryDate: "30/12/2024",
      storageCondition: "Nơi khô ráo, thoáng mát",
      invoice: "HĐ-MS-045",
      sensoryPass: true,
      note: "Bao bì nguyên niêm phong nhãn mác"
    }
  ]

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.iconCircle}>
              <Printer size={20} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Sổ kiểm thực ba bước (Theo QĐ số 1246/QĐ-BYT)</h3>
              <p className={styles.modalSub}>
                Ban hành kèm theo Quyết định số 1246/QĐ-BYT ngày 31 tháng 3 năm 2017 của Bộ Y tế
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab chuyển đổi chế độ xem */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "ALL" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            <Layers size={15} />
            <span>Tất cả (Mẫu 1, 2, 3)</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "STEP1" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("STEP1")}
          >
            <span>Mẫu 1: Trước chế biến (Bước 1)</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "STEP2" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("STEP2")}
          >
            <span>Mẫu 2: Khi chế biến (Bước 2)</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "STEP3" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("STEP3")}
          >
            <span>Mẫu 3: Trước khi ăn (Bước 3)</span>
          </button>
        </div>

        {/* Khu vực giấy in biểu mẫu */}
        <div className={styles.sheetScrollArea}>
          <div className={styles.printSheetPaper} id="printable-inspection-records">
            {/* Tiêu đề chung của Phụ lục 1 */}
            <div className={styles.appendixHeader}>
              <span className={styles.appendixTag}>PHỤ LỤC 1</span>
              <h1 className={styles.appendixTitle}>MẪU BIỂU GHI CHÉP KIỂM THỰC BA BƯỚC</h1>
              <p className={styles.appendixDecision}>
                (Ban hành kèm theo Quyết định số 1246/QĐ-BYT ngày 31 tháng 3 năm 2017 của Bộ Y tế)
              </p>
            </div>

            {/* ========================================================================= */}
            {/* MẪU SỐ 1: KIỂM TRA TRƯỚC KHI CHẾ BIẾN THỨC ĂN (BƯỚC 1) */}
            {/* ========================================================================= */}
            {(activeTab === "ALL" || activeTab === "STEP1") && (
              <section className={styles.sheetSection}>
                <div className={styles.sampleHeaderBox}>
                  <div className={styles.metaInfoGrid}>
                    <div><strong>Tên cơ sở:</strong> {schoolName}</div>
                    <div><strong>Người kiểm tra:</strong> {examinerName}</div>
                    <div><strong>Thời gian kiểm tra:</strong> Ngày {checkDate}</div>
                    <div><strong>Địa điểm kiểm tra:</strong> Khu tiếp nhận nguyên liệu &amp; Kho thực phẩm</div>
                  </div>
                  <h2 className={styles.sampleMainTitle}>
                    Mẫu số 1: Kiểm tra trước khi chế biến thức ăn (Bước 1)
                  </h2>
                </div>

                {/* Bảng I: Tươi sống, đông lạnh */}
                <div className={styles.tableBlock}>
                  <div className={styles.tableCategoryTitle}>
                    I. Thực phẩm tươi sống, đông lạnh: thịt, cá, rau, củ, quả...
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.legalTable}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ width: "3%" }}>TT</th>
                          <th rowSpan={2} style={{ width: "13%" }}>Tên thực phẩm</th>
                          <th rowSpan={2} style={{ width: "9%" }}>Thời gian nhập<br />(ngày, giờ)</th>
                          <th rowSpan={2} style={{ width: "7%" }}>Khối lượng<br />(kg/lít...)</th>
                          <th colSpan={3} style={{ width: "26%" }}>Nơi cung cấp</th>
                          <th rowSpan={2} style={{ width: "7%" }}>Chứng từ, hóa đơn</th>
                          <th rowSpan={2} style={{ width: "6%" }}>Giấy ĐK VS thú y</th>
                          <th rowSpan={2} style={{ width: "7%" }}>Giấy kiểm dịch</th>
                          <th colSpan={2} style={{ width: "10%" }}>Kiểm tra cảm quan<br />(màu, mùi vị, trạng thái...)</th>
                          <th colSpan={2} style={{ width: "8%" }}>Xét nghiệm nhanh<br />(nếu có)</th>
                          <th rowSpan={2} style={{ width: "11%" }}>Biện pháp xử lý / Ghi chú</th>
                        </tr>
                        <tr>
                          <th style={{ width: "10%" }}>Tên cơ sở</th>
                          <th style={{ width: "10%" }}>Địa chỉ, điện thoại</th>
                          <th style={{ width: "6%" }}>Tên người giao hàng</th>
                          <th style={{ width: "5%" }}>Đạt</th>
                          <th style={{ width: "5%" }}>Không đạt</th>
                          <th style={{ width: "4%" }}>Đạt</th>
                          <th style={{ width: "4%" }}>Không đạt</th>
                        </tr>
                        <tr className={styles.numRow}>
                          <td>(1)</td>
                          <td>(2)</td>
                          <td>(3)</td>
                          <td>(4)</td>
                          <td>(5)</td>
                          <td>(6)</td>
                          <td>(7)</td>
                          <td>(8)</td>
                          <td>(9)</td>
                          <td>(10)</td>
                          <td>(11)</td>
                          <td>(12)</td>
                          <td>(13)</td>
                          <td>(14)</td>
                          <td>(15)</td>
                        </tr>
                      </thead>
                      <tbody>
                        {freshIngredients.map((item, idx) => (
                          <tr key={item.id}>
                            <td className={styles.textCenter}>{idx + 1}</td>
                            <td><strong>{item.name}</strong></td>
                            <td className={styles.textCenter}>{item.timeIn}</td>
                            <td className={styles.textCenter}><strong>{item.quantity}</strong></td>
                            <td>{item.supplierName}</td>
                            <td className={styles.smallText}>{item.supplierContact}</td>
                            <td className={styles.textCenter}>{item.deliveryPerson}</td>
                            <td className={styles.monoCell}>{item.invoice}</td>
                            <td className={styles.textCenter}>{item.vetCert}</td>
                            <td className={styles.monoCell}>{item.quarantineCert}</td>
                            <td className={styles.textCenter}>
                              {item.sensoryPass ? <span className={styles.checkIcon}>✓</span> : ""}
                            </td>
                            <td className={styles.textCenter}>{!item.sensoryPass ? "X" : ""}</td>
                            <td className={styles.textCenter}>
                              {item.quickTestPass ? <span className={styles.checkIcon}>✓</span> : ""}
                            </td>
                            <td className={styles.textCenter}>{!item.quickTestPass ? "X" : ""}</td>
                            <td className={styles.smallText}>{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bảng II: Thực phẩm khô, bao gói sẵn, phụ gia */}
                <div className={styles.tableBlock}>
                  <div className={styles.tableCategoryTitle}>
                    II. Thực phẩm khô và thực phẩm bao gói sẵn, phụ gia thực phẩm:
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.legalTable}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ width: "3%" }}>TT</th>
                          <th rowSpan={2} style={{ width: "12%" }}>Tên thực phẩm</th>
                          <th rowSpan={2} style={{ width: "11%" }}>Tên cơ sở sản xuất</th>
                          <th rowSpan={2} style={{ width: "10%" }}>Địa chỉ sản xuất</th>
                          <th rowSpan={2} style={{ width: "8%" }}>Thời gian nhập<br />(ngày, giờ)</th>
                          <th rowSpan={2} style={{ width: "6%" }}>Khối lượng<br />(kg/lít...)</th>
                          <th colSpan={3} style={{ width: "20%" }}>Nơi cung cấp</th>
                          <th rowSpan={2} style={{ width: "7%" }}>Hạn sử dụng</th>
                          <th rowSpan={2} style={{ width: "8%" }}>Điều kiện bảo quản<br />(T° thường/lạnh...)</th>
                          <th rowSpan={2} style={{ width: "6%" }}>Chứng từ, hóa đơn</th>
                          <th colSpan={2} style={{ width: "9%" }}>Kiểm tra cảm quan<br />(nhãn, bao bì...)</th>
                          <th rowSpan={2} style={{ width: "10%" }}>Biện pháp xử lý / Ghi chú</th>
                        </tr>
                        <tr>
                          <th style={{ width: "7%" }}>Tên cơ sở</th>
                          <th style={{ width: "6%" }}>Tên chủ giao hàng</th>
                          <th style={{ width: "7%" }}>Địa chỉ, điện thoại</th>
                          <th style={{ width: "4.5%" }}>Đạt</th>
                          <th style={{ width: "4.5%" }}>Không đạt</th>
                        </tr>
                        <tr className={styles.numRow}>
                          <td>(1)</td>
                          <td>(2)</td>
                          <td>(3)</td>
                          <td>(4)</td>
                          <td>(5)</td>
                          <td>(6)</td>
                          <td>(7)</td>
                          <td>(8)</td>
                          <td>(9)</td>
                          <td>(10)</td>
                          <td>(11)</td>
                          <td>(12)</td>
                          <td>(13)</td>
                          <td>(14)</td>
                          <td>(15)</td>
                        </tr>
                      </thead>
                      <tbody>
                        {dryIngredients.map((item, idx) => (
                          <tr key={item.id}>
                            <td className={styles.textCenter}>{idx + 1}</td>
                            <td><strong>{item.name}</strong></td>
                            <td>{item.manufacturer}</td>
                            <td className={styles.smallText}>{item.mfgAddress}</td>
                            <td className={styles.textCenter}>{item.timeIn}</td>
                            <td className={styles.textCenter}><strong>{item.quantity}</strong></td>
                            <td>{item.supplierName}</td>
                            <td className={styles.textCenter}>{item.deliveryPerson}</td>
                            <td className={styles.smallText}>{item.supplierContact}</td>
                            <td className={styles.textCenter}><strong>{item.expiryDate}</strong></td>
                            <td className={styles.smallText}>{item.storageCondition}</td>
                            <td className={styles.monoCell}>{item.invoice}</td>
                            <td className={styles.textCenter}>
                              {item.sensoryPass ? <span className={styles.checkIcon}>✓</span> : ""}
                            </td>
                            <td className={styles.textCenter}>{!item.sensoryPass ? "X" : ""}</td>
                            <td className={styles.smallText}>{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chữ ký xác nhận Mẫu 1 */}
                <div className={styles.signatureBox}>
                  <div className={styles.signCol}>
                    <span className={styles.signTitle}>NGƯỜI GIAO HÀNG</span>
                    <span className={styles.signDesc}>(Ký và ghi rõ họ tên)</span>
                    <div className={styles.signSpacer} />
                    <span className={styles.signPerson}>Trần Văn Nam</span>
                  </div>
                  <div className={styles.signCol}>
                    <span className={styles.signTitle}>NGƯỜI KIỂM TRA</span>
                    <span className={styles.signDesc}>(Ký và ghi rõ họ tên)</span>
                    <div className={styles.signSpacer} />
                    <span className={styles.signPerson}>{examinerName}</span>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* MẪU SỐ 2: KIỂM TRA KHI CHẾ BIẾN THỨC ĂN (BƯỚC 2) */}
            {/* ========================================================================= */}
            {(activeTab === "ALL" || activeTab === "STEP2") && (
              <section className={styles.sheetSection}>
                <div className={styles.sectionDivider} />
                <div className={styles.sampleHeaderBox}>
                  <div className={styles.metaInfoGrid}>
                    <div><strong>Tên cơ sở:</strong> {schoolName}</div>
                    <div><strong>Người kiểm tra:</strong> {examinerName}</div>
                    <div><strong>Thời gian kiểm tra:</strong> Ngày {checkDate}</div>
                    <div><strong>Địa điểm kiểm tra:</strong> Khu sơ chế và bếp nấu chính</div>
                  </div>
                  <h2 className={styles.sampleMainTitle}>
                    Mẫu số 2: Kiểm tra khi chế biến thức ăn (Bước 2)
                  </h2>
                </div>

                <div className={styles.tableBlock}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.legalTable}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ width: "3%" }}>TT</th>
                          <th rowSpan={2} style={{ width: "10%" }}>Ca/bữa ăn<br />(Bữa ăn, giờ ăn...)</th>
                          <th rowSpan={2} style={{ width: "13%" }}>Tên món ăn</th>
                          <th rowSpan={2} style={{ width: "18%" }}>Nguyên liệu chính để chế biến<br />(tên, số lượng...)</th>
                          <th rowSpan={2} style={{ width: "8%" }}>Số lượng/<br />số suất ăn</th>
                          <th rowSpan={2} style={{ width: "8%" }}>Thời gian sơ chế xong<br />(ngày, giờ)</th>
                          <th rowSpan={2} style={{ width: "8%" }}>Thời gian chế biến xong<br />(ngày, giờ)</th>
                          <th colSpan={3} style={{ width: "18%" }}>
                            Kiểm tra điều kiện vệ sinh<br />(từ bắt đầu sơ chế đến khi chế biến xong)
                          </th>
                          <th colSpan={2} style={{ width: "10%" }}>
                            Kiểm tra cảm quan thức ăn<br />(màu, mùi, vị, trạng thái...)
                          </th>
                          <th rowSpan={2} style={{ width: "12%" }}>Biện pháp xử lý / Ghi chú</th>
                        </tr>
                        <tr>
                          <th style={{ width: "6%" }}>Người tham gia chế biến</th>
                          <th style={{ width: "6%" }}>Trang thiết bị dụng cụ</th>
                          <th style={{ width: "6%" }}>Khu vực chế biến và phụ trợ</th>
                          <th style={{ width: "5%" }}>Đạt</th>
                          <th style={{ width: "5%" }}>Không đạt</th>
                        </tr>
                        <tr className={styles.numRow}>
                          <td>(1)</td>
                          <td>(2)</td>
                          <td>(3)</td>
                          <td>(4)</td>
                          <td>(5)</td>
                          <td>(6)</td>
                          <td>(7)</td>
                          <td>(8)</td>
                          <td>(9)</td>
                          <td>(10)</td>
                          <td>(11)</td>
                          <td>(12)</td>
                          <td>(13)</td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className={styles.textCenter}>1</td>
                          <td className={styles.textCenter}>{mealType}</td>
                          <td><strong>{dishName}</strong></td>
                          <td className={styles.smallText}>
                            Thịt ba chỉ heo tươi (50.0kg), Trứng cút sạch (1.462 quả), Nước dừa xiêm (46.8L), Gia vị kho tiêu chuẩn (2.46kg).
                          </td>
                          <td className={styles.textCenter}><strong>{portions} suất</strong></td>
                          <td className={styles.textCenter}>08:30<br />{checkDate}</td>
                          <td className={styles.textCenter}>10:25<br />{checkDate}</td>
                          <td className={styles.textCenter}>
                            <span className={styles.tagPass}>Đạt</span>
                            <div className={styles.subNote}>Bảo hộ, găng tay, mũ đủ</div>
                          </td>
                          <td className={styles.textCenter}>
                            <span className={styles.tagPass}>Đạt</span>
                            <div className={styles.subNote}>Inox 304 tiệt trùng</div>
                          </td>
                          <td className={styles.textCenter}>
                            <span className={styles.tagPass}>Đạt</span>
                            <div className={styles.subNote}>Sàn khô, cống thoát tốt</div>
                          </td>
                          <td className={styles.textCenter}>
                            <span className={styles.checkIcon}>✓</span>
                          </td>
                          <td className={styles.textCenter}></td>
                          <td className={styles.smallText}>
                            Đun nấu chín sôi kỹ &gt; 100°C. Màu sắc cánh gián tự nhiên, thơm ngon đặc trưng, đạt điều kiện ra khay.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chữ ký xác nhận Mẫu 2 */}
                <div className={styles.signatureBox}>
                  <div className={styles.signCol}>
                    <span className={styles.signTitle}>NGƯỜI NẤU CHÍNH</span>
                    <span className={styles.signDesc}>(Ký và ghi rõ họ tên)</span>
                    <div className={styles.signSpacer} />
                    <span className={styles.signPerson}>{auditData.createdBy || "Nguyễn Văn Vận"}</span>
                  </div>
                  <div className={styles.signCol}>
                    <span className={styles.signTitle}>NGƯỜI KIỂM TRA</span>
                    <span className={styles.signDesc}>(Ký và ghi rõ họ tên)</span>
                    <div className={styles.signSpacer} />
                    <span className={styles.signPerson}>{examinerName}</span>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* MẪU SỐ 3: KIỂM TRA TRƯỚC KHI ĂN (BƯỚC 3) */}
            {/* ========================================================================= */}
            {(activeTab === "ALL" || activeTab === "STEP3") && (
              <section className={styles.sheetSection}>
                <div className={styles.sectionDivider} />
                <div className={styles.sampleHeaderBox}>
                  <div className={styles.metaInfoGrid}>
                    <div><strong>Tên cơ sở:</strong> {schoolName}</div>
                    <div><strong>Người kiểm tra:</strong> Cán bộ Y tế học đường / Bếp trưởng</div>
                    <div><strong>Thời gian kiểm tra:</strong> Ngày {checkDate}</div>
                    <div><strong>Địa điểm kiểm tra:</strong> Khu chia suất và phòng ăn học sinh</div>
                  </div>
                  <h2 className={styles.sampleMainTitle}>
                    Mẫu số 3: Kiểm tra trước khi ăn (Bước 3)
                  </h2>
                </div>

                <div className={styles.tableBlock}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.legalTable}>
                      <thead>
                        <tr>
                          <th rowSpan={2} style={{ width: "4%" }}>TT</th>
                          <th rowSpan={2} style={{ width: "12%" }}>Ca/bữa ăn<br />(Bữa ăn, giờ ăn...)</th>
                          <th rowSpan={2} style={{ width: "18%" }}>Tên món ăn</th>
                          <th rowSpan={2} style={{ width: "10%" }}>Số lượng<br />suất ăn</th>
                          <th rowSpan={2} style={{ width: "10%" }}>Thời gian chia món ăn xong<br />(ngày, giờ)</th>
                          <th rowSpan={2} style={{ width: "10%" }}>Thời gian bắt đầu ăn<br />(ngày, giờ)</th>
                          <th colSpan={2} style={{ width: "16%" }}>
                            Dụng cụ chia, chứa đựng,<br />che đậy, bảo quản thức ăn
                          </th>
                          <th colSpan={2} style={{ width: "14%" }}>
                            Kiểm tra cảm quan món ăn<br />(màu, mùi, vị, trạng thái...)
                          </th>
                          <th rowSpan={2} style={{ width: "16%" }}>Biện pháp xử lý / Ghi chú</th>
                        </tr>
                        <tr>
                          <th style={{ width: "8%" }}>Đạt</th>
                          <th style={{ width: "8%" }}>Không đạt</th>
                          <th style={{ width: "7%" }}>Đạt</th>
                          <th style={{ width: "7%" }}>Không đạt</th>
                        </tr>
                        <tr className={styles.numRow}>
                          <td>(1)</td>
                          <td>(2)</td>
                          <td>(3)</td>
                          <td>(4)</td>
                          <td>(5)</td>
                          <td>(6)</td>
                          <td>(7)</td>
                          <td>(8)</td>
                          <td>(9)</td>
                          <td>(10)</td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className={styles.textCenter}>1</td>
                          <td className={styles.textCenter}>{mealType}</td>
                          <td><strong>{dishName}</strong></td>
                          <td className={styles.textCenter}><strong>{portions} suất</strong></td>
                          <td className={styles.textCenter}>10:50<br />{checkDate}</td>
                          <td className={styles.textCenter}>11:15<br />{checkDate}</td>
                          <td className={styles.textCenter}>
                            <span className={styles.checkIcon}>✓</span>
                            <div className={styles.subNote}>Khay inox 304, có nắp đậy giữ nhiệt</div>
                          </td>
                          <td className={styles.textCenter}></td>
                          <td className={styles.textCenter}>
                            <span className={styles.checkIcon}>✓</span>
                            <div className={styles.subNote}>Nhiệt độ &gt; 65°C</div>
                          </td>
                          <td className={styles.textCenter}></td>
                          <td className={styles.smallText}>
                            Món ăn nóng sốt, thơm ngon, hương vị đậm đà vừa miệng học sinh. Đạt tiêu chuẩn an toàn cho phép chia suất phục vụ.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chữ ký xác nhận Mẫu 3 */}
                <div className={styles.signatureBox}>
                  <div className={styles.signCol}>
                    <span className={styles.signTitle}>NGƯỜI KIỂM TRA</span>
                    <span className={styles.signDesc}>(Ký và ghi rõ họ tên)</span>
                    <div className={styles.signSpacer} />
                    <span className={styles.signPerson}>{auditData.completedBy || "Trần Thị Mai (Tổ trưởng / Y tế)"}</span>
                  </div>
                  <div className={styles.signCol}>
                    <span className={styles.signTitle}>ĐẠI DIỆN BAN GIÁM HIỆU / CƠ SỞ</span>
                    <span className={styles.signDesc}>(Ký và ghi rõ họ tên)</span>
                    <div className={styles.signSpacer} />
                    <span className={styles.signPerson}>Ban Giám Hiệu Nhà Trường</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer Modal Action */}
        <div className={styles.modalFooter}>
          <div className={styles.footerTip}>
            <FileText size={15} />
            <span>
              Biểu mẫu Sổ kiểm thực 3 bước chuẩn hóa theo đúng Quyết định 1246/QĐ-BYT (khổ A4 ngang Landscape).
            </span>
          </div>
          <div className={styles.footerBtns}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Đóng
            </button>
            <button type="button" className={styles.btnPrint} onClick={handlePrint}>
              <Printer size={16} />
              <span>In sổ kiểm thực 3 bước</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
