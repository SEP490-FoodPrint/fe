import React, { useState } from "react";
import { FlaskConical, FileCheck, CheckCircle2 } from "lucide-react";
import styles from "./TraceabilityFoodSafety.module.scss";
import TraceabilityEvidencePhoto, {
  PhotoThumb,
} from "./TraceabilityEvidencePhoto";
import { formatStepTime } from "./traceabilityBlockchainAdapter";

const SAMPLE_STATUS = { STORED: "Đang lưu", DISPOSED: "Đã tiêu huỷ" };
const DECISION = { APPROVE: "Đạt", REJECT: "Không đạt" };

const formatDay = (value) => {
  if (!value) return "—";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return d ? `${d}/${m}/${y}` : String(value);
};

export default function TraceabilityFoodSafety({ dish }) {
  const [activeTab, setActiveTab] = useState("samples");
  const [zoomPhoto, setZoomPhoto] = useState(null);

  if (!dish) return null;

  const batches = Array.isArray(dish?.batches) ? dish.batches : [];
  const samples = batches
    .map((b) => ({ batchCode: b?.batchCode || "", sample: b?.retainedSample }))
    .filter((item) => Boolean(item.sample));

  // Đơn giao hàng (duy nhất) của các lô nguyên liệu cấu thành món đang chọn
  const deliveries = (
    Array.isArray(dish?.suppliers) ? dish.suppliers : []
  ).flatMap((s) =>
    (s.deliveries || []).map((d) => ({
      ...d,
      supplierName: s.name,
      certifications: s.certifications || [],
      ingredientNames: [
        ...new Set((d.lots || []).map((l) => l.ingredientName)),
      ],
    })),
  );
  const photoCount = deliveries.reduce(
    (sum, d) => sum + (d.approvals || []).filter((a) => a.photoUrl).length,
    0,
  );

  // Chứng nhận còn hiệu lực theo từng nhà cung cấp
  const suppliers = new Map();
  deliveries.forEach((d) => {
    if (!suppliers.has(d.supplierName))
      suppliers.set(d.supplierName, d.certifications || []);
  });

  return (
    <section className={styles.safetySection}>
      <div className={styles.safetyHeader}>
        <div className={styles.titleArea}>
          <div className={styles.headerIcon}>
            <FlaskConical size={16} />
          </div>
          <div>
            <h2 className={styles.sectionHeading}>
              Minh chứng an toàn thực phẩm
            </h2>
            <p className={styles.subInfo}>
              Mẫu lưu thức ăn, ảnh minh chứng kiểm nhận nguyên liệu và chứng
              nhận của nhà cung cấp
            </p>
          </div>
        </div>
      </div>

      <div className={styles.tabList}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "samples" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("samples")}
        >
          Lưu mẫu thức ăn ({samples.length} bản ghi)
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "inspection" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("inspection")}
        >
          Kiểm nhận nguyên liệu ({photoCount} ảnh)
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "docs" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("docs")}
        >
          Chứng nhận nhà cung cấp
        </button>
      </div>

      <div className={styles.tabBody}>
        {activeTab === "samples" && (
          <div className={styles.samplesGrid}>
            {samples.length === 0 && (
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                Chưa có mẫu lưu cho món ăn này.
              </p>
            )}
            {samples.map(({ batchCode, sample }) => (
              <div key={sample.id} className={styles.sampleCard}>
                <div>
                  <div className={styles.sampleTop}>
                    <span className={styles.batchBadge}>Lô: {batchCode}</span>
                    <span className={styles.statusStored}>
                      {SAMPLE_STATUS[sample.status] || sample.status}
                    </span>
                  </div>
                  <h4 className={styles.sampleTitle}>
                    Mẫu lưu {dish.dishName} · {batchCode}
                  </h4>
                  <p className={styles.sampleMeta}>
                    Thời gian lấy: {formatStepTime(sample.sampledAt) || "—"}
                    {sample.disposedAt
                      ? ` · Tiêu huỷ: ${formatStepTime(sample.disposedAt)}`
                      : ""}
                  </p>
                </div>

                <PhotoThumb
                  photoUrl={sample.photoUrl}
                  label="Ảnh niêm phong hũ mẫu"
                  onOpen={() =>
                    setZoomPhoto({
                      title: `Ảnh niêm phong mẫu: ${dish.dishName} · ${batchCode}`,
                      photoUrl: sample.photoUrl,
                      photoHash: sample.photoHash,
                    })
                  }
                />

                <div className={styles.sampleSpecsRow}>
                  <div className={styles.specCard}>
                    <span className={styles.specLabel}>Khối lượng mẫu</span>
                    <span className={styles.specVal}>
                      {sample.quantity != null
                        ? `${sample.quantity} ${sample.unit || ""}`
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.specCard}>
                    <span className={styles.specLabel}>Vị trí bảo quản</span>
                    <span className={styles.specVal}>
                      {sample.storageUnit
                        ? `${sample.storageUnit.name} (${sample.storageUnit.location}) · ${sample.storageUnit.temperatureRange}`
                        : sample.storageLocation || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "inspection" && (
          <div className={styles.inspections}>
            {deliveries.length === 0 && (
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                Chưa có đơn giao hàng cho nguyên liệu của món ăn này.
              </p>
            )}
            {deliveries.map((d) => (
              <div key={d.id} className={styles.inspectionBox}>
                <div className={styles.inspectionHeader}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      margin: 0,
                      color: "var(--text-primary)",
                    }}
                  >
                    {d.supplierName}
                    {d.deliveryNo ? ` · ${d.deliveryNo}` : ""}
                  </h4>
                  <span className={styles.statusStored}>
                    {d.status === "RECEIVED"
                      ? "Đã tiếp nhận"
                      : d.status === "REJECTED"
                        ? "Bị từ chối"
                        : d.status}
                  </span>
                </div>
                <p className={styles.inspectionMeta}>
                  Nguyên liệu: {d.ingredientNames.filter(Boolean).join(", ")} ·
                  Xe: {d.vehiclePlate || "—"} · Nhận lúc:{" "}
                  {d.receivedAt ? formatStepTime(d.receivedAt) : "—"}
                </p>
                {(d.approvals || []).length === 0 ? (
                  <p style={{ fontSize: "12px", margin: 0 }}>
                    Chưa có quyết định kiểm nhận.
                  </p>
                ) : (
                  <div className={styles.samplesGrid}>
                    {d.approvals.map((a) => (
                      <div
                        key={`${a.roleCode}-${a.decidedAt}`}
                        className={styles.sampleCard}
                      >
                        <div className={styles.sampleTop}>
                          <span className={styles.batchBadge}>
                            {a.roleName}
                          </span>
                          <span className={styles.statusStored}>
                            {DECISION[a.decision] || a.decision}
                          </span>
                        </div>
                        <PhotoThumb
                          photoUrl={a.photoUrl}
                          label="Ảnh minh chứng"
                          onOpen={() =>
                            setZoomPhoto({
                              title: `Minh chứng kiểm nhận: ${a.roleName}`,
                              photoUrl: a.photoUrl,
                              photoHash: a.photoHash,
                            })
                          }
                        />
                        <p className={styles.sampleMeta}>
                          {formatStepTime(a.decidedAt)}
                          {a.reason ? ` · ${a.reason}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "docs" && (
          <div className={styles.inspectionBox}>
            {suppliers.size === 0 && (
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                Chưa có thông tin nhà cung cấp.
              </p>
            )}
            {[...suppliers.entries()].map(([name, certs]) => (
              <div key={name}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    margin: "0 0 6px",
                    color: "var(--text-primary)",
                  }}
                >
                  <FileCheck
                    size={16}
                    color="var(--color-primary)"
                    style={{ display: "inline", marginRight: 6 }}
                  />
                  {name}
                </h4>
                {certs.length === 0 ? (
                  <p style={{ fontSize: "12px", margin: 0 }}>
                    Không có chứng nhận còn hiệu lực trên hệ thống.
                  </p>
                ) : (
                  certs.map((c) => (
                    <p
                      key={`${c.certificationType}-${c.certificateNo}`}
                      style={{ fontSize: "12px", margin: "2px 0" }}
                    >
                      <CheckCircle2
                        size={12}
                        color="var(--color-success)"
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      <strong>{c.certificationType}</strong> · Số{" "}
                      {c.certificateNo}
                      {c.issuedDate ? ` · Cấp ${formatDay(c.issuedDate)}` : ""}
                      {c.expiryDate
                        ? ` · Hết hạn ${formatDay(c.expiryDate)}`
                        : ""}
                    </p>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <TraceabilityEvidencePhoto
        photo={zoomPhoto}
        onClose={() => setZoomPhoto(null)}
      />
    </section>
  );
}
