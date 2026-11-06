import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FormControl, MenuItem, Select, Typography } from "@mui/material";
import { QrCode, ShieldCheck } from "lucide-react";
import styles from "./AllergyPortionSection.module.scss";

const DEFAULT_ALLERGY_GROUPS = [
  {
    id: "poultry",
    name: "Dị ứng thịt gà & Gia cầm (Đang áp dụng thực đơn thay thế)",
    shortName: "Dị ứng thịt gà & Gia cầm",
    dishes: [
      {
        id: "d1",
        name: "Thịt heo nạc rim mật mía",
        portion: "85 g",
        tag: "Thay món gà",
      },
      {
        id: "d2",
        name: "Cơm trắng dẻo (Gạo tám thơm)",
        portion: "200 g",
      },
      {
        id: "d3",
        name: "Canh rau ngót nấu thịt nạc băm",
        portion: "180 ml",
      },
      {
        id: "d4",
        name: "Rau cải thìa luộc & Dưa hấu tráng miệng",
        portion: "180 g",
      },
    ],
    keyIngredients: [
      {
        id: "ing-1",
        name: "Thịt mông heo tươi an toàn",
        portion: "80 g",
        category: "Nhóm: Thịt tươi sống",
      },
      {
        id: "ing-2",
        name: "Mật mía Nghệ An & Nước mắm truyền thống",
        portion: "5 ml",
        category: "Không chất bảo quản",
      },
    ],
  },
  {
    id: "seafood",
    name: "Dị ứng hải sản & Giáp xác (Tôm, Cua, Mực)",
    shortName: "Dị ứng hải sản & Giáp xác",
    dishes: [
      {
        id: "d5",
        name: "Thịt bò xào rau củ tươi",
        portion: "90 g",
        tag: "Thay hải sản",
      },
      {
        id: "d6",
        name: "Cơm trắng dẻo",
        portion: "200 g",
      },
      {
        id: "d7",
        name: "Canh bí đỏ thịt bằm",
        portion: "180 ml",
      },
      {
        id: "d8",
        name: "Chuối tiêu tráng miệng",
        portion: "100 g",
      },
    ],
    keyIngredients: [
      {
        id: "ing-3",
        name: "Thịt bò nạc tươi sạch",
        portion: "80 g",
        category: "Nhóm: Thịt tươi sống",
      },
      {
        id: "ing-4",
        name: "Rau củ hữu cơ chuẩn VietGAP",
        portion: "50 g",
        category: "Rau an toàn",
      },
    ],
  },
  {
    id: "egg-milk",
    name: "Dị ứng trứng & Sữa bò",
    shortName: "Dị ứng trứng & Sữa bò",
    dishes: [
      {
        id: "d9",
        name: "Thịt nạc kho tiêu đậu hũ",
        portion: "85 g",
        tag: "Thay món trứng",
      },
      {
        id: "d10",
        name: "Cơm trắng dẻo",
        portion: "200 g",
      },
      {
        id: "d11",
        name: "Canh rau mồng tơi nấu ngao sạch",
        portion: "180 ml",
      },
      {
        id: "d12",
        name: "Trái cây mùa tráng miệng",
        portion: "120 g",
      },
    ],
    keyIngredients: [
      {
        id: "ing-5",
        name: "Thịt heo sạch truy xuất nguồn gốc",
        portion: "85 g",
        category: "Nhóm: Thịt tươi sống",
      },
    ],
  },
  {
    id: "peanut-nuts",
    name: "Dị ứng đậu phộng & Các loại hạt ngũ cốc",
    shortName: "Dị ứng đậu phộng & Hạt ngũ cốc",
    dishes: [
      {
        id: "d13",
        name: "Khẩu phần tiêu chuẩn loại trừ các loại hạt và dầu lạc",
        portion: "Chuẩn",
      },
    ],
    keyIngredients: [
      {
        id: "ing-6",
        name: "Dầu ăn thực vật tinh luyện 100% không chứa lạc",
        portion: "10 ml",
        category: "Dầu đậu nành an toàn",
      },
    ],
  },
];

function AllergyPortionSection({ specialPortionGroups, onTraceIngredient }) {
  const groups = useMemo(() => {
    if (specialPortionGroups && specialPortionGroups.length > 0) {
      return specialPortionGroups.map((g) => ({
        id: g.id,
        name: g.name,
        dishes: g.dishes || [],
        keyIngredients: g.keyIngredients || [],
      }));
    }
    return DEFAULT_ALLERGY_GROUPS;
  }, [specialPortionGroups]);

  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");

  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || groups[0];
  }, [groups, selectedGroupId]);

  const dishes = activeGroup?.dishes || [];
  const keyIngredients = activeGroup?.keyIngredients || [];

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
              {/* Left Column (5/12) */}
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
                    const isSubstitute = Boolean(dish.tag);
                    return (
                      <div
                        key={dish.id || idx}
                        className={`${styles.dishCard} ${
                          isSubstitute ? styles.dishCardPrimary : ""
                        }`}
                      >
                        <div className={styles.dishInfo}>
                          <div className={styles.dishTitleRow}>
                            <span className={styles.dishName}>{dish.name}</span>
                            {dish.tag && (
                              <span className={styles.replaceTag}>
                                {dish.tag}
                              </span>
                            )}
                          </div>
                          <span className={styles.dishPortionText}>
                            Định lượng khẩu phần: <strong>{dish.portion}</strong>
                          </span>
                        </div>
                        <span className={styles.portionBadge}>
                          {dish.portion}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (7/12) */}
              <div className={styles.ingredientCol}>
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>
                    Kiểm thực nguyên liệu món thay thế chính
                  </span>
                  <span className={styles.verifiedTag}>
                    <ShieldCheck size={14} />
                    <span>Đã kiểm tra dị nguyên</span>
                  </span>
                </div>
                <div className={styles.ingredientList}>
                  {keyIngredients.map((ing, idx) => (
                    <div key={ing.id || idx} className={styles.ingredientCard}>
                      <div className={styles.ingredientInfo}>
                        <span className={styles.ingredientName}>{ing.name}</span>
                        <span className={styles.ingredientMeta}>
                          Khẩu phần: <strong>{ing.portion}</strong> • {ing.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={styles.traceButton}
                        onClick={() => onTraceIngredient && onTraceIngredient(ing)}
                      >
                        <QrCode size={14} />
                        <span>Truy xuất nguồn gốc</span>
                      </button>
                    </div>
                  ))}
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
