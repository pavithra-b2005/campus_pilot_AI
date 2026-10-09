import { Task, Priority, TaskCategory, StudyPlan, ProposedAction, ExecutionReceipt } from '../types';

const STORAGE_KEY_TASKS = 'campuspilot_tasks_v1';
const STORAGE_KEY_PLAN = 'campuspilot_active_plan_v1';
const STORAGE_KEY_CHAT = 'campuspilot_messages_v2';

// Initial realistic college demo tasks
const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'CS 301: Implement Red-Black Tree Balance Logic',
    course: 'CS 301 Data Structures',
    priority: 'High',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    estimatedMinutes: 90,
    category: 'Assignment',
    status: 'pending',
    notes: 'Verify left & right rotations against automated test suite.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    title: 'MATH 240: Read Chapters 4 & 5 on Graph Theory',
    course: 'MATH 240 Discrete Math',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedMinutes: 50,
    category: 'Reading',
    status: 'pending',
    notes: 'Highlight Euler path theorem and planar graph properties.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'ENG 110: Draft Technical Writing Abstract',
    course: 'ENG 110 Tech Comm',
    priority: 'Low',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedMinutes: 30,
    category: 'Assignment',
    status: 'completed',
    completedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    notes: 'Submitted peer review draft.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'demo-4',
    title: 'PHYS 210: Lab Report on Optics & Diffraction',
    course: 'PHYS 210 Physics II',
    priority: 'High',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Overdue example
    estimatedMinutes: 60,
    category: 'Lab',
    status: 'pending',
    notes: 'Calculate percent error from laser slit measurements.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

// In-memory fallback if localStorage is unavailable
let memoryTasksStore: Task[] = [...INITIAL_DEMO_TASKS];
let memoryPlanStore: StudyPlan | null = null;

function isBrowserStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

// 1. listTasks()
export function listTasks(): Task[] {
  if (!isBrowserStorageAvailable()) {
    return memoryTasksStore;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return memoryTasksStore;
  }
}

// Save tasks helper
function saveTasks(tasks: Task[]): void {
  memoryTasksStore = [...tasks];
  if (!isBrowserStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    window.dispatchEvent(new Event('campuspilot_tasks_updated'));
  } catch (err) {
    // ignore
  }
}

// Helper to sanitize priority
function sanitizePriority(p: any): Priority {
  if (!p) return 'Medium';
  const str = String(p).toLowerCase();
  if (str.includes('high') || str.includes('urgent') || str.includes('crit')) return 'High';
  if (str.includes('low')) return 'Low';
  return 'Medium';
}

// Helper to sanitize category
function sanitizeCategory(c: any): TaskCategory {
  const allowed: TaskCategory[] = ['Assignment', 'Exam Prep', 'Reading', 'Project', 'Lab', 'Review', 'Study'];
  if (allowed.includes(c)) return c;
  const str = String(c || '').toLowerCase();
  if (str.includes('exam')) return 'Exam Prep';
  if (str.includes('read')) return 'Reading';
  if (str.includes('proj')) return 'Project';
  if (str.includes('lab')) return 'Lab';
  if (str.includes('rev')) return 'Review';
  return 'Assignment';
}

// Helper to ensure valid ISO date string (YYYY-MM-DD)
function sanitizeDueDate(d: any): string {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
    return d.trim();
  }
  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {
    // fallback
  }
  // Default to tomorrow if invalid
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// 2. createTasks()
export function createTasks(newTasks: Partial<Task>[]): Task[] {
  const current = listTasks();
  const created: Task[] = [];
  const existingIds = new Set(current.map((t) => t.id));

  for (const item of newTasks) {
    if (!item.title || item.title.trim() === '') continue;

    // Generate unique ID avoiding collision
    let taskId = item.id;
    if (!taskId || existingIds.has(taskId)) {
      taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
    existingIds.add(taskId);

    const task: Task = {
      id: taskId,
      title: item.title.trim(),
      course: item.course ? item.course.trim() : 'General Academics',
      priority: sanitizePriority(item.priority),
      dueDate: sanitizeDueDate(item.dueDate),
      estimatedMinutes: Math.max(10, Math.min(480, Number(item.estimatedMinutes) || 45)),
      category: sanitizeCategory(item.category),
      status: item.status === 'completed' ? 'completed' : 'pending',
      notes: item.notes ? item.notes.trim() : '',
      createdAt: item.createdAt || new Date().toISOString(),
    };

    created.push(task);
    current.unshift(task);
  }

  saveTasks(current);
  return created;
}

// 3. updateTask()
export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const current = listTasks();
  const index = current.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const updated: Task = {
    ...current[index],
    ...updates,
  };

  current[index] = updated;
  saveTasks(current);
  return updated;
}

