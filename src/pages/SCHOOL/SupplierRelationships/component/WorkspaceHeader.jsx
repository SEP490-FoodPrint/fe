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
          <strong>{isRelationships ? "Danh sách liên kết" : "Danh sách nhà cung cấp"}</strong>
        </nav>
        <p className={styles.eyebrow}>Quản lý nhà cung cấp</p>
        <h1 className={styles.title}>
          {isRelationships ? "Danh sách liên kết" : "Danh sách nhà cung cấp"}
        </h1>
        <p className={styles.subtitle}>
          {isRelationships
            ? "Theo dõi các mối liên kết giữa nhà trường và nhà cung cấp."
            : "Tra cứu nhà cung cấp và xem thông tin trước khi thiết lập liên kết."}
        </p>
      </div>

      <div className={styles.switcher} role="group" aria-label="Chọn danh sách hiển thị">
        <Button
          variant={!isRelationships ? "contained" : "text"}
          startIcon={<Building2 size={17} />}
          onClick={() => onChangeView("suppliers")}
        >
          Khám phá nhà cung cấp
        </Button>
        <Button
          variant={isRelationships ? "contained" : "text"}
          startIcon={<Link2 size={17} />}
          onClick={() => onChangeView("relationships")}
        >
          Liên kết hiện có
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
