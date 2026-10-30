import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { FileSearch } from "lucide-react"
import styles from "./SupplierDocuments.module.scss"

const formatDate = value =>
  value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "—"

function SupplierDocuments({ documents, onViewDocument }) {
  if (!documents.length) {
    return (
      <div className={styles.emptyDocuments}>
        <FileSearch size={26} />
        <span>Chưa có tài liệu để hiển thị.</span>
      </div>
    )
  }

  return (
    <>
      <TableContainer className={styles.documentTable}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên tài liệu</TableCell>
              <TableCell>Số chứng nhận</TableCell>
              <TableCell>Ngày cấp</TableCell>
              <TableCell>Ngày hết hạn</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map(document => (
              <TableRow key={document.id}>
                <TableCell><strong>{document.certificationType}</strong></TableCell>
                <TableCell>{document.certificateNo}</TableCell>
                <TableCell>{formatDate(document.issuedDate)}</TableCell>
                <TableCell>{formatDate(document.expiryDate)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    disabled={!document.documentUrl}
                    onClick={() => onViewDocument(document.id)}
                  >
                    {document.documentUrl ? "Xem tài liệu" : "Chưa có tệp"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className={styles.mobileDocuments}>
        {documents.map(document => (
          <article key={document.id}>
            <strong>{document.certificationType}</strong>
            <span>Số: {document.certificateNo}</span>
            <span>Ngày cấp: {formatDate(document.issuedDate)}</span>
            <span>Ngày hết hạn: {formatDate(document.expiryDate)}</span>
            <Button
              fullWidth
              variant="outlined"
              disabled={!document.documentUrl}
              onClick={() => onViewDocument(document.id)}
            >
              {document.documentUrl ? "Xem tài liệu" : "Chưa có tệp"}
            </Button>
          </article>
        ))}
      </div>
    </>
  )
}

SupplierDocuments.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDocument: PropTypes.func.isRequired,
}

export default SupplierDocuments
