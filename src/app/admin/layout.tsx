import type { Metadata } from "next";

/** The admin area: private, never indexed. */
export const metadata: Metadata = { title: "Admin | VA for BnB", robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cloud-2 text-ink">{children}</div>;
}
