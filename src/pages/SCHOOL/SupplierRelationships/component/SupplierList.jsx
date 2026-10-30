import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material"
import { Eye, MapPin, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import RelationshipStatus from "./RelationshipStatus"
import styles from "./SupplierList.module.scss"

const ROWS_PER_PAGE = 4

function SupplierList({
  suppliers,
  loading,
  search,
  addressSearch,
  relationshipFilter,
  onSearchChange,
  onAddressSearchChange,
  onRelationshipFilterChange,
  onClearFilters,
  onViewDetail,
}) {
  const [page, setPage] = useState(0)

  const filteredSuppliers = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi")
    return suppliers.filter(supplier => {
      const matchesKeyword =
        !keyword ||
        [supplier.name, supplier.taxCode, supplier.id]
          .filter(Boolean)
          .some(value => value.toLocaleLowerCase("vi").includes(keyword))
      const addressKeyword = addressSearch.trim().toLocaleLowerCase("vi")
      const matchesAddress =
        !addressKeyword ||
        supplier.address?.toLocaleLowerCase("vi").includes(addressKeyword)
      const hasCurrentRelationship = ["ACTIVE", "SUSPENDED"].includes(
        supplier.relationship?.status,
      )
      const matchesRelationship =
        relationshipFilter === "ALL" ||
        (relationshipFilter === "LINKED" && hasCurrentRelationship) ||
        (relationshipFilter === "NOT_LINKED" && !hasCurrentRelationship)
      return matchesKeyword && matchesAddress && matchesRelationship
    })
  }, [addressSearch, relationshipFilter, search, suppliers])

  const visibleSuppliers = filteredSuppliers.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE,
  )

  const handleSearch = event => {
    onSearchChange(event.target.value)
    setPage(0)
  }

  const handleAddressSearch = event => {
    onAddressSearchChange(event.target.value)
    setPage(0)
  }

  const handleFilter = event => {
    onRelationshipFilterChange(event.target.value)
    setPage(0)
  }

  const hasFilters = Boolean(search || addressSearch || relationshipFilter !== "ALL")

  return (
    <section className={styles.panel} aria-label="Danh sách nhà cung cấp">
      <div className={styles.filters}>
        <TextField
          value={search}
          onChange={handleSearch}
          size="small"
          placeholder="Tìm theo tên nhà cung cấp"
          className={styles.search}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          value={addressSearch}
          onChange={handleAddressSearch}
          size="small"
          placeholder="Tìm trong địa chỉ đã khai báo"
          className={styles.addressSearch}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MapPin size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" className={styles.filterControl}>
          <Select
            value={relationshipFilter}
            onChange={handleFilter}
            displayEmpty
            startAdornment={<SlidersHorizontal size={16} className={styles.filterIcon} />}
          >
            <MenuItem value="ALL">Tất cả liên kết</MenuItem>
            <MenuItem value="LINKED">Đang liên kết</MenuItem>
            <MenuItem value="NOT_LINKED">Chưa liên kết</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="text"
          startIcon={<RotateCcw size={16} />}
          disabled={!hasFilters}
          onClick={() => {
            onClearFilters()
            setPage(0)
          }}
          className={styles.clearButton}
        >
          Xóa bộ lọc
        </Button>
      </div>

      <div className={styles.locationNotice}>
        <MapPin size={16} />
        <span>
          Địa chỉ hiện được lưu dạng văn bản. Hệ thống chưa hỗ trợ lọc tỉnh/thành phố và phường/xã chính xác.
        </span>
      </div>

      {loading ? (
        <div className={styles.loading} aria-label="Đang tải danh sách">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className={styles.empty}>
          <Search size={28} />
          <strong>Không tìm thấy nhà cung cấp</strong>
          <span>Thử thay đổi từ khóa hoặc bộ lọc đang chọn.</span>
        </div>
      ) : (
        <>
          <TableContainer className={styles.desktopTable}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhà cung cấp</TableCell>
                  <TableCell>Mã số thuế</TableCell>
                  <TableCell>Thông tin liên hệ</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell>Liên kết với trường</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleSuppliers.map(supplier => (
                  <TableRow key={supplier.id} hover>
                    <TableCell>
                      <strong className={styles.supplierName}>{supplier.name}</strong>
                      <span className={styles.identifier}>{supplier.id}</span>
                    </TableCell>
                    <TableCell>{supplier.taxCode || "—"}</TableCell>
                    <TableCell>
                      <span className={styles.stack}>{supplier.phone || "—"}</span>
                      <span className={styles.secondary}>{supplier.email || "—"}</span>
                    </TableCell>
                    <TableCell className={styles.address}>{supplier.address || "—"}</TableCell>
                    <TableCell>
                      <RelationshipStatus status={supplier.relationship?.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết" arrow>
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label={`Xem chi tiết ${supplier.name}`}
                          onClick={() => onViewDetail(supplier.id)}
                        >
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className={styles.mobileList}>
            {visibleSuppliers.map(supplier => (
              <article key={supplier.id} className={styles.mobileCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <strong>{supplier.name}</strong>
                    <span>MST: {supplier.taxCode || "—"}</span>
                  </div>
                  <RelationshipStatus status={supplier.relationship?.status} />
                </div>
                <dl>
                  <div><dt>Điện thoại</dt><dd>{supplier.phone || "—"}</dd></div>
                  <div><dt>Email</dt><dd>{supplier.email || "—"}</dd></div>
                  <div><dt>Địa chỉ</dt><dd>{supplier.address || "—"}</dd></div>
                </dl>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Eye size={17} />}
                  onClick={() => onViewDetail(supplier.id)}
                >
                  Xem chi tiết
                </Button>
              </article>
            ))}
          </div>

          <TablePagination
            component="div"
            count={filteredSuppliers.length}
            page={page}
            rowsPerPage={ROWS_PER_PAGE}
            rowsPerPageOptions={[ROWS_PER_PAGE]}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} trong ${count}`}
          />
        </>
      )}
    </section>
  )
}

SupplierList.propTypes = {
  suppliers: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  search: PropTypes.string.isRequired,
  addressSearch: PropTypes.string.isRequired,
  relationshipFilter: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onAddressSearchChange: PropTypes.func.isRequired,
  onRelationshipFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
}

export default SupplierList
