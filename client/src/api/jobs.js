import client from "./client";

export const getJobs = () => client.get("/jobs");

export const createJob = (job) => client.post("/jobs", job);

export const deleteJob = (id) => client.delete(`/jobs/${id}`);
