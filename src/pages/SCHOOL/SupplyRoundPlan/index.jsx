import React, { useEffect, useState } from "react"
import { Alert, Button, MenuItem, Skeleton, TextField } from "@mui/material"
import SupplyRoundService from "src/services/SupplyRoundService"
import notice from "src/components/Notice"
import RoundPlanDetails from "./component/RoundPlanDetails"
import "./style.scss"

function todayInVietnam() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

export default function SupplyRoundPlan() {
  const [date, setDate] = useState(todayInVietnam)
  const [batchNo, setBatchNo] = useState("1")
  const [round, setRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)
  const [working, setWorking] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError("")
      setRound(null)
      try {
        const result = await SupplyRoundService.get({ date, batchNo })
        if (active) setRound(result.data)
      } catch (failure) {
        if (active) setError(failure.response?.data?.message || "Không thể tải kế hoạch đợt giao.")
      } finally {
        if (active) setLoading(false)
      }
    }
    if (date) void load()
    return () => { active = false }
  }, [date, batchNo, reload])

  async function changeDish(dish, action) {
    setWorking(dish.id)
    try {
      const result = action === "approve"
        ? await SupplyRoundService.approve(round.id, dish.id, dish.planVersion)
        : await SupplyRoundService.retry(round.id, dish.id)
      setRound(result.data)
      if (action === "approve") notice({ msg: "Đã duyệt kế hoạch của món" })
    } catch (failure) {
      notice({ msg: failure.response?.data?.message || "Không thể cập nhật kế hoạch của món.", isSuccess: false })
      if (failure.response?.status === 409) setReload(value => value + 1)
    } finally {
      setWorking(null)
    }
  }

  const current = round?.date === date && String(round.batchNo) === batchNo ? round : null
  return (
    <section className="supply-round-plan">
      <h1>Kế hoạch mẻ theo đợt giao</h1>
      <div className="supply-round-plan__filters">
        <TextField type="date" label="Ngày giao" size="small" value={date} disabled={Boolean(working)} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField select label="Đợt giao" size="small" value={batchNo} disabled={Boolean(working)} onChange={event => setBatchNo(event.target.value)}>
          <MenuItem value="1">Đợt 1</MenuItem>
          <MenuItem value="2">Đợt 2</MenuItem>
        </TextField>
      </div>
      {!date && <Alert severity="info">Chọn ngày giao để xem kế hoạch.</Alert>}
      {date && loading && <Skeleton variant="rounded" height={160} />}
      {date && !loading && error && <Alert severity="error" action={<Button onClick={() => setReload(value => value + 1)}>Tải lại</Button>}>{error}</Alert>}
      {date && !loading && current && <RoundPlanDetails round={current} working={working} onAction={changeDish} />}
    </section>
  )
}
