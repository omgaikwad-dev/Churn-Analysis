import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  BrainCircuit,
  Plus,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sliders,
  X,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react'

export default function ModelsPage() {
  const [models, setModels] = useState([])
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Train Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modelType, setModelType] = useState('Logistic Regression')
  const [selectedDatasetId, setSelectedDatasetId] = useState('')
  const [testSize, setTestSize] = useState(0.20)
  const [training, setTraining] = useState(false)
  const [trainError, setTrainError] = useState('')

  const fetchModels = async () => {
    setLoading(true)
    setError('')
    try {
      const [mRes, dRes] = await Promise.all([
        api.get('/models'),
        api.get('/datasets'),
      ])
      setModels(mRes.data)
      setDatasets(dRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load models and datasets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleTrainSubmit = async (e) => {
    e.preventDefault()
    setTraining(true)
    setTrainError('')

    try {
      await api.post('/models/train', {
        dataset_id: selectedDatasetId ? Number(selectedDatasetId) : null,
        model_type: modelType,
        test_size: Number(testSize),
        random_state: 42,
      })
      setModalOpen(false)
      fetchModels()
    } catch (err) {
      setTrainError(err.response?.data?.detail || 'Model training failed.')
    } finally {
      setTraining(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.post(`/models/${id}/approve`)
      fetchModels()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to promote model.')
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1>Machine Learning Models & Registry</h1>
          <p className="subtitle">Train, evaluate, compare algorithms, and manage active production inference models.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>Train New Model</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Model Cards / Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading model registry...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="table-empty">
            <BrainCircuit size={40} className="text-muted" />
            <h3>No Models Registered</h3>
            <p>Train your first model using the Telco benchmark or an uploaded customer CSV dataset.</p>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
              Train First Model
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Model Version</th>
                  <th>Algorithm</th>
                  <th>Test Accuracy</th>
                  <th>F1 Score</th>
                  <th>ROC-AUC</th>
                  <th>Precision / Recall</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => {
                  const metrics = m.evaluation_metrics || {}
                  return (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.model_version}</strong>
                        <span className="block-date">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-subtle">{m.model_type}</span>
                      </td>
                      <td>
                        <strong>
                          {metrics.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                        </strong>
                      </td>
                      <td>
                        {metrics.f1_score ? metrics.f1_score.toFixed(3) : 'N/A'}
                      </td>
                      <td>
                        {metrics.roc_auc ? metrics.roc_auc.toFixed(3) : 'N/A'}
                      </td>
                      <td>
                        <span className="text-muted">
                          {metrics.precision ? `${(metrics.precision * 100).toFixed(0)}%` : 'N/A'} /{' '}
                          {metrics.recall ? `${(metrics.recall * 100).toFixed(0)}%` : 'N/A'}
                        </span>
                      </td>
                      <td>
                        {m.is_active ? (
                          <span className="badge badge-success">
                            <CheckCircle size={12} /> Active Production
                          </span>
                        ) : (
                          <span className="badge badge-subtle">Archived</span>
                        )}
                      </td>
                      <td>
                        {!m.is_active && (
                          <button
                            onClick={() => handleApprove(m.id)}
                            className="btn btn-secondary btn-xs"
                            title="Promote this model as active"
                          >
                            <ShieldCheck size={14} />
                            <span>Set Active</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Train Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Train Supervised Churn Model</h3>
              <button onClick={() => setModalOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            {trainError && (
              <div className="alert alert-error">
                <AlertTriangle size={18} />
                <span>{trainError}</span>
              </div>
            )}

            <form onSubmit={handleTrainSubmit} className="modal-form">
              <div className="form-group">
                <label>Algorithm Family</label>
                <select value={modelType} onChange={(e) => setModelType(e.target.value)}>
                  <option value="Logistic Regression">Logistic Regression (L2-Regularized)</option>
                  <option value="Random Forest">Random Forest Classifier (100 Trees)</option>
                  <option value="Gradient Boosting">Gradient Boosting Classifier</option>
                </select>
                <span className="field-hint">
                  All models use standard scaling pipelines and stratified test splits.
                </span>
              </div>

              <div className="form-group">
                <label>Training Dataset</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                >
                  <option value="">Verified IBM Telco Benchmark Reference (2,500 samples)</option>
                  {datasets
                    .filter((d) => d.target_column)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.display_name} ({d.row_count} rows, target: {d.target_column})
                      </option>
                    ))}
                </select>
                <span className="field-hint">
                  Requires binary Churn ground-truth labels.
                </span>
              </div>

              <div className="form-group">
                <label>Stratified Test Split: {(testSize * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.10"
                  max="0.35"
                  step="0.05"
                  value={testSize}
                  onChange={(e) => setTestSize(Number(e.target.value))}
                />
                <span className="field-hint">
                  Held-out partition strictly reserved for evaluation metrics.
                </span>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={training}>
                  {training ? 'Training Pipeline...' : 'Start Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
