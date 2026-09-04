import { cn } from '@/lib/cn';

/**
 * The Wellfound wordmark: a heavy black "W" followed by a two-dot red colon.
 * Drawn rather than imported so the repo ships no third-party brand assets.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn('flex select-none items-baseline gap-[3px]', className)}
      aria-label="Wellfound Clone"
    >
      <span className="text-2xl font-black leading-none tracking-tight text-ink">
        W
      </span>
      <span className="flex flex-col gap-[3px] pb-[3px]">
        <span className="block h-[5px] w-[5px] rounded-full bg-accent" />
        <span className="block h-[5px] w-[5px] rounded-full bg-accent" />
      </span>
    </span>
  );
}
