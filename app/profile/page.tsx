"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { AppShell } from "@/components/AppShell";
import {
  Camera,
  FileImage,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

type Role = "customer" | "provider" | "admin";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    bio: "",
    avatar_url: "",
  });

  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!hasSupabaseEnv) {
        setLoading(false);
        return;
      }

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
        bio: userRow?.bio || "",
        avatar_url: userRow?.avatar_url || "",
      });

      setPreviewImage(userRow?.avatar_url || "");
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    setNotice(
      "Profile picture preview added. Proper cloud upload can be connected next with Supabase Storage."
    );
  }

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
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      role,
    });

    setNotice(error ? error.message : "Profile saved successfully.");
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <AppShell role={role}>
        <div className="mx-auto max-w-4xl py-10">
          <p className="text-sm text-nestly-muted">Loading profile...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role={role}>
      <div className="mx-auto max-w-4xl py-6">
        <form
          onSubmit={saveProfile}
          className="overflow-hidden rounded-[2.4rem] bg-white shadow-premium"
        >
          <section className="bg-nestly-ink p-6 text-white md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-nestly-lime">
                  Profile
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight">
                  {profile.name || "Your profile"}
                </h1>

                <p className="mt-2 text-sm capitalize text-white/60">
                  {role} account
                </p>
              </div>

              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 md:w-auto"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </section>

          <section className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-col items-center md:w-56">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-nestly-soft ring-4 ring-white shadow-premium"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={44} className="text-nestly-muted" />
                  )}

                  <div className="absolute inset-0 hidden place-items-center bg-black/45 text-white group-hover:grid">
                    <Camera size={26} />
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex items-center gap-2 rounded-full bg-nestly-soft px-4 py-3 text-xs font-black"
                >
                  <FileImage size={15} />
                  Change photo
                </button>

                <p className="mt-3 max-w-[180px] text-center text-xs leading-5 text-nestly-muted">
                  Take a photo or choose one from your gallery/files.
                </p>
              </div>

              <div className="flex-1 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-black">
                    Biography
                  </label>

                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    placeholder="Write a short bio. This can appear on your public profile when people search for you."
                    className="min-h-32 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 flex items-center gap-2 text-sm font-black">
                      <User size={16} />
                      Name
                    </span>
                    <input
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      placeholder="Full name"
                      className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                    />
                  </label>

                  <label>
                    <span className="mb-2 flex items-center gap-2 text-sm font-black">
                      <MapPin size={16} />
                      Location
                    </span>
                    <input
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                      placeholder="Town or postcode"
                      className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                    />
                  </label>

                  <label>
                    <span className="mb-2 flex items-center gap-2 text-sm font-black">
                      <Mail size={16} />
                      Email
                    </span>
                    <input
                      value={profile.email}
                      disabled
                      className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 text-nestly-muted outline-none"
                    />
                  </label>

                  <label>
                    <span className="mb-2 flex items-center gap-2 text-sm font-black">
                      <Phone size={16} />
                      Phone number
                    </span>
                    <input
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      placeholder="Phone number"
                      className="w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
                    />
                  </label>
                </div>

                {notice && (
                  <div className="rounded-2xl bg-nestly-mint p-4 text-sm font-black">
                    {notice}
                  </div>
                )}

                <button
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-nestly-ink px-6 py-4 text-sm font-black text-white disabled:opacity-60 md:w-auto"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </AppShell>
  );
}