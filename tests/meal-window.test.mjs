import assert from "node:assert/strict"
import { test } from "node:test"
import { hasMealWindow, mealByTime, mealWindowBlock } from "../src/utils/mealWindow.js"

const times = { lunch: "11:30", afternoon: "15:00" }
// Giờ Việt Nam = UTC + 7
const vn = (clock) => new Date(`2032-01-05T${clock}:00+07:00`)

test("trước và đúng giờ bữa trưa chỉ xử lý bữa trưa", () => {
  for (const clock of ["06:00", "11:30"]) {
    assert.equal(mealByTime(times, vn(clock)), "lunch")
    assert.equal(mealWindowBlock("LUNCH", times, vn(clock)), "")
    assert.equal(mealWindowBlock("afternoon", times, vn(clock)), "Chưa tới khung giờ bữa xế (sau 11:30).")
  }
})

test("sau giờ bữa trưa chỉ xử lý bữa xế", () => {
  for (const clock of ["11:31", "16:00"]) {
    assert.equal(mealWindowBlock("AFTERNOON", times, vn(clock)), "")
    assert.equal(mealWindowBlock("lunch", times, vn(clock)), "Đã qua giờ bữa trưa (11:30). Chỉ xử lý lô bữa xế.")
  }
})

test("chưa cấu hình giờ bữa trưa thì không khóa", () => {
  for (const config of [null, {}, { lunch: "" }, { lunch: "11h30" }]) {
    assert.equal(hasMealWindow(config), false)
    assert.equal(mealWindowBlock("LUNCH", config, vn("16:00")), "")
    assert.equal(mealWindowBlock("AFTERNOON", config, vn("07:00")), "")
  }
  assert.equal(mealWindowBlock("", times, vn("16:00")), "")
})
