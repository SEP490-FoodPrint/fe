import React from "react"
import {
  Layers,
  Calculator,
  Lock,
  ArrowLeftRight,
  ShieldCheck,
  Split,
  QrCode,
  PackageCheck
} from "lucide-react"
import styles from "./IngredientsAllocationCard.module.scss"

export default function IngredientsAllocationCard({
  mainIngredient,
  subIngredients,
  onOpenRecipeModal,
  onOpenSwapModal
}) {
  const totalCount = 1 + subIngredients.length

  return (
    <section className={styles.ingredientsCard}>
      {/* 1. Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <Layers size={18} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>Nguyên liệu sử dụng</h2>
          </div>
          <div className={styles.countBadge}>
            <PackageCheck size={14} />
            <span>{totalCount} nguyên liệu (quy chuẩn Nấu riêng)</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.recipeBtn}
          onClick={onOpenRecipeModal}
          title="Xem chi tiết định lượng công thức chuẩn"
        >
          <Calculator size={15} />
          <span>Xem định lượng công thức</span>
        </button>
      </div>

      {/* 2. Desktop Table View */}
      <div className={styles.desktopTableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thName}>Tên nguyên liệu &amp; Nguồn lô</th>
              <th className={styles.thCert}>Chứng chỉ &amp; Nhà cung ứng</th>
              <th className={styles.thExpiry}>Hạn sử dụng (HSD)</th>
              <th className={styles.thStock}>Tồn kho khả dụng</th>
              <th className={styles.thQty}>Số lượng</th>
              <th className={styles.thAction}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* NHÓM 1: MÓN CHÍNH - THỊT GÀ TA */}
            <tr className={styles.groupRow}>
              <td colSpan="6">
                <div className={styles.groupContent}>
                  <div className={styles.groupLeft}>
                    <span className={styles.mainDot} />
                    <span className={styles.groupTitle}>Nguyên liệu chính: {mainIngredient.name}</span>
                  </div>

                  <div className={styles.groupRight}>
                    <span className={styles.singleLotBadge}>
                      <Lock size={12} />
                      01 lô duy nhất (Quy chuẩn nấu riêng)
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            {/* DÒNG LÔ CHÍNH */}
            <tr className={styles.row}>
              <td className={styles.tdName}>
                <div className={styles.itemMeta}>
                  <div className={styles.nameRow}>
                    <span className={styles.itemName}>{mainIngredient.lotName}</span>
                    <span className={styles.lotCode}>{mainIngredient.lotCode}</span>
                  </div>
                  <span className={styles.supplierText}>{mainIngredient.supplier}</span>
                </div>
              </td>
              <td className={styles.tdCert}>
                <div className={styles.certMeta}>
                  <span className={styles.certBadge}>
                    <ShieldCheck size={13} />
                    {mainIngredient.cert}
                  </span>
                  <span className={styles.certSub}>{mainIngredient.certNote}</span>
                </div>
              </td>
              <td className={styles.tdExpiry}>
                <span className={styles.expiryDate}>{mainIngredient.expiryDate}</span>
                <span className={styles.expiryRemaining}>({mainIngredient.expiryRemaining})</span>
              </td>
              <td className={styles.tdStock}>
                <span className={styles.stockNum}>{mainIngredient.stock} {mainIngredient.unit}</span>
                <span className={styles.stockLocation}>{mainIngredient.warehouse}</span>
              </td>
              <td className={styles.tdQty}>
                <div className={styles.qtyBox}>
                  <span className={styles.numBold}>{mainIngredient.quantity}</span>
                  <span className={styles.unitText}>{mainIngredient.unit}</span>
                </div>
              </td>
              <td className={styles.tdAction}>
                <button
                  type="button"
                  className={styles.swapBtn}
                  onClick={() => onOpenSwapModal(mainIngredient)}
                  title="Thay thế sang lô khác trong kho"
                >
                  <ArrowLeftRight size={14} />
                  <span>Thay lô</span>
                </button>
              </td>
            </tr>

            {/* NHÓM 2: PHỤ LIỆU, RAU GIA VỊ */}
            <tr className={styles.groupRow}>
              <td colSpan="6">
                <div className={styles.groupContent}>
                  <div className={styles.groupLeft}>
                    <span className={styles.subDot} />
                    <span className={styles.groupTitle}>Phụ liệu &amp; Gia vị</span>
                  </div>
                </div>
              </td>
            </tr>

            {/* CÁC NGUYÊN LIỆU PHỤ */}
            {subIngredients.map((item) => (
              <tr key={item.id} className={styles.row}>
                <td className={styles.tdName}>
                  <div className={styles.itemMeta}>
                    <div className={styles.nameRow}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.lotCode}>{item.lotCode}</span>
                    </div>
                    <span className={styles.supplierText}>{item.supplier}</span>
                  </div>
                </td>
                <td className={styles.tdCert}>
                  <span className={styles.certBadge}>
                    <ShieldCheck size={13} />
                    {item.cert}
                  </span>
                </td>
                <td className={styles.tdExpiry}>
                  <span className={styles.expiryDate}>{item.expiryDate}</span>
                </td>
                <td className={styles.tdStock}>
                  <span className={styles.stockNum}>{item.stock} {item.unit}</span>
                  <span className={styles.stockLocation}>{item.warehouse}</span>
                </td>
                <td className={styles.tdQty}>
                  <div className={styles.qtyBox}>
                    <span className={styles.numBold}>{item.quantity}</span>
                    <span className={styles.unitText}>{item.unit}</span>
                  </div>
                </td>
                <td className={styles.tdAction}>
                  <button
                    type="button"
                    className={styles.swapBtn}
                    onClick={() => onOpenSwapModal(item)}
                    title="Thay thế sang lô khác trong kho"
                  >
                    <ArrowLeftRight size={14} />
                    <span>Thay lô</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Mobile Card List (< 768px) */}
      <div className={styles.mobileCardList}>
        <div className={styles.mobileGroupBadge}>
          <span className={styles.mainDot} />
          <span>Nguyên liệu chính: {mainIngredient.name}</span>
        </div>

        <div className={styles.mobileCard}>
          <div className={styles.mobileCardHeader}>
            <div>
              <div className={styles.mobileItemName}>{mainIngredient.lotName}</div>
              <div className={styles.lotCode}>{mainIngredient.lotCode}</div>
            </div>
            <div className={styles.mobileQtyPill}>
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

          <button
            type="button"
            className={styles.swapBtnMobile}
            onClick={() => onOpenSwapModal(mainIngredient)}
          >
            <ArrowLeftRight size={15} />
            <span>Thay lô nguyên liệu</span>
          </button>
        </div>

        <div className={styles.mobileGroupBadge}>
          <span className={styles.subDot} />
          <span>Phụ liệu &amp; Gia vị</span>
        </div>

        {subIngredients.map((item) => (
          <div key={item.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <div>
                <div className={styles.mobileItemName}>{item.name}</div>
                <div className={styles.lotCode}>{item.lotCode}</div>
              </div>
              <div className={styles.mobileQtyPill}>
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

            <button
              type="button"
              className={styles.swapBtnMobile}
              onClick={() => onOpenSwapModal(item)}
            >
              <ArrowLeftRight size={15} />
              <span>Thay lô</span>
            </button>
          </div>
        ))}
      </div>

      {/* 4. Hai Thẻ Ghi Chú Phương Án & ATTP (Style Banner Tinh Tế) */}
      <div className={styles.noticeGrid}>
        <div className={styles.noticeBoxBlue}>
          <div className={styles.noticeIconBlue}>
            <Split size={18} />
          </div>
          <div className={styles.noticeContent}>
            <h3 className={styles.noticeTitleBlue}>Đặc thù phương án Nấu riêng:</h3>
            <p className={styles.noticeDesc}>
              Lô 01 — <strong>60 suất</strong> độc lập | Lô 02 — <strong>40 suất</strong> (Lô gà B <span className={styles.inlineCode}>[LOT-GA-01B]</span> — Tham chiếu). Tuyệt đối không pha trộn 2 lô thịt gà vào cùng 1 nồi nấu.
            </p>
          </div>
        </div>

        <div className={styles.noticeBoxGreen}>
          <div className={styles.noticeIconGreen}>
            <QrCode size={18} />
          </div>
          <div className={styles.noticeContent}>
            <h3 className={styles.noticeTitleGreen}>Quy tắc ATTP &amp; Truy xuất nguồn gốc:</h3>
            <p className={styles.noticeDesc}>
              Toàn bộ thịt gà trong lô này được chế biến từ <strong>01 lô duy nhất (Lô A)</strong>, bảo toàn tính toàn vẹn của mã QR truy xuất nguồn gốc cho từng khay ăn của học sinh.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
