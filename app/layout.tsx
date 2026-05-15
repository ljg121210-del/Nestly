import "./globals.css";
import type { Metadata } from "next";
import { NotificationToaster } from "@/components/realtime/NotificationToaster";
export const metadata: Metadata = { title: "Nestly | Trusted local help, fast", description: "Launch-ready local services marketplace." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><NotificationToaster />{children}</body></html>;
}
