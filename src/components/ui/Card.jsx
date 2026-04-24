import clsx from "clsx";

export function Card({ children, className }) {
  return (
    <div
      className={clsx(
        "panel-surface rounded-2xl p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-neon",
        className
      )}
    >
      {children}
    </div>
  );
}