// 4. completeTask()
export function completeTask(id: string): Task | null {
  const current = listTasks();
  const target = current.find((t) => t.id === id);
  if (!target) return null;

  const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
  return updateTask(id, {
    status: nextStatus,
    completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
  });
}

// 5. deleteTask()
export function deleteTask(id: string): boolean {
  const current = listTasks();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length === current.length) return false;

  saveTasks(filtered);
  return true;
}

// 6. generateStudyPlan()
export function generateStudyPlan(availableMinutes: number = 180): StudyPlan {
  const tasks = listTasks().filter((t) => t.status !== 'completed');

  // Sort by priority and due date
  const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const sorted = [...tasks].sort((a, b) => {
    const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (diff !== 0) return diff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const blocks: StudyPlan['blocks'] = [];
  let remainingTime = availableMinutes;
  let blockIndex = 1;

  for (const task of sorted) {
    if (remainingTime <= 0) break;
    const duration = Math.min(task.estimatedMinutes || 45, remainingTime);

    blocks.push({
      id: `block-${blockIndex}`,
      timeRange: `Sprint ${blockIndex} (${duration}m)`,
      taskTitle: task.title,
      course: task.course,
      durationMinutes: duration,
      energyLevel: blockIndex === 1 ? 'Peak Focus' : 'High Focus',
      description: `Target: Complete core objectives for ${task.course} (${task.priority} Priority).`,
      completed: false,
    });

    remainingTime -= duration;
    blockIndex++;

    // Add rest break if more time remains
    if (remainingTime >= 15 && blockIndex <= 3) {
      blocks.push({
        id: `block-${blockIndex}-break`,
        timeRange: `Rest (10m)`,
        taskTitle: 'Cognitive Reset & Hydration Break',
        course: 'Wellness',
        durationMinutes: 10,
        energyLevel: 'Rest',
        description: 'Stand up, hydrate, and prepare mental context for next block.',
        completed: false,
      });
      remainingTime -= 10;
      blockIndex++;
    }
  }

  const plan: StudyPlan = {
    id: `plan-${Date.now()}`,
    focusSessionTitle: `${Math.round(availableMinutes / 60)}h High-Yield Academic Sprint`,
    totalMinutes: availableMinutes - remainingTime,
    strategy: 'Algorithmic prioritization targeting highest-impact deadlines first with structured Pomodoro breaks.',
    blocks,
    createdAt: new Date().toISOString(),
  };

  saveActivePlan(plan);
  return plan;
}

// Storage for active plan
export function getActivePlan(): StudyPlan | null {
  if (!isBrowserStorageAvailable()) {
    return memoryPlanStore;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAN);
    return raw ? JSON.parse(raw) : memoryPlanStore;
  } catch (err) {
    return memoryPlanStore;
  }
}

export function saveActivePlan(plan: StudyPlan): void {
  memoryPlanStore = plan;
  if (!isBrowserStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
    window.dispatchEvent(new Event('campuspilot_plan_updated'));
  } catch (err) {
    // ignore
  }
}

// Reset data to default
export function resetDemoData(): void {
  memoryTasksStore = [...INITIAL_DEMO_TASKS];
  memoryPlanStore = null;
  if (!isBrowserStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(INITIAL_DEMO_TASKS));
    localStorage.removeItem(STORAGE_KEY_PLAN);
    localStorage.removeItem(STORAGE_KEY_CHAT);
    window.dispatchEvent(new Event('campuspilot_tasks_updated'));
    window.dispatchEvent(new Event('campuspilot_plan_updated'));
  } catch (err) {
    // ignore
  }
}

