import React, { useRef, useState } from "react"
import { Button, Card, CircularProgress } from "@mui/material"
import { ImageUp, Trash2 } from "lucide-react"
import notice from "src/components/Notice"
import SchoolService from "src/services/SchoolService"
import { setSchoolBrand, useSchoolBrand } from "src/lib/schoolBrand"
import platformLogo from "src/assets/images/logo.png"
import styles from "./SchoolLogoCard.module.scss"

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"]
const MAX_BYTES = 5 * 1024 * 1024

/** Quản trị nhà trường đổi logo hiển thị ở sidebar của mọi tài khoản trong trường. */
export default function SchoolLogoCard({ schoolId }) {
  const brand = useSchoolBrand(schoolId)
  const input = useRef(null)
  const [busy, setBusy] = useState("")

  const run = async (kind, action, successMessage) => {
    setBusy(kind)
    try {
      const updated = await action()
      if (updated) setSchoolBrand(updated)
      notice({ msg: successMessage })
    } catch (error) {
      notice({ msg: error?.message || "Không thể cập nhật logo trường.", isSuccess: false })
    } finally {
      setBusy("")
    }
  }

  const pick = event => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      notice({ msg: "Chỉ nhận ảnh PNG, JPEG hoặc WebP.", isSuccess: false })
      return
    }
    if (file.size > MAX_BYTES) {
      notice({ msg: "Ảnh vượt quá 5 MB.", isSuccess: false })
      return
    }
    run("upload", () => SchoolService.uploadSchoolLogo(file), "Đã cập nhật logo trường.")
  }

  const hasLogo = Boolean(brand?.logoUrl)
  return (
    <Card variant="outlined" className={styles.card} aria-busy={Boolean(busy)}>
      <div className={styles.preview}>
        <img src={brand?.logoUrl || platformLogo} alt={hasLogo ? `Logo ${brand.name}` : "Logo FoodPrint"} />
      </div>
      <div className={styles.body}>
        <h2>Logo trường</h2>
        <p>
          {hasLogo
            ? "Đang hiển thị ở góc trái màn hình của mọi tài khoản trong trường."
            : "Trường chưa có logo, đang dùng logo FoodPrint."}
        </p>
        <span className={styles.hint}>PNG, JPEG hoặc WebP, tối đa 5 MB. Nên dùng ảnh vuông.</span>
        <div className={styles.actions}>
          <input ref={input} type="file" accept={ACCEPTED.join(",")} hidden onChange={pick} />
          <Button
            variant="outlined"
            startIcon={busy === "upload" ? <CircularProgress size={16} color="inherit" /> : <ImageUp size={16} />}
            disabled={Boolean(busy)}
            onClick={() => input.current?.click()}
          >
            {hasLogo ? "Đổi logo" : "Tải logo lên"}
          </Button>
          {hasLogo && (
            <Button
              color="inherit"
              startIcon={busy === "remove" ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
              disabled={Boolean(busy)}
              onClick={() => run("remove", SchoolService.removeSchoolLogo, "Đã gỡ logo trường.")}
            >
              Gỡ logo
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
