import type { HTMLAttributes } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl bg-white shadow-[0_8px_30px_rgba(30,64,175,0.08)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
