import React, { useState, useEffect, useCallback, useMemo } from "react";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import SampleStorageService from "src/services/SampleStorageService";
import CreateStorageModal from "./component/CreateStorageModal";
import EditStorageModal from "./component/EditStorageModal";
import StorageDetailModal from "./component/StorageDetailModal";
import DeleteStorageConfirmModal from "./component/DeleteStorageConfirmModal";
import styles from "./index.module.scss";

export default function SampleStorage() {
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState({
    totalUnits: 0,
    activeUnits: 0,
    maintenanceUnits: 0,
    inactiveUnits: 0,
    totalCapacity: 0,
    totalStoredSamples: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await SampleStorageService.getSampleStorageUnits(params);
      const data = res.data?.data || res.data;
      if (data) {
        setUnits(data.items || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách tủ lưu mẫu từ hệ thống.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleOpenDetail = (unit) => {
    setSelectedUnit(unit);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (unit) => {
    setSelectedUnit(unit);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (unit) => {
    setSelectedUnit(unit);
    setIsDeleteOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchUnits();
  };

  const handleEditSuccess = () => {
    fetchUnits();
  };

  const handleDeleteSuccess = () => {
    fetchUnits();
  };

  const renderStatusPill = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className={`${styles.statusPill} ${styles.statusPillActive}`}>
            <span className={styles.statusDot} />
            Đang hoạt động
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className={`${styles.statusPill} ${styles.statusPillMaintenance}`}>
            <span className={styles.statusDot} />
            Đang bảo trì
          </span>
        );
      case "INACTIVE":
        return (
          <span className={`${styles.statusPill} ${styles.statusPillInactive}`}>
            <span className={styles.statusDot} />
            Ngừng sử dụng
          </span>
        );
      default:
        return <span className={styles.statusPill}>{status}</span>;
    }
  };

  const getProgressClass = (occupancyRate) => {
    if (occupancyRate >= 90) return styles.progressFull;
    if (occupancyRate >= 70) return styles.progressModerate;
    return styles.progressNormal;
  };

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>
            <KitchenOutlinedIcon className={styles.titleIcon} />
            Danh sách tủ lưu mẫu
          </h1>
          <p className={styles.pageSubtitle}>
            Quản lý Master Data các tủ lưu mẫu thức ăn chuyên dụng phục vụ kiểm thực 3 bước và lưu
            mẫu tối thiểu 24h theo QĐ 1246/QĐ-BYT
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setIsCreateOpen(true)}
          >
            <AddOutlinedIcon fontSize="small" />
            Thêm tủ lưu mẫu
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS STRIP */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconBlue}`}>
            <KitchenOutlinedIcon />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiNumber}>{stats.totalUnits}</span>
            <span className={styles.kpiLabel}>Tổng số tủ lưu mẫu</span>
            <span className={styles.kpiSub}>Cấu hình tại nhà trường</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconGreen}`}>
            <CheckCircleOutlineOutlinedIcon />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiNumber}>{stats.activeUnits}</span>
            <span className={styles.kpiLabel}>Đang hoạt động tốt</span>
            <span className={styles.kpiSub}>Sẵn sàng tiếp nhận mẫu</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconAmber}`}>
            <BuildOutlinedIcon />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiNumber}>{stats.maintenanceUnits}</span>
            <span className={styles.kpiLabel}>Đang bảo trì / Kiểm định</span>
            <span className={styles.kpiSub}>Tạm ngưng nhận mẫu mới</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiIconPurple}`}>
            <ScienceOutlinedIcon />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiNumber}>{stats.totalCapacity} mẫu</span>
            <span className={styles.kpiLabel}>Tổng sức chứa toàn bếp</span>
            <span className={styles.kpiSub}>
              Đang bảo quản {stats.totalStoredSamples} mẫu thức ăn
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className={styles.filterStrip}>
        <div className={styles.filterLeft}>
          <div className={styles.searchBox}>
            <SearchOutlinedIcon className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên tủ, vị trí đặt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.statusFilterTabs}>
            <button
              type="button"
              className={`${styles.statusTab} ${
                statusFilter === "ALL" ? styles.statusTabActive : ""
              }`}
              onClick={() => setStatusFilter("ALL")}
            >
              Tất cả ({stats.totalUnits})
            </button>
            <button
              type="button"
              className={`${styles.statusTab} ${
                statusFilter === "ACTIVE" ? styles.statusTabActive : ""
              }`}
              onClick={() => setStatusFilter("ACTIVE")}
            >
              Hoạt động ({stats.activeUnits})
            </button>
            <button
              type="button"
              className={`${styles.statusTab} ${
                statusFilter === "MAINTENANCE" ? styles.statusTabActive : ""
              }`}
              onClick={() => setStatusFilter("MAINTENANCE")}
            >
              Bảo trì ({stats.maintenanceUnits})
            </button>
            <button
              type="button"
              className={`${styles.statusTab} ${
                statusFilter === "INACTIVE" ? styles.statusTabActive : ""
              }`}
              onClick={() => setStatusFilter("INACTIVE")}
            >
              Ngừng dùng ({stats.inactiveUnits})
            </button>
          </div>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={fetchUnits}
          title="Tải lại dữ liệu"
        >
          <RefreshOutlinedIcon fontSize="small" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            color: "#991b1b",
            marginBottom: 16,
            fontSize: 13.5,
          }}
        >
          <WarningAmberOutlinedIcon fontSize="small" />
          <span>{error}</span>
        </div>
      )}

      {/* DATA TABLE */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ minWidth: 240 }}>Tên tủ lưu mẫu</th>
                <th style={{ minWidth: 200 }}>Vị trí khu bếp</th>
                <th style={{ width: 180 }}>Nhiệt độ quy chuẩn</th>
                <th style={{ width: 180 }}>Sức chứa</th>
                <th style={{ width: 150 }}>Trạng thái</th>
                <th style={{ width: 100, textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && units.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                    Đang tải danh sách tủ lưu mẫu...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      <KitchenOutlinedIcon className={styles.emptyIcon} />
                      <p className={styles.emptyTitle}>Chưa có tủ lưu mẫu nào</p>
                      <p className={styles.emptyText}>
                        Không tìm thấy dữ liệu tủ lưu mẫu phù hợp với bộ lọc hiện tại. Bấm nút "Thêm tủ
                        lưu mẫu" để bắt đầu khai báo.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr key={unit.id}>
                    {/* Tên tủ */}
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.unitName}>{unit.name}</span>
                      </div>
                    </td>

                    {/* Vị trí khu bếp */}
                    <td>
                      <div className={styles.locationCell}>
                        <LocationOnOutlinedIcon className={styles.locationIcon} />
                        <span>{unit.location}</span>
                      </div>
                    </td>

                    {/* Dải nhiệt độ & Nhiệt độ hiện tại */}
                    <td>
                      <div className={styles.tempCell}>
                        <span className={styles.tempBadge}>
                          <ThermostatOutlinedIcon style={{ fontSize: 14 }} />
                          {unit.temperatureRange}
                        </span>
                        {unit.currentTemperature !== null && (
                          <span
                            className={`${styles.currentTempText} ${
                              unit.currentTemperature > 8
                                ? styles.currentTempWarn
                                : styles.currentTempOk
                            }`}
                          >
                            Hiện tại: {unit.currentTemperature}°C
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sức chứa */}
                    <td>
                      <div className={styles.capacityCell}>
                        <div className={styles.capacityNumbers}>
                          <span>
                            <strong>{unit.currentUsage}</strong> / {unit.capacity} mẫu
                          </span>
                          <span className={styles.capacityMeta}>
                            {unit.compartmentCount} ngăn
                          </span>
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={`${styles.progressFill} ${getProgressClass(
                              unit.occupancyRate,
                            )}`}
                            style={{ width: `${Math.min(100, unit.occupancyRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td>{renderStatusPill(unit.status)}</td>

                    {/* Thao tác */}
                    <td>
                      <div className={styles.actionGroup} style={{ justifyContent: "center" }}>
                        {/* Nút Xem chi tiết: icon mắt không viền, đen trắng */}
                        <button
                          type="button"
                          className={styles.actionViewBtn}
                          onClick={() => handleOpenDetail(unit)}
                          title="Xem chi tiết tủ lưu mẫu"
                          aria-label="Xem chi tiết"
                        >
                          <RemoveRedEyeOutlinedIcon fontSize="small" />
                        </button>

                        {/* Nút Xóa */}
                        <button
                          type="button"
                          className={styles.actionDeleteBtn}
                          onClick={() => handleOpenDelete(unit)}
                          title="Xóa tủ lưu mẫu"
                          aria-label="Xóa"
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <CreateStorageModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditStorageModal
        unit={selectedUnit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUnit(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <StorageDetailModal
        unitId={selectedUnit?.id}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedUnit(null);
        }}
        onEdit={handleOpenEdit}
      />

      <DeleteStorageConfirmModal
        unit={selectedUnit}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUnit(null);
        }}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

