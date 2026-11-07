import React from "react"
import { Avatar } from "@mui/material"
import { Peek } from "@doan-labs/peek"

export default function UserAvatar({ user, className }) {
  const seed = String(user?.fullName?.trim() || user?.username || user?.email || user?.id || "FoodPrint")
  return <Avatar src={user?.avatarUrl || user?.avatar || undefined} alt="" className={className}>
    <Peek name={seed} style={{ width: "100%", height: "100%" }} />
  </Avatar>
}
