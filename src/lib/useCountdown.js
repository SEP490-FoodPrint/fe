import { useEffect, useState } from "react"

export default function useCountdown(until = 0) {
  const seconds = () => Math.max(0, Math.ceil((until - Date.now()) / 1000))
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => {
    const next = () => Math.max(0, Math.ceil((until - Date.now()) / 1000))
    setRemaining(next())
    if (!next()) return
    const timer = setInterval(() => { const value = next(); setRemaining(value); if (!value) clearInterval(timer) }, 1000)
    return () => clearInterval(timer)
  }, [until])
  return remaining
}
