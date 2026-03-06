export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000)      return 'just now';
  if (diff < 3600000)    return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)   return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function playNotifSound(): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.3);
  } catch { /* ignore */ }
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
