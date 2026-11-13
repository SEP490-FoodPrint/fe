import React, { useState, useEffect, useMemo } from "react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import MenuService from "src/services/MenuService"
import { getSchoolWeekScheduleFromDate } from "src/services/MenuService/adapter"
import KitchenMenuHeader from "./component/KitchenMenuHeader"
import KitchenMenuWeeklyGrid from "./component/KitchenMenuWeeklyGrid"
import styles from "./index.module.scss"

export default function KitchenMenu() {
  const [years, setYears] = useState([])
  const [academicYear, setAcademicYear] = useState("")
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL")
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [calendarError, setCalendarError] = useState("")
  const [error, setError] = useState("")
  const [apiWeekData, setApiWeekData] = useState(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    setCalendarLoading(true)
    setCalendarError("")
    MenuService.getAcademicCalendar({forceRefresh:true}).then(response => {
      if (!active) return
      const rows = response.academicYears
      if (!Array.isArray(rows)) throw new Error("Không tải được cấu hình năm học.")
      setYears(rows)
      const current = rows.find(year=>year.isCurrent) || rows[0]
      setAcademicYear(current?.academicYear || "")
      setSelectedWeek(current?.weeks?.find(week=>week.isCurrentWeek)?.weekNumber || current?.weeks?.[0]?.weekNumber || null)
    }).catch(e=>{if(active)setCalendarError(e.message)}).finally(()=>{if(active)setCalendarLoading(false)})
    return ()=>{active=false}
  }, [revision])

  const year = years.find(row=>row.academicYear===academicYear)
  const weeks = useMemo(()=>(year?.weeks || []).map(week=>({...week,isoWeek:week.weekNumber,startDateISO:week.weekStartDate,endDateISO:week.weekEndDate})),[year])
  const week = weeks.find(row=>row.weekNumber===selectedWeek)
  useEffect(()=>{
    let active=true
    setApiWeekData(null)
    setError("")
    if (!week) {setLoading(false);return ()=>{active=false}}
    setLoading(true)
    MenuService.getWeekSchedule(week.weekStartDate).then(response=>{if(active)setApiWeekData(response.data)})
      .catch(e=>{if(active)setError(e.message)})
      .finally(()=>{if(active)setLoading(false)})
    return ()=>{active=false}
  },[week,revision])

  const days = useMemo(()=>{
    if (!week || !apiWeekData) return []
    return getSchoolWeekScheduleFromDate(week.weekStartDate).schoolDays.map(day=>{
      const stored=apiWeekData.days?.find(row=>row.date===day.dateISO)
      return {...day,isHoliday:stored?.isHoliday || false,holidayReason:stored?.holidayReason || "",status:stored?.status,meals:stored?.meals || {LUNCH:{dishes:[]},AFTERNOON:{dishes:[]}}}
    })
  },[week,apiWeekData])
  const totalDishes=days.reduce((sum,day)=>sum+["LUNCH","AFTERNOON"].filter(type=>mealTypeFilter==="ALL"||type===mealTypeFilter).reduce((n,type)=>n+(day.meals[type]?.dishes?.length || 0),0),0)
  const index=weeks.indexOf(week)
  const changeYear=value=>{
    setAcademicYear(value)
    const target=years.find(row=>row.academicYear===value)
    setSelectedWeek(target?.weeks?.find(row=>row.isCurrentWeek)?.weekNumber || target?.weeks?.[0]?.weekNumber || null)
  }
  const currentWeek=()=>{
    const current=years.find(row=>row.isCurrent)
    if (current) changeYear(current.academicYear)
  }
  const todayISO=new Date(Date.now()+7*3600000).toISOString().slice(0,10)
  const existing=apiWeekData?.days?.filter(day=>day.hasMenu) || []
  return <div className={styles.pageContainer}>
    <KitchenMenuHeader
      menuTitle={apiWeekData?.weeklyMenuTitle || (week ? `Thực đơn tuần ${week.weekNumber}` : "Thực đơn")}
      targetScope={apiWeekData?.targetScope || ""}
      approved={existing.length>0&&existing.every(day=>day.status==="APPROVED")}
      academicYear={academicYear} academicYearOptions={years} onAcademicYearChange={changeYear}
      week={selectedWeek ?? ""} weeks={weeks} onWeekChange={value=>setSelectedWeek(Number(value))}
      onPrevWeek={()=>{if(index>0)setSelectedWeek(weeks[index-1].weekNumber)}}
      onNextWeek={()=>{if(index>=0&&index<weeks.length-1)setSelectedWeek(weeks[index+1].weekNumber)}}
      onCurrentWeek={currentWeek} isCurrentWeekSelected={!!week?.isCurrentWeek}
      isFirstWeek={index<=0} isLastWeek={index<0||index>=weeks.length-1}
      totalDishes={totalDishes} mealTypeFilter={mealTypeFilter} onMealTypeFilterChange={setMealTypeFilter}
    />
    {calendarLoading || loading ? <div role="status" style={{padding:80}}><FoodPrintLoading/></div>
      : calendarError || error ? <div role="alert"><p>{calendarError || error}</p><button onClick={()=>setRevision(value=>value+1)}>Thử lại</button></div>
      : !years.length ? <p>Chưa có cấu hình năm học của trường.</p>
      : <KitchenMenuWeeklyGrid schoolDays={days} mealTypeFilter={mealTypeFilter} todayISO={todayISO}/>}
  </div>
}
