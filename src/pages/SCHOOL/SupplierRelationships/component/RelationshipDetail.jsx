import React from "react"
import PropTypes from "prop-types"
import { Button, Skeleton } from "@mui/material"
import { Link2Off } from "lucide-react"
import RelationshipStatus from "./RelationshipStatus"
import SupplierDocuments from "./SupplierDocuments"
import styles from "./RelationshipDetail.module.scss"

const formatDate = value =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—"

function InfoBlock({ title, rows }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}><h2>{title}</h2></div>
      <dl className={styles.infoGrid}>
        {rows.map(row => (
          <div key={row.label} className={styles.detailRow}>
            <dt>{row.label}</dt>
            <dd>{row.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

InfoBlock.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
}

function RelationshipDetail({ relationship, loading, onBack, onUnlink, onViewDocument }) {
  if (loading || !relationship) {
    return (
      <div className={styles.loading}>
        <Skeleton variant="rounded" height={112} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={260} />
      </div>
    )
  }

  const canUnlink = ["ACTIVE", "SUSPENDED"].includes(relationship.status)

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
        <span>Nhà cung cấp</span><span>/</span><button type="button" onClick={onBack}>Danh sách liên kết</button><span>/</span><strong>Chi tiết</strong>
      </nav>

      <header className={styles.detailHeader}>
        <div className={styles.headerMain}>
          <div>
            <p>Chi tiết liên kết</p>
            <h1>{relationship.supplier.name}</h1>
            <div className={styles.headerMeta}>
              <span>{relationship.school.name}</span>
              <RelationshipStatus status={relationship.status} />
            </div>
          </div>
        </div>
        {canUnlink && (
          <Button color="error" variant="outlined" startIcon={<Link2Off size={17} />} onClick={onUnlink}>
            Hủy liên kết
          </Button>
        )}
      </header>

      <InfoBlock
        title="Thông tin nhà cung cấp"
        rows={[
          { label: "Tên nhà cung cấp", value: relationship.supplier.name },
          { label: "Mã số thuế", value: relationship.supplier.taxCode },
          { label: "Điện thoại", value: relationship.supplier.phone },
          { label: "Email", value: relationship.supplier.email },
          { label: "Địa chỉ", value: relationship.supplier.address },
        ]}
      />

      <section className={styles.section}>
        <div className={styles.sectionHeading}><h2>Thông tin liên kết</h2></div>
        <dl className={styles.relationshipGrid}>
          <div className={styles.schoolContext}>
            <dt>Nhà trường</dt>
            <dd>
              {relationship.school.name}
              {relationship.school.code && <span>{relationship.school.code}</span>}
            </dd>
          </div>
          <div><dt>Mã liên kết</dt><dd>{relationship.id}</dd></div>
          <div><dt>Trạng thái</dt><dd><RelationshipStatus status={relationship.status} /></dd></div>
          <div><dt>Ngày thiết lập</dt><dd>{formatDate(relationship.linkedAt)}</dd></div>
          {relationship.unlinkedAt && (
            <div><dt>Ngày hủy liên kết</dt><dd>{formatDate(relationship.unlinkedAt)}</dd></div>
          )}
        </dl>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Hồ sơ nhà cung cấp</h2>
            <p>Các tài liệu hiện có trên hồ sơ nhà cung cấp.</p>
          </div>
        </div>
        <SupplierDocuments
          documents={relationship.supplier.certifications}
          onViewDocument={onViewDocument}
        />
      </section>
    </div>
  )
}

RelationshipDetail.propTypes = {
  relationship: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  onBack: PropTypes.func.isRequired,
  onUnlink: PropTypes.func.isRequired,
  onViewDocument: PropTypes.func.isRequired,
}

export default RelationshipDetail
