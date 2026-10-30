import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography } from "@mui/material";
import {
  UtensilsCrossed,
  ConciergeBell,
  FlaskConical,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./QuickAccessCards.module.scss";

const CARDS_DATA = [
  {
    id: "cooking-batch",
    title: "Mẻ chế biến",
    desc: "Lập mẻ, kiểm tra quy trình nấu",
    icon: <UtensilsCrossed size={20} />,
    route: ROUTER.SCHOOL_KITCHEN_BATCHES,
  },
  {
    id: "meal-allocation",
    title: "Phân bổ suất ăn",
    desc: "Chia khay theo lớp & bàn giao",
    icon: <ConciergeBell size={20} />,
    route: ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION,
  },
  {
    id: "food-sample",
    title: "Mẫu lưu 24h",
    desc: "Ghi nhận niêm phong mẫu lưu",
    icon: <FlaskConical size={20} />,
    route: ROUTER.SCHOOL_KITCHEN_SAMPLES,
  },
  {
    id: "ingredient-inspect",
    title: "Đánh giá nhận hàng",
    desc: "Kiểm thực 3 bước nhập kho",
    icon: <ClipboardCheck size={20} />,
    route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
  },
];

function QuickAccessCards() {
  const navigate = useNavigate();

  return (
    <section className={styles.cardsGrid} aria-label="Truy cập nhanh nghiệp vụ Bếp">
      {CARDS_DATA.map((card) => (
        <Card
          key={card.id}
          className={styles.cardItem}
          onClick={() => navigate(card.route)}
          role="button"
          tabIndex={0}
          aria-label={card.title}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate(card.route);
            }
          }}
        >
          <div className={styles.cardMain}>
            <div className={styles.iconBox} aria-hidden="true">
              {card.icon}
            </div>
            <div className={styles.cardText}>
              <Typography className={styles.cardTitle}>{card.title}</Typography>
              <Typography className={styles.cardDesc}>{card.desc}</Typography>
            </div>
          </div>
          <div className={styles.arrowBox} aria-hidden="true">
            <ChevronRight size={18} />
          </div>
        </Card>
      ))}
    </section>
  );
}

export default QuickAccessCards;
