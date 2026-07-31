import client from "./client";

const _toFormData = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
};

export const extractRideOcr = (file) =>
  client.post("/ocr/ride", _toFormData(file));

export const extractVehicleOcr = (file) =>
  client.post("/ocr/vehicle", _toFormData(file));
