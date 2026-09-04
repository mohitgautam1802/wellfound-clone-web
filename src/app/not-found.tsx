import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-black text-ink">404</p>
      <p className="text-sm text-ink-muted">
        That page doesn&apos;t exist.
      </p>
      <Link href="/jobs" className="btn-primary">
        Go to jobs
      </Link>
    </div>
  );
}
