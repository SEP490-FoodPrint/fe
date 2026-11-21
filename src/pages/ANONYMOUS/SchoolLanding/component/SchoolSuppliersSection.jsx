import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Building2,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
} from "lucide-react";
import SupplierIngredientsModal from "./SupplierIngredientsModal";
import styles from "./SchoolSuppliersSection.module.scss";

export default function SchoolSuppliersSection({ suppliers, schoolName }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chỉ hiển thị các nhà cung cấp đã liên kết (status = ACTIVE)
  const activeSuppliers = (suppliers || []).filter(
    (sup) => sup.status === "ACTIVE"
  );

  const handleOpenModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSupplier(null);
    setIsModalOpen(false);
  };

  if (!suppliers || activeSuppliers.length === 0) {
    return null; // Không hiện section nếu chưa có NCC
  }

  return (
    <section
      id="nha-cung-cap"
      className={styles.section}
      aria-label="Danh sách nhà cung cấp nguyên liệu liên kết"
    >
      <div className={styles.container}>
        {/* Header căn trái, tinh gọn đồng bộ với Thực đơn tuần & Thực đơn ngày */}
        <header className={styles.header}>
          <h2 className={styles.title}>Nhà cung cấp nguyên liệu</h2>
        </header>

        {/* Danh sách dạng hàng ngang (Rows) tinh gọn */}
        <div className={styles.supplierList}>
          {activeSuppliers.map((sup) => {
            const certs = sup.certifications || [];

            return (
              <div
                key={sup.id}
                className={styles.supplierRow}
                onClick={() => handleOpenModal(sup)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleOpenModal(sup);
                  }
                }}
              >
                {/* Cột 1: Icon + Tên NCC + Trạng thái */}
                <div className={styles.colInfo}>
                  <div className={styles.iconBox}>
                    <Building2 size={24} />
                  </div>
                  <div className={styles.mainInfo}>
                    <div className={styles.statusRow}>
                      <span className={styles.linkedBadge}>
                        <CheckCircle2 size={12} />
                        Đã liên kết
                      </span>
                      {sup.taxCode && (
                        <span className={styles.taxCode}>MST: {sup.taxCode}</span>
                      )}
                    </div>
                    <h3 className={styles.supplierName}>{sup.name}</h3>
                  </div>
                </div>

                {/* Cột 2: Địa chỉ & Chứng nhận */}
                <div className={styles.colMeta}>
                  <div className={styles.contactDetails}>
                    {sup.address && (
                      <div className={styles.metaItem}>
                        <MapPin size={14} className={styles.metaIcon} />
                        <span className={styles.addressText}>{sup.address}</span>
                      </div>
                    )}
                    {sup.phone && (
                      <div className={styles.metaItem}>
                        <Phone size={14} className={styles.metaIcon} />
                        <span>{sup.phone}</span>
                      </div>
                    )}
                  </div>

                  {certs.length > 0 && (
                    <div className={styles.certRow}>
                      {certs.slice(0, 2).map((c) => (
                        <span key={c.id || c.certificateNo} className={styles.certPill}>
                          <ShieldCheck size={12} />
                          {c.certificationType}
                        </span>
                      ))}
                      {certs.length > 2 && (
                        <span className={styles.certMore}>+{certs.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Cột 3: Nút Xem chi tiết */}
                <div className={styles.colAction}>
                  <button
                    type="button"
                    className={styles.viewDetailBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(sup);
                    }}
                  >
                    <PackageCheck size={16} />
                    <span>Xem chi tiết</span>
                    <ChevronRight size={16} className={styles.chevron} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal chi tiết nguyên liệu và thống kê số liệu */}
      <SupplierIngredientsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        supplier={selectedSupplier}
      />
    </section>
  );
}

SchoolSuppliersSection.propTypes = {
  suppliers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      taxCode: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
      status: PropTypes.string,
      certifications: PropTypes.array,
      contractedIngredients: PropTypes.array,
      availableIngredients: PropTypes.array,
    })
  ),
  schoolName: PropTypes.string,
};
