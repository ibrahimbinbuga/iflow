import { Search, Sun, Bell, LayoutGrid, List, Filter, ArrowUpDown, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterHighPriority: boolean;
  setFilterHighPriority: (val: boolean) => void;
  sortByPriority: boolean;
  setSortByPriority: (val: boolean) => void;
}

export default function Header({ 
  onOpenCreateModal, 
  searchQuery, 
  setSearchQuery,
  filterHighPriority,
  setFilterHighPriority,
  sortByPriority,
  setSortByPriority
}: HeaderProps) {
  return (
    <header className="flex flex-col bg-background shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#27272A]">
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or tags..."
            className="w-full bg-surface border border-[#3F3F46] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 ml-4 shrink-0">
          <button className="text-text-muted hover:text-white transition-colors p-1">
            <Sun className="w-5 h-5" />
          </button>
          <button className="text-text-muted hover:text-white transition-colors p-1 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
          </button>
          
          <div className="w-px h-6 bg-[#27272A] mx-2"></div>
          
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white">İbrahim</p>
              <p className="text-xs text-text-muted">Software Engineer</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
              IB
            </div>
          </div>
        </div>
      </div>

      <div className="h-16 flex items-center justify-between px-6 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white tracking-tight">Website Redesign</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
            Projects
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface rounded-md p-1 border border-[#27272A]">
            <button className="p-1.5 rounded bg-[#27272A] text-white shadow-sm transition-all">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded text-text-muted hover:text-white transition-all">
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-[#27272A] mx-1"></div>

          {/* YENİ: Dinamik Filter Butonu */}
          <button 
            onClick={() => setFilterHighPriority(!filterHighPriority)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all border ${
              filterHighPriority 
                ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                : 'text-text-muted hover:text-white border-[#27272A] hover:bg-surface'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{filterHighPriority ? 'High Priority' : 'Filter'}</span>
          </button>

          {/* YENİ: Dinamik Sort Butonu */}
          <button 
            onClick={() => setSortByPriority(!sortByPriority)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all border ${
              sortByPriority 
                ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                : 'text-text-muted hover:text-white border-[#27272A] hover:bg-surface'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{sortByPriority ? 'Priority Sort' : 'Sort'}</span>
          </button>

          <button 
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}