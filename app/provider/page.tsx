import { AppShell } from "@/components/AppShell";
import { ProviderModePanel } from "@/components/dashboard/ProviderModePanel";
import Link from "next/link";
import { BellRing, BriefcaseBusiness, MapPin, UserCheck } from "lucide-react";

export default function ProviderDashboard() {
  return (
    <AppShell role="provider">
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-nestly-ink p-7 text-white shadow-glow md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-nestly-lime">
            Provider dashboard
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Go online. Accept jobs.
          </h1>
          <p className="mt-4 max-w-2xl text-white/60">
            Set availability, receive matched customer requests, accept or decline jobs.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <UserCheck className="mb-3 text-nestly-green" />
            <p className="font-black">Status</p>
            <p className="mt-1 text-sm text-nestly-muted">Online/busy/offline.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <BellRing className="mb-3 text-nestly-green" />
            <p className="font-black">Requests</p>
            <p className="mt-1 text-sm text-nestly-muted">Accept or decline.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <MapPin className="mb-3 text-nestly-green" />
            <p className="font-black">Radius</p>
            <p className="mt-1 text-sm text-nestly-muted">Match by area.</p>
          </div>
          <Link href="/provider/requests" className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <BriefcaseBusiness className="mb-3 text-nestly-green" />
            <p className="font-black">View requests</p>
            <p className="mt-1 text-sm text-nestly-muted">Open matched jobs.</p>
          </Link>
        </section>

        <ProviderModePanel />

        <div className="rounded-[2rem] bg-white p-6 shadow-premium">
          <h2 className="text-2xl font-black">Matched requests</h2>
          <p className="mt-2 text-nestly-muted">
            When a customer creates a job that matches your category, online status
            and radius, it will appear in your requests page.
          </p>
          <Link
            href="/provider/requests"
            className="mt-5 inline-flex rounded-full bg-nestly-ink px-5 py-3 text-sm font-black text-white"
          >
            Open requests
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
