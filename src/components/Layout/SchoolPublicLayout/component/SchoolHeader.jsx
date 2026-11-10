import React, { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  LogIn,
  School,
  Sun,
} from "lucide-react";
import { StoreContext } from "src/contexts";
import PublicAccountMenu from "src/components/Common/PublicAccountMenu";
import { NO_DATA_TEXT } from "src/constants/ui";
import ROUTER from "src/router/ROUTER";
import SchoolService from "src/services/SchoolService";
import styles from "./SchoolHeader.module.scss";

function SchoolHeader({ school }) {
  const { loginStore } = useContext(StoreContext);
  const isLoginContext = loginStore?.isLoginContext;
  const location = useLocation();

  const isDailyMenuPage = location.pathname.includes("/daily-menu");
  const schoolCode = school?.code || "";

  const [schools, setSchools] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Nạp danh sách trường học từ API /schools/public
  useEffect(() => {
    let isMounted = true;
    const fetchSchools = async () => {
      try {
        const res = await SchoolService.getPublicSchools();
        if (isMounted) {
          const schoolList = Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.data?.items) ? res.data.items : []);
          setSchools(schoolList);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách trường ở school header:", err);
      }
    };
    fetchSchools();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const homeHref = isDailyMenuPage ? `/school/${schoolCode}` : "#";
  const dailyHref = `/school/${schoolCode}/daily-menu`;

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

          <Link to={`/school/${schoolCode}`} className={styles.schoolBrand}>
            <div className={styles.logoBadge}>
              <Sun size={22} strokeWidth={2.2} />
            </div>
            <div className={styles.schoolMeta}>
              <span className={styles.schoolName}>
                {school?.name || NO_DATA_TEXT}
              </span>
              <span className={styles.schoolSubtext}>
                Hệ thống Bán trú FoodPrint
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className={styles.navBar} aria-label="School Navigation">
          <a
            href={homeHref}
            className={`${styles.navItem} ${!isDailyMenuPage ? styles.isActive : ""}`}
          >
            Trang chủ
          </a>
          <Link
            to={dailyHref}
            className={`${styles.navItem} ${isDailyMenuPage ? styles.isActive : ""}`}
          >
            Thực đơn
          </Link>
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
                  {schools.map((item) => {
                    const targetTo = isDailyMenuPage
                      ? `/school/${item.code}/daily-menu${location.search}`
                      : `/school/${item.code}`;

                    return (
                      <Link
                        key={item.id}
                        to={targetTo}
                        className={`${styles.schoolOption} ${item.code === schoolCode ? styles.selectedOption : ""}`}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className={styles.optionCode}>
                          {item.shortName || item.short_name || item.code?.slice(0, 2) || "TH"}
                        </span>
                        <div className={styles.optionDetails}>
                          <span className={styles.optionName}>{item.name}</span>
                          <span className={styles.optionDistrict}>
                            {item.district
                              ? `${item.district}, ${item.city || NO_DATA_TEXT}`
                              : item.address || NO_DATA_TEXT}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Info */}
          {isLoginContext ? (
            <PublicAccountMenu />
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
    logoUrl: PropTypes.string,
  }),
};

SchoolHeader.defaultProps = {
  school: null,
};

export default SchoolHeader;
