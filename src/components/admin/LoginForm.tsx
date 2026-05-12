"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Couldn't sign in.");
      router.replace("/admin");
      router.refresh();
    } catch (ex: any) {
      setError(ex?.message || "Couldn't sign in.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-8"
      >
        <div className="text-center">
          <p className="display text-2xl text-[#e8e4db]">Site Editor</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.24em] text-[#6f6c66]">Restricted area</p>
        </div>
        <div>
          <label className="mb-1 block text-[0.78rem] font-medium text-[#a39e94]">Password</label>
          <input
            autoFocus
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-[#e8e4db] outline-none transition focus:border-[#b89b78]"
          />
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded-md bg-[#b89b78] px-4 py-2 text-sm font-semibold text-[#0b0b0d] transition enabled:hover:bg-[#c9ac88] disabled:opacity-40"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
