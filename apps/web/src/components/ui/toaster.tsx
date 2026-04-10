"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0c1218] group-[.toaster]:text-slate-300 group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_0_40px_rgba(0,0,0,0.5)] group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-2xl font-sans tracking-wide",
          description: "group-[.toast]:text-slate-400 group-[.toast]:font-medium",
          actionButton:
            "group-[.toast]:bg-amber-500 group-[.toast]:text-slate-900 group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:tracking-widest",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300",
          error: "group-[.toaster]:border-rose-500/50 group-[.toaster]:bg-[#1a0f12] group-[.toast]:text-rose-400",
          success: "group-[.toaster]:border-emerald-500/50 group-[.toaster]:bg-[#0f1a14] group-[.toast]:text-emerald-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
