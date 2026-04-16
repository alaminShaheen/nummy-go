'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@nummygo/shared/ui';

interface InlineEditableFieldProps {
  value: string | number;
  onSave: (val: string) => void;
  type?: 'text' | 'textarea' | 'number';
  placeholder?: string;
  className?: string;
  textClassName?: string;
  textStyle?: React.CSSProperties;
  inputClassName?: string;
  prefix?: string;
  suffix?: string;
}

export function InlineEditableField({
  value,
  onSave,
  type = 'text',
  placeholder,
  className,
  textClassName,
  textStyle,
  inputClassName,
  prefix,
  suffix,
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (currentValue !== value && currentValue !== '') {
      onSave(currentValue.toString());
    } else if (currentValue === '') {
      // If they empty it, we restore original unless we want to allow empty. Let's allow empty if it's text.
      if (type === 'number') {
        setCurrentValue(value);
      } else {
        onSave('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(value);
    }
  };

  if (isEditing) {
    const commonClasses = cn(
      "w-full border border-amber-500/60 rounded-md px-2 py-1 outline-none shadow-[0_0_15px_rgba(245,158,11,0.2)] focus:border-amber-400 transition-all",
      "bg-white dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100",
      className,
      inputClassName
    );

    return (
      <div className="flex items-center w-full relative z-40">
        {prefix && <span className="mr-1 text-slate-400 select-none text-sm">{prefix}</span>}
        {type === 'textarea' ? (
          <textarea
            ref={inputRef as any}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(commonClasses, "resize-none min-h-[70px] text-sm")}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as any}
            type={type}
            step={type === 'number' ? '0.01' : undefined}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={commonClasses}
          />
        )}
        {suffix && <span className="ml-1 text-slate-400 select-none text-sm">{suffix}</span>}
      </div>
    );
  }

  const isEmpty = currentValue === '' || currentValue === null || currentValue === undefined;

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={cn(
        "group/inline relative cursor-text rounded -mx-1.5 px-1.5 border border-transparent hover:border-dashed hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-200",
        className
      )}
    >
      <div className={cn("pointer-events-none break-words", textClassName, isEmpty && "opacity-50 italic")} style={textStyle}>
        {prefix && <span className="opacity-70 mr-0.5">{prefix}</span>}
        {isEmpty ? placeholder || 'Empty...' : currentValue}
        {suffix && !isEmpty && <span className="opacity-70 ml-0.5">{suffix}</span>}
      </div>
    </div>
  );
}
