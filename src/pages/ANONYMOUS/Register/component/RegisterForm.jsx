import React, { useContext, useRef, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, School, Truck } from "lucide-react";
import AuthInput from "src/components/Auth/AuthInput";
import AuthService from "src/services/AuthService";
import { signupErrors } from "src/lib/authValidation";
import { saveSignupSession } from "src/lib/signupSession";
import { StoreContext } from "src/contexts";
import ROUTER from "src/router/ROUTER";
import styles from "./RegisterForm.module.scss";

const empty = {
  username: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterForm() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { signupStore } = useContext(StoreContext);
  const requestType = params.get("type") === "SUPPLIER" ? "SUPPLIER" : "SCHOOL";
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const next = signupErrors(values);
    setErrors(next);
    setMessage("");
    if (Object.keys(next).length) return;
    submitting.current = true;
    setLoading(true);
    try {
      const response = await AuthService.signup({
        username: values.username.trim(),
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        requestType,
      });
      const codeSent = response.verificationEmailSent === true;
      const pending = saveSignupSession({
        email: values.email.trim().toLowerCase(),
        username: response.user.username,
        requestType,
        codeSent,
        resendAt: codeSent ? Date.now() + 60_000 : 0,
      });
      signupStore.setSignupCredentials({
        email: pending.email,
        password: values.password,
      });
      setValues(empty);
      navigate(ROUTER.ACTIVATE_ACCOUNT, {
        replace: true,
        state: { pendingSignup: pending, requestCode: !pending.codeSent },
      });
      document.getElementById("root")?.scrollTo(0, 0);
    } catch (error) {
      setMessage(error.message || "Không thể tạo tài khoản. Vui lòng thử lại.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerWrapper}>
      {/* 1. Main Register Card */}
      <div className={styles.card}>
        {/* Header Content */}
        <div className={styles.headingGroup}>
          <h1 className={styles.title}>
            {requestType === "SCHOOL"
              ? "Đăng ký tài khoản Nhà trường"
              : "Đăng ký tài khoản Nhà cung cấp"}
          </h1>
          <p className={styles.subtitle}>
            Tạo tài khoản người đại diện quản lý để bắt đầu quy trình đăng ký
            trường học hoặc đối tác trên FoodPrint.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className={styles.roleTabs} role="tablist">
          <button
            type="button"
            className={`${styles.roleTab} ${requestType === "SCHOOL" ? styles.activeRoleTab : ""}`}
            onClick={() => setParams({ type: "SCHOOL" }, { replace: true })}
            role="tab"
            aria-selected={requestType === "SCHOOL"}
            disabled={loading}
          >
            <School size={16} />
            <span>Đăng ký nhà trường</span>
          </button>
          <button
            type="button"
            className={`${styles.roleTab} ${requestType === "SUPPLIER" ? styles.activeRoleTab : ""}`}
            onClick={() => setParams({ type: "SUPPLIER" }, { replace: true })}
            role="tab"
            aria-selected={requestType === "SUPPLIER"}
            disabled={loading}
          >
            <Truck size={16} />
            <span>Đăng ký nhà cung cấp</span>
          </button>
        </div>

        {/* Error Alert */}
        {message && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={18} className={styles.errorIcon} />
            <span>{message}</span>
          </div>
        )}

        {/* Registration Form */}
        <form
          onSubmit={submit}
          noValidate
          aria-label="Đăng ký đơn vị FoodPrint"
          className={styles.form}
        >
          <div className={styles.fieldsGrid}>
            {/* Field 1: Full Name */}
            <AuthInput
              id="fullName"
              label="Họ và tên người đại diện"
              required
              span="half"
              placeholder="Ví dụ: Nguyễn Văn An"
              value={values.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              autoComplete="name"
              disabled={loading}
              error={errors.fullName}
              inputProps={{ maxLength: 255 }}
            />

            {/* Field 2: Username */}
            <AuthInput
              id="username"
              label="Tên đăng nhập"
              required
              span="half"
              placeholder="Nhập tên đăng nhập viết liền"
              value={values.username}
              onChange={(e) => handleChange("username", e.target.value)}
              autoComplete="username"
              disabled={loading}
              error={errors.username}
              inputProps={{
                maxLength: 120,
                autoCapitalize: "none",
                spellCheck: false,
              }}
            />

            {/* Field 3: Official Email */}
            <AuthInput
              id="email"
              label="Email công tác / tài khoản"
              type="email"
              required
              span="half"
              placeholder="nguyenvanan@school.edu.vn"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              autoComplete="email"
              disabled={loading}
              error={errors.email}
              inputProps={{
                maxLength: 254,
                autoCapitalize: "none",
                spellCheck: false,
              }}
            />

            {/* Field 4: Phone Number */}
            <AuthInput
              id="phone"
              label="Số điện thoại liên hệ"
              type="tel"
              span="half"
              placeholder="0912 345 678"
              value={values.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              autoComplete="tel"
              disabled={loading}
              error={errors.phone}
              inputProps={{ maxLength: 30 }}
            />

            {/* Field 5: Password */}
            <AuthInput
              id="password"
              label="Mật khẩu"
              type="password"
              required
              span="half"
              hint="Tối thiểu 8 ký tự"
              placeholder="••••••••••••"
              value={values.password}
              onChange={(e) => handleChange("password", e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              error={errors.password}
              showStrengthMeter={true}
            />

            {/* Field 6: Confirm Password */}
            <AuthInput
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              required
              span="half"
              placeholder="••••••••••••"
              value={values.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              error={errors.confirmPassword}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={18} color="inherit" />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <>
                <span>Tiếp tục</span>
                <ArrowRight size={18} className={styles.arrowIcon} />
              </>
            )}
          </button>
        </form>

        {/* Card Footer Link */}
        <div className={styles.cardFooter}>
          <p className={styles.cardFooterText}>
            Đã có tài khoản?
            <Link to={ROUTER.LOGIN} className={styles.loginLink}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
