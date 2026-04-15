import { MapPin, Phone, Mail, Clock, Map } from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatPhoneNumber } from '@nummygo/shared';

const DynamicVendorMap = dynamic(() => import('./VendorMap'), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-[#0D1117] animate-pulse" /> 
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
  return (
    <section className="relative w-full border-y border-white/5 my-12 py-12 flex items-center overflow-hidden bg-[#0a0d14]" style={{ minHeight: '550px' }}>
      
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
             <Map className="w-12 h-12 text-slate-500" />
             <span className="text-sm font-medium tracking-widest uppercase text-slate-500">Location not specified</span>
          </div>
        )}
      </div>

      {/* Mesh Gradations for edge blending, specifically fading out BEFORE the map center */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0a0d14] from-20% via-[#0a0d14]/50 via-40% to-transparent pointer-events-none" />

      {/* Content Container tightly bounded left */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pointer-events-none">
        
        <div className="pointer-events-auto max-w-sm w-full bg-[rgba(15,20,29,0.85)] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
             Information & Hours
          </h3>

          <div className="flex flex-col gap-6">
            {/* Address */}
            <InfoRow icon={<MapPin size={16} />}>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                {address || 'No address provided'}
              </a>
            </InfoRow>

            {/* Phone */}
            {phone && (
              <InfoRow icon={<Phone size={16} />}>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-slate-300 hover:text-white transition-colors"
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
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {email}
                </a>
              </InfoRow>
            )}

            {/* Hours */}
            {hours.length > 0 && (
              <div className="mt-2 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-slate-400 mb-4">
                  <Clock size={16} />
                  <span className="text-xs uppercase tracking-widest font-bold">Business Hours</span>
                </div>
                <dl className="flex flex-col gap-1.5 pl-7">
                  {hours.map(({ day, time }) => (
                    <div key={day} className="flex justify-between text-sm">
                      <dt className="text-slate-500 font-medium">{day}</dt>
                      <dd className="text-slate-300 pr-2">{time}</dd>
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
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5 text-amber-500 opacity-80 shrink-0">
        {icon}
      </span>
      <div className="text-sm">
        {children}
      </div>
    </div>
  );
}
