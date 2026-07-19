import enum
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StockStatus(str, enum.Enum):
    in_stock = "in_stock"
    low = "low"
    out_of_stock = "out_of_stock"


class AlertStatus(str, enum.Enum):
    pending = "pending"
    notified = "notified"


class Drug(Base):
    __tablename__ = "drugs"
    __table_args__ = (UniqueConstraint("generic_name", "strength", "form"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    generic_name: Mapped[str] = mapped_column(String(120), index=True)
    brand_names: Mapped[str] = mapped_column(Text, default="")  # comma-separated
    strength: Mapped[str] = mapped_column(String(50))
    form: Mapped[str] = mapped_column(String(50))  # tablet, injection, ...
    category: Mapped[str] = mapped_column(String(80))  # hypertension, diabetes

    stock_entries: Mapped[list["StockEntry"]] = relationship(back_populates="drug")


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    address: Mapped[str] = mapped_column(Text)
    area: Mapped[str] = mapped_column(String(120), index=True)
    phone: Mapped[str] = mapped_column(String(30))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    users: Mapped[list["PharmacyUser"]] = relationship(back_populates="pharmacy")
    stock_entries: Mapped[list["StockEntry"]] = relationship(back_populates="pharmacy")


class PharmacyUser(Base):
    __tablename__ = "pharmacy_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pharmacy_id: Mapped[int] = mapped_column(ForeignKey("pharmacies.id"))
    phone: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    pharmacy: Mapped["Pharmacy"] = relationship(back_populates="users")


class StockEntry(Base):
    __tablename__ = "stock_entries"
    __table_args__ = (UniqueConstraint("pharmacy_id", "drug_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pharmacy_id: Mapped[int] = mapped_column(ForeignKey("pharmacies.id"), index=True)
    drug_id: Mapped[int] = mapped_column(ForeignKey("drugs.id"), index=True)
    status: Mapped[StockStatus] = mapped_column(Enum(StockStatus), default=StockStatus.out_of_stock)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    pharmacy: Mapped["Pharmacy"] = relationship(back_populates="stock_entries")
    drug: Mapped["Drug"] = relationship(back_populates="stock_entries")


class StockAlert(Base):
    __tablename__ = "stock_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    phone: Mapped[str] = mapped_column(String(30), index=True)
    drug_id: Mapped[int] = mapped_column(ForeignKey("drugs.id"), index=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[AlertStatus] = mapped_column(Enum(AlertStatus), default=AlertStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SearchLog(Base):
    __tablename__ = "search_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    drug_id: Mapped[int] = mapped_column(ForeignKey("drugs.id"), index=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    results_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
