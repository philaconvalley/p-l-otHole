"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        // Sign up first
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error?.message || "Failed to create account");
          setIsLoading(false);
          return;
        }

        // Auto sign-in after successful signup
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Account created but failed to sign in. Please try logging in.");
          setMode("login");
          setIsLoading(false);
          return;
        }

        router.push("/");
        router.refresh();
      } else {
        // Login
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          // Handle specific error messages from auth
          if (result.error === "Account is banned") {
            setError("Your account has been suspended. Contact support for assistance.");
          } else {
            setError("Invalid email or password");
          }
          setIsLoading(false);
          return;
        }

        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image src="/logo.png" alt="P(l)otHole" width={160} height={42} className="h-10 w-auto" />
          </div>
          <p className="text-sm text-[#6b7280]">Map it. Name it. Shame it. Fix it.</p>
        </div>

        {/* Map illustration placeholder */}
        <div className="w-full h-32 bg-[#1a1a1a] map-grid rounded-xl border border-[#2a2a2a] mb-6
                        flex items-center justify-center relative overflow-hidden">
          {/* Fake markers */}
          <div className="absolute top-[30%] left-[40%] w-2.5 h-2.5 rounded-full bg-[#F99300] ring-2 ring-[#F99300]/30" />
          <div className="absolute top-[55%] left-[60%] w-2 h-2 rounded-full bg-[#f97316] ring-2 ring-[#f97316]/30" />
          <div className="absolute top-[45%] left-[25%] w-2 h-2 rounded-full bg-[#d97706] ring-2 ring-[#d97706]/30" />
          <div className="absolute top-[65%] left-[70%] w-2 h-2 rounded-full bg-[#6b7280]" />
          <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-[#4b5563]">Philadelphia, PA</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-[#222] border border-[#333] rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label htmlFor="username" className="block text-xs text-[#9ca3af] mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="roadwarrior42"
                required
                minLength={3}
                maxLength={40}
                className="w-full"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs text-[#9ca3af] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-[#9ca3af] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full"
              disabled={isLoading}
            />
            {mode === "signup" && (
              <p className="text-xs text-[#6b7280] mt-1.5">
                8+ characters with uppercase, lowercase, and number
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#F99300] rounded-lg hover:bg-[#e07e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? mode === "signup"
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>

          <button
            type="button"
            onClick={toggleMode}
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-medium text-[#f5f5f5] bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#888] transition-colors disabled:opacity-50"
          >
            {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-xs text-[#4b5563]">or</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          <Link href="/" className="block w-full py-2.5 text-sm font-medium text-[#9ca3af] hover:text-white transition-colors text-center">
            Browse map as guest →
          </Link>
        </form>
      </div>
    </div>
  );
}
