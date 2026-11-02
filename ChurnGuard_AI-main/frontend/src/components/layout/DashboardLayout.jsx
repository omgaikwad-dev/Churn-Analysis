import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeSwitcher from '../common/ThemeSwitcher'
import BackgroundAnimation from '../common/BackgroundAnimation'
import PageTransition from '../common/PageTransition'
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Target,
  BarChart3,
  BrainCircuit,
  Database,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Auto-close mobile sidebar when navigating to a new route
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Predictions', path: '/predictions', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Models & Training', path: '/models', icon: BrainCircuit },
    { name: 'Datasets', path: '/datasets', icon: Database },
    { name: 'Audit History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="dashboard-root">
      <BackgroundAnimation />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="nav-brand" onClick={() => setSidebarOpen(false)}>
            <div className="brand-icon">
              <ShieldAlert size={20} className="text-accent" />
            </div>
            <span className="brand-text">ChurnGuard <span>AI</span></span>
          </Link>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.full_name || 'Active User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Navigation</span>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link secondary-link" onClick={() => setSidebarOpen(false)}>
            <ExternalLink size={16} />
            <span>Public Website</span>
          </Link>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="dashboard-main-container">
        {/* Top Header */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <span className="topbar-tag">Enterprise Churn Intelligence</span>
          </div>

          <div className="topbar-right">
            <ThemeSwitcher />
            <div className="topbar-user-badge">
              <span className="status-dot"></span>
              <span className="topbar-user-name">{user?.full_name}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm topbar-logout-btn" title="Sign Out">
              <LogOut size={15} />
              <span className="logout-btn-text">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="dashboard-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
