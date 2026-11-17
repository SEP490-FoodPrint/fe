import React, { useCallback, useState } from "react";
import { Dialog } from "@mui/material";
import styles from "./ConfirmActionDialog.module.scss";

/**
 * Hộp xác nhận ngắn trước khi thực hiện thao tác (Nấu, Nấu xong).
 * confirm({ title, message, confirmText, onConfirm }) mở hộp; element cần render một lần trong trang.
 */
export default function useConfirmAction() {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((options) => setRequest(options), []);
  const close = () => setRequest(null);
  const accept = () => {
    const action = request?.onConfirm;
    setRequest(null);
    action?.();
  };

  const element = (
    <Dialog
      open={Boolean(request)}
      onClose={close}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-action-title"
      classes={{ paper: styles.paper }}
    >
      <div className={styles.body}>
        <h2 id="confirm-action-title" className={styles.title}>{request?.title}</h2>
        {request?.message && <p className={styles.message}>{request.message}</p>}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={close}>
          Hủy
        </button>
        <button type="button" className={styles.confirmBtn} onClick={accept} autoFocus>
          {request?.confirmText || "Xác nhận"}
        </button>
      </div>
    </Dialog>
  );

  return { confirm, element };
}
