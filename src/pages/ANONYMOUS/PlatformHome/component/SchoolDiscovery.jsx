import React from "react"
import PropTypes from "prop-types"
import { ArrowRight, Search, SearchX } from "lucide-react"
import SchoolCard from "./SchoolCard"
import styles from "./SchoolDiscovery.module.scss"

function SchoolDiscovery({ schools = [], searchQuery = "", onSearchChange }) {
  const handleSubmit = e => {
    e.preventDefault()
  }

  return (
    <section id="schools" className={styles.section}>
      <div className={styles.container}>
        {/* Tiêu đề & Giới thiệu khu vực */}
        <div className={styles.headerArea}>
          <span className={styles.sectionBadge}>Mạng lưới giáo dục</span>
          <h2 className={styles.sectionTitle}>
            Khám phá các trường học trên FoodPrint
          </h2>
          <p className={styles.sectionSubtitle}>
            Tìm kiếm trường học để xem thông tin dinh dưỡng, quy trình chế biến
            và thực đơn bán trú được nhà trường công khai minh bạch.
          </p>
        </div>

        {/* Thanh tìm kiếm trường học lớn */}
        <div className={styles.searchBoxWrapper}>
          <form className={styles.searchForm} onSubmit={handleSubmit}>
            <div className={styles.searchIconBox}>
              <Search size={22} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm kiếm theo tên trường, quận/huyện hoặc mã cơ sở..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              aria-label="Search schools"
            />
            <button type="submit" className={styles.searchBtn}>
              <span>Tìm trường</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Lưới danh sách các trường học */}
        <div className={styles.schoolsGrid}>
          {schools.length > 0 ? (
            schools.map(school => (
              <SchoolCard key={school.id} school={school} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <SearchX size={48} color="var(--text-muted)" />
              <div className={styles.emptyTitle}>
                {searchQuery
                  ? "Không tìm thấy trường học phù hợp"
                  : "Chưa có dữ liệu trường học"}
              </div>
              <p>
                {searchQuery ? (
                  <>
                    Không có kết quả nào khớp với từ khóa "{searchQuery}". Vui
                    lòng thử tìm kiếm với tên quận hoặc tên trường khác.
                  </>
                ) : (
                  <>
                    Hiện tại hệ thống chưa có dữ liệu trường học nào được công
                    khai trên nền tảng.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

SchoolDiscovery.propTypes = {
  schools: PropTypes.array.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
}

export default SchoolDiscovery
