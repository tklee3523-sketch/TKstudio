import { motion, AnimatePresence } from 'motion/react';
import { 
  Clapperboard, 
  Tv, 
  Heart, 
  Layers, 
  Play, 
  ExternalLink, 
  Zap,
  Plus,
  Trash2,
  Copy,
  Check,
  Instagram,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types
interface Project {
  id: string;
  title: string;
  category: 'journalist' | 'creative' | 'motion' | 'intro';
  description: string;
  thumbnail: string;
  link: string;
  tags: string[];
}

const STORAGE_KEY = 'portfolio_projects_v6';

const DEFAULT_PROJECTS: Project[] = [
  {
    "id": "c1",
    "title": "당시 트렌드를 반영한 숏폼 리뷰 영상",
    "category": "creative",
    "description": "",
    "thumbnail": "https://i.ytimg.com/vi/kWRQzlBL9tM/oardefault.jpg?sqp=-oaymwEoCJUDENAFSFqQAgHyq4qpAxcIARUAAIhC2AEB4gEKCBgQAhgGOAFAAQ==&rs=AOn4CLBbv1394AP2XB5MAxY0gXALgcNyZg&usqp=CCk",
    "link": "https://www.instagram.com/reel/DAStm4DgFwa/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    "tags": []
  },
  {
    "id": "p1",
    "title": "협업없이 촬영/취재/편집",
    "category": "journalist",
    "description": "",
    "thumbnail": "https://i.ytimg.com/vi/-7dyDPKh2pc/hqdefault.jpg?sqp=-oaymwEmCKgBEF5IWvKriqkDGQgBFQAAiEIYAdgBAeIBCggYEAIYBjgBQAE=&rs=AOn4CLDBOYOual1PDP_hrXc6rbUGn9raMg",
    "link": "https://youtu.be/-7dyDPKh2pc?si=CG9NqKPzkK6kTLoc",
    "tags": []
  },
  {
    "id": "m1",
    "title": "현업으로 하고있는 교육영상 제작 포트폴리오",
    "category": "motion",
    "description": "",
    "thumbnail": "https://i9.ytimg.com/vi/VMWF5mPE1m4/mqdefault.jpg?sqp=CKyxh9AG-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGEEgXChlMA8=&rs=AOn4CLCqdRPr_hWLECNnnhoYvQyzfgW51w",
    "link": "https://youtu.be/VMWF5mPE1m4?si=iBzXfHuGUvR7Csq4",
    "tags": []
  },
  {
    "id": "intro-video",
    "title": "셀프 면접영상",
    "category": "intro",
    "description": "",
    "thumbnail": "https://i9.ytimg.com/vi/FmOiPcSjzSU/mqdefault.jpg?v=66d41f7a&sqp=CICvh9AG&rs=AOn4CLCvom4hXqw_b1VyO8ho6TC8isD6sw",
    "link": "https://youtu.be/FmOiPcSjzSU?si=rNjVNxKprPjUJO9x",
    "tags": []
  }
];

const SectionHeader = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  colorClass 
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  colorClass: string
}) => (
  <div className="mb-12 flex flex-col items-center text-center">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <h2 className="text-3xl font-display font-semibold tracking-tight">{title}</h2>
    </div>
    <p className="text-zinc-400 max-w-2xl leading-relaxed mx-auto">{subtitle}</p>
  </div>
);

