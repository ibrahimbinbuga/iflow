import { useState } from 'react';
import { LayoutGrid, Building2, User, Settings, ChevronDown, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const [isCompanyOpen, setIsCompanyOpen] = useState(true);

  return (
    <aside className="w-64 bg-background border-r border-border-main h-screen flex flex-col text-sm shrink-0 transition-colors duration-300">
      <div className="h-16 flex items-center px-6 font-bold text-lg tracking-wide text-text-main gap-2 border-b border-border-main">
        <LayoutGrid className="text-primary w-5 h-5" />
        iFlow
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        <div>
          <h3 className="text-xs font-semibold text-text-muted mb-3 px-3 tracking-wider">
            WORKSPACES
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text-main hover:bg-surface rounded-md transition-colors">
              <User className="w-4 h-4" />
              <span>Personal</span>
            </button>
            
            <div className="pt-1">
              <button 
                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-text-main bg-surface rounded-md transition-colors font-medium"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Company</span>
                </div>
                {isCompanyOpen ? (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                )}
              </button>
              
              {isCompanyOpen && (
                <div className="ml-5 mt-1 border-l border-border-main pl-2 space-y-0.5 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-text-muted hover:text-text-main hover:bg-surface rounded-md transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Mobile App</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-text-main bg-surface rounded-md transition-colors font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>Website Redesign</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 text-text-muted hover:text-text-main hover:bg-surface rounded-md transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                    <span>Brand Guidelines</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border-main">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text-main hover:bg-surface rounded-md transition-colors">
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>
    </aside>
  );
}