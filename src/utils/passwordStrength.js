/**
 * Các cấp độ đánh giá độ mạnh của mật khẩu
 */
export const PASSWORD_STRENGTH_LEVELS = {
  EMPTY: "empty",
  WEAK: "weak",
  FAIR: "fair",
  GOOD: "good",
  STRONG: "strong",
};

/**
 * Đánh giá độ mạnh của mật khẩu theo thời gian thực
 * @param {string} password - Chuỗi mật khẩu cần kiểm tra
 * @returns {{
 *   score: number, // 0 - 4
 *   level: 'empty' | 'weak' | 'fair' | 'good' | 'strong',
 *   text: string,  // Nhãn hiển thị tiếng Việt
 *   percent: number, // 0 - 100%
 *   criteria: {
 *     minLength: boolean,
 *     hasLettersAndNumbers: boolean,
 *     hasSpecialChar: boolean,
 *     optimalLength: boolean
 *   }
 * }}
 */
export function checkPasswordStrength(password = "") {
  const val = typeof password === "string" ? password : "";

  if (!val) {
    return {
      score: 0,
      level: PASSWORD_STRENGTH_LEVELS.EMPTY,
      text: "Chưa nhập",
      percent: 0,
      criteria: {
        minLength: false,
        hasLettersAndNumbers: false,
        hasSpecialChar: false,
        optimalLength: false,
      },
    };
  }

  const minLength = val.length >= 8;
  const hasLettersAndNumbers = /[a-zA-Z]/.test(val) && /[0-9]/.test(val);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(val);
  const optimalLength = val.length >= 12;

  let score = 0;
  if (minLength) score++;
  if (hasLettersAndNumbers) score++;
  if (hasSpecialChar) score++;
  if (optimalLength) score++;

  if (score <= 1) {
    return {
      score: 1,
      level: PASSWORD_STRENGTH_LEVELS.WEAK,
      text: "Yếu",
      percent: 25,
      criteria: { minLength, hasLettersAndNumbers, hasSpecialChar, optimalLength },
    };
  }

  if (score === 2) {
    return {
      score: 2,
      level: PASSWORD_STRENGTH_LEVELS.FAIR,
      text: "Trung bình",
      percent: 50,
      criteria: { minLength, hasLettersAndNumbers, hasSpecialChar, optimalLength },
    };
  }

  if (score === 3) {
    return {
      score: 3,
      level: PASSWORD_STRENGTH_LEVELS.GOOD,
      text: "Khá",
      percent: 75,
      criteria: { minLength, hasLettersAndNumbers, hasSpecialChar, optimalLength },
    };
  }

  return {
    score: 4,
    level: PASSWORD_STRENGTH_LEVELS.STRONG,
    text: "Mạnh & An toàn",
    percent: 100,
    criteria: { minLength, hasLettersAndNumbers, hasSpecialChar, optimalLength },
  };
}

export default checkPasswordStrength;
