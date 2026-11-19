import React from "react"
import { Chip } from "@mui/material"
import { TIER_CONFIG, TIER_KEYS } from "./inspectionTierConfig"
import styles from "./InspectionTierIntro.module.scss"

function InspectionTierIntro() {
  const tiers = [
    {
      ...TIER_CONFIG[TIER_KEYS.PRIMARY],
      badgeClass: styles.badgePrimary,
    },
    {
      ...TIER_CONFIG[TIER_KEYS.REQUIRED],
      badgeClass: styles.badgeInfo,
    },
    {
      ...TIER_CONFIG[TIER_KEYS.OPTIONAL],
      badgeClass: styles.badgeNeutral,
    },
  ]

  return (
    <div className={styles.introContainer}>
      <div className={styles.introCardsGrid}>
        {tiers.map((tier) => (
          <div key={tier.key} className={styles.introCard}>
            <div className={styles.cardHeader}>
              <Chip
                label={`Nhóm ${tier.tierNumber}`}
                size="small"
                className={tier.badgeClass}
              />
              <h3 className={styles.cardTitle}>{tier.shortLabel}</h3>
            </div>
            <p className={styles.cardDesc}>{tier.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InspectionTierIntro
