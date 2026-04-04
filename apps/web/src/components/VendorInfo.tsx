import { GradientDivider, SectionLabel } from '@/components/ui';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface VendorInfoProps {
  name:    string;
  address: string;
  mapUrl:  string;
  phone:   string;
  email:   string;
  hours:   { day: string; time: string }[];
  tags:    string[];
}

export default function VendorInfo({
  name,
  address,
  mapUrl,
  phone,
  email,
  hours,
  tags,
}: VendorInfoProps) {
  return (
    <section id="vendor-info" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <SectionLabel className="mb-3">The Restaurant</SectionLabel>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left – name + tags */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-100 leading-tight">{name}</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Divider */}
            <GradientDivider className="mt-8 max-w-none mx-0" />
          </div>

          {/* Right – contact + hours */}
          <div className="flex flex-col gap-6">
            {/* Address */}
            <InfoRow icon={<MapPin size={14} />} label="Address">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="vendor-address-link"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                aria-label={`Open ${address} in Google Maps`}
              >
                {address}
              </a>
            </InfoRow>

            {/* Phone */}
            <InfoRow icon={<Phone size={14} />} label="Phone">
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                id="vendor-phone-link"
                className="text-slate-300 hover:text-slate-100 transition-colors"
              >
                {phone}
              </a>
            </InfoRow>

            {/* Email */}
            <InfoRow icon={<Mail size={14} />} label="Email">
              <a
                href={`mailto:${email}`}
                id="vendor-email-link"
                className="text-slate-300 hover:text-slate-100 transition-colors"
              >
                {email}
              </a>
            </InfoRow>

            {/* Hours */}
            <InfoRow icon={<Clock size={14} />} label="Hours">
              <dl className="flex flex-col gap-1">
                {hours.map(({ day, time }) => (
                  <div key={day} className="flex gap-3 text-sm">
                    <dt className="text-slate-500 w-28 flex-shrink-0">{day}</dt>
                    <dd className="text-slate-300">{time}</dd>
                  </div>
                ))}
              </dl>
            </InfoRow>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── InfoRow sub-component ──────────────────────── */

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 items-start">
      <span
        className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center bg-amber-400/10 border border-amber-400/20 text-amber-400"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">{label}</span>
        <div className="text-sm text-slate-300">{children}</div>
      </div>
    </div>
  );
}
