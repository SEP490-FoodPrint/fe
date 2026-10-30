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

function SupplierList({
  suppliers,
  loading,
  pagination,
  onPageChange,
  onOpen,
  canManage,
}) {
  if (loading) return <Skeleton variant="rounded" height={320} />
  return (
    <section className="supplier-results" aria-label="Tất cả nhà cung cấp">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell>Trụ sở / Nhóm hàng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell>
                  <strong>{supplier.name}</strong>
                  <small>MST: {supplier.taxCode || "Chưa cập nhật"}</small>
                  <small>{supplier.phone || supplier.email || ""}</small>
                </TableCell>
                <TableCell>
                  <span>
                    {[supplier.location?.name, supplier.location?.parent?.name]
                      .filter(Boolean)
                      .join(", ") || "Chưa cập nhật địa bàn"}
                  </span>
                  <small>{supplier.address || "Chưa cập nhật địa chỉ"}</small>
                  <small>
                    {supplier.ingredients
                      .map((item) => item.category)
                      .filter(Boolean)
                      .join(" · ") || "Chưa cập nhật nhóm hàng"}
                  </small>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={supplier.status === "ACTIVE" ? "success" : "default"}
                    label={
                      supplier.status === "ACTIVE"
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"
                    }
                  />
                  <div style={{ marginTop: 8 }}>
                    <RelationshipStatus
                      status={supplier.relationship?.status}
                    />
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div className="supplier-row-actions">
                    <Button onClick={() => onOpen(supplier.id, "view")}>
                      Xem hồ sơ
                    </Button>
                    {canManage && supplier.status === "ACTIVE" && (
                      <Button
                        variant="outlined"
                        onClick={() => onOpen(supplier.id, "link")}
                      >
                        {supplier.relationship ? "Hợp đồng" : "Liên kết"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!suppliers.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="supplier-empty">
                    Không có nhà cung cấp phù hợp. Thử bỏ bớt bộ lọc.
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

export default SupplierList
