import { RequestForm } from "@/components/forms/RequestForm";
import { FloatingNav } from "@/components/landing/FloatingNav";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-nestly-soft pt-28">
      <FloatingNav />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-nestly-green">
            Customer request
          </p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">
            Tell Nestly what you need.
          </h1>
          <p className="mt-4 text-nestly-muted">
            Add job details, optional photos, location and urgency.
          </p>
        </div>

        <RequestForm />
      </section>
    </main>
  );
}
