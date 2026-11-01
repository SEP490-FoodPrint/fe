import React from "react"
import styles from "./MenuDetailAllergyCard.module.scss"

export default function MenuDetailAllergyCard({ menu }) {
  if (!menu) return null

  const hasAllergy = menu.hasAllergyMenu

  return (
    <div className={styles.allergyCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            {hasAllergy ? "health_and_safety" : "verified_user"}
          </span>
          <div>
            <h2 className={styles.cardTitle}>Phương án an toàn suất ăn dị ứng</h2>
            <p className={styles.cardSubtitle}>
              {hasAllergy
                ? "Bố trí suất ăn riêng biệt cho học sinh có tiền sử dị ứng theo hồ sơ y tế"
                : "Ca ăn đồng nhất — Không có học sinh thuộc diện ghi nhận tiền sử dị ứng"}
            </p>
          </div>
        </div>
        {hasAllergy ? (
          <div className={styles.allergyBadge}>
            <span className={styles.pulseDot}></span>
            <span>12 suất ăn riêng biệt</span>
          </div>
        ) : (
          <div className={styles.safeBadge}>
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>100% Suất thường</span>
          </div>
        )}
      </div>

      {hasAllergy ? (
        <div className={styles.allergyBody}>
          {/* Cảnh báo tác nhân và danh sách lớp ảnh hưởng */}
          <div className={styles.alertBanner}>
            <div className={styles.alertLeft}>
              <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
              <div>
                <strong className="text-slate-800 text-sm">Dị nguyên phát hiện trong thực đơn:</strong>
                <span className="text-xs text-slate-600 ml-1.5">
                  Món <strong>Tôm sú xào măng tây</strong> & <strong>Canh ngao nấu chua</strong> chứa <em>Hải sản giáp xác (Tôm/Ngao)</em>
                </span>
              </div>
            </div>
            <div className={styles.affectedClasses}>
              <span className={styles.classPill}>Lớp 6A: 07 học sinh</span>
              <span className={styles.classPill}>Lớp 7B: 05 học sinh</span>
            </div>
          </div>

          {/* Món thay thế an toàn */}
          <div className={styles.substituteBox}>
            <div className={styles.subHeader}>
              <div className={styles.subTitleWrap}>
                <span className="material-symbols-outlined text-[18px] text-[#0a8066]">restaurant</span>
                <span className={styles.subTitle}>Món ăn thay thế an toàn</span>
                <span className={styles.seasoningNote}>(Gia vị giữ nguyên theo kho nhà trường)</span>
              </div>
              <span className={styles.portionQtyTag}>Định lượng: {menu.substituteDish?.qty || "45g"}/suất</span>
            </div>

            <div className={styles.subDishContent}>
              <div className={styles.subDishMain}>
                <span className={styles.subDishLabel}>Tên món thay thế:</span>
                <span className={styles.subDishName}>{menu.substituteDish?.name || "Thịt bò xào rau củ thập cẩm"}</span>
              </div>

              <div className={styles.subIngredients}>
                <span className={styles.subDishLabel}>Nguyên liệu an toàn từ NCC liên kết:</span>
                <div className={styles.ingTags}>
                  {(menu.substituteDish?.ingredients || ["Thịt bò nạc loại 1 (Vissan VietGAP)", "Cà rốt, ngô non, đậu cô ve"]).map((ing, idx) => (
                    <div key={idx} className={styles.ingPill}>
                      <span className="material-symbols-outlined text-[13px] text-[#0a8066]">check_circle</span>
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.safeBody}>
          <div className={styles.safeIconWrap}>
            <span className="material-symbols-outlined text-[28px] text-emerald-600">check_circle</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Không có rủi ro dị ứng ghi nhận</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Thực đơn không chứa thành phần gây kích ứng với danh sách hồ sơ y tế hiện hành của học sinh ca ăn này.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
