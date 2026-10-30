import React, { useRef } from "react"
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material"
import { Link, useLocation } from "react-router-dom"
import RequestStatus from "src/components/Registration/RequestStatus"
import { formatRequestDate, organizationName, requestCode, REQUEST_TYPES } from "src/lib/registration"
import ROUTER from "src/router/ROUTER"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import styles from "./RegistrationTable.module.scss"

const detailUrl = id => ROUTER.SYSTEM_ORG_APPROVAL_DETAIL.replace(":requestId", encodeURIComponent(id))
const headings = ["STT", "Mã hồ sơ", "Người đăng ký", "Email", "Loại hồ sơ", "Đơn vị đăng ký", "Trạng thái", "Ngày gửi", "Ngày xét duyệt", "Thao tác"]

export default function RegistrationTable({ requests, start, isMobile, busy }) {
  const table = useRef(null)
  const { search: listSearch } = useLocation()
  if (isMobile) return (
    <div className={styles.mobileList} aria-busy={busy}>
      <p className={styles.resultRange} aria-live="polite">Đang hiển thị {requests.length ? start + 1 : 0}–{start + requests.length}</p>
      {requests.map(request => (
        <article className={styles.mobileCard} key={request.id}>
          <div className={styles.cardTop}><span>{requestCode(request.id)}</span><RequestStatus status={request.status} /></div>
          <h2>{request.applicant?.full_name || "Chưa cung cấp"}</h2>
          <p className={styles.email}><EmailOutlinedIcon />{request.applicant?.email || "Chưa cung cấp"}</p>
          <dl className={styles.cardFields}>
            <div className={styles.organization}><dt>Đơn vị đăng ký</dt><dd>{organizationName(request)}</dd></div>
            <div><dt>Loại hồ sơ</dt><dd>{REQUEST_TYPES[request.request_type] || request.request_type}</dd></div>
            <div><dt>Ngày gửi</dt><dd>{formatRequestDate(request.submitted_at)}</dd></div>
          </dl>
          <Button component={Link} to={detailUrl(request.id)} state={{ listSearch }} variant="outlined" fullWidth endIcon={<KeyboardArrowRightIcon />}>Xem chi tiết</Button>
        </article>
      ))}
    </div>
  )
  return (
    <div aria-busy={busy}>
      <TableContainer ref={table} className={styles.tableContainer} tabIndex={0} role="region" aria-label="Bảng hồ sơ đăng ký, cuộn ngang để xem các cột">
        <Table className={styles.table} aria-label="Danh sách hồ sơ đăng ký">
          <colgroup>{[64, 152, 208, 248, 176, 248, 144, 144, 144, 88].map((width, index) => <col key={index} width={width} />)}</colgroup>
          <TableHead><TableRow>{headings.map(heading => <TableCell key={heading}>{heading}</TableCell>)}</TableRow></TableHead>
          <TableBody>{requests.map((request, index) => (
            <TableRow key={request.id} hover>
              <TableCell>{String(start + index + 1).padStart(2, "0")}</TableCell>
              <TableCell><Link className={styles.codeLink} to={detailUrl(request.id)} state={{ listSearch }}>{requestCode(request.id)}</Link></TableCell>
              <TableCell>{request.applicant?.full_name || "Chưa cung cấp"}</TableCell>
              <TableCell>{request.applicant?.email || "Chưa cung cấp"}</TableCell>
              <TableCell>{REQUEST_TYPES[request.request_type] || request.request_type}</TableCell>
              <TableCell>{organizationName(request)}</TableCell>
              <TableCell><RequestStatus status={request.status} /></TableCell>
              <TableCell>{formatRequestDate(request.submitted_at)}</TableCell>
              <TableCell>{formatRequestDate(request.reviewed_at)}</TableCell>
              <TableCell align="center"><Tooltip title="Xem chi tiết"><IconButton component={Link} to={detailUrl(request.id)} state={{ listSearch }} aria-label={`Xem chi tiết ${requestCode(request.id)}`}><VisibilityOutlinedIcon /></IconButton></Tooltip></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </TableContainer>
      <div className={styles.scrollHint}><IconButton onClick={() => table.current?.scrollBy({ left: 360 })} aria-label="Cuộn bảng sang phải"><KeyboardArrowRightIcon /></IconButton><span>Cuộn ngang để xem ngày xét duyệt và thao tác</span></div>
    </div>
  )
}