// 7. executeApprovedPlan() - Real application function executing approved actions
export function executeApprovedPlan(
  actions: ProposedAction[],
  proposedStudyPlan?: any
): ExecutionReceipt {
  const receipt: ExecutionReceipt = {
    executedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    success: true,
    actionsRun: 0,
    tasksCreated: 0,
    tasksUpdated: 0,
    tasksCompleted: 0,
    tasksDeleted: 0,
    logs: [],
  };

  if (!actions || actions.length === 0) {
    receipt.logs.push('ℹ️ No task tool actions were proposed in this plan.');
  }

  for (const action of actions || []) {
    try {
      receipt.actionsRun++;

      switch (action.tool) {
        case 'createTasks': {
          if (action.tasks && action.tasks.length > 0) {
            const created = createTasks(action.tasks);
            if (created.length > 0) {
              receipt.tasksCreated += created.length;
              receipt.logs.push(
                `✅ Executed createTasks(): Saved ${created.length} task(s) into database: [${created
                  .map((t) => `"${t.title}" (${t.priority} Priority, Due ${t.dueDate})`)
                  .join(', ')}]`
              );
            } else {
              receipt.success = false;
              receipt.logs.push(`⚠️ createTasks(): Provided tasks had invalid formats or missing titles.`);
            }
          } else {
            receipt.logs.push(`⚠️ createTasks(): Skipped because task payload was empty.`);
          }
          break;
        }

        case 'updateTask': {
          if (action.taskId && action.updates) {
            const updated = updateTask(action.taskId, action.updates);
            if (updated) {
              receipt.tasksUpdated++;
              receipt.logs.push(`✅ Executed updateTask(): Updated task "${updated.title}" successfully.`);
            } else {
              receipt.success = false;
              receipt.logs.push(`❌ updateTask(): Target task ID "${action.taskId}" was not found.`);
            }
          } else {
            receipt.success = false;
            receipt.logs.push(`⚠️ updateTask(): Missing taskId or updates payload.`);
          }
          break;
        }

        case 'completeTask': {
          if (action.taskId) {
            const comp = completeTask(action.taskId);
            if (comp) {
              receipt.tasksCompleted++;
              receipt.logs.push(`✅ Executed completeTask(): Marked "${comp.title}" as completed.`);
            } else {
              receipt.success = false;
              receipt.logs.push(`❌ completeTask(): Task ID "${action.taskId}" not found.`);
            }
          }
          break;
        }

        case 'deleteTask': {
          if (action.taskId) {
            const ok = deleteTask(action.taskId);
            if (ok) {
              receipt.tasksDeleted++;
              receipt.logs.push(`✅ Executed deleteTask(): Removed task ID "${action.taskId}".`);
            } else {
              receipt.success = false;
              receipt.logs.push(`❌ deleteTask(): Task ID "${action.taskId}" was not found.`);
            }
          }
          break;
        }

        case 'generateStudyPlan': {
          const generated = generateStudyPlan(180);
          receipt.logs.push(`✅ Executed generateStudyPlan(): Generated ${generated.blocks.length} focus sprint blocks.`);
          break;
        }

        default:
          receipt.logs.push(`ℹ️ Unrecognized tool call "${(action as any).tool}" skipped.`);
      }
    } catch (err: any) {
      receipt.success = false;
      receipt.logs.push(`❌ Error executing action "${action.title}": ${err.message || String(err)}`);
    }
  }

  // If a customized study plan was included in the AI proposal, also activate and save it!
  if (proposedStudyPlan && proposedStudyPlan.blocks && proposedStudyPlan.blocks.length > 0) {
    try {
      const activePlanToSave: StudyPlan = {
        id: `plan-${Date.now()}`,
        focusSessionTitle: proposedStudyPlan.focusSessionTitle || 'Customized AI Focus Sprint',
        totalMinutes: Number(proposedStudyPlan.totalMinutes) || 180,
        strategy: proposedStudyPlan.strategy || 'Adaptive Pomodoro schedule generated by CampusPilot.',
        blocks: proposedStudyPlan.blocks.map((b: any, idx: number) => ({
          id: `block-${idx + 1}-${Date.now()}`,
          timeRange: b.timeRange || `Sprint ${idx + 1}`,
          taskTitle: b.taskTitle || 'Focus Session',
          course: b.course || 'Core Subject',
          durationMinutes: Number(b.durationMinutes) || 45,
          energyLevel: b.energyLevel || 'High Focus',
          description: b.description || 'Target study sprint.',
          completed: false,
        })),
        createdAt: new Date().toISOString(),
      };

      saveActivePlan(activePlanToSave);
      receipt.logs.push(
        `✅ Activated Smart Study Plan: ${activePlanToSave.blocks.length} focus blocks saved to Dashboard and Study Planner.`
      );
    } catch (planErr: any) {
      receipt.logs.push(`⚠️ Note: Could not save study plan: ${planErr.message}`);
    }
  }

  return receipt;
}
