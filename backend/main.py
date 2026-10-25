
from fastapi import FastAPI
from routers import satellites, scheduling, auth, approvals
app = FastAPI(
    title="SATLINK API",
    description="Satellite Communication and Ground Station Management"
)

app.include_router(satellites.router)
app.include_router(scheduling.router)
app.include_router(auth.router)
app.include_router(approvals.router)
@app.get("/")
def home():
    return {"message": "SATLINK Backend Running!"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "SATLINK"}
