import { useState, useEffect } from 'react';
import { LayoutGrid, Building2, User, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreateProjectModal from './CreateProjectModal';

export default function Sidebar() {
  const [isCompanyOpen, setIsCompanyOpen] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Projeleri veritabanından çekme
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Projeler çekilemedi:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Projelere rastgele renk atamak için ufak bir yardımcı
  const colors = ['bg-emerald-500', 'bg-primary', 'bg-pink-500', 'bg-purple-500', 'bg-orange-500'];

  return (
    <>
      <aside className="w-64 bg-background border-r border-border-main h-screen flex flex-col text-sm shrink-0 transition-colors duration-300">
        <Link to="/" className="h-16 flex items-center px-6 font-bold text-lg tracking-wide text-text-main gap-2 border-b border-border-main hover:opacity-80 transition-opacity">
          <LayoutGrid className="text-primary w-5 h-5" />
          iFlow
        </Link>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          <div>
            <h3 className="text-xs font-semibold text-text-muted mb-3 px-3 tracking-wider">
              WORKSPACES
            </h3>
            <div className="space-y-1">
              <Link to="/profile" className="w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text-main hover:bg-surface rounded-md transition-colors">
                <User className="w-4 h-4" />
                <span>Personal</span>
              </Link>
              
              <div className="pt-1">
                {/* Company Başlığı ve + Butonu */}
                <div className="flex items-center justify-between group px-1">
                  <button 
                    onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                    className="flex-1 flex items-center gap-2 px-2 py-2 text-text-main bg-surface rounded-md transition-colors font-medium"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Company</span>
                    {isCompanyOpen ? <ChevronDown className="w-4 h-4 text-text-muted ml-auto" /> : <ChevronRight className="w-4 h-4 text-text-muted ml-auto" />}
                  </button>
                  
                  {/* YENİ: Proje Ekleme Butonu */}
                  <button 
                    onClick={() => setIsProjectModalOpen(true)}
                    className="p-1.5 ml-1 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    title="Add Project"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Dinamik Proje Listesi */}
                {isCompanyOpen && (
                  <div className="ml-5 mt-1 border-l border-border-main pl-2 space-y-0.5 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    {projects.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-text-muted italic">No projects yet.</div>
                    ) : (
                      projects.map((project, index) => (
                        <Link key={project.id} to="/" className="w-full flex items-center gap-2 px-3 py-1.5 text-text-muted hover:text-text-main hover:bg-surface rounded-md transition-colors">
                          <span className={`w-1.5 h-1.5 rounded-full ${colors[index % colors.length]}`}></span>
                          <span className="truncate">{project.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSuccess={fetchProjects} 
      />
    </>
  );
}