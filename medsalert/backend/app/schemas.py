from datetime import datetime

from pydantic import BaseModel, Field

from app.models import StockStatus


class DrugOut(BaseModel):
    id: int
    generic_name: str
    brand_names: str
    strength: str
    form: str
    category: str

    model_config = {"from_attributes": True}


class OtpRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=30)


class OtpVerify(BaseModel):
    phone: str
    code: str = Field(min_length=4, max_length=8)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PharmacyOut(BaseModel):
    id: int
    name: str
    address: str
    area: str
    phone: str
    lat: float
    lng: float

    model_config = {"from_attributes": True}


class StockRow(BaseModel):
    drug: DrugOut
    status: StockStatus | None = None
    price: float | None = None
    updated_at: datetime | None = None


class StockUpdate(BaseModel):
    status: StockStatus
    price: float | None = Field(default=None, ge=0)


class SearchResult(BaseModel):
    pharmacy: PharmacyOut
    status: StockStatus
    price: float | None
    updated_at: datetime
    distance_km: float
    fresh: bool  # False = older than the staleness window, shown as "unconfirmed"


class SearchResponse(BaseModel):
    drug: DrugOut
    results: list[SearchResult]


class AlertCreate(BaseModel):
    phone: str = Field(min_length=8, max_length=30)
    drug_id: int
    lat: float | None = None
    lng: float | None = None


class StatsOut(BaseModel):
    searches_this_week: int
    alerts_pending: int
