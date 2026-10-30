import React, { useState } from "react"
import { Button, Card, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material"
import RequestFields from "src/components/Registration/RequestFields"
import { formatRequestDate } from "src/lib/registration"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import DocumentDialog from "./DocumentDialog"
import styles from "./SupportingDocuments.module.scss"

export default function SupportingDocuments({ documents, organization }) {
  const [selected, setSelected] = useState(null)
  return (
    <Card component="section" variant="outlined" className={styles.card} aria-labelledby="supporting-documents-title">
      <h2 id="supporting-documents-title">Giấy phép và tệp minh chứng</h2>
      <p className={styles.caption}>Minh chứng do người đăng ký cung cấp.</p>
      {!documents.length ? <p className={styles.empty}>Chưa cung cấp tệp minh chứng.</p> : <>
        <TableContainer className={styles.desktop} tabIndex={0} role="region" aria-label="Giấy phép và minh chứng, có thể cuộn ngang">
          <Table className={styles.table} aria-label="Giấy phép và tệp minh chứng">
            <colgroup>{[64, 432, 184, 144, 144, 144].map((width, index) => <col key={index} width={width} />)}</colgroup>
            <TableHead><TableRow>{["STT", "Loại chứng nhận", "Số chứng nhận", "Ngày cấp", "Ngày hết hạn", "Tệp minh chứng"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
            <TableBody>{documents.map((document, index) => <TableRow key={document.id || index}>
              <TableCell>{String(index + 1).padStart(2, "0")}</TableCell><TableCell>{document.name || "Tệp minh chứng"}</TableCell><TableCell>{document.number || "Chưa cung cấp"}</TableCell><TableCell>{formatRequestDate(document.issued_at)}</TableCell><TableCell>{formatRequestDate(document.expires_at)}</TableCell>
              <TableCell align="center"><Tooltip title={document.mime_type?.startsWith("image/") ? "Xem ảnh" : "Xem tài liệu"}><IconButton onClick={() => setSelected(document)} aria-label={`Xem minh chứng ${document.number || index + 1}`}><VisibilityOutlinedIcon /></IconButton></Tooltip></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </TableContainer>
        <div className={styles.mobile}>{documents.map((document, index) => <article className={styles.documentCard} key={document.id || index}>
          <h3>{document.name || "Tệp minh chứng"}</h3>
          <RequestFields columns={1} fields={[{ label: "Số chứng nhận", value: document.number }]} />
          <dl className={styles.dateFields}><div><dt>Ngày cấp</dt><dd>{formatRequestDate(document.issued_at)}</dd></div><div><dt>Ngày hết hạn</dt><dd>{formatRequestDate(document.expires_at)}</dd></div></dl>
          <Button variant="outlined" fullWidth onClick={() => setSelected(document)}>{document.mime_type?.startsWith("image/") ? "Xem ảnh" : "Xem tài liệu"}</Button>
        </article>)}</div>
      </>}
      <DocumentDialog document={selected} organization={organization} onClose={() => setSelected(null)} />
    </Card>
  )
}
