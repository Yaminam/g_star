import { useState, FormEvent } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Project, Priority, Status, Department } from '../types';

const DEPARTMENTS: Department[] = ['Developer', 'Design', 'Social Media', 'Business Development', 'SEO'];
const PRIORITIES: Priority[]    = ['low', 'medium', 'high', 'critical'];

export function EditProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { handleEditProject, handleDeleteProject } = useApp();
  const [form, setForm] = useState({
    name:        project.name,
    client:      project.client,
    description: project.description,
    department:  project.department,
    priority:    project.priority,
    status:      project.status as Status,
    dueDate:     project.dueDate,
    progress:    project.progress,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: k === 'progress' ? Number(e.target.value) : e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    handleEditProject(project.id, form);
    onClose();
  }

  function onDelete() {
    handleDeleteProject(project.id);
    onClose();
  }

  const field = 'w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0D6B50] transition-colors';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#1a1a1a]">
          <h2 className="text-white font-bold text-base">Edit Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Project Name *</label>
            <input value={form.name} onChange={set('name')} required className={field} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Client *</label>
              <input value={form.client} onChange={set('client')} required className={field} />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Department</label>
              <select value={form.department} onChange={set('department')} className={field}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Status</label>
              <select value={form.status} onChange={set('status')} className={field}>
                <option value="backlog">Backlog</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Priority</label>
              <select value={form.priority} onChange={set('priority')} className={field}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} required className={field} />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Progress ({form.progress}%)</label>
              <input type="range" min={0} max={100} value={form.progress} onChange={set('progress')}
                className="w-full mt-2 accent-[#0D6B50]" />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className={`${field} resize-none`} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            {confirmDelete ? (
              <>
                <span className="text-xs text-red-400 flex-1">Delete project + all tasks?</span>
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
                  <Trash2 size={12} /> Delete Project
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
