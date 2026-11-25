import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button, Card, Skeleton, Typography } from "@mui/material"
import { ArrowRight } from "lucide-react"
import ROUTER from "src/router/ROUTER"
import MealAllocationService from "src/services/MealAllocationService"
import { adaptRecentAllocations } from "src/services/MealAllocationService/adapter"
import styles from "./RecentMealAllocations.module.scss"

function RecentMealAllocations() {
  const [state, setState] = useState({ loading: true, error: false, items: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setState({ loading: true, error: false, items: [] })

    MealAllocationService.getToday(controller.signal)
      .then(res => {
        if (active)
          setState({
            loading: false,
            error: false,
            items: adaptRecentAllocations(res),
          })
      })
      .catch(() => {
        if (active) setState({ loading: false, error: true, items: [] })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])

  const { loading, error, items } = state

  return (
    <Card component="section" className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <Typography component="h2" className={styles.tableTitle}>
          Phân bổ suất ăn hôm nay
        </Typography>
        <Link
          to={ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION}
          className={styles.viewAllBtn}
          aria-label="Xem tất cả phân bổ suất ăn"
        >
          <span>Tất cả</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </div>
      ) : error ? (
        <div className={styles.stateBox} role="alert">
          <span>Chưa tải được phân bổ suất ăn.</span>
          <Button
            variant="outlined"
            onClick={() => setAttempt(value => value + 1)}
          >
            Thử lại
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.stateBox}>Hôm nay chưa có phân bổ suất ăn.</div>
      ) : (
        <ul className={styles.list}>
          {items.map(row => (
            <li key={row.id}>
              <Link
                to={ROUTER.SCHOOL_KITCHEN_MEAL_ALLOCATION}
                className={styles.row}
              >
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{row.target}</span>
                  <span className={styles.meta}>
                    {row.portion} • {row.timeTag}
                  </span>
                </span>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`status_${row.statusType}`] || styles.status_info
                  }`}
                >
                  {row.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default RecentMealAllocations
