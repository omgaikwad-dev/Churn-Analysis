import { Link } from 'react-router-dom'
import {
  Target,
  FileSpreadsheet,
  Database,
  Sliders,
  BarChart2,
  Brain,
  Activity,
  Download,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'

export default function FeaturesPage() {
  const implementedFeatures = [
    {
      icon: Target,
      title: 'Real-Time Individual Prediction',
      desc: 'Submit customer attributes (tenure, monthly charges, contract type, support calls) to receive immediate probabilistic churn risk and standardized feature importance weights.',
      status: 'Available Now',
    },
    {
      icon: FileSpreadsheet,
      title: 'Batch Inference from CSV Datasets',
      desc: 'Upload customer files and execute high-throughput batch predictions with risk categorization across all accounts in seconds.',
      status: 'Available Now',
    },
    {
      icon: Database,
      title: 'Automated Dataset Validation & Schema Inspection',
      desc: 'Inspect uploaded CSVs with automated checks for row counts, missing values, duplicate records, inferred data types, and target distribution readiness.',
      status: 'Available Now',
    },
    {
      icon: Sliders,
      title: 'Configurable Operational Risk Tiers',
      desc: 'Transparent risk thresholds classify accounts into actionable tiers: Low Risk (<30%), Medium Risk (30%–70%), and High Risk (≥70%).',
      status: 'Available Now',
    },
    {
      icon: Brain,
      title: 'Multi-Algorithm Model Training & Registry',
      desc: 'Train Logistic Regression, Random Forest, or Gradient Boosting classifiers with stratified splits, ROC-AUC evaluation, and SHA256 checksum artifact tracking.',
      status: 'Available Now',
    },
    {
      icon: BarChart2,
      title: 'Interactive Analytics & Trend Charts',
      desc: 'Explore real-time visual distributions of customer risk tiers, predicted churn ratios, and 7-day rolling prediction activity volume powered by Recharts.',
      status: 'Available Now',
    },
    {
      icon: Activity,
      title: 'Feature-Level Data Drift Detection',
      desc: 'Monitor incoming inference traffic against reference baseline distributions using statistical z-score distances to identify emerging demographic shifts.',
      status: 'Available Now',
    },
    {
      icon: Download,
      title: 'CSV Data & Audit Exports',
      desc: 'Export prediction histories and scored customer directories as formatted CSV files for integration with external CRM or email automation tools.',
      status: 'Available Now',
    },
  ]

  const roadmapFeatures = [
    {
      icon: Clock,
      title: 'Automated Webhook & CRM Sync',
      desc: 'Direct integrations with Salesforce, HubSpot, and Stripe to trigger retention workflows automatically upon high-risk classification.',
      status: 'Planned Roadmap',
    },
    {
      icon: Clock,
      title: 'Automated Model Hyperparameter Tuning',
      desc: 'Bayesian optimization and Optuna hyperparameter sweeps across cross-validation folds during training.',
      status: 'Planned Roadmap',
    },
  ]

  return (
    <div className="content-page">
      <div className="page-header">
        <span className="section-tag">Platform Capabilities</span>
        <h1>Features & Capabilities</h1>
        <p className="lead-text">
          A comprehensive suite of tools built for customer retention modeling, batch scoring, and production ML monitoring.
        </p>
      </div>

      <div className="page-body">
        <section className="content-block">
          <div className="section-title-row">
            <h2>Active Implemented Features</h2>
            <span className="badge badge-success"><CheckCircle size={14} /> Production Ready</span>
          </div>

          <div className="grid-2">
            {implementedFeatures.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.title} className="feature-detail-card">
                  <div className="feature-card-header">
                    <div className="feature-icon bg-blue"><Icon size={20} /></div>
                    <span className="feature-status-pill implemented">{feat.status}</span>
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="content-block">
          <div className="section-title-row">
            <h2>Future Roadmap & Planned Expansions</h2>
            <span className="badge badge-subtle"><Clock size={14} /> In Planning</span>
          </div>

          <div className="grid-2">
            {roadmapFeatures.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.title} className="feature-detail-card planned-card">
                  <div className="feature-card-header">
                    <div className="feature-icon bg-muted"><Icon size={20} /></div>
                    <span className="feature-status-pill roadmap">{feat.status}</span>
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        <div className="page-actions">
          <Link to="/register" className="btn btn-primary">
            Start Using ChurnGuard AI
            <ArrowRight size={16} />
          </Link>
          <Link to="/methodology" className="btn btn-secondary">
            Inspect ML Methodology
          </Link>
        </div>
      </div>
    </div>
  )
}
