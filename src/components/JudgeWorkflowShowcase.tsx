import React from 'react';
import {
  Workflow,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Terminal,
  Play
} from 'lucide-react';

interface JudgeWorkflowShowcaseProps {
  onRunDemoScenario: (prompt: string) => void;
}

export const JudgeWorkflowShowcase: React.FC<JudgeWorkflowShowcaseProps> = ({
  onRunDemoScenario,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Student Natural Language Input',
      desc: 'The student enters an unstructured query: "I have a Java exam in 3 days, a SE assignment due tomorrow, and 3 hours today."',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      num: '02',
      title: 'Intent Recognition & Commitment Extraction',
      desc: 'Gemini 3.8 Flash extracts deadlines, calculates urgency, and analyzes the student\'s remaining cognitive capacity.',
      icon: Cpu,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      num: '03',
      title: 'Structured Action Proposal Schema',
      desc: 'Agent formulates concrete application tool payloads (e.g. createTasks(), updateTask()) in rigorous typed JSON.',
      icon: Layers,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      num: '04',
      title: 'Human-In-The-Loop Approval Gate',
      desc: 'Zero unapproved writes. The UI renders the proposed tasks and waits for explicit user confirmation ("Approve" or "Cancel").',
      icon: ShieldCheck,
      color: 'from-purple-500 to-pink-500',
    },
    {
      num: '05',
      title: 'Real Application Tool Execution',
      desc: 'Approved tool calls dispatch to real application functions: listTasks(), createTasks(), saveActivePlan(), updating the database.',
      icon: Database,
      color: 'from-pink-500 to-amber-500',
    },
    {
      num: '06',
      title: 'Execution Summary & Audit Receipt',
      desc: 'The student receives an immutable execution receipt with item counts, timestamps, and verifiable audit logs.',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-cyan-500',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#161233] via-[#101938] to-[#0D1B2A] border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-semibold">
            <Workflow className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hackathon Architecture & Judge Guide</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How CampusPilot AI Works
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            CampusPilot AI solves the dangerous limitation of standard chatbots: instead of fabricating answers or hallucinating completed tasks, it implements an autonomous <strong>Approval-Based Agent Pattern</strong> with real application tool functions.
          </p>
        </div>
      </div>

      {/* Comparison: Standard Chatbot vs CampusPilot Agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard chatbot */}
        <div className="p-5 rounded-2xl bg-rose-950/10 border border-rose-500/20 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Conventional AI Chatbot (Hallucinatory)</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>Outputs markdown bullet points claiming "I have scheduled your exam study session".</li>
            <li><strong>No state mutation:</strong> Your database, calendar, or tasks remain completely untouched.</li>
            <li>No permission gate: May guess arbitrary times without verifying student workload.</li>
            <li>Fails to adapt when tasks are overdue or student is sick.</li>
          </ul>
        </div>

        {/* CampusPilot Agent */}
        <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-300 text-sm font-bold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>CampusPilot Agent (Tool-Integrated HITL)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>Extracts commitments and produces structured tool payloads (<code className="text-cyan-300 font-mono">createTasks()</code>, etc.).</li>
            <li><strong>Human-in-the-loop:</strong> Changes are held in a pending proposal state until the student clicks "Approve Plan".</li>
            <li>Executes real application functions that save persistently into local storage.</li>
            <li>Returns an verifiable Execution Receipt with audit logs.</li>
          </ul>
        </div>
      </div>

      {/* 6-Step Visual Workflow */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Workflow className="w-5 h-5 text-purple-400" />
          <span>The End-to-End Agent Lifecycle</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                      {s.num}
                    </span>
                    <div className={`p-2 rounded-xl bg-gradient-to-tr ${s.color} text-white shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Quick Launch for Judges */}
      <div className="p-6 rounded-2xl bg-[#111728] border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Test the Complete Loop (Demo Scenarios)</span>
          </h4>
          <span className="text-xs text-cyan-300 font-medium">1-Click Live Test</span>
        </div>

        <p className="text-xs text-slate-300">
          Click any scenario below to automatically populate the agent input and test the approval-based workflow:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() =>
              onRunDemoScenario(
                'I have a Java exam in three days and a software engineering assignment due tomorrow. I can study for three hours today. Create a realistic plan.'
              )
            }
            className="p-3.5 rounded-xl bg-[#0B0F19] hover:bg-purple-950/30 border border-white/10 hover:border-cyan-400/50 text-left transition-all group"
          >
            <div className="text-xs font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
              <span>☕ The Prompt Demo (Java + SE 420)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Java in 3 days, SE due tomorrow, 3h budget.
            </p>
          </button>

          <button
            onClick={() =>
              onRunDemoScenario(
                'I am overwhelmed with 4 exams next week: Data Structures, Discrete Math, Physics, and Tech Writing. Prioritize my study backlog based on difficulty.'
              )
            }
            className="p-3.5 rounded-xl bg-[#0B0F19] hover:bg-purple-950/30 border border-white/10 hover:border-cyan-400/50 text-left transition-all group"
          >
            <div className="text-xs font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
              <span>⚡ Midterms Panic Sprint</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Multi-exam triage and cognitive load distribution.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
