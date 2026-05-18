"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotice("");

    if (!hasSupabaseEnv) {
      setNotice("Supabase is not connected.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setNotice(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = userRow?.role || user.user_metadata?.role || "customer";

    window.location.href = role === "provider" ? "/provider" : "/customer";
  }

  return (
    <main className="min-h-screen bg-nestly-soft px-5 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl place-items-center">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-premium"
        >
          <div className="flex justify-center sm:justify-start">
            <Logo />
          </div>

          <h1 className="mt-8 text-3xl font-black">Login</h1>

          <input
            required
            type="email"
            placeholder="Email address"
            className="mt-6 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            required
            type="password"
            placeholder="Password"
            className="mt-3 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {notice && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {notice}
            </div>
          )}

          <button
            disabled={loading}
            className="mt-5 w-full rounded-full bg-nestly-ink px-5 py-4 text-sm font-black text-white disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-5 text-center text-sm text-nestly-muted">
            No account yet?{" "}
            <Link href="/signup" className="font-black text-nestly-green">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}