import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import AcademicYearConfiguration from "../AcademicYearConfiguration";
import CookingMode from "../CookingMode";
import MealServingTimes from "../MealServingTimes";
import SchoolSettingsTabs from "./component/SchoolSettingsTabs";
import "./style.scss";

const tabs = [
  { id: "cooking-mode", label: "Chế độ nấu", Page: CookingMode },
  { id: "meal-serving-times", label: "Khung giờ vận hành", Page: MealServingTimes },
  {
    id: "academic-year",
    label: "Thiết lập niên khóa",
    Page: AcademicYearConfiguration,
  },
];

function SchoolSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tabId = requestedTab === "timeline" ? "meal-serving-times" : requestedTab;
  const activeTab = tabs.find(({ id }) => id === tabId) ?? tabs[0];
  const [visitedForms, setVisitedForms] = useState({});

  // Keep the serving time and academic year forms mounted to preserve drafts.
  useEffect(() => {
    if (activeTab.id === "cooking-mode") return;
    setVisitedForms((visited) =>
      visited[activeTab.id] ? visited : { ...visited, [activeTab.id]: true },
    );
  }, [activeTab.id]);

  const selectTab = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    setSearchParams(nextParams);
  };

  return (
    <Box className="school-settings-page">
      <header className="school-settings-page__header">
        <Typography component="h1" variant="h4">
          Cấu hình trường học
        </Typography>
      </header>

      <SchoolSettingsTabs
        tabs={tabs}
        value={activeTab.id}
        onChange={selectTab}
      />
      {tabs.map(({ id, Page }) => {
        const active = activeTab.id === id;
        const keepMounted = visitedForms[id];

        return (
          <Box
            key={id}
            role="tabpanel"
            id={`school-settings-panel-${id}`}
            aria-labelledby={`school-settings-tab-${id}`}
            className="school-settings-page__panel"
            hidden={!active}
            tabIndex={0}
          >
            {(active || keepMounted) && <Page active={active} />}
          </Box>
        );
      })}
    </Box>
  );
}

export default SchoolSettings;
