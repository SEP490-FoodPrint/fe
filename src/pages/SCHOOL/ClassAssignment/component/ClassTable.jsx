import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import styles from "./ClassTable.module.scss"

const formatDate = value => (value ? new Date(value).toLocaleDateString("vi-VN") : "")

function ClassTable({ classes, loading, onAssign, onRemove }) {
  if (loading) return <Skeleton variant="rounded" height={320} />

  return (
    <section className={styles.card} aria-label="Danh sách lớp và GVCN">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lớp</TableCell>
              <TableCell>Suất ăn đăng ký</TableCell>
              <TableCell>Giáo viên chủ nhiệm</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map(item => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <strong className={styles.className}>{item.name}</strong>
                  {item.status !== "ACTIVE" && (
                    <Chip size="small" variant="outlined" label="Ngừng hoạt động" className={styles.inactive} />
                  )}
                </TableCell>
                <TableCell>{item.registeredMealPortions}</TableCell>
                <TableCell>
                  {item.homeroomTeacher ? (
                    <>
                      <span className={styles.teacher}>{item.homeroomTeacher.fullName}</span>
                      <small className={styles.meta}>
                        {item.homeroomTeacher.username} · từ {formatDate(item.homeroomTeacher.assignedAt)}
                      </small>
                    </>
                  ) : (
                    <span className={styles.empty}>Chưa phân công</span>
                  )}
                </TableCell>
                <TableCell align="right">
                  {item.canAssign ? (
                    <div className={styles.actions}>
                      {item.homeroomTeacher && (
                        <Button color="error" onClick={() => onRemove(item)}>
                          Bỏ phân công
                        </Button>
                      )}
                      <Button variant="outlined" onClick={() => onAssign(item)}>
                        {item.homeroomTeacher ? "Đổi GVCN" : "Phân công"}
                      </Button>
                    </div>
                  ) : (
                    <span className={styles.readOnly}>Chỉ xem</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!classes.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className={styles.emptyState}>Niên khóa này chưa có lớp học.</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  )
}

ClassTable.propTypes = {
  classes: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  onAssign: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
}

export default ClassTable
