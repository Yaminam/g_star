import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, FolderKanban, CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPT_HEX } from '../../constants';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarPage() {
  const { tasks, projects } = useApp();
  const now  = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const days    = daysInMonth(year, month);
  const firstDow = firstDayOfMonth(year, month);
  const today   = now.toISOString().slice(0, 10);

  function dateStr(d: number) {
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  const projsByDate: Record<string, typeof projects> = {};
  projects.forEach(p => {
    const d = p.dueDate;
    if (!projsByDate[d]) projsByDate[d] = [];
    projsByDate[d].push(p);
  });

  const tasksByDate: Record<string, typeof tasks> = {};
  tasks.forEach(t => {
    const d = t.dueDate;
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });

  // build calendar grid
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selDate   = selected;
  const selProjects = selDate ? (projsByDate[selDate] ?? []) : [];
  const selTasks    = selDate ? (tasksByDate[selDate] ?? []) : [];

  // Summary counts
  const monthStart = `${year}-${String(month + 1).padStart(2,'0')}-01`;
  const monthEnd   = `${year}-${String(month + 1).padStart(2,'0')}-${String(days).padStart(2,'0')}`;
  const monthTasks  = tasks.filter(t => t.dueDate >= monthStart && t.dueDate <= monthEnd);
  const monthProjs  = projects.filter(p => p.dueDate >= monthStart && p.dueDate <= monthEnd);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400">Deadlines and due dates at a glance</p>
        </div>

        {/* Month stats */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          {[
            { label: 'Project deadlines this month', value: monthProjs.length, color: '#6366F1' },
            { label: 'Tasks due this month',         value: monthTasks.length, color: '#3B82F6' },
            { label: 'Overdue this month',           value: monthTasks.filter(t => t.status !== 'done' && t.dueDate < today && t.dueDate >= monthStart).length + monthProjs.filter(p => p.status !== 'done' && p.dueDate < today).length, color: '#EF4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
            {/* Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{MONTHS[month]} {year}</h2>
              <div className="flex items-center gap-1">
                <button onClick={prev}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0D6B50] hover:bg-[#0D6B50]/10 rounded-lg transition-colors">
                  Today
                </button>
                <button onClick={next}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* DOW headers */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
              {DOW.map(d => (
                <div key={d} className="text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="h-24 border-b border-r border-gray-50 dark:border-gray-800" />;
                const ds       = dateStr(day);
                const dp       = projsByDate[ds] ?? [];
                const dt       = tasksByDate[ds] ?? [];
                const isToday  = ds === today;
                const isSel    = ds === selected;
                const hasItems = dp.length + dt.length > 0;
                return (
                  <div key={day}
                    onClick={() => setSelected(isSel ? null : ds)}
                    className={`h-24 border-b border-r border-gray-50 dark:border-gray-800 p-1.5 cursor-pointer transition-colors overflow-hidden
                      ${isSel    ? 'bg-[#0D6B50]/5 dark:bg-[#0D6B50]/10'   : ''}
                      ${isToday  && !isSel ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                      ${!isSel && !isToday ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}>
                    <p className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-[#0D6B50] text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {day}
                    </p>
                    {dp.slice(0, 1).map(p => (
                      <div key={p.id} className="text-[10px] px-1.5 py-0.5 rounded mb-0.5 font-semibold truncate"
                        style={{ background: DEPT_HEX[p.department] + '20', color: DEPT_HEX[p.department] }}>
                        📁 {p.name}
                      </div>
                    ))}
                    {dt.slice(0, 1).map(t => (
                      <div key={t.id} className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded mb-0.5 font-medium truncate">
                        ✓ {t.title}
                      </div>
                    ))}
                    {(dp.length + dt.length) > 2 && (
                      <p className="text-[9px] text-gray-400 pl-1">+{dp.length + dt.length - 2} more</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">
                {selected ? new Date(selected + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a day'}
              </h2>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {!selected && (
                <p className="text-sm text-gray-400 text-center py-8">Click any date to see what's due</p>
              )}
              {selected && selProjects.length === 0 && selTasks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Nothing due on this day</p>
              )}
              {selProjects.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                    <FolderKanban size={11} /> Projects
                  </p>
                  {selProjects.map(p => (
                    <div key={p.id} className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-700 mb-2 hover:border-[#0D6B50]/30 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: DEPT_HEX[p.department] }} />
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.client} · {p.progress}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selTasks.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                    <CheckSquare size={11} /> Tasks ({selTasks.length})
                  </p>
                  {selTasks.map(t => {
                    const isOverdue = t.status !== 'done' && t.dueDate < today;
                    return (
                      <div key={t.id} className={`p-3 rounded-xl border mb-2 transition-colors
                        ${isOverdue ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}>
                        <p className={`text-xs font-semibold ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t.project} · {t.assignee}</p>
                        {isOverdue && <p className="text-[10px] text-red-500 font-bold mt-0.5">⚠ Overdue</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
