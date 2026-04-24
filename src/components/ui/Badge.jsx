import clsx from "clsx";

export function Badge({ children, className }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", className)}>
      {children}
    </span>
  );
}
