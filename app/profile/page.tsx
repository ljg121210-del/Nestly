"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { AppShell } from "@/components/AppShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import {
  BadgeCheck,
  Camera,
  LogOut,
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [role, setRole] = useState<Role>("customer");

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
    availability: "available",
    travel_radius_miles: "10",
    experience_years: "",
    insurance_number: "",
    verification_status: "not_started",
    rating: "0",
    jobs_completed: "0",
  });

  async function loadProfile() {
    setLoading(true);
    setNotice("");

    if (!hasSupabaseEnv) {
      setNotice("Supabase is not connected.");
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.push("/login");
      return;
    }

    const user = authData.user;

    const { data: userRow } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    const actualRole = (userRow?.role ||
      user.user_metadata?.role ||
      "customer") as Role;

    setRole(actualRole);

    setProfile({
      id: user.id,
      name: userRow?.name || user.user_metadata?.name || "",
      email: user.email || "",
      phone: userRow?.phone || user.user_metadata?.phone || "",
      location: userRow?.location || "",
      avatar_url: userRow?.avatar_url || "",
    });

    if (actualRole === "provider") {
      const { data: providerRow } = await supabase
        .from("provider_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (providerRow) {
        setProvider({
          bio: providerRow.bio || "",
          skills: Array.isArray(providerRow.skills)
            ? providerRow.skills.join(", ")
            : "",
          availability: providerRow.provider_mode || "offline",
          travel_radius_miles: String(providerRow.travel_radius_miles || "10"),
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

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice("");

    const { error: userError } = await supabase.from("users").upsert({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      avatar_url: profile.avatar_url,
      role,
    });

    if (userError) {
      setNotice(userError.message);
      setSaving(false);
      return;
    }

    if (role === "provider") {
      const skillsArray = provider.skills
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);

      const { error: providerError } = await supabase
        .from("provider_profiles")
        .upsert(
          {
            user_id: profile.id,
            phone: profile.phone,
            skills: skillsArray,
            bio: provider.bio,
            provider_mode: provider.availability,
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
        title="Manage your Nestly profile."
        subtitle="Keep your account, contact details and provider trust information up to date."
      />

      <form onSubmit={saveProfile} className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-nestly-ink text-2xl font-black text-white">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
                <h2 className="text-2xl font-black">Account details</h2>
                <p className="text-sm text-nestly-muted">
                  Basic account information used across Nestly.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-black">Full name</span>
                <input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                  placeholder="Your name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Email</span>
                <input
                  value={profile.email}
                  disabled
                  className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 text-nestly-muted outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Phone</span>
                <input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                  placeholder="Phone number"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black">Location</span>
                <input
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                  placeholder="Town or postcode"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-black">
                  Avatar image URL
                </span>
                <input
                  value={profile.avatar_url}
                  onChange={(e) =>
                    setProfile({ ...profile, avatar_url: e.target.value })
                  }
                  className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                  placeholder="Paste image URL for now"
                />
              </label>
            </div>
          </div>

          {role === "provider" && (
            <div className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black">Provider profile</h2>
                <p className="mt-2 text-sm text-nestly-muted">
                  This controls how customers see you in search, quotes and job
                  requests.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-black">Bio</span>
                  <textarea
                    value={provider.bio}
                    onChange={(e) =>
                      setProvider({ ...provider, bio: e.target.value })
                    }
                    className="min-h-28 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                    placeholder="Short provider bio"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-black">
                    Skills / services
                  </span>
                  <input
                    value={provider.skills}
                    onChange={(e) =>
                      setProvider({ ...provider, skills: e.target.value })
                    }
                    className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                    placeholder="plumbing, cleaning, repairs"
                  />
                  <p className="mt-2 text-xs text-nestly-muted">
                    Separate skills with commas.
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black">
                    Availability
                  </span>
                  <select
                    value={provider.availability}
                    onChange={(e) =>
                      setProvider({ ...provider, availability: e.target.value })
                    }
                    className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 font-bold outline-none"
                  >
                    <option value="online">Online</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black">
                    Travel radius
                  </span>
                  <select
                    value={provider.travel_radius_miles}
                    onChange={(e) =>
                      setProvider({
                        ...provider,
                        travel_radius_miles: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 font-bold outline-none"
                  >
                    <option value="5">5 miles</option>
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                    <option value="40">40 miles</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black">
                    Years experience
                  </span>
                  <input
                    value={provider.experience_years}
                    onChange={(e) =>
                      setProvider({
                        ...provider,
                        experience_years: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                    placeholder="5"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black">
                    Insurance number
                  </span>
                  <input
                    value={provider.insurance_number}
                    onChange={(e) =>
                      setProvider({
                        ...provider,
                        insurance_number: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                    placeholder="Optional for now"
                  />
                </label>
              </div>
            </div>
          )}

          {notice && (
            <div className="rounded-2xl bg-nestly-mint p-4 text-sm font-black text-nestly-ink">
              {notice}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-full bg-nestly-ink px-6 py-4 text-sm font-black text-white disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save profile"}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-nestly-ink shadow-premium"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[2rem] bg-white p-6 shadow-premium">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-nestly-mint text-nestly-green">
                <User size={22} />
              </div>
              <div>
                <h3 className="font-black">{profile.name || "Nestly user"}</h3>
                <p className="text-sm capitalize text-nestly-muted">{role}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm font-bold text-nestly-muted">
              <p>
                <Phone size={16} className="mr-2 inline" />
                {profile.phone || "No phone added"}
              </p>
              <p>
                <MapPin size={16} className="mr-2 inline" />
                {profile.location || "No location added"}
              </p>
              <p>
                <Camera size={16} className="mr-2 inline" />
                {profile.avatar_url ? "Avatar added" : "No avatar yet"}
              </p>
            </div>
          </div>

          {role === "provider" && (
            <div className="rounded-[2rem] bg-nestly-ink p-6 text-white shadow-glow">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="text-nestly-lime" />
                <h3 className="text-xl font-black">Provider trust status</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-white/60">Verification</p>
                  <p className="mt-1 font-black capitalize">
                    {provider.verification_status.replaceAll("_", " ")}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-white/60">Rating</p>
                  <p className="mt-1 font-black">
                    <Star size={15} className="mr-1 inline fill-current" />
                    {provider.rating}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-white/60">Jobs completed</p>
                  <p className="mt-1 font-black">
                    <BadgeCheck size={15} className="mr-1 inline" />
                    {provider.jobs_completed}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </form>
    </AppShell>
  );
}