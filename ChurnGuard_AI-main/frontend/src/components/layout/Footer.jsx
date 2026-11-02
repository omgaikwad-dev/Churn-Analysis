import { Link } from 'react-router-dom'
import { ShieldAlert, Cpu, Lock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="nav-brand">
              <div className="brand-icon">
                <ShieldAlert size={20} className="text-accent" />
              </div>
              <span className="brand-text">ChurnGuard <span>AI</span></span>
            </div>
            <p className="footer-desc">
              Customer churn analysis and proactive retention intelligence platform powered by transparent, production-grade machine learning.
            </p>
            <div className="footer-badges">
              <span className="badge badge-subtle"><Cpu size={12} /> ML Pipeline v2.0</span>
              <span className="badge badge-subtle"><Lock size={12} /> Argon2 Security</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/features">Features Overview</Link></li>
              <li><Link to="/methodology">ML Methodology</Link></li>
              <li><Link to="/about">About Customer Churn</Link></li>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Workspaces</h4>
            <ul>
              <li><Link to="/login">User Login</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/dashboard">Predictor Console</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Transparency</h4>
            <p className="footer-note">
              Predictions are probabilistic statistical estimates based on supervised models. No synthetic metrics are fabricated as real customer analytics.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ChurnGuard AI Platform. All rights reserved.</p>
          <div className="footer-links">
            <span>Built with FastAPI & React</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
