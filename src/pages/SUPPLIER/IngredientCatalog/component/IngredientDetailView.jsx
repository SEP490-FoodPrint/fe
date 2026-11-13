import { useState } from "react"
import { Link } from "react-router-dom"
import {
  EditOutlined,
  ImageOutlined,
  KeyboardArrowLeft,
} from "@mui/icons-material"
import ROUTER from "src/router/ROUTER"
import styles from "../IngredientCatalog.module.scss"

const IngredientDetailView = ({
  ingredient,
  loading = false,
  error = null,
  onRetry,
  onEdit,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false)
  const [failedGalleryIndices, setFailedGalleryIndices] = useState({})

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_INGREDIENTS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách nguyên liệu"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
              <span className={styles.backChevronText}>‹</span>
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết nguyên liệu</h1>
          </div>
        </div>
        <div className={styles.catalogSurface}>
          <div className={styles.emptyState} role="status" aria-live="polite">
            <p className={styles.emptyTitle}>Đang tải chi tiết nguyên liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ingredient) {
    const statusCode = error?.response?.status
    const errorTitle =
      statusCode === 403
        ? "Bạn không có quyền truy cập nguyên liệu này"
        : statusCode === 404 || !error
          ? "Không tìm thấy nguyên liệu"
          : "Không thể tải chi tiết nguyên liệu"
    const errorDesc =
      error?.response?.data?.message ||
      error?.message ||
      "Nguyên liệu bạn đang tìm kiếm không tồn tại hoặc không thuộc phạm vi quản lý của nhà cung cấp."

    return (
      <div className={styles.page}>
        <div className={styles.detailHeaderBar}>
          <div className={styles.detailNavLeft}>
            <Link
              to={ROUTER.SUPPLIER_INGREDIENTS}
              className={styles.backBtn}
              aria-label="Quay lại danh sách nguyên liệu"
            >
              <KeyboardArrowLeft className={styles.backIcon} />
              <span className={styles.backChevronText}>‹</span>
            </Link>
            <h1 className={styles.pageTitle}>Chi tiết nguyên liệu</h1>
          </div>
        </div>
        <div className={styles.catalogSurface}>
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{errorTitle}</p>
            <p className={styles.emptyDesc}>{errorDesc}</p>
            {error && statusCode !== 403 && statusCode !== 404 && onRetry ? (
              <button
                type="button"
                className={styles.resetFilterBtn}
                onClick={onRetry}
              >
                Thử lại
              </button>
            ) : (
              <Link
                to={ROUTER.SUPPLIER_INGREDIENTS}
                className={styles.resetFilterBtn}
              >
                Quay lại danh sách nguyên liệu
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const isActive = ingredient.status !== "INACTIVE"
  const statusText = isActive ? "Đang hoạt động" : "Đã ẩn"
  const statusBadgeClass = `${styles.statusBadge} ${
    isActive ? styles.statusActive : styles.statusInactive
  }`
  const coverImage = ingredient.coverImage || null
  const galleryImages = Array.isArray(ingredient.imageDescription)
    ? ingredient.imageDescription.slice(0, 5)
    : []
  const categoryLabel =
    ingredient.category?.categoryName ||
    ingredient.categoryName ||
    "Chưa phân loại"

  return (
    <div className={styles.page}>
      <div className={styles.detailHeaderBar}>
        <div className={styles.detailNavLeft}>
          <Link
            to={ROUTER.SUPPLIER_INGREDIENTS}
            className={styles.backBtn}
            aria-label="Quay lại danh sách nguyên liệu"
          >
            <KeyboardArrowLeft className={styles.backIcon} />
            <span className={styles.backChevronText}>‹</span>
          </Link>
          <h1 className={styles.pageTitle}>Chi tiết nguyên liệu</h1>
        </div>

        <button type="button" className={styles.editBtn} onClick={onEdit}>
          <EditOutlined className={styles.btnIcon} />
          <span>Sửa Nguyên Liệu</span>
        </button>
      </div>

      <div className={styles.detailCard}>
        {/* Desktop card header */}
        <div className={styles.detailCardHeader}>
          <h2 className={styles.detailSectionTitle}>Thông tin nguyên liệu</h2>
          <div className={styles.detailStatusMeta}>
            <span className={styles.detailStatusLabel}>Trạng thái</span>
            <span className={statusBadgeClass}>{statusText}</span>
          </div>
        </div>

        {/* Main body */}
        <div className={styles.detailBody}>
          <h2 className={styles.detailMobileHeading}>Thông tin nguyên liệu</h2>

          <div className={styles.detailHeroImageWrap}>
            {coverImage && !heroImgFailed ? (
              <img
                src={coverImage}
                alt={ingredient.name}
                className={styles.detailHeroImage}
                onError={() => setHeroImgFailed(true)}
              />
            ) : (
              <div
                className={styles.imagePlaceholderBox}
                aria-label="Chưa có ảnh đại diện"
              >
                <ImageOutlined className={styles.placeholderIconLarge} />
              </div>
            )}
          </div>

          <div className={styles.detailMobileStatusRow}>
            <span className={statusBadgeClass}>{statusText}</span>
          </div>

          <div className={styles.detailFieldsCol}>
            <div className={styles.detailFieldBlock}>
              <p className={styles.detailFieldLabel}>Tên nguyên liệu</p>
              <p className={styles.detailFieldValueLarge}>{ingredient.name}</p>
            </div>

            <div className={styles.detailFieldPair}>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Nhóm nguyên liệu</p>
                <p className={styles.detailFieldValue}>{categoryLabel}</p>
              </div>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Đơn vị mặc định</p>
                <p className={styles.detailFieldValue}>
                  {ingredient.defaultUnit || "—"}
                </p>
              </div>
            </div>

            <div className={styles.detailFieldBlock}>
              <p className={styles.detailFieldLabel}>Mô tả chi tiết</p>
              <p className={styles.detailFieldValue}>
                {ingredient.description || "Chưa có mô tả chi tiết."}
              </p>
            </div>

            <div className={styles.detailFieldPair}>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Ngày tạo</p>
                <p className={styles.detailFieldValue}>{ingredient.createdAt}</p>
              </div>
              <div className={styles.detailFieldBlock}>
                <p className={styles.detailFieldLabel}>Cập nhật lần cuối</p>
                <p className={styles.detailFieldValue}>{ingredient.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description images gallery */}
        <div className={styles.detailGallerySection}>
          <div className={styles.detailGalleryHeader}>
            <h3 className={styles.detailGalleryTitle}>Ảnh mô tả</h3>
            <span className={styles.detailGalleryCount}>
              {`${galleryImages.length}/5 ảnh`}
            </span>
            <h3 className={styles.detailGalleryTitleCompact}>
              {`Ảnh mô tả · ${galleryImages.length}/5 ảnh`}
            </h3>
          </div>

          {galleryImages.length > 0 ? (
            <div className={styles.detailGalleryGrid}>
              {galleryImages.map((imgSrc, index) => (
                <div
                  key={`${imgSrc}-${index}`}
                  className={styles.detailGalleryItem}
                >
                  <div className={styles.detailGalleryThumbWrap}>
                    {!failedGalleryIndices[index] ? (
                      <img
                        src={imgSrc}
                        alt={`${ingredient.name} - Ảnh ${index + 1}`}
                        className={styles.detailGalleryThumb}
                        onError={() =>
                          setFailedGalleryIndices(prev => ({
                            ...prev,
                            [index]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className={styles.imagePlaceholderBox}>
                        <ImageOutlined className={styles.placeholderIconMedium} />
                      </div>
                    )}
                  </div>
                  <p className={styles.detailGalleryCaption}>{`Ảnh ${index + 1}`}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.detailGalleryEmpty}>Chưa có ảnh mô tả.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default IngredientDetailView
