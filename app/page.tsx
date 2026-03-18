"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { LoginHero } from "@/components/features/auth/login-hero";
import { User, Lock, EyeOff, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!schoolId || !password) {
      toast.error("Please enter your ID number and password.");
      return;
    }
    setLoading(true);
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 600));

    const user = login(schoolId, password);
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      // Redirect based on role
      const routes: Record<string, string> = {
        student: "/student",
        teacher: "/teacher",
        sa: "/sa",
        admin: "/admin",
      };
      router.push(routes[user.role] || "/student");
    } else {
      toast.error("Invalid credentials. Please check your ID and password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side — Hero */}
      <LoginHero />

      {/* Right Side — Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-500 font-medium">Welcome back to ComLab Connect.</p>
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ID Number</Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="idNumber"
                  placeholder="e.g. 2021-0452"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="pl-11 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all text-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Password</Label>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">Format: MMDDYYYY</span>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Birth Date (MMDDYYYY)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pl-11 pr-11 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all text-md font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none rounded-sm transition-colors"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="rounded-md border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm" />
                <label htmlFor="remember" className="text-sm font-medium leading-none text-gray-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="bg-[#1e40af] hover:bg-blue-800 text-white w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 group shadow-[0_8px_30px_rgb(30,64,175,0.2)] hover:shadow-[0_8px_30px_rgb(30,64,175,0.3)] transition-all duration-300 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Demo accounts hint */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Demo Accounts</p>
              <div className="space-y-1.5 text-[11px] font-medium text-gray-500">
                <p><span className="font-bold text-gray-700">Student:</span> 2021-0452 / 01152003</p>
                <p><span className="font-bold text-gray-700">Teacher:</span> 2015-0010 / 06101980</p>
                <p><span className="font-bold text-gray-700">SA:</span> 2020-0300 / 11202001</p>
                <p><span className="font-bold text-gray-700">Admin:</span> ADMIN-001 / 01011990</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
