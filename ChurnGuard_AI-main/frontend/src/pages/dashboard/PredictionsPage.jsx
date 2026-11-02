import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'
import {
  Target,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  BrainCircuit,
  ArrowRight,
  TrendingDown,
  Percent,
} from 'lucide-react'

export default function PredictionsPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('single')

  // Parse query params for pre-populating single form
  const query = new URLSearchParams(location.search)

  // Single Prediction Form State
  const [singleForm, setSingleForm] = useState({
    customer_id: query.get('cid') ? Number(query.get('cid')) : null,
    customer_identifier: query.get('ident') || '',
    tenure: query.get('tenure') ? Number(query.get('tenure')) : 12,
    monthly_charges: query.get('monthly') ? Number(query.get('monthly')) : 75.0,
    contract_type: query.get('contract') ? Number(query.get('contract')) : 0,
    support_calls: query.get('calls') ? Number(query.get('calls')) : 2,
  })
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleResult, setSingleResult] = useState(null)
  const [singleError, setSingleError] = useState('')

  // Batch Prediction State
  const [datasets, setDatasets] = useState([])
  const [selectedDatasetId, setSelectedDatasetId] = useState('')
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResult, setBatchResult] = useState(null)
  const [batchError, setBatchError] = useState('')

  useEffect(() => {
    // Load datasets for batch tab
    async function fetchDatasets() {
      try {
        const { data } = await api.get('/datasets')
        setDatasets(data)
        if (data.length > 0) setSelectedDatasetId(String(data[0].id))
      } catch (err) {
        console.warn('Could not load datasets:', err)
      }
    }
    fetchDatasets()
  }, [])

  const handleSingleSubmit = async (e) => {
    e.preventDefault()
    setSingleLoading(true)
    setSingleError('')
    setSingleResult(null)

    try {
      const payload = {
        tenure: Number(singleForm.tenure),
        monthly_charges: Number(singleForm.monthly_charges),
        contract_type: Number(singleForm.contract_type),
        support_calls: Number(singleForm.support_calls),
        customer_id: singleForm.customer_id,
        customer_identifier: singleForm.customer_identifier || null,
      }
      const { data } = await api.post('/predictions/single', payload)
      setSingleResult(data)
    } catch (err) {
      setSingleError(err.response?.data?.detail || 'Prediction failed. Check input values.')
    } finally {
      setSingleLoading(false)
    }
  }

  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDatasetId) return
    setBatchLoading(true)
    setBatchError('')
    setBatchResult(null)

    try {
      const { data } = await api.post('/predictions/batch', {
        dataset_id: Number(selectedDatasetId),
      })
      setBatchResult(data)
    } catch (err) {
      setBatchError(err.response?.data?.detail || 'Batch processing failed.')
    } finally {
      setBatchLoading(false)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1>Churn Predictions Engine</h1>
          <p className="subtitle">Execute real-time single customer inference or high-throughput batch scoring.</p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          <Target size={16} />
          <span>Single Customer Scoring</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          <FileSpreadsheet size={16} />
          <span>Batch Dataset Scoring</span>
        </button>
      </div>

      {/* Tab 1: Single Prediction */}
      {activeTab === 'single' && (
        <div className="grid-2 prediction-layout">
          {/* Input Form Card */}
          <div className="card">
            <div className="card-header">
              <h3>Customer Attributes</h3>
              <p className="card-desc">Enter account dimensions to run probabilistic inference.</p>
            </div>

            {singleError && (
              <div className="alert alert-error">
                <AlertTriangle size={18} />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleSingleSubmit} className="form-grid">
              <div className="form-group">
                <label>Customer Identifier (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ACCT-4091"
                  value={singleForm.customer_identifier}
                  onChange={(e) => setSingleForm({ ...singleForm, customer_identifier: e.target.value })}
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
                    value={singleForm.tenure}
                    onChange={(e) => setSingleForm({ ...singleForm, tenure: e.target.value })}
                  />
                  <span className="field-hint">Months with service (0–120)</span>
                </div>

                <div className="form-group">
                  <label>Monthly Bill ($)</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="0.01"
                    required
                    value={singleForm.monthly_charges}
                    onChange={(e) => setSingleForm({ ...singleForm, monthly_charges: e.target.value })}
                  />
                  <span className="field-hint">Current billing tier</span>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Contract Type</label>
                  <select
                    value={singleForm.contract_type}
                    onChange={(e) => setSingleForm({ ...singleForm, contract_type: Number(e.target.value) })}
                  >
                    <option value={0}>0 — Month-to-Month</option>
                    <option value={1}>1 — One Year</option>
                    <option value={2}>2 — Two Year</option>
                  </select>
                  <span className="field-hint">Binding contract commitment</span>
                </div>

                <div className="form-group">
                  <label>Support Calls</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={singleForm.support_calls}
                    onChange={(e) => setSingleForm({ ...singleForm, support_calls: e.target.value })}
                  />
                  <span className="field-hint">Customer support interactions</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={singleLoading}>
                {singleLoading ? 'Calculating Probabilities...' : 'Generate Prediction'}
                {!singleLoading && <Target size={18} />}
              </button>
            </form>
          </div>

          {/* Prediction Result Display */}
          <div className="card result-card">
            <div className="card-header">
              <h3>Inference Analysis</h3>
              <p className="card-desc">Statistical risk classification and driver breakdown.</p>
            </div>

            {singleResult ? (
              <div className="result-container">
                {/* Result Pill & Score */}
                <div
                  className={`result-banner ${
                    singleResult.risk_category === 'High Risk'
                      ? 'banner-high'
                      : singleResult.risk_category === 'Medium Risk'
                      ? 'banner-med'
                      : 'banner-low'
                  }`}
                >
                  <div className="result-status-title">
                    <h2>{singleResult.risk_category}</h2>
                    <span className="model-tag">Model: {singleResult.model_version}</span>
                  </div>

                  <div className="probability-display">
                    <span className="prob-number">
                      {(singleResult.churn_probability * 100).toFixed(1)}%
                    </span>
                    <span className="prob-label">Estimated Churn Probability</span>
                  </div>

                  <div className="risk-progress-track">
                    <div
                      className="risk-progress-fill"
                      style={{
                        width: `${singleResult.churn_probability * 100}%`,
                        backgroundColor:
                          singleResult.risk_category === 'High Risk'
                            ? '#EF4444'
                            : singleResult.risk_category === 'Medium Risk'
                            ? '#F59E0B'
                            : '#10B981',
                      }}
                    ></div>
                  </div>
                </div>

                {/* Feature Importance Breakdown */}
                {singleResult.feature_importance && (
                  <div className="importance-section">
                    <h4>Standardized Feature Impact</h4>
                    <p className="importance-desc">
                      Relative contribution of each attribute to the classification score.
                    </p>

                    <div className="importance-bars">
                      {Object.entries(singleResult.feature_importance).map(([feature, weight]) => (
                        <div key={feature} className="importance-row">
                          <div className="importance-label-row">
                            <span className="feat-name">
                              {feature.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="feat-pct">{(weight * 100).toFixed(1)}%</span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{ width: `${weight * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="result-placeholder">
                <Target size={44} className="text-muted" />
                <h4>Awaiting Input Parameters</h4>
                <p>Fill out customer dimensions on the left and click Generate Prediction.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Batch Prediction */}
      {activeTab === 'batch' && (
        <div className="batch-container">
          <div className="card">
            <div className="card-header">
              <h3>Batch Customer Scoring</h3>
              <p className="card-desc">Process an entire uploaded dataset with the active machine-learning model.</p>
            </div>

            {batchError && (
              <div className="alert alert-error">
                <AlertTriangle size={18} />
                <span>{batchError}</span>
              </div>
            )}

            {datasets.length === 0 ? (
              <div className="table-empty">
                <FileSpreadsheet size={40} className="text-muted" />
                <h4>No Datasets Uploaded Yet</h4>
                <p>Upload a customer CSV dataset first to execute batch predictions.</p>
                <a href="/datasets" className="btn btn-primary btn-sm">Go to Datasets Page</a>
              </div>
            ) : (
              <form onSubmit={handleBatchSubmit} className="batch-form">
                <div className="form-group">
                  <label>Select Target Dataset</label>
                  <select
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                  >
                    {datasets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.display_name} ({d.row_count} rows, {d.validation_status})
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={batchLoading}>
                  {batchLoading ? 'Processing Batch...' : 'Execute Batch Inference'}
                  {!batchLoading && <ArrowRight size={16} />}
                </button>
              </form>
            )}
          </div>

          {/* Batch Results */}
          {batchResult && (
            <div className="batch-results-section">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon bg-blue"><FileSpreadsheet size={20} /></div>
                  <div className="kpi-content">
                    <span className="kpi-label">Accounts Processed</span>
                    <span className="kpi-val">{batchResult.total_processed}</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-red"><AlertTriangle size={20} /></div>
                  <div className="kpi-content">
                    <span className="kpi-label">High-Risk Accounts</span>
                    <span className="kpi-val text-danger">{batchResult.high_risk_count}</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-cyan"><Percent size={20} /></div>
                  <div className="kpi-content">
                    <span className="kpi-label">Medium Risk Accounts</span>
                    <span className="kpi-val">{batchResult.medium_risk_count}</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-blue"><CheckCircle size={20} /></div>
                  <div className="kpi-content">
                    <span className="kpi-label">Low Risk Accounts</span>
                    <span className="kpi-val text-success">{batchResult.low_risk_count}</span>
                  </div>
                </div>
              </div>

              <div className="table-card">
                <div className="card-header">
                  <h3>Scored Accounts (Preview)</h3>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Tenure</th>
                        <th>Monthly Bill</th>
                        <th>Contract</th>
                        <th>Support Calls</th>
                        <th>Churn Probability</th>
                        <th>Risk Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResult.items.map((it) => (
                        <tr key={it.row_index}>
                          <td><strong>{it.customer_identifier}</strong></td>
                          <td>{it.tenure} mo</td>
                          <td>${it.monthly_charges.toFixed(2)}</td>
                          <td>{it.contract_type === 2 ? 'Two Year' : it.contract_type === 1 ? 'One Year' : 'Month-to-Month'}</td>
                          <td>{it.support_calls}</td>
                          <td>{(it.churn_probability * 100).toFixed(1)}%</td>
                          <td>
                            <span
                              className={`risk-pill ${
                                it.risk_category === 'High Risk'
                                  ? 'high'
                                  : it.risk_category === 'Medium Risk'
                                  ? 'med'
                                  : 'low'
                              }`}
                            >
                              {it.risk_category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
