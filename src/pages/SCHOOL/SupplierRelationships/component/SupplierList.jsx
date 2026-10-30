import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  Chip,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material"
import { RotateCcw, Search } from "lucide-react"
import RelationshipStatus from "./RelationshipStatus"
import styles from "./SupplierList.module.scss"

const ROWS_PER_PAGE = 6

function SupplierList({
  suppliers,
  loading,
  search,
  onSearchChange,
  onClearFilters,
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
      return matchesKeyword
    })
  }, [search, suppliers])

  const visibleSuppliers = filteredSuppliers.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE,
  )
  const hasFilters = Boolean(search)

  return (
    <section className={styles.panel} aria-label="Danh sách nhà cung cấp">
      <div className={styles.filters}>
        <TextField
          value={search}
          onChange={event => {
            onSearchChange(event.target.value)
            setPage(0)
          }}
          size="small"
          placeholder="Tìm theo tên, mã số thuế hoặc ID"
          className={styles.search}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search size={18} /></InputAdornment>
              ),
            },
          }}
        />
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

      {loading ? (
        <div className={styles.loading} aria-label="Đang tải danh sách">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className={styles.empty}>
          <Search size={28} />
          <strong>Không có nhà cung cấp phù hợp</strong>
          <span>Dữ liệu được đọc trực tiếp từ danh sách nhà cung cấp của hệ thống.</span>
        </div>
      ) : (
        <>
          <TableContainer className={styles.desktopTable}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhà cung cấp</TableCell>
                  <TableCell>Mã số thuế</TableCell>
                  <TableCell>Trạng thái hồ sơ</TableCell>
                  <TableCell>Liên kết với trường</TableCell>
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
                      <Chip
                        size="small"
                        color={supplier.status === "ACTIVE" ? "success" : "default"}
                        label={supplier.status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <RelationshipStatus status={supplier.relationship?.status} />
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
  onSearchChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
}

export default SupplierList
