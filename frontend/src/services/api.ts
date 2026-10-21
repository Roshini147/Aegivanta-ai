import {
  SafetyPlan,
  TaskItem,
  DashboardMetrics,
  VerificationEvidence,
  TaskEvent,
  ActionConfirmation,
  SafetyReport,
  AgentPlanResult,
  MCPToolInfo,
  MCPCallHistoryItem
} from '../types';

const DIRECT_BACKEND = 'http://127.0.0.1:8000';

async function fetchApi(path: string, options: RequestInit = {}): Promise<Response> {
  const proxyUrl = `/api${path.startsWith('/') ? path : `/${path}`}`;
  const directUrl = `${DIRECT_BACKEND}/api${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const res = await fetch(proxyUrl, options);
    // If the proxy returns a gateway error or not found, try the direct backend endpoint
    if (!res.ok && (res.status === 404 || res.status === 502 || res.status === 504)) {
      console.warn(`[API Proxy] ${proxyUrl} returned ${res.status}. Falling back to direct URL: ${directUrl}`);
      return await fetch(directUrl, options);
    }
    return res;
  } catch (proxyError) {
    console.warn(`[API Proxy] Connection to ${proxyUrl} failed, falling back to direct URL: ${directUrl}`, proxyError);
    return await fetch(directUrl, options);
  }
}

export const api = {
  // Plans
  async listPlans(): Promise<SafetyPlan[]> {
    const res = await fetchApi('/plans');
    if (!res.ok) throw new Error('Failed to fetch plans');
    return res.json();
  },

  async getPlan(planId: string): Promise<SafetyPlan> {
    const res = await fetchApi(`/plans/${planId}`);
    if (!res.ok) throw new Error('Failed to fetch plan details');
    return res.json();
  },

  async createPlan(payload: {
    user_query: string;
    destination?: string;
    departure_date?: string;
    return_date?: string;
  }): Promise<SafetyPlan> {
    const res = await fetchApi('/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Trip to ${payload.destination || 'Chennai'}`,
        user_request: payload.user_query,
        duration_days: 14,
        household_context: {
          destination: payload.destination || 'Chennai',
          departure_date: payload.departure_date,
          return_date: payload.return_date
        }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create plan');
    }
    return res.json();
  },

  async getMetrics(planId: string): Promise<DashboardMetrics> {
    const res = await fetchApi(`/plans/${planId}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  // Tasks
  async getTasks(planId: string, status?: string): Promise<TaskItem[]> {
    const query = new URLSearchParams({ plan_id: planId });
    if (status) query.append('status', status);
    const res = await fetchApi(`/tasks?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async updateTaskStatus(
    taskId: string,
    requestedStatus: string,
    completionMethod: string = 'manual_user_attestation',
    notes?: string
  ): Promise<{ task_id: string; status: string; final_status: string; reason: string }> {
    const res = await fetchApi(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requested_status: requestedStatus,
        completion_method: completionMethod,
        notes
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update task status');
    }
    return res.json();
  },

  async getTaskEvents(taskId: string): Promise<TaskEvent[]> {
    const res = await fetchApi(`/tasks/${taskId}/events`);
    if (!res.ok) throw new Error('Failed to fetch task events');
    return res.json();
  },

  // Evidence
  async recordEvidence(payload: {
    task_id: string;
    evidence_type: string;
    source: string;
    description: string;
    is_simulated?: boolean;
  }): Promise<VerificationEvidence> {
    const res = await fetchApi('/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to record evidence');
    }
    return res.json();
  },

  async getEvidence(taskId: string): Promise<VerificationEvidence[]> {
    const res = await fetchApi(`/evidence/${taskId}`);
    if (!res.ok) throw new Error('Failed to fetch evidence');
    return res.json();
  },

  // Confirmations
  async getPendingConfirmations(): Promise<ActionConfirmation[]> {
    const res = await fetchApi('/confirmations');
    if (!res.ok) throw new Error('Failed to fetch confirmations');
    return res.json();
  },

  async requestConfirmation(payload: {
    action_type: string;
    target_id: string;
    rationale: string;
    parameters?: Record<string, any>;
  }): Promise<ActionConfirmation> {
    const res = await fetchApi('/confirmations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to request confirmation');
    return res.json();
  },

  async resolveConfirmation(
    confirmationId: string,
    approved: boolean,
    notes?: string
  ): Promise<{ outcome_message: string; status: string }> {
    const res = await fetchApi(`/confirmations/${confirmationId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, notes })
    });
    if (!res.ok) throw new Error('Failed to resolve confirmation');
    return res.json();
  },

  // Reports
  async getSafetyReport(planId: string): Promise<SafetyReport> {
    const res = await fetchApi(`/reports/${planId}`);
    if (!res.ok) throw new Error('Failed to generate safety report');
    return res.json();
  },

  // Agent Orchestration
  async generateAgentPlan(payload: {
    prompt: string;
    duration_days: number;
    has_pets: boolean;
    has_plants: boolean;
    home_type: string;
    winter_freeze_risk: boolean;
  }): Promise<AgentPlanResult> {
    const res = await fetchApi('/agent/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Agent planning failed');
    }
    return res.json();
  },

  async simulateTelemetry(planId: string): Promise<any> {
    const res = await fetchApi(`/agent/simulate-telemetry?plan_id=${encodeURIComponent(planId)}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run telemetry simulation');
    return res.json();
  },

  // Task CRUD operations
  async createTask(payload: {
    plan_id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status?: string;
  }): Promise<TaskItem> {
    const res = await fetchApi('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create task');
    }
    return res.json();
  },

  async updateTask(
    taskId: string,
    payload: {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
      status?: string;
      completion_notes?: string;
    }
  ): Promise<TaskItem> {
    const res = await fetchApi(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update task');
    }
    return res.json();
  },

  async deleteTask(taskId: string): Promise<{ success: boolean; task_id: string }> {
    const res = await fetchApi(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete task');
    }
    return res.json();
  },

  // Plan Updates
  async updatePlan(
    planId: string,
    payload: {
      title?: string;
      duration_days?: number;
      user_request?: string;
      household_context?: string;
    }
  ): Promise<SafetyPlan> {
    const res = await fetchApi(`/plans/${planId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update plan');
    }
    return res.json();
  },

  async deletePlan(planId: string): Promise<{ success: boolean; plan_id: string }> {
    const res = await fetchApi(`/plans/${planId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete plan');
    }
    return res.json();
  },

  // Notifications
  async listNotifications(): Promise<any[]> {
    const res = await fetchApi('/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<any> {
    const res = await fetchApi(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  async markAllNotificationsRead(): Promise<any> {
    const res = await fetchApi('/notifications/mark-all-read', {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to mark all notifications as read');
    return res.json();
  },

  async deleteNotification(id: string): Promise<any> {
    const res = await fetchApi(`/notifications/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return res.json();
  },

  // MCP Developer Panel
  async getMCPStatus(): Promise<any> {
    const res = await fetchApi('/mcp/status');
    if (!res.ok) throw new Error('Failed to fetch MCP status');
    return res.json();
  },

  async listMCPTools(): Promise<MCPToolInfo[]> {
    const res = await fetchApi('/mcp/tools');
    if (!res.ok) throw new Error('Failed to list MCP tools');
    return res.json();
  },

  async getMCPHistory(): Promise<MCPCallHistoryItem[]> {
    const res = await fetchApi('/mcp/history');
    if (!res.ok) throw new Error('Failed to fetch MCP history');
    return res.json();
  }
};

