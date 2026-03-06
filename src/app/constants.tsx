import type { Status, Priority, Department } from './types';
import { Code2, Palette, Share2, Briefcase, Search } from 'lucide-react';

export const STATUS_COLORS: Record<Status, string> = {
  backlog:    'bg-gray-100 text-gray-600',
  inProgress: 'bg-blue-100 text-blue-700',
  done:       'bg-green-100 text-green-700',
};

export const STATUS_LABELS: Record<Status, string> = {
  backlog:    'Backlog',
  inProgress: 'In Progress',
  done:       'Done',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low:      'bg-slate-100 text-slate-600',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};

export const DEPT_COLORS: Record<Department, string> = {
  'Developer':            'bg-blue-50   text-blue-700   border-blue-200',
  'Design':               'bg-purple-50 text-purple-700 border-purple-200',
  'Social Media':         'bg-pink-50   text-pink-700   border-pink-200',
  'Business Development': 'bg-amber-50  text-amber-700  border-amber-200',
  'SEO':                  'bg-teal-50   text-teal-700   border-teal-200',
};

// Hex variants used for inline styles in dashboards
export const STATUS_HEX: Record<Status, string> = {
  backlog:    '#F59E0B',
  inProgress: '#3B82F6',
  done:       '#10B981',
};

export const PRIORITY_HEX: Record<Priority, string> = {
  low:      '#10B981',
  medium:   '#F59E0B',
  high:     '#EF4444',
  critical: '#DC2626',
};

export const DEPT_HEX: Record<Department, string> = {
  'Developer':            '#6366F1',
  'Design':               '#EC4899',
  'Social Media':         '#F59E0B',
  'Business Development': '#10B981',
  'SEO':                  '#3B82F6',
};

export const DEPT_ICONS: Record<Department, React.ReactElement> = {
  'Developer':            <Code2 size={14} />,
  'Design':               <Palette size={14} />,
  'Social Media':         <Share2 size={14} />,
  'Business Development': <Briefcase size={14} />,
  'SEO':                  <Search size={14} />,
};
