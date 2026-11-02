import {
  BrainCircuit,
  ShieldCheck,
  Activity,
  Cpu,
  BarChart3,
  Lock,
  Target,
  Sparkles,
} from 'lucide-react'

export default function SlidingTicker() {
  const items = [
    {
      icon: Cpu,
      label: 'Supervised ML Pipeline',
      badge: 'Production-Grade',
      color: 'var(--primary)',
    },
    {
      icon: Target,
      label: '0.89 ROC-AUC Benchmark',
      badge: 'Calibrated',
      color: 'var(--accent-cyan)',
    },
    {
      icon: ShieldCheck,
      label: 'Zero Label Feedback Loops',
      badge: 'Leak-Proof',
      color: 'var(--primary-light)',
    },
    {
      icon: Activity,
      label: 'Statistical Feature Drift Detection',
      badge: '> 3.0σ Alerts',
      color: 'var(--accent-secondary)',
    },
    {
      icon: Lock,
      label: 'Tenant Isolation & Argon2id Security',
      badge: 'Strict RBAC',
      color: 'var(--primary)',
    },
    {
      icon: BrainCircuit,
      label: 'Multi-Model Registry (LR, RF, GBDT)',
      badge: 'Stratified Split',
      color: 'var(--accent-cyan)',
    },
    {
      icon: BarChart3,
      label: 'Real-Time Recharts Visualizations',
      badge: 'Interactive',
      color: 'var(--primary-light)',
    },
    {
      icon: Sparkles,
      label: 'Calibrated Posterior Probabilities (0–100%)',
      badge: '3 Risk Tiers',
      color: 'var(--accent-secondary)',
    },
  ]

  // Duplicate items for continuous seamless loop
  const tickerItems = [...items, ...items]

  return (
    <div className="sliding-ticker-wrapper" aria-label="Key platform capabilities ticker">
      <div className="ticker-fade-left" />
      <div className="sliding-ticker-track">
        {tickerItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="ticker-item">
              <span className="ticker-icon-box" style={{ color: item.color }}>
                <Icon size={16} />
              </span>
              <span className="ticker-label">{item.label}</span>
              <span className="ticker-badge">{item.badge}</span>
              <span className="ticker-divider">•</span>
            </div>
          )
        })}
      </div>
      <div className="ticker-fade-right" />
    </div>
  )
}
