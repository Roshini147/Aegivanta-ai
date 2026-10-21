export interface DashboardMetrics {
  total_tasks: number;
  completed_unverified: number;
  verified_tasks: number;
  pending_tasks: number;
  action_required_tasks: number;
  unable_to_verify_tasks: number;
  overall_progress_percent: number;
  is_fully_prepared: boolean;
}

export interface VerificationEvidence {
  id: string;
  task_id: string;
  evidence_type: string;
  source: string;
  description: string;
  classification: string;
  is_simulated: boolean;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED' | 'VERIFIED' | 'ACTION_REQUIRED' | 'UNABLE_TO_VERIFY';
  completion_source?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  evidence_count: number;
  evidence?: VerificationEvidence[];
}

export interface SafetyPlan {
  id: string;
  user_id: string;
  title: string;
  user_request: string;
  duration_days: number;
  household_context: string;
  created_at: string;
  updated_at: string;
  task_count: number;
  tasks?: TaskItem[];
}

export interface TaskEvent {
  id: string;
  task_id: string;
  event_type: string;
  from_status?: string;
  to_status?: string;
  actor: string;
  notes?: string;
  timestamp: string;
}

export interface ActionConfirmation {
  id: string;
  action_type: string;
  target_id: string;
  parameters: string;
  rationale: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requested_at: string;
  resolved_at?: string;
}

export interface SafetyReport {
  plan_id: string;
  plan_title: string;
  user_request: string;
  duration_days: number;
  generated_at: string;
  metrics: DashboardMetrics;
  verified_tasks: TaskItem[];
  completed_unverified_tasks: TaskItem[];
  pending_tasks: TaskItem[];
  action_required_tasks: TaskItem[];
  unable_to_verify_tasks: TaskItem[];
  recommendations: string[];
  disclaimer: string;
}

export interface AgentExecutionStep {
  step_number: number;
  tool_name: string;
  rationale: string;
  inputs: Record<string, any>;
  output: any;
  status: string;
  error?: string;
}

export interface AgentPlanResult {
  plan: SafetyPlan;
  execution_trace: AgentExecutionStep[];
  agent_summary: string;
}

export interface MCPToolInfo {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

export interface MCPCallHistoryItem {
  timestamp: number;
  tool_name: string;
  arguments: Record<string, any>;
  status: string;
  duration_ms?: number;
  output?: any;
  error?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link_tab: string;
  is_read: boolean;
  created_at: string;
}

export interface TaskCreatePayload {
  plan_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: string;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  category?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status?: string;
  completion_notes?: string;
}

export interface PlanUpdatePayload {
  title?: string;
  duration_days?: number;
  user_request?: string;
  household_context?: string;
}

