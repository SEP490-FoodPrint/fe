import React from "react"
import PropTypes from "prop-types"
import {
  Chip,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material"
import { TIER_CONFIG, TIER_KEYS } from "./inspectionTierConfig"
import styles from "./InspectionRoleTierTable.module.scss"

function getPermissionDescription(tier) {
  switch (tier) {
    case TIER_KEYS.PRIMARY:
      return (
        <span className={styles.permPrimary}>
          Xác nhận xe đã đến &amp; bắt buộc ký nhận để hoàn tất đợt giao
        </span>
      )
    case TIER_KEYS.REQUIRED:
      return (
        <span className={styles.permRequired}>
          Bắt buộc ký nhận đạt để hoàn tất đợt giao
        </span>
      )
    case TIER_KEYS.OPTIONAL:
      return (
        <span className={styles.permOptional}>
          Tham gia kiểm tra độc lập (ý kiến không chặn đợt giao)
        </span>
      )
    default:
      return null
  }
}

function InspectionRoleTierTable({ roles, onChangeTier }) {
  return (
    <>
      {/* Desktop Table View */}
      <div className={styles.tableWrapper}>
        <Table className={styles.desktopTable}>
          <TableHead className={styles.tableHeaderRow}>
            <TableRow>
              <TableCell className={styles.tableHeaderCell} sx={{ width: "30%" }}>
                Bộ phận / Vai trò
              </TableCell>
              <TableCell className={styles.tableHeaderCell} sx={{ width: "40%" }}>
                Nhóm duyệt kiểm nhận
              </TableCell>
              <TableCell className={styles.tableHeaderCell} sx={{ width: "30%" }}>
                Quyền hạn &amp; Trách nhiệm
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((item) => {
              const isEditable = item.editable !== false

              return (
                <TableRow key={item.roleCode} className={styles.tableRow}>
                  <TableCell className={styles.roleCell}>
                    <span className={styles.roleName}>{item.roleName}</span>
                    <span className={styles.roleCode}>{item.roleCode}</span>
                  </TableCell>

                  <TableCell className={styles.tierCell}>
                    {isEditable ? (
                      <FormControl component="fieldset">
                        <RadioGroup
                          row
                          value={item.tier}
                          onChange={(e) => onChangeTier(item.roleCode, e.target.value)}
                          className={styles.radioGroupHoriz}
                        >
                          <FormControlLabel
                            value={TIER_KEYS.PRIMARY}
                            control={<Radio size="small" />}
                            label="Nhóm 1 (Chính)"
                          />
                          <FormControlLabel
                            value={TIER_KEYS.REQUIRED}
                            control={<Radio size="small" />}
                            label="Nhóm 2 (Bắt buộc)"
                          />
                          <FormControlLabel
                            value={TIER_KEYS.OPTIONAL}
                            control={<Radio size="small" />}
                            label="Nhóm 3 (Tùy chọn)"
                          />
                        </RadioGroup>
                      </FormControl>
                    ) : (
                      <div className={styles.fixedChipWrapper}>
                        <Tooltip title="Cố định theo quy định hệ thống, không thể thay đổi">
                          <Chip
                            label={TIER_CONFIG[TIER_KEYS.OPTIONAL].chipLabel}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                        <span className={styles.fixedHint}>Cố định</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className={styles.permCell}>
                    {getPermissionDescription(item.tier)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className={styles.mobileCardList}>
        {roles.map((item) => {
          const isEditable = item.editable !== false

          return (
            <div key={item.roleCode} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div>
                  <span className={styles.roleName}>{item.roleName}</span>
                  <span className={styles.roleCode}>{item.roleCode}</span>
                </div>
                {!isEditable && (
                  <Chip
                    label="Cố định"
                    size="small"
                    variant="outlined"
                  />
                )}
              </div>

              <div>
                {isEditable ? (
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={item.tier}
                      onChange={(e) => onChangeTier(item.roleCode, e.target.value)}
                    >
                      <FormControlLabel
                        value={TIER_KEYS.PRIMARY}
                        control={<Radio size="small" />}
                        label="Nhóm 1 – Người duyệt chính"
                      />
                      <FormControlLabel
                        value={TIER_KEYS.REQUIRED}
                        control={<Radio size="small" />}
                        label="Nhóm 2 – Bắt buộc duyệt"
                      />
                      <FormControlLabel
                        value={TIER_KEYS.OPTIONAL}
                        control={<Radio size="small" />}
                        label="Nhóm 3 – Tùy chọn"
                      />
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <div className={styles.fixedChipWrapper}>
                    <Chip
                      label={TIER_CONFIG[TIER_KEYS.OPTIONAL].chipLabel}
                      size="small"
                    />
                  </div>
                )}
              </div>

              <div className={styles.permCell}>
                {getPermissionDescription(item.tier)}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

InspectionRoleTierTable.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      roleCode: PropTypes.string.isRequired,
      roleName: PropTypes.string.isRequired,
      tier: PropTypes.string.isRequired,
      editable: PropTypes.bool,
    }),
  ).isRequired,
  onChangeTier: PropTypes.func.isRequired,
}

export default InspectionRoleTierTable
