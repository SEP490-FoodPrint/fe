import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  Button,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material"
import { MoreVertical, PauseCircle, Pencil, PlayCircle } from "lucide-react"
import styles from "./ClassTable.module.scss"

const formatDate = value => (value ? new Date(value).toLocaleDateString("vi-VN") : "")

function ClassTable({ classes, loading, canManage, canEditGrade, filtered, onAssign, onRemove, onEdit, onToggleStatus }) {
  const [menu, setMenu] = useState(null)

  if (loading) return <Skeleton variant="rounded" height={320} />

  const closeMenu = () => setMenu(null)
  const runMenuAction = action => {
    const item = menu?.item
    closeMenu()
    if (item) action(item)
  }

  return (
    <section className={styles.card} aria-label="Danh sách lớp và GVCN">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lớp</TableCell>
              <TableCell>Khối</TableCell>
              <TableCell>Suất ăn đăng ký</TableCell>
              <TableCell>Giáo viên chủ nhiệm</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map(item => {
              const inactive = item.status !== "ACTIVE"
              return (
                <TableRow key={item.id} hover className={inactive ? styles.inactiveRow : undefined}>
                  <TableCell>
                    <strong className={styles.className}>{item.name}</strong>
                    {inactive && (
                      <Chip size="small" variant="outlined" label="Ngừng hoạt động" className={styles.inactive} />
                    )}
                  </TableCell>
                  <TableCell>{item.grade?.name ?? "Chưa gán khối"}</TableCell>
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
                    <div className={styles.actions}>
                      {item.canAssign && (
                        <>
                          {item.homeroomTeacher && (
                            <Button color="error" onClick={() => onRemove(item)}>
                              Bỏ phân công
                            </Button>
                          )}
                          <Button variant="outlined" onClick={() => onAssign(item)}>
                            {item.homeroomTeacher ? "Đổi GVCN" : "Phân công"}
                          </Button>
                        </>
                      )}
                      {canManage ? (
                        <Tooltip title="Quản lý lớp">
                          <IconButton
                            className={styles.menuButton}
                            aria-label={`Quản lý lớp ${item.name}`}
                            onClick={event => setMenu({ anchor: event.currentTarget, item })}
                          >
                            <MoreVertical size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        canEditGrade
                          ? <Button onClick={() => onEdit(item)}>Đổi khối</Button>
                          : !item.canAssign && <span className={styles.readOnly}>Chỉ xem</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {!classes.length && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>{filtered ? "Không có lớp phù hợp với bộ lọc." : "Niên khóa này chưa có lớp học."}</p>
                    {canManage && !filtered && (
                      <ol className={styles.steps}>
                        <li>
                          <strong>Tạo lớp:</strong> bấm “Thêm lớp” hoặc “Sao chép từ năm trước”.
                        </li>
                        <li>
                          <strong>Phân công GVCN:</strong> chọn giáo viên khi tạo lớp hoặc bấm “Phân công” trên
                          từng lớp.
                        </li>
                        <li>
                          <strong>Khai báo suất ăn:</strong> GVCN được phân công bắt đầu báo suất ăn hằng ngày cho
                          lớp.
                        </li>
                      </ol>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menu?.anchor || null}
        open={Boolean(menu)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => runMenuAction(onEdit)}>
          <ListItemIcon>
            <Pencil size={16} />
          </ListItemIcon>
          <ListItemText>Sửa thông tin lớp</ListItemText>
        </MenuItem>
        {menu?.item?.status === "ACTIVE" ? (
          <MenuItem onClick={() => runMenuAction(onToggleStatus)} className={styles.dangerItem}>
            <ListItemIcon className={styles.dangerItem}>
              <PauseCircle size={16} />
            </ListItemIcon>
            <ListItemText>Ngừng hoạt động</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => runMenuAction(onToggleStatus)}>
            <ListItemIcon>
              <PlayCircle size={16} />
            </ListItemIcon>
            <ListItemText>Kích hoạt lại</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </section>
  )
}

ClassTable.propTypes = {
  classes: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  canManage: PropTypes.bool.isRequired,
  canEditGrade: PropTypes.bool.isRequired,
  filtered: PropTypes.bool.isRequired,
  onAssign: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
}

export default ClassTable
