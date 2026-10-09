export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskCategory = 'Assignment' | 'Exam Prep' | 'Reading' | 'Project' | 'Lab' | 'Review' | 'Study';

export interface Task {
  id: string;
  title: string;
  course: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  category: TaskCategory;
  status: TaskStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StudyBlock {
  id: string;
  timeRange: string;
  taskTitle: string;
  course: string;
  durationMinutes: number;
  energyLevel: 'Peak Focus' | 'High Focus' | 'Medium Focus' | 'Rest';
  description: string;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  focusSessionTitle: string;
  totalMinutes: number;
  strategy: string;
  blocks: StudyBlock[];
  createdAt: string;
}

export interface ProposedTaskPayload {
  id?: string;
  title: string;
  course: string;
  priority: Priority;
  dueDate: string;
  estimatedMinutes: number;
  category: TaskCategory;
  notes?: string;
}

export interface ProposedAction {
  id: string;
  tool: 'createTasks' | 'updateTask' | 'deleteTask' | 'completeTask' | 'generateStudyPlan';
  title: string;
  description: string;
  tasks?: ProposedTaskPayload[];
  taskId?: string;
  updates?: Partial<Task>;
}

export interface Commitment {
  title: string;
  deadline: string;
  urgency: string;
  type: 'exam' | 'assignment' | 'reading' | 'project';
}

export interface ExecutionReceipt {
  executedAt: string;
  success: boolean;
  actionsRun: number;
  tasksCreated: number;
  tasksUpdated: number;
  tasksCompleted: number;
  tasksDeleted: number;
  logs: string[];
}

export interface AgentPlanResponse {
  mode: 'live_gemini' | 'local_demo';
  badge: string;
  intentAnalysis: string;
  identifiedCommitments: Commitment[];
  missingInformationNotice?: string | null;
  reasoning: string;
  proposedActions: ProposedAction[];
  studyPlan?: {
    focusSessionTitle: string;
    totalMinutes: number;
    strategy: string;
    blocks: Array<{
      timeRange: string;
      taskTitle: string;
      course: string;
      durationMinutes: number;
      energyLevel: 'Peak Focus' | 'High Focus' | 'Medium Focus' | 'Rest';
      description: string;
    }>;
  };
  status?: 'pending_approval' | 'approved' | 'rejected' | 'executed';
  executionSummary?: ExecutionReceipt;
  errorNote?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text?: string;
  plan?: AgentPlanResponse;
}
