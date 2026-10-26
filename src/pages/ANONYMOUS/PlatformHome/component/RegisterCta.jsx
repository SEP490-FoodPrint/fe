import React from "react"
import { Link } from "react-router-dom"
import { Building2, School } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./RegisterCta.module.scss"

function RegisterCta() {
  return (
    <section id="register" className={styles.section}>
      <div className={styles.patternOverlay} />

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <span className={styles.sectionBadge}>Tham gia hệ sinh thái</span>

          <h2 className={styles.sectionTitle}>Đồng hành cùng FoodPrint</h2>

          <p className={styles.sectionDesc}>
            Đăng ký tham gia nền tảng số để chuẩn hóa thực đơn, quản lý kiểm
            thực nguyên liệu 3 bước và minh bạch thông tin bữa ăn học đường cho
            cộng đồng phụ huynh.
          </p>

          <div className={styles.btnGroup}>
            <Link to={ROUTER.LOGIN} className={styles.schoolBtn}>
              <School size={18} />
              <span>Đăng ký trường học</span>
            </Link>

            <Link to={ROUTER.LOGIN} className={styles.supplierBtn}>
              <Building2 size={18} />
              <span>Đăng ký nhà cung cấp</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterCta
