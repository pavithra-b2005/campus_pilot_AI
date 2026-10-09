import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Check } from 'lucide-react';
import { Task, Priority, TaskCategory } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('CS 301 Data Structures');
  const [priority, setPriority] = useState<Priority>('High');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [category, setCategory] = useState<TaskCategory>('Assignment');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setCourse(initialTask.course);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate);
      setEstimatedMinutes(initialTask.estimatedMinutes);
      setCategory(initialTask.category);
      setNotes(initialTask.notes || '');
    } else {
      setTitle('');
      setCourse('CS 301 Data Structures');
      setPriority('High');
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      setDueDate(tomorrow);
      setEstimatedMinutes(60);
      setCategory('Assignment');
      setNotes('');
    }
    setError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    onSave({
      ...(initialTask ? { id: initialTask.id } : {}),
      title: title.trim(),
      course,
      priority,
      dueDate,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      category,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#111728] border border-purple-500/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141B30]">
          <div>
            <h3 className="text-base font-semibold text-white">
              {initialTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <p className="text-xs text-slate-400">
              CampusPilot tracks deadlines and organizes smart study schedules.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Red-Black Tree rotateRight method"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              autoFocus
            />
          </div>

          {/* Course & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Course / Subject
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CS 301, SE 420"
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="Assignment">Assignment</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Reading">Reading</option>
                <option value="Project">Project</option>
                <option value="Lab">Lab</option>
                <option value="Review">Review</option>
              </select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['High', 'Medium', 'Low'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                        isSelected
                          ? p === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : p === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-[#0B0F19] text-slate-400 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Estimated Duration (Minutes): {estimatedMinutes}m ({Math.round(estimatedMinutes / 60 * 10) / 10}h)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="15"
                max="240"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-xs font-mono text-cyan-300 w-12 text-right">
                {estimatedMinutes}m
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notes & Action Steps (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chapter sections, grading rubric requirements, test cases..."
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialTask ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
