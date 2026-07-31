from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.init_db import init_db
from app.routes import auth, chat, dashboard, jobs, ocr, rides, route_info

app = FastAPI(title="VeroPay API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(jobs.router)
app.include_router(ocr.router)
app.include_router(rides.router)
app.include_router(route_info.router)


@app.get("/")
def root():
    return {"message": "VeroPay API is running"}
