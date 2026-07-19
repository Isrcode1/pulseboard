from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import alerts, auth, catalog, pharmacy, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev bootstrap. In production run `alembic upgrade head` instead —
    # see backend/alembic/README for generating the initial migration.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="MedsAlert API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else ["https://medsalert.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(search.router)
app.include_router(pharmacy.router)
app.include_router(alerts.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
