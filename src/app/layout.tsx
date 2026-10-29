import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/noto-sans-ethiopic/400.css";
import "./globals.css";
import { getUser, demoAuthEnabled } from "@/lib/auth";
import { AuthProvider } from "@/components/auth-provider";
import { ClientProviders } from "@/components/client-providers";
import { Header } from "@/components/header";
export const metadata: Metadata = { title: { default: "SelamCode — Learn to debug, not just to copy", template: "%s · SelamCode" }, description: "A patient, learning-first Python debugging companion. Staged hints, Amharic support, and research that puts understanding first." };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return <html lang="en"><body className="font-sans"><a href="#main-content" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-teal-400 px-4 py-3 text-sm font-semibold text-canvas focus:translate-y-0">Skip to content</a><AuthProvider initialUser={user} demoEnabled={demoAuthEnabled()}><ClientProviders><Header /><main id="main-content">{children}</main></ClientProviders></AuthProvider></body></html>;
}
