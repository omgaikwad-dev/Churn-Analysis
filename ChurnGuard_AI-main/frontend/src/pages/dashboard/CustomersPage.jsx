import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import {
  Users,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Target,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add Customer Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [newCust, setNewCust] = useState({
    customer_identifier: '',
    tenure: 12,
    monthly_charges: 65,
    contract_type: 0,
    support_calls: 1,
    payment_method: 'Electronic check',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchCustomers = async (p = page, q = search, r = riskFilter) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, page_size: 15 }
      if (q) params.search = q
      if (r) params.risk = r
      const res = await api.get('/customers', { params })
      setCustomers(res.data.items)
      setTotal(res.data.total)
      setPage(res.data.page)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers(1, search, riskFilter)
  }, [riskFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchCustomers(1, search, riskFilter)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return
    try {
      await api.delete(`/customers/${id}`)
      fetchCustomers(page, search, riskFilter)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete customer.')
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/customers', {
        ...newCust,
        tenure: Number(newCust.tenure),
        monthly_charges: Number(newCust.monthly_charges),
        contract_type: Number(newCust.contract_type),
        support_calls: Number(newCust.support_calls),
      })
      setModalOpen(false)
      setNewCust({
        customer_identifier: '',
        tenure: 12,
        monthly_charges: 65,
        contract_type: 0,
        support_calls: 1,
        payment_method: 'Electronic check',
      })
      fetchCustomers(1, search, riskFilter)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create customer.')
    } finally {
      setSubmitting(false)
    }
  }

  const contractLabel = (val) => {
    if (val === 2) return 'Two Year'
    if (val === 1) return 'One Year'
    return 'Month-to-Month'
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1>Customer Directory</h1>
          <p className="subtitle">Manage accounts, inspect customer attributes, and review risk classifications.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID or payment method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>

        <div className="filter-group">
          <label>Risk Tier:</label>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="">All Tiers</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
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
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="table-empty">
            <Users size={40} className="text-muted" />
            <h3>No Customer Records Found</h3>
            <p>Add individual customer records or upload a CSV dataset to populate your directory.</p>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
              Add First Customer
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account ID</th>
                    <th>Tenure</th>
                    <th>Monthly Bill</th>
                    <th>Contract Type</th>
                    <th>Support Calls</th>
                    <th>Latest Risk Tier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const riskPillClass =
                      c.latest_predicted_risk === 'High Risk'
                        ? 'risk-pill high'
                        : c.latest_predicted_risk === 'Medium Risk'
                        ? 'risk-pill med'
                        : c.latest_predicted_risk === 'Low Risk'
                        ? 'risk-pill low'
                        : 'risk-pill neutral'

                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.customer_identifier || `CUST-${c.id}`}</strong>
                        </td>
                        <td>{c.tenure} mo</td>
                        <td>${c.monthly_charges.toFixed(2)}</td>
                        <td>{contractLabel(c.contract_type)}</td>
                        <td>{c.support_calls}</td>
                        <td>
                          <span className={riskPillClass}>
                            {c.latest_predicted_risk || 'Unscored'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link
                              to={`/predictions?tenure=${c.tenure}&monthly=${c.monthly_charges}&contract=${c.contract_type}&calls=${c.support_calls}&cid=${c.id}&ident=${encodeURIComponent(c.customer_identifier || '')}`}
                              className="btn btn-ghost btn-xs text-accent"
                              title="Predict churn for this account"
                            >
                              <Target size={14} />
                              <span>Score</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="btn btn-ghost btn-xs text-danger"
                              title="Delete customer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {customers.length} of {total} accounts (Page {page} of {totalPages})
              </span>
              <div className="pagination-actions">
                <button
                  className="btn btn-secondary btn-xs"
                  disabled={page <= 1}
                  onClick={() => fetchCustomers(page - 1, search, riskFilter)}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  className="btn btn-secondary btn-xs"
                  disabled={page >= totalPages}
                  onClick={() => fetchCustomers(page + 1, search, riskFilter)}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Customer Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add New Customer Record</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="modal-form">
              <div className="form-group">
                <label>Customer Identifier / External ID</label>
                <input
                  type="text"
                  placeholder="e.g. CUST-8021"
                  value={newCust.customer_identifier}
                  onChange={(e) => setNewCust({ ...newCust, customer_identifier: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Tenure (months)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    required
                    value={newCust.tenure}
                    onChange={(e) => setNewCust({ ...newCust, tenure: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Charges ($)</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="0.01"
                    required
                    value={newCust.monthly_charges}
                    onChange={(e) => setNewCust({ ...newCust, monthly_charges: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Contract Type</label>
                  <select
                    value={newCust.contract_type}
                    onChange={(e) => setNewCust({ ...newCust, contract_type: Number(e.target.value) })}
                  >
                    <option value={0}>Month-to-Month</option>
                    <option value={1}>One Year</option>
                    <option value={2}>Two Year</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Support Calls</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={newCust.support_calls}
                    onChange={(e) => setNewCust({ ...newCust, support_calls: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={newCust.payment_method}
                  onChange={(e) => setNewCust({ ...newCust, payment_method: e.target.value })}
                >
                  <option value="Electronic check">Electronic check</option>
                  <option value="Mailed check">Mailed check</option>
                  <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
                  <option value="Credit card (automatic)">Credit card (automatic)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
