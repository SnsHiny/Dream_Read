import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Home, User, History, LogOut } from 'lucide-react';
import { useStore } from '@/store';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/dream', icon: Moon, label: '解梦' },
  { path: '/history', icon: History, label: '记录' },
  { path: '/profile', icon: User, label: '画像' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50">
      <div className="glass-card md:rounded-none border-t md:border-t-0 md:border-b border-dream-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="hidden md:flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Moon className="w-8 h-8 text-purple-400" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">解梦</span>
            </Link>

            <div className="flex items-center justify-around w-full md:w-auto md:gap-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-xl transition-colors ${
                        isActive 
                          ? 'text-purple-400' 
                          : 'text-gray-400 hover:text-purple-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs md:text-sm">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full md:hidden"
                          layoutId="navIndicator"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
              
              {/* Mobile Logout (conditionally rendered if you want it in the bottom bar, but usually better in profile or header) */}
              {/* For simplicity, we add it to desktop header and maybe mobile profile page, but let's add an icon here for now if space permits or keep it desktop only */}
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                <span className="text-purple-300">{user.nickname}</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20 md:pt-20 md:pb-0">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
