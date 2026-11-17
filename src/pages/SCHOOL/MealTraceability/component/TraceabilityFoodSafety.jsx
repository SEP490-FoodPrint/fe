import React, { useState } from "react";
import {
  FlaskConical,
  Camera,
  ZoomIn,
  FileCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import styles from "./TraceabilityFoodSafety.module.scss";

export default function TraceabilityFoodSafety({ dish }) {
  const [activeTab, setActiveTab] = useState("samples");
  const [zoomSample, setZoomSample] = useState(null);

  if (!dish) return null;

  const batches = Array.isArray(dish?.batches) ? dish.batches : [];
  const samples = batches
    .map((b) => ({
      batchCode: b?.batchCode || "BATCH",
      sample: b?.retainedSample,
    }))
    .filter((item) => Boolean(item.sample));

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
              Hồ sơ kiểm thực 3 bước và nhật ký lưu mẫu 24h theo quy định Bộ Y
              Tế
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
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
          Kiểm tra nguyên liệu 3 bước
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "docs" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("docs")}
        >
          Chứng từ pháp lý liên quan
        </button>
      </div>

      <div className={styles.tabBody}>
        {/* TAB 1: SAMPLES */}
        {activeTab === "samples" && (
          <div className={styles.samplesGrid}>
            {samples.map(({ batchCode, sample }, index) => (
              <div key={sample.id || index} className={styles.sampleCard}>
                <div>
                  <div className={styles.sampleTop}>
                    <span className={styles.batchBadge}>Lô: {batchCode}</span>
                    <span className={styles.statusStored}>{sample.status}</span>
                  </div>

                  <h4 className={styles.sampleTitle}>
                    Mẫu lưu {dish.dishName} · {batchCode}
                  </h4>
                  <p className={styles.sampleMeta}>
                    Thời gian lấy: 11:{20 + index * 10} · 16/11/2026
                  </p>
                </div>

                {/* Photo Thumbnail */}
                <div
                  className={styles.photoThumbnail}
                  onClick={() => setZoomSample({ batchCode, sample, index })}
                  role="button"
                  tabIndex={0}
                >
                  <Camera size={22} color="var(--color-primary)" />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Ảnh niêm phong hũ mẫu
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <ZoomIn size={12} /> Bấm xem ảnh lớn
                  </div>
                </div>

                <div className={styles.sampleSpecsRow}>
                  <div className={styles.specCard}>
                    <span className={styles.specLabel}>Khối lượng mẫu</span>
                    <span className={styles.specVal}>
                      {sample.quantity || 200} {sample.unit || "g"}
                    </span>
                  </div>
                  <div className={styles.specCard}>
                    <span className={styles.specLabel}>Vị trí bảo quản</span>
                    <span className={styles.specVal}>
                      {sample.storageLocation || "Tủ lưu mẫu A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: INSPECTION */}
        {activeTab === "inspection" && (
          <div className={styles.inspectionBox}>
            <div className={styles.inspectionHeader}>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "var(--text-primary)",
                }}
              >
                Kiểm thực bước 1 & 2: Tiếp nhận nguyên liệu & Sơ chế
              </h4>
              <span className={styles.statusStored}>ĐẠT CHUẨN</span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Biên bản kiểm tra cảm quan thực phẩm tươi sống tại thời điểm tiếp
              nhận (08:00 - 08:40 ngày 15/11): Nguyên liệu có màu sắc tự nhiên,
              đàn hồi tốt, bao bì nguyên đai nguyên kiện, tem mác nhà cung cấp
              đầy đủ.
            </p>
            <div
              style={{
                paddingTop: "8px",
                borderTop: "1px solid var(--border-default)",
                fontSize: "11px",
                color: "var(--text-muted)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                Duyệt kiểm thực: <strong>Thủ kho & Cán bộ y tế trường</strong>
              </span>
              <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                Đã lưu biên bản số
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: LEGAL DOCS */}
        {activeTab === "docs" && (
          <div
            className={styles.inspectionBox}
            style={{ textAlign: "center", padding: "24px" }}
          >
            <FileCheck
              size={32}
              color="var(--color-primary)"
              style={{ margin: "0 auto 8px auto" }}
            />
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              Hồ sơ pháp lý nhà cung cấp
            </h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                maxWidth: "420px",
                margin: "6px auto 0 auto",
              }}
            >
              Giấy chứng nhận ISO 22000:2018 (Công ty An Phú) và chứng nhận
              VietGAP (HTX Nông sản Xanh) được quản lý và kiểm tra định kỳ bởi
              Nhà trường.
            </p>
          </div>
        )}
      </div>

      {/* Modal Zoom Sample Image */}
      {zoomSample && (
        <div
          className={styles.modalOverlay}
          onClick={() => setZoomSample(null)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "var(--text-primary)",
                }}
              >
                Ảnh niêm phong hũ mẫu: {zoomSample.batchCode}
              </h3>
              <button
                type="button"
                onClick={() => setZoomSample(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                height: "200px",
                borderRadius: "12px",
                background: "var(--bg-muted)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "1px dashed var(--border-default)",
              }}
            >
              <Camera size={36} color="var(--color-primary)" />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                }}
              >
                Hũ mẫu {dish.dishName} ({zoomSample.sample.quantity || 200}g)
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Niêm phong tem y tế học đường tại{" "}
                {zoomSample.sample.storageLocation}
              </span>
              {zoomSample.sample.photoHash && (
                <code
                  style={{
                    fontSize: "10px",
                    color: "var(--color-primary)",
                    marginTop: "4px",
                  }}
                >
                  HASH: {zoomSample.sample.photoHash.slice(0, 24)}...
                </code>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setZoomSample(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
