import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  History,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from 'lucide-react'

export default function HistoryPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [riskFilter, setRiskFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = async (p = page, r = riskFilter) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, page_size: 20 }
      if (r) params.risk = r
      const { data } = await api.get('/predictions', { params })
      setItems(data.items)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.total_pages)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load prediction history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(1, riskFilter)
  }, [riskFilter])

  const handleExport = async () => {
    try {
      const res = await api.get('/exports/predictions', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `churnguard_predictions_export.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to export predictions.')
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1>Prediction Audit History</h1>
          <p className="subtitle">Immutable chronological log of all inferences executed on the platform.</p>
        </div>
        <div className="header-actions">
          <button onClick={handleExport} className="btn btn-secondary btn-sm" disabled={total === 0}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Filter by Risk Tier:</label>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="">All Predictions</option>
            <option value="Low Risk">Low Risk (&lt; 30%)</option>
            <option value="Medium Risk">Medium Risk (30%–70%)</option>
            <option value="High Risk">High Risk (≥ 70%)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading history records...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="table-empty">
            <History size={40} className="text-muted" />
            <h4>No Prediction History Found</h4>
            <p>Predictions generated through single or batch scoring will be archived here.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Account Identifier</th>
                    <th>Tenure</th>
                    <th>Monthly Bill</th>
                    <th>Support Calls</th>
                    <th>Churn Probability</th>
                    <th>Risk Category</th>
                    <th>Model Version</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => {
                    const data = p.input_data || {}
                    const riskClass =
                      p.risk_category === 'High Risk'
                        ? 'risk-pill high'
                        : p.risk_category === 'Medium Risk'
                        ? 'risk-pill med'
                        : 'risk-pill low'

                    return (
                      <tr key={p.id}>
                        <td>
                          {new Date(p.prediction_timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          <strong>{p.customer_identifier || data.customer_identifier || `REC-${p.id}`}</strong>
                        </td>
                        <td>{data.tenure ?? '-'} mo</td>
                        <td>{data.monthly_charges ? `$${Number(data.monthly_charges).toFixed(2)}` : '-'}</td>
                        <td>{data.support_calls ?? '-'}</td>
                        <td>
                          <strong>{(p.churn_probability * 100).toFixed(1)}%</strong>
                        </td>
                        <td>
                          <span className={riskClass}>{p.risk_category}</span>
                        </td>
                        <td>
                          <span className="badge badge-subtle">{p.model_version}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {items.length} of {total} records (Page {page} of {totalPages})
              </span>
              <div className="pagination-actions">
                <button
                  className="btn btn-secondary btn-xs"
                  disabled={page <= 1}
                  onClick={() => fetchHistory(page - 1, riskFilter)}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn btn-secondary btn-xs"
                  disabled={page >= totalPages}
                  onClick={() => fetchHistory(page + 1, riskFilter)}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
