import os
import uuid
import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.models.entities import (
    Base,
    UserProfile,
    SafetyPlan,
    Task,
    TaskEvent,
    VerificationEvidence,
    TaskStatus,
    TaskPriority,
    EvidenceClassification,
    Notification
)


# Async Engine for FastAPI
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Sync Engine for MCP Server tools and migrations
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    class_=Session,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_sync_db() -> Session:
    db = SyncSessionLocal()
    try:
        return db
    finally:
        pass

async def init_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Check default primary user Roshini
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserProfile).where(UserProfile.username == "roshini"))
        user = result.scalars().first()
        if not user:
            user = UserProfile(
                id=str(uuid.uuid4()),
                username="roshini",
                display_name="Roshini",
                home_type="Modern Two-Story Residence"
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)

        # Check default plan: Trip to Chennai
        p_res = await session.execute(select(SafetyPlan).where(SafetyPlan.title == "Trip to Chennai"))
        plan = p_res.scalars().first()
        if not plan:
            plan = SafetyPlan(
                id=str(uuid.uuid4()),
                user_id=user.id,
                title="Trip to Chennai",
                user_request="I'm leaving for Chennai for two weeks. Help me prepare my home safely.",
                duration_days=14,
                household_context=json.dumps({"destination": "Chennai", "duration": "14 days", "has_pets": True, "has_plants": True})
            )
            session.add(plan)
            await session.commit()
            await session.refresh(plan)

            # Seed the 12 precise tasks from the design reference
            task_specs = [
                {
                    "title": "Check exterior doors and locks",
                    "description": "Engage primary deadbolts on front entry, patio, and garage side doors. Ensure latch plates are secure.",
                    "category": "Doors & Perimeter",
                    "priority": TaskPriority.HIGH.value,
                    "status": TaskStatus.VERIFIED.value,
                    "evidence": {
                        "type": "PHOTO_REFERENCE",
                        "source": "Smart Door Lock + Mobile Camera",
                        "desc": "Verified via Smart Lock telemetry and timestamped photo of engaged deadbolt throw.",
                        "class": EvidenceClassification.DIRECT_EVIDENCE.value
                    }
                },
                {
                    "title": "Check accessible windows",
                    "description": "Verify ground-floor and basement hopper windows are locked with latches firmly engaged.",
                    "category": "Windows & Latches",
                    "priority": TaskPriority.HIGH.value,
                    "status": TaskStatus.COMPLETED.value,
                    "evidence": {
                        "type": "USER_ATTESTATION",
                        "source": "User Confirmation",
                        "desc": "Visual confirmation and physical latch push test completed by homeowner.",
                        "class": EvidenceClassification.CORROBORATIVE.value
                    }
                },
                {
                    "title": "Review appliance safety",
                    "description": "Unplug small countertop appliances and check oven, stove, and washer valves.",
                    "category": "Plumbing & Appliances",
                    "priority": TaskPriority.MEDIUM.value,
                    "status": TaskStatus.PENDING.value,
                    "evidence": None
                },
                {
                    "title": "Review lighting preferences",
                    "description": "Configure smart lighting schedules for occupied evening appearance between 6:30 PM - 10:30 PM.",
                    "category": "Lighting & Security",
                    "priority": TaskPriority.MEDIUM.value,
                    "status": TaskStatus.VERIFIED.value,
                    "evidence": {
                        "type": "DEVICE_LOG",
                        "source": "Smart Lighting Controller",
                        "desc": "Automated schedule active in smart home gateway with simulated presence routine.",
                        "class": EvidenceClassification.DIRECT_EVIDENCE.value
                    }
                },
                {
                    "title": "Arrange pet care",
                    "description": "Confirm pet sitting schedule, feeding instructions, and emergency vet contacts.",
                    "category": "Pets & Household",
                    "priority": TaskPriority.MEDIUM.value,
                    "status": TaskStatus.PENDING.value,
                    "evidence": None
                },
                {
                    "title": "Review emergency contacts",
                    "description": "Confirm neighbor has spare key and local emergency numbers are up to date.",
                    "category": "Security & Logistics",
                    "priority": TaskPriority.LOW.value,
                    "status": TaskStatus.COMPLETED.value,
                    "evidence": {
                        "type": "USER_ATTESTATION",
                        "source": "User Confirmation",
                        "desc": "Keyholder details verified with primary contact via phone check.",
                        "class": EvidenceClassification.CORROBORATIVE.value
                    }
                },
                {
                    "title": "Check main water supply valve",
                    "description": "Shut off main water valve or supply lines to washing machine to prevent accidental leaks.",
                    "category": "Plumbing & Appliances",
                    "priority": TaskPriority.HIGH.value,
                    "status": TaskStatus.VERIFIED.value,
                    "evidence": {
                        "type": "SENSOR_TELEMETRY",
                        "source": "Inline Water Flow Meter",
                        "desc": "Flow sensor reports 0.00 GPM flow for over 4 hours with valve actuator in shut position.",
                        "class": EvidenceClassification.DIRECT_EVIDENCE.value
                    }
                },
                {
                    "title": "Unplug high-draw small electronics",
                    "description": "Disconnect electric kettles, toasters, space heaters, and desktop equipment.",
                    "category": "Plumbing & Appliances",
                    "priority": TaskPriority.MEDIUM.value,
                    "status": TaskStatus.COMPLETED.value,
                    "evidence": None
                },
                {
                    "title": "Configure HVAC departure eco threshold",
                    "description": "Set heating to 62°F / cooling to 78°F to preserve indoor air quality efficiently.",
                    "category": "HVAC & Energy",
                    "priority": TaskPriority.MEDIUM.value,
                    "status": TaskStatus.COMPLETED.value,
                    "evidence": None
                },
                {
                    "title": "Submit postal hold and package delivery request",
                    "description": "Hold mail delivery for the trip duration to prevent an overflowing mailbox.",
                    "category": "Security & Logistics",
                    "priority": TaskPriority.MEDIUM.value,
                    "status": TaskStatus.COMPLETED.value,
                    "evidence": None
                },
                {
                    "title": "Secure side perimeter gate and secondary lock",
                    "description": "Verify padlock on side perimeter wooden fence gate is locked.",
                    "category": "Doors & Perimeter",
                    "priority": TaskPriority.HIGH.value,
                    "status": TaskStatus.ACTION_REQUIRED.value,
                    "evidence": None
                },
                {
                    "title": "Verify battery health on smoke and CO detectors",
                    "description": "Test test buttons on hallway and bedroom smoke and carbon monoxide sensors.",
                    "category": "Security & Logistics",
                    "priority": TaskPriority.CRITICAL.value,
                    "status": TaskStatus.ACTION_REQUIRED.value,
                    "evidence": None
                }
            ]

            for s in task_specs:
                t = Task(
                    id=str(uuid.uuid4()),
                    plan_id=plan.id,
                    title=s["title"],
                    description=s["description"],
                    category=s["category"],
                    priority=s["priority"],
                    status=s["status"],
                    completion_source="Aegivanta Coordinator"
                )
                session.add(t)
                await session.flush()

                if s["evidence"]:
                    ev = VerificationEvidence(
                        id=str(uuid.uuid4()),
                        task_id=t.id,
                        evidence_type=s["evidence"]["type"],
                        source=s["evidence"]["source"],
                        description=s["evidence"]["desc"],
                        classification=s["evidence"]["class"],
                        is_simulated=False
                    )
                    session.add(ev)

            await session.commit()
