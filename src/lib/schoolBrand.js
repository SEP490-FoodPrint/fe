import { useEffect, useSyncExternalStore } from "react"
import SchoolService from "src/services/SchoolService"

// Logo + tên trường dùng chung cho sidebar và trang profile, tải một lần mỗi trường.
let state = { schoolId: null, brand: null }
let pending = null
const listeners = new Set()

const emit = () => listeners.forEach(listener => listener())
const subscribe = listener => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const snapshot = () => state

export function setSchoolBrand(brand) {
  state = { schoolId: brand?.schoolId ?? state.schoolId, brand }
  emit()
}

export function loadSchoolBrand(schoolId) {
  if (!schoolId) return Promise.resolve(null)
  if (state.schoolId === schoolId && state.brand) return Promise.resolve(state.brand)
  if (pending?.schoolId === schoolId) return pending.promise
  const promise = SchoolService.getSchoolBrand()
    .then(brand => {
      if (brand) setSchoolBrand(brand)
      return brand
    })
    .catch(() => null)
    .finally(() => { if (pending?.promise === promise) pending = null })
  pending = { schoolId, promise }
  return promise
}

/** Trả về `{ schoolId, name, logoUrl }` của trường đang đăng nhập, hoặc null. */
export function useSchoolBrand(schoolId) {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot)
  useEffect(() => { loadSchoolBrand(schoolId) }, [schoolId])
  return schoolId && current.schoolId === schoolId ? current.brand : null
}
