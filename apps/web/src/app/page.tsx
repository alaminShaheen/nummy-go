import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'Direct Local Restaurant Ordering',
  description: 'Order directly from your favorite local restaurants without third-party markups. Fast local pickup and delivery options available.',
  openGraph: {
    title: 'nummyGo - Direct Local Restaurant Ordering',
    description: 'Order directly from your favorite local restaurants without third-party markups.',
  },
};

export default function PlatformHomePage() {
  return <HomeClient />;
}
