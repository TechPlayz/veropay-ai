from fastapi import FastAPI

from init_db import init_db
from routes.auth import router as auth_router
from routes.dashboard import router as dashboard_router
from routes.jobs import router as jobs_router
from routes.ocr import router as ocr_router


app = FastAPI(
    title="VeroPay API",
    version="1.0.0",
)

init_db()

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(jobs_router)
app.include_router(ocr_router)


@app.get("/")
def root():
    return {"message": "Backend running"}
