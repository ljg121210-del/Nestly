"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const [role, setRole] = useState<"customer" | "provider">("customer");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
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

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: "https://nestly.network/login",
        data: {
          name: form.name,
          phone: form.phone,
          role,
        },
      },
    });

    if (error) {
      setNotice(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("users").upsert({
        id: data.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role,
      });

      if (profileError) {
        setNotice(profileError.message);
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-nestly-soft px-5 py-10">
        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl place-items-center">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-premium">
            <div className="flex justify-center">
              <Logo />
            </div>

            <h1 className="mt-8 text-3xl font-black">Verify your email</h1>

            <p className="mt-4 text-sm leading-6 text-nestly-muted">
              We’ve sent a confirmation email to:
            </p>

            <p className="mt-4 rounded-2xl bg-nestly-soft p-4 text-sm font-black">
              {form.email}
            </p>

            <p className="mt-4 text-sm leading-6 text-nestly-muted">
              Press the confirmation link in the email, then log in to Nestly.
            </p>

            <Link
              href="/login"
              className="mt-6 block rounded-full bg-nestly-ink px-5 py-4 text-sm font-black text-white"
            >
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
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

          <h1 className="mt-8 text-3xl font-black">Create account</h1>

          <p className="mt-2 text-sm leading-6 text-nestly-muted">
            Join Nestly as a customer or trusted local provider.
          </p>

          <div className="mt-6">
            <p className="mb-3 text-sm font-black text-nestly-muted">
              I am signing up as:
            </p>

            <div className="grid w-full grid-cols-2 gap-3">
  <button
    type="button"
    onClick={() => setRole("customer")}
    className={`w-full rounded-2xl px-4 py-4 text-center font-black transition ${
      role === "customer"
        ? "bg-nestly-ink text-white"
        : "bg-nestly-soft text-nestly-ink"
    }`}
  >
    Customer
  </button>

  <button
    type="button"
    onClick={() => setRole("provider")}
    className={`w-full rounded-2xl px-4 py-4 text-center font-black transition ${
      role === "provider"
        ? "bg-nestly-ink text-white"
        : "bg-nestly-soft text-nestly-ink"
    }`}
  >
    Provider
  </button>
</div>
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`rounded-2xl p-4 text-center font-black transition ${
                  role === "customer"
                    ? "bg-nestly-ink text-white"
                    : "bg-nestly-soft text-nestly-ink"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setRole("provider")}
                className={`rounded-2xl p-4 text-center font-black transition ${
                  role === "provider"
                    ? "bg-nestly-ink text-white"
                    : "bg-nestly-soft text-nestly-ink"
                }`}
              >
                Provider
              </button>
            </div>
          </div>

          <input
            required
            placeholder="Full name"
            className="mt-5 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            required
            placeholder="Phone number"
            className="mt-3 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            required
            type="email"
            placeholder="Email address"
            className="mt-3 w-full rounded-2xl border border-black/10 bg-nestly-soft p-4 outline-none"
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

          <p className="mt-2 text-xs leading-5 text-nestly-muted">
            Use a capital letter, number and special symbol.
          </p>

          {notice && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
              {notice}
            </div>
          )}

          <button
            disabled={loading}
            className="mt-5 w-full rounded-full bg-nestly-ink px-5 py-4 text-sm font-black text-white disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-nestly-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-nestly-green">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}