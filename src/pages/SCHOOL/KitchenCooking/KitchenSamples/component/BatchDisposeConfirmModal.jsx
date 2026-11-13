import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { X, AlertTriangle, Check } from "lucide-react";
import styles from "./DisposeSampleModal.module.scss";

export default function BatchDisposeConfirmModal({
  open = false,
  onClose,
  onConfirm,
  count = 0,
  submitting = false,
}) {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="batch-dispose-title"
    >
      <DialogTitle id="batch-dispose-title" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dc2626",
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Xác nhận hủy tất cả
              </h3>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Tiêu hủy các mẫu lưu đủ 24 giờ
              </span>
            </div>
          </div>
          <IconButton size="small" onClick={onClose} disabled={submitting}>
            <X size={18} />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent dividers style={{ padding: "16px 20px" }}>
        <p style={{ margin: "0 0 12px 0", fontSize: 13.5, color: "#334155", lineHeight: 1.5 }}>
          Bạn có chắc chắn muốn ghi nhận tiêu hủy đồng loạt{" "}
          <strong style={{ color: "#dc2626" }}>{count} mẫu lưu</strong> đã lưu trữ đủ 24
          giờ theo quy chuẩn an toàn thực phẩm?
        </p>
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#f8fafc",
            borderRadius: 8,
            fontSize: 12,
            color: "#64748b",
            border: "1px solid #e2e8f0",
          }}
        >
          Hành động này sẽ cập nhật trạng thái đã tiêu hủy cho tất cả các mẫu lưu đủ điều
          kiện và không thể hoàn tác.
        </div>
      </DialogContent>

      <DialogActions style={{ padding: "12px 20px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            color: "#475569",
            cursor: "pointer",
          }}
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Check size={16} />
          <span>{submitting ? "Đang xử lý..." : "Xác nhận tiêu hủy"}</span>
        </button>
      </DialogActions>
    </Dialog>
  );
}

