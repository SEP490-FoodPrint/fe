import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import {
  FormControl,
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
} from "@mui/material"
import { Link2Off, Search, SlidersHorizontal } from "lucide-react"
import RelationshipStatus from "./RelationshipStatus"
import styles from "./RelationshipList.module.scss"

const ROWS_PER_PAGE = 6
const formatDate = value =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—"

function RelationshipList({
  relationships,
  loading,
  search,
  status,
  onSearchChange,
  onStatusChange,
}) {
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi")
    return relationships.filter(relationship => {
      const matchesKeyword =
        !keyword ||
        [relationship.supplier?.name, relationship.supplier?.taxCode, relationship.supplierId]
          .filter(Boolean)
          .some(value => value.toLocaleLowerCase("vi").includes(keyword))
      return matchesKeyword && (status === "ALL" || relationship.status === status)
    })
  }, [relationships, search, status])

  const visible = filtered.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE,
  )

  return (
    <section className={styles.panel} aria-label="Danh sách liên kết">
      <div className={styles.filters}>
        <TextField
          value={search}
          onChange={event => {
            onSearchChange(event.target.value)
            setPage(0)
          }}
          size="small"
          placeholder="Tìm theo nhà cung cấp, mã số thuế hoặc ID"
          className={styles.search}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search size={18} /></InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" className={styles.filterControl}>
          <Select
            value={status}
            onChange={event => {
              onStatusChange(event.target.value)
              setPage(0)
            }}
            startAdornment={<SlidersHorizontal size={16} className={styles.filterIcon} />}
          >
            <MenuItem value="ALL">Tất cả trạng thái</MenuItem>
            <MenuItem value="ACTIVE">Đang liên kết</MenuItem>
            <MenuItem value="SUSPENDED">Tạm dừng</MenuItem>
            <MenuItem value="UNLINKED">Đã hủy liên kết</MenuItem>
          </Select>
        </FormControl>
      </div>

      {loading ? (
        <div className={styles.loading}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Link2Off size={28} />
          <strong>Không có liên kết phù hợp</strong>
          <span>Danh sách chỉ hiển thị các liên kết đã được lưu trong hệ thống.</span>
        </div>
      ) : (
        <>
          <TableContainer className={styles.desktopTable}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhà cung cấp</TableCell>
                  <TableCell>Mã số thuế</TableCell>
                  <TableCell>Ngày thiết lập</TableCell>
                  <TableCell>Ngày hủy</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map(relationship => (
                  <TableRow key={relationship.id} hover>
                    <TableCell>
                      <strong className={styles.primaryText}>
                        {relationship.supplier?.name || relationship.supplierId}
                      </strong>
                    </TableCell>
                    <TableCell>{relationship.supplier?.taxCode || "—"}</TableCell>
                    <TableCell>{formatDate(relationship.linkedAt)}</TableCell>
                    <TableCell>{formatDate(relationship.unlinkedAt)}</TableCell>
                    <TableCell className={styles.statusCell}>
                      <RelationshipStatus status={relationship.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className={styles.mobileList}>
            {visible.map(relationship => (
              <article key={relationship.id} className={styles.mobileCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <span>Nhà cung cấp</span>
                    <strong>{relationship.supplier?.name || relationship.supplierId}</strong>
                  </div>
                  <RelationshipStatus status={relationship.status} />
                </div>
                <dl>
                  <div><dt>Mã số thuế</dt><dd>{relationship.supplier?.taxCode || "—"}</dd></div>
                  <div><dt>Ngày thiết lập</dt><dd>{formatDate(relationship.linkedAt)}</dd></div>
                </dl>
              </article>
            ))}
          </div>

          <TablePagination
            component="div"
            count={filtered.length}
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

RelationshipList.propTypes = {
  relationships: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  search: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
}

export default RelationshipList
