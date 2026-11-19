import React from "react";
import {
  GitCommit,
  Truck,
  Flame,
  FlaskConical,
  Layers,
  CheckCheck,
} from "lucide-react";
import styles from "./TraceabilityTimeline.module.scss";
import { formatStepTime } from "./traceabilityBlockchainAdapter";

const earliest = (values) =>
  values.filter(Boolean).sort((a, b) => new Date(a) - new Date(b))[0] || null;
const latest = (values) =>
  values.filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0] || null;

/** Các mốc thật của món đang chọn, lấy từ 5 module quy trình. */
export default function TraceabilityTimeline({ allocation, classInfo, dish }) {
  const batches = Array.isArray(dish?.batches) ? dish.batches : [];
  const deliveries = batches.flatMap((b) =>
    (b?.ingredients || []).map((i) => i?.delivery).filter(Boolean),
  );
  const samples = batches.map((b) => b?.retainedSample).filter(Boolean);
  const className = classInfo?.name || "lớp";

  const steps = [
    {
      key: "receive",
      icon: Truck,
      title: "Tiếp nhận nguyên liệu",
      desc: `${new Set(deliveries.map((d) => d.id)).size} đơn giao hàng đã kiểm nhận`,
      time: latest(deliveries.map((d) => d.receivedAt)),
    },
    {
      key: "cook",
      icon: Flame,
      title: "Hoàn tất chế biến",
      desc: `${batches.length} mẻ nấu ${dish?.dishName || ""}`,
      time: latest(batches.map((b) => b?.completedAt)),
    },
    {
      key: "sample",
      icon: FlaskConical,
      title: "Lưu mẫu thức ăn",
      desc: `${samples.length}/${batches.length} mẻ đã lưu mẫu`,
      time: earliest(samples.map((s) => s.sampledAt)),
    },
    {
      key: "allocate",
      icon: Layers,
      title: "Phân bổ suất ăn",
      desc: `Chia ${allocation?.totalPortions ?? 0} suất cho ${className}`,
      time: allocation?.allocatedAt,
    },
    {
      key: "distribute",
      icon: CheckCheck,
      title: "Phát suất đến lớp",
      desc:
        allocation?.status === "DISTRIBUTED"
          ? "Bếp đã xác nhận giao suất ăn"
          : "Chưa xác nhận giao suất ăn",
      time: allocation?.distributedAt,
      success: true,
    },
  ];

  return (
    <section className={styles.timelineSection}>
      <div className={styles.timelineHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.headerIcon}>
            <GitCommit size={16} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Tiến trình phục vụ bữa ăn</h2>
            <p className={styles.sectionSubtitle}>
              Các mốc xác nhận trên hệ thống FoodPrint cho bữa ăn ngày{" "}
              {allocation?.mealDate || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.timelineGrid}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.key} className={styles.stepCard}>
              <div
                className={`${styles.stepIconWrap} ${
                  step.success && step.time ? styles.stepIconWrapSuccess : ""
                }`}
              >
                <Icon size={20} />
              </div>
              <div className={styles.stepContent}>
                <span className={styles.stepTime}>
                  {step.time ? formatStepTime(step.time) : "Chưa ghi nhận"}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
