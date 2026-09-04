import { redirect } from 'next/navigation';

export default function RootPage() {
  // The portal layout bounces unauthenticated visitors to /login, so the job
  // search is the right universal landing spot.
  redirect('/jobs');
}