const ProjectCard = ({ 
  project, 
  isAdmin,
  onEdit,
  onDelete
}: { 
  project: Project, 
  isAdmin: boolean,
  onEdit: () => void,
  onDelete: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      <motion.div 
        layout
        onClick={() => {
            if (isAdmin) onEdit();
            else window.open(project.link, '_blank');
        }}
        className={`relative block glass rounded-2xl overflow-hidden cursor-pointer`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={project.thumbnail} 
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
          
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
              >
                <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                  {isAdmin ? <Layers className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 right-4 text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin ? 'Edit Details' : 'Watch Now'} <ExternalLink className="w-3 h-3" />
          </div>
        </div>

        <div className="p-6 text-center">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {project.tags?.map(tag => tag && (
              <span key={tag} className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
          
          <h3 className="text-xl font-display font-medium mb-3 group-hover:text-white transition-colors">
            {project.title}
          </h3>
          
          <p className="text-sm text-zinc-400 mb-2 line-clamp-2 mx-auto max-w-xs">
            {project.description}
          </p>
        </div>
      </motion.div>

      {isAdmin && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default function App() {
  const [filter, setFilter] = useState<Project['category']>('intro');
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Load from Local Storage
  useEffect(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        setProjects(JSON.parse(local));
      } catch (e) {
        console.error('Failed to parse local projects', e);
        setProjects(DEFAULT_PROJECTS);
      }
    }
    setIsLoading(false);
  }, []);

  const saveToLocal = (newProjects: Project[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    setProjects(newProjects);
  };

  const handleEdit = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(p => p.id === id ? { ...p, ...updates } : p);
    saveToLocal(updatedProjects);
  };

  const handleAdd = () => {
    const newProject: Project = {
      id: `new-${Date.now()}`,
      title: 'New Video Project',
      category: filter,
      description: 'Project description here...',
      thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
      link: '#',
      tags: ['New', 'Edit'],
    };
    const updated = [...projects, newProject];
    saveToLocal(updated);
    setEditingId(newProject.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
      const updated = projects.filter(p => p.id !== id);
      saveToLocal(updated);
    }
  };

  const resetToDefaults = () => {
    if (confirm('정말로 모든 데이터를 기본 샘플 데이터로 초기화하시겠습니까?')) {
      saveToLocal(DEFAULT_PROJECTS);
      alert('로컬 데이터가 초기화되었습니다.');
    }
  };

  const toggleAdmin = () => {
    if (!isAdmin) {
      const pass = prompt('관리자 비밀번호를 입력하세요.');
      if (pass === 'Xorud3523!') {
        setIsAdmin(true);
      } else if (pass !== null) {
        alert('비밀번호가 틀렸습니다.');
      }
    } else {
      setIsAdmin(false);
    }
  };

  const copyToClipboard = () => {
    const code = `const DEFAULT_PROJECTS: Project[] = ${JSON.stringify(projects, null, 2)};`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert('프로젝트 데이터가 클립보드에 복사되었습니다. src/App.tsx의 DEFAULT_PROJECTS 상수에 붙여넣으세요.');
  };

  const categories = [
    { id: 'intro', label: 'Intro', icon: User },
    { id: 'creative', label: 'Creative & Lifestyle', icon: Heart },
    { id: 'journalist', label: 'Video Journalist', icon: Tv },
    { id: 'motion', label: 'Motion & 2D', icon: Zap },
  ];

  const editingProject = projects.find(p => p.id === editingId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <Clapperboard className="w-12 h-12 text-zinc-800" />
          <span className="text-[10px] font-mono tracking-[0.4em] text-zinc-600 uppercase">Loading Experience</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-zinc-700">
      {/* Admin Toggle */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-2"
          >
            <button 
              onClick={handleAdd}
              className="p-3 rounded-full bg-blue-500 text-white shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-2 group"
            >
              <Plus className="w-6 h-6" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all text-xs font-mono whitespace-nowrap">Add New Project</span>
            </button>
            <button 
              onClick={copyToClipboard}
              className="p-3 rounded-full bg-zinc-800 text-zinc-200 border border-white/10 shadow-2xl hover:bg-zinc-700 transition-all flex items-center gap-2 group"
            >
              {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all text-xs font-mono whitespace-nowrap">Copy Data for Code</span>
            </button>
          </motion.div>
        )}
        <button 
          id="admin-toggle"
          onClick={toggleAdmin}
          className={`p-3 rounded-full glass border shadow-2xl transition-all ${isAdmin ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:border-white/40'}`}
        >
          <Layers className="w-6 h-6" />
        </button>
      </div>

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {editingId && editingProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass p-8 rounded-3xl w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold">Edit Project</h2>
                <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-white text-2xl">✕</button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Category</label>
                  <select 
                    value={editingProject.category}
                    onChange={(e) => handleEdit(editingId, { category: e.target.value as any })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 text-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Thumbnail URL</label>
                  <input 
                    type="text" 
                    value={editingProject.thumbnail}
                    onChange={(e) => handleEdit(editingId, { thumbnail: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Video/Content Link</label>
                  <input 
                    type="text" 
                    value={editingProject.link}
                    onChange={(e) => handleEdit(editingId, { link: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={editingProject.title}
                    onChange={(e) => handleEdit(editingId, { title: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Description</label>
                  <textarea 
                    value={editingProject.description}
                    onChange={(e) => handleEdit(editingId, { description: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 min-h-24 text-white"
                  />
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    onClick={resetToDefaults}
                    className="w-full py-3 rounded-xl glass border border-amber-500/20 text-amber-500 text-xs font-mono uppercase tracking-widest hover:bg-amber-500/10 transition-colors"
                  >
                    Reset All to Samples
                  </button>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-zinc-900/40 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-zinc-900/30 blur-[100px]" />
      </div>

      <header className="container mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-6">
            <Clapperboard className="w-5 h-5 text-zinc-500" />
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-500">
              TK Studio {isAdmin && '(ADMIN MODE ENABLED)'}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8">
            <span className="text-gradient">Digital Content Creator &</span><br />
            <span className="text-white">Motion Designer.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed mx-auto">
            기획은 모든 것의 시작이라 생각합니다. <br />
            기획력을 바탕으로 대중에게 다가갈 수 있는 영상을 만듭니다.
          </p>
        </motion.div>
      </header>

      <main className="container mx-auto px-6 pb-32">
        <div className="flex flex-wrap items-center gap-4 mb-24 sticky top-8 z-40 p-2 glass rounded-full w-fit mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
                filter === cat.id 
                  ? 'bg-zinc-100 text-black shadow-lg scale-105' 
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {categories.filter(c => c.id === filter).map(cat => (
               <section key={cat.id} className="mb-32">
                  <SectionHeader 
                    icon={cat.icon}
                    title={cat.label}
                    subtitle={
                        cat.id === 'intro' ? '저의 이야기와 열정을 담은 자기소개 영상입니다.' :
                        cat.id === 'creative' ? '트렌드를 반영하는 개인 프로젝트.' :
                        cat.id === 'journalist' ? '3개월간 200여개의 현장영상 제작.' :
                        '교육용 영상 제작으로 다져진 모션 그래픽까지.'
                    }
                    colorClass={
                        cat.id === 'intro' ? 'bg-zinc-400' :
                        cat.id === 'creative' ? 'bg-rose-500' : 
                        cat.id === 'journalist' ? 'bg-blue-500' : 
                        'bg-amber-500'
                    }
                  />
                  <div className="flex flex-wrap justify-center gap-8">
                    {projects.filter(p => p.category === cat.id).map(project => (
                      <div 
                        key={project.id} 
                        className={`w-full ${cat.id === 'intro' ? 'md:w-full lg:w-full max-w-4xl' : 'md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.5rem)] max-w-sm'}`}
                      >
                        <ProjectCard 
                          project={project} 
                          isAdmin={isAdmin}
                          onEdit={() => setEditingId(project.id)} 
                          onDelete={() => handleDelete(project.id)}
                        />
                      </div>
                    ))}
                  </div>
               </section>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 flex flex-col items-center gap-8">
          <div className="flex items-center gap-8">
            <a 
              href="https://www.instagram.com/biggam_couple/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-all transform hover:scale-110"
            >
              <Instagram className="w-10 h-10" />
            </a>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
              © 2026 TK Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
