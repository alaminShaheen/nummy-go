// Generate a single static path as template
// Worker will serve this for all vendor slugs
export function generateStaticParams() {
  return [{ slug: 'demo' }];
}

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
