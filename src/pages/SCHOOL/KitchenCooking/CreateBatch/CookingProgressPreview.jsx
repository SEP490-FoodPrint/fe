import React, { useState } from "react";
import CreateBatchHeader from "./component/CreateBatchHeader";
import CreateBatchSeparateHeader from "../CreateBatchSeparate/component/CreateBatchSeparateHeader";
import CreateBatchKanban from "./component/CreateBatchKanban";
import CreateBatchDetailModal from "./component/CreateBatchDetailModal";
import styles from "./index.module.scss";

const sampleBatches = [
  { id: "demo-cooking-1", batchCode: "ME-001", name: "Thịt gà kho gừng", mealType: "lunch", mealName: "Bữa trưa", status: "CONFIRMED", plannedPortions: 60, confirmedAt: new Date().toISOString(), dishes: [{ dishId: "chicken", name: "Thịt gà kho gừng" }], ingredients: [{ id: "chicken-1", name: "Thịt gà", code: "NL-GA-01", amount: "6 kg" }], retainedFoodSamples: [] },
  { id: "demo-cooking-2", batchCode: "ME-002", name: "Thịt gà kho gừng", mealType: "lunch", mealName: "Bữa trưa", status: "CONFIRMED", plannedPortions: 40, confirmedAt: new Date().toISOString(), dishes: [{ dishId: "chicken", name: "Thịt gà kho gừng" }], ingredients: [{ id: "chicken-2", name: "Thịt gà", code: "NL-GA-02", amount: "4 kg" }], retainedFoodSamples: [] },
  { id: "demo-cooked", batchCode: "ME-003", name: "Canh rau củ", mealType: "lunch", mealName: "Bữa trưa", status: "COMPLETED", plannedPortions: 100, completedAt: new Date().toISOString(), dishes: [{ dishId: "soup", name: "Canh rau củ" }], ingredients: [{ id: "carrot", name: "Cà rốt", code: "NL-CAROT-01", amount: "5 kg" }], retainedFoodSamples: [] },
  { id: "demo-sampled", batchCode: "ME-004", name: "Chuối tráng miệng", mealType: "afternoon", mealName: "Bữa xế", status: "COMPLETED", plannedPortions: 100, completedAt: new Date().toISOString(), dishes: [{ dishId: "banana", name: "Chuối tráng miệng" }], ingredients: [], retainedFoodSamples: [{ dishId: "banana", sampledAt: new Date().toISOString(), quantity: "150", unit: "g" }] },
];
const previewGrades = [{ id: "g1", name: "Khối lớp 1–3" }, { id: "g2", name: "Khối lớp 4–5" }];
const previewMenus = [{ id: "menu1", gradeIds: ["g1"] }, { id: "menu2", gradeIds: ["g2"] }];

export default function CookingProgressPreview({ separate = false }) {
  const Header = separate ? CreateBatchSeparateHeader : CreateBatchHeader;
  const [meal, setMeal] = useState("all");
  const [grade, setGrade] = useState("g1");
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState("");
  const pending = [{ id: "demo-pending", dishId: "vegetables", name: "Rau muống xào tỏi", mealType: "lunch", mealName: "Bữa trưa", portionStandard: 100 }];
  const explain = () => setMessage("Đây là dữ liệu xem thử; thao tác này không gửi lên hệ thống.");
  return <div className={styles.createBatchContainer}><div className={styles.formContainer}>
    <Header title="Tiến độ chế biến" subtitle="Khởi tạo lô và theo dõi quy trình chế biến món ăn trong ngày" />
    <p role="status">Dữ liệu xem thử — không ghi vào cơ sở dữ liệu. Bỏ <code>?preview=1</code> khỏi đường dẫn để quay lại dữ liệu thật.</p>
    {message && <p role="status">{message}</p>}
    <CreateBatchKanban pendingDishes={grade === "g1" ? pending : []} batches={grade === "g1" ? sampleBatches : sampleBatches.slice(2)} mealRequirements={{ LUNCH: { portions: 100 }, AFTERNOON: { portions: 100 } }} selectedMeal={meal} onSelectMeal={setMeal} grades={previewGrades} gradeMenus={previewMenus} gradeValue={grade} gradeMenuId={grade === "g1" ? "menu1" : "menu2"} onGradeChange={(_menuId, gradeId) => setGrade(gradeId)} onOpenDetail={setDetail} onOpenPlanModal={explain} onOpenSampleModal={explain} onCompleteCooking={explain} />
    <CreateBatchDetailModal open={Boolean(detail)} onClose={() => setDetail(null)} item={detail} onCompleteCooking={explain} onOpenSampleModal={explain} onViewBatchDetail={explain} />
  </div></div>;
}
