import React from "react"
import PropTypes from "prop-types"
import { IconButton, Tooltip } from "@mui/material"
import {
  DescriptionOutlined,
  DownloadOutlined,
  ErrorOutlineOutlined,
  ImageOutlined,
  PictureAsPdfOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import {
  formatDateTimeVi,
  formatFileSize,
  getDocumentKindLabel,
} from "src/services/SupplierSchoolService"
import styles from "./ContractDocumentList.module.scss"

function getShortMimeLabel(mimeType) {
  const normalized = String(mimeType ?? "").toLowerCase()
  if (normalized === "application/pdf") return "PDF"
  if (normalized === "image/png") return "PNG"
  if (normalized === "image/jpeg") return "JPEG"
  return "Tệp"
}

function renderDocumentIcon(mimeType) {
  const normalized = String(mimeType ?? "").toLowerCase()
  if (normalized === "application/pdf") {
    return <PictureAsPdfOutlined className={styles.docTypeIcon} />
  }
  if (normalized.startsWith("image/")) {
    return <ImageOutlined className={styles.docTypeIcon} />
  }
  return <DescriptionOutlined className={styles.docTypeIcon} />
}

function ContractDocumentList({
  contractId,
  documents,
  downloadingDocId = null,
  docErrors = {},
  onPreview,
  onDownload,
}) {
  if (!documents || documents.length === 0) {
    return (
      <div className={styles.emptyDocs}>
        Chưa có tệp hợp đồng hoặc phụ lục được tải lên.
      </div>
    )
  }

  return (
    <div className={styles.docList}>
      {documents.map(doc => {
        const isDownloading = downloadingDocId === doc.id
        const docError = docErrors?.[doc.id]

        return (
          <div key={doc.id} className={styles.docRowWrap}>
            <div className={styles.docRow}>
              <div className={styles.docMain}>
                <div className={styles.docIconBox} aria-hidden="true">
                  {renderDocumentIcon(doc.mimeType)}
                </div>
                <div className={styles.docMeta}>
                  <div className={styles.docName} title={doc.fileName}>
                    {doc.fileName}
                  </div>
                  <div className={styles.docSub}>
                    <span>{getDocumentKindLabel(doc.kind)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getShortMimeLabel(doc.mimeType)}</span>
                    <span aria-hidden="true">·</span>
                    <span className={styles.docStat}>
                      {formatFileSize(doc.size)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={styles.docStat}>
                      {formatDateTimeVi(doc.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.docActions}>
                <Tooltip title="Xem tệp">
                  <IconButton
                    type="button"
                    size="small"
                    className={styles.iconActionBtn}
                    aria-label={`Xem tệp ${doc.fileName}`}
                    onClick={() => onPreview?.(contractId, doc)}
                  >
                    <VisibilityOutlined className={styles.actionSvg} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isDownloading ? "Đang tải..." : "Tải về"}>
                  <span>
                    <IconButton
                      type="button"
                      size="small"
                      disabled={isDownloading}
                      className={styles.iconActionBtn}
                      aria-label={`Tải về ${doc.fileName}`}
                      onClick={() => onDownload?.(contractId, doc)}
                    >
                      <DownloadOutlined className={styles.actionSvg} />
                    </IconButton>
                  </span>
                </Tooltip>
              </div>
            </div>

            {docError ? (
              <div className={styles.docErrorBanner} role="alert">
                <ErrorOutlineOutlined
                  className={styles.docErrorIcon}
                  aria-hidden="true"
                />
                <span>{docError}</span>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

ContractDocumentList.propTypes = {
  contractId: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      kind: PropTypes.string,
      fileName: PropTypes.string,
      mimeType: PropTypes.string,
      size: PropTypes.number,
      createdAt: PropTypes.string,
    }),
  ).isRequired,
  downloadingDocId: PropTypes.string,
  docErrors: PropTypes.objectOf(PropTypes.string),
  onPreview: PropTypes.func,
  onDownload: PropTypes.func,
}

export default ContractDocumentList
