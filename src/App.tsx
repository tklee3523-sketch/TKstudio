/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  Clapperboard, 
  Tv, 
  Heart, 
  Layers, 
  Play, 
  ExternalLink, 
  MessageSquare,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  updateDoc, 
  setDoc, 
  onSnapshot,
  query,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Error Handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Types
interface Project {
  id: string;
  title: string;
  category: 'journalist' | 'creative' | 'motion';
  description: string;
  thumbnail: string;
  link: string;
  tags: string[];
}

const DEFAULT_PROJECTS: Project[] = [
  // Creative & Lifestyle (대감부부)
  {
    id: 'c1',
    title: 'SEOUL NIGHT VLOG: Cinematic Walk',
    category: 'creative',
    description: '트렌디한 영상 문법을 적용한 개인 채널의 대표 콘텐츠.',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-e94e1b3f1084?auto=format&fit=crop&q=80&w=800',
    tags: ['Vlog', 'Color Grading', 'Rhythmic Edit'],
    link: 'https://www.instagram.com/biggam_couple/reels/',
  },
  {
    id: 'c2',
    title: '대감부부: Daily Review Series',
    category: 'creative',
    description: '라이프스타일 브랜드와의 협업을 통한 감각적인 리뷰 콘텐츠.',
    thumbnail: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=800',
    tags: ['Review', 'Engagement', 'Brand Collaboration'],
    link: 'https://www.youtube.com/@biggam_couple',
  },
  // Video Journalist
  {
    id: 'p1',
    title: 'Global Tech Forum 2025: Corporate Recap',
    category: 'journalist',
    description: '기업의 비전과 기술력을 전달하는 공식 스케치 영상입니다.',
    thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
    tags: ['Field Sketch', 'Interview', 'Corporate'],
    link: 'https://www.youtube.com/playlist?list=PLzblbroPB2mAHkZIfTy3tnldp6U2LHedf',
  },
  {
    id: 'p2',
    title: '제주 자연 박물관 취재 기록',
    category: 'journalist',
    description: '관공서 매체를 위한 현장 취재 및 정보 전달 영상물.',
    thumbnail: 'https://images.unsplash.com/photo-1596409058445-9856a93c72b1?auto=format&fit=crop&q=80&w=800',
    tags: ['Journalism', 'Rapid Response', 'Planning'],
    link: 'https://www.youtube.com/playlist?list=PLzblbroPB2mAHkZIfTy3tnldp6U2LHedf',
  },
  // Motion & 2D
  {
    id: 'm1',
    title: 'Health Education: Infographic Series',
    category: 'motion',
    description: '교육적 목적을 시각적으로 해결하는 2D 모션 그래픽.',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800',
    tags: ['Motion Graphics', 'Infographics', 'Post-Production'],
    link: 'https://www.youtube.com/@peter_tk_lee/videos',
  },
  {
    id: 'm2',
    title: 'Brand Identity Motion Logo',
    category: 'motion',
    description: '실사 영상의 퀄리티를 높이는 로고 애니메이션 및 타이틀 디자인.',
    thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800',
    tags: ['2D Animation', 'Design Detail', 'Visual Polish'],
    link: 'https://www.youtube.com/@peter_tk_lee/videos',
  },
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

  const ProjectCard = ({ project, onEdit }: { project: Project, onEdit?: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      <motion.div 
        layout
        onClick={onEdit ? onEdit : () => window.open(project.link, '_blank')}
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
                  {onEdit ? <Layers className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 right-4 text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit ? 'Edit Details' : 'Watch Now'} <ExternalLink className="w-3 h-3" />
          </div>
        </div>

        <div className="p-6 text-center">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {project.tags.map(tag => (
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
      
      {onEdit && (
        <button 
          onClick={onEdit}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white text-black shadow-xl hover:scale-110 transition-transform"
        >
          <Layers className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default function App() {
  const [filter, setFilter] = useState<Project['category']>('creative');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminGuide, setShowAdminGuide] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Test Connection
    useEffect(() => {
    const configInfo = `Project: ${firebaseConfig.projectId}, DB: ${firebaseConfig.firestoreDatabaseId || '(default)'}`;
    console.log('Firebase Runtime Info:', configInfo);
    
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Firebase Connection Test: SUCCESS');
      } catch (error: any) {
        if (error.message?.includes('offline')) {
          console.error("Please check your Firebase configuration (offline).");
        }
        try {
          handleFirestoreError(error, OperationType.GET, 'test/connection');
        } catch (e) {
          // Logged inside handler
        }
      }
    };
    testConnection();
  }, []);

  // Sync Projects from Firestore
  useEffect(() => {
    console.log('Starting Projects Snapshot Listener...');
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Projects Snapshot Received. Count:', snapshot.size);
      if (!snapshot.empty) {
        const fetchedProjects = snapshot.docs.map(doc => ({ ...doc.data() } as Project));
        setProjects(fetchedProjects);
      } else {
        console.log('Projects snapshot is empty, using defaults as fallback.');
        setProjects(prev => prev.length === 0 ? DEFAULT_PROJECTS : prev);
      }
      setIsLoading(false);
    }, (error: any) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      } catch (e) {
        console.error('Projects sync error:', error.message, 'Code:', error.code);
      }
      if (projects.length === 0) setProjects(DEFAULT_PROJECTS);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [projects.length]);

  // Auth State & Real-time Admin Check
  useEffect(() => {
    let unsubscribeAdmin: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthError(currentUser ? null : authError);
      
      if (unsubscribeAdmin) {
        unsubscribeAdmin();
        unsubscribeAdmin = null;
      }

      if (currentUser) {
        console.log('Auth: Logged in as', currentUser.email, `(${currentUser.uid})`);
        
        // Immediate admin check for bootstrap user
        const isBootstrapAdmin = currentUser.email?.toLowerCase() === 'tklee3523@gmail.com';
        if (isBootstrapAdmin) {
          console.log('💎 BOOTSTRAP ADMIN DETECTED:', currentUser.email);
          setIsAdmin(true);
          setShowAdminGuide(false);
        }

        // Also watch admin document in real-time
        const adminDocRef = doc(db, 'admins', currentUser.uid);
        unsubscribeAdmin = onSnapshot(adminDocRef, (docSnap) => {
          const isInAdminCollection = docSnap.exists();
          const isActuallyAdmin = isInAdminCollection || isBootstrapAdmin;
          
          console.log('🔐 Admin Check:', {
            uid: currentUser.uid,
            email: currentUser.email,
            isInCollection: isInAdminCollection,
            isBootstrap: isBootstrapAdmin,
            result: isActuallyAdmin
          });

          setIsAdmin(isActuallyAdmin);
          // If they just added themselves, hide the guide automatically
          if (isActuallyAdmin) {
            setShowAdminGuide(false);
          }
        }, (err) => {
          console.error('❌ Admin Doc Listen Error:', err.message);
          // Fallback if bootstrap
          if (isBootstrapAdmin) {
            console.log('⚠️ Rules might be blocking read, but allowing via Bootstrap fallback');
            setIsAdmin(true);
            setShowAdminGuide(false);
          } else {
            setIsAdmin(false);
          }
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeAdmin) unsubscribeAdmin();
    };
  }, [authError]);

  const handleEdit = async (id: string, updates: Partial<Project>) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'projects', id), updates as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  };

  const manualSync = async () => {
    if (!isAdmin) return;
    if (confirm('현재 작업 중인 샘플 데이터를 서버에 영구적으로 저장하시겠습니까?')) {
      try {
        for (const p of projects) {
          await setDoc(doc(db, 'projects', p.id), p);
        }
        alert('서버에 저장되었습니다!');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'projects');
      }
    }
  };

  const resetToDefaults = async () => {
    if (!isAdmin) return;
    if (confirm('정말로 모든 데이터를 기본 샘플 데이터로 초기화하시겠습니까?')) {
      try {
        for (const p of DEFAULT_PROJECTS) {
          await setDoc(doc(db, 'projects', p.id), p);
        }
        alert('초기화되었습니다.');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'projects');
      }
    }
  };

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameter to force account selection if needed
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      console.log('Login success:', result.user.email);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message);
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => signOut(auth);

  const toggleAdmin = () => {
    if (!user) {
      console.log('Login required for admin check');
      login();
    } else if (isAdmin) {
      // If they are an admin, clicking the button shouldn't show the guide.
      // We can use it to toggle editing mode off if desired.
      setEditingId(null);
      setIsAdmin(false);
      console.log('Admin mode toggled OFF manually');
    } else {
      // Check if they are actually an admin before showing guide
      const isBootstrap = user.email?.toLowerCase() === 'tklee3523@gmail.com';
      if (isBootstrap) {
        console.log('Restoring Admin mode for Bootstrap user');
        setIsAdmin(true);
      } else {
        setShowAdminGuide(true);
      }
    }
  };

  const categories = [
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
    <div className="min-h-screen Selection:bg-zinc-700">
      {/* Admin Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={toggleAdmin}
          className={`p-3 rounded-full glass border shadow-2xl transition-all ${isAdmin ? 'bg-white text-black' : 'text-white hover:border-white/40'}`}
        >
          <Layers className="w-6 h-6" />
        </button>
      </div>

      {/* Admin Guide Modal */}
      <AnimatePresence>
        {showAdminGuide && user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass p-8 rounded-3xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-display font-bold text-white">관리자 설정 안내</h2>
                <button onClick={() => setShowAdminGuide(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              
              <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-xs font-mono uppercase text-zinc-500">내 정보 & 데이터베이스 ID</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                      <code className="text-amber-400 text-xs truncate mr-4">{user.uid}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(user.uid);
                          alert('UID가 복사되었습니다.');
                        }}
                        className="shrink-0 text-[10px] font-mono bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors"
                      >
                        Copy UID
                      </button>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded border border-white/5">
                      <p className="text-[10px] text-zinc-500 mb-1">Target Database ID:</p>
                      <code className="text-[10px] text-blue-400 font-mono break-all leading-tight">
                        {firebaseConfig.firestoreDatabaseId || '(default)'}
                      </code>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500">{user.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-black shrink-0">중요</div>
                    <p className="text-amber-500 font-medium">반드시 아래 "Firebase 콘솔 바로가기" 버튼을 눌러 접속하세요. (기본 DB가 아닌 지정된 ID의 DB를 사용해야 합니다)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">1</div>
                    <p>버튼을 눌러 Firestore Database 메뉴로 이동합니다.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">2</div>
                    <p><strong>+ 컬렉션 시작</strong>을 누르고 ID를 <code className="text-white bg-zinc-800 px-1 rounded">admins</code> 로 입력하세요.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">3</div>
                    <p><strong>문서 ID</strong> 칸에 위에서 복사한 <code className="text-amber-400">UID</code>를 붙여넣으세요.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">4</div>
                    <p>필드값으로 <code className="text-white bg-zinc-800 px-1 rounded">email</code> (string) 필드를 추가하고 이메일을 입력하세요.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => window.open(`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId || '(default)'}/data`, '_blank')}
                    className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                  >
                    Firebase 콘솔 바로가기 <ExternalLink className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-zinc-500 mt-4">
                    설정 후 자동으로 관리자 모드가 활성화됩니다.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h2 className="text-2xl font-display font-bold mb-6">Edit Project</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Thumbnail URL</label>
                  <input 
                    type="text" 
                    value={editingProject.thumbnail}
                    onChange={(e) => handleEdit(editingId, { thumbnail: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Video/Content Link</label>
                  <input 
                    type="text" 
                    value={editingProject.link}
                    onChange={(e) => handleEdit(editingId, { link: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={editingProject.title}
                    onChange={(e) => handleEdit(editingId, { title: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-500 mb-2">Description</label>
                  <textarea 
                    value={editingProject.description}
                    onChange={(e) => handleEdit(editingId, { description: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 min-h-24"
                  />
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    onClick={resetToDefaults}
                    className="w-full py-3 rounded-xl glass border border-amber-500/20 text-amber-500 text-xs font-mono uppercase tracking-widest hover:bg-amber-500/10 transition-colors"
                  >
                    Reset to Default Samples
                  </button>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Done
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Reset this project to default?')) {
                        const def = DEFAULT_PROJECTS.find(p => p.id === editingId);
                        if (def) handleEdit(editingId, def);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl glass border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-zinc-900/40 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-zinc-900/30 blur-[100px]" />
      </div>

      <header className="container mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-4 mb-6">
            <Clapperboard className="w-5 h-5 text-zinc-500" />
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-500">
              Portfolio 2026 {isAdmin && '(ADMIN MODE)'}
            </span>
            {isAdmin && (
              <button 
                onClick={manualSync}
                className="text-[10px] font-mono bg-zinc-800 text-white px-3 py-1 rounded-full border border-white/10 hover:bg-zinc-700 transition-all ml-2"
              >
                Save to Server
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={resetToDefaults}
                className="text-[10px] font-mono bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all ml-2"
              >
                Reset Data
              </button>
            )}
            {authError && (
              <span className="text-[10px] font-mono text-rose-500 ml-4 animate-pulse">
                {authError}
              </span>
            )}
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8">
            <span className="text-gradient">Digital Content Creator &</span><br />
            <span className="text-white">Motion Designer.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed mx-auto">
            현장의 리얼리티를 담아내는 촬영 감각과 정보의 가독성을 높이는 2D 모션 그래픽을 결합하여, 
            시청자의 몰입을 이끄는 완성도 높은 콘텐츠를 제작합니다.
          </p>
        </motion.div>
      </header>

      <main className="container mx-auto px-6 pb-32">
        {/* Navigation / Filters */}
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

        {/* Section: Dynamic Gallery based on filter */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {filter === 'creative' && (
              <section className="mb-32">
                <SectionHeader 
                  icon={Heart}
                  title="Creative & Lifestyle"
                  subtitle="트렌디한 영상 문법과 시각적 완성도를 추구하는 개인 프로젝트. 대감부부 채널 운영 경험을
                  바탕으로 시청자의 몰입을 이끄는 감각을 보여줍니다."
                  colorClass="bg-rose-500"
                />
                <div className="flex flex-wrap justify-center gap-8">
                  {projects.filter(p => p.category === 'creative').map(project => (
                    <div key={project.id} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-sm">
                      <ProjectCard project={project} onEdit={isAdmin ? () => setEditingId(project.id) : undefined} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filter === 'journalist' && (
              <section className="mb-32">
                <SectionHeader 
                  icon={Tv}
                  title="Video Journalist"
                  subtitle="기업, 관공서, 매체가 요구하는 정확한 정보 전달력과 안정적인 촬영 역량. 현장에서의 빠른 대처와 메시지 시각화 능력을 중심으로 기록합니다."
                  colorClass="bg-blue-500"
                />
                <div className="flex flex-wrap justify-center gap-8">
                  {projects.filter(p => p.category === 'journalist').map(project => (
                    <div key={project.id} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-sm">
                      <ProjectCard project={project} onEdit={isAdmin ? () => setEditingId(project.id) : undefined} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filter === 'motion' && (
              <section className="mb-32">
                <SectionHeader 
                  icon={Zap}
                  title="Motion & 2D Production"
                  subtitle="실사 영상의 퀄리티를 디자인적으로 끌어올리는 인포그래픽 및 후반 작업 역량. 복잡한 문제를 시각적으로 해결하는 실무 전문성을 강조합니다."
                  colorClass="bg-amber-500"
                />
                <div className="flex flex-wrap justify-center gap-8">
                  {projects.filter(p => p.category === 'motion').map(project => (
                    <div key={project.id} className="w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-sm">
                      <ProjectCard project={project} onEdit={isAdmin ? () => setEditingId(project.id) : undefined} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="container mx-auto px-6 py-24 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-display font-semibold mb-6">Contact & Work</h3>
            <p className="text-zinc-500 mb-8 max-w-sm">
              새로운 프로젝트 또는 협업 제안은 언제나 환영합니다. 
              비전과 가치를 담는 영상을 함께 고민하고 제작하겠습니다.
            </p>
            <div className="space-y-4">
              <a href="mailto:tklee0717@naver.com" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors group">
                <div className="p-2 glass rounded-lg group-hover:border-white/30 transition-all">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span>tklee0717@naver.com</span>
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-end items-start md:items-end">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-4">Crafted for Professionals</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-zinc-400">Available for production in 2026</span>
            </div>
          </div>
        </div>
        <div className="mt-24 text-center">
          <p className="text-[10px] font-mono text-zinc-700 tracking-widest uppercase">
            © 2026 Video Creator Portfolio. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

