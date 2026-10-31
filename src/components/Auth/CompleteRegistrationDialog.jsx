import React, { useContext, useEffect, useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { useLocation, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { getRegistrationDestination, needsRegistrationCompletion } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import styles from "./CompleteRegistrationDialog.module.scss"

export default function CompleteRegistrationDialog() {
  const location = useLocation()
  const navigate = useNavigate()
  const { userStore } = useContext(StoreContext)
  const user = userStore.user
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (location.pathname !== ROUTER.DEFAULT || !location.state?.promptRegistration || !needsRegistrationCompletion(user)) return
    setOpen(true)
    const { promptRegistration, ...rest } = location.state
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: rest })
  }, [location, navigate, user])
  const close = () => setOpen(false)
  const agree = () => { close(); navigate(getRegistrationDestination(user)) }
  return <Dialog open={open && needsRegistrationCompletion(user)} onClose={(_, reason) => { if (reason !== "backdropClick") close() }} maxWidth="xs" fullWidth aria-labelledby="complete-registration-title" aria-describedby="complete-registration-description" className={styles.dialog}>
    <DialogTitle id="complete-registration-title" className={styles.title}>Hoàn thiện hồ sơ đăng ký<IconButton onClick={close} aria-label="Đóng nhắc hoàn thiện hồ sơ" className={styles.close}><CloseIcon /></IconButton></DialogTitle>
    <DialogContent className={styles.content}><span className={styles.icon} aria-hidden="true"><DescriptionOutlinedIcon /></span><p id="complete-registration-description">Bạn phải hoàn thiện hồ sơ đăng ký để gửi xét duyệt và sử dụng các chức năng của đơn vị.</p></DialogContent>
    <DialogActions className={styles.actions}><Button onClick={agree} variant="contained" autoFocus>Đồng ý</Button></DialogActions>
  </Dialog>
}
