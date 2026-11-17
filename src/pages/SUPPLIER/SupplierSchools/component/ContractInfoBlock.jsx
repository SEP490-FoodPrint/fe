import React from "react"
import PropTypes from "prop-types"
import {
  CONTRACT_STATUS,
  formatDateTimeVi,
  formatDateVi,
} from "src/services/SupplierSchoolService"
import ContractDocumentList from "./ContractDocumentList"
import styles from "./ContractInfoBlock.module.scss"

function ContractInfoBlock({
  contract,
  downloadingDocId = null,
  docErrors = {},
  onPreviewDocument,
  onDownloadDocument,
}) {
  if (!contract) return null

  const isClosed =
    contract.status === CONTRACT_STATUS.CLOSED ||
    Boolean(contract.closedAt) ||
    Boolean(contract.closeReason)

  return (
    <div className={styles.contractBody}>
      <dl className={styles.metaRowsGrid}>
        <div className={styles.inlineRow}>
          <dt>Ngày ký</dt>
          <dd>{formatDateVi(contract.signedOn)}</dd>
        </div>
        <div className={styles.inlineRow}>
          <dt>Kích hoạt lúc</dt>
          <dd>{formatDateTimeVi(contract.activatedAt)}</dd>
        </div>
        <div className={styles.inlineRow}>
          <dt>Ngày bắt đầu</dt>
          <dd>{formatDateVi(contract.startsOn)}</dd>
        </div>
        <div className={styles.inlineRow}>
          <dt>Ngày kết thúc</dt>
          <dd>{formatDateVi(contract.endsOn)}</dd>
        </div>
        {isClosed ? (
          <div className={styles.inlineRow}>
            <dt>Đóng lúc</dt>
            <dd>{formatDateTimeVi(contract.closedAt)}</dd>
          </div>
        ) : null}
        {contract.scopeNote ? (
          <div className={`${styles.inlineRow} ${styles.fullSpanRow}`}>
            <dt>Phạm vi cung cấp</dt>
            <dd>{contract.scopeNote}</dd>
          </div>
        ) : null}
        {isClosed ? (
          <div className={`${styles.inlineRow} ${styles.fullSpanRow}`}>
            <dt>Lý do đóng</dt>
            <dd>{contract.closeReason || "Chưa ghi nhận lý do"}</dd>
          </div>
        ) : null}
        <div className={`${styles.inlineRow} ${styles.fullSpanRow}`}>
          <dt>Danh mục nguyên liệu</dt>
          <dd>
            {contract.ingredients?.length ? (
              <div className={styles.ingredientList}>
                {contract.ingredients.map(item => (
                  <span key={item.id} className={styles.ingredientTag}>
                    {item.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className={styles.mutedValue}>Chưa có dữ liệu</span>
            )}
          </dd>
        </div>
      </dl>

      <div className={styles.documentsSection}>
        <ContractDocumentList
          contractId={contract.id}
          documents={contract.documents || []}
          downloadingDocId={downloadingDocId}
          docErrors={docErrors}
          onPreview={onPreviewDocument}
          onDownload={onDownloadDocument}
        />
      </div>
    </div>
  )
}

ContractInfoBlock.propTypes = {
  contract: PropTypes.shape({
    id: PropTypes.string.isRequired,
    number: PropTypes.string,
    status: PropTypes.string,
    signedOn: PropTypes.string,
    startsOn: PropTypes.string,
    endsOn: PropTypes.string,
    scopeNote: PropTypes.string,
    activatedAt: PropTypes.string,
    closedAt: PropTypes.string,
    closeReason: PropTypes.string,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    ),
    documents: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        kind: PropTypes.string,
        fileName: PropTypes.string,
        mimeType: PropTypes.string,
        size: PropTypes.number,
        createdAt: PropTypes.string,
      }),
    ),
  }),
  downloadingDocId: PropTypes.string,
  docErrors: PropTypes.objectOf(PropTypes.string),
  onPreviewDocument: PropTypes.func,
  onDownloadDocument: PropTypes.func,
}

export default ContractInfoBlock
