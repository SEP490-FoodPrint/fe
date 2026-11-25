import React from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Chip,
  Paper
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import styles from "./RoundPlanDetails.module.scss"

const dishStatus = {
  WAITING_SUPPLIERS: ["Chờ nhà cung cấp", "default"],
  PLAN_FAILED: ["Lập mẻ thất bại", "error"],
  PENDING_WAREHOUSE: ["Chờ kho duyệt", "warning"],
  APPROVED: ["Đã duyệt", "success"],
  REPLAN_REQUIRED: ["Cần lập lại", "warning"],
  CANCELLED: ["Đã hủy", "default"]
}

const preparationStage = {
  LOTS_DECLARED: "Đã khai báo lô",
  PENDING_WAREHOUSE: "Chờ kho duyệt",
  TOP_UP_PENDING: "Chờ xác nhận lấy thêm",
  READY_TO_DISPATCH: "Sẵn sàng giao"
}

const quantityFormat = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 3
})

function SampleGroups({ title, groups }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {groups.length === 0 && (
        <p className={styles.note}>Chưa có phần nguyên liệu lưu mẫu.</p>
      )}
      {groups.map((group) => {
        const sources = new Map()
        for (const line of group.lines) {
          const source = line.source || line.lotCode
          const lines = sources.get(source) || []
          lines.push(line)
          sources.set(source, lines)
        }
        return (
          <Accordion
            key={JSON.stringify([
              group.ingredientName,
              group.supplierName,
              group.unit
            ])}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <span className={styles.summary}>
                <span>
                  {group.ingredientName}
                  {group.supplierName && ` · ${group.supplierName}`}
                </span>
                <strong>
                  {quantityFormat.format(group.totalQuantity)} {group.unit}
                </strong>
              </span>
            </AccordionSummary>
            <AccordionDetails>
              <ul className={styles.list}>
                {[...sources].map(([source, lines]) => (
                  <li key={source}>
                    <details>
                      <summary>
                        {source} ·{" "}
                        {quantityFormat.format(
                          lines.reduce(
                            (sum, line) => sum + Number(line.quantity),
                            0
                          )
                        )}{" "}
                        {group.unit}
                      </summary>
                      <ul className={styles.list}>
                        {lines.map((line, index) => (
                          <li
                            key={`${line.lotId}:${line.batchCode ?? line.mealType}:${index}`}
                            className={styles.row}
                          >
                            <div>
                              <strong>
                                {line.dishName
                                  ? `${line.dishName} · ${line.batchCode}`
                                  : "Gia vị dùng chung"}
                              </strong>
                              <p className={styles.note}>
                                {line.lotCode}
                                {line.sampleQuantity &&
                                  ` · Mẫu ${line.sampleQuantity} ${line.sampleUnit}`}
                              </p>
                            </div>
                            <span>
                              {line.quantity} {line.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </section>
  )
}

export default function RoundPlanDetails({ round, working, onAction }) {
  if (!round.id && round.batchNo === 2)
    return (
      <Alert severity="info">Chưa có kế hoạch mẻ Đợt 2 cho ngày này.</Alert>
    )
  if (!round.dishes.length)
    return (
      <Alert severity="info">
        Chưa có món trong thực đơn đã duyệt ngày này.
      </Alert>
    )

  return (
    <>
      <Paper component="section" variant="outlined" className={styles.panel}>
        <h2>Kế hoạch theo món</h2>
        <ul className={styles.list}>
          {round.dishes.map((dish) => {
            const [label, color] =
              dishStatus[dish.status] || dishStatus.WAITING_SUPPLIERS
            const retry = ["PLAN_FAILED", "REPLAN_REQUIRED"].includes(
              dish.status
            )
            return (
              <li key={dish.id} className={styles.row}>
                <div>
                  <strong>{dish.name}</strong>
                  {dish.waitingSuppliers.length > 0 && (
                    <p className={styles.note}>
                      Đang chờ {dish.waitingSuppliers.join(", ")}
                    </p>
                  )}
                  {dish.failureMessage && (
                    <p className={styles.error}>{dish.failureMessage}</p>
                  )}
                </div>
                <div className={styles.actions}>
                  <Chip size="small" color={color} label={label} />
                  {dish.status === "PENDING_WAREHOUSE" && dish.planVersion && (
                    <Button
                      variant="contained"
                      disabled={Boolean(working)}
                      onClick={() => onAction(dish, "approve")}
                    >
                      Duyệt món
                    </Button>
                  )}
                  {retry && (
                    <Button
                      variant="outlined"
                      disabled={Boolean(working)}
                      onClick={() => onAction(dish, "retry")}
                    >
                      Thử lập lại
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Paper>
      {round.deliveries.length > 0 && (
        <Paper component="section" variant="outlined" className={styles.panel}>
          <h2>Chuyến giao của nhà cung cấp</h2>
          <ul className={styles.list}>
            {round.deliveries.map((delivery) => (
              <li key={delivery.id} className={styles.row}>
                <strong>{delivery.supplierName}</strong>
                <span>
                  {preparationStage[delivery.preparationStage] ||
                    "Chưa có giai đoạn chuẩn bị"}
                </span>
              </li>
            ))}
          </ul>
        </Paper>
      )}
      <SampleGroups title="Lấy thêm từ nhà cung cấp" groups={round.topUps} />
      <SampleGroups title="Lấy từ kho" groups={round.fromStock} />
    </>
  )
}
