import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  BrainCircuit,
  ShieldCheck,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/analytics/overview')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Generating analytics reporting...</p>
      </div>
    )
  }

  const riskPie = [
    { name: 'Low Risk', value: data?.risk_distribution?.low_risk || 0, color: '#10B981' },
    { name: 'Medium Risk', value: data?.risk_distribution?.medium_risk || 0, color: '#F59E0B' },
    { name: 'High Risk', value: data?.risk_distribution?.high_risk || 0, color: '#EF4444' },
  ]

  const churnPie = [
    { name: 'Predicted Retained', value: data?.churn_distribution?.retained || 0, color: '#38BDF8' },
    { name: 'Predicted Churned', value: data?.churn_distribution?.churned || 0, color: '#F43F5E' },
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1>Business & Model Analytics</h1>
          <p className="subtitle">Visual distribution intelligence, behavioral risk breakdown, and predictive trends.</p>
        </div>
        <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon bg-blue"><BarChart2 size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Accounts In Base</span>
            <span className="kpi-val">{data?.total_customers ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-cyan"><PieIcon size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Predictions Executed</span>
            <span className="kpi-val">{data?.total_predictions ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-red"><AlertTriangle size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Flagged At-Risk</span>
            <span className="kpi-val text-danger">{data?.high_risk_customers ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-indigo"><TrendingUp size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Overall Mean Churn Prob</span>
            <span className="kpi-val">
              {data?.avg_churn_probability != null
                ? `${(data.avg_churn_probability * 100).toFixed(1)}%`
                : '0.0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid-2">
        {/* Risk Distribution Donut */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Risk Tier Composition</h3>
            <span className="chart-sub">Operational categorization breakdown</span>
          </div>
          <div className="chart-body" style={{ height: 260 }}>
            {riskPie.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <p>No predictions scored yet to generate risk pie.</p>
              </div>
            )}
          </div>
        </div>

        {/* Churn vs Retained Donut */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Binary Classification Split</h3>
            <span className="chart-sub">Retained (Class 0) vs Churned (Class 1)</span>
          </div>
          <div className="chart-body" style={{ height: 260 }}>
            {churnPie.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={churnPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {churnPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <p>No predictions scored yet to generate binary classification split.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trendline */}
      <div className="chart-card">
        <div className="chart-header">
          <h3>Daily Prediction Activity Trend</h3>
          <span className="chart-sub">Volume and High-Risk accounts over the last 7 days</span>
        </div>
        <div className="chart-body" style={{ height: 280 }}>
          {data?.recent_trends && data.recent_trends.some(t => t.total_predictions > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.recent_trends} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }} />
                <Legend />
                <Line type="monotone" dataKey="total_predictions" stroke="#38BDF8" strokeWidth={2} name="Total Inferences" />
                <Line type="monotone" dataKey="high_risk_count" stroke="#EF4444" strokeWidth={2} name="High Risk Accounts" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <p>No daily inference traffic recorded in the past 7 days.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
