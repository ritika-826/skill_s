from fastapi import FastAPI

from app.routes.generate import router as generate_router


app = FastAPI(
    title="Skill-Specific AI Service"
)


app.include_router(
    generate_router,
    prefix="/api/ai"
)


@app.get("/")
def home():

    return {
        "message": "AI Service is running"
    }