"use client";

import { login } from "@/lib/api/admin/auth";
import { EyeCloseIcon, EyeIcon } from "@/app/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    global?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const response = await login(email, password);
      const token = response?.data?.token;
      const user = response?.data?.user;

      if (token) {
        localStorage.setItem("admin_token", token);
      }
      if (user) {
        localStorage.setItem("admin_user", JSON.stringify(user));
      }

      router.push("/admin");
    } catch (error: any) {
      if (error?.data) {
        const { message, errors: fieldErrors } = error.data;
        setErrors({
          global: message || "Something went wrong, please try again.",
          email: fieldErrors?.email?.[0],
          password: fieldErrors?.password?.[0],
        });
      } else {
        setErrors({
          global: error.message || "Network error, please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 sm:p-8 rounded-2xl bg-[#0F1626]/80 border border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
          Sign In to Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          Enter your executive credentials to access the admin panel
        </p>
      </div>

      {errors.global && (
        <div className="mb-6 p-4 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20 text-center font-medium">
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Email Address <span className="text-cyan-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="info@gmail.com"
            value={email}
            onChange={handleChange}
            className={`w-full h-12 px-4 rounded-xl bg-black/40 border text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${
              errors.email ? "border-red-500" : "border-white/10 hover:border-white/20"
            }`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Password <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
              className={`w-full h-12 pl-4 pr-12 rounded-xl bg-black/40 border text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${
                errors.password ? "border-red-500" : "border-white/10 hover:border-white/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5 fill-current" />
              ) : (
                <EyeCloseIcon className="w-5 h-5 fill-current" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-400/20 accent-cyan-500 cursor-pointer"
            />
            <span className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
              Remember me
            </span>
          </label>

          <Link
            href="/reset-password"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>
    </div>
  );
}
