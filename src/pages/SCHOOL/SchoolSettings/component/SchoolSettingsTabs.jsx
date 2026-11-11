import React from "react"
import { Tab, Tabs } from "@mui/material"
import styles from "./SchoolSettingsTabs.module.scss"

function SchoolSettingsTabs({ tabs, value, onChange }) {
  return (
    <Tabs
      aria-label="Các mục cấu hình trường học"
      className={styles.tabs}
      value={value}
      onChange={(_, tab) => onChange(tab)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      {tabs.map(({ id, label }) => (
        <Tab
          key={id}
          id={`school-settings-tab-${id}`}
          value={id}
          label={label}
          aria-controls={`school-settings-panel-${id}`}
        />
      ))}
    </Tabs>
  )
}

export default SchoolSettingsTabs
