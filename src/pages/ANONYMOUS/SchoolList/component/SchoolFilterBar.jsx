import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Search, MapPin, Building2, RotateCcw } from "lucide-react";
import { FormControl, Select, MenuItem, InputAdornment } from "@mui/material";
import styles from "./SchoolFilterBar.module.scss";

function SchoolFilterBar({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  selectedDistrict,
  onDistrictChange,
  locations = [],
  onReset,
  isLoading = false,
}) {
  // Trích xuất danh sách các Tỉnh/Thành phố (level 1 hoặc các parent)
  const cities = useMemo(() => {
    if (!Array.isArray(locations) || locations.length === 0) return [];
    
    // Nếu dữ liệu có dạng phẳng với level
    const level1 = locations.filter((loc) => loc.level === 1 || !loc.parentId);
    if (level1.length > 0) {
      return level1.map((c) => ({ id: c.id, name: c.name, code: c.code }));
    }

    // Hoặc gom nhóm theo tên parent/city
    const citySet = new Set();
    locations.forEach((loc) => {
      if (loc.parent?.name) citySet.add(loc.parent.name);
      else if (loc.name) citySet.add(loc.name);
    });
    return Array.from(citySet).map((name) => ({ id: name, name }));
  }, [locations]);

  // Trích xuất danh sách Quận/Huyện/Phường thuộc Tỉnh/Thành phố đã chọn
  const districts = useMemo(() => {
    if (!selectedCity || !Array.isArray(locations) || locations.length === 0) {
      return [];
    }

    // Tìm Tỉnh/TP được chọn
    const matchedCity = locations.find(
      (loc) =>
        (loc.level === 1 || !loc.parentId) &&
        (loc.name === selectedCity || loc.id === selectedCity)
    );

    if (matchedCity) {
      // Lấy các con có parentId trùng với matchedCity.id
      return locations
        .filter((loc) => loc.parentId === matchedCity.id)
        .map((d) => ({ id: d.id, name: d.name, code: d.code }));
    }

    // Fallback: nếu locations phẳng có trường parent
    return locations
      .filter((loc) => loc.parent?.name === selectedCity)
      .map((d) => ({ id: d.id, name: d.name, code: d.code }));
  }, [selectedCity, locations]);

  const hasFilterActive = Boolean(
    searchQuery.trim() || selectedCity || selectedDistrict
  );

  return (
    <div className={styles.filterContainer}>
      <form
        className={styles.filterGrid}
        onSubmit={(e) => e.preventDefault()}
      >
        {/* 1. Ô tìm kiếm theo từ khóa */}
        <div className={styles.searchCol}>
          <label htmlFor="schoolSearchInput" className={styles.filterLabel}>
            Tìm kiếm trường học
          </label>
          <div className={styles.inputWrapper}>
            <Search size={18} className={styles.inputIcon} />
            <input
              id="schoolSearchInput"
              type="text"
              className={styles.textInput}
              placeholder="Nhập tên trường, mã trường..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* 2. Dropdown 1: Tỉnh / Thành phố (MUI v6 Select) */}
        <div className={styles.selectCol}>
          <label id="citySelectLabel" htmlFor="citySelect" className={styles.filterLabel}>
            Tỉnh / Thành phố
          </label>
          <FormControl fullWidth size="small" className={styles.formControl}>
            <Select
              id="citySelect"
              labelId="citySelectLabel"
              value={selectedCity}
              onChange={(e) => {
                onCityChange(e.target.value);
                // Reset quận/huyện khi đổi Tỉnh/TP
                onDistrictChange("");
              }}
              displayEmpty
              disabled={isLoading}
              startAdornment={
                <InputAdornment position="start" className={styles.adornment}>
                  <Building2 size={18} className={styles.inputIcon} />
                </InputAdornment>
              }
              className={styles.muiSelect}
              MenuProps={{
                PaperProps: {
                  className: styles.dropdownPaper,
                },
              }}
            >
              <MenuItem value="" className={styles.placeholderItem}>
                Tất cả Tỉnh / Thành phố
              </MenuItem>
              {cities.map((c) => (
                <MenuItem
                  key={c.id || c.name}
                  value={c.name}
                  className={styles.menuItem}
                >
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* 3. Dropdown 2: Quận / Huyện / Phường (MUI v6 Select) */}
        <div className={styles.selectCol}>
          <label id="districtSelectLabel" htmlFor="districtSelect" className={styles.filterLabel}>
            Quận / Huyện / Phường
          </label>
          <FormControl fullWidth size="small" className={styles.formControl}>
            <Select
              id="districtSelect"
              labelId="districtSelectLabel"
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              displayEmpty
              disabled={!selectedCity || isLoading}
              startAdornment={
                <InputAdornment position="start" className={styles.adornment}>
                  <MapPin size={18} className={styles.inputIcon} />
                </InputAdornment>
              }
              className={`${styles.muiSelect} ${
                !selectedCity ? styles.disabledSelect : ""
              }`}
              MenuProps={{
                PaperProps: {
                  className: styles.dropdownPaper,
                },
              }}
            >
              <MenuItem value="" className={styles.placeholderItem}>
                {selectedCity
                  ? "Tất cả Quận / Huyện / Phường"
                  : "— Chọn Tỉnh/TP trước —"}
              </MenuItem>
              {districts.map((d) => (
                <MenuItem
                  key={d.id || d.name}
                  value={d.name}
                  className={styles.menuItem}
                >
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* 4. Nút Đặt lại bộ lọc */}
        <div className={styles.actionCol}>
          <button
            type="button"
            className={`${styles.resetBtn} ${
              !hasFilterActive ? styles.btnDisabled : ""
            }`}
            onClick={onReset}
            disabled={!hasFilterActive || isLoading}
            title="Xóa tất cả bộ lọc và tìm kiếm"
          >
            <RotateCcw size={16} />
            <span>Đặt lại</span>
          </button>
        </div>
      </form>
    </div>
  );
}

SchoolFilterBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedCity: PropTypes.string.isRequired,
  onCityChange: PropTypes.func.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  onDistrictChange: PropTypes.func.isRequired,
  locations: PropTypes.array,
  onReset: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default SchoolFilterBar;
