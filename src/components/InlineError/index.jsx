import React from "react"
import styles from "./InlineError.module.scss"

/**
 * Hiển thị DUY NHẤT một thông báo lỗi dạng chữ đỏ in nghiêng.
 * Truyền một chuỗi hoặc mảng chuỗi; chỉ thông báo đầu tiên có nội dung được hiện.
 */
export default function InlineError({ messages, onRetry, retryText = "Thử lại", className = "" }) {
  const message = (Array.isArray(messages) ? messages : [messages]).find(
    (item) => typeof item === "string" && item.trim(),
  )
  if (!message) return null
  return (
    <p role="alert" className={`${styles.inlineError} ${className}`.trim()}>
      <span>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {retryText}
        </button>
      )}
    </p>
  )
}
