import { LayoutGrid, Building2, User, Settings, Hash } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#121212] border-r border-[#27272A] h-screen flex flex-col text-sm">
      {/* Logo Alanı */}
      <div className="h-16 flex items-center px-6 font-bold text-lg tracking-wide text-white gap-2">
        <LayoutGrid className="text-primary w-5 h-5" />
        iFlow
      </div>

      {/* Menü İçeriği */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        
        {/* Workspaces Modülü */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted mb-3 px-3 tracking-wider">
            WORKSPACES
          </h3>
          <div className="space-y-0.5">
            {/* Personal */}
            <button className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-white hover:bg-surface rounded-md transition-colors">
              <User className="w-4 h-4" />
              <span>Personal</span>
            </button>
            
            {/* Company (Aktif/Açık Görünüm) */}
            <div className="py-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-white bg-surface rounded-md transition-colors font-medium">
                <Building2 className="w-4 h-4" />
                <span>Company</span>
              </button>
              
              {/* Alt Projeler */}
              <div className="ml-5 mt-1 border-l border-[#27272A] pl-2 space-y-0.5">
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-text-muted hover:text-white hover:bg-surface rounded-md transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Mobile App</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-text-main bg-surface/50 rounded-md transition-colors font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>Website Redesign</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-text-muted hover:text-white hover:bg-surface rounded-md transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  <span>Brand Guidelines</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Ayarlar Menüsü */}
      <div className="p-3 border-t border-[#27272A]">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-white hover:bg-surface rounded-md transition-colors">
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>
    </aside>
  );
}