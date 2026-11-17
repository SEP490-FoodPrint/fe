import React, { useCallback, useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useSearchParams } from "react-router-dom"
import dayjs from "dayjs"
import MealPicker from "./MealPicker"
import TraceSummary from "./TraceSummary"
import TraceTimeline from "./TraceTimeline"
import TraceEmpty from "./TraceEmpty"
import styles from "./TraceabilityView.module.scss"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function chainError(error) {
  if (error?.status === 403) return "Tài khoản của bạn không có quyền kiểm tra toàn vẹn dữ liệu."
  if (error?.status === 404) return "Không tìm thấy bữa ăn của khối này."
  if (error?.status === 429) return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."
  return error?.message || "Không thể tải hành trình bữa ăn."
}

/**
 * Picks a grade's meal of a day and traces it back through cooking, inspection and the supplier,
 * like tracking a delivery. The data source decides staff or public access.
 */
export default function TraceabilityView({
  listMeals,
  getChain,
  title = "Truy xuất nguồn gốc",
  lead = "Chọn một bữa ăn để xem hành trình từ nhà cung cấp tới từng khối, và kiểm tra dữ liệu từng bước còn nguyên vẹn trên blockchain.",
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramDate = searchParams.get("date")
  const date = DATE_PATTERN.test(paramDate || "") ? paramDate : dayjs().format("YYYY-MM-DD")
  const selectedId = searchParams.get("meal") || ""

  const [meals, setMeals] = useState([])
  const [mealsLoading, setMealsLoading] = useState(true)
  const [mealsError, setMealsError] = useState("")
  const [chain, setChain] = useState(null)
  const [chainLoading, setChainLoading] = useState(false)
  const [chainErrorText, setChainErrorText] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState("")
  const [checked, setChecked] = useState(false)

  const update = useCallback((next) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => (value ? params.set(key, value) : params.delete(key)))
    setSearchParams(params, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    setMealsLoading(true)
    setMealsError("")
    listMeals(date, { signal: controller.signal })
      .then(setMeals)
      .catch(error => {
        if (controller.signal.aborted) return
        setMeals([])
        setMealsError(error.status === 403 ? "Tài khoản của bạn không có quyền truy xuất nguồn gốc." : chainError(error))
      })
      .finally(() => !controller.signal.aborted && setMealsLoading(false))
    return () => controller.abort()
  }, [date, listMeals])

  useEffect(() => {
    setChain(null)
    setChecked(false)
    setVerifyError("")
    setChainErrorText("")
    if (!selectedId) return undefined
    const controller = new AbortController()
    setChainLoading(true)
    getChain(selectedId, { date, signal: controller.signal })
      .then(setChain)
      .catch(error => !controller.signal.aborted && setChainErrorText(chainError(error)))
      .finally(() => !controller.signal.aborted && setChainLoading(false))
    return () => controller.abort()
  }, [selectedId, date, getChain])

  const verify = async () => {
    if (!selectedId || verifying) return
    setVerifying(true)
    setVerifyError("")
    try {
      setChain(await getChain(selectedId, { date, verify: true }))
      setChecked(true)
    } catch (error) {
      setVerifyError(chainError(error))
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageLead}>{lead}</p>
      </header>

      <div className={styles.layout}>
        <MealPicker
          date={date}
          meals={meals}
          loading={mealsLoading}
          error={mealsError}
          selectedId={selectedId}
          onDateChange={value => update({ date: value, meal: "" })}
          onSelect={id => update({ meal: id })}
        />

        <section className={styles.trace} aria-live="polite">
          {!selectedId && <TraceEmpty />}
          {selectedId && chainLoading && <TraceEmpty loading />}
          {selectedId && !chainLoading && chainErrorText && <TraceEmpty error={chainErrorText} />}
          {chain && !chainLoading && (
            <>
              <TraceSummary
                chain={chain}
                checked={checked}
                verifying={verifying}
                verifyError={verifyError}
                onVerify={verify}
              />
              <TraceTimeline key={`${selectedId}-${checked}`} stops={chain.stops} checked={checked} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

TraceabilityView.propTypes = {
  /** (date, { signal }) => Promise<meal[]> */
  listMeals: PropTypes.func.isRequired,
  /** (mealKey, { date, verify, signal }) => Promise<chain>; mealKey is a row's `key` */
  getChain: PropTypes.func.isRequired,
  title: PropTypes.string,
  lead: PropTypes.string,
}
