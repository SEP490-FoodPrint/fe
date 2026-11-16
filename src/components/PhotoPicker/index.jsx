import React, { useEffect, useId, useState } from "react";
import PropTypes from "prop-types";
import { Camera, ImagePlus, X } from "lucide-react";
import styles from "./style.module.scss";

const MAX_SIZE = 5 * 1024 * 1024;

export default function PhotoPicker({ value, onChange, disabled = false, required = true }) {
  const id = useId();
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!value) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const select = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || !file.size || file.size > MAX_SIZE) {
      onChange(null);
      setError("Chọn ảnh JPG hoặc PNG, dung lượng tối đa 5 MB.");
      return;
    }
    setError("");
    onChange(file);
  };

  return <div className={styles.picker}>
    <span className={styles.label}>Ảnh đính kèm <span>({required ? "bắt buộc" : "tùy chọn"})</span></span>
    <div className={styles.actions}>
      <label className={styles.action} htmlFor={`${id}-camera`}><Camera size={16} /> Chụp ảnh<input id={`${id}-camera`} className={styles.input} type="file" accept="image/jpeg,image/png" capture="environment" onChange={select} disabled={disabled} /></label>
      <label className={styles.action} htmlFor={`${id}-upload`}><ImagePlus size={16} /> Tải ảnh lên<input id={`${id}-upload`} className={styles.input} type="file" accept="image/jpeg,image/png" onChange={select} disabled={disabled} /></label>
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {preview && <div className={styles.preview}>
      <img src={preview} alt="Ảnh đã chọn" />
      <button type="button" disabled={disabled} onClick={() => { onChange(null); setError(""); }}><X size={15} /> Xóa ảnh</button>
    </div>}
  </div>;
}

PhotoPicker.propTypes = { value: PropTypes.object, onChange: PropTypes.func.isRequired, disabled: PropTypes.bool, required: PropTypes.bool };
