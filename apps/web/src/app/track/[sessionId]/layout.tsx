import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order | nummyGo',
  description: 'Live tracking for your nummyGo order.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
