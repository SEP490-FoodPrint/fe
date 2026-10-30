import React from "react"
import { Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import styles from "./RegisteredIngredients.module.scss"

export default function RegisteredIngredients({ ingredients }) {
  return (
    <Card component="section" variant="outlined" className={styles.card} aria-labelledby="registered-ingredients-title">
      <h2 id="registered-ingredients-title">Danh mục nguyên liệu đăng ký</h2>
      <p className={styles.caption}>Thông tin nguyên liệu do người đăng ký cung cấp.</p>
      {!ingredients.length ? <p className={styles.empty}>Chưa cung cấp danh mục nguyên liệu.</p> : <>
        <TableContainer className={styles.desktop} tabIndex={0} role="region" aria-label="Nguyên liệu đăng ký, có thể cuộn ngang">
          <Table className={styles.table} aria-label="Danh mục nguyên liệu đăng ký">
            <colgroup>{[64, 288, 184, 104, 192, 280].map((width, index) => <col key={index} width={width} />)}</colgroup>
            <TableHead><TableRow>{["STT", "Tên nguyên liệu", "Nhóm nguyên liệu", "Đơn vị tính", "Loại mục", "Ghi chú"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
            <TableBody>{ingredients.map((item, index) => <TableRow key={item.id || index}><TableCell>{String(index + 1).padStart(2, "0")}</TableCell><TableCell>{item.name}</TableCell><TableCell>{item.group || "Chưa cung cấp"}</TableCell><TableCell>{item.unit || "—"}</TableCell><TableCell className={styles.muted}>{item.is_proposed ? "Nguyên liệu đề xuất" : "Danh mục hiện có"}</TableCell><TableCell>{item.note || "—"}</TableCell></TableRow>)}</TableBody>
          </Table>
        </TableContainer>
        <div className={styles.mobile}>{ingredients.map((item, index) => <article key={item.id || index} className={styles.ingredient}>
          <h3>{item.name}</h3><p className={styles.muted}>{item.group || "Chưa cung cấp"}</p>
          <dl><dt>Đơn vị tính</dt><dd>{item.unit || "—"}</dd></dl><p className={styles.muted}>{item.is_proposed ? "Nguyên liệu đề xuất" : "Danh mục hiện có"}</p><p>{item.note || "Chưa cung cấp ghi chú"}</p>
        </article>)}</div>
      </>}
      <p className={styles.notice}>Nguyên liệu đề xuất chưa được xem là đã phê duyệt.</p>
    </Card>
  )
}
