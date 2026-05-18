"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { AppShell } from "@/components/AppShell";
import { Save, LogOut, User, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

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

  useEffect(() => {
    async function loadProfile() {
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

      const userRole =
        userRow?.role || data.user.user_metadata?.role || "customer";

      setRole(userRole);

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

    loadProfile();
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

    setNotice(error ? error.message : "Profile updated successfully.");
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <AppShell role={role}>
        <div className="mx-auto max-w-5xl py-10">
          <p className="text-nestly-muted">Loading profile...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role={role}>
      <div className="mx-auto max-w-5xl space-y-6 py-6">
        <section className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-nestly-ink text-2xl font-black text-white">
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
                <h1 className="text-3xl font-black">Profile</h1>
                <p className="mt-1 text-sm capitalize text-nestly-muted">
                  {role} account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="flex items-center justify-center gap-2 rounded-full bg-nestly-soft px-5 py-3 text-sm font-black"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <User className="mb-3 text-nestly-green" />
            <p className="text-xs font-bold uppercase text-nestly-muted">Name</p>
            <p className="mt-1 font-black">{profile.name || "Not added"}</p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <Mail className="mb-3 text-nestly-green" />
            <p className="text-xs font-bold uppercase text-nestly-muted">Email</p>
            <p className="mt-1 break-all text-sm font-black">{profile.email}</p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <Phone className="mb-3 text-nestly-green" />
            <p className="text-xs font-bold uppercase text-nestly-muted">Phone</p>
            <p className="mt-1 font-black">{profile.phone || "Not added"}</p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-premium">
            <MapPin className="mb-3 text-nestly-green" />
            <p className="text-xs font-bold uppercase text-nestly-muted">Location</p>
            <p className="mt-1 font-black">{profile.location || "Not added"}</p>
          </div>
        </section>

        <form
          onSubmit={saveProfile}
          className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black">Account details</h2>
            <p className="mt-2 text-sm text-nestly-muted">
              Update your basic profile information.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-black">Full name</span>
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                placeholder="Full name"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">Email</span>
              <input
                value={profile.email}
                disabled
                className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 text-nestly-muted outline-none"
              />
            </label>

            <label>
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

            <label>
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

            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-black">Profile image URL</span>
              <input
                value={profile.avatar_url}
                onChange={(e) =>
                  setProfile({ ...profile, avatar_url: e.target.value })
                }
                className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                placeholder="Paste image URL"
              />
            </label>
          </div>

          {notice && (
            <div className="mt-5 rounded-2xl bg-nestly-mint p-4 text-sm font-black">
              {notice}
            </div>
          )}

          <button
            disabled={saving}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-nestly-ink px-6 py-4 text-sm font-black text-white disabled:opacity-60 md:w-auto"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>

        <section className="rounded-[2rem] bg-white p-6 shadow-premium md:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-nestly-mint text-nestly-green">
              <ShieldCheck />
            </div>

            <div>
              <h2 className="text-2xl font-black">Account security</h2>
              <p className="mt-2 text-sm leading-6 text-nestly-muted">
                Your account is protected through Supabase authentication.
                Email verification and password rules are managed securely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}