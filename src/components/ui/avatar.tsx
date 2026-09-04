import { cn } from '@/lib/cn';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'full' | 'md';
}

const SIZES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-20 w-20 text-xl',
};

/**
 * Falls back to initials rather than a broken image. Uses a plain <img> because
 * next/image would need every avatar host allow-listed, and these are seeded
 * from a generator.
 */
export function Avatar({
  src,
  name,
  size = 'md',
  className,
  rounded = 'full',
}: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const shape = rounded === 'full' ? 'rounded-full' : 'rounded-lg';

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          SIZES[size],
          shape,
          'shrink-0 border border-line bg-white object-cover',
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        SIZES[size],
        shape,
        'flex shrink-0 items-center justify-center border border-line bg-surface-hover font-semibold text-ink-muted',
        className,
      )}
    >
      {initials || '?'}
    </span>
  );
}
