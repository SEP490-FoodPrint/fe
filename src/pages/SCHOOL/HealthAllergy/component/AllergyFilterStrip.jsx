import React from "react"
import SearchIcon from "@mui/icons-material/Search"
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined"
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { SCHOOL_CLASSES_MASTER } from "../mockAllergyData"
import styles from "./AllergyFilterStrip.module.scss"

export default function AllergyFilterStrip({
  search,
  setSearch,
  selectedGrade,
  setSelectedGrade,
  selectedClass,
  setSelectedClass,
  selectedCategory,
  setSelectedCategory,
  selectedSeverity,
  setSelectedSeverity,
  viewMode,
  setViewMode,
  totalResults,
  onResetFilters,
}) {
  const isFiltered =
    Boolean(search) ||
    selectedGrade !== "ALL" ||
    selectedClass !== "ALL" ||
    selectedCategory !== "ALL" ||
    selectedSeverity !== "ALL"

  // Lọc danh sách lớp theo khối đã chọn
  const availableClasses =
    selectedGrade === "ALL"
      ? SCHOOL_CLASSES_MASTER
      : SCHOOL_CLASSES_MASTER.filter((c) => c.grade === selectedGrade)

  return (
    <div className={styles.filterStripContainer}>
      <div className={styles.searchAndFilters}>
        {/* Ô tìm kiếm thông minh */}
        <div className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên học sinh (vd: Minh An), Lớp (1A, 2B), Cô giáo, Món dị ứng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearch("")}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Lọc Khối */}
        <div className={styles.selectWrapper}>
          <label htmlFor="grade-select" className={styles.selectLabel}>
            Khối:
          </label>
          <select
            id="grade-select"
            className={styles.selectInput}
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value)
              setSelectedClass("ALL")
            }}
          >
            <option value="ALL">Tất cả Khối</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>
        </div>

        {/* Lọc Lớp cụ thể */}
        <div className={styles.selectWrapper}>
          <label htmlFor="class-select" className={styles.selectLabel}>
            Lớp:
          </label>
          <select
            id="class-select"
            className={styles.selectInput}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="ALL">Tất cả Lớp</option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name} ({cls.teacherName})
              </option>
            ))}
          </select>
        </div>

        {/* Lọc Nhóm Dị Nguyên */}
        <div className={styles.selectWrapper}>
          <label htmlFor="category-select" className={styles.selectLabel}>
            Dị nguyên:
          </label>
          <select
            id="category-select"
            className={styles.selectInput}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">Tất cả Nhóm dị nguyên</option>
            <option value="Thủy hải sản">Thủy hải sản (Tôm, cua, cá)</option>
            <option value="Hạt & Khô">Hạt & Đậu phộng / Lạc</option>
            <option value="Trứng gia cầm">Trứng gia cầm</option>
            <option value="Sữa & Chế phẩm">Sữa & Chế phẩm sữa</option>
            <option value="Tinh bột">Bột mì / Gluten</option>
          </select>
        </div>

        {/* Lọc Mức độ */}
        <div className={styles.selectWrapper}>
          <label htmlFor="severity-select" className={styles.selectLabel}>
            Mức độ:
          </label>
          <select
            id="severity-select"
            className={styles.selectInput}
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            <option value="ALL">Tất cả Mức độ</option>
            <option value="HIGH">🔴 Nặng (Cần chú ý cao)</option>
            <option value="MEDIUM">🟡 Trung bình</option>
            <option value="LOW">🔵 Nhẹ</option>
          </select>
        </div>

        {/* Nút đặt lại */}
        {isFiltered && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
            title="Xóa tất cả bộ lọc"
          >
            <RestartAltIcon className={styles.resetIcon} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      <div className={styles.rightControls}>
        <div className={styles.countBadge}>
          <span>
            Tìm thấy: <strong>{totalResults} học sinh</strong>
          </span>
        </div>

        {/* Toggle Chế độ xem: Từng học sinh / Gom nhóm theo lớp */}
        <div className={styles.viewModeToggle} role="radiogroup" aria-label="Chế độ hiển thị">
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === "student"}
            className={`${styles.viewBtn} ${viewMode === "student" ? styles.active : ""}`}
            onClick={() => setViewMode("student")}
            title="Xem danh sách từng học sinh"
          >
            <FormatListBulletedOutlinedIcon className={styles.viewIcon} />
            <span>Danh sách</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === "class"}
            className={`${styles.viewBtn} ${viewMode === "class" ? styles.active : ""}`}
            onClick={() => setViewMode("class")}
            title="Gom nhóm theo từng Lớp học"
          >
            <GridViewOutlinedIcon className={styles.viewIcon} />
            <span>Theo Lớp</span>
          </button>
        </div>
      </div>
    </div>
  )
}
