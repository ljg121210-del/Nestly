"use client";

import { useState } from "react";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { serviceCategories } from "@/lib/categories";
import { ProviderRadiusMap } from "@/components/maps/ProviderRadiusMap";
import { MatchedProvider, findAvailableProviders } from "@/lib/matching";
import { Camera, Send } from "lucide-react";

export function RequestForm() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [matches, setMatches] = useState<MatchedProvider[]>([]);
  const [createdJobId, setCreatedJobId] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    category: "cleaning",
    description: "",
    urgency: "asap",
    location: "",
    latitude: "53.5228",
    longitude: "-1.1285",
    scheduled_time: "",
  });

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotice("");
    setMatches([]);

    if (!hasSupabaseEnv) {
      setNotice("Supabase is not connected.");
      setLoading(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setNotice("Please log in before creating a request.");
      setLoading(false);
      return;
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    const providers = await findAvailableProviders({
      category: form.category,
      latitude,
      longitude,
    });

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        customer_id: user.id,
        title: form.title,
        category: form.category,
        description: form.description,
        urgency: form.urgency,
        location: form.location,
        latitude,
        longitude,
        status: providers.length ? "matched" : "requested",
        scheduled_time: form.urgency === "scheduled" ? form.scheduled_time : null,
      })
      .select()
      .single();

    if (error) {
      setNotice(error.message);
      setLoading(false);
      return;
    }

    if (providers.length) {
      await supabase.from("job_requests").insert(
        providers.map((provider) => ({
          job_id: job.id,
          provider_id: provider.provider_id,
          status: "pending",
        }))
      );
    }

    setCreatedJobId(job.id);
    setMatches(providers);
    setNotice(
      providers.length
        ? `${providers.length} online providers matched. They can accept or decline your request.`
        : "No online providers matched yet. Your job is open in the provider feed."
    );
    setLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
      <form onSubmit={submit} className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
        <h2 className="text-3xl font-black">Request help</h2>
        <p className="mt-2 text-sm text-nestly-muted">
          Describe the problem. Nestly will match you with online providers in range.
        </p>

        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="What do you need help with?"
          className="mt-6 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
        />

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="mt-3 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 font-black outline-none"
        >
          {serviceCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Add details about the job/problem"
          className="mt-3 min-h-28 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
        />

        <input
          required
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Location / postcode"
          className="mt-3 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
        />

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ["asap", "ASAP"],
            ["today", "Today"],
            ["scheduled", "Scheduled"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm({ ...form, urgency: value })}
              className={`rounded-2xl p-3 text-sm font-black ${
                form.urgency === value ? "bg-nestly-ink text-white" : "bg-nestly-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {form.urgency === "scheduled" && (
          <input
            type="datetime-local"
            value={form.scheduled_time}
            onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
            className="mt-3 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
          />
        )}

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 bg-nestly-soft p-5 text-sm font-black">
          <Camera size={18} />
          Optional photos of the job/problem
          <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
        </label>

        {photoPreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photoPreviews.map((src) => (
              <img key={src} src={src} alt="Job preview" className="h-24 rounded-2xl object-cover" />
            ))}
          </div>
        )}

        {notice && (
          <div className="mt-4 rounded-2xl bg-nestly-mint p-4 text-sm font-black">
            {notice}
          </div>
        )}

        <button
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-nestly-ink px-5 py-4 text-sm font-black text-white disabled:opacity-60"
        >
          <Send size={18} />
          {loading ? "Matching providers..." : "Send request"}
        </button>

        {createdJobId && (
          <a
            href={`/job/${createdJobId}`}
            className="mt-4 block text-center text-sm font-black text-nestly-green"
          >
            View job tracking →
          </a>
        )}
      </form>

      <div>
        <ProviderRadiusMap
          customerLocation={{
            lat: Number(form.latitude),
            lng: Number(form.longitude),
            label: form.location || "Your job location",
          }}
          providers={matches}
        />

        <div className="mt-4 rounded-[2rem] bg-white p-5 shadow-premium">
          <h3 className="text-xl font-black">Matched providers</h3>
          <div className="mt-4 space-y-3">
            {matches.length === 0 ? (
              <p className="text-sm text-nestly-muted">
                Matched online providers will appear here.
              </p>
            ) : (
              matches.map((provider) => (
                <div key={provider.provider_id} className="rounded-2xl bg-nestly-soft p-4">
                  <p className="font-black">{provider.name}</p>
                  <p className="mt-1 text-sm text-nestly-muted">
                    {provider.distance_miles} miles • ETA {provider.eta_minutes} mins
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
