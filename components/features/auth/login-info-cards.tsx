import { CheckCircle2, Shield } from "lucide-react";

export function LoginInfoCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 w-full max-w-md mx-auto pt-8 border-t border-gray-100">
      
      <div className="bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm transition-all text-left">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 self-start" />
          <h4 className="text-xs font-semibold text-gray-700 leading-tight">Functional Requirements</h4>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
          Secure authentication via FSUU ID. Role-based redirection to Student, Teacher, SA, or Admin dashboards.
        </p>
      </div>

      <div className="bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm transition-all text-left">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 self-start" />
          <h4 className="text-xs font-semibold text-gray-700 leading-tight">Non-Functional Requirements</h4>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
          Response time &lt; 500ms. SSL/TLS encrypted session. WCAG AA compliant contrast for accessibility.
        </p>
      </div>

    </div>
  );
}
