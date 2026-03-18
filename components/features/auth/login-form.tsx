"use client";

import { useState } from "react";
import { User, Lock, EyeOff, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      <div className="text-center sm:text-left space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign In</h2>
        <p className="text-sm text-gray-500 font-medium">
          Welcome back to ComLab Connect.
        </p>
      </div>

      <form className="space-y-6 pt-2">
        <div className="space-y-2">
          <Label htmlFor="idNumber" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ID Number</Label>
          <div className="relative group">
            <User className="absolute left-3.5 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              id="idNumber" 
              placeholder="e.g. 2023-0001" 
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
              className="pl-11 pr-11 h-12 bg-white border-gray-200 shadow-sm rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all text-md font-mono"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm transition-colors"
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="rounded-md border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none text-gray-600 cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Forgot Password?
          </a>
        </div>

        <Button type="button" className="bg-[#1e40af] hover:bg-blue-800 text-white w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 group shadow-[0_8px_30px_rgb(30,64,175,0.2)] hover:shadow-[0_8px_30px_rgb(30,64,175,0.3)] transition-all duration-300 mt-4">
          <span>Sign In to Portal</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </div>
  );
}
