import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0b0b0d] font-sans text-[#e8e4db] [color-scheme:dark] selection:bg-[#b89b78] selection:text-[#0b0b0d]">
      {children}
    </div>
  );
}
