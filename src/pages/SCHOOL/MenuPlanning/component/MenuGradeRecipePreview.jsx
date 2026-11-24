import InlineError from "src/components/InlineError"
import { smallQuantity } from "src/utils/quantity"
import React, { useId, useState } from "react"
import {
  NativeSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material"
import styles from "./MenuGradeRecipePreview.module.scss"

export default function MenuGradeRecipePreview({
  previews = [],
  grades = [],
  dishes = [],
  ingredientOptions = [],
  loading = false,
}) {
  const labelId = useId()
  const [gradeId, setGradeId] = useState("")
  if (previews.length < 2) return null
  const selected =
    previews.find((row) => row.gradeId === gradeId) || previews[0]
  const nameFor = (line) =>
    line.name ||
    ingredientOptions.find(
      (option) => option.ingredientId === line.ingredientId,
    )?.name ||
    dishes
      .flatMap(
        (dish) =>
          dish.ingredientDetails ||
          dish.gradeRecipes?.flatMap((profile) => profile.lines) ||
          [],
      )
      .find((row) => (row.ingredientId || row.id) === line.ingredientId)
      ?.name ||
    "Nguyên liệu"
  return (
    <section
      className={styles.preview}
      aria-label="Định lượng riêng của từng khối"
      aria-busy={loading}
    >
      <div className={styles.toolbar}>
        <label htmlFor={labelId}>Xem định lượng khối</label>
        <NativeSelect
          value={selected.gradeId}
          onChange={(event) => setGradeId(event.target.value)}
          disabled={loading}
          inputProps={{ id: labelId }}
        >
          {previews.map((row) => (
            <option key={row.gradeId} value={row.gradeId}>
              {grades.find((grade) => grade.id === row.gradeId)?.label ||
                grades.find((grade) => grade.id === row.gradeId)?.name ||
                `Khối ${previews.indexOf(row) + 1}`}
            </option>
          ))}
        </NativeSelect>
      </div>
      <p className={styles.hint}>
        Chọn món chung một lần. Mỗi khối dùng định lượng riêng cho một suất.
      </p>
      {loading ? (
        <p role="status">Đang đối chiếu công thức và dị ứng từng khối…</p>
      ) : (
        <>
          {selected.issues?.length ? (
            <InlineError messages={selected.issues} />
          ) : selected.allergies?.hasConflict ? (
            <p className={styles.warning}>
              Có nguyên liệu trùng hồ sơ dị ứng của khối này. Kiểm tra phương án
              suất riêng bên dưới.
            </p>
          ) : (
            !selected.allergies && (
              <p className={styles.warning}>
                Chưa kiểm tra được hồ sơ dị ứng của khối này.
              </p>
            )
          )}
          <TableContainer>
            <Table
              size="small"
              aria-label="Định lượng trên suất của khối đang xem"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Nguyên liệu</TableCell>
                  <TableCell align="right">Định lượng thành phẩm/suất</TableCell>
                  <TableCell>Đơn vị</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(selected.recipe?.dishes || []).map((dish) => (
                  <React.Fragment key={dish.dishId}>
                    <TableRow>
                      <TableCell colSpan={3} className={styles.dishName}>
                        {dishes.find(
                          (row) => (row.dishId || row.id) === dish.dishId,
                        )?.name || "Món ăn"}
                      </TableCell>
                    </TableRow>
                    {(dish.ingredients || []).map((line) => (
                      <TableRow key={line.ingredientId}>
                        <TableCell>{nameFor(line)}</TableCell>
                        <TableCell align="right">
                          {smallQuantity(line.quantityPerPortion, line.unit).quantity ?? "—"}
                        </TableCell>
                        <TableCell>{smallQuantity(null, line.unit).unit}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
                {!!selected.recipe?.seasonings?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className={styles.dishName}>
                      Gia vị của bữa ăn
                    </TableCell>
                  </TableRow>
                )}
                {(selected.recipe?.seasonings || []).map((line) => (
                  <TableRow key={line.ingredientEntryId || line.id}>
                    <TableCell>
                      {line.name ||
                        ingredientOptions.find(
                          (option) => option.id === line.ingredientEntryId,
                        )?.name ||
                        "Gia vị"}
                    </TableCell>
                    <TableCell align="right">
                      {smallQuantity(line.quantityPerPortion ?? line.portionQty, line.unit).quantity ?? "—"}
                    </TableCell>
                    <TableCell>{smallQuantity(null, line.unit).unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </section>
  )
}
