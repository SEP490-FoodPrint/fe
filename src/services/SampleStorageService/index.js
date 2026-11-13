import http from "../01_axios";
import { apiSampleStorageUnits } from "./urls";

const getSampleStorageUnits = (params) =>
  http.get(apiSampleStorageUnits, { params });

const getSampleStorageUnitDetail = (id) =>
  http.get(`${apiSampleStorageUnits}/${id}`);

const createSampleStorageUnit = (data) =>
  http.post(apiSampleStorageUnits, data);

const updateSampleStorageUnit = (id, data) =>
  http.put(`${apiSampleStorageUnits}/${id}`, data);

const deleteSampleStorageUnit = (id) =>
  http.delete(`${apiSampleStorageUnits}/${id}`);

const SampleStorageService = {
  getSampleStorageUnits,
  getSampleStorageUnitDetail,
  createSampleStorageUnit,
  updateSampleStorageUnit,
  deleteSampleStorageUnit,
};

export default SampleStorageService;
export {
  getSampleStorageUnits,
  getSampleStorageUnitDetail,
  createSampleStorageUnit,
  updateSampleStorageUnit,
  deleteSampleStorageUnit,
};

