import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type BigActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  children: ReactNode;
  tone?: "primary" | "neutral" | "danger" | "warning";
};

const toneClasses = {
  primary: "bg-sky-700 text-white border-sky-800 hover:bg-sky-800",
  neutral: "bg-white text-ink border-line hover:bg-slate-50",
  danger: "bg-red-600 text-white border-red-700 hover:bg-red-700",
  warning: "bg-amber-500 text-ink border-amber-600 hover:bg-amber-600"
};

export function BigActionButton({
  href,
  children,
  tone = "neutral",
  className = "",
  ...buttonProps
}: BigActionButtonProps) {
  const classes = `flex min-h-14 w-full items-center justify-center rounded-lg border px-5 py-4 text-center text-base font-bold shadow-sm transition ${toneClasses[tone]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
