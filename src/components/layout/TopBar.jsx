import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export function TopBar({ title, subtitle }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-5">
      <div>
        <div className="text-xs uppercase tracking-[0.32em] text-slate-500">Active Station</div>
        <h1 className="font-heading text-3xl text-primary">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-4">
        <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-right">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Operator</div>
          <div className="text-sm text-slate-100">{user?.username || "Unknown"}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-info">
          <Bell className="h-5 w-5" />
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
