from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from config import settings
from services.database import init_db
from routes import webhooks_router, leads_router, analytics_router, auth_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Project Apex Logic Engine...")
    await init_db()
    logger.info("Database initialised.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Project Apex — Logic Engine",
    description=(
        "FastAPI middleware for Project Apex: handles lead webhooks, "
        "Twilio SMS, SendGrid Email, GA4 event piping, and the Admin CRM API."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware ─────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=500)

# ── Routers ────────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(webhooks_router)
app.include_router(leads_router)
app.include_router(analytics_router)


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "apex-logic-engine"}


@app.get("/", tags=["Health"])
async def root():
    return {
        "project": "Project Apex",
        "version": "1.0.0",
        "docs": "/docs",
    }
