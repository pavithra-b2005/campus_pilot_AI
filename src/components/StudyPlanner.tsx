import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Coffee,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Task, StudyPlan, StudyBlock } from '../types';
import { generateStudyPlan, getActivePlan, saveActivePlan } from '../services/taskService';

interface StudyPlannerProps {
  tasks: Task[];
  activePlan: StudyPlan | null;
  onTasksUpdated: () => void;
  onAskAgentPrompt: (prompt: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  tasks,
  activePlan,
  onTasksUpdated,
  onAskAgentPrompt,
}) => {
  const [selectedHours, setSelectedHours] = useState<number>(3);
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Sync active block when activePlan loads
  useEffect(() => {
    if (activePlan && activePlan.blocks.length > 0 && !activeBlockId) {
      setActiveBlockId(activePlan.blocks[0].id);
      setTimerSeconds(activePlan.blocks[0].durationMinutes * 60);
    }
  }, [activePlan, activeBlockId]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleGeneratePlan = (hours: number) => {
    setSelectedHours(hours);
    const newPlan = generateStudyPlan(hours * 60);
    if (newPlan.blocks.length > 0) {
      setActiveBlockId(newPlan.blocks[0].id);
      setTimerSeconds(newPlan.blocks[0].durationMinutes * 60);
    }
    onTasksUpdated();
  };

  const handleToggleBlockComplete = (blockId: string) => {
    if (!activePlan) return;
    const updatedBlocks = activePlan.blocks.map((b) =>
      b.id === blockId ? { ...b, completed: !b.completed } : b
    );
    const updatedPlan: StudyPlan = {
      ...activePlan,
      blocks: updatedBlocks,
    };
    saveActivePlan(updatedPlan);
    onTasksUpdated();
  };

  const handleSelectBlockForTimer = (block: StudyBlock) => {
    setActiveBlockId(block.id);
    setTimerSeconds(block.durationMinutes * 60);
    setIsTimerRunning(false);
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Delayed task detection
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate < new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1220]/80 border border-purple-500/10 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-cyan-400" />
            <span>Smart Study Planner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic study block allocation with Pomodoro focus intervals, adaptive to pending deadlines.
          </p>
        </div>

        {/* Study Hours Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Daily Budget:</span>
          {[1, 2, 3, 4, 5].map((hr) => (
            <button
              key={hr}
              onClick={() => handleGeneratePlan(hr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedHours === hr
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {hr} {hr === 1 ? 'Hour' : 'Hours'}
            </button>
          ))}
        </div>
      </div>

      {/* Delayed Tasks Notice (Adaptive Plan Suggestion) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-200">
                {overdueTasks.length} Delayed Task(s) Detected
              </h4>
              <p className="text-xs text-amber-300/80">
                You have overdue tasks (e.g. "{overdueTasks[0].title}"). Ask CampusPilot to calibrate and reschedule them.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onAskAgentPrompt(
                `I have ${overdueTasks.length} overdue task(s): "${overdueTasks
                  .map((t) => t.title)
                  .join(
                    ', '
                  )}". I can study for ${selectedHours} hours today. Please reschedule them and create an adapted high-yield study plan.`
              )
            }
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reschedule with Agent</span>
          </button>
        </div>
      )}

      {/* Main Grid: Left Timeline / Right Focus Session Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Study Sprints Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activePlan?.focusSessionTitle || 'Active Study Sprints'}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activePlan?.totalMinutes || selectedHours * 60}m planned
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activePlan?.strategy ||
                    'Structured Pomodoro blocks designed around priority weighting.'}
                </p>
              </div>
            </div>

            {/* Blocks List */}
            <div className="space-y-3 pt-2">
              {activePlan?.blocks && activePlan.blocks.length > 0 ? (
                activePlan.blocks.map((block) => {
                  const isRest = block.energyLevel === 'Rest';
                  const isCurrent = activeBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        block.completed
                          ? 'bg-[#0B0F19]/40 border-white/5 opacity-60'
                          : isCurrent
                          ? 'bg-[#151D33] border-cyan-400/50 shadow-md shadow-cyan-500/10'
                          : isRest
                          ? 'bg-[#101925]/60 border-purple-500/20'
                          : 'bg-[#111728] border-white/5 hover:border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => handleToggleBlockComplete(block.id)}
                            className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0"
                          >
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                block.completed ? 'text-emerald-400' : 'text-slate-600'
                              }`}
                            />
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-cyan-300 font-semibold">
                                {block.timeRange}
                              </span>
                              <h4
                                className={`text-sm font-semibold text-white ${
                                  block.completed ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {block.taskTitle}
                              </h4>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  isRest
                                    ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                                    : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                                }`}
                              >
                                {block.energyLevel}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 mt-1">
                              {block.description}
                            </p>
                          </div>
                        </div>

                        {/* Play button to load into timer */}
                        {!block.completed && (
                          <button
                            onClick={() => handleSelectBlockForTimer(block)}
                            title="Focus on this block"
                            className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 flex-shrink-0 ${
                              isCurrent
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Focus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No active study plan. Select study hours above to calculate high-yield blocks.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Focus Session Timer & Subtask Breakdown */}
        <div className="space-y-4">
          {/* Pomodoro Focus Timer */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#131B32] to-[#0E1426] border border-cyan-500/20 shadow-xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Flame className="w-4 h-4 text-amber-400" />
                Active Focus Timer
              </span>
              <span className="font-mono text-[10px] text-slate-400">Deep Work Protocol</span>
            </div>

            {/* Countdown Display */}
            <div className="py-2">
              <div className="text-5xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs text-slate-400 mt-2 truncate px-4">
                {activeBlockId
                  ? activePlan?.blocks.find((b) => b.id === activeBlockId)?.taskTitle || 'Custom Sprint'
                  : 'Ready to start'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white shadow-cyan-500/20'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Focus
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
                title="Reset to 25m"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Breakdown Tool */}
          <div className="p-5 rounded-2xl bg-[#0D1220]/80 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Break Down Large Task</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Have an intimidating 10-page paper or comprehensive exam? Let CampusPilot decompose it into smaller steps.
            </p>

            <button
              onClick={() =>
                onAskAgentPrompt(
                  'Break down my comprehensive final exam preparation into 4 prioritized, manageable milestones with time estimates.'
                )
              }
              className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Prompt AI Decomposer</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
