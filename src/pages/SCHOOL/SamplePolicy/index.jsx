import React, { useEffect, useState } from "react"
import { Alert, Skeleton } from "@mui/material"
import moment from "moment"
import notice from "src/components/Notice"
import { DATE_TIME_FORMAT_DD } from "src/lib/dateFormatters"
import SchoolService from "src/services/SchoolService"
import SamplePolicyForm from "./component/SamplePolicyForm"
import { SAMPLE_FIELDS, normalizeAmount } from "./component/samplePolicyConfig"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

const toForm = policy => Object.fromEntries(SAMPLE_FIELDS.map(({ name }) => [name, policy[name]]))

function SamplePolicy() {
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await SchoolService.getSamplePolicy()
        if (!active) return
        setSaved(response.data)
        setForm(toForm(response.data))
      } catch (failure) {
        if (active) setError(errorMessage(failure, "Không thể tải cấu hình lưu mẫu."))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const response = await SchoolService.updateSamplePolicy(
        Object.fromEntries(SAMPLE_FIELDS.map(({ name }) => [name, normalizeAmount(form[name])])),
      )
      setSaved(response.data)
      setForm(toForm(response.data))
      notice({ msg: "Đã lưu cấu hình lưu mẫu" })
    } catch (failure) {
      notice({ msg: errorMessage(failure, "Không thể lưu cấu hình lưu mẫu."), isSuccess: false })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sample-policy-page">
      <header>
        <h1>Lưu mẫu thực phẩm</h1>
        <p>
          Lượng mẫu lưu cho mỗi món trong mỗi mẻ. Món tính theo gam dùng mức gam, món tính theo mililít dùng mức
          mililít. Mẻ đã lập giữ lượng mẫu cũ.
        </p>
      </header>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Skeleton variant="rounded" height={240} />}
      {saved && (
        <>
          <SamplePolicyForm
            form={form}
            saved={saved}
            saving={saving}
            onChange={(name, value) => setForm(current => ({ ...current, [name]: value }))}
            onReset={() => setForm(toForm(saved))}
            onSubmit={save}
          />
          <p className="sample-policy-page__updated">
            {saved.isDefault
              ? "Trường chưa lưu cấu hình, hệ thống đang dùng mức mặc định."
              : `Cập nhật lần cuối ${moment(saved.updatedAt).format(DATE_TIME_FORMAT_DD)} bởi ${saved.updatedBy}`}
          </p>
        </>
      )}
    </div>
  )
}

export default SamplePolicy
