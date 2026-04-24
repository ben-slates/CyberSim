import clsx from "clsx";

export function Button({ children, className, variant = "primary", ...props }) {
  return (
    <button
      className={clsx(
        "no-drag inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "border-primary/40 bg-primary/10 text-primary hover:shadow-neon hover:bg-primary/15": variant === "primary",
          "border-border bg-surface text-slate-200 hover:border-primary/30 hover:text-primary": variant === "secondary",
          "border-danger/40 bg-danger/10 text-danger hover:shadow-danger": variant === "danger",
          "border-warning/40 bg-warning/10 text-warning": variant === "warning",
          "border-transparent bg-transparent text-slate-300 hover:text-primary": variant === "ghost"
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
