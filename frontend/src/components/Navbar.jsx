import React from 'react';
import { 
  GraduationCap, 
  LogOut, 
  ShieldCheck,
  User,
  Building2
} from 'lucide-react';

export default function Navbar({ currentUser, onLogout, isServerOnline }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-blue-600 hidden xs:inline" />
            <span className="sm:hidden">Admin</span>
            <span className="hidden sm:inline">Admin Console</span>
          </span>
        );
      case 'examiner':
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide whitespace-nowrap">
            <GraduationCap className="w-3 h-3 text-indigo-600 hidden xs:inline" />
            <span className="sm:hidden">Examiner</span>
            <span className="hidden sm:inline">Paper Setter</span>
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide whitespace-nowrap">
            <User className="w-3 h-3 text-emerald-600 hidden xs:inline" />
            <span className="sm:hidden">Student</span>
            <span className="hidden sm:inline">Candidate</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <div className="h-9 w-9 sm:h-10 sm:w-auto px-1 sm:px-2 py-0.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/logo_transparent.png"
                alt="ExamMatrix Logo"
                className="h-6 sm:h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                  ExamMatrix
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded shrink-0">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate">
                Secure Academic Examination Platform
              </p>
            </div>
          </div>

          {/* Center & Right Status / User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Server Online Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs shrink-0">
              <span className={`w-2 h-2 rounded-full ${isServerOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-slate-600 text-[11px] font-medium">
                {isServerOnline ? 'Server Online' : 'Connecting'}
              </span>
            </div>

            {/* If Logged In: Role Badge, Name & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <div className="text-right hidden sm:block min-w-0">
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                    {currentUser.name}
                    {currentUser.branch && (
                      <span className="text-slate-500 font-mono text-[10px] ml-1">
                        ({currentUser.branch}-{currentUser.section})
                      </span>
                    )}
                  </div>
                </div>

                {/* Visible Role Badge on Mobile */}
                <div className="sm:hidden shrink-0">
                  {getRoleBadge(currentUser.role)}
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0"
                  title="Sign out of portal"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
