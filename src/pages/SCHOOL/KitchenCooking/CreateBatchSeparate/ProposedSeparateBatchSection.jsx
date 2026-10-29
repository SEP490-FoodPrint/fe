import React, { useState } from "react"
import styles from "./ProposedSeparateBatchSection.module.scss"

export default function ProposedSeparateBatchSection() {
  const [expandedBatch1, setExpandedBatch1] = useState(false)
  const [expandedBatch2, setExpandedBatch2] = useState(false)

  return (
    <section className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithBadge}>
          <div className={styles.numberBadge}>3</div>
          <h2 className={styles.sectionTitle}>Phương án chế biến dự kiến</h2>
        </div>
        <span className={styles.ruleNotice}>
          Tự động cấu hình theo định luật bảo toàn lô
        </span>
      </div>

      {/* Thẻ ghi chú chế độ */}
      <div className={styles.modeNoteCard}>
        <div className={styles.modeNoteLeft}>
          <span className={`material-symbols-outlined ${styles.schemaIcon}`}>
            schema
          </span>
          <span className={styles.modeNoteText}>
            Phân chia tự động theo quy định nấu riêng của nhà trường để tối ưu
            truy xuất nguồn gốc
          </span>
        </div>
        <div className={styles.modeNoteBadge}>
          Tổng mẻ đề xuất: 02 mẻ độc lập | Tổng suất: 1.250 suất (100%)
        </div>
      </div>

      {/* Bảng phương án 2 mẻ chế biến */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>TÊN MẺ / MÃ MẺ DỰ KIẾN</th>
              <th>MÓN ĂN</th>
              <th>SỐ SUẤT DỰ KIẾN</th>
              <th>SỐ LÔ NGUYÊN LIỆU SỬ DỤNG</th>
              <th className={styles.textCenter}>TRẠNG THÁI MẺ</th>
              <th className={`${styles.thRight} ${styles.textRight}`}>
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Hàng 1: Mẻ 1 */}
            <tr className={styles.trHover}>
              <td>
                <div className={styles.batchTitleCol}>
                  <div className={styles.batchIndex}>1</div>
                  <div className={styles.batchMeta}>
                    <span className={styles.batchName}>Mẻ chế biến 1</span>
                    <span className={styles.batchCode}>
                      Lô dự kiến: CB-20261026-001
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.dishText}>
                  Thịt heo kho cút nước dừa
                </span>
              </td>
              <td>
                <div className={styles.portionCol}>
                  <span className={styles.portionMain}>731 suất</span>
                  <span className={styles.portionSub}>
                    (58.5% tổng nhu cầu)
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.lotsCol}>
                  <span className={styles.lotsTitle}>04 lô nguyên liệu</span>
                  <span className={styles.lotsDesc}>
                    Thịt heo{" "}
                    <span className={styles.lotHighlight}>LOT-HEO-892</span>{" "}
                    (50.0 kg), Trứng cút, Nước dừa, Gia vị
                  </span>
                </div>
              </td>
              <td className={styles.textCenter}>
                <span className={styles.verifiedTag}>
                  <span className="material-symbols-outlined">verified</span>
                  <span>Đạt chuẩn Nấu riêng</span>
                </span>
              </td>
              <td className={styles.textRight}>
                <button
                  type="button"
                  className={styles.detailBtn}
                  onClick={() => setExpandedBatch1(!expandedBatch1)}
                >
                  <span>Chi tiết</span>
                  <span className="material-symbols-outlined">
                    {expandedBatch1 ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </td>
            </tr>

            {/* Chi tiết Mẻ 1 */}
            {expandedBatch1 && (
              <tr>
                <td colSpan={6} className={styles.expandedCell}>
                  <div className={styles.expandedBox}>
                    <span className={styles.expandedTitle}>
                      Chi tiết phân bổ mẻ 1 (731 suất học sinh):
                    </span>
                    <div className={styles.expandedGrid}>
                      <div className={styles.expandedCard}>
                        <span>• Thịt ba chỉ:</span>
                        <strong>50.0 kg (LOT-HEO-892)</strong>
                      </div>
                      <div className={styles.expandedCard}>
                        <span>• Trứng cút:</span>
                        <strong>1.462 quả (LOT-CUT-224)</strong>
                      </div>
                      <div className={styles.expandedCard}>
                        <span>• Nước dừa:</span>
                        <strong>46.8 lít (LOT-DUA-018)</strong>
                      </div>
                      <div className={styles.expandedCard}>
                        <span>• Gia vị kho:</span>
                        <strong>2.46 kg (LOT-GVI-045)</strong>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* Hàng 2: Mẻ 2 */}
            <tr className={styles.trHover}>
              <td>
                <div className={styles.batchTitleCol}>
                  <div className={styles.batchIndex}>2</div>
                  <div className={styles.batchMeta}>
                    <span className={styles.batchName}>Mẻ chế biến 2</span>
                    <span className={styles.batchCode}>
                      Lô dự kiến: CB-20261026-002
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.dishText}>
                  Thịt heo kho cút nước dừa
                </span>
              </td>
              <td>
                <div className={styles.portionCol}>
                  <span className={styles.portionMain}>519 suất</span>
                  <span className={styles.portionSub}>
                    (41.5% tổng nhu cầu)
                  </span>
                </div>
              </td>
              <td>
                <div className={styles.lotsCol}>
                  <span className={styles.lotsTitle}>04 lô nguyên liệu</span>
                  <span className={styles.lotsDesc}>
                    Thịt heo{" "}
                    <span className={styles.lotHighlight}>LOT-HEO-893</span>{" "}
                    (35.5 kg), Trứng cút, Nước dừa, Gia vị
                  </span>
                </div>
              </td>
              <td className={styles.textCenter}>
                <span className={styles.verifiedTag}>
                  <span className="material-symbols-outlined">verified</span>
                  <span>Đạt chuẩn Nấu riêng</span>
                </span>
              </td>
              <td className={styles.textRight}>
                <button
                  type="button"
                  className={styles.detailBtn}
                  onClick={() => setExpandedBatch2(!expandedBatch2)}
                >
                  <span>Chi tiết</span>
                  <span className="material-symbols-outlined">
                    {expandedBatch2 ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </td>
            </tr>

            {/* Chi tiết Mẻ 2 */}
            {expandedBatch2 && (
              <tr>
                <td colSpan={6} className={styles.expandedCell}>
                  <div className={styles.expandedBox}>
                    <span className={styles.expandedTitle}>
                      Chi tiết phân bổ mẻ 2 (519 suất học sinh):
                    </span>
                    <div className={styles.expandedGrid}>
                      <div className={styles.expandedCard}>
                        <span>• Thịt ba chỉ:</span>
                        <strong>35.5 kg (LOT-HEO-893)</strong>
                      </div>
                      <div className={styles.expandedCard}>
                        <span>• Trứng cút:</span>
                        <strong>1.038 quả (LOT-CUT-224)</strong>
                      </div>
                      <div className={styles.expandedCard}>
                        <span>• Nước dừa:</span>
                        <strong>33.2 lít (LOT-DUA-018)</strong>
                      </div>
                      <div className={styles.expandedCard}>
                        <span>• Gia vị kho:</span>
                        <strong>1.74 kg (LOT-GVI-045)</strong>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dòng xác nhận */}
      <div className={styles.confirmRow}>
        <span className="material-symbols-outlined">check_circle</span>
        <span>Phương án chế biến hợp lệ. Sẵn sàng khởi tạo.</span>
      </div>
    </section>
  )
}
