import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { Button, Skeleton } from "@mui/material"
import { KeyboardArrowLeft, ReplayOutlined } from "@mui/icons-material"
import AuthorityOfficerService, {
  extractAuthorityOfficerError,
  formatDateTimeVi,
  getOfficerStatusMeta,
  getUnitStatusMeta,
} from "src/services/AuthorityOfficerService"
import ROUTER from "src/router/ROUTER"
import styles from "../AuthorityOfficers.module.scss"

const TONE_CLASS = {
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  muted: styles.toneMuted,
}

function StatusBadge({ meta }) {
  return (
    <span className={`${styles.badge} ${TONE_CLASS[meta.tone] || styles.toneMuted}`}>
      {meta.label}
    </span>
  )
}

export default function OfficerDetailView({ userId }) {
  const [officer, setOfficer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    AuthorityOfficerService.detail(userId, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          setOfficer(result)
        }
      })
      .catch(err => {
        if (controller.signal.aborted || err?.name === "CanceledError") return
        setOfficer(null)
        setError(
          extractAuthorityOfficerError(
            err,
            "Không thể tải thông tin tài khoản cán bộ ATTP.",
          ),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [userId, reloadTick])

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.detailHeader}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SYSTEM_AUTHORITY_OFFICERS}
              className={styles.backLink}
              aria-label="Quay lại danh sách cán bộ ATTP"
            >
              <KeyboardArrowLeft />
            </Link>
            <Skeleton variant="text" width={260} height={32} />
          </div>
        </div>
        <div className={styles.detailGrid}>
          <div className={styles.detailCard}>
            <Skeleton variant="text" width={180} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={180} />
          </div>
          <div className={styles.detailCard}>
            <Skeleton variant="text" width={180} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={180} />
          </div>
        </div>
      </main>
    )
  }

  if (error || !officer) {
    const isNotFound = error?.status === 404 || !error
    const isForbidden = error?.status === 403
    return (
      <main className={styles.page}>
        <div className={styles.detailHeader}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SYSTEM_AUTHORITY_OFFICERS}
              className={styles.backLink}
              aria-label="Quay lại danh sách cán bộ ATTP"
            >
              <KeyboardArrowLeft />
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết cán bộ ATTP</h1>
          </div>
        </div>

        <section className={styles.surface}>
          <div className={styles.stateBox} role="alert">
            <p className={styles.stateTitle}>
              {isForbidden
                ? "Bạn không có quyền xem tài khoản này"
                : isNotFound
                  ? "Không tìm thấy tài khoản cán bộ ATTP"
                  : "Không thể tải chi tiết tài khoản"}
            </p>
            <p className={styles.stateDesc}>
              {error?.message ||
                "Tài khoản cán bộ ATTP không tồn tại hoặc đã bị xóa khỏi hệ thống."}
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
                to={ROUTER.SYSTEM_AUTHORITY_OFFICERS}
                variant="outlined"
              >
                Quay lại danh sách
              </Button>
            )}
          </div>
        </section>
      </main>
    )
  }

  const statusMeta = getOfficerStatusMeta(officer.status)
  const unitStatusMeta = officer.unit
    ? getUnitStatusMeta(officer.unit.status)
    : null

  return (
    <main className={styles.page}>
      <header className={styles.detailHeader}>
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SYSTEM_AUTHORITY_OFFICERS}
            className={styles.backLink}
            aria-label="Quay lại danh sách cán bộ ATTP"
          >
            <KeyboardArrowLeft />
          </Link>
          <div className={styles.detailTitleGroup}>
            <h1 className={styles.pageTitle}>
              {officer.fullName || officer.username}
            </h1>
            <StatusBadge meta={statusMeta} />
          </div>
        </div>
      </header>

      <div className={styles.detailGrid}>
        <section
          className={styles.detailCard}
          aria-labelledby="officer-account-heading"
        >
          <h2 id="officer-account-heading" className={styles.sectionTitle}>
            Thông tin tài khoản
          </h2>
          <dl className={styles.metaList}>
            <div className={styles.metaRow}>
              <dt>Họ và tên</dt>
              <dd>{officer.fullName || "—"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Tên đăng nhập</dt>
              <dd>@{officer.username}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Email</dt>
              <dd>
                {officer.email ? (
                  officer.email
                ) : (
                  <span className={`${styles.badge} ${styles.toneWarning}`}>
                    Chưa thiết lập
                  </span>
                )}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Yêu cầu thiết lập email</dt>
              <dd>
                {officer.emailSetupRequired ? (
                  <span className={`${styles.badge} ${styles.toneWarning}`}>
                    Cần thiết lập khi đăng nhập lần đầu
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles.toneSuccess}`}>
                    Đã hoàn tất
                  </span>
                )}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Thời điểm xác minh email</dt>
              <dd>{formatDateTimeVi(officer.emailVerifiedAt)}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Số điện thoại</dt>
              <dd>{officer.phone || "Chưa cập nhật"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Trạng thái tài khoản</dt>
              <dd>
                <StatusBadge meta={statusMeta} />
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Ngày tạo</dt>
              <dd>{formatDateTimeVi(officer.createdAt)}</dd>
            </div>
          </dl>
        </section>

        <section
          className={styles.detailCard}
          aria-labelledby="officer-unit-heading"
        >
          <h2 id="officer-unit-heading" className={styles.sectionTitle}>
            Đơn vị ATTP & địa bàn phụ trách
          </h2>
          <dl className={styles.metaList}>
            <div className={styles.metaRow}>
              <dt>Tên đơn vị ATTP</dt>
              <dd>{officer.unit?.name || "—"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Mã đơn vị</dt>
              <dd>{officer.unit?.code || "—"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Trạng thái đơn vị</dt>
              <dd>
                {unitStatusMeta ? <StatusBadge meta={unitStatusMeta} /> : "—"}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Phường / Xã phụ trách</dt>
              <dd>{officer.location?.name || "—"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Mã địa giới</dt>
              <dd>{officer.location?.code || "—"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <p className={styles.readonlyNote}>
        Thông tin tài khoản cán bộ ATTP hiển thị ở chế độ chỉ đọc. Sau khi được
        cấp tài khoản, cán bộ đăng nhập lần đầu bằng tên đăng nhập và tự xác minh
        email công việc qua mã OTP.
      </p>
    </main>
  )
}

OfficerDetailView.propTypes = {
  userId: PropTypes.string.isRequired,
}
