import React from 'react';

interface DynamicCalendarIconProps {
  date?: Date | string | number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * DynamicCalendarIcon
 * Renders an authentic tear-off calendar badge displaying the ACTUAL day and month
 * of the referenced date, eliminating static OS emoji glyph artifacts.
 */
export const DynamicCalendarIcon: React.FC<DynamicCalendarIconProps> = ({
  date,
  className = '',
  size = 'md',
}) => {
  // Always resolve to the real Date (or real current live date if omitted or invalid)
  const d = React.useMemo(() => {
    if (!date) return new Date();
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? new Date() : date;
    }
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [date]);

  // Extract actual real day and 3-letter uppercase month from the date
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const sizeStyles = {
    sm: {
      wrapper: 'w-4 h-4 text-[7px]',
      header: 'text-[5px] py-[0.5px]',
      body: 'text-[8px]',
    },
    md: {
      wrapper: 'w-5 h-5 text-[8px]',
      header: 'text-[6px] py-[1px]',
      body: 'text-[9.5px]',
    },
    lg: {
      wrapper: 'w-6 h-6 text-[9px]',
      header: 'text-[7px] py-[1px]',
      body: 'text-[11px]',
    },
  }[size];

  return (
    <span
      data-testid="dynamic-calendar-icon"
      className={`inline-flex flex-col items-center justify-between rounded-[4px] border border-red-500/90 bg-white overflow-hidden shadow-sm shrink-0 leading-none select-none align-middle ${sizeStyles.wrapper} ${className}`}
      title={`Live Date: ${d.toDateString()}`}
      aria-label={`Calendar Date: ${d.toDateString()}`}
    >
      {/* Red binder header strip with real uppercase month */}
      <span className={`w-full bg-red-600 font-mono font-black text-white tracking-tight text-center leading-none flex items-center justify-center ${sizeStyles.header}`}>
        {month}
      </span>
      {/* Calendar body showing actual dynamic day number */}
      <span className={`flex-1 w-full flex items-center justify-center font-mono font-black text-slate-950 leading-none ${sizeStyles.body}`}>
        {day}
      </span>
    </span>
  );
};

