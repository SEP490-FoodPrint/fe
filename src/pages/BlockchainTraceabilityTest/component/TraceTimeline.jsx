import React from "react"
import { Box, Typography, Stack, Chip } from "@mui/material"
import { Truck, Package, UtensilsCrossed, School } from "lucide-react"
import styles from "./TraceTimeline.module.scss"

export default function TraceTimeline({ traceData }) {
  if (!traceData) return null

  const { allocation, cookingBatches, ingredients, deliveries } = traceData

  return (
    <Box className={styles.timelineCard}>
      <Typography variant="h6" sx={{ mb: "var(--space-3)", color: "var(--text-primary)" }}>
        Hành trình Chuỗi Cung Ứng Thực Phẩm
      </Typography>

      {/* 1. Delivery & Supplier */}
      <Box className={styles.stepBlock}>
        <Box className={styles.stepDot} />
        <Stack direction="row" spacing="var(--space-1)" alignItems="center">
          <Truck size={18} color="var(--color-primary)" />
          <Typography className={styles.stepTitle}>1. Nguồn cung & Nhập hàng</Typography>
        </Stack>
        <Box className={styles.stepContent}>
          {deliveries.length === 0 ? (
            <Typography className={styles.infoLine}>Không có thông tin chuyến giao trực tiếp.</Typography>
          ) : (
            deliveries.map((del) => (
              <Box key={del.deliveryId} sx={{ mb: "var(--space-2)" }}>
                <Typography className={styles.infoLine}>
                  Nhà cung cấp: <strong>{del.supplierName}</strong>
                </Typography>
                <Typography className={styles.infoLine}>
                  Số chuyến / Đơn giao: <strong>{del.deliveryNo}</strong> · Biển số xe: {del.vehiclePlate || "N/A"}
                </Typography>
                <Typography className={styles.infoLine}>
                  Thời gian nhận: {del.receivedAt ? new Date(del.receivedAt).toLocaleString("vi-VN") : "Đang giao"}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* 2. Ingredients & Lots */}
      <Box className={styles.stepBlock}>
        <Box className={styles.stepDot} />
        <Stack direction="row" spacing="var(--space-1)" alignItems="center">
          <Package size={18} color="var(--color-primary)" />
          <Typography className={styles.stepTitle}>2. Lô nguyên liệu tại kho</Typography>
        </Stack>
        <Box className={styles.stepContent}>
          {ingredients.length === 0 ? (
            <Typography className={styles.infoLine}>Không có dữ liệu lô nguyên liệu tương ứng.</Typography>
          ) : (
            <Stack spacing="var(--space-2)">
              {ingredients.map((ing) => (
                <Box key={ing.lotId} sx={{ borderBottom: "1px dashed var(--border-default)", pb: "var(--space-1)" }}>
                  <Typography className={styles.infoLine}>
                    Nguyên liệu: <strong>{ing.ingredientName}</strong> · Số lượng:{" "}
                    <strong>
                      {ing.quantityUsed} {ing.unit}
                    </strong>
                  </Typography>
                  <Typography className={styles.infoLine}>
                    Mã lô: <code>{ing.lotCode}</code> · NCC: {ing.supplierName}
                  </Typography>
                  {ing.sourceFacility && (
                    <Typography className={styles.infoLine}>Cơ sở sản xuất: {ing.sourceFacility}</Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      {/* 3. Cooking Batches & Samples */}
      <Box className={styles.stepBlock}>
        <Box className={styles.stepDot} />
        <Stack direction="row" spacing="var(--space-1)" alignItems="center">
          <UtensilsCrossed size={18} color="var(--color-primary)" />
          <Typography className={styles.stepTitle}>3. Chế biến tại bếp & Lưu mẫu</Typography>
        </Stack>
        <Box className={styles.stepContent}>
          {cookingBatches.length === 0 ? (
            <Typography className={styles.infoLine}>Chưa có thông tin lô nấu.</Typography>
          ) : (
            cookingBatches.map((cb) => (
              <Box key={cb.cookingBatchId} sx={{ mb: "var(--space-2)" }}>
                <Typography className={styles.infoLine}>
                  Mã mẻ nấu: <strong>{cb.batchCode}</strong> · Bữa:{" "}
                  {cb.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"} · Kế hoạch: {cb.plannedPortions} suất
                </Typography>
                <Typography className={styles.infoLine}>
                  Món ăn:{" "}
                  {cb.dishes.map((d) => d.dishName).join(", ")}
                </Typography>
                {cb.dishes.some((d) => d.retainedSample) && (
                  <Chip
                    label="Đã lưu mẫu thức ăn kiểm nghiệm"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ mt: "var(--space-1)" }}
                  />
                )}
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* 4. Meal Allocation & Distribution */}
      <Box className={styles.stepBlock}>
        <Box className={styles.stepDot} />
        <Stack direction="row" spacing="var(--space-1)" alignItems="center">
          <School size={18} color="var(--color-primary)" />
          <Typography className={styles.stepTitle}>4. Phân phối đến học sinh</Typography>
        </Stack>
        <Box className={styles.stepContent}>
          <Typography className={styles.infoLine}>
            Lớp học: <strong>{allocation.className}</strong>
          </Typography>
          <Typography className={styles.infoLine}>
            Ngày ăn: <strong>{allocation.mealDate}</strong> · Bữa:{" "}
            {allocation.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"} · Số suất:{" "}
            <strong>{allocation.totalPortions}</strong>
          </Typography>
          <Typography className={styles.infoLine}>
            Trạng thái phân phối: <Chip label={allocation.status} size="small" color="primary" />
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
