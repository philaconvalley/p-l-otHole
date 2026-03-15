import Image from "next/image";
import Link from "next/link";

export default function AuthPage() {
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
          <div className="absolute top-[30%] left-[40%] w-2.5 h-2.5 rounded-full bg-[#e5521e] ring-2 ring-[#e5521e]/30" />
          <div className="absolute top-[55%] left-[60%] w-2 h-2 rounded-full bg-[#f97316] ring-2 ring-[#f97316]/30" />
          <div className="absolute top-[45%] left-[25%] w-2 h-2 rounded-full bg-[#d97706] ring-2 ring-[#d97706]/30" />
          <div className="absolute top-[65%] left-[70%] w-2 h-2 rounded-full bg-[#6b7280]" />
          <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-[#4b5563]">Philadelphia, PA</p>
        </div>

        {/* Card */}
        <div className="bg-[#222] border border-[#333] rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-[#9ca3af] mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-[#9ca3af] mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          <button className="w-full py-2.5 text-sm font-semibold text-white bg-[#e5521e] rounded-lg hover:bg-[#cc4418] transition-colors">
            Create account
          </button>
          <button className="w-full py-2.5 text-sm font-medium text-[#f5f5f5] bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#888] transition-colors">
            Log in
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-xs text-[#4b5563]">or</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          <Link href="/" className="block w-full py-2.5 text-sm font-medium text-[#9ca3af] hover:text-white transition-colors text-center">
            Browse map as guest →
          </Link>
        </div>
      </div>
    </div>
  );
}
