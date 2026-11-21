import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import {
  X,
  Building2,
  Phone,
  MapPin,
  ShieldCheck,
  Search,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  FileCheck,
} from "lucide-react";
import styles from "./SupplierIngredientsModal.module.scss";

export default function SupplierIngredientsModal({ isOpen, onClose, supplier }) {
  // Tab 'school' = NL trường dùng từ NCC | 'supplier' = NL NCC có
  const [activeTab, setActiveTab] = useState("school");
  const [searchTerm, setSearchTerm] = useState("");

  const contracted = supplier?.contractedIngredients || [];
  const available = supplier?.availableIngredients || [];
  const certifications = supplier?.certifications || [];

  // Khóa cuộn trang và lắng nghe phím ESC khi mở modal (chạy hook vô điều kiện)
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Tạo Set id các nguyên liệu mà trường có dùng (chạy hook vô điều kiện)
  const contractedIdSet = useMemo(() => {
    return new Set(
      contracted
        .map((item) => item?.id)
        .filter(Boolean)
    );
  }, [contracted]);

  // Danh sách hiển thị theo tab
  const rawList = activeTab === "school" ? contracted : available;

  // Lọc theo từ khóa tìm kiếm (chạy hook vô điều kiện)
  const displayList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const term = searchTerm.toLowerCase();
    return rawList.filter((item) => {
      const name = (item?.name || "").toLowerCase();
      const cat = (item?.category || "").toLowerCase();
      return name.includes(term) || cat.includes(term);
    });
  }, [rawList, searchTerm]);

  // CHỈ RETURN SỚM SAU KHI TẤT CẢ CÁC HOOK ĐÃ ĐƯỢC GỌI THEO ĐÚNG NGUYÊN TẮC REACT HOOKS
  if (!isOpen || !supplier) return null;

  const modalContent = (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.titleRow}>
              <div className={styles.iconBox}>
                <Building2 size={24} />
              </div>
              <div>
                <div className={styles.badgeRow}>
                  <span className={styles.activeBadge}>
                    <CheckCircle2 size={13} />
                    Đối tác đã liên kết
                  </span>
                  {supplier.taxCode && (
                    <span className={styles.taxBadge}>MST: {supplier.taxCode}</span>
                  )}
                </div>
                <h3 className={styles.title}>{supplier.name}</h3>
              </div>
            </div>

            {/* Thông tin liên hệ & địa chỉ */}
            <div className={styles.metaRow}>
              {supplier.phone && (
                <span className={styles.metaItem}>
                  <Phone size={14} />
                  {supplier.phone}
                </span>
              )}
              {supplier.address && (
                <span className={styles.metaItem}>
                  <MapPin size={14} />
                  {supplier.address}
                </span>
              )}
            </div>

            {/* Giấy chứng nhận an toàn thực phẩm */}
            {certifications.length > 0 && (
              <div className={styles.certRow}>
                <span className={styles.certLabel}>Chứng nhận VSATTP:</span>
                <div className={styles.certTags}>
                  {certifications.map((cert) => (
                    <span key={cert.id || cert.certificateNo} className={styles.certTag}>
                      <ShieldCheck size={13} />
                      {cert.certificationType}
                      {cert.certificateNo ? ` (${cert.certificateNo})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* THỐNG KÊ SỐ LIỆU ĐƯA VÀO BÊN TRONG CHI TIẾT */}
        <div className={styles.statsStrip}>
          <div className={styles.statCardPrimary}>
            <div className={styles.statIconWrap}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.statDetails}>
              <span className={styles.statVal}>{contracted.length}</span>
              <span className={styles.statName}>Nguyên liệu trường chọn dùng</span>
            </div>
          </div>

          <div className={styles.statCardSecondary}>
            <div className={styles.statIconWrap}>
              <Layers size={20} />
            </div>
            <div className={styles.statDetails}>
              <span className={styles.statVal}>{available.length}</span>
              <span className={styles.statName}>Tổng mặt hàng NCC cung cấp</span>
            </div>
          </div>

          <div className={styles.statCardNeutral}>
            <div className={styles.statIconWrap}>
              <FileCheck size={20} />
            </div>
            <div className={styles.statDetails}>
              <span className={styles.statVal}>{certifications.length}</span>
              <span className={styles.statName}>Chứng nhận ATTP kiểm định</span>
            </div>
          </div>
        </div>

        {/* 2 Nút lọc: NL NCC có vs NL trường dùng từ NCC */}
        <div className={styles.filterSection}>
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "school" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("school")}
            >
              <CheckCircle2 size={16} />
              <span>NL trường dùng từ NCC</span>
              <span className={styles.counterBadge}>{contracted.length}</span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "supplier" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("supplier")}
            >
              <Layers size={16} />
              <span>Tất cả NL NCC đang có</span>
              <span className={styles.counterBadge}>{available.length}</span>
            </button>
          </div>

          {/* Ô tìm kiếm nhanh */}
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm theo tên nguyên liệu, loại thực phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Thân danh sách nguyên liệu */}
        <div className={styles.contentBody}>
          <div className={styles.guideNote}>
            {activeTab === "school" ? (
              <p>
                <Sparkles size={14} className={styles.guideIcon} />
                Danh sách các mặt hàng nguyên liệu nhà trường <strong>đã chọn và ký hợp đồng cung ứng</strong> phục vụ bữa ăn bán trú cho học sinh.
              </p>
            ) : (
              <p>
                <Package size={14} className={styles.guideIcon} />
                Toàn bộ danh mục nguyên liệu đạt chuẩn mà nhà cung cấp đang phân phối trên hệ thống.
              </p>
            )}
          </div>

          {displayList.length === 0 ? (
            <div className={styles.emptyBox}>
              <Package size={40} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {searchTerm
                  ? `Không tìm thấy nguyên liệu nào khớp với từ khóa "${searchTerm}"`
                  : activeTab === "school"
                  ? "Chưa có danh sách nguyên liệu được ký kết hợp đồng."
                  : "Nhà cung cấp chưa cập nhật danh mục nguyên liệu."}
              </p>
            </div>
          ) : (
            <div className={styles.ingredientGrid}>
              {displayList.map((item, idx) => {
                const isUsedBySchool = item?.id && contractedIdSet.has(item.id);
                return (
                  <div key={item?.id || idx} className={styles.ingredientCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.categoryBadge}>
                        {item?.category || "Thực phẩm"}
                      </span>
                      {activeTab === "school" ? (
                        <span className={styles.inUseBadge}>
                          <CheckCircle2 size={12} />
                          Đang dùng cho trường
                        </span>
                      ) : isUsedBySchool ? (
                        <span className={styles.inUseBadge}>
                          <CheckCircle2 size={12} />
                          Trường đang dùng
                        </span>
                      ) : (
                        <span className={styles.catalogBadge}>Mặt hàng NCC có</span>
                      )}
                    </div>

                    <h4 className={styles.ingredientName}>{item?.name || "Nguyên liệu"}</h4>

                    <div className={styles.cardMeta}>
                      <span className={styles.unitBadge}>
                        Đơn vị tính: <strong>{item?.unit || "kg"}</strong>
                      </span>
                      {item?.handlingType && (
                        <span className={styles.handlingBadge}>
                          {item.handlingType === "DIRECT_USE"
                            ? "Dùng ngay trong ngày"
                            : "Bảo quản kho"}
                        </span>
                      )}
                    </div>

                    {item?.description && (
                      <p className={styles.description}>{item.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <span className={styles.footerSummary}>
            Hiển thị <strong>{displayList.length}</strong> / {rawList.length} nguyên liệu
          </span>
          <button type="button" className={styles.closeModalBtn} onClick={onClose}>
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

SupplierIngredientsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  supplier: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    taxCode: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    status: PropTypes.string,
    certifications: PropTypes.array,
    contractedIngredients: PropTypes.array,
    availableIngredients: PropTypes.array,
  }),
};
