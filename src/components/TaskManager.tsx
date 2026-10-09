import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
  BookOpen,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Task, Priority } from '../types';
import { completeTask, deleteTask } from '../services/taskService';

interface TaskManagerProps {
  tasks: Task[];
  onTasksUpdated: () => void;
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onAskAgentForTask: (taskTitle: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onTasksUpdated,
  onOpenNewTask,
  onEditTask,
  onAskAgentForTask,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'high' | 'overdue'>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'duration'>('dueDate');

  // Courses list
  const courses = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.course) set.add(t.course);
    });
    return Array.from(set);
  }, [tasks]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering and sorting
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      const matchSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.course.toLowerCase().includes(search.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;

      // Course filter
      if (courseFilter !== 'all' && task.course !== courseFilter) return false;

      // Status filter
      if (filterStatus === 'pending') return task.status !== 'completed';
      if (filterStatus === 'completed') return task.status === 'completed';
      if (filterStatus === 'high') return task.priority === 'High' && task.status !== 'completed';
      if (filterStatus === 'overdue') return task.status !== 'completed' && task.dueDate < todayStr;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const pMap: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (sortBy === 'duration') {
        return (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0);
      }
      return 0;
    });
  }, [tasks, search, filterStatus, courseFilter, sortBy, todayStr]);

  const handleToggleComplete = (id: string) => {
    completeTask(id);
    onTasksUpdated();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete task "${title}"?`)) {
      deleteTask(id);
      onTasksUpdated();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1220]/80 border border-purple-500/10 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Task Manager</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted application tasks with real CRUD operations, synchronized with AI planning.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1220]/80 border border-white/5 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments, exams, or courses..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Course select */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 appearance-none pr-8"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Select */}
            <div className="relative flex-1 md:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 appearance-none pr-8"
              >
                <option value="dueDate">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="duration">Sort: Duration</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'pending', label: 'Pending' },
            { id: 'high', label: 'High Priority' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => {
            const isSelected = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-[#0D1220]/60 border border-white/5 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No tasks found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tasks match your current filter. You can add one manually or prompt the AI Agent to generate your syllabus tasks.
            </p>
            <button
              onClick={onOpenNewTask}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate < todayStr;
            const isDueToday = !isCompleted && task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`group p-4 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#0B0F19]/50 border-white/5 opacity-70'
                    : isOverdue
                    ? 'bg-[#18121E] border-rose-500/30 shadow-md shadow-rose-950/20'
                    : isDueToday
                    ? 'bg-[#171A2E] border-amber-500/30'
                    : 'bg-[#111728]/90 border-white/10 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Checkbox + Title + Metadata */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0"
                      title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-cyan-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-semibold text-white ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'High'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Category Badge */}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                          {task.category}
                        </span>

                        {/* Overdue / Due Today warning badge */}
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-400" /> Overdue
                          </span>
                        )}
                        {isDueToday && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                            Due Today
                          </span>
                        )}
                      </div>

                      {/* Course and Deadlines info */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-300 font-medium">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                          {task.course}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          Due: {task.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {task.estimatedMinutes} mins
                        </span>
                      </div>

                      {/* Notes if any */}
                      {task.notes && (
                        <p className="text-xs text-slate-400 mt-2 bg-[#0B0F19]/60 p-2 rounded-lg border border-white/5">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    {/* Ask Copilot to break down task */}
                    {!isCompleted && (
                      <button
                        onClick={() => onAskAgentForTask(task.title)}
                        title="Ask Copilot to break this into study steps"
                        className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                      </button>
                    )}

                    <button
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(task.id, task.title)}
                      title="Delete task"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
