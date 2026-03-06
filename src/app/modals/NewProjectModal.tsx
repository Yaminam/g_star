import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Department, Priority, Status } from '../types';

const DEPARTMENTS: Department[] = ['Developer', 'Design', 'Social Media', 'Business Development', 'SEO'];
const PRIORITIES: Priority[]    = ['low', 'medium', 'high', 'critical'];

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { loggedInUser, handleNewProject } = useApp();
  const [form, setForm] = useState({
    name:        '',
    department:  (loggedInUser?.department ?? 'Developer') as Department,
    client:      '',
    description: '',
    priority:    'medium' as Priority,
    dueDate:     '',
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    handleNewProject({
      ...form,
      owner:       loggedInUser?.name ?? 'Director',
      ownerId:     loggedInUser?.id   ?? 'u1',
      status:      'backlog' as Status,
      progress:    0,
      team:        [loggedInUser?.avatar ?? 'AK'],
      issues:      { todo: 0, active: 0, done: 0 },
      createdDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const field = 'w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0D6B50] transition-colors';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-base">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Project Name *</label>
            <input value={form.name} onChange={set('name')} required placeholder="e.g. E-commerce Revamp" className={field} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Department *</label>
              <select value={form.department} onChange={set('department')} required className={field}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Priority *</label>
              <select value={form.priority} onChange={set('priority')} required className={field}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Client</label>
              <input value={form.client} onChange={set('client')} placeholder="Client name" className={field} />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} required className={field} />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Brief project overview..." className={`${field} resize-none`} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 bg-[#0D6B50] hover:bg-[#0a5a42] text-white font-semibold rounded-lg text-sm transition-colors">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
