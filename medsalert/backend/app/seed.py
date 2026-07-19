"""Seed the drug catalog and a demo pharmacy.

Run inside the backend container or a venv:  python -m app.seed
Idempotent — safe to re-run.
"""

import asyncio

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import Drug, Pharmacy, PharmacyUser, StockEntry, StockStatus

# Curated MVP catalog: hypertension + diabetes essentials.
DRUGS = [
    ("Amlodipine", "Norvasc,Amlong", "5mg", "tablet", "hypertension"),
    ("Amlodipine", "Norvasc,Amlong", "10mg", "tablet", "hypertension"),
    ("Lisinopril", "Zestril,Prinivil", "10mg", "tablet", "hypertension"),
    ("Losartan", "Cozaar", "50mg", "tablet", "hypertension"),
    ("Hydrochlorothiazide", "Esidrex", "25mg", "tablet", "hypertension"),
    ("Nifedipine", "Adalat", "20mg", "tablet", "hypertension"),
    ("Atenolol", "Tenormin", "50mg", "tablet", "hypertension"),
    ("Ramipril", "Tritace", "5mg", "tablet", "hypertension"),
    ("Metoprolol", "Lopressor", "50mg", "tablet", "hypertension"),
    ("Metformin", "Glucophage", "500mg", "tablet", "diabetes"),
    ("Metformin", "Glucophage", "850mg", "tablet", "diabetes"),
    ("Glibenclamide", "Daonil", "5mg", "tablet", "diabetes"),
    ("Gliclazide", "Diamicron", "80mg", "tablet", "diabetes"),
    ("Insulin glargine", "Lantus", "100IU/ml", "injection", "diabetes"),
    ("Insulin NPH", "Insulatard", "100IU/ml", "injection", "diabetes"),
    ("Atorvastatin", "Lipitor", "20mg", "tablet", "hypertension"),
]

DEMO_PHARMACY = {
    "name": "HealthPlus Pharmacy (Demo)",
    "address": "23 Allen Avenue, Ikeja",
    "area": "Ikeja",
    "phone": "+2348000000000",
    "lat": 6.6018,
    "lng": 3.3515,
}
DEMO_USER_PHONE = "+2348000000001"


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        for generic, brands, strength, form, category in DRUGS:
            exists = await db.scalar(
                select(Drug).where(
                    Drug.generic_name == generic, Drug.strength == strength, Drug.form == form
                )
            )
            if not exists:
                db.add(
                    Drug(
                        generic_name=generic,
                        brand_names=brands,
                        strength=strength,
                        form=form,
                        category=category,
                    )
                )
        await db.commit()

        pharmacy = await db.scalar(select(Pharmacy).where(Pharmacy.name == DEMO_PHARMACY["name"]))
        if pharmacy is None:
            pharmacy = Pharmacy(**DEMO_PHARMACY)
            db.add(pharmacy)
            await db.flush()
            db.add(
                PharmacyUser(
                    pharmacy_id=pharmacy.id, phone=DEMO_USER_PHONE, display_name="Demo Attendant"
                )
            )
            # Give the demo pharmacy some stock so /search returns results.
            drugs = (await db.scalars(select(Drug).limit(6))).all()
            for drug in drugs:
                db.add(
                    StockEntry(
                        pharmacy_id=pharmacy.id,
                        drug_id=drug.id,
                        status=StockStatus.in_stock,
                        price=1500.0,
                    )
                )
            await db.commit()

    print(f"Seeded {len(DRUGS)} drugs. Demo pharmacy login phone: {DEMO_USER_PHONE}")
    print("(OTP codes print to the backend logs when SMS_PROVIDER=console.)")


if __name__ == "__main__":
    asyncio.run(seed())
