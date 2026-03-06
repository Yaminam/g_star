// THIS FILE IS FULLY REPLACED — keep this comment as the canonical marker
import { useState, useRef } from 'react';
import {
  Search, Calendar, CheckSquare, CheckCircle2, LayoutGrid, List,
  ArrowUpDown, ArrowUp, ArrowDown, Edit2, GripVertical, ListTodo, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data';
import { DEPT_HEX } from '../constants';
import { Avatar } from '../shared/Avatar';
import { StatusBadge } from '../shared/StatusBadge';
import { PriorityBadge } from '../shared/PriorityBadge';
import { EditTaskModal } from '../modals/EditTaskModal';
import type { Department, Priority, Status, Task } from '../types';

type SortKey  = 'title' | 'priority' | 'dueDate' | 'status' | 'assignee';
type SortDir  = 'asc' | 'desc';
type ViewMode = 'table' | 'kanban';

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER:   Record<Status, number>   = { inProgress: 0, backlog: 1, done: 2 };

const KANBAN_COLS: { key: Status; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'backlog',    label: 'Backlog',     icon: <ListTodo size={14}/>,     color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { key: 'inProgress', label: 'In Progress', icon: <Clock size={14}/>,        color: 'text-blue-500 bg-blue-50 border-blue-200'   },
  { key: 'done',       label: 'Done',        icon: <CheckCircle2 size={14}/>, color: 'text-green-500 bg-green-50 border-green-200' },
];

export function TasksView() {
  const { loggedInUser, tasks, handleTaskStatusChange, handleDeleteTask } = useApp();
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [search,         setSearch]         = useState('');
  const [sortKey,        setSortKey]        = useState<SortKey>('dueDate');
  const [sortDir,        setSortDir]        = useState<SortDir>('asc');
  const [viewMode,       setViewMode]       = useState<ViewMode>('table');
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [editingTask,    setEditingTask]    = useState<Task | null>(null);

  const isDirector = loggedInUser!.role === 'director';
  const isTeamLead = loggedInUser!.role === 'teamLead';

  const baseTasks = isDirector
    ? tasks
    : isTeamLead
    ? tasks.filter(t => t.department === loggedInUser!.department)
    : tasks.filter(t => t.assigneeId === loggedInUser!.id);

  const deptMembers = isTeamLead
    ? USERS.filter(u => u.department === loggedInUser!.department && u.role === 'member')
    : [];

  const filtered = baseTasks.filter(t => {
    if (statusFilter   !== 'all' && t.status     !== statusFilter)   return false;
    if (priorityFilter !== 'all' && t.priority   !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && t.assigneeId !== assigneeFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function getSort(a: Task, b: Task): number {
    let cmp = 0;
    if (sortKey === 'title')    cmp = a.title.localeCompare(b.title);
    if (sortKey === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sortKey === 'dueDate')  cmp = a.dueDate.localeCompare(b.dueDate);
    if (sortKey === 'status')   cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (sortKey === 'assignee') cmp = a.assignee.localeCompare(b.assignee);
    return sortDir === 'asc' ? cmp : -cmp;
  }
  const sorted = [...filtered].sort(getSort);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const today = new Date().toISOString().slice(0, 10);
  const hasFilters = statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || !!search;

  function clearFilters() {
    setStatusFilter('all'); setPriorityFilter('all'); setAssigneeFilter('all'); setSearch('');
  }

  const allIds = sorted.map(t => t.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  function toggleAll() { setSelected(allSelected ? new Set() : new Set(allIds)); }
  function toggleOne(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function markSelectedDone() { selected.forEach(id => handleTaskStatusChange(id, 'done')); setSelected(new Set()); }
  function deleteSelected()   { selected.forEach(id => handleDeleteTask(id)); setSelected(new Set()); }

  const draggingId = useRef<string | null>(null);
  function onDragStart(id: string) { draggingId.current = id; }
  function onDrop(status: Status) {
    if (draggingId.current) { handleTaskStatusChange(draggingId.current, status); draggingId.current = null; }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-[#0D6B50]" />
      : <ArrowDown size={12} className="text-[#0D6B50]" />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">
              {isDirector ? 'All Tasks' : isTeamLead ? 'Department Tasks' : 'My Tasks'}
            </h1>
            <p className="text-gray-500">{sorted.length} task{sorted.length !== 1 ? 's' : ''} shown</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'table' ? 'bg-[#0D6B50] text-white border-[#0D6B50]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              title="Table view">
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'kanban' ? 'bg-[#0D6B50] text-white border-[#0D6B50]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              title="Kanban view">
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={14} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0D6B50] w-48" />
          </div>

          {[
            { val: statusFilter,   set: setStatusFilter,   opts: [['all','All Status'],['backlog','Backlog'],['inProgress','In Progress'],['done','Done']] },
            { val: priorityFilter, set: setPriorityFilter, opts: [['all','All Priorities'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']] },
          ].map(({ val, set, opts }, i) => (
            <select key={i} value={val} onChange={e => set(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0D6B50] bg-white">
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}

          {(isDirector || isTeamLead) && (
            <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#0D6B50] bg-white">
              <option value="all">All Members</option>
              {(isDirector ? USERS.filter(u => u.role === 'member') : deptMembers).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}

          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
              Clear filters
            </button>
          )}

          {selected.size > 0 ? (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">{selected.size} selected</span>
              <button onClick={markSelectedDone}
                className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> Mark Done
              </button>
              <button onClick={deleteSelected}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                Delete
              </button>
            </div>
          ) : (
            <div className="ml-auto text-xs text-gray-400">
              {baseTasks.filter(t => t.status === 'inProgress').length} active · {baseTasks.filter(t => t.status === 'done').length} done
            </div>
          )}
        </div>

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#0D6B50]" />
                  </th>
                  <th className="text-left px-3 py-3">
                    <button onClick={() => toggleSort('title')} className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                      Task <SortIcon k="title" />
                    </button>
                  </th>
                  <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Project</th>
                  {(isDirector || isTeamLead) && (
                    <th className="text-left px-4 py-3">
                      <button onClick={() => toggleSort('assignee')} className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                        Assignee <SortIcon k="assignee" />
                      </button>
                    </th>
                  )}
                  <th className="text-left px-4 py-3">
                    <button onClick={() => toggleSort('priority')} className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                      Priority <SortIcon k="priority" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => toggleSort('dueDate')} className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                      Due Date <SortIcon k="dueDate" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => toggleSort('status')} className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                      Status <SortIcon k="status" />
                    </button>
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400">
                      <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No tasks match</p>
                    </td>
                  </tr>
                ) : sorted.map(task => {
                  const isOverdue    = task.status !== 'done' && task.dueDate < today;
                  const assigneeUser = USERS.find(u => u.id === task.assigneeId);
                  const dept         = task.department as Department;
                  const isChecked    = selected.has(task.id);
                  return (
                    <tr key={task.id}
                      className={`hover:bg-gray-50/60 transition-colors ${isOverdue ? 'bg-red-50/20' : ''} ${isChecked ? 'bg-[#0D6B50]/5' : ''}`}>
                      <td className="px-5 py-3.5">
                        <input type="checkbox" checked={isChecked} onChange={() => toggleOne(task.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#0D6B50]" />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          {task.status === 'done'       && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />}
                          {task.status === 'inProgress' && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />}
                          {task.status === 'backlog'    && <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                          <span className={`text-sm font-semibold ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-md font-semibold"
                          style={{ background: DEPT_HEX[dept] + '15', color: DEPT_HEX[dept] }}>
                          {task.project}
                        </span>
                      </td>
                      {(isDirector || isTeamLead) && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar initials={assigneeUser?.avatar ?? '?'} size="sm" />
                            <span className="text-xs font-medium text-gray-700">{task.assignee}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3.5"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                          <Calendar size={12} /> {task.dueDate}{isOverdue && ' ⚠'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingTask(task)}
                            className="p-1.5 text-gray-400 hover:text-[#0D6B50] hover:bg-[#0D6B50]/10 rounded-lg transition-colors">
                            <Edit2 size={13} />
                          </button>
                          {(loggedInUser!.role === 'member' || isTeamLead) && (
                            <select value={task.status}
                              onChange={e => handleTaskStatusChange(task.id, e.target.value as Status)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#0D6B50] bg-white text-gray-600 cursor-pointer">
                              <option value="backlog">Backlog</option>
                              <option value="inProgress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* KANBAN VIEW */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-3 gap-5">
            {KANBAN_COLS.map(col => {
              const colTasks = sorted.filter(t => t.status === col.key);
              return (
                <div key={col.key}
                  className={`rounded-2xl border-2 border-dashed min-h-[400px] ${col.color}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => onDrop(col.key)}>
                  <div className={`flex items-center gap-2 px-4 py-3 border-b ${col.color}`}>
                    {col.icon}
                    <span className="font-bold text-sm">{col.label}</span>
                    <span className="ml-auto text-xs font-black opacity-60">{colTasks.length}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    {colTasks.map(task => {
                      const isOverdue    = task.status !== 'done' && task.dueDate < today;
                      const assigneeUser = USERS.find(u => u.id === task.assigneeId);
                      const dept         = task.department as Department;
                      return (
                        <div key={task.id}
                          draggable
                          onDragStart={() => onDragStart(task.id)}
                          onClick={() => setEditingTask(task)}
                          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group">
                          <div className="flex items-start gap-2 mb-2">
                            <GripVertical size={13} className="text-gray-300 mt-0.5 flex-shrink-0 group-hover:text-gray-400" />
                            <p className={`text-sm font-semibold flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {task.title}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold inline-block mb-2"
                            style={{ background: DEPT_HEX[dept] + '15', color: DEPT_HEX[dept] }}>
                            {task.project}
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <PriorityBadge priority={task.priority} />
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isOverdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                <Calendar size={9} />{task.dueDate.slice(5)}
                              </span>
                              <Avatar initials={assigneeUser?.avatar ?? '?'} size="sm" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingTask && (
        <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}
