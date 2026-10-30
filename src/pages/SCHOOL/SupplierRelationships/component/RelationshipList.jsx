import React from "react"
import {
  Button,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material"
import RelationshipStatus from "./RelationshipStatus"

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—"

function RelationshipList({
  relationships,
  loading,
  pagination,
  onPageChange,
  onOpen,
}) {
  if (loading) return <Skeleton variant="rounded" height={320} />
  return (
    <section className="supplier-results" aria-label="Đối tác của trường">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell>Quan hệ hợp tác</TableCell>
              <TableCell>Điều kiện đặt hàng</TableCell>
              <TableCell>Hợp đồng</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relationships.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <strong>{item.supplier.name}</strong>
                  <small>MST: {item.supplier.taxCode || "—"}</small>
                </TableCell>
                <TableCell>
                  <RelationshipStatus status={item.status} />
                  <small>Liên kết: {formatDate(item.linkedAt)}</small>
                  {item.unlinkedAt && (
                    <small>Ngừng: {formatDate(item.unlinkedAt)}</small>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={item.eligible ? "success" : "warning"}
                    label={
                      item.eligible
                        ? "Có hợp đồng phù hợp"
                        : item.status === "ACTIVE"
                          ? "Cần bổ sung/kiểm tra hồ sơ"
                          : "Đang ngừng đặt mới"
                    }
                  />
                </TableCell>
                <TableCell>
                  {item.contracts.length ? (
                    item.contracts.map((contract) => (
                      <small key={contract.id}>
                        {contract.number || "Hồ sơ nháp"} ·{" "}
                        {formatDate(contract.endsOn)}
                      </small>
                    ))
                  ) : (
                    <span>Chưa có hồ sơ hợp đồng</span>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button onClick={() => onOpen(item.supplierId, "link")}>
                    Hồ sơ & lịch sử
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!relationships.length && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="supplier-empty">
                    Chưa có đối tác phù hợp với bộ lọc.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1}
        rowsPerPage={pagination.limit}
        rowsPerPageOptions={[10]}
        onPageChange={(_, page) => onPageChange(page + 1)}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} trong ${count}`
        }
      />
    </section>
  )
}

export default RelationshipList
