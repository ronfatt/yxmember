"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { createClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      if (!email || !password || !confirmPassword) {
        toast.error("Please complete all fields.");
        return;
      }

      if (!/^\d{6}$/.test(password)) {
        toast.error("Password must be 6 digits.");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      toast.success("Register successful. Please login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error?.message || "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-12">
        <div className="card mx-auto max-w-lg space-y-4">
          <h1 className="font-display text-3xl">Free Register</h1>
          <p className="text-black/70">Create your member account with email and 6-digit password.</p>
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border p-3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border p-3"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <input
              className="w-full rounded-lg border p-3"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Confirm 6-digit password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          <button onClick={handleRegister} disabled={loading} className="rounded-full bg-ink px-6 py-3 text-white">
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="text-sm text-black/60">
            Already have an account?{" "}
            <Link href="/login" className="text-jade underline">
              Login
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
