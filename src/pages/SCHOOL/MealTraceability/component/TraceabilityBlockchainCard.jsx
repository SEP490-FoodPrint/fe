import React from "react";
import { ShieldCheck, Clock, Info } from "lucide-react";
import styles from "./TraceabilityBlockchainCard.module.scss";

export default function TraceabilityBlockchainCard({ proof }) {
  const isProofAvailable = Boolean(proof && proof.dataHash);

  return (
    <section className={styles.blockchainSection}>
      <div className={styles.blockchainHeader}>
        <div className={styles.titleArea}>
          <div className={styles.shieldIconWrap}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className={styles.headingRow}>
              <h2 className={styles.heading}>XÁC MINH TÍNH TOÀN VẸN DỮ LIỆU BLOCKCHAIN</h2>
              <span className={styles.demoTag}>CHẾ ĐỘ KIỂM TRA</span>
            </div>
            <p className={styles.desc}>
              Dữ liệu chuỗi cung ứng được lưu trữ tại FoodPrint. Bằng chứng mã băm (Hash) sẽ được đối soát trên Blockchain chống làm giả mạo.
            </p>
          </div>
        </div>

        <div>
          {isProofAvailable ? (
            <div className={styles.statusPillPending} style={{ color: "#86efac", background: "rgba(34, 197, 94, 0.2)", borderColor: "rgba(34, 197, 94, 0.4)" }}>
              <ShieldCheck size={14} />
              <span>Trạng thái: VERIFIED (Khớp 100%)</span>
            </div>
          ) : (
            <div className={styles.statusPillPending}>
              <Clock size={14} />
              <span>Trạng thái: CHƯA NEO ON-CHAIN (TẠM ĐỂ TRỐNG ĐỐI SOÁT)</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.techGrid}>
        <div className={styles.techCol}>
          <div className={styles.techRow}>
            <span className={styles.techLabel}>Mạng lưới mục tiêu:</span>
            <span className={styles.techVal} style={{ color: "#5eead4" }}>Polygon Amoy Testnet</span>
          </div>
          <div className={styles.techRow}>
            <span className={styles.techLabel}>Thuật toán băm:</span>
            <span className={styles.techVal}>Keccak-256 (Canonical Payload)</span>
          </div>
          <div className={styles.techRow}>
            <span className={styles.techLabel}>Trạng thái ghi nhận:</span>
            <span className={styles.techVal}>
              {isProofAvailable ? proof.anchorStatus : "ĐANG CHỜ XÁC THỰC"}
            </span>
          </div>
          <div className={styles.techRow}>
            <span className={styles.techLabel}>Số khối (Block):</span>
            <span className={styles.techVal}>
              {isProofAvailable ? `#${proof.blockNumber}` : "[Chưa tạo giao dịch]"}
            </span>
          </div>
        </div>

        <div className={styles.techCol}>
          <div>
            <div className={styles.techLabel} style={{ marginBottom: "4px" }}>
              Smart Contract Registry:
            </div>
            <div className={styles.codeBox}>
              {isProofAvailable ? proof.contractAddress : "0x71C...aB42E8b4F5B2E8D701469e023 [FoodPrintHashRegistry]"}
            </div>
          </div>

          <div>
            <div className={styles.techLabel} style={{ marginBottom: "4px" }}>
              Mã giao dịch (TxHash):
            </div>
            <div className={styles.codeBox} style={{ color: "#5eead4" }}>
              {isProofAvailable ? proof.txHash : "[Dữ liệu tạm để trống để kiểm tra]"}
            </div>
          </div>

          <div>
            <div className={styles.techLabel} style={{ marginBottom: "4px" }}>
              Bằng chứng Payload Hash (dataHash):
            </div>
            <div className={styles.codeBox}>
              {isProofAvailable ? proof.dataHash : "[Dữ liệu tạm để trống để kiểm tra]"}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.emptyNoticeBox}>
        <Info size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Ghi chú kiểm tra:</strong> Phần dữ liệu mã băm Blockchain hiện đang tạm để trống để bạn kiểm tra đối chiếu luồng chuỗi cung ứng trước. Sau này khi kết nối Smart Contract và bảng version off-chain chuẩn, trường này sẽ tự động hiển thị hash và đối soát tính toàn vẹn on-chain.
        </span>
      </div>
    </section>
  );
}
