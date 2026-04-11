'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

export interface DateTimePickerProps {
  /** ISO-8601 local datetime string, e.g. "2026-04-11T14:30" */
  value?: string;
  /** Minimum selectable datetime (ISO-8601 local) */
  min?: string;
  onChange: (val: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toLocalIso(date: Date, hours: number, minutes: number): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hours)}:${pad(minutes)}`;
}

function parseLocalIso(iso: string): { year: number; month: number; day: number; hours: number; minutes: number } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return { year: +m[1], month: +m[2] - 1, day: +m[3], hours: +m[4], minutes: +m[5] };
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── Time Selector ───────────────────────────────────────────────────────────

function TimeSelector({
  hours,
  minutes,
  onChange,
}: {
  hours: number;
  minutes: number;
  onChange: (h: number, m: number) => void;
}) {
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-t border-white/5 bg-white/[0.02]">
      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Time</span>
      <div className="flex items-center gap-1.5 flex-1">
        <select
          value={hours}
          onChange={(e) => onChange(+e.target.value, minutes)}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/40 appearance-none text-center cursor-pointer"
        >
          {hourOptions.map((h) => (
            <option key={h} value={h} className="bg-slate-900">
              {pad(h)}
            </option>
          ))}
        </select>
        <span className="text-slate-500 font-bold text-lg">:</span>
        <select
          value={minutes}
          onChange={(e) => onChange(hours, +e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/40 appearance-none text-center cursor-pointer"
        >
          {minuteOptions.map((m) => (
            <option key={m} value={m} className="bg-slate-900">
              {pad(m)}
            </option>
          ))}
        </select>
      </div>
      <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 shrink-0">
        {hours >= 12 ? 'PM' : 'AM'}
      </span>
    </div>
  );
}

// ── Calendar Content (shared between dropdown and bottom sheet) ──────────

function CalendarContent({
  viewYear,
  viewMonth,
  calendarDays,
  selectedDate,
  selectedHours,
  selectedMinutes,
  today,
  isDayDisabled,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onTimeChange,
  onClose,
  isMobileSheet,
}: {
  viewYear: number;
  viewMonth: number;
  calendarDays: { day: number; inMonth: boolean; date: Date }[];
  selectedDate: Date | null;
  selectedHours: number;
  selectedMinutes: number;
  today: Date;
  isDayDisabled: (date: Date) => boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
  onTimeChange: (h: number, m: number) => void;
  onClose: () => void;
  isMobileSheet: boolean;
}) {
  return (
    <>
      {/* Header with month navigation */}
      <div className={cn(
        "flex items-center justify-between px-4 border-b border-white/5",
        isMobileSheet ? "py-4" : "py-3"
      )}>
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className={cn(isMobileSheet ? "w-5 h-5" : "w-4 h-4")} />
        </button>
        <span className={cn(
          "font-bold text-slate-200 tracking-wide",
          isMobileSheet ? "text-base" : "text-sm"
        )}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className={cn(isMobileSheet ? "w-5 h-5" : "w-4 h-4")} />
        </button>
      </div>

      {/* Day of week labels */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className={cn(
            "text-center font-bold text-slate-500 uppercase tracking-wider",
            isMobileSheet ? "text-xs py-2" : "text-[10px] py-1.5"
          )}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar day grid */}
      <div className="grid grid-cols-7 px-3 pb-2">
        {calendarDays.map(({ day, inMonth, date }, i) => {
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const disabled = isDayDisabled(date);

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onDayClick(date)}
              className={cn(
                "relative flex items-center justify-center rounded-lg font-medium transition-all duration-150",
                isMobileSheet ? "h-11 text-sm" : "h-9 text-xs",
                !inMonth && "text-slate-700",
                inMonth && !isSelected && !disabled && "text-slate-300 hover:bg-white/5 hover:text-white",
                isSelected && "bg-amber-500 text-black font-black shadow-[0_0_12px_rgba(245,158,11,0.3)]",
                isToday && !isSelected && "text-amber-400 font-bold",
                disabled && "text-slate-800 cursor-not-allowed",
              )}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time selector */}
      <TimeSelector hours={selectedHours} minutes={selectedMinutes} onChange={onTimeChange} />

      {/* Done button (mobile only) */}
      {isMobileSheet && (
        <div className="px-4 pb-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-500 text-black text-sm font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function DateTimePicker({
  value,
  min,
  onChange,
  placeholder = 'Select date & time',
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsed = value ? parseLocalIso(value) : null;

  // Calendar navigation state
  const today = new Date();
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  // Selected date + time
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parsed ? new Date(parsed.year, parsed.month, parsed.day) : null,
  );
  const [selectedHours, setSelectedHours] = useState(parsed?.hours ?? 12);
  const [selectedMinutes, setSelectedMinutes] = useState(parsed?.minutes ?? 0);

  // Parse min value
  const minParsed = min ? parseLocalIso(min) : null;
  const minDate = minParsed ? new Date(minParsed.year, minParsed.month, minParsed.day) : null;

  // Close on click outside (desktop only)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Sync view when value changes externally
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
      setSelectedDate(new Date(parsed.year, parsed.month, parsed.day));
      setSelectedHours(parsed.hours);
      setSelectedMinutes(parsed.minutes);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarDays = useMemo(() => {
    const days: { day: number; inMonth: boolean; date: Date }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      days.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth - 1, d) });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, inMonth: true, date: new Date(viewYear, viewMonth, d) });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth + 1, d) });
    }

    return days;
  }, [viewYear, viewMonth, daysInMonth, firstDay, prevMonthDays]);

  // Navigation
  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  // Selection handlers
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const iso = toLocalIso(date, selectedHours, selectedMinutes);
    onChange(iso);
  };

  const handleTimeChange = (h: number, m: number) => {
    setSelectedHours(h);
    setSelectedMinutes(m);
    if (selectedDate) {
      const iso = toLocalIso(selectedDate, h, m);
      onChange(iso);
    }
  };

  const isDayDisabled = (date: Date) => {
    if (!minDate) return false;
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return dateOnly < minOnly;
  };

  // Display text
  const displayText = useMemo(() => {
    if (!selectedDate) return '';
    const ampm = selectedHours >= 12 ? 'PM' : 'AM';
    const h12 = selectedHours % 12 || 12;
    return `${MONTH_NAMES[selectedDate.getMonth()]?.slice(0, 3)} ${selectedDate.getDate()}, ${selectedDate.getFullYear()} · ${h12}:${pad(selectedMinutes)} ${ampm}`;
  }, [selectedDate, selectedHours, selectedMinutes]);

  const sharedProps = {
    viewYear,
    viewMonth,
    calendarDays,
    selectedDate,
    selectedHours,
    selectedMinutes,
    today,
    isDayDisabled,
    onPrevMonth: goToPrevMonth,
    onNextMonth: goToNextMonth,
    onDayClick: handleDayClick,
    onTimeChange: handleTimeChange,
    onClose: () => setIsOpen(false),
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-200",
          "bg-black/40 backdrop-blur-sm",
          isOpen
            ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            : "border-white/10 hover:border-white/20",
          value ? "text-slate-200" : "text-slate-500"
        )}
      >
        <CalendarIcon className="w-4 h-4 text-amber-400/60 shrink-0" />
        <span className="flex-1 truncate">
          {displayText || placeholder}
        </span>
        {value && (
          <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
            {selectedHours >= 12 ? 'PM' : 'AM'}
          </span>
        )}
      </button>

      {/* ── Desktop Dropdown (hidden on mobile) ── */}
      {isOpen && (
        <div className="hidden sm:block absolute z-50 mt-2 w-full min-w-[300px] rounded-xl border border-white/10 bg-[rgba(15,19,26,0.97)] backdrop-blur-xl shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          <CalendarContent {...sharedProps} isMobileSheet={false} />
        </div>
      )}

      {/* ── Mobile Bottom Sheet ── */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-[110]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 inset-x-0 z-10 rounded-t-2xl border-t border-white/10 bg-[rgba(15,19,26,0.98)] backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Pick Date & Time</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-10 h-1 rounded-full bg-white/10 mx-auto mb-2" />

            <CalendarContent {...sharedProps} isMobileSheet={true} />
          </div>
        </div>
      )}
    </div>
  );
}
