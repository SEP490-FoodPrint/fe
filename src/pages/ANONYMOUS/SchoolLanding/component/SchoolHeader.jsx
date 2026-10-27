import React, { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  School,
  Sun,
} from "lucide-react";
import { StoreContext } from "src/contexts";
import { getDefaultRedirectByOrg } from "src/lib/utils";
import ROUTER from "src/router/ROUTER";
import { MOCK_SCHOOLS } from "src/services/SchoolService";
import styles from "./SchoolHeader.module.scss";

function SchoolHeader({ school }) {
  const { loginStore, userStore } = useContext(StoreContext);
  const isLoginContext = loginStore?.isLoginContext;
  const user = userStore?.user;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Left: Về trang chủ & Brand trường */}
        <div className={styles.leftGroup}>
          <Link to={ROUTER.DEFAULT} className={styles.backHubLink}>
            <ArrowLeft size={16} />
            <span>FoodPrint</span>
          </Link>

          <div className={styles.separator} />

          <a href="#" className={styles.schoolBrand}>
            <div className={styles.logoBadge}>
              <Sun size={22} strokeWidth={2.2} />
            </div>
            <div className={styles.schoolMeta}>
              <span className={styles.schoolName}>
                {school?.name || "Trường Tiểu học"}
              </span>
              <span className={styles.schoolSubtext}>
                Hệ thống Bán trú FoodPrint
              </span>
            </div>
          </a>
        </div>

        {/* Center: Navigation Links */}
        <nav className={styles.navBar} aria-label="School Navigation">
          <a href="#" className={`${styles.navItem} ${styles.isActive}`}>
            Trang chủ
          </a>
          <a href="#gioi-thieu" className={styles.navItem}>
            Giới thiệu trường
          </a>
          <a href="#thuc-don-ngay" className={styles.navItem}>
            Thực đơn theo ngày
          </a>
          <a href="#thuc-don-tuan" className={styles.navItem}>
            Thực đơn theo tuần
          </a>
        </nav>

        {/* Right: School Switcher & Auth */}
        <div className={styles.rightGroup}>
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              type="button"
              className={`${styles.dropdownBtn} ${isDropdownOpen ? styles.isOpen : ""}`}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <School size={16} className={styles.schoolIcon} />
              <span className={styles.dropdownBtnText}>Chọn trường</span>
              <ChevronDown size={14} className={styles.chevronIcon} />
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownPanel}>
                <div className={styles.dropdownHeader}>
                  <span>Danh sách trường liên kết</span>
                </div>
                <div className={styles.dropdownList}>
                  {MOCK_SCHOOLS.map((item) => (
                    <Link
                      key={item.id}
                      to={`/school/${item.code}`}
                      className={`${styles.schoolOption} ${item.code === school?.code ? styles.selectedOption : ""}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className={styles.optionCode}>
                        {item.short_name}
                      </span>
                      <div className={styles.optionDetails}>
                        <span className={styles.optionName}>{item.name}</span>
                        <span className={styles.optionDistrict}>
                          {item.district}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoginContext ? (
            <Link
              to={getDefaultRedirectByOrg(user?.orgType)}
              className={styles.dashboardBtn}
            >
              <LayoutDashboard size={15} />
              <span>Bảng điều khiển</span>
            </Link>
          ) : (
            <Link to={ROUTER.LOGIN} className={styles.loginBtn}>
              <LogIn size={15} />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

SchoolHeader.propTypes = {
  school: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
    short_name: PropTypes.string,
  }),
};

export default SchoolHeader;
