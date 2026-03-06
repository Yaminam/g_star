import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Calendar, Users, FolderKanban,
  GripVertical, CheckCircle2, Clock, ListTodo,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USERS } from '../../data';
import { DEPT_HEX, PRIORITY_HEX, PRIORITY_LABELS } from '../../constants';
import { Avatar } from '../../shared/Avatar';
import { StatusBadge } from '../../shared/StatusBadge';
import { PriorityBadge } from '../../shared/PriorityBadge';
import { ProgressBar } from '../../shared/ProgressBar';
import { EditProjectModal } from '../../modals/EditProjectModal';
import { EditTaskModal } from '../../modals/EditTaskModal';
import type { Status, Task } from '../../types';

const COLS: { key: Status; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'backlog',    label: 'Backlog',     icon: <ListTodo size={14}/>,     color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { key: 'inProgress', label: 'In Progress', icon: <Clock size={14}/>,        color: 'text-blue-500 bg-blue-50 border-blue-200'   },
  { key: 'done',       label: 'Done',        icon: <CheckCircle2 size={14}/>, color: 'text-green-500 bg-green-50 border-green-200' },
];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks, handleTaskStatusChange, projectTaskStats } = useApp();
  const [editingProject, setEditingProject] = useState(false);
  const [editingTask, setEditingTask]       = useState<Task | null>(null);

  const project = projects.find(p => p.id === id);
  if (!project) return (
    <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
      <div className="text-center">
        <FolderKanban size={48} className="mx-auto mb-3 opacity-30" />
        <p className="font-semibold">Project not found</p>
        <button onClick={() => navigate(-1)} className="mt-3 text-sm text-[#0D6B50] hover:underline">Go back</button>
      </div>
    </div>
  );

  const projectTasks = tasks.filter(t => t.projectId === id);
  const teamUsers    = USERS.filter(u => project.team.includes(u.avatar));
  const stats        = projectTaskStats[id!];
  const dept         = project.department;

  /* ── drag-and-drop ────────────────── */
  const draggingId = useRef<string | null>(null);

  function onDragStart(taskId: string) { draggingId.current = taskId; }
  function onDrop(status: Status) {
    if (draggingId.current) {
      handleTaskStatusChange(draggingId.current, status);
      draggingId.current = null;
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Back + header */}
        <div className="flex items-start gap-4 mb-8">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-colors mt-1">
            <ArrowLeft size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">{project.name}</h1>
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{project.client} · {dept}</p>
              </div>
              <button onClick={() => setEditingProject(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-sm font-semibold transition-colors">
                <Edit2 size={13} /> Edit Project
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Progress',    value: `${stats?.progress ?? project.progress}%`, sub: `${stats?.done ?? 0} of ${projectTasks.length} tasks done`, color: '#0D6B50' },
            { label: 'Backlog',     value: stats?.todo    ?? 0, sub: 'Not started', color: '#F59E0B' },
            { label: 'In Progress', value: stats?.active  ?? 0, sub: 'Being worked on', color: '#3B82F6' },
            { label: 'Done',        value: stats?.done    ?? 0, sub: 'Completed', color: '#10B981' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Kanban board */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kanban Board</h2>
              <p className="text-xs text-gray-400">Drag cards between columns</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {COLS.map(col => {
                const colTasks = projectTasks.filter(t => t.status === col.key);
                return (
                  <div key={col.key}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm min-h-48"
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(col.key)}>
                    <div className={`flex items-center gap-2 px-4 py-3 border-b ${col.color} rounded-t-2xl`}>
                      {col.icon}
                      <span className="text-xs font-bold">{col.label}</span>
                      <span className="ml-auto text-xs font-black">{colTasks.length}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {colTasks.map(task => {
                        const assignee = USERS.find(u => u.id === task.assigneeId);
                        const isOverdue = task.status !== 'done' && task.dueDate < new Date().toISOString().slice(0,10);
                        return (
                          <div key={task.id}
                            draggable
                            onDragStart={() => onDragStart(task.id)}
                            onClick={() => setEditingTask(task)}
                            className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing hover:shadow-md transition-all group
                              ${isOverdue ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800' : 'border-gray-100 dark:border-gray-700 hover:border-[#0D6B50]/30 dark:bg-gray-800'}`}>
                            <div className="flex items-start gap-2 mb-2">
                              <GripVertical size={12} className="text-gray-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                  {task.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <PriorityBadge priority={task.priority} />
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                <Calendar size={10} />
                                <span className={isOverdue ? 'text-red-500 font-bold' : ''}>{task.dueDate}</span>
                              </div>
                            </div>
                            {assignee && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <Avatar initials={assignee.avatar} size="sm" />
                                <span className="text-[10px] text-gray-400">{assignee.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {colTasks.length === 0 && (
                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl text-xs text-gray-300">
                          Drop here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Project info */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Project Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Progress</p>
                  <ProgressBar value={stats?.progress ?? project.progress} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats?.progress ?? project.progress}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Due Date</p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <Calendar size={13} className="text-gray-400" /> {project.dueDate}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Department</p>
                  <span className="text-xs px-2.5 py-1 rounded-md font-semibold"
                    style={{ background: DEPT_HEX[dept] + '18', color: DEPT_HEX[dept] }}>
                    {dept}
                  </span>
                </div>
                {project.description && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Description</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{project.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Team */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users size={14} className="text-gray-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Team</h3>
              </div>
              <div className="space-y-3">
                {teamUsers.map(u => {
                  const ut = projectTasks.filter(t => t.assigneeId === u.id);
                  return (
                    <div key={u.id} className="flex items-center gap-2.5">
                      <Avatar initials={u.avatar} size="sm" status={u.userStatus} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{ut.filter(t => t.status !== 'done').length} active</p>
                      </div>
                    </div>
                  );
                })}
                {teamUsers.length === 0 && (
                  <p className="text-xs text-gray-400">No team members assigned</p>
                )}
              </div>
            </div>

            {/* Priority breakdown */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">By Priority</h3>
              {(['critical','high','medium','low'] as const).map(p => {
                const count = projectTasks.filter(t => t.priority === p).length;
                return count > 0 ? (
                  <div key={p} className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_HEX[p] }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{PRIORITY_LABELS[p]}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>

      {editingProject && <EditProjectModal project={project} onClose={() => setEditingProject(false)} />}
      {editingTask    && <EditTaskModal    task={editingTask} onClose={() => setEditingTask(null)}    />}
    </div>
  );
}
