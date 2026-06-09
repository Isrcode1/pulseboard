from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.database import engine, Base
from app.config import settings
from app.routers import health, profile, public


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="PulseBoard Profile Service",
    version="0.1.0",
    description="Profile management — create, update, view public profiles",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(health.router, tags=["health"])
app.include_router(profile.router, tags=["profile"])
app.include_router(public.router, tags=["public"])


@app.get("/")
async def root():
    return {
        "service": "pulseboard-profile",
        "version": "0.1.0",
        "status": "running",
    }
