from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# --- User & Profile ---
class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    username: str
    display_name: str
    home_type: str
    created_at: datetime

# --- Evidence Schemas ---
class EvidenceBase(BaseModel):
    evidence_type: str = Field(..., description="PHOTO_REFERENCE, USER_ATTESTATION, SIMULATED_SENSOR_TELEMETRY, DOUBLE_CHECK_NOTE")
    source: str = Field(..., description="E.g. Mobile Photo Upload, Front Door Lock Telemetry")
    description: str = Field(..., description="Specific verification observation")
    is_simulated: bool = Field(default=False, description="Must be true if not from real certified hardware")

class EvidenceCreate(EvidenceBase):
    task_id: str

class EvidenceResponse(EvidenceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    classification: str
    timestamp: datetime

# --- Task Events ---
class TaskEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    event_type: str
    from_status: Optional[str] = None
    to_status: Optional[str] = None
    actor: str
    notes: Optional[str] = None
    timestamp: datetime

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: str
    category: str
    priority: str = "HIGH"

class TaskCreate(TaskBase):
    plan_id: str

class TaskCreateManual(BaseModel):
    plan_id: str
    title: str
    description: str
    category: str = "General Safety"
    priority: str = "HIGH"
    status: str = "PENDING"

class TaskUpdateManual(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    completion_notes: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    requested_status: str
    completion_method: str = "manual_user_attestation"
    notes: Optional[str] = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    plan_id: str
    status: str
    completion_source: Optional[str] = None
    completion_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    evidence_count: int = 0
    evidence: Optional[List[EvidenceResponse]] = None

# --- Safety Plan Schemas ---
class SafetyPlanCreate(BaseModel):
    user_request: str
    duration_days: int = 7
    household_context: Optional[Dict[str, Any]] = None
    title: Optional[str] = None

class SafetyPlanUpdate(BaseModel):
    title: Optional[str] = None
    duration_days: Optional[int] = None
    user_request: Optional[str] = None
    household_context: Optional[str] = None

class SafetyPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    user_request: str
    duration_days: int
    household_context: str
    created_at: datetime
    updated_at: datetime
    task_count: int = 0

class SafetyPlanDetailResponse(SafetyPlanResponse):
    tasks: List[TaskResponse] = []

# --- Notifications Schemas ---
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    message: str
    category: str
    link_tab: str
    is_read: bool
    created_at: datetime

class NotificationCreate(BaseModel):
    title: str
    message: str
    category: str = "INFO"
    link_tab: str = "tasks"


# --- Metrics & Dashboard ---
class DashboardMetrics(BaseModel):
    total_tasks: int
    completed_unverified: int
    verified_tasks: int
    pending_tasks: int
    action_required_tasks: int
    unable_to_verify_tasks: int
    overall_progress_percent: float
    is_fully_prepared: bool

# --- Action Confirmations ---
class ConfirmationCreate(BaseModel):
    action_type: str
    target_id: str
    parameters: Optional[Dict[str, Any]] = None
    rationale: str

class ConfirmationResolve(BaseModel):
    approved: bool
    notes: Optional[str] = None

class ConfirmationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    action_type: str
    target_id: str
    parameters: str
    rationale: str
    status: str
    requested_at: datetime
    resolved_at: Optional[datetime] = None

# --- Safety Report ---
class SafetyReport(BaseModel):
    plan_id: str
    plan_title: str
    user_request: str
    duration_days: int
    generated_at: datetime
    metrics: DashboardMetrics
    verified_tasks: List[TaskResponse]
    completed_unverified_tasks: List[TaskResponse]
    pending_tasks: List[TaskResponse]
    action_required_tasks: List[TaskResponse]
    unable_to_verify_tasks: List[TaskResponse]
    recommendations: List[str]
    disclaimer: str

# --- Agent & MCP Interactive schemas ---
class AgentPlanRequest(BaseModel):
    prompt: str = Field(..., description="Natural language departure preparation request")
    duration_days: int = 7
    has_pets: bool = False
    has_plants: bool = True
    home_type: str = "Suburban House"
    winter_freeze_risk: bool = False

class AgentExecutionStep(BaseModel):
    step_number: int
    tool_name: str
    rationale: str
    inputs: Dict[str, Any]
    output: Any
    status: str = "SUCCESS"
    error: Optional[str] = None

class AgentPlanResult(BaseModel):
    plan: SafetyPlanDetailResponse
    execution_trace: List[AgentExecutionStep]
    agent_summary: str

class MCPToolInfo(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]

class MCPDirectCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

class MCPDirectCallResponse(BaseModel):
    tool_name: str
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time_ms: float
