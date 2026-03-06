interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color = clamped === 100 ? 'bg-green-500' : clamped >= 60 ? 'bg-[#0D6B50]' : clamped >= 30 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className={`w-full bg-gray-100 rounded-full h-1.5 ${className}`}>
      <div className={`h-1.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
