import React from "react"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined"
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { ALLERGEN_CATEGORIES, SCHOOL_GRADES } from "../mockAllergyData"
import styles from "./AllergyFilterStrip.module.scss"

export default function AllergyFilterStrip({
  search,
  setSearch,
  selectedGrade,
  setSelectedGrade,
  selectedAllergen,
  setSelectedAllergen,
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
    selectedAllergen !== "ALL" ||
    selectedSeverity !== "ALL"

  return (
    <div className={styles.filterStripContainer}>
      <div className={styles.searchAndFilters}>
        {/* Ô tìm kiếm */}
        <div className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên Lớp (VD: 1A, Khối 2), Dị nguyên (Tôm, Lạc), GVCN..."
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

        {/* Bộ chọn Khối */}
        <div className={styles.selectWrapper}>
          <label htmlFor="grade-select" className={styles.selectLabel}>
            Khối:
          </label>
          <select
            id="grade-select"
            className={styles.selectInput}
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="ALL">Tất cả Khối (1 - 5)</option>
            {SCHOOL_GRADES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bộ chọn Nhóm Dị nguyên */}
        <div className={styles.selectWrapper}>
          <label htmlFor="allergen-select" className={styles.selectLabel}>
            Dị nguyên:
          </label>
          <select
            id="allergen-select"
            className={styles.selectInput}
            value={selectedAllergen}
            onChange={(e) => setSelectedAllergen(e.target.value)}
          >
            <option value="ALL">Tất cả Dị nguyên</option>
            {ALLERGEN_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bộ chọn Mức độ rủi ro */}
        <div className={styles.selectWrapper}>
          <label htmlFor="severity-select" className={styles.selectLabel}>
            Rủi ro:
          </label>
          <select
            id="severity-select"
            className={styles.selectInput}
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            <option value="ALL">Tất cả Mức độ</option>
            <option value="HIGH">🔴 Nguy cơ cao / Sốc phản vệ</option>
            <option value="MEDIUM">🟡 Mức độ Trung bình</option>
            <option value="LOW">🔵 Mức độ Nhẹ / Đầy hơi</option>
          </select>
        </div>

        {/* Nút Đặt lại bộ lọc */}
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
            Tìm thấy: <strong>{totalResults} lớp</strong> ghi nhận
          </span>
        </div>

        {/* Nút chuyển đổi View Chế độ Thẻ / Bảng */}
        <div className={styles.viewModeToggle} role="radiogroup" aria-label="Chế độ hiển thị">
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === "card"}
            className={`${styles.viewBtn} ${viewMode === "card" ? styles.active : ""}`}
            onClick={() => setViewMode("card")}
            title="Xem dạng thẻ theo lớp"
          >
            <GridViewOutlinedIcon className={styles.viewIcon} />
            <span>Thẻ lớp</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === "table"}
            className={`${styles.viewBtn} ${viewMode === "table" ? styles.active : ""}`}
            onClick={() => setViewMode("table")}
            title="Xem dạng bảng chi tiết"
          >
            <TableRowsOutlinedIcon className={styles.viewIcon} />
            <span>Bảng</span>
          </button>
        </div>
      </div>
    </div>
  )
}

