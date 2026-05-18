"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";

type RequestRow = {
  id: string;
  status: "pending" | "accepted" | "declined";
  job_id: string;
  jobs: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    urgency: string;
    status: string;
  };
};

export default function ProviderRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [notice, setNotice] = useState("");

  async function loadRequests() {
    if (!hasSupabaseEnv) return;

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data, error } = await supabase
      .from("job_requests")
      .select("id, status, job_id, jobs(id,title,description,category,location,urgency,status)")
      .eq("provider_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) setNotice(error.message);
    else setRequests((data || []) as any);
  }

  useEffect(() => {
    loadRequests();

    if (!hasSupabaseEnv) return;

    const channel = supabase
      .channel("provider-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_requests" },
        loadRequests
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function respond(requestId: string, jobId: string, response: "accepted" | "declined") {
    const res = await fetch("/api/jobs/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, jobId, response }),
    });

    const data = await res.json();
    setNotice(data.error || `Request ${response}.`);
    loadRequests();
  }

  return (
    <AppShell role="provider">
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-nestly-ink p-7 text-white shadow-glow">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-nestly-lime">
            Provider requests
          </p>
          <h1 className="mt-3 text-4xl font-black">Accept or decline jobs.</h1>
          <p className="mt-3 text-white/60">
            Only matched jobs appear here.
          </p>
        </section>

        {notice && (
          <div className="rounded-2xl bg-nestly-mint p-4 text-sm font-black">
            {notice}
          </div>
        )}

        <div className="grid gap-4">
          {requests.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-8 shadow-premium">
              <h2 className="text-2xl font-black">No requests yet</h2>
              <p className="mt-2 text-nestly-muted">
                Go online and make sure your skills/radius are set.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="rounded-[2rem] bg-white p-6 shadow-premium">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-nestly-green">
                      {request.jobs.category} • {request.jobs.urgency}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{request.jobs.title}</h2>
                    <p className="mt-2 text-sm text-nestly-muted">{request.jobs.description}</p>
                    <p className="mt-2 text-sm font-black text-nestly-muted">
                      {request.jobs.location}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(request.id, request.job_id, "accepted")}
                      disabled={request.status !== "pending"}
                      className="rounded-full bg-nestly-ink px-5 py-3 text-sm font-black text-white disabled:opacity-40"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => respond(request.id, request.job_id, "declined")}
                      disabled={request.status !== "pending"}
                      className="rounded-full bg-nestly-soft px-5 py-3 text-sm font-black disabled:opacity-40"
                    >
                      Decline
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-xs font-black uppercase text-nestly-muted">
                  Status: {request.status}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
