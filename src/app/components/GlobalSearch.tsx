import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data';

interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'member';
  title: string;
  subtitle: string;
  path: string;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const { projects, tasks } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase().trim();

  const results: SearchResult[] = q.length < 1 ? [] : [
    ...projects
      .filter(p => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        type: 'project' as const,
        title: p.name,
        subtitle: `${p.client} · ${p.status}`,
        path: `/app/projects/${p.id}`,
      })),
    ...tasks
      .filter(t => t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q))
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        type: 'task' as const,
        title: t.title,
        subtitle: `${t.project} · ${t.status}`,
        path: `/app/tasks`,
      })),
    ...USERS
      .filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 3)
      .map(u => ({
        id: u.id,
        type: 'member' as const,
        title: u.name,
        subtitle: `${u.role} · ${u.department ?? 'Director'}`,
        path: `/app/team`,
      })),
  ];

  useEffect(() => { setActiveIdx(0); }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) { navigate(results[activeIdx].path); onClose(); }
    if (e.key === 'Escape') onClose();
  }

  function go(path: string) { navigate(path); onClose(); }

  const ICON = {
    project: <FolderKanban size={14} className="text-indigo-400" />,
    task:    <CheckSquare  size={14} className="text-blue-400"   />,
    member:  <Users        size={14} className="text-green-400"  />,
  };

  const QUICK = [
    { label: 'All Tasks',    path: '/app/tasks',     icon: <CheckSquare size={13}/> },
    { label: 'Team',         path: '/app/team',      icon: <Users size={13}/> },
    { label: 'Analytics',   path: '/app/analytics', icon: <FolderKanban size={13}/> },
    { label: 'Calendar',    path: '/app/calendar',  icon: <FolderKanban size={13}/> },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 z-[100] px-4"
      onClick={onClose}>
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-700">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, tasks, members…"
            className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm outline-none placeholder-gray-400"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        {q.length > 0 ? (
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No results for "{query}"</div>
            ) : results.map((r, i) => (
              <button key={r.id} onClick={() => go(r.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  ${i === activeIdx ? 'bg-[#0D6B50]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  {ICON[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 capitalize flex-shrink-0">
                  {r.type}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-3">
            <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider px-2 mb-2">Quick links</p>
            <div className="grid grid-cols-2 gap-1">
              {QUICK.map(q => (
                <button key={q.path} onClick={() => go(q.path)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left">
                  <span className="text-gray-400">{q.icon}</span> {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-[11px] text-gray-400">
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">↵</kbd> open</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
