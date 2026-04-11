import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | NummyGo Partner',
    default: 'NummyGo Partner Dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
