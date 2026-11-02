import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeSwitcher from '../common/ThemeSwitcher'
import { ShieldAlert, Menu, X, ArrowRight, User } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const navLinks = [
    { name: 'Home', path: '/', hash: '', id: 'home' },
    { name: 'Live Simulator', path: '/#simulator', hash: 'simulator', id: 'simulator' },
    { name: 'Features', path: '/#features', hash: 'features', id: 'features' },
    { name: 'Methodology', path: '/#methodology', hash: 'methodology', id: 'methodology' },
    { name: 'About', path: '/#about', hash: 'about', id: 'about' },
    { name: 'FAQ', path: '/#faq', hash: 'faq', id: 'faq' },
  ]

  // Scrollspy: detect which section is currently centered in viewport
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('')
      return
    }

    const handleScroll = () => {
      const sectionIds = ['faq', 'about', 'methodology', 'features', 'simulator', 'top']
      const scrollPosition = window.scrollY + 220

      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          if (scrollPosition >= top) {
            setActiveSection(id === 'top' ? 'home' : id)
            return
          }
        }
      }
      setActiveSection('home')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  // Close mobile menu on location change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleNavClick = (e, link) => {
    if (link.hash) {
      e.preventDefault()
      setActiveSection(link.id)
      if (location.pathname === '/') {
        const el = document.getElementById(link.hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        navigate(`/#${link.hash}`)
        setTimeout(() => {
          const el = document.getElementById(link.hash)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 120)
      }
    } else {
      setActiveSection('home')
    }
    setMobileOpen(false)
  }

  return (
    <nav className="public-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <ShieldAlert size={22} className="text-accent" />
          </div>
          <span className="brand-text">ChurnGuard <span>AI</span></span>
        </Link>

        {/* Desktop Links with Smooth Scrollspy Support */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={(e) => handleNavClick(e, link)}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Actions + Theme Switcher */}
        <div className="nav-actions">
          <ThemeSwitcher />

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              <User size={16} />
              <span>Dashboard ({user?.full_name?.split(' ')[0] || 'User'})</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer & Backdrop */}
      {mobileOpen && (
        <>
          <div 
            className="mobile-nav-backdrop" 
            onClick={() => setMobileOpen(false)}
            aria-label="Close mobile navigation overlay"
          />
          <div className="mobile-drawer">
            <div className="mobile-links">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className={`mobile-link ${activeSection === link.id ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, link)}
                >
                  <span>{link.name}</span>
                  {activeSection === link.id && <span className="active-dot" />}
                </a>
              ))}
              <div className="mobile-theme-row">
                <span className="mobile-theme-label">Theme Palette:</span>
                <ThemeSwitcher />
              </div>
              <div className="mobile-actions">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="btn btn-primary btn-block"
                    onClick={() => setMobileOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-secondary btn-block"
                      onClick={() => setMobileOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary btn-block"
                      onClick={() => setMobileOpen(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
