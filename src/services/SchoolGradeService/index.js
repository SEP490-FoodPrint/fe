import http from "../01_axios";
import { apiSchoolGrades, apiSchoolGradeDetail } from "./urls";

const config = { notifyOnError: false };

export default {
  list: (signal, extraConfig = {}) =>
    http.get(apiSchoolGrades, { ...config, ...extraConfig, signal }),
  create: (data) => http.post(apiSchoolGrades, data, config),
  update: (id, data) => http.patch(apiSchoolGradeDetail(id), data, config),
  remove: (id) => http.delete(apiSchoolGradeDetail(id), config),
};
