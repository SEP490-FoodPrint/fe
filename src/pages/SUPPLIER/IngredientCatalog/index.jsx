import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  Add,
  ImageOutlined,
  KeyboardArrowDown,
  Search,
} from "@mui/icons-material"
import notice from "src/components/Notice"
import ROUTER from "src/router/ROUTER"
import SupplierIngredientService, {
  DEFAULT_UNITS,
} from "src/services/SupplierIngredientService"
import IngredientDetailView from "./component/IngredientDetailView"
import IngredientFormModal from "./component/IngredientFormModal"
import styles from "./IngredientCatalog.module.scss"

const PAGE_SIZE = 20

const IngredientCatalog = () => {
  const { id: detailId } = useParams()

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    hasNext: false,
    total: null,
  })
  const [categories, setCategories] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(null)

  const [detailItem, setDetailItem] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [failedThumbs, setFailedThumbs] = useState({})

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("create")
  const [editingItem, setEditingItem] = useState(null)

  const loadCategories = useCallback(async signal => {
    try {
      const result = await SupplierIngredientService.listCategories(
        { page: 1, limit: 100 },
        signal,
      )
      if (!signal?.aborted) {
        setCategories(result.items || [])
      }
    } catch {
      // Categories are optional if endpoint returns empty or fails
    }
  }, [])

  const loadList = useCallback(
    async (pageToLoad = currentPage, signal) => {
      setListLoading(true)
      setListError(null)
      try {
        const result = await SupplierIngredientService.list(
          { page: pageToLoad, limit: PAGE_SIZE },
          signal,
        )
        if (!signal?.aborted) {
          setItems(result.items || [])
          setPagination(
            result.pagination || {
              page: pageToLoad,
              limit: PAGE_SIZE,
              hasNext: false,
              total: null,
            },
          )
          setListLoading(false)
        }
      } catch (error) {
        if (!signal?.aborted) {
          setListError(error)
          setListLoading(false)
        }
      }
    },
    [currentPage],
  )

  const loadDetail = useCallback(async (ingredientId, signal) => {
    if (!ingredientId) return
    setDetailLoading(true)
    setDetailError(null)
    try {
      const data = await SupplierIngredientService.getById(ingredientId, signal)
      if (!signal?.aborted) {
        setDetailItem(data)
        setDetailLoading(false)
      }
    } catch (error) {
      if (!signal?.aborted) {
        setDetailError(error)
        setDetailLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadCategories(controller.signal)
    return () => controller.abort()
  }, [loadCategories])

  useEffect(() => {
    const controller = new AbortController()
    loadList(currentPage, controller.signal)
    return () => controller.abort()
  }, [currentPage, loadList])

  useEffect(() => {
    if (!detailId) {
      setDetailItem(null)
      setDetailError(null)
      setDetailLoading(false)
      return undefined
    }
    const controller = new AbortController()
    loadDetail(detailId, controller.signal)
    return () => controller.abort()
  }, [detailId, loadDetail])

  const categoryOptions = useMemo(() => {
    const map = new Map()
    categories.forEach(cat => {
      if (cat?.id && cat?.categoryName) {
        map.set(cat.id, cat)
      }
    })
    items.forEach(item => {
      if (item?.category?.id && item?.category?.categoryName) {
        map.set(item.category.id, item.category)
      }
    })
    return Array.from(map.values())
  }, [categories, items])

  const units = useMemo(() => {
    const fromItems = items.map(item => item.defaultUnit).filter(Boolean)
    return Array.from(new Set([...DEFAULT_UNITS, ...fromItems]))
  }, [items])

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return items.filter(item => {
      if (normalizedQuery) {
        const matchesName = item.name?.toLowerCase().includes(normalizedQuery)
        const matchesCategory = item.categoryName
          ?.toLowerCase()
          .includes(normalizedQuery)
        if (!matchesName && !matchesCategory) return false
      }

      if (categoryFilter !== "ALL") {
        if (categoryFilter === "UNCATEGORIZED") {
          if (item.categoryId) return false
        } else if (
          String(item.categoryId) !== String(categoryFilter) &&
          item.categoryName !== categoryFilter
        ) {
          return false
        }
      }

      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [items, searchQuery, categoryFilter, statusFilter])

  const startIndex = (currentPage - 1) * PAGE_SIZE
  const displayedCount = filteredItems.length
  const rangeStart = displayedCount === 0 ? 0 : startIndex + 1
  const rangeEnd = displayedCount === 0 ? 0 : startIndex + displayedCount
  const totalLabel = Number.isInteger(pagination.total)
    ? pagination.total
    : pagination.hasNext
      ? `${rangeEnd}+`
      : rangeEnd

  const maxKnownPage = pagination.hasNext ? currentPage + 1 : currentPage
  const pageNumbers = useMemo(
    () => Array.from({ length: maxKnownPage }, (_, index) => index + 1),
    [maxKnownPage],
  )

  const handleOpenCreateModal = () => {
    setModalMode("create")
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = item => {
    setModalMode("edit")
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleSubmitIngredient = async formPayload => {
    if (modalMode === "edit" && editingItem) {
      const updated = await SupplierIngredientService.update(
        editingItem.id,
        formPayload,
      )
      setModalOpen(false)
      if (updated) {
        setEditingItem(updated)
        if (detailId && String(detailId) === String(updated.id)) {
          setDetailItem(updated)
        }
      }
      await loadList(currentPage)
      notice({
        msg: "Sửa nguyên liệu thành công",
        isSuccess: true,
      })
      return
    }

    await SupplierIngredientService.create(formPayload)
    setModalOpen(false)
    setCurrentPage(1)
    await loadList(1)
    notice({
      msg: "Thêm nguyên liệu thành công",
      isSuccess: true,
    })
  }

  const handleConfirmHideStatus = async ingredientId => {
    const updated = await SupplierIngredientService.hide(ingredientId)
    if (updated) {
      setEditingItem(updated)
      if (detailId && String(detailId) === String(updated.id)) {
        setDetailItem(updated)
      }
    }
    await loadList(currentPage)
    notice({
      msg: "Ẩn nguyên liệu thành công",
      isSuccess: true,
    })
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("ALL")
    setStatusFilter("ALL")
  }

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    categoryFilter !== "ALL" ||
    statusFilter !== "ALL"

  const renderThumb = (item, isCard = false) => {
    const hasValidCover =
      Boolean(item.coverImage) && !failedThumbs[item.id]
    if (hasValidCover) {
      return (
        <img
          src={item.coverImage}
          alt={item.name}
          className={isCard ? styles.cardThumb : styles.thumbImg}
          onError={() =>
            setFailedThumbs(prev => ({ ...prev, [item.id]: true }))
          }
        />
      )
    }
    return (
      <span
        className={
          isCard ? styles.cardThumbPlaceholder : styles.thumbPlaceholder
        }
        aria-hidden="true"
      >
        <ImageOutlined className={styles.placeholderIconSmall} />
      </span>
    )
  }

  const listErrorStatus = listError?.response?.status
  const listErrorMsg =
    listErrorStatus === 403
      ? "Bạn không có quyền truy cập chức năng quản lý nguyên liệu nhà cung cấp."
      : listError?.response?.data?.message ||
        listError?.message ||
        "Không thể tải danh sách nguyên liệu."

  return (
    <>
      {detailId ? (
        <IngredientDetailView
          ingredient={detailItem}
          loading={detailLoading}
          error={detailError}
          onRetry={() => loadDetail(detailId)}
          onEdit={() => {
            if (detailItem) {
              handleOpenEditModal(detailItem)
            }
          }}
        />
      ) : (
        <div className={styles.page}>
          {/* Page Header */}
          <header className={styles.pageHeader}>
            <div className={styles.headingGroup}>
              <h1 className={styles.pageTitle}>Danh sách nguyên liệu</h1>
              <p className={styles.pageSubtitle}>
                Quản lý danh mục chuẩn để dùng cho nhập lô và đối chiếu thực đơn.
              </p>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleOpenCreateModal}
            >
              <Add className={styles.btnIcon} />
              <span className={styles.mobilePlusPrefix}>{"+ "}</span>
              <span>Thêm nguyên liệu mới</span>
            </button>
          </header>

          {/* Main Surface: Filter Bar + Desktop Table / Tablet-Mobile Cards + Pagination */}
          <section
            className={styles.catalogSurface}
            aria-label="Danh mục nguyên liệu"
          >
            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <div className={styles.filterFieldSearch}>
                <label
                  htmlFor="supplier-ingredient-search"
                  className={styles.filterLabel}
                >
                  <span className={styles.filterLabelDesktop}>
                    Tìm kiếm nguyên liệu
                  </span>
                  <span className={styles.filterLabelCompact}>Tìm kiếm</span>
                </label>
                <div className={styles.searchInputWrap}>
                  <Search className={styles.searchIcon} />
                  <input
                    id="supplier-ingredient-search"
                    type="text"
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Tìm theo tên nguyên liệu..."
                    className={styles.searchInput}
                  />
                </div>
              </div>

              <div className={styles.filterFieldCategory}>
                <label
                  htmlFor="supplier-ingredient-category"
                  className={styles.filterLabel}
                >
                  Nhóm nguyên liệu
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id="supplier-ingredient-category"
                    value={categoryFilter}
                    onChange={event => setCategoryFilter(event.target.value)}
                    className={`${styles.selectControl} ${
                      categoryFilter === "ALL" ? styles.isPlaceholder : ""
                    }`}
                  >
                    <option value="ALL">Tất cả nhóm</option>
                    {categoryOptions.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  <KeyboardArrowDown className={styles.selectChevron} />
                </div>
              </div>

              <div className={styles.filterFieldStatus}>
                <label
                  htmlFor="supplier-ingredient-status"
                  className={styles.filterLabel}
                >
                  Trạng thái
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id="supplier-ingredient-status"
                    value={statusFilter}
                    onChange={event => setStatusFilter(event.target.value)}
                    className={`${styles.selectControl} ${
                      statusFilter === "ALL" ? styles.isPlaceholder : ""
                    }`}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Đã ẩn</option>
                  </select>
                  <KeyboardArrowDown className={styles.selectChevron} />
                </div>
              </div>
            </div>

            {listLoading ? (
              <div
                className={styles.emptyState}
                role="status"
                aria-live="polite"
              >
                <p className={styles.emptyTitle}>
                  Đang tải danh sách nguyên liệu...
                </p>
              </div>
            ) : listError ? (
              <div className={styles.emptyState} role="alert">
                <p className={styles.emptyTitle}>
                  Không thể tải danh sách nguyên liệu
                </p>
                <p className={styles.emptyDesc}>{listErrorMsg}</p>
                {listErrorStatus !== 403 && (
                  <button
                    type="button"
                    className={styles.resetFilterBtn}
                    onClick={() => loadList(currentPage)}
                  >
                    Thử lại
                  </button>
                )}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>
                  {hasActiveFilters
                    ? "Không tìm thấy nguyên liệu phù hợp"
                    : "Chưa có nguyên liệu nào trong danh mục"}
                </p>
                <p className={styles.emptyDesc}>
                  {hasActiveFilters
                    ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc nhóm nguyên liệu, trạng thái để xem đầy đủ danh mục."
                    : "Nhấn \"Thêm nguyên liệu mới\" để đăng ký nguyên liệu cung ứng của đơn vị."}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className={styles.resetFilterBtn}
                    onClick={handleResetFilters}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table (Node 249:12059) */}
                <div className={styles.tableContainer}>
                  <table className={styles.catalogTable}>
                    <thead>
                      <tr>
                        <th scope="col" className={styles.colStt}>
                          STT
                        </th>
                        <th scope="col" className={styles.colName}>
                          Tên nguyên liệu
                        </th>
                        <th scope="col" className={styles.colCategory}>
                          Nhóm nguyên liệu
                        </th>
                        <th scope="col" className={styles.colUnit}>
                          <span className={styles.unitHeaderWrap}>
                            Đơn vị
                            <br />
                            mặc định
                          </span>
                        </th>
                        <th scope="col" className={styles.colStatus}>
                          Trạng thái
                        </th>
                        <th scope="col" className={styles.colUpdated}>
                          Cập nhật lần cuối
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, idx) => {
                        const stt = startIndex + idx + 1
                        const isActive = item.status !== "INACTIVE"
                        const detailUrl = `${ROUTER.SUPPLIER_INGREDIENTS}/${encodeURIComponent(item.id)}`

                        return (
                          <tr key={item.id} className={styles.tableRow}>
                            <td className={`${styles.colStt} ${styles.cellStt}`}>
                              {stt}
                            </td>
                            <td className={styles.colName}>
                              <div className={styles.nameCellContent}>
                                <Link
                                  to={detailUrl}
                                  className={styles.thumbLink}
                                  aria-label={`Xem chi tiết ${item.name}`}
                                >
                                  {renderThumb(item, false)}
                                </Link>
                                <div className={styles.nameTextStack}>
                                  <Link
                                    to={detailUrl}
                                    className={styles.ingredientNameLink}
                                  >
                                    {item.name}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className={styles.colCategory}>
                              <span className={styles.categoryChip}>
                                {item.categoryName}
                              </span>
                            </td>
                            <td className={styles.colUnit}>
                              {item.defaultUnit}
                            </td>
                            <td className={styles.colStatus}>
                              <span
                                className={`${styles.statusBadge} ${
                                  isActive
                                    ? styles.statusActive
                                    : styles.statusInactive
                                }`}
                              >
                                {isActive ? "Đang hoạt động" : "Đã ẩn"}
                              </span>
                            </td>
                            <td
                              className={`${styles.colUpdated} ${styles.cellUpdated}`}
                            >
                              {item.updatedAt}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Tablet & Mobile Card List (Nodes 294:10295 & 294:10601) */}
                <div className={styles.cardList}>
                  {filteredItems.map(item => {
                    const isActive = item.status !== "INACTIVE"
                    const detailUrl = `${ROUTER.SUPPLIER_INGREDIENTS}/${encodeURIComponent(item.id)}`

                    return (
                      <article key={item.id} className={styles.ingredientCard}>
                        <Link to={detailUrl} className={styles.cardHeaderLink}>
                          {renderThumb(item, true)}
                          <div className={styles.cardTitleGroup}>
                            <h2 className={styles.cardTitle}>{item.name}</h2>
                            <p className={styles.cardSubMeta}>
                              {`${item.categoryName} · ${item.defaultUnit}`}
                            </p>
                          </div>
                        </Link>

                        <span
                          className={`${styles.statusBadge} ${
                            isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }`}
                        >
                          {isActive ? "Đang hoạt động" : "Đã ẩn"}
                        </span>

                        <p className={styles.cardUpdatedText}>
                          {`Cập nhật: ${item.updatedAt}`}
                        </p>
                      </article>
                    )
                  })}
                </div>
              </>
            )}

            {/* Desktop Pagination Footer (Node 249:12206) */}
            <footer className={styles.paginationDesktop}>
              <p className={styles.paginationSummary}>
                {`Hiển thị ${rangeStart}–${rangeEnd} trong ${totalLabel} nguyên liệu`}
              </p>
              <p className={styles.paginationLimit}>{`${PAGE_SIZE} / trang`}</p>
              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={`${styles.pageNavBtn} ${styles.pageNavBtnPrev}`}
                  onClick={() =>
                    setCurrentPage(prev => Math.max(1, prev - 1))
                  }
                  disabled={listLoading || currentPage <= 1}
                >
                  Trang trước
                </button>
                {pageNumbers.map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`${styles.pageNumberBtn} ${
                      pageNum === currentPage ? styles.isCurrentPage : ""
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                    disabled={listLoading}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.pageNavBtn}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={listLoading || !pagination.hasNext}
                >
                  Trang sau
                </button>
              </div>
            </footer>

            {/* Tablet & Mobile Pagination Footer (Node 294:10347) */}
            <footer className={styles.paginationCompact}>
              <button
                type="button"
                className={`${styles.pageNavBtn} ${styles.pageNavBtnPrev}`}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={listLoading || currentPage <= 1}
              >
                Trang trước
              </button>
              {pageNumbers.map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  className={`${styles.pageNumberBtn} ${
                    pageNum === currentPage ? styles.isCurrentPage : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                  disabled={listLoading}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                className={styles.pageNavBtn}
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={listLoading || !pagination.hasNext}
              >
                Trang sau
              </button>
            </footer>
          </section>
        </div>
      )}

      <IngredientFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={editingItem}
        existingItems={items}
        categories={categoryOptions}
        units={units}
        onClose={handleCloseModal}
        onSubmit={handleSubmitIngredient}
        onConfirmHideStatus={handleConfirmHideStatus}
      />
    </>
  )
}

export default IngredientCatalog
