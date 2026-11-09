import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FormControl, MenuItem, Select, Typography } from "@mui/material";
import { QrCode, ShieldCheck, CheckCircle2 } from "lucide-react";
import { MOCK_ALLERGY_GROUPS_INTERACTIVE } from "./mockNutritionMenu";
import styles from "./AllergyPortionSection.module.scss";

function AllergyPortionSection({ specialPortionGroups, onTraceIngredient }) {
  const groups = useMemo(() => {
    if (
      Array.isArray(specialPortionGroups) &&
      specialPortionGroups.length > 0 &&
      specialPortionGroups.some((g) => g.dishes && g.dishes.length > 0)
    ) {
      return specialPortionGroups;
    }
    return MOCK_ALLERGY_GROUPS_INTERACTIVE;
  }, [specialPortionGroups]);

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [selectedDishId, setSelectedDishId] = useState("");

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || groups[0];
  }, [groups, selectedGroupId]);

  const dishes = activeGroup?.dishes || [];

  // Khi đổi nhóm dị ứng, tự động chọn món đầu tiên
  useEffect(() => {
    if (dishes.length > 0) {
      setSelectedDishId(dishes[0].id);
    }
  }, [selectedGroupId, dishes]);

  // Món đang được chọn để xem chi tiết khẩu phần
  const selectedDish = useMemo(() => {
    return dishes.find((d) => d.id === selectedDishId) || dishes[0] || null;
  }, [dishes, selectedDishId]);

  const ingredients = selectedDish?.ingredients || selectedDish?.keyIngredients || [];

  return (
    <section className={styles.allergySection}>
      <div className={styles.innerContainer}>
        <div className={styles.mainCard}>
          {/* Card Header */}
          <div className={styles.cardHeader}>
            <div className={styles.titleBadgeGroup}>
              <Typography variant="h2" className={styles.headerTitle}>
                Thực đơn thay thế cho nhóm học sinh dị ứng & Chế độ đặc biệt
              </Typography>
              <span className={styles.countBadge}>
                {groups.length} Nhóm dị ứng quản lý
              </span>
            </div>
            <p className={styles.headerSubtitle}>
              Khẩu phần ăn được điều chỉnh và chế biến tại line bếp riêng biệt, kiểm thực an toàn dị ứng thực phẩm học đường.
            </p>
          </div>

          {/* Card Body */}
          <div className={styles.cardBody}>
            {/* Filter Dropdown Row */}
            <div className={styles.filterRow}>
              <label htmlFor="allergy-group-select" className={styles.filterLabel}>
                Chọn nhóm dị ứng cần tra cứu:
              </label>
              <div className={styles.selectWrapper}>
                <FormControl fullWidth size="small">
                  <Select
                    id="allergy-group-select"
                    value={activeGroup?.id || ""}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className={styles.customSelect}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 280,
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border-default)",
                          boxShadow: "var(--shadow-md)",
                        },
                      },
                    }}
                  >
                    {groups.map((group) => (
                      <MenuItem
                        key={group.id}
                        value={group.id}
                        className={styles.menuItemOption}
                      >
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>

            {/* Content 2 Columns */}
            <div className={styles.contentGrid}>
              {/* Left Column (5/12) - Các món trong khẩu phần thay thế */}
              <div className={styles.dishListCol}>
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>
                    Các món trong khẩu phần thay thế
                  </span>
                  <span className={styles.safeDishesTag}>
                    {dishes.length} món an toàn
                  </span>
                </div>
                <div className={styles.dishList}>
                  {dishes.map((dish, idx) => {
                    const isSelected = dish.id === selectedDish?.id;
                    const isSubstitute = Boolean(dish.tag && dish.tag.includes("Thay"));

                    return (
                      <div
                        key={dish.id || idx}
                        className={`${styles.dishCard} ${
                          isSelected ? styles.dishCardActive : ""
                        } ${isSubstitute ? styles.dishCardSubstitute : ""}`}
                        onClick={() => setSelectedDishId(dish.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedDishId(dish.id);
                          }
                        }}
                      >
                        <div className={styles.dishInfo}>
                          <div className={styles.dishTitleRow}>
                            <span
                              className={`${styles.dishName} ${
                                isSelected ? styles.dishNameActive : ""
                              }`}
                            >
                              {dish.name}
                            </span>
                            {dish.tag && (
                              <span
                                className={`${styles.replaceTag} ${
                                  isSubstitute ? styles.replaceTagWarn : ""
                                }`}
                              >
                                {dish.tag}
                              </span>
                            )}
                          </div>
                          {dish.mainIngredientsText && (
                            <span className={styles.dishIngredientsBrief}>
                              ({dish.mainIngredientsText})
                            </span>
                          )}
                          <span className={styles.dishPortionText}>
                            Định lượng: <strong>{dish.portion}</strong>
                          </span>
                        </div>
                        <span
                          className={`${styles.portionBadge} ${
                            isSelected ? styles.portionBadgeActive : ""
                          }`}
                        >
                          {dish.portion}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (7/12) - Chi tiết kiểm thực & khẩu phần món đang chọn */}
              <div className={styles.ingredientCol}>
                <div className={styles.columnHeader}>
                  <div className={styles.selectedDishHeader}>
                    <span className={styles.columnTitle}>
                      Kiểm thực nguyên liệu món:
                    </span>
                    <span className={styles.selectedDishPill}>
                      {selectedDish?.name || "Món được chọn"}
                    </span>
                  </div>
                  <span className={styles.verifiedTag}>
                    <ShieldCheck size={14} />
                    <span>Đã kiểm tra dị nguyên</span>
                  </span>
                </div>

                <div className={styles.ingredientList}>
                  {ingredients.length === 0 ? (
                    <div className={styles.emptyIngredients}>
                      Món ăn này sử dụng nguyên liệu tiêu chuẩn an toàn, không có dị nguyên kiểm thực riêng biệt.
                    </div>
                  ) : (
                    ingredients.map((ing, idx) => (
                      <div key={ing.id || idx} className={styles.ingredientCard}>
                        <div className={styles.ingredientInfo}>
                          <div className={styles.ingNameRow}>
                            <span className={styles.ingredientName}>
                              {ing.name}
                            </span>
                            {ing.supplierName && (
                              <span className={styles.supplierBadge}>
                                NCC: {ing.supplierName}
                              </span>
                            )}
                          </div>
                          <span className={styles.ingredientMeta}>
                            Khẩu phần: <strong>{ing.portion}</strong> • {ing.category}
                          </span>
                          {ing.note && (
                            <span className={styles.ingNote}>
                              <CheckCircle2 size={13} className={styles.noteIcon} />
                              {ing.note}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className={styles.traceButton}
                          onClick={() => onTraceIngredient && onTraceIngredient(ing)}
                        >
                          <QrCode size={14} />
                          <span>Truy xuất</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

AllergyPortionSection.propTypes = {
  specialPortionGroups: PropTypes.array,
  onTraceIngredient: PropTypes.func,
};

AllergyPortionSection.defaultProps = {
  specialPortionGroups: [],
  onTraceIngredient: () => {},
};

export default AllergyPortionSection;
