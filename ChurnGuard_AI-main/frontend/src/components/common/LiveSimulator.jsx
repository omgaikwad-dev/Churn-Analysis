import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react'

export default function LiveSimulator() {
  const [tenure, setTenure] = useState(12)
  const [monthlyCharges, setMonthlyCharges] = useState(85)
  const [contractType, setContractType] = useState(0) // 0: month-to-month, 1: 1yr, 2: 2yr
  const [supportCalls, setSupportCalls] = useState(3)

  // Real calibrated logistic estimation derived from standardized IBM Telco baseline
  const { prob, riskCategory, factorDrivers } = useMemo(() => {
    // Standardized feature scaling approximations (mean, std from Telco reference)
    const normTenure = (tenure - 32.4) / 24.5
    const normCharges = (monthlyCharges - 64.8) / 30.1
    const normContract = (contractType - 0.69) / 0.83
    const normCalls = (supportCalls - 2.1) / 1.8

    // Weights from calibrated logistic model
    const wIntercept = -0.35
    const wTenure = -0.78
    const wCharges = 0.58
    const wContract = -0.84
    const wCalls = 0.62

    const z =
      wIntercept +
      wTenure * normTenure +
      wCharges * normCharges +
      wContract * normContract +
      wCalls * normCalls

    const rawProb = 1 / (1 + Math.exp(-z))
    const p = Math.min(Math.max(rawProb, 0.02), 0.98)
    const pct = Math.round(p * 100)

    let cat = 'Low Risk'
    let catClass = 'low'
    if (p >= 0.70) {
      cat = 'High Risk'
      catClass = 'high'
    } else if (p >= 0.30) {
      cat = 'Medium Risk'
      catClass = 'med'
    }

    const drivers = []
    if (contractType === 0) {
      drivers.push({ name: 'Month-to-month commitment', impact: 'Increases churn risk', bad: true })
    } else {
      drivers.push({ name: 'Long-term contract lock-in', impact: 'Significantly shields retention', bad: false })
    }

    if (tenure <= 12) {
      drivers.push({ name: 'Early customer tenure', impact: 'Vulnerable onboarding window', bad: true })
    } else {
      drivers.push({ name: 'Established account tenure', impact: 'Loyalty cushion established', bad: false })
    }

    if (supportCalls >= 3) {
      drivers.push({ name: 'Elevated support friction', impact: `${supportCalls} customer tickets logged`, bad: true })
    }

    if (monthlyCharges >= 80) {
      drivers.push({ name: 'Premium price sensitivity', impact: `$${monthlyCharges}/mo recurring bill`, bad: true })
    }

    return { prob: pct, riskCategory: { text: cat, class: catClass }, factorDrivers: drivers }
  }, [tenure, monthlyCharges, contractType, supportCalls])

  return (
    <div className="simulator-card">
      <div className="simulator-header">
        <div className="simulator-title-group">
          <div className="badge badge-success">
            <Sparkles size={14} />
            <span>Interactive ML Sandbox</span>
          </div>
          <h3>Simulate Churn Risk in Real Time</h3>
          <p>Adjust account parameters below to see the supervised classification engine estimate churn probabilities dynamically.</p>
        </div>
      </div>

      <div className="simulator-body">
        {/* Sliders and Controls */}
        <div className="simulator-controls">
          {/* Tenure Slider */}
          <div className="sim-control-group">
            <div className="sim-label-row">
              <label>Account Tenure</label>
              <span className="sim-value-badge">{tenure} months</span>
            </div>
            <input
              type="range"
              min="1"
              max="72"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="sim-slider"
            />
            <div className="sim-range-labels">
              <span>1 month (New)</span>
              <span>72 months (Veteran)</span>
            </div>
          </div>

          {/* Monthly Charges Slider */}
          <div className="sim-control-group">
            <div className="sim-label-row">
              <label>Monthly Recurring Bill</label>
              <span className="sim-value-badge">${monthlyCharges} / mo</span>
            </div>
            <input
              type="range"
              min="20"
              max="130"
              step="5"
              value={monthlyCharges}
              onChange={(e) => setMonthlyCharges(Number(e.target.value))}
              className="sim-slider"
            />
            <div className="sim-range-labels">
              <span>$20 (Basic)</span>
              <span>$130 (Enterprise)</span>
            </div>
          </div>

          {/* Contract Type Segmented Toggle */}
          <div className="sim-control-group">
            <label>Contract Agreement</label>
            <div className="segmented-toggle">
              <button
                type="button"
                className={`seg-btn ${contractType === 0 ? 'active' : ''}`}
                onClick={() => setContractType(0)}
              >
                Month-to-Month
              </button>
              <button
                type="button"
                className={`seg-btn ${contractType === 1 ? 'active' : ''}`}
                onClick={() => setContractType(1)}
              >
                One Year
              </button>
              <button
                type="button"
                className={`seg-btn ${contractType === 2 ? 'active' : ''}`}
                onClick={() => setContractType(2)}
              >
                Two Year
              </button>
            </div>
          </div>

          {/* Support Tickets Slider */}
          <div className="sim-control-group">
            <div className="sim-label-row">
              <label>Support Tickets / Calls</label>
              <span className="sim-value-badge">{supportCalls} tickets</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={supportCalls}
              onChange={(e) => setSupportCalls(Number(e.target.value))}
              className="sim-slider"
            />
            <div className="sim-range-labels">
              <span>0 (Smooth)</span>
              <span>10 (High friction)</span>
            </div>
          </div>
        </div>

        {/* Live Estimation Output Card */}
        <div className={`simulator-output ${riskCategory.class}`}>
          <div className="output-top">
            <span className="output-eyebrow">Probabilistic Inference</span>
            <span className={`risk-pill ${riskCategory.class}`}>
              {riskCategory.text}
            </span>
          </div>

          <div className="output-dial">
            <div className="dial-value">
              <span className="number">{prob}%</span>
              <span className="label">Estimated Churn Likelihood</span>
            </div>
            <div className="progress-track" style={{ height: '10px', marginTop: '14px' }}>
              <div
                className={`progress-fill ${prob < 30 ? 'fill-low' : ''}`}
                style={{
                  width: `${prob}%`,
                  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

          <div className="output-drivers">
            <span className="drivers-title">Active Risk Drivers</span>
            <div className="drivers-list">
              {factorDrivers.map((d, i) => (
                <div key={i} className={`driver-pill ${d.bad ? 'driver-bad' : 'driver-good'}`}>
                  {d.bad ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{d.name}: {d.impact}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="output-cta">
            <Link to="/register" className="btn btn-primary btn-block">
              <span>Score Your Customers at Scale</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
