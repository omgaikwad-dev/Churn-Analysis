import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import {
  Settings,
  User,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, updateUserState, logout } = useAuth()

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // Password Form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // Monitoring Drift Report
  const [driftReport, setDriftReport] = useState(null)
  const [driftLoading, setDriftLoading] = useState(false)

  const fetchDriftReport = async () => {
    setDriftLoading(true)
    try {
      const { data } = await api.get('/monitoring/drift')
      setDriftReport(data)
    } catch (err) {
      console.warn('Failed to load drift report:', err)
    } finally {
      setDriftLoading(false)
    }
  }

  useEffect(() => {
    fetchDriftReport()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg('')
    try {
      const { data } = await api.patch('/auth/profile', { full_name: fullName })
      updateUserState(data)
      setProfileMsg('Profile updated successfully.')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwMsg('')

    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.')
      return
    }

    setPwLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: currentPw,
        new_password: newPw,
      })
      setPwMsg('Password changed successfully.')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Password change failed.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <h1>Account & Security Settings</h1>
          <p className="subtitle">Manage user profile, credential security, and live model drift surveillance.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3>User Profile</h3>
            <p className="card-desc">Your basic account credentials and identification.</p>
          </div>

          {profileMsg && <div className="alert alert-success">{profileMsg}</div>}

          <form onSubmit={handleUpdateProfile} className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address (read-only)</label>
              <input type="email" disabled value={user?.email || ''} />
            </div>

            <div className="form-group">
              <label>Member Since</label>
              <input
                type="text"
                disabled
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Update Name'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <h3>Change Password</h3>
            <p className="card-desc">Encrypted with modern Argon2id password hashing.</p>
          </div>

          {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
          {pwError && <div className="alert alert-error">{pwError}</div>}

          <form onSubmit={handleChangePassword} className="form-grid">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>New Password (min 8 characters)</label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Model Monitoring & Drift Surveillance Section */}
      <div className="card drift-card">
        <div className="card-header-row">
          <div>
            <h3>Production Data Drift Surveillance</h3>
            <p className="card-desc">
              Measures feature-level z-score deviations between baseline training distribution and incoming predictions.
            </p>
          </div>
          <button onClick={fetchDriftReport} className="btn btn-secondary btn-xs" disabled={driftLoading}>
            <RefreshCw size={14} />
            <span>Check Now</span>
          </button>
        </div>

        {driftReport ? (
          <div className="drift-status-body">
            <div className="drift-summary-row">
              <span className="drift-kpi">
                Status:{' '}
                <strong className={driftReport.drift_detected ? 'text-danger' : 'text-success'}>
                  {driftReport.status.toUpperCase()}
                </strong>
              </span>
              <span className="drift-kpi">
                Samples Evaluated: <strong>{driftReport.total_samples_analyzed}</strong>
              </span>
              <span className="drift-kpi">
                Threshold: <strong>{driftReport.threshold_sigma}σ</strong>
              </span>
            </div>

            <p className="drift-msg">{driftReport.message}</p>

            {driftReport.feature_details?.length > 0 && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Baseline Mean (μ)</th>
                      <th>Baseline Std (σ)</th>
                      <th>Current Window Mean</th>
                      <th>Z-Score Distance</th>
                      <th>Drift Triggered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driftReport.feature_details.map((f) => (
                      <tr key={f.feature}>
                        <td><strong>{f.feature}</strong></td>
                        <td>{f.baseline_mean}</td>
                        <td>{f.baseline_std}</td>
                        <td>{f.current_mean}</td>
                        <td>{f.z_score_distance}σ</td>
                        <td>
                          {f.drift_detected ? (
                            <span className="risk-pill high">Drifted</span>
                          ) : (
                            <span className="risk-pill low">Stable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted">Loading drift monitoring statistics...</p>
        )}
      </div>
    </div>
  )
}
