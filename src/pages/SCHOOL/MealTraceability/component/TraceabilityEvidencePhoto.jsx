import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Camera, X, ZoomIn } from "lucide-react";
import styles from "./TraceabilityEvidencePhoto.module.scss";

export function PhotoThumb({ photoUrl, label, onOpen }) {
  if (!photoUrl) {
    return (
      <div className={styles.photoThumbnail}>
        <Camera size={22} aria-hidden="true" />
        <span className={styles.placeholder}>Chưa có ảnh minh chứng</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      className={styles.photoThumbnail}
      onClick={onOpen}
      aria-label={label}
    >
      <img className={styles.thumbnailImage} src={photoUrl} alt="" />
      <span className={styles.zoomLabel}>
        <ZoomIn size={12} /> {label}
      </span>
    </button>
  );
}

export default function TraceabilityEvidencePhoto({ photo, onClose }) {
  return (
    <Dialog
      open={Boolean(photo)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="trace-evidence-title"
    >
      {photo && (
        <>
          <DialogTitle id="trace-evidence-title" className={styles.dialogTitle}>
            {photo.title}
            <IconButton onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <img
              className={styles.fullPhoto}
              src={photo.photoUrl}
              alt={photo.title}
            />
            {photo.photoHash && (
              <code className={styles.photoHash} title={photo.photoHash}>
                SHA-256 ảnh: {photo.photoHash.slice(0, 24)}...
              </code>
            )}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
