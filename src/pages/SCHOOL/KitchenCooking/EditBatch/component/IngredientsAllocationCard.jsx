import React from "react"
import {
  Layers,
  Lock,
  ArrowLeftRight,
  ShieldCheck,
  PackageCheck,
  PlusCircle,
  Trash2,
  CheckCircle2,
  QrCode,
  Combine
} from "lucide-react"
import styles from "./IngredientsAllocationCard.module.scss"

export default function IngredientsAllocationCard({
  isCombineLots = false,
  mainIngredient,
  mainLots = [],
  subIngredients = [],
  onOpenSwapModal,
  onOpenAddLotModal,
  onRemoveLot
}) {
  const effectiveMainLots = isCombineLots ? mainLots : [mainIngredient]
  const totalCount = effectiveMainLots.length + subIngredients.length

  const totalMainAllocated = effectiveMainLots.reduce(
    (acc, lot) => acc + (parseFloat(lot?.quantity) || 0),
    0
  )
  const totalMainNeeded = isCombineLots ? 10.0 : (mainIngredient?.quantity || 6.0)

  return (
    <section className={styles.ingredientsCard}>
      {/* 1. Header Thẻ */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <Layers size={18} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>Danh sách nguyên liệu chế biến</h2>
          </div>
          <div className={styles.countBadge}>
            <PackageCheck size={14} />
            <span>{totalCount} lô nguyên liệu</span>
          </div>
        </div>

        {isCombineLots && (
          <div className={styles.modeSummaryPill}>
            <Combine size={14} />
            <span>Nấu chung: {effectiveMainLots.length} lô phối trộn</span>
          </div>
        )}
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
            {/* NHÓM 1: NGUYÊN LIỆU CHÍNH */}
            <tr className={styles.groupRow}>
              <td colSpan="6">
                <div className={styles.groupContent}>
                  <div className={styles.groupLeft}>
                    <span className={styles.mainDot} />
                    <span className={styles.groupTitle}>
                      Nhóm chính: {mainIngredient?.name || "Thịt gà ta làm sạch"}
                    </span>
                    <span className={styles.groupSubInfo}>
                      (Tổng nhu cầu: <strong>{totalMainNeeded.toFixed(1)} kg</strong>)
                    </span>
                  </div>

                  <div className={styles.groupRight}>
                    {isCombineLots ? (
                      <>
                        <div className={styles.allocatedPill}>
                          <CheckCircle2 size={13} />
                          <span>
                            Đã chọn: <strong>{totalMainAllocated.toFixed(1)}</strong> / {totalMainNeeded.toFixed(1)} kg
                          </span>
                          <span className={styles.allocatedPercent}>(Đủ 100%)</span>
                        </div>
                        <button
                          type="button"
                          className={styles.addLotBtn}
                          onClick={onOpenAddLotModal}
                          title="Thêm lô nguyên liệu phối trộn từ kho"
                        >
                          <PlusCircle size={14} />
                          <span>+ Thêm lô phối trộn</span>
                        </button>
                      </>
                    ) : (
                      <span className={styles.singleLotBadge}>
                        <Lock size={12} />
                        01 lô độc lập
                      </span>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* CÁC DÒNG LÔ NGUYÊN LIỆU CHÍNH */}
            {effectiveMainLots.map((lot, idx) => (
              <tr key={lot.lotCode || lot.id} className={styles.row}>
                <td className={styles.tdName}>
                  <div className={styles.itemMeta}>
                    <div className={styles.nameRow}>
                      {isCombineLots && (
                        <span className={styles.lotIndexBadge}>{idx + 1}</span>
                      )}
                      <span className={styles.itemName}>{lot.lotName || lot.name}</span>
                      <span className={styles.lotCode}>{lot.lotCode}</span>
                    </div>
                    <span className={styles.supplierText}>{lot.supplier}</span>
                  </div>
                </td>
                <td className={styles.tdCert}>
                  <span className={styles.certBadge}>
                    <ShieldCheck size={13} />
                    {lot.cert}
                  </span>
                </td>
                <td className={styles.tdExpiry}>
                  <span className={styles.expiryDate}>{lot.expiryDate}</span>
                  {lot.expiryRemaining && (
                    <span className={styles.expiryRemaining}>({lot.expiryRemaining})</span>
                  )}
                </td>
                <td className={styles.tdStock}>
                  <span className={styles.stockNum}>{lot.stock} {lot.unit}</span>
                </td>
                <td className={styles.tdQty}>
                  <div className={styles.qtyBox}>
                    <span className={styles.numBold}>{lot.quantity}</span>
                    <span className={styles.unitText}>{lot.unit}</span>
                  </div>
                  {lot.quotaPerPortion && (
                    <span className={styles.quotaSubText}>({lot.quotaPerPortion})</span>
                  )}
                </td>
                <td className={styles.tdAction}>
                  <div className={styles.actionBtnGroup}>
                    <button
                      type="button"
                      className={styles.swapBtn}
                      onClick={() => onOpenSwapModal(lot)}
                      title="Thay thế lô khác trong kho"
                    >
                      <ArrowLeftRight size={13} />
                      <span>Thay lô</span>
                    </button>
                    {isCombineLots && effectiveMainLots.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => onRemoveLot && onRemoveLot(lot.id)}
                        title="Bỏ lô này khỏi mẻ phối trộn"
                        aria-label="Bỏ lô phối trộn"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

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
                </td>
                <td className={styles.tdQty}>
                  <div className={styles.qtyBox}>
                    <span className={styles.numBold}>{item.quantity}</span>
                    <span className={styles.unitText}>{item.unit}</span>
                  </div>
                  {item.quotaPerPortion && (
                    <span className={styles.quotaSubText}>({item.quotaPerPortion})</span>
                  )}
                </td>
                <td className={styles.tdAction}>
                  <button
                    type="button"
                    className={styles.swapBtn}
                    onClick={() => onOpenSwapModal(item)}
                    title="Thay thế sang lô khác trong kho"
                  >
                    <ArrowLeftRight size={13} />
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
          <span>Nhóm chính: {mainIngredient?.name || "Thịt gà ta làm sạch"}</span>
          {isCombineLots && (
            <button
              type="button"
              className={styles.addLotBtnMobile}
              onClick={onOpenAddLotModal}
            >
              <PlusCircle size={13} />
              <span>+ Thêm lô</span>
            </button>
          )}
        </div>

        {effectiveMainLots.map((lot, idx) => (
          <div key={lot.lotCode || lot.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <div>
                <div className={styles.mobileItemName}>
                  {isCombineLots && <span className={styles.mobileIdx}>#{idx + 1} </span>}
                  {lot.lotName || lot.name}
                </div>
                <div className={styles.lotCode}>{lot.lotCode}</div>
              </div>
              <div className={styles.mobileQtyPill}>
                <div>
                  <strong>{lot.quantity}</strong> {lot.unit}
                </div>
                {lot.quotaPerPortion && (
                  <span className={styles.quotaSubMobile}>({lot.quotaPerPortion})</span>
                )}
              </div>
            </div>

            <div className={styles.mobileDetailsGrid}>
              <div>
                <span className={styles.mobileLabel}>Nhà cung cấp:</span>
                <div className={styles.mobileVal}>{lot.supplier}</div>
              </div>
              <div>
                <span className={styles.mobileLabel}>Chứng nhận:</span>
                <div className={styles.mobileVal}>{lot.cert}</div>
              </div>
              <div>
                <span className={styles.mobileLabel}>Hạn dùng:</span>
                <div className={styles.mobileVal}>{lot.expiryDate} {lot.expiryRemaining ? `(${lot.expiryRemaining})` : ""}</div>
              </div>
              <div>
                <span className={styles.mobileLabel}>Tồn khả dụng:</span>
                <div className={styles.mobileVal}>{lot.stock} {lot.unit}</div>
              </div>
            </div>

            <div className={styles.mobileActionRow}>
              <button
                type="button"
                className={styles.swapBtnMobile}
                onClick={() => onOpenSwapModal(lot)}
              >
                <ArrowLeftRight size={14} />
                <span>Thay lô</span>
              </button>
              {isCombineLots && effectiveMainLots.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtnMobile}
                  onClick={() => onRemoveLot && onRemoveLot(lot.id)}
                  title="Bỏ lô này"
                >
                  <Trash2 size={14} />
                  <span>Bỏ lô</span>
                </button>
              )}
            </div>
          </div>
        ))}

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
                <div>
                  <strong>{item.quantity}</strong> {item.unit}
                </div>
                {item.quotaPerPortion && (
                  <span className={styles.quotaSubMobile}>({item.quotaPerPortion})</span>
                )}
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
              <ArrowLeftRight size={14} />
              <span>Thay lô</span>
            </button>
          </div>
        ))}
      </div>

      {/* 4. Thẻ Thông Báo / Quy Chuẩn An Toàn */}
      {isCombineLots ? (
        <div className={styles.combineCardsGrid}>
          {/* Card 1: Đặc thù Nấu chung */}
          <div className={styles.noticeCardBlue}>
            <div className={styles.noticeCardIconBoxBlue}>
              <Combine size={18} />
            </div>
            <div className={styles.noticeCardContent}>
              <h3 className={styles.noticeCardTitleBlue}>Đặc thù phương án Nấu chung:</h3>
              <p className={styles.noticeCardDesc}>
                Toàn bộ 100 suất ăn được thực hiện trong <strong>01 mẻ chế biến tập trung</strong>. Cho phép linh hoạt phối trộn giữa <strong>Lô A (6.0 kg)</strong> và <strong>Lô B (4.0 kg)</strong> để đảm bảo đủ 10.0 kg thịt gà cho toàn trường.
              </p>
            </div>
          </div>

          {/* Card 2: Quy chuẩn ATTP & Truy xuất nguồn gốc */}
          <div className={styles.noticeCardGreen}>
            <div className={styles.noticeCardIconBoxGreen}>
              <QrCode size={18} />
            </div>
            <div className={styles.noticeCardContent}>
              <h3 className={styles.noticeCardTitleGreen}>Quy tắc ATTP &amp; Truy xuất nguồn gốc:</h3>
              <p className={styles.noticeCardDesc}>
                Hệ thống lưu vết mã QR đa nguồn gốc cho tất cả các lô nguyên liệu phối trộn. Phụ huynh và thanh tra có thể quét mã QR để tra cứu minh bạch chứng từ xuất xứ của cả <strong>Lô A</strong> và <strong>Lô B</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.singleNoticeBar}>
          <ShieldCheck size={16} className={styles.noticeIcon} />
          <span className={styles.noticeText}>
            <strong>Quy chuẩn Nấu riêng &amp; Truy xuất nguồn gốc:</strong> Mỗi nguyên liệu chỉ sử dụng 01 lô duy nhất (Lô A), bảo toàn tính toàn vẹn của mã QR truy xuất nguồn gốc khi phụ huynh quét kiểm tra khay ăn học sinh.
          </span>
        </div>
      )}
    </section>
  )
}
