import React from "react"
import {
  Layers,
  Calculator,
  CheckCircle2,
  Lock,
  ArrowLeftRight,
  ShieldCheck,
  Split,
  QrCode,
  Sparkles,
  PackageCheck
} from "lucide-react"
import styles from "./IngredientsAllocationCard.module.scss"

export default function IngredientsAllocationCard({
  mainIngredient,
  subIngredients,
  onOpenRecipeModal,
  onOpenSwapModal
}) {
  return (
    <section className={styles.sectionCard}>
      {/* 1. Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <Layers size={22} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Nguyên liệu sử dụng theo định lượng</h2>
            <p className={styles.sectionSubtitle}>
              Tất cả các lô nguyên liệu thành phần phục vụ phương án Lô 01 (Áp dụng quy chuẩn Nấu riêng - 01 lô/loại nguyên liệu).
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.recipeBtn}
          onClick={onOpenRecipeModal}
          title="Xem chi tiết định lượng công thức chuẩn"
        >
          <Calculator size={16} />
          <span>Xem định lượng công thức (100g thịt gà / suất)</span>
        </button>
      </div>

      {/* 2. Grouped Table (Desktop View) */}
      <div className={styles.tableResponsive}>
        <table className={styles.materialsTable}>
          <thead>
            <tr>
              <th className={styles.thName}>Tên nguyên liệu &amp; Nguồn lô</th>
              <th className={styles.thCert}>Chứng chỉ &amp; Nhà cung ứng</th>
              <th className={styles.thExpiry}>Hạn dùng</th>
              <th className={styles.thStock}>Tồn kho khả dụng</th>
              <th className={styles.thQuantity}>Số lượng sử dụng</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* NHÓM 1: MÓN CHÍNH - THỊT GÀ TA */}
            <tr className={styles.groupHeaderRow}>
              <td colSpan="6">
                <div className={styles.groupHeaderContent}>
                  <div className={styles.groupLeft}>
                    <span className={styles.mainDot} />
                    <span className={styles.groupTitle}>Nhóm chính: {mainIngredient.name}</span>
                    <span className={styles.groupQuota}>
                      (Định mức: 100g/suất • Tổng nhu cầu Lô 01: <strong>{mainIngredient.quantity} {mainIngredient.unit}</strong>)
                    </span>
                  </div>

                  <div className={styles.groupRight}>
                    <div className={styles.chosenBadge}>
                      <CheckCircle2 size={15} className={styles.chosenIcon} />
                      <span>Đã chọn: <strong>{mainIngredient.quantity}</strong> / {mainIngredient.quantity} {mainIngredient.unit}</span>
                      <span className={styles.chosenPercent}>(Đủ 100%)</span>
                    </div>

                    <span className={styles.singleLotBadge}>
                      <Lock size={13} />
                      <span>01 lô duy nhất</span>
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            {/* DÒNG LÔ CHÍNH */}
            <tr className={styles.dataRow}>
              <td>
                <div className={styles.itemInfo}>
                  <div className={styles.indexBox}>1</div>
                  <div className={styles.itemMeta}>
                    <div className={styles.nameRow}>
                      <span className={styles.itemName}>{mainIngredient.lotName}</span>
                      <span className={styles.lotCode}>{mainIngredient.lotCode}</span>
                    </div>
                    <span className={styles.supplierText}>{mainIngredient.supplier}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className={styles.certMeta}>
                  <span className={styles.certBadge}>
                    <ShieldCheck size={14} />
                    <span>{mainIngredient.cert}</span>
                  </span>
                  <span className={styles.certSub}>{mainIngredient.certNote}</span>
                </div>
              </td>
              <td className={styles.textCenter}>
                <span className={styles.expiryDate}>{mainIngredient.expiryDate}</span>
                <div className={styles.expiryRemaining}>{mainIngredient.expiryRemaining}</div>
              </td>
              <td className={styles.textRight}>
                <span className={styles.stockQuantity}>{mainIngredient.stock} {mainIngredient.unit}</span>
                <div className={styles.stockLocation}>{mainIngredient.warehouse}</div>
              </td>
              <td className={styles.textRight}>
                <div className={styles.lockedQuantityBox}>
                  <span className={styles.quantityNum}>{mainIngredient.quantity}</span>
                  <span className={styles.quantityUnit}>{mainIngredient.unit}</span>
                </div>
                <div className={styles.quantityFormulaHint}>Chuẩn công thức</div>
              </td>
              <td className={styles.textCenter}>
                <button
                  type="button"
                  className={styles.swapBtn}
                  onClick={() => onOpenSwapModal(mainIngredient)}
                  title="Thay thế sang lô khác trong kho"
                >
                  <ArrowLeftRight size={15} />
                  <span>Thay lô</span>
                </button>
              </td>
            </tr>

            {/* NHÓM 2: PHỤ LIỆU, RAU GIA VỊ */}
            <tr className={styles.groupHeaderRow}>
              <td colSpan="6">
                <div className={styles.groupHeaderContent}>
                  <div className={styles.groupLeft}>
                    <span className={styles.subDot} />
                    <span className={styles.groupTitle}>Nhóm phụ liệu, rau gia vị &amp; hương liệu</span>
                    <span className={styles.groupQuota}>
                      ({subIngredients.length} thành phần phụ trợ đáp ứng đủ quy chuẩn cho 60 suất)
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            {/* CÁC NGUYÊN LIỆU PHỤ */}
            {subIngredients.map((item, idx) => (
              <tr key={item.id} className={styles.dataRow}>
                <td>
                  <div className={styles.itemInfo}>
                    <div className={`${styles.indexBox} ${styles.indexSub}`}>{idx + 2}</div>
                    <div className={styles.itemMeta}>
                      <div className={styles.nameRow}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.lotCode}>{item.lotCode}</span>
                      </div>
                      <span className={styles.supplierText}>{item.supplier}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.certMeta}>
                    <span className={styles.certBadge}>
                      <ShieldCheck size={14} />
                      <span>{item.cert}</span>
                    </span>
                  </div>
                </td>
                <td className={styles.textCenter}>
                  <span className={styles.expiryDate}>{item.expiryDate}</span>
                </td>
                <td className={styles.textRight}>
                  <span className={styles.stockQuantity}>{item.stock} {item.unit}</span>
                  <div className={styles.stockLocation}>{item.warehouse}</div>
                </td>
                <td className={styles.textRight}>
                  <div className={styles.lockedQuantityBox}>
                    <span className={styles.quantityNum}>{item.quantity}</span>
                    <span className={styles.quantityUnit}>{item.unit}</span>
                  </div>
                </td>
                <td className={styles.textCenter}>
                  <button
                    type="button"
                    className={styles.swapBtn}
                    onClick={() => onOpenSwapModal(item)}
                    title="Thay thế sang lô khác trong kho"
                  >
                    <ArrowLeftRight size={15} />
                    <span>Thay lô</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Mobile Card View (< 768px) */}
      <div className={styles.mobileCardsList}>
        <div className={styles.mobileGroupBadge}>
          <span className={styles.mainDot} />
          <span>Nhóm chính: {mainIngredient.name} (60 suất)</span>
        </div>

        <div className={styles.mobileCard}>
          <div className={styles.mobileCardHeader}>
            <div>
              <div className={styles.mobileItemName}>{mainIngredient.lotName}</div>
              <div className={styles.lotCode}>{mainIngredient.lotCode}</div>
            </div>
            <div className={styles.mobileQtyBadge}>
              <strong>{mainIngredient.quantity}</strong> {mainIngredient.unit}
            </div>
          </div>

          <div className={styles.mobileDetailsGrid}>
            <div>
              <span className={styles.mobileLabel}>Nhà cung cấp:</span>
              <div className={styles.mobileVal}>{mainIngredient.supplier}</div>
            </div>
            <div>
              <span className={styles.mobileLabel}>Chứng nhận:</span>
              <div className={styles.mobileVal}>{mainIngredient.cert}</div>
            </div>
            <div>
              <span className={styles.mobileLabel}>Hạn dùng:</span>
              <div className={styles.mobileVal}>{mainIngredient.expiryDate} ({mainIngredient.expiryRemaining})</div>
            </div>
            <div>
              <span className={styles.mobileLabel}>Tồn khả dụng:</span>
              <div className={styles.mobileVal}>{mainIngredient.stock} {mainIngredient.unit}</div>
            </div>
          </div>

          <div className={styles.mobileCardFooter}>
            <button
              type="button"
              className={styles.swapBtnMobile}
              onClick={() => onOpenSwapModal(mainIngredient)}
            >
              <ArrowLeftRight size={16} />
              <span>Thay lô nguyên liệu</span>
            </button>
          </div>
        </div>

        <div className={styles.mobileGroupBadge}>
          <span className={styles.subDot} />
          <span>Nhóm phụ liệu &amp; gia vị</span>
        </div>

        {subIngredients.map((item) => (
          <div key={item.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <div>
                <div className={styles.mobileItemName}>{item.name}</div>
                <div className={styles.lotCode}>{item.lotCode}</div>
              </div>
              <div className={styles.mobileQtyBadge}>
                <strong>{item.quantity}</strong> {item.unit}
              </div>
            </div>

            <div className={styles.mobileDetailsGrid}>
              <div>
                <span className={styles.mobileLabel}>Hạn dùng:</span>
                <div className={styles.mobileVal}>{item.expiryDate}</div>
              </div>
              <div>
                <span className={styles.mobileLabel}>Tồn khả dụng:</span>
                <div className={styles.mobileVal}>{item.stock} {item.unit}</div>
              </div>
            </div>

            <div className={styles.mobileCardFooter}>
              <button
                type="button"
                className={styles.swapBtnMobile}
                onClick={() => onOpenSwapModal(item)}
              >
                <ArrowLeftRight size={16} />
                <span>Thay lô</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Two Policy & Traceability Cards */}
      <div className={styles.policyCardsGrid}>
        {/* Thẻ 1: Đặc thù phương án Nấu riêng */}
        <div className={styles.policyNoticeCard}>
          <div className={styles.noticeIconBoxBlue}>
            <Split size={20} />
          </div>
          <div className={styles.noticeContent}>
            <h3 className={styles.noticeTitleBlue}>Đặc thù phương án Nấu riêng:</h3>
            <p className={styles.noticeText}>
              Lô 01 — <strong>60 suất</strong> độc lập | Lô 02 — <strong>40 suất</strong> (Lô gà B <span className={styles.inlineCode}>[LOT-GA-01B]</span> — Chỉ đọc tham chiếu). Tuyệt đối không pha trộn 2 lô thịt gà vào cùng 1 nồi nấu.
            </p>
          </div>
        </div>

        {/* Thẻ 2: An toàn thực phẩm & Truy xuất nguồn gốc */}
        <div className={styles.policyNoticeCard}>
          <div className={styles.noticeIconBoxGreen}>
            <QrCode size={20} />
          </div>
          <div className={styles.noticeContent}>
            <h3 className={styles.noticeTitleGreen}>Quy tắc ATTP &amp; Truy xuất nguồn gốc:</h3>
            <p className={styles.noticeText}>
              Toàn bộ thịt gà trong lô này được chế biến từ <strong>01 lô duy nhất (Lô A)</strong>, bảo toàn tính toàn vẹn của mã QR truy xuất nguồn gốc cho từng khay ăn của học sinh khi phụ huynh quét kiểm tra.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

