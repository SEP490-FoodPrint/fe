import React from "react";
import {
  Boxes,
  MapPin,
  ShieldCheck,
  Link2,
  ExternalLink,
  Sprout,
  Receipt,
} from "lucide-react";
import styles from "./TraceabilityIngredientsFlow.module.scss";
import { formatShortHash } from "./traceabilityBlockchainAdapter";

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
const dmy = (v) => {
  const d = parse(v);
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : "";
};
const day = (value) => {
  const [y, m, d] = String(value || "").slice(0, 10).split("-");
  return d ? `${d}/${m}/${y}` : "—";
};

// Chữ cái đầu của tên riêng, bỏ các tiền tố loại hình doanh nghiệp.
const LEGAL_PREFIX = /^(công ty|cty|hợp tác xã|htx|tnhh|cổ phần|cp|mtv)\s+/i;
const initialOf = (name) => {
  let rest = String(name || "").trim();
  while (LEGAL_PREFIX.test(rest)) rest = rest.replace(LEGAL_PREFIX, "");
  return (rest[0] || String(name || "?")[0] || "?").toUpperCase();
};

function inspection(del) {
  const approvals = Array.isArray(del?.approvals) ? del.approvals : [];
  const approved = approvals.filter((a) => a.decision === "APPROVE").length;
  const roles = approvals.length ? ` · ${approved}/${approvals.length} vai trò đạt` : "";
  if (del?.status === "RECEIVED")
    return { tone: "ok", label: `Đã kiểm nhận${roles}` };
  if (del?.status === "REJECTED") return { tone: "bad", label: "Bị từ chối" };
  return approvals.length
    ? { tone: "wait", label: `Đang kiểm nhận${roles}` }
    : { tone: "wait", label: "Chưa kiểm nhận" };
}

/** Trạng thái blockchain của một đơn giao, từ chuỗi bằng chứng của khối. */
function chainStatus(nodes, deliveryId) {
  const mine = nodes.filter(
    (n) =>
      n.recordId === deliveryId &&
      (n.kind === "deliveries" || n.kind === "delivery-declarations"),
  );
  if (!mine.length) return { tone: "none", label: "Chưa ghi blockchain" };
  const broken = mine.some(
    (n) =>
      n.verificationStatus === "MISMATCH" ||
      (n.links || []).some((l) => l.status === "MISMATCH"),
  );
  if (broken) return { tone: "bad", label: "Dữ liệu không khớp blockchain" };
  const confirmed = mine.filter((n) => n.transactionStatus === "CONFIRMED");
  const proof = confirmed.find((n) => n.kind === "deliveries") || confirmed[0];
  if (!proof) {
    if (mine.some((n) => n.transactionStatus === "SUBMITTED"))
      return { tone: "wait", label: "Đang ghi blockchain" };
    if (mine.some((n) => n.transactionStatus === "FAILED"))
      return { tone: "bad", label: "Ghi blockchain thất bại, chờ gửi lại" };
    return { tone: "wait", label: "Chờ ghi lên blockchain" };
  }
  const verified = confirmed.every((n) => n.verificationStatus === "VERIFIED");
  return {
    tone: "ok",
    label: verified ? "Đã xác thực blockchain" : "Đã ghi blockchain",
    hash: formatShortHash(proof.dataHash),
    explorerUrl: proof.explorerUrl,
  };
}

