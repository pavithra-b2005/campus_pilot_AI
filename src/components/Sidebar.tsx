import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  CheckSquare, 
  CalendarClock, 
  Workflow, 
  Sparkles,
  Flame,
  Clock
} from 'lucide-react';
import { Task } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  tasks: Task[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, tasks }) => {
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const highPriorityCount = tasks.filter((t) => t.status !== 'completed' && t.priority === 'High').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'agent',
      label: 'AI Agent Copilot',
      icon: Bot,
      badge: 'Interactive',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: CheckSquare,
      badge: pendingCount.toString(),
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: CalendarClock,
      badge: 'Focus',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'showcase',
      label: 'How It Works',
      icon: Workflow,
      badge: 'Judges',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col justify-between border-r border-white/5 bg-[#0D1220]/70 p-4">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/30 shadow-sm shadow-purple-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-white/10 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Agent Launch Callout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#161D32] to-[#111627] border border-purple-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-300" />
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-white">Autonomous Agent</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            CampusPilot proposes structured plans & tool calls, requiring your approval before making any real changes.
          </p>
          <button
            onClick={() => onSelectTab('agent')}
            className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Launch Agent</span>
            <span className="text-cyan-400">→</span>
          </button>
        </div>
      </div>

      {/* Student Progress Overview in Sidebar */}
      <div className="p-3 rounded-xl bg-[#111728] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Urgent Priorities
          </span>
          <span className="font-semibold text-amber-300">{highPriorityCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Active Tasks
          </span>
          <span className="font-semibold text-slate-200">{pendingCount}</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%` 
            }}
          />
        </div>
        <div className="text-[10px] text-slate-400 text-center">
          {completedCount} of {tasks.length} tasks completed ({tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%)
        </div>
      </div>
    </aside>
  );
};
