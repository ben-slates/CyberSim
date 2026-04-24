import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, TerminalSquare, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

const fakeLogs = [
  "[00:14:09] IDS: anomalous SMTP payload detected in finance segment",
  "[00:14:13] EDR: macro execution request denied on WS-214",
  "[00:14:19] SIEM: impossible-travel correlation promoted to high",
  "[00:14:25] DLP: outbound archive to personal cloud blocked",
  "[00:14:31] WAF: SQLi payload signature matched on /checkout",
  "[00:14:37] EDGE: SYN flood heuristic crossed mitigation threshold",
  "[00:14:42] IAM: service principal secret rotated after anomaly",
  "[00:14:47] IR: analyst simulation mode armed"
];

export default function AuthPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const storeError = useAuthStore((state) => state.error);
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    identity: "",
    password: ""
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  const liveLogs = useMemo(() => [...fakeLogs, ...fakeLogs, ...fakeLogs].slice(0, 18), []);

  function validate() {
    if (mode === "register") {
      if (form.username.trim().length < 3) return "Username must be at least 3 characters.";
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
    }
    if ((mode === "login" ? form.identity : form.password).trim().length === 0 && mode === "login") {
      return "Enter your username or email.";
    }
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setError("");
    try {
      if (mode === "login") {
        await login({ identity: form.identity, password: form.password });
        navigate("/dashboard");
      } else {
        const result = await register({ username: form.username, email: form.email, password: form.password });
        if (result.pendingVerification) {
          navigate("/verify-email");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  return (
    <div className="app-shell flex min-h-screen flex-col overflow-hidden bg-bg">
      <div className="drag-region flex h-12 items-center justify-between border-b border-border px-4">
        <div className="font-heading tracking-[0.35em] text-primary">CYBERSIM</div>
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Offline Desktop Simulator</div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="grid flex-1 overflow-y-auto grid-cols-1 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden border-r border-border bg-black/30 p-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-primary">
              <TerminalSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Incident Command</div>
              <h1 className="font-heading text-4xl text-primary text-glow">CyberSim</h1>
            </div>
          </div>
          <p className="max-w-xl text-lg leading-8 text-slate-300">
            Drill through live-fire cybersecurity decisions in a native desktop environment with no network dependency, realistic telemetry, and locally persisted progress.
          </p>
          <div className="mt-10 rounded-3xl border border-primary/20 bg-black/50 p-6">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-primary">
              <ShieldCheck className="h-4 w-4" />
              Live Breach Feed
            </div>
            <div className="terminal-scroll max-h-[300px] space-y-2 overflow-y-auto rounded-2xl border border-border bg-[#061012] p-4 font-heading text-sm text-primary">
              {liveLogs.map((log, index) => (
                <motion.div key={`${log}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                  {log}
                </motion.div>
              ))}
              <div className="typewriter-cursor mt-4 text-primary/80">simulator-ready</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <motion.div layout className="glass-card w-full max-w-md rounded-[32px] border border-primary/15 p-8">
            <div className="mb-8 flex rounded-2xl border border-border bg-black/20 p-1">
              {["login", "register"].map((value) => (
                <button
                  key={value}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.22em] transition ${mode === value ? "bg-primary/15 text-primary" : "text-slate-400"}`}
                  onClick={() => {
                    setMode(value);
                    setError("");
                    setForm({
                      username: "",
                      email: "",
                      identity: "",
                      password: ""
                    });
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="mb-6">
              <div className="text-xs uppercase tracking-[0.32em] text-slate-500">{mode === "login" ? "Operator Access" : "Create Operator"}</div>
              <h2 className="mt-2 font-heading text-3xl text-slate-100">{mode === "login" ? "Sign In" : "Register"}</h2>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <>
                  <input
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary/40"
                    placeholder="Username"
                    value={form.username}
                    onChange={(event) => setForm((state) => ({ ...state, username: event.target.value }))}
                  />
                  <input
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary/40"
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                  />
                </>
              ) : (
                <input
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary/40"
                  placeholder="Username or Email"
                  value={form.identity}
                  onChange={(event) => setForm((state) => ({ ...state, identity: event.target.value }))}
                />
              )}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 pr-12 outline-none transition focus:border-primary/40"
                  placeholder="Password"
                  value={form.password}
                  onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {(error || storeError) ? <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error || storeError}</div> : null}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Authenticating..." : mode === "login" ? "Enter Command Center" : "Create Operator"}
              </Button>
            </form>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  );
}