function DeliverySlip({ del, nodes }) {
  const check = inspection(del);
  const chain = chainStatus(nodes, del.id);
  const lots = Array.isArray(del.lots) ? del.lots : [];
  const received = hm(del.receivedAt);

  return (
    <li className={styles.slip}>
      <div className={styles.slipFacts}>
        <div className={styles.fact}>
          <span className={styles.factLabel}>Biển số xe</span>
          {del.vehiclePlate ? (
            <span className={styles.plate}>{del.vehiclePlate}</span>
          ) : (
            <span className={styles.factMissing}>Chưa khai báo</span>
          )}
        </div>

        <div className={styles.fact}>
          <span className={styles.factLabel}>Thời gian nhận</span>
          {received ? (
            <span className={styles.receivedAt}>
              <strong>{received}</strong>
              <span>{dmy(del.receivedAt)}</span>
            </span>
          ) : (
            <span className={styles.factMissing}>Chưa nhận</span>
          )}
          {hm(del.arrivedAt) && (
            <span className={styles.factHint}>Xe đến {hm(del.arrivedAt)}</span>
          )}
        </div>

        <div className={styles.fact}>
          <span className={styles.factLabel}>Đơn giao</span>
          <span className={styles.slipNo}>
            <Receipt size={14} />
            {del.deliveryNo || "—"}
          </span>
          <span className={`${styles.status} ${styles[`tone_${check.tone}`]}`}>
            <ShieldCheck size={12} />
            {check.label}
          </span>
        </div>
      </div>

      {lots.length > 0 && (
        <ul className={styles.lots}>
          {lots.map((lot) => (
            <li key={lot.ingredientLotId} className={styles.lot}>
              <span className={styles.lotName}>{lot.ingredientName}</span>
              <span className={styles.lotMeta}>
                Lô <code>{lot.lotCode}</code>
                {lot.expiryDate && <> · HSD {day(lot.expiryDate)}</>}
              </span>
              {lot.sourceFacility && (
                <span className={styles.lotOrigin}>
                  <Sprout size={12} />
                  {lot.sourceFacility.name}
                  {lot.sourceFacility.address
                    ? ` · ${lot.sourceFacility.address}`
                    : ""}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className={`${styles.chain} ${styles[`chain_${chain.tone}`]}`}>
        <Link2 size={13} />
        <span>{chain.label}</span>
        {chain.hash && <code className={styles.chainHash}>{chain.hash}</code>}
        {chain.explorerUrl && (
          <a
            href={chain.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.chainLink}
          >
            Xem giao dịch <ExternalLink size={12} />
          </a>
        )}
      </div>
    </li>
  );
}

/**
 * Nguồn gốc nguyên liệu của món theo khối: nhà cung cấp nào tham gia, thông
 * tin cơ bản của họ và từng đơn giao (biển số xe, giờ nhận, lô nguyên liệu,
 * trạng thái blockchain).
 */
export default function TraceabilityIngredientsFlow({ dish, proofNodes }) {
  if (!dish) return null;
  const suppliers = Array.isArray(dish.suppliers) ? dish.suppliers : [];
  const nodes = Array.isArray(proofNodes) ? proofNodes : [];
  const deliveryCount = suppliers.reduce(
    (n, s) => n + (s.deliveries?.length || 0),
    0,
  );

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <Boxes size={16} />
        </div>
        <div>
          <h2 className={styles.heading}>Nguồn gốc nguyên liệu</h2>
          <p className={styles.subheading}>
            {suppliers.length
              ? `Nguyên liệu món ${dish.dishName} do ${suppliers.length} nhà cung cấp giao qua ${deliveryCount} đơn`
              : `Món ${dish.dishName}`}
          </p>
        </div>
      </header>

      {suppliers.length === 0 ? (
        <p className={styles.empty}>
          Chưa có lô nguyên liệu nào được xuất kho cho món này.
        </p>
      ) : (
        <div className={styles.suppliers}>
          {suppliers.map((s) => (
            <article key={s.id} className={styles.supplier}>
              <div className={styles.supplierHead}>
                <span className={styles.avatar} aria-hidden="true">
                  {initialOf(s.name)}
                </span>
                <div className={styles.supplierInfo}>
                  <h3 className={styles.supplierName}>{s.name}</h3>
                  <p className={styles.supplierMeta}>
                    {s.taxCode && (
                      <span>
                        MST <strong>{s.taxCode}</strong>
                      </span>
                    )}
                    {s.address && (
                      <span>
                        <MapPin size={12} />
                        {s.address}
                      </span>
                    )}
                  </p>
                  {s.certifications?.length > 0 && (
                    <div className={styles.certs}>
                      {s.certifications.map((c) => (
                        <span
                          key={`${c.certificationType}-${c.certificateNo}`}
                          className={styles.cert}
                          title={`Số ${c.certificateNo}${c.expiryDate ? ` · hiệu lực đến ${day(c.expiryDate)}` : ""}`}
                        >
                          <ShieldCheck size={12} />
                          {c.certificationType}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={styles.deliveryCount}>
                  {s.deliveries?.length || 0} đơn giao
                </span>
              </div>

              <ul className={styles.slips}>
                {(s.deliveries || []).map((del) => (
                  <DeliverySlip key={del.id} del={del} nodes={nodes} />
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
