"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { AppShell } from "@/components/AppShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";

type Role = "customer" | "provider" | "admin";

export default function ProfilePage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notice, setNotice] = useState("");

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    avatar_url: "",
  });

  const [provider, setProvider] = useState({
    bio: "",
    skills: "",
    provider_mode: "offline",
    travel_radius_miles: "10",
    experience_years: "",
    insurance_number: "",
    verification_status: "not_started",
    rating: "0",
    jobs_completed: "0",
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

      const actualRole =
        userRow?.role || data.user.user_metadata?.role || "customer";

      setRole(actualRole);

      setProfile({
        id: data.user.id,
        name: userRow?.name || data.user.user_metadata?.name || "",
        email: data.user.email || "",
        phone: userRow?.phone || data.user.user_metadata?.phone || "",
        location: userRow?.location || "",
        avatar_url: userRow?.avatar_url || "",
      });

      if (actualRole === "provider") {
        const { data: providerRow } = await supabase
          .from("provider_profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (providerRow) {
          setProvider({
            bio: providerRow.bio || "",
            skills: Array.isArray(providerRow.skills)
              ? providerRow.skills.join(", ")
              : "",
            provider_mode: providerRow.provider_mode || "offline",
            travel_radius_miles: String(providerRow.travel_radius_miles || 10),
            experience_years: String(providerRow.experience_years || ""),
            insurance_number: providerRow.insurance_number || "",
            verification_status:
              providerRow.verification_status || "not_started",
            rating: String(providerRow.rating || "0"),
            jobs_completed: String(providerRow.jobs_completed || "0"),
          });
        }
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice("");

    const { error } = await supabase.from("users").upsert({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      avatar_url: profile.avatar_url,
      role,
    });

    if (error) {
      setNotice(error.message);
      setSaving(false);
      return;
    }

    if (role === "provider") {
      const skillsArray = provider.skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const { error: providerError } = await supabase
        .from("provider_profiles")
        .upsert(
          {
            user_id: profile.id,
            phone: profile.phone,
            bio: provider.bio,
            skills: skillsArray,
            provider_mode: provider.provider_mode,
            travel_radius_miles: Number(provider.travel_radius_miles || 10),
            experience_years: Number(provider.experience_years || 0),
            insurance_number: provider.insurance_number,
            verification_status:
              provider.verification_status === "verified"
                ? "verified"
                : "pending",
          },
          { onConflict: "user_id" }
        );

      if (providerError) {
        setNotice(providerError.message);
        setSaving(false);
        return;
      }
    }

    setNotice("Profile saved successfully.");
    setSaving(false);
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
          subtitle="Fetching your Nestly account details."
        />
      </AppShell>
    );
  }

  return (
    <AppShell role={role}>
      <DashboardHeader
        eyebrow="Profile"
        title="Your Nestly profile."
        subtitle="Manage your account, contact details, trust profile and provider visibility."
      />

      <form onSubmit={saveProfile} className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-[2.3rem] bg-white shadow-premium">
          <div className="bg-nestly-ink p-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-white text-3xl font-black text-nestly-ink">
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

                <div>
                  <h2 className="text-3xl font-black">
                    {profile.name || "Nestly user"}
                  </h2>
                  <p className="mt-1 capitalize text-white/60">{role}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-black">
                {role === "provider" ? (
                  <>
                    <Star size={16} className="mr-1 inline fill-current" />
                    {provider.rating} rating • {provider.jobs_completed} jobs
                  </>
                ) : (
                  <>
                    <BadgeCheck size={16} className="mr-1 inline" />
                    Customer account
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            <div className="rounded-2xl bg-nestly-soft p-4">
              <Mail size={18} className="mb-2 text-nestly-green" />
              <p className="text-xs font-bold text-nestly-muted">Email</p>
              <p className="mt-1 break-all text-sm font-black">
                {profile.email}
              </p>
            </div>

            <div className="rounded-2xl bg-nestly-soft p-4">
              <Phone size={18} className="mb-2 text-nestly-green" />
              <p className="text-xs font-bold text-nestly-muted">Phone</p>
              <p className="mt-1 text-sm font-black">
                {profile.phone || "Not added"}
              </p>
            </div>

            <div className="rounded-2xl bg-nestly-soft p-4">
              <MapPin size={18} className="mb-2 text-nestly-green" />
              <p className="text-xs font-bold text-nestly-muted">Location</p>
              <p className="mt-1 text-sm font-black">
                {profile.location || "Not added"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
            <h3 className="mb-5 text-2xl font-black">Account details</h3>

            <div className="grid gap-4">
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
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
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
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
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
            <h3 className="mb-5 text-2xl font-black">Trust profile</h3>

            <div className="space-y-3">
              <div className="rounded-2xl bg-nestly-soft p-4">
                <User size={18} className="mb-2 text-nestly-green" />
                <p className="text-sm font-black">Account role</p>
                <p className="mt-1 capitalize text-sm text-nestly-muted">
                  {role}
                </p>
              </div>

              <div className="rounded-2xl bg-nestly-soft p-4">
                <Camera size={18} className="mb-2 text-nestly-green" />
                <p className="text-sm font-black">Profile image</p>
                <p className="mt-1 text-sm text-nestly-muted">
                  {profile.avatar_url ? "Added" : "Not added yet"}
                </p>
              </div>

              <div className="rounded-2xl bg-nestly-soft p-4">
                <ShieldCheck size={18} className="mb-2 text-nestly-green" />
                <p className="text-sm font-black">Security</p>
                <p className="mt-1 text-sm text-nestly-muted">
                  Email login active
                </p>
              </div>
            </div>
          </div>
        </section>

        {role === "provider" && (
          <section className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <BriefcaseBusiness className="text-nestly-green" />
              <div>
                <h3 className="text-2xl font-black">Provider details</h3>
                <p className="text-sm text-nestly-muted">
                  These details control how you appear in customer search and
                  job matching.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <textarea
                value={provider.bio}
                onChange={(e) =>
                  setProvider({ ...provider, bio: e.target.value })
                }
                placeholder="Provider bio"
                className="min-h-28 rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none md:col-span-2"
              />

              <input
                value={provider.skills}
                onChange={(e) =>
                  setProvider({ ...provider, skills: e.target.value })
                }
                placeholder="Skills e.g. plumbing, cleaning, repairs"
                className="rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none md:col-span-2"
              />

              <select
                value={provider.provider_mode}
                onChange={(e) =>
                  setProvider({ ...provider, provider_mode: e.target.value })
                }
                className="rounded-2xl border border-black/10 bg-nestly-soft p-4 font-bold outline-none"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>

              <select
                value={provider.travel_radius_miles}
                onChange={(e) =>
                  setProvider({
                    ...provider,
                    travel_radius_miles: e.target.value,
                  })
                }
                className="rounded-2xl border border-black/10 bg-nestly-soft p-4 font-bold outline-none"
              >
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="40">40 miles</option>
              </select>

              <input
                value={provider.experience_years}
                onChange={(e) =>
                  setProvider({ ...provider, experience_years: e.target.value })
                }
                placeholder="Years experience"
                className="rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
              />

              <input
                value={provider.insurance_number}
                onChange={(e) =>
                  setProvider({ ...provider, insurance_number: e.target.value })
                }
                placeholder="Insurance number"
                className="rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
              />
            </div>
          </section>
        )}

        {notice && (
          <div className="rounded-2xl bg-nestly-mint p-4 text-sm font-black">
            {notice}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-nestly-ink px-6 py-4 text-sm font-black text-white disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save profile"}
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