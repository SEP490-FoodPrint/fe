import React, { useEffect, useState } from "react";
import { Alert, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import ComplaintService from "src/services/ComplaintService";
import { complaintStatuses, complaintTypes, errorMessage, formatMealDate, formatTimestamp, mealLabels } from "../labels";
import styles from "./ComplaintDetail.module.scss";

export default function ComplaintDetail({ id, isTeacher, onClose }) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    ComplaintService.detail(id, controller.signal)
      .then(({ data }) => { if (!controller.signal.aborted) setItem(data); })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(errorMessage(failure, "Không tải được chi tiết khiếu nại."));
      });
    return () => controller.abort();
  }, [id, version]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" aria-labelledby="complaint-detail-title">
      <DialogTitle id="complaint-detail-title" className={styles.title}>Chi tiết &amp; Phản hồi</DialogTitle>
      <DialogContent dividers className={styles.content}>
        {!item && !error && <CircularProgress size={24} aria-label="Đang tải chi tiết" />}
        {error && <Alert severity="error" action={<Button color="inherit" onClick={() => { setError(""); setVersion(version + 1); }}>Thử lại</Button>}>{error}</Alert>}
        {item && (
          <>
            <section>
              <div className={styles.heading}>
                <h3>{complaintTypes[item.complaintType]}</h3>
                <Chip size="small" {...complaintStatuses[item.status]} />
              </div>
              <dl className={styles.metadata}>
                {!isTeacher && <div><dt>Lớp</dt><dd>{item.meal.className}</dd></div>}
                <div><dt>Ngày ăn</dt><dd>{formatMealDate(item.meal.mealDate)}</dd></div>
                <div><dt>Bữa ăn</dt><dd>{mealLabels[item.meal.mealType]}</dd></div>
                <div><dt>Thời gian gửi</dt><dd>{formatTimestamp(item.submittedAt)}</dd></div>
              </dl>
            </section>
            <section><h3>Nội dung đã gửi</h3><p>{item.description}</p></section>
            <section className={styles.response}>
              <h3>Phản hồi của nhà trường</h3>
              <p>{item.resolution || "Chưa có phản hồi"}</p>
              {item.resolution && (
                <small>{[item.handler?.fullName, item.resolvedAt && formatTimestamp(item.resolvedAt)].filter(Boolean).join(" · ")}</small>
              )}
            </section>
          </>
        )}
      </DialogContent>
      <DialogActions className={styles.actions}><Button onClick={onClose}>Đóng</Button></DialogActions>
    </Dialog>
  );
}
