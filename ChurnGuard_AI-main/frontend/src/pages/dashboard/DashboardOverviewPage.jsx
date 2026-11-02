import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import {
  Users,
  Target,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
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
} from 'recharts'

const RISK_COLORS = {
  'Low Risk': '#10B981',
  'Medium Risk': '#F59E0B',
  'High Risk': '#EF4444',
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOverview = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/analytics/overview')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load analytics overview.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading analytics overview...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertTriangle size={18} />
        <span>{error}</span>
        <button onClick={fetchOverview} className="btn btn-ghost btn-sm">Retry</button>
      </div>
    )
  }

  const riskData = [
    { name: 'Low Risk', value: data?.risk_distribution?.low_risk || 0, color: '#10B981' },
    { name: 'Medium Risk', value: data?.risk_distribution?.medium_risk || 0, color: '#F59E0B' },
    { name: 'High Risk', value: data?.risk_distribution?.high_risk || 0, color: '#EF4444' },
  ]

  const totalScored = (data?.risk_distribution?.low_risk || 0) + 
                      (data?.risk_distribution?.medium_risk || 0) + 
                      (data?.risk_distribution?.high_risk || 0)

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="dashboard-header-row">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="subtitle">Real-time customer risk indicators, prediction activity, and model health.</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchOverview} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <Link to="/predictions" className="btn btn-primary btn-sm">
            <Target size={14} />
            <span>New Prediction</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon bg-blue"><Users size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Total Accounts</span>
            <span className="kpi-val">{data?.total_customers ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-cyan"><Target size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Predictions Generated</span>
            <span className="kpi-val">{data?.total_predictions ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-red"><AlertTriangle size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">High-Risk Accounts</span>
            <span className="kpi-val text-danger">{data?.high_risk_customers ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-indigo"><TrendingUp size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Churn Probability</span>
            <span className="kpi-val">
              {data?.avg_churn_probability != null
                ? `${(data.avg_churn_probability * 100).toFixed(1)}%`
                : '0.0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Model Status Banner */}
      <div className="banner-card">
        <div className="banner-left">
          <BrainCircuit size={24} className="text-accent" />
          <div>
            <h4>Active Inference Model: <span>{data?.active_model_version || 'Default Reference Model'}</span></h4>
            <p>
              {data?.active_model_accuracy
                ? `Evaluation Accuracy: ${(data.active_model_accuracy * 100).toFixed(1)}% on held-out test split`
                : 'Supervised pipeline loaded and ready for single or batch predictions.'}
            </p>
          </div>
        </div>
        <Link to="/models" className="btn btn-secondary btn-sm">
          <span>Manage Models</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Risk Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Risk Category Distribution</h3>
            <span className="chart-sub">Breakdown of all accounts scored</span>
          </div>
          {totalScored > 0 ? (
            <div className="chart-body" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty-state">
              <Target size={36} className="text-muted" />
              <p>No predictions scored yet.</p>
              <Link to="/predictions" className="btn btn-primary btn-sm">Run First Prediction</Link>
            </div>
          )}
        </div>

        {/* 7-Day Activity Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>7-Day Prediction Volume</h3>
            <span className="chart-sub">Daily inference volume & risk tracking</span>
          </div>
          {data?.recent_trends && data.recent_trends.some(t => t.total_predictions > 0) ? (
            <div className="chart-body" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.recent_trends} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }}
                  />
                  <Line type="monotone" dataKey="total_predictions" stroke="#38BDF8" strokeWidth={2} name="Total Inferences" />
                  <Line type="monotone" dataKey="high_risk_count" stroke="#EF4444" strokeWidth={2} name="High Risk" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty-state">
              <TrendingUp size={36} className="text-muted" />
              <p>No daily inference activity recorded in the past 7 days.</p>
              <Link to="/predictions" className="btn btn-secondary btn-sm">Predict Churn</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="quick-actions-row">
        <Link to="/predictions" className="action-tile">
          <Target size={22} className="text-cyan" />
          <div className="action-tile-text">
            <h4>Single Prediction</h4>
            <p>Score individual customer features & view importance weights.</p>
          </div>
          <ArrowRight size={16} />
        </Link>

        <Link to="/datasets" className="action-tile">
          <Database size={22} className="text-blue" />
          <div className="action-tile-text">
            <h4>Upload Customer Dataset</h4>
            <p>Upload CSV files and inspect schema validation reports.</p>
          </div>
          <ArrowRight size={16} />
        </Link>

        <Link to="/models" className="action-tile">
          <BrainCircuit size={22} className="text-indigo" />
          <div className="action-tile-text">
            <h4>Train New Model</h4>
            <p>Compare Logistic Regression, Random Forest, & Gradient Boosting.</p>
          </div>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
