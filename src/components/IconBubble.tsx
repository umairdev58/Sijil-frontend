import React from 'react';
import { cn } from "../lib/utils";

export default function IconBubble({
  active = false,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const base =
    "grid place-items-center w-11 h-11 rounded-full ring-1 ring-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 shrink-0";
  const activeCls =
    "bg-primary/20 ring-2 ring-primary/60 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]";
  return (
    <button className={cn(base, active && activeCls, className)} {...props}>
      <span className="grid place-items-center">
        {children}
      </span>
    </button>
  );
}
