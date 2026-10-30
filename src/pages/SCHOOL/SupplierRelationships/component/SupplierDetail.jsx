import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  Skeleton,
} from "@mui/material"
import { Link2, List } from "lucide-react"
import RelationshipStatus from "./RelationshipStatus"
import SupplierDocuments from "./SupplierDocuments"
import styles from "./SupplierDetail.module.scss"

const formatDate = value =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—"

function DetailRow({ label, value }) {
  return (
    <div className={styles.detailRow}>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  )
}

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
}

function SupplierDetail({
  supplier,
  loading,
  onBack,
  onLink,
  onViewDocument,
  onViewRelationships,
}) {
  if (loading || !supplier) {
    return (
      <div className={styles.loading}>
        <Skeleton variant="rounded" height={112} />
        <Skeleton variant="rounded" height={250} />
        <Skeleton variant="rounded" height={280} />
      </div>
    )
  }

  const hasCurrentRelationship = ["ACTIVE", "SUSPENDED"].includes(
    supplier.relationship?.status,
  )

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
        <span>Nhà cung cấp</span><span>/</span><button type="button" onClick={onBack}>Danh sách</button><span>/</span><strong>Chi tiết</strong>
      </nav>

      <header className={styles.detailHeader}>
        <div className={styles.headerMain}>
          <div>
            <p className={styles.eyebrow}>Chi tiết nhà cung cấp</p>
            <h1>{supplier.name}</h1>
            <div className={styles.headerMeta}>
              <span>Mã định danh: {supplier.id}</span>
              <RelationshipStatus status={supplier.relationship?.status} />
            </div>
          </div>
        </div>
        {!hasCurrentRelationship && (
          <Button variant="contained" startIcon={<Link2 size={17} />} onClick={onLink}>
            Liên kết
          </Button>
        )}
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Thông tin nhà cung cấp</h2>
            <p>Thông tin tổ chức đang được cung cấp trên hệ thống.</p>
          </div>
        </div>
        <dl className={styles.infoGrid}>
          <DetailRow label="Tên nhà cung cấp" value={supplier.name} />
          <DetailRow label="Mã số thuế" value={supplier.taxCode} />
          <DetailRow label="Số điện thoại" value={supplier.phone} />
          <DetailRow label="Email" value={supplier.email} />
          <DetailRow label="Địa chỉ" value={supplier.address} />
          <DetailRow label="Trạng thái hoạt động" value="Đang hoạt động" />
        </dl>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Hồ sơ và giấy tờ</h2>
            <p>Tài liệu được nhà cung cấp đưa lên để nhà trường tham khảo.</p>
          </div>
          <span className={styles.documentCount}>{supplier.certifications.length} tài liệu</span>
        </div>

        <SupplierDocuments
          documents={supplier.certifications}
          onViewDocument={onViewDocument}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Thông tin liên kết</h2>
            <p>Quan hệ hiện tại giữa nhà trường và nhà cung cấp này.</p>
          </div>
        </div>
        <div className={styles.relationshipSummary}>
          <div>
            <span>Trạng thái liên kết</span>
            <RelationshipStatus status={supplier.relationship?.status} />
          </div>
          {supplier.relationship && (
            <div>
              <span>Ngày thiết lập gần nhất</span>
              <strong>{formatDate(supplier.relationship.linkedAt)}</strong>
            </div>
          )}
          <div className={styles.relationshipAction}>
            {hasCurrentRelationship ? (
              <Button startIcon={<List size={17} />} onClick={onViewRelationships}>
                Xem danh sách liên kết
              </Button>
            ) : (
              <span>Nhà trường có thể thiết lập liên kết sau khi xem xét thông tin cần thiết.</span>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

SupplierDetail.propTypes = {
  supplier: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  onBack: PropTypes.func.isRequired,
  onLink: PropTypes.func.isRequired,
  onViewDocument: PropTypes.func.isRequired,
  onViewRelationships: PropTypes.func.isRequired,
}

export default SupplierDetail
