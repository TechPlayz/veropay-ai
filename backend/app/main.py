from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.init_db import init_db
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.jobs import router as jobs_router
from app.routes.ocr import router as ocr_router


app = FastAPI(
    title="VeroPay API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(jobs_router)
app.include_router(ocr_router)


@app.get("/")
def root():
    return {"message": "VeroPay API is running"}
