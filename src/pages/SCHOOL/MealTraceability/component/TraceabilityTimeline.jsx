import React from "react";
import {
  GitCommit,
  Truck,
  ChefHat,
  FlaskConical,
  CheckCheck,
} from "lucide-react";
import styles from "./TraceabilityTimeline.module.scss";

const pad = (n) => String(n).padStart(2, "0");
const parse = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const hm = (v) => {
  const d = parse(v);
  return d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : null;
};
const dm = (v) => {
  const d = parse(v);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` : "";
};
const sortTimes = (values) =>
  values
    .map(parse)
    .filter(Boolean)
    .sort((a, b) => a - b);

/** Một mốc "HH:mm" (hoặc khoảng "HH:mm → HH:mm"), ngày nhỏ bên dưới. */
function StepTime({ from, to }) {
  const start = hm(from);
  const end = hm(to);
  if (!start && !end)
    return <span className={styles.timePending}>Chưa ghi nhận</span>;
  const same = start && end && start === end && dm(from) === dm(to);
  const firstDay = dm(from || to);
  const lastDay = end ? dm(to) : "";
  return (
    <span className={styles.timeBlock}>
      <span className={styles.timeMain}>
        {start || end}
        {start && end && !same && (
          <>
            <span className={styles.timeArrow}>→</span>
            {end}
          </>
        )}
      </span>
      <span className={styles.timeDate}>
        {firstDay}
        {lastDay && lastDay !== firstDay ? ` – ${lastDay}` : ""}
      </span>
    </span>
  );
}

/** Mốc thật của món đang chọn, chung cho mọi lớp của khối. */
export default function TraceabilityTimeline({ meal, dish }) {
  const process = dish?.process || {};
  const receive = Array.isArray(process.receive) ? process.receive : [];
  const prepare = process.prepare || {};
  const sample = process.sample || {};
  const deliver = process.deliver || {};

  const arrivals = sortTimes(receive.map((r) => r.arrivedAt || r.receivedAt));
  const receipts = sortTimes(receive.map((r) => r.receivedAt));
  const receivedCount = receive.filter((r) => r.receivedAt).length;

  const steps = [
    {
      key: "receive",
      icon: Truck,
      title: "Tiếp nhận nguyên liệu",
      from: arrivals[0],
      to: receipts[receipts.length - 1],
      desc: receive.length
        ? `${receivedCount}/${receive.length} đơn giao đã kiểm nhận`
        : "Chưa có đơn giao cho món",
      done: receive.length > 0 && receivedCount === receive.length,
    },
    {
      key: "prepare",
      icon: ChefHat,
      title: "Chuẩn bị & chế biến",
      from: prepare.startedAt,
      to: prepare.completedAt,
      desc: prepare.batchCount
        ? `${prepare.batchCount} mẻ nấu ${dish?.dishName || ""}`
        : "Chưa có mẻ nấu",
      done: Boolean(prepare.completedAt),
    },
    {
      key: "sample",
      icon: FlaskConical,
      title: "Lưu mẫu thức ăn",
      from: sample.sampledAt,
      desc: `${sample.sampleCount ?? 0}/${prepare.batchCount ?? 0} mẻ đã lưu mẫu`,
      done: Boolean(sample.sampledAt),
    },
    {
      key: "deliver",
      icon: CheckCheck,
      title: "Giao suất đến các lớp",
      from: deliver.firstDistributedAt,
      to: deliver.lastDistributedAt,
      desc: deliver.distributed
        ? "Bếp đã giao suất cho mọi lớp trong khối"
        : deliver.firstDistributedAt
          ? "Đang giao, còn lớp chưa xác nhận"
          : "Chưa xác nhận giao suất",
      done: Boolean(deliver.distributed),
    },
  ];

  const mealDate = String(meal?.mealDate || "")
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");

  return (
    <section className={styles.timelineSection}>
      <div className={styles.timelineHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.headerIcon}>
            <GitCommit size={16} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Quy trình phục vụ bữa ăn</h2>
            <p className={styles.sectionSubtitle}>
              Tiếp nhận, chuẩn bị và giao món {dish?.dishName || ""}
              {mealDate ? ` ngày ${mealDate}` : ""}
            </p>
          </div>
        </div>
      </div>

      <ol className={styles.stepper}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <li
              key={step.key}
              className={`${styles.step} ${step.done ? styles.stepDone : ""}`}
            >
              <div className={styles.stepIconWrap}>
                <Icon size={18} />
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <StepTime from={step.from} to={step.to} />
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {receive.length > 0 && (
        <div className={styles.receivePanel}>
          <h3 className={styles.receiveTitle}>
            <Truck size={14} /> Chi tiết tiếp nhận nguyên liệu
          </h3>
          <ul className={styles.receiveList}>
            {receive.map((r) => (
              <li key={r.deliveryId} className={styles.receiveRow}>
                <div className={styles.receiveTimes}>
                  <span className={styles.receiveTime}>
                    <span className={styles.receiveLabel}>Xe đến</span>
                    <strong>{hm(r.arrivedAt) || "—"}</strong>
                  </span>
                  <span className={styles.receiveDash} aria-hidden="true" />
                  <span className={styles.receiveTime}>
                    <span className={styles.receiveLabel}>Kiểm nhận</span>
                    <strong
                      className={r.receivedAt ? styles.okTime : styles.waitTime}
                    >
                      {hm(r.receivedAt) || "Chưa nhận"}
                    </strong>
                  </span>
                  <span className={styles.receiveDay}>
                    {dm(r.receivedAt || r.arrivedAt)}
                  </span>
                </div>
                <div className={styles.receiveWho}>
                  <span className={styles.receiveSupplier}>
                    {r.supplierName || "—"}
                  </span>
                  <span className={styles.receiveMeta}>
                    Đơn {r.deliveryNo}
                    {r.vehiclePlate && (
                      <>
                        {" · "}
                        <span className={styles.plateMini}>
                          {r.vehiclePlate}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
