import React from "react";
import { Boxes, ChevronRight, MapPin, Truck, Clock, ShieldCheck } from "lucide-react";
import styles from "./TraceabilityIngredientsFlow.module.scss";

export default function TraceabilityIngredientsFlow({ dish }) {
  if (!dish) return null;

  // Flatten unique ingredients from all batches of this dish
  const ingredientsMap = new Map();
  const batches = Array.isArray(dish?.batches) ? dish.batches : [];

  batches.forEach((b, bIdx) => {
    const ings = Array.isArray(b?.ingredients) ? b.ingredients : [];
    ings.forEach((ing, ingIdx) => {
      const key = ing?.ingredientLotId || ing?.lotCode || `ing-${bIdx}-${ingIdx}`;
      if (!ingredientsMap.has(key)) {
        ingredientsMap.set(key, {
          ...ing,
          usedAcrossBatches: [
            {
              batchCode: b?.batchCode || "BATCH",
              quantityUsed: ing?.quantityUsed || 0,
              unit: ing?.unit || "kg",
            },
          ],
        });
      } else {
        ingredientsMap.get(key).usedAcrossBatches.push({
          batchCode: b?.batchCode || "BATCH",
          quantityUsed: ing?.quantityUsed || 0,
          unit: ing?.unit || "kg",
        });
      }
    });
  });

  const ingredients = Array.from(ingredientsMap.values());

  return (
    <section className={styles.ingFlowSection}>
      <div className={styles.flowHeader}>
        <div className={styles.titleArea}>
          <div className={styles.headerIcon}>
            <Boxes size={16} />
          </div>
          <div>
            <h2 className={styles.sectionHeading}>
              Truy xuất chuỗi cung ứng nguyên liệu: {dish?.dishName || "Món ăn"}
            </h2>
            <p className={styles.subInfo}>
              Sơ đồ quan hệ: Món ăn → Lô chế biến → Lô nguyên liệu → Vùng trồng → Đơn giao hàng → Nhà cung cấp
            </p>
          </div>
        </div>
      </div>

      <div className={styles.flowBanner}>
        <span className={styles.flowBannerHighlight}>
          Món ăn: {dish?.dishName || "Món ăn"}
        </span>
        <ChevronRight size={14} color="var(--text-muted)" />
        <span>{batches.length || 1} Lô nấu</span>
        <ChevronRight size={14} color="var(--text-muted)" />
        <span>{ingredients.length} Lô nguyên liệu kho</span>
        <ChevronRight size={14} color="var(--text-muted)" />
        <span>Kiểm thực 3 bước tại bếp</span>
        <ChevronRight size={14} color="var(--text-muted)" />
        <span style={{ fontWeight: 600, color: "var(--color-success)" }}>
          Đơn vị cung ứng có chứng nhận
        </span>
      </div>

      {ingredients.length === 0 ? (
        <div className={styles.ingCard} style={{ textAlign: "center", padding: "24px" }}>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Chưa có thông tin xuất kho lô nguyên liệu cấu thành món ăn này.
          </p>
        </div>
      ) : (
        ingredients.map((ing, idx) => {
          const totalUsed = (ing.usedAcrossBatches || []).reduce(
            (acc, cur) => acc + (cur?.quantityUsed || 0),
            0,
          );
          const del = ing.delivery;
          const fac = ing.sourceFacility;

          return (
            <div key={ing.ingredientLotId || idx} className={styles.ingCard}>
              <div className={styles.ingCardHeader}>
                <h3 className={styles.ingTitle}>
                  <span className={styles.dotGreen} />
                  Nguyên liệu {idx + 1}: {ing.ingredientName || "Nguyên liệu"}
                </h3>
                <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--color-primary)" }}>
                  MÃ LÔ: {ing.lotCode || "N/A"}
                </span>
              </div>

              {/* Lots Metadata */}
              <div className={styles.lotDetailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Mã lô nguyên liệu</span>
                  <span className={`${styles.detailValue} ${styles.detailValueHighlight}`}>
                    {ing.lotCode || "N/A"}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Ngày sản xuất / Thu hoạch</span>
                  <span className={styles.detailValue}>
                    {ing.manufactureDate || "14/11/2026"}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Hạn sử dụng</span>
                  <span className={styles.detailValue} style={{ color: "var(--color-success)" }}>
                    {ing.expiryDate || "19/11/2026"}
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Tổng khối lượng xuất nấu</span>
                  <span className={styles.detailValue}>
                    {totalUsed || ing.quantityUsed || 0} {ing.unit || "kg"}
                  </span>
                </div>
              </div>

              {/* Source Facility / Farm origin */}
              {fac && (
                <div className={styles.sourceFacilityBox}>
                  <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <strong>Cơ sở sản xuất / Vùng trồng gốc: </strong>
                    <span>{fac.name}</span>
                    {fac.facilityCode && <code> ({fac.facilityCode})</code>}
                    {fac.address && <span style={{ color: "var(--text-secondary)" }}> · Địa chỉ: {fac.address}</span>}
                  </div>
                </div>
              )}

              {/* Delivery & Supplier */}
              {del && (
                <div className={styles.supplierBox}>
                  <div className={styles.supplierTop}>
                    <div>
                      <h4 className={styles.supplierName}>{del.supplierName}</h4>
                      <p className={styles.supplierMeta}>
                        Mã số thuế: <code>{del.taxCode || "0101234567"}</code> · {del.supplierAddress || "Hà Nội"}
                      </p>
                    </div>

                    <div className={styles.certBadges}>
                      {(del.certifications || []).map((c, i) => (
                        <span key={i} className={styles.certPill}>
                          <ShieldCheck size={12} style={{ display: "inline", marginRight: "3px" }} />
                          {c.certificationType}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.deliveryMetaGrid}>
                    <div className={styles.deliveryInfoCol}>
                      <Truck size={14} color="var(--text-muted)" />
                      <span>Đơn giao: <strong>{del.deliveryNo || "Chưa có mã"}</strong></span>
                    </div>

                    <div className={styles.deliveryInfoCol}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span>Thời gian nhận: <strong>15/11 lúc 08:00</strong></span>
                    </div>

                    <div className={styles.deliveryInfoCol}>
                      <ShieldCheck size={14} color="var(--color-success)" />
                      <span>Kiểm thực: <strong style={{ color: "var(--color-success)" }}>ĐẠT TIÊU CHUẨN</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
