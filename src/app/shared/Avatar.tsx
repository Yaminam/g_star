import type { User } from '../types';

const STATUS_DOT: Record<string, string> = {
  active:  'bg-green-400',
  away:    'bg-yellow-400',
  offline: 'bg-gray-400',
};

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: User['userStatus'];
  className?: string;
}

const SIZE: Record<string, string> = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
};

export function Avatar({ initials, size = 'md', status, className = '' }: AvatarProps) {
  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div className={`${SIZE[size]} rounded-full bg-[#0D6B50] text-white font-semibold flex items-center justify-center uppercase`}>
        {initials.slice(0, 2)}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${STATUS_DOT[status]}`} />
      )}
    </div>
  );
}
