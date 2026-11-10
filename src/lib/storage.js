const STORAGE = {
  TOKEN: "token-foodprint",
  USER_INFO: "user-info-foodprint",
  KEY_MENU_ACTIVE: "key-active-foodprint",
}

// Cache consumers can distinguish a new session even when the same user returns.
let sessionRevision = 0
export const getSessionRevision = () => sessionRevision
const isSessionKey = name => name === STORAGE.USER_INFO || name === STORAGE.TOKEN

export const getStorage = name => {
  if (typeof window === "undefined" || !name) return null
  try {
    const data = localStorage.getItem(name)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  } catch (err) {
    console.error("getStorage error:", err)
    return null
  }
}

export const setStorage = (name, value) => {
  if (typeof window === "undefined" || !name) return
  try {
    const data = typeof value === "object" ? JSON.stringify(value) : value
    localStorage.setItem(name, data)
    if (isSessionKey(name)) sessionRevision += 1
  } catch (err) {
    console.error("setStorage error:", err)
  }
}

export const deleteStorage = name => {
  if (typeof window === "undefined" || !name) return
  try {
    localStorage.removeItem(name)
    if (isSessionKey(name)) sessionRevision += 1
  } catch (err) {
    console.error("deleteStorage error:", err)
  }
}

export const clearStorage = () => {
  if (typeof window === "undefined") return
  try {
    localStorage.clear()
    sessionRevision += 1
  } catch (err) {
    console.error("clearStorage error:", err)
  }
}

export default STORAGE
