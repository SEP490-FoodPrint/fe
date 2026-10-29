import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography } from "@mui/material";
import {
  UtensilsCrossed,
  ConciergeBell,
  FlaskConical,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import ROUTER from "src/router/ROUTER";
import styles from "./QuickAccessCards.module.scss";

const CARDS_DATA = [
  {
    id: "cooking-batch",
    title: "Mẻ chế biến",
    description: "Lập mẻ, kiểm tra định lượng & quy trình nấu",
    actionLabel: "Xem mẻ chế biến",
    icon: <UtensilsCrossed size={22} />,
    route: ROUTER.SCHOOL_KITCHEN_COOKING,
  },
  {
    id: "meal-allocation",
    title: "Phân bổ suất ăn",
    description: "Chia khay theo lớp & chuẩn bị bàn giao",
    actionLabel: "Đi tới phân bổ",
    icon: <ConciergeBell size={22} />,
    route: ROUTER.SCHOOL_KITCHEN_COOKING,
  },
  {
    id: "food-sample",
    title: "Mẫu lưu thực phẩm",
    description: "Lưu mẫu 24h & ghi nhận niêm phong",
    actionLabel: "Quản lý mẫu lưu",
    icon: <FlaskConical size={22} />,
    route: ROUTER.SCHOOL_KITCHEN_COOKING,
  },
  {
    id: "ingredient-inspect",
    title: "Đánh giá nguyên liệu",
    description: "Kiểm thực 3 bước & đánh giá giao nhận",
    actionLabel: "Xem đánh giá",
    icon: <ClipboardCheck size={22} />,
    route: ROUTER.SCHOOL_INGREDIENT_INSPECT,
  },
];

function QuickAccessCards() {
  const navigate = useNavigate();

  return (
    <section className={styles.cardsGrid} aria-label="Truy cập nhanh">
      {CARDS_DATA.map((card) => (
        <Card
          key={card.id}
          className={styles.cardItem}
          onClick={() => navigate(card.route)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.cardTop}>
            <div className={styles.iconBox}>{card.icon}</div>
            <Typography className={styles.cardTitle}>{card.title}</Typography>
            <Typography className={styles.cardDesc}>
              {card.description}
            </Typography>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.actionText}>{card.actionLabel}</span>
            <ArrowRight size={16} className={styles.arrowIcon} />
          </div>
        </Card>
      ))}
    </section>
  );
}

export default QuickAccessCards;
