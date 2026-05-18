import { AppShell } from "@/components/AppShell";
import { RequestForm } from "@/components/forms/RequestForm";
import { Search, MapPin, CreditCard, ShieldCheck } from "lucide-react";

export default function CustomerDashboard() {
  return (
    <AppShell role="customer">
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-nestly-ink p-7 text-white shadow-glow md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-nestly-lime">
            Customer dashboard
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Request help fast.
          </h1>
          <p className="mt-4 max-w-2xl text-white/60">
            Post a job, match with available providers, pay a 20% deposit,
            track arrival and confirm completion.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <Search className="mb-3 text-nestly-green" />
            <p className="font-black">Post request</p>
            <p className="mt-1 text-sm text-nestly-muted">Describe the job.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <ShieldCheck className="mb-3 text-nestly-green" />
            <p className="font-black">Provider accepts</p>
            <p className="mt-1 text-sm text-nestly-muted">Online providers respond.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <CreditCard className="mb-3 text-nestly-green" />
            <p className="font-black">20% deposit</p>
            <p className="mt-1 text-sm text-nestly-muted">Secure booking.</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <MapPin className="mb-3 text-nestly-green" />
            <p className="font-black">Track arrival</p>
            <p className="mt-1 text-sm text-nestly-muted">See progress.</p>
          </div>
        </section>

        <RequestForm />
      </div>
    </AppShell>
  );
}
