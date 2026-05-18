"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { AppShell } from "@/components/AppShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Save, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [role, setRole] = useState<"customer" | "provider" | "admin">("customer");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    avatar_url: "",
  });

  useEffect(() => {
    async function load() {
      if (!hasSupabaseEnv) return;

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setRole(userRow?.role || data.user.user_metadata?.role || "customer");

      setProfile({
        id: data.user.id,
        name: userRow?.name || data.user.user_metadata?.name || "",
        email: data.user.email || "",
        phone: userRow?.phone || data.user.user_metadata?.phone || "",
        location: userRow?.location || "",
        avatar_url: userRow?.avatar_url || "",
      });

      setLoading(false);
    }

    load();
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("users").upsert({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      avatar_url: profile.avatar_url,
      role,
    });

    setNotice(error ? error.message : "Profile saved successfully.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <AppShell role={role}>
        <DashboardHeader
          eyebrow="Profile"
          title="Loading profile..."
          subtitle="Fetching your Nestly account."
        />
      </AppShell>
    );
  }

  return (
    <AppShell role={role}>
      <DashboardHeader
        eyebrow="Profile"
        title="Your Nestly profile."
        subtitle="Manage your account details and contact information."
      />

      <form onSubmit={saveProfile} className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-nestly-ink text-3xl font-black text-white">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.name?.slice(0, 2).toUpperCase() || "N"
              )}
            </div>

            <h2 className="mt-4 text-2xl font-black">
              {profile.name || "Nestly user"}
            </h2>

            <p className="mt-1 text-sm capitalize text-nestly-muted">
              {role}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
          <h3 className="mb-5 text-xl font-black">Account details</h3>

          <div className="grid gap-4">
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Full name"
              className="rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            />

            <input
              value={profile.email}
              disabled
              className="rounded-2xl border border-black/10 bg-nestly-soft p-4 text-nestly-muted outline-none"
            />

            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Phone number"
              className="rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            />

            <input
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              placeholder="Location / postcode"
              className="rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            />

            <input
              value={profile.avatar_url}
              onChange={(e) =>
                setProfile({ ...profile, avatar_url: e.target.value })
              }
              placeholder="Avatar image URL"
              className="rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            />
          </div>
        </section>

        {role === "provider" && (
          <section className="rounded-[2rem] bg-nestly-ink p-6 text-white shadow-glow md:p-8">
            <h3 className="text-xl font-black">Provider profile</h3>
            <p className="mt-2 text-sm text-white/60">
              Provider skills, verification and payout settings should stay in
              Provider Onboarding for now.
            </p>

            <a
              href="/provider/onboarding"
              className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-nestly-ink"
            >
              Open provider onboarding
            </a>
          </section>
        )}

        {notice && (
          <div className="rounded-2xl bg-nestly-mint p-4 text-sm font-black">
            {notice}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-nestly-ink px-6 py-4 text-sm font-black text-white">
            <Save size={18} />
            Save profile
          </button>

          <button
            type="button"
            onClick={signOut}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black shadow-premium"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </form>
    </AppShell>
  );
}