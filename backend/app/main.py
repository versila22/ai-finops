import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from sqlalchemy.orm import Session

from app.api.v1.routes import auth, dashboard, health, providers, settings as settings_routes
from app.auth import get_current_user
from app.core.config import settings
from app.core.db import SessionLocal, create_tables, get_db
from app.core.rate_limit import limiter
from app.models.adjustment import ManualAdjustment
from app.models.alert import Alert
from app.models.plan import Plan
from app.models.user import User
from app.schemas.dashboard import AlertResponse, ManualAdjustmentResponse, PlanResponse
from app.seed.seed_data import seed

logger = logging.getLogger(__name__)


async def _background_sync():
    """Run a sync for auto-sync providers in the background after startup."""
    try:
        await asyncio.sleep(2)
        from app.services.sync import sync_all_providers

        db = SessionLocal()
        try:
            results = await sync_all_providers(db)
            logger.info(f"Background startup sync results: {results}")
        finally:
            db.close()
    except Exception as exc:
        logger.error(f"Background sync failed: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    seed()
    asyncio.create_task(_background_sync())
    yield


app = FastAPI(title=settings.APP_TITLE, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(providers.router, prefix="/api/v1", tags=["providers"])
app.include_router(settings_routes.router, prefix="/api/v1", tags=["settings"])


@app.get("/api/v1/alerts", response_model=list[AlertResponse], tags=["alerts"])
def list_alerts(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = db.query(Alert).offset(offset).limit(limit).all()
    return [AlertResponse.model_validate(alert) for alert in alerts]


@app.get("/api/v1/plans", response_model=list[PlanResponse], tags=["plans"])
def list_plans(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plans = db.query(Plan).offset(offset).limit(limit).all()
    return [PlanResponse.model_validate(plan) for plan in plans]


@app.get("/api/v1/adjustments", response_model=list[ManualAdjustmentResponse], tags=["adjustments"])
def list_adjustments(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    adjustments = db.query(ManualAdjustment).offset(offset).limit(limit).all()
    return [ManualAdjustmentResponse.model_validate(adjustment) for adjustment in adjustments]
