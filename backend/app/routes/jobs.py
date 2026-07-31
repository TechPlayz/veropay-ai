import sqlite3
from typing import List

from fastapi import APIRouter, HTTPException, Response, status

from models.job import JobCreate, JobResponse
from services import job_service


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=List[JobResponse])
def list_jobs():
    try:
        return job_service.get_all_jobs()
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch jobs.",
        ) from exc


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int):
    try:
        job = job_service.get_job_by_id(job_id)
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch job.",
        ) from exc

    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    return job


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: JobCreate):
    try:
        return job_service.create_job(job)
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create job.",
        ) from exc


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int):
    try:
        was_deleted = job_service.delete_job(job_id)
    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete job.",
        ) from exc

    if not was_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    return Response(status_code=status.HTTP_204_NO_CONTENT)
