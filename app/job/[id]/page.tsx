"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LiveMap } from "@/components/maps/LiveMap";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { Camera, CreditCard, ShieldCheck } from "lucide-react";

export default function JobTrackingPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null);
  const [notice, setNotice] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);

  async function loadJob() {
    if (!hasSupabaseEnv) return;
    const { data } = await supabase.from("jobs").select("*").eq("id", params.id).single();
    setJob(data);
  }

  useEffect(() => {
    loadJob();

    if (!hasSupabaseEnv) return;

    const channel = supabase
      .channel(`job-${params.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs", filter: `id=eq.${params.id}` },
        loadJob
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  function handleCompletionPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setCompletionPhotos(files.map((file) => URL.createObjectURL(file)));
  }

  async function payDeposit() {
    const res = await fetch("/api/stripe/create-deposit-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: params.id, estimatedAmountPence: 10000 }),
    });

    const data = await res.json();

    if (data.url) window.location.href = data.url;
    else setNotice(data.error || "Stripe deposit is not configured yet.");
  }

  async function completeJob() {
    const res = await fetch("/api/jobs/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: params.id }),
    });

    const data = await res.json();
    setNotice(data.error || "Job marked complete. Final payment can now be collected.");
    loadJob();
  }

  const trackingEnabled = job?.status === "on_the_way" || job?.status === "arrived";

  return (
    <AppShell role="customer">
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-nestly-ink p-7 text-white shadow-glow">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-nestly-lime">
            Job tracking
          </p>
          <h1 className="mt-3 text-4xl font-black">
            {job?.title || "Track your job"}
          </h1>
          <p className="mt-3 text-white/60">
            Deposit, arrival tracking, completion photos and final payment.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <LiveMap
            providerName={job?.provider_name || "Provider"}
            eta={trackingEnabled ? "12 mins" : "Tracking locked"}
            trackingEnabled={trackingEnabled}
          />

          <aside className="space-y-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-premium">
              <h2 className="text-2xl font-black">Status</h2>
              <p className="mt-2 text-nestly-muted">
                {job?.status?.replaceAll("_", " ") || "Loading"}
              </p>

              <button
                onClick={payDeposit}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-nestly-ink px-5 py-4 text-sm font-black text-white"
              >
                <CreditCard size={18} />
                Pay 20% deposit
              </button>

              <p className="mt-3 text-xs leading-5 text-nestly-muted">
                Deposit is designed to be refundable if the provider does not arrive.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-premium">
              <h2 className="text-2xl font-black">Completion photos</h2>
              <p className="mt-2 text-sm text-nestly-muted">
                Upload photos of the completed job before final payment.
              </p>

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 bg-nestly-soft p-5 text-sm font-black">
                <Camera size={18} />
                Add completion photos
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleCompletionPhotos} />
              </label>

              {completionPhotos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {completionPhotos.map((src) => (
                    <img key={src} src={src} alt="Completion" className="h-24 rounded-2xl object-cover" />
                  ))}
                </div>
              )}

              <button
                onClick={completeJob}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-nestly-green px-5 py-4 text-sm font-black text-white"
              >
                <ShieldCheck size={18} />
                Confirm completed
              </button>
            </div>

            {notice && (
              <div className="rounded-2xl bg-nestly-mint p-4 text-sm font-black">
                {notice}
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
