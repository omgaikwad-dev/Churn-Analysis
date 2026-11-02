import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  Database,
  Upload,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  X,
  FileCheck,
} from 'lucide-react'

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Upload State
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Preview Modal
  const [previewData, setPreviewData] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Validation Summary Modal
  const [selectedValidation, setSelectedValidation] = useState(null)

  const fetchDatasets = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/datasets')
      setDatasets(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load datasets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDatasets()
  }, [])

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setUploadError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFile(null)
      fetchDatasets()
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handlePreview = async (id) => {
    setPreviewLoading(true)
    try {
      const { data } = await api.get(`/datasets/${id}/preview`)
      setPreviewData(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to load preview.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this dataset? Associated model runs will retain historical metadata.')) return
    try {
      await api.delete(`/datasets/${id}`)
      fetchDatasets()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete dataset.')
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1>Customer Datasets</h1>
          <p className="subtitle">Upload and inspect customer CSV datasets with automatic schema and distribution validation.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Card */}
      <div className="card upload-card">
        <div className="card-header">
          <h3>Upload Customer Dataset (CSV)</h3>
          <p className="card-desc">Max 25MB. Files are verified for missing values, duplicates, and column formats.</p>
        </div>

        {uploadError && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="upload-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
            <label htmlFor="csv-file" className="file-drop-zone">
              <Upload size={28} className="text-accent" />
              <span className="file-drop-text">
                {file ? file.name : 'Click to select or drag and drop a customer CSV file'}
              </span>
              <span className="file-drop-sub">Compatible with standard IBM Telco churn schema</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={!file || uploading}>
            {uploading ? 'Validating & Uploading...' : 'Upload & Validate Dataset'}
          </button>
        </form>
      </div>

      {/* Datasets Table */}
      <div className="table-card">
        <div className="card-header">
          <h3>Uploaded Datasets</h3>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner"></div>
            <p>Loading datasets...</p>
          </div>
        ) : datasets.length === 0 ? (
          <div className="table-empty">
            <FileSpreadsheet size={40} className="text-muted" />
            <h4>No Datasets Uploaded</h4>
            <p>Upload a CSV file above to begin training models or executing batch predictions.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Row Count</th>
                  <th>Columns</th>
                  <th>Target Column</th>
                  <th>Validation</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.display_name}</strong></td>
                    <td>{d.row_count.toLocaleString()} rows</td>
                    <td>{d.column_count} cols</td>
                    <td>{d.target_column || <span className="text-muted">None (Prediction only)</span>}</td>
                    <td>
                      <button
                        onClick={() => setSelectedValidation(d.validation_summary)}
                        className={`badge ${
                          d.validation_status === 'valid'
                            ? 'badge-success'
                            : d.validation_status === 'warning'
                            ? 'badge-warning'
                            : 'badge-danger'
                        } cursor-pointer`}
                        title="Click to view full validation summary"
                      >
                        {d.validation_status}
                      </button>
                    </td>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handlePreview(d.id)}
                          className="btn btn-ghost btn-xs text-accent"
                          title="Preview rows"
                        >
                          <Eye size={15} />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="btn btn-ghost btn-xs text-danger"
                          title="Delete dataset"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewData && (
        <div className="modal-backdrop">
          <div className="modal-card modal-wide">
            <div className="modal-header">
              <h3>Preview: {previewData.display_name}</h3>
              <button onClick={() => setPreviewData(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    {previewData.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview_rows.map((row, idx) => (
                    <tr key={idx}>
                      {previewData.columns.map((col) => (
                        <td key={col}>{String(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary Modal */}
      {selectedValidation && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Dataset Validation Report</h3>
              <button onClick={() => setSelectedValidation(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="validation-item">
                <strong>Training Readiness:</strong>{' '}
                <span className={selectedValidation.is_ready_for_training ? 'text-success' : 'text-danger'}>
                  {selectedValidation.is_ready_for_training ? 'Ready for Training' : 'Prediction Only (No Target Label)'}
                </span>
              </div>
              <div className="validation-item">
                <strong>Duplicate Rows:</strong> {selectedValidation.duplicate_rows}
              </div>
              {selectedValidation.target_distribution && (
                <div className="validation-item">
                  <strong>Target Distribution:</strong>{' '}
                  {JSON.stringify(selectedValidation.target_distribution)}
                </div>
              )}
              {selectedValidation.warnings?.length > 0 && (
                <div className="validation-item text-warning">
                  <strong>Warnings:</strong>
                  <ul>
                    {selectedValidation.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
