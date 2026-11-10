import React, { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { CircularProgress, Typography } from "@mui/material";

import ROUTER from "src/router/ROUTER";
import SchoolService from "src/services/SchoolService";

import SchoolHeader from "./component/SchoolHeader";
import SchoolFooter from "./component/SchoolFooter";
import styles from "./SchoolPublicLayout.module.scss";

function SchoolPublicLayout() {
  const { schoolCode } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSchool = async () => {
      if (!schoolCode) {
        setLoading(false);
        setError("Không có mã trường học được cung cấp.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await SchoolService.getSchoolDetailByCode(schoolCode);
        const data = res?.data && !res.data.data ? res.data : res?.data?.data || res;
        if (isMounted) {
          if (data && (data.id || data.code || data.name)) {
            setSchool(data);
          } else {
            setError(`Không tìm thấy thông tin trường học với mã: ${schoolCode}`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Lỗi khi tải thông tin trường học tại SchoolPublicLayout:", err);
          setError("Không thể kết nối đến máy chủ để lấy thông tin trường.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSchool();
    return () => {
      isMounted = false;
    };
  }, [schoolCode]);

  return (
    <div className={styles.layoutWrapper}>
      {/* 1. Header trường học dùng chung */}
      <SchoolHeader school={school} />

      {/* 2. Nội dung trang con hoặc trạng thái tải / lỗi */}
      <main className={styles.mainContent}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <CircularProgress size={36} sx={{ color: "var(--color-primary)" }} />
            <span>Đang tải thông tin trường học...</span>
          </div>
        ) : error || !school ? (
          <div className={styles.errorCard}>
            <AlertCircle size={40} className={styles.errorIcon} />
            <Typography variant="h2" className={styles.errorTitle}>
              Không thể hiển thị thông tin trường
            </Typography>
            <p className={styles.errorDesc}>
              {error || "Trường học không tồn tại hoặc đã ngừng hoạt động trên hệ thống."}
            </p>
            <Link to={ROUTER.SCHOOL_LIST} className={styles.backListBtn}>
              <ArrowLeft size={16} />
              <span>Xem danh sách trường học</span>
            </Link>
          </div>
        ) : (
          <Outlet context={{ school, schoolCode }} />
        )}
      </main>

      {/* 3. Footer trường học dùng chung */}
      <SchoolFooter school={school} />
    </div>
  );
}

export default SchoolPublicLayout;
