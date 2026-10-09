import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Cpu,
  RefreshCw,
  Terminal,
  Zap,
  Info
} from 'lucide-react';
import { Task, ChatMessage, AgentPlanResponse, ProposedAction } from '../types';
import { executeApprovedPlan, listTasks } from '../services/taskService';

interface AIAgentChatProps {
  tasks: Task[];
  onTasksUpdated: () => void;
  onNavigateToTasks: () => void;
  onNavigateToPlanner: () => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const STORAGE_KEY_CHAT = 'campuspilot_messages_v2';

const QUICK_PROMPTS = [
  {
    label: '☕ Java Exam & SE Assignment (The Prompt Demo)',
    prompt: 'I have a Java exam in three days and a software engineering assignment due tomorrow. I can study for three hours today. Create a realistic plan.',
  },
  {
    label: '⚡ 4 Midterms in 5 Days (Triage Sprint)',
    prompt: 'I have 4 exams next week: Data Structures, Discrete Math, Physics, and Tech Writing. I am overwhelmed. Prioritize my study backlog based on difficulty and credit weight.',
  },
  {
    label: '🔄 Reschedule Delayed Backlog',
    prompt: 'I was sick yesterday and missed my Red-Black Tree coding milestone. Can you reschedule my pending tasks and balance my study blocks today?',
  },
  {
    label: '🎯 Breakdown Research Paper into Milestones',
    prompt: 'Break down my 10-page Software Architecture term paper into 4 actionable milestones with realistic deadlines before Friday.',
  },
];

export const AIAgentChat: React.FC<AIAgentChatProps> = ({
  tasks,
  onTasksUpdated,
  onNavigateToTasks,
  onNavigateToPlanner,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHAT);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    // Welcome message explaining the agentic workflow
    return [
      {
        id: 'welcome-1',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '👋 Welcome to CampusPilot AI. I am your autonomous academic copilot.\n\nTell me your upcoming exams, assignments, or available study hours. I will analyze your deadlines, propose a structured schedule, and request your approval before creating or modifying any tasks in your database.',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableHours, setAvailableHours] = useState<number | ''>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      const promptToRun = initialPrompt.trim();
      if (onClearInitialPrompt) onClearInitialPrompt();
      // Auto-submit initial scenario prompt smoothly
      handleSend(promptToRun);
    }
  }, [initialPrompt]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const currentFreshTasks = listTasks();
      const response = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentTasks: currentFreshTasks,
          availableHours: availableHours ? Number(availableHours) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const planData: AgentPlanResponse = await response.json();
      planData.status = 'pending_approval';

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        plan: planData,
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Agent plan error:', err);
      const errorMsg: ChatMessage = {
        id: `agent-error-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ I encountered an issue analyzing your request: ${err.message || 'Network error'}. Please try again or check the server status.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Human approval execution
  const handleApprovePlan = (
    messageId: string,
    actions: ProposedAction[],
    proposedStudyPlan?: any
  ) => {
    // 1. Execute approved actions via real application functions (including study plan sync)
    const receipt = executeApprovedPlan(actions, proposedStudyPlan);

    // 2. Refresh application task list & trigger updates across app
    onTasksUpdated();

    // 3. Update message state to show execution receipt
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.plan) {
          return {
            ...msg,
            plan: {
              ...msg.plan,
              status: 'executed',
              executionSummary: receipt,
            },
          };
        }
        return msg;
      })
    );
  };

  // Reject / Cancel proposed plan
  const handleRejectPlan = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.plan) {
          return {
            ...msg,
            plan: {
              ...msg.plan,
              status: 'rejected',
            },
          };
        }
        return msg;
      })
    );
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear chat conversation history?')) {
      const resetMsg: ChatMessage = {
        id: 'welcome-1',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Ready for your next request. Tell me about your assignments, exam schedule, or study availability.',
      };
      setMessages([resetMsg]);
      localStorage.removeItem(STORAGE_KEY_CHAT);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto w-full bg-[#0D1220]/80 rounded-2xl border border-purple-500/10 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Agent Status Bar */}
      <div className="px-5 py-3.5 border-b border-white/5 bg-[#111728]/90 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-sm shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">CampusPilot Autonomous Agent</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                HITL Gate Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Proposes structured actions → Requires student approval → Executes real application functions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Clear Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((message) => {
          const isUser = message.sender === 'user';

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-xl rounded-2xl rounded-tr-sm bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-white text-sm shadow-md">
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  <span className="text-[10px] text-purple-200/70 block mt-1 text-right">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          // Agent Message
          const plan = message.plan;

          return (
            <div key={message.id} className="flex items-start gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-[#161E34] border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm shadow-cyan-500/10">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="flex-1 space-y-3">
                {/* Simple Text if no plan */}
                {message.text && (
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-[#131A2D] border border-white/5 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                    <span className="text-[10px] text-slate-400 block mt-2">
                      {message.timestamp}
                    </span>
                  </div>
                )}

                {/* Structured Plan Card */}
                {plan && (
                  <div className="rounded-2xl rounded-tl-sm bg-[#13192B] border border-purple-500/20 overflow-hidden shadow-xl">
                    {/* Engine badge & Header */}
                    <div className="px-5 py-3 bg-[#171F36] border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-900/60 text-purple-300 border border-purple-700/50 flex items-center gap-1.5">
                          {plan.mode === 'live_gemini' ? (
                            <>
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              {plan.badge || 'Powered by Gemini 3.8 Flash'}
                            </>
                          ) : (
                            <>
                              <Cpu className="w-3 h-3 text-cyan-400" />
                              {plan.badge || 'Local Demonstration Engine'}
                            </>
                          )}
                        </span>
                        <span className="text-xs text-slate-400">
                          Structured Action Proposal
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {message.timestamp}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Intent & Commitments Identified */}
                      <div className="p-3.5 rounded-xl bg-[#0E1424] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Intent Analysis & Detected Commitments</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {plan.intentAnalysis}
                        </p>

                        {plan.identifiedCommitments && plan.identifiedCommitments.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {plan.identifiedCommitments.map((c, i) => (
                              <div
                                key={i}
                                className="px-2.5 py-1.5 rounded-lg bg-[#141C30] border border-white/5 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-medium text-slate-200">{c.title}</span>
                                  <span className="block text-[10px] text-slate-400">
                                    Due: {c.deadline}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  c.urgency.toLowerCase().includes('tomorrow') || c.urgency.toLowerCase().includes('immediate')
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {c.urgency}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reasoning */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-purple-400" />
                          <span>Pedagogical Strategy & Prioritization</span>
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-[#0E1424]/60 p-3 rounded-xl border border-white/5">
                          {plan.reasoning}
                        </p>
                      </div>

                      {/* Proposed Tasks & Tool Invocations */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Proposed Tool Actions (Requires Approval)</span>
                          </h4>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                            {plan.proposedActions.length} action block(s)
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {plan.proposedActions.map((action) => (
                            <div
                              key={action.id}
                              className="p-3.5 rounded-xl bg-[#0E1424] border border-cyan-500/20 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                                    tool: {action.tool}()
                                  </span>
                                  <span className="text-xs font-semibold text-slate-200">
                                    {action.title}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {action.description}
                              </p>

                              {/* Task List Preview */}
                              {action.tasks && action.tasks.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  {action.tasks.map((t, tidx) => (
                                    <div
                                      key={tidx}
                                      className="px-3 py-2 rounded-lg bg-[#141C30] border border-white/5 flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className={`w-2 h-2 rounded-full ${
                                          t.priority === 'High'
                                            ? 'bg-rose-400'
                                            : t.priority === 'Medium'
                                            ? 'bg-amber-400'
                                            : 'bg-emerald-400'
                                        }`} />
                                        <div>
                                          <div className="font-medium text-slate-200">{t.title}</div>
                                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                            <span>{t.course}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-2.5 h-2.5" /> Due {t.dueDate}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                              <Clock className="w-2.5 h-2.5" /> {t.estimatedMinutes}m
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                                        {t.category}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Study Plan Blocks Preview if available */}
                      {plan.studyPlan && (
                        <div className="p-3.5 rounded-xl bg-[#0E1424] border border-purple-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-purple-400" />
                              {plan.studyPlan.focusSessionTitle} ({plan.studyPlan.totalMinutes}m total)
                            </span>
                            <button
                              onClick={onNavigateToPlanner}
                              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <span>Open in Planner</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {plan.studyPlan.strategy}
                          </p>
                          <div className="space-y-1 pt-1">
                            {plan.studyPlan.blocks.slice(0, 3).map((b, bidx) => (
                              <div
                                key={bidx}
                                className="px-3 py-1.5 rounded-lg bg-[#141C30] text-xs flex items-center justify-between border border-white/5"
                              >
                                <span className="font-mono text-cyan-300 text-[11px]">{b.timeRange}</span>
                                <span className="text-slate-200 truncate mx-2">{b.taskTitle}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                  {b.energyLevel}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Approval Buttons & Status */}
                      {plan.status === 'pending_approval' && (
                        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0B0F19]/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span>Action will modify your actual task storage upon approval.</span>
                          </div>

                          <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                              onClick={() => handleRejectPlan(message.id)}
                              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Cancel</span>
                            </button>
                            <button
                              onClick={() => handleApprovePlan(message.id, plan.proposedActions, plan.studyPlan)}
                              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-md shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                              <span>Approve Plan & Execute Tools</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Plan Rejected State */}
                      {plan.status === 'rejected' && (
                        <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center gap-2 text-xs text-slate-400">
                          <XCircle className="w-4 h-4 text-slate-400" />
                          <span>Plan was declined by student. No tasks were modified.</span>
                        </div>
                      )}

                      {/* Execution Receipt (Actual Results & Honest Status) */}
                      {plan.status === 'executed' && plan.executionSummary && (
                        <div
                          className={`p-4 rounded-xl border space-y-3 ${
                            plan.executionSummary.success
                              ? 'bg-gradient-to-br from-emerald-950/40 to-[#0F1D1B] border-emerald-500/30'
                              : 'bg-gradient-to-br from-amber-950/30 to-[#1E1711] border-amber-500/35'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold">
                              {plan.executionSummary.success ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  <span className="text-emerald-300">
                                    Execution Receipt: Real Application Operations Completed
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                                  <span className="text-amber-300">
                                    Execution Receipt: Completed with Partial Actions / Warnings
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {plan.executionSummary.executedAt}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                            <div className="p-2 rounded-lg bg-[#0E1B19]/80 border border-white/5">
                              <div className="text-lg font-bold text-white font-mono">
                                {plan.executionSummary.tasksCreated}
                              </div>
                              <div className="text-[10px] text-slate-400">Tasks Created</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[#0E1B19]/80 border border-white/5">
                              <div className="text-lg font-bold text-white font-mono">
                                {plan.executionSummary.actionsRun}
                              </div>
                              <div className="text-[10px] text-slate-400">Tools Dispatched</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[#0E1B19]/80 border border-white/5">
                              <div className="text-lg font-bold text-white font-mono">
                                {plan.executionSummary.tasksUpdated}
                              </div>
                              <div className="text-[10px] text-slate-400">Tasks Updated</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[#0E1B19]/80 border border-white/5">
                              <div
                                className={`text-lg font-bold font-mono ${
                                  plan.executionSummary.success ? 'text-emerald-300' : 'text-amber-300'
                                }`}
                              >
                                {plan.executionSummary.success ? '100%' : 'Partial'}
                              </div>
                              <div className="text-[10px] text-slate-400">Tool Status</div>
                            </div>
                          </div>

                          {/* Terminal-like execution logs */}
                          <div className="p-2.5 rounded-lg bg-[#080D0C] border border-white/10 font-mono text-[11px] text-emerald-300/90 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                              <Terminal className="w-3 h-3 text-cyan-400" />
                              <span>Audit Log Dispatcher</span>
                            </div>
                            {plan.executionSummary.logs.map((log, lidx) => (
                              <div key={lidx} className="leading-snug">
                                {log}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-slate-400">
                              Tasks are live in your persistent task manager.
                            </span>
                            <button
                              onClick={onNavigateToTasks}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                            >
                              <span>View in Task Manager</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-[#161E34] border border-cyan-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-[#13192B] border border-purple-500/20 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold text-white">CampusPilot AI is reasoning...</span>
              </div>
              <p className="text-slate-400">
                Parsing commitments, calculating deadline proximity, and composing structured tool proposals for your approval.
              </p>
              <div className="flex gap-1 pt-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-white/5 bg-[#0F1424]/90 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0">
          <Zap className="w-3 h-3 text-amber-400" /> Quick Demos:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            className="flex-shrink-0 px-3 py-1 rounded-full bg-[#161D32] hover:bg-purple-900/40 text-slate-300 hover:text-white border border-white/10 hover:border-purple-500/40 text-[11px] transition-all"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-white/5 bg-[#111728]">
        <div className="flex items-center gap-2 mb-2">
          {/* Optional available study hours filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-[#0B0F19] px-2.5 py-1 rounded-lg border border-white/5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Available Study Time:</span>
            <input
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              placeholder="e.g. 3"
              value={availableHours}
              onChange={(e) => setAvailableHours(e.target.value ? Number(e.target.value) : '')}
              className="w-12 bg-[#141B30] text-cyan-300 text-center rounded px-1 text-xs border border-white/10 focus:outline-none"
            />
            <span>hrs</span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            (Helps CampusPilot calibrate block sizes accurately)
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell CampusPilot: 'I have a Java exam in 3 days and an assignment tomorrow. I have 3 hours today...'"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
