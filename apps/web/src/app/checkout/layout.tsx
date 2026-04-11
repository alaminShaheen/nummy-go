import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | NummyGo',
  description: 'Complete your NummyGo order securely.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
