import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Truck,
  ClipboardCheck,
  CookingPot,
  FlaskConical,
  UtensilsCrossed,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import styles from "./TraceabilityBlockchainCard.module.scss";

// Bảng ánh xạ icon theo loại bước
const STEP_ICONS = {
  truck: Truck,
  check: ClipboardCheck,
  cooking: CookingPot,
  sample: FlaskConical,
  distribution: UtensilsCrossed,
};

export default function TraceabilityBlockchainCard({
  proof,
  steps: propSteps,
  isVerified: propIsVerified,
  onVerify,
  isVerifying = false,
}) {
  // Lấy dữ liệu các chặng từ props
  const steps = propSteps || proof?.steps || [];

  // Quản lý trạng thái mở rộng accordion của từng thẻ
  const [expandedMap, setExpandedMap] = useState({
    "step-1": true, // Mặc định mở chặng 1 như trong ảnh mockup 2
  });

  // Quản lý trạng thái kiểm tra nội bộ (fallback khi chưa gắn handler)
  const [internalVerified, setInternalVerified] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const toggleExpand = (stepId) => {
    setExpandedMap((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const isVerified =
    typeof propIsVerified === "boolean"
      ? propIsVerified
      : (proof?.isVerified ?? internalVerified);
  const isLoading = isVerifying || internalLoading;

  const handleVerifyClick = async () => {
    if (onVerify) {
      await onVerify();
      return;
    }
    // Giả lập đối soát 1s khi xem nếu chưa truyền onVerify
    setInternalLoading(true);
    setTimeout(() => {
      setInternalLoading(false);
      setInternalVerified(true);
    }, 900);
  };

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className={styles.blockchainContainer}>
      {/* 1. Header Banner Kiểm Tra Toàn Vẹn */}
      <div
        className={`${styles.verifyBanner} ${isVerified ? styles.verified : ""}`}
      >
        <div className={styles.verifyLeft}>
          <div className={styles.helpIconWrap}>
            {isVerified ? <ShieldCheck size={26} /> : <HelpCircle size={26} />}
          </div>
          <div>
            <h3 className={styles.bannerTitle}>
              {isVerified
                ? "Dữ liệu đã xác thực toàn vẹn"
                : "Chưa kiểm tra toàn vẹn"}
            </h3>
            <p className={styles.bannerSubtitle}>
              {isVerified
                ? "Dữ liệu 5 chặng chuỗi cung ứng khớp 100% với bằng chứng trên Blockchain."
                : "Bấm “Kiểm tra toàn vẹn” để đối chiếu dữ liệu hiện tại của từng chặng với blockchain."}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.btnVerify}
          onClick={handleVerifyClick}
          disabled={isLoading || isVerified}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang đối soát...</span>
            </>
          ) : isVerified ? (
            <>
              <ShieldCheck size={16} />
              <span>Đã xác thực</span>
            </>
          ) : (
            <span>Kiểm tra toàn vẹn</span>
          )}
        </button>
      </div>

      {/* 2. Stepper 5 Bước Ngang Trên Cùng */}
      <div className={styles.stepperWrapper}>
        <div className={styles.stepperConnector} />
        {steps.map((step) => {
          const IconComp = STEP_ICONS[step.iconType] || Truck;
          return (
            <div key={step.id} className={styles.stepItem}>
              <div className={styles.stepIconCircle}>
                <IconComp size={20} />
              </div>
              <span className={styles.stepTitle}>
                {step.title.includes("xuất hàng")
                  ? "NCC xuất hàng"
                  : step.title.includes("kiểm nhận")
                    ? "Kiểm nhận"
                    : step.title.includes("mẻ nấu")
                      ? "Nấu"
                      : step.title.includes("Lưu mẫu")
                        ? "Lưu mẫu"
                        : "Phát suất"}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Danh Sách 5 Thẻ Dòng Thời Gian */}
      <div className={styles.timelineSection}>
        {steps.map((step, idx) => {
          const IconComp = STEP_ICONS[step.iconType] || Truck;
          const isExpanded = Boolean(expandedMap[step.id]);
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className={styles.timelineRow}>
              {/* Cột thời gian bên trái */}
              <div className={styles.timelineTime}>{step.timeStr}</div>

              {/* Điểm nút & trục dòng thời gian */}
              <div className={styles.timelineNode}>
                <div className={styles.nodeIconCircle}>
                  <IconComp size={16} />
                </div>
                {!isLast && <div className={styles.nodeLine} />}
              </div>

              {/* Thẻ Card nội dung bên phải */}
              <div className={styles.timelineCard}>
                <div className={styles.cardHeaderRow}>
                  <h4 className={styles.cardTitle}>{step.title}</h4>
                  <span className={styles.badgeSealed}>{step.badgeLabel}</span>
                </div>

                <div className={styles.cardSubtitleRow}>
                  <span className={styles.cardSubtitle}>{step.subtitle}</span>
                  {Array.isArray(step.badges) &&
                    step.badges.map((b, bIdx) => (
                      <span key={bIdx} className={styles.infoPill}>
                        {b}
                      </span>
                    ))}
                </div>

                {/* Nút bấm mở rộng Accordion */}
                <button
                  type="button"
                  className={styles.btnExpand}
                  onClick={() => toggleExpand(step.id)}
                >
                  <span>Chi tiết niêm phong</span>
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {/* Khung Chi Tiết Niêm Phong Mở Rộng (Theo Ảnh 2) */}
                {isExpanded && step.detail && (
                  <div className={styles.detailBox}>
                    <div className={styles.detailHeader}>
                      <span className={styles.detailTitle}>
                        {step.detail.innerTitle}
                      </span>
                      <span
                        className={`${styles.badgeCheckStatus} ${isVerified ? styles.verified : ""}`}
                      >
                        {isVerified
                          ? "Đã kiểm tra (Hợp lệ)"
                          : step.detail.verifyStatusLabel}
                      </span>
                    </div>

                    <div className={styles.detailList}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Trạng thái</span>
                        <span className={styles.detailVal}>
                          {step.detail.blockchainStatus}
                        </span>
                      </div>

                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>
                          Thời điểm ghi
                        </span>
                        <span className={styles.detailVal}>
                          {step.detail.recordedTime}
                        </span>
                      </div>

                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Dấu vân tay</span>
                        <span className={`${styles.detailVal} ${styles.mono}`}>
                          {step.detail.shortHash || step.detail.dataHash}
                        </span>
                      </div>

                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Khối</span>
                        <span className={styles.detailVal}>
                          #{step.detail.blockNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

TraceabilityBlockchainCard.propTypes = {
  proof: PropTypes.shape({
    steps: PropTypes.array,
    isVerified: PropTypes.bool,
  }),
  steps: PropTypes.array,
  isVerified: PropTypes.bool,
  onVerify: PropTypes.func,
  isVerifying: PropTypes.bool,
};

TraceabilityBlockchainCard.defaultProps = {
  proof: null,
  steps: null,
  isVerified: undefined,
  onVerify: null,
  isVerifying: false,
};
