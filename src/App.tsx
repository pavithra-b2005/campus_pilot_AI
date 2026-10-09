import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AIAgentChat } from './components/AIAgentChat';
import { TaskManager } from './components/TaskManager';
import { StudyPlanner } from './components/StudyPlanner';
import { JudgeWorkflowShowcase } from './components/JudgeWorkflowShowcase';
import { TaskModal } from './components/TaskModal';
import { ExportModal } from './components/ExportModal';
import { Task, StudyPlan } from './types';
import { listTasks, createTasks, updateTask, getActivePlan } from './services/taskService';
import { LayoutDashboard, Bot, CheckSquare, CalendarClock, Workflow } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(() => listTasks());
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(() => getActivePlan());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string>('');

  // Refresh tasks and plan from storage
  const refreshData = useCallback(() => {
    setTasks(listTasks());
    setActivePlan(getActivePlan());
  }, []);

  useEffect(() => {
    refreshData();

    const handleTasksUpdate = () => refreshData();
    const handlePlanUpdate = () => refreshData();

    window.addEventListener('campuspilot_tasks_updated', handleTasksUpdate);
    window.addEventListener('campuspilot_plan_updated', handlePlanUpdate);

    return () => {
      window.removeEventListener('campuspilot_tasks_updated', handleTasksUpdate);
      window.removeEventListener('campuspilot_plan_updated', handlePlanUpdate);
    };
  }, [refreshData]);

  // Handle saving new or edited task
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask && taskData.id) {
      updateTask(taskData.id, taskData);
    } else {
      createTasks([taskData]);
    }
    refreshData();
    setEditingTask(null);
  };

  // Quick prompt runner from dashboard or showcase
  const handleRunPrompt = (promptText: string) => {
    setAgentInitialPrompt(promptText);
    setCurrentTab('agent');
  };

  const handleAskAgentForTask = (taskTitle: string) => {
    handleRunPrompt(
      `Please break down the task "${taskTitle}" into 3-4 concrete actionable subtasks with time estimates and recommend when to tackle them.`
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onNavigate={setCurrentTab}
        onOpenExport={() => setIsExportModalOpen(true)}
        currentTab={currentTab}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-0">
        {/* Sidebar (Desktop) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          tasks={tasks}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              tasks={tasks}
              activePlan={activePlan}
              onTasksUpdated={refreshData}
              onNavigate={setCurrentTab}
              onRunQuickDemo={handleRunPrompt}
            />
          )}

          {currentTab === 'agent' && (
            <AIAgentChat
              tasks={tasks}
              onTasksUpdated={refreshData}
              onNavigateToTasks={() => setCurrentTab('tasks')}
              onNavigateToPlanner={() => setCurrentTab('planner')}
              initialPrompt={agentInitialPrompt}
              onClearInitialPrompt={() => setAgentInitialPrompt('')}
            />
          )}

          {currentTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              onTasksUpdated={refreshData}
              onOpenNewTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onAskAgentForTask={handleAskAgentForTask}
            />
          )}

          {currentTab === 'planner' && (
            <StudyPlanner
              tasks={tasks}
              activePlan={activePlan}
              onTasksUpdated={refreshData}
              onAskAgentPrompt={handleRunPrompt}
            />
          )}

          {currentTab === 'showcase' && (
            <JudgeWorkflowShowcase onRunDemoScenario={handleRunPrompt} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 border-t border-white/10 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'agent', label: 'Agent', icon: Bot },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'planner', label: 'Planner', icon: CalendarClock },
          { id: 'showcase', label: 'Guide', icon: Workflow },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Task Modal (Create / Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* GitHub & Source Code Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
