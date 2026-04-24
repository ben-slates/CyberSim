import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const pendingVerification = useAuthStore((state) => state.pendingVerification);
  const verificationUserId = useAuthStore((state) => state.verificationUserId);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerificationEmail = useAuthStore((state) => state.resendVerificationEmail);
  const error = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);

  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendMode, setResendMode] = useState(false);

  useEffect(() => {
    if (!pendingVerification) {
      navigate("/");
    }
  }, [pendingVerification, navigate]);

  async function handleVerify(e) {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await verifyEmail(code);
      setVerified(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error("Verification failed:", err);
    }
  }

  async function handleResend(e) {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    try {
      await resendVerificationEmail(resendEmail);
      setResendMode(false);
      alert("Verification code sent! Check your inbox.");
    } catch (err) {
      console.error("Resend failed:", err);
    }
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-primary/30 bg-primary/10 p-8 text-center"
        >
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="font-heading text-3xl text-primary">Email Verified!</h1>
          <p className="mt-2 text-slate-400">Your account is ready. Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="drag-region flex h-12 items-center justify-between border-b border-border px-4">
        <div className="font-heading tracking-[0.35em] text-primary">CYBERSIM</div>
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Email Verification</div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-[32px] border border-primary/15 bg-black/40 p-8 backdrop-blur"
        >
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="mb-2 text-center font-heading text-2xl text-primary">Check Your Email</h2>
          <p className="mb-6 text-center text-sm text-slate-400">
            We sent a verification link to your email address. Paste the code below or click the link in your email.
          </p>

          {resendMode ? (
            <form onSubmit={handleResend} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary/40"
              />
              {error && <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Resend Verification Code"}
              </Button>
              <button
                type="button"
                onClick={() => setResendMode(false)}
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-slate-400 transition hover:text-primary"
              >
                Back
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength="6"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 font-heading text-2xl text-center letter-spacing outline-none transition focus:border-primary/40"
              />
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}
              <Button className="w-full" type="submit" disabled={loading || code.length !== 6}>
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
              <button
                type="button"
                onClick={() => setResendMode(true)}
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-slate-400 transition hover:text-primary"
              >
                Didn't receive the code?
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            The verification code expires in 30 minutes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
