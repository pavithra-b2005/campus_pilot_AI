import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, Plus, Zap, Cpu, GraduationCap, Github } from 'lucide-react';
import { resetDemoData } from '../services/taskService';

interface NavbarProps {
  onOpenNewTask: () => void;
  onNavigate: (tab: string) => void;
  onOpenExport?: () => void;
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTask, onNavigate, onOpenExport, currentTab }) => {
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string }>({
    configured: false,
    model: 'gemini-3.8-flash',
  });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setAiStatus({
          configured: data.aiConfigured,
          model: data.model || 'gemini-3.8-flash',
        });
      })
      .catch(() => {
        setAiStatus({ configured: false, model: 'local-demo' });
      });
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset CampusPilot to initial demo state? (Your tasks and plans will reload with default college data)')) {
      resetDemoData();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/10 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300">
            <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                CampusPilot AI
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/50">
                Agentic v2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Your campus. Your goals. Your copilot.
            </p>
          </div>
        </div>

        {/* Engine status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13192B] border border-white/5 text-xs">
            {aiStatus.configured ? (
              <>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Gemini 3.8 Flash
                </span>
              </>
            ) : (
              <>
                <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Demo Mode (Ready)
                </span>
              </>
            )}
          </div>

          {/* Quick Demo Reset */}
          <button
            onClick={handleReset}
            title="Reset demo tasks & storage"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg border border-white/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export to GitHub Guide Button */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              title="Export project source code for GitHub"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg border border-white/5 transition-colors flex items-center gap-1.5 text-xs"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span className="hidden xl:inline">GitHub</span>
            </button>
          )}

          {/* How It Works Hackathon Showcase Button */}
          <button
            onClick={() => onNavigate('showcase')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              currentTab === 'showcase'
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge Guide</span>
          </button>

          {/* Create Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
