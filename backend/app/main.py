import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import SessionLocal, create_tables, get_db
from app.models.alert import Alert
from app.models.adjustment import ManualAdjustment
from app.models.plan import Plan
from app.schemas.dashboard import AlertResponse, ManualAdjustmentResponse, PlanResponse
from app.seed.seed_data import seed
from app.api.v1.routes import health, dashboard, providers, settings as settings_routes

logger = logging.getLogger(__name__)


async def _background_sync():
    """Run a sync for auto-sync providers in the background after startup."""
    try:
        # Small delay to let startup complete
        await asyncio.sleep(2)
        from app.services.sync import sync_all_providers
        db = SessionLocal()
        try:
            results = await sync_all_providers(db)
            logger.info(f"Background startup sync results: {results}")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Background sync failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed
    create_tables()
    seed()
    # Non-blocking background sync
    asyncio.create_task(_background_sync())
    yield


app = FastAPI(title=settings.APP_TITLE, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(providers.router, prefix="/api/v1", tags=["providers"])
app.include_router(settings_routes.router, prefix="/api/v1", tags=["settings"])


# Additional routes for alerts, plans, adjustments (served from dashboard data)

@app.get("/api/v1/alerts", response_model=list[AlertResponse], tags=["alerts"])
def list_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    return [AlertResponse.model_validate(a) for a in alerts]


@app.get("/api/v1/plans", response_model=list[PlanResponse], tags=["plans"])
def list_plans(db: Session = Depends(get_db)):
    plans = db.query(Plan).all()
    return [PlanResponse.model_validate(p) for p in plans]


@app.get("/api/v1/adjustments", response_model=list[ManualAdjustmentResponse], tags=["adjustments"])
def list_adjustments(db: Session = Depends(get_db)):
    adjustments = db.query(ManualAdjustment).all()
    return [ManualAdjustmentResponse.model_validate(a) for a in adjustments]
