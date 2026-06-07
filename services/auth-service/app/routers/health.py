from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "pulseboard-auth",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
