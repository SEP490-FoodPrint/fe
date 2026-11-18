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
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
} from "lucide-react";
import styles from "./TraceabilityBlockchainCard.module.scss";

const STEP_ICONS = {
  truck: Truck,
  check: ClipboardCheck,
  cooking: CookingPot,
  sample: FlaskConical,
  distribution: UtensilsCrossed,
};

const BANNER = {
  UNCHECKED: {
    title: "Chưa kiểm tra toàn vẹn",
    text: "Bấm “Kiểm tra toàn vẹn” để đối chiếu dữ liệu hiện tại của từng chặng với blockchain.",
  },
  VERIFIED: {
    title: "Dữ liệu đã xác thực toàn vẹn",
    text: "Mọi bằng chứng của bữa ăn đã ghi lên blockchain và khớp với dữ liệu hiện tại.",
  },
  MISMATCH: {
    title: "Phát hiện dữ liệu không khớp",
    text: "Có chặng có dữ liệu hoặc liên kết hash khác với bằng chứng đã ghi. Xem chi tiết từng chặng.",
  },
  INCOMPLETE: {
    title: "Chưa đủ bằng chứng để xác thực",
    text: "Có chặng chưa ghi lên blockchain hoặc chưa đối soát được. Xem chi tiết từng chặng.",
  },
};

export default function TraceabilityBlockchainCard({
  steps,
  verdict,
  errorMessage,
  onVerify,
  isVerifying,
}) {
  const [expandedMap, setExpandedMap] = useState({ "step-1": true });

  if (!Array.isArray(steps) || steps.length === 0) return null;

  const toggleExpand = (stepId) =>
    setExpandedMap((prev) => ({ ...prev, [stepId]: !prev[stepId] }));

  const banner = BANNER[verdict] || BANNER.UNCHECKED;
  const bannerClass =
    verdict === "VERIFIED"
      ? styles.verified
      : verdict === "MISMATCH"
        ? styles.mismatch
        : verdict === "INCOMPLETE"
          ? styles.incomplete
          : "";

  return (
    <div className={styles.blockchainContainer}>
      <div className={`${styles.verifyBanner} ${bannerClass}`}>
        <div className={styles.verifyLeft}>
          <div className={styles.helpIconWrap}>
            {verdict === "VERIFIED" ? (
              <ShieldCheck size={26} />
            ) : verdict === "MISMATCH" ? (
              <ShieldAlert size={26} />
            ) : (
              <HelpCircle size={26} />
            )}
          </div>
          <div>
            <h3 className={styles.bannerTitle}>{banner.title}</h3>
            <p className={styles.bannerSubtitle}>{banner.text}</p>
            {errorMessage && (
              <p className={styles.errorNote}>{errorMessage}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          className={styles.btnVerify}
          onClick={onVerify}
          disabled={!onVerify || isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang đối soát...</span>
            </>
          ) : verdict === "UNCHECKED" ? (
            <span>Kiểm tra toàn vẹn</span>
          ) : (
            <span>Kiểm tra lại</span>
          )}
        </button>
      </div>

      <div className={styles.stepperWrapper}>
        <div className={styles.stepperConnector} />
        {steps.map((step) => {
          const IconComp = STEP_ICONS[step.iconType] || Truck;
          return (
            <div key={step.id} className={styles.stepItem}>
              <div className={styles.stepIconCircle}>
                <IconComp size={20} />
              </div>
              <span className={styles.stepTitle}>{step.shortLabel}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.timelineSection}>
        {steps.map((step, idx) => {
          const IconComp = STEP_ICONS[step.iconType] || Truck;
          const isExpanded = Boolean(expandedMap[step.id]);
          const isLast = idx === steps.length - 1;
          const records = Array.isArray(step.records) ? step.records : [];
          const sealed = records.some(
            (r) => r.blockchainStatus === "Đã ghi lên blockchain",
          );

          return (
            <div key={step.id} className={styles.timelineRow}>
              <div className={styles.timelineTime}>{step.timeStr || "—"}</div>

              <div className={styles.timelineNode}>
                <div className={styles.nodeIconCircle}>
                  <IconComp size={16} />
                </div>
                {!isLast && <div className={styles.nodeLine} />}
              </div>

              <div className={styles.timelineCard}>
                <div className={styles.cardHeaderRow}>
                  <h4 className={styles.cardTitle}>{step.title}</h4>
                  <span
                    className={`${styles.badgeSealed} ${sealed ? "" : styles.pending}`}
                  >
                    {records.length === 0
                      ? "Chưa ghi nhận"
                      : sealed
                        ? "Đã niêm phong"
                        : "Chưa niêm phong"}
                  </span>
                </div>

                <div className={styles.cardSubtitleRow}>
                  <span className={styles.cardSubtitle}>{step.subtitle}</span>
                  {(step.badges || []).map((b) => (
                    <span key={b} className={styles.infoPill}>
                      {b}
                    </span>
                  ))}
                </div>

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

                {isExpanded && (
                  <div className={styles.detailBox}>
                    <div className={styles.detailHeader}>
                      <span className={styles.detailTitle}>
                        {step.innerTitle}
                      </span>
                    </div>

                    {records.length === 0 && (
                      <p className={styles.emptyRecord}>
                        Chưa có bằng chứng blockchain cho chặng này.
                      </p>
                    )}

                    {records.map((r) => (
                      <div key={r.id} className={styles.recordBlock}>
                        <div className={styles.detailHeader}>
                          <span className={styles.detailTitle}>{r.label}</span>
                          <span
                            className={`${styles.badgeCheckStatus} ${
                              r.verifyStatus === "VERIFIED"
                                ? styles.verified
                                : r.verifyStatus === "MISMATCH" ||
                                    r.verifyStatus === "FAILED"
                                  ? styles.mismatch
                                  : ""
                            }`}
                          >
                            {r.verifyLabel}
                          </span>
                        </div>
                        <div className={styles.detailList}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>
                              Trạng thái
                            </span>
                            <span className={styles.detailVal}>
                              {r.blockchainStatus}
                            </span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>
                              Thời điểm ghi
                            </span>
                            <span className={styles.detailVal}>
                              {r.recordedTime || "—"}
                            </span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>
                              Dấu vân tay
                            </span>
                            <span
                              className={`${styles.detailVal} ${styles.mono}`}
                              title={r.dataHash}
                            >
                              {r.shortHash}
                            </span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Khối</span>
                            <span className={styles.detailVal}>
                              {r.blockNumber ? `#${r.blockNumber}` : "—"}
                            </span>
                          </div>
                          {r.verificationResult && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>
                                Kết quả
                              </span>
                              <span className={styles.detailVal}>
                                {r.verificationResult}
                              </span>
                            </div>
                          )}
                          {r.brokenLinks.length > 0 && (
                            <p className={styles.errorNote}>
                              Liên kết hash không khớp:{" "}
                              {r.brokenLinks.join(", ")}
                            </p>
                          )}
                          {r.explorerUrl && (
                            <a
                              className={styles.linkExplorer}
                              href={r.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Xem giao dịch trên Explorer{" "}
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
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
  steps: PropTypes.array,
  verdict: PropTypes.oneOf(["UNCHECKED", "VERIFIED", "MISMATCH", "INCOMPLETE"]),
  errorMessage: PropTypes.string,
  onVerify: PropTypes.func,
  isVerifying: PropTypes.bool,
};

TraceabilityBlockchainCard.defaultProps = {
  steps: [],
  verdict: "UNCHECKED",
  errorMessage: null,
  onVerify: null,
  isVerifying: false,
};
