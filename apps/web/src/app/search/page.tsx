import { Metadata } from 'next';
import SearchClient from '@/components/SearchClient';

export const metadata: Metadata = {
  title: 'Discover Local Restaurants',
  description: 'Search and explore local restaurants near you. Find exactly what you are craving, available for delivery and pickup on NummyGo.',
  openGraph: {
    title: 'Discover Local Restaurants',
    description: 'Search and explore local restaurants near you.',
  },
};

export default function PlatformSearchPage() {
  return <SearchClient />;
}
