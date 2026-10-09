import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Flame,
  ArrowRight,
  BookOpen,
  Send,
  Zap,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { Task, StudyPlan } from '../types';
import { completeTask } from '../services/taskService';

interface DashboardProps {
  tasks: Task[];
  activePlan: StudyPlan | null;
  onTasksUpdated: () => void;
  onNavigate: (tab: string) => void;
  onRunQuickDemo: (promptText: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  activePlan,
  onTasksUpdated,
  onNavigate,
  onRunQuickDemo,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming deadlines sorted by date
  const upcomingDeadlines = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const DEMO_EXAMPLE_PROMPT =
    'I have a Java exam in three days and a software engineering assignment due tomorrow. I can study for three hours today. Create a realistic plan.';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Hero / Quick AI Pilot Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171435] via-[#121A3A] to-[#0E1A33] border border-purple-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Student Productivity Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            CampusPilot AI
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 text-xl sm:text-2xl font-bold mt-1">
              "Your campus. Your goals. Your copilot."
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Unlike standard chatbots that hallucinate static text, CampusPilot structures academic goals, requests your approval, and executes real application tool functions to manage your workload.
          </p>

          {/* Featured Hackathon Prompt Demo Card */}
          <div className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-purple-500/30 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Featured Demo Scenario (1-Click Run):
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Real HITL Execution</span>
            </div>

            <p className="text-xs text-slate-200 italic font-mono bg-[#111728] p-2.5 rounded-xl border border-white/5">
              "{DEMO_EXAMPLE_PROMPT}"
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onRunQuickDemo(DEMO_EXAMPLE_PROMPT)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Agent With This Scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('showcase')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                How It Works (Judge Guide)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Tasks</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalTasks}</div>
          <div className="text-[11px] text-slate-400">In database store</div>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">{pendingTasks}</div>
          <div className="text-[11px] text-slate-400">Needs completion</div>
        </div>

        {/* Completed & Progress */}
        <div className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {completedTasks}{' '}
            <span className="text-sm font-normal text-slate-400">({completionRate}%)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className={`p-5 rounded-2xl border shadow-lg space-y-2 ${
          overdueTasks > 0 ? 'bg-rose-950/20 border-rose-500/30' : 'bg-[#0D1220]/80 border-white/5'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Overdue</span>
            <AlertTriangle className={`w-4 h-4 ${overdueTasks > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${
            overdueTasks > 0 ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {overdueTasks}
          </div>
          <div className="text-[11px] text-slate-400">
            {overdueTasks > 0 ? 'Urgent attention required' : 'All deadlines on track'}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Upcoming Deadlines & Priority Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Upcoming Academic Deadlines</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Prioritized chronological stream of your deliverables.
                </p>
              </div>

              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-[#0B0F19]/40 rounded-xl">
                  No upcoming deadlines scheduled! Enjoy your free time or add new milestones.
                </div>
              ) : (
                upcomingDeadlines.map((task) => {
                  const isOverdue = task.dueDate < todayStr;
                  const isToday = task.dueDate === todayStr;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isOverdue
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : isToday
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-[#111728] border-white/5 hover:border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            task.priority === 'High'
                              ? 'bg-rose-400'
                              : task.priority === 'Medium'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-white">{task.title}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="text-slate-300 font-medium">{task.course}</span>
                            <span>•</span>
                            <span className="text-cyan-300 font-mono">
                              Due: {task.dueDate} {isToday ? '(Today!)' : ''}
                            </span>
                            <span>•</span>
                            <span>{task.estimatedMinutes}m</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            completeTask(task.id);
                            onTasksUpdated();
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 transition-colors"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Today's Study Plan Widget */}
          <div className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  <span>Today's Study Plan</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {activePlan?.focusSessionTitle || '3h High-Impact Academic Sprint'}
                </p>
              </div>

              <button
                onClick={() => onNavigate('planner')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>Planner & Timer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {activePlan?.blocks && activePlan.blocks.length > 0 ? (
                activePlan.blocks.slice(0, 4).map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="p-3 rounded-xl bg-[#111728] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-cyan-400 text-[11px]">{b.timeRange}</span>
                      <span className="text-slate-200 font-medium">{b.taskTitle}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {b.energyLevel}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-slate-400 text-center bg-[#0B0F19]/40 rounded-xl">
                  No active focus plan loaded. Visit the Study Planner to generate your today's blocks.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right (1 col): Prominent AI Assistant Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#13192B] to-[#0E1322] border border-purple-500/20 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-sm shadow-cyan-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Ask CampusPilot</h3>
                <p className="text-[11px] text-cyan-300">Intelligent Academic Copilot</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Describe your current workload in plain English. CampusPilot prioritizes assignments, drafts tasks, and prompts you for approval.
            </p>

            {/* Quick Prompts List */}
            <div className="space-y-2">
              <button
                onClick={() => onRunQuickDemo(DEMO_EXAMPLE_PROMPT)}
                className="w-full text-left p-3 rounded-xl bg-[#141C32] hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 transition-all text-xs group"
              >
                <div className="font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>Java Exam & Assignment Plan</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  "Java exam in 3 days, SE assignment tomorrow, 3 hours today..."
                </div>
              </button>

              <button
                onClick={() =>
                  onRunQuickDemo(
                    'I have 4 exams next week: Data Structures, Discrete Math, Physics, and Tech Writing. Prioritize my study backlog based on difficulty.'
                  )
                }
                className="w-full text-left p-3 rounded-xl bg-[#141C32] hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 transition-all text-xs group"
              >
                <div className="font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>Midterms Panic: 4 Exams in 5 Days</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Triage multiple deadlines with balanced cognitive load.
                </div>
              </button>

              <button
                onClick={() =>
                  onRunQuickDemo(
                    'Break down my 10-page Software Architecture term paper into 4 actionable milestones with realistic deadlines.'
                  )
                }
                className="w-full text-left p-3 rounded-xl bg-[#141C32] hover:bg-purple-900/30 border border-white/5 hover:border-purple-500/30 transition-all text-xs group"
              >
                <div className="font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>Break Down Term Paper</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Sub-divide big assignments into actionable steps.
                </div>
              </button>
            </div>

            <button
              onClick={() => onNavigate('agent')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Open Full Agent Chat</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
