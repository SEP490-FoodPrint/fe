import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Sun,
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import styles from "./SchoolFooter.module.scss"

function SchoolFooter({ school }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Col 1: School Info */}
          <div className={styles.schoolInfoCol}>
            <div className={styles.brandRow}>
              <div className={styles.logoBadge}>
                <Sun size={20} />
              </div>
              <span className={styles.brandName}>
                {school?.name || "Trường Tiểu học Ánh Dương"}
              </span>
            </div>

            <p className={styles.description}>
              Hệ thống quản lý suất ăn bán trú chuẩn hóa, minh bạch nguồn nguyên
              liệu và an toàn thực phẩm học đường.
            </p>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <MapPin size={16} className={styles.icon} />
                <span>{school?.address || "Hà Nội"}</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} className={styles.icon} />
                <span>{school?.hotline || school?.phone || "(024) 3756 8989"}</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} className={styles.icon} />
                <span>{school?.email || "contact@foodprint.edu.vn"}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Thực đơn Bán trú */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Thực đơn Bán trú</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#thuc-don-ngay" className={styles.link}>
                  Thực đơn hôm nay
                </a>
              </li>
              <li>
                <a href="#thuc-don-tuan" className={styles.link}>
                  Kế hoạch thực đơn tuần
                </a>
              </li>
              <li>
                <a href="#thuc-don-ngay" className={styles.link}>
                  Tháp dinh dưỡng & Calo
                </a>
              </li>
              <li>
                <a href="#gop-y" className={styles.link}>
                  Ý kiến phụ huynh & Học sinh
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Nguồn gốc & An toàn */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Nguồn gốc & An toàn</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#thuc-don-ngay" className={styles.link}>
                  Nhật ký kiểm thực 3 bước
                </a>
              </li>
              <li>
                <Link to={ROUTER.DEFAULT} className={styles.link}>
                  Danh sách đối tác cung ứng
                </Link>
              </li>
              <li>
                <a href="#thuc-don-ngay" className={styles.link}>
                  Chứng chỉ VSATTP
                </a>
              </li>
              <li>
                <a href="#gioi-thieu" className={styles.link}>
                  Quy trình bếp một chiều
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Nền tảng FoodPrint */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Nền tảng FoodPrint</h4>
            <p className={styles.platformText}>
              Giải pháp quản lý dinh dưỡng và truy xuất nguồn gốc bữa ăn trường học
              hàng đầu Việt Nam.
            </p>
            <div className={styles.platformAction}>
              <Link to={ROUTER.DEFAULT} className={styles.hubLink}>
                <span>Cổng thông tin FoodPrint Quốc Gia</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyrightText}>
            © 2026 {school?.name || "Trường Tiểu học"}. Đồng hành cùng Nền tảng
            Quản lý bữa ăn học đường FoodPrint.
          </p>
        </div>
      </div>
    </footer>
  )
}

SchoolFooter.propTypes = {
  school: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    hotline: PropTypes.string,
    email: PropTypes.string,
  }),
}

export default SchoolFooter
