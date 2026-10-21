import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class TaskPriority(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class TaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    VERIFIED = "VERIFIED"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    UNABLE_TO_VERIFY = "UNABLE_TO_VERIFY"

class ConfirmationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class EvidenceClassification(str, enum.Enum):
    DIRECT_EVIDENCE = "DIRECT_EVIDENCE"
    CORROBORATIVE = "CORROBORATIVE"
    INSUFFICIENT = "INSUFFICIENT"

class UserProfile(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, nullable=False, default="demo_homeowner")
    display_name = Column(String(100), default="Primary Homeowner")
    home_type = Column(String(100), default="Single Family Residence")
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    plans = relationship("SafetyPlan", back_populates="user", cascade="all, delete-orphan")

class SafetyPlan(Base):
    __tablename__ = "safety_plans"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    user_request = Column(Text, nullable=False)
    duration_days = Column(Integer, default=7)
    household_context = Column(Text, default="{}")  # JSON encoded context
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    user = relationship("UserProfile", back_populates="plans")
    tasks = relationship("Task", back_populates="plan", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String(36), ForeignKey("safety_plans.id"), nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # Doors, Windows, Appliances, Water & Gas, Security, Pets/Plants
    priority = Column(String(20), default=TaskPriority.HIGH.value, nullable=False)
    status = Column(String(30), default=TaskStatus.PENDING.value, nullable=False)
    completion_source = Column(String(100), nullable=True)
    completion_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    plan = relationship("SafetyPlan", back_populates="tasks")
    evidence = relationship("VerificationEvidence", back_populates="task", cascade="all, delete-orphan")
    events = relationship("TaskEvent", back_populates="task", cascade="all, delete-orphan")

class TaskEvent(Base):
    __tablename__ = "task_events"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # STATUS_CHANGE, EVIDENCE_ADDED, NOTE_ADDED
    from_status = Column(String(30), nullable=True)
    to_status = Column(String(30), nullable=True)
    actor = Column(String(100), default="system")
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now)
    
    task = relationship("Task", back_populates="events")

class VerificationEvidence(Base):
    __tablename__ = "verification_evidence"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    evidence_type = Column(String(100), nullable=False)  # PHOTO_REFERENCE, USER_ATTESTATION, SIMULATED_SENSOR_TELEMETRY, DOUBLE_CHECK_NOTE
    source = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    classification = Column(String(50), default=EvidenceClassification.DIRECT_EVIDENCE.value)
    is_simulated = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now)
    
    task = relationship("Task", back_populates="evidence")

class ActionConfirmation(Base):
    __tablename__ = "action_confirmations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action_type = Column(String(100), nullable=False)  # SET_AWAY_MODE, ARM_PERIMETER, NOTIFY_EMERGENCY_CONTACT
    target_id = Column(String(100), nullable=False)
    parameters = Column(Text, default="{}")  # JSON encoded parameters
    rationale = Column(Text, nullable=False)
    status = Column(String(30), default=ConfirmationStatus.PENDING.value, nullable=False)
    requested_at = Column(DateTime(timezone=True), default=get_utc_now)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="INFO")  # INFO, SUCCESS, WARNING, ALERT
    link_tab = Column(String(50), default="tasks")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

