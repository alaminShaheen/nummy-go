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
    <section
      id="vendor-info"
      className="relative py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-3">
          The Restaurant
        </p>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left – name + tags */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-100 leading-tight">
              {name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="
                    px-3 py-1 rounded-full text-xs font-medium
                    bg-white/5 border border-white/10
                    text-slate-400
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Divider */}
            <div
              className="mt-8 h-px w-full"
              style={{ background: 'linear-gradient(to right, rgba(251,191,36,0.4), transparent)' }}
            />
          </div>

          {/* Right – contact + hours */}
          <div className="flex flex-col gap-6">
            {/* Address */}
            <InfoRow icon={<MapPinIcon />} label="Address">
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
            <InfoRow icon={<PhoneIcon />} label="Phone">
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                id="vendor-phone-link"
                className="text-slate-300 hover:text-slate-100 transition-colors"
              >
                {phone}
              </a>
            </InfoRow>

            {/* Email */}
            <InfoRow icon={<MailIcon />} label="Email">
              <a
                href={`mailto:${email}`}
                id="vendor-email-link"
                className="text-slate-300 hover:text-slate-100 transition-colors"
              >
                {email}
              </a>
            </InfoRow>

            {/* Hours */}
            <InfoRow icon={<ClockIcon />} label="Hours">
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

/* ─── Sub-components ─────────────────────────────────── */

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
        className="
          flex-shrink-0 mt-0.5
          w-8 h-8 rounded-lg
          flex items-center justify-center
          bg-amber-400/10 border border-amber-400/20
          text-amber-400
        "
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

/* ─── SVG Icons ──────────────────────────────────────── */

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
