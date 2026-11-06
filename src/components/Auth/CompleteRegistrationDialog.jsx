import React, { useCallback, useContext, useEffect, useRef, useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { useLocation, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { getRegistrationDestination, needsRegistrationCompletion } from "src/lib/utils"
import { hasNewRegistrationResponse, registrationObservation } from "src/lib/registration"
import { getStorage, setStorage } from "src/lib/storage"
import { USE_MOCK_API } from "src/lib/config"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import styles from "./CompleteRegistrationDialog.module.scss"

const feedbackStorageKey = userId => `foodprint_registration_feedback_v1:${userId}`

export default function CompleteRegistrationDialog() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userStore } = useContext(StoreContext)
  const user = userStore.user
  const request = user?.registrationRequest
  const observation = registrationObservation(user)
  const seen = useRef(null)
  const [completionUserId, setCompletionUserId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const remember = useCallback(value => {
    seen.current = value
    setStorage(feedbackStorageKey(value.userId), value)
  }, [])

  useEffect(() => {
    if (!user || location.pathname !== ROUTER.DEFAULT || !location.state?.promptRegistration) return
    if (needsRegistrationCompletion(user) && !request) setCompletionUserId(user.id)
    const { promptRegistration, ...rest } = location.state
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: rest })
  }, [location, navigate, user, request])

  useEffect(() => {
    if (!observation) { seen.current = null; setFeedback(null); return }
    if (seen.current?.userId !== observation.userId) {
      seen.current = getStorage(feedbackStorageKey(observation.userId)) || { userId: observation.userId }
    }
    if (observation.status === "PENDING") {
      remember(observation)
      setFeedback(null)
    } else if (hasNewRegistrationResponse(seen.current, observation)) {
      setFeedback(observation)
    } else setFeedback(null)
  }, [observation?.userId, observation?.requestId, observation?.status, observation?.submittedAt, remember])

  useEffect(() => {
    if (USE_MOCK_API || !observation || observation.status !== "PENDING") return
    const { userId, requestId, submittedAt } = observation
    const controller = new AbortController()
    let inFlight = false
    const refresh = async () => {
      if (document.hidden || inFlight || controller.signal.aborted) return
      inFlight = true
      try {
        const updated = await AuthService.getPersonalProfile({ signal: controller.signal })
        if (controller.signal.aborted || updated.id !== userId || updated.registrationRequest?.id !== requestId) return
        userStore.setUser(current => current?.id === userId && current.registrationRequest?.id === requestId
          && current.registrationRequest.status === "PENDING" && (current.registrationRequest.submittedAt || null) === submittedAt ? updated : current)
      } catch {
        // A temporary connection failure is not a registration decision; retry on the next check.
      } finally { inFlight = false }
    }
    const timer = window.setInterval(refresh, 30000)
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [observation?.userId, observation?.requestId, observation?.status, observation?.submittedAt, userStore.setUser])

  const response = feedback?.userId === observation?.userId && feedback?.requestId === observation?.requestId
    && feedback?.status === observation?.status && feedback?.submittedAt === observation?.submittedAt ? feedback : null
  const open = Boolean(response || completionUserId === user?.id && needsRegistrationCompletion(user) && !request)
  const close = () => {
    if (response) remember(observation)
    setFeedback(null)
    setCompletionUserId(null)
  }
  const agree = () => { const destination = response ? ROUTER.REGISTRATION_STATUS : getRegistrationDestination(user); close(); navigate(destination) }
  return <Dialog open={open} onClose={(_, reason) => { if (reason !== "backdropClick") close() }} maxWidth="xs" fullWidth aria-labelledby="complete-registration-title" aria-describedby={response ? undefined : "complete-registration-description"} className={`${styles.dialog} ${response ? styles.feedback : ""}`}>
    <DialogTitle id="complete-registration-title" className={styles.title}>{response ? "Hồ sơ của bạn đã có phản hồi mới" : "Hoàn thiện hồ sơ đăng ký"}<IconButton onClick={close} aria-label={response ? "Đóng thông báo phản hồi hồ sơ" : "Đóng nhắc hoàn thiện hồ sơ"} className={styles.close}><CloseIcon /></IconButton></DialogTitle>
    {!response && <DialogContent className={styles.content}>
      <span className={styles.icon} aria-hidden="true"><DescriptionOutlinedIcon /></span>
      <p id="complete-registration-description">Bạn phải hoàn thiện hồ sơ đăng ký để gửi xét duyệt và sử dụng các chức năng của đơn vị.</p>
    </DialogContent>}
    <DialogActions className={styles.actions}><Button onClick={agree} variant="contained" autoFocus>{response ? "Xem chi tiết" : "Đồng ý"}</Button></DialogActions>
  </Dialog>
}
