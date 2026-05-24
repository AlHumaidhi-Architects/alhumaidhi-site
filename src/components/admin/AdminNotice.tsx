const SCHEMA_SQL = `create table if not exists site_content (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);`;

const ENV_BLOCK = `ADMIN_PASSWORD=choose-a-strong-password
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`;

export function AdminNotice({ kind }: { kind: "no-admin" | "no-supabase" }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-sm leading-relaxed text-[#a39e94]">
        <header className="space-y-1">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#6f6c66]">Site editor</p>
          <h1 className="display text-2xl text-[#e8e4db]">
            {kind === "no-admin" ? "One-time setup" : "Connect Supabase to save changes"}
          </h1>
        </header>

        <p>
          Add these to <code className="rounded bg-black/40 px-1.5 py-0.5 text-[#e8e4db]">.env.local</code> (and to
          your hosting provider&rsquo;s environment variables), then restart the server:
        </p>
        <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-[#cfcabf]">{ENV_BLOCK}</pre>

        <p>
          In the Supabase <strong className="text-[#e8e4db]">SQL editor</strong>, run:
        </p>
        <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-[#cfcabf]">{SCHEMA_SQL}</pre>

        <p>
          For in-browser image uploads, a <strong className="text-[#e8e4db]">public</strong> Storage bucket named{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 text-[#e8e4db]">site-media</code> is{" "}
          <strong className="text-[#e8e4db]">created automatically</strong> on first upload (using the service-role
          key). You can always paste an image URL instead.
        </p>

        <p className="text-xs text-[#6f6c66]">
          Until this is done the public site keeps showing its built-in content — nothing breaks.
        </p>
      </div>
    </div>
  );
}
