import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Floating particles component
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/20 animate-float"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 10 + 8}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [settings, setSettings] = useState(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    base44.auth.getSettings().then(setSettings);
    requestAnimationFrame(() => {
      setTimeout(() => setMounted(true), 100);
    });
  }, []);

  useEffect(() => {
    if (inputRef.current && settings && mounted) {
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [settings, mounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/", { replace: true });
    } catch {
      setError("Password salah");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPassword("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Background Image — Apple Store Interior */}
      <div
        className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=2400&q=90&auto=format')`,
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        {/* Blue accent glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Floating Particles */}
      <Particles />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div
          className={`w-full max-w-[420px] transition-all duration-[1200ms] ease-out ${
            mounted
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
          } ${shake ? "animate-shake" : ""}`}
        >
          {/* Glass Card */}
          <div className="relative backdrop-blur-2xl bg-white/[0.06] border border-white/[0.12] rounded-3xl p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none" style={{ mask: 'linear-gradient(black, transparent 50%)', WebkitMask: 'linear-gradient(black, transparent 50%)' }} />

            {/* Logo */}
            <div className={`flex justify-center mb-6 transition-all duration-[1400ms] delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="w-16 h-16 rounded-2xl object-contain"
                />
              ) : (
                <div className="relative">
                  {/* 3D Apple Logo */}
                  <div className="w-20 h-20 flex items-center justify-center relative">
                    {/* Glow behind */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-blue-500/5 blur-xl" />
                    {/* Apple SVG with 3D metallic gradient */}
                    <svg
                      className="w-14 h-14 relative z-10 drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
                      viewBox="0 0 814 1000"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="apple3d" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#F5F5F7" />
                          <stop offset="30%" stopColor="#D2D2D7" />
                          <stop offset="60%" stopColor="#A1A1A6" />
                          <stop offset="100%" stopColor="#6E6E73" />
                        </linearGradient>
                        <linearGradient id="apple3dShine" x1="30%" y1="0%" x2="70%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="appleGlow">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.3-49.1 188.3-49.1 30.5.1 110.8 2.9 173.3 71.1zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
                        fill="url(#apple3d)"
                        filter="url(#appleGlow)"
                      />
                      <path
                        d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.3-49.1 188.3-49.1 30.5.1 110.8 2.9 173.3 71.1zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
                        fill="url(#apple3dShine)"
                      />
                    </svg>
                  </div>
                  {/* Reflection below logo */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/5 rounded-full blur-sm" />
                </div>
              )}
            </div>

            {/* App Name */}
            <h1 className={`text-center text-[22px] font-semibold tracking-tight text-white mb-1 transition-all duration-[1400ms] delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
              {settings.appName}
            </h1>

            {/* Subtitle */}
            <p className={`text-center text-[13px] text-white/50 mb-8 font-light tracking-wide transition-all duration-[1400ms] delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {settings.subtitle}
            </p>

            {/* Error */}
            <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-16 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
              <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <p className="text-[13px] text-red-400 text-center font-medium">{error}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={`transition-all duration-[1400ms] delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Password Input */}
              <div className="relative mb-5 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 group-focus-within:text-white/60 transition-colors">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/25 text-[15px] font-light outline-none transition-all duration-300 focus:bg-white/[0.09] focus:border-white/20 focus:shadow-[0_0_0_4px_rgba(10,132,255,0.1)]"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors duration-200"
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="relative w-full h-12 rounded-xl bg-gradient-to-b from-[#0A84FF] to-[#0070E0] text-white text-[15px] font-medium transition-all duration-200 hover:from-[#1A8FFF] hover:to-[#0080F0] active:scale-[0.98] active:from-[#006AD4] active:to-[#005BB8] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 shadow-[0_4px_16px_rgba(10,132,255,0.3)] hover:shadow-[0_6px_24px_rgba(10,132,255,0.4)]"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={`mt-6 pt-5 border-t border-white/[0.06] transition-all duration-[1400ms] delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-center text-[11px] text-white/25 font-light tracking-wide">
                Tekan Enter untuk masuk
              </p>
            </div>
          </div>

          {/* Bottom branding */}
          <div className={`mt-6 text-center transition-all duration-[1600ms] delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-[11px] text-white/20 font-light tracking-widest uppercase">
              Powered by Nagoya Digital
            </p>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          50% {
            transform: translateY(-100px) translateX(20px);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
