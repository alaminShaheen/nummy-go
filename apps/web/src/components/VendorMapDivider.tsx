'use client';

import { MapPin, Phone, Mail, Clock, Map } from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatPhoneNumber } from '@nummygo/shared';
import { useTheme } from '@/lib/themes';

const DynamicVendorMap = dynamic(() => import('./VendorMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse" style={{ background: '#0D1117' }} />,
});

interface VendorMapDividerProps {
  name:    string;
  address: string;
  mapUrl:  string;
  phone:   string;
  email:   string;
  hours:   { day: string; time: string }[];
  latitude?: number;
  longitude?: number;
}

export default function VendorMapDivider({
  name,
  address,
  mapUrl,
  phone,
  email,
  hours,
  latitude,
  longitude,
}: VendorMapDividerProps) {
  const { theme } = useTheme();

  return (
    <section
      className="relative w-full my-12 py-12 flex items-center overflow-hidden"
      style={{
        minHeight: '550px',
        background: theme.bg,
        borderTop: `1px solid ${theme.card.border}`,
        borderBottom: `1px solid ${theme.card.border}`,
      }}
    >
      {/* Absolute Map Background */}
      <div className="absolute inset-0 z-0 pointer-events-none md:pointer-events-auto">
        {latitude && longitude ? (
          <DynamicVendorMap
            latitude={latitude}
            longitude={longitude}
            name={name}
            address={address}
            mapUrl={mapUrl}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-4 opacity-50">
             <Map className="w-12 h-12" style={{ color: theme.text.muted }} />
             <span className="text-sm font-medium tracking-widest uppercase" style={{ color: theme.text.muted }}>Location not specified</span>
          </div>
        )}
      </div>

      {/* Gradient blend — left edge fades into page bg to frame the info card */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${theme.bg} 20%, ${theme.bg}88 40%, transparent)`,
        }}
      />

      {/* Info Card */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pointer-events-none">
        <div
          className="pointer-events-auto max-w-sm w-full backdrop-blur-2xl rounded-3xl p-8 shadow-xl"
          style={{
            background: theme.card.bg,
            border: `1px solid ${theme.card.border}`,
          }}
        >
          <h3
            className="text-lg font-bold mb-6 uppercase tracking-widest pb-4"
            style={{ color: theme.text.primary, borderBottom: `1px solid ${theme.card.border}` }}
          >
             Information &amp; Hours
          </h3>

          <div className="flex flex-col gap-6">
            {/* Address */}
            <InfoRow icon={<MapPin size={16} />}>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: theme.accent.amber }}
              >
                {address || 'No address provided'}
              </a>
            </InfoRow>

            {/* Phone */}
            {phone && (
              <InfoRow icon={<Phone size={16} />}>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="transition-colors hover:opacity-80"
                  style={{ color: theme.text.secondary }}
                >
                  {formatPhoneNumber(phone)}
                </a>
              </InfoRow>
            )}

            {/* Email */}
            {email && (
              <InfoRow icon={<Mail size={16} />}>
                <a
                  href={`mailto:${email}`}
                  className="transition-colors hover:opacity-80"
                  style={{ color: theme.text.secondary }}
                >
                  {email}
                </a>
              </InfoRow>
            )}

            {/* Hours */}
            {hours.length > 0 && (
              <div className="mt-2 pt-6" style={{ borderTop: `1px solid ${theme.card.border}` }}>
                <div className="flex items-center gap-3 mb-4" style={{ color: theme.text.muted }}>
                  <Clock size={16} />
                  <span className="text-xs uppercase tracking-widest font-bold">Business Hours</span>
                </div>
                <dl className="flex flex-col gap-1.5 pl-7">
                  {hours.map(({ day, time }) => (
                    <div key={day} className="flex justify-between text-sm">
                      <dt className="font-medium" style={{ color: theme.text.muted }}>{day}</dt>
                      <dd className="pr-2" style={{ color: theme.text.secondary }}>{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── InfoRow sub-component ──────────────────────── */
function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode; }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5 opacity-80 shrink-0" style={{ color: theme.accent.amber }}>
        {icon}
      </span>
      <div className="text-sm">
        {children}
      </div>
    </div>
  );
}
