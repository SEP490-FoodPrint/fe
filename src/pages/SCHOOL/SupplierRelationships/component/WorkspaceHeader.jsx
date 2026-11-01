import React from "react"
import PropTypes from "prop-types"
import { Button } from "@mui/material"
import { Building2, Link2 } from "lucide-react"
import styles from "./WorkspaceHeader.module.scss"

function WorkspaceHeader({ activeView, onChangeView }) {
  const isRelationships = activeView === "relationships"

  return (
    <header className={styles.header}>
      <div>
        <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
          <span>Nhà cung cấp</span>
          <span>/</span>
          <strong>{isRelationships ? "Đối tác của trường" : "Tất cả nhà cung cấp"}</strong>
        </nav>
        <p className={styles.eyebrow}>Quản lý nhà cung cấp</p>
        <h1 className={styles.title}>
          {isRelationships ? "Đối tác của trường" : "Tìm nhà cung cấp"}
        </h1>
        <p className={styles.subtitle}>
          {isRelationships
            ? "Theo dõi hợp đồng, điều kiện cung cấp và lịch sử hợp tác của trường."
            : "Tra cứu nhà cung cấp toàn hệ thống, kiểm tra hồ sơ và thiết lập hợp tác."}
        </p>
      </div>

      <div className={styles.switcher} role="group" aria-label="Chọn danh sách hiển thị">
        <Button
          variant={!isRelationships ? "contained" : "text"}
          startIcon={<Building2 size={17} />}
          onClick={() => onChangeView("suppliers")}
        >
          Tất cả nhà cung cấp
        </Button>
        <Button
          variant={isRelationships ? "contained" : "text"}
          startIcon={<Link2 size={17} />}
          onClick={() => onChangeView("relationships")}
        >
          Đối tác của trường
        </Button>
      </div>
    </header>
  )
}

WorkspaceHeader.propTypes = {
  activeView: PropTypes.string.isRequired,
  onChangeView: PropTypes.func.isRequired,
}

export default WorkspaceHeader
