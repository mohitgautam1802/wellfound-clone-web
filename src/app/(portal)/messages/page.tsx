'use client';

import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/primitives';

/**
 * Messaging is intentionally out of scope: this project focuses on Profile,
 * Jobs and Applied. The nav item exists so the shell matches the real product,
 * and this page says so plainly rather than faking an inbox.
 */
export default function MessagesPage() {
  return (
    <div className="card">
      <EmptyState
        icon={<MessageSquare size={28} />}
        title="Messages aren't part of this clone"
        description="This project covers the Profile, Jobs and Applied sections. Recruiter messaging would be the natural next feature."
        action={
          <Link href="/jobs" className="btn-primary">
            Back to jobs
          </Link>
        }
      />
    </div>
  );
}
