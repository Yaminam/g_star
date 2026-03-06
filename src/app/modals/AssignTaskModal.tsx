import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data';
import type { Priority, Status } from '../types';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export function AssignTaskModal({ onClose }: { onClose: () => void }) {
  const { loggedInUser, projects, handleAssignTask } = useApp();

  const deptProjects = loggedInUser?.role === 'director'
    ? projects
    : projects.filter(p => p.department === loggedInUser?.department);

  const [form, setForm] = useState({
    title:       '',
    projectId:   deptProjects[0]?.id ?? '',
    priority:    'medium' as Priority,
    assigneeId:  '',
    dueDate:     '',
    description: '',
  });

  const selectedProject = projects.find(p => p.id === form.projectId);
  const eligibleMembers = USERS.filter(
    u => u.role === 'member' && u.department === selectedProject?.department
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    const assignee = USERS.find(u => u.id === form.assigneeId);
    const project  = projects.find(p => p.id === form.projectId);
    if (!assignee || !project) return;
    handleAssignTask({
      title:       form.title,
      projectId:   form.projectId,
      project:     project.name,
      department:  project.department,
      priority:    form.priority,
      status:      'backlog' as Status,
      assigneeId:  form.assigneeId,
      assignee:    assignee.name,
      dueDate:     form.dueDate,
      description: form.description,
      createdById: loggedInUser?.id   ?? '',
      createdBy:   loggedInUser?.name ?? '',
    });
    onClose();
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({
      ...prev,
      [k]: e.target.value,
      ...(k === 'projectId' ? { assigneeId: '' } : {}),
    }));

  const field = 'w-full px-3 py-2 bg-[#111111] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#0D6B50] transition-colors';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-base">Assign Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Task Title *</label>
            <input value={form.title} onChange={set('title')} required placeholder="e.g. Build landing page" className={field} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Project *</label>
              <select value={form.projectId} onChange={set('projectId')} required className={field}>
                <option value="">Select project</option>
                {deptProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
              <label className="block text-gray-300 text-xs font-medium mb-1">Assignee *</label>
              <select value={form.assigneeId} onChange={set('assigneeId')} required className={field} disabled={!form.projectId}>
                <option value="">Select member</option>
                {eligibleMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} required className={field} />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Task details..." className={`${field} resize-none`} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 bg-[#0D6B50] hover:bg-[#0a5a42] text-white font-semibold rounded-lg text-sm transition-colors">
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
