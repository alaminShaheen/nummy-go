import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | nummyGo Partner',
    default: 'Partner Dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
