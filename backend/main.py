
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import satellites, scheduling, auth, approvals, resources

app = FastAPI(
    title="SATLINK API",
    description="Satellite Communication and Ground Station Management"
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(satellites.router)
app.include_router(scheduling.router)
app.include_router(auth.router)
app.include_router(approvals.router)
app.include_router(resources.router)


@app.get("/")
def home():
    return {"message": "SATLINK Backend Running!"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "SATLINK"}
