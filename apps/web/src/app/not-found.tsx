import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--color-brand-bg)] text-[var(--color-text-primary)] font-sans">

      {/* Background ambient glows */}
      <div className="glow-indigo top-[-20%] left-[-10%] select-none animate-pulse-glow" />
      <div className="glow-amber bottom-[-20%] right-[-10%] select-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* 404 Content */}
      <div className="relative z-10 flex flex-col items-center animate-slide-up text-center px-4">

        {/* Massive Glassmorphic 404 */}
        <h1 className="text-[8rem] sm:text-[12rem] font-black tracking-tighter leading-none gradient-text drop-shadow-[0_0_40px_rgba(251,191,36,0.3)]">
          404
        </h1>

        <div className="glass mt-8 p-8 rounded-3xl gradient-border-card max-w-lg border border-[var(--color-brand-border)]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            This kitchen isn’t serving right now.
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8">
            The vendor may have moved, paused service, or the link is incorrect.
          </p>

          <Link href="/" className="inline-flex items-center justify-center relative group">
            {/* The magical hover glow from the AuthNavbar style */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-60 blur-lg transition-opacity duration-300 group-hover:opacity-100" />

            <span className="relative inline-flex font-semibold items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-105 active:scale-95">
              Return Home
            </span>
          </Link>
        </div>

      </div>
    </div>
    </>
  );
}
