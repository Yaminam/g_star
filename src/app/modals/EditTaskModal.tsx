import { useState, FormEvent } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data';
import type { Task, Priority, Status } from '../types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export function EditTaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { handleEditTask, handleDeleteTask, projects } = useApp();
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description,
    priority:    task.priority,
    status:      task.status,
    dueDate:     task.dueDate,
    assigneeId:  task.assigneeId,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const project       = projects.find(p => p.id === task.projectId);
  const eligibleMembers = USERS.filter(u => u.role === 'member' && u.department === task.department);

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const assignee = USERS.find(u => u.id === form.assigneeId);
    handleEditTask(task.id, {
      ...form,
      assignee: assignee?.name ?? task.assignee,
    });
    onClose();
  }

  function onDelete() {
    handleDeleteTask(task.id);
    onClose();
  }

  const field = 'w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0D6B50] transition-colors';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-base">Edit Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Task Title *</label>
            <input value={form.title} onChange={set('title')} required className={field} />
          </div>

          {project && (
            <div className="px-3 py-2 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-500">Project: <span className="text-[#0D6B50] font-semibold">{project.name}</span></p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Priority</label>
              <select value={form.priority} onChange={set('priority')} className={field}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Status</label>
              <select value={form.status} onChange={set('status')} className={field}>
                <option value="backlog">Backlog</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} required className={field} />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Assignee</label>
              <select value={form.assigneeId} onChange={set('assigneeId')} className={field}>
                {eligibleMembers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className={`${field} resize-none`} placeholder="Task description…" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            {confirmDelete ? (
              <>
                <span className="text-xs text-red-400 flex-1">Are you sure?</span>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={onDelete}
                  className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold">
                  Delete
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
                <button type="button" onClick={onClose}
                  className="ml-auto px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-[#0D6B50] text-white text-sm font-semibold rounded-xl hover:bg-[#0a5540] transition-colors">
                  Save Changes
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
