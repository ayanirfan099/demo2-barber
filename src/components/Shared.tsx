import { ReactNode } from 'react';

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
      <span aria-hidden className="inline-block h-px w-8 bg-copper/70" />
      {children}
    </p>
  );
}

export function StatusPill({ status, labels }: { status: string; labels: Record<string, string> }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    confirmed: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    completed: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
    canceled: 'bg-red-400/15 text-red-300 border-red-400/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {labels[status] ?? status}
    </span>
  );
}

export function DemoNote({ text, className = '' }: { text: string; className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-[11px] leading-snug text-taupe-2 ${className}`}>
      <span aria-hidden className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
      {text}
    </p>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-lg ${className}`} />;
}
