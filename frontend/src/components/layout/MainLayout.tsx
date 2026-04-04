import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  DollarSign,
  ArrowLeftRight,
  FileText,
  TrendingUp,
  BarChart3,
  Menu,
  Files,
  ChevronLeft,
  Building2,
  Briefcase,
  LogOut,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuthStore, hasAccess, ROLE_CONFIG } from '../../stores/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  module: string; // for role-based filtering
}

const projectNavItems: NavItem[] = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { to: 'business-case', label: 'Caso de Negocio', icon: Briefcase, module: 'business-case' },
  { to: 'cronograma', label: 'Cronograma', icon: CalendarClock, module: 'dashboard' },
  { to: 'cash-flow', label: 'Flujo de Caja', icon: TrendingUp, module: 'cash-flow' },
  { to: 'reports', label: 'Reportes', icon: BarChart3, module: 'reports' },
  { to: 'documents', label: 'Documentos', icon: Files, module: 'documents' },
];

export default function MainLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const userRole = user?.role ?? 'viewer';
  const roleConfig = ROLE_CONFIG[userRole];

  // Filter nav items by role
  const visibleNavItems = projectNavItems.filter((item) => hasAccess(userRole, item.module));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-steel-50">
      {/* Sidebar - PC Mejia branded */}
      <aside
        className={clsx(
          'flex flex-col transition-all duration-300 border-r border-steel-200',
          'bg-gradient-to-b from-primary-900 via-primary-800 to-primary-950',
          sidebarOpen ? 'w-64' : 'w-16',
        )}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-primary-700/50">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo-pcmejia.png"
                alt="PC Mejia"
                className="h-8 w-auto brightness-0 invert"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary-300" />
                <span className="text-sm font-bold text-white">PC Mejia</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-primary-700/50 text-primary-300 hover:text-white transition"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto scrollbar-pcm">
          {/* Projects link (always visible) */}
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-all mx-2 rounded-lg',
                isActive
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <FolderTree className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Proyectos</span>}
          </NavLink>

          {/* Project-specific navigation (filtered by role) */}
          {projectId && (
            <>
              <div className="px-4 pt-4 pb-2">
                {sidebarOpen && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-400">
                    Proyecto Actual
                  </p>
                )}
              </div>
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={`/projects/${projectId}/${item.to}`}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-2.5 text-sm transition-all mx-2 rounded-lg',
                      isActive
                        ? 'bg-white/15 text-white font-medium shadow-sm backdrop-blur-sm'
                        : 'text-primary-200 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User section at bottom */}
        {sidebarOpen ? (
          <div className="border-t border-primary-700/50">
            {/* User info */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user?.full_name}</p>
                  <p className="text-[10px] text-primary-400 truncate">{roleConfig?.label}</p>
                </div>
              </div>
            </div>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-primary-300 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span>Cerrar Sesion</span>
            </button>
            <div className="px-4 py-2">
              <p className="text-[10px] text-primary-500">
                PC Mejia Ingenieria S.A. — v1.0
              </p>
            </div>
          </div>
        ) : (
          <div className="border-t border-primary-700/50 py-3 flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold">
              {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-primary-300 hover:text-white transition"
              title="Cerrar Sesion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-pcm">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-6 border-b border-steel-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary-600" />
            <h1 className="text-sm font-semibold text-steel-700">
              Gestion de Proyectos — Obra Electrica
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-steel-400 bg-steel-50 px-3 py-1.5 rounded-full border border-steel-200">
              {roleConfig?.label}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-steel-50 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </div>
                <span className="text-xs font-medium text-steel-600 hidden sm:inline">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-30 w-56 rounded-xl border border-steel-200 bg-white shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-steel-100">
                      <p className="text-xs font-semibold text-steel-800">{user?.full_name}</p>
                      <p className="text-[10px] text-steel-400">{user?.email}</p>
                      <p className="text-[10px] text-primary-600 font-medium mt-0.5">{roleConfig?.label}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Cerrar Sesion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
