from fastapi import FastAPI

from routes.jobs import router as jobs_router
from routes.ocr import router as ocr_router


app = FastAPI(
    title="VeroPay API",
    version="1.0.0",
)

app.include_router(jobs_router)
app.include_router(ocr_router)


@app.get("/")
def root():
    return {"message": "Backend running"}
