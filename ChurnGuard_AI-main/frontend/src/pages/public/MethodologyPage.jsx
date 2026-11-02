import { Link } from 'react-router-dom'
import {
  GitCommit,
  CheckCircle2,
  FileCode2,
  Layers,
  Scale,
  Activity,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

export default function MethodologyPage() {
  const steps = [
    {
      step: '01',
      title: 'Dataset Ingestion & Provenance',
      desc: 'Supervised learning requires empirical, verified ground-truth labels. ChurnGuard AI bundles a standardized 2,500-sample IBM Telco Customer Churn reference dataset and accepts user CSV uploads. Files are checked for required binary target columns and validated before training.',
    },
    {
      step: '02',
      title: 'Preprocessing & Leakage Prevention',
      desc: 'Numeric features (tenure, monthly charges, support calls) and categorical dimensions (contract type) are processed using scikit-learn StandardScaler pipelines. Scalers are fit strictly on training partitions to prevent data leakage into test sets.',
    },
    {
      step: '03',
      title: 'Stratified Train / Test Partitioning',
      desc: 'Customer churn datasets frequently exhibit class imbalance (e.g., ~26% churned vs 74% retained). A stratified train/test split (default 80/20) guarantees that training and evaluation folds preserve identical positive-to-negative class proportions.',
    },
    {
      step: '04',
      title: 'Model Training & Algorithmic Options',
      desc: 'Users can train and compare three distinct algorithmic families: Linear Models (L2-penalized Logistic Regression), Bagging Ensembles (Random Forest), and Boosting Ensembles (Gradient Boosting). Models are reproducible via configured random seeds.',
    },
    {
      step: '05',
      title: 'Multi-Metric Model Evaluation',
      desc: 'Accuracy alone is misleading for imbalanced datasets. ChurnGuard AI measures Accuracy, Precision (minimizing false alarms), Recall (capturing all defectors), F1-Score, ROC-AUC (discrimination threshold curve), and full 2x2 Confusion Matrices on unseen test data.',
    },
    {
      step: '06',
      title: 'Standardized Feature Importance',
      desc: 'Standardized model weights ensure fair comparison across variables. Without scaling, variables with large units (such as monthly bills) appear artificially weak. Standardized feature importances sum to 100% and clearly highlight what drives risk.',
    },
    {
      step: '07',
      title: 'Artifact Persistence & Registry',
      desc: 'Trained model pipelines are serialized using Joblib, fingerprinted with SHA256 checksums, and accompanied by full evaluation metadata. Models can be promoted to active production or rolled back instantly.',
    },
    {
      step: '08',
      title: 'Statistical Drift Monitoring',
      desc: 'Inference traffic is checked against training baseline distributions. If incoming accounts deviate by more than 3.0 standard deviations (z-score), a data drift warning is flagged without locking the system.',
    },
  ]

  return (
    <div className="content-page">
      <div className="page-header">
        <span className="section-tag">Machine Learning Architecture</span>
        <h1>Machine Learning Methodology</h1>
        <p className="lead-text">
          A transparent, reproducible, and mathematically rigorous machine-learning framework designed for production customer churn modeling.
        </p>
      </div>

      <div className="page-body">
        {/* Step by Step Timeline */}
        <section className="methodology-timeline">
          {steps.map((s) => (
            <div key={s.step} className="timeline-item">
              <div className="timeline-marker">{s.step}</div>
              <div className="timeline-card">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Retraining Cardinal Rules */}
        <section className="content-block callout-warning-block">
          <div className="callout-icon text-warning"><AlertTriangle size={24} /></div>
          <div className="callout-body">
            <h3>Cardinal Rule: Ground Truth Retraining Only</h3>
            <p>
              Many naive churn platforms commit a fatal machine-learning flaw: retraining models on their own predictions (pseudo-labeling with biased thresholding). This produces self-reinforcing catastrophic bias where the model drifts into predicting almost 100% high-risk.
            </p>
            <p>
              <strong>ChurnGuard AI strictly forbids using predicted outputs as ground-truth labels.</strong> Model retraining is performed exclusively against verified empirical datasets or benchmark reference distributions with known historical outcomes.
            </p>
          </div>
        </section>

        <div className="page-actions">
          <Link to="/register" className="btn btn-primary">
            Try the Model
            <ArrowRight size={16} />
          </Link>
          <Link to="/faq" className="btn btn-secondary">
            Read Frequently Asked Questions
          </Link>
        </div>
      </div>
    </div>
  )
}
