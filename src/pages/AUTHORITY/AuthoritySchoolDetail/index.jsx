import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Button, Skeleton } from "@mui/material"
import { KeyboardArrowLeft, ReplayOutlined } from "@mui/icons-material"
import AuthoritySchoolService, {
  formatDateVi,
  getIntakeStateMeta,
  getRelationshipStatusMeta,
  getSchoolStatusMeta,
} from "src/services/AuthoritySchoolService"
import ROUTER from "src/router/ROUTER"
import styles from "./AuthoritySchoolDetail.module.scss"

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  muted: styles.toneMuted,
}

function ToneBadge({ meta }) {
  return (
    <span
      className={`${styles.badge} ${TONE_CLASS[meta.tone] || styles.toneMuted}`}
    >
      {meta.label}
    </span>
  )
}

export default function AuthoritySchoolDetailPage() {
  const { schoolId } = useParams()

  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    if (!schoolId) return undefined
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    AuthoritySchoolService.getSchoolDetail(schoolId, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          setSchool(result)
        }
      })
      .catch(err => {
        if (controller.signal.aborted || err?.name === "CanceledError") return
        setSchool(null)
        setError({
          status: err?.response?.status,
          message:
            err?.response?.data?.message ||
            err?.message ||
            "Không thể tải thông tin chi tiết trường học.",
        })
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [schoolId, reloadTick])

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <Link
              to={ROUTER.AUTHORITY_SCHOOLS}
              className={styles.backLink}
              aria-label="Quay lại danh sách trường học"
            >
              <KeyboardArrowLeft />
            </Link>
            <Skeleton variant="text" width={280} height={32} />
          </div>
        </div>
        <div className={styles.surface}>
          <div className={styles.cardBody}>
            <Skeleton variant="text" width={180} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={140} />
          </div>
        </div>
        <div className={styles.surface}>
          <div className={styles.cardBody}>
            <Skeleton variant="text" width={220} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={160} />
          </div>
        </div>
      </main>
    )
  }

  if (error || !school) {
    const isNotFound = error?.status === 404 || !error
    const isForbidden = error?.status === 403
    return (
      <main className={styles.page}>
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <Link
              to={ROUTER.AUTHORITY_SCHOOLS}
              className={styles.backLink}
              aria-label="Quay lại danh sách trường học"
            >
              <KeyboardArrowLeft />
            </Link>
            <h1 className={styles.title}>Chi tiết trường học</h1>
          </div>
        </div>

        <section className={styles.surface}>
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {isNotFound
                ? "Trường học không thuộc địa bàn quản lý của đơn vị ATTP này."
                : isForbidden
                  ? "Bạn không có quyền xem thông tin trường học này"
                  : "Không thể tải thông tin trường học"}
            </p>
            <p className={styles.stateDesc}>
              {isNotFound
                ? "Kiểm tra lại danh sách trường học thuộc phường/xã đơn vị bạn đang phụ trách."
                : error?.message}
            </p>
            {!isNotFound && !isForbidden ? (
              <Button
                type="button"
                variant="outlined"
                startIcon={<ReplayOutlined />}
                onClick={() => setReloadTick(t => t + 1)}
              >
                Thử lại
              </Button>
            ) : (
              <Button
                component={Link}
                to={ROUTER.AUTHORITY_SCHOOLS}
                variant="outlined"
              >
                Quay lại danh sách trường học
              </Button>
            )}
          </div>
        </section>
      </main>
    )
  }

  const schoolStatusMeta = getSchoolStatusMeta(school.status)
  const suppliers = school.suppliers || []

  return (
    <main className={styles.page}>
      <header className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <Link
            to={ROUTER.AUTHORITY_SCHOOLS}
            className={styles.backLink}
            aria-label="Quay lại danh sách trường học"
          >
            <KeyboardArrowLeft />
          </Link>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>{school.name || "Chi tiết trường học"}</h1>
            <ToneBadge meta={schoolStatusMeta} />
          </div>
        </div>
      </header>

      <section
        className={styles.surface}
        aria-labelledby="authority-school-info-title"
      >
        <div className={styles.sectionHeader}>
          <h2 id="authority-school-info-title" className={styles.sectionTitle}>
            Thông tin trường học
          </h2>
        </div>

        <div className={styles.cardBody}>
          <dl className={styles.infoGrid}>
            <div className={styles.infoField}>
              <dt>Mã trường</dt>
              <dd>{school.code || "—"}</dd>
            </div>
            <div className={styles.infoField}>
              <dt>Phường / Xã</dt>
              <dd>{school.location?.name || "—"}</dd>
            </div>
            <div className={styles.infoField}>
              <dt>Số điện thoại</dt>
              <dd>{school.phone || "—"}</dd>
            </div>
            <div className={styles.infoField}>
              <dt>Email liên hệ</dt>
              <dd>{school.email || "—"}</dd>
            </div>
            <div className={`${styles.infoField} ${styles.fullSpan}`}>
              <dt>Địa chỉ</dt>
              <dd>{school.address || "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className={styles.surface}
        aria-labelledby="authority-school-suppliers-title"
      >
        <div className={styles.sectionHeader}>
          <h2
            id="authority-school-suppliers-title"
            className={styles.sectionTitle}
          >
            Nhà cung cấp liên kết
          </h2>
          <span className={styles.countPill}>{suppliers.length} đơn vị</span>
        </div>

        {suppliers.length === 0 ? (
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>Chưa có nhà cung cấp liên kết</p>
            <p className={styles.stateDesc}>
              Trường học hiện chưa có nhà cung cấp nào ở trạng thái đang liên kết
              hoặc tạm dừng liên kết.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Nhà cung cấp</th>
                    <th>Phường / Xã</th>
                    <th>Liên hệ & địa chỉ</th>
                    <th>Trạng thái tiếp nhận</th>
                    <th>Liên kết</th>
                    <th>Ngày liên kết</th>
                    <th>Ngày tạm dừng</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => {
                    const intakeMeta = getIntakeStateMeta(supplier.intakeState)
                    const relMeta = getRelationshipStatusMeta(
                      supplier.relationshipStatus,
                    )
                    return (
                      <tr key={supplier.id}>
                        <td>
                          <div className={styles.supplierCell}>
                            <span className={styles.supplierName}>
                              {supplier.name || "—"}
                            </span>
                            <span className={styles.secondaryMeta}>
                              MST: {supplier.taxCode || "—"}
                            </span>
                          </div>
                        </td>
                        <td>{supplier.location?.name || "—"}</td>
                        <td>
                          <div className={styles.contactStack}>
                            <span>{supplier.phone || "—"}</span>
                            {supplier.email ? <span>{supplier.email}</span> : null}
                            {supplier.address ? (
                              <span>{supplier.address}</span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <ToneBadge meta={intakeMeta} />
                        </td>
                        <td>
                          <ToneBadge meta={relMeta} />
                        </td>
                        <td className={styles.dateCell}>
                          {formatDateVi(supplier.linkedAt)}
                        </td>
                        <td className={styles.dateCell}>
                          {formatDateVi(supplier.suspendedAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {suppliers.map(supplier => {
                const intakeMeta = getIntakeStateMeta(supplier.intakeState)
                const relMeta = getRelationshipStatusMeta(
                  supplier.relationshipStatus,
                )
                return (
                  <article key={supplier.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardHeader}>
                      <span className={styles.supplierName}>
                        {supplier.name || "—"}
                      </span>
                      <span className={styles.secondaryMeta}>
                        MST: {supplier.taxCode || "—"}
                      </span>
                      <div className={styles.badgeRow}>
                        <ToneBadge meta={intakeMeta} />
                        <ToneBadge meta={relMeta} />
                      </div>
                    </div>

                    <div className={styles.mobileMetaGrid}>
                      <div className={styles.mobileMetaItem}>
                        <span>Phường / Xã</span>
                        <strong>{supplier.location?.name || "—"}</strong>
                      </div>
                      <div className={styles.mobileMetaItem}>
                        <span>Điện thoại</span>
                        <strong>{supplier.phone || "—"}</strong>
                      </div>
                      <div className={styles.mobileMetaItem}>
                        <span>Email</span>
                        <strong>{supplier.email || "—"}</strong>
                      </div>
                      <div className={styles.mobileMetaItem}>
                        <span>Ngày liên kết</span>
                        <strong>{formatDateVi(supplier.linkedAt)}</strong>
                      </div>
                      {supplier.suspendedAt ? (
                        <div className={styles.mobileMetaItem}>
                          <span>Ngày tạm dừng</span>
                          <strong>{formatDateVi(supplier.suspendedAt)}</strong>
                        </div>
                      ) : null}
                      <div className={styles.mobileMetaItem}>
                        <span>Địa chỉ</span>
                        <strong>{supplier.address || "—"}</strong>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
