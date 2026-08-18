import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary:
    "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-blue-500 active:scale-[0.97]",
  secondary:
    "bg-white text-blue-700 border-2 border-blue-100 shadow-sm hover:border-blue-300 active:scale-[0.97]",
  ghost: "bg-white/70 text-slate-600 hover:bg-white active:scale-[0.97]",
};

export function Button({
  variant = "primary",
  icon,
  fullWidth,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold tracking-tight transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${
        variants[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
