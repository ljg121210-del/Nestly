"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";

function SignupInner() {
  const params = useSearchParams();

  const [role, setRole] = useState<"customer" | "provider">(
    params.get("role") === "provider" ? "provider" : "customer"
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotice("");

    if (!hasSupabaseEnv) {
      setNotice("Supabase is not connected. Check your environment variables.");
      setLoading(false);
      return;
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://nestly.network";

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${appUrl}/login`,
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
      await supabase.from("users").upsert({
        id: data.user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role,
      });
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="grid min-h-screen place-items-center bg-nestly-soft px-5 py-10">
        <div className="w-full max-w-md rounded-[2.2rem] bg-white p-7 text-center shadow-premium">
          <div className="flex justify-center">
            <Logo />
          </div>

          <h1 className="mt-8 text-3xl font-black">
            Verify your email
          </h1>

          <p className="mt-3 text-sm leading-6 text-nestly-muted">
            We’ve sent a confirmation link to:
          </p>

          <p className="mt-3 rounded-2xl bg-nestly-soft p-4 text-sm font-black">
            {form.email}
          </p>

          <p className="mt-4 text-sm leading-6 text-nestly-muted">
            Open the email and press the confirmation link. After that, come back
            and log in to Nestly.
          </p>

          <Button href="/login" className="mt-6 w-full py-4">
            Go to login
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-nestly-soft px-5 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-[2.2rem] bg-white p-7 shadow-premium"
      >
        <Logo />

        <h1 className="mt-8 text-3xl font-black">
          Create your Nestly account
        </h1>

        <p className="mt-2 text-sm text-nestly-muted">
          Sign up as a customer or provider.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {(["customer", "provider"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-2xl p-4 text-left font-black capitalize ${
                role === r
                  ? "bg-nestly-ink text-white"
                  : "bg-nestly-soft text-nestly-ink"
              }`}
            >
              {r}
            </button>
          ))}
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
          placeholder="Email"
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

        <p className="mt-2 text-xs text-nestly-muted">
          Password must meet Supabase security rules. Try using a capital letter,
          number and special symbol.
        </p>

        {notice && (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {notice}
          </div>
        )}

        <Button type="submit" className="mt-5 w-full py-4">
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <p className="mt-5 text-center text-sm text-nestly-muted">
          Already have an account?{" "}
          <a href="/login" className="font-black text-nestly-green">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}