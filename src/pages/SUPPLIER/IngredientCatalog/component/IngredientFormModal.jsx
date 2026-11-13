import { useEffect, useId, useRef, useState } from "react"
import {
  Add,
  Close,
  EditOutlined,
  ImageOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material"
import { DEFAULT_UNITS } from "src/services/SupplierIngredientService"
import styles from "../IngredientCatalog.module.scss"
import ConfirmHideDialog from "./ConfirmHideDialog"

const MAX_DESC_IMAGES = 5

function toValidImagePath(file) {
  const rawName = String(file?.name || "ingredient.jpg")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
  const safeName = rawName || `ingredient-${Date.now()}.jpg`
  return `/uploads/ingredients/${safeName}`
}

export function isValidBackendImageRef(value) {
  if (typeof value !== "string") return false
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 2048) return false
  for (let i = 0; i < trimmed.length; i += 1) {
    const code = trimmed.charCodeAt(i)
    if (code < 32 || code === 127 || trimmed[i] === "\\") return false
  }
  if (trimmed.startsWith("/")) {
    return !trimmed.startsWith("//")
  }
  try {
    const parsed = new URL(trimmed)
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password
    )
  } catch {
    return false
  }
}

const IngredientFormModal = ({
  open,
  mode = "create",
  initialData = null,
  existingItems = [],
  categories = [],
  units = DEFAULT_UNITS,
  onClose,
  onSubmit,
  onConfirmHideStatus,
}) => {
  const isEdit = mode === "edit" && Boolean(initialData)
  const formId = useId()
  const nameInputRef = useRef(null)
  const avatarInputRef = useRef(null)
  const descImageInputRef = useRef(null)
  const objectUrlsRef = useRef([])

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [defaultUnit, setDefaultUnit] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [coverImage, setCoverImage] = useState("")
  const [imageDescription, setImageDescription] = useState([])
  const [previewMap, setPreviewMap] = useState({})
  const [failedPreviews, setFailedPreviews] = useState({})
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [confirmHideOpen, setConfirmHideOpen] = useState(false)
  const [hidingStatus, setHidingStatus] = useState(false)
  const [hideError, setHideError] = useState("")

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!open) return

    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    objectUrlsRef.current = []
    setPreviewMap({})
    setFailedPreviews({})

    if (isEdit && initialData) {
      setName(initialData.name || "")
      setCategoryId(initialData.categoryId || initialData.category?.id || "")
      setDefaultUnit(initialData.defaultUnit || "")
      setDescription(initialData.description || "")
      setStatus(initialData.status === "INACTIVE" ? "INACTIVE" : "ACTIVE")
      setCoverImage(initialData.coverImage || "")
      setImageDescription(
        Array.isArray(initialData.imageDescription)
          ? initialData.imageDescription.slice(0, MAX_DESC_IMAGES)
          : [],
      )
    } else {
      setName("")
      setCategoryId("")
      setDefaultUnit("")
      setDescription("")
      setStatus("ACTIVE")
      setCoverImage("")
      setImageDescription([])
    }
    setErrors({})
    setSubmitError("")
    setSubmitting(false)
    setConfirmHideOpen(false)
    setHidingStatus(false)
    setHideError("")
  }, [open, isEdit, initialData])

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus()
    }, 30)

    const handleKeyDown = event => {
      if (event.key === "Escape" && !confirmHideOpen && !submitting) {
        onClose?.()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, confirmHideOpen, submitting, onClose])

  if (!open) return null

  const resolvePreviewUrl = refPath => {
    if (!refPath) return ""
    return previewMap[refPath] || refPath
  }

  const handleAvatarChange = event => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const refPath = toValidImagePath(file)
    const blobUrl = URL.createObjectURL(file)
    objectUrlsRef.current.push(blobUrl)

    setPreviewMap(prev => ({ ...prev, [refPath]: blobUrl }))
    setFailedPreviews(prev => ({ ...prev, [refPath]: false }))
    setCoverImage(refPath)
    setErrors(prev => ({ ...prev, coverImage: "" }))
  }

  const handleClearAvatar = event => {
    event.stopPropagation()
    setCoverImage("")
    setErrors(prev => ({ ...prev, coverImage: "" }))
  }

  const handleAddDescImages = event => {
    const fileList = Array.from(event.target.files || [])
    event.target.value = ""
    if (!fileList.length) return

    const remainingSlots = MAX_DESC_IMAGES - imageDescription.length
    if (remainingSlots <= 0) return

    const selectedFiles = fileList.slice(0, remainingSlots)
    const nextRefs = []
    const nextPreviewEntries = {}

    selectedFiles.forEach(file => {
      const refPath = toValidImagePath(file)
      const blobUrl = URL.createObjectURL(file)
      objectUrlsRef.current.push(blobUrl)
      nextRefs.push(refPath)
      nextPreviewEntries[refPath] = blobUrl
    })

    setPreviewMap(prev => ({ ...prev, ...nextPreviewEntries }))
    setImageDescription(prev => [...prev, ...nextRefs].slice(0, MAX_DESC_IMAGES))
    setErrors(prev => ({ ...prev, imageDescription: "" }))
  }

  const handleRemoveDescImage = indexToRemove => {
    setImageDescription(prev => prev.filter((_, idx) => idx !== indexToRemove))
    setErrors(prev => ({ ...prev, imageDescription: "" }))
  }

  const handleToggleStatusClick = () => {
    if (status === "ACTIVE") {
      setHideError("")
      setConfirmHideOpen(true)
    }
  }

  const handleConfirmHide = async () => {
    if (!isEdit || !initialData?.id || hidingStatus) return
    setHidingStatus(true)
    setHideError("")
    try {
      await onConfirmHideStatus?.(initialData.id)
      setStatus("INACTIVE")
      setConfirmHideOpen(false)
    } catch (error) {
      setHideError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể ẩn nguyên liệu. Vui lòng thử lại.",
      )
    } finally {
      setHidingStatus(false)
    }
  }

  const validateForm = () => {
    const nextErrors = {}
    const trimmedName = name.trim()
    const trimmedUnit = defaultUnit.trim()
    const trimmedCover = coverImage.trim()

    if (!trimmedName) {
      nextErrors.name = "Vui lòng nhập tên nguyên liệu."
    } else if (trimmedName.length > 255) {
      nextErrors.name = "Tên nguyên liệu không vượt quá 255 ký tự."
    } else {
      const isDuplicate = existingItems.some(item => {
        if (isEdit && String(item.id) === String(initialData?.id)) return false
        return item.name?.trim() === trimmedName
      })
      if (isDuplicate) {
        nextErrors.name = "Tên nguyên liệu đã tồn tại trong nhà cung cấp."
      }
    }

    if (!trimmedUnit) {
      nextErrors.defaultUnit = "Vui lòng nhập hoặc chọn đơn vị tính mặc định."
    } else if (trimmedUnit.length > 30) {
      nextErrors.defaultUnit = "Đơn vị tính không vượt quá 30 ký tự."
    }

    if (trimmedCover && !isValidBackendImageRef(trimmedCover)) {
      nextErrors.coverImage =
        "Ảnh phải là URL HTTP/HTTPS hoặc đường dẫn bắt đầu bằng /."
    }

    const invalidDescImg = imageDescription.find(
      item => !isValidBackendImageRef(item),
    )
    if (invalidDescImg) {
      nextErrors.imageDescription =
        "Ảnh mô tả phải là URL HTTP/HTTPS hoặc đường dẫn bắt đầu bằng /."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleFormSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    setSubmitError("")
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const trimmedDesc = description.trim()
      const trimmedCover = coverImage.trim()

      await onSubmit?.({
        name: name.trim(),
        defaultUnit: defaultUnit.trim(),
        description: trimmedDesc ? trimmedDesc : null,
        categoryId: categoryId ? categoryId : null,
        coverImage: trimmedCover ? trimmedCover : null,
        imageDescription: imageDescription
          .map(item => String(item || "").trim())
          .filter(Boolean)
          .slice(0, MAX_DESC_IMAGES),
      })
    } catch (error) {
      const apiData = error?.response?.data
      const fieldIssues = apiData?.error?.fields
      if (Array.isArray(fieldIssues) && fieldIssues.length > 0) {
        const mapped = {}
        fieldIssues.forEach(issue => {
          const path = String(issue.field || "")
          if (path.startsWith("imageDescription")) {
            mapped.imageDescription = issue.message
          } else if (path) {
            mapped[path] = issue.message
          }
        })
        setErrors(prev => ({ ...prev, ...mapped }))
      }
      if (error?.response?.status === 409) {
        setErrors(prev => ({
          ...prev,
          name:
            apiData?.message || "Tên nguyên liệu đã tồn tại trong nhà cung cấp.",
        }))
      } else {
        setSubmitError(
          apiData?.message ||
            error?.message ||
            "Không thể lưu nguyên liệu. Vui lòng kiểm tra lại dữ liệu.",
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const unitListId = `${formId}-unit-options`
  const coverPreviewUrl = resolvePreviewUrl(coverImage)

  return (
    <>
      <div
        className={styles.modalBackdrop}
        role="presentation"
        onMouseDown={event => {
          if (
            event.target === event.currentTarget &&
            !submitting &&
            !confirmHideOpen
          ) {
            onClose?.()
          }
        }}
      >
        <div
          className={styles.formModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${formId}-modal-title`}
        >
          <div className={styles.modalHeader}>
            <h2 id={`${formId}-modal-title`} className={styles.modalTitle}>
              {isEdit ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu mới"}
            </h2>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={onClose}
              aria-label="Đóng hộp thoại"
              disabled={submitting}
            >
              <Close className={styles.modalCloseIcon} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} noValidate>
            <div className={styles.modalBody}>
              {submitError && (
                <p className={styles.fieldError} role="alert">
                  {submitError}
                </p>
              )}

              {/* 1. Ảnh đại diện & Trạng thái hoạt động */}
              <div className={styles.avatarAndStatusRow}>
                <div className={styles.fieldGroupAuto}>
                  <p className={styles.fieldLabel}>
                    <span>{"Ảnh đại diện "}</span>
                    <span className={styles.requiredMark}>*</span>
                  </p>
                  <div
                    className={`${styles.avatarPickerArea} ${
                      isEdit ? styles.avatarPickerAreaCompact : ""
                    }`}
                  >
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className={styles.hiddenFileInput}
                      onChange={handleAvatarChange}
                    />
                    <div className={styles.avatarBoxWrap}>
                      <button
                        type="button"
                        className={styles.avatarUploadBtn}
                        onClick={() => avatarInputRef.current?.click()}
                        aria-label={
                          coverImage
                            ? "Thay đổi ảnh đại diện"
                            : "Chọn ảnh đại diện nguyên liệu"
                        }
                      >
                        {coverImage && !failedPreviews[coverImage] ? (
                          <>
                            <img
                              src={coverPreviewUrl}
                              alt={name || "Ảnh đại diện nguyên liệu"}
                              className={styles.avatarPreviewImg}
                              onError={() =>
                                setFailedPreviews(prev => ({
                                  ...prev,
                                  [coverImage]: true,
                                }))
                              }
                            />
                            <span className={styles.avatarEditBadge}>
                              <EditOutlined className={styles.avatarEditIcon} />
                            </span>
                          </>
                        ) : (
                          <ImageOutlined className={styles.placeholderIconSmall} />
                        )}
                      </button>

                      {coverImage && (
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={handleClearAvatar}
                          aria-label="Gỡ ảnh đại diện"
                        >
                          <Close className={styles.removeImageIcon} />
                        </button>
                      )}
                    </div>
                  </div>
                  {errors.coverImage && (
                    <p className={styles.fieldError} role="alert">
                      {errors.coverImage}
                    </p>
                  )}
                </div>

                {isEdit && (
                  <div className={styles.statusSwitchGroup}>
                    <span id={`${formId}-status-label`} className={styles.fieldLabel}>
                      Trạng thái hoạt động
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={status === "ACTIVE"}
                      aria-labelledby={`${formId}-status-label`}
                      disabled={status !== "ACTIVE"}
                      title={
                        status === "ACTIVE"
                          ? "Gạt để chuyển sang trạng thái Đã ẩn"
                          : "Nguyên liệu đã ẩn không thể bật lại"
                      }
                      className={`${styles.switchBtn} ${
                        status === "ACTIVE" ? styles.switchOn : ""
                      }`}
                      onClick={handleToggleStatusClick}
                    >
                      <span className={styles.switchThumb} />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Ảnh mô tả (tối đa 5) */}
              <div className={styles.fieldGroup}>
                <div className={styles.fieldHeaderRow}>
                  <p className={styles.fieldLabel}>
                    <span>{"Ảnh mô tả "}</span>
                    <span className={styles.requiredMark}>*</span>
                  </p>
                  <p className={styles.charLimitHint}>
                    {`${imageDescription.length}/${MAX_DESC_IMAGES} ảnh`}
                  </p>
                </div>

                <input
                  ref={descImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.hiddenFileInput}
                  onChange={handleAddDescImages}
                />

                <div className={styles.descImageStrip}>
                  {imageDescription.map((imgRef, index) => {
                    const previewUrl = resolvePreviewUrl(imgRef)
                    const isFailed = failedPreviews[imgRef]

                    return (
                      <div
                        key={`${imgRef}-${index}`}
                        className={styles.descImageTile}
                      >
                        {!isFailed ? (
                          <img
                            src={previewUrl}
                            alt={`Ảnh mô tả ${index + 1}`}
                            className={styles.descImagePreview}
                            onError={() =>
                              setFailedPreviews(prev => ({
                                ...prev,
                                [imgRef]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className={styles.imagePlaceholderBox}>
                            <ImageOutlined className={styles.placeholderIconSmall} />
                          </div>
                        )}
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={() => handleRemoveDescImage(index)}
                          aria-label={`Gỡ ảnh mô tả ${index + 1}`}
                        >
                          <Close className={styles.removeImageIcon} />
                        </button>
                      </div>
                    )
                  })}

                  {imageDescription.length < MAX_DESC_IMAGES && (
                    <button
                      type="button"
                      className={styles.addImageTileBtn}
                      onClick={() => descImageInputRef.current?.click()}
                    >
                      <Add className={styles.addImageIcon} />
                      <span>Thêm ảnh</span>
                    </button>
                  )}
                </div>

                {errors.imageDescription ? (
                  <p className={styles.fieldError} role="alert">
                    {errors.imageDescription}
                  </p>
                ) : (
                  <p className={styles.fieldHelper}>
                    {isEdit
                      ? "Tải lên ít nhất 1 ảnh và tối đa 5 ảnh mô tả cho mỗi nguyên liệu."
                      : "Tối đa 5 ảnh mô tả cho mỗi nguyên liệu."}
                  </p>
                )}
              </div>

              {/* 3. Tên nguyên liệu */}
              <div className={styles.fieldGroup}>
                <div className={styles.fieldHeaderRow}>
                  <label htmlFor={`${formId}-name`} className={styles.fieldLabel}>
                    <span>{"Tên nguyên liệu "}</span>
                    <span className={styles.requiredMark}>*</span>
                  </label>
                  <span className={styles.charLimitHint}>Tối đa 255 ký tự</span>
                </div>
                <input
                  ref={nameInputRef}
                  id={`${formId}-name`}
                  type="text"
                  maxLength={255}
                  value={name}
                  onChange={event => {
                    setName(event.target.value)
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }))
                  }}
                  placeholder="Nhập tên nguyên liệu (duy nhất)..."
                  className={`${styles.textInput} ${
                    errors.name ? styles.inputError : ""
                  }`}
                />
                {errors.name ? (
                  <p className={styles.fieldError} role="alert">
                    {errors.name}
                  </p>
                ) : (
                  <p className={styles.fieldHelper}>
                    Tên nguyên liệu không được trùng lặp trong danh mục hiện tại
                  </p>
                )}
              </div>

              {/* 4. Nhóm nguyên liệu & Đơn vị tính mặc định */}
              <div className={styles.twoColFields}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldHeaderRow}>
                    <label
                      htmlFor={`${formId}-category`}
                      className={styles.fieldLabel}
                    >
                      <span>{"Nhóm nguyên liệu "}</span>
                      <span className={styles.requiredMark}>*</span>
                    </label>
                    <span className={styles.charLimitHint}>Tối đa 120 ký tự</span>
                  </div>
                  <div className={styles.selectWrap}>
                    <select
                      id={`${formId}-category`}
                      value={categoryId}
                      onChange={event => {
                        setCategoryId(event.target.value)
                        if (errors.categoryId) {
                          setErrors(prev => ({ ...prev, categoryId: "" }))
                        }
                      }}
                      className={`${styles.selectControl} ${
                        !categoryId ? styles.isPlaceholder : ""
                      } ${errors.categoryId ? styles.inputError : ""}`}
                    >
                      <option value="">Nhập hoặc chọn nhóm</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                    <KeyboardArrowDown className={styles.selectChevron} />
                  </div>
                  {errors.categoryId && (
                    <p className={styles.fieldError} role="alert">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.fieldHeaderRow}>
                    <label htmlFor={`${formId}-unit`} className={styles.fieldLabel}>
                      <span>{"Đơn vị tính mặc định "}</span>
                      <span className={styles.requiredMark}>*</span>
                    </label>
                    <span className={styles.charLimitHint}>Tối đa 30 ký tự</span>
                  </div>
                  <div className={styles.comboInputWrap}>
                    <input
                      id={`${formId}-unit`}
                      type="text"
                      list={unitListId}
                      maxLength={30}
                      value={defaultUnit}
                      onChange={event => {
                        setDefaultUnit(event.target.value)
                        if (errors.defaultUnit) {
                          setErrors(prev => ({ ...prev, defaultUnit: "" }))
                        }
                      }}
                      placeholder="Nhập hoặc chọn đơn vị"
                      className={`${styles.textInput} ${styles.comboInput} ${
                        errors.defaultUnit ? styles.inputError : ""
                      }`}
                    />
                    <KeyboardArrowDown className={styles.selectChevron} />
                    <datalist id={unitListId}>
                      {units.map(unit => (
                        <option key={unit} value={unit} />
                      ))}
                    </datalist>
                  </div>
                  {errors.defaultUnit && (
                    <p className={styles.fieldError} role="alert">
                      {errors.defaultUnit}
                    </p>
                  )}
                </div>
              </div>

              {/* 5. Mô tả chi tiết */}
              <div className={styles.fieldGroup}>
                <label
                  htmlFor={`${formId}-description`}
                  className={styles.fieldLabel}
                >
                  <span>{"Mô tả chi tiết "}</span>
                  <span className={styles.requiredMark}>*</span>
                </label>
                <textarea
                  id={`${formId}-description`}
                  value={description}
                  onChange={event => {
                    setDescription(event.target.value)
                    if (errors.description) {
                      setErrors(prev => ({ ...prev, description: "" }))
                    }
                  }}
                  placeholder="Nhập quy cách đóng gói, xuất xứ hoặc ghi chú..."
                  className={`${styles.textareaInput} ${
                    errors.description ? styles.inputError : ""
                  }`}
                />
                {errors.description && (
                  <p className={styles.fieldError} role="alert">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={submitting}
              >
                {submitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmHideDialog
        open={confirmHideOpen}
        ingredientName={name || initialData?.name}
        submitting={hidingStatus}
        errorMessage={hideError}
        onCancel={() => {
          if (!hidingStatus) {
            setConfirmHideOpen(false)
            setHideError("")
          }
        }}
        onConfirm={handleConfirmHide}
      />
    </>
  )
}

export default IngredientFormModal
