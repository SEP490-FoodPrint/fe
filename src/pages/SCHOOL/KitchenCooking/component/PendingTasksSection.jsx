import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button, Card, Skeleton, Typography } from "@mui/material"
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CookingPot,
  FlaskConical,
  UtensilsCrossed,
} from "lucide-react"
import ROUTER from "src/router/ROUTER"
import KitchenService from "src/services/KitchenService"
import {
  adaptCookingBatch,
  canRecordBatchSample,
  localDateISO,
} from "src/services/KitchenService/adapter"
import styles from "./PendingTasksSection.module.scss"

const VISIBLE_LIMIT = 5

const GROUPS = [
  {
    key: "confirm",
    label: "Chờ xác nhận",
    icon: UtensilsCrossed,
    match: batch => batch.status === "UNCONFIRMED",
  },
  {
    key: "cooking",
    label: "Đang nấu",
    icon: CookingPot,
    match: batch => batch.status === "CONFIRMED",
  },
  {
    key: "sample",
    label: "Chưa lưu mẫu",
    icon: FlaskConical,
    match: canRecordBatchSample,
  },
]

function toTasks(items) {
  return GROUPS.flatMap(group =>
    items.filter(group.match).map(batch => {
      const view = adaptCookingBatch(batch)
      return {
        id: batch.id,
        group,
        title: view.dishName,
        meta: `${view.portion} • ${view.mealLabel}`,
        route: ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", batch.id),
      }
    }),
  )
}

function PendingTasksSection() {
  const [state, setState] = useState({ loading: true, error: false, tasks: [] })
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState("")
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setState({ loading: true, error: false, tasks: [] })

    KitchenService.getBatches(
      { date: localDateISO(), limit: 100 },
      { signal: controller.signal, forceRefresh: attempt > 0 },
    )
      .then(res => {
        if (active)
          setState({
            loading: false,
            error: false,
            tasks: toTasks(res.items || []),
          })
      })
      .catch(() => {
        if (active) setState({ loading: false, error: true, tasks: [] })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])

  const { loading, error, tasks } = state
  const filtered = filter
    ? tasks.filter(task => task.group.key === filter)
    : tasks
  const shown = expanded ? filtered : filtered.slice(0, VISIBLE_LIMIT)

  const chooseFilter = key => {
    setFilter(current => (current === key ? "" : key))
    setExpanded(false)
  }

  return (
    <Card component="section" className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <Typography component="h2" className={styles.mainTitle}>
          Việc cần xử lý hôm nay
        </Typography>
        {tasks.length > 0 && (
          <span className={styles.badgeCount}>{tasks.length}</span>
        )}
      </div>

      {loading ? (
        <div className={styles.taskList}>
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={60} />
        </div>
      ) : error ? (
        <div className={styles.stateBox} role="alert">
          <AlertCircle className={styles.errorIcon} size={28} aria-hidden="true" />
          <span>Chưa tải được công việc.</span>
          <Button
            variant="outlined"
            onClick={() => setAttempt(value => value + 1)}
          >
            Thử lại
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className={styles.stateBox}>
          <CheckCircle2 className={styles.doneIcon} size={28} aria-hidden="true" />
          <span>Hôm nay không có việc cần xử lý.</span>
        </div>
      ) : (
        <>
          <div className={styles.filters} role="group" aria-label="Lọc công việc">
            {GROUPS.map(({ key, label }) => {
              const count = tasks.filter(task => task.group.key === key).length
              return (
                <button
                  key={key}
                  type="button"
                  className={styles.filterBtn}
                  aria-pressed={filter === key}
                  disabled={count === 0}
                  onClick={() => chooseFilter(key)}
                >
                  <strong>{count}</strong>
                  <span>{label}</span>
                </button>
              )
            })}
          </div>

          <ul className={styles.taskList}>
            {shown.map(({ id, group, title, meta, route }) => {
              const Icon = group.icon
              const tone = styles[`tone_${group.key}`]
              return (
                <li key={`${group.key}-${id}`}>
                  <Link to={route} className={styles.task}>
                    <span
                      className={`${styles.taskIcon} ${tone}`}
                      aria-hidden="true"
                    >
                      <Icon size={18} />
                    </span>
                    <span className={styles.taskText}>
                      <span className={styles.taskTitle}>{title}</span>
                      <span className={styles.taskMeta}>{meta}</span>
                    </span>
                    <span className={`${styles.statusBadge} ${tone}`}>
                      {group.label}
                    </span>
                    <ChevronRight
                      className={styles.arrow}
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>

          {filtered.length > VISIBLE_LIMIT && (
            <div className={styles.more}>
              <Button onClick={() => setExpanded(value => !value)}>
                {expanded
                  ? "Thu gọn"
                  : `Xem thêm ${filtered.length - VISIBLE_LIMIT} việc`}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

export default PendingTasksSection
